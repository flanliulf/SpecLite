# EXPERIMENTS

## 2026-06-16 01:46 CST — Attempt 1

- **Story**: `8-1-shared-cli-outcome-and-presentation-contract`
- **方案**: 按 `goal-orchestrator-epic-story-code-review-runner` 启动 Story 级严格串行闭环，先初始化 code review 目录与三份中文进度文件，再启动第一个 fresh sub-agent 开发。
- **选择原因**: 用户要求执行 Epic 8 Story 开发与 CR 闭环；skill 要求同一时间只推进一个 Story、一个步骤，且每个 Story 维护 `PLAN.md`、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md`。
- **前置结果**:
  - Story 文件存在，状态为 `ready-for-dev`。
  - Epic 8 Story 范围为 `8-1` 到 `8-7`。
  - 当前工作树干净。
  - 当前分支 `main...origin/main [ahead 1]`，上一轮 SR commit 未 push。
  - 未发现 Epic 8 既有 code-review 产物。
- **当前结果**: 已创建本目录与三份初始进度文件。
- **下一步判断**: 启动 fresh dev sub-agent 执行 `/bmad-dev-story story 8-1`。

## 2026-06-16 — Attempt 2

- **Story**: `8-1-shared-cli-outcome-and-presentation-contract`
- **方案**: 启动 fresh dev sub-agent 执行 `/bmad-dev-story story 8-1`。
- **选择原因**: Story 8.1 为 Epic 8 的第一个 `ready-for-dev` Story，且 code-review 进度文件已初始化。按 orchestrator 流程必须先完成开发，不能直接进入 CR。
- **执行结果**: 开发完成，Story 进入 `review`。
- **主要修改范围**:
  - `src/cli/messages.ts`：扩展 `zh-CN` / `en-US` message catalog 与 lookup。
  - `src/diagnostics/output.ts`：新增共享 human presentation frame，并迁移 install/status/validate/update human renderer 到 shared primitive。
  - `test/cli-output-presentation.test.ts`：新增 focused presentation tests。
  - Story 文件与 `sprint-status.yaml`：记录 Story 8.1 完成状态并进入 `review`。
- **验证结果**:
  - `npm test -- test/cli-output-presentation.test.ts`：通过，4 tests passed。
  - `npm test -- test/cli-smoke.test.ts test/status-command.test.ts test/validate-command.test.ts test/update-command.test.ts`：通过，49 tests passed。
  - `npm run build`：通过。
  - `npm test`：通过，48 files / 335 tests passed。
  - `git diff --check`：通过。
  - `lint`：`package.json` 无 `lint` script，不适用。
- **HALT / 遗留风险**: 无。
- **下一步判断**: 启动 fresh reviewer sub-agent 执行 `/bmenhance-cr-01-reviewer 8-1`。

## 2026-06-16 — Attempt 3

- **Story**: `8-1-shared-cli-outcome-and-presentation-contract`
- **方案**: 启动 fresh reviewer sub-agent 执行 `/bmenhance-cr-01-reviewer 8-1`。
- **选择原因**: Story 已进入 `review`，按用户流程必须先审查，不能直接进入 evaluator 或 fixer。
- **执行结果**: Round 1 review 完成，结论不通过。
- **输出文件**: `_bmad-output/implementation-artifacts/code-reviews/8-1-code-review/8-1-code-review-summary-20260616-round-1.md`
- **发现摘要**:
  - Finding 1：install ready summary 已完成写入后仍显示未写入。
  - Finding 2：validate `zh-CN` empty state 仍混入英文硬编码文案。
- **分类 / 严重性**: `patch` 2 个，均为 `[中]`。
- **验证证据**: reviewer 记录 focused presentation tests、`npm run build`、`npm test`、`git diff --check` 通过；`npm run lint` 因仓库无 `lint` script 不适用。
- **降级说明**: reviewer 内部 Agent 工具不可用，已按 CR-01 降级为当前模型串行三层视角审查。
- **下一步判断**: 启动 fresh evaluator sub-agent 执行 `/bmenhance-cr-02-evaluator 8-1`，独立评估 review findings。

## 2026-06-16 — Attempt 4

- **Story**: `8-1-shared-cli-outcome-and-presentation-contract`
- **方案**: 启动 fresh evaluator sub-agent 执行 `/bmenhance-cr-02-evaluator 8-1`。
- **选择原因**: reviewer 未通过后必须先由 evaluator 独立评估发现有效性和优先级，不能直接修复。
- **执行结果**: Round 1 evaluation 完成，结论不通过，未 Approved。
- **输出文件**: `_bmad-output/implementation-artifacts/code-reviews/8-1-code-review/8-1-code-review-evaluation-20260616-round-1.md`
- **评估摘要**:
  - 需要修复：2 个 P1。
  - CR TODO：0。
  - 误报：0。
- **修复范围**:
  - Finding 1：install ready summary 写入状态误报。
  - Finding 2：validate `zh-CN` empty state 英文硬编码。
- **下一步判断**: 启动 fresh fixer sub-agent 执行 `/bmenhance-cr-03-fixer 8-1`，只修复 evaluator 确认的 2 个 P1 阻塞项。

## 2026-06-16 — Attempt 5

- **Story**: `8-1-shared-cli-outcome-and-presentation-contract`
- **方案**: 启动 fresh fixer sub-agent 执行 `/bmenhance-cr-03-fixer 8-1`。
- **选择原因**: evaluator 明确 Finding #1 与 Finding #2 均为 P1 阻塞项，必须修复；本轮无 CR TODO 或误报。
- **执行结果**: 2 个 P1 阻塞项已修复，修复记录已追加到 evaluation 文件。
- **修改摘要**:
  - `src/diagnostics/output.ts`：shared presentation frame 增加 `writeState` 覆盖；install ready summary 标记为已写入。
  - `src/cli/messages.ts`：新增 validate-specific empty state locale keys。
  - `test/cli-output-presentation.test.ts`：补充 install ready/prewrite 写入状态回归和 validate `zh-CN` empty state 回归。
  - `8-1-code-review-evaluation-20260616-round-1.md`：追加修复执行记录。
- **验证结果**:
  - `npm test -- test/cli-output-presentation.test.ts`：通过，6 tests。
  - `npm test -- test/validate-command.test.ts`：通过，18 tests。
  - `npm test -- test/cli-smoke.test.ts`：通过，11 tests。
  - `npm test -- test/status-command.test.ts test/update-command.test.ts test/update-planning.test.ts test/install-progress-ready-summary.test.ts test/install-module-selection.test.ts`：通过，60 tests。
  - `npm run build`：通过。
  - `npm test`：通过，48 files / 337 tests。
  - `git diff --check`：通过。
- **下一步判断**: 必须回到 reviewer Round 2，然后 evaluator Round 2；不能直接收尾。

## 2026-06-16 — Attempt 6

- **Story**: `8-1-shared-cli-outcome-and-presentation-contract`
- **方案**: 启动 fresh reviewer sub-agent 执行 `/bmenhance-cr-01-reviewer 8-1` Round 2。
- **选择原因**: fixer 完成后必须重新 review，确认 P1 修复没有引入新阻塞项。
- **执行结果**: Round 2 review 通过。
- **输出文件**: `_bmad-output/implementation-artifacts/code-reviews/8-1-code-review/8-1-code-review-summary-20260616-round-2.md`
- **审查摘要**:
  - Round 1 两个 P1 blocker 已确认修复。
  - 阻塞项：0。
  - 新 `decision_needed`：0。
  - 新 `patch`：0。
- **验证证据**: reviewer 记录 focused tests、`npm run build`、`npm test`、`git diff --check` 通过；`npm run lint` 因无 `lint` script 不适用。
- **下一步判断**: 启动 fresh evaluator sub-agent 执行 `/bmenhance-cr-02-evaluator 8-1` Round 2。

## 2026-06-16 — Attempt 7

- **Story**: `8-1-shared-cli-outcome-and-presentation-contract`
- **方案**: 启动 fresh evaluator sub-agent 执行 `/bmenhance-cr-02-evaluator 8-1` Round 2。
- **选择原因**: 用户 gate 要求 reviewer 与 evaluator 均通过后才能退出 CR 循环。
- **执行结果**: Round 2 evaluation 通过，Approved。
- **输出文件**: `_bmad-output/implementation-artifacts/code-reviews/8-1-code-review/8-1-code-review-evaluation-20260616-round-2.md`
- **评估摘要**:
  - 需要修复：0。
  - CR TODO：0。
  - 误报：0。
  - 下一步 fixer：不需要。
- **下一步判断**: 进入固定收尾顺序，先启动 04 rules extractor。

## 2026-06-16 — Attempt 8

- **Story**: `8-1-shared-cli-outcome-and-presentation-contract`
- **方案**: 启动 fresh rules extractor sub-agent 执行 `/bmenhance-cr-04-rules-extractor 8-1`，默认 `analysis-only`。
- **选择原因**: reviewer Round 2 与 evaluator Round 2 均已通过，按 orchestrator 固定收尾顺序必须先执行 04，再进入 05/06。
- **执行结果**: 04 完成只读 CR 历史分析和规则提炼，未修改任何文件。
- **读取记录**:
  - `8-1-code-review-summary-20260616-round-1.md`
  - `8-1-code-review-summary-20260616-round-2.md`
  - `8-1-code-review-evaluation-20260616-round-1.md`
  - `8-1-code-review-evaluation-20260616-round-2.md`
- **升格判定**:
  - `writeState` 必须来自 command-aware write state：`7/12`，建议作为 `cr-rules-summary.md` 候选。
  - Locale-specific natural language empty state 必须走 message catalog：`6/12`，建议作为 `cr-rules-summary.md` 候选。
- **全局文档候选**: 无。
- **05 TODO 候选**: 无。
- **下一步判断**: 继续启动 fresh 05 todo tracker。由于 04 与 evaluator Round 2 均无 TODO 候选，05 预期只做检查并确认 backlog 无需变更。

## 2026-06-16 — Attempt 9

- **Story**: `8-1-shared-cli-outcome-and-presentation-contract`
- **方案**: 启动 fresh TODO tracker sub-agent 执行 `/bmenhance-cr-05-todo-tracker 8-1`，按无 TODO 候选场景执行 check/extract 验证。
- **选择原因**: 04 rules extractor 无 05 TODO 候选，evaluator Round 2 明确 CR TODO 为 0；但 orchestrator 要求 04 后仍需执行 05 并记录结果。
- **执行结果**: 05 完成，无 backlog 写入。
- **检查记录**:
  - `8-1-code-review-summary-20260616-round-1.md`
  - `8-1-code-review-summary-20260616-round-2.md`
  - `8-1-code-review-evaluation-20260616-round-1.md`
  - `8-1-code-review-evaluation-20260616-round-2.md`
  - `_bmad-output/implementation-artifacts/cr-rules/cr-todo-backlog.md`
- **匹配结果**:
  - 未发现 Story 8.1 需要处理的 open/in-progress 相关 TODO。
  - 既有 `TODO-011` 与 `src/diagnostics/output.ts` 路径重叠，但建议时机是 Epic 7 的 `sync` / `uninstall` failure renderer，不构成本 Story 处理项。
  - 未发现新增非阻塞 TODO 候选。
- **下一步判断**: 启动 fresh finalizer sub-agent 执行 `/bmenhance-cr-06-finalizer 8-1`。

## 2026-06-16 — Attempt 10

- **Story**: `8-1-shared-cli-outcome-and-presentation-contract`
- **方案**: 启动 fresh finalizer sub-agent 执行 `/bmenhance-cr-06-finalizer 8-1`。
- **选择原因**: 04 与 05 已完成，且最新 evaluator 为 Approved；按 CR closeout 顺序必须执行 06 才能关闭当前 Story。
- **执行结果**: 06 完成，Story 8.1 已标记为 `done`。
- **状态变化**:
  - Story 文件：`Status: review` -> `Status: done`
  - `sprint-status.yaml`：`8-1-shared-cli-outcome-and-presentation-contract: review` -> `done`
  - `sprint-status.yaml`：`last_updated` 更新为 `2026-06-16 02:32 CST`
- **跳过项**: `_bmad-output/planning-artifacts/bmm-workflow-status.yaml` 不存在，按 skill 规则跳过，未创建。
- **Epic 状态**: Epic 8 仍为 `in-progress`；`8-2` 到 `8-7` 仍为 `ready-for-dev`。
- **下一步判断**: Story 8.1 闭环完成，可以进入 Story 8.2。
