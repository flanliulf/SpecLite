# EXPERIMENT_NOTES

## 2026-06-15 15:42 CST

当前执行 Story `7-5-project-config-init-and-listing-commands`。

已确认关键约束：

- 每一步都必须 fresh sub-agent。
- 外层步骤绝对不并行。
- `bmenhance-cr-01-reviewer` 内部如有三层审查机制，仍视为该 skill 内部行为。
- 需要决策时采用推荐方案并记录；不得越权修改无关文件、推送远端或扩大需求边界。

当前判断：

- Story `7-5` 缺少 Story kickoff gate；直接启动 dev sub-agent 可能在同一门禁上 HALT。
- Story `7-1` 至 `7-4` 已完成，当前是 Epic 7 最后一个 Story。
- Story `7-5` 明确不允许重写 `install` 行为、改变 `status` / `validate` / `update` semantics、实现 7.1-7.4 已有功能，或新增数据库/daemon/remote service/GUI/TUI/长期 cache。

下一步：启动 fresh dev sub-agent。

## 2026-06-15

fresh dev sub-agent 已完成 Story `7-5` 开发并将状态推进到 `review`。

注意点：

- 本 Story 新增 Post-MVP `init` / `list` command。
- 实现扩展了 `CommandResult` SPEC/schema/result/renderer，并新增 focused tests。
- 下一步只能启动 reviewer，不能直接 evaluator 或 fixer。

## 2026-06-15

Reviewer Round 1 已完成，结论不通过。

Evaluator 需要重点判断：

- `init` / `list` 使用 `process.cwd()` 作为 bundled source root 是否确实破坏真实 CLI target cwd 场景。
- 修复是否应注入或解析 package source root，而不是扩大到 install/list 的其他行为。
- absent custom stub 创建是否应作为 P2 TODO，而不是阻塞修复。

下一步：fresh evaluator，不能直接修复。

## 2026-06-15

Evaluator Round 1 已完成，Not Approved。

明确修复边界：

- Fixer 必须修复 `init` / `list` source root 问题，让真实 target cwd 下也能读取 bundled canonical metadata 并返回 `CommandResult`。
- Fixer 必须补 `init` / `list` 的真实 target cwd focused tests。
- Fixer 不处理 absent custom stub 行为；该项交给后续 05 TODO Tracker。

下一步：fresh fixer，fixer 后必须重新 reviewer/evaluator。

## 2026-06-15

Fixer Round 1 已完成。

当前 gate 判断：

- P1 blocker 已按 evaluator 要求修复。
- P2 absent custom stub 语义项未修复，这是刻意决策，后续交给 05 TODO Tracker。
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
- 仍有 1 个 P2 CR TODO：absent custom stub 是否允许由 `init --yes` 创建。

下一步按用户指定顺序启动 04 rules extractor；04 完成后才能启动 05。

## 2026-06-15

04 rules extractor 已完成。它提出 1 条可记录规则，但写入 `cr-rules-summary.md` 需要用户明确确认 `record-only`。

当前决策：不停止等待，不越权落地该规则；继续执行 05 TODO Tracker。04 同时确认 absent custom stub 语义已有 architecture 规则澄清，预期 05 不新增 open TODO。

## 2026-06-15

05 TODO Tracker 已完成，确认 Story `7-5` 没有需要新增、更新或关闭的 TODO。

下一步启动 06 finalizer。finalizer 完成后，Epic 7 的所有 Story 都应处于 `done`，随后才能进入最终本地 commit。

## 2026-06-15

06 finalizer 已完成，Story `7-5`、sprint status 与 Epic `7` 均为 `done`。

下一步进入最终 commit。必须先审计工作树并白名单暂存 Epic 7 相关文件；不得提交 Epic 8 既有未追踪文件，不 push。
