# PLAN

## Goal（目标）

针对 Story `7-2-doctor-sync-and-uninstall-commands` 执行严格串行的开发与 CR 闭环：

1. fresh sub-agent 执行 `/bmad-dev-story story 7-2`，模型 `gpt-5.5`。
2. fresh sub-agent 执行 `/bmenhance-cr-01-reviewer 7-2`，模型 `gpt-5.5`。
3. fresh sub-agent 执行 `/bmenhance-cr-02-evaluator 7-2`，模型 `gpt-5.5`。
4. 如 reviewer 或 evaluator 未通过，fresh sub-agent 执行 `/bmenhance-cr-03-fixer 7-2`，模型 `gpt-5.5`，然后回到 review/evaluate。
5. reviewer 与 evaluator 都通过后，fresh sub-agent 依次执行 `bmenhance-cr-04-rules-extractor`、`bmenhance-cr-05-todo-tracker`、`bmenhance-cr-06-finalizer`。
6. 不在单个 Story 完成后提交；Epic 7 全部 Story 完成后统一执行中文 Conventional Commit，本地提交，不 push。

## Context（上下文）

- Repository: `/Users/fancyliu/Repos/SpecLite`
- Story file: `_bmad-output/implementation-artifacts/stories/7-2-doctor-sync-and-uninstall-commands.md`
- Code review directory: `_bmad-output/implementation-artifacts/code-reviews/7-2-code-review/`
- Epic source: `_bmad-output/planning-artifacts/epics/10-epic-7-post-mvp-governance-expansionpost-mvp-治理扩展.md`
- 当前时间：`2026-06-15 13:40 CST`

## Preflight（前置审计）

- Story `7-2` 存在，状态为 `ready-for-dev`。
- `sprint-status.yaml` 当前记录 `epic-7: in-progress`，`7-1-flow-gate-hook-enforcement: done`，`7-2-doctor-sync-and-uninstall-commands: ready-for-dev`。
- Story `7-2` 的 Dependency Gate 要求：`7-1` 完成后，`doctor` / `sync` / `uninstall` 必须把 hook config、hook runner 和 hook source metadata 纳入 installer-owned artifact 诊断、同步和移除范围。
- 当前工作树包含 Story `7-1` 已完成但未提交的改动，以及 Epic 8 既有未追踪文件；后续提交必须白名单暂存，不能使用 `git add -A`。
- 决策：在启动 dev sub-agent 前补齐 `7-2` Story kickoff gate evidence，避免 `bmad-dev-story` 在已知缺失门禁上 HALT。

## Execution Order（执行顺序）

- [x] 初始化 Story 7-2 code review 目录。
- [x] 创建中文 `PLAN.md`、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md`。
- [x] 生成 `_bmad-output/implementation-artifacts/flow-gates/7-2-doctor-sync-and-uninstall-commands-story-kickoff-gate.md`，结果为 `PASS`。
- [x] Step 1: `/bmad-dev-story story 7-2` 已完成，Story 进入 `review`。
- [x] Step 2: `/bmenhance-cr-01-reviewer 7-2` Round 1 已完成，结论不通过。
- [x] Step 3: `/bmenhance-cr-02-evaluator 7-2` Round 1 已完成，Not Approved。
- [x] Step 4: 执行 `/bmenhance-cr-03-fixer 7-2`，仅修复 evaluator 确认的 P1 阻塞项。
- [x] Step 5: 回到 reviewer，启动 `/bmenhance-cr-01-reviewer 7-2` Round 2，结论通过。
- [x] Step 5b: 启动 `/bmenhance-cr-02-evaluator 7-2` Round 2，评估通过 / Approved。
- [x] Step 6: 通过后执行 04 rules extractor，analysis-only 完成。
- [x] Step 7: 执行 05 todo tracker，按 04 建议新增 1 条 P2 TODO。
- [x] Step 8: 执行 06 finalizer。
- [x] Step 9: 更新本文件、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md` 为终态。

## Gate（终止条件）

Story `7-2` 只有在以下条件同时满足后才视为本 Story 闭环完成：

- 最新 `bmenhance-cr-01-reviewer` 结论为通过。
- 最新 `bmenhance-cr-02-evaluator` 评估结论为通过 / Approved。
- 如果执行过 fixer，则 fixer 后已重新执行 reviewer 与 evaluator。
- `bmenhance-cr-04-rules-extractor`、`bmenhance-cr-05-todo-tracker`、`bmenhance-cr-06-finalizer` 已按顺序完成。
- 本目录三份进度文件记录终态。

## Development Result（开发结果）

fresh dev sub-agent 已完成 `/bmad-dev-story story 7-2`：

- Story status: `review`
- Sprint status: `7-2-doctor-sync-and-uninstall-commands: review`
- HALT: 未触发
- Verification:
  - `npm run build`：通过。
  - `npx vitest run test/contract-anchors.test.ts test/doctor-command.test.ts test/sync-command.test.ts test/uninstall-command.test.ts`：通过，4 files / 12 tests。
  - `npm test`：通过，43 files / 316 tests。
  - `git diff --check`：通过。

下一步：启动 fresh reviewer sub-agent 执行 `/bmenhance-cr-01-reviewer 7-2`。

## Review Round 1（审查第 1 轮）

Reviewer 已生成：

- File: `_bmad-output/implementation-artifacts/code-reviews/7-2-code-review/7-2-code-review-summary-20260615-round-1.md`
- Round: `1`
- Conclusion: 不通过
- Blocking findings: `1`
- Non-blocking findings: `1`
- Internal fallback: 当前 reviewer agent 无可用 Agent 子代理工具，已按 skill 降级为串行审查模式。

