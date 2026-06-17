# Story 9.1 Experiment Notes（执行笔记）

## 2026-06-17 19:08 CST

- 决策：Story 执行顺序固定为 9.1 -> 9.2。
- 原因：Epic 9 文档明确 Story 9.2 依赖 Story 9.1；SR gate artifact 进一步要求 Story 9.1 full corpus gate 未通过前，Story 9.2 不得进入 implementation。
- 风险：`sprint-status.yaml` 仍显示 Story 9.2 为 `ready-for-dev`，但 SR gate artifact 优先于该机械 tracker 值；若后续自动化只看 sprint tracker，可能误启动 9.2。
- 工作树注意事项：当前存在大量既有未提交改动和 untracked 文件。所有 sub-agent 必须保留无关改动，不得回滚、不格式化、不扩大提交范围。
- 当前下一步：启动 fresh sub-agent 执行 `bmenhance-cr-01-reviewer 9-1`，等待完成后再进入 evaluator。

## 2026-06-17 19:08 CST - Development Gate

- 决策：允许从 development 进入 CR reviewer。
- 原因：Story 9.1 已更新为 `review`，focused verification 和 packaging check 通过；全量测试失败被 Dev 记录为 unrelated untracked SDLC skill roots 污染 corpus count，需要由 CR reviewer/evaluator 判断是否构成本 Story blocker。
- 风险：dirty worktree 已显著扩大，且包含 Story 9.1 范围内大量 canonical skill 文案迁移和已有 unrelated 改动。后续所有提交范围必须白名单审计。

## 2026-06-17 19:08 CST - Reviewer Gate

- 决策：进入 evaluator，不直接进入 fixer。
- 原因：reviewer 结论为 FAIL，但外层 workflow 必须由 evaluator 独立确认 findings 的有效性、优先级和修复范围。
- 待关注：reviewer 的两个 finding 都指向 Story 9.1 AC5 gate 质量，不涉及需求边界变更；若 evaluator 确认有效，可交给 fixer 定点修复。

## 2026-06-17 19:08 CST - Evaluator Gate

- 决策：进入 fixer。
- 原因：evaluator 确认 2 条 reviewer finding 均有效，均为 patch 类阻塞项，且无需用户裁决。
- Fixer 边界：只能修改 `check_agent_skill.py` / 必要 lint 验证，以及 `test/installed-activation-contract.test.ts` 的 corpus discovery；不得借机刷新 unrelated snapshots 或修改 Story 文档。

## 2026-06-17 19:08 CST - Fixer Gate

- 决策：进入 Round 2 reviewer。
- 原因：fixer 已完成 evaluator 指定的两项修复，并追加修复记录；按 CR workflow，任何 fixer 后必须重新 review/evaluate，不能直接 closeout。
- 待关注：Round 2 reviewer 需要验证 self-test exclusion 是否合理，以及 installed mirror/reference 全量扫描是否没有新盲区。

## 2026-06-17 19:08 CST - Round 2 Reviewer Gate

- 决策：进入 Round 2 evaluator。
- 原因：reviewer Round 2 PASS 只是 reviewer 侧结论；orchestrator 完成标准要求 reviewer 和 evaluator 最新结论均通过。
- 待关注：evaluator 需确认 Round 2 没有遗漏 full test dirty-worktree residual 的处理边界。

## 2026-06-17 19:08 CST - Closeout Gate

- 决策：进入 CR closeout。
- 原因：最新 reviewer 与 evaluator 均 PASS，且 Requires Fixer 为否。
- Closeout 策略：`cr-04` / `cr-05` 如有默认分析或候选项，采用保守默认决策执行 skill 职责内记录；不自动修改全局文档，不扩大 TODO，不跳过 `cr-06-finalizer`。

## 2026-06-17 19:08 CST - Rules Extractor Decision

- 决策：接受 record-only，追加到 `cr-rules-summary.md`，不修改全局文档。
- 原因：两条规则都是测试 gate 实现规则，文档缺口为 0，适合 rules summary 沉淀，不适合自动升格到全局文档。
- 待关注：`cr-05` 仍需独立确认 CR TODO 为 0，不能仅凭 `cr-04` 建议跳过。

## 2026-06-17 19:08 CST - TODO Tracker Decision

- 决策：不新增 CR TODO，进入 finalizer。
- 原因：latest evaluation 明确无 TODO，backlog 无 Story 9.1 匹配项，且 `cr-04` 未交接未解决非阻塞候选项。
- 待关注：finalizer 只能标记 Story 9.1 done；Epic 9 仍有 Story 9.2 未完成，不能自动标记 Epic done。

## 2026-06-17 19:46 CST - Story 9.2 Gate Input

- 事实：Story 9.1 已 done；Story 9.2 文件状态仍为 `blocked-by-9-1-corpus-gate`，tracker 状态仍为 `ready-for-dev`。
- 决策：进入 Story 9.2 前必须以 Story 文件 / SR gate 为准，确认 Story 9.1 full corpus activation gate 已通过，再由 Story 9.2 dev step 处理状态推进。
- 注意：不在 9.1 finalizer 中修改 Story 9.2 状态，避免跨 Story 扩大 finalizer 范围。
