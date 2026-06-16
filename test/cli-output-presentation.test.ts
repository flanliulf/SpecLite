import { describe, expect, it } from "vitest";
import { createInstallSuccessResult, createUpdateCommandResult, createValidateCommandResult } from "../src/diagnostics/command-result.js";
import type { StatusCommandResult, ValidationIssue } from "../src/diagnostics/command-result-schema.js";
import {
  HUMAN_OUTPUT_PRESENTATION_PROFILES,
  renderCommandResultJson,
  renderInstallHumanOutput,
  renderStatusHumanOutput,
  renderUpdateHumanOutput,
  renderValidateHumanOutput,
} from "../src/diagnostics/output.js";

describe("shared CLI outcome presentation", () => {
  it("defines explicit presentation profiles for operation, diagnostic and report/support commands", () => {
    expect(HUMAN_OUTPUT_PRESENTATION_PROFILES).toMatchObject({
      install: "operation",
      init: "operation",
      update: "operation",
      "update.repair": "operation",
      sync: "operation",
      uninstall: "operation",
      status: "diagnostic",
      validate: "diagnostic",
      doctor: "diagnostic",
      list: "report-support",
      "governance-report": "report-support",
      "resolve.config": "report-support",
      "resolve.customization": "report-support",
    });
  });

  it("renders install human output with shared title, outcome, Summary and Next Actions", () => {
    const result = createInstallSuccessResult({
      targetProject: "fixture-project",
      completedSteps: ["preflight"],
      pendingSteps: ["write-files"],
      summary: "SpecLite install prepared the project plan.",
      nextActions: ["Review planned writes before rerunning with --yes."],
    });

    const output = renderInstallHumanOutput(result, { locale: "en-US" });

    expect(output).toContain("SpecLite install");
    expect(output).toContain("Outcome");
    expect(output).toContain("Summary");
    expect(output).toContain("Next Actions");
    expect(output).toMatch(/Summary\nCompleted: yes\nWrites: no project files changed\nUser action: required/);
    expect(output).toContain("- Run `speclite install fixture-project --yes` to install with defaults.");
  });

  it("orders sections by profile without rendering a standalone Empty State section", () => {
    const install = createInstallSuccessResult({
      targetProject: "fixture-project",
      completedSteps: ["source-discovery"],
      pendingSteps: ["module-selection"],
      summary: "SpecLite install prepared the project plan.",
      nextActions: ["Review planned writes before rerunning with --yes."],
    });
    const status = createStatusResult({ nextActions: [] });

    const installOutput = renderInstallHumanOutput(install, { locale: "zh-CN" });
    const statusOutput = renderStatusHumanOutput(status, { locale: "zh-CN" });

    expect(sectionOrder(installOutput, [
      "Summary（摘要）",
      "Scope（范围）",
      "State（状态）",
      "Evidence（证据）",
      "Issues（问题）",
      "Next Actions（下一步）",
    ])).toBe(true);
    expect(sectionOrder(statusOutput, [
      "Summary（摘要）",
      "Scope（范围）",
      "State（状态）",
      "Issues（问题）",
      "Evidence（证据）",
      "Next Actions（下一步）",
    ])).toBe(true);
    expect(installOutput).not.toContain("Empty State（空状态）");
    expect(statusOutput).not.toContain("Empty State（空状态）");
    expect(statusOutput).toMatch(/Issues（问题）\n- 无问题/);
  });

  it("marks install ready summary as written while keeping prewrite install unwritten", () => {
    const prewrite = createInstallSuccessResult({
      targetProject: "fixture-project",
      completedSteps: ["source-discovery"],
      pendingSteps: ["module-selection"],
      summary: "SpecLite install prepared the project plan.",
      nextActions: ["Review planned writes before rerunning with --yes."],
    });
    const ready = createInstallSuccessResult({
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
      data: {
        installedModules: ["core", "sdlc"],
        ideTargets: [
          { id: "claude", status: "configured", skillCount: 13, targetPath: ".claude/skills" },
          { id: "agents", status: "configured", skillCount: 44, targetPath: ".agents/skills" },
        ],
      },
    });

    expect(renderInstallHumanOutput(prewrite, { locale: "zh-CN" })).toMatch(
      /Summary（摘要）\n完成状态：已完成\n写入状态：未写入项目文件\n用户动作：需要/,
    );
    expect(renderInstallHumanOutput(ready, { locale: "zh-CN" })).toMatch(
      /Summary（摘要）\n完成状态：已完成\n写入状态：已写入项目文件\n用户动作：不需要/,
    );
    expect(renderInstallHumanOutput(ready, { locale: "zh-CN" })).not.toContain("写入状态：未写入项目文件");
  });

  it("keeps technical identifiers untranslated in zh-CN status output", () => {
    const result = createStatusResult({
      nextActions: ["Run speclite install --target agents."],
    });

    const output = renderStatusHumanOutput(result, { locale: "zh-CN" });

    expect(output).toContain("SpecLite status");
    expect(output).toContain("Outcome（结果）");
    expect(output).toMatch(/Summary（摘要）\n完成状态：已完成\n写入状态：未写入项目文件\n用户动作：需要/);
    expect(output).toContain("targetProject=fixture-project");
    expect(output).toContain("highLevelHealth=not-configured");
    expect(output).toContain("manifestPath=_speclite/_config/manifest.yaml");
    expect(output).toContain("运行 `speclite install <target>` 配置该项目。");
    expect(output).not.toContain("目标项目=fixture-project");
  });

  it("renders explicit empty states without blank sections", () => {
    const status = createStatusResult({ nextActions: [] });
    const update = createUpdateCommandResult({
      command: "update",
      targetProject: "fixture-project",
      summary: "SpecLite update found no planned changes.",
      data: {
        updatePlan: { actions: [] },
        changedPaths: [],
        skippedPaths: [],
        conflicts: [],
        requiresConfirmation: false,
        writeAuthorized: false,
      },
      nextActions: [],
    }).result;

    expect(renderStatusHumanOutput(status, { locale: "zh-CN" })).toContain("无 checked items");
    expect(renderStatusHumanOutput(status, { locale: "zh-CN" })).toContain("无问题");
    expect(renderUpdateHumanOutput(update, { locale: "zh-CN" })).toContain("未写入项目文件");
    expect(renderUpdateHumanOutput(update, { locale: "zh-CN" })).toContain("无 conflict");
    expect(renderUpdateHumanOutput(update, { locale: "zh-CN" })).toContain("无 planned writes");
  });

  it("renders validate zh-CN empty state through the locale catalog", () => {
    const result = createValidateCommandResult({
      targetProject: "fixture-project",
      issues: [],
      data: {
        issueCounts: { info: 0, warning: 0, error: 0, critical: 0 },
        checkedCategories: ["manifest-schema"],
        checkedTargets: ["agents"],
        validatedPaths: ["_speclite/_config/manifest.yaml"],
      },
    }).result;

    const output = renderValidateHumanOutput(result, { locale: "zh-CN" });

    expect(output).toContain("checked categories 未发现问题");
    expect(output).toContain("未检测到 conflict");
    expect(output).toContain("skipped / not checked categories 不应被解读为 healthy");
    expect(output).toContain("已检查 categories：manifest-schema");
    expect(output).not.toContain("No issues found for checked categories.");
    expect(output).not.toContain("No conflicts detected.");
    expect(output).not.toContain("Skipped / not checked categories are listed above");
  });

  it("shares issue, path, next action, severity and sorting semantics with JSON output", () => {
    const firstIssue = createIssue({
      issueId: "runtime-path.invalid-project-root",
      category: "runtime-path",
      severity: "error",
      affectedPath: "_speclite/config.toml",
      suggestedNextStep: "Fix runtime path configuration.",
    });
    const secondIssue = createIssue({
      issueId: "manifest-schema.invalid",
      category: "manifest-schema",
      severity: "warning",
      affectedPath: "_speclite/_config/manifest.yaml",
      suggestedNextStep: "Inspect manifest schema fields.",
    });
    const result = createValidateCommandResult({
      targetProject: "fixture-project",
      issues: [firstIssue, secondIssue],
      data: {
        issueCounts: { info: 0, warning: 0, error: 0, critical: 0 },
        checkedCategories: ["runtime-path", "manifest-schema"],
        checkedTargets: ["agents"],
        validatedPaths: ["_speclite/_config/manifest.yaml", "_speclite/config.toml"],
      },
    }).result;
    const json = JSON.parse(renderCommandResultJson(result));
    const output = renderValidateHumanOutput(result, { locale: "en-US" });

    expect(output).toContain(`Status: ${json.status}`);
    expect(output).toContain("severity=warning");
    expect(output).toContain("severity=error");
    expect(output).toContain("issueId=manifest-schema.invalid");
    expect(output).toContain("issueId=runtime-path.invalid-project-root");
    expect(output).toContain("affectedPath=_speclite/_config/manifest.yaml");
    expect(output).toContain("affectedPath=_speclite/config.toml");
    expect(output).toContain("Inspect manifest schema fields.");
    const humanIssueOrder = output
      .split("\n")
      .filter((line) => line.includes("issueId="))
      .map((line) => line.match(/issueId=([^ ]+)/)?.[1]);
    expect(humanIssueOrder).toEqual(json.issues.map((issue: ValidationIssue) => issue.issueId));
    expect(json).not.toHaveProperty("outcome");
  });
});

