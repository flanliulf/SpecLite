import { mkdtemp, mkdir, readFile, writeFile, rm } from "node:fs/promises";
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

const EXPECTED_CORE_PACKAGE_ROOT_COUNT = 19;
const EXPECTED_SDLC_PACKAGE_ROOT_COUNT = 50;
const EXPECTED_DEFAULT_CANONICAL_PACKAGE_ROOT_COUNT = 69;

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
        version: "0.4.1",
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
            version: "0.4.1",
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
          version: "0.4.1",
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

describe("ecosystem authoring guidance", () => {
  it("documents ecosystem module authoring contracts and support skill routing", async () => {
    const [
      sourceReadme,
      canonicalLayout,
      modulesExplanation,
      supportSkills,
      creatorEntry,
      creatorWorkflow,
      lintEntry,
      lintRules,
    ] = await Promise.all(
      [
        "assets/source/speclite/README.md",
        "docs/reference/canonical-source-layout.md",
        "docs/explanation/speclite-modules.md",
        "docs/reference/skills/support-skills.md",
        "assets/source/speclite/support-skills/speclite-skill-creator/SKILL.md",
        "assets/source/speclite/support-skills/speclite-skill-creator/references/skill-creation-workflow.md",
        "assets/source/speclite/support-skills/speclite-skill-lint/SKILL.md",
        "assets/source/speclite/support-skills/speclite-skill-lint/references/check-rules.md",
      ].map((filePath) => readFile(path.join(process.cwd(), filePath), "utf8")),
    );

    expect(sourceReadme).toContain("Ecosystem Authoring Contract");
    expect(sourceReadme).toContain("assets/source/speclite/ecosystems/<category>/<id>/<skill-name>/");
    expect(sourceReadme).toContain("module_kind: ecosystem");
    expect(sourceReadme).toContain("module-help.csv");
    expect(sourceReadme).toContain("generic SDLC workflow");
    expect(sourceReadme).toContain("support-skills/` 不属于 default install module");
    expect(sourceReadme).toContain("Other Category Admission");
    expect(sourceReadme).toContain("why-not-frontend");
    expect(sourceReadme).toContain("why-not-backend");
    expect(sourceReadme).toContain("other/misc");
    expect(sourceReadme).toContain("other/general");
    expect(sourceReadme).toContain("other/tools");

    expect(canonicalLayout).toContain("Bounded Nested Ecosystem Modules");
    expect(canonicalLayout).toContain("ecosystems/<category>/<id>/module.yaml");
    expect(canonicalLayout).toContain("selected-only");
    expect(canonicalLayout).toContain("Source Path | Installed Runtime Path");
    expect(canonicalLayout).toContain("Other Category Admission");
    expect(canonicalLayout).toContain("stable project shape");

    expect(modulesExplanation).toContain("Ecosystem Modules");
    expect(modulesExplanation).toContain("optional extension module");
    expect(modulesExplanation).toContain("required_dependencies: [sdlc]");
    expect(modulesExplanation).toContain("不会改变 `core` / `sdlc` 默认行为");
    expect(modulesExplanation).toContain("npm package");
    expect(modulesExplanation).toContain("CLI tool");
    expect(modulesExplanation).toContain("documentation-only project");

    expect(supportSkills).toContain("selected module truth");
    expect(supportSkills).not.toMatch(/core=\d+`?、`?sdlc=\d+`?、`?total=\d+/);

    expect(creatorEntry).toContain("ecosystems/<category>/<id>");
    expect(creatorWorkflow).toContain("assets/source/speclite/ecosystems/<category>/<id>/<skill-name>/");
    expect(creatorWorkflow).toContain("ecosystem_id");
    expect(creatorWorkflow).toContain("ecosystem-<category>-<id>");
    expect(creatorWorkflow).toContain("module-help row");
    expect(creatorWorkflow).toContain("why-not-frontend");
    expect(creatorWorkflow).toContain("why-not-backend");
    expect(creatorWorkflow).toContain("speclite-agent-creator");

    expect(lintEntry).toContain("ecosystem");
    expect(lintRules).toContain("ECO-01");
    expect(lintRules).toContain("ECO-07");
    expect(lintRules).toContain("assets/source/speclite/ecosystems/<category>/<id>/<skill>/");
    expect(lintRules).toContain("module-help.csv");
    expect(lintRules).toContain("CHANGELOG.md");
    expect(lintRules).toContain("SKILL.en.md");
  });
});

