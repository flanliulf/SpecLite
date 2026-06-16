# EXPERIMENTS

## 2026-06-16 — Attempt 1

- **Story**: `8-8-cli-human-output-presentation-profiles`
- **方案**: 按 `goal-orchestrator-epic-story-code-review-runner` 启动 Story 8.8 严格串行闭环，先初始化 code review 目录与三份中文进度文件，再启动 fresh dev sub-agent。
- **选择原因**: Story 8.8 是基于真实 `install` 输出问题新增的 corrective Story，需要先完成开发，再进入 CR reviewer/evaluator/fixer 闭环。
- **前置结果**:
  - Story 文件存在，状态为 `ready-for-dev`。
  - `sprint-status.yaml` 中 `8-8-cli-human-output-presentation-profiles: ready-for-dev`。
  - 当前工作树已有 Story 8.8 规划、Epic 8 一致性调整和 focused RED test。
  - 未发现 Story 8.8 既有 code-review 产物。
- **当前结果**: 已创建本目录与三份初始进度文件。
- **下一步判断**: 启动 fresh dev sub-agent 执行 `/bmad-dev-story story 8-8`。

## 2026-06-16 — Attempt 2

- **Story**: `8-8-cli-human-output-presentation-profiles`
- **方案**: 启动 fresh dev sub-agent 执行 `/bmad-dev-story story 8-8`。
- **选择原因**: Story 8.8 处于 `ready-for-dev`，且 code-review 进度文件已初始化。按 orchestrator 流程必须先完成开发，不能直接进入 CR。
- **执行结果**: 开发完成，Story 进入 `review`。
- **主要修改范围**:
  - `src/diagnostics/output.ts`
  - `src/diagnostics/install-presentation-context.ts`
  - `src/commands/install.ts`
  - `src/cli/messages.ts`
  - `docs/reference/cli-human-output-matrix.md`
  - `test/cli-human-output-matrix.test.ts`
  - `test/cli-message-catalog.test.ts`
  - `test/cli-output-presentation.test.ts`
  - `test/cli-smoke.test.ts`
  - `test/install-outcome-human-output.test.ts`
  - `_bmad-output/implementation-artifacts/stories/8-8-cli-human-output-presentation-profiles.md`
  - `_bmad-output/implementation-artifacts/sprint-status.yaml`
- **验证结果**:
  - RED 基线：`npm test -- test/install-outcome-human-output.test.ts` 初始失败。
  - Focused tests：26 passed。
  - 相关 renderer 回归：59 passed。
  - `npm run build`：通过。
  - `npm test`：52 files / 371 tests passed。
  - `git diff --check`：通过。
- **HALT / 遗留风险**: 无已知阻塞；legacy renderer 未全量重写，只加入 profile mapping 与 shared frame 迁移基础。
- **下一步判断**: 启动 fresh reviewer sub-agent 执行 `/bmenhance-cr-01-reviewer 8-8`。

## 2026-06-16 — Attempt 3

- **Story**: `8-8-cli-human-output-presentation-profiles`
- **方案**: 启动 fresh reviewer sub-agent 执行 `/bmenhance-cr-01-reviewer 8-8`。
- **选择原因**: Story 已进入 `review`，按用户流程必须先审查，不能直接进入 evaluator、fixer 或 finalizer。
- **执行结果**: Round 1 review 完成，结论不通过。
- **输出文件**: `_bmad-output/implementation-artifacts/code-reviews/8-8-code-review/8-8-code-review-summary-20260616-round-1.md`
- **发现摘要**:
  - Finding 1：跨目录相对 target 仍会在 human Next Actions 中退化为 basename。
  - Finding 2：shared frame 把非 issue 的写入空态放进了 Issues section。
- **分类 / 严重性**: `patch` 2 个；`[中]` 1 个，`[低]` 1 个。
- **验证证据**:
  - install focused test、presentation/message/matrix focused tests、`npm run build`、`npm test`、`git diff --check` 均通过。
  - 定向复现确认 `targetDirectory="../noi"` 时 human Next Actions 输出 basename `noi`。
  - 定向复现确认 install no-issue prewrite preview 的 `Issues（问题）` 同时包含 `- 无问题` 和 `- 未写入项目文件`。
- **下一步判断**: 启动 fresh evaluator sub-agent 执行 `/bmenhance-cr-02-evaluator 8-8`，独立评估 review findings。

## 2026-06-16 — Attempt 4

