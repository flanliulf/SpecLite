import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import type {
  CommandPathSummary,
  IdeTargetStatus,
  StatusCommandData,
  ValidationIssue,
} from "../diagnostics/command-result-schema.js";
import { createInstallPathSummary } from "../fs/path-normalizer.js";
import { CANONICAL_TARGET_ORDER, getIdeAdapterRegistry, type IdeTargetId } from "../ide/adapter-registry.js";
import { ManifestSchema, SkillIndexSchema, type Manifest, type SkillIndex } from "../manifest/manifest-schema.js";
import {
  createArtifactRootProjections,
  resolveArtifactRootsFromProjectConfig,
} from "../config/artifact-root-resolver.js";

export type StatusSummaryTargetHealth = IdeTargetStatus["status"];
export type HighLevelHealth = StatusCommandData["highLevelHealth"];

export type HealthAggregationInput = {
  manifestPresent: boolean;
  manifestReadable: boolean;
  installedModules: string[];
  ideTargets: IdeTargetStatus[];
  requiredPathsPresent: boolean;
};

export type InstalledStateSummary = {
  data: StatusCommandData;
  issues: ValidationIssue[];
  summary: string;
  nextActions: string[];
};

type SkillIndexReadResult =
  | {
      kind: "missing";
    }
  | {
      kind: "invalid";
    }
  | {
      kind: "valid";
      skillIndex: SkillIndex;
    };

const CONFIG_ROOT = "_speclite/_config";
const MANIFEST_PATH = "_speclite/_config/manifest.yaml";
const SKILL_INDEX_PATH = "_speclite/_config/skill-index.json";

export async function readInstalledStateSummary(input: {
  projectRoot: string;
}): Promise<InstalledStateSummary> {
  const paths = createInstallPathSummary();
  const manifestResult = await readManifest(input.projectRoot);

  if (manifestResult.kind === "missing") {
    const data: StatusCommandData = {
      manifestPresent: false,
      installedModules: [],
      ideTargets: [],
      highLevelHealth: "not-configured",
      paths,
    };

    return {
      data,
      issues: [],
      summary: "SpecLite is not configured in this project.",
      nextActions: ["Run speclite install to configure this project."],
    };
  }

  if (manifestResult.kind === "invalid") {
    const data: StatusCommandData = {
      manifestPresent: true,
      installedModules: [],
      ideTargets: [],
      highLevelHealth: aggregateStatusHealth({
        manifestPresent: true,
        manifestReadable: false,
        installedModules: [],
        ideTargets: [],
        requiredPathsPresent: false,
      }),
      paths,
    };

    return {
      data,
      issues: [],
      summary: "SpecLite installed-state manifest is present but unreadable.",
      nextActions: ["Run speclite validate for complete installed-state issue details."],
    };
  }

  const manifest = manifestResult.manifest;
  const skillIndexResult = await readSkillIndex(input.projectRoot);
  const resolvedPathResult = await resolveExistingStatusPaths({
    projectRoot: input.projectRoot,
    manifestPaths: manifest.paths,
  });
  const ideTargets = await summarizeIdeTargets({
    projectRoot: input.projectRoot,
    manifest,
    skillIndexResult,
  });
  const requiredPathsPresent = await requiredRuntimePathsPresent({
    projectRoot: input.projectRoot,
    paths: resolvedPathResult.paths,
  });
  const hasBlockingRootResolutionIssue = hasBlockingStatusRootResolutionIssue(
    resolvedPathResult.issues,
  );
  const highLevelHealth = hasBlockingRootResolutionIssue
    ? "failed"
    : aggregateStatusHealth({
        manifestPresent: true,
        manifestReadable: true,
        installedModules: manifest.installedModules,
        ideTargets,
        requiredPathsPresent,
      });
  const data: StatusCommandData = {
    sourceDescriptor: manifest.sourceDescriptor,
    manifestPresent: true,
    manifestVersion: manifest.schemaVersion,
    installedModules: manifest.installedModules,
    ideTargets,
    highLevelHealth,
    paths: resolvedPathResult.paths,
  };

  return {
    data,
    issues: resolvedPathResult.issues,
    summary: createStatusSummary(highLevelHealth),
    nextActions: hasBlockingRootResolutionIssue
      ? ["Fix the reported runtime config issue and rerun speclite status."]
      : createStatusNextActions(highLevelHealth),
  };
}

