import path from "node:path";
import type { ValidationIssue } from "../diagnostics/command-result-schema.js";
import { copyCanonicalPackage, isInstallableCanonicalPackageFile } from "../fs/copy-tree.js";
import type { FilesIndexEntry, HelpIndexEntry, PhaseCoverageRow, SkillIndexEntry } from "../manifest/manifest-schema.js";
import {
  choosePrimaryInstalledSkillActivationTarget,
  createArtifactContract,
  createInstalledSkillActivationTarget,
  createInstalledSkillEntryPath,
  getPhaseLabel,
  type ArtifactRootContext,
} from "../manifest/manifest-generator.js";
import { hashPackageDirectory } from "../manifest/hash.js";
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

export async function writeIdeMirrors(input: {
  projectRoot: string;
  packageRoot: string;
  selectedModules: OfficialModule[];
  targetAdapters: InstallPlanTargetAdapter[];
  artifactRoots: ArtifactRootContext;
}): Promise<IdeMirrorWriteResult> {
  const selectedTargetIds = new Set(input.targetAdapters.map((adapter) => adapter.targetId));
  const orderedTargetIds = CANONICAL_TARGET_ORDER.filter((targetId) => selectedTargetIds.has(targetId));
  const adaptersById = new Map(getIdeAdapterRegistry().map((adapter) => [adapter.id, adapter]));
  const packageEntries = createPackageEntries(input.selectedModules);
  const skillIndexEntries: SkillIndexEntry[] = [];
  const helpIndexEntries: HelpIndexEntry[] = [];
  const phaseCoverageRows: PhaseCoverageRow[] = [];
  const files: FilesIndexEntry[] = [];
  const targetSkillCounts = new Map<IdeTargetId, number>();

  for (const targetId of orderedTargetIds) {
    targetSkillCounts.set(targetId, 0);
  }

  for (const entry of packageEntries) {
    const sourcePackageRoot = path.join(
      input.packageRoot,
      BUNDLED_SOURCE_DISPLAY_ROOT,
      entry.module.sourceDirectory,
      entry.packageRoot,
    );
    const sourceRefRoot = `${BUNDLED_SOURCE_DISPLAY_ROOT}/${entry.module.sourceDirectory}/${entry.packageRoot}`;
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
      const copy = await copyCanonicalPackage({
        projectRoot: input.projectRoot,
        sourcePackageRoot,
        sourceRefRoot,
        targetEntryRoot,
      });

      if (!copy.ok) {
        return {
          ok: false,
          issue: mapCopyFailureToTargetIssue(copy.issue, targetEntryRoot),
        };
      }

      files.push(...copy.files);
      installedTargets.push(targetId);
      targetSkillCounts.set(targetId, (targetSkillCounts.get(targetId) ?? 0) + 1);
    }

    const phaseIds = uniqueSorted(entry.helpEntries.map((help) => help.phaseId));
    skillIndexEntries.push({
      schemaVersion: "speclite.skill-index.v1",
      canonicalSkillId: entry.canonicalSkillId,
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
    files: files.sort((left, right) => left.path.localeCompare(right.path)),
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
  helpEntries: ModuleHelpEntry[];
}> {
  const entries = modules.flatMap((module) =>
    module.packageRoots.map((packageRoot) => {
      const canonicalSkillId = path.posix.basename(packageRoot);
      return {
        module,
        packageRoot,
        canonicalSkillId,
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
