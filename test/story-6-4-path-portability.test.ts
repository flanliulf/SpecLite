import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, unlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { describe, expect, it } from "vitest";
import { runCli } from "../src/bin/speclite.js";
import {
  InstallCommandResultSchema,
  RepairCommandResultSchema,
  StatusCommandResultSchema,
  UpdateCommandResultSchema,
  ValidateCommandResultSchema,
} from "../src/diagnostics/command-result-schema.js";
import { renderUpdateHumanOutput } from "../src/diagnostics/output.js";
import {
  MVP_NODE_RUNTIME_MATRIX,
  RELEASE_FIXTURE_MATRIX,
  ReleasePerformanceEvidenceSchema,
  parseExpectedStderrJsonLines,
  parseExpectedManifestSnapshot,
  validateFixtureCaseLayout,
} from "../src/fixtures/fixture-contract.js";
import { isNodeVersionSupported } from "../src/installer/runtime-guard.js";

const execFileAsync = promisify(execFile);
const pathPortabilityRoot = "test/fixtures/path-portability";

describe("Story 6.4 runtime matrix release wiring", () => {
  it("keeps the MVP runtime policy exactly Node 22 minimum and Node 24 recommended", async () => {
    const packageJson = JSON.parse(await readFile("package.json", "utf8")) as {
      engines: { node: string };
    };
    const ci = await readFile(".github/workflows/ci.yml", "utf8");

    expect(MVP_NODE_RUNTIME_MATRIX).toEqual([22, 24]);
    expect(packageJson.engines.node).toBe(">=22");
    expect(isNodeVersionSupported("v22.0.0")).toBe(true);
    expect(isNodeVersionSupported("v24.0.0")).toBe(true);
    expect(isNodeVersionSupported("v20.19.0")).toBe(false);
    expect(ci).toContain("node: [22, 24]");
    expect(ci).not.toMatch(/node:\s*\[[^\]]*\b20\b/);
    expect(ci).not.toMatch(/node:\s*\[[^\]]*\b26\b/);
    expect(RELEASE_FIXTURE_MATRIX.find((entry) => entry.fixtureId === "skill-artifact-loop")).toEqual({
      fixtureId: "skill-artifact-loop",
      status: "required",
    });
  });
});

