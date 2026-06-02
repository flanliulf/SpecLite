# PLAN

## Corrective CR Reopen Plan（校正复审计划）

- 本轮目标：针对 reopened Story 2-1 的新增 AC / corrective tasks 做正式 CR 闭环，不重新开发 Epic 1/2。
- 当前 sprint 状态：`review`；因此按用户规则跳过 `/bmad-dev-story story 2-1`。
- 执行顺序：`/bmenhance-cr-01-reviewer 2-1` -> `/bmenhance-cr-02-evaluator 2-1` -> `/bmenhance-cr-03-fixer 2-1`，直到 reviewer 与 evaluator 均通过。
- 通过后执行：`bmenhance-cr-04-rules-extractor` -> `bmenhance-cr-05-todo-tracker` -> `bmenhance-cr-06-finalizer`。
- 所有步骤使用全新 sub-agent、模型 `gpt-5.5`、严格串行，不并行。

## 目标

针对 Story `2-1-methodology-discovery-metadata-generation` 严格串行执行开发、CR 审查、评估、修复循环、规则提炼、TODO 跟踪、收尾，并在通过后进入下一个 Epic 2 Story。

## 执行约束

- 每一步使用全新的 sub agent。
- 所有步骤严格串行，等待前一步完成后再进入下一步。
- 开发、审查、评估、修复使用 `gpt-5.5`。
- 最终提交使用 `gpt-5.4`，默认中文 commit message，不推送。
- 遇到可决策事项，优先按推荐方案执行，并在记录文件中说明。

## Story 2-1 执行步骤

1. 使用 `/bmad-dev-story story 2-1` 完成 Story 开发，并使 Story 状态进入 `review`。
2. 使用 `/bmenhance-cr-01-reviewer 2-1` 进行第 1 轮 CR。
3. 使用 `/bmenhance-cr-02-evaluator 2-1` 评估第 1 轮 CR。
4. 使用 `/bmenhance-cr-03-fixer 2-1` 修复评估确认的问题。
5. 重复 reviewer -> evaluator -> fixer，直到 reviewer 结论通过且 evaluator 评估通过。
6. 使用 `bmenhance-cr-04-rules-extractor` 提炼 CR 规则，并按推荐默认决策执行可落地事项。
7. 使用 `bmenhance-cr-05-todo-tracker` 处理可延迟 TODO，并按推荐默认决策执行可落地事项。
8. 使用 `bmenhance-cr-06-finalizer` 将 Story 标记为 Done 并同步状态文件。
9. 记录结果后进入 Story `2-2`。

## 当前状态

- 已确认工作树干净。
- 已确认 Story 文件存在：`_bmad-output/implementation-artifacts/stories/2-1-methodology-discovery-metadata-generation.md`。
- 已确认 `sprint-status.yaml` 中 Story `2-1-methodology-discovery-metadata-generation` 状态为 `ready-for-dev`。

## 2026-05-27 15:05 HALT

- `bmad-dev-story` 已启动并执行到 Story 2.1 Task 1。
- Story 2.1 已从 `ready-for-dev` 推进到 `in-progress`。
- 当前 HALT 原因：Story 2.1 明确要求的 Epic 1 实际实现 anchor 不完整，缺失 `src/manifest/skill-index.ts`、`src/manifest/help-index.ts`、`src/manifest/files-index.ts`、`test/fixtures/fixture-harness.ts`。
- Story 2.1 明确要求：若上述 anchor 不存在，停止 Story 2.1，不得在 Story 2.1 中重建 Epic 1 scaffold/manifest/index anchors。
- 推荐决策：暂停 Epic 2 CR/development 链路，先授权补齐或返工 Epic 1 实际实现 anchor；否则继续 Epic 2 会违反 Story 2.1 的范围边界。

## 2026-05-27 11:04 复核

- 主线程以当前 worktree 重新检查，HALT 条件仍成立。
- 暂不启动 Story 2.1 的 CR 链路，因为 `bmad-dev-story` 未完成，Story 未进入 `review`。
- 后续恢复条件：用户明确授权先处理 Epic 1 缺失 anchor，或提供新的范围指令。

## 2026-05-27 11:05 Blocked Audit