describe("official module metadata parser", () => {
  it("discovers core and sdlc modules with stable ids, versions and package roots", async () => {
    const modules = await discoverOfficialModules({
      projectRoot: process.cwd(),
    });
    const coreModule = modules.find((module) => module.code === "core")!;
    const sdlcModule = modules.find((module) => module.code === "sdlc")!;

    expect(modules.map((module) => module.code)).toEqual([
      "core",
      "ecosystem-backend-java-springboot",
      "ecosystem-backend-nodejs",
      "ecosystem-backend-python",
      "ecosystem-frontend-react",
      "ecosystem-frontend-vue",
      "ecosystem-other-cli-tool",
      "ecosystem-other-documentation-only",
      "ecosystem-other-npm-package",
      "sdlc",
    ]);
    expect(modules).toEqual([
      expect.objectContaining({
        code: "core",
        name: "SpecLite Core Module",
        version: "0.0.0",
        required: true,
        defaultSelected: false,
      }),
      expect.objectContaining({
        code: "ecosystem-backend-java-springboot",
        sourceDirectory: "ecosystems/backend/java-springboot",
        moduleKind: "ecosystem",
        ecosystemCategory: "backend",
        ecosystemId: "java-springboot",
        defaultSelected: false,
        required: false,
        requiredDependencies: ["sdlc"],
      }),
      expect.objectContaining({
        code: "ecosystem-backend-nodejs",
        sourceDirectory: "ecosystems/backend/nodejs",
        moduleKind: "ecosystem",
        ecosystemCategory: "backend",
        ecosystemId: "nodejs",
        defaultSelected: false,
        required: false,
        requiredDependencies: ["sdlc"],
      }),
      expect.objectContaining({
        code: "ecosystem-backend-python",
        sourceDirectory: "ecosystems/backend/python",
        moduleKind: "ecosystem",
        ecosystemCategory: "backend",
        ecosystemId: "python",
        defaultSelected: false,
        required: false,
        requiredDependencies: ["sdlc"],
      }),
      expect.objectContaining({
        code: "ecosystem-frontend-react",
        sourceDirectory: "ecosystems/frontend/react",
        moduleKind: "ecosystem",
        ecosystemCategory: "frontend",
        ecosystemId: "react",
        defaultSelected: false,
        required: false,
        requiredDependencies: ["sdlc"],
      }),
      expect.objectContaining({
        code: "ecosystem-frontend-vue",
        sourceDirectory: "ecosystems/frontend/vue",
        moduleKind: "ecosystem",
        ecosystemCategory: "frontend",
        ecosystemId: "vue",
        defaultSelected: false,
        required: false,
        requiredDependencies: ["sdlc"],
      }),
      expect.objectContaining({
        code: "ecosystem-other-cli-tool",
        sourceDirectory: "ecosystems/other/cli-tool",
        moduleKind: "ecosystem",
        ecosystemCategory: "other",
        ecosystemId: "cli-tool",
        defaultSelected: false,
        required: false,
        requiredDependencies: ["sdlc"],
      }),
      expect.objectContaining({
        code: "ecosystem-other-documentation-only",
        sourceDirectory: "ecosystems/other/documentation-only",
        moduleKind: "ecosystem",
        ecosystemCategory: "other",
        ecosystemId: "documentation-only",
        defaultSelected: false,
        required: false,
        requiredDependencies: ["sdlc"],
      }),
      expect.objectContaining({
        code: "ecosystem-other-npm-package",
        sourceDirectory: "ecosystems/other/npm-package",
        moduleKind: "ecosystem",
        ecosystemCategory: "other",
        ecosystemId: "npm-package",
        defaultSelected: false,
        required: false,
        requiredDependencies: ["sdlc"],
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
        "speclite-domain-modeling",
        "speclite-terminology-governance",
        "speclite-grill-with-docs",
        "speclite-grilling",
        "speclite-handoff",
        "speclite-review-acceptance-auditor",
      ]),
    );
    expect(sdlcModule.packageRoots).toEqual(
      expect.arrayContaining([
        "1-analysis/speclite-agent-analyst",
        "1-analysis/speclite-brownfield-backend-tech-stack-digger",
        "2-plan-workflows/speclite-agent-pm",
        "2-plan-workflows/speclite-agent-ux-designer",
        "3-solutioning/speclite-agent-architect",
        "4-implementation/speclite-agent-dev",
        "4-implementation/speclite-dev-story",
        "4-implementation/speclite-qa-write-test-guide",
        "5-devops/speclite-npm-publisher",
      ]),
    );
    expect(sdlcModule.packageRoots).not.toEqual(
      expect.arrayContaining([
        "1-analysis/speclite-brownfield-java-springboot-backend-tech-stack-digger",
        "1-analysis/speclite-brownfield-nodejs-backend-tech-stack-digger",
        "1-analysis/speclite-brownfield-python-backend-tech-stack-digger",
      ]),
    );
    expect(
      modules.find((module) => module.code === "ecosystem-backend-java-springboot")?.packageRoots,
    ).toEqual(["speclite-brownfield-java-springboot-backend-tech-stack-digger"]);
    expect(
      modules.find((module) => module.code === "ecosystem-frontend-react")?.packageRoots,
    ).toEqual(["speclite-react-project-context-and-review"]);
    expect(
      modules.find((module) => module.code === "ecosystem-frontend-vue")?.packageRoots,
    ).toEqual(["speclite-vue-project-context-and-review"]);
    expect(
      modules.find((module) => module.code === "ecosystem-other-npm-package")?.packageRoots,
    ).toEqual(["speclite-npm-package-project-auditor"]);
    expect(
      modules.find((module) => module.code === "ecosystem-other-cli-tool")?.packageRoots,
    ).toEqual(["speclite-cli-tool-contract-auditor"]);
    expect(
      modules.find((module) => module.code === "ecosystem-other-documentation-only")?.packageRoots,
    ).toEqual(["speclite-documentation-only-project-auditor"]);
    expect(
      modules.find((module) => module.code === "ecosystem-frontend-react")?.helpEntries,
    ).toEqual([
      expect.objectContaining({
        canonicalSkillId: "speclite-react-project-context-and-review",
        displayName: "React Project Context And Review",
        phaseId: "3-solutioning",
        outputLocation: "{project_knowledge}/frontend|{planning_artifacts}",
        outputArtifactType: "react project context and review",
        required: false,
      }),
    ]);
    expect(
      modules.find((module) => module.code === "ecosystem-frontend-vue")?.helpEntries,
    ).toEqual([
      expect.objectContaining({
        canonicalSkillId: "speclite-vue-project-context-and-review",
        displayName: "Vue Project Context And Review",
        phaseId: "3-solutioning",
        outputLocation: "{project_knowledge}/frontend|{planning_artifacts}",
        outputArtifactType: "vue project context and review",
        required: false,
      }),
    ]);
    expect(
      modules.find((module) => module.code === "ecosystem-other-npm-package")?.helpEntries,
    ).toEqual([
      expect.objectContaining({
        canonicalSkillId: "speclite-npm-package-project-auditor",
        displayName: "Npm Package Project Auditor",
        phaseId: "5-devops",
        outputLocation: "{project_knowledge}/ecosystems/other|{devops_artifacts}",
        outputArtifactType: "npm package project audit",
        required: false,
      }),
    ]);
    expect(
      sdlcModule.helpEntries.find((entry) => entry.canonicalSkillId === "speclite-create-prd"),
    ).toMatchObject({
      canonicalSkillId: "speclite-create-prd",
      displayName: "Create PRD",
      phaseId: "2-planning",
      outputLocation: "{planning_artifacts}/prd",
      outputArtifactType: "prd",
      required: true,
    });
  });

  it("discovers bounded nested ecosystem modules with deterministic ordering", async () => {
    const sourceRoot = await createModuleFixture({
      "core/module.yaml": [
        "code: core",
        'name: "Core"',
        "version: 1.0.0",
        'description: "Core"',
        "required: true",
        "",
      ].join("\n"),
      "core/module-help.csv": "module,skill,display-name\nCore,_meta,\n",
      "core/core-skill/SKILL.md": "# Core\n",
      "sdlc/module.yaml": [
        "code: sdlc",
        'name: "SDLC"',
        "version: 1.0.0",
        'description: "SDLC"',
        "default_selected: true",
        "required_dependencies:",
        "  - core",
        "",
      ].join("\n"),
      "sdlc/module-help.csv": "module,skill,display-name\nSDLC,_meta,\n",
      "sdlc/sdlc-skill/SKILL.md": "# SDLC\n",
      "ecosystems/backend/java-springboot/module.yaml": [
        "code: ecosystem-backend-java-springboot",
        'name: "Java Spring Boot Backend"',
        "version: 1.0.0",
        'description: "Java backend ecosystem"',
        "module_kind: ecosystem",
        "ecosystem_category: backend",
        "ecosystem_id: java-springboot",
        "required_dependencies:",
        "  - sdlc",
        "default_selected: false",
        "required: false",
        "",
      ].join("\n"),
      "ecosystems/backend/java-springboot/module-help.csv": [
        "module,skill,display-name,phase",
        "Java,_meta,,",
        "Java,java-skill,Java Skill,1-analysis",
        "",
      ].join("\n"),
      "ecosystems/backend/java-springboot/java-skill/SKILL.md": "# Java\n",
      "ecosystems/backend/java-springboot/nested/too-deep/module.yaml": [
        "code: ecosystem-backend-too-deep",
        'name: "Too Deep"',
        "version: 1.0.0",
        'description: "Must not be discovered"',
        "",
      ].join("\n"),
      "ecosystems/backend/java-springboot/nested/too-deep/deep-skill/SKILL.md": "# Deep\n",
    });

    try {
      const modules = await discoverOfficialModules({ sourceRoot });

      expect(modules.map((module) => module.code)).toEqual([
        "core",
        "ecosystem-backend-java-springboot",
        "sdlc",
      ]);
      expect(modules.map((module) => module.sourceDirectory)).toEqual([
        "core",
        "ecosystems/backend/java-springboot",
        "sdlc",
      ]);
    } finally {
      await rm(path.dirname(sourceRoot), { recursive: true, force: true });
    }
  });

  it.each([
    {
      name: "invalid category",
      metadata: ["ecosystem_category: mobile", "ecosystem_id: java-springboot"],
      code: "module-metadata.invalid-ecosystem-category",
    },
    {
      name: "missing ecosystem id",
      metadata: ["ecosystem_category: backend"],
      code: "module-metadata.missing-required-field",
    },
    {
      name: "wrong module code pattern",
      moduleCode: "java-springboot",
      metadata: ["ecosystem_category: backend", "ecosystem_id: java-springboot"],
      code: "module-metadata.invalid-ecosystem-code",
    },
    {
      name: "missing sdlc dependency",
      metadata: ["ecosystem_category: backend", "ecosystem_id: java-springboot"],
      dependencies: [],
      code: "module-metadata.invalid-ecosystem-dependencies",
    },
    {
      name: "default selected ecosystem",
      metadata: ["ecosystem_category: backend", "ecosystem_id: java-springboot"],
      defaultSelected: true,
      code: "module-metadata.invalid-ecosystem-default-selection",
    },
    {
      name: "required ecosystem",
      metadata: ["ecosystem_category: backend", "ecosystem_id: java-springboot"],
      required: true,
      code: "module-metadata.invalid-ecosystem-required",
    },
    {
      name: "banned other misc id",
      moduleCode: "ecosystem-other-misc",
      metadata: ["ecosystem_category: other", "ecosystem_id: misc"],
      code: "module-metadata.banned-other-ecosystem-id",
    },
    {
      name: "banned other general id",
      moduleCode: "ecosystem-other-general",
      metadata: ["ecosystem_category: other", "ecosystem_id: general"],
      code: "module-metadata.banned-other-ecosystem-id",
    },
    {
      name: "banned other tools id",
      moduleCode: "ecosystem-other-tools",
      metadata: ["ecosystem_category: other", "ecosystem_id: tools"],
      code: "module-metadata.banned-other-ecosystem-id",
    },
  ])("rejects invalid ecosystem metadata: $name", async ({ moduleCode, metadata, dependencies, defaultSelected, required, code }) => {
    const sourceRoot = await createModuleFixture({
      "sdlc/module.yaml": [
        "code: sdlc",
        'name: "SDLC"',
        "version: 1.0.0",
        'description: "SDLC"',
        "",
      ].join("\n"),
      "sdlc/module-help.csv": "module,skill,display-name\nSDLC,_meta,\n",
      "sdlc/sdlc-skill/SKILL.md": "# SDLC\n",
      "ecosystems/backend/java-springboot/module.yaml": [
        `code: ${moduleCode ?? "ecosystem-backend-java-springboot"}`,
        'name: "Java Spring Boot Backend"',
        "version: 1.0.0",
        'description: "Java backend ecosystem"',
        "module_kind: ecosystem",
        ...(dependencies === undefined
          ? ["required_dependencies:", "  - sdlc"]
          : dependencies.length === 0
            ? ["required_dependencies: []"]
            : ["required_dependencies:", ...dependencies.map((dependency) => `  - ${dependency}`)]),
        `default_selected: ${defaultSelected ?? false}`,
        `required: ${required ?? false}`,
        ...metadata,
        "",
      ].join("\n"),
      "ecosystems/backend/java-springboot/module-help.csv": "module,skill,display-name\nJava,_meta,\n",
      "ecosystems/backend/java-springboot/java-skill/SKILL.md": "# Java\n",
    });

    try {
      await expect(discoverOfficialModules({ sourceRoot })).rejects.toMatchObject({ code });
    } finally {
      await rm(path.dirname(sourceRoot), { recursive: true, force: true });
    }
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
