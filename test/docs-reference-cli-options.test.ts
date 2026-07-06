import { readFile } from "node:fs/promises";
import type { Command } from "commander";
import { describe, expect, it } from "vitest";
import { createSpecliteProgram } from "../src/bin/speclite.js";

describe("docs/reference CLI option parity", () => {
  it("keeps documented core command options aligned with CLI help", async () => {
    const reference = await readFile("docs/reference/cli.md", "utf8");
    const program = createSpecliteProgram();
    const cases = [
      { command: "init", heading: "Init" },
      { command: "list", heading: "List" },
      { command: "status", heading: "Status" },
      { command: "validate", heading: "Validate" },
    ];

    for (const item of cases) {
      expect(documentedOptionsFor(reference, item.heading), item.command).toEqual(
        cliHelpOptionsFor(program, item.command),
      );
    }
  });

  it("keeps ecosystem install boundaries and maintainer workflow documented", async () => {
    const [
      readme,
      quickStart,
      tutorialQuickStart,
      installHowTo,
      runtimeLayout,
      canonicalSourceLayout,
      moduleExplanation,
      workflowExplanation,
      skillsIndex,
      sdlcWorkflows,
      ecosystemSkills,
      supportSkills,
      sourceReadme,
      sourceReadmeEn,
      governance,
    ] = await Promise.all(
      [
        "README.md",
        "docs/quick-start.md",
        "docs/tutorials/quick-start.md",
        "docs/how-to/install-speclite.md",
        "docs/reference/runtime-layout.md",
        "docs/reference/canonical-source-layout.md",
        "docs/explanation/speclite-modules.md",
        "docs/explanation/speclite-workflows.md",
        "docs/reference/skills/index.md",
        "docs/reference/skills/sdlc-workflows.md",
        "docs/reference/skills/ecosystem-skills.md",
        "docs/reference/skills/support-skills.md",
        "assets/source/speclite/README.md",
        "assets/source/speclite/README.en.md",
        "docs/reference/canonical-source-governance.md",
      ].map((filePath) => readFile(filePath, "utf8")),
    );
    const userDocs = [readme, quickStart, tutorialQuickStart, installHowTo].join("\n");
    const referenceDocs = [runtimeLayout, canonicalSourceLayout, moduleExplanation].join("\n");
    const catalogDocs = [skillsIndex, ecosystemSkills, supportSkills].join("\n");
    const sourceDocs = [sourceReadme, sourceReadmeEn].join("\n");
    const migratedBackendPackageIds = [
      "speclite-brownfield-java-springboot-backend-tech-stack-digger",
      "speclite-brownfield-nodejs-backend-tech-stack-digger",
      "speclite-brownfield-python-backend-tech-stack-digger",
    ];

    expect(userDocs).toContain("optional ecosystem modules");
    expect(userDocs).toContain("ecosystem category -> id");
    expect(userDocs).toContain("`--yes`、`--json`、default no-prompt");
    expect(userDocs).toContain("不是项目依赖安装器");
    expect(userDocs).toContain("不会安装 React / Vue / Java / npm package runtime dependencies");
    expect(referenceDocs).toContain("selected module truth");
    expect(referenceDocs).toContain("unselected ecosystem modules");
    expect(catalogDocs).toContain("ecosystem-skills.md");
    expect(catalogDocs).toContain("creator / lint -> `module.yaml` / `module-help.csv` -> canonical source check -> fixtures -> build / tests / packaging check");
    expect(sourceDocs).toContain("creator / lint -> `module.yaml` / `module-help.csv` -> canonical source check -> fixtures -> build / tests / packaging check");
    expect(governance).toContain("build-first");
    expect(governance).toContain("packaging-last");
    for (const packageId of migratedBackendPackageIds) {
      expect(sdlcWorkflows).not.toContain(packageId);
      expect(canonicalSourceLayout).not.toContain(packageId);
      expect(workflowExplanation).not.toContain(packageId);
      expect(ecosystemSkills).toContain(packageId);
    }
  });
});

function documentedOptionsFor(reference: string, heading: string): string[] {
  const section = new RegExp(`^## ${heading} Options[^\\n]*\\n([\\s\\S]*?)(?=^## )`, "m").exec(reference)?.[1];
  if (section === undefined) {
    throw new Error(`Missing ${heading} Options section in docs/reference/cli.md`);
  }

  return Array.from(section.matchAll(/^\| `([^`]+)` \|/gm), ([, option]) => option).sort();
}

function cliHelpOptionsFor(program: Command, commandName: string): string[] {
  const command = program.commands.find((candidate) => candidate.name() === commandName);
  if (command === undefined) {
    throw new Error(`Missing ${commandName} command in CLI program`);
  }

  return Array.from(command.helpInformation().matchAll(/^\s{2}(--[\w-]+(?: <[^>]+>)?)/gm), ([, option]) =>
    option.trim(),
  ).sort();
}
