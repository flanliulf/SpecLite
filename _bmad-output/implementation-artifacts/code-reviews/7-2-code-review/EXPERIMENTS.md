# EXPERIMENTS

## 2026-06-15 13:40 CST — Attempt 1

- **Story**: `7-2-doctor-sync-and-uninstall-commands`
- **方案**: 初始化 Story `7-2` code review 目录与三份中文进度文件，并在启动 dev sub-agent 前生成 Story kickoff gate。
- **选择原因**: `7-2` 处于 `ready-for-dev`，且缺少 `{story-key}-story-kickoff-gate.md`；从 `7-1` 执行经验和 lifecycle contract 可知缺少该 gate 会使 `bmad-dev-story` 在状态推进前 HALT。
- **前置结果**:
  - `7-1-flow-gate-hook-enforcement` 已 `done`，满足 `7-2` 对 hook artifact metadata extension point 的前置依赖。
  - `7-2` 仍为 `ready-for-dev`。
  - 当前工作树混杂，必须隔离 Epic 7 Story scope 与 Epic 8 未追踪文件。
- **执行结果**: 已创建本目录、三份进度文件，并生成 `7-2` Story kickoff gate report。
- **下一步判断**: 启动 fresh sub-agent 执行 `/bmad-dev-story story 7-2`。

## 2026-06-15 — Attempt 2

- **Story**: `7-2-doctor-sync-and-uninstall-commands`
- **方案**: 启动 fresh dev sub-agent 执行 `/bmad-dev-story story 7-2`。
- **选择原因**: Story kickoff gate 已通过，按用户流程必须先完成开发再进入 CR。
- **执行结果**: 开发完成，Story 进入 `review`。
- **主要修改范围**:
  - command contracts：`01-command-result-json-contract.md`、`03-install-plan-contract.md`
  - command implementation：`src/commands/doctor.ts`、`src/commands/sync.ts`、`src/commands/uninstall.ts`
  - CLI / diagnostics / ownership / lock support：`src/bin/speclite.ts`、`src/diagnostics/*`、`src/fs/operation-lock.ts`、`src/update/ownership-model.ts`
  - tests：`test/contract-anchors.test.ts`、`test/doctor-command.test.ts`、`test/sync-command.test.ts`、`test/uninstall-command.test.ts`
- **验证结果**:
  - `npm run build`：通过。
  - `npx vitest run test/contract-anchors.test.ts test/doctor-command.test.ts test/sync-command.test.ts test/uninstall-command.test.ts`：通过，4 files / 12 tests。
  - `npm test`：通过，43 files / 316 tests。
  - `git diff --check`：通过。
- **下一步判断**: 启动 fresh reviewer sub-agent 执行 `/bmenhance-cr-01-reviewer 7-2`。

## 2026-06-15 — Attempt 3

- **Story**: `7-2-doctor-sync-and-uninstall-commands`
- **方案**: 启动 fresh reviewer sub-agent 执行 `/bmenhance-cr-01-reviewer 7-2`。
- **选择原因**: Story 已进入 `review`，按用户流程必须先审查。
- **执行结果**: Round 1 review 完成，结论不通过。
- **输出文件**: `_bmad-output/implementation-artifacts/code-reviews/7-2-code-review/7-2-code-review-summary-20260615-round-1.md`
- **发现摘要**:
  - 阻塞：`uninstall` 不能递归移除 installer-owned directory。
  - 非阻塞：`sync` / `uninstall` human output 未展示失败 step state。
- **验证证据**: reviewer 记录 `npm run build`、focused tests、`npm test`、`git diff --check` 通过；定向复现确认 uninstall directory removal 失败。
- **下一步判断**: 启动 fresh evaluator sub-agent 执行 `/bmenhance-cr-02-evaluator 7-2`。

## 2026-06-15 — Attempt 4

