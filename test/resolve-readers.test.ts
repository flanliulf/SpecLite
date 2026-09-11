import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createSpecliteProgram } from "../src/bin/speclite.js";
import { resolveProjectConfig } from "../src/config/config-reader.js";
import { resolveSkillCustomization } from "../src/config/customization-reader.js";
import {
  ResolveArtifactRootsOutputSchema,
  ResolveStdoutObjectSchema,
  ResolveStderrJsonLineSchema,
} from "../src/config/resolve-output-schema.js";

describe("resolve config reader", () => {
  it("merges four config layers and selects repeated dotted keys after merge", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-config-reader-"));
    try {
      await writeProjectFile(tempRoot, "_speclite/config.toml", [
        "[core]",
        'project_name = "Base"',
        'communication_language = "中文"',
        "",
        "[[modules.sdlc.agents]]",
        'code = "dev"',
        'label = "Base Dev"',
      ].join("\n"));
      await writeProjectFile(tempRoot, "_speclite/config.user.toml", [
        "[core]",
        'project_name = "User"',
      ].join("\n"));
      await writeProjectFile(tempRoot, "_speclite/custom/config.toml", [
        "[core]",
        'user_name = "Team"',
        "",
        "[[modules.sdlc.agents]]",
        'code = "dev"',
        'label = "Team Dev"',
      ].join("\n"));
      await writeProjectFile(tempRoot, "_speclite/custom/config.user.toml", [
        "[core]",
        'document_output_language = "Mandarin"',
      ].join("\n"));

      const result = await resolveProjectConfig({
        projectRoot: tempRoot,
        keys: ["core.project_name", "missing.value", "modules.sdlc.agents"],
      });

      expect(result.exitCode).toBe(0);
      expect(result.issues).toEqual([]);
      expect(ResolveStdoutObjectSchema.parse(result.value)).toEqual({
        "core.project_name": "User",
        "modules.sdlc.agents": [{ code: "dev", label: "Team Dev" }],
      });
      expect(result.sources).toMatchObject({
        "core.project_name": {
          affectedPath: "_speclite/config.user.toml",
          role: "optional-config",
        },
        "modules.sdlc.agents": {
          affectedPath: "_speclite/custom/config.toml",
          role: "optional-config",
        },
      });
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("returns leaf source metadata for full nested config reads", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-config-reader-full-sources-"));
    try {
      await writeProjectFile(tempRoot, "_speclite/config.toml", [
        "[core]",
        'output_folder = "_speclite-output"',
        "",
        "[modules.sdlc]",
        'planning_artifacts = "_speclite-output/planning-artifacts"',
      ].join("\n"));
      await writeProjectFile(tempRoot, "_speclite/custom/config.toml", [
        "[modules.sdlc]",
        'analysis_artifacts = "team/analysis"',
      ].join("\n"));
      await writeProjectFile(tempRoot, "_speclite/custom/config.user.toml", [
        "[modules.sdlc]",
        'project_knowledge = "user/docs"',
      ].join("\n"));

      const result = await resolveProjectConfig({ projectRoot: tempRoot });

      expect(result.exitCode).toBe(0);
      expect(result.issues).toEqual([]);
      expect(result.value).toEqual({
        core: {
          output_folder: "_speclite-output",
        },
        modules: {
          sdlc: {
            planning_artifacts: "_speclite-output/planning-artifacts",
            analysis_artifacts: "team/analysis",
            project_knowledge: "user/docs",
          },
        },
      });
      expect(result.sources).toMatchObject({
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
        "modules.sdlc.project_knowledge": {
          key: "modules.sdlc.project_knowledge",
          affectedPath: "_speclite/custom/config.user.toml",
          role: "optional-config",
        },
      });
      expect("core" in result.sources).toBe(false);
      expect("modules" in result.sources).toBe(false);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("keeps resolve config raw while resolve artifact-roots exposes resolver-backed legacy roots", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-resolve-artifact-roots-"));
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

      const rawConfig = await runResolve([
        "resolve",
        "config",
        "--project-root",
        tempRoot,
        "--key",
        "modules.sdlc.analysis_artifacts",
      ]);
      expect(rawConfig.exitCodes).toEqual([0]);
      expect(rawConfig.stderr).toBe("");
      expect(JSON.parse(rawConfig.stdout)).toEqual({});

      const artifactRoots = await runResolve([
        "resolve",
        "artifact-roots",
        "--project-root",
        tempRoot,
      ]);
      expect(artifactRoots.exitCodes).toEqual([0]);
      expect(artifactRoots.stderr).toBe("");
      const parsed = ResolveArtifactRootsOutputSchema.parse(JSON.parse(artifactRoots.stdout));
      expect(parsed.schemaVersion).toBe("speclite.resolve.artifact-roots.v1");
      expect(parsed.lifecycle).toBe("existing");
      expect(parsed.configSources["modules.sdlc.planning_artifacts"]).toMatchObject({
        affectedPath: "_speclite/config.toml",
        role: "required-config",
      });
      expect(parsed.roots.find((root) => root.field === "analysis_artifacts")).toMatchObject({
        configPath: "modules.sdlc.analysis_artifacts",
        resolvedRoot: "_speclite-output/planning-artifacts",
        resolutionMode: "legacy-compatible",
        plane: "analysis",
        ownership: "workflow-owned",
      });
      expect(artifactRoots.stdout).not.toContain(tempRoot);
      expect(artifactRoots.stderr).not.toContain(tempRoot);

      const freshArtifactRoots = await runResolve([
        "resolve",
        "artifact-roots",
        "--project-root",
        tempRoot,
        "--lifecycle",
        "fresh",
      ]);
      expect(freshArtifactRoots.exitCodes).toEqual([0]);
      expect(freshArtifactRoots.stderr).toBe("");
      const freshParsed = ResolveArtifactRootsOutputSchema.parse(JSON.parse(freshArtifactRoots.stdout));
      expect(freshParsed.roots.find((root) => root.field === "analysis_artifacts")).toMatchObject({
        resolvedRoot: "_speclite-output/1-analysis-artifacts",
        resolutionMode: "fresh-default",
      });
      expect(freshParsed.configSources["core.output_folder"]).toMatchObject({
        affectedPath: "_speclite/config.toml",
        role: "required-config",
      });
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("exposes fresh defaults without config while preserving existing and raw-config required failures", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-resolve-artifact-roots-fresh-empty-"));
    try {
      const fresh = await runResolve([
        "resolve",
        "artifact-roots",
        "--project-root",
        tempRoot,
        "--lifecycle",
        "fresh",
      ]);
      expect(fresh.exitCodes).toEqual([0]);
      expect(fresh.stderr).toBe("");
      const parsed = ResolveArtifactRootsOutputSchema.parse(JSON.parse(fresh.stdout));
      expect(parsed.lifecycle).toBe("fresh");
      expect(parsed.configSources).toEqual({});
      expect(parsed.roots).toHaveLength(7);
      expect(parsed.roots.every((root) => root.resolutionMode === "fresh-default")).toBe(true);

      const existing = await runResolve([
        "resolve",
        "artifact-roots",
        "--project-root",
        tempRoot,
        "--lifecycle",
        "existing",
      ]);
      expect(existing.exitCodes).toEqual([1]);
      expect(existing.stdout).toBe("");
      expect(JSON.parse(existing.stderr)).toMatchObject({
        issueId: "runtime-path.missing-entry",
        affectedPath: "_speclite/config.toml",
      });

      const rawConfig = await runResolve(["resolve", "config", "--project-root", tempRoot]);
      expect(rawConfig.exitCodes).toEqual([1]);
      expect(rawConfig.stdout).toBe("");
      expect(JSON.parse(rawConfig.stderr)).toMatchObject({
        issueId: "runtime-path.missing-entry",
        affectedPath: "_speclite/config.toml",
      });
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("returns warning diagnostics for optional parse failures and blocks required failures", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-config-failures-"));
    try {
      await writeProjectFile(tempRoot, "_speclite/config.toml", "[core]\nproject_name = \"Base\"\n");
      await writeProjectFile(tempRoot, "_speclite/custom/config.toml", "[core\nbroken = true\n");

      const warningResult = await resolveProjectConfig({ projectRoot: tempRoot });
      expect(warningResult.exitCode).toBe(0);
      expect(warningResult.value).toEqual({ core: { project_name: "Base" } });
      expect(warningResult.issues).toHaveLength(1);
      expect(ResolveStderrJsonLineSchema.parse(warningResult.issues[0])).toMatchObject({
        issueId: "manifest-schema.malformed-field",
        severity: "warning",
        affectedPath: "_speclite/custom/config.toml",
      });
      expect(JSON.stringify(warningResult.issues[0])).not.toContain(tempRoot);

      const missingRequiredRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-config-missing-"));
      const errorResult = await resolveProjectConfig({ projectRoot: missingRequiredRoot });
      expect(errorResult.exitCode).toBe(1);
      expect(errorResult.value).toEqual({});
      expect(errorResult.issues[0]).toMatchObject({
        issueId: "runtime-path.missing-entry",
        severity: "error",
        affectedPath: "_speclite/config.toml",
      });
      await rm(missingRequiredRoot, { recursive: true, force: true });
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });
});

describe("resolve customization reader", () => {
  it("merges skill defaults with basename-keyed team and user custom layers", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-custom-reader-"));
    try {
      const skillDir = path.join(tempRoot, ".claude/skills/speclite-create-story");
      await writeProjectFile(tempRoot, ".claude/skills/speclite-create-story/customize.toml", [
        "[workflow]",
        'on_complete = "base"',
        'persistent_facts = ["base"]',
        "",
        "[[workflow.activation_steps_prepend]]",
        'code = "load"',
        'text = "base"',
      ].join("\n"));
      await writeProjectFile(tempRoot, "_speclite/custom/speclite-create-story.toml", [
        "[workflow]",
        'persistent_facts = ["team"]',
        "",
        "[[workflow.activation_steps_prepend]]",
        'code = "load"',
        'text = "team"',
      ].join("\n"));
      await writeProjectFile(tempRoot, "_speclite/custom/speclite-create-story.user.toml", [
        "[workflow]",
        'on_complete = "用户完成"',
      ].join("\n"));

      const result = await resolveSkillCustomization({
        skillDir,
        projectRoot: tempRoot,
        keys: ["workflow.on_complete", "workflow.persistent_facts", "missing.value"],
      });

      expect(result.exitCode).toBe(0);
      expect(result.issues).toEqual([]);
      expect(result.value).toEqual({
        "workflow.on_complete": "用户完成",
        "workflow.persistent_facts": ["base", "team"],
      });
      expect(result.sources).toMatchObject({
        "workflow.on_complete": {
          affectedPath: "_speclite/custom/speclite-create-story.user.toml",
          role: "user-custom",
        },
        "workflow.persistent_facts": {
          affectedPath: "_speclite/custom/speclite-create-story.toml",
          role: "team-custom",
        },
      });
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("fails missing customization defaults instead of manufacturing synthetic defaults", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-custom-missing-"));
    try {
      await mkdir(path.join(tempRoot, ".agents/skills/plain-skill"), { recursive: true });
      const result = await resolveSkillCustomization({
        skillDir: path.join(tempRoot, ".agents/skills/plain-skill"),
        projectRoot: tempRoot,
      });

      expect(result.exitCode).toBe(1);
      expect(result.value).toEqual({});
      expect(result.issues[0]).toMatchObject({
        issueId: "runtime-path.missing-entry",
        affectedPath: "customize.toml",
        severity: "error",
      });
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });
});

async function writeProjectFile(projectRoot: string, relativePath: string, contents: string): Promise<void> {
  const filePath = path.join(projectRoot, relativePath);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${contents}\n`, "utf8");
}

async function runResolve(args: string[]) {
  const stdout: string[] = [];
  const stderr: string[] = [];
  const exitCodes: number[] = [];
  const program = createSpecliteProgram({
    io: {
      stdout: (text) => stdout.push(text),
      stderr: (text) => stderr.push(text),
      setExitCode: (code) => exitCodes.push(code),
    },
  });

  await program.parseAsync(["node", "speclite", ...args], { from: "node" });

  return {
    stdout: stdout.join(""),
    stderr: stderr.join(""),
    exitCodes,
  };
}
