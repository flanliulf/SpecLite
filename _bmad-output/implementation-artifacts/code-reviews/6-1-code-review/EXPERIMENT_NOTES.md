# EXPERIMENT_NOTES.md

## 2026-06-02

- 当前 Story：6.1 `fixture-case-layout-and-expected-output-contract`。
- 当前阶段：Story 6.1 已完成，准备进入 Story 6.2。
- 关键边界：Story 6.1 只负责 fixture contract foundation，不提前实现 Story 6.2-6.5 的完整 fixture matrix。
- 工作树风险：已有大量无关脏改，后续所有 sub-agent 都必须保留这些改动，不得回滚、格式化或顺手同步无关文件。
- 执行约束：每一步 fresh sub-agent；同一时间只运行一个 workflow sub-agent；完成后关闭该 agent，再进入下一步。
- dev-story 结果：Story 与 sprint status 均为 `review`，新增/修改 `src/fixtures/fixture-contract.ts` 和 `test/fixture-contract.test.ts`，全量测试已由 sub-agent 报告通过。
- reviewer round 1 结果：不通过；3 个 blocking finding 需要 evaluator 判断后由 fixer 处理。暂不直接修，保持 reviewer -> evaluator -> fixer 顺序。
- evaluator round 1 结果：Not Approved；3 个 P1 修复项全部有效，1 个 P2 defer 项暂不在 fixer 中处理。
- fixer round 1 结果：3 个 P1 已修复，defer 项保留；接下来必须重新 reviewer/evaluator，不能直接收尾。
- reviewer round 2 结果：通过，无 blocking；仍需 evaluator round 2 通过才可进入 rules/todo/finalizer。
- evaluator round 2 结果：Approved；Story 6.1 CR 阻塞项闭环。下一步先提炼规则，再处理 defer TODO，最后 finalizer 标记 Done。
- rules/todo/finalizer 结果：Story 6.1 已 Done；defer 项已进入 `TODO-005`；规则总结写入 story-scoped `cr-rules-summary.md`，没有改全局文档。
