# PLAN（计划）

## 2026-06-12 Story 1-7 Strict Serial Plan（Story 1-7 严格串行计划）

- 本轮目标：完成 Story `1-7-install-cli-interaction-and-localized-human-output` 的开发、代码审查、审查评估、修复闭环、CR 收尾和本地 git commit。
- Story 文件：`_bmad-output/implementation-artifacts/stories/1-7-install-cli-interaction-and-localized-human-output.md`。
- Code Review 目录：`_bmad-output/implementation-artifacts/code-reviews/1-7-code-review/`。
- 当前初始状态：Story 文件为 `ready-for-dev`；`sprint-status.yaml` 中 `1-7-install-cli-interaction-and-localized-human-output` 为 `ready-for-dev`；工作区初始 `git status --short` 为空。
- 执行模型：每个 sub agent 均使用 `gpt-5.5`。
- 执行方式：每一步使用全新的 sub agent；严格等待前一步完成后再启动下一步；不并行。

## Execution Plan（执行计划）

1. 使用第一个全新 sub agent 执行 `/bmad-dev-story story 1-7`，完成 Story 1-7 开发和开发阶段验证。
2. 使用第二个全新 sub agent 执行 `/bmenhance-cr-01-reviewer 1-7`，生成第 1 轮代码审查结果。
3. 使用第三个全新 sub agent 执行 `/bmenhance-cr-02-evaluator 1-7`，评估最新审查结果。
4. 使用第四个全新 sub agent 执行 `/bmenhance-cr-03-fixer 1-7`，只按评估结论执行修复；如评估无修复项，则执行 0 修复项收口。
5. 若 reviewer 或 evaluator 任一未通过，则继续严格重复 reviewer -> evaluator -> fixer，每轮均使用新的 sub agent，直到 reviewer 结论通过且 evaluator 结论 Approved / 通过。
6. 通过后，使用第五个全新 sub agent 依次执行 `bmenhance-cr-04-rules-extractor 1-7`、`bmenhance-cr-05-todo-tracker 1-7`、`bmenhance-cr-06-finalizer 1-7`，步骤内部也必须串行。
7. 收尾完成后，使用全新 sub agent 执行 `git-commit-convention`，默认中文 commit message，本地提交，不推送。

## Default Decisions（默认决策）

- 遇到 skill 要求确认但用户已授权“采用推荐决策”时，按最保守可落地默认路径执行，并在 `EXPERIMENTS.md` 和 `EXPERIMENT_NOTES.md` 中记录。
- `bmenhance-cr-04-rules-extractor` 如仅产生 analysis-only 建议，默认不修改全局文档；只有明确适合记录且不需要额外人工确认的 no-risk 结果才记录到本流程文档。
- `bmenhance-cr-05-todo-tracker` 只追踪非阻塞项；若无候选项，默认不创建空 TODO。
- `bmenhance-cr-06-finalizer` 可同步 Story、`sprint-status.yaml` 和存在的 workflow status；若 Story 1-7 完成后 Epic 1 下全部 Story 均为 `done`，则按本轮用户预授权的推荐决策同步 `epic-1` 为 `done` 并记录。
- `git-commit-convention` 默认只提交本 Story 相关文件；不 push；不使用 `git add -A`。

## Scope Constraints（范围约束）

- 只处理 Story 1-7 明确范围：install human-readable output、prompt adapter、locale/message catalog、`--yes` interaction semantics 和对应 tests。
- 不改 canonical source package discovery、IDE mirror writes、ReadyCheck semantic scope、manifest/index schema、source descriptor trust model、file ownership model、update/repair behavior 或 public JSON data shape。
- 不引入 GUI、spinner-only progress、interactive TUI framework、database、daemon、network service 或 new automation API。
- 不回滚或清理用户已有改动；如执行过程中发现无关脏改动，先记录并隔离处理。
