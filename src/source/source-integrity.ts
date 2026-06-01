import type { ValidationIssue } from "../diagnostics/command-result-schema.js";
import type { SourceDescriptor, SourceType } from "./source-descriptor-schema.js";

export type RegistryKind = "public" | "private";
export type LocalBlockedRootKind =
  | "installed-state"
  | "execution-plane"
  | "workflow-output"
  | "dependency"
  | "cache"
  | "temporary"
  | "build-output";
export type GitRequestedRefKind = "missing" | "commit" | "branch" | "tag" | "full-ref" | "symbolic";

export function createRegistrySourceIntegrityIssue(input: {
  issueId:
    | "source-integrity.authentication-required"
    | "source-integrity.hash-mismatch"
    | "source-integrity.lock-mismatch"
    | "source-integrity.missing-evidence"
    | "source-integrity.registry-unreachable"
    | "source-integrity.unsupported-source";
  reason: string;
  sourceType: SourceType;
  registryKind?: RegistryKind | undefined;
  packageName?: string | undefined;
  requestedVersion?: string | undefined;
  channel?: string | undefined;
  component?: string | undefined;
}): ValidationIssue {
  const details: Record<string, string> = {
    reason: input.reason,
    sourceType: input.sourceType,
  };
  if (input.packageName !== undefined) details.packageName = input.packageName;
  if (input.requestedVersion !== undefined) details.requestedVersion = input.requestedVersion;
  if (input.channel !== undefined) details.channel = input.channel;
  if (input.registryKind !== undefined) details.registryKind = input.registryKind;

  return {
    issueId: input.issueId,
    category: "source-integrity",
    severity: "error",
    component: input.component ?? "registry-source-resolution",
    details,
    impact: getRegistryIssueImpact(input.issueId),
    suggestedNextStep: getRegistryIssueNextStep(input.issueId),
  };
}

export function createBlockedRegistryDescriptor(input: {
  sourceType: SourceType;
  requestedSourceValue: string;
  requestedVersion?: string | undefined;
  channel?: string | undefined;
  version?: string | undefined;
  integrityEvidence?: SourceDescriptor["integrityEvidence"] | undefined;
}): SourceDescriptor {
  return {
    sourceType: input.sourceType,
    ...(input.channel === undefined ? {} : { channel: input.channel }),
    ...(input.requestedVersion === undefined ? {} : { requestedVersion: input.requestedVersion }),
    ...(input.version === undefined ? {} : { version: input.version }),
    resolvedRoot: input.requestedSourceValue,
    integrityEvidence: input.integrityEvidence ?? [],
    trustStatus: "blocked",
  };
}

export function createLocalSourceIntegrityIssue(input: {
  issueId:
    | "source-integrity.hash-mismatch"
    | "source-integrity.local-source-self-reference"
    | "source-integrity.missing-evidence"
    | "source-integrity.offline-bundle-unreadable"
    | "source-integrity.tarball-unreadable"
    | "source-integrity.unsupported-source";
  reason: string;
  sourceType: SourceType;
  blockedRootKind?: LocalBlockedRootKind | undefined;
  component?: string | undefined;
}): ValidationIssue {
  const details: Record<string, string> = {
    reason: input.reason,
    sourceType: input.sourceType,
  };
  if (input.blockedRootKind !== undefined) details.blockedRootKind = input.blockedRootKind;

  return {
    issueId: input.issueId,
    category: "source-integrity",
    severity: "error",
    component: input.component ?? "local-source-resolution",
    details,
    impact: getLocalIssueImpact(input.issueId),
    suggestedNextStep: getLocalIssueNextStep(input.issueId),
  };
}

export function createBlockedLocalDescriptor(input: {
  sourceType: SourceType;
  requestedSourceValue: string;
  requestedVersion?: string | undefined;
  channel?: string | undefined;
  contentHash?: string | undefined;
  integrityEvidence?: SourceDescriptor["integrityEvidence"] | undefined;
}): SourceDescriptor {
  return {
    sourceType: input.sourceType,
    ...(input.channel === undefined ? {} : { channel: input.channel }),
    ...(input.requestedVersion === undefined ? {} : { requestedVersion: input.requestedVersion }),
    resolvedRoot: input.requestedSourceValue,
    ...(input.contentHash === undefined ? {} : { contentHash: input.contentHash }),
    integrityEvidence: input.integrityEvidence ?? [],
    trustStatus: "blocked",
  };
}

export function createGitSourceIntegrityIssue(input: {
  issueId:
    | "source-integrity.authentication-required"
    | "source-integrity.floating-git-source"
    | "source-integrity.hash-mismatch"
    | "source-integrity.lock-mismatch"
    | "source-integrity.missing-evidence"
    | "source-integrity.unsupported-source";
  reason: string;
  requestedRefKind: GitRequestedRefKind;
  component?: string | undefined;
  hasResolvedCommit?: boolean | undefined;
}): ValidationIssue {
  return {
    issueId: input.issueId,
    category: "source-integrity",
    severity: "error",
    component: input.component ?? "git-source-resolution",
    details: {
      reason: input.reason,
      sourceType: "git",
      requestedRefKind: input.requestedRefKind,
      remoteKind: "redacted-git-remote",
      hasResolvedCommit: input.hasResolvedCommit ?? false,
    },
    impact: getGitIssueImpact(input.issueId),
    suggestedNextStep: getGitIssueNextStep(input.issueId),
  };
}

