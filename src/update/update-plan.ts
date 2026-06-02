import { readFile, unlink } from "node:fs/promises";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import { resolveProjectConfig } from "../config/config-reader.js";
import { resolveSkillCustomization } from "../config/customization-reader.js";
import type {
  RepairCommandData,
  UpdateCommandData,
  ValidationIssue,
} from "../diagnostics/command-result-schema.js";
import { SourceDescriptorSchema, type SourceDescriptor } from "../source/source-descriptor-schema.js";
import { hashBytes, hashFile } from "../manifest/hash.js";
import { hashPackageDirectory, listFiles } from "../manifest/hash.js";
import {
  FilesIndexSchema,
  type FilesIndex,
  type SkillIndex,
  SkillIndexSchema,
  isProjectRelativePosixPath,
} from "../manifest/manifest-schema.js";
import { resolveProjectRelativePath } from "../fs/path-normalizer.js";
import { safeWriteFile } from "../fs/safe-write.js";
import {
  createMissingSourceEvidenceConflict,
  detectFilesIndexEntryConflict,
  detectIdeMirrorConflicts,
} from "./conflict-detector.js";
import { classifyOwnership } from "./ownership-model.js";
import { CANONICAL_TARGET_ORDER, getIdeAdapterRegistry } from "../ide/adapter-registry.js";
import { isCanonicalPackageHashFile } from "../validation/rules/ide-mirror.js";

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
  const conflicts: UpdateCommandData["conflicts"] = [...context.conflicts];

  for (const entry of context.filesIndex.entries) {
    const currentHash = await readCurrentHash(input.projectRoot, entry.path);
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

    const conflict = detectFilesIndexEntryConflict({
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

    const sourceHash = await readSourceHash({
      projectRoot: input.projectRoot,
      sourceRef: entry.sourceRef,
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
      currentHash === entry.hash &&
      sourceHash !== undefined &&
      sourceHash !== entry.hash
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

  const writeAuthorized = input.writeAuthorized === true && conflicts.length === 0 && hasPlannedWrite(actions);
  const applyResult = writeAuthorized
    ? await applyUpdateActions({
        projectRoot: input.projectRoot,
        artifactRoot: context.artifactRoot,
        actions,
        filesIndex: context.filesIndex,
      })
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
          sourceRef: entry.sourceRef,
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
  skillIndex?: SkillIndex;
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
      skillIndex: undefined,
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
      skillIndex: undefined,
    };
  }
  const artifactRoot = manifestContext.artifactRoot;
  for (const skillDir of findInstalledSkillDirs(filesIndex)) {
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
    ...(skillIndex === undefined ? {} : { skillIndex }),
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
  sourceDescriptor?: SourceDescriptor;
  issues: ValidationIssue[];
}> {
  try {
    const parsed = parseYaml(
      await readFile(path.join(projectRoot, "_speclite/_config/manifest.yaml"), "utf8"),
    ) as unknown;
    const artifactRoot = readArtifactRootFromManifest(parsed);
    const sourceDescriptorResult = readSourceDescriptorFromManifest(parsed);
    if (sourceDescriptorResult.issue !== undefined) {
      return { artifactRoot, issues: [sourceDescriptorResult.issue] };
    }
    const sourceIssue = validateSourceDescriptorForUpdate(sourceDescriptorResult.sourceDescriptor);
    return {
      artifactRoot,
      sourceDescriptor: sourceDescriptorResult.sourceDescriptor,
      issues: sourceIssue === undefined ? [] : [sourceIssue],
    };
  } catch {
    return {
      artifactRoot: "_speclite-output",
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

async function readSourceEvidence(input: {
  projectRoot: string;
  sourceRef: string;
}): Promise<Buffer | undefined> {
  if (!isProjectRelativePosixPath(input.sourceRef)) return undefined;

  try {
    return await readFile(
      resolveProjectRelativePath({
        projectRoot: input.projectRoot,
        relativePath: input.sourceRef,
      }).absolutePath,
    );
  } catch {
    return undefined;
  }
}

async function readRepairCandidateBytes(input: {
  projectRoot: string;
  sourceRef: string;
}): Promise<Buffer | undefined> {
  return readSourceEvidence(input);
}

function shouldRequireSourceEvidence(sourceRef: string): boolean {
  return !sourceRef.includes(":") && isProjectRelativePosixPath(sourceRef);
}

async function readSourceHash(input: {
  projectRoot: string;
  sourceRef: string;
}): Promise<`sha256:${string}` | undefined> {
  const sourceBytes = await readSourceEvidence(input);
  return sourceBytes === undefined ? undefined : hashBytes(sourceBytes);
}

async function applyUpdateActions(input: {
  projectRoot: string;
  artifactRoot: string;
  actions: UpdateCommandData["updatePlan"]["actions"];
  filesIndex: FilesIndex;
}): Promise<{
  changedPaths: string[];
  skippedPaths: string[];
  issues: ValidationIssue[];
  blocked: boolean;
}> {
  const changedPaths: string[] = [];
  const skippedPaths: string[] = [];
  const appliedActions: UpdateCommandData["updatePlan"]["actions"] = [];

  for (const action of input.actions) {
    if (action.action === "skip") {
      if (action.reason === "human-owned" || action.reason === "workflow-owned") {
        skippedPaths.push(action.affectedPath);
      }
      continue;
    }
    if (action.action === "conflict") continue;

    const entry = input.filesIndex.entries.find((candidate) => candidate.path === action.affectedPath);
    if (entry === undefined) {
      return {
        changedPaths,
        skippedPaths,
        issues: [
          createUpdateApplyIssue({
            affectedPath: action.affectedPath,
            reason: "missing-files-index-entry",
            changedPaths,
            pendingPaths: pendingUpdatePaths(input.actions, action.affectedPath),
          }),
        ],
        blocked: true,
      };
    }

    const sourceBytes = await readSourceEvidence({
      projectRoot: input.projectRoot,
      sourceRef: entry.sourceRef,
    });
    if (sourceBytes === undefined) {
      return {
        changedPaths,
        skippedPaths,
        issues: [
          createUpdateApplyIssue({
            affectedPath: action.affectedPath,
            reason: "missing-source-evidence",
            changedPaths,
            pendingPaths: pendingUpdatePaths(input.actions, action.affectedPath),
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
      component: "update-apply",
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
              failedStep: `update:${action.affectedPath}`,
              pendingSteps: pendingUpdatePaths(input.actions, action.affectedPath).map(
                (pendingPath) => `update:${pendingPath}`,
              ),
              changedPaths,
              manualAction:
                "Run speclite validate, inspect the failed update target, then rerun speclite update after resolving the blocker.",
            },
          },
        ],
        blocked: true,
      };
    }

    changedPaths.push(write.path);
    appliedActions.push(action);
  }

  const projectionResult = await syncAppliedFilesIndexProjection({
    projectRoot: input.projectRoot,
    artifactRoot: input.artifactRoot,
    filesIndex: input.filesIndex,
    appliedActions,
  });
  if (!projectionResult.ok) {
    return {
      changedPaths,
      skippedPaths,
      issues: [
        {
          ...projectionResult.issue,
          details: {
            ...(projectionResult.issue.details ?? {}),
            completedSteps: changedPaths.map((changedPath) => `changed:${changedPath}`),
            failedStep: "update:_speclite/_config/files-index.json",
            pendingSteps: [],
            changedPaths,
            manualAction:
              "Run speclite validate, inspect _speclite/_config/files-index.json, then rerun speclite update after resolving the projection write blocker.",
          },
        },
      ],
      blocked: true,
    };
  }
  if (projectionResult.changedPath !== undefined) {
    changedPaths.push(projectionResult.changedPath);
  }

  return {
    changedPaths,
    skippedPaths,
    issues: [],
    blocked: false,
  };
}

async function syncAppliedFilesIndexProjection(input: {
  projectRoot: string;
  artifactRoot: string;
  filesIndex: FilesIndex;
  appliedActions: UpdateCommandData["updatePlan"]["actions"];
}): Promise<
  | { ok: true; changedPath?: string }
  | { ok: false; issue: ValidationIssue }
> {
  const appliedByPath = new Map(
    input.appliedActions
      .filter((action) => action.action === "create" || action.action === "update")
      .map((action) => [action.affectedPath, action] as const),
  );
  if (appliedByPath.size === 0) return { ok: true };

  const projectedFilesIndex: FilesIndex = {
    ...input.filesIndex,
    entries: input.filesIndex.entries.map((entry) => {
      const applied = appliedByPath.get(entry.path);
      if (applied?.expectedHash === undefined) return entry;
      return {
        ...entry,
        hash: applied.expectedHash,
      };
    }),
  };
  const filesIndexPath = "_speclite/_config/files-index.json";
  const currentHash = await readCurrentHash(input.projectRoot, filesIndexPath);
  if (currentHash === undefined) {
    return {
      ok: false,
      issue: createFilesIndexProjectionIssue("missing-files-index"),
    };
  }

  const write = await safeWriteFile({
    projectRoot: input.projectRoot,
    relativePath: filesIndexPath,
    contents: `${JSON.stringify(projectedFilesIndex, null, 2)}\n`,
    allowExisting: true,
    expectedExistingFile: {
      ownership: "installer-owned",
      hash: currentHash,
      artifactRoot: input.artifactRoot,
    },
    component: "update-files-index-projection",
  });
  if (!write.ok) return { ok: false, issue: write.issue };

  return { ok: true, changedPath: write.path };
}

async function planIdeMirrorRepairActions(input: {
  projectRoot: string;
  skillIndex?: SkillIndex;
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
      const sourceRoot = resolveProjectRelativePath({
        projectRoot: input.projectRoot,
        relativePath: entry.sourcePackagePath,
      }).absolutePath;
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
      sourceRef: entry.sourceRef,
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

  const sourceRoot = resolveProjectRelativePath({
    projectRoot: input.projectRoot,
    relativePath: match.sourcePackagePath,
  }).absolutePath;
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
    const sourcePath = resolveProjectRelativePath({
      projectRoot: input.projectRoot,
      relativePath: `${match.sourcePackagePath}/${relativeFile}`,
    }).absolutePath;
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
