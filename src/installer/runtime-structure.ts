import { readFile } from "node:fs/promises";
import type { ValidationIssue } from "../diagnostics/command-result-schema.js";
import {
  PERSONAL_CUSTOM_CONFIG_TOML_HEADER,
  TEAM_CUSTOM_CONFIG_TOML_HEADER,
  serializeConfigToml,
} from "../config/config-writer.js";
import type { ProjectConfigModel } from "../config/config-schema.js";
import { appendUserConfigGitignoreRules } from "../config/user-config-gitignore.js";
import { ensureSafeDirectory, acquireProjectOperationLock, safeWriteFile } from "../fs/safe-write.js";
import { createConfiguredIdeTargets, createFilesIndex, createHelpIndex, createInstalledManifest, createPhaseCoverage, createSkillIndex, type ArtifactRootContext } from "../manifest/manifest-generator.js";
import { hashBytes, hashFile } from "../manifest/hash.js";
import type { FilesIndexEntry } from "../manifest/manifest-schema.js";
import type { OfficialModule } from "../modules/module-metadata.js";
import type { SourceDescriptor } from "../source/source-descriptor-schema.js";
import { CANONICAL_TARGET_ORDER, type IdeTargetId } from "../ide/adapter-registry.js";
import { writeIdeMirrors } from "../ide/target-writer.js";
import type { ConfigInitializationResult } from "./config-initialization.js";
import { detectFlowGateHookConfigConflict, writeFlowGateHookArtifacts } from "./hook-artifacts.js";
import type { InstallPlan, PlannedWrite } from "./install-plan-schema.js";

const COMPAT_RUNTIME_SCRIPTS = [
  "resolve_config.py",
  "resolve_customization.py",
] as const;

export type ApplyInstallPlanResult =
  | {
      ok: true;
      installedModules: string[];
      ideTargets: ReturnType<typeof createConfiguredIdeTargets>;
      paths: {
        projectRoot: ".";
        specliteRoot: "_speclite";
        artifactRoot: string;
        manifestPath: "_speclite/_config/manifest.yaml";
      };
    }
  | {
      ok: false;
      issue: ValidationIssue;
      completedSteps: string[];
      pendingSteps: string[];
      changedPaths: string[];
    };

