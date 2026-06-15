import { cp, mkdir, mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createSpecliteProgram } from "../src/bin/speclite.js";
import { ResolveStderrJsonLineSchema, ResolveStdoutObjectSchema } from "../src/config/resolve-output-schema.js";

describe("speclite resolve CLI", () => {
  it("resolves config as pure stdout JSON without CommandResult envelope", async () => {
    const fixtureRoot = await createResolveParityFixture();
    try {
      const result = await runResolve(["resolve", "config", "--project-root", fixtureRoot]);

      expect(result.exitCodes).toEqual([0]);
      expect(result.stderr).toBe("");
      const parsed = ResolveStdoutObjectSchema.parse(JSON.parse(result.stdout));
      expect(parsed).toMatchObject({
        core: {
          project_name: "Fixture User",
          communication_language: "中文",
          document_output_language: "Mandarin",
        },
      });
      expect(parsed).not.toHaveProperty("status");
      expect(parsed).not.toHaveProperty("issues");
      expect(result.stdout).toContain("中文");
    } finally {
      await rm(fixtureRoot, { recursive: true, force: true });
    }
  });

  it("keeps resolve config default output pure JSON when human mode is not requested", async () => {
    const fixtureRoot = await createResolveParityFixture({ brokenOptionalConfig: true });
    try {
      const result = await runResolve([
        "resolve",
        "config",
        "--project-root",
        fixtureRoot,
        "--key",
        "core.project_name",
      ]);

      expect(result.exitCodes).toEqual([0]);
      expect(JSON.parse(result.stdout)).toEqual({ "core.project_name": "Fixture User" });
      expect(result.stdout).not.toContain("Outcome");
      const diagnostics = parseJsonLines(result.stderr);
      expect(ResolveStderrJsonLineSchema.parse(diagnostics[0])).toMatchObject({
        severity: "warning",
        affectedPath: "_speclite/custom/config.toml",
      });
    } finally {
      await rm(fixtureRoot, { recursive: true, force: true });
    }
  });

  it("renders explicit human resolve output for successful config keys without leaking absolute paths", async () => {
    const fixtureRoot = await createResolveParityFixture();
    try {
      const result = await runResolve([
        "resolve",
        "config",
        "--human",
        "--locale",
        "en-US",
        "--project-root",
        fixtureRoot,
        "--key",
        "core.project_name",
      ]);

      expect(result.exitCodes).toEqual([0]);
      expect(result.stderr).toBe("");
      expect(result.stdout).toBe(await readExpectedHumanOutput("config-resolved.txt"));
      expect(result.stdout).not.toContain(fixtureRoot);
      expect(result.stdout).not.toContain(os.homedir());
      expect(result.stdout).toContain("requested key: core.project_name");
      expect(result.stdout).toContain("resolved layer: merged config layers");
      expect(result.stdout).toContain("source path: _speclite/config.user.toml");
      expect(result.stdout).toContain("value summary: object with 1 key");
      expect(result.stdout).toContain("中文 locale preserves technical identifiers");
    } finally {
      await rm(fixtureRoot, { recursive: true, force: true });
    }
  });

  it("renders explicit human resolved-with-warnings output for optional layer diagnostics", async () => {
    const fixtureRoot = await createResolveParityFixture({ brokenOptionalConfig: true });
    try {
      const result = await runResolve([
        "resolve",
        "config",
        "--human",
        "--locale",
        "en-US",
        "--project-root",
        fixtureRoot,
      ]);

      expect(result.exitCodes).toEqual([0]);
      expect(result.stderr).toBe("");
      expect(result.stdout).toBe(await readExpectedHumanOutput("config-resolved-with-warnings.txt"));
      expect(result.stdout).not.toContain(fixtureRoot);
      expect(result.stdout).toContain("Outcome: resolved-with-warnings");
      expect(result.stdout).toContain("fallback source: optional layer treated as empty object");
      expect(result.stdout).toContain("source path: multiple");
      expect(result.stdout).toContain("_speclite/custom/config.toml");
    } finally {
      await rm(fixtureRoot, { recursive: true, force: true });
    }
  });

  it("renders explicit human unresolved output for missing config keys while default mode stays empty success", async () => {
    const fixtureRoot = await createResolveParityFixture();
    try {
      const missing = await runResolve([
        "resolve",
        "config",
        "--project-root",
        fixtureRoot,
        "--key",
        "missing.value",
      ]);
      expect(missing.exitCodes).toEqual([0]);
      expect(missing.stderr).toBe("");
      expect(JSON.parse(missing.stdout)).toEqual({});

      const human = await runResolve([
        "resolve",
        "config",
        "--human",
        "--locale",
        "en-US",
        "--project-root",
        fixtureRoot,
        "--key",
        "missing.value",
      ]);
      expect(human.exitCodes).toEqual([0]);
      expect(human.stderr).toBe("");
      expect(human.stdout).toBe(await readExpectedHumanOutput("config-unresolved.txt"));
      expect(human.stdout).toContain("Outcome: unresolved");
      expect(human.stdout).toContain("missing key: missing.value");
    } finally {
      await rm(fixtureRoot, { recursive: true, force: true });
    }
  });

  it("renders explicit human invalid-input output for missing resolve options", async () => {
    const result = await runResolve(["resolve", "config", "--human", "--locale", "en-US"]);

    expect(result.exitCodes).toEqual([1]);
    expect(result.stderr).toBe("");
    expect(result.stdout).toBe(await readExpectedHumanOutput("config-invalid-input.txt"));
    expect(result.stdout).toContain("Outcome: invalid-input");
    expect(result.stdout).toContain("runtime-path.missing-entry");
    expect(result.stdout).toContain("speclite resolve config --project-root <projectRoot> [--key <dottedKey>] [--human]");
  });

  it("renders explicit human customization fallback search as resolved-with-warnings", async () => {
    const fixtureRoot = await createResolveParityFixture();
    try {
      const skillDir = path.join(fixtureRoot, ".claude/skills/speclite-create-story");
      const cwd = path.join(fixtureRoot, "nested/work");
      const result = await runResolve([
        "resolve",
        "customization",
        "--human",
        "--locale",
        "en-US",
        "--skill",
        skillDir,
        "--key",
        "workflow.on_complete",
      ], { cwd });

      expect(result.exitCodes).toEqual([0]);
      expect(result.stderr).toBe("");
      expect(result.stdout).not.toContain(fixtureRoot);
      expect(result.stdout).not.toContain(os.homedir());
      expect(result.stdout).toContain("Outcome: resolved-with-warnings");
      expect(result.stdout).toContain("fallback source: project root search");
      expect(result.stdout).toContain("source path: _speclite/custom/speclite-create-story.user.toml");
      expect(result.stdout).toContain("_speclite/custom/speclite-create-story.toml");
      expect(result.stdout).toContain("requested key: workflow.on_complete");
    } finally {
      await rm(fixtureRoot, { recursive: true, force: true });
    }
  });

  it("supports missing and repeated key selection with empty success", async () => {
    const fixtureRoot = await createResolveParityFixture();
    try {
      const result = await runResolve([
        "resolve",
        "config",
        "--project-root",
        fixtureRoot,
        "--key",
        "core.project_name",
        "--key",
        "missing.value",
        "--key",
        "core.project_name",
      ]);

      expect(result.exitCodes).toEqual([0]);
      expect(result.stderr).toBe("");
      expect(JSON.parse(result.stdout)).toEqual({
        "core.project_name": "Fixture User",
      });

      const missing = await runResolve([
        "resolve",
        "config",
        "--project-root",
        fixtureRoot,
        "--key",
        "missing.value",
      ]);
      expect(missing.exitCodes).toEqual([0]);
      expect(missing.stderr).toBe("");
      expect(JSON.parse(missing.stdout)).toEqual({});
    } finally {
      await rm(fixtureRoot, { recursive: true, force: true });
    }
  });

  it("emits warning JSON Lines for optional layer parse failure and keeps exit zero", async () => {
    const fixtureRoot = await createResolveParityFixture({ brokenOptionalConfig: true });
    try {
      const result = await runResolve(["resolve", "config", "--project-root", fixtureRoot]);

      expect(result.exitCodes).toEqual([0]);
      expect(JSON.parse(result.stdout)).toMatchObject({ core: { project_name: "Fixture User" } });
      const diagnostics = parseJsonLines(result.stderr);
      expect(diagnostics).toHaveLength(1);
      expect(ResolveStderrJsonLineSchema.parse(diagnostics[0])).toMatchObject({
        severity: "warning",
        affectedPath: "_speclite/custom/config.toml",
      });
      expect(result.stderr).not.toContain(fixtureRoot);
    } finally {
      await rm(fixtureRoot, { recursive: true, force: true });
    }
  });

  it("renders explicit human invalid-input output for required layer failures without raw exceptions", async () => {
    const fixtureRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-resolve-required-human-"));
    try {
      const result = await runResolve([
        "resolve",
        "config",
        "--human",
        "--locale",
        "en-US",
        "--project-root",
        fixtureRoot,
      ]);

      expect(result.exitCodes).toEqual([1]);
      expect(result.stderr).toBe("");
      expect(result.stdout).toContain("Outcome: invalid-input");
      expect(result.stdout).toContain("failed layer: _speclite/config.toml");
      expect(result.stdout).toContain("reason: runtime-path.missing-entry");
      expect(result.stdout).not.toContain(fixtureRoot);
      expect(result.stdout).not.toContain("Error:");
    } finally {
      await rm(fixtureRoot, { recursive: true, force: true });
    }
  });

  it("blocks required layer failure without partial stdout", async () => {
    const fixtureRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-resolve-required-"));
    try {
      const result = await runResolve(["resolve", "config", "--project-root", fixtureRoot]);

      expect(result.exitCodes).toEqual([1]);
      expect(result.stdout).toBe("");
      const diagnostics = parseJsonLines(result.stderr);
      const expectedDiagnostics = parseJsonLines(
        await readFile("test/fixtures/resolve-parity/expected/config/required-layer-error.jsonl", "utf8"),
      );
      const parsedDiagnostic = ResolveStderrJsonLineSchema.parse(diagnostics[0]);
      const parsedExpectedDiagnostic = ResolveStderrJsonLineSchema.parse(expectedDiagnostics[0]);
      expect(parsedDiagnostic.details?.layerRole).toBe(parsedExpectedDiagnostic.details?.layerRole);
      expect(parsedDiagnostic).toMatchObject({
        issueId: "runtime-path.missing-entry",
        severity: "error",
        affectedPath: "_speclite/config.toml",
        details: {
          layerRole: "required-config",
        },
      });
      expect(result.stderr).not.toContain(fixtureRoot);
    } finally {
      await rm(fixtureRoot, { recursive: true, force: true });
    }
  });

  it("resolves customization with explicit project root and fallback project search", async () => {
    const fixtureRoot = await createResolveParityFixture();
    try {
      const skillDir = path.join(fixtureRoot, ".claude/skills/speclite-create-story");
      const explicit = await runResolve([
        "resolve",
        "customization",
        "--skill",
        skillDir,
        "--project-root",
        fixtureRoot,
        "--key",
        "workflow.on_complete",
      ]);

      expect(explicit.exitCodes).toEqual([0]);
      expect(explicit.stderr).toBe("");
      expect(JSON.parse(explicit.stdout)).toEqual({
        "workflow.on_complete": "用户完成",
      });

      const fallback = await runResolve(["resolve", "customization", "--skill", skillDir], {
        cwd: path.join(fixtureRoot, "nested/work"),
      });
      expect(fallback.exitCodes).toEqual([0]);
      expect(JSON.parse(fallback.stdout)).toMatchObject({
        workflow: {
          on_complete: "用户完成",
        },
      });
    } finally {
      await rm(fixtureRoot, { recursive: true, force: true });
    }
  });

  it("requires explicit project root for config resolve", async () => {
    const result = await runResolve(["resolve", "config"]);

    expect(result.exitCodes).toEqual([1]);
    expect(result.stdout).toBe("");
    expect(parseJsonLines(result.stderr)[0]).toMatchObject({
      issueId: "runtime-path.missing-entry",
      severity: "error",
      component: "resolve-command",
    });
  });

  it("keeps resolve-parity fixture files local and deterministic", async () => {
    const manifest = JSON.parse(
      await readFile("test/fixtures/resolve-parity/fixture-case.json", "utf8"),
    );

    expect(manifest).toMatchObject({
      caseId: "resolve-parity",
      releaseGate: true,
    });
  });

  it("keeps real resolve-parity input layers in fixture-owned assets", async () => {
    const inputRoot = "test/fixtures/resolve-parity/input";
    const fixtureLayerFiles = [
      "config/_speclite/config.toml",
      "config/_speclite/config.user.toml",
      "config/_speclite/custom/config.toml",
      "config/_speclite/custom/config.user.toml",
      "config-broken-optional/_speclite/config.toml",
      "config-broken-optional/_speclite/custom/config.toml",
      "customization/.claude/skills/speclite-create-story/customize.toml",
      "customization/_speclite/custom/speclite-create-story.toml",
      "customization/_speclite/custom/speclite-create-story.user.toml",
    ];

    for (const relativePath of fixtureLayerFiles) {
      const contents = await readFile(`${inputRoot}/${relativePath}`, "utf8");
      expect(contents.length).toBeGreaterThan(0);
    }
  });
});

