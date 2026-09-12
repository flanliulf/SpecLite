import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import type { ValidationIssue } from "../diagnostics/command-result-schema.js";
import { toProjectRelativePosixPath } from "../fs/path-normalizer.js";
import type { ArtifactRootProjection } from "../manifest/manifest-schema.js";
import { validateArtifactPathContract } from "./rules/artifact-path.js";

export type ArtifactPathCheck = {
  artifactType: string;
  defaultOutputPath: string;
  present: boolean;
  valid: boolean;
  artifactPaths: string[];
  issueIds: string[];
};

export type ArtifactOutputPathContract = {
  artifactType: string;
  defaultOutputPath: string;
};

export type ActualOutputPathEvidence = ArtifactOutputPathContract & {
  actualOutputPath: string;
  actualArtifactPaths?: readonly string[];
};

export async function validateArtifactPaths(input: {
  projectRoot: string;
  configuredRoot: string;
  artifactRoots?: readonly ArtifactRootProjection[];
  defaultOutputPaths: ArtifactOutputPathContract[];
  actualOutputPaths?: readonly ActualOutputPathEvidence[];
}): Promise<{ issues: ValidationIssue[]; validatedPaths: string[]; artifactChecks: ArtifactPathCheck[] }> {
  const checks =
    input.defaultOutputPaths.length === 0
      ? [
          {
            artifactType: "workflow-artifact",
            defaultOutputPath: input.configuredRoot,
          },
        ]
      : input.defaultOutputPaths;
  const issues: ValidationIssue[] = [];
  const validatedPaths = new Set<string>([input.configuredRoot]);
  for (const root of input.artifactRoots ?? []) validatedPaths.add(root.resolvedRoot);
  const artifactChecks: ArtifactPathCheck[] = [];
  let discoveredArtifactCount = 0;

  for (const contract of checks) {
    const artifactRootEvidence = findArtifactRootEvidence({
      defaultOutputPath: contract.defaultOutputPath,
      artifactRoots: input.artifactRoots,
    });
    const configuredRoot = artifactRootEvidence?.resolvedRoot ?? input.configuredRoot;
    validatedPaths.add(contract.defaultOutputPath);
    const artifacts = await discoverArtifacts({
      projectRoot: input.projectRoot,
      defaultOutputPath: contract.defaultOutputPath,
    });
    for (const actualOutputPathEvidence of findActualOutputPathsForContract({
      contract,
      actualOutputPaths: input.actualOutputPaths,
    })) {
      validatedPaths.add(actualOutputPathEvidence.actualOutputPath);
      artifacts.push(
        ...(await discoverActualOutputArtifacts({
          projectRoot: input.projectRoot,
          actualOutputPathEvidence,
        })),
      );
    }
    const contractArtifacts = dedupeDiscoveredArtifacts(artifacts);
    discoveredArtifactCount += contractArtifacts.length;
    const contractIssueStartIndex = issues.length;

    if (contractArtifacts.length === 0) {
      const pathIssues = await validateArtifactPathContract({
        projectRoot: input.projectRoot,
        configuredRoot,
        defaultOutputPath: contract.defaultOutputPath,
        ...(artifactRootEvidence === undefined ? {} : { artifactRootEvidence }),
        artifactType: contract.artifactType,
        metadataLocation: "frontmatter",
      });
      issues.push(...pathIssues);
      if (input.defaultOutputPaths.length > 0 && pathIssues.length === 0) {
        issues.push(createMissingArtifactIssue(contract));
      }
    } else {
      for (const artifact of contractArtifacts) {
        validatedPaths.add(artifact.relativePath);
        issues.push(
          ...(await validateArtifactPathContract({
            projectRoot: input.projectRoot,
            configuredRoot,
            defaultOutputPath: contract.defaultOutputPath,
            actualArtifactPath: artifact.relativePath,
            ...(artifactRootEvidence === undefined ? {} : { artifactRootEvidence }),
            artifactType: contract.artifactType,
            metadata: artifact.metadata,
            ...(artifact.metadataParseFailureReason === undefined
              ? {}
              : { metadataParseFailureReason: artifact.metadataParseFailureReason }),
            metadataLocation: artifact.metadataLocation,
          })),
        );
      }
    }

    const contractIssues = issues.slice(contractIssueStartIndex);
    artifactChecks.push({
      artifactType: contract.artifactType,
      defaultOutputPath: contract.defaultOutputPath,
      present: contractArtifacts.length > 0,
      valid: contractIssues.length === 0,
      artifactPaths: contractArtifacts.map((artifact) => artifact.relativePath),
      issueIds: [...new Set(contractIssues.map((issue) => issue.issueId))].sort(),
    });
  }

  const notYetProduced =
    discoveredArtifactCount === 0 &&
    (await directoryExists(path.join(input.projectRoot, input.configuredRoot)));

  return {
    issues: notYetProduced ? issues.map(markNotYetProducedArtifactIssue) : issues,
    validatedPaths: [...validatedPaths],
    artifactChecks: artifactChecks.sort((left, right) =>
      left.defaultOutputPath.localeCompare(right.defaultOutputPath) ||
      left.artifactType.localeCompare(right.artifactType),
    ),
  };
}

