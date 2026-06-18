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
      await mkdir(path.join(tempRoot, "_speclite/scripts"), { recursive: true });
      await mkdir(path.join(tempRoot, "_speclite-output/reports"), { recursive: true });
      await writeFile(path.join(tempRoot, "_speclite/config.toml"), "installer config\n", "utf8");
      await writeFile(path.join(tempRoot, "_speclite/hooks/flow-gate-enforcement/runner.mjs"), "runner\n", "utf8");
      await writeFile(path.join(tempRoot, "_speclite/scripts/tool/run.mjs"), "tool runner\n", "utf8");
      await writeFile(path.join(tempRoot, "_speclite/scripts/resolve_config.py"), "compat config\n", "utf8");
      await writeFile(
        path.join(tempRoot, "_speclite/scripts/resolve_customization.py"),
        "compat customization\n",
        "utf8",
      );
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
        "_speclite/_config/files-index.json",
        "_speclite/config.toml",
        "_speclite/hooks/flow-gate-enforcement/runner.mjs",
        "_speclite/scripts/resolve_config.py",
        "_speclite/scripts/resolve_customization.py",
        "_speclite/scripts/tool",
      ]);
      expect(parsed.data.preservedPaths).toEqual([
        "_speclite-output/reports/review.md",
        "_speclite/custom/config.toml",
      ]);
      await expect(stat(path.join(tempRoot, "_speclite/_config/files-index.json"))).rejects.toMatchObject({
        code: "ENOENT",
      });
      await expect(stat(path.join(tempRoot, "_speclite/config.toml"))).rejects.toMatchObject({ code: "ENOENT" });
      await expect(stat(path.join(tempRoot, "_speclite/hooks/flow-gate-enforcement/runner.mjs"))).rejects.toMatchObject({
        code: "ENOENT",
      });
      await expect(stat(path.join(tempRoot, "_speclite/scripts/resolve_config.py"))).rejects.toMatchObject({
        code: "ENOENT",
      });
      await expect(stat(path.join(tempRoot, "_speclite/scripts/resolve_customization.py"))).rejects.toMatchObject({
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

  it("removes installed-state markers so install can run again after uninstall", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-uninstall-rerun-install-"));

    try {
      await mkdir(path.join(tempRoot, "_speclite/_config"), { recursive: true });
      await writeFile(path.join(tempRoot, "_speclite/config.toml"), "installer config\n", "utf8");
      await writeFilesIndex(tempRoot);

      const uninstallResult = await runCli(["uninstall", tempRoot, "--json", "--yes"]);
      const uninstallParsed = UninstallCommandResultSchema.parse(JSON.parse(uninstallResult.stdout));

      expect(uninstallResult.exitCodes).toEqual([0]);
      expect(uninstallParsed.data.removedPaths).toContain("_speclite/config.toml");
      await expect(stat(path.join(tempRoot, "_speclite/config.toml"))).rejects.toMatchObject({ code: "ENOENT" });
      await expect(stat(path.join(tempRoot, "_speclite/_config/files-index.json"))).rejects.toMatchObject({
        code: "ENOENT",
      });
      await expect(stat(path.join(tempRoot, "_speclite/_config"))).rejects.toMatchObject({ code: "ENOENT" });

      const installResult = await runCli(["install", tempRoot, "--json", "--yes"]);
      const installParsed = JSON.parse(installResult.stdout) as {
        command: string;
        status: string;
        data: { completedSteps: string[]; pendingSteps: string[] };
      };

      expect(installResult.exitCodes).toEqual([0]);
      expect(installParsed.command).toBe("install");
      expect(installParsed.status).toBe("success");
      expect(installParsed.data.completedSteps).toContain("ready-summary");
      expect(installParsed.data.pendingSteps).toEqual([]);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("removes installer-owned platform hook configs so install can run again after uninstall", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-uninstall-hook-configs-"));

    try {
      await mkdir(path.join(tempRoot, "_speclite/_config"), { recursive: true });
      await mkdir(path.join(tempRoot, ".claude"), { recursive: true });
      await mkdir(path.join(tempRoot, ".codex"), { recursive: true });
      const claudeSettings = `${JSON.stringify({ hooks: { UserPromptSubmit: [{ command: "speclite" }] } }, null, 2)}\n`;
      const codexHooks = `${JSON.stringify({ hooks: [{ id: "speclite", command: "speclite" }] }, null, 2)}\n`;
      await writeFile(path.join(tempRoot, ".claude/settings.json"), claudeSettings, "utf8");
      await writeFile(path.join(tempRoot, ".codex/hooks.json"), codexHooks, "utf8");
      await writePlatformHookFilesIndex(tempRoot, { claudeSettings, codexHooks });

      const uninstallResult = await runCli(["uninstall", tempRoot, "--json", "--yes"]);
      const uninstallParsed = UninstallCommandResultSchema.parse(JSON.parse(uninstallResult.stdout));

      expect(uninstallResult.exitCodes).toEqual([0]);
      expect(uninstallParsed.data.removedPaths).toContain(".claude/settings.json");
      expect(uninstallParsed.data.removedPaths).toContain(".codex/hooks.json");
      await expect(stat(path.join(tempRoot, ".claude/settings.json"))).rejects.toMatchObject({ code: "ENOENT" });
      await expect(stat(path.join(tempRoot, ".codex/hooks.json"))).rejects.toMatchObject({ code: "ENOENT" });

      const installResult = await runCli(["install", tempRoot, "--json", "--yes"]);
      const installParsed = JSON.parse(installResult.stdout) as {
        command: string;
        status: string;
        data: { completedSteps: string[]; pendingSteps: string[] };
      };

      expect(installResult.exitCodes).toEqual([0]);
      expect(installParsed.command).toBe("install");
      expect(installParsed.status).toBe("success");
      expect(installParsed.data.completedSteps).toContain("ready-summary");
      expect(installParsed.data.pendingSteps).toEqual([]);
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
            path: "_speclite/scripts/resolve_config.py",
            ownership: "installer-owned",
            hash: hashBytes("compat config\n"),
            hashAlgorithm: "sha256",
            executable: true,
            artifactKind: "runtime-compat-script",
            sourceRef: "assets/source/speclite/scripts/resolve_config.py",
          },
          {
            schemaVersion: "speclite.files-index.v1",
            path: "_speclite/scripts/resolve_customization.py",
            ownership: "installer-owned",
            hash: hashBytes("compat customization\n"),
            hashAlgorithm: "sha256",
            executable: true,
            artifactKind: "runtime-compat-script",
            sourceRef: "assets/source/speclite/scripts/resolve_customization.py",
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

async function writePlatformHookFilesIndex(
  projectRoot: string,
  input: { claudeSettings: string; codexHooks: string },
): Promise<void> {
  await writeFile(
    path.join(projectRoot, "_speclite/_config/files-index.json"),
    `${JSON.stringify(
      {
        schemaVersion: "speclite.files-index.v1",
        entries: [
          {
            schemaVersion: "speclite.files-index.v1",
            path: ".claude/settings.json",
            ownership: "installer-owned",
            hash: hashBytes(input.claudeSettings),
            hashAlgorithm: "sha256",
            executable: false,
            artifactKind: "platform-hook-config",
            sourceRef: "generated:claude-hook-registry-config",
          },
          {
            schemaVersion: "speclite.files-index.v1",
            path: ".codex/hooks.json",
            ownership: "installer-owned",
            hash: hashBytes(input.codexHooks),
            hashAlgorithm: "sha256",
            executable: false,
            artifactKind: "platform-hook-config",
            sourceRef: "generated:codex-hook-registry-config",
          },
        ],
      },
      null,
      2,
    )}\n`,
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
