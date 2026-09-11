import { access, lstat, mkdir, mkdtemp, readFile, readdir, rm, stat, symlink, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { runInstallCommand } from "../src/commands/install.js";
// @ts-expect-error Canonical Skill runtime scripts intentionally live outside the TS build graph.
import {
  normalizeStoryId,
  resolveCrDirectory,
  validateCrDirectoryContext,
} from "../assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs";

const IMPLEMENTATION_ROOT = path.join(
  process.cwd(),
  "assets/source/speclite/sdlc-skills/4-implementation",
);
const RESOLVER = path.join(
  IMPLEMENTATION_ROOT,
  "speclite-code-review-contract/scripts/resolve-cr-directory.mjs",
);
const LEAF_WORKFLOWS = {
  "speclite-code-review-01-reviewer": "references/reviewer-workflow.md",
  "speclite-code-review-02-evaluator": "references/evaluator-workflow.md",
  "speclite-code-review-03-fixer": "references/fixer-workflow.md",
  "speclite-code-review-04-rules-extractor": "references/rules-extractor-workflow.md",
  "speclite-code-review-05-todo-tracker": "references/todo-tracker-workflow.md",
  "speclite-code-review-06-finalizer": "references/finalizer-workflow.md",
} as const;

function currentArtifact(storyId = "11-9", reviewSeries = "directory-routing", round = 1): string {
  return `---\nschemaVersion: speclite.cr-review.v2\nartifactType: code-review-summary\nstoryId: ${storyId}\nreviewSeries: ${reviewSeries}\nround: ${round}\n---\n`;
}

async function writeCurrent(
  projectRoot: string,
  crDir: string,
  options: { storyId?: string; reviewSeries?: string; round?: number; doneClaim?: boolean } = {},
): Promise<void> {
  const storyId = options.storyId ?? "11-9";
  const reviewSeries = options.reviewSeries ?? "directory-routing";
  const round = options.round ?? 1;
  await mkdir(path.join(projectRoot, crDir), { recursive: true });
  await writeFile(
    path.join(projectRoot, crDir, `${storyId}-code-review-summary-20260909-${reviewSeries}-round-${round}.md`),
    currentArtifact(storyId, reviewSeries, round),
  );
  if (options.doneClaim) {
    await writeFile(
      path.join(projectRoot, crDir, `${storyId}-cr-finalizer-20260909-${reviewSeries}-round-${round}.md`),
      `---\nschemaVersion: speclite.cr-finalizer.v2\nartifactType: cr-finalizer\nstoryId: ${storyId}\nreviewSeries: ${reviewSeries}\nround: ${round}\nresult: DONE\n---\n`,
    );
  }
}

function frozenContext(
  crDir = "state/code-reviews/11-9-code-review",
  compatibilityMode: "canonical" | "legacy-resume" = "canonical",
) {
  const legacyArtifactPaths = compatibilityMode === "legacy-resume" ? [crDir] : [];
  return {
    projectRoot: "",
    implementationArtifacts: "state",
    storyId: "11-9",
    reviewSeries: "directory-routing",
    crDir,
    canonicalCrDir: "state/code-reviews/11-9-code-review",
    compatibilityMode,
    legacyArtifactPaths,
  };
}

function contextFields(context: ReturnType<typeof frozenContext>) {
  return {
    storyId: context.storyId,
    reviewSeries: context.reviewSeries,
    crDir: context.crDir,
    canonicalCrDir: context.canonicalCrDir,
    compatibilityMode: context.compatibilityMode,
    legacyArtifactPaths: context.legacyArtifactPaths,
  };
}

function resolveArgs(projectRoot: string): string[] {
  return [
    "--mode", "resolve",
    "--project-root", projectRoot,
    "--implementation-artifacts", "state",
    "--story-id", "11.9",
    "--review-series", "directory-routing",
  ];
}

function validateArgs(projectRoot: string, context: ReturnType<typeof frozenContext>, writeSubpath: string): string[] {
  return [
    "--mode", "validate-context",
    "--project-root", projectRoot,
    "--implementation-artifacts", context.implementationArtifacts,
    "--frozen-context", JSON.stringify(contextFields(context)),
    "--story-id", context.storyId,
    "--review-series", context.reviewSeries,
    "--cr-dir", context.crDir,
    "--canonical-cr-dir", context.canonicalCrDir,
    "--compatibility-mode", context.compatibilityMode,
    "--legacy-artifact-paths", JSON.stringify(context.legacyArtifactPaths),
    "--write-subpath", writeSubpath,
  ];
}

describe("CR directory-only resolution and production context validation", () => {
  it("normalizes numeric identity only and never accepts title or traversal text", () => {
    expect(normalizeStoryId("11.9")).toEqual({ ok: true, storyId: "11-9" });
    expect(normalizeStoryId("11-9")).toEqual({ ok: true, storyId: "11-9" });
    for (const invalid of ["11-9-title", "11.9 中文", "../11.9", "11/9", "01.9", "11.09", ""]) {
      expect(normalizeStoryId(invalid)).toEqual({ ok: false, reason: "invalid-story-id" });
    }
  });

  it("routes a new run to the numeric canonical root without mutation or title input", async () => {
    const projectRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-dir-new-"));
    try {
      await mkdir(path.join(projectRoot, "state/code-reviews"), { recursive: true });
      const before = await readdir(path.join(projectRoot, "state/code-reviews"));
      await expect(resolveCrDirectory({
        projectRoot,
        implementationArtifacts: "state",
        storyId: "11.9",
        reviewSeries: "directory-routing",
      })).resolves.toEqual({
        ok: true,
        storyId: "11-9",
        reviewSeries: "directory-routing",
        crDir: "state/code-reviews/11-9-code-review",
        canonicalCrDir: "state/code-reviews/11-9-code-review",
        compatibilityMode: "canonical",
        legacyArtifactPaths: [],
        issue: null,
      });
      await expect(readdir(path.join(projectRoot, "state/code-reviews"))).resolves.toEqual(before);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it("binds the one current legacy run in place even when it contains a DONE claim", async () => {
    const projectRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-dir-legacy-"));
    const legacy = "state/code-reviews/11-9-old-title-code-review";
    try {
      await writeCurrent(projectRoot, legacy, { doneClaim: true });
      await expect(resolveCrDirectory({
        projectRoot,
        implementationArtifacts: "state",
        storyId: "11-9",
        reviewSeries: "directory-routing",
      })).resolves.toMatchObject({
        ok: true,
        crDir: legacy,
        compatibilityMode: "legacy-resume",
        legacyArtifactPaths: [legacy],
      });
      await expect(access(path.join(projectRoot, "state/code-reviews/11-9-code-review"))).rejects.toThrow();
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it("fails multiple current candidates closed, while an explicit safe choice resolves ownership only", async () => {
    const projectRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-dir-choice-"));
    const canonical = "state/code-reviews/11-9-code-review";
    const legacy = "state/code-reviews/11-9-old-title-code-review";
    try {
      await writeCurrent(projectRoot, canonical);
      await writeCurrent(projectRoot, legacy);
      const before = await Promise.all([canonical, legacy].map(async (relative) => ({
        relative,
        entries: await readdir(path.join(projectRoot, relative)),
      })));
      const blocked = await resolveCrDirectory({
        projectRoot,
        implementationArtifacts: "state",
        storyId: "11-9",
        reviewSeries: "directory-routing",
      });
      expect(blocked).toMatchObject({
        ok: false,
        crDir: null,
        issue: {
          issueId: "cr-directory.ambiguous-resume-root",
          category: "lifecycle",
          continuation: "block",
          details: { reason: "multiple-current-directory-candidates" },
        },
      });
      expect(JSON.stringify(blocked)).not.toContain(projectRoot);
      await expect(resolveCrDirectory({
        projectRoot,
        implementationArtifacts: "state",
        storyId: "11-9",
        reviewSeries: "directory-routing",
        directoryChoice: legacy,
      })).resolves.toMatchObject({ ok: true, crDir: legacy, compatibilityMode: "legacy-resume" });
      await expect(Promise.all([canonical, legacy].map(async (relative) => ({
        relative,
        entries: await readdir(path.join(projectRoot, relative)),
      })))).resolves.toEqual(before);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it("never lets directoryChoice bypass a symlink, escape, non-directory, or contradictory identity", async () => {
    const projectRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-dir-unsafe-"));
    const external = await mkdtemp(path.join(os.tmpdir(), "speclite-dir-external-"));
    const legacy = "state/code-reviews/11-9-old-title-code-review";
    try {
      await mkdir(path.join(projectRoot, "state/code-reviews"), { recursive: true });
      await symlink(external, path.join(projectRoot, legacy), "dir");
      await expect(resolveCrDirectory({
        projectRoot,
        implementationArtifacts: "state",
        storyId: "11-9",
        reviewSeries: "directory-routing",
        directoryChoice: legacy,
      })).resolves.toMatchObject({ ok: false, issue: { details: { reason: "unsafe-cr-directory-entry" } } });
      await rm(path.join(projectRoot, legacy));
      await writeCurrent(projectRoot, legacy, { storyId: "11-8" });
      await writeFile(
        path.join(projectRoot, legacy, "11-9-code-review-summary-20260909-directory-routing-round-2.md"),
        currentArtifact("11-8", "directory-routing", 2),
      );
      await expect(resolveCrDirectory({
        projectRoot,
        implementationArtifacts: "state",
        storyId: "11-9",
        reviewSeries: "directory-routing",
        directoryChoice: legacy,
      })).resolves.toMatchObject({ ok: false, issue: { details: { reason: "current-directory-identity-conflict" } } });
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
      await rm(external, { recursive: true, force: true });
    }
  });

  it("validates frozen context and every CR write plane without rediscovering a directory", async () => {
    const projectRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-dir-context-"));
    const context = { ...frozenContext(), projectRoot };
    const writeSubpaths = [
      "11-9-code-review-summary-20260909-directory-routing-round-1.md",
      "11-9-code-review-evaluation-20260909-directory-routing-round-1.md",
      "11-9-cr-rules-extraction-20260909-directory-routing-round-1.md",
      "11-9-cr-todo-result-20260909-directory-routing-round-1.md",
      "11-9-cr-finalizer-20260909-directory-routing-round-1.md",
      ".tmp/directory-routing-round-1/review-input.diff",
      ".tmp/cr-directory-ownership.json",
      "goal-execute-records/PLAN.md",
      "goal-execute-records/EXPERIMENTS.md",
      "goal-execute-records/EXPERIMENT_NOTES.md",
    ];
    try {
      await mkdir(path.join(projectRoot, context.crDir), { recursive: true });
      for (const writeSubpath of writeSubpaths) {
        await expect(validateCrDirectoryContext({
          projectRoot,
          implementationArtifacts: context.implementationArtifacts,
          frozenContext: contextFields(context),
          consumerContext: contextFields(context),
          writeSubpath,
        })).resolves.toEqual({
          ok: true,
          storyId: "11-9",
          reviewSeries: "directory-routing",
          crDir: context.crDir,
          writePath: `${context.crDir}/${writeSubpath}`,
        });
      }
      for (const writeSubpath of ["../escape.md", "/tmp/escape", "nested\\escape.md", "", "."]) {
        await expect(validateCrDirectoryContext({
          projectRoot,
          implementationArtifacts: context.implementationArtifacts,
          frozenContext: contextFields(context),
          consumerContext: contextFields(context),
          writeSubpath,
        })).resolves.toEqual({
          ok: false,
          reason: "invalid-write-subpath",
        });
      }
      await symlink(projectRoot, path.join(projectRoot, context.crDir, ".tmp"), "dir");
      await expect(validateCrDirectoryContext({
        projectRoot,
        implementationArtifacts: context.implementationArtifacts,
        frozenContext: contextFields(context),
        consumerContext: contextFields(context),
        writeSubpath: ".tmp/directory-routing-round-1/input.diff",
      })).resolves.toEqual({ ok: false, reason: "unsafe-write-path" });
      await expect(validateCrDirectoryContext({
        projectRoot,
        implementationArtifacts: context.implementationArtifacts,
        frozenContext: contextFields(context),
        consumerContext: { ...contextFields(context), crDir: "state/code-reviews/11-9-replaced-code-review" },
        writeSubpath: "11-9-code-review-summary-20260909-directory-routing-round-1.md",
      })).resolves.toEqual({ ok: false, reason: "frozen-cr-context-mismatch" });
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it("exposes resolve and validate-context through one strict production CLI without tracker arguments", async () => {
    const projectRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-dir-cli-"));
    try {
      await mkdir(path.join(projectRoot, "state/code-reviews"), { recursive: true });
      const resolved = spawnSync(process.execPath, [RESOLVER, ...resolveArgs(projectRoot)], { encoding: "utf8" });
      expect(resolved.status).toBe(0);
      const context = { ...frozenContext(), projectRoot };
      const validated = spawnSync(
        process.execPath,
        [RESOLVER, ...validateArgs(projectRoot, context, "goal-execute-records/PLAN.md")],
        { encoding: "utf8", cwd: projectRoot },
      );
      expect(validated.status).toBe(0);
      expect(JSON.parse(validated.stdout)).toMatchObject({
        ok: true,
        writePath: "state/code-reviews/11-9-code-review/goal-execute-records/PLAN.md",
      });
      const rejected = spawnSync(
        process.execPath,
        [RESOLVER, ...resolveArgs(projectRoot), "--story-tracker-required", "true"],
        { encoding: "utf8" },
      );
      expect(rejected.status).toBe(2);
      expect(JSON.parse(rejected.stdout)).toEqual({ ok: false, reason: "invalid-arguments" });
      for (const unknown of ["__proto__", "constructor", "prototype"]) {
        const strictUnknown = spawnSync(
          process.execPath,
          [RESOLVER, ...resolveArgs(projectRoot), `--${unknown}`, "ignored"],
          { encoding: "utf8" },
        );
        expect(strictUnknown.status, unknown).toBe(2);
        expect(JSON.parse(strictUnknown.stdout), unknown).toEqual({ ok: false, reason: "invalid-arguments" });
      }
      const duplicate = spawnSync(
        process.execPath,
        [RESOLVER, ...resolveArgs(projectRoot), "--mode", "resolve"],
        { encoding: "utf8" },
      );
      expect(duplicate.status).toBe(2);
      expect(JSON.parse(duplicate.stdout)).toEqual({ ok: false, reason: "invalid-arguments" });
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it("requires runner single resolution and all six real consumers to invoke production validation before writes", async () => {
    const runner = await readFile(
      path.join(IMPLEMENTATION_ROOT, "speclite-goal-orchestrator-epic-story-code-review-runner/references/runner-workflow.md"),
      "utf8",
    );
    expect(runner.match(/--mode "?resolve"?/gu)).toHaveLength(1);
    for (const [leafId, workflow] of Object.entries(LEAF_WORKFLOWS)) {
      const content = await readFile(path.join(IMPLEMENTATION_ROOT, leafId, workflow), "utf8");
      expect(content, leafId).toContain("--mode validate-context");
      expect(content, leafId).toContain("--write-subpath");
      expect(content, leafId).toContain("任何写入前");
      expect(content, leafId).not.toContain("runLeafFrozenContextPreflight");
    }
    for (const field of ["crDir", "canonicalCrDir", "compatibilityMode", "legacyArtifactPaths"]) {
      expect(runner).toContain(`${field}={${field}}`);
    }
  });

  it("projects byte-identical production resolver and validator consumption to both IDE installs", async () => {
    const projectRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-dir-install-"));
    try {
      const outcome = await runInstallCommand({
        options: { json: true, yes: true },
        runtime: {
          nodeVersion: "v22.12.0",
          platform: "darwin",
          platformRelease: "23.0.0",
          cwd: projectRoot,
          targetProject: "directory-routing-contract",
        },
      });
      expect(outcome.exitCode).toBe(0);
      const sourceBytes = await readFile(RESOLVER);
      for (const ideRoot of [".agents/skills", ".claude/skills"]) {
        const installed = path.join(
          projectRoot,
          ideRoot,
          "speclite-code-review-contract/scripts/resolve-cr-directory.mjs",
        );
        await expect(readFile(installed)).resolves.toEqual(sourceBytes);
        expect((await stat(installed)).mode & 0o777).toBe(0o755);
        const resolveProbe = spawnSync(process.execPath, [installed, ...resolveArgs(projectRoot)], {
          cwd: projectRoot,
          encoding: "utf8",
        });
        expect(resolveProbe.status).toBe(0);
        const resolved = JSON.parse(resolveProbe.stdout);
        const context = {
          ...frozenContext(resolved.crDir, resolved.compatibilityMode),
          projectRoot,
          canonicalCrDir: resolved.canonicalCrDir,
          legacyArtifactPaths: resolved.legacyArtifactPaths,
        };
        const validateProbe = spawnSync(
          process.execPath,
          [installed, ...validateArgs(projectRoot, context, ".tmp/directory-routing-round-1/review-input.diff")],
          { cwd: projectRoot, encoding: "utf8" },
        );
        expect(validateProbe.status).toBe(0);
        expect(JSON.parse(validateProbe.stdout)).toMatchObject({ ok: true, crDir: resolved.crDir });
      }
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it("keeps active title-bearing patterns negative while retaining classified legacy compatibility examples", async () => {
    const activeFiles = [
      "speclite-code-review-contract/SKILL.md",
      "speclite-code-review-contract/SKILL.en.md",
      "speclite-code-review-contract/references/cr-contract.md",
      "speclite-goal-orchestrator-epic-story-code-review-runner/SKILL.md",
      "speclite-goal-orchestrator-epic-story-code-review-runner/SKILL.en.md",
      "speclite-goal-orchestrator-epic-story-code-review-runner/references/runner-workflow.md",
      ...Object.entries(LEAF_WORKFLOWS).flatMap(([leafId, workflow]) => [
        `${leafId}/SKILL.md`,
        `${leafId}/SKILL.en.md`,
        `${leafId}/${workflow}`,
      ]),
    ];
    for (const relative of activeFiles) {
      const content = await readFile(path.join(IMPLEMENTATION_ROOT, relative), "utf8");
      expect(content, relative).not.toMatch(/\{story(?:Id|_id)\}-\{story(?:Key|_key|Slug|_slug|Name|_name)\}-code-review/gu);
      expect(content, relative).not.toContain("trackerBindings");
    }
    const ledger = JSON.parse(await readFile(
      path.join(process.cwd(), "test/fixtures/code-review-contract/title-bearing-path-ledger.json"),
      "utf8",
    )) as Array<{ path: string; line: number; token: string; role: string }>;
    expect(ledger.every((entry) => entry.path === "test/cr-directory-resolution.test.ts")).toBe(true);
    expect(ledger.every((entry) => ["legacy-fixture", "regression-assertion"].includes(entry.role))).toBe(true);
    const regressionSource = await readFile(path.join(process.cwd(), "test/cr-directory-resolution.test.ts"), "utf8");
    const regressionLines = regressionSource.split("\n");
    for (const entry of ledger) {
      expect(regressionLines[entry.line - 1], `${entry.path}:${entry.line}`).toContain(entry.token);
    }
    const observed = [...regressionSource.matchAll(/11-9-[a-z-]+-code-review/gu)].map((match) => ({
      line: regressionSource.slice(0, match.index).split("\n").length,
      token: match[0],
    }));
    expect(observed).toEqual(ledger.map(({ line, token }) => ({ line, token })));
    await expect(lstat(RESOLVER)).resolves.toMatchObject({ mode: expect.any(Number) });
  });

  it("ignores ordinary notes while failing selected-series near-current names closed", async () => {
    const projectRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-dir-note-"));
    const legacy = "state/code-reviews/11-9-note-fixture-code-review";
    try {
      await mkdir(path.join(projectRoot, legacy), { recursive: true });
      await writeFile(path.join(projectRoot, legacy, "11-9-code-review-summary-maintenance.md"), "ordinary note\n");
      await expect(resolveCrDirectory({
        projectRoot, implementationArtifacts: "state", storyId: "11-9", reviewSeries: "main",
      })).resolves.toMatchObject({ ok: true, crDir: "state/code-reviews/11-9-code-review" });
      await writeFile(
        path.join(projectRoot, legacy, "11-9-code-review-summary-20260909-main~round-1.md"),
        "near-current malformed name\n",
      );
      await expect(resolveCrDirectory({
        projectRoot, implementationArtifacts: "state", storyId: "11-9", reviewSeries: "main",
      })).resolves.toMatchObject({
        ok: false, issue: { details: { reason: "current-directory-identity-conflict" } },
      });
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it("requires exact v2 identity and rejects semantic duplicates for current artifacts", async () => {
    const cases = [
      ["missing schema and type", "storyId: 11-9\nreviewSeries: directory-routing\nround: 1"],
      ["wrong artifact family", "schemaVersion: speclite.cr-evaluation.v2\nartifactType: code-review-evaluation\nstoryId: 11-9\nreviewSeries: directory-routing\nround: 1"],
      ["quoted bare conflict", "schemaVersion: speclite.cr-review.v2\nartifactType: code-review-summary\nstoryId: 11-9\n\"storyId\": 11-8\nreviewSeries: directory-routing\nround: 1"],
      ["quoted bare same value", "schemaVersion: speclite.cr-review.v2\nartifactType: code-review-summary\nstoryId: 11-9\n'storyId': 11-9\nreviewSeries: directory-routing\nround: 1"],
      ["bare duplicate", "schemaVersion: speclite.cr-review.v2\nartifactType: code-review-summary\nstoryId: 11-9\nstoryId: 11-9\nreviewSeries: directory-routing\nround: 1"],
    ] as const;
    for (const [label, frontmatter] of cases) {
      const projectRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-dir-identity-"));
      const legacy = "state/code-reviews/11-9-identity-fixture-code-review";
      try {
        await mkdir(path.join(projectRoot, legacy), { recursive: true });
        await writeFile(
          path.join(projectRoot, legacy, "11-9-code-review-summary-20260909-directory-routing-round-1.md"),
          `---\n${frontmatter}\nordinaryKey: one\nordinaryKey: two\n---\n`,
        );
        await expect(resolveCrDirectory({
          projectRoot, implementationArtifacts: "state", storyId: "11-9", reviewSeries: "directory-routing",
        }), label).resolves.toMatchObject({
          ok: false, issue: { details: { reason: "current-directory-identity-conflict" } },
        });
      } finally {
        await rm(projectRoot, { recursive: true, force: true });
      }
    }

    const projectRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-dir-identity-positive-"));
    const legacy = "state/code-reviews/11-9-identity-positive-fixture-code-review";
    try {
      await mkdir(path.join(projectRoot, legacy), { recursive: true });
      await writeFile(
        path.join(projectRoot, legacy, "11-9-code-review-summary-20260909-directory-routing-round-1.md"),
        "---\nschemaVersion: speclite.cr-review.v2\nartifactType: code-review-summary\nstoryId: 11-9\nreviewSeries: directory-routing\nround: 1\nordinaryKey: one\nordinaryKey: two\n---\n",
      );
      await expect(resolveCrDirectory({
        projectRoot, implementationArtifacts: "state", storyId: "11-9", reviewSeries: "directory-routing",
      })).resolves.toMatchObject({ ok: true, crDir: legacy, compatibilityMode: "legacy-resume" });
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it("fails selected-series round overflow closed and ignores legal other-series artifacts", async () => {
    const projectRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-dir-round-"));
    const legacy = "state/code-reviews/11-9-round-fixture-code-review";
    try {
      await mkdir(path.join(projectRoot, legacy), { recursive: true });
      await writeFile(
        path.join(projectRoot, legacy, "11-9-code-review-summary-20260909-other-series-round-1.md"),
        "unrelated other series\n",
      );
      await expect(resolveCrDirectory({
        projectRoot, implementationArtifacts: "state", storyId: "11-9", reviewSeries: "directory-routing",
      })).resolves.toMatchObject({ ok: true, crDir: "state/code-reviews/11-9-code-review" });
      await writeFile(
        path.join(projectRoot, legacy, "11-9-code-review-summary-20260909-directory-routing-round-9007199254740991.md"),
        currentArtifact("11-9", "directory-routing", 9007199254740991),
      );
      await expect(resolveCrDirectory({
        projectRoot, implementationArtifacts: "state", storyId: "11-9", reviewSeries: "directory-routing",
      })).resolves.toMatchObject({ ok: true, crDir: legacy, compatibilityMode: "legacy-resume" });
      await writeFile(
        path.join(projectRoot, legacy, "11-9-code-review-summary-20260909-directory-routing-round-9007199254740992.md"),
        "selected series overflow\n",
      );
      await expect(resolveCrDirectory({
        projectRoot, implementationArtifacts: "state", storyId: "11-9", reviewSeries: "directory-routing",
      })).resolves.toMatchObject({
        ok: false, issue: { details: { reason: "current-directory-identity-conflict" } },
      });
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it("resumes only a bounded pre-summary ownership marker without migration or prose inference", async () => {
    const projectRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-dir-marker-"));
    const legacy = "state/code-reviews/11-9-marker-fixture-code-review";
    const canonical = "state/code-reviews/11-9-code-review";
    try {
      await mkdir(path.join(projectRoot, legacy, ".tmp/directory-routing-round-1"), { recursive: true });
      await mkdir(path.join(projectRoot, legacy, "goal-execute-records"), { recursive: true });
      await writeFile(path.join(projectRoot, legacy, ".tmp/directory-routing-round-1/review-input.diff"), "diff\n");
      await writeFile(path.join(projectRoot, legacy, "goal-execute-records/PLAN.md"), "storyId: 11-9\nreviewSeries: directory-routing\n");
      await expect(resolveCrDirectory({
        projectRoot, implementationArtifacts: "state", storyId: "11-9", reviewSeries: "directory-routing",
      })).resolves.toMatchObject({ ok: true, crDir: canonical, compatibilityMode: "canonical" });
      await writeFile(path.join(projectRoot, legacy, ".tmp/cr-directory-ownership.json"), JSON.stringify({
        schemaVersion: "speclite.cr-directory-ownership.v1",
        artifactType: "cr-directory-ownership",
        storyId: "11-9",
        reviewSeries: "directory-routing",
        crDir: legacy,
      }));
      const before = await readdir(path.join(projectRoot, "state/code-reviews"));
      await expect(resolveCrDirectory({
        projectRoot, implementationArtifacts: "state", storyId: "11-9", reviewSeries: "directory-routing",
      })).resolves.toMatchObject({ ok: true, crDir: legacy, compatibilityMode: "legacy-resume" });
      await expect(readdir(path.join(projectRoot, "state/code-reviews"))).resolves.toEqual(before);
      await expect(access(path.join(projectRoot, canonical))).rejects.toThrow();
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it("fails conflicting ownership markers closed and reports marker ambiguity", async () => {
    const projectRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-dir-marker-conflict-"));
    const canonical = "state/code-reviews/11-9-code-review";
    const legacy = "state/code-reviews/11-9-marker-conflict-code-review";
    const marker = (crDir: string) => JSON.stringify({
      schemaVersion: "speclite.cr-directory-ownership.v1",
      artifactType: "cr-directory-ownership",
      storyId: "11-9",
      reviewSeries: "directory-routing",
      crDir,
    });
    try {
      await mkdir(path.join(projectRoot, legacy, ".tmp"), { recursive: true });
      await writeFile(path.join(projectRoot, legacy, ".tmp/cr-directory-ownership.json"), marker(canonical));
      await expect(resolveCrDirectory({
        projectRoot, implementationArtifacts: "state", storyId: "11-9", reviewSeries: "directory-routing",
      })).resolves.toMatchObject({
        ok: false, issue: { details: { reason: "current-directory-identity-conflict" } },
      });
      await rm(path.join(projectRoot, legacy), { recursive: true, force: true });
      for (const crDir of [canonical, legacy]) {
        await mkdir(path.join(projectRoot, crDir, ".tmp"), { recursive: true });
        await writeFile(path.join(projectRoot, crDir, ".tmp/cr-directory-ownership.json"), marker(crDir));
      }
      await expect(resolveCrDirectory({
        projectRoot, implementationArtifacts: "state", storyId: "11-9", reviewSeries: "directory-routing",
      })).resolves.toMatchObject({
        ok: false, issue: { details: { reason: "multiple-current-directory-candidates" } },
      });
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });
});
