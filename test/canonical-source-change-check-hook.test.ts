import { spawn } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

const RUNNER_PATH = path.join(
  process.cwd(),
  "assets/source/speclite/hooks/canonical-source-change-check/runner.mjs",
);

describe("canonical source change check hook runner", () => {
  it("exits silently when the git workspace has no canonical source changes", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-canonical-hook-noop-"));

    try {
      await runCommand("git", ["init"], tempRoot);

      const result = await runNode(RUNNER_PATH, ["--platform", "claude"], {
        cwd: tempRoot,
        stdin: JSON.stringify({ hook_event_name: "PostToolUse", cwd: tempRoot }),
      });

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toBe("");
      expect(result.stderr).toBe("");
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("emits warning-only context for canonical source changes on PostToolUse", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-canonical-hook-warning-"));

    try {
      await runCommand("git", ["init"], tempRoot);
      await writeProjectLocalCheckScript(tempRoot);
      await writeFile(
        path.join(tempRoot, "assets/source/speclite/README.md"),
        "# Canonical source fixture\n",
        "utf8",
      );

      const result = await runNode(RUNNER_PATH, ["--platform", "claude", "--mode", "warn"], {
        cwd: tempRoot,
        stdin: JSON.stringify({ hook_event_name: "PostToolUse", cwd: tempRoot }),
      });
      const parsed = JSON.parse(result.stdout);

      expect(result.exitCode).toBe(0);
      expect(parsed.decision).toBeUndefined();
      expect(JSON.stringify(parsed)).not.toContain("block");
      expect(parsed.systemMessage).toContain("speclite-canonical-source-governance-runner");
      expect(parsed.hookSpecificOutput.hookEventName).toBe("PostToolUse");
      expect(parsed.hookSpecificOutput.additionalContext).toContain("speclite-canonical-source-governance-runner");
      expect(parsed.hookSpecificOutput.additionalContext).toContain("speclite-check-canonical-source-change");
      expect(parsed.hookSpecificOutput.additionalContext).toContain("Impacted governance classes");
      expect(parsed.hookSpecificOutput.additionalContext).toContain("module-help.missing-row");
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("warns without continuing the conversation on the first Stop event", async () => {
    const tempRoot = await createChangedCanonicalWorkspace();

    try {
      const result = await runNode(
        RUNNER_PATH,
        ["--platform", "claude", "--mode", "warn", "--stop-summary"],
        {
          cwd: tempRoot,
          stdin: JSON.stringify({ hook_event_name: "Stop", cwd: tempRoot, stop_hook_active: false }),
        },
      );
      const parsed = JSON.parse(result.stdout);

      expect(result.exitCode).toBe(0);
      expect(result.stderr).toBe("");
      expect(parsed.systemMessage).toContain("speclite-canonical-source-governance-runner");
      expect(parsed.decision).toBeUndefined();
      expect(parsed.hookSpecificOutput).toBeUndefined();
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("exits silently when a Stop hook continuation is already active", async () => {
    const tempRoot = await createChangedCanonicalWorkspace();

    try {
      const result = await runNode(
        RUNNER_PATH,
        ["--platform", "claude", "--mode", "warn", "--stop-summary"],
        {
          cwd: tempRoot,
          stdin: JSON.stringify({ hook_event_name: "Stop", cwd: tempRoot, stop_hook_active: true }),
        },
      );

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toBe("");
      expect(result.stderr).toBe("");
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });
});

async function createChangedCanonicalWorkspace(): Promise<string> {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-canonical-hook-stop-"));
  await runCommand("git", ["init"], tempRoot);
  await writeProjectLocalCheckScript(tempRoot);
  await writeFile(path.join(tempRoot, "assets/source/speclite/README.md"), "# Canonical source fixture\n", "utf8");
  return tempRoot;
}

async function writeProjectLocalCheckScript(projectRoot: string): Promise<void> {
  const scriptPath = path.join(
    projectRoot,
    "assets/source/speclite/support-skills/speclite-check-canonical-source-change/scripts/check_canonical_source_change.mjs",
  );
  await mkdir(path.dirname(scriptPath), { recursive: true });
  await writeFile(
    scriptPath,
    [
      "#!/usr/bin/env node",
      "process.stdout.write(JSON.stringify({",
      "  status: 'warning',",
      "  counts: { core: 13, sdlc: 51, support: 5, hooks: 2, defaultInstall: { total: 64 } },",
      "  governance: {",
      "    mapStatus: 'loaded',",
      "    impactedClasses: [{ id: 'canonical-source-truth', determinism: 'D0' }],",
      "    requiredFollowups: ['run checker'],",
      "    decisionRecordRequired: false",
      "  },",
      "  findings: [{ id: 'module-help.missing-row', severity: 'warning', message: 'missing help row' }],",
      "  recommendedSkills: ['speclite-canonical-source-governance-runner', 'speclite-check-canonical-source-change'],",
      "  recommendedCommands: ['node assets/source/speclite/support-skills/speclite-check-canonical-source-change/scripts/check_canonical_source_change.mjs --project-root . --scope all --format json']",
      "}) + '\\n');",
      "",
    ].join("\n"),
    "utf8",
  );
}

async function runCommand(command: string, args: string[], cwd: string): Promise<RunResult> {
  return runProcess(command, args, { cwd });
}

async function runNode(scriptPath: string, args: string[], input: { cwd: string; stdin: string }): Promise<RunResult> {
  return runProcess(process.execPath, [scriptPath, ...args], input);
}

type RunResult = {
  exitCode: number | null;
  stdout: string;
  stderr: string;
};

async function runProcess(
  command: string,
  args: string[],
  input: { cwd: string; stdin?: string },
): Promise<RunResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: input.cwd,
      stdio: ["pipe", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += String(chunk);
    });
    child.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });
    child.on("error", reject);
    child.on("close", (exitCode) => {
      resolve({ exitCode, stdout, stderr });
    });
    child.stdin.end(input.stdin ?? "");
  });
}
