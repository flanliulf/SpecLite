import { mkdir, mkdtemp, readFile, readdir, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { runInstallCommand } from "../src/commands/install.js";
import { renderInstallHumanOutput } from "../src/diagnostics/output.js";
import { normalizeTargetDirectory } from "../src/fs/path-normalizer.js";
import { inspectTargetDirectory } from "../src/installer/target-directory.js";

const supportedRuntime = {
  nodeVersion: "v22.12.0",
  platform: "darwin",
  platformRelease: "23.0.0",
} as const;

describe("target directory normalization", () => {
  it("uses cwd as the default target and reports project-relative paths", () => {
    const normalized = normalizeTargetDirectory({
      cwd: "/workspace/example-project",
    });

    expect(normalized).toMatchObject({
      targetRoot: path.resolve("/workspace/example-project"),
      displayPath: ".",
      targetProject: "example-project",
      paths: {
        projectRoot: ".",
        specliteRoot: "_speclite",
        artifactRoot: "_speclite-output",
        manifestPath: "_speclite/_config/manifest.yaml",
      },
    });
  });

  it("normalizes explicit relative and absolute target inputs without public absolute paths", () => {
    const relativeTarget = normalizeTargetDirectory({
      cwd: "/workspace",
      targetDirectory: "nested/project",
    });
    const absoluteTarget = normalizeTargetDirectory({
      cwd: "/workspace",
      targetDirectory: "/private/tmp/speclite-target",
    });

    expect(relativeTarget.targetRoot).toBe(path.resolve("/workspace/nested/project"));
    expect(relativeTarget.displayPath).toBe("nested/project");
    expect(absoluteTarget.targetRoot).toBe(path.resolve("/private/tmp/speclite-target"));
    expect(absoluteTarget.displayPath).toBe("speclite-target");
  });

  it("keeps Windows-style absolute input out of public display paths", () => {
    const normalized = normalizeTargetDirectory({
      cwd: "C:\\Users\\Ada",
      targetDirectory: "C:\\Users\\Ada\\project",
      pathFlavor: "win32",
    });

    expect(normalized.targetProject).toBe("project");
    expect(normalized.displayPath).toBe("project");
    expect(JSON.stringify(normalized.paths)).not.toContain("C:");
    expect(JSON.stringify(normalized.paths)).not.toContain("\\");
  });
});

describe("target directory inspection", () => {
  it("classifies missing, empty and non-empty directories without creating paths", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-target-state-"));

    try {
      const missingTarget = path.join(tempRoot, "missing");
      const emptyTarget = path.join(tempRoot, "empty");
      const nonEmptyTarget = path.join(tempRoot, "non-empty");
      await mkdir(emptyTarget);
      await mkdir(nonEmptyTarget);
      await writeFile(path.join(nonEmptyTarget, "README.md"), "project notes\n", "utf8");

      await expect(inspectTargetDirectory({ targetRoot: missingTarget })).resolves.toMatchObject({
        kind: "missing",
        detectedRuntime: false,
      });
      await expect(readdir(tempRoot)).resolves.not.toContain("missing");

      await expect(inspectTargetDirectory({ targetRoot: emptyTarget })).resolves.toMatchObject({
        kind: "empty",
        detectedRuntime: false,
      });
      await expect(inspectTargetDirectory({ targetRoot: nonEmptyTarget })).resolves.toMatchObject({
        kind: "non-empty",
        detectedRuntime: false,
        entryCount: 1,
      });

      const fileTarget = path.join(tempRoot, "regular-file");
      await writeFile(fileTarget, "not a directory\n", "utf8");
      await expect(inspectTargetDirectory({ targetRoot: fileTarget })).resolves.toMatchObject({
        kind: "regular-file",
        detectedRuntime: false,
      });
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("detects existing installs and projects manifest and IDE target visibility", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-existing-"));

    try {
      await mkdir(path.join(tempRoot, "_speclite/_config"), { recursive: true });
      await mkdir(path.join(tempRoot, ".claude/skills"), { recursive: true });
      await writeFile(
        path.join(tempRoot, "_speclite/_config/manifest.yaml"),
        [
          "schemaVersion: speclite.manifest.v1",
          "sourceDescriptor:",
          "  sourceType: bundled",
          "  resolvedRoot: assets/source/speclite",
          "  integrityEvidence: []",
          "  trustStatus: blocked",
          "installedModules:",
          "  - core",
          "targetIds:",
          "  - claude",
          "  - agents",
          "paths:",
          "  projectRoot: .",
          "  specliteRoot: _speclite",
          "  artifactRoot: _speclite-output",
          "  manifestPath: _speclite/_config/manifest.yaml",
          "",
        ].join("\n"),
        "utf8",
      );

      const state = await inspectTargetDirectory({ targetRoot: tempRoot });

      expect(state).toMatchObject({
        kind: "existing-install",
        detectedRuntime: true,
        manifestVersion: "speclite.manifest.v1",
        installedModules: ["core"],
        ideTargets: [
          { id: "claude", status: "configured", targetPath: ".claude/skills" },
          { id: "agents", status: "not-configured", targetPath: ".agents/skills" },
        ],
      });
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("reports malformed manifests with manifest-schema issues", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-malformed-"));

    try {
      await mkdir(path.join(tempRoot, "_speclite/_config"), { recursive: true });
      await writeFile(
        path.join(tempRoot, "_speclite/_config/manifest.yaml"),
        "sourceDescriptor: {}\ninstalledModules: []\ntargetIds: []\n",
        "utf8",
      );

      const state = await inspectTargetDirectory({ targetRoot: tempRoot });

      expect(state).toMatchObject({
        kind: "existing-install",
        detectedRuntime: true,
        issues: [
          {
            issueId: "manifest-schema.missing-version",
            category: "manifest-schema",
            severity: "critical",
            affectedPath: "_speclite/_config/manifest.yaml",
          },
        ],
      });
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("reports existing installs with missing manifest as manifest unavailable", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-missing-manifest-"));

    try {
      await mkdir(path.join(tempRoot, "_speclite/_config"), { recursive: true });

      const outcome = await runInstallCommand({
        options: { json: true },
        runtime: {
          ...supportedRuntime,
          cwd: tempRoot,
        },
      });

      expect(outcome.exitCode).toBe(0);
      expect(outcome.result.summary).toContain("Manifest version: unavailable");
      expect(outcome.result.data.manifestVersion).toBe("unavailable");
      expect(outcome.result.data.manifestVersion).not.toBe("speclite.manifest.v1");
      expect(outcome.result.issues).toEqual([]);

      await assertNoInstallWrites(tempRoot, ["_speclite"]);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("reuses manifest-schema issues for malformed installed-state indexes", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-bad-index-"));

    try {
      await mkdir(path.join(tempRoot, "_speclite/_config"), { recursive: true });
      await writeValidManifest(tempRoot);
      await writeFile(
        path.join(tempRoot, "_speclite/_config/skill-index.json"),
        '{"schemaVersion":"speclite.skill-index.v9"}\n',
        "utf8",
      );

      const outcome = await runInstallCommand({
        options: { json: true },
        runtime: {
          ...supportedRuntime,
          cwd: tempRoot,
        },
      });

      expect(outcome.exitCode).toBe(1);
      expect(outcome.result.issues).toEqual([
        expect.objectContaining({
          issueId: "manifest-schema.unsupported-version",
          category: "manifest-schema",
          severity: "critical",
          affectedPath: "_speclite/_config/skill-index.json",
          details: {
            currentSchemaVersion: "speclite.skill-index.v9",
            supportedSchemaVersion: "speclite.skill-index.v1",
          },
        }),
      ]);
      expect(JSON.stringify(outcome.result)).not.toContain(tempRoot);

      await assertNoInstallWrites(tempRoot, ["_speclite"]);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("blocks symlink target roots without following installed state outside the project", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-symlink-target-"));

    try {
      const outsideRoot = path.join(tempRoot, "outside");
      const linkedTarget = path.join(tempRoot, "linked-project");
      await mkdir(path.join(outsideRoot, "_speclite/_config"), { recursive: true });
      await writeValidManifest(outsideRoot);
      await symlink(outsideRoot, linkedTarget);

      const outcome = await runInstallCommand({
        options: { json: true },
        runtime: {
          ...supportedRuntime,
          cwd: tempRoot,
        },
        targetDirectory: "linked-project",
      });

      expect(outcome.exitCode).toBe(1);
      expect(outcome.result.summary).toContain("Directory state: unsafe-symlink");
      expect(outcome.result.issues).toEqual([
        expect.objectContaining({
          issueId: "runtime-path.symlink-escape",
          category: "runtime-path",
          severity: "critical",
          affectedPath: ".",
        }),
      ]);
      expect(JSON.stringify(outcome.result)).not.toContain(outsideRoot);

      await assertNoInstallWrites(tempRoot, ["linked-project"]);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });
});

describe("install target directory no-write orchestration", () => {
  it("resolves the default target and exits before later write stages", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-install-default-"));

    try {
      const outcome = await runInstallCommand({
        options: { json: true },
        runtime: {
          ...supportedRuntime,
          cwd: tempRoot,
        },
      });

      expect(outcome.exitCode).toBe(0);
      expect(outcome.result.data.paths).toEqual({
        projectRoot: ".",
        specliteRoot: "_speclite",
        artifactRoot: "_speclite-output",
        manifestPath: "_speclite/_config/manifest.yaml",
      });
      expect(outcome.result.data.completedSteps).toEqual([]);
      expect(outcome.result.data.pendingSteps).toEqual([
        "source-discovery",
        "module-selection",
        "config-initialization",
        "runtime-structure",
        "ide-mirror-creation",
        "manifest-generation",
        "ready-check",
        "ready-summary",
      ]);
      expect(outcome.result.summary).toContain("Directory state: empty");

      await assertNoInstallWrites(tempRoot);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("accepts explicit target-directory argument and does not create a missing target", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-install-explicit-"));

    try {
      const missingTarget = path.join(tempRoot, "project");
      const outcome = await runInstallCommand({
        options: { json: true },
        runtime: {
          ...supportedRuntime,
          cwd: tempRoot,
        },
        targetDirectory: "project",
      });

      expect(outcome.exitCode).toBe(0);
      expect(outcome.result.targetProject).toBe("project");
      expect(outcome.result.summary).toContain("Directory state: missing");

      await expect(readFile(missingTarget, "utf8")).rejects.toMatchObject({ code: "ENOENT" });
      await assertNoInstallWrites(missingTarget);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("reports non-empty targets and still exits before any install writes", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-install-non-empty-"));

    try {
      await writeFile(path.join(tempRoot, "README.md"), "project notes\n", "utf8");

      const outcome = await runInstallCommand({
        options: { json: true },
        runtime: {
          ...supportedRuntime,
          cwd: tempRoot,
        },
      });

      expect(outcome.exitCode).toBe(0);
      expect(outcome.result.summary).toContain("Directory state: non-empty");
      expect(outcome.result.summary).toContain("Target: current directory.");
      expect(outcome.result.summary).not.toContain("Target: ..");

      await assertNoInstallWrites(tempRoot);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("reports regular file targets without treating them as non-empty directories", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-install-regular-file-"));

    try {
      await writeFile(path.join(tempRoot, "project"), "not a directory\n", "utf8");

      const outcome = await runInstallCommand({
        options: { json: true },
        runtime: {
          ...supportedRuntime,
          cwd: tempRoot,
        },
        targetDirectory: "project",
      });

      expect(outcome.exitCode).toBe(0);
      expect(outcome.result.summary).toContain("Directory state: regular-file");
      expect(outcome.result.summary).not.toContain("non-empty");
      expect(outcome.result.nextActions).toEqual([
        "Choose a directory target before continuing with install.",
      ]);

      await assertNoInstallWrites(tempRoot);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("reports existing install state without overwriting it", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-install-existing-"));

    try {
      await mkdir(path.join(tempRoot, "_speclite/_config"), { recursive: true });
      await mkdir(path.join(tempRoot, ".agents/skills"), { recursive: true });
      await writeFile(
        path.join(tempRoot, "_speclite/_config/manifest.yaml"),
        [
          "schemaVersion: speclite.manifest.v1",
          "sourceDescriptor:",
          "  sourceType: bundled",
          "  resolvedRoot: assets/source/speclite",
          "  integrityEvidence: []",
          "  trustStatus: blocked",
          "installedModules: []",
          "targetIds:",
          "  - agents",
          "paths:",
          "  projectRoot: .",
          "  specliteRoot: _speclite",
          "  artifactRoot: _speclite-output",
          "  manifestPath: _speclite/_config/manifest.yaml",
          "",
        ].join("\n"),
        "utf8",
      );

      const outcome = await runInstallCommand({
        options: { json: true },
        runtime: {
          ...supportedRuntime,
          cwd: tempRoot,
        },
      });

      expect(outcome.exitCode).toBe(0);
      expect(outcome.result.summary).toContain("Directory state: existing-install");
      expect(outcome.result.data.manifestVersion).toBe("speclite.manifest.v1");
      expect(outcome.result.data.ideTargets).toEqual([
        { id: "claude", status: "not-configured", targetPath: ".claude/skills" },
        { id: "agents", status: "configured", targetPath: ".agents/skills" },
      ]);
      expect(outcome.result.nextActions).toEqual([
        "Review the existing SpecLite install before continuing.",
        "Run speclite status or speclite validate for installed-state details.",
      ]);

      const humanOutput = renderInstallHumanOutput(outcome.result, { locale: "en-US" });
      expect(humanOutput).toContain("Directory state: existing-install");
      expect(humanOutput).toContain("Manifest version: speclite.manifest.v1");
      expect(humanOutput).toContain("IDE target statuses:");
      expect(humanOutput).toContain("- agents: configured (.agents/skills)");
      expect(humanOutput).toContain("Next actions:");

      await assertNoInstallWrites(tempRoot, ["_speclite", ".agents/skills"]);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("reuses manifest-schema issues for malformed existing manifests", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-install-bad-manifest-"));

    try {
      await mkdir(path.join(tempRoot, "_speclite/_config"), { recursive: true });
      await writeFile(
        path.join(tempRoot, "_speclite/_config/manifest.yaml"),
        'schemaVersion: "unterminated\n',
        "utf8",
      );

      const outcome = await runInstallCommand({
        options: { json: true },
        runtime: {
          ...supportedRuntime,
          cwd: tempRoot,
        },
      });

      expect(outcome.exitCode).toBe(1);
      expect(outcome.result.status).toBe("failure");
      expect(outcome.result.issues).toEqual([
        expect.objectContaining({
          issueId: "manifest-schema.schema-corruption",
          category: "manifest-schema",
          severity: "critical",
          affectedPath: "_speclite/_config/manifest.yaml",
        }),
      ]);
      expect(JSON.stringify(outcome.result.issues)).not.toContain(tempRoot);

      await assertNoInstallWrites(tempRoot, ["_speclite"]);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });
});

async function writeValidManifest(projectRoot: string): Promise<void> {
  await writeFile(
    path.join(projectRoot, "_speclite/_config/manifest.yaml"),
    [
      "schemaVersion: speclite.manifest.v1",
      "sourceDescriptor:",
      "  sourceType: bundled",
      "  resolvedRoot: assets/source/speclite",
      "  integrityEvidence: []",
      "  trustStatus: blocked",
      "installedModules: []",
      "targetIds: []",
      "paths:",
      "  projectRoot: .",
      "  specliteRoot: _speclite",
      "  artifactRoot: _speclite-output",
      "  manifestPath: _speclite/_config/manifest.yaml",
      "",
    ].join("\n"),
    "utf8",
  );
}

async function assertNoInstallWrites(
  projectRoot: string,
  preexistingPaths: string[] = [],
): Promise<void> {
  for (const forbiddenPath of [
    "_speclite",
    "_speclite-output",
    ".claude/skills",
    ".agents/skills",
    "_speclite/.lock",
    "_speclite/.tmp",
    "_speclite/.safe-write",
    "_speclite/_config/manifest.yaml",
    "_speclite/_config/skill-index.json",
    "_speclite/_config/help-index.json",
    "_speclite/_config/files-index.json",
    "_speclite/_config/phase-coverage.json",
  ]) {
    if (isPreexistingPath(forbiddenPath, preexistingPaths)) {
      continue;
    }
    await expect(readFile(path.join(projectRoot, forbiddenPath), "utf8")).rejects.toMatchObject({
      code: "ENOENT",
    });
  }
}

function isPreexistingPath(forbiddenPath: string, preexistingPaths: string[]): boolean {
  return preexistingPaths.some(
    (preexistingPath) =>
      forbiddenPath === preexistingPath || forbiddenPath.startsWith(`${preexistingPath}/`),
  );
}
