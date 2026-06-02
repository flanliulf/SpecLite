# PLAN

## 2026-05-28 CR Closeout Plan（CR 通过后收尾计划）

- 本轮用户指令：严格串行执行 `bmenhance-cr-04-rules-extractor` -> `bmenhance-cr-05-todo-tracker` -> `bmenhance-cr-06-finalizer`，只处理 Story 2-2。
- 输入 Story：`_bmad-output/implementation-artifacts/stories/2-2-ide-skill-entry-mapping.md`。
- 输入 CR 目录：`_bmad-output/implementation-artifacts/code-reviews/2-2-code-review/`。
- 最新 reviewer：`2-2-code-review-summary-20260528-round-3.md`，结论通过，0 findings。
- 最新 evaluator：`2-2-code-review-evaluation-20260528-round-3.md`，最终评估决定通过，Fix Items 0。
- 默认决策：04 若无新增可复用规则则仅记录 no-op 结果，不扩大全局文档；05 若无非阻塞项则不新增 TODO；06 在 CR Approved 证据成立后仅将 Story 2-2 收回 `done`，不处理其他 Story 或 Epic 主状态。
- Stop rule：完成三步收尾、同步必要状态文件、更新本目录 `PLAN.md`、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md` 后停止。
- 完成结果：04 无新增规则、05 无新增 TODO、06 已将 Story 2-2 与 `sprint-status.yaml` 对应条目同步为 `done`；`bmm-workflow-status.yaml` 不存在，按规则跳过。

## 2026-05-28 Evaluator Round 3 Plan（第 3 轮评估计划）

- 本轮用户指令：严格执行 `/bmenhance-cr-02-evaluator 2-2`，只评估最新 reviewer 输出，不执行 fixer/finalizer，不主动修改源码。
- 评估对象：`_bmad-output/implementation-artifacts/code-reviews/2-2-code-review/2-2-code-review-summary-20260528-round-3.md`。
- 本轮轮次：已有 evaluation round 1 / round 2，因此本次 evaluator 输出 round 3。
- 评估范围：核对 reviewer pass 是否成立、是否遗漏 Story 2-2 reopened corrective dev verification 风险、是否需要 fixer；证据限定为 Story 2-2 相关代码、测试、fixture 和验证命令。
- Stop rule：生成 round 3 evaluation，更新本目录 `PLAN.md`、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md` 后停止；不进入 fixer、finalizer 或其他 Story。

## 2026-05-28 Reviewer-Only Recheck Plan（仅 reviewer 复审计划）

- 本轮用户指令：严格执行 `/bmenhance-cr-01-reviewer 2-2`，只处理 Story 2-2，不重新开发，不执行 evaluator/fixer/finalizer。
- 本轮 Story 状态：`review`，因此继续跳过 dev-story。
- 本轮 CR 目录：`_bmad-output/implementation-artifacts/code-reviews/2-2-code-review/`。
- 本轮轮次：已有 round 1 / round 2 summary，因此本次 reviewer 输出 round 3。
- 本轮范围：只评估 reopened corrective dev verification 对 Story 2-2 范围的影响，重点是 Corrective Task 9 的 full selected package root mapping evidence；不回滚或清理当前工作区其他 Story/CR 改动。
- Stop rule：生成 round 3 reviewer summary 并更新本目录进度文件后停止。

## Corrective CR Reopen Plan（校正复审计划）

- 本轮目标：针对 reopened Story 2-2 的新增 AC / corrective tasks 做正式 CR 闭环，不重新开发 Epic 1/2。
- 当前 sprint 状态：`review`；因此按用户规则跳过 `/bmad-dev-story story 2-2`。
- 执行顺序：`/bmenhance-cr-01-reviewer 2-2` -> `/bmenhance-cr-02-evaluator 2-2` -> `/bmenhance-cr-03-fixer 2-2`，直到 reviewer 与 evaluator 均通过。
- 通过后执行：`bmenhance-cr-04-rules-extractor` -> `bmenhance-cr-05-todo-tracker` -> `bmenhance-cr-06-finalizer`。
- 所有步骤使用全新 sub-agent、模型 `gpt-5.5`、严格串行，不并行。

## 目标

针对 Story `2-2-ide-skill-entry-mapping` 严格串行执行开发、CR 审查、评估、修复循环、规则提炼、TODO 跟踪、收尾，并在通过后进入下一个 Epic 2 Story。

## 执行约束

- 每一步使用全新的 sub agent。
- 所有步骤严格串行，等待前一步完成后再进入下一步。
- 开发、审查、评估、修复使用 `gpt-5.5`。
- 最终提交使用 `gpt-5.4`，默认中文 commit message，不推送。
- 遇到可决策事项，优先按推荐方案执行，并在记录文件中说明。

## Story 2-2 执行步骤

1. 使用 `/bmad-dev-story story 2-2` 完成 Story 开发，并使 Story 状态进入 `review`。
2. 使用 `/bmenhance-cr-01-reviewer 2-2` 进行第 1 轮 CR。
3. 使用 `/bmenhance-cr-02-evaluator 2-2` 评估第 1 轮 CR。
4. 使用 `/bmenhance-cr-03-fixer 2-2` 修复评估确认的问题。
5. 重复 reviewer -> evaluator -> fixer，直到 reviewer 结论通过且 evaluator 评估通过。
6. 使用 `bmenhance-cr-04-rules-extractor` 提炼 CR 规则，并按推荐默认决策执行可落地事项。
7. 使用 `bmenhance-cr-05-todo-tracker` 处理可延迟 TODO，并按推荐默认决策执行可落地事项。
8. 使用 `bmenhance-cr-06-finalizer` 将 Story 标记为 Done 并同步状态文件。
9. 记录结果后进入 Story `2-3`。

## 当前状态

- Story 文件存在：`_bmad-output/implementation-artifacts/stories/2-2-ide-skill-entry-mapping.md`。
- `sprint-status.yaml` 中 Story `2-2-ide-skill-entry-mapping` 状态为 `ready-for-dev`。
- Story 2.1 已完成并在 `sprint-status.yaml` 中标记为 `done`。
- 当前工作树已有 Story 2.1 开发、CR、文档同步和用户安装依赖产生的未提交/未跟踪改动；后续步骤不得回滚或清理无关改动。
