import type { InstallCommandResult, ValidationIssue } from "./command-result-schema.js";
import type { PhaseCoverage } from "../manifest/manifest-schema.js";

export type ArtifactEvidence = {
  artifactPath: string;
  artifactType: string;
  workflowType: string;
  sourceSkill: string;
  generatedAt: string;
  configuredRoot: string;
  defaultOutputPath: string;
  metadataLocation: "frontmatter" | "sidecar";
};

export function renderCommandResultJson(result: InstallCommandResult): string {
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
  return `[${issue.severity}] ${issue.issueId}: ${issue.impact} Suggested next step: ${issue.suggestedNextStep}`;
}

function formatList(values: string[]): string {
  return values.length === 0 ? "none" : values.join(", ");
}

function formatSourceDescriptor(sourceDescriptor: InstallCommandResult["data"]["sourceDescriptor"]): string {
  const sourceLabel =
    sourceDescriptor.version ?? sourceDescriptor.resolvedRoot ?? sourceDescriptor.requestedVersion ?? "unknown";
  return `${sourceDescriptor.sourceType} ${sourceLabel} (${sourceDescriptor.trustStatus})`;
}
