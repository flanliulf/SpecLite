import { mkdtemp, mkdir, readFile, readdir, rm, symlink, writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { describe, expect, it, vi } from "vitest";
import { createSpecliteProgram } from "../src/bin/speclite.js";
import {
  resolveArtifactDocument,
  type ArtifactDocumentSubject,
} from "../src/config/artifact-document-discovery.js";
import type { ArtifactRootResolution } from "../src/config/artifact-root-resolver.js";
import {
  ResolveArtifactDocumentsOutputSchema,
  ResolveStderrJsonLineSchema,
} from "../src/config/resolve-output-schema.js";

const filesystemFaults = vi.hoisted(() => ({
  accessPath: null as string | null,
  readdirPath: null as string | null,
  accessCalls: [] as string[],
  readdirCalls: [] as string[],
}));

const execFileAsync = promisify(execFile);

vi.mock("node:fs/promises", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:fs/promises")>();
  return {
    ...actual,
    access: async (target: Parameters<typeof actual.access>[0], mode?: number) => {
      const normalized = String(target);
      filesystemFaults.accessCalls.push(normalized);
      if (normalized === filesystemFaults.accessPath) {
        throw Object.assign(new Error("injected unreadable path"), { code: "EACCES" });
      }
      return actual.access(target, mode);
    },
    readdir: async (...args: Parameters<typeof actual.readdir>) => {
      const normalized = String(args[0]);
      filesystemFaults.readdirCalls.push(normalized);
      if (normalized === filesystemFaults.readdirPath) {
        throw Object.assign(new Error("injected inaccessible directory"), { code: "EACCES" });
      }
      return actual.readdir(...args);
    },
  };
});

const planningRoot: ArtifactRootResolution = {
  field: "planning_artifacts",
  configPath: "modules.sdlc.planning_artifacts",
  placeholder: "{planning_artifacts}",
  resolvedRoot: "_speclite-output/2-planning-artifacts",
  resolutionMode: "explicit-config",
};

const solutioningRoot: ArtifactRootResolution = {
  field: "solutioning_artifacts",
  configPath: "modules.sdlc.solutioning_artifacts",
  placeholder: "{solutioning_artifacts}",
  resolvedRoot: "_speclite-output/3-solutioning-artifacts",
  resolutionMode: "fresh-default",
};

