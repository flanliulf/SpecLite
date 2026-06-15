# EXPERIMENTS

## 2026-06-16 02:34 CST — Attempt 1

- **Story**: `8-2-install-outcome-oriented-output`
- **方案**: 按 `goal-orchestrator-epic-story-code-review-runner` 启动 Story 8.2 严格串行闭环，先初始化 code review 目录与三份中文进度文件，再启动 fresh dev sub-agent。
- **选择原因**: Story 8.1 已完成 04/05/06 并标记 `done`；Epic 8 下一个 `ready-for-dev` Story 是 8.2。按 orchestrator 要求，当前 Story 完成后才能进入下一个 Story。
- **前置结果**:
  - Story 文件存在，状态为 `ready-for-dev`。
  - `sprint-status.yaml` 中 `8-2-install-outcome-oriented-output: ready-for-dev`。
  - 当前工作树已有 Story 8.1 目标内改动，属于本 Epic 8 目标范围。
  - 未发现 Story 8.2 既有 code-review 产物。
- **当前结果**: 已创建本目录与三份初始进度文件。
- **下一步判断**: 启动 fresh dev sub-agent 执行 `/bmad-dev-story story 8-2`。

## 2026-06-16 — Attempt 2

- **Story**: `8-2-install-outcome-oriented-output`
- **方案**: 启动 fresh dev sub-agent 执行 `/bmad-dev-story story 8-2`。
- **选择原因**: Story 8.2 为当前 Epic 8 顺序中的下一个 `ready-for-dev` Story，且 code-review 进度文件已初始化。按 orchestrator 流程必须先完成开发，不能直接进入 CR。
- **执行结果**: 开发完成，Story 进入 `review`。
- **主要修改范围**:
  - `src/cli/messages.ts`：新增 install outcome 文案与 locale catalog 支持。
  - `src/diagnostics/output.ts`：扩展 install human renderer，基于既有 install state 推导 outcome-oriented human output。
  - `test/install-outcome-human-output.test.ts`：新增 install outcome focused tests。
  - Story 文件与 `sprint-status.yaml`：记录 Story 8.2 完成状态并进入 `review`。
- **验证结果**:
  - `npm test -- test/install-outcome-human-output.test.ts`：RED 阶段 5 tests failed。
  - `npm test -- test/install-outcome-human-output.test.ts`：GREEN 阶段 5 tests passed。
  - `npm test -- test/cli-smoke.test.ts test/install-progress-ready-summary.test.ts test/install-module-selection.test.ts`：通过，3 files / 31 tests passed。
  - `npm run build`：通过。
  - `npm test`：通过，49 files / 342 tests passed。
  - `git diff --check`：通过。
- **Build side effect**: `npm run build` 曾导致 `release/packaging-manifest.json` hash drift，已恢复，最终无 diff。
- **HALT / 遗留风险**: 无。
- **下一步判断**: 启动 fresh reviewer sub-agent 执行 `/bmenhance-cr-01-reviewer 8-2`。

## 2026-06-16 — Attempt 3

- **Story**: `8-2-install-outcome-oriented-output`
- **方案**: 启动 fresh reviewer sub-agent 执行 `/bmenhance-cr-01-reviewer 8-2`。
- **选择原因**: Story 已进入 `review`，按用户流程必须先审查，不能直接进入 evaluator 或 fixer。
- **执行结果**: Round 1 review 完成，结论不通过。
- **输出文件**: `_bmad-output/implementation-artifacts/code-reviews/8-2-code-review/8-2-code-review-summary-20260616-round-1.md`
- **发现摘要**:
  - Finding 1：真实 `prewrite-paused` 分支缺少 AC1 要求的 `speclite install <target> --yes` 与 `speclite install <target> --interactive` 两条 Next Actions；当前 focused test 只覆盖 synthetic renderer result，未覆盖真实 CLI / `runInstallCommand()` prewrite branch。
- **分类 / 严重性**: `patch` 1 个，`[中]` 1 个。
- **验证证据**: reviewer 记录 focused install outcome tests、既有 install tests、`npm run build`、`npm test`、`git diff --check` 通过；定向复现真实 CLI prewrite branch 失败。
- **降级说明**: reviewer 内部 Agent 工具不可用，已按 CR-01 降级为当前模型串行三层视角审查。
- **下一步判断**: 启动 fresh evaluator sub-agent 执行 `/bmenhance-cr-02-evaluator 8-2`，独立评估 review finding。

