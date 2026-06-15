import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createSpecliteProgram } from "../src/bin/speclite.js";
import { runStatusCommand } from "../src/commands/status.js";
import {
  StatusCommandResultSchema,
  type StatusCommandResult,
} from "../src/diagnostics/command-result-schema.js";
import { renderCommandResultJson, renderStatusHumanOutput } from "../src/diagnostics/output.js";
import { aggregateStatusHealth, readInstalledStateSummary } from "../src/status/installed-state.js";

const sourceDescriptor = {
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
} as const;

describe("status command lightweight installed-state summary", () => {
  it("returns success with not-configured health for an uninstalled project", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-status-empty-"));

    try {
      const outcome = await runStatusCommand({
        runtime: {
          cwd: tempRoot,
          targetProject: "empty-project",
        },
      });

      const parsed = StatusCommandResultSchema.parse(outcome.result);

      expect(outcome.exitCode).toBe(0);
      expect(parsed).toMatchObject({
        command: "status",
        status: "success",
        targetProject: "empty-project",
        issues: [],
        nextActions: ["Run speclite install to configure this project."],
        data: {
          manifestPresent: false,
          installedModules: [],
          ideTargets: [],
          highLevelHealth: "not-configured",
          paths: {
            projectRoot: ".",
            specliteRoot: "_speclite",
            artifactRoot: "_speclite-output",
            manifestPath: "_speclite/_config/manifest.yaml",
          },
        },
      });
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("reads installed manifest, indexes, source descriptor projection and IDE targets without validate-only fields", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-status-installed-"));

    try {
      await writeInstalledFixture(tempRoot, {
        targetIds: ["agents", "claude"],
        skillTargets: ["claude", "agents"],
      });

      const outcome = await runStatusCommand({
        runtime: {
          cwd: tempRoot,
          targetProject: "installed-project",
        },
      });
      const parsed = StatusCommandResultSchema.parse(outcome.result);

      expect(outcome.exitCode).toBe(0);
      expect(parsed.status).toBe("success");
      expect(parsed.issues).toEqual([]);
      expect(parsed.data).toMatchObject({
        manifestPresent: true,
        manifestVersion: "speclite.manifest.v1",
        sourceDescriptor,
        installedModules: ["core", "sdlc"],
        highLevelHealth: "configured",
        paths: {
          projectRoot: ".",
          specliteRoot: "_speclite",
          artifactRoot: "_speclite-output",
          manifestPath: "_speclite/_config/manifest.yaml",
        },
      });
      expect(parsed.data.ideTargets).toEqual([
        { id: "claude", status: "configured", targetPath: ".claude/skills", skillCount: 1 },
        { id: "agents", status: "configured", targetPath: ".agents/skills", skillCount: 1 },
      ]);

      const json = renderCommandResultJson(parsed);
      expect(json).not.toContain("issueCounts");
      expect(json).not.toContain("checkedCategories");
      expect(json).not.toContain("checkedTargets");
      expect(json).not.toContain("validatedPaths");
      expect(json).not.toContain(tempRoot);
      expect(json).not.toMatch(/\u001b\[[0-9;]*m/);
      expect(json).not.toMatch(/\d{4}-\d{2}-\d{2}T/);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("does not expose malformed manifest paths in public status output", async () => {
    const malformedPaths = ["/tmp/speclite", "../_speclite", "nested\\_speclite"];

    for (const malformedPath of malformedPaths) {
      const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-status-bad-path-"));

      try {
        await writeInstalledFixture(tempRoot, {
          targetIds: ["claude"],
          skillTargets: ["claude"],
        });
        await writeInstalledManifest(tempRoot, {
          specliteRoot: malformedPath,
          artifactRoot: "_speclite-output",
          manifestPath: "_speclite/_config/manifest.yaml",
        });

        const outcome = await runStatusCommand({ runtime: { cwd: tempRoot } });
        const json = renderCommandResultJson(outcome.result);

        expect(outcome.exitCode).toBe(0);
        expect(outcome.result.data.highLevelHealth).toBe("failed");
        expect(outcome.result.data.paths).toEqual({
          projectRoot: ".",
          specliteRoot: "_speclite",
          artifactRoot: "_speclite-output",
          manifestPath: "_speclite/_config/manifest.yaml",
        });
        expect(json).not.toContain(malformedPath);
        expect(json).not.toContain(tempRoot);
      } finally {
        await rm(tempRoot, { recursive: true, force: true });
      }
    }
  });

  it("keeps status target vocabulary separate from install and phase coverage layers", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-status-partial-target-"));

    try {
      await writeInstalledFixture(tempRoot, {
        targetIds: ["claude", "agents"],
        skillTargets: ["claude"],
      });
      const outcome = await runStatusCommand({ runtime: { cwd: tempRoot } });
      const targetStatuses = outcome.result.data.ideTargets.map((target) => target.status);

      expect(outcome.result.data.highLevelHealth).toBe("partial");
      expect(outcome.result.data.ideTargets).toEqual([
        { id: "claude", status: "configured", targetPath: ".claude/skills", skillCount: 1 },
        {
          id: "agents",
          status: "partial",
          targetPath: ".agents/skills",
          skillCount: 0,
          reason: "skill-index has no installed entries for this target.",
          affectedPath: ".agents/skills",
        },
      ]);
      expect(targetStatuses).not.toContain("mapped");
      expect(targetStatuses).not.toContain("unsupported");
      expect(targetStatuses).not.toContain("planned");
      expect(JSON.stringify(outcome.result.data.ideTargets)).not.toContain("copilot");
      expect(JSON.stringify(outcome.result.data.ideTargets)).not.toContain("cursor");
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("keeps high-level health independent from command status and empty issues", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-status-invalid-source-"));

    try {
      await mkdir(path.join(tempRoot, "_speclite/_config"), { recursive: true });
      await writeFile(
        path.join(tempRoot, "_speclite/_config/manifest.yaml"),
        [
          'schemaVersion: "speclite.manifest.v1"',
          "sourceDescriptor:",
          '  sourceType: "bundled"',
          '  trustStatus: "trusted"',
          "installedModules:",
          '  - "core"',
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

      const outcome = await runStatusCommand({ runtime: { cwd: tempRoot } });

      expect(outcome.exitCode).toBe(0);
      expect(outcome.result.status).toBe("success");
      expect(outcome.result.issues).toEqual([]);
      expect(outcome.result.data.highLevelHealth).toBe("failed");
      expect(outcome.result.data.sourceDescriptor).toBeUndefined();
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("treats corrupted skill-index content as failed installed-state health", async () => {
    const invalidIndexes = [
      "{invalid-json",
      JSON.stringify({ schemaVersion: "speclite.skill-index.v1", entries: [{ canonicalSkillId: "missing-shape" }] }),
    ];

    for (const invalidIndex of invalidIndexes) {
      const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-status-invalid-index-"));

      try {
        await writeInstalledFixture(tempRoot, {
          targetIds: ["claude"],
          skillTargets: ["claude"],
        });
        await writeFile(path.join(tempRoot, "_speclite/_config/skill-index.json"), invalidIndex, "utf8");

        const outcome = await runStatusCommand({ runtime: { cwd: tempRoot } });

        expect(outcome.exitCode).toBe(0);
        expect(outcome.result.data.highLevelHealth).toBe("failed");
        expect(outcome.result.data.ideTargets).toEqual([
          {
            id: "claude",
            status: "failed",
            targetPath: ".claude/skills",
            skillCount: 1,
            reason: "skill-index is present but unreadable or invalid.",
            affectedPath: "_speclite/_config/skill-index.json",
          },
        ]);
      } finally {
        await rm(tempRoot, { recursive: true, force: true });
      }
    }
  });

  it("renders compact human output from the same semantic model", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-status-human-"));

    try {
      await writeInstalledFixture(tempRoot, {
        targetIds: ["claude"],
        skillTargets: ["claude"],
      });
      const outcome = await runStatusCommand({ runtime: { cwd: tempRoot } });
      const output = renderStatusHumanOutput(outcome.result);

      expect(output).toContain("SpecLite status");
      expect(output).toContain("High-level health: configured");
      expect(output).toContain("Source: sourceType=bundled; channel=stable; version=0.0.0");
      expect(output).toContain("trustStatus=trusted");
      expect(output).toContain("evidence=version-lock:verified");
      expect(output).toContain("Manifest: present, version=speclite.manifest.v1");
      expect(output).toContain("- claude: configured, skills=1, path=.claude/skills");
      expect(output).toContain("Key paths");
      expect(output).toContain("Next actions");
      expect(output).not.toMatch(/\u001b\[[0-9;]*m/);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("registers speclite status --json with stable command id and deterministic output", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-status-cli-"));
    const outputs: StatusCommandResult[] = [];

    try {
      await writeInstalledFixture(tempRoot, {
        targetIds: ["claude", "agents"],
        skillTargets: ["claude", "agents"],
      });

      for (let index = 0; index < 3; index += 1) {
        const stdout: string[] = [];
        const exitCodes: number[] = [];
        const program = createSpecliteProgram({
          runtime: {
            cwd: tempRoot,
            targetProject: "cli-status-fixture",
          },
          io: {
            stdout: (text) => stdout.push(text),
            setExitCode: (code) => exitCodes.push(code),
          },
        });

        await program.parseAsync(["node", "speclite", "status", "--json"], { from: "node" });
        expect(exitCodes).toEqual([0]);
        outputs.push(StatusCommandResultSchema.parse(JSON.parse(stdout.join(""))));
      }

      expect(outputs[0]).toEqual(outputs[1]);
      expect(outputs[1]).toEqual(outputs[2]);
      expect(outputs[0]?.command).toBe("status");
      expect(outputs[0]?.data.paths.projectRoot).toBe(".");
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("aggregates high-level health in the contracted first-match order", () => {
    expect(
      aggregateStatusHealth({
        manifestPresent: false,
        manifestReadable: false,
        installedModules: [],
        ideTargets: [],
        requiredPathsPresent: false,
      }),
    ).toBe("not-configured");
    expect(
      aggregateStatusHealth({
        manifestPresent: true,
        manifestReadable: false,
        installedModules: ["core"],
        ideTargets: [],
        requiredPathsPresent: true,
      }),
    ).toBe("failed");
    expect(
      aggregateStatusHealth({
        manifestPresent: true,
        manifestReadable: true,
        installedModules: [],
        ideTargets: [{ id: "claude", status: "configured" }],
        requiredPathsPresent: true,
      }),
    ).toBe("partial");
    expect(
      aggregateStatusHealth({
        manifestPresent: true,
        manifestReadable: true,
        installedModules: ["core"],
        ideTargets: [{ id: "claude", status: "configured" }],
        requiredPathsPresent: true,
      }),
    ).toBe("configured");
  });

  it("exposes lightweight reader decisions without full validation fields", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-status-reader-"));

    try {
      await writeInstalledFixture(tempRoot, {
        targetIds: ["claude"],
        skillTargets: ["claude"],
      });
      const summary = await readInstalledStateSummary({ projectRoot: tempRoot });

      expect(summary.data.highLevelHealth).toBe("configured");
      expect(Object.keys(summary.data)).not.toContain("issueCounts");
      expect(Object.keys(summary.data)).not.toContain("validatedPaths");
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("gives CI consumers a health decision field that is independent from command status and issues", async () => {
    const notConfiguredRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-status-ci-empty-"));
    const partialRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-status-ci-partial-"));
    const failedRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-status-ci-failed-"));
    const configuredRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-status-ci-configured-"));

    try {
      await writeInstalledFixture(partialRoot, {
        targetIds: ["claude", "agents"],
        skillTargets: ["claude"],
      });
      await writeInstalledFixture(failedRoot, {
        targetIds: ["claude"],
        skillTargets: ["claude"],
      });
      await writeInstalledManifest(failedRoot, {
        specliteRoot: "/tmp/speclite-private-root",
        artifactRoot: "_speclite-output",
        manifestPath: "_speclite/_config/manifest.yaml",
      });
      await writeInstalledFixture(configuredRoot, {
        targetIds: ["claude", "agents"],
        skillTargets: ["claude", "agents"],
      });

      const cases = [
        {
          root: notConfiguredRoot,
          expectedHealth: "not-configured",
          expectedCiPass: false,
        },
        {
          root: partialRoot,
          expectedHealth: "partial",
          expectedCiPass: false,
        },
        {
          root: failedRoot,
          expectedHealth: "failed",
          expectedCiPass: false,
        },
        {
          root: configuredRoot,
          expectedHealth: "configured",
          expectedCiPass: true,
        },
      ] as const;

      for (const testCase of cases) {
        const outcome = await runStatusCommand({ runtime: { cwd: testCase.root } });
        const parsed = StatusCommandResultSchema.parse(outcome.result);
        const ciPass =
          parsed.status === "success" &&
          parsed.data.highLevelHealth === "configured";

        expect(outcome.exitCode).toBe(0);
        expect(parsed.status).toBe("success");
        expect(parsed.issues).toEqual([]);
        expect(parsed.data.highLevelHealth).toBe(testCase.expectedHealth);
        expect(ciPass).toBe(testCase.expectedCiPass);
      }
    } finally {
      await rm(notConfiguredRoot, { recursive: true, force: true });
      await rm(partialRoot, { recursive: true, force: true });
      await rm(failedRoot, { recursive: true, force: true });
      await rm(configuredRoot, { recursive: true, force: true });
    }
  });
});

async function writeInstalledFixture(
  projectRoot: string,
  input: {
    targetIds: Array<"claude" | "agents">;
    skillTargets: Array<"claude" | "agents">;
  },
): Promise<void> {
  await mkdir(path.join(projectRoot, "_speclite/_config"), { recursive: true });
  await mkdir(path.join(projectRoot, "_speclite-output"), { recursive: true });

  for (const targetId of input.skillTargets) {
    const targetRoot = targetId === "claude" ? ".claude/skills" : ".agents/skills";
    await mkdir(path.join(projectRoot, targetRoot, "speclite-dev-story"), { recursive: true });
    await writeFile(
      path.join(projectRoot, targetRoot, "speclite-dev-story", "SKILL.md"),
      "# Dev Story\n",
      "utf8",
    );
  }

  await writeFile(
    path.join(projectRoot, "_speclite/_config/manifest.yaml"),
    createInstalledManifest({
      targetIds: input.targetIds,
      specliteRoot: "_speclite",
      artifactRoot: "_speclite-output",
      manifestPath: "_speclite/_config/manifest.yaml",
    }),
    "utf8",
  );
  await writeFile(
    path.join(projectRoot, "_speclite/_config/skill-index.json"),
    `${JSON.stringify(
      {
        schemaVersion: "speclite.skill-index.v1",
        entries: [
          {
            schemaVersion: "speclite.skill-index.v1",
            canonicalSkillId: "speclite-dev-story",
            moduleId: "sdlc",
            sourcePackagePath:
              "assets/source/speclite/sdlc-skills/4-implementation/speclite-dev-story",
            canonicalPackageHash: "sha256:dev",
            installedTargets: input.skillTargets,
            phaseIds: ["4-implementation"],
          },
        ],
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
}

async function writeInstalledManifest(
  projectRoot: string,
  input: {
    specliteRoot: string;
    artifactRoot: string;
    manifestPath: string;
  },
): Promise<void> {
  await writeFile(
    path.join(projectRoot, "_speclite/_config/manifest.yaml"),
    createInstalledManifest({
      targetIds: ["claude"],
      ...input,
    }),
    "utf8",
  );
}

function createInstalledManifest(input: {
  targetIds: Array<"claude" | "agents">;
  specliteRoot: string;
  artifactRoot: string;
  manifestPath: string;
}): string {
  return [
    'schemaVersion: "speclite.manifest.v1"',
    "sourceDescriptor:",
    '  sourceType: "bundled"',
    '  channel: "stable"',
    '  version: "0.0.0"',
    '  resolvedRoot: "assets/source/speclite"',
    "  integrityEvidence:",
    '    - kind: "version-lock"',
    '      packageName: "speclite"',
    '      version: "0.0.0"',
    '      lockPath: "package-lock.json"',
    "      verified: true",
    '  trustStatus: "trusted"',
    "installedModules:",
    '  - "core"',
    '  - "sdlc"',
    "targetIds:",
    ...input.targetIds.map((targetId) => `  - "${targetId}"`),
    "paths:",
    '  projectRoot: "."',
    `  specliteRoot: ${JSON.stringify(input.specliteRoot)}`,
    `  artifactRoot: ${JSON.stringify(input.artifactRoot)}`,
    `  manifestPath: ${JSON.stringify(input.manifestPath)}`,
    "",
  ].join("\n");
}
