# Plan（计划）

## Goal（目标）

对 Epic 8 执行 Epic 粒度 Story Review（SR）闭环，按严格串行顺序运行：

1. `bmenhance-sr-01-reviewer epic 8`
2. `bmenhance-sr-02-evaluator 8`
3. 仅当 evaluation 明确要求修订时运行 `bmenhance-sr-03-fixer 8`
4. reviewer 与 evaluator 均通过后执行本地中文 Conventional Commit，不 push

## Current Epic（当前 Epic）

- Epic: `8`
- Epic artifact: `_bmad-output/planning-artifacts/epics/11-epic-8-cli-outcome-oriented-human-output-systemcli-outcome-导向人类输出体系.md`
- SR directory: `_bmad-output/implementation-artifacts/story-reviews/epic-8-story-review/`
- Date: `2026-06-15`
- Model: `GPT-5.5`

## Current State（当前状态）

- Round: `2`
- Status: `COMPLETED`
- Reviewer: `completed_round_2`
- Evaluator: `completed_round_2`
- Fixer: `completed_round_1`
- Commit: `included_in_final_local_commit`

当前状态：Epic 8 SR 闭环已完成。Reviewer Round 2 结论为通过，Evaluator Round 2 结论为可直接进入开发；需要修订项 0 个，非阻塞项 1 个，误报 0 个，不需要继续 fixer。本次记录随最终本地中文 Conventional Commit 一起提交，不 push。

## Preflight Audit（前置审计）

### 2026-06-15 Audit 1

- 当前仓库路径：`/Users/fancyliu/Repos/SpecLite`
- 用户目标：执行 `goal-orchestrator-epic-story-review-runner`，目标为 `epic8`
- Git 状态：`git status --short` 无输出，当前工作树干净
- SR 目录：本次创建 `_bmad-output/implementation-artifacts/story-reviews/epic-8-story-review/`
- 既有 SR 产物：无 `review summary`、无 `evaluation`、无 fixer 修订记录
- Epic 8 artifact：实际文件为 `_bmad-output/planning-artifacts/epics/11-epic-8-cli-outcome-oriented-human-output-systemcli-outcome-导向人类输出体系.md`
- Story 文件：
  - `_bmad-output/implementation-artifacts/stories/8-1-shared-cli-outcome-and-presentation-contract.md`
  - `_bmad-output/implementation-artifacts/stories/8-2-install-outcome-oriented-output.md`
  - `_bmad-output/implementation-artifacts/stories/8-3-update-and-repair-outcome-oriented-output.md`
  - `_bmad-output/implementation-artifacts/stories/8-4-status-and-validate-human-output-separation.md`
  - `_bmad-output/implementation-artifacts/stories/8-5-resolve-command-support-output.md`
  - `_bmad-output/implementation-artifacts/stories/8-6-localized-next-actions-and-message-catalog.md`
  - `_bmad-output/implementation-artifacts/stories/8-7-human-output-fixture-and-documentation-matrix.md`
- Sprint status：`epic-8: in-progress`，`8-1` 到 `8-7` 均为 `ready-for-dev`
- 任务类型判断：新任务，不是续跑

## Execution Checklist（执行清单）

- [x] 确认仓库路径：`/Users/fancyliu/Repos/SpecLite`
- [x] 确认目标：Epic 8 SR goal
- [x] 定位 Epic 8 planning artifact
- [x] 检查 Story 文件：已发现 `8-1` 到 `8-7`
- [x] 检查既有 SR 目录：本次初始化
- [x] 检查 git 状态：当前工作树干净
- [x] 启动 reviewer（Round 1）
- [x] 启动 evaluator（Round 1）
- [x] 按需启动 fixer（Round 1）
- [x] 如执行 fixer，重新 reviewer
- [x] 如执行 fixer，重新 evaluator
- [x] 最终本地提交

## Final Commit Scope（最终提交范围）

最终本地提交范围限定为 Epic 8 SR 闭环相关文件：

- Story 修订：
  - `_bmad-output/implementation-artifacts/stories/8-3-update-and-repair-outcome-oriented-output.md`
  - `_bmad-output/implementation-artifacts/stories/8-4-status-and-validate-human-output-separation.md`
  - `_bmad-output/implementation-artifacts/stories/8-5-resolve-command-support-output.md`
- SR 记录与产物：
  - `_bmad-output/implementation-artifacts/story-reviews/epic-8-story-review/PLAN.md`
  - `_bmad-output/implementation-artifacts/story-reviews/epic-8-story-review/EXPERIMENTS.md`
  - `_bmad-output/implementation-artifacts/story-reviews/epic-8-story-review/EXPERIMENT_NOTES.md`
  - `_bmad-output/implementation-artifacts/story-reviews/epic-8-story-review/epic-8-story-review-summary-20260615-round-1.md`
  - `_bmad-output/implementation-artifacts/story-reviews/epic-8-story-review/epic-8-story-review-evaluation-20260615-round-1.md`
  - `_bmad-output/implementation-artifacts/story-reviews/epic-8-story-review/epic-8-story-review-summary-20260615-round-2.md`
  - `_bmad-output/implementation-artifacts/story-reviews/epic-8-story-review/epic-8-story-review-evaluation-20260615-round-2.md`

未执行 push。

## Termination Criteria（终止条件）

只有同时满足以下条件，才视为 Epic 8 SR goal 完成：

- 最新 reviewer 结论通过。
- 最新 evaluator 评估通过。
- 如果曾执行 fixer，修订后已重新 review/evaluate。
- `PLAN.md`、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md` 已更新。
- git 状态已审计。
- 已完成本地中文 Conventional Commit。
- 未执行 push。

## Resume Criteria（续跑条件）

如果执行中断，按以下规则恢复：

- 若只有三份进度文件，无 review summary：从 Round 1 reviewer 恢复。
- 若存在最新 review summary，但无对应 evaluation：从 evaluator 恢复。
- 若最新 evaluation 结论为 `需修订后再审`：从 fixer 恢复。
- 若 fixer 已完成：从下一轮 reviewer 恢复。
- 若 reviewer 和 evaluator 最新结论均通过：从 final commit 恢复。
