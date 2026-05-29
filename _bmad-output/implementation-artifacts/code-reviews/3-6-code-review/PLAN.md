# PLAN

## 范围

- Story: `3-6-validation-progress-category-coverage-and-local-determinism`
- Story 文件: `_bmad-output/implementation-artifacts/stories/3-6-validation-progress-category-coverage-and-local-determinism.md`
- 当前目标: 按用户要求使用 fresh sub-agent 严格串行完成 dev、CR、评估、修复循环、规则提炼、TODO 跟踪、finalizer，并在 Epic 3 全部完成后进入本地提交。

## 串行计划

1. [完成] 使用 fresh sub-agent 和 GPT-5 Codex 执行 `/bmad-dev-story story 3-6`。
2. [完成] 使用 fresh sub-agent 和 GPT-5.5 执行 `/bmenhance-cr-01-reviewer 3-6`。
3. [完成] 使用 fresh sub-agent 和 GPT-5 Codex 执行 `/bmenhance-cr-02-evaluator 3-6`。
4. [完成] 使用 fresh sub-agent 和 GPT-5.5 执行 `/bmenhance-cr-03-fixer 3-6`。
5. [完成] 重复 reviewer -> evaluator -> fixer，直到 reviewer 结论通过且 evaluator 评估通过；Round 2 evaluator 已确认 reviewer 通过结论成立，无需继续 fixer。
6. [完成] 使用 fresh sub-agent 和 GPT-5.5 依次执行 `bmenhance-cr-04-rules-extractor`、`bmenhance-cr-05-todo-tracker`、`bmenhance-cr-06-finalizer`。
   - [完成] `bmenhance-cr-04-rules-extractor`：完成 CR 历史分析与规则升格判定；不写全局文档，不写 `cr-rules-summary.md`，无交接给 TODO Tracker 的未解决项。
   - [完成] `bmenhance-cr-05-todo-tracker`：检查 Story 3.6 CR 文件与现有 CR TODO backlog；无新增或匹配待办，不写 `cr-todo-backlog.md`。
   - [完成] `bmenhance-cr-06-finalizer`：Story 3.6 与 `sprint-status.yaml` 已同步为 `done`；Epic 3 全部 Story 已 `done`，主状态同步为 `done`；`bmm-workflow-status.yaml` 不存在，已跳过。
7. [完成] 每一步完成后更新 `EXPERIMENTS.md` 和 `EXPERIMENT_NOTES.md`。

## 决策原则

- 不并行执行任何 Story 步骤或 skill 步骤。
- reviewer/evaluator 若给出明确修复方向，默认按推荐方案执行并记录决策。
- blocking 问题必须留在 CR/fixer 循环中解决；只有 non-blocking 项进入 TODO tracker。
- 不回滚或覆盖本轮开始前已经存在的未提交改动。
