#!/usr/bin/env node
import { Command } from "commander";
import { realpathSync } from "node:fs";
import { createRequire } from "node:module";
import { createInterface } from "node:readline/promises";
import { fileURLToPath } from "node:url";
import type { ConfigInputValues, ProjectConfigField } from "../config/config-schema.js";
import { resolveCliLocale, type CliLocale } from "../cli/messages.js";
import {
  renderCommandResultJson,
  renderDoctorHumanOutput,
  renderGovernanceReportHumanOutput,
  renderInitHumanOutput,
  renderInstallHumanOutput,
  renderListHumanOutput,
  renderStatusHumanOutput,
  renderSyncHumanOutput,
  renderUninstallHumanOutput,
  renderUpdateHumanOutput,
  renderValidateHumanOutput,
} from "../diagnostics/output.js";
import { runDoctorCommand, type DoctorCommandRuntime } from "../commands/doctor.js";
import { runGovernanceReportCommand, type GovernanceReportCommandRuntime } from "../commands/governance-report.js";
import { runInitCommand, type InitCommandRuntime } from "../commands/init.js";
import {
  runInstallCommand,
  type ConfigInitializationPromptInput,
  type ConfigInitializationSelection,
  type InstallCommandRuntime,
  type ModuleSelectionPromptInput,
  type SourceAccessConfirmationInput,
  type PrewriteInstallScopeConfirmationInput,
} from "../commands/install.js";
import { runListCommand, type ListCommandRuntime } from "../commands/list.js";
import { registerResolveCommand } from "../commands/resolve.js";
import { runStatusCommand, type StatusCommandRuntime } from "../commands/status.js";
import { runSyncCommand, type SyncCommandRuntime } from "../commands/sync.js";
import { runUninstallCommand, type UninstallCommandRuntime } from "../commands/uninstall.js";
import { runUpdateCommand, type UpdateCommandRuntime } from "../commands/update.js";
import { runValidateCommand, type ValidateCommandRuntime } from "../commands/validate.js";

export type CliIo = {
  stdout: (text: string) => void;
  stderr: (text: string) => void;
  setExitCode: (code: number) => void;
  prompt: (question: string) => Promise<string>;
};

export type CreateCliOptions = {
  io?: Partial<CliIo>;
  runtime?: InstallCommandRuntime &
    StatusCommandRuntime &
    InitCommandRuntime &
    ListCommandRuntime &
    ValidateCommandRuntime &
    UpdateCommandRuntime &
    DoctorCommandRuntime &
    SyncCommandRuntime &
    UninstallCommandRuntime &
    GovernanceReportCommandRuntime;
};

