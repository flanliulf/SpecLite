# Changelog

## [1.0.1] - 2026-07-06

### Changed

- 将 `PLAN.md`、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md` 的保存位置统一改为 `story-reviews/epic-{epic_id}-story-review/goal-execute-records/`。
- 区分 `sr_dir` 作为 SR 产物目录与 `progress_record_dir` 作为目标执行记录目录，避免进度文件直接散落在 SR 根目录。

## [1.0.0] - 2026-07-06

### Added

- 新增 SpecLite Epic Story Review 编排 Skill，适配 `speclite-story-review-01-reviewer`、`speclite-story-review-02-evaluator`、`speclite-story-review-03-fixer` 和 runtime config 路径。
- 明确从 `planning_artifacts` 与 `implementation_artifacts` 定位 Epic、Story、SR 和进度产物，避免依赖历史输出根。
- 保留 strict serial、fresh sub-agent、三进度文件和最终本地中文提交的原始编排方向。
