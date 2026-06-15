# EXPERIMENTS

## 2026-06-16 04:08 CST — Attempt 1

- **Story**: `8-5-resolve-command-support-output`
- **方案**: 按 `goal-orchestrator-epic-story-code-review-runner` 启动 Story 8.5 严格串行闭环，先初始化 code review 目录与三份中文进度文件，再启动 fresh dev sub-agent。
- **选择原因**: Story 8.4 已完成 04/05/06 并标记 `done`；Epic 8 下一个 `ready-for-dev` Story 是 8.5。按 orchestrator 要求，当前 Story 完成后才能进入下一个 Story。
- **前置结果**:
  - Story 文件存在，状态为 `ready-for-dev`。
  - `sprint-status.yaml` 中 `8-5-resolve-command-support-output: ready-for-dev`。
  - 当前工作树已有 Story 8.1 / 8.2 / 8.3 / 8.4 目标内改动，属于本 Epic 8 目标范围。
  - 未发现 Story 8.5 既有 code-review 产物。
- **当前结果**: 已创建本目录与三份初始进度文件。
- **下一步判断**: 启动 fresh dev sub-agent 执行 `/bmad-dev-story story 8-5`。

## 2026-06-16 — Attempt 2

- **Story**: `8-5-resolve-command-support-output`
- **方案**: 启动 fresh dev sub-agent 执行 `/bmad-dev-story story 8-5`。
- **选择原因**: Story 8.5 为当前 Epic 8 顺序中的下一个 `ready-for-dev` Story，且 code-review 进度文件已初始化。按 orchestrator 流程必须先完成开发，不能直接进入 CR。
- **执行结果**: 开发完成，Story 进入 `review`。
- **主要修改范围**:
  - `src/commands/resolve.ts`：新增 explicit `--human` resolve human output path，并保护默认 JSON mode。
  - `src/config/resolve-output-schema.ts`：补充 human mode 解析 / fixture 支撑。
  - `_bmad-output/planning-artifacts/specs/06-resolve-command-contract.md`、`README.md`、`docs/reference/cli.md`：记录 `--human` 与默认 machine contract。
  - `test/resolve-cli.test.ts` 与 `test/fixtures/resolve-parity/expected/human/*.txt`：覆盖 default pure JSON 与 explicit human outcomes。
  - Story 文件与 `sprint-status.yaml`：记录 Story 8.5 完成状态并进入 `review`。
- **验证结果**:
  - `npm test -- test/resolve-cli.test.ts`：通过，15 tests。
  - `npm test -- test/resolve-cli.test.ts test/resolve-readers.test.ts`：通过，19 tests。
  - `npm run build`：通过。
  - `npm test`：通过，49 files / 356 tests。
  - `git diff --check`：通过。
- **Build side effect**: `npm run build` 曾导致 `release/packaging-manifest.json` hash drift，已恢复，最终无 diff。
- **HALT / 遗留风险**: 无。
- **下一步判断**: 启动 fresh reviewer sub-agent 执行 `/bmenhance-cr-01-reviewer 8-5`。

## 2026-06-16 — Attempt 3

- **Story**: `8-5-resolve-command-support-output`
- **方案**: 启动 fresh reviewer sub-agent 执行 `/bmenhance-cr-01-reviewer 8-5`。
- **选择原因**: Story 已进入 `review`，按用户流程必须先审查，不能直接进入 evaluator 或 fixer。
- **执行结果**: Round 1 review 完成，结论不通过。
- **输出文件**: `_bmad-output/implementation-artifacts/code-reviews/8-5-code-review/8-5-code-review-summary-20260616-round-1.md`
- **发现摘要**:
  - Finding 1：human resolve output 的 `source path` 使用候选首层硬编码，而不是真实 resolved key 来源；后续 layer 覆盖 base value 时会显示错误来源。
- **分类 / 严重性**: `patch` 1 个，`[中]` 1 个。
- **验证证据**: reviewer 记录 resolve CLI / readers tests、`npm run build`、`npm test`、`git diff --check` 通过；定向复现覆盖 default machine mode 与 `--human` mode。
- **Build side effect**: 主 agent 复核时发现 `release/packaging-manifest.json` `packageHash` drift，已精确恢复，当前该文件无 diff。
- **降级说明**: reviewer 内部 Agent 工具不可用，已按 CR-01 降级为当前模型串行三层视角审查。
- **下一步判断**: 启动 fresh evaluator sub-agent 执行 `/bmenhance-cr-02-evaluator 8-5`，独立评估 review finding。