describe("Story 6.4 path-portability fixture", () => {
  it("executes real CLI commands against a temporary fixture project before semantic assertions", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-path-portability-"));

    try {
      const installResult = await runSpecliteCli(["install", tempRoot, "--json", "--yes"]);
      const install = InstallCommandResultSchema.parse(JSON.parse(installResult.stdout));
      const statusResult = await runSpecliteCli(["status", tempRoot, "--json"]);
      const status = StatusCommandResultSchema.parse(JSON.parse(statusResult.stdout));
      const resolveConfigResult = await runSpecliteCli([
        "resolve",
        "config",
        "--project-root",
        tempRoot,
        "--key",
        "core.project_name",
      ]);
      const resolveConfig = JSON.parse(
        resolveConfigResult.stdout,
      ) as unknown;
      const resolveCustomizationResult = await runSpecliteCli([
        "resolve",
        "customization",
        "--project-root",
        tempRoot,
        "--skill",
        path.join(tempRoot, ".claude/skills/speclite-dev-story"),
        "--key",
        "workflow.on_complete",
      ]);
      const resolveCustomization = JSON.parse(
        resolveCustomizationResult.stdout,
      ) as unknown;

      const updateResult = await runSpecliteCli(["update", tempRoot, "--json"]);
      const update = UpdateCommandResultSchema.parse(JSON.parse(updateResult.stdout));
      const repairResult = await runSpecliteCli(["update", tempRoot, "--repair", "--json"]);
      const repair = RepairCommandResultSchema.parse(JSON.parse(repairResult.stdout));

      await introducePathPortabilityValidationFaults(tempRoot);
      const validateResult = await runSpecliteCli(["validate", tempRoot, "--json"]);
      const validate = ValidateCommandResultSchema.parse(JSON.parse(validateResult.stdout));

      expect(update.status).toBe("failure");
      expect(repair.status).toBe("failure");
      expect(validate.status).toBe("failure");
      expect([
        installResult.exitCode,
        statusResult.exitCode,
        resolveConfigResult.exitCode,
        resolveCustomizationResult.exitCode,
        updateResult.exitCode,
        repairResult.exitCode,
        validateResult.exitCode,
      ]).toEqual([0, 0, 0, 0, 1, 1, 1]);

      expect(install.command).toBe("install");
      expect(install.status).toBe("success");
      expect(status.command).toBe("status");
      expect(status.data.paths.projectRoot).toBe(".");
      expect(resolveConfig).toHaveProperty("core.project_name");
      expect(resolveCustomization).toHaveProperty("workflow.on_complete");
      expect(update.command).toBe("update");
      expect(repair.command).toBe("update.repair");
      expect(validate.command).toBe("validate");
      expect(validate.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ issueId: "artifact-path.escapes-project" }),
          expect.objectContaining({ issueId: "file-integrity.case-conflict" }),
          expect.objectContaining({ issueId: "file-integrity.unsafe-overwrite-risk" }),
        ]),
      );
      expect(validate.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            issueId: "artifact-path.escapes-project",
            affectedPath: "artifact:actualArtifactPath",
            details: expect.objectContaining({
              pathRole: "actualArtifactPath",
              reason: "path-escapes-project",
            }),
          }),
        ]),
      );

      for (const value of [install, status, update, repair, validate, resolveConfig, resolveCustomization]) {
        assertNoPortablePathLeak(JSON.stringify(value));
      }
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  }, 20_000);

  it("has complete release gate layout and semantic expected outputs without portable path leaks", async () => {
    const entries = [
      `${pathPortabilityRoot}/README.md`,
      `${pathPortabilityRoot}/input/.gitkeep`,
      `${pathPortabilityRoot}/expected/command-json/install.json`,
      `${pathPortabilityRoot}/expected/command-json/status.json`,
      `${pathPortabilityRoot}/expected/command-json/validate.json`,
      `${pathPortabilityRoot}/expected/command-json/update.json`,
      `${pathPortabilityRoot}/expected/command-json/update-repair.json`,
      `${pathPortabilityRoot}/expected/manifest-index/files-index.json`,
      `${pathPortabilityRoot}/expected/resolve/config.json`,
      `${pathPortabilityRoot}/expected/resolve/customization.json`,
      `${pathPortabilityRoot}/expected/resolve/optional-layer-warning.jsonl`,
      `${pathPortabilityRoot}/expected/human-output/compact-width-72.txt`,
      `${pathPortabilityRoot}/expected/human-output/evidence-no-color.txt`,
      `${pathPortabilityRoot}/expected/release-evidence/performance-evidence.json`,
    ];

    expect(
      validateFixtureCaseLayout({
        relativeCasePath: pathPortabilityRoot,
        caseId: "path-portability",
        entries,
      }),
    ).toEqual([]);

    const install = InstallCommandResultSchema.parse(
      JSON.parse(await readFixture("expected/command-json/install.json")),
    );
    const status = StatusCommandResultSchema.parse(
      JSON.parse(await readFixture("expected/command-json/status.json")),
    );
    const validate = ValidateCommandResultSchema.parse(
      JSON.parse(await readFixture("expected/command-json/validate.json")),
    );
    const update = UpdateCommandResultSchema.parse(
      JSON.parse(await readFixture("expected/command-json/update.json")),
    );
    const repair = RepairCommandResultSchema.parse(
      JSON.parse(await readFixture("expected/command-json/update-repair.json")),
    );
    const resolveConfig = JSON.parse(await readFixture("expected/resolve/config.json")) as unknown;
    const resolveCustomization = JSON.parse(
      await readFixture("expected/resolve/customization.json"),
    ) as unknown;
    const filesIndex = parseExpectedManifestSnapshot(
      JSON.parse(await readFixture("expected/manifest-index/files-index.json")),
    ) as {
      entries: Array<{
        artifactKind: string;
        executable: boolean;
        hash: string;
        path: string;
        sourceRef: string;
      }>;
    };
    const warnings = parseExpectedStderrJsonLines(
      await readFixture("expected/resolve/optional-layer-warning.jsonl"),
    );

    expect(install.data.paths.projectRoot).toBe(".");
    expect(status.data.paths.projectRoot).toBe(".");
    expect(validate.data.validatedPaths).toContain("_speclite/_config/manifest.yaml");
    expect(validate.data.issueCounts.error).toBe(4);
    expect(validate.issues.map((issue) => issue.issueId)).toEqual(
      expect.arrayContaining([
        "artifact-path.escapes-project",
        "artifact-path.symlink-escape",
        "file-integrity.case-conflict",
        "file-integrity.unsafe-overwrite-risk",
      ]),
    );
    expect(validate.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          issueId: "artifact-path.escapes-project",
          affectedPath: "artifact:actualArtifactPath",
          details: expect.objectContaining({
            pathRole: "actualArtifactPath",
            reason: "path-escapes-project",
          }),
        }),
      ]),
    );
    expect(update.data.updatePlan.actions.some((action) => "repairPlan" in action)).toBe(false);
    expect(repair.command).toBe("update.repair");
    expect(repair.data.repairPlan.actions[0]).toMatchObject({
      affectedPath: ".claude/skills/speclite-help/SKILL.md",
      ownership: "installer-owned",
      action: "restore-canonical",
    });
    expect(repair.data.conflicts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          affectedPath: "_speclite/custom/config.toml",
          ownership: "human-owned",
          reason: "human-owned",
        }),
        expect.objectContaining({
          affectedPath: "_speclite/_config/manifest.yaml",
          ownership: "installer-owned",
          reason: "missing-source-evidence",
        }),
      ]),
    );
    expect(resolveConfig).toMatchObject({ "core.project_name": "Path Portability" });
    expect(resolveCustomization).toMatchObject({ "workflow.on_complete": "team" });
    expect(warnings[0]).toMatchObject({
      issueId: "manifest-schema.malformed-field",
      affectedPath: "_speclite/custom/speclite-dev-story.user.toml",
    });
    expect(filesIndex.entries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          artifactKind: "canonical-text",
          executable: false,
          hashAlgorithm: "sha256",
          path: "_speclite/core-skills/speclite-help/SKILL.md",
        }),
        expect.objectContaining({
          artifactKind: "runtime-script",
          executable: true,
          hashAlgorithm: "sha256",
          path: "_speclite/scripts/resolve_config.py",
        }),
      ]),
    );
    expect(filesIndex.entries.every((entry) => entry.hash.startsWith("sha256:"))).toBe(true);

    for (const value of [
      install,
      status,
      validate,
      update,
      repair,
      resolveConfig,
      resolveCustomization,
      filesIndex,
    ]) {
      assertNoPortablePathLeak(JSON.stringify(value));
    }
  });

  it("keeps runtime p95 measurements in non-stable release evidence only", async () => {
    const evidence = ReleasePerformanceEvidenceSchema.parse(
      JSON.parse(await readFixture("expected/release-evidence/performance-evidence.json")),
    );
    const stableSnapshotText = [
      await readFixture("expected/command-json/install.json"),
      await readFixture("expected/command-json/status.json"),
      await readFixture("expected/command-json/validate.json"),
      await readFixture("expected/command-json/update.json"),
      await readFixture("expected/command-json/update-repair.json"),
    ].join("\n");

    expect(evidence.measurements[0]).toMatchObject({
      fixtureCase: "path-portability",
      command: "status",
      p95DurationMs: expect.any(Number),
      regressionPercentage: expect.any(Number),
      profilingSampleLocation: "release-evidence/path-portability/status-profile.cpuprofile",
    });
    expect(stableSnapshotText).not.toMatch(/duration|elapsed|p95|profiling|profile|regressionPercentage/i);
  });

  it("renders repair human output across terminal width profiles with no-color copy-paste fields preserved", async () => {
    const repair = RepairCommandResultSchema.parse(
      JSON.parse(await readFixture("expected/command-json/update-repair.json")),
    );

    for (const profile of [
      { columns: 72, outputProfile: "Evidence (key-value)" },
      { columns: 100, outputProfile: "Evidence (compact-table)" },
      { columns: 120, outputProfile: "Evidence (full-table)" },
    ]) {
      const output = renderUpdateHumanOutput(repair, {
        columns: profile.columns,
        noColor: true,
        isTty: false,
        ci: true,
      });

      expect(output).toContain(`输出形式：证据 ${profile.outputProfile.slice("Evidence ".length)}`);
      expect(output).not.toMatch(/\u001b\[[0-9;]*m/);
      for (const required of [
        "affectedPath",
        "ownership",
        "action=restore-canonical",
        "reason=human-owned",
        "issueId=update.conflicts",
        "plan 状态",
        "category=update",
        "[error]",
        "受保护边界",
        "nextAction=",
        "repair plan / planned effects（修复影响）",
        "speclite validate",
      ]) {
        expect(output).toContain(required);
      }
      assertNoPortablePathLeak(output);
    }
  });
});

