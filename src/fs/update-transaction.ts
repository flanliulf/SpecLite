import { lstat, readFile, rm } from "node:fs/promises";
import { hashBytes, hashFile, type FileHash } from "../manifest/hash.js";
import type { ValidationIssue } from "../diagnostics/command-result-schema.js";
import { resolveProjectRelativePath } from "./path-normalizer.js";
import { safeWriteFile } from "./safe-write.js";

const JOURNAL_PATH = "_speclite/_config/.update-journal.json";

export type UpdateTransactionOperation = {
  path: string;
  contents: Buffer | string;
  executable: boolean;
  oldHash?: FileHash;
  oldExecutable?: boolean;
};

export type UpdateTransactionPrecondition = {
  absolutePath: string;
  affectedPath: string;
  hash: FileHash;
  executable: boolean;
};

type UpdateJournal = {
  schemaVersion: "speclite.update-journal.v1";
  planId: FileHash;
  completedPaths: string[];
  operations: Array<{
    path: string;
    oldHash?: FileHash;
    newHash: FileHash;
    executable: boolean;
    oldExecutable?: boolean;
  }>;
};

export type UpdateTransactionResult =
  | { ok: true; changedPaths: string[] }
  | { ok: false; changedPaths: string[]; issue: ValidationIssue };

export async function inspectUpdateTransactionJournal(projectRoot: string): Promise<"missing" | "present" | "malformed"> {
  const result = await readJournal(projectRoot);
  return result.state;
}

export async function readUpdateTransactionRecoveryHashes(
  projectRoot: string,
): Promise<Map<string, { hash: FileHash; executable: boolean }> | undefined> {
  const result = await readJournal(projectRoot);
  if (result.state !== "present") return undefined;
  return new Map(result.journal.operations.map((operation) => [operation.path, {
    hash: operation.newHash,
    executable: operation.executable,
  }]));
}

export async function finalizeCompletedUpdateTransaction(projectRoot: string): Promise<UpdateTransactionResult> {
  const inspection = await readJournal(projectRoot);
  if (inspection.state === "missing") return { ok: true, changedPaths: [] };
  if (inspection.state === "malformed") return blocker([], "malformed-journal", JOURNAL_PATH);
  for (const operation of inspection.journal.operations) {
    const current = await readTargetState(projectRoot, operation.path);
    if (!current.ok) return { ok: false, changedPaths: [], issue: current.issue };
    if (current.hash !== operation.newHash || current.executable !== operation.executable) {
      return blocker([], "incomplete-journal", operation.path);
    }
  }
  return removeJournal(projectRoot, []);
}

