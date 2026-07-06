import { spawn } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
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
        ecosystems: {
          total: 3,
          packageRoots: 2,
          totalPackageRoots: 2,
          byCategory: {
            frontend: 0,
            backend: 1,
            other: 2,
          },
        },
        support: 1,
        hooks: 1,
        defaultInstall: {
          total: 2,
        },
      });
      expect(parsed.governance).toMatchObject({
        mapStatus: "loaded",
        decisionRecordRequired: false,
        governanceRunner: "speclite-canonical-source-governance-runner",
      });
      expect(parsed.recommendedSkills).toEqual(
        expect.arrayContaining([
          "speclite-canonical-source-governance-runner",
          "speclite-check-canonical-source-change",
        ]),
      );
      expect(findingIds).toEqual(
        expect.arrayContaining([
          "module-help.missing-row",
          "manifest-schema.stale-core-sdlc-baseline",
          "docs.stale-canonical-count",
          "docs.only-core-sdlc-wording",
          "docs.other-catch-all-drift",
          "ecosystem-other.banned-id",
          "hook-source.missing-required-file",
        ]),
      );
      expect(parsed.findings).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: "module-help.missing-row",
            path: "assets/source/speclite/ecosystems/backend/java-springboot/module-help.csv",
            details: expect.objectContaining({
              skillId: "speclite-java-one",
            }),
          }),
          expect.objectContaining({
            id: "ecosystem-other.banned-id",
            path: "assets/source/speclite/ecosystems/other/misc/module.yaml",
            details: expect.objectContaining({
              ecosystemId: "misc",
            }),
          }),
        ]),
      );
      expect(parsed.recommendedCommands).toEqual(
        expect.arrayContaining([
          expect.stringContaining("check_canonical_source_change.mjs --project-root . --scope all --format json"),
        ]),
      );

      const strictResult = await runNode(CHECK_SCRIPT_PATH, [
        "--project-root",
        tempRoot,
        "--scope",
        "all",
        "--format",
        "json",
        "--mode",
        "strict",
      ]);
      const strictParsed = JSON.parse(strictResult.stdout);

      expect(strictParsed.status).toBe("error");
      expect(strictParsed.mode).toBe("strict");
      expect(
        strictParsed.findings.some(
          (finding: { id: string; severity: string }) =>
            finding.id === "module-help.missing-row" && finding.severity === "error",
        ),
      ).toBe(true);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("classifies ecosystem-only changed paths with ecosystem governance followups", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-ecosystem-governance-"));

    try {
      const projectGovernanceMap = JSON.parse(
        await readFile("assets/source/speclite/canonical-governance.json", "utf8"),
      ) as Record<string, unknown>;
      await writeCanonicalFixture(tempRoot, projectGovernanceMap);
      await runCommand("git", ["init"], tempRoot);
      await runCommand("git", ["config", "user.email", "speclite-test@example.com"], tempRoot);
      await runCommand("git", ["config", "user.name", "SpecLite Test"], tempRoot);
      await runCommand("git", ["add", "."], tempRoot);
      await runCommand("git", ["commit", "-m", "baseline"], tempRoot);

      const ecosystemModulePath = path.join(
        tempRoot,
        "assets/source/speclite/ecosystems/backend/java-springboot/module.yaml",
      );
      const originalModule = await readFile(ecosystemModulePath, "utf8");
      await writeFile(ecosystemModulePath, `${originalModule}# ecosystem-only governance test\n`, "utf8");

      const result = await runNode(CHECK_SCRIPT_PATH, [
        "--project-root",
        tempRoot,
        "--scope",
        "all",
        "--format",
        "json",
      ]);
      const parsed = JSON.parse(result.stdout);

      expect(parsed.governance.changedPathCount).toBe(1);
      expect(parsed.governance.impactedClasses).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: "canonical-source-truth", determinism: "D0" }),
          expect.objectContaining({ id: "module-discovery-contract", determinism: "D0" }),
        ]),
      );
      expect(parsed.governance.triggeredRules).toContain("ecosystem-module-change");
      expect(parsed.governance.requiredFollowups).toEqual(
        expect.arrayContaining([
          "review docs/reference/skills/ecosystem-skills.md",
          "run selected ecosystem fixture tests",
          "verify release/packaging-manifest.json includes ecosystem source",
          "run speclite-skill-creator or speclite-skill-lint followups for changed ecosystem packages",
          "run canonical source checker",
          "run npm run build and npm run release:packaging-check",
        ]),
      );
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });
});

