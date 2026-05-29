import type {
  InstallCommandResult,
  RepairCommandResult,
  StatusCommandResult,
  UpdateCommandResult,
  ValidateCommandResult,
  ValidationIssue,
} from "./command-result-schema.js";
import type { PhaseCoverage } from "../manifest/manifest-schema.js";
import { CANONICAL_ISSUE_CATEGORY_ORDER } from "../validation/validation-order.js";

export type HumanOutputOptions = {
  columns?: number;
  noColor?: boolean;
  isTty?: boolean;
  ci?: boolean;
  screenReader?: boolean;
};

export type ArtifactEvidence = {
  artifactPath: string;
  artifactType: string;
  workflowType: string;
  sourceSkill: string;
  generatedAt: string;
  configuredRoot: string;
  defaultOutputPath: string;
  metadataLocation: "frontmatter" | "sidecar" | "directory";
};

export function renderCommandResultJson(
  result:
    | InstallCommandResult
    | StatusCommandResult
    | ValidateCommandResult
    | UpdateCommandResult
    | RepairCommandResult,
): string {
  return `${JSON.stringify(result, null, 2)}\n`;
}

export function renderInstallHumanOutput(result: InstallCommandResult): string {
  if (isReadySummaryResult(result)) {
    return renderInstallReadySummary(result);
  }

  const lines = [result.summary];

  lines.push(`Manifest version: ${result.data.manifestVersion}`);
  lines.push(`Completed steps: ${formatList(result.data.completedSteps)}`);
  lines.push(`Pending steps: ${formatList(result.data.pendingSteps)}`);

  if (result.data.ideTargets.length > 0) {
    lines.push("IDE target statuses:");
    for (const target of result.data.ideTargets) {
      const pathSuffix = target.targetPath === undefined ? "" : ` (${target.targetPath})`;
      const skillCountSuffix = target.skillCount === undefined ? "" : `, skills=${target.skillCount}`;
      lines.push(`- ${target.id}: ${target.status}${pathSuffix}${skillCountSuffix}`);
    }
  }

  for (const issue of result.issues) {
    lines.push(formatIssue(issue));
  }

  if (result.nextActions.length > 0) {
    lines.push("Next actions:");
    for (const action of result.nextActions) {
      lines.push(`- ${action}`);
    }
  }

  return `${lines.join("\n")}\n`;
}

export function renderStatusHumanOutput(result: StatusCommandResult): string {
  const lines = [
    "SpecLite status",
    `High-level health: ${result.data.highLevelHealth}`,
    `Source: ${formatOptionalSourceDescriptor(result.data.sourceDescriptor)}`,
    `Manifest: ${result.data.manifestPresent ? "present" : "missing"}${result.data.manifestVersion === undefined ? "" : `, version=${result.data.manifestVersion}`}`,
    `Installed modules: ${formatList(result.data.installedModules)}`,
    "IDE targets:",
  ];

  if (result.data.ideTargets.length === 0) {
    lines.push("- none");
  } else {
    for (const target of result.data.ideTargets) {
      const skillCount = target.skillCount ?? 0;
      const targetPath = target.targetPath ?? "not-configured";
      const reason = target.reason === undefined ? "" : `, reason=${target.reason}`;
      lines.push(`- ${target.id}: ${target.status}, skills=${skillCount}, path=${targetPath}${reason}`);
    }
  }

  lines.push(
    "Key paths",
    `- projectRoot: ${result.data.paths.projectRoot}`,
    `- specliteRoot: ${result.data.paths.specliteRoot ?? "_speclite"}`,
    `- artifactRoot: ${result.data.paths.artifactRoot ?? "_speclite-output"}`,
    `- manifestPath: ${result.data.paths.manifestPath ?? "_speclite/_config/manifest.yaml"}`,
  );

  if (result.nextActions.length > 0) {
    lines.push("Next actions");
    for (const action of result.nextActions) {
      lines.push(`- ${action}`);
    }
  }

  return `${lines.join("\n")}\n`;
}

