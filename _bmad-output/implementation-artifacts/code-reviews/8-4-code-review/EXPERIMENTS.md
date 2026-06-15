# EXPERIMENTS

## 2026-06-16 03:30 CST — Attempt 1

- **Story**: `8-4-status-and-validate-human-output-separation`
- **方案**: 按 `goal-orchestrator-epic-story-code-review-runner` 启动 Story 8.4 严格串行闭环，先初始化 code review 目录与三份中文进度文件，再启动 fresh dev sub-agent。
- **选择原因**: Story 8.3 已完成 04/05/06 并标记 `done`；Epic 8 下一个 `ready-for-dev` Story 是 8.4。按 orchestrator 要求，当前 Story 完成后才能进入下一个 Story。
- **前置结果**:
  - Story 文件存在，状态为 `ready-for-dev`。
  - `sprint-status.yaml` 中 `8-4-status-and-validate-human-output-separation: ready-for-dev`。
  - 当前工作树已有 Story 8.1 / 8.2 / 8.3 目标内改动，属于本 Epic 8 目标范围。
  - 未发现 Story 8.4 既有 code-review 产物。
- **当前结果**: 已创建本目录与三份初始进度文件。
- **下一步判断**: 启动 fresh dev sub-agent 执行 `/bmad-dev-story story 8-4`。

## 2026-06-16 — Attempt 2

- **Story**: `8-4-status-and-validate-human-output-separation`
- **方案**: 启动 fresh dev sub-agent 执行 `/bmad-dev-story story 8-4`。
- **选择原因**: Story 8.4 为当前 Epic 8 顺序中的下一个 `ready-for-dev` Story，且 code-review 进度文件已初始化。按 orchestrator 流程必须先完成开发，不能直接进入 CR。
- **执行结果**: 开发完成，Story 进入 `review`。
- **主要修改范围**:
  - `src/cli/messages.ts`：扩展 status / validate human outcome 文案。
  - `src/diagnostics/output.ts`：扩展 status / validate human renderer，保持 JSON contract 不变。
  - `test/status-command.test.ts`、`test/validate-command.test.ts`：补充 status / validate human outcome focused tests。
  - Story 文件与 `sprint-status.yaml`：记录 Story 8.4 完成状态并进入 `review`。
- **验证结果**:
  - `npm test -- test/status-command.test.ts test/validate-command.test.ts`：先红灯确认旧 outcome 不满足；实现后通过，2 files / 31 tests。
  - `npm run build`：通过。
  - `npm test`：通过，49 files / 348 tests。
  - `git diff --check`：通过。
- **Build side effect**: `npm run build` 曾导致 `release/packaging-manifest.json` hash drift，已恢复，最终无 diff。
- **HALT / 遗留风险**: 无。
- **下一步判断**: 启动 fresh reviewer sub-agent 执行 `/bmenhance-cr-01-reviewer 8-4`。

## 2026-06-16 — Attempt 3

- **Story**: `8-4-status-and-validate-human-output-separation`
- **方案**: 启动 fresh reviewer sub-agent 执行 `/bmenhance-cr-01-reviewer 8-4`。
- **选择原因**: Story 已进入 `review`，按用户流程必须先审查，不能直接进入 evaluator 或 fixer。
- **执行结果**: Round 1 review 完成，结论不通过。
- **输出文件**: `_bmad-output/implementation-artifacts/code-reviews/8-4-code-review/8-4-code-review-summary-20260616-round-1.md`
- **发现摘要**:
  - Finding 1：`validate` human output 未按 canonical order 展示 `checkedTargets`；输入 `agents, claude` 时输出保持非 canonical 顺序，预期为 `claude, agents`。
- **分类 / 严重性**: `patch` 1 个，`[中]` 1 个。
- **验证证据**: reviewer 记录 status/validate focused tests、`npm test`、`npm run build`、scoped `git diff --check` 通过；定向复现 `Checked targets: agents, claude`。
- **Build side effect**: 主 agent 复核时发现 `release/packaging-manifest.json` `packageHash` drift，已精确恢复，当前该文件无 diff。
- **降级说明**: reviewer 内部 Agent 工具不可用，已按 CR-01 降级为当前模型串行三层视角审查。
- **下一步判断**: 启动 fresh evaluator sub-agent 执行 `/bmenhance-cr-02-evaluator 8-4`，独立评估 review finding。

## 2026-06-16 — Attempt 4