describe("Story 6.4 packaging acceptance", () => {
  it("generates a stable packaging manifest with required inclusions and fixture exclusions", async () => {
    const packageJson = JSON.parse(await readFile("package.json", "utf8")) as {
      scripts: Record<string, string>;
    };
    expect(packageJson.scripts["release:packaging-check"]).toBe("node scripts/release/packaging-check.mjs");

    await unlink("dist/packaging-manifest.json").catch((error: unknown) => {
      if (!isMissingPathError(error)) throw error;
    });
    await unlink("release/packaging-manifest.json").catch((error: unknown) => {
      if (!isMissingPathError(error)) throw error;
    });
    await execFileAsync(process.execPath, ["scripts/release/packaging-check.mjs"], {
      cwd: process.cwd(),
    });
    const firstManifestText = await readFile("release/packaging-manifest.json", "utf8");
    const firstRuntimeManifestText = await readFile("dist/packaging-manifest.json", "utf8");
    await execFileAsync(process.execPath, ["scripts/release/packaging-check.mjs"], {
      cwd: process.cwd(),
    });
    const secondManifestText = await readFile("release/packaging-manifest.json", "utf8");
    const secondRuntimeManifestText = await readFile("dist/packaging-manifest.json", "utf8");
    const manifest = JSON.parse(secondManifestText) as {
      assertions: { passed: boolean; id: string }[];
      files: string[];
      packageJson: { bin: Record<string, string> };
      packagedDocumentationExamples: Array<{
        path: string;
        classification: string;
        isReleaseGateFixture: boolean;
      }>;
    };
    const rawPack = await execFileAsync("npm", ["pack", "--dry-run", "--json"], {
      cwd: process.cwd(),
      encoding: "utf8",
    });
    const [packResult] = JSON.parse(rawPack.stdout) as [{ files: Array<{ path: string }> }];
    const packFiles = packResult.files.map((file) => file.path).sort((left, right) => left.localeCompare(right));

    expect(secondManifestText).toBe(firstManifestText);
    expect(firstRuntimeManifestText).toBe(firstManifestText);
    expect(secondRuntimeManifestText).toBe(secondManifestText);
    expect(manifest.packageJson.bin.speclite).toBe("dist/bin/speclite.js");
    expect(manifest.files).toContain("package.json");
    expect(manifest.files).toContain("dist/bin/speclite.js");
    expect(manifest.files).toContain("dist/packaging-manifest.json");
    expect(manifest.files).toContain("assets/source/speclite/docs/examples/fixture-derived-examples.md");
    expect(manifest.files).toEqual(packFiles);
    expect(manifest.files.some((file) => file.startsWith("assets/source/speclite/"))).toBe(true);
    expect(manifest.files.some((file) => file.startsWith("test/fixtures/"))).toBe(false);
    expect(manifest.files.some((file) => file.startsWith("fixtures/"))).toBe(false);
    expect(manifest.packagedDocumentationExamples).toEqual([
      {
        path: "assets/source/speclite/docs/examples/fixture-derived-examples.md",
        classification: "packaged-documentation-example",
        isReleaseGateFixture: false,
      },
    ]);
    expect(manifest.assertions.every((assertion) => assertion.passed)).toBe(true);
  }, 20_000);
});

