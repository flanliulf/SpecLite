# Experiment Notes（实验笔记）

## 2026-06-15 Preflight Decision（前置决策）

当前不能启动 reviewer。原因不是普通工程取舍，而是 SR 输入缺失：

- `bmenhance-sr-01-reviewer` 的 Epic 模式需要扫描 `_bmad-output/implementation-artifacts/stories/` 中以 Epic ID 开头的 Story 文件。
- Epic 7 当前只有 planning artifact，没有 `7-*` Story markdown。
- 若此时启动 reviewer，只能得到无 Story 输入的失败结果，不能形成有效 SR 结论。

## Risk（风险）

- 如果直接基于 Epic planning artifact 代替 Story 文件执行 SR，会改变 `bmenhance-sr-01-reviewer` 的审查粒度和输入契约。
- 如果自动创建 Story 文件，会超出当前用户请求的 SR goal 范围，且会修改未明确授权的 planning / implementation artifacts。
- 当前工作树已有一批已暂存变更，后续最终 commit 必须避免把无关 release / fixture 改动混入 Epic 7 SR 提交。

## User Intervention Point（用户介入点）

需要用户选择下一步之一：

1. 先创建 Epic 7 Story 文件，再续跑 SR goal。
2. 明确授权把 Epic 7 planning artifact 拆成 `7-*` Story markdown，然后继续 SR。
3. 指定已有其他 Story 文件作为 Epic 7 SR 输入。

在上述条件满足前，外层 orchestrator 保持 `BLOCKED_PRE_REVIEW`，不启动 reviewer/evaluator/fixer，也不执行最终 commit。

## 2026-06-15 Continuation Audit 2（续跑审计 2）

第二次续跑审计后，阻塞条件没有变化：仍无 `7-*` Story markdown，且 sprint status 仍为 backlog。

决策保持不变：

- 不启动 reviewer，因为 reviewer 的 Epic 模式输入仍不存在。
- 不自动从 Epic planning artifact 生成 Story 文件，因为这会修改未明确授权的 implementation artifacts。
- 不执行 evaluator/fixer/commit，因为 reviewer 尚未产生任何可评估结果。

当前最小安全推进动作已经完成：保留 SR 目录和进度文件，使后续 Story 文件出现后可以直接从 preflight 状态续跑。

## 2026-06-15 Continuation Audit 3（续跑审计 3）

第三次续跑审计后，阻塞条件仍未变化：

- 没有 `7-*` Story markdown。
- 没有 Epic 7 SR summary。
- 没有 Epic 7 SR evaluation。
- sprint status 仍将 Epic 7 和四个 Story 条目标记为 `backlog`。

这已经满足 active goal blocked audit 的连续三次同一阻塞条件。当前不是 reviewer/evaluator/fixer 能解决的问题；缺失的是 SR reviewer 的权威输入文件。

Blocked 判定：

- 不能启动 reviewer：缺少 Story 输入。
- 不能启动 evaluator：缺少 reviewer 输出。
- 不能启动 fixer：缺少 evaluator 结论。
- 不能最终 commit：SR 闭环未发生，且工作树存在无关已暂存变更。

恢复条件仍是：提供或授权创建 Epic 7 `7-*` Story markdown，然后从 reviewer 步骤续跑。

## 2026-06-15 Resume Decision（恢复决策）

当前阻塞条件已经解除：

- 已存在 Epic 7 的 `7-1` 到 `7-5` Story markdown。
- Epic planning artifact、Story 文件名/H1、`sprint-status.yaml` 的 7.x key 已做集合一致性检查，结果为 `OK`。
- 仍未存在 Epic 7 review summary 或 evaluation，因此不是从 evaluator/fixer 续跑，而是启动 Round 1 reviewer。

决策：

- 恢复 active goal，不再保持 `BLOCKED_PRE_REVIEW`。
- 外层仍保持严格串行：先 fresh reviewer，完成并更新记录后再 fresh evaluator。
- 最终提交前必须重新审计工作树，避免把已有 release / fixture / Epic 8 等无关改动混入 Epic 7 SR 闭环提交。

## 2026-06-15 Reviewer Round 1 Decision（Reviewer 第 1 轮判断）

Reviewer 产物已生成，结论为有条件通过而非最终通过。发现集中在文档 traceability 和 contract-first 表达：

