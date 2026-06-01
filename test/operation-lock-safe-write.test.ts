import { mkdir, mkdtemp, readFile, readdir, rm, stat, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { runUpdateCommand } from "../src/commands/update.js";
import { RepairCommandResultSchema, UpdateCommandResultSchema } from "../src/diagnostics/command-result-schema.js";
import { acquireProjectOperationLock } from "../src/fs/operation-lock.js";
import { safeWriteFile } from "../src/fs/safe-write.js";
import { hashBytes } from "../src/manifest/hash.js";

describe("project operation lock", () => {
  it("creates a non-stable private lock file, rejects contention, and releases on controlled completion", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-operation-lock-"));

    try {
      const first = await acquireProjectOperationLock({
        projectRoot: tempRoot,
        operation: "update",
        now: new Date("2026-06-01T00:00:00.000Z"),
        pid: 12345,
      });
      expect(first.ok).toBe(true);
      if (!first.ok) return;

      const lockFile = JSON.parse(await readFile(path.join(tempRoot, "_speclite/.lock"), "utf8")) as Record<string, unknown>;
      expect(lockFile).toMatchObject({
        schemaVersion: "speclite.operation-lock.v1",
        operation: "update",
        pid: 12345,
        createdAt: "2026-06-01T00:00:00.000Z",
      });
      expect(lockFile.projectRootHash).toEqual(expect.stringMatching(/^sha256:/));

      const second = await acquireProjectOperationLock({
        projectRoot: tempRoot,
        operation: "update",
        now: new Date("2026-06-01T00:00:01.000Z"),
        pid: 12346,
      });
      expect(second).toEqual({
        ok: false,
        issue: expect.objectContaining({
          issueId: "operation-lock.project-locked",
          category: "operation-lock",
          severity: "error",
          affectedPath: "_speclite/.lock",
          details: { reason: "lock-file-exists" },
        }),
      });
      expect(JSON.stringify(second)).not.toContain(tempRoot);
      expect(JSON.stringify(second)).not.toContain("12345");
      expect(JSON.stringify(second)).not.toContain("2026-06-01T00:00:00.000Z");

      await first.lock.release();
      await expect(stat(path.join(tempRoot, "_speclite/.lock"))).rejects.toMatchObject({ code: "ENOENT" });
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("keeps update and update --repair public command paths non-reentrant before planning output", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-update-lock-contention-"));

    try {
      await writeInstalledState(tempRoot, [
        await filesIndexEntry(tempRoot, "_speclite/config.toml", "[core]\nproject_name = \"Base\"\n", {
          ownership: "installer-owned",
          sourceRef: "canonical/config.toml",
        }),
      ]);
      await writeProjectFile(tempRoot, "canonical/config.toml", "[core]\nproject_name = \"New\"\n");

      const lock = await acquireProjectOperationLock({ projectRoot: tempRoot, operation: "update" });
      expect(lock.ok).toBe(true);
      if (!lock.ok) return;

      const updateOutcome = await runUpdateCommand({
        options: { yes: true },
        runtime: { cwd: tempRoot, targetProject: "locked-update" },
      });
      const updateParsed = UpdateCommandResultSchema.parse(updateOutcome.result);

      expect(updateOutcome.exitCode).toBe(1);
      expect(updateParsed.status).toBe("failure");
      expect(updateParsed.issues).toEqual([
        expect.objectContaining({
          issueId: "operation-lock.project-locked",
          severity: "error",
        }),
      ]);
      expect(updateParsed.data).toMatchObject({
        updatePlan: { actions: [] },
        changedPaths: [],
        skippedPaths: [],
        conflicts: [],
        requiresConfirmation: false,
        writeAuthorized: false,
      });
      expect(JSON.stringify(updateParsed)).not.toContain("canonical/config.toml");

      const repairOutcome = await runUpdateCommand({
        options: { repair: true, yes: true },
        runtime: { cwd: tempRoot, targetProject: "locked-repair" },
      });
      const repairParsed = RepairCommandResultSchema.parse(repairOutcome.result);

      expect(repairOutcome.exitCode).toBe(1);
      expect(repairParsed.status).toBe("failure");
      expect(repairParsed.issues[0]).toMatchObject({
        issueId: "operation-lock.project-locked",
      });
      expect(repairParsed.data).toMatchObject({
        repairPlan: { actions: [] },
        changedPaths: [],
        skippedPaths: [],
        conflicts: [],
        requiresConfirmation: false,
        writeAuthorized: false,
      });

      await lock.lock.release();
      await expect(readFile(path.join(tempRoot, "_speclite/config.toml"), "utf8")).resolves.toBe(
        "[core]\nproject_name = \"Base\"\n",
      );
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });
});

describe("safe write primitive", () => {
  it("writes through a same-directory temp file marker and records changed path only after rename", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-safe-write-success-"));

    try {
      const result = await safeWriteFile({
        projectRoot: tempRoot,
        relativePath: "_speclite/config.toml",
        contents: "[core]\nproject_name = \"Safe\"\n",
        operationId: "fixture",
      });

      expect(result).toEqual({
        ok: true,
        path: "_speclite/config.toml",
        hash: hashBytes("[core]\nproject_name = \"Safe\"\n"),
        executable: false,
      });
      await expect(readFile(path.join(tempRoot, "_speclite/config.toml"), "utf8")).resolves.toBe(
        "[core]\nproject_name = \"Safe\"\n",
      );
      await expect(readdir(path.join(tempRoot, "_speclite"))).resolves.not.toContain(".speclite-tmp-fixture");
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("blocks path escape, symlink escape, case conflict, existing target and file/directory mismatch before mutation", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-safe-write-blockers-"));

    try {
      await mkdir(path.join(tempRoot, "_speclite"), { recursive: true });
      await mkdir(path.join(tempRoot, "outside"), { recursive: true });
      await writeFile(path.join(tempRoot, "_speclite/config.toml"), "original\n", "utf8");
      await mkdir(path.join(tempRoot, "_speclite/occupied"), { recursive: true });
      await writeFile(path.join(tempRoot, "_speclite/NewCase.toml"), "case\n", "utf8");
      await symlink(path.join(tempRoot, "outside"), path.join(tempRoot, "_speclite/link"));

      const cases = [
        {
          relativePath: "../escape.txt",
          issueId: "file-integrity.unsafe-overwrite-risk",
          reason: "path-escapes-project",
        },
        {
          relativePath: "_speclite/link/escape.txt",
          issueId: "artifact-path.symlink-escape",
          reason: "existing-path-segment-is-symlink",
        },
        {
          relativePath: "_speclite/newcase.toml",
          issueId: "file-integrity.case-conflict",
          reason: "case-insensitive-path-conflict",
        },
        {
          relativePath: "_speclite/new.toml",
          issueId: "file-integrity.unsafe-overwrite-risk",
          reason: "target-exists",
          prepare: () => writeFile(path.join(tempRoot, "_speclite/new.toml"), "exists\n", "utf8"),
        },
        {
          relativePath: "_speclite/occupied",
          issueId: "file-integrity.unsafe-overwrite-risk",
          reason: "target-is-directory",
          allowExisting: true,
        },
      ] as const;

      for (const testCase of cases) {
        await testCase.prepare?.();
        const result = await safeWriteFile({
          projectRoot: tempRoot,
          relativePath: testCase.relativePath,
          contents: "new\n",
          allowExisting: testCase.allowExisting,
        });

        expect(result).toEqual({
          ok: false,
          issue: expect.objectContaining({
            issueId: testCase.issueId,
            details: expect.objectContaining({ reason: testCase.reason }),
          }),
        });
      }

      await expect(readFile(path.join(tempRoot, "_speclite/config.toml"), "utf8")).resolves.toBe("original\n");
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("returns stable stale-temp diagnostics when cleanup after a failed temp write cannot remove the blocker", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-safe-write-cleanup-failure-"));

    try {
      await mkdir(path.join(tempRoot, "_speclite/.speclite-tmp-blocked"), { recursive: true });

      const result = await safeWriteFile({
        projectRoot: tempRoot,
        relativePath: "_speclite/config.toml",
        contents: "new\n",
        operationId: "blocked",
      });

      expect(result).toEqual({
        ok: false,
        issue: expect.objectContaining({
          issueId: "file-integrity.stale-temp-file",
          category: "file-integrity",
          severity: "error",
          affectedPath: "_speclite/.speclite-tmp-blocked",
          details: expect.objectContaining({
            reason: "cleanup-failed",
            failedStep: "cleanup-temp-file",
            pendingSteps: ["remove-stale-temp-file", "rerun-write"],
            manualAction: expect.stringContaining("remove any stale .speclite-tmp path"),
          }),
        }),
      });
      expect(JSON.stringify(result)).not.toContain(tempRoot);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("requires an installer-owned hash baseline before allowExisting overwrites", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-safe-write-baseline-"));
    const originalContents = "[core]\nproject_name = \"Base\"\n";
    const originalHash = hashBytes(originalContents);

    try {
      await mkdir(path.join(tempRoot, "_speclite/custom"), { recursive: true });
      await writeFile(path.join(tempRoot, "_speclite/config.toml"), originalContents, "utf8");
      await writeFile(path.join(tempRoot, "_speclite/custom/config.toml"), "# human\n", "utf8");
      await writeFile(path.join(tempRoot, "README.md"), "# readme\n", "utf8");

      const cases = [
        {
          name: "missing baseline",
          relativePath: "_speclite/config.toml",
          expectedExistingFile: undefined,
          expectedIssueId: "file-integrity.unsafe-overwrite-risk",
          reason: "missing-existing-file-baseline",
        },
        {
          name: "protected baseline ownership",
          relativePath: "_speclite/config.toml",
          expectedExistingFile: {
            ownership: "human-owned" as const,
            hash: originalHash,
          },
          expectedIssueId: "file-integrity.unsafe-overwrite-risk",
          reason: "protected-ownership",
        },
        {
          name: "protected path classification",
          relativePath: "_speclite/custom/config.toml",
          expectedExistingFile: {
            ownership: "installer-owned" as const,
            hash: hashBytes("# human\n"),
          },
          expectedIssueId: "file-integrity.unsafe-overwrite-risk",
          reason: "protected-ownership",
        },
        {
          name: "unknown path classification",
          relativePath: "README.md",
          expectedExistingFile: {
            ownership: "installer-owned" as const,
            hash: hashBytes("# readme\n"),
          },
          expectedIssueId: "file-integrity.unsafe-overwrite-risk",
          reason: "unknown-ownership",
        },
        {
          name: "baseline drift",
          relativePath: "_speclite/config.toml",
          expectedExistingFile: {
            ownership: "installer-owned" as const,
            hash: hashBytes("[core]\nproject_name = \"Old\"\n"),
          },
          expectedIssueId: "file-integrity.unsafe-overwrite-risk",
          reason: "baseline-hash-mismatch",
        },
      ];

      for (const testCase of cases) {
        const result = await safeWriteFile({
          projectRoot: tempRoot,
          relativePath: testCase.relativePath,
          contents: "new\n",
          allowExisting: true,
          ...(testCase.expectedExistingFile === undefined
            ? {}
            : { expectedExistingFile: testCase.expectedExistingFile }),
        });

        expect(result).toEqual({
          ok: false,
          issue: expect.objectContaining({
            issueId: testCase.expectedIssueId,
            details: expect.objectContaining({
              reason: testCase.reason,
            }),
          }),
        });
      }

      await mkdir(path.join(tempRoot, "_speclite/.speclite-tmp-leftover"), { recursive: true });
      const staleTempResult = await safeWriteFile({
        projectRoot: tempRoot,
        relativePath: "_speclite/config.toml",
        contents: "new\n",
        allowExisting: true,
        expectedExistingFile: {
          ownership: "installer-owned",
          hash: originalHash,
        },
      });
      expect(staleTempResult).toEqual({
        ok: false,
        issue: expect.objectContaining({
          issueId: "file-integrity.stale-temp-file",
          affectedPath: "_speclite/.speclite-tmp-leftover",
          details: expect.objectContaining({
            reason: "stale-temp-file-blocking",
            failedStep: "existing-target-preflight",
          }),
        }),
      });

      await rm(path.join(tempRoot, "_speclite/.speclite-tmp-leftover"), { recursive: true, force: true });
      const success = await safeWriteFile({
        projectRoot: tempRoot,
        relativePath: "_speclite/config.toml",
        contents: "new\n",
        allowExisting: true,
        expectedExistingFile: {
          ownership: "installer-owned",
          hash: originalHash,
        },
      });
      expect(success).toEqual({
        ok: true,
        path: "_speclite/config.toml",
        hash: hashBytes("new\n"),
        executable: false,
      });
      await expect(readFile(path.join(tempRoot, "_speclite/config.toml"), "utf8")).resolves.toBe("new\n");
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });
});

async function writeInstalledState(
  projectRoot: string,
  entries: Array<Record<string, unknown>>,
): Promise<void> {
  await mkdir(path.join(projectRoot, "_speclite/_config"), { recursive: true });
  await writeFile(path.join(projectRoot, "_speclite/config.toml"), "[core]\nproject_name = \"Base\"\n", "utf8");
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
      "",
    ].join("\n"),
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
    hash: hashBytes(contents),
    hashAlgorithm: "sha256",
    executable: false,
    artifactKind: "runtime-config",
    sourceRef: input.sourceRef,
  };
}
