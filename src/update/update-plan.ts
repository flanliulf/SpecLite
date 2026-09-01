import { access, lstat, readFile, unlink } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";
import { resolveProjectConfig } from "../config/config-reader.js";
import { resolveSkillCustomization } from "../config/customization-reader.js";
import type {
  RepairCommandData,
  UpdateCommandData,
  ValidationIssue,
} from "../diagnostics/command-result-schema.js";
import { SourceDescriptorSchema, type SourceDescriptor } from "../source/source-descriptor-schema.js";
import { discoverBundledSourceDescriptor } from "../source/source-discovery.js";
import { hashBytes, hashFile } from "../manifest/hash.js";
import { hashPackageDirectory, listFiles } from "../manifest/hash.js";
import {
  FilesIndexSchema,
  type FilesIndexEntry,
  type Manifest,
  type FilesIndex,
  type SkillIndex,
  SkillIndexSchema,
  isProjectRelativePosixPath,
} from "../manifest/manifest-schema.js";
import { resolveProjectRelativePath } from "../fs/path-normalizer.js";
import { safeWriteFile } from "../fs/safe-write.js";
import { isInstallableCanonicalPackageFile } from "../fs/copy-tree.js";
import {
  createMissingSourceEvidenceConflict,
  detectFilesIndexEntryConflict,
  detectIdeMirrorConflicts,
} from "./conflict-detector.js";
import { classifyOwnership } from "./ownership-model.js";
import { CANONICAL_TARGET_ORDER, getIdeAdapterRegistry } from "../ide/adapter-registry.js";
import { isCanonicalPackageHashFile } from "../validation/rules/ide-mirror.js";
import { discoverOfficialModules } from "../modules/module-metadata.js";
import { buildIdeMirrorProjection } from "../ide/target-writer.js";
import {
  createFilesIndex,
  createFilesIndexEntry,
  createHelpIndex,
  createInstalledManifest,
  createPhaseCoverage,
  createSkillIndex,
} from "../manifest/manifest-generator.js";
import {
  applyRecoverableUpdateTransaction,
  finalizeCompletedUpdateTransaction,
  inspectUpdateTransactionJournal,
  readUpdateTransactionRecoveryHashes,
} from "../fs/update-transaction.js";

const PACKAGE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const BUNDLED_SOURCE_DISPLAY_ROOT = "assets/source/speclite";
const COMPAT_RUNTIME_SCRIPTS = new Set(["resolve_config.py", "resolve_customization.py"]);
const BUNDLED_RUNTIME_COMPAT_SOURCE_PREFIX = "bundled-runtime-compat:scripts/";

export type UpdatePlanningResult<TData extends UpdateCommandData | RepairCommandData> = {
  data: TData;
  issues: ValidationIssue[];
  blocked: boolean;
};

export async function planUpdate(input: {
  projectRoot: string;
  writeAuthorized?: boolean;
}): Promise<UpdatePlanningResult<UpdateCommandData>> {
  const context = await readPlanningContext(input.projectRoot);
  if (context.blocked) {
    return {
      data: emptyUpdateCommandData(),
      issues: context.issues,
      blocked: true,
    };
  }

  const actions: UpdateCommandData["updatePlan"]["actions"] = [];
  const migration = await buildCanonicalMigrationProjection({
    ...context,
    projectRoot: input.projectRoot,
  });
  const contextConflicts = await filterResolvedIdeRootConflicts({
    projectRoot: input.projectRoot,
    conflicts: context.conflicts,
    desiredFiles: migration.files,
    filesIndex: context.filesIndex,
  });
  const conflicts: UpdateCommandData["conflicts"] = [...contextConflicts, ...migration.conflicts];
  const oldEntriesByPath = new Map(context.filesIndex.entries.map((entry) => [entry.path, entry]));
  const journalState = await inspectUpdateTransactionJournal(input.projectRoot);
  const recoveryHashes = journalState === "present"
    ? await readUpdateTransactionRecoveryHashes(input.projectRoot)
    : undefined;
  if (journalState === "malformed") {
    conflicts.push({
      affectedPath: "_speclite/_config/.update-journal.json",
      ownership: "installer-owned",
      reason: "malformed-recovery-journal",
    });
  }

  for (const entry of context.filesIndex.entries) {
    const currentState = await readCurrentState(input.projectRoot, entry.path);
    const currentHash = currentState?.hash;
    const desired = migration.files.get(entry.path);
    const recoveryState = recoveryHashes?.get(entry.path);
    const recoveringNewState = recoveryState?.hash === currentHash &&
      recoveryState.executable === currentState?.executable;
    const classification = classifyOwnership({
      relativePath: entry.path,
      artifactRoot: context.artifactRoot,
    });
    const protectedOwnership = entry.ownership !== "installer-owned"
      ? entry.ownership
      : classification.ownership === "human-owned" || classification.ownership === "workflow-owned"
        ? classification.ownership
        : undefined;

    if (protectedOwnership !== undefined) {
      actions.push({
        affectedPath: entry.path,
        ownership: protectedOwnership,
        action: "skip",
        ...(currentHash === undefined ? {} : { currentHash }),
        expectedHash: entry.hash,
        reason: protectedOwnership,
      });
      continue;
    }

    const conflict = recoveringNewState ? undefined : detectFilesIndexEntryConflict({
      entry,
      currentHash,
      artifactRoot: context.artifactRoot,
      repair: false,
    });

    if (conflict !== undefined) {
      conflicts.push(conflict);
      if (conflict.ownership === "installer-owned") {
        actions.push({
          affectedPath: entry.path,
          ownership: "installer-owned",
          action: "conflict",
          ...(currentHash === undefined ? {} : { currentHash }),
          expectedHash: entry.hash,
        });
      }
      continue;
    }

    if (entry.artifactKind === "ide-skill-package" && desired === undefined) {
      conflicts.push({
        affectedPath: entry.path,
        ownership: "installer-owned",
        ...(currentHash === undefined ? {} : { currentHash }),
        expectedHash: entry.hash,
        reason: "canonical-stale-path",
      });
      actions.push({
        affectedPath: entry.path,
        ownership: "installer-owned",
        action: "conflict",
        ...(currentHash === undefined ? {} : { currentHash }),
        expectedHash: entry.hash,
      });
      continue;
    }
    const sourceHash = desired?.entry.hash ?? await readSourceHash({
      projectRoot: input.projectRoot,
      sourceRef: entry.sourceRef,
      sourceDescriptor: context.sourceDescriptor,
    });
    if (
      entry.ownership === "installer-owned" &&
      currentHash === entry.hash &&
      shouldRequireSourceEvidence(entry.sourceRef) &&
      sourceHash === undefined
    ) {
      conflicts.push(createMissingSourceEvidenceConflict({ entry, currentHash }));
      actions.push({
        affectedPath: entry.path,
        ownership: "installer-owned",
        action: "conflict",
        ...(currentHash === undefined ? {} : { currentHash }),
        expectedHash: entry.hash,
      });
      continue;
    }

    if (
      entry.ownership === "installer-owned" &&
      (currentHash === entry.hash || recoveringNewState) &&
      sourceHash !== undefined &&
      (sourceHash !== entry.hash || (desired?.entry.executable ?? entry.executable) !== currentState?.executable)
    ) {
      actions.push({
        affectedPath: entry.path,
        ownership: "installer-owned",
        action: currentHash === undefined ? "create" : "update",
        ...(currentHash === undefined ? {} : { currentHash }),
        expectedHash: sourceHash,
      });
      continue;
    }

    actions.push({
      affectedPath: entry.path,
      ownership: "installer-owned",
      action: "skip",
      ...(currentHash === undefined ? {} : { currentHash }),
      expectedHash: entry.hash,
      reason: "unchanged",
    });
  }

  for (const desired of migration.files.values()) {
    if (oldEntriesByPath.has(desired.entry.path)) continue;
    const currentState = await readCurrentState(input.projectRoot, desired.entry.path);
    const currentHash = currentState?.hash;
    if (desired.entry.path === "_speclite/_config/files-index.json" && currentHash !== undefined) {
      if (currentHash !== desired.entry.hash) {
        actions.push({
          affectedPath: desired.entry.path,
          ownership: "installer-owned",
          action: "update",
          currentHash,
          expectedHash: desired.entry.hash,
        });
      }
      continue;
    }
    const recoveryState = recoveryHashes?.get(desired.entry.path);
    if (currentHash !== undefined && recoveryState?.hash === currentHash &&
      recoveryState.executable === currentState?.executable) {
      actions.push({
        affectedPath: desired.entry.path,
        ownership: "installer-owned",
        action: "create",
        expectedHash: desired.entry.hash,
      });
      continue;
    }
    if (currentHash !== undefined) {
      conflicts.push({
        affectedPath: desired.entry.path,
        ownership: "unknown",
        currentHash,
        expectedHash: desired.entry.hash,
        reason: "unknown-ownership",
      });
      actions.push({
        affectedPath: desired.entry.path,
        ownership: "installer-owned",
        action: "conflict",
        currentHash,
        expectedHash: desired.entry.hash,
      });
      continue;
    }
    actions.push({
      affectedPath: desired.entry.path,
      ownership: "installer-owned",
      action: "create",
      expectedHash: desired.entry.hash,
    });
  }
  actions.sort((left, right) => left.affectedPath.localeCompare(right.affectedPath));

  if (journalState === "present") {
    const recoveryMatchesCurrentPlan = recoveryHashes !== undefined && [...recoveryHashes].every(([affectedPath, state]) =>
      affectedPath === "_speclite/_config/files-index.json" ||
      actions.some((action) => action.affectedPath === affectedPath && action.expectedHash === state.hash),
    );
    if (!recoveryMatchesCurrentPlan) {
      conflicts.push({
        affectedPath: "_speclite/_config/.update-journal.json",
        ownership: "installer-owned",
        reason: "journal-plan-mismatch",
      });
    } else if (input.writeAuthorized !== true) {
      conflicts.push({
        affectedPath: "_speclite/_config/.update-journal.json",
        ownership: "installer-owned",
        reason: "recovery-pending",
      });
    }
  }

  const writeAuthorized = input.writeAuthorized === true && conflicts.length === 0;
  const applyResult = writeAuthorized
    ? hasPlannedWrite(actions)
      ? await applyUpdateActions({
        projectRoot: input.projectRoot,
        artifactRoot: context.artifactRoot,
        actions,
        filesIndex: context.filesIndex,
        desiredFiles: migration.files,
        sourceDescriptor: context.sourceDescriptor,
      })
      : await finalizeAuthorizedRecovery(input.projectRoot, journalState)
    : {
        changedPaths: [] as string[],
        skippedPaths: [] as string[],
        issues: [] as ValidationIssue[],
        blocked: false,
      };

  return {
    data: {
      updatePlan: { actions },
      changedPaths: applyResult.changedPaths,
      skippedPaths: applyResult.skippedPaths,
      conflicts,
      ...createUpdateConflictLifecycleState({ actions, conflicts }),
      requiresConfirmation: requiresUpdateConfirmation({ actions, conflicts, writeAuthorized }),
      writeAuthorized,
    },
    issues: [...context.issues, ...applyResult.issues],
    blocked: applyResult.blocked,
  };
}