- **Story**: `8-4-status-and-validate-human-output-separation`
- **方案**: 启动 fresh evaluator sub-agent 执行 `/bmenhance-cr-02-evaluator 8-4`。
- **选择原因**: reviewer 未通过后必须先由 evaluator 独立评估发现有效性和优先级，不能直接修复。
- **执行结果**: Round 1 evaluation 完成，结论不通过，未 Approved。
- **输出文件**: `_bmad-output/implementation-artifacts/code-reviews/8-4-code-review/8-4-code-review-evaluation-20260616-round-1.md`
- **评估摘要**:
  - 需要修复：1 个 P1。
  - CR TODO：0。
  - 误报：0。
- **修复范围**:
  - 在 `renderValidateHumanOutput()` 中复用 `sortCheckedTargets()`，确保 `Checked targets` 使用 canonical order。
  - 补充测试断言非 canonical 输入 `["agents", "claude"]` 输出为 `Checked targets: claude, agents`。
- **下一步判断**: 启动 fresh fixer sub-agent 执行 `/bmenhance-cr-03-fixer 8-4`，只修复 evaluator 确认的 1 个 P1 阻塞项。

## 2026-06-16 — Attempt 5

- **Story**: `8-4-status-and-validate-human-output-separation`
- **方案**: 启动 fresh fixer sub-agent 执行 `/bmenhance-cr-03-fixer 8-4`。
- **选择原因**: evaluator 明确 Finding #1 为 P1 阻塞项，必须修复；本轮无 CR TODO 或误报。
- **执行结果**: 1 个 P1 阻塞项已修复，修复记录已追加到 evaluation 文件。
- **修改摘要**:
  - `src/diagnostics/output.ts`：导入并复用 `sortCheckedTargets()`，使 validate human output 的 checked targets 使用 canonical order。
  - `test/validate-command.test.ts`：新增 focused test，覆盖 `checkedTargets: ["agents", "claude"]` 输出 `Checked targets: claude, agents`。
  - `8-4-code-review-evaluation-20260616-round-1.md`：追加修复执行记录。
- **验证结果**:
  - `npx vitest run test/validate-command.test.ts -t "sorts validate human checked targets by canonical target order"`：通过，1 test。
  - `npx vitest run test/status-command.test.ts test/validate-command.test.ts`：通过，2 files / 32 tests。
  - `npm run build`：通过。
  - `npm test`：通过，49 files / 349 tests。
  - `git diff --check`：通过。
- **Build side effect**: fixer 报告 `release/packaging-manifest.json` hash drift 已恢复；主 agent 复核当前该文件无 diff。
- **下一步判断**: 必须回到 reviewer Round 2，然后 evaluator Round 2；不能直接收尾。

## 2026-06-16 — Attempt 6

- **Story**: `8-4-status-and-validate-human-output-separation`
- **方案**: 启动 fresh reviewer sub-agent 执行 `/bmenhance-cr-01-reviewer 8-4` Round 2。
- **选择原因**: fixer 完成后必须重新 review，确认 P1 修复没有引入新阻塞项。
- **执行结果**: Round 2 review 通过。
- **输出文件**: `_bmad-output/implementation-artifacts/code-reviews/8-4-code-review/8-4-code-review-summary-20260616-round-2.md`
- **审查摘要**:
  - Round 1 P1 blocker 已确认修复。
  - 阻塞项：0。
  - 新 `decision_needed`：0。
  - 新 `patch`：0。
  - 新 `defer`：0。
- **验证证据**: reviewer 记录 focused checked targets test、status/validate tests、`npm test`、`npm run build`、`npm run release:packaging-check`、scoped `git diff --check`、定向复现均通过；`release/packaging-manifest.json` 无 diff。
- **下一步判断**: 启动 fresh evaluator sub-agent 执行 `/bmenhance-cr-02-evaluator 8-4` Round 2。

## 2026-06-16 — Attempt 7

- **Story**: `8-4-status-and-validate-human-output-separation`
- **方案**: 启动 fresh evaluator sub-agent 执行 `/bmenhance-cr-02-evaluator 8-4` Round 2。
- **选择原因**: 用户 gate 要求 reviewer 与 evaluator 均通过后才能退出 CR 循环。
- **执行结果**: Round 2 evaluation 通过，Approved。
- **输出文件**: `_bmad-output/implementation-artifacts/code-reviews/8-4-code-review/8-4-code-review-evaluation-20260616-round-2.md`
- **评估摘要**:
  - 需要修复：0。
  - CR TODO：0。
  - 误报：0。
  - 下一步 fixer：不需要。
