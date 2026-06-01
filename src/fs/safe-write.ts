import { constants } from "node:fs";
import { lstat, mkdir, open, readdir, realpath, rm, rename } from "node:fs/promises";
import path from "node:path";
import type { ValidationIssue } from "../diagnostics/command-result-schema.js";
import { createPrivateOperationId, hashBytes, hashFile, type FileHash } from "../manifest/hash.js";
import type { FileOwnership } from "../update/ownership-model.js";
import { classifyOwnership } from "../update/ownership-model.js";
import { resolveProjectRelativePath } from "./path-normalizer.js";

export { acquireProjectOperationLock, type OperationLockHandle } from "./operation-lock.js";

export type SafeWriteResult =
  | {
      ok: true;
      path: string;
      hash: `sha256:${string}`;
      executable: boolean;
    }
  | {
      ok: false;
      issue: ValidationIssue;
    };

export async function ensureSafeDirectory(input: {
  projectRoot: string;
  relativePath: string;
  component?: string;
}): Promise<
  | {
      ok: true;
      path: string;
    }
  | {
      ok: false;
      issue: ValidationIssue;
    }
> {
  const safety = await validateProjectPath({
    projectRoot: input.projectRoot,
    relativePath: input.relativePath,
    component: input.component ?? "artifact-directory",
    allowExistingFile: false,
  });
  if (!safety.ok) return safety;

  await mkdir(safety.absolutePath, { recursive: true });
  return { ok: true, path: safety.relativePath };
}

export async function safeWriteFile(input: {
  projectRoot: string;
  relativePath: string;
  contents: Buffer | string;
  executable?: boolean;
  allowExisting?: boolean;
  expectedExistingFile?: {
    ownership: FileOwnership;
    hash: FileHash;
    artifactRoot?: string;
  };
  component?: string;
  operationId?: string;
}): Promise<SafeWriteResult> {
  const safety = await validateProjectPath({
    projectRoot: input.projectRoot,
    relativePath: input.relativePath,
    component: input.component ?? "safe-write",
    allowExistingFile: input.allowExisting === true,
    expectedExistingFile: input.expectedExistingFile,
  });
  if (!safety.ok) return safety;

  const parent = path.dirname(safety.absolutePath);
  await mkdir(parent, { recursive: true });

  const operationId = input.operationId ?? createPrivateOperationId();
  const tempPath = path.join(parent, `.speclite-tmp-${operationId}`);
  const tempRelativePath = toProjectRelativePosixPath(input.projectRoot, tempPath);
  let tempHandle: Awaited<ReturnType<typeof open>> | undefined;
  try {
    tempHandle = await open(
      tempPath,
      constants.O_CREAT | constants.O_EXCL | constants.O_WRONLY,
      input.executable === true ? 0o755 : 0o644,
    );
    await tempHandle.writeFile(input.contents);
    await tempHandle.close();
    tempHandle = undefined;
    await rename(tempPath, safety.absolutePath);
  } catch (error) {
    await tempHandle?.close();
    try {
      await rm(tempPath, { force: true });
    } catch {
      return {
        ok: false,
        issue: createStaleTempIssue({
          affectedPath: tempRelativePath,
          component: input.component ?? "safe-write",
          reason: "cleanup-failed",
          failedStep: "cleanup-temp-file",
          pendingSteps: ["remove-stale-temp-file", "rerun-write"],
          impact: "SpecLite could not clean up a same-directory safe-write temporary path after a write failure.",
          suggestedNextStep:
            "Confirm no SpecLite write operation is active, remove the stale .speclite-tmp path manually, then rerun the command.",
        }),
      };
    }
    return {
      ok: false,
      issue: createStaleTempIssue({
        affectedPath: safety.relativePath,
        component: input.component ?? "safe-write",
        reason: "safe-write-failed",
        failedStep: "temp-write-rename",
        pendingSteps: ["rename-target"],
        impact: "SpecLite could not complete the same-directory temp-write and rename safely.",
        suggestedNextStep: "Inspect the target path permissions and rerun the command.",
      }),
    };
  }

  return {
    ok: true,
    path: safety.relativePath,
    hash: hashBytes(input.contents),
    executable: input.executable === true,
  };
}

async function validateProjectPath(input: {
  projectRoot: string;
  relativePath: string;
  component: string;
  allowExistingFile: boolean;
  expectedExistingFile?: {
    ownership: FileOwnership;
    hash: FileHash;
    artifactRoot?: string;
  };
}): Promise<
  | {
      ok: true;
      relativePath: string;
      absolutePath: string;
    }
  | {
      ok: false;
      issue: ValidationIssue;
    }
