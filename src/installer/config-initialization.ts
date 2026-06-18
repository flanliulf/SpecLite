import { lstat, readFile } from "node:fs/promises";
import path from "node:path";
import {
  createArtifactPathIssue,
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
import { hasUserConfigGitignoreCoverage } from "../config/user-config-gitignore.js";
import type { ValidationIssue } from "../diagnostics/command-result-schema.js";
import type { OfficialModule } from "../modules/module-metadata.js";
import { createFlowGateHookRuntimeDescriptor } from "./hook-artifacts.js";
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

  const sdlcConfig =
    input.selectedModules.some((module) => module.code === "sdlc")
      ? createSdlcConfig({
          selectedModules: input.selectedModules,
          targetProject: input.targetProject,
          outputFolder: outputFolder.path,
          values,
        })
      : undefined;

  if (sdlcConfig !== undefined && !sdlcConfig.ok) {
    return createConfigInitializationFailure([sdlcConfig.issue]);
  }

  const model: ProjectConfigModel = {
    core,
    modules: {
      ...(sdlcConfig === undefined ? {} : { sdlc: sdlcConfig.config }),
    },
  };
  const symlinkIssue = await findArtifactSymlinkIssue(input.targetRoot, model);
  if (symlinkIssue !== undefined) {
    return createConfigInitializationFailure([symlinkIssue]);
  }

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
    configToml,
    configUserToml,
    plannedWrites,
    summary: createFinalConfigSummary({
      mode,
      model,
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
}):
  | {
      ok: true;
      config: NonNullable<ProjectConfigModel["modules"]["sdlc"]>;
    }
  | {
      ok: false;
      issue: ValidationIssue;
    } {
  const planningArtifacts = normalizeFieldPath({
    field: "planning_artifacts",
    value: trimOrDefault(
      input.values.planning_artifacts,
      promptDefault(input.selectedModules, "planning_artifacts", `${input.outputFolder}/planning-artifacts`, {
        directory_name: input.targetProject,
        output_folder: input.outputFolder,
      }),
    ),
  });
  if (!planningArtifacts.ok) return planningArtifacts;

  const implementationArtifacts = normalizeFieldPath({
    field: "implementation_artifacts",
    value: trimOrDefault(
      input.values.implementation_artifacts,
      promptDefault(
        input.selectedModules,
        "implementation_artifacts",
        `${input.outputFolder}/implementation-artifacts`,
        {
          directory_name: input.targetProject,
          output_folder: input.outputFolder,
        },
      ),
    ),
  });
  if (!implementationArtifacts.ok) return implementationArtifacts;

  const devopsArtifacts = normalizeFieldPath({
    field: "devops_artifacts",
    value: trimOrDefault(
      input.values.devops_artifacts,
      promptDefault(input.selectedModules, "devops_artifacts", `${input.outputFolder}/devops-artifacts`, {
        directory_name: input.targetProject,
        output_folder: input.outputFolder,
      }),
    ),
  });
  if (!devopsArtifacts.ok) return devopsArtifacts;

  const projectKnowledge = normalizeFieldPath({
    field: "project_knowledge",
    value: trimOrDefault(
      input.values.project_knowledge,
      promptDefault(input.selectedModules, "project_knowledge", "docs", {
        directory_name: input.targetProject,
        output_folder: input.outputFolder,
      }),
    ),
  });
  if (!projectKnowledge.ok) return projectKnowledge;

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
      planning_artifacts: planningArtifacts.path,
      implementation_artifacts: implementationArtifacts.path,
      devops_artifacts: devopsArtifacts.path,
      project_knowledge: projectKnowledge.path,
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
    },
  };

  if (model.modules.sdlc !== undefined) {
    document.modules = {
      sdlc: {
        planning_artifacts: toPortableProjectPath(model.modules.sdlc.planning_artifacts),
        implementation_artifacts: toPortableProjectPath(model.modules.sdlc.implementation_artifacts),
        devops_artifacts: toPortableProjectPath(model.modules.sdlc.devops_artifacts),
        project_knowledge: toPortableProjectPath(model.modules.sdlc.project_knowledge),
      },
    };
    document.agents = createRuntimeAgentDescriptors(selectedModules);
    document.hooks = {
      "flow-gate-enforcement": createFlowGateHookRuntimeDescriptor(),
    };
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

async function findArtifactSymlinkIssue(
  targetRoot: string,
  model: ProjectConfigModel,
): Promise<ValidationIssue | undefined> {
  for (const artifactPath of [
    model.core.output_folder,
    model.modules.sdlc?.planning_artifacts,
    model.modules.sdlc?.implementation_artifacts,
    model.modules.sdlc?.devops_artifacts,
    model.modules.sdlc?.project_knowledge,
  ]) {
    if (artifactPath === undefined) continue;
    if (await hasSymlinkSegment(targetRoot, artifactPath)) {
      return createArtifactPathIssue("artifact-path.symlink-escape", artifactPath, {
        reason: "existing-path-segment-is-symlink",
      });
    }
  }

  return undefined;
}

async function hasSymlinkSegment(targetRoot: string, relativePath: string): Promise<boolean> {
  let current = targetRoot;

  for (const segment of relativePath.split("/")) {
    current = path.join(current, segment);
    try {
      const stat = await lstat(current);
      if (stat.isSymbolicLink()) {
        return true;
      }
    } catch (error) {
      if (isMissingPathError(error)) {
        return false;
      }
      throw error;
    }
  }

  return false;
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