export function createSpecliteProgram(options: CreateCliOptions = {}): Command {
  const io = createCliIo(options.io);
  const program = new Command();

  program
    .name("speclite")
    .description("SpecLite local-first CLI control plane.")
    .version(readPackageVersion());
  program.configureOutput({
    writeOut: io.stdout,
    writeErr: io.stderr,
  });
  program.exitOverride();

  registerResolveCommand(program, io);

  program
    .command("init")
    .description("Create or rebuild SpecLite project config without silently overwriting custom files.")
    .argument("[target-directory]", "Project directory to initialize.")
    .option("--json", "Emit machine-readable CommandResult JSON.")
    .option("--dry-run", "Generate an unapplied init plan without authorizing writes.")
    .option("--yes", "Authorize non-conflicting project config writes.")
    .action(
      async (
        targetDirectory: string | undefined,
        commandOptions: { dryRun?: boolean; json?: boolean; yes?: boolean },
      ) => {
        const outcome = await runInitCommand({
          options: {
            dryRun: commandOptions.dryRun ?? false,
            json: commandOptions.json ?? false,
            yes: commandOptions.yes ?? false,
          },
          ...(options.runtime === undefined ? {} : { runtime: options.runtime }),
          ...(targetDirectory === undefined ? {} : { targetDirectory }),
        });

        if (commandOptions.json) {
          io.stdout(renderCommandResultJson(outcome.result));
        } else {
          io.stdout(renderInitHumanOutput(outcome.result));
        }

        io.setExitCode(outcome.exitCode);
      },
    );

  program
    .command("list")
    .description("List canonical SpecLite modules, skills, IDE targets and versions.")
    .argument("[target-directory]", "Project directory whose installed-state projection should be included.")
    .option("--json", "Emit machine-readable CommandResult JSON.")
    .action(async (targetDirectory: string | undefined, commandOptions: { json?: boolean }) => {
      const outcome = await runListCommand({
        options: { json: commandOptions.json ?? false },
        ...(options.runtime === undefined ? {} : { runtime: options.runtime }),
        ...(targetDirectory === undefined ? {} : { targetDirectory }),
      });

      if (commandOptions.json) {
        io.stdout(renderCommandResultJson(outcome.result));
      } else {
        io.stdout(renderListHumanOutput(outcome.result));
      }

      io.setExitCode(outcome.exitCode);
    });

  program
    .command("governance-report")
    .description("Generate a read-only process governance coverage report from installed SpecLite evidence.")
    .argument("[target-directory]", "Project directory to report on.")
    .option("--json", "Emit machine-readable CommandResult JSON.")
    .action(async (targetDirectory: string | undefined, commandOptions: { json?: boolean }) => {
      const outcome = await runGovernanceReportCommand({
        options: { json: commandOptions.json ?? false },
        ...(options.runtime === undefined ? {} : { runtime: options.runtime }),
        ...(targetDirectory === undefined ? {} : { targetDirectory }),
      });

      if (commandOptions.json) {
        io.stdout(renderCommandResultJson(outcome.result));
      } else {
        io.stdout(renderGovernanceReportHumanOutput(outcome.result));
      }

      io.setExitCode(outcome.exitCode);
    });

  program
    .command("doctor")
    .description("Run richer SpecLite diagnostics without changing validate local-only behavior.")
    .argument("[target-directory]", "Project directory to diagnose.")
    .option("--json", "Emit machine-readable CommandResult JSON.")
    .option("--revalidate-source", "Plan remote source freshness/provenance revalidation.")
    .option("--yes", "Authorize explicitly planned external access for doctor checks.")
    .action(
      async (
        targetDirectory: string | undefined,
        commandOptions: { json?: boolean; revalidateSource?: boolean; yes?: boolean },
      ) => {
        const outcome = await runDoctorCommand({
          options: {
            json: commandOptions.json ?? false,
            revalidateSource: commandOptions.revalidateSource ?? false,
            yes: commandOptions.yes ?? false,
          },
          ...(options.runtime === undefined ? {} : { runtime: options.runtime }),
          ...(targetDirectory === undefined ? {} : { targetDirectory }),
        });

        if (commandOptions.json) {
          io.stdout(renderCommandResultJson(outcome.result));
        } else {
          io.stdout(renderDoctorHumanOutput(outcome.result));
        }

        io.setExitCode(outcome.exitCode);
      },
    );

  program
    .command("sync")
    .description("Reconcile installed source projections and IDE mirrors without hidden repair semantics.")
    .argument("[target-directory]", "Project directory to synchronize.")
    .option("--json", "Emit machine-readable CommandResult JSON.")
    .option("--dry-run", "Generate an unapplied sync plan without authorizing writes.")
    .option("--yes", "Authorize non-conflicting installer-owned sync writes.")
    .action(
      async (
        targetDirectory: string | undefined,
        commandOptions: { dryRun?: boolean; json?: boolean; yes?: boolean },
      ) => {
        const outcome = await runSyncCommand({
          options: {
            dryRun: commandOptions.dryRun ?? false,
            json: commandOptions.json ?? false,
            yes: commandOptions.yes ?? false,
          },
          ...(options.runtime === undefined ? {} : { runtime: options.runtime }),
          ...(targetDirectory === undefined ? {} : { targetDirectory }),
        });

        if (commandOptions.json) {
          io.stdout(renderCommandResultJson(outcome.result));
        } else {
          io.stdout(renderSyncHumanOutput(outcome.result));
        }

        io.setExitCode(outcome.exitCode);
      },
    );

  program
    .command("uninstall")
    .description("Remove SpecLite installer-owned files while preserving human and workflow-owned paths.")
    .argument("[target-directory]", "Project directory to uninstall from.")
    .option("--json", "Emit machine-readable CommandResult JSON.")
    .option("--dry-run", "Generate an unapplied uninstall plan without removing files.")
    .option("--yes", "Authorize removal of installer-owned files.")
    .action(
      async (
        targetDirectory: string | undefined,
        commandOptions: { dryRun?: boolean; json?: boolean; yes?: boolean },
      ) => {
        const outcome = await runUninstallCommand({
          options: {
            dryRun: commandOptions.dryRun ?? false,
            json: commandOptions.json ?? false,
            yes: commandOptions.yes ?? false,
          },
          ...(options.runtime === undefined ? {} : { runtime: options.runtime }),
          ...(targetDirectory === undefined ? {} : { targetDirectory }),
        });

        if (commandOptions.json) {
          io.stdout(renderCommandResultJson(outcome.result));
        } else {
          io.stdout(renderUninstallHumanOutput(outcome.result));
        }

        io.setExitCode(outcome.exitCode);
      },
    );

  program
    .command("update")
    .description("Expose the SpecLite update command surface before Epic 4 implementation.")
    .argument("[target-directory]", "Project directory to update.")
    .option("--repair", "Use the explicit repair command id and repair placeholder.")
    .option("--json", "Emit machine-readable CommandResult JSON.")
    .option("--dry-run", "Generate an unapplied update plan without authorizing writes.")
    .option("--yes", "Authorize non-conflicting planned update writes.")
    .option("--locale <locale>", "Render human-readable update output with locale: zh-CN or en-US.")
    .action(
      async (
        targetDirectory: string | undefined,
        commandOptions: { dryRun?: boolean; repair?: boolean; json?: boolean; yes?: boolean; locale?: string },
      ) => {
        const locale = resolveCliLocale({ flag: commandOptions.locale, env: process.env });
        const outcome = await runUpdateCommand({
          options: {
            dryRun: commandOptions.dryRun ?? false,
            json: commandOptions.json ?? false,
            repair: commandOptions.repair ?? false,
            yes: commandOptions.yes ?? false,
          },
          ...(options.runtime === undefined ? {} : { runtime: options.runtime }),
          ...(targetDirectory === undefined ? {} : { targetDirectory }),
        });

        if (commandOptions.json) {
          io.stdout(renderCommandResultJson(outcome.result));
        } else {
          io.stdout(renderUpdateHumanOutput(outcome.result, { locale }));
        }

        io.setExitCode(outcome.exitCode);
      },
    );

  program
    .command("status")
    .description("Inspect the local SpecLite installed-state summary.")
    .argument("[target-directory]", "Project directory to inspect.")
    .option("--json", "Emit machine-readable CommandResult JSON.")
    .option("--locale <locale>", "Render human-readable status output with locale: zh-CN or en-US.")
    .action(async (targetDirectory: string | undefined, commandOptions: { json?: boolean; locale?: string }) => {
      const locale = resolveCliLocale({ flag: commandOptions.locale, env: process.env });
      const outcome = await runStatusCommand({
        options: { json: commandOptions.json ?? false },
        ...(options.runtime === undefined ? {} : { runtime: options.runtime }),
        ...(targetDirectory === undefined ? {} : { targetDirectory }),
      });

      if (commandOptions.json) {
        io.stdout(renderCommandResultJson(outcome.result));
      } else {
        io.stdout(renderStatusHumanOutput(outcome.result, { locale }));
      }

      io.setExitCode(outcome.exitCode);
    });

  program
    .command("validate")
    .description("Validate the local SpecLite installed-state schema projection.")
    .argument("[target-directory]", "Project directory to validate.")
    .option("--json", "Emit machine-readable CommandResult JSON.")
    .option("--locale <locale>", "Render human-readable validate output with locale: zh-CN or en-US.")
    .action(async (targetDirectory: string | undefined, commandOptions: { json?: boolean; locale?: string }) => {
      const locale = resolveCliLocale({ flag: commandOptions.locale, env: process.env });
      const outcome = await runValidateCommand({
        options: { json: commandOptions.json ?? false },
        ...(options.runtime === undefined ? {} : { runtime: options.runtime }),
        ...(targetDirectory === undefined ? {} : { targetDirectory }),
      });

      if (commandOptions.json) {
        io.stdout(renderCommandResultJson(outcome.result));
      } else {
        io.stdout(renderValidateHumanOutput(outcome.result, { locale }));
      }

      io.setExitCode(outcome.exitCode);
    });

  program
    .command("install")
    .description("Run the SpecLite install preflight and install command skeleton.")
    .argument("[target-directory]", "Project directory to inspect before installing SpecLite.")
    .option("--json", "Emit machine-readable CommandResult JSON.")
    .option("--yes", "Authorize command-level writes after preflight gates pass.")
    .option("--interactive", "Use explicit human prompts for custom module, config and IDE target choices.")
    .option("--locale <locale>", "Render human-readable install output and prompts with locale: zh-CN or en-US.")
    .option("--source <type>", "Select source type: bundled, npm, private-registry, local-tarball, offline-bundle, git or local.")
    .option("--source-value <value>", "Provide the source value for custom source types.")
    .option("--channel <channel>", "Record the requested source channel before resolution.")
    .option("--version <version>", "Record the requested source version, tag, range or ref before resolution.")
    .action(async (targetDirectory: string | undefined, commandOptions: {
      json?: boolean;
      yes?: boolean;
      interactive?: boolean;
      locale?: string;
      source?: string;
      sourceValue?: string;
      channel?: string;
      version?: string;
    }) => {
      const locale = resolveCliLocale({ flag: commandOptions.locale, env: process.env });
      const shouldPrompt = commandOptions.json !== true && commandOptions.interactive === true;
      const installInput = {
        options: {
          json: commandOptions.json ?? false,
          yes: commandOptions.yes ?? false,
          ...(commandOptions.source === undefined ? {} : { sourceType: commandOptions.source }),
          ...(commandOptions.sourceValue === undefined ? {} : { sourceValue: commandOptions.sourceValue }),
          ...(commandOptions.channel === undefined ? {} : { channel: commandOptions.channel }),
          ...(commandOptions.version === undefined ? {} : { requestedVersion: commandOptions.version }),
        },
        ...(options.runtime === undefined ? {} : { runtime: options.runtime }),
        ...(shouldPrompt
          ? {
              selectModuleIds: async (selectionInput: ModuleSelectionPromptInput) =>
                parseModuleSelectionAnswer(
                  await promptWithBlock(io, createModuleSelectionQuestion(selectionInput, locale)),
                ),
              configureProject: async (configInput: ConfigInitializationPromptInput) =>
                collectConfigInitializationSelection(io, configInput, locale),
              confirmSourceAccess: async (confirmationInput: SourceAccessConfirmationInput) =>
                confirmSourceAccess(io, confirmationInput, locale),
              confirmPrewriteInstallScope: async (confirmationInput: PrewriteInstallScopeConfirmationInput) =>
                confirmPrewriteInstallScope(io, confirmationInput, locale),
            }
          : {}),
        ...(targetDirectory === undefined ? {} : { targetDirectory }),
      };
      const outcome = await runInstallCommand(installInput);

      if (commandOptions.json) {
        io.stdout(renderCommandResultJson(outcome.result));
      } else {
        io.stdout(renderInstallHumanOutput(outcome.result, { locale }));
      }

      io.setExitCode(outcome.exitCode);
    });

  return program;
}