## 2026-06-16 — Attempt 4

- **Story**: `8-2-install-outcome-oriented-output`
- **方案**: 启动 fresh evaluator sub-agent 执行 `/bmenhance-cr-02-evaluator 8-2`。
- **选择原因**: reviewer 未通过后必须先由 evaluator 独立评估发现有效性和优先级，不能直接修复。
- **执行结果**: Round 1 evaluation 完成，结论不通过，未 Approved。
- **输出文件**: `_bmad-output/implementation-artifacts/code-reviews/8-2-code-review/8-2-code-review-evaluation-20260616-round-1.md`
- **评估摘要**:
  - 需要修复：1 个 P1。
  - CR TODO：0。
  - 误报：0。
- **修复范围**:
  - 修复真实 `prewrite-paused` branch 的 Next Actions，确保包含 AC1 要求的 `speclite install <target> --yes` 与 `speclite install <target> --interactive`。
  - 补充真实 CLI / command-level focused test，避免 synthetic renderer result 掩盖真实分支缺口。
- **下一步判断**: 启动 fresh fixer sub-agent 执行 `/bmenhance-cr-03-fixer 8-2`，只修复 evaluator 确认的 1 个 P1 阻塞项。

## 2026-06-16 — Attempt 5

- **Story**: `8-2-install-outcome-oriented-output`
- **方案**: 启动 fresh fixer sub-agent 执行 `/bmenhance-cr-03-fixer 8-2`。
- **选择原因**: evaluator 明确 Finding #1 为 P1 阻塞项，必须修复；本轮无 CR TODO 或误报。
- **执行结果**: 1 个 P1 阻塞项已修复，修复记录已追加到 evaluation 文件。
- **修改摘要**:
  - `src/commands/install.ts`：真实 `prewrite-paused` branch 传入 target display path；未授权写入分支输出 `speclite install <target> --yes` 与 `speclite install <target> --interactive`。
  - `test/install-outcome-human-output.test.ts`：新增真实 command result 与真实 CLI focused test。
  - `8-2-code-review-evaluation-20260616-round-1.md`：追加修复执行记录。
- **验证结果**:
  - `npx vitest run test/install-outcome-human-output.test.ts`：通过，1 file / 6 tests。
  - `npm test -- test/cli-smoke.test.ts test/install-progress-ready-summary.test.ts test/install-module-selection.test.ts`：通过，3 files / 31 tests。
  - `npm run build`：通过。
  - `npm test`：通过，49 files / 343 tests。
  - `git diff --check`：通过。
- **Build side effect**: 主 agent 复核时发现 `release/packaging-manifest.json` `packageHash` drift，已精确恢复，当前该文件无 diff。
- **下一步判断**: 必须回到 reviewer Round 2，然后 evaluator Round 2；不能直接收尾。

## 2026-06-16 — Attempt 6

- **Story**: `8-2-install-outcome-oriented-output`
- **方案**: 启动 fresh reviewer sub-agent 执行 `/bmenhance-cr-01-reviewer 8-2` Round 2。
- **选择原因**: fixer 完成后必须重新 review，确认 P1 修复没有引入新阻塞项。
- **执行结果**: Round 2 review 通过。
- **输出文件**: `_bmad-output/implementation-artifacts/code-reviews/8-2-code-review/8-2-code-review-summary-20260616-round-2.md`
- **审查摘要**:
  - Round 1 P1 blocker 已确认修复。
  - 阻塞项：0。
  - 新 `decision_needed`：0。
  - 新 `patch`：0。
  - 新 `defer`：0。
- **验证证据**: reviewer 记录 focused tests、Story 指定 install tests、`npm run build`、`npm test`、`git diff --check`、真实 CLI 定向复现均通过；`release/packaging-manifest.json` 无 diff。
- **下一步判断**: 启动 fresh evaluator sub-agent 执行 `/bmenhance-cr-02-evaluator 8-2` Round 2。

## 2026-06-16 — Attempt 7

- **Story**: `8-2-install-outcome-oriented-output`
- **方案**: 启动 fresh evaluator sub-agent 执行 `/bmenhance-cr-02-evaluator 8-2` Round 2。
- **选择原因**: 用户 gate 要求 reviewer 与 evaluator 均通过后才能退出 CR 循环。
- **执行结果**: Round 2 evaluation 通过，Approved。
- **输出文件**: `_bmad-output/implementation-artifacts/code-reviews/8-2-code-review/8-2-code-review-evaluation-20260616-round-2.md`
- **评估摘要**:
  - 需要修复：0。
  - CR TODO：0。
  - 误报：0。
  - 下一步 fixer：不需要。