- **Story**: `8-8-cli-human-output-presentation-profiles`
- **方案**: 启动 fresh evaluator sub-agent 执行 `/bmenhance-cr-02-evaluator 8-8`，只评估最新 CR summary，不修改代码、测试、Story、sprint status 或进度文件。
- **选择原因**: Reviewer Round 1 未通过，按 CR 闭环必须先由 evaluator 判定 findings 是否有效、是否阻塞、是否需要 fixer。
- **执行结果**: Evaluator Round 1 完成，结论 `not approved`。
- **输出文件**: `_bmad-output/implementation-artifacts/code-reviews/8-8-code-review/8-8-code-review-evaluation-20260616-round-1.md`
- **评估摘要**:
  - Finding 1 确认有效，非误报，评估后优先级 P1。
  - Finding 2 确认有效，非误报，评估后优先级 P1。
  - 阻塞修复项数量为 2，非阻塞 CR TODO 为 0，误报为 0。
- **下一步判断**: 启动 fresh fixer sub-agent 执行 `/bmenhance-cr-03-fixer 8-8`；修复后必须重新执行 reviewer/evaluator。

## 2026-06-16 — Attempt 5

- **Story**: `8-8-cli-human-output-presentation-profiles`
- **方案**: 启动 fresh fixer sub-agent 执行 `/bmenhance-cr-03-fixer 8-8`，只修复 Evaluation Round 1 确认的两个 P1 finding。
- **选择原因**: Evaluator 已判定两个 finding 有效且阻塞交付，按 CR 闭环必须先修复，再重新 reviewer/evaluator。
- **执行结果**: Fixer Round 1 完成，finding 标记为 fixed，并在 evaluation 文件末尾追加 `## 修复执行记录`。
- **修复摘要**:
  - 相对 target 保留原始命令参数，`../noi` 不再退化为 basename。
  - `Issues` section 只输出真实 issue 或 `- 无问题`，`writeNone` 不再混入。
  - 新增 install focused regression 覆盖 `../noi` 与 no-issue section 归属。
- **验证结果**:
  - `npm test -- test/install-outcome-human-output.test.ts`：通过，8 tests。
  - `npm test -- test/cli-output-presentation.test.ts test/cli-message-catalog.test.ts test/cli-human-output-matrix.test.ts test/install-outcome-human-output.test.ts`：通过，27 tests。
  - `npm run build`：通过。
  - `npm test`：通过，52 files / 372 tests。
  - `git diff --check`：通过。
  - `release/packaging-manifest.json` packageHash drift 已恢复，当前无 diff。
- **下一步判断**: 启动 fresh reviewer sub-agent 执行 `/bmenhance-cr-01-reviewer 8-8` Round 2。

## 2026-06-16 — Attempt 6

- **Story**: `8-8-cli-human-output-presentation-profiles`
- **方案**: 启动 fresh reviewer sub-agent 执行 `/bmenhance-cr-01-reviewer 8-8` Round 2，复核 CR-03 修复后的 path-safe target 与 empty state 归属。
- **选择原因**: CR-03 fixer 已完成，按闭环要求必须重新 reviewer/evaluator，不能直接进入 04/05/06。
- **执行结果**: Reviewer Round 2 完成，结论通过。
- **输出文件**: `_bmad-output/implementation-artifacts/code-reviews/8-8-code-review/8-8-code-review-summary-20260616-round-2.md`
- **发现摘要**:
  - Findings 数量为 0。
  - Round 1 的两个 P1 finding 均复核为修复完成。
  - 未发现新的阻塞项或中高优先级问题。
- **验证结果**:
  - `npm test -- test/install-outcome-human-output.test.ts`：通过，8 tests。
  - Focused renderer/matrix tests：通过，27 tests。
  - `npm run build`：通过。
  - `npm test`：通过，52 files / 372 tests。
  - `git diff --check`：通过。
- **下一步判断**: 启动 fresh evaluator sub-agent 执行 `/bmenhance-cr-02-evaluator 8-8` Round 2。

## 2026-06-16 — Attempt 7

- **Story**: `8-8-cli-human-output-presentation-profiles`
- **方案**: 启动 fresh evaluator sub-agent 执行 `/bmenhance-cr-02-evaluator 8-8` Round 2，只评估最新 review summary 与修复闭环。
- **选择原因**: Reviewer Round 2 已通过，按 CR 闭环必须由 evaluator 做最终确认后才能进入 04/05/06。
- **执行结果**: Evaluator Round 2 完成，结论 Approved。
- **输出文件**: `_bmad-output/implementation-artifacts/code-reviews/8-8-code-review/8-8-code-review-evaluation-20260616-round-2.md`
- **评估摘要**:
  - Round 1 的 2 个 finding 已修复。
  - Round 2 新 findings 为 0。
  - CR TODO 数量为 0，误报数量为 0。
  - 不需要 fixer。
