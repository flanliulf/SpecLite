import process from "node:process";
import {
  createSyncCommandResult,
  resolveTargetProjectDisplayName,
} from "../diagnostics/command-result.js";
import type { SyncCommandData, SyncCommandResult, ValidationIssue } from "../diagnostics/command-result-schema.js";
import { normalizeTargetDirectory } from "../fs/path-normalizer.js";
import { acquireProjectOperationLock } from "../fs/operation-lock.js";
import { planUpdate } from "../update/update-plan.js";

export type SyncCommandOptions = {
  dryRun?: boolean;
  json?: boolean;
  yes?: boolean;
};

export type SyncCommandRuntime = {
  cwd?: string;
  targetProject?: string;
};

export type SyncCommandOutcome = {
  result: SyncCommandResult;
  exitCode: 0 | 1;
};

export async function runSyncCommand(input: {
  options?: SyncCommandOptions;
  runtime?: SyncCommandRuntime;
  targetDirectory?: string;
} = {}): Promise<SyncCommandOutcome> {
  const cwd = input.runtime?.cwd ?? process.cwd();
  const normalizedTarget = normalizeTargetDirectory({
    cwd,
    ...(input.targetDirectory === undefined ? {} : { targetDirectory: input.targetDirectory }),
  });
  const targetProject = await resolveTargetProjectDisplayName({
    targetRoot: normalizedTarget.targetRoot,
    ...(input.runtime?.targetProject === undefined ? {} : { explicitName: input.runtime.targetProject }),
  });
  const writeAuthorized = input.options?.yes === true && input.options?.dryRun !== true;
  const lock = writeAuthorized
    ? await acquireProjectOperationLock({
        projectRoot: normalizedTarget.targetRoot,
        operation: "sync",
      })
    : undefined;
  if (lock?.ok === false) {
    return createSyncCommandResult({
      targetProject,
      summary: "SpecLite sync stopped before planning because the project operation lock is held.",
      nextActions: ["Wait for the active operation to finish before rerunning sync."],
      data: emptySyncCommandData(),
      issues: [lock.issue],
      commandCompleted: false,
    });
  }

  try {
    const plan = await planUpdate({ projectRoot: normalizedTarget.targetRoot, writeAuthorized });
    const failureLifecycle = extractFailureLifecycle(plan.issues);
    const data: SyncCommandData = {
      syncPlan: { actions: plan.data.updatePlan.actions },
      changedPaths: plan.data.changedPaths,
      skippedPaths: plan.data.skippedPaths,
      conflicts: plan.data.conflicts,
      ...(plan.data.completedSteps === undefined ? {} : { completedSteps: plan.data.completedSteps }),
      ...(plan.data.failedStep === undefined ? {} : { failedStep: plan.data.failedStep }),
      ...(plan.data.pendingSteps === undefined ? {} : { pendingSteps: plan.data.pendingSteps }),
      ...failureLifecycle,
      requiresConfirmation: plan.data.requiresConfirmation,
      writeAuthorized: plan.data.writeAuthorized,
    };
    return createSyncCommandResult({
      targetProject,
      summary:
        failureLifecycle.failedStep === undefined
          ? summarizeSyncResult({ writeAuthorized, data: plan.data })
          : "SpecLite sync stopped after a safe-write failure. Completed, failed and pending steps are reported.",
      nextActions: [
        "Run speclite validate to cross-check installed-state integrity after sync planning.",
        ...(failureLifecycle.failedStep !== undefined
          ? ["Inspect the failed sync target and rerun speclite sync after resolving the blocker."]
          : plan.data.writeAuthorized
          ? ["Review changed paths before continuing with workflow operations."]
          : ["Review the sync plan and rerun speclite sync --yes to authorize non-conflicting installer-owned writes."]),
      ],
      data,
      issues: plan.issues,
      commandCompleted: !plan.blocked,
    });
  } finally {
    await lock?.lock.release();
  }
}

function extractFailureLifecycle(
  issues: ValidationIssue[],
): Pick<SyncCommandData, "completedSteps" | "failedStep" | "pendingSteps"> {
  for (const issue of issues) {
    const details = issue.details;
    if (details === undefined) continue;
    const completedSteps = Array.isArray(details.completedSteps)
      ? details.completedSteps.filter((step): step is string => typeof step === "string")
      : undefined;
    const pendingSteps = Array.isArray(details.pendingSteps)
      ? details.pendingSteps.filter((step): step is string => typeof step === "string")
      : undefined;
    const failedStep = typeof details.failedStep === "string" ? details.failedStep : undefined;
    if (completedSteps !== undefined || failedStep !== undefined || pendingSteps !== undefined) {
      return {
        ...(completedSteps === undefined ? {} : { completedSteps }),
        ...(failedStep === undefined ? {} : { failedStep }),
        ...(pendingSteps === undefined ? {} : { pendingSteps }),
      };
    }
  }
  return {};
}

function emptySyncCommandData(): SyncCommandResult["data"] {
  return {
    syncPlan: { actions: [] },
    changedPaths: [],
    skippedPaths: [],
    conflicts: [],
    requiresConfirmation: false,
    writeAuthorized: false,
  };
}

function summarizeSyncResult(input: {
  writeAuthorized: boolean;
  data: {
    updatePlan: { actions: Array<{ action: string }> };
    changedPaths: string[];
    conflicts: unknown[];
    writeAuthorized: boolean;
  };
}): string {
  if (input.data.conflicts.length > 0) {
    return "SpecLite sync found conflicts before apply. No project files were changed.";
  }
  if (input.data.writeAuthorized) {
    return input.data.changedPaths.length > 0
      ? "SpecLite sync applied authorized installer-owned source-to-mirror reconciliation writes."
      : "SpecLite sync completed with authorization; no file mutations were required.";
  }
  if (input.data.updatePlan.actions.some((action) => action.action === "create" || action.action === "update")) {
    return "SpecLite sync produced an unapplied source-to-mirror reconciliation plan. No project files were changed.";
  }
  return input.writeAuthorized
    ? "SpecLite sync found no installer-owned reconciliation writes to apply."
    : "SpecLite sync found no installer-owned reconciliation writes. No project files were changed.";
}
