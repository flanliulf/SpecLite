import process from "node:process";
import {
  createValidateCommandResult,
  resolveTargetProjectDisplayName,
} from "../diagnostics/command-result.js";
import type { ValidateCommandResult } from "../diagnostics/command-result-schema.js";
import { normalizeTargetDirectory } from "../fs/path-normalizer.js";
import { validateProject } from "../validation/validate-project.js";

export type ValidateCommandOptions = {
  json?: boolean;
};

export type ValidateCommandRuntime = {
  cwd?: string;
  targetProject?: string;
};

export type ValidateCommandOutcome = {
  result: ValidateCommandResult;
  exitCode: 0 | 1;
};

export async function runValidateCommand(input: {
  options?: ValidateCommandOptions;
  runtime?: ValidateCommandRuntime;
  targetDirectory?: string;
} = {}): Promise<ValidateCommandOutcome> {
  const cwd = input.runtime?.cwd ?? process.cwd();
  const normalizedTarget = normalizeTargetDirectory({
    cwd,
    ...(input.targetDirectory === undefined ? {} : { targetDirectory: input.targetDirectory }),
  });
  const validation = await validateProject({
    projectRoot: normalizedTarget.targetRoot,
  });
  const targetProject = await resolveTargetProjectDisplayName({
    targetRoot: normalizedTarget.targetRoot,
    ...(input.runtime?.targetProject === undefined ? {} : { explicitName: input.runtime.targetProject }),
  });

  return createValidateCommandResult({
    targetProject,
    issues: validation.issues,
    data: validation.data,
  });
}
