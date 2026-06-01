import type { ValidationIssue } from "../../diagnostics/command-result-schema.js";
import type { Manifest } from "../../manifest/manifest-schema.js";
import { FULL_GIT_COMMIT_SHA_PATTERN } from "../../source/source-descriptor-schema.js";
import {
  createGitSourceIntegrityIssue,
  createLocalSourceIntegrityIssue,
  createRegistrySourceIntegrityIssue,
} from "../../source/source-integrity.js";

const MANIFEST_PATH = "_speclite/_config/manifest.yaml" as const;

export function validateSourceIntegrity(input: {
  manifest: Manifest;
}): {
  issues: ValidationIssue[];
  validatedPaths: string[];
} {
  const descriptor = input.manifest.sourceDescriptor;
  if (descriptor.sourceType === "bundled") {
    if (descriptor.integrityEvidence.length === 0) {
      return {
        issues: [createBundledInstalledSourceIntegrityIssue({
          reason: "missing-bundled-packaging-evidence",
        })],
        validatedPaths: [MANIFEST_PATH],
      };
    }

    if (descriptor.trustStatus === "blocked") {
      return {
        issues: [createBundledInstalledSourceIntegrityIssue({
          reason: "installed-bundled-source-blocked",
        })],
        validatedPaths: [MANIFEST_PATH],
      };
    }

    if (
      descriptor.trustStatus === "trusted" &&
      !descriptor.integrityEvidence.some((evidence) => evidence.verified)
    ) {
      return {
        issues: [createBundledInstalledSourceIntegrityIssue({
          reason: "trusted-bundled-source-without-verified-evidence",
        })],
        validatedPaths: [MANIFEST_PATH],
      };
    }

    return {
      issues: [],
      validatedPaths: [MANIFEST_PATH],
    };
  }

  if (isLocalIntegritySource(descriptor.sourceType)) {
    const contentHashEvidence = descriptor.integrityEvidence.filter(
      (evidence) => evidence.kind === "content-hash",
    );
    if (descriptor.contentHash === undefined || contentHashEvidence.length === 0) {
      return {
        issues: [createLocalInstalledSourceIntegrityIssue({
          reason: "missing-local-content-hash-evidence",
          descriptor,
        })],
        validatedPaths: [MANIFEST_PATH],
      };
    }

    if (!contentHashEvidence.some((evidence) => evidence.value === descriptor.contentHash)) {
      return {
        issues: [createLocalInstalledSourceIntegrityIssue({
          issueId: "source-integrity.hash-mismatch",
          reason: "local-content-hash-evidence-mismatch",
          descriptor,
        })],
        validatedPaths: [MANIFEST_PATH],
      };
    }

    if (descriptor.trustStatus === "blocked") {
      return {
        issues: [createLocalInstalledSourceIntegrityIssue({
          issueId: "source-integrity.unsupported-source",
          reason: "installed-local-source-blocked",
          descriptor,
        })],
        validatedPaths: [MANIFEST_PATH],
      };
    }

    if (descriptor.trustStatus === "trusted" && !contentHashEvidence.some((evidence) => evidence.verified)) {
      return {
        issues: [createLocalInstalledSourceIntegrityIssue({
          reason: "trusted-local-source-without-verified-evidence",
          descriptor,
        })],
        validatedPaths: [MANIFEST_PATH],
      };
    }

    return {
      issues: [],
      validatedPaths: [MANIFEST_PATH],
    };
  }

  if (descriptor.sourceType === "git") {
    const gitCommitEvidence = descriptor.integrityEvidence.filter(
      (evidence) => evidence.kind === "git-commit",
    );
    const hasInvalidGitCommitShape =
      (descriptor.version !== undefined && !isFullGitCommitSha(descriptor.version)) ||
      gitCommitEvidence.some((evidence) => !isFullGitCommitSha(evidence.commitSha));
    if (hasInvalidGitCommitShape) {
      return {
        issues: [createInstalledGitSourceIntegrityIssue({
          issueId: "source-integrity.floating-git-source",
          reason: "invalid-git-commit-evidence-shape",
          descriptor,
        })],
        validatedPaths: [MANIFEST_PATH],
      };
    }

    if (
      descriptor.version === undefined ||
      gitCommitEvidence.length === 0 ||
      !gitCommitEvidence.some(
        (evidence) => evidence.commitSha.toLowerCase() === descriptor.version?.toLowerCase(),
      )
    ) {
      return {
        issues: [createInstalledGitSourceIntegrityIssue({
          issueId: "source-integrity.floating-git-source",
          reason: "missing-git-commit-evidence",
          descriptor,
        })],
        validatedPaths: [MANIFEST_PATH],
      };
    }

    if (descriptor.trustStatus === "blocked") {
      return {
        issues: [createInstalledGitSourceIntegrityIssue({
          issueId: "source-integrity.unsupported-source",
          reason: "installed-git-source-blocked",
          descriptor,
          hasResolvedCommit: true,
        })],
        validatedPaths: [MANIFEST_PATH],
      };
    }

    if (descriptor.trustStatus === "trusted" && !gitCommitEvidence.some((evidence) => evidence.verified)) {
      return {
        issues: [createInstalledGitSourceIntegrityIssue({
          issueId: "source-integrity.missing-evidence",
          reason: "trusted-git-source-without-verified-evidence",
          descriptor,
          hasResolvedCommit: true,
        })],
        validatedPaths: [MANIFEST_PATH],
      };
    }

    return {
      issues: [],
      validatedPaths: [MANIFEST_PATH],
    };
  }

  if (descriptor.sourceType !== "npm" && descriptor.sourceType !== "private-registry") {
    return {
      issues: [],
      validatedPaths: [],
    };
  }

  const registryEvidence = descriptor.integrityEvidence.filter(
    (evidence) =>
      evidence.kind === "registry-integrity" || evidence.kind === "version-lock",
  );
  if (registryEvidence.length === 0) {
    return {
      issues: [createSourceIntegrityIssue({
        reason: "missing-registry-evidence",
        descriptor,
      })],
      validatedPaths: [MANIFEST_PATH],
    };
  }

  if (descriptor.trustStatus === "blocked") {
    return {
      issues: [createSourceIntegrityIssue({
        issueId: "source-integrity.unsupported-source",
        reason: "installed-registry-source-blocked",
        descriptor,
      })],
      validatedPaths: [MANIFEST_PATH],
    };
  }

  if (descriptor.trustStatus === "trusted" && !registryEvidence.some((evidence) => evidence.verified)) {
    return {
      issues: [createSourceIntegrityIssue({
        reason: "trusted-registry-source-without-verified-evidence",
        descriptor,
      })],
      validatedPaths: [MANIFEST_PATH],
    };
  }

  if (
    descriptor.trustStatus === "unverified" &&
    registryEvidence.some((evidence) => evidence.kind === "version-lock" && !evidence.verified)
  ) {
    return {
      issues: [createSourceIntegrityIssue({
        issueId: "source-integrity.lock-mismatch",
        reason: "unverified-registry-source-with-failed-lock-evidence",
        descriptor,
      })],
      validatedPaths: [MANIFEST_PATH],
    };
  }

  return {
    issues: [],
    validatedPaths: [MANIFEST_PATH],
  };
}

