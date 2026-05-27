# PLAN

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
