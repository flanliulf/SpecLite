# Experiments（尝试记录）

## Experiment 1：启动 Story 4-2 严格串行执行

- **时间**：2026-05-31
- **方案**：为 `4-2` 单独创建 CR 输出目录和进度文件，然后按用户指定顺序启动全新的 dev sub agent。
- **选择原因**：`4-1` 已完成，`4-2` 是 Epic 4 中下一个待处理 Story；该方案符合每个 Story 独立记录、每步 fresh sub agent、禁止并行的约束。
- **结果**：已完成。第 1 个 sub agent `Lorentz` 已执行 `/bmad-dev-story story 4-2`，Story 文件和 `sprint-status.yaml` 均进入 `review`。
- **实现摘要**：`update` / `update --repair` 在 planning 前复用 shared config/customization resolver；required resolver error 阻断 planning，optional layer warning 进入 `CommandResult.issues`；installed skill customization lookup 使用 installed skill directory basename。
- **验证记录**：sub agent 报告 `npm test` 174 个测试通过、`npm run build` 通过、`git diff --check` 通过。

## Experiment 2：进入 Story 4-2 首轮 CR 审查

- **时间**：2026-05-31
- **方案**：启动第 2 个全新的 sub agent 执行 `/bmenhance-cr-01-reviewer 4-2`。
- **选择原因**：Story 已进入 `review`，满足 CR reviewer 前置条件。
- **结果**：已完成。Reviewer 输出 `4-2-code-review-summary-20260531-round-1.md`。
- **审查结论**：不通过；存在 1 个阻塞 `patch` 项，指出 `update` / `update --repair` 的 `targetProject` 仍通过旧 helper 只读 `_speclite/config.toml`，未使用四层 config resolver merged value。
- **下一步决策**：按流程启动 evaluator 独立评估该发现；不跳过评估直接修复。

## Experiment 3：评估 Story 4-2 首轮 CR 结果

- **时间**：2026-05-31
- **方案**：启动第 3 个全新的 sub agent 执行 `/bmenhance-cr-02-evaluator 4-2`。
- **选择原因**：Reviewer 未通过且存在阻塞 `patch` 项，必须先由 evaluator 判断发现是否成立。
- **结果**：已完成。Evaluator 输出 `4-2-code-review-evaluation-20260531-round-1.md`。
- **评估结论**：不通过；reviewer 的 1 个阻塞 `patch` 成立，需要修复 1 项，可忽略/延迟 0 项。
- **下一步决策**：按评估结论启动 fixer，修复范围仅限 evaluation 明确要求的 1 项。

## Experiment 4：修复 Story 4-2 首轮 CR 评估项

- **时间**：2026-05-31
- **方案**：启动第 4 个全新的 sub agent 执行 `/bmenhance-cr-03-fixer 4-2`。
- **选择原因**：Evaluator 已确认 1 项必须修复，且用户要求有明确推荐时直接按默认决策推进。
- **结果**：已完成。Fixer 修复 evaluation 确认的 1 项，并在 `4-2-code-review-evaluation-20260531-round-1.md` 追加修复执行记录。
- **修复摘要**：`speclite update` / `speclite update --repair` 的 `targetProject` 现在优先通过 shared `resolveProjectConfig({ keys: ["core.project_name"] })` 读取四层 merged config value，trim 后非空即使用；不可用时才走既有 fallback。
- **验证记录**：`npm test -- test/update-command.test.ts` 通过，`npm run build` 通过，`git diff --check` 通过。
- **下一步决策**：按循环要求启动第二轮 reviewer，验证修复是否通过。

## Experiment 5：Story 4-2 第二轮 CR 复审

- **时间**：2026-05-31
- **方案**：启动新的 sub agent 执行 `/bmenhance-cr-01-reviewer 4-2`。
- **选择原因**：首轮评估项已修复，必须重新审查确认 reviewer 是否通过。
- **结果**：已完成。Reviewer 输出 `4-2-code-review-summary-20260531-round-2.md`。
- **审查结论**：通过；上一轮 `targetProject` 绕过四层 config resolver 的阻塞项已修复，未发现新阻塞问题；`patch=0`、`decision_needed=0`、`defer=0`。
- **验证记录**：focused tests 20/20 通过，`git diff --check` 通过。
- **下一步决策**：仍需启动 evaluator round 2；只有 evaluator 也通过后才退出 CR 循环。

## Experiment 6：评估 Story 4-2 第二轮 CR 结果

- **时间**：2026-05-31
- **方案**：启动新的 sub agent 执行 `/bmenhance-cr-02-evaluator 4-2`。
- **选择原因**：用户要求 reviewer 通过且 evaluator 也通过后才能终止循环。
- **结果**：已完成。Evaluator 输出 `4-2-code-review-evaluation-20260531-round-2.md`。
- **评估结论**：通过；需要修复 0 项，可忽略/延迟 0 项。
- **下一步决策**：CR 循环退出条件已满足，启动第五个全新 sub agent 顺序执行 rules-extractor、todo-tracker、finalizer。

## Experiment 7：Story 4-2 CR 后规则提炼、TODO 跟踪与收尾

- **时间**：2026-05-31
- **方案**：启动第五个全新的 sub agent，依次执行 `bmenhance-cr-04-rules-extractor`、`bmenhance-cr-05-todo-tracker`、`bmenhance-cr-06-finalizer`。
- **选择原因**：第二轮 reviewer 与 evaluator 均通过，满足 CR 收尾前置条件；用户要求前两个 skill 也根据结果执行默认决策。
- **默认决策**：规则提炼采用保守落地，只记录确认可沉淀的 CR 规则，不扩大修改全局文档；TODO tracker 仅记录非阻塞延迟项；finalizer 仅在最新 evaluation 通过时标记 Story Done。
- **结果**：已完成。第五个 sub agent 严格按 04 → 05 → 06 顺序执行。
- **规则提炼结果**：record-only 写入 `cr-rules-summary.md`，新增 `CR-API-19`；未修改全局文档。
- **TODO 跟踪结果**：无 `defer`、无非阻塞 CR TODO，`cr-todo-backlog.md` 未修改。
- **收尾结果**：Story `4-2` 已标记为 `done`，`sprint-status.yaml` 中 `4-2-config-and-customization-merge-order-for-updates: done`；`bmm-workflow-status.yaml` 缺失，按容错跳过。
- **Epic 状态**：Epic 4 仍为 `in-progress`，因为 `4-3` 到 `4-6` 尚未完成。
