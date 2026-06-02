import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { runUpdateCommand } from "../src/commands/update.js";
import { RepairCommandResultSchema, UpdateCommandResultSchema } from "../src/diagnostics/command-result-schema.js";
import { renderUpdateHumanOutput } from "../src/diagnostics/output.js";
import { hashBytes, hashFile, hashPackageDirectory } from "../src/manifest/hash.js";

describe("update ownership planning", () => {
  it("blocks update planning when required project config cannot be resolved", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-update-config-required-"));

    try {
      await mkdir(path.join(tempRoot, "_speclite/_config"), { recursive: true });
      await writeInstalledState(tempRoot, []);

      const outcome = await runUpdateCommand({ runtime: { cwd: tempRoot, targetProject: "missing-config" } });
      const parsed = UpdateCommandResultSchema.parse(outcome.result);

      expect(outcome.exitCode).toBe(1);
      expect(parsed.status).toBe("failure");
      expect(parsed.issues).toEqual([
        expect.objectContaining({
          issueId: "runtime-path.missing-entry",
          severity: "error",
          affectedPath: "_speclite/config.toml",
          component: "config-resolver",
          details: {
            layerKind: "config",
            layerRole: "required-config",
            status: "missing",
          },
        }),
      ]);
      expect(parsed.data).toMatchObject({
        updatePlan: { actions: [] },
        changedPaths: [],
        skippedPaths: [],
        conflicts: [],
        requiresConfirmation: false,
        writeAuthorized: false,
      });
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("resolves project config warnings before update planning without mutating human-owned TOML", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-update-config-warning-"));

    try {
      await writeProjectFile(tempRoot, "_speclite/config.toml", "[core]\nproject_name = \"Base\"\n");
      await writeProjectFile(tempRoot, "_speclite/config.user.toml", "[core]\nproject_name = \"Installer User\"\n");
      const humanConfig = "# keep comment order\n[core\nproject_name = \"broken\"\n";
      await writeProjectFile(tempRoot, "_speclite/custom/config.toml", humanConfig);
      await writeProjectFile(
        tempRoot,
        "_speclite/custom/config.user.toml",
        "[core]\ndocument_output_language = \"Mandarin\"\n",
      );
      await writeInstalledState(tempRoot, []);

      const outcome = await runUpdateCommand({ runtime: { cwd: tempRoot, targetProject: "config-warning" } });
      const parsed = UpdateCommandResultSchema.parse(outcome.result);

      expect(outcome.exitCode).toBe(0);
      expect(parsed.status).toBe("warning");
      expect(parsed.issues).toEqual([
        expect.objectContaining({
          issueId: "manifest-schema.malformed-field",
          severity: "warning",
          affectedPath: "_speclite/custom/config.toml",
          component: "config-resolver",
          details: {
            layerKind: "config",
            layerRole: "optional-config",
            status: "parse-failed",
          },
        }),
      ]);
      expect(JSON.stringify(parsed.issues)).not.toContain(tempRoot);
      await expect(readFile(path.join(tempRoot, "_speclite/custom/config.toml"), "utf8")).resolves.toBe(
        humanConfig,
      );
      expect(parsed.data.conflicts).toEqual([]);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("resolves installed skill customization by skill directory basename before update planning", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-update-customization-"));

    try {
      await writeProjectFile(tempRoot, "_speclite/config.toml", "[core]\nproject_name = \"Base\"\n");
      await writeProjectFile(tempRoot, ".agents/skills/speclite-dev-story/customize.toml", [
        "[workflow]",
        'on_complete = "defaults"',
      ].join("\n"));
      await writeProjectFile(tempRoot, "canonical/speclite-dev-story/SKILL.md", "# Skill\n");
      await writeProjectFile(tempRoot, "_speclite/custom/speclite-dev-story.toml", [
        "# team custom stays human-owned",
        "[workflow]",
        'on_complete = "team"',
      ].join("\n"));
      const malformedUserCustom = "[workflow\non_complete = \"broken\"\n";
      await writeProjectFile(
        tempRoot,
        "_speclite/custom/speclite-dev-story.user.toml",
        malformedUserCustom,
      );
      await writeProjectFile(
        tempRoot,
        "_speclite/custom/Developer.user.toml",
        "[workflow\non_complete = \"wrong-key\"\n",
      );
      await writeInstalledState(tempRoot, [
        await filesIndexEntry(tempRoot, ".agents/skills/speclite-dev-story/SKILL.md", "# Skill\n", {
          ownership: "installer-owned",
          sourceRef: "canonical/speclite-dev-story/SKILL.md",
        }),
      ]);

      const outcome = await runUpdateCommand({ runtime: { cwd: tempRoot, targetProject: "customization" } });
      const parsed = UpdateCommandResultSchema.parse(outcome.result);

      expect(outcome.exitCode).toBe(0);
      expect(parsed.status).toBe("warning");
      expect(parsed.issues).toEqual([
        expect.objectContaining({
          issueId: "manifest-schema.malformed-field",
          severity: "warning",
          affectedPath: "_speclite/custom/speclite-dev-story.user.toml",
          component: "customization-resolver",
          details: {
            layerKind: "customization",
            layerRole: "user-custom",
            status: "parse-failed",
          },
        }),
      ]);
      expect(JSON.stringify(parsed.issues)).not.toContain("Developer.user.toml");
      await expect(
        readFile(path.join(tempRoot, "_speclite/custom/speclite-dev-story.user.toml"), "utf8"),
      ).resolves.toBe(malformedUserCustom);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("plans unchanged installer-owned files as skips and keeps apply result paths empty without authorization", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-update-unchanged-"));

    try {
      await writeProjectFile(tempRoot, "_speclite/config.toml", "[core]\nproject_name = \"Base\"\n");
      await writeInstalledState(tempRoot, [
        await filesIndexEntry(tempRoot, "_speclite/config.toml", "# config\n", {
          ownership: "installer-owned",
          sourceRef: "installed-state:runtime-config",
        }),
      ]);

      const outcome = await runUpdateCommand({ runtime: { cwd: tempRoot, targetProject: "unchanged" } });
      const parsed = UpdateCommandResultSchema.parse(outcome.result);

      expect(outcome.exitCode).toBe(0);
      expect(parsed.data.updatePlan.actions).toEqual([
        {
          affectedPath: "_speclite/config.toml",
          ownership: "installer-owned",
          action: "skip",
          currentHash: hashBytes("# config\n"),
          expectedHash: hashBytes("# config\n"),
          reason: "unchanged",
        },
      ]);
      expect(parsed.data.changedPaths).toEqual([]);
      expect(parsed.data.skippedPaths).toEqual([]);
      expect(parsed.data.conflicts).toEqual([]);
      expect(parsed.data.writeAuthorized).toBe(false);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("keeps real planned update actions for installer-owned source updates before authorization", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-update-planned-change-"));

    try {
      await writeProjectFile(tempRoot, "_speclite/config.toml", "[core]\nproject_name = \"Base\"\n");
      await writeProjectFile(tempRoot, "canonical/config.toml", "[core]\nproject_name = \"New\"\n");
      await writeInstalledState(tempRoot, [
        await filesIndexEntry(tempRoot, "_speclite/config.toml", "[core]\nproject_name = \"Base\"\n", {
          ownership: "installer-owned",
          sourceRef: "canonical/config.toml",
        }),
      ]);

      const outcome = await runUpdateCommand({ runtime: { cwd: tempRoot, targetProject: "planned" } });
      const parsed = UpdateCommandResultSchema.parse(outcome.result);

      expect(outcome.exitCode).toBe(0);
      expect(parsed.status).toBe("success");
      expect(parsed.data.updatePlan.actions).toEqual([
        {
          affectedPath: "_speclite/config.toml",
          ownership: "installer-owned",
          action: "update",
          currentHash: hashBytes("[core]\nproject_name = \"Base\"\n"),
          expectedHash: hashBytes("[core]\nproject_name = \"New\"\n"),
        },
      ]);
      expect(parsed.data.requiresConfirmation).toBe(true);
      expect(parsed.data.writeAuthorized).toBe(false);
      expect(parsed.data.changedPaths).toEqual([]);
      expect(parsed.data.skippedPaths).toEqual([]);
      expect(parsed.data.conflicts).toEqual([]);
      await expect(readFile(path.join(tempRoot, "_speclite/config.toml"), "utf8")).resolves.toBe(
        "[core]\nproject_name = \"Base\"\n",
      );
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("applies explicit --yes installer-owned planned updates through normal update", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-update-yes-auth-"));

    try {
      await writeProjectFile(tempRoot, "_speclite/config.toml", "[core]\nproject_name = \"Base\"\n");
      await writeProjectFile(tempRoot, "canonical/config.toml", "[core]\nproject_name = \"New\"\n");
      await writeInstalledState(tempRoot, [
        await filesIndexEntry(tempRoot, "_speclite/config.toml", "[core]\nproject_name = \"Base\"\n", {
          ownership: "installer-owned",
          sourceRef: "canonical/config.toml",
        }),
      ]);

      const outcome = await runUpdateCommand({
        options: { yes: true },
        runtime: { cwd: tempRoot, targetProject: "yes-auth" },
      });
      const parsed = UpdateCommandResultSchema.parse(outcome.result);

      expect(outcome.exitCode).toBe(0);
      expect(parsed.data.updatePlan.actions).toEqual([
        expect.objectContaining({
          affectedPath: "_speclite/config.toml",
          action: "update",
        }),
      ]);
      expect(parsed.data.requiresConfirmation).toBe(false);
      expect(parsed.data.writeAuthorized).toBe(true);
      expect(parsed.data.changedPaths).toEqual(["_speclite/_config/files-index.json", "_speclite/config.toml"]);
      expect(parsed.data.skippedPaths).toEqual([]);
      await expect(readFile(path.join(tempRoot, "_speclite/config.toml"), "utf8")).resolves.toBe(
        "[core]\nproject_name = \"New\"\n",
      );

      const filesIndex = JSON.parse(
        await readFile(path.join(tempRoot, "_speclite/_config/files-index.json"), "utf8"),
      ) as { entries: Array<{ path: string; hash: string }> };
      expect(filesIndex.entries.find((entry) => entry.path === "_speclite/config.toml")?.hash).toBe(
        hashBytes("[core]\nproject_name = \"New\"\n"),
      );

      const followUp = await runUpdateCommand({ runtime: { cwd: tempRoot, targetProject: "yes-auth" } });
      const followUpParsed = UpdateCommandResultSchema.parse(followUp.result);
      expect(followUp.exitCode).toBe(0);
      expect(followUpParsed.data.conflicts).toEqual([]);
      expect(followUpParsed.data.updatePlan.actions).toEqual([
        {
          affectedPath: "_speclite/config.toml",
          ownership: "installer-owned",
          action: "skip",
          currentHash: hashBytes("[core]\nproject_name = \"New\"\n"),
          expectedHash: hashBytes("[core]\nproject_name = \"New\"\n"),
          reason: "unchanged",
        },
      ]);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("blocks write planning for a blocked source descriptor before exposing updatePlan payload", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-update-blocked-source-"));

    try {
      await writeProjectFile(tempRoot, "_speclite/config.toml", "[core]\nproject_name = \"Base\"\n");
      await writeProjectFile(tempRoot, "canonical/config.toml", "[core]\nproject_name = \"New\"\n");
      await writeInstalledState(
        tempRoot,
        [
          await filesIndexEntry(tempRoot, "_speclite/config.toml", "[core]\nproject_name = \"Base\"\n", {
            ownership: "installer-owned",
            sourceRef: "canonical/config.toml",
          }),
        ],
        {
          sourceDescriptor: [
            "sourceDescriptor:",
            "  sourceType: git",
            "  channel: main",
            "  resolvedRoot: refs/heads/main",
            "  trustStatus: blocked",
            "  integrityEvidence: []",
          ].join("\n"),
        },
      );

      const outcome = await runUpdateCommand({ runtime: { cwd: tempRoot, targetProject: "blocked" } });
      const parsed = UpdateCommandResultSchema.parse(outcome.result);

      expect(outcome.exitCode).toBe(1);
      expect(parsed.status).toBe("failure");
      expect(parsed.issues).toEqual([
        expect.objectContaining({
          issueId: "source-integrity.blocked-source",
          severity: "error",
          affectedPath: "_speclite/_config/manifest.yaml",
        }),
      ]);
      expect(parsed.data).toMatchObject({
        updatePlan: { actions: [] },
        changedPaths: [],
        skippedPaths: [],
        conflicts: [],
        requiresConfirmation: false,
        writeAuthorized: false,
      });
      await expect(readFile(path.join(tempRoot, "_speclite/config.toml"), "utf8")).resolves.toBe(
        "[core]\nproject_name = \"Base\"\n",
      );
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("blocks write planning when the manifest is missing sourceDescriptor metadata", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-update-missing-source-descriptor-"));

    try {
      await writeProjectFile(tempRoot, "_speclite/config.toml", "[core]\nproject_name = \"Base\"\n");
      await writeProjectFile(tempRoot, "canonical/config.toml", "[core]\nproject_name = \"New\"\n");
      await writeInstalledState(
        tempRoot,
        [
          await filesIndexEntry(tempRoot, "_speclite/config.toml", "[core]\nproject_name = \"Base\"\n", {
            ownership: "installer-owned",
            sourceRef: "canonical/config.toml",
          }),
        ],
        { sourceDescriptor: "" },
      );

      const outcome = await runUpdateCommand({
        options: { yes: true },
        runtime: { cwd: tempRoot, targetProject: "missing-source-descriptor" },
      });
      const parsed = UpdateCommandResultSchema.parse(outcome.result);

      expect(outcome.exitCode).toBe(1);
      expect(parsed.status).toBe("failure");
      expect(parsed.issues).toEqual([
        expect.objectContaining({
          issueId: "source-integrity.missing-source-descriptor",
          severity: "error",
          affectedPath: "_speclite/_config/manifest.yaml",
        }),
      ]);
      expect(parsed.data).toMatchObject({
        updatePlan: { actions: [] },
        changedPaths: [],
        skippedPaths: [],
        conflicts: [],
        requiresConfirmation: false,
        writeAuthorized: false,
      });
      await expect(readFile(path.join(tempRoot, "_speclite/config.toml"), "utf8")).resolves.toBe(
        "[core]\nproject_name = \"Base\"\n",
      );
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("blocks write planning when the manifest file is missing", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-update-missing-manifest-"));

    try {
      await writeProjectFile(tempRoot, "_speclite/config.toml", "[core]\nproject_name = \"Base\"\n");
      await writeProjectFile(tempRoot, "canonical/config.toml", "[core]\nproject_name = \"New\"\n");
      const entry = await filesIndexEntry(tempRoot, "_speclite/config.toml", "[core]\nproject_name = \"Base\"\n", {
        ownership: "installer-owned",
        sourceRef: "canonical/config.toml",
      });
      await writeProjectFile(
        tempRoot,
        "_speclite/_config/files-index.json",
        `${JSON.stringify({ schemaVersion: "speclite.files-index.v1", entries: [entry] }, null, 2)}\n`,
      );

      const outcome = await runUpdateCommand({
        options: { yes: true },
        runtime: { cwd: tempRoot, targetProject: "missing-manifest" },
      });
      const parsed = UpdateCommandResultSchema.parse(outcome.result);

      expect(outcome.exitCode).toBe(1);
      expect(parsed.status).toBe("failure");
      expect(parsed.issues).toEqual([
        expect.objectContaining({
          issueId: "source-integrity.missing-source-descriptor",
          severity: "error",
          affectedPath: "_speclite/_config/manifest.yaml",
        }),
      ]);
      expect(parsed.data).toMatchObject({
        updatePlan: { actions: [] },
        changedPaths: [],
        skippedPaths: [],
        conflicts: [],
        requiresConfirmation: false,
        writeAuthorized: false,
      });
      await expect(readFile(path.join(tempRoot, "_speclite/config.toml"), "utf8")).resolves.toBe(
        "[core]\nproject_name = \"Base\"\n",
      );
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("blocks write planning when the manifest YAML cannot be parsed", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-update-unreadable-manifest-"));

    try {
      await writeProjectFile(tempRoot, "_speclite/config.toml", "[core]\nproject_name = \"Base\"\n");
      await writeProjectFile(tempRoot, "canonical/config.toml", "[core]\nproject_name = \"New\"\n");
      await writeInstalledState(
        tempRoot,
        [
          await filesIndexEntry(tempRoot, "_speclite/config.toml", "[core]\nproject_name = \"Base\"\n", {
            ownership: "installer-owned",
            sourceRef: "canonical/config.toml",
          }),
        ],
        { sourceDescriptor: "" },
      );
      await writeFile(path.join(tempRoot, "_speclite/_config/manifest.yaml"), "paths:\n  artifactRoot: [\n", "utf8");

      const outcome = await runUpdateCommand({
        options: { yes: true },
        runtime: { cwd: tempRoot, targetProject: "unreadable-manifest" },
      });
      const parsed = UpdateCommandResultSchema.parse(outcome.result);

      expect(outcome.exitCode).toBe(1);
      expect(parsed.status).toBe("failure");
      expect(parsed.issues).toEqual([
        expect.objectContaining({
          issueId: "source-integrity.missing-source-descriptor",
          severity: "error",
          affectedPath: "_speclite/_config/manifest.yaml",
        }),
      ]);
      expect(parsed.data).toMatchObject({
        updatePlan: { actions: [] },
        changedPaths: [],
        skippedPaths: [],
        conflicts: [],
        requiresConfirmation: false,
        writeAuthorized: false,
      });
      await expect(readFile(path.join(tempRoot, "_speclite/config.toml"), "utf8")).resolves.toBe(
        "[core]\nproject_name = \"Base\"\n",
      );
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("blocks write planning when sourceDescriptor metadata is malformed", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-update-malformed-source-descriptor-"));

    try {
      await writeProjectFile(tempRoot, "_speclite/config.toml", "[core]\nproject_name = \"Base\"\n");
      await writeProjectFile(tempRoot, "canonical/config.toml", "[core]\nproject_name = \"New\"\n");
      await writeInstalledState(
        tempRoot,
        [
          await filesIndexEntry(tempRoot, "_speclite/config.toml", "[core]\nproject_name = \"Base\"\n", {
            ownership: "installer-owned",
            sourceRef: "canonical/config.toml",
          }),
        ],
        {
          sourceDescriptor: [
            "sourceDescriptor:",
            "  sourceType: git",
            "  trustStatus: trusted",
            "  integrityEvidence:",
            "    - kind: git-commit",
            "      verified: true",
          ].join("\n"),
        },
      );

      const outcome = await runUpdateCommand({
        options: { yes: true },
        runtime: { cwd: tempRoot, targetProject: "malformed-source-descriptor" },
      });
      const parsed = UpdateCommandResultSchema.parse(outcome.result);

      expect(outcome.exitCode).toBe(1);
      expect(parsed.status).toBe("failure");
      expect(parsed.issues).toEqual([
        expect.objectContaining({
          issueId: "source-integrity.malformed-source-descriptor",
          severity: "error",
          affectedPath: "_speclite/_config/manifest.yaml",
        }),
      ]);
      expect(parsed.data).toMatchObject({
        updatePlan: { actions: [] },
        changedPaths: [],
        skippedPaths: [],
        conflicts: [],
        requiresConfirmation: false,
        writeAuthorized: false,
      });
      await expect(readFile(path.join(tempRoot, "_speclite/config.toml"), "utf8")).resolves.toBe(
        "[core]\nproject_name = \"Base\"\n",
      );
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("projects installer drift and unknown ownership as conflicts while protecting human/workflow paths as skips", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-update-conflicts-"));

    try {
      await writeProjectFile(tempRoot, "_speclite/config.toml", "[core]\nproject_name = \"Base\"\n");
      await writeInstalledState(tempRoot, [
        await filesIndexEntry(tempRoot, "_speclite/config.toml", "# expected\n", {
          ownership: "installer-owned",
          sourceRef: "canonical/config.toml",
        }),
        await filesIndexEntry(tempRoot, "README.md", "# expected readme\n", {
          ownership: "installer-owned",
          sourceRef: "canonical/README.md",
        }),
        await filesIndexEntry(tempRoot, "_speclite/custom/config.toml", "# human\n", {
          ownership: "human-owned",
          sourceRef: "local:human-custom",
        }),
        await filesIndexEntry(tempRoot, "_speclite-output/review.md", "# workflow\n", {
          ownership: "workflow-owned",
          sourceRef: "local:workflow-artifact",
        }),
      ]);
      await mkdir(path.join(tempRoot, "canonical"), { recursive: true });
      await writeFile(path.join(tempRoot, "canonical/config.toml"), "# expected\n", "utf8");
      await writeFile(path.join(tempRoot, "README.md"), "# expected readme\n", "utf8");
      await writeFile(path.join(tempRoot, "_speclite/config.toml"), "# drift\n", "utf8");

      const outcome = await runUpdateCommand({ runtime: { cwd: tempRoot, targetProject: "conflicts" } });
      const parsed = UpdateCommandResultSchema.parse(outcome.result);
      const human = renderUpdateHumanOutput(parsed);

      expect(outcome.exitCode).toBe(1);
      expect(parsed.issues).toEqual([
        expect.objectContaining({
          issueId: "update.conflicts",
          details: {
            conflictCount: 2,
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
          affectedPath: "README.md",
          ownership: "unknown",
          reason: "unknown-ownership",
        }),
        expect.objectContaining({
          affectedPath: "_speclite/config.toml",
          ownership: "installer-owned",
          reason: "installer-owned-drift",
        }),
      ]);
      expect(parsed.data.updatePlan.actions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            affectedPath: "_speclite/custom/config.toml",
            ownership: "human-owned",
            action: "skip",
            reason: "human-owned",
          }),
          expect.objectContaining({
            affectedPath: "_speclite-output/review.md",
            ownership: "workflow-owned",
            action: "skip",
            reason: "workflow-owned",
          }),
        ]),
      );
      expect(parsed.data.updatePlan.actions).not.toContainEqual(
        expect.objectContaining({
          affectedPath: "README.md",
          ownership: "installer-owned",
          action: "conflict",
        }),
      );
      expect(parsed.data.changedPaths).toEqual([]);
      expect(parsed.data.skippedPaths).toEqual([]);
      expect(parsed.data.completedSteps).toEqual(["installed-state-read", "update-plan"]);
      expect(parsed.data.failedStep).toBe("conflict-check");
      expect(parsed.data.pendingSteps).toEqual(["resolve-conflicts"]);
      expect(human).toContain("Conflicts:");
      expect(human).toContain("Step State");
      expect(human).toContain("Failed step: conflict-check");
      expect(human).toContain("_speclite/custom/config.toml");
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("treats missing project-relative source evidence as a planning conflict", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-update-missing-source-evidence-"));

    try {
      await writeProjectFile(tempRoot, "_speclite/config.toml", "[core]\nproject_name = \"Base\"\n");
      await writeInstalledState(tempRoot, [
        await filesIndexEntry(tempRoot, "_speclite/config.toml", "[core]\nproject_name = \"Base\"\n", {
          ownership: "installer-owned",
          sourceRef: "canonical/config.toml",
        }),
      ]);

      const outcome = await runUpdateCommand({ runtime: { cwd: tempRoot, targetProject: "missing-source" } });
      const parsed = UpdateCommandResultSchema.parse(outcome.result);

      expect(outcome.exitCode).toBe(1);
      expect(parsed.issues).toEqual([
        expect.objectContaining({
          issueId: "update.conflicts",
          details: expect.objectContaining({ conflictCount: 1 }),
        }),
      ]);
      expect(parsed.data.conflicts).toEqual([
        expect.objectContaining({
          affectedPath: "_speclite/config.toml",
          ownership: "installer-owned",
          reason: "missing-source-evidence",
        }),
      ]);
      expect(parsed.data.changedPaths).toEqual([]);
      expect(parsed.data.skippedPaths).toEqual([]);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("reports IDE mirror hash mismatch and duplicate target entries as update conflicts", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-update-ide-mirror-drift-"));

    try {
      await writeProjectFile(tempRoot, "_speclite/config.toml", "[core]\nproject_name = \"Base\"\n");
      await writeProjectFile(tempRoot, ".claude/skills/speclite-help/SKILL.md", "# Help\n");
      await writeProjectFile(tempRoot, ".agents/skills/speclite-help/SKILL.md", "# Help\n");
      const canonicalPackageHash = await hashPackageDirectory(
        path.join(tempRoot, ".claude/skills/speclite-help"),
      );
      await writeInstalledState(tempRoot, []);
      await writeSkillIndex(tempRoot, [
        skillIndexEntry({
          canonicalSkillId: "speclite-help",
          canonicalPackageHash,
          installedTargets: ["claude", "agents"],
        }),
      ]);

      await writeProjectFile(tempRoot, ".claude/skills/speclite-help/SKILL.md", "# Drift\n");
      await writeProjectFile(tempRoot, ".agents/skills/speclite-help-copy/SKILL.md", "# Help\n");

      const outcome = await runUpdateCommand({ runtime: { cwd: tempRoot, targetProject: "ide-drift" } });
      const parsed = UpdateCommandResultSchema.parse(outcome.result);

      expect(outcome.exitCode).toBe(1);
      expect(parsed.issues).toEqual([
        expect.objectContaining({
          issueId: "update.conflicts",
          details: expect.objectContaining({ conflictCount: 2 }),
        }),
      ]);
      expect(parsed.data.conflicts).toEqual([
        expect.objectContaining({
          affectedPath: ".agents/skills/speclite-help-copy",
          ownership: "installer-owned",
          reason: "installer-owned-drift",
          currentHash: canonicalPackageHash,
          expectedHash: canonicalPackageHash,
        }),
        expect.objectContaining({
          affectedPath: ".claude/skills/speclite-help",
          ownership: "installer-owned",
          reason: "installer-owned-drift",
          expectedHash: canonicalPackageHash,
        }),
      ]);
      expect(parsed.data.updatePlan.actions).toEqual([]);
      expect(parsed.data.changedPaths).toEqual([]);
      expect(parsed.data.skippedPaths).toEqual([]);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("reports missing IDE mirror target entries as update conflicts without restoring content", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-update-ide-mirror-missing-"));

    try {
      await writeProjectFile(tempRoot, "_speclite/config.toml", "[core]\nproject_name = \"Base\"\n");
      await writeProjectFile(tempRoot, ".claude/skills/speclite-help/SKILL.md", "# Help\n");
      const canonicalPackageHash = await hashPackageDirectory(
        path.join(tempRoot, ".claude/skills/speclite-help"),
      );
      await writeInstalledState(tempRoot, []);
      await writeSkillIndex(tempRoot, [
        skillIndexEntry({
          canonicalSkillId: "speclite-help",
          canonicalPackageHash,
          installedTargets: ["claude", "agents"],
        }),
      ]);

      const outcome = await runUpdateCommand({ runtime: { cwd: tempRoot, targetProject: "ide-missing" } });
      const parsed = UpdateCommandResultSchema.parse(outcome.result);

      expect(outcome.exitCode).toBe(1);
      expect(parsed.data.conflicts).toEqual([
        expect.objectContaining({
          affectedPath: ".agents/skills/speclite-help",
          ownership: "installer-owned",
          reason: "installer-owned-drift",
          expectedHash: canonicalPackageHash,
        }),
      ]);
      await expect(readFile(path.join(tempRoot, ".agents/skills/speclite-help/SKILL.md"), "utf8")).rejects.toThrow();
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("plans repairable installer-owned drift from canonical source without writing before authorization", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-repair-plan-source-"));

    try {
      await writeProjectFile(tempRoot, "_speclite/config.toml", "[core]\nproject_name = \"Drift\"\n");
      await writeProjectFile(tempRoot, "canonical/config.toml", "[core]\nproject_name = \"Canonical\"\n");
      await writeInstalledState(tempRoot, [
        await filesIndexEntry(tempRoot, "_speclite/config.toml", "[core]\nproject_name = \"Base\"\n", {
          ownership: "installer-owned",
          sourceRef: "canonical/config.toml",
        }),
      ]);
      await writeProjectFile(tempRoot, "_speclite/config.toml", "[core]\nproject_name = \"Drift\"\n");

      const outcome = await runUpdateCommand({
        options: { repair: true },
        runtime: { cwd: tempRoot, targetProject: "repair-source" },
      });
      const parsed = RepairCommandResultSchema.parse(outcome.result);

      expect(outcome.exitCode).toBe(0);
      expect(parsed.command).toBe("update.repair");
      expect(parsed.data.repairPlan.actions).toEqual([
        {
          affectedPath: "_speclite/config.toml",
          ownership: "installer-owned",
          action: "regenerate",
          currentHash: hashBytes("[core]\nproject_name = \"Drift\"\n"),
          expectedHash: hashBytes("[core]\nproject_name = \"Canonical\"\n"),
        },
      ]);
      expect(parsed.data.requiresConfirmation).toBe(true);
      expect(parsed.data.writeAuthorized).toBe(false);
      expect(parsed.data.changedPaths).toEqual([]);
      expect(parsed.data.skippedPaths).toEqual([]);
      expect(parsed.data.conflicts).toEqual([]);
      await expect(readFile(path.join(tempRoot, "_speclite/config.toml"), "utf8")).resolves.toBe(
        "[core]\nproject_name = \"Drift\"\n",
      );
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("keeps protected and source-unsafe repair candidates as conflicts instead of repair actions", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-repair-protected-conflicts-"));

    try {
      await writeProjectFile(tempRoot, "_speclite/config.toml", "[core]\nproject_name = \"Base\"\n");
      await writeInstalledState(tempRoot, [
        await filesIndexEntry(tempRoot, "_speclite/config.toml", "[core]\nproject_name = \"Base\"\n", {
          ownership: "installer-owned",
          sourceRef: "canonical/missing-config.toml",
        }),
        await filesIndexEntry(tempRoot, "_speclite/custom/config.toml", "# human\n", {
          ownership: "human-owned",
          sourceRef: "local:human-custom",
        }),
        await filesIndexEntry(tempRoot, "_speclite-output/report.md", "# workflow\n", {
          ownership: "workflow-owned",
          sourceRef: "local:workflow-artifact",
        }),
        await filesIndexEntry(tempRoot, "README.md", "# readme\n", {
          ownership: "installer-owned",
          sourceRef: "local:unsupported",
        }),
      ]);
      await writeProjectFile(tempRoot, "_speclite/config.toml", "[core]\nproject_name = \"Drift\"\n");

      const outcome = await runUpdateCommand({
        options: { repair: true },
        runtime: { cwd: tempRoot, targetProject: "repair-conflicts" },
      });
      const parsed = RepairCommandResultSchema.parse(outcome.result);

      expect(outcome.exitCode).toBe(1);
      expect(parsed.data.repairPlan.actions).toEqual([]);
      expect(parsed.issues).toEqual([
        expect.objectContaining({
          issueId: "update.conflicts",
          details: { conflictCount: 4 },
        }),
      ]);
      expect(parsed.data.conflicts).toEqual([
        expect.objectContaining({
          affectedPath: "README.md",
          ownership: "unknown",
          reason: "unknown-ownership",
        }),
        expect.objectContaining({
          affectedPath: "_speclite-output/report.md",
          ownership: "workflow-owned",
          reason: "workflow-owned",
        }),
        expect.objectContaining({
          affectedPath: "_speclite/config.toml",
          ownership: "installer-owned",
          reason: "missing-source-evidence",
        }),
        expect.objectContaining({
          affectedPath: "_speclite/custom/config.toml",
          ownership: "human-owned",
          reason: "human-owned",
        }),
      ]);
      await expect(readFile(path.join(tempRoot, "_speclite/config.toml"), "utf8")).resolves.toBe(
        "[core]\nproject_name = \"Drift\"\n",
      );
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("applies authorized repair actions through safe write and records actual changed paths", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-repair-apply-"));

    try {
      await writeProjectFile(tempRoot, "_speclite/config.toml", "[core]\nproject_name = \"Drift\"\n");
      await writeProjectFile(tempRoot, "canonical/config.toml", "[core]\nproject_name = \"Canonical\"\n");
      await writeInstalledState(tempRoot, [
        await filesIndexEntry(tempRoot, "_speclite/config.toml", "[core]\nproject_name = \"Base\"\n", {
          ownership: "installer-owned",
          sourceRef: "canonical/config.toml",
        }),
      ]);
      await writeProjectFile(tempRoot, "_speclite/config.toml", "[core]\nproject_name = \"Drift\"\n");

      const outcome = await runUpdateCommand({
        options: { repair: true, yes: true },
        runtime: { cwd: tempRoot, targetProject: "repair-apply" },
      });
      const parsed = RepairCommandResultSchema.parse(outcome.result);

      expect(outcome.exitCode).toBe(0);
      expect(parsed.status).toBe("success");
      expect(parsed.data.writeAuthorized).toBe(true);
      expect(parsed.data.changedPaths).toEqual(["_speclite/config.toml"]);
      expect(parsed.data.skippedPaths).toEqual([]);
      await expect(readFile(path.join(tempRoot, "_speclite/config.toml"), "utf8")).resolves.toBe(
        "[core]\nproject_name = \"Canonical\"\n",
      );
      await expect(readFile(path.join(tempRoot, "_speclite/.lock"), "utf8")).rejects.toThrow();
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("repairs recoverable IDE mirror package drift from canonical source in adapter order", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-repair-ide-mirror-"));

    try {
      await writeProjectFile(tempRoot, "_speclite/config.toml", "[core]\nproject_name = \"Base\"\n");
      await writeProjectFile(tempRoot, "assets/source/speclite/core-skills/speclite-help/SKILL.md", "# Help\n");
      const canonicalPackageHash = await hashPackageDirectory(
        path.join(tempRoot, "assets/source/speclite/core-skills/speclite-help"),
      );
      await writeInstalledState(tempRoot, []);
      await writeSkillIndex(tempRoot, [
        skillIndexEntry({
          canonicalSkillId: "speclite-help",
          canonicalPackageHash,
          installedTargets: ["claude", "agents"],
        }),
      ]);
      await writeProjectFile(tempRoot, ".claude/skills/speclite-help/SKILL.md", "# Drift\n");
      const driftPackageHash = await hashPackageDirectory(
        path.join(tempRoot, ".claude/skills/speclite-help"),
      );

      const planOutcome = await runUpdateCommand({
        options: { repair: true },
        runtime: { cwd: tempRoot, targetProject: "repair-ide-plan" },
      });
      const planParsed = RepairCommandResultSchema.parse(planOutcome.result);

      expect(planParsed.data.repairPlan.actions).toEqual([
        {
          affectedPath: ".agents/skills/speclite-help",
          ownership: "installer-owned",
          expectedHash: canonicalPackageHash,
          action: "restore-canonical",
        },
        {
          affectedPath: ".claude/skills/speclite-help",
          ownership: "installer-owned",
          currentHash: driftPackageHash,
          expectedHash: canonicalPackageHash,
          action: "restore-canonical",
        },
      ]);
      expect(planParsed.data.conflicts).toEqual([]);
      await expect(readFile(path.join(tempRoot, ".agents/skills/speclite-help/SKILL.md"), "utf8")).rejects.toThrow();

      const applyOutcome = await runUpdateCommand({
        options: { repair: true, yes: true },
        runtime: { cwd: tempRoot, targetProject: "repair-ide-apply" },
      });
      const applyParsed = RepairCommandResultSchema.parse(applyOutcome.result);

      expect(applyOutcome.exitCode).toBe(0);
      expect(applyParsed.data.changedPaths).toEqual([
        ".agents/skills/speclite-help/SKILL.md",
        ".claude/skills/speclite-help/SKILL.md",
      ]);
      await expect(readFile(path.join(tempRoot, ".agents/skills/speclite-help/SKILL.md"), "utf8")).resolves.toBe(
        "# Help\n",
      );
      await expect(readFile(path.join(tempRoot, ".claude/skills/speclite-help/SKILL.md"), "utf8")).resolves.toBe(
        "# Help\n",
      );
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("removes extra canonical-hash files when restoring an IDE mirror package", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-repair-ide-extra-"));

    try {
      await writeProjectFile(tempRoot, "_speclite/config.toml", "[core]\nproject_name = \"Base\"\n");
      await writeProjectFile(tempRoot, "assets/source/speclite/core-skills/speclite-help/SKILL.md", "# Help\n");
      await writeProjectFile(
        tempRoot,
        "assets/source/speclite/core-skills/speclite-help/references/usage.md",
        "# Usage\n",
      );
      const canonicalPackageHash = await hashPackageDirectory(
        path.join(tempRoot, "assets/source/speclite/core-skills/speclite-help"),
      );
      await writeInstalledState(tempRoot, []);
      await writeSkillIndex(tempRoot, [
        skillIndexEntry({
          canonicalSkillId: "speclite-help",
          canonicalPackageHash,
          installedTargets: ["agents"],
        }),
      ]);
      await writeProjectFile(tempRoot, ".agents/skills/speclite-help/SKILL.md", "# Help\n");
      await writeProjectFile(tempRoot, ".agents/skills/speclite-help/references/usage.md", "# Usage\n");
      await writeProjectFile(tempRoot, ".agents/skills/speclite-help/references/obsolete.md", "# Obsolete\n");

      const applyOutcome = await runUpdateCommand({
        options: { repair: true, yes: true },
        runtime: { cwd: tempRoot, targetProject: "repair-ide-extra" },
      });
      const applyParsed = RepairCommandResultSchema.parse(applyOutcome.result);

      expect(applyOutcome.exitCode).toBe(0);
      expect(applyParsed.status).toBe("success");
      expect(applyParsed.data.changedPaths).toEqual([
        ".agents/skills/speclite-help/SKILL.md",
        ".agents/skills/speclite-help/references/obsolete.md",
        ".agents/skills/speclite-help/references/usage.md",
      ]);
      await expect(
        readFile(path.join(tempRoot, ".agents/skills/speclite-help/references/obsolete.md"), "utf8"),
      ).rejects.toThrow();
      await expect(
        hashPackageDirectory(path.join(tempRoot, ".agents/skills/speclite-help")),
      ).resolves.toBe(canonicalPackageHash);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });
});

async function writeInstalledState(
  projectRoot: string,
  entries: Array<Record<string, unknown>>,
  options: { artifactRoot?: string; sourceDescriptor?: string } = {},
): Promise<void> {
  await mkdir(path.join(projectRoot, "_speclite/_config"), { recursive: true });
  const sourceDescriptor =
    options.sourceDescriptor ??
    [
      "sourceDescriptor:",
      "  sourceType: bundled",
      "  resolvedRoot: assets/source/speclite",
      "  trustStatus: trusted",
      "  integrityEvidence:",
      "    - kind: content-hash",
      "      algorithm: sha256",
      "      value: fixture-source",
      "      verified: true",
    ].join("\n");
  await writeFile(
    path.join(projectRoot, "_speclite/_config/manifest.yaml"),
    `paths:\n  artifactRoot: ${options.artifactRoot ?? "_speclite-output"}\n${sourceDescriptor}\n`,
    "utf8",
  );
  await writeFile(
    path.join(projectRoot, "_speclite/_config/files-index.json"),
    `${JSON.stringify({ schemaVersion: "speclite.files-index.v1", entries }, null, 2)}\n`,
    "utf8",
  );
}

async function writeProjectFile(projectRoot: string, relativePath: string, contents: string): Promise<void> {
  const absolutePath = path.join(projectRoot, relativePath);
  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, contents, "utf8");
}

async function writeSkillIndex(projectRoot: string, entries: Array<Record<string, unknown>>): Promise<void> {
  await writeProjectFile(
    projectRoot,
    "_speclite/_config/skill-index.json",
    `${JSON.stringify({ schemaVersion: "speclite.skill-index.v1", entries }, null, 2)}\n`,
  );
}

function skillIndexEntry(input: {
  canonicalSkillId: string;
  canonicalPackageHash: string;
  installedTargets: Array<"claude" | "agents">;
}): Record<string, unknown> {
  return {
    schemaVersion: "speclite.skill-index.v1",
    canonicalSkillId: input.canonicalSkillId,
    moduleId: "core",
    sourcePackagePath: `assets/source/speclite/core-skills/${input.canonicalSkillId}`,
    canonicalPackageHash: input.canonicalPackageHash,
    installedTargets: input.installedTargets,
    phaseIds: ["anytime"],
  };
}

async function filesIndexEntry(
  projectRoot: string,
  relativePath: string,
  contents: string,
  input: {
    ownership: "installer-owned" | "human-owned" | "workflow-owned";
    sourceRef: string;
  },
): Promise<Record<string, unknown>> {
  const absolutePath = path.join(projectRoot, relativePath);
  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, contents, "utf8");
  return {
    schemaVersion: "speclite.files-index.v1",
    path: relativePath,
    ownership: input.ownership,
    hash: await hashFile(absolutePath),
    hashAlgorithm: "sha256",
    executable: false,
    artifactKind: input.ownership === "workflow-owned" ? "workflow-artifact" : "runtime-config",
    sourceRef: input.sourceRef,
  };
}
