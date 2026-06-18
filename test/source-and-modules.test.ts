import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  discoverBundledSourceDescriptor,
  createMissingBundledSourceEvidenceIssue,
} from "../src/source/source-discovery.js";
import {
  discoverOfficialModules,
  ModuleMetadataError,
} from "../src/modules/module-metadata.js";
import { createModuleSelection } from "../src/modules/module-selection.js";
import { runInstallCommand } from "../src/commands/install.js";

const EXPECTED_CORE_PACKAGE_ROOT_COUNT = 13;
const EXPECTED_SDLC_PACKAGE_ROOT_COUNT = 48;
const EXPECTED_DEFAULT_CANONICAL_PACKAGE_ROOT_COUNT = 61;

describe("bundled source descriptor discovery", () => {
  it("projects bundled official source through a display-safe SourceDescriptor", async () => {
    const descriptor = await discoverBundledSourceDescriptor({
      projectRoot: process.cwd(),
    });

    expect(descriptor).toMatchObject({
      sourceType: "bundled",
      resolvedRoot: "assets/source/speclite",
      trustStatus: "trusted",
    });
    expect(descriptor.integrityEvidence).toEqual([
      expect.objectContaining({
        kind: "version-lock",
        packageName: "@fancyliu/speclite",
        version: "0.3.0",
        lockPath: "package-lock.json",
        verified: true,
      }),
    ]);
    expect(JSON.stringify(descriptor)).not.toContain(os.homedir());
    expect(JSON.stringify(descriptor)).not.toContain(process.cwd());
  });

  it("returns source-integrity.missing-evidence when package evidence is unavailable", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-missing-evidence-"));

    try {
      const descriptor = await discoverBundledSourceDescriptor({ projectRoot: tempRoot });
      const issue = createMissingBundledSourceEvidenceIssue();

      expect(descriptor).toMatchObject({
        sourceType: "bundled",
        resolvedRoot: "assets/source/speclite",
        trustStatus: "blocked",
        integrityEvidence: [],
      });
      expect(issue).toMatchObject({
        issueId: "source-integrity.missing-evidence",
        category: "source-integrity",
        severity: "error",
        component: "bundled-source",
      });
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("uses the release packaging manifest as bundled source evidence when package-lock is not published", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-packaging-manifest-evidence-"));

    try {
      await mkdir(path.join(tempRoot, "dist"), { recursive: true });
      await writeFile(
        path.join(tempRoot, "dist/packaging-manifest.json"),
        JSON.stringify({
          schemaVersion: "speclite.packaging-manifest.v1",
          packageJson: {
            name: "@fancyliu/speclite",
            version: "0.3.0",
          },
          packageHash: "sha256:packaged-source",
        }),
        "utf8",
      );

      const descriptor = await discoverBundledSourceDescriptor({ projectRoot: tempRoot });

      expect(descriptor).toMatchObject({
        sourceType: "bundled",
        resolvedRoot: "assets/source/speclite",
        trustStatus: "trusted",
      });
      expect(descriptor.integrityEvidence).toEqual([
        {
          kind: "version-lock",
          packageName: "@fancyliu/speclite",
          version: "0.3.0",
          lockPath: "dist/packaging-manifest.json",
          verified: true,
        },
        {
          kind: "content-hash",
          algorithm: "sha256",
          value: "sha256:packaged-source",
          verified: true,
        },
      ]);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });
});

describe("official module metadata parser", () => {
  it("discovers core and sdlc modules with stable ids, versions and package roots", async () => {
    const modules = await discoverOfficialModules({
      projectRoot: process.cwd(),
    });
    const coreModule = modules.find((module) => module.code === "core")!;
    const sdlcModule = modules.find((module) => module.code === "sdlc")!;

    expect(modules.map((module) => module.code)).toEqual(["core", "sdlc"]);
    expect(modules).toEqual([
      expect.objectContaining({
        code: "core",
        name: "SpecLite Core Module",
        version: "0.0.0",
        required: true,
        defaultSelected: false,
      }),
      expect.objectContaining({
        code: "sdlc",
        name: "SpecLite SDLC Module",
        version: "0.0.0",
        defaultSelected: true,
        requiredDependencies: ["core"],
      }),
    ]);
    expect(coreModule.packageRoots).toHaveLength(EXPECTED_CORE_PACKAGE_ROOT_COUNT);
    expect(sdlcModule.packageRoots).toHaveLength(EXPECTED_SDLC_PACKAGE_ROOT_COUNT);
    expect(coreModule.packageRoots.length + sdlcModule.packageRoots.length).toBe(
      EXPECTED_DEFAULT_CANONICAL_PACKAGE_ROOT_COUNT,
    );
    expect(sortedPackageSkillIds(coreModule)).toEqual(uniqueSortedHelpSkillIds(coreModule));
    expect(sortedPackageSkillIds(sdlcModule)).toEqual(uniqueSortedHelpSkillIds(sdlcModule));
    expect(coreModule.packageRoots).toEqual(
      expect.arrayContaining([
        "speclite-advanced-elicitation",
        "speclite-review-acceptance-auditor",
      ]),
    );
    expect(sdlcModule.packageRoots).toEqual(
      expect.arrayContaining([
        "1-analysis/speclite-agent-analyst",
        "2-plan-workflows/speclite-agent-pm",
        "2-plan-workflows/speclite-agent-ux-designer",
        "3-solutioning/speclite-agent-architect",
        "4-implementation/speclite-agent-dev",
        "4-implementation/speclite-dev-story",
        "4-implementation/speclite-qa-write-test-guide",
        "5-devops/speclite-npm-publisher",
      ]),
    );
    expect(
      sdlcModule.helpEntries.find((entry) => entry.canonicalSkillId === "speclite-create-prd"),
    ).toMatchObject({
      canonicalSkillId: "speclite-create-prd",
      displayName: "Create PRD",
      phaseId: "2-planning",
      outputLocation: "{planning_artifacts}",
      outputArtifactType: "prd",
      required: true,
    });
  });

  it("rejects metadata missing an explicit module version", async () => {
    const sourceRoot = await createModuleFixture({
      "sample/module.yaml": [
        "code: sample",
        'name: "Sample Module"',
        'description: "Missing version fixture"',
        "",
      ].join("\n"),
      "sample/module-help.csv": "module,skill,display-name\nSample,_meta,\n",
      "sample/sample-skill/SKILL.md": "# Sample\n",
    });

    try {
      await expect(discoverOfficialModules({ sourceRoot })).rejects.toMatchObject({
        code: "module-metadata.missing-required-field",
      });
    } finally {
      await rm(path.dirname(sourceRoot), { recursive: true, force: true });
    }
  });

  it("rejects duplicate module codes and duplicate skill ids deterministically", async () => {
    const duplicateModuleRoot = await createModuleFixture({
      "a/module.yaml": [
        "code: dup",
        'name: "A"',
        "version: 1.0.0",
        'description: "A"',
        "",
      ].join("\n"),
      "a/module-help.csv": "module,skill,display-name\nA,_meta,\n",
      "a/a-skill/SKILL.md": "# A\n",
      "b/module.yaml": [
        "code: dup",
        'name: "B"',
        "version: 1.0.0",
        'description: "B"',
        "",
      ].join("\n"),
      "b/module-help.csv": "module,skill,display-name\nB,_meta,\n",
      "b/b-skill/SKILL.md": "# B\n",
    });
    const duplicateSkillRoot = await createModuleFixture({
      "a/module.yaml": [
        "code: a",
        'name: "A"',
        "version: 1.0.0",
        'description: "A"',
        "",
      ].join("\n"),
      "a/module-help.csv": "module,skill,display-name\nA,_meta,\n",
      "a/shared/SKILL.md": "# A\n",
      "b/module.yaml": [
        "code: b",
        'name: "B"',
        "version: 1.0.0",
        'description: "B"',
        "",
      ].join("\n"),
      "b/module-help.csv": "module,skill,display-name\nB,_meta,\n",
      "b/shared/SKILL.md": "# B\n",
    });

    try {
      await expect(discoverOfficialModules({ sourceRoot: duplicateModuleRoot })).rejects.toEqual(
        new ModuleMetadataError("module-metadata.duplicate-code", "Duplicate module code: dup"),
      );
      await expect(discoverOfficialModules({ sourceRoot: duplicateSkillRoot })).rejects.toEqual(
        new ModuleMetadataError("module-metadata.duplicate-skill-id", "Duplicate skill id: shared"),
      );
    } finally {
      await rm(path.dirname(duplicateModuleRoot), { recursive: true, force: true });
      await rm(path.dirname(duplicateSkillRoot), { recursive: true, force: true });
    }
  });

  it("rejects required dependencies that do not point to discovered module ids", async () => {
    const sourceRoot = await createModuleFixture({
      "sdlc/module.yaml": [
        "code: sdlc",
        'name: "SDLC"',
        "version: 1.0.0",
        'description: "SDLC"',
        "required_dependencies:",
        "  - missing-core",
        "",
      ].join("\n"),
      "sdlc/module-help.csv": "module,skill,display-name\nSDLC,_meta,\n",
      "sdlc/sdlc-skill/SKILL.md": "# SDLC\n",
    });

    try {
      await expect(discoverOfficialModules({ sourceRoot })).rejects.toEqual(
        new ModuleMetadataError(
          "module-metadata.unknown-required-dependency",
          "Module sdlc requires unknown module: missing-core",
        ),
      );
    } finally {
      await rm(path.dirname(sourceRoot), { recursive: true, force: true });
    }
  });

  it("rejects module-help.csv entries that do not point to canonical package roots", async () => {
    const sourceRoot = await createModuleFixture({
      "sdlc/module.yaml": [
        "code: sdlc",
        'name: "SDLC"',
        "version: 1.0.0",
        'description: "SDLC"',
        "",
      ].join("\n"),
      "sdlc/module-help.csv": [
        "module,skill,display-name,phase",
        "SDLC,_meta,,",
        "SDLC,missing-skill,Missing Skill,4-implementation",
        "SDLC,sdlc-skill,SDLC Skill,4-implementation",
        "",
      ].join("\n"),
      "sdlc/sdlc-skill/SKILL.md": "# SDLC\n",
    });

    try {
      await expect(discoverOfficialModules({ sourceRoot })).rejects.toEqual(
        new ModuleMetadataError(
          "module-metadata.unknown-help-skill",
          "Module sdlc has module-help.csv entries for missing canonical skill package roots: missing-skill",
        ),
      );
    } finally {
      await rm(path.dirname(sourceRoot), { recursive: true, force: true });
    }
  });

  it("reports missing canonical skill package references with reserved menu-target diagnostics during install", async () => {
    const sourceRoot = await createModuleFixture({
      "sdlc/module.yaml": [
        "code: sdlc",
        'name: "SDLC"',
        "version: 1.0.0",
        'description: "SDLC"',
        "",
      ].join("\n"),
      "sdlc/module-help.csv": [
        "module,skill,display-name,phase",
        "SDLC,_meta,,",
        "SDLC,missing-skill,Missing Skill,4-implementation",
        "SDLC,sdlc-skill,SDLC Skill,4-implementation",
        "",
      ].join("\n"),
      "sdlc/sdlc-skill/SKILL.md": "# SDLC\n",
    });
    const packageRoot = path.resolve(sourceRoot, "../../..");
    await writeFile(
      path.join(packageRoot, "package-lock.json"),
      JSON.stringify({ name: "speclite", version: "0.0.0" }),
      "utf8",
    );

    try {
      const outcome = await runInstallCommand({
        projectRoot: packageRoot,
        options: { yes: true },
        runtime: {
          nodeVersion: "v22.12.0",
          platform: "darwin",
          platformRelease: "23.0.0",
          cwd: packageRoot,
        },
      });

      expect(outcome.exitCode).toBe(1);
      expect(outcome.result.issues).toEqual([
        expect.objectContaining({
          issueId: "menu-target.unknown-skill",
          category: "menu-target",
          severity: "error",
          component: "official-module-discovery",
        }),
      ]);
      expect(JSON.stringify(outcome.result)).not.toContain(packageRoot);
    } finally {
      await rm(packageRoot, { recursive: true, force: true });
    }
  });
});

describe("official module selection", () => {
  it("keeps required, default and user-selected modules distinguishable and ordered", async () => {
    const modules = await discoverOfficialModules({ projectRoot: process.cwd() });
    const selection = createModuleSelection({
      modules,
      userSelectedModuleIds: ["sdlc"],
    });

    expect(selection.selectedModuleIds).toEqual(["core", "sdlc"]);
    expect(selection.requiredModuleIds).toEqual(["core"]);
    expect(selection.defaultSelectedModuleIds).toEqual(["sdlc"]);
    expect(selection.userSelectedModuleIds).toEqual(["sdlc"]);
    expect(selection.invalidModuleIds).toEqual([]);
  });

  it("reports invalid module ids without changing the deterministic selected set", async () => {
    const modules = await discoverOfficialModules({ projectRoot: process.cwd() });
    const selection = createModuleSelection({
      modules,
      userSelectedModuleIds: ["missing", "sdlc"],
    });

    expect(selection.selectedModuleIds).toEqual(["core", "sdlc"]);
    expect(selection.invalidModuleIds).toEqual(["missing"]);
  });
});

async function createModuleFixture(files: Record<string, string>): Promise<string> {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-module-fixture-"));
  const sourceRoot = path.join(tempRoot, "assets/source/speclite");

  for (const [relativePath, contents] of Object.entries(files)) {
    const filePath = path.join(sourceRoot, relativePath);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, contents, "utf8");
  }

  return sourceRoot;
}

function sortedPackageSkillIds(input: { packageRoots: string[] }): string[] {
  return input.packageRoots.map((packageRoot) => path.posix.basename(packageRoot)).sort();
}

function uniqueSortedHelpSkillIds(input: {
  helpEntries: Array<{ canonicalSkillId: string }>;
}): string[] {
  return [...new Set(input.helpEntries.map((entry) => entry.canonicalSkillId))].sort();
}
