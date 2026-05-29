import { readFile } from "node:fs/promises";
import path from "node:path";
import { parseConfigToml } from "../config/config-reader.js";
import type {
  CommandPathSummary,
  CommandId,
  IdeTargetStatus,
  InstallCommandData,
  InstallCommandResult,
  RepairCommandData,
  RepairCommandResult,
  UpdateCommandData,
  UpdateCommandResult,
  ValidateCommandData,
  ValidateCommandResult,
  ValidationIssue,
} from "./command-result-schema.js";
import { COMMAND_RESULT_SCHEMA_VERSION } from "./command-result-schema.js";
import {
  PREWRITE_BUNDLED_SOURCE_DESCRIPTOR,
  type SourceDescriptor,
} from "../source/source-descriptor-schema.js";
import {
  createZeroIssueCounts,
  sortValidationIssues,
} from "../validation/validation-order.js";
import { INSTALL_LIFECYCLE_STEP_IDS, projectInstallLifecycleState } from "../installer/progress-events.js";

export { sortValidationIssues } from "../validation/validation-order.js";

export const INSTALL_LIFECYCLE_STEPS = [
  ...INSTALL_LIFECYCLE_STEP_IDS,
] as const;

export const DEFAULT_INSTALL_MANIFEST_VERSION = "speclite.manifest.v1" as const;

export function createPrewriteInstallData(input: {
  sourceDescriptor?: SourceDescriptor;
  completedSteps: string[];
  pendingSteps: string[];
  manifestVersion?: string;
  installedModules?: string[];
  ideTargets?: IdeTargetStatus[];
  paths?: CommandPathSummary;
}): InstallCommandData {
  const lifecycleState = projectInstallLifecycleState({
    completedSteps: input.completedSteps,
  });

  return {
    sourceDescriptor: input.sourceDescriptor ?? PREWRITE_BUNDLED_SOURCE_DESCRIPTOR,
    manifestVersion: input.manifestVersion ?? DEFAULT_INSTALL_MANIFEST_VERSION,
    installedModules: input.installedModules ?? [],
    ideTargets: input.ideTargets ?? [],
    paths: input.paths ?? {
      projectRoot: ".",
    },
    completedSteps: lifecycleState.completedSteps,
    pendingSteps: lifecycleState.pendingSteps,
  };
}

export function createInstallFailureResult(input: {
  targetProject: string;
  issues: ValidationIssue[];
  completedSteps: string[];
  pendingSteps: string[];
  nextActions: string[];
  summary?: string;
  data?: Partial<
    Pick<
      InstallCommandData,
      "manifestVersion" | "installedModules" | "ideTargets" | "paths"
      | "sourceDescriptor"
    >
  >;
}): InstallCommandResult {
  const issues = sortValidationIssues(input.issues);

  return {
    schemaVersion: COMMAND_RESULT_SCHEMA_VERSION,
    status: "failure",
    command: "install",
    targetProject: input.targetProject,
    summary:
      input.summary ??
      "SpecLite install preflight failed before any project files were changed.",
    issues,
    nextActions: input.nextActions,
    data: createPrewriteInstallData({
      completedSteps: input.completedSteps,
      pendingSteps: input.pendingSteps,
      ...input.data,
    }),
  };
}

export function createInstallSuccessResult(input: {
  targetProject: string;
  completedSteps: string[];
  pendingSteps: string[];
  summary?: string;
  nextActions?: string[];
  data?: Partial<
    Pick<
      InstallCommandData,
      "manifestVersion" | "installedModules" | "ideTargets" | "paths"
      | "sourceDescriptor"
    >
  >;
}): InstallCommandResult {
  return {
    schemaVersion: COMMAND_RESULT_SCHEMA_VERSION,
    status: "success",
    command: "install",
    targetProject: input.targetProject,
    summary:
      input.summary ?? "SpecLite install preflight completed; later install stages are pending.",
    issues: [],
    nextActions: input.nextActions ?? ["Continue with the next install planning stage."],
    data: createPrewriteInstallData({
      completedSteps: input.completedSteps,
      pendingSteps: input.pendingSteps,
      ...input.data,
    }),
  };
}

