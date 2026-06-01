import { constants } from "node:fs";
import { mkdir, open, readFile, rm } from "node:fs/promises";
import path from "node:path";
import type { ValidationIssue } from "../diagnostics/command-result-schema.js";
import { hashBytes } from "../manifest/hash.js";
import { resolveProjectRelativePath } from "./path-normalizer.js";

export type ProjectOperation = "install" | "update" | "update.repair";

export type OperationLockFile = {
  schemaVersion: "speclite.operation-lock.v1";
  operation: ProjectOperation;
  pid?: number;
  createdAt: string;
  projectRootHash: `sha256:${string}`;
};

const PRIVATE_OPERATION_LOCK_HANDLE = Symbol("speclite.operation-lock.handle");

export type OperationLockHandle = {
  path: "_speclite/.lock";
  release: () => Promise<void>;
  [PRIVATE_OPERATION_LOCK_HANDLE]: true;
};

export type OperationLockInspection =
  | {
      state: "missing";
      path: "_speclite/.lock";
    }
  | {
      state: "active" | "stale";
      path: "_speclite/.lock";
      lockFile: OperationLockFile;
    }
  | {
      state: "malformed";
      path: "_speclite/.lock";
    };

export async function acquireProjectOperationLock(input: {
  projectRoot: string;
  operation: ProjectOperation;
  now?: Date;
  pid?: number;
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

  const lockFile: OperationLockFile = {
    schemaVersion: "speclite.operation-lock.v1",
    operation: input.operation,
    ...(input.pid === undefined ? { pid: globalThis.process?.pid } : { pid: input.pid }),
    createdAt: (input.now ?? new Date()).toISOString(),
    projectRootHash: hashBytes(path.resolve(input.projectRoot)),
  };

  let handle: Awaited<ReturnType<typeof open>> | undefined;
  try {
    handle = await open(lockPath.absolutePath, constants.O_CREAT | constants.O_EXCL | constants.O_WRONLY);
    await handle.writeFile(`${JSON.stringify(lockFile, null, 2)}\n`, "utf8");
  } catch (error) {
    await handle?.close();
    if (isFileExistsError(error)) {
      return {
        ok: false,
        issue: createProjectLockedIssue(),
      };
    }
    throw error;
  }

  await handle.close();

  return {
    ok: true,
    lock: {
      path: "_speclite/.lock",
      [PRIVATE_OPERATION_LOCK_HANDLE]: true,
      release: async () => {
        await rm(lockPath.absolutePath, { force: true });
      },
    },
  };
}

export async function inspectProjectOperationLock(input: {
  projectRoot: string;
  now?: Date;
  staleAfterMs?: number;
}): Promise<OperationLockInspection> {
  const lockPath = resolveProjectRelativePath({
    projectRoot: input.projectRoot,
    relativePath: "_speclite/.lock",
  });

  let parsed: unknown;
  try {
    parsed = JSON.parse(await readFile(lockPath.absolutePath, "utf8")) as unknown;
  } catch (error) {
    if (isMissingPathError(error)) {
      return {
        state: "missing",
        path: "_speclite/.lock",
      };
    }
    return {
      state: "malformed",
      path: "_speclite/.lock",
    };
  }

  if (!isOperationLockFile(parsed)) {
    return {
      state: "malformed",
      path: "_speclite/.lock",
    };
  }

  const createdAtMs = Date.parse(parsed.createdAt);
  if (!Number.isFinite(createdAtMs)) {
    return {
      state: "malformed",
      path: "_speclite/.lock",
    };
  }

  const staleAfterMs = input.staleAfterMs ?? 60 * 60 * 1000;
  const nowMs = (input.now ?? new Date()).getTime();
  return {
    state: nowMs - createdAtMs > staleAfterMs ? "stale" : "active",
    path: "_speclite/.lock",
    lockFile: parsed,
  };
}

export function createProjectLockedIssue(): ValidationIssue {
  return {
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
  };
}

export function createStaleOperationLockIssue(): ValidationIssue {
  return {
    issueId: "operation-lock.stale-lock",
    category: "operation-lock",
    severity: "warning",
    affectedPath: "_speclite/.lock",
    component: "project-operation-lock",
    details: {
      reason: "lock-age-exceeded",
    },
    impact: "A previous SpecLite write-capable operation may have exited before releasing the project lock.",
    suggestedNextStep: "Confirm no SpecLite write operation is active, then remove _speclite/.lock manually if appropriate.",
  };
}

function isOperationLockFile(value: unknown): value is OperationLockFile {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    candidate.schemaVersion === "speclite.operation-lock.v1" &&
    (candidate.operation === "install" ||
      candidate.operation === "update" ||
      candidate.operation === "update.repair") &&
    typeof candidate.createdAt === "string" &&
    typeof candidate.projectRootHash === "string" &&
    candidate.projectRootHash.startsWith("sha256:") &&
    (candidate.pid === undefined || typeof candidate.pid === "number")
  );
}

function isFileExistsError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error && error.code === "EEXIST";
}

function isMissingPathError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}
