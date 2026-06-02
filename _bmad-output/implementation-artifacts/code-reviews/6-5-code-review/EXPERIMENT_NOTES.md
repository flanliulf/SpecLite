# EXPERIMENT_NOTES.md

## 2026-06-02

- 当前 Story：6.5 `skill-artifact-loop-and-documentation-examples`。
- 当前阶段：rules/todo/finalizer 已完成，准备执行提交前核验与本地提交。
- 关键边界：本 Story 只实现最小 installed skill discovery / activation / artifact loop release gate 和 fixture-derived docs examples；不做 complete docs rewrite、多 skill complex workflow、manual review quality scoring、Post-MVP governance dashboard、doctor/sync/uninstall、top-level repair 或 branded Copilot/Cursor target。
- 关键边界：fixture harness 必须 no-LLM、no-agent-runtime、local-only；activation 必须使用 installed `SKILL.md` 和 `speclite resolve` runtime support，不得使用 Python resolver 或 source checkout prompt。
- 依赖前置：Story 6.1-6.4 已完成。
- 工作树风险：已有大量无关脏改，后续所有 sub-agent 都必须保留这些改动，不得回滚、格式化或顺手同步无关文件。
- 执行约束：每一步 fresh sub-agent；同一时间只运行一个 workflow sub-agent；完成后关闭该 agent，再进入下一步。
- dev-story 结果：Story 与 sprint status 均为 `review`，实现最小 skill artifact loop 与 fixture-derived docs example；全量测试与 packaging check 已由 sub-agent 报告通过。
- 注意：dev-story 曾报告 build 与 packaging-check 并行导致一次失败，按顺序重跑通过；review 时需关注 release gate 顺序稳定性。
- reviewer round 1 结果：通过，无 blocking；2 个低优先级问题需要 evaluator 判断是当前修复还是 TODO。
- evaluator round 1 结果：Approved；2 个 P2 非阻塞项需通过 `cr-05` 记录 TODO。无 current fix，因此不做 no-op fixer。
- cr-04 结果：analysis-only；2 个 P2 候选不写入全局规则，转入 TODO backlog。
- cr-05 结果：新增 `TODO-007`（固化 `release:packaging-check` build 前置顺序）与 `TODO-008`（补强 packaged documentation example 空集合断言）。
- cr-06 结果：Story 6.5 与 sprint 中 Story 6.5 均为 `done`；Epic 6 全部 Story 均 `done`。
- 决策记录：`epic-6` 主状态仍保持 `in-progress`，因为 finalizer 要求用户确认 Epic 主状态变更；本流程采用保守默认不自动更新，也不挂起等待。
