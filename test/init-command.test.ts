import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createSpecliteProgram } from "../src/bin/speclite.js";
import { runInitCommand } from "../src/commands/init.js";
import { InitCommandResultSchema } from "../src/diagnostics/command-result-schema.js";

describe("init command project config planning", () => {
  it("creates fresh project config with safe write when explicitly authorized", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-init-fresh-"));
    const originalCwd = process.cwd();

    try {
      process.chdir(tempRoot);
      const outcome = await runInitCommand({
        options: { yes: true, json: true },
        runtime: {
          cwd: tempRoot,
          targetProject: "fresh-init",
        },
      });
      const parsed = InitCommandResultSchema.parse(outcome.result);

      expect(outcome.exitCode).toBe(0);
      expect(parsed).toMatchObject({
        command: "init",
        status: "success",
        targetProject: "fresh-init",
        data: {
          changedPaths: [
            "_speclite/config.toml",
            "_speclite/config.user.toml",
            "_speclite/custom/config.toml",
            "_speclite/custom/config.user.toml",
          ],
          conflicts: [],
          completedSteps: ["read-installed-state", "plan-project-config", "write-project-config"],
          pendingSteps: [],
          requiresConfirmation: false,
          writeAuthorized: true,
        },
      });

      await expect(readFile(path.join(tempRoot, "_speclite/config.toml"), "utf8")).resolves.toContain(
        "[core]",
      );
      await expect(readFile(path.join(tempRoot, "_speclite/config.user.toml"), "utf8")).resolves.toContain(
        "user_name",
      );
    } finally {
      process.chdir(originalCwd);
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("plans existing installed-state config rebuild without writing when not authorized", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-init-existing-plan-"));

    try {
      await writeInstalledState(tempRoot);
      const originalConfig = await readFile(path.join(tempRoot, "_speclite/config.toml"), "utf8");

      const outcome = await runInitCommand({
        runtime: {
          cwd: tempRoot,
          targetProject: "existing-init",
        },
      });
      const parsed = InitCommandResultSchema.parse(outcome.result);

      expect(outcome.exitCode).toBe(0);
      expect(parsed.data.installedState).toMatchObject({
        manifestPresent: true,
        ownershipIndexPresent: true,
        installedModules: ["core", "sdlc"],
        ideTargets: ["claude"],
      });
      expect(parsed.data.initPlan.actions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            affectedPath: "_speclite/config.toml",
            ownership: "installer-owned",
            action: "update",
          }),
          expect.objectContaining({
            affectedPath: "_speclite/config.user.toml",
            ownership: "installer-owned",
            action: "update",
          }),
        ]),
      );
      expect(parsed.data.requiresConfirmation).toBe(true);
      expect(parsed.data.writeAuthorized).toBe(false);
      await expect(readFile(path.join(tempRoot, "_speclite/config.toml"), "utf8")).resolves.toBe(
        originalConfig,
      );
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("preserves existing human-owned custom config during authorized init", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-init-custom-protect-"));

    try {
      await mkdir(path.join(tempRoot, "_speclite/custom"), { recursive: true });
      const customConfig = "# keep team custom\n[core]\nproject_name = \"Custom\"\n";
      const customUserConfig = "# keep user custom\n";
      await writeFile(path.join(tempRoot, "_speclite/custom/config.toml"), customConfig, "utf8");
      await writeFile(path.join(tempRoot, "_speclite/custom/config.user.toml"), customUserConfig, "utf8");

      const outcome = await runInitCommand({
        options: { yes: true },
        runtime: {
          cwd: tempRoot,
          targetProject: "custom-protect",
        },
      });
      const parsed = InitCommandResultSchema.parse(outcome.result);

      expect(outcome.exitCode).toBe(0);
      expect(parsed.data.initPlan.actions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            affectedPath: "_speclite/custom/config.toml",
            ownership: "human-owned",
            action: "skip",
            reason: "protected-existing-human-owned-stub",
          }),
          expect.objectContaining({
            affectedPath: "_speclite/custom/config.user.toml",
            ownership: "human-owned",
            action: "skip",
            reason: "protected-existing-human-owned-stub",
          }),
        ]),
      );
      await expect(readFile(path.join(tempRoot, "_speclite/custom/config.toml"), "utf8")).resolves.toBe(
        customConfig,
      );
      await expect(readFile(path.join(tempRoot, "_speclite/custom/config.user.toml"), "utf8")).resolves.toBe(
        customUserConfig,
      );
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("registers speclite init --json with CommandResult output", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-init-cli-"));
    const stdout: string[] = [];
    const exitCodes: number[] = [];

    try {
      const program = createSpecliteProgram({
        io: {
          stdout: (text) => stdout.push(text),
          stderr: () => undefined,
          setExitCode: (code) => exitCodes.push(code),
        },
        runtime: {
          cwd: tempRoot,
          targetProject: "cli-init",
        },
      });

      await program.parseAsync(["node", "speclite", "init", "--json", "--yes"], { from: "node" });
      const parsed = InitCommandResultSchema.parse(JSON.parse(stdout.join("")));

      expect(exitCodes).toEqual([0]);
      expect(parsed.command).toBe("init");
      expect(parsed.data.writeAuthorized).toBe(true);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });
});

async function writeInstalledState(projectRoot: string): Promise<void> {
  await mkdir(path.join(projectRoot, "_speclite/_config"), { recursive: true });
  await writeFile(
    path.join(projectRoot, "_speclite/config.toml"),
    '[core]\nproject_name = "Existing"\ndocument_output_language = "Chinese"\noutput_folder = "_speclite-output"\n',
    "utf8",
  );
  await writeFile(
    path.join(projectRoot, "_speclite/config.user.toml"),
    '[core]\nuser_name = "Ada"\ncommunication_language = "Chinese"\n',
    "utf8",
  );
  await writeFile(
    path.join(projectRoot, "_speclite/_config/manifest.yaml"),
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
      '  - "sdlc"',
      "targetIds:",
      '  - "claude"',
      "paths:",
      '  projectRoot: "."',
      '  specliteRoot: "_speclite"',
      '  artifactRoot: "_speclite-output"',
      '  manifestPath: "_speclite/_config/manifest.yaml"',
      "",
    ].join("\n"),
    "utf8",
  );
  await writeFile(
    path.join(projectRoot, "_speclite/_config/files-index.json"),
    JSON.stringify(
      {
        schemaVersion: "speclite.files-index.v1",
        entries: [
          {
            schemaVersion: "speclite.files-index.v1",
            path: "_speclite/config.toml",
            ownership: "installer-owned",
            hash: "sha256:old-config",
            hashAlgorithm: "sha256",
            executable: false,
            artifactKind: "project-config",
            sourceRef: "local:config",
          },
          {
            schemaVersion: "speclite.files-index.v1",
            path: "_speclite/config.user.toml",
            ownership: "installer-owned",
            hash: "sha256:old-user-config",
            hashAlgorithm: "sha256",
            executable: false,
            artifactKind: "project-config",
            sourceRef: "local:config-user",
          },
        ],
      },
      null,
      2,
    ),
    "utf8",
  );
}
