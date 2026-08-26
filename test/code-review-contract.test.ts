import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

const IMPLEMENTATION_ROOT = path.join(
  process.cwd(),
  "assets/source/speclite/sdlc-skills/4-implementation",
);
const CONTRACT_REFERENCE =
  "{skills-root}/speclite-code-review-contract/references/cr-contract.md";
const LEAF_IDS = [
  "speclite-code-review-01-reviewer",
  "speclite-code-review-02-evaluator",
  "speclite-code-review-03-fixer",
  "speclite-code-review-04-rules-extractor",
  "speclite-code-review-05-todo-tracker",
  "speclite-code-review-06-finalizer",
] as const;
const CONSUMER_IDS = [
  ...LEAF_IDS,
  "speclite-goal-orchestrator-epic-story-code-review-runner",
] as const;
const WORKFLOW_REFERENCES = {
  "speclite-code-review-01-reviewer": "references/reviewer-workflow.md",
  "speclite-code-review-02-evaluator": "references/evaluator-workflow.md",
  "speclite-code-review-03-fixer": "references/fixer-workflow.md",
  "speclite-code-review-04-rules-extractor": "references/rules-extractor-workflow.md",
  "speclite-code-review-05-todo-tracker": "references/todo-tracker-workflow.md",
  "speclite-code-review-06-finalizer": "references/finalizer-workflow.md",
} as const;

