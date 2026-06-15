import { mkdir, mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createSpecliteProgram } from "../src/bin/speclite.js";
import { UninstallCommandResultSchema } from "../src/diagnostics/command-result-schema.js";
import { hashBytes } from "../src/manifest/hash.js";

describe("uninstall command safety", () => {
  it("removes only installer-owned files and preserves custom and workflow-owned artifacts", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-uninstall-"));

    try {
      await mkdir(path.join(tempRoot, "_speclite/_config"), { recursive: true });
      await mkdir(path.join(tempRoot, "_speclite/custom"), { recursive: true });
      await mkdir(path.join(tempRoot, "_speclite/hooks/flow-gate-enforcement"), { recursive: true });
      await mkdir(path.join(tempRoot, "_speclite/scripts/tool"), { recursive: true });
      await mkdir(path.join(tempRoot, "_speclite-output/reports"), { recursive: true });
      await writeFile(path.join(tempRoot, "_speclite/config.toml"), "installer config\n", "utf8");
      await writeFile(path.join(tempRoot, "_speclite/hooks/flow-gate-enforcement/runner.mjs"), "runner\n", "utf8");
      await writeFile(path.join(tempRoot, "_speclite/scripts/tool/run.mjs"), "tool runner\n", "utf8");
      await writeFile(path.join(tempRoot, "_speclite/custom/config.toml"), "human custom\n", "utf8");
      await writeFile(path.join(tempRoot, "_speclite-output/reports/review.md"), "workflow artifact\n", "utf8");
      await writeFilesIndex(tempRoot);
      await writeTrustedManifest(tempRoot);

      const result = await runCli(["uninstall", tempRoot, "--json", "--yes"]);
      const parsed = UninstallCommandResultSchema.parse(JSON.parse(result.stdout));

      expect(result.exitCodes).toEqual([0]);
      expect(parsed.command).toBe("uninstall");
      expect(parsed.data.writeAuthorized).toBe(true);
      expect(parsed.data.removedPaths).toEqual([
        "_speclite/config.toml",
        "_speclite/hooks/flow-gate-enforcement/runner.mjs",
        "_speclite/scripts/tool",
      ]);
      expect(parsed.data.preservedPaths).toEqual([
        "_speclite-output/reports/review.md",
        "_speclite/custom/config.toml",
      ]);
      await expect(stat(path.join(tempRoot, "_speclite/config.toml"))).rejects.toMatchObject({ code: "ENOENT" });
      await expect(stat(path.join(tempRoot, "_speclite/hooks/flow-gate-enforcement/runner.mjs"))).rejects.toMatchObject({
        code: "ENOENT",
      });
      await expect(stat(path.join(tempRoot, "_speclite/scripts/tool"))).rejects.toMatchObject({ code: "ENOENT" });
      await expect(readFile(path.join(tempRoot, "_speclite/custom/config.toml"), "utf8")).resolves.toBe("human custom\n");
      await expect(readFile(path.join(tempRoot, "_speclite-output/reports/review.md"), "utf8")).resolves.toBe(
        "workflow artifact\n",
      );
    } finally {
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
            hash: hashBytes("installer config\n"),
            hashAlgorithm: "sha256",
            executable: false,
            artifactKind: "runtime-config",
            sourceRef: "generated:runtime-config",
          },
          {
            schemaVersion: "speclite.files-index.v1",
            path: "_speclite/hooks/flow-gate-enforcement/runner.mjs",
            ownership: "installer-owned",
            hash: hashBytes("runner\n"),
            hashAlgorithm: "sha256",
            executable: true,
            artifactKind: "hook-runner",
            sourceRef: "assets/source/speclite/hooks/flow-gate-enforcement/runner.mjs",
          },
          {
            schemaVersion: "speclite.files-index.v1",
            path: "_speclite/scripts/tool",
            ownership: "installer-owned",
            hash: hashBytes("tool runner\n"),
            hashAlgorithm: "sha256",
            executable: false,
            artifactKind: "installer-directory",
            sourceRef: "generated:installer-directory",
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
            path: "_speclite-output/reports/review.md",
            ownership: "workflow-owned",
            hash: hashBytes("workflow artifact\n"),
            hashAlgorithm: "sha256",
            executable: false,
            artifactKind: "workflow-artifact",
            sourceRef: "generated:workflow-artifact",
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
      "  integrityEvidence: []",
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
