# Changelog

## [1.0.2] - 2026-07-06

### Changed

- 将每个 Story 的 `story-kickoff` Flow Gate 明确纳入 orchestrator 串行步骤，要求在 `speclite-dev-story` 前执行或验证 `speclite-flow-gate mode=story-kickoff`。
- 明确 `flow-gate-enforcement` hook 只是 direct prompt execution 的 deterministic guardrail，不能替代外层 sub-agent 调度中的显式门禁。
- 将完成标准、常见错误和调用模板同步到 `PASS` / `PASS_EQUIVALENT` 后才能进入开发。

## [1.0.1] - 2026-07-06

### Changed

- 将 `PLAN.md`、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md` 的保存位置统一改为 `code-reviews/{story_id}-code-review/goal-execute-records/`。
- 区分 `cr_dir` 作为 CR 产物目录与 `progress_record_dir` 作为目标执行记录目录，避免进度文件直接散落在 CR 根目录。

## [1.0.0] - 2026-07-06

### Added

- 新增 SpecLite Epic Story 开发与 CR 编排 Skill，适配 `speclite-dev-story` 与 `speclite-code-review-01-reviewer` 到 `speclite-code-review-06-finalizer`。
- 明确从 `planning_artifacts` 与 `implementation_artifacts` 定位 Epic、Story、CR、CR rules 和进度产物，避免依赖历史输出根。
- 保留 strict serial、fresh sub-agent、逐 Story 循环、三进度文件、CR closeout 和最终本地中文提交的原始编排方向。
