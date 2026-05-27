import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createSpecliteProgram } from "../src/bin/speclite.js";
import { runInstallCommand } from "../src/commands/install.js";
import {
  createWorkflowArtifactMetadata,
  normalizeWorkflowArtifactMetadataForSnapshot,
  readMarkdownWorkflowArtifactMetadata,
  writeMarkdownWorkflowArtifactMetadata,
} from "../src/validation/artifact-metadata.js";
import { validateArtifactPathContract } from "../src/validation/rules/artifact-path.js";
import { FixtureCaseManifestSchema } from "../src/fixtures/fixture-contract.js";

const supportedRuntime = {
  nodeVersion: "v22.12.0",
  platform: "darwin",
  platformRelease: "23.0.0",
} as const;

describe("skill artifact loop activation fixture", () => {
  it("loads an installed IDE entry activation protocol without source checkout paths", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-skill-artifact-loop-"));

    try {
      await writeFile(path.join(tempRoot, "README.md"), "project notes\n", "utf8");

      const outcome = await runInstallCommand({
        options: { json: true, yes: true },
        runtime: {
          ...supportedRuntime,
          cwd: tempRoot,
          targetProject: "skill-artifact-loop",
        },
      });

      expect(outcome.exitCode).toBe(0);

      const phaseCoverage = await readJson(
        path.join(tempRoot, "_speclite/_config/phase-coverage.json"),
      );
      const devStoryRow = phaseCoverage.rows.find(
        (row: { canonicalSkillId: string }) => row.canonicalSkillId === "speclite-dev-story",
      );
      const codeReviewRow = phaseCoverage.rows.find(
        (row: { canonicalSkillId: string }) =>
          row.canonicalSkillId === "speclite-code-review-01-reviewer",
      );
      const claudeTarget = devStoryRow.ideTargets.find(
        (target: { targetId: string }) => target.targetId === "claude",
      );

      expect(claudeTarget).toEqual({
        targetId: "claude",
        entryPath: ".claude/skills/speclite-dev-story",
        activationTarget: ".claude/skills/speclite-dev-story/SKILL.md",
        status: "mapped",
      });

      const installedSkill = await readFile(
        path.join(tempRoot, claudeTarget.activationTarget),
        "utf8",
      );
      expect(installedSkill).toContain("=== 激活流程");
      expect(installedSkill).toContain(
        "speclite resolve customization --skill {skill-root} --project-root {project-root} --key workflow",
      );
      expect(installedSkill).toContain("speclite resolve config --project-root {project-root}");
      expect(installedSkill).not.toContain("从 `{project-root}/_speclite/config.toml` 加载配置");
      expect(installedSkill).not.toContain("{speclite-runtime-root}/scripts/resolve_customization.py");
      expect(installedSkill).not.toContain("assets/source/speclite");
      const installedActivation = await readFile(
        path.join(tempRoot, ".claude/skills/speclite-dev-story/references/activation.md"),
        "utf8",
      );
      expect(installedActivation).toContain(
        "speclite resolve customization --skill {skill-root} --project-root {project-root} --key workflow",
      );
      expect(installedActivation).toContain("speclite resolve config --project-root {project-root}");
      expect(installedActivation).not.toContain("从 `{project-root}/_speclite/config.toml` 加载并解析");
      expect(installedActivation).not.toContain("{speclite-runtime-root}/scripts/resolve_customization.py");

      await writeFile(
        path.join(tempRoot, "_speclite/config.user.toml"),
        '[core]\nproject_name = "skill-artifact-loop-user-override"\n',
        "utf8",
      );

      const installedWorkflowSteps = await readFile(
        path.join(tempRoot, ".claude/skills/speclite-dev-story/references/workflow-steps.md"),
        "utf8",
      );
      expect(installedWorkflowSteps).toContain(
        "speclite resolve customization --skill {skill-root} --project-root {project-root} --key workflow.on_complete",
      );
      expect(installedWorkflowSteps).not.toContain("{speclite-runtime-root}/scripts/resolve_customization.py");
      expect(JSON.stringify(phaseCoverage)).not.toContain(process.cwd());
      expect(JSON.stringify(phaseCoverage)).not.toContain("assets/source/speclite");

      const configResolve = await runResolve([
        "resolve",
        "config",
        "--project-root",
        tempRoot,
        "--key",
        "core.project_name",
      ]);
      expect(configResolve.exitCodes).toEqual([0]);
      expect(configResolve.stderr).toBe("");
      expect(JSON.parse(configResolve.stdout)).toEqual({
        "core.project_name": "skill-artifact-loop-user-override",
      });

      const customizationResolve = await runResolve([
        "resolve",
        "customization",
        "--skill",
        path.join(tempRoot, ".claude/skills/speclite-dev-story"),
        "--project-root",
        tempRoot,
        "--key",
        "workflow",
      ]);
      expect(customizationResolve.exitCodes).toEqual([0]);
      expect(customizationResolve.stderr).toBe("");
      expect(JSON.parse(customizationResolve.stdout)).toHaveProperty("workflow");

      expect(codeReviewRow.artifactContract).toEqual({
        artifactType: "code-review-summary",
        defaultOutputPath: "_speclite-output/implementation-artifacts/code-reviews",
        requiredMetadata: ["workflowType", "sourceSkill", "generatedAt"],
      });
      const artifactPath =
        "_speclite-output/implementation-artifacts/code-reviews/skill-artifact-loop.md";
      const generatedAt = "2026-05-27T06:00:00.000Z";
      const artifactMetadata = createWorkflowArtifactMetadata({
        workflowType: "code-review",
        sourceSkill: "speclite-code-review-01-reviewer",
        generatedAt,
      });
      await mkdir(path.dirname(path.join(tempRoot, artifactPath)), { recursive: true });
      await writeFile(
        path.join(tempRoot, artifactPath),
        writeMarkdownWorkflowArtifactMetadata({
          contents: "# Skill Artifact Loop\n\nFixture validates metadata only.\n",
          metadata: artifactMetadata,
        }),
        "utf8",
      );

      const writtenArtifact = await readFile(path.join(tempRoot, artifactPath), "utf8");
      expect(readMarkdownWorkflowArtifactMetadata(writtenArtifact)).toEqual(artifactMetadata);
      expect(normalizeWorkflowArtifactMetadataForSnapshot(artifactMetadata)).toEqual({
        workflowType: "code-review",
        sourceSkill: "speclite-code-review-01-reviewer",
        generatedAt: "<iso8601>",
      });
      await expect(
        validateArtifactPathContract({
          projectRoot: tempRoot,
          configuredRoot: "_speclite-output/implementation-artifacts",
          defaultOutputPath: codeReviewRow.artifactContract.defaultOutputPath,
          actualArtifactPath: artifactPath,
          artifactType: codeReviewRow.artifactContract.artifactType,
          metadata: artifactMetadata,
          metadataLocation: "frontmatter",
        }),
      ).resolves.toEqual([]);

      const fixtureCase = JSON.parse(
        await readFile("test/fixtures/skill-artifact-loop/fixture-case.json", "utf8"),
      );
      expect(FixtureCaseManifestSchema.parse(fixtureCase)).toEqual({
        caseId: "skill-artifact-loop",
        releaseGate: true,
        purpose: expect.stringContaining("workflow artifact write"),
      });
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });
});

async function readJson(filePath: string): Promise<any> {
  return JSON.parse(await readFile(filePath, "utf8"));
}

async function runResolve(args: string[]) {
  const stdout: string[] = [];
  const stderr: string[] = [];
  const exitCodes: number[] = [];
  const program = createSpecliteProgram({
    io: {
      stdout: (text) => stdout.push(text),
      stderr: (text) => stderr.push(text),
      setExitCode: (code) => exitCodes.push(code),
    },
  });

  await program.parseAsync(["node", "speclite", ...args], { from: "node" });

  return {
    stdout: stdout.join(""),
    stderr: stderr.join(""),
    exitCodes,
  };
}
