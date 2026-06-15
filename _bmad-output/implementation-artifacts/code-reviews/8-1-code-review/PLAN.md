# PLAN

## Goal（目标）

针对 Story `8-1-shared-cli-outcome-and-presentation-contract` 执行严格串行的开发与 CR 闭环：

1. fresh sub-agent 执行 `/bmad-dev-story story 8-1`，模型 `gpt-5.5`。
2. fresh sub-agent 执行 `/bmenhance-cr-01-reviewer 8-1`，模型 `gpt-5.5`。
3. fresh sub-agent 执行 `/bmenhance-cr-02-evaluator 8-1`，模型 `gpt-5.5`。
4. 如 reviewer 或 evaluator 未通过，fresh sub-agent 执行 `/bmenhance-cr-03-fixer 8-1`，模型 `gpt-5.5`，然后回到第 2 步。
5. reviewer 与 evaluator 都通过后，fresh sub-agent 依次执行 `bmenhance-cr-04-rules-extractor`、`bmenhance-cr-05-todo-tracker`、`bmenhance-cr-06-finalizer`。
6. 当前 Story 完成后才进入 Story `8-2`。
7. 所有 Epic 8 Story 完成后，使用 `git-commit-convention` 做中文 Conventional Commit，本地提交，不 push。

## Context（上下文）

- Repository: `/Users/fancyliu/Repos/SpecLite`
- Epic: `8`
- Story file: `_bmad-output/implementation-artifacts/stories/8-1-shared-cli-outcome-and-presentation-contract.md`
- Code review directory: `_bmad-output/implementation-artifacts/code-reviews/8-1-code-review/`
- Epic source: `_bmad-output/planning-artifacts/epics/11-epic-8-cli-outcome-oriented-human-output-systemcli-outcome-导向人类输出体系.md`
- 当前时间：`2026-06-16 01:46 CST`

## Epic Story Order（Epic Story 顺序）

1. `8-1-shared-cli-outcome-and-presentation-contract`
2. `8-2-install-outcome-oriented-output`
3. `8-3-update-and-repair-outcome-oriented-output`
4. `8-4-status-and-validate-human-output-separation`
5. `8-5-resolve-command-support-output`
6. `8-6-localized-next-actions-and-message-catalog`
7. `8-7-human-output-fixture-and-documentation-matrix`

## Preflight（前置审计）

- Story `8-1` 存在，状态为 `ready-for-dev`。
- Epic 8 共 7 个 Story，当前全部为 `ready-for-dev`。
- `sprint-status.yaml` 当前记录 `epic-8: in-progress`，`8-1` 到 `8-7` 均为 `ready-for-dev`。
- 当前分支为 `main...origin/main [ahead 1]`；ahead 1 是上一轮 Epic 8 SR 本地提交。
- 当前工作树无未提交变更。
- 当前未发现任何 Epic 8 code-review 产物。
- `_bmad-output/planning-artifacts/bmm-workflow-status.yaml` 不存在，finalizer 阶段应跳过该同步文件并记录。
- 决策：后续提交只暂存本次 Epic 8 Story 开发与 CR 闭环相关文件；不得使用 `git add -A` 或把无关文件带入提交。

## Execution Order（执行顺序）

- [x] 初始化 Story 8-1 code review 目录。
- [x] 创建中文 `PLAN.md`、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md`。
- [x] Step 1: `/bmad-dev-story story 8-1`
- [x] Step 2: `/bmenhance-cr-01-reviewer 8-1`
- [x] Step 3: `/bmenhance-cr-02-evaluator 8-1`
- [x] Step 4: 如需修复，执行 `/bmenhance-cr-03-fixer 8-1`
- [x] Step 5: 修复后重新 reviewer/evaluator，直到两者均通过
- [x] Step 6: 通过后执行 04 rules extractor
- [x] Step 7: 执行 05 todo tracker
- [x] Step 8: 执行 06 finalizer
- [x] Step 9: 更新本文件、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md` 为 Story 终态

## Current State（当前状态）

当前 Story `8-1` 已完成开发、fixer、reviewer Round 2、evaluator Round 2、04 rules extractor、05 todo tracker 与 06 finalizer。Story 与 sprint status 均已更新为 `done`。下一步可以进入 Story `8-2`。

## Development Result（开发结果）

`2026-06-16` fresh dev sub-agent 执行 `/bmad-dev-story story 8-1` 已完成：

- Story 文件状态：`Status: review`
- Sprint status：`8-1-shared-cli-outcome-and-presentation-contract: review`
- 修改文件：
  - `src/cli/messages.ts`
  - `src/diagnostics/output.ts`
  - `test/cli-output-presentation.test.ts`
  - `_bmad-output/implementation-artifacts/stories/8-1-shared-cli-outcome-and-presentation-contract.md`
  - `_bmad-output/implementation-artifacts/sprint-status.yaml`
