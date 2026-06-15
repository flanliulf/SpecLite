# PLAN

## Goal（目标）

针对 Story `8-3-update-and-repair-outcome-oriented-output` 执行严格串行的开发与 CR 闭环：

1. fresh sub-agent 执行 `/bmad-dev-story story 8-3`，模型 `gpt-5.5`。
2. fresh sub-agent 执行 `/bmenhance-cr-01-reviewer 8-3`，模型 `gpt-5.5`。
3. fresh sub-agent 执行 `/bmenhance-cr-02-evaluator 8-3`，模型 `gpt-5.5`。
4. 如 reviewer 或 evaluator 未通过，fresh sub-agent 执行 `/bmenhance-cr-03-fixer 8-3`，模型 `gpt-5.5`，然后回到 reviewer/evaluator。
5. reviewer 与 evaluator 都通过后，fresh sub-agent 依次执行 `bmenhance-cr-04-rules-extractor`、`bmenhance-cr-05-todo-tracker`、`bmenhance-cr-06-finalizer`。
6. 当前 Story 完成后才进入 Story `8-4`。
7. 所有 Epic 8 Story 完成后，使用 `git-commit-convention` 做中文 Conventional Commit，本地提交，不 push。

## Context（上下文）

- Repository: `/Users/fancyliu/Repos/SpecLite`
- Epic: `8`
- Story file: `_bmad-output/implementation-artifacts/stories/8-3-update-and-repair-outcome-oriented-output.md`
- Code review directory: `_bmad-output/implementation-artifacts/code-reviews/8-3-code-review/`
- Epic source: `_bmad-output/planning-artifacts/epics/11-epic-8-cli-outcome-oriented-human-output-systemcli-outcome-导向人类输出体系.md`
- 当前时间：`2026-06-16 03:07 CST`

## Epic Story Order（Epic Story 顺序）

1. `8-1-shared-cli-outcome-and-presentation-contract`：done
2. `8-2-install-outcome-oriented-output`：done
3. `8-3-update-and-repair-outcome-oriented-output`：当前 Story
4. `8-4-status-and-validate-human-output-separation`
5. `8-5-resolve-command-support-output`
6. `8-6-localized-next-actions-and-message-catalog`
7. `8-7-human-output-fixture-and-documentation-matrix`

## Preflight（前置审计）

- Story `8-3` 存在，状态为 `ready-for-dev`。
- `sprint-status.yaml` 当前记录 `epic-8: in-progress`。
- `8-1` 与 `8-2` 已为 `done`；`8-3` 为下一个 `ready-for-dev` Story。
- 当前分支为 `main...origin/main [ahead 1]`；ahead 1 是上一轮 Epic 8 SR 本地提交。
- 当前工作树已有 Story 8.1 / 8.2 开发与 CR closeout 相关改动；这些是本 Epic 8 目标的一部分，不得回滚。
- 当前未发现 Story 8.3 既有 code-review 产物。
- `_bmad-output/planning-artifacts/bmm-workflow-status.yaml` 不存在，finalizer 阶段应跳过该同步文件并记录。
- 决策：后续提交只暂存本次 Epic 8 Story 开发与 CR 闭环相关文件；不得使用 `git add -A` 或把无关文件带入提交。

## Execution Order（执行顺序）

- [x] 初始化 Story 8-3 code review 目录。
- [x] 创建中文 `PLAN.md`、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md`。
- [x] Step 1: `/bmad-dev-story story 8-3`
- [x] Step 2: `/bmenhance-cr-01-reviewer 8-3`
- [x] Step 3: `/bmenhance-cr-02-evaluator 8-3`
- [ ] Step 4: 如需修复，执行 `/bmenhance-cr-03-fixer 8-3`
- [ ] Step 5: 修复后重新 reviewer/evaluator，直到两者均通过
- [x] Step 6: 通过后执行 04 rules extractor
- [x] Step 7: 执行 05 todo tracker
- [x] Step 8: 执行 06 finalizer
- [x] Step 9: 更新本文件、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md` 为 Story 终态

## Current State（当前状态）

