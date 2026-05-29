import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { runInstallCommand } from "../src/commands/install.js";
import { parseConfigToml } from "../src/config/config-reader.js";
import { serializeConfigToml } from "../src/config/config-writer.js";
import { renderCommandResultJson, renderInstallHumanOutput } from "../src/diagnostics/output.js";
import { createConfigInitializationPlan } from "../src/installer/config-initialization.js";
import { discoverOfficialModules } from "../src/modules/module-metadata.js";

const supportedRuntime = {
  nodeVersion: "v22.12.0",
  platform: "darwin",
  platformRelease: "23.0.0",
} as const;

describe("project config initialization", () => {
  it("builds quick config from module metadata defaults with trim and empty fallback", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-config-defaults-"));

    try {
      const selectedModules = await discoverOfficialModules({ projectRoot: process.cwd() });
      const result = await createConfigInitializationPlan({
        targetRoot: tempRoot,
        targetProject: "demo-app",
        mode: "quick",
        selectedModules,
        values: {
          user_name: " Ada ",
          project_name: "   ",
          output_folder: " custom-output ",
        },
        targetAdapters: [{ targetId: "claude", targetDirectory: ".claude/skills", status: "planned" }],
      });

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.model.core).toMatchObject({
        project_name: "demo-app",
        user_name: "Ada",
        communication_language: "Chinese",
        document_output_language: "Chinese",
        output_folder: "custom-output",
      });
      expect(result.model.modules.sdlc).toMatchObject({
        user_skill_level: "intermediate",
        planning_artifacts: "custom-output/planning-artifacts",
        implementation_artifacts: "custom-output/implementation-artifacts",
        project_knowledge: "docs",
      });
      expect(result.configToml.core).not.toHaveProperty("user_name");
      expect(result.configUserToml.core).toMatchObject({
        user_name: "Ada",
        communication_language: "Chinese",
      });
      expect(result.summary).toContain("Config mode: quick");
      expect(result.summary).toContain("Planned config paths: _speclite/config.toml, _speclite/config.user.toml");
      expect(result.summary).not.toContain(tempRoot);
      expect(result.plannedWrites).toEqual([
        expect.objectContaining({
          path: "_speclite/config.toml",
          ownership: "installer-owned",
          action: "create",
        }),
        expect.objectContaining({
          path: "_speclite/config.user.toml",
          ownership: "installer-owned",
          action: "create",
        }),
        expect.objectContaining({
          path: "_speclite/custom/config.toml",
          ownership: "human-owned",
          action: "create",
        }),
        expect.objectContaining({
          path: "_speclite/custom/config.user.toml",
          ownership: "human-owned",
          action: "create",
        }),
      ]);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("round trips generated installer-owned TOML without using example files", async () => {
    const selectedModules = await discoverOfficialModules({ projectRoot: process.cwd() });
    const result = await createConfigInitializationPlan({
      targetRoot: process.cwd(),
      targetProject: "round-trip",
      mode: "detailed",
      selectedModules,
      values: {
        user_skill_level: "expert",
        planning_artifacts: "_speclite-output/plans",
      },
      selectedModuleIds: ["core", "sdlc"],
      ideTargetIds: ["agents"],
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const parsedConfig = parseConfigToml(serializeConfigToml(result.configToml));
    const parsedUserConfig = parseConfigToml(serializeConfigToml(result.configUserToml));

    expect(parsedConfig).toMatchObject({
      core: {
        project_name: "round-trip",
        document_output_language: "Chinese",
        output_folder: "_speclite-output",
      },
      modules: {
        sdlc: {
          planning_artifacts: "_speclite-output/plans",
          implementation_artifacts: "_speclite-output/implementation-artifacts",
          project_knowledge: "docs",
        },
      },
    });
    expect(parsedUserConfig).toMatchObject({
      core: {
        user_name: "SpecLite",
        communication_language: "Chinese",
      },
      modules: {
        sdlc: {
          user_skill_level: "expert",
        },
      },
    });
  });

  it("protects existing human-owned project config stubs without reading or rewriting content", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-config-stubs-"));

    try {
      await mkdir(path.join(tempRoot, "_speclite/custom"), { recursive: true });
      const customConfig = "# hand edited\n[core]\nproject_name = \"keep\"\n";
      const customUserConfig = "# user comments stay\n";
      await writeFile(path.join(tempRoot, "_speclite/custom/config.toml"), customConfig, "utf8");
      await writeFile(
        path.join(tempRoot, "_speclite/custom/config.user.toml"),
        customUserConfig,
        "utf8",
      );

      const selectedModules = await discoverOfficialModules({ projectRoot: process.cwd() });
      const result = await createConfigInitializationPlan({
        targetRoot: tempRoot,
        targetProject: "stubbed",
        mode: "quick",
        selectedModules,
      });

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.plannedWrites).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: "_speclite/custom/config.toml",
            ownership: "human-owned",
            action: "skip",
            reason: "protected-existing-human-owned-stub",
          }),
          expect.objectContaining({
            path: "_speclite/custom/config.user.toml",
            ownership: "human-owned",
            action: "skip",
            reason: "protected-existing-human-owned-stub",
          }),
        ]),
      );
      await expect(readFile(path.join(tempRoot, "_speclite/custom/config.toml"), "utf8")).resolves.toBe(
        customConfig,
      );
      await expect(
        readFile(path.join(tempRoot, "_speclite/custom/config.user.toml"), "utf8"),
      ).resolves.toBe(customUserConfig);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("rejects artifact paths that escape the target project before planned writes", async () => {
    const selectedModules = await discoverOfficialModules({ projectRoot: process.cwd() });
    const result = await createConfigInitializationPlan({
      targetRoot: process.cwd(),
      targetProject: "escape",
      mode: "quick",
      selectedModules,
      values: {
        output_folder: "../outside",
      },
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
	    expect(result.issues).toEqual([
	      expect.objectContaining({
	        issueId: "artifact-path.escapes-project",
	        category: "artifact-path",
	        severity: "error",
	        affectedPath: "project-config:output_folder",
	      }),
	    ]);
	    expect(result.plannedWrites).toEqual([]);
	  });

	  it("redacts rejected sensitive artifact paths from public JSON and human output", async () => {
	    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-config-redaction-"));
	    const sensitivePath = "/Users/alice/.npm/_cacache/secret-token";

	    try {
	      await writeFile(path.join(tempRoot, "README.md"), "project notes\n", "utf8");

	      const outcome = await runInstallCommand({
	        options: { yes: true },
	        runtime: {
	          ...supportedRuntime,
	          cwd: tempRoot,
	        },
	        configureProject: async () => ({
	          mode: "detailed",
	          values: {
	            output_folder: sensitivePath,
	          },
	        }),
	      });

	      expect(outcome.exitCode).toBe(1);
	      expect(outcome.result.status).toBe("failure");
	      expect(outcome.result.issues).toEqual([
	        expect.objectContaining({
	          issueId: "artifact-path.escapes-project",
	          affectedPath: "project-config:output_folder",
	          details: {
	            field: "output_folder",
	            reason: "path-escapes-project",
	          },
	        }),
	      ]);

	      const jsonOutput = renderCommandResultJson(outcome.result);
	      const humanOutput = renderInstallHumanOutput(outcome.result);
	      for (const output of [jsonOutput, humanOutput, JSON.stringify(outcome.result)]) {
	        expect(output).not.toContain(sensitivePath);
	        expect(output).not.toContain("/Users/alice");
	        expect(output).not.toContain("secret-token");
	      }
	    } finally {
	      await rm(tempRoot, { recursive: true, force: true });
	    }
	  });

	  it("redacts home, drive-letter and credential-bearing rejected artifact paths", async () => {
	    const selectedModules = await discoverOfficialModules({ projectRoot: process.cwd() });

	    for (const sensitivePath of [
	      "~/private/output",
	      "C:\\Users\\alice\\private-output",
	      "https://alice:token@example.com/artifacts",
	    ]) {
	      const result = await createConfigInitializationPlan({
	        targetRoot: process.cwd(),
	        targetProject: "redacted",
	        mode: "detailed",
	        selectedModules,
	        values: {
	          output_folder: sensitivePath,
	        },
	      });

	      expect(result.ok).toBe(false);
	      if (result.ok) continue;

	      const serializedIssues = JSON.stringify(result.issues);
	      expect(result.issues[0]).toMatchObject({
	        issueId: "artifact-path.escapes-project",
	        affectedPath: "project-config:output_folder",
	      });
	      expect(serializedIssues).not.toContain(sensitivePath);
	      expect(serializedIssues).not.toContain("alice");
	      expect(serializedIssues).not.toContain("token");
	    }
	  });

  it("uses trimmed project config name as install targetProject display name", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-install-config-name-"));

    try {
      await mkdir(path.join(tempRoot, "_speclite"), { recursive: true });
      await writeFile(
        path.join(tempRoot, "_speclite/config.toml"),
        '[core]\nproject_name = " 项目 Install "\n',
        "utf8",
      );

      const outcome = await runInstallCommand({
        options: { json: true },
        runtime: {
          ...supportedRuntime,
          cwd: tempRoot,
        },
      });

      expect(outcome.exitCode).toBe(0);
      expect(outcome.result.targetProject).toBe("项目 Install");
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("falls back to target directory basename when install project config name is unavailable", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-install-config-fallback-"));

    try {
      const cases = [
        {
          name: "missing-config",
          setup: async (targetRoot: string) => {
            await mkdir(targetRoot, { recursive: true });
          },
        },
        {
          name: "empty-config-name",
          setup: async (targetRoot: string) => {
            await mkdir(path.join(targetRoot, "_speclite"), { recursive: true });
            await writeFile(
              path.join(targetRoot, "_speclite/config.toml"),
              '[core]\nproject_name = ""\n',
              "utf8",
            );
          },
        },
        {
          name: "blank-config-name",
          setup: async (targetRoot: string) => {
            await mkdir(path.join(targetRoot, "_speclite"), { recursive: true });
            await writeFile(
              path.join(targetRoot, "_speclite/config.toml"),
              '[core]\nproject_name = "   "\n',
              "utf8",
            );
          },
        },
      ];

      for (const testCase of cases) {
        const targetRoot = path.join(tempRoot, testCase.name);
        await testCase.setup(targetRoot);

        const outcome = await runInstallCommand({
          options: { json: true },
          runtime: {
            ...supportedRuntime,
            cwd: targetRoot,
          },
        });

        expect(outcome.exitCode).toBe(0);
        expect(outcome.result.targetProject).toBe(testCase.name);
      }
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("enters runtime write phase after confirmed config initialization while preserving CommandResult shape", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-install-config-"));

    try {
      await writeFile(path.join(tempRoot, "README.md"), "project notes\n", "utf8");

      const outcome = await runInstallCommand({
        options: { json: true, yes: true },
        runtime: {
          ...supportedRuntime,
          cwd: tempRoot,
        },
      });

      expect(outcome.exitCode).toBe(0);
      expect(outcome.result.data.completedSteps).toContain("config-initialization");
      expect(outcome.result.data.completedSteps).toContain("ide-mirror-creation");
      expect(outcome.result.data.completedSteps).toContain("manifest-generation");
      expect(outcome.result.data.completedSteps).toContain("ready-check");
      expect(outcome.result.data.completedSteps).toContain("ready-summary");
      expect(outcome.result.data.pendingSteps).toEqual([]);
      expect(outcome.installPlan).toMatchObject({
        plannedWrites: [
          expect.objectContaining({ path: "_speclite/config.toml", action: "create" }),
          expect.objectContaining({ path: "_speclite/config.user.toml", action: "create" }),
          expect.objectContaining({ path: "_speclite/custom/config.toml", action: "create" }),
          expect.objectContaining({ path: "_speclite/custom/config.user.toml", action: "create" }),
        ],
        writeAuthorized: true,
      });
      expect(outcome.result.summary).toContain("Final configuration summary");
      expect(outcome.result.data.installedModules).toEqual(["core", "sdlc"]);
      expect(JSON.stringify(outcome.result)).not.toContain("configInitializationStatus");
      expect(JSON.stringify(outcome.result)).not.toContain("configPaths");
      expect(JSON.stringify(outcome.result)).not.toContain(tempRoot);

      await expect(readFile(path.join(tempRoot, "_speclite/config.toml"), "utf8")).resolves.toContain("[core]");
      await expect(
        readFile(path.join(tempRoot, "_speclite/_config/manifest.yaml"), "utf8"),
      ).resolves.toContain("speclite.manifest.v1");
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });
});

async function assertNoInstallWrites(projectRoot: string): Promise<void> {
  for (const forbiddenPath of [
    "_speclite",
    "_speclite-output",
    ".claude/skills",
    ".agents/skills",
    "_speclite/_config/manifest.yaml",
    "_speclite/config.toml",
    "_speclite/config.user.toml",
  ]) {
    await expect(readFile(path.join(projectRoot, forbiddenPath), "utf8")).rejects.toMatchObject({
      code: "ENOENT",
    });
  }
}
