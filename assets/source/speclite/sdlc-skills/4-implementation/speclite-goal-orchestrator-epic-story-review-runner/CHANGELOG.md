# Changelog

## [1.1.0] - 2026-08-17

### Added

- 新增 `## Convergence Control（收敛控制）`：把 SR 循环从“repeat until pass”的无界循环改为**有界**循环。每轮 Gate 前记录收敛度量（round、P1 趋势、doc_delta、类别复现），并按终止判定集退出：`PASS` / `PASS_WITH_VERIFY_OBLIGATIONS` / `ARCHITECTURE_TRIAGE` / `STOP_LOSS`。
- 阈值默认 `max_rounds=5`、`stop_loss_consecutive_rounds=3`、`doc_growth_watch=on`，可被 `sr-config.md` 的 convergence 段覆盖。

### Changed

- Step 4 Gate 增加收敛前置检查；Decision Policy 增加“命中 STOP_LOSS/ARCHITECTURE_TRIAGE 必须携带收敛度量询问用户”的明确例外；Completion Criteria 承认收敛终判为合法循环出口；Invocation Template 更新为有界循环。

## [1.0.1] - 2026-07-06

### Changed

- 将 `PLAN.md`、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md` 的保存位置统一改为 `story-reviews/epic-{epic_id}-story-review/goal-execute-records/`。
- 区分 `sr_dir` 作为 SR 产物目录与 `progress_record_dir` 作为目标执行记录目录，避免进度文件直接散落在 SR 根目录。

## [1.0.0] - 2026-07-06

### Added

- 新增 SpecLite Epic Story Review 编排 Skill，适配 `speclite-story-review-01-reviewer`、`speclite-story-review-02-evaluator`、`speclite-story-review-03-fixer` 和 runtime config 路径。
- 明确从 `planning_artifacts` 与 `implementation_artifacts` 定位 Epic、Story、SR 和进度产物，避免依赖历史输出根。
- 保留 strict serial、fresh sub-agent、三进度文件和最终本地中文提交的原始编排方向。
