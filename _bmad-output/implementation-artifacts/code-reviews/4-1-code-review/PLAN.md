# Plan（计划）

## 目标

针对 Story `4-1` 严格串行完成开发、代码审查、评估、修复循环、规则提炼、TODO 跟踪、收尾和本地提交。

## 串行步骤

1. 使用全新的 sub agent 执行 `/bmad-dev-story story 4-1`，模型为 `GPT-5.5`。
2. 使用全新的 sub agent 执行 `/bmenhance-cr-01-reviewer 4-1`，模型为 `GPT-5.5`。
3. 使用全新的 sub agent 执行 `/bmenhance-cr-02-evaluator 4-1`，模型为 `GPT-5.5`。
4. 使用全新的 sub agent 执行 `/bmenhance-cr-03-fixer 4-1`，模型为 `GPT-5.5`。
5. 重复步骤 2-4，直到 reviewer 结论通过且 evaluator 评估通过。
6. 通过后，使用全新的 sub agent 依次执行 `bmenhance-cr-04-rules-extractor`、`bmenhance-cr-05-todo-tracker`、`bmenhance-cr-06-finalizer`，默认采用推荐决策并记录。
7. Epic 4 所有 Story 完成后，使用 `git-commit-convention` 本地提交，默认中文，不推送。

## 约束

- 所有步骤严格串行；前一步完成前不启动下一步。
- 每个步骤都使用全新的 sub agent。
- 不改动与当前 Story 无关的文件；已有脏工作树保持原样。
- 所有决策优先采用推荐方案，并写入 `EXPERIMENTS.md` 或 `EXPERIMENT_NOTES.md`。
