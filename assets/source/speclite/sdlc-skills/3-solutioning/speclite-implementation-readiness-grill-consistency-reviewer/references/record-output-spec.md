# Record and Output Spec（记录与输出规范）

## Directory Layout（目录结构）

任何 record write 前必须运行
`speclite resolve artifact-roots --project-root {project-root}`，只消费
`solutioning_artifacts.resolvedRoot`，并记录对应 `resolutionMode` 与 provenance。
`explicit-config` 和 `legacy-compatible` 必须同样使用 resolver result；不得在本
Skill 内手写 fresh default、Planning fallback 或第三输出根。Resolver non-zero、
block/error、缺失有效 `solutioning_artifacts.resolvedRoot` 或 root 安全检查失败时必须
HALT，并保持 zero artifact write 与 zero progress mutation。

固定输出目录：

```text
{solutioning_artifacts}/implementation-readiness-report/grill-consistency/
    summary.md
    goal-execute-records/
        round-N/
            PLAN.md
            EXPERIMENTS.md
            EXPERIMENT_NOTES.md
        round-N-plus-1/
            PLAN.md
            EXPERIMENTS.md
            EXPERIMENT_NOTES.md
```

Existing `{planning_artifacts}/ir-grill/` records are legacy historical evidence.
They remain discoverable in place and must never be migrated, renamed, deleted,
or selected as the output directory for a new run.

## PLAN.md（计划文件）

必填章节：

```text
# Round-N IR Grill Plan（第 N 轮实施就绪 Grill 计划）

## Objective（目标）

## Source Scope（来源范围）

## Avoided Prior Coverage（避开过往覆盖）

## Target Dimensions（本轮目标维度）

## Serial Rules（串行规则）

## Verification（验证）

## Progress（进度）

- Target: 50
- Completed: 0
- Status: in_progress
```

规则：

- `Target` 默认 50；用户改动时写明原因。
- `Avoided Prior Coverage` 必须来自 prior rounds 的记录，不得凭记忆。
- `Source Scope` 必须区分 canonical source、archive、report、shared YAML。

## EXPERIMENTS.md（实验记录）

每题一条，格式：

```text
### Experiment 001 - <short title>

- Status: completed | blocked | verified-no-change
- Dimension: <review dimension>
- Issue category: <taxonomy category>
- Evidence scan:
  - `<command or file ref>`
- Grill question: <one concrete question>
- Risk: <implementation risk>
- Recommended decision: <targeted decision>
- Files updated:
  - `<path>`
- Verification:
  - `<command>`
- Result: <what changed or why no change>
```

规则：

- 一个 experiment 只处理一个问题。
- `verified-no-change` 只能用于证据证明已一致的 question。
- 如果 `blocked`，必须写清等待用户确认的具体问题。
- `Files updated` 为空时写 `None`，不得省略。

## EXPERIMENT_NOTES.md（实时笔记）

用于给长流程保留高密度状态，不替代 `EXPERIMENTS.md`。

建议结构：

```text
# Round-N Experiment Notes（草稿纸 / 实时思考）

## Current Status（当前状态）

- Round: N
- Target: 50
- Completed: <count>

## Avoidance（避开范围）

## Queue（候选队列）

## Notes（实时笔记）

- Q001 完成：<one-line result>

## Final Verification（最终验证）
```

## summary.md（总结文件）

用于最终收口或阶段性复用，必填：

- Executive Summary（执行摘要）
- Source Scope（来源范围）
- Execution Pattern（执行模式）
- Round Trace（轮次轨迹）
- Review Dimensions（审查维度覆盖）
- Issue Taxonomy（问题归类）
- Recommendation Patterns（推荐建议模式）
- Reusable Review Workflow（可复用审查流程）
- Exit Status（退出状态）

## Validation Commands（校验命令）

常用校验：

```bash
rg -n "^### Experiment" <round-dir>/EXPERIMENTS.md
rg -n "Target: 50|Completed: 50|Status: completed" <round-dir>/PLAN.md <round-dir>/EXPERIMENT_NOTES.md
git diff --check -- <changed-files>
```

YAML 校验按项目工具优先；没有项目工具时可用 Python parser。若 parser 不可用，记录 `parser unavailable` 和替代检查。

## Generated Marker（生成标注）

由本 Skill 生成或大幅更新的输出文档末尾追加：

```text
---

*本文档由 speclite-implementation-readiness-grill-consistency-reviewer Skill 自动生成*
```

## Version（版本）

- v1.0.0 - 2026-07-04：初始记录规范。
