import path from "node:path";
import type { CommandPathSummary, IdeTargetStatus } from "../diagnostics/command-result-schema.js";
import { CANONICAL_TARGET_ORDER, getIdeAdapterRegistry, type IdeTargetId } from "../ide/adapter-registry.js";
import type { SourceDescriptor } from "../source/source-descriptor-schema.js";
import type {
  PhaseCoverageRow,
  FilesIndex,
  FilesIndexEntry,
  HelpIndex,
  HelpIndexEntry,
  Manifest,
  PhaseCoverage,
  SkillIndex,
  SkillIndexEntry,
} from "./manifest-schema.js";

export function createInstalledManifest(input: {
  sourceDescriptor: SourceDescriptor;
  installedModules: string[];
  targetIds: Array<"claude" | "agents">;
  paths: Required<CommandPathSummary>;
}): Manifest {
  return {
    schemaVersion: "speclite.manifest.v1",
    sourceDescriptor: input.sourceDescriptor,
    installedModules: input.installedModules,
    targetIds: input.targetIds,
    paths: input.paths,
  };
}

export function createSkillIndex(entries: SkillIndexEntry[]): SkillIndex {
  return {
    schemaVersion: "speclite.skill-index.v1",
    entries,
  };
}

export function createHelpIndex(entries: HelpIndexEntry[]): HelpIndex {
  return {
    schemaVersion: "speclite.help-index.v1",
    entries,
  };
}

export function createFilesIndex(entries: FilesIndexEntry[]): FilesIndex {
  return {
    schemaVersion: "speclite.files-index.v1",
    entries: [...entries].sort((left, right) => left.path.localeCompare(right.path)),
  };
}

export function createPhaseCoverage(rows: PhaseCoverageRow[]): PhaseCoverage {
  return {
    schemaVersion: "speclite.phase-coverage.v1",
    rows: [...rows]
      .map((row) => ({
        ...row,
        ideTargets: sortIdeTargets(row.ideTargets),
      }))
      .sort((left, right) =>
        `${left.phaseId}:${left.moduleId}:${left.canonicalSkillId}`.localeCompare(
          `${right.phaseId}:${right.moduleId}:${right.canonicalSkillId}`,
        ),
      ),
  };
}

export function createInstalledSkillEntryPath(input: {
  targetId: IdeTargetId;
  canonicalSkillId: string;
}): string {
  const adapter = getIdeAdapterRegistry().find((candidate) => candidate.id === input.targetId);
  const targetDirectory = adapter?.targetDirectory ?? ".agents/skills";
  return `${targetDirectory}/${input.canonicalSkillId}`;
}

export function createInstalledSkillActivationTarget(input: {
  targetId: IdeTargetId;
  canonicalSkillId: string;
}): string {
  return `${createInstalledSkillEntryPath(input)}/SKILL.md`;
}

export function choosePrimaryInstalledSkillActivationTarget(input: {
  canonicalSkillId: string;
  installedTargets: IdeTargetId[];
}): string | undefined {
  const targetId = CANONICAL_TARGET_ORDER.find((candidate) =>
    input.installedTargets.includes(candidate),
  );
  if (targetId === undefined) return undefined;
  return createInstalledSkillActivationTarget({
    targetId,
    canonicalSkillId: input.canonicalSkillId,
  });
}

export type ArtifactRootContext = {
  output_folder: string;
  planning_artifacts: string;
  implementation_artifacts: string;
  project_knowledge: string;
};

export function getPhaseLabel(phaseId: string): string {
  const labels: Record<string, string> = {
    anytime: "Anytime",
    "1-analysis": "Analysis",
    "2-planning": "Planning",
    "3-solutioning": "Solutioning",
    "4-implementation": "Implementation",
  };

  return labels[phaseId] ?? phaseId;
}

export function createArtifactContract(input: {
  outputLocation: string | undefined;
  outputArtifactType: string | undefined;
  artifactRoots: ArtifactRootContext;
}): PhaseCoverageRow["artifactContract"] | undefined {
  if (
    input.outputLocation === undefined ||
    input.outputArtifactType === undefined ||
    input.outputLocation.includes("|")
  ) {
    return undefined;
  }

  const normalizedPath = normalizeArtifactOutputPath(input.outputLocation, input.artifactRoots);
  if (normalizedPath === undefined) {
    return undefined;
  }

  const artifactType = normalizeArtifactType(input.outputArtifactType);
  if (artifactType === undefined) {
    return undefined;
  }

  return {
    artifactType,
    defaultOutputPath: normalizedPath,
    requiredMetadata: ["workflowType", "sourceSkill", "generatedAt"],
  };
}

function normalizeArtifactOutputPath(
  outputLocation: string,
  artifactRoots: ArtifactRootContext,
): string | undefined {
  if (outputLocation.includes("{project-root}")) {
    return undefined;
  }

  const resolved = outputLocation
    .replaceAll("{output_folder}", artifactRoots.output_folder)
    .replaceAll("{planning_artifacts}", artifactRoots.planning_artifacts)
    .replaceAll("{implementation_artifacts}", artifactRoots.implementation_artifacts)
    .replaceAll("{project_knowledge}", artifactRoots.project_knowledge);

  if (resolved.includes("{") || resolved.includes("}") || resolved.trim().length === 0) {
    return undefined;
  }

  const normalizedPosix = normalizeProjectRelativePosixPath(resolved);
  if (normalizedPosix === undefined) {
    return undefined;
  }

  const eligibleRoots = [
    artifactRoots.output_folder,
    artifactRoots.planning_artifacts,
    artifactRoots.implementation_artifacts,
  ]
    .map(normalizeProjectRelativePosixPath)
    .filter((root): root is string => root !== undefined);

  if (
    eligibleRoots.some(
      (root) => normalizedPosix === root || normalizedPosix.startsWith(`${root}/`),
    )
  ) {
    return normalizedPosix;
  }

  return undefined;
}

function normalizeProjectRelativePosixPath(value: string): string | undefined {
  const normalized = path.posix
    .normalize(value.trim().replaceAll("\\", "/").replace(/\/+/g, "/"))
    .replace(/\/+$/g, "");

  if (
    normalized === "." ||
    normalized === ".." ||
    normalized.startsWith("../") ||
    normalized.startsWith("/") ||
    /^[A-Za-z]:(?:\/|$)/.test(normalized)
  ) {
    return undefined;
  }

  return normalized;
}

function normalizeArtifactType(value: string): string | undefined {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized.length > 0 ? normalized : undefined;
}

function sortIdeTargets(targets: PhaseCoverageRow["ideTargets"]): PhaseCoverageRow["ideTargets"] {
  return [...targets].sort(
    (left, right) =>
      CANONICAL_TARGET_ORDER.indexOf(left.targetId) - CANONICAL_TARGET_ORDER.indexOf(right.targetId),
  );
}

export function createConfiguredIdeTargets(input: {
  targetIds: Array<"claude" | "agents">;
  skillCounts: Map<"claude" | "agents", number>;
}): IdeTargetStatus[] {
  return input.targetIds.map((targetId) => ({
    id: targetId,
    status: "configured",
    targetPath: targetId === "claude" ? ".claude/skills" : ".agents/skills",
    skillCount: input.skillCounts.get(targetId) ?? 0,
  }));
}
