import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { InstallCommandResultSchema } from "../src/diagnostics/command-result-schema.js";
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
