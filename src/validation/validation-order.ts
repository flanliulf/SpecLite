import type { ValidateCommandData, ValidationIssue } from "../diagnostics/command-result-schema.js";
import { CANONICAL_TARGET_ORDER, type IdeTargetId } from "../ide/adapter-registry.js";
import { normalizeProjectRelativePosixPath } from "../fs/path-normalizer.js";
import {
  ISSUE_CATEGORIES,
  ISSUE_CATEGORY_SORT_ORDER,
  ISSUE_SEVERITY_SORT_ORDER,
  isValidationIssueAffectedPath,
  type IssueCategory,
  type IssueSeverity,
} from "./issue-model.js";

const COMMAND_LEVEL_PATH_SORT_KEY = "\u0000command";

export const CANONICAL_ISSUE_CATEGORY_ORDER = ISSUE_CATEGORIES;

export function sortIssueCategories(categories: Iterable<IssueCategory>): IssueCategory[] {
  const categorySet = new Set(categories);
  return CANONICAL_ISSUE_CATEGORY_ORDER.filter((category) => categorySet.has(category));
}

export function sortCheckedTargets(targets: Iterable<IdeTargetId>): IdeTargetId[] {
  const targetSet = new Set(targets);
  return CANONICAL_TARGET_ORDER.filter((targetId) => targetSet.has(targetId));
}

export function sortValidatedPaths(paths: Iterable<string>): string[] {
  const normalized = new Set<string>();
  for (const candidate of paths) {
    normalized.add(normalizeProjectRelativePosixPath(candidate));
  }
  return [...normalized].sort(compareLexicographic);
}

export function createZeroIssueCounts(): ValidateCommandData["issueCounts"] {
  return {
    info: 0,
    warning: 0,
    error: 0,
    critical: 0,
  };
}

export function sortValidationIssues(issues: ValidationIssue[]): ValidationIssue[] {
  return issues.map((issue) => ({ issue, pathSortKey: issuePathSortKey(issue) })).sort((left, right) => {
    const severityDiff =
      ISSUE_SEVERITY_SORT_ORDER[left.issue.severity as IssueSeverity] -
      ISSUE_SEVERITY_SORT_ORDER[right.issue.severity as IssueSeverity];
    if (severityDiff !== 0) return severityDiff;

    const categoryDiff =
      ISSUE_CATEGORY_SORT_ORDER[left.issue.category as IssueCategory] -
      ISSUE_CATEGORY_SORT_ORDER[right.issue.category as IssueCategory];
    if (categoryDiff !== 0) return categoryDiff;

    return (
      compareLexicographic(left.pathSortKey, right.pathSortKey) ||
      compareLexicographic(left.issue.issueId, right.issue.issueId) ||
      compareLexicographic(left.issue.component ?? "", right.issue.component ?? "")
    );
  }).map((entry) => entry.issue);
}

function issuePathSortKey(issue: ValidationIssue): string {
  if (issue.affectedPath === undefined) return COMMAND_LEVEL_PATH_SORT_KEY;
  if (!isValidationIssueAffectedPath(issue.affectedPath)) {
    throw new TypeError("ValidationIssue affectedPath must be project-relative POSIX or .");
  }
  if (issue.affectedPath === ".") return issue.affectedPath;
  return normalizeProjectRelativePosixPath(issue.affectedPath);
}

function compareLexicographic(left: string, right: string): number {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}