- 再次复核当前 worktree，缺失 anchor 仍为 `src/manifest/skill-index.ts`、`src/manifest/help-index.ts`、`src/manifest/files-index.ts`、`test/fixtures/fixture-harness.ts`。
- 这是同一 Story 2.1 HALT 条件连续第三次阻断目标续跑。
- 当前不能继续 Epic 2 的开发或 CR 链路；恢复条件仍是用户明确授权先处理 Epic 1 实际实现 anchor，或提供新的范围指令。

## 2026-05-27 11:26 Anchor 标准修订

- 用户授权转入 Epic 1 范围检查并同步修订 anchor 标准。
- 复核结论：Epic 1 manifest/index 功能通过 `manifest-generator.ts`、`manifest-schema.ts`、`runtime-structure.ts`、`target-writer.ts`、`fixture-contract.ts` 和 fixture/tests 实现；缺失独立 `skill-index.ts` / `help-index.ts` / `files-index.ts` / `phase-coverage.ts` 文件不是功能缺失。
- 已同步修订 Story 1.5、Story 2.1、Epic 2 后续 Story，以及后续 Epic 3/4/6 中会导致同类误判的前置 anchor 表述。
- 恢复条件：重新启动 Story 2.1 的 `/bmad-dev-story story 2-1`，按 functional anchor 标准继续 Task 1。

## 2026-05-28 Round 3 Reviewer Only（第 3 轮仅复审）

- 用户明确要求严格执行 `/bmenhance-cr-01-reviewer 2-1`，不重新开发，不执行 evaluator / fixer / finalizer。
- 当前 Story 文件：`_bmad-output/implementation-artifacts/stories/2-1-methodology-discovery-metadata-generation.md`，状态为 `review`；`sprint-status.yaml` 中 Story 2-1 也是 `review`。
- 本轮审查范围限定为 reopened corrective dev verification 对 Story 2-1 的相关影响：full skill inventory 与 help/phase projection 分离、ReadyCheck skill-index / IDE mirror completeness 校验、canonical package root counts 的 pre-write / ready summary 暴露，以及相应 focused tests / fixture assertions。
- 历史 review summary 已有 round 1、round 2，本轮 reviewer 输出为 round 3：`2-1-code-review-summary-20260528-round-3.md`。
- Agent 工具在当前会话不可用，按 skill 降级规则在主上下文串行执行 Blind Hunter、Edge Case Hunter、Acceptance Auditor 三层审查；不启动无关流程。

## 2026-05-28 Round 3 Evaluator（第 3 轮评估）

- 用户明确要求即使 reviewer 建议无需 evaluator，本轮仍执行 `/bmenhance-cr-02-evaluator 2-1`，停止在 evaluator，不执行 fixer / finalizer。
- 评估对象限定为最新 reviewer 输出：`2-1-code-review-summary-20260528-round-3.md`。
- 本轮 evaluation round 为 3，输出为 `2-1-code-review-evaluation-20260528-round-3.md`。
- 评估证据限定为 Story 2-1、最新 reviewer 输出、相关真实代码、focused tests、全量 tests、build、lint 和 `git diff --check`；不扩大到其他 Story 或源码修复。
- 当前默认决策：reviewer 0 findings 经独立验证成立，evaluator 通过；无需 fixer。

## 2026-05-28 Post-CR Finalization（CR 通过后收尾）

- 用户要求严格串行执行 `bmenhance-cr-04-rules-extractor` -> `bmenhance-cr-05-todo-tracker` -> `bmenhance-cr-06-finalizer`，只处理 Story 2-1。
- 最新 reviewer：`2-1-code-review-summary-20260528-round-3.md`，结论通过，0 findings。
- 最新 evaluator：`2-1-code-review-evaluation-20260528-round-3.md`，结论通过，Fix Items: 0，CR TODO: 0。
- 默认决策：前两个 skill 即使无新增产物也必须执行并记录；如无新增规则/TODO，不扩大修改到全局文档、源码、其他 Story 或 Epic 主状态。
- Finalizer 目标：在 CR Approved 验证通过后，将 Story 2-1 与 `sprint-status.yaml` 中对应条目重新同步为 `done`；`bmm-workflow-status.yaml` 若不存在则按 skill 容错跳过。
