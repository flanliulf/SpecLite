# Epic 1 SR 闭环执行计划

## 目标

对 Epic 1 执行 Story design review（SR）闭环，直到 reviewer 结论通过且 evaluator 评估也通过，然后使用 `git-commit-convention` 本地提交，不推送。

## 范围

- Epic：`epic 1`
- SR 输出目录：`_bmad-output/implementation-artifacts/story-reviews/epic-1-story-review/`
- Epic 定义文件：`_bmad-output/planning-artifacts/epics/04-epic-1-project-installation-onboarding项目安装引导.md`
- Story 文档：当前仓库中 `1-*.md` Story 文件直接位于 `_bmad-output/implementation-artifacts/` 根目录。

## 执行原则

- 所有步骤严格串行执行，不并行。
- 每次 SR-01、SR-02、SR-03 都使用全新的 sub-agent。
- SR-01 reviewer 和 SR-02 evaluator 使用 `gpt-5.5`。
- 最终提交步骤使用 `gpt-5.4`。
- 如遇需要决策事项，采用推荐决策继续推进，并在 `EXPERIMENT_NOTES.md` 中记录理由。
- 只提交本次 Epic 1 SR 闭环直接相关文件，不使用 `git add -A`。

## 步骤

1. 初始化本目录下的 `PLAN.md`、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md`。
2. 第 1 轮启动全新 sub-agent 执行 `/bmenhance-sr-01-reviewer epic 1`。
3. 等 reviewer 完成后，启动全新 sub-agent 执行 `/bmenhance-sr-02-evaluator 1`。
4. 等 evaluator 完成后，启动全新 sub-agent 执行 `/bmenhance-sr-03-fixer 1`。
5. 检查最新 reviewer 和 evaluator 结论：
   - 若 reviewer 通过且 evaluator 通过，进入提交步骤。
   - 否则按 2-4 重复下一轮。
6. 使用 `git-commit-convention` 分析并提交本次相关变更，默认中文，不推送。

## 当前状态

- 状态：已完成。
- 最近动作：已使用 `git-commit-convention` 通过全新 sub-agent 执行本地提交。
- 最新 reviewer/evaluator 结论：均通过；需要修订 item 为 0，误报为 0。
- 提交结果：`2fec2ff docs(epic-1): 完成 Story 设计审查闭环`。
- 推送状态：未推送。
- 提交边界：仅提交本次 Epic 1 SR 闭环直接相关文件；仓库仍保留其他未提交改动。
