export const ISSUE_CATEGORIES = [
  "environment",
  "manifest-schema",
  "source-integrity",
  "ide-mirror",
  "runtime-path",
  "menu-target",
  "legacy-namespace",
  "artifact-path",
  "file-integrity",
  "operation-lock",
  "update",
] as const;

export type IssueCategory = (typeof ISSUE_CATEGORIES)[number];

export const ISSUE_SEVERITIES = ["info", "warning", "error", "critical"] as const;

export type IssueSeverity = (typeof ISSUE_SEVERITIES)[number];

export const ISSUE_SEVERITY_SORT_ORDER: Record<IssueSeverity, number> = {
  critical: 0,
  error: 1,
  warning: 2,
  info: 3,
};

export const ISSUE_CATEGORY_SORT_ORDER: Record<IssueCategory, number> =
  Object.fromEntries(ISSUE_CATEGORIES.map((category, index) => [category, index])) as Record<
    IssueCategory,
    number
  >;

export const ENVIRONMENT_ISSUE_IDS = {
  unsupportedNode: "environment.unsupported-node",
  unsupportedPlatform: "environment.unsupported-platform",
} as const;

