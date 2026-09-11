import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import type { ValidateCommandData, ValidationIssue } from "../diagnostics/command-result-schema.js";
import type { IdeTargetId } from "../ide/adapter-registry.js";
import {
  isProjectRelativePosixPath,
  type ArtifactContract,
  type ArtifactRootProjection,
} from "../manifest/manifest-schema.js";
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
import { validateArtifactPaths, type ActualOutputPathEvidence } from "./artifact-paths.js";
import { validateOperationLock } from "./rules/operation-lock.js";
import { validateSourceIntegrity } from "./rules/source-integrity.js";
import {
  createArtifactRootProjections,
  resolveArtifactRootsFromProjectConfig,
} from "../config/artifact-root-resolver.js";

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
  const manifest = manifestSchemaResult.manifest;

  if (
    manifestSchemaResult.issues.length === 0 &&
    manifest !== undefined &&
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
      manifest,
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

    const artifactRootEvidenceResult = await resolveArtifactRootsFromProjectConfig({
      projectRoot: input.projectRoot,
      lifecycle: "existing",
    });
    const artifactRoots = artifactRootEvidenceResult.ok
      ? createArtifactRootProjections(artifactRootEvidenceResult.roots)
      : undefined;
    const artifactContracts = manifestSchemaResult.phaseCoverage.rows
      .map((row) => row.artifactContract)
      .filter((contract): contract is ArtifactContract => contract !== undefined);
    const actualOutputPaths = await discoverLegacyActualOutputPaths({
      projectRoot: input.projectRoot,
      manifestArtifactRoot: manifest.paths.artifactRoot,
      ...(artifactRoots === undefined ? {} : { artifactRoots }),
      artifactContracts,
    });
    const artifactPathResult = await validateArtifactPaths({
      projectRoot: input.projectRoot,
      configuredRoot: manifest.paths.artifactRoot,
      ...(artifactRoots === undefined ? {} : { artifactRoots }),
      defaultOutputPaths: artifactContracts,
      ...(actualOutputPaths.length === 0 ? {} : { actualOutputPaths }),
    });
    issues.push(...artifactPathResult.issues);
    checkedCategories.add("artifact-path");
    for (const validatedPath of artifactPathResult.validatedPaths) validatedPaths.add(validatedPath);

    const fileIntegrityResult = await validateFileIntegrity({
      projectRoot: input.projectRoot,
      filesIndex: manifestSchemaResult.filesIndex,
      artifactRoot: manifest.paths.artifactRoot,
    });
    issues.push(...fileIntegrityResult.issues);
    checkedCategories.add("file-integrity");
    for (const validatedPath of fileIntegrityResult.validatedPaths) validatedPaths.add(validatedPath);

    const sourceIntegrityResult = validateSourceIntegrity({
      manifest,
    });
    if (sourceIntegrityResult.issues.length > 0 || sourceIntegrityResult.validatedPaths.length > 0) {
      issues.push(...sourceIntegrityResult.issues);
      checkedCategories.add("source-integrity");
      for (const validatedPath of sourceIntegrityResult.validatedPaths) validatedPaths.add(validatedPath);
    }
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

async function discoverLegacyActualOutputPaths(input: {
  projectRoot: string;
  manifestArtifactRoot: string;
  artifactRoots?: readonly ArtifactRootProjection[];
  artifactContracts: readonly ArtifactContract[];
}): Promise<ActualOutputPathEvidence[]> {
  const storyContracts = input.artifactContracts.filter((contract) => contract.artifactType === "story");
  if (storyContracts.length === 0) return [];

  const implementationRoot =
    input.artifactRoots?.find((root) => root.field === "implementation_artifacts")?.resolvedRoot ??
    path.posix.join(input.manifestArtifactRoot, "implementation-artifacts");
  const sprintStatusPaths = [
    ...new Set([
      path.posix.join(implementationRoot, "sprint-status.yaml"),
      path.posix.join(input.manifestArtifactRoot, "implementation-artifacts/sprint-status.yaml"),
    ]),
  ];
  const actualOutputPaths: ActualOutputPathEvidence[] = [];

  for (const sprintStatusPath of sprintStatusPaths) {
    const storyLocationEvidence = await readLegacyStoryLocationEvidence({
      projectRoot: input.projectRoot,
      sprintStatusPath,
    });
    if (storyLocationEvidence === undefined) continue;

    for (const contract of storyContracts) {
      if (storyLocationEvidence.storyLocation === contract.defaultOutputPath) continue;
      actualOutputPaths.push({
        artifactType: contract.artifactType,
        defaultOutputPath: contract.defaultOutputPath,
        actualOutputPath: storyLocationEvidence.storyLocation,
        actualArtifactPaths: storyLocationEvidence.storyArtifactPaths,
      });
    }
  }

  return dedupeActualOutputPathEvidence(actualOutputPaths);
}

async function readLegacyStoryLocationEvidence(input: {
  projectRoot: string;
  sprintStatusPath: string;
}): Promise<{ storyLocation: string; storyArtifactPaths: string[] } | undefined> {
  try {
    const raw = await readFile(path.join(input.projectRoot, input.sprintStatusPath), "utf8");
    const parsed = parseYaml(raw) as unknown;
    if (!isRecord(parsed)) return undefined;
    const storyLocation = parsed.story_location;
    if (typeof storyLocation !== "string" || !isProjectRelativePosixPath(storyLocation)) return undefined;
    const normalizedStoryLocation = storyLocation.replace(/\/+$/g, "");
    const storyKeys = getLegacyDevelopmentStatusStoryKeys(parsed.development_status);
    if (storyKeys.length === 0) return undefined;

    const storyLocationPath = path.join(input.projectRoot, normalizedStoryLocation);
    const storyLocationStat = await stat(storyLocationPath);
    if (!storyLocationStat.isDirectory()) return undefined;

    const expectedStoryFileNames = new Set(storyKeys.map((storyKey) => `${storyKey}.md`));
    const entries = await readdir(storyLocationPath, { withFileTypes: true });
    const storyArtifactPaths = entries
      .filter((entry) => entry.isFile() && expectedStoryFileNames.has(entry.name))
      .map((entry) => path.posix.join(normalizedStoryLocation, entry.name))
      .sort((left, right) => left.localeCompare(right));
    if (storyArtifactPaths.length === 0) return undefined;

    return {
      storyLocation: normalizedStoryLocation,
      storyArtifactPaths,
    };
  } catch {
    return undefined;
  }
}

function getLegacyDevelopmentStatusStoryKeys(value: unknown): string[] {
  if (!isRecord(value)) return [];
  return Object.keys(value)
    .filter(isLegacyStoryKey)
    .sort((left, right) => left.localeCompare(right));
}

function isLegacyStoryKey(value: string): boolean {
  return /^\d+-\d+-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

function dedupeActualOutputPathEvidence(
  entries: readonly ActualOutputPathEvidence[],
): ActualOutputPathEvidence[] {
  const byKey = new Map<string, ActualOutputPathEvidence>();
  for (const entry of entries) {
    const key = [
      entry.artifactType,
      entry.defaultOutputPath,
      entry.actualOutputPath,
      ...(entry.actualArtifactPaths ?? []),
    ].join("\0");
    if (!byKey.has(key)) byKey.set(key, entry);
  }
  return [...byKey.values()].sort(
    (left, right) =>
      left.defaultOutputPath.localeCompare(right.defaultOutputPath) ||
      left.actualOutputPath.localeCompare(right.actualOutputPath) ||
      left.artifactType.localeCompare(right.artifactType),
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
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
