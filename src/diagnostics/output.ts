import type {
  InstallCommandResult,
  InitCommandResult,
  GovernanceReportCommandResult,
  ListCommandResult,
  RepairCommandResult,
  StatusCommandResult,
  DoctorCommandResult,
  SyncCommandResult,
  UninstallCommandResult,
  UpdateCommandResult,
  ValidateCommandResult,
  ValidationIssue,
} from "./command-result-schema.js";
import { formatCliMessage, getCliMessage, type CliLocale } from "../cli/messages.js";
import type { PhaseCoverage } from "../manifest/manifest-schema.js";
import {
  CANONICAL_ISSUE_CATEGORY_ORDER,
  sortCheckedTargets,
  sortIssueCategories,
  sortValidatedPaths,
  sortValidationIssues,
} from "../validation/validation-order.js";

export type HumanOutputOptions = {
  columns?: number;
  noColor?: boolean;
  isTty?: boolean;
  ci?: boolean;
  screenReader?: boolean;
  locale?: CliLocale;
};

type CoveredHumanCommandResult =
  | InstallCommandResult
  | InitCommandResult
  | ListCommandResult
  | StatusCommandResult
  | ValidateCommandResult
  | DoctorCommandResult
  | UpdateCommandResult
  | RepairCommandResult
  | SyncCommandResult
  | UninstallCommandResult
  | GovernanceReportCommandResult;

type PresentationSection = {
  title: string;
  lines: string[];
};

type PresentationWriteState = "auto" | "changed" | "none";

type InstallHumanOutcome =
  | "prewrite-paused"
  | "blocked-before-write"
  | "write-failed"
  | "ready-check-failed"
  | "ready";

type UpdateHumanOutcome =
  | "plan-ready"
  | "repair-plan-ready"
  | "no-op"
  | "blocked-by-conflict"
  | "applied"
  | "partial-or-failed";

type StatusHumanOutcome =
  | "installed"
  | "not-installed"
  | "stale"
  | "partial"
  | "failed"
  | "unknown";

type ValidateHumanOutcome =
  | "valid"
  | "valid-with-warnings"
  | "invalid"
  | "cannot-validate";

type UpdateExecutionState = {
  completedSteps: string[];
  failedStep?: string;
  pendingSteps: string[];
};

