import { access, readFile } from "node:fs/promises";
import path from "node:path";
import type { ValidationIssue } from "../diagnostics/command-result-schema.js";
import type { SourceDescriptor, SourceIntegrityEvidence } from "./source-descriptor-schema.js";
import { deriveSourceTrustStatus } from "./source-trust.js";

export const BUNDLED_SOURCE_DISPLAY_ROOT = "assets/source/speclite" as const;

export async function discoverBundledSourceDescriptor(input: {
  projectRoot: string;
}): Promise<SourceDescriptor> {
  const evidence = await readBundledSourceEvidence(input.projectRoot);

  return {
    sourceType: "bundled",
    resolvedRoot: BUNDLED_SOURCE_DISPLAY_ROOT,
    integrityEvidence: evidence,
    trustStatus: deriveSourceTrustStatus({
      integrityEvidence: evidence,
      explicitlyConfirmed: true,
      hasBlockingIssue: evidence.length === 0,
    }),
  };
}

export function createMissingBundledSourceEvidenceIssue(): ValidationIssue {
  return {
    issueId: "source-integrity.missing-evidence",
    category: "source-integrity",
    severity: "error",
    component: "bundled-source",
    impact: "Bundled official source cannot be used without reproducible packaging evidence.",
    suggestedNextStep:
      "Restore package-lock.json or add a packaging evidence anchor before continuing install.",
  };
}

async function readBundledSourceEvidence(projectRoot: string): Promise<SourceIntegrityEvidence[]> {
  const packageLockEvidence = await readPackageLockEvidence(projectRoot);
  if (packageLockEvidence !== undefined) {
    return [packageLockEvidence];
  }

  return await readPackagingManifestEvidence(projectRoot);
}

async function readPackageLockEvidence(
  projectRoot: string,
): Promise<SourceIntegrityEvidence | undefined> {
  const lockPath = path.join(projectRoot, "package-lock.json");
  if (!(await pathExists(lockPath))) {
    return undefined;
  }

  const parsed = JSON.parse(await readFile(lockPath, "utf8")) as {
    name?: unknown;
    version?: unknown;
    packages?: Record<string, { name?: unknown; version?: unknown }>;
  };
  const rootPackage = parsed.packages?.[""];
  const packageName = asNonEmptyString(rootPackage?.name) ?? asNonEmptyString(parsed.name);
  const version = asNonEmptyString(rootPackage?.version) ?? asNonEmptyString(parsed.version);

  if (packageName === undefined || version === undefined) {
    return undefined;
  }

  return {
    kind: "version-lock",
    packageName,
    version,
    lockPath: "package-lock.json",
    verified: true,
  };
}

async function readPackagingManifestEvidence(projectRoot: string): Promise<SourceIntegrityEvidence[]> {
  const manifestPath = path.join(projectRoot, "dist/packaging-manifest.json");
  if (!(await pathExists(manifestPath))) {
    return [];
  }

  const parsed = JSON.parse(await readFile(manifestPath, "utf8")) as {
    schemaVersion?: unknown;
    packageJson?: {
      name?: unknown;
      version?: unknown;
    };
    packageHash?: unknown;
  };

  if (parsed.schemaVersion !== "speclite.packaging-manifest.v1") {
    return [];
  }

  const packageName = asNonEmptyString(parsed.packageJson?.name);
  const version = asNonEmptyString(parsed.packageJson?.version);
  if (packageName === undefined || version === undefined) {
    return [];
  }

  const evidence: SourceIntegrityEvidence[] = [
    {
      kind: "version-lock",
      packageName,
      version,
      lockPath: "dist/packaging-manifest.json",
      verified: true,
    },
  ];
  const packageHash = asNonEmptyString(parsed.packageHash);
  if (packageHash !== undefined) {
    evidence.push({
      kind: "content-hash",
      algorithm: "sha256",
      value: packageHash,
      verified: true,
    });
  }

  return evidence;
}

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await access(targetPath);
    return true;
  } catch (error) {
    if (isNodeError(error) && error.code === "ENOENT") {
      return false;
    }
    throw error;
  }
}

function asNonEmptyString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}