主要阻塞项：`uninstall` 计划移除 installer-owned directory，但 apply 阶段使用非 recursive `rm`，导致非空目录无法删除，违反 AC4。

下一步：启动 fresh evaluator sub-agent 执行 `/bmenhance-cr-02-evaluator 7-2`。

## Evaluation Round 1（评估第 1 轮）

Evaluator 已生成：

- File: `_bmad-output/implementation-artifacts/code-reviews/7-2-code-review/7-2-code-review-evaluation-20260615-round-1.md`
- Round: `1`
- Conclusion: Not Approved
- Need fix: `1`
- Suggested TODO: `1`
- False positives: `0`

修复范围：只处理 Finding #1，让 `uninstall` 能安全递归删除 installer-owned directory。Finding #2 降级为 P2 CR TODO，暂不在 fixer 中修复。

下一步：启动 fresh fixer sub-agent 执行 `/bmenhance-cr-03-fixer 7-2`。

## Fix Round 1（修复第 1 轮）

Fixer 已完成：

- Fix items: `1`
- Fixed: Finding #1，`uninstall` apply 阶段对 directory 使用 recursive removal。
- Deferred: Finding #2，按 evaluator 结论保留为 P2 CR TODO。
- Fix record: 已追加到 `_bmad-output/implementation-artifacts/code-reviews/7-2-code-review/7-2-code-review-evaluation-20260615-round-1.md`
- Verification:
  - `npm test -- --run test/uninstall-command.test.ts`：通过，1 个 test file / 1 个 test。
  - `npm run build`：通过。
  - `npm test`：通过，43 个 test files / 316 个 tests。
  - `git diff --check`：通过。

下一步：重新启动 fresh reviewer sub-agent 执行 `/bmenhance-cr-01-reviewer 7-2` Round 2。

## Review Round 2（审查第 2 轮）

Reviewer 已生成：

- File: `_bmad-output/implementation-artifacts/code-reviews/7-2-code-review/7-2-code-review-summary-20260615-round-2.md`
- Round: `2`
- Conclusion: 通过
- Blocking findings: `0`
- Non-blocking findings: `1`，维持 Round 1 Finding #2 为 P2 CR TODO。
- Internal fallback: 当前 reviewer agent 无可用 Agent 子代理工具，已按 skill 降级为串行审查模式。

下一步：启动 fresh evaluator sub-agent 执行 `/bmenhance-cr-02-evaluator 7-2` Round 2。

## Evaluation Round 2（评估第 2 轮）

Evaluator 已生成：

- File: `_bmad-output/implementation-artifacts/code-reviews/7-2-code-review/7-2-code-review-evaluation-20260615-round-2.md`
- Round: `2`
- Conclusion: 通过 / Approved
- Need fix: `0`
- Suggested TODO: `1`
- False positives: `0`
- Next fixer: 不需要

Gate 决策：reviewer Round 2 与 evaluator Round 2 均通过，可以进入 04/05/06 收尾链。

## Rules Extractor（规则提炼）

04 rules extractor 已完成 analysis-only，未修改文件。

- Candidate rules: `3`
- Candidate 1: installer-owned directory removal 必须 directory-aware 且保持 containment guard，建议只写入 `cr-rules-summary.md`，需要用户确认；本轮不落地。
- Candidate 2: `sync` / `uninstall` human output 失败时应展示 `Step State`，未解决 P2，交给 05 TODO Tracker。
- Candidate 3: 将当前 P2 直接升格为全局 human renderer 规则，不沉淀。

下一步：启动 05 TODO tracker，将 Candidate 2 作为 P2 TODO 写入 backlog。

## TODO Tracker（TODO 跟踪）

05 TODO tracker 已完成，已修改 `_bmad-output/implementation-artifacts/cr-rules/cr-todo-backlog.md`。

- Added TODO: `TODO-011`
- Title: `sync` / `uninstall` 失败 human output 展示 `Step State`
- Priority: `P2`
- Category: `test-gap`
- 涉及文件：`src/diagnostics/output.ts`、`test/sync-command.test.ts`、`test/uninstall-command.test.ts`
- Backlog open count: `3`

决策：04 的 directory-aware uninstall 规则候选需要用户确认后才写入规则总结，本轮不越权落地；已通过 05 跟踪未解决 P2。

下一步：启动 fresh finalizer sub-agent 执行 `bmenhance-cr-06-finalizer 7-2`。

## Finalizer（最终化）

06 finalizer 已完成。

- Story status: `done`
- Sprint status: `7-2-doctor-sync-and-uninstall-commands: done`
- `last_updated`: `2026-06-15 14:29 CST`
- Epic status: `epic-7` 仍为 `in-progress`，因为 `7-3`、`7-4`、`7-5` 尚未完成。
- Workflow status: 未更新，因为 `_bmad-output/planning-artifacts/bmm-workflow-status.yaml` 不存在；按 skill 默认容错决策跳过。
- Verification:
  - `rg -n "^Status:|epic-7:|7-2-doctor-sync-and-uninstall-commands:|last_updated" ...`：确认状态同步。
  - `git diff --check -- _bmad-output/implementation-artifacts/stories/7-2-doctor-sync-and-uninstall-commands.md _bmad-output/implementation-artifacts/sprint-status.yaml`：通过。

Story `7-2` 闭环完成。下一步进入 Story `7-3`；当前不能提交，必须等 Epic 7 全部 Story 完成后统一本地 commit。