describe("Planning/Solutioning artifact document discovery", () => {
  it.each([
    ["prd", planningRoot, "prd/prd.md"],
    ["epics", planningRoot, "epics/epics.md"],
    ["architecture", solutioningRoot, "architecture/architecture.md"],
  ] as const)("resolves %s whole-only from its phase-owned subject directory", async (subject, root, relativeWhole) => {
    await withProject(async (projectRoot) => {
      await put(projectRoot, `${root.resolvedRoot}/${relativeWhole}`, "# Whole\n");

      const result = await resolveArtifactDocument({ projectRoot, subject, root });

      expect(result).toMatchObject({
        ok: true,
        subject,
        resolvedRoot: root.resolvedRoot,
        resolutionMode: root.resolutionMode,
        discoveryShape: "whole-only",
        ambiguityStatus: "not-ambiguous",
        actualConsumedPath: `${root.resolvedRoot}/${relativeWhole}`,
        consumedPaths: [`${root.resolvedRoot}/${relativeWhole}`],
        continuation: "continue",
        selection: { value: null, source: "none" },
        issues: [],
      });
    });
  });

  it("consumes only index.md and its explicitly declared in-directory shards", async () => {
    await withProject(async (projectRoot) => {
      const subjectRoot = `${planningRoot.resolvedRoot}/prd`;
      await put(projectRoot, `${subjectRoot}/index.md`, "# PRD\n- [Requirements](requirements.md#functional)\n- [Goals](goals.md)\n- [Goals again](goals.md)\n");
      await put(projectRoot, `${subjectRoot}/goals.md`, "# Goals\n");
      await put(projectRoot, `${subjectRoot}/requirements.md`, "# Requirements\n");
      await put(projectRoot, `${subjectRoot}/unlisted.md`, "# Not part of the declared document\n");

      const result = await resolveArtifactDocument({ projectRoot, subject: "prd", root: planningRoot });

      expect(() => ResolveArtifactDocumentsOutputSchema.parse(result)).not.toThrow();

      expect(result).toMatchObject({
        ok: true,
        discoveryShape: "sharded-only",
        actualConsumedPath: `${subjectRoot}/index.md`,
        continuation: "continue",
      });
      expect(result.consumedPaths).toEqual([
        `${subjectRoot}/index.md`,
        `${subjectRoot}/requirements.md`,
        `${subjectRoot}/goals.md`,
      ]);
      expect(result.declaredShardPaths).toEqual([
        `${subjectRoot}/requirements.md`,
        `${subjectRoot}/goals.md`,
      ]);
      expect(result.consumedPaths).not.toContain(`${subjectRoot}/unlisted.md`);
    });
  });

  it("excludes direct and normalized index self-links from consumed shard paths", async () => {
    await withProject(async (projectRoot) => {
      const subjectRoot = `${planningRoot.resolvedRoot}/prd`;
      await put(projectRoot, `${subjectRoot}/index.md`, [
        "# PRD",
        "- [Self](index.md)",
        "- [Self normalized](./index.md)",
        "- [One](one.md)",
        "- [Self repeated](index.md)",
      ].join("\n"));
      await put(projectRoot, `${subjectRoot}/one.md`, "# One\n");

      const result = await resolveArtifactDocument({ projectRoot, subject: "prd", root: planningRoot });

      expect(result.ok).toBe(true);
      expect(result.declaredShardPaths).toEqual([`${subjectRoot}/one.md`]);
      expect(result.consumedPaths).toEqual([`${subjectRoot}/index.md`, `${subjectRoot}/one.md`]);
    });
  });

  it("supports bounded inline and reference-style local Markdown links", async () => {
    await withProject(async (projectRoot) => {
      const subjectRoot = `${planningRoot.resolvedRoot}/prd`;
      await put(projectRoot, `${subjectRoot}/index.md`, [
        "# PRD",
        "- [Inline](chapter%201.md?raw=1#top)",
        "- [Reference][chapter two]",
        "- [External](https://example.com/ignored.md)",
        "",
        "[chapter two]: <chapter-2.md#section>",
      ].join("\n"));
      await put(projectRoot, `${subjectRoot}/chapter 1.md`, "# Chapter 1\n");
      await put(projectRoot, `${subjectRoot}/chapter-2.md`, "# Chapter 2\n");

      const result = await resolveArtifactDocument({ projectRoot, subject: "prd", root: planningRoot });

      expect(result.ok).toBe(true);
      expect(result.declaredShardPaths).toEqual([
        `${subjectRoot}/chapter 1.md`,
        `${subjectRoot}/chapter-2.md`,
      ]);
      expect(result.consumedPaths).toEqual([
        `${subjectRoot}/index.md`,
        `${subjectRoot}/chapter 1.md`,
        `${subjectRoot}/chapter-2.md`,
      ]);
    });
  });

  it.each([
    {
      name: "inline sharded-only",
      index: "[Directory](directory.md)\n",
      includeWhole: false,
      selection: undefined,
    },
    {
      name: "reference-style whole+sharded without selection",
      index: "[Directory][directory]\n\n[directory]: directory.md\n",
      includeWhole: true,
      selection: undefined,
    },
    {
      name: "inline whole+sharded with selection=sharded",
      index: "[Directory](directory.md)\n",
      includeWhole: true,
      selection: "sharded" as const,
    },
  ])("blocks a declared shard symlink to a directory for $name", async ({ index, includeWhole, selection }) => {
    await withProject(async (projectRoot) => {
      const subjectRoot = `${planningRoot.resolvedRoot}/prd`;
      await put(projectRoot, `${subjectRoot}/index.md`, index);
      if (includeWhole) await put(projectRoot, `${subjectRoot}/prd.md`, "# Whole\n");
      await mkdir(path.join(projectRoot, subjectRoot, "directory-target"), { recursive: true });
      await symlink(
        path.join(projectRoot, subjectRoot, "directory-target"),
        path.join(projectRoot, subjectRoot, "directory.md"),
      );
      const before = await snapshot(projectRoot, subjectRoot);
      const resolve = () => resolveArtifactDocument({
        projectRoot,
        subject: "prd",
        root: planningRoot,
        ...(selection === undefined ? {} : { selection }),
      });

      const result = await resolve();
      const repeated = await resolve();

      expect(() => ResolveArtifactDocumentsOutputSchema.parse(result)).not.toThrow();
      expect(result).toMatchObject({
        ok: false,
        discoveryShape: "invalid-sharded",
        actualConsumedPath: null,
        consumedPaths: [],
        declaredShardPaths: [],
        continuation: "block",
      });
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0]).toMatchObject({
        issueId: "artifact-path.broken-shard-reference",
        affectedPath: `${subjectRoot}/index.md`,
        details: {
          reason: "unreadable-shard",
          referenceKind: "unreadable-shard",
        },
      });
      expect(repeated).toEqual(result);
      expect(JSON.stringify(result)).not.toContain(projectRoot);
      expect(JSON.stringify(result)).not.toContain("directory-target");
      expect(await snapshot(projectRoot, subjectRoot)).toEqual(before);
    });
  });

  it.runIf(process.platform !== "win32")(
    "blocks a reference-style declared shard symlink to a FIFO without opening it",
    async () => {
      await withProject(async (projectRoot) => {
        const subjectRoot = `${planningRoot.resolvedRoot}/prd`;
        const fifoPath = path.join(projectRoot, subjectRoot, "fifo-target");
        await put(projectRoot, `${subjectRoot}/prd.md`, "# Whole\n");
        await put(projectRoot, `${subjectRoot}/index.md`, "[Pipe][pipe]\n\n[pipe]: pipe.md\n");
        await execFileAsync("mkfifo", [fifoPath]);
        await symlink(fifoPath, path.join(projectRoot, subjectRoot, "pipe.md"));
        const before = await snapshot(projectRoot, subjectRoot);
        const resolve = () => resolveArtifactDocument({
          projectRoot,
          subject: "prd",
          root: planningRoot,
          selection: "sharded",
        });

        const result = await resolve();
        const repeated = await resolve();

        expect(() => ResolveArtifactDocumentsOutputSchema.parse(result)).not.toThrow();
        expect(result).toMatchObject({
          ok: false,
          discoveryShape: "invalid-sharded",
          actualConsumedPath: null,
          consumedPaths: [],
          declaredShardPaths: [],
          continuation: "block",
        });
        expect(result.issues[0]).toMatchObject({
          issueId: "artifact-path.broken-shard-reference",
          affectedPath: `${subjectRoot}/index.md`,
          details: {
            reason: "unreadable-shard",
            referenceKind: "unreadable-shard",
          },
        });
        expect(repeated).toEqual(result);
        expect(JSON.stringify(result)).not.toContain(projectRoot);
        expect(JSON.stringify(result)).not.toContain("fifo-target");
        expect(await snapshot(projectRoot, subjectRoot)).toEqual(before);
      });
    },
  );

  it("continues for an in-bound declared shard symlink to a regular file", async () => {
    await withProject(async (projectRoot) => {
      const subjectRoot = `${planningRoot.resolvedRoot}/prd`;
      await put(projectRoot, `${subjectRoot}/index.md`, "[Linked](linked.md)\n");
      await put(projectRoot, `${subjectRoot}/regular-target.md`, "# Linked\n");
      await symlink(
        path.join(projectRoot, subjectRoot, "regular-target.md"),
        path.join(projectRoot, subjectRoot, "linked.md"),
      );

      const result = await resolveArtifactDocument({ projectRoot, subject: "prd", root: planningRoot });

      expect(() => ResolveArtifactDocumentsOutputSchema.parse(result)).not.toThrow();
      expect(result).toMatchObject({
        ok: true,
        discoveryShape: "sharded-only",
        actualConsumedPath: `${subjectRoot}/index.md`,
        consumedPaths: [`${subjectRoot}/index.md`, `${subjectRoot}/linked.md`],
        declaredShardPaths: [`${subjectRoot}/linked.md`],
        continuation: "continue",
      });
    });
  });

  it("keeps an outbound declared shard symlink on the containment diagnostic", async () => {
    await withProject(async (projectRoot) => {
      const subjectRoot = `${planningRoot.resolvedRoot}/prd`;
      await put(projectRoot, `${subjectRoot}/index.md`, "[Outside](outside.md)\n");
      await put(projectRoot, "outside-target.md", "# Outside\n");
      await symlink(
        path.join(projectRoot, "outside-target.md"),
        path.join(projectRoot, subjectRoot, "outside.md"),
      );

      const result = await resolveArtifactDocument({ projectRoot, subject: "prd", root: planningRoot });

      expect(result).toMatchObject({
        ok: false,
        actualConsumedPath: null,
        consumedPaths: [],
        continuation: "block",
      });
      expect(result.issues[0]).toMatchObject({
        issueId: "artifact-path.broken-shard-reference",
        affectedPath: `${subjectRoot}/index.md`,
        details: { referenceKind: "outside-subject-directory" },
      });
    });
  });

  it("retains first-definition classification while ignoring defined non-shard references", async () => {
    await withProject(async (projectRoot) => {
      const subjectRoot = `${planningRoot.resolvedRoot}/prd`;
      await put(projectRoot, `${subjectRoot}/index.md`, [
        "[External full][external]",
        "[Angle collapsed][]",
        "[network]",
        "[fragment]",
        "[First ignore][first ignore]",
        "[First local][first local]",
        "[Local][local]",
        "",
        "[external]: https://example.com/ignored.md",
        "[angle collapsed]: <mailto:owner@example.com>",
        "[network]: //cdn.example.com/ignored.md",
        "[fragment]: #section",
        "[first ignore]: https://example.com/first.md",
        "[first ignore]: should-not-be-consumed.md",
        "[first local]: first.md",
        "[first local]: https://example.com/second.md",
        "[local]: local.md",
      ].join("\n"));
      await put(projectRoot, `${subjectRoot}/first.md`, "# First\n");
      await put(projectRoot, `${subjectRoot}/local.md`, "# Local\n");
      const before = await snapshot(projectRoot, planningRoot.resolvedRoot);

      const result = await resolveArtifactDocument({ projectRoot, subject: "prd", root: planningRoot });

      expect(result).toMatchObject({
        ok: true,
        actualConsumedPath: `${subjectRoot}/index.md`,
        continuation: "continue",
      });
      expect(result.declaredShardPaths).toEqual([
        `${subjectRoot}/first.md`,
        `${subjectRoot}/local.md`,
      ]);
      expect(result.consumedPaths).toEqual([`${subjectRoot}/index.md`, ...result.declaredShardPaths]);
      expect(await snapshot(projectRoot, planningRoot.resolvedRoot)).toEqual(before);
    });
  });

  it("applies first-definition-wins before parsing duplicate destinations", async () => {
    await withProject(async (projectRoot) => {
      const subjectRoot = `${planningRoot.resolvedRoot}/prd`;
      await put(projectRoot, `${subjectRoot}/index.md`, [
        "[Local][local]",
        "[Ignored][ignored]",
        "",
        "[local]: local.md",
        "[local]: bad%ZZ.md",
        String.raw`[local]: dir\unportable.md`,
        "[local]: https://example.com/duplicate.md",
        "[ignored]: https://example.com/first.md",
        "[ignored]: should-not-be-consumed.md",
        "[ignored]:",
      ].join("\n"));
      await put(projectRoot, `${subjectRoot}/local.md`, "# Local\n");
      await put(projectRoot, `${subjectRoot}/should-not-be-consumed.md`, "# Duplicate\n");
      const before = await snapshot(projectRoot, planningRoot.resolvedRoot);

      const result = await resolveArtifactDocument({ projectRoot, subject: "prd", root: planningRoot });

      expect(result.ok).toBe(true);
      expect(result.declaredShardPaths).toEqual([`${subjectRoot}/local.md`]);
      expect(result.consumedPaths).not.toContain(`${subjectRoot}/should-not-be-consumed.md`);
      expect(await snapshot(projectRoot, planningRoot.resolvedRoot)).toEqual(before);
    });
  });

  it("supports nested inline text and normalized case-insensitive shortcut references in declaration order", async () => {
    await withProject(async (projectRoot) => {
      const subjectRoot = `${planningRoot.resolvedRoot}/prd`;
      await put(projectRoot, `${subjectRoot}/index.md`, [
        "# PRD",
        "- [Nested [label]](nested.md)",
        "- [  SHORT   CUT  ]",
        "- [Full][other]",
        "",
        "[short cut]: shortcut.md",
        "[OTHER]: other.md",
      ].join("\n"));
      for (const shard of ["nested.md", "shortcut.md", "other.md"]) {
        await put(projectRoot, `${subjectRoot}/${shard}`, `# ${shard}\n`);
      }

      const result = await resolveArtifactDocument({ projectRoot, subject: "prd", root: planningRoot });

      expect(result.ok).toBe(true);
      expect(result.declaredShardPaths).toEqual([
        `${subjectRoot}/nested.md`,
        `${subjectRoot}/shortcut.md`,
        `${subjectRoot}/other.md`,
      ]);
      expect(result.consumedPaths).toEqual([`${subjectRoot}/index.md`, ...result.declaredShardPaths]);
    });
  });

  it("ignores angle-wrapped external and network destinations while consuming angle-wrapped local Markdown", async () => {
    await withProject(async (projectRoot) => {
      const subjectRoot = `${planningRoot.resolvedRoot}/prd`;
      await put(projectRoot, `${subjectRoot}/index.md`, [
        "[HTTPS](<https://example.com/ignored.md>)",
        "[Mail](<mailto:owner@example.com>)",
        "[Network](<//cdn.example.com/ignored.md>)",
        "[Local](<local.md?raw=1#top>)",
      ].join("\n"));
      await put(projectRoot, `${subjectRoot}/local.md`, "# Local\n");

      const result = await resolveArtifactDocument({ projectRoot, subject: "prd", root: planningRoot });

      expect(result.ok).toBe(true);
      expect(result.declaredShardPaths).toEqual([`${subjectRoot}/local.md`]);
      expect(result.consumedPaths).toEqual([`${subjectRoot}/index.md`, `${subjectRoot}/local.md`]);
    });
  });

  it("excludes backtick and tilde fenced code while retaining links outside fences", async () => {
    await withProject(async (projectRoot) => {
      const subjectRoot = `${planningRoot.resolvedRoot}/prd`;
      await put(projectRoot, `${subjectRoot}/index.md`, [
        "[Before](before.md)",
        "   ````ts",
        "[Ignored inline](ignored-inline.md)",
        "[ignored-ref]: ignored-definition.md",
        "[Ignored Ref][ignored-ref]",
        "   `````",
        "~~~",
        "[Ignored tilde](ignored-tilde.md)",
        "~~~",
        "[After](after.md)",
        "```",
        "[Ignored to EOF](ignored-eof.md)",
      ].join("\n"));
      await put(projectRoot, `${subjectRoot}/before.md`, "# Before\n");
      await put(projectRoot, `${subjectRoot}/after.md`, "# After\n");

      const result = await resolveArtifactDocument({ projectRoot, subject: "prd", root: planningRoot });

      expect(result.ok).toBe(true);
      expect(result.declaredShardPaths).toEqual([
        `${subjectRoot}/before.md`,
        `${subjectRoot}/after.md`,
      ]);
    });
  });

  it("blocks whole+sharded without selection and consumes only the invocation-selected shape", async () => {
    await withProject(async (projectRoot) => {
      const subjectRoot = `${planningRoot.resolvedRoot}/epics`;
      await put(projectRoot, `${subjectRoot}/epics.md`, "# Whole\n");
      await put(projectRoot, `${subjectRoot}/index.md`, "# Index\n- [Epic 1](epic-1.md)\n");
      await put(projectRoot, `${subjectRoot}/epic-1.md`, "# Epic 1\n");

      const before = await snapshot(projectRoot, subjectRoot);
      const ambiguous = await resolveArtifactDocument({ projectRoot, subject: "epics", root: planningRoot });
      expect(ambiguous).toMatchObject({
        ok: false,
        discoveryShape: "whole+sharded",
        ambiguityStatus: "selection-required",
        actualConsumedPath: null,
        consumedPaths: [],
        continuation: "block",
        selection: { value: null, source: "none" },
      });
      expect(ambiguous.issues.map((issue) => issue.issueId)).toEqual([
        "artifact-path.ambiguous-subject-document-shape",
      ]);
      expect(await snapshot(projectRoot, subjectRoot)).toEqual(before);

      const whole = await resolveArtifactDocument({
        projectRoot,
        subject: "epics",
        root: planningRoot,
        selection: "whole",
      });
      expect(whole).toMatchObject({
        ok: true,
        ambiguityStatus: "resolved-by-explicit-selection",
        actualConsumedPath: `${subjectRoot}/epics.md`,
        consumedPaths: [`${subjectRoot}/epics.md`],
        unselectedPath: `${subjectRoot}/index.md`,
        selection: { value: "whole", source: "invocation" },
      });

      const sharded = await resolveArtifactDocument({
        projectRoot,
        subject: "epics",
        root: planningRoot,
        selection: "sharded",
      });
      expect(sharded).toMatchObject({
        ok: true,
        ambiguityStatus: "resolved-by-explicit-selection",
        actualConsumedPath: `${subjectRoot}/index.md`,
        consumedPaths: [`${subjectRoot}/index.md`, `${subjectRoot}/epic-1.md`],
        unselectedPath: `${subjectRoot}/epics.md`,
        selection: { value: "sharded", source: "invocation" },
      });
      expect(await snapshot(projectRoot, subjectRoot)).toEqual(before);
    });
  });

  it.each([
    ["missing shard", "[Missing](missing.md)\n"],
    ["malformed destination", "[Malformed](bad%ZZ.md)\n"],
    ["undefined reference", "[Missing][undefined]\n"],
  ])("selection=whole skips the safe unselected index graph with %s", async (_name, index) => {
    await withProject(async (projectRoot) => {
      const subjectRoot = `${planningRoot.resolvedRoot}/prd`;
      await put(projectRoot, `${subjectRoot}/prd.md`, "# Whole\n");
      await put(projectRoot, `${subjectRoot}/index.md`, index);
      const before = await snapshot(projectRoot, subjectRoot);

      const result = await resolveArtifactDocument({
        projectRoot,
        subject: "prd",
        root: planningRoot,
        selection: "whole",
      });

      expect(result).toMatchObject({
        ok: true,
        discoveryShape: "whole+sharded",
        ambiguityStatus: "resolved-by-explicit-selection",
        actualConsumedPath: `${subjectRoot}/prd.md`,
        consumedPaths: [`${subjectRoot}/prd.md`],
        declaredShardPaths: [],
        unselectedPath: `${subjectRoot}/index.md`,
        continuation: "continue",
      });
      expect(await snapshot(projectRoot, subjectRoot)).toEqual(before);
    });
  });

  it.each([undefined, "sharded" as const])("still validates a broken index graph for selection=%s", async (selection) => {
    await withProject(async (projectRoot) => {
      const subjectRoot = `${planningRoot.resolvedRoot}/prd`;
      await put(projectRoot, `${subjectRoot}/prd.md`, "# Whole\n");
      await put(projectRoot, `${subjectRoot}/index.md`, "[Missing](missing.md)\n");
      const before = await snapshot(projectRoot, subjectRoot);

      const result = await resolveArtifactDocument({
        projectRoot,
        subject: "prd",
        root: planningRoot,
        ...(selection === undefined ? {} : { selection }),
      });

      expect(result).toMatchObject({
        ok: false,
        actualConsumedPath: null,
        consumedPaths: [],
        continuation: "block",
      });
      expect(result.issues[0]).toMatchObject({
        issueId: "artifact-path.broken-shard-reference",
        details: { referenceKind: "missing-shard" },
      });
      expect(await snapshot(projectRoot, subjectRoot)).toEqual(before);
    });
  });

  it("blocks an unsafe canonical index entry even when selection=whole", async () => {
    await withProject(async (projectRoot) => {
      const subjectRoot = `${planningRoot.resolvedRoot}/prd`;
      await put(projectRoot, `${subjectRoot}/prd.md`, "# Whole\n");
      await put(projectRoot, "outside-index.md", "[Missing](missing.md)\n");
      await symlink(path.join(projectRoot, "outside-index.md"), path.join(projectRoot, subjectRoot, "index.md"));
      const before = await snapshot(projectRoot, ".");

      const result = await resolveArtifactDocument({
        projectRoot,
        subject: "prd",
        root: planningRoot,
        selection: "whole",
      });

      expect(result).toMatchObject({ ok: false, actualConsumedPath: null, consumedPaths: [], continuation: "block" });
      expect(result.issues[0]).toMatchObject({
        issueId: "artifact-path.symlink-escape",
        affectedPath: `${subjectRoot}/index.md`,
      });
      expect(await snapshot(projectRoot, ".")).toEqual(before);
    });
  });

  it("blocks a non-file canonical index entry even when selection=whole", async () => {
    await withProject(async (projectRoot) => {
      const subjectRoot = `${planningRoot.resolvedRoot}/prd`;
      await put(projectRoot, `${subjectRoot}/prd.md`, "# Whole\n");
      await mkdir(path.join(projectRoot, subjectRoot, "index.md"), { recursive: true });
      const before = await snapshot(projectRoot, subjectRoot);

      const result = await resolveArtifactDocument({
        projectRoot,
        subject: "prd",
        root: planningRoot,
        selection: "whole",
      });

      expect(result).toMatchObject({ ok: false, actualConsumedPath: null, consumedPaths: [], continuation: "block" });
      expect(result.issues[0]).toMatchObject({
        issueId: "artifact-path.broken-shard-reference",
        affectedPath: `${subjectRoot}/index.md`,
        details: { referenceKind: "unreadable-shard" },
      });
      expect(await snapshot(projectRoot, subjectRoot)).toEqual(before);
    });
  });

  it.each([undefined, "whole" as const, "sharded" as const])(
    "blocks a canonical index symlink whose final target is a directory for selection=%s",
    async (selection) => {
      await withProject(async (projectRoot) => {
        const subjectRoot = `${planningRoot.resolvedRoot}/prd`;
        await put(projectRoot, `${subjectRoot}/prd.md`, "# Whole\n");
        await mkdir(path.join(projectRoot, subjectRoot, "real-index-directory"), { recursive: true });
        await symlink(
          path.join(projectRoot, subjectRoot, "real-index-directory"),
          path.join(projectRoot, subjectRoot, "index.md"),
        );
        const before = await snapshot(projectRoot, subjectRoot);

        const result = await resolveArtifactDocument({
          projectRoot,
          subject: "prd",
          root: planningRoot,
          ...(selection === undefined ? {} : { selection }),
        });

        expect(() => ResolveArtifactDocumentsOutputSchema.parse(result)).not.toThrow();
        expect(result).toMatchObject({
          ok: false,
          discoveryShape: "invalid-sharded",
          actualConsumedPath: null,
          consumedPaths: [],
          continuation: "block",
        });
        expect(result.issues[0]).toMatchObject({
          issueId: "artifact-path.broken-shard-reference",
          affectedPath: `${subjectRoot}/index.md`,
          details: {
            reason: "unreadable-shard",
            referenceKind: "unreadable-shard",
          },
        });
        expect(JSON.stringify(result)).not.toContain(projectRoot);
        expect(await snapshot(projectRoot, subjectRoot)).toEqual(before);
      });
    },
  );

  it.each([undefined, "whole" as const, "sharded" as const])(
    "fails closed for a non-file canonical whole before shape selection=%s",
    async (selection) => {
      await withProject(async (projectRoot) => {
        const subjectRoot = `${planningRoot.resolvedRoot}/prd`;
        const wholePath = `${subjectRoot}/prd.md`;
        await mkdir(path.join(projectRoot, wholePath), { recursive: true });
        await put(projectRoot, `${subjectRoot}/index.md`, "[One](one.md)\n");
        await put(projectRoot, `${subjectRoot}/one.md`, "# One\n");
        const before = await snapshot(projectRoot, subjectRoot);

        const resolve = () => resolveArtifactDocument({
          projectRoot,
          subject: "prd",
          root: planningRoot,
          ...(selection === undefined ? {} : { selection }),
        });
        const result = await resolve();
        const repeated = await resolve();

        expect(() => ResolveArtifactDocumentsOutputSchema.parse(result)).not.toThrow();
        expect(result).toMatchObject({
          ok: false,
          discoveryShape: "subject-missing",
          ambiguityStatus: "not-ambiguous",
          actualConsumedPath: null,
          consumedPaths: [],
          continuation: "block",
        });
        expect(result.issues).toHaveLength(1);
        expect(result.issues[0]).toEqual(expect.objectContaining({
          issueId: "artifact-path.subject-document-missing",
          affectedPath: wholePath,
          details: expect.objectContaining({
            actualConsumedPath: wholePath,
            reason: "canonical-whole-unreadable",
            discoveryShape: "subject-missing",
            ambiguityStatus: "not-ambiguous",
            selectionSource: selection === undefined ? "none" : "invocation",
            entryKind: "canonical-whole",
            entryState: "unreadable",
          }),
        }));
        expect(repeated).toEqual(result);
        expect(await snapshot(projectRoot, subjectRoot)).toEqual(before);
      });
    },
  );

  it.each([undefined, "whole" as const, "sharded" as const])(
    "fails closed for a canonical whole symlink to a directory before selection=%s",
    async (selection) => {
      await withProject(async (projectRoot) => {
        const subjectRoot = `${planningRoot.resolvedRoot}/prd`;
        const wholePath = `${subjectRoot}/prd.md`;
        await mkdir(path.join(projectRoot, subjectRoot, "whole-directory"), { recursive: true });
        await symlink(
          path.join(projectRoot, subjectRoot, "whole-directory"),
          path.join(projectRoot, wholePath),
        );
        await put(projectRoot, `${subjectRoot}/index.md`, "[One](one.md)\n");
        await put(projectRoot, `${subjectRoot}/one.md`, "# One\n");
        const before = await snapshot(projectRoot, subjectRoot);

        const result = await resolveArtifactDocument({
          projectRoot,
          subject: "prd",
          root: planningRoot,
          ...(selection === undefined ? {} : { selection }),
        });

        expect(() => ResolveArtifactDocumentsOutputSchema.parse(result)).not.toThrow();
        expect(result).toMatchObject({
          ok: false,
          discoveryShape: "subject-missing",
          actualConsumedPath: null,
          consumedPaths: [],
          continuation: "block",
        });
        expect(result.issues[0]).toMatchObject({
          issueId: "artifact-path.subject-document-missing",
          affectedPath: wholePath,
          details: {
            reason: "canonical-whole-unreadable",
            entryKind: "canonical-whole",
            entryState: "unreadable",
          },
        });
        expect(JSON.stringify(result)).not.toContain(projectRoot);
        expect(await snapshot(projectRoot, subjectRoot)).toEqual(before);
      });
    },
  );

  it.runIf(process.platform !== "win32").each([undefined, "whole" as const, "sharded" as const])(
    "fails closed without opening a canonical whole symlink to a FIFO for selection=%s",
    async (selection) => {
      await withProject(async (projectRoot) => {
        const subjectRoot = `${planningRoot.resolvedRoot}/prd`;
        const wholePath = `${subjectRoot}/prd.md`;
        const fifoPath = path.join(projectRoot, subjectRoot, "whole-fifo");
        await mkdir(path.dirname(fifoPath), { recursive: true });
        await execFileAsync("mkfifo", [fifoPath]);
        await symlink(fifoPath, path.join(projectRoot, wholePath));

        const result = await resolveArtifactDocument({
          projectRoot,
          subject: "prd",
          root: planningRoot,
          ...(selection === undefined ? {} : { selection }),
        });

        expect(result).toMatchObject({
          ok: false,
          discoveryShape: "subject-missing",
          actualConsumedPath: null,
          consumedPaths: [],
          continuation: "block",
        });
        expect(result.issues[0]).toMatchObject({
          issueId: "artifact-path.subject-document-missing",
          details: { reason: "canonical-whole-unreadable" },
        });
      });
    },
  );

  it("maps an injected canonical whole readability failure without reading index or mismatch probes", async () => {
    await withProject(async (projectRoot) => {
      const subjectRoot = `${planningRoot.resolvedRoot}/prd`;
      const wholePath = `${subjectRoot}/prd.md`;
      const wholeAbsolutePath = path.join(projectRoot, wholePath);
      const indexAbsolutePath = path.join(projectRoot, subjectRoot, "index.md");
      await put(projectRoot, wholePath, "# Whole\n");
      await put(projectRoot, `${subjectRoot}/index.md`, "[Missing](missing.md)\n");
      await put(projectRoot, `${planningRoot.resolvedRoot}/prd.md`, "# Legacy mismatch probe\n");
      const before = await snapshot(projectRoot, planningRoot.resolvedRoot);

      filesystemFaults.accessCalls = [];
      filesystemFaults.accessPath = wholeAbsolutePath;
      let result;
      try {
        result = await resolveArtifactDocument({ projectRoot, subject: "prd", root: planningRoot });
      } finally {
        filesystemFaults.accessPath = null;
      }

      expect(() => ResolveArtifactDocumentsOutputSchema.parse(result)).not.toThrow();
      expect(result).toMatchObject({
        ok: false,
        actualConsumedPath: null,
        consumedPaths: [],
        continuation: "block",
      });
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0]).toMatchObject({
        issueId: "artifact-path.subject-document-missing",
        affectedPath: wholePath,
        details: {
          actualConsumedPath: wholePath,
          reason: "canonical-whole-unreadable",
          entryKind: "canonical-whole",
          entryState: "unreadable",
        },
      });
      expect(filesystemFaults.accessCalls).not.toContain(indexAbsolutePath);
      expect(JSON.stringify(result)).not.toContain(projectRoot);
      expect(JSON.stringify(result)).not.toContain("injected unreadable path");
      expect(await snapshot(projectRoot, planningRoot.resolvedRoot)).toEqual(before);
    });
  });

  it.each([
    [undefined, false, "block"],
    ["whole" as const, true, "continue"],
    ["sharded" as const, true, "continue"],
  ] as const)(
    "does not scan undeclared subject content when index is present and selection=%s",
    async (selection, expectedOk, expectedContinuation) => {
      await withProject(async (projectRoot) => {
        const subjectRoot = `${planningRoot.resolvedRoot}/prd`;
        const subjectAbsolutePath = path.join(projectRoot, subjectRoot);
        await put(projectRoot, `${subjectRoot}/prd.md`, "# Whole\n");
        await put(projectRoot, `${subjectRoot}/index.md`, "[One](one.md)\n");
        await put(projectRoot, `${subjectRoot}/one.md`, "# One\n");
        await put(projectRoot, `${subjectRoot}/undeclared/private.md`, "# Unrelated\n");
        const before = await snapshot(projectRoot, subjectRoot);

        filesystemFaults.readdirCalls = [];
        filesystemFaults.readdirPath = subjectAbsolutePath;
        let result;
        let repeated;
        try {
          const resolve = () => resolveArtifactDocument({
            projectRoot,
            subject: "prd",
            root: planningRoot,
            ...(selection === undefined ? {} : { selection }),
          });
          result = await resolve();
          repeated = await resolve();
        } finally {
          filesystemFaults.readdirPath = null;
        }

        expect(result.ok).toBe(expectedOk);
        expect(result.continuation).toBe(expectedContinuation);
        expect(repeated).toEqual(result);
        expect(filesystemFaults.readdirCalls).not.toContain(subjectAbsolutePath);
        expect(JSON.stringify(result)).not.toContain("injected inaccessible directory");
        expect(await snapshot(projectRoot, subjectRoot)).toEqual(before);
      });
    },
  );

  it("still detects root-level and nested shard candidates when index is missing", async () => {
    await withProject(async (projectRoot) => {
      const subjectRoot = `${planningRoot.resolvedRoot}/prd`;
      await put(projectRoot, `${subjectRoot}/root.md`, "# Root\n");
      await put(projectRoot, `${subjectRoot}/nested/chapter.md`, "# Nested\n");
      const before = await snapshot(projectRoot, subjectRoot);

      const result = await resolveArtifactDocument({ projectRoot, subject: "prd", root: planningRoot });

      expect(result).toMatchObject({
        ok: false,
        discoveryShape: "invalid-sharded",
        actualConsumedPath: null,
        consumedPaths: [],
        continuation: "block",
      });
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0]).toMatchObject({
        issueId: "artifact-path.invalid-sharded-document-shape",
        details: { reason: "shards-without-index" },
      });
      expect(await snapshot(projectRoot, subjectRoot)).toEqual(before);
    });
  });

  it.each(["root", "nested"] as const)(
    "maps an unreadable %s missing-index candidate scan to Option I evidence",
    async (failureLocation) => {
      await withProject(async (projectRoot) => {
        const subjectRoot = `${planningRoot.resolvedRoot}/prd`;
        const subjectAbsolutePath = path.join(projectRoot, subjectRoot);
        const nestedRelativePath = `${subjectRoot}/nested`;
        const failingAbsolutePath = failureLocation === "root"
          ? subjectAbsolutePath
          : path.join(projectRoot, nestedRelativePath);
        await mkdir(path.join(subjectAbsolutePath, "nested"), { recursive: true });
        const before = await snapshot(projectRoot, subjectRoot);

        filesystemFaults.readdirCalls = [];
        filesystemFaults.readdirPath = failingAbsolutePath;
        let result;
        let repeated;
        try {
          const resolve = () => resolveArtifactDocument({ projectRoot, subject: "prd", root: planningRoot });
          result = await resolve();
          repeated = await resolve();
        } finally {
          filesystemFaults.readdirPath = null;
        }

        const affectedPath = failureLocation === "root" ? subjectRoot : nestedRelativePath;
        expect(() => ResolveArtifactDocumentsOutputSchema.parse(result)).not.toThrow();
        expect(result).toMatchObject({
          ok: false,
          discoveryShape: "invalid-sharded",
          actualConsumedPath: null,
          consumedPaths: [],
          continuation: "block",
        });
        expect(result.issues).toHaveLength(1);
        expect(result.issues[0]).toMatchObject({
          issueId: "artifact-path.invalid-sharded-document-shape",
          affectedPath,
          details: {
            actualConsumedPath: affectedPath,
            reason: "shard-candidate-scan-unreadable",
            discoveryShape: "invalid-sharded",
            entryKind: "shard-candidate-scan",
            entryState: "unreadable",
          },
        });
        expect(repeated).toEqual(result);
        expect(filesystemFaults.readdirCalls).toContain(failingAbsolutePath);
        expect(JSON.stringify(result)).not.toContain(projectRoot);
        expect(JSON.stringify(result)).not.toContain("EACCES");
        expect(JSON.stringify(result)).not.toContain("injected inaccessible directory");
        expect(await snapshot(projectRoot, subjectRoot)).toEqual(before);
      });
    },
  );

  it.each([
    {
      name: "shards without index",
      setup: async (projectRoot: string, subjectRoot: string) => put(projectRoot, `${subjectRoot}/chapter.md`, "# Chapter\n"),
      issueId: "artifact-path.invalid-sharded-document-shape",
      shape: "invalid-sharded",
    },
    {
      name: "missing shard reference",
      setup: async (projectRoot: string, subjectRoot: string) => put(projectRoot, `${subjectRoot}/index.md`, "[Missing](missing.md)\n"),
      issueId: "artifact-path.broken-shard-reference",
      shape: "invalid-sharded",
    },
    {
      name: "outside-subject shard reference",
      setup: async (projectRoot: string, subjectRoot: string) => {
        await put(projectRoot, `${subjectRoot}/index.md`, "[Outside](../outside.md)\n");
        await put(projectRoot, `${planningRoot.resolvedRoot}/outside.md`, "# Outside\n");
      },
      issueId: "artifact-path.broken-shard-reference",
      shape: "invalid-sharded",
    },
    {
      name: "missing subject document",
      setup: async () => undefined,
      issueId: "artifact-path.subject-document-missing",
      shape: "subject-missing",
    },
  ])("blocks $name with a stable issue and zero mutation", async ({ setup, issueId, shape }) => {
    await withProject(async (projectRoot) => {
      const subjectRoot = `${planningRoot.resolvedRoot}/prd`;
      await mkdir(path.join(projectRoot, subjectRoot), { recursive: true });
      await setup(projectRoot, subjectRoot);
      const before = await snapshot(projectRoot, subjectRoot);

      const result = await resolveArtifactDocument({ projectRoot, subject: "prd", root: planningRoot });

      expect(result).toMatchObject({
        ok: false,
        discoveryShape: shape,
        ambiguityStatus: "not-ambiguous",
        actualConsumedPath: null,
        consumedPaths: [],
        continuation: "block",
      });
      expect(result.issues.map((issue) => issue.issueId)).toEqual([issueId]);
      expect(await snapshot(projectRoot, subjectRoot)).toEqual(before);
    });
  });

  it.each([
    {
      name: "malformed percent encoding",
      index: "[Bad](bad%ZZ.md)\n",
      referenceKind: "malformed-link-destination",
    },
    {
      name: "undefined reference-style link",
      index: "[Missing][missing]\n",
      referenceKind: "undefined-reference",
    },
    {
      name: "undefined collapsed reference-style link",
      index: "[Missing][]\n",
      referenceKind: "undefined-reference",
    },
    {
      name: "inline destination missing closing parenthesis",
      index: "[Bad](bad.md\n",
      referenceKind: "malformed-link-destination",
    },
    {
      name: "angle destination missing closing angle bracket",
      index: "[Bad](<bad.md)\n",
      referenceKind: "malformed-link-destination",
    },
    {
      name: "angle destination with trailing junk",
      index: "[Bad](<bad.md>junk)\n",
      referenceKind: "malformed-link-destination",
    },
    {
      name: "angle destination with leading inner whitespace",
      index: "[Bad](< bad.md>)\n",
      referenceKind: "malformed-link-destination",
    },
    {
      name: "angle destination with trailing inner whitespace",
      index: "[Bad](<bad.md >)\n",
      referenceKind: "malformed-link-destination",
    },
    {
      name: "empty angle destination",
      index: "[Bad](<>)\n",
      referenceKind: "malformed-link-destination",
    },
    {
      name: "unsupported local destination",
      index: "[Text](notes.txt)\n",
      referenceKind: "unsupported-local-reference",
    },
    {
      name: "outside decoded destination",
      index: "[Outside](..%2Foutside.md)\n",
      referenceKind: "outside-subject-directory",
    },
  ])("blocks $name instead of silently continuing", async ({ index, referenceKind }) => {
    await withProject(async (projectRoot) => {
      const subjectRoot = `${planningRoot.resolvedRoot}/prd`;
      await put(projectRoot, `${subjectRoot}/index.md`, index);
      await put(projectRoot, `${planningRoot.resolvedRoot}/outside.md`, "# Outside\n");
      const before = await snapshot(projectRoot, planningRoot.resolvedRoot);

      const result = await resolveArtifactDocument({ projectRoot, subject: "prd", root: planningRoot });

      expect(result).toMatchObject({
        ok: false,
        discoveryShape: "invalid-sharded",
        actualConsumedPath: null,
        consumedPaths: [],
        continuation: "block",
      });
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0]).toMatchObject({
        issueId: "artifact-path.broken-shard-reference",
        details: { referenceKind },
      });
      expect(await snapshot(projectRoot, planningRoot.resolvedRoot)).toEqual(before);
    });
  });

  it.each([
    ["slash", "C:/private/outside.md"],
    ["backslash", "c:\\private\\outside.md"],
    ["encoded colon slash", "C%3A/private/outside.md"],
    ["encoded colon and backslashes", "c%3A%5Cprivate%5Coutside.md"],
    ["raw colon and encoded slash", "C:%2Fprivate%2Foutside.md"],
    ["raw colon and encoded backslashes", "c:%5Cprivate%5Coutside.md"],
  ])("blocks Windows drive-letter %s references without leaking the raw path", async (_name, destination) => {
    await withProject(async (projectRoot) => {
      const subjectRoot = `${planningRoot.resolvedRoot}/prd`;
      await put(projectRoot, `${subjectRoot}/index.md`, `[Drive](${destination})\n`);
      const before = await snapshot(projectRoot, planningRoot.resolvedRoot);

      const result = await resolveArtifactDocument({ projectRoot, subject: "prd", root: planningRoot });

      expect(result).toMatchObject({
        ok: false,
        actualConsumedPath: null,
        consumedPaths: [],
        continuation: "block",
      });
      expect(result.issues[0]).toMatchObject({
        issueId: "artifact-path.broken-shard-reference",
        affectedPath: `${subjectRoot}/index.md`,
        details: { referenceKind: "unsupported-local-reference" },
      });
      expect(JSON.stringify(result)).not.toContain(destination);
      expect(JSON.stringify(result)).not.toMatch(/[A-Za-z]:[\\/]/);
      expect(await snapshot(projectRoot, planningRoot.resolvedRoot)).toEqual(before);
    });
  });

  it("classifies external schemes and network destinations only after single decoding", async () => {
    await withProject(async (projectRoot) => {
      const subjectRoot = `${planningRoot.resolvedRoot}/prd`;
      await put(projectRoot, `${subjectRoot}/index.md`, [
        "[Raw external](https://example.com/raw.md)",
        "[Raw network](//cdn.example.com/raw.md)",
        "[Encoded external](https%3A%2F%2Fexample.com%2Fencoded.md)",
        "[Encoded network](%2F%2Fcdn.example.com%2Fencoded.md)",
      ].join("\n"));
      const before = await snapshot(projectRoot, planningRoot.resolvedRoot);

      const result = await resolveArtifactDocument({ projectRoot, subject: "prd", root: planningRoot });

      expect(result.ok).toBe(true);
      expect(result.declaredShardPaths).toEqual([]);
      expect(result.consumedPaths).toEqual([`${subjectRoot}/index.md`]);
      expect(await snapshot(projectRoot, planningRoot.resolvedRoot)).toEqual(before);
    });
  });

  it.each([
    ["raw", String.raw`dir\chapter.md`],
    ["encoded", "dir%5Cchapter.md"],
  ])("blocks %s ordinary backslash destinations as unsupported local references", async (_name, destination) => {
    await withProject(async (projectRoot) => {
      const subjectRoot = `${planningRoot.resolvedRoot}/prd`;
      await put(projectRoot, `${subjectRoot}/index.md`, `[Backslash](${destination})\n`);
      await put(projectRoot, `${subjectRoot}/${String.raw`dir\chapter.md`}`, "# POSIX literal backslash\n");
      const before = await snapshot(projectRoot, planningRoot.resolvedRoot);

      const result = await resolveArtifactDocument({ projectRoot, subject: "prd", root: planningRoot });

      expect(result).toMatchObject({ ok: false, actualConsumedPath: null, consumedPaths: [], continuation: "block" });
      expect(result.issues[0]).toMatchObject({
        issueId: "artifact-path.broken-shard-reference",
        affectedPath: `${subjectRoot}/index.md`,
        details: { referenceKind: "unsupported-local-reference" },
      });
      expect(JSON.stringify(result)).not.toContain(`${subjectRoot}/dir/chapter.md`);
      expect(await snapshot(projectRoot, planningRoot.resolvedRoot)).toEqual(before);
    });
  });

  it.each([
    ["full", "[Use][empty]\n\n[empty]:\n"],
    ["collapsed", "[empty][]\n\n[empty]:   \n"],
    ["shortcut", "[empty]\n\n[empty]:\n"],
  ])("blocks an empty first definition used in %s reference form", async (_name, index) => {
    await withProject(async (projectRoot) => {
      const subjectRoot = `${planningRoot.resolvedRoot}/prd`;
      await put(projectRoot, `${subjectRoot}/index.md`, index);
      const before = await snapshot(projectRoot, planningRoot.resolvedRoot);

      const result = await resolveArtifactDocument({ projectRoot, subject: "prd", root: planningRoot });

      expect(result).toMatchObject({ ok: false, actualConsumedPath: null, consumedPaths: [], continuation: "block" });
      expect(result.issues[0]).toMatchObject({
        issueId: "artifact-path.broken-shard-reference",
        details: { referenceKind: "malformed-link-destination" },
      });
      expect(await snapshot(projectRoot, planningRoot.resolvedRoot)).toEqual(before);
    });
  });

  it("decodes link destinations exactly once", async () => {
    await withProject(async (projectRoot) => {
      const subjectRoot = `${planningRoot.resolvedRoot}/prd`;
      await put(projectRoot, `${subjectRoot}/index.md`, "[Encoded once](chapter%252Emd)\n");
      await put(projectRoot, `${subjectRoot}/chapter.md`, "# Must not be consumed\n");
      const before = await snapshot(projectRoot, planningRoot.resolvedRoot);

      const result = await resolveArtifactDocument({ projectRoot, subject: "prd", root: planningRoot });

      expect(result).toMatchObject({
        ok: false,
        actualConsumedPath: null,
        consumedPaths: [],
        continuation: "block",
      });
      expect(result.issues[0]).toMatchObject({
        issueId: "artifact-path.broken-shard-reference",
        details: { referenceKind: "unsupported-local-reference" },
      });
      expect(await snapshot(projectRoot, planningRoot.resolvedRoot)).toEqual(before);
    });
  });

  it("applies odd/even escapes to opening brackets without regressing supported link forms", async () => {
    await withProject(async (projectRoot) => {
      const subjectRoot = `${planningRoot.resolvedRoot}/prd`;
      await put(projectRoot, `${subjectRoot}/index.md`, [
        String.raw`\[Escaped](missing.md)`,
        String.raw`\\[Even [nested]](even.md)`,
        "![Image](missing-image.md)",
        "[Reference][local]",
        "[Self](./index.md)",
        "[Even duplicate](even.md)",
        "",
        "[local]: local.md",
      ].join("\n"));
      await put(projectRoot, `${subjectRoot}/even.md`, "# Even\n");
      await put(projectRoot, `${subjectRoot}/local.md`, "# Local\n");

      const result = await resolveArtifactDocument({ projectRoot, subject: "prd", root: planningRoot });

      expect(result.ok).toBe(true);
      expect(result.declaredShardPaths).toEqual([
        `${subjectRoot}/even.md`,
        `${subjectRoot}/local.md`,
      ]);
      expect(result.consumedPaths).toEqual([`${subjectRoot}/index.md`, ...result.declaredShardPaths]);
    });
  });

  it("accepts whitespace after angle destinations and preserves local/external classification", async () => {
    await withProject(async (projectRoot) => {
      const subjectRoot = `${planningRoot.resolvedRoot}/prd`;
      await put(projectRoot, `${subjectRoot}/index.md`, [
        "[Local](<local.md>   )",
        "[External](<https://example.com/ignored.md>\t)",
      ].join("\n"));
      await put(projectRoot, `${subjectRoot}/local.md`, "# Local\n");

      const result = await resolveArtifactDocument({ projectRoot, subject: "prd", root: planningRoot });

      expect(result.ok).toBe(true);
      expect(result.declaredShardPaths).toEqual([`${subjectRoot}/local.md`]);
      expect(result.consumedPaths).toEqual([`${subjectRoot}/index.md`, `${subjectRoot}/local.md`]);
    });
  });

  it.each([
    ["canonical whole", "prd.md"],
    ["canonical index", "index.md"],
  ] as const)("blocks %s symlink escape with zero mutation", async (_name, fileName) => {
    await withProject(async (projectRoot) => {
      const subjectRoot = `${planningRoot.resolvedRoot}/prd`;
      await put(projectRoot, "outside.md", "# Outside\n");
      await mkdir(path.join(projectRoot, subjectRoot), { recursive: true });
      await symlink(path.join(projectRoot, "outside.md"), path.join(projectRoot, subjectRoot, fileName));
      const before = await snapshot(projectRoot, ".");

      const result = await resolveArtifactDocument({ projectRoot, subject: "prd", root: planningRoot });

      expect(result).toMatchObject({
        ok: false,
        actualConsumedPath: null,
        consumedPaths: [],
        continuation: "block",
      });
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0]).toMatchObject({
        issueId: "artifact-path.symlink-escape",
        affectedPath: `${subjectRoot}/${fileName}`,
      });
      expect(await snapshot(projectRoot, ".")).toEqual(before);
    });
  });

  it("allows in-bound canonical index symlinks while keeping shard containment checks", async () => {
    await withProject(async (projectRoot) => {
      const subjectRoot = `${planningRoot.resolvedRoot}/prd`;
      await put(projectRoot, `${subjectRoot}/real-index.md`, "[One](one.md)\n");
      await put(projectRoot, `${subjectRoot}/one.md`, "# One\n");
      await symlink(path.join(projectRoot, subjectRoot, "real-index.md"), path.join(projectRoot, subjectRoot, "index.md"));

      const result = await resolveArtifactDocument({ projectRoot, subject: "prd", root: planningRoot });

      expect(result).toMatchObject({
        ok: true,
        actualConsumedPath: `${subjectRoot}/index.md`,
        consumedPaths: [`${subjectRoot}/index.md`, `${subjectRoot}/one.md`],
      });
    });
  });

  it.each(["inside project", "outside project"])("blocks a subject directory symlink to %s before canonical reads", async (targetKind) => {
    await withProject(async (projectRoot) => {
      const subjectRoot = `${planningRoot.resolvedRoot}/prd`;
      const targetRoot = targetKind === "inside project"
        ? path.join(projectRoot, "other-subject")
        : await mkdtemp(path.join(os.tmpdir(), "speclite-artifact-subject-target-"));
      try {
        await mkdir(targetRoot, { recursive: true });
        await writeFile(path.join(targetRoot, "prd.md"), "# Rebound\n", "utf8");
        await mkdir(path.dirname(path.join(projectRoot, subjectRoot)), { recursive: true });
        await symlink(targetRoot, path.join(projectRoot, subjectRoot));
        const before = await snapshot(projectRoot, ".");

        const result = await resolveArtifactDocument({ projectRoot, subject: "prd", root: planningRoot });

        expect(result).toMatchObject({
          ok: false,
          actualConsumedPath: null,
          consumedPaths: [],
          continuation: "block",
        });
        expect(result.issues[0]).toMatchObject({
          issueId: "artifact-path.symlink-escape",
          affectedPath: subjectRoot,
          details: { actualConsumedPath: null },
        });
        expect(await snapshot(projectRoot, ".")).toEqual(before);
      } finally {
        if (targetKind === "outside project") await rm(targetRoot, { recursive: true, force: true });
      }
    });
  });

  it("reports finite PRD and Epics legacy root-level mismatch probes without consuming them", async () => {
    await withProject(async (projectRoot) => {
      await put(projectRoot, `${planningRoot.resolvedRoot}/prd.md`, "# Legacy PRD\n");
      const before = await snapshot(projectRoot, planningRoot.resolvedRoot);

      const result = await resolveArtifactDocument({ projectRoot, subject: "prd", root: planningRoot });

      expect(result).toMatchObject({
        ok: false,
        actualConsumedPath: null,
        consumedPaths: [],
        continuation: "block",
      });
      expect(result.issues[0]).toMatchObject({
        issueId: "artifact-path.config-artifact-mismatch",
        details: {
          actualConsumedPath: `${planningRoot.resolvedRoot}/prd.md`,
          candidatePaths: [`${planningRoot.resolvedRoot}/prd.md`],
        },
      });
      expect(await snapshot(projectRoot, planningRoot.resolvedRoot)).toEqual(before);
    });
  });

  it.each([
    { subject: "prd" as const, root: planningRoot, candidate: `${planningRoot.resolvedRoot}/prd.md` },
    { subject: "epics" as const, root: planningRoot, candidate: `${planningRoot.resolvedRoot}/epics.md` },
    {
      subject: "architecture" as const,
      root: { ...solutioningRoot, resolutionMode: "explicit-config" as const },
      candidate: `${planningRoot.resolvedRoot}/architecture.md`,
    },
  ])("does not report a $subject mismatch probe whose symlink target is non-regular", async ({ subject, root, candidate }) => {
    await withProject(async (projectRoot) => {
      const target = path.join(projectRoot, planningRoot.resolvedRoot, `${subject}-probe-directory`);
      await mkdir(target, { recursive: true });
      await symlink(target, path.join(projectRoot, candidate));
      const before = await snapshot(projectRoot, planningRoot.resolvedRoot);

      const result = await resolveArtifactDocument({
        projectRoot,
        subject,
        root,
        ...(subject === "architecture" ? { planningRoot } : {}),
      });

      expect(result).toMatchObject({
        ok: false,
        actualConsumedPath: null,
        consumedPaths: [],
        continuation: "block",
      });
      expect(result.issues[0]).toMatchObject({ issueId: "artifact-path.subject-document-missing" });
      expect(result.issues[0].issueId).not.toBe("artifact-path.config-artifact-mismatch");
      expect(JSON.stringify(result)).not.toContain(projectRoot);
      expect(await snapshot(projectRoot, planningRoot.resolvedRoot)).toEqual(before);
    });
  });

  it.each([
    { subject: "prd" as const, root: planningRoot, candidate: `${planningRoot.resolvedRoot}/prd.md` },
    { subject: "epics" as const, root: planningRoot, candidate: `${planningRoot.resolvedRoot}/epics.md` },
    {
      subject: "architecture" as const,
      root: { ...solutioningRoot, resolutionMode: "explicit-config" as const },
      candidate: `${planningRoot.resolvedRoot}/architecture.md`,
    },
  ])("reports a $subject mismatch probe whose in-bound symlink target is a regular file", async ({ subject, root, candidate }) => {
    await withProject(async (projectRoot) => {
      const target = `${planningRoot.resolvedRoot}/${subject}-probe-target.md`;
      await put(projectRoot, target, "# Legacy target\n");
      await symlink(path.join(projectRoot, target), path.join(projectRoot, candidate));
      const before = await snapshot(projectRoot, planningRoot.resolvedRoot);

      const result = await resolveArtifactDocument({
        projectRoot,
        subject,
        root,
        ...(subject === "architecture" ? { planningRoot } : {}),
      });

      expect(result).toMatchObject({
        ok: false,
        actualConsumedPath: null,
        consumedPaths: [],
        continuation: "block",
      });
      expect(result.issues[0]).toMatchObject({
        issueId: "artifact-path.config-artifact-mismatch",
        details: {
          actualConsumedPath: candidate,
          candidatePaths: [candidate],
        },
      });
      expect(await snapshot(projectRoot, planningRoot.resolvedRoot)).toEqual(before);
    });
  });

  it("reports explicit Solutioning Architecture mismatch probes without replacing legacy-compatible fallback", async () => {
    await withProject(async (projectRoot) => {
      const explicitSolutioningRoot: ArtifactRootResolution = {
        ...solutioningRoot,
        resolutionMode: "explicit-config",
      };
      await put(projectRoot, `${planningRoot.resolvedRoot}/architecture.md`, "# Legacy root Architecture\n");
      await put(projectRoot, `${planningRoot.resolvedRoot}/architecture/architecture.md`, "# Legacy subject Architecture\n");
      await put(projectRoot, `${planningRoot.resolvedRoot}/architecture/index.md`, "[One](one.md)\n");
      const before = await snapshot(projectRoot, planningRoot.resolvedRoot);

      const result = await resolveArtifactDocument({
        projectRoot,
        subject: "architecture",
        root: explicitSolutioningRoot,
        planningRoot,
      });

      expect(result).toMatchObject({
        ok: false,
        actualConsumedPath: null,
        consumedPaths: [],
        continuation: "block",
      });
      expect(result.issues[0]).toMatchObject({
        issueId: "artifact-path.config-artifact-mismatch",
        details: {
          actualConsumedPath: `${planningRoot.resolvedRoot}/architecture.md`,
          candidatePaths: [
            `${planningRoot.resolvedRoot}/architecture.md`,
            `${planningRoot.resolvedRoot}/architecture/architecture.md`,
            `${planningRoot.resolvedRoot}/architecture/index.md`,
          ],
        },
      });
      expect(await snapshot(projectRoot, planningRoot.resolvedRoot)).toEqual(before);
    });
  });

  it("always probes Planning root-level Architecture but does not probe subject candidates in non-explicit mode", async () => {
    await withProject(async (projectRoot) => {
      const nonExplicitSolutioningRoot: ArtifactRootResolution = {
        ...solutioningRoot,
        resolutionMode: "fresh-default",
      };
      await put(projectRoot, `${planningRoot.resolvedRoot}/architecture.md`, "# Historical root Architecture\n");
      await put(projectRoot, `${planningRoot.resolvedRoot}/architecture/architecture.md`, "# Must not be probed\n");
      const before = await snapshot(projectRoot, planningRoot.resolvedRoot);

      const result = await resolveArtifactDocument({
        projectRoot,
        subject: "architecture",
        root: nonExplicitSolutioningRoot,
        planningRoot,
      });

      expect(result).toMatchObject({
        ok: false,
        actualConsumedPath: null,
        consumedPaths: [],
        continuation: "block",
      });
      expect(result.issues[0]).toMatchObject({
        issueId: "artifact-path.config-artifact-mismatch",
        details: {
          actualConsumedPath: `${planningRoot.resolvedRoot}/architecture.md`,
          candidatePaths: [`${planningRoot.resolvedRoot}/architecture.md`],
        },
      });
      expect(await snapshot(projectRoot, planningRoot.resolvedRoot)).toEqual(before);
    });
  });

  it("does not probe Planning subject Architecture candidates in non-explicit mode", async () => {
    await withProject(async (projectRoot) => {
      await put(projectRoot, `${planningRoot.resolvedRoot}/architecture/architecture.md`, "# Historical subject Architecture\n");

      const result = await resolveArtifactDocument({
        projectRoot,
        subject: "architecture",
        root: solutioningRoot,
        planningRoot,
      });

      expect(result).toMatchObject({
        ok: false,
        actualConsumedPath: null,
        consumedPaths: [],
        continuation: "block",
      });
      expect(result.issues[0]).toMatchObject({ issueId: "artifact-path.subject-document-missing" });
    });
  });

  it("keeps legacy-compatible Architecture discovery on Planning without migration", async () => {
    await withProject(async (projectRoot) => {
      const legacyRoot: ArtifactRootResolution = {
        ...solutioningRoot,
        resolvedRoot: planningRoot.resolvedRoot,
        resolutionMode: "legacy-compatible",
      };
      const legacyPath = `${planningRoot.resolvedRoot}/architecture/architecture.md`;
      await put(projectRoot, legacyPath, "# Legacy-compatible architecture\n");
      const before = await snapshot(projectRoot, planningRoot.resolvedRoot);

      const result = await resolveArtifactDocument({
        projectRoot,
        subject: "architecture",
        root: legacyRoot,
      });

      expect(result).toMatchObject({
        ok: true,
        resolvedRoot: planningRoot.resolvedRoot,
        resolutionMode: "legacy-compatible",
        actualConsumedPath: legacyPath,
      });
      expect(await snapshot(projectRoot, planningRoot.resolvedRoot)).toEqual(before);
      await expect(readdir(path.join(projectRoot, "_speclite-output"))).resolves.toEqual([
        "2-planning-artifacts",
      ]);
    });
  });

  it("rejects a subject/root mismatch without filesystem writes", async () => {
    await withProject(async (projectRoot) => {
      const before = await snapshot(projectRoot, ".");
      const result = await resolveArtifactDocument({
        projectRoot,
        subject: "architecture",
        root: planningRoot,
      });
      expect(result.ok).toBe(false);
      expect(result.issues.map((issue) => issue.issueId)).toEqual([
        "artifact-path.config-artifact-mismatch",
      ]);
      expect(result.continuation).toBe("block");
      expect(await snapshot(projectRoot, ".")).toEqual(before);
    });
  });
});

