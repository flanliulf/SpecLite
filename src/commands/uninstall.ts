import { lstat, readFile, rm } from "node:fs/promises";
import process from "node:process";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import {
  createUninstallCommandResult,
  resolveTargetProjectDisplayName,
} from "../diagnostics/command-result.js";
import type {
  UninstallCommandData,
  UninstallCommandResult,
  ValidationIssue,
} from "../diagnostics/command-result-schema.js";
import { normalizeTargetDirectory, resolveProjectRelativePath } from "../fs/path-normalizer.js";
import { acquireProjectOperationLock } from "../fs/operation-lock.js";
import { hashFile } from "../manifest/hash.js";
import { FilesIndexSchema, type FilesIndexEntry, isProjectRelativePosixPath } from "../manifest/manifest-schema.js";
import { classifyOwnership } from "../update/ownership-model.js";

export type UninstallCommandOptions = {
  dryRun?: boolean;
  json?: boolean;
  yes?: boolean;
};

export type UninstallCommandRuntime = {
  cwd?: string;
  targetProject?: string;
};

export type UninstallCommandOutcome = {
  result: UninstallCommandResult;
  exitCode: 0 | 1;
};

export async function runUninstallCommand(input: {
  options?: UninstallCommandOptions;
  runtime?: UninstallCommandRuntime;
  targetDirectory?: string;
} = {}): Promise<UninstallCommandOutcome> {
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
        operation: "uninstall",
      })
    : undefined;
  if (lock?.ok === false) {
    return createUninstallCommandResult({
      targetProject,
      summary: "SpecLite uninstall stopped before planning because the project operation lock is held.",
      nextActions: ["Wait for the active operation to finish before rerunning uninstall."],
      data: emptyUninstallCommandData(),
      issues: [lock.issue],
      commandCompleted: false,
    });
  }

  try {
    const planning = await planUninstall({ projectRoot: normalizedTarget.targetRoot });
    const apply = writeAuthorized && planning.issues.length === 0
      ? await applyUninstallPlan({
          projectRoot: normalizedTarget.targetRoot,
          actions: planning.data.uninstallPlan.actions,
        })
      : { removedPaths: [] as string[], issues: [] as ValidationIssue[], blocked: false };
    const data: UninstallCommandData = {
      ...planning.data,
      removedPaths: apply.removedPaths,
      requiresConfirmation:
        planning.data.uninstallPlan.actions.some((action) => action.action === "remove") && !writeAuthorized,
      writeAuthorized,
      ...(apply.blocked
        ? {
            completedSteps: apply.removedPaths.map((removedPath) => `removed:${removedPath}`),
            failedStep: "uninstall:remove-installer-owned-path",
            pendingSteps: pendingRemoveSteps(planning.data.uninstallPlan.actions, apply.removedPaths),
          }
        : {}),
    };

    return createUninstallCommandResult({
      targetProject,
      summary: summarizeUninstallResult({ data, blocked: apply.blocked }),
      nextActions: [
        ...(data.writeAuthorized
          ? ["Review removed and preserved paths before deleting any remaining protected project data manually."]
          : ["Review the uninstall plan and rerun speclite uninstall --yes to remove installer-owned paths."]),
      ],
      data,
      issues: [...planning.issues, ...apply.issues],
      commandCompleted: !apply.blocked && planning.issues.length === 0,
    });
  } finally {
    await lock?.lock.release();
  }
}

async function planUninstall(input: { projectRoot: string }): Promise<{
  data: UninstallCommandData;
  issues: ValidationIssue[];
}> {
  const artifactRoot = await readArtifactRoot(input.projectRoot);
  const filesIndexResult = await readFilesIndex(input.projectRoot);
  if (!filesIndexResult.ok) {
    return {
      data: emptyUninstallCommandData(),
      issues: [filesIndexResult.issue],
    };
  }

  const actions: UninstallCommandData["uninstallPlan"]["actions"] = [];
  for (const entry of filesIndexResult.filesIndex.entries) {
    const classification = classifyOwnership({
      relativePath: entry.path,
      artifactRoot,
    });
    const ownership = entry.ownership === "installer-owned" ? classification.ownership : entry.ownership;
    const currentHash = await readCurrentHash(input.projectRoot, entry.path);

    if (ownership === "installer-owned") {
      actions.push({
        affectedPath: entry.path,
        ownership: "installer-owned",
        action: "remove",
        ...(currentHash === undefined ? {} : { currentHash }),
      });
      continue;
    }

    actions.push({
      affectedPath: entry.path,
      ownership,
      action: ownership === "human-owned" ? "preserve" : "manual-action",
      ...(currentHash === undefined ? {} : { currentHash }),
      reason: ownership,
    });
  }

  const preservedPaths = actions
    .filter((action) => action.action === "preserve" || action.action === "manual-action")
    .map((action) => action.affectedPath);

  return {
    data: {
      uninstallPlan: { actions },
      removedPaths: [],
      preservedPaths,
      requiresConfirmation: actions.some((action) => action.action === "remove"),
      writeAuthorized: false,
    },
    issues: [],
  };
}

