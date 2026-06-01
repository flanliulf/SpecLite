# Experiments（尝试记录）

## Experiment 1：启动 Story 4-3 严格串行执行

- **时间**：2026-05-31
- **方案**：为 `4-3` 单独创建 CR 输出目录和进度文件，然后按用户指定顺序启动全新的 dev sub agent。
- **选择原因**：`4-1` 与 `4-2` 已完成，`4-3` 是 Epic 4 中下一个待处理 Story；该方案符合每个 Story 独立记录、每步 fresh sub agent、禁止并行的约束。
- **结果**：已完成。第 1 个 sub agent `Ramanujan` 已执行 `/bmad-dev-story story 4-3`，Story 文件和 `sprint-status.yaml` 均进入 `review`。
- **实现摘要**：`speclite update` 现在生成 pre-write `UpdatePlan`，区分 planned effects 与 actual apply results；接入 source descriptor trust/evidence、files index/hash、ownership classifier、shared config/customization resolver；新增 `--dry-run` / `--yes` 授权投影。
- **验证记录**：focused tests 15/15 通过，`npm run build` 通过；`npm test` 默认 5s timeout 下有 2 个既有慢测超时，随后 `npx vitest run --testTimeout=15000` 全量 178 tests 通过；`git diff --check` 通过。

## Experiment 2：进入 Story 4-3 首轮 CR 审查

- **时间**：2026-05-31
- **方案**：启动第 2 个全新的 sub agent 执行 `/bmenhance-cr-01-reviewer 4-3`。
- **选择原因**：Story 已进入 `review`，满足 CR reviewer 前置条件。
- **结果**：已完成。Reviewer 输出 `4-3-code-review-summary-20260531-round-1.md`。
- **审查结论**：不通过；存在 2 个 `patch` 项：越界实现 `update --repair` / `restore-canonical` repair plan 行为；缺失或 malformed `sourceDescriptor` 不会阻断 write-capable update plan。
- **Defer 记录**：默认 `npm test` 5s timeout 下的既有慢测超时被记录为 `defer`，不作为本 Story 回归。
- **下一步决策**：按流程启动 evaluator 独立评估 reviewer 发现；不跳过评估直接修复。

## Experiment 3：评估 Story 4-3 首轮 CR 结果

- **时间**：2026-05-31
- **方案**：启动第 3 个全新的 sub agent 执行 `/bmenhance-cr-02-evaluator 4-3`。
- **选择原因**：Reviewer 未通过且存在 `patch` 项，必须先由 evaluator 判断发现是否成立、哪些必须修复。
- **结果**：已完成。Evaluator 输出 `4-3-code-review-evaluation-20260531-round-1.md`。
- **评估结论**：不通过；2 个 `patch` 均确认有效且必须修复；1 个延迟项只记录，0 个误报。
- **下一步决策**：按评估结论启动 fixer，修复范围仅限 evaluation 明确要求的 2 项。

## Experiment 4：修复 Story 4-3 首轮 CR 评估项

- **时间**：2026-05-31
- **方案**：启动第 4 个全新的 sub agent 执行 `/bmenhance-cr-03-fixer 4-3`。
- **选择原因**：Evaluator 已确认 2 项必须修复，且用户要求有明确推荐时直接按默认决策推进。
- **结果**：已完成。Fixer 修复 evaluation 确认的 2 个 P1 项，并在 `4-3-code-review-evaluation-20260531-round-1.md` 追加修复执行记录。
- **修复摘要**：收回 Story 4.3 越界的 `update --repair` repair plan 行为，不再生成 `restore-canonical`；缺失或格式错误 `sourceDescriptor` 现在会产生 error issue 并阻断 update planning。
- **Defer 处理**：默认 `npm test` 5s timeout 慢测治理只记录，不在 fixer 中处理。
- **验证记录**：`npx vitest run test/update-planning.test.ts --testTimeout=15000` 通过，`npx vitest run test/update-command.test.ts --testTimeout=15000` 通过，`npm run build` 通过，`git diff --check` 通过。
- **下一步决策**：按循环要求启动第二轮 reviewer，验证修复是否通过。

## Experiment 5：Story 4-3 第二轮 CR 复审

