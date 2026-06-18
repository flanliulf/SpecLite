import { mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createSpecliteProgram } from "../src/bin/speclite.js";
import { runInstallCommand } from "../src/commands/install.js";

const supportedRuntime = {
  nodeVersion: "v22.12.0",
  platform: "darwin",
  platformRelease: "23.0.0",
} as const;

const legacyActivationPatterns = [
  /resolve_customization\.py/,
  /resolve_config\.py/,
  /\{speclite-runtime-root\}\/scripts\/resolve_[a-z_]+\.py/,
  /python3\s+\S*resolve_[a-z_]+\.py/,
  /node\s+dist\//,
  /package cache/i,
  /source checkout path/i,
  /\{speclite-runtime-root\}\/_config\/[A-Za-z0-9_.-]+\.csv/,
  /\{project-root\}\/_speclite\/_config\/[A-Za-z0-9_.-]+\.csv/,
  /_speclite\/_config\/[A-Za-z0-9_.-]+\.csv/,
  /读取\s+`?\{project-root\}\/_speclite\/config\.toml`?/,
  /Load config from `\{project-root\}\/_speclite\/config\.toml`/,
  /Runtime config is read from `\{project-root\}\/_speclite\/config\.toml`/,
  /from `\{project-root\}\/_speclite\/config\.toml`/,
];