export async function applyInstallPlan(input: {
  targetRoot: string;
  packageRoot: string;
  sourceRoot?: string;
  sourceRefRoot?: string;
  sourceDescriptor: SourceDescriptor;
  installPlan: InstallPlan;
  selectedModules: OfficialModule[];
  configPlan: Extract<ConfigInitializationResult, { ok: true }>;
}): Promise<ApplyInstallPlanResult> {
  if (!input.installPlan.writeAuthorized) {
    return {
      ok: false,
      issue: {
        issueId: "operation-lock.project-locked",
        category: "operation-lock",
        severity: "error",
        component: "write-authorization",
        details: {
          reason: "write-not-authorized",
        },
        impact: "Runtime structure writes require confirmed install planning state.",
        suggestedNextStep: "Confirm the final configuration summary before starting the write phase.",
      },
      completedSteps: [],
      pendingSteps: createApplyPendingSteps([]),
      changedPaths: [],
    };
  }

  const blockedSourceDescriptor =
    input.installPlan.sourceDescriptor.trustStatus === "blocked"
      ? input.installPlan.sourceDescriptor
      : input.sourceDescriptor.trustStatus === "blocked"
        ? input.sourceDescriptor
        : undefined;
  if (blockedSourceDescriptor !== undefined) {
    return {
      ok: false,
      issue: createBlockedSourceIssue(blockedSourceDescriptor),
      completedSteps: [],
      pendingSteps: createApplyPendingSteps([]),
      changedPaths: [],
    };
  }

  const selectedTargetIds = CANONICAL_TARGET_ORDER.filter((targetId) =>
    input.installPlan.targetAdapters.some((adapter) => adapter.targetId === targetId),
  );
  const hookConfigConflict = await detectFlowGateHookConfigConflict({
    projectRoot: input.targetRoot,
    targetIds: selectedTargetIds,
  });
  if (hookConfigConflict !== undefined) {
    return createApplyFailure(hookConfigConflict, [], []);
  }

  const lock = await acquireProjectOperationLock({
    projectRoot: input.targetRoot,
    operation: "install",
  });
  if (!lock.ok) return createApplyFailure(lock.issue, [], []);

  const fileEntries: FilesIndexEntry[] = [];
  const completedSteps: string[] = [];
  const changedPaths: string[] = [];
  const paths = {
    projectRoot: "." as const,
    specliteRoot: "_speclite" as const,
    artifactRoot: input.configPlan.model.core.output_folder,
    manifestPath: "_speclite/_config/manifest.yaml" as const,
  };
  const artifactRoots = createArtifactRootContext(input.configPlan.model);
  const canonicalSourceRoot =
    input.sourceRoot ?? `${input.packageRoot}/assets/source/speclite`;
  const canonicalSourceRefRoot = input.sourceRefRoot ?? "assets/source/speclite";

  try {
    for (const directory of [
      "_speclite/_config",
      "_speclite/custom",
      ...createArtifactDirectories(input.configPlan.model, input.selectedModules),
    ]) {
      const created = await ensureSafeDirectory({
        projectRoot: input.targetRoot,
        relativePath: directory,
      });
      if (!created.ok) return createApplyFailure(created.issue, completedSteps, changedPaths);
    }
    completedSteps.push("runtime-structure");

    const configWrites = [
      {
        path: "_speclite/config.toml",
        contents: serializeConfigToml(input.configPlan.configToml, { header: "installer-config" }),
        artifactKind: "runtime-config",
        sourceRef: "install-plan:project-config",
      },
      {
        path: "_speclite/config.user.toml",
        contents: serializeConfigToml(input.configPlan.configUserToml, {
          header: "installer-user-config",
        }),
        artifactKind: "runtime-config",
        sourceRef: "install-plan:project-user-config",
      },
    ];

    for (const write of configWrites) {
      const result = await safeWriteFile({
        projectRoot: input.targetRoot,
        relativePath: write.path,
        contents: write.contents,
        component: "runtime-structure-writer",
      });
      if (!result.ok) return createApplyFailure(result.issue, completedSteps, changedPaths);
      changedPaths.push(result.path);
      fileEntries.push({
        schemaVersion: "speclite.files-index.v1",
        path: result.path,
        ownership: "installer-owned",
        hash: result.hash,
        hashAlgorithm: "sha256",
        executable: result.executable,
        artifactKind: write.artifactKind,
        sourceRef: write.sourceRef,
      });
    }

    for (const scriptName of COMPAT_RUNTIME_SCRIPTS) {
      const compatScript = await readCompatibilityScript({
        packageRoot: input.packageRoot,
        canonicalSourceRoot,
        canonicalSourceRefRoot,
        scriptName,
      });
      const result = await safeWriteFile({
        projectRoot: input.targetRoot,
        relativePath: `_speclite/scripts/${scriptName}`,
        contents: compatScript.bytes,
        executable: true,
        component: "runtime-compat-script-writer",
      });
      if (!result.ok) return createApplyFailure(result.issue, completedSteps, changedPaths);
      changedPaths.push(result.path);
      fileEntries.push({
        schemaVersion: "speclite.files-index.v1",
        path: result.path,
        ownership: "installer-owned",
        hash: result.hash,
        hashAlgorithm: "sha256",
        executable: result.executable,
        artifactKind: "runtime-compat-script",
        sourceRef: compatScript.sourceRef,
      });
    }

    for (const plannedWrite of input.configPlan.plannedWrites.filter(
      (write) => write.ownership === "human-owned",
    )) {
      if (plannedWrite.path === ".gitignore") {
        const gitignoreResult = await applyGitignorePlan({
          projectRoot: input.targetRoot,
          plannedWrite,
        });
        if (!gitignoreResult.ok) {
          return createApplyFailure(gitignoreResult.issue, completedSteps, changedPaths);
        }
        if (gitignoreResult.entry !== undefined) {
          changedPaths.push(...gitignoreResult.changedPaths);
          fileEntries.push(gitignoreResult.entry);
        }
        continue;
      }

      if (plannedWrite.action === "create") {
        const result = await safeWriteFile({
          projectRoot: input.targetRoot,
          relativePath: plannedWrite.path,
          contents: createHumanStubContents(plannedWrite.path),
          component: "human-owned-stub-writer",
        });
        if (!result.ok) return createApplyFailure(result.issue, completedSteps, changedPaths);
        changedPaths.push(result.path);
        fileEntries.push({
          schemaVersion: "speclite.files-index.v1",
          path: result.path,
          ownership: "human-owned",
          hash: result.hash,
          hashAlgorithm: "sha256",
          executable: false,
          artifactKind: "project-custom-stub",
          sourceRef: "install-plan:human-owned-stub",
        });
      } else {
        const existingHash = await hashFile(`${input.targetRoot}/${plannedWrite.path}`);
        fileEntries.push({
          schemaVersion: "speclite.files-index.v1",
          path: plannedWrite.path,
          ownership: "human-owned",
          hash: existingHash,
          hashAlgorithm: "sha256",
          executable: false,
          artifactKind: "project-custom-stub",
          sourceRef: "install-plan:protected-existing-human-owned-stub",
        });
      }
    }

    const mirror = await writeIdeMirrors({
      projectRoot: input.targetRoot,
      packageRoot: input.packageRoot,
      ...(input.sourceRoot === undefined ? {} : { sourceRoot: input.sourceRoot }),
      ...(input.sourceRefRoot === undefined ? {} : { sourceRefRoot: input.sourceRefRoot }),
      selectedModules: input.selectedModules,
      targetAdapters: input.installPlan.targetAdapters,
      artifactRoots,
      onChangedPath: (relativePath) => {
        changedPaths.push(relativePath);
      },
    });
    if (!mirror.ok) return createApplyFailure(mirror.issue, completedSteps, changedPaths);

    fileEntries.push(...mirror.files);
    completedSteps.push("ide-mirror-creation");

    const hookArtifacts = await writeFlowGateHookArtifacts({
      projectRoot: input.targetRoot,
      canonicalSourceRoot,
      canonicalSourceRefRoot,
      targetIds: selectedTargetIds,
    });
    changedPaths.push(...hookArtifacts.changedPaths);
    if (!hookArtifacts.ok) return createApplyFailure(hookArtifacts.issue, completedSteps, changedPaths);
    fileEntries.push(...hookArtifacts.files);

    const manifest = createInstalledManifest({
      sourceDescriptor: input.sourceDescriptor,
      installedModules: input.installPlan.selectedModules,
      targetIds: selectedTargetIds,
      paths,
    });
    const skillIndex = createSkillIndex(mirror.skillIndexEntries);
    const helpIndex = createHelpIndex(mirror.helpIndexEntries);
    const phaseCoverage = createPhaseCoverage(mirror.phaseCoverageRows);

    const generatedIndexes = [
      {
        path: "_speclite/_config/manifest.yaml",
        contents: JSON.stringify(manifest, null, 2),
        artifactKind: "manifest",
        sourceRef: "installed-state:manifest",
      },
      {
        path: "_speclite/_config/skill-index.json",
        contents: JSON.stringify(skillIndex, null, 2),
        artifactKind: "skill-index",
        sourceRef: "installed-state:skill-index",
      },
      {
        path: "_speclite/_config/help-index.json",
        contents: JSON.stringify(helpIndex, null, 2),
        artifactKind: "help-index",
        sourceRef: "installed-state:help-index",
      },
      {
        path: "_speclite/_config/phase-coverage.json",
        contents: JSON.stringify(phaseCoverage, null, 2),
        artifactKind: "phase-coverage",
        sourceRef: "installed-state:phase-coverage",
      },
    ];

    for (const index of generatedIndexes) {
      const result = await safeWriteFile({
        projectRoot: input.targetRoot,
        relativePath: index.path,
        contents: `${index.contents}\n`,
        component: "manifest-generator",
      });
      if (!result.ok) return createApplyFailure(result.issue, completedSteps, changedPaths);
      changedPaths.push(result.path);
      fileEntries.push({
        schemaVersion: "speclite.files-index.v1",
        path: result.path,
        ownership: "installer-owned",
        hash: result.hash,
        hashAlgorithm: "sha256",
        executable: false,
        artifactKind: index.artifactKind,
        sourceRef: index.sourceRef,
      });
    }

    const filesIndex = createFilesIndex(fileEntries);
    const filesIndexWrite = await safeWriteFile({
      projectRoot: input.targetRoot,
      relativePath: "_speclite/_config/files-index.json",
      contents: `${JSON.stringify(filesIndex, null, 2)}\n`,
      component: "manifest-generator",
    });
    if (!filesIndexWrite.ok) return createApplyFailure(filesIndexWrite.issue, completedSteps, changedPaths);
    changedPaths.push(filesIndexWrite.path);
    completedSteps.push("manifest-generation");

    return {
      ok: true,
      installedModules: input.installPlan.selectedModules,
      ideTargets: createConfiguredIdeTargets({
        targetIds: selectedTargetIds,
        skillCounts: mirror.targetSkillCounts,
      }),
      paths,
    };
  } finally {
    await lock.lock.release();
  }
}

