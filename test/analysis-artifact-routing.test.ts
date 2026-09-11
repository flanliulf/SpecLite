import { describe, expect, it, vi } from "vitest";
import { access, mkdir, mkdtemp, readFile, readdir, rm, stat, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { resolveArtifactRoots } from "../src/config/artifact-root-resolver.js";
import { runInstallCommand } from "../src/commands/install.js";
import {
  createArtifactContract,
  createArtifactRootContext,
} from "../src/manifest/manifest-generator.js";
import { resolveAnalysisDocumentRoute } from "../src/manifest/analysis-artifact-routing.js";
import { hashFile } from "../src/manifest/hash.js";

type OpenFunction = typeof import("node:fs/promises").open;

const fsOpenMock = vi.hoisted(() => ({
  calls: [] as Parameters<OpenFunction>[],
  failures: new Map<string, NodeJS.ErrnoException>(),
}));

vi.mock("node:fs/promises", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:fs/promises")>();
  const open = ((...args: Parameters<OpenFunction>) => {
    fsOpenMock.calls.push(args);
    const filePath = args[0];
    if (typeof filePath === "string") {
      const failure = fsOpenMock.failures.get(filePath);
      if (failure !== undefined) {
        throw failure;
      }
    }
    return actual.open(...args);
  }) as OpenFunction;

  return {
    ...actual,
    open,
  };
});

const supportedRuntime = {
  nodeVersion: "v22.12.0",
  platform: "darwin",
  platformRelease: "23.0.0",
} as const;

const analysisSourceRoot = path.join(
  process.cwd(),
  "assets/source/speclite/sdlc-skills/1-analysis",
);

const producerRoutes = [
  {
    skillId: "speclite-domain-research",
    artifactType: "research-documents",
    defaultOutputPath: "_speclite-output/1-analysis-artifacts/research",
  },
  {
    skillId: "speclite-market-research",
    artifactType: "research-documents",
    defaultOutputPath: "_speclite-output/1-analysis-artifacts/research",
  },
  {
    skillId: "speclite-technical-research",
    artifactType: "research-documents",
    defaultOutputPath: "_speclite-output/1-analysis-artifacts/research",
  },
  {
    skillId: "speclite-product-brief",
    artifactType: "product-brief",
    defaultOutputPath: "_speclite-output/1-analysis-artifacts/product-brief",
  },
  {
    skillId: "speclite-prfaq",
    artifactType: "prfaq-document",
    defaultOutputPath: "_speclite-output/1-analysis-artifacts/prfaq",
  },
] as const;

