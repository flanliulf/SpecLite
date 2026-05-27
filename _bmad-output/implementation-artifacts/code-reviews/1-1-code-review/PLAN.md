# PLAN（计划）

## Story（故事）

- Story ID：`1-1`
- Story 文件：`_bmad-output/implementation-artifacts/stories/1-1-cli-install-entry-and-runtime-guard.md`
- Code Review 目录：`_bmad-output/implementation-artifacts/code-reviews/1-1-code-review/`
- 当前目标：按用户要求串行完成开发、CR、评估、修复循环、CR 收尾和最终本地提交。

## Epic 1 Story 顺序（执行范围）

1. `1-1-cli-install-entry-and-runtime-guard`
2. `1-2-project-target-directory-resolution-and-existing-install-detection`
3. `1-3-official-module-selection-and-install-summary`
4. `1-4-project-config-initialization`
5. `1-5-runtime-structure-artifact-directory-and-ide-mirror-creation`
6. `1-6-install-progress-and-ready-summary`

## Execution Plan（执行计划）

1. 使用全新的 sub-agent（`gpt-5.5`）执行 `/bmad-dev-story story 1-1`，限定其开发当前 Story，不扩展到后续 Story。
2. 使用全新的 sub-agent（`gpt-5.5`）执行 `/bmenhance-cr-01-reviewer 1-1`，生成第 1 轮代码审查结果。
3. 使用全新的 sub-agent（`gpt-5.5`）执行 `/bmenhance-cr-02-evaluator 1-1`，评估最新审查结果。
4. 如果评估结论需要修复，使用全新的 sub-agent（`gpt-5.5`）执行 `/bmenhance-cr-03-fixer 1-1`。
5. 重复 CR reviewer -> evaluator -> fixer，直到 reviewer 结论通过且 evaluator 结论通过。
6. 通过后，使用全新的 sub-agent（`gpt-5.5`）依次执行 `bmenhance-cr-04-rules-extractor`、`bmenhance-cr-05-todo-tracker`、`bmenhance-cr-06-finalizer`，采用默认推荐决策并记录。
7. Story 1-1 完成后进入 Story 1-2，并为对应 code review 目录创建独立进度文件。
8. Epic 1 全部 Story 完成后，使用全新的 sub-agent（`gpt-5.4`）执行 `git-commit-convention`，默认中文 commit message，仅本地提交，不推送。

## Constraints（约束）

- 所有步骤必须严格串行，任何 sub-agent 完成前不得启动下一步。
- 每个用户要求的 skill 调用必须使用新的 sub-agent。
- 修复只允许根据评估文件中的明确结论执行，不主动扩大范围。
- 若遇到需要决策的事项，默认采用推荐决策，并在 `EXPERIMENTS.md` 或 `EXPERIMENT_NOTES.md` 记录理由。
- 本流程不回滚或清理用户已有未提交变更，除非后续得到明确授权。