- **Story**: `7-2-doctor-sync-and-uninstall-commands`
- **方案**: 启动 fresh evaluator sub-agent 执行 `/bmenhance-cr-02-evaluator 7-2`。
- **选择原因**: reviewer 未通过后必须先由 evaluator 独立评估发现有效性和优先级。
- **执行结果**: Round 1 evaluation 完成，Not Approved。
- **输出文件**: `_bmad-output/implementation-artifacts/code-reviews/7-2-code-review/7-2-code-review-evaluation-20260615-round-1.md`
- **评估摘要**:
  - 需要修复：1 个 P1，`uninstall` 无法递归删除 installer-owned directory。
  - 建议 TODO：1 个 P2，`sync` / `uninstall` human output 未展示失败 step state。
  - 误报：0 个。
- **下一步判断**: 启动 fresh fixer sub-agent 执行 `/bmenhance-cr-03-fixer 7-2`，只修复 P1 阻塞项。

## 2026-06-15 — Attempt 5

- **Story**: `7-2-doctor-sync-and-uninstall-commands`
- **方案**: 启动 fresh fixer sub-agent 执行 `/bmenhance-cr-03-fixer 7-2`。
- **选择原因**: evaluator 明确 Finding #1 为 P1 阻塞项，必须修复；Finding #2 已降级为 P2 TODO，不在本次 fixer 范围内。
- **执行结果**: P1 阻塞项已修复，修复记录已追加到 evaluation 文件。
- **修改摘要**:
  - `src/commands/uninstall.ts`：apply 阶段 `lstat` 判断目标类型，directory 使用 `rm(..., { force: true, recursive: true })`。
  - `test/uninstall-command.test.ts`：补充 installer-owned directory fixture 和删除断言。
  - `7-2-code-review-evaluation-20260615-round-1.md`：追加修复执行记录。
- **验证结果**:
  - `npm test -- --run test/uninstall-command.test.ts`：通过，1 个 test file / 1 个 test。
  - `npm run build`：通过。
  - `npm test`：通过，43 个 test files / 316 个 tests。
  - `git diff --check`：通过。
- **下一步判断**: 必须回到 reviewer Round 2，然后 evaluator Round 2；不能直接收尾。

## 2026-06-15 — Attempt 6

- **Story**: `7-2-doctor-sync-and-uninstall-commands`
- **方案**: 启动 fresh reviewer sub-agent 执行 `/bmenhance-cr-01-reviewer 7-2` Round 2。
- **选择原因**: fixer 完成后必须重新 review，确认 P1 修复没有引入新阻塞项。
- **执行结果**: Round 2 review 通过。
- **输出文件**: `_bmad-output/implementation-artifacts/code-reviews/7-2-code-review/7-2-code-review-summary-20260615-round-2.md`
- **审查摘要**:
  - Round 1 P1 blocker 已确认修复。
  - 阻塞项：0。
  - 非阻塞项：1 个既有 P2 CR TODO，本轮无新增。
- **验证证据**: reviewer 记录 focused uninstall test、`npm run build`、`npm test`、`git diff --check` 通过。
- **下一步判断**: 启动 fresh evaluator sub-agent 执行 `/bmenhance-cr-02-evaluator 7-2` Round 2。

## 2026-06-15 — Attempt 7

- **Story**: `7-2-doctor-sync-and-uninstall-commands`
- **方案**: 启动 fresh evaluator sub-agent 执行 `/bmenhance-cr-02-evaluator 7-2` Round 2。
- **选择原因**: 用户 gate 要求 reviewer 与 evaluator 均通过后才能退出 CR 循环。
- **执行结果**: Round 2 evaluation 通过，Approved。
- **输出文件**: `_bmad-output/implementation-artifacts/code-reviews/7-2-code-review/7-2-code-review-evaluation-20260615-round-2.md`
- **评估摘要**:
  - 需要修复：0。
  - 建议 TODO：1 个 P2，`sync` / `uninstall` human output 未展示失败 `Step State`。
  - 误报：0。
  - 下一步 fixer：不需要。
