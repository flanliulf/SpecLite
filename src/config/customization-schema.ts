import type { TomlDocument } from "./merge-rules.js";

export type CustomizationTomlDocument = TomlDocument;

export type CustomizationResolveInput = {
  skillDir: string;
  projectRoot?: string;
  cwd?: string;
  keys?: string[];
};