function findActualOutputPathsForContract(input: {
  contract: ArtifactOutputPathContract;
  actualOutputPaths?: readonly ActualOutputPathEvidence[];
}): ActualOutputPathEvidence[] {
  return (input.actualOutputPaths ?? [])
    .filter(
      (actual) =>
        actual.artifactType === input.contract.artifactType &&
        actual.defaultOutputPath === input.contract.defaultOutputPath &&
        actual.actualOutputPath !== input.contract.defaultOutputPath,
    )
    .map((actual) => ({
      ...actual,
      ...(actual.actualArtifactPaths === undefined
        ? {}
        : {
            actualArtifactPaths: [...new Set(actual.actualArtifactPaths)].sort((left, right) =>
              left.localeCompare(right),
            ),
          }),
    }))
    .sort(
      (left, right) =>
        left.actualOutputPath.localeCompare(right.actualOutputPath) ||
        (left.actualArtifactPaths ?? []).join("\0").localeCompare((right.actualArtifactPaths ?? []).join("\0")),
    );
}

function dedupeDiscoveredArtifacts(artifacts: DiscoveredArtifact[]): DiscoveredArtifact[] {
  const byRelativePath = new Map<string, DiscoveredArtifact>();
  for (const artifact of artifacts) {
    if (!byRelativePath.has(artifact.relativePath)) byRelativePath.set(artifact.relativePath, artifact);
  }
  return [...byRelativePath.values()].sort((left, right) => left.relativePath.localeCompare(right.relativePath));
}

function findArtifactRootEvidence(input: {
  defaultOutputPath: string;
  artifactRoots?: readonly ArtifactRootProjection[];
}): {
  field: ArtifactRootProjection["field"];
  configuredRoot: string;
  resolvedRoot: string;
  resolutionMode: ArtifactRootProjection["resolutionMode"];
} | undefined {
  const root = input.artifactRoots
    ?.filter((candidate) => isSameOrDescendantPath(input.defaultOutputPath, candidate.resolvedRoot))
    .sort((left, right) => right.resolvedRoot.length - left.resolvedRoot.length)[0];
  if (root === undefined) return undefined;
  return {
    field: root.field,
    configuredRoot: root.resolvedRoot,
    resolvedRoot: root.resolvedRoot,
    resolutionMode: root.resolutionMode,
  };
}

function isSameOrDescendantPath(candidatePath: string, containerPath: string): boolean {
  return candidatePath === containerPath || candidatePath.startsWith(`${containerPath}/`);
}

type DiscoveredArtifact = {
  relativePath: string;
  metadata: Record<string, unknown>;
  metadataParseFailureReason?: "malformed-frontmatter";
  metadataLocation: "frontmatter" | "sidecar" | "directory";
};

async function discoverArtifacts(input: {
  projectRoot: string;
  defaultOutputPath: string;
}): Promise<DiscoveredArtifact[]> {
  const absoluteRoot = path.join(input.projectRoot, input.defaultOutputPath);
  let rootStat: Awaited<ReturnType<typeof stat>>;
  try {
    rootStat = await stat(absoluteRoot);
  } catch {
    return [];
  }

  const artifactPaths = rootStat.isDirectory()
    ? await listArtifactEntities(absoluteRoot)
    : [absoluteRoot];

  const artifacts: DiscoveredArtifact[] = [];
  for (const artifactPath of artifactPaths) {
    const relativePath = toProjectRelativePosixPath({
      projectRoot: input.projectRoot,
      targetPath: artifactPath,
    });
    if (relativePath === ".") continue;

    artifacts.push({
      relativePath,
      ...(await readWorkflowArtifactMetadata(artifactPath)),
    });
  }

  return artifacts.sort((left, right) => left.relativePath.localeCompare(right.relativePath));
}