export async function planRepair(input: {
  projectRoot: string;
  writeAuthorized?: boolean;
}): Promise<UpdatePlanningResult<RepairCommandData>> {
  const context = await readPlanningContext(input.projectRoot);
  if (context.blocked) {
    return {
      data: emptyRepairCommandData(),
      issues: context.issues,
      blocked: true,
    };
  }

  const actions: RepairCommandData["repairPlan"]["actions"] = [];
  const ideRepair = await planIdeMirrorRepairActions({
    projectRoot: input.projectRoot,
    skillIndex: context.skillIndex,
    sourceDescriptor: context.sourceDescriptor,
  });
  actions.push(...ideRepair.actions);
  const ideRepairActionPaths = new Set(ideRepair.actions.map((action) => action.affectedPath));
  const conflicts: RepairCommandData["conflicts"] = [
    ...context.conflicts.flatMap((conflict) => {
      if (ideRepairActionPaths.has(conflict.affectedPath)) return [];
      if (conflict.reason === "installer-owned-drift" && isIdeMirrorPackagePath(conflict.affectedPath)) {
        return [{ ...conflict, reason: "unsupported-repair" as const }];
      }
      return [conflict];
    }),
    ...ideRepair.conflicts,
  ];

  for (const entry of context.filesIndex.entries) {
    if (isCoveredByIdePackageRepair(entry.path, ideRepairActionPaths)) continue;
    const currentHash = await readCurrentHash(input.projectRoot, entry.path);
    const conflict = detectFilesIndexEntryConflict({
      entry,
      currentHash,
      artifactRoot: context.artifactRoot,
      repair: true,
    });

    if (conflict !== undefined) {
      if (conflict.ownership === "installer-owned" && conflict.reason === "installer-owned-drift") {
        const sourceBytes = await readRepairCandidateBytes({
          projectRoot: input.projectRoot,
          targetPath: entry.path,
          sourceRef: entry.sourceRef,
          artifactKind: entry.artifactKind,
          sourceDescriptor: context.sourceDescriptor,
        });
        if (sourceBytes === undefined) {
          conflicts.push(createMissingSourceEvidenceConflict({ entry, currentHash }));
          continue;
        }

        actions.push({
          affectedPath: entry.path,
          ownership: "installer-owned",
          ...(currentHash === undefined ? {} : { currentHash }),
          expectedHash: hashBytes(sourceBytes),
          action: chooseRepairAction(entry),
        });
        continue;
      }

      conflicts.push(conflict);
      continue;
    }

    const classification = classifyOwnership({
      relativePath: entry.path,
      artifactRoot: context.artifactRoot,
    });
    if (entry.ownership === "installer-owned" && classification.ownership === "installer-owned") {
      actions.push({
        affectedPath: entry.path,
        ownership: "installer-owned",
        ...(currentHash === undefined ? {} : { currentHash }),
        expectedHash: entry.hash,
        action: "skip",
        reason: "unchanged",
      });
    }
  }

  const writeAuthorized = input.writeAuthorized === true && conflicts.length === 0 && hasRepairableWrite(actions);
  const applyResult = writeAuthorized
    ? await applyRepairActions({
        projectRoot: input.projectRoot,
        artifactRoot: context.artifactRoot,
        actions,
        filesIndex: context.filesIndex,
        skillIndex: context.skillIndex,
        sourceDescriptor: context.sourceDescriptor,
      })
    : {
        changedPaths: [] as string[],
        skippedPaths: [] as string[],
        issues: [] as ValidationIssue[],
        blocked: false,
      };

  return {
    data: {
      repairPlan: { actions },
      changedPaths: applyResult.changedPaths,
      skippedPaths: applyResult.skippedPaths,
      conflicts,
      requiresConfirmation: requiresRepairConfirmation({ actions, conflicts, writeAuthorized }),
      writeAuthorized,
    },
    issues: [...context.issues, ...applyResult.issues],
    blocked: applyResult.blocked,
  };
}

async function readPlanningContext(projectRoot: string): Promise<{
  filesIndex: FilesIndex;
  artifactRoot: string;
  conflicts: UpdateCommandData["conflicts"];
  issues: ValidationIssue[];
  blocked: boolean;
  installedModules: string[];
  sourceDescriptor?: SourceDescriptor;
  skillIndex?: SkillIndex;
  targetIds: Array<"claude" | "agents">;
  manifest?: Manifest;
}> {
  const issues: ValidationIssue[] = [];
  const configResult = await resolveProjectConfig({ projectRoot });
  issues.push(...configResult.issues);
  if (hasBlockingResolverIssue(issues)) {
    return {
      filesIndex: {
        schemaVersion: "speclite.files-index.v1",
        entries: [],
      },
      artifactRoot: "_speclite-output",
      conflicts: [],
      issues,
      blocked: true,
      installedModules: [],
      skillIndex: undefined,
      targetIds: [],
      manifest: undefined,
    };
  }

  const filesIndexPath = path.join(projectRoot, "_speclite/_config/files-index.json");
  let filesIndex: FilesIndex;
  const conflicts: UpdateCommandData["conflicts"] = [];
  try {
    const parsed = JSON.parse(await readFile(filesIndexPath, "utf8")) as unknown;
    filesIndex = FilesIndexSchema.parse(parsed);
  } catch {
    filesIndex = {
      schemaVersion: "speclite.files-index.v1",
      entries: [],
    };
    conflicts.push({
      affectedPath: "_speclite/_config/files-index.json",
      ownership: "unknown",
      reason: "missing-source-evidence",
    });
  }
  const manifestContext = await readManifestContext(projectRoot);
  issues.push(...manifestContext.issues);
  if (hasBlockingResolverIssue(issues)) {
    return {
      filesIndex,
      artifactRoot: manifestContext.artifactRoot,
      conflicts,
      issues,
      blocked: true,
      installedModules: manifestContext.installedModules,
      skillIndex: undefined,
      targetIds: manifestContext.targetIds,
      manifest: manifestContext.manifest,
    };
  }
  const artifactRoot = manifestContext.artifactRoot;
  for (const skillDir of findInstalledSkillDirs(filesIndex)) {
    if (!(await fileExists(path.join(projectRoot, skillDir, "customize.toml")))) continue;
    const result = await resolveSkillCustomization({
      projectRoot,
      skillDir: path.join(projectRoot, skillDir),
    });
    issues.push(...result.issues);
  }

  const skillIndex = await readSkillIndexIfPresent(projectRoot);
  if (skillIndex !== undefined) {
    conflicts.push(...await detectIdeMirrorConflicts({ projectRoot, skillIndex }));
  }

  return {
    filesIndex,
    artifactRoot,
    conflicts,
    issues,
    blocked: hasBlockingResolverIssue(issues),
    installedModules: manifestContext.installedModules,
    sourceDescriptor: manifestContext.sourceDescriptor,
    ...(skillIndex === undefined ? {} : { skillIndex }),
    targetIds: manifestContext.targetIds,
    manifest: manifestContext.manifest,
  };
}