- 验证：
  - `npm test -- test/cli-output-presentation.test.ts`：通过，4 tests passed。
  - `npm test -- test/cli-smoke.test.ts test/status-command.test.ts test/validate-command.test.ts test/update-command.test.ts`：通过，49 tests passed。
  - `npm run build`：通过。
  - `npm test`：通过，48 files / 335 tests passed。
  - `git diff --check`：通过。
  - `lint`：`package.json` 无 `lint` script，不适用。
- HALT：无。
- 遗留风险：无。

下一步：启动 fresh sub-agent 执行 `/bmenhance-cr-01-reviewer 8-1`。

## Review Round 1（审查第 1 轮）

Reviewer 已生成：

- File: `_bmad-output/implementation-artifacts/code-reviews/8-1-code-review/8-1-code-review-summary-20260616-round-1.md`
- Round: `1`
- Conclusion: 不通过
- Findings: `2`
- 分类：`patch` 2 个
- 严重性：`[中]` 2 个
- Internal fallback: 当前 reviewer agent 无可用 Agent 子代理工具，已按 CR-01 降级为当前模型串行三层视角审查。

主要发现：

1. Install ready summary 在已授权并完成写入后仍显示 `写入状态：未写入项目文件`。
2. `validate` 的 `zh-CN` empty state 仍硬编码英文文案。

下一步：启动 fresh evaluator sub-agent 执行 `/bmenhance-cr-02-evaluator 8-1`。

## Evaluation Round 1（评估第 1 轮）

Evaluator 已生成：

- File: `_bmad-output/implementation-artifacts/code-reviews/8-1-code-review/8-1-code-review-evaluation-20260616-round-1.md`
- Round: `1`
- Conclusion: 不通过，未 Approved
- Need fix: `2`
- Priority: `P1` 2 个
- Suggested TODO: `0`
- False positives: `0`

修复范围：

1. 修复 install ready summary 已完成写入后仍显示未写入的问题，并补充 focused test 覆盖 ready install 与 prewrite install 的写入状态差异。
2. 修复 validate `zh-CN` empty state 英文硬编码问题，并补充 focused test 覆盖 validate zh-CN empty state。

下一步：启动 fresh fixer sub-agent 执行 `/bmenhance-cr-03-fixer 8-1`。

## Fix Round 1（修复第 1 轮）

Fixer 已完成：

- Fix items: `2`
- Fixed:
  - Finding #1：为 shared presentation frame 增加 `writeState` 覆盖，`renderInstallReadySummary()` 显式标记 ready install 为已写入，prewrite install 仍显示未写入。
  - Finding #2：将 validate-specific empty state 文案接入 `CliMessageKey` / `MESSAGE_CATALOG`，`zh-CN` 自然语言中文化。
- Fix record: 已追加到 `_bmad-output/implementation-artifacts/code-reviews/8-1-code-review/8-1-code-review-evaluation-20260616-round-1.md`
- Verification:
  - `npm test -- test/cli-output-presentation.test.ts`：通过，6 tests。
  - `npm test -- test/validate-command.test.ts`：通过，18 tests。
  - `npm test -- test/cli-smoke.test.ts`：通过，11 tests。
  - `npm test -- test/status-command.test.ts test/update-command.test.ts test/update-planning.test.ts test/install-progress-ready-summary.test.ts test/install-module-selection.test.ts`：通过，60 tests。
  - `npm run build`：通过。
  - `npm test`：通过，48 files / 337 tests。
  - `git diff --check`：通过。

下一步：重新启动 fresh reviewer sub-agent 执行 `/bmenhance-cr-01-reviewer 8-1` Round 2。

## Review Round 2（审查第 2 轮）

Reviewer 已生成：

- File: `_bmad-output/implementation-artifacts/code-reviews/8-1-code-review/8-1-code-review-summary-20260616-round-2.md`
- Round: `2`
- Conclusion: 通过
- Blocking findings: `0`
- New `decision_needed`: `0`
- New `patch`: `0`
- Internal fallback: 当前 reviewer agent 无可用 Agent 子代理工具，已按 CR-01 降级为当前模型串行三层视角审查。

修复确认：

- Round 1 Finding #1 已修复：ready install 显示已写入，prewrite install 和其他 command 仍使用 `auto`。
- Round 1 Finding #2 已修复：validate `zh-CN` empty state 已 catalog 化，technical identifiers 保持英文。

下一步：启动 fresh evaluator sub-agent 执行 `/bmenhance-cr-02-evaluator 8-1` Round 2。

## Evaluation Round 2（评估第 2 轮）

Evaluator 已生成：

- File: `_bmad-output/implementation-artifacts/code-reviews/8-1-code-review/8-1-code-review-evaluation-20260616-round-2.md`
- Round: `2`
- Conclusion: 通过 / Approved
- Need fix: `0`
- Suggested TODO: `0`
- False positives: `0`
- Next fixer: 不需要