export async function runCli(
  argv: string[],
  options: CreateCliOptions = {},
): Promise<void> {
  try {
    await createSpecliteProgram(options).parseAsync(argv, { from: "node" });
  } catch (error) {
    if (isCommanderInformationalExit(error)) {
      return;
    }
    throw error;
  }
}

function createCliIo(overrides: Partial<CliIo> = {}): CliIo {
  return {
    stdout: overrides.stdout ?? ((text) => process.stdout.write(text)),
    stderr: overrides.stderr ?? ((text) => process.stderr.write(text)),
    setExitCode: overrides.setExitCode ?? ((code) => {
      process.exitCode = code;
    }),
    prompt:
      overrides.prompt ??
      (async (question) => {
        const readline = createInterface({
          input: process.stdin,
          output: process.stdout,
        });
        try {
          return await readline.question(question);
        } finally {
          readline.close();
        }
      }),
  };
}

function readPackageVersion(): string {
  const require = createRequire(import.meta.url);
  const packageJson = require("../../package.json") as { version?: unknown };
  return typeof packageJson.version === "string" ? packageJson.version : "0.0.0";
}

function isCommanderInformationalExit(error: unknown): boolean {
  if (typeof error !== "object" || error === null || !("code" in error) || !("exitCode" in error)) {
    return false;
  }

  const commanderExit = error as { code?: unknown; exitCode?: unknown };
  return (
    commanderExit.exitCode === 0 &&
    (commanderExit.code === "commander.helpDisplayed" || commanderExit.code === "commander.version")
  );
}

