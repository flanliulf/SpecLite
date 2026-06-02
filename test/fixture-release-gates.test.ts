import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import { describe, expect, it } from "vitest";
import { runInstallCommand } from "../src/commands/install.js";
import { runUpdateCommand } from "../src/commands/update.js";
import { runValidateCommand } from "../src/commands/validate.js";
import {
  InstallCommandResultSchema,
  UpdateCommandResultSchema,
  ValidateCommandResultSchema,
} from "../src/diagnostics/command-result-schema.js";
import {
  renderCommandResultJson,
  renderInstallHumanOutput,
  renderUpdateHumanOutput,
  renderValidateHumanOutput,
} from "../src/diagnostics/output.js";
import { hashFile } from "../src/manifest/hash.js";

const supportedRuntime = {
  nodeVersion: "v22.12.0",
  platform: "darwin",
  platformRelease: "23.0.0",
} as const;

describe("fresh-install-empty-project release gate fixture", () => {
  it("generates complete deterministic installed tree, indexes and ReadyCheck-gated summary", async () => {
    const firstRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-fresh-gate-a-"));
    const secondRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-fresh-gate-b-"));

    try {
      const first = await runFreshInstall(firstRoot);
      const second = await runFreshInstall(secondRoot);

      const parsed = InstallCommandResultSchema.parse(JSON.parse(renderCommandResultJson(first.result)));
      expect(first.exitCode).toBe(0);
      expect(second.exitCode).toBe(0);
      expect(parsed.data.completedSteps).toEqual([
        "source-discovery",
        "module-selection",
        "config-initialization",
        "runtime-structure",
        "ide-mirror-creation",
        "manifest-generation",
        "ready-check",
        "ready-summary",
      ]);
      expect(parsed.data.pendingSteps).toEqual([]);
      expect(renderCommandResultJson(parsed)).not.toContain("readySummary");

      const humanOutput = renderInstallHumanOutput(parsed);
      expect(humanOutput).toContain("SpecLite ready summary");
      expect(humanOutput).toContain("Completed steps");
      expect(humanOutput).toContain("Installed modules");
      expect(humanOutput).toContain("IDE targets");
      expect(humanOutput).toContain("Key paths");
      expect(humanOutput).not.toContain(firstRoot);

      await expect(readFile(path.join(firstRoot, "_speclite/_config/manifest.yaml"), "utf8")).resolves.toContain(
        "speclite.manifest.v1",
      );
      await expect(readFile(path.join(firstRoot, "_speclite/_config/skill-index.json"), "utf8")).resolves.toContain(
        "speclite.skill-index.v1",
      );
      await expect(readFile(path.join(firstRoot, "_speclite/_config/help-index.json"), "utf8")).resolves.toContain(
        "speclite.help-index.v1",
      );
      await expect(readFile(path.join(firstRoot, "_speclite/_config/files-index.json"), "utf8")).resolves.toContain(
        "speclite.files-index.v1",
      );
      await expect(readFile(path.join(firstRoot, "_speclite/_config/phase-coverage.json"), "utf8")).resolves.toContain(
        "speclite.phase-coverage.v1",
      );
      await expect(readdir(path.join(firstRoot, "_speclite-output"))).resolves.toEqual([
        "implementation-artifacts",
        "planning-artifacts",
      ]);

      const skillIndex = JSON.parse(
        await readFile(path.join(firstRoot, "_speclite/_config/skill-index.json"), "utf8"),
      ) as { entries: Array<{ canonicalSkillId: string; installedTargets: string[] }> };
      const filesIndex = JSON.parse(
        await readFile(path.join(firstRoot, "_speclite/_config/files-index.json"), "utf8"),
      ) as { entries: Array<{ path: string }> };

      expect(skillIndex.entries).toHaveLength(53);
      expect(await listInstalledSkillIds(firstRoot, ".claude/skills")).toHaveLength(53);
      expect(await listInstalledSkillIds(firstRoot, ".agents/skills")).toHaveLength(53);
      expect(skillIndex.entries.every((entry) => entry.installedTargets.join(",") === "claude,agents")).toBe(true);
      expect(filesIndex.entries.some((entry) => entry.path === "_speclite/_config/manifest.yaml")).toBe(true);
      expect(filesIndex.entries.filter((entry) => entry.path.endsWith("/SKILL.md"))).toHaveLength(106);
      expect(filesIndex.entries.every((entry) => isProjectRelativePosixPath(entry.path))).toBe(true);

      expect(normalizeFreshInstallResult(first.result)).toEqual(normalizeFreshInstallResult(second.result));
      const firstInstalledState = await readStableInstalledState(firstRoot);
      expect(firstInstalledState).toEqual(await readStableInstalledState(secondRoot));
      expect(firstInstalledState).toEqual(await readFreshFixtureInstalledState());
    } finally {
      await rm(firstRoot, { recursive: true, force: true });
      await rm(secondRoot, { recursive: true, force: true });
    }
  }, 15_000);

  it("does not render ready summary when ReadyCheck cannot pass", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-fresh-ready-failure-"));

    try {
      const outcome = await runInstallCommand({
        options: { yes: true },
        runtime: {
          ...supportedRuntime,
          cwd: tempRoot,
          targetProject: "fresh-install-empty-project",
        },
        configureProject: async () => ({
          values: {
            output_folder: "../outside",
          },
        }),
      });
      const output = renderInstallHumanOutput(outcome.result);

      expect(outcome.exitCode).toBe(1);
      expect(output).not.toContain("SpecLite ready summary");
      expect(output).not.toContain("release-ready summary");
      expect(outcome.result.data.pendingSteps).toContain("ready-check");
      expect(outcome.result.data.pendingSteps).toContain("ready-summary");
      expect(outcome.result.issues[0]).toMatchObject({
        severity: "error",
      });
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });
});

