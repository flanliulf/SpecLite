import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { runInstallCommand } from "../src/commands/install.js";
import { InstallCommandResultSchema } from "../src/diagnostics/command-result-schema.js";
import { renderCommandResultJson, renderInstallHumanOutput } from "../src/diagnostics/output.js";
import {
  INSTALL_LIFECYCLE_STEP_IDS,
  projectInstallLifecycleState,
} from "../src/installer/progress-events.js";
import { runReadyCheck } from "../src/installer/ready-check.js";
import type { OfficialModule } from "../src/modules/module-metadata.js";

const supportedRuntime = {
  nodeVersion: "v22.12.0",
  platform: "darwin",
  platformRelease: "23.0.0",
} as const;

describe("install lifecycle progress projection", () => {
  it("uses the Story 1.6 stable lifecycle order for completed and pending steps", () => {
    expect(INSTALL_LIFECYCLE_STEP_IDS).toEqual([
      "source-discovery",
      "module-selection",
      "config-initialization",
      "runtime-structure",
      "ide-mirror-creation",
      "manifest-generation",
      "ready-check",
      "ready-summary",
    ]);

    expect(
      projectInstallLifecycleState({
        completedSteps: ["ready-summary", "source-discovery", "manifest-generation"],
      }),
    ).toEqual({
      completedSteps: ["source-discovery", "manifest-generation", "ready-summary"],
      pendingSteps: [
        "module-selection",
        "config-initialization",
        "runtime-structure",
        "ide-mirror-creation",
        "ready-check",
      ],
    });
  });

  it("keeps install --json on contracted fields without progress event blobs or timing fields", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-ready-json-"));

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
      const parsed = InstallCommandResultSchema.parse(JSON.parse(renderCommandResultJson(outcome.result)));

      expect(parsed.status).toBe("success");
      expect(parsed.data.completedSteps).toEqual(INSTALL_LIFECYCLE_STEP_IDS);
      expect(parsed.data.pendingSteps).toEqual([]);
      expect(parsed.data.ideTargets.map((target) => target.id)).toEqual(["claude", "agents"]);

      const jsonOutput = renderCommandResultJson(parsed);
      expect(jsonOutput).not.toContain("readySummary");
      expect(jsonOutput).not.toContain("failedStep");
      expect(jsonOutput).not.toContain("progressEvents");
      expect(jsonOutput).not.toContain("stepTiming");
      expect(jsonOutput).not.toContain("duration");
      expect(jsonOutput).not.toContain("createdFiles");
      expect(jsonOutput).not.toContain("changedPaths");
      expect(jsonOutput).not.toContain("skippedPaths");
      expect(jsonOutput).not.toMatch(/\u001b\[[0-9;]*m/);
      expect(jsonOutput).not.toContain(tempRoot);
      expect(jsonOutput).not.toMatch(/\d{4}-\d{2}-\d{2}T/);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });
});

