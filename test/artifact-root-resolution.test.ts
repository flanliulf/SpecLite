import { mkdir, mkdtemp, readdir, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  ARTIFACT_ROOT_REGISTRY,
  resolveArtifactRoots,
  resolveArtifactRootsFromProjectConfig,
} from "../src/config/artifact-root-resolver.js";
import type { ConfigTomlDocument } from "../src/config/config-schema.js";

describe("artifact root resolution", () => {
  it("returns seven fresh defaults in the SPEC 09 order without reading or writing config files", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-artifact-roots-fresh-"));
    try {
      const result = await resolveArtifactRoots({
        projectRoot: tempRoot,
        lifecycle: "fresh",
      });

      expect(result.ok).toBe(true);
      expect(result.issues).toEqual([]);
      expect(result.roots).toEqual([
        {
          field: "brainstorming_artifacts",
          configPath: "core.brainstorming_artifacts",
          placeholder: "{brainstorming_artifacts}",
          resolvedRoot: "_speclite-output/0-brainstorming-artifacts",
          resolutionMode: "fresh-default",
        },
        {
          field: "analysis_artifacts",
          configPath: "modules.sdlc.analysis_artifacts",
          placeholder: "{analysis_artifacts}",
          resolvedRoot: "_speclite-output/1-analysis-artifacts",
          resolutionMode: "fresh-default",
        },
        {
          field: "planning_artifacts",
          configPath: "modules.sdlc.planning_artifacts",
          placeholder: "{planning_artifacts}",
          resolvedRoot: "_speclite-output/2-planning-artifacts",
          resolutionMode: "fresh-default",
        },
        {
          field: "solutioning_artifacts",
          configPath: "modules.sdlc.solutioning_artifacts",
          placeholder: "{solutioning_artifacts}",
          resolvedRoot: "_speclite-output/3-solutioning-artifacts",
          resolutionMode: "fresh-default",
        },
        {
          field: "implementation_artifacts",
          configPath: "modules.sdlc.implementation_artifacts",
          placeholder: "{implementation_artifacts}",
          resolvedRoot: "_speclite-output/4-implementation-artifacts",
          resolutionMode: "fresh-default",
        },
        {
          field: "devops_artifacts",
          configPath: "modules.sdlc.devops_artifacts",
          placeholder: "{devops_artifacts}",
          resolvedRoot: "_speclite-output/5-devops-artifacts",
          resolutionMode: "fresh-default",
        },
        {
          field: "project_knowledge",
          configPath: "modules.sdlc.project_knowledge",
          placeholder: "{project_knowledge}",
          resolvedRoot: "_speclite-output/project-knowledge-base",
          resolutionMode: "fresh-default",
        },
      ]);
      expect(result.roots.find((root) => root.field === "project_knowledge")?.resolvedRoot).not.toBe("docs");
      await expect(readdir(tempRoot)).resolves.toEqual([]);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("marks fresh detailed per-field artifact root overrides as explicit without changing output-folder-derived defaults", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-artifact-roots-fresh-explicit-"));
    try {
      const result = await resolveArtifactRoots({
        projectRoot: tempRoot,
        lifecycle: "fresh",
        config: {
          core: {
            output_folder: "custom-output",
          },
          modules: {
            sdlc: {
              planning_artifacts: "custom-output/plans",
            },
          },
        },
      });

      expect(result.ok).toBe(true);
      expect(result.issues).toEqual([]);
      expect(result.roots.map(({ field, resolvedRoot, resolutionMode }) => ({
        field,
        resolvedRoot,
        resolutionMode,
      }))).toEqual([
        {
          field: "brainstorming_artifacts",
          resolvedRoot: "custom-output/0-brainstorming-artifacts",
          resolutionMode: "fresh-default",
        },
        {
          field: "analysis_artifacts",
          resolvedRoot: "custom-output/1-analysis-artifacts",
          resolutionMode: "fresh-default",
        },
        {
          field: "planning_artifacts",
          resolvedRoot: "custom-output/plans",
          resolutionMode: "explicit-config",
        },
        {
          field: "solutioning_artifacts",
          resolvedRoot: "custom-output/3-solutioning-artifacts",
          resolutionMode: "fresh-default",
        },
        {
          field: "implementation_artifacts",
          resolvedRoot: "custom-output/4-implementation-artifacts",
          resolutionMode: "fresh-default",
        },
        {
          field: "devops_artifacts",
          resolvedRoot: "custom-output/5-devops-artifacts",
          resolutionMode: "fresh-default",
        },
        {
          field: "project_knowledge",
          resolvedRoot: "custom-output/project-knowledge-base",
          resolutionMode: "fresh-default",
        },
      ]);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("keeps every existing explicit config value authoritative per field", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-artifact-roots-explicit-"));
    try {
      const config: ConfigTomlDocument = {
        core: {
          brainstorming_artifacts: "{project-root}/custom-output/brainstorming",
          output_folder: "{project-root}/custom-output",
        },
        modules: {
          sdlc: {
            analysis_artifacts: "custom-output/analysis",
            planning_artifacts: "custom-output/planning",
            solutioning_artifacts: "custom-output/solutioning",
            implementation_artifacts: "custom-output/implementation",
            devops_artifacts: "custom-output/devops",
            project_knowledge: "docs",
          },
        },
      };

      const result = await resolveArtifactRoots({
        projectRoot: tempRoot,
        lifecycle: "existing",
        config,
      });

      expect(result.ok).toBe(true);
      expect(result.issues).toEqual([]);
      expect(result.roots.map((root) => root.resolutionMode)).toEqual([
        "explicit-config",
        "explicit-config",
        "explicit-config",
        "explicit-config",
        "explicit-config",
        "explicit-config",
        "explicit-config",
      ]);
      expect(result.roots.map((root) => root.resolvedRoot)).toEqual([
        "custom-output/brainstorming",
        "custom-output/analysis",
        "custom-output/planning",
        "custom-output/solutioning",
        "custom-output/implementation",
        "custom-output/devops",
        "docs",
      ]);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("applies legacy-compatible fallback only for missing new fields in existing installs", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-artifact-roots-legacy-"));
    try {
      const result = await resolveArtifactRoots({
        projectRoot: tempRoot,
        lifecycle: "existing",
        config: {
          core: {
            output_folder: "_speclite-output",
          },
          modules: {
            sdlc: {
              planning_artifacts: "_speclite-output/planning-artifacts",
              implementation_artifacts: "_speclite-output/implementation-artifacts",
              devops_artifacts: "_speclite-output/devops-artifacts",
              project_knowledge: "docs",
            },
          },
        },
      });

      expect(result.ok).toBe(true);
      expect(result.issues).toEqual([]);
      expect(result.roots.map(({ field, resolvedRoot, resolutionMode }) => ({
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
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("tracks mixed per-field modes and produces deterministic no-write results", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-artifact-roots-mixed-"));
    try {
      const input = {
        projectRoot: tempRoot,
        lifecycle: "existing" as const,
        config: {
          core: {
            brainstorming_artifacts: "custom\\brainstorming",
            output_folder: "_speclite-output",
          },
          modules: {
            sdlc: {
              planning_artifacts: "_speclite-output\\planning-artifacts",
              solutioning_artifacts: "{project-root}\\custom\\solutioning",
              implementation_artifacts: "_speclite-output/implementation-artifacts",
              devops_artifacts: "_speclite-output/devops-artifacts",
              project_knowledge: "_speclite-output/project-knowledge",
            },
          },
        } satisfies ConfigTomlDocument,
      };

      const before = await readdir(tempRoot);
      const first = await resolveArtifactRoots(input);
      const second = await resolveArtifactRoots(input);

      expect(first).toEqual(second);
      expect(first.ok).toBe(true);
      expect(first.roots.map((root) => root.field)).toEqual(
        ARTIFACT_ROOT_REGISTRY.map((entry) => entry.field),
      );
      expect(first.roots.map(({ resolvedRoot, resolutionMode }) => ({ resolvedRoot, resolutionMode }))).toEqual([
        { resolvedRoot: "custom/brainstorming", resolutionMode: "explicit-config" },
        { resolvedRoot: "_speclite-output/planning-artifacts", resolutionMode: "legacy-compatible" },
        { resolvedRoot: "_speclite-output/planning-artifacts", resolutionMode: "explicit-config" },
        { resolvedRoot: "custom/solutioning", resolutionMode: "explicit-config" },
        { resolvedRoot: "_speclite-output/implementation-artifacts", resolutionMode: "explicit-config" },
        { resolvedRoot: "_speclite-output/devops-artifacts", resolutionMode: "explicit-config" },
        { resolvedRoot: "_speclite-output/project-knowledge", resolutionMode: "explicit-config" },
      ]);
      await expect(readdir(tempRoot)).resolves.toEqual(before);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("uses the four-layer config reader as the project-config handoff", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-artifact-roots-config-"));
    try {
      await writeProjectFile(tempRoot, "_speclite/config.toml", [
        "[core]",
        'output_folder = "_speclite-output"',
        "",
        "[modules.sdlc]",
        'planning_artifacts = "_speclite-output/planning-artifacts"',
        'implementation_artifacts = "_speclite-output/implementation-artifacts"',
        'devops_artifacts = "_speclite-output/devops-artifacts"',
        'project_knowledge = "docs"',
      ].join("\n"));
      await writeProjectFile(tempRoot, "_speclite/custom/config.toml", [
        "[modules.sdlc]",
        'analysis_artifacts = "team/analysis"',
      ].join("\n"));
      await writeProjectFile(tempRoot, "_speclite/custom/config.user.toml", [
        "[modules.sdlc]",
        'implementation_artifacts = "user/implementation"',
      ].join("\n"));

      const result = await resolveArtifactRootsFromProjectConfig({
        projectRoot: tempRoot,
        lifecycle: "existing",
      });

      expect(result.ok).toBe(true);
      expect(result.issues).toEqual([]);
      expect(result.roots.find((root) => root.field === "brainstorming_artifacts")).toMatchObject({
        resolvedRoot: "_speclite-output/brainstorming",
        resolutionMode: "legacy-compatible",
      });
      expect(result.roots.find((root) => root.field === "analysis_artifacts")).toMatchObject({
        resolvedRoot: "team/analysis",
        resolutionMode: "explicit-config",
      });
      expect(result.roots.find((root) => root.field === "solutioning_artifacts")).toMatchObject({
        resolvedRoot: "_speclite-output/planning-artifacts",
        resolutionMode: "legacy-compatible",
      });
      expect(result.roots.find((root) => root.field === "implementation_artifacts")).toMatchObject({
        resolvedRoot: "user/implementation",
        resolutionMode: "explicit-config",
      });
      expect(result.configSources).toMatchObject({
        "core.output_folder": {
          key: "core.output_folder",
          affectedPath: "_speclite/config.toml",
          role: "required-config",
        },
        "modules.sdlc.planning_artifacts": {
          key: "modules.sdlc.planning_artifacts",
          affectedPath: "_speclite/config.toml",
          role: "required-config",
        },
        "modules.sdlc.analysis_artifacts": {
          key: "modules.sdlc.analysis_artifacts",
          affectedPath: "_speclite/custom/config.toml",
          role: "optional-config",
        },
        "modules.sdlc.implementation_artifacts": {
          key: "modules.sdlc.implementation_artifacts",
          affectedPath: "_speclite/custom/config.user.toml",
          role: "optional-config",
        },
      });
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("uses empty config only when a fresh project's required base config is absent", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-artifact-roots-fresh-no-config-"));
    try {
      const result = await resolveArtifactRootsFromProjectConfig({
        projectRoot: tempRoot,
        lifecycle: "fresh",
      });

      expect(result.ok).toBe(true);
      expect(result.issues).toEqual([]);
      expect(result.configSources).toEqual({});
      expect(result.roots).toHaveLength(7);
      expect(result.roots.every((root) => root.resolutionMode === "fresh-default")).toBe(true);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("does not treat a missing project root as a fresh project with an absent base config", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-artifact-roots-missing-project-"));
    const missingProjectRoot = path.join(tempRoot, "missing-project");
    try {
      const result = await resolveArtifactRootsFromProjectConfig({
        projectRoot: missingProjectRoot,
        lifecycle: "fresh",
      });

      expect(result.ok).toBe(false);
      expect(result.roots).toEqual([]);
      expect(result.issues).toEqual([
        expect.objectContaining({
          issueId: "runtime-path.missing-entry",
          affectedPath: "_speclite/config.toml",
        }),
      ]);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("keeps fresh project config malformed and non-file inputs fail closed", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-artifact-roots-fresh-invalid-config-"));
    try {
      await writeProjectFile(tempRoot, "_speclite/config.toml", "[core\nbroken = true");
      const malformed = await resolveArtifactRootsFromProjectConfig({
        projectRoot: tempRoot,
        lifecycle: "fresh",
      });
      expect(malformed.ok).toBe(false);
      expect(malformed.issues).toEqual([
        expect.objectContaining({
          issueId: "manifest-schema.malformed-field",
          affectedPath: "_speclite/config.toml",
        }),
      ]);

      await rm(path.join(tempRoot, "_speclite/config.toml"));
      await mkdir(path.join(tempRoot, "_speclite/config.toml"));
      const nonFile = await resolveArtifactRootsFromProjectConfig({
        projectRoot: tempRoot,
        lifecycle: "fresh",
      });
      expect(nonFile.ok).toBe(false);
      expect(nonFile.issues).toEqual([
        expect.objectContaining({
          issueId: "runtime-path.invalid-script-path",
          affectedPath: "_speclite/config.toml",
        }),
      ]);

      await rm(path.join(tempRoot, "_speclite/config.toml"), { recursive: true });
      await symlink(path.join(tempRoot, "missing-config.toml"), path.join(tempRoot, "_speclite/config.toml"));
      const danglingSymlink = await resolveArtifactRootsFromProjectConfig({
        projectRoot: tempRoot,
        lifecycle: "fresh",
      });
      expect(danglingSymlink.ok).toBe(false);
      expect(danglingSymlink.issues).toEqual([
        expect.objectContaining({
          issueId: "runtime-path.missing-entry",
          affectedPath: "_speclite/config.toml",
        }),
      ]);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("rejects unresolved tokens and escaping path forms with stable redacted diagnostics", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-artifact-roots-invalid-"));
    try {
      const invalidValues = [
        ["{planning_artifacts}/research", "artifact-path.unresolved-token"],
        ["../outside", "artifact-path.escapes-project"],
        ["/outside", "artifact-path.escapes-project"],
        ["C:/outside", "artifact-path.escapes-project"],
        ["~/outside", "artifact-path.escapes-project"],
      ] as const;

      for (const [value, issueId] of invalidValues) {
        const result = await resolveArtifactRoots({
          projectRoot: tempRoot,
          lifecycle: "existing",
          config: {
            core: {
              brainstorming_artifacts: value,
              output_folder: "_speclite-output",
            },
            modules: {
              sdlc: {
                planning_artifacts: "_speclite-output/planning-artifacts",
                implementation_artifacts: "_speclite-output/implementation-artifacts",
                devops_artifacts: "_speclite-output/devops-artifacts",
                project_knowledge: "docs",
              },
            },
          },
        });

        expect(result.ok).toBe(false);
        expect(result.issues).toEqual([
          expect.objectContaining({
            issueId,
            category: "artifact-path",
            affectedPath: "project-config:core.brainstorming_artifacts",
            details: {
              field: "brainstorming_artifacts",
              reason: issueId === "artifact-path.unresolved-token" ? "unresolved-token" : "path-escapes-project",
            },
          }),
        ]);
        expect(JSON.stringify(result.issues)).not.toContain(value);
        expect(JSON.stringify(result.issues)).not.toContain(tempRoot);
      }
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("allows internal symlinks and rejects external symlink escapes without leaking absolute paths", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-artifact-roots-symlink-"));
    const outsideRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-artifact-roots-outside-"));

    try {
      await mkdir(path.join(tempRoot, "real-roots/analysis"), { recursive: true });
      await symlink(path.join(tempRoot, "real-roots"), path.join(tempRoot, "internal-link"));
      await symlink(outsideRoot, path.join(tempRoot, "external-link"));

      const internal = await resolveArtifactRoots({
        projectRoot: tempRoot,
        lifecycle: "existing",
        config: {
          core: {
            output_folder: "_speclite-output",
          },
          modules: {
            sdlc: {
              analysis_artifacts: "internal-link/analysis",
              planning_artifacts: "_speclite-output/planning-artifacts",
              implementation_artifacts: "_speclite-output/implementation-artifacts",
              devops_artifacts: "_speclite-output/devops-artifacts",
              project_knowledge: "docs",
            },
          },
        },
      });
      expect(internal.ok).toBe(true);
      expect(internal.issues).toEqual([]);

      const external = await resolveArtifactRoots({
        projectRoot: tempRoot,
        lifecycle: "existing",
        config: {
          core: {
            output_folder: "_speclite-output",
          },
          modules: {
            sdlc: {
              analysis_artifacts: "external-link/analysis",
              planning_artifacts: "_speclite-output/planning-artifacts",
              implementation_artifacts: "_speclite-output/implementation-artifacts",
              devops_artifacts: "_speclite-output/devops-artifacts",
              project_knowledge: "docs",
            },
          },
        },
      });

      expect(external.ok).toBe(false);
      expect(external.issues).toEqual([
        expect.objectContaining({
          issueId: "artifact-path.symlink-escape",
          affectedPath: "project-config:modules.sdlc.analysis_artifacts",
          details: {
            field: "analysis_artifacts",
            reason: "symlink-escape",
          },
        }),
      ]);
      expect(JSON.stringify(external.issues)).not.toContain(tempRoot);
      expect(JSON.stringify(external.issues)).not.toContain(outsideRoot);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
      await rm(outsideRoot, { recursive: true, force: true });
    }
  });
});

async function writeProjectFile(projectRoot: string, relativePath: string, contents: string): Promise<void> {
  const filePath = path.join(projectRoot, relativePath);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${contents}\n`, "utf8");
}
