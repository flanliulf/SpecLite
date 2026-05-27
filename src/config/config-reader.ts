import { parse } from "toml";
import path from "node:path";
import type { ConfigTomlDocument } from "./config-schema.js";
import type { ResolverResult } from "./customization-reader.js";
import { resolveTomlLayers } from "./customization-reader.js";

export function parseConfigToml(contents: string): ConfigTomlDocument {
  return parse(contents) as ConfigTomlDocument;
}

export async function resolveProjectConfig(input: {
  projectRoot: string;
  keys?: string[];
}): Promise<ResolverResult> {
  const projectRoot = path.resolve(input.projectRoot);

  return resolveTomlLayers({
    component: "config-resolver",
    layerKind: "config",
    keys: input.keys ?? [],
    layers: [
      {
        path: path.join(projectRoot, "_speclite/config.toml"),
        affectedPath: "_speclite/config.toml",
        required: true,
        role: "required-config",
      },
      {
        path: path.join(projectRoot, "_speclite/config.user.toml"),
        affectedPath: "_speclite/config.user.toml",
        required: false,
        role: "optional-config",
      },
      {
        path: path.join(projectRoot, "_speclite/custom/config.toml"),
        affectedPath: "_speclite/custom/config.toml",
        required: false,
        role: "optional-config",
      },
      {
        path: path.join(projectRoot, "_speclite/custom/config.user.toml"),
        affectedPath: "_speclite/custom/config.user.toml",
        required: false,
        role: "optional-config",
      },
    ],
  });
}
