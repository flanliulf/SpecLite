import { cp, mkdir, mkdtemp, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
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
import {
  FixtureCaseManifestSchema,
  parseExpectedManifestSnapshot,
  RELEASE_FIXTURE_MATRIX,
  validateFixtureCaseLayout,
} from "../src/fixtures/fixture-contract.js";

const supportedRuntime = {
  nodeVersion: "v22.12.0",
  platform: "darwin",
  platformRelease: "23.0.0",
} as const;
const skillArtifactLoopRoot = "test/fixtures/skill-artifact-loop";

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
          expectedSourceSkill: "speclite-code-review-01-reviewer",
        }),
      ).resolves.toEqual([]);

      const fixtureCase = JSON.parse(
        await readFile("test/fixtures/skill-artifact-loop/fixture-case.json", "utf8"),
      );
      expect(FixtureCaseManifestSchema.parse(fixtureCase)).toEqual({
        caseId: "skill-artifact-loop",
        releaseGate: true,
        purpose: expect.stringContaining("workflow artifact write"),
        expectedOutputClass: "manifest-index-snapshot",
        documentationExampleClassification: "fixture-project-gate",
        docsExamples: [
          expect.objectContaining({
            path: "assets/source/speclite/docs/examples/fixture-derived-examples.md",
            classification: "packaged-documentation-example",
            isReleaseGateFixture: false,
          }),
        ],
      });
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("uses fixture-owned installed state for deterministic entry discovery and artifact metadata validation", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-skill-artifact-loop-fixture-"));

    try {
      await cp(path.join(skillArtifactLoopRoot, "input"), tempRoot, { recursive: true });

      expect(
        validateFixtureCaseLayout({
          relativeCasePath: skillArtifactLoopRoot,
          caseId: "skill-artifact-loop",
          entries: await listFixtureEntries(skillArtifactLoopRoot),
        }),
      ).toEqual([]);
      expect(RELEASE_FIXTURE_MATRIX.find((entry) => entry.fixtureId === "skill-artifact-loop")).toEqual({
        fixtureId: "skill-artifact-loop",
        status: "required",
      });

      const manifest = parseExpectedManifestSnapshot(
        await readJson(path.join(tempRoot, "_speclite/_config/manifest.json")),
      );
      const skillIndex = parseExpectedManifestSnapshot(
        await readJson(path.join(tempRoot, "_speclite/_config/skill-index.json")),
      ) as { entries: Array<{ canonicalSkillId: string; installedTargets: string[] }> };
      const helpIndex = parseExpectedManifestSnapshot(
        await readJson(path.join(tempRoot, "_speclite/_config/help-index.json")),
      ) as { entries: Array<{ canonicalSkillId: string; activationTarget: string; targetIds: string[] }> };
      const phaseCoverage = parseExpectedManifestSnapshot(
        await readJson(path.join(tempRoot, "_speclite/_config/phase-coverage.json")),
      ) as {
        rows: Array<{
          canonicalSkillId: string;
          ideTargets: Array<{ targetId: string; entryPath: string; activationTarget: string; status: string }>;
          artifactContract: {
            artifactType: string;
            defaultOutputPath: string;
            requiredMetadata: string[];
          };
        }>;
      };
      parseExpectedManifestSnapshot(await readJson(path.join(tempRoot, "_speclite/_config/files-index.json")));

      expect(JSON.stringify(manifest)).not.toContain(process.cwd());
      expect(JSON.stringify(phaseCoverage)).not.toContain("assets/source/speclite");

      const row = phaseCoverage.rows.find(
        (entry) => entry.canonicalSkillId === "speclite-code-review-01-reviewer",
      );
      expect(row).toBeDefined();
      const mappedTarget = row!.ideTargets.find((target) => target.targetId === "claude");
      const expectedDiscovery = await readJson(path.join(skillArtifactLoopRoot, "expected/entry-discovery.json"));

      expect(skillIndex.entries.filter((entry) => entry.canonicalSkillId === row!.canonicalSkillId)).toHaveLength(1);
      expect(helpIndex.entries.filter((entry) => entry.canonicalSkillId === row!.canonicalSkillId)).toHaveLength(1);
      expect(mappedTarget).toMatchObject({
        targetId: "claude",
        entryPath: ".claude/skills/speclite-code-review-01-reviewer",
        activationTarget: ".claude/skills/speclite-code-review-01-reviewer/SKILL.md",
        status: "mapped",
      });
      expect(row!.ideTargets.map((target) => target.targetId)).toEqual(["claude"]);
      expect(JSON.stringify(row)).not.toMatch(/copilot|cursor|command pointer/i);
      await expect(stat(path.join(tempRoot, mappedTarget!.activationTarget))).resolves.toBeDefined();
      await expect(stat(path.join(tempRoot, mappedTarget!.entryPath))).resolves.toBeDefined();
      expect({
        canonicalSkillId: row!.canonicalSkillId,
        targetId: mappedTarget!.targetId,
        entryPath: mappedTarget!.entryPath,
        activationTarget: mappedTarget!.activationTarget,
        installedPackageDirectory: mappedTarget!.entryPath,
        artifactContract: row!.artifactContract,
      }).toEqual(expectedDiscovery);

      const installedSkill = await readFile(path.join(tempRoot, mappedTarget!.activationTarget), "utf8");
      expect(installedSkill).toContain("speclite resolve config --project-root {project-root}");
      expect(installedSkill).toContain(
        "speclite resolve customization --skill {skill-root} --project-root {project-root}",
      );
      expect(installedSkill).not.toMatch(/resolve_customization\.py|assets\/source\/speclite|node dist|package cache/i);

      const configResolve = await runResolve([
        "resolve",
        "config",
        "--project-root",
        tempRoot,
        "--key",
        "core.project_name",
      ]);
      const customizationResolve = await runResolve([
        "resolve",
        "customization",
        "--skill",
        path.join(tempRoot, mappedTarget!.entryPath),
        "--project-root",
        tempRoot,
        "--key",
        "workflow",
      ]);
      expect(configResolve.exitCodes).toEqual([0]);
      expect(configResolve.stderr).toBe("");
      expect(JSON.parse(configResolve.stdout)).toEqual({
        "core.project_name": "Skill Artifact Loop User Override",
      });
      expect(customizationResolve.exitCodes).toEqual([0]);
      expect(customizationResolve.stderr).toBe("");
      expect(JSON.parse(customizationResolve.stdout)).toEqual({
        workflow: {
          mode: "fixture-team",
          artifact_type: "code-review-summary",
        },
      });

      const artifactPath = "_speclite-output/implementation-artifacts/code-reviews/skill-artifact-loop.md";
      const artifactMetadata = createWorkflowArtifactMetadata({
        workflowType: "code-review",
        sourceSkill: row!.canonicalSkillId,
        generatedAt: "2026-06-02T01:23:00.000Z",
      });
      await mkdir(path.dirname(path.join(tempRoot, artifactPath)), { recursive: true });
      await writeFile(
        path.join(tempRoot, artifactPath),
        writeMarkdownWorkflowArtifactMetadata({
          contents: "# Code Review Fixture\n\nMetadata-only fixture artifact.\n",
          metadata: artifactMetadata,
        }),
        "utf8",
      );
      const artifact = await readFile(path.join(tempRoot, artifactPath), "utf8");
      const normalizedMetadata = normalizeWorkflowArtifactMetadataForSnapshot(
        readMarkdownWorkflowArtifactMetadata(artifact),
      );
      const expectedMetadata = await readJson(
        path.join(skillArtifactLoopRoot, "expected/artifact/metadata-normalized.json"),
      );
      expect(normalizedMetadata).toEqual(expectedMetadata);
      await expect(
        validateArtifactPathContract({
          projectRoot: tempRoot,
          configuredRoot: "_speclite-output/implementation-artifacts",
          defaultOutputPath: row!.artifactContract.defaultOutputPath,
          actualArtifactPath: artifactPath,
          artifactType: row!.artifactContract.artifactType,
          metadata: artifactMetadata,
          metadataLocation: "frontmatter",
          expectedSourceSkill: row!.canonicalSkillId,
        }),
      ).resolves.toEqual([]);

      for (const invalid of [
        {},
        { workflowType: "code-review", sourceSkill: row!.canonicalSkillId, generatedAt: "not-a-date" },
        {
          workflowType: "code-review",
          sourceSkill: "speclite-dev-story",
          generatedAt: "2026-06-02T01:23:00.000Z",
        },
      ]) {
        const issues = await validateArtifactPathContract({
          projectRoot: tempRoot,
          configuredRoot: "_speclite-output/implementation-artifacts",
          defaultOutputPath: row!.artifactContract.defaultOutputPath,
          actualArtifactPath: artifactPath,
          artifactType: row!.artifactContract.artifactType,
          metadata: invalid,
          metadataLocation: "frontmatter",
          expectedSourceSkill: row!.canonicalSkillId,
        });
        expect(issues.map((issue) => issue.issueId)).toContain(
          Object.keys(invalid).length === 0
            ? "artifact-path.missing-required-metadata"
            : "artifact-path.invalid-required-metadata",
        );
      }
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("keeps fixture-derived documentation examples classified separately from release gate fixtures", async () => {
    const fixtureCase = FixtureCaseManifestSchema.parse(
      await readJson(path.join(skillArtifactLoopRoot, "fixture-case.json")),
    ) as {
      docsExamples: Array<{
        path: string;
        classification: string;
        derivedFrom: string[];
        isReleaseGateFixture: boolean;
      }>;
    };
    const classification = await readJson(
      path.join(skillArtifactLoopRoot, "expected/docs-examples/classification.json"),
    );
    const docsExample = fixtureCase.docsExamples[0]!;
    const docsText = await readFile(docsExample.path, "utf8");

    expect(docsExample).toEqual(classification);
    expect(docsExample.classification).toBe("packaged-documentation-example");
    expect(docsExample.isReleaseGateFixture).toBe(false);
    for (const source of docsExample.derivedFrom) {
      await expect(stat(source)).resolves.toBeDefined();
      expect(docsText).toContain(source);
    }
    expect(docsText).not.toContain("type WorkflowArtifactMetadata");
    expect(docsText).not.toContain("CommandResult<TData>");
    expect(docsText).not.toMatch(/2026-\d\d-\d\dT\d\d:\d\d:\d\d/);
  });
});

async function readJson(filePath: string): Promise<any> {
  return JSON.parse(await readFile(filePath, "utf8"));
}

async function listFixtureEntries(root: string): Promise<string[]> {
  const entries: string[] = [];
  async function visit(current: string): Promise<void> {
    const children = await readdir(current, { withFileTypes: true });
    for (const child of children) {
      const childPath = path.join(current, child.name);
      const relative = childPath.split(path.sep).join("/");
      entries.push(relative);
      if (child.isDirectory()) await visit(childPath);
    }
  }
  await visit(root);
  return entries.sort((left, right) => left.localeCompare(right));
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