function createApplyFailure(
  issue: ValidationIssue,
  completedSteps: string[],
  changedPaths: string[],
): Extract<ApplyInstallPlanResult, { ok: false }> {
  const stableChangedPaths = [...new Set(changedPaths)].sort();
  return {
    ok: false,
    issue: addPartialFailureChangedPaths(issue, stableChangedPaths),
    completedSteps: [...completedSteps],
    pendingSteps: createApplyPendingSteps(completedSteps),
    changedPaths: stableChangedPaths,
  };
}

function addPartialFailureChangedPaths(issue: ValidationIssue, changedPaths: string[]): ValidationIssue {
  if (changedPaths.length === 0) return issue;

  const manualAction =
    "Review the listed changedPaths before rerunning the command; only completed safe-write rename paths are included.";
  const details = issue.details ?? {};
  return {
    ...issue,
    details: {
      ...details,
      changedPaths,
      manualAction:
        typeof details.manualAction === "string"
          ? `${details.manualAction} ${manualAction}`
          : manualAction,
    },
  };
}

function createBlockedSourceIssue(sourceDescriptor: SourceDescriptor): ValidationIssue {
  return {
    issueId: "source-integrity.blocked-source",
    category: "source-integrity",
    severity: "error",
    component: "install-plan-apply",
    details: {
      reason: "blocked-source",
      sourceType: sourceDescriptor.sourceType,
    },
    impact: "Blocked source descriptors cannot enter the install write phase.",
    suggestedNextStep: "Resolve the source-integrity issue before enabling install writes.",
  };
}