type RunResolveOptions = {
  cwd?: string;
};

async function runResolve(args: string[], options: RunResolveOptions = {}) {
  const stdout: string[] = [];
  const stderr: string[] = [];
  const exitCodes: number[] = [];
  const previousCwd = process.cwd();

  try {
    if (options.cwd !== undefined) {
      await mkdir(options.cwd, { recursive: true });
      process.chdir(options.cwd);
    }
    const program = createSpecliteProgram({
      io: {
        stdout: (text) => stdout.push(text),
        stderr: (text) => stderr.push(text),
        setExitCode: (code) => exitCodes.push(code),
      },
    });
    await program.parseAsync(["node", "speclite", ...args], { from: "node" });
  } finally {
    process.chdir(previousCwd);
  }

  return {
    stdout: stdout.join(""),
    stderr: stderr.join(""),
    exitCodes,
  };
}

async function createResolveParityFixture(options: { brokenOptionalConfig?: boolean } = {}): Promise<string> {
  const fixtureRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-resolve-parity-"));
  const inputRoot = path.join("test/fixtures/resolve-parity/input");
  await cp(
    path.join(inputRoot, options.brokenOptionalConfig ? "config-broken-optional" : "config"),
    fixtureRoot,
    { recursive: true },
  );
  await cp(path.join(inputRoot, "customization"), fixtureRoot, { recursive: true });

  return fixtureRoot;
}

async function readExpectedHumanOutput(fileName: string): Promise<string> {
  return readFile(path.join("test/fixtures/resolve-parity/expected/human", fileName), "utf8");
}

function parseJsonLines(text: string): unknown[] {
  return text
    .trim()
    .split("\n")
    .filter((line) => line.length > 0)
    .map((line) => JSON.parse(line));
}
