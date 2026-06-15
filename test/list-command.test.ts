import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createSpecliteProgram } from "../src/bin/speclite.js";
import { runListCommand } from "../src/commands/list.js";
import { ListCommandResultSchema } from "../src/diagnostics/command-result-schema.js";
import { renderCommandResultJson } from "../src/diagnostics/output.js";

describe("list command canonical identity projection", () => {
  it("lists modules, skills, IDE targets and versions from canonical sources", async () => {
    const outcome = await runListCommand({
      runtime: {
        cwd: process.cwd(),
        targetProject: "speclite-repo",
      },
    });
    const parsed = ListCommandResultSchema.parse(outcome.result);

    expect(outcome.exitCode).toBe(0);
    expect(parsed.command).toBe("list");
    expect(parsed.data.modules.map((module) => module.moduleId)).toEqual(["core", "sdlc"]);
    expect(parsed.data.ideTargets.map((target) => target.id)).toEqual(["claude", "agents"]);
    expect(parsed.data.skills.map((skill) => skill.canonicalSkillId)).toEqual(
      [...parsed.data.skills.map((skill) => skill.canonicalSkillId)].sort(),
    );
    expect(parsed.data.skills).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          canonicalSkillId: "speclite-dev-story",
          moduleId: "sdlc",
          phaseIds: expect.arrayContaining(["4-implementation"]),
        }),
      ]),
    );
    expect(parsed.data.versions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "@fancyliu/speclite",
          version: expect.any(String),
        }),
        expect.objectContaining({
          name: "module:sdlc",
          version: expect.any(String),
        }),
      ]),
    );
  });

  it("adds installed manifest and skill-index projection without redefining identities", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-list-installed-"));
    const originalCwd = process.cwd();

    try {
      await writeInstalledState(tempRoot);
      process.chdir(tempRoot);

      const outcome = await runListCommand({
        runtime: {
          cwd: tempRoot,
          targetProject: "installed-list",
        },
      });
      const parsed = ListCommandResultSchema.parse(outcome.result);

      expect(parsed.data.installedState).toMatchObject({
        manifestPresent: true,
        installedModules: ["core", "sdlc"],
        installedSkillCount: 1,
      });
      expect(parsed.data.skills.find((skill) => skill.canonicalSkillId === "speclite-dev-story")).toMatchObject({
        moduleId: "sdlc",
        installedTargets: ["claude"],
      });
      expect(renderCommandResultJson(parsed)).not.toContain(tempRoot);
    } finally {
      process.chdir(originalCwd);
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("registers speclite list --json with CommandResult-compatible output", async () => {
    const stdout: string[] = [];
    const exitCodes: number[] = [];
    const program = createSpecliteProgram({
      io: {
        stdout: (text) => stdout.push(text),
        stderr: () => undefined,
        setExitCode: (code) => exitCodes.push(code),
      },
      runtime: {
        cwd: process.cwd(),
        targetProject: "cli-list",
      },
    });

    await program.parseAsync(["node", "speclite", "list", "--json"], { from: "node" });
    const parsed = ListCommandResultSchema.parse(JSON.parse(stdout.join("")));

    expect(exitCodes).toEqual([0]);
    expect(parsed.command).toBe("list");
    expect(parsed.data.modules.length).toBeGreaterThan(0);
    expect(parsed.data.skills.length).toBeGreaterThan(0);
  });
});

async function writeInstalledState(projectRoot: string): Promise<void> {
  await mkdir(path.join(projectRoot, "_speclite/_config"), { recursive: true });
  await writeFile(
    path.join(projectRoot, "_speclite/_config/manifest.yaml"),
    [
      'schemaVersion: "speclite.manifest.v1"',
      "sourceDescriptor:",
      '  sourceType: "bundled"',
      '  channel: "stable"',
      '  version: "0.0.0"',
      '  resolvedRoot: "assets/source/speclite"',
      "  integrityEvidence:",
      '    - kind: "version-lock"',
      '      packageName: "speclite"',
      '      version: "0.0.0"',
      '      lockPath: "package-lock.json"',
      "      verified: true",
      '  trustStatus: "trusted"',
      "installedModules:",
      '  - "core"',
      '  - "sdlc"',
      "targetIds:",
      '  - "claude"',
      "paths:",
      '  projectRoot: "."',
      '  specliteRoot: "_speclite"',
      '  artifactRoot: "_speclite-output"',
      '  manifestPath: "_speclite/_config/manifest.yaml"',
      "",
    ].join("\n"),
    "utf8",
  );
  await writeFile(
    path.join(projectRoot, "_speclite/_config/skill-index.json"),
    JSON.stringify(
      {
        schemaVersion: "speclite.skill-index.v1",
        entries: [
          {
            schemaVersion: "speclite.skill-index.v1",
            canonicalSkillId: "speclite-dev-story",
            moduleId: "sdlc",
            sourcePackagePath: "assets/source/speclite/sdlc-skills/4-implementation/speclite-dev-story",
            canonicalPackageHash: "sha256:dev",
            installedTargets: ["claude"],
            phaseIds: ["4-implementation"],
          },
        ],
      },
      null,
      2,
    ),
    "utf8",
  );
}