export function createValidateCommandResult(input: {
  targetProject: string;
  issues: ValidationIssue[];
  data: ValidateCommandData;
}): {
  result: ValidateCommandResult;
  exitCode: 0 | 1;
} {
  const issues = sortValidationIssues(input.issues);
  const data = {
    ...input.data,
    issueCounts: countValidationIssues(issues),
  };
  const status = getValidateStatus(issues);

  return {
    result: {
      schemaVersion: COMMAND_RESULT_SCHEMA_VERSION,
      status,
      command: "validate",
      targetProject: input.targetProject,
      summary:
        issues.length === 0
          ? "SpecLite validate completed for checked categories."
          : "SpecLite validate found issues in checked categories.",
      issues,
      nextActions:
        issues.length === 0
          ? ["Continue with local workflow operations that depend on installed-state metadata."]
          : ["Inspect manifest-schema issues and repair or reinstall installed-state metadata."],
      data,
    },
    exitCode: status === "failure" ? 1 : 0,
  };
}

export function createUpdateCommandResult(input: {
  command: "update";
  targetProject: string;
  summary: string;
  data: UpdateCommandData;
  issues?: ValidationIssue[];
  nextActions: string[];
  commandCompleted?: boolean;
}): {
  result: UpdateCommandResult;
  exitCode: 0 | 1;
} {
  const data = sortUpdateCommandData(input.data);
  const issues = projectUpdateCommandIssues({
    issues: input.issues ?? [],
    conflictCount: data.conflicts.length,
  });
  const status = deriveCommandStatus({
    issues,
    commandCompleted: input.commandCompleted ?? true,
    hasBlockingConflicts: data.conflicts.length > 0,
  });

  return {
    result: {
      schemaVersion: COMMAND_RESULT_SCHEMA_VERSION,
      status,
      command: input.command,
      targetProject: input.targetProject,
      summary: input.summary,
      issues,
      nextActions: input.nextActions,
      data,
    },
    exitCode: getExitCodeForStatus(status),
  };
}

export function createRepairCommandResult(input: {
  command: "update.repair";
  targetProject: string;
  summary: string;
  data: RepairCommandData;
  issues?: ValidationIssue[];
  nextActions: string[];
  commandCompleted?: boolean;
}): {
  result: RepairCommandResult;
  exitCode: 0 | 1;
} {
  const data = sortRepairCommandData(input.data);
  const issues = projectUpdateCommandIssues({
    issues: input.issues ?? [],
    conflictCount: data.conflicts.length,
  });
  const status = deriveCommandStatus({
    issues,
    commandCompleted: input.commandCompleted ?? true,
    hasBlockingConflicts: data.conflicts.length > 0,
  });

  return {
    result: {
      schemaVersion: COMMAND_RESULT_SCHEMA_VERSION,
      status,
      command: input.command,
      targetProject: input.targetProject,
      summary: input.summary,
      issues,
      nextActions: input.nextActions,
      data,
    },
    exitCode: getExitCodeForStatus(status),
  };
}

export function deriveCommandStatus(input: {
  issues: ValidationIssue[];
  commandCompleted?: boolean;
  hasBlockingConflicts?: boolean;
}): InstallCommandResult["status"] {
  if (input.commandCompleted === false || input.hasBlockingConflicts === true) return "failure";
  if (input.issues.some((issue) => issue.severity === "critical" || issue.severity === "error")) {
    return "failure";
  }
  if (input.issues.some((issue) => issue.severity === "warning")) return "warning";
  return "success";
}

export function getExitCodeForStatus(status: InstallCommandResult["status"]): 0 | 1 {
  return status === "failure" ? 1 : 0;
}

export function normalizeCommandId(input: {
  command: "install" | "status" | "validate" | "update";
  repair?: boolean;
}): CommandId {
  if (input.command === "update" && input.repair === true) return "update.repair";
  return input.command;
}

