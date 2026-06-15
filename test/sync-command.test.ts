import { chmod, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createSpecliteProgram } from "../src/bin/speclite.js";
import { SyncCommandResultSchema } from "../src/diagnostics/command-result-schema.js";
import { hashBytes } from "../src/manifest/hash.js";

describe("sync command source-to-mirror reconciliation", () => {
  it("plans installer-owned hook and control artifacts while preserving protected paths", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-sync-"));

    try {
      await mkdir(path.join(tempRoot, "_speclite/_config"), { recursive: true });
      await mkdir(path.join(tempRoot, "_speclite/custom"), { recursive: true });
      await mkdir(path.join(tempRoot, "_speclite/hooks/flow-gate-enforcement"), { recursive: true });
      await writeFile(path.join(tempRoot, "_speclite/config.toml"), "[core]\nproject_name = \"Old\"\n", "utf8");
      await writeFile(path.join(tempRoot, "canonical-config.toml"), "[core]\nproject_name = \"New\"\n", "utf8");
      await writeFile(path.join(tempRoot, "_speclite/custom/config.toml"), "human custom\n", "utf8");
      await writeFile(path.join(tempRoot, "_speclite/hooks/flow-gate-enforcement/runner.mjs"), "old runner\n", "utf8");
      await writeFile(path.join(tempRoot, "canonical-runner.mjs"), "new runner\n", "utf8");
      await writeTrustedManifest(tempRoot);
      await writeFilesIndex(tempRoot);

      const result = await runCli(["sync", tempRoot, "--json"]);
      const parsed = SyncCommandResultSchema.parse(JSON.parse(result.stdout));

      expect(result.exitCodes).toEqual([0]);
      expect(parsed.command).toBe("sync");
      expect(parsed.data.writeAuthorized).toBe(false);
      expect(parsed.data.syncPlan.actions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            affectedPath: "_speclite/config.toml",
            ownership: "installer-owned",
            action: "update",
          }),
          expect.objectContaining({
            affectedPath: "_speclite/hooks/flow-gate-enforcement/runner.mjs",
            ownership: "installer-owned",
            action: "update",
          }),
          expect.objectContaining({
            affectedPath: "_speclite/custom/config.toml",
            ownership: "human-owned",
            action: "skip",
            reason: "human-owned",
          }),
        ]),
      );
      expect(parsed.data.changedPaths).toEqual([]);
      await expect(readFile(path.join(tempRoot, "_speclite/hooks/flow-gate-enforcement/runner.mjs"), "utf8"))
        .resolves.toBe("old runner\n");
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("reports safe-write failure step state when authorized sync cannot mutate an installer-owned mirror", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-sync-safe-write-"));
    const hookRoot = path.join(tempRoot, "_speclite/hooks/flow-gate-enforcement");

    try {
      await mkdir(path.join(tempRoot, "_speclite/_config"), { recursive: true });
      await mkdir(hookRoot, { recursive: true });
      await writeFile(path.join(tempRoot, "_speclite/config.toml"), "[core]\nproject_name = \"Safe Write\"\n", "utf8");
      await writeFile(path.join(hookRoot, "runner.mjs"), "old runner\n", "utf8");
      await writeFile(path.join(tempRoot, "canonical-runner.mjs"), "new runner\n", "utf8");
      await writeTrustedManifest(tempRoot);
      await writeFile(
        path.join(tempRoot, "_speclite/_config/files-index.json"),
        `${JSON.stringify(
          {
            schemaVersion: "speclite.files-index.v1",
            entries: [
              {
                schemaVersion: "speclite.files-index.v1",
                path: "_speclite/hooks/flow-gate-enforcement/runner.mjs",
                ownership: "installer-owned",
                hash: hashBytes("old runner\n"),
                hashAlgorithm: "sha256",
                executable: true,
                artifactKind: "hook-runner",
                sourceRef: "canonical-runner.mjs",
              },
            ],
          },
          null,
          2,
        )}\n`,
        "utf8",
      );
      await chmod(hookRoot, 0o555);

      const result = await runCli(["sync", tempRoot, "--json", "--yes"]);
      const parsed = SyncCommandResultSchema.parse(JSON.parse(result.stdout));

      expect(result.exitCodes).toEqual([1]);
      expect(parsed.status).toBe("failure");
      expect(parsed.data.writeAuthorized).toBe(true);
      expect(parsed.data.failedStep).toBe("update:_speclite/hooks/flow-gate-enforcement/runner.mjs");
      expect(parsed.data.pendingSteps).toEqual([]);
      expect(parsed.issues).toEqual([
        expect.objectContaining({
          issueId: "file-integrity.stale-temp-file",
          category: "file-integrity",
          severity: "error",
          affectedPath: "_speclite/hooks/flow-gate-enforcement/runner.mjs",
          details: expect.objectContaining({
            reason: "safe-write-failed",
            failedStep: "update:_speclite/hooks/flow-gate-enforcement/runner.mjs",
          }),
        }),
      ]);
      await expect(readFile(path.join(hookRoot, "runner.mjs"), "utf8")).resolves.toBe("old runner\n");
    } finally {
      await chmod(hookRoot, 0o755).catch(() => undefined);
      await rm(tempRoot, { recursive: true, force: true });
    }
  });
});

async function writeFilesIndex(projectRoot: string): Promise<void> {
  await writeFile(
    path.join(projectRoot, "_speclite/_config/files-index.json"),
    `${JSON.stringify(
      {
        schemaVersion: "speclite.files-index.v1",
        entries: [
          {
            schemaVersion: "speclite.files-index.v1",
            path: "_speclite/config.toml",
            ownership: "installer-owned",
            hash: hashBytes("[core]\nproject_name = \"Old\"\n"),
            hashAlgorithm: "sha256",
            executable: false,
            artifactKind: "runtime-config",
            sourceRef: "canonical-config.toml",
          },
          {
            schemaVersion: "speclite.files-index.v1",
            path: "_speclite/custom/config.toml",
            ownership: "human-owned",
            hash: hashBytes("human custom\n"),
            hashAlgorithm: "sha256",
            executable: false,
            artifactKind: "human-custom-config",
            sourceRef: "generated:human-custom-config",
          },
          {
            schemaVersion: "speclite.files-index.v1",
            path: "_speclite/hooks/flow-gate-enforcement/runner.mjs",
            ownership: "installer-owned",
            hash: hashBytes("old runner\n"),
            hashAlgorithm: "sha256",
            executable: true,
            artifactKind: "hook-runner",
            sourceRef: "canonical-runner.mjs",
          },
        ],
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
}

async function writeTrustedManifest(projectRoot: string): Promise<void> {
  await writeFile(
    path.join(projectRoot, "_speclite/_config/manifest.yaml"),
    [
      "schemaVersion: speclite.manifest.v1",
      "sourceDescriptor:",
      "  sourceType: bundled",
      "  resolvedRoot: assets/source/speclite",
      "  trustStatus: trusted",
      "  integrityEvidence:",
      "    - kind: content-hash",
      "      algorithm: sha256",
      "      value: fixture-source",
      "      verified: true",
      "installedModules: []",
      "targetIds: []",
      "paths:",
      "  projectRoot: .",
      "  specliteRoot: _speclite",
      "  artifactRoot: _speclite-output",
      "  manifestPath: _speclite/_config/manifest.yaml",
    ].join("\n"),
    "utf8",
  );
}

async function runCli(args: string[]): Promise<{
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