export async function applyRecoverableUpdateTransaction(input: {
  projectRoot: string;
  artifactRoot: string;
  operations: UpdateTransactionOperation[];
  preconditions?: UpdateTransactionPrecondition[];
}): Promise<UpdateTransactionResult> {
  const operations = input.operations.map((operation) => ({
    ...operation,
    ...(operation.oldHash !== undefined && operation.oldExecutable === undefined
      ? { oldExecutable: operation.executable }
      : {}),
    newHash: hashBytes(operation.contents),
  }));
  if (new Set(operations.map((operation) => operation.path)).size !== operations.length) {
    return blocker([], "duplicate-operation-path", JOURNAL_PATH);
  }
  for (const precondition of input.preconditions ?? []) {
    try {
      const metadata = await lstat(precondition.absolutePath);
      const currentHash = metadata.isFile() ? await hashFile(precondition.absolutePath) : undefined;
      if (currentHash !== precondition.hash || ((metadata.mode & 0o111) !== 0) !== precondition.executable) {
        return blocker([], "precondition-changed", precondition.affectedPath);
      }
    } catch {
      return blocker([], "precondition-read-failed", precondition.affectedPath);
    }
  }
  const planId = createPlanId(operations);
  const journalInspection = await readJournal(input.projectRoot);
  if (journalInspection.state === "malformed") {
    return blocker([], "malformed-journal", JOURNAL_PATH);
  }
  const existingJournal = journalInspection.state === "present" ? journalInspection.journal : undefined;
  if (existingJournal !== undefined && existingJournal.planId !== planId) {
    return blocker([], "journal-plan-mismatch", JOURNAL_PATH);
  }

  const journal: UpdateJournal = existingJournal ?? {
    schemaVersion: "speclite.update-journal.v1",
    planId,
    completedPaths: [],
    operations: operations.map(({ path, oldHash, oldExecutable, newHash, executable }) => ({
      path,
      ...(oldHash === undefined ? {} : { oldHash }),
      ...(oldExecutable === undefined ? {} : { oldExecutable }),
      newHash,
      executable,
    })),
  };
  if (!sameOperationContract(journal, operations)) {
    return blocker([], "journal-operation-mismatch", JOURNAL_PATH);
  }

  const states = new Map<string, "old" | "new">();
  for (const operation of operations) {
    const current = await readTargetState(input.projectRoot, operation.path);
    if (!current.ok) return { ok: false, changedPaths: [], issue: current.issue };
    const state = classifyState(current, operation);
    if (state === undefined || (existingJournal === undefined && state !== "old")) {
      return blocker([], state === undefined ? "unprovable-target-state" : "unexpected-new-state", operation.path);
    }
    states.set(operation.path, state);
  }
  for (const completedPath of journal.completedPaths) {
    if (states.get(completedPath) !== "new") return blocker([], "completed-path-not-new", completedPath);
  }

  if (existingJournal === undefined) {
    const persisted = await persistJournal(input.projectRoot, journal);
    if (!persisted.ok) return { ok: false, changedPaths: [], issue: persisted.issue };
  }

  const changedPaths: string[] = [];
  for (const operation of operations) {
    if (states.get(operation.path) === "new") {
      if (!journal.completedPaths.includes(operation.path)) {
        journal.completedPaths.push(operation.path);
        const persisted = await persistJournal(input.projectRoot, journal);
        if (!persisted.ok) return { ok: false, changedPaths, issue: persisted.issue };
      }
      changedPaths.push(operation.path);
      continue;
    }

    const write = await safeWriteFile({
      projectRoot: input.projectRoot,
      relativePath: operation.path,
      contents: operation.contents,
      executable: operation.executable,
      allowExisting: operation.oldHash !== undefined,
      ...(operation.oldHash === undefined
        ? {}
        : {
            expectedExistingFile: {
              ownership: "installer-owned" as const,
              hash: operation.oldHash,
              artifactRoot: input.artifactRoot,
            },
          }),
      component: "update-transaction",
      operationId: planId.slice("sha256:".length, "sha256:".length + 16),
    });
    if (!write.ok) return { ok: false, changedPaths, issue: withRecoveryDetails(write.issue, journal, operation.path) };

    changedPaths.push(write.path);
    journal.completedPaths.push(write.path);
    const persisted = await persistJournal(input.projectRoot, journal);
    if (!persisted.ok) return { ok: false, changedPaths, issue: persisted.issue };
  }

  return removeJournal(input.projectRoot, changedPaths);
}

function createPlanId(operations: Array<UpdateTransactionOperation & { newHash: FileHash }>): FileHash {
  return hashBytes(JSON.stringify(operations.map(({ path, oldHash, oldExecutable, newHash, executable }) => ({
    path,
    oldHash: oldHash ?? null,
    oldExecutable: oldExecutable ?? null,
    newHash,
    executable,
  }))));
}

async function readJournal(projectRoot: string): Promise<
  | { state: "missing" }
  | { state: "malformed" }
  | { state: "present"; journal: UpdateJournal }
> {
  try {
    const parsed = JSON.parse(await readFile(
      resolveProjectRelativePath({ projectRoot, relativePath: JOURNAL_PATH }).absolutePath,
      "utf8",
    )) as UpdateJournal;
    return isJournal(parsed) ? { state: "present", journal: parsed } : { state: "malformed" };
  } catch (error) {
    return isMissingPathError(error) ? { state: "missing" } : { state: "malformed" };
  }
}

function isJournal(value: unknown): value is UpdateJournal {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<UpdateJournal>;
  return candidate.schemaVersion === "speclite.update-journal.v1" &&
    typeof candidate.planId === "string" && candidate.planId.startsWith("sha256:") &&
    Array.isArray(candidate.completedPaths) && candidate.completedPaths.every((item) => typeof item === "string") &&
    new Set(candidate.completedPaths).size === candidate.completedPaths.length &&
    Array.isArray(candidate.operations) && candidate.operations.every(isJournalOperation) &&
    new Set(candidate.operations.map((operation) => operation.path)).size === candidate.operations.length &&
    candidate.completedPaths.every((completedPath) => candidate.operations!.some((operation) => operation.path === completedPath));
}

function isJournalOperation(value: unknown): value is UpdateJournal["operations"][number] {
  if (typeof value !== "object" || value === null) return false;
  const operation = value as UpdateJournal["operations"][number];
  return typeof operation.path === "string" && isProjectRelativeOperationPath(operation.path) &&
    (operation.oldHash === undefined || isFileHash(operation.oldHash)) && isFileHash(operation.newHash) &&
    typeof operation.executable === "boolean" &&
    (operation.oldExecutable === undefined || typeof operation.oldExecutable === "boolean");
}

function isFileHash(value: unknown): value is FileHash {
  return typeof value === "string" && /^sha256:[0-9a-f]{64}$/.test(value);
}

