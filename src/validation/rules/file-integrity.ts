import type { Stats } from "node:fs";
import { lstat as lstatAsync, readdir } from "node:fs/promises";
import path from "node:path";
import type { ValidationIssue } from "../../diagnostics/command-result-schema.js";
import { hashFile } from "../../manifest/hash.js";
import type { FilesIndex, FilesIndexEntry } from "../../manifest/manifest-schema.js";
import { classifyOwnership } from "../../update/ownership-model.js";

export type FileIntegrityValidationResult = {
  issues: ValidationIssue[];
  validatedPaths: string[];
};

export async function validateFileIntegrity(input: {
  projectRoot: string;
  filesIndex: FilesIndex;
  artifactRoot?: string;
}): Promise<FileIntegrityValidationResult> {
  const issues: ValidationIssue[] = [];
  const validatedPaths = new Set<string>(["_speclite/_config/files-index.json"]);
  const caseConflicts = detectCaseConflicts(input.filesIndex.entries);
  const caseConflictPaths = new Set<string>();
  const staleTempFiles = await discoverStaleTempFiles({
    projectRoot: input.projectRoot,
    filesIndex: input.filesIndex,
  });

  for (const staleTempFile of staleTempFiles) {
    validatedPaths.add(staleTempFile.path);
    issues.push(createStaleTempFileIssue(staleTempFile));
  }

  for (const conflict of caseConflicts) {
    caseConflictPaths.add(conflict.affectedPath);
    caseConflictPaths.add(conflict.conflictingPath);
    validatedPaths.add(conflict.affectedPath);
    validatedPaths.add(conflict.conflictingPath);
    issues.push(
      createFileIntegrityIssue({
        issueId: "file-integrity.case-conflict",
        entry: conflict.entry,
        reason: "case-conflict",
        affectedPath: conflict.affectedPath,
        conflictingPath: conflict.conflictingPath,
      }),
    );
  }

  for (const entry of [...input.filesIndex.entries].sort((left, right) => left.path.localeCompare(right.path))) {
    if (caseConflictPaths.has(entry.path)) continue;

    const classification = classifyOwnership({
      relativePath: entry.path,
      artifactRoot: input.artifactRoot,
    });
    if (
      entry.ownership === "installer-owned" &&
      (classification.ownership === "human-owned" || classification.ownership === "workflow-owned")
    ) {
      validatedPaths.add(entry.path);
      issues.push(
        createFileIntegrityIssue({
          issueId: "file-integrity.unsafe-overwrite-risk",
          entry,
          reason: "unsafe-overwrite-risk",
          affectedPath: entry.path,
          classifiedOwnership: classification.ownership,
        }),
      );
      continue;
    }

    if (entry.ownership !== "installer-owned") {
      if (isInstallerControlledArtifact(entry)) {
        validatedPaths.add(entry.path);
        issues.push(
          createFileIntegrityIssue({
            issueId: "file-integrity.unknown-ownership",
            entry,
            reason: "unknown-ownership",
            affectedPath: entry.path,
          }),
        );
      }
      continue;
    }

    validatedPaths.add(entry.path);
    const absolutePath = path.join(input.projectRoot, entry.path);
    const fileStat = await readLinkAwareStats(absolutePath);
    if (fileStat === "missing") {
      issues.push(
        createFileIntegrityIssue({
          issueId: "file-integrity.missing-installer-owned-file",
          entry,
          reason: "missing-installer-owned-file",
          affectedPath: entry.path,
        }),
      );
      continue;
    }
    if (fileStat === "unreadable") {
      issues.push(
        createFileIntegrityIssue({
          issueId: "file-integrity.hash-mismatch",
          entry,
          reason: "hash-mismatch",
          affectedPath: entry.path,
        }),
      );
      continue;
    }
    try {
      if (fileStat.isSymbolicLink()) {
        issues.push(
          createFileIntegrityIssue({
            issueId: "file-integrity.hash-mismatch",
            entry,
            reason: "hash-mismatch",
            affectedPath: entry.path,
            shape: "symlink",
          }),
        );
        continue;
      }
      const currentHash = await hashFile(absolutePath);
      if (currentHash !== entry.hash) {
        issues.push(
          createFileIntegrityIssue({
            issueId: "file-integrity.hash-mismatch",
            entry,
            reason: "hash-mismatch",
            affectedPath: entry.path,
          }),
        );
      }
    } catch {
      issues.push(
        createFileIntegrityIssue({
          issueId: "file-integrity.hash-mismatch",
          entry,
          reason: "hash-mismatch",
          affectedPath: entry.path,
        }),
      );
    }
  }

  return {
    issues,
    validatedPaths: [...validatedPaths],
  };
}

async function discoverStaleTempFiles(input: {
  projectRoot: string;
  filesIndex: FilesIndex;
}): Promise<Array<{
  path: string;
  blocking: boolean;
}>> {
  const staleTempFiles: Array<{ path: string; blocking: boolean }> = [];
  const roots = createStaleTempScanRoots(input.filesIndex);
  for (const root of roots) {
    await collectStaleTempFiles({
      projectRoot: input.projectRoot,
      relativeRoot: root,
      staleTempFiles,
    });
  }
  const uniqueByPath = new Map<string, { path: string; blocking: boolean }>();
  for (const staleTempFile of staleTempFiles) {
    const existing = uniqueByPath.get(staleTempFile.path);
    uniqueByPath.set(staleTempFile.path, {
      path: staleTempFile.path,
      blocking: (existing?.blocking ?? false) || staleTempFile.blocking,
    });
  }
  return [...uniqueByPath.values()].sort((left, right) => left.path.localeCompare(right.path));
}