async function resolveExistingStatusPaths(input: {
  projectRoot: string;
  manifestPaths: CommandPathSummary;
}): Promise<{ paths: CommandPathSummary; issues: ValidationIssue[] }> {
  const rootResult = await resolveArtifactRootsFromProjectConfig({
    projectRoot: input.projectRoot,
    lifecycle: "existing",
  });
  if (!rootResult.ok) {
    if (!hasBlockingStatusRootResolutionIssue(rootResult.issues)) {
      return {
        paths: input.manifestPaths,
        issues: [],
      };
    }

    const { artifactRoots: _artifactRoots, ...safeManifestPaths } = input.manifestPaths;
    return {
      paths: safeManifestPaths,
      issues: rootResult.issues,
    };
  }

  return {
    paths: {
      ...input.manifestPaths,
      artifactRoots: createArtifactRootProjections(rootResult.roots),
    },
    issues: rootResult.issues,
  };
}

export function aggregateStatusHealth(input: HealthAggregationInput): HighLevelHealth {
  if (!input.manifestPresent) return "not-configured";
  if (!input.manifestReadable) return "failed";
  if (input.ideTargets.some((target) => target.status === "failed")) return "failed";
  if (input.installedModules.length === 0) return "partial";
  if (!input.requiredPathsPresent) return "partial";
  if (
    input.ideTargets.some(
      (target) => target.status === "not-configured" || target.status === "partial",
    )
  ) {
    return "partial";
  }

  return "configured";
}

async function readManifest(
  projectRoot: string,
): Promise<
  | {
      kind: "missing";
    }
  | {
      kind: "invalid";
    }
  | {
      kind: "valid";
      manifest: Manifest;
    }
> {
  try {
    const raw = await readFile(path.join(projectRoot, MANIFEST_PATH), "utf8");
    const parsed = ManifestSchema.safeParse(parseYaml(raw));
    if (!parsed.success) return { kind: "invalid" };
    return { kind: "valid", manifest: parsed.data };
  } catch (error) {
    if (isMissingFileError(error)) {
      return { kind: "missing" };
    }
    return { kind: "invalid" };
  }
}

async function readSkillIndex(projectRoot: string): Promise<SkillIndexReadResult> {
  try {
    const raw = await readFile(path.join(projectRoot, SKILL_INDEX_PATH), "utf8");
    const parsed = SkillIndexSchema.safeParse(JSON.parse(raw));
    return parsed.success ? { kind: "valid", skillIndex: parsed.data } : { kind: "invalid" };
  } catch (error) {
    if (isMissingFileError(error)) {
      return { kind: "missing" };
    }
    return { kind: "invalid" };
  }
}

async function summarizeIdeTargets(input: {
  projectRoot: string;
  manifest: Manifest;
  skillIndexResult: SkillIndexReadResult;
}): Promise<IdeTargetStatus[]> {
  const selectedTargets = new Set<IdeTargetId>(input.manifest.targetIds);
  const installedSkillTargets = new Map<IdeTargetId, Set<string>>();

  for (const targetId of CANONICAL_TARGET_ORDER) {
    installedSkillTargets.set(targetId, new Set());
  }

  const skillIndex = input.skillIndexResult.kind === "valid" ? input.skillIndexResult.skillIndex : undefined;

  for (const entry of skillIndex?.entries ?? []) {
    for (const targetId of entry.installedTargets) {
      installedSkillTargets.get(targetId)?.add(entry.canonicalSkillId);
    }
  }

  const targets: IdeTargetStatus[] = [];
  for (const adapter of getIdeAdapterRegistry()) {
    if (!selectedTargets.has(adapter.id)) continue;

    const targetRoot = path.join(input.projectRoot, adapter.targetDirectory);
    const skillCount = await countSkillDirectories(targetRoot);
    const indexedSkillCount = installedSkillTargets.get(adapter.id)?.size ?? 0;
    const targetSummary = summarizeTargetHealth({
      skillCount,
      indexedSkillCount,
      skillIndexState: input.skillIndexResult.kind,
      targetPath: adapter.targetDirectory,
    });

    targets.push({
      id: adapter.id,
      status: targetSummary.status,
      targetPath: adapter.targetDirectory,
      skillCount,
      ...(targetSummary.reason === undefined ? {} : { reason: targetSummary.reason }),
      ...(targetSummary.affectedPath === undefined ? {} : { affectedPath: targetSummary.affectedPath }),
    });
  }

  return targets;
}