describe("installed skill activation contract", () => {
  it("requires Node CLI resolver and CLI availability preflight in canonical persona agents", async () => {
    const agentFiles = await listFiles("assets/source/speclite/sdlc-skills", (filePath) =>
      /\/speclite-agent-[^/]+\/SKILL(?:\.en)?\.md$/.test(filePath),
    );

    expect(agentFiles).not.toEqual([]);
    for (const filePath of agentFiles) {
      const text = await readFile(filePath, "utf8");
      expect(text, filePath).toContain("command -v speclite");
      expect(text, filePath).toContain("SpecLite CLI command speclite is not available in this AI session PATH");
      expect(text, filePath).toContain(
        "speclite resolve customization --skill {skill-root} --project-root {project-root} --key agent",
      );
      expect(text, filePath).toContain("speclite resolve config --project-root {project-root}");
      expect(text, filePath).toContain("agent.persistent_facts");
      expect(text, filePath).toContain("agent.menu");
      expect(text, filePath).toMatch(/persistent_facts[\s\S]{0,240}(non-blocking|不阻断|不会阻断)/);
      assertNoLegacyActivation(text, filePath);
    }
  });

  it("rejects legacy resolver and single-file config wording in canonical activation corpus", async () => {
    const corpusFiles = await listFiles("assets/source/speclite", isActivationContractFile);

    expect(corpusFiles).not.toEqual([]);
    for (const filePath of corpusFiles) {
      const text = await readFile(filePath, "utf8");
      assertNoLegacyActivation(text, filePath);
    }
  });

  it("keeps support-side speclite-agent tooling in negative scan without treating it as persona targets", async () => {
    const supportFiles = await listFiles("assets/source/speclite/support-skills", (filePath) =>
      /\/speclite-agent-(creator|lint)\//.test(filePath) &&
      /\.(md|py|toml)$/.test(filePath) &&
      !filePath.endsWith("/scripts/check_agent_skill.py"),
    );
    const supportSkillEntries = supportFiles.filter((filePath) => filePath.endsWith("/SKILL.md"));

    expect(supportSkillEntries.sort()).toEqual([
      "assets/source/speclite/support-skills/speclite-agent-creator/SKILL.md",
      "assets/source/speclite/support-skills/speclite-agent-lint/SKILL.md",
    ]);
    for (const filePath of supportFiles) {
      const text = await readFile(filePath, "utf8");
      assertNoLegacyActivation(text, filePath);
    }
  });

  it("installs mirrored activation entries that keep Alice on merged config values", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-installed-activation-"));

    try {
      await writeFile(path.join(tempRoot, "README.md"), "NOI fixture\n", "utf8");
      const outcome = await runInstallCommand({
        options: { json: true, yes: true },
        runtime: {
          ...supportedRuntime,
          cwd: tempRoot,
          targetProject: "noi",
        },
      });
      expect(outcome.exitCode).toBe(0);

      await writeFile(
        path.join(tempRoot, "_speclite/config.user.toml"),
        '[core]\nuser_name = "NOI Maintainer"\ncommunication_language = "Chinese"\ndocument_output_language = "Chinese"\n',
        "utf8",
      );

      const aliceEntry = path.join(tempRoot, ".agents/skills/speclite-agent-analyst/SKILL.md");
      const aliceText = await readFile(aliceEntry, "utf8");
      expect(aliceText).toContain("Alice");
      expect(aliceText).toContain("agent.menu");
      expect(aliceText).toContain("command -v speclite");
      expect(aliceText).toContain("speclite resolve config --project-root {project-root}");
      expect(aliceText).not.toContain("读取 `{project-root}/_speclite/config.toml`");
      expect(aliceText).toMatch(/persistent_facts[\s\S]{0,240}(non-blocking|不阻断|不会阻断)/);

      const installedCorpusFiles = (
        await Promise.all([
          listFiles(path.join(tempRoot, ".agents/skills"), isActivationContractFile),
          listFiles(path.join(tempRoot, ".claude/skills"), isActivationContractFile),
        ])
      ).flat();

      expect(installedCorpusFiles).not.toEqual([]);
      expect(installedCorpusFiles).toContain(aliceEntry.split(path.sep).join("/"));
      for (const filePath of installedCorpusFiles) {
        const text = await readFile(filePath, "utf8");
        assertNoLegacyActivation(text, filePath);
      }

      const configResolve = await runResolve([
        "resolve",
        "config",
        "--project-root",
        tempRoot,
        "--key",
        "core.user_name",
        "--key",
        "core.communication_language",
      ]);
      expect(configResolve.exitCodes).toEqual([0]);
      expect(configResolve.stderr).toBe("");
      expect(JSON.parse(configResolve.stdout)).toEqual({
        "core.user_name": "NOI Maintainer",
        "core.communication_language": "Chinese",
      });
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("documents Python resolver scripts only as compatibility assets outside the default activation path", async () => {
    const docFiles = [
      "README.md",
      "docs/reference/cli.md",
      "docs/explanation/local-first-control-plane.md",
      "docs/glossary/speclite-runtime-boundaries.md",
    ];

    for (const filePath of docFiles) {
      const text = await readFile(filePath, "utf8");
      expect(text, filePath).toContain("_speclite/scripts/resolve_*.py");
      expect(text, filePath).toMatch(/compatibility|兼容/);
      expect(text, filePath).toMatch(/troubleshooting|排查|migration|迁移/);
      expect(text, filePath).toContain("speclite resolve config");
      expect(text, filePath).toContain("speclite resolve customization");
      expect(text, filePath).toMatch(/唯一默认|only default/);
      expect(text, filePath).not.toMatch(/正常.*python3.*resolve_|default.*python3.*resolve_|推荐.*_speclite\/scripts\/resolve_/i);
    }
  });
});

function assertNoLegacyActivation(text: string, label: string): void {
  for (const pattern of legacyActivationPatterns) {
    expect(text, `${label} must not match ${pattern}`).not.toMatch(pattern);
  }
}

function isActivationContractFile(filePath: string): boolean {
  return /\/SKILL(?:\.[^/]+)?\.md$/.test(filePath) || /\/references\/.+\.md$/.test(filePath);
}

async function listFiles(root: string, predicate: (filePath: string) => boolean): Promise<string[]> {
  const files: string[] = [];
  async function visit(current: string): Promise<void> {
    let children;
    try {
      children = await readdir(current, { withFileTypes: true });
    } catch (error) {
      if (typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT") {
        return;
      }
      throw error;
    }
    for (const child of children) {
      const childPath = path.join(current, child.name).split(path.sep).join("/");
      if (child.isDirectory()) {
        await visit(childPath);
        continue;
      }
      if (predicate(childPath)) files.push(childPath);
    }
  }
  await visit(root);
  return files.sort((left, right) => left.localeCompare(right));
}

async function runResolve(args: string[]) {
  const stdout: string[] = [];
  const stderr: string[] = [];
  const exitCodes: number[] = [];
  const program = createSpecliteProgram({
    io: {
      stdout: (text) => stdout.push(text),
      stderr: (text) => stderr.push(text),
      setExitCode: (code) => exitCodes.push(code),
    },
  });

  await program.parseAsync(["node", "speclite", ...args], { from: "node" });

  return {
    stdout: stdout.join(""),
    stderr: stderr.join(""),
    exitCodes,
  };
}
