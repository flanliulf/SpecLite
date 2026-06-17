import { mkdtemp, rm, writeFile, mkdir } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createSpecliteProgram } from "../src/bin/speclite.js";
import {
  createInstallSuccessResult,
  createUpdateCommandResult,
  createValidateCommandResult,
} from "../src/diagnostics/command-result.js";
import {
  renderInstallHumanOutput,
  renderUpdateHumanOutput,
  renderValidateHumanOutput,
} from "../src/diagnostics/output.js";

describe("localized CLI message catalog", () => {
  it("uses zh-CN catalog by default without passing through internal English install nextActions", () => {
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
        "Run speclite install fixture-project --yes --interactive to customize installation.",
      ],
    });

    const output = renderInstallHumanOutput(result);

    expect(output).toContain("Summary（摘要）");
    expect(output).toContain("Next Actions（下一步）");
    expect(output).toContain("运行 `speclite install fixture-project --yes`");
    expect(output).toContain("运行 `speclite install fixture-project --yes --interactive`");
    expect(output).not.toContain("Run speclite install fixture-project --yes to install with defaults.");
    expect(output).not.toContain("Run speclite install fixture-project --yes --interactive to customize installation.");
  });

  it("localizes default zh-CN install prose and labels while preserving technical identifiers", () => {
    const prewrite = createInstallSuccessResult({
      targetProject: "fixture-project",
      completedSteps: ["source-discovery", "module-selection", "config-initialization"],
      pendingSteps: [
        "runtime-structure",
        "ide-mirror-creation",
        "manifest-generation",
        "ready-check",
        "ready-summary",
      ],
      summary:
        "Target: fixture-project. Directory state: missing. After confirmation, SpecLite will initialize the target directory.",
      nextActions: [
        "Run speclite install fixture-project --yes to install with defaults.",
        "Run speclite install fixture-project --yes --interactive to customize installation.",
      ],
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

    const output = `${renderInstallHumanOutput(prewrite)}\n${renderInstallHumanOutput(ready)}`;

    expect(output).toContain("目标项目：fixture-project");
    expect(output).toContain("项目根目录：.");
    expect(output).toContain("安装位置：.");
    expect(output).toContain("关键路径");
    expect(output).toContain("已完成 steps");
    expect(output).toContain("待处理 steps");
    expect(output).toContain("已安装 modules");
    expect(output).toContain("IDE 目标");
    expect(output).toContain("来源");
    expect(output).toContain("外部访问");
    expect(output).toContain("授权状态");
    expectAllowedTechnicalIdentifiers(output, [
      "manifestVersion：speclite.manifest.v1",
      "来源：bundled",
      "trustStatus=blocked",
      "ready-check",
      "ready-summary",
      "claude: configured",
      "agents: configured",
      "speclite install fixture-project --yes",
      "speclite install fixture-project --yes --interactive",
    ]);
    expectNoKnownEnglishHumanProse(output, [
      "Target:",
      "Directory state:",
      "After confirmation",
      "SpecLite install completed. Config mode: quick.",
      "Completed steps:",
      "Pending steps:",
      "IDE target statuses:",
      "\nTarget project:",
      "\nInstall location:",
      "\nManifest version:",
      "\nKey paths\n",
      "\nCompleted steps\n",
      "\nInstalled modules\n",
      "\nIDE targets\n",
      "\nSource\n",
      "\nExternal Access\n",
      "\nAuthorization\n",
    ]);
  });

  it("renders localized issue next actions while preserving issue id, reason code and affected path", () => {
    const result = createValidateCommandResult({
      targetProject: "issue-fixture",
      issues: [
        {
          severity: "critical",
          category: "manifest-schema",
          issueId: "manifest-schema.schema-corruption",
          affectedPath: "_speclite/_config/manifest.yaml",
          details: { reason: "missing-required-field" },
          impact: "Manifest schema corruption blocks validation.",
          suggestedNextStep: "Restore _speclite/_config/manifest.yaml from the install source or rerun speclite install.",
        },
      ],
      data: {
        issueCounts: { info: 0, warning: 0, error: 0, critical: 0 },
        checkedCategories: ["manifest-schema"],
        checkedTargets: ["agents"],
        validatedPaths: ["_speclite/_config/manifest.yaml"],
      },
    }).result;

    const output = renderValidateHumanOutput(result);

    expect(output).toContain("issueId=manifest-schema.schema-corruption");
    expect(output).toContain("affectedPath=_speclite/_config/manifest.yaml");
    expect(output).toContain("reason=missing-required-field");
    expect(output).toContain("修复 manifest-schema.schema-corruption");
    expect(output).toContain("_speclite/_config/manifest.yaml");
    expect(output).not.toContain(
      "Restore _speclite/_config/manifest.yaml from the install source or rerun speclite install.",
    );
  });

  it("localizes default zh-CN human prose across status, validate, update and resolve while preserving technical identifiers", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-zh-human-prose-"));
    const originalLocale = process.env.SPECLITE_LOCALE;

    try {
      delete process.env.SPECLITE_LOCALE;

      const status = await runCli(["status", tempRoot]);
      expect(status.stdout).toContain("Summary（摘要）");
      expect(status.stdout).toContain("Scope（范围）");
      expect(status.stdout).toContain("State（状态）");
      expect(status.stdout).toContain("Evidence（证据）");
      expect(status.stdout).toContain("Issues（问题）");
      expect(status.stdout).toContain("Next Actions（下一步）");
      expectAllowedTechnicalIdentifiers(status.stdout, [
        "targetProject=speclite-zh-human-prose-",
        "projectRoot=.",
        "highLevelHealth=not-configured",
        "manifestPath=_speclite/_config/manifest.yaml",
        "speclite install <target>",
      ]);
      expectNoKnownEnglishHumanProse(status.stdout, [
        "SpecLite is not configured in this project.",
        "Command status:",
        "High-level health:",
        "Source:",
        "Manifest:",
        "Installed modules:",
        "IDE targets:",
        "Key paths",
        "Run speclite install to configure this project.",
      ]);

      const validate = await runCli(["validate", tempRoot]);
      expect(validate.stdout).toContain("Summary（摘要）");
      expect(validate.stdout).toContain("Scope（范围）");
      expect(validate.stdout).toContain("State（状态）");
      expect(validate.stdout).toContain("Issues（问题）");
      expectAllowedTechnicalIdentifiers(validate.stdout, [
        "manifest-schema.schema-corruption",
        "affectedPath=_speclite/_config/manifest.yaml",
        "reason=missing-required-artifact",
        "speclite validate <target>",
      ]);
      expectNoKnownEnglishHumanProse(validate.stdout, [
        "SpecLite validate found issues in checked categories.",
        "Status: failure",
        "Output profile: Evidence",
        "Checked categories:",
        "Not checked categories:",
        "Checked targets:",
        "Validated paths:",
        "Issue counts:",
        "Issue fields:",
        "Inspect manifest-schema issues and repair or reinstall installed-state metadata.",
      ]);

      const update = renderUpdateHumanOutput(
        createUpdateCommandResult({
          command: "update",
          targetProject: "update-fixture",
          summary: "Update planning found conflicts.",
          data: {
            updatePlan: {
              actions: [
                {
                  affectedPath: "_speclite/config.toml",
                  ownership: "installer-owned",
                  action: "conflict",
                },
              ],
            },
            changedPaths: [],
            skippedPaths: [],
            conflicts: [
              {
                affectedPath: "_speclite/config.toml",
                ownership: "installer-owned",
                reason: "installer-owned-drift",
              },
            ],
            requiresConfirmation: true,
            writeAuthorized: false,
          },
          nextActions: ["Inspect the conflict details before authorizing update writes."],
        }).result,
      );
      expect(update).toContain("Summary（摘要）");
      expect(update).toContain("Scope（范围）");
      expect(update).toContain("State（状态）");
      expect(update).toContain("Evidence（证据）");
      expect(update).toContain("Next Actions（下一步）");
      expectAllowedTechnicalIdentifiers(update, [
        "affectedPath=_speclite/config.toml",
        "reason=installer-owned-drift",
        "speclite update <target> --yes",
        "speclite validate <target>",
      ]);
      expectNoKnownEnglishHumanProse(update, [
        "Update planning found conflicts.",
        "Status: failure",
        "Mode: update",
        "Output profile: Evidence",
        "Plan status:",
        "Authorization",
        "Update Plan / Planned Effects",
        "Changed Paths",
        "Skipped Paths",
        "Conflicts:",
        "Protected Boundaries",
        "Inspect the conflict details before authorizing update writes.",
      ]);

      await mkdir(path.join(tempRoot, "_speclite"), { recursive: true });
      await writeFile(path.join(tempRoot, "_speclite/config.toml"), "[core]\nproject_name = \"Fixture\"\n", "utf8");
      const resolveSuccess = await runCli(["resolve", "config", "--project-root", tempRoot, "--human"]);
      const resolveInvalid = await runCli(["resolve", "config", "--human"]);
      const resolveOutput = `${resolveSuccess.stdout}\n${resolveInvalid.stdout}`;
      expect(resolveOutput).toContain("Summary（摘要）");
      expect(resolveOutput).toContain("Scope（范围）");
      expect(resolveOutput).toContain("Evidence（证据）");
      expect(resolveOutput).toContain("Issues（问题）");
      expect(resolveOutput).toContain("Next Actions（下一步）");
      expectAllowedTechnicalIdentifiers(resolveOutput, [
        "speclite resolve config",
        "--project-root",
        "<projectRoot>",
        "_speclite/config.toml",
        "runtime-path.missing-entry",
      ]);
      expectNoKnownEnglishHumanProse(resolveOutput, [
        "requested key:",
        "resolved layer:",
        "source path:",
        "value summary:",
        "output mode:",
        "machine contract:",
        "legal command:",
        "failed layer:",
        "source paths:",
        "fallback source:",
      ]);
    } finally {
      if (originalLocale === undefined) {
        delete process.env.SPECLITE_LOCALE;
      } else {
        process.env.SPECLITE_LOCALE = originalLocale;
      }
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("localizes zh-CN resolve human labels and resolver issue prose while preserving technical identifiers", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-zh-resolve-human-"));
    const originalLocale = process.env.SPECLITE_LOCALE;

    try {
      delete process.env.SPECLITE_LOCALE;
      await mkdir(path.join(tempRoot, "_speclite/custom"), { recursive: true });
      await writeFile(path.join(tempRoot, "_speclite/config.toml"), "[core]\nproject_name = \"Fixture\"\n", "utf8");
      await writeFile(path.join(tempRoot, "_speclite/custom/config.toml"), "[core\nbroken = true\n", "utf8");

      const warning = await runCli(["resolve", "config", "--project-root", tempRoot, "--human"]);
      const invalid = await runCli(["resolve", "config", "--human"]);
      const output = `${warning.stdout}\n${invalid.stdout}`;

      expect(warning.exitCodes).toEqual([0]);
      expect(invalid.exitCodes).toEqual([1]);
      expectAllowedTechnicalIdentifiers(output, [
        "speclite resolve config",
        "--project-root",
        "<projectRoot>",
        "_speclite/config.toml",
        "_speclite/custom/config.toml",
        "manifest-schema.malformed-field",
        "runtime-path.missing-entry",
        "status=parse-failed",
        "status=invalid-args",
      ]);
      expectNoKnownEnglishHumanProse(output, [
        "source path：",
        "source paths：",
        "fallback source：",
        "The resolver command cannot determine the requested runtime input.",
        "An optional resolver layer could not be used and was treated as an empty object.",
      ]);
    } finally {
      if (originalLocale === undefined) {
        delete process.env.SPECLITE_LOCALE;
      } else {
        process.env.SPECLITE_LOCALE = originalLocale;
      }
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("sorts command suggestions by safety priority and includes target placeholders", () => {
    const result = createUpdateCommandResult({
      command: "update",
      targetProject: "update-fixture",
      summary: "Update planning found conflicts.",
      data: {
        updatePlan: {
          actions: [
            {
              affectedPath: "_speclite/config.toml",
              ownership: "installer-owned",
              action: "conflict",
            },
          ],
        },
        changedPaths: [],
        skippedPaths: [],
        conflicts: [
          {
            affectedPath: "_speclite/config.toml",
            ownership: "installer-owned",
            reason: "installer-owned-drift",
          },
        ],
        requiresConfirmation: true,
        writeAuthorized: false,
      },
      nextActions: [
        "Review the update plan before authorizing writes.",
        "Run speclite validate after applying updates.",
      ],
    }).result;

    const output = renderUpdateHumanOutput(result);
    const nextActions = output.slice(output.indexOf("Next Actions（下一步）"));
    const repairIndex = nextActions.indexOf("先修复 blocker");
    const authorizeIndex = nextActions.indexOf("speclite update <target> --yes");
    const validateIndex = nextActions.indexOf("speclite validate <target>");

    expect(repairIndex).toBeGreaterThanOrEqual(0);
    expect(authorizeIndex).toBeGreaterThan(repairIndex);
    expect(validateIndex).toBeGreaterThan(authorizeIndex);
  });

  it("propagates --locale and SPECLITE_LOCALE beyond install without changing JSON output", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-locale-catalog-"));
    const originalLocale = process.env.SPECLITE_LOCALE;

    try {
      const enStatus = await runCli(["status", tempRoot, "--locale", "en-US"]);
      expect(enStatus.stdout).toContain("Summary\n");
      expect(enStatus.stdout).toContain("Next Actions / Next actions:");

      process.env.SPECLITE_LOCALE = "en-US";
      const envValidate = await runCli(["validate", tempRoot]);
      expect(envValidate.stdout).toContain("Summary\n");
      expect(envValidate.stdout).toContain("Next Actions / Next actions:");

      const defaultValidate = await runCli(["validate", tempRoot]);
      const localizedValidate = await runCli(["validate", tempRoot, "--json", "--locale", "en-US"]);
      const plainValidate = await runCli(["validate", tempRoot, "--json"]);
      expect(localizedValidate.stdout).toEqual(plainValidate.stdout);
      expect(localizedValidate.exitCodes).toEqual(plainValidate.exitCodes);
      expect(defaultValidate.stdout).not.toEqual(localizedValidate.stdout);

      await mkdir(path.join(tempRoot, "_speclite"), { recursive: true });
      await writeFile(path.join(tempRoot, "_speclite/config.toml"), "[core]\nproject_name = \"Fixture\"\n", "utf8");
      delete process.env.SPECLITE_LOCALE;
      const zhResolve = await runCli(["resolve", "config", "--project-root", tempRoot, "--human"]);
      expect(zhResolve.stdout).toContain("Summary（摘要）");
      expect(zhResolve.stdout).toContain("speclite resolve config");

      const enResolve = await runCli(["resolve", "config", "--project-root", tempRoot, "--human", "--locale", "en-US"]);
      expect(enResolve.stdout).toContain("Summary\n");
      expect(enResolve.stdout).toContain("Next Actions / Next actions:");
    } finally {
      if (originalLocale === undefined) {
        delete process.env.SPECLITE_LOCALE;
      } else {
        process.env.SPECLITE_LOCALE = originalLocale;
      }
      await rm(tempRoot, { recursive: true, force: true });
    }
  });
});

async function runCli(args: string[]): Promise<{ stdout: string; stderr: string; exitCodes: number[] }> {
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

function expectAllowedTechnicalIdentifiers(output: string, identifiers: string[]): void {
  for (const identifier of identifiers) {
    expect(output).toContain(identifier);
  }
}

function expectNoKnownEnglishHumanProse(output: string, phrases: string[]): void {
  for (const phrase of phrases) {
    expect(output).not.toContain(phrase);
  }
}