- **时间**：2026-05-31
- **方案**：启动新的 sub agent 执行 `/bmenhance-cr-01-reviewer 4-3`。
- **选择原因**：首轮评估项已修复，必须重新审查确认 reviewer 是否通过。
- **结果**：已完成。Reviewer 输出 `4-3-code-review-summary-20260531-round-2.md`。
- **审查结论**：不通过；上一轮 repair 越界项已收敛，manifest 存在但缺失/malformed `sourceDescriptor` 的 blocker 已补齐；但 manifest 文件本身缺失或不可读时仍会绕过 source descriptor blocker，并可在 `--yes` 下生成 write-capable update plan。
- **分类**：`patch: 1`、`decision_needed: 0`、`defer: 1`。
- **验证记录**：`npm test` 178 tests 通过，focused tests 15 tests 通过，`npm run build` 通过，`git diff --check` 通过；`npm run lint` 未配置。
- **下一步决策**：启动第二轮 evaluator，确认该 patch 是否必须修复。

## Experiment 6：评估 Story 4-3 第二轮 CR 结果

- **时间**：2026-05-31
- **方案**：启动新的 sub agent 执行 `/bmenhance-cr-02-evaluator 4-3`。
- **选择原因**：Reviewer 第二轮仍未通过，必须由 evaluator 判断剩余 patch 是否成立。
- **结果**：已完成。Evaluator 输出 `4-3-code-review-evaluation-20260531-round-2.md`。
- **评估结论**：不通过；manifest 缺失/不可读仍绕过 source descriptor blocker 被确认为 1 个 P1 阻塞项；默认 `npm test` 5s timeout 慢测治理维持非阻塞 defer / CR TODO。
- **下一步决策**：启动下一轮 fixer，仅修复 manifest 缺失/不可读 blocker；defer 项不在 fixer 中处理。

## Experiment 7：修复 Story 4-3 第二轮 CR 评估项

- **时间**：2026-05-31
- **方案**：启动新的 sub agent 执行 `/bmenhance-cr-03-fixer 4-3`。
- **选择原因**：Evaluator 第二轮确认 1 个 P1 必须修复，且用户要求有明确推荐时直接推进。
- **结果**：已完成。Fixer 仅修复 evaluation round 2 确认的 1 个阻塞问题，并在 `4-3-code-review-evaluation-20260531-round-2.md` 追加修复执行记录。
- **修复摘要**：`readManifestContext()` 在 manifest 缺失、不可读或 YAML parse 失败时返回 `source-integrity.missing-source-descriptor` error issue，触发既有 blocker gate，避免继续生成 write-capable update plan。
- **测试补充**：新增 manifest 文件缺失与 manifest YAML 无法解析的 `--yes` focused tests，断言 `updatePlan.actions: []`、`writeAuthorized: false`、exit code 为失败。
- **验证记录**：`npx vitest run test/update-planning.test.ts` 通过，`npm run build` 通过，`git diff --check` 通过；`git diff --check --no-index /dev/null <target-file>` 对 3 个目标文件均通过。
- **Defer 处理**：默认 `npm test` 5s timeout 慢测治理仍只记录为 defer/CR TODO，本 fixer 未处理。
- **下一步决策**：启动第三轮 reviewer，验证剩余 P1 是否关闭。

## Experiment 8：Story 4-3 第三轮 CR 复审

- **时间**：2026-05-31
- **方案**：启动新的 sub agent 执行 `/bmenhance-cr-01-reviewer 4-3`。
- **选择原因**：第二轮评估项已修复，必须重新审查确认 reviewer 是否通过。
- **结果**：已完成。Reviewer 输出 `4-3-code-review-summary-20260531-round-3.md`。
- **审查结论**：不通过；Round 2 的 manifest 缺失/读取失败/YAML parse 失败 blocker 已修复，Round 1 两个 blocker 未回归；但 `test/update-command.test.ts` 仍断言旧的 missing files-index 行为，导致 `npm test` 有 2 个非 timeout 失败。
- **分类**：`patch: 1`、`decision_needed: 0`、`defer: 1`。
- **下一步决策**：启动第三轮 evaluator，确认该测试断言问题是否必须修复。

## Experiment 9：评估 Story 4-3 第三轮 CR 结果