async function readSkillIndexIfPresent(projectRoot: string) {
  try {
    const parsed = JSON.parse(
      await readFile(path.join(projectRoot, "_speclite/_config/skill-index.json"), "utf8"),
    ) as unknown;
    return SkillIndexSchema.parse(parsed);
  } catch {
    return undefined;
  }
}

async function readManifestContext(projectRoot: string): Promise<{
  artifactRoot: string;
  installedModules: string[];
  sourceDescriptor?: SourceDescriptor;
  issues: ValidationIssue[];
  targetIds: Array<"claude" | "agents">;
  manifest?: Manifest;
}> {
  try {
    const parsed = parseYaml(
      await readFile(path.join(projectRoot, "_speclite/_config/manifest.yaml"), "utf8"),
    ) as unknown;
    const manifest = (typeof parsed === "object" && parsed !== null ? parsed : undefined) as Manifest | undefined;
    const artifactRoot = readArtifactRootFromManifest(parsed);
    const installedSelection = readInstalledSelectionFromManifest(parsed);
    const sourceDescriptorResult = readSourceDescriptorFromManifest(parsed);
    if (sourceDescriptorResult.issue !== undefined) {
      return { artifactRoot, ...installedSelection, manifest, issues: [sourceDescriptorResult.issue] };
    }
    const sourceIssue = validateSourceDescriptorForUpdate(sourceDescriptorResult.sourceDescriptor);
    return {
      artifactRoot,
      ...installedSelection,
      sourceDescriptor: sourceDescriptorResult.sourceDescriptor,
      manifest,
      issues: sourceIssue === undefined ? [] : [sourceIssue],
    };
  } catch {
    return {
      artifactRoot: "_speclite-output",
      installedModules: [],
      targetIds: [],
      manifest: undefined,
      issues: [
        createSourceIntegrityIssue({
          issueId: "source-integrity.missing-source-descriptor",
          reason: "missing-source-descriptor",
          impact: "Update planning requires a readable installed source descriptor before generating write-capable plans.",
          suggestedNextStep: "Restore readable _speclite/_config/manifest.yaml sourceDescriptor metadata before rerunning update planning.",
        }),
      ],
    };
  }
}

function readInstalledSelectionFromManifest(parsed: unknown): {
  installedModules: string[];
  targetIds: Array<"claude" | "agents">;
} {
  if (typeof parsed !== "object" || parsed === null) return { installedModules: [], targetIds: [] };
  const manifest = parsed as Record<string, unknown>;
  const installedModules = Array.isArray(manifest.installedModules)
    ? manifest.installedModules.filter((value): value is string => typeof value === "string")
    : [];
  const targetIds = Array.isArray(manifest.targetIds)
    ? manifest.targetIds.filter((value): value is "claude" | "agents" => value === "claude" || value === "agents")
    : [];
  return { installedModules, targetIds };
}

function readArtifactRootFromManifest(parsed: unknown): string {
  if (
    typeof parsed === "object" &&
    parsed !== null &&
    "paths" in parsed &&
    typeof parsed.paths === "object" &&
    parsed.paths !== null &&
    "artifactRoot" in parsed.paths &&
    typeof parsed.paths.artifactRoot === "string" &&
    isProjectRelativePosixPath(parsed.paths.artifactRoot)
  ) {
    return parsed.paths.artifactRoot;
  }
  return "_speclite-output";
}

function readSourceDescriptorFromManifest(parsed: unknown): {
  sourceDescriptor: SourceDescriptor;
  issue?: ValidationIssue;
} {
  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !("sourceDescriptor" in parsed)
  ) {
    return {
      sourceDescriptor: {
        sourceType: "bundled",
        trustStatus: "blocked",
        integrityEvidence: [],
      },
      issue: createSourceIntegrityIssue({
        issueId: "source-integrity.missing-source-descriptor",
        reason: "missing-source-descriptor",
        impact: "Update planning requires an installed source descriptor before generating write-capable plans.",
        suggestedNextStep: "Restore _speclite/_config/manifest.yaml sourceDescriptor metadata before rerunning update planning.",
      }),
    };
  }

  const result = SourceDescriptorSchema.safeParse(parsed.sourceDescriptor);
  if (!result.success) {
    return {
      sourceDescriptor: {
        sourceType: "bundled",
        trustStatus: "blocked",
        integrityEvidence: [],
      },
      issue: createSourceIntegrityIssue({
        issueId: "source-integrity.malformed-source-descriptor",
        reason: "malformed-source-descriptor",
        impact: "Update planning cannot trust malformed installed source descriptor metadata.",
        suggestedNextStep: "Repair _speclite/_config/manifest.yaml sourceDescriptor metadata before rerunning update planning.",
      }),
    };
  }

  return { sourceDescriptor: result.data };
}

function validateSourceDescriptorForUpdate(sourceDescriptor: SourceDescriptor): ValidationIssue | undefined {
  if (sourceDescriptor.trustStatus === "blocked") {
    return createSourceIntegrityIssue({
      issueId: "source-integrity.blocked-source",
      reason: "blocked-source",
      impact: "Update planning cannot continue while the installed source descriptor is blocked.",
      suggestedNextStep: "Resolve source trust blockers before generating write-capable update plans.",
    });
  }

  if (!sourceDescriptor.integrityEvidence.some((evidence) => evidence.verified === true)) {
    return createSourceIntegrityIssue({
      issueId: "source-integrity.missing-evidence",
      reason: "missing-integrity-evidence",
      impact: "Update planning requires at least one verified reproducible source integrity evidence entry.",
      suggestedNextStep: "Restore source descriptor integrity evidence before generating an update plan.",
    });
  }

  if (
    sourceDescriptor.sourceType === "git" &&
    !sourceDescriptor.integrityEvidence.some(
      (evidence) => evidence.kind === "git-commit" && evidence.verified === true,
    )
  ) {
    return createSourceIntegrityIssue({
      issueId: "source-integrity.floating-git-source",
      reason: "floating-git-source",
      impact: "Git update sources must be pinned to verified commit evidence before planning writes.",
      suggestedNextStep: "Pin the git source to a verified commit and rerun update planning.",
    });
  }

  return undefined;
}

function createSourceIntegrityIssue(input: {
  issueId:
    | "source-integrity.blocked-source"
    | "source-integrity.missing-evidence"
    | "source-integrity.floating-git-source"
    | "source-integrity.missing-source-descriptor"
    | "source-integrity.malformed-source-descriptor";
  reason: string;
  impact: string;
  suggestedNextStep: string;
}): ValidationIssue {
  return {
    issueId: input.issueId,
    category: "source-integrity",
    severity: "error",
    affectedPath: "_speclite/_config/manifest.yaml",
    component: "source-descriptor",
    details: { reason: input.reason },
    impact: input.impact,
    suggestedNextStep: input.suggestedNextStep,
  };
}

async function readCurrentHash(projectRoot: string, relativePath: string): Promise<string | undefined> {
  try {
    return await hashFile(resolveProjectRelativePath({ projectRoot, relativePath }).absolutePath);
  } catch {
    return undefined;
  }
}

