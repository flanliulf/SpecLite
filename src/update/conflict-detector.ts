import { constants as fsConstants } from "node:fs";
import { access, readdir } from "node:fs/promises";
import path from "node:path";
import type { UpdateCommandData } from "../diagnostics/command-result-schema.js";
import { CANONICAL_TARGET_ORDER, getIdeAdapterRegistry } from "../ide/adapter-registry.js";
import { hashPackageDirectory } from "../manifest/hash.js";
import type { FilesIndexEntry, SkillIndex } from "../manifest/manifest-schema.js";
import type { UpdateReasonCode } from "../validation/issue-model.js";
import { isCanonicalPackageHashFile } from "../validation/rules/ide-mirror.js";
import { classifyOwnership, isProtectedOwnership, type ConflictOwnership } from "./ownership-model.js";

export type UpdateConflict = UpdateCommandData["conflicts"][number];

export function detectFilesIndexEntryConflict(input: {
  entry: FilesIndexEntry;
  currentHash: string | undefined;
  artifactRoot: string;
  repair: boolean;
}): UpdateConflict | undefined {
  const classification = classifyOwnership({
    relativePath: input.entry.path,
    artifactRoot: input.artifactRoot,
  });
  if (isProtectedOwnership(classification.ownership)) {
    return createConflict({
      affectedPath: input.entry.path,
      ownership: classification.ownership,
      currentHash: input.currentHash,
      expectedHash: input.entry.hash,
      reason: classification.ownership === "unknown" ? "unknown-ownership" : classification.ownership,
    });
  }

  if (isProtectedOwnership(input.entry.ownership)) {
    return createConflict({
      affectedPath: input.entry.path,
      ownership: input.entry.ownership,
      currentHash: input.currentHash,
      expectedHash: input.entry.hash,
      reason: input.entry.ownership,
    });
  }

  if (classification.ownership === "unknown") {
    return createConflict({
      affectedPath: input.entry.path,
      ownership: "unknown",
      currentHash: input.currentHash,
      expectedHash: input.entry.hash,
      reason: "unknown-ownership",
    });
  }

  if (input.currentHash !== input.entry.hash) {
    return createConflict({
      affectedPath: input.entry.path,
      ownership: "installer-owned",
      currentHash: input.currentHash,
      expectedHash: input.entry.hash,
      reason: input.repair ? "installer-owned-drift" : "installer-owned-drift",
    });
  }

  return undefined;
}

export function createMissingSourceEvidenceConflict(input: {
  entry: FilesIndexEntry;
  currentHash: string | undefined;
}): UpdateConflict {
  return createConflict({
    affectedPath: input.entry.path,
    ownership: "installer-owned",
    currentHash: input.currentHash,
    expectedHash: input.entry.hash,
    reason: "missing-source-evidence",
  });
}

export async function detectIdeMirrorConflicts(input: {
  projectRoot: string;
  skillIndex: SkillIndex;
}): Promise<UpdateConflict[]> {
  const adapters = getIdeAdapterRegistry();
  const conflicts: UpdateConflict[] = [];

  for (const targetId of CANONICAL_TARGET_ORDER) {
    const expectedEntries = input.skillIndex.entries.filter((entry) =>
      entry.installedTargets.includes(targetId),
    );
    if (expectedEntries.length === 0) continue;

    const adapter = adapters.find((candidate) => candidate.id === targetId);
    if (adapter === undefined) continue;

    const targetRoot = path.join(input.projectRoot, adapter.targetDirectory);
    for (const entry of expectedEntries) {
      const affectedPath = `${adapter.targetDirectory}/${entry.canonicalSkillId}`;
      const packageRoot = path.join(input.projectRoot, affectedPath);
      const currentHash = await hashIdeMirrorPackage(packageRoot);
      if (currentHash === undefined) {
        conflicts.push(
          createConflict({
            affectedPath,
            ownership: "installer-owned",
            expectedHash: entry.canonicalPackageHash,
            reason: "installer-owned-drift",
          }),
        );
        continue;
      }

      if (currentHash !== entry.canonicalPackageHash) {
        conflicts.push(
          createConflict({
            affectedPath,
            ownership: "installer-owned",
            currentHash,
            expectedHash: entry.canonicalPackageHash,
            reason: "installer-owned-drift",
          }),
        );
      }
    }

    const projectedEntries = await readProjectedEntryNames(targetRoot);
    for (const projectedName of projectedEntries) {
      if (expectedEntries.some((entry) => entry.canonicalSkillId === projectedName)) continue;

      const projectedPath = `${adapter.targetDirectory}/${projectedName}`;
      const projectedHash = await hashIdeMirrorPackage(path.join(input.projectRoot, projectedPath));
      if (projectedHash === undefined) continue;

      const duplicateOf = expectedEntries.find((entry) => entry.canonicalPackageHash === projectedHash);
      if (duplicateOf === undefined) continue;

      conflicts.push(
        createConflict({
          affectedPath: projectedPath,
          ownership: "installer-owned",
          currentHash: projectedHash,
          expectedHash: duplicateOf.canonicalPackageHash,
          reason: "installer-owned-drift",
        }),
      );
    }
  }

  return conflicts;
}

function createConflict(input: {
  affectedPath: string;
  ownership: ConflictOwnership;
  currentHash?: string;
  expectedHash?: string;
  reason: UpdateReasonCode;
}): UpdateConflict {
  return {
    affectedPath: input.affectedPath,
    ownership: input.ownership,
    ...(input.currentHash === undefined ? {} : { currentHash: input.currentHash }),
    ...(input.expectedHash === undefined ? {} : { expectedHash: input.expectedHash }),
    reason: input.reason,
  };
}

async function hashIdeMirrorPackage(packageRoot: string): Promise<string | undefined> {
  try {
    await access(packageRoot, fsConstants.F_OK);
    return await hashPackageDirectory(packageRoot, { include: isCanonicalPackageHashFile });
  } catch {
    return undefined;
  }
}

async function readProjectedEntryNames(targetRoot: string): Promise<string[]> {
  try {
    const entries = await readdir(targetRoot, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort((left, right) => left.localeCompare(right));
  } catch {
    return [];
  }
}
