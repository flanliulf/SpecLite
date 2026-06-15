import os from "node:os";
import process from "node:process";
import { isProjectRelativePosixPath } from "../manifest/manifest-schema.js";

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

export const UPDATE_REASON_CODES = [
  "unchanged",
  "installer-owned-drift",
  "human-owned",
  "workflow-owned",
  "unknown-ownership",
  "missing-source-evidence",
  "unsupported-repair",
  "not-authorized",
] as const;

export type UpdateReasonCode = (typeof UPDATE_REASON_CODES)[number];

export function isValidationIssueAffectedPath(value: string): boolean {
  return (value === "." || isProjectRelativePosixPath(value)) && findUnsafeIssueValue(value) === undefined;
}

export function findUnsafeIssueValue(value: unknown): string | undefined {
  if (value === undefined) return undefined;
  return findUnsafeIssueValueAt(value, "value");
}

function findUnsafeIssueValueAt(value: unknown, path: string): string | undefined {
  if (typeof value === "string") {
    return isUnsafeIssueString(value) ? path : undefined;
  }

  if (
    value === null ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return undefined;
  }

  if (Array.isArray(value)) {
    for (const [index, item] of value.entries()) {
      const unsafe = findUnsafeIssueValueAt(item, `${path}.${index}`);
      if (unsafe !== undefined) return unsafe;
    }
    return undefined;
  }

  if (typeof value === "object") {
    if (value instanceof Date) return path;
    for (const [key, item] of Object.entries(value)) {
      const unsafe = findUnsafeIssueValueAt(item, `${path}.${key}`);
      if (unsafe !== undefined) return unsafe;
    }
    return undefined;
  }

  return path;
}

function isUnsafeIssueString(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.length === 0) return false;

  if (hasAbsoluteOrHomePath(trimmed)) return true;
  if (hasCredentialBearingUrl(trimmed)) return true;
  if (hasStackTraceShape(trimmed)) return true;
  if (hasTimestampShape(trimmed)) return true;
  if (hasHashValueShape(trimmed)) return true;
  if (hasTemporaryOrCachePathShape(trimmed)) return true;
  if (matchesSensitiveEnvironmentValue(trimmed)) return true;

  return false;
}

function hasAbsoluteOrHomePath(value: string): boolean {
  const homeDirectory = os.homedir();
  if (homeDirectory.length > 1 && value.includes(homeDirectory)) return true;

  return (
    /(^|[\s"'=])~[\\/]/.test(value) ||
    /(^|[\s"'=])[A-Za-z]:[\\/]/.test(value) ||
    /(^|[\s"'=])\/(?!\/)[^\s"'{}[\],]+/.test(value)
  );
}

function hasCredentialBearingUrl(value: string): boolean {
  return (
    /[A-Za-z][A-Za-z0-9+.-]*:\/\/[^/\s]*@/.test(value) ||
    /[?&](?:token|secret|password|credential|auth|key)=/i.test(value)
  );
}

function hasStackTraceShape(value: string): boolean {
  return /\bat\s+.+:\d+:\d+\b/.test(value) || /\b(?:Error|Exception):\s+.+\n\s+at\s+/.test(value);
}

function hasTimestampShape(value: string): boolean {
  return /\b\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z\b/.test(value);
}

function hasHashValueShape(value: string): boolean {
  return /\bsha256:[a-f0-9]{32,}\b/i.test(value) || /\b[a-f0-9]{40,}\b/i.test(value);
}

function hasTemporaryOrCachePathShape(value: string): boolean {
  if (["cache", "temporary", "dependency", "build-output"].includes(value)) {
    return false;
  }
  return /(^|[\\/])(?:tmp|temp|cache|\.cache|node_modules|\.npm)([\\/]|$)/i.test(value);
}

function matchesSensitiveEnvironmentValue(value: string): boolean {
  for (const [key, envValue] of Object.entries(process.env)) {
    if (envValue === undefined || envValue.length < 8) continue;
    if (!/(TOKEN|SECRET|PASSWORD|CREDENTIAL|AUTH|KEY)/i.test(key)) continue;
    if (value === envValue || value.includes(envValue)) return true;
  }
  return false;
}