## 2026-06-16 — Attempt 4

- **Story**: `8-5-resolve-command-support-output`
- **方案**: 启动 fresh evaluator sub-agent 执行 `/bmenhance-cr-02-evaluator 8-5`，只评估最新 CR summary，不修改代码、测试、Story、sprint status 或进度文件。
- **选择原因**: Reviewer Round 1 未通过，按 CR 闭环必须先由 evaluator 判定 finding 是否有效、是否阻塞、是否需要 fixer。
- **执行结果**: Evaluator Round 1 完成，结论 `not approved`。
- **输出文件**: `_bmad-output/implementation-artifacts/code-reviews/8-5-code-review/8-5-code-review-evaluation-20260616-round-1.md`
- **评估摘要**:
  - Finding 1 确认有效，非误报。
  - 原始 `[中]` finding 被提升为 P1。
  - 该问题直接违反 AC1 对 successful resolve human output 中 `source path` 准确性的要求。
  - CR TODO 数量为 0，误报数量为 0。
- **下一步判断**: 启动 fresh fixer sub-agent 执行 `/bmenhance-cr-03-fixer 8-5`；修复后必须重新执行 reviewer/evaluator。

## 2026-06-16 — Attempt 5

- **Story**: `8-5-resolve-command-support-output`
- **方案**: 启动 fresh fixer sub-agent 执行 `/bmenhance-cr-03-fixer 8-5`，只修复 Evaluation Round 1 确认的 P1 finding。
- **选择原因**: Evaluator 已判定 finding 有效且阻塞交付，按 CR 闭环必须先修复，再重新 reviewer/evaluator。
- **执行结果**: Fixer Round 1 完成，finding 标记为 fixed，并在 evaluation 文件末尾追加 `## 修复执行记录`。
- **修复摘要**:
  - `ResolverResult` 增加 `sources` metadata，用现有 merge order 记录 selected dotted key 的 effective source layer。
  - explicit `--human` output 的 `source path` 改为读取 effective source metadata。
  - 默认 machine mode 仍只输出 `result.value` JSON；missing key 默认仍保持 `{}` / exit code `0` / stderr empty。
- **验证结果**:
  - `npm test -- test/resolve-cli.test.ts test/resolve-readers.test.ts test/contract-anchors.test.ts`：通过，3 files / 26 tests。
  - `npm run build`：通过。
  - `npm test`：通过，49 files / 356 tests。
  - `git diff --check`：通过。
  - `release/packaging-manifest.json` build hash drift 已恢复，当前无 diff。
- **下一步判断**: 启动 fresh reviewer sub-agent 执行 `/bmenhance-cr-01-reviewer 8-5` Round 2。

## 2026-06-16 — Attempt 6

- **Story**: `8-5-resolve-command-support-output`
- **方案**: 启动 fresh reviewer sub-agent 执行 `/bmenhance-cr-01-reviewer 8-5` Round 2，复核 CR-03 修复后的代码和契约。
- **选择原因**: CR-03 fixer 已完成，按闭环要求必须重新 reviewer/evaluator，不能直接进入 04/05/06。
- **执行结果**: Reviewer Round 2 完成，结论通过。
- **输出文件**: `_bmad-output/implementation-artifacts/code-reviews/8-5-code-review/8-5-code-review-summary-20260616-round-2.md`
- **发现摘要**:
  - Findings 数量为 0。
  - Round 1 effective source finding 已复核为修复完成。
  - 默认 machine mode、missing key 默认行为、`--human` path 脱敏均复核通过。
- **验证结果**:
  - `npm test -- test/resolve-cli.test.ts test/resolve-readers.test.ts test/contract-anchors.test.ts`：通过，3 files / 26 tests。
  - `npm run build`：通过。
  - `npm test`：通过，49 files / 356 tests。
  - `git diff --check`：通过。
  - `release/packaging-manifest.json` build hash drift 已恢复，当前无 diff。
- **下一步判断**: 启动 fresh evaluator sub-agent 执行 `/bmenhance-cr-02-evaluator 8-5` Round 2。

