import { parse } from "toml";
import type { ConfigTomlDocument } from "./config-schema.js";

export function parseConfigToml(contents: string): ConfigTomlDocument {
  return parse(contents) as ConfigTomlDocument;
}
