import { mkdir, mkdtemp, rm, stat, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { copyCanonicalPackage, isInstallableCanonicalPackageFile } from "../src/fs/copy-tree.js";
import { writeIdeMirrors } from "../src/ide/target-writer.js";
import { hashPackageDirectory } from "../src/manifest/hash.js";
import type { ArtifactRootContext } from "../src/manifest/manifest-generator.js";
import type { OfficialModule } from "../src/modules/module-metadata.js";

const artifactRoots: ArtifactRootContext = {
  output_folder: "_speclite-output",
  planning_artifacts: "_speclite-output/planning-artifacts",
  implementation_artifacts: "_speclite-output/implementation-artifacts",
  project_knowledge: "docs",
};

describe("self-contained IDE skill entry writer", () => {
  it("copies only installable canonical package files and preserves executable intent", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-target-writer-"));
    const sourceRoot = path.join(tempRoot, "source/speclite-sample");
    const projectRoot = path.join(tempRoot, "project");

    try {
      await mkdir(path.join(sourceRoot, "references"), { recursive: true });
      await mkdir(path.join(sourceRoot, "scripts"), { recursive: true });
      await mkdir(projectRoot, { recursive: true });
      await writeFile(path.join(sourceRoot, "SKILL.md"), "# Skill\n", "utf8");
      await writeFile(path.join(sourceRoot, "SKILL.en.md"), "# Skill EN\n", "utf8");
      await writeFile(path.join(sourceRoot, "customize.toml"), "[workflow]\n", "utf8");
      await writeFile(path.join(sourceRoot, "references/details.md"), "# Details\n", "utf8");
      await writeFile(path.join(sourceRoot, "scripts/run.sh"), "#!/usr/bin/env sh\n", {
        mode: 0o755,
      });

      const result = await copyCanonicalPackage({
        projectRoot,
        sourcePackageRoot: sourceRoot,
        sourceRefRoot: "assets/source/speclite/core-skills/speclite-sample",
        targetEntryRoot: ".agents/skills/speclite-sample",
      });

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.files.map((file) => file.path).sort()).toEqual([
        ".agents/skills/speclite-sample/SKILL.md",
        ".agents/skills/speclite-sample/customize.toml",
        ".agents/skills/speclite-sample/references/details.md",
        ".agents/skills/speclite-sample/scripts/run.sh",
      ]);
      expect(
        result.files.find((file) => file.path.endsWith("scripts/run.sh")),
      ).toMatchObject({
        executable: true,
        sourceRef: "assets/source/speclite/core-skills/speclite-sample/scripts/run.sh",
      });
      await expect(
        stat(path.join(projectRoot, ".agents/skills/speclite-sample/SKILL.en.md")),
      ).rejects.toMatchObject({
        code: "ENOENT",
      });
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("records the canonical package hash from the installed entry surface", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-target-writer-hash-"));
    const sourceRoot = path.join(tempRoot, "assets/source/speclite/core-skills/speclite-sample");
    const projectRoot = path.join(tempRoot, "project");

    try {
      await mkdir(path.join(sourceRoot, "references"), { recursive: true });
      await mkdir(projectRoot, { recursive: true });
      await writeFile(path.join(sourceRoot, "SKILL.md"), "# Skill\n", "utf8");
      await writeFile(path.join(sourceRoot, "SKILL.en.md"), "# Source only\n", "utf8");
      await writeFile(path.join(sourceRoot, "references/details.md"), "# Details\n", "utf8");

      const fullSourceHash = await hashPackageDirectory(sourceRoot);
      const installedSurfaceHash = await hashPackageDirectory(sourceRoot, {
        include: isInstallableCanonicalPackageFile,
      });
      expect(fullSourceHash).not.toBe(installedSurfaceHash);

      const result = await writeIdeMirrors({
        projectRoot,
        packageRoot: tempRoot,
        selectedModules: [createSampleModule()],
        targetAdapters: [
          { targetId: "claude", targetDirectory: ".claude/skills", status: "planned" },
          { targetId: "agents", targetDirectory: ".agents/skills", status: "planned" },
        ],
        artifactRoots,
      });

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.skillIndexEntries).toHaveLength(1);
      expect(result.helpIndexEntries).toEqual([
        expect.objectContaining({
          canonicalSkillId: "speclite-sample",
          activationTarget: ".claude/skills/speclite-sample/SKILL.md",
          targetIds: ["claude", "agents"],
        }),
      ]);
      expect(result.phaseCoverageRows[0].ideTargets).toEqual([
        {
          targetId: "claude",
          entryPath: ".claude/skills/speclite-sample",
          activationTarget: ".claude/skills/speclite-sample/SKILL.md",
          status: "mapped",
        },
        {
          targetId: "agents",
          entryPath: ".agents/skills/speclite-sample",
          activationTarget: ".agents/skills/speclite-sample/SKILL.md",
          status: "mapped",
        },
      ]);
      expect(result.skillIndexEntries[0].canonicalPackageHash).toBe(installedSurfaceHash);
      expect(result.skillIndexEntries[0].canonicalPackageHash).not.toBe(fullSourceHash);
      await expect(
        hashPackageDirectory(path.join(projectRoot, ".claude/skills/speclite-sample")),
      ).resolves.toBe(installedSurfaceHash);
      await expect(
        hashPackageDirectory(path.join(projectRoot, ".agents/skills/speclite-sample")),
      ).resolves.toBe(installedSurfaceHash);
      await expect(
        stat(path.join(projectRoot, ".claude/skills/speclite-sample/SKILL.en.md")),
      ).rejects.toMatchObject({
        code: "ENOENT",
      });
      await expect(
        stat(path.join(projectRoot, ".agents/skills/speclite-sample/SKILL.en.md")),
      ).rejects.toMatchObject({
        code: "ENOENT",
      });
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("does not create an empty entry when canonical SKILL.md is missing", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-target-writer-missing-"));
    const sourceRoot = path.join(tempRoot, "source/speclite-missing");
    const projectRoot = path.join(tempRoot, "project");

    try {
      await mkdir(sourceRoot, { recursive: true });
      await mkdir(projectRoot, { recursive: true });
      await writeFile(path.join(sourceRoot, "README.md"), "# Missing\n", "utf8");

      const result = await copyCanonicalPackage({
        projectRoot,
        sourcePackageRoot: sourceRoot,
        sourceRefRoot: "assets/source/speclite/core-skills/speclite-missing",
        targetEntryRoot: ".agents/skills/speclite-missing",
      });

      expect(result).toEqual({
        ok: false,
        issue: expect.objectContaining({
          issueId: "menu-target.missing-target",
          category: "menu-target",
          severity: "error",
          affectedPath: "assets/source/speclite/core-skills/speclite-missing",
        }),
      });
      await expect(
        stat(path.join(projectRoot, ".agents/skills/speclite-missing")),
      ).rejects.toMatchObject({
        code: "ENOENT",
      });
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });
});

function createSampleModule(): OfficialModule {
  return {
    code: "core",
    name: "Core",
    description: "Core module",
    version: "0.0.0",
    sourceDirectory: "core-skills",
    defaultSelected: true,
    required: true,
    requiredDependencies: [],
    packageRoots: ["speclite-sample"],
    capabilitySummary: [],
    helpEntries: [
      {
        canonicalSkillId: "speclite-sample",
        displayName: "Sample",
        phaseId: "anytime",
        required: true,
      },
    ],
    directories: [],
    configPrompts: [],
  };
}
