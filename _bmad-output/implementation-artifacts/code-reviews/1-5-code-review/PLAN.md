# PLAN（计划）

## 2026-05-28 CR Closeout Override（CR 通过后收尾覆盖计划）

- 用户当前指令：严格按顺序执行 `bmenhance-cr-04-rules-extractor` -> `bmenhance-cr-05-todo-tracker` -> `bmenhance-cr-06-finalizer`，只处理 Story 1-5。
- 输入范围：Story 文件、`1-5-code-review` 目录、`cr-rules-summary.md`、`cr-todo-backlog.md`、`sprint-status.yaml`；不处理其他 Story，不修改 Epic 主状态。
- 最新 CR 证据：`1-5-code-review-summary-20260528-round-3.md` 通过且 findings 0；`1-5-code-review-evaluation-20260528-round-3.md` Approved / 通过，Fix Items 0，CR TODO 0。
- 默认决策：
  - 04 rules-extractor：采用 record-only；只补充 Story 1-5 规则总结的 round 3 证据与无新增规则结论，不修改全局文档。
  - 05 todo-tracker：执行 extract/check 结论记录；round 3 CR TODO 为 0，不新增 backlog 条目。
  - 06 finalizer：在 CR Approved 证据成立后将 Story 1-5 收回 `done`，同步 `sprint-status.yaml`；`bmm-workflow-status.yaml` 不存在则按规则跳过。
- 进度状态：已完成 04/05/06 收尾；Story 1-5 与 `sprint-status.yaml` 已同步为 `done`，CR TODO 为 0。

## 2026-05-28 Evaluator-Only Override（仅执行 Evaluator 的覆盖计划）

- 用户当前指令：严格执行 `/bmenhance-cr-02-evaluator 1-5`，评估最新 reviewer 输出。
- 本轮范围：只处理 Story 1-5 最新 review summary，即 `1-5-code-review-summary-20260528-round-3.md`；不执行 fixer/finalizer，不主动修改源码。
- 轮次判断：已有 2 个 evaluation 文件，本轮为 evaluation round 3。
- 评估重点：核对 reviewer pass 是否成立、0 findings 是否存在遗漏、Corrective Task 10 相关代码与测试证据是否支持通过结论、是否需要 fixer。
- 进度状态：已完成 evaluator；生成 round 3 evaluation；结论 Approved / 通过，需要修复项 0，CR TODO 0，不需要 fixer。

## 2026-05-28 Reviewer-Only Override（仅执行 Reviewer 的覆盖计划）

- 用户当前指令：严格执行 `/bmenhance-cr-01-reviewer 1-5`，这是 reopened corrective dev verification 后的 Story 1-5 复审。
- 本轮范围：只处理 Story 1-5 reviewer，不重新开发，不执行 evaluator、fixer、finalizer。
- 审查目录：`_bmad-output/implementation-artifacts/code-reviews/1-5-code-review/`。
- 轮次判断：已有 2 个 review summary，本轮为 round 3 复审。
- 执行模式：当前环境未提供独立 `Agent` 调度工具，按 reviewer skill 降级为当前上下文串行三层审查，并在 review summary 中如实记录。
- 进度状态：已完成 reviewer；生成 round 3 summary；结论通过，findings 0，不需要进入 fixer。

## Corrective CR Reopen Plan（校正复审计划）

- 本轮目标：针对 reopened Story 1-5 的新增 AC / corrective tasks 做正式 CR 闭环，不重新开发 Epic 1/2。
- 当前 sprint 状态：`review`；因此按用户规则跳过 `/bmad-dev-story story 1-5`。
- 执行顺序：`/bmenhance-cr-01-reviewer 1-5` -> `/bmenhance-cr-02-evaluator 1-5` -> `/bmenhance-cr-03-fixer 1-5`，直到 reviewer 与 evaluator 均通过。
- 通过后执行：`bmenhance-cr-04-rules-extractor` -> `bmenhance-cr-05-todo-tracker` -> `bmenhance-cr-06-finalizer`。
- 所有步骤使用全新 sub-agent、模型 `gpt-5.5`、严格串行，不并行。

## Story（故事）

- Story ID：`1-5`
- Story 文件：`_bmad-output/implementation-artifacts/stories/1-5-runtime-structure-artifact-directory-and-ide-mirror-creation.md`
- Code Review 目录：`_bmad-output/implementation-artifacts/code-reviews/1-5-code-review/`
- 当前目标：按用户要求串行完成开发、CR、评估、修复循环、CR 收尾，并在 Epic 1 全部 Story 完成后统一本地提交。

## Execution Plan（执行计划）

1. 使用全新的 sub-agent（`gpt-5.5`）执行 `/bmad-dev-story story 1-5`，限定其开发当前 Story，不扩展到后续 Story。
2. 使用全新的 sub-agent（`gpt-5.5`）执行 `/bmenhance-cr-01-reviewer 1-5`，生成代码审查结果。
3. 使用全新的 sub-agent（`gpt-5.5`）执行 `/bmenhance-cr-02-evaluator 1-5`，评估最新审查结果。
4. 使用全新的 sub-agent（`gpt-5.5`）执行 `/bmenhance-cr-03-fixer 1-5`；如评估无修复项，则执行 0 修复项收口并不得修改源码。
5. 若 reviewer 或 evaluator 未通过，则重复 reviewer -> evaluator -> fixer，直到两者均通过。
6. 通过后，使用第五个全新的 sub-agent（`gpt-5.5`）依次执行 `bmenhance-cr-04-rules-extractor`、`bmenhance-cr-05-todo-tracker`、`bmenhance-cr-06-finalizer`，采用默认推荐决策并记录。
7. Story 1-5 完成后进入 Story 1-6。

## Constraints（约束）

- 所有 skill 步骤必须严格串行，任何 sub-agent 完成前不得启动下一步。
- 每个用户要求的 skill 调用必须使用新的 sub-agent。
- 只允许开发 Story 1-5 明确要求的范围，不实现 Story 1-6 ready summary。
- 修复只允许根据评估文件中的明确结论执行，不主动扩大范围。
- 不回滚或清理用户已有未提交变更，除非后续得到明确授权。