function sectionOrder(output: string, titles: string[]): boolean {
  const indexes = titles.map((title) => output.indexOf(title));
  return indexes.every((index) => index >= 0) &&
    indexes.every((index, position) => position === 0 || index > indexes[position - 1]);
}

function createStatusResult(input: { nextActions: string[] }): StatusCommandResult {
  return {
    schemaVersion: "speclite.command-result.v1",
    status: "success",
    command: "status",
    targetProject: "fixture-project",
    summary: "SpecLite status checked installed-state metadata.",
    issues: [],
    nextActions: input.nextActions,
    data: {
      manifestPresent: false,
      installedModules: [],
      ideTargets: [],
      highLevelHealth: "not-configured",
      paths: {
        projectRoot: ".",
        specliteRoot: "_speclite",
        artifactRoot: "_speclite-output",
        manifestPath: "_speclite/_config/manifest.yaml",
      },
    },
  };
}

function createIssue(input: {
  issueId: string;
  category: ValidationIssue["category"];
  severity: ValidationIssue["severity"];
  affectedPath: string;
  suggestedNextStep: string;
}): ValidationIssue {
  return {
    issueId: input.issueId,
    category: input.category,
    severity: input.severity,
    affectedPath: input.affectedPath,
    impact: `${input.issueId} impact.`,
    suggestedNextStep: input.suggestedNextStep,
  };
}
