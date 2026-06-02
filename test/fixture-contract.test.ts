import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  EXPECTED_OUTPUT_CLASS_REGISTRY,
  ExpectedOutputClassSchema,
  FIXTURE_GATE_REGISTRY,
  FixtureCaseManifestSchema,
  REQUIRED_SOURCE_INTEGRITY_SUB_CASES,
  assertHumanOutputProfile,
  compareSemanticJson,
  getFixtureGateClassification,
  normalizeStableFixtureJson,
  parseExpectedCommandJson,
  parseExpectedManifestSnapshot,
  parseExpectedStderrJsonLines,
  parseExpectedValidationIssueSet,
  validateFixtureCaseLayout,
  validateSnapshotUpdateDiscipline,
} from "../src/fixtures/fixture-contract.js";
import { MANIFEST_SCHEMA_VERSION } from "../src/manifest/manifest-schema.js";
import { SourceDescriptorSchema } from "../src/source/source-descriptor-schema.js";

describe("fixture contract registry and layout", () => {
  it("defines release gate cases, source-integrity sub-cases and packaging boundary", () => {
    expect(Object.keys(FIXTURE_GATE_REGISTRY.fixtureProjectGates)).toEqual([
      "fresh-install-empty-project",
      "existing-install-update",
      "ide-drift",
      "source-integrity",
      "resolve-parity",
      "path-portability",
      "skill-artifact-loop",
    ]);
    expect(REQUIRED_SOURCE_INTEGRITY_SUB_CASES).toEqual([
      "bundled-packaging-trusted",
      "bundled-packaging-missing-evidence-blocked",
      "registry-lock-trusted",
      "registry-unverified",
      "git-floating-blocked",
      "local-source-snapshot-unverified",
      "local-source-path-redacted",
      "local-source-installed-state-blocked",
      "artifact-hash-mismatch-blocked",
      "source-unreadable-blocked",
    ]);
    expect(getFixtureGateClassification("fresh-install-empty-project")).toBe("fixture-project-gate");
    expect(getFixtureGateClassification("source-integrity/git-floating-blocked")).toBe(
      "fixture-group-sub-case",
    );
    expect(
      getFixtureGateClassification("source-integrity/source-unreadable-blocked/local-tarball-unreadable"),
    ).toBe("fixture-group-sub-case");
    expect(getFixtureGateClassification("packaging-acceptance")).toBe("release-checklist-gate");
    expect(getFixtureGateClassification("richer-example")).toBeUndefined();
  });

  it("validates single case and group sub-case layout without accepting unstable expected truth", () => {
    expect(
      validateFixtureCaseLayout({
        relativeCasePath: "test/fixtures/fresh-install-empty-project",
        caseId: "fresh-install-empty-project",
        entries: [
          "test/fixtures/fresh-install-empty-project/input/.gitkeep",
          "test/fixtures/fresh-install-empty-project/expected/installed-tree.txt",
          "test/fixtures/fresh-install-empty-project/README.md",
        ],
      }),
    ).toEqual([]);

    expect(
      validateFixtureCaseLayout({
        relativeCasePath: "test/fixtures/source-integrity/git-floating-blocked",
        groupId: "source-integrity",
        subCaseId: "git-floating-blocked",
        entries: [
          "test/fixtures/source-integrity/git-floating-blocked/input/source.json",
          "test/fixtures/source-integrity/git-floating-blocked/expected/issue.json",
          "test/fixtures/source-integrity/git-floating-blocked/README.md",
        ],
      }),
    ).toEqual([]);

    expect(
      validateFixtureCaseLayout({
        relativeCasePath: "test/fixtures/BadCase",
        caseId: "BadCase",
        entries: [
          "test/fixtures/BadCase/input/source.json",
          "test/fixtures/BadCase/expected/cache/output.json",
        ],
      }).map((violation) => violation.code),
    ).toEqual([
      "invalid-case-id",
      "invalid-layout-path",
      "missing-readme",
      "unstable-expected-truth",
    ]);
    expect(
      validateFixtureCaseLayout({
        relativeCasePath: "test/fixtures/missing-dirs",
        caseId: "missing-dirs",
        entries: ["test/fixtures/missing-dirs/README.md"],
      }).map((violation) => violation.code),
    ).toEqual(["missing-input-dir", "missing-expected-dir"]);
  });

  it("keeps Story 6.3 release gate fixture layouts complete on disk", async () => {
    const projectCases = ["ide-drift", "resolve-parity"];
    for (const caseId of projectCases) {
      expect(
        validateFixtureCaseLayout({
          relativeCasePath: `test/fixtures/${caseId}`,
          caseId,
          entries: await listFixtureEntries(`test/fixtures/${caseId}`),
        }),
      ).toEqual([]);
    }

    for (const subCaseId of REQUIRED_SOURCE_INTEGRITY_SUB_CASES) {
      expect(
        validateFixtureCaseLayout({
          relativeCasePath: `test/fixtures/source-integrity/${subCaseId}`,
          groupId: "source-integrity",
          subCaseId,
          entries: await listFixtureEntries(`test/fixtures/source-integrity/${subCaseId}`),
        }),
      ).toEqual([]);
    }
  });
});