export function createBlockedGitDescriptor(input: {
  requestedVersion?: string | undefined;
  version?: string | undefined;
  integrityEvidence?: SourceDescriptor["integrityEvidence"] | undefined;
}): SourceDescriptor {
  return {
    sourceType: "git",
    ...(input.requestedVersion === undefined ? {} : { requestedVersion: input.requestedVersion }),
    ...(input.version === undefined ? {} : { version: input.version }),
    resolvedRoot: "redacted-git-remote",
    integrityEvidence: input.integrityEvidence ?? [],
    trustStatus: "blocked",
  };
}

function getRegistryIssueImpact(issueId: string): string {
  switch (issueId) {
    case "source-integrity.authentication-required":
      return "Registry source resolution cannot continue without valid access to the selected registry.";
    case "source-integrity.hash-mismatch":
      return "Resolved registry metadata does not match the expected hash trust anchor.";
    case "source-integrity.lock-mismatch":
      return "Resolved registry metadata does not match the expected version lock trust anchor.";
    case "source-integrity.missing-evidence":
      return "Resolved registry metadata does not include reproducible integrity evidence.";
    case "source-integrity.registry-unreachable":
      return "Registry source resolution could not read metadata from the selected registry.";
    case "source-integrity.unsupported-source":
      return "The selected registry source cannot be resolved by the current MVP resolver.";
    default:
      return "Registry source resolution stopped before any project files were changed.";
  }
}

function getRegistryIssueNextStep(issueId: string): string {
  switch (issueId) {
    case "source-integrity.authentication-required":
      return "Confirm registry credentials outside public output and rerun source resolution.";
    case "source-integrity.hash-mismatch":
      return "Check the expected hash input before authorizing install writes.";
    case "source-integrity.lock-mismatch":
      return "Check the expected lock input before authorizing install writes.";
    case "source-integrity.missing-evidence":
      return "Use registry metadata with integrity evidence or provide an expected lock match.";
    case "source-integrity.registry-unreachable":
      return "Check registry reachability outside public output and rerun source resolution.";
    case "source-integrity.unsupported-source":
      return "Choose a supported package selector or wait for the later source-specific resolver story.";
    default:
      return "Review the source-integrity issue before continuing.";
  }
}

function getLocalIssueImpact(issueId: string): string {
  switch (issueId) {
    case "source-integrity.hash-mismatch":
      return "Local source integrity evidence does not match the expected hash trust anchor.";
    case "source-integrity.local-source-self-reference":
      return "The selected local source points at installed state, workflow output, dependency, cache, temporary or build output.";
    case "source-integrity.missing-evidence":
      return "Local source resolution did not produce reproducible integrity evidence.";
    case "source-integrity.offline-bundle-unreadable":
      return "Offline bundle source resolution could not read the selected bundle artifact.";
    case "source-integrity.tarball-unreadable":
      return "Local tarball source resolution could not read the selected tarball artifact.";
    case "source-integrity.unsupported-source":
      return "The selected local source shape is not supported by the current MVP resolver.";
    default:
      return "Local source resolution stopped before any project files were changed.";
  }
}

function getLocalIssueNextStep(issueId: string): string {
  switch (issueId) {
    case "source-integrity.hash-mismatch":
      return "Check the expected local source hash before authorizing install writes.";
    case "source-integrity.local-source-self-reference":
      return "Choose a canonical source tree outside installed state, workflow output, dependency, cache, temporary or build output.";
    case "source-integrity.missing-evidence":
      return "Use a readable local artifact or source tree with canonical source files.";
    case "source-integrity.offline-bundle-unreadable":
      return "Check the offline bundle artifact outside public output and rerun source resolution.";
    case "source-integrity.tarball-unreadable":
      return "Check the local tarball artifact outside public output and rerun source resolution.";
    case "source-integrity.unsupported-source":
      return "Choose a supported local tarball, offline bundle or canonical local source tree.";
    default:
      return "Review the source-integrity issue before continuing.";
  }
}

function getGitIssueImpact(issueId: string): string {
  switch (issueId) {
    case "source-integrity.authentication-required":
      return "Git source resolution cannot continue without valid access to the selected remote.";
    case "source-integrity.floating-git-source":
      return "Git source resolution did not produce a concrete commit SHA before install planning.";
    case "source-integrity.hash-mismatch":
      return "Resolved Git commit evidence does not match the expected hash trust anchor.";
    case "source-integrity.lock-mismatch":
      return "Resolved Git commit evidence does not match the expected source lock trust anchor.";
    case "source-integrity.unsupported-source":
      return "The selected Git source cannot be resolved by the current MVP resolver.";
    default:
      return "Git source resolution stopped before any project files were changed.";
  }
}

function getGitIssueNextStep(issueId: string): string {
  switch (issueId) {
    case "source-integrity.authentication-required":
      return "Confirm Git credentials outside public output and rerun source resolution.";
    case "source-integrity.floating-git-source":
      return "Provide a Git ref that resolves to a concrete commit SHA before authorizing install writes.";
    case "source-integrity.hash-mismatch":
      return "Check the expected Git commit hash before authorizing install writes.";
    case "source-integrity.lock-mismatch":
      return "Check the expected Git source lock before authorizing install writes.";
    case "source-integrity.unsupported-source":
      return "Choose a supported Git remote and ref selector before rerunning source resolution.";
    default:
      return "Review the source-integrity issue before continuing.";
  }
}
