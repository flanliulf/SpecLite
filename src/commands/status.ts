import process from "node:process";
import { COMMAND_RESULT_SCHEMA_VERSION, type StatusCommandResult } from "../diagnostics/command-result-schema.js";
import { resolveTargetProjectDisplayName } from "../diagnostics/command-result.js";
import { normalizeTargetDirectory } from "../fs/path-normalizer.js";
import { readInstalledStateSummary } from "../status/installed-state.js";

export type StatusCommandOptions = {
  json?: boolean;
};

export type StatusCommandRuntime = {
  cwd?: string;
  targetProject?: string;
};

export type StatusCommandOutcome = {
  result: StatusCommandResult;
  exitCode: number;
};

export async function runStatusCommand(input: {
  options?: StatusCommandOptions;
  runtime?: StatusCommandRuntime;
  targetDirectory?: string;
} = {}): Promise<StatusCommandOutcome> {
  const cwd = input.runtime?.cwd ?? process.cwd();
  const normalizedTarget = normalizeTargetDirectory({
    cwd,
    ...(input.targetDirectory === undefined ? {} : { targetDirectory: input.targetDirectory }),
  });
  const installedState = await readInstalledStateSummary({
    projectRoot: normalizedTarget.targetRoot,
  });
  const targetProject = await resolveTargetProjectDisplayName({
    targetRoot: normalizedTarget.targetRoot,
    ...(input.runtime?.targetProject === undefined ? {} : { explicitName: input.runtime.targetProject }),
  });
  const result: StatusCommandResult = {
    schemaVersion: COMMAND_RESULT_SCHEMA_VERSION,
    status: "success",
    command: "status",
    targetProject,
    summary: installedState.summary,
    issues: [],
    nextActions: installedState.nextActions,
    data: installedState.data,
  };

  return {
    result,
    exitCode: 0,
  };
}
