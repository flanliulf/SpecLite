import path from "node:path";
import type { ValidationIssue } from "../diagnostics/command-result-schema.js";
import { readFile, stat } from "node:fs/promises";
import { isInstallableCanonicalPackageFile } from "../fs/copy-tree.js";
import { safeWriteFile } from "../fs/safe-write.js";
import type { FilesIndexEntry, HelpIndexEntry, PhaseCoverageRow, SkillIndexEntry } from "../manifest/manifest-schema.js";
import {
  choosePrimaryInstalledSkillActivationTarget,
  createArtifactContract,
  createInstalledSkillActivationTarget,
  createInstalledSkillEntryPath,
  getPhaseLabel,
  type ArtifactRootContext,
} from "../manifest/manifest-generator.js";
import { hashBytes, hashPackageDirectory, isExecutableMode, listFiles } from "../manifest/hash.js";
import type { InstallPlanTargetAdapter } from "../installer/install-plan-schema.js";
import type { ModuleHelpEntry, OfficialModule } from "../modules/module-metadata.js";
import { BUNDLED_SOURCE_DISPLAY_ROOT } from "../source/source-discovery.js";
import { CANONICAL_TARGET_ORDER, getIdeAdapterRegistry, type IdeTargetId } from "./adapter-registry.js";

export type IdeMirrorWriteResult =
  | {
      ok: true;
      skillIndexEntries: SkillIndexEntry[];
      helpIndexEntries: HelpIndexEntry[];
      phaseCoverageRows: PhaseCoverageRow[];
      files: FilesIndexEntry[];
      targetSkillCounts: Map<IdeTargetId, number>;
    }
  | {
      ok: false;
      issue: ValidationIssue;
    };

export type IdeMirrorProjectionFile = {
  entry: FilesIndexEntry;
  contents: Buffer;
};

export type IdeMirrorProjectionResult =
  | {
      ok: true;
      skillIndexEntries: SkillIndexEntry[];
      helpIndexEntries: HelpIndexEntry[];
      phaseCoverageRows: PhaseCoverageRow[];
      files: IdeMirrorProjectionFile[];
      targetSkillCounts: Map<IdeTargetId, number>;
    }
  | {
      ok: false;
      issue: ValidationIssue;
    };

export async function writeIdeMirrors(input: {
  projectRoot: string;
  packageRoot: string;
  sourceRoot?: string;
  sourceRefRoot?: string;
  selectedModules: OfficialModule[];
  targetAdapters: InstallPlanTargetAdapter[];
  artifactRoots: ArtifactRootContext;
  onChangedPath?: (relativePath: string) => void;
}): Promise<IdeMirrorWriteResult> {
  const projection = await buildIdeMirrorProjection(input);
  if (!projection.ok) return projection;

  for (const file of projection.files) {
    const write = await safeWriteFile({
      projectRoot: input.projectRoot,
      relativePath: file.entry.path,
      contents: file.contents,
      executable: file.entry.executable,
      component: "ide-mirror-writer",
    });
    if (!write.ok) {
      return {
        ok: false,
        issue: mapCopyFailureToTargetIssue(write.issue, path.posix.dirname(file.entry.path)),
      };
    }
    input.onChangedPath?.(write.path);
  }

  return {
    ok: true,
    skillIndexEntries: projection.skillIndexEntries,
    helpIndexEntries: projection.helpIndexEntries,
    phaseCoverageRows: projection.phaseCoverageRows,
    files: projection.files.map((file) => file.entry),
    targetSkillCounts: projection.targetSkillCounts,
  };
}

export async function buildIdeMirrorProjection(input: {
  packageRoot: string;
  sourceRoot?: string;
  sourceRefRoot?: string;
  selectedModules: OfficialModule[];
  targetAdapters: InstallPlanTargetAdapter[];
  artifactRoots: ArtifactRootContext;
}): Promise<IdeMirrorProjectionResult> {
  try {
    return await buildIdeMirrorProjectionUnsafe(input);
  } catch (error) {
    return {
      ok: false,
      issue: {
        issueId: "ide-mirror.source-read-failed",
        category: "ide-mirror",
        severity: "error",
        component: "ide-mirror-writer",
        details: {
          reason: "canonical-source-io-failed",
          errorCode: error instanceof Error && "code" in error ? String(error.code) : "unknown",
        },
        impact: "The canonical skill projection could not be proven because source package I/O failed.",
        suggestedNextStep: "Restore readable canonical package files and rerun the command.",
      },
    };
  }
}

