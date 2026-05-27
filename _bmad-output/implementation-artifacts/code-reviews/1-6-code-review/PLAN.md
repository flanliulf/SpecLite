# PLAN（计划）

## Story（故事）

- Story ID：`1-6`
- Story 文件：`_bmad-output/implementation-artifacts/stories/1-6-install-progress-and-ready-summary.md`
- Code Review 目录：`_bmad-output/implementation-artifacts/code-reviews/1-6-code-review/`
- 当前目标：按用户要求串行完成开发、CR、评估、修复循环、CR 收尾，并在 Epic 1 全部 Story 完成后统一本地提交。

## Execution Plan（执行计划）

1. 使用全新的 sub-agent（`gpt-5.5`）执行 `/bmad-dev-story story 1-6`，限定其开发 install progress lifecycle、`ReadyCheck`、ready summary、failure no-ready-summary gate 与对应测试。
2. 使用全新的 sub-agent（`gpt-5.5`）执行 `/bmenhance-cr-01-reviewer 1-6`，生成代码审查结果。
3. 使用全新的 sub-agent（`gpt-5.5`）执行 `/bmenhance-cr-02-evaluator 1-6`，评估最新审查结果。
4. 使用全新的 sub-agent（`gpt-5.5`）执行 `/bmenhance-cr-03-fixer 1-6`；如评估无修复项，则执行 0 修复项收口并不得修改源码。
5. 若 reviewer 或 evaluator 未通过，则重复 reviewer -> evaluator -> fixer，直到两者均通过。
6. 通过后，使用第五个全新的 sub-agent（`gpt-5.5`）依次执行 `bmenhance-cr-04-rules-extractor`、`bmenhance-cr-05-todo-tracker`、`bmenhance-cr-06-finalizer`，采用默认推荐决策并记录。
7. Story 1-6 完成后进行全局验证，并使用 `git-commit-convention` 以 `gpt-5.4` 本地提交，不推送。

## Constraints（约束）

- 所有 skill 步骤必须严格串行，任何 sub-agent 完成前不得启动下一步。
- 每个用户要求的 skill 调用必须使用新的 sub-agent。
- 只允许开发 Story 1-6 明确要求的范围，不实现 Epic 2、Post-MVP commands、remote source refresh、full validate/hash scan 或 branded Copilot/Cursor readiness。
- Story 1.1 至 1.5 是前置实现；不得在 Story 1.6 中重建前序流程、绕过 confirmation gates、重新写 runtime structure、复制 IDE mirrors 或重新生成 manifest/index。
- 修复只允许根据评估文件中的明确结论执行，不主动扩大范围。
- 不回滚或清理用户已有未提交变更，除非后续得到明确授权。