export async function resolveTargetProjectDisplayName(input: {
  targetRoot: string;
  explicitName?: string;
}): Promise<string> {
  const configName = await readConfigProjectName(input.targetRoot);
  if (configName !== undefined) return configName;

  const explicitName = input.explicitName?.trim();
  if (explicitName !== undefined && explicitName.length > 0) return explicitName;

  return path.basename(input.targetRoot.replace(/[\\/]+$/, "")) || "project";
}

function compareLexicographic(left: string, right: string): number {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

function getValidateStatus(issues: ValidationIssue[]): ValidateCommandResult["status"] {
  return deriveCommandStatus({ issues });
}

function countValidationIssues(issues: ValidationIssue[]): ValidateCommandData["issueCounts"] {
  const issueCounts = createZeroIssueCounts();
  for (const issue of issues) {
    issueCounts[issue.severity] += 1;
  }
  return issueCounts;
}

function projectUpdateCommandIssues(input: {
  issues: ValidationIssue[];
  conflictCount: number;
}): ValidationIssue[] {
  const issues = input.issues.filter((issue) => issue.issueId !== "update.conflicts");
  if (input.conflictCount > 0) {
    issues.push({
      issueId: "update.conflicts",
      category: "update",
      severity: "error",
      component: "update-command",
      details: {
        conflictCount: input.conflictCount,
      },
      impact: "Update planning found one or more path-level conflicts.",
      suggestedNextStep: "Inspect the conflict details before authorizing update writes.",
    });
  }
  return sortValidationIssues(issues);
}

function sortUpdateCommandData(data: UpdateCommandData): UpdateCommandData {
  return {
    ...data,
    updatePlan: {
      actions: [...data.updatePlan.actions].sort(compareUpdatePlanActions),
    },
    changedPaths: sortPaths(data.changedPaths),
    skippedPaths: sortPaths(data.skippedPaths),
    conflicts: [...data.conflicts].sort(compareUpdateConflicts),
  };
}

function sortRepairCommandData(data: RepairCommandData): RepairCommandData {
  return {
    ...data,
    repairPlan: {
      actions: [...data.repairPlan.actions].sort(compareRepairPlanActions),
    },
    changedPaths: sortPaths(data.changedPaths),
    skippedPaths: sortPaths(data.skippedPaths),
    conflicts: [...data.conflicts].sort(compareUpdateConflicts),
  };
}

function compareUpdatePlanActions(
  left: UpdateCommandData["updatePlan"]["actions"][number],
  right: UpdateCommandData["updatePlan"]["actions"][number],
): number {
  return (
    compareLexicographic(left.affectedPath, right.affectedPath) ||
    compareLexicographic(left.action, right.action) ||
    compareLexicographic(left.ownership, right.ownership) ||
    compareLexicographic(left.reason ?? "", right.reason ?? "")
  );
}

function compareRepairPlanActions(
  left: RepairCommandData["repairPlan"]["actions"][number],
  right: RepairCommandData["repairPlan"]["actions"][number],
): number {
  return (
    compareLexicographic(left.affectedPath, right.affectedPath) ||
    compareLexicographic(left.action, right.action) ||
    compareLexicographic(left.reason ?? "", right.reason ?? "")
  );
}

function compareUpdateConflicts(
  left: UpdateCommandData["conflicts"][number],
  right: UpdateCommandData["conflicts"][number],
): number {
  return (
    compareLexicographic(left.affectedPath, right.affectedPath) ||
    compareLexicographic(left.ownership, right.ownership) ||
    compareLexicographic(left.reason, right.reason)
  );
}

function sortPaths(paths: string[]): string[] {
  return [...paths].sort(compareLexicographic);
}

async function readConfigProjectName(targetRoot: string): Promise<string | undefined> {
  try {
    const parsed = parseConfigToml(await readFile(path.join(targetRoot, "_speclite/config.toml"), "utf8"));
    const projectName = parsed.core?.project_name?.trim();
    return projectName === undefined || projectName.length === 0 ? undefined : projectName;
  } catch {
    return undefined;
  }
}