async function discoverActualOutputArtifacts(input: {
  projectRoot: string;
  actualOutputPathEvidence: ActualOutputPathEvidence;
}): Promise<DiscoveredArtifact[]> {
  if (input.actualOutputPathEvidence.actualArtifactPaths === undefined) {
    return discoverArtifacts({
      projectRoot: input.projectRoot,
      defaultOutputPath: input.actualOutputPathEvidence.actualOutputPath,
    });
  }

  const artifacts: DiscoveredArtifact[] = [];
  for (const relativeArtifactPath of input.actualOutputPathEvidence.actualArtifactPaths) {
    const absoluteArtifactPath = path.join(input.projectRoot, relativeArtifactPath);
    try {
      await stat(absoluteArtifactPath);
    } catch {
      continue;
    }
    artifacts.push({
      relativePath: toProjectRelativePosixPath({
        projectRoot: input.projectRoot,
        targetPath: absoluteArtifactPath,
      }),
      ...(await readWorkflowArtifactMetadata(absoluteArtifactPath)),
    });
  }

  return artifacts.sort((left, right) => left.relativePath.localeCompare(right.relativePath));
}

async function listArtifactEntities(directoryPath: string): Promise<string[]> {
  const entries = await readdir(directoryPath, { withFileTypes: true });
  const files: string[] = [];

  if (entries.some((entry) => entry.isFile() && entry.name === "metadata.json")) {
    return [directoryPath];
  }

  for (const entry of entries) {
    const entryPath = path.join(directoryPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listArtifactEntities(entryPath)));
    } else if (entry.isFile() && entry.name !== "metadata.json" && !entry.name.endsWith(".metadata.json")) {
      files.push(entryPath);
    }
  }

  return files;
}

async function readWorkflowArtifactMetadata(artifactPath: string): Promise<{
  metadata: Record<string, unknown>;
  metadataParseFailureReason?: "malformed-frontmatter";
  metadataLocation: "frontmatter" | "sidecar" | "directory";
}> {
  let artifactStat: Awaited<ReturnType<typeof stat>> | undefined;
  try {
    artifactStat = await stat(artifactPath);
  } catch {
    artifactStat = undefined;
  }

  if (artifactStat?.isDirectory() === true) {
    const metadataPath = path.join(artifactPath, "metadata.json");
    try {
      const parsed = JSON.parse(await readFile(metadataPath, "utf8")) as unknown;
      return {
        metadata: isRecord(parsed) ? parsed : {},
        metadataLocation: "directory",
      };
    } catch {
      return {
        metadata: {},
        metadataLocation: "directory",
      };
    }
  }

  if (artifactPath.endsWith(".md")) {
    const contents = await readFile(artifactPath, "utf8");
    const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(contents);
    if (frontmatter?.[1] !== undefined) {
      let parsed: unknown;
      try {
        parsed = parseYaml(frontmatter[1]);
      } catch {
        return {
          metadata: {},
          metadataParseFailureReason: "malformed-frontmatter",
          metadataLocation: "frontmatter",
        };
      }
      return {
        metadata: isRecord(parsed) ? parsed : {},
        metadataLocation: "frontmatter",
      };
    }
  }

  const sidecarPath = `${artifactPath}.metadata.json`;
  try {
    const parsed = JSON.parse(await readFile(sidecarPath, "utf8")) as unknown;
    return {
      metadata: isRecord(parsed) ? parsed : {},
      metadataLocation: "sidecar",
    };
  } catch {
    return {
      metadata: {},
      metadataLocation: "frontmatter",
    };
  }
}

function createMissingArtifactIssue(input: {
  artifactType: string;
  defaultOutputPath: string;
}): ValidationIssue {
  return {
    issueId: "artifact-path.missing-required-artifact",
    category: "artifact-path",
    severity: "warning",
    affectedPath: input.defaultOutputPath,
    component: "governance-report:artifact-contract",
    details: {
      artifactType: input.artifactType,
      reason: "no-artifacts-found",
    },
    impact: "A contracted workflow artifact output path contains no discoverable artifacts.",
    suggestedNextStep: "Run the workflow that writes the contracted artifact before treating this process artifact as covered.",
  };
}

/**
 * Downgrades "no artifacts found" reports to "not yet produced" when the artifact root exists but the
 * project has not produced any workflow artifact at all. A pristine installation is not a process gap.
 */
function markNotYetProducedArtifactIssue(issue: ValidationIssue): ValidationIssue {
  if (
    issue.issueId !== "artifact-path.missing-required-artifact" ||
    issue.component !== "governance-report:artifact-contract" ||
    issue.details?.reason !== "no-artifacts-found"
  ) {
    return issue;
  }

  return {
    ...issue,
    severity: "info",
    details: { ...issue.details, reason: "not-yet-produced" },
    impact: "A contracted workflow artifact has not been produced yet in this installation.",
    suggestedNextStep: "Run the workflow that writes the contracted artifact when this phase starts.",
  };
}

async function directoryExists(absolutePath: string): Promise<boolean> {
  try {
    return (await stat(absolutePath)).isDirectory();
  } catch {
    return false;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