type PromptBlock = {
  body: string;
  prompt: string;
};

function createModuleSelectionQuestion(input: ModuleSelectionPromptInput, locale: CliLocale): PromptBlock {
  const moduleLines = input.modules.map((module) => {
    const scope = module.capabilitySummary.join(", ") || module.description;
    return `- ${module.code}: ${module.name} ${module.version}; scope: ${scope}`;
  });

  if (locale === "en-US") {
    return {
      body: [
        "Step 1/4 Select modules",
        "",
        "Select SpecLite official modules before any project files are written.",
        "",
        "Available modules:",
        "",
        ...moduleLines,
        "",
        `Required modules: ${formatModuleIdList(input.requiredModuleIds)}.`,
        `Default selected modules: ${formatModuleIdList(input.defaultSelectedModuleIds)}.`,
      ].join("\n"),
      prompt: "Enter one or more module ids separated by comma or whitespace. Press Enter to use defaults: ",
    };
  }

  return {
    body: [
      "Step 1/4 Select modules（选择模块）",
      "",
      "在写入任何项目文件前选择 SpecLite official modules。",
      "",
      "Available modules:",
      "",
      ...moduleLines,
      "",
      `Required modules: ${formatModuleIdList(input.requiredModuleIds)}.`,
      `Default selected modules: ${formatModuleIdList(input.defaultSelectedModuleIds)}.`,
    ].join("\n"),
    prompt: "输入一个或多个 module id，可用逗号或空格分隔。直接按 Enter 使用默认值: ",
  };
}