export function renderValidateHumanOutput(
  result: ValidateCommandResult,
  options: HumanOutputOptions = {},
): string {
  const columns = options.columns ?? 100;
  const checkedCategorySet = new Set(result.data.checkedCategories);
  const notCheckedCategories = CANONICAL_ISSUE_CATEGORY_ORDER.filter(
    (category) => !checkedCategorySet.has(category),
  );
  const presentation =
    columns < 80
      ? "key-value"
      : columns < 120
        ? "compact-table"
        : "full-table";
  const lines = [
    "SpecLite validate",
    `Status: ${result.status}`,
    `Output profile: Evidence (${presentation})`,
    `Checked categories: ${formatList(result.data.checkedCategories)}`,
    `Not checked categories: ${formatList(notCheckedCategories)}`,
    `Checked targets: ${formatList(result.data.checkedTargets)}`,
    `Validated paths: ${formatList(result.data.validatedPaths)}`,
    `Issue counts: critical=${result.data.issueCounts.critical}, error=${result.data.issueCounts.error}, warning=${result.data.issueCounts.warning}, info=${result.data.issueCounts.info}`,
  ];

  if (result.issues.length === 0) {
    lines.push("No issues found for checked categories.");
    lines.push("No conflicts detected.");
    if (result.data.checkedCategories.length === 0) {
      lines.push("No categories checked.");
    }
    if (notCheckedCategories.length > 0) {
      lines.push("Skipped / not checked categories are listed above and must not be interpreted as healthy.");
    }
  } else {
    lines.push("Issues:");
    lines.push("Issue fields: severity, category, issueId, affectedPath, impact, suggestedNextStep");
    for (const issue of result.issues) {
      lines.push(formatIssue(issue));
    }
  }

  if (result.nextActions.length > 0) {
    lines.push("Next actions");
    for (const action of result.nextActions) {
      lines.push(`- ${action}`);
    }
  }

  return `${lines.join("\n")}\n`;
}

export function renderUpdateHumanOutput(result: UpdateCommandResult | RepairCommandResult): string {
  const lines = [
    "SpecLite update",
    `Status: ${result.status}`,
    `Mode: ${result.command === "update.repair" ? "repair" : "update"}`,
    result.summary,
    `Changed paths: ${formatList(result.data.changedPaths)}`,
    `Skipped paths: ${formatList(result.data.skippedPaths)}`,
  ];

  if (result.issues.length > 0) {
    lines.push("Issues:");
    for (const issue of result.issues) {
      lines.push(formatIssue(issue));
    }
  }

  if (result.nextActions.length > 0) {
    lines.push("Next actions");
    for (const action of result.nextActions) {
      lines.push(`- ${action}`);
    }
  }

  return `${lines.join("\n")}\n`;
}

export function renderPhaseCoverageEvidence(phaseCoverage: PhaseCoverage): string {
  const lines = ["Phase coverage evidence"];

  for (const row of phaseCoverage.rows) {
    for (const target of row.ideTargets) {
      lines.push(
        [
          `phase=${row.phaseId}`,
          `module=${row.moduleId}`,
          `canonicalSkillId=${row.canonicalSkillId}`,
          `target=${target.targetId}`,
          `entryPath=${target.entryPath}`,
          `activationTarget=${target.activationTarget}`,
          `status=${target.status}`,
        ].join(", "),
      );

      if (target.status !== "mapped") {
        lines.push(
          `nextAction=Run speclite validate and inspect ${target.entryPath} before treating this phase as covered.`,
        );
      }
    }
  }

  if (phaseCoverage.rows.length === 0) {
    lines.push("No phase coverage rows are available.");
    lines.push("nextAction=Run speclite validate or rerun speclite install --yes.");
  }

  return `${lines.join("\n")}\n`;
}

