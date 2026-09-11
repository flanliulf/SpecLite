import { lstat, readFile } from "node:fs/promises";
import path from "node:path";
import {
  interpolateConfigDefault,
  normalizeProjectRelativeConfigPath,
  toPortableProjectPath,
  trimOrDefault,
  type ConfigCollectionMode,
  type ConfigInputValues,
  type ConfigTomlDocument,
  type ProjectConfigField,
  type ProjectConfigModel,
  type RuntimeAgentDescriptor,
} from "../config/config-schema.js";
import {
  ARTIFACT_ROOT_REGISTRY,
  resolveArtifactRoots,
  type ArtifactRootField,
  type ArtifactRootResolution,
} from "../config/artifact-root-resolver.js";
import { hasUserConfigGitignoreCoverage } from "../config/user-config-gitignore.js";
import type { ValidationIssue } from "../diagnostics/command-result-schema.js";
import type { OfficialModule } from "../modules/module-metadata.js";
import { createRuntimeHookDescriptors } from "./hook-artifacts.js";
import type { InstallPlanTargetAdapter, PlannedWrite } from "./install-plan-schema.js";

const INSTALLER_CONFIG_PATH = "_speclite/config.toml";
const INSTALLER_USER_CONFIG_PATH = "_speclite/config.user.toml";
const HUMAN_CUSTOM_CONFIG_PATH = "_speclite/custom/config.toml";
const HUMAN_CUSTOM_USER_CONFIG_PATH = "_speclite/custom/config.user.toml";
const GITIGNORE_PATH = ".gitignore";

export type ConfigInitializationPromptInput = {
  defaultMode: ConfigCollectionMode;
  selectedModuleIds: string[];
  targetAdapters: InstallPlanTargetAdapter[];
  prompt: string;
};

export type ConfigInitializationSelection = {
  mode?: ConfigCollectionMode;
  values?: ConfigInputValues;
  selectedModuleIds?: string[];
  ideTargetIds?: string[];
};

export type ConfigInitializationResult =
  | {
      ok: true;
      mode: ConfigCollectionMode;
      model: ProjectConfigModel;
      artifactRoots: ArtifactRootResolution[];
      configToml: ConfigTomlDocument;
      configUserToml: ConfigTomlDocument;
      plannedWrites: PlannedWrite[];
      summary: string;
      nextActions: string[];
    }
  | {
      ok: false;
      issues: ValidationIssue[];
      plannedWrites: [];
      summary: string;
      nextActions: string[];
    };