> {
  let resolved: ReturnType<typeof resolveProjectRelativePath>;
  try {
    resolved = resolveProjectRelativePath({
      projectRoot: input.projectRoot,
      relativePath: input.relativePath,
    });
  } catch {
    return {
      ok: false,
      issue: createFileIssue({
        issueId: "file-integrity.unsafe-overwrite-risk",
        affectedPath: input.relativePath,
        component: input.component,
        reason: "path-escapes-project",
        impact: "The planned write path is not safely contained inside the target project.",
      }),
    };
  }

  const symlinkIssue = await findSymlinkSegment(input.projectRoot, resolved.relativePath, input.component);
  if (symlinkIssue !== undefined) {
    return { ok: false, issue: symlinkIssue };
  }

  const caseIssue = await findCaseConflict(input.projectRoot, resolved.relativePath, input.component);
  if (caseIssue !== undefined) {
    return { ok: false, issue: caseIssue };
  }

  try {
    const stat = await lstat(resolved.absolutePath);
    if (stat.isDirectory() && input.allowExistingFile) {
      return {
        ok: false,
        issue: createFileIssue({
          issueId: "file-integrity.unsafe-overwrite-risk",
          affectedPath: resolved.relativePath,
          component: input.component,
          reason: "target-is-directory",
          impact: "The planned installer-owned write targets a directory instead of a file.",
        }),
      };
    }
    if (!stat.isFile() && input.allowExistingFile) {
      return {
        ok: false,
        issue: createFileIssue({
          issueId: "file-integrity.unsafe-overwrite-risk",
          affectedPath: resolved.relativePath,
          component: input.component,
          reason: "target-is-not-file",
          impact: "The planned installer-owned write targets a non-file path.",
        }),
      };
    }
    if (stat.isFile() && input.allowExistingFile) {
      const baselineIssue = await validateExistingFileBaseline({
        projectRoot: input.projectRoot,
        relativePath: resolved.relativePath,
        absolutePath: resolved.absolutePath,
        component: input.component,
        expectedExistingFile: input.expectedExistingFile,
      });
      if (baselineIssue !== undefined) return { ok: false, issue: baselineIssue };
    }
    if (stat.isFile() && !input.allowExistingFile) {
      return {
        ok: false,
        issue: createFileIssue({
          issueId: "file-integrity.unsafe-overwrite-risk",
          affectedPath: resolved.relativePath,
          component: input.component,
          reason: "target-exists",
          impact: "The planned installer-owned write would overwrite an existing file.",
        }),
      };
    }
    if (!stat.isDirectory() && input.allowExistingFile === false && input.component === "artifact-directory") {
      return {
        ok: false,
        issue: createFileIssue({
          issueId: "file-integrity.unsafe-overwrite-risk",
          affectedPath: resolved.relativePath,
          component: input.component,
          reason: "directory-path-is-file",
          impact: "The planned directory path is occupied by a non-directory.",
        }),
      };
    }
  } catch (error) {
    if (!isMissingPathError(error)) throw error;
  }

  return { ok: true, ...resolved };
}

async function validateExistingFileBaseline(input: {
  projectRoot: string;
  relativePath: string;
  absolutePath: string;
  component: string;
  expectedExistingFile?: {
    ownership: FileOwnership;
    hash: FileHash;
    artifactRoot?: string;
  };
}): Promise<ValidationIssue | undefined> {
  if (input.expectedExistingFile === undefined) {
    return createFileIssue({
      issueId: "file-integrity.unsafe-overwrite-risk",
      affectedPath: input.relativePath,
      component: input.component,
      reason: "missing-existing-file-baseline",
      impact: "The planned overwrite lacks an installer-owned ownership and hash baseline.",
    });
  }

  if (input.expectedExistingFile.ownership !== "installer-owned") {
    return createFileIssue({
      issueId: "file-integrity.unsafe-overwrite-risk",
      affectedPath: input.relativePath,
      component: input.component,
      reason: "protected-ownership",
      impact: "The planned overwrite targets a file whose baseline ownership is protected.",
    });
  }

  const classification = classifyOwnership({
    relativePath: input.relativePath,
    artifactRoot: input.expectedExistingFile.artifactRoot,
  });
  if (classification.ownership !== "installer-owned") {
    return createFileIssue({
      issueId: "file-integrity.unsafe-overwrite-risk",
      affectedPath: input.relativePath,
      component: input.component,
      reason: classification.ownership === "unknown" ? "unknown-ownership" : "protected-ownership",
      impact: "The planned overwrite targets a path that is not classified as installer-owned.",
    });
  }

  const staleTempIssue = await findStaleTempBlocker({
    projectRoot: input.projectRoot,
    relativePath: input.relativePath,
    absolutePath: input.absolutePath,
    component: input.component,
  });
  if (staleTempIssue !== undefined) return staleTempIssue;

  const currentHash = await hashFile(input.absolutePath);
  if (currentHash !== input.expectedExistingFile.hash) {
    return createFileIssue({
      issueId: "file-integrity.unsafe-overwrite-risk",
      affectedPath: input.relativePath,
      component: input.component,
      reason: "baseline-hash-mismatch",
      impact: "The planned overwrite target changed after planning and no longer matches the expected baseline.",
    });
  }

  return undefined;
}

