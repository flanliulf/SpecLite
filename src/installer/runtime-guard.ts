import type { ValidationIssue } from "../diagnostics/command-result-schema.js";
import { ENVIRONMENT_ISSUE_IDS } from "../validation/issue-model.js";
import { INSTALL_LIFECYCLE_STEP_IDS } from "./progress-events.js";

export const REQUIRED_NODE_RANGE = ">=22" as const;

export const SUPPORTED_PLATFORM_LABELS = ["macos-13-or-newer", "windows-11"] as const;

export type RuntimeFacts = {
  nodeVersion: string;
  platform: NodeJS.Platform | string;
  platformRelease: string;
};

export type RuntimeGuardResult =
  | {
      ok: true;
      completedSteps: string[];
    }
  | {
      ok: false;
      issue: ValidationIssue;
      completedSteps: string[];
      pendingSteps: string[];
      nextActions: string[];
    };

export function evaluateRuntimeGuard(facts: RuntimeFacts): RuntimeGuardResult {
  if (!isNodeVersionSupported(facts.nodeVersion)) {
    return {
      ok: false,
      issue: createUnsupportedNodeIssue(facts.nodeVersion),
      completedSteps: [],
      pendingSteps: [...INSTALL_LIFECYCLE_STEP_IDS],
      nextActions: [
        "Install and run SpecLite with Node.js 22 or newer.",
        "After switching Node.js versions, rerun speclite install.",
      ],
    };
  }

  if (!isPlatformSupported(facts.platform, facts.platformRelease)) {
    return {
      ok: false,
      issue: createUnsupportedPlatformIssue(facts.platform),
      completedSteps: [],
      pendingSteps: [...INSTALL_LIFECYCLE_STEP_IDS],
      nextActions: [
        "Use macOS 13 or newer, or Windows 11, for the MVP install path.",
        "If this platform should be supported, track it as a future platform policy change.",
      ],
    };
  }

  return {
    ok: true,
    completedSteps: [],
  };
}

export function isNodeVersionSupported(version: string): boolean {
  const major = parseNodeMajorVersion(version);
  return major !== undefined && major >= 22;
}

export function isPlatformSupported(platform: string, platformRelease: string): boolean {
  if (platform === "darwin") {
    const darwinMajor = parseLeadingInteger(platformRelease);
    return darwinMajor !== undefined && darwinMajor >= 22;
  }

  if (platform === "win32") {
    const [, , build] = platformRelease.split(".").map((part) => Number.parseInt(part, 10));
    return typeof build === "number" && Number.isFinite(build) && build >= 22000;
  }

  return false;
}

function createUnsupportedNodeIssue(detectedVersion: string): ValidationIssue {
  return {
    issueId: ENVIRONMENT_ISSUE_IDS.unsupportedNode,
    category: "environment",
    severity: "error",
    component: "runtime-guard",
    details: {
      detectedVersion,
      requiredRange: REQUIRED_NODE_RANGE,
    },
    impact: "SpecLite cannot start the install flow on this Node.js runtime.",
    suggestedNextStep: "Switch to Node.js 22 or newer and rerun the command.",
  };
}

function createUnsupportedPlatformIssue(detectedPlatform: string): ValidationIssue {
  return {
    issueId: ENVIRONMENT_ISSUE_IDS.unsupportedPlatform,
    category: "environment",
    severity: "error",
    component: "runtime-guard",
    details: {
      detectedPlatform,
      supportedPlatforms: [...SUPPORTED_PLATFORM_LABELS],
    },
    impact: "SpecLite cannot use the MVP install path on this platform.",
    suggestedNextStep: "Run the install on macOS 13 or newer, or on Windows 11.",
  };
}

function parseNodeMajorVersion(version: string): number | undefined {
  const normalized = version.trim().replace(/^v/, "");
  return parseLeadingInteger(normalized);
}

function parseLeadingInteger(value: string): number | undefined {
  const [major] = value.split(".");
  if (major === undefined || major.length === 0) {
    return undefined;
  }

  const parsed = Number.parseInt(major, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}
