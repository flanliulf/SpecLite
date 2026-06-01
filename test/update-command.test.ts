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
      expect(result.stdout).toContain("Output profile: Evidence");
      expect(result.stdout).toContain("Summary");
      expect(result.stdout).toContain("Update Plan / Planned Effects");
      expect(result.stdout).toContain("_speclite/config.toml");
      expect(result.stdout).toContain("action=update");
      expect(result.stdout).toContain("Authorization");
      expect(result.stdout).toContain("requiresConfirmation=true");
      expect(result.stdout).toContain("writeAuthorized=false");
      expect(result.stdout).toContain("--yes");
      expect(result.stdout).toContain("Protected Boundaries");
      expect(result.stdout).toContain("_speclite/custom");
      expect(result.stdout).toContain("No paths changed yet");
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
      expect(result.stdout).toContain("Mode: repair");
      expect(result.stdout).toContain("Repair Plan / Planned Effects");
      expect(result.stdout).toContain("action=regenerate");
      expect(result.stdout).toContain("Authorization");
      expect(result.stdout).toContain("writeAuthorized=false");
      expect(result.stdout).toContain("Remaining Conflicts");
      expect(result.stdout).toContain("No remaining conflicts");
      expect(result.stdout).toContain("speclite validate");
      expect(result.stdout).not.toContain("standalone report");
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
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