describe("resolve artifact-documents CLI", () => {
  it("emits schema-validated POSIX evidence for explicit-config whole input", async () => {
    await withProject(async (projectRoot) => {
      await writeRuntimeConfig(projectRoot, {
        planning: "custom/planning",
        solutioning: "custom/solutioning",
      });
      await put(projectRoot, "custom/planning/prd/prd.md", "# PRD\n");

      const cli = await runResolveArtifactDocuments([
        "--subject",
        "prd",
        "--project-root",
        projectRoot,
      ]);

      expect(cli.exitCodes).toEqual([0]);
      expect(cli.stderr).toBe("");
      const result = ResolveArtifactDocumentsOutputSchema.parse(JSON.parse(cli.stdout));
      expect(result).toMatchObject({
        ok: true,
        subject: "prd",
        resolvedRoot: "custom/planning",
        resolutionMode: "explicit-config",
        actualConsumedPath: "custom/planning/prd/prd.md",
        continuation: "continue",
      });
      expect(cli.stdout).not.toContain(projectRoot);
    });
  });

  it("returns complete block evidence on stdout and the stable issue on stderr", async () => {
    await withProject(async (projectRoot) => {
      await writeRuntimeConfig(projectRoot, {
        planning: "_speclite-output/planning",
      });
      await put(projectRoot, "_speclite-output/planning/epics/epics.md", "# Whole\n");
      await put(projectRoot, "_speclite-output/planning/epics/index.md", "[One](epic-1.md)\n");
      await put(projectRoot, "_speclite-output/planning/epics/epic-1.md", "# One\n");

      const cli = await runResolveArtifactDocuments([
        "--subject",
        "epics",
        "--project-root",
        projectRoot,
      ]);

      expect(cli.exitCodes).toEqual([1]);
      const result = ResolveArtifactDocumentsOutputSchema.parse(JSON.parse(cli.stdout));
      expect(result).toMatchObject({
        ok: false,
        discoveryShape: "whole+sharded",
        ambiguityStatus: "selection-required",
        actualConsumedPath: null,
        continuation: "block",
      });
      expect(ResolveStderrJsonLineSchema.parse(JSON.parse(cli.stderr))).toMatchObject({
        issueId: "artifact-path.ambiguous-subject-document-shape",
      });
      expect(cli.stdout + cli.stderr).not.toContain(projectRoot);
    });
  });

  it("returns schema-safe canonical whole unreadable evidence without raw filesystem details", async () => {
    await withProject(async (projectRoot) => {
      const subjectRoot = "_speclite-output/planning/prd";
      await writeRuntimeConfig(projectRoot, { planning: "_speclite-output/planning" });
      await mkdir(path.join(projectRoot, subjectRoot, "prd.md"), { recursive: true });
      await put(projectRoot, `${subjectRoot}/index.md`, "[One](one.md)\n");
      await put(projectRoot, `${subjectRoot}/one.md`, "# One\n");
      const before = await snapshot(projectRoot, ".");

      const cli = await runResolveArtifactDocuments([
        "--subject",
        "prd",
        "--project-root",
        projectRoot,
        "--selection",
        "sharded",
      ]);

      expect(cli.exitCodes).toEqual([1]);
      const result = ResolveArtifactDocumentsOutputSchema.parse(JSON.parse(cli.stdout));
      expect(result).toMatchObject({
        ok: false,
        actualConsumedPath: null,
        consumedPaths: [],
        continuation: "block",
      });
      expect(ResolveStderrJsonLineSchema.parse(JSON.parse(cli.stderr))).toMatchObject({
        issueId: "artifact-path.subject-document-missing",
        affectedPath: `${subjectRoot}/prd.md`,
        details: {
          reason: "canonical-whole-unreadable",
          entryKind: "canonical-whole",
          entryState: "unreadable",
        },
      });
      expect(cli.stdout + cli.stderr).not.toContain(projectRoot);
      expect(cli.stdout + cli.stderr).not.toMatch(/EACCES|errno|stack/i);
      expect(await snapshot(projectRoot, ".")).toEqual(before);
    });
  });

  it("uses legacy-compatible Planning fallback for Architecture without migration", async () => {
    await withProject(async (projectRoot) => {
      await writeRuntimeConfig(projectRoot, { planning: "legacy/planning" });
      await put(projectRoot, "legacy/planning/architecture/architecture.md", "# Architecture\n");
      const before = await snapshot(projectRoot, ".");

      const cli = await runResolveArtifactDocuments([
        "--subject",
        "architecture",
        "--project-root",
        projectRoot,
      ]);

      expect(cli.exitCodes).toEqual([0]);
      expect(cli.stderr).toBe("");
      expect(ResolveArtifactDocumentsOutputSchema.parse(JSON.parse(cli.stdout))).toMatchObject({
        resolvedRoot: "legacy/planning",
        resolutionMode: "legacy-compatible",
        subjectDirectory: "legacy/planning/architecture",
        actualConsumedPath: "legacy/planning/architecture/architecture.md",
      });
      expect(await snapshot(projectRoot, ".")).toEqual(before);
    });
  });

  it("reports explicit Solutioning Architecture mismatch through the CLI without mutation", async () => {
    await withProject(async (projectRoot) => {
      await writeRuntimeConfig(projectRoot, {
        planning: "legacy/planning",
        solutioning: "new/solutioning",
      });
      await put(projectRoot, "legacy/planning/architecture/architecture.md", "# Legacy Architecture\n");
      const before = await snapshot(projectRoot, ".");

      const cli = await runResolveArtifactDocuments([
        "--subject",
        "architecture",
        "--project-root",
        projectRoot,
      ]);

      expect(cli.exitCodes).toEqual([1]);
      const result = ResolveArtifactDocumentsOutputSchema.parse(JSON.parse(cli.stdout));
      expect(result).toMatchObject({
        ok: false,
        actualConsumedPath: null,
        consumedPaths: [],
        continuation: "block",
      });
      expect(ResolveStderrJsonLineSchema.parse(JSON.parse(cli.stderr))).toMatchObject({
        issueId: "artifact-path.config-artifact-mismatch",
        details: {
          actualConsumedPath: "legacy/planning/architecture/architecture.md",
          candidatePaths: ["legacy/planning/architecture/architecture.md"],
        },
      });
      expect(await snapshot(projectRoot, ".")).toEqual(before);
    });
  });
});

