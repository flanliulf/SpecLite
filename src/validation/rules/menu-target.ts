import type { ValidationIssue } from "../../diagnostics/command-result-schema.js";
import {
  HelpIndexEntrySchema,
  isInstalledSkillActivationTarget,
  type HelpIndex,
  type PhaseCoverage,
  type SkillIndex,
} from "../../manifest/manifest-schema.js";

type MappedTarget = {
  canonicalSkillId: string;
  targetId: "claude" | "agents";
  activationTarget: string;
};

type InstalledSkillPath = {
  targetId: "claude" | "agents";
  skillDirectory: string;
};

export function validateMenuTargets(input: {
  skillIndex: SkillIndex;
  helpIndex: HelpIndex;
  phaseCoverage: PhaseCoverage;
}): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const knownSkillIds = new Set(input.skillIndex.entries.map((entry) => entry.canonicalSkillId));
  const installedTargetsBySkillId = new Map(
    input.skillIndex.entries.map((entry) => [entry.canonicalSkillId, new Set(entry.installedTargets)]),
  );
  const mappedTargets = collectMappedTargets(input.phaseCoverage);

  for (const entry of input.helpIndex.entries) {
    if (!knownSkillIds.has(entry.canonicalSkillId)) {
      issues.push(
        createMenuTargetIssue({
          issueId: "menu-target.unknown-skill",
          affectedPath: "_speclite/_config/help-index.json",
          component: "menu-target:help-index",
          details: {
            canonicalSkillId: entry.canonicalSkillId,
            phaseId: entry.phaseId,
          },
          impact: "A help/menu entry references a canonical skill id that is not present in skill-index.json.",
          suggestedNextStep: "Regenerate help-index.json and skill-index.json from the same source metadata.",
        }),
      );
      continue;
    }

    if (!HelpIndexEntrySchema.safeParse(entry).success) {
      issues.push(
        createMenuTargetIssue({
          issueId: "menu-target.missing-target",
          affectedPath: "_speclite/_config/help-index.json",
          component: "menu-target:help-index",
          details: {
            canonicalSkillId: entry.canonicalSkillId,
            phaseId: entry.phaseId,
            reason: "invalid-activation-target",
          },
          impact: "A help/menu entry does not point to an installed project-relative SKILL.md activation target.",
          suggestedNextStep: "Regenerate installed indexes so activation targets point to installed SKILL.md files.",
        }),
      );
      continue;
    }

    const installedTargets = installedTargetsBySkillId.get(entry.canonicalSkillId) ?? new Set();
    const activationTarget = parseInstalledSkillActivationTarget(entry.activationTarget);
    const uninstalledHelpTargetIds = entry.targetIds.filter((targetId) => !installedTargets.has(targetId));
    if (
      activationTarget === undefined ||
      !installedTargets.has(activationTarget.targetId) ||
      activationTarget.skillDirectory !== entry.canonicalSkillId ||
      uninstalledHelpTargetIds.length > 0
    ) {
      issues.push(
        createMenuTargetIssue({
          issueId: "menu-target.missing-target",
          affectedPath: "_speclite/_config/help-index.json",
          component: "menu-target:help-index",
          details: {
            canonicalSkillId: entry.canonicalSkillId,
            phaseId: entry.phaseId,
            activationTarget: entry.activationTarget,
            activationTargetId: activationTarget?.targetId,
            activationSkillDirectory: activationTarget?.skillDirectory,
            installedTargets: [...installedTargets].sort(),
            uninstalledTargetIds: uninstalledHelpTargetIds.sort(),
            reason:
              activationTarget?.skillDirectory !== undefined &&
              activationTarget.skillDirectory !== entry.canonicalSkillId
                ? "skill-id-mismatch"
                : "uninstalled-target",
          },
          impact: "A help/menu entry points to an IDE target that is not installed for the canonical skill entry.",
          suggestedNextStep: "Regenerate installed indexes so help/menu entries only reference installed IDE targets.",
        }),
      );
      continue;
    }

    const matches = mappedTargets.filter(
      (target) =>
        target.canonicalSkillId === entry.canonicalSkillId &&
        target.activationTarget === entry.activationTarget &&
        installedTargets.has(target.targetId),
    );

    if (matches.length === 0) {
      issues.push(
        createMenuTargetIssue({
          issueId: "menu-target.missing-target",
          affectedPath: "_speclite/_config/help-index.json",
          component: "menu-target:help-index",
          details: {
            canonicalSkillId: entry.canonicalSkillId,
            phaseId: entry.phaseId,
            reason: "no-installed-target-match",
          },
          impact: "A help/menu entry cannot resolve to an installed mapped skill entry.",
          suggestedNextStep: "Run speclite validate, inspect installed entries, or rerun speclite install --yes.",
        }),
      );
    } else if (matches.length > 1) {
      issues.push(
        createMenuTargetIssue({
          issueId: "menu-target.ambiguous-target",
          affectedPath: "_speclite/_config/help-index.json",
          component: "menu-target:help-index",
          details: {
            canonicalSkillId: entry.canonicalSkillId,
            phaseId: entry.phaseId,
            matchedTargetCount: matches.length,
          },
          impact: "A help/menu entry resolves to multiple installed skill entries.",
          suggestedNextStep: "Regenerate installed indexes and remove duplicate target projections.",
        }),
      );
    }
  }

  for (const row of input.phaseCoverage.rows) {
    if (!knownSkillIds.has(row.canonicalSkillId)) {
      issues.push(
        createMenuTargetIssue({
          issueId: "menu-target.unknown-skill",
          affectedPath: "_speclite/_config/phase-coverage.json",
          component: "menu-target:phase-coverage",
          details: {
            canonicalSkillId: row.canonicalSkillId,
            phaseId: row.phaseId,
          },
          impact: "A phase coverage row references a canonical skill id that is not present in skill-index.json.",
          suggestedNextStep: "Regenerate phase-coverage.json and skill-index.json from the same source metadata.",
        }),
      );
      continue;
    }

    const installedTargets = installedTargetsBySkillId.get(row.canonicalSkillId) ?? new Set();
    const mapped = row.ideTargets.filter((target) => target.status === "mapped");
    const duplicateMappedTargetKeys = findDuplicateMappedTargetKeys(row.ideTargets);
    for (const duplicateKey of duplicateMappedTargetKeys) {
      issues.push(
        createMenuTargetIssue({
          issueId: "menu-target.ambiguous-target",
          affectedPath: "_speclite/_config/phase-coverage.json",
          component: "menu-target:phase-coverage",
          details: {
            canonicalSkillId: row.canonicalSkillId,
            phaseId: row.phaseId,
            duplicateTarget: duplicateKey,
          },
          impact: "A phase coverage row contains duplicate mapped installed target projections.",
          suggestedNextStep: "Regenerate phase-coverage.json and remove duplicate target projections.",
        }),
      );
    }

    if (mapped.length === 0) {
      issues.push(
        createMenuTargetIssue({
          issueId: "menu-target.no-mapped-target",
          affectedPath: "_speclite/_config/phase-coverage.json",
          component: "menu-target:phase-coverage",
          details: {
            canonicalSkillId: row.canonicalSkillId,
            phaseId: row.phaseId,
          },
          impact: "A phase coverage row has no mapped installed IDE target.",
          suggestedNextStep: "Run speclite validate, inspect installed entries, or rerun install/update repair.",
        }),
      );
    }

    for (const target of mapped) {
      const entryPath = parseInstalledSkillEntryPath(target.entryPath);
      const activationTarget = parseInstalledSkillActivationTarget(target.activationTarget);
      if (!isInstalledSkillActivationTarget(target.activationTarget)) {
        issues.push(
          createMenuTargetIssue({
            issueId: "menu-target.missing-target",
            affectedPath: "_speclite/_config/phase-coverage.json",
            component: "menu-target:phase-coverage",
            details: {
              canonicalSkillId: row.canonicalSkillId,
              phaseId: row.phaseId,
              targetId: target.targetId,
              reason: "invalid-activation-target",
            },
            impact: "A mapped phase coverage target does not point to an installed SKILL.md activation target.",
            suggestedNextStep: "Regenerate phase-coverage.json from installed self-contained skill entries.",
          }),
        );
      }

      if (
        entryPath === undefined ||
        activationTarget === undefined ||
        entryPath.targetId !== target.targetId ||
        activationTarget.targetId !== target.targetId ||
        entryPath.skillDirectory !== row.canonicalSkillId ||
        activationTarget.skillDirectory !== row.canonicalSkillId
      ) {
        issues.push(
          createMenuTargetIssue({
            issueId: "menu-target.missing-target",
            affectedPath: "_speclite/_config/phase-coverage.json",
            component: "menu-target:phase-coverage",
            details: {
              canonicalSkillId: row.canonicalSkillId,
              phaseId: row.phaseId,
              targetId: target.targetId,
              entryPath: target.entryPath,
              activationTarget: target.activationTarget,
              entryTargetId: entryPath?.targetId,
              activationTargetId: activationTarget?.targetId,
              entrySkillDirectory: entryPath?.skillDirectory,
              activationSkillDirectory: activationTarget?.skillDirectory,
              reason: "skill-id-mismatch",
            },
            impact: "A mapped phase coverage target does not point to the installed entry for its canonical skill id.",
            suggestedNextStep: "Regenerate phase-coverage.json from installed canonical skill target metadata.",
          }),
        );
      }

      if (!installedTargets.has(target.targetId)) {
        issues.push(
          createMenuTargetIssue({
            issueId: "menu-target.missing-target",
            affectedPath: "_speclite/_config/phase-coverage.json",
            component: "menu-target:phase-coverage",
            details: {
              canonicalSkillId: row.canonicalSkillId,
              phaseId: row.phaseId,
              targetId: target.targetId,
              installedTargets: [...installedTargets].sort(),
              reason: "uninstalled-target",
            },
            impact: "A mapped phase coverage target is not listed in skill-index.installedTargets.",
            suggestedNextStep: "Regenerate phase-coverage.json from the installed target set in skill-index.json.",
          }),
        );
      }
    }
  }

  return dedupeIssues(issues);
}

