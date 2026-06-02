# PLAN.md

## Objective（目标）

针对 Story 6.5 `skill-artifact-loop-and-documentation-examples` 执行严格串行的开发与 CR 闭环，直到 reviewer 与 evaluator 均通过，然后依次完成 rules extractor、todo tracker、finalizer。所有步骤使用 fresh sub-agent，模型指定为 GPT-5.5；步骤之间不得并行。

## Scope（范围）

- Story 文件：`_bmad-output/implementation-artifacts/stories/6-5-skill-artifact-loop-and-documentation-examples.md`
- CR 目录：`_bmad-output/implementation-artifacts/code-reviews/6-5-code-review/`
- 状态来源：`_bmad-output/implementation-artifacts/sprint-status.yaml`
- 允许修改范围：Story 6.5 实现所需源码/测试/fixture/docs example/package inventory 产物、Story 6.5 文件允许区域、Story 6.5 CR 产物、必要状态文件。
- 禁止扩大范围：不得清理或回滚工作树中已有的历史 Story、planning docs、skill source 维护、Story 6.1-6.4 已完成产物、Epic 7 或其它无关脏改。

## Sequence（执行顺序）

1. [x] 使用 fresh sub-agent 执行 `/bmad-dev-story story 6-5`。
2. [x] 使用 fresh sub-agent 执行 `/bmenhance-cr-01-reviewer 6-5`。
3. [x] 使用 fresh sub-agent 执行 `/bmenhance-cr-02-evaluator 6-5`。
4. [x] 使用 fresh sub-agent 执行 `/bmenhance-cr-03-fixer 6-5`（evaluator Approved 且无当前修复项，本轮无 fixer 写入）。
5. [x] 重复 reviewer -> evaluator -> fixer，直到 reviewer 结论通过且 evaluator 评估通过。
6. [x] reviewer/evaluator 均通过后，依次执行：
   - `bmenhance-cr-04-rules-extractor 6-5`
   - `bmenhance-cr-05-todo-tracker 6-5`
   - `bmenhance-cr-06-finalizer 6-5`
7. [x] 记录 Story 6.5 完成状态；如 Epic 6 全部 Story 均 done，按 finalizer skill 的确认规则处理 Epic 状态。

## Decision Policy（决策策略）

- reviewer/evaluator 给出明确推荐修复时，默认采用推荐方案并记录。
- `cr-04` 默认不修改全局 project/architecture/AGENTS 文档；仅在 story-scoped 记录或明确推荐时写 CR rules summary。
- `cr-05` 只追踪 non-blocking 项；blocking 问题必须回到 fixer 闭环解决。
- finalizer 必须验证最新 evaluator 结论为 Approved 后才能执行。
- 若 finalizer 检测 Epic 6 全部 Story done 且要求确认是否同步 Epic 状态，保守不自动更新 Epic 主状态，除非 skill 能在无确认情况下依据默认决策安全同步；无确认时记录原因。

## Current Status（当前状态）

- 2026-06-02：Story 6.1、6.2、6.3、6.4 已完成并标记 `done`。
- Story 6.5 当前状态：`ready-for-dev`。
- `sprint-status.yaml`：`6-5-skill-artifact-loop-and-documentation-examples: ready-for-dev`。
- 2026-06-02：`/bmad-dev-story story 6-5` 已完成。
- Story 文件状态：`Status: review`。
- `sprint-status.yaml`：`6-5-skill-artifact-loop-and-documentation-examples: review`。
- 已报告验证：`npm run build` 通过，`npm run release:packaging-check` 通过，`npm test` 37 files / 283 tests passed。
- CR reviewer round 1：通过；blocking findings 为 0，non-blocking findings 为 2 个低优先级问题。
- Reviewer 文件：`6-5-code-review-summary-20260602-round-1.md`。
- Reviewer 验证：`npm test` 37 files / 283 tests passed，`git diff --check` 通过。
- Evaluator round 1：Approved / 通过；无 current fix，2 个 P2 非阻塞 CR TODO 候选。
- Evaluator 文件：`6-5-code-review-evaluation-20260602-round-1.md`。
- 决策：不执行 no-op fixer；直接进入 rules/todo/finalizer，并由 `cr-05` 记录 2 个 P2。
- 第五个 fresh sub-agent 已完成 `cr-04 -> cr-05 -> cr-06`。
- `cr-04`：analysis-only；2 个非阻塞 P2 候选不写入全局规则，交给 `cr-05` 追踪。
- `cr-05`：新增 `TODO-007`（固化 `release:packaging-check` 的 build 前置顺序）与 `TODO-008`（补强 packaged documentation example 空集合断言）。
- `cr-06`：Story 6.5 与 `sprint-status.yaml` 中 Story 6.5 均已标记 `done`。
- Epic 6 下 6.1 至 6.5 均为 `done`；但 `epic-6` 主状态保持 `in-progress`，因为 finalizer skill 要求 Epic 主状态变更需用户确认，本流程采用保守默认不自动更新、不挂起等待。
- 下一步：执行提交前状态核验与最终本地提交。
