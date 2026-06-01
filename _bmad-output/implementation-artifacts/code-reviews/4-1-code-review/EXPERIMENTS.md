# Experiments（尝试记录）

## Experiment 1：启动 Story 4-1 严格串行执行

- **时间**：2026-05-31
- **方案**：为 `4-1` 单独创建 CR 输出目录和进度文件，然后按用户指定顺序启动全新的 sub agent。
- **选择原因**：该方案符合每个 Story 独立记录、每步 fresh sub agent、禁止并行的约束。
- **结果**：已完成。第 1 个 sub agent `Darwin` 已执行 `/bmad-dev-story story 4-1`，Story 文件和 `sprint-status.yaml` 均进入 `review`。
- **验证记录**：sub agent 报告 `npm test` 169 个测试通过、`npm run build` 通过、相关 `git diff --check` 通过。

## Experiment 2：进入 Story 4-1 首轮 CR 审查

- **时间**：2026-05-31
- **方案**：启动第 2 个全新的 sub agent 执行 `/bmenhance-cr-01-reviewer 4-1`。
- **选择原因**：Story 已进入 `review`，满足 CR reviewer 前置条件。
- **结果**：已完成。Reviewer 输出 `4-1-code-review-summary-20260531-round-1.md`。
- **审查结论**：不通过；存在 2 个 `patch` 项，其中 1 个阻塞项与 `update --repair` 在 files-index 错标受保护路径时可能生成 `restore-canonical` repair action 有关。
- **下一步决策**：按流程启动 evaluator 独立评估 reviewer 发现；不跳过评估直接修复。

## Experiment 3：评估 Story 4-1 首轮 CR 结果

- **时间**：2026-05-31
- **方案**：启动第 3 个全新的 sub agent 执行 `/bmenhance-cr-02-evaluator 4-1`。
- **选择原因**：Reviewer 未通过且存在 `patch` 项，必须先由 evaluator 判断发现是否成立、哪些必须修复。
- **结果**：已完成。Evaluator 输出 `4-1-code-review-evaluation-20260531-round-1.md`。
- **评估结论**：不通过；需要修复 2 项，可忽略/延迟 0 项。
- **下一步决策**：按评估结论启动 fixer，修复范围仅限 evaluation 明确要求的 2 项。

## Experiment 4：修复 Story 4-1 首轮 CR 评估项

- **时间**：2026-05-31
- **方案**：启动第 4 个全新的 sub agent 执行 `/bmenhance-cr-03-fixer 4-1`。
- **选择原因**：Evaluator 已确认 2 项必须修复，且用户要求有明确推荐时直接按默认决策推进。
- **结果**：已完成。Fixer 修复 evaluation 确认的 2 项，并在 `4-1-code-review-evaluation-20260531-round-1.md` 追加修复执行记录。
- **修复摘要**：保护边界现在优先按 classifier 结果处理，`planRepair()` 对 protected conflict 跳过 repair action；`validateProject()` 将 manifest `artifactRoot` 传递给 file-integrity ownership classifier。
- **验证记录**：`npm test -- test/update-planning.test.ts test/file-integrity-ownership.test.ts` 通过，`npm run build` 通过，`git diff --check` 通过。
- **下一步决策**：按循环要求启动第二轮 reviewer，验证修复是否通过。

## Experiment 5：Story 4-1 第二轮 CR 复审

- **时间**：2026-05-31
- **方案**：启动新的 sub agent 执行 `/bmenhance-cr-01-reviewer 4-1`。
- **选择原因**：首轮评估项已修复，必须重新审查确认 reviewer 是否通过。
- **结果**：已完成。Reviewer 输出 `4-1-code-review-summary-20260531-round-2.md`。
- **审查结论**：通过；`patch: 0`、`decision_needed: 0`、`defer: 0`。上一轮 2 个修复项均已解决。
- **验证记录**：focused tests 7/7 通过，全量 `npm test` 171/171 通过，`npm run build` 通过，`git diff --check` 通过。
- **下一步决策**：仍需启动 evaluator round 2；只有 evaluator 也通过后才退出 CR 循环。

## Experiment 6：评估 Story 4-1 第二轮 CR 结果

- **时间**：2026-05-31
- **方案**：启动新的 sub agent 执行 `/bmenhance-cr-02-evaluator 4-1`。
- **选择原因**：用户要求 reviewer 通过且 evaluator 也通过后才能终止循环。
- **结果**：已完成。Evaluator 输出 `4-1-code-review-evaluation-20260531-round-2.md`。
- **评估结论**：通过；reviewer 的通过结论成立，需要修复 0 项，可忽略/延迟 0 项。
- **下一步决策**：CR 循环退出条件已满足，启动第五个全新 sub agent 顺序执行 rules-extractor、todo-tracker、finalizer。

## Experiment 7：Story 4-1 CR 后规则提炼、TODO 跟踪与收尾

- **时间**：2026-05-31
- **方案**：启动第五个全新的 sub agent，依次执行 `bmenhance-cr-04-rules-extractor`、`bmenhance-cr-05-todo-tracker`、`bmenhance-cr-06-finalizer`。
- **选择原因**：第二轮 reviewer 与 evaluator 均通过，满足 CR 收尾前置条件；用户要求前两个 skill 也根据结果执行默认决策。
- **默认决策**：规则提炼采用保守落地，只记录确认可沉淀的 CR 规则，不扩大修改全局文档；TODO tracker 仅记录非阻塞延迟项；finalizer 仅在最新 evaluation Approved/通过时标记 Story Done。
- **结果**：已完成。第五个 sub agent 严格按 04 → 05 → 06 顺序执行。
- **规则提炼结果**：record-only 写入 `cr-rules-summary.md`，新增 `CR-SEC-09` 与 `CR-SEC-10`；未修改全局文档。
- **TODO 跟踪结果**：CR TODO 为 0，`cr-todo-backlog.md` 未修改。
- **收尾结果**：Story `4-1` 已标记为 `done`，`sprint-status.yaml` 中 `4-1-ownership-model-and-protected-file-boundaries: done`；`bmm-workflow-status.yaml` 缺失，按容错跳过。
- **Epic 状态**：Epic 4 仍为 `in-progress`，因为 `4-2` 到 `4-6` 尚未完成。
