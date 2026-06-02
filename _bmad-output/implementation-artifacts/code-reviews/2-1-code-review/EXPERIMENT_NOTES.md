# EXPERIMENT_NOTES

## 2026-05-28 Corrective CR Reopen Run（校正复审轮次）

- 当前判断：Story 2-1 已处于 `review`，说明上一轮 corrective dev verification 已完成到待审状态。
- 下一步：等待前序 Story 完成后，启动全新 sub-agent 执行 `/bmenhance-cr-01-reviewer 2-1`。
- 2026-05-28 Round 3 reviewer 更新：本轮按用户最新指令只执行 `/bmenhance-cr-01-reviewer 2-1`，不进入 evaluator / fixer / finalizer。
- Agent 工具不可用，已采用 skill 定义的串行降级；Blind Hunter、Edge Case Hunter、Acceptance Auditor 三层审查逻辑均在主上下文完成。
- 结论：Story 2-1 corrective verification 的 package-root inventory、no-help-row projection separation、ReadyCheck completeness 与 focused regression 覆盖均通过复审；未发现新的阻塞项。
- 输出：`_bmad-output/implementation-artifacts/code-reviews/2-1-code-review/2-1-code-review-summary-20260528-round-3.md`。
- 2026-05-28 Round 3 evaluator 更新：用户要求即使 reviewer 建议无需 evaluator，也必须执行 `/bmenhance-cr-02-evaluator 2-1` 作为停止条件。
- 评估结论：reviewer 通过结论成立，0 findings 未发现遗漏；targeted tests、full tests、build、lint 和 `git diff --check` 均通过。
- 决策：本轮无需 fixer；按用户要求不执行 fixer / finalizer。
- 输出：`_bmad-output/implementation-artifacts/code-reviews/2-1-code-review/2-1-code-review-evaluation-20260528-round-3.md`。
- 2026-05-28 CR 收尾启动：按用户要求严格串行执行 `bmenhance-cr-04-rules-extractor`、`bmenhance-cr-05-todo-tracker`、`bmenhance-cr-06-finalizer`，只处理 Story 2-1。
- 默认决策：04/05 如无新增规则或 TODO，只在进度文件记录 no-op 结果；不重复写入既有规则、不创建无内容 TODO、不改全局文档。
- 2026-05-28 CR 04 更新：已完成 `bmenhance-cr-04-rules-extractor 2-1`。Round 3 没有新增 finding 或规则候选；既有 2-1 规则 `CR-SEC-03` / `CR-API-08` 已覆盖 Round 1 的可复用问题，本轮不重复沉淀、不改全局文档。
- 2026-05-28 CR 05 更新：已完成 `bmenhance-cr-05-todo-tracker 2-1`。Round 3 reviewer/evaluator 均明确 CR TODO 0；现有 backlog 仅有 2-4 与 2-5 来源的 open TODO，和 Story 2-1 本次收尾不匹配。本轮不修改 `cr-todo-backlog.md`。
- 2026-05-28 CR 06 更新：已完成 `bmenhance-cr-06-finalizer 2-1`。Latest evaluator 为 `2-1-code-review-evaluation-20260528-round-3.md`，结论为 CR 评估通过；Story 文件与 `sprint-status.yaml` 中 Story 2-1 均已同步为 `done`。
- `bmm-workflow-status.yaml` 不存在，按 finalizer 容错跳过；Epic 2 仍有 `2-2`、`2-3` 为 `review`，本次不更新 `epic-2` 主状态。

## 2026-05-27 10:31

- 当前执行 Story：`2-1-methodology-discovery-metadata-generation`。
- 下一步：启动 fresh sub-agent，使用 `gpt-5.5` 执行 `/bmad-dev-story story 2-1`。
- 决策：按用户要求和仓库 CR 配置，当前 story 的进度记录写入 `_bmad-output/implementation-artifacts/code-reviews/2-1-code-review/`。

## 2026-05-27 15:05

- 已按 workflow 将 `sprint-status.yaml` 中 Story 2.1 从 `ready-for-dev` 标记为 `in-progress`，并同步 Story 文件状态。
- 阻塞：Story 2.1 Task 1 要求的 Epic 1 standalone implementation anchors 缺失：`src/manifest/skill-index.ts`、`src/manifest/help-index.ts`、`src/manifest/files-index.ts`、`test/fixtures/fixture-harness.ts`。
- 决策：按 Story 明确要求 HALT，不在 Story 2.1 范围内补建 Epic 1 scaffold/manifest/index anchors，避免把前序 Story 的缺口混入本 Story。

