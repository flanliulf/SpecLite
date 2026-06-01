# PLAN（计划）

## Context（上下文）

- Story: `_bmad-output/implementation-artifacts/stories/4-4-project-operation-lock-and-safe-write.md`
- Workflow: `/bmad-dev-story story 4-4`
- Agent Model: `GPT-5.5 (gpt-5.5)`
- 当前步骤只执行开发，不启动 reviewer/evaluator/fixer，不提交 git。

## Scope（范围）

- 允许修改 Story 4.4 必需实现文件、Story 4.4 文件允许区域、`sprint-status.yaml`、本目录进度文件。
- 不修改 `_bmad-output/planning-artifacts/`、旧 Story 1-3、Story 4.1/4.2/4.3 文件或无关脏工作树。

## Plan（执行计划）

- [x] 读取 `AGENTS.md`、skill workflow、project context、完整 Story 4.4、完整 `sprint-status.yaml`。
- [x] 记录 `git status --short` 既有脏工作树事实。
- [x] 重新检查当前源码、测试、fixtures 与 Story 4.1/4.2/4.3 锚点。
- [x] 将 Story 4.4 标记为 `in-progress`。
- [x] 按 Story 任务顺序实现 operation lock、safe write、path blocker、validate stale warning、public output 稳定性与 tests。
- [x] 运行 focused tests、`npm run build`、可行时运行更广测试。
- [x] 更新 Story 4.4 允许区域、`sprint-status.yaml` 至 `review`，记录文件清单和验证结果。
