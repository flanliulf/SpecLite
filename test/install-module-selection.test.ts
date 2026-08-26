import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { runInstallCommand } from "../src/commands/install.js";
import { runStatusCommand } from "../src/commands/status.js";
import { runValidateCommand } from "../src/commands/validate.js";

const supportedRuntime = {
  nodeVersion: "v22.12.0",
  platform: "darwin",
  platformRelease: "23.0.0",
} as const;

describe("install official module selection orchestration", () => {
  it("stops before source discovery until the target confirmation gate is passed", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-install-pending-source-"));

    try {
      const outcome = await runInstallCommand({
        options: { json: true },
        runtime: {
          ...supportedRuntime,
          cwd: tempRoot,
        },
      });

      expect(outcome.exitCode).toBe(0);
      expect(outcome.result.data.sourceDescriptor).toMatchObject({
        sourceType: "bundled",
        trustStatus: "blocked",
        integrityEvidence: [],
      });
      expect(outcome.result.data.completedSteps).not.toContain("source-discovery");
      expect(outcome.result.data.pendingSteps).toContain("source-discovery");

      await assertNoInstallWrites(tempRoot);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("selects default official modules after --yes and writes the confirmed install shape", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-install-module-summary-"));

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
      expect(outcome.result.status).toBe("success");
      expect(outcome.result.summary).toContain("Selected modules: core");
      expect(outcome.result.summary).toContain("sdlc");
      expect(outcome.result.summary).toContain("Canonical package roots: core=18, sdlc=50, total=68.");
      expect(outcome.result.summary).toContain("Source: bundled assets/source/speclite");
      expect(outcome.result.summary).toContain("Final configuration summary");
      expect(outcome.result.data.sourceDescriptor).toMatchObject({
        sourceType: "bundled",
        resolvedRoot: "assets/source/speclite",
        trustStatus: "trusted",
      });
      expect(outcome.result.data.installedModules).toEqual(["core", "sdlc"]);
      expect(outcome.result.data.completedSteps).toEqual([
        "source-discovery",
        "module-selection",
        "config-initialization",
        "runtime-structure",
        "ide-mirror-creation",
        "manifest-generation",
        "ready-check",
        "ready-summary",
      ]);
      expect(outcome.result.data.pendingSteps).toEqual([]);
      expect(outcome.installPlan).toMatchObject({
        selectedModules: ["core", "sdlc"],
        targetAdapters: [
          { targetId: "claude", targetDirectory: ".claude/skills", status: "planned" },
          { targetId: "agents", targetDirectory: ".agents/skills", status: "planned" },
        ],
        externalAccesses: [],
        plannedWrites: [
          expect.objectContaining({ path: "_speclite/config.toml", action: "create" }),
          expect.objectContaining({ path: "_speclite/config.user.toml", action: "create" }),
          expect.objectContaining({ path: "_speclite/custom/config.toml", action: "create" }),
          expect.objectContaining({ path: "_speclite/custom/config.user.toml", action: "create" }),
          expect.objectContaining({ path: ".gitignore", action: "create" }),
        ],
        requiresConfirmation: true,
        writeAuthorized: true,
      });
      expect(JSON.stringify(outcome.result)).not.toContain(tempRoot);
      expect(JSON.stringify(outcome.result)).not.toContain("selectedModules");

      await expect(readFile(path.join(tempRoot, "_speclite/_config/manifest.yaml"), "utf8")).resolves.toContain(
        "speclite.manifest.v1",
      );
      await expect(
        readFile(
          path.join(
            tempRoot,
            ".claude/skills/speclite-brownfield-java-springboot-backend-tech-stack-digger/SKILL.md",
          ),
          "utf8",
        ),
      ).rejects.toMatchObject({ code: "ENOENT" });
      await expect(
        readFile(
          path.join(tempRoot, ".claude/skills/speclite-react-project-context-and-review/SKILL.md"),
          "utf8",
        ),
      ).rejects.toMatchObject({ code: "ENOENT" });
      await expect(
        readFile(
          path.join(tempRoot, ".agents/skills/speclite-vue-project-context-and-review/SKILL.md"),
          "utf8",
        ),
      ).rejects.toMatchObject({ code: "ENOENT" });
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("shows canonical package root counts in the pre-write install scope prompt", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-install-prewrite-scope-"));
    let prewritePrompt = "";
    let finalPrewritePrompt = "";

    try {
      await writeFile(path.join(tempRoot, "README.md"), "project notes\n", "utf8");

      const outcome = await runInstallCommand({
        options: { yes: true },
        runtime: {
          ...supportedRuntime,
          cwd: tempRoot,
        },
        configureProject: async (input) => {
          prewritePrompt = input.prompt;
          expect(input.selectedModuleIds).toEqual(["core", "sdlc"]);
          expect(input.targetAdapters.map((adapter) => adapter.targetId)).toEqual(["claude", "agents"]);
          expect(input.prompt).toContain("Selected modules: core");
          expect(input.prompt).toContain("sdlc");
          expect(input.prompt).toContain("Canonical package roots: core=18, sdlc=50, total=68.");
          expect(input.prompt).toContain("Pending: runtime structure creation, IDE mirror creation, manifest/index generation, ReadyCheck and ready summary have not happened.");
          expect(input.prompt).toContain("No project files were changed.");
          await assertNoInstallWrites(tempRoot);

          return { mode: "quick" };
        },
        confirmPrewriteInstallScope: async (input) => {
          finalPrewritePrompt = input.prompt;
          expect(input.prompt).toContain("sdlc (SpecLite SDLC Module 0.0.0)");
          expect(input.prompt).toContain("IDE targets\nclaude (.claude/skills), agents (.agents/skills)");
          expect(input.prompt).toContain(
            "Write boundary\nconfirmationWillWrite=_speclite/, _speclite-output/, IDE mirrors, manifest/index",
          );
        },
      });

      expect(outcome.exitCode).toBe(0);
      expect(prewritePrompt).toContain("Source: bundled assets/source/speclite.");
      expect(finalPrewritePrompt).toContain("Selected modules");
      await expect(readFile(path.join(tempRoot, "_speclite/config.toml"), "utf8")).resolves.toContain("[core]");
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("confirms final pre-write install scope after detailed config changes selected modules", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-install-final-prewrite-scope-"));
    let finalPrewritePrompt = "";

    try {
      await writeFile(path.join(tempRoot, "README.md"), "project notes\n", "utf8");

      const outcome = await runInstallCommand({
        options: { yes: true },
        runtime: {
          ...supportedRuntime,
          cwd: tempRoot,
        },
        configureProject: async () => ({
          mode: "detailed",
          selectedModuleIds: ["core"],
        }),
        confirmPrewriteInstallScope: async (input) => {
          finalPrewritePrompt = input.prompt;
          expect(input.prompt).toContain("Step 3/4 Final pre-write review");
          expect(input.prompt).toContain("sourceType=bundled");
          expect(input.prompt).toContain("resolvedRoot=assets/source/speclite");
          expect(input.prompt).toContain("trustStatus=trusted");
          expect(input.prompt).toContain("mode=detailed");
          expect(input.prompt).toContain("Config values");
          expect(input.prompt).toContain("Project name: speclite-install-final-prewrite-scope-");
          expect(input.prompt).toContain("User display name: SpecLite");
          expect(input.prompt).toContain("Languages: communication=Chinese, document=Chinese");
          expect(input.prompt).toContain("Artifact root: _speclite-output");
          expect(input.prompt).toContain("core (SpecLite Core Module 0.0.0)");
          expect(input.prompt).not.toContain("Selected modules: core (SpecLite Core Module 0.0.0), sdlc");
          expect(input.prompt).toContain("canonicalPackageRoots=core=18, total=18");
          expect(input.prompt).not.toContain("canonicalPackageRoots=core=18, sdlc=50, total=68");
          expect(input.prompt).toContain("capabilityScope=core:");
          expect(input.prompt).toContain("Planned writes");
          expect(input.prompt).toContain("_speclite/config.toml=create");
          expect(input.prompt).toContain("Pending phases");
          expect(input.prompt).toContain("projectFilesWritten=false");
          await assertNoInstallWrites(tempRoot);
        },
      });

      expect(outcome.exitCode).toBe(0);
      expect(outcome.installPlan?.selectedModules).toEqual(["core"]);
      expect(outcome.result.data.installedModules).toEqual(["core"]);
      expect(outcome.result.summary).toContain("Canonical package roots: core=18, total=18.");
      expect(finalPrewritePrompt).toContain("core (SpecLite Core Module 0.0.0)");
      const configToml = await readFile(path.join(tempRoot, "_speclite/config.toml"), "utf8");
      expect(configToml).toContain("[core]");
      expect(configToml).not.toContain("[modules.sdlc]");
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("accepts multiple interactive module ids without adding public selection fields", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-install-module-multiselect-"));

    try {
      await writeFile(path.join(tempRoot, "README.md"), "project notes\n", "utf8");

      const outcome = await runInstallCommand({
        options: { yes: true },
        runtime: {
          ...supportedRuntime,
          cwd: tempRoot,
        },
        selectModuleIds: async (input) => {
          expect(input.ecosystemCategories).toEqual([
            {
              category: "backend",
              ecosystemIds: [
                {
                  id: "java-springboot",
                  moduleCode: "ecosystem-backend-java-springboot",
                  name: "Java Spring Boot Backend Ecosystem",
                },
                {
                  id: "nodejs",
                  moduleCode: "ecosystem-backend-nodejs",
                  name: "Node.js Backend Ecosystem",
                },
                {
                  id: "python",
                  moduleCode: "ecosystem-backend-python",
                  name: "Python Backend Ecosystem",
                },
              ],
            },
            {
              category: "frontend",
              ecosystemIds: [
                {
                  id: "react",
                  moduleCode: "ecosystem-frontend-react",
                  name: "React Frontend Ecosystem",
                },
                {
                  id: "vue",
                  moduleCode: "ecosystem-frontend-vue",
                  name: "Vue Frontend Ecosystem",
                },
              ],
            },
            {
              category: "other",
              ecosystemIds: [
                {
                  id: "cli-tool",
                  moduleCode: "ecosystem-other-cli-tool",
                  name: "CLI Tool Ecosystem",
                },
                {
                  id: "documentation-only",
                  moduleCode: "ecosystem-other-documentation-only",
                  name: "Documentation-only Project Ecosystem",
                },
                {
                  id: "npm-package",
                  moduleCode: "ecosystem-other-npm-package",
                  name: "npm Package Ecosystem",
                },
              ],
            },
          ]);
          return ["sdlc", "core"];
        },
      });

      expect(outcome.exitCode).toBe(0);
      expect(outcome.installPlan?.selectedModules).toEqual(["core", "sdlc"]);
      expect(outcome.result.summary).toContain("Selected modules: core");
      expect(outcome.result.summary).toContain("sdlc");
      expect(JSON.stringify(outcome.result)).not.toContain("selectedModules");

      await expect(readFile(path.join(tempRoot, "_speclite/config.toml"), "utf8")).resolves.toContain("[core]");
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("installs only the selected backend ecosystem module and its dependencies", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-install-selected-ecosystem-"));

    try {
      await writeFile(path.join(tempRoot, "README.md"), "project notes\n", "utf8");

      const outcome = await runInstallCommand({
        options: { yes: true },
        runtime: {
          ...supportedRuntime,
          cwd: tempRoot,
        },
        selectModuleIds: async (input) => {
          expect(input.ecosystemCategories[0]?.category).toBe("backend");
          return ["ecosystem-backend-java-springboot"];
        },
      });

      expect(outcome.exitCode).toBe(0);
      expect(outcome.installPlan?.selectedModules).toEqual([
        "core",
        "ecosystem-backend-java-springboot",
        "sdlc",
      ]);
      expect(outcome.result.data.installedModules).toEqual([
        "core",
        "ecosystem-backend-java-springboot",
        "sdlc",
      ]);
      expect(outcome.result.summary).toContain(
        "Canonical package roots: core=18, ecosystem-backend-java-springboot=1, sdlc=50, total=69.",
      );

      await expect(
        readFile(
          path.join(
            tempRoot,
            ".claude/skills/speclite-brownfield-java-springboot-backend-tech-stack-digger/SKILL.md",
          ),
          "utf8",
        ),
      ).resolves.toContain("Java");
      await expect(
        readFile(
          path.join(
            tempRoot,
            ".agents/skills/speclite-brownfield-java-springboot-backend-tech-stack-digger/SKILL.md",
          ),
          "utf8",
        ),
      ).resolves.toContain("Java");
      await expect(
        readFile(
          path.join(tempRoot, ".claude/skills/speclite-brownfield-nodejs-backend-tech-stack-digger/SKILL.md"),
          "utf8",
        ),
      ).rejects.toMatchObject({ code: "ENOENT" });
      await expect(
        readFile(
          path.join(tempRoot, ".agents/skills/speclite-brownfield-python-backend-tech-stack-digger/SKILL.md"),
          "utf8",
        ),
      ).rejects.toMatchObject({ code: "ENOENT" });

      const skillIndex = JSON.parse(
        await readFile(path.join(tempRoot, "_speclite/_config/skill-index.json"), "utf8"),
      );
      const filesIndex = JSON.parse(
        await readFile(path.join(tempRoot, "_speclite/_config/files-index.json"), "utf8"),
      );
      const helpIndex = JSON.parse(
        await readFile(path.join(tempRoot, "_speclite/_config/help-index.json"), "utf8"),
      );
      const phaseCoverage = JSON.parse(
        await readFile(path.join(tempRoot, "_speclite/_config/phase-coverage.json"), "utf8"),
      );
      const serializedInstalledState = JSON.stringify({
        skillIndex,
        filesIndex,
        helpIndex,
        phaseCoverage,
      });

      expect(serializedInstalledState).toContain("speclite-brownfield-java-springboot-backend-tech-stack-digger");
      expect(serializedInstalledState).not.toContain("speclite-brownfield-nodejs-backend-tech-stack-digger");
      expect(serializedInstalledState).not.toContain("speclite-brownfield-python-backend-tech-stack-digger");
      expect(serializedInstalledState).not.toContain("speclite-react-project-context-and-review");
      expect(serializedInstalledState).not.toContain("speclite-vue-project-context-and-review");

      const statusOutcome = await runStatusCommand({
        runtime: { cwd: tempRoot, targetProject: "selected-ecosystem" },
      });
      const validateOutcome = await runValidateCommand({
        runtime: { cwd: tempRoot, targetProject: "selected-ecosystem" },
      });

      expect(statusOutcome.exitCode).toBe(0);
      expect(statusOutcome.result.data.installedModules).toEqual([
        "core",
        "ecosystem-backend-java-springboot",
        "sdlc",
      ]);
      expect(JSON.stringify(statusOutcome.result)).not.toContain("ecosystem-backend-nodejs");
      expect(validateOutcome.result.data.checkedCategories).toContain("manifest-schema");
      expect(JSON.stringify(validateOutcome.result)).not.toContain(
        "speclite-brownfield-python-backend-tech-stack-digger",
      );
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("installs only the selected React frontend ecosystem module and its dependencies", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-install-selected-react-"));

    try {
      await writeFile(path.join(tempRoot, "README.md"), "project notes\n", "utf8");

      const outcome = await runInstallCommand({
        options: { yes: true },
        runtime: {
          ...supportedRuntime,
          cwd: tempRoot,
        },
        selectModuleIds: async (input) => {
          const frontend = input.ecosystemCategories.find((group) => group.category === "frontend");
          expect(frontend?.ecosystemIds.map((entry) => entry.id)).toEqual(["react", "vue"]);
          return ["ecosystem-frontend-react"];
        },
      });

      expect(outcome.exitCode).toBe(0);
      expect(outcome.installPlan?.selectedModules).toEqual([
        "core",
        "ecosystem-frontend-react",
        "sdlc",
      ]);
      expect(outcome.result.data.installedModules).toEqual([
        "core",
        "ecosystem-frontend-react",
        "sdlc",
      ]);
      expect(outcome.result.summary).toContain(
        "Canonical package roots: core=18, ecosystem-frontend-react=1, sdlc=50, total=69.",
      );

      await expect(
        readFile(path.join(tempRoot, ".claude/skills/speclite-react-project-context-and-review/SKILL.md"), "utf8"),
      ).resolves.toContain("React");
      await expect(
        readFile(path.join(tempRoot, ".agents/skills/speclite-react-project-context-and-review/SKILL.md"), "utf8"),
      ).resolves.toContain("React");
      await expect(
        readFile(path.join(tempRoot, ".claude/skills/speclite-vue-project-context-and-review/SKILL.md"), "utf8"),
      ).rejects.toMatchObject({ code: "ENOENT" });
      await expect(
        readFile(
          path.join(tempRoot, ".agents/skills/speclite-brownfield-java-springboot-backend-tech-stack-digger/SKILL.md"),
          "utf8",
        ),
      ).rejects.toMatchObject({ code: "ENOENT" });

      const skillIndex = JSON.parse(
        await readFile(path.join(tempRoot, "_speclite/_config/skill-index.json"), "utf8"),
      );
      const filesIndex = JSON.parse(
        await readFile(path.join(tempRoot, "_speclite/_config/files-index.json"), "utf8"),
      );
      const helpIndex = JSON.parse(
        await readFile(path.join(tempRoot, "_speclite/_config/help-index.json"), "utf8"),
      );
      const phaseCoverage = JSON.parse(
        await readFile(path.join(tempRoot, "_speclite/_config/phase-coverage.json"), "utf8"),
      );
      const serializedInstalledState = JSON.stringify({
        skillIndex,
        filesIndex,
        helpIndex,
        phaseCoverage,
      });

      expect(serializedInstalledState).toContain("speclite-react-project-context-and-review");
      expect(serializedInstalledState).not.toContain("speclite-vue-project-context-and-review");
      expect(serializedInstalledState).not.toContain("speclite-brownfield-nodejs-backend-tech-stack-digger");
      expect(serializedInstalledState).not.toContain("speclite-brownfield-python-backend-tech-stack-digger");

      const validateOutcome = await runValidateCommand({
        runtime: { cwd: tempRoot, targetProject: "selected-frontend-ecosystem" },
      });

      expect(validateOutcome.result.data.checkedCategories).toContain("manifest-schema");
      expect(validateOutcome.result.issues.filter((issue) => issue.category === "manifest-schema")).toEqual([]);
      expect(JSON.stringify(validateOutcome.result)).not.toContain("ecosystem-frontend-vue");
      expect(JSON.stringify(validateOutcome.result)).not.toContain("ecosystem-backend-java-springboot");
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("installs only the selected Vue frontend ecosystem module and its dependencies", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-install-selected-vue-"));

    try {
      await writeFile(path.join(tempRoot, "README.md"), "project notes\n", "utf8");

      const outcome = await runInstallCommand({
        options: { yes: true },
        runtime: {
          ...supportedRuntime,
          cwd: tempRoot,
        },
        selectModuleIds: async (input) => {
          const frontend = input.ecosystemCategories.find((group) => group.category === "frontend");
          expect(frontend?.ecosystemIds.map((entry) => entry.id)).toEqual(["react", "vue"]);
          return ["ecosystem-frontend-vue"];
        },
      });

      expect(outcome.exitCode).toBe(0);
      expect(outcome.installPlan?.selectedModules).toEqual([
        "core",
        "ecosystem-frontend-vue",
        "sdlc",
      ]);
      expect(outcome.result.data.installedModules).toEqual([
        "core",
        "ecosystem-frontend-vue",
        "sdlc",
      ]);
      expect(outcome.result.summary).toContain(
        "Canonical package roots: core=18, ecosystem-frontend-vue=1, sdlc=50, total=69.",
      );

      await expect(
        readFile(path.join(tempRoot, ".claude/skills/speclite-vue-project-context-and-review/SKILL.md"), "utf8"),
      ).resolves.toContain("Vue");
      await expect(
        readFile(path.join(tempRoot, ".agents/skills/speclite-vue-project-context-and-review/SKILL.md"), "utf8"),
      ).resolves.toContain("Vue");
      await expect(
        readFile(path.join(tempRoot, ".agents/skills/speclite-react-project-context-and-review/SKILL.md"), "utf8"),
      ).rejects.toMatchObject({ code: "ENOENT" });
      await expect(
        readFile(
          path.join(tempRoot, ".claude/skills/speclite-brownfield-python-backend-tech-stack-digger/SKILL.md"),
          "utf8",
        ),
      ).rejects.toMatchObject({ code: "ENOENT" });

      const skillIndex = JSON.parse(
        await readFile(path.join(tempRoot, "_speclite/_config/skill-index.json"), "utf8"),
      );
      const filesIndex = JSON.parse(
        await readFile(path.join(tempRoot, "_speclite/_config/files-index.json"), "utf8"),
      );
      const helpIndex = JSON.parse(
        await readFile(path.join(tempRoot, "_speclite/_config/help-index.json"), "utf8"),
      );
      const phaseCoverage = JSON.parse(
        await readFile(path.join(tempRoot, "_speclite/_config/phase-coverage.json"), "utf8"),
      );
      const serializedInstalledState = JSON.stringify({
        skillIndex,
        filesIndex,
        helpIndex,
        phaseCoverage,
      });

      expect(serializedInstalledState).toContain("speclite-vue-project-context-and-review");
      expect(serializedInstalledState).not.toContain("speclite-react-project-context-and-review");
      expect(serializedInstalledState).not.toContain("speclite-brownfield-java-springboot-backend-tech-stack-digger");
      expect(serializedInstalledState).not.toContain("speclite-brownfield-nodejs-backend-tech-stack-digger");
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("installs only the selected npm package other ecosystem module and its dependencies", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-install-selected-npm-package-"));

    try {
      await writeFile(path.join(tempRoot, "README.md"), "project notes\n", "utf8");

      const outcome = await runInstallCommand({
        options: { yes: true },
        runtime: {
          ...supportedRuntime,
          cwd: tempRoot,
        },
        selectModuleIds: async (input) => {
          const other = input.ecosystemCategories.find((group) => group.category === "other");
          expect(other?.ecosystemIds.map((entry) => entry.id)).toEqual([
            "cli-tool",
            "documentation-only",
            "npm-package",
          ]);
          return ["ecosystem-other-npm-package"];
        },
      });

      expect(outcome.exitCode).toBe(0);
      expect(outcome.installPlan?.selectedModules).toEqual([
        "core",
        "ecosystem-other-npm-package",
        "sdlc",
      ]);
      expect(outcome.result.data.installedModules).toEqual([
        "core",
        "ecosystem-other-npm-package",
        "sdlc",
      ]);
      expect(outcome.result.summary).toContain(
        "Canonical package roots: core=18, ecosystem-other-npm-package=1, sdlc=50, total=69.",
      );

      await expect(
        readFile(path.join(tempRoot, ".claude/skills/speclite-npm-package-project-auditor/SKILL.md"), "utf8"),
      ).resolves.toContain("package.json");
      await expect(
        readFile(path.join(tempRoot, ".agents/skills/speclite-npm-package-project-auditor/SKILL.md"), "utf8"),
      ).resolves.toContain("tarball");
      await expect(
        readFile(path.join(tempRoot, ".claude/skills/speclite-cli-tool-contract-auditor/SKILL.md"), "utf8"),
      ).rejects.toMatchObject({ code: "ENOENT" });
      await expect(
        readFile(
          path.join(tempRoot, ".agents/skills/speclite-documentation-only-project-auditor/SKILL.md"),
          "utf8",
        ),
      ).rejects.toMatchObject({ code: "ENOENT" });
      await expect(
        readFile(path.join(tempRoot, ".claude/skills/speclite-react-project-context-and-review/SKILL.md"), "utf8"),
      ).rejects.toMatchObject({ code: "ENOENT" });
      await expect(
        readFile(
          path.join(tempRoot, ".agents/skills/speclite-brownfield-java-springboot-backend-tech-stack-digger/SKILL.md"),
          "utf8",
        ),
      ).rejects.toMatchObject({ code: "ENOENT" });

      const skillIndex = JSON.parse(
        await readFile(path.join(tempRoot, "_speclite/_config/skill-index.json"), "utf8"),
      );
      const filesIndex = JSON.parse(
        await readFile(path.join(tempRoot, "_speclite/_config/files-index.json"), "utf8"),
      );
      const helpIndex = JSON.parse(
        await readFile(path.join(tempRoot, "_speclite/_config/help-index.json"), "utf8"),
      );
      const phaseCoverage = JSON.parse(
        await readFile(path.join(tempRoot, "_speclite/_config/phase-coverage.json"), "utf8"),
      );
      const serializedInstalledState = JSON.stringify({
        skillIndex,
        filesIndex,
        helpIndex,
        phaseCoverage,
      });

      expect(serializedInstalledState).toContain("speclite-npm-package-project-auditor");
      expect(serializedInstalledState).not.toContain("speclite-cli-tool-contract-auditor");
      expect(serializedInstalledState).not.toContain("speclite-documentation-only-project-auditor");
      expect(serializedInstalledState).not.toContain("speclite-react-project-context-and-review");
      expect(serializedInstalledState).not.toContain("speclite-brownfield-nodejs-backend-tech-stack-digger");

      const validateOutcome = await runValidateCommand({
        runtime: { cwd: tempRoot, targetProject: "selected-other-ecosystem" },
      });

      expect(validateOutcome.result.data.checkedCategories).toContain("manifest-schema");
      expect(validateOutcome.result.issues.filter((issue) => issue.category === "manifest-schema")).toEqual([]);
      expect(JSON.stringify(validateOutcome.result)).not.toContain("ecosystem-other-cli-tool");
      expect(JSON.stringify(validateOutcome.result)).not.toContain("ecosystem-frontend-react");
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("allows interactive selection to cancel default modules while keeping required modules", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-install-module-core-only-"));

    try {
      await writeFile(path.join(tempRoot, "README.md"), "project notes\n", "utf8");

      const outcome = await runInstallCommand({
        options: { yes: true },
        runtime: {
          ...supportedRuntime,
          cwd: tempRoot,
        },
        selectModuleIds: async () => ["core"],
      });

      expect(outcome.exitCode).toBe(0);
      expect(outcome.installPlan?.selectedModules).toEqual(["core"]);
      expect(outcome.result.summary).toContain("Selected modules: core");
      expect(outcome.result.summary).not.toContain("sdlc (");

      await expect(readFile(path.join(tempRoot, "_speclite/config.toml"), "utf8")).resolves.toContain("[core]");
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("returns a stable diagnostic for invalid interactive module ids", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-install-module-invalid-"));

    try {
      await writeFile(path.join(tempRoot, "README.md"), "project notes\n", "utf8");

      const outcome = await runInstallCommand({
        options: { yes: true },
        runtime: {
          ...supportedRuntime,
          cwd: tempRoot,
        },
        selectModuleIds: async () => ["missing-module"],
      });

      expect(outcome.exitCode).toBe(1);
      expect(outcome.installPlan).toBeUndefined();
      expect(outcome.result.issues).toEqual([
        expect.objectContaining({
          issueId: "source-integrity.unsupported-source",
          category: "source-integrity",
          severity: "error",
          details: { invalidModuleIds: ["missing-module"] },
        }),
      ]);
      expect(outcome.result.summary).toContain("unknown module ids");

      await assertNoInstallWrites(tempRoot);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("maps unknown required module dependencies to install failure diagnostics", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-install-unknown-dependency-"));

    try {
      await writeFile(
        path.join(tempRoot, "package-lock.json"),
        JSON.stringify({
          name: "speclite",
          version: "0.0.0",
          packages: {
            "": {
              name: "speclite",
              version: "0.0.0",
            },
          },
        }),
        "utf8",
      );
      await writeModuleFixture(tempRoot, {
        "sdlc/module.yaml": [
          "code: sdlc",
          'name: "SDLC"',
          "version: 1.0.0",
          'description: "SDLC"',
          "required_dependencies:",
          "  - missing-core",
          "",
        ].join("\n"),
        "sdlc/module-help.csv": "module,skill,display-name\nSDLC,_meta,\n",
        "sdlc/sdlc-skill/SKILL.md": "# SDLC\n",
      });

      const outcome = await runInstallCommand({
        options: { yes: true },
        projectRoot: tempRoot,
        runtime: {
          ...supportedRuntime,
          cwd: tempRoot,
        },
      });

      expect(outcome.exitCode).toBe(1);
      expect(outcome.result.issues).toEqual([
        expect.objectContaining({
          issueId: "source-integrity.unsupported-source",
          category: "source-integrity",
          severity: "error",
          details: {
            reason: "module-metadata.unknown-required-dependency",
          },
        }),
      ]);
      expect(outcome.result.summary).toContain("official modules could not be discovered");

      await assertNoInstallWrites(tempRoot);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("maps orphan module-help.csv skill references to install failure diagnostics", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-install-orphan-help-"));

    try {
      await writeFile(
        path.join(tempRoot, "package-lock.json"),
        JSON.stringify({
          name: "speclite",
          version: "0.0.0",
          packages: {
            "": {
              name: "speclite",
              version: "0.0.0",
            },
          },
        }),
        "utf8",
      );
      await writeModuleFixture(tempRoot, {
        "sdlc/module.yaml": [
          "code: sdlc",
          'name: "SDLC"',
          "version: 1.0.0",
          'description: "SDLC"',
          "",
        ].join("\n"),
        "sdlc/module-help.csv": [
          "module,skill,display-name,phase",
          "SDLC,_meta,,",
          "SDLC,missing-skill,Missing Skill,4-implementation",
          "SDLC,sdlc-skill,SDLC Skill,4-implementation",
          "",
        ].join("\n"),
        "sdlc/sdlc-skill/SKILL.md": "# SDLC\n",
      });

      const outcome = await runInstallCommand({
        options: { yes: true },
        projectRoot: tempRoot,
        runtime: {
          ...supportedRuntime,
          cwd: tempRoot,
        },
      });

      expect(outcome.exitCode).toBe(1);
      expect(outcome.result.issues).toEqual([
        expect.objectContaining({
          issueId: "menu-target.unknown-skill",
          category: "menu-target",
          severity: "error",
          details: {
            reason: "module-metadata.unknown-help-skill",
          },
        }),
      ]);
      expect(outcome.result.summary).toContain("official modules could not be discovered");

      await assertNoInstallWrites(tempRoot);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("keeps existing-install branch out of fresh module selection", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-install-existing-no-selection-"));

    try {
      await mkdir(path.join(tempRoot, "_speclite/_config"), { recursive: true });

      const outcome = await runInstallCommand({
        options: { json: true, yes: true },
        runtime: {
          ...supportedRuntime,
          cwd: tempRoot,
        },
      });

      expect(outcome.result.data.completedSteps).not.toContain("source-discovery");
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });
});

async function assertNoInstallWrites(projectRoot: string): Promise<void> {
  for (const forbiddenPath of [
    "_speclite",
    "_speclite-output",
    ".claude/skills",
    ".agents/skills",
    "_speclite/_config/manifest.yaml",
    "_speclite/config.toml",
    "_speclite/config.user.toml",
  ]) {
    await expect(readFile(path.join(projectRoot, forbiddenPath), "utf8")).rejects.toMatchObject({
      code: "ENOENT",
    });
  }
}

async function writeModuleFixture(projectRoot: string, files: Record<string, string>): Promise<void> {
  const sourceRoot = path.join(projectRoot, "assets/source/speclite");

  for (const [relativePath, contents] of Object.entries(files)) {
    const filePath = path.join(sourceRoot, relativePath);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, contents, "utf8");
  }
}
