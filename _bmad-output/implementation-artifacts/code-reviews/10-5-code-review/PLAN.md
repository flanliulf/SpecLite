# Story 10.5 Code Review Plan（代码审查计划）

## Objective（目标）

围绕 Epic 10 的 Story 10.5 `Ecosystem Fixture And Release Gate Generalization` 执行严格串行的开发与代码审查闭环：`bmad-dev-story` -> `bmenhance-cr-01-reviewer` -> `bmenhance-cr-02-evaluator` -> 必要时 `bmenhance-cr-03-fixer` 并复审 -> `bmenhance-cr-04-rules-extractor` -> `bmenhance-cr-05-todo-tracker` -> `bmenhance-cr-06-finalizer`。

## Epic（史诗）

- 当前 Epic：Epic 10 Canonical Source Ecosystem Module Governance
- 执行顺序：
  - [x] Story 10.1：已完成 finalizer，状态 `done`
  - [x] Story 10.2：已完成 finalizer，状态 `done`
  - [x] Story 10.3：已完成 finalizer，状态 `done`
  - [x] Story 10.4：已完成 finalizer，状态 `done`
  - [x] Story 10.5：已完成 finalizer，状态 `done`
  - [ ] Story 10.6：待执行

## Current Story（当前 Story）

- Story 文件：`_bmad-output/implementation-artifacts/stories/10-5-ecosystem-fixture-and-release-gate-generalization.md`
- Sprint 状态：`done`
- 当前轮次：Round 2

## Execution Checklist（执行清单）

- [x] Preflight：确认 Story 10.1-10.4 已 `done`，Story 10.5 为第一个待执行 Story。
- [x] Preflight：确认 Story 10.5 code review 目录不存在，已创建。
- [x] Initialize Logs：创建 `PLAN.md`、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md`。
- [x] Development：启动 fresh sub-agent 执行 `/bmad-dev-story story 10.5`，Story 与 sprint tracker 均已进入 `review`。
- [x] Reviewer：development 完成且 Story 状态为 `review` 后启动 `bmenhance-cr-01-reviewer 10.5`，round 1 发现 3 个 `[中] patch`。
- [x] Evaluator：reviewer 完成后启动 `bmenhance-cr-02-evaluator 10.5`，round 1 确认 3 个 reviewer findings 均有效。
- [x] Fixer：evaluator 判定需要修复，启动 `bmenhance-cr-03-fixer 10.5`，已完成 3 个 P1 修复并追加修复记录。
- [x] Re-review：fixer 后重新 reviewer / evaluator，reviewer round 2 与 evaluator round 2 均已通过。
- [x] Rules Extractor：CR 通过后执行 `bmenhance-cr-04-rules-extractor 10.5`，已新增 3 条 CR 规则。
- [x] TODO Tracker：rules extractor 完成后执行 `bmenhance-cr-05-todo-tracker 10.5`，确认无新增 CR TODO backlog。
- [x] Finalizer：TODO tracker 完成后执行 `bmenhance-cr-06-finalizer 10.5`，Story 与 sprint tracker 已同步为 `done`。
- [x] Next Story Gate：Story 10.5 完全收口后进入 Story 10.6。

## Current Status（当前状态）

2026-07-06 23:47 CST：Story 10.5 preflight 完成，准备启动 development sub-agent。

2026-07-07 00:02 CST：development sub-agent 完成 `/bmad-dev-story story 10.5`，Story 文件与 `sprint-status.yaml` 均更新为 `review`。下一步启动 CR reviewer round 1。

2026-07-07 00:13 CST：CR reviewer round 1 完成，结果文件为 `10-5-code-review-summary-20260707-round-1.md`，发现 3 个 `[中] patch`：core-only installed state 绕过 selected-module validation、packaging ecosystem assertion 只覆盖示例 module、release packaging exclusion gate 缺少 cache/temp/build output 负向断言。下一步启动 evaluator round 1。

2026-07-07 00:18 CST：CR evaluator round 1 完成，结果文件为 `10-5-code-review-evaluation-20260707-round-1.md`，确认 3 个 findings 均有效且为 P1 阻塞项，不允许进入 closeout。下一步启动 fixer。

2026-07-07 00:23 CST：CR fixer 完成，已修复 3 个 P1 阻塞项：移除 core-only installed state 对 selected-module validation 的绕过、将 packaging ecosystem assertion 泛化到全部 nested ecosystem modules、增加 generated output exclusion gate。下一步启动 reviewer round 2 复审。

2026-07-07 00:29 CST：CR reviewer round 2 完成，结果文件为 `10-5-code-review-summary-20260707-round-2.md`，确认 round 1 的 3 个 P1 修复均已闭环，未发现新的阻塞项或中高优先级回归。下一步启动 evaluator round 2。

2026-07-07 00:34 CST：CR evaluator round 2 完成，结果文件为 `10-5-code-review-evaluation-20260707-round-2.md`，确认 reviewer round 2 通过结论成立，不需要重新 fixer，允许进入 `rules extractor -> TODO tracker -> finalizer` closeout 链。

2026-07-07 00:41 CST：CR rules extractor 完成，新增 `CR-API-32`、`CR-TEST-07`、`CR-SEC-17` 到 `cr-rules-summary.md`。下一步启动 TODO tracker。

2026-07-07 00:43 CST：CR TODO tracker 完成，确认 Story 10.5 无新增/更新 CR TODO backlog。下一步启动 finalizer。

2026-07-07 00:47 CST：CR finalizer 完成，Story 10.5 文件状态与 `sprint-status.yaml` 均已同步为 `done`；Story 10.6 保持 `ready-for-dev`，`epic-10` 保持 `in-progress`。下一步进入 Story 10.6。

## Termination Criteria（终止条件）

Story 10.5 只有在以下条件全部满足后，才允许进入 Story 10.6：

- Story 10.5 开发完成，Story 状态进入 `review`。
- 最新 CR reviewer 通过。
- 最新 CR evaluator 通过。
- 如有 fixer，fixer 后已重新 reviewer / evaluator 并通过。
- rules extractor、TODO tracker、finalizer 已按顺序执行。
- `PLAN.md`、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md` 已更新。
- Sprint 状态与 Story 文件状态一致。