function isProjectRelativeOperationPath(value: string): boolean {
  try {
    resolveProjectRelativePath({ projectRoot: "/transaction-root", relativePath: value });
    return true;
  } catch {
    return false;
  }
}

function isMissingPathError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}

async function persistJournal(
  projectRoot: string,
  journal: UpdateJournal,
): Promise<{ ok: true } | { ok: false; issue: ValidationIssue }> {
  let currentHash: FileHash | undefined;
  try {
    currentHash = await readHash(projectRoot, JOURNAL_PATH);
  } catch {
    return { ok: false, issue: blocker([], "journal-read-failed", JOURNAL_PATH).issue };
  }
  const write = await safeWriteFile({
    projectRoot,
    relativePath: JOURNAL_PATH,
    contents: `${JSON.stringify(journal, null, 2)}\n`,
    allowExisting: currentHash !== undefined,
    ...(currentHash === undefined
      ? {}
      : { expectedExistingFile: { ownership: "installer-owned" as const, hash: currentHash } }),
    component: "update-transaction-journal",
  });
  return write.ok ? { ok: true } : { ok: false, issue: write.issue };
}

async function readHash(projectRoot: string, relativePath: string): Promise<FileHash | undefined> {
  try {
    return await hashFile(resolveProjectRelativePath({ projectRoot, relativePath }).absolutePath);
  } catch (error) {
    if (isMissingPathError(error)) return undefined;
    throw error;
  }
}

async function readTargetState(projectRoot: string, relativePath: string): Promise<
  | { ok: true; hash?: FileHash; executable?: boolean }
  | { ok: false; issue: ValidationIssue }
> {
  try {
    const absolutePath = resolveProjectRelativePath({ projectRoot, relativePath }).absolutePath;
    const metadata = await lstat(absolutePath);
    if (!metadata.isFile()) return { ok: false, issue: blocker([], "target-not-file", relativePath).issue };
    return { ok: true, hash: await hashFile(absolutePath), executable: (metadata.mode & 0o111) !== 0 };
  } catch (error) {
    if (isMissingPathError(error)) return { ok: true };
    return { ok: false, issue: blocker([], "target-read-failed", relativePath).issue };
  }
}

function classifyState(
  current: { hash?: FileHash; executable?: boolean },
  operation: UpdateTransactionOperation & { newHash: FileHash },
) {
  if (current.hash === operation.newHash && current.executable === operation.executable) return "new" as const;
  if (current.hash === operation.oldHash && current.executable === operation.oldExecutable) return "old" as const;
  return undefined;
}

function sameOperationContract(
  journal: UpdateJournal,
  operations: Array<UpdateTransactionOperation & { newHash: FileHash }>,
): boolean {
  return JSON.stringify(journal.operations) === JSON.stringify(
    operations.map(({ path, oldHash, oldExecutable, newHash, executable }) => ({
      path,
      ...(oldHash === undefined ? {} : { oldHash }),
      ...(oldExecutable === undefined ? {} : { oldExecutable }),
      newHash,
      executable,
    })),
  );
}

async function removeJournal(projectRoot: string, changedPaths: string[]): Promise<UpdateTransactionResult> {
  try {
    await rm(resolveProjectRelativePath({ projectRoot, relativePath: JOURNAL_PATH }).absolutePath, { force: true });
    return { ok: true, changedPaths };
  } catch {
    return blocker(changedPaths, "journal-cleanup-failed", JOURNAL_PATH);
  }
}

function blocker(changedPaths: string[], reason: string, affectedPath: string): UpdateTransactionResult {
  return {
    ok: false,
    changedPaths,
    issue: {
      issueId: "file-integrity.recovery-blocked",
      category: "file-integrity",
      severity: "error",
      affectedPath,
      component: "update-transaction",
      details: { reason, completedSteps: changedPaths, failedStep: affectedPath },
      impact: "The recoverable update cannot prove that every target is in its expected old or new state.",
      suggestedNextStep: "Inspect the update journal and affected target, restore a provable state, then rerun the authorized command.",
    },
  };
}

function withRecoveryDetails(issue: ValidationIssue, journal: UpdateJournal, failedPath: string): ValidationIssue {
  return {
    ...issue,
    details: {
      ...(issue.details ?? {}),
      reason: "coordinated-apply-interrupted",
      completedSteps: journal.completedPaths.map((completedPath) => `changed:${completedPath}`),
      failedStep: `update:${failedPath}`,
      pendingSteps: journal.operations
        .map((operation) => operation.path)
        .filter((operationPath) => operationPath !== failedPath && !journal.completedPaths.includes(operationPath))
        .map((operationPath) => `update:${operationPath}`),
    },
  };
}
