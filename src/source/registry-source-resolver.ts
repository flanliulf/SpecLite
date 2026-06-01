import type { SourceDescriptor, SourceIntegrityEvidence } from "./source-descriptor-schema.js";
import type { NormalizedSourceSelection } from "./source-selection.js";
import {
  createBlockedRegistryDescriptor,
  createRegistrySourceIntegrityIssue,
  type RegistryKind,
} from "./source-integrity.js";
import type { ValidationIssue } from "../diagnostics/command-result-schema.js";
import { deriveSourceTrustStatus } from "./source-trust.js";

export type RegistryPackageVersion = {
  version: string;
  integrity?: string;
};

export type RegistryPackageMetadata = {
  packageName: string;
  distTags?: Record<string, string> | undefined;
  versions: Record<string, RegistryPackageVersion>;
};

export type RegistryMetadataClient = {
  fetchPackageMetadata: (input: {
    sourceType: "npm" | "private-registry";
    packageName: string;
    requestedVersion?: string | undefined;
    channel?: string | undefined;
    registryKind: RegistryKind;
    registryLabel?: string | undefined;
  }) => Promise<RegistryPackageMetadata>;
};

export type RegistryRuntimeConfig = {
  registryKind: RegistryKind;
  displaySafeRegistryLabel: string;
  packageName: string;
  channel?: string | undefined;
};

export type ExpectedVersionLock = {
  packageName: string;
  version: string;
  lockPath: string;
};

export type RegistryResolutionResult =
  | {
      ok: true;
      descriptor: SourceDescriptor;
    }
  | {
      ok: false;
      descriptor: SourceDescriptor;
      issues: ValidationIssue[];
    };

export class RegistrySourceResolutionError extends Error {
  constructor(
    public readonly code:
      | "authentication-required"
      | "not-found"
      | "registry-unreachable"
      | "unsupported-source",
    message: string,
  ) {
    super(message);
    this.name = "RegistrySourceResolutionError";
  }
}