async function readFixture(relativePath: string): Promise<string> {
  return readFile(path.join(pathPortabilityRoot, relativePath), "utf8");
}

async function runSpecliteCli(args: string[]): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  let stdout = "";
  let stderr = "";
  let exitCode = 0;

  await runCli(["node", "speclite", ...args], {
    io: {
      stdout: (text) => {
        stdout += text;
      },
      stderr: (text) => {
        stderr += text;
      },
      setExitCode: (code) => {
        exitCode = code;
      },
      prompt: async () => "",
    },
  });

  return { stdout, stderr, exitCode };
}

async function introducePathPortabilityValidationFaults(projectRoot: string): Promise<void> {
  const filesIndexPath = path.join(projectRoot, "_speclite/_config/files-index.json");
  const filesIndex = JSON.parse(await readFile(filesIndexPath, "utf8")) as {
    entries: Array<Record<string, unknown> & { path: string }>;
  };
  const runtimeConfigEntry = filesIndex.entries.find((entry) => entry.path === "_speclite/config.toml");
  if (runtimeConfigEntry === undefined) {
    throw new Error("path-portability fixture requires _speclite/config.toml in files-index.");
  }

  await mkdir(path.join(projectRoot, "reports/outside-artifacts"), { recursive: true });
  await writeFile(
    path.join(projectRoot, "reports/outside-artifacts/review.md"),
    [
      "---",
      "workflowType: code-review",
      "sourceSkill: speclite-code-review-01-reviewer",
      "generatedAt: 2026-06-02T00:00:00.000Z",
      "---",
      "# Review",
      "",
    ].join("\n"),
    "utf8",
  );
  filesIndex.entries.push({
    ...runtimeConfigEntry,
    path: "_speclite/Config.toml",
  });
  filesIndex.entries.push({
    ...runtimeConfigEntry,
    path: "_speclite-output/review.md",
    ownership: "installer-owned",
    artifactKind: "workflow-artifact",
    sourceRef: "local:workflow-artifact",
  });
  await writeFile(filesIndexPath, `${JSON.stringify(filesIndex, null, 2)}\n`, "utf8");

  const phaseCoveragePath = path.join(projectRoot, "_speclite/_config/phase-coverage.json");
  const phaseCoverage = JSON.parse(await readFile(phaseCoveragePath, "utf8")) as {
    rows: Array<Record<string, unknown>>;
  };
  phaseCoverage.rows[0] = {
    ...phaseCoverage.rows[0],
    artifactContract: {
      artifactType: "code-review",
      defaultOutputPath: "reports/outside-artifacts",
      requiredMetadata: ["workflowType", "sourceSkill", "generatedAt"],
    },
  };
  await writeFile(phaseCoveragePath, `${JSON.stringify(phaseCoverage, null, 2)}\n`, "utf8");
}

function isMissingPathError(error: unknown): boolean {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}

function assertNoPortablePathLeak(text: string): void {
  expect(text).not.toMatch(/\/Users\/|C:\\|~\/|\\\\|node_modules|\.cache|\/tmp\/|token=|password=|Stack trace|Error:/i);
}