function createBundledInstalledSourceIntegrityIssue(input: {
  reason: string;
}): ValidationIssue {
  return {
    issueId: "source-integrity.missing-evidence",
    category: "source-integrity",
    severity: "error",
    affectedPath: MANIFEST_PATH,
    component: "validate-source-integrity",
    details: {
      reason: input.reason,
      sourceType: "bundled",
    },
    impact: "Bundled installed source descriptor does not include verified packaging evidence.",
    suggestedNextStep: "Restore package-lock packaging evidence or reinstall from a valid bundled source.",
  };
}

function createInstalledGitSourceIntegrityIssue(input: {
  issueId:
    | "source-integrity.floating-git-source"
    | "source-integrity.missing-evidence"
    | "source-integrity.unsupported-source";
  reason: string;
  descriptor: Manifest["sourceDescriptor"];
  hasResolvedCommit?: boolean | undefined;
}): ValidationIssue {
  return {
    ...createGitSourceIntegrityIssue({
      issueId: input.issueId,
      reason: input.reason,
      requestedRefKind: classifyInstalledGitRequestedRef(input.descriptor.requestedVersion),
      component: "validate-source-integrity",
      hasResolvedCommit: input.hasResolvedCommit,
    }),
    affectedPath: MANIFEST_PATH,
  };
}

function isLocalIntegritySource(
  sourceType: Manifest["sourceDescriptor"]["sourceType"],
): sourceType is "local-tarball" | "offline-bundle" | "local" {
  return sourceType === "local-tarball" || sourceType === "offline-bundle" || sourceType === "local";
}

function createLocalInstalledSourceIntegrityIssue(input: {
  issueId?:
    | "source-integrity.hash-mismatch"
    | "source-integrity.missing-evidence"
    | "source-integrity.unsupported-source";
  reason: string;
  descriptor: Manifest["sourceDescriptor"];
}): ValidationIssue {
  return {
    ...createLocalSourceIntegrityIssue({
      issueId: input.issueId ?? "source-integrity.missing-evidence",
      reason: input.reason,
      sourceType: input.descriptor.sourceType,
      component: "validate-source-integrity",
    }),
    affectedPath: MANIFEST_PATH,
  };
}

function createSourceIntegrityIssue(input: {
  issueId?:
    | "source-integrity.lock-mismatch"
    | "source-integrity.missing-evidence"
    | "source-integrity.unsupported-source";
  reason: string;
  descriptor: Manifest["sourceDescriptor"];
}): ValidationIssue {
  return {
    ...createRegistrySourceIntegrityIssue({
      issueId: input.issueId ?? "source-integrity.missing-evidence",
      reason: input.reason,
      sourceType: input.descriptor.sourceType,
      registryKind: input.descriptor.sourceType === "npm" ? "public" : "private",
      requestedVersion: input.descriptor.requestedVersion,
      channel: input.descriptor.channel,
      component: "validate-source-integrity",
    }),
    affectedPath: MANIFEST_PATH,
  };
}

function classifyInstalledGitRequestedRef(value: string | undefined):
  | "missing"
  | "commit"
  | "branch"
  | "tag"
  | "full-ref"
  | "symbolic" {
  if (value === undefined) return "missing";
  if (/^[a-f0-9]{40}$/i.test(value)) return "commit";
  if (value.startsWith("refs/")) return "full-ref";
  if (/^v?\d+(?:\.\d+){1,3}(?:[-+][a-z0-9._-]+)?$/i.test(value)) return "tag";
  if (/^[A-Za-z0-9._/-]+$/.test(value)) return "branch";
  return "symbolic";
}

function isFullGitCommitSha(value: string): boolean {
  return FULL_GIT_COMMIT_SHA_PATTERN.test(value);
}