async function applyUninstallPlan(input: {
  projectRoot: string;
  actions: UninstallCommandData["uninstallPlan"]["actions"];
}): Promise<{
  removedPaths: string[];
  issues: ValidationIssue[];
  blocked: boolean;
}> {
  const removedPaths: string[] = [];
  for (const action of input.actions) {
    if (action.action !== "remove") continue;
    try {
      const target = resolveProjectRelativePath({
        projectRoot: input.projectRoot,
        relativePath: action.affectedPath,
      });
      const targetStat = await lstat(target.absolutePath).catch((error: unknown) => {
        if (isMissingPathError(error)) return undefined;
        throw error;
      });
      await rm(target.absolutePath, { force: true, recursive: targetStat?.isDirectory() === true });
      removedPaths.push(target.relativePath);
    } catch {
      return {
        removedPaths,
        issues: [createUninstallRemoveIssue({ affectedPath: action.affectedPath, removedPaths })],
        blocked: true,
      };
    }
  }
  return { removedPaths, issues: [], blocked: false };
}

function isMissingPathError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT";
}

async function readFilesIndex(projectRoot: string):
  Promise<{ ok: true; filesIndex: { entries: FilesIndexEntry[] } } | { ok: false; issue: ValidationIssue }> {
  try {
    const parsed = JSON.parse(await readFile(path.join(projectRoot, "_speclite/_config/files-index.json"), "utf8")) as unknown;
    return { ok: true, filesIndex: FilesIndexSchema.parse(parsed) };
  } catch {
    return {
      ok: false,
      issue: {
        issueId: "manifest-schema.invalid-files-index",
        category: "manifest-schema",
        severity: "error",
        affectedPath: "_speclite/_config/files-index.json",
        component: "uninstall-command",
        details: { reason: "missing-or-invalid-files-index" },
        impact: "Uninstall cannot determine installer-owned boundaries without a readable files index.",
        suggestedNextStep: "Restore _speclite/_config/files-index.json or inspect installed files manually before uninstall.",
      },
    };
  }
}

async function readArtifactRoot(projectRoot: string): Promise<string> {
  try {
    const parsed = parseYaml(await readFile(path.join(projectRoot, "_speclite/_config/manifest.yaml"), "utf8")) as unknown;
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "paths" in parsed &&
      typeof parsed.paths === "object" &&
      parsed.paths !== null &&
      "artifactRoot" in parsed.paths &&
      typeof parsed.paths.artifactRoot === "string" &&
      isProjectRelativePosixPath(parsed.paths.artifactRoot)
    ) {
      return parsed.paths.artifactRoot;
    }
  } catch {
    return "_speclite-output";
  }
  return "_speclite-output";
}

async function readCurrentHash(projectRoot: string, relativePath: string): Promise<string | undefined> {
  try {
    return await hashFile(resolveProjectRelativePath({ projectRoot, relativePath }).absolutePath);
  } catch {
    return undefined;
  }
}

function emptyUninstallCommandData(): UninstallCommandData {
  return {
    uninstallPlan: { actions: [] },
    removedPaths: [],
    preservedPaths: [],
    requiresConfirmation: false,
    writeAuthorized: false,
  };
}

function pendingRemoveSteps(
  actions: UninstallCommandData["uninstallPlan"]["actions"],
  removedPaths: string[],
): string[] {
  const removed = new Set(removedPaths);
  return actions
    .filter((action) => action.action === "remove" && !removed.has(action.affectedPath))
    .map((action) => `remove:${action.affectedPath}`);
}

function createUninstallRemoveIssue(input: {
  affectedPath: string;
  removedPaths: string[];
}): ValidationIssue {
  return {
    issueId: "file-integrity.uninstall-remove-failed",
    category: "file-integrity",
    severity: "error",
    affectedPath: input.affectedPath,
    component: "uninstall-command",
    details: {
      reason: "remove-failed",
      completedSteps: input.removedPaths.map((removedPath) => `removed:${removedPath}`),
      failedStep: `uninstall:${input.affectedPath}`,
      manualAction: "Inspect permissions for the failed installer-owned path, then rerun uninstall or remove it manually.",
    },
    impact: "Uninstall could not remove an installer-owned path after the plan was authorized.",
    suggestedNextStep: "Inspect the failed path permissions before rerunning uninstall.",
  };
}

function summarizeUninstallResult(input: {
  data: UninstallCommandData;
  blocked: boolean;
}): string {
  if (input.blocked) return "SpecLite uninstall stopped after a remove failure. Protected paths were not removed.";
  if (input.data.writeAuthorized) {
    return input.data.removedPaths.length > 0
      ? "SpecLite uninstall removed authorized installer-owned files and preserved protected paths."
      : "SpecLite uninstall completed with authorization; no installer-owned files required removal.";
  }
  if (input.data.uninstallPlan.actions.some((action) => action.action === "remove")) {
    return "SpecLite uninstall produced an unapplied removal plan. No project files were changed.";
  }
  return "SpecLite uninstall found no installer-owned files to remove.";
}
