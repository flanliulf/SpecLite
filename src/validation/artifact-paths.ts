import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import type { ValidationIssue } from "../diagnostics/command-result-schema.js";
import { toProjectRelativePosixPath } from "../fs/path-normalizer.js";
import { validateArtifactPathContract } from "./rules/artifact-path.js";

export type ArtifactPathCheck = {
  artifactType: string;
  defaultOutputPath: string;
  present: boolean;
  valid: boolean;
  artifactPaths: string[];
  issueIds: string[];
};

export async function validateArtifactPaths(input: {
  projectRoot: string;
  configuredRoot: string;
  defaultOutputPaths: Array<{ artifactType: string; defaultOutputPath: string }>;
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
  const artifactChecks: ArtifactPathCheck[] = [];

  for (const contract of checks) {
    validatedPaths.add(contract.defaultOutputPath);
    const artifacts = await discoverArtifacts({
      projectRoot: input.projectRoot,
      defaultOutputPath: contract.defaultOutputPath,
    });
    const contractIssueStartIndex = issues.length;

    if (artifacts.length === 0) {
      const pathIssues = await validateArtifactPathContract({
        projectRoot: input.projectRoot,
        configuredRoot: input.configuredRoot,
        defaultOutputPath: contract.defaultOutputPath,
        artifactType: contract.artifactType,
        metadataLocation: "frontmatter",
      });
      issues.push(...pathIssues);
      if (input.defaultOutputPaths.length > 0 && pathIssues.length === 0) {
        issues.push(createMissingArtifactIssue(contract));
      }
    } else {
      for (const artifact of artifacts) {
        validatedPaths.add(artifact.relativePath);
        issues.push(
          ...(await validateArtifactPathContract({
            projectRoot: input.projectRoot,
            configuredRoot: input.configuredRoot,
            defaultOutputPath: contract.defaultOutputPath,
            actualArtifactPath: artifact.relativePath,
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
      present: artifacts.length > 0,
      valid: contractIssues.length === 0,
      artifactPaths: artifacts.map((artifact) => artifact.relativePath),
      issueIds: [...new Set(contractIssues.map((issue) => issue.issueId))].sort(),
    });
  }

  return {
    issues,
    validatedPaths: [...validatedPaths],
    artifactChecks: artifactChecks.sort((left, right) =>
      left.defaultOutputPath.localeCompare(right.defaultOutputPath) ||
      left.artifactType.localeCompare(right.artifactType),
    ),
  };
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
