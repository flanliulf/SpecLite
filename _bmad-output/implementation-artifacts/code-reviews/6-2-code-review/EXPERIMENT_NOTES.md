# EXPERIMENT_NOTES.md

## 2026-06-02

- 当前 Story：6.2 `fresh-install-and-existing-update-fixture-gates`。
- 当前阶段：Story 6.2 已完成，准备进入 Story 6.3。
- 关键边界：普通 `existing-install-update` fixture 不得混入 `update --repair`；repair fixture ownership 按 Story 文本 handoff 给后续 Story 6.3 / 6.4。
- 依赖前置：Story 6.1 已建立 fixture contract foundation 并完成 CR/finalizer。
- 工作树风险：已有大量无关脏改，后续所有 sub-agent 都必须保留这些改动，不得回滚、格式化或顺手同步无关文件。
- 执行约束：每一步 fresh sub-agent；同一时间只运行一个 workflow sub-agent；完成后关闭该 agent，再进入下一步。
- dev-story 结果：Story 与 sprint status 均为 `review`，新增 release gate fixtures 与 update 行为测试；全量测试已由 sub-agent 报告通过。
- reviewer round 1 结果：不通过；2 个 blocking finding，需要 evaluator 判断后再修复。
- evaluator round 1 结果：Not Approved；2 个 P1 全部有效，无可 defer 项。
- fixer round 1 结果：2 个 P1 已修复；接下来必须重新 reviewer/evaluator，不能直接收尾。
- reviewer round 2 结果：通过，无 blocking、无 non-blocking；仍需 evaluator round 2 通过才可进入 rules/todo/finalizer。
- evaluator round 2 结果：Approved；Story 6.2 CR 阻塞项闭环，且没有 CR TODO。
- rules/todo/finalizer 结果：Story 6.2 已 Done；无新增 TODO；规则总结写入 story-scoped `cr-rules-summary.md`，没有改全局文档。
