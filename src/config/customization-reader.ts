import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { parse } from "toml";
import type { ValidationIssue } from "../diagnostics/command-result-schema.js";
import { deepMergeTomlDocuments, type TomlDocument } from "./merge-rules.js";
import { createResolveIssue, type ResolverLayerRole } from "./resolve-diagnostics.js";
import type { CustomizationResolveInput } from "./customization-schema.js";

export type ResolverResult = {
  value: TomlDocument;
  issues: ValidationIssue[];
  exitCode: 0 | 1;
};

export async function resolveSkillCustomization(input: CustomizationResolveInput): Promise<ResolverResult> {
  const skillDir = path.resolve(input.skillDir);
  const projectRoot =
    input.projectRoot === undefined
      ? await findProjectRootForCustomization(skillDir, input.cwd ?? process.cwd())
      : path.resolve(input.projectRoot);
  const skillName = path.basename(skillDir);
  const layers = [
    {
      path: path.join(skillDir, "customize.toml"),
      affectedPath: "customize.toml",
      required: true,
      role: "skill-defaults" as const,
    },
    ...(projectRoot === undefined
      ? []
      : [
          {
            path: path.join(projectRoot, "_speclite/custom", `${skillName}.toml`),
            affectedPath: `_speclite/custom/${skillName}.toml`,
            required: false,
            role: "team-custom" as const,
          },
          {
            path: path.join(projectRoot, "_speclite/custom", `${skillName}.user.toml`),
            affectedPath: `_speclite/custom/${skillName}.user.toml`,
            required: false,
            role: "user-custom" as const,
          },
        ]),
  ];

  return resolveTomlLayers({
    layers,
    component: "customization-resolver",
    layerKind: "customization",
    keys: input.keys ?? [],
  });
}

export async function findProjectRootForCustomization(skillDir: string, cwd: string): Promise<string | undefined> {
  return (await findProjectRootUpward(skillDir)) ?? (await findProjectRootUpward(cwd));
}

export async function resolveTomlLayers(input: {
  layers: {
    path: string;
    affectedPath: string;
    required: boolean;
    role: ResolverLayerRole;
  }[];
  component: "config-resolver" | "customization-resolver";
  layerKind: "config" | "customization";
  keys?: string[];
}): Promise<ResolverResult> {
  const issues: ValidationIssue[] = [];
  let merged: TomlDocument = {};

  for (const layer of input.layers) {
    const loaded = await loadTomlLayer({
      ...layer,
      component: input.component,
      layerKind: input.layerKind,
    });

    if (!loaded.ok) {
      issues.push(loaded.issue);
      if (layer.required) {
        return { value: {}, issues, exitCode: 1 };
      }
      continue;
    }

    merged = deepMergeTomlDocuments(merged, loaded.value);
  }

  const hasBlockingIssue = issues.some((issue) => issue.severity === "error" || issue.severity === "critical");
  if (hasBlockingIssue) {
    return { value: {}, issues, exitCode: 1 };
  }

  return {
    value: selectDottedKeys(merged, input.keys ?? []),
    issues,
    exitCode: 0,
  };
}

export function selectDottedKeys(value: TomlDocument, keys: string[]): TomlDocument {
  if (keys.length === 0) {
    return value;
  }

  const selected: TomlDocument = {};
  for (const key of keys) {
    const keyValue = extractDottedKey(value, key);
    if (keyValue !== undefined) {
      selected[key] = keyValue;
    }
  }

  return selected;
}

async function loadTomlLayer(input: {
  path: string;
  affectedPath: string;
  required: boolean;
  role: ResolverLayerRole;
  component: "config-resolver" | "customization-resolver";
  layerKind: "config" | "customization";
}):
  | Promise<{ ok: true; value: TomlDocument }>
  | Promise<{ ok: false; issue: ValidationIssue }> {
  let contents: string;
  try {
    contents = await readFile(input.path, "utf8");
  } catch (error) {
    if (isNodeError(error) && error.code === "ENOENT") {
      if (!input.required) {
        return { ok: true, value: {} };
      }
      return {
        ok: false,
        issue: createResolveIssue({
          issueId: "runtime-path.missing-entry",
          severity: "error",
          affectedPath: input.affectedPath,
          component: input.component,
          layerKind: input.layerKind,
          layerRole: input.role,
          status: "missing",
        }),
      };
    }

    return {
      ok: false,
      issue: createResolveIssue({
        issueId: "runtime-path.invalid-script-path",
        severity: input.required ? "error" : "warning",
        affectedPath: input.affectedPath,
        component: input.component,
        layerKind: input.layerKind,
        layerRole: input.role,
        status: "read-failed",
      }),
    };
  }

  try {
    return { ok: true, value: parseTomlDocument(contents) };
  } catch {
    return {
      ok: false,
      issue: createResolveIssue({
        issueId: "manifest-schema.malformed-field",
        severity: input.required ? "error" : "warning",
        affectedPath: input.affectedPath,
        component: input.component,
        layerKind: input.layerKind,
        layerRole: input.role,
        status: "parse-failed",
      }),
    };
  }
}

function parseTomlDocument(contents: string): TomlDocument {
  const parsed = parse(contents) as unknown;
  return isTomlDocument(parsed) ? parsed : {};
}

async function findProjectRootUpward(start: string): Promise<string | undefined> {
  let current = path.resolve(start);
  while (true) {
    if ((await exists(path.join(current, "_speclite"))) || (await exists(path.join(current, ".git")))) {
      return current;
    }

    const parent = path.dirname(current);
    if (parent === current) {
      return undefined;
    }
    current = parent;
  }
}

async function exists(targetPath: string): Promise<boolean> {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
}

function extractDottedKey(value: TomlDocument, dottedKey: string): TomlDocument[string] | undefined {
  const parts = dottedKey.split(".");
  let current: unknown = value;
  for (const part of parts) {
    if (!isTomlDocument(current) || !(part in current)) {
      return undefined;
    }
    current = current[part];
  }

  return current as TomlDocument[string];
}

function isTomlDocument(value: unknown): value is TomlDocument {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}
