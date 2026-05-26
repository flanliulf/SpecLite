# Epic 4 Story Review Plan（Epic 4 Story 审查计划）

## Objective（目标）

对 Epic 4 执行串行 SR 工作流：先审查，再评估，再按评估结果修订；如果 reviewer 或 evaluator 未通过，则开启下一轮，直到两者均通过。通过后使用 `git-commit-convention` 本地提交，不推送。

## Serial Constraints（串行约束）

- 每一步只启动一个全新的 sub agent。
- 必须等待当前 sub agent 完成后，才启动下一步。
- `bmenhance-sr-01-reviewer` 内部允许其 skill 自己按设计启动三层子审查。
- 不并行执行 SR skill，不并行执行 commit skill。

## Execution Steps（执行步骤）

1. Preflight（预检）：确认 Epic 4 定义文件、Epic 4 Story 文件和 SR 输出目录。
2. Round 1 Reviewer（第 1 轮审查）：使用 `bmenhance-sr-01-reviewer`，触发形式 `/bmenhance-sr-01-reviewer epic 4`，模型 `GPT-5.5`。
3. Round 1 Evaluator（第 1 轮评估）：使用 `/bmenhance-sr-02-evaluator 4`，模型 `GPT-5.5`。
4. Round 1 Fixer（第 1 轮修订）：使用 `/bmenhance-sr-03-fixer 4`，模型 `GPT-5.5`。
5. Gate（通过门禁）：读取最新审查总结和评估文件，判断 reviewer 结论与 evaluator 评估决定是否均通过。
6. 若未通过，重复 Reviewer -> Evaluator -> Fixer。
7. 通过后执行 `git-commit-convention`，模型 `GPT-5.4`，默认中文 commit message，本地提交，不推送。

## Current Repository Facts（当前仓库事实）

- Epic 4 定义文件位于 `_bmad-output/planning-artifacts/epics/07-epic-4-safe-update-and-repair安全更新与修复.md`。
- Epic 4 Story 文件实际位于 `_bmad-output/implementation-artifacts/` 根目录，文件名以 `4-` 开头。
- 当前 Epic 4 Story 文件共 6 个：`4-1` 至 `4-6`。
- SR 输出目录为 `_bmad-output/implementation-artifacts/story-reviews/epic-4-story-review/`。

## Decision Log（决策记录）

- `sr-config.md` 中写到 Story 文件目录为 `_bmad-output/implementation-artifacts/stories/`，但当前仓库没有该目录；本次执行以真实存在的 `_bmad-output/implementation-artifacts/4-*.md` 为 Epic 4 Story 来源，并要求各 sub agent 在结果中记录该路径偏差。
- 用户要求遇到决策事项优先使用推荐决策执行，因此上述路径偏差不暂停等待人工确认。
- 工作区在本任务开始前已有大量未提交修改与未跟踪文件；本次 SR/fix/commit 只围绕 Epic 4 相关输出和由评估确认需要修订的 Epic 4 文档，避免回滚或混入无关改动。