type PresentationFrameInput = {
  title: string;
  result: CoveredHumanCommandResult;
  outcomeLabel: string;
  locale: CliLocale;
  writeState?: PresentationWriteState;
  summaryLines?: string[];
  scopeLines?: string[];
  stateLines?: string[];
  evidenceLines?: string[];
  issueLines?: string[];
  emptyStateLines?: string[];
  nextActions?: string[];
  extraSections?: PresentationSection[];
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

function renderPresentationFrame(input: PresentationFrameInput): string {
  const lines = [
    input.title,
    `${getCliMessage(input.locale, "outcome")}: ${input.outcomeLabel}`,
    "",
    getCliMessage(input.locale, "summary"),
    ...formatOutcomeSummary(input.result, input.locale, input.writeState),
    ...(input.summaryLines ?? []),
  ];

  appendSection(lines, getCliMessage(input.locale, "scope"), input.scopeLines);
  appendSection(lines, getCliMessage(input.locale, "state"), input.stateLines);
  appendSection(lines, getCliMessage(input.locale, "evidence"), input.evidenceLines);

  const issueLines = input.issueLines ?? input.result.issues.map((issue) => formatIssue(issue, input.locale));
  appendSection(lines, getCliMessage(input.locale, "issues"), issueLines);

  appendSection(lines, getCliMessage(input.locale, "emptyState"), input.emptyStateLines);

  for (const section of input.extraSections ?? []) {
    appendSection(lines, section.title, section.lines);
  }

  appendSection(
    lines,
    getCliMessage(input.locale, "nextActions"),
    formatPathLines(input.nextActions ?? input.result.nextActions, getCliMessage(input.locale, "actionNotRequired")),
  );

  return `${lines.join("\n")}\n`;
}

function appendSection(lines: string[], title: string, sectionLines: string[] | undefined): void {
  if (sectionLines === undefined) return;
  lines.push("", title, ...sectionLines);
}

function formatOutcomeSummary(
  result: CoveredHumanCommandResult,
  locale: CliLocale,
  writeState: PresentationWriteState = "auto",
): string[] {
  const completed = result.status === "failure" ? getCliMessage(locale, "completedNo") : getCliMessage(locale, "completedYes");
  const writes = commandChangedProjectFiles(result, writeState)
    ? getCliMessage(locale, "writeChanged")
    : getCliMessage(locale, "writeNone");
  const action = result.nextActions.length > 0
    ? getCliMessage(locale, "actionRequired")
    : getCliMessage(locale, "actionNotRequired");
  const installReadiness =
    result.command === "install"
      ? [
        locale === "zh-CN"
          ? `${getCliMessage(locale, "readyState")}：${getInstallHumanOutcome(result) === "ready" ? getCliMessage(locale, "readyYes") : getCliMessage(locale, "readyNo")}`
          : `${getCliMessage(locale, "readyState")}: ${getInstallHumanOutcome(result) === "ready" ? getCliMessage(locale, "readyYes") : getCliMessage(locale, "readyNo")}`,
      ]
      : [];

  if (locale === "zh-CN") {
    return [
      `${getCliMessage(locale, "completed")}：${completed}`,
      `${getCliMessage(locale, "writes")}：${writes}`,
      `${getCliMessage(locale, "userAction")}：${action}`,
      ...installReadiness,
    ];
  }

  return [
    `${getCliMessage(locale, "completed")}: ${completed}`,
    `${getCliMessage(locale, "writes")}: ${writes}`,
    `${getCliMessage(locale, "userAction")}: ${action}`,
    ...installReadiness,
  ];
}

function commandChangedProjectFiles(
  result: CoveredHumanCommandResult,
  writeState: PresentationWriteState = "auto",
): boolean {
  if (writeState === "changed") return true;
  if (writeState === "none") return false;
  if ("changedPaths" in result.data && result.data.changedPaths.length > 0) return true;
  if ("removedPaths" in result.data && result.data.removedPaths.length > 0) return true;
  return false;
}

export function renderCommandResultJson(
  result:
    | InstallCommandResult
    | InitCommandResult
    | ListCommandResult
    | StatusCommandResult
    | ValidateCommandResult
    | DoctorCommandResult
    | UpdateCommandResult
    | RepairCommandResult
    | SyncCommandResult
    | UninstallCommandResult
    | GovernanceReportCommandResult,
): string {
  return `${JSON.stringify(result, null, 2)}\n`;
}

export function renderInitHumanOutput(result: InitCommandResult): string {
  const lines = [
    "SpecLite init",
    `Status: ${result.status}`,
    result.summary,
    `Write authorized: ${String(result.data.writeAuthorized)}`,
    `Requires confirmation: ${String(result.data.requiresConfirmation)}`,
    `Changed paths: ${formatList(result.data.changedPaths)}`,
    `Skipped paths: ${formatList(result.data.skippedPaths)}`,
    "Plan:",
  ];

  for (const action of result.data.initPlan.actions) {
    const reason = action.reason === undefined ? "" : `, reason=${action.reason}`;
    lines.push(`- ${action.affectedPath}: ${action.action}, ownership=${action.ownership}${reason}`);
  }

  if (result.issues.length > 0) {
    lines.push("Issues:");
    for (const issue of result.issues) lines.push(formatIssue(issue));
  }

  if (result.nextActions.length > 0) {
    lines.push("Next actions");
    for (const action of result.nextActions) lines.push(`- ${action}`);
  }

  return `${lines.join("\n")}\n`;
}

export function renderListHumanOutput(result: ListCommandResult): string {
  const lines = [
    "SpecLite list",
    `Status: ${result.status}`,
    result.summary,
    "Modules:",
    ...result.data.modules.map((module) => `- ${module.moduleId}: ${module.version}; skills=${module.skillCount}`),
    "IDE targets:",
    ...result.data.ideTargets.map((target) => `- ${target.id}: ${target.targetDirectory}`),
    `Skills: ${result.data.skills.length}`,
    "Versions:",
    ...result.data.versions.map((version) => `- ${version.name}: ${version.version}`),
  ];

  if (result.nextActions.length > 0) {
    lines.push("Next actions");
    for (const action of result.nextActions) lines.push(`- ${action}`);
  }

  return `${lines.join("\n")}\n`;
}

export function renderDoctorHumanOutput(result: DoctorCommandResult): string {
  const lines = [
    "SpecLite doctor",
    `Status: ${result.status}`,
    "Summary",
    result.summary,
    `Checked categories: ${formatList(result.data.checkedCategories)}`,
    `Checked targets: ${formatList(result.data.checkedTargets)}`,
    `Validated paths: ${formatList(result.data.validatedPaths)}`,
    `Issue counts: critical=${result.data.issueCounts.critical}, error=${result.data.issueCounts.error}, warning=${result.data.issueCounts.warning}, info=${result.data.issueCounts.info}`,
    "External Access",
  ];

  if (result.data.externalAccesses.length === 0) {
    lines.push("- none");
  } else {
    for (const access of result.data.externalAccesses) {
      lines.push(
        `- sourceType=${access.sourceType}; sourceValue=${access.sourceValue}; confirmationState=${access.confirmationState}; reason=${access.reason}`,
      );
    }
  }

  if (result.issues.length > 0) {
    lines.push("Issues:");
    for (const issue of result.issues) lines.push(formatIssue(issue));
  }

  if (result.nextActions.length > 0) {
    lines.push("Next actions");
    for (const action of result.nextActions) lines.push(`- ${action}`);
  }

  return `${lines.join("\n")}\n`;
}

export function renderInstallHumanOutput(
  result: InstallCommandResult,
  options: HumanOutputOptions = {},
): string {
  const locale = options.locale ?? "zh-CN";
  const installOutcome = getInstallHumanOutcome(result);
  if (isReadySummaryResult(result)) {
    return renderInstallReadySummary(result, locale);
  }

  return renderPresentationFrame({
    title: "SpecLite install",
    result,
    outcomeLabel: formatInstallHumanOutcome(locale, installOutcome),
    locale,
    writeState: getInstallPresentationWriteState(installOutcome),
    summaryLines: formatInstallSummaryLines(result, locale, installOutcome),
    scopeLines: [
      `targetProject=${result.targetProject}`,
      `projectRoot=${result.data.paths.projectRoot}`,
    ],
    stateLines: [
      `manifestVersion=${result.data.manifestVersion}`,
      formatLabelValue(locale, "completedSteps", formatListForLocale(result.data.completedSteps, locale)),
      `completedSteps=${formatList(result.data.completedSteps)}`,
      formatLabelValue(locale, "pendingSteps", formatListForLocale(result.data.pendingSteps, locale)),
      `pendingSteps=${formatList(result.data.pendingSteps)}`,
      ...formatInstallOutcomeStepStateLines(result, installOutcome, locale),
      formatInstallIdeTargetStatusesHeading(locale),
      ...formatInstallIdeTargetStatusLines(result.data.ideTargets, locale),
    ],
    evidenceLines: [
      getCliMessage(locale, "source"),
      `- ${formatSourceDescriptor(result.data.sourceDescriptor)}`,
      getCliMessage(locale, "externalAccess"),
      ...(locale === "zh-CN"
        ? formatInstallExternalAccessZh(result.data.sourceDescriptor)
        : formatInstallExternalAccess(result.data.sourceDescriptor)),
      getCliMessage(locale, "authorization"),
      result.data.sourceDescriptor.trustStatus === "blocked"
        ? locale === "zh-CN"
          ? "source 在写入计划前已处于 blocked 状态。"
          : "Source is blocked before write planning."
        : locale === "zh-CN"
          ? "命令级写入授权与 source 选择分离。"
          : "Command-level write authorization is separate from source selection.",
      ...formatInstallOutcomeEvidenceLines(result, locale, installOutcome),
    ],
    emptyStateLines: getCommonEmptyStateLines(result, locale),
    nextActions: formatInstallOutcomeNextActions(result, locale, installOutcome),
  });
}

export function renderStatusHumanOutput(
  result: StatusCommandResult,
  options: HumanOutputOptions = {},
): string {
  const locale = options.locale ?? "zh-CN";
  const statusOutcome = getStatusHumanOutcome(result);
  return renderPresentationFrame({
    title: "SpecLite status",
    result,
    outcomeLabel: statusOutcome,
    locale,
    summaryLines: [
      getStatusOutcomeSummary(locale, statusOutcome),
      formatLabelValue(locale, "commandStatus", `${result.status} ${getCliMessage(locale, "commandStatusStatusNote")}`),
    ],
    scopeLines: [
      `targetProject=${result.targetProject}`,
      `projectRoot=${result.data.paths.projectRoot}`,
    ],
    stateLines: [
      formatLabelValue(locale, "highLevelHealth", result.data.highLevelHealth),
      `highLevelHealth=${result.data.highLevelHealth}`,
      formatLabelValue(locale, "source", formatOptionalSourceDescriptor(result.data.sourceDescriptor)),
      formatLabelValue(
        locale,
        "manifest",
        `${result.data.manifestPresent ? "present" : "missing"}${result.data.manifestVersion === undefined ? "" : `, version=${result.data.manifestVersion}`}`,
      ),
      formatLabelValue(locale, "installedModules", formatListForLocale(result.data.installedModules, locale)),
      `${getCliMessage(locale, "ideTargets")}${locale === "zh-CN" ? "：" : ":"}`,
      ...formatIdeTargetStateLines(result.data.ideTargets, locale),
      getCliMessage(locale, "keyPaths"),
      `- projectRoot: ${result.data.paths.projectRoot}`,
      `- specliteRoot: ${result.data.paths.specliteRoot ?? "_speclite"}`,
      `- artifactRoot: ${result.data.paths.artifactRoot ?? "_speclite-output"}`,
      `- manifestPath: ${result.data.paths.manifestPath ?? "_speclite/_config/manifest.yaml"}`,
      `manifestPath=${result.data.paths.manifestPath ?? "_speclite/_config/manifest.yaml"}`,
    ],
    evidenceLines: formatStatusOutcomeEvidenceLines(result, statusOutcome),
    emptyStateLines: getCommonEmptyStateLines(result, locale),
    nextActions: formatStatusOutcomeNextActions(result, locale, statusOutcome),
  });
}

export function renderValidateHumanOutput(
  result: ValidateCommandResult,
  options: HumanOutputOptions = {},
): string {
  const columns = options.columns ?? 100;
  const locale = options.locale ?? "zh-CN";
  const checkedCategorySet = new Set(result.data.checkedCategories);
  const notCheckedCategories = CANONICAL_ISSUE_CATEGORY_ORDER.filter(
    (category) => !checkedCategorySet.has(category),
  );
  const checkedCategories = sortIssueCategories(result.data.checkedCategories);
  const checkedTargets = sortCheckedTargets(result.data.checkedTargets);
  const sortedIssues = sortValidationIssues(result.issues);
  const validatedPaths = sortValidatedPaths(result.data.validatedPaths);
  const validateOutcome = getValidateHumanOutcome(result);
  const presentation =
    columns < 80
      ? "key-value"
      : columns < 120
        ? "compact-table"
        : "full-table";
  const emptyStateLines = getCommonEmptyStateLines(result, locale);
  if (result.issues.length === 0) {
    emptyStateLines.push(getCliMessage(locale, "validateNoIssuesForCheckedCategories"));
    emptyStateLines.push(getCliMessage(locale, "validateNoConflicts"));
    if (result.data.checkedCategories.length === 0) {
      emptyStateLines.push(getCliMessage(locale, "validateNoCategoriesChecked"));
    }
    if (notCheckedCategories.length > 0) {
      emptyStateLines.push(getCliMessage(locale, "validateSkippedCategoriesCaveat"));
    }
  }

  return renderPresentationFrame({
    title: "SpecLite validate",
    result,
    outcomeLabel: validateOutcome,
    locale,
    summaryLines: [
      getValidateOutcomeSummary(locale, validateOutcome),
      formatLabelValue(locale, "statusLabel", result.status),
      formatLabelValue(locale, "outputProfile", `${getCliMessage(locale, "evidenceProfile")} (${presentation})`),
    ],
    scopeLines: [
      `targetProject=${result.targetProject}`,
      formatLabelValue(locale, "checkedCategories", formatListForLocale(checkedCategories, locale)),
      formatLabelValue(locale, "notCheckedCategories", formatListForLocale(notCheckedCategories, locale)),
      formatLabelValue(locale, "checkedTargets", formatListForLocale(checkedTargets, locale)),
      formatLabelValue(locale, "validatedPaths", formatListForLocale(validatedPaths, locale)),
    ],
    stateLines: [
      formatLabelValue(
        locale,
        "issueCounts",
        `critical=${result.data.issueCounts.critical}, error=${result.data.issueCounts.error}, warning=${result.data.issueCounts.warning}, info=${result.data.issueCounts.info}`,
      ),
    ],
    issueLines: sortedIssues.length === 0
      ? []
      : [
        formatLabelValue(locale, "issueFields", "severity, category, issueId, affectedPath, impact, suggestedNextStep"),
        ...sortedIssues.map((issue) => formatIssue(issue, locale)),
      ],
    emptyStateLines,
    nextActions: formatValidateOutcomeNextActions(result, locale, sortedIssues, validateOutcome),
  });
}

export function renderUpdateHumanOutput(
  result: UpdateCommandResult | RepairCommandResult,
  options: HumanOutputOptions = {},
): string {
  const columns = options.columns ?? 100;
  const locale = options.locale ?? "zh-CN";
  const presentation = columns < 80 ? "key-value" : columns < 120 ? "compact-table" : "full-table";
  const isRepair = result.command === "update.repair";
  const updateOutcome = getUpdateHumanOutcome(result);
  const planActions = isRepair ? result.data.repairPlan.actions : result.data.updatePlan.actions;
  const plannedWrites = planActions.filter((action) =>
    action.action === "create" ||
    action.action === "update" ||
    action.action === "restore-canonical" ||
    action.action === "regenerate"
  );
  const executionState = getUpdateExecutionState(result);
  const emptyStateLines = getCommonEmptyStateLines(result, locale);
  if (plannedWrites.length === 0) emptyStateLines.push(getCliMessage(locale, "noPlannedWrites"));
  if (result.data.conflicts.length === 0) emptyStateLines.push(getCliMessage(locale, "noConflicts"));

  return renderPresentationFrame({
    title: "SpecLite update",
    result,
    outcomeLabel: updateOutcome,
    locale,
    writeState: updateOutcome === "applied" ? "changed" : "auto",
    summaryLines: [
      getUpdateOutcomeSummary(locale, updateOutcome, isRepair),
      formatLabelValue(locale, "statusLabel", result.status),
      formatLabelValue(locale, "mode", isRepair ? "repair" : "update"),
      formatLabelValue(locale, "outputProfile", `${getCliMessage(locale, "evidenceProfile")} (${presentation})`),
      formatLabelValue(locale, "planStatus", updateOutcome),
    ],
    scopeLines: [`targetProject=${result.targetProject}`],
    stateLines: [
      getCliMessage(locale, "authorization"),
      `requiresConfirmation=${result.data.requiresConfirmation}`,
      `writeAuthorized=${result.data.writeAuthorized}`,
      ...formatUpdateAuthorizationGuidance(result, plannedWrites.length, updateOutcome, locale),
      ...formatUpdateStepStateLines(executionState, locale),
    ],
    evidenceLines: [
      getCliMessage(locale, isRepair ? "repairPlanEffects" : "updatePlanEffects"),
      ...formatPlanActionLines(planActions, locale),
      getCliMessage(locale, "changedPaths"),
      ...formatPathLines(result.data.changedPaths, getCliMessage(locale, "noPathsChangedYet")),
      getCliMessage(locale, "skippedPaths"),
      ...formatPathLines(result.data.skippedPaths, getCliMessage(locale, "noPathsSkippedDuringApply")),
      getCliMessage(locale, isRepair ? "remainingConflicts" : "conflicts"),
      ...formatConflictLines(result, locale),
      ...formatUpdateOutcomeEvidenceLines(result, updateOutcome, executionState, locale),
      getCliMessage(locale, "protectedBoundaries"),
      `- ${getCliMessage(locale, "protectedBoundaryCustom")}`,
      `- ${getCliMessage(locale, "protectedBoundaryArtifact")}`,
      `- ${getCliMessage(locale, "protectedBoundaryInstallerDrift")}`,
    ],
    emptyStateLines,
    nextActions: formatUpdateOutcomeNextActions(result, locale, updateOutcome),
  });
}

export function renderSyncHumanOutput(result: SyncCommandResult): string {
  const lines = [
    "SpecLite sync",
    `Status: ${result.status}`,
    "Summary",
    result.summary,
    "Sync Plan / Planned Effects",
  ];

  if (result.data.syncPlan.actions.length === 0) {
    lines.push("- none");
  } else {
    for (const action of result.data.syncPlan.actions) lines.push(formatPlanAction(action));
  }

  lines.push(
    "Authorization",
    `requiresConfirmation=${result.data.requiresConfirmation}`,
    `writeAuthorized=${result.data.writeAuthorized}`,
    "Changed Paths",
    ...formatPathLines(result.data.changedPaths, "No paths changed yet."),
    "Skipped Paths",
    ...formatPathLines(result.data.skippedPaths, "No paths skipped during apply."),
  );

  if (result.data.conflicts.length > 0) {
    lines.push("Conflicts:");
    for (const conflict of result.data.conflicts) {
      lines.push(
        `- affectedPath=${conflict.affectedPath}; ownership=${conflict.ownership}; action=conflict; reason=${conflict.reason}`,
      );
    }
  }

  if (result.issues.length > 0) {
    lines.push("Issues:");
    for (const issue of result.issues) lines.push(formatIssue(issue));
  }

  if (result.nextActions.length > 0) {
    lines.push("Next actions");
    for (const action of result.nextActions) lines.push(`- ${action}`);
  }

  return `${lines.join("\n")}\n`;
}

export function renderUninstallHumanOutput(result: UninstallCommandResult): string {
  const lines = [
    "SpecLite uninstall",
    `Status: ${result.status}`,
    "Summary",
    result.summary,
    "Uninstall Plan / Planned Effects",
  ];

  if (result.data.uninstallPlan.actions.length === 0) {
    lines.push("- none");
  } else {
    for (const action of result.data.uninstallPlan.actions) {
      lines.push(
        `- affectedPath=${action.affectedPath}; ownership=${action.ownership}; action=${action.action}${action.reason === undefined ? "" : `; reason=${action.reason}`}`,
      );
    }
  }

  lines.push(
    "Authorization",
    `requiresConfirmation=${result.data.requiresConfirmation}`,
    `writeAuthorized=${result.data.writeAuthorized}`,
    "Removed Paths",
    ...formatPathLines(result.data.removedPaths, "No paths removed yet."),
    "Preserved Paths",
    ...formatPathLines(result.data.preservedPaths, "No protected paths found."),
  );

  if (result.issues.length > 0) {
    lines.push("Issues:");
    for (const issue of result.issues) lines.push(formatIssue(issue));
  }

  if (result.nextActions.length > 0) {
    lines.push("Next actions");
    for (const action of result.nextActions) lines.push(`- ${action}`);
  }

  return `${lines.join("\n")}\n`;
}

export function renderGovernanceReportHumanOutput(result: GovernanceReportCommandResult): string {
  const lines = [
    "SpecLite governance report",
    `Status: ${result.status}`,
    "Summary",
    result.summary,
    "Scope",
    `- manifestPath=${result.data.scope.manifestPath}`,
    `- phaseCoveragePath=${result.data.scope.phaseCoveragePath}`,
    `- artifactRoot=${result.data.scope.artifactRoot}`,
    "Metrics",
    `- phaseEntryCoverage=${formatRatioMetric(result.data.metrics.phaseEntryCoverage)}`,
    `- artifactPresenceRate=${formatRatioMetric(result.data.metrics.artifactPresenceRate)}`,
    `- validatePassRate=${formatRatioMetric(result.data.metrics.validatePassRate)}`,
    `- openGapCount=${result.data.metrics.openGapCount}`,
    "Gaps",
  ];

  if (result.data.phaseGaps.length === 0) {
    lines.push("- none");
  } else {
    for (const gap of result.data.phaseGaps) {
      lines.push(
        `- phaseId=${gap.phaseId}; phaseLabel=${gap.phaseLabel}; moduleId=${gap.moduleId}; canonicalSkillId=${gap.canonicalSkillId}; targetId=${gap.targetId}; reason=${gap.missingReason}`,
      );
    }
  }

  lines.push("Artifacts");
  if (result.data.artifactChecks.length === 0) {
    lines.push("- none");
  } else {
    for (const check of result.data.artifactChecks) {
      lines.push(
        `- artifactType=${check.artifactType}; defaultOutputPath=${check.defaultOutputPath}; present=${check.present}; valid=${check.valid}; issueIds=${formatList(check.issueIds)}`,
      );
    }
  }

  lines.push("Issues");
  if (result.issues.length === 0) {
    lines.push("- none");
  } else {
    for (const issue of result.issues) lines.push(formatIssue(issue));
  }

  lines.push("Next Actions");
  if (result.nextActions.length === 0) {
    lines.push("- none");
  } else {
    for (const action of result.nextActions) lines.push(`- ${action}`);
  }

  return `${lines.join("\n")}\n`;
}

function formatPathLines(paths: string[], emptyText: string): string[] {
  if (paths.length === 0) return [emptyText];
  return paths.map((value) => `- ${value}`);
}

function formatLabelValue(locale: CliLocale, key: CliMessageKeyForOutput, value: string): string {
  return locale === "zh-CN"
    ? `${getCliMessage(locale, key)}：${value}`
    : `${getCliMessage(locale, key)}: ${value}`;
}

type CliMessageKeyForOutput = Parameters<typeof getCliMessage>[1];

function formatListForLocale(values: string[], locale: CliLocale): string {
  if (values.length > 0) return values.join(", ");
  return locale === "zh-CN" ? "无" : "none";
}

function formatRatioMetric(metric: { covered: number; total: number; rate: number }): string {
  return `${metric.covered}/${metric.total} (${metric.rate})`;
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

function renderInstallReadySummary(result: InstallCommandResult, locale: CliLocale): string {
  const presentation = getInstallReadyPresentation(result);
  return renderPresentationFrame({
    title: locale === "zh-CN" ? "Step 4/4 Ready Summary（就绪摘要）" : "SpecLite ready summary",
    result,
    outcomeLabel: formatInstallHumanOutcome(locale, "ready"),
    locale,
    writeState: "changed",
    summaryLines: [
      getInstallOutcomeSummary(locale, "ready"),
      ...(locale === "zh-CN"
        ? [
          formatLabelValue(locale, "targetProject", result.targetProject),
          formatLabelValue(locale, "installLocation", result.data.paths.projectRoot),
        ]
        : [
          result.summary,
          `Target project: ${result.targetProject}`,
          `Install location: ${result.data.paths.projectRoot}`,
        ]),
      `targetProject=${result.targetProject}`,
      `projectRoot=${result.data.paths.projectRoot}`,
      formatLabelValue(locale, "manifestVersion", result.data.manifestVersion),
      `manifestVersion=${result.data.manifestVersion}`,
      `selectedModules=${formatList(result.data.installedModules)}`,
      ...(locale === "zh-CN"
        ? formatInstallReadyModeZh(result, presentation)
        : formatInstallReadyModeEn(result, presentation)),
      locale === "zh-CN"
        ? "本次 --yes 授权仅适用于无 conflict 的 planned writes。"
        : "Command-level writes were authorized only after source and install scope confirmation.",
    ],
    scopeLines: [
      ...formatInstallReadyKeyPathLines(result, locale),
      `projectRoot=${result.data.paths.projectRoot}`,
      `specliteRoot=${result.data.paths.specliteRoot ?? "_speclite"}`,
      "ideMirrors=.claude/skills,.agents/skills",
      `artifactRoot=${result.data.paths.artifactRoot ?? "_speclite-output"}`,
      `manifestPath=${result.data.paths.manifestPath ?? "_speclite/_config/manifest.yaml"}`,
    ],
    stateLines: [
      getCliMessage(locale, "completedSteps"),
      ...result.data.completedSteps.map((stepId) => `- ${stepId}`),
      getCliMessage(locale, "installedModules"),
      ...result.data.installedModules.map((moduleId) => `- ${moduleId}`),
      getCliMessage(locale, "installIdeTargets"),
      ...formatIdeTargetStateLines(result.data.ideTargets, locale),
    ],
    evidenceLines: [
      getCliMessage(locale, "source"),
      `- ${formatSourceDescriptor(result.data.sourceDescriptor)}`,
      getCliMessage(locale, "externalAccess"),
      ...(locale === "zh-CN"
        ? formatInstallExternalAccessZh(result.data.sourceDescriptor)
        : formatInstallExternalAccess(result.data.sourceDescriptor)),
      getCliMessage(locale, "authorization"),
      locale === "zh-CN"
        ? "已通过 --yes 授权无 conflict 的 planned writes；source 与 install scope 已在写入前完成确认。"
        : "Command-level writes were authorized only after source and install scope confirmation.",
    ],
    emptyStateLines: getCommonEmptyStateLines(result, locale, "changed"),
    nextActions: formatInstallOutcomeNextActions(result, locale, "ready"),
  });
}

const INSTALL_READY_PRESENTATION_KEY = "__specliteInstallReadyPresentation";

type InstallReadyPresentation = {
  installFlow?: "default-no-prompt" | "explicit-interactive";
  configMode?: "quick" | "detailed";
};

function getInstallReadyPresentation(result: InstallCommandResult): InstallReadyPresentation | undefined {
  return (result as InstallCommandResult & {
    [INSTALL_READY_PRESENTATION_KEY]?: InstallReadyPresentation;
  })[INSTALL_READY_PRESENTATION_KEY];
}

function formatInstallReadyKeyPathLines(result: InstallCommandResult, locale: CliLocale): string[] {
  if (locale === "en-US") {
    return [
      getCliMessage(locale, "keyPaths"),
      `- projectRoot: ${result.data.paths.projectRoot} (install location)`,
      `- specliteRoot: ${result.data.paths.specliteRoot ?? "_speclite"} (metadata/control hub)`,
      "- .claude/skills and .agents/skills (IDE execution plane)",
      `- artifactRoot: ${result.data.paths.artifactRoot ?? "_speclite-output"} (artifact repository)`,
      `- manifestPath: ${result.data.paths.manifestPath ?? "_speclite/_config/manifest.yaml"} (installed-state projection)`,
    ];
  }

  return [
    getCliMessage(locale, "keyPaths"),
    `- projectRoot: ${result.data.paths.projectRoot}（安装位置）`,
    `- specliteRoot: ${result.data.paths.specliteRoot ?? "_speclite"}（metadata 与控制目录）`,
    "- .claude/skills and .agents/skills（IDE 执行目录）",
    `- artifactRoot: ${result.data.paths.artifactRoot ?? "_speclite-output"}（artifact 仓库）`,
    `- manifestPath: ${result.data.paths.manifestPath ?? "_speclite/_config/manifest.yaml"}（installed-state 投影）`,
  ];
}

function formatInstallReadyModeZh(
  result: InstallCommandResult,
  presentation: InstallReadyPresentation | undefined,
): string[] {
  if (presentation?.installFlow === "default-no-prompt" || isDefaultInstallReadySummary(result, presentation)) {
    return ["install --yes 已使用默认 modules、quick config 和默认 IDE 目标完成无交互安装。"];
  }

  return [
    "install --yes --interactive 已按显式交互选择完成安装。",
    `configMode=${presentation?.configMode ?? extractConfigMode(result.summary) ?? "unknown"}`,
    `ideTargets=${formatList(result.data.ideTargets.map((target) => target.id))}`,
  ];
}

function formatInstallReadyModeEn(
  result: InstallCommandResult,
  presentation: InstallReadyPresentation | undefined,
): string[] {
  if (presentation?.installFlow === "default-no-prompt" || isDefaultInstallReadySummary(result, presentation)) {
    return ["install --yes completed with default modules, quick config and default IDE targets."];
  }

  return [
    "install --yes --interactive completed with explicit interactive selections.",
    `Config mode: ${presentation?.configMode ?? extractConfigMode(result.summary) ?? "unknown"}`,
    `ideTargets=${formatList(result.data.ideTargets.map((target) => target.id))}`,
  ];
}

function isDefaultInstallReadySummary(
  result: InstallCommandResult,
  presentation: InstallReadyPresentation | undefined,
): boolean {
  if (presentation !== undefined) return false;

  return (
    arraysEqual(result.data.installedModules, ["core", "sdlc"]) &&
    arraysEqual(result.data.ideTargets.map((target) => target.id), ["claude", "agents"]) &&
    extractConfigMode(result.summary) === "quick"
  );
}

function extractConfigMode(summary: string): "quick" | "detailed" | undefined {
  if (summary.includes("Config mode: detailed.")) return "detailed";
  if (summary.includes("Config mode: quick.")) return "quick";
  return undefined;
}

function arraysEqual(left: string[], right: string[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index]);
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

function getCommandOutcomeLabel(result: CoveredHumanCommandResult): string {
  if (result.command === "install") {
    return getInstallHumanOutcome(result);
  }
  if (result.command === "update") {
    return getUpdateHumanOutcome(result);
  }
  if (result.command === "update.repair") {
    return getUpdateHumanOutcome(result);
  }
  if (result.command === "status") {
    return getStatusHumanOutcome(result);
  }
  if (result.command === "validate") {
    return getValidateHumanOutcome(result);
  }
  return `${result.command}-${result.status}`;
}

function getStatusHumanOutcome(result: StatusCommandResult): StatusHumanOutcome {
  switch (result.data.highLevelHealth) {
    case "configured":
      return "installed";
    case "not-configured":
      return "not-installed";
    case "partial":
      return "partial";
    case "failed":
      return "failed";
  }
}

function getStatusOutcomeSummary(locale: CliLocale, outcome: StatusHumanOutcome): string {
  switch (outcome) {
    case "installed":
      return getCliMessage(locale, "statusSummaryInstalled");
    case "not-installed":
      return getCliMessage(locale, "statusSummaryNotInstalled");
    case "stale":
      return getCliMessage(locale, "statusSummaryStale");
    case "partial":
      return getCliMessage(locale, "statusSummaryPartial");
    case "failed":
      return getCliMessage(locale, "statusSummaryFailed");
    case "unknown":
      return getCliMessage(locale, "statusSummaryUnknown");
  }
}

function formatStatusOutcomeEvidenceLines(result: StatusCommandResult, outcome: StatusHumanOutcome): string[] {
  const lines = [
    `highLevelHealth=${result.data.highLevelHealth}`,
    `manifestPresent=${String(result.data.manifestPresent)}`,
    `sourceDescriptor=${formatOptionalSourceDescriptor(result.data.sourceDescriptor)}`,
    `ideTargetSummary=${formatStatusIdeTargetSummary(result)}`,
  ];

  if (outcome === "stale" || outcome === "unknown") {
    lines.push(
      "Human-derived label only; public JSON highLevelHealth remains unchanged.",
      "Evidence source: manifest, source descriptor, version evidence, or installed-state summary insufficiency.",
    );
  }

  return lines;
}

function formatStatusOutcomeNextActions(
  result: StatusCommandResult,
  locale: CliLocale,
  outcome: StatusHumanOutcome,
): string[] {
  if (locale === "en-US") {
    switch (outcome) {
      case "installed":
        return result.nextActions.length === 0 ? [getCliMessage(locale, "nextActionNone")] : result.nextActions;
      case "not-installed":
        return dedupeLines([
          formatCliMessage(locale, "statusActionInstall", { command: "speclite install <target>" }),
          ...result.nextActions,
        ]);
      case "partial":
        return dedupeLines([
          formatCliMessage(locale, "statusActionInspectIdeThenValidate", { command: "speclite validate <target>" }),
          ...result.nextActions,
        ]);
      case "failed":
        return dedupeLines([
          formatCliMessage(locale, "statusActionInspectManifestThenValidate", { command: "speclite validate <target>" }),
          ...result.nextActions,
        ]);
      case "stale":
        return dedupeLines([
          formatCliMessage(locale, "statusActionValidateFreshness", { command: "speclite validate <target>" }),
          ...result.nextActions,
        ]);
      case "unknown":
        return dedupeLines([
          formatCliMessage(locale, "statusActionRestoreMetadata", { command: "speclite install <target>" }),
          ...result.nextActions,
        ]);
    }
  }

  switch (outcome) {
    case "installed":
      return [getCliMessage(locale, "nextActionNone")];
    case "not-installed":
      return dedupeLines([
        formatCliMessage(locale, "statusActionInstall", { command: "speclite install <target>" }),
      ]);
    case "partial":
      return dedupeLines([
        formatCliMessage(locale, "statusActionInspectIdeThenValidate", { command: "speclite validate <target>" }),
        formatCliMessage(locale, "updateActionStatusAfterWrites", { command: "speclite status <target>" }),
      ]);
    case "failed":
      return dedupeLines([
        formatCliMessage(locale, "statusActionInspectManifestThenValidate", { command: "speclite validate <target>" }),
        formatCliMessage(locale, "updateActionStatusAfterWrites", { command: "speclite status <target>" }),
      ]);
    case "stale":
      return dedupeLines([
        formatCliMessage(locale, "statusActionValidateFreshness", { command: "speclite validate <target>" }),
      ]);
    case "unknown":
      return dedupeLines([
        formatCliMessage(locale, "statusActionRestoreMetadata", { command: "speclite install <target>" }),
        formatCliMessage(locale, "updateActionValidateAfterWrites", { command: "speclite validate <target>" }),
      ]);
  }
}

function getValidateHumanOutcome(result: ValidateCommandResult): ValidateHumanOutcome {
  if (result.status === "failure" && result.issues.length === 0) return "cannot-validate";
  if (result.data.issueCounts.critical > 0 || result.data.issueCounts.error > 0 || result.status === "failure") {
    return "invalid";
  }
  if (result.data.issueCounts.warning > 0 || result.data.issueCounts.info > 0 || result.status === "warning") {
    return "valid-with-warnings";
  }
  return "valid";
}

function getValidateOutcomeSummary(locale: CliLocale, outcome: ValidateHumanOutcome): string {
  switch (outcome) {
    case "valid":
      return getCliMessage(locale, "validateSummaryValid");
    case "valid-with-warnings":
      return getCliMessage(locale, "validateSummaryValidWithWarnings");
    case "invalid":
      return getCliMessage(locale, "validateSummaryInvalid");
    case "cannot-validate":
      return getCliMessage(locale, "validateSummaryCannotValidate");
  }
}

function formatValidateOutcomeNextActions(
  result: ValidateCommandResult,
  locale: CliLocale,
  sortedIssues: ValidationIssue[],
  outcome: ValidateHumanOutcome,
): string[] {
  if (locale === "en-US") {
    if (outcome === "valid") {
      return result.nextActions.length === 0
        ? [getCliMessage(locale, "nextActionNone")]
        : result.nextActions;
    }

    const blockingIssueActions = sortedIssues
      .filter((issue) => issue.severity === "critical" || issue.severity === "error")
      .map((issue) => formatIssueSuggestedNextStep(issue, locale, "speclite validate <target>"));
    const warningIssueActions = sortedIssues
      .filter((issue) => issue.severity === "warning" || issue.severity === "info")
      .map((issue) => formatIssueSuggestedNextStep(issue, locale, "speclite validate <target>"));

    if (outcome === "cannot-validate") {
      return dedupeLines([
        formatCliMessage(locale, "validateActionRestoreMetadata", { command: "speclite validate <target>" }),
        ...result.nextActions,
      ]);
    }

    return dedupeLines([
      ...blockingIssueActions,
      ...warningIssueActions,
      ...result.nextActions,
      formatCliMessage(locale, "validateActionRerunAfterIssues", { command: "speclite validate <target>" }),
    ]);
  }

  if (outcome === "valid") {
    return [
      formatCliMessage(locale, "validateActionContinue", { command: "speclite status <target>" }),
      formatCliMessage(locale, "updateActionStatusAfterWrites", { command: "speclite status <target>" }),
    ];
  }

  const blockingIssueActions = sortedIssues
    .filter((issue) => issue.severity === "critical" || issue.severity === "error")
    .map((issue) => formatIssueSuggestedNextStep(issue, locale, "speclite validate <target>"));
  const warningIssueActions = sortedIssues
    .filter((issue) => issue.severity === "warning" || issue.severity === "info")
    .map((issue) => formatIssueSuggestedNextStep(issue, locale, "speclite validate <target>"));

  if (outcome === "cannot-validate") {
    return dedupeLines([
      formatCliMessage(locale, "validateActionRestoreMetadata", { command: "speclite validate <target>" }),
      formatCliMessage(locale, "updateActionStatusAfterWrites", { command: "speclite status <target>" }),
    ]);
  }

  return dedupeLines([
    ...blockingIssueActions,
    ...warningIssueActions,
    formatCliMessage(locale, "validateActionRerunAfterIssues", { command: "speclite validate <target>" }),
    formatCliMessage(locale, "updateActionStatusAfterWrites", { command: "speclite status <target>" }),
  ]);
}

function getInstallHumanOutcome(result: InstallCommandResult): InstallHumanOutcome {
  if (isReadySummaryResult(result)) return "ready";
  if (isReadyCheckFailure(result)) return "ready-check-failed";
  if (isWriteStageFailure(result)) return "write-failed";
  if (result.status === "failure") return "blocked-before-write";
  return "prewrite-paused";
}

function isReadyCheckFailure(result: InstallCommandResult): boolean {
  return (
    result.status === "failure" &&
    result.data.completedSteps.includes("manifest-generation") &&
    result.data.pendingSteps.includes("ready-check")
  );
}

function isWriteStageFailure(result: InstallCommandResult): boolean {
  return (
    result.status === "failure" &&
    result.data.completedSteps.includes("config-initialization") &&
    !isReadyCheckFailure(result)
  );
}

function formatInstallHumanOutcome(locale: CliLocale, outcome: InstallHumanOutcome): string {
  switch (outcome) {
    case "prewrite-paused":
      return getCliMessage(locale, "installOutcomePrewritePaused");
    case "blocked-before-write":
      return getCliMessage(locale, "installOutcomeBlockedBeforeWrite");
    case "write-failed":
      return getCliMessage(locale, "installOutcomeWriteFailed");
    case "ready-check-failed":
      return getCliMessage(locale, "installOutcomeReadyCheckFailed");
    case "ready":
      return getCliMessage(locale, "installOutcomeReady");
  }
}

function getInstallOutcomeSummary(locale: CliLocale, outcome: InstallHumanOutcome): string {
  switch (outcome) {
    case "prewrite-paused":
      return getCliMessage(locale, "installSummaryPrewritePaused");
    case "blocked-before-write":
      return getCliMessage(locale, "installSummaryBlockedBeforeWrite");
    case "write-failed":
      return getCliMessage(locale, "installSummaryWriteFailed");
    case "ready-check-failed":
      return getCliMessage(locale, "installSummaryReadyCheckFailed");
    case "ready":
      return getCliMessage(locale, "installSummaryReady");
  }
}

function formatInstallSummaryLines(
  result: InstallCommandResult,
  locale: CliLocale,
  outcome: InstallHumanOutcome,
): string[] {
  if (locale === "en-US") {
    return [
      getInstallOutcomeSummary(locale, outcome),
      result.summary,
    ];
  }

  return [
    getInstallOutcomeSummary(locale, outcome),
    formatLabelValue(locale, "targetProject", result.targetProject),
    formatLabelValue(locale, "projectRoot", result.data.paths.projectRoot),
  ];
}

function getInstallPresentationWriteState(outcome: InstallHumanOutcome): PresentationWriteState {
  if (outcome === "ready" || outcome === "ready-check-failed" || outcome === "write-failed") return "changed";
  return "none";
}

function formatInstallOutcomeStepStateLines(
  result: InstallCommandResult,
  outcome: InstallHumanOutcome,
  locale: CliLocale,
): string[] {
  if (outcome !== "write-failed" && outcome !== "ready-check-failed") return [];
  const failedStep = outcome === "ready-check-failed" ? "ready-check" : getInstallFailedStep(result);
  if (locale === "en-US") {
    return [
      `Failed step: ${failedStep}`,
      `Completed write scope: ${formatList(getCompletedInstallWriteSteps(result))}`,
    ];
  }

  return [
    formatLabelValue(locale, "failedStep", failedStep),
    formatLabelValue(locale, "completedWrites", formatListForLocale(getCompletedInstallWriteSteps(result), locale)),
  ];
}

function formatInstallOutcomeEvidenceLines(
  result: InstallCommandResult,
  locale: CliLocale,
  outcome: InstallHumanOutcome,
): string[] {
  if (outcome === "blocked-before-write") {
    return [getCliMessage(locale, "installActionFixBlockerBeforeYes")];
  }
  if (outcome === "write-failed") {
    return [
      getCliMessage(locale, "installActionInspectCompletedWrites"),
      ...formatInstallExecutionEvidenceLines(result, locale, getInstallFailedStep(result)),
    ];
  }
  if (outcome === "ready-check-failed") {
    return [
      getCliMessage(locale, "installActionFixReadyCheck"),
      ...formatInstallExecutionEvidenceLines(result, locale, "ready-check"),
    ];
  }
  return [];
}

function formatInstallExecutionEvidenceLines(
  result: InstallCommandResult,
  locale: CliLocale,
  failedStep: string,
): string[] {
  if (locale === "en-US") {
    return [
      `Failed step: ${failedStep}`,
      `Completed write scope: ${formatList(getCompletedInstallWriteSteps(result))}`,
      `Pending steps: ${formatList(result.data.pendingSteps)}`,
    ];
  }

  return [
    formatLabelValue(locale, "failedStep", failedStep),
    formatLabelValue(locale, "completedWrites", formatListForLocale(getCompletedInstallWriteSteps(result), locale)),
    formatLabelValue(locale, "pendingSteps", formatListForLocale(result.data.pendingSteps, locale)),
  ];
}

function formatInstallOutcomeNextActions(
  result: InstallCommandResult,
  locale: CliLocale,
  outcome: InstallHumanOutcome,
): string[] {
  const installTarget = formatInstallCommandTarget(result);
  if (locale === "en-US") {
    if (outcome === "prewrite-paused") {
      return [
        formatCliMessage(locale, "installActionRunYes", { command: `speclite install ${installTarget} --yes` }),
        formatCliMessage(locale, "installActionRunInteractive", {
          command: `speclite install ${installTarget} --interactive`,
        }),
      ];
    }
    if (outcome === "blocked-before-write") {
      return dedupeLines([
        ...formatIssueNextActions(result.issues, locale, `speclite install ${installTarget} --yes`),
        formatCliMessage(locale, "installActionFixBlockerThenRunYes", {
          command: `speclite install ${installTarget} --yes`,
        }),
        ...result.nextActions,
      ]);
    }
    if (outcome === "write-failed") {
      return dedupeLines([
        ...formatIssueNextActions(result.issues, locale, `speclite validate ${installTarget}`),
        formatCliMessage(locale, "installActionInspectCompletedThenValidate", {
          command: `speclite validate ${installTarget}`,
        }),
        ...result.nextActions,
      ]);
    }
    if (outcome === "ready-check-failed") {
      return dedupeLines([
        ...formatIssueNextActions(result.issues, locale, `speclite validate ${installTarget}`),
        formatCliMessage(locale, "installActionFixReadyThenInstallOrValidate", {
          installCommand: `speclite install ${installTarget} --yes`,
          validateCommand: `speclite validate ${installTarget}`,
        }),
        ...result.nextActions,
      ]);
    }
    return result.nextActions.length === 0 ? [getCliMessage(locale, "nextActionNone")] : result.nextActions;
  }

  if (outcome === "prewrite-paused") {
    return [
      formatCliMessage(locale, "installActionRunYes", { command: `speclite install ${installTarget} --yes` }),
      formatCliMessage(locale, "installActionRunInteractive", {
        command: `speclite install ${installTarget} --interactive`,
      }),
    ];
  }
  if (outcome === "blocked-before-write") {
    return dedupeLines([
      ...formatIssueNextActions(result.issues, locale, `speclite install ${installTarget} --yes`),
      formatCliMessage(locale, "installActionFixBlockerThenRunYes", {
        command: `speclite install ${installTarget} --yes`,
      }),
      formatCliMessage(locale, "updateActionValidateAfterWrites", { command: `speclite validate ${installTarget}` }),
    ]);
  }
  if (outcome === "write-failed") {
    return dedupeLines([
      ...formatIssueNextActions(result.issues, locale, `speclite validate ${installTarget}`),
      formatCliMessage(locale, "installActionInspectCompletedThenValidate", {
        command: `speclite validate ${installTarget}`,
      }),
      formatCliMessage(locale, "updateActionStatusAfterWrites", { command: `speclite status ${installTarget}` }),
    ]);
  }
  if (outcome === "ready-check-failed") {
    return dedupeLines([
      ...formatIssueNextActions(result.issues, locale, `speclite validate ${installTarget}`),
      formatCliMessage(locale, "installActionFixReadyThenInstallOrValidate", {
        installCommand: `speclite install ${installTarget} --yes`,
        validateCommand: `speclite validate ${installTarget}`,
      }),
      formatCliMessage(locale, "updateActionStatusAfterWrites", { command: `speclite status ${installTarget}` }),
    ]);
  }
  return [getCliMessage(locale, "nextActionNone")];
}

function getInstallFailedStep(result: InstallCommandResult): string {
  return result.data.pendingSteps[0] ?? "unknown";
}

function getCompletedInstallWriteSteps(result: InstallCommandResult): string[] {
  return result.data.completedSteps.filter((step) =>
    step === "runtime-structure" ||
    step === "ide-mirror-creation" ||
    step === "manifest-generation"
  );
}

function formatInstallCommandTarget(result: InstallCommandResult): string {
  const target = result.targetProject.trim();
  return /^[A-Za-z0-9._/-]+$/.test(target) ? target : "<target>";
}

function getCommonEmptyStateLines(
  result: CoveredHumanCommandResult,
  locale: CliLocale,
  writeState: PresentationWriteState = "auto",
): string[] {
  const lines: string[] = [];
  if (result.issues.length === 0) lines.push(getCliMessage(locale, "noIssues"));
  if (!commandChangedProjectFiles(result, writeState)) lines.push(getCliMessage(locale, "writeNone"));
  if (result.command === "status" && result.data.installedModules.length === 0 && result.data.ideTargets.length === 0) {
    lines.push(getCliMessage(locale, "noCheckedItems"));
  }
  if (result.command === "validate" && result.data.checkedCategories.length === 0) {
    lines.push(getCliMessage(locale, "noCheckedItems"));
  }
  if ((result.command === "update" || result.command === "update.repair") && result.data.conflicts.length === 0) {
    lines.push(getCliMessage(locale, "noConflicts"));
  }
  return dedupeLines(lines);
}

function formatIdeTargetStateLines(targets: StatusCommandResult["data"]["ideTargets"], locale: CliLocale = "en-US"): string[] {
  if (targets.length === 0) return [`- ${formatListForLocale([], locale)}`];
  return targets.map((target) => {
    const skillCount = target.skillCount ?? 0;
    const targetPath = target.targetPath ?? "not-configured";
    const reason = target.reason === undefined ? "" : `, reason=${target.reason}`;
    return `- ${target.id}: ${target.status}, skills=${skillCount}, path=${targetPath}${reason}`;
  });
}

function formatStatusIdeTargetSummary(result: StatusCommandResult): string {
  if (result.data.ideTargets.length === 0) return "none";
  const counts = new Map<string, number>();
  for (const target of result.data.ideTargets) {
    counts.set(target.status, (counts.get(target.status) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([status, count]) => `${status}=${count}`)
    .join(", ");
}

function formatInstallIdeTargetStatusLines(
  targets: InstallCommandResult["data"]["ideTargets"],
  locale: CliLocale = "en-US",
): string[] {
  if (targets.length === 0) return [`- ${formatListForLocale([], locale)}`];
  return targets.map((target) => {
    const pathSuffix = target.targetPath === undefined ? "" : ` (${target.targetPath})`;
    const skillCountSuffix = target.skillCount === undefined ? "" : `, skills=${target.skillCount}`;
    return `- ${target.id}: ${target.status}${pathSuffix}${skillCountSuffix}`;
  });
}

function formatInstallIdeTargetStatusesHeading(locale: CliLocale): string {
  return locale === "en-US"
    ? `${getCliMessage(locale, "ideTargetStatuses")}:`
    : getCliMessage(locale, "ideTargetStatuses");
}

function formatPlanActionLines(
  actions: UpdateCommandResult["data"]["updatePlan"]["actions"] | RepairCommandResult["data"]["repairPlan"]["actions"],
  locale: CliLocale = "en-US",
): string[] {
  if (actions.length === 0) return [`- ${formatListForLocale([], locale)}`];
  return actions.map((action) => formatPlanAction(action, locale));
}

function formatUpdateAuthorizationGuidance(
  result: UpdateCommandResult | RepairCommandResult,
  plannedWriteCount: number,
  outcome: UpdateHumanOutcome,
  locale: CliLocale = "en-US",
): string[] {
  const isRepair = result.command === "update.repair";
  if (outcome === "blocked-by-conflict") {
    return [getCliMessage(locale, "conflictsBlockWriteAuthorizationSentence")];
  }
  if (outcome === "partial-or-failed") {
    return [getCliMessage(locale, isRepair ? "repairWriteIncompleteSentence" : "updateWriteIncompleteSentence")];
  }
  if (result.data.writeAuthorized) {
    return [getCliMessage(locale, isRepair ? "repairWritesAuthorizedSentence" : "updateWritesAuthorizedSentence")];
  }
  if (plannedWriteCount > 0) {
    return [getCliMessage(locale, isRepair ? "repairNoWritesAuthorizedSentence" : "updateNoWritesAuthorizedSentence")];
  }
  return [getCliMessage(locale, "noWritesAuthorizedSentence")];
}

function formatUpdateStepStateLines(executionState: UpdateExecutionState, locale: CliLocale = "en-US"): string[] {
  if (
    executionState.completedSteps.length === 0 &&
    executionState.failedStep === undefined &&
    executionState.pendingSteps.length === 0
  ) return [];

  return [
    getCliMessage(locale, "stepState"),
    formatLabelValue(locale, "completedSteps", formatListForLocale(executionState.completedSteps, locale)),
    formatLabelValue(locale, "failedStep", executionState.failedStep ?? formatListForLocale([], locale)),
    formatLabelValue(locale, "pendingSteps", formatListForLocale(executionState.pendingSteps, locale)),
  ];
}

function formatConflictLines(result: UpdateCommandResult | RepairCommandResult, locale: CliLocale = "en-US"): string[] {
  if (result.data.conflicts.length === 0) {
    return [
      result.command === "update.repair"
        ? getCliMessage(locale, "noRemainingConflicts")
        : getCliMessage(locale, "noConflictsDetectedSentence"),
    ];
  }
  return result.data.conflicts.map((conflict) =>
    `- affectedPath=${conflict.affectedPath}; ownership=${conflict.ownership}; action=conflict; reason=${conflict.reason}; nextAction=${getConflictNextAction(conflict, locale)}`,
  );
}

function dedupeLines(lines: string[]): string[] {
  return [...new Set(lines)];
}

function getConflictNextAction(conflict: UpdateCommandResult["data"]["conflicts"][number], locale: CliLocale = "en-US"): string {
  if (conflict.reason === "installer-owned-drift") {
    return getCliMessage(locale, "conflictActionInstallerOwnedDrift");
  }
  if (conflict.reason === "human-owned") {
    return getCliMessage(locale, "conflictActionHumanOwned");
  }
  if (conflict.reason === "workflow-owned") {
    return getCliMessage(locale, "conflictActionWorkflowOwned");
  }
  if (conflict.reason === "unknown-ownership") {
    return getCliMessage(locale, "conflictActionUnknownOwnership");
  }
  if (conflict.reason === "missing-source-evidence") {
    return getCliMessage(locale, "conflictActionMissingSourceEvidence");
  }
  if (conflict.reason === "unsupported-repair") {
    return getCliMessage(locale, "conflictActionUnsupportedRepair");
  }
  if (conflict.reason === "not-authorized") {
    return getCliMessage(locale, "conflictActionNotAuthorized");
  }
  if (conflict.reason === "unchanged") {
    return getCliMessage(locale, "conflictActionUnchanged");
  }
  return formatCliMessage(locale, "conflictActionUnknownReason", { reason: conflict.reason });
}

function getUpdateHumanOutcome(result: UpdateCommandResult | RepairCommandResult): UpdateHumanOutcome {
  if (result.data.conflicts.length > 0) return "blocked-by-conflict";
  if (isPartialOrFailedUpdate(result)) return "partial-or-failed";
  if (result.data.writeAuthorized && result.data.changedPaths.length > 0) return "applied";

  const actions = result.command === "update.repair" ? result.data.repairPlan.actions : result.data.updatePlan.actions;
  const hasWritePlan = actions.some(
    (action) =>
      action.action === "create" ||
      action.action === "update" ||
      action.action === "restore-canonical" ||
      action.action === "regenerate",
  );
  if (!hasWritePlan) return "no-op";
  return result.command === "update.repair" ? "repair-plan-ready" : "plan-ready";
}

function isPartialOrFailedUpdate(result: UpdateCommandResult | RepairCommandResult): boolean {
  if (result.status !== "failure") return false;
  if (result.data.conflicts.length > 0) return false;
  const executionState = getUpdateExecutionState(result);
  if (
    executionState.failedStep !== undefined ||
    executionState.completedSteps.length > 0 ||
    executionState.pendingSteps.length > 0
  ) return true;

  return result.issues.some((issue) =>
    issue.category === "operation-lock" ||
    issue.component === "operation-lock" ||
    issue.component === "safe-write" ||
    issue.issueId.includes("safe-write") ||
    issue.issueId.includes("operation-lock")
  );
}

function getUpdateExecutionState(result: UpdateCommandResult | RepairCommandResult): UpdateExecutionState {
  const fromData = result.command === "update"
    ? {
      completedSteps: result.data.completedSteps ?? [],
      failedStep: result.data.failedStep,
      pendingSteps: result.data.pendingSteps ?? [],
    }
    : {
      completedSteps: [],
      failedStep: undefined,
      pendingSteps: [],
    };

  const fromIssues = result.issues.reduce<UpdateExecutionState>(
    (state, issue) => mergeExecutionState(state, getIssueExecutionState(issue.details)),
    { completedSteps: [], pendingSteps: [] },
  );
  const completedSteps = dedupeLines([
    ...fromData.completedSteps,
    ...fromIssues.completedSteps,
    ...result.data.changedPaths.map((changedPath) => `changed:${changedPath}`),
  ]);
  const failedStep = fromData.failedStep ?? fromIssues.failedStep;
  return {
    completedSteps,
    ...(failedStep === undefined ? {} : { failedStep }),
    pendingSteps: dedupeLines(fromData.pendingSteps.concat(fromIssues.pendingSteps)),
  };
}

function getIssueExecutionState(details: ValidationIssue["details"]): UpdateExecutionState {
  if (details === undefined) return { completedSteps: [], pendingSteps: [] };
  return {
    completedSteps: coerceStringList(details.completedSteps),
    ...(typeof details.failedStep === "string" ? { failedStep: details.failedStep } : {}),
    pendingSteps: coerceStringList(details.pendingSteps),
  };
}

function mergeExecutionState(left: UpdateExecutionState, right: UpdateExecutionState): UpdateExecutionState {
  const failedStep = left.failedStep ?? right.failedStep;
  return {
    completedSteps: dedupeLines([...left.completedSteps, ...right.completedSteps]),
    ...(failedStep === undefined ? {} : { failedStep }),
    pendingSteps: dedupeLines([...left.pendingSteps, ...right.pendingSteps]),
  };
}

function coerceStringList(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string");
  if (typeof value === "string" && value.length > 0) return [value];
  return [];
}

function getUpdateOutcomeSummary(locale: CliLocale, outcome: UpdateHumanOutcome, isRepair: boolean): string {
  switch (outcome) {
    case "plan-ready":
      return getCliMessage(locale, "updateSummaryPlanReady");
    case "repair-plan-ready":
      return getCliMessage(locale, "updateSummaryRepairPlanReady");
    case "no-op":
      return getCliMessage(locale, "updateSummaryNoOp");
    case "blocked-by-conflict":
      return getCliMessage(locale, "updateSummaryBlockedByConflict");
    case "applied":
      if (locale === "en-US") {
        return isRepair
          ? "Authorized repair writes were applied within protected boundaries."
          : "Authorized update writes were applied within protected boundaries.";
      }
      return getCliMessage(locale, "updateSummaryApplied");
    case "partial-or-failed":
      return getCliMessage(locale, "updateSummaryPartialOrFailed");
  }
}

function formatUpdateOutcomeEvidenceLines(
  result: UpdateCommandResult | RepairCommandResult,
  outcome: UpdateHumanOutcome,
  executionState: UpdateExecutionState,
  locale: CliLocale = "en-US",
): string[] {
  if (outcome !== "partial-or-failed") return [];
  return [
    getCliMessage(locale, "executionFailureBoundary"),
    getCliMessage(locale, "writeRepairIncompleteSentence"),
    formatLabelValue(locale, "completedWrites", formatListForLocale(result.data.changedPaths, locale)),
    formatLabelValue(locale, "completedSteps", formatListForLocale(executionState.completedSteps, locale)),
    formatLabelValue(locale, "failedStep", executionState.failedStep ?? formatListForLocale([], locale)),
    formatLabelValue(locale, "pendingSteps", formatListForLocale(executionState.pendingSteps, locale)),
    getCliMessage(locale, "unexecutedItems"),
    ...formatUnexecutedUpdateItems(result, executionState),
  ];
}

function formatUnexecutedUpdateItems(
  result: UpdateCommandResult | RepairCommandResult,
  executionState: UpdateExecutionState,
): string[] {
  const pendingSet = new Set(executionState.pendingSteps);
  const actions = result.command === "update.repair" ? result.data.repairPlan.actions : result.data.updatePlan.actions;
  const pendingActions = actions
    .filter((action) =>
      pendingSet.has(`${result.command === "update.repair" ? "repair" : "update"}:${action.affectedPath}`) ||
      executionState.failedStep === `${result.command === "update.repair" ? "repair" : "update"}:${action.affectedPath}` ||
      (!result.data.changedPaths.includes(action.affectedPath) && result.status === "failure")
    )
    .map((action) => `- affectedPath=${action.affectedPath}; action=${action.action}`);
  return pendingActions.length === 0 ? ["- none"] : pendingActions;
}

function formatUpdateOutcomeNextActions(
  result: UpdateCommandResult | RepairCommandResult,
  locale: CliLocale,
  outcome: UpdateHumanOutcome,
): string[] {
  const validateAction = formatCliMessage(locale, "updateActionValidateAfterWrites", {
    command: "speclite validate <target>",
  });
  const statusAction = formatCliMessage(locale, "updateActionStatusAfterWrites", {
    command: "speclite status <target>",
  });
  const blockerActions = [
    ...formatUpdateConflictActions(result, locale),
    ...formatIssueNextActions(result.issues, locale, "speclite validate <target>"),
  ];

  if (outcome === "plan-ready") {
    return [
      ...blockerActions,
      formatCliMessage(locale, "updateActionReviewPlanAuthorize", {
        command: "speclite update <target> --yes",
      }),
      validateAction,
      statusAction,
    ];
  }
  if (outcome === "repair-plan-ready") {
    return [
      ...blockerActions,
      formatCliMessage(locale, "updateActionReviewRepairAuthorize", {
        command: "speclite update --repair <target> --yes",
      }),
      validateAction,
      statusAction,
    ];
  }
  if (outcome === "partial-or-failed") {
    return [
      ...blockerActions,
      getCliMessage(locale, "updateActionInspectCompleted"),
      validateAction,
      statusAction,
    ];
  }
  if (outcome === "applied") {
    return [
      validateAction,
      statusAction,
    ];
  }
  if (outcome === "blocked-by-conflict") {
    return [
      ...blockerActions,
      formatCliMessage(locale, "updateActionReviewPlanAuthorize", {
        command: result.command === "update.repair"
          ? "speclite update --repair <target> --yes"
          : "speclite update <target> --yes",
      }),
      validateAction,
      statusAction,
    ];
  }
  return [validateAction, statusAction];
}

function formatIssueNextActions(issues: ValidationIssue[], locale: CliLocale, command: string): string[] {
  const blocking = issues
    .filter((issue) => issue.severity === "critical" || issue.severity === "error")
    .map((issue) => formatIssueSuggestedNextStep(issue, locale, command));
  const nonBlocking = issues
    .filter((issue) => issue.severity === "warning" || issue.severity === "info")
    .map((issue) => formatIssueSuggestedNextStep(issue, locale, command));
  return dedupeLines([...blocking, ...nonBlocking]);
}

function formatIssueSuggestedNextStep(issue: ValidationIssue, locale: CliLocale, command: string): string {
  if (locale === "en-US") return issue.suggestedNextStep;

  const key =
    issue.severity === "critical" || issue.severity === "error"
      ? "issueActionBlocking"
      : "issueActionNonBlocking";
  return formatCliMessage(locale, key, {
    issueId: issue.issueId,
    affectedPath: getIssueAffectedPath(issue),
    reason: getIssueReasonCode(issue),
    command,
  });
}

function formatUpdateConflictActions(
  result: UpdateCommandResult | RepairCommandResult,
  locale: CliLocale,
): string[] {
  return result.data.conflicts.map((conflict) =>
    formatCliMessage(locale, "updateActionResolveBlocker", {
      affectedPath: conflict.affectedPath,
      reason: conflict.reason,
    })
  );
}

function formatIssue(issue: ValidationIssue, locale: CliLocale = "en-US"): string {
  const location = issue.affectedPath ?? issue.component ?? "unknown";
  const detailText = formatIssueDetails(issue.details, locale);
  const affectedPath = issue.affectedPath === undefined ? "" : ` affectedPath=${issue.affectedPath}`;
  const impact = locale === "zh-CN" ? getCliMessage(locale, "issueImpactSummary") : issue.impact;
  return `[${issue.severity}] severity=${issue.severity} category=${issue.category} issueId=${issue.issueId} location=${location}${affectedPath}${detailText} impact=${impact} suggestedNextStep=${formatIssueSuggestedNextStep(issue, locale, "speclite validate <target>")}`;
}

function getIssueAffectedPath(issue: ValidationIssue): string {
  return issue.affectedPath ?? issue.component ?? "command-level";
}

function getIssueReasonCode(issue: ValidationIssue): string {
  const reason = issue.details?.reason;
  if (typeof reason === "string" && reason.length > 0) return reason;
  const status = issue.details?.status;
  if (typeof status === "string" && status.length > 0) return status;
  return issue.issueId;
}

function formatIssueDetails(details: ValidationIssue["details"], locale: CliLocale = "en-US"): string {
  if (details === undefined) return "";
  const fields = Object.entries(details)
    .filter(([, value]) => value === null || ["string", "number", "boolean"].includes(typeof value))
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${formatIssueDetailValue(locale, key, value)}`);
  return fields.length === 0 ? "" : ` details=${fields.join(";")}`;
}

function formatIssueDetailValue(locale: CliLocale, key: string, value: string | number | boolean | null): string {
  if (locale === "zh-CN" && key === "manualAction") {
    return getCliMessage(locale, "issueManualActionLocalized");
  }
  return String(value);
}

function formatPlanAction(
  action:
    | UpdateCommandResult["data"]["updatePlan"]["actions"][number]
    | RepairCommandResult["data"]["repairPlan"]["actions"][number]
    | SyncCommandResult["data"]["syncPlan"]["actions"][number],
  locale: CliLocale = "en-US",
): string {
  const fields = [
    `affectedPath=${action.affectedPath}`,
    `ownership=${action.ownership}`,
    `action=${action.action}`,
  ];
  if (action.currentHash !== undefined) fields.push(`currentHash=${action.currentHash}`);
  if (action.expectedHash !== undefined) fields.push(`expectedHash=${action.expectedHash}`);
  if (action.reason !== undefined) fields.push(`reason=${action.reason}`);
  fields.push(`nextAction=${getPlanActionNextStep(action.action, action.reason, locale)}`);
  return `- ${fields.join("; ")}`;
}

function getPlanActionNextStep(action: string, reason?: string, locale: CliLocale = "en-US"): string {
  if (action === "restore-canonical" || action === "regenerate") {
    return getCliMessage(locale, "planActionRepair");
  }
  if (action === "create" || action === "update") {
    return getCliMessage(locale, "planActionWrite");
  }
  if (action === "conflict") {
    return getCliMessage(locale, "planActionConflict");
  }
  if (reason === "unchanged") return getCliMessage(locale, "planActionUnchanged");
  return getCliMessage(locale, "planActionReviewReason");
}

function getUpdateAuthorizationState(result: UpdateCommandResult | RepairCommandResult): string {
  if (result.data.conflicts.length > 0) return "blocked-by-conflict";
  if (result.data.writeAuthorized && result.data.changedPaths.length > 0) return "applied";
  if (result.data.writeAuthorized) return "ready-to-apply";
  const actions = result.command === "update.repair" ? result.data.repairPlan.actions : result.data.updatePlan.actions;
  const hasWritePlan = actions.some(
    (action) =>
      action.action === "create" ||
      action.action === "update" ||
      action.action === "restore-canonical" ||
      action.action === "regenerate",
  );
  return hasWritePlan ? "pending-confirmation" : "no-op";
}

function formatList(values: string[]): string {
  return values.length === 0 ? "none" : values.join(", ");
}

function formatSourceDescriptor(sourceDescriptor: InstallCommandResult["data"]["sourceDescriptor"]): string {
  const fields = [
    `sourceType=${sourceDescriptor.sourceType}`,
    sourceDescriptor.channel === undefined ? undefined : `channel=${sourceDescriptor.channel}`,
    sourceDescriptor.requestedVersion === undefined
      ? undefined
      : `requestedVersion=${sourceDescriptor.requestedVersion}`,
    sourceDescriptor.version === undefined ? undefined : `version=${sourceDescriptor.version}`,
    sourceDescriptor.resolvedRoot === undefined
      ? undefined
      : `resolvedRoot=${sourceDescriptor.resolvedRoot}`,
    `trustStatus=${sourceDescriptor.trustStatus}`,
    `evidence=${formatEvidenceSummary(sourceDescriptor.integrityEvidence)}`,
  ].filter((value): value is string => value !== undefined);
  return fields.join("; ");
}

function formatInstallExternalAccess(
  sourceDescriptor: InstallCommandResult["data"]["sourceDescriptor"],
): string[] {
  if (sourceDescriptor.sourceType === "bundled") {
    return ["No external source access requested."];
  }

  const sourceValue =
    sourceDescriptor.resolvedRoot ?? sourceDescriptor.version ?? sourceDescriptor.requestedVersion ?? "redacted-source";
  const confirmationState =
    sourceDescriptor.integrityEvidence.length > 0 ||
    sourceDescriptor.version !== undefined ||
    sourceDescriptor.contentHash !== undefined
      ? "confirmed"
      : "pending";
  return [
    [
      `- sourceType=${sourceDescriptor.sourceType}`,
      `sourceValue=${sourceValue}`,
      `reason=${getInstallExternalAccessReason(sourceDescriptor.sourceType)}`,
      `confirmationState=${confirmationState}`,
    ].join("; "),
  ];
}

function formatInstallExternalAccessZh(
  sourceDescriptor: InstallCommandResult["data"]["sourceDescriptor"],
): string[] {
  if (sourceDescriptor.sourceType === "bundled") {
    return ["未请求外部 source 访问。"];
  }

  const sourceValue =
    sourceDescriptor.resolvedRoot ?? sourceDescriptor.version ?? sourceDescriptor.requestedVersion ?? "redacted-source";
  const confirmationState =
    sourceDescriptor.integrityEvidence.length > 0 ||
    sourceDescriptor.version !== undefined ||
    sourceDescriptor.contentHash !== undefined
      ? "confirmed"
      : "pending";
  return [
    [
      `- sourceType=${sourceDescriptor.sourceType}`,
      `sourceValue=${sourceValue}`,
      `reason=${getInstallExternalAccessReasonZh(sourceDescriptor.sourceType)}`,
      `confirmationState=${confirmationState}`,
    ].join("; "),
  ];
}

function getInstallExternalAccessReason(sourceType: string): string {
  if (sourceType === "npm") return "Resolve npm package metadata before selecting an installable SpecLite source.";
  if (sourceType === "private-registry") {
    return "Resolve private registry package metadata before selecting an installable SpecLite source.";
  }
  if (sourceType === "local-tarball") return "Read local tarball metadata before selecting an installable SpecLite source.";
  if (sourceType === "offline-bundle") return "Read offline bundle metadata before selecting an installable SpecLite source.";
  if (sourceType === "git") return "Resolve Git source metadata before selecting an installable SpecLite source.";
  if (sourceType === "local") return "Read local source metadata before selecting an installable SpecLite source.";
  return "Review source access intent before enabling source resolution.";
}

function getInstallExternalAccessReasonZh(sourceType: string): string {
  if (sourceType === "npm") return "解析 npm package metadata 后再选择可安装的 SpecLite source。";
  if (sourceType === "private-registry") {
    return "解析 private registry package metadata 后再选择可安装的 SpecLite source。";
  }
  if (sourceType === "local-tarball") return "读取 local tarball metadata 后再选择可安装的 SpecLite source。";
  if (sourceType === "offline-bundle") return "读取 offline bundle metadata 后再选择可安装的 SpecLite source。";
  if (sourceType === "git") return "解析 Git source metadata 后再选择可安装的 SpecLite source。";
  if (sourceType === "local") return "读取 local source metadata 后再选择可安装的 SpecLite source。";
  return "启用 source resolution 前先检查 source access 意图。";
}

function formatOptionalSourceDescriptor(sourceDescriptor: StatusCommandResult["data"]["sourceDescriptor"]): string {
  if (sourceDescriptor === undefined) return "not-available";
  return formatSourceDescriptor(sourceDescriptor);
}

function formatEvidenceSummary(
  evidence: InstallCommandResult["data"]["sourceDescriptor"]["integrityEvidence"],
): string {
  if (evidence.length === 0) return "none";
  return evidence
    .map((entry) => `${entry.kind}:${entry.verified ? "verified" : "unverified"}`)
    .join(",");
}
