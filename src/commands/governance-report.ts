import process from "node:process";
import {
  createGovernanceReportCommandResult,
  resolveTargetProjectDisplayName,
  sortValidationIssues,
} from "../diagnostics/command-result.js";
import type {
  GovernancePhaseGap,
  GovernanceReportData,
  GovernanceReportCommandResult,
  RatioMetric,
  ValidationIssue,
} from "../diagnostics/command-result-schema.js";
import { CANONICAL_TARGET_ORDER } from "../ide/adapter-registry.js";
import type { PhaseCoverage, PhaseCoverageRow } from "../manifest/manifest-schema.js";
import { normalizeTargetDirectory } from "../fs/path-normalizer.js";
import { validateProject } from "../validation/validate-project.js";
import { validateArtifactPaths } from "../validation/artifact-paths.js";
import { validateManifestSchema } from "../validation/rules/manifest-schema.js";
import {
  sortIssueCategories,
  sortValidatedPaths,
} from "../validation/validation-order.js";
import type { IssueCategory } from "../validation/issue-model.js";

export type GovernanceReportCommandOptions = {
  json?: boolean;
};

export type GovernanceReportCommandRuntime = {
  cwd?: string;
  targetProject?: string;
};

export type GovernanceReportCommandOutcome = {
  result: GovernanceReportCommandResult;
  exitCode: 0 | 1;
};

const PHASE_COVERAGE_PATH = "_speclite/_config/phase-coverage.json" as const;

export async function runGovernanceReportCommand(input: {
  options?: GovernanceReportCommandOptions;
  runtime?: GovernanceReportCommandRuntime;
  targetDirectory?: string;
} = {}): Promise<GovernanceReportCommandOutcome> {
  const cwd = input.runtime?.cwd ?? process.cwd();
  const normalizedTarget = normalizeTargetDirectory({
    cwd,
    ...(input.targetDirectory === undefined ? {} : { targetDirectory: input.targetDirectory }),
  });
  const targetProject = await resolveTargetProjectDisplayName({
    targetRoot: normalizedTarget.targetRoot,
    ...(input.runtime?.targetProject === undefined ? {} : { explicitName: input.runtime.targetProject }),
  });

  const manifestResult = await validateManifestSchema({ projectRoot: normalizedTarget.targetRoot });
  const validation = await validateProject({ projectRoot: normalizedTarget.targetRoot });
  const artifactResult =
    manifestResult.manifest === undefined || manifestResult.phaseCoverage === undefined
      ? { artifactChecks: [], issues: [], validatedPaths: [] }
      : await validateArtifactPaths({
          projectRoot: normalizedTarget.targetRoot,
          configuredRoot: manifestResult.manifest.paths.artifactRoot,
          defaultOutputPaths: manifestResult.phaseCoverage.rows
            .map((row) => row.artifactContract)
            .filter((contract): contract is NonNullable<typeof contract> => contract !== undefined),
        });

  const phaseCoverage = calculatePhaseCoverage({
    ...(manifestResult.phaseCoverage === undefined ? {} : { phaseCoverage: manifestResult.phaseCoverage }),
    expectedTargets: manifestResult.manifest?.targetIds ?? [],
  });
  const governanceIssues = phaseCoverage.phaseGaps.map(createPhaseGapIssue);
  const issues = sortValidationIssues([...validation.issues, ...governanceIssues]);
  const checkedCategories = sortIssueCategories(new Set<IssueCategory>([
    ...validation.data.checkedCategories,
    ...(governanceIssues.length === 0 ? [] : ["menu-target" as const]),
  ]));
  const validatedPaths = sortValidatedPaths([
    ...validation.data.validatedPaths,
    ...artifactResult.validatedPaths,
    PHASE_COVERAGE_PATH,
  ]);
  const data: GovernanceReportData = {
    metrics: {
      phaseEntryCoverage: phaseCoverage.metric,
      artifactPresenceRate: createRatioMetric({
        covered: artifactResult.artifactChecks.filter((check) => check.present && check.valid).length,
        total: artifactResult.artifactChecks.length,
      }),
      validatePassRate: createValidatePassRate({
        checkedCategories,
        issues,
      }),
      openGapCount: phaseCoverage.phaseGaps.length + issues.filter((issue) => issue.category === "artifact-path").length,
    },
    phaseGaps: phaseCoverage.phaseGaps,
    artifactChecks: artifactResult.artifactChecks,
    validateIssueCounts: countIssues(issues),
    checkedCategories,
    validatedPaths,
    scope: {
      manifestPath: "_speclite/_config/manifest.yaml",
      phaseCoveragePath: PHASE_COVERAGE_PATH,
      artifactRoot: manifestResult.manifest?.paths.artifactRoot ?? "_speclite-output",
    },
  };

  return createGovernanceReportCommandResult({
    targetProject,
    summary:
      issues.length === 0
        ? "SpecLite governance report completed for installed process coverage."
        : "SpecLite governance report found process coverage gaps.",
    issues,
    data,
    nextActions:
      issues.length === 0
        ? ["Use this report as local evidence for Post-MVP process governance review."]
        : ["Inspect phase gaps and validation issues before treating process governance as covered."],
  });
}

