import type { ValidationIssue } from "../diagnostics/command-result-schema.js";
import { lstat, stat } from "node:fs/promises";
import path from "node:path";
import { findProjectBoundarySymlinkEscape } from "../fs/path-normalizer.js";
import {
  normalizeProjectRelativeConfigPath,
  type ConfigTomlDocument,
  type ProjectConfigField,
} from "./config-schema.js";
import { resolveProjectConfig } from "./config-reader.js";
import type { ResolverSourceMetadata } from "./customization-reader.js";
import type { ArtifactRootProjection } from "../manifest/manifest-schema.js";

export type ArtifactRootField =
  | "brainstorming_artifacts"
  | "analysis_artifacts"
  | "planning_artifacts"
  | "solutioning_artifacts"
  | "implementation_artifacts"
  | "devops_artifacts"
  | "project_knowledge";

export type ArtifactRootResolutionMode =
  | "fresh-default"
  | "explicit-config"
  | "legacy-compatible";

export type ArtifactRootResolutionLifecycle = "fresh" | "existing";

export type ArtifactRootDefinition = {
  field: ArtifactRootField;
  configPath: "core.brainstorming_artifacts" | `modules.sdlc.${Exclude<ArtifactRootField, "brainstorming_artifacts">}`;
  placeholder: `{${ArtifactRootField}}`;
  freshDefault: string;
  plane: ArtifactRootProjection["plane"];
  legacyFallbackFrom?: "core.output_folder" | "modules.sdlc.planning_artifacts";
};

export type ArtifactRootResolution = {
  field: ArtifactRootField;
  configPath: ArtifactRootDefinition["configPath"];
  placeholder: ArtifactRootDefinition["placeholder"];
  resolvedRoot: string;
  resolutionMode: ArtifactRootResolutionMode;
};

export type ArtifactRootResolutionResult = {
  ok: boolean;
  roots: ArtifactRootResolution[];
  issues: ValidationIssue[];
  configSources?: Record<string, ResolverSourceMetadata>;
};

export const ARTIFACT_ROOT_REGISTRY: readonly ArtifactRootDefinition[] = [
  {
    field: "brainstorming_artifacts",
    configPath: "core.brainstorming_artifacts",
    placeholder: "{brainstorming_artifacts}",
    freshDefault: "_speclite-output/0-brainstorming-artifacts",
    plane: "brainstorming",
    legacyFallbackFrom: "core.output_folder",
  },
  {
    field: "analysis_artifacts",
    configPath: "modules.sdlc.analysis_artifacts",
    placeholder: "{analysis_artifacts}",
    freshDefault: "_speclite-output/1-analysis-artifacts",
    plane: "analysis",
    legacyFallbackFrom: "modules.sdlc.planning_artifacts",
  },
  {
    field: "planning_artifacts",
    configPath: "modules.sdlc.planning_artifacts",
    placeholder: "{planning_artifacts}",
    freshDefault: "_speclite-output/2-planning-artifacts",
    plane: "planning",
  },
  {
    field: "solutioning_artifacts",
    configPath: "modules.sdlc.solutioning_artifacts",
    placeholder: "{solutioning_artifacts}",
    freshDefault: "_speclite-output/3-solutioning-artifacts",
    plane: "solutioning",
    legacyFallbackFrom: "modules.sdlc.planning_artifacts",
  },
  {
    field: "implementation_artifacts",
    configPath: "modules.sdlc.implementation_artifacts",
    placeholder: "{implementation_artifacts}",
    freshDefault: "_speclite-output/4-implementation-artifacts",
    plane: "implementation",
  },
  {
    field: "devops_artifacts",
    configPath: "modules.sdlc.devops_artifacts",
    placeholder: "{devops_artifacts}",
    freshDefault: "_speclite-output/5-devops-artifacts",
    plane: "devops",
  },
  {
    field: "project_knowledge",
    configPath: "modules.sdlc.project_knowledge",
    placeholder: "{project_knowledge}",
    freshDefault: "_speclite-output/project-knowledge-base",
    plane: "project-knowledge",
  },
];

export const ARTIFACT_ROOT_CONTRACT_REFS = [
  "_bmad-output/planning-artifacts/specs/09-sdlc-workflow-lifecycle-contract.md#Runtime-Artifact-Roots",
] as const;

