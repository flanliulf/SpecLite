import path from "node:path";
import type { ValidationIssue } from "../diagnostics/command-result-schema.js";

export const CORE_CONFIG_FIELDS = [
  "project_name",
  "user_name",
  "communication_language",
  "document_output_language",
  "output_folder",
] as const;

export const SDLC_CONFIG_FIELDS = [
  "user_skill_level",
  "planning_artifacts",
  "implementation_artifacts",
  "devops_artifacts",
  "project_knowledge",
] as const;

export type CoreConfigField = (typeof CORE_CONFIG_FIELDS)[number];
export type SdlcConfigField = (typeof SDLC_CONFIG_FIELDS)[number];
export type ProjectConfigField = CoreConfigField | SdlcConfigField;
export type ConfigCollectionMode = "quick" | "detailed";

export type CoreProjectConfig = Record<CoreConfigField, string>;
export type SdlcProjectConfig = Record<SdlcConfigField, string>;

export type ProjectConfigModel = {
  core: CoreProjectConfig;
  modules: {
    sdlc?: SdlcProjectConfig;
  };
};

export type RuntimeAgentDescriptor = {
  module: string;
  team: string;
  name: string;
  title: string;
  icon: string;
  description: string;
};

export type RuntimeHookDescriptor = {
  module: string;
  source_skill: string;
  protected_skill?: string;
  protected_surface?: string;
  description: string;
  runtime_root: string;
  runner: string;
  events: string[];
  platform_configs: string[];
  trust_note: string;
};

export type ConfigTomlDocument = {
  core?: Partial<CoreProjectConfig>;
  modules?: {
    sdlc?: Partial<SdlcProjectConfig>;
  };
  agents?: Record<string, RuntimeAgentDescriptor>;
  hooks?: Record<string, RuntimeHookDescriptor>;
};

export type ConfigInputValues = Partial<Record<ProjectConfigField, string>>;

export type ProjectRelativePathResult =
  | {
      ok: true;
      path: string;
    }
  | {
      ok: false;
      issue: ValidationIssue;
    };

export function trimOrDefault(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim();
  return trimmed === undefined || trimmed.length === 0 ? fallback : trimmed;
}

export function interpolateConfigDefault(
  template: string,
  values: {
    directory_name: string;
    output_folder?: string;
  },
): string {
  return template
    .replaceAll("{directory_name}", values.directory_name)
    .replaceAll("{output_folder}", values.output_folder ?? "");
}

export function normalizeProjectRelativeConfigPath(input: {
  value: string;
  field: ProjectConfigField;
}): ProjectRelativePathResult {
  const normalizedSeparators = stripProjectRootToken(input.value).replaceAll("\\", "/");
  const normalized = path.posix.normalize(normalizedSeparators);
  const rejectedAffectedPath = createRejectedArtifactAffectedPath(input.field);

  if (
    normalized.length === 0 ||
    normalized === "." ||
    normalized === ".." ||
    normalized.startsWith("../") ||
    normalized === "~" ||
    normalized.startsWith("~/") ||
    path.posix.isAbsolute(normalized) ||
    /^[A-Za-z]:\//.test(normalizedSeparators) ||
    hasCredentialBearingUrlShape(normalizedSeparators)
  ) {
    return {
      ok: false,
      issue: createArtifactPathIssue("artifact-path.escapes-project", rejectedAffectedPath, {
        field: input.field,
        reason: "path-escapes-project",
      }),
    };
  }

  return {
    ok: true,
    path: normalized,
  };
}

export function toPortableProjectPath(value: string): string {
  const projectRelative = stripProjectRootToken(value);
  return `${PROJECT_ROOT_TOKEN}/${projectRelative}`;
}

export function resolvePortableProjectPath(value: string): string {
  return stripProjectRootToken(value);
}

const PROJECT_ROOT_TOKEN = "{project-root}";

function stripProjectRootToken(value: string): string {
  const normalized = value.trim().replaceAll("\\", "/");
  if (normalized === PROJECT_ROOT_TOKEN) return "";
  if (normalized.startsWith(`${PROJECT_ROOT_TOKEN}/`)) {
    return normalized.slice(PROJECT_ROOT_TOKEN.length + 1);
  }
  return normalized;
}

function createRejectedArtifactAffectedPath(field: ProjectConfigField): string {
  return `project-config:${field}`;
}

function hasCredentialBearingUrlShape(value: string): boolean {
  return /^[A-Za-z][A-Za-z0-9+.-]*:\/\/[^/\s]*@/.test(value);
}

export function createArtifactPathIssue(
  issueId: "artifact-path.escapes-project" | "artifact-path.symlink-escape",
  affectedPath: string,
  details: Record<string, unknown>,
): ValidationIssue {
  return {
    issueId,
    category: "artifact-path",
    severity: "error",
    affectedPath,
    component: "project-config-initialization",
    details,
    impact: "The configured artifact path is not safely contained inside the target project.",
    suggestedNextStep: "Choose a project-relative POSIX-style artifact path before continuing.",
  };
}