describe("CR shared contract ownership", () => {
  it("keeps CR01-06 and the runner as direct consumers of an independent contract package", async () => {
    const contract = await readFile(
      path.join(
        IMPLEMENTATION_ROOT,
        "speclite-code-review-contract/references/cr-contract.md",
      ),
      "utf8",
    );

    expect(contract).toContain("唯一规范性共享契约");
    expect(contract).toContain("schemaVersion: speclite.cr-review.v2");
    expect(contract).toContain("schemaVersion: speclite.cr-evaluation.v2");

    for (const consumerId of CONSUMER_IDS) {
      const entry = await readFile(
        path.join(IMPLEMENTATION_ROOT, consumerId, "SKILL.md"),
        "utf8",
      );

      expect(entry).toContain(CONTRACT_REFERENCE);
      expect(entry).not.toContain("references/cr-config.md");
      expect(entry).not.toContain(
        "speclite-goal-orchestrator-epic-story-code-review-runner/references/cr-contract.md",
      );
    }

    for (const consumerId of LEAF_IDS) {
      await expect(
        access(path.join(IMPLEMENTATION_ROOT, consumerId, "references/cr-config.md")),
      ).rejects.toThrow();
    }
    await expect(
      access(
        path.join(
          IMPLEMENTATION_ROOT,
          "speclite-goal-orchestrator-epic-story-code-review-runner/references/cr-contract.md",
        ),
      ),
    ).rejects.toThrow();
  });

  it("uses Chinese-first labels in CR human-facing output templates", async () => {
    const [reviewTemplate, evaluationTemplate, rulesTemplate, todoTemplate, finalizerTemplate] = await Promise.all([
      readFile(
        path.join(
          IMPLEMENTATION_ROOT,
          "speclite-code-review-01-reviewer/assets/output-template.md",
        ),
        "utf8",
      ),
      readFile(
        path.join(
          IMPLEMENTATION_ROOT,
          "speclite-code-review-02-evaluator/assets/output-template.md",
        ),
        "utf8",
      ),
      readFile(
        path.join(
          IMPLEMENTATION_ROOT,
          "speclite-code-review-04-rules-extractor/assets/output-template.md",
        ),
        "utf8",
      ),
      readFile(
        path.join(
          IMPLEMENTATION_ROOT,
          "speclite-code-review-05-todo-tracker/assets/output-template.md",
        ),
        "utf8",
      ),
      readFile(
        path.join(
          IMPLEMENTATION_ROOT,
          "speclite-code-review-06-finalizer/assets/output-template.md",
        ),
        "utf8",
      ),
    ]);

    expect(reviewTemplate).toContain("- 声明文件：");
    expect(reviewTemplate).toContain("- 发现指纹：");
    expect(evaluationTemplate).toContain("- 发现指纹：");
    expect(evaluationTemplate).toContain("| 发现指纹 | 优先级 | 失败场景 | 授权范围 |");
    expect(rulesTemplate).toContain("## Candidate Rules（候选规则）");
    expect(todoTemplate).toContain("**发现指纹**");
    expect(todoTemplate).toContain("# CR TODO Result（CR TODO 结果）");
    expect(finalizerTemplate).toContain("## Tracker Change Set（Tracker 变更集）");
  });

  it("keeps the shared review scope schema aligned with the reviewer template", async () => {
    const [contract, template] = await Promise.all([
      readFile(
        path.join(
          IMPLEMENTATION_ROOT,
          "speclite-code-review-contract/references/cr-contract.md",
        ),
        "utf8",
      ),
      readFile(
        path.join(
          IMPLEMENTATION_ROOT,
          "speclite-code-review-01-reviewer/assets/output-template.md",
        ),
        "utf8",
      ),
    ]);

    for (const field of [
      "inputMode",
      "declaredFiles",
      "actualChangedFiles",
      "excludedFiles",
      "scopeExceptions",
      "acCoverageComplete",
    ]) {
      expect(contract).toMatch(new RegExp(`^${field}:`, "m"));
      expect(template).toMatch(new RegExp(`^${field}:`, "m"));
    }
  });

  it("keeps CR01-06 standalone, progressively disclosed, and bilingual-semantic", async () => {
    for (const leafId of LEAF_IDS) {
      const root = path.join(IMPLEMENTATION_ROOT, leafId);
      const [chineseEntry, englishEntry, workflow] = await Promise.all([
        readFile(path.join(root, "SKILL.md"), "utf8"),
        readFile(path.join(root, "SKILL.en.md"), "utf8"),
        readFile(path.join(root, WORKFLOW_REFERENCES[leafId]), "utf8"),
      ]);

      expect(chineseEntry).toContain("## Activation Boundary（激活边界）");
      expect(englishEntry).toContain("## Activation Boundary");
      expect(chineseEntry).toContain(WORKFLOW_REFERENCES[leafId]);
      expect(englishEntry).toContain(WORKFLOW_REFERENCES[leafId]);
      expect(chineseEntry).toContain("人工");
      expect(englishEntry).toContain("manual");
      expect(workflow).toContain("Common Mistakes（常见错误）");

      const chineseCapabilities = countCoreCapabilities(
        chineseEntry,
        "## Contract（共享契约）",
      );
      const englishCapabilities = countCoreCapabilities(englishEntry, "## Contract");
      expect(chineseCapabilities).toBeGreaterThanOrEqual(4);
      expect(chineseCapabilities).toBeLessThanOrEqual(8);
      expect(englishCapabilities).toBe(chineseCapabilities);

      for (const forbidden of ["runner 重新计算", "建议 runner 生成", "返回 runner："]) {
        expect(chineseEntry).not.toContain(forbidden);
        expect(workflow).not.toContain(forbidden);
      }
    }
  });

  it("defines durable closeout schemas and makes the runner validate each one", async () => {
    const [contract, runnerWorkflow] = await Promise.all([
      readFile(
        path.join(
          IMPLEMENTATION_ROOT,
          "speclite-code-review-contract/references/cr-contract.md",
        ),
        "utf8",
      ),
      readFile(
        path.join(
          IMPLEMENTATION_ROOT,
          "speclite-goal-orchestrator-epic-story-code-review-runner/references/runner-workflow.md",
        ),
        "utf8",
      ),
    ]);

    for (const schema of [
      "speclite.cr-rules-extraction.v2",
      "speclite.cr-todo-result.v2",
      "speclite.cr-finalizer.v2",
    ]) {
      expect(contract).toContain(`schemaVersion: ${schema}`);
      expect(runnerWorkflow).toContain(schema);
    }
    expect(contract).toContain("人工 orchestrator record");
    expect(contract).toContain("manual-orchestrator");
  });

  it("preserves runner-owned activation, resume, logging, convergence and completion semantics", async () => {
    const runnerRoot = path.join(
      IMPLEMENTATION_ROOT,
      "speclite-goal-orchestrator-epic-story-code-review-runner",
    );
    const [chineseEntry, englishEntry, workflow, contract] = await Promise.all([
      readFile(path.join(runnerRoot, "SKILL.md"), "utf8"),
      readFile(path.join(runnerRoot, "SKILL.en.md"), "utf8"),
      readFile(path.join(runnerRoot, "references/runner-workflow.md"), "utf8"),
      readFile(
        path.join(
          IMPLEMENTATION_ROOT,
          "speclite-code-review-contract/references/cr-contract.md",
        ),
        "utf8",
      ),
    ]);

    expect(chineseEntry).toContain("## Activation Boundary（激活边界）");
    expect(chineseEntry).toContain("以下情况不要使用本 Skill");
    expect(englishEntry).toContain("## Activation Boundary");
    expect(englishEntry).toContain("## Inputs");
    expect(englishEntry).toContain("## Runtime Activation");
    expect(englishEntry).toContain("## Decision Policy");
    expect(englishEntry).toContain("## Completion Criteria");
    expect(countCoreCapabilities(chineseEntry, "## Contract（共享契约）")).toBe(5);
    expect(countCoreCapabilities(englishEntry, "## Contract")).toBe(5);

    const convergenceIndex = workflow.indexOf("## Step 7: Convergence（收敛）");
    const stateGateIndex = workflow.indexOf("## Step 8: State Gate（状态门禁）");
    const fixerIndex = workflow.indexOf("## Step 9: Fixer（修复）");
    expect(convergenceIndex).toBeGreaterThan(0);
    expect(stateGateIndex).toBeGreaterThan(convergenceIndex);
    expect(fixerIndex).toBeGreaterThan(stateGateIndex);
    expect(workflow).toContain("按以下恢复矩阵选择唯一下一状态");
    expect(workflow).toContain("每个 Step 完成、HALT、重试、用户裁决或 state transition 前");
    expect(workflow).toContain("每个 Skill 使用独立 fresh outer sub-agent");
    expect(workflow).toContain("## Common Mistakes（常见错误）");
    expect(workflow).toContain("## Invocation Template（调用模板）");
    expect(workflow).toContain("结束循环但不完成 Story");

    for (const recordName of ["PLAN.md", "EXPERIMENTS.md", "EXPERIMENT_NOTES.md"]) {
      expect(chineseEntry).toContain(recordName);
      expect(englishEntry).toContain(recordName);
      expect(workflow).toContain(recordName);
    }
    expect(chineseEntry).toContain("git-commit-convention");
    expect(englishEntry).toContain("git-commit-convention");
    expect(contract).toContain("## Implementation Anchor Policy（实现锚点策略）");
    expect(contract).toContain("equivalent implementation policy");
  });

  it("runner closeout generates the story-completion gate and models partial-closeout resume", async () => {
    const workflow = await readFile(
      path.join(
        IMPLEMENTATION_ROOT,
        "speclite-goal-orchestrator-epic-story-code-review-runner/references/runner-workflow.md",
      ),
      "utf8",
    );
    const gateIdx = workflow.indexOf("mode=story-completion");
    const finalizerIdx = workflow.indexOf("speclite-code-review-06-finalizer");
    expect(gateIdx).toBeGreaterThan(0);
    expect(finalizerIdx).toBeGreaterThan(gateIdx);
    for (const state of [
      "无 current CR04 report",
      "无 current CR05 report",
      "无 current/合法 completion gate",
      "finalizer 结构化 HALTED",
    ]) {
      expect(workflow).toContain(state);
    }
  });

  it("defines a CR05 closeout mode with a PASS no-op", async () => {
    const [contract, tracker] = await Promise.all([
      readFile(
        path.join(
          IMPLEMENTATION_ROOT,
          "speclite-code-review-contract/references/cr-contract.md",
        ),
        "utf8",
      ),
      readFile(
        path.join(
          IMPLEMENTATION_ROOT,
          "speclite-code-review-05-todo-tracker/references/todo-tracker-workflow.md",
        ),
        "utf8",
      ),
    ]);
    expect(contract).toContain("TODO(mode=closeout)");
    expect(contract).toContain("add/check/resolve/list/extract/closeout");
    expect(tracker).toContain("## Mode F: Closeout（收口）");
    expect(tracker).toContain("不写 backlog");
  });

  it("binds finalizer to CR04/CR05 predecessors and gate hashes", async () => {
    const [contract, finalizerWorkflow, finalizerTemplate] = await Promise.all([
      readFile(
        path.join(IMPLEMENTATION_ROOT, "speclite-code-review-contract/references/cr-contract.md"),
        "utf8",
      ),
      readFile(
        path.join(IMPLEMENTATION_ROOT, "speclite-code-review-06-finalizer/references/finalizer-workflow.md"),
        "utf8",
      ),
      readFile(
        path.join(IMPLEMENTATION_ROOT, "speclite-code-review-06-finalizer/assets/output-template.md"),
        "utf8",
      ),
    ]);
    expect(finalizerWorkflow).toContain("## Step 2.5: Validate Closeout Predecessors（验证收口前序产物）");
    for (const field of ["rulesExtractionSourceHash", "todoResultSourceHash", "completionGateSourceHash"]) {
      expect(contract).toContain(field);
      expect(finalizerTemplate).toContain(field);
    }
  });

  it("propagates authorization context through the runner and contract matrix", async () => {
    const [contract, runnerWorkflow] = await Promise.all([
      readFile(
        path.join(IMPLEMENTATION_ROOT, "speclite-code-review-contract/references/cr-contract.md"),
        "utf8",
      ),
      readFile(
        path.join(
          IMPLEMENTATION_ROOT,
          "speclite-goal-orchestrator-epic-story-code-review-runner/references/runner-workflow.md",
        ),
        "utf8",
      ),
    ]);
    expect(contract).toContain("### Invocation Parameter Matrix（调用参数矩阵）");
    expect(runnerWorkflow).toContain(
      "mode={patch|verify-only} confirmationPolicy={confirmationPolicy} authorizationSource={authorizationSource}",
    );
    expect(runnerWorkflow).toContain(
      "speclite-code-review-06-finalizer {storyId} confirmationPolicy={confirmationPolicy} authorizationSource={authorizationSource}",
    );
  });

  it("defines identity, supersession and hash canonicalization rules", async () => {
    const contract = await readFile(
      path.join(IMPLEMENTATION_ROOT, "speclite-code-review-contract/references/cr-contract.md"),
      "utf8",
    );
    expect(contract).toContain("^[a-z0-9][a-z0-9-]{0,31}$");
    expect(contract).toContain("### Artifact Revision and Supersession（产物修订与替代）");
    expect(contract).toContain("-superseded-{n}");
    expect(contract).toContain("## Hash Canonicalization（Hash 规范化）");
  });

  it("replaces atomic closeout with a fail-closed coordinated write", async () => {
    const [contract, finalizerWorkflow, finalizerTemplate] = await Promise.all([
      readFile(
        path.join(IMPLEMENTATION_ROOT, "speclite-code-review-contract/references/cr-contract.md"),
        "utf8",
      ),
      readFile(
        path.join(IMPLEMENTATION_ROOT, "speclite-code-review-06-finalizer/references/finalizer-workflow.md"),
        "utf8",
      ),
      readFile(
        path.join(IMPLEMENTATION_ROOT, "speclite-code-review-06-finalizer/assets/output-template.md"),
        "utf8",
      ),
    ]);
    expect(finalizerWorkflow).toContain("fail-closed coordinated write");
    expect(finalizerWorkflow).toContain("按逆序用 `before hash`");
    expect(contract).toContain("fail-closed coordinated write");
    expect(finalizerTemplate).toContain("trackerChangeSet");
  });

  // 真行为测试需要 runner 状态机模拟器（独立基建），先登记为 todo：
  it.todo("runner routes PASS zero-TODO through CR05 closeout no-op end to end");
  it.todo("standalone CR06 halts when CR04/CR05 reports are missing");
  it.todo("same-round retry writes -superseded-{n} instead of overwriting current");
  it.todo("finalizer rolls back sprint write when workflow tracker write fails");
});

function countCoreCapabilities(entry: string, nextSection: string): number {
  const start = entry.indexOf("## Core Capabilities");
  const end = entry.indexOf(nextSection, start);
  if (start < 0 || end < 0) {
    return 0;
  }
  return entry.slice(start, end).match(/^- \*\*/gm)?.length ?? 0;
}
