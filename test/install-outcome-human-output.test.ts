import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createSpecliteProgram } from "../src/bin/speclite.js";
import { runInstallCommand } from "../src/commands/install.js";
import {
  createInstallFailureResult,
  createInstallSuccessResult,
} from "../src/diagnostics/command-result.js";
import type { ValidationIssue } from "../src/diagnostics/command-result-schema.js";
import { renderCommandResultJson, renderInstallHumanOutput } from "../src/diagnostics/output.js";

describe("install outcome-oriented human output", () => {
  it("returns prewrite-paused next actions from real install command and CLI paths", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-prewrite-paused-"));
    const targetDirectory = "preview-target";
    const stdout: string[] = [];
    const exitCodes: number[] = [];

    try {
      const commandOutcome = await runInstallCommand({
        runtime: {
          nodeVersion: "v22.12.0",
          platform: "darwin",
          platformRelease: "23.0.0",
          cwd: tempRoot,
        },
        targetDirectory,
      });

      expect(commandOutcome.exitCode).toBe(0);
      expect(commandOutcome.result.nextActions).toEqual([
        `Run speclite install ${targetDirectory} --yes to install with defaults.`,
        `Run speclite install ${targetDirectory} --interactive to customize installation.`,
      ]);

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

      await program.parseAsync(
        ["node", "speclite", "install", targetDirectory, "--locale", "en-US"],
        {
          from: "node",
        },
      );

      const output = stdout.join("");
      expect(exitCodes).toEqual([0]);
      expect(output).toContain("Outcome: prewrite-paused");
      expect(output).toContain(`speclite install ${targetDirectory} --yes`);
      expect(output).toContain(`speclite install ${targetDirectory} --interactive`);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("renders prewrite-paused when install stops before writes without --yes", () => {
    const result = createInstallSuccessResult({
      targetProject: "fixture-project",
      completedSteps: ["source-discovery", "module-selection", "config-initialization"],
      pendingSteps: [
        "runtime-structure",
        "ide-mirror-creation",
        "manifest-generation",
        "ready-check",
        "ready-summary",
      ],
      summary: "SpecLite install preview completed before project writes.",
      nextActions: [
        "Run speclite install fixture-project --yes to install with defaults.",
        "Run speclite install fixture-project --interactive to customize installation.",
      ],
    });

    const output = renderInstallHumanOutput(result, { locale: "en-US" });

    expect(output).toContain("Outcome: prewrite-paused");
    expect(output).toContain("No installation was executed and no project files were written in this run.");
    expect(output).toContain("Ready state: not ready");
    expect(output).toContain("speclite install fixture-project --yes");
    expect(output).toContain("speclite install fixture-project --interactive");
    expect(renderCommandResultJson(result)).not.toContain("outcome");
  });

  it("renders blocked-before-write and prioritizes blocker repair before --yes guidance", () => {
    const result = createInstallFailureResult({
      targetProject: "fixture-project",
      issues: [
        createIssue({
          issueId: "source-integrity.missing-evidence",
          category: "source-integrity",
          affectedPath: ".",
          suggestedNextStep: "Restore package evidence before continuing.",
        }),
      ],
      completedSteps: ["source-discovery"],
      pendingSteps: [
        "module-selection",
        "config-initialization",
        "runtime-structure",
        "ide-mirror-creation",
        "manifest-generation",
        "ready-check",
        "ready-summary",
      ],
      nextActions: [
        "Restore package evidence before continuing.",
        "No project write was started.",
      ],
      summary: "SpecLite install stopped before writes because source evidence is missing.",
    });

    const output = renderInstallHumanOutput(result, { locale: "en-US" });

    expect(output).toContain("Outcome: blocked-before-write");
    expect(output).toContain("No project files were written because install stopped before the write stage.");
    expect(output).toContain("Fix the reported blocker before authorizing install writes.");
    expect(output.indexOf("Restore package evidence")).toBeLessThan(output.indexOf("No project write was started."));
  });

  it("renders write-failed with failed, completed and pending step evidence", () => {
    const result = createInstallFailureResult({
      targetProject: "fixture-project",
      issues: [
        createIssue({
          issueId: "ide-mirror.target-write-failed",
          category: "ide-mirror",
          affectedPath: ".agents/skills",
          suggestedNextStep: "Inspect the IDE mirror path and rerun install.",
        }),
      ],
      completedSteps: [
        "source-discovery",
        "module-selection",
        "config-initialization",
        "runtime-structure",
      ],
      pendingSteps: ["ide-mirror-creation", "manifest-generation", "ready-check", "ready-summary"],
      nextActions: ["Inspect completed writes before rerunning speclite install --yes."],
      summary: "SpecLite install stopped during write phases.",
    });

    const output = renderInstallHumanOutput(result, { locale: "en-US" });

    expect(output).toContain("Outcome: write-failed");
    expect(output).toContain("Failed step: ide-mirror-creation");
    expect(output).toContain("Completed write scope: runtime-structure");
    expect(output).toContain("Pending steps: ide-mirror-creation, manifest-generation, ready-check, ready-summary");
    expect(output).toContain("Inspect completed writes before rerunning or cleaning up manually.");
  });

  it("renders ready-check-failed after writes when local readiness fails", () => {
    const result = createInstallFailureResult({
      targetProject: "fixture-project",
      issues: [
        createIssue({
          issueId: "manifest-schema.unreadable",
          category: "manifest-schema",
          affectedPath: "_speclite/_config/manifest.yaml",
          suggestedNextStep: "Repair manifest projection and rerun ReadyCheck.",
        }),
      ],
      completedSteps: [
        "source-discovery",
        "module-selection",
        "config-initialization",
        "runtime-structure",
        "ide-mirror-creation",
        "manifest-generation",
      ],
      pendingSteps: ["ready-check", "ready-summary"],
      nextActions: [
        "Fix the readiness blocker and rerun speclite install --yes.",
        "Run speclite validate after repairing installed-state metadata.",
      ],
      summary: "SpecLite install completed writes, but ReadyCheck failed.",
    });

    const output = renderInstallHumanOutput(result, { locale: "en-US" });

    expect(output).toContain("Outcome: ready-check-failed");
    expect(output).toContain("Project files were written, but the project cannot be treated as ready.");
    expect(output).toContain("Ready state: not ready");
    expect(output).toContain("speclite install --yes");
    expect(output).toContain("speclite validate");
  });

  it("renders ready for successful installs while distinguishing default and explicit interactive text", () => {
    const readyData = {
      installedModules: ["core", "sdlc"],
      ideTargets: [
        { id: "claude", status: "configured", skillCount: 13, targetPath: ".claude/skills" },
        { id: "agents", status: "configured", skillCount: 44, targetPath: ".agents/skills" },
      ],
    } as const;
    const defaultResult = createInstallSuccessResult({
      targetProject: "fixture-project",
      completedSteps: [
        "source-discovery",
        "module-selection",
        "config-initialization",
        "runtime-structure",
        "ide-mirror-creation",
        "manifest-generation",
        "ready-check",
        "ready-summary",
      ],
      pendingSteps: [],
      summary: "SpecLite install completed. Config mode: quick.",
      nextActions: [],
      data: readyData,
    });
    const explicitResult = createInstallSuccessResult({
      targetProject: "fixture-project",
      completedSteps: defaultResult.data.completedSteps,
      pendingSteps: [],
      summary: "SpecLite install completed. Config mode: detailed.",
      nextActions: [],
      data: {
        ...readyData,
        ideTargets: [{ id: "claude", status: "configured", skillCount: 13, targetPath: ".claude/skills" }],
      },
    });

    const defaultOutput = renderInstallHumanOutput(defaultResult, { locale: "en-US" });
    const explicitOutput = renderInstallHumanOutput(explicitResult, { locale: "en-US" });

    expect(defaultOutput).toContain("Outcome: ready");
    expect(defaultOutput).toContain("install --yes completed with default modules, quick config and default IDE targets.");
    expect(explicitOutput).toContain("Outcome: ready");
    expect(explicitOutput).toContain("install --yes --interactive completed with explicit interactive selections.");
    expect(renderCommandResultJson(defaultResult)).not.toContain("outcome");
    expect(renderCommandResultJson(explicitResult)).not.toContain("outcome");
  });
});

function createIssue(input: {
  issueId: string;
  category: ValidationIssue["category"];
  affectedPath: string;
  suggestedNextStep: string;
}): ValidationIssue {
  return {
    issueId: input.issueId,
    category: input.category,
    severity: "error",
    affectedPath: input.affectedPath,
    impact: `${input.issueId} blocks install outcome.`,
    suggestedNextStep: input.suggestedNextStep,
  };
}