export async function resolveRegistrySource(input: {
  selection: NormalizedSourceSelection;
  registryClient: RegistryMetadataClient;
  runtimeConfig?: RegistryRuntimeConfig | undefined;
  expectedLock?: ExpectedVersionLock | undefined;
  expectedIntegrity?: string | undefined;
}): Promise<RegistryResolutionResult> {
  const registryKind = getRegistryKind(input.selection.sourceType);
  const packageName = input.selection.registryPackageName;
  if (
    registryKind === undefined ||
    packageName === undefined ||
    input.selection.sourceType !== "npm" && input.selection.sourceType !== "private-registry"
  ) {
    return blocked(input.selection, [
      createRegistrySourceIntegrityIssue({
        issueId: "source-integrity.unsupported-source",
        reason: "unsupported-registry-source-selector",
        sourceType: input.selection.sourceType,
        registryKind,
        requestedVersion: input.selection.requestedVersion,
        channel: input.selection.channel,
      }),
    ]);
  }
  if (
    input.selection.sourceType === "private-registry" &&
    !isExplicitPrivateRegistryConfig({
      config: input.runtimeConfig,
      packageName,
      channel: input.selection.channel,
    })
  ) {
    return blocked(input.selection, [
      createRegistrySourceIntegrityIssue({
        issueId: "source-integrity.authentication-required",
        reason: "private-registry-explicit-config-required",
        sourceType: input.selection.sourceType,
        registryKind,
        packageName,
        requestedVersion: input.selection.requestedVersion,
        channel: input.selection.channel,
      }),
    ]);
  }

  let metadata: RegistryPackageMetadata;
  try {
    metadata = await input.registryClient.fetchPackageMetadata({
      sourceType: input.selection.sourceType,
      packageName,
      ...(input.selection.requestedVersion === undefined
        ? {}
        : { requestedVersion: input.selection.requestedVersion }),
      ...(input.selection.channel === undefined ? {} : { channel: input.selection.channel }),
      registryKind,
      ...(input.runtimeConfig?.displaySafeRegistryLabel === undefined
        ? {}
        : { registryLabel: input.runtimeConfig.displaySafeRegistryLabel }),
    });
  } catch (error) {
    return blocked(input.selection, [
      createRegistryFailureIssue({
        error,
        sourceType: input.selection.sourceType,
        registryKind,
        packageName,
        requestedVersion: input.selection.requestedVersion,
        channel: input.selection.channel,
      }),
    ]);
  }

  const resolvedVersion = resolveVersion({
    metadata,
    requestedVersion: input.selection.requestedVersion,
    channel: input.selection.channel,
  });
  if (resolvedVersion === undefined) {
    return blocked(input.selection, [
      createRegistrySourceIntegrityIssue({
        issueId: "source-integrity.unsupported-source",
        reason: "package-version-not-found",
        sourceType: input.selection.sourceType,
        registryKind,
        packageName,
        requestedVersion: input.selection.requestedVersion,
        channel: input.selection.channel,
      }),
    ]);
  }

  const versionMetadata = metadata.versions[resolvedVersion];
  if (versionMetadata === undefined) {
    return blocked(input.selection, [
      createRegistrySourceIntegrityIssue({
        issueId: "source-integrity.unsupported-source",
        reason: "registry-metadata-version-missing",
        sourceType: input.selection.sourceType,
        registryKind,
        packageName,
        requestedVersion: input.selection.requestedVersion,
        channel: input.selection.channel,
      }),
    ]);
  }

  const registryEvidence = createRegistryEvidence({
    packageName,
    version: resolvedVersion,
    integrity: versionMetadata.integrity,
    expectedIntegrity: input.expectedIntegrity,
  });
  if (input.expectedIntegrity !== undefined && registryEvidence?.verified !== true) {
    return blocked(input.selection, [
      createRegistrySourceIntegrityIssue({
        issueId: "source-integrity.hash-mismatch",
        reason: "registry-integrity-hash-mismatch",
        sourceType: input.selection.sourceType,
        registryKind,
        packageName,
        requestedVersion: input.selection.requestedVersion,
        channel: input.selection.channel,
      }),
    ], resolvedVersion, registryEvidence === undefined ? [] : [registryEvidence]);
  }

  const lockEvidence = createLockEvidence({
    expectedLock: input.expectedLock,
    packageName,
    resolvedVersion,
  });
  if (input.expectedLock !== undefined && lockEvidence?.verified !== true) {
    return blocked(input.selection, [
      createRegistrySourceIntegrityIssue({
        issueId: "source-integrity.lock-mismatch",
        reason: "version-lock-mismatch",
        sourceType: input.selection.sourceType,
        registryKind,
        packageName,
        requestedVersion: input.selection.requestedVersion,
        channel: input.selection.channel,
      }),
    ], resolvedVersion, registryEvidence === undefined ? [] : [registryEvidence]);
  }

  const integrityEvidence = sortIntegrityEvidence(
    [registryEvidence, lockEvidence].filter(
      (evidence): evidence is SourceIntegrityEvidence => evidence !== undefined,
    ),
  );
  if (integrityEvidence.length === 0) {
    return blocked(input.selection, [
      createRegistrySourceIntegrityIssue({
        issueId: "source-integrity.missing-evidence",
        reason: "missing-registry-integrity",
        sourceType: input.selection.sourceType,
        registryKind,
        packageName,
        requestedVersion: input.selection.requestedVersion,
        channel: input.selection.channel,
      }),
    ], resolvedVersion);
  }

  return {
    ok: true,
    descriptor: {
      sourceType: input.selection.sourceType,
      ...(input.selection.channel === undefined ? {} : { channel: input.selection.channel }),
      ...(input.selection.requestedVersion === undefined
        ? {}
        : { requestedVersion: input.selection.requestedVersion }),
      version: resolvedVersion,
      integrityEvidence,
      trustStatus: deriveSourceTrustStatus({
        integrityEvidence,
        explicitlyConfirmed: true,
      }),
    },
  };
}