describe("expected output parsers and stable comparison", () => {
  it("registers expected output classes with executable parser anchors", () => {
    expect(EXPECTED_OUTPUT_CLASS_REGISTRY.map((entry) => entry.classId)).toEqual([
      "installed-tree",
      "manifest-index-snapshot",
      "command-json",
      "validation-issue-set",
      "stderr-jsonl-diagnostics",
      "file-hash",
      "normalized-file-tree-summary",
      "human-output-profile",
    ]);
    expect(
      EXPECTED_OUTPUT_CLASS_REGISTRY.find((entry) => entry.classId === "command-json")?.parserAnchor,
    ).toBe("src/diagnostics/command-result-schema.ts");
    expect(
      EXPECTED_OUTPUT_CLASS_REGISTRY.find((entry) => entry.classId === "manifest-index-snapshot")
        ?.parserAnchor,
    ).toBe("src/manifest/manifest-schema.ts");
    expect(ExpectedOutputClassSchema.safeParse("unknown-output").success).toBe(false);
    expect(
      FixtureCaseManifestSchema.safeParse({
        caseId: "fresh-install-empty-project",
        expectedOutputClass: "command-json",
      }).success,
    ).toBe(true);
    expect(
      FixtureCaseManifestSchema.safeParse({
        caseId: "fresh-install-empty-project",
        expectedOutputClass: "unknown-output",
      }).success,
    ).toBe(false);
  });

  it("parses manifest snapshots, validation issue sets and stderr JSON Lines through owning schemas", () => {
    const manifest = {
      schemaVersion: MANIFEST_SCHEMA_VERSION,
      sourceDescriptor: {
        sourceType: "bundled",
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
      installedModules: ["core"],
      targetIds: ["claude", "agents"],
      paths: {
        projectRoot: ".",
        specliteRoot: "_speclite",
        artifactRoot: "_speclite-output",
        manifestPath: "_speclite/_config/manifest.yaml",
      },
    };
    const issue = {
      issueId: "source-integrity.floating-git-source",
      category: "source-integrity",
      severity: "error",
      affectedPath: "_speclite/config.toml",
      details: { reason: "floating-git-source" },
      impact: "The source cannot be reproduced safely.",
      suggestedNextStep: "Pin the source to an immutable commit before installing.",
    };

    expect(parseExpectedManifestSnapshot(manifest)).toEqual(manifest);
    expect(parseExpectedValidationIssueSet([issue])).toEqual([issue]);
    expect(parseExpectedStderrJsonLines(`${JSON.stringify(issue)}\n`)).toEqual([issue]);
  });

  it("parses Story 6.3 source-integrity expected outputs and rejects public-data leaks", async () => {
    for (const subCaseId of REQUIRED_SOURCE_INTEGRITY_SUB_CASES) {
      const caseRoot = path.join("test/fixtures/source-integrity", subCaseId);
      const commandJson = JSON.parse(
        await readFile(path.join(caseRoot, "expected/command-json/source-integrity.json"), "utf8"),
      );
      const parsedCommand = parseExpectedCommandJson(commandJson);
      const commandText = JSON.stringify(parsedCommand);

      expect(parsedCommand.command).toBe("install");
      expect(commandText).not.toContain("RepairCommandData");
      expect(commandText).not.toContain("update.repair");
      expect(commandText).not.toMatch(/\/Users\/|C:\\|~\/|node_modules|\.cache|\/tmp\/|token=|password=|Stack trace|Error:/i);
      expect(SourceDescriptorSchema.parse(parsedCommand.data.sourceDescriptor)).toEqual(
        parsedCommand.data.sourceDescriptor,
      );

      const issueSet = JSON.parse(await readFile(path.join(caseRoot, "expected/issues.json"), "utf8"));
      expect(parseExpectedValidationIssueSet(issueSet)).toEqual(issueSet);

      const redactionAssertions = JSON.parse(
        await readFile(path.join(caseRoot, "expected/redaction-assertions.json"), "utf8"),
      ) as { forbiddenSubstrings: string[] };
      const publicFixtureText = [
        await readFile(path.join(caseRoot, "README.md"), "utf8"),
        await readFile(path.join(caseRoot, "fixture-case.json"), "utf8"),
        await readFile(path.join(caseRoot, "expected/command-json/source-integrity.json"), "utf8"),
        await readFile(path.join(caseRoot, "expected/issues.json"), "utf8"),
      ].join("\n");
      for (const forbidden of redactionAssertions.forbiddenSubstrings) {
        expect(publicFixtureText).not.toContain(forbidden);
      }
    }
  });

  it("parses resolve-parity expected stdout/stderr fixtures without CommandResult envelopes", async () => {
    const expectedRoot = path.join("test/fixtures/resolve-parity/expected");
    const stdoutFiles = [
      "config/merged.json",
      "config/missing-key.json",
      "config/repeated-keys.json",
      "customization/merged.json",
      "customization/array-rules.json",
    ];
    for (const relativeFile of stdoutFiles) {
      const parsed = JSON.parse(await readFile(path.join(expectedRoot, relativeFile), "utf8"));
      expect(parsed).not.toHaveProperty("schemaVersion");
      expect(parsed).not.toHaveProperty("command");
      expect(parsed).not.toHaveProperty("status");
      expect(parsed).not.toHaveProperty("issues");
    }

    for (const relativeFile of [
      "config/optional-layer-warning.jsonl",
      "config/required-layer-error.jsonl",
      "customization/optional-layer-warning.jsonl",
      "customization/required-layer-error.jsonl",
    ]) {
      const diagnostics = parseExpectedStderrJsonLines(
        await readFile(path.join(expectedRoot, relativeFile), "utf8"),
      );
      expect(diagnostics.length).toBeGreaterThan(0);
      expect(JSON.stringify(diagnostics)).not.toMatch(/\/Users\/|C:\\|~\/|node_modules|\.cache|\/tmp\/|token=/i);
    }
  });

  it("normalizes only schema-declared non-stable fields and rejects path, timestamp and random leaks", () => {
    expect(
      normalizeStableFixtureJson(
        {
          artifactPath: "_speclite-output/report.md",
          generatedAt: "2026-06-02T00:00:00.000Z",
        },
        { allowedNonStableFields: ["generatedAt"] },
      ),
    ).toEqual({
      artifactPath: "_speclite-output/report.md",
      generatedAt: "<iso8601>",
    });

    expect(() =>
      normalizeStableFixtureJson({
        generatedAt: "2026-06-02T00:00:00.000Z",
      }),
    ).toThrow(/non-stable field/);
    expect(() =>
      normalizeStableFixtureJson({
        affectedPath: "/Users/fancyliu/project/file.md",
      }),
    ).toThrow(/stable fixture value leaks/);
    expect(() =>
      normalizeStableFixtureJson({
        affectedPath: "C:/Users/fancyliu/project/file.md",
      }),
    ).toThrow(/stable fixture value leaks/);
    expect(() =>
      normalizeStableFixtureJson({
        affectedPath: "~/project/file.md",
      }),
    ).toThrow(/stable fixture value leaks/);
    expect(() =>
      normalizeStableFixtureJson({
        randomId: "abc123",
      }),
    ).toThrow(/non-stable field/);
    expect(() =>
      normalizeStableFixtureJson(
        {
          randomId: "abc123",
        },
        { allowedNonStableFields: ["randomId"] },
      ),
    ).toThrow(/schema-declared timestamp/);
    expect(() =>
      normalizeStableFixtureJson(
        {
          processId: "2026-06-02T00:00:00.000Z",
        },
        { allowedNonStableFields: ["processId"] },
      ),
    ).toThrow(/schema-declared timestamp/);
    expect(() =>
      normalizeStableFixtureJson(
        {
          durationMs: "2026-06-02T00:00:00.000Z",
        },
        { allowedNonStableFields: ["durationMs"] },
      ),
    ).toThrow(/schema-declared timestamp/);
  });

  it("compares semantic JSON after normalization instead of raw bytes", () => {
    expect(
      compareSemanticJson({
        actual: {
          path: "src\\commands\\install.ts",
          generatedAt: "2026-06-02T00:00:00.000Z",
        },
        expected: {
          path: "src/commands/install.ts",
          generatedAt: "2025-01-01T00:00:00.000Z",
        },
        allowedNonStableFields: ["generatedAt"],
      }),
    ).toEqual({ pass: true, differences: [] });
    expect(
      compareSemanticJson({
        actual: {
          nested: {
            b: 1,
            a: 2,
          },
        },
        expected: {
          nested: {
            a: 2,
            b: 1,
          },
        },
      }),
    ).toEqual({ pass: true, differences: [] });
  });
});

async function listFixtureEntries(relativeRoot: string): Promise<string[]> {
  const entries: string[] = [];
  async function walk(current: string): Promise<void> {
    entries.push(current);
    const dirEntries = await readdir(current, { withFileTypes: true });
    for (const entry of dirEntries) {
      const child = path.join(current, entry.name);
      entries.push(child);
      if (entry.isDirectory()) {
        await walk(child);
      }
    }
  }
  await walk(relativeRoot);
  return entries.map((entry) => entry.split(path.sep).join("/")).sort();
}

describe("human output and snapshot update policy", () => {
  it("asserts Compact, Evidence and Structured human output boundaries including narrow fallback fields", () => {
    expect(
      assertHumanOutputProfile({
        profile: "compact",
        output: "Status: success\nnext action=Run speclite validate.",
        requiredFields: ["status", "next action"],
      }),
    ).toEqual([]);
    expect(
      assertHumanOutputProfile({
        profile: "evidence",
        terminalWidth: 60,
        output: [
          "SpecLite validate",
          "severity=error",
          "issueId=source-integrity.floating-git-source",
          "affectedPath=_speclite/config.toml",
          "targetId=claude",
          "entryPath=.claude/skills/speclite-dev-story",
          "next action=Pin the source.",
          "planned effect=blocked",
          "conflict reason=missing-source-evidence",
          "artifact path=_speclite-output/report.md",
          "workflowType=code-review",
          "sourceSkill=speclite-code-review-01-reviewer",
          "generatedAt=<iso8601>",
        ].join("\n"),
        requiredFields: ["severity", "issueId", "affectedPath", "next action"],
      }),
    ).toEqual([]);

    expect(
      assertHumanOutputProfile({
        profile: "compact",
        output: "\u001b[31m✖\u001b[0m",
        requiredFields: ["status"],
      }).map((violation) => violation.code),
    ).toEqual(["ansi-output", "spinner-only-progress", "missing-human-field"]);
    expect(
      assertHumanOutputProfile({
        profile: "structured",
        output: '{"schemaVersion":"speclite.command-result.v1","status":"success"}',
        requiredFields: ["schemaVersion", "status"],
      }),
    ).toEqual([]);
  });

  it("requires explicit local snapshot updates after SPEC and parser changes", () => {
    expect(
      validateSnapshotUpdateDiscipline({
        owningSpecUpdated: true,
        executableParserUpdated: true,
        expectedOutputUpdated: true,
        ci: false,
        explicitLocalUpdate: true,
      }),
    ).toEqual([]);
    expect(
      validateSnapshotUpdateDiscipline({
        owningSpecUpdated: false,
        executableParserUpdated: true,
        expectedOutputUpdated: true,
        ci: false,
        explicitLocalUpdate: true,
      }).map((violation) => violation.code),
    ).toEqual(["snapshot-before-spec"]);
    expect(
      validateSnapshotUpdateDiscipline({
        owningSpecUpdated: true,
        executableParserUpdated: true,
        expectedOutputUpdated: true,
        ci: true,
        explicitLocalUpdate: false,
      }).map((violation) => violation.code),
    ).toEqual(["ci-snapshot-update"]);
  });
});