function calculatePhaseCoverage(input: {
  phaseCoverage?: PhaseCoverage;
  expectedTargets: Array<"claude" | "agents">;
}): { metric: RatioMetric; phaseGaps: GovernancePhaseGap[] } {
  const rows = [...(input.phaseCoverage?.rows ?? [])].sort(comparePhaseRows);
  const expectedTargets = CANONICAL_TARGET_ORDER.filter((targetId) =>
    input.expectedTargets.includes(targetId),
  );
  const total = rows.length * expectedTargets.length;
  let covered = 0;
  const phaseGaps: GovernancePhaseGap[] = [];

  for (const row of rows) {
    const targetsById = new Map(row.ideTargets.map((target) => [target.targetId, target]));
    for (const targetId of expectedTargets) {
      const target = targetsById.get(targetId);
      if (target?.status === "mapped") {
        covered += 1;
        continue;
      }

      phaseGaps.push({
        phaseId: row.phaseId,
        phaseLabel: row.phaseLabel,
        moduleId: row.moduleId,
        canonicalSkillId: row.canonicalSkillId,
        targetId,
        missingReason:
          target === undefined
            ? "missing-target-entry"
            : target.status === "failed"
              ? "failed-target"
              : "unsupported-target",
      });
    }
  }

  return {
    metric: createRatioMetric({ covered, total }),
    phaseGaps,
  };
}

function createPhaseGapIssue(gap: GovernancePhaseGap): ValidationIssue {
  return {
    issueId: "menu-target.phase-entry-gap",
    category: "menu-target",
    severity: "warning",
    affectedPath: PHASE_COVERAGE_PATH,
    component: "governance-report:phase-coverage",
    details: {
      phaseId: gap.phaseId,
      phaseLabel: gap.phaseLabel,
      moduleId: gap.moduleId,
      canonicalSkillId: gap.canonicalSkillId,
      targetId: gap.targetId,
      reason: gap.missingReason,
    },
    impact: "A process phase entry is not mapped for an installed target.",
    suggestedNextStep: "Regenerate installed phase coverage or inspect the mapped skill entry before treating this phase as covered.",
  };
}

function createValidatePassRate(input: {
  checkedCategories: IssueCategory[];
  issues: ValidationIssue[];
}): RatioMetric {
  const categoriesWithIssues = new Set(input.issues.map((issue) => issue.category));
  return createRatioMetric({
    covered: input.checkedCategories.filter((category) => !categoriesWithIssues.has(category)).length,
    total: input.checkedCategories.length,
  });
}

function countIssues(issues: ValidationIssue[]): GovernanceReportData["validateIssueCounts"] {
  const counts: GovernanceReportData["validateIssueCounts"] = {
    info: 0,
    warning: 0,
    error: 0,
    critical: 0,
  };
  for (const issue of issues) counts[issue.severity] += 1;
  return counts;
}

function createRatioMetric(input: { covered: number; total: number }): RatioMetric {
  return {
    covered: input.covered,
    total: input.total,
    rate: input.total === 0 ? 0 : Number((input.covered / input.total).toFixed(4)),
  };
}

function comparePhaseRows(left: PhaseCoverageRow, right: PhaseCoverageRow): number {
  return (
    left.phaseId.localeCompare(right.phaseId) ||
    left.moduleId.localeCompare(right.moduleId) ||
    left.canonicalSkillId.localeCompare(right.canonicalSkillId)
  );
}
