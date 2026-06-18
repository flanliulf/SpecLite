#!/usr/bin/env node
import { constants } from "node:fs";
import { access } from "node:fs/promises";
import { execFile } from "node:child_process";
import path from "node:path";
import process from "node:process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const PROTECTED_SURFACE = "assets/source/speclite";
const CHECK_SCRIPT = "assets/source/speclite/support-skills/speclite-check-canonical-source-change/scripts/check_canonical_source_change.mjs";

const event = await readEvent();
const projectRoot = resolveProjectRoot(event);
const eventName = resolveEventName(event);

try {
  const changedPaths = await listCanonicalChangedPaths(projectRoot);
  if (changedPaths.length === 0) process.exit(0);

  const report = await runCheckScript(projectRoot);
  const output = createWarningOutput({
    eventName,
    changedPaths,
    report,
  });
  process.stdout.write(`${JSON.stringify(output)}\n`);
} catch (error) {
  const output = createWarningOutput({
    eventName,
    changedPaths: [],
    report: {
      status: "warning",
      findings: [
        {
          id: "canonical-hook.runner-error",
          severity: "warning",
          message: error instanceof Error ? error.message : String(error),
        },
      ],
      recommendedCommands: recommendedCommands(),
    },
  });
  process.stdout.write(`${JSON.stringify(output)}\n`);
}

process.exit(0);

async function listCanonicalChangedPaths(projectRoot) {
  const [worktree, staged, untracked] = await Promise.all([
    gitNames(projectRoot, ["diff", "--name-only", "--", PROTECTED_SURFACE]),
    gitNames(projectRoot, ["diff", "--cached", "--name-only", "--", PROTECTED_SURFACE]),
    gitNames(projectRoot, ["ls-files", "--others", "--exclude-standard", "--", PROTECTED_SURFACE]),
  ]);
  return [...new Set([...worktree, ...staged, ...untracked])].sort();
}

async function gitNames(projectRoot, args) {
  try {
    const { stdout } = await execFileAsync("git", ["-C", projectRoot, ...args], {
      timeout: 5000,
      maxBuffer: 1024 * 1024,
    });
    return stdout
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && line.startsWith(PROTECTED_SURFACE));
  } catch {
    return [];
  }
}

async function runCheckScript(projectRoot) {
  const scriptPath = path.join(projectRoot, CHECK_SCRIPT);
  if (!(await exists(scriptPath))) {
    return {
      status: "warning",
      findings: [
        {
          id: "canonical-hook.check-script-missing",
          severity: "warning",
          message: `${CHECK_SCRIPT} was not found in this project.`,
        },
      ],
      recommendedCommands: recommendedCommands(),
    };
  }

  try {
    const { stdout } = await execFileAsync(
      process.execPath,
      [scriptPath, "--project-root", projectRoot, "--scope", "changed", "--format", "json"],
      {
        cwd: projectRoot,
        timeout: 15000,
        maxBuffer: 1024 * 1024 * 4,
      },
    );
    return JSON.parse(stdout);
  } catch (error) {
    return {
      status: "warning",
      findings: [
        {
          id: "canonical-hook.check-script-failed",
          severity: "warning",
          message: error instanceof Error ? error.message : String(error),
        },
      ],
      recommendedCommands: recommendedCommands(),
    };
  }
}

function createWarningOutput(input) {
  const findingIds = (input.report.findings ?? []).map((finding) => finding.id).filter(Boolean);
  const command = (input.report.recommendedCommands ?? recommendedCommands())[0];
  const changedSummary =
    input.changedPaths.length === 0
      ? "canonical source change detection was inconclusive"
      : `${input.changedPaths.length} canonical source path(s) changed`;
  const findingSummary = findingIds.length === 0 ? "no findings yet" : findingIds.slice(0, 6).join(", ");
  const additionalContext = [
    `SpecLite canonical source changed (${changedSummary}).`,
    "Run speclite-check-canonical-source-change before finishing.",
    `Current check status: ${input.report.status ?? "warning"}; findings: ${findingSummary}.`,
    `Suggested command: ${command}`,
    "This hook is warning-only and exits 0.",
  ].join("\n");
  return {
    systemMessage: "SpecLite canonical source changed; run speclite-check-canonical-source-change.",
    hookSpecificOutput: {
      hookEventName: input.eventName,
      additionalContext,
    },
  };
}

function recommendedCommands() {
  return [
    "node assets/source/speclite/support-skills/speclite-check-canonical-source-change/scripts/check_canonical_source_change.mjs --project-root . --scope all --format json",
  ];
}

function resolveProjectRoot(event) {
  if (event !== undefined && typeof event === "object" && event !== null) {
    for (const key of ["projectRoot", "cwd", "workspaceRoot"]) {
      const value = event[key];
      if (typeof value === "string" && value.trim().length > 0) return path.resolve(value);
    }
  }
  return process.cwd();
}

function resolveEventName(event) {
  if (event !== undefined && typeof event === "object" && event !== null) {
    for (const key of ["hook_event_name", "hookEventName", "event"]) {
      const value = event[key];
      if (typeof value === "string" && value.trim().length > 0) return value;
    }
  }
  return "PostToolUse";
}

async function readEvent() {
  const stdin = await readStdin();
  if (stdin.trim().length === 0) return {};
  try {
    return JSON.parse(stdin);
  } catch {
    return {};
  }
}

async function readStdin() {
  let data = "";
  for await (const chunk of process.stdin) data += chunk;
  return data;
}

async function exists(filePath) {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}
