import { spawn } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

const CHECK_SCRIPT_PATH = path.join(
  process.cwd(),
  "assets/source/speclite/support-skills/speclite-check-canonical-source-change/scripts/check_canonical_source_change.mjs",
);

describe("canonical source change check script", () => {
  it("reports module help drift, stale counts and incomplete hook source packages", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-canonical-check-"));

    try {
      await writeCanonicalFixture(tempRoot);

      const result = await runNode(CHECK_SCRIPT_PATH, [
        "--project-root",
        tempRoot,
        "--scope",
        "all",
        "--format",
        "json",
      ]);
      const parsed = JSON.parse(result.stdout);
      const findingIds = parsed.findings.map((finding: { id: string }) => finding.id);

      expect(result.exitCode).toBe(0);
      expect(parsed.status).toBe("warning");
      expect(parsed.counts).toMatchObject({
        core: 1,
        sdlc: 1,
        support: 1,
        hooks: 1,
        defaultInstall: {
          total: 2,
        },
      });
      expect(findingIds).toEqual(
        expect.arrayContaining([
          "module-help.missing-row",
          "manifest-schema.stale-core-sdlc-baseline",
          "docs.stale-canonical-count",
          "hook-source.missing-required-file",
        ]),
      );
      expect(parsed.recommendedCommands).toEqual(
        expect.arrayContaining([
          expect.stringContaining("check_canonical_source_change.mjs --project-root . --scope all --format json"),
        ]),
      );
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });
});

async function writeCanonicalFixture(projectRoot: string): Promise<void> {
  await mkdir(path.join(projectRoot, "assets/source/speclite/core-skills/speclite-core-one"), {
    recursive: true,
  });
  await mkdir(path.join(projectRoot, "assets/source/speclite/sdlc-skills/1-analysis/speclite-sdlc-one"), {
    recursive: true,
  });
  await mkdir(path.join(projectRoot, "assets/source/speclite/support-skills/speclite-support-one"), {
    recursive: true,
  });
  await mkdir(path.join(projectRoot, "assets/source/speclite/hooks/sample-hook"), { recursive: true });
  await mkdir(path.join(projectRoot, "src/validation/rules"), { recursive: true });
  await mkdir(path.join(projectRoot, "docs/reference"), { recursive: true });

  await writeFile(
    path.join(projectRoot, "assets/source/speclite/core-skills/module-help.csv"),
    [
      "module,skill,display-name,phase",
      "Core,_meta,,",
      "Core,speclite-core-one,Core One,anytime",
      "",
    ].join("\n"),
    "utf8",
  );
  await writeFile(
    path.join(projectRoot, "assets/source/speclite/sdlc-skills/module-help.csv"),
    ["module,skill,display-name,phase", "SDLC,_meta,,", ""].join("\n"),
    "utf8",
  );
  await writeFile(
    path.join(projectRoot, "assets/source/speclite/core-skills/speclite-core-one/SKILL.md"),
    "# Core One\n",
    "utf8",
  );
  await writeFile(
    path.join(projectRoot, "assets/source/speclite/sdlc-skills/1-analysis/speclite-sdlc-one/SKILL.md"),
    "# SDLC One\n",
    "utf8",
  );
  await writeFile(
    path.join(projectRoot, "assets/source/speclite/support-skills/speclite-support-one/SKILL.md"),
    "# Support One\n",
    "utf8",
  );
  await writeFile(
    path.join(projectRoot, "assets/source/speclite/hooks/sample-hook/hook-manifest.json"),
    JSON.stringify(
      {
        schemaVersion: "speclite.hook-source.v1",
        hookId: "sample-hook",
        runner: "runner.mjs",
      },
      null,
      2,
    ),
    "utf8",
  );
  await writeFile(
    path.join(projectRoot, "src/validation/rules/manifest-schema.ts"),
    "const CORE_SDLC_BASELINE_ENTRY_COUNT = 99;\n",
    "utf8",
  );
  await writeFile(
    path.join(projectRoot, "docs/reference/counts.md"),
    `旧 fixture 仍写着 ${staleSdlcTotal()}，并且 ${staleSupportCount()}。\n`,
    "utf8",
  );
}

function staleSdlcTotal(): string {
  return `sdlc=${44},total=${57}`;
}

function staleSupportCount(): string {
  return `Support skill package roots | ${4}`;
}

async function runNode(scriptPath: string, args: string[]): Promise<RunResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [scriptPath, ...args], {
      cwd: process.cwd(),
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += String(chunk);
    });
    child.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });
    child.on("error", reject);
    child.on("close", (exitCode) => {
      if (exitCode !== 0) {
        reject(new Error(`script exited ${String(exitCode)}: ${stderr}`));
        return;
      }
      resolve({ exitCode, stdout, stderr });
    });
  });
}

type RunResult = {
  exitCode: number | null;
  stdout: string;
  stderr: string;
};