- **时间**：2026-05-31
- **方案**：启动新的 sub agent 执行 `/bmenhance-cr-02-evaluator 4-3`。
- **选择原因**：Reviewer 第三轮仍未通过，必须由 evaluator 判断新 `patch` 是否成立。
- **结果**：已完成。Evaluator 输出 `4-3-code-review-evaluation-20260531-round-3.md`。
- **评估结论**：不通过；`test/update-command.test.ts` 旧 missing files-index 断言导致 `npm test` 2 个非 timeout 失败，确认成立且阻塞；默认 `npm test` 5s timeout 慢测治理继续作为非阻塞 CR TODO。
- **下一步决策**：启动下一轮 fixer，仅修复 `test/update-command.test.ts` 旧断言导致的 2 个非 timeout 失败。

## Experiment 10：修复 Story 4-3 第三轮 CR 评估项

- **时间**：2026-05-31
- **方案**：启动新的 sub agent 执行 `/bmenhance-cr-03-fixer 4-3`。
- **选择原因**：Evaluator 第三轮确认 1 个阻塞测试断言问题必须修复。
- **结果**：已完成。Fixer 修复 evaluation round 3 确认的 1 个阻塞测试断言问题，并在 `4-3-code-review-evaluation-20260531-round-3.md` 追加修复执行记录。
- **修复摘要**：在 `test/update-command.test.ts` 两个目标 fixture 中补齐可信 `_speclite/_config/manifest.yaml`，让测试越过 source descriptor gate 后继续覆盖缺失 files-index 的 `update.conflicts` 行为。
- **验证记录**：`npx vitest run test/update-command.test.ts --testTimeout=15000` 通过，`npx vitest run test/update-planning.test.ts --testTimeout=15000` 通过，`npm test` 180 tests 通过，`npm run build` 通过，`git diff --check` 通过。
- **Defer 处理**：默认 `npm test` 5s timeout 慢测治理继续只记录为 defer/CR TODO，本 fixer 未处理。
- **下一步决策**：启动第四轮 reviewer，验证所有 P1 是否关闭。

## Experiment 11：Story 4-3 第四轮 CR 复审

- **时间**：2026-05-31
- **方案**：启动新的 sub agent 执行 `/bmenhance-cr-01-reviewer 4-3`。
- **选择原因**：第三轮评估项已修复，必须重新审查确认 reviewer 是否通过。
- **结果**：已完成。Reviewer 输出 `4-3-code-review-summary-20260531-round-4.md`。
- **审查结论**：通过；Round 3 测试断言问题已修复，Round 1/2 的 repair 越界、sourceDescriptor gate、manifest gate 均未回归。
- **分类**：`patch: 0`、`decision_needed: 0`、`defer: 1`。
- **验证记录**：`test/update-command.test.ts` 5/5 通过，`test/update-planning.test.ts` 12/12 通过，`npm test` 180 tests 通过，`npm run build` 通过；`npm run lint` 未配置。
- **下一步决策**：仍需启动 evaluator round 4；只有 evaluator 也通过后才退出 CR 循环。

## Experiment 12：评估 Story 4-3 第四轮 CR 结果

- **时间**：2026-05-31
- **方案**：启动新的 sub agent 执行 `/bmenhance-cr-02-evaluator 4-3`。
- **选择原因**：用户要求 reviewer 通过且 evaluator 也通过后才能终止循环。
- **结果**：已完成。Evaluator 输出 `4-3-code-review-evaluation-20260531-round-4.md`。
- **评估结论**：通过；确认 reviewer 的通过结论成立；需要修复 0 项；可忽略/延迟 1 项，即默认 `npm test` 5s timeout 慢测治理作为延迟 CR TODO。
- **下一步决策**：CR 循环退出条件已满足，启动第五个全新 sub agent 顺序执行 rules-extractor、todo-tracker、finalizer；其中 05 需要处理延迟 CR TODO。

## Experiment 13：Story 4-3 CR 后规则提炼、TODO 跟踪与收尾

- **时间**：2026-05-31
- **方案**：启动第五个全新的 sub agent，依次执行 `bmenhance-cr-04-rules-extractor`、`bmenhance-cr-05-todo-tracker`、`bmenhance-cr-06-finalizer`。
- **选择原因**：第四轮 reviewer 与 evaluator 均通过，满足 CR 收尾前置条件；用户要求前两个 skill 也根据结果执行默认决策。
- **默认决策**：规则提炼采用保守落地，只记录确认可沉淀的 CR 规则，不扩大修改全局文档；TODO tracker 对明确延迟项写入 backlog；finalizer 仅在最新 evaluation 通过时标记 Story Done。
- **结果**：准备启动。
