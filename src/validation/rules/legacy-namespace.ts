import { lstat, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import type { ValidationIssue } from "../../diagnostics/command-result-schema.js";
import { CANONICAL_TARGET_ORDER, getIdeAdapterRegistry, type IdeTargetId } from "../../ide/adapter-registry.js";
import type { FilesIndex, SkillIndex } from "../../manifest/manifest-schema.js";

export type LegacyNamespaceValidationResult = {
  issues: ValidationIssue[];
  validatedPaths: string[];
  checkedTargets: IdeTargetId[];
};

type LegacyNamespaceIssueId =
  | "legacy-namespace.runtime-residue"
  | "legacy-namespace.stale-skill-entry"
  | "legacy-namespace.legacy-config-reference";

export async function validateLegacyNamespace(input: {
  projectRoot: string;
  skillIndex: SkillIndex;
  filesIndex: FilesIndex;
}): Promise<LegacyNamespaceValidationResult> {
  const issues: ValidationIssue[] = [];
  const validatedPaths = new Set<string>();
  const checkedTargets = new Set<IdeTargetId>();

  if (await pathExists(path.join(input.projectRoot, "_bmad"))) {
    validatedPaths.add("_bmad");
    issues.push(
      createLegacyIssue({
        issueId: "legacy-namespace.runtime-residue",
        affectedPath: "_bmad",
        severity: "error",
        details: {
          legacyKind: "runtime-namespace",
          riskKind: "duplicate-loading",
          overlapKind: "runtime-path",
          manualActionRequired: true,
          verificationCommand: "speclite validate",
        },
        impact: "A legacy runtime namespace overlaps the current installed runtime lookup paths.",
        suggestedNextStep: "Manually inspect legacy runtime residue and rerun speclite validate.",
      }),
    );
  }

  for (const entry of input.filesIndex.entries) {
    if (entry.path.startsWith("_bmad/") || entry.sourceRef.startsWith("_bmad/")) {
      validatedPaths.add(entry.path);
      issues.push(
        createLegacyIssue({
          issueId: "legacy-namespace.legacy-config-reference",
          affectedPath: entry.path,
          severity: "error",
          details: {
            legacyKind: "config-reference",
            riskKind: "capability-drift",
            overlapKind: "config-path",
            manualActionRequired: true,
            verificationCommand: "speclite validate",
          },
          impact: "Installed metadata still references legacy config or runtime paths.",
          suggestedNextStep: "Manually update legacy config references and rerun speclite validate.",
        }),
      );
    }
  }

  const canonicalSkillIds = new Set(input.skillIndex.entries.map((entry) => entry.canonicalSkillId));
  for (const adapter of getIdeAdapterRegistry()) {
    const expectedSkills = input.skillIndex.entries.filter((entry) => entry.installedTargets.includes(adapter.id));
    if (expectedSkills.length === 0) continue;
    checkedTargets.add(adapter.id);
    const targetRoot = path.join(input.projectRoot, adapter.targetDirectory);

    for (const skill of expectedSkills) {
      const affectedPath = `${adapter.targetDirectory}/${skill.canonicalSkillId}/SKILL.md`;
      if (!(await installedSkillReferencesLegacyConfig(path.join(input.projectRoot, affectedPath)))) continue;
      validatedPaths.add(affectedPath);
      issues.push(
        createLegacyIssue({
          issueId: "legacy-namespace.legacy-config-reference",
          affectedPath,
          severity: "error",
          details: {
            legacyKind: "config-reference",
            riskKind: "capability-drift",
            overlapKind: "config-path",
            manualActionRequired: true,
            verificationCommand: "speclite validate",
          },
          impact: "An installed skill still references legacy config or runtime paths.",
          suggestedNextStep: "Manually update legacy config references in installed skill entries and rerun speclite validate.",
        }),
      );
    }

    const projectedEntries = await readProjectedEntries(targetRoot);
    for (const projected of projectedEntries) {
      const canonicalSkillId = parseLegacySkillEntry(projected.name, canonicalSkillIds);
      if (canonicalSkillId === undefined) continue;
      const affectedPath = `${adapter.targetDirectory}/${projected.name}`;
      validatedPaths.add(affectedPath);
      issues.push(
        createLegacyIssue({
          issueId: "legacy-namespace.stale-skill-entry",
          affectedPath,
          severity: "error",
          details: {
            legacyKind: "stale-skill-entry",
            riskKind: "menu-conflict",
            overlapKind: "canonical-skill-id",
            manualActionRequired: true,
            verificationCommand: "speclite validate",
          },
          impact: "A stale copied skill entry overlaps an installed canonical skill id and may cause duplicate loading.",
          suggestedNextStep: "Manually inspect stale skill entries and rerun speclite validate.",
        }),
      );
    }
  }

  return {
    issues: dedupeIssues(issues),
    validatedPaths: [...validatedPaths],
    checkedTargets: CANONICAL_TARGET_ORDER.filter((targetId) => checkedTargets.has(targetId)),
  };
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

function parseLegacySkillEntry(name: string, canonicalSkillIds: Set<string>): string | undefined {
  for (const canonicalSkillId of canonicalSkillIds) {
    if (
      name !== canonicalSkillId &&
      (name === `${canonicalSkillId}-legacy` ||
        name === `${canonicalSkillId}-old` ||
        name === `${canonicalSkillId}-copy`)
    ) {
      return canonicalSkillId;
    }
  }
  return undefined;
}

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await lstat(targetPath);
    return true;
  } catch {
    return false;
  }
}

export async function installedSkillReferencesLegacyConfig(skillFilePath: string): Promise<boolean> {
  try {
    const contents = await readFile(skillFilePath, "utf8");
    return contents.includes("_bmad/config.yaml") || contents.includes("_bmad/");
  } catch {
    return false;
  }
}

function createLegacyIssue(input: {
  issueId: LegacyNamespaceIssueId;
  affectedPath: string;
  severity: "warning" | "error";
  details: Record<string, unknown>;
  impact: string;
  suggestedNextStep: string;
}): ValidationIssue {
  return {
    issueId: input.issueId,
    category: "legacy-namespace",
    severity: input.severity,
    affectedPath: input.affectedPath,
    component: "legacy-namespace-validator",
    details: input.details,
    impact: input.impact,
    suggestedNextStep: input.suggestedNextStep,
  };
}

function dedupeIssues(issues: ValidationIssue[]): ValidationIssue[] {
  const seen = new Set<string>();
  return issues.filter((issue) => {
    const key = JSON.stringify({
      issueId: issue.issueId,
      affectedPath: issue.affectedPath,
      details: issue.details,
    });
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
