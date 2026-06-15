import process from "node:process";
import type { ExternalAccess } from "../installer/install-plan-schema.js";
import {
  createDoctorCommandResult,
  resolveTargetProjectDisplayName,
} from "../diagnostics/command-result.js";
import type { DoctorCommandResult, ValidationIssue } from "../diagnostics/command-result-schema.js";
import { normalizeTargetDirectory } from "../fs/path-normalizer.js";
import { validateProject } from "../validation/validate-project.js";
import { ISSUE_SEVERITIES, type IssueSeverity } from "../validation/issue-model.js";

export type DoctorCommandOptions = {
  json?: boolean;
  revalidateSource?: boolean;
  yes?: boolean;
};

export type DoctorCommandRuntime = {
  cwd?: string;
  targetProject?: string;
};

export type DoctorCommandOutcome = {
  result: DoctorCommandResult;
  exitCode: 0 | 1;
};

export async function runDoctorCommand(input: {
  options?: DoctorCommandOptions;
  runtime?: DoctorCommandRuntime;
  targetDirectory?: string;
} = {}): Promise<DoctorCommandOutcome> {
  const cwd = input.runtime?.cwd ?? process.cwd();
  const normalizedTarget = normalizeTargetDirectory({
    cwd,
    ...(input.targetDirectory === undefined ? {} : { targetDirectory: input.targetDirectory }),
  });
  const targetProject = await resolveTargetProjectDisplayName({
    targetRoot: normalizedTarget.targetRoot,
    ...(input.runtime?.targetProject === undefined ? {} : { explicitName: input.runtime.targetProject }),
  });
  const validation = await validateProject({ projectRoot: normalizedTarget.targetRoot });
  const externalAccesses = createDoctorExternalAccesses({
    revalidateSource: input.options?.revalidateSource === true,
    authorized: input.options?.yes === true,
  });
  const externalAccessIssues =
    input.options?.revalidateSource === true && input.options?.yes !== true
      ? [createExternalAccessPendingIssue()]
      : [];
  const issues = [...validation.issues, ...externalAccessIssues];

  return createDoctorCommandResult({
    targetProject,
    issues,
    data: {
      ...validation.data,
      issueCounts: countIssues(issues),
      externalAccesses,
    },
    commandCompleted: externalAccessIssues.length === 0,
    summary:
      externalAccessIssues.length > 0
        ? "SpecLite doctor stopped before remote source revalidation because external access is not authorized."
        : "SpecLite doctor completed richer diagnostics for checked categories.",
    nextActions:
      externalAccessIssues.length > 0
        ? ["Review the external access intent and rerun speclite doctor --revalidate-source --yes to authorize it."]
        : ["Run speclite validate for the MVP local-only validation contract when automation requires local checks only."],
  });
}

function createDoctorExternalAccesses(input: {
  revalidateSource: boolean;
  authorized: boolean;
}): ExternalAccess[] {
  if (!input.revalidateSource) return [];
  return [
    {
      sourceType: "installed-source",
      sourceValue: "manifest-source",
      reason: "doctor remote freshness/provenance revalidation",
      confirmationState: input.authorized ? "confirmed" : "pending",
    },
  ];
}

function createExternalAccessPendingIssue(): ValidationIssue {
  return {
    issueId: "source-integrity.external-access-not-authorized",
    category: "source-integrity",
    severity: "error",
    component: "doctor-command",
    details: {
      reason: "external-access-confirmation-pending",
    },
    impact: "Doctor will not perform remote freshness or provenance revalidation without explicit authorization.",
    suggestedNextStep: "Review the external access intent, then rerun doctor with explicit authorization if remote checks are required.",
  };
}

function countIssues(issues: ValidationIssue[]): Record<IssueSeverity, number> {
  const counts = Object.fromEntries(ISSUE_SEVERITIES.map((severity) => [severity, 0])) as Record<IssueSeverity, number>;
  for (const issue of issues) counts[issue.severity] += 1;
  return counts;
}
