import process from "node:process";
import {
  type RepairCommandResult,
  type UpdateCommandResult,
} from "../diagnostics/command-result-schema.js";
import {
  createRepairCommandResult,
  createUpdateCommandResult,
  resolveTargetProjectDisplayName,
} from "../diagnostics/command-result.js";
import { normalizeTargetDirectory } from "../fs/path-normalizer.js";
import { acquireProjectOperationLock } from "../fs/operation-lock.js";
import { resolveProjectConfig } from "../config/config-reader.js";
import { planRepair, planUpdate } from "../update/update-plan.js";

export type UpdateCommandOptions = {
  dryRun?: boolean;
  json?: boolean;
  repair?: boolean;
  yes?: boolean;
};

export type UpdateCommandRuntime = {
  cwd?: string;
  targetProject?: string;
};

export type UpdateCommandOutcome = {
  result: UpdateCommandResult | RepairCommandResult;
  exitCode: 0 | 1;
};

export async function runUpdateCommand(input: {
  options?: UpdateCommandOptions;
  runtime?: UpdateCommandRuntime;
  targetDirectory?: string;
} = {}): Promise<UpdateCommandOutcome> {
  const cwd = input.runtime?.cwd ?? process.cwd();
  const normalizedTarget = normalizeTargetDirectory({
    cwd,
    ...(input.targetDirectory === undefined ? {} : { targetDirectory: input.targetDirectory }),
  });
  const repairRequested = input.options?.repair ?? false;
  const targetProject = await resolveUpdateTargetProjectDisplayName({
    targetRoot: normalizedTarget.targetRoot,
    ...(input.runtime?.targetProject === undefined ? {} : { explicitName: input.runtime.targetProject }),
  });
  const writeStageRequested = input.options?.yes === true && input.options?.dryRun !== true;

  const nextActions = [
    "Inspect the plan and conflicts before authorizing any future update writes.",
    "Run speclite validate to cross-check installed-state integrity.",
  ];

  if (repairRequested) {
    const lock = writeStageRequested
      ? await acquireProjectOperationLock({
          projectRoot: normalizedTarget.targetRoot,
          operation: "update.repair",
        })
      : undefined;
    if (lock?.ok === false) {
      return createRepairCommandResult({
        command: "update.repair",
        targetProject,
        summary: "SpecLite update --repair stopped before planning because the project operation lock is held.",
        nextActions: ["Wait for the active operation to finish before rerunning update --repair."],
        data: emptyRepairCommandData(),
        issues: [lock.issue],
        commandCompleted: false,
      });
    }

    try {
      const plan = await planRepair({
        projectRoot: normalizedTarget.targetRoot,
        writeAuthorized: writeStageRequested,
      });
      return createRepairCommandResult({
        command: "update.repair",
        targetProject,
        summary: summarizeRepairResult({ writeAuthorized: writeStageRequested, data: plan.data }),
        nextActions: [
          "Run speclite validate to cross-check installed-state integrity after repair planning.",
          ...(plan.data.writeAuthorized
            ? ["Review changed paths before continuing with workflow operations."]
            : ["Review the repair plan and rerun speclite update --repair --yes to authorize non-conflicting repair writes."]),
        ],
        data: plan.data,
        issues: plan.issues,
        commandCompleted: !plan.blocked,
      });
    } finally {
      await lock?.lock.release();
    }
  }

  const writeAuthorized = input.options?.yes === true && input.options?.dryRun !== true;
  const lock = writeStageRequested
    ? await acquireProjectOperationLock({
        projectRoot: normalizedTarget.targetRoot,
        operation: "update",
      })
    : undefined;
  if (lock?.ok === false) {
    return createUpdateCommandResult({
      command: "update",
      targetProject,
      summary: "SpecLite update stopped before planning because the project operation lock is held.",
      nextActions: ["Wait for the active operation to finish before rerunning update."],
      data: emptyUpdateCommandData(),
      issues: [lock.issue],
      commandCompleted: false,
    });
  }

  try {
    const plan = await planUpdate({ projectRoot: normalizedTarget.targetRoot, writeAuthorized });
    return createUpdateCommandResult({
      command: "update",
      targetProject,
      summary:
        writeAuthorized
          ? "SpecLite update produced an authorized update plan. Story 4.3 does not apply file writes."
          : "SpecLite update produced an unapplied pre-write update plan. No project files were changed.",
      nextActions,
      data: plan.data,
      issues: plan.issues,
      commandCompleted: !plan.blocked,
    });
  } finally {
    await lock?.lock.release();
  }
}

async function resolveUpdateTargetProjectDisplayName(input: {
  targetRoot: string;
  explicitName?: string;
}): Promise<string> {
  const configResult = await resolveProjectConfig({
    projectRoot: input.targetRoot,
    keys: ["core.project_name"],
  });
  const projectName = configResult.value["core.project_name"];
  if (typeof projectName === "string") {
    const trimmed = projectName.trim();
    if (trimmed.length > 0) return trimmed;
  }

  return resolveTargetProjectDisplayName(input);
}

function emptyUpdateCommandData(): UpdateCommandResult["data"] {
  return {
    updatePlan: { actions: [] },
    changedPaths: [],
    skippedPaths: [],
    conflicts: [],
    requiresConfirmation: false,
    writeAuthorized: false,
  };
}

function emptyRepairCommandData(): RepairCommandResult["data"] {
  return {
    repairPlan: { actions: [] },
    changedPaths: [],
    skippedPaths: [],
    conflicts: [],
    requiresConfirmation: false,
    writeAuthorized: false,
  };
}

function summarizeRepairResult(input: {
  writeAuthorized: boolean;
  data: RepairCommandResult["data"];
}): string {
  if (input.data.conflicts.length > 0) {
    return "SpecLite update --repair found remaining conflicts that cannot be safely repaired automatically.";
  }
  if (input.data.writeAuthorized) {
    return input.data.changedPaths.length > 0
      ? "SpecLite update --repair applied authorized installer-owned repair actions with safe write."
      : "SpecLite update --repair completed with authorization; no file mutations were required.";
  }
  if (input.data.repairPlan.actions.length > 0) {
    return "SpecLite update --repair produced an unapplied repair plan. No project files were changed.";
  }
  return input.writeAuthorized
    ? "SpecLite update --repair found no repairable installer-owned drift to apply."
    : "SpecLite update --repair found no repairable installer-owned drift. No project files were changed.";
}
