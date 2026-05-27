import path from "node:path";
import type { ValidationIssue } from "../diagnostics/command-result-schema.js";
import { copyCanonicalPackage } from "../fs/copy-tree.js";
import type { FilesIndexEntry, HelpIndexEntry, PhaseCoverageRow, SkillIndexEntry } from "../manifest/manifest-schema.js";
import { hashPackageDirectory } from "../manifest/hash.js";
import type { InstallPlanTargetAdapter } from "../installer/install-plan-schema.js";
import type { ModuleHelpEntry, OfficialModule } from "../modules/module-metadata.js";
import { BUNDLED_SOURCE_DISPLAY_ROOT } from "../source/source-discovery.js";
import { CANONICAL_TARGET_ORDER, type IdeTargetId } from "./adapter-registry.js";

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
}): Promise<IdeMirrorWriteResult> {
  const selectedTargetIds = new Set(input.targetAdapters.map((adapter) => adapter.targetId));
  const orderedTargetIds = CANONICAL_TARGET_ORDER.filter((targetId) => selectedTargetIds.has(targetId));
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
    const canonicalPackageHash = await hashPackageDirectory(sourcePackageRoot);
    const installedTargets: IdeTargetId[] = [];

    for (const targetId of orderedTargetIds) {
      const targetEntryRoot = `${targetId === "claude" ? ".claude/skills" : ".agents/skills"}/${entry.canonicalSkillId}`;
      const copy = await copyCanonicalPackage({
        projectRoot: input.projectRoot,
        sourcePackageRoot,
        sourceRefRoot,
        targetEntryRoot,
      });

      if (!copy.ok) {
        return {
          ok: false,
          issue: {
            ...copy.issue,
            issueId: copy.issue.category === "ide-mirror" ? copy.issue.issueId : "ide-mirror.target-write-failed",
            category: "ide-mirror",
            severity: "error",
            affectedPath: targetEntryRoot,
            component: "ide-mirror-writer",
          },
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
      helpIndexEntries.push({
        schemaVersion: "speclite.help-index.v1",
        phaseId: help.phaseId,
        entryLabel: help.displayName,
        canonicalSkillId: entry.canonicalSkillId,
        activationTarget: help.menuCode ?? entry.canonicalSkillId,
        targetIds: installedTargets,
      });
      phaseCoverageRows.push({
        schemaVersion: "speclite.phase-coverage.v1",
        phaseId: help.phaseId,
        phaseLabel: help.phaseId,
        moduleId: entry.module.code,
        canonicalSkillId: entry.canonicalSkillId,
        ideTargets: orderedTargetIds.map((targetId) => ({
          targetId,
          entryPath: `${targetId === "claude" ? ".claude/skills" : ".agents/skills"}/${entry.canonicalSkillId}`,
          activationTarget: help.menuCode ?? entry.canonicalSkillId,
          status: installedTargets.includes(targetId) ? "mapped" : "unsupported",
        })),
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