async function readCurrentState(projectRoot: string, relativePath: string): Promise<
  { hash: `sha256:${string}`; executable: boolean } | undefined
> {
  try {
    const absolutePath = resolveProjectRelativePath({ projectRoot, relativePath }).absolutePath;
    const metadata = await lstat(absolutePath);
    if (!metadata.isFile()) return undefined;
    return { hash: await hashFile(absolutePath), executable: (metadata.mode & 0o111) !== 0 };
  } catch {
    return undefined;
  }
}

async function readSourceEvidence(input: {
  projectRoot: string;
  sourceRef: string;
  sourceDescriptor?: SourceDescriptor;
}): Promise<Buffer | undefined> {
  if (!isProjectRelativePosixPath(input.sourceRef)) return undefined;

  try {
    const absolutePath = resolveSourceEvidencePath(input);
    return absolutePath === undefined ? undefined : await readFile(absolutePath);
  } catch {
    return undefined;
  }
}

function resolveSourceEvidencePath(input: {
  projectRoot: string;
  sourceRef: string;
  sourceDescriptor?: SourceDescriptor;
}): string | undefined {
  if (!isProjectRelativePosixPath(input.sourceRef)) return undefined;
  if (
    input.sourceDescriptor?.sourceType === "bundled" &&
    (input.sourceRef === BUNDLED_SOURCE_DISPLAY_ROOT ||
      input.sourceRef.startsWith(`${BUNDLED_SOURCE_DISPLAY_ROOT}/`))
  ) {
    return path.join(PACKAGE_ROOT, input.sourceRef);
  }
  return resolveProjectRelativePath({
    projectRoot: input.projectRoot,
    relativePath: input.sourceRef,
  }).absolutePath;
}

type DesiredMigrationFile = {
  entry: FilesIndexEntry;
  contents: Buffer;
};

async function buildCanonicalMigrationProjection(input: {
  filesIndex: FilesIndex;
  installedModules: string[];
  manifest?: Manifest;
  projectRoot: string;
  sourceDescriptor?: SourceDescriptor;
  skillIndex?: SkillIndex;
  targetIds: Array<"claude" | "agents">;
  artifactRoot: string;
}): Promise<{
  files: Map<string, DesiredMigrationFile>;
  conflicts: UpdateCommandData["conflicts"];
}> {
  const canonicalSourceRoot = resolveCanonicalSourceRoot(input);
  const prerequisiteConflicts: UpdateCommandData["conflicts"] = [];
  const rawManifest = input.manifest as unknown as Record<string, unknown> | undefined;
  const rawModules = rawManifest?.installedModules;
  const rawTargets = rawManifest?.targetIds;
  if (Array.isArray(rawModules) && rawModules.some((value) => typeof value !== "string")) {
    prerequisiteConflicts.push({ affectedPath: "_speclite/_config/manifest.yaml", ownership: "installer-owned", reason: "invalid-module-selection" });
  }
  if (Array.isArray(rawTargets) && rawTargets.some((value) => value !== "claude" && value !== "agents")) {
    prerequisiteConflicts.push({ affectedPath: "_speclite/_config/manifest.yaml", ownership: "installer-owned", reason: "invalid-target-selection" });
  }
  if (input.installedModules.length > 0 && input.skillIndex === undefined) {
    prerequisiteConflicts.push({ affectedPath: "_speclite/_config/skill-index.json", ownership: "installer-owned", reason: "missing-source-evidence" });
  }
  if (input.installedModules.length > 0 && input.targetIds.length === 0) {
    prerequisiteConflicts.push({ affectedPath: "_speclite/_config/manifest.yaml", ownership: "installer-owned", reason: "missing-target-selection" });
  }
  if (prerequisiteConflicts.length > 0) return { files: new Map(), conflicts: prerequisiteConflicts };
  if (
    canonicalSourceRoot === undefined ||
    input.installedModules.length === 0 ||
    input.targetIds.length === 0 ||
    input.manifest === undefined ||
    input.skillIndex === undefined
  ) {
    return { files: new Map(), conflicts: [] };
  }

  const modules = await discoverOfficialModules({ sourceRoot: canonicalSourceRoot });
  const selectedModuleIds = new Set(input.installedModules);
  const conflicts: UpdateCommandData["conflicts"] = [];
  const modulesByCode = new Map(modules.map((module) => [module.code, module]));
  for (const moduleId of selectedModuleIds) {
    if (!modulesByCode.has(moduleId)) {
      conflicts.push({
        affectedPath: "_speclite/_config/manifest.yaml",
        ownership: "installer-owned",
        reason: "unknown-module-selection",
      });
    }
  }
  for (const oldSkill of input.skillIndex?.entries ?? []) {
    const owners = modules.filter((module) =>
      module.packageRoots.some((packageRoot) => path.posix.basename(packageRoot) === oldSkill.canonicalSkillId),
    );
    if (owners.length !== 1) {
      conflicts.push({
        affectedPath: `_speclite/_config/skill-index.json`,
        ownership: "installer-owned",
        reason: owners.length === 0 ? "canonical-owner-missing" : "canonical-owner-ambiguous",
      });
      continue;
    }
    const owner = owners[0]!;
    if (selectedModuleIds.has(owner.code)) continue;
    if (owner.moduleKind === "ecosystem") {
      selectedModuleIds.add(owner.code);
      continue;
    }
    conflicts.push({
      affectedPath: `_speclite/_config/skill-index.json`,
      ownership: "installer-owned",
      reason: "canonical-owner-not-selected",
    });
  }
  if (conflicts.length > 0) return { files: new Map(), conflicts };

  for (const moduleId of [...selectedModuleIds]) addRequiredModuleClosure(moduleId, selectedModuleIds, modulesByCode, conflicts);
  if (conflicts.length > 0) return { files: new Map(), conflicts };

  const selectedModules = modules.filter((module) => selectedModuleIds.has(module.code));
  const adapters = getIdeAdapterRegistry()
    .filter((adapter) => input.targetIds.includes(adapter.id))
    .map((adapter) => ({
      targetId: adapter.id,
      targetDirectory: adapter.targetDirectory,
      status: "planned" as const,
    }));
  const projection = await buildIdeMirrorProjection({
    packageRoot: PACKAGE_ROOT,
    sourceRoot: canonicalSourceRoot,
    sourceRefRoot: input.sourceDescriptor?.sourceType === "local"
      ? input.sourceDescriptor.resolvedRoot
      : BUNDLED_SOURCE_DISPLAY_ROOT,
    selectedModules,
    targetAdapters: adapters,
    artifactRoots: {
      output_folder: input.artifactRoot,
      planning_artifacts: `${input.artifactRoot}/planning-artifacts`,
      implementation_artifacts: `${input.artifactRoot}/implementation-artifacts`,
      devops_artifacts: `${input.artifactRoot}/devops-artifacts`,
      project_knowledge: "docs",
    },
  });
  if (!projection.ok) {
    return {
      files: new Map(),
      conflicts: [{
        affectedPath: projection.issue.affectedPath ?? "_speclite/_config/skill-index.json",
        ownership: "installer-owned",
        reason: "canonical-projection-failed",
      }],
    };
  }

  const desired = new Map<string, DesiredMigrationFile>();
  for (const file of projection.files) desired.set(file.entry.path, file);

  const desiredSourceDescriptor = input.sourceDescriptor?.sourceType === "bundled"
    ? await discoverBundledSourceDescriptor({ projectRoot: PACKAGE_ROOT })
    : input.sourceDescriptor!;
  if (desiredSourceDescriptor.trustStatus === "blocked") {
    return {
      files: new Map(),
      conflicts: [{
        affectedPath: "_speclite/_config/manifest.yaml",
        ownership: "installer-owned",
        reason: "missing-source-evidence",
      }],
    };
  }
  const manifest = createInstalledManifest({
    sourceDescriptor: desiredSourceDescriptor,
    installedModules: selectedModules.map((module) => module.code),
    targetIds: CANONICAL_TARGET_ORDER.filter((targetId) => input.targetIds.includes(targetId)),
    paths: input.manifest.paths,
  });
  const generated = [
    {
      path: "_speclite/_config/manifest.yaml",
      value: manifest,
      artifactKind: "manifest",
      sourceRef: "installed-state:manifest",
    },
    {
      path: "_speclite/_config/skill-index.json",
      value: createSkillIndex(projection.skillIndexEntries),
      artifactKind: "skill-index",
      sourceRef: "installed-state:skill-index",
    },
    {
      path: "_speclite/_config/help-index.json",
      value: createHelpIndex(projection.helpIndexEntries),
      artifactKind: "help-index",
      sourceRef: "installed-state:help-index",
    },
    {
      path: "_speclite/_config/phase-coverage.json",
      value: createPhaseCoverage(projection.phaseCoverageRows),
      artifactKind: "phase-coverage",
      sourceRef: "installed-state:phase-coverage",
    },
  ];
  for (const item of generated) {
    const contents = Buffer.from(`${JSON.stringify(item.value, null, 2)}\n`);
    desired.set(item.path, {
      contents,
      entry: createFilesIndexEntry({
        path: item.path,
        bytes: contents,
        executable: false,
        artifactKind: item.artifactKind,
        sourceRef: item.sourceRef,
        artifactRoot: input.artifactRoot,
      }),
    });
  }

  const regeneratedKinds = new Set(["ide-skill-package", "manifest", "skill-index", "help-index", "phase-coverage"]);
  const retainedEntries = input.filesIndex.entries.filter((entry) => !regeneratedKinds.has(entry.artifactKind));
  const projectedFilesIndex = createFilesIndex([
    ...retainedEntries,
    ...[...desired.values()].map((file) => file.entry),
  ]);
  const filesIndexContents = Buffer.from(`${JSON.stringify(projectedFilesIndex, null, 2)}\n`);
  desired.set("_speclite/_config/files-index.json", {
    contents: filesIndexContents,
    entry: {
      schemaVersion: "speclite.files-index.v1",
      path: "_speclite/_config/files-index.json",
      ownership: "installer-owned",
      hash: hashBytes(filesIndexContents),
      hashAlgorithm: "sha256",
      executable: false,
      artifactKind: "files-index",
      sourceRef: "installed-state:files-index",
    },
  });

  return { files: desired, conflicts };
}