## 2026-05-27 11:04

- 主线程已复核当前文件系统，缺失 anchor 未被补齐。
- 本轮不能启动 reviewer/evaluator/fixer，因为开发阶段没有完成，Story 未进入 `review`。
- 当前推荐路径仍是：先获得用户授权，按 Epic 1 范围补齐实际实现 anchor，再恢复 Story 2.1 的 `/bmad-dev-story story 2-1`。

## 2026-05-27 11:05

- 当前仍不能执行下一步 sub-agent。
- 原因不是实现难度，而是 Story 2.1 明确禁止在本 Story 内重建 Epic 1 anchor。
- 将目标标记为 blocked，等待用户授权处理 Epic 1 anchor 或调整范围。

## 2026-05-27 11:26

- 用户已授权先处理 anchor 判断标准。
- 当前不创建新源码文件；文档修订后，`manifest-generator.ts` 集中式 builder 可以作为 `skill/help/files/phase` projection 的 functional anchor。
- 下一步应重新启动 fresh dev sub-agent 执行 `/bmad-dev-story story 2-1`，让它按新标准继续 Story 2.1 Task 1。

## 2026-05-27 11:59

- Story 2.1 当前 CR 状态：第 2 轮 reviewer 通过，第 2 轮 evaluator 通过。
- 下一步：启动第五个 fresh sub-agent，按顺序执行 `bmenhance-cr-04-rules-extractor`、`bmenhance-cr-05-todo-tracker`、`bmenhance-cr-06-finalizer`。
- 决策：04/05 若有可落地默认推荐项，按用户授权采用推荐决策执行；若无新增规则/TODO，则记录无新增并继续 finalizer。

## 2026-05-27 11:33

- Fresh dev sub-agent 已按新 functional anchor 标准恢复 Story 2.1，未再因缺少独立 `skill-index.ts` / `help-index.ts` / `files-index.ts` / `phase-coverage.ts` 停止。
- 已完成 focused red-green cycle：新增失败测试后实现 discovery metadata projection，包括 artifact contract summary、phase label、canonical target order、activation target path 和 missing package diagnostic。
- 当前 focused 验证通过：`npm test -- test/source-and-modules.test.ts test/manifest-discovery.test.ts test/runtime-structure.test.ts`。
- 下一步：运行 build/full regression，更新 Story 2.1 任务勾选、File List、Change Log，并将状态推进到 `review`。

## 2026-05-27 11:36

- Story 2.1 所有 Tasks/Subtasks 已勾选完成。
- Story 文件状态与 `sprint-status.yaml` 均已更新为 `review`。
- 最终验证通过：`npm run build`、`npm test`（11 files / 66 tests）、`git diff --check`。
- 当前无阻塞；保留主线程/用户已有的无关 dirty files，不做回滚或同步。

## 2026-05-27 12:01

- 已完成 `bmenhance-cr-04-rules-extractor 2-1`。
- 本次 record-only 更新 `_bmad-output/implementation-artifacts/cr-rules/cr-rules-summary.md`，新增 `CR-SEC-03` 与 `CR-API-08`。
- 不修改全局文档或源码；05 TODO Tracker 预期为“无新增 TODO”，仍需按顺序执行并记录。

## 2026-05-27 12:01

- 已完成 `bmenhance-cr-05-todo-tracker 2-1`。
- 2-1 CR 历史明确无非阻塞延迟项：Round 2 evaluation 记录“本轮未发现需要延迟跟踪的非阻塞 CR TODO”。
- `cr-todo-backlog.md` 当前不存在；因无新增 TODO，本次不创建该文件。

## 2026-05-27 12:01

- 已完成 `bmenhance-cr-06-finalizer 2-1`。
- Latest evaluator 为 `2-1-code-review-evaluation-20260527-round-2.md`，结论为 CR 评估通过。
- Story 2.1 已标记 `done`，`sprint-status.yaml` 已同步；`bmm-workflow-status.yaml` 不存在，按容错跳过。
- Epic 2 尚未全部 done：`2-2`、`2-3`、`2-4`、`2-5` 仍为 `ready-for-dev`，因此保持 `epic-2: in-progress`。
