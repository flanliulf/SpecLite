import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { runInstallCommand } from "../src/commands/install.js";
import { runStatusCommand } from "../src/commands/status.js";
import { runUpdateCommand } from "../src/commands/update.js";
import { runValidateCommand } from "../src/commands/validate.js";
import {
  RepairCommandResultSchema,
  StatusCommandResultSchema,
  UpdateCommandResultSchema,
  ValidateCommandResultSchema,
} from "../src/diagnostics/command-result-schema.js";
import { renderCommandResultJson, renderStatusHumanOutput } from "../src/diagnostics/output.js";
import { hashBytes, hashFile } from "../src/manifest/hash.js";
import type { ArtifactRootProjection } from "../src/manifest/manifest-schema.js";
import { validateArtifactPaths } from "../src/validation/artifact-paths.js";
import { validateArtifactPathContract } from "../src/validation/rules/artifact-path.js";

const supportedRuntime = {
  nodeVersion: "v22.12.0",
  platform: "darwin",
  platformRelease: "23.0.0",
} as const;
const legacyStoryKey = "11-3-existing-install-compatibility-and-diagnostics";
const legacyStoryPath = `_speclite-output/implementation-artifacts/stories/${legacyStoryKey}.md`;

describe("existing install compatibility and diagnostics", () => {
  it("reports existing resolved roots and legacy fallback modes from config instead of manifest fresh defaults", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-existing-status-roots-"));

    try {
      await writeExistingInstallRuntime(tempRoot, {
        configToml: legacyConfigToml(),
        manifestArtifactRoots: freshArtifactRootProjection(),
      });

      const configBefore = await readFile(path.join(tempRoot, "_speclite/config.toml"), "utf8");
      const outcome = await runStatusCommand({
        runtime: {
          cwd: tempRoot,
          targetProject: "legacy-existing",
        },
      });
      const parsed = StatusCommandResultSchema.parse(outcome.result);
      const human = renderStatusHumanOutput(parsed, { locale: "en-US", noColor: true, isTty: false });
      const json = renderCommandResultJson(parsed);

      expect(outcome.exitCode).toBe(0);
      expect(parsed.data.paths.artifactRoots?.map(({ field, resolvedRoot, resolutionMode }) => ({
        field,
        resolvedRoot,
        resolutionMode,
      }))).toEqual([
        {
          field: "brainstorming_artifacts",
          resolvedRoot: "_speclite-output/brainstorming",
          resolutionMode: "legacy-compatible",
        },
        {
          field: "analysis_artifacts",
          resolvedRoot: "_speclite-output/planning-artifacts",
          resolutionMode: "legacy-compatible",
        },
        {
          field: "planning_artifacts",
          resolvedRoot: "_speclite-output/planning-artifacts",
          resolutionMode: "explicit-config",
        },
        {
          field: "solutioning_artifacts",
          resolvedRoot: "_speclite-output/planning-artifacts",
          resolutionMode: "legacy-compatible",
        },
        {
          field: "implementation_artifacts",
          resolvedRoot: "_speclite-output/implementation-artifacts",
          resolutionMode: "explicit-config",
        },
        {
          field: "devops_artifacts",
          resolvedRoot: "_speclite-output/devops-artifacts",
          resolutionMode: "explicit-config",
        },
        {
          field: "project_knowledge",
          resolvedRoot: "docs",
          resolutionMode: "explicit-config",
        },
      ]);
      expect(human).toContain("Filesystem planes");
      expect(human).toContain("implementation: _speclite-output/implementation-artifacts");
      expect(human).toContain("mode=legacy-compatible");
      expect(json).not.toContain(tempRoot);
      await expect(readFile(path.join(tempRoot, "_speclite/config.toml"), "utf8")).resolves.toBe(configBefore);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("fails status when required project config cannot resolve instead of falling back to manifest fresh roots", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-existing-status-config-fail-"));

    try {
      await writeExistingInstallRuntime(tempRoot, {
        configToml: [
          "[core]",
          'project_name = "Broken Existing"',
          'output_folder = "_speclite-output"',
          "",
          "[modules.sdlc",
        ].join("\n"),
        manifestArtifactRoots: freshArtifactRootProjection(),
      });

      const outcome = await runStatusCommand({
        runtime: {
          cwd: tempRoot,
          targetProject: "broken-existing",
        },
      });
      const parsed = StatusCommandResultSchema.parse(outcome.result);
      const human = renderStatusHumanOutput(parsed, { locale: "en-US", noColor: true, isTty: false });
      const json = renderCommandResultJson(parsed);

      expect(outcome.exitCode).toBe(1);
      expect(parsed.status).toBe("failure");
      expect(parsed.data.highLevelHealth).toBe("failed");
      expect(parsed.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            issueId: "manifest-schema.malformed-field",
            severity: "error",
            affectedPath: "_speclite/config.toml",
          }),
        ]),
      );
      expect(parsed.data.paths.artifactRoots).toBeUndefined();
      expect(human).toContain("Outcome: failed");
      expect(human).toContain("manifest-schema.malformed-field");
      expect(human).not.toContain("mode=fresh-default");
      expect(json).not.toContain(tempRoot);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("reports config-artifact-mismatch with configured, resolved and actual consumed paths", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-config-artifact-mismatch-"));

    try {
      await mkdir(path.join(tempRoot, "_speclite-output/4-implementation-artifacts/stories"), {
        recursive: true,
      });
      await mkdir(path.join(tempRoot, "_speclite-output/implementation-artifacts/stories"), {
        recursive: true,
      });
      await writeFile(
        path.join(tempRoot, legacyStoryPath),
        [
          "---",
          "workflowType: dev-story",
          "sourceSkill: speclite-dev-story",
          "generatedAt: 2026-05-27T06:00:00.000Z",
          "---",
          "# Legacy Story",
          "",
        ].join("\n"),
        "utf8",
      );

      const issues = await validateArtifactPathContract({
        projectRoot: tempRoot,
        configuredRoot: "_speclite-output/4-implementation-artifacts",
        defaultOutputPath: "_speclite-output/4-implementation-artifacts/stories",
        actualArtifactPath: legacyStoryPath,
        artifactType: "story",
        metadata: {
          workflowType: "dev-story",
          sourceSkill: "speclite-dev-story",
          generatedAt: "2026-05-27T06:00:00.000Z",
        },
        metadataLocation: "frontmatter",
        artifactRootEvidence: {
          field: "implementation_artifacts",
          configuredRoot: "_speclite-output/4-implementation-artifacts",
          resolvedRoot: "_speclite-output/4-implementation-artifacts",
          resolutionMode: "explicit-config",
        },
      });

      expect(issues).toEqual([
        expect.objectContaining({
          issueId: "artifact-path.config-artifact-mismatch",
          category: "artifact-path",
          severity: "error",
          affectedPath: legacyStoryPath,
          details: {
            field: "implementation_artifacts",
            configuredRoot: "_speclite-output/4-implementation-artifacts",
            resolvedRoot: "_speclite-output/4-implementation-artifacts",
            actualConsumedPath: legacyStoryPath,
            resolutionMode: "explicit-config",
            reason: "config-artifact-mismatch",
          },
        }),
      ]);
      expect(JSON.stringify(issues)).not.toContain(tempRoot);
      expect(JSON.stringify(issues)).not.toContain(os.homedir());
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("reports legacy actual story_location mismatch through artifact path validation plumbing", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-config-artifact-actual-"));

    try {
      await mkdir(path.join(tempRoot, "_speclite-output/4-implementation-artifacts/stories"), {
        recursive: true,
      });
      await mkdir(path.join(tempRoot, "_speclite-output/implementation-artifacts/stories"), {
        recursive: true,
      });
      await writeFile(
        path.join(tempRoot, legacyStoryPath),
        [
          "---",
          "workflowType: dev-story",
          "sourceSkill: speclite-dev-story",
          "generatedAt: 2026-05-27T06:00:00.000Z",
          "---",
          "# Legacy Story",
          "",
        ].join("\n"),
        "utf8",
      );
      await writeProjectFile(tempRoot, "_speclite-output/implementation-artifacts/stories/README.md", workflowArtifactMarkdown("Readme"));
      await writeProjectFile(tempRoot, "_speclite-output/implementation-artifacts/stories/notes.md", workflowArtifactMarkdown("Notes"));
      await writeProjectFile(tempRoot, "_speclite-output/implementation-artifacts/stories/notes.txt", "plain notes\n");
      await writeProjectFile(
        tempRoot,
        `_speclite-output/implementation-artifacts/stories/${legacyStoryKey}.md.metadata.json`,
        `${JSON.stringify({ ignored: true }, null, 2)}\n`,
      );
      await writeProjectFile(
        tempRoot,
        `_speclite-output/implementation-artifacts/stories/nested/${legacyStoryKey}.md`,
        workflowArtifactMarkdown("Nested"),
      );

      const result = await validateArtifactPaths({
        projectRoot: tempRoot,
        configuredRoot: "_speclite-output/4-implementation-artifacts",
        artifactRoots: [
          {
            field: "implementation_artifacts",
            configPath: "modules.sdlc.implementation_artifacts",
            placeholder: "{implementation_artifacts}",
            resolvedRoot: "_speclite-output/4-implementation-artifacts",
            resolutionMode: "explicit-config",
            plane: "implementation",
            ownership: "workflow-owned",
            contractRefs: [
              "_bmad-output/planning-artifacts/specs/09-sdlc-workflow-lifecycle-contract.md#Runtime-Artifact-Roots",
            ],
          },
        ],
        defaultOutputPaths: [
          {
            artifactType: "story",
            defaultOutputPath: "_speclite-output/4-implementation-artifacts/stories",
          },
        ],
        actualOutputPaths: [
          {
            artifactType: "story",
            defaultOutputPath: "_speclite-output/4-implementation-artifacts/stories",
            actualOutputPath: "_speclite-output/implementation-artifacts/stories",
            actualArtifactPaths: [legacyStoryPath],
          },
        ],
      });

      expect(result.issues).toEqual([
        expect.objectContaining({
          issueId: "artifact-path.config-artifact-mismatch",
          category: "artifact-path",
          severity: "error",
          affectedPath: legacyStoryPath,
          details: {
            field: "implementation_artifacts",
            configuredRoot: "_speclite-output/4-implementation-artifacts",
            resolvedRoot: "_speclite-output/4-implementation-artifacts",
            actualConsumedPath: legacyStoryPath,
            resolutionMode: "explicit-config",
            reason: "config-artifact-mismatch",
          },
        }),
      ]);
      expect(result.artifactChecks).toEqual([
        {
          artifactType: "story",
          defaultOutputPath: "_speclite-output/4-implementation-artifacts/stories",
          present: true,
          valid: false,
          artifactPaths: [legacyStoryPath],
          issueIds: ["artifact-path.config-artifact-mismatch"],
        },
      ]);
      expect(result.validatedPaths).toContain("_speclite-output/implementation-artifacts/stories");
      expect(result.validatedPaths).toContain(legacyStoryPath);
      expect(result.validatedPaths).not.toContain("_speclite-output/implementation-artifacts/stories/README.md");
      expect(result.validatedPaths).not.toContain("_speclite-output/implementation-artifacts/stories/notes.md");
      expect(result.validatedPaths).not.toContain("_speclite-output/implementation-artifacts/stories/notes.txt");
      expect(result.validatedPaths).not.toContain(
        `_speclite-output/implementation-artifacts/stories/${legacyStoryKey}.md.metadata.json`,
      );
      expect(result.validatedPaths).not.toContain(
        `_speclite-output/implementation-artifacts/stories/nested/${legacyStoryKey}.md`,
      );
      expect(JSON.stringify(result)).not.toContain(tempRoot);
      expect(JSON.stringify(result)).not.toContain(os.homedir());
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("filters mixed noise from legacy story_location during production validation", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-existing-story-location-noise-"));
    const legacyStoryDirectory = "_speclite-output/implementation-artifacts/stories";

    try {
      const install = await runInstallCommand({
        options: { yes: true },
        runtime: {
          ...supportedRuntime,
          cwd: tempRoot,
          targetProject: "legacy-story-location-noise",
        },
      });
      expect(install.exitCode).toBe(0);

      await writeProjectFile(
        tempRoot,
        "_speclite-output/implementation-artifacts/sprint-status.yaml",
        [
          `story_location: ${legacyStoryDirectory}`,
          "",
          "development_status:",
          `  ${legacyStoryKey}: review`,
          "  epic-11: optional",
          "  epic-11-retrospective: optional",
          "",
        ].join("\n"),
      );
      await writeProjectFile(tempRoot, legacyStoryPath, workflowArtifactMarkdown("Legacy Story"));
      await writeProjectFile(tempRoot, `${legacyStoryDirectory}/README.md`, workflowArtifactMarkdown("Readme"));
      await writeProjectFile(tempRoot, `${legacyStoryDirectory}/notes.md`, workflowArtifactMarkdown("Notes"));
      await writeProjectFile(tempRoot, `${legacyStoryDirectory}/notes.txt`, "plain notes\n");
      await writeProjectFile(
        tempRoot,
        `${legacyStoryDirectory}/${legacyStoryKey}.md.metadata.json`,
        `${JSON.stringify({ ignored: true }, null, 2)}\n`,
      );
      await writeProjectFile(tempRoot, `${legacyStoryDirectory}/.hidden.md`, workflowArtifactMarkdown("Hidden"));
      await writeProjectFile(tempRoot, `${legacyStoryDirectory}/tmp.tmp`, "temporary\n");
      await writeProjectFile(tempRoot, `${legacyStoryDirectory}/nested/${legacyStoryKey}.md`, workflowArtifactMarkdown("Nested"));

      const validation = await runValidateCommand({
        runtime: {
          cwd: tempRoot,
          targetProject: "legacy-story-location-noise",
        },
      });
      const parsed = ValidateCommandResultSchema.parse(validation.result);
      const mismatchActualPaths = parsed.issues
        .filter((issue) => issue.issueId === "artifact-path.config-artifact-mismatch")
        .map((issue) => issue.details.actualConsumedPath)
        .sort();

      expect(validation.exitCode).toBe(1);
      expect(mismatchActualPaths).toEqual([legacyStoryPath]);
      expect(parsed.data.validatedPaths).toContain(legacyStoryDirectory);
      expect(parsed.data.validatedPaths).toContain(legacyStoryPath);
      expect(JSON.stringify(parsed)).not.toContain(tempRoot);

      await writeProjectFile(
        tempRoot,
        "_speclite-output/implementation-artifacts/sprint-status.yaml",
        [
          `story_location: ${legacyStoryDirectory}/README.md`,
          "",
          "development_status:",
          `  ${legacyStoryKey}: review`,
          "",
        ].join("\n"),
      );
      const singleFileValidation = await runValidateCommand({
        runtime: {
          cwd: tempRoot,
          targetProject: "legacy-story-location-single-file",
        },
      });
      const singleFileParsed = ValidateCommandResultSchema.parse(singleFileValidation.result);
      const singleFileMismatchActualPaths = singleFileParsed.issues
        .filter((issue) => issue.issueId === "artifact-path.config-artifact-mismatch")
        .map((issue) => issue.details.actualConsumedPath)
        .sort();

      expect(singleFileMismatchActualPaths).not.toContain(`${legacyStoryDirectory}/README.md`);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("keeps configured workflow-owned artifacts byte-identical during update and repair", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-existing-no-migration-"));
    const artifactPath = "legacy-implementation/stories/story-1.md";
    const artifactContents = "workflow artifact stays here\n";

    try {
      await writeExistingInstallRuntime(tempRoot, {
        configToml: legacyConfigToml({
          implementationArtifacts: "legacy-implementation",
        }),
        filesIndexEntries: [
          {
            schemaVersion: "speclite.files-index.v1",
            path: artifactPath,
            ownership: "installer-owned",
            hash: hashBytes(artifactContents),
            hashAlgorithm: "sha256",
            executable: false,
            artifactKind: "story",
            sourceRef: "canonical/story-1.md",
          },
        ],
      });
      await writeProjectFile(tempRoot, artifactPath, artifactContents);
      await writeProjectFile(tempRoot, "canonical/story-1.md", "new source should not migrate artifact\n");

      const beforeHash = await hashFile(path.join(tempRoot, artifactPath));
      const updateOutcome = await runUpdateCommand({
        options: { yes: true },
        runtime: { cwd: tempRoot, targetProject: "existing-no-migration" },
      });
      const updateParsed = UpdateCommandResultSchema.parse(updateOutcome.result);
      const repairOutcome = await runUpdateCommand({
        options: { repair: true, yes: true },
        runtime: { cwd: tempRoot, targetProject: "existing-no-migration" },
      });
      const repairParsed = RepairCommandResultSchema.parse(repairOutcome.result);

      expect(updateParsed.data.updatePlan.actions).toContainEqual(
        expect.objectContaining({
          affectedPath: artifactPath,
          ownership: "workflow-owned",
          action: "skip",
          reason: "workflow-owned",
        }),
      );
      expect(updateParsed.data.changedPaths).not.toContain(artifactPath);
      expect(updateParsed.data.conflicts).toEqual([]);
      expect(repairParsed.data.repairPlan.actions).toContainEqual(
        expect.objectContaining({
          affectedPath: artifactPath,
          ownership: "workflow-owned",
          action: "skip",
          reason: "workflow-owned",
        }),
      );
      expect(repairParsed.data.changedPaths).not.toContain(artifactPath);
      expect(repairParsed.data.conflicts).toEqual([]);
      await expect(readFile(path.join(tempRoot, artifactPath), "utf8")).resolves.toBe(artifactContents);
      await expect(hashFile(path.join(tempRoot, artifactPath))).resolves.toBe(beforeHash);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("keeps installer-managed files repairable when artifact roots overlap installer namespaces", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-existing-installer-overlap-"));
    const managedPath = "_speclite/_config/managed.json";
    const sourceRef = "canonical/managed.json";
    const installedContents = `${JSON.stringify({ state: "installed" }, null, 2)}\n`;
    const driftedContents = `${JSON.stringify({ state: "drifted" }, null, 2)}\n`;

    try {
      await writeExistingInstallRuntime(tempRoot, {
        configToml: legacyConfigToml({
          implementationArtifacts: "_speclite",
        }),
        filesIndexEntries: [
          {
            schemaVersion: "speclite.files-index.v1",
            path: managedPath,
            ownership: "installer-owned",
            hash: hashBytes(installedContents),
            hashAlgorithm: "sha256",
            executable: false,
            artifactKind: "runtime-config",
            sourceRef,
          },
        ],
      });
      await writeProjectFile(tempRoot, managedPath, driftedContents);
      await writeProjectFile(tempRoot, sourceRef, installedContents);

      const updateOutcome = await runUpdateCommand({
        runtime: { cwd: tempRoot, targetProject: "installer-overlap" },
      });
      const updateParsed = UpdateCommandResultSchema.parse(updateOutcome.result);

      expect(updateParsed.data.updatePlan.actions).not.toContainEqual(
        expect.objectContaining({
          affectedPath: managedPath,
          ownership: "workflow-owned",
          action: "skip",
          reason: "workflow-owned",
        }),
      );
      expect(updateParsed.data.updatePlan.actions).toContainEqual(
        expect.objectContaining({
          affectedPath: managedPath,
          ownership: "installer-owned",
          action: "conflict",
          currentHash: hashBytes(driftedContents),
          expectedHash: hashBytes(installedContents),
        }),
      );
      expect(updateParsed.data.conflicts).toContainEqual(
        expect.objectContaining({
          affectedPath: managedPath,
          ownership: "installer-owned",
          reason: "installer-owned-drift",
        }),
      );

      const repairOutcome = await runUpdateCommand({
        options: { repair: true },
        runtime: { cwd: tempRoot, targetProject: "installer-overlap" },
      });
      const repairParsed = RepairCommandResultSchema.parse(repairOutcome.result);

      expect(repairParsed.data.repairPlan.actions).not.toContainEqual(
        expect.objectContaining({
          affectedPath: managedPath,
          ownership: "workflow-owned",
          action: "skip",
          reason: "workflow-owned",
        }),
      );
      expect(repairParsed.data.repairPlan.actions).toContainEqual({
        affectedPath: managedPath,
        ownership: "installer-owned",
        action: "regenerate",
        currentHash: hashBytes(driftedContents),
        expectedHash: hashBytes(installedContents),
      });
      expect(repairParsed.data.conflicts).toEqual([]);
      await expect(readFile(path.join(tempRoot, managedPath), "utf8")).resolves.toBe(driftedContents);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("keeps legacy story_location and whole/sharded discovery contracts discoverable", async () => {
    const [
      flowGateWorkflow,
      devStoryWorkflow,
      createStoryWorkflow,
      createStoryDiscovery,
    ] = await Promise.all([
      readFile(
        "assets/source/speclite/sdlc-skills/4-implementation/speclite-flow-gate/references/workflow-details.md",
        "utf8",
      ),
      readFile(
        "assets/source/speclite/sdlc-skills/4-implementation/speclite-dev-story/references/workflow-steps.md",
        "utf8",
      ),
      readFile(
        "assets/source/speclite/sdlc-skills/4-implementation/speclite-create-story/references/workflow-details.md",
        "utf8",
      ),
      readFile(
        "assets/source/speclite/sdlc-skills/4-implementation/speclite-create-story/references/discover-inputs.md",
        "utf8",
      ),
    ]);

    expect(flowGateWorkflow).toContain("`story_root` = value of `story_location`");
    expect(flowGateWorkflow).toContain("otherwise `{implementation_artifacts}/stories`");
    expect(devStoryWorkflow).toContain("`story_root` = `story_location`");
    expect(devStoryWorkflow).toContain("otherwise `{implementation_artifacts}/stories`");
    expect(createStoryWorkflow).toContain("`story_root` = `{implementation_artifacts}/stories`");
    expect(createStoryDiscovery).toContain('"whole"');
    expect(createStoryDiscovery).toContain("sharded");
    expect(createStoryWorkflow).not.toContain("11.5");
  });
});

async function writeExistingInstallRuntime(
  projectRoot: string,
  input: {
    configToml: string;
    manifestArtifactRoots?: ArtifactRootProjection[];
    filesIndexEntries?: Array<Record<string, unknown>>;
  },
): Promise<void> {
  await mkdir(path.join(projectRoot, "_speclite/_config"), { recursive: true });
  await mkdir(path.join(projectRoot, ".claude/skills/speclite-dev-story"), { recursive: true });
  await mkdir(path.join(projectRoot, "_speclite-output/brainstorming"), { recursive: true });
  await mkdir(path.join(projectRoot, "_speclite-output/planning-artifacts"), { recursive: true });
  await mkdir(path.join(projectRoot, "_speclite-output/implementation-artifacts"), { recursive: true });
  await mkdir(path.join(projectRoot, "_speclite-output/devops-artifacts"), { recursive: true });
  await mkdir(path.join(projectRoot, "docs"), { recursive: true });
  await writeProjectFile(projectRoot, "_speclite/config.toml", input.configToml);
  await writeProjectFile(projectRoot, ".claude/skills/speclite-dev-story/SKILL.md", "# Dev Story\n");
  await writeProjectFile(
    projectRoot,
    "_speclite/_config/manifest.yaml",
    `${JSON.stringify(
      {
        schemaVersion: "speclite.manifest.v1",
        sourceDescriptor: {
          sourceType: "bundled",
          channel: "stable",
          version: "0.0.0",
          resolvedRoot: "assets/source/speclite",
          integrityEvidence: [
            {
              kind: "version-lock",
              packageName: "speclite",
              version: "0.0.0",
              lockPath: "package-lock.json",
              verified: true,
            },
          ],
          trustStatus: "trusted",
        },
        installedModules: [],
        targetIds: [],
        paths: {
          projectRoot: ".",
          specliteRoot: "_speclite",
          artifactRoot: "_speclite-output",
          manifestPath: "_speclite/_config/manifest.yaml",
          ...(input.manifestArtifactRoots === undefined
            ? {}
            : { artifactRoots: input.manifestArtifactRoots }),
        },
      },
      null,
      2,
    )}\n`,
  );
  await writeProjectFile(
    projectRoot,
    "_speclite/_config/files-index.json",
    `${JSON.stringify(
      {
        schemaVersion: "speclite.files-index.v1",
        entries: input.filesIndexEntries ?? [],
      },
      null,
      2,
    )}\n`,
  );
}

function legacyConfigToml(input: { implementationArtifacts?: string } = {}): string {
  return [
    "[core]",
    'project_name = "Legacy Existing"',
    'output_folder = "_speclite-output"',
    "",
    "[modules.sdlc]",
    'planning_artifacts = "_speclite-output/planning-artifacts"',
    `implementation_artifacts = "${input.implementationArtifacts ?? "_speclite-output/implementation-artifacts"}"`,
    'devops_artifacts = "_speclite-output/devops-artifacts"',
    'project_knowledge = "docs"',
    "",
  ].join("\n");
}

function freshArtifactRootProjection(): ArtifactRootProjection[] {
  return [
    ["brainstorming_artifacts", "core.brainstorming_artifacts", "{brainstorming_artifacts}", "_speclite-output/0-brainstorming-artifacts", "brainstorming"],
    ["analysis_artifacts", "modules.sdlc.analysis_artifacts", "{analysis_artifacts}", "_speclite-output/1-analysis-artifacts", "analysis"],
    ["planning_artifacts", "modules.sdlc.planning_artifacts", "{planning_artifacts}", "_speclite-output/2-planning-artifacts", "planning"],
    ["solutioning_artifacts", "modules.sdlc.solutioning_artifacts", "{solutioning_artifacts}", "_speclite-output/3-solutioning-artifacts", "solutioning"],
    ["implementation_artifacts", "modules.sdlc.implementation_artifacts", "{implementation_artifacts}", "_speclite-output/4-implementation-artifacts", "implementation"],
    ["devops_artifacts", "modules.sdlc.devops_artifacts", "{devops_artifacts}", "_speclite-output/5-devops-artifacts", "devops"],
    ["project_knowledge", "modules.sdlc.project_knowledge", "{project_knowledge}", "_speclite-output/project-knowledge-base", "project-knowledge"],
  ].map(([field, configPath, placeholder, resolvedRoot, plane]) => ({
    field,
    configPath,
    placeholder,
    resolvedRoot,
    resolutionMode: "fresh-default",
    plane,
    ownership: "workflow-owned",
    contractRefs: [
      "_bmad-output/planning-artifacts/specs/09-sdlc-workflow-lifecycle-contract.md#Runtime-Artifact-Roots",
    ],
  } as ArtifactRootProjection));
}

function workflowArtifactMarkdown(title: string): string {
  return [
    "---",
    "workflowType: dev-story",
    "sourceSkill: speclite-dev-story",
    "generatedAt: 2026-05-27T06:00:00.000Z",
    "---",
    `# ${title}`,
    "",
  ].join("\n");
}

async function writeProjectFile(
  projectRoot: string,
  relativePath: string,
  contents: string,
): Promise<void> {
  await mkdir(path.dirname(path.join(projectRoot, relativePath)), { recursive: true });
  await writeFile(path.join(projectRoot, relativePath), contents, "utf8");
}