function resolveCanonicalSourceRoot(input: {
  projectRoot: string;
  sourceDescriptor?: SourceDescriptor;
}): string | undefined {
  if (input.sourceDescriptor?.sourceType === "bundled") {
    return path.join(PACKAGE_ROOT, BUNDLED_SOURCE_DISPLAY_ROOT);
  }
  if (input.sourceDescriptor?.sourceType === "local" && input.sourceDescriptor.resolvedRoot !== undefined) {
    return resolveProjectRelativePath({
      projectRoot: input.projectRoot,
      relativePath: input.sourceDescriptor.resolvedRoot,
    }).absolutePath;
  }
  return undefined;
}

async function readRepairCandidateBytes(input: {
  projectRoot: string;
  targetPath: string;
  sourceRef: string;
  artifactKind: string;
  sourceDescriptor?: SourceDescriptor;
}): Promise<Buffer | undefined> {
  if (input.artifactKind === "runtime-compat-script") {
    const scriptName = compatRuntimeScriptName(input.sourceRef);
    if (scriptName === undefined || input.targetPath !== `_speclite/scripts/${scriptName}`) {
      return undefined;
    }

    try {
      return await readFile(path.join(PACKAGE_ROOT, BUNDLED_SOURCE_DISPLAY_ROOT, "scripts", scriptName));
    } catch {
      return undefined;
    }
  }

  return readSourceEvidence(input);
}

function compatRuntimeScriptName(sourceRef: string): string | undefined {
  const canonicalPrefix = `${BUNDLED_SOURCE_DISPLAY_ROOT}/scripts/`;
  const scriptName = sourceRef.startsWith(canonicalPrefix)
    ? sourceRef.slice(canonicalPrefix.length)
    : sourceRef.startsWith(BUNDLED_RUNTIME_COMPAT_SOURCE_PREFIX)
      ? sourceRef.slice(BUNDLED_RUNTIME_COMPAT_SOURCE_PREFIX.length)
      : undefined;

  return scriptName !== undefined && COMPAT_RUNTIME_SCRIPTS.has(scriptName) ? scriptName : undefined;
}

function shouldRequireSourceEvidence(sourceRef: string): boolean {
  return !sourceRef.includes(":") && isProjectRelativePosixPath(sourceRef);
}

async function readSourceHash(input: {
  projectRoot: string;
  sourceRef: string;
  sourceDescriptor?: SourceDescriptor;
}): Promise<`sha256:${string}` | undefined> {
  const sourceBytes = await readSourceEvidence(input);
  return sourceBytes === undefined ? undefined : hashBytes(sourceBytes);
}

async function applyUpdateActions(input: {
  projectRoot: string;
  artifactRoot: string;
  actions: UpdateCommandData["updatePlan"]["actions"];
  filesIndex: FilesIndex;
  desiredFiles: Map<string, DesiredMigrationFile>;
  sourceDescriptor?: SourceDescriptor;
}): Promise<{
  changedPaths: string[];
  skippedPaths: string[];
  issues: ValidationIssue[];
  blocked: boolean;
}> {
  const skippedPaths: string[] = [];
  const operations: import("../fs/update-transaction.js").UpdateTransactionOperation[] = [];
  const preconditions: import("../fs/update-transaction.js").UpdateTransactionPrecondition[] = [];

  for (const action of input.actions) {
    if (action.action === "skip") {
      if (action.reason === "human-owned" || action.reason === "workflow-owned") {
        skippedPaths.push(action.affectedPath);
      }
      const indexed = input.filesIndex.entries.find((entry) => entry.path === action.affectedPath);
      if (indexed?.ownership === "installer-owned" && action.reason === "unchanged") {
        preconditions.push({
          absolutePath: resolveProjectRelativePath({ projectRoot: input.projectRoot, relativePath: indexed.path }).absolutePath,
          affectedPath: indexed.path,
          hash: indexed.hash,
          executable: indexed.executable,
        });
      }
      continue;
    }
    if (action.action === "conflict") continue;

    const desired = input.desiredFiles.get(action.affectedPath);
    const entry = desired?.entry ?? input.filesIndex.entries.find((candidate) => candidate.path === action.affectedPath);
    if (entry === undefined) {
      return {
        changedPaths: [],
        skippedPaths,
        issues: [
          createUpdateApplyIssue({
            affectedPath: action.affectedPath,
            reason: "missing-files-index-entry",
            changedPaths: [],
            pendingPaths: pendingUpdatePaths(input.actions, action.affectedPath),
          }),
        ],
        blocked: true,
      };
    }

    const sourceBytes = desired?.contents ?? await readSourceEvidence({
      projectRoot: input.projectRoot,
      sourceRef: entry.sourceRef,
      sourceDescriptor: input.sourceDescriptor,
    });
    if (sourceBytes === undefined) {
      return {
        changedPaths: [],
        skippedPaths,
        issues: [
          createUpdateApplyIssue({
            affectedPath: action.affectedPath,
            reason: "missing-source-evidence",
            changedPaths: [],
            pendingPaths: pendingUpdatePaths(input.actions, action.affectedPath),
          }),
        ],
        blocked: true,
      };
    }

    operations.push({
      path: action.affectedPath,
      contents: sourceBytes,
      executable: entry.executable,
      ...(input.filesIndex.entries.some((candidate) => candidate.path === action.affectedPath)
        ? {
            oldHash: input.filesIndex.entries.find((candidate) => candidate.path === action.affectedPath)!.hash,
            oldExecutable: input.filesIndex.entries.find((candidate) => candidate.path === action.affectedPath)!.executable,
          }
        : action.currentHash === undefined
          ? {}
          : { oldHash: action.currentHash as `sha256:${string}`, oldExecutable: false }),
    });
    if (shouldRequireSourceEvidence(entry.sourceRef)) {
      const absolutePath = resolveSourceEvidencePath({
        projectRoot: input.projectRoot,
        sourceRef: entry.sourceRef,
        sourceDescriptor: input.sourceDescriptor,
      });
      if (absolutePath !== undefined) {
        preconditions.push({
          absolutePath,
          affectedPath: entry.sourceRef,
          hash: hashBytes(sourceBytes),
          executable: entry.executable,
        });
      }
    }
  }
  if (
    operations.length > 0 &&
    !operations.some((operation) => operation.path === "_speclite/_config/files-index.json")
  ) {
    const appliedHashes = new Map(operations.map((operation) => [operation.path, hashBytes(operation.contents)]));
    const projectedFilesIndex: FilesIndex = {
      ...input.filesIndex,
      entries: input.filesIndex.entries.map((entry) => ({
        ...entry,
        hash: appliedHashes.get(entry.path) ?? entry.hash,
      })),
    };
    const filesIndexPath = "_speclite/_config/files-index.json";
    const currentHash = await readCurrentHash(input.projectRoot, filesIndexPath);
    if (currentHash === undefined) {
      return {
        changedPaths: [],
        skippedPaths,
        issues: [createFilesIndexProjectionIssue("missing-files-index")],
        blocked: true,
      };
    }
    operations.push({
      path: filesIndexPath,
      contents: `${JSON.stringify(projectedFilesIndex, null, 2)}\n`,
      executable: false,
      oldHash: currentHash as `sha256:${string}`,
      oldExecutable: false,
    });
  }
  operations.sort((left, right) => {
    if (left.path === "_speclite/_config/files-index.json") return 1;
    if (right.path === "_speclite/_config/files-index.json") return -1;
    const leftIndex = left.path.startsWith("_speclite/_config/") ? 1 : 0;
    const rightIndex = right.path.startsWith("_speclite/_config/") ? 1 : 0;
    return leftIndex - rightIndex || left.path.localeCompare(right.path);
  });
  const result = await applyRecoverableUpdateTransaction({
    projectRoot: input.projectRoot,
    artifactRoot: input.artifactRoot,
    operations,
    preconditions: [...new Map(preconditions.map((item) => [item.absolutePath, item])).values()],
  });
  if (!result.ok) {
    return {
      changedPaths: result.changedPaths,
      skippedPaths,
      issues: [result.issue],
      blocked: true,
    };
  }

  return {
    changedPaths: result.changedPaths,
    skippedPaths,
    issues: [],
    blocked: false,
  };
}

