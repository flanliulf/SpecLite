import { chmod, mkdir, mkdtemp, readdir, readFile, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { describe, expect, it } from "vitest";
import { createSpecliteProgram } from "../src/bin/speclite.js";
import { runInstallCommand } from "../src/commands/install.js";
import {
  CR_DIRECTORY_RESOLUTION_SCHEMA_VERSION,
  normalizeCrStoryId,
  resolveCrDirectory,
} from "../src/config/cr-directory.js";
import { ResolveCrDirectoryOutputSchema } from "../src/config/resolve-output-schema.js";

const IMPL = "state";
const CODE_REVIEWS = `${IMPL}/code-reviews`;
const CANONICAL = `${CODE_REVIEWS}/11-9-code-review`;

describe("Story 11.9 CR story id normalization", () => {
  it("normalizes canonical numeric identity only", () => {
    expect(normalizeCrStoryId("11.9")).toEqual({ ok: true, storyId: "11-9" });
    expect(normalizeCrStoryId("11-9")).toEqual({ ok: true, storyId: "11-9" });
    expect(normalizeCrStoryId("1.10")).toEqual({ ok: true, storyId: "1-10" });
  });

  it("fails closed on title, locale text, traversal, separators, zero padding, and empty input", () => {
    for (const invalid of [
      "11-9-title",
      "11.9 中文",
      "11.9-按-story-id",
      "../11.9",
      "11/9",
      "11\\9",
      "01.9",
      "11.09",
      "11",
      "11.9.1",
      " 11.9",
      "",
    ]) {
      expect(normalizeCrStoryId(invalid), invalid).toEqual({ ok: false, reason: "invalid-story-id" });
    }
  });
});

describe("Story 11.9 CR directory resolution", () => {
  it("routes a new run to the numeric canonical root without creating it", async () => {
    await withProject(async (projectRoot) => {
      await mkdir(path.join(projectRoot, CODE_REVIEWS), { recursive: true });

      const result = await resolveCrDirectory({
        projectRoot,
        implementationArtifacts: IMPL,
        storyId: "11.9",
        reviewSeries: "restart",
      });

      expect(result).toEqual({
        schemaVersion: CR_DIRECTORY_RESOLUTION_SCHEMA_VERSION,
        ok: true,
        storyId: "11-9",
        reviewSeries: "restart",
        crDir: CANONICAL,
        canonicalCrDir: CANONICAL,
        compatibilityMode: "canonical",
        legacyCrDirs: [],
        roundEvidence: [],
        continuation: "continue",
        issues: [],
      });
      expect(() => ResolveCrDirectoryOutputSchema.parse(result)).not.toThrow();
      await expect(readdir(path.join(projectRoot, CODE_REVIEWS))).resolves.toEqual([]);
    });
  });

  it("resolves the canonical root when code-reviews does not exist yet", async () => {
    await withProject(async (projectRoot) => {
      const result = await resolveCrDirectory({
        projectRoot,
        implementationArtifacts: IMPL,
        storyId: "11-9",
        reviewSeries: "main",
      });
      expect(result).toMatchObject({ ok: true, crDir: CANONICAL, compatibilityMode: "canonical", issues: [] });
      await expect(readdir(projectRoot)).resolves.toEqual([]);
    });
  });

  it("keeps a canonical unfinished run in canonical and only lists completed legacy directories", async () => {
    await withProject(async (projectRoot) => {
      await put(projectRoot, `${CANONICAL}/11-9-code-review-summary-20260911-restart-round-1.md`, "");
      const legacy = `${CODE_REVIEWS}/11-9-normalize-directories-code-review`;
      await put(projectRoot, `${legacy}/11-9-code-review-summary-20260905-restart-round-1.md`, "");
      await put(projectRoot, `${legacy}/11-9-cr-finalizer-20260905-restart-round-1.md`, "");

      const result = await resolveCrDirectory({
        projectRoot,
        implementationArtifacts: IMPL,
        storyId: "11.9",
        reviewSeries: "restart",
      });

      expect(result).toMatchObject({
        ok: true,
        crDir: CANONICAL,
        compatibilityMode: "canonical",
        legacyCrDirs: [legacy],
        continuation: "continue",
        issues: [],
      });
      expect(result.roundEvidence).toEqual([
        { crDir: CANONICAL, summaryRounds: [1], finalizerRounds: [], unfinished: true },
        { crDir: legacy, summaryRounds: [1], finalizerRounds: [1], unfinished: false },
      ]);
    });
  });

  it("resumes the single legacy directory holding an unfinished run of the same series in place", async () => {
    await withProject(async (projectRoot) => {
      const legacy = `${CODE_REVIEWS}/11-9-normalize-code-review-artifact-directories-code-review`;
      await put(projectRoot, `${legacy}/11-9-code-review-summary-20260905-restart-round-1.md`, "");
      await put(projectRoot, `${legacy}/11-9-code-review-summary-20260905-restart-round-2.md`, "");
      await put(projectRoot, `${legacy}/11-9-code-review-evaluation-20260905-restart-round-2.md`, "");

      const result = await resolveCrDirectory({
        projectRoot,
        implementationArtifacts: IMPL,
        storyId: "11.9",
        reviewSeries: "restart",
      });

      expect(result).toMatchObject({
        ok: true,
        crDir: legacy,
        canonicalCrDir: CANONICAL,
        compatibilityMode: "legacy-resume",
        legacyCrDirs: [legacy],
        continuation: "continue",
        issues: [],
      });
      expect(result.roundEvidence).toEqual([
        { crDir: legacy, summaryRounds: [1, 2], finalizerRounds: [], unfinished: true },
      ]);
    });
  });

  it("ignores other series, series-less legacy names, superseded copies, and nested directories when judging unfinished runs", async () => {
    await withProject(async (projectRoot) => {
      const legacy = `${CODE_REVIEWS}/11-9-some-title-code-review`;
      await put(projectRoot, `${legacy}/11-9-code-review-summary-20260905-round-3.md`, "");
      await put(projectRoot, `${legacy}/11-9-code-review-summary-20260905-main-round-1.md`, "");
      await put(projectRoot, `${legacy}/11-9-code-review-summary-20260905-restart-round-1-superseded-1.md`, "");
      await put(projectRoot, `${legacy}/superseded-main/11-9-code-review-summary-20260905-restart-round-1.md`, "");
      await put(projectRoot, `${legacy}/11-19-code-review-summary-20260905-restart-round-1.md`, "");

      const result = await resolveCrDirectory({
        projectRoot,
        implementationArtifacts: IMPL,
        storyId: "11.9",
        reviewSeries: "restart",
      });

      expect(result).toMatchObject({ ok: true, crDir: CANONICAL, compatibilityMode: "canonical", legacyCrDirs: [legacy] });
      expect(result.roundEvidence).toEqual([
        { crDir: legacy, summaryRounds: [], finalizerRounds: [], unfinished: false },
      ]);
    });
  });

  it("does not treat sibling stories or the canonical directory itself as legacy", async () => {
    await withProject(async (projectRoot) => {
      await put(projectRoot, `${CODE_REVIEWS}/11-91-title-code-review/.keep`, "");
      await put(projectRoot, `${CODE_REVIEWS}/11-9-code-review/.keep`, "");
      await put(projectRoot, `${CODE_REVIEWS}/1-9-title-code-review/.keep`, "");
      await put(projectRoot, `${CODE_REVIEWS}/11-9-title-code-review.md`, "not a directory");

      const result = await resolveCrDirectory({
        projectRoot,
        implementationArtifacts: IMPL,
        storyId: "11.9",
        reviewSeries: "restart",
      });

      expect(result).toMatchObject({ ok: true, crDir: CANONICAL, legacyCrDirs: [] });
    });
  });

  it("blocks with the stable ambiguity issue when canonical and a legacy directory both hold unfinished runs, without mutation", async () => {
    await withProject(async (projectRoot) => {
      const legacyB = `${CODE_REVIEWS}/11-9-b-title-code-review`;
      const legacyA = `${CODE_REVIEWS}/11-9-a-title-code-review`;
      await put(projectRoot, `${CANONICAL}/11-9-code-review-summary-20260911-restart-round-1.md`, "");
      await put(projectRoot, `${legacyB}/11-9-code-review-summary-20260905-restart-round-1.md`, "");
      await put(projectRoot, `${legacyA}/11-9-code-review-summary-20260905-restart-round-1.md`, "");
      await put(projectRoot, `${legacyA}/11-9-cr-finalizer-20260905-restart-round-1.md`, "");
      const before = await snapshot(projectRoot);

      const result = await resolveCrDirectory({
        projectRoot,
        implementationArtifacts: IMPL,
        storyId: "11.9",
        reviewSeries: "restart",
      });

      expect(result).toMatchObject({
        ok: false,
        storyId: "11-9",
        reviewSeries: "restart",
        crDir: null,
        canonicalCrDir: CANONICAL,
        compatibilityMode: null,
        legacyCrDirs: [legacyA, legacyB],
        continuation: "block",
      });
      expect(result.issues).toHaveLength(1);
      const issue = result.issues[0]!;
      expect(issue).toMatchObject({
        issueId: "cr-directory.ambiguous-resume-root",
        category: "lifecycle",
        severity: "error",
        continuation: "block",
        component: "cr-directory-resolver",
        affectedPath: CODE_REVIEWS,
      });
      expect(Object.keys(issue.details).sort()).toEqual(
        ["canonicalCrDir", "legacyCrDirs", "reason", "reviewSeries", "roundEvidence", "storyId"],
      );
      expect(issue.details).toMatchObject({
        storyId: "11-9",
        canonicalCrDir: CANONICAL,
        legacyCrDirs: [legacyA, legacyB],
        reviewSeries: "restart",
        reason: "multiple-unfinished-run-roots",
      });
      expect(issue.details.roundEvidence).toEqual([
        { crDir: CANONICAL, summaryRounds: [1], finalizerRounds: [], unfinished: true },
        { crDir: legacyA, summaryRounds: [1], finalizerRounds: [1], unfinished: false },
        { crDir: legacyB, summaryRounds: [1], finalizerRounds: [], unfinished: true },
      ]);
      expect(JSON.stringify(result)).not.toContain(projectRoot);
      expect(JSON.stringify(result)).not.toContain(os.homedir());
      expect(() => ResolveCrDirectoryOutputSchema.parse(result)).not.toThrow();
      await expect(snapshot(projectRoot)).resolves.toEqual(before);
    });
  });

  it("blocks when two legacy directories both hold unfinished runs of the series", async () => {
    await withProject(async (projectRoot) => {
      for (const legacy of ["11-9-x-code-review", "11-9-y-code-review"]) {
        await put(projectRoot, `${CODE_REVIEWS}/${legacy}/11-9-code-review-summary-20260905-restart-round-1.md`, "");
      }

      const result = await resolveCrDirectory({
        projectRoot,
        implementationArtifacts: IMPL,
        storyId: "11.9",
        reviewSeries: "restart",
      });

      expect(result).toMatchObject({ ok: false, crDir: null, continuation: "block" });
      expect(result.issues.map((issue) => issue.issueId)).toEqual(["cr-directory.ambiguous-resume-root"]);
    });
  });

  it("fails closed on invalid story id or review series before touching the filesystem", async () => {
    await withProject(async (projectRoot) => {
      const invalidStory = await resolveCrDirectory({
        projectRoot,
        implementationArtifacts: IMPL,
        storyId: "../11.9",
        reviewSeries: "restart",
      });
      expect(invalidStory).toMatchObject({ ok: false, storyId: null, crDir: null, continuation: "block" });
      expect(invalidStory.issues.map((issue) => issue.issueId)).toEqual(["cr-directory.invalid-story-id"]);
      expect(JSON.stringify(invalidStory)).not.toContain("../11.9");

      const invalidSeries = await resolveCrDirectory({
        projectRoot,
        implementationArtifacts: IMPL,
        storyId: "11.9",
        reviewSeries: "Restart/../x",
      });
      expect(invalidSeries).toMatchObject({ ok: false, reviewSeries: null, crDir: null, continuation: "block" });
      expect(invalidSeries.issues.map((issue) => issue.issueId)).toEqual(["cr-directory.invalid-review-series"]);
      expect(JSON.stringify(invalidSeries)).not.toContain("Restart/../x");
      await expect(readdir(projectRoot)).resolves.toEqual([]);
    });
  });

  it("fails closed when implementation artifacts root escapes the project", async () => {
    await withProject(async (projectRoot) => {
      const result = await resolveCrDirectory({
        projectRoot,
        implementationArtifacts: "../outside",
        storyId: "11.9",
        reviewSeries: "restart",
      });
      expect(result).toMatchObject({ ok: false, crDir: null, canonicalCrDir: null, continuation: "block" });
      expect(result.issues.map((issue) => issue.issueId)).toEqual(["cr-directory.invalid-implementation-artifacts"]);
      expect(JSON.stringify(result)).not.toContain("../outside");
    });
  });

  it("blocks when code-reviews or a candidate directory is a symlink escaping the project boundary", async () => {
    await withProject(async (projectRoot) => {
      const outside = await mkdtemp(path.join(os.tmpdir(), "speclite-cr-outside-"));
      try {
        await mkdir(path.join(projectRoot, IMPL), { recursive: true });
        await mkdir(path.join(outside, "11-9-outside-title-code-review"), { recursive: true });
        await symlink(outside, path.join(projectRoot, CODE_REVIEWS), "dir");

        const result = await resolveCrDirectory({
          projectRoot,
          implementationArtifacts: IMPL,
          storyId: "11.9",
          reviewSeries: "restart",
        });

        expect(result).toMatchObject({ ok: false, crDir: null, continuation: "block", legacyCrDirs: [], roundEvidence: [] });
        expect(result.issues).toHaveLength(1);
        expect(result.issues[0]).toMatchObject({
          issueId: "cr-directory.symlink-escape",
          category: "path-safety",
          affectedPath: CODE_REVIEWS,
        });
        expect(JSON.stringify(result)).not.toContain(outside);
        expect(JSON.stringify(result)).not.toContain("11-9-outside-title-code-review");
      } finally {
        await rm(outside, { recursive: true, force: true });
      }
    });

    await withProject(async (projectRoot) => {
      const outside = await mkdtemp(path.join(os.tmpdir(), "speclite-cr-outside-"));
      try {
        await mkdir(path.join(projectRoot, CODE_REVIEWS), { recursive: true });
        await symlink(outside, path.join(projectRoot, `${CODE_REVIEWS}/11-9-linked-code-review`), "dir");

        const result = await resolveCrDirectory({
          projectRoot,
          implementationArtifacts: IMPL,
          storyId: "11.9",
          reviewSeries: "restart",
        });

        expect(result).toMatchObject({ ok: false, crDir: null, continuation: "block" });
        expect(result.issues[0]).toMatchObject({
          issueId: "cr-directory.symlink-escape",
          affectedPath: `${CODE_REVIEWS}/11-9-linked-code-review`,
        });
      } finally {
        await rm(outside, { recursive: true, force: true });
      }
    });
  });

  it("blocks with a stable issue instead of throwing when code-reviews or the canonical candidate is a regular file", async () => {
    await withProject(async (projectRoot) => {
      await put(projectRoot, CODE_REVIEWS, "not a directory");

      const result = await resolveCrDirectory({
        projectRoot,
        implementationArtifacts: IMPL,
        storyId: "11.9",
        reviewSeries: "restart",
      });

      expect(result).toMatchObject({ ok: false, crDir: null, continuation: "block", legacyCrDirs: [] });
      expect(result.issues).toEqual([
        expect.objectContaining({
          issueId: "cr-directory.unreadable-candidate",
          category: "path-safety",
          affectedPath: CODE_REVIEWS,
          details: expect.objectContaining({ errorCode: "ENOTDIR", reason: "unreadable-candidate" }),
        }),
      ]);
      expect(JSON.stringify(result)).not.toContain(projectRoot);
      expect(() => ResolveCrDirectoryOutputSchema.parse(result)).not.toThrow();
    });

    await withProject(async (projectRoot) => {
      await put(projectRoot, CANONICAL, "not a directory");

      const result = await resolveCrDirectory({
        projectRoot,
        implementationArtifacts: IMPL,
        storyId: "11.9",
        reviewSeries: "restart",
      });

      expect(result).toMatchObject({ ok: false, crDir: null, canonicalCrDir: CANONICAL, continuation: "block" });
      expect(result.issues[0]).toMatchObject({ issueId: "cr-directory.unreadable-candidate", affectedPath: CANONICAL });
      expect(JSON.stringify(result)).not.toContain(projectRoot);
    });
  });

  it("ignores a legacy-named symlink that points at an in-project file instead of throwing ENOTDIR", async () => {
    await withProject(async (projectRoot) => {
      await put(projectRoot, `${CODE_REVIEWS}/notes.md`, "notes");
      await symlink(path.join(projectRoot, `${CODE_REVIEWS}/notes.md`), path.join(projectRoot, `${CODE_REVIEWS}/11-9-linked-code-review`), "file");

      const result = await resolveCrDirectory({
        projectRoot,
        implementationArtifacts: IMPL,
        storyId: "11.9",
        reviewSeries: "restart",
      });

      expect(result).toMatchObject({ ok: true, crDir: CANONICAL, compatibilityMode: "canonical", legacyCrDirs: [], issues: [] });
    });
  });

  it("blocks with a stable issue when a legacy candidate directory is unreadable", async () => {
    if (typeof process.getuid === "function" && process.getuid() === 0) return;
    await withProject(async (projectRoot) => {
      const legacy = `${CODE_REVIEWS}/11-9-locked-code-review`;
      await mkdir(path.join(projectRoot, legacy), { recursive: true });
      await chmod(path.join(projectRoot, legacy), 0o000);
      try {
        const result = await resolveCrDirectory({
          projectRoot,
          implementationArtifacts: IMPL,
          storyId: "11.9",
          reviewSeries: "restart",
        });

        expect(result).toMatchObject({ ok: false, crDir: null, continuation: "block", legacyCrDirs: [legacy] });
        expect(result.issues[0]).toMatchObject({
          issueId: "cr-directory.unreadable-candidate",
          affectedPath: legacy,
          details: expect.objectContaining({ errorCode: "EACCES" }),
        });
        expect(JSON.stringify(result)).not.toContain(projectRoot);
      } finally {
        await chmod(path.join(projectRoot, legacy), 0o755);
      }
    });
  });

  it("accepts symlinks that stay inside the project", async () => {
    await withProject(async (projectRoot) => {
      await mkdir(path.join(projectRoot, "real-code-reviews"), { recursive: true });
      await mkdir(path.join(projectRoot, IMPL), { recursive: true });
      await symlink(path.join(projectRoot, "real-code-reviews"), path.join(projectRoot, CODE_REVIEWS), "dir");

      const result = await resolveCrDirectory({
        projectRoot,
        implementationArtifacts: IMPL,
        storyId: "11.9",
        reviewSeries: "restart",
      });

      expect(result).toMatchObject({ ok: true, crDir: CANONICAL, issues: [] });
    });
  });
});

describe("speclite resolve cr-directory CLI", () => {
  it("emits schema-validated project-relative JSON for a canonical run", async () => {
    await withProject(async (projectRoot) => {
      await writeRuntimeConfig(projectRoot);

      const cli = await runResolveCrDirectory([
        "--story-id", "11.9",
        "--review-series", "restart",
        "--project-root", projectRoot,
      ]);

      expect(cli.exitCodes).toEqual([0]);
      expect(cli.stderr).toBe("");
      const result = ResolveCrDirectoryOutputSchema.parse(JSON.parse(cli.stdout));
      expect(result).toMatchObject({
        ok: true,
        storyId: "11-9",
        reviewSeries: "restart",
        crDir: "_speclite-output/implementation/code-reviews/11-9-code-review",
        canonicalCrDir: "_speclite-output/implementation/code-reviews/11-9-code-review",
        compatibilityMode: "canonical",
        continuation: "continue",
      });
      expect(cli.stdout).not.toContain(projectRoot);
    });
  });

  it("returns block evidence on stdout, the stable issue on stderr, and exit code 1", async () => {
    await withProject(async (projectRoot) => {
      await writeRuntimeConfig(projectRoot);
      const base = "_speclite-output/implementation/code-reviews";
      await put(projectRoot, `${base}/11-9-code-review/11-9-code-review-summary-20260911-restart-round-1.md`, "");
      await put(projectRoot, `${base}/11-9-t-code-review/11-9-code-review-summary-20260905-restart-round-1.md`, "");

      const cli = await runResolveCrDirectory([
        "--story-id", "11-9",
        "--review-series", "restart",
        "--project-root", projectRoot,
      ]);

      expect(cli.exitCodes).toEqual([1]);
      const result = ResolveCrDirectoryOutputSchema.parse(JSON.parse(cli.stdout));
      expect(result).toMatchObject({ ok: false, crDir: null, continuation: "block" });
      const stderrLines = cli.stderr.split("\n").map((line) => JSON.parse(line));
      expect(stderrLines).toHaveLength(1);
      expect(stderrLines[0]).toMatchObject({ issueId: "cr-directory.ambiguous-resume-root", category: "lifecycle" });
      expect(cli.stdout).not.toContain(projectRoot);
      expect(cli.stderr).not.toContain(projectRoot);
    });
  });

  it("rejects missing or invalid options without touching the project", async () => {
    await withProject(async (projectRoot) => {
      await writeRuntimeConfig(projectRoot);

      const missingStory = await runResolveCrDirectory(["--review-series", "restart", "--project-root", projectRoot]);
      expect(missingStory.exitCodes).toEqual([1]);
      expect(missingStory.stdout).toBe("");
      expect(JSON.parse(missingStory.stderr)).toMatchObject({ issueId: "runtime-path.missing-entry", affectedPath: "--story-id" });

      const missingSeries = await runResolveCrDirectory(["--story-id", "11.9", "--project-root", projectRoot]);
      expect(missingSeries.exitCodes).toEqual([1]);
      expect(JSON.parse(missingSeries.stderr)).toMatchObject({ issueId: "runtime-path.missing-entry", affectedPath: "--review-series" });

      const invalidStory = await runResolveCrDirectory(["--story-id", "11-9-title", "--review-series", "restart", "--project-root", projectRoot]);
      expect(invalidStory.exitCodes).toEqual([1]);
      expect(JSON.parse(invalidStory.stdout)).toMatchObject({ ok: false, storyId: null });
      expect(JSON.parse(invalidStory.stderr)).toMatchObject({ issueId: "cr-directory.invalid-story-id" });

      await expect(readdir(path.join(projectRoot, "_speclite-output"))).rejects.toMatchObject({ code: "ENOENT" });
    });
  });

  it("renders the human support frame with the legal command line", async () => {
    await withProject(async (projectRoot) => {
      await writeRuntimeConfig(projectRoot);

      const cli = await runResolveCrDirectory([
        "--story-id", "11.9",
        "--review-series", "restart",
        "--project-root", projectRoot,
        "--human",
        "--locale", "en-US",
      ]);

      expect(cli.exitCodes).toEqual([0]);
      expect(cli.stdout).toContain("SpecLite resolve cr-directory");
      expect(cli.stdout).toContain("Outcome: resolved");
      expect(cli.stdout).not.toContain(projectRoot);

      const invalid = await runResolveCrDirectory(["--human", "--locale", "en-US"]);
      expect(invalid.exitCodes).toEqual([1]);
      expect(invalid.stdout).toContain(
        "speclite resolve cr-directory --story-id <N.N|N-N> --review-series <series> --project-root <projectRoot> [--human]",
      );
    });
  });
});

describe("Story 11.9 canonical corpus closure", () => {
  const placeholderPattern = /\{story(?:Id|_id)\}-\{story(?:Key|Slug|Name|_slug|_name)\}-code-review/;
  const concretePattern = /\b\d+-\d+-[a-z][a-z-]+-code-review\b/;
  const allowlist = new Set<string>([
    // Story / planning prose that documents the legacy shape as read-only compatibility evidence.
  ]);

  it("contains no active title-bearing CR directory expressions", async () => {
    const violations: string[] = [];
    for (const root of ["assets/source/speclite", "docs", "src"]) {
      for (const file of await textFiles(path.join(process.cwd(), root))) {
        const relative = path.relative(process.cwd(), file).split(path.sep).join("/");
        if (allowlist.has(relative)) continue;
        const text = await readFile(file, "utf8");
        for (const pattern of [placeholderPattern, concretePattern]) {
          if (pattern.test(text)) violations.push(`${relative} => ${pattern.source}`);
        }
      }
    }
    expect(violations).toEqual([]);
  });

  it("keeps every allowlisted path present so stale entries cannot hide regressions", async () => {
    for (const relative of allowlist) {
      await expect(readFile(path.join(process.cwd(), relative), "utf8"), relative).resolves.toBeTypeOf("string");
    }
  });

  it("routes runner and CR01-06 through the shared CLI derivation point", async () => {
    const base = "assets/source/speclite/sdlc-skills/4-implementation";
    const runner = await readFile(path.join(base, "speclite-goal-orchestrator-epic-story-code-review-runner/references/runner-workflow.md"), "utf8");
    expect(runner).toContain("speclite resolve cr-directory");
    // Every runner-side CR01-06 invocation must carry the frozen resolver context (AC4).
    const invocations = [...runner.matchAll(/`\/speclite-code-review-0[1-6]-[a-z-]+ \{storyId\}[^`]*`/g)].map((m) => m[0]);
    expect(invocations.length).toBeGreaterThanOrEqual(6);
    for (const invocation of invocations) {
      expect(invocation, invocation).toContain("crDir={crDir}");
      expect(invocation, invocation).toContain("compatibilityMode={compatibilityMode}");
      expect(invocation, invocation).toContain("legacyArtifactPaths={legacyArtifactPaths}");
    }
    expect(runner).toContain("{crDir}/goal-execute-records/");
    for (const record of ["PLAN.md", "EXPERIMENTS.md", "EXPERIMENT_NOTES.md"]) expect(runner).toContain(record);
    const contract = await readFile(path.join(base, "speclite-code-review-contract/references/cr-contract.md"), "utf8");
    expect(contract).toContain("speclite resolve cr-directory");
    expect(contract).toContain("cr-directory.ambiguous-resume-root");
    expect(contract).toContain("{crDir}/goal-execute-records/");
    expect(contract).not.toContain("validate-context");
    expect(contract).not.toContain("cr-directory-ownership");
    for (const consumer of [
      "speclite-code-review-01-reviewer/references/reviewer-workflow.md",
      "speclite-code-review-02-evaluator/references/evaluator-workflow.md",
      "speclite-code-review-03-fixer/references/fixer-workflow.md",
      "speclite-code-review-04-rules-extractor/references/rules-extractor-workflow.md",
      "speclite-code-review-05-todo-tracker/references/todo-tracker-workflow.md",
      "speclite-code-review-06-finalizer/references/finalizer-workflow.md",
    ]) {
      const text = await readFile(path.join(base, consumer), "utf8");
      expect(text, consumer).toContain("crDir");
      expect(text, consumer).toMatch(/不得(?:重新|自行)推导|不重推导/);
      const pkg = consumer.split("/")[0]!;
      for (const entry of ["SKILL.md", "SKILL.en.md"]) {
        const skill = await readFile(path.join(base, pkg, entry), "utf8");
        expect(skill, `${pkg}/${entry}`).toMatch(/`crDir`[^\n]*`compatibilityMode`[^\n]*`legacyArtifactPaths`/);
      }
    }
    await expect(
      readdir(path.join(base, "speclite-code-review-contract")),
    ).resolves.not.toContain("scripts");
  });
});

describe("Story 11.9 fresh-install parity", () => {
  it("projects runner and contract that reference the CLI derivation point without any resolver script", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-cr-install-"));
    try {
      await writeFile(path.join(tempRoot, "README.md"), "project notes\n", "utf8");
      const outcome = await runInstallCommand({
        options: { json: true, yes: true },
        runtime: { nodeVersion: "v22.12.0", platform: "darwin", platformRelease: "23.0.0", cwd: tempRoot },
      });
      expect(outcome.exitCode).toBe(0);

      for (const ide of [".agents/skills", ".claude/skills"]) {
        const runner = await readFile(
          path.join(tempRoot, ide, "speclite-goal-orchestrator-epic-story-code-review-runner/references/runner-workflow.md"),
          "utf8",
        );
        expect(runner, ide).toContain("speclite resolve cr-directory");
        await expect(
          readdir(path.join(tempRoot, ide, "speclite-code-review-contract")),
        ).resolves.not.toContain("scripts");
      }
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });
});

async function withProject(run: (projectRoot: string) => Promise<void>): Promise<void> {
  const projectRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-cr-directory-"));
  try {
    await run(projectRoot);
  } finally {
    await rm(projectRoot, { recursive: true, force: true });
  }
}

async function put(projectRoot: string, relativePath: string, contents: string): Promise<void> {
  const absolutePath = path.join(projectRoot, relativePath);
  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, contents, "utf8");
}

async function writeRuntimeConfig(projectRoot: string): Promise<void> {
  await put(projectRoot, "_speclite/config.toml", [
    "[core]",
    'output_folder = "_speclite-output"',
    "",
    "[modules.sdlc]",
    'planning_artifacts = "_speclite-output/planning"',
    'solutioning_artifacts = "_speclite-output/solutioning"',
    'implementation_artifacts = "_speclite-output/implementation"',
    'devops_artifacts = "_speclite-output/devops"',
    'project_knowledge = "project-knowledge"',
  ].join("\n"));
}

async function runResolveCrDirectory(args: string[]): Promise<{
  stdout: string;
  stderr: string;
  exitCodes: number[];
}> {
  let stdout = "";
  let stderr = "";
  const exitCodes: number[] = [];
  const program = createSpecliteProgram({
    io: {
      stdout: (text) => { stdout += text; },
      stderr: (text) => { stderr += text; },
      setExitCode: (code) => { exitCodes.push(code); },
    },
  });
  await program.parseAsync(["node", "speclite", "resolve", "cr-directory", ...args], { from: "node" });
  return { stdout, stderr: stderr.trim(), exitCodes };
}

async function snapshot(projectRoot: string): Promise<string[]> {
  const entries: string[] = [];
  await visit(projectRoot, (absolutePath) => {
    entries.push(path.relative(projectRoot, absolutePath).split(path.sep).join("/"));
  });
  return entries.sort();
}

async function visit(directory: string, onEntry: (absolutePath: string) => void): Promise<void> {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolutePath = path.join(directory, entry.name);
    onEntry(absolutePath);
    if (entry.isDirectory()) await visit(absolutePath, onEntry);
  }
}

async function textFiles(root: string): Promise<string[]> {
  const files: string[] = [];
  let entries;
  try {
    entries = await readdir(root, { withFileTypes: true });
  } catch (error) {
    if ((error as { code?: string }).code === "ENOENT") return files;
    throw error;
  }
  for (const entry of entries) {
    const absolutePath = path.join(root, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules") continue;
      files.push(...(await textFiles(absolutePath)));
    } else if (entry.isFile() && /\.(?:md|ts|mjs|js|csv|toml|yaml|yml|json|txt)$/.test(entry.name)) {
      files.push(absolutePath);
    }
  }
  return files;
}