export function createDefaultRegistryMetadataClient(): RegistryMetadataClient {
  return {
    fetchPackageMetadata: async (input) => {
      if (input.sourceType === "private-registry") {
        throw new RegistrySourceResolutionError(
          "authentication-required",
          "Private registry resolution requires explicit injected registry configuration.",
        );
      }

      const encodedPackage = input.packageName.startsWith("@")
        ? `@${encodeURIComponent(input.packageName.slice(1)).replace("%2F", "%2f")}`
        : encodeURIComponent(input.packageName);
      const response = await fetch(`https://registry.npmjs.org/${encodedPackage}`);
      if (response.status === 401 || response.status === 403) {
        throw new RegistrySourceResolutionError("authentication-required", "Registry authentication required.");
      }
      if (response.status === 404) {
        throw new RegistrySourceResolutionError("not-found", "Registry package not found.");
      }
      if (!response.ok) {
        throw new RegistrySourceResolutionError("registry-unreachable", "Registry metadata is unavailable.");
      }

      const parsed = await response.json() as {
        name?: unknown;
        "dist-tags"?: unknown;
        versions?: unknown;
      };
      if (typeof parsed.name !== "string" || !isRecord(parsed.versions)) {
        throw new RegistrySourceResolutionError("unsupported-source", "Registry metadata shape is unsupported.");
      }

      return {
        packageName: parsed.name,
        distTags: normalizeStringRecord(parsed["dist-tags"]),
        versions: normalizeVersions(parsed.versions),
      };
    },
  };
}

function blocked(
  selection: NormalizedSourceSelection,
  issues: ValidationIssue[],
  version?: string,
  integrityEvidence?: SourceDescriptor["integrityEvidence"],
): RegistryResolutionResult {
  return {
    ok: false,
    descriptor: createBlockedRegistryDescriptor({
      sourceType: selection.sourceType,
      requestedSourceValue: selection.requestedSourceValue,
      requestedVersion: selection.requestedVersion,
      channel: selection.channel,
      version,
      integrityEvidence,
    }),
    issues,
  };
}

function createRegistryFailureIssue(input: {
  error: unknown;
  sourceType: "npm" | "private-registry";
  registryKind: RegistryKind;
  packageName: string;
  requestedVersion?: string | undefined;
  channel?: string | undefined;
}): ValidationIssue {
  const code = input.error instanceof RegistrySourceResolutionError
    ? input.error.code
    : "registry-unreachable";
  const issueId =
    code === "authentication-required"
      ? "source-integrity.authentication-required"
      : code === "registry-unreachable"
        ? "source-integrity.registry-unreachable"
        : "source-integrity.unsupported-source";

  return createRegistrySourceIntegrityIssue({
    issueId,
    reason: code,
    sourceType: input.sourceType,
    registryKind: input.registryKind,
    packageName: input.packageName,
    requestedVersion: input.requestedVersion,
    channel: input.channel,
  });
}

function getRegistryKind(sourceType: NormalizedSourceSelection["sourceType"]): RegistryKind | undefined {
  if (sourceType === "npm") return "public";
  if (sourceType === "private-registry") return "private";
  return undefined;
}

function isExplicitPrivateRegistryConfig(input: {
  config?: RegistryRuntimeConfig | undefined;
  packageName: string;
  channel?: string | undefined;
}): boolean {
  const config = input.config;
  if (config === undefined) return false;
  if (config.registryKind !== "private") return false;
  if (config.packageName !== input.packageName) return false;
  if (config.channel !== input.channel) return false;
  return isDisplaySafeRegistryLabel(config.displaySafeRegistryLabel);
}

function isDisplaySafeRegistryLabel(value: string): boolean {
  const normalized = value.trim();
  if (normalized.length === 0) return false;
  if (normalized.includes("://") || normalized.includes("?") || normalized.includes("#")) return false;
  return !/(?:token|secret|password|credential|auth)/i.test(normalized);
}

function resolveVersion(input: {
  metadata: RegistryPackageMetadata;
  requestedVersion?: string | undefined;
  channel?: string | undefined;
}): string | undefined {
  const selector = input.requestedVersion ?? input.channel ?? "latest";
  if (input.metadata.versions[selector] !== undefined) return selector;
  const distTagVersion = input.metadata.distTags?.[selector];
  if (distTagVersion !== undefined && input.metadata.versions[distTagVersion] !== undefined) {
    return distTagVersion;
  }
  if (selector.startsWith("^")) {
    return resolveCaretRange(selector, Object.keys(input.metadata.versions));
  }
  return undefined;
}

