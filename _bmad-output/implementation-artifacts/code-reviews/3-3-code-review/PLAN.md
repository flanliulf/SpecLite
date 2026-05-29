# PLAN

## 范围

- Story: `3-3-ide-mirror-and-file-integrity-validation`
- Story 文件: `_bmad-output/implementation-artifacts/stories/3-3-ide-mirror-and-file-integrity-validation.md`
- 当前目标: 按用户要求使用 fresh sub-agent 严格串行且只执行 `/bmad-dev-story story 3-3`，完成实现、测试、验证，并把 Story 状态推进到 `review`。

## 串行计划

1. 使用 fresh sub-agent 和 GPT-5.5 执行 `/bmad-dev-story story 3-3`。
2. 按 Story 任务顺序执行：前置核对 -> mirror hash validation -> files index integrity -> validate orchestration -> read-only boundary -> tests -> local verification。
3. 每个阶段完成后更新 `EXPERIMENTS.md` 和 `EXPERIMENT_NOTES.md`。
4. 完成时只把 Story 3.3 和 `sprint-status.yaml` 的 3.3 状态推进到 `review`；不执行 CR、finalizer、提交或推送。

## 决策原则

- 不并行执行 Story 3.3 的开发步骤。
- 需要技术取舍时采用保守方案，并在本目录记录原因和影响。
- 任何 blocker 必须写入 `EXPERIMENT_NOTES.md`，并保留命令或文件证据。
- 不回滚或覆盖本轮开始前已经存在的未提交改动。

## CR Round 1 计划

1. 使用 `bmenhance-cr-01-reviewer` 对 Story 3.3 执行首轮只读代码审查。
2. 范围限定为 Story 3.3 File List 及其实现锚点，不审查 Story 3.1 / 3.2 / 3.4 或其它既有脏改动。
3. 因当前外层无 Agent 工具可用，按 skill 降级规则在当前上下文串行完成 Blind Hunter、Edge Case Hunter、Acceptance Auditor 三层审查。
4. 只写入本目录下 CR 结果和进度文件，不修复源码、不修改 Story 文件、不提交、不推送。

## CR Evaluation Round 1 计划

1. 使用 `bmenhance-cr-02-evaluator` 只评估 `3-3-code-review-summary-20260528-round-1.md`。
2. 对 reviewer 提出的 2 个 `patch` findings 逐条核验 Story 契约、源码实现和测试证据。
3. 本轮仅允许写入评估结果文件，并更新本目录 `PLAN.md`、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md` 记录进度；不修复源码、不改 Story、不提交、不推送。
4. 若存在严重性取舍，采用保守决策：与 Story 3.3 AC/contract 直接冲突的问题进入 fixer，不降级为 TODO。

## CR Fixer Round 1 计划

1. 使用 `bmenhance-cr-03-fixer` 只处理最新评估文件 `3-3-code-review-evaluation-20260528-round-1.md` 中确认需要修复的 2 个 P1 项。
2. 修复 #1：让 canonical package hash walker 在遍历阶段应用 include 边界，非 canonical adapter artifact symlink 不参与 canonical hash，也不触发 canonical symlink shape mismatch。
3. 修复 #2：让 files-index integrity 先用 `lstat()` 判断路径实体；dangling symlink 与指向既有文件的 symlink 均报告 `file-integrity.hash-mismatch` + `shape: "symlink"`，只有实体不存在才报告 missing。
4. 验证范围：focused `npm test -- test/validate-command.test.ts`、`npm run build`、`git diff --check`。

## CR Round 2 复审计划

1. 使用 `bmenhance-cr-01-reviewer` 对 Story 3.3 执行 Round 1 修复后的只读复审。
2. 参考 `3-3-code-review-summary-20260528-round-1.md` 和 `3-3-code-review-evaluation-20260528-round-1.md` 的修复执行记录，重点验证 2 个 patch 是否闭环。
3. 复审范围限定为 Story 3.3 File List 与 Round 1 修复点；不审查无关脏改动，不修复源码，不改 Story，不提交、不推送。
4. 当前外层无 Agent 工具可用，按 reviewer skill 降级规则在当前上下文串行完成三层审查，并在结果中记录降级模式。

## CR Evaluation Round 2 计划

1. 使用 `bmenhance-cr-02-evaluator` 只评估最新 reviewer Round 2 结果 `3-3-code-review-summary-20260528-round-2.md`。
2. 独立核验 Round 2 reviewer 的通过结论是否成立，重点确认 Round 1 两个 P1 patch 修复已闭环。
3. 本轮仅允许写入评估结果文件，并更新本目录 `PLAN.md`、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md` 记录进度；不修复源码、不改 Story、不提交、不推送。
4. 若确认无新增阻塞项、无 CR TODO/记录项，则输出 Approved/通过，并标记满足进入 rules/todo/finalizer 的条件。

## CR Rules Extraction 04（已完成）

1. 按 `bmenhance-cr-04-rules-extractor 3-3` 严格在 Round 2 Approved 后执行。
2. 读取 Round 1-2 CR summary/evaluation 与修复执行记录，分析 findings、修复闭环和可复用规则。
3. 对候选规则执行硬性门槛与 6 维评分，默认采用用户授权的推荐决策。
4. 将已解决、可复用但不宜升格全局的规则按 record-only 写入 `cr-rules-summary.md`；不修改全局文档。

## CR TODO Tracker 05（已完成）

1. 按 `bmenhance-cr-05-todo-tracker 3-3` 在 04 完成后执行。
2. 只筛选 non-blocking / defer / 后续改善项，禁止把 P1 blocking finding 降级为 TODO。
3. 读取 Round 2 evaluator，确认 CR TODO 为 0。
4. 记录“无新增 TODO”，不修改 `cr-todo-backlog.md`。

## CR Finalizer 06（已完成）

1. 按 `bmenhance-cr-06-finalizer 3-3` 在 05 完成后执行。
2. 验证最新 evaluation 为 Round 2 且结论 Approved / 通过。
3. 将 Story 文件与 `sprint-status.yaml` 中 Story 3.3 状态同步为 `done`。
4. 若 `bmm-workflow-status.yaml` 不存在则按 skill 容错跳过。
5. Epic 3 仍有未完成 Story，不主动修改 Epic 主状态。
