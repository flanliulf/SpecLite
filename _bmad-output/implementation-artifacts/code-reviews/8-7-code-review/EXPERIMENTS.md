# EXPERIMENTS

## 2026-06-16 06:48 CST — Attempt 1

- **Story**: `8-7-human-output-fixture-and-documentation-matrix`
- **方案**: 按 `goal-orchestrator-epic-story-code-review-runner` 启动 Story 8.7 严格串行闭环，先初始化 code review 目录与三份中文进度文件，再启动 fresh dev sub-agent。
- **选择原因**: Story 8.6 已完成 04/05/06 并标记 `done`；Epic 8 最后一个 `ready-for-dev` Story 是 8.7。按 orchestrator 要求，当前 Story 完成后才能进入最终验证与提交。
- **前置结果**:
  - Story 文件存在，状态为 `ready-for-dev`。
  - `sprint-status.yaml` 中 `8-7-human-output-fixture-and-documentation-matrix: ready-for-dev`。
  - `8-1` 到 `8-6` 已为 `done`。
  - `epic-8` 仍为 `in-progress`。
  - 当前工作树已有 Story 8.1 到 8.6 目标内改动，属于本 Epic 8 目标范围。
  - 未发现 Story 8.7 既有 code-review 产物。
- **当前结果**: 已创建本目录与三份初始进度文件。
- **下一步判断**: 启动 fresh dev sub-agent 执行 `/bmad-dev-story story 8-7`。

## 2026-06-16 — Attempt 2

- **Story**: `8-7-human-output-fixture-and-documentation-matrix`
- **方案**: 启动 fresh dev sub-agent 执行 `/bmad-dev-story story 8-7`。
- **选择原因**: Story 8.7 为 Epic 8 最后一个 `ready-for-dev` Story，且 code-review 进度文件已初始化。按 orchestrator 流程必须先完成开发，不能直接进入 CR 或最终提交。
- **执行结果**: 开发完成，Story 进入 `review`。
- **主要修改范围**:
  - 新增 `docs/reference/cli-human-output-matrix.md`。
  - 新增 `test/cli-human-output-matrix.test.ts`。
  - 更新 README、quick-start、CLI reference、how-to docs 与 docs index，区分 read-only / prewrite preview / write-authorized / repair-authorized / validation flows。
  - Story 文件与 `sprint-status.yaml`：记录 Story 8.7 完成开发并进入 `review`。
- **验证结果**:
  - `npm test -- test/cli-human-output-matrix.test.ts`：通过，4 tests。
  - Focused CLI output tests：通过，9 files / 96 tests。
  - `npm run build`：通过。
  - `npm test`：通过，51 files / 367 tests。
  - `npm run release:packaging-check`：通过。
  - `git diff --check`：通过。
- **Build / release side effect**: `release/packaging-manifest.json` packageHash drift 已恢复，当前无 diff。
- **HALT / 遗留风险**: 无。
- **下一步判断**: 启动 fresh reviewer sub-agent 执行 `/bmenhance-cr-01-reviewer 8-7`。

## 2026-06-16 — Attempt 3

- **Story**: `8-7-human-output-fixture-and-documentation-matrix`
- **方案**: 启动 fresh reviewer sub-agent 执行 `/bmenhance-cr-01-reviewer 8-7`。
- **选择原因**: Story 已进入 `review`，按用户流程必须先审查，不能直接进入 evaluator 或 finalizer。
- **执行结果**: Round 1 review 完成，结论不通过。
- **输出文件**: `_bmad-output/implementation-artifacts/code-reviews/8-7-code-review/8-7-code-review-summary-20260616-round-1.md`
- **发现摘要**:
  - Finding 1：`docs/reference/cli.md` 把 `--locale` 写入不支持的 `init/list` option 表，同时漏列真实支持 `--locale` 的 `status/validate`。
- **分类 / 严重性**: `patch` 1 个，`[中]` 1 个。
- **验证证据**:
  - Matrix focused test、focused CLI output tests、`npm run build`、`npm test`、`npm run release:packaging-check`、`git diff --check` 均通过。
  - 定向 CLI smoke 复现 `init/list --locale` 为 unknown option，`status/validate --help` 列出 `--locale`。
- **Build / release side effect**: `release/packaging-manifest.json` packageHash drift 已恢复，当前无 diff。
- **下一步判断**: 启动 fresh evaluator sub-agent 执行 `/bmenhance-cr-02-evaluator 8-7`，独立评估 review finding。

## 2026-06-16 — Attempt 4

