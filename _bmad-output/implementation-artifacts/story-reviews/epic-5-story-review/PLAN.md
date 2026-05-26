# Epic 5 Story Review 执行计划

## 目标

对 Epic 5 执行串行 SR 工作流：先审查，再评估，再按评估结果修订；如果 reviewer 或 evaluator 未通过，则开启下一轮，直到两者均通过。通过后使用 `git-commit-convention` 本地提交，不推送。

## 串行约束

- 每一步只启动一个全新的 sub agent。
- 必须等待当前 sub agent 完成后，才启动下一步。
- `bmenhance-sr-01-reviewer` 内部允许其 skill 自己按设计启动三层子审查。
- 不并行执行 SR skill，不并行执行 commit skill。

## 执行步骤

1. Preflight（预检）：确认 Epic 5 定义文件、Epic 5 Story 文件和 SR 输出目录。
2. Round 1 Reviewer（第 1 轮审查）：使用 `bmenhance-sr-01-reviewer`，触发形式 `/bmenhance-sr-01-reviewer epic 5`，模型 `GPT-5.5`。
3. Round 1 Evaluator（第 1 轮评估）：使用 `/bmenhance-sr-02-evaluator 5`，模型 `GPT-5.5`。
4. Round 1 Fixer（第 1 轮修订）：使用 `/bmenhance-sr-03-fixer 5`，模型 `GPT-5.5`。
5. Gate（通过门禁）：读取最新审查总结和评估文件，判断 reviewer 结论与 evaluator 评估决定是否均通过。
6. 若未通过，重复 Reviewer -> Evaluator -> Fixer。
7. 通过后执行 `git-commit-convention`，模型 `GPT-5.4`，默认中文 commit message，本地提交，不推送。

## 当前已知仓库事实

- Epic 5 定义文件位于 `_bmad-output/planning-artifacts/epics/08-epic-5-source-integrity-and-distribution-channels来源完整性与分发渠道.md`。
- Epic 5 Story 文件实际位于 `_bmad-output/implementation-artifacts/` 根目录，文件名以 `5-` 开头。
- SR 输出目录为 `_bmad-output/implementation-artifacts/story-reviews/epic-5-story-review/`。

## 决策记录

- `sr-config.md` 中写到 Story 文件目录为 `_bmad-output/implementation-artifacts/stories/`，但当前仓库没有该目录；本次执行以真实存在的 `_bmad-output/implementation-artifacts/5-*.md` 为 Epic 5 Story 来源，并要求各 sub agent 在结果中记录该路径偏差。
- 用户要求遇到决策事项优先使用推荐决策执行，因此上述路径偏差不暂停等待人工确认。
- 当前工作树已有大量未提交改动；本次只处理 Epic 5 SR 相关产物、被 evaluator 确认为需要修订的 Epic 5 Story 文档，以及最终提交所需的明确相关文件，不回滚任何既有改动。
