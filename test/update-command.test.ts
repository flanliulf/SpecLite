import { mkdir, mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createSpecliteProgram } from "../src/bin/speclite.js";
import { runUpdateCommand } from "../src/commands/update.js";
import {
  RepairCommandResultSchema,
  UpdateCommandResultSchema,
} from "../src/diagnostics/command-result-schema.js";
import { createRepairCommandResult, createUpdateCommandResult } from "../src/diagnostics/command-result.js";
import { renderCommandResultJson, renderUpdateHumanOutput } from "../src/diagnostics/output.js";
import { hashBytes } from "../src/manifest/hash.js";

describe("update command ownership planning", () => {
  it("registers speclite update --json as a non-write protected plan when files index is missing", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-update-placeholder-"));

    try {
      await mkdir(path.join(tempRoot, "_speclite"), { recursive: true });
      await writeFile(path.join(tempRoot, "_speclite/config.toml"), "[core]\nproject_name = \"Base\"\n", "utf8");
      await writeFile(path.join(tempRoot, "_speclite/config.user.toml"), "[core]\nproject_name = \"User\"\n", "utf8");
      await writeTrustedManifest(tempRoot);
      await mkdir(path.join(tempRoot, "_speclite/custom"), { recursive: true });
      await writeFile(
        path.join(tempRoot, "_speclite/custom/config.toml"),
        "[core]\nproject_name = \"Team Custom\"\n",
        "utf8",
      );
      await writeFile(
        path.join(tempRoot, "_speclite/custom/config.user.toml"),
        "[core]\nproject_name = \" Human Custom \"\n",
        "utf8",
      );
      await writeFile(path.join(tempRoot, "README.md"), "project notes\n", "utf8");

      const result = await runUpdate(["update", tempRoot, "--json"]);
      const parsed = UpdateCommandResultSchema.parse(JSON.parse(result.stdout));

      expect(result.exitCodes).toEqual([1]);
      expect(parsed).toMatchObject({
        command: "update",
        status: "failure",
        targetProject: "Human Custom",
        issues: [
          {
            issueId: "update.conflicts",
            category: "update",
            severity: "error",
            component: "update-command",
            details: {
              conflictCount: 1,
            },
          },
        ],
        data: {
          updatePlan: {
            actions: [],
          },
          requiresConfirmation: true,
          writeAuthorized: false,
          changedPaths: [],
          skippedPaths: [],
          conflicts: [
            {
              affectedPath: "_speclite/_config/files-index.json",
              ownership: "unknown",
              reason: "missing-source-evidence",
            },
          ],
        },
      });
      await assertNoUpdateWrites(tempRoot, { allowSpecliteRoot: true });
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("registers speclite update --repair --json with stable update.repair command id and missing files-index conflict", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-update-repair-placeholder-"));

    try {
      await mkdir(path.join(tempRoot, "_speclite"), { recursive: true });
      await writeFile(path.join(tempRoot, "_speclite/config.toml"), "[core]\nproject_name = \"Base\"\n", "utf8");
      await writeFile(path.join(tempRoot, "_speclite/config.user.toml"), "[core]\nproject_name = \"User\"\n", "utf8");
      await writeTrustedManifest(tempRoot);
      await mkdir(path.join(tempRoot, "_speclite/custom"), { recursive: true });
      await writeFile(
        path.join(tempRoot, "_speclite/custom/config.toml"),
        "[core]\nproject_name = \"Team Custom\"\n",
        "utf8",
      );
      await writeFile(
        path.join(tempRoot, "_speclite/custom/config.user.toml"),
        "[core]\nproject_name = \" Human Custom \"\n",
        "utf8",
      );
      await mkdir(path.join(tempRoot, "docs"));
      await writeFile(path.join(tempRoot, "README.md"), "project notes\n", "utf8");
      await writeFile(path.join(tempRoot, "docs/notes.md"), "# Notes\n", "utf8");

      const result = await runUpdate(["update", tempRoot, "--repair", "--json"]);
      const parsed = RepairCommandResultSchema.parse(JSON.parse(result.stdout));

      expect(result.exitCodes).toEqual([1]);
      expect(parsed.command).toBe("update.repair");
      expect(parsed.status).toBe("failure");
      expect(parsed.targetProject).toBe("Human Custom");
      expect(parsed.issues).toEqual([
        expect.objectContaining({
          issueId: "update.conflicts",
          category: "update",
          severity: "error",
          component: "update-command",
          details: {
            conflictCount: 1,
          },
        }),
      ]);
      expect(parsed.data).toMatchObject({
        repairPlan: {
          actions: [],
        },
        requiresConfirmation: true,
        writeAuthorized: false,
        changedPaths: [],
        skippedPaths: [],
        conflicts: [
          {
            affectedPath: "_speclite/_config/files-index.json",
            ownership: "unknown",
            reason: "missing-source-evidence",
          },
        ],
      });
      await assertNoUpdateWrites(tempRoot, { allowSpecliteRoot: true });
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("uses project config name as targetProject without slugifying non-ASCII text", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-update-target-name-"));

    try {
      await mkdir(path.join(tempRoot, "_speclite"), { recursive: true });
      await writeFile(path.join(tempRoot, "_speclite/config.toml"), "[core]\nproject_name = \" 项目 A \"\n", "utf8");

      const outcome = await runUpdateCommand({ runtime: { cwd: tempRoot } });

      expect(outcome.result.targetProject).toBe("项目 A");
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("projects update conflicts once as a command-level blocker", () => {
    const outcome = createUpdateCommandResult({
      command: "update",
      targetProject: "conflict-fixture",
      summary: "Update planning found conflicts.",
      data: {
        updatePlan: {
          actions: [
            {
              affectedPath: "_speclite/config.toml",
              ownership: "installer-owned",
              action: "conflict",
            },
          ],
        },
        changedPaths: [],
        skippedPaths: [],
        conflicts: [
          {
            affectedPath: "_speclite/config.toml",
            ownership: "installer-owned",
            reason: "installer-owned-drift",
          },
          {
            affectedPath: ".agents/skills/speclite-help/SKILL.md",
            ownership: "human-owned",
            reason: "human-owned",
          },
        ],
        requiresConfirmation: true,
        writeAuthorized: false,
      },
      nextActions: ["Inspect the conflict details before authorizing update writes."],
    });
    const parsed = UpdateCommandResultSchema.parse(outcome.result);

    expect(outcome.exitCode).toBe(1);
    expect(parsed.status).toBe("failure");
    expect(parsed.issues).toEqual([
      {
        issueId: "update.conflicts",
        category: "update",
        severity: "error",
        component: "update-command",
        details: {
          conflictCount: 2,
        },
        impact: "Update planning found one or more path-level conflicts.",
        suggestedNextStep: "Inspect the conflict details before authorizing update writes.",
      },
    ]);
    expect(parsed.data.conflicts.map((conflict) => conflict.affectedPath)).toEqual([
      ".agents/skills/speclite-help/SKILL.md",
      "_speclite/config.toml",
    ]);
  });

  it("parses unknown future update conflict reason codes without rejecting the command result", () => {
    const parsed = UpdateCommandResultSchema.parse({
      schemaVersion: "speclite.command-result.v1",
      status: "failure",
      command: "update",
      targetProject: "future-reason",
      summary: "Update planning found conflicts.",
      issues: [
        {
          issueId: "update.conflicts",
          category: "update",
          severity: "error",
          component: "update-command",
          details: { conflictCount: 1 },
          impact: "Update planning found one or more path-level conflicts.",
          suggestedNextStep: "Inspect the conflict details before authorizing update writes.",
        },
      ],
      nextActions: ["Inspect the conflict details before authorizing update writes."],
      data: {
        updatePlan: { actions: [] },
        changedPaths: [],
        skippedPaths: [],
        conflicts: [
          {
            affectedPath: "_speclite/config.toml",
            ownership: "installer-owned",
            reason: "future-reason-code",
          },
        ],
        requiresConfirmation: true,
        writeAuthorized: false,
      },
    });

    expect(parsed.data.conflicts[0]?.reason).toBe("future-reason-code");
  });

  it("parses unknown future repair conflict reason codes without rejecting the command result", () => {
    const parsed = RepairCommandResultSchema.parse({
      schemaVersion: "speclite.command-result.v1",
      status: "failure",
      command: "update.repair",
      targetProject: "future-repair-reason",
      summary: "Repair planning found conflicts.",
      issues: [
        {
          issueId: "update.conflicts",
          category: "update",
          severity: "error",
          component: "update-command",
          details: { conflictCount: 1 },
          impact: "Update planning found one or more path-level conflicts.",
          suggestedNextStep: "Inspect the conflict details before authorizing update writes.",
        },
      ],
      nextActions: ["Inspect the conflict details before authorizing update writes."],
      data: {
        repairPlan: { actions: [] },
        changedPaths: [],
        skippedPaths: [],
        conflicts: [
          {
            affectedPath: "_speclite/config.toml",
            ownership: "installer-owned",
            reason: "future-repair-reason",
          },
        ],
        requiresConfirmation: true,
        writeAuthorized: false,
      },
    });

    expect(parsed.data.conflicts[0]?.reason).toBe("future-repair-reason");
  });

  it("gives CI consumers stable update and repair lifecycle states without private status semantics", () => {
    const planReady = createUpdateCommandResult({
      command: "update",
      targetProject: "ci-plan-ready",
      summary: "SpecLite update prepared an unapplied plan.",
      data: {
        updatePlan: {
          actions: [
            {
              affectedPath: "_speclite/config.toml",
              ownership: "installer-owned",
              action: "update",
              currentHash: "sha256:old",
              expectedHash: "sha256:new",
            },
          ],
        },
        changedPaths: [],
        skippedPaths: [],
        conflicts: [],
        requiresConfirmation: true,
        writeAuthorized: false,
      },
      nextActions: ["Review the update plan before authorizing writes."],
    });
    const applied = createUpdateCommandResult({
      command: "update",
      targetProject: "ci-applied",
      summary: "SpecLite update applied installer-owned changes.",
      data: {
        updatePlan: {
          actions: [
            {
              affectedPath: "_speclite/config.toml",
              ownership: "installer-owned",
              action: "update",
              currentHash: "sha256:old",
              expectedHash: "sha256:new",
            },
          ],
        },
        changedPaths: ["_speclite/config.toml"],
        skippedPaths: [],
        conflicts: [],
        requiresConfirmation: false,
        writeAuthorized: true,
      },
      nextActions: ["Run speclite validate after applying updates."],
    });
    const conflict = createUpdateCommandResult({
      command: "update",
      targetProject: "ci-conflict",
      summary: "SpecLite update found conflicts before apply.",
      data: {
        updatePlan: {
          actions: [
            {
              affectedPath: "_speclite/config.toml",
              ownership: "installer-owned",
              action: "conflict",
              currentHash: "sha256:drift",
              expectedHash: "sha256:expected",
            },
          ],
        },
        changedPaths: [],
        skippedPaths: [],
        conflicts: [
          {
            affectedPath: "_speclite/config.toml",
            ownership: "installer-owned",
            currentHash: "sha256:drift",
            expectedHash: "sha256:expected",
            reason: "installer-owned-drift",
          },
          {
            affectedPath: ".agents/skills/speclite-help/SKILL.md",
            ownership: "human-owned",
            reason: "human-owned",
          },
        ],
        requiresConfirmation: true,
        writeAuthorized: false,
      },
      nextActions: ["Resolve conflicts before authorizing writes."],
    });
    const noOpRepair = createRepairCommandResult({
      command: "update.repair",
      targetProject: "ci-repair-no-op",
      summary: "SpecLite repair found no writeable drift.",
      data: {
        repairPlan: {
          actions: [
            {
              affectedPath: "_speclite/config.toml",
              ownership: "installer-owned",
              currentHash: "sha256:same",
              expectedHash: "sha256:same",
              action: "skip",
              reason: "unchanged",
            },
          ],
        },
        changedPaths: [],
        skippedPaths: [],
        conflicts: [],
        requiresConfirmation: false,
        writeAuthorized: false,
      },
      nextActions: ["Continue with validation if needed."],
    });

    expect(planReady.exitCode).toBe(0);
    expect(planReady.result.status).toBe("success");
    expect(planReady.result.data.writeAuthorized).toBe(false);
    expect(planReady.result.data.changedPaths).toEqual([]);
    expect(planReady.result.data.updatePlan.actions.map((action) => action.action)).toEqual(["update"]);

    expect(applied.exitCode).toBe(0);
    expect(applied.result.status).toBe("success");
    expect(applied.result.data.writeAuthorized).toBe(true);
    expect(applied.result.data.changedPaths).toEqual(["_speclite/config.toml"]);

    expect(conflict.exitCode).toBe(1);
    expect(conflict.result.status).toBe("failure");
    expect(conflict.result.issues).toEqual([
      expect.objectContaining({
        issueId: "update.conflicts",
        category: "update",
        severity: "error",
        details: { conflictCount: 2 },
      }),
    ]);
    expect(conflict.result.data.conflicts.map((item) => item.affectedPath)).toEqual([
      ".agents/skills/speclite-help/SKILL.md",
      "_speclite/config.toml",
    ]);

    expect(noOpRepair.exitCode).toBe(0);
    expect(noOpRepair.result.status).toBe("success");
    expect(noOpRepair.result.command).toBe("update.repair");
    expect(noOpRepair.result.data.repairPlan.actions[0]).toMatchObject({
      action: "skip",
      reason: "unchanged",
    });
  });

  it("renders update Evidence profile with authorization, planned effects, protected boundaries, and --yes guidance", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-update-evidence-"));

    try {
      await mkdir(path.join(tempRoot, "_speclite/_config"), { recursive: true });
      await writeFile(path.join(tempRoot, "_speclite/config.toml"), "[core]\nproject_name = \"Base\"\n", "utf8");
      await writeFile(path.join(tempRoot, "canonical-config.toml"), "[core]\nproject_name = \"New\"\n", "utf8");
      await writeFile(
        path.join(tempRoot, "_speclite/_config/manifest.yaml"),
        [
          "paths:",
          "  artifactRoot: _speclite-output",
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
        "utf8",
      );
      await writeFile(
        path.join(tempRoot, "_speclite/_config/files-index.json"),
        `${JSON.stringify(
          {
            schemaVersion: "speclite.files-index.v1",
            entries: [
              {
                schemaVersion: "speclite.files-index.v1",
                path: "_speclite/config.toml",
                ownership: "installer-owned",
                hash: hashBytes("[core]\nproject_name = \"Base\"\n"),
                hashAlgorithm: "sha256",
                executable: false,
                artifactKind: "runtime-config",
                sourceRef: "canonical-config.toml",
              },
            ],
          },
          null,
          2,
        )}\n`,
        "utf8",
      );

      const result = await runUpdate(["update", tempRoot]);

      expect(result.exitCodes).toEqual([0]);
      expect(result.stdout).toContain("输出形式：证据");
      expect(result.stdout).toContain("Summary（摘要）");
      expect(result.stdout).toContain("update plan / planned effects（计划影响）");
      expect(result.stdout).toContain("_speclite/config.toml");
      expect(result.stdout).toContain("action=update");
      expect(result.stdout).toContain("授权状态");
      expect(result.stdout).toContain("requiresConfirmation=true");
      expect(result.stdout).toContain("writeAuthorized=false");
      expect(result.stdout).toContain("--yes");
      expect(result.stdout).toContain("受保护边界");
      expect(result.stdout).toContain("_speclite/custom");
      expect(result.stdout).toContain("尚未变更 path");
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("renders repair Evidence profile with repair plan, remaining conflicts, and validate next action", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-repair-evidence-"));

    try {
      await mkdir(path.join(tempRoot, "_speclite/_config"), { recursive: true });
      await writeFile(path.join(tempRoot, "_speclite/config.toml"), "[core]\nproject_name = \"Drift\"\n", "utf8");
      await writeFile(path.join(tempRoot, "canonical-config.toml"), "[core]\nproject_name = \"Canonical\"\n", "utf8");
      await writeTrustedManifest(tempRoot);
      await writeFile(
        path.join(tempRoot, "_speclite/_config/files-index.json"),
        `${JSON.stringify(
          {
            schemaVersion: "speclite.files-index.v1",
            entries: [
              {
                schemaVersion: "speclite.files-index.v1",
                path: "_speclite/config.toml",
                ownership: "installer-owned",
                hash: hashBytes("[core]\nproject_name = \"Base\"\n"),
                hashAlgorithm: "sha256",
                executable: false,
                artifactKind: "runtime-config",
                sourceRef: "canonical-config.toml",
              },
            ],
          },
          null,
          2,
        )}\n`,
        "utf8",
      );

      const result = await runUpdate(["update", tempRoot, "--repair"]);

      expect(result.exitCodes).toEqual([0]);
      expect(result.stdout).toContain("模式：repair");
      expect(result.stdout).toContain("repair plan / planned effects（修复影响）");
      expect(result.stdout).toContain("action=regenerate");
      expect(result.stdout).toContain("授权状态");
      expect(result.stdout).toContain("writeAuthorized=false");
      expect(result.stdout).toContain("剩余 conflicts");
      expect(result.stdout).toContain("无剩余 conflict");
      expect(result.stdout).toContain("speclite validate");
      expect(result.stdout).not.toContain("standalone report");
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("renders update and repair outcome labels without adding JSON fields", () => {
    const planReady = createUpdateCommandResult({
      command: "update",
      targetProject: "update-plan-ready",
      summary: "SpecLite update produced an unapplied pre-write update plan. No project files were changed.",
      data: {
        updatePlan: {
          actions: [
            {
              affectedPath: "_speclite/config.toml",
              ownership: "installer-owned",
              action: "update",
              currentHash: "sha256:old",
              expectedHash: "sha256:new",
            },
          ],
        },
        changedPaths: [],
        skippedPaths: [],
        conflicts: [],
        requiresConfirmation: true,
        writeAuthorized: false,
      },
      nextActions: ["Review the update plan before authorizing writes."],
    }).result;
    const repairPlanReady = createRepairCommandResult({
      command: "update.repair",
      targetProject: "repair-plan-ready",
      summary: "SpecLite update --repair produced an unapplied repair plan. No project files were changed.",
      data: {
        repairPlan: {
          actions: [
            {
              affectedPath: "_speclite/config.toml",
              ownership: "installer-owned",
              currentHash: "sha256:drift",
              expectedHash: "sha256:canonical",
              action: "regenerate",
            },
          ],
        },
        changedPaths: [],
        skippedPaths: [],
        conflicts: [],
        requiresConfirmation: true,
        writeAuthorized: false,
      },
      nextActions: ["Review the repair plan before authorizing repair writes."],
    }).result;
    const noOp = createUpdateCommandResult({
      command: "update",
      targetProject: "update-no-op",
      summary: "SpecLite update found no installer-owned planned updates. No project files were changed.",
      data: {
        updatePlan: { actions: [] },
        changedPaths: [],
        skippedPaths: [],
        conflicts: [],
        requiresConfirmation: false,
        writeAuthorized: false,
      },
      nextActions: [],
    }).result;
    const applied = createRepairCommandResult({
      command: "update.repair",
      targetProject: "repair-applied",
      summary: "SpecLite update --repair applied authorized installer-owned repair actions with safe write.",
      data: {
        repairPlan: {
          actions: [
            {
              affectedPath: "_speclite/config.toml",
              ownership: "installer-owned",
              currentHash: "sha256:drift",
              expectedHash: "sha256:canonical",
              action: "regenerate",
            },
          ],
        },
        changedPaths: ["_speclite/config.toml"],
        skippedPaths: [],
        conflicts: [],
        requiresConfirmation: false,
        writeAuthorized: true,
      },
      nextActions: ["Run speclite validate after repair."],
    }).result;

    expect(renderUpdateHumanOutput(planReady, { locale: "en-US" })).toContain("Outcome: plan-ready");
    expect(renderUpdateHumanOutput(planReady, { locale: "en-US" })).toContain("no project files have been written");
    expect(renderUpdateHumanOutput(planReady, { locale: "en-US" })).toContain("speclite update <target> --yes");
    expect(renderUpdateHumanOutput(repairPlanReady, { locale: "en-US" })).toContain("Outcome: repair-plan-ready");
    expect(renderUpdateHumanOutput(repairPlanReady, { locale: "en-US" })).toContain("explicit repair");
    expect(renderUpdateHumanOutput(noOp, { locale: "en-US" })).toContain("Outcome: no-op");
    expect(renderUpdateHumanOutput(noOp, { locale: "en-US" })).toContain("No planned writes");
    expect(renderUpdateHumanOutput(applied, { locale: "en-US" })).toContain("Outcome: applied");
    expect(renderUpdateHumanOutput(applied, { locale: "en-US" })).toContain("Changed Paths");
    expect(renderUpdateHumanOutput(applied, { locale: "en-US" })).toContain("Protected Boundaries");
    expect(renderUpdateHumanOutput(applied, { locale: "en-US" })).toContain("speclite validate");
    expect(renderCommandResultJson(planReady)).not.toContain("outcome");
    expect(UpdateCommandResultSchema.parse(planReady).data.updatePlan.actions.map((action) => action.affectedPath)).toEqual([
      "_speclite/config.toml",
    ]);
  });

  it("renders conflicts as blocked-by-conflict without ordinary --yes bypass guidance", () => {
    const conflict = createUpdateCommandResult({
      command: "update",
      targetProject: "update-conflict",
      summary: "SpecLite update found conflicts before apply. No project files were changed.",
      data: {
        updatePlan: {
          actions: [
            {
              affectedPath: "_speclite/config.toml",
              ownership: "installer-owned",
              action: "conflict",
              currentHash: "sha256:drift",
              expectedHash: "sha256:canonical",
            },
          ],
        },
        changedPaths: [],
        skippedPaths: [],
        conflicts: [
          {
            affectedPath: "_speclite/config.toml",
            ownership: "installer-owned",
            currentHash: "sha256:drift",
            expectedHash: "sha256:canonical",
            reason: "installer-owned-drift",
          },
        ],
        requiresConfirmation: true,
        writeAuthorized: false,
      },
      nextActions: ["Resolve conflicts before authorizing writes."],
    }).result;
    const output = renderUpdateHumanOutput(conflict, { locale: "en-US" });

    expect(output).toContain("Outcome: blocked-by-conflict");
    expect(output).toContain("affectedPath=_speclite/config.toml");
    expect(output).toContain("ownership=installer-owned");
    expect(output).toContain("reason=installer-owned-drift");
    expect(output).toContain("Protected Boundaries");
    expect(output).not.toContain("rerun with --yes");
    expect(conflict.issues).toHaveLength(1);
    expect(conflict.issues[0]?.details).toEqual({ conflictCount: 1 });
  });

  it("renders operation-lock, safe-write, and partial execution failures as partial-or-failed", () => {
    const operationLockFailure = createUpdateCommandResult({
      command: "update",
      targetProject: "operation-lock-failure",
      summary: "SpecLite update stopped before planning because the project operation lock is held.",
      data: {
        updatePlan: { actions: [] },
        changedPaths: [],
        skippedPaths: [],
        conflicts: [],
        requiresConfirmation: false,
        writeAuthorized: false,
      },
      issues: [
        {
          issueId: "operation-lock.project-locked",
          category: "operation-lock",
          severity: "error",
          component: "operation-lock",
          impact: "A write-capable update cannot start while another project operation is active.",
          suggestedNextStep: "Wait for the active operation to finish before rerunning update.",
        },
      ],
      nextActions: ["Wait for the active operation to finish before rerunning update."],
      commandCompleted: false,
    }).result;
    const safeWriteFailure = createRepairCommandResult({
      command: "update.repair",
      targetProject: "repair-safe-write-failure",
      summary: "SpecLite update --repair could not complete a safe write.",
      data: {
        repairPlan: {
          actions: [
            {
              affectedPath: "_speclite/config.toml",
              ownership: "installer-owned",
              currentHash: "sha256:drift",
              expectedHash: "sha256:canonical",
              action: "regenerate",
            },
          ],
        },
        changedPaths: ["_speclite/previous.toml"],
        skippedPaths: [],
        conflicts: [],
        requiresConfirmation: false,
        writeAuthorized: true,
      },
      issues: [
        {
          issueId: "file-integrity.safe-write-failed",
          category: "file-integrity",
          severity: "error",
          affectedPath: "_speclite/config.toml",
          component: "safe-write",
          details: {
            completedSteps: "changed:_speclite/previous.toml",
            failedStep: "repair:_speclite/config.toml",
            pendingSteps: "repair:_speclite/config.toml",
          },
          impact: "Safe write failed after repair entered the write stage.",
          suggestedNextStep: "Inspect completed writes, then rerun speclite update --repair after resolving the blocker.",
        },
      ],
      nextActions: ["Inspect completed writes, then rerun speclite update --repair after resolving the blocker."],
      commandCompleted: false,
    }).result;
    const partialExecutionFailure = createUpdateCommandResult({
      command: "update",
      targetProject: "update-partial-failure",
      summary: "SpecLite update failed after one planned write completed.",
      data: {
        updatePlan: {
          actions: [
            {
              affectedPath: "_speclite/config.toml",
              ownership: "installer-owned",
              action: "update",
              currentHash: "sha256:old",
              expectedHash: "sha256:new",
            },
            {
              affectedPath: "_speclite/_config/files-index.json",
              ownership: "installer-owned",
              action: "update",
              currentHash: "sha256:old-index",
              expectedHash: "sha256:new-index",
            },
          ],
        },
        changedPaths: ["_speclite/config.toml"],
        skippedPaths: [],
        conflicts: [],
        completedSteps: ["changed:_speclite/config.toml"],
        failedStep: "update:_speclite/_config/files-index.json",
        pendingSteps: ["update:_speclite/_config/files-index.json"],
        requiresConfirmation: false,
        writeAuthorized: true,
      },
      issues: [
        {
          issueId: "file-integrity.safe-write-failed",
          category: "file-integrity",
          severity: "error",
          affectedPath: "_speclite/_config/files-index.json",
          component: "safe-write",
          impact: "Safe write failed after update entered the write stage.",
          suggestedNextStep: "Inspect completed writes and rerun speclite update after resolving the blocker.",
        },
      ],
      nextActions: ["Inspect completed writes and rerun speclite update after resolving the blocker."],
      commandCompleted: false,
    }).result;

    for (const output of [
      renderUpdateHumanOutput(operationLockFailure, { locale: "en-US" }),
      renderUpdateHumanOutput(safeWriteFailure, { locale: "en-US" }),
      renderUpdateHumanOutput(partialExecutionFailure, { locale: "en-US" }),
    ]) {
      expect(output).toContain("Outcome: partial-or-failed");
      expect(output).toContain("write/repair execution did not fully complete");
      expect(output).toContain("Completed writes");
      expect(output).toContain("Failed step");
      expect(output).toContain("Pending steps");
      expect(output).toContain("Protected Boundaries");
      expect(output).toContain("rerun");
    }
    expect(partialExecutionFailure.issues).toHaveLength(1);
  });
});

async function runUpdate(args: string[]): Promise<{
  stdout: string;
  stderr: string;
  exitCodes: number[];
}> {
  const stdout: string[] = [];
  const stderr: string[] = [];
  const exitCodes: number[] = [];
  const program = createSpecliteProgram({
    io: {
      stdout: (text) => stdout.push(text),
      stderr: (text) => stderr.push(text),
      setExitCode: (code) => exitCodes.push(code),
    },
  });

  await program.parseAsync(["node", "speclite", ...args], { from: "node" });

  return {
    stdout: stdout.join(""),
    stderr: stderr.join(""),
    exitCodes,
  };
}

async function writeTrustedManifest(projectRoot: string): Promise<void> {
  await mkdir(path.join(projectRoot, "_speclite/_config"), { recursive: true });
  await writeFile(
    path.join(projectRoot, "_speclite/_config/manifest.yaml"),
    [
      "paths:",
      "  artifactRoot: _speclite-output",
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
    "utf8",
  );
}

async function assertNoUpdateWrites(
  projectRoot: string,
  options: { allowSpecliteRoot?: boolean } = {},
): Promise<void> {
  await expect(readFile(path.join(projectRoot, "README.md"), "utf8")).resolves.toBe("project notes\n");

  const forbiddenPaths = [
    ...(options.allowSpecliteRoot === true ? [] : ["_speclite"]),
    "_speclite-output",
    ".speclite-update.lock",
    "_speclite/_config/operation-lock.json",
  ];
  for (const forbiddenPath of forbiddenPaths) {
    await expect(stat(path.join(projectRoot, forbiddenPath))).rejects.toMatchObject({
      code: "ENOENT",
    });
  }
}