当前 Story `8-3` 已完成开发、reviewer Round 1、evaluator Round 1、04 rules extractor、05 todo tracker 与 06 finalizer。Story 与 sprint status 均已更新为 `done`。下一步可以进入 Story `8-4`。

## Development Result（开发结果）

`2026-06-16` fresh dev sub-agent 执行 `/bmad-dev-story story 8-3` 已完成：

- Story 文件状态：`Status: review`
- Sprint status：`8-3-update-and-repair-outcome-oriented-output: review`
- 修改文件：
  - `src/diagnostics/output.ts`
  - `test/update-command.test.ts`
  - `_bmad-output/implementation-artifacts/stories/8-3-update-and-repair-outcome-oriented-output.md`
  - `_bmad-output/implementation-artifacts/sprint-status.yaml`
- 实现摘要：
  - 为 update / repair human output 增加 outcome-oriented 分支：`plan-ready`、`repair-plan-ready`、`no-op`、`blocked-by-conflict`、`applied`、`partial-or-failed`。
  - 保持 update/repair planning semantics 与 JSON shape 不变。
  - 保持普通 `--yes` 不能绕过 conflict，`update --repair` 仍为 explicit repair。
- 验证：
  - `npm test -- test/update-command.test.ts`：通过，12 tests。
  - `npm test -- test/update-command.test.ts test/update-planning.test.ts test/ownership-model.test.ts test/operation-lock-safe-write.test.ts`：通过，44 tests。
  - `npm run build`：通过。
  - `npm test`：通过，49 files / 346 tests。
  - `git diff --check`：通过。
- Build side effect：`npm run build` 曾造成 `release/packaging-manifest.json` `packageHash` drift，dev sub-agent 已恢复该文件，最终无 diff。
- HALT / 遗留风险：无。

下一步：启动 fresh sub-agent 执行 `/bmenhance-cr-01-reviewer 8-3`。

## Review Round 1（审查第 1 轮）

Reviewer 已生成：

- File: `_bmad-output/implementation-artifacts/code-reviews/8-3-code-review/8-3-code-review-summary-20260616-round-1.md`
- Round: `1`
- Conclusion: 通过
- Findings: `0`
- 分类统计：`decision_needed=0`，`patch=0`，`defer=0`，`dismiss=0`
- Internal fallback: 当前 reviewer agent 无可用 Agent 子代理工具，已按 CR-01 降级为当前模型串行三层视角审查。

通过项摘要：

- update / repair outcome 仅用于 human-readable output，未新增 public JSON field。
- ordinary `--yes` 仍不能绕过 conflict。
- `update --repair` 仍为 explicit repair。
- `blocked-by-conflict` 和 `partial-or-failed` 输出覆盖 Story 8.3 要求的 evidence / boundaries。

下一步：启动 fresh evaluator sub-agent 执行 `/bmenhance-cr-02-evaluator 8-3`。

## Evaluation Round 1（评估第 1 轮）

Evaluator 已生成：

- File: `_bmad-output/implementation-artifacts/code-reviews/8-3-code-review/8-3-code-review-evaluation-20260616-round-1.md`
- Round: `1`
- Conclusion: 通过 / Approved
- Need fix: `0`
- Suggested TODO: `0`
- False positives: `0`
- Next fixer: 不需要
- Residual risk: 当前 reviewer 三层审查降级为同一上下文串行审查，交叉独立性弱于原始设计；不影响本轮基于代码核验和 focused tests 的 Approved 结论。

Gate 决策：reviewer Round 1 与 evaluator Round 1 均通过，可以进入 04/05/06 收尾链。

## Closeout Step 04（收尾步骤 04）

Rules extractor 已完成：

- Mode: `analysis-only`
- Skill: `/bmenhance-cr-04-rules-extractor 8-3`
- Result: 完成只读 CR 历史分析和规则提炼。
- Actual writes: 无。
- 读取的 CR records:
  - `8-3-code-review-summary-20260616-round-1.md`
  - `8-3-code-review-evaluation-20260616-round-1.md`