export async function createConfigInitializationPlan(input: {
  targetRoot: string;
  targetProject: string;
  selectedModules: OfficialModule[];
  mode?: ConfigCollectionMode;
  values?: ConfigInputValues;
  selectedModuleIds?: string[];
  ideTargetIds?: string[];
  targetAdapters?: InstallPlanTargetAdapter[];
}): Promise<ConfigInitializationResult> {
  const mode = input.mode ?? "quick";
  const values = input.values ?? {};
  const outputFolder = normalizeFieldPath({
    field: "output_folder",
    value: trimOrDefault(
      values.output_folder,
      promptDefault(input.selectedModules, "output_folder", "_speclite-output", {
        directory_name: input.targetProject,
      }),
    ),
  });

  if (!outputFolder.ok) {
    return createConfigInitializationFailure([outputFolder.issue]);
  }

  const core = {
    project_name: trimOrDefault(
      values.project_name,
      promptDefault(input.selectedModules, "project_name", input.targetProject, {
        directory_name: input.targetProject,
        output_folder: outputFolder.path,
      }),
    ),
    user_name: trimOrDefault(
      values.user_name,
      promptDefault(input.selectedModules, "user_name", "SpecLite", {
        directory_name: input.targetProject,
        output_folder: outputFolder.path,
      }),
    ),
    communication_language: trimOrDefault(
      values.communication_language,
      promptDefault(input.selectedModules, "communication_language", "Chinese", {
        directory_name: input.targetProject,
        output_folder: outputFolder.path,
      }),
    ),
    document_output_language: trimOrDefault(
      values.document_output_language,
      promptDefault(input.selectedModules, "document_output_language", "Chinese", {
        directory_name: input.targetProject,
        output_folder: outputFolder.path,
      }),
    ),
    output_folder: outputFolder.path,
  };
  const artifactRootResolution = await resolveArtifactRoots({
    projectRoot: input.targetRoot,
    lifecycle: "fresh",
    config: createFreshArtifactRootConfig({
      outputFolder: outputFolder.path,
      values,
    }),
  });

  if (!artifactRootResolution.ok) {
    return createConfigInitializationFailure(artifactRootResolution.issues);
  }

  const artifactRoots = artifactRootResolution.roots;

  const sdlcConfig =
    input.selectedModules.some((module) => module.code === "sdlc")
      ? createSdlcConfig({
          selectedModules: input.selectedModules,
          targetProject: input.targetProject,
          outputFolder: outputFolder.path,
          values,
          artifactRoots,
        })
      : undefined;

  if (sdlcConfig !== undefined && !sdlcConfig.ok) {
    return createConfigInitializationFailure([sdlcConfig.issue]);
  }

  const model: ProjectConfigModel = {
    core: {
      ...core,
      brainstorming_artifacts: requireArtifactRoot(artifactRoots, "brainstorming_artifacts"),
    },
    modules: {
      ...(sdlcConfig === undefined ? {} : { sdlc: sdlcConfig.config }),
    },
  };

  const configToml = createInstallerConfigToml(model, input.selectedModules);
  const configUserToml = createInstallerUserConfigToml(model);
  const plannedWrites = [
    {
      path: INSTALLER_CONFIG_PATH,
      ownership: "installer-owned",
      action: "create",
      reason: "project-config-defaults",
    },
    {
      path: INSTALLER_USER_CONFIG_PATH,
      ownership: "installer-owned",
      action: "create",
      reason: "install-time-user-config",
    },
    ...(await createHumanOwnedStubPlans(input.targetRoot)),
    await createGitignorePlan(input.targetRoot),
  ] satisfies PlannedWrite[];

  return {
    ok: true,
    mode,
    model,
    artifactRoots,
    configToml,
    configUserToml,
    plannedWrites,
    summary: createFinalConfigSummary({
      mode,
      model,
      artifactRoots,
      plannedWrites,
      selectedModules: input.selectedModules,
      selectedModuleIds:
        input.selectedModuleIds ?? input.selectedModules.map((module) => module.code).sort(),
      ideTargetIds:
        input.ideTargetIds ??
        (input.targetAdapters ?? []).map((adapter) => adapter.targetId).sort(),
    }),
    nextActions: [
      "Review and explicitly confirm the final configuration summary before any project files are written.",
      "Continue to runtime structure and IDE mirror creation only after confirmation.",
    ],
  };
}

export function createConfigInitializationPromptInput(input: {
  selectedModules: OfficialModule[];
  targetAdapters?: InstallPlanTargetAdapter[];
}): ConfigInitializationPromptInput {
  const selectedModuleIds = input.selectedModules.map((module) => module.code).sort();
  const targetAdapters = input.targetAdapters ?? [];

  return {
    defaultMode: "quick",
    selectedModuleIds,
    targetAdapters,
    prompt: [
      "Choose project configuration mode before any files are written.",
      "Quick config uses deterministic defaults for project/user/language/artifact paths and asks only for the minimum required fields.",
      "Detailed config lets you adjust project fields, module artifact paths, selected modules and IDE targets from the already confirmed install planning state.",
      "Defaults and resolved project-relative paths will be shown in the final configuration summary.",
      "This stage does not write _speclite, _speclite-output, IDE mirror files, manifest/index files or operation locks.",
      "Enter quick or detailed. Press Enter to use quick: ",
    ].join("\n"),
  };
}

function createSdlcConfig(input: {
  selectedModules: OfficialModule[];
  targetProject: string;
  outputFolder: string;
  values: ConfigInputValues;
  artifactRoots: ArtifactRootResolution[];
}):
  | {
      ok: true;
      config: NonNullable<ProjectConfigModel["modules"]["sdlc"]>;
    }
  | {
      ok: false;
      issue: ValidationIssue;
    } {
  return {
    ok: true,
    config: {
      user_skill_level: trimOrDefault(
        input.values.user_skill_level,
        promptDefault(input.selectedModules, "user_skill_level", "intermediate", {
          directory_name: input.targetProject,
          output_folder: input.outputFolder,
        }),
      ),
      analysis_artifacts: requireArtifactRoot(input.artifactRoots, "analysis_artifacts"),
      planning_artifacts: requireArtifactRoot(input.artifactRoots, "planning_artifacts"),
      solutioning_artifacts: requireArtifactRoot(input.artifactRoots, "solutioning_artifacts"),
      implementation_artifacts: requireArtifactRoot(input.artifactRoots, "implementation_artifacts"),
      devops_artifacts: requireArtifactRoot(input.artifactRoots, "devops_artifacts"),
      project_knowledge: requireArtifactRoot(input.artifactRoots, "project_knowledge"),
    },
  };
}

