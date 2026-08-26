import { spawn } from "node:child_process";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

const SCRIPT_PATH = path.join(
  process.cwd(),
  "assets/source/speclite/support-skills/speclite-skill-lint/scripts/check_skill_density.py",
);
const CR_LEAF_ROOTS = [
  "speclite-code-review-01-reviewer",
  "speclite-code-review-02-evaluator",
  "speclite-code-review-03-fixer",
  "speclite-code-review-04-rules-extractor",
  "speclite-code-review-05-todo-tracker",
  "speclite-code-review-06-finalizer",
].map((name) =>
  path.join(
    process.cwd(),
    "assets/source/speclite/sdlc-skills/4-implementation",
    name,
  ),
);

describe("Skill Workflow density script", () => {
  it("recognizes Markdown Workflow headings without truncating nested Step headings", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-density-markdown-"));

    try {
      await writeSkillPair(tempRoot, {
        chineseWorkflowHeading: "## Workflow（工作流）",
        englishWorkflowHeading: "## Workflow",
        chineseNextHeading: "## Notes（注意事项）",
        englishNextHeading: "## Notes",
      });

      const parsed = JSON.parse(await runPython(SCRIPT_PATH, tempRoot)) as DensityResult;
      expect(parsed.files).toHaveLength(2);
      for (const file of parsed.files) {
        expect(file.workflow_chars).toBeGreaterThan(1500);
        expect(file.workflow_chars).toBeLessThan(file.body_chars);
        expect(file.workflow_ratio).toBeGreaterThan(0.5);
        expect(file.triggered_density_warning).toBe(true);
      }
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("keeps bracket-style Workflow headings backward compatible", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-density-bracket-"));

    try {
      await writeSkillPair(tempRoot, {
        chineseWorkflowHeading: "[Workflow（执行流程）]",
        englishWorkflowHeading: "[Workflow]",
        chineseNextHeading: "[Notes（注意事项）]",
        englishNextHeading: "[Notes]",
      });

      const parsed = JSON.parse(await runPython(SCRIPT_PATH, tempRoot)) as DensityResult;
      expect(parsed.files.every((file) => file.workflow_chars > 1500)).toBe(true);
      expect(parsed.files.every((file) => file.triggered_density_warning)).toBe(true);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("keeps every CR01-06 bilingual entry below the Workflow density gate", async () => {
    for (const skillRoot of CR_LEAF_ROOTS) {
      const parsed = JSON.parse(await runPython(SCRIPT_PATH, skillRoot)) as DensityResult;
      expect(parsed.files).toHaveLength(2);
      for (const file of parsed.files) {
        expect(file.has_workflow_reference).toBe(true);
        expect(file.triggered_density_warning).toBe(false);
      }
    }
  });
});

interface DensityResult {
  files: Array<{
    body_chars: number;
    workflow_chars: number;
    workflow_ratio: number;
    has_workflow_reference: boolean;
    triggered_density_warning: boolean;
  }>;
}

async function writeSkillPair(
  skillRoot: string,
  headings: {
    chineseWorkflowHeading: string;
    englishWorkflowHeading: string;
    chineseNextHeading: string;
    englishNextHeading: string;
  },
) {
  await mkdir(skillRoot, { recursive: true });
  const frontmatter = "---\nname: speclite-density-fixture\n---\n\n";
  const chineseBody = [
    "## Overview（概述）",
    "简短概述。",
    headings.chineseWorkflowHeading,
    "阶段说明。".repeat(220),
    "### Step 1（步骤一）",
    "详细步骤。".repeat(220),
    headings.chineseNextHeading,
    "结束。",
  ].join("\n\n");
  const englishBody = [
    "## Overview",
    "Short overview.",
    headings.englishWorkflowHeading,
    "workflow detail ".repeat(120),
    "### Step 1",
    "nested step detail ".repeat(120),
    headings.englishNextHeading,
    "End.",
  ].join("\n\n");

  await Promise.all([
    writeFile(path.join(skillRoot, "SKILL.md"), `${frontmatter}${chineseBody}\n`, "utf8"),
    writeFile(path.join(skillRoot, "SKILL.en.md"), `${frontmatter}${englishBody}\n`, "utf8"),
  ]);
}

function runPython(scriptPath: string, skillRoot: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn("python3", [scriptPath, skillRoot], {
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
    child.on("close", (code) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(new Error(`density checker exited ${code}: ${stderr}`));
      }
    });
  });
}
