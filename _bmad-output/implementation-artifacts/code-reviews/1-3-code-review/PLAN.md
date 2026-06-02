# PLAN（计划）

## Corrective CR Reopen Plan（校正复审计划）

- 本轮目标：针对 reopened Story 1-3 的新增 AC / corrective tasks 做正式 CR 闭环，不重新开发 Epic 1/2。
- 当前 sprint 状态：`review`；因此按用户规则跳过 `/bmad-dev-story story 1-3`。
- 执行顺序：`/bmenhance-cr-01-reviewer 1-3` -> `/bmenhance-cr-02-evaluator 1-3` -> `/bmenhance-cr-03-fixer 1-3`，直到 reviewer 与 evaluator 均通过。
- 通过后执行：`bmenhance-cr-04-rules-extractor` -> `bmenhance-cr-05-todo-tracker` -> `bmenhance-cr-06-finalizer`。
- 所有步骤使用全新 sub-agent、模型 `gpt-5.5`、严格串行，不并行。

## Story（故事）

- Story ID：`1-3`
- Story 文件：`_bmad-output/implementation-artifacts/stories/1-3-official-module-selection-and-install-summary.md`
- Code Review 目录：`_bmad-output/implementation-artifacts/code-reviews/1-3-code-review/`
- 当前目标：按用户要求串行完成开发、CR、评估、修复循环、CR 收尾，并在 Epic 1 全部 Story 完成后统一本地提交。

## Execution Plan（执行计划）

1. 使用全新的 sub-agent（`gpt-5.5`）执行 `/bmad-dev-story story 1-3`，限定其开发当前 Story，不扩展到后续 Story。
2. 使用全新的 sub-agent（`gpt-5.5`）执行 `/bmenhance-cr-01-reviewer 1-3`，生成代码审查结果。
3. 使用全新的 sub-agent（`gpt-5.5`）执行 `/bmenhance-cr-02-evaluator 1-3`，评估最新审查结果。
4. 使用全新的 sub-agent（`gpt-5.5`）执行 `/bmenhance-cr-03-fixer 1-3`；如评估无修复项，则执行 0 修复项收口并不得修改源码。
5. 若 reviewer 或 evaluator 未通过，则重复 reviewer -> evaluator -> fixer，直到两者均通过。
6. 通过后，使用第五个全新的 sub-agent（`gpt-5.5`）依次执行 `bmenhance-cr-04-rules-extractor`、`bmenhance-cr-05-todo-tracker`、`bmenhance-cr-06-finalizer`，采用默认推荐决策并记录。
7. Story 1-3 完成后进入 Story 1-4。

## Constraints（约束）

- 所有 skill 步骤必须严格串行，任何 sub-agent 完成前不得启动下一步。
- 每个用户要求的 skill 调用必须使用新的 sub-agent。
- 只允许开发 Story 1-3 明确要求的范围，不实现 Story 1-4+。
- 修复只允许根据评估文件中的明确结论执行，不主动扩大范围。
- 不回滚或清理用户已有未提交变更，除非后续得到明确授权。

## 2026-05-28 Reviewer-Only Reopened Verification（仅 Reviewer 复审）

- 本轮用户指令：严格执行 `/bmenhance-cr-01-reviewer 1-3`，不重新开发，不执行 evaluator / fixer / finalizer。
- Story 状态：`_bmad-output/implementation-artifacts/sprint-status.yaml` 中 `1-3-official-module-selection-and-install-summary: review`，因此本轮 dev-story 跳过。
- 轮次：已有 `1-3-code-review-summary-*-round-1.md` 与 `round-2.md`，本轮 reviewer 输出 `round-3`。
- 审查范围：仅 Story 1-3 reopened corrective dev verification 涉及的 Story diff、代码 diff、测试 diff、历史 CR/evaluation 和实际验证命令。
- 执行限制：当前环境无独立 `Agent` 工具；按 reviewer skill 降级为主流程串行三层审查，并在 review 总结中如实记录。
- 停止边界：生成 Round 3 reviewer summary 后停止；是否进入 fixer 只在结论中说明，不启动后续流程。

## 2026-05-28 Evaluator-Only Round 3（仅 Evaluator 评估）