function parseModuleSelectionAnswer(answer: string): string[] {
  return answer
    .split(/[\s,]+/)
    .map((moduleId) => moduleId.trim())
    .filter((moduleId) => moduleId.length > 0);
}

function parseConfigInitializationAnswer(answer: string): ConfigInitializationSelection {
  const normalized = answer.trim().toLowerCase();

  return {
    mode: normalized === "detailed" ? "detailed" : "quick",
  };
}

async function collectConfigInitializationSelection(
  io: CliIo,
  input: ConfigInitializationPromptInput,
  locale: CliLocale,
): Promise<ConfigInitializationSelection> {
  const modeSelection = parseConfigInitializationAnswer(
    await promptWithBlock(io, createConfigModePrompt(input, locale)),
  );
  if (modeSelection.mode !== "detailed") {
    const values: ConfigInputValues = {};
    await collectRequiredInteractiveConfigValue(io, values, "user_name", locale, "quick");
    return { ...modeSelection, values };
  }

  const values: ConfigInputValues = {};
  await collectRequiredInteractiveConfigValue(io, values, "user_name", locale, "detailed");
  for (const field of [
    "project_name",
    "communication_language",
    "document_output_language",
    "output_folder",
  ] satisfies ProjectConfigField[]) {
    await collectConfigValue(io, values, field, locale);
  }

  const selectedModuleIds = await collectIdSelection({
    io,
    prompt: createIdSelectionQuestion({
      title: "Selected modules",
      defaultIds: input.selectedModuleIds,
      itemLabel: "module ids",
    }),
    defaultIds: input.selectedModuleIds,
    allowedIds: input.selectedModuleIds,
  });

  if (selectedModuleIds.includes("sdlc")) {
    for (const field of [
      "user_skill_level",
      "planning_artifacts",
      "implementation_artifacts",
      "devops_artifacts",
      "project_knowledge",
    ] satisfies ProjectConfigField[]) {
      await collectConfigValue(io, values, field, locale);
    }
  }

  const defaultIdeTargetIds = input.targetAdapters.map((adapter) => adapter.targetId);
  const ideTargetIds = await collectIdSelection({
    io,
    prompt: createIdSelectionQuestion({
      title: "IDE targets",
      defaultIds: defaultIdeTargetIds,
      itemLabel: "IDE target ids",
    }),
    defaultIds: defaultIdeTargetIds,
    allowedIds: defaultIdeTargetIds,
  });

  return {
    mode: "detailed",
    values,
    selectedModuleIds,
    ideTargetIds,
  };
}