export function renderArtifactEvidence(artifacts: ArtifactEvidence[]): string {
  const lines = ["Artifact evidence"];

  for (const artifact of artifacts) {
    lines.push(
      [
        `artifactPath=${artifact.artifactPath}`,
        `artifactType=${artifact.artifactType}`,
        `workflowType=${artifact.workflowType}`,
        `sourceSkill=${artifact.sourceSkill}`,
        `generatedAt=${artifact.generatedAt}`,
        `configuredRoot=${artifact.configuredRoot}`,
        `defaultOutputPath=${artifact.defaultOutputPath}`,
        `metadataLocation=${artifact.metadataLocation}`,
      ].join(", "),
    );
  }

  if (artifacts.length === 0) {
    lines.push("No artifact evidence rows are available.");
    lines.push("nextAction=Run a workflow that writes a contracted artifact and metadata.");
  }

  return `${lines.join("\n")}\n`;
}

function renderInstallReadySummary(result: InstallCommandResult): string {
  const lines = [
    "SpecLite ready summary",
    "",
    "Summary",
    `Target project: ${result.targetProject}`,
    `Install location: ${result.data.paths.projectRoot}`,
    `Manifest version: ${result.data.manifestVersion}`,
    `Source descriptor: ${formatSourceDescriptor(result.data.sourceDescriptor)}`,
    result.summary,
    "",
    "Completed steps",
    ...result.data.completedSteps.map((stepId) => `- ${stepId}`),
    "",
    "Installed modules",
    ...result.data.installedModules.map((moduleId) => `- ${moduleId}`),
    "",
    "IDE targets",
    ...result.data.ideTargets.map((target) => {
      const targetPath = target.targetPath ?? "not-configured";
      const skillCount = target.skillCount ?? 0;
      return `- ${target.id}: ${target.status}, skills=${skillCount}, path=${targetPath}`;
    }),
    "",
    "Key paths",
    `- projectRoot: ${result.data.paths.projectRoot} (install location)`,
    `- specliteRoot: ${result.data.paths.specliteRoot ?? "_speclite"} (metadata/control hub)`,
    "- .claude/skills and .agents/skills (IDE execution plane)",
    `- artifactRoot: ${result.data.paths.artifactRoot ?? "_speclite-output"} (artifact repository)`,
    `- manifestPath: ${result.data.paths.manifestPath ?? "_speclite/_config/manifest.yaml"} (installed-state projection)`,
    "",
    "Next actions",
    ...result.nextActions.map((action) => `- ${action}`),
  ];

  return `${lines.join("\n")}\n`;
}

function isReadySummaryResult(result: InstallCommandResult): boolean {
  return (
    result.status === "success" &&
    result.issues.length === 0 &&
    result.data.pendingSteps.length === 0 &&
    result.data.completedSteps.includes("ready-check") &&
    result.data.completedSteps.includes("ready-summary")
  );
}

function formatIssue(issue: ValidationIssue): string {
  const location = issue.affectedPath ?? issue.component ?? "unknown";
  return `[${issue.severity}] category=${issue.category} issueId=${issue.issueId} location=${location} impact=${issue.impact} suggestedNextStep=${issue.suggestedNextStep}`;
}

function formatList(values: string[]): string {
  return values.length === 0 ? "none" : values.join(", ");
}

function formatSourceDescriptor(sourceDescriptor: InstallCommandResult["data"]["sourceDescriptor"]): string {
  const sourceLabel =
    sourceDescriptor.version ?? sourceDescriptor.resolvedRoot ?? sourceDescriptor.requestedVersion ?? "unknown";
  return `${sourceDescriptor.sourceType} ${sourceLabel} (${sourceDescriptor.trustStatus})`;
}

function formatOptionalSourceDescriptor(sourceDescriptor: StatusCommandResult["data"]["sourceDescriptor"]): string {
  if (sourceDescriptor === undefined) return "not-available";
  const details = [
    sourceDescriptor.sourceType,
    sourceDescriptor.channel,
    sourceDescriptor.version ?? sourceDescriptor.resolvedRoot ?? sourceDescriptor.requestedVersion,
  ].filter((value): value is string => value !== undefined);
  return details.join(" ");
}
