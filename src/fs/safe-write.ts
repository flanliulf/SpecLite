import { constants } from "node:fs";
import { lstat, mkdir, open, readdir, realpath, rm, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ValidationIssue } from "../diagnostics/command-result-schema.js";
import { createPrivateOperationId, hashBytes } from "../manifest/hash.js";
import { resolveProjectRelativePath } from "./path-normalizer.js";

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

export type OperationLockHandle = {
  path: "_speclite/.lock";
  release: () => Promise<void>;
};

export async function acquireProjectOperationLock(input: {
  projectRoot: string;
  operation: "install" | "update" | "update.repair";
}): Promise<
  | {
      ok: true;
      lock: OperationLockHandle;
    }
  | {
      ok: false;
      issue: ValidationIssue;
    }
> {
  const lockParent = resolveProjectRelativePath({
    projectRoot: input.projectRoot,
    relativePath: "_speclite",
  });
  const lockPath = resolveProjectRelativePath({
    projectRoot: input.projectRoot,
    relativePath: "_speclite/.lock",
  });

  await mkdir(lockParent.absolutePath, { recursive: true });

  let handle: Awaited<ReturnType<typeof open>> | undefined;
  try {
    handle = await open(lockPath.absolutePath, constants.O_CREAT | constants.O_EXCL | constants.O_WRONLY);
    await handle.writeFile(
      JSON.stringify(
        {
          schemaVersion: "speclite.operation-lock.v1",
          operation: input.operation,
          pid: globalThis.process?.pid,
          createdAt: new Date().toISOString(),
          projectRootHash: hashBytes(path.resolve(input.projectRoot)),
        },
        null,
        2,
      ),
      "utf8",
    );
  } catch (error) {
    await handle?.close();
    if (isFileExistsError(error)) {
      return {
        ok: false,
        issue: {
          issueId: "operation-lock.project-locked",
          category: "operation-lock",
          severity: "error",
          affectedPath: "_speclite/.lock",
          component: "project-operation-lock",
          details: {
            reason: "lock-file-exists",
          },
          impact: "Another SpecLite write-capable operation appears to hold the project lock.",
          suggestedNextStep: "Wait for the active operation to finish, or inspect _speclite/.lock before manual cleanup.",
        },
      };
    }
    throw error;
  }

  await handle.close();

  return {
    ok: true,
    lock: {
      path: "_speclite/.lock",
      release: async () => {
        await rm(lockPath.absolutePath, { force: true });
      },
    },
  };
}

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
  component?: string;
}): Promise<SafeWriteResult> {
  const safety = await validateProjectPath({
    projectRoot: input.projectRoot,
    relativePath: input.relativePath,
    component: input.component ?? "safe-write",
    allowExistingFile: input.allowExisting === true,
  });
  if (!safety.ok) return safety;

  const parent = path.dirname(safety.absolutePath);
  await mkdir(parent, { recursive: true });

  const tempPath = path.join(parent, `.speclite-tmp-${createPrivateOperationId()}`);
  try {
    await writeFile(tempPath, input.contents, input.executable === true ? { mode: 0o755 } : undefined);
    await rename(tempPath, safety.absolutePath);
  } catch (error) {
    await rm(tempPath, { force: true });
    return {
      ok: false,
      issue: {
        issueId: "file-integrity.stale-temp-file",
        category: "file-integrity",
        severity: "error",
        affectedPath: safety.relativePath,
        component: input.component ?? "safe-write",
        details: {
          reason: "safe-write-failed",
        },
        impact: "SpecLite could not complete the same-directory temp-write and rename safely.",
        suggestedNextStep: "Inspect the target path permissions and rerun the command.",
      },
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

function isMissingPathError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "ENOENT"
  );
}

function isFileExistsError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "EEXIST"
  );
}