- 本轮用户指令：严格执行 `/bmenhance-cr-02-evaluator 1-3`，只评估最新 reviewer 输出，不执行 fixer / finalizer，不主动修改源码。
- 最新 review 文件：`_bmad-output/implementation-artifacts/code-reviews/1-3-code-review/1-3-code-review-summary-20260528-round-3.md`。
- 轮次：已有 evaluation round 1/2，本轮输出 evaluation round 3。
- 评估范围：仅 Story 1-3 Round 3 reviewer 的 1 个 `patch` finding，主题为 AC7 canonical package root count 是否出现在成功路径写入前展示 / 确认中。
- 写入边界：允许新增本轮 evaluation 文件，并维护本目录 `PLAN.md`、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md`；不得修改 Story、源码、测试、状态文件或执行 fixer。

## 2026-05-28 Reviewer-Only Round 4（仅 Reviewer 复检）

- 本轮用户指令：严格执行 `/bmenhance-cr-01-reviewer 1-3`，只复检 Round 3 fixer 后状态，不执行 evaluator / fixer / finalizer。
- 最新输入：Round 3 reviewer 不通过，Round 3 evaluator 确认 P1 有效，fixer 已修改 `src/commands/install.ts` 与 `test/install-module-selection.test.ts`。
- 轮次：已有 review summary round 1/2/3，本轮 reviewer 输出 `round-4`。
- 重点：确认 canonical package root count 是否进入真正的 pre-write 用户可见 / 可确认路径，并检查 fixer 是否引入选择范围、JSON/headless、写入时序或测试覆盖回归。
- 执行限制：当前环境无独立 `Agent` 工具；按 reviewer skill 降级为主流程串行三层审查，并在 review 总结中如实记录。
- 停止边界：生成 Round 4 reviewer summary 后停止；是否需要 evaluator/fixer 只在结论中说明，不启动后续流程。

## 2026-05-28 Evaluator-Only Round 4（仅 Evaluator 评估）

- 本轮用户指令：严格执行 `/bmenhance-cr-02-evaluator 1-3`，只评估最新 Round 4 reviewer 输出，不执行 fixer / finalizer，不主动修改源码。
- 最新 review 文件：`_bmad-output/implementation-artifacts/code-reviews/1-3-code-review/1-3-code-review-summary-20260528-round-4.md`。
- 轮次：已有 evaluation round 1/2/3，本轮输出 evaluation round 4。
- 评估范围：仅 Story 1-3 Round 4 reviewer 的 1 个上轮遗留 `patch` finding，主题为 pre-write package root count summary 是否绑定 detailed config 后的最终 selected module set。
- 写入边界：允许新增本轮 evaluation 文件，并维护本目录 `PLAN.md`、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md`；不得修改 Story、源码、测试、状态文件或执行 fixer。

## 2026-05-28 Reviewer-Only Round 5（仅 Reviewer 复检）

- 本轮用户指令：严格执行 `/bmenhance-cr-01-reviewer 1-3`，只复检 Round 4 fixer 后状态，不执行 evaluator / fixer / finalizer。
- 最新输入：Round 4 reviewer/evaluator 不通过，Round 4 fixer 已新增最终 pre-write confirmation：`confirmPrewriteInstallScope`，并更新 CLI prompt 与 regression tests。
- 轮次：已有 review summary round 1/2/3/4，本轮 reviewer 输出 `round-5`。
- 重点：确认 Round 4 P1 是否关闭，即 detailed config 改变 selected module set 后，最终 pre-write summary / confirmation 是否绑定最终安装范围并发生在 `applyInstallPlan` 前；同时检查 CLI、人机交互、JSON/headless contract、测试覆盖和写入时序是否有新回归。
- 执行限制：当前环境无独立 `Agent` 工具；按 reviewer skill 降级为主流程串行审查，并在 review 总结中如实记录。
- 停止边界：生成 Round 5 reviewer summary 后停止；不启动 evaluator / fixer / finalizer。

## 2026-05-28 Evaluator-Only Round 5（仅 Evaluator 评估）

- 本轮用户指令：严格执行 `/bmenhance-cr-02-evaluator 1-3`，评估最新 Round 5 reviewer 输出；即使 reviewer 建议不需要 evaluator，也必须满足用户停止条件。
- 最新 review 文件：`_bmad-output/implementation-artifacts/code-reviews/1-3-code-review/1-3-code-review-summary-20260528-round-5.md`。
- 轮次：已有 evaluation round 1/2/3/4，本轮输出 evaluation round 5。
- 评估范围：只处理 Story 1-3 Round 5 reviewer pass 结论，重点确认 Round 4 P1 是否真实关闭、是否存在遗漏、是否需要 fixer。
- 写入边界：允许新增本轮 evaluation 文件，并维护本目录 `PLAN.md`、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md`；不得修改 Story、源码、测试、状态文件或执行 fixer / finalizer。

## 2026-05-28 Post-CR Closeout（CR 通过后收尾）

- 本轮用户指令：严格按顺序执行 `bmenhance-cr-04-rules-extractor`、`bmenhance-cr-05-todo-tracker`、`bmenhance-cr-06-finalizer`，只处理 Story 1-3，不并行。
- 最新 reviewer：`1-3-code-review-summary-20260528-round-5.md`，结论通过，findings 0。
- 最新 evaluator：`1-3-code-review-evaluation-20260528-round-5.md`，结论 Approved / 通过，Fix Items: 0。
- Step 1 / 04 规则提炼：读取 Story 1-3 全部 CR summary/evaluation，采用默认推荐决策 record-only；不修改全局规划文档，只在 `cr-rules-summary.md` 追加 corrective CR 中已修复的可复用规则。
- Step 2 / 05 TODO 跟踪：检查 Round 5 reviewer/evaluator 与历史非阻塞项；若无候选项则不新增 TODO。
- Step 3 / 06 finalizer：验证最新 evaluation 通过后，将 Story 1-3 重新同步为 `done`；若 workflow status 文件不存在则按规则跳过；不处理 Epic 主状态或其他 Story。