function createStaleTempScanRoots(filesIndex: FilesIndex): string[] {
  const roots = new Set(["_speclite", ".claude/skills", ".agents/skills"]);
  for (const entry of filesIndex.entries) {
    if (!isInstallerControlledArtifact(entry)) continue;
    const directory = path.posix.dirname(entry.path);
    if (directory !== ".") roots.add(directory);
  }
  return [...roots].sort((left, right) => left.localeCompare(right));
}

async function collectStaleTempFiles(input: {
  projectRoot: string;
  relativeRoot: string;
  staleTempFiles: Array<{ path: string; blocking: boolean }>;
}): Promise<void> {
  const absoluteRoot = path.join(input.projectRoot, input.relativeRoot);
  let entries: Awaited<ReturnType<typeof readdir>>;
  try {
    entries = await readdir(absoluteRoot, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    const relativePath = `${input.relativeRoot}/${entry.name}`;
    if (entry.name.startsWith(".speclite-tmp-")) {
      input.staleTempFiles.push({
        path: relativePath,
        blocking: !entry.isFile(),
      });
      continue;
    }
    if (entry.isDirectory()) {
      await collectStaleTempFiles({
        projectRoot: input.projectRoot,
        relativeRoot: relativePath,
        staleTempFiles: input.staleTempFiles,
      });
    }
  }
}

function createStaleTempFileIssue(input: {
  path: string;
  blocking: boolean;
}): ValidationIssue {
  return {
    issueId: "file-integrity.stale-temp-file",
    category: "file-integrity",
    severity: input.blocking ? "error" : "warning",
    affectedPath: input.path,
    component: "safe-write",
    details: {
      reason: input.blocking ? "stale-temp-file-blocking" : "stale-temp-file",
    },
    impact: input.blocking
      ? "A stale safe-write temporary path may block future installer-owned mutation."
      : "A stale safe-write temporary file was left by a previous incomplete write.",
    suggestedNextStep: "Confirm no SpecLite write operation is active, then remove the stale .speclite-tmp file manually if appropriate.",
  };
}

function isInstallerControlledArtifact(entry: FilesIndexEntry): boolean {
  return (
    entry.path.startsWith("_speclite/") ||
    entry.path.startsWith(".claude/skills/") ||
    entry.path.startsWith(".agents/skills/") ||
    entry.artifactKind.includes("control") ||
    entry.artifactKind.includes("skill")
  );
}

async function readLinkAwareStats(targetPath: string): Promise<Stats | "missing" | "unreadable"> {
  try {
    return await lstatAsync(targetPath);
  } catch (error) {
    if (isNodeError(error) && error.code === "ENOENT") return "missing";
    return "unreadable";
  }
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}

function createFileIntegrityIssue(input: {
  issueId:
    | "file-integrity.hash-mismatch"
    | "file-integrity.missing-installer-owned-file"
    | "file-integrity.unknown-ownership"
    | "file-integrity.unsafe-overwrite-risk"
    | "file-integrity.case-conflict";
  entry: FilesIndexEntry;
  reason:
    | "hash-mismatch"
    | "missing-installer-owned-file"
    | "unknown-ownership"
    | "unsafe-overwrite-risk"
    | "case-conflict";
  affectedPath: string;
  shape?: "symlink";
  classifiedOwnership?: "human-owned" | "workflow-owned";
  conflictingPath?: string;
}): ValidationIssue {
  const protectedNextStep =
    input.reason === "unsafe-overwrite-risk"
      ? "Run speclite validate and manually review the protected boundary before planning update or repair."
      : "Run speclite update --repair or manually inspect the affected installed file.";

  return {
    issueId: input.issueId,
    category: "file-integrity",
    severity: "error",
    affectedPath: input.affectedPath,
    details: {
      ownership: input.entry.ownership,
      artifactKind: input.entry.artifactKind,
      expectedHashAlgorithm: "sha256",
      reason: input.reason,
      ...(input.shape === undefined ? {} : { shape: input.shape }),
      ...(input.classifiedOwnership === undefined
        ? {}
        : { classifiedOwnership: input.classifiedOwnership }),
      ...(input.conflictingPath === undefined ? {} : { conflictingPath: input.conflictingPath }),
    },
    impact: "An installer-owned or installer-controlled installed file no longer matches the files index boundary.",
    suggestedNextStep: protectedNextStep,
  };
}

function detectCaseConflicts(entries: FilesIndexEntry[]): Array<{
  affectedPath: string;
  conflictingPath: string;
  entry: FilesIndexEntry;
}> {
  const seen = new Map<string, FilesIndexEntry>();
  const conflicts: Array<{
    affectedPath: string;
    conflictingPath: string;
    entry: FilesIndexEntry;
  }> = [];

  for (const entry of [...entries].sort((left, right) => left.path.localeCompare(right.path))) {
    const key = entry.path.toLowerCase();
    const existing = seen.get(key);
    if (existing !== undefined && existing.path !== entry.path) {
      conflicts.push({
        affectedPath: entry.path,
        conflictingPath: existing.path,
        entry,
      });
      continue;
    }
    seen.set(key, entry);
  }

  return conflicts;
}