## 2026-06-16 — Attempt 7

- **Story**: `8-5-resolve-command-support-output`
- **方案**: 启动 fresh evaluator sub-agent 执行 `/bmenhance-cr-02-evaluator 8-5` Round 2，只评估最新 review summary 与修复闭环。
- **选择原因**: Reviewer Round 2 已通过，按 CR 闭环必须由 evaluator 做最终确认后才能进入 04/05/06。
- **执行结果**: Evaluator Round 2 完成，结论 Approved。
- **输出文件**: `_bmad-output/implementation-artifacts/code-reviews/8-5-code-review/8-5-code-review-evaluation-20260616-round-2.md`
- **评估摘要**:
  - Round 1 finding 已修复。
  - Round 2 新 findings 为 0。
  - CR TODO 数量为 0，误报数量为 0。
  - 不需要 fixer。
- **验证结果**:
  - `npm test -- test/resolve-cli.test.ts test/resolve-readers.test.ts test/contract-anchors.test.ts`：通过，3 files / 26 tests。
- **下一步判断**: 启动 fresh sub-agent 执行 `bmenhance-cr-04-rules-extractor`。

## 2026-06-16 — Attempt 8

- **Story**: `8-5-resolve-command-support-output`
- **方案**: 启动 fresh sub-agent 执行 `bmenhance-cr-04-rules-extractor`，分析本 Story CR/evaluation/fix 记录是否能提取可推广规则。
- **选择原因**: Reviewer/evaluator 已通过，按 orchestrator 必须先执行 04，再执行 05/06。
- **执行结果**: 04 完成，生成 Story 级规则提取总结。
- **输出文件**: `_bmad-output/implementation-artifacts/code-reviews/8-5-code-review/8-5-cr-rules-extraction-20260616.md`
- **规则结论**:
  - 提取候选规则 `CAND-CR-API-8-5-01`。
  - 晋升分数 `5/12`，结论 `candidate-only`。
  - 未更新全局/项目级规则文档。
  - 无需 05 TODO Tracker 处理的 backlog 项。
- **下一步判断**: 仍按流程启动 fresh `bmenhance-cr-05-todo-tracker` 做无待办确认。

## 2026-06-16 — Attempt 9

- **Story**: `8-5-resolve-command-support-output`
- **方案**: 启动 fresh sub-agent 执行 `bmenhance-cr-05-todo-tracker`，确认是否存在需要登记的 deferred CR TODO。
- **选择原因**: 04 明确无需 backlog，但 orchestrator 要求 05 阶段仍需串行执行并记录结果。
- **执行结果**: 05 完成，未新增/更新 CR TODO。
- **Backlog 文件**: `_bmad-output/implementation-artifacts/cr-rules/cr-todo-backlog.md`
- **结论**:
  - Backlog 变更为 0。
  - 不需要后续 CR TODO backlog 处理。
  - 未执行 06，未启动后续 Story，未 stage/commit/push。
- **下一步判断**: 启动 fresh sub-agent 执行 `bmenhance-cr-06-finalizer`。

## 2026-06-16 — Attempt 10

- **Story**: `8-5-resolve-command-support-output`
- **方案**: 启动 fresh sub-agent 执行 `bmenhance-cr-06-finalizer`，在 CR Approved 后更新 Story 和 sprint tracking。
- **选择原因**: 04/05 已完成，Story 只有在 06 同步状态后才可视为 done。
- **执行结果**: 06 完成。
- **修改文件**:
  - `_bmad-output/implementation-artifacts/stories/8-5-resolve-command-support-output.md`
  - `_bmad-output/implementation-artifacts/sprint-status.yaml`
- **状态结果**:
  - Story status: `done`
  - Sprint status: `8-5-resolve-command-support-output: done`
  - Epic 8: 保持 `in-progress`
  - `8-6` / `8-7`: 保持 `ready-for-dev`
  - `_bmad-output/planning-artifacts/bmm-workflow-status.yaml` 不存在，已跳过且未创建。
- **验证结果**:
  - Ruby 解析并校验 `sprint-status.yaml`：`8-5=done`、`epic-8=in-progress`、`8-6/8-7=ready-for-dev`。
- **终态判断**: Story 8.5 严格串行 dev/CR/04/05/06 闭环完成。下一步进入 Story 8.6。