- Epic List 未同步 Flow Gate hook enforcement scope。
- Story 7.4 对 machine-readable report artifact 的 owning SPEC 前置条件表达不完整。
- Story 7.2 对新增 issue id 时同步 Validation Issue Taxonomy 的要求不够显式。
- Story 7.5 Change Log 仍残留重编号前的 7.1 描述。

门禁判断：

- 不能直接结束 SR，因为 reviewer 不是“通过”，且存在 4 个 `patch` 发现。
- 不能启动 fixer，因为尚未有 evaluator 确认哪些发现有效、哪些需要修订。
- 下一步必须启动 fresh evaluator，并以 evaluator 的“需要修订 / 可直接进入开发 / 需讨论”作为是否进入 fixer 的依据。

## 2026-06-15 Evaluator Round 1 Decision（Evaluator 第 1 轮判断）

Evaluator 已确认 SR 不可直接收口，整体结论为需修订后再审。

修订范围判断：

- Finding 1 和 Finding 2 被列入“需要修订（阻塞进入开发）”，是 fixer 的授权范围。
- Finding 3 和 Finding 4 被列入“建议纳入后续改善跟踪（非阻塞）”，不是必须修订项。虽然 evaluation 末尾提到可由 fixer 顺手处理，但为避免扩大范围，外层 orchestrator 将 fixer 指令限定为 P1 阻塞项。

下一步：

- 启动 fresh fixer。
- fixer 完成后必须回到 reviewer/evaluator，而不能直接提交。

## 2026-06-15 Fixer Round 1 Decision（Fixer 第 1 轮判断）

Fixer 已完成两个 P1 阻塞项，且未处理 Finding 3 / Finding 4。

当前判断：

- Finding 1 对应的 Epic List scope traceability 已补齐。
- Finding 2 对应的 Story 7.4 contract-first 入口已扩展到 CLI `--json` 与 machine-readable report artifact。
- 因为曾执行 fixer，必须重新 review/evaluate；不能依据 fixer 自报直接判定 SR 通过。

下一步：

- 启动 Round 2 reviewer。
- Round 2 reviewer 应重点关注上轮 P1 是否修复，以及非阻塞 P2/P3 是否仍然只是改善跟踪项。

## 2026-06-15 Reviewer Round 2 Decision（Reviewer 第 2 轮判断）

Round 2 reviewer 已给出通过结论：

- Round 1 Finding 1 已修复。
- Round 1 Finding 2 已修复。
- 本轮没有新的 `decision_needed` 或 `patch`。
- Finding 3 / Finding 4 维持为 `defer` 非阻塞改善跟踪项。

门禁判断：

- 不能直接完成目标，因为 completion criteria 要求最新 evaluator 也通过。
- 下一步必须启动 fresh evaluator 评估 Round 2 summary。

## 2026-06-15 Evaluator Round 2 Decision（Evaluator 第 2 轮判断）

Evaluator 第 2 轮确认 Round 2 reviewer 的通过结论成立：

- 两个 P1 阻塞项已修复。
- 无新的需要修订项。
- Finding 3 / Finding 4 仍是非阻塞后续改善，不阻塞 Epic 7 进入开发。

门禁判断：

- SR 循环已满足 reviewer 通过 + evaluator 通过。
- 曾执行 fixer，且 fixer 后已重新 review/evaluate。
- 下一步进入最终提交；提交前必须隔离当前工作树里的无关 staged release / fixture 改动和 Epic 8 untracked Story。

## 2026-06-15 Final Commit Decision（最终提交决策）

已完成本地提交 `7069b0c docs(epic-7): 完成 Story Review 闭环`，未 push。

提交范围决策：

- 纳入 Epic 7 planning、Epic List 中的 Flow Gate scope 修订、Epic 7 的 5 个 Story、Epic 7 SR 记录与 review/evaluation 产物。
- 排除 `sprint-status.yaml`，因为当前文件同时承载 Epic 7 与 Epic 8 状态变更；为避免把 Epic 8 混入 Epic 7 SR 提交，本次不提交该文件。
- 排除已有 release / fixture staged 变更、Epic 8 Story、flow gate artifact 和 implementation readiness report。

剩余风险：

- 工作树仍有无关 staged / unstaged / untracked 变更，属于本 SR goal 外部状态，未回滚也未提交。