Gate 决策：reviewer Round 2 与 evaluator Round 2 均通过，可以进入 04/05/06 收尾链。

## Closeout Step 04（收尾步骤 04）

Rules extractor 已完成：

- Mode: `analysis-only`
- Skill: `/bmenhance-cr-04-rules-extractor 8-1`
- Result: 完成只读 CR 历史分析和规则提炼。
- Actual writes: 无。
- 读取的 CR records:
  - `8-1-code-review-summary-20260616-round-1.md`
  - `8-1-code-review-summary-20260616-round-2.md`
  - `8-1-code-review-evaluation-20260616-round-1.md`
  - `8-1-code-review-evaluation-20260616-round-2.md`
- 候选规则:
  - Write-capable human summary 的写入状态必须来自 command-aware write state，不得只依赖不适配的 `changedPaths` / `removedPaths` 自动推断。评分 `7/12`，建议去向：`cr-rules-summary.md` 候选。
  - Locale-specific human output 的自然语言 empty state 必须走 message catalog；technical identifiers 保持英文，并覆盖 `zh-CN` focused test。评分 `6/12`，建议去向：`cr-rules-summary.md` 候选。
- 全局文档候选：无。
- 05 TODO 候选：无。
- 决策：未获得用户明确确认前，不执行 `record-only` 或 `apply-confirmed` 写入；按 orchestrator 继续执行 05 todo tracker，并记录本轮无 TODO 候选。

## Closeout Step 05（收尾步骤 05）

TODO tracker 已完成：

- Skill: `/bmenhance-cr-05-todo-tracker 8-1`
- Mode: `check/extract` 等价验证。
- Result: 无相关待办事项，无需写入 backlog。
- Actual writes: 无。
- 检查的记录:
  - `8-1-code-review-summary-20260616-round-1.md`
  - `8-1-code-review-summary-20260616-round-2.md`
  - `8-1-code-review-evaluation-20260616-round-1.md`
  - `8-1-code-review-evaluation-20260616-round-2.md`
  - `_bmad-output/implementation-artifacts/cr-rules/cr-todo-backlog.md`
- 发现：既有 `TODO-011` 与 `src/diagnostics/output.ts` 路径重叠，但建议时机是 Epic 7 的 `sync` / `uninstall` failure renderer，不构成 Story 8.1 处理项。
- 新增非阻塞 TODO 候选：无。
- 决策：继续执行 06 finalizer。

## Closeout Step 06（收尾步骤 06）

Finalizer 已完成：

- Skill: `/bmenhance-cr-06-finalizer 8-1`
- Latest evaluation: `8-1-code-review-evaluation-20260616-round-2.md`
- CR conclusion: `Approved / 通过`
- Status changes:
  - Story file: `Status: review` -> `Status: done`
  - `sprint-status.yaml`: `8-1-shared-cli-outcome-and-presentation-contract: review` -> `done`
  - `sprint-status.yaml`: `last_updated` -> `2026-06-16 02:32 CST`
- `bmm-workflow-status.yaml`: 文件不存在，已按 skill 容错跳过，未创建。
- Epic 8 状态：仍为 `in-progress`；`8-2` 到 `8-7` 仍为 `ready-for-dev`，未自动更新 Epic 状态。
- Blocking items: 无。

## Final State（终态）

Story `8-1` 满足本轮完成标准：

- 开发完成。
- reviewer Round 2 通过。
- evaluator Round 2 Approved。
- fixer 后已重新 review/evaluate。
- 04/05/06 已按顺序完成。
- 三份进度文件已更新。

下一步：初始化 Story `8-2` 的 code review 目录与进度文件，然后启动 `/bmad-dev-story story 8-2`。

## Gate（终止条件）

Story `8-1` 只有在以下条件同时满足后才视为本 Story 闭环完成：

- 开发完成，Story 状态进入 `review`。
- 最新 `bmenhance-cr-01-reviewer` 结论为通过。
- 最新 `bmenhance-cr-02-evaluator` 评估结论为通过 / Approved。
- 如果执行过 fixer，则 fixer 后已重新执行 reviewer 与 evaluator。
- `bmenhance-cr-04-rules-extractor`、`bmenhance-cr-05-todo-tracker`、`bmenhance-cr-06-finalizer` 已按顺序完成。
- 本目录三份进度文件记录终态。

## Resume Criteria（续跑条件）

- 若只有三份进度文件，无开发结果：从 `/bmad-dev-story story 8-1` 恢复。
- 若 Story 状态为 `review` 且无 CR summary：从 `/bmenhance-cr-01-reviewer 8-1` 恢复。
- 若存在最新 CR summary 但无对应 evaluation：从 `/bmenhance-cr-02-evaluator 8-1` 恢复。
- 若最新 evaluation 要求修复：从 `/bmenhance-cr-03-fixer 8-1` 恢复。
- 若 reviewer/evaluator 均通过但未 closeout：从 04/05/06 顺序恢复。
