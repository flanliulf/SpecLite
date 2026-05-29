import type { Stats } from "node:fs";
import { lstat as lstatAsync } from "node:fs/promises";
import path from "node:path";
import type { ValidationIssue } from "../../diagnostics/command-result-schema.js";
import { hashFile } from "../../manifest/hash.js";
import type { FilesIndex, FilesIndexEntry } from "../../manifest/manifest-schema.js";

export type FileIntegrityValidationResult = {
  issues: ValidationIssue[];
  validatedPaths: string[];
};

export async function validateFileIntegrity(input: {
  projectRoot: string;
  filesIndex: FilesIndex;
}): Promise<FileIntegrityValidationResult> {
  const issues: ValidationIssue[] = [];
  const validatedPaths = new Set<string>(["_speclite/_config/files-index.json"]);

  for (const entry of [...input.filesIndex.entries].sort((left, right) => left.path.localeCompare(right.path))) {
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
    | "file-integrity.unknown-ownership";
  entry: FilesIndexEntry;
  reason: "hash-mismatch" | "missing-installer-owned-file" | "unknown-ownership";
  affectedPath: string;
  shape?: "symlink";
}): ValidationIssue {
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
    },
    impact: "An installer-owned or installer-controlled installed file no longer matches the files index boundary.",
    suggestedNextStep: "Run speclite update --repair or manually inspect the affected installed file.",
  };
}