- **下一步判断**: 启动 fresh sub-agent 执行 `bmenhance-cr-04-rules-extractor`。

## 2026-06-16 — Attempt 8

- **Story**: `8-8-cli-human-output-presentation-profiles`
- **方案**: 启动 fresh sub-agent 执行 `bmenhance-cr-04-rules-extractor`，分析本 Story CR/evaluation/fix 记录是否能提取可推广规则。
- **选择原因**: Reviewer/evaluator 已通过，按 orchestrator 必须先执行 04，再执行 05/06。
- **执行结果**: 04 完成，生成 Story 级规则提取总结。
- **输出文件**: `_bmad-output/implementation-artifacts/code-reviews/8-8-code-review/8-8-cr-rules-extraction-20260616.md`
- **规则结论**:
  - 提取候选规则 2 条。
  - 两条规则评分均为 4。
  - 判定为不沉淀；保留 Story 级记录。
  - 未更新全局文档或 `cr-rules-summary.md`。
  - 无需 05 TODO Tracker 处理的 backlog 项。
- **下一步判断**: 仍按流程启动 fresh `bmenhance-cr-05-todo-tracker` 做无待办确认。

## 2026-06-16 — Attempt 9

- **Story**: `8-8-cli-human-output-presentation-profiles`
- **方案**: 启动 fresh sub-agent 执行 `bmenhance-cr-05-todo-tracker`，确认是否存在需要登记的 deferred CR TODO。
- **选择原因**: 04 明确无需 backlog，但 orchestrator 要求 05 阶段仍需串行执行并记录结果。
- **执行结果**: 05 完成，未新增/更新 CR TODO。
- **Backlog 文件**: `_bmad-output/implementation-artifacts/cr-rules/cr-todo-backlog.md`
- **结论**:
  - Backlog 变更为 0。
  - 不需要后续 CR TODO backlog 处理。
- **下一步判断**: 启动 fresh sub-agent 执行 `bmenhance-cr-06-finalizer`。

## 2026-06-16 — Attempt 10

- **Story**: `8-8-cli-human-output-presentation-profiles`
- **方案**: 启动 fresh sub-agent 执行 `bmenhance-cr-06-finalizer`，在 CR Approved 后更新 Story 和 sprint tracking。
- **选择原因**: 04/05 已完成，Story 只有在 06 同步状态后才可视为 done。
- **执行结果**: 06 完成。
- **修改文件**:
  - `_bmad-output/implementation-artifacts/stories/8-8-cli-human-output-presentation-profiles.md`
  - `_bmad-output/implementation-artifacts/sprint-status.yaml`
- **状态结果**:
  - Story status: `done`
  - Sprint status: `8-8-cli-human-output-presentation-profiles: done`
  - Epic 8: `done`
  - `epic-8-retrospective`: 保持 `optional`
  - `_bmad-output/planning-artifacts/bmm-workflow-status.yaml` 不存在，已跳过且未创建。
- **验证结果**:
  - latest evaluation Round 2 为 Approved，CR TODO 0，误报 0，不需要 fixer。
  - latest review Round 2 结论通过，findings 0。
  - `git diff --check -- <story> <sprint-status>` 通过。
- **终态判断**: Story 8.8 严格串行 dev/CR/04/05/06 闭环完成。下一步进入最终验证与本地提交。

## 2026-06-16 — Attempt 11

- **Story**: `8-8-cli-human-output-presentation-profiles`
- **方案**: 执行 Story 8.8 最终验证，确认实现、测试、文档、CR 产物和 tracking 文件可提交。
- **选择原因**: Story 8.8 finalizer 已将 Story 与 Epic 状态同步为 `done`；orchestrator 要求完成后再做最终验证与本地提交。
- **验证结果**:
  - `npm test -- test/install-outcome-human-output.test.ts`：通过，1 file / 8 tests。
  - Focused presentation/message/matrix tests：通过，4 files / 27 tests。
  - Affected command tests：通过，4 files / 59 tests。
  - `npm run build`：通过。
  - `npm test`：通过，52 files / 372 tests。
  - `git diff --check`：通过。
  - `release/packaging-manifest.json` 与 `dist/packaging-manifest.json` 当前无 diff。
- **Build side effect**: `npm run build` 写回的 `release/packaging-manifest.json` packageHash drift 已恢复，未纳入本次提交。
- **下一步判断**: 精确暂存 Story 8.8 目标范围文件并创建中文 Conventional Commit；不 push。