function resolveCaretRange(selector: string, versions: string[]): string | undefined {
  const minimum = parseSemver(selector.slice(1));
  if (minimum === undefined) return undefined;
  return versions
    .map((version) => ({ version, parsed: parseSemver(version) }))
    .filter((entry): entry is { version: string; parsed: [number, number, number] } =>
      entry.parsed !== undefined &&
      entry.parsed[0] === minimum[0] &&
      compareSemver(entry.parsed, minimum) >= 0
    )
    .sort((left, right) => compareSemver(right.parsed, left.parsed))[0]?.version;
}

function parseSemver(version: string): [number, number, number] | undefined {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version);
  if (match === null) return undefined;
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function compareSemver(left: [number, number, number], right: [number, number, number]): number {
  return left[0] - right[0] || left[1] - right[1] || left[2] - right[2];
}

function createRegistryEvidence(input: {
  packageName: string;
  version: string;
  integrity?: string | undefined;
  expectedIntegrity?: string | undefined;
}): SourceIntegrityEvidence | undefined {
  if (input.integrity === undefined || input.integrity.trim().length === 0) return undefined;
  return {
    kind: "registry-integrity",
    packageName: input.packageName,
    version: input.version,
    integrity: input.integrity,
    verified: input.expectedIntegrity !== undefined && input.expectedIntegrity === input.integrity,
  };
}

function createLockEvidence(input: {
  expectedLock?: ExpectedVersionLock | undefined;
  packageName: string;
  resolvedVersion: string;
}): SourceIntegrityEvidence | undefined {
  if (input.expectedLock === undefined) return undefined;
  if (
    input.expectedLock.packageName !== input.packageName ||
    input.expectedLock.version !== input.resolvedVersion ||
    !isProjectRelativePosixPath(input.expectedLock.lockPath)
  ) {
    return undefined;
  }

  return {
    kind: "version-lock",
    packageName: input.packageName,
    version: input.resolvedVersion,
    lockPath: input.expectedLock.lockPath,
    verified: true,
  };
}

function sortIntegrityEvidence(evidence: SourceIntegrityEvidence[]): SourceIntegrityEvidence[] {
  const order: Record<SourceIntegrityEvidence["kind"], number> = {
    "registry-integrity": 0,
    "version-lock": 1,
    "content-hash": 2,
    "git-commit": 3,
  };
  return [...evidence].sort((left, right) => {
    const leftKey = evidenceKey(left);
    const rightKey = evidenceKey(right);
    return order[left.kind] - order[right.kind] || leftKey.localeCompare(rightKey);
  });
}

function evidenceKey(evidence: SourceIntegrityEvidence): string {
  if (evidence.kind === "registry-integrity" || evidence.kind === "version-lock") {
    return `${evidence.packageName}:${evidence.version}`;
  }
  if (evidence.kind === "content-hash") return evidence.value;
  return evidence.commitSha;
}

function isProjectRelativePosixPath(value: string): boolean {
  return (
    value.length > 0 &&
    !value.includes("\\") &&
    !value.startsWith("/") &&
    !value.startsWith("~") &&
    !/^[A-Za-z]:(?:\/|$)/.test(value) &&
    value !== "." &&
    value !== ".." &&
    !value.startsWith("../") &&
    !value.includes("/../")
  );
}

function normalizeStringRecord(value: unknown): Record<string, string> | undefined {
  if (!isRecord(value)) return undefined;
  const result: Record<string, string> = {};
  for (const [key, entry] of Object.entries(value)) {
    if (typeof entry === "string" && entry.length > 0) result[key] = entry;
  }
  return result;
}

function normalizeVersions(value: unknown): Record<string, RegistryPackageVersion> {
  if (!isRecord(value)) return {};
  const versions: Record<string, RegistryPackageVersion> = {};
  for (const [version, entry] of Object.entries(value)) {
    if (!isRecord(entry)) continue;
    const integrity = readDistIntegrity(entry);
    versions[version] = {
      version,
      ...(integrity === undefined ? {} : { integrity }),
    };
  }
  return versions;
}

function readDistIntegrity(value: Record<string, unknown>): string | undefined {
  const dist = value.dist;
  if (!isRecord(dist)) return undefined;
  return typeof dist.integrity === "string" && dist.integrity.length > 0
    ? dist.integrity
    : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
