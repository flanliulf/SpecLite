import process from "node:process";
import {
  type RepairCommandData,
  type RepairCommandResult,
  type UpdateCommandData,
  type UpdateCommandResult,
  type ValidationIssue,
} from "../diagnostics/command-result-schema.js";
import {
  createRepairCommandResult,
  createUpdateCommandResult,
  resolveTargetProjectDisplayName,
} from "../diagnostics/command-result.js";
import { normalizeTargetDirectory } from "../fs/path-normalizer.js";

export type UpdateCommandOptions = {
  json?: boolean;
  repair?: boolean;
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
  const issue = createUpdateUnavailableIssue(repairRequested);
  const targetProject = await resolveTargetProjectDisplayName({
    targetRoot: normalizedTarget.targetRoot,
    ...(input.runtime?.targetProject === undefined ? {} : { explicitName: input.runtime.targetProject }),
  });

  const summary =
    "SpecLite update implementation is not available until Epic 4. No project files were changed.";
  const nextActions = [
    "Do not rely on this placeholder for update or repair writes.",
    "Resume speclite update after the Epic 4 safe update and repair implementation is available.",
  ];

  if (repairRequested) {
    return createRepairCommandResult({
      command: "update.repair",
      targetProject,
      summary,
      issues: [issue],
      nextActions,
      data: createUnavailableRepairData(),
    });
  }

  return createUpdateCommandResult({
    command: "update",
    targetProject,
    summary,
    issues: [issue],
    nextActions,
    data: createUnavailableUpdateData(),
  });
}

function createUpdateUnavailableIssue(repairRequested: boolean): ValidationIssue {
  return {
    issueId: repairRequested ? "update.repair-not-implemented" : "update.not-implemented",
    category: "update",
    severity: "error",
    component: "update-command",
    details: {
      availableAfter: "Epic 4",
      writeAuthorized: false,
    },
    impact:
      "The command surface exists for contract callers, but update and repair orchestration is intentionally unavailable.",
    suggestedNextStep:
      "Wait for Epic 4 to implement safe update planning, conflict detection and repair application before invoking this workflow for writes.",
  };
}

function createUnavailableUpdateData(): UpdateCommandData {
  return {
    updatePlan: {
      actions: [],
    },
    changedPaths: [],
    skippedPaths: [],
    conflicts: [],
    requiresConfirmation: true,
    writeAuthorized: false,
  };
}

function createUnavailableRepairData(): RepairCommandData {
  return {
    repairPlan: {
      actions: [],
    },
    changedPaths: [],
    skippedPaths: [],
    conflicts: [],
    requiresConfirmation: true,
    writeAuthorized: false,
  };
}
