# EXPERIMENT_NOTES.md

## 2026-06-02

- 当前 Story：6.4 `path-portability-and-runtime-matrix-evidence`。
- 当前阶段：Story 6.4 已完成，准备进入 Story 6.5。
- 关键边界：本 Story 承接 explicit repair fixture，必须使用 `speclite update --repair --json`、`command: "update.repair"` 和 `RepairCommandData`；不得混入 normal update / validate / source-integrity / resolve parity。
- 关键边界：不得提前实现 Story 6.5 `skill-artifact-loop` release gate、documentation examples rewrite、多 skill workflow quality 或人工评审结论；只允许定义 typed pending/skip slot。
- 重点内容：Node `[22,24]` runtime matrix、macOS/Windows path portability、performance evidence 非稳定化、packaging acceptance、terminal/no-color behavior、path escape/case conflict/LF/executable intent。
- 依赖前置：Story 6.1-6.3 已完成。
- 工作树风险：已有大量无关脏改，后续所有 sub-agent 都必须保留这些改动，不得回滚、格式化或顺手同步无关文件。
- 执行约束：每一步 fresh sub-agent；同一时间只运行一个 workflow sub-agent；完成后关闭该 agent，再进入下一步。
- dev-story 结果：Story 与 sprint status 均为 `review`，实现 runtime/path/packaging/repair release evidence；全量测试与 packaging check 已由 sub-agent 报告通过。
- reviewer round 1 结果：不通过；4 个 blocking patch 项，需要 evaluator 判断后再修复。
- evaluator round 1 结果：Not Approved；4 个 finding 全部有效且 blocking，无可 defer 项。
- fixer round 1 结果：4 个 blocking 项已修复；接下来必须重新 reviewer/evaluator，不能直接收尾。
- reviewer round 2 结果：仍不通过；2 个 blocking、1 个 non-blocking，需要 evaluator 判断后再进入 fixer。
- evaluator round 2 结果：2 个 P1 blocking 必修；1 个 P2 exit-code 断言建议同步补强或进入 TODO。当前推荐同步补强，避免留下可直接处理的测试空洞。
- fixer round 2 结果：2 个 P1 已修复，P2 已同步补强；接下来必须重新 reviewer/evaluator。
- reviewer round 3 结果：仍不通过；剩余 1 个 project-boundary path escape blocking 残留。packaging、unsafe overwrite、exit-code 已闭环。
- evaluator round 3 结果：残留 finding 有效，必须修 expected evidence 为 `path-escapes-project`，无 defer 项。
- fixer round 3 结果：expected evidence 已修为 `path-escapes-project`，测试已补断言；接下来必须重新 reviewer/evaluator。
- reviewer round 4 结果：通过，无 blocking；有 1 个动态 CLI smoke gate 同构补强的 non-blocking 建议，需要 evaluator 判断是否 Approved 以及是否进入 TODO。
- evaluator round 4 结果：Approved；1 个 P2 非阻塞项需要通过 `cr-05` 记录 TODO。
- rules/todo/finalizer 结果：Story 6.4 已 Done；P2 非阻塞项已记录为 `TODO-006`；规则提炼为 analysis-only。