function createInstallerConfigToml(
  model: ProjectConfigModel,
  selectedModules: OfficialModule[],
): ConfigTomlDocument {
  const document: ConfigTomlDocument = {
    core: {
      project_name: model.core.project_name,
      document_output_language: model.core.document_output_language,
      output_folder: toPortableProjectPath(model.core.output_folder),
      ...(model.core.brainstorming_artifacts === undefined
        ? {}
        : { brainstorming_artifacts: toPortableProjectPath(model.core.brainstorming_artifacts) }),
    },
  };

  if (model.modules.sdlc !== undefined) {
    document.modules = {
      sdlc: {
        analysis_artifacts: toPortableProjectPath(model.modules.sdlc.analysis_artifacts),
        planning_artifacts: toPortableProjectPath(model.modules.sdlc.planning_artifacts),
        solutioning_artifacts: toPortableProjectPath(model.modules.sdlc.solutioning_artifacts),
        implementation_artifacts: toPortableProjectPath(model.modules.sdlc.implementation_artifacts),
        devops_artifacts: toPortableProjectPath(model.modules.sdlc.devops_artifacts),
        project_knowledge: toPortableProjectPath(model.modules.sdlc.project_knowledge),
      },
    };
    document.agents = createRuntimeAgentDescriptors(selectedModules);
    document.hooks = createRuntimeHookDescriptors();
  }

  return document;
}

function createRuntimeAgentDescriptors(
  selectedModules: OfficialModule[],
): Record<string, RuntimeAgentDescriptor> {
  return Object.fromEntries(
    selectedModules.flatMap((module) =>
      module.agents.map((agent) => [
        agent.code,
        {
          module: module.code,
          team: agent.team,
          name: agent.name,
          title: agent.localizedTitle ?? agent.title,
          icon: agent.icon,
          description: agent.localizedDescription ?? agent.description,
        } satisfies RuntimeAgentDescriptor,
      ]),
    ),
  );
}

function createInstallerUserConfigToml(model: ProjectConfigModel): ConfigTomlDocument {
  const document: ConfigTomlDocument = {
    core: {
      user_name: model.core.user_name,
      communication_language: model.core.communication_language,
    },
  };

  if (model.modules.sdlc !== undefined) {
    document.modules = {
      sdlc: {
        user_skill_level: model.modules.sdlc.user_skill_level,
      },
    };
  }

  return document;
}

async function createHumanOwnedStubPlans(targetRoot: string): Promise<PlannedWrite[]> {
  return Promise.all(
    [HUMAN_CUSTOM_CONFIG_PATH, HUMAN_CUSTOM_USER_CONFIG_PATH].map(async (stubPath) => {
      const exists = await pathExists(path.join(targetRoot, stubPath));

      return {
        path: stubPath,
        ownership: "human-owned",
        action: exists ? "skip" : "create",
        reason: exists ? "protected-existing-human-owned-stub" : "create-if-absent-human-owned-stub",
      } satisfies PlannedWrite;
    }),
  );
}

async function createGitignorePlan(targetRoot: string): Promise<PlannedWrite> {
  const gitignorePath = path.join(targetRoot, GITIGNORE_PATH);
  if (!(await pathExists(gitignorePath))) {
    return {
      path: GITIGNORE_PATH,
      ownership: "human-owned",
      action: "create",
      reason: "create-user-config-ignore-rules",
    };
  }

  const contents = await readFile(gitignorePath, "utf8");
  if (hasUserConfigGitignoreCoverage(contents)) {
    return {
      path: GITIGNORE_PATH,
      ownership: "human-owned",
      action: "skip",
      reason: "user-config-ignore-rules-present",
    };
  }

  return {
    path: GITIGNORE_PATH,
    ownership: "human-owned",
    action: "update",
    reason: "append-missing-user-config-ignore-rules",
  };
}

