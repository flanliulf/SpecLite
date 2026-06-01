#!/usr/bin/env node
import { Command } from "commander";
import { createInterface } from "node:readline/promises";
import type { ConfigInputValues, ProjectConfigField } from "../config/config-schema.js";
import {
  renderCommandResultJson,
  renderInstallHumanOutput,
  renderStatusHumanOutput,
  renderUpdateHumanOutput,
  renderValidateHumanOutput,
} from "../diagnostics/output.js";
import {
  runInstallCommand,
  type ConfigInitializationPromptInput,
  type ConfigInitializationSelection,
  type InstallCommandRuntime,
  type ModuleSelectionPromptInput,
  type PrewriteInstallScopeConfirmationInput,
} from "../commands/install.js";
import { registerResolveCommand } from "../commands/resolve.js";
import { runStatusCommand, type StatusCommandRuntime } from "../commands/status.js";
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
  runtime?: InstallCommandRuntime & StatusCommandRuntime & ValidateCommandRuntime & UpdateCommandRuntime;
};

export function createSpecliteProgram(options: CreateCliOptions = {}): Command {
  const io = createCliIo(options.io);
  const program = new Command();

  program.name("speclite").description("SpecLite local-first CLI control plane.");
  program.exitOverride();

  registerResolveCommand(program, io);

  program
    .command("update")
    .description("Expose the SpecLite update command surface before Epic 4 implementation.")
    .argument("[target-directory]", "Project directory to update.")
    .option("--repair", "Use the explicit repair command id and repair placeholder.")
    .option("--json", "Emit machine-readable CommandResult JSON.")
    .option("--dry-run", "Generate an unapplied update plan without authorizing writes.")
    .option("--yes", "Authorize non-conflicting planned update writes.")
    .action(
      async (
        targetDirectory: string | undefined,
        commandOptions: { dryRun?: boolean; repair?: boolean; json?: boolean; yes?: boolean },
      ) => {
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
          io.stdout(renderUpdateHumanOutput(outcome.result));
        }

        io.setExitCode(outcome.exitCode);
      },
    );

  program
    .command("status")
    .description("Inspect the local SpecLite installed-state summary.")
    .argument("[target-directory]", "Project directory to inspect.")
    .option("--json", "Emit machine-readable CommandResult JSON.")
    .action(async (targetDirectory: string | undefined, commandOptions: { json?: boolean }) => {
      const outcome = await runStatusCommand({
        options: { json: commandOptions.json ?? false },
        ...(options.runtime === undefined ? {} : { runtime: options.runtime }),
        ...(targetDirectory === undefined ? {} : { targetDirectory }),
      });

      if (commandOptions.json) {
        io.stdout(renderCommandResultJson(outcome.result));
      } else {
        io.stdout(renderStatusHumanOutput(outcome.result));
      }

      io.setExitCode(outcome.exitCode);
    });

  program
    .command("validate")
    .description("Validate the local SpecLite installed-state schema projection.")
    .argument("[target-directory]", "Project directory to validate.")
    .option("--json", "Emit machine-readable CommandResult JSON.")
    .action(async (targetDirectory: string | undefined, commandOptions: { json?: boolean }) => {
      const outcome = await runValidateCommand({
        options: { json: commandOptions.json ?? false },
        ...(options.runtime === undefined ? {} : { runtime: options.runtime }),
        ...(targetDirectory === undefined ? {} : { targetDirectory }),
      });

      if (commandOptions.json) {
        io.stdout(renderCommandResultJson(outcome.result));
      } else {
        io.stdout(renderValidateHumanOutput(outcome.result));
      }

      io.setExitCode(outcome.exitCode);
    });

  program
    .command("install")
    .description("Run the SpecLite install preflight and install command skeleton.")
    .argument("[target-directory]", "Project directory to inspect before installing SpecLite.")
    .option("--json", "Emit machine-readable CommandResult JSON.")
    .option("--yes", "Authorize command-level writes after preflight gates pass.")
    .action(async (targetDirectory: string | undefined, commandOptions: { json?: boolean; yes?: boolean }) => {
      const installInput = {
        options: { json: commandOptions.json ?? false, yes: commandOptions.yes ?? false },
        ...(options.runtime === undefined ? {} : { runtime: options.runtime }),
        ...(commandOptions.json === true
          ? {}
          : {
              selectModuleIds: async (selectionInput: ModuleSelectionPromptInput) =>
                parseModuleSelectionAnswer(
                  await io.prompt(createModuleSelectionQuestion(selectionInput)),
                ),
              configureProject: async (configInput: ConfigInitializationPromptInput) =>
                collectConfigInitializationSelection(io, configInput),
              confirmPrewriteInstallScope: async (confirmationInput: PrewriteInstallScopeConfirmationInput) =>
                confirmPrewriteInstallScope(io, confirmationInput),
            }),
        ...(targetDirectory === undefined ? {} : { targetDirectory }),
      };
      const outcome = await runInstallCommand(installInput);

      if (commandOptions.json) {
        io.stdout(renderCommandResultJson(outcome.result));
      } else {
        io.stdout(renderInstallHumanOutput(outcome.result));
      }

      io.setExitCode(outcome.exitCode);
    });

  return program;
}

export async function runCli(
  argv: string[],
  options: CreateCliOptions = {},
): Promise<void> {
  await createSpecliteProgram(options).parseAsync(argv, { from: "node" });
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

function createModuleSelectionQuestion(input: ModuleSelectionPromptInput): string {
  const moduleLines = input.modules.map((module) => {
    const scope = module.capabilitySummary.join(", ") || module.description;
    return `- ${module.code}: ${module.name} ${module.version}; scope: ${scope}`;
  });

  return [
    "Select SpecLite official modules before any project files are written.",
    "Available modules:",
    ...moduleLines,
    `Required modules: ${formatModuleIdList(input.requiredModuleIds)}.`,
    `Default selected modules: ${formatModuleIdList(input.defaultSelectedModuleIds)}.`,
    "Enter one or more module ids separated by comma or whitespace. Press Enter to use defaults: ",
  ].join("\n");
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
): Promise<ConfigInitializationSelection> {
  const modeSelection = parseConfigInitializationAnswer(await io.prompt(input.prompt));
  if (modeSelection.mode !== "detailed") {
    return modeSelection;
  }

  const values: ConfigInputValues = {};
  for (const field of [
    "user_name",
    "project_name",
    "communication_language",
    "document_output_language",
    "output_folder",
  ] satisfies ProjectConfigField[]) {
    await collectConfigValue(io, values, field);
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
      "project_knowledge",
    ] satisfies ProjectConfigField[]) {
      await collectConfigValue(io, values, field);
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
): Promise<void> {
  await io.prompt(`${input.prompt}\nReview final install scope before files are written. Press Enter to confirm and continue: `);
}

async function collectConfigValue(
  io: CliIo,
  values: ConfigInputValues,
  field: ProjectConfigField,
): Promise<void> {
  const answer = await io.prompt(
    `Detailed config ${field}. Press Enter to keep the deterministic default from module metadata: `,
  );
  const trimmed = answer.trim();
  if (trimmed.length > 0) {
    values[field] = trimmed;
  }
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

if (import.meta.url === `file://${process.argv[1]}`) {
  await runCli(process.argv);
}