async function finalizeAuthorizedRecovery(
  projectRoot: string,
  journalState: "missing" | "present" | "malformed",
): Promise<{ changedPaths: string[]; skippedPaths: string[]; issues: ValidationIssue[]; blocked: boolean }> {
  if (journalState !== "present") return { changedPaths: [], skippedPaths: [], issues: [], blocked: false };
  const result = await finalizeCompletedUpdateTransaction(projectRoot);
  return result.ok
    ? { changedPaths: result.changedPaths, skippedPaths: [], issues: [], blocked: false }
    : { changedPaths: result.changedPaths, skippedPaths: [], issues: [result.issue], blocked: true };
}

function addRequiredModuleClosure(
  moduleId: string,
  selected: Set<string>,
  modulesByCode: Map<string, Awaited<ReturnType<typeof discoverOfficialModules>>[number]>,
  conflicts: UpdateCommandData["conflicts"],
): void {
  const module = modulesByCode.get(moduleId);
  if (module === undefined) return;
  for (const dependency of module.requiredDependencies) {
    if (!modulesByCode.has(dependency)) {
      conflicts.push({ affectedPath: "_speclite/_config/manifest.yaml", ownership: "installer-owned", reason: "missing-module-dependency" });
      continue;
    }
    if (selected.has(dependency)) continue;
    selected.add(dependency);
    addRequiredModuleClosure(dependency, selected, modulesByCode, conflicts);
  }
}

async function filterResolvedIdeRootConflicts(input: {
  projectRoot: string;
  conflicts: UpdateCommandData["conflicts"];
  desiredFiles: Map<string, DesiredMigrationFile>;
  filesIndex: FilesIndex;
}): Promise<UpdateCommandData["conflicts"]> {
  const result: UpdateCommandData["conflicts"] = [];
  for (const conflict of input.conflicts) {
    if (!isIdeMirrorPackageRoot(conflict.affectedPath)) {
      result.push(conflict);
      continue;
    }
    const desiredPaths = new Set(
      [...input.desiredFiles.keys()].filter((filePath) => filePath.startsWith(`${conflict.affectedPath}/`)),
    );
    if (desiredPaths.size === 0) {
      result.push(conflict);
      continue;
    }
    try {
      const actualFiles = await listFiles(resolveProjectRelativePath({
        projectRoot: input.projectRoot,
        relativePath: conflict.affectedPath,
      }).absolutePath);
      const indexedPaths = new Set(input.filesIndex.entries.map((entry) => entry.path));
      if (actualFiles
        .filter(isInstallableCanonicalPackageFile)
        .some((relativePath) => {
          const actualPath = `${conflict.affectedPath}/${relativePath}`;
          return !desiredPaths.has(actualPath) && !indexedPaths.has(actualPath);
        })) {
        result.push({ ...conflict, reason: "unknown-ownership" });
      }
    } catch {
      // A missing package root is fully represented by create actions in the projection.
    }
  }
  return result;
}

async function planIdeMirrorRepairActions(input: {
  projectRoot: string;
  skillIndex?: SkillIndex;
  sourceDescriptor?: SourceDescriptor;
}): Promise<{
  actions: RepairCommandData["repairPlan"]["actions"];
  conflicts: RepairCommandData["conflicts"];
}> {
  if (input.skillIndex === undefined) {
    return { actions: [], conflicts: [] };
  }

  const adapters = getIdeAdapterRegistry();
  const actions: RepairCommandData["repairPlan"]["actions"] = [];
  const conflicts: RepairCommandData["conflicts"] = [];

  for (const targetId of CANONICAL_TARGET_ORDER) {
    const adapter = adapters.find((candidate) => candidate.id === targetId);
    if (adapter === undefined) continue;

    const expectedEntries = input.skillIndex.entries.filter((entry) =>
      entry.installedTargets.includes(targetId),
    );
    for (const entry of expectedEntries) {
      const affectedPath = `${adapter.targetDirectory}/${entry.canonicalSkillId}`;
      const sourceRoot = resolveSourceEvidencePath({
        projectRoot: input.projectRoot,
        sourceRef: entry.sourcePackagePath,
        sourceDescriptor: input.sourceDescriptor,
      });
      if (sourceRoot === undefined) continue;
      const sourceHash = await readCanonicalPackageHash(sourceRoot);
      const currentHash = await readCanonicalPackageHash(
        resolveProjectRelativePath({
          projectRoot: input.projectRoot,
          relativePath: affectedPath,
        }).absolutePath,
      );

      if (currentHash === entry.canonicalPackageHash) continue;

      if (sourceHash !== entry.canonicalPackageHash) {
        conflicts.push({
          affectedPath,
          ownership: "installer-owned",
          ...(currentHash === undefined ? {} : { currentHash }),
          expectedHash: entry.canonicalPackageHash,
          reason: "missing-source-evidence",
        });
        continue;
      }

      actions.push({
        affectedPath,
        ownership: "installer-owned",
        ...(currentHash === undefined ? {} : { currentHash }),
        expectedHash: entry.canonicalPackageHash,
        action: "restore-canonical",
      });
    }
  }

  return { actions, conflicts };
}

async function readCanonicalPackageHash(packageRoot: string): Promise<`sha256:${string}` | undefined> {
  try {
    return await hashPackageDirectory(packageRoot, { include: isCanonicalPackageHashFile });
  } catch {
    return undefined;
  }
}

function requiresUpdateConfirmation(input: {
  actions: UpdateCommandData["updatePlan"]["actions"];
  conflicts: UpdateCommandData["conflicts"];
  writeAuthorized: boolean;
}): boolean {
  if (input.conflicts.length > 0) return true;
  if (input.writeAuthorized) return false;
  return hasPlannedWrite(input.actions);
}

function requiresRepairConfirmation(input: {
  actions: RepairCommandData["repairPlan"]["actions"];
  conflicts: RepairCommandData["conflicts"];
  writeAuthorized: boolean;
}): boolean {
  if (input.conflicts.length > 0) return true;
  if (input.writeAuthorized) return false;
  return input.actions.some(
    (action) => action.action === "restore-canonical" || action.action === "regenerate",
  );
}

function hasPlannedWrite(actions: UpdateCommandData["updatePlan"]["actions"]): boolean {
  return actions.some((action) => action.action === "create" || action.action === "update");
}

function hasRepairableWrite(actions: RepairCommandData["repairPlan"]["actions"]): boolean {
  return actions.some(
    (action) => action.action === "restore-canonical" || action.action === "regenerate",
  );
}

function chooseRepairAction(entry: FilesIndex["entries"][number]): "restore-canonical" | "regenerate" {
  if (isGeneratedInstallerArtifact(entry)) return "regenerate";
  return "restore-canonical";
}