function createFinalConfigSummary(input: {
  mode: ConfigCollectionMode;
  model: ProjectConfigModel;
  artifactRoots: ArtifactRootResolution[];
  plannedWrites: PlannedWrite[];
  selectedModules: OfficialModule[];
  selectedModuleIds: string[];
  ideTargetIds: string[];
}): string {
  const protectedStubs = input.plannedWrites
    .filter((write) => write.ownership === "human-owned")
    .map((write) => `${write.path}=${write.action}`)
    .join(", ");

  return [
    "Final configuration summary.",
    `Config mode: ${input.mode}.`,
    `Project name: ${input.model.core.project_name}.`,
    `User display name: ${input.model.core.user_name}.`,
    `Languages: communication=${input.model.core.communication_language}, document=${input.model.core.document_output_language}.`,
    `Artifact root: ${input.model.core.output_folder}.`,
    `Artifact roots: ${formatArtifactRoots(input.artifactRoots)}.`,
    `Selected modules: ${formatList(input.selectedModuleIds)}.`,
    `Canonical package roots: ${formatModulePackageRootCounts(input.selectedModules)}.`,
    `IDE targets: ${formatList(input.ideTargetIds)}.`,
    `Planned config paths: ${INSTALLER_CONFIG_PATH}, ${INSTALLER_USER_CONFIG_PATH}.`,
    `Protected stubs: ${protectedStubs}.`,
    "Pending steps: runtime structure creation, artifact directory creation, IDE mirror creation, manifest/index generation, ReadyCheck and ready summary have not happened.",
    "Next actions: confirm this final configuration summary before any project file is written.",
    "No project files were changed.",
  ].join(" ");
}

function formatModulePackageRootCounts(modules: OfficialModule[]): string {
  const total = modules.reduce((sum, module) => sum + module.packageRoots.length, 0);
  const perModule = modules
    .map((module) => `${module.code}=${module.packageRoots.length}`)
    .join(", ");

  return `${perModule}, total=${total}`;
}

function createFreshArtifactRootConfig(input: {
  outputFolder: string;
  values: ConfigInputValues;
}): ConfigTomlDocument {
  return {
    core: {
      output_folder: input.outputFolder,
      ...(input.values.brainstorming_artifacts === undefined
        ? {}
        : { brainstorming_artifacts: input.values.brainstorming_artifacts }),
    },
    modules: {
      sdlc: Object.fromEntries(
        ARTIFACT_ROOT_REGISTRY.filter((definition) => definition.field !== "brainstorming_artifacts")
          .flatMap((definition) => {
            const value = input.values[definition.field];
            return value === undefined ? [] : [[definition.field, value]];
          }),
      ),
    },
  };
}

function requireArtifactRoot(roots: readonly ArtifactRootResolution[], field: ArtifactRootField): string {
  const root = roots.find((candidate) => candidate.field === field);
  if (root === undefined) {
    throw new Error(`Missing resolved artifact root for ${field}`);
  }

  return root.resolvedRoot;
}

function formatArtifactRoots(roots: readonly ArtifactRootResolution[]): string {
  return roots
    .map((root) => `${root.field}=${root.resolvedRoot} (${root.resolutionMode})`)
    .join(", ");
}

function createConfigInitializationFailure(issues: ValidationIssue[]): ConfigInitializationResult {
  return {
    ok: false,
    issues,
    plannedWrites: [],
    summary:
      "SpecLite install stopped during config initialization before any project files were changed.",
    nextActions: [
      "Correct the project-relative config path values and rerun config initialization.",
    ],
  };
}

function promptDefault(
  modules: OfficialModule[],
  field: ProjectConfigField,
  fallback: string,
  values: {
    directory_name: string;
    output_folder?: string;
  },
): string {
  const prompt = modules.flatMap((module) => module.configPrompts).find((entry) => entry.key === field);
  return interpolateConfigDefault(prompt?.defaultValue ?? fallback, values);
}

function normalizeFieldPath(input: {
  field: ProjectConfigField;
  value: string;
}):
  | {
      ok: true;
      path: string;
    }
  | {
      ok: false;
      issue: ValidationIssue;
    } {
  return normalizeProjectRelativeConfigPath(input);
}

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await lstat(targetPath);
    return true;
  } catch (error) {
    if (isMissingPathError(error)) {
      return false;
    }
    throw error;
  }
}

function isMissingPathError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "ENOENT"
  );
}

function formatList(values: string[]): string {
  return values.length === 0 ? "none" : values.join(", ");
}