async function confirmPrewriteInstallScope(
  io: CliIo,
  input: PrewriteInstallScopeConfirmationInput,
  locale: CliLocale,
): Promise<void> {
  await promptWithBlock(io, createPrewriteConfirmationPrompt(input, locale));
}

async function confirmSourceAccess(
  io: CliIo,
  input: SourceAccessConfirmationInput,
  locale: CliLocale,
): Promise<void> {
  await promptWithBlock(io, {
    body: input.prompt,
    prompt:
      locale === "en-US"
        ? "Press Enter to confirm this source access intent and continue: "
        : "按 Enter 确认本次 source access intent 并继续: ",
  });
}

async function collectConfigValue(
  io: CliIo,
  values: ConfigInputValues,
  field: ProjectConfigField,
  locale: CliLocale,
): Promise<void> {
  const answer = await promptWithBlock(io, {
    body: locale === "en-US" ? `Detailed config ${field}` : `Detailed config ${field}（详细配置）`,
    prompt:
      locale === "en-US"
        ? `Detailed config ${field}. Press Enter to keep the deterministic default from module metadata: `
        : `Detailed config ${field}: 按 Enter 保留 module metadata 中的确定性默认值: `,
  });
  const trimmed = answer.trim();
  if (trimmed.length > 0) {
    values[field] = trimmed;
  }
}

async function collectRequiredInteractiveConfigValue(
  io: CliIo,
  values: ConfigInputValues,
  field: ProjectConfigField,
  locale: CliLocale,
  mode: "quick" | "detailed",
): Promise<void> {
  const promptLabel = mode === "quick" ? "Quick config" : "Detailed config";
  const localizedMode = mode === "quick" ? "快速配置" : "详细配置";
  while (true) {
    const answer = await promptWithBlock(io, {
      body: locale === "en-US" ? `${promptLabel} ${field}` : `${promptLabel} ${field}（${localizedMode}）`,
      prompt:
        locale === "en-US"
          ? `${promptLabel} ${field}. Enter the user display name to write to _speclite/config.user.toml: `
          : `${promptLabel} ${field}: 请输入写入 _speclite/config.user.toml 的用户显示名: `,
    });
    const trimmed = answer.trim();
    if (trimmed.length > 0) {
      values[field] = trimmed;
      return;
    }

    io.stdout(
      locale === "en-US"
        ? `${field} is required for ${mode} interactive install.\n\n`
        : `${field} 是 ${mode} interactive install 的必填项。\n\n`,
    );
  }
}

