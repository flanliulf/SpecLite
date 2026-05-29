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
import { createUpdateCommandResult } from "../src/diagnostics/command-result.js";

describe("update command placeholder", () => {
  it("registers speclite update --json as a non-write placeholder", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-update-placeholder-"));

    try {
      await writeFile(path.join(tempRoot, "README.md"), "project notes\n", "utf8");

      const result = await runUpdate(["update", tempRoot, "--json"]);
      const parsed = UpdateCommandResultSchema.parse(JSON.parse(result.stdout));

      expect(result.exitCodes).toEqual([1]);
      expect(parsed).toMatchObject({
        command: "update",
        status: "failure",
        targetProject: path.basename(tempRoot),
        issues: [
          {
            issueId: "update.not-implemented",
            category: "update",
            severity: "error",
            component: "update-command",
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
          conflicts: [],
        },
      });
      await assertNoUpdateWrites(tempRoot);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("registers speclite update --repair --json with stable update.repair command id", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-update-repair-placeholder-"));

    try {
      await mkdir(path.join(tempRoot, "docs"));
      await writeFile(path.join(tempRoot, "README.md"), "project notes\n", "utf8");
      await writeFile(path.join(tempRoot, "docs/notes.md"), "# Notes\n", "utf8");

      const result = await runUpdate(["update", tempRoot, "--repair", "--json"]);
      const parsed = RepairCommandResultSchema.parse(JSON.parse(result.stdout));

      expect(result.exitCodes).toEqual([1]);
      expect(parsed.command).toBe("update.repair");
      expect(parsed.status).toBe("failure");
      expect(parsed.issues).toEqual([
        expect.objectContaining({
          issueId: "update.repair-not-implemented",
          category: "update",
          severity: "error",
          component: "update-command",
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
        conflicts: [],
      });
      await assertNoUpdateWrites(tempRoot);
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

async function assertNoUpdateWrites(projectRoot: string): Promise<void> {
  await expect(readFile(path.join(projectRoot, "README.md"), "utf8")).resolves.toBe("project notes\n");

  for (const forbiddenPath of [
    "_speclite",
    "_speclite-output",
    ".speclite-update.lock",
    "_speclite/_config/operation-lock.json",
  ]) {
    await expect(stat(path.join(projectRoot, forbiddenPath))).rejects.toMatchObject({
      code: "ENOENT",
    });
  }
}
