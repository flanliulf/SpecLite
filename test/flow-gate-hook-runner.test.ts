import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { evaluateFlowGateHookEvent } from "../src/hooks/flow-gate-enforcement.js";

describe("flow gate hook runner", () => {
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
  ])("allows speclite-dev-story when story kickoff metadata is $name", async ({ result }) => {
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
    generatedAt?: string;
  },
): Promise<void> {
  const flowGateRoot = path.join(projectRoot, "_speclite-output/implementation-artifacts/flow-gates");
  await mkdir(flowGateRoot, { recursive: true });
  const target = input.target ?? input.storyKey;
  await writeFile(
    path.join(flowGateRoot, `${target}-story-kickoff-gate.md`),
    [
      "---",
      'schemaVersion: "speclite.flow-gate-report.v1"',
      'mode: "story-kickoff"',
      `target: "${target}"`,
      `storyKey: "${input.storyKey}"`,
      `result: "${input.result}"`,
      `generatedAt: "${input.generatedAt ?? "2026-06-14T00:00:00.000Z"}"`,
      'sourceSkill: "speclite-flow-gate"',
      "---",
      "",
      "# Flow Gate Report",
      "",
    ].join("\n"),
    "utf8",
  );
}
