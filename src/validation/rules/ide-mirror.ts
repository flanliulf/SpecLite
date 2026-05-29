import { constants as fsConstants } from "node:fs";
import { access, readdir } from "node:fs/promises";
import path from "node:path";
import type { ValidationIssue } from "../../diagnostics/command-result-schema.js";
import { CANONICAL_TARGET_ORDER, getIdeAdapterRegistry, type IdeTargetId } from "../../ide/adapter-registry.js";
import { hashPackageDirectory } from "../../manifest/hash.js";
import type { SkillIndex } from "../../manifest/manifest-schema.js";

export type IdeMirrorValidationResult = {
  issues: ValidationIssue[];
  checkedTargets: IdeTargetId[];
  validatedPaths: string[];
};

const CANONICAL_PACKAGE_PATHS = new Set([
  "SKILL.md",
  "CHANGELOG.md",
  "config.toml.example",
  "customize.toml",
]);
const CANONICAL_PACKAGE_DIRECTORIES = ["references", "assets", "scripts"] as const;

export async function validateIdeMirror(input: {
  projectRoot: string;
  skillIndex: SkillIndex;
}): Promise<IdeMirrorValidationResult> {
  const adapters = getIdeAdapterRegistry();
  const issues: ValidationIssue[] = [];
  const checkedTargets = new Set<IdeTargetId>();
  const validatedPaths = new Set<string>();
  const entriesBySkill = new Map(input.skillIndex.entries.map((entry) => [entry.canonicalSkillId, entry]));

  for (const targetId of CANONICAL_TARGET_ORDER) {
    const expectedEntries = input.skillIndex.entries.filter((entry) =>
      entry.installedTargets.includes(targetId),
    );
    if (expectedEntries.length === 0) continue;

    checkedTargets.add(targetId);
    const adapter = adapters.find((candidate) => candidate.id === targetId);
    if (adapter === undefined) continue;

    validatedPaths.add(adapter.targetDirectory);
    const targetRoot = path.join(input.projectRoot, adapter.targetDirectory);
    const projectedEntries = await readProjectedEntries(targetRoot);

    for (const entry of expectedEntries) {
      const expectedPath = `${adapter.targetDirectory}/${entry.canonicalSkillId}`;
      const expectedRoot = path.join(input.projectRoot, expectedPath);

      if (!(await pathExists(expectedRoot))) {
        issues.push(
          createIdeMirrorIssue({
            issueId: "ide-mirror.missing-entry",
            targetId,
            canonicalSkillId: entry.canonicalSkillId,
            affectedPath: expectedPath,
            reason: "missing-entry",
            baselineKind: "installed-targets",
          }),
        );
        continue;
      }

      try {
        const currentHash = await hashPackageDirectory(expectedRoot, {
          include: isCanonicalPackageHashFile,
        });
        if (currentHash !== entry.canonicalPackageHash) {
          issues.push(
            createIdeMirrorIssue({
              issueId: "ide-mirror.hash-mismatch",
              targetId,
              canonicalSkillId: entry.canonicalSkillId,
              affectedPath: expectedPath,
              reason: "hash-mismatch",
              baselineKind: "canonical-package-hash",
              expectedHashAlgorithm: "sha256",
            }),
          );
        }
      } catch {
        issues.push(
          createIdeMirrorIssue({
            issueId: "ide-mirror.hash-mismatch",
            targetId,
            canonicalSkillId: entry.canonicalSkillId,
            affectedPath: expectedPath,
            reason: "hash-mismatch",
            baselineKind: "canonical-package-hash",
            expectedHashAlgorithm: "sha256",
            shape: "symlink-in-canonical-package",
          }),
        );
      }
    }

    for (const projected of projectedEntries) {
      const matchingEntry = entriesBySkill.get(projected.name);
      if (matchingEntry !== undefined && matchingEntry.installedTargets.includes(targetId)) continue;

      const duplicateOf = await findDuplicateCanonicalSkill({
        projectedRoot: path.join(targetRoot, projected.name),
        expectedEntries,
      });
      if (duplicateOf === undefined) continue;

      issues.push(
        createIdeMirrorIssue({
          issueId: "ide-mirror.duplicate-entry",
          targetId,
          canonicalSkillId: duplicateOf,
          affectedPath: `${adapter.targetDirectory}/${projected.name}`,
          reason: "duplicate-entry",
          baselineKind: "installed-targets",
        }),
      );
    }
  }

  return {
    issues,
    checkedTargets: CANONICAL_TARGET_ORDER.filter((targetId) => checkedTargets.has(targetId)),
    validatedPaths: [...validatedPaths],
  };
}

export function isCanonicalPackageHashFile(relativeFile: string): boolean {
  const normalized = relativeFile.split(path.sep).join("/");
  if (CANONICAL_PACKAGE_PATHS.has(normalized)) return true;
  return CANONICAL_PACKAGE_DIRECTORIES.some(
    (directory) => normalized === directory || normalized.startsWith(`${directory}/`),
  );
}

async function readProjectedEntries(targetRoot: string): Promise<Array<{ name: string }>> {
  try {
    const entries = await readdir(targetRoot, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => ({ name: entry.name }))
      .sort((left, right) => left.name.localeCompare(right.name));
  } catch {
    return [];
  }
}

async function findDuplicateCanonicalSkill(input: {
  projectedRoot: string;
  expectedEntries: SkillIndex["entries"];
}): Promise<string | undefined> {
  let projectedHash: string;
  try {
    projectedHash = await hashPackageDirectory(input.projectedRoot, {
      include: isCanonicalPackageHashFile,
    });
  } catch {
    return undefined;
  }

  return input.expectedEntries.find((entry) => entry.canonicalPackageHash === projectedHash)?.canonicalSkillId;
}

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await access(targetPath, fsConstants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function createIdeMirrorIssue(input: {
  issueId: "ide-mirror.missing-entry" | "ide-mirror.hash-mismatch" | "ide-mirror.duplicate-entry";
  targetId: IdeTargetId;
  canonicalSkillId: string;
  affectedPath: string;
  reason: "missing-entry" | "hash-mismatch" | "duplicate-entry";
  baselineKind: "canonical-package-hash" | "installed-targets";
  expectedHashAlgorithm?: "sha256";
  shape?: "symlink-in-canonical-package";
}): ValidationIssue {
  return {
    issueId: input.issueId,
    category: "ide-mirror",
    severity: "error",
    affectedPath: input.affectedPath,
    details: {
      targetId: input.targetId,
      canonicalSkillId: input.canonicalSkillId,
      reason: input.reason,
      baselineKind: input.baselineKind,
      ...(input.expectedHashAlgorithm === undefined
        ? {}
        : { expectedHashAlgorithm: input.expectedHashAlgorithm }),
      ...(input.shape === undefined ? {} : { shape: input.shape }),
    },
    impact: "Installed IDE mirror content no longer matches the installed canonical package baseline.",
    suggestedNextStep: "Run speclite update --repair or manually inspect the affected IDE mirror entry.",
  };
}