- Fix record: 无；evaluation 中没有 `## 修复执行记录`。
- 全局文档候选：无。
- `cr-rules-summary.md` 候选：无。
- 05 TODO 候选：无。
- 不沉淀项：
  - 三层审查因缺少独立 Agent 工具降级为串行审查：这是执行环境残余风险，不是 Story 代码规则。
  - human output 展示 outcome、JSON 不新增 outcome 等通过项：属于 Story 8.3 已验收实现事实，不是 CR 发现或修复经验。
- 决策：按 orchestrator 继续执行 05 todo tracker，并记录本轮无 TODO 候选。

## Closeout Step 05（收尾步骤 05）

TODO tracker 已完成：

- Skill: `/bmenhance-cr-05-todo-tracker 8-3`
- Mode: `check/extract` 等价验证。
- Result: 无相关待办事项，无需写入 backlog。
- Actual writes: 无。
- 检查的记录:
  - `8-3-code-review-summary-20260616-round-1.md`
  - `8-3-code-review-evaluation-20260616-round-1.md`
  - `_bmad-output/implementation-artifacts/stories/8-3-update-and-repair-outcome-oriented-output.md`
  - `_bmad-output/implementation-artifacts/cr-rules/cr-rules-summary.md`
  - `_bmad-output/implementation-artifacts/cr-rules/cr-todo-backlog.md`
- 发现：backlog 当前有 3 条 open、0 条 in-progress；既有 `TODO-011` 涉及 `src/diagnostics/output.ts`，但建议时机限定为 `sync` / `uninstall` failure renderer，不构成 Story 8.3 的处理项。
- 新增非阻塞 TODO 候选：无。
- 决策：继续执行 06 finalizer。

## Closeout Step 06（收尾步骤 06）

Finalizer 已完成：

- Skill: `/bmenhance-cr-06-finalizer 8-3`
- Latest evaluation: `8-3-code-review-evaluation-20260616-round-1.md`
- CR conclusion: `Approved / 通过`
- Status changes:
  - Story file: `Status: review` -> `Status: done`
  - `sprint-status.yaml`: `8-3-update-and-repair-outcome-oriented-output: review` -> `done`
  - `sprint-status.yaml`: `last_updated` -> `2026-06-16 03:29 CST`
- `bmm-workflow-status.yaml`: 文件不存在，已按 skill 容错跳过，未创建。
- Epic 8 状态：仍为 `in-progress`；`8-4` 到 `8-7` 仍为 `ready-for-dev`，未自动更新 Epic 状态。
- Blocking items: 无。

## Final State（终态）

Story `8-3` 满足本轮完成标准：

- 开发完成。
- reviewer Round 1 通过。
- evaluator Round 1 Approved。
- 未执行 fixer，因为无 need fix。
- 04/05/06 已按顺序完成。
- 三份进度文件已更新。

下一步：初始化 Story `8-4` 的 code review 目录与进度文件，然后启动 `/bmad-dev-story story 8-4`。

## Gate（终止条件）

Story `8-3` 只有在以下条件同时满足后才视为本 Story 闭环完成：

- 开发完成，Story 状态进入 `review`。
- 最新 `bmenhance-cr-01-reviewer` 结论为通过。
- 最新 `bmenhance-cr-02-evaluator` 评估结论为通过 / Approved。
- 如果执行过 fixer，则 fixer 后已重新执行 reviewer 与 evaluator。
- `bmenhance-cr-04-rules-extractor`、`bmenhance-cr-05-todo-tracker`、`bmenhance-cr-06-finalizer` 已按顺序完成。
- 本目录三份进度文件记录终态。

## Resume Criteria（续跑条件）

- 若只有三份进度文件，无开发结果：从 `/bmad-dev-story story 8-3` 恢复。
- 若 Story 状态为 `review` 且无 CR summary：从 `/bmenhance-cr-01-reviewer 8-3` 恢复。
- 若存在最新 CR summary 但无对应 evaluation：从 `/bmenhance-cr-02-evaluator 8-3` 恢复。
- 若最新 evaluation 要求修复：从 `/bmenhance-cr-03-fixer 8-3` 恢复。
- 若 reviewer/evaluator 均通过但未 closeout：从 04/05/06 顺序恢复。