- **Story**: `8-7-human-output-fixture-and-documentation-matrix`
- **方案**: 启动 fresh evaluator sub-agent 执行 `/bmenhance-cr-02-evaluator 8-7`，只评估最新 CR summary，不修改代码、测试、Story、sprint status 或进度文件。
- **选择原因**: Reviewer Round 1 未通过，按 CR 闭环必须先由 evaluator 判定 finding 是否有效、是否阻塞、是否需要 fixer。
- **执行结果**: Evaluator Round 1 完成，结论 `not approved`。
- **输出文件**: `_bmad-output/implementation-artifacts/code-reviews/8-7-code-review/8-7-code-review-evaluation-20260616-round-1.md`
- **评估摘要**:
  - Finding 1 确认有效，非误报。
  - 严重性评估为 P1，阻塞交付。
  - 该问题违反 Story 8.7 AC4。
  - 阻塞修复项数量为 1，非阻塞 CR TODO 为 0，误报为 0。
- **下一步判断**: 启动 fresh fixer sub-agent 执行 `/bmenhance-cr-03-fixer 8-7`；修复后必须重新执行 reviewer/evaluator。

## 2026-06-16 — Attempt 5

- **Story**: `8-7-human-output-fixture-and-documentation-matrix`
- **方案**: 启动 fresh fixer sub-agent 执行 `/bmenhance-cr-03-fixer 8-7`，只修复 Evaluation Round 1 确认的 P1 finding。
- **选择原因**: Evaluator 已判定 finding 有效且阻塞交付，按 CR 闭环必须先修复，再重新 reviewer/evaluator。
- **执行结果**: Fixer Round 1 完成，finding 标记为 fixed，并在 evaluation 文件末尾追加 `## 修复执行记录`。
- **修复摘要**:
  - 从 `Init Options` / `List Options` 删除 `--locale <locale>`。
  - 在 `Status Options` / `Validate Options` 增加 `--locale <locale>`。
  - 新增 focused docs/reference option parity test。
- **验证结果**:
  - `npm test -- test/docs-reference-cli-options.test.ts`：通过，1 file / 1 test。
  - `npm test -- test/docs-reference-cli-options.test.ts test/cli-human-output-matrix.test.ts`：通过，2 files / 5 tests。
  - `npm run build`：通过。
  - `npm test`：通过，52 files / 368 tests。
  - `npm run release:packaging-check`：通过。
  - `git diff --check`：通过。
  - `release/packaging-manifest.json` packageHash drift 已恢复，当前无 diff。
- **下一步判断**: 启动 fresh reviewer sub-agent 执行 `/bmenhance-cr-01-reviewer 8-7` Round 2。

## 2026-06-16 — Attempt 6

- **Story**: `8-7-human-output-fixture-and-documentation-matrix`
- **方案**: 启动 fresh reviewer sub-agent 执行 `/bmenhance-cr-01-reviewer 8-7` Round 2，复核 CR-03 修复后的文档和测试。
- **选择原因**: CR-03 fixer 已完成，按闭环要求必须重新 reviewer/evaluator，不能直接进入 04/05/06。
- **执行结果**: Reviewer Round 2 完成，结论通过。
- **输出文件**: `_bmad-output/implementation-artifacts/code-reviews/8-7-code-review/8-7-code-review-summary-20260616-round-2.md`
- **发现摘要**:
  - Findings 数量为 0。
  - Round 1 option 表错位 finding 已复核为修复完成。
  - Docs/reference option parity test 覆盖 `init/list/status/validate --locale`。
- **验证结果**:
  - `npm test -- test/docs-reference-cli-options.test.ts`：通过，1 file / 1 test。
  - `npm test -- test/cli-human-output-matrix.test.ts`：通过，1 file / 4 tests。
  - `npm run build`：通过。
  - 构建后 CLI help parity smoke：通过。
  - `npm test`：通过，52 files / 368 tests。
  - `npm run release:packaging-check`：通过。
  - `git diff --check`：通过。
  - `release/packaging-manifest.json` / `dist/packaging-manifest.json` 当前无 diff。
- **下一步判断**: 启动 fresh evaluator sub-agent 执行 `/bmenhance-cr-02-evaluator 8-7` Round 2。

## 2026-06-16 — Attempt 7

- **Story**: `8-7-human-output-fixture-and-documentation-matrix`
- **方案**: 启动 fresh evaluator sub-agent 执行 `/bmenhance-cr-02-evaluator 8-7` Round 2，只评估最新 review summary 与修复闭环。
- **选择原因**: Reviewer Round 2 已通过，按 CR 闭环必须由 evaluator 做最终确认后才能进入 04/05/06。
- **执行结果**: Evaluator Round 2 完成，结论 Approved。
- **输出文件**: `_bmad-output/implementation-artifacts/code-reviews/8-7-code-review/8-7-code-review-evaluation-20260616-round-2.md`
- **评估摘要**:
  - Round 1 finding 已修复。
  - Round 2 新 findings 为 0。
  - CR TODO 数量为 0，误报数量为 0。
  - 不需要 fixer。
