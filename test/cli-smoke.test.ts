import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";
import { createSpecliteProgram, isDirectCliEntrypoint, runCli } from "../src/bin/speclite.js";
import { resolveCliLocale } from "../src/cli/messages.js";
import { InstallCommandResultSchema } from "../src/diagnostics/command-result-schema.js";

describe("CLI smoke", () => {
  it("recognizes npm .bin symlinks as the direct CLI entrypoint", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-cli-symlink-"));

    try {
      const target = path.join(tempRoot, "dist/bin/speclite.js");
      const linkedBin = path.join(tempRoot, "node_modules/.bin/speclite");
      await mkdir(path.dirname(target), { recursive: true });
      await mkdir(path.dirname(linkedBin), { recursive: true });
      await writeFile(target, "#!/usr/bin/env node\n", "utf8");
      await symlink(target, linkedBin);

      expect(isDirectCliEntrypoint(pathToFileURL(target).href, linkedBin)).toBe(true);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("supports publish smoke checks for help and version without stack traces", async () => {
    const helpStdout: string[] = [];
    const helpStderr: string[] = [];
    const versionStdout: string[] = [];
    const versionStderr: string[] = [];

    await expect(
      runCli(["node", "speclite", "--help"], {
        io: {
          stdout: (text) => helpStdout.push(text),
          stderr: (text) => helpStderr.push(text),
        },
      }),
    ).resolves.toBeUndefined();
    await expect(
      runCli(["node", "speclite", "--version"], {
        io: {
          stdout: (text) => versionStdout.push(text),
          stderr: (text) => versionStderr.push(text),
        },
      }),
    ).resolves.toBeUndefined();

    expect(helpStdout.join("")).toContain("Usage: speclite [options] [command]");
    expect(helpStderr.join("")).not.toContain("CommanderError");
    expect(versionStdout.join("").trim()).toBe("0.3.0");
    expect(versionStderr.join("")).toBe("");
  });

  it("loads the install command skeleton and emits JSON result", async () => {
    const stdout: string[] = [];
    const exitCodes: number[] = [];
    const program = createSpecliteProgram({
      runtime: {
        nodeVersion: "v22.12.0",
        platform: "darwin",
        platformRelease: "23.0.0",
        targetProject: "fresh-install-empty-project",
      },
      io: {
        stdout: (text) => stdout.push(text),
        setExitCode: (code) => exitCodes.push(code),
      },
    });

    await program.parseAsync(["node", "speclite", "install", "--json"], { from: "node" });

    const parsed = InstallCommandResultSchema.parse(JSON.parse(stdout.join("")));

    expect(exitCodes).toEqual([0]);
    expect(parsed).toMatchObject({
      command: "install",
      status: "success",
      data: {
        completedSteps: [
        ],
        pendingSteps: [
          "source-discovery",
          "module-selection",
          "config-initialization",
          "runtime-structure",
          "ide-mirror-creation",
          "manifest-generation",
          "ready-check",
          "ready-summary",
        ],
      },
    });
  });

  it("parses optional target-directory without adding project-root flag", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-cli-target-"));
    const stdout: string[] = [];
    const exitCodes: number[] = [];

    try {
      const program = createSpecliteProgram({
        runtime: {
          nodeVersion: "v22.12.0",
          platform: "darwin",
          platformRelease: "23.0.0",
          cwd: tempRoot,
        },
        io: {
          stdout: (text) => stdout.push(text),
          setExitCode: (code) => exitCodes.push(code),
        },
      });

      await program.parseAsync(["node", "speclite", "install", "project-a", "--json"], {
        from: "node",
      });

      const parsed = InstallCommandResultSchema.parse(JSON.parse(stdout.join("")));

      expect(exitCodes).toEqual([0]);
      expect(parsed.targetProject).toBe("project-a");
      expect(parsed.summary).toContain("Target: project-a.");
      expect(parsed.summary).toContain("Directory state: missing");
      expect(parsed.data.paths.projectRoot).toBe(".");
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("uses install --yes as a no-prompt happy path with default Chinese human output", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-cli-yes-defaults-"));
    const stdout: string[] = [];
    const prompts: string[] = [];
    const exitCodes: number[] = [];

    try {
      const program = createSpecliteProgram({
        runtime: {
          nodeVersion: "v22.12.0",
          platform: "darwin",
          platformRelease: "23.0.0",
          cwd: tempRoot,
        },
        io: {
          stdout: (text) => stdout.push(text),
          prompt: async (question) => {
            prompts.push(question);
            throw new Error(`unexpected prompt: ${question}`);
          },
          setExitCode: (code) => exitCodes.push(code),
        },
      });

      await program.parseAsync(["node", "speclite", "install", "--yes"], { from: "node" });

      const output = stdout.join("");
      expect(exitCodes).toEqual([0]);
      expect(prompts).toEqual([]);
      expect(output).toContain("Step 4/4 Ready Summary（就绪摘要）");
      expect(output).toContain("install --yes 已使用默认 modules、quick config 和默认 IDE 目标完成无交互安装。");
      expect(output).toContain("已安装 modules\n- core\n- sdlc");
      expect(output).not.toContain("selectedModules=");
      expect(output).not.toMatch(/\u001b\[[0-9;]*m/);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("keeps Chinese ready summary accurate for custom explicit interactive installs", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-cli-zh-interactive-"));
    const stdout: string[] = [];
    const prompts: string[] = [];
    const exitCodes: number[] = [];

    try {
      const program = createSpecliteProgram({
        runtime: {
          nodeVersion: "v22.12.0",
          platform: "darwin",
          platformRelease: "23.0.0",
          cwd: tempRoot,
        },
        io: {
          stdout: (text) => stdout.push(text),
          prompt: async (question) => {
            prompts.push(question);
            if (question.includes("user_name")) return "Ada";
            if (question.includes("module id")) return "core";
            if (question.includes("quick") || question.includes("detailed")) return "quick";
            return "";
          },
          setExitCode: (code) => exitCodes.push(code),
        },
      });

      await program.parseAsync(["node", "speclite", "install", "--yes", "--interactive"], { from: "node" });

      const output = stdout.join("");
      const userConfig = await readFile(path.join(tempRoot, "_speclite/config.user.toml"), "utf8");

      expect(exitCodes).toEqual([0]);
      expect(prompts).toHaveLength(4);
      expect(output).toContain(
        [
          "Step 1/4 Select modules（选择模块）",
          "",
          "在写入任何项目文件前选择 SpecLite official modules。",
          "",
          "Available modules:",
          "",
          "- core: SpecLite Core Module 0.0.0; scope:",
        ].join("\n"),
      );
      expect(output).toContain("- sdlc: SpecLite SDLC Module 0.0.0; scope:");
      expect(output).toContain(
        [
          "Step 2/4 Configure project（配置项目）",
          "",
          "在写入任何文件前选择项目配置模式。",
          "",
          "Config mode options（配置模式选项）",
          "",
          "- quick:",
        ].join("\n"),
      );
      expect(output).toContain("- detailed:");
      expect(prompts.some((prompt) => prompt.includes("Quick config user_name"))).toBe(true);
      expect(userConfig).toContain('user_name = "Ada"');
      expect(userConfig).not.toContain('user_name = "SpecLite"');
      expect(output.match(/Step 3\/4 Final pre-write review/g) ?? []).toHaveLength(1);
      expect(output).toContain(
        [
          "Step 3/4 Final pre-write review（最终写入前复核）",
          "",
          "Review state（复核状态）",
        ].join("\n"),
      );
      expect(output).toContain("Selected modules（已选模块）\ncore (SpecLite Core Module 0.0.0)");
      expect(output).toContain("IDE targets（IDE 目标）\nclaude (.claude/skills), agents (.agents/skills)");
      expect(output).toContain(
        "Write boundary（写入边界）\nconfirmationWillWrite=_speclite/, _speclite-output/, IDE mirrors, manifest/index",
      );
      expect(output).not.toContain("Step 3/4 Final pre-write review（最终写入前复核）\nStep 3/4");
      expect(output).not.toContain("\nSelected modules\n");
      expect(output).toContain("Step 4/4 Ready Summary（就绪摘要）");
      expect(output).toContain("install --yes --interactive 已按显式交互选择完成安装。");
      expect(output).toContain("已安装 modules\n- core");
      expect(output).not.toContain("selectedModules=");
      expect(output).toContain("configMode=quick");
      expect(output).toContain("ideTargets=claude, agents");
      expect(output).not.toContain("默认 modules");
      expect(output).not.toContain("无交互安装");
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("keeps install --json --yes non-interactive and on the stable JSON contract", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-cli-json-yes-"));
    const stdout: string[] = [];
    const prompts: string[] = [];
    const exitCodes: number[] = [];

    try {
      const program = createSpecliteProgram({
        runtime: {
          nodeVersion: "v22.12.0",
          platform: "darwin",
          platformRelease: "23.0.0",
          cwd: tempRoot,
        },
        io: {
          stdout: (text) => stdout.push(text),
          prompt: async (question) => {
            prompts.push(question);
            throw new Error(`unexpected prompt: ${question}`);
          },
          setExitCode: (code) => exitCodes.push(code),
        },
      });

      await program.parseAsync(["node", "speclite", "install", "--json", "--yes"], { from: "node" });

      const parsed = InstallCommandResultSchema.parse(JSON.parse(stdout.join("")));
      expect(exitCodes).toEqual([0]);
      expect(prompts).toEqual([]);
      expect(parsed.data.installedModules).toEqual(["core", "sdlc"]);
      expect(Object.keys(parsed.data).sort()).toEqual([
        "completedSteps",
        "ideTargets",
        "installedModules",
        "manifestVersion",
        "paths",
        "pendingSteps",
        "sourceDescriptor",
      ]);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("renders explicit English install locale without changing the install contract", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-cli-locale-en-"));
    const stdout: string[] = [];
    const exitCodes: number[] = [];

    try {
      const program = createSpecliteProgram({
        runtime: {
          nodeVersion: "v22.12.0",
          platform: "darwin",
          platformRelease: "23.0.0",
          cwd: tempRoot,
        },
        io: {
          stdout: (text) => stdout.push(text),
          setExitCode: (code) => exitCodes.push(code),
        },
      });

      await program.parseAsync(["node", "speclite", "install", "--yes", "--locale", "en-US"], { from: "node" });

      const output = stdout.join("");
      expect(exitCodes).toEqual([0]);
      expect(output).toContain("SpecLite ready summary");
      expect(output).toContain("Selected modules: core, sdlc");
      expect(output).not.toContain("就绪摘要");
      expect(output).not.toMatch(/\u001b\[[0-9;]*m/);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("resolves install locale from explicit flag, env and zh-CN default", () => {
    expect(resolveCliLocale({ flag: "en-US", env: { SPECLITE_LOCALE: "zh-CN" } })).toBe("en-US");
    expect(resolveCliLocale({ env: { SPECLITE_LOCALE: "en-US" } })).toBe("en-US");
    expect(resolveCliLocale({ flag: "fr-FR", env: { SPECLITE_LOCALE: "fr-FR" } })).toBe("zh-CN");
    expect(resolveCliLocale()).toBe("zh-CN");
  });

  it("prompts for human module selection with module identity and scope in explicit interactive mode", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-cli-module-prompt-"));
    const stdout: string[] = [];
    const prompts: string[] = [];
    const exitCodes: number[] = [];

    try {
      const program = createSpecliteProgram({
        runtime: {
          nodeVersion: "v22.12.0",
          platform: "darwin",
          platformRelease: "23.0.0",
          cwd: tempRoot,
        },
        io: {
          stdout: (text) => stdout.push(text),
          prompt: async (question) => {
            prompts.push(question);
            if (question.includes("user_name")) return "Ada";
            if (question.includes("module ids")) return "core";
            if (question.includes("quick") || question.includes("detailed")) return "quick";
            return "";
          },
          setExitCode: (code) => exitCodes.push(code),
        },
      });

      await program.parseAsync(["node", "speclite", "install", "--yes", "--interactive", "--locale", "en-US"], { from: "node" });

      const userConfig = await readFile(path.join(tempRoot, "_speclite/config.user.toml"), "utf8");

      expect(exitCodes).toEqual([0]);
      expect(prompts).toHaveLength(4);
      expect(stdout.join("")).toContain(
        [
          "Step 1/4 Select modules",
          "",
          "Select SpecLite official modules before any project files are written.",
          "",
          "Available modules:",
          "",
          "- core: SpecLite Core Module 0.0.0; scope:",
        ].join("\n"),
      );
      expect(stdout.join("")).toContain("core: SpecLite Core Module 0.0.0; scope:");
      expect(stdout.join("")).toContain("sdlc: SpecLite SDLC Module 0.0.0; scope:");
      expect(prompts[0]).toContain("Enter one or more module ids");
      expect(stdout.join("")).toContain(
        [
          "Step 2/4 Configure project",
          "",
          "Choose project configuration mode before any files are written.",
          "",
          "Config mode options",
          "",
          "- quick:",
        ].join("\n"),
      );
      expect(stdout.join("")).toContain("- detailed:");
      expect(prompts[1]).toContain("quick or detailed");
      expect(prompts[2]).toContain("Quick config user_name");
      expect(stdout.join("")).toContain("Step 3/4 Final pre-write review");
      expect(stdout.join("")).toContain("canonicalPackageRoots=core=13, total=13");
      expect(stdout.join("")).toContain("projectFilesWritten=false");
      expect(prompts[3]).not.toContain("canonicalPackageRoots");
      expect(prompts[3]).not.toContain("projectFilesWritten=false");
      expect(userConfig).toContain('user_name = "Ada"');
      expect(userConfig).not.toContain('user_name = "SpecLite"');
      expect(stdout.join("")).toContain("Selected modules: core");
      expect(stdout.join("")).not.toContain("sdlc (");
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("requires quick interactive user_name before writing config.user.toml", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-cli-quick-user-name-"));
    const stdout: string[] = [];
    const prompts: string[] = [];
    const exitCodes: number[] = [];
    let userNameAttempts = 0;

    try {
      const program = createSpecliteProgram({
        runtime: {
          nodeVersion: "v22.12.0",
          platform: "darwin",
          platformRelease: "23.0.0",
          cwd: tempRoot,
        },
        io: {
          stdout: (text) => stdout.push(text),
          prompt: async (question) => {
            prompts.push(question);
            if (question.includes("user_name")) {
              userNameAttempts += 1;
              return userNameAttempts === 1 ? "   " : "Ada";
            }
            if (question.includes("module ids")) return "core";
            if (question.includes("quick") || question.includes("detailed")) return "quick";
            return "";
          },
          setExitCode: (code) => exitCodes.push(code),
        },
      });

      await program.parseAsync(["node", "speclite", "install", "--yes", "--interactive", "--locale", "en-US"], { from: "node" });

      const userConfig = await readFile(path.join(tempRoot, "_speclite/config.user.toml"), "utf8");

      expect(exitCodes).toEqual([0]);
      expect(prompts.filter((prompt) => prompt.includes("Quick config user_name"))).toHaveLength(2);
      expect(stdout.join("")).toContain("user_name is required");
      expect(userConfig).toContain('user_name = "Ada"');
      expect(userConfig).not.toContain('user_name = "SpecLite"');
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("requires detailed interactive user_name before writing config.user.toml", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-cli-detailed-user-name-"));
    const stdout: string[] = [];
    const prompts: string[] = [];
    const exitCodes: number[] = [];
    let userNameAttempts = 0;

    try {
      const program = createSpecliteProgram({
        runtime: {
          nodeVersion: "v22.12.0",
          platform: "darwin",
          platformRelease: "23.0.0",
          cwd: tempRoot,
        },
        io: {
          stdout: (text) => stdout.push(text),
          prompt: async (question) => {
            prompts.push(question);
            if (question.includes("user_name")) {
              userNameAttempts += 1;
              return userNameAttempts === 1 ? "   " : "Ada";
            }
            if (question.includes("module ids")) return "core";
            if (question.includes("quick") || question.includes("detailed")) return "detailed";
            return "";
          },
          setExitCode: (code) => exitCodes.push(code),
        },
      });

      await program.parseAsync(["node", "speclite", "install", "--yes", "--interactive", "--locale", "en-US"], { from: "node" });

      const userConfig = await readFile(path.join(tempRoot, "_speclite/config.user.toml"), "utf8");

      expect(exitCodes).toEqual([0]);
      expect(prompts.filter((prompt) => prompt.includes("Detailed config user_name"))).toHaveLength(2);
      expect(stdout.join("")).toContain("user_name is required");
      expect(userConfig).toContain('user_name = "Ada"');
      expect(userConfig).not.toContain('user_name = "SpecLite"');
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("collects detailed config values, selected modules and IDE targets through the CLI adapter", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-cli-detailed-config-"));
    const stdout: string[] = [];
    const prompts: string[] = [];
    const exitCodes: number[] = [];

    try {
      const program = createSpecliteProgram({
        runtime: {
          nodeVersion: "v22.12.0",
          platform: "darwin",
          platformRelease: "23.0.0",
          cwd: tempRoot,
        },
        io: {
          stdout: (text) => stdout.push(text),
          prompt: async (question) => {
            prompts.push(question);
            if (question.includes("Enter one or more module ids")) return "core sdlc";
            if (question.includes("Enter quick or detailed")) return "detailed";
            if (question.includes("user_name")) return "Ada";
            if (question.includes("project_name")) return "CLI Demo";
            if (question.includes("communication_language")) return "English";
            if (question.includes("document_output_language")) return "Chinese";
            if (question.includes("output_folder")) return "_out";
            if (question.includes("Selected modules")) return "core sdlc";
            if (question.includes("user_skill_level")) return "expert";
            if (question.includes("planning_artifacts")) return "_out/plans";
            if (question.includes("implementation_artifacts")) return "_out/impl";
            if (question.includes("project_knowledge")) return "knowledge";
            if (question.includes("IDE targets")) return "agents";
            return "";
          },
          setExitCode: (code) => exitCodes.push(code),
        },
      });

      await program.parseAsync(["node", "speclite", "install", "--yes", "--interactive", "--locale", "en-US"], { from: "node" });

      const output = stdout.join("");
      expect(exitCodes).toEqual([0]);
      expect(prompts.some((prompt) => prompt.includes("Detailed config user_name"))).toBe(true);
      expect(prompts.some((prompt) => prompt.includes("Detailed config planning_artifacts"))).toBe(true);
      expect(prompts.some((prompt) => prompt.includes("Selected modules"))).toBe(true);
      expect(prompts.some((prompt) => prompt.includes("IDE targets"))).toBe(true);
      expect(output).toContain("Step 3/4 Final pre-write review");
      expect(prompts.some((prompt) => prompt.includes("Review final install scope before files are written"))).toBe(true);
      expect(output).toContain("Config mode: detailed");
      expect(output).toContain("Project name: CLI Demo");
      expect(output).toContain("User display name: Ada");
      expect(output).toContain("Languages: communication=English, document=Chinese");
      expect(output).toContain("Artifact root: _out");
      expect(output).toContain("Selected modules: core, sdlc");
      expect(output).toContain("IDE targets: agents");
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });
});
