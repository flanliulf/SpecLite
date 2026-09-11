import { lstat, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  discoverOfficialModules,
  resolveCanonicalSkillIdentity,
} from "../src/modules/module-metadata.js";
import { buildIdeMirrorProjection } from "../src/ide/target-writer.js";
import { SkillIndexSchema } from "../src/manifest/manifest-schema.js";

const sourceRoot = path.join(process.cwd(), "assets/source/speclite");
const sdlcRoot = path.join(sourceRoot, "sdlc-skills");
const outputDirectory = "{solutioning_artifacts}/implementation-readiness-report/grill-consistency";
const identities = [
  {
    active: "speclite-implementation-readiness-check",
    old: "speclite-check-implementation-readiness",
  },
  {
    active: "speclite-implementation-readiness-grill-consistency-reviewer",
    old: "speclite-ir-grill-consistency-reviewer",
  },
] as const;
const FROZEN_CANDIDATE_ROOTS = [
  "assets/source/speclite",
  "src",
  "test",
  "docs",
  "README.md",
  "release/packaging-manifest.json",
] as const;
const FROZEN_EXCLUDED_PATHS = [
  "assets/source/speclite/docs/legacy",
  "assets/source/speclite/core-skills/speclite-drawer-er-modeler",
  "assets/source/speclite/core-skills/speclite-drawer-er-modeler.zip",
] as const;
const FROZEN_SEARCH_TOKENS = [
  { key: "old-id-check", parts: ["speclite-check-", "implementation-readiness"] },
  { key: "old-id-grill", parts: ["speclite-ir-", "grill-consistency-reviewer"] },
  { key: "legacy-placeholder", parts: ["{planning_artifacts}", "/ir-grill"] },
  { key: "legacy-segment", parts: ["/ir-", "grill/"] },
  { key: "legacy-default", parts: ["_speclite-output/planning-artifacts", "/ir-grill"] },
  { key: "legacy-resolved", parts: ["_speclite-output/2-planning-artifacts", "/ir-grill"] },
] as const;