export function createArtifactRootProjections(
  roots: readonly ArtifactRootResolution[],
): ArtifactRootProjection[] {
  const definitionsByField = new Map(
    ARTIFACT_ROOT_REGISTRY.map((definition) => [definition.field, definition]),
  );

  return roots.map((root) => {
    const definition = definitionsByField.get(root.field);
    if (definition === undefined) {
      throw new Error(`Unknown artifact root field: ${root.field}`);
    }

    return {
      ...root,
      plane: definition.plane,
      ownership: "workflow-owned",
      contractRefs: [...ARTIFACT_ROOT_CONTRACT_REFS],
    };
  });
}

export async function resolveArtifactRoots(input: {
  projectRoot: string;
  lifecycle: ArtifactRootResolutionLifecycle;
  config?: ConfigTomlDocument;
}): Promise<ArtifactRootResolutionResult> {
  const config = input.config ?? {};
  const roots: ArtifactRootResolution[] = [];
  const issues: ValidationIssue[] = [];

  for (const definition of ARTIFACT_ROOT_REGISTRY) {
    const selected = selectRootValue({ definition, config, lifecycle: input.lifecycle });
    if (!selected.ok) {
      issues.push(selected.issue);
      continue;
    }

    const normalized = normalizeProjectRelativeConfigPath({
      value: selected.value,
      field: definition.field as ProjectConfigField,
    });
    if (!normalized.ok) {
      issues.push(
        createArtifactRootIssue({
          issueId: normalized.issue.issueId as ArtifactRootIssueId,
          definition,
          reason: getIssueReason(normalized.issue),
        }),
      );
      continue;
    }

    const symlinkEscape = await findProjectBoundarySymlinkEscape({
      projectRoot: input.projectRoot,
      relativePath: normalized.path,
    });
    if (symlinkEscape !== undefined) {
      issues.push(
        createArtifactRootIssue({
          issueId: "artifact-path.symlink-escape",
          definition,
          reason: "symlink-escape",
        }),
      );
      continue;
    }

    roots.push({
      field: definition.field,
      configPath: definition.configPath,
      placeholder: definition.placeholder,
      resolvedRoot: normalized.path,
      resolutionMode: selected.resolutionMode,
    });
  }

  return {
    ok: !hasBlockingIssue(issues),
    roots,
    issues,
  };
}

export async function resolveArtifactRootsFromProjectConfig(input: {
  projectRoot: string;
  lifecycle: ArtifactRootResolutionLifecycle;
}): Promise<ArtifactRootResolutionResult> {
  if (input.lifecycle === "fresh" && await isRequiredBaseConfigMissing(input.projectRoot)) {
    const rootResult = await resolveArtifactRoots({
      projectRoot: input.projectRoot,
      lifecycle: input.lifecycle,
    });

    return {
      ...rootResult,
      configSources: {},
    };
  }

  const configResult = await resolveProjectConfig({ projectRoot: input.projectRoot });
  if (configResult.exitCode !== 0) {
    return {
      ok: false,
      roots: [],
      issues: configResult.issues,
      configSources: configResult.sources,
    };
  }

  const rootResult = await resolveArtifactRoots({
    projectRoot: input.projectRoot,
    lifecycle: input.lifecycle,
    config: configResult.value as ConfigTomlDocument,
  });

  return {
    ok: rootResult.ok && !hasBlockingIssue(configResult.issues),
    roots: rootResult.roots,
    issues: [...configResult.issues, ...rootResult.issues],
    configSources: configResult.sources,
  };
}

async function isRequiredBaseConfigMissing(projectRoot: string): Promise<boolean> {
  try {
    const projectRootStat = await stat(path.resolve(projectRoot));
    if (!projectRootStat.isDirectory()) return false;
  } catch {
    return false;
  }

  try {
    await lstat(path.join(projectRoot, "_speclite/config.toml"));
    return false;
  } catch (error) {
    if (isNodeErrorWithCode(error, "ENOENT")) return true;
    return false;
  }
}

function isNodeErrorWithCode(error: unknown, code: string): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error && error.code === code;
}

type SelectedRootValue =
  | {
      ok: true;
      value: string;
      resolutionMode: ArtifactRootResolutionMode;
    }
  | {
      ok: false;
      issue: ValidationIssue;
    };

type ArtifactRootIssueId =
  | "artifact-path.escapes-project"
  | "artifact-path.symlink-escape"
  | "artifact-path.unresolved-token"
  | "artifact-path.missing-required-artifact";