async function buildIdeMirrorProjectionUnsafe(input: {
  packageRoot: string;
  sourceRoot?: string;
  sourceRefRoot?: string;
  selectedModules: OfficialModule[];
  targetAdapters: InstallPlanTargetAdapter[];
  artifactRoots: ArtifactRootContext;
}): Promise<IdeMirrorProjectionResult> {
  const selectedTargetIds = new Set(input.targetAdapters.map((adapter) => adapter.targetId));
  const orderedTargetIds = CANONICAL_TARGET_ORDER.filter((targetId) => selectedTargetIds.has(targetId));
  const adaptersById = new Map(getIdeAdapterRegistry().map((adapter) => [adapter.id, adapter]));
  const packageEntries = createPackageEntries(input.selectedModules);
  const canonicalSourceRoot =
    input.sourceRoot ?? path.join(input.packageRoot, BUNDLED_SOURCE_DISPLAY_ROOT);
  const canonicalSourceRefRoot = input.sourceRefRoot ?? BUNDLED_SOURCE_DISPLAY_ROOT;
  const skillIndexEntries: SkillIndexEntry[] = [];
  const helpIndexEntries: HelpIndexEntry[] = [];
  const phaseCoverageRows: PhaseCoverageRow[] = [];
  const files: IdeMirrorProjectionFile[] = [];
  const targetSkillCounts = new Map<IdeTargetId, number>();

  for (const targetId of orderedTargetIds) {
    targetSkillCounts.set(targetId, 0);
  }

  for (const entry of packageEntries) {
    const sourcePackageRoot = path.join(
      canonicalSourceRoot,
      entry.module.sourceDirectory,
      entry.packageRoot,
    );
    const sourceRefRoot = `${canonicalSourceRefRoot}/${entry.module.sourceDirectory}/${entry.packageRoot}`;
    const canonicalPackageHash = await hashPackageDirectory(sourcePackageRoot, {
      include: isInstallableCanonicalPackageFile,
    });
    const installedTargets: IdeTargetId[] = [];

    for (const targetId of orderedTargetIds) {
      const adapter = adaptersById.get(targetId);
      if (adapter === undefined || adapter.entryType !== "self-contained-skill") {
        return {
          ok: false,
          issue: {
            issueId: "ide-mirror.unsupported-target",
            category: "ide-mirror",
            severity: "error",
            component: "adapter-registry",
            details: {
              targetId,
              reason: "missing-self-contained-skill-adapter",
            },
            impact: "The selected IDE target does not support self-contained skill entry mapping.",
            suggestedNextStep: "Select an IDE target from the supported adapter registry.",
          },
        };
      }
      const targetEntryRoot = `${adapter.targetDirectory}/${entry.canonicalSkillId}`;
      const sourceFiles = await listFiles(sourcePackageRoot);
      if (!sourceFiles.includes("SKILL.md")) {
        return {
          ok: false,
          issue: {
            issueId: "menu-target.missing-target",
            category: "menu-target",
            severity: "error",
            affectedPath: sourceRefRoot,
            component: "ide-mirror-writer",
            details: { reason: "missing-skill-md" },
            impact: "The canonical skill package cannot be mapped because SKILL.md is missing.",
            suggestedNextStep: "Restore SKILL.md in the canonical source package before installing IDE skill entries.",
          },
        };
      }
      for (const relativeFile of sourceFiles.filter(isInstallableCanonicalPackageFile)) {
        const sourceFile = path.join(sourcePackageRoot, relativeFile);
        const contents = await readFile(sourceFile);
        const executable = isExecutableMode((await stat(sourceFile)).mode);
        const targetPath = `${targetEntryRoot}/${relativeFile}`;
        files.push({
          contents,
          entry: {
            schemaVersion: "speclite.files-index.v1",
            path: targetPath,
            ownership: "installer-owned",
            hash: hashBytes(contents),
            hashAlgorithm: "sha256",
            executable,
            artifactKind: "ide-skill-package",
            sourceRef: `${sourceRefRoot}/${relativeFile}`,
          },
        });
      }
      installedTargets.push(targetId);
      targetSkillCounts.set(targetId, (targetSkillCounts.get(targetId) ?? 0) + 1);
    }

    const phaseIds = uniqueSorted(entry.helpEntries.map((help) => help.phaseId));
    skillIndexEntries.push({
      schemaVersion: "speclite.skill-index.v1",
      canonicalSkillId: entry.canonicalSkillId,
      ...(entry.renamedFromCanonicalSkillIds.length === 0
        ? {}
        : { renamedFromCanonicalSkillIds: entry.renamedFromCanonicalSkillIds }),
      moduleId: entry.module.code,
      sourcePackagePath: sourceRefRoot,
      canonicalPackageHash,
      installedTargets,
      phaseIds: phaseIds.length === 0 ? ["anytime"] : phaseIds,
    });

    for (const help of entry.helpEntries) {
      const artifactContract = createArtifactContract({
        outputLocation: help.outputLocation,
        outputArtifactType: help.outputArtifactType,
        artifactRoots: input.artifactRoots,
      });
      helpIndexEntries.push({
        schemaVersion: "speclite.help-index.v1",
        phaseId: help.phaseId,
        entryLabel: help.displayName,
        canonicalSkillId: entry.canonicalSkillId,
        activationTarget:
          choosePrimaryInstalledSkillActivationTarget({
            canonicalSkillId: entry.canonicalSkillId,
            installedTargets,
          }) ?? createInstalledSkillActivationTarget({
            targetId: "claude",
            canonicalSkillId: entry.canonicalSkillId,
          }),
        targetIds: installedTargets,
      });
      phaseCoverageRows.push({
        schemaVersion: "speclite.phase-coverage.v1",
        phaseId: help.phaseId,
        phaseLabel: getPhaseLabel(help.phaseId),
        moduleId: entry.module.code,
        canonicalSkillId: entry.canonicalSkillId,
        ideTargets: orderedTargetIds.map((targetId) => ({
          ...createMappedTargetProjection({
            targetId,
            canonicalSkillId: entry.canonicalSkillId,
            mapped: installedTargets.includes(targetId),
          }),
        })),
        ...(artifactContract === undefined ? {} : { artifactContract }),
      });
    }
  }

  return {
    ok: true,
    skillIndexEntries: skillIndexEntries.sort((left, right) =>
      left.canonicalSkillId.localeCompare(right.canonicalSkillId),
    ),
    helpIndexEntries: helpIndexEntries.sort((left, right) =>
      `${left.phaseId}:${left.canonicalSkillId}:${left.entryLabel}`.localeCompare(
        `${right.phaseId}:${right.canonicalSkillId}:${right.entryLabel}`,
      ),
    ),
    phaseCoverageRows: phaseCoverageRows.sort((left, right) =>
      `${left.phaseId}:${left.moduleId}:${left.canonicalSkillId}`.localeCompare(
        `${right.phaseId}:${right.moduleId}:${right.canonicalSkillId}`,
      ),
    ),
    files: files.sort((left, right) => left.entry.path.localeCompare(right.entry.path)),
    targetSkillCounts,
  };
}

