# EXPERIMENT_NOTES

## 2026-06-15 13:40 CST

当前执行 Story `7-2-doctor-sync-and-uninstall-commands`。

已确认关键约束：

- 每一步都必须 fresh sub-agent。
- 外层步骤绝对不并行。
- `bmenhance-cr-01-reviewer` 内部如有三层审查机制，仍视为该 skill 内部行为。
- 需要决策时采用推荐方案并记录；不得越权修改无关文件、推送远端或扩大需求边界。

当前判断：

- Story `7-2` 缺少 Story kickoff gate；直接启动 dev sub-agent 会在同一门禁上 HALT。
- Story `7-1` 已完成，且建立了 Flow Gate hook/report metadata 与 hook artifact projection；这满足 `7-2` 的前置扩展点要求。
- 因此先生成 `7-2` kickoff gate report，再启动 fresh dev sub-agent。

注意：工作树已有 Epic 8 未追踪文件和 `7-1` 完成后的未提交改动，后续 commit 必须白名单暂存。

## 2026-06-15

fresh dev sub-agent 已完成 Story `7-2` 开发并将状态推进到 `review`。

注意点：

- `7-2` 实现引入 `doctor`、`sync`、`uninstall` command 及相关 contracts/tests。
- 工作树继续混杂：`7-1`、`7-2`、Epic 8 既有文件同时存在；后续提交仍必须白名单。
- 下一步只能启动 reviewer，不能直接 evaluator 或 fixer。

## 2026-06-15

Reviewer Round 1 已完成，结论不通过。

Evaluator 需要重点判断：

- `uninstall` 对 installer-owned directory 使用非 recursive removal 是否确实违反 AC4。
- `sync` / `uninstall` human output 缺少 step state 是否应修复，或可降级为 TODO。

下一步：fresh evaluator，不能直接修复。

## 2026-06-15

Evaluator Round 1 已完成，Not Approved。

明确修复边界：

- Fixer 必须修复 Finding #1：`uninstall` 应能安全递归删除 installer-owned directory。
- Fixer 不处理 Finding #2：`sync` / `uninstall` human output 缺少 Step State block。该项交给后续 05 TODO Tracker。

下一步：fresh fixer，fixer 后必须重新 reviewer/evaluator。

## 2026-06-15

Fixer Round 1 已完成。

当前 gate 判断：

- P1 blocker 已按 evaluator 要求修复。
- P2 TODO 未修复，这是刻意决策，后续交给 05 TODO Tracker。
- 修复后必须重新执行 reviewer 和 evaluator。

下一步：fresh reviewer Round 2。

## 2026-06-15

Reviewer Round 2 通过。当前仍不能收尾，因为还需要 evaluator Round 2 Approved。

下一步：fresh evaluator Round 2。

## 2026-06-15

Evaluator Round 2 已 Approved。

当前状态：

- CR 循环 gate 已满足：reviewer 通过，evaluator 通过。
- 不需要再 fixer。
- 仍有 1 个 P2 CR TODO，后续 05 TODO Tracker 需要处理。

下一步按用户指定顺序启动 04 rules extractor；04 完成后才能启动 05。

## 2026-06-15

04 rules extractor 已完成。候选 1 需要用户确认才能记录规则总结，本轮不越权落地；候选 2 是未完成非阻塞项，明确交给 05；候选 3 不沉淀。

下一步：fresh 05 TODO tracker，目标是新增 Story 7-2 的 P2 TODO。

## 2026-06-15

05 TODO tracker 已完成，新增 `TODO-011`。当前 Story `7-2` 的 CR 循环已经通过，04/05 也完成。

下一步只能启动 06 finalizer。finalizer 完成前不能进入 Story `7-3`，也不能提交。

## 2026-06-15

06 finalizer 已完成，Story `7-2` 与 sprint status 均为 `done`。Epic `7` 还不能收口，因为 `7-3`、`7-4`、`7-5` 未完成。

下一步进入 Story `7-3`。仍需继续保持 fresh sub-agent、严格串行；最终 commit 只能在全部 Epic 7 Story 完成后执行。