function selectRootValue(input: {
  definition: ArtifactRootDefinition;
  config: ConfigTomlDocument;
  lifecycle: ArtifactRootResolutionLifecycle;
}): SelectedRootValue {
  if (input.lifecycle === "fresh") {
    const explicitValue = getExplicitConfigValue(input.config, input.definition.field);
    if (explicitValue !== undefined) {
      return {
        ok: true,
        value: explicitValue,
        resolutionMode: "explicit-config",
      };
    }

    return {
      ok: true,
      value: createFreshDefaultForOutputFolder(
        input.definition.freshDefault,
        readConfigString(input.config.core?.output_folder),
      ),
      resolutionMode: "fresh-default",
    };
  }

  const explicitValue = getExplicitConfigValue(input.config, input.definition.field);
  if (explicitValue !== undefined) {
    return {
      ok: true,
      value: explicitValue,
      resolutionMode: "explicit-config",
    };
  }

  const fallbackValue = getLegacyFallbackValue(input.config, input.definition);
  if (fallbackValue !== undefined) {
    return {
      ok: true,
      value: fallbackValue,
      resolutionMode: "legacy-compatible",
    };
  }

  return {
    ok: false,
    issue: createArtifactRootIssue({
      issueId: "artifact-path.missing-required-artifact",
      definition: input.definition,
      reason: "missing-required-config",
    }),
  };
}

function getExplicitConfigValue(
  config: ConfigTomlDocument,
  field: ArtifactRootField,
): string | undefined {
  switch (field) {
    case "brainstorming_artifacts":
      return readConfigString(config.core?.brainstorming_artifacts);
    case "analysis_artifacts":
      return readConfigString(config.modules?.sdlc?.analysis_artifacts);
    case "planning_artifacts":
      return readConfigString(config.modules?.sdlc?.planning_artifacts);
    case "solutioning_artifacts":
      return readConfigString(config.modules?.sdlc?.solutioning_artifacts);
    case "implementation_artifacts":
      return readConfigString(config.modules?.sdlc?.implementation_artifacts);
    case "devops_artifacts":
      return readConfigString(config.modules?.sdlc?.devops_artifacts);
    case "project_knowledge":
      return readConfigString(config.modules?.sdlc?.project_knowledge);
  }
}

function getLegacyFallbackValue(
  config: ConfigTomlDocument,
  definition: ArtifactRootDefinition,
): string | undefined {
  if (definition.legacyFallbackFrom === "core.output_folder") {
    const outputFolder = readConfigString(config.core?.output_folder);
    return outputFolder === undefined ? undefined : appendPosixSegment(outputFolder, "brainstorming");
  }

  if (definition.legacyFallbackFrom === "modules.sdlc.planning_artifacts") {
    return readConfigString(config.modules?.sdlc?.planning_artifacts);
  }

  return undefined;
}

function appendPosixSegment(value: string, segment: string): string {
  return `${value.replace(/[\\/]+$/g, "")}/${segment}`;
}

function createFreshDefaultForOutputFolder(defaultValue: string, outputFolder: string | undefined): string {
  if (outputFolder === undefined) return defaultValue;
  const outputRoot = outputFolder.replace(/[\\/]+$/g, "");
  return defaultValue.replace(/^_speclite-output(?=\/|$)/, outputRoot);
}

function readConfigString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function getIssueReason(issue: ValidationIssue): string {
  const reason = issue.details?.reason;
  return typeof reason === "string" ? reason : "path-escapes-project";
}

function createArtifactRootIssue(input: {
  issueId: ArtifactRootIssueId;
  definition: ArtifactRootDefinition;
  reason: string;
}): ValidationIssue {
  return {
    issueId: input.issueId,
    category: "artifact-path",
    severity: "error",
    affectedPath: `project-config:${input.definition.configPath}`,
    component: "artifact-root-resolver",
    details: {
      field: input.definition.field,
      reason: input.reason,
    },
    impact: "The configured artifact root cannot be resolved inside the target project.",
    suggestedNextStep: "Use the SPEC 09 artifact root contract and provide a project-relative POSIX root.",
  };
}

function hasBlockingIssue(issues: ValidationIssue[]): boolean {
  return issues.some((issue) => issue.severity === "error" || issue.severity === "critical");
}