function isGeneratedInstallerArtifact(entry: FilesIndex["entries"][number]): boolean {
  if (
    entry.artifactKind === "manifest" ||
    entry.artifactKind === "skill-index" ||
    entry.artifactKind === "help-index" ||
    entry.artifactKind === "phase-coverage" ||
    entry.artifactKind === "runtime-config" ||
    entry.artifactKind === "runtime-script" ||
    entry.artifactKind === "runtime-compat-script" ||
    entry.artifactKind === "project-custom-stub" ||
    entry.artifactKind === "generated-control"
  ) {
    return true;
  }

  return (
    entry.path === "_speclite/config.toml" ||
    entry.path === "_speclite/config.user.toml" ||
    entry.path.startsWith("_speclite/_config/") ||
    entry.path.startsWith("_speclite/scripts/")
  );
}

async function applyRepairActions(input: {
  projectRoot: string;
  artifactRoot: string;
  actions: RepairCommandData["repairPlan"]["actions"];
  filesIndex: FilesIndex;
  skillIndex?: SkillIndex;
  sourceDescriptor?: SourceDescriptor;
}): Promise<{
  changedPaths: string[];
  skippedPaths: string[];
  issues: ValidationIssue[];
  blocked: boolean;
}> {
  const changedPaths: string[] = [];
  const skippedPaths: string[] = [];

  for (const action of input.actions) {
    if (action.action === "skip") {
      skippedPaths.push(action.affectedPath);
      continue;
    }

    const entry = input.filesIndex.entries.find((candidate) => candidate.path === action.affectedPath);
    if (entry === undefined) {
      const ideRepair = await applyIdeMirrorRepairAction({
        projectRoot: input.projectRoot,
        artifactRoot: input.artifactRoot,
        action,
        skillIndex: input.skillIndex,
        sourceDescriptor: input.sourceDescriptor,
      });
      if (ideRepair !== undefined) {
        if (!ideRepair.ok) {
          return {
            changedPaths: [...changedPaths, ...ideRepair.changedPaths],
            skippedPaths,
            issues: ideRepair.issues,
            blocked: true,
          };
        }
        changedPaths.push(...ideRepair.changedPaths);
        continue;
      }

      return {
        changedPaths,
        skippedPaths,
        issues: [
          createRepairApplyIssue({
            affectedPath: action.affectedPath,
            reason: "missing-files-index-entry",
            changedPaths,
            pendingPaths: pendingRepairPaths(input.actions, action.affectedPath),
          }),
        ],
        blocked: true,
      };
    }

    const sourceBytes = await readRepairCandidateBytes({
      projectRoot: input.projectRoot,
      targetPath: action.affectedPath,
      sourceRef: entry.sourceRef,
      artifactKind: entry.artifactKind,
      sourceDescriptor: input.sourceDescriptor,
    });
    if (sourceBytes === undefined) {
      return {
        changedPaths,
        skippedPaths,
        issues: [
          createRepairApplyIssue({
            affectedPath: action.affectedPath,
            reason: "missing-source-evidence",
            changedPaths,
            pendingPaths: pendingRepairPaths(input.actions, action.affectedPath),
          }),
        ],
        blocked: true,
      };
    }

    const write = await safeWriteFile({
      projectRoot: input.projectRoot,
      relativePath: action.affectedPath,
      contents: sourceBytes,
      executable: entry.executable,
      allowExisting: action.currentHash !== undefined,
      ...(action.currentHash === undefined
        ? {}
        : {
            expectedExistingFile: {
              ownership: "installer-owned" as const,
              hash: action.currentHash,
              artifactRoot: input.artifactRoot,
            },
          }),
      component: "repair-apply",
    });

    if (!write.ok) {
      return {
        changedPaths,
        skippedPaths,
        issues: [
          {
            ...write.issue,
            details: {
              ...(write.issue.details ?? {}),
              completedSteps: changedPaths.map((changedPath) => `changed:${changedPath}`),
              failedStep: `repair:${action.affectedPath}`,
              pendingSteps: pendingRepairPaths(input.actions, action.affectedPath).map(
                (pendingPath) => `repair:${pendingPath}`,
              ),
              changedPaths,
              manualAction:
                "Run speclite validate, inspect the failed repair target, then rerun speclite update --repair after resolving the blocker.",
            },
          },
        ],
        blocked: true,
      };
    }

    changedPaths.push(write.path);
  }

  return {
    changedPaths,
    skippedPaths,
    issues: [],
    blocked: false,
  };
}

async function applyIdeMirrorRepairAction(input: {
  projectRoot: string;
  artifactRoot: string;
  action: RepairCommandData["repairPlan"]["actions"][number];
  skillIndex?: SkillIndex;
  sourceDescriptor?: SourceDescriptor;
}): Promise<
  | {
      ok: true;
      changedPaths: string[];
    }
  | {
      ok: false;
      changedPaths: string[];
      issues: ValidationIssue[];
    }
  | undefined
> {
  const match = findIdeMirrorRepairSource(input.action.affectedPath, input.skillIndex);
  if (match === undefined) return undefined;

  const sourceRoot = resolveSourceEvidencePath({
    projectRoot: input.projectRoot,
    sourceRef: match.sourcePackagePath,
    sourceDescriptor: input.sourceDescriptor,
  });
  if (sourceRoot === undefined) return undefined;
  const targetRoot = resolveProjectRelativePath({
    projectRoot: input.projectRoot,
    relativePath: input.action.affectedPath,
  }).absolutePath;
  const sourceFiles = await readCanonicalPackageFiles(sourceRoot);
  if (sourceFiles === undefined) {
    return {
      ok: false,
      changedPaths: [],
      issues: [
        createRepairApplyIssue({
          affectedPath: input.action.affectedPath,
          reason: "missing-source-evidence",
          changedPaths: [],
          pendingPaths: [],
        }),
      ],
    };
  }
  const targetFiles = (await readCanonicalPackageFiles(targetRoot)) ?? [];

  const changedPaths: string[] = [];
  const sourceFileSet = new Set(sourceFiles);
  for (const relativeFile of targetFiles.filter((targetFile) => !sourceFileSet.has(targetFile))) {
    const targetPath = `${input.action.affectedPath}/${relativeFile}`;
    try {
      await unlink(
        resolveProjectRelativePath({
          projectRoot: input.projectRoot,
          relativePath: targetPath,
        }).absolutePath,
      );
    } catch {
      return {
        ok: false,
        changedPaths,
        issues: [
          createIdeMirrorRepairApplyIssue({
            affectedPath: input.action.affectedPath,
            failedPath: targetPath,
            reason: "delete-extra-canonical-file-failed",
            expectedHash: input.action.expectedHash,
            changedPaths,
          }),
        ],
      };
    }

    changedPaths.push(targetPath);
  }

  for (const relativeFile of sourceFiles) {
    const targetPath = `${input.action.affectedPath}/${relativeFile}`;
    const sourcePath = path.join(sourceRoot, relativeFile);
    const contents = await readFile(sourcePath);
    const currentHash = await readCurrentHash(input.projectRoot, targetPath);
    const write = await safeWriteFile({
      projectRoot: input.projectRoot,
      relativePath: targetPath,
      contents,
      allowExisting: currentHash !== undefined,
      ...(currentHash === undefined
        ? {}
        : {
            expectedExistingFile: {
              ownership: "installer-owned" as const,
              hash: currentHash,
              artifactRoot: input.artifactRoot,
            },
          }),
      component: "repair-apply",
    });

    if (!write.ok) {
      return {
        ok: false,
        changedPaths,
        issues: [
          {
            ...write.issue,
            details: {
              ...(write.issue.details ?? {}),
              completedSteps: changedPaths.map((changedPath) => `changed:${changedPath}`),
              failedStep: `repair:${targetPath}`,
              pendingSteps: [],
              changedPaths,
              manualAction:
                "Run speclite validate, inspect the failed IDE mirror repair target, then rerun speclite update --repair after resolving the blocker.",
            },
          },
        ],
      };
    }

    changedPaths.push(write.path);
  }

  const appliedHash = await readCanonicalPackageHash(targetRoot);
  if (appliedHash !== input.action.expectedHash) {
    return {
      ok: false,
      changedPaths,
      issues: [
        createIdeMirrorRepairApplyIssue({
          affectedPath: input.action.affectedPath,
          reason: "postcondition-hash-mismatch",
          expectedHash: input.action.expectedHash,
          ...(appliedHash === undefined ? {} : { currentHash: appliedHash }),
          changedPaths,
        }),
      ],
    };
  }

  return {
    ok: true,
    changedPaths,
  };
}

