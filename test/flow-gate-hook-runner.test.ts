import { spawn } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { evaluateFlowGateHookEvent } from "../src/hooks/flow-gate-enforcement.js";

const RUNNER_PATH = path.join(process.cwd(), "assets/source/speclite/hooks/flow-gate-enforcement/runner.mjs");

describe("flow gate hook runner", () => {
  it("serializes an unrelated Claude prompt as a silent allow", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-flow-hook-claude-noop-"));

    try {
      const result = await runHookRunner(tempRoot, {
        hook_event_name: "UserPromptSubmit",
        cwd: tempRoot,
        prompt: "先执行 「应用第①项」 ,然后「继续②」",
      });

      expect(result).toEqual({ exitCode: 0, stdout: "", stderr: "" });
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("serializes a passed Claude Flow Gate as a silent allow", async () => {
    const tempRoot = await createProjectWithConfig();
    await writeGateMetadata(tempRoot, {
      storyKey: "7-1-flow-gate-hook-enforcement",
      result: "PASS",
      generatedAt: new Date().toISOString(),
    });

    try {
      const result = await runHookRunner(tempRoot, {
        hook_event_name: "UserPromptSubmit",
        cwd: tempRoot,
        prompt: "/bmad-dev-story story 7-1",
      });

      expect(result).toEqual({ exitCode: 0, stdout: "", stderr: "" });
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("serializes a blocked Claude Flow Gate with the UserPromptSubmit decision schema", async () => {
    const tempRoot = await createProjectWithConfig();

    try {
      const result = await runHookRunner(tempRoot, {
        hook_event_name: "UserPromptSubmit",
        cwd: tempRoot,
        prompt: "/bmad-dev-story story 7-1",
      });
      const output = JSON.parse(result.stdout);

      expect(result.exitCode).toBe(0);
      expect(result.stderr).toBe("");
      expect(output).toEqual({
        decision: "block",
        reason: expect.stringContaining("Missing Flow Gate metadata"),
      });
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("no-ops quickly for unrelated prompts", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-flow-hook-noop-"));

    try {
      const result = await evaluateFlowGateHookEvent({
        projectRoot: tempRoot,
        event: {
          hook_event_name: "UserPromptSubmit",
          prompt: "please summarize this file",
        },
      });

      expect(result).toEqual({
        decision: "allow",
        reason: "No speclite-dev-story intent detected.",
        exitCode: 0,
      });
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it.each([
    {
      name: "PASS",
      result: "PASS",
    },
    {
      name: "PASS_EQUIVALENT",
      result: "PASS_EQUIVALENT",
    },
  ])("allows speclite-dev-story when story kickoff v2 metadata is $name", async ({ result }) => {
    const tempRoot = await createProjectWithConfig();
    await writeGateMetadata(tempRoot, {
      storyKey: "7-1-flow-gate-hook-enforcement",
      result,
    });

    try {
      const outcome = await evaluateFlowGateHookEvent({
        projectRoot: tempRoot,
        event: {
          event: "UserPromptSubmit",
          prompt: "/bmad-dev-story story 7-1",
        },
      });

      expect(outcome).toEqual({
        decision: "allow",
        reason: "Flow Gate story-kickoff evidence passed for 7-1-flow-gate-hook-enforcement.",
        exitCode: 0,
      });
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it.each([
    {
      name: "missing gate",
      setup: async (_tempRoot: string) => undefined,
      expectedReason: "Missing Flow Gate metadata",
    },
    {
      name: "non-pass gate",
      setup: async (tempRoot: string) =>
        writeGateMetadata(tempRoot, {
          storyKey: "7-1-flow-gate-hook-enforcement",
          result: "FAIL_EVIDENCE",
        }),
      expectedReason: "Flow Gate result FAIL_EVIDENCE does not allow development",
    },
    {
      name: "wrong story",
      setup: async (tempRoot: string) =>
        writeGateMetadata(tempRoot, {
          storyKey: "7-2-doctor-sync-and-uninstall-commands",
          target: "7-2-doctor-sync-and-uninstall-commands",
          result: "PASS",
        }),
      expectedReason: "Missing Flow Gate metadata",
    },
    {
      name: "stale gate",
      setup: async (tempRoot: string) =>
        writeGateMetadata(tempRoot, {
          storyKey: "7-1-flow-gate-hook-enforcement",
          result: "PASS",
          generatedAt: "2026-01-01T00:00:00.000Z",
        }),
      expectedReason: "Flow Gate metadata is stale",
    },
    {
      name: "legacy v1 missing handoff metadata",
      setup: async (tempRoot: string) =>
        writeGateMetadata(tempRoot, {
          storyKey: "7-1-flow-gate-hook-enforcement",
          result: "PASS",
          schemaVersion: "speclite.flow-gate-report.v1",
          includeFoundationMetadata: false,
        }),
      expectedReason: "Legacy Flow Gate report v1 must be regenerated",
    },
    {
      name: "missing handoff contract version",
      setup: async (tempRoot: string) =>
        writeGateMetadata(tempRoot, {
          storyKey: "7-1-flow-gate-hook-enforcement",
          result: "PASS",
          includeHandoffContractVersion: false,
        }),
      expectedReason: "Flow Gate handoff contract version is missing",
    },
    {
      name: "failed foundation prerequisite metadata",
      setup: async (tempRoot: string) =>
        writeGateMetadata(tempRoot, {
          storyKey: "7-1-flow-gate-hook-enforcement",
          result: "PASS",
          foundationPrerequisiteStatus: "FAIL_CONTRACT",
        }),
      expectedReason: "Flow Gate foundationPrerequisiteStatus FAIL_CONTRACT does not allow development",
    },
    {
      name: "failed closure owner check metadata",
      setup: async (tempRoot: string) =>
        writeGateMetadata(tempRoot, {
          storyKey: "7-1-flow-gate-hook-enforcement",
          result: "PASS",
          closureOwnerCheckStatus: "FAIL_CONTRACT",
        }),
      expectedReason: "Flow Gate closureOwnerCheckStatus FAIL_CONTRACT does not allow development",
    },
  ])("blocks speclite-dev-story for $name", async ({ setup, expectedReason }) => {
    const tempRoot = await createProjectWithConfig();
    await setup(tempRoot);

    try {
      const outcome = await evaluateFlowGateHookEvent({
        projectRoot: tempRoot,
        event: {
          hook_event_name: "UserPromptSubmit",
          prompt: "/bmad-dev-story story 7-1",
        },
        now: new Date("2026-06-15T00:00:00.000Z"),
      });

      expect(outcome.decision).toBe("block");
      expect(outcome.exitCode).toBe(2);
      expect(outcome.reason).toContain(expectedReason);
      expect(outcome.reason).toContain("speclite-flow-gate mode=story-kickoff target=7-1-flow-gate-hook-enforcement");
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("blocks ambiguous dev-story intent and asks for one Story", async () => {
    const tempRoot = await createProjectWithConfig();

    try {
      const outcome = await evaluateFlowGateHookEvent({
        projectRoot: tempRoot,
        event: {
          prompt: "/bmad-dev-story story 7-1 and then 7-2",
        },
      });

      expect(outcome).toEqual({
        decision: "block",
        reason: "Unable to resolve exactly one Story for speclite-dev-story. Specify one Story key before development.",
        exitCode: 2,
      });
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });
});

async function createProjectWithConfig(): Promise<string> {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-flow-hook-"));
  await mkdir(path.join(tempRoot, "_speclite"), { recursive: true });
  await writeFile(
    path.join(tempRoot, "_speclite/config.toml"),
    [
      "[core]",
      'project_name = "hook-test"',
      'output_folder = "{project-root}/_speclite-output"',
      "",
      "[modules.sdlc]",
      'implementation_artifacts = "{project-root}/_speclite-output/implementation-artifacts"',
      "",
    ].join("\n"),
    "utf8",
  );
  await mkdir(path.join(tempRoot, "_speclite-output/implementation-artifacts/stories"), {
    recursive: true,
  });
  await writeFile(
    path.join(
      tempRoot,
      "_speclite-output/implementation-artifacts/stories/7-1-flow-gate-hook-enforcement.md",
    ),
    "# Story 7.1\n",
    "utf8",
  );
  return tempRoot;
}

async function writeGateMetadata(
  projectRoot: string,
  input: {
    storyKey: string;
    target?: string;
    result: string;
    schemaVersion?: string;
    generatedAt?: string;
    includeHandoffContractVersion?: boolean;
    includeFoundationMetadata?: boolean;
    foundationPrerequisiteStatus?: string;
    closureOwnerCheckStatus?: string;
  },
): Promise<void> {
  const flowGateRoot = path.join(projectRoot, "_speclite-output/implementation-artifacts/flow-gates");
  await mkdir(flowGateRoot, { recursive: true });
  const target = input.target ?? input.storyKey;
  await writeFile(
    path.join(flowGateRoot, `${target}-story-kickoff-gate.md`),
    [
      "---",
      `schemaVersion: "${input.schemaVersion ?? "speclite.flow-gate-report.v2"}"`,
      'mode: "story-kickoff"',
      `target: "${target}"`,
      `storyKey: "${input.storyKey}"`,
      `result: "${input.result}"`,
      `generatedAt: "${input.generatedAt ?? new Date().toISOString()}"`,
      ...(input.includeHandoffContractVersion === false
        ? []
        : ['handoffContractVersion: "speclite.story-kickoff-handoff.v1"']),
      ...(input.includeFoundationMetadata === false
        ? []
        : [
            `foundationPrerequisiteStatus: "${input.foundationPrerequisiteStatus ?? "NOT_APPLICABLE"}"`,
            `closureOwnerCheckStatus: "${input.closureOwnerCheckStatus ?? "NOT_APPLICABLE"}"`,
          ]),
      'sourceSkill: "speclite-flow-gate"',
      "---",
      "",
      "# Flow Gate Report",
      "",
    ].join("\n"),
    "utf8",
  );
}

type HookRunnerResult = {
  exitCode: number | null;
  stdout: string;
  stderr: string;
};

async function runHookRunner(projectRoot: string, event: Record<string, unknown>): Promise<HookRunnerResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [RUNNER_PATH, "--platform", "claude"], {
      cwd: projectRoot,
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
    child.stdin.end(JSON.stringify(event));
  });
}