function createApplyPendingSteps(completedSteps: string[]): string[] {
  const completed = new Set(completedSteps);
  return [
    "runtime-structure",
    "ide-mirror-creation",
    "manifest-generation",
    "ready-check",
    "ready-summary",
  ].filter((step) => !completed.has(step));
}

function createArtifactDirectories(model: ProjectConfigModel, modules: OfficialModule[]): string[] {
  const values = createArtifactRootContext(model);
  const directories = [
    model.core.output_folder,
    values.planning_artifacts,
    values.implementation_artifacts,
    values.devops_artifacts,
    values.project_knowledge,
    ...modules.flatMap((module) => module.directories),
  ];

  return [...new Set(directories.map((directory) => interpolateDirectory(directory, values)))].sort();
}

async function readCompatibilityScript(input: {
  packageRoot: string;
  canonicalSourceRoot: string;
  canonicalSourceRefRoot: string;
  scriptName: string;
}): Promise<{
  bytes: Buffer;
  sourceRef: string;
}> {
  const sourcePath = `${input.canonicalSourceRoot}/scripts/${input.scriptName}`;
  try {
    return {
      bytes: await readFile(sourcePath),
      sourceRef: `${input.canonicalSourceRefRoot}/scripts/${input.scriptName}`,
    };
  } catch (error) {
    if (!isMissingPathError(error)) throw error;
  }

  return {
    bytes: await readFile(`${input.packageRoot}/assets/source/speclite/scripts/${input.scriptName}`),
    sourceRef: `bundled-runtime-compat:scripts/${input.scriptName}`,
  };
}

