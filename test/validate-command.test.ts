import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createSpecliteProgram } from "../src/bin/speclite.js";
import { runValidateCommand } from "../src/commands/validate.js";
import { createValidateCommandResult } from "../src/diagnostics/command-result.js";
import {
  ValidateCommandResultSchema,
  ValidationIssueSchema,
  type ValidateCommandResult,
} from "../src/diagnostics/command-result-schema.js";
import { renderCommandResultJson, renderValidateHumanOutput } from "../src/diagnostics/output.js";
import { hashFile, hashPackageDirectory } from "../src/manifest/hash.js";

const sourceDescriptor = {
  sourceType: "bundled",
  channel: "stable",
  version: "0.0.0",
  resolvedRoot: "assets/source/speclite",
  integrityEvidence: [],
  trustStatus: "trusted",
} as const;

describe("validate command manifest/index schema validation", () => {
  it("returns deterministic success data for a valid installed projection", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-validate-valid-"));

    try {
      await writeInstalledProjection(tempRoot);

      const outputs: ValidateCommandResult[] = [];
      for (let index = 0; index < 3; index += 1) {
        const outcome = await runValidateCommand({
          runtime: { cwd: tempRoot, targetProject: "valid-installed" },
        });
        expect(outcome.exitCode).toBe(0);
        outputs.push(ValidateCommandResultSchema.parse(outcome.result));
      }

      expect(outputs[0]).toEqual(outputs[1]);
      expect(outputs[1]).toEqual(outputs[2]);
      expect(outputs[0]).toMatchObject({
        command: "validate",
        status: "success",
        targetProject: "valid-installed",
        issues: [],
        data: {
          issueCounts: { info: 0, warning: 0, error: 0, critical: 0 },
          checkedCategories: [
            "manifest-schema",
            "ide-mirror",
            "runtime-path",
            "menu-target",
            "legacy-namespace",
            "artifact-path",
            "file-integrity",
          ],
          checkedTargets: ["claude", "agents"],
          validatedPaths: [
            ".agents/skills",
            ".claude/skills",
            ".claude/skills/speclite-help/SKILL.md",
            "_speclite-output",
            "_speclite/_config/files-index.json",
            "_speclite/_config/help-index.json",
            "_speclite/_config/manifest.yaml",
            "_speclite/_config/phase-coverage.json",
            "_speclite/_config/skill-index.json",
            "_speclite/config.toml",
            "_speclite/config.user.toml",
          ],
        },
      });

      const json = renderCommandResultJson(outputs[0]);
      expect(json).not.toContain(tempRoot);
      expect(json).not.toMatch(/\u001b\[[0-9;]*m/);
      expect(json).not.toMatch(/\d{4}-\d{2}-\d{2}T/);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("reports stale operation lock and stale safe-write temp files as conservative read-only warnings", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-validate-stale-lock-temp-"));

    try {
      await writeInstalledProjection(tempRoot);
      await writeJson(tempRoot, "_speclite/.lock", {
        schemaVersion: "speclite.operation-lock.v1",
        operation: "update",
        pid: 12345,
        createdAt: "2000-01-01T00:00:00.000Z",
        projectRootHash: "sha256:private",
      });
      await writeFile(path.join(tempRoot, "_speclite/.speclite-tmp-leftover"), "partial\n", "utf8");

      const outcome = await runValidateCommand({ runtime: { cwd: tempRoot, targetProject: "stale-lock" } });
      const parsed = ValidateCommandResultSchema.parse(outcome.result);

      expect(outcome.exitCode).toBe(0);
      expect(parsed.status).toBe("warning");
      expect(parsed.data.checkedCategories).toContain("operation-lock");
      expect(parsed.data.checkedCategories).toContain("file-integrity");
      expect(parsed.issues).toEqual([
        expect.objectContaining({
          issueId: "file-integrity.stale-temp-file",
          category: "file-integrity",
          severity: "warning",
          affectedPath: "_speclite/.speclite-tmp-leftover",
          details: expect.objectContaining({
            reason: "stale-temp-file",
          }),
        }),
        expect.objectContaining({
          issueId: "operation-lock.stale-lock",
          category: "operation-lock",
          severity: "warning",
          affectedPath: "_speclite/.lock",
          details: expect.objectContaining({
            reason: "lock-age-exceeded",
          }),
        }),
      ]);
      expect(JSON.stringify(parsed)).not.toContain(tempRoot);
      expect(JSON.stringify(parsed)).not.toContain("12345");
      expect(JSON.stringify(parsed)).not.toContain("2000-01-01T00:00:00.000Z");
      await expect(readFile(path.join(tempRoot, "_speclite/.lock"), "utf8")).resolves.toContain(
        "speclite.operation-lock.v1",
      );
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("recursively reports nested and IDE mirror stale safe-write temp paths", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-validate-nested-temp-"));

    try {
      await writeInstalledProjection(tempRoot);
      await writeFile(path.join(tempRoot, "_speclite/_config/.speclite-tmp-nested"), "partial\n", "utf8");
      await mkdir(path.join(tempRoot, ".claude/skills/speclite-help/.speclite-tmp-blocking"), {
        recursive: true,
      });

      const outcome = await runValidateCommand({ runtime: { cwd: tempRoot, targetProject: "nested-temp" } });
      const parsed = ValidateCommandResultSchema.parse(outcome.result);

      expect(outcome.exitCode).toBe(1);
      expect(parsed.status).toBe("failure");
      expect(parsed.data.checkedCategories).toContain("file-integrity");
      expect(parsed.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            issueId: "file-integrity.stale-temp-file",
            category: "file-integrity",
            severity: "error",
            affectedPath: ".claude/skills/speclite-help/.speclite-tmp-blocking",
            details: expect.objectContaining({
              reason: "stale-temp-file-blocking",
            }),
          }),
          expect.objectContaining({
            issueId: "file-integrity.stale-temp-file",
            category: "file-integrity",
            severity: "warning",
            affectedPath: "_speclite/_config/.speclite-tmp-nested",
            details: expect.objectContaining({
              reason: "stale-temp-file",
            }),
          }),
        ]),
      );
      expect(JSON.stringify(parsed)).not.toContain(tempRoot);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("reports workflow artifact metadata issues from production validate", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-validate-artifact-metadata-"));

    try {
      await writeInstalledProjection(tempRoot);
      await mkdir(path.join(tempRoot, "_speclite-output/reports"), { recursive: true });
      await writeFile(path.join(tempRoot, "_speclite-output/reports/missing.md"), "# Missing metadata\n", "utf8");
      await writeFile(
        path.join(tempRoot, "_speclite-output/reports/invalid.md"),
        [
          "---",
          "workflowType: ''",
          "sourceSkill: Display Name",
          "generatedAt: not-a-date",
          "---",
          "# Invalid metadata",
          "",
        ].join("\n"),
        "utf8",
      );
      await mkdir(path.join(tempRoot, "_speclite-output/reports/missing-directory"), { recursive: true });
      await writeFile(path.join(tempRoot, "_speclite-output/reports/missing-directory/metadata.json"), "{}\n", "utf8");
      await mkdir(path.join(tempRoot, "_speclite-output/reports/invalid-directory"), { recursive: true });
      await writeJson(tempRoot, "_speclite-output/reports/invalid-directory/metadata.json", {
        workflowType: "",
        sourceSkill: "Display Name",
        generatedAt: "not-a-date",
      });
      await writeJson(tempRoot, "_speclite/_config/phase-coverage.json", {
        schemaVersion: "speclite.phase-coverage.v1",
        rows: [
          {
            schemaVersion: "speclite.phase-coverage.v1",
            phaseId: "anytime",
            phaseLabel: "Anytime",
            moduleId: "core",
            canonicalSkillId: "speclite-help",
            ideTargets: [
              {
                targetId: "claude",
                entryPath: ".claude/skills/speclite-help",
                activationTarget: ".claude/skills/speclite-help/SKILL.md",
                status: "mapped",
              },
            ],
            artifactContract: {
              artifactType: "report",
              defaultOutputPath: "_speclite-output/reports",
              requiredMetadata: ["workflowType", "sourceSkill", "generatedAt"],
            },
          },
        ],
      });

      const outcome = await runValidateCommand({ runtime: { cwd: tempRoot } });
      const parsed = ValidateCommandResultSchema.parse(outcome.result);

      expect(outcome.exitCode).toBe(1);
      expect(parsed.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            issueId: "artifact-path.invalid-required-metadata",
            details: expect.objectContaining({
              artifactType: "report",
              metadataKeys: ["generatedAt", "sourceSkill", "workflowType"],
              metadataLocation: "frontmatter",
            }),
          }),
          expect.objectContaining({
            issueId: "artifact-path.invalid-required-metadata",
            details: expect.objectContaining({
              artifactType: "report",
              metadataKeys: ["generatedAt", "sourceSkill", "workflowType"],
              metadataLocation: "directory",
            }),
          }),
          expect.objectContaining({
            issueId: "artifact-path.missing-required-metadata",
            details: expect.objectContaining({
              artifactType: "report",
              metadataKeys: ["generatedAt", "sourceSkill", "workflowType"],
              metadataLocation: "frontmatter",
            }),
          }),
          expect.objectContaining({
            issueId: "artifact-path.missing-required-metadata",
            details: expect.objectContaining({
              artifactType: "report",
              metadataKeys: ["generatedAt", "sourceSkill", "workflowType"],
              metadataLocation: "directory",
            }),
          }),
        ]),
      );
      expect(JSON.stringify(parsed)).not.toContain(tempRoot);
      expect(JSON.stringify(parsed)).not.toContain("not-a-date");
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("maps missing, parse failure, missing version, unsupported and migration schemas to stable manifest-schema issues", async () => {
    const cases: Array<{
      name: string;
      mutate: (projectRoot: string) => Promise<void>;
      issueId: string;
      affectedPath: string;
      reason: string;
    }> = [
      {
        name: "missing manifest",
        mutate: async (projectRoot) => {
          await rm(path.join(projectRoot, "_speclite/_config/manifest.yaml"));
        },
        issueId: "manifest-schema.schema-corruption",
        affectedPath: "_speclite/_config/manifest.yaml",
        reason: "missing-required-artifact",
      },
      {
        name: "malformed json",
        mutate: async (projectRoot) => {
          await writeFile(path.join(projectRoot, "_speclite/_config/skill-index.json"), "{bad", "utf8");
        },
        issueId: "manifest-schema.schema-corruption",
        affectedPath: "_speclite/_config/skill-index.json",
        reason: "parse-failed",
      },
      {
        name: "missing version",
        mutate: async (projectRoot) => {
          await writeJson(projectRoot, "_speclite/_config/help-index.json", { entries: [] });
        },
        issueId: "manifest-schema.missing-version",
        affectedPath: "_speclite/_config/help-index.json",
        reason: "missing-version",
      },
      {
        name: "unsupported version",
        mutate: async (projectRoot) => {
          await writeJson(projectRoot, "_speclite/_config/files-index.json", {
            schemaVersion: "speclite.files-index.v99",
            entries: [],
          });
        },
        issueId: "manifest-schema.unsupported-version",
        affectedPath: "_speclite/_config/files-index.json",
        reason: "unsupported-version",
      },
      {
        name: "migration needed",
        mutate: async (projectRoot) => {
          await writeJson(projectRoot, "_speclite/_config/skill-index.json", {
            schemaVersion: "speclite.skill-index.v0",
            entries: [],
          });
        },
        issueId: "manifest-schema.migration-needed",
        affectedPath: "_speclite/_config/skill-index.json",
        reason: "migration-needed",
      },
    ];

    for (const testCase of cases) {
      const tempRoot = await mkdtemp(path.join(os.tmpdir(), `speclite-validate-${testCase.name.replaceAll(" ", "-")}-`));

      try {
        await writeInstalledProjection(tempRoot);
        await testCase.mutate(tempRoot);

        const outcome = await runValidateCommand({ runtime: { cwd: tempRoot } });
        const parsed = ValidateCommandResultSchema.parse(outcome.result);
        const issue = parsed.issues.find((candidate) => candidate.affectedPath === testCase.affectedPath);

        expect(outcome.exitCode).toBe(1);
        expect(parsed.status).toBe("failure");
        expect(issue).toMatchObject({
          issueId: testCase.issueId,
          category: "manifest-schema",
          severity: "critical",
          affectedPath: testCase.affectedPath,
          details: expect.objectContaining({
            reason: testCase.reason,
          }),
        });
        if (testCase.issueId === "manifest-schema.migration-needed") {
          expect(issue?.details).toMatchObject({
            currentSchemaVersion: "speclite.skill-index.v0",
            supportedSchemaVersion: "speclite.skill-index.v1",
            migrationKind: "manual",
            manualActionRequired: true,
          });
          expect(JSON.stringify(issue?.details)).not.toContain("automated-available");
        }
        expect(JSON.stringify(issue?.details)).not.toContain(tempRoot);
      } finally {
        await rm(tempRoot, { recursive: true, force: true });
      }
    }
  });

  it("rejects malformed fields, alternate identities, branded targets and missing selected module roots", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-validate-domain-"));

    try {
      await writeInstalledProjection(tempRoot);
      await writeJson(tempRoot, "_speclite/_config/skill-index.json", {
        schemaVersion: "speclite.skill-index.v1",
        entries: [
          {
            schemaVersion: "speclite.skill-index.v1",
            canonicalSkillId: "alias-only",
            moduleId: "core",
            sourcePackagePath: "assets/source/speclite/core-skills/speclite-help",
            canonicalPackageHash: "sha256:package",
            installedTargets: ["cursor"],
            phaseIds: ["anytime"],
            ideSkillId: "cursor-speclite-help",
          },
        ],
      });
      await writeJson(tempRoot, "_speclite/_config/help-index.json", {
        schemaVersion: "speclite.help-index.v1",
        entries: [
          {
            schemaVersion: "speclite.help-index.v1",
            phaseId: "anytime",
            entryLabel: "Help",
            canonicalSkillId: "speclite-help",
            activationTarget: "assets/source/speclite/core-skills/speclite-help/SKILL.md",
            targetIds: ["copilot"],
          },
        ],
      });
      await writeJson(tempRoot, "_speclite/_config/files-index.json", {
        schemaVersion: "speclite.files-index.v1",
        entries: [
          {
            schemaVersion: "speclite.files-index.v1",
            path: "/tmp/leak",
            ownership: "installer-owned",
            hash: "sha256:file",
            hashAlgorithm: "md5",
            executable: "yes",
            artifactKind: "skill",
            sourceRef: "assets/source/speclite/core-skills/speclite-help/SKILL.md",
          },
        ],
      });

      const outcome = await runValidateCommand({ runtime: { cwd: tempRoot } });
      const parsed = ValidateCommandResultSchema.parse(outcome.result);

      expect(outcome.exitCode).toBe(1);
      expect(parsed.issues.map((issue) => issue.issueId)).toEqual([
        "manifest-schema.malformed-field",
        "manifest-schema.malformed-field",
        "manifest-schema.malformed-field",
      ]);
      expect(parsed.issues.map((issue) => issue.category)).toEqual([
        "manifest-schema",
        "manifest-schema",
        "manifest-schema",
      ]);
      expect(parsed.issues.map((issue) => issue.affectedPath)).toEqual([
        "_speclite/_config/files-index.json",
        "_speclite/_config/help-index.json",
        "_speclite/_config/skill-index.json",
      ]);
      expect(parsed.issues[2]?.details).toMatchObject({
        reason: "invalid-field",
      });
      expect(JSON.stringify(parsed)).not.toContain("file-integrity");
      expect(JSON.stringify(parsed)).not.toContain("ide-mirror");
      expect(JSON.stringify(parsed)).not.toContain("runtime-path");
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("reports selected module package root incompleteness as stable manifest-schema diagnostics", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-validate-incomplete-roots-"));

    try {
      await writeInstalledProjection(tempRoot);
      await writeJson(tempRoot, "_speclite/_config/skill-index.json", {
        schemaVersion: "speclite.skill-index.v1",
        entries: [
          {
            schemaVersion: "speclite.skill-index.v1",
            canonicalSkillId: "speclite-help",
            moduleId: "core",
            sourcePackagePath: "assets/source/speclite/core-skills/speclite-help",
            canonicalPackageHash: "sha256:package",
            installedTargets: ["claude", "agents"],
            phaseIds: ["anytime"],
          },
        ],
      });

      const outcome = await runValidateCommand({ runtime: { cwd: tempRoot } });
      const parsed = ValidateCommandResultSchema.parse(outcome.result);

      expect(outcome.exitCode).toBe(1);
      expect(parsed.issues).toHaveLength(1);
      expect(parsed.issues[0]).toMatchObject({
        issueId: "manifest-schema.malformed-field",
        category: "manifest-schema",
        affectedPath: "_speclite/_config/skill-index.json",
        details: {
          artifactKind: "skill-index",
          reason: "missing-required-field",
          field: "entries",
          expectedCount: 53,
          actualCount: 1,
        },
      });
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("reports missing selected package roots even when the baseline entry count is preserved", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-validate-missing-root-same-count-"));

    try {
      await writeInstalledProjection(tempRoot);
      const entries = createSkillIndexEntries();
      entries[0] = {
        ...entries[1],
        canonicalPackageHash: "sha256:duplicate-package-root",
      };
      await writeJson(tempRoot, "_speclite/_config/skill-index.json", {
        schemaVersion: "speclite.skill-index.v1",
        entries,
      });

      const outcome = await runValidateCommand({ runtime: { cwd: tempRoot } });
      const parsed = ValidateCommandResultSchema.parse(outcome.result);

      expect(outcome.exitCode).toBe(1);
      expect(parsed.issues).toHaveLength(1);
      expect(parsed.issues[0]).toMatchObject({
        issueId: "manifest-schema.malformed-field",
        category: "manifest-schema",
        affectedPath: "_speclite/_config/skill-index.json",
        details: {
          artifactKind: "skill-index",
          reason: "missing-required-field",
          field: "entries",
          expectedCount: 53,
          actualCount: 53,
          duplicateRoot: "core:assets/source/speclite/core-skills/speclite-brainstorming",
        },
      });
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("reports unexpected selected package roots even when counts and duplicates pass", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-validate-unexpected-root-same-count-"));

    try {
      await writeInstalledProjection(tempRoot);
      const entries = createSkillIndexEntries();
      entries[0] = {
        ...entries[0],
        canonicalSkillId: "speclite-unexpected-core-skill",
        sourcePackagePath: "assets/source/speclite/core-skills/speclite-unexpected-core-skill",
        canonicalPackageHash: "sha256:unexpected-package-root",
      };
      await writeJson(tempRoot, "_speclite/_config/skill-index.json", {
        schemaVersion: "speclite.skill-index.v1",
        entries,
      });

      const outcome = await runValidateCommand({ runtime: { cwd: tempRoot } });
      const parsed = ValidateCommandResultSchema.parse(outcome.result);

      expect(outcome.exitCode).toBe(1);
      expect(parsed.issues).toHaveLength(1);
      expect(parsed.issues[0]).toMatchObject({
        issueId: "manifest-schema.malformed-field",
        category: "manifest-schema",
        affectedPath: "_speclite/_config/skill-index.json",
        details: {
          artifactKind: "skill-index",
          reason: "missing-required-field",
          field: "entries",
          expectedCount: 53,
          actualCount: 53,
          expectedModuleCounts: {
            core: 13,
            sdlc: 40,
          },
          actualModuleCounts: {
            core: 13,
            sdlc: 40,
          },
          missingRoot: "core:assets/source/speclite/core-skills/speclite-advanced-elicitation",
          unexpectedRoot: "core:assets/source/speclite/core-skills/speclite-unexpected-core-skill",
        },
      });
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("registers speclite validate --json and renders human evidence from the shared model", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-validate-cli-"));
    const stdout: string[] = [];
    const exitCodes: number[] = [];

    try {
      await writeInstalledProjection(tempRoot);
      const program = createSpecliteProgram({
        runtime: { cwd: tempRoot, targetProject: "cli-validate-fixture" },
        io: {
          stdout: (text) => stdout.push(text),
          setExitCode: (code) => exitCodes.push(code),
        },
      });

      await program.parseAsync(["node", "speclite", "validate", "--json"], { from: "node" });
      const parsed = ValidateCommandResultSchema.parse(JSON.parse(stdout.join("")));
      const human = renderValidateHumanOutput(parsed);

      expect(exitCodes).toEqual([0]);
      expect(parsed.command).toBe("validate");
      expect(human).toContain("SpecLite validate");
      expect(human).toContain("Output profile: Evidence");
      expect(human).toContain(
        "Checked categories: manifest-schema, ide-mirror, runtime-path, menu-target, legacy-namespace, artifact-path, file-integrity",
      );
      expect(human).toContain("Not checked categories: environment, source-integrity, operation-lock, update");
      expect(human).toContain("No issues found for checked categories.");
      expect(human).toContain("No conflicts detected.");
      expect(human).not.toMatch(/\u001b\[[0-9;]*m/);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("preserves partial category order and reports not checked categories for blockers", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-validate-partial-order-"));

    try {
      await writeInstalledProjection(tempRoot);
      await writeFile(path.join(tempRoot, "_speclite/_config/manifest.yaml"), "bad: [", "utf8");

      const outcome = await runValidateCommand({ runtime: { cwd: tempRoot } });
      const parsed = ValidateCommandResultSchema.parse(outcome.result);
      const human = renderValidateHumanOutput(parsed, {
        columns: 72,
        noColor: true,
        isTty: false,
        ci: true,
        screenReader: true,
      });

      expect(outcome.exitCode).toBe(1);
      expect(parsed.data.checkedCategories).toEqual(["manifest-schema"]);
      expect(parsed.data.checkedCategories).not.toContain("source-integrity");
      expect(human).toContain("Output profile: Evidence (key-value)");
      expect(human).toContain(
        "Not checked categories: environment, source-integrity, ide-mirror, runtime-path, menu-target, legacy-namespace, artifact-path, file-integrity, operation-lock, update",
      );
      expect(human).toContain("Issue fields: severity, category, issueId, affectedPath, impact, suggestedNextStep");
      expect(human).not.toMatch(/\u001b\[[0-9;]*m/);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("uses global deterministic issue sorting with command-level path and component tie-breakers", () => {
    const issues = [
      issue({ severity: "warning", category: "file-integrity", issueId: "file-integrity.hash-mismatch", affectedPath: "b.md" }),
      issue({ severity: "critical", category: "manifest-schema", issueId: "manifest-schema.schema-corruption", affectedPath: "_speclite/_config/skill-index.json" }),
      issue({ severity: "warning", category: "manifest-schema", issueId: "manifest-schema.same", component: "z-component" }),
      issue({ severity: "warning", category: "manifest-schema", issueId: "manifest-schema.same", component: "a-component" }),
      issue({ severity: "error", category: "ide-mirror", issueId: "ide-mirror.missing-entry", affectedPath: ".agents/skills/speclite-help" }),
      issue({ severity: "warning", category: "file-integrity", issueId: "file-integrity.hash-mismatch", affectedPath: "a.md" }),
    ] as const;

    const firstResult = createValidateCommandResult({
      targetProject: "sort-fixture",
      issues: [...issues],
      data: {
        issueCounts: { info: 0, warning: 0, error: 0, critical: 0 },
        checkedCategories: ["manifest-schema", "ide-mirror", "file-integrity"],
        checkedTargets: [],
        validatedPaths: [],
      },
    }).result;
    const secondResult = createValidateCommandResult({
      targetProject: "sort-fixture",
      issues: [...issues].reverse(),
      data: {
        issueCounts: { info: 0, warning: 0, error: 0, critical: 0 },
        checkedCategories: ["manifest-schema", "ide-mirror", "file-integrity"],
        checkedTargets: [],
        validatedPaths: [],
      },
    }).result;
    const first = firstResult.issues;
    const second = secondResult.issues;

    expect(first).toEqual(second);
    expect(firstResult.data.issueCounts).toEqual({
      info: 0,
      warning: 4,
      error: 1,
      critical: 1,
    });
    expect(secondResult.data.issueCounts).toEqual(firstResult.data.issueCounts);
    expect(first.map((candidate) => [
      candidate.severity,
      candidate.category,
      candidate.affectedPath ?? "command-level",
      candidate.issueId,
      candidate.component ?? "",
    ])).toEqual([
      ["critical", "manifest-schema", "_speclite/_config/skill-index.json", "manifest-schema.schema-corruption", ""],
      ["error", "ide-mirror", ".agents/skills/speclite-help", "ide-mirror.missing-entry", ""],
      ["warning", "manifest-schema", "command-level", "manifest-schema.same", "a-component"],
      ["warning", "manifest-schema", "command-level", "manifest-schema.same", "z-component"],
      ["warning", "file-integrity", "a.md", "file-integrity.hash-mismatch", ""],
      ["warning", "file-integrity", "b.md", "file-integrity.hash-mismatch", ""],
    ]);
  });

  it("rejects redaction-unsafe issue paths before validation issue sorting", () => {
    const unsafePaths = [
      "/tmp/speclite-leak",
      `${os.homedir()}/speclite-leak`,
      ".agents\\skills\\speclite-help",
      "C:/Users/fancy/speclite-leak",
      "C:\\Users\\fancy\\speclite-leak",
    ];

    for (const unsafePath of unsafePaths) {
      const unsafeIssue = issue({
        severity: "error",
        category: "manifest-schema",
        issueId: "manifest-schema.schema-corruption",
        affectedPath: unsafePath,
      });

      expect(ValidationIssueSchema.safeParse(unsafeIssue).success).toBe(false);
      expect(() =>
        createValidateCommandResult({
          targetProject: "unsafe-path-fixture",
          issues: [unsafeIssue],
          data: {
            issueCounts: { info: 0, warning: 0, error: 0, critical: 0 },
            checkedCategories: ["manifest-schema"],
            checkedTargets: [],
            validatedPaths: [],
          },
        }),
      ).toThrow("ValidationIssue affectedPath must be project-relative POSIX");

      expect(
        ValidateCommandResultSchema.safeParse({
          schemaVersion: "speclite.command-result.v1",
          status: "failure",
          command: "validate",
          targetProject: "unsafe-path-fixture",
          summary: "Fixture summary.",
          issues: [unsafeIssue],
          nextActions: ["Inspect the fixture issue."],
          data: {
            issueCounts: { info: 0, warning: 0, error: 1, critical: 0 },
            checkedCategories: ["manifest-schema"],
            checkedTargets: [],
            validatedPaths: [],
          },
        }).success,
      ).toBe(false);
    }
  });

  it("keeps validate human fallback fields across terminal widths without changing JSON", () => {
    const result = createValidateCommandResult({
      targetProject: "renderer-fixture",
      issues: [
        issue({
          severity: "error",
          category: "runtime-path",
          issueId: "runtime-path.missing-entry",
          affectedPath: "_speclite/config.toml",
          component: "runtime-path-validator",
        }),
      ],
      data: {
        issueCounts: { info: 0, warning: 0, error: 1, critical: 0 },
        checkedCategories: ["manifest-schema", "runtime-path"],
        checkedTargets: ["claude"],
        validatedPaths: ["_speclite/_config/manifest.yaml", "_speclite/config.toml"],
      },
    }).result;

    for (const columns of [72, 100, 132]) {
      const human = renderValidateHumanOutput(result, { columns, noColor: true, isTty: false });

      expect(human).toContain("Status: failure");
      expect(human).toContain("severity");
      expect(human).toContain("category=runtime-path");
      expect(human).toContain("issueId=runtime-path.missing-entry");
      expect(human).toContain("location=_speclite/config.toml");
      expect(human).toContain("impact=");
      expect(human).toContain("suggestedNextStep=");
      expect(human).toContain("Checked categories: manifest-schema, runtime-path");
      expect(human).toContain("Checked targets: claude");
      expect(human).toContain("Validated paths: _speclite/_config/manifest.yaml, _speclite/config.toml");
      expect(human).toContain("Next actions");
      expect(human).not.toMatch(/\u001b\[[0-9;]*m/);
    }

    const json = renderCommandResultJson(result);
    expect(json).not.toContain("Output profile");
    expect(json).not.toContain("key-value");
    expect(json).not.toMatch(/\u001b\[[0-9;]*m/);
  });

  it("reports IDE mirror missing entry, hash mismatch and duplicate entry without leaking hashes or absolute paths", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-validate-ide-drift-"));

    try {
      await writeInstalledProjection(tempRoot);
      await writeFile(path.join(tempRoot, ".claude/skills/speclite-help/SKILL.md"), "# Drift\n", "utf8");
      await rm(path.join(tempRoot, ".agents/skills/speclite-help"), { recursive: true, force: true });
      await mkdir(path.join(tempRoot, ".claude/skills/speclite-help-copy"), { recursive: true });
      await writeFile(path.join(tempRoot, ".claude/skills/speclite-help-copy/SKILL.md"), "# Help\n", "utf8");

      const outcome = await runValidateCommand({ runtime: { cwd: tempRoot } });
      const parsed = ValidateCommandResultSchema.parse(outcome.result);

      expect(outcome.exitCode).toBe(1);
      expect(parsed.status).toBe("failure");
      expect(parsed.data.checkedCategories).toEqual([
        "manifest-schema",
        "ide-mirror",
        "runtime-path",
        "menu-target",
        "legacy-namespace",
        "artifact-path",
        "file-integrity",
      ]);
      expect(parsed.data.checkedTargets).toEqual(["claude", "agents"]);
      expect(parsed.issues.map((issue) => issue.issueId)).toEqual([
        "ide-mirror.missing-entry",
        "ide-mirror.hash-mismatch",
        "ide-mirror.duplicate-entry",
        "legacy-namespace.stale-skill-entry",
        "file-integrity.hash-mismatch",
      ]);
      expect(parsed.issues).toEqual([
        expect.objectContaining({
          issueId: "ide-mirror.missing-entry",
          category: "ide-mirror",
          severity: "error",
          affectedPath: ".agents/skills/speclite-help",
          details: expect.objectContaining({
            targetId: "agents",
            canonicalSkillId: "speclite-help",
            reason: "missing-entry",
            baselineKind: "installed-targets",
          }),
        }),
        expect.objectContaining({
          issueId: "ide-mirror.hash-mismatch",
          category: "ide-mirror",
          severity: "error",
          affectedPath: ".claude/skills/speclite-help",
          details: expect.objectContaining({
            targetId: "claude",
            canonicalSkillId: "speclite-help",
            reason: "hash-mismatch",
            baselineKind: "canonical-package-hash",
            expectedHashAlgorithm: "sha256",
          }),
        }),
        expect.objectContaining({
          issueId: "ide-mirror.duplicate-entry",
          category: "ide-mirror",
          severity: "error",
          affectedPath: ".claude/skills/speclite-help-copy",
          details: expect.objectContaining({
            targetId: "claude",
            canonicalSkillId: "speclite-help",
            reason: "duplicate-entry",
          }),
        }),
        expect.objectContaining({
          issueId: "legacy-namespace.stale-skill-entry",
          category: "legacy-namespace",
          severity: "error",
          affectedPath: ".claude/skills/speclite-help-copy",
        }),
        expect.objectContaining({
          issueId: "file-integrity.hash-mismatch",
          category: "file-integrity",
          severity: "error",
          affectedPath: ".claude/skills/speclite-help/SKILL.md",
        }),
      ]);
      expect(JSON.stringify(parsed)).not.toContain(tempRoot);
      expect(JSON.stringify(parsed)).not.toMatch(/sha256:[a-f0-9]{64}/);
      expect(JSON.stringify(parsed)).not.toContain(os.homedir());
      for (const issue of parsed.issues) {
        expect(issue.suggestedNextStep).not.toContain(issue.affectedPath ?? "unused-sentinel");
      }
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("ignores adapter artifacts in package hash and keeps repeated validate output deterministic", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-validate-adapter-artifact-"));

    try {
      await writeInstalledProjection(tempRoot);
      await writeFile(path.join(tempRoot, ".claude/skills/speclite-help/adapter.json"), '{"target":"claude"}\n', "utf8");
      await writeFile(path.join(tempRoot, ".agents/skills/speclite-help/adapter.json"), '{"target":"agents"}\n', "utf8");
      await symlink("../adapter.md", path.join(tempRoot, ".claude/skills/speclite-help/adapter-link.md"));
      await symlink("../adapter.md", path.join(tempRoot, ".agents/skills/speclite-help/adapter-link.md"));

      const outputs: ValidateCommandResult[] = [];
      for (let index = 0; index < 3; index += 1) {
        const outcome = await runValidateCommand({ runtime: { cwd: tempRoot } });
        expect(outcome.exitCode).toBe(0);
        outputs.push(ValidateCommandResultSchema.parse(outcome.result));
      }

      expect(outputs[0]).toEqual(outputs[1]);
      expect(outputs[1]).toEqual(outputs[2]);
      expect(outputs[0]?.issues).toEqual([]);
      expect(outputs[0]?.data.checkedTargets).toEqual(["claude", "agents"]);
      expect(outputs[0]?.data.validatedPaths).toEqual([...outputs[0]!.data.validatedPaths].sort());
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("reports files-index installer-owned missing files, unknown ownership and symlinks safely", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-validate-file-integrity-"));

    try {
      await writeInstalledProjection(tempRoot);
      await rm(path.join(tempRoot, ".claude/skills/speclite-help/SKILL.md"));
      await rm(path.join(tempRoot, ".agents/skills/speclite-help/SKILL.md"));
      await symlink("../outside.md", path.join(tempRoot, ".agents/skills/speclite-help/SKILL.md"));
      await writeFile(path.join(tempRoot, ".agents/skills/speclite-help/target.md"), "# Target\n", "utf8");
      await symlink("target.md", path.join(tempRoot, ".agents/skills/speclite-help/adapter-owned-link.md"));
      await writeJson(tempRoot, "_speclite/_config/files-index.json", {
        schemaVersion: "speclite.files-index.v1",
        entries: [
          {
            schemaVersion: "speclite.files-index.v1",
            path: ".claude/skills/speclite-help/SKILL.md",
            ownership: "installer-owned",
            hash: "sha256:missing",
            hashAlgorithm: "sha256",
            executable: false,
            artifactKind: "skill",
            sourceRef: "assets/source/speclite/core-skills/speclite-help/SKILL.md",
          },
          {
            schemaVersion: "speclite.files-index.v1",
            path: ".agents/skills/speclite-help/SKILL.md",
            ownership: "installer-owned",
            hash: "sha256:symlink",
            hashAlgorithm: "sha256",
            executable: false,
            artifactKind: "skill",
            sourceRef: "assets/source/speclite/core-skills/speclite-help/SKILL.md",
          },
          {
            schemaVersion: "speclite.files-index.v1",
            path: ".agents/skills/speclite-help/adapter-owned-link.md",
            ownership: "installer-owned",
            hash: "sha256:symlink-to-existing",
            hashAlgorithm: "sha256",
            executable: false,
            artifactKind: "adapter-artifact",
            sourceRef: "local:adapter-owned-link",
          },
          {
            schemaVersion: "speclite.files-index.v1",
            path: "_speclite/generated/ownerless.md",
            ownership: "human-owned",
            hash: "sha256:ownerless",
            hashAlgorithm: "sha256",
            executable: false,
            artifactKind: "generated-control",
            sourceRef: "local:ownerless",
          },
        ],
      });

      const outcome = await runValidateCommand({ runtime: { cwd: tempRoot } });
      const parsed = ValidateCommandResultSchema.parse(outcome.result);

      expect(outcome.exitCode).toBe(1);
      expect(parsed.issues.map((issue) => issue.issueId)).toEqual([
        "ide-mirror.hash-mismatch",
        "ide-mirror.hash-mismatch",
        "runtime-path.missing-entry",
        "runtime-path.missing-entry",
        "file-integrity.hash-mismatch",
        "file-integrity.hash-mismatch",
        "file-integrity.missing-installer-owned-file",
        "file-integrity.unknown-ownership",
      ]);
      expect(parsed.issues).toEqual([
        expect.objectContaining({
          issueId: "ide-mirror.hash-mismatch",
          affectedPath: ".agents/skills/speclite-help",
          details: expect.objectContaining({
            reason: "hash-mismatch",
            shape: "symlink-in-canonical-package",
          }),
        }),
        expect.objectContaining({
          issueId: "ide-mirror.hash-mismatch",
          affectedPath: ".claude/skills/speclite-help",
          details: expect.objectContaining({ reason: "hash-mismatch" }),
        }),
        expect.objectContaining({
          issueId: "runtime-path.missing-entry",
          affectedPath: "_speclite/config.toml",
          details: expect.objectContaining({
            reason: "missing-entry",
            expectedNamespace: "_speclite",
          }),
        }),
        expect.objectContaining({
          issueId: "runtime-path.missing-entry",
          affectedPath: "_speclite/config.user.toml",
          details: expect.objectContaining({
            reason: "missing-entry",
            expectedNamespace: "_speclite",
          }),
        }),
        expect.objectContaining({
          issueId: "file-integrity.hash-mismatch",
          affectedPath: ".agents/skills/speclite-help/SKILL.md",
          details: expect.objectContaining({
            ownership: "installer-owned",
            reason: "hash-mismatch",
            shape: "symlink",
          }),
        }),
        expect.objectContaining({
          issueId: "file-integrity.hash-mismatch",
          affectedPath: ".agents/skills/speclite-help/adapter-owned-link.md",
          details: expect.objectContaining({
            ownership: "installer-owned",
            reason: "hash-mismatch",
            shape: "symlink",
          }),
        }),
        expect.objectContaining({
          issueId: "file-integrity.missing-installer-owned-file",
          affectedPath: ".claude/skills/speclite-help/SKILL.md",
          details: expect.objectContaining({
            ownership: "installer-owned",
            reason: "missing-installer-owned-file",
          }),
        }),
        expect.objectContaining({
          issueId: "file-integrity.unknown-ownership",
          affectedPath: "_speclite/generated/ownerless.md",
          details: expect.objectContaining({
            ownership: "human-owned",
            reason: "unknown-ownership",
          }),
        }),
      ]);
      expect(JSON.stringify(parsed)).not.toContain("../outside.md");
      expect(JSON.stringify(parsed)).not.toContain(tempRoot);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });
});

async function writeInstalledProjection(projectRoot: string): Promise<void> {
  await mkdir(path.join(projectRoot, "_speclite/_config"), { recursive: true });
  const packageHashes = new Map<string, string>();
  for (const sourcePackagePath of SKILL_SOURCE_PACKAGE_PATHS) {
    const canonicalSkillId = path.posix.basename(sourcePackagePath);
    for (const targetRoot of [".claude/skills", ".agents/skills"]) {
      await mkdir(path.join(projectRoot, targetRoot, canonicalSkillId), { recursive: true });
      await writeFile(
        path.join(projectRoot, targetRoot, canonicalSkillId, "SKILL.md"),
        `# ${canonicalSkillId}\n`,
        "utf8",
      );
    }
    packageHashes.set(
      canonicalSkillId,
      await hashPackageDirectory(path.join(projectRoot, ".claude/skills", canonicalSkillId)),
    );
  }
  await writeFile(path.join(projectRoot, ".claude/skills/speclite-help/SKILL.md"), "# Help\n", "utf8");
  await writeFile(path.join(projectRoot, ".agents/skills/speclite-help/SKILL.md"), "# Help\n", "utf8");
  await mkdir(path.join(projectRoot, "_speclite-output"), { recursive: true });
  await writeFile(path.join(projectRoot, "_speclite/config.toml"), "# runtime config\n", "utf8");
  await writeFile(path.join(projectRoot, "_speclite/config.user.toml"), "# user runtime config\n", "utf8");
  const helpPackageHash = await hashPackageDirectory(path.join(projectRoot, ".claude/skills/speclite-help"));
  packageHashes.set("speclite-help", helpPackageHash);
  const skillFileHash = await hashFile(path.join(projectRoot, ".claude/skills/speclite-help/SKILL.md"));
  const configHash = await hashFile(path.join(projectRoot, "_speclite/config.toml"));
  const userConfigHash = await hashFile(path.join(projectRoot, "_speclite/config.user.toml"));

  await writeFile(
    path.join(projectRoot, "_speclite/_config/manifest.yaml"),
    [
      'schemaVersion: "speclite.manifest.v1"',
      "sourceDescriptor:",
      '  sourceType: "bundled"',
      '  channel: "stable"',
      '  version: "0.0.0"',
      '  resolvedRoot: "assets/source/speclite"',
      "  integrityEvidence: []",
      '  trustStatus: "trusted"',
      "installedModules:",
      '  - "core"',
      '  - "sdlc"',
      "targetIds:",
      '  - "agents"',
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

  await writeJson(projectRoot, "_speclite/_config/skill-index.json", {
    schemaVersion: "speclite.skill-index.v1",
    entries: createSkillIndexEntries(packageHashes),
  });
  await writeJson(projectRoot, "_speclite/_config/help-index.json", {
    schemaVersion: "speclite.help-index.v1",
    entries: [
      {
        schemaVersion: "speclite.help-index.v1",
        phaseId: "anytime",
        entryLabel: "Help",
        canonicalSkillId: "speclite-help",
        activationTarget: ".claude/skills/speclite-help/SKILL.md",
        targetIds: ["claude", "agents"],
      },
    ],
  });
  await writeJson(projectRoot, "_speclite/_config/phase-coverage.json", {
    schemaVersion: "speclite.phase-coverage.v1",
    rows: [
      {
        schemaVersion: "speclite.phase-coverage.v1",
        phaseId: "anytime",
        phaseLabel: "Anytime",
        moduleId: "core",
        canonicalSkillId: "speclite-help",
        ideTargets: [
          {
            targetId: "claude",
            entryPath: ".claude/skills/speclite-help",
            activationTarget: ".claude/skills/speclite-help/SKILL.md",
            status: "mapped",
          },
          {
            targetId: "agents",
            entryPath: ".agents/skills/speclite-help",
            activationTarget: ".agents/skills/speclite-help/SKILL.md",
            status: "mapped",
          },
        ],
      },
    ],
  });
  await writeJson(projectRoot, "_speclite/_config/files-index.json", {
    schemaVersion: "speclite.files-index.v1",
    entries: [
      {
        schemaVersion: "speclite.files-index.v1",
        path: "_speclite/config.toml",
        ownership: "installer-owned",
        hash: configHash,
        hashAlgorithm: "sha256",
        executable: false,
        artifactKind: "runtime-config",
        sourceRef: "installed-state:runtime-config",
      },
      {
        schemaVersion: "speclite.files-index.v1",
        path: "_speclite/config.user.toml",
        ownership: "installer-owned",
        hash: userConfigHash,
        hashAlgorithm: "sha256",
        executable: false,
        artifactKind: "runtime-config",
        sourceRef: "installed-state:runtime-config",
      },
      {
        schemaVersion: "speclite.files-index.v1",
        path: ".claude/skills/speclite-help/SKILL.md",
        ownership: "installer-owned",
        hash: skillFileHash,
        hashAlgorithm: "sha256",
        executable: false,
        artifactKind: "skill",
        sourceRef: "assets/source/speclite/core-skills/speclite-help/SKILL.md",
      },
    ],
  });
}

function issue(input: {
  severity: "critical" | "error" | "warning" | "info";
  category:
    | "environment"
    | "manifest-schema"
    | "source-integrity"
    | "ide-mirror"
    | "runtime-path"
    | "menu-target"
    | "legacy-namespace"
    | "artifact-path"
    | "file-integrity"
    | "operation-lock"
    | "update";
  issueId: string;
  affectedPath?: string;
  component?: string;
}) {
  return {
    issueId: input.issueId,
    category: input.category,
    severity: input.severity,
    ...(input.affectedPath === undefined ? {} : { affectedPath: input.affectedPath }),
    ...(input.component === undefined ? {} : { component: input.component }),
    details: {
      reason: "fixture",
    },
    impact: "Fixture issue impact.",
    suggestedNextStep: "Inspect the fixture issue.",
  };
}

function createSkillIndexEntries(packageHashes = new Map<string, string>()): Array<Record<string, unknown>> {
  return SKILL_SOURCE_PACKAGE_PATHS.map((sourcePackagePath, index) => {
    const canonicalSkillId = path.posix.basename(sourcePackagePath);
    return {
      schemaVersion: "speclite.skill-index.v1",
      canonicalSkillId,
      moduleId: sourcePackagePath.includes("/core-skills/") ? "core" : "sdlc",
      sourcePackagePath,
      canonicalPackageHash: packageHashes.get(canonicalSkillId) ?? `sha256:package-${index}`,
      installedTargets: ["agents", "claude"],
      phaseIds: ["anytime"],
    };
  });
}

const SKILL_SOURCE_PACKAGE_PATHS = [
  "assets/source/speclite/core-skills/speclite-advanced-elicitation",
  "assets/source/speclite/core-skills/speclite-brainstorming",
  "assets/source/speclite/core-skills/speclite-customize",
  "assets/source/speclite/core-skills/speclite-distillator",
  "assets/source/speclite/core-skills/speclite-editorial-review-prose",
  "assets/source/speclite/core-skills/speclite-editorial-review-structure",
  "assets/source/speclite/core-skills/speclite-help",
  "assets/source/speclite/core-skills/speclite-index-docs",
  "assets/source/speclite/core-skills/speclite-party-mode",
  "assets/source/speclite/core-skills/speclite-review-acceptance-auditor",
  "assets/source/speclite/core-skills/speclite-review-adversarial-general",
  "assets/source/speclite/core-skills/speclite-review-edge-case-hunter",
  "assets/source/speclite/core-skills/speclite-shard-doc",
  "assets/source/speclite/sdlc-skills/1-analysis/research/speclite-domain-research",
  "assets/source/speclite/sdlc-skills/1-analysis/research/speclite-market-research",
  "assets/source/speclite/sdlc-skills/1-analysis/research/speclite-technical-research",
  "assets/source/speclite/sdlc-skills/1-analysis/speclite-agent-analyst",
  "assets/source/speclite/sdlc-skills/1-analysis/speclite-agent-tech-writer",
  "assets/source/speclite/sdlc-skills/1-analysis/speclite-brownfield-context-builder",
  "assets/source/speclite/sdlc-skills/1-analysis/speclite-document-project",
  "assets/source/speclite/sdlc-skills/1-analysis/speclite-prfaq",
  "assets/source/speclite/sdlc-skills/1-analysis/speclite-product-brief",
  "assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-agent-pm",
  "assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-agent-ux-designer",
  "assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-prd",
  "assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-ux-design",
  "assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-edit-prd",
  "assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-validate-prd",
  "assets/source/speclite/sdlc-skills/3-solutioning/speclite-agent-architect",
  "assets/source/speclite/sdlc-skills/3-solutioning/speclite-check-implementation-readiness",
  "assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-architecture",
  "assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-epics-and-stories",
  "assets/source/speclite/sdlc-skills/3-solutioning/speclite-generate-project-context",
  "assets/source/speclite/sdlc-skills/3-solutioning/speclite-story-review-01-reviewer",
  "assets/source/speclite/sdlc-skills/3-solutioning/speclite-story-review-02-evaluator",
  "assets/source/speclite/sdlc-skills/3-solutioning/speclite-story-review-03-fixer",
  "assets/source/speclite/sdlc-skills/4-implementation/speclite-agent-dev",
  "assets/source/speclite/sdlc-skills/4-implementation/speclite-checkpoint-preview",
  "assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-01-reviewer",
  "assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-02-evaluator",
  "assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-03-fixer",
  "assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-04-rules-extractor",
  "assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-05-todo-tracker",
  "assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-06-finalizer",
  "assets/source/speclite/sdlc-skills/4-implementation/speclite-correct-course",
  "assets/source/speclite/sdlc-skills/4-implementation/speclite-create-story",
  "assets/source/speclite/sdlc-skills/4-implementation/speclite-dev-story",
  "assets/source/speclite/sdlc-skills/4-implementation/speclite-flow-gate",
  "assets/source/speclite/sdlc-skills/4-implementation/speclite-qa-generate-e2e-tests",
  "assets/source/speclite/sdlc-skills/4-implementation/speclite-quick-dev",
  "assets/source/speclite/sdlc-skills/4-implementation/speclite-retrospective",
  "assets/source/speclite/sdlc-skills/4-implementation/speclite-sprint-planning",
  "assets/source/speclite/sdlc-skills/4-implementation/speclite-sprint-status",
] as const;

async function writeJson(projectRoot: string, relativePath: string, value: unknown): Promise<void> {
  await writeFile(path.join(projectRoot, relativePath), `${JSON.stringify(value, null, 2)}\n`, "utf8");
}