describe("ReadyCheck minimal local gate", () => {
  it("passes after manifest, indexes, source descriptor, IDE mirrors and runtime paths are visible", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-ready-check-"));

    try {
      await writeFile(path.join(tempRoot, "README.md"), "project notes\n", "utf8");

      const outcome = await runInstallCommand({
        options: { json: true, yes: true },
        runtime: {
          ...supportedRuntime,
          cwd: tempRoot,
        },
      });

      expect(outcome.exitCode).toBe(0);
      const readyCheck = await runReadyCheck({
        projectRoot: tempRoot,
        sourceDescriptor: outcome.result.data.sourceDescriptor,
        installedModules: outcome.result.data.installedModules,
        ideTargets: outcome.result.data.ideTargets,
        paths: outcome.result.data.paths,
      });

      expect(readyCheck.ok).toBe(true);
      if (!readyCheck.ok) return;
      expect(readyCheck.manifestVersion).toBe("speclite.manifest.v1");
      expect(readyCheck.ideTargets.map((target) => target.id)).toEqual(["claude", "agents"]);
      expect(readyCheck.installedModules).toEqual(["core", "sdlc"]);
      expect(readyCheck.completedSteps).toEqual(["ready-check"]);
      expect(readyCheck.pendingSteps).toEqual(["ready-summary"]);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("fails locally without rendering a ready summary when required projections are missing", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-ready-missing-"));

    try {
      const readyCheck = await runReadyCheck({
        projectRoot: tempRoot,
        sourceDescriptor: {
          sourceType: "bundled",
          resolvedRoot: "assets/source/speclite",
          integrityEvidence: [],
          trustStatus: "unverified",
        },
        installedModules: ["core"],
        ideTargets: [{ id: "claude", status: "configured", targetPath: ".claude/skills", skillCount: 1 }],
        paths: {
          projectRoot: ".",
          specliteRoot: "_speclite",
          artifactRoot: "_speclite-output",
          manifestPath: "_speclite/_config/manifest.yaml",
        },
      });

      expect(readyCheck.ok).toBe(false);
      if (readyCheck.ok) return;
      expect(readyCheck.issue).toMatchObject({
        issueId: "manifest-schema.unreadable",
        category: "manifest-schema",
        severity: "error",
      });
      expect(readyCheck.completedSteps).toEqual([]);
      expect(readyCheck.pendingSteps).toEqual(["ready-check", "ready-summary"]);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("reports invalid help activation targets with reserved menu-target diagnostics", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-ready-menu-target-"));

    try {
      await mkdir(path.join(tempRoot, "_speclite/_config"), { recursive: true });
      await writeFile(
        path.join(tempRoot, "_speclite/_config/manifest.yaml"),
        [
          'schemaVersion: "speclite.manifest.v1"',
          "sourceDescriptor:",
          '  sourceType: "bundled"',
          '  resolvedRoot: "assets/source/speclite"',
          "  integrityEvidence: []",
          '  trustStatus: "trusted"',
          "installedModules:",
          '  - "sdlc"',
          "targetIds:",
          '  - "claude"',
          "paths:",
          '  projectRoot: "."',
          '  specliteRoot: "_speclite"',
          '  artifactRoot: "_speclite-output"',
          '  manifestPath: "_speclite/_config/manifest.yaml"',
          "",
        ].join("\n"),
        "utf8",
      );
      await writeReadyCheckIndex(tempRoot, "skill-index.json", {
        schemaVersion: "speclite.skill-index.v1",
        entries: [
          {
            schemaVersion: "speclite.skill-index.v1",
            canonicalSkillId: "speclite-dev-story",
            moduleId: "sdlc",
            sourcePackagePath: "assets/source/speclite/sdlc-skills/4-implementation/speclite-dev-story",
            canonicalPackageHash: "sha256:dev",
            installedTargets: ["claude"],
            phaseIds: ["4-implementation"],
          },
        ],
      });
      await writeReadyCheckIndex(tempRoot, "help-index.json", {
        schemaVersion: "speclite.help-index.v1",
        entries: [
          {
            schemaVersion: "speclite.help-index.v1",
            phaseId: "4-implementation",
            entryLabel: "Dev Story",
            canonicalSkillId: "speclite-dev-story",
            activationTarget: "DS",
            targetIds: ["claude"],
          },
        ],
      });
      await writeReadyCheckIndex(tempRoot, "files-index.json", {
        schemaVersion: "speclite.files-index.v1",
        entries: [],
      });
      await writeReadyCheckIndex(tempRoot, "phase-coverage.json", {
        schemaVersion: "speclite.phase-coverage.v1",
        rows: [
          {
            schemaVersion: "speclite.phase-coverage.v1",
            phaseId: "4-implementation",
            phaseLabel: "Implementation",
            moduleId: "sdlc",
            canonicalSkillId: "speclite-dev-story",
            ideTargets: [
              {
                targetId: "claude",
                entryPath: ".claude/skills/speclite-dev-story",
                activationTarget: ".claude/skills/speclite-dev-story/SKILL.md",
                status: "mapped",
              },
            ],
          },
        ],
      });

      const readyCheck = await runReadyCheck({
        projectRoot: tempRoot,
        sourceDescriptor: {
          sourceType: "bundled",
          resolvedRoot: "assets/source/speclite",
          integrityEvidence: [],
          trustStatus: "trusted",
        },
        installedModules: ["sdlc"],
        ideTargets: [{ id: "claude", status: "configured", targetPath: ".claude/skills", skillCount: 1 }],
        paths: {
          projectRoot: ".",
          specliteRoot: "_speclite",
          artifactRoot: "_speclite-output",
          manifestPath: "_speclite/_config/manifest.yaml",
        },
      });

      expect(readyCheck.ok).toBe(false);
      if (readyCheck.ok) return;
      expect(readyCheck.issue).toMatchObject({
        issueId: "menu-target.missing-target",
        category: "menu-target",
        affectedPath: "_speclite/_config/help-index.json",
      });
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("fails when skill-index omits a selected module package root", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-ready-missing-package-root-"));

    try {
      await mkdir(path.join(tempRoot, "_speclite/_config"), { recursive: true });
      await mkdir(path.join(tempRoot, "_speclite-output"), { recursive: true });
      await mkdir(path.join(tempRoot, ".claude/skills/speclite-dev-story"), { recursive: true });
      await writeFile(path.join(tempRoot, ".claude/skills/speclite-dev-story/SKILL.md"), "# Dev\n", "utf8");
      await writeFile(
        path.join(tempRoot, "_speclite/_config/manifest.yaml"),
        [
          'schemaVersion: "speclite.manifest.v1"',
          "sourceDescriptor:",
          '  sourceType: "bundled"',
          '  resolvedRoot: "assets/source/speclite"',
          "  integrityEvidence: []",
          '  trustStatus: "trusted"',
          "installedModules:",
          '  - "sdlc"',
          "targetIds:",
          '  - "claude"',
          "paths:",
          '  projectRoot: "."',
          '  specliteRoot: "_speclite"',
          '  artifactRoot: "_speclite-output"',
          '  manifestPath: "_speclite/_config/manifest.yaml"',
          "",
        ].join("\n"),
        "utf8",
      );
      await writeReadyCheckIndex(tempRoot, "skill-index.json", {
        schemaVersion: "speclite.skill-index.v1",
        entries: [
          {
            schemaVersion: "speclite.skill-index.v1",
            canonicalSkillId: "speclite-dev-story",
            moduleId: "sdlc",
            sourcePackagePath: "assets/source/speclite/sdlc-skills/4-implementation/speclite-dev-story",
            canonicalPackageHash: "sha256:dev",
            installedTargets: ["claude"],
            phaseIds: ["4-implementation"],
          },
        ],
      });
      await writeReadyCheckIndex(tempRoot, "help-index.json", {
        schemaVersion: "speclite.help-index.v1",
        entries: [
          {
            schemaVersion: "speclite.help-index.v1",
            phaseId: "4-implementation",
            entryLabel: "Dev Story",
            canonicalSkillId: "speclite-dev-story",
            activationTarget: ".claude/skills/speclite-dev-story/SKILL.md",
            targetIds: ["claude"],
          },
        ],
      });
      await writeReadyCheckIndex(tempRoot, "files-index.json", {
        schemaVersion: "speclite.files-index.v1",
        entries: [],
      });
      await writeReadyCheckIndex(tempRoot, "phase-coverage.json", {
        schemaVersion: "speclite.phase-coverage.v1",
        rows: [
          {
            schemaVersion: "speclite.phase-coverage.v1",
            phaseId: "4-implementation",
            phaseLabel: "Implementation",
            moduleId: "sdlc",
            canonicalSkillId: "speclite-dev-story",
            ideTargets: [
              {
                targetId: "claude",
                entryPath: ".claude/skills/speclite-dev-story",
                activationTarget: ".claude/skills/speclite-dev-story/SKILL.md",
                status: "mapped",
              },
            ],
          },
        ],
      });

      const readyCheck = await runReadyCheck({
        projectRoot: tempRoot,
        sourceDescriptor: {
          sourceType: "bundled",
          resolvedRoot: "assets/source/speclite",
          integrityEvidence: [],
          trustStatus: "trusted",
        },
        installedModules: ["sdlc"],
        selectedModules: [
          createReadyCheckModule({
            code: "sdlc",
            packageRoots: [
              "4-implementation/speclite-dev-story",
              "4-implementation/speclite-quick-dev",
            ],
          }),
        ],
        ideTargets: [{ id: "claude", status: "configured", targetPath: ".claude/skills", skillCount: 1 }],
        paths: {
          projectRoot: ".",
          specliteRoot: "_speclite",
          artifactRoot: "_speclite-output",
          manifestPath: "_speclite/_config/manifest.yaml",
        },
      });

      expect(readyCheck.ok).toBe(false);
      if (readyCheck.ok) return;
      expect(readyCheck.issue).toMatchObject({
        issueId: "ide-mirror.missing-entry",
        category: "ide-mirror",
        details: {
          missingModuleId: "sdlc",
          missingCanonicalSkillId: "speclite-quick-dev",
        },
      });
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("fails when help and phase targets point at another canonical skill directory", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-ready-cross-skill-target-"));

    try {
      await mkdir(path.join(tempRoot, "_speclite/_config"), { recursive: true });
      await mkdir(path.join(tempRoot, "_speclite-output"), { recursive: true });
      await mkdir(path.join(tempRoot, ".claude/skills/speclite-dev-story"), { recursive: true });
      await mkdir(path.join(tempRoot, ".claude/skills/other-skill"), { recursive: true });
      await writeFile(path.join(tempRoot, ".claude/skills/speclite-dev-story/SKILL.md"), "# Dev\n", "utf8");
      await writeFile(path.join(tempRoot, ".claude/skills/other-skill/SKILL.md"), "# Other\n", "utf8");
      await writeFile(
        path.join(tempRoot, "_speclite/_config/manifest.yaml"),
        [
          'schemaVersion: "speclite.manifest.v1"',
          "sourceDescriptor:",
          '  sourceType: "bundled"',
          '  resolvedRoot: "assets/source/speclite"',
          "  integrityEvidence: []",
          '  trustStatus: "trusted"',
          "installedModules:",
          '  - "sdlc"',
          "targetIds:",
          '  - "claude"',
          "paths:",
          '  projectRoot: "."',
          '  specliteRoot: "_speclite"',
          '  artifactRoot: "_speclite-output"',
          '  manifestPath: "_speclite/_config/manifest.yaml"',
          "",
        ].join("\n"),
        "utf8",
      );
      await writeReadyCheckIndex(tempRoot, "skill-index.json", {
        schemaVersion: "speclite.skill-index.v1",
        entries: [
          {
            schemaVersion: "speclite.skill-index.v1",
            canonicalSkillId: "speclite-dev-story",
            moduleId: "sdlc",
            sourcePackagePath: "assets/source/speclite/sdlc-skills/4-implementation/speclite-dev-story",
            canonicalPackageHash: "sha256:dev",
            installedTargets: ["claude"],
            phaseIds: ["4-implementation"],
          },
        ],
      });
      await writeReadyCheckIndex(tempRoot, "help-index.json", {
        schemaVersion: "speclite.help-index.v1",
        entries: [
          {
            schemaVersion: "speclite.help-index.v1",
            phaseId: "4-implementation",
            entryLabel: "Dev Story",
            canonicalSkillId: "speclite-dev-story",
            activationTarget: ".claude/skills/other-skill/SKILL.md",
            targetIds: ["claude"],
          },
        ],
      });
      await writeReadyCheckIndex(tempRoot, "files-index.json", {
        schemaVersion: "speclite.files-index.v1",
        entries: [],
      });
      await writeReadyCheckIndex(tempRoot, "phase-coverage.json", {
        schemaVersion: "speclite.phase-coverage.v1",
        rows: [
          {
            schemaVersion: "speclite.phase-coverage.v1",
            phaseId: "4-implementation",
            phaseLabel: "Implementation",
            moduleId: "sdlc",
            canonicalSkillId: "speclite-dev-story",
            ideTargets: [
              {
                targetId: "claude",
                entryPath: ".claude/skills/other-skill",
                activationTarget: ".claude/skills/other-skill/SKILL.md",
                status: "mapped",
              },
            ],
          },
        ],
      });

      const readyCheck = await runReadyCheck({
        projectRoot: tempRoot,
        sourceDescriptor: {
          sourceType: "bundled",
          resolvedRoot: "assets/source/speclite",
          integrityEvidence: [],
          trustStatus: "trusted",
        },
        installedModules: ["sdlc"],
        ideTargets: [{ id: "claude", status: "configured", targetPath: ".claude/skills", skillCount: 2 }],
        paths: {
          projectRoot: ".",
          specliteRoot: "_speclite",
          artifactRoot: "_speclite-output",
          manifestPath: "_speclite/_config/manifest.yaml",
        },
      });

      expect(readyCheck.ok).toBe(false);
      if (readyCheck.ok) return;
      expect(readyCheck.issue).toMatchObject({
        issueId: "menu-target.missing-target",
        category: "menu-target",
        affectedPath: "_speclite/_config/help-index.json",
        details: expect.objectContaining({
          activationSkillDirectory: "other-skill",
          reason: "skill-id-mismatch",
        }),
      });
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("does not depend on full validate, hash scan, remote source access, update check or repair planning", async () => {
    const source = await readFile(path.join(process.cwd(), "src/installer/ready-check.ts"), "utf8");

    expect(source).not.toContain("hashPackageDirectory");
    expect(source).not.toContain("discoverBundledSourceDescriptor");
    expect(source).not.toContain("validateCommand");
    expect(source).not.toContain("remote");
    expect(source).not.toContain("updateCheck");
    expect(source).not.toContain("repairPlan");
  });
});

async function writeReadyCheckIndex(tempRoot: string, fileName: string, data: unknown): Promise<void> {
  await writeFile(
    path.join(tempRoot, "_speclite/_config", fileName),
    `${JSON.stringify(data, null, 2)}\n`,
    "utf8",
  );
}

function createReadyCheckModule(input: {
  code: string;
  packageRoots: string[];
}): OfficialModule {
  return {
    code: input.code,
    name: input.code,
    description: input.code,
    version: "0.0.0",
    sourceDirectory: `${input.code}-skills`,
    defaultSelected: true,
    required: input.code === "core",
    requiredDependencies: [],
    packageRoots: input.packageRoots,
    capabilitySummary: [],
    helpEntries: [],
    directories: [],
    configPrompts: [],
  };
}

describe("install ready summary rendering", () => {
  it("renders accessible ready summary after successful install and no ANSI in NO_COLOR/CI contexts", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-ready-human-"));
    const previousNoColor = process.env.NO_COLOR;
    const previousCi = process.env.CI;

    try {
      process.env.NO_COLOR = "1";
      process.env.CI = "true";
      await writeFile(path.join(tempRoot, "README.md"), "project notes\n", "utf8");

      const outcome = await runInstallCommand({
        options: { yes: true },
        runtime: {
          ...supportedRuntime,
          cwd: tempRoot,
          targetProject: "fresh-install-empty-project",
        },
      });
      const output = renderInstallHumanOutput(outcome.result);

      expect(outcome.exitCode).toBe(0);
      expect(output).toContain("SpecLite ready summary");
      expect(output).toContain("Summary");
      expect(output).toContain("Completed steps");
      expect(output).toContain("Installed modules");
      expect(output).toContain("IDE targets");
      expect(output).toContain("Key paths");
      expect(output).toContain("Next actions");
      expect(output).toContain("metadata/control hub");
      expect(output).toContain("IDE execution plane");
      expect(output).toContain("artifact repository");
      expect(output).toContain("installed-state projection");
      expect(output).toContain("ready-check");
      expect(output).toContain("ready-summary");
      expect(output).toContain("claude");
      expect(output).toContain("agents");
      expect(output).toContain("speclite status");
      expect(output).toContain("speclite validate");
      expect(output).not.toMatch(/\u001b\[[0-9;]*m/);
      expect(output).not.toContain(tempRoot);
    } finally {
      if (previousNoColor === undefined) {
        delete process.env.NO_COLOR;
      } else {
        process.env.NO_COLOR = previousNoColor;
      }
      if (previousCi === undefined) {
        delete process.env.CI;
      } else {
        process.env.CI = previousCi;
      }
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("does not render ready summary for required-step failure", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-ready-failure-"));

    try {
      await writeFile(path.join(tempRoot, "README.md"), "project notes\n", "utf8");

      const outcome = await runInstallCommand({
        options: { yes: true },
        runtime: {
          ...supportedRuntime,
          cwd: tempRoot,
        },
        configureProject: async () => ({
          values: {
            output_folder: "../outside",
          },
        }),
      });
      const output = renderInstallHumanOutput(outcome.result);

      expect(outcome.exitCode).toBe(1);
      expect(outcome.result.data.completedSteps).toEqual(["source-discovery", "module-selection"]);
      expect(outcome.result.data.pendingSteps).toEqual([
        "config-initialization",
        "runtime-structure",
        "ide-mirror-creation",
        "manifest-generation",
        "ready-check",
        "ready-summary",
      ]);
      expect(output).not.toContain("SpecLite ready summary");
      expect(output).not.toContain("Ready summary");
      expect(output).toContain("Pending steps");
      expect(output).toContain("ready-check");
      expect(output).toContain("ready-summary");
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });
});