async function writeCanonicalFixture(
  projectRoot: string,
  governanceMap: Record<string, unknown> = {
    schemaVersion: "speclite.canonical-governance.v1",
    classes: [
      {
        id: "canonical-source-truth",
        title: "Canonical Source Truth",
        determinism: "D0",
        pathGlobs: ["assets/source/speclite/**"],
        requiredFollowups: ["run checker"],
      },
      {
        id: "current-public-docs",
        title: "Current Public Docs",
        determinism: "D1",
        pathGlobs: ["docs/**"],
        requiredFollowups: ["record decision"],
      },
    ],
    impactRules: [
      {
        id: "support-skill-change",
        whenChanged: ["assets/source/speclite/support-skills/**"],
        impacts: ["current-public-docs"],
        requiredFollowups: ["review support docs"],
      },
    ],
  },
): Promise<void> {
  await mkdir(path.join(projectRoot, "assets/source/speclite/core-skills/speclite-core-one"), {
    recursive: true,
  });
  await mkdir(path.join(projectRoot, "assets/source/speclite/sdlc-skills/1-analysis/speclite-sdlc-one"), {
    recursive: true,
  });
  await mkdir(path.join(projectRoot, "assets/source/speclite/support-skills/speclite-support-one"), {
    recursive: true,
  });
  await mkdir(path.join(projectRoot, "assets/source/speclite/ecosystems/backend/java-springboot/speclite-java-one"), {
    recursive: true,
  });
  await mkdir(path.join(projectRoot, "assets/source/speclite/ecosystems/other/npm-package/speclite-npm-one"), {
    recursive: true,
  });
  await mkdir(path.join(projectRoot, "assets/source/speclite/ecosystems/other/misc"), {
    recursive: true,
  });
  await mkdir(path.join(projectRoot, "assets/source/speclite/hooks/sample-hook"), { recursive: true });
  await mkdir(path.join(projectRoot, "src/validation/rules"), { recursive: true });
  await mkdir(path.join(projectRoot, "docs/reference"), { recursive: true });
  await writeFile(
    path.join(projectRoot, "assets/source/speclite/canonical-governance.json"),
    JSON.stringify(governanceMap, null, 2),
    "utf8",
  );

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
    path.join(projectRoot, "assets/source/speclite/ecosystems/backend/java-springboot/module.yaml"),
    [
      "code: ecosystem-backend-java-springboot",
      'name: "Java Spring Boot Backend"',
      "version: 1.0.0",
      'description: "Java backend ecosystem"',
      "module_kind: ecosystem",
      "ecosystem_category: backend",
      "ecosystem_id: java-springboot",
      "required_dependencies:",
      "  - sdlc",
      "default_selected: false",
      "required: false",
      "",
    ].join("\n"),
    "utf8",
  );
  await writeFile(
    path.join(projectRoot, "assets/source/speclite/ecosystems/backend/java-springboot/module-help.csv"),
    ["module,skill,display-name,phase", "Java,_meta,,", ""].join("\n"),
    "utf8",
  );
  await writeFile(
    path.join(projectRoot, "assets/source/speclite/ecosystems/other/npm-package/module.yaml"),
    [
      "code: ecosystem-other-npm-package",
      'name: "npm Package Ecosystem"',
      "version: 1.0.0",
      'description: "npm package project ecosystem"',
      "module_kind: ecosystem",
      "ecosystem_category: other",
      "ecosystem_id: npm-package",
      "required_dependencies:",
      "  - sdlc",
      "default_selected: false",
      "required: false",
      "",
    ].join("\n"),
    "utf8",
  );
  await writeFile(
    path.join(projectRoot, "assets/source/speclite/ecosystems/other/npm-package/module-help.csv"),
    [
      "module,skill,display-name,phase",
      "Other npm,_meta,,",
      "Other npm,speclite-npm-one,Npm One,5-devops",
      "",
    ].join("\n"),
    "utf8",
  );
  await writeFile(
    path.join(projectRoot, "assets/source/speclite/ecosystems/other/misc/module.yaml"),
    [
      "code: ecosystem-other-misc",
      'name: "Misc Ecosystem"',
      "version: 1.0.0",
      'description: "Banned unbounded other ecosystem"',
      "module_kind: ecosystem",
      "ecosystem_category: other",
      "ecosystem_id: misc",
      "required_dependencies:",
      "  - sdlc",
      "default_selected: false",
      "required: false",
      "",
    ].join("\n"),
    "utf8",
  );
  await writeFile(
    path.join(projectRoot, "assets/source/speclite/ecosystems/other/misc/module-help.csv"),
    ["module,skill,display-name,phase", "Misc,_meta,,", ""].join("\n"),
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
    path.join(projectRoot, "assets/source/speclite/ecosystems/backend/java-springboot/speclite-java-one/SKILL.md"),
    "# Java One\n",
    "utf8",
  );
  await writeFile(
    path.join(projectRoot, "assets/source/speclite/ecosystems/other/npm-package/speclite-npm-one/SKILL.md"),
    "# npm One\n",
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
    `旧 fixture 仍写着 ${staleSdlcTotal()}，并且 ${staleSupportCount()}。\n\n${officialOnlyCoreSdlcText()}\n\n${otherCatchAllDriftText()}\n`,
    "utf8",
  );
}

function staleSdlcTotal(): string {
  return `sdlc=${44},total=${57}`;
}

function staleSupportCount(): string {
  return `Support skill package roots | ${4}`;
}

function otherCatchAllDriftText(): string {
  return ["oth", "er is a catch", "-all bucket for miscell", "aneous tools."].join("");
}

function officialOnlyCoreSdlcText(): string {
  return ["The official source is ", "only core", "+", "sdlc."].join("");
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

async function runCommand(command: string, args: string[], cwd: string): Promise<RunResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
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
        reject(new Error(`${command} ${args.join(" ")} exited ${String(exitCode)}: ${stderr}`));
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
