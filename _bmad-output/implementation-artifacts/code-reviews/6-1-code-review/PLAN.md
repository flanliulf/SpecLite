# PLAN.md

## Objective（目标）

针对 Story 6.1 `fixture-case-layout-and-expected-output-contract` 执行严格串行的开发与 CR 闭环，直到 reviewer 与 evaluator 均通过，然后依次完成 rules extractor、todo tracker、finalizer。所有步骤使用 fresh sub-agent，模型指定为 GPT-5.5；步骤之间不得并行。

## Scope（范围）

- Story 文件：`_bmad-output/implementation-artifacts/stories/6-1-fixture-case-layout-and-expected-output-contract.md`
- CR 目录：`_bmad-output/implementation-artifacts/code-reviews/6-1-code-review/`
- 状态来源：`_bmad-output/implementation-artifacts/sprint-status.yaml`
- 允许修改范围：Story 6.1 实现所需源码/测试/fixture 产物、Story 6.1 文件允许区域、Story 6.1 CR 产物、必要状态文件。
- 禁止扩大范围：不得清理或回滚工作树中已有的 Epic 1/2/3/4/5、planning docs、skill source 维护等无关脏改。

## Sequence（执行顺序）

1. [x] 使用 fresh sub-agent 执行 `/bmad-dev-story story 6-1`。
2. [x] 使用 fresh sub-agent 执行 `/bmenhance-cr-01-reviewer 6-1`。
3. [x] 使用 fresh sub-agent 执行 `/bmenhance-cr-02-evaluator 6-1`。
4. [x] 使用 fresh sub-agent 执行 `/bmenhance-cr-03-fixer 6-1`。
5. [x] 重复 reviewer -> evaluator -> fixer，直到 reviewer 结论通过且 evaluator 评估通过。
6. [x] reviewer/evaluator 均通过后，依次执行：
   - `bmenhance-cr-04-rules-extractor 6-1`
   - `bmenhance-cr-05-todo-tracker 6-1`
   - `bmenhance-cr-06-finalizer 6-1`
7. [x] 记录 Story 6.1 完成状态；后续继续 Story 6.2。

## Decision Policy（决策策略）

- reviewer/evaluator 给出明确推荐修复时，默认采用推荐方案并记录。
- `cr-04` 若只给出规则升格建议，默认选择 analysis-only，不修改全局文档，除非该 skill 结果明确要求当前 Story 必须落地。
- `cr-05` 只追踪 non-blocking 项；blocking 问题必须回到 fixer 闭环解决。
- finalizer 必须验证最新 evaluator 结论为 Approved 后才能执行。

## Verification（验证）

- 每个 sub-agent 完成后记录其输出、产物文件、测试命令和结论。
- 进入 finalizer 前确认 reviewer 与 evaluator 的最新结论均通过。
- 当前 Story 收尾后检查 `git status --short`，只把本 Story 相关变更纳入后续提交。

## Current Status（当前状态）

- 2026-06-02：`/bmad-dev-story story 6-1` 已完成。
- Story 文件状态：`Status: review`。
- `sprint-status.yaml`：`6-1-fixture-case-layout-and-expected-output-contract: review`。
- 已报告验证：`npm run build` 通过，`npm test` 35 files / 266 tests passed。
- CR reviewer round 1：不通过，3 个 blocking finding，1 个 non-blocking finding。
- Reviewer 文件：`6-1-code-review-summary-20260602-round-1.md`。
- Evaluator round 1：Not Approved；确认 3 个 P1 必修项，1 个 P2 defer 项。
- Evaluator 文件：`6-1-code-review-evaluation-20260602-round-1.md`。
- Fixer round 1：已修复 3 个 P1，并将修复记录追加到 evaluator 文件。
- 已报告验证：`npm run build` 通过，`npm test` 35 files / 266 tests passed。
- Reviewer round 2：通过；blocking findings 为 0，仅保留 P2 defer 项。
- Reviewer 文件：`6-1-code-review-summary-20260602-round-2.md`。
- Evaluator round 2：Approved / 通过；认可无 blocking，仅保留 P2 defer 项。
- Evaluator 文件：`6-1-code-review-evaluation-20260602-round-2.md`。
- Rules/TODO/finalizer：已完成。
- `cr-04`：写入 `cr-rules-summary.md`，新增/更新规则 `CR-TEST-03`、`CR-TEST-04`、`CR-API-27`；未修改全局 project/architecture/AGENTS 文档。
- `cr-05`：新增 `TODO-005`，追踪 `source-integrity` variant id 与 release gate classification 粒度不一致。
- `cr-06`：Story 6.1 与 `sprint-status.yaml` 已同步为 `done`；Epic 6 未更新为 done，因为 6.2-6.5 仍未完成。
- 终态：Story 6.1 完成，后续进入 Story 6.2。