function collectMappedTargets(phaseCoverage: PhaseCoverage): MappedTarget[] {
  const unique = new Map<string, MappedTarget>();
  for (const target of phaseCoverage.rows.flatMap((row) =>
    row.ideTargets
      .filter((target) => target.status === "mapped")
      .map((target) => ({
        canonicalSkillId: row.canonicalSkillId,
        targetId: target.targetId,
        activationTarget: target.activationTarget,
      })),
  )) {
    unique.set(`${target.canonicalSkillId}:${target.targetId}:${target.activationTarget}`, target);
  }

  return [...unique.values()];
}

function parseInstalledSkillEntryPath(entryPath: string): InstalledSkillPath | undefined {
  const match = /^(?<root>\.claude|\.agents)\/skills\/(?<skillDirectory>[^/]+)$/.exec(entryPath);
  if (match?.groups === undefined) return undefined;
  return {
    targetId: match.groups.root === ".claude" ? "claude" : "agents",
    skillDirectory: match.groups.skillDirectory,
  };
}

function parseInstalledSkillActivationTarget(activationTarget: string): InstalledSkillPath | undefined {
  const match = /^(?<root>\.claude|\.agents)\/skills\/(?<skillDirectory>[^/]+)\/SKILL\.md$/.exec(
    activationTarget,
  );
  if (match?.groups === undefined) return undefined;
  return {
    targetId: match.groups.root === ".claude" ? "claude" : "agents",
    skillDirectory: match.groups.skillDirectory,
  };
}

function findDuplicateMappedTargetKeys(targets: PhaseCoverage["rows"][number]["ideTargets"]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const target of targets.filter((candidate) => candidate.status === "mapped")) {
    const key = `${target.targetId}:${target.activationTarget}`;
    if (seen.has(key)) {
      duplicates.add(key);
    }
    seen.add(key);
  }

  return [...duplicates].sort();
}

function createMenuTargetIssue(input: {
  issueId:
    | "menu-target.missing-target"
    | "menu-target.ambiguous-target"
    | "menu-target.unknown-skill"
    | "menu-target.no-mapped-target";
  affectedPath: string;
  component: string;
  details: Record<string, unknown>;
  impact: string;
  suggestedNextStep: string;
}): ValidationIssue {
  return {
    issueId: input.issueId,
    category: "menu-target",
    severity: "error",
    affectedPath: input.affectedPath,
    component: input.component,
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
      component: issue.component,
      details: issue.details,
    });
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