function summarizeTargetHealth(input: {
  skillCount: number;
  indexedSkillCount: number;
  skillIndexState: SkillIndexReadResult["kind"];
  targetPath: string;
}): {
  status: StatusSummaryTargetHealth;
  reason?: string;
  affectedPath?: string;
} {
  if (input.skillIndexState === "invalid") {
    return {
      status: "failed",
      reason: "skill-index is present but unreadable or invalid.",
      affectedPath: SKILL_INDEX_PATH,
    };
  }
  if (input.skillIndexState === "missing") {
    return {
      status: "partial",
      reason: "skill-index is missing for this target.",
      affectedPath: SKILL_INDEX_PATH,
    };
  }
  if (input.indexedSkillCount === 0) {
    return {
      status: "partial",
      reason: "skill-index has no installed entries for this target.",
      affectedPath: input.targetPath,
    };
  }
  if (input.skillCount === 0) {
    return {
      status: "partial",
      reason: "target directory has no installed skill directories.",
      affectedPath: input.targetPath,
    };
  }
  if (input.skillCount < input.indexedSkillCount) {
    return {
      status: "partial",
      reason: "target directory contains fewer skill directories than skill-index records.",
      affectedPath: input.targetPath,
    };
  }
  return { status: "configured" };
}

async function countSkillDirectories(targetRoot: string): Promise<number> {
  try {
    const entries = await readdir(targetRoot, { withFileTypes: true });
    return entries.filter((entry) => entry.isDirectory()).length;
  } catch (error) {
    if (isMissingFileError(error)) return 0;
    return 0;
  }
}

async function requiredRuntimePathsPresent(input: {
  projectRoot: string;
  paths: CommandPathSummary;
}): Promise<boolean> {
  const required = [
    input.paths.specliteRoot,
    input.paths.artifactRoot,
    input.paths.manifestPath,
    CONFIG_ROOT,
    ...(input.paths.artifactRoots ?? []).map((root) => root.resolvedRoot),
  ].filter((value): value is string => value !== undefined);

  for (const relativePath of required) {
    try {
      await readOrList(path.join(input.projectRoot, relativePath));
    } catch {
      return false;
    }
  }

  return true;
}

async function readOrList(targetPath: string): Promise<void> {
  try {
    await readFile(targetPath);
  } catch (error) {
    if (isDirectoryError(error)) {
      await readdir(targetPath);
      return;
    }
    throw error;
  }
}

function createStatusSummary(health: HighLevelHealth): string {
  if (health === "configured") return "SpecLite installed-state summary is configured.";
  if (health === "partial") return "SpecLite installed-state summary is partial.";
  if (health === "failed") return "SpecLite installed-state summary failed lightweight checks.";
  return "SpecLite is not configured in this project.";
}

function createStatusNextActions(health: HighLevelHealth): string[] {
  if (health === "configured") {
    return ["Run speclite validate when deeper local validation is needed."];
  }
  if (health === "not-configured") {
    return ["Run speclite install to configure this project."];
  }
  return ["Run speclite validate for complete installed-state issue details."];
}

function hasBlockingIssue(issues: readonly ValidationIssue[]): boolean {
  return issues.some((issue) => issue.severity === "error" || issue.severity === "critical");
}

function hasBlockingStatusRootResolutionIssue(issues: readonly ValidationIssue[]): boolean {
  return issues.some((issue) => hasBlockingIssue([issue]) && !isNonBlockingStatusRootResolutionIssue(issue));
}

function isNonBlockingStatusRootResolutionIssue(issue: ValidationIssue): boolean {
  return (
    (issue.issueId === "runtime-path.missing-entry" &&
      issue.component === "config-resolver" &&
      issue.affectedPath === "_speclite/config.toml" &&
      issue.details?.status === "missing") ||
    (issue.issueId === "artifact-path.missing-required-artifact" &&
      issue.component === "artifact-root-resolver" &&
      issue.details?.reason === "missing-required-config")
  );
}

function isMissingFileError(error: unknown): boolean {
  return isNodeError(error) && error.code === "ENOENT";
}

function isDirectoryError(error: unknown): boolean {
  return isNodeError(error) && error.code === "EISDIR";
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}