- **下一步判断**: 进入固定收尾顺序，先启动 04 rules extractor。

## 2026-06-15 — Attempt 8

- **Story**: `7-2-doctor-sync-and-uninstall-commands`
- **方案**: 启动 fresh sub-agent 执行 `bmenhance-cr-04-rules-extractor 7-2`。
- **选择原因**: Reviewer / evaluator 已通过，按用户流程必须先执行 04，再执行 05 和 06。
- **执行结果**: analysis-only 完成，未修改文件。
- **候选规则**:
  - `Installer-owned directory removal 必须 directory-aware 且保持 containment guard`：7/12，建议只写入 `cr-rules-summary.md`，需要用户确认；本轮不落地。
  - `sync / uninstall human output 失败时应展示 Step State`：7/12，未完成 P2，交给 05 TODO Tracker。
  - `将当前 P2 直接升格为全局 human renderer 规则`：4/12，不沉淀。
- **下一步判断**: 启动 05 TODO tracker，新增 1 条 P2 TODO。

## 2026-06-15 — Attempt 9

- **Story**: `7-2-doctor-sync-and-uninstall-commands`
- **方案**: 启动 fresh sub-agent 执行 `bmenhance-cr-05-todo-tracker 7-2`。
- **选择原因**: 04 rules extractor 已明确将 `sync` / `uninstall` human output 缺少 `Step State` 作为未完成 P2 交给 TODO Tracker；按用户流程 05 必须在 06 finalizer 前完成。
- **执行结果**: 已新增 1 条 CR TODO。
- **输出位置**: `_bmad-output/implementation-artifacts/cr-rules/cr-todo-backlog.md`
- **新增项**:
  - `TODO-011`: `sync` / `uninstall` 失败 human output 展示 `Step State`
  - Priority: `P2`
  - Category: `test-gap`
  - 涉及文件：`src/diagnostics/output.ts`、`test/sync-command.test.ts`、`test/uninstall-command.test.ts`
- **决策记录**: 04 的 directory-aware uninstall 规则候选需要用户确认后才能写入规则总结，本轮不落地；未解决 P2 已通过 TODO backlog 跟踪。
- **下一步判断**: 启动 fresh finalizer sub-agent 执行 `bmenhance-cr-06-finalizer 7-2`。

## 2026-06-15 — Attempt 10

- **Story**: `7-2-doctor-sync-and-uninstall-commands`
- **方案**: 启动 fresh sub-agent 执行 `bmenhance-cr-06-finalizer 7-2`。
- **选择原因**: Reviewer Round 2 与 evaluator Round 2 均通过，04/05 已按顺序完成；按用户流程必须 finalizer 后才能进入下一 Story。
- **执行结果**: Finalizer 完成，Story `7-2` 已标记为 `done`。
- **修改文件**:
  - `_bmad-output/implementation-artifacts/stories/7-2-doctor-sync-and-uninstall-commands.md`
  - `_bmad-output/implementation-artifacts/sprint-status.yaml`
- **状态结果**:
  - Story status: `done`
  - Sprint status: `7-2-doctor-sync-and-uninstall-commands: done`
  - Epic status: `epic-7` 仍为 `in-progress`，因为 `7-3`、`7-4`、`7-5` 未完成。
  - Workflow status: 未更新，目标文件不存在，按默认容错跳过。
- **验证结果**:
  - `rg -n "^Status:|epic-7:|7-2-doctor-sync-and-uninstall-commands:|last_updated" ...`：确认状态同步。
  - `git diff --check -- _bmad-output/implementation-artifacts/stories/7-2-doctor-sync-and-uninstall-commands.md _bmad-output/implementation-artifacts/sprint-status.yaml`：通过。
- **下一步判断**: Story `7-2` 已闭环，进入 Story `7-3`；仍不能 commit 或 push。
