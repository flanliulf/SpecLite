import path from "node:path";
import process from "node:process";
import os from "node:os";
import type { CommandPathSummary } from "../diagnostics/command-result-schema.js";
import type { RuntimeFacts } from "./runtime-guard.js";

export type InstallCommandContext = {
  targetProject: string;
  projectRootDisplay: string;
  paths: Required<CommandPathSummary>;
  runtime: RuntimeFacts;
  completedSteps: string[];
  pendingSteps: string[];
  requiresConfirmation: boolean;
  writeAuthorized: boolean;
};

export function createInstallCommandContext(input: {
  cwd?: string;
  targetProject?: string;
  projectRootDisplay?: string;
  paths?: Required<CommandPathSummary>;
  runtime?: RuntimeFacts;
  completedSteps?: string[];
  requiresConfirmation?: boolean;
  writeAuthorized?: boolean;
}): InstallCommandContext {
  const cwd = input.cwd ?? process.cwd();
  const runtime =
    input.runtime ??
    ({
      nodeVersion: process.version,
      platform: process.platform,
      platformRelease: os.release(),
    } satisfies RuntimeFacts);

  return {
    targetProject: input.targetProject ?? (path.basename(cwd) || "project"),
    projectRootDisplay: input.projectRootDisplay ?? ".",
    paths: input.paths ?? {
      projectRoot: ".",
      specliteRoot: "_speclite",
      artifactRoot: "_speclite-output",
      manifestPath: "_speclite/_config/manifest.yaml",
    },
    runtime,
    completedSteps: input.completedSteps ?? [],
    pendingSteps: [
      "source-discovery",
      "module-selection",
      "config-initialization",
      "runtime-structure",
      "ide-mirror-creation",
      "manifest-generation",
      "ready-check",
      "ready-summary",
    ],
    requiresConfirmation: input.requiresConfirmation ?? true,
    writeAuthorized: input.writeAuthorized ?? false,
  };
}
