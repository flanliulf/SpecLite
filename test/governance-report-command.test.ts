import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { describe, expect, it } from "vitest";
import { createSpecliteProgram } from "../src/bin/speclite.js";
import {
  GovernanceReportCommandResultSchema,
  type GovernanceReportCommandResult,
} from "../src/diagnostics/command-result-schema.js";
import { renderGovernanceReportHumanOutput } from "../src/diagnostics/output.js";
import { hashFile, hashPackageDirectory } from "../src/manifest/hash.js";

describe("governance report command", () => {
  it("emits schema-first coverage metrics from manifest, phase coverage and validate evidence", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-governance-ok-"));

    try {
      await writeGovernanceFixture(tempRoot);

      const result = await runCli(["governance-report", tempRoot, "--json"]);
      const parsed = GovernanceReportCommandResultSchema.parse(JSON.parse(result.stdout));
      const human = renderGovernanceReportHumanOutput(parsed);

      expect(result.exitCodes).toEqual([0]);
      expect(parsed.command).toBe("governance-report");
      expect(parsed.status).toBe("success");
      expect(parsed.data.metrics).toEqual({
        phaseEntryCoverage: { covered: 2, total: 2, rate: 1 },
        artifactPresenceRate: { covered: 1, total: 1, rate: 1 },
        validatePassRate: { covered: 8, total: 8, rate: 1 },
        openGapCount: 0,
      });
      expect(parsed.data.phaseGaps).toEqual([]);
      expect(parsed.data.artifactChecks).toEqual([
        expect.objectContaining({
          artifactType: "governance-report",
          defaultOutputPath: "_speclite-output/reports",
          present: true,
          valid: true,
          issueIds: [],
        }),
      ]);
      expect(parsed.data.scope).toEqual({
        manifestPath: "_speclite/_config/manifest.yaml",
        phaseCoveragePath: "_speclite/_config/phase-coverage.json",
        artifactRoot: "_speclite-output",
      });
      expect(JSON.stringify(parsed)).not.toContain(tempRoot);
      expect(human).toContain("Summary");
      expect(human).toContain("Scope");
      expect(human).toContain("Metrics");
      expect(human).toContain("Gaps");
      expect(human).toContain("Issues");
      expect(human).toContain("Next Actions");
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("reports phase entry gaps, artifact metadata issues and redacted machine-readable output", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-governance-gaps-"));

    try {
      await writeGovernanceFixture(tempRoot, {
        phaseTargets: [
          {
            targetId: "claude",
            entryPath: ".claude/skills/speclite-dev-story",
            activationTarget: ".claude/skills/speclite-dev-story/SKILL.md",
            status: "unsupported",
          },
        ],
        artifactFrontmatter: [
          "---",
          "workflowType: ''",
          "sourceSkill: Display Name",
          "generatedAt: not-a-date",
          "---",
          "# Governance Report",
          "",
        ].join("\n"),
      });

      const result = await runCli(["governance-report", tempRoot, "--json"]);
      const parsed = GovernanceReportCommandResultSchema.parse(JSON.parse(result.stdout));

      expect(result.exitCodes).toEqual([1]);
      expect(parsed.status).toBe("failure");
      expect(parsed.data.metrics.phaseEntryCoverage).toEqual({ covered: 0, total: 2, rate: 0 });
      expect(parsed.data.metrics.artifactPresenceRate).toEqual({ covered: 0, total: 1, rate: 0 });
      expect(parsed.data.metrics.openGapCount).toBe(3);
      expect(parsed.data.phaseGaps).toEqual([
        expect.objectContaining({
          phaseId: "4-implementation",
          phaseLabel: "Implementation",
          moduleId: "sdlc",
          canonicalSkillId: "speclite-dev-story",
          targetId: "claude",
          missingReason: "unsupported-target",
        }),
        expect.objectContaining({
          phaseId: "4-implementation",
          phaseLabel: "Implementation",
          moduleId: "sdlc",
          canonicalSkillId: "speclite-dev-story",
          targetId: "agents",
          missingReason: "missing-target-entry",
        }),
      ]);
      expect(parsed.issues.map((issue) => issue.issueId)).toEqual([
        "menu-target.missing-target",
        "menu-target.no-mapped-target",
        "artifact-path.invalid-required-metadata",
        "menu-target.phase-entry-gap",
        "menu-target.phase-entry-gap",
      ]);
      expect(JSON.stringify(parsed)).not.toContain(tempRoot);
      expect(JSON.stringify(parsed)).not.toContain(os.homedir());
      expect(JSON.stringify(parsed)).not.toContain("not-a-date");
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("maps malformed artifact frontmatter to redaction-safe JSON command result", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-governance-malformed-"));

    try {
      await writeGovernanceFixture(tempRoot, {
        artifactFrontmatter: [
          "---",
          "workflowType: [unterminated",
          "---",
          "# Governance Report",
          "",
        ].join("\n"),
      });

      const result = await runCli(["governance-report", tempRoot, "--json"]);
      const parsed = GovernanceReportCommandResultSchema.parse(JSON.parse(result.stdout));
      const serializedOutput = `${result.stdout}\n${result.stderr}`;

      expect(result.exitCodes).toEqual([1]);
      expect(parsed.command).toBe("governance-report");
      expect(parsed.status).toBe("failure");
      expect(parsed.issues).toEqual([
        expect.objectContaining({
          issueId: "artifact-path.invalid-required-metadata",
          category: "artifact-path",
          affectedPath: "artifact:metadata",
          details: expect.objectContaining({
            artifactType: "governance-report",
            metadataKeys: ["frontmatter"],
            metadataLocation: "frontmatter",
            reason: "malformed-frontmatter",
          }),
        }),
      ]);
      expect(parsed.data.artifactChecks).toEqual([
        expect.objectContaining({
          artifactType: "governance-report",
          defaultOutputPath: "_speclite-output/reports",
          present: true,
          valid: false,
          issueIds: ["artifact-path.invalid-required-metadata"],
        }),
      ]);
      expect(serializedOutput).not.toContain(tempRoot);
      expect(serializedOutput).not.toContain(os.homedir());
      expect(serializedOutput).not.toContain(process.cwd());
      expect(serializedOutput).not.toContain("YAMLParseError");
      expect(serializedOutput).not.toContain("node_modules");
      expect(serializedOutput).not.toContain("unterminated");
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });
});

async function runCli(args: string[]): Promise<{
  stdout: string;
  stderr: string;
  exitCodes: number[];
}> {
  const stdout: string[] = [];
  const stderr: string[] = [];
  const exitCodes: number[] = [];
  const program = createSpecliteProgram({
    io: {
      stdout: (text) => stdout.push(text),
      stderr: (text) => stderr.push(text),
      setExitCode: (code) => exitCodes.push(code),
      prompt: async () => "",
    },
  });

  await program.parseAsync(["node", "speclite", ...args], { from: "node" });

  return {
    stdout: stdout.join(""),
    stderr: stderr.join(""),
    exitCodes,
  };
}

async function writeGovernanceFixture(
  projectRoot: string,
  options: {
    phaseTargets?: GovernanceReportCommandResult["data"]["phaseGaps"][number]["targetId"] extends infer _T
      ? Array<{
          targetId: "claude" | "agents";
          entryPath: string;
          activationTarget: string;
          status: "mapped" | "unsupported" | "failed";
        }>
      : never;
    artifactFrontmatter?: string;
  } = {},
): Promise<void> {
  await mkdir(path.join(projectRoot, "_speclite/_config"), { recursive: true });
  await mkdir(path.join(projectRoot, "_speclite-output/reports"), { recursive: true });
  await mkdir(path.join(projectRoot, ".claude/skills/speclite-dev-story"), { recursive: true });
  await mkdir(path.join(projectRoot, ".agents/skills/speclite-dev-story"), { recursive: true });

  await writeFile(path.join(projectRoot, "_speclite/config.toml"), "# runtime config\n", "utf8");
  await writeFile(path.join(projectRoot, "_speclite/config.user.toml"), "# user runtime config\n", "utf8");
  await writeFile(path.join(projectRoot, ".claude/skills/speclite-dev-story/SKILL.md"), "# Dev Story\n", "utf8");
  await writeFile(path.join(projectRoot, ".agents/skills/speclite-dev-story/SKILL.md"), "# Dev Story\n", "utf8");
  await writeFile(
    path.join(projectRoot, "_speclite-output/reports/governance.md"),
    options.artifactFrontmatter ??
      [
        "---",
        "workflowType: governance-report",
        "sourceSkill: speclite-dev-story",
        "generatedAt: 2026-06-15T00:00:00.000Z",
        "---",
        "# Governance Report",
        "",
      ].join("\n"),
    "utf8",
  );

  await writeFile(
    path.join(projectRoot, "_speclite/_config/manifest.yaml"),
    [
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
      '  - "sdlc"',
      "targetIds:",
      '  - "claude"',
      '  - "agents"',
      "paths:",
      '  projectRoot: "."',
      '  specliteRoot: "_speclite"',
      '  artifactRoot: "_speclite-output"',
      '  manifestPath: "_speclite/_config/manifest.yaml"',
      "",
    ].join("\n"),
    "utf8",
  );

  await writeJson(projectRoot, "_speclite/_config/skill-index.json", {
    schemaVersion: "speclite.skill-index.v1",
    entries: [
      {
        schemaVersion: "speclite.skill-index.v1",
        canonicalSkillId: "speclite-dev-story",
        moduleId: "sdlc",
        sourcePackagePath: "assets/source/speclite/sdlc-skills/4-implementation/speclite-dev-story",
        canonicalPackageHash: await hashPackageDirectory(path.join(projectRoot, ".claude/skills/speclite-dev-story")),
        installedTargets: ["claude", "agents"],
        phaseIds: ["4-implementation"],
      },
    ],
  });
  await writeJson(projectRoot, "_speclite/_config/help-index.json", {
    schemaVersion: "speclite.help-index.v1",
    entries: [
      {
        schemaVersion: "speclite.help-index.v1",
        phaseId: "4-implementation",
        entryLabel: "Dev Story",
        canonicalSkillId: "speclite-dev-story",
        activationTarget: ".claude/skills/speclite-dev-story/SKILL.md",
        targetIds: ["claude", "agents"],
      },
    ],
  });
  await writeJson(projectRoot, "_speclite/_config/phase-coverage.json", {
    schemaVersion: "speclite.phase-coverage.v1",
    rows: [
      {
        schemaVersion: "speclite.phase-coverage.v1",
        phaseId: "4-implementation",
        phaseLabel: "Implementation",
        moduleId: "sdlc",
        canonicalSkillId: "speclite-dev-story",
        ideTargets: options.phaseTargets ?? [
          {
            targetId: "claude",
            entryPath: ".claude/skills/speclite-dev-story",
            activationTarget: ".claude/skills/speclite-dev-story/SKILL.md",
            status: "mapped",
          },
          {
            targetId: "agents",
            entryPath: ".agents/skills/speclite-dev-story",
            activationTarget: ".agents/skills/speclite-dev-story/SKILL.md",
            status: "mapped",
          },
        ],
        artifactContract: {
          artifactType: "governance-report",
          defaultOutputPath: "_speclite-output/reports",
          requiredMetadata: ["workflowType", "sourceSkill", "generatedAt"],
        },
      },
    ],
  });
  await writeJson(projectRoot, "_speclite/_config/files-index.json", {
    schemaVersion: "speclite.files-index.v1",
    entries: [
      await createFilesIndexEntry(projectRoot, "_speclite/config.toml", "runtime-config"),
      await createFilesIndexEntry(projectRoot, "_speclite/config.user.toml", "runtime-config"),
      await createFilesIndexEntry(projectRoot, ".claude/skills/speclite-dev-story/SKILL.md", "skill"),
      await createFilesIndexEntry(projectRoot, ".agents/skills/speclite-dev-story/SKILL.md", "skill"),
    ],
  });
}

async function createFilesIndexEntry(projectRoot: string, relativePath: string, artifactKind: string) {
  return {
    schemaVersion: "speclite.files-index.v1",
    path: relativePath,
    ownership: "installer-owned",
    hash: await hashFile(path.join(projectRoot, relativePath)),
    hashAlgorithm: "sha256",
    executable: false,
    artifactKind,
    sourceRef: `installed-state:${artifactKind}`,
  };
}

async function writeJson(projectRoot: string, relativePath: string, value: unknown): Promise<void> {
  await writeFile(path.join(projectRoot, relativePath), `${JSON.stringify(value, null, 2)}\n`, "utf8");
}
