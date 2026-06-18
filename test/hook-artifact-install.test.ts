import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { runInstallCommand } from "../src/commands/install.js";

const supportedRuntime = {
  nodeVersion: "v22.12.0",
  platform: "darwin",
  platformRelease: "23.0.0",
} as const;

describe("canonical hook artifact install", () => {
  it("projects hook runners, merged platform configs and files-index metadata separately from skill packages", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-hook-install-"));

    try {
      await writeFile(path.join(tempRoot, "README.md"), "project notes\n", "utf8");

      const outcome = await runInstallCommand({
        options: { json: true, yes: true },
        runtime: {
          ...supportedRuntime,
          cwd: tempRoot,
        },
      });

      expect(outcome.exitCode).toBe(0);
      await expect(
        readFile(path.join(tempRoot, "_speclite/hooks/flow-gate-enforcement/runner.mjs"), "utf8"),
      ).resolves.toContain("speclite-dev-story");
      await expect(
        readFile(path.join(tempRoot, "_speclite/hooks/flow-gate-enforcement/hook-manifest.json"), "utf8"),
      ).resolves.toContain("flow-gate-enforcement");
      await expect(
        readFile(path.join(tempRoot, "_speclite/hooks/canonical-source-change-check/runner.mjs"), "utf8"),
      ).resolves.toContain("assets/source/speclite");
      await expect(
        readFile(path.join(tempRoot, "_speclite/hooks/canonical-source-change-check/hook-manifest.json"), "utf8"),
      ).resolves.toContain("canonical-source-change-check");

      const claudeSettings = JSON.parse(await readFile(path.join(tempRoot, ".claude/settings.json"), "utf8"));
      expect(Object.keys(claudeSettings.hooks).sort()).toEqual(["PostToolUse", "Stop", "UserPromptSubmit"]);
      expect(claudeSettings.hooks.UserPromptSubmit[0].hooks[0].command).toContain("flow-gate-enforcement");
      expect(claudeSettings.hooks.PostToolUse[0].hooks[0].command).toContain("canonical-source-change-check");
      expect(claudeSettings.hooks.Stop[0].hooks[0].command).toContain("canonical-source-change-check");

      const codexHooks = JSON.parse(await readFile(path.join(tempRoot, ".codex/hooks.json"), "utf8"));
      expect(Array.isArray(codexHooks.hooks)).toBe(false);
      expect(Object.keys(codexHooks.hooks).sort()).toEqual(["PostToolUse", "Stop", "UserPromptSubmit"]);
      expect(codexHooks.hooks.UserPromptSubmit[0].hooks[0].command).toContain("flow-gate-enforcement");
      expect(codexHooks.hooks.PostToolUse[0].hooks[0].command).toContain("canonical-source-change-check");
      expect(codexHooks.hooks.Stop[0].hooks[0].command).toContain("canonical-source-change-check");
      expect(JSON.stringify(codexHooks)).not.toContain('"event"');
      expect(JSON.stringify(codexHooks)).not.toContain('"decision":"block"');

      const configToml = await readFile(path.join(tempRoot, "_speclite/config.toml"), "utf8");
      expect(configToml).toContain("[hooks.flow-gate-enforcement]");
      expect(configToml).toContain("[hooks.canonical-source-change-check]");
      expect(configToml).toContain('protected_surface = "assets/source/speclite"');
      expect(configToml).toContain('protected_skill = "speclite-dev-story"');
      expect(configToml).not.toContain(
        '[hooks.canonical-source-change-check]\nprotected_skill = "assets/source/speclite"',
      );

      const filesIndex = JSON.parse(
        await readFile(path.join(tempRoot, "_speclite/_config/files-index.json"), "utf8"),
      );
      expect(filesIndex.entries).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: "_speclite/hooks/flow-gate-enforcement/runner.mjs",
            ownership: "installer-owned",
            executable: true,
            artifactKind: "hook-runner",
            sourceRef: "assets/source/speclite/hooks/flow-gate-enforcement/runner.mjs",
          }),
          expect.objectContaining({
            path: "_speclite/hooks/canonical-source-change-check/runner.mjs",
            ownership: "installer-owned",
            executable: true,
            artifactKind: "hook-runner",
            sourceRef: "assets/source/speclite/hooks/canonical-source-change-check/runner.mjs",
          }),
          expect.objectContaining({
            path: "_speclite/hooks/canonical-source-change-check/hook-manifest.json",
            ownership: "installer-owned",
            executable: false,
            artifactKind: "hook-source-metadata",
            sourceRef: "assets/source/speclite/hooks/canonical-source-change-check/hook-manifest.json",
          }),
          expect.objectContaining({
            path: ".claude/settings.json",
            ownership: "installer-owned",
            artifactKind: "platform-hook-config",
            sourceRef: "generated:claude-hook-registry-config",
          }),
          expect.objectContaining({
            path: ".codex/hooks.json",
            ownership: "installer-owned",
            artifactKind: "platform-hook-config",
            sourceRef: "generated:codex-hook-registry-config",
          }),
        ]),
      );
      expect(JSON.stringify(filesIndex)).not.toContain(".claude/skills/speclite-dev-story/runner.mjs");
      expect(outcome.result.nextActions.join("\n")).toContain("/hooks");
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("upgrades recognized legacy SpecLite hook configs when files-index is unavailable", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-hook-legacy-upgrade-"));

    try {
      await mkdir(path.join(tempRoot, ".claude"), { recursive: true });
      await mkdir(path.join(tempRoot, ".codex"), { recursive: true });
      await writeFile(
        path.join(tempRoot, ".claude/settings.json"),
        `${JSON.stringify(
          {
            hooks: {
              UserPromptSubmit: [
                {
                  matcher: "",
                  hooks: [
                    {
                      type: "command",
                      command: "node _speclite/hooks/flow-gate-enforcement/runner.mjs --platform claude",
                    },
                  ],
                },
              ],
            },
          },
          null,
          2,
        )}\n`,
        "utf8",
      );
      await writeFile(
        path.join(tempRoot, ".codex/hooks.json"),
        `${JSON.stringify(
          {
            hooks: [
              {
                event: "UserPromptSubmit",
                id: "speclite-flow-gate-enforcement",
                description: "Block speclite-dev-story until story-kickoff Flow Gate evidence passes.",
                command: "node _speclite/hooks/flow-gate-enforcement/runner.mjs --platform codex",
              },
            ],
          },
          null,
          2,
        )}\n`,
        "utf8",
      );

      const outcome = await runInstallCommand({
        options: { json: true, yes: true },
        runtime: {
          ...supportedRuntime,
          cwd: tempRoot,
        },
      });

      expect(outcome.exitCode).toBe(0);
      const claudeSettings = JSON.parse(await readFile(path.join(tempRoot, ".claude/settings.json"), "utf8"));
      expect(claudeSettings.hooks.PostToolUse[0].hooks[0].command).toContain("canonical-source-change-check");
      const codexHooks = JSON.parse(await readFile(path.join(tempRoot, ".codex/hooks.json"), "utf8"));
      expect(Array.isArray(codexHooks.hooks)).toBe(false);
      expect(codexHooks.hooks.PostToolUse[0].hooks[0].command).toContain("canonical-source-change-check");
      expect(JSON.stringify(codexHooks)).not.toContain('"event"');
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it.each([
    {
      configPath: ".claude/settings.json",
      contents: JSON.stringify({ hooks: { UserPromptSubmit: [{ command: "custom" }] } }, null, 2),
      expectedMarker: '"command": "custom"',
      affectedPath: ".claude/settings.json",
    },
    {
      configPath: ".codex/hooks.json",
      contents: JSON.stringify({ hooks: [{ id: "custom", command: "custom" }] }, null, 2),
      expectedMarker: '"id": "custom"',
      affectedPath: ".codex/hooks.json",
    },
  ])(
    "protects existing $affectedPath and returns manual action before install writes",
    async ({ configPath, contents, expectedMarker, affectedPath }) => {
      const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-hook-conflict-"));

      try {
        await mkdir(path.dirname(path.join(tempRoot, configPath)), { recursive: true });
        await writeFile(path.join(tempRoot, configPath), contents, "utf8");

        const outcome = await runInstallCommand({
          options: { yes: true },
          runtime: {
            ...supportedRuntime,
            cwd: tempRoot,
          },
        });

        expect(outcome.exitCode).toBe(1);
        expect(outcome.result.nextActions.join("\n")).not.toContain("Review completed changed paths");
        expect(outcome.result.issues).toEqual([
          expect.objectContaining({
            issueId: "ide-mirror.hook-config-conflict",
            category: "ide-mirror",
            severity: "error",
            affectedPath,
            details: expect.objectContaining({
              manualAction: expect.stringContaining("merge the SpecLite hook registry manually"),
            }),
          }),
        ]);
        expect(outcome.result.issues[0]?.details).not.toHaveProperty("changedPaths");
        await expect(readFile(path.join(tempRoot, configPath), "utf8")).resolves.toContain(expectedMarker);
        await expect(readFile(path.join(tempRoot, "_speclite/config.toml"), "utf8")).rejects.toMatchObject({
          code: "ENOENT",
        });
        await expect(
          readFile(path.join(tempRoot, "_speclite/hooks/flow-gate-enforcement/runner.mjs"), "utf8"),
        ).rejects.toMatchObject({ code: "ENOENT" });
        await expect(
          readFile(path.join(tempRoot, "_speclite/hooks/flow-gate-enforcement/hook-manifest.json"), "utf8"),
        ).rejects.toMatchObject({ code: "ENOENT" });
        await expect(
          readFile(path.join(tempRoot, ".claude/skills/speclite-dev-story/SKILL.md"), "utf8"),
        ).rejects.toMatchObject({ code: "ENOENT" });
        await expect(readFile(path.join(tempRoot, "_speclite/.lock"), "utf8")).rejects.toMatchObject({
          code: "ENOENT",
        });
      } finally {
        await rm(tempRoot, { recursive: true, force: true });
      }
    },
  );
});