async function promptWithBlock(io: CliIo, block: PromptBlock): Promise<string> {
  io.stdout(`${block.body}\n\n`);
  return io.prompt(`${block.prompt}\n`);
}

function createConfigModePrompt(
  input: ConfigInitializationPromptInput,
  locale: CliLocale,
): PromptBlock {
  if (locale === "en-US") {
    return {
      body: [
        "Step 2/4 Configure project",
        "",
        "Choose project configuration mode before any files are written.",
        "",
        "Config mode options",
        "",
        "- quick: Asks for user_name, then uses deterministic defaults for project/language/artifact paths; best when the remaining defaults are acceptable.",
        "- detailed: Lets you adjust project fields, selected modules and IDE targets; best when paths, modules or IDE mirrors need customization.",
        "",
        "Write boundary: this stage does not write _speclite/, _speclite-output/, IDE mirror files, manifest/index files or operation locks.",
      ].join("\n"),
      prompt: "Enter quick or detailed. Press Enter to use quick: ",
    };
  }

  return {
    body: [
      "Step 2/4 Configure project（配置项目）",
      "",
      "在写入任何文件前选择项目配置模式。",
      "",
      "Config mode options（配置模式选项）",
      "",
      "- quick: 要求输入 user_name，并使用 deterministic defaults 生成 project/language/artifact paths；适合接受其余默认值的快速安装。",
      "- detailed: 逐项确认 project fields、selected modules 和 IDE targets；适合需要自定义路径、modules 或 IDE mirrors 的安装。",
      "",
      "Write boundary（写入边界）: 此阶段不会写入 _speclite/、_speclite-output/、IDE mirror files、manifest/index files 或 operation locks。",
      `Default mode: ${input.defaultMode}.`,
    ].join("\n"),
    prompt: "输入 quick 或 detailed。直接按 Enter 使用 quick: ",
  };
}

function createPrewriteConfirmationPrompt(
  input: PrewriteInstallScopeConfirmationInput,
  locale: CliLocale,
): PromptBlock {
  if (locale === "en-US") {
    return {
      body: input.prompt,
      prompt: "Review final install scope before files are written. Press Enter to confirm and continue: ",
    };
  }

  return {
    body: input.localizedPrompts?.["zh-CN"] ?? input.prompt,
    prompt: "请在项目文件写入前复核最终安装范围。按 Enter 确认并继续: ",
  };
}

async function collectIdSelection(input: {
  io: CliIo;
  prompt: string;
  defaultIds: string[];
  allowedIds: string[];
}): Promise<string[]> {
  const answer = await input.io.prompt(input.prompt);
  const selectedIds = parseIdSelection(answer, input.allowedIds);
  return selectedIds.length === 0 ? input.defaultIds : selectedIds;
}

function parseIdSelection(answer: string, allowedIds: string[]): string[] {
  const requestedIds = parseModuleSelectionAnswer(answer);
  const requested = new Set(requestedIds);
  return allowedIds.filter((id) => requested.has(id));
}

function createIdSelectionQuestion(input: {
  title: string;
  defaultIds: string[];
  itemLabel: string;
}): string {
  return [
    `${input.title}: ${formatModuleIdList(input.defaultIds)}.`,
    `Enter ${input.itemLabel} separated by comma or whitespace. Press Enter to keep defaults: `,
  ].join("\n");
}

function formatModuleIdList(moduleIds: string[]): string {
  return moduleIds.length === 0 ? "none" : moduleIds.join(", ");
}

export function isDirectCliEntrypoint(moduleUrl: string, argvPath: string | undefined): boolean {
  if (argvPath === undefined) {
    return false;
  }

  try {
    return realpathSync(fileURLToPath(moduleUrl)) === realpathSync(argvPath);
  } catch {
    return fileURLToPath(moduleUrl) === argvPath;
  }
}

if (isDirectCliEntrypoint(import.meta.url, process.argv[1])) {
  await runCli(process.argv);
}
