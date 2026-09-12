import { chmod, lstat, mkdir, mkdtemp, readFile, readdir, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { runUpdateCommand } from "../src/commands/update.js";
import { runInstallCommand } from "../src/commands/install.js";
import {
  RepairCommandResultSchema,
  UpdateCommandResultSchema,
  UpdatePlanActionSchema,
} from "../src/diagnostics/command-result-schema.js";
import { renderUpdateHumanOutput } from "../src/diagnostics/output.js";
import { hashBytes, hashFile, hashPackageDirectory } from "../src/manifest/hash.js";
import {
  applyRecoverableUpdateTransaction,
  finalizeCompletedUpdateTransaction,
} from "../src/fs/update-transaction.js";

const supportedRuntime = {
  nodeVersion: "v22.12.0",
  platform: "darwin",
  platformRelease: "23.0.0",
} as const;

describe("update ownership planning", () => {
  it("halts with the resolver issue before projecting an existing root symlink escape", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-update-root-failure-"));
    const outsideRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-update-root-outside-"));
    try {
      await symlink(outsideRoot, path.join(tempRoot, "external-link"));
      await writeProjectFile(tempRoot, "_speclite/config.toml", [
        "[core]",
        'project_name = "Base"',
        'output_folder = "_speclite-output"',
        "[modules.sdlc]",
        'solutioning_artifacts = "external-link/solutioning"',
        "",
      ].join("\n"));
      await writeInstalledState(tempRoot, [], {
        installedModules: ["core", "sdlc"],
        targetIds: ["agents"],
      });

      const outcome = await runUpdateCommand({
        options: { yes: true },
        runtime: { cwd: tempRoot, targetProject: "root-failure" },
      });
      const parsed = UpdateCommandResultSchema.parse(outcome.result);
      expect(outcome.exitCode).toBe(1);
      expect(parsed.issues).toContainEqual(expect.objectContaining({
        issueId: "artifact-path.symlink-escape",
        affectedPath: "project-config:modules.sdlc.solutioning_artifacts",
      }));
      expect(parsed.data.updatePlan.actions).toEqual([]);
      expect(parsed.data.changedPaths).toEqual([]);
      await expect(readFile(path.join(tempRoot, "_speclite/_config/.update-journal.json"), "utf8"))
        .rejects.toThrow();
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
      await rm(outsideRoot, { recursive: true, force: true });
    }
  });

  it("accepts only typed canonical rename updates and skips", () => {
    const base = {
      affectedPath: ".agents/skills/old/SKILL.md",
      ownership: "installer-owned",
      expectedHash: "sha256:new",
    } as const;
    expect(UpdatePlanActionSchema.safeParse({
      ...base,
      action: "update",
      reason: "canonical-skill-renamed",
      replacementCanonicalSkillId: "active",
    }).success).toBe(true);
    expect(UpdatePlanActionSchema.safeParse({
      ...base,
      action: "update",
      reason: "canonical-skill-renamed",
    }).success).toBe(false);
    for (const action of ["create", "update", "conflict"] as const) {
      expect(UpdatePlanActionSchema.safeParse({ ...base, action, reason: "unchanged" }).success).toBe(false);
      expect(UpdatePlanActionSchema.safeParse({
        ...base,
        action,
        replacementCanonicalSkillId: "active",
      }).success).toBe(false);
    }
  });

  it("blocks update planning when required project config cannot be resolved", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-update-config-required-"));

    try {
      await mkdir(path.join(tempRoot, "_speclite/_config"), { recursive: true });
      await writeInstalledState(tempRoot, []);

      const outcome = await runUpdateCommand({ runtime: { cwd: tempRoot, targetProject: "missing-config" } });
      const parsed = UpdateCommandResultSchema.parse(outcome.result);

      expect(outcome.exitCode).toBe(1);
      expect(parsed.status).toBe("failure");
      expect(parsed.issues).toEqual([
        expect.objectContaining({
          issueId: "runtime-path.missing-entry",
          severity: "error",
          affectedPath: "_speclite/config.toml",
          component: "config-resolver",
          details: {
            layerKind: "config",
            layerRole: "required-config",
            status: "missing",
          },
        }),
      ]);
      expect(parsed.data).toMatchObject({
        updatePlan: { actions: [] },
        changedPaths: [],
        skippedPaths: [],
        conflicts: [],
        requiresConfirmation: false,
        writeAuthorized: false,
      });
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("resolves project config warnings before update planning without mutating human-owned TOML", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-update-config-warning-"));

    try {
      await writeProjectFile(tempRoot, "_speclite/config.toml", "[core]\nproject_name = \"Base\"\n");
      await writeProjectFile(tempRoot, "_speclite/config.user.toml", "[core]\nproject_name = \"Installer User\"\n");
      const humanConfig = "# keep comment order\n[core\nproject_name = \"broken\"\n";
      await writeProjectFile(tempRoot, "_speclite/custom/config.toml", humanConfig);
      await writeProjectFile(
        tempRoot,
        "_speclite/custom/config.user.toml",
        "[core]\ndocument_output_language = \"Mandarin\"\n",
      );
      await writeInstalledState(tempRoot, []);

      const outcome = await runUpdateCommand({ runtime: { cwd: tempRoot, targetProject: "config-warning" } });
      const parsed = UpdateCommandResultSchema.parse(outcome.result);

      expect(outcome.exitCode).toBe(0);
      expect(parsed.status).toBe("warning");
      expect(parsed.issues).toEqual([
        expect.objectContaining({
          issueId: "manifest-schema.malformed-field",
          severity: "warning",
          affectedPath: "_speclite/custom/config.toml",
          component: "config-resolver",
          details: {
            layerKind: "config",
            layerRole: "optional-config",
            status: "parse-failed",
          },
        }),
      ]);
      expect(JSON.stringify(parsed.issues)).not.toContain(tempRoot);
      await expect(readFile(path.join(tempRoot, "_speclite/custom/config.toml"), "utf8")).resolves.toBe(
        humanConfig,
      );
      expect(parsed.data.conflicts).toEqual([]);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("resolves installed skill customization by skill directory basename before update planning", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-update-customization-"));

    try {
      await writeProjectFile(tempRoot, "_speclite/config.toml", "[core]\nproject_name = \"Base\"\n");
      await writeProjectFile(tempRoot, ".agents/skills/speclite-dev-story/customize.toml", [
        "[workflow]",
        'on_complete = "defaults"',
      ].join("\n"));
      await writeProjectFile(tempRoot, "canonical/speclite-dev-story/SKILL.md", "# Skill\n");
      await writeProjectFile(tempRoot, "_speclite/custom/speclite-dev-story.toml", [
        "# team custom stays human-owned",
        "[workflow]",
        'on_complete = "team"',
      ].join("\n"));
      const malformedUserCustom = "[workflow\non_complete = \"broken\"\n";
      await writeProjectFile(
        tempRoot,
        "_speclite/custom/speclite-dev-story.user.toml",
        malformedUserCustom,
      );
      await writeProjectFile(
        tempRoot,
        "_speclite/custom/Developer.user.toml",
        "[workflow\non_complete = \"wrong-key\"\n",
      );
      await writeInstalledState(tempRoot, [
        await filesIndexEntry(tempRoot, ".agents/skills/speclite-dev-story/SKILL.md", "# Skill\n", {
          ownership: "installer-owned",
          sourceRef: "canonical/speclite-dev-story/SKILL.md",
        }),
      ]);

      const outcome = await runUpdateCommand({ runtime: { cwd: tempRoot, targetProject: "customization" } });
      const parsed = UpdateCommandResultSchema.parse(outcome.result);

      expect(outcome.exitCode).toBe(0);
      expect(parsed.status).toBe("warning");
      expect(parsed.issues).toEqual([
        expect.objectContaining({
          issueId: "manifest-schema.malformed-field",
          severity: "warning",
          affectedPath: "_speclite/custom/speclite-dev-story.user.toml",
          component: "customization-resolver",
          details: {
            layerKind: "customization",
            layerRole: "user-custom",
            status: "parse-failed",
          },
        }),
      ]);
      expect(JSON.stringify(parsed.issues)).not.toContain("Developer.user.toml");
      await expect(
        readFile(path.join(tempRoot, "_speclite/custom/speclite-dev-story.user.toml"), "utf8"),
      ).resolves.toBe(malformedUserCustom);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("skips customization resolution for installed skills without optional defaults", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-update-no-customization-"));

    try {
      await writeProjectFile(tempRoot, "_speclite/config.toml", "[core]\nproject_name = \"Base\"\n");
      await writeProjectFile(tempRoot, "canonical/speclite-help/SKILL.md", "# Help\n");
      await writeProjectFile(tempRoot, ".agents/skills/speclite-help/SKILL.md", "# Help\n");
      await writeInstalledState(tempRoot, [
        await filesIndexEntry(tempRoot, ".agents/skills/speclite-help/SKILL.md", "# Help\n", {
          ownership: "installer-owned",
          sourceRef: "canonical/speclite-help/SKILL.md",
        }),
      ]);

      const outcome = await runUpdateCommand({ runtime: { cwd: tempRoot, targetProject: "no-customization" } });
      const parsed = UpdateCommandResultSchema.parse(outcome.result);

      expect(outcome.exitCode).toBe(0);
      expect(parsed.issues).toEqual([]);
      expect(parsed.data.updatePlan.actions).toEqual([
        expect.objectContaining({
          affectedPath: ".agents/skills/speclite-help/SKILL.md",
          action: "skip",
          reason: "unchanged",
        }),
      ]);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("reads bundled canonical evidence from the SpecLite package instead of the target project", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-update-bundled-source-"));
    const sourceRef = "assets/source/speclite/hooks/flow-gate-enforcement/runner.mjs";
    const bundledContents = await readFile(path.join(process.cwd(), sourceRef), "utf8");

    try {
      await writeProjectFile(tempRoot, "_speclite/config.toml", "[core]\nproject_name = \"Base\"\n");
      await writeProjectFile(tempRoot, sourceRef, "// target shadow must not be trusted\n");
      await writeProjectFile(tempRoot, "_speclite/hooks/flow-gate-enforcement/runner.mjs", bundledContents);
      await writeInstalledState(tempRoot, [
        await filesIndexEntry(
          tempRoot,
          "_speclite/hooks/flow-gate-enforcement/runner.mjs",
          bundledContents,
          { ownership: "installer-owned", sourceRef },
        ),
      ]);

      const outcome = await runUpdateCommand({ runtime: { cwd: tempRoot, targetProject: "bundled-source" } });
      const parsed = UpdateCommandResultSchema.parse(outcome.result);

      expect(outcome.exitCode).toBe(0);
      expect(parsed.data.conflicts).toEqual([]);
      expect(parsed.data.updatePlan.actions).toEqual([
        expect.objectContaining({
          affectedPath: "_speclite/hooks/flow-gate-enforcement/runner.mjs",
          action: "skip",
          reason: "unchanged",
        }),
      ]);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("plans canonical files missing from the installed files index as safe creates", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-update-canonical-inventory-"));

    try {
      await writeProjectFile(tempRoot, "_speclite/config.toml", "[core]\nproject_name = \"Base\"\n");
      await writeInstalledState(tempRoot, [], { installedModules: ["core"], targetIds: ["agents"] });
      await writeSkillIndex(tempRoot, [
        skillIndexEntry({
          canonicalSkillId: "speclite-help",
          canonicalPackageHash: "sha256:old-package",
          installedTargets: ["agents"],
        }),
      ]);
      const helpIndex = `${JSON.stringify({ schemaVersion: "speclite.help-index.v1", entries: [] }, null, 2)}\n`;
      const phaseCoverage = `${JSON.stringify({ schemaVersion: "speclite.phase-coverage.v1", rows: [] }, null, 2)}\n`;
      await writeProjectFile(tempRoot, "_speclite/_config/help-index.json", helpIndex);
      await writeProjectFile(tempRoot, "_speclite/_config/phase-coverage.json", phaseCoverage);
      const baselineEntries = [];
      for (const [relativePath, artifactKind, sourceRef] of [
        ["_speclite/_config/manifest.yaml", "manifest", "installed-state:manifest"],
        ["_speclite/_config/skill-index.json", "skill-index", "installed-state:skill-index"],
        ["_speclite/_config/help-index.json", "help-index", "installed-state:help-index"],
        ["_speclite/_config/phase-coverage.json", "phase-coverage", "installed-state:phase-coverage"],
      ] as const) {
        baselineEntries.push(await filesIndexEntry(
          tempRoot,
          relativePath,
          await readFile(path.join(tempRoot, relativePath), "utf8"),
          { ownership: "installer-owned", sourceRef, artifactKind },
        ));
      }
      await writeProjectFile(
        tempRoot,
        "_speclite/_config/files-index.json",
        `${JSON.stringify({ schemaVersion: "speclite.files-index.v1", entries: baselineEntries }, null, 2)}\n`,
      );

      const outcome = await runUpdateCommand({ runtime: { cwd: tempRoot, targetProject: "canonical-inventory" } });
      const parsed = UpdateCommandResultSchema.parse(outcome.result);

      expect(outcome.exitCode).toBe(0);
      expect(parsed.data.conflicts).toEqual([]);
      expect(parsed.data.updatePlan.actions).toContainEqual({
        affectedPath: ".agents/skills/speclite-domain-modeling/SKILL.md",
        ownership: "installer-owned",
        action: "create",
        expectedHash: expect.stringMatching(/^sha256:/),
      });
      expect(parsed.data.changedPaths).toEqual([]);

      const applied = await runUpdateCommand({
        options: { yes: true },
        runtime: { cwd: tempRoot, targetProject: "canonical-inventory" },
      });
      const appliedParsed = UpdateCommandResultSchema.parse(applied.result);
      expect(applied.exitCode).toBe(0);
      expect(appliedParsed.data.changedPaths).toContain(
        ".agents/skills/speclite-domain-modeling/SKILL.md",
      );
      expect(appliedParsed.data.changedPaths).toContain("_speclite/_config/files-index.json");
      const migratedManifest = JSON.parse(
        await readFile(path.join(tempRoot, "_speclite/_config/manifest.yaml"), "utf8"),
      ) as {
        sourceDescriptor: { integrityEvidence: Array<{ kind: string; version?: string }> };
      };
      const packageJson = JSON.parse(await readFile(path.join(process.cwd(), "package.json"), "utf8")) as {
        version: string;
      };
      expect(migratedManifest.sourceDescriptor.integrityEvidence).toContainEqual(
        expect.objectContaining({ kind: "version-lock", version: packageJson.version }),
      );
      await expect(readFile(path.join(tempRoot, "_speclite/_config/.update-journal.json"), "utf8")).rejects.toThrow();

      const followUp = await runUpdateCommand({
        runtime: { cwd: tempRoot, targetProject: "canonical-inventory" },
      });
      const followUpParsed = UpdateCommandResultSchema.parse(followUp.result);
      expect(followUp.exitCode).toBe(0);
      expect(followUpParsed.data.updatePlan.actions.some(
        (action) => action.action === "create" || action.action === "update",
      )).toBe(false);

      await writeProjectFile(tempRoot, ".agents/skills/speclite-help/SKILL.en.md", "# excluded locale copy\n");
      const excludedExtra = UpdateCommandResultSchema.parse((await runUpdateCommand({
        runtime: { cwd: tempRoot, targetProject: "canonical-inventory" },
      })).result);
      expect(excludedExtra.data.conflicts).toEqual([]);

      await writeProjectFile(tempRoot, ".agents/skills/speclite-help/references/unindexed.md", "# unknown\n");
      const installableExtra = UpdateCommandResultSchema.parse((await runUpdateCommand({
        runtime: { cwd: tempRoot, targetProject: "canonical-inventory" },
      })).result);
      expect(installableExtra.data.conflicts).toContainEqual(expect.objectContaining({
        affectedPath: ".agents/skills/speclite-help",
        reason: "unknown-ownership",
      }));
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("adds only the unique ecosystem module owner proven by the old skill index", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-update-owner-closure-"));
    try {
      await writeProjectFile(tempRoot, "_speclite/config.toml", "[core]\nproject_name = \"Base\"\n");
      await writeGeneratedInstalledStateBaseline({
        projectRoot: tempRoot,
        installedModules: ["core", "sdlc"],
        targetIds: ["agents"],
        skillEntries: [{
          schemaVersion: "speclite.skill-index.v1",
          canonicalSkillId: "speclite-brownfield-nodejs-backend-tech-stack-digger",
          moduleId: "ecosystem-backend-nodejs",
          sourcePackagePath: "assets/source/speclite/ecosystems/backend/nodejs/speclite-brownfield-nodejs-backend-tech-stack-digger",
          canonicalPackageHash: "sha256:old-package",
          installedTargets: ["agents"],
          phaseIds: ["anytime"],
        }],
      });

      const outcome = await runUpdateCommand({ runtime: { cwd: tempRoot, targetProject: "owner-closure" } });
      const parsed = UpdateCommandResultSchema.parse(outcome.result);
      expect(outcome.exitCode).toBe(0);
      expect(parsed.data.conflicts).toEqual([]);
      expect(parsed.data.updatePlan.actions).toContainEqual(expect.objectContaining({
        affectedPath: ".agents/skills/speclite-brownfield-nodejs-backend-tech-stack-digger/SKILL.md",
        action: "create",
      }));
      const manifestAction = parsed.data.updatePlan.actions.find(
        (action) => action.affectedPath === "_speclite/_config/manifest.yaml",
      );
      expect(manifestAction?.action).toBe("update");
      expect(parsed.data.updatePlan.actions.some(
        (action) => action.affectedPath.includes("speclite-brownfield-python"),
      )).toBe(false);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  const renameIdentities = [
    ["speclite-check-implementation-readiness", "speclite-implementation-readiness-check"],
    ["speclite-ir-grill-consistency-reviewer", "speclite-implementation-readiness-grill-consistency-reviewer"],
  ] as const;

  it.each(
    (["agents", "claude"] as const).flatMap((target) =>
      renameIdentities.map(([oldId, activeId]) => [target, oldId, activeId] as const),
    ),
  )(
    "applies deterministic redirects for %s target and historical ID %s",
    async (target, oldId, activeId) => {
      const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-update-skill-rename-"));
      const oldPath = `.${target}/skills/${oldId}/SKILL.md`;
      try {
        await writeProjectFile(tempRoot, "_speclite/config.toml", "[core]\nproject_name = \"Base\"\n");
        const oldContents = "# historical installed package\n";
        await writeProjectFile(tempRoot, oldPath, oldContents);
        await writeGeneratedInstalledStateBaseline({
          projectRoot: tempRoot,
          installedModules: ["core", "sdlc"],
          targetIds: [target],
          skillEntries: [{
            schemaVersion: "speclite.skill-index.v1",
            canonicalSkillId: oldId,
            moduleId: "sdlc",
            sourcePackagePath: `assets/source/speclite/sdlc-skills/3-solutioning/${oldId}`,
            canonicalPackageHash: await hashPackageDirectory(path.join(tempRoot, path.dirname(oldPath))),
            installedTargets: [target],
            phaseIds: ["solutioning"],
          }],
        });
        const filesIndexPath = path.join(tempRoot, "_speclite/_config/files-index.json");
        const filesIndex = JSON.parse(await readFile(filesIndexPath, "utf8")) as {
          schemaVersion: string;
          entries: Array<Record<string, unknown>>;
        };
        filesIndex.entries.push(await filesIndexEntry(tempRoot, oldPath, oldContents, {
          ownership: "installer-owned",
          sourceRef: `assets/source/speclite/sdlc-skills/3-solutioning/${oldId}/SKILL.md`,
          artifactKind: "ide-skill-package",
        }));
        await writeFile(filesIndexPath, `${JSON.stringify(filesIndex, null, 2)}\n`, "utf8");

        const clean = UpdateCommandResultSchema.parse((await runUpdateCommand({
          options: { yes: true },
          runtime: { cwd: tempRoot, targetProject: "skill-rename-clean" },
        })).result);
        expect(clean.data.conflicts).toEqual([]);
        expect(clean.data.writeAuthorized).toBe(true);
        expect(clean.data.changedPaths).toContain(oldPath);
        expect(clean.data.changedPaths).toContain(`.${target}/skills/${activeId}/SKILL.md`);
        expect(clean.data.updatePlan.actions).toContainEqual(expect.objectContaining({
          affectedPath: oldPath,
          action: "update",
          reason: "canonical-skill-renamed",
          replacementCanonicalSkillId: activeId,
        }));
        const redirect = await readFile(path.join(tempRoot, oldPath), "utf8");
        expect(redirect).toContain(`../${activeId}/SKILL.md`);
        expect(redirect).toContain("only active implementation");
        expect(redirect).not.toContain("historical installed package");
        await expect(readFile(path.join(tempRoot, `.${target}/skills/${activeId}/SKILL.md`), "utf8"))
          .resolves.toContain(`name: ${activeId}`);
        const installedSkillIndex = JSON.parse(
          await readFile(path.join(tempRoot, "_speclite/_config/skill-index.json"), "utf8"),
        ) as { entries: Array<{ canonicalSkillId: string; renamedFromCanonicalSkillIds?: string[] }> };
        expect(installedSkillIndex.entries.some((entry) => entry.canonicalSkillId === oldId)).toBe(false);
        expect(installedSkillIndex.entries).toContainEqual(expect.objectContaining({
          canonicalSkillId: activeId,
          renamedFromCanonicalSkillIds: [oldId],
        }));
        const installedFilesIndex = JSON.parse(await readFile(filesIndexPath, "utf8")) as {
          entries: Array<{ path: string; hash: string }>;
        };
        expect(installedFilesIndex.entries).toContainEqual(expect.objectContaining({
          path: oldPath,
          hash: hashBytes(redirect),
        }));
        const stablePaths = [
          oldPath,
          `.${target}/skills/${activeId}/SKILL.md`,
          "_speclite/_config/skill-index.json",
          "_speclite/_config/files-index.json",
        ];
        const afterFirst = await captureFiles(tempRoot, stablePaths);
        const repeated = UpdateCommandResultSchema.parse((await runUpdateCommand({
          options: { yes: true },
          runtime: { cwd: tempRoot, targetProject: "skill-rename-repeat" },
        })).result);
        expect(repeated.data.changedPaths).toEqual([]);
        expect(repeated.data.conflicts.find((conflict) => conflict.affectedPath === oldPath)).toBeUndefined();
        expect(repeated.data.updatePlan.actions.find((action) => action.affectedPath === oldPath))
          .toEqual(expect.objectContaining({
          affectedPath: oldPath,
          action: "skip",
          reason: "canonical-skill-renamed",
          replacementCanonicalSkillId: activeId,
        }));
        await expectFilesUnchanged(tempRoot, afterFirst);
      } finally {
        await rm(tempRoot, { recursive: true, force: true });
      }
    },
    30_000,
  );

  it("blocks a modified historical package without projecting its replacement", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-update-skill-rename-drift-"));
    const oldId = "speclite-check-implementation-readiness";
    const oldPath = `.agents/skills/${oldId}/SKILL.md`;
    try {
      await writeProjectFile(tempRoot, "_speclite/config.toml", "[core]\nproject_name = \"Base\"\n");
      const indexedContents = "# indexed historical package\n";
      await writeProjectFile(tempRoot, oldPath, indexedContents);
      await writeGeneratedInstalledStateBaseline({
        projectRoot: tempRoot,
        installedModules: ["core", "sdlc"],
        targetIds: ["agents"],
        skillEntries: [{
          schemaVersion: "speclite.skill-index.v1",
          canonicalSkillId: oldId,
          moduleId: "sdlc",
          sourcePackagePath: `assets/source/speclite/sdlc-skills/3-solutioning/${oldId}`,
          canonicalPackageHash: await hashPackageDirectory(path.join(tempRoot, path.dirname(oldPath))),
          installedTargets: ["agents"],
          phaseIds: ["solutioning"],
        }],
      });
      const filesIndexPath = path.join(tempRoot, "_speclite/_config/files-index.json");
      const filesIndex = JSON.parse(await readFile(filesIndexPath, "utf8")) as {
        entries: Array<Record<string, unknown>>;
      };
      filesIndex.entries.push(await filesIndexEntry(tempRoot, oldPath, indexedContents, {
        ownership: "installer-owned",
        sourceRef: `assets/source/speclite/sdlc-skills/3-solutioning/${oldId}/SKILL.md`,
        artifactKind: "ide-skill-package",
      }));
      await writeFile(filesIndexPath, `${JSON.stringify(filesIndex, null, 2)}\n`, "utf8");
      await writeFile(path.join(tempRoot, oldPath), "# user-modified historical package\n", "utf8");

      const drifted = UpdateCommandResultSchema.parse((await runUpdateCommand({
        options: { yes: true },
        runtime: { cwd: tempRoot, targetProject: "skill-rename-drifted" },
      })).result);
      expect(drifted.issues).toEqual(expect.arrayContaining([
        expect.objectContaining({ issueId: "file-integrity.hash-mismatch", affectedPath: oldPath }),
        expect.objectContaining({ issueId: "update.conflicts" }),
      ]));
      expect(drifted.data.conflicts).toContainEqual(expect.objectContaining({
        affectedPath: oldPath,
        reason: "installer-owned-drift",
      }));
      expect(drifted.data.changedPaths).toEqual([]);
      await expect(lstat(path.join(tempRoot, ".agents/skills/speclite-implementation-readiness-check"))).rejects.toThrow();
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("fails all rename preconditions before any operation for content, mode, type and missing races", async () => {
    for (const race of ["content", "mode", "type", "missing"] as const) {
      const tempRoot = await mkdtemp(path.join(os.tmpdir(), `speclite-rename-precondition-${race}-`));
      const oldPath = ".agents/skills/historical/SKILL.md";
      const sentinelPath = ".agents/skills/active/SKILL.md";
      try {
        await writeProjectFile(tempRoot, oldPath, "old\n");
        await writeProjectFile(tempRoot, sentinelPath, "before\n");
        const precondition = {
          absolutePath: path.join(tempRoot, oldPath),
          affectedPath: oldPath,
          hash: hashBytes("old\n"),
          executable: false,
        };
        if (race === "content") await writeFile(precondition.absolutePath, "drift\n", "utf8");
        if (race === "mode") await chmod(precondition.absolutePath, 0o755);
        if (race === "type") {
          await rm(precondition.absolutePath);
          await mkdir(precondition.absolutePath);
        }
        if (race === "missing") await rm(precondition.absolutePath);
        const result = await applyRecoverableUpdateTransaction({
          projectRoot: tempRoot,
          artifactRoot: "_speclite-output",
          operations: [{
            path: sentinelPath,
            contents: "after\n",
            executable: false,
            oldHash: hashBytes("before\n"),
          }],
          preconditions: [precondition],
        });
        expect(result).toEqual(expect.objectContaining({
          ok: false,
          changedPaths: [],
          issue: expect.objectContaining({
            issueId: "file-integrity.recovery-blocked",
            affectedPath: oldPath,
            details: expect.objectContaining({
              reason: race === "missing" ? "precondition-read-failed" : "precondition-changed",
            }),
          }),
        }));
        await expect(readFile(path.join(tempRoot, sentinelPath), "utf8")).resolves.toBe("before\n");
        await expect(readFile(path.join(tempRoot, "_speclite/_config/.update-journal.json"), "utf8")).rejects.toThrow();
      } finally {
        await rm(tempRoot, { recursive: true, force: true });
      }
    }
  });

  it("keeps legacy readiness evidence byte-identical through install, update and repair", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-readiness-legacy-lifecycle-"));
    const legacyRoot = "_speclite-output/2-planning-artifacts/ir-grill";
    const legacyPaths = [
      `${legacyRoot}/summary.md`,
      `${legacyRoot}/goal-execute-records/round-1/PLAN.md`,
      `${legacyRoot}/goal-execute-records/round-1/EXPERIMENTS.md`,
      `${legacyRoot}/goal-execute-records/round-1/EXPERIMENT_NOTES.md`,
    ];
    try {
      for (const legacyPath of legacyPaths) await writeProjectFile(tempRoot, legacyPath, `legacy:${legacyPath}\n`);
      const before = await captureFiles(tempRoot, legacyPaths);
      const beforeTree = await captureTree(tempRoot, legacyRoot);
      const install = await runInstallCommand({
        options: { yes: true, json: true },
        runtime: { ...supportedRuntime, cwd: tempRoot, targetProject: "readiness-legacy-lifecycle" },
      });
      expect(install.exitCode).toBe(0);
      expect(intersectPaths(install.installPlan?.plannedWrites.map((entry) => entry.path) ?? [], legacyPaths)).toEqual([]);
      expect(intersectPaths(install.result.issues.map((issue) => issue.affectedPath), legacyPaths)).toEqual([]);
      await expectFilesUnchanged(tempRoot, before);
      expect(await captureTree(tempRoot, legacyRoot)).toEqual(beforeTree);
      for (const target of ["agents", "claude"] as const) {
        for (const oldId of ["speclite-check-implementation-readiness", "speclite-ir-grill-consistency-reviewer"] as const) {
          await expect(lstat(path.join(tempRoot, `.${target}/skills/${oldId}`))).rejects.toThrow();
        }
      }

      const update = UpdateCommandResultSchema.parse((await runUpdateCommand({
        options: { yes: true },
        runtime: { cwd: tempRoot, targetProject: "readiness-legacy-lifecycle" },
      })).result);
      expect(intersectPaths(update.data.updatePlan.actions.map((entry) => entry.affectedPath), legacyPaths)).toEqual([]);
      expect(intersectPaths(update.data.changedPaths, legacyPaths)).toEqual([]);
      expect(intersectPaths(update.data.conflicts.map((entry) => entry.affectedPath), legacyPaths)).toEqual([]);
      expect(intersectPaths(update.issues.map((issue) => issue.affectedPath), legacyPaths)).toEqual([]);
      await expectFilesUnchanged(tempRoot, before);
      expect(await captureTree(tempRoot, legacyRoot)).toEqual(beforeTree);

      await rm(path.join(tempRoot, ".agents/skills/speclite-implementation-readiness-check/SKILL.md"));
      const repair = RepairCommandResultSchema.parse((await runUpdateCommand({
        options: { repair: true, yes: true },
        runtime: { cwd: tempRoot, targetProject: "readiness-legacy-lifecycle" },
      })).result);
      expect(intersectPaths(repair.data.repairPlan.actions.map((entry) => entry.affectedPath), legacyPaths)).toEqual([]);
      expect(intersectPaths(repair.data.changedPaths, legacyPaths)).toEqual([]);
      expect(intersectPaths(repair.data.conflicts.map((entry) => entry.affectedPath), legacyPaths)).toEqual([]);
      expect(intersectPaths(repair.issues.map((issue) => issue.affectedPath), legacyPaths)).toEqual([]);
      await expectFilesUnchanged(tempRoot, before);
      expect(await captureTree(tempRoot, legacyRoot)).toEqual(beforeTree);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  }, 30_000);

  it("plans unchanged installer-owned files as skips and keeps apply result paths empty without authorization", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-update-unchanged-"));

    try {
      await writeProjectFile(tempRoot, "_speclite/config.toml", "[core]\nproject_name = \"Base\"\n");
      await writeInstalledState(tempRoot, [
        await filesIndexEntry(tempRoot, "_speclite/config.toml", "# config\n", {
          ownership: "installer-owned",
          sourceRef: "installed-state:runtime-config",
        }),
      ]);

      const outcome = await runUpdateCommand({ runtime: { cwd: tempRoot, targetProject: "unchanged" } });
      const parsed = UpdateCommandResultSchema.parse(outcome.result);

      expect(outcome.exitCode).toBe(0);
      expect(parsed.data.updatePlan.actions).toEqual([
        {
          affectedPath: "_speclite/config.toml",
          ownership: "installer-owned",
          action: "skip",
          currentHash: hashBytes("# config\n"),
          expectedHash: hashBytes("# config\n"),
          reason: "unchanged",
        },
      ]);
      expect(parsed.data.changedPaths).toEqual([]);
      expect(parsed.data.skippedPaths).toEqual([]);
      expect(parsed.data.conflicts).toEqual([]);
      expect(parsed.data.writeAuthorized).toBe(false);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("keeps real planned update actions for installer-owned source updates before authorization", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-update-planned-change-"));

    try {
      await writeProjectFile(tempRoot, "_speclite/config.toml", "[core]\nproject_name = \"Base\"\n");
      await writeProjectFile(tempRoot, "canonical/config.toml", "[core]\nproject_name = \"New\"\n");
      await writeInstalledState(tempRoot, [
        await filesIndexEntry(tempRoot, "_speclite/config.toml", "[core]\nproject_name = \"Base\"\n", {
          ownership: "installer-owned",
          sourceRef: "canonical/config.toml",
        }),
      ]);

      const outcome = await runUpdateCommand({ runtime: { cwd: tempRoot, targetProject: "planned" } });
      const parsed = UpdateCommandResultSchema.parse(outcome.result);

      expect(outcome.exitCode).toBe(0);
      expect(parsed.status).toBe("success");
      expect(parsed.data.updatePlan.actions).toEqual([
        {
          affectedPath: "_speclite/config.toml",
          ownership: "installer-owned",
          action: "update",
          currentHash: hashBytes("[core]\nproject_name = \"Base\"\n"),
          expectedHash: hashBytes("[core]\nproject_name = \"New\"\n"),
        },
      ]);
      expect(parsed.data.requiresConfirmation).toBe(true);
      expect(parsed.data.writeAuthorized).toBe(false);
      expect(parsed.data.changedPaths).toEqual([]);
      expect(parsed.data.skippedPaths).toEqual([]);
      expect(parsed.data.conflicts).toEqual([]);
      await expect(readFile(path.join(tempRoot, "_speclite/config.toml"), "utf8")).resolves.toBe(
        "[core]\nproject_name = \"Base\"\n",
      );
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("applies explicit --yes installer-owned planned updates through normal update", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-update-yes-auth-"));

    try {
      await writeProjectFile(tempRoot, "_speclite/config.toml", "[core]\nproject_name = \"Base\"\n");
      await writeProjectFile(tempRoot, "canonical/config.toml", "[core]\nproject_name = \"New\"\n");
      await writeInstalledState(tempRoot, [
        await filesIndexEntry(tempRoot, "_speclite/config.toml", "[core]\nproject_name = \"Base\"\n", {
          ownership: "installer-owned",
          sourceRef: "canonical/config.toml",
        }),
      ]);

      const outcome = await runUpdateCommand({
        options: { yes: true },
        runtime: { cwd: tempRoot, targetProject: "yes-auth" },
      });
      const parsed = UpdateCommandResultSchema.parse(outcome.result);

      expect(outcome.exitCode).toBe(0);
      expect(parsed.data.updatePlan.actions).toEqual([
        expect.objectContaining({
          affectedPath: "_speclite/config.toml",
          action: "update",
        }),
      ]);
      expect(parsed.data.requiresConfirmation).toBe(false);
      expect(parsed.data.writeAuthorized).toBe(true);
      expect(parsed.data.changedPaths).toEqual(["_speclite/_config/files-index.json", "_speclite/config.toml"]);
      expect(parsed.data.skippedPaths).toEqual([]);
      await expect(readFile(path.join(tempRoot, "_speclite/config.toml"), "utf8")).resolves.toBe(
        "[core]\nproject_name = \"New\"\n",
      );

      const filesIndex = JSON.parse(
        await readFile(path.join(tempRoot, "_speclite/_config/files-index.json"), "utf8"),
      ) as { entries: Array<{ path: string; hash: string }> };
      expect(filesIndex.entries.find((entry) => entry.path === "_speclite/config.toml")?.hash).toBe(
        hashBytes("[core]\nproject_name = \"New\"\n"),
      );

      const followUp = await runUpdateCommand({ runtime: { cwd: tempRoot, targetProject: "yes-auth" } });
      const followUpParsed = UpdateCommandResultSchema.parse(followUp.result);
      expect(followUp.exitCode).toBe(0);
      expect(followUpParsed.data.conflicts).toEqual([]);
      expect(followUpParsed.data.updatePlan.actions).toEqual([
        {
          affectedPath: "_speclite/config.toml",
          ownership: "installer-owned",
          action: "skip",
          currentHash: hashBytes("[core]\nproject_name = \"New\"\n"),
          expectedHash: hashBytes("[core]\nproject_name = \"New\"\n"),
          reason: "unchanged",
        },
      ]);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("blocks write planning for a blocked source descriptor before exposing updatePlan payload", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-update-blocked-source-"));

    try {
      await writeProjectFile(tempRoot, "_speclite/config.toml", "[core]\nproject_name = \"Base\"\n");
      await writeProjectFile(tempRoot, "canonical/config.toml", "[core]\nproject_name = \"New\"\n");
      await writeInstalledState(
        tempRoot,
        [
          await filesIndexEntry(tempRoot, "_speclite/config.toml", "[core]\nproject_name = \"Base\"\n", {
            ownership: "installer-owned",
            sourceRef: "canonical/config.toml",
          }),
        ],
        {
          sourceDescriptor: [
            "sourceDescriptor:",
            "  sourceType: git",
            "  channel: main",
            "  resolvedRoot: refs/heads/main",
            "  trustStatus: blocked",
            "  integrityEvidence: []",
          ].join("\n"),
        },
      );

      const outcome = await runUpdateCommand({ runtime: { cwd: tempRoot, targetProject: "blocked" } });
      const parsed = UpdateCommandResultSchema.parse(outcome.result);

      expect(outcome.exitCode).toBe(1);
      expect(parsed.status).toBe("failure");
      expect(parsed.issues).toEqual([
        expect.objectContaining({
          issueId: "source-integrity.blocked-source",
          severity: "error",
          affectedPath: "_speclite/_config/manifest.yaml",
        }),
      ]);
      expect(parsed.data).toMatchObject({
        updatePlan: { actions: [] },
        changedPaths: [],
        skippedPaths: [],
        conflicts: [],
        requiresConfirmation: false,
        writeAuthorized: false,
      });
      await expect(readFile(path.join(tempRoot, "_speclite/config.toml"), "utf8")).resolves.toBe(
        "[core]\nproject_name = \"Base\"\n",
      );
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("blocks write planning when the manifest is missing sourceDescriptor metadata", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-update-missing-source-descriptor-"));

    try {
      await writeProjectFile(tempRoot, "_speclite/config.toml", "[core]\nproject_name = \"Base\"\n");
      await writeProjectFile(tempRoot, "canonical/config.toml", "[core]\nproject_name = \"New\"\n");
      await writeInstalledState(
        tempRoot,
        [
          await filesIndexEntry(tempRoot, "_speclite/config.toml", "[core]\nproject_name = \"Base\"\n", {
            ownership: "installer-owned",
            sourceRef: "canonical/config.toml",
          }),
        ],
        { sourceDescriptor: "" },
      );

      const outcome = await runUpdateCommand({
        options: { yes: true },
        runtime: { cwd: tempRoot, targetProject: "missing-source-descriptor" },
      });
      const parsed = UpdateCommandResultSchema.parse(outcome.result);

      expect(outcome.exitCode).toBe(1);
      expect(parsed.status).toBe("failure");
      expect(parsed.issues).toEqual([
        expect.objectContaining({
          issueId: "source-integrity.missing-source-descriptor",
          severity: "error",
          affectedPath: "_speclite/_config/manifest.yaml",
        }),
      ]);
      expect(parsed.data).toMatchObject({
        updatePlan: { actions: [] },
        changedPaths: [],
        skippedPaths: [],
        conflicts: [],
        requiresConfirmation: false,
        writeAuthorized: false,
      });
      await expect(readFile(path.join(tempRoot, "_speclite/config.toml"), "utf8")).resolves.toBe(
        "[core]\nproject_name = \"Base\"\n",
      );
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("blocks write planning when the manifest file is missing", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-update-missing-manifest-"));

    try {
      await writeProjectFile(tempRoot, "_speclite/config.toml", "[core]\nproject_name = \"Base\"\n");
      await writeProjectFile(tempRoot, "canonical/config.toml", "[core]\nproject_name = \"New\"\n");
      const entry = await filesIndexEntry(tempRoot, "_speclite/config.toml", "[core]\nproject_name = \"Base\"\n", {
        ownership: "installer-owned",
        sourceRef: "canonical/config.toml",
      });
      await writeProjectFile(
        tempRoot,
        "_speclite/_config/files-index.json",
        `${JSON.stringify({ schemaVersion: "speclite.files-index.v1", entries: [entry] }, null, 2)}\n`,
      );

      const outcome = await runUpdateCommand({
        options: { yes: true },
        runtime: { cwd: tempRoot, targetProject: "missing-manifest" },
      });
      const parsed = UpdateCommandResultSchema.parse(outcome.result);

      expect(outcome.exitCode).toBe(1);
      expect(parsed.status).toBe("failure");
      expect(parsed.issues).toEqual([
        expect.objectContaining({
          issueId: "source-integrity.missing-source-descriptor",
          severity: "error",
          affectedPath: "_speclite/_config/manifest.yaml",
        }),
      ]);
      expect(parsed.data).toMatchObject({
        updatePlan: { actions: [] },
        changedPaths: [],
        skippedPaths: [],
        conflicts: [],
        requiresConfirmation: false,
        writeAuthorized: false,
      });
      await expect(readFile(path.join(tempRoot, "_speclite/config.toml"), "utf8")).resolves.toBe(
        "[core]\nproject_name = \"Base\"\n",
      );
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("blocks write planning when the manifest YAML cannot be parsed", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-update-unreadable-manifest-"));

    try {
      await writeProjectFile(tempRoot, "_speclite/config.toml", "[core]\nproject_name = \"Base\"\n");
      await writeProjectFile(tempRoot, "canonical/config.toml", "[core]\nproject_name = \"New\"\n");
      await writeInstalledState(
        tempRoot,
        [
          await filesIndexEntry(tempRoot, "_speclite/config.toml", "[core]\nproject_name = \"Base\"\n", {
            ownership: "installer-owned",
            sourceRef: "canonical/config.toml",
          }),
        ],
        { sourceDescriptor: "" },
      );
      await writeFile(path.join(tempRoot, "_speclite/_config/manifest.yaml"), "paths:\n  artifactRoot: [\n", "utf8");

      const outcome = await runUpdateCommand({
        options: { yes: true },
        runtime: { cwd: tempRoot, targetProject: "unreadable-manifest" },
      });
      const parsed = UpdateCommandResultSchema.parse(outcome.result);

      expect(outcome.exitCode).toBe(1);
      expect(parsed.status).toBe("failure");
      expect(parsed.issues).toEqual([
        expect.objectContaining({
          issueId: "source-integrity.missing-source-descriptor",
          severity: "error",
          affectedPath: "_speclite/_config/manifest.yaml",
        }),
      ]);
      expect(parsed.data).toMatchObject({
        updatePlan: { actions: [] },
        changedPaths: [],
        skippedPaths: [],
        conflicts: [],
        requiresConfirmation: false,
        writeAuthorized: false,
      });
      await expect(readFile(path.join(tempRoot, "_speclite/config.toml"), "utf8")).resolves.toBe(
        "[core]\nproject_name = \"Base\"\n",
      );
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("blocks write planning when sourceDescriptor metadata is malformed", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-update-malformed-source-descriptor-"));

    try {
      await writeProjectFile(tempRoot, "_speclite/config.toml", "[core]\nproject_name = \"Base\"\n");
      await writeProjectFile(tempRoot, "canonical/config.toml", "[core]\nproject_name = \"New\"\n");
      await writeInstalledState(
        tempRoot,
        [
          await filesIndexEntry(tempRoot, "_speclite/config.toml", "[core]\nproject_name = \"Base\"\n", {
            ownership: "installer-owned",
            sourceRef: "canonical/config.toml",
          }),
        ],
        {
          sourceDescriptor: [
            "sourceDescriptor:",
            "  sourceType: git",
            "  trustStatus: trusted",
            "  integrityEvidence:",
            "    - kind: git-commit",
            "      verified: true",
          ].join("\n"),
        },
      );

      const outcome = await runUpdateCommand({
        options: { yes: true },
        runtime: { cwd: tempRoot, targetProject: "malformed-source-descriptor" },
      });
      const parsed = UpdateCommandResultSchema.parse(outcome.result);

      expect(outcome.exitCode).toBe(1);
      expect(parsed.status).toBe("failure");
      expect(parsed.issues).toEqual([
        expect.objectContaining({
          issueId: "source-integrity.malformed-source-descriptor",
          severity: "error",
          affectedPath: "_speclite/_config/manifest.yaml",
        }),
      ]);
      expect(parsed.data).toMatchObject({
        updatePlan: { actions: [] },
        changedPaths: [],
        skippedPaths: [],
        conflicts: [],
        requiresConfirmation: false,
        writeAuthorized: false,
      });
      await expect(readFile(path.join(tempRoot, "_speclite/config.toml"), "utf8")).resolves.toBe(
        "[core]\nproject_name = \"Base\"\n",
      );
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("projects installer drift and unknown ownership as conflicts while protecting human/workflow paths as skips", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-update-conflicts-"));

    try {
      await writeProjectFile(tempRoot, "_speclite/config.toml", "[core]\nproject_name = \"Base\"\n");
      await writeInstalledState(tempRoot, [
        await filesIndexEntry(tempRoot, "_speclite/config.toml", "# expected\n", {
          ownership: "installer-owned",
          sourceRef: "canonical/config.toml",
        }),
        await filesIndexEntry(tempRoot, "README.md", "# expected readme\n", {
          ownership: "installer-owned",
          sourceRef: "canonical/README.md",
        }),
        await filesIndexEntry(tempRoot, "_speclite/custom/config.toml", "# human\n", {
          ownership: "human-owned",
          sourceRef: "local:human-custom",
        }),
        await filesIndexEntry(tempRoot, "_speclite-output/review.md", "# workflow\n", {
          ownership: "workflow-owned",
          sourceRef: "local:workflow-artifact",
        }),
      ]);
      await mkdir(path.join(tempRoot, "canonical"), { recursive: true });
      await writeFile(path.join(tempRoot, "canonical/config.toml"), "# expected\n", "utf8");
      await writeFile(path.join(tempRoot, "README.md"), "# expected readme\n", "utf8");
      await writeFile(path.join(tempRoot, "_speclite/config.toml"), "# drift\n", "utf8");

      const outcome = await runUpdateCommand({ runtime: { cwd: tempRoot, targetProject: "conflicts" } });
      const parsed = UpdateCommandResultSchema.parse(outcome.result);
      const human = renderUpdateHumanOutput(parsed);

      expect(outcome.exitCode).toBe(1);
      expect(parsed.issues).toEqual([
        expect.objectContaining({
          issueId: "update.conflicts",
          details: {
            conflictCount: 2,
            completedSteps: ["installed-state-read", "update-plan"],
            failedStep: "conflict-check",
            pendingSteps: ["resolve-conflicts"],
            manualAction:
              "Resolve the reported update conflicts, then rerun speclite update before authorizing writes.",
          },
        }),
      ]);
      expect(parsed.data.conflicts).toEqual([
        expect.objectContaining({
          affectedPath: "README.md",
          ownership: "unknown",
          reason: "unknown-ownership",
        }),
        expect.objectContaining({
          affectedPath: "_speclite/config.toml",
          ownership: "installer-owned",
          reason: "installer-owned-drift",
        }),
      ]);
      expect(parsed.data.updatePlan.actions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            affectedPath: "_speclite/custom/config.toml",
            ownership: "human-owned",
            action: "skip",
            reason: "human-owned",
          }),
          expect.objectContaining({
            affectedPath: "_speclite-output/review.md",
            ownership: "workflow-owned",
            action: "skip",
            reason: "workflow-owned",
          }),
        ]),
      );
      expect(parsed.data.updatePlan.actions).not.toContainEqual(
        expect.objectContaining({
          affectedPath: "README.md",
          ownership: "installer-owned",
          action: "conflict",
        }),
      );
      expect(parsed.data.changedPaths).toEqual([]);
      expect(parsed.data.skippedPaths).toEqual([]);
      expect(parsed.data.completedSteps).toEqual(["installed-state-read", "update-plan"]);
      expect(parsed.data.failedStep).toBe("conflict-check");
      expect(parsed.data.pendingSteps).toEqual(["resolve-conflicts"]);
      expect(human).toContain("conflicts");
      expect(human).toContain("step 状态");
      expect(human).toContain("失败 step：conflict-check");
      expect(human).toContain("_speclite/custom/config.toml");
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("treats missing project-relative source evidence as a planning conflict", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-update-missing-source-evidence-"));

    try {
      await writeProjectFile(tempRoot, "_speclite/config.toml", "[core]\nproject_name = \"Base\"\n");
      await writeInstalledState(tempRoot, [
        await filesIndexEntry(tempRoot, "_speclite/config.toml", "[core]\nproject_name = \"Base\"\n", {
          ownership: "installer-owned",
          sourceRef: "canonical/config.toml",
        }),
      ]);

      const outcome = await runUpdateCommand({ runtime: { cwd: tempRoot, targetProject: "missing-source" } });
      const parsed = UpdateCommandResultSchema.parse(outcome.result);

      expect(outcome.exitCode).toBe(1);
      expect(parsed.issues).toEqual([
        expect.objectContaining({
          issueId: "update.conflicts",
          details: expect.objectContaining({ conflictCount: 1 }),
        }),
      ]);
      expect(parsed.data.conflicts).toEqual([
        expect.objectContaining({
          affectedPath: "_speclite/config.toml",
          ownership: "installer-owned",
          reason: "missing-source-evidence",
        }),
      ]);
      expect(parsed.data.changedPaths).toEqual([]);
      expect(parsed.data.skippedPaths).toEqual([]);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("reports IDE mirror hash mismatch and duplicate target entries as update conflicts", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-update-ide-mirror-drift-"));

    try {
      await writeProjectFile(tempRoot, "_speclite/config.toml", "[core]\nproject_name = \"Base\"\n");
      await writeProjectFile(tempRoot, ".claude/skills/speclite-help/SKILL.md", "# Help\n");
      await writeProjectFile(tempRoot, ".agents/skills/speclite-help/SKILL.md", "# Help\n");
      const canonicalPackageHash = await hashPackageDirectory(
        path.join(tempRoot, ".claude/skills/speclite-help"),
      );
      await writeInstalledState(tempRoot, []);
      await writeSkillIndex(tempRoot, [
        skillIndexEntry({
          canonicalSkillId: "speclite-help",
          canonicalPackageHash,
          installedTargets: ["claude", "agents"],
        }),
      ]);

      await writeProjectFile(tempRoot, ".claude/skills/speclite-help/SKILL.md", "# Drift\n");
      await writeProjectFile(tempRoot, ".agents/skills/speclite-help-copy/SKILL.md", "# Help\n");

      const outcome = await runUpdateCommand({ runtime: { cwd: tempRoot, targetProject: "ide-drift" } });
      const parsed = UpdateCommandResultSchema.parse(outcome.result);

      expect(outcome.exitCode).toBe(1);
      expect(parsed.issues).toEqual([
        expect.objectContaining({
          issueId: "update.conflicts",
          details: expect.objectContaining({ conflictCount: 2 }),
        }),
      ]);
      expect(parsed.data.conflicts).toEqual([
        expect.objectContaining({
          affectedPath: ".agents/skills/speclite-help-copy",
          ownership: "installer-owned",
          reason: "installer-owned-drift",
          currentHash: canonicalPackageHash,
          expectedHash: canonicalPackageHash,
        }),
        expect.objectContaining({
          affectedPath: ".claude/skills/speclite-help",
          ownership: "installer-owned",
          reason: "installer-owned-drift",
          expectedHash: canonicalPackageHash,
        }),
      ]);
      expect(parsed.data.updatePlan.actions).toEqual([]);
      expect(parsed.data.changedPaths).toEqual([]);
      expect(parsed.data.skippedPaths).toEqual([]);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("reports missing IDE mirror target entries as update conflicts without restoring content", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-update-ide-mirror-missing-"));

    try {
      await writeProjectFile(tempRoot, "_speclite/config.toml", "[core]\nproject_name = \"Base\"\n");
      await writeProjectFile(tempRoot, ".claude/skills/speclite-help/SKILL.md", "# Help\n");
      const canonicalPackageHash = await hashPackageDirectory(
        path.join(tempRoot, ".claude/skills/speclite-help"),
      );
      await writeInstalledState(tempRoot, []);
      await writeSkillIndex(tempRoot, [
        skillIndexEntry({
          canonicalSkillId: "speclite-help",
          canonicalPackageHash,
          installedTargets: ["claude", "agents"],
        }),
      ]);

      const outcome = await runUpdateCommand({ runtime: { cwd: tempRoot, targetProject: "ide-missing" } });
      const parsed = UpdateCommandResultSchema.parse(outcome.result);

      expect(outcome.exitCode).toBe(1);
      expect(parsed.data.conflicts).toEqual([
        expect.objectContaining({
          affectedPath: ".agents/skills/speclite-help",
          ownership: "installer-owned",
          reason: "installer-owned-drift",
          expectedHash: canonicalPackageHash,
        }),
      ]);
      await expect(readFile(path.join(tempRoot, ".agents/skills/speclite-help/SKILL.md"), "utf8")).rejects.toThrow();
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("plans repairable installer-owned drift from canonical source without writing before authorization", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-repair-plan-source-"));

    try {
      await writeProjectFile(tempRoot, "_speclite/config.toml", "[core]\nproject_name = \"Drift\"\n");
      await writeProjectFile(tempRoot, "canonical/config.toml", "[core]\nproject_name = \"Canonical\"\n");
      await writeInstalledState(tempRoot, [
        await filesIndexEntry(tempRoot, "_speclite/config.toml", "[core]\nproject_name = \"Base\"\n", {
          ownership: "installer-owned",
          sourceRef: "canonical/config.toml",
        }),
      ]);
      await writeProjectFile(tempRoot, "_speclite/config.toml", "[core]\nproject_name = \"Drift\"\n");

      const outcome = await runUpdateCommand({
        options: { repair: true },
        runtime: { cwd: tempRoot, targetProject: "repair-source" },
      });
      const parsed = RepairCommandResultSchema.parse(outcome.result);

      expect(outcome.exitCode).toBe(0);
      expect(parsed.command).toBe("update.repair");
      expect(parsed.data.repairPlan.actions).toEqual([
        {
          affectedPath: "_speclite/config.toml",
          ownership: "installer-owned",
          action: "regenerate",
          currentHash: hashBytes("[core]\nproject_name = \"Drift\"\n"),
          expectedHash: hashBytes("[core]\nproject_name = \"Canonical\"\n"),
        },
      ]);
      expect(parsed.data.requiresConfirmation).toBe(true);
      expect(parsed.data.writeAuthorized).toBe(false);
      expect(parsed.data.changedPaths).toEqual([]);
      expect(parsed.data.skippedPaths).toEqual([]);
      expect(parsed.data.conflicts).toEqual([]);
      await expect(readFile(path.join(tempRoot, "_speclite/config.toml"), "utf8")).resolves.toBe(
        "[core]\nproject_name = \"Drift\"\n",
      );
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("skips protected repair candidates and keeps only source-unsafe candidates as conflicts", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-repair-protected-conflicts-"));

    try {
      await writeProjectFile(tempRoot, "_speclite/config.toml", "[core]\nproject_name = \"Base\"\n");
      await writeInstalledState(tempRoot, [
        await filesIndexEntry(tempRoot, "_speclite/config.toml", "[core]\nproject_name = \"Base\"\n", {
          ownership: "installer-owned",
          sourceRef: "canonical/missing-config.toml",
        }),
        await filesIndexEntry(tempRoot, "_speclite/custom/config.toml", "# human\n", {
          ownership: "human-owned",
          sourceRef: "local:human-custom",
        }),
        await filesIndexEntry(tempRoot, "_speclite-output/report.md", "# workflow\n", {
          ownership: "workflow-owned",
          sourceRef: "local:workflow-artifact",
        }),
        await filesIndexEntry(tempRoot, "README.md", "# readme\n", {
          ownership: "installer-owned",
          sourceRef: "local:unsupported",
        }),
      ]);
      await writeProjectFile(tempRoot, "_speclite/config.toml", "[core]\nproject_name = \"Drift\"\n");

      const outcome = await runUpdateCommand({
        options: { repair: true },
        runtime: { cwd: tempRoot, targetProject: "repair-conflicts" },
      });
      const parsed = RepairCommandResultSchema.parse(outcome.result);

      expect(outcome.exitCode).toBe(1);
      expect(parsed.data.repairPlan.actions).toEqual([
        expect.objectContaining({
          affectedPath: "_speclite-output/report.md",
          ownership: "workflow-owned",
          action: "skip",
          reason: "workflow-owned",
        }),
        expect.objectContaining({
          affectedPath: "_speclite/custom/config.toml",
          ownership: "human-owned",
          action: "skip",
          reason: "human-owned",
        }),
      ]);
      expect(parsed.issues).toEqual([
        expect.objectContaining({
          issueId: "update.conflicts",
          details: { conflictCount: 2 },
        }),
      ]);
      expect(parsed.data.conflicts).toEqual([
        expect.objectContaining({
          affectedPath: "README.md",
          ownership: "unknown",
          reason: "unknown-ownership",
        }),
        expect.objectContaining({
          affectedPath: "_speclite/config.toml",
          ownership: "installer-owned",
          reason: "missing-source-evidence",
        }),
      ]);
      await expect(readFile(path.join(tempRoot, "_speclite/config.toml"), "utf8")).resolves.toBe(
        "[core]\nproject_name = \"Drift\"\n",
      );
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("applies authorized repair actions through safe write and records actual changed paths", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-repair-apply-"));

    try {
      await writeProjectFile(tempRoot, "_speclite/config.toml", "[core]\nproject_name = \"Drift\"\n");
      await writeProjectFile(tempRoot, "canonical/config.toml", "[core]\nproject_name = \"Canonical\"\n");
      await writeInstalledState(tempRoot, [
        await filesIndexEntry(tempRoot, "_speclite/config.toml", "[core]\nproject_name = \"Base\"\n", {
          ownership: "installer-owned",
          sourceRef: "canonical/config.toml",
        }),
      ]);
      await writeProjectFile(tempRoot, "_speclite/config.toml", "[core]\nproject_name = \"Drift\"\n");

      const outcome = await runUpdateCommand({
        options: { repair: true, yes: true },
        runtime: { cwd: tempRoot, targetProject: "repair-apply" },
      });
      const parsed = RepairCommandResultSchema.parse(outcome.result);

      expect(outcome.exitCode).toBe(0);
      expect(parsed.status).toBe("success");
      expect(parsed.data.writeAuthorized).toBe(true);
      expect(parsed.data.changedPaths).toEqual(["_speclite/config.toml"]);
      expect(parsed.data.skippedPaths).toEqual([]);
      await expect(readFile(path.join(tempRoot, "_speclite/config.toml"), "utf8")).resolves.toBe(
        "[core]\nproject_name = \"Canonical\"\n",
      );
      await expect(readFile(path.join(tempRoot, "_speclite/.lock"), "utf8")).rejects.toThrow();
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("repairs deleted and drifted fresh install runtime compatibility scripts from bundled package source", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-repair-compat-scripts-"));

    try {
      const configResolver = await readFile(
        path.join(process.cwd(), "assets/source/speclite/scripts/resolve_config.py"),
        "utf8",
      );
      const customizationResolver = await readFile(
        path.join(process.cwd(), "assets/source/speclite/scripts/resolve_customization.py"),
        "utf8",
      );
      await writeProjectFile(tempRoot, "_speclite/config.toml", "[core]\nproject_name = \"Base\"\n");
      await writeInstalledState(tempRoot, [
        await filesIndexEntry(tempRoot, "_speclite/scripts/resolve_config.py", configResolver, {
          ownership: "installer-owned",
          artifactKind: "runtime-compat-script",
          executable: true,
          sourceRef: "assets/source/speclite/scripts/resolve_config.py",
        }),
        await filesIndexEntry(tempRoot, "_speclite/scripts/resolve_customization.py", customizationResolver, {
          ownership: "installer-owned",
          artifactKind: "runtime-compat-script",
          executable: true,
          sourceRef: "assets/source/speclite/scripts/resolve_customization.py",
        }),
      ]);
      await rm(path.join(tempRoot, "_speclite/scripts/resolve_config.py"), { force: true });
      await writeProjectFile(tempRoot, "_speclite/scripts/resolve_customization.py", "# drift\n");

      const outcome = await runUpdateCommand({
        options: { repair: true, yes: true },
        runtime: { cwd: tempRoot, targetProject: "repair-compat-scripts" },
      });
      const parsed = RepairCommandResultSchema.parse(outcome.result);

      expect(outcome.exitCode).toBe(0);
      expect(parsed.status).toBe("success");
      expect(parsed.data.writeAuthorized).toBe(true);
      expect(parsed.data.conflicts).toEqual([]);
      expect(parsed.data.changedPaths).toEqual([
        "_speclite/scripts/resolve_config.py",
        "_speclite/scripts/resolve_customization.py",
      ]);
      await expect(readFile(path.join(tempRoot, "_speclite/scripts/resolve_config.py"), "utf8")).resolves.toBe(
        configResolver,
      );
      await expect(
        readFile(path.join(tempRoot, "_speclite/scripts/resolve_customization.py"), "utf8"),
      ).resolves.toBe(customizationResolver);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("repairs bundled-runtime-compat resolver sourceRefs from bundled package source", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-repair-compat-fallback-"));

    try {
      const configResolver = await readFile(
        path.join(process.cwd(), "assets/source/speclite/scripts/resolve_config.py"),
        "utf8",
      );
      const customizationResolver = await readFile(
        path.join(process.cwd(), "assets/source/speclite/scripts/resolve_customization.py"),
        "utf8",
      );
      await writeProjectFile(tempRoot, "_speclite/config.toml", "[core]\nproject_name = \"Base\"\n");
      await writeInstalledState(tempRoot, [
        await filesIndexEntry(tempRoot, "_speclite/scripts/resolve_config.py", configResolver, {
          ownership: "installer-owned",
          artifactKind: "runtime-compat-script",
          executable: true,
          sourceRef: "bundled-runtime-compat:scripts/resolve_config.py",
        }),
        await filesIndexEntry(tempRoot, "_speclite/scripts/resolve_customization.py", customizationResolver, {
          ownership: "installer-owned",
          artifactKind: "runtime-compat-script",
          executable: true,
          sourceRef: "bundled-runtime-compat:scripts/resolve_customization.py",
        }),
      ]);
      await writeProjectFile(tempRoot, "_speclite/scripts/resolve_config.py", "# drift config\n");
      await rm(path.join(tempRoot, "_speclite/scripts/resolve_customization.py"), { force: true });

      const outcome = await runUpdateCommand({
        options: { repair: true, yes: true },
        runtime: { cwd: tempRoot, targetProject: "repair-compat-fallback" },
      });
      const parsed = RepairCommandResultSchema.parse(outcome.result);

      expect(outcome.exitCode).toBe(0);
      expect(parsed.status).toBe("success");
      expect(parsed.data.conflicts).toEqual([]);
      expect(parsed.data.changedPaths).toEqual([
        "_speclite/scripts/resolve_config.py",
        "_speclite/scripts/resolve_customization.py",
      ]);
      await expect(readFile(path.join(tempRoot, "_speclite/scripts/resolve_config.py"), "utf8")).resolves.toBe(
        configResolver,
      );
      await expect(
        readFile(path.join(tempRoot, "_speclite/scripts/resolve_customization.py"), "utf8"),
      ).resolves.toBe(customizationResolver);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("keeps non-resolver runtime compatibility script targets blocked even with resolver sourceRefs", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-repair-compat-blocked-target-"));

    try {
      await writeProjectFile(tempRoot, "_speclite/config.toml", "[core]\nproject_name = \"Base\"\n");
      await writeInstalledState(tempRoot, [
        await filesIndexEntry(tempRoot, "_speclite/scripts/not_a_resolver.py", "# base\n", {
          ownership: "installer-owned",
          artifactKind: "runtime-compat-script",
          executable: true,
          sourceRef: "bundled-runtime-compat:scripts/resolve_config.py",
        }),
      ]);
      await writeProjectFile(tempRoot, "_speclite/scripts/not_a_resolver.py", "# drift\n");

      const outcome = await runUpdateCommand({
        options: { repair: true, yes: true },
        runtime: { cwd: tempRoot, targetProject: "repair-compat-blocked-target" },
      });
      const parsed = RepairCommandResultSchema.parse(outcome.result);

      expect(outcome.exitCode).toBe(1);
      expect(parsed.data.writeAuthorized).toBe(false);
      expect(parsed.data.repairPlan.actions).toEqual([]);
      expect(parsed.data.conflicts).toEqual([
        expect.objectContaining({
          affectedPath: "_speclite/scripts/not_a_resolver.py",
          ownership: "installer-owned",
          reason: "missing-source-evidence",
        }),
      ]);
      expect(parsed.data.changedPaths).toEqual([]);
      await expect(readFile(path.join(tempRoot, "_speclite/scripts/not_a_resolver.py"), "utf8")).resolves.toBe(
        "# drift\n",
      );
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("repairs recoverable IDE mirror package drift from canonical source in adapter order", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-repair-ide-mirror-"));

    try {
      await writeProjectFile(tempRoot, "_speclite/config.toml", "[core]\nproject_name = \"Base\"\n");
      await writeProjectFile(tempRoot, "assets/source/speclite/core-skills/speclite-help/SKILL.md", "# Help\n");
      await writeProjectFile(
        tempRoot,
        "assets/source/speclite/core-skills/speclite-help/data/project-types.csv",
        "id,label\nsoftware,Software\n",
      );
      const canonicalPackageHash = await hashPackageDirectory(
        path.join(tempRoot, "assets/source/speclite/core-skills/speclite-help"),
      );
      await writeInstalledState(tempRoot, [], { sourceDescriptor: localSourceDescriptor() });
      await writeSkillIndex(tempRoot, [
        skillIndexEntry({
          canonicalSkillId: "speclite-help",
          canonicalPackageHash,
          installedTargets: ["claude", "agents"],
        }),
      ]);
      await writeProjectFile(tempRoot, ".claude/skills/speclite-help/SKILL.md", "# Drift\n");
      const driftPackageHash = await hashPackageDirectory(
        path.join(tempRoot, ".claude/skills/speclite-help"),
      );

      const planOutcome = await runUpdateCommand({
        options: { repair: true },
        runtime: { cwd: tempRoot, targetProject: "repair-ide-plan" },
      });
      const planParsed = RepairCommandResultSchema.parse(planOutcome.result);

      expect(planParsed.data.repairPlan.actions).toEqual([
        {
          affectedPath: ".agents/skills/speclite-help",
          ownership: "installer-owned",
          expectedHash: canonicalPackageHash,
          action: "restore-canonical",
        },
        {
          affectedPath: ".claude/skills/speclite-help",
          ownership: "installer-owned",
          currentHash: driftPackageHash,
          expectedHash: canonicalPackageHash,
          action: "restore-canonical",
        },
      ]);
      expect(planParsed.data.conflicts).toEqual([]);
      await expect(readFile(path.join(tempRoot, ".agents/skills/speclite-help/SKILL.md"), "utf8")).rejects.toThrow();

      const applyOutcome = await runUpdateCommand({
        options: { repair: true, yes: true },
        runtime: { cwd: tempRoot, targetProject: "repair-ide-apply" },
      });
      const applyParsed = RepairCommandResultSchema.parse(applyOutcome.result);

      expect(applyOutcome.exitCode).toBe(0);
      expect(applyParsed.data.changedPaths).toEqual([
        ".agents/skills/speclite-help/SKILL.md",
        ".agents/skills/speclite-help/data/project-types.csv",
        ".claude/skills/speclite-help/SKILL.md",
        ".claude/skills/speclite-help/data/project-types.csv",
      ]);
      await expect(
        readFile(path.join(tempRoot, ".agents/skills/speclite-help/data/project-types.csv"), "utf8"),
      ).resolves.toBe("id,label\nsoftware,Software\n");
      await expect(readFile(path.join(tempRoot, ".agents/skills/speclite-help/SKILL.md"), "utf8")).resolves.toBe(
        "# Help\n",
      );
      await expect(
        readFile(path.join(tempRoot, ".claude/skills/speclite-help/data/project-types.csv"), "utf8"),
      ).resolves.toBe("id,label\nsoftware,Software\n");
      await expect(readFile(path.join(tempRoot, ".claude/skills/speclite-help/SKILL.md"), "utf8")).resolves.toBe(
        "# Help\n",
      );
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("removes extra canonical-hash files when restoring an IDE mirror package", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-repair-ide-extra-"));

    try {
      await writeProjectFile(tempRoot, "_speclite/config.toml", "[core]\nproject_name = \"Base\"\n");
      await writeProjectFile(tempRoot, "assets/source/speclite/core-skills/speclite-help/SKILL.md", "# Help\n");
      await writeProjectFile(
        tempRoot,
        "assets/source/speclite/core-skills/speclite-help/references/usage.md",
        "# Usage\n",
      );
      const canonicalPackageHash = await hashPackageDirectory(
        path.join(tempRoot, "assets/source/speclite/core-skills/speclite-help"),
      );
      await writeInstalledState(tempRoot, [], { sourceDescriptor: localSourceDescriptor() });
      await writeSkillIndex(tempRoot, [
        skillIndexEntry({
          canonicalSkillId: "speclite-help",
          canonicalPackageHash,
          installedTargets: ["agents"],
        }),
      ]);
      await writeProjectFile(tempRoot, ".agents/skills/speclite-help/SKILL.md", "# Help\n");
      await writeProjectFile(tempRoot, ".agents/skills/speclite-help/references/usage.md", "# Usage\n");
      await writeProjectFile(tempRoot, ".agents/skills/speclite-help/references/obsolete.md", "# Obsolete\n");

      const applyOutcome = await runUpdateCommand({
        options: { repair: true, yes: true },
        runtime: { cwd: tempRoot, targetProject: "repair-ide-extra" },
      });
      const applyParsed = RepairCommandResultSchema.parse(applyOutcome.result);

      expect(applyOutcome.exitCode).toBe(0);
      expect(applyParsed.status).toBe("success");
      expect(applyParsed.data.changedPaths).toEqual([
        ".agents/skills/speclite-help/SKILL.md",
        ".agents/skills/speclite-help/references/obsolete.md",
        ".agents/skills/speclite-help/references/usage.md",
      ]);
      await expect(
        readFile(path.join(tempRoot, ".agents/skills/speclite-help/references/obsolete.md"), "utf8"),
      ).rejects.toThrow();
      await expect(
        hashPackageDirectory(path.join(tempRoot, ".agents/skills/speclite-help")),
      ).resolves.toBe(canonicalPackageHash);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });
});

describe("recoverable update transaction", () => {
  it("rejects malformed and duplicate journal operation contracts before writing", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-update-transaction-contract-"));
    try {
      await writeProjectFile(tempRoot, "_speclite/hooks/a/runner.mjs", "old\n");
      await writeProjectFile(tempRoot, "_speclite/_config/.update-journal.json", `${JSON.stringify({
        schemaVersion: "speclite.update-journal.v1",
        planId: `sha256:${"0".repeat(64)}`,
        completedPaths: [],
        operations: [null],
      })}\n`);
      const malformed = await applyRecoverableUpdateTransaction({
        projectRoot: tempRoot,
        artifactRoot: "_speclite-output",
        operations: [{
          path: "_speclite/hooks/a/runner.mjs",
          contents: "new\n",
          executable: false,
          oldHash: hashBytes("old\n"),
        }],
      });
      expect(malformed).toEqual(expect.objectContaining({ ok: false }));
      if (!malformed.ok) expect(malformed.issue.details).toEqual(expect.objectContaining({ reason: "malformed-journal" }));

      await rm(path.join(tempRoot, "_speclite/_config/.update-journal.json"));
      const duplicate = await applyRecoverableUpdateTransaction({
        projectRoot: tempRoot,
        artifactRoot: "_speclite-output",
        operations: [0, 1].map(() => ({
          path: "_speclite/hooks/a/runner.mjs",
          contents: "new\n",
          executable: false,
          oldHash: hashBytes("old\n"),
        })),
      });
      expect(duplicate).toEqual(expect.objectContaining({ ok: false }));
      if (!duplicate.ok) expect(duplicate.issue.details).toEqual(expect.objectContaining({ reason: "duplicate-operation-path" }));
      await expect(readFile(path.join(tempRoot, "_speclite/hooks/a/runner.mjs"), "utf8")).resolves.toBe("old\n");
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("treats executable mode as transaction state and cleans a completed journal", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-update-transaction-mode-"));
    const targetPath = "_speclite/hooks/a/runner.mjs";
    try {
      await writeProjectFile(tempRoot, targetPath, "same\n");
      const applied = await applyRecoverableUpdateTransaction({
        projectRoot: tempRoot,
        artifactRoot: "_speclite-output",
        operations: [{
          path: targetPath,
          contents: "same\n",
          executable: true,
          oldHash: hashBytes("same\n"),
          oldExecutable: false,
        }],
      });
      expect(applied).toEqual({ ok: true, changedPaths: [targetPath] });

      await writeProjectFile(tempRoot, "_speclite/_config/.update-journal.json", `${JSON.stringify({
        schemaVersion: "speclite.update-journal.v1",
        planId: `sha256:${"1".repeat(64)}`,
        completedPaths: [targetPath],
        operations: [{
          path: targetPath,
          oldHash: hashBytes("same\n"),
          oldExecutable: false,
          newHash: hashBytes("same\n"),
          executable: true,
        }],
      })}\n`);
      expect(await finalizeCompletedUpdateTransaction(tempRoot)).toEqual({ ok: true, changedPaths: [] });
      await expect(readFile(path.join(tempRoot, "_speclite/_config/.update-journal.json"), "utf8")).rejects.toThrow();
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("resumes an interrupted coordinated apply only from provable old/new states", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-update-transaction-resume-"));
    const blockedRoot = path.join(tempRoot, "_speclite/hooks/z-blocked");
    try {
      await writeProjectFile(tempRoot, "_speclite/hooks/a-first/runner.mjs", "old-a\n");
      await writeProjectFile(tempRoot, "_speclite/hooks/z-blocked/runner.mjs", "old-b\n");
      await mkdir(path.join(tempRoot, "_speclite/_config"), { recursive: true });
      const operations = [
        {
          path: "_speclite/hooks/a-first/runner.mjs",
          contents: "new-a\n",
          executable: false,
          oldHash: hashBytes("old-a\n"),
        },
        {
          path: "_speclite/hooks/z-blocked/runner.mjs",
          contents: "new-b\n",
          executable: false,
          oldHash: hashBytes("old-b\n"),
        },
      ];
      await chmod(blockedRoot, 0o555);
      const interrupted = await applyRecoverableUpdateTransaction({
        projectRoot: tempRoot,
        artifactRoot: "_speclite-output",
        operations,
      });
      expect(interrupted.ok).toBe(false);
      await expect(readFile(path.join(tempRoot, "_speclite/hooks/a-first/runner.mjs"), "utf8")).resolves.toBe("new-a\n");
      await expect(readFile(path.join(tempRoot, "_speclite/_config/.update-journal.json"), "utf8")).resolves.toContain(
        "speclite.update-journal.v1",
      );

      await chmod(blockedRoot, 0o755);
      const resumed = await applyRecoverableUpdateTransaction({
        projectRoot: tempRoot,
        artifactRoot: "_speclite-output",
        operations,
      });
      expect(resumed).toEqual({
        ok: true,
        changedPaths: [
          "_speclite/hooks/a-first/runner.mjs",
          "_speclite/hooks/z-blocked/runner.mjs",
        ],
      });
      await expect(readFile(path.join(tempRoot, "_speclite/hooks/z-blocked/runner.mjs"), "utf8")).resolves.toBe("new-b\n");
      await expect(readFile(path.join(tempRoot, "_speclite/_config/.update-journal.json"), "utf8")).rejects.toThrow();
    } finally {
      await chmod(blockedRoot, 0o755).catch(() => undefined);
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("blocks recovery when a journal target is neither the old nor new hash", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-update-transaction-drift-"));
    try {
      await writeProjectFile(tempRoot, "_speclite/hooks/a-first/runner.mjs", "old-a\n");
      await mkdir(path.join(tempRoot, "_speclite/_config"), { recursive: true });
      const operations = [{
        path: "_speclite/hooks/a-first/runner.mjs",
        contents: "new-a\n",
        executable: false,
        oldHash: hashBytes("old-a\n"),
      }];
      await writeProjectFile(tempRoot, "_speclite/hooks/a-first/runner.mjs", "local-drift\n");
      const result = await applyRecoverableUpdateTransaction({
        projectRoot: tempRoot,
        artifactRoot: "_speclite-output",
        operations,
      });
      expect(result).toEqual(expect.objectContaining({
        ok: false,
        changedPaths: [],
        issue: expect.objectContaining({
          issueId: "file-integrity.recovery-blocked",
          affectedPath: "_speclite/hooks/a-first/runner.mjs",
        }),
      }));
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });
});

async function writeInstalledState(
  projectRoot: string,
  entries: Array<Record<string, unknown>>,
  options: {
    artifactRoot?: string;
    installedModules?: string[];
    sourceDescriptor?: string;
    targetIds?: Array<"claude" | "agents">;
  } = {},
): Promise<void> {
  await mkdir(path.join(projectRoot, "_speclite/_config"), { recursive: true });
  const sourceDescriptor =
    options.sourceDescriptor ??
    [
      "sourceDescriptor:",
      "  sourceType: bundled",
      "  resolvedRoot: assets/source/speclite",
      "  trustStatus: trusted",
      "  integrityEvidence:",
      "    - kind: content-hash",
      "      algorithm: sha256",
      "      value: fixture-source",
      "      verified: true",
    ].join("\n");
  await writeFile(
    path.join(projectRoot, "_speclite/_config/manifest.yaml"),
    [
      `paths:\n  artifactRoot: ${options.artifactRoot ?? "_speclite-output"}`,
      ...(options.installedModules === undefined
        ? []
        : [`installedModules: ${JSON.stringify(options.installedModules)}`]),
      ...(options.targetIds === undefined ? [] : [`targetIds: ${JSON.stringify(options.targetIds)}`]),
      sourceDescriptor,
      "",
    ].join("\n"),
    "utf8",
  );
  await writeFile(
    path.join(projectRoot, "_speclite/_config/files-index.json"),
    `${JSON.stringify({ schemaVersion: "speclite.files-index.v1", entries }, null, 2)}\n`,
    "utf8",
  );
}

async function writeGeneratedInstalledStateBaseline(input: {
  projectRoot: string;
  installedModules: string[];
  targetIds: Array<"claude" | "agents">;
  skillEntries: Array<Record<string, unknown>>;
}): Promise<void> {
  await writeInstalledState(input.projectRoot, [], {
    installedModules: input.installedModules,
    targetIds: input.targetIds,
  });
  await writeSkillIndex(input.projectRoot, input.skillEntries);
  await writeProjectFile(
    input.projectRoot,
    "_speclite/_config/help-index.json",
    `${JSON.stringify({ schemaVersion: "speclite.help-index.v1", entries: [] }, null, 2)}\n`,
  );
  await writeProjectFile(
    input.projectRoot,
    "_speclite/_config/phase-coverage.json",
    `${JSON.stringify({ schemaVersion: "speclite.phase-coverage.v1", rows: [] }, null, 2)}\n`,
  );
  const entries = [];
  for (const [relativePath, artifactKind, sourceRef] of [
    ["_speclite/_config/manifest.yaml", "manifest", "installed-state:manifest"],
    ["_speclite/_config/skill-index.json", "skill-index", "installed-state:skill-index"],
    ["_speclite/_config/help-index.json", "help-index", "installed-state:help-index"],
    ["_speclite/_config/phase-coverage.json", "phase-coverage", "installed-state:phase-coverage"],
  ] as const) {
    entries.push(await filesIndexEntry(
      input.projectRoot,
      relativePath,
      await readFile(path.join(input.projectRoot, relativePath), "utf8"),
      { ownership: "installer-owned", sourceRef, artifactKind },
    ));
  }
  await writeProjectFile(
    input.projectRoot,
    "_speclite/_config/files-index.json",
    `${JSON.stringify({ schemaVersion: "speclite.files-index.v1", entries }, null, 2)}\n`,
  );
}

async function captureFiles(projectRoot: string, relativePaths: string[]): Promise<Array<{
  path: string;
  bytes: Buffer;
  hash: string;
  executable: boolean;
}>> {
  return Promise.all(relativePaths.map(async (relativePath) => {
    const absolutePath = path.join(projectRoot, relativePath);
    const metadata = await lstat(absolutePath);
    expect(metadata.isFile()).toBe(true);
    expect(metadata.isSymbolicLink()).toBe(false);
    const bytes = await readFile(absolutePath);
    return {
      path: relativePath,
      bytes,
      hash: await hashFile(absolutePath),
      executable: (metadata.mode & 0o111) !== 0,
    };
  }));
}

async function expectFilesUnchanged(
  projectRoot: string,
  expected: Awaited<ReturnType<typeof captureFiles>>,
): Promise<void> {
  expect((await captureFiles(projectRoot, expected.map((entry) => entry.path))).map((entry) => ({
    ...entry,
    bytes: entry.bytes.toString("base64"),
  }))).toEqual(expected.map((entry) => ({
    ...entry,
    bytes: entry.bytes.toString("base64"),
  })));
}

async function captureTree(projectRoot: string, relativeRoot: string): Promise<Array<{
  path: string;
  type: "directory" | "file";
}>> {
  const entries: Array<{ path: string; type: "directory" | "file" }> = [];
  async function visit(relativePath: string): Promise<void> {
    const metadata = await lstat(path.join(projectRoot, relativePath));
    expect(metadata.isSymbolicLink()).toBe(false);
    if (metadata.isFile()) {
      entries.push({ path: relativePath, type: "file" });
      return;
    }
    expect(metadata.isDirectory()).toBe(true);
    entries.push({ path: relativePath, type: "directory" });
    for (const child of await readdir(path.join(projectRoot, relativePath))) {
      await visit(path.posix.join(relativePath, child));
    }
  }
  await visit(relativeRoot);
  return entries.sort((left, right) => left.path.localeCompare(right.path));
}

function intersectPaths(candidates: Array<string | undefined>, protectedPaths: string[]): string[] {
  const protectedSet = new Set(protectedPaths);
  return candidates.filter((candidate): candidate is string =>
    candidate !== undefined && protectedSet.has(candidate)
  ).sort();
}

function localSourceDescriptor(): string {
  return [
    "sourceDescriptor:",
    "  sourceType: local",
    "  resolvedRoot: assets/source/speclite",
    "  contentHash: fixture-source",
    "  trustStatus: trusted",
    "  integrityEvidence:",
    "    - kind: content-hash",
    "      algorithm: sha256",
    "      value: fixture-source",
    "      verified: true",
  ].join("\n");
}

async function writeProjectFile(projectRoot: string, relativePath: string, contents: string): Promise<void> {
  const absolutePath = path.join(projectRoot, relativePath);
  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, contents, "utf8");
}

async function writeSkillIndex(projectRoot: string, entries: Array<Record<string, unknown>>): Promise<void> {
  await writeProjectFile(
    projectRoot,
    "_speclite/_config/skill-index.json",
    `${JSON.stringify({ schemaVersion: "speclite.skill-index.v1", entries }, null, 2)}\n`,
  );
}

function skillIndexEntry(input: {
  canonicalSkillId: string;
  canonicalPackageHash: string;
  installedTargets: Array<"claude" | "agents">;
}): Record<string, unknown> {
  return {
    schemaVersion: "speclite.skill-index.v1",
    canonicalSkillId: input.canonicalSkillId,
    moduleId: "core",
    sourcePackagePath: `assets/source/speclite/core-skills/${input.canonicalSkillId}`,
    canonicalPackageHash: input.canonicalPackageHash,
    installedTargets: input.installedTargets,
    phaseIds: ["anytime"],
  };
}

async function filesIndexEntry(
  projectRoot: string,
  relativePath: string,
  contents: string,
  input: {
    ownership: "installer-owned" | "human-owned" | "workflow-owned";
    sourceRef: string;
    artifactKind?: string;
    executable?: boolean;
  },
): Promise<Record<string, unknown>> {
  const absolutePath = path.join(projectRoot, relativePath);
  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, contents, "utf8");
  return {
    schemaVersion: "speclite.files-index.v1",
    path: relativePath,
    ownership: input.ownership,
    hash: await hashFile(absolutePath),
    hashAlgorithm: "sha256",
    executable: input.executable ?? false,
    artifactKind: input.artifactKind ?? (input.ownership === "workflow-owned" ? "workflow-artifact" : "runtime-config"),
    sourceRef: input.sourceRef,
  };
}
