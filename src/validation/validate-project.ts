import { readdir, readFile, stat } from "node:fs/promises";
import type { ValidateCommandData, ValidationIssue } from "../diagnostics/command-result-schema.js";
import type { IdeTargetId } from "../ide/adapter-registry.js";
import { toProjectRelativePosixPath } from "../fs/path-normalizer.js";
import { parse as parseYaml } from "yaml";
import path from "node:path";
import {
  ISSUE_SEVERITIES,
  type IssueCategory,
  type IssueSeverity,
} from "./issue-model.js";
import {
  sortCheckedTargets,
  sortIssueCategories,
  sortValidatedPaths,
  sortValidationIssues,
} from "./validation-order.js";
import { validateFileIntegrity } from "./rules/file-integrity.js";
import { validateIdeMirror } from "./rules/ide-mirror.js";
import { validateManifestSchema } from "./rules/manifest-schema.js";
import { validateRuntimePaths } from "./rules/runtime-path.js";
import { validateMenuTargets } from "./rules/menu-target.js";
import { validateLegacyNamespace } from "./rules/legacy-namespace.js";
import { validateArtifactPathContract } from "./rules/artifact-path.js";
import { validateOperationLock } from "./rules/operation-lock.js";

export type ValidateProjectResult = {
  issues: ValidationIssue[];
  data: ValidateCommandData;
};

export async function validateProject(input: { projectRoot: string }): Promise<ValidateProjectResult> {
  const manifestSchemaResult = await validateManifestSchema({ projectRoot: input.projectRoot });
  const issues: ValidationIssue[] = [...manifestSchemaResult.issues];
  const checkedCategories = new Set<IssueCategory>(["manifest-schema"]);
  const checkedTargets = new Set<IdeTargetId>(manifestSchemaResult.checkedTargets);
  const validatedPaths = new Set(manifestSchemaResult.validatedPaths);

  if (
    manifestSchemaResult.issues.length === 0 &&
    manifestSchemaResult.skillIndex !== undefined &&
    manifestSchemaResult.helpIndex !== undefined &&
    manifestSchemaResult.filesIndex !== undefined &&
    manifestSchemaResult.phaseCoverage !== undefined
  ) {
    const ideMirrorResult = await validateIdeMirror({
      projectRoot: input.projectRoot,
      skillIndex: manifestSchemaResult.skillIndex,
    });
    issues.push(...ideMirrorResult.issues);
    checkedCategories.add("ide-mirror");
    for (const targetId of ideMirrorResult.checkedTargets) checkedTargets.add(targetId);
    for (const validatedPath of ideMirrorResult.validatedPaths) validatedPaths.add(validatedPath);

    const runtimePathResult = await validateRuntimePaths({
      projectRoot: input.projectRoot,
      manifest: manifestSchemaResult.manifest,
      filesIndex: manifestSchemaResult.filesIndex,
    });
    issues.push(...runtimePathResult.issues);
    checkedCategories.add("runtime-path");
    for (const validatedPath of runtimePathResult.validatedPaths) validatedPaths.add(validatedPath);

    const menuTargetIssues = validateMenuTargets({
      skillIndex: manifestSchemaResult.skillIndex,
      helpIndex: manifestSchemaResult.helpIndex,
      phaseCoverage: manifestSchemaResult.phaseCoverage,
    });
    issues.push(...menuTargetIssues);
    checkedCategories.add("menu-target");
    validatedPaths.add("_speclite/_config/help-index.json");
    validatedPaths.add("_speclite/_config/phase-coverage.json");

    const legacyNamespaceResult = await validateLegacyNamespace({
      projectRoot: input.projectRoot,
      skillIndex: manifestSchemaResult.skillIndex,
      filesIndex: manifestSchemaResult.filesIndex,
    });
    issues.push(...legacyNamespaceResult.issues);
    checkedCategories.add("legacy-namespace");
    for (const targetId of legacyNamespaceResult.checkedTargets) checkedTargets.add(targetId);
    for (const validatedPath of legacyNamespaceResult.validatedPaths) validatedPaths.add(validatedPath);

    const artifactPathResult = await validateArtifactPaths({
      projectRoot: input.projectRoot,
      configuredRoot: manifestSchemaResult.manifest.paths.artifactRoot,
      defaultOutputPaths: manifestSchemaResult.phaseCoverage.rows
        .map((row) => row.artifactContract)
        .filter((contract): contract is NonNullable<typeof contract> => contract !== undefined),
    });
    issues.push(...artifactPathResult.issues);
    checkedCategories.add("artifact-path");
    for (const validatedPath of artifactPathResult.validatedPaths) validatedPaths.add(validatedPath);

    const fileIntegrityResult = await validateFileIntegrity({
      projectRoot: input.projectRoot,
      filesIndex: manifestSchemaResult.filesIndex,
      artifactRoot: manifestSchemaResult.manifest.paths.artifactRoot,
    });
    issues.push(...fileIntegrityResult.issues);
    checkedCategories.add("file-integrity");
    for (const validatedPath of fileIntegrityResult.validatedPaths) validatedPaths.add(validatedPath);
  }

  const operationLockResult = await validateOperationLock({ projectRoot: input.projectRoot });
  if (operationLockResult.validatedPaths.length > 0 || operationLockResult.issues.length > 0) {
    issues.push(...operationLockResult.issues);
    checkedCategories.add("operation-lock");
    for (const validatedPath of operationLockResult.validatedPaths) validatedPaths.add(validatedPath);
  }

  const sortedIssues = sortValidationIssues(issues);
  return {
    issues: sortedIssues,
    data: {
      issueCounts: countIssues(sortedIssues),
      checkedCategories: sortIssueCategories(checkedCategories),
      checkedTargets: sortCheckedTargets(checkedTargets),
      validatedPaths: sortValidatedPaths(validatedPaths),
    },
  };
}

function countIssues(issues: ValidationIssue[]): ValidateCommandData["issueCounts"] {
  const counts: Record<IssueSeverity, number> = {
    info: 0,
    warning: 0,
    error: 0,
    critical: 0,
  };

  for (const issue of issues) {
    counts[issue.severity] += 1;
  }

  return counts;
}

async function validateArtifactPaths(input: {
  projectRoot: string;
  configuredRoot: string;
  defaultOutputPaths: Array<{ artifactType: string; defaultOutputPath: string }>;
}): Promise<{ issues: ValidationIssue[]; validatedPaths: string[] }> {
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

  for (const contract of checks) {
    validatedPaths.add(contract.defaultOutputPath);
    const artifacts = await discoverArtifacts({
      projectRoot: input.projectRoot,
      defaultOutputPath: contract.defaultOutputPath,
    });
    if (artifacts.length === 0) {
      issues.push(
        ...(await validateArtifactPathContract({
          projectRoot: input.projectRoot,
          configuredRoot: input.configuredRoot,
          defaultOutputPath: contract.defaultOutputPath,
          artifactType: contract.artifactType,
          metadataLocation: "frontmatter",
        })),
      );
      continue;
    }

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
          metadataLocation: artifact.metadataLocation,
        })),
      );
    }
  }

  return {
    issues,
    validatedPaths: [...validatedPaths],
  };
}

type DiscoveredArtifact = {
  relativePath: string;
  metadata: Record<string, unknown>;
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
      const parsed = parseYaml(frontmatter[1]);
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