async function findStaleTempBlocker(input: {
  projectRoot: string;
  relativePath: string;
  absolutePath: string;
  component: string;
}): Promise<ValidationIssue | undefined> {
  const parent = path.dirname(input.absolutePath);
  let entries: Awaited<ReturnType<typeof readdir>>;
  try {
    entries = await readdir(parent, { withFileTypes: true });
  } catch (error) {
    if (isMissingPathError(error)) return undefined;
    throw error;
  }

  const parentRelative = path.posix.dirname(input.relativePath);
  const staleTempEntry = entries
    .filter((entry) => entry.name.startsWith(".speclite-tmp-"))
    .sort((left, right) => left.name.localeCompare(right.name))[0];
  if (staleTempEntry === undefined) return undefined;

  const affectedPath =
    parentRelative === "."
      ? staleTempEntry.name
      : `${parentRelative}/${staleTempEntry.name}`;
  return createStaleTempIssue({
    affectedPath,
    component: input.component,
    reason: "stale-temp-file-blocking",
    failedStep: "existing-target-preflight",
    pendingSteps: ["remove-stale-temp-file", "rerun-write"],
    impact: "A stale safe-write temporary path blocks overwriting the installer-owned target safely.",
    suggestedNextStep:
      "Confirm no SpecLite write operation is active, remove the stale .speclite-tmp path manually, then rerun the command.",
  });
}

async function findSymlinkSegment(
  projectRoot: string,
  relativePath: string,
  component: string,
): Promise<ValidationIssue | undefined> {
  const segments = relativePath.split("/");
  let current = projectRoot;

  for (const segment of segments) {
    current = path.join(current, segment);
    try {
      const stat = await lstat(current);
      if (stat.isSymbolicLink()) {
        return {
          issueId: "artifact-path.symlink-escape",
          category: "artifact-path",
          severity: "error",
          affectedPath: relativePath,
          component,
          details: {
            reason: "existing-path-segment-is-symlink",
          },
          impact: "The planned path crosses a symlink and cannot be proven to stay inside the target project.",
          suggestedNextStep: "Replace the symlinked path segment with a real project directory before continuing.",
        };
      }
      await realpath(current);
    } catch (error) {
      if (isMissingPathError(error)) return undefined;
      throw error;
    }
  }

  return undefined;
}

async function findCaseConflict(
  projectRoot: string,
  relativePath: string,
  component: string,
): Promise<ValidationIssue | undefined> {
  const segments = relativePath.split("/");
  let current = projectRoot;

  for (const segment of segments) {
    try {
      const entries = await readdir(current);
      if (entries.some((entry) => entry !== segment && entry.toLowerCase() === segment.toLowerCase())) {
        return createFileIssue({
          issueId: "file-integrity.case-conflict",
          affectedPath: relativePath,
          component,
          reason: "case-insensitive-path-conflict",
          impact: "The planned write path conflicts with an existing path by case only.",
        });
      }
    } catch (error) {
      if (isMissingPathError(error)) return undefined;
      throw error;
    }
    current = path.join(current, segment);
  }

  return undefined;
}

function createFileIssue(input: {
  issueId: "file-integrity.unsafe-overwrite-risk" | "file-integrity.case-conflict";
  affectedPath: string;
  component: string;
  reason: string;
  impact: string;
}): ValidationIssue {
  return {
    issueId: input.issueId,
    category: "file-integrity",
    severity: input.issueId === "file-integrity.unsafe-overwrite-risk" ? "critical" : "error",
    affectedPath: input.affectedPath,
    component: input.component,
    details: {
      reason: input.reason,
    },
    impact: input.impact,
    suggestedNextStep: "Inspect the existing target path and rerun install after resolving the conflict.",
  };
}

function createStaleTempIssue(input: {
  affectedPath: string;
  component: string;
  reason: "safe-write-failed" | "cleanup-failed" | "stale-temp-file-blocking";
  failedStep: string;
  pendingSteps: string[];
  impact: string;
  suggestedNextStep: string;
}): ValidationIssue {
  return {
    issueId: "file-integrity.stale-temp-file",
    category: "file-integrity",
    severity: "error",
    affectedPath: input.affectedPath,
    component: input.component,
    details: {
      reason: input.reason,
      completedSteps: [],
      failedStep: input.failedStep,
      pendingSteps: input.pendingSteps,
      changedPaths: [],
      manualAction:
        "Confirm no SpecLite write operation is active, remove any stale .speclite-tmp path if present, then rerun the command.",
    },
    impact: input.impact,
    suggestedNextStep: input.suggestedNextStep,
  };
}

function toProjectRelativePosixPath(projectRoot: string, absolutePath: string): string {
  return path.relative(projectRoot, absolutePath).split(path.sep).join("/");
}

function isMissingPathError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "ENOENT"
  );
}
