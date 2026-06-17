import { cp, mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createSpecliteProgram } from "../src/bin/speclite.js";
import {
  createInstallSuccessResult,
  createRepairCommandResult,
  createUpdateCommandResult,
  createValidateCommandResult,
} from "../src/diagnostics/command-result.js";
import type {
  InstallCommandResult,
  RepairCommandResult,
  StatusCommandResult,
  UpdateCommandResult,
  ValidateCommandResult,
  ValidationIssue,
} from "../src/diagnostics/command-result-schema.js";
import {
  renderCommandResultJson,
  renderInstallHumanOutput,
  renderStatusHumanOutput,
  renderUpdateHumanOutput,
  renderValidateHumanOutput,
} from "../src/diagnostics/output.js";

describe("CLI human output coverage matrix", () => {
  it("documents every command/outcome row with focused tests, JSON parity, docs examples and fixture policy", async () => {
    const matrix = await readFile("docs/reference/cli-human-output-matrix.md", "utf8");

    const rows = [
      "`install` | `prewrite-paused`",
      "`install` | `blocked-before-write`",
      "`install` | `write-failed`",
      "`install` | `ready-check-failed`",
      "`install` | `ready`",
      "`update` | `plan-ready`",
      "`update` | `no-op`",
      "`update` | `blocked-by-conflict`",
      "`update` | `applied`",
      "`update` | `partial-or-failed`",
      "`update --repair` | `repair-plan-ready`",
      "`update --repair` | `no-op`",
      "`update --repair` | `blocked-by-conflict`",
      "`update --repair` | `applied`",
      "`update --repair` | `partial-or-failed`",
      "`status` | `installed`",
      "`status` | `not-installed`",
      "`status` | `partial`",
      "`status` | `failed`",
      "`status` | `stale`",
      "`status` | `unknown`",
      "`validate` | `valid`",
      "`validate` | `valid-with-warnings`",
      "`validate` | `invalid`",
      "`validate` | `cannot-validate`",
      "`resolve --human` | `resolved`",
      "`resolve --human` | `resolved-with-warnings`",
      "`resolve --human` | `unresolved`",
      "`resolve --human` | `invalid-input`",
    ];

    for (const row of rows) {
      expect(matrix).toContain(row);
    }

    for (const requiredReference of [
      "test/install-outcome-human-output.test.ts",
      "test/update-command.test.ts",
      "test/status-command.test.ts",
      "test/validate-command.test.ts",
      "test/resolve-cli.test.ts",
      "test/cli-human-output-matrix.test.ts",
      "JSON parity assertion",
      "docs example",
      "fixture or semantic assertion",
      "docs 示例不是 contract source",
      "SPEC、schema 和 focused tests",
      "normalization: ANSI color, terminal width, timestamps, platform path",
      "Presentation Profiles（展示 Profile）",
      "Operation",
      "Diagnostic",
      "Report / Support",
      "Install Migration Sample（Install 迁移样例）",
      "speclite install <absolute-target-path> --yes --interactive",
    ]) {
      expect(matrix).toContain(requiredReference);
    }

    expect(matrix).not.toContain(os.homedir());
    expect(matrix).not.toMatch(/\/Users\/[^/\s]+/);
    expect(matrix).not.toMatch(/[A-Z]:\\Users\\/);
  });

  it("keeps focused human renderer semantics stable for NO_COLOR, non-TTY, CI and narrow output", () => {
    const install = createPrewriteInstall();
    const updatePlan = createUpdatePlanReady();
    const repairPlan = createRepairPlanReady();
    const status = createNotInstalledStatus();
    const validate = createInvalidValidate();
    const narrowOptions = { locale: "en-US" as const, columns: 60, noColor: true, isTty: false, ci: true };
    const cases = [
      {
        label: "install",
        result: install,
        output: renderInstallHumanOutput(install, narrowOptions),
        outcome: "Outcome: prewrite-paused",
        writeState: "Writes: no project files changed",
      },
      {
        label: "update",
        result: updatePlan,
        output: renderUpdateHumanOutput(updatePlan, narrowOptions),
        outcome: "Outcome: plan-ready",
        writeState: "Writes: no project files changed",
      },
      {
        label: "update --repair",
        result: repairPlan,
        output: renderUpdateHumanOutput(repairPlan, narrowOptions),
        outcome: "Outcome: repair-plan-ready",
        writeState: "Writes: no project files changed",
      },
      {
        label: "status",
        result: status,
        output: renderStatusHumanOutput(status, narrowOptions),
        outcome: "Outcome: not-installed",
        writeState: "Writes: no project files changed",
      },
      {
        label: "validate",
        result: validate,
        output: renderValidateHumanOutput(validate, narrowOptions),
        outcome: "Outcome: invalid",
        writeState: "Writes: no project files changed",
      },
    ];

    for (const item of cases) {
      expect(item.output, item.label).toContain(item.outcome);
      expect(item.output, item.label).toContain("Summary");
      expect(item.output, item.label).toContain(item.writeState);
      expect(item.output, item.label).toContain("Issues");
      expect(item.output, item.label).toContain("Next Actions");
      expect(item.output, item.label).not.toMatch(/\u001b\[[0-9;]*m/);
      expect(item.output, item.label).not.toContain(os.homedir());
      expect(item.output, item.label).not.toMatch(/\/Users\/[^/\s]+/);
      expectJsonOutputStableAcrossHumanEnvironment(item.result);
    }

    expect(cases.find((item) => item.label === "update")?.output).toContain("Output profile: Evidence (key-value)");
    expect(cases.find((item) => item.label === "update --repair")?.output).toContain("Output profile: Evidence (key-value)");
    expect(cases.find((item) => item.label === "validate")?.output).toContain("Output profile: Evidence (key-value)");
  });

  it("adds guarded ANSI only for TTY human output while stripped text remains complete", () => {
    const install = createPrewriteInstall();
    const previousNoColor = process.env.NO_COLOR;
    const previousCi = process.env.CI;

    try {
      delete process.env.NO_COLOR;
      delete process.env.CI;
      const plain = renderInstallHumanOutput(install, { locale: "en-US", noColor: true, isTty: true, ci: false });
      const colored = renderInstallHumanOutput(install, { locale: "en-US", isTty: true, ci: false });
      const stripped = stripAnsi(colored);

      expect(plain).not.toMatch(/\u001b\[[0-9;]*m/);
      expect(renderInstallHumanOutput(install, { locale: "en-US", isTty: true, ci: true })).not.toMatch(
        /\u001b\[[0-9;]*m/,
      );
      expect(renderInstallHumanOutput(install, { locale: "en-US", isTty: false, ci: false })).not.toMatch(
        /\u001b\[[0-9;]*m/,
      );
      expect(colored).toMatch(/\u001b\[[0-9;]*m/);
      expect(stripped).toContain("Outcome: prewrite-paused");
      expect(stripped).toContain("Summary");
      expect(stripped).toContain("- Default install: run `speclite install fixture-project --yes` to install with defaults.");
      expect(stripped).toContain("- Source: bundled");
      expect(renderCommandResultJson(install)).not.toMatch(/\u001b\[[0-9;]*m/);

      process.env.NO_COLOR = "1";
      expect(
        renderInstallHumanOutput(install, { locale: "en-US", noColor: false, isTty: true, ci: false }),
      ).not.toMatch(/\u001b\[[0-9;]*m/);

      delete process.env.NO_COLOR;
      process.env.CI = "true";
      expect(renderInstallHumanOutput(install, { locale: "en-US", isTty: true, ci: false })).not.toMatch(
        /\u001b\[[0-9;]*m/,
      );
    } finally {
      restoreEnv("NO_COLOR", previousNoColor);
      restoreEnv("CI", previousCi);
    }
  });

  it("keeps resolve human mode readable while default resolve output stays pure JSON under human terminal environment", async () => {
    const previousNoColor = process.env.NO_COLOR;
    const previousCi = process.env.CI;
    const previousColumns = process.env.COLUMNS;
    const previousLocale = process.env.SPECLITE_LOCALE;
    const fixtureRoot = await createResolveParityFixture();

    try {
      process.env.NO_COLOR = "1";
      process.env.CI = "true";
      process.env.COLUMNS = "40";
      process.env.SPECLITE_LOCALE = "en-US";

      const human = await runResolve([
        "resolve",
        "config",
        "--human",
        "--locale",
        "en-US",
        "--project-root",
        fixtureRoot,
        "--key",
        "core.project_name",
      ]);
      expect(human.exitCodes).toEqual([0]);
      expect(human.stderr).toBe("");
      expect(human.stdout).toContain("Outcome: resolved");
      expect(human.stdout).toContain("Summary");
      expect(human.stdout).toContain("Writes: no project files changed");
      expect(human.stdout).toContain("Issues:");
      expect(human.stdout).toContain("Next Actions");
      expect(human.stdout).not.toMatch(/\u001b\[[0-9;]*m/);
      expect(human.stdout).not.toContain(fixtureRoot);
      expect(human.stdout).not.toContain(os.homedir());

      const json = await runResolve([
        "resolve",
        "config",
        "--project-root",
        fixtureRoot,
        "--key",
        "core.project_name",
      ]);
      expect(json.exitCodes).toEqual([0]);
      expect(json.stderr).toBe("");
      expect(JSON.parse(json.stdout)).toEqual({ "core.project_name": "Fixture User" });
      expect(json.stdout).not.toContain("Outcome");
      expect(json.stdout).not.toContain("Summary");
      expect(json.stdout).not.toMatch(/\u001b\[[0-9;]*m/);
    } finally {
      restoreEnv("NO_COLOR", previousNoColor);
      restoreEnv("CI", previousCi);
      restoreEnv("COLUMNS", previousColumns);
      restoreEnv("SPECLITE_LOCALE", previousLocale);
      await rm(fixtureRoot, { recursive: true, force: true });
    }
  });

  it("keeps human documentation matrix out of packaged runtime assets unless explicitly packaged", async () => {
    const packageJson = JSON.parse(await readFile("package.json", "utf8")) as { files: string[] };
    const releaseManifest = JSON.parse(await readFile("release/packaging-manifest.json", "utf8")) as {
      files: string[];
      includedRuntimeAssets: string[];
      packagedDocumentationExamples: Array<{ path: string; classification: string; isReleaseGateFixture: boolean }>;
    };
    const matrixPath = "docs/reference/cli-human-output-matrix.md";

    expect(packageJson.files).not.toContain(matrixPath);
    expect(releaseManifest.files).not.toContain(matrixPath);
    expect(releaseManifest.includedRuntimeAssets).not.toContain(matrixPath);
    expect(releaseManifest.packagedDocumentationExamples.map((entry) => entry.path)).not.toContain(matrixPath);
    expect(releaseManifest.packagedDocumentationExamples).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          classification: "packaged-documentation-example",
          isReleaseGateFixture: false,
        }),
      ]),
    );
  });
});

function createPrewriteInstall(): InstallCommandResult {
  return createInstallSuccessResult({
    targetProject: "fixture-project",
    completedSteps: ["source-discovery", "module-selection", "config-initialization"],
    pendingSteps: ["runtime-structure", "ide-mirror-creation", "manifest-generation", "ready-check", "ready-summary"],
    summary: "SpecLite install preview completed before project writes.",
    nextActions: [
      "Run speclite install fixture-project --yes to install with defaults.",
      "Run speclite install fixture-project --yes --interactive to customize installation.",
    ],
  });
}

function createUpdatePlanReady(): UpdateCommandResult {
  return createUpdateCommandResult({
    command: "update",
    targetProject: "fixture-project",
    summary: "SpecLite update produced an unapplied plan.",
    data: {
      updatePlan: {
        actions: [
          {
            affectedPath: "_speclite/config.toml",
            ownership: "installer-owned",
            action: "update",
            currentHash: "sha256:old",
            expectedHash: "sha256:new",
          },
        ],
      },
      changedPaths: [],
      skippedPaths: [],
      conflicts: [],
      requiresConfirmation: true,
      writeAuthorized: false,
    },
    nextActions: ["Review the update plan before authorizing writes."],
  }).result;
}

function createRepairPlanReady(): RepairCommandResult {
  return createRepairCommandResult({
    command: "update.repair",
    targetProject: "fixture-project",
    summary: "SpecLite update --repair produced an unapplied repair plan.",
    data: {
      repairPlan: {
        actions: [
          {
            affectedPath: "_speclite/config.toml",
            ownership: "installer-owned",
            currentHash: "sha256:drift",
            expectedHash: "sha256:canonical",
            action: "regenerate",
          },
        ],
      },
      changedPaths: [],
      skippedPaths: [],
      conflicts: [],
      requiresConfirmation: true,
      writeAuthorized: false,
    },
    nextActions: ["Review the repair plan before authorizing repair writes."],
  }).result;
}

function createNotInstalledStatus(): StatusCommandResult {
  return {
    schemaVersion: "speclite.command-result.v1",
    status: "success",
    command: "status",
    targetProject: "fixture-project",
    summary: "SpecLite status checked installed-state metadata.",
    issues: [],
    nextActions: ["Run speclite install fixture-project."],
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

function createInvalidValidate(): ValidateCommandResult {
  return createValidateCommandResult({
    targetProject: "fixture-project",
    issues: [
      createIssue({
        severity: "error",
        category: "runtime-path",
        issueId: "runtime-path.missing-entry",
        affectedPath: "_speclite/config.toml",
        suggestedNextStep: "Restore _speclite/config.toml, then rerun speclite validate.",
      }),
    ],
    data: {
      issueCounts: { info: 0, warning: 0, error: 0, critical: 0 },
      checkedCategories: ["runtime-path"],
      checkedTargets: ["agents"],
      validatedPaths: ["_speclite/config.toml"],
    },
  }).result;
}

function createIssue(input: {
  severity: ValidationIssue["severity"];
  category: ValidationIssue["category"];
  issueId: string;
  affectedPath: string;
  suggestedNextStep: string;
}): ValidationIssue {
  return {
    issueId: input.issueId,
    category: input.category,
    severity: input.severity,
    affectedPath: input.affectedPath,
    impact: `${input.issueId} blocks the fixture command.`,
    suggestedNextStep: input.suggestedNextStep,
  };
}

function expectJsonOutputStableAcrossHumanEnvironment(
  result: InstallCommandResult | UpdateCommandResult | RepairCommandResult | StatusCommandResult | ValidateCommandResult,
): void {
  const baseline = renderCommandResultJson(result);
  const previousNoColor = process.env.NO_COLOR;
  const previousCi = process.env.CI;
  const previousColumns = process.env.COLUMNS;
  const previousLocale = process.env.SPECLITE_LOCALE;

  try {
    process.env.NO_COLOR = "1";
    process.env.CI = "true";
    process.env.COLUMNS = "40";
    process.env.SPECLITE_LOCALE = "en-US";
    expect(renderCommandResultJson(result)).toBe(baseline);
    expect(JSON.parse(baseline)).toEqual(result);
    expect(baseline).not.toContain("Outcome");
    expect(baseline).not.toContain("Summary");
    expect(baseline).not.toMatch(/\u001b\[[0-9;]*m/);
  } finally {
    restoreEnv("NO_COLOR", previousNoColor);
    restoreEnv("CI", previousCi);
    restoreEnv("COLUMNS", previousColumns);
    restoreEnv("SPECLITE_LOCALE", previousLocale);
  }
}

function stripAnsi(value: string): string {
  return value.replace(/\u001b\[[0-9;]*m/g, "");
}

type RunResolveResult = {
  stdout: string;
  stderr: string;
  exitCodes: number[];
};

async function runResolve(args: string[]): Promise<RunResolveResult> {
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

async function createResolveParityFixture(): Promise<string> {
  const fixtureRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-output-matrix-resolve-"));
  await cp(path.join("test/fixtures/resolve-parity/input/config"), fixtureRoot, { recursive: true });
  return fixtureRoot;
}

function restoreEnv(name: "NO_COLOR" | "CI" | "COLUMNS" | "SPECLITE_LOCALE", value: string | undefined): void {
  if (value === undefined) {
    delete process.env[name];
    return;
  }
  process.env[name] = value;
}
