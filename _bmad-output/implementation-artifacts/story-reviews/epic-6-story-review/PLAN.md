# Execution Plan（执行计划）

## Objective（目标）

对 Epic 6 执行串行 Story Review（SR）闭环：每轮依次运行 reviewer、evaluator、fixer，直到 reviewer 审查结论通过且 evaluator 评估结果通过；完成后使用 `git-commit-convention` 做本地提交，不推送。

## Scope（范围）

- Epic：`6`
- Epic 定义：`_bmad-output/planning-artifacts/epics/09-epic-6-maintainer-fixture-and-release-confidence维护者-fixture-与发布信心.md`
- Story 输入：`_bmad-output/implementation-artifacts/6-*.md`
- SR 输出目录：`_bmad-output/implementation-artifacts/story-reviews/epic-6-story-review/`
- 允许的修订范围：仅限 SR-03 evaluator 明确确认需要修订的 Epic 6 Story 文档、必要的 Epic 6 定义文档、以及评估文件中的修订记录。

## Constraints（约束）

- 每一步必须等待前一步完成，禁止并行。
- 每次 reviewer、evaluator、fixer 都使用全新的 sub agent。
- reviewer、evaluator、fixer 使用 `GPT-5.5 (gpt-5.5)`。
- commit 阶段使用 `GPT-5.4 (gpt-5.4)`，默认中文 commit message，不推送。
- SR-01 与 SR-02 是只读步骤，不得修改 Story、Epic 或源码。
- SR-03 只能按最新 evaluator 评估结论中明确需要修订的问题执行，不得扩大范围。
- 不回退、不整理当前工作区已有的用户改动。

## Decisions（执行决策）

- `sr-config.md` 仍写明 Story 文件目录为 `_bmad-output/implementation-artifacts/stories/`，但当前仓库不存在该目录。
- 既有 Epic 2 SR 产物已记录并采用真实存在的 `_bmad-output/implementation-artifacts/2-*.md` 作为 Story 输入。
- 本轮沿用同一事实口径：Epic 6 Story 输入使用真实存在的 `_bmad-output/implementation-artifacts/6-*.md`，并在 SR 产物中记录路径偏差。

## Steps（步骤）

1. 准备并维护本目录下的 `PLAN.md`、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md`。
2. Round 1：启动 fresh sub agent 运行 `/bmenhance-sr-01-reviewer epic 6`。
3. Round 1：启动 fresh sub agent 运行 `/bmenhance-sr-02-evaluator 6`。
4. Round 1：启动 fresh sub agent 运行 `/bmenhance-sr-03-fixer 6`。
5. 检查 Round 1 reviewer 与 evaluator 的结论；若任一未通过，进入下一轮。
6. 后续每轮重复 reviewer -> evaluator -> fixer，直到 reviewer 与 evaluator 均通过。
7. 使用 fresh sub agent 运行 `git-commit-convention`，分析变更、分组、提交到本地仓库，不推送。
8. 汇总最终结果、提交哈希和剩余风险。