function createArtifactRootContext(model: ProjectConfigModel): ArtifactRootContext {
  return {
    output_folder: model.core.output_folder,
    planning_artifacts:
      model.modules.sdlc?.planning_artifacts ?? `${model.core.output_folder}/planning-artifacts`,
    implementation_artifacts:
      model.modules.sdlc?.implementation_artifacts ?? `${model.core.output_folder}/implementation-artifacts`,
    devops_artifacts:
      model.modules.sdlc?.devops_artifacts ?? `${model.core.output_folder}/devops-artifacts`,
    project_knowledge: model.modules.sdlc?.project_knowledge ?? "docs",
  };
}

function interpolateDirectory(
  template: string,
  values: {
    output_folder: string;
    planning_artifacts: string;
    implementation_artifacts: string;
    devops_artifacts: string;
    project_knowledge: string;
  },
): string {
  return template
    .replaceAll("{output_folder}", values.output_folder)
    .replaceAll("{planning_artifacts}", values.planning_artifacts)
    .replaceAll("{implementation_artifacts}", values.implementation_artifacts)
    .replaceAll("{devops_artifacts}", values.devops_artifacts)
    .replaceAll("{project_knowledge}", values.project_knowledge);
}

function createHumanStubContents(relativePath: string): string {
  if (relativePath.endsWith("config.user.toml")) {
    return `${PERSONAL_CUSTOM_CONFIG_TOML_HEADER}\n`;
  }

  return `${TEAM_CUSTOM_CONFIG_TOML_HEADER}\n`;
}

function isMissingPathError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}

async function applyGitignorePlan(input: {
  projectRoot: string;
  plannedWrite: PlannedWrite;
}): Promise<
  | {
      ok: true;
      entry?: FilesIndexEntry;
      changedPaths: string[];
    }
  | {
      ok: false;
      issue: ValidationIssue;
    }
> {
  const relativePath = input.plannedWrite.path;
  if (input.plannedWrite.action === "skip") {
    const existingHash = await hashFile(`${input.projectRoot}/${relativePath}`);
    return {
      ok: true,
      changedPaths: [],
      entry: {
        schemaVersion: "speclite.files-index.v1",
        path: relativePath,
        ownership: "human-owned",
        hash: existingHash,
        hashAlgorithm: "sha256",
        executable: false,
        artifactKind: "gitignore",
        sourceRef: "install-plan:user-config-gitignore",
      },
    };
  }

  const existing =
    input.plannedWrite.action === "update"
      ? await readFile(`${input.projectRoot}/${relativePath}`, "utf8")
      : "";
  const result = await safeWriteFile({
    projectRoot: input.projectRoot,
    relativePath,
    contents: appendUserConfigGitignoreRules(existing),
    component: "gitignore-writer",
    allowExisting: input.plannedWrite.action === "update",
    ...(input.plannedWrite.action === "update"
      ? {
          expectedExistingFile: {
            ownership: "human-owned" as const,
            hash: hashBytes(existing),
          },
          allowHumanOwnedExistingFile: true,
        }
      : {}),
  });
  if (!result.ok) return { ok: false, issue: result.issue };

  return {
    ok: true,
    changedPaths: [result.path],
    entry: {
      schemaVersion: "speclite.files-index.v1",
      path: result.path,
      ownership: "human-owned",
      hash: result.hash,
      hashAlgorithm: "sha256",
      executable: false,
      artifactKind: "gitignore",
      sourceRef: "install-plan:user-config-gitignore",
    },
  };
}