function mapCopyFailureToTargetIssue(
  issue: ValidationIssue,
  targetEntryRoot: string,
): ValidationIssue {
  if (issue.category === "menu-target") {
    return issue;
  }

  return {
    ...issue,
    issueId: issue.category === "ide-mirror" ? issue.issueId : "ide-mirror.target-write-failed",
    category: "ide-mirror",
    severity: "error",
    affectedPath: targetEntryRoot,
    component: "ide-mirror-writer",
  };
}

function createMappedTargetProjection(input: {
  targetId: IdeTargetId;
  canonicalSkillId: string;
  mapped: boolean;
}): PhaseCoverageRow["ideTargets"][number] {
  const entryPath = createInstalledSkillEntryPath({
    targetId: input.targetId,
    canonicalSkillId: input.canonicalSkillId,
  });

  return {
    targetId: input.targetId,
    entryPath,
    activationTarget: createInstalledSkillActivationTarget({
      targetId: input.targetId,
      canonicalSkillId: input.canonicalSkillId,
    }),
    status: input.mapped ? "mapped" : "unsupported",
  };
}

function createPackageEntries(modules: OfficialModule[]): Array<{
  module: OfficialModule;
  packageRoot: string;
  canonicalSkillId: string;
  renamedFromCanonicalSkillIds: string[];
  helpEntries: ModuleHelpEntry[];
}> {
  const entries = modules.flatMap((module) =>
    module.packageRoots.map((packageRoot) => {
      const canonicalSkillId = path.posix.basename(packageRoot);
      return {
        module,
        packageRoot,
        canonicalSkillId,
        renamedFromCanonicalSkillIds: module.skillRenames?.[canonicalSkillId] ?? [],
        helpEntries: module.helpEntries.filter((help) => help.canonicalSkillId === canonicalSkillId),
      };
    }),
  );

  return entries.sort((left, right) =>
    `${left.module.code}:${left.canonicalSkillId}`.localeCompare(
      `${right.module.code}:${right.canonicalSkillId}`,
    ),
  );
}

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values)].sort();
}
