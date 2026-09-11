import { access, chmod, lstat, mkdir, mkdtemp, readFile, readdir, readlink, rm, symlink, writeFile } from "node:fs/promises";
import { execFileSync, spawnSync } from "node:child_process";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { runInstallCommand } from "../src/commands/install.js";
import { runUpdateCommand } from "../src/commands/update.js";
import {
  ARTIFACT_ROOT_REGISTRY,
  resolveArtifactRoots,
  type ArtifactRootResolutionResult,
} from "../src/config/artifact-root-resolver.js";
import {
  bindCreatedUxMain,
  isUxArtifactTargetAllowed,
  resolveUxArtifactRoute,
  validateUxLocalReferences,
} from "../src/config/ux-artifact-routing.js";
// @ts-expect-error The canonical private Skill script is intentionally outside the public TS build graph.
import { executeUxArtifactOperation } from "../assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-ux-design/scripts/ux-artifact-operation.mjs";
import { resolveProjectRelativePath } from "../src/fs/path-normalizer.js";
import { isInstallableCanonicalPackageFile } from "../src/fs/copy-tree.js";
import { hashFile, hashPackageDirectory } from "../src/manifest/hash.js";

const supportedRuntime = {
  nodeVersion: "v22.12.0",
  platform: "darwin",
  platformRelease: "23.0.0",
} as const;

const sourceRoot = path.join(process.cwd(), "assets/source/speclite/sdlc-skills");
const createUxRoot = path.join(sourceRoot, "2-plan-workflows/speclite-create-ux-design");
const exactUxPaths = [
  "{planning_artifacts}/ux/ux-design-specification.md",
  "{planning_artifacts}/ux/ux-color-themes.html",
  "{planning_artifacts}/ux/ux-design-directions.html",
] as const;
const planningRootPath = "_speclite-output/2-planning-artifacts";
const validUxDocument = "---\nstepsCompleted: [1]\n---\n# UX\n";