- **Residual risk**: evaluator Round 2 为只读评估，未重新运行测试；验证证据来自 reviewer Round 2 summary。
- **下一步判断**: 进入固定收尾顺序，先启动 04 rules extractor。

## 2026-06-16 — Attempt 8

- **Story**: `8-2-install-outcome-oriented-output`
- **方案**: 启动 fresh rules extractor sub-agent 执行 `/bmenhance-cr-04-rules-extractor 8-2`，默认 `analysis-only`。
- **选择原因**: reviewer Round 2 与 evaluator Round 2 均已通过，按 orchestrator 固定收尾顺序必须先执行 04，再进入 05/06。
- **执行结果**: 04 完成只读 CR 历史分析和规则提炼，未修改任何文件。
- **读取记录**:
  - `8-2-code-review-summary-20260616-round-1.md`
  - `8-2-code-review-evaluation-20260616-round-1.md`
  - `8-2-code-review-summary-20260616-round-2.md`
  - `8-2-code-review-evaluation-20260616-round-2.md`
  - Round 1 evaluation 内嵌的 `## 修复执行记录`
- **升格判定**:
  - 真实用户可见 CLI / command output 的 AC 不得只用 synthetic renderer result 证明：作为新增规则不通过，已有 `CR-API-03` 等价覆盖；`6/12`，可作为既有 `CR-API-03` 的证据补充候选。
  - Story 8.2 特定 `prewrite-paused` 命令组合要求：只绑定当前 Story AC，不沉淀。
- **全局文档候选**: 无。
- **05 TODO 候选**: 无。
- **下一步判断**: 继续启动 fresh 05 todo tracker。由于 04 与 evaluator Round 2 均无 TODO 候选，05 预期只做检查并确认 backlog 无需变更。

## 2026-06-16 — Attempt 9

- **Story**: `8-2-install-outcome-oriented-output`
- **方案**: 启动 fresh TODO tracker sub-agent 执行 `/bmenhance-cr-05-todo-tracker 8-2`，按无 TODO 候选场景执行 check/extract 验证。
- **选择原因**: 04 rules extractor 无 05 TODO 候选，evaluator Round 2 明确 CR TODO 为 0；但 orchestrator 要求 04 后仍需执行 05 并记录结果。
- **执行结果**: 05 完成，无 backlog 写入。
- **检查记录**:
  - `8-2-code-review-summary-20260616-round-1.md`
  - `8-2-code-review-evaluation-20260616-round-1.md`
  - `8-2-code-review-summary-20260616-round-2.md`
  - `8-2-code-review-evaluation-20260616-round-2.md`
  - `_bmad-output/implementation-artifacts/cr-rules/cr-todo-backlog.md`
- **匹配结果**:
  - 未发现 Story 8.2 需要处理的 open/in-progress 相关 TODO。
  - backlog 当前有 `TODO-009`、`TODO-010`、`TODO-011` 三条 open、0 条 in-progress，但涉及文件不匹配 Story 8.2 的 File List。
  - 未发现新增非阻塞 TODO 候选。
- **下一步判断**: 启动 fresh finalizer sub-agent 执行 `/bmenhance-cr-06-finalizer 8-2`。

## 2026-06-16 — Attempt 10

- **Story**: `8-2-install-outcome-oriented-output`
- **方案**: 启动 fresh finalizer sub-agent 执行 `/bmenhance-cr-06-finalizer 8-2`。
- **选择原因**: 04 与 05 已完成，且最新 evaluator 为 Approved；按 CR closeout 顺序必须执行 06 才能关闭当前 Story。
- **执行结果**: 06 完成，Story 8.2 已标记为 `done`。
- **状态变化**:
  - Story 文件：`Status: review` -> `Status: done`
  - `sprint-status.yaml`：`8-2-install-outcome-oriented-output: review` -> `done`
  - `sprint-status.yaml`：`last_updated` 更新为 `2026-06-16 03:06 CST`
- **跳过项**: `_bmad-output/planning-artifacts/bmm-workflow-status.yaml` 不存在，按 skill 规则跳过，未创建。
- **Epic 状态**: Epic 8 仍为 `in-progress`；`8-3` 到 `8-7` 仍为 `ready-for-dev`。
- **下一步判断**: Story 8.2 闭环完成，可以进入 Story 8.3。