- **验证结果**:
  - `npm test -- test/docs-reference-cli-options.test.ts test/cli-human-output-matrix.test.ts`：通过，2 files / 5 tests。
- **下一步判断**: 启动 fresh sub-agent 执行 `bmenhance-cr-04-rules-extractor`。

## 2026-06-16 — Attempt 8

- **Story**: `8-7-human-output-fixture-and-documentation-matrix`
- **方案**: 启动 fresh sub-agent 执行 `bmenhance-cr-04-rules-extractor`，分析本 Story CR/evaluation/fix 记录是否能提取可推广规则。
- **选择原因**: Reviewer/evaluator 已通过，按 orchestrator 必须先执行 04，再执行 05/06。
- **执行结果**: 04 完成，生成 Story 级规则提取总结。
- **输出文件**: `_bmad-output/implementation-artifacts/code-reviews/8-7-code-review/8-7-cr-rules-extraction-20260616.md`
- **规则结论**:
  - 提取候选规则 `CAND-CR-DOC-8-7-01`。
  - 晋升分数 `7/12`，未达到全局文档规则阈值 `>= 8/12`。
  - 未更新全局/项目级规则文档。
  - 无需 05 TODO Tracker 处理的 backlog 项。
- **下一步判断**: 仍按流程启动 fresh `bmenhance-cr-05-todo-tracker` 做无待办确认。

## 2026-06-16 — Attempt 9

- **Story**: `8-7-human-output-fixture-and-documentation-matrix`
- **方案**: 启动 fresh sub-agent 执行 `bmenhance-cr-05-todo-tracker`，确认是否存在需要登记的 deferred CR TODO。
- **选择原因**: 04 明确无需 backlog，但 orchestrator 要求 05 阶段仍需串行执行并记录结果。
- **执行结果**: 05 完成，未新增/更新 CR TODO。
- **Backlog 文件**: `_bmad-output/implementation-artifacts/cr-rules/cr-todo-backlog.md`
- **结论**:
  - Backlog 变更为 0。
  - 不需要后续 CR TODO backlog 处理。
- **下一步判断**: 启动 fresh sub-agent 执行 `bmenhance-cr-06-finalizer`。

## 2026-06-16 — Attempt 10

- **Story**: `8-7-human-output-fixture-and-documentation-matrix`
- **方案**: 启动 fresh sub-agent 执行 `bmenhance-cr-06-finalizer`，在 CR Approved 后更新 Story 和 sprint tracking。
- **选择原因**: 04/05 已完成，Story 只有在 06 同步状态后才可视为 done；Story 8.7 是 Epic 8 最后一个开发 Story。
- **执行结果**: 06 完成。
- **修改文件**:
  - `_bmad-output/implementation-artifacts/stories/8-7-human-output-fixture-and-documentation-matrix.md`
  - `_bmad-output/implementation-artifacts/sprint-status.yaml`
- **状态结果**:
  - Story status: `done`
  - Sprint status: `8-7-human-output-fixture-and-documentation-matrix: done`
  - Epic 8: `done`
  - `epic-8-retrospective`: 保持 `optional`
  - `_bmad-output/planning-artifacts/bmm-workflow-status.yaml` 不存在，已跳过且未创建。
- **验证结果**:
  - latest evaluation Round 2 为 Approved，CR TODO 0，误报 0，不需要 fixer。
  - latest review Round 2 结论通过，findings 0。
  - `git diff --check -- <story> <sprint-status>` 通过。
- **终态判断**: Story 8.7 严格串行 dev/CR/04/05/06 闭环完成。Epic 8 所有 Story 已完成，下一步进入最终验证与本地提交。

## 2026-06-16 — Attempt 11

- **Story**: Epic 8 aggregate
- **方案**: 执行 Epic 8 最终验证，确认所有 Story 8.1-8.7 的开发、CR 记录、文档、测试与 tracking 文件可提交。
- **选择原因**: Story 8.7 finalizer 已将 Story 与 Epic 状态同步为 `done`；orchestrator 要求所有 Story 完成后再做最终验证与本地提交。
- **验证结果**:
  - Focused tests：11 files / 104 tests 通过。
  - `npm run build`：通过。
  - `npm test`：52 files / 368 tests 通过。
  - `npm run release:packaging-check`：通过。
  - `git diff --check`：通过。
  - `release/packaging-manifest.json` / `dist/packaging-manifest.json` 当前无 diff。
- **Build / release side effect**: `release:packaging-check` 写回的 canonical `packageHash` drift 已恢复，未纳入本次提交。
- **下一步判断**: 精确暂存 Epic 8 目标范围文件并创建中文 Conventional Commit；不 push。
