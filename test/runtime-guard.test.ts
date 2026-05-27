import { mkdir, mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { InstallCommandResultSchema } from "../src/diagnostics/command-result-schema.js";
import { runInstallCommand } from "../src/commands/install.js";

const fixtureRoot = new URL("./fixtures/fresh-install-empty-project/", import.meta.url);

describe("install runtime/platform guard", () => {
  it("projects unsupported Node through the CommandResult contract", async () => {
    const outcome = await runInstallCommand({
      options: { json: true },
      runtime: {
        nodeVersion: "v20.11.1",
        platform: "darwin",
        platformRelease: "23.0.0",
        targetProject: "fresh-install-empty-project",
      },
    });

    const expected = JSON.parse(
      await readFile(new URL("expected/command-json/unsupported-node.json", fixtureRoot), "utf8"),
    );

    expect(outcome.exitCode).toBe(1);
    expect(InstallCommandResultSchema.parse(outcome.result)).toEqual(expected);
    expect(outcome.result.issues[0]).toMatchObject({
      issueId: "environment.unsupported-node",
      category: "environment",
      severity: "error",
      details: {
        detectedVersion: "v20.11.1",
        requiredRange: ">=22",
      },
    });
  });

  it("projects unsupported platform through the CommandResult contract", async () => {
    const outcome = await runInstallCommand({
      options: { json: true },
      runtime: {
        nodeVersion: "v22.12.0",
        platform: "linux",
        platformRelease: "6.6.0",
        targetProject: "fresh-install-empty-project",
      },
    });

    const expected = JSON.parse(
      await readFile(
        new URL("expected/command-json/unsupported-platform.json", fixtureRoot),
        "utf8",
      ),
    );

    expect(outcome.exitCode).toBe(1);
    expect(InstallCommandResultSchema.parse(outcome.result)).toEqual(expected);
    expect(outcome.result.issues[0]).toMatchObject({
      issueId: "environment.unsupported-platform",
      category: "environment",
      severity: "error",
      details: {
        detectedPlatform: "linux",
        supportedPlatforms: ["macos-13-or-newer", "windows-11"],
      },
    });
  });

  it("does not create project runtime directories when a guard fails", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-guard-"));

    try {
      const projectRoot = path.join(tempRoot, "fresh-install-empty-project");
      await mkdir(projectRoot);

      const outcome = await runInstallCommand({
        runtime: {
          cwd: projectRoot,
          targetProject: "fresh-install-empty-project",
          nodeVersion: "v20.11.1",
          platform: "darwin",
          platformRelease: "23.0.0",
        },
      });

      expect(outcome.exitCode).toBe(1);

      for (const forbiddenPath of [
        "_speclite",
        "_speclite-output",
        ".claude/skills",
        ".agents/skills",
      ]) {
        await expect(
          readFile(path.join(projectRoot, forbiddenPath), "utf8"),
        ).rejects.toMatchObject({ code: "ENOENT" });
      }
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });
});