describe("Story 11.8 implementation readiness rename and routing", () => {
  it("projects only active identities with globally unique rename mappings", async () => {
    const modules = await discoverOfficialModules({ sourceRoot });
    const sdlc = modules.find((module) => module.code === "sdlc")!;
    const projection = await buildIdeMirrorProjection({
      packageRoot: process.cwd(),
      sourceRoot,
      selectedModules: [sdlc],
      targetAdapters: [
        { targetId: "claude", targetDirectory: ".claude/skills", status: "planned" },
        { targetId: "agents", targetDirectory: ".agents/skills", status: "planned" },
      ],
      artifactRoots: {
        output_folder: "_speclite-output",
        planning_artifacts: "_speclite-output/2-planning-artifacts",
        solutioning_artifacts: "_speclite-output/3-solutioning-artifacts",
        implementation_artifacts: "_speclite-output/4-implementation-artifacts",
        devops_artifacts: "_speclite-output/5-devops-artifacts",
        project_knowledge: "_speclite-output/project-knowledge-base",
      },
    });
    expect(projection.ok).toBe(true);
    if (!projection.ok) return;

    for (const identity of identities) {
      expect(sdlc.packageRoots.some((root) => path.posix.basename(root) === identity.active)).toBe(true);
      expect(sdlc.packageRoots.some((root) => path.posix.basename(root) === identity.old)).toBe(false);
      expect(sdlc.skillRenames[identity.active]).toEqual([identity.old]);
      const entry = projection.skillIndexEntries.find((item) => item.canonicalSkillId === identity.active);
      expect(entry?.renamedFromCanonicalSkillIds).toEqual([identity.old]);
      expect(projection.skillIndexEntries.some((item) => item.canonicalSkillId === identity.old)).toBe(false);
      expect(projection.helpIndexEntries.some((item) => item.canonicalSkillId === identity.old)).toBe(false);
      expect(projection.phaseCoverageRows.some((item) => item.canonicalSkillId === identity.old)).toBe(false);
      expect(projection.files.some((item) => item.entry.path.includes(`/skills/${identity.old}/`))).toBe(false);
    }
    expect(SkillIndexSchema.safeParse({
      schemaVersion: "speclite.skill-index.v1",
      entries: projection.skillIndexEntries,
    }).success).toBe(true);
  });

  it("redirects each historical canonical ID to its one active identity", async () => {
    const modules = await discoverOfficialModules({ sourceRoot });
    for (const identity of identities) {
      expect(resolveCanonicalSkillIdentity(modules, identity.old)).toEqual({
        canonicalSkillId: identity.active,
        requestedCanonicalSkillId: identity.old,
        redirected: true,
      });
      expect(resolveCanonicalSkillIdentity(modules, identity.active)).toEqual({
        canonicalSkillId: identity.active,
        requestedCanonicalSkillId: identity.active,
        redirected: false,
      });
    }
  });

  it("keeps package/frontmatter/help identity parity and the exact Solutioning route", async () => {
    const help = await readFile(path.join(sdlcRoot, "module-help.csv"), "utf8");
    for (const identity of identities) {
      const packageRoot = path.join(sdlcRoot, "3-solutioning", identity.active);
      const zh = await readFile(path.join(packageRoot, "SKILL.md"), "utf8");
      const en = await readFile(path.join(packageRoot, "SKILL.en.md"), "utf8");
      expect(zh).toContain(`name: ${identity.active}`);
      expect(en).toContain(`name: ${identity.active}`);
      expect(help).toContain(`,${identity.active},`);
    }
    expect(help.match(new RegExp(outputDirectory.replace(/[{}]/g, "\\$&"), "g"))).toHaveLength(2);
  });

  it("preserves the readiness basename and the grill reviewer's existing record basenames", async () => {
    const checkRoot = path.join(sdlcRoot, "3-solutioning", identities[0].active, "references/steps");
    for (const file of await readdir(checkRoot)) {
      if (!file.endsWith(".md")) continue;
      const text = await readFile(path.join(checkRoot, file), "utf8");
      if (text.includes("outputFile:")) {
        expect(text).toContain(`${outputDirectory}/implementation-readiness-report-{{date}}.md`);
      }
    }
    const recordSpec = await readFile(
      path.join(sdlcRoot, "3-solutioning", identities[1].active, "references/record-output-spec.md"),
      "utf8",
    );
    for (const basename of ["PLAN.md", "EXPERIMENTS.md", "EXPERIMENT_NOTES.md", "summary.md"]) {
      expect(recordSpec).toContain(basename);
    }
  });

  it("binds both readiness producers and current docs to the resolver-provided Solutioning route", async () => {
    const reviewerRoot = path.join(sdlcRoot, "3-solutioning", identities[1].active);
    const [workflow, recordSpec, catalog, layout] = await Promise.all([
      readFile(path.join(reviewerRoot, "references/workflow.md"), "utf8"),
      readFile(path.join(reviewerRoot, "references/record-output-spec.md"), "utf8"),
      readFile(path.join(process.cwd(), "docs/reference/skills/sdlc-workflows.md"), "utf8"),
      readFile(path.join(process.cwd(), "docs/reference/workflow-artifact-layout.md"), "utf8"),
    ]);
    for (const producer of [workflow, recordSpec]) {
      expect(producer).toContain("speclite resolve artifact-roots --project-root {project-root}");
      expect(producer).toContain("solutioning_artifacts.resolvedRoot");
      expect(producer).toContain("resolutionMode");
      expect(producer).toContain("{solutioning_artifacts}/implementation-readiness-report/grill-consistency/");
      expect(producer).toMatch(/HALT/);
      expect(producer).toMatch(/zero artifact write/);
      expect(producer).not.toContain(".specskills/output/speclite-implementation-readiness-grill-consistency-reviewer/");
      expect(producer).not.toContain("_speclite-output/3-solutioning-artifacts/implementation-readiness-report/grill-consistency/");
    }
    expect(catalog).toContain(
      "| `speclite-implementation-readiness-check` | Workflow | `IR` | `{solutioning_artifacts}/implementation-readiness-report/grill-consistency/implementation-readiness-report-{yyyy-MM-dd}.md` |",
    );
    expect(catalog).toContain(
      "| `speclite-implementation-readiness-grill-consistency-reviewer` | Workflow | `IRG` | `{solutioning_artifacts}/implementation-readiness-report/grill-consistency` |",
    );
    expect(layout).not.toContain("implementation-readiness/               # 安装时预创建");
    expect(layout).toContain("implementation-readiness-report-{yyyy-MM-dd}.md");
    expect(layout).toContain(
      "| `{solutioning_artifacts}/implementation-readiness-report/grill-consistency/implementation-readiness-report-{yyyy-MM-dd}.md` | `speclite-implementation-readiness-check` |",
    );
  });

  it("classifies every old-id and old-path match while active surfaces stay negative", async () => {
    const manifest = JSON.parse(await readFile(
      path.join(process.cwd(), "test/fixtures/implementation-readiness-rename-routing/bounded-surfaces.json"),
      "utf8",
    )) as {
      candidateRoots: string[];
      excludedPaths: string[];
      searchTokens: Array<{ key: string; parts: string[] }>;
      matchLedger: Array<{
        path: string;
        token: string;
        occurrence: number;
        role: string;
        rationale: string;
      }>;
      allowedRoles: string[];
    };
    expect(() => validateCandidateScanControlPlane(manifest)).not.toThrow();
    const files = await listCandidateFiles(manifest.candidateRoots, manifest.excludedPaths);
    const actual: typeof manifest.matchLedger = [];
    for (const relativePath of files) {
      const bytes = await readFile(path.join(process.cwd(), relativePath));
      for (const token of manifest.searchTokens) {
        const needle = Buffer.from(token.parts.join(""));
        let cursor = 0;
        let occurrence = 0;
        while ((cursor = bytes.indexOf(needle, cursor)) !== -1) {
          occurrence += 1;
          actual.push({
            path: relativePath,
            token: token.key,
            occurrence,
            role: manifest.matchLedger.find((entry) =>
              entry.path === relativePath && entry.token === token.key && entry.occurrence === occurrence
            )?.role ?? "active-unclassified",
            rationale: manifest.matchLedger.find((entry) =>
              entry.path === relativePath && entry.token === token.key && entry.occurrence === occurrence
            )?.rationale ?? "unclassified candidate match",
          });
          cursor += needle.length;
        }
      }
    }
    const keyOf = (entry: typeof manifest.matchLedger[number]) =>
      `${entry.path}\0${entry.token}\0${entry.occurrence}`;
    expect(new Set(manifest.matchLedger.map(keyOf)).size).toBe(manifest.matchLedger.length);
    expect(actual.sort((left, right) => keyOf(left).localeCompare(keyOf(right))))
      .toEqual([...manifest.matchLedger].sort((left, right) => keyOf(left).localeCompare(keyOf(right))));
    expect(manifest.matchLedger.every((entry) => manifest.allowedRoles.includes(entry.role))).toBe(true);
    expect(manifest.matchLedger.filter((entry) => entry.role.startsWith("active"))).toEqual([]);
  });

  it("fails closed when the candidate-scan control-plane is narrowed or malformed", () => {
    const valid = {
      candidateRoots: [...FROZEN_CANDIDATE_ROOTS],
      excludedPaths: [...FROZEN_EXCLUDED_PATHS],
      searchTokens: FROZEN_SEARCH_TOKENS.map((token) => ({ key: token.key, parts: [...token.parts] })),
    };
    expect(() => validateCandidateScanControlPlane({
      ...valid,
      candidateRoots: valid.candidateRoots.slice(1),
    })).toThrow();
    expect(() => validateCandidateScanControlPlane({
      ...valid,
      excludedPaths: [...valid.excludedPaths, "src"],
    })).toThrow();
    expect(() => validateCandidateScanControlPlane({
      ...valid,
      searchTokens: valid.searchTokens.map((token) => token.key === "old-id-check"
        ? { ...token, key: "old-id-check-mutated" }
        : token),
    })).toThrow();
  });

  it("walks nested dist and node_modules inside frozen roots", async () => {
    const projectRoot = await mkdtemp(path.join(tmpdir(), "speclite-candidate-scan-"));
    try {
      const probes = [
        "src/dist/probe.txt",
        "test/fixtures/node_modules/probe.txt",
      ];
      for (const probe of probes) {
        const target = path.join(projectRoot, probe);
        await mkdir(path.dirname(target), { recursive: true });
        await writeFile(target, "candidate scan probe\n", "utf8");
      }

      expect(await listCandidateFiles(["src", "test"], [], projectRoot)).toEqual(probes);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it("discovers legacy readiness evidence in place without migration instructions", async () => {
    const clauses = await Promise.all([
      readFile(path.join(
        sdlcRoot,
        "3-solutioning",
        identities[0].active,
        "references/steps/step-01-document-discovery.md",
      ), "utf8"),
      readFile(path.join(
        sdlcRoot,
        "3-solutioning",
        identities[1].active,
        "references/workflow.md",
      ), "utf8"),
    ]);
    for (const clause of clauses) {
      expect(clause).toContain("{planning_artifacts}/ir-grill/");
      expect(clause).toMatch(/read-only|只作为|原位读取/i);
      expect(clause).toMatch(/never migrate|不迁移|不得迁移/i);
    }
  });
});

function validateCandidateScanControlPlane(input: {
  candidateRoots: string[];
  excludedPaths: string[];
  searchTokens: Array<{ key: string; parts: string[] }>;
}): void {
  const assertExact = (actual: unknown, expected: unknown, label: string) => {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(`candidate scan ${label} does not match its frozen control-plane`);
    }
  };
  assertExact(input.candidateRoots, FROZEN_CANDIDATE_ROOTS, "roots");
  assertExact(input.excludedPaths, FROZEN_EXCLUDED_PATHS, "exclusions");
  assertExact(input.searchTokens, FROZEN_SEARCH_TOKENS, "tokens");
}

async function listCandidateFiles(
  roots: string[],
  excludedPaths: string[],
  projectRoot = process.cwd(),
): Promise<string[]> {
  const files: string[] = [];
  const excluded = new Set(excludedPaths);
  const isExcluded = (relativePath: string) =>
    [...excluded].some((candidate) => relativePath === candidate || relativePath.startsWith(`${candidate}/`));
  async function visit(relativePath: string): Promise<void> {
    if (isExcluded(relativePath)) return;
    const target = path.join(projectRoot, relativePath);
    const metadata = await lstat(target);
    if (metadata.isSymbolicLink()) throw new Error(`candidate scan rejects symlink: ${relativePath}`);
    if (metadata.isFile()) {
      files.push(relativePath);
      return;
    }
    if (!metadata.isDirectory()) throw new Error(`candidate scan rejects non-file: ${relativePath}`);
    for (const entry of await readdir(target, { withFileTypes: true })) {
      await visit(path.posix.join(relativePath, entry.name));
    }
  }
  for (const root of roots) await visit(root);
  return files.sort();
}
