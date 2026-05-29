import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createSpecliteProgram } from "../src/bin/speclite.js";
import { InstallCommandResultSchema } from "../src/diagnostics/command-result-schema.js";

describe("CLI smoke", () => {
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

  it("prompts for human module selection with module identity and scope", async () => {
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
            return "core";
          },
          setExitCode: (code) => exitCodes.push(code),
        },
      });

      await program.parseAsync(["node", "speclite", "install", "--yes"], { from: "node" });

      expect(exitCodes).toEqual([0]);
      expect(prompts).toHaveLength(3);
      expect(prompts[0]).toContain("core: SpecLite Core Module 0.0.0; scope:");
      expect(prompts[0]).toContain("sdlc: SpecLite SDLC 0.0.0; scope:");
      expect(prompts[0]).toContain("Enter one or more module ids");
      expect(prompts[1]).toContain("Choose project configuration mode");
      expect(prompts[1]).toContain("quick or detailed");
      expect(prompts[1]).toContain("does not write _speclite");
      expect(prompts[2]).toContain("Final pre-write install scope summary");
      expect(prompts[2]).toContain("Canonical package roots: core=13, total=13.");
      expect(prompts[2]).toContain("No project files were changed.");
      expect(stdout.join("")).toContain("Selected modules: core");
      expect(stdout.join("")).not.toContain("sdlc (");
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

      await program.parseAsync(["node", "speclite", "install", "--yes"], { from: "node" });

      const output = stdout.join("");
      expect(exitCodes).toEqual([0]);
      expect(prompts.some((prompt) => prompt.includes("Detailed config user_name"))).toBe(true);
      expect(prompts.some((prompt) => prompt.includes("Detailed config planning_artifacts"))).toBe(true);
      expect(prompts.some((prompt) => prompt.includes("Selected modules"))).toBe(true);
      expect(prompts.some((prompt) => prompt.includes("IDE targets"))).toBe(true);
      expect(prompts.some((prompt) => prompt.includes("Final pre-write install scope summary"))).toBe(true);
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
