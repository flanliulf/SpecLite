import { lstat, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { runInstallCommand } from "../src/commands/install.js";
import { applyInstallPlan } from "../src/installer/runtime-structure.js";
import type { SourceDescriptor } from "../src/source/source-descriptor-schema.js";

const supportedRuntime = {
  nodeVersion: "v22.12.0",
  platform: "darwin",
  platformRelease: "23.0.0",
} as const;
const fixtureExpectedRoot = path.join(
  process.cwd(),
  "test/fixtures/fresh-install-empty-project/expected",
);
const EXPECTED_CANONICAL_PACKAGE_ROOT_COUNT = 61;
const REQUIRED_METHOD_LOOP_SKILL_IDS = [
  "speclite-advanced-elicitation",
  "speclite-review-acceptance-auditor",
  "speclite-agent-analyst",
  "speclite-agent-pm",
  "speclite-agent-ux-designer",
  "speclite-agent-architect",
  "speclite-agent-dev",
  "speclite-dev-story",
];

describe("runtime structure and IDE mirror creation", () => {
  it("writes the confirmed fresh install shape and completes ReadyCheck", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-runtime-shape-"));

    try {
      await writeFile(path.join(tempRoot, "README.md"), "project notes\n", "utf8");

      const outcome = await runInstallCommand({
        options: { json: true, yes: true },
        runtime: {
          ...supportedRuntime,
          cwd: tempRoot,
          targetProject: "fresh-install-empty-project",
        },
      });

      expect(outcome.exitCode).toBe(0);
      expect(outcome.result.status).toBe("success");
      expect(outcome.result.data.installedModules).toEqual(["core", "sdlc"]);
      expect(outcome.result.data.ideTargets).toEqual([
        {
          id: "claude",
          status: "configured",
          targetPath: ".claude/skills",
          skillCount: EXPECTED_CANONICAL_PACKAGE_ROOT_COUNT,
        },
        {
          id: "agents",
          status: "configured",
          targetPath: ".agents/skills",
          skillCount: EXPECTED_CANONICAL_PACKAGE_ROOT_COUNT,
        },
      ]);
      expect(outcome.result.data.completedSteps).toContain("ide-mirror-creation");
      expect(outcome.result.data.completedSteps).toContain("manifest-generation");
      expect(outcome.result.data.completedSteps).toContain("ready-check");
      expect(outcome.result.data.completedSteps).toContain("ready-summary");
      expect(outcome.result.data.pendingSteps).toEqual([]);
      await expect(readJson(path.join(fixtureExpectedRoot, "command-json/fresh-install-success.json"))).resolves.toEqual(
        outcome.result,
      );

      await expect(readFile(path.join(tempRoot, "_speclite/config.toml"), "utf8")).resolves.toContain(
        "[core]",
      );
      await expect(
        readFile(path.join(tempRoot, "_speclite/config.user.toml"), "utf8"),
      ).resolves.toContain("communication_language");
      await expect(
        readFile(path.join(tempRoot, ".claude/skills/speclite-dev-story/SKILL.md"), "utf8"),
      ).resolves.toContain("speclite-dev-story");
      await expect(
        readFile(path.join(tempRoot, ".agents/skills/speclite-dev-story/SKILL.md"), "utf8"),
      ).resolves.toContain("speclite-dev-story");
      await expect(
        readFile(path.join(tempRoot, ".claude/skills/speclite-dev-story/SKILL.en.md"), "utf8"),
      ).rejects.toMatchObject({
        code: "ENOENT",
      });
      await expect(
        readFile(path.join(tempRoot, ".agents/skills/speclite-dev-story/SKILL.en.md"), "utf8"),
      ).rejects.toMatchObject({
        code: "ENOENT",
      });
      await expect(
        readFile(path.join(tempRoot, ".claude/skills/speclite-dev-story/customize.toml"), "utf8"),
      ).resolves.toContain("[workflow]");
      await expect(
        readFile(path.join(tempRoot, ".claude/skills/speclite-help/customize.toml"), "utf8"),
      ).rejects.toMatchObject({
        code: "ENOENT",
      });
      await expect(
        readFile(path.join(tempRoot, "_speclite/scripts/resolve_config.py"), "utf8"),
      ).resolves.toContain("Resolve SpecLite's central config");
      await expect(
        readFile(path.join(tempRoot, "_speclite/scripts/resolve_customization.py"), "utf8"),
      ).resolves.toContain("Resolve customization for a SpecLite skill");

      const manifest = await readJson(path.join(tempRoot, "_speclite/_config/manifest.yaml"));
      const skillIndex = await readJson(path.join(tempRoot, "_speclite/_config/skill-index.json"));
      const filesIndex = await readJson(path.join(tempRoot, "_speclite/_config/files-index.json"));
      const phaseCoverage = await readJson(path.join(tempRoot, "_speclite/_config/phase-coverage.json"));
      const expectedManifest = await readJson(path.join(fixtureExpectedRoot, "installed-state/manifest.json"));
      const expectedDevStorySkillIndex = await readJson(
        path.join(fixtureExpectedRoot, "installed-state/skill-index-speclite-dev-story.json"),
      );
      const expectedDevStoryFileIndex = await readJson(
        path.join(fixtureExpectedRoot, "installed-state/files-index-dev-story-skill.json"),
      );
      const expectedDevStoryPhaseCoverage = await readJson(
        path.join(fixtureExpectedRoot, "installed-state/phase-coverage-dev-story.json"),
      );
      const devStoryEntry = skillIndex.entries.find(
        (entry: { canonicalSkillId: string }) => entry.canonicalSkillId === "speclite-dev-story",
      );
      const devStoryFileEntry = filesIndex.entries.find(
        (entry: { path: string }) => entry.path === ".claude/skills/speclite-dev-story/SKILL.md",
      );
      const devStoryPhaseRow = phaseCoverage.rows.find(
        (row: { canonicalSkillId: string }) => row.canonicalSkillId === "speclite-dev-story",
      );
      const devStoryEntries = skillIndex.entries.filter(
        (entry: { canonicalSkillId: string }) => entry.canonicalSkillId === "speclite-dev-story",
      );
      const devStoryTargetFiles = filesIndex.entries.filter(
        (entry: { path: string }) =>
          entry.path.startsWith(".claude/skills/speclite-dev-story/") ||
          entry.path.startsWith(".agents/skills/speclite-dev-story/"),
      );
      const createPrdPhaseRow = phaseCoverage.rows.find(
        (row: { canonicalSkillId: string }) => row.canonicalSkillId === "speclite-create-prd",
      );
      const customizePhaseRow = phaseCoverage.rows.find(
        (row: { canonicalSkillId: string }) => row.canonicalSkillId === "speclite-customize",
      );
      const storyReviewPhaseRow = phaseCoverage.rows.find(
        (row: { canonicalSkillId: string }) => row.canonicalSkillId === "speclite-story-review-01-reviewer",
      );
      const canonicalSkillIds = skillIndex.entries.map(
        (entry: { canonicalSkillId: string }) => entry.canonicalSkillId,
      );
      const claudeSkillFileIds = mirrorSkillFileIds(filesIndex, ".claude/skills");
      const agentsSkillFileIds = mirrorSkillFileIds(filesIndex, ".agents/skills");
      const compatScriptEntries = filesIndex.entries.filter((entry: { path: string }) =>
        entry.path.startsWith("_speclite/scripts/resolve_"),
      );

      expect(manifest).toMatchObject(expectedManifest);
      expect(compatScriptEntries).toEqual([
        expect.objectContaining({
          path: "_speclite/scripts/resolve_config.py",
          ownership: "installer-owned",
          hashAlgorithm: "sha256",
          executable: true,
          artifactKind: "runtime-compat-script",
          sourceRef: "assets/source/speclite/scripts/resolve_config.py",
        }),
        expect.objectContaining({
          path: "_speclite/scripts/resolve_customization.py",
          ownership: "installer-owned",
          hashAlgorithm: "sha256",
          executable: true,
          artifactKind: "runtime-compat-script",
          sourceRef: "assets/source/speclite/scripts/resolve_customization.py",
        }),
      ]);
      expect(canonicalSkillIds).toHaveLength(EXPECTED_CANONICAL_PACKAGE_ROOT_COUNT);
      expect(new Set(canonicalSkillIds).size).toBe(EXPECTED_CANONICAL_PACKAGE_ROOT_COUNT);
      expect(canonicalSkillIds).toEqual([...canonicalSkillIds].sort());
      expect(canonicalSkillIds).toEqual(expect.arrayContaining(REQUIRED_METHOD_LOOP_SKILL_IDS));
      expect(claudeSkillFileIds).toHaveLength(EXPECTED_CANONICAL_PACKAGE_ROOT_COUNT);
      expect(agentsSkillFileIds).toHaveLength(EXPECTED_CANONICAL_PACKAGE_ROOT_COUNT);
      expect(claudeSkillFileIds).toEqual(canonicalSkillIds);
      expect(agentsSkillFileIds).toEqual(canonicalSkillIds);
      expect(devStoryEntries).toHaveLength(1);
      expect(devStoryEntry).toEqual(expectedDevStorySkillIndex);
      expect(devStoryFileEntry).toEqual(expectedDevStoryFileIndex);
      expect(devStoryPhaseRow).toEqual(expectedDevStoryPhaseCoverage);
      expect(devStoryTargetFiles.map((entry: { path: string }) => entry.path)).not.toContain(
        ".claude/skills/speclite-dev-story/SKILL.en.md",
      );
      expect(devStoryTargetFiles.map((entry: { path: string }) => entry.path)).not.toContain(
        ".agents/skills/speclite-dev-story/SKILL.en.md",
      );
      expect(
        devStoryTargetFiles
          .filter((entry: { path: string }) => entry.path.endsWith("/SKILL.md"))
          .map((entry: { hash: string }) => entry.hash),
      ).toHaveLength(2);
      expect(
        new Set(
          devStoryTargetFiles
            .filter((entry: { path: string }) => entry.path.endsWith("/SKILL.md"))
            .map((entry: { hash: string }) => entry.hash),
        ).size,
      ).toBe(1);
      expect(JSON.stringify(skillIndex)).not.toContain(process.cwd());
      expect(JSON.stringify(filesIndex)).not.toContain(process.cwd());
      expect(createPrdPhaseRow).toMatchObject({
        schemaVersion: "speclite.phase-coverage.v1",
        phaseId: "2-planning",
        phaseLabel: "Planning",
        moduleId: "sdlc",
        canonicalSkillId: "speclite-create-prd",
        artifactContract: {
          artifactType: "prd",
          defaultOutputPath: "_speclite-output/planning-artifacts",
          requiredMetadata: ["workflowType", "sourceSkill", "generatedAt"],
        },
      });
      expect(storyReviewPhaseRow).toMatchObject({
        phaseId: "3-solutioning",
        phaseLabel: "Solutioning",
        artifactContract: {
          artifactType: "story-review-summary",
          defaultOutputPath: "_speclite-output/implementation-artifacts/story-reviews",
        },
      });
      expect(customizePhaseRow).not.toHaveProperty("artifactContract");
      expect(filesIndex.entries).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: "_speclite/config.toml",
            ownership: "installer-owned",
            hashAlgorithm: "sha256",
            artifactKind: "runtime-config",
          }),
          expect.objectContaining({
            path: "_speclite/custom/config.toml",
            ownership: "human-owned",
            artifactKind: "project-custom-stub",
          }),
          expect.objectContaining({
            path: ".claude/skills/speclite-dev-story/SKILL.md",
            ownership: "installer-owned",
            sourceRef: "assets/source/speclite/sdlc-skills/4-implementation/speclite-dev-story/SKILL.md",
          }),
          expect.objectContaining({
            path: ".agents/skills/speclite-dev-story/SKILL.md",
            ownership: "installer-owned",
            sourceRef: "assets/source/speclite/sdlc-skills/4-implementation/speclite-dev-story/SKILL.md",
          }),
        ]),
      );
      expect(phaseCoverage.rows).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            phaseId: "4-implementation",
            moduleId: "sdlc",
            canonicalSkillId: "speclite-dev-story",
            ideTargets: [
              expect.objectContaining({ targetId: "claude", status: "mapped" }),
              expect.objectContaining({ targetId: "agents", status: "mapped" }),
            ],
          }),
        ]),
      );
      expect(devStoryPhaseRow.ideTargets).toEqual([
        expect.objectContaining({
          targetId: "claude",
          entryPath: ".claude/skills/speclite-dev-story",
          activationTarget: ".claude/skills/speclite-dev-story/SKILL.md",
          status: "mapped",
        }),
        expect.objectContaining({
          targetId: "agents",
          entryPath: ".agents/skills/speclite-dev-story",
          activationTarget: ".agents/skills/speclite-dev-story/SKILL.md",
          status: "mapped",
        }),
      ]);
      expect(phaseCoverage.rows.map((row: { phaseId: string; moduleId: string; canonicalSkillId: string }) =>
        `${row.phaseId}:${row.moduleId}:${row.canonicalSkillId}`,
      )).toEqual(
        [...phaseCoverage.rows]
          .map((row: { phaseId: string; moduleId: string; canonicalSkillId: string }) =>
            `${row.phaseId}:${row.moduleId}:${row.canonicalSkillId}`,
          )
          .sort(),
      );

      for (const directory of [
        "_speclite-output/planning-artifacts",
        "_speclite-output/implementation-artifacts/stories",
        "_speclite-output/implementation-artifacts/code-reviews",
        "docs/brownfield/evidence",
      ]) {
        await expect(lstat(path.join(tempRoot, directory))).resolves.toMatchObject({
          isDirectory: expect.any(Function),
        });
      }
      const expectedTree = (await readFile(path.join(fixtureExpectedRoot, "installed-tree.txt"), "utf8"))
        .split("\n")
        .filter((entry) => entry.length > 0);
      for (const expectedPath of expectedTree) {
        await expect(lstat(path.join(tempRoot, expectedPath))).resolves.toBeDefined();
      }

      const serializedResult = JSON.stringify(outcome.result);
      expect(serializedResult).not.toContain(tempRoot);
      expect(JSON.stringify(phaseCoverage)).not.toContain("copilot");
      expect(JSON.stringify(phaseCoverage)).not.toContain("cursor");
      expect(JSON.stringify(phaseCoverage)).not.toContain("command-pointer");
      expect(JSON.stringify(outcome.result)).not.toContain("Copilot");
      expect(JSON.stringify(outcome.result)).not.toContain("Cursor");
      expect(serializedResult).not.toContain("readySummary");
      expect(serializedResult).not.toContain("changedPaths");
      expect(serializedResult).not.toContain(".speclite-tmp-");
      expect(JSON.stringify(filesIndex)).not.toContain("_speclite/.lock");
      expect(JSON.stringify(filesIndex)).not.toContain(".speclite-tmp-");
      await expect(readFile(path.join(tempRoot, "_speclite/.lock"), "utf8")).rejects.toMatchObject({
        code: "ENOENT",
      });
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("uses canonical target order while respecting a selected target subset", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-runtime-target-subset-"));

    try {
      await writeFile(path.join(tempRoot, "README.md"), "project notes\n", "utf8");

      const outcome = await runInstallCommand({
        options: { yes: true },
        runtime: {
          ...supportedRuntime,
          cwd: tempRoot,
        },
        configureProject: async () => ({
          ideTargetIds: ["agents"],
        }),
      });

      expect(outcome.exitCode).toBe(0);
      expect(outcome.result.data.ideTargets).toEqual([
        {
          id: "agents",
          status: "configured",
          targetPath: ".agents/skills",
          skillCount: EXPECTED_CANONICAL_PACKAGE_ROOT_COUNT,
        },
      ]);
      await expect(
        readFile(path.join(tempRoot, ".agents/skills/speclite-help/SKILL.md"), "utf8"),
      ).resolves.toContain("speclite-help");
      await expect(readFile(path.join(tempRoot, ".claude/skills/speclite-help/SKILL.md"), "utf8")).rejects.toMatchObject({
        code: "ENOENT",
      });

      const skillIndex = await readJson(path.join(tempRoot, "_speclite/_config/skill-index.json"));
      expect(skillIndex.entries[0].installedTargets).toEqual(["agents"]);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("appends missing user config rules to an existing gitignore during install", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-runtime-existing-gitignore-"));

    try {
      await writeFile(path.join(tempRoot, "README.md"), "project notes\n", "utf8");
      await writeFile(path.join(tempRoot, ".gitignore"), ".DS_Store\n_speclite-output/\n", "utf8");

      const outcome = await runInstallCommand({
        options: { json: true, yes: true },
        runtime: {
          ...supportedRuntime,
          cwd: tempRoot,
        },
      });

      expect(outcome.exitCode).toBe(0);
      expect(outcome.result.status).toBe("success");
      const gitignore = await readFile(path.join(tempRoot, ".gitignore"), "utf8");
      expect(gitignore).toContain(".DS_Store");
      expect(gitignore).toContain("_speclite-output/");
      expect(gitignore).toContain("_speclite/config.user.toml");
      expect(gitignore).toContain("_speclite/custom/config.user.toml");

      const filesIndex = await readJson(path.join(tempRoot, "_speclite/_config/files-index.json"));
      expect(filesIndex.entries).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: ".gitignore",
            ownership: "human-owned",
            artifactKind: "gitignore",
          }),
        ]),
      );
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("blocks explicitly selected unsupported IDE targets before write planning", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-runtime-unsupported-target-"));

    try {
      await writeFile(path.join(tempRoot, "README.md"), "project notes\n", "utf8");

      const outcome = await runInstallCommand({
        options: { yes: true },
        runtime: {
          ...supportedRuntime,
          cwd: tempRoot,
        },
        configureProject: async () => ({
          ideTargetIds: ["cursor"],
        }),
      });

      expect(outcome.exitCode).toBe(1);
      expect(outcome.installPlan).toBeUndefined();
      expect(outcome.result.issues).toEqual([
        expect.objectContaining({
          issueId: "ide-mirror.unsupported-target",
          category: "ide-mirror",
          severity: "error",
          component: "adapter-registry",
          details: {
            unsupportedTargetIds: ["cursor"],
            supportedTargetIds: ["claude", "agents"],
          },
        }),
      ]);
      expect(JSON.stringify(outcome.result)).not.toContain(tempRoot);
      await expect(readFile(path.join(tempRoot, ".agents/skills/speclite-help/SKILL.md"), "utf8")).rejects.toMatchObject({
        code: "ENOENT",
      });
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("fails before write phase when another project operation lock exists", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-runtime-locked-"));

    try {
      await mkdir(path.join(tempRoot, "_speclite"), { recursive: true });
      await writeFile(
        path.join(tempRoot, "_speclite/.lock"),
        JSON.stringify({
          schemaVersion: "speclite.operation-lock.v1",
          operation: "install",
          createdAt: "2026-05-26T00:00:00.000Z",
          projectRootHash: "sha256:fixture",
        }),
        "utf8",
      );

      const outcome = await runInstallCommand({
        options: { json: true, yes: true },
        runtime: {
          ...supportedRuntime,
          cwd: tempRoot,
        },
      });

      expect(outcome.exitCode).toBe(1);
      expect(outcome.result.issues).toEqual([
        expect.objectContaining({
          issueId: "operation-lock.project-locked",
          category: "operation-lock",
          severity: "error",
          affectedPath: "_speclite/.lock",
        }),
      ]);
      expect(outcome.result.data.pendingSteps).toContain("ide-mirror-creation");
      await expect(readFile(path.join(tempRoot, "_speclite/config.toml"), "utf8")).rejects.toMatchObject({
        code: "ENOENT",
      });
      expect(JSON.stringify(outcome.result)).not.toContain("createdAt");
      expect(JSON.stringify(outcome.result)).not.toContain(tempRoot);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("rejects unauthorized direct apply without acquiring a lock or writing files", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-runtime-unauthorized-"));
    const sourceDescriptor: SourceDescriptor = {
      sourceType: "bundled",
      resolvedRoot: "assets/source/speclite",
      integrityEvidence: [],
      trustStatus: "unverified",
    };

    try {
      const result = await applyInstallPlan({
        targetRoot: tempRoot,
        packageRoot: process.cwd(),
        sourceDescriptor,
        installPlan: {
          sourceDescriptor,
          selectedModules: [],
          targetAdapters: [],
          externalAccesses: [],
          plannedWrites: [],
          requiresConfirmation: true,
          writeAuthorized: false,
        },
        selectedModules: [],
        configPlan: {
          ok: true,
          mode: "quick",
          model: {
            core: {
              project_name: "unauthorized-apply",
              user_name: "SpecLite",
              communication_language: "Chinese",
              document_output_language: "Chinese",
              output_folder: "_speclite-output",
            },
            modules: {},
          },
          configToml: {
            core: {
              project_name: "unauthorized-apply",
              document_output_language: "Chinese",
              output_folder: "_speclite-output",
            },
          },
          configUserToml: {
            core: {
              user_name: "SpecLite",
              communication_language: "Chinese",
            },
          },
          plannedWrites: [],
          summary: "Fixture config plan.",
          nextActions: [],
        },
      });

      expect(result).toEqual({
        ok: false,
        issue: expect.objectContaining({
          issueId: "operation-lock.project-locked",
          category: "operation-lock",
          severity: "error",
          details: {
            reason: "write-not-authorized",
          },
        }),
        completedSteps: [],
        pendingSteps: [
          "runtime-structure",
          "ide-mirror-creation",
          "manifest-generation",
          "ready-check",
          "ready-summary",
        ],
        changedPaths: [],
      });
      await assertNoRuntimeApplyWrites(tempRoot);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("rejects a write-authorized blocked source descriptor before lock acquisition or writes", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-runtime-blocked-source-"));
    const blockedSourceDescriptor: SourceDescriptor = {
      sourceType: "bundled",
      resolvedRoot: "assets/source/speclite",
      integrityEvidence: [],
      trustStatus: "blocked",
    };

    try {
      const result = await applyInstallPlan({
        targetRoot: tempRoot,
        packageRoot: process.cwd(),
        sourceDescriptor: blockedSourceDescriptor,
        installPlan: {
          sourceDescriptor: blockedSourceDescriptor,
          selectedModules: [],
          targetAdapters: [],
          externalAccesses: [],
          plannedWrites: [],
          requiresConfirmation: false,
          writeAuthorized: true,
        },
        selectedModules: [],
        configPlan: {
          ok: true,
          mode: "quick",
          model: {
            core: {
              project_name: "blocked-source",
              user_name: "SpecLite",
              communication_language: "Chinese",
              document_output_language: "Chinese",
              output_folder: "_speclite-output",
            },
            modules: {},
          },
          configToml: {
            core: {
              project_name: "blocked-source",
              document_output_language: "Chinese",
              output_folder: "_speclite-output",
            },
          },
          configUserToml: {
            core: {
              user_name: "SpecLite",
              communication_language: "Chinese",
            },
          },
          plannedWrites: [],
          summary: "Fixture config plan.",
          nextActions: [],
        },
      });

      expect(result).toEqual({
        ok: false,
        issue: expect.objectContaining({
          issueId: "source-integrity.blocked-source",
          category: "source-integrity",
          severity: "error",
          details: {
            reason: "blocked-source",
            sourceType: "bundled",
          },
        }),
        completedSteps: [],
        pendingSteps: [
          "runtime-structure",
          "ide-mirror-creation",
          "manifest-generation",
          "ready-check",
          "ready-summary",
        ],
        changedPaths: [],
      });
      await assertNoRuntimeApplyWrites(tempRoot);
      expect(JSON.stringify(result)).not.toContain(tempRoot);
      expect(JSON.stringify(result)).not.toContain(process.cwd());
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("preserves existing human-owned stubs and workflow-owned artifacts", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-runtime-preserve-"));
    const humanStub = "# hand edited\n[core]\nproject_name = \"keep\"\n";
    const workflowArtifact = "# existing plan\n";

    try {
      await mkdir(path.join(tempRoot, "_speclite/custom"), { recursive: true });
      await mkdir(path.join(tempRoot, "_speclite-output/planning-artifacts"), { recursive: true });
      await writeFile(path.join(tempRoot, "_speclite/custom/config.toml"), humanStub, "utf8");
      await writeFile(
        path.join(tempRoot, "_speclite-output/planning-artifacts/existing.md"),
        workflowArtifact,
        "utf8",
      );

      const outcome = await runInstallCommand({
        options: { yes: true },
        runtime: {
          ...supportedRuntime,
          cwd: tempRoot,
        },
      });

      expect(outcome.exitCode).toBe(0);
      await expect(readFile(path.join(tempRoot, "_speclite/custom/config.toml"), "utf8")).resolves.toBe(
        humanStub,
      );
      await expect(
        readFile(path.join(tempRoot, "_speclite-output/planning-artifacts/existing.md"), "utf8"),
      ).resolves.toBe(workflowArtifact);

      const filesIndex = await readJson(path.join(tempRoot, "_speclite/_config/files-index.json"));
      expect(filesIndex.entries).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: "_speclite/custom/config.toml",
            ownership: "human-owned",
            artifactKind: "project-custom-stub",
          }),
        ]),
      );
      expect(JSON.stringify(filesIndex)).not.toContain("existing.md");
      expect(JSON.stringify(outcome.result)).not.toContain(humanStub);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("rejects artifact roots that escape through symlinks before runtime writes", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-runtime-symlink-"));
    const outsideRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-runtime-outside-"));

    try {
      await symlink(outsideRoot, path.join(tempRoot, "_speclite-output"));

      const outcome = await runInstallCommand({
        options: { json: true, yes: true },
        runtime: {
          ...supportedRuntime,
          cwd: tempRoot,
        },
      });

      expect(outcome.exitCode).toBe(1);
      expect(outcome.result.issues).toEqual([
        expect.objectContaining({
          issueId: "artifact-path.symlink-escape",
          category: "artifact-path",
          severity: "error",
        }),
      ]);
      await expect(readFile(path.join(tempRoot, "_speclite/config.toml"), "utf8")).rejects.toMatchObject({
        code: "ENOENT",
      });
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
      await rm(outsideRoot, { recursive: true, force: true });
    }
  });

  it.each([
    { mirrorRoot: ".claude", selectedTargetIds: undefined },
    { mirrorRoot: ".agents", selectedTargetIds: ["agents"] },
  ])(
    "rejects $mirrorRoot symlink before creating external mirror directories and reports partial progress",
    async ({ mirrorRoot, selectedTargetIds }) => {
      const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-runtime-mirror-symlink-"));
      const outsideRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-runtime-mirror-outside-"));

      try {
        await symlink(outsideRoot, path.join(tempRoot, mirrorRoot));

        const outcome = await runInstallCommand({
          options: { yes: true },
          runtime: {
            ...supportedRuntime,
            cwd: tempRoot,
          },
          ...(selectedTargetIds === undefined
            ? {}
            : {
                configureProject: async () => ({
                  ideTargetIds: selectedTargetIds,
                }),
              }),
        });

        expect(outcome.exitCode).toBe(1);
        expect(outcome.result.issues).toEqual([
          expect.objectContaining({
            issueId: "ide-mirror.target-write-failed",
            category: "ide-mirror",
            severity: "error",
            affectedPath: expect.stringMatching(`^\\${mirrorRoot}/skills/`),
            details: expect.objectContaining({
              reason: "existing-path-segment-is-symlink",
              changedPaths: expect.arrayContaining([
                "_speclite/config.toml",
                "_speclite/config.user.toml",
              ]),
              manualAction: expect.stringContaining("Review the listed changedPaths"),
            }),
          }),
        ]);
        expect(outcome.result.nextActions).toEqual(
          expect.arrayContaining([
            expect.stringContaining("Review completed changed paths before rerun:"),
          ]),
        );
        expect(outcome.result.nextActions.join("\n")).toContain("_speclite/config.toml");
        expect(outcome.result.data.completedSteps).toEqual([
          "source-discovery",
          "module-selection",
          "config-initialization",
          "runtime-structure",
        ]);
        expect(outcome.result.data.pendingSteps).toEqual([
          "ide-mirror-creation",
          "manifest-generation",
          "ready-check",
          "ready-summary",
        ]);
        await expect(readFile(path.join(tempRoot, "_speclite/config.toml"), "utf8")).resolves.toContain(
          "[core]",
        );
        await expect(lstat(path.join(tempRoot, "_speclite-output/planning-artifacts"))).resolves.toBeDefined();
        await expect(lstat(path.join(outsideRoot, "skills"))).rejects.toMatchObject({
          code: "ENOENT",
        });
        const serializedResult = JSON.stringify(outcome.result);
        expect(serializedResult).not.toContain("failedStep");
        expect(serializedResult).not.toContain("readySummary");
      } finally {
        await rm(tempRoot, { recursive: true, force: true });
        await rm(outsideRoot, { recursive: true, force: true });
      }
    },
  );
});

async function readJson(filePath: string): Promise<any> {
  return JSON.parse(await readFile(filePath, "utf8"));
}

function mirrorSkillFileIds(
  filesIndex: { entries: Array<{ path: string }> },
  mirrorRoot: ".claude/skills" | ".agents/skills",
): string[] {
  return filesIndex.entries
    .filter((entry) => entry.path.startsWith(`${mirrorRoot}/`) && entry.path.endsWith("/SKILL.md"))
    .map((entry) => entry.path.slice(`${mirrorRoot}/`.length).split("/")[0]!)
    .sort();
}

async function assertNoRuntimeApplyWrites(projectRoot: string): Promise<void> {
  for (const forbiddenPath of [
    "_speclite",
    "_speclite/.lock",
    "_speclite/_config/manifest.yaml",
    "_speclite/_config/files-index.json",
    "_speclite/config.toml",
    "_speclite/config.user.toml",
    "_speclite-output",
  ]) {
    await expect(lstat(path.join(projectRoot, forbiddenPath))).rejects.toMatchObject({
      code: "ENOENT",
    });
  }
}
