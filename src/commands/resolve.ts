import type { Command } from "commander";
import { resolveProjectConfig } from "../config/config-reader.js";
import { resolveSkillCustomization } from "../config/customization-reader.js";
import { createResolveIssue } from "../config/resolve-diagnostics.js";
import type { ValidationIssue } from "../diagnostics/command-result-schema.js";

export type ResolveCommandIo = {
  stdout: (text: string) => void;
  stderr: (text: string) => void;
  setExitCode: (code: number) => void;
};

type ResolveConfigOptions = {
  projectRoot?: string;
  key?: string[];
};

type ResolveCustomizationOptions = ResolveConfigOptions & {
  skill?: string;
};

export function registerResolveCommand(program: Command, io: ResolveCommandIo): void {
  const resolve = program
    .command("resolve")
    .description("Resolve SpecLite runtime config or skill customization as machine-readable JSON.");

  resolve
    .command("config")
    .description("Resolve _speclite config layers.")
    .option("--project-root <projectRoot>", "Project root containing _speclite.")
    .option("--key <dottedKey>", "Dotted key to select from the merged config.", collectKey, [])
    .action(async (options: ResolveConfigOptions) => {
      if (options.projectRoot === undefined) {
        writeFailure(io, missingOptionIssue("--project-root"));
        return;
      }

      const result = await resolveProjectConfig({
        projectRoot: options.projectRoot,
        keys: options.key ?? [],
      });
      writeResolveResult(io, result);
    });

  resolve
    .command("customization")
    .description("Resolve installed skill customization layers.")
    .option("--skill <skillDir>", "Installed skill directory containing customize.toml.")
    .option("--project-root <projectRoot>", "Project root containing _speclite.")
    .option("--key <dottedKey>", "Dotted key to select from the merged customization.", collectKey, [])
    .action(async (options: ResolveCustomizationOptions) => {
      if (options.skill === undefined) {
        writeFailure(io, missingOptionIssue("--skill"));
        return;
      }

      const result = await resolveSkillCustomization({
        skillDir: options.skill,
        ...(options.projectRoot === undefined ? {} : { projectRoot: options.projectRoot }),
        keys: options.key ?? [],
      });
      writeResolveResult(io, result);
    });
}

function writeResolveResult(
  io: ResolveCommandIo,
  result: { value: Record<string, unknown>; issues: ValidationIssue[]; exitCode: 0 | 1 },
): void {
  if (result.exitCode === 0) {
    io.stdout(`${JSON.stringify(result.value, null, 2)}\n`);
  }
  if (result.issues.length > 0) {
    io.stderr(result.issues.map((issue) => JSON.stringify(issue)).join("\n") + "\n");
  }
  io.setExitCode(result.exitCode);
}

function writeFailure(io: ResolveCommandIo, issue: ValidationIssue): void {
  io.stderr(`${JSON.stringify(issue)}\n`);
  io.setExitCode(1);
}

function missingOptionIssue(optionName: "--project-root" | "--skill"): ValidationIssue {
  return createResolveIssue({
    issueId: "runtime-path.missing-entry",
    severity: "error",
    affectedPath: optionName,
    component: "resolve-command",
    status: "invalid-args",
  });
}

function collectKey(value: string, previous: string[]): string[] {
  return [...previous, value];
}