async function readCanonicalPackageFiles(sourceRoot: string): Promise<string[] | undefined> {
  try {
    return await listFiles(sourceRoot, { include: isCanonicalPackageHashFile });
  } catch {
    return undefined;
  }
}

function findIdeMirrorRepairSource(
  affectedPath: string,
  skillIndex?: SkillIndex,
): { sourcePackagePath: string } | undefined {
  if (skillIndex === undefined) return undefined;
  for (const targetId of CANONICAL_TARGET_ORDER) {
    const adapter = getIdeAdapterRegistry().find((candidate) => candidate.id === targetId);
    if (adapter === undefined) continue;
    if (!affectedPath.startsWith(`${adapter.targetDirectory}/`)) continue;
    const canonicalSkillId = affectedPath.slice(`${adapter.targetDirectory}/`.length);
    const entry = skillIndex.entries.find(
      (candidate) =>
        candidate.canonicalSkillId === canonicalSkillId &&
        candidate.installedTargets.includes(targetId),
    );
    if (entry !== undefined) return { sourcePackagePath: entry.sourcePackagePath };
  }
  return undefined;
}

function isIdeMirrorPackagePath(affectedPath: string): boolean {
  return (
    /^\.claude\/skills\/[^/]+$/.test(affectedPath) ||
    /^\.agents\/skills\/[^/]+$/.test(affectedPath)
  );
}

function isIdeMirrorPackageRoot(affectedPath: string): boolean {
  return /^\.(?:claude|agents)\/skills\/[^/]+$/.test(affectedPath);
}

function isCoveredByIdePackageRepair(pathValue: string, repairActionPaths: Set<string>): boolean {
  for (const repairActionPath of repairActionPaths) {
    if (pathValue === repairActionPath || pathValue.startsWith(`${repairActionPath}/`)) return true;
  }
  return false;
}

function createUpdateConflictLifecycleState(input: {
  actions: UpdateCommandData["updatePlan"]["actions"];
  conflicts: UpdateCommandData["conflicts"];
}): Pick<UpdateCommandData, "completedSteps" | "failedStep" | "pendingSteps"> {
  if (input.conflicts.length === 0) return {};

  return {
    completedSteps: ["installed-state-read", "update-plan"],
    failedStep: "conflict-check",
    pendingSteps: [
      "resolve-conflicts",
      ...(hasPlannedWrite(input.actions) ? ["authorize-update-writes", "apply-update-writes"] : []),
    ],
  };
}

function pendingRepairPaths(
  actions: RepairCommandData["repairPlan"]["actions"],
  failedPath: string,
): string[] {
  const failedIndex = actions.findIndex((action) => action.affectedPath === failedPath);
  if (failedIndex < 0) return [];
  return actions
    .slice(failedIndex + 1)
    .filter((action) => action.action !== "skip")
    .map((action) => action.affectedPath);
}

function pendingUpdatePaths(
  actions: UpdateCommandData["updatePlan"]["actions"],
  failedPath: string,
): string[] {
  const failedIndex = actions.findIndex((action) => action.affectedPath === failedPath);
  if (failedIndex < 0) return [];
  return actions
    .slice(failedIndex + 1)
    .filter((action) => action.action === "create" || action.action === "update")
    .map((action) => action.affectedPath);
}

function createUpdateApplyIssue(input: {
  affectedPath: string;
  reason: "missing-files-index-entry" | "missing-source-evidence";
  changedPaths: string[];
  pendingPaths: string[];
}): ValidationIssue {
  return {
    issueId: "source-integrity.missing-source-evidence",
    category: "source-integrity",
    severity: "error",
    affectedPath: input.affectedPath,
    component: "update-apply",
    details: {
      reason: input.reason,
      completedSteps: input.changedPaths.map((changedPath) => `changed:${changedPath}`),
      failedStep: `update:${input.affectedPath}`,
      pendingSteps: input.pendingPaths.map((pendingPath) => `update:${pendingPath}`),
      changedPaths: input.changedPaths,
      manualAction:
        "Run speclite validate, restore the missing canonical source evidence, then rerun speclite update.",
    },
    impact: "SpecLite could not complete the authorized update because the planned source evidence was no longer available.",
    suggestedNextStep: "Run speclite validate, restore source evidence, then rerun speclite update.",
  };
}

function createFilesIndexProjectionIssue(reason: "missing-files-index"): ValidationIssue {
  return {
    issueId: "source-integrity.missing-source-evidence",
    category: "source-integrity",
    severity: "error",
    affectedPath: "_speclite/_config/files-index.json",
    component: "update-files-index-projection",
    details: { reason },
    impact: "SpecLite could not persist the installed-state files-index projection after applying update writes.",
    suggestedNextStep: "Run speclite validate, restore _speclite/_config/files-index.json, then rerun speclite update.",
  };
}

function createRepairApplyIssue(input: {
  affectedPath: string;
  reason: "missing-files-index-entry" | "missing-source-evidence";
  changedPaths: string[];
  pendingPaths: string[];
}): ValidationIssue {
  return {
    issueId: "source-integrity.missing-source-evidence",
    category: "source-integrity",
    severity: "error",
    affectedPath: input.affectedPath,
    component: "repair-apply",
    details: {
      reason: input.reason,
      completedSteps: input.changedPaths.map((changedPath) => `changed:${changedPath}`),
      failedStep: `repair:${input.affectedPath}`,
      pendingSteps: input.pendingPaths.map((pendingPath) => `repair:${pendingPath}`),
      changedPaths: input.changedPaths,
      manualAction:
        "Run speclite validate, restore the missing canonical source evidence, then rerun speclite update --repair.",
    },
    impact: "SpecLite could not complete the authorized repair because the planned source evidence was no longer available.",
    suggestedNextStep: "Run speclite validate, restore source evidence, then rerun speclite update --repair.",
  };
}

function createIdeMirrorRepairApplyIssue(input: {
  affectedPath: string;
  failedPath?: string;
  reason: "delete-extra-canonical-file-failed" | "postcondition-hash-mismatch";
  expectedHash: string;
  currentHash?: string;
  changedPaths: string[];
}): ValidationIssue {
  return {
    issueId: "update.repair-postcondition",
    category: "update",
    severity: "error",
    affectedPath: input.failedPath ?? input.affectedPath,
    component: "repair-apply",
    details: {
      reason: input.reason,
      expectedHash: input.expectedHash,
      ...(input.currentHash === undefined ? {} : { currentHash: input.currentHash }),
      completedSteps: input.changedPaths.map((changedPath) => `changed:${changedPath}`),
      failedStep: `repair:${input.failedPath ?? input.affectedPath}`,
      pendingSteps: [],
      changedPaths: input.changedPaths,
      manualAction:
        "Run speclite validate, inspect the failed IDE mirror repair target, then rerun speclite update --repair after resolving the blocker.",
    },
    impact:
      "SpecLite could not prove the IDE mirror package matches the expected canonical package hash after authorized repair.",
    suggestedNextStep:
      "Run speclite validate, inspect the IDE mirror package contents, then rerun speclite update --repair.",
  };
}

function findInstalledSkillDirs(filesIndex: FilesIndex): string[] {
  const skillDirs = new Set<string>();
  for (const entry of filesIndex.entries) {
    const match = /^(?:\.claude|\.agents)\/skills\/[^/]+\/(?:SKILL\.md|customize\.toml)$/.exec(entry.path);
    if (match === null) continue;
    skillDirs.add(path.posix.dirname(entry.path));
  }
  return [...skillDirs].sort();
}

async function fileExists(targetPath: string): Promise<boolean> {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
}

function hasBlockingResolverIssue(issues: ValidationIssue[]): boolean {
  return issues.some((issue) => issue.severity === "error" || issue.severity === "critical");
}

function emptyUpdateCommandData(): UpdateCommandData {
  return {
    updatePlan: { actions: [] },
    changedPaths: [],
    skippedPaths: [],
    conflicts: [],
    requiresConfirmation: false,
    writeAuthorized: false,
  };
}

function emptyRepairCommandData(): RepairCommandData {
  return {
    repairPlan: { actions: [] },
    changedPaths: [],
    skippedPaths: [],
    conflicts: [],
    requiresConfirmation: false,
    writeAuthorized: false,
  };
}