describe("UX artifact routing", () => {
  it("precreates only the UX parent during fresh install", async () => {
    const projectRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-ux-routing-"));
    try {
      const outcome = await runInstallCommand({
        options: { json: true, yes: true },
        runtime: { ...supportedRuntime, cwd: projectRoot, targetProject: "ux-routing" },
      });

      expect(outcome.exitCode).toBe(0);
      await expect(
        readdir(path.join(projectRoot, "_speclite-output/2-planning-artifacts")),
      ).resolves.toContain("ux");
      await expect(
        access(path.join(projectRoot, "_speclite-output/2-planning-artifacts/ux/design-system")),
      ).rejects.toMatchObject({ code: "ENOENT" });
      const phaseCoverage = JSON.parse(
        await readFile(path.join(projectRoot, "_speclite/_config/phase-coverage.json"), "utf8"),
      ) as {
        rows: Array<{
          canonicalSkillId: string;
          artifactContract?: { defaultOutputPath: string; artifactType: string };
        }>;
      };
      expect(
        phaseCoverage.rows.find((row) => row.canonicalSkillId === "speclite-create-ux-design")
          ?.artifactContract,
      ).toMatchObject({
        defaultOutputPath: "_speclite-output/2-planning-artifacts/ux",
        artifactType: "ux-design",
      });
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  }, 15_000);

  it("installs and executes the same private UX operation from agents and claude", async () => {
    const projectRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-ux-installed-operation-"));
    const outside = await mkdtemp(path.join(os.tmpdir(), "speclite-ux-installed-outside-"));
    try {
      const install = await runInstallCommand({
        options: { json: true, yes: true },
        runtime: { ...supportedRuntime, cwd: projectRoot, targetProject: "ux-installed-operation" },
      });
      expect(install.exitCode).toBe(0);

      const canonicalScript = path.join(createUxRoot, "scripts/ux-artifact-operation.mjs");
      const installedScripts = {
        agents: path.join(projectRoot, ".agents/skills/speclite-create-ux-design/scripts/ux-artifact-operation.mjs"),
        claude: path.join(projectRoot, ".claude/skills/speclite-create-ux-design/scripts/ux-artifact-operation.mjs"),
      } as const;
      const canonicalHash = await hashFile(canonicalScript);
      const filesIndex = JSON.parse(
        await readFile(path.join(projectRoot, "_speclite/_config/files-index.json"), "utf8"),
      ) as { entries: Array<{ path: string; hash: string; sourceRef: string; executable: boolean }> };
      const skillIndex = JSON.parse(
        await readFile(path.join(projectRoot, "_speclite/_config/skill-index.json"), "utf8"),
      ) as { entries: Array<{ canonicalSkillId: string; canonicalPackageHash: string }> };

      for (const [target, scriptPath] of Object.entries(installedScripts)) {
        await expect(hashFile(scriptPath)).resolves.toBe(canonicalHash);
        expect((await lstat(scriptPath)).mode & 0o111).not.toBe(0);
        expect(filesIndex.entries).toContainEqual(expect.objectContaining({
          path: `.${target}/skills/speclite-create-ux-design/scripts/ux-artifact-operation.mjs`,
          hash: canonicalHash,
          sourceRef: "assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-ux-design/scripts/ux-artifact-operation.mjs",
          executable: true,
        }));
      }
      expect(skillIndex.entries.find((entry) => entry.canonicalSkillId === "speclite-create-ux-design"))
        .toMatchObject({
          canonicalPackageHash: await hashPackageDirectory(createUxRoot, {
            include: isInstallableCanonicalPackageFile,
          }),
        });

      const mainTarget = `${planningRootPath}/ux/ux-design-specification.md`;
      const agentsCreate = runInstalledUxOperation(installedScripts.agents, [
        "create-file",
        "--project-root", projectRoot,
        "--planning-root", planningRootPath,
        "--target", mainTarget,
        "--source", path.join(projectRoot, ".agents/skills/speclite-create-ux-design/assets/ux-design-template.md"),
      ]);
      expect(agentsCreate).toMatchObject({ status: 0, lines: 1, json: { ok: true, targetPath: mainTarget, operation: "create-file" } });
      const mainBytes = await readFile(path.join(projectRoot, mainTarget));
      await expect(readFile(path.join(projectRoot, ".agents/skills/speclite-create-ux-design/assets/ux-design-template.md")))
        .resolves.toEqual(mainBytes);
      const agentsExisting = runInstalledUxOperation(installedScripts.agents, [
        "create-file",
        "--project-root", projectRoot,
        "--planning-root", planningRootPath,
        "--target", mainTarget,
        "--source", path.join(projectRoot, ".agents/skills/speclite-create-ux-design/assets/ux-design-template.md"),
      ]);
      expect(agentsExisting.status).not.toBe(0);
      expect(agentsExisting).toMatchObject({ lines: 1, json: { ok: false, targetPath: mainTarget } });
      await expect(readFile(path.join(projectRoot, mainTarget))).resolves.toEqual(mainBytes);

      const designSystemTarget = `${planningRootPath}/ux/design-system`;
      const claudeMkdir = runInstalledUxOperation(installedScripts.claude, [
        "create-directory",
        "--project-root", projectRoot,
        "--planning-root", planningRootPath,
        "--target", designSystemTarget,
      ]);
      expect(claudeMkdir).toMatchObject({ status: 0, lines: 1, json: { ok: true, targetPath: designSystemTarget, operation: "create-directory" } });
      await expect(readdir(path.join(projectRoot, designSystemTarget))).resolves.toEqual([]);
      const claudeExisting = runInstalledUxOperation(installedScripts.claude, [
        "create-directory",
        "--project-root", projectRoot,
        "--planning-root", planningRootPath,
        "--target", designSystemTarget,
      ]);
      expect(claudeExisting.status).not.toBe(0);
      expect(claudeExisting).toMatchObject({ lines: 1, json: { ok: false, targetPath: designSystemTarget } });
      await expect(readdir(path.join(projectRoot, designSystemTarget))).resolves.toEqual([]);

      await rm(path.join(projectRoot, mainTarget));
      await rm(path.join(projectRoot, designSystemTarget), { recursive: true });
      await mkdir(path.join(projectRoot, "docs"));
      const uxRoot = path.join(projectRoot, planningRootPath, "ux");
      const source = path.join(projectRoot, ".agents/skills/speclite-create-ux-design/assets/ux-design-template.md");
      for (const [index, scenario] of ["regular-file", "fifo", "dangling-symlink", "outside-symlink", "cross-space-symlink"].entries()) {
        await rm(uxRoot, { recursive: true, force: true });
        if (scenario === "regular-file") await writeFile(uxRoot, "owner-sentinel");
        if (scenario === "fifo") execFileSync("mkfifo", [uxRoot]);
        if (scenario === "dangling-symlink") await symlink(path.join(projectRoot, "missing-ux"), uxRoot);
        if (scenario === "outside-symlink") await symlink(outside, uxRoot);
        if (scenario === "cross-space-symlink") await symlink(path.join(projectRoot, "docs"), uxRoot);
        const script = index % 2 === 0 ? installedScripts.agents : installedScripts.claude;
        const result = runInstalledUxOperation(script, [
          "create-file",
          "--project-root", projectRoot,
          "--planning-root", planningRootPath,
          "--target", mainTarget,
          "--source", source,
        ]);
        expect(result.status, scenario).not.toBe(0);
        expect(result, scenario).toMatchObject({ lines: 1, json: { ok: false, targetPath: mainTarget } });
        await expect(access(path.join(outside, "ux-design-specification.md"))).rejects.toMatchObject({ code: "ENOENT" });
        await expect(access(path.join(projectRoot, "docs/ux-design-specification.md"))).rejects.toMatchObject({ code: "ENOENT" });
      }

      await rm(uxRoot, { recursive: true, force: true });
      await mkdir(uxRoot);
      for (const [index, scenario] of ["regular-file", "fifo", "dangling-symlink", "outside-symlink", "cross-space-symlink"].entries()) {
        const unsafeAncestor = path.join(uxRoot, "unsafe");
        await rm(unsafeAncestor, { recursive: true, force: true });
        if (scenario === "regular-file") await writeFile(unsafeAncestor, "ancestor-sentinel");
        if (scenario === "fifo") execFileSync("mkfifo", [unsafeAncestor]);
        if (scenario === "dangling-symlink") await symlink(path.join(projectRoot, "missing-unsafe"), unsafeAncestor);
        if (scenario === "outside-symlink") await symlink(outside, unsafeAncestor);
        if (scenario === "cross-space-symlink") await symlink(path.join(projectRoot, "docs"), unsafeAncestor);
        const target = `${planningRootPath}/ux/unsafe/generated.md`;
        const script = index % 2 === 0 ? installedScripts.claude : installedScripts.agents;
        const result = runInstalledUxOperation(script, [
          "create-file",
          "--project-root", projectRoot,
          "--planning-root", planningRootPath,
          "--target", target,
          "--source", source,
        ]);
        expect(result.status, scenario).not.toBe(0);
        expect(result, scenario).toMatchObject({ lines: 1, json: { ok: false, targetPath: target } });
        await expect(access(path.join(outside, "generated.md"))).rejects.toMatchObject({ code: "ENOENT" });
        await expect(access(path.join(projectRoot, "docs/generated.md"))).rejects.toMatchObject({ code: "ENOENT" });
      }

      const lexicalNegatives = [
        `${planningRootPath}/../outside.md`,
        "docs/cross-space.md",
      ];
      for (const target of lexicalNegatives) {
        const result = runInstalledUxOperation(installedScripts.agents, [
          "create-file",
          "--project-root", projectRoot,
          "--planning-root", planningRootPath,
          "--target", target,
          "--source", source,
        ]);
        expect(result.status).not.toBe(0);
        expect(result).toMatchObject({ lines: 1, json: { ok: false } });
      }

      const hiddenHook = runInstalledUxOperation(installedScripts.claude, [
        "create-directory",
        "--project-root", projectRoot,
        "--planning-root", planningRootPath,
        "--target", `${planningRootPath}/ux/hook-probe`,
        "--__testOnlyInterposeBeforeCommit", "true",
      ], { input: "{\"__testOnlyInterposeBeforeCommit\":true}\n", env: { ...process.env, SPECLITE_UX_TEST_INTERPOSE: "true" } });
      expect(hiddenHook.status).not.toBe(0);
      expect(hiddenHook).toMatchObject({ lines: 1, json: { ok: false, reason: "invalid-cli-arguments" } });
      await expect(access(path.join(projectRoot, planningRootPath, "ux/hook-probe"))).rejects.toMatchObject({ code: "ENOENT" });
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
      await rm(outside, { recursive: true, force: true });
    }
  }, 30_000);

  it("locks Create UX producers, progress and generated pages to the exact UX paths", async () => {
    const workflow = await readFile(path.join(createUxRoot, "references/workflow-details.md"), "utf8");
    const init = await readFile(path.join(createUxRoot, "references/steps/step-01-init.md"), "utf8");
    const continuation = await readFile(path.join(createUxRoot, "references/steps/step-01b-continue.md"), "utf8");
    const visualFoundation = await readFile(
      path.join(createUxRoot, "references/steps/step-08-visual-foundation.md"),
      "utf8",
    );
    const directions = await readFile(
      path.join(createUxRoot, "references/steps/step-09-design-directions.md"),
      "utf8",
    );
    const complete = await readFile(path.join(createUxRoot, "references/steps/step-14-complete.md"), "utf8");

    expect(workflow).toContain(`default_output_file\` = \`${exactUxPaths[0]}`);
    expect(init).toContain(exactUxPaths[0]);
    expect(init).toContain("assets/ux-design-template.md");
    expect(init).not.toContain("../ux-design-template.md");
    expect(continuation).toContain(exactUxPaths[0]);
    expect(visualFoundation).toContain(exactUxPaths[1]);
    expect(directions).toContain(exactUxPaths[2]);
    for (const artifactPath of exactUxPaths) expect(complete).toContain(artifactPath);
    expect(workflow).toContain("{planning_artifacts}/ux/design-system/");
    expect(workflow).toContain("on-demand");
    expect(workflow).toContain("every local Markdown link and every HTML `href` / `src`");
    expect(workflow).toContain("relative to the containing UX artifact directory");
    expect(workflow).toContain("first-definition-wins");
    expect(workflow).toContain("raw value containing `&`");
    expect(workflow).toContain("real `{planning_artifacts}/ux` physical owner");
    expect(workflow).toContain("nearest-existing-ancestor guard");
    expect(workflow).toContain("scripts/ux-artifact-operation.mjs");
  });

  it("uses resolver-backed legacy discovery evidence without authorizing migration", async () => {
    const projectRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-ux-legacy-"));
    try {
      const legacyPath = path.join(
        projectRoot,
        "_speclite-output/planning-artifacts/ux-design-specification.md",
      );
      await mkdir(path.dirname(legacyPath), { recursive: true });
      await writeFile(legacyPath, "# Legacy UX\n", { encoding: "utf8", flag: "wx" });
      const before = await hashFile(legacyPath);
      const resolved = await resolveArtifactRoots({
        projectRoot,
        lifecycle: "existing",
        config: {
          core: { output_folder: "_speclite-output" },
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
      const planning = resolved.roots.find((root) => root.field === "planning_artifacts");
      const init = await readFile(path.join(createUxRoot, "references/steps/step-01-init.md"), "utf8");

      expect(planning).toMatchObject({
        resolvedRoot: "_speclite-output/planning-artifacts",
        resolutionMode: "explicit-config",
      });
      expect(init).toContain("{planning_artifacts}/ux-design-specification.md");
      for (const field of ["resolvedRoot", "resolutionMode", "actualConsumedPath"]) {
        expect(init).toContain(field);
      }
      expect(init).toContain("must not migrate, copy, rename, or delete");
      await expect(hashFile(legacyPath)).resolves.toBe(before);
      await expect(access(path.join(projectRoot, "_speclite-output/planning-artifacts/ux"))).rejects.toMatchObject({
        code: "ENOENT",
      });
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it("executes fresh creation binding and canonical-first coexistence routing", async () => {
    await withUxProject(async (projectRoot, roots) => {
      const fresh = await resolveUxArtifactRoute({ projectRoot, rootResolution: roots });
      expect(fresh).toMatchObject({
        ok: true,
        continuation: "fresh",
        actualConsumedPath: null,
        appendTarget: null,
        actualColorThemesPath: `${planningRootPath}/ux/ux-color-themes.html`,
        actualDesignDirectionsPath: `${planningRootPath}/ux/ux-design-directions.html`,
      });

      await put(projectRoot, `${planningRootPath}/ux/ux-design-specification.md`, validUxDocument);
      const bound = await bindCreatedUxMain({ projectRoot, route: fresh });
      expect(bound).toMatchObject({
        ok: true,
        continuation: "continue",
        actualConsumedPath: `${planningRootPath}/ux/ux-design-specification.md`,
        appendTarget: `${planningRootPath}/ux/ux-design-specification.md`,
      });

      await put(projectRoot, `${planningRootPath}/ux-design-specification.md`, validUxDocument);
      const coexistence = await resolveUxArtifactRoute({ projectRoot, rootResolution: roots });
      expect(coexistence.actualConsumedPath).toBe(`${planningRootPath}/ux/ux-design-specification.md`);
      expect(coexistence.actualColorThemesPath).toBe(`${planningRootPath}/ux/ux-color-themes.html`);
    });
  });

  it.each([
    { existing: [] as string[], expectedColor: "ux/ux-color-themes.html", expectedDirections: "ux/ux-design-directions.html" },
    { existing: ["ux-color-themes.html"], expectedColor: "ux-color-themes.html", expectedDirections: "ux/ux-design-directions.html" },
    { existing: ["ux-design-directions.html"], expectedColor: "ux/ux-color-themes.html", expectedDirections: "ux-design-directions.html" },
    { existing: ["ux-color-themes.html", "ux-design-directions.html"], expectedColor: "ux-color-themes.html", expectedDirections: "ux-design-directions.html" },
  ])("selects legacy supporting artifacts in place and canonical paths only for missing siblings: $existing", async ({ existing, expectedColor, expectedDirections }) => {
    await withUxProject(async (projectRoot, roots) => {
      await put(projectRoot, `${planningRootPath}/ux-design-specification.md`, validUxDocument);
      for (const basename of existing) await put(projectRoot, `${planningRootPath}/${basename}`, "<!doctype html>\n");
      const before = await snapshotTree(projectRoot, planningRootPath);

      const route = await resolveUxArtifactRoute({ projectRoot, rootResolution: roots });

      expect(route).toMatchObject({
        ok: true,
        continuation: "continue",
        actualConsumedPath: `${planningRootPath}/ux-design-specification.md`,
        appendTarget: `${planningRootPath}/ux-design-specification.md`,
        actualColorThemesPath: `${planningRootPath}/${expectedColor}`,
        actualDesignDirectionsPath: `${planningRootPath}/${expectedDirections}`,
      });
      await expect(snapshotTree(projectRoot, planningRootPath)).resolves.toEqual(before);
    });
  });

  it("rejects a design-system ancestor replacement after the initial check", async () => {
    await withUxProject(async (projectRoot, roots) => {
      const routeBefore = await resolveUxArtifactRoute({ projectRoot, rootResolution: roots });
      const progressBefore = { stepsCompleted: [1] };
      await mkdir(path.join(projectRoot, planningRootPath, "ux/design-system"));
      await mkdir(path.join(projectRoot, "docs"), { recursive: true });
      let afterInterposition: Array<{ path: string; hash: string }> = [];

      const result = await executeUxArtifactOperation({
        projectRoot,
        planningRoot: planningRootPath,
        targetPath: `${planningRootPath}/ux/design-system/tokens.css`,
        operation: { kind: "create-file", content: "tokens" },
        __testOnlyInterposeBeforeCommit: async () => {
          await rm(path.join(projectRoot, planningRootPath, "ux/design-system"), { recursive: true });
          await symlink(path.join(projectRoot, "docs"), path.join(projectRoot, planningRootPath, "ux/design-system"));
          afterInterposition = await snapshotTree(projectRoot, ".");
        },
      });

      expect(result).toMatchObject({ ok: false, reason: "candidate-symlink-escape" });
      expect(progressBefore).toEqual({ stepsCompleted: [1] });
      expect(routeBefore).toMatchObject({ continuation: "fresh", actualConsumedPath: null, appendTarget: null });
      await expect(snapshotTree(projectRoot, ".")).resolves.toEqual(afterInterposition);
      await expect(access(path.join(projectRoot, "docs/tokens.css"))).rejects.toMatchObject({ code: "ENOENT" });
    });
  });

  it("fails closed for invalid existing frontmatter without writing or selecting an append target", async () => {
    await withUxProject(async (projectRoot, roots) => {
      const candidate = `${planningRootPath}/ux/ux-design-specification.md`;
      await put(projectRoot, candidate, "# Existing without workflow state\n");
      const before = await snapshotTree(projectRoot, planningRootPath);

      const route = await resolveUxArtifactRoute({ projectRoot, rootResolution: roots });

      expect(route).toMatchObject({
        ok: false,
        continuation: "block",
        actualConsumedPath: null,
        appendTarget: null,
        diagnostic: { reason: "workflow-frontmatter-invalid", affectedPath: candidate },
      });
      await expect(snapshotTree(projectRoot, planningRootPath)).resolves.toEqual(before);
    });
  });

  it("fails closed before candidate probing when the shared root resolver is blocked or Planning is absent", async () => {
    const projectRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-ux-root-gate-"));
    try {
      const blocking = await resolveUxArtifactRoute({
        projectRoot,
        rootResolution: { ok: false, roots: [], issues: [] },
      });
      expect(blocking).toMatchObject({ ok: false, continuation: "block", diagnostic: { reason: "artifact-root-resolution-blocked" } });
      const missing = await resolveUxArtifactRoute({
        projectRoot,
        rootResolution: { ok: true, roots: [], issues: [] },
      });
      expect(missing).toMatchObject({ ok: false, continuation: "block", diagnostic: { reason: "planning-root-missing-or-ambiguous" } });
      await expect(readdir(projectRoot)).resolves.toEqual([]);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it.each(["directory", "dangling-symlink", "in-bound-symlink-directory", "out-of-bound-symlink"])(
    "fails closed with zero mutation for unsafe main candidate: %s",
    async (scenario) => {
      await withUxProject(async (projectRoot, roots) => {
        const candidate = path.join(projectRoot, planningRootPath, "ux/ux-design-specification.md");
        await mkdir(path.dirname(candidate), { recursive: true });
        if (scenario === "directory") await mkdir(candidate);
        if (scenario === "dangling-symlink") await symlink(path.join(projectRoot, "missing.md"), candidate);
        if (scenario === "in-bound-symlink-directory") {
          const directory = path.join(projectRoot, "safe-directory");
          await mkdir(directory);
          await symlink(directory, candidate);
        }
        if (scenario === "out-of-bound-symlink") {
          const outside = await mkdtemp(path.join(os.tmpdir(), "speclite-ux-outside-"));
          await writeFile(path.join(outside, "outside.md"), validUxDocument);
          await symlink(path.join(outside, "outside.md"), candidate);
        }
        const before = await snapshotTree(projectRoot, planningRootPath);
        const route = await resolveUxArtifactRoute({ projectRoot, rootResolution: roots });
        expect(route.ok).toBe(false);
        expect(route.continuation).toBe("block");
        expect(route.actualConsumedPath).toBeNull();
        await expect(snapshotTree(projectRoot, planningRootPath)).resolves.toEqual(before);
      });
    },
  );

  it("fails closed for an unreadable main candidate", async () => {
    await withUxProject(async (projectRoot, roots) => {
      const candidate = path.join(projectRoot, planningRootPath, "ux/ux-design-specification.md");
      await put(projectRoot, `${planningRootPath}/ux/ux-design-specification.md`, validUxDocument);
      await chmod(candidate, 0o000);
      try {
        const route = await resolveUxArtifactRoute({ projectRoot, rootResolution: roots });
        expect(route).toMatchObject({ ok: false, continuation: "block", diagnostic: { reason: "candidate-unreadable" } });
      } finally {
        await chmod(candidate, 0o600);
      }
    });
  });

  it("applies the same fail-close candidate gate to supporting artifacts", async () => {
    await withUxProject(async (projectRoot, roots) => {
      await put(projectRoot, `${planningRootPath}/ux/ux-design-specification.md`, validUxDocument);
      await mkdir(path.join(projectRoot, planningRootPath, "ux/ux-color-themes.html"));
      const before = await snapshotTree(projectRoot, planningRootPath);

      const route = await resolveUxArtifactRoute({ projectRoot, rootResolution: roots });

      expect(route).toMatchObject({
        ok: false,
        continuation: "block",
        actualConsumedPath: null,
        diagnostic: {
          reason: "candidate-not-regular-file",
          affectedPath: `${planningRootPath}/ux/ux-color-themes.html`,
        },
      });
      await expect(snapshotTree(projectRoot, planningRootPath)).resolves.toEqual(before);
    });
  });

  it.each(["regular-file", "fifo", "dangling-symlink", "outside-symlink", "cross-space-symlink"])(
    "fails closed when the canonical UX physical owner is unsafe: %s",
    async (scenario) => {
      const projectRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-ux-owner-"));
      const outside = await mkdtemp(path.join(os.tmpdir(), "speclite-ux-owner-outside-"));
      try {
        const roots = await resolveArtifactRoots({ projectRoot, lifecycle: "fresh" });
        await mkdir(path.join(projectRoot, planningRootPath), { recursive: true });
        await mkdir(path.join(projectRoot, "docs"), { recursive: true });
        const uxRoot = path.join(projectRoot, planningRootPath, "ux");
        if (scenario === "regular-file") await writeFile(uxRoot, "not a directory");
        if (scenario === "fifo") execFileSync("mkfifo", [uxRoot]);
        if (scenario === "dangling-symlink") await symlink(path.join(projectRoot, "missing-ux"), uxRoot);
        if (scenario === "outside-symlink") await symlink(outside, uxRoot);
        if (scenario === "cross-space-symlink") await symlink(path.join(projectRoot, "docs"), uxRoot);
        const before = await snapshotTree(projectRoot, ".");

        const route = await resolveUxArtifactRoute({ projectRoot, rootResolution: roots });

        expect(route).toMatchObject({
          ok: false,
          continuation: "block",
          actualConsumedPath: null,
          appendTarget: null,
        });
        await expect(snapshotTree(projectRoot, ".")).resolves.toEqual(before);
      } finally {
        await rm(projectRoot, { recursive: true, force: true });
        await rm(outside, { recursive: true, force: true });
      }
    },
  );

  it.each(["regular-file", "fifo", "dangling-symlink", "outside-symlink", "cross-space-symlink"])(
    "revalidates the nearest existing ancestor before a design-system write: %s",
    async (scenario) => {
      await withUxProject(async (projectRoot) => {
        const outside = await mkdtemp(path.join(os.tmpdir(), "speclite-ux-write-outside-"));
        try {
          await mkdir(path.join(projectRoot, "docs"), { recursive: true });
          const designSystem = path.join(projectRoot, planningRootPath, "ux/design-system");
          if (scenario === "regular-file") await writeFile(designSystem, "not a directory");
          if (scenario === "fifo") execFileSync("mkfifo", [designSystem]);
          if (scenario === "dangling-symlink") await symlink(path.join(projectRoot, "missing-design-system"), designSystem);
          if (scenario === "outside-symlink") await symlink(outside, designSystem);
          if (scenario === "cross-space-symlink") await symlink(path.join(projectRoot, "docs"), designSystem);
          const before = await snapshotTree(projectRoot, ".");

          const result = await executeUxArtifactOperation({
            projectRoot,
            planningRoot: planningRootPath,
            targetPath: `${planningRootPath}/ux/design-system/tokens.css`,
            operation: { kind: "create-file", content: "tokens" },
          });

          expect(result.ok).toBe(false);
          await expect(snapshotTree(projectRoot, ".")).resolves.toEqual(before);
        } finally {
          await rm(outside, { recursive: true, force: true });
        }
      });
    },
  );

  it("executes an exclusive canonical main create and an on-demand design-system mkdir", async () => {
    await withUxProject(async (projectRoot, roots) => {
      const route = await resolveUxArtifactRoute({ projectRoot, rootResolution: roots });
      expect(route).toMatchObject({
        ok: true,
        continuation: "fresh",
        actualColorThemesPath: `${planningRootPath}/ux/ux-color-themes.html`,
        actualDesignDirectionsPath: `${planningRootPath}/ux/ux-design-directions.html`,
      });
      await expect(executeUxArtifactOperation({
        projectRoot,
        planningRoot: planningRootPath,
        targetPath: `${planningRootPath}/ux/ux-design-specification.md`,
        operation: { kind: "create-file", content: validUxDocument },
      })).resolves.toMatchObject({ ok: true, operation: "create-file" });
      await expect(readFile(path.join(projectRoot, planningRootPath, "ux/ux-design-specification.md"), "utf8"))
        .resolves.toBe(validUxDocument);
      await expect(executeUxArtifactOperation({
        projectRoot,
        planningRoot: planningRootPath,
        targetPath: `${planningRootPath}/ux/design-system`,
        operation: { kind: "create-directory" },
      })).resolves.toMatchObject({ ok: true, operation: "create-directory" });
      expect((await lstat(path.join(projectRoot, planningRootPath, "ux/design-system"))).isDirectory()).toBe(true);
      await expect(access(path.join(projectRoot, planningRootPath, "ux/design-system/tokens.css")))
        .rejects.toMatchObject({ code: "ENOENT" });
    });
  });

  it("does not overwrite or truncate an existing canonical target", async () => {
    await withUxProject(async (projectRoot) => {
      const targetPath = `${planningRootPath}/ux/ux-design-specification.md`;
      await put(projectRoot, targetPath, "existing-content");

      const result = await executeUxArtifactOperation({
        projectRoot,
        planningRoot: planningRootPath,
        targetPath,
        operation: { kind: "create-file", content: "replacement" },
      });

      expect(result).toMatchObject({ ok: false, reason: "candidate-path-invalid" });
      await expect(readFile(path.join(projectRoot, targetPath), "utf8")).resolves.toBe("existing-content");
    });
  });

  it("halts when the canonical owner is replaced between discovery and the exclusive create", async () => {
    await withUxProject(async (projectRoot, roots) => {
      const route = await resolveUxArtifactRoute({ projectRoot, rootResolution: roots });
      expect(route).toMatchObject({ ok: true, continuation: "fresh", actualConsumedPath: null, appendTarget: null });
      await mkdir(path.join(projectRoot, "docs"), { recursive: true });
      await rm(path.join(projectRoot, planningRootPath, "ux"), { recursive: true });
      await symlink(path.join(projectRoot, "docs"), path.join(projectRoot, planningRootPath, "ux"));
      const before = await snapshotTree(projectRoot, ".");

      const preflight = await executeUxArtifactOperation({
        projectRoot,
        planningRoot: planningRootPath,
        targetPath: `${planningRootPath}/ux/ux-design-specification.md`,
        operation: { kind: "create-file", content: validUxDocument },
      });

      expect(preflight).toMatchObject({ ok: false, reason: "candidate-symlink-escape" });
      await expect(snapshotTree(projectRoot, ".")).resolves.toEqual(before);
    });
  });

  it.each([
    { operation: "create-file" as const, target: "ux/ux-design-specification.md" },
    { operation: "create-directory" as const, target: "ux/design-system" },
  ])("rejects an owner replacement after the initial check for $operation with zero operation mutation", async ({ operation, target }) => {
    await withUxProject(async (projectRoot) => {
      await mkdir(path.join(projectRoot, "docs"), { recursive: true });
      let afterInterposition: Array<{ path: string; hash: string }> = [];

      const result = await executeUxArtifactOperation({
        projectRoot,
        planningRoot: planningRootPath,
        targetPath: `${planningRootPath}/${target}`,
        operation: operation === "create-file"
          ? { kind: "create-file", content: validUxDocument }
          : { kind: "create-directory" },
        __testOnlyInterposeBeforeCommit: async () => {
          await rm(path.join(projectRoot, planningRootPath, "ux"), { recursive: true });
          await symlink(path.join(projectRoot, "docs"), path.join(projectRoot, planningRootPath, "ux"));
          afterInterposition = await snapshotTree(projectRoot, ".");
        },
      });

      expect(result).toMatchObject({ ok: false, reason: "candidate-symlink-escape" });
      await expect(snapshotTree(projectRoot, ".")).resolves.toEqual(afterInterposition);
      await expect(access(path.join(projectRoot, "docs", path.basename(target)))).rejects.toMatchObject({ code: "ENOENT" });
    });
  });

  it.each([
    { target: "canonical-main", link: `${planningRootPath}/ux/ux-design-specification.md`, body: validUxDocument },
    { target: "canonical-supporting", link: `${planningRootPath}/ux/ux-color-themes.html`, body: "legacy color" },
    { target: "legacy-main", link: `${planningRootPath}/ux-design-specification.md`, body: validUxDocument },
  ])("rejects an existing $target whose physical target crosses its owning space", async ({ link, body }) => {
    await withUxProject(async (projectRoot, roots) => {
      const externalSpace = path.join(projectRoot, "docs");
      await mkdir(externalSpace, { recursive: true });
      const target = path.join(externalSpace, path.basename(link));
      await writeFile(target, body);
      await symlink(target, path.join(projectRoot, link));
      if (link.includes("ux-color")) {
        await put(projectRoot, `${planningRootPath}/ux/ux-design-specification.md`, validUxDocument);
      }
      const before = await snapshotTree(projectRoot, ".");

      const route = await resolveUxArtifactRoute({ projectRoot, rootResolution: roots });

      expect(route).toMatchObject({ ok: false, continuation: "block", actualConsumedPath: null, appendTarget: null });
      await expect(snapshotTree(projectRoot, ".")).resolves.toEqual(before);
    });
  });

  it("allows an existing legacy symlink only when its target stays in the real Planning owner", async () => {
    await withUxProject(async (projectRoot, roots) => {
      const target = `${planningRootPath}/retained-legacy-ux.md`;
      await put(projectRoot, target, validUxDocument);
      await symlink("retained-legacy-ux.md", path.join(projectRoot, planningRootPath, "ux-design-specification.md"));

      const route = await resolveUxArtifactRoute({ projectRoot, rootResolution: roots });

      expect(route).toMatchObject({
        ok: true,
        continuation: "continue",
        actualConsumedPath: `${planningRootPath}/ux-design-specification.md`,
      });
    });
  });

  it("keeps local Markdown and HTML references project-contained", () => {
    const projectRoot = path.join(os.tmpdir(), "speclite-ux-links-project");
    expect(
      resolveProjectRelativePath({
        projectRoot,
        relativePath: "_speclite-output/2-planning-artifacts/ux/assets/palette.css",
      }).relativePath,
    ).toBe("_speclite-output/2-planning-artifacts/ux/assets/palette.css");
    expect(() =>
      resolveProjectRelativePath({ projectRoot, relativePath: "../../outside.css" }),
    ).toThrow("Path must stay inside the target project");
  });

  it("executes bounded Markdown and HTML reference parsing with containing-directory and single-decode semantics", async () => {
    const projectRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-ux-local-references-"));
    try {
      const artifactPath = `${planningRootPath}/ux/pages/directions.html`;
      await put(projectRoot, `${planningRootPath}/ux/ux-color-themes.html`, "theme");
      await put(projectRoot, `${planningRootPath}/ux/assets/palette light.css`, "css");
      await put(projectRoot, `${planningRootPath}/ux/assets/icon.svg`, "svg");
      await put(projectRoot, `${planningRootPath}/ux/assets/%2F-literal.css`, "double encoded");
      const content = [
        "[Theme](../ux-color-themes.html?raw=1#palette)",
        "[Palette][palette]",
        "[Double](../assets/%252F-literal.css)",
        "[External](https://example.com/theme.css)",
        "<img src='../assets/palette%20light.css#preview'>",
        "<img src=../assets/icon.svg>",
        "<a href=\"mailto:ux@example.com\">Mail</a>",
        "",
        "[palette]: <../assets/palette%20light.css?raw=1>",
      ].join("\n");

      const result = await validateUxLocalReferences({ projectRoot, artifactPath, content });

      expect(result).toEqual({
        ok: true,
        localPaths: [
          `${planningRootPath}/ux/ux-color-themes.html`,
          `${planningRootPath}/ux/assets/%2F-literal.css`,
          `${planningRootPath}/ux/assets/palette light.css`,
          `${planningRootPath}/ux/assets/icon.svg`,
        ],
        ignoredExternalReferences: ["https://example.com/theme.css", "mailto:ux@example.com"],
      });
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it.each([
    {
      name: "exact duplicate unsafe-first",
      use: "dup",
      definitions: ["[dup]: ../../../../outside.css", "[dup]: safe.css"],
      ok: false,
    },
    {
      name: "case/whitespace duplicate unsafe-first",
      use: "dUp key",
      definitions: ["[DUP   KEY]: ../../../../outside.css", "[dup key]: safe.css"],
      ok: false,
    },
    {
      name: "exact duplicate safe-first",
      use: "dup",
      definitions: ["[dup]: safe.css", "[dup]: ../../../../outside.css"],
      ok: true,
    },
    {
      name: "case/whitespace duplicate safe-first",
      use: "DUP   KEY",
      definitions: ["[dup key]: safe.css", "[DUP   KEY]: ../../../../outside.css"],
      ok: true,
    },
  ])("uses the first normalized Markdown definition for $name", async ({ use, definitions, ok }) => {
    const projectRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-ux-duplicate-reference-"));
    try {
      const artifactPath = `${planningRootPath}/ux/spec.md`;
      await put(projectRoot, `${planningRootPath}/ux/safe.css`, "safe");
      const content = [`[Use][${use}]`, ...definitions].join("\n");

      const result = await validateUxLocalReferences({ projectRoot, artifactPath, content });

      expect(result.ok).toBe(ok);
      if (ok) {
        expect(result).toMatchObject({ localPaths: [`${planningRootPath}/ux/safe.css`] });
      } else {
        expect(result).toMatchObject({ localPaths: [], reason: "local-reference-outside-project" });
      }
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it.each([
    "asset&#47;icon.svg",
    "asset&#x2f;icon.svg",
    "asset&#X2Ficon.svg",
    "asset&sol;icon.svg",
    "asset&SOL/icon.svg",
    "asset&ampicon.svg",
    "asset&malformed/icon.svg",
    "asset.svg?next=&#47;outside.svg",
    "asset.svg#next=&#x2f;outside.svg",
    "..&#47;..&#47;outside.svg",
  ])("fails closed before decoding a local-ish HTML character reference: %s", async (reference) => {
    const projectRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-ux-html-reference-"));
    try {
      const before = await snapshotTree(projectRoot, ".");
      const result = await validateUxLocalReferences({
        projectRoot,
        artifactPath: `${planningRootPath}/ux/spec.md`,
        content: `<img src="${reference}">`,
      });
      expect(result).toMatchObject({ ok: false, localPaths: [], reason: "unsupported-local-reference", reference });
      await expect(snapshotTree(projectRoot, ".")).resolves.toEqual(before);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it("keeps external schemes and literal fragment/query-only HTML references outside the local fail-close rule", async () => {
    const projectRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-ux-html-controls-"));
    try {
      const result = await validateUxLocalReferences({
        projectRoot,
        artifactPath: `${planningRootPath}/ux/spec.md`,
        content: [
          '<a href="https://example.com/a?x=1&amp;y=2">External</a>',
          '<a href="#palette&amp;dark">Fragment</a>',
          '<a href="?theme=dark&amp;contrast=high">Query</a>',
        ].join("\n"),
      });
      expect(result).toEqual({
        ok: true,
        localPaths: [],
        ignoredExternalReferences: ["https://example.com/a?x=1&amp;y=2"],
      });
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it.each([
    { name: "encoded traversal separator", reference: "../../../%2e%2e%2foutside.css", reason: "unsupported-local-reference" },
    { name: "encoded separator", reference: "assets%2fpalette.css", reason: "unsupported-local-reference" },
    { name: "malformed encoding", reference: "asset%ZZ.css", reason: "unsupported-local-reference" },
    { name: "network path", reference: "//server/share.css", reason: "unsupported-local-reference" },
    { name: "absolute path", reference: "/tmp/outside.css", reason: "unsupported-local-reference" },
    { name: "drive path", reference: "C:/outside.css", reason: "unsupported-local-reference" },
    { name: "backslash path", reference: "..\\outside.css", reason: "unsupported-local-reference" },
    { name: "literal traversal", reference: "../../../../outside.css", reason: "local-reference-outside-project" },
  ])("fails closed for $name", async ({ reference, reason }) => {
    const projectRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-ux-bad-reference-"));
    try {
      const result = await validateUxLocalReferences({
        projectRoot,
        artifactPath: `${planningRootPath}/ux/page.html`,
        content: `<link href="${reference}">`,
      });
      expect(result).toMatchObject({ ok: false, localPaths: [], reason, reference });
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it("fails closed for undefined Markdown references and symlink escapes", async () => {
    const projectRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-ux-reference-security-"));
    const outside = await mkdtemp(path.join(os.tmpdir(), "speclite-ux-reference-outside-"));
    try {
      const undefinedResult = await validateUxLocalReferences({
        projectRoot,
        artifactPath: `${planningRootPath}/ux/spec.md`,
        content: "[Missing][undefined]",
      });
      expect(undefinedResult).toMatchObject({ ok: false, reason: "undefined-reference" });
      await writeFile(path.join(outside, "secret.css"), "secret");
      await mkdir(path.join(projectRoot, planningRootPath, "ux"), { recursive: true });
      await symlink(path.join(outside, "secret.css"), path.join(projectRoot, planningRootPath, "ux/secret.css"));
      const symlinkResult = await validateUxLocalReferences({
        projectRoot,
        artifactPath: `${planningRootPath}/ux/spec.md`,
        content: "[Secret](secret.css)",
      });
      expect(symlinkResult).toMatchObject({ ok: false, localPaths: [], reason: "local-reference-symlink-escape" });
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
      await rm(outside, { recursive: true, force: true });
    }
  });

  it("fails closed for a malformed HTML local-reference attribute", async () => {
    const projectRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-ux-malformed-html-"));
    try {
      const result = await validateUxLocalReferences({
        projectRoot,
        artifactPath: `${planningRootPath}/ux/spec.md`,
        content: "<img src=>",
      });
      expect(result).toMatchObject({ ok: false, localPaths: [], reason: "malformed-reference" });
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it("enforces the Planning UX, Public Docs and Project Knowledge ownership matrix", () => {
    const common = { planningRoot: planningRootPath, projectKnowledgeRoot: "knowledge" };
    expect(isUxArtifactTargetAllowed({ ...common, owner: "ux-workflow", targetPath: `${planningRootPath}/ux/design-system/tokens.css` })).toBe(true);
    expect(isUxArtifactTargetAllowed({ ...common, owner: "ux-workflow", targetPath: `${planningRootPath}/ux-design.md` })).toBe(false);
    expect(isUxArtifactTargetAllowed({ ...common, owner: "ux-workflow", targetPath: "docs/ux.md" })).toBe(false);
    expect(isUxArtifactTargetAllowed({ ...common, owner: "public-docs", targetPath: "docs/reference/ux.md" })).toBe(true);
    expect(isUxArtifactTargetAllowed({ ...common, owner: "public-docs", targetPath: "knowledge/ux.md" })).toBe(false);
    expect(isUxArtifactTargetAllowed({ ...common, owner: "project-knowledge", targetPath: "knowledge/domain/ux.md" })).toBe(true);
    expect(isUxArtifactTargetAllowed({ ...common, owner: "project-knowledge", targetPath: "docs/ux.md" })).toBe(false);
  });

  it("keeps a legacy UX tree unchanged across install, update and repair", async () => {
    const projectRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-ux-lifecycle-"));
    try {
      const legacyRoot = "_speclite-output/2-planning-artifacts";
      const legacyEntries = [
        `${legacyRoot}/ux-design-specification.md`,
        `${legacyRoot}/ux-color-themes.html`,
        `${legacyRoot}/ux-design-directions.html`,
        `${legacyRoot}/legacy-assets`,
        `${legacyRoot}/legacy-assets/palette.css`,
        `${legacyRoot}/legacy-assets/palette-link.css`,
      ];
      await put(projectRoot, `${legacyRoot}/ux-design-specification.md`, validUxDocument);
      await put(projectRoot, `${legacyRoot}/ux-color-themes.html`, "legacy color");
      await put(projectRoot, `${legacyRoot}/ux-design-directions.html`, "legacy directions");
      await put(projectRoot, `${legacyRoot}/legacy-assets/palette.css`, "legacy palette");
      await symlink(
        "palette.css",
        path.join(projectRoot, legacyRoot, "legacy-assets/palette-link.css"),
      );
      const before = await snapshotEntries(projectRoot, legacyEntries);

      const install = await runInstallCommand({
        options: { json: true, yes: true },
        runtime: { ...supportedRuntime, cwd: projectRoot, targetProject: "ux-lifecycle" },
      });
      expect(install.exitCode).toBe(0);
      expect(install.result).toMatchObject({ command: "install", status: "success" });
      await expectLegacyLifecycleState(projectRoot, legacyEntries, before);

      const update = await runUpdateCommand({
        options: { yes: true },
        runtime: { cwd: projectRoot, targetProject: "ux-lifecycle" },
      });
      expect(update.exitCode).toBe(0);
      expect(update.result).toMatchObject({ command: "update", status: "success" });
      expect(update.result.data.changedPaths.filter((entry) => entry.startsWith(`${legacyRoot}/`))).toEqual([]);
      await expectLegacyLifecycleState(projectRoot, legacyEntries, before);

      // Repair intentionally preserves indexed human-owned seed files as conflicts.
      // Remove those unrelated entries from this fixture's installed-state index so
      // the repair command can complete and prove its legacy UX no-migration path.
      const filesIndexPath = path.join(projectRoot, "_speclite/_config/files-index.json");
      const filesIndex = JSON.parse(await readFile(filesIndexPath, "utf8")) as {
        entries: Array<{ path: string }>;
      };
      const unrelatedHumanOwned = new Set([
        ".gitignore",
        "_speclite/custom/config.toml",
        "_speclite/custom/config.user.toml",
      ]);
      filesIndex.entries = filesIndex.entries.filter((entry) => !unrelatedHumanOwned.has(entry.path));
      await writeFile(filesIndexPath, `${JSON.stringify(filesIndex, null, 2)}\n`, "utf8");
      const repair = await runUpdateCommand({
        options: { repair: true, yes: true },
        runtime: { cwd: projectRoot, targetProject: "ux-lifecycle" },
      });
      expect(repair.exitCode).toBe(0);
      expect(repair.result).toMatchObject({ command: "update.repair", status: "success" });
      expect(repair.result.data.changedPaths.filter((entry) => entry.startsWith(`${legacyRoot}/`))).toEqual([]);
      await expectLegacyLifecycleState(projectRoot, legacyEntries, before);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  }, 30_000);

  it("keeps the six Story-scope config examples at exact seven-root fresh-default parity", async () => {
    const configExamples = [
      "2-plan-workflows/speclite-create-ux-design/config.toml.example",
      "3-solutioning/speclite-implementation-readiness-check/config.toml.example",
      "3-solutioning/speclite-create-architecture/config.toml.example",
      "3-solutioning/speclite-create-epics-and-stories/config.toml.example",
      "4-implementation/speclite-correct-course/config.toml.example",
      "4-implementation/speclite-create-story/config.toml.example",
    ];
    for (const relativePath of configExamples) {
      const text = await readFile(path.join(sourceRoot, relativePath), "utf8");
      for (const definition of ARTIFACT_ROOT_REGISTRY) {
        const expected = `${definition.configPath.split(".").at(-1)} = "{project-root}/${definition.freshDefault}"`;
        expect(text, `${relativePath}: ${definition.configPath}`).toContain(expected);
      }
      expect(text).not.toContain('planning_artifacts = "{project-root}/_speclite-output/planning-artifacts"');
      expect(text).not.toContain('implementation_artifacts = "{project-root}/_speclite-output/implementation-artifacts"');
      expect(text).not.toContain('project_knowledge = "{project-root}/docs"');
    }
  });

  it("updates declared consumers, help metadata and public docs to the UX contract", async () => {
    const skillEntrypoints = [
      "2-plan-workflows/speclite-create-ux-design",
      "3-solutioning/speclite-implementation-readiness-check",
      "3-solutioning/speclite-create-architecture",
      "3-solutioning/speclite-create-epics-and-stories",
      "3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer",
      "4-implementation/speclite-correct-course",
      "4-implementation/speclite-create-story",
    ];
    for (const skillRoot of skillEntrypoints) {
      for (const skillFile of ["SKILL.md", "SKILL.en.md"]) {
        const text = await readFile(path.join(sourceRoot, skillRoot, skillFile), "utf8");
        expect(text, `${skillRoot}/${skillFile}`).toContain("{planning_artifacts}/ux/");
      }
    }

    const consumers = [
      "3-solutioning/speclite-implementation-readiness-check/references/steps/step-01-document-discovery.md",
      "3-solutioning/speclite-implementation-readiness-check/references/steps/step-04-ux-alignment.md",
      "3-solutioning/speclite-create-architecture/references/steps/step-01-init.md",
      "3-solutioning/speclite-create-epics-and-stories/references/workflow-steps.md",
      "3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/references/workflow.md",
      "4-implementation/speclite-correct-course/references/workflow-details.md",
      "4-implementation/speclite-create-story/references/workflow-details.md",
    ];

    for (const relativePath of consumers) {
      const text = await readFile(path.join(sourceRoot, relativePath), "utf8");
      expect(text, relativePath).toContain(exactUxPaths[0]);
      expect(text, relativePath).toContain("actualConsumedPath");
    }

    const help = await readFile(
      path.join(process.cwd(), "assets/source/speclite/sdlc-skills/module-help.csv"),
      "utf8",
    );
    expect(help).toMatch(/speclite-create-ux-design[^\n]+\{planning_artifacts\}\/ux,/);

    const workflowLayout = await readFile(
      path.join(process.cwd(), "docs/reference/workflow-artifact-layout.md"),
      "utf8",
    );
    const workflowCatalog = await readFile(
      path.join(process.cwd(), "docs/reference/skills/sdlc-workflows.md"),
      "utf8",
    );
    for (const artifactPath of exactUxPaths) expect(workflowLayout).toContain(artifactPath);
    expect(workflowCatalog).toContain("{planning_artifacts}/ux");
  });

  it("finds no active Planning-root UX producer defaults", async () => {
    const files = await collectFiles(createUxRoot);
    const forbidden = [
      /default_output_file` = `\{planning_artifacts\}\/ux-design-specification\.md/,
      /Copy the template[^\n]+to `\{planning_artifacts\}\/ux-design-specification\.md`/,
      /Append the final content to `\{planning_artifacts\}\/ux-design-specification\.md`/,
      /showcase at `\{planning_artifacts\}\/ux-design-directions\.html`/,
      /visualizer at `\{planning_artifacts\}\/ux-color-themes\.html`/,
      /workflow_status\["create-ux-design"\] = `\{planning_artifacts\}\/ux-design-specification\.md`/,
    ];
    const violations: string[] = [];
    for (const filePath of files) {
      const text = await readFile(filePath, "utf8");
      for (const pattern of forbidden) {
        if (pattern.test(text)) violations.push(`${path.relative(process.cwd(), filePath)} => ${pattern.source}`);
      }
    }
    expect(violations).toEqual([]);
  });
});

async function collectFiles(root: string): Promise<string[]> {
  const result: string[] = [];
  for (const entry of await readdir(root, { withFileTypes: true })) {
    const entryPath = path.join(root, entry.name);
    if (entry.isDirectory()) result.push(...(await collectFiles(entryPath)));
    else if (entry.isFile() && [".md", ".toml", ".json"].includes(path.extname(entry.name))) result.push(entryPath);
  }
  return result;
}

async function withUxProject(
  run: (projectRoot: string, roots: ArtifactRootResolutionResult) => Promise<void>,
): Promise<void> {
  const projectRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-ux-contract-"));
  try {
    const roots = await resolveArtifactRoots({ projectRoot, lifecycle: "fresh" });
    expect(roots.ok).toBe(true);
    await mkdir(path.join(projectRoot, planningRootPath, "ux"), { recursive: true });
    await run(projectRoot, roots);
  } finally {
    await rm(projectRoot, { recursive: true, force: true });
  }
}

async function put(projectRoot: string, relativePath: string, content: string): Promise<void> {
  const target = path.join(projectRoot, relativePath);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, content, { encoding: "utf8", flag: "wx" });
}

async function snapshotTree(projectRoot: string, relativeRoot: string): Promise<Array<{ path: string; hash: string }>> {
  const root = path.join(projectRoot, relativeRoot);
  const files = await collectAllFiles(root).catch(() => [] as string[]);
  return Promise.all(files.sort().map(async (filePath) => {
    const entry = await lstat(filePath);
    return {
      path: path.relative(projectRoot, filePath).split(path.sep).join("/"),
      hash: entry.isSymbolicLink() ? `symlink:${await readlink(filePath)}` : await hashFile(filePath),
    };
  }));
}

async function snapshotEntries(
  projectRoot: string,
  relativePaths: string[],
): Promise<Array<{ path: string; type: string; value: string }>> {
  return Promise.all(relativePaths.map(async (relativePath) => {
    const absolutePath = path.join(projectRoot, relativePath);
    const entry = await lstat(absolutePath);
    const type = entry.isSymbolicLink() ? "symlink" : entry.isDirectory() ? "directory" : entry.isFile() ? "file" : "other";
    const value = entry.isSymbolicLink()
      ? await readlink(absolutePath)
      : entry.isFile()
        ? await hashFile(absolutePath)
        : "-";
    return { path: relativePath, type, value };
  }));
}

async function expectLegacyLifecycleState(
  projectRoot: string,
  legacyEntries: string[],
  expected: Array<{ path: string; type: string; value: string }>,
): Promise<void> {
  await expect(snapshotEntries(projectRoot, legacyEntries)).resolves.toEqual(expected);
  await expect(access(path.join(projectRoot, planningRootPath, "ux"))).resolves.toBeUndefined();
  const legacyPrefix = `${planningRootPath}/`;
  for (const legacyPath of legacyEntries) {
    const counterpart = legacyPath.startsWith(legacyPrefix)
      ? legacyPath.slice(legacyPrefix.length)
      : legacyPath;
    await expect(lstat(path.join(projectRoot, planningRootPath, "ux", counterpart)))
      .rejects.toMatchObject({ code: "ENOENT" });
  }
}

async function collectAllFiles(root: string): Promise<string[]> {
  const result: string[] = [];
  for (const entry of await readdir(root, { withFileTypes: true })) {
    const entryPath = path.join(root, entry.name);
    if (entry.isDirectory()) result.push(...(await collectAllFiles(entryPath)));
    else if (entry.isFile() || entry.isSymbolicLink()) result.push(entryPath);
  }
  return result;
}

function runInstalledUxOperation(
  scriptPath: string,
  args: string[],
  options: { input?: string; env?: NodeJS.ProcessEnv } = {},
): { status: number | null; lines: number; json: Record<string, unknown> } {
  const result = spawnSync(process.execPath, [scriptPath, ...args], {
    encoding: "utf8",
    input: options.input,
    env: options.env,
  });
  expect(result.error).toBeUndefined();
  expect(result.stderr).toBe("");
  const lines = result.stdout.trimEnd().split("\n");
  expect(lines).toHaveLength(1);
  return {
    status: result.status,
    lines: lines.length,
    json: JSON.parse(lines[0] ?? "null") as Record<string, unknown>,
  };
}