describe("Analysis artifact routing", () => {
  it("installs the Analysis subject directories and projects producer artifact contracts", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-analysis-routing-"));

    try {
      const outcome = await runInstallCommand({
        options: { json: true, yes: true },
        runtime: {
          ...supportedRuntime,
          cwd: tempRoot,
          targetProject: "analysis-routing",
        },
      });

      expect(outcome.exitCode).toBe(0);
      await expect(readdir(path.join(tempRoot, "_speclite-output/1-analysis-artifacts"))).resolves.toEqual([
        "prfaq",
        "product-brief",
        "research",
      ]);

      const phaseCoverage = JSON.parse(
        await readFile(path.join(tempRoot, "_speclite/_config/phase-coverage.json"), "utf8"),
      ) as {
        rows: Array<{
          canonicalSkillId: string;
          artifactContract?: {
            artifactType: string;
            defaultOutputPath: string;
            requiredMetadata: string[];
          };
        }>;
      };

      for (const route of producerRoutes) {
        const row = phaseCoverage.rows.find((candidate) => candidate.canonicalSkillId === route.skillId);
        expect(row?.artifactContract).toEqual({
          artifactType: route.artifactType,
          defaultOutputPath: route.defaultOutputPath,
          requiredMetadata: ["workflowType", "sourceSkill", "generatedAt"],
        });
      }
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  }, 15_000);

  it("locks producer files to Analysis roots while preserving basename, resume, stage and distillate names", async () => {
    await expect(readAnalysisFile("research/speclite-domain-research/references/workflow-details.md")).resolves.toContain(
      "{analysis_artifacts}/research/domain-{{research_topic_slug}}-research-{{date}}.md",
    );
    await expect(readAnalysisFile("research/speclite-market-research/references/workflow-details.md")).resolves.toContain(
      "{analysis_artifacts}/research/market-{{research_topic_slug}}-research-{{date}}.md",
    );
    await expect(readAnalysisFile("research/speclite-technical-research/references/workflow-details.md")).resolves.toContain(
      "{analysis_artifacts}/research/technical-{{research_topic_slug}}-research-{{date}}.md",
    );

    const productWorkflow = await readAnalysisFile("speclite-product-brief/references/workflow-details.md");
    const productDraft = await readAnalysisFile("speclite-product-brief/references/prompts/draft-and-review.md");
    const productFinalize = await readAnalysisFile("speclite-product-brief/references/prompts/finalize.md");
    const productManifest = JSON.parse(await readAnalysisFile("speclite-product-brief/data/speclite-manifest.json"));

    expect(productWorkflow).toContain("Use `analysis_artifacts.resolvedRoot` as `{analysis_artifacts}` for output location");
    expect(productDraft).toContain("{product_brief_main_artifact}");
    expect(productFinalize).toContain("{product_brief_main_artifact}");
    expect(productFinalize).toContain("{product_brief_distillate_artifact}");
    expect(productManifest.capabilities[0]["output-location"]).toBe("{analysis_artifacts}/product-brief");

    const prfaqWorkflow = await readAnalysisFile("speclite-prfaq/references/workflow-details.md");
    const prfaqPressRelease = await readAnalysisFile("speclite-prfaq/references/press-release.md");
    const prfaqCustomerFaq = await readAnalysisFile("speclite-prfaq/references/customer-faq.md");
    const prfaqInternalFaq = await readAnalysisFile("speclite-prfaq/references/internal-faq.md");
    const prfaqVerdict = await readAnalysisFile("speclite-prfaq/references/verdict.md");
    const prfaqManifest = JSON.parse(await readAnalysisFile("speclite-prfaq/data/speclite-manifest.json"));

    expect(prfaqWorkflow).toContain("Check if `prfaq_main_artifact` already exists");
    expect(prfaqWorkflow).toContain("{analysis_artifacts}/prfaq/prfaq-{project_name}.md");
    expect(prfaqPressRelease).toContain("{prfaq_main_artifact}");
    expect(prfaqCustomerFaq).toContain("selected directory of `{prfaq_main_artifact}`");
    expect(prfaqInternalFaq).toContain("selected directory of `{prfaq_main_artifact}`");
    expect(prfaqVerdict).toContain("{prfaq_main_artifact}");
    expect(prfaqVerdict).toContain("{prfaq_distillate_artifact}");
    expect(prfaqManifest.capabilities[0]["output-location"]).toBe("{analysis_artifacts}/prfaq");
  });

  it("classifies active legacy Analysis defaults as negative corpus failures", async () => {
    const files = await collectCorpusFiles([
      path.join(analysisSourceRoot, "research/speclite-domain-research"),
      path.join(analysisSourceRoot, "research/speclite-market-research"),
      path.join(analysisSourceRoot, "research/speclite-technical-research"),
      path.join(analysisSourceRoot, "speclite-product-brief"),
      path.join(analysisSourceRoot, "speclite-prfaq"),
      path.join(process.cwd(), "assets/source/speclite/sdlc-skills/module-help.csv"),
      path.join(process.cwd(), "docs/reference/skills/sdlc-workflows.md"),
      path.join(process.cwd(), "docs/reference/workflow-artifact-layout.md"),
    ]);
    const forbidden = [
      /\{planning_artifacts\}\/research\//,
      /\{planning_artifacts\}\/product-brief/,
      /\{planning_artifacts\}\/prfaq/,
      /\{project_knowledge\}\/research/,
      /Output Location:\*\* `\{planning_artifacts\}`/,
      /"output-location": "\{planning_artifacts\}"/,
      /,\{planning_artifacts\}\|?\{project_knowledge\}?,research documents/,
    ];
    const violations: string[] = [];

    for (const filePath of files) {
      const text = await readFile(filePath, "utf8");
      for (const pattern of forbidden) {
        if (pattern.test(text)) {
          violations.push(`${toRepoPath(filePath)} => ${pattern.source}`);
        }
      }
    }

    expect(violations).toEqual([]);
  });

  it("keeps existing installs missing analysis_artifacts on the legacy planning root without migration", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-analysis-legacy-"));

    try {
      await mkdir(path.join(tempRoot, "_speclite-output/planning-artifacts/research"), { recursive: true });
      await writeFile(
        path.join(tempRoot, "_speclite-output/planning-artifacts/research/domain-ai-research-2026-09-03.md"),
        "legacy research artifact\n",
        "utf8",
      );
      const legacyArtifact = path.join(
        tempRoot,
        "_speclite-output/planning-artifacts/research/domain-ai-research-2026-09-03.md",
      );
      const beforeHash = await hashFile(legacyArtifact);

      const resolved = await resolveArtifactRoots({
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

      expect(resolved.ok).toBe(true);
      const artifactRoots = createArtifactRootContext({
        outputFolder: "_speclite-output",
        roots: resolved.roots,
      });
      expect(
        createArtifactContract({
          outputLocation: "{analysis_artifacts}/research",
          outputArtifactType: "research documents",
          artifactRoots,
        }),
      ).toEqual({
        artifactType: "research-documents",
        defaultOutputPath: "_speclite-output/planning-artifacts/research",
        requiredMetadata: ["workflowType", "sourceSkill", "generatedAt"],
      });
      expect(resolved.roots.find((root) => root.field === "analysis_artifacts")).toMatchObject({
        resolvedRoot: "_speclite-output/planning-artifacts",
        resolutionMode: "legacy-compatible",
      });
      await expect(access(path.join(tempRoot, "_speclite-output/1-analysis-artifacts"))).rejects.toMatchObject({
        code: "ENOENT",
      });
      await expect(hashFile(legacyArtifact)).resolves.toBe(beforeHash);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("selects Product Brief and PRFAQ legacy root-level artifacts only for legacy-compatible analysis roots", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-analysis-doc-routes-"));

    try {
      await mkdir(path.join(tempRoot, "_speclite-output/planning-artifacts/product-brief"), { recursive: true });
      await mkdir(path.join(tempRoot, "_speclite-output/planning-artifacts/prfaq"), { recursive: true });
      await writeFile(
        path.join(tempRoot, "_speclite-output/planning-artifacts/product-brief-alpha.md"),
        "legacy product brief\n",
        "utf8",
      );
      await writeFile(
        path.join(tempRoot, "_speclite-output/planning-artifacts/product-brief/product-brief-beta.md"),
        "new product brief\n",
        "utf8",
      );
      await writeFile(
        path.join(tempRoot, "_speclite-output/planning-artifacts/prfaq-gamma.md"),
        "legacy prfaq\n",
        "utf8",
      );
      await writeFile(
        path.join(tempRoot, "_speclite-output/planning-artifacts/prfaq/prfaq-gamma.md"),
        "new prfaq\n",
        "utf8",
      );

      await expect(
        resolveAnalysisDocumentRoute({
          projectRoot: tempRoot,
          analysisRoot: {
            resolvedRoot: "_speclite-output/planning-artifacts",
            resolutionMode: "legacy-compatible",
          },
          family: "product-brief",
          projectName: "alpha",
        }),
      ).resolves.toMatchObject({
        selectedSource: "legacy-root-level",
        mainArtifact: "_speclite-output/planning-artifacts/product-brief-alpha.md",
        distillateArtifact: "_speclite-output/planning-artifacts/product-brief-alpha-distillate.md",
        artifactDirectory: "_speclite-output/planning-artifacts",
      });

      await expect(
        resolveAnalysisDocumentRoute({
          projectRoot: tempRoot,
          analysisRoot: {
            resolvedRoot: "_speclite-output/planning-artifacts",
            resolutionMode: "legacy-compatible",
          },
          family: "product-brief",
          projectName: "beta",
        }),
      ).resolves.toMatchObject({
        selectedSource: "new-subject",
        mainArtifact: "_speclite-output/planning-artifacts/product-brief/product-brief-beta.md",
        distillateArtifact: "_speclite-output/planning-artifacts/product-brief/product-brief-beta-distillate.md",
        artifactDirectory: "_speclite-output/planning-artifacts/product-brief",
      });

      await expect(
        resolveAnalysisDocumentRoute({
          projectRoot: tempRoot,
          analysisRoot: {
            resolvedRoot: "_speclite-output/planning-artifacts",
            resolutionMode: "legacy-compatible",
          },
          family: "product-brief",
          projectName: "delta",
        }),
      ).resolves.toMatchObject({
        selectedSource: "new-subject",
        mainArtifact: "_speclite-output/planning-artifacts/product-brief/product-brief-delta.md",
        distillateArtifact: "_speclite-output/planning-artifacts/product-brief/product-brief-delta-distillate.md",
      });

      await expect(
        resolveAnalysisDocumentRoute({
          projectRoot: tempRoot,
          analysisRoot: {
            resolvedRoot: "_speclite-output/planning-artifacts",
            resolutionMode: "legacy-compatible",
          },
          family: "prfaq",
          projectName: "gamma",
        }),
      ).resolves.toMatchObject({
        selectedSource: "new-subject",
        mainArtifact: "_speclite-output/planning-artifacts/prfaq/prfaq-gamma.md",
        distillateArtifact: "_speclite-output/planning-artifacts/prfaq/prfaq-gamma-distillate.md",
        artifactDirectory: "_speclite-output/planning-artifacts/prfaq",
      });

      await writeFile(
        path.join(tempRoot, "_speclite-output/planning-artifacts/product-brief-epsilon.md"),
        "explicit root-level file\n",
        "utf8",
      );
      await expect(
        resolveAnalysisDocumentRoute({
          projectRoot: tempRoot,
          analysisRoot: {
            resolvedRoot: "_speclite-output/planning-artifacts",
            resolutionMode: "explicit-config",
          },
          family: "product-brief",
          projectName: "epsilon",
        }),
      ).resolves.toMatchObject({
        selectedSource: "new-subject",
        mainArtifact: "_speclite-output/planning-artifacts/product-brief/product-brief-epsilon.md",
        distillateArtifact: "_speclite-output/planning-artifacts/product-brief/product-brief-epsilon-distillate.md",
        legacyDiscoveryEnabled: false,
      });
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("uses the trimmed project name for Product Brief and PRFAQ basenames while preserving internal characters", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-analysis-doc-route-name-"));
    const analysisRoot = "_speclite-output/1-analysis-artifacts";
    const baseInput = {
      projectRoot: tempRoot,
      analysisRoot: { resolvedRoot: analysisRoot, resolutionMode: "default-derived" as const },
    };

    try {
      await expect(
        resolveAnalysisDocumentRoute({
          ...baseInput,
          family: "product-brief",
          projectName: " alpha ",
        }),
      ).resolves.toMatchObject({
        mainArtifact: `${analysisRoot}/product-brief/product-brief-alpha.md`,
        distillateArtifact: `${analysisRoot}/product-brief/product-brief-alpha-distillate.md`,
      });

      await expect(
        resolveAnalysisDocumentRoute({
          ...baseInput,
          family: "prfaq",
          projectName: " alpha ",
        }),
      ).resolves.toMatchObject({
        mainArtifact: `${analysisRoot}/prfaq/prfaq-alpha.md`,
        distillateArtifact: `${analysisRoot}/prfaq/prfaq-alpha-distillate.md`,
      });

      await expect(
        resolveAnalysisDocumentRoute({
          ...baseInput,
          family: "product-brief",
          projectName: "alpha beta",
        }),
      ).resolves.toMatchObject({
        mainArtifact: `${analysisRoot}/product-brief/product-brief-alpha beta.md`,
        distillateArtifact: `${analysisRoot}/product-brief/product-brief-alpha beta-distillate.md`,
      });

      await expect(
        resolveAnalysisDocumentRoute({
          ...baseInput,
          family: "prfaq",
          projectName: "项目A",
        }),
      ).resolves.toMatchObject({
        mainArtifact: `${analysisRoot}/prfaq/prfaq-项目A.md`,
        distillateArtifact: `${analysisRoot}/prfaq/prfaq-项目A-distillate.md`,
      });
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("fails closed for unsafe project names and unsafe Analysis artifact candidates", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-analysis-doc-route-safety-"));
    const outsideRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-analysis-doc-route-outside-"));
    const analysisRoot = "_speclite-output/planning-artifacts";
    const legacyInput = {
      projectRoot: tempRoot,
      analysisRoot: { resolvedRoot: analysisRoot, resolutionMode: "legacy-compatible" as const },
      family: "product-brief" as const,
    };

    try {
      for (const projectName of ["", "   ", ".", "..", "../outside", "..\\outside", "/outside", "C:outside", "C:\\outside", "bad\0name"]) {
        await expect(resolveAnalysisDocumentRoute({ ...legacyInput, projectName })).rejects.toThrow(
          "portable single filename segment",
        );
      }

      await mkdir(path.join(tempRoot, analysisRoot, "product-brief", "product-brief-directory.md"), {
        recursive: true,
      });
      await expect(
        resolveAnalysisDocumentRoute({ ...legacyInput, projectName: "directory" }),
      ).rejects.toThrow("regular non-symlink file");

      await rm(path.join(tempRoot, analysisRoot, "product-brief", "product-brief-directory.md"), {
        recursive: true,
      });
      await mkdir(path.join(tempRoot, analysisRoot, "product-brief-legacy-directory.md"), {
        recursive: true,
      });
      await expect(
        resolveAnalysisDocumentRoute({ ...legacyInput, projectName: "legacy-directory" }),
      ).rejects.toThrow("regular non-symlink file");

      await mkdir(path.join(tempRoot, analysisRoot, "product-brief"), { recursive: true });
      await writeFile(path.join(outsideRoot, "outside.md"), "outside\n", "utf8");
      await symlink(
        path.join(outsideRoot, "outside.md"),
        path.join(tempRoot, analysisRoot, "product-brief", "product-brief-symlink.md"),
      );
      await expect(
        resolveAnalysisDocumentRoute({ ...legacyInput, projectName: "symlink" }),
      ).rejects.toThrow("target project");

      const unreadablePath = path.join(
        tempRoot,
        analysisRoot,
        "product-brief",
        "product-brief-unreadable.md",
      );
      await writeFile(unreadablePath, "unreadable\n", "utf8");
      const unreadableOpenError = Object.assign(new Error("permission denied"), { code: "EACCES" });
      fsOpenMock.failures.set(unreadablePath, unreadableOpenError);
      try {
        await expect(
          resolveAnalysisDocumentRoute({ ...legacyInput, projectName: "unreadable" }),
        ).rejects.toMatchObject({ code: "EACCES" });
      } finally {
        fsOpenMock.failures.delete(unreadablePath);
      }

      await writeFile(
        path.join(tempRoot, analysisRoot, "product-brief", "product-brief-new-wins.md"),
        "new\n",
        "utf8",
      );
      await mkdir(path.join(tempRoot, analysisRoot, "product-brief-new-wins.md"));
      const newWinsLegacyPath = path.join(tempRoot, analysisRoot, "product-brief-new-wins.md");
      fsOpenMock.calls = [];
      try {
        await expect(
          resolveAnalysisDocumentRoute({ ...legacyInput, projectName: "new-wins" }),
        ).resolves.toMatchObject({
          selectedSource: "new-subject",
          mainArtifact: `${analysisRoot}/product-brief/product-brief-new-wins.md`,
        });
        expect(fsOpenMock.calls.some((call) => call[0] === newWinsLegacyPath)).toBe(false);
      } finally {
        fsOpenMock.calls = [];
      }
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
      await rm(outsideRoot, { recursive: true, force: true });
    }
  });

  it("keeps the active public resolver command lists aligned with the Node CLI surface", async () => {
    const publicResolverDocs = [
      "README.md",
      "docs/explanation/local-first-control-plane.md",
      "docs/explanation/runtime-boundaries.md",
      "docs/reference/glossary/epic-09-installed-runtime-activation-contract-hardening.md",
    ];

    for (const relativePath of publicResolverDocs) {
      const text = await readFile(path.join(process.cwd(), relativePath), "utf8");
      expect(text, relativePath).toContain("resolve config");
      expect(text, relativePath).toContain("resolve customization");
      expect(text, relativePath).toContain("resolve artifact-roots");
      expect(text, relativePath).toContain("Node CLI");
    }
  });

  it("documents resolved artifact-root activation and legacy document route policy in affected Analysis Skills", async () => {
    const workflowFiles = [
      "research/speclite-domain-research/references/workflow-details.md",
      "research/speclite-market-research/references/workflow-details.md",
      "research/speclite-technical-research/references/workflow-details.md",
      "speclite-product-brief/references/workflow-details.md",
      "speclite-prfaq/references/workflow-details.md",
    ];

    for (const relativePath of workflowFiles) {
      const text = await readAnalysisFile(relativePath);
      expect(text, relativePath).toContain("speclite resolve artifact-roots --project-root {project-root}");
      expect(text, relativePath).toContain("resolutionMode");
      expect(text, relativePath).not.toContain("hand-written fallback");
    }

    const productWorkflow = await readAnalysisFile("speclite-product-brief/references/workflow-details.md");
    expect(productWorkflow).toContain("product_brief_main_artifact");
    expect(productWorkflow).toContain("raw merged config field `core.project_name`");
    expect(productWorkflow).toContain("Bind `{project_name}`");
    expect(productWorkflow).toContain("missing, is not a string, or trims to an empty value");
    expect(productWorkflow).toContain("HALT before route selection");
    expect(productWorkflow).toContain("legacy-compatible");
    expect(productWorkflow).toContain("{analysis_artifacts}/product-brief-{project_name}.md");
    expect(productWorkflow).toContain("new subject artifact exists");
    expect(productWorkflow).toContain("trim `{project_name}`");
    expect(productWorkflow).toContain("portable single filename segment");
    expect(productWorkflow).toContain("regular non-symlink file");
    expect(productWorkflow).toContain("stay inside `{project-root}`");
    expect(productWorkflow).toContain("symlink escape");
    expect(productWorkflow).toContain("Only `ENOENT` means a candidate is missing");
    expect(productWorkflow).toContain("HALT before any resume, write, or migration step");
    expect(productWorkflow).toContain("must not migrate, copy, delete, rename, or rewrite");

    const productDraft = await readAnalysisFile("speclite-product-brief/references/prompts/draft-and-review.md");
    const productFinalize = await readAnalysisFile("speclite-product-brief/references/prompts/finalize.md");
    expect(productDraft).toContain("{product_brief_main_artifact}");
    expect(productFinalize).toContain("{product_brief_main_artifact}");
    expect(productFinalize).toContain("{product_brief_distillate_artifact}");

    const prfaqWorkflow = await readAnalysisFile("speclite-prfaq/references/workflow-details.md");
    expect(prfaqWorkflow).toContain("prfaq_main_artifact");
    expect(prfaqWorkflow).toContain("raw merged config field `core.project_name`");
    expect(prfaqWorkflow).toContain("Bind `{project_name}`");
    expect(prfaqWorkflow).toContain("missing, is not a string, or trims to an empty value");
    expect(prfaqWorkflow).toContain("HALT before route selection");
    expect(prfaqWorkflow).toContain("legacy-compatible");
    expect(prfaqWorkflow).toContain("{analysis_artifacts}/prfaq-{project_name}.md");
    expect(prfaqWorkflow).toContain("new subject artifact exists");
    expect(prfaqWorkflow).toContain("trim `{project_name}`");
    expect(prfaqWorkflow).toContain("portable single filename segment");
    expect(prfaqWorkflow).toContain("regular non-symlink file");
    expect(prfaqWorkflow).toContain("stay inside `{project-root}`");
    expect(prfaqWorkflow).toContain("symlink escape");
    expect(prfaqWorkflow).toContain("Only `ENOENT` means a candidate is missing");
    expect(prfaqWorkflow).toContain("HALT before any resume, write, or migration step");
    expect(prfaqWorkflow).toContain("must not migrate, copy, delete, rename, or rewrite");

    for (const relativePath of [
      "speclite-prfaq/references/press-release.md",
      "speclite-prfaq/references/customer-faq.md",
      "speclite-prfaq/references/internal-faq.md",
      "speclite-prfaq/references/verdict.md",
    ]) {
      const text = await readAnalysisFile(relativePath);
      expect(text, relativePath).toContain("{prfaq_main_artifact}");
    }
    const prfaqVerdict = await readAnalysisFile("speclite-prfaq/references/verdict.md");
    expect(prfaqVerdict).toContain("{prfaq_distillate_artifact}");
  });
});

async function readAnalysisFile(relativePath: string): Promise<string> {
  return readFile(path.join(analysisSourceRoot, relativePath), "utf8");
}

async function collectCorpusFiles(roots: string[]): Promise<string[]> {
  const files = await Promise.all(roots.map((root) => walk(root)));
  return files
    .flat()
    .filter((filePath) => /\.(?:csv|json|md)$/.test(filePath))
    .sort((left, right) => left.localeCompare(right));
}

async function walk(filePath: string): Promise<string[]> {
  const fileStat = await stat(filePath);
  if (fileStat.isFile()) {
    return [filePath];
  }

  const entries = await readdir(filePath, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const absolutePath = path.join(filePath, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(absolutePath)));
    } else if (entry.isFile()) {
      files.push(absolutePath);
    }
  }

  return files;
}

function toRepoPath(filePath: string): string {
  return path.relative(process.cwd(), filePath).split(path.sep).join("/");
}
