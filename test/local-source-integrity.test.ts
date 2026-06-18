import { mkdir, mkdtemp, readFile, rm, utimes, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { runInstallCommand } from "../src/commands/install.js";
import { runStatusCommand } from "../src/commands/status.js";
import { runValidateCommand } from "../src/commands/validate.js";
import { InstallCommandResultSchema } from "../src/diagnostics/command-result-schema.js";
import { renderCommandResultJson, renderInstallHumanOutput } from "../src/diagnostics/output.js";
import { hashPackageDirectory } from "../src/manifest/hash.js";
import { isInstallableCanonicalPackageFile } from "../src/fs/copy-tree.js";
import {
  resolveLocalSource,
  type LocalSourceResolutionResult,
} from "../src/source/local-source-resolver.js";
import { normalizeSourceSelection } from "../src/source/source-selection.js";
import { validateSourceIntegrity } from "../src/validation/rules/source-integrity.js";

const supportedRuntime = {
  nodeVersion: "v22.12.0",
  platform: "darwin",
  platformRelease: "23.0.0",
} as const;

describe("local artifact source resolver", () => {
  it("records local tarball artifact sha256 as contentHash without exposing the absolute path", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-local-tarball-"));
    const tarballPath = path.join(tempRoot, "source.tgz");
    await writeFile(tarballPath, Buffer.from("local tarball bytes"));

    try {
      const resolved = await resolveLocalSource({
        selection: selectLocalSource({
          sourceType: "local-tarball",
          sourceValue: tarballPath,
        }),
        sourceValue: tarballPath,
        targetProjectRoot: tempRoot,
      });
      const expectedHash = sha256("local tarball bytes");

      expect(resolved).toEqual({
        ok: true,
        descriptor: {
          sourceType: "local-tarball",
          resolvedRoot: "local-tarball",
          contentHash: expectedHash,
          integrityEvidence: [
            {
              kind: "content-hash",
              algorithm: "sha256",
              value: expectedHash,
              verified: false,
            },
          ],
          trustStatus: "unverified",
        },
      });
      expect(JSON.stringify(resolved)).not.toContain(tarballPath);
      expect(JSON.stringify(resolved)).not.toContain(os.homedir());
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("keeps offline bundle artifact hash separate from private staging state", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-offline-bundle-"));
    const bundlePath = path.join(tempRoot, "bundle.speclite");
    const stagingRoot = path.join(tempRoot, "cache", "extract-123");
    await writeFile(bundlePath, Buffer.from("offline bundle bytes"));

    try {
      const resolved = await resolveLocalSource({
        selection: selectLocalSource({
          sourceType: "offline-bundle",
          sourceValue: bundlePath,
        }),
        sourceValue: bundlePath,
        targetProjectRoot: tempRoot,
        privateStagingRoot: stagingRoot,
      });
      const expectedHash = sha256("offline bundle bytes");

      expect(resolved).toMatchObject({
        ok: true,
        descriptor: {
          sourceType: "offline-bundle",
          resolvedRoot: "offline-bundle",
          contentHash: expectedHash,
          integrityEvidence: [
            {
              kind: "content-hash",
              algorithm: "sha256",
              value: expectedHash,
              verified: false,
            },
          ],
          trustStatus: "unverified",
        },
      });
      expect(JSON.stringify(resolved)).not.toContain(stagingRoot);
      expect(JSON.stringify(resolved)).not.toContain("extract-123");
      expect(JSON.stringify(resolved)).not.toContain("cache");
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("blocks unreadable local artifacts with stable source-integrity issues and redacted details", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-unreadable-"));
    const missingTarball = path.join(tempRoot, "missing.tgz");
    const missingBundle = path.join(tempRoot, "missing.bundle");

    try {
      const tarball = await resolveLocalSource({
        selection: selectLocalSource({
          sourceType: "local-tarball",
          sourceValue: missingTarball,
        }),
        sourceValue: missingTarball,
        targetProjectRoot: tempRoot,
      });
      const bundle = await resolveLocalSource({
        selection: selectLocalSource({
          sourceType: "offline-bundle",
          sourceValue: missingBundle,
        }),
        sourceValue: missingBundle,
        targetProjectRoot: tempRoot,
      });

      expectBlocked(tarball, "source-integrity.tarball-unreadable");
      expectBlocked(bundle, "source-integrity.offline-bundle-unreadable");
      expect(JSON.stringify({ tarball, bundle })).not.toContain(tempRoot);
      expect(JSON.stringify({ tarball, bundle })).not.toContain("ENOENT");
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("matches Story 5.3 unreadable and artifact mismatch fixture issues", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-local-fixtures-"));
    const tarballPath = path.join(tempRoot, "source.tgz");
    await writeFile(tarballPath, Buffer.from("fixture tarball bytes"));

    try {
      const unreadable = await resolveLocalSource({
        selection: selectLocalSource({
          sourceType: "local-tarball",
          sourceValue: path.join(tempRoot, "missing.tgz"),
        }),
        sourceValue: path.join(tempRoot, "missing.tgz"),
        targetProjectRoot: tempRoot,
      });
      const bundleUnreadable = await resolveLocalSource({
        selection: selectLocalSource({
          sourceType: "offline-bundle",
          sourceValue: path.join(tempRoot, "missing.bundle"),
        }),
        sourceValue: path.join(tempRoot, "missing.bundle"),
        targetProjectRoot: tempRoot,
      });
      const mismatch = await resolveLocalSource({
        selection: selectLocalSource({
          sourceType: "local-tarball",
          sourceValue: tarballPath,
        }),
        sourceValue: tarballPath,
        targetProjectRoot: tempRoot,
        expectedHash: "sha256:not-the-artifact",
      });

      expect(firstIssue(unreadable)).toEqual(await readJsonFixture(
        "test/fixtures/source-integrity/source-unreadable-blocked/local-tarball-unreadable/expected/issue.json",
      ));
      expect(firstIssue(bundleUnreadable)).toEqual(await readJsonFixture(
        "test/fixtures/source-integrity/source-unreadable-blocked/offline-bundle-unreadable/expected/issue.json",
      ));
      expect(firstIssue(mismatch)).toEqual(await readJsonFixture(
        "test/fixtures/source-integrity/artifact-hash-mismatch-blocked/expected/issue.json",
      ));
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });
});

describe("local path source resolver", () => {
  it("matches the local-source-snapshot-unverified fixture descriptor", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-local-snapshot-fixture-"));
    const sourceValue = "test/fixtures/source-integrity/local-source-snapshot-unverified/input/source";

    try {
      const resolved = await resolveLocalSource({
        selection: selectLocalSource({
          sourceType: "local",
          sourceValue,
        }),
        sourceValue,
        targetProjectRoot: tempRoot,
        sourceBaseRoot: process.cwd(),
      });

      expect(resolved).toEqual({
        ok: true,
        descriptor: await readJsonFixture(
          "test/fixtures/source-integrity/local-source-snapshot-unverified/expected/source-descriptor.json",
        ),
      });
      expect(resolved.descriptor).toEqual(await readJsonFixture(
        "test/fixtures/source-integrity/local-source-path-redacted/expected/source-descriptor.json",
      ));
      expect(JSON.stringify(resolved)).not.toContain(path.resolve(sourceValue));
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("computes deterministic allowlist snapshot hash and ignores excluded local state", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-local-path-"));
    const sourceRoot = path.join(tempRoot, "source");
    await mkdir(path.join(sourceRoot, "core-skills", "speclite-dev-story"), { recursive: true });
    await mkdir(path.join(sourceRoot, ".git"), { recursive: true });
    await mkdir(path.join(sourceRoot, "node_modules", "ignored"), { recursive: true });
    await mkdir(path.join(sourceRoot, "dist"), { recursive: true });
    await writeFile(path.join(sourceRoot, "core-skills", "module.yaml"), "code: core\n");
    await writeFile(path.join(sourceRoot, "core-skills", "module-help.csv"), "canonicalSkillId\nspeclite-dev-story\n");
    await writeFile(path.join(sourceRoot, "core-skills", "speclite-dev-story", "SKILL.md"), "# Skill\n");
    await writeFile(path.join(sourceRoot, ".git", "HEAD"), "ignored");
    await writeFile(path.join(sourceRoot, "node_modules", "ignored", "package.json"), "ignored");
    await writeFile(path.join(sourceRoot, "dist", "bundle.js"), "ignored");

    try {
      const first = await resolveLocalSource({
        selection: selectLocalSource({
          sourceType: "local",
          sourceValue: sourceRoot,
        }),
        sourceValue: sourceRoot,
        targetProjectRoot: tempRoot,
      });
      await utimes(
        path.join(sourceRoot, "core-skills", "speclite-dev-story", "SKILL.md"),
        new Date("2030-01-01T00:00:00.000Z"),
        new Date("2030-01-01T00:00:00.000Z"),
      );
      await writeFile(path.join(sourceRoot, ".DS_Store"), "ignored");
      const second = await resolveLocalSource({
        selection: selectLocalSource({
          sourceType: "local",
          sourceValue: sourceRoot,
        }),
        sourceValue: sourceRoot,
        targetProjectRoot: tempRoot,
      });

      expect(first).toMatchObject({
        ok: true,
        descriptor: {
          sourceType: "local",
          resolvedRoot: "local-source",
          trustStatus: "unverified",
        },
      });
      expect(first).toEqual(second);
      expect(JSON.stringify(first)).not.toContain(sourceRoot);
      expect(JSON.stringify(first)).not.toContain("node_modules");
      expect(JSON.stringify(first)).not.toContain(".git");
      expect(JSON.stringify(first)).not.toContain("dist");
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("blocks local source self-reference before snapshotting target project installed or build roots", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-self-reference-"));
    const cases = [
      ["_speclite", "installed-state"],
      [".claude/skills", "execution-plane"],
      [".agents/skills", "execution-plane"],
      ["_speclite-output", "workflow-output"],
      ["test/fixtures/source-integrity/output", "workflow-output"],
      ["node_modules/speclite", "dependency"],
      [".cache/speclite", "cache"],
      ["tmp/speclite", "temporary"],
      ["dist/speclite", "build-output"],
    ] as const;

    try {
      for (const [relativePath, blockedRootKind] of cases) {
        const sourceRoot = path.join(tempRoot, relativePath);
        await mkdir(sourceRoot, { recursive: true });
        await writeFile(path.join(sourceRoot, "SKILL.md"), "# blocked\n");

        const resolved = await resolveLocalSource({
          selection: selectLocalSource({
            sourceType: "local",
            sourceValue: sourceRoot,
          }),
          sourceValue: sourceRoot,
          targetProjectRoot: tempRoot,
        });

        expect(resolved).toMatchObject({
          ok: false,
          descriptor: {
            sourceType: "local",
            resolvedRoot: "local-source",
            integrityEvidence: [],
            trustStatus: "blocked",
          },
          issues: [
            {
              issueId: "source-integrity.local-source-self-reference",
              details: {
                reason: "local-source-self-reference",
                sourceType: "local",
                blockedRootKind,
              },
            },
          ],
        });
        if (blockedRootKind === "installed-state") {
          expect(firstIssue(resolved)).toEqual(await readJsonFixture(
            "test/fixtures/source-integrity/local-source-installed-state-blocked/expected/issue.json",
          ));
        }
        expect(JSON.stringify(resolved)).not.toContain(sourceRoot);
      }
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("blocks expected hash mismatch without using verified=false as failure state", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-local-hash-mismatch-"));
    const sourceRoot = path.join(tempRoot, "source");
    await mkdir(sourceRoot, { recursive: true });
    await writeFile(path.join(sourceRoot, "SKILL.md"), "# source\n");

    try {
      const resolved = await resolveLocalSource({
        selection: selectLocalSource({
          sourceType: "local",
          sourceValue: sourceRoot,
        }),
        sourceValue: sourceRoot,
        targetProjectRoot: tempRoot,
        expectedHash: "sha256:not-the-snapshot",
      });

      expectBlocked(resolved, "source-integrity.hash-mismatch");
      expect(resolved).toMatchObject({
        ok: false,
        descriptor: {
          sourceType: "local",
          integrityEvidence: [
            {
              kind: "content-hash",
              algorithm: "sha256",
              verified: false,
            },
          ],
          trustStatus: "blocked",
        },
      });
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });
});

describe("install local source access boundary", () => {
  it("does not read local tarball before explicit source access confirmation", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-install-local-boundary-"));
    const tarballPath = path.join(tempRoot, "source.tgz");

    try {
      const outcome = await runInstallCommand({
        options: {
          json: true,
          yes: true,
          sourceType: "local-tarball",
          sourceValue: tarballPath,
        },
        runtime: { ...supportedRuntime, cwd: tempRoot },
      });
      const parsed = InstallCommandResultSchema.parse(JSON.parse(renderCommandResultJson(outcome.result)));
      const humanOutput = renderInstallHumanOutput(parsed);

      expect(parsed.status).toBe("failure");
      expect(parsed.issues[0]).toMatchObject({
        issueId: "source-integrity.unsupported-source",
        details: {
          reason: "source-access-not-confirmed",
          requestedSourceType: "local-tarball",
        },
      });
      expect(parsed.data.sourceDescriptor).toMatchObject({
        sourceType: "local-tarball",
        resolvedRoot: "local-tarball",
        trustStatus: "blocked",
      });
      await expect(readFile(tarballPath)).rejects.toMatchObject({ code: "ENOENT" });
      expect(renderCommandResultJson(parsed)).not.toContain(tempRoot);
      expect(humanOutput).not.toContain(tempRoot);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("installs confirmed local canonical source tree from local root without leaking the private root", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-install-local-source-"));
    const targetRoot = path.join(tempRoot, "target");
    const sourceRoot = path.join(tempRoot, "source");
    const marker = "LOCAL_SOURCE_MARKER_5_3";
    await mkdir(targetRoot, { recursive: true });
    await writeLocalCanonicalSource(sourceRoot, marker);

    try {
      const outcome = await runInstallCommand({
        options: {
          json: true,
          yes: true,
          sourceType: "local",
          sourceValue: sourceRoot,
        },
        runtime: { ...supportedRuntime, cwd: targetRoot },
        confirmSourceAccess: async () => undefined,
      });
      const parsed = InstallCommandResultSchema.parse(JSON.parse(renderCommandResultJson(outcome.result)));
      const installedSkillPath = path.join(
        targetRoot,
        ".claude/skills/speclite-local-marker/SKILL.md",
      );
      const filesIndex = JSON.parse(
        await readFile(path.join(targetRoot, "_speclite/_config/files-index.json"), "utf8"),
      ) as { entries: Array<{ path: string; hash: string; sourceRef: string }> };
      const skillIndex = JSON.parse(
        await readFile(path.join(targetRoot, "_speclite/_config/skill-index.json"), "utf8"),
      ) as {
        entries: Array<{
          canonicalSkillId: string;
          sourcePackagePath: string;
          canonicalPackageHash: string;
        }>;
      };
      const sourcePackageRoot = path.join(sourceRoot, "core-skills/speclite-local-marker");
      const expectedPackageHash = await hashPackageDirectory(sourcePackageRoot, {
        include: isInstallableCanonicalPackageFile,
      });

      expect(parsed.status).toBe("success");
      expect(parsed.data.paths.projectRoot).toBe(".");
      expect(parsed.data.sourceDescriptor).toMatchObject({
        sourceType: "local",
        resolvedRoot: "local-source",
        trustStatus: "unverified",
      });
      await expect(readFile(installedSkillPath, "utf8")).resolves.toContain(marker);
      expect(parsed.data.installedModules).toEqual(["core"]);

      const markerSkillEntry = skillIndex.entries.find(
        (entry) => entry.canonicalSkillId === "speclite-local-marker",
      );
      expect(markerSkillEntry).toEqual({
        schemaVersion: "speclite.skill-index.v1",
        canonicalSkillId: "speclite-local-marker",
        moduleId: "core",
        sourcePackagePath: "local-source/core-skills/speclite-local-marker",
        canonicalPackageHash: expectedPackageHash,
        installedTargets: ["claude", "agents"],
        phaseIds: ["anytime"],
      });

      const markerFileEntry = filesIndex.entries.find(
        (entry) => entry.path === ".claude/skills/speclite-local-marker/SKILL.md",
      );
      expect(markerFileEntry).toMatchObject({
        hash: sha256(`# Local Marker\n${marker}\n`),
        sourceRef: "local-source/core-skills/speclite-local-marker/SKILL.md",
      });
      expect(renderCommandResultJson(parsed)).not.toContain(tempRoot);
      expect(renderInstallHumanOutput(parsed)).not.toContain(tempRoot);
      expect(JSON.stringify(skillIndex)).not.toContain(sourceRoot);
      expect(JSON.stringify(filesIndex)).not.toContain(sourceRoot);
      expect(JSON.stringify(skillIndex)).not.toContain("assets/source/speclite");
      expect(JSON.stringify(filesIndex)).not.toContain("assets/source/speclite");
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("blocks confirmed tarball and offline bundle before write phase when no canonical tree handle exists", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-install-local-artifact-blocked-"));
    const tarballPath = path.join(tempRoot, "source.tgz");
    const bundlePath = path.join(tempRoot, "source.bundle");
    await writeFile(tarballPath, Buffer.from("local tarball install bytes"));
    await writeFile(bundlePath, Buffer.from("offline bundle install bytes"));

    try {
      for (const [sourceType, sourceValue, expectedHash] of [
        ["local-tarball", tarballPath, sha256("local tarball install bytes")],
        ["offline-bundle", bundlePath, sha256("offline bundle install bytes")],
      ] as const) {
        const targetRoot = path.join(tempRoot, `target-${sourceType}`);
        await mkdir(targetRoot, { recursive: true });

        const outcome = await runInstallCommand({
          options: {
            json: true,
            yes: true,
            sourceType,
            sourceValue,
          },
          runtime: { ...supportedRuntime, cwd: targetRoot },
          confirmSourceAccess: async () => undefined,
        });
        const parsed = InstallCommandResultSchema.parse(JSON.parse(renderCommandResultJson(outcome.result)));

        expect(outcome.exitCode).toBe(1);
        expect(parsed.status).toBe("failure");
        expect(parsed.issues).toEqual([
          expect.objectContaining({
            issueId: "source-integrity.unsupported-source",
            category: "source-integrity",
            severity: "error",
            details: {
              reason: "local-artifact-install-source-unavailable",
              sourceType,
            },
          }),
        ]);
        expect(parsed.data.sourceDescriptor).toMatchObject({
          sourceType,
          contentHash: expectedHash,
          trustStatus: "unverified",
        });
        await assertNoInstallWrites(targetRoot);
        expect(renderCommandResultJson(parsed)).not.toContain(tempRoot);
        expect(renderInstallHumanOutput(parsed)).not.toContain(tempRoot);
      }
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("status and validate for installed local descriptor stay local-only", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-installed-local-descriptor-"));
    const sourceRoot = path.join(tempRoot, "source");
    const marker = "LOCAL_SOURCE_STATUS_VALIDATE_MARKER";
    await writeLocalCanonicalSource(sourceRoot, marker);

    try {
      const install = await runInstallCommand({
        options: {
          json: true,
          yes: true,
          sourceType: "local",
          sourceValue: sourceRoot,
        },
        runtime: { ...supportedRuntime, cwd: tempRoot },
        confirmSourceAccess: async () => undefined,
      });
      expect(install.result.status).toBe("success");

      await rm(sourceRoot, { recursive: true, force: true });
      const status = await runStatusCommand({
        options: { json: true },
        runtime: { ...supportedRuntime, cwd: tempRoot },
      });
      const validation = await runValidateCommand({
        options: { json: true },
        runtime: { ...supportedRuntime, cwd: tempRoot },
      });

      expect(status.result.status).toBe("success");
      expect(status.result.data.sourceDescriptor).toMatchObject({
        sourceType: "local",
        trustStatus: "unverified",
      });
      expect(validation.result.data.checkedCategories).toContain("source-integrity");
      expect(validation.result.issues).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            issueId: "source-integrity.missing-evidence",
          }),
        ]),
      );
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });
});

describe("validate local source descriptor shape", () => {
  it("checks recorded local descriptor evidence without reading source origins", () => {
    const result = validateSourceIntegrity({
      manifest: {
        schemaVersion: "speclite.manifest.v1",
        sourceDescriptor: {
          sourceType: "local",
          resolvedRoot: "local-source",
          contentHash: "sha256:abc123",
          integrityEvidence: [
            {
              kind: "content-hash",
              algorithm: "sha256",
              value: "sha256:abc123",
              verified: false,
            },
          ],
          trustStatus: "unverified",
        },
        installedModules: [],
        targetIds: [],
        paths: {
          projectRoot: ".",
          specliteRoot: "_speclite",
          artifactRoot: "_speclite-output",
          manifestPath: "_speclite/_config/manifest.yaml",
        },
      },
    });

    expect(result).toEqual({
      issues: [],
      validatedPaths: ["_speclite/_config/manifest.yaml"],
    });
  });

  it("reports missing local content hash evidence from installed descriptor shape only", () => {
    const result = validateSourceIntegrity({
      manifest: {
        schemaVersion: "speclite.manifest.v1",
        sourceDescriptor: {
          sourceType: "offline-bundle",
          resolvedRoot: "offline-bundle",
          integrityEvidence: [],
          trustStatus: "blocked",
        },
        installedModules: [],
        targetIds: [],
        paths: {
          projectRoot: ".",
          specliteRoot: "_speclite",
          artifactRoot: "_speclite-output",
          manifestPath: "_speclite/_config/manifest.yaml",
        },
      },
    });

    expect(result.issues).toEqual([
      expect.objectContaining({
        issueId: "source-integrity.missing-evidence",
        affectedPath: "_speclite/_config/manifest.yaml",
        details: {
          reason: "missing-local-content-hash-evidence",
          sourceType: "offline-bundle",
        },
      }),
    ]);
  });
});

function selectLocalSource(input: {
  sourceType: "local-tarball" | "offline-bundle" | "local";
  sourceValue: string;
}) {
  const selection = normalizeSourceSelection(input);
  expect(selection.ok).toBe(true);
  if (!selection.ok) throw new Error("selection failed");
  return selection.selection;
}

function expectBlocked(
  resolved: LocalSourceResolutionResult,
  issueId: string,
): void {
  expect(resolved).toMatchObject({
    ok: false,
    descriptor: {
      trustStatus: "blocked",
    },
    issues: [
      {
        issueId,
        category: "source-integrity",
        severity: "error",
      },
    ],
  });
}

function sha256(value: string): string {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

function firstIssue(result: LocalSourceResolutionResult) {
  expect(result.ok).toBe(false);
  if (result.ok) throw new Error("expected blocked result");
  return result.issues[0];
}

async function readJsonFixture(relativePath: string): Promise<unknown> {
  return JSON.parse(await readFile(path.join(process.cwd(), relativePath), "utf8"));
}

async function writeLocalCanonicalSource(sourceRoot: string, marker: string): Promise<void> {
  await mkdir(path.join(sourceRoot, "core-skills/speclite-local-marker"), { recursive: true });
  await mkdir(path.join(sourceRoot, "hooks/flow-gate-enforcement"), { recursive: true });
  await mkdir(path.join(sourceRoot, "hooks/canonical-source-change-check"), { recursive: true });
  await writeFile(
    path.join(sourceRoot, "core-skills/module.yaml"),
    [
      "code: core",
      'name: "Local Core Module"',
      'version: "5.3.0"',
      'description: "Local canonical source module"',
      "required: true",
      "default_selected: true",
      "",
    ].join("\n"),
    "utf8",
  );
  await writeFile(
    path.join(sourceRoot, "core-skills/module-help.csv"),
    [
      "module,skill,display-name,phase",
      "Local Core,_meta,,",
      "Local Core,speclite-local-marker,Local Marker,anytime",
      "",
    ].join("\n"),
    "utf8",
  );
  await writeFile(
    path.join(sourceRoot, "core-skills/speclite-local-marker/SKILL.md"),
    `# Local Marker\n${marker}\n`,
    "utf8",
  );
  await writeFile(
    path.join(sourceRoot, "hooks/flow-gate-enforcement/runner.mjs"),
    "#!/usr/bin/env node\nconsole.log(JSON.stringify({ decision: 'allow' }));\n",
    "utf8",
  );
  await writeFile(
    path.join(sourceRoot, "hooks/flow-gate-enforcement/hook-manifest.json"),
    JSON.stringify(
      {
        schemaVersion: "speclite.hook-source.v1",
        hookId: "flow-gate-enforcement",
        runner: "runner.mjs",
      },
      null,
      2,
    ),
    "utf8",
  );
  await writeFile(
    path.join(sourceRoot, "hooks/canonical-source-change-check/runner.mjs"),
    "#!/usr/bin/env node\nconsole.log(JSON.stringify({ systemMessage: 'canonical check warning' }));\n",
    "utf8",
  );
  await writeFile(
    path.join(sourceRoot, "hooks/canonical-source-change-check/hook-manifest.json"),
    JSON.stringify(
      {
        schemaVersion: "speclite.hook-source.v1",
        hookId: "canonical-source-change-check",
        protectedSurface: "assets/source/speclite",
        runner: "runner.mjs",
      },
      null,
      2,
    ),
    "utf8",
  );
}

async function assertNoInstallWrites(projectRoot: string): Promise<void> {
  for (const forbiddenPath of [
    "_speclite",
    "_speclite-output",
    ".claude/skills",
    ".agents/skills",
    "_speclite/_config/manifest.yaml",
    "_speclite/config.toml",
    "_speclite/config.user.toml",
  ]) {
    await expect(readFile(path.join(projectRoot, forbiddenPath), "utf8")).rejects.toMatchObject({
      code: "ENOENT",
    });
  }
}
