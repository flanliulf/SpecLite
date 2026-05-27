import type { CommandPathSummary, IdeTargetStatus } from "../diagnostics/command-result-schema.js";
import type { SourceDescriptor } from "../source/source-descriptor-schema.js";
import type {
  FilesIndex,
  FilesIndexEntry,
  HelpIndex,
  HelpIndexEntry,
  Manifest,
  PhaseCoverage,
  PhaseCoverageRow,
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
    rows,
  };
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
