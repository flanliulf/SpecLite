# EXPERIMENT_NOTES.md

## 2026-06-02

- 当前 Story：6.3 `drift-source-integrity-and-resolve-parity-fixtures`。
- 当前阶段：Story 6.3 已完成，准备进入 Story 6.4。
- 关键边界：本 Story 默认不实现 repair execution fixture；validate/source/resolve expected outputs 不得产生 `RepairCommandData`，repair expected outputs handoff 给 Story 6.4，除非 Story 明确要求 separate repair fixture。
- 重点内容：`ide-drift` release gate、`source-integrity` 10 个 release-gate group sub-cases、`resolve-parity` config/customization merge parity。
- 依赖前置：Story 6.1 fixture contract foundation 与 Story 6.2 fresh/update release gate 已完成。
- 工作树风险：已有大量无关脏改，后续所有 sub-agent 都必须保留这些改动，不得回滚、格式化或顺手同步无关文件。
- 执行约束：每一步 fresh sub-agent；同一时间只运行一个 workflow sub-agent；完成后关闭该 agent，再进入下一步。
- dev-story 结果：Story 与 sprint status 均为 `review`，实现 `ide-drift` / `source-integrity` / `resolve-parity` fixture gates；全量测试已由 sub-agent 报告通过。
- reviewer round 1 结果：不通过；1 个 fixture expected output mismatch 需要 evaluator 判断后再修复。
- evaluator round 1 结果：Not Approved；1 个 P1 有效，无可 defer 项。
- fixer round 1 结果：1 个 P1 已修复；接下来必须重新 reviewer/evaluator，不能直接收尾。
- reviewer round 2 结果：通过，无 blocking、无 non-blocking；仍需 evaluator round 2 通过才可进入 rules/todo/finalizer。
- evaluator round 2 结果：Approved；Story 6.3 CR 阻塞项闭环，且没有 CR TODO。
- rules/todo/finalizer 结果：Story 6.3 已 Done；无新增 TODO；规则提炼为 analysis-only，未写全局文档。