describe("Story 11.5 canonical workflow contract", () => {
  it("locks whole producers and shard-doc to phase-owned same-directory paths", async () => {
    const createPrd = await repoFile("assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-prd/references/workflow-details.md");
    const createEpics = await repoFile("assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-epics-and-stories/references/workflow-steps.md");
    const createArchitecture = await repoFile("assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-architecture/references/workflow-steps.md");
    const shardDoc = await repoFile("assets/source/speclite/core-skills/speclite-shard-doc/SKILL.md");

    expect(createPrd).toContain("{planning_artifacts}/prd/prd.md");
    expect(createEpics).toContain("{planning_artifacts}/epics/epics.md");
    expect(createArchitecture).toContain("{solutioning_artifacts}/architecture/architecture.md");
    expect(shardDoc).toContain("canonical subject document");
    expect(shardDoc).toContain("same subject directory");
    expect(shardDoc).toContain("must not create a `shards/` layer");
  });

  it("requires all in-scope consumers to call the shared resolver before mutation", async () => {
    const consumers = [
      "assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-validate-prd/references/steps/step-v-01-discovery.md",
      "assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-check/references/steps/step-01-document-discovery.md",
      "assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-epics-and-stories/references/workflow-steps.md",
      "assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-architecture/references/steps/step-01-init.md",
      "assets/source/speclite/sdlc-skills/3-solutioning/speclite-generate-project-context/references/steps/step-01-discover.md",
      "assets/source/speclite/sdlc-skills/4-implementation/speclite-correct-course/references/workflow-details.md",
      "assets/source/speclite/sdlc-skills/4-implementation/speclite-create-story/references/discover-inputs.md",
      "assets/source/speclite/sdlc-skills/4-implementation/speclite-retrospective/references/workflow-details.md",
      "assets/source/speclite/sdlc-skills/4-implementation/speclite-sprint-planning/references/workflow-details.md",
    ];
    for (const file of consumers) {
      const text = await repoFile(file);
      expect(text, file).toContain("speclite resolve artifact-documents");
      expect(text, file).toContain("consumedPaths");
      expect(text, file).toMatch(/zero (artifact )?write|零写入/i);
    }
  });

  it("removes active fresh Architecture-to-Planning and root-level PRD/Epics producer paths", async () => {
    const roots = [
      "assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-prd",
      "assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-architecture",
      "assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-epics-and-stories",
    ];
    const violations: string[] = [];
    for (const root of roots) {
      for (const file of await markdownFiles(path.join(process.cwd(), root))) {
        const text = await readFile(file, "utf8");
        for (const pattern of [
          /\{planning_artifacts\}\/architecture(?:\.md|\/)/,
          /\{planning_artifacts\}\/prd\.md/,
          /\{planning_artifacts\}\/epics\.md/,
        ]) {
          if (pattern.test(text)) violations.push(`${path.relative(process.cwd(), file)} => ${pattern.source}`);
        }
      }
    }
    expect(violations).toEqual([]);
  });
});

