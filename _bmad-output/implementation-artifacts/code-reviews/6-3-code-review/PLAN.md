# PLAN.md

## Objective（目标）

针对 Story 6.3 `drift-source-integrity-and-resolve-parity-fixtures` 执行严格串行的开发与 CR 闭环，直到 reviewer 与 evaluator 均通过，然后依次完成 rules extractor、todo tracker、finalizer。所有步骤使用 fresh sub-agent，模型指定为 GPT-5.5；步骤之间不得并行。

## Scope（范围）

- Story 文件：`_bmad-output/implementation-artifacts/stories/6-3-drift-source-integrity-and-resolve-parity-fixtures.md`
- CR 目录：`_bmad-output/implementation-artifacts/code-reviews/6-3-code-review/`
- 状态来源：`_bmad-output/implementation-artifacts/sprint-status.yaml`
- 允许修改范围：Story 6.3 实现所需源码/测试/fixture 产物、Story 6.3 文件允许区域、Story 6.3 CR 产物、必要状态文件。
- 禁止扩大范围：不得清理或回滚工作树中已有的历史 Story、planning docs、skill source 维护、Story 6.1/6.2 已完成产物或其它无关脏改。

## Sequence（执行顺序）

1. [x] 使用 fresh sub-agent 执行 `/bmad-dev-story story 6-3`。
2. [x] 使用 fresh sub-agent 执行 `/bmenhance-cr-01-reviewer 6-3`。
3. [x] 使用 fresh sub-agent 执行 `/bmenhance-cr-02-evaluator 6-3`。
4. [x] 使用 fresh sub-agent 执行 `/bmenhance-cr-03-fixer 6-3`。
5. [x] 重复 reviewer -> evaluator -> fixer，直到 reviewer 结论通过且 evaluator 评估通过。
6. [x] reviewer/evaluator 均通过后，依次执行：
   - `bmenhance-cr-04-rules-extractor 6-3`
   - `bmenhance-cr-05-todo-tracker 6-3`
   - `bmenhance-cr-06-finalizer 6-3`
7. [x] 记录 Story 6.3 完成状态；后续继续 Story 6.4。

## Decision Policy（决策策略）

- reviewer/evaluator 给出明确推荐修复时，默认采用推荐方案并记录。
- `cr-04` 默认不修改全局 project/architecture/AGENTS 文档；仅在 story-scoped 记录或明确推荐时写 CR rules summary。
- `cr-05` 只追踪 non-blocking 项；blocking 问题必须回到 fixer 闭环解决。
- finalizer 必须验证最新 evaluator 结论为 Approved 后才能执行。

## Current Status（当前状态）

- 2026-06-02：Story 6.1、6.2 已完成并标记 `done`。
- Story 6.3 当前状态：`ready-for-dev`。
- `sprint-status.yaml`：`6-3-drift-source-integrity-and-resolve-parity-fixtures: ready-for-dev`。
- 2026-06-02：`/bmad-dev-story story 6-3` 已完成。
- Story 文件状态：`Status: review`。
- `sprint-status.yaml`：`6-3-drift-source-integrity-and-resolve-parity-fixtures: review`。
- 已报告验证：`npm run build` 通过，`npm test` 36 files / 274 tests passed，额外 focused regression 11 files / 116 tests passed。
- CR reviewer round 1：不通过，1 个 blocking finding。
- Reviewer 文件：`6-3-code-review-summary-20260602-round-1.md`。
- Reviewer 验证：`npm run build` 通过，`npm test` 36 files / 274 tests passed，聚焦测试 5 files / 47 tests passed。
- Evaluator round 1：Not Approved；确认 1 个 P1 必修项，无 defer/误报。
- Evaluator 文件：`6-3-code-review-evaluation-20260602-round-1.md`。
- Fixer round 1：已修复 1 个 P1，并将修复记录追加到 evaluator 文件。
- 已报告验证：`npm run build` 通过，`npm test` 36 files / 274 tests passed。
- Reviewer round 2：通过；blocking findings 为 0，non-blocking findings 为 0。
- Reviewer 文件：`6-3-code-review-summary-20260602-round-2.md`。
- Reviewer 验证：`resolve-cli` + fixture contract 18 tests passed，fixture release gates 5 tests passed。
- Evaluator round 2：Approved / 通过；无 blocking、无 non-blocking、无 CR TODO。
- Evaluator 文件：`6-3-code-review-evaluation-20260602-round-2.md`。
- Rules/TODO/finalizer：已完成。
- `cr-04`：analysis-only，未写 `cr-rules-summary.md`，未修改全局文档。
- `cr-05`：未新增 TODO，latest evaluation 无 non-blocking / defer / CR TODO。
- `cr-06`：Story 6.3 与 `sprint-status.yaml` 已同步为 `done`；Epic 6 未更新为 done，因为 6.4-6.5 仍未完成。
- 终态：Story 6.3 完成，后续进入 Story 6.4。