- **Residual risk**: 无已知代码修复 residual risk；仅记录 reviewer 三层审查因环境限制降级为同一上下文串行审查，影响审查隔离性。
- **下一步判断**: 进入固定收尾顺序，先启动 04 rules extractor。

## 2026-06-16 — Attempt 8

- **Story**: `8-4-status-and-validate-human-output-separation`
- **方案**: 启动 fresh rules extractor sub-agent 执行 `/bmenhance-cr-04-rules-extractor 8-4`，默认 `analysis-only`。
- **选择原因**: reviewer Round 2 与 evaluator Round 2 均已通过，按 orchestrator 固定收尾顺序必须先执行 04，再进入 05/06。
- **执行结果**: 04 完成只读 CR 历史分析和规则提炼，未修改任何文件。
- **读取记录**:
  - `8-4-code-review-summary-20260616-round-1.md`
  - `8-4-code-review-evaluation-20260616-round-1.md`，含 `## 修复执行记录`
  - `8-4-code-review-summary-20260616-round-2.md`
  - `8-4-code-review-evaluation-20260616-round-2.md`
- **升格判定**:
  - 全局文档候选：无。
  - `cr-rules-summary.md` 候选：1 条，`validate` / diagnostics human renderer 对契约排序字段必须在 renderer 边界重新规范化，不得信任上游输入顺序；评分 `7/12`，需用户确认后才能写入。
  - 05 TODO 候选：无。
  - Story 8.4 局部 focused assertion 不单独沉淀。
- **下一步判断**: 继续启动 fresh 05 todo tracker。由于 04 与 evaluator Round 2 均无 TODO 候选，05 预期只做检查并确认 backlog 无需变更。

## 2026-06-16 — Attempt 9

- **Story**: `8-4-status-and-validate-human-output-separation`
- **方案**: 启动 fresh TODO tracker sub-agent 执行 `/bmenhance-cr-05-todo-tracker 8-4`，按无 TODO 候选场景执行 check/extract 验证。
- **选择原因**: 04 rules extractor 无 05 TODO 候选，evaluator Round 2 明确 CR TODO 为 0；但 orchestrator 要求 04 后仍需执行 05 并记录结果。
- **执行结果**: 05 完成，无 backlog 写入。
- **检查记录**:
  - `8-4-code-review-summary-20260616-round-1.md`
  - `8-4-code-review-summary-20260616-round-2.md`
  - `8-4-code-review-evaluation-20260616-round-1.md`
  - `8-4-code-review-evaluation-20260616-round-2.md`
  - `PLAN.md`、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md`
  - `_bmad-output/implementation-artifacts/cr-rules/cr-todo-backlog.md`
- **匹配结果**:
  - 未发现 Story 8.4 需要处理的 open/in-progress 相关 TODO。
  - 既有 `TODO-011` 涉及 `src/diagnostics/output.ts`，但建议时机限定为 `sync` / `uninstall` failure human output，不构成本 Story 处理项。
  - 未发现新增非阻塞 TODO 候选。
- **下一步判断**: 启动 fresh finalizer sub-agent 执行 `/bmenhance-cr-06-finalizer 8-4`。

## 2026-06-16 — Attempt 10

- **Story**: `8-4-status-and-validate-human-output-separation`
- **方案**: 启动 fresh finalizer sub-agent 执行 `/bmenhance-cr-06-finalizer 8-4`。
- **选择原因**: 04 与 05 已完成，且最新 evaluator 为 Approved；按 CR closeout 顺序必须执行 06 才能关闭当前 Story。
- **执行结果**: 06 完成，Story 8.4 已标记为 `done`。
- **状态变化**:
  - Story 文件：`Status: review` -> `Status: done`
  - `sprint-status.yaml`：`8-4-status-and-validate-human-output-separation: review` -> `done`
  - `sprint-status.yaml`：`last_updated` 保留为 `2026-06-16 04:37 CST`
- **跳过项**: `_bmad-output/planning-artifacts/bmm-workflow-status.yaml` 不存在，按 skill 规则跳过，未创建。
- **Epic 状态**: Epic 8 仍为 `in-progress`；`8-5` 到 `8-7` 仍为 `ready-for-dev`。
- **下一步判断**: Story 8.4 闭环完成，可以进入 Story 8.5。