async function withProject(run: (projectRoot: string) => Promise<void>): Promise<void> {
  const projectRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-artifact-document-"));
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

async function writeRuntimeConfig(
  projectRoot: string,
  roots: { planning: string; solutioning?: string },
): Promise<void> {
  await put(projectRoot, "_speclite/config.toml", [
    "[core]",
    'output_folder = "_speclite-output"',
    "",
    "[modules.sdlc]",
    `planning_artifacts = "${roots.planning}"`,
    ...(roots.solutioning === undefined ? [] : [`solutioning_artifacts = "${roots.solutioning}"`]),
    'implementation_artifacts = "_speclite-output/implementation"',
    'devops_artifacts = "_speclite-output/devops"',
    'project_knowledge = "project-knowledge"',
  ].join("\n"));
}

async function runResolveArtifactDocuments(args: string[]): Promise<{
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
  await program.parseAsync(["node", "speclite", "resolve", "artifact-documents", ...args], { from: "node" });
  return { stdout, stderr: stderr.trim(), exitCodes };
}

async function snapshot(projectRoot: string, relativeRoot: string): Promise<Array<[string, string]>> {
  const absoluteRoot = path.join(projectRoot, relativeRoot);
  const entries: Array<[string, string]> = [];
  await visit(absoluteRoot, async (absolutePath) => {
    entries.push([
      path.relative(projectRoot, absolutePath).split(path.sep).join("/"),
      await readFile(absolutePath, "utf8"),
    ]);
  });
  return entries.sort(([left], [right]) => left.localeCompare(right));
}

async function visit(directory: string, onFile: (absolutePath: string) => Promise<void>): Promise<void> {
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (isMissing(error)) return;
    throw error;
  }
  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) await visit(absolutePath, onFile);
    else if (entry.isFile()) await onFile(absolutePath);
  }
}

function isMissing(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT";
}

async function repoFile(relativePath: string): Promise<string> {
  return readFile(path.join(process.cwd(), relativePath), "utf8");
}

async function markdownFiles(directory: string): Promise<string[]> {
  const files: string[] = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await markdownFiles(absolutePath)));
    else if (entry.isFile() && entry.name.endsWith(".md")) files.push(absolutePath);
  }
  return files;
}
