import type {
  CommandPathSummary,
  IdeTargetStatus,
  InstallCommandData,
  InstallCommandResult,
  ValidationIssue,
} from "./command-result-schema.js";
import { COMMAND_RESULT_SCHEMA_VERSION } from "./command-result-schema.js";
import {
  PREWRITE_BUNDLED_SOURCE_DESCRIPTOR,
  type SourceDescriptor,
} from "../source/source-descriptor-schema.js";
import {
  ISSUE_CATEGORY_SORT_ORDER,
  ISSUE_SEVERITY_SORT_ORDER,
  type IssueCategory,
  type IssueSeverity,
} from "../validation/issue-model.js";
import { INSTALL_LIFECYCLE_STEP_IDS, projectInstallLifecycleState } from "../installer/progress-events.js";

export const INSTALL_LIFECYCLE_STEPS = [
  ...INSTALL_LIFECYCLE_STEP_IDS,
] as const;

export const DEFAULT_INSTALL_MANIFEST_VERSION = "speclite.manifest.v1" as const;

export function createPrewriteInstallData(input: {
  sourceDescriptor?: SourceDescriptor;
  completedSteps: string[];
  pendingSteps: string[];
  manifestVersion?: string;
  installedModules?: string[];
  ideTargets?: IdeTargetStatus[];
  paths?: CommandPathSummary;
}): InstallCommandData {
  const lifecycleState = projectInstallLifecycleState({
    completedSteps: input.completedSteps,
  });

  return {
    sourceDescriptor: input.sourceDescriptor ?? PREWRITE_BUNDLED_SOURCE_DESCRIPTOR,
    manifestVersion: input.manifestVersion ?? DEFAULT_INSTALL_MANIFEST_VERSION,
    installedModules: input.installedModules ?? [],
    ideTargets: input.ideTargets ?? [],
    paths: input.paths ?? {
      projectRoot: ".",
    },
    completedSteps: lifecycleState.completedSteps,
    pendingSteps: lifecycleState.pendingSteps,
  };
}

export function createInstallFailureResult(input: {
  targetProject: string;
  issues: ValidationIssue[];
  completedSteps: string[];
  pendingSteps: string[];
  nextActions: string[];
  summary?: string;
  data?: Partial<
    Pick<
      InstallCommandData,
      "manifestVersion" | "installedModules" | "ideTargets" | "paths"
      | "sourceDescriptor"
    >
  >;
}): InstallCommandResult {
  const issues = sortValidationIssues(input.issues);

  return {
    schemaVersion: COMMAND_RESULT_SCHEMA_VERSION,
    status: "failure",
    command: "install",
    targetProject: input.targetProject,
    summary:
      input.summary ??
      "SpecLite install preflight failed before any project files were changed.",
    issues,
    nextActions: input.nextActions,
    data: createPrewriteInstallData({
      completedSteps: input.completedSteps,
      pendingSteps: input.pendingSteps,
      ...input.data,
    }),
  };
}

export function createInstallSuccessResult(input: {
  targetProject: string;
  completedSteps: string[];
  pendingSteps: string[];
  summary?: string;
  nextActions?: string[];
  data?: Partial<
    Pick<
      InstallCommandData,
      "manifestVersion" | "installedModules" | "ideTargets" | "paths"
      | "sourceDescriptor"
    >
  >;
}): InstallCommandResult {
  return {
    schemaVersion: COMMAND_RESULT_SCHEMA_VERSION,
    status: "success",
    command: "install",
    targetProject: input.targetProject,
    summary:
      input.summary ?? "SpecLite install preflight completed; later install stages are pending.",
    issues: [],
    nextActions: input.nextActions ?? ["Continue with the next install planning stage."],
    data: createPrewriteInstallData({
      completedSteps: input.completedSteps,
      pendingSteps: input.pendingSteps,
      ...input.data,
    }),
  };
}

export function sortValidationIssues(issues: ValidationIssue[]): ValidationIssue[] {
  return [...issues].sort((left, right) => {
    const severityDiff =
      ISSUE_SEVERITY_SORT_ORDER[left.severity as IssueSeverity] -
      ISSUE_SEVERITY_SORT_ORDER[right.severity as IssueSeverity];
    if (severityDiff !== 0) return severityDiff;

    const categoryDiff =
      ISSUE_CATEGORY_SORT_ORDER[left.category as IssueCategory] -
      ISSUE_CATEGORY_SORT_ORDER[right.category as IssueCategory];
    if (categoryDiff !== 0) return categoryDiff;

    const pathDiff = (left.affectedPath ?? "").localeCompare(right.affectedPath ?? "");
    if (pathDiff !== 0) return pathDiff;

    return left.issueId.localeCompare(right.issueId);
  });
}
