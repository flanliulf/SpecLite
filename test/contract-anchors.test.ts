import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  InstallCommandResultSchema,
  RepairCommandResultSchema,
  UpdateCommandResultSchema,
  ValidationIssueSchema,
} from "../src/diagnostics/command-result-schema.js";
import {
  deriveCommandStatus,
  getExitCodeForStatus,
  normalizeCommandId,
} from "../src/diagnostics/command-result.js";
import { SourceDescriptorSchema } from "../src/source/source-descriptor-schema.js";
import { SourceResolutionPlanSchema, InstallPlanSchema } from "../src/installer/install-plan-schema.js";
import { ManifestSchema, MANIFEST_SCHEMA_VERSION } from "../src/manifest/manifest-schema.js";
import { CANONICAL_TARGET_ORDER, getIdeAdapterRegistry } from "../src/ide/adapter-registry.js";
import { ResolveMergeResultSchema, ResolveOutputSchema } from "../src/config/resolve-output-schema.js";
import { resolveProjectConfig } from "../src/config/config-reader.js";
import { parseExpectedCommandJson } from "../src/fixtures/fixture-contract.js";

describe("owning SPEC executable anchors", () => {
  it("exposes the command result producer and fixture consumer through one schema", () => {
    const result = {
      schemaVersion: "speclite.command-result.v1",
      status: "failure",
      command: "install",
      targetProject: "fixture",
      summary: "SpecLite install preflight failed before any project files were changed.",
      issues: [],
      nextActions: [],
      data: {
        sourceDescriptor: {
          sourceType: "bundled",
          resolvedRoot: "assets/source/speclite",
          integrityEvidence: [],
          trustStatus: "blocked",
        },
        manifestVersion: MANIFEST_SCHEMA_VERSION,
        installedModules: [],
        ideTargets: [],
        paths: {
          projectRoot: ".",
        },
        completedSteps: [],
        pendingSteps: ["source-discovery"],
      },
    };

    expect(InstallCommandResultSchema.parse(result)).toEqual(result);
    expect(parseExpectedCommandJson(result)).toEqual(result);
  });

  it("accepts update and repair command payloads without legacy placeholder fields", () => {
    const updateResult = {
      schemaVersion: "speclite.command-result.v1",
      status: "success",
      command: "update",
      targetProject: "fixture",
      summary: "Update planning completed.",
      issues: [],
      nextActions: [],
      data: {
        updatePlan: {
          actions: [],
        },
        changedPaths: [],
        skippedPaths: [],
        conflicts: [],
        requiresConfirmation: true,
        writeAuthorized: false,
      },
    };
    const repairResult = {
      ...updateResult,
      command: "update.repair",
      data: {
        repairPlan: {
          actions: [],
        },
        changedPaths: [],
        skippedPaths: [],
        conflicts: [],
        requiresConfirmation: true,
        writeAuthorized: false,
      },
    };

    expect(UpdateCommandResultSchema.parse(updateResult)).toEqual(updateResult);
    expect(RepairCommandResultSchema.parse(repairResult)).toEqual(repairResult);
    expect(parseExpectedCommandJson(updateResult)).toEqual(updateResult);
    expect(parseExpectedCommandJson(repairResult)).toEqual(repairResult);
    expect(
      UpdateCommandResultSchema.safeParse({
        ...updateResult,
        data: {
          ...updateResult.data,
          implementationAvailable: false,
        },
      }).success,
    ).toBe(false);
  });

  it("rejects non-contract top-level fields and redaction-unsafe issue prose", () => {
    const result = {
      schemaVersion: "speclite.command-result.v1",
      status: "failure",
      command: "install",
      targetProject: "fixture",
      summary: "SpecLite install failed.",
      issues: [],
      nextActions: [],
      data: {
        sourceDescriptor: {
          sourceType: "bundled",
          resolvedRoot: "assets/source/speclite",
          integrityEvidence: [],
          trustStatus: "blocked",
        },
        manifestVersion: MANIFEST_SCHEMA_VERSION,
        installedModules: [],
        ideTargets: [],
        paths: {
          projectRoot: ".",
        },
        completedSteps: [],
        pendingSteps: [],
      },
      elapsedMs: 12,
    };

    expect(InstallCommandResultSchema.safeParse(result).success).toBe(false);
    expect(
      ValidationIssueSchema.safeParse({
        issueId: "manifest-schema.missing-version",
        category: "manifest-schema",
        severity: "error",
        affectedPath: "_speclite/_config/manifest.yaml",
        impact: "Manifest version is missing.",
        suggestedNextStep: "Rerun install.",
      }).success,
    ).toBe(true);
    expect(
      ValidationIssueSchema.safeParse({
        issueId: "file-integrity.hash-mismatch",
        category: "file-integrity",
        severity: "error",
        affectedPath: ".claude/skills/speclite-help/SKILL.md",
        details: {
          leakedPath: "/tmp/speclite-cache/file.txt",
        },
        impact: "An installed file no longer matches the files index boundary.",
        suggestedNextStep: "Rerun install after removing local cache details.",
      }).success,
    ).toBe(false);
    expect(
      ValidationIssueSchema.safeParse({
        issueId: "manifest-schema.invalid-details",
        category: "manifest-schema",
        severity: "error",
        details: {
          reason: undefined,
        },
        impact: "Manifest details must remain JSON-serializable.",
        suggestedNextStep: "Emit a stable details reason before rendering command JSON.",
      }).success,
    ).toBe(false);
    expect(
      ValidationIssueSchema.safeParse({
        issueId: "manifest-schema.invalid-details-list",
        category: "manifest-schema",
        severity: "error",
        details: {
          reasons: ["schema-version", undefined],
        },
        impact: "Manifest details arrays must remain JSON-serializable.",
        suggestedNextStep: "Emit only stable details values before rendering command JSON.",
      }).success,
    ).toBe(false);
  });

  it("derives command status, exit code and normalized command ids from shared helpers", () => {
    const warningIssue = {
      issueId: "operation-lock.stale-lock",
      category: "operation-lock",
      severity: "warning",
      component: "validate-command",
      details: {
        reason: "stale-lock",
      },
      impact: "A stale operation lock may require manual inspection.",
      suggestedNextStep: "Inspect the operation lock before running write-capable commands.",
    } as const;
    const errorIssue = {
      ...warningIssue,
      issueId: "operation-lock.project-locked",
      severity: "error",
      impact: "A write-capable operation cannot continue while the project is locked.",
    } as const;

    expect(deriveCommandStatus({ issues: [] })).toBe("success");
    expect(deriveCommandStatus({ issues: [warningIssue] })).toBe("warning");
    expect(deriveCommandStatus({ issues: [errorIssue] })).toBe("failure");
    expect(deriveCommandStatus({ issues: [], commandCompleted: false })).toBe("failure");
    expect(deriveCommandStatus({ issues: [], hasBlockingConflicts: true })).toBe("failure");
    expect(getExitCodeForStatus("success")).toBe(0);
    expect(getExitCodeForStatus("warning")).toBe(0);
    expect(getExitCodeForStatus("failure")).toBe(1);
    expect(normalizeCommandId({ command: "update" })).toBe("update");
    expect(normalizeCommandId({ command: "update", repair: true })).toBe("update.repair");
  });

  it("provides Story 1.1 schema and registry anchors without orchestration shortcuts", () => {
    expect(SourceDescriptorSchema.parse({
      sourceType: "bundled",
      resolvedRoot: "assets/source/speclite",
      integrityEvidence: [],
      trustStatus: "blocked",
    })).toMatchObject({ sourceType: "bundled" });

    expect(SourceResolutionPlanSchema.parse({
      requestedSourceType: "bundled",
      requestedSourceValue: "assets/source/speclite",
      externalAccesses: [],
      requiresConfirmation: false,
      confirmed: true,
    })).toMatchObject({ requestedSourceType: "bundled" });

    expect(InstallPlanSchema.parse({
      sourceDescriptor: {
        sourceType: "bundled",
        resolvedRoot: "assets/source/speclite",
        integrityEvidence: [],
        trustStatus: "blocked",
      },
      selectedModules: [],
      targetAdapters: [],
      externalAccesses: [],
      plannedWrites: [],
      requiresConfirmation: false,
      writeAuthorized: false,
    })).toMatchObject({ writeAuthorized: false });

    const blockedWritePlan = InstallPlanSchema.safeParse({
      sourceDescriptor: {
        sourceType: "bundled",
        resolvedRoot: "assets/source/speclite",
        integrityEvidence: [],
        trustStatus: "blocked",
      },
      selectedModules: [],
      targetAdapters: [],
      externalAccesses: [],
      plannedWrites: [],
      requiresConfirmation: false,
      writeAuthorized: true,
    });
    expect(blockedWritePlan.success).toBe(false);
    if (!blockedWritePlan.success) {
      expect(blockedWritePlan.error.issues).toEqual([
        expect.objectContaining({
          path: ["sourceDescriptor", "trustStatus"],
        }),
      ]);
    }

    expect(ManifestSchema.parse({
      schemaVersion: MANIFEST_SCHEMA_VERSION,
      sourceDescriptor: {
        sourceType: "bundled",
        resolvedRoot: "assets/source/speclite",
        integrityEvidence: [],
        trustStatus: "blocked",
      },
      installedModules: [],
      targetIds: ["claude", "agents"],
      paths: {
        projectRoot: ".",
        specliteRoot: "_speclite",
        artifactRoot: "_speclite-output",
        manifestPath: "_speclite/_config/manifest.yaml",
      },
    })).toMatchObject({ schemaVersion: MANIFEST_SCHEMA_VERSION });

    expect(CANONICAL_TARGET_ORDER).toEqual(["claude", "agents"]);
    expect(getIdeAdapterRegistry().map((adapter) => adapter.id)).toEqual(["claude", "agents"]);

    expect(ResolveOutputSchema.parse({
      ok: true,
    })).toEqual({ ok: true });
  });

  it("parses the resolver merge result returned by the runtime readers", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-resolve-anchor-"));

    try {
      await mkdir(path.join(tempRoot, "_speclite"), { recursive: true });
      await writeFile(
        path.join(tempRoot, "_speclite/config.toml"),
        "[core]\nproject_name = \"anchor-fixture\"\n",
        "utf8",
      );

      const result = await resolveProjectConfig({ projectRoot: tempRoot });

      expect(ResolveMergeResultSchema.parse(result)).toEqual(result);
      expect(result).toEqual({
        value: {
          core: {
            project_name: "anchor-fixture",
          },
        },
        issues: [],
        exitCode: 0,
      });
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });
});
