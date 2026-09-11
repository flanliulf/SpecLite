# Changelog（变更记录）

## [Unreleased] - 2026-09-11

- Story 11.9 restart：Step 0 调用一次 `speclite resolve cr-directory`，冻结 `crDir` / `canonicalCrDir` / `compatibilityMode` / `legacyArtifactPaths` 并传给 CR01–06；`continuation=block` 时 HALT。
- restart CR round 1 修复：Step 5/6/9/10 调用串显式传递 `crDir` / `compatibilityMode` / `legacyArtifactPaths` / `orchestrationMode` / `handoffTarget`；Step 0 冻结值写入 goal records；HALTED finalizer 重入使用冻结 `crDir` 不重解析；legacy-resume 原位续写。

## [2.1.0] - 2026-08-25

### Changed（变更）

- 将 CR v2 contract ownership 移交独立 `speclite-code-review-contract` package。
- runner 改为纯 contract consumer，不再作为 CR01–06 的反向依赖。
- runner workflow reference 改为中文叙述优先，保留必要技术 enum 与命令。
- progressive disclosure 改为完整语义下沉：补回 activation boundary、resume matrix、三个 goal records 契约、Common Mistakes 与 Invocation Template。
- 修正执行顺序为 evaluator → convergence → state gate → fixer，禁止命中 stop-loss 后仍进入 fixer。
- 完成门禁重新要求三个 goal records final state，以及除显式 no-commit 外的 `git-commit-convention` 中文本地提交。
- 同步中文 canonical 与英文 mirror 的能力、输入、停止条件、完成标准和引用路径。

## [2.0.0] - 2026-08-25

### Changed（变更）

- 新增唯一共享 `references/cr-contract.md`，统一 identity、scope、schema、round、fingerprint、quorum、freshness 与 TODO/rules governance。
- runner 改为结构化 CR v2 状态机，禁止 prose 关键词判断。
- 拆分 `VERIFY_REQUIRED` 与 `PASS_WITH_DEFERRED_TODOS`；verify-only 完成后必须 fresh reviewer/evaluator。
- finalizer 前要求 current scope hash、fresh completion gate 与 required tracker 一致。

## [1.1.0] - 2026-08-17

### Added（新增）

- 新增 `## Convergence Control（收敛控制）`：把 CR 循环从“repeat until pass”的无界循环改为**有界**循环。每轮 CR Gate 前记录收敛度量（round、P1 趋势、churn/类别复现），并按终止判定集退出：`PASS` / `PASS_WITH_VERIFY_OBLIGATIONS` / `ARCHITECTURE_TRIAGE` / `STOP_LOSS`。
- 阈值默认 `max_rounds=5`、`stop_loss_consecutive_rounds=3`、`churn_watch=on`，可被 `cr-config.md` 的 convergence 段覆盖。

### Changed（变更）

- Step 6 CR Gate 增加收敛前置检查；Decision Policy 增加“命中 STOP_LOSS/ARCHITECTURE_TRIAGE 必须携带收敛度量询问用户”的明确例外；Completion Criteria 承认收敛终判为合法循环出口；Invocation Template 更新为有界循环。

## [1.0.3] - 2026-07-07

### Changed（变更）

- 将逐 Story `story-kickoff` gate 校验升级为要求 `speclite.flow-gate-report.v2` 与 `handoffContractVersion: "speclite.story-kickoff-handoff.v1"`。
- 明确 legacy v1 report、缺失 handoff contract version 或 foundation/closure metadata 不允许进入 `speclite-dev-story`。

## [1.0.2] - 2026-07-06

### Changed（变更）

- 将每个 Story 的 `story-kickoff` Flow Gate 明确纳入 orchestrator 串行步骤，要求在 `speclite-dev-story` 前执行或验证 `speclite-flow-gate mode=story-kickoff`。
- 明确 `flow-gate-enforcement` hook 只是 direct prompt execution 的 deterministic guardrail，不能替代外层 sub-agent 调度中的显式门禁。
- 将完成标准、常见错误和调用模板同步到 `PASS` / `PASS_EQUIVALENT` 后才能进入开发。

## [1.0.1] - 2026-07-06

### Changed（变更）

- 将 `PLAN.md`、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md` 的保存位置统一改为 `code-reviews/{story_id}-code-review/goal-execute-records/`。
- 区分 `cr_dir` 作为 CR 产物目录与 `progress_record_dir` 作为目标执行记录目录，避免进度文件直接散落在 CR 根目录。

## [1.0.0] - 2026-07-06

### Added（新增）

- 新增 SpecLite Epic Story 开发与 CR 编排 Skill，适配 `speclite-dev-story` 与 `speclite-code-review-01-reviewer` 到 `speclite-code-review-06-finalizer`。
- 明确从 `planning_artifacts` 与 `implementation_artifacts` 定位 Epic、Story、CR、CR rules 和进度产物，避免依赖历史输出根。
- 保留 strict serial、fresh sub-agent、逐 Story 循环、三进度文件、CR closeout 和最终本地中文提交的原始编排方向。