describe("existing-install-update normal update release gate fixture", () => {
  it("applies only installer-owned planned updates and preserves human/workflow-owned files", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-existing-update-success-"));

    try {
      await writeExistingInstallUpdateState(tempRoot);
      const humanConfigBefore = await readFile(path.join(tempRoot, "_speclite/custom/config.toml"), "utf8");
      const humanUserConfigBefore = await readFile(path.join(tempRoot, "_speclite/custom/config.user.toml"), "utf8");
      const workflowArtifactBefore = await readFile(path.join(tempRoot, "_speclite-output/review.md"), "utf8");
      const workflowMetadataBefore = await readFile(path.join(tempRoot, "_speclite-output/review.md.metadata.json"), "utf8");

      const dryRun = UpdateCommandResultSchema.parse(
        (await runUpdateCommand({ runtime: { cwd: tempRoot, targetProject: "existing-install-update" } })).result,
      );
      expect(dryRun.data.updatePlan.actions).toEqual([
        expect.objectContaining({
          affectedPath: "_speclite-output/review.md",
          ownership: "workflow-owned",
          action: "skip",
          reason: "workflow-owned",
        }),
        expect.objectContaining({
          affectedPath: "_speclite-output/review.md.metadata.json",
          ownership: "workflow-owned",
          action: "skip",
          reason: "workflow-owned",
        }),
        expect.objectContaining({
          affectedPath: "_speclite/config.toml",
          ownership: "installer-owned",
          action: "update",
        }),
        expect.objectContaining({
          affectedPath: "_speclite/custom/config.toml",
          ownership: "human-owned",
          action: "skip",
          reason: "human-owned",
        }),
        expect.objectContaining({
          affectedPath: "_speclite/custom/config.user.toml",
          ownership: "human-owned",
          action: "skip",
          reason: "human-owned",
        }),
      ]);
      expect(dryRun.data.changedPaths).toEqual([]);
      expect(dryRun.data.skippedPaths).toEqual([]);
      expect(dryRun.data.conflicts).toEqual([]);
      expect(JSON.stringify(dryRun.data)).not.toContain("repairPlan");
      expect(JSON.stringify(dryRun.data)).not.toContain("restore-canonical");
      expect(JSON.stringify(dryRun.data)).not.toContain("regenerate");

      const applyOutcome = await runUpdateCommand({
        options: { yes: true },
        runtime: { cwd: tempRoot, targetProject: "existing-install-update" },
      });
      const applied = UpdateCommandResultSchema.parse(applyOutcome.result);

      expect(applyOutcome.exitCode).toBe(0);
      expect(applied).toEqual(await readExistingUpdateExpected("normal-update-success.json"));
      expect(applied.status).toBe("success");
      expect(applied.data.writeAuthorized).toBe(true);
      expect(applied.data.changedPaths).toEqual(["_speclite/_config/files-index.json", "_speclite/config.toml"]);
      expect(applied.data.skippedPaths).toEqual([
        "_speclite-output/review.md",
        "_speclite-output/review.md.metadata.json",
        "_speclite/custom/config.toml",
        "_speclite/custom/config.user.toml",
      ]);
      await expect(readFile(path.join(tempRoot, "_speclite/config.toml"), "utf8")).resolves.toBe(
        "[core]\nproject_name = \"Updated\"\n",
      );
      await expect(readFile(path.join(tempRoot, "_speclite/custom/config.toml"), "utf8")).resolves.toBe(
        humanConfigBefore,
      );
      await expect(readFile(path.join(tempRoot, "_speclite/custom/config.user.toml"), "utf8")).resolves.toBe(
        humanUserConfigBefore,
      );
      await expect(readFile(path.join(tempRoot, "_speclite-output/review.md"), "utf8")).resolves.toBe(
        workflowArtifactBefore,
      );
      await expect(readFile(path.join(tempRoot, "_speclite-output/review.md.metadata.json"), "utf8")).resolves.toBe(
        workflowMetadataBefore,
      );

      const filesIndex = JSON.parse(
        await readFile(path.join(tempRoot, "_speclite/_config/files-index.json"), "utf8"),
      ) as { entries: Array<{ path: string; hash: string }> };
      expect(filesIndex.entries.find((entry) => entry.path === "_speclite/config.toml")?.hash).toBe(
        await hashFile(path.join(tempRoot, "_speclite/config.toml")),
      );

      const followUp = UpdateCommandResultSchema.parse(
        (await runUpdateCommand({ runtime: { cwd: tempRoot, targetProject: "existing-install-update" } })).result,
      );
      expect(followUp.data.conflicts).toEqual([]);
      expect(followUp.data.updatePlan.actions).toContainEqual(
        expect.objectContaining({
          affectedPath: "_speclite/config.toml",
          ownership: "installer-owned",
          action: "skip",
          reason: "unchanged",
        }),
      );
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("blocks installer-owned drift as a normal update conflict without repair actions", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-existing-update-conflict-"));

    try {
      await writeExistingInstallUpdateState(tempRoot);
      await writeFile(path.join(tempRoot, "_speclite/config.toml"), "[core]\nproject_name = \"Drift\"\n", "utf8");

      const outcome = await runUpdateCommand({
        options: { yes: true },
        runtime: { cwd: tempRoot, targetProject: "existing-install-update" },
      });
      const parsed = UpdateCommandResultSchema.parse(outcome.result);
      const output = renderUpdateHumanOutput(parsed);

      expect(outcome.exitCode).toBe(1);
      expect(parsed).toEqual(await readExistingUpdateExpected("installer-owned-drift-conflict.json"));
      expect(parsed.status).toBe("failure");
      expect(parsed.issues).toEqual([
        expect.objectContaining({
          issueId: "update.conflicts",
          details: {
            conflictCount: 1,
            completedSteps: ["installed-state-read", "update-plan"],
            failedStep: "conflict-check",
            pendingSteps: ["resolve-conflicts"],
            manualAction:
              "Resolve the reported update conflicts, then rerun speclite update before authorizing writes.",
          },
        }),
      ]);
      expect(parsed.data.conflicts).toEqual([
        expect.objectContaining({
          affectedPath: "_speclite/config.toml",
          ownership: "installer-owned",
          reason: "installer-owned-drift",
        }),
      ]);
      expect(parsed.data.changedPaths).toEqual([]);
      expect(parsed.data.writeAuthorized).toBe(false);
      expect(parsed.data.completedSteps).toEqual(["installed-state-read", "update-plan"]);
      expect(parsed.data.failedStep).toBe("conflict-check");
      expect(parsed.data.pendingSteps).toEqual(["resolve-conflicts"]);
      expect(JSON.stringify(parsed.data)).not.toContain("repairPlan");
      expect(JSON.stringify(parsed.data.updatePlan.actions)).not.toContain("restore-canonical");
      expect(JSON.stringify(parsed.data.updatePlan.actions)).not.toContain("regenerate");
      expect(output).toContain("Conflicts:");
      expect(output).toContain("Step State");
      expect(output).toContain("Failed step: conflict-check");
      expect(output).toContain("installer-owned-drift");
      expect(output).toContain("_speclite/config.toml");
      expect(output).not.toContain("ready summary");
      expect(output).not.toContain("release-ready summary");
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });
});

describe("ide-drift validate release gate fixture", () => {
  it("reports canonical skill package hash mismatch with deterministic details and no repair writes", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-ide-drift-"));

    try {
      await writeIdeDriftInstalledState(tempRoot);
      const manifestBefore = await readFile(path.join(tempRoot, "_speclite/_config/manifest.yaml"), "utf8");
      const skillIndexBefore = await readFile(path.join(tempRoot, "_speclite/_config/skill-index.json"), "utf8");
      const filesIndexBefore = await readFile(path.join(tempRoot, "_speclite/_config/files-index.json"), "utf8");

      await writeFile(
        path.join(tempRoot, ".claude/skills/speclite-help/SKILL.md"),
        "# Help drifted inside IDE mirror\n",
        "utf8",
      );

      const outcome = await runValidateCommand({
        options: { json: true },
        runtime: { cwd: tempRoot, targetProject: "ide-drift" },
      });
      const parsed = ValidateCommandResultSchema.parse(outcome.result);
      const output = renderValidateHumanOutput(parsed, { columns: 60, noColor: true, isTty: false, ci: true });

      expect(outcome.exitCode).toBe(1);
      expect(parsed).toEqual(await readIdeDriftExpectedCommandJson());
      expect(parsed.issues).toEqual([
        expect.objectContaining({
          issueId: "ide-mirror.hash-mismatch",
          category: "ide-mirror",
          affectedPath: ".claude/skills/speclite-help",
          component: "ide-mirror-validator",
          details: expect.objectContaining({
            targetId: "claude",
            canonicalSkillId: "speclite-help",
            reason: "hash-mismatch",
            baselineKind: "canonical-package-hash",
            hashMismatch: true,
            expectedHashRecorded: true,
            currentHashComputed: true,
          }),
        }),
      ]);
      expect(JSON.stringify(parsed.data)).not.toContain("repairPlan");
      expect(JSON.stringify(parsed.data)).not.toContain("RepairCommandData");
      expect(output).toContain("SpecLite validate");
      expect(output).toContain("Output profile: Evidence");
      expect(output).toContain("Checked categories:");
      expect(output).toContain("Checked targets:");
      expect(output).toContain("Issues:");
      expect(output).toContain("Next actions");
      expect(output).toContain("issueId=ide-mirror.hash-mismatch");
      expect(output).toContain("targetId");
      expect(output).toContain("canonicalSkillId");
      expect(output).not.toContain(tempRoot);

      await expect(readFile(path.join(tempRoot, "_speclite/_config/manifest.yaml"), "utf8")).resolves.toBe(
        manifestBefore,
      );
      await expect(readFile(path.join(tempRoot, "_speclite/_config/skill-index.json"), "utf8")).resolves.toBe(
        skillIndexBefore,
      );
      await expect(readFile(path.join(tempRoot, "_speclite/_config/files-index.json"), "utf8")).resolves.toBe(
        filesIndexBefore,
      );
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });
});

async function runFreshInstall(projectRoot: string) {
  return runInstallCommand({
    options: { json: true, yes: true },
    runtime: {
      ...supportedRuntime,
      cwd: projectRoot,
      targetProject: "fresh-install-empty-project",
    },
  });
}

async function listInstalledSkillIds(projectRoot: string, targetRoot: ".claude/skills" | ".agents/skills") {
  const entries = await readdir(path.join(projectRoot, targetRoot), { withFileTypes: true });
  return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
}

async function readStableInstalledState(projectRoot: string) {
  const manifest = parseYaml(await readFile(path.join(projectRoot, "_speclite/_config/manifest.yaml"), "utf8"));
  const skillIndex = JSON.parse(await readFile(path.join(projectRoot, "_speclite/_config/skill-index.json"), "utf8"));
  const helpIndex = JSON.parse(await readFile(path.join(projectRoot, "_speclite/_config/help-index.json"), "utf8"));
  const filesIndex = JSON.parse(await readFile(path.join(projectRoot, "_speclite/_config/files-index.json"), "utf8"));
  const phaseCoverage = JSON.parse(await readFile(path.join(projectRoot, "_speclite/_config/phase-coverage.json"), "utf8"));
  return { manifest, skillIndex, helpIndex, filesIndex, phaseCoverage };
}

async function readFreshFixtureInstalledState() {
  const expectedRoot = path.join(
    process.cwd(),
    "test/fixtures/fresh-install-empty-project/expected/installed-state",
  );
  return {
    manifest: JSON.parse(await readFile(path.join(expectedRoot, "manifest-full.json"), "utf8")),
    skillIndex: JSON.parse(await readFile(path.join(expectedRoot, "skill-index-full.json"), "utf8")),
    helpIndex: JSON.parse(await readFile(path.join(expectedRoot, "help-index-full.json"), "utf8")),
    filesIndex: JSON.parse(await readFile(path.join(expectedRoot, "files-index-full.json"), "utf8")),
    phaseCoverage: JSON.parse(await readFile(path.join(expectedRoot, "phase-coverage-full.json"), "utf8")),
  };
}

function normalizeFreshInstallResult(result: unknown) {
  const parsed = InstallCommandResultSchema.parse(result);
  return {
    ...parsed,
    targetProject: "fresh-install-empty-project",
  };
}

function isProjectRelativePosixPath(value: string): boolean {
  return (
    value.length > 0 &&
    !value.includes("\\") &&
    !value.startsWith("/") &&
    !value.startsWith("~") &&
    !/^[A-Za-z]:/.test(value) &&
    !value.includes("../")
  );
}

async function readExistingUpdateExpected(fileName: string) {
  return UpdateCommandResultSchema.parse(
    JSON.parse(
      await readFile(
        path.join(
          process.cwd(),
          "test/fixtures/existing-install-update/expected/command-json",
          fileName,
        ),
        "utf8",
      ),
    ),
  );
}

async function writeExistingInstallUpdateState(projectRoot: string): Promise<void> {
  await writeProjectFile(projectRoot, "_speclite/config.toml", "[core]\nproject_name = \"Base\"\n");
  await writeProjectFile(projectRoot, "canonical/config.toml", "[core]\nproject_name = \"Updated\"\n");
  await writeProjectFile(projectRoot, "_speclite/custom/config.toml", "# keep team formatting\n[core]\nteam = \"custom\"\n");
  await writeProjectFile(projectRoot, "_speclite/custom/config.user.toml", "# keep user formatting\n[core]\nuser = \"custom\"\n");
  await writeProjectFile(
    projectRoot,
    "_speclite-output/review.md",
    "---\nworkflowType: code-review\nsourceSkill: speclite-code-review-01-reviewer\ngeneratedAt: 2026-06-02T00:00:00.000Z\n---\n# Review\n",
  );
  await writeProjectFile(
    projectRoot,
    "_speclite-output/review.md.metadata.json",
    `${JSON.stringify(
      {
        workflowType: "code-review",
        sourceSkill: "speclite-code-review-01-reviewer",
        generatedAt: "2026-06-02T00:00:00.000Z",
      },
      null,
      2,
    )}\n`,
  );
  await writeInstalledState(projectRoot, [
    await filesIndexEntry(projectRoot, "_speclite/config.toml", {
      ownership: "installer-owned",
      sourceRef: "canonical/config.toml",
      artifactKind: "runtime-config",
    }),
    await filesIndexEntry(projectRoot, "_speclite/custom/config.toml", {
      ownership: "human-owned",
      sourceRef: "local:human-custom",
      artifactKind: "project-custom-stub",
    }),
    await filesIndexEntry(projectRoot, "_speclite/custom/config.user.toml", {
      ownership: "human-owned",
      sourceRef: "local:human-custom",
      artifactKind: "project-custom-stub",
    }),
    await filesIndexEntry(projectRoot, "_speclite-output/review.md", {
      ownership: "workflow-owned",
      sourceRef: "local:workflow-artifact",
      artifactKind: "workflow-artifact",
    }),
    await filesIndexEntry(projectRoot, "_speclite-output/review.md.metadata.json", {
      ownership: "workflow-owned",
      sourceRef: "local:workflow-artifact",
      artifactKind: "workflow-artifact-metadata",
    }),
  ]);
}

async function writeInstalledState(projectRoot: string, entries: Array<Record<string, unknown>>): Promise<void> {
  await writeProjectFile(
    projectRoot,
    "_speclite/_config/manifest.yaml",
    [
      "schemaVersion: speclite.manifest.v1",
      "paths:",
      "  projectRoot: .",
      "  specliteRoot: _speclite",
      "  artifactRoot: _speclite-output",
      "  manifestPath: _speclite/_config/manifest.yaml",
      "sourceDescriptor:",
      "  sourceType: bundled",
      "  resolvedRoot: assets/source/speclite",
      "  trustStatus: trusted",
      "  integrityEvidence:",
      "    - kind: content-hash",
      "      algorithm: sha256",
      "      value: fixture-source",
      "      verified: true",
    ].join("\n"),
  );
  await writeProjectFile(
    projectRoot,
    "_speclite/_config/files-index.json",
    `${JSON.stringify({ schemaVersion: "speclite.files-index.v1", entries }, null, 2)}\n`,
  );
}

async function filesIndexEntry(
  projectRoot: string,
  relativePath: string,
  input: {
    ownership: "installer-owned" | "human-owned" | "workflow-owned";
    sourceRef: string;
    artifactKind: string;
  },
): Promise<Record<string, unknown>> {
  return {
    schemaVersion: "speclite.files-index.v1",
    path: relativePath,
    ownership: input.ownership,
    hash: await hashFile(path.join(projectRoot, relativePath)),
    hashAlgorithm: "sha256",
    executable: false,
    artifactKind: input.artifactKind,
    sourceRef: input.sourceRef,
  };
}

async function writeProjectFile(projectRoot: string, relativePath: string, contents: string): Promise<void> {
  const absolutePath = path.join(projectRoot, relativePath);
  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, contents, "utf8");
}

async function readIdeDriftExpectedCommandJson() {
  return ValidateCommandResultSchema.parse(
    JSON.parse(
      await readFile(
        path.join(process.cwd(), "test/fixtures/ide-drift/expected/command-json/validate-hash-mismatch.json"),
        "utf8",
      ),
    ),
  );
}

async function writeIdeDriftInstalledState(projectRoot: string): Promise<void> {
  await writeProjectFile(projectRoot, ".claude/skills/speclite-help/SKILL.md", "# Help canonical baseline\n");
  await writeProjectFile(projectRoot, ".agents/skills/speclite-help/SKILL.md", "# Help canonical baseline\n");
  await writeProjectFile(projectRoot, "_speclite/config.toml", "# runtime config\n");
  await writeProjectFile(projectRoot, "_speclite/config.user.toml", "# user runtime config\n");
  await mkdir(path.join(projectRoot, "_speclite-output"), { recursive: true });
  await writeInstalledState(projectRoot, [
    await filesIndexEntry(projectRoot, "_speclite/config.toml", {
      ownership: "installer-owned",
      sourceRef: "installed-state:runtime-config",
      artifactKind: "runtime-config",
    }),
    await filesIndexEntry(projectRoot, "_speclite/config.user.toml", {
      ownership: "installer-owned",
      sourceRef: "installed-state:runtime-config",
      artifactKind: "runtime-config",
    }),
  ]);
  await writeProjectFile(
    projectRoot,
    "_speclite/_config/manifest.yaml",
    [
      'schemaVersion: "speclite.manifest.v1"',
      "sourceDescriptor:",
      '  sourceType: "bundled"',
      '  channel: "stable"',
      '  version: "0.0.0"',
      '  resolvedRoot: "assets/source/speclite"',
      "  integrityEvidence:",
      '    - kind: "version-lock"',
      '      packageName: "speclite"',
      '      version: "0.0.0"',
      '      lockPath: "package-lock.json"',
      "      verified: true",
      '  trustStatus: "trusted"',
      "installedModules:",
      '  - "core"',
      "targetIds:",
      '  - "claude"',
      '  - "agents"',
      "paths:",
      '  projectRoot: "."',
      '  specliteRoot: "_speclite"',
      '  artifactRoot: "_speclite-output"',
      '  manifestPath: "_speclite/_config/manifest.yaml"',
      "",
    ].join("\n"),
  );
  await writeProjectFile(
    projectRoot,
    "_speclite/_config/skill-index.json",
    `${JSON.stringify(
      {
        schemaVersion: "speclite.skill-index.v1",
        entries: [
          {
            schemaVersion: "speclite.skill-index.v1",
            canonicalSkillId: "speclite-help",
            moduleId: "core",
            sourcePackagePath: "assets/source/speclite/core-skills/speclite-help",
            canonicalPackageHash: "sha256:dc47b727daccd32f9e555fc6901bdf79b9fb8eed15365e64b2e6a43e25fa34b1",
            installedTargets: ["claude", "agents"],
            phaseIds: ["anytime"],
          },
        ],
      },
      null,
      2,
    )}\n`,
  );
  await writeProjectFile(
    projectRoot,
    "_speclite/_config/help-index.json",
    `${JSON.stringify(
      {
        schemaVersion: "speclite.help-index.v1",
        entries: [
          {
            schemaVersion: "speclite.help-index.v1",
            phaseId: "anytime",
            entryLabel: "Help",
            canonicalSkillId: "speclite-help",
            activationTarget: ".claude/skills/speclite-help/SKILL.md",
            targetIds: ["claude", "agents"],
          },
        ],
      },
      null,
      2,
    )}\n`,
  );
  await writeProjectFile(
    projectRoot,
    "_speclite/_config/phase-coverage.json",
    `${JSON.stringify(
      {
        schemaVersion: "speclite.phase-coverage.v1",
        rows: [
          {
            schemaVersion: "speclite.phase-coverage.v1",
            phaseId: "anytime",
            phaseLabel: "Anytime",
            moduleId: "core",
            canonicalSkillId: "speclite-help",
            ideTargets: [
              {
                targetId: "claude",
                entryPath: ".claude/skills/speclite-help",
                activationTarget: ".claude/skills/speclite-help/SKILL.md",
                status: "mapped",
              },
              {
                targetId: "agents",
                entryPath: ".agents/skills/speclite-help",
                activationTarget: ".agents/skills/speclite-help/SKILL.md",
                status: "mapped",
              },
            ],
          },
        ],
      },
      null,
      2,
    )}\n`,
  );
}
