# PLAN

## Goal（目标）

针对 Story `8-8-cli-human-output-presentation-profiles` 执行严格串行的开发与 CR 闭环：

1. fresh sub-agent 执行 `/bmad-dev-story story 8-8`。
2. fresh sub-agent 执行 `/bmenhance-cr-01-reviewer 8-8`。
3. fresh sub-agent 执行 `/bmenhance-cr-02-evaluator 8-8`。
4. 如 reviewer 或 evaluator 未通过，fresh sub-agent 执行 `/bmenhance-cr-03-fixer 8-8`，然后回到 reviewer/evaluator。
5. reviewer 与 evaluator 都通过后，fresh sub-agent 依次执行 `bmenhance-cr-04-rules-extractor`、`bmenhance-cr-05-todo-tracker`、`bmenhance-cr-06-finalizer`。
6. Story `8-8` 完成后执行最终验证与中文 Conventional Commit，本地提交，不 push。

## Context（上下文）

- Repository: `/Users/fancyliu/Repos/SpecLite`
- Epic: `8`
- Story file: `_bmad-output/implementation-artifacts/stories/8-8-cli-human-output-presentation-profiles.md`
- Code review directory: `_bmad-output/implementation-artifacts/code-reviews/8-8-code-review/`
- Epic source: `_bmad-output/planning-artifacts/epics/11-epic-8-cli-outcome-oriented-human-output-systemcli-outcome-导向人类输出体系.md`
- 当前时间：`2026-06-16`

## Preflight（前置审计）

- Story `8-8` 存在，状态为 `ready-for-dev`。
- `sprint-status.yaml` 当前记录 `epic-8: in-progress`，`8-8-cli-human-output-presentation-profiles: ready-for-dev`。
- 当前分支为 `main...origin/main [ahead 4]`。
- 当前工作树已有 Epic 8 Story 一致性调整、Story 8.8 新文件和 focused RED test；这些是本次目标范围的一部分，不得回滚。
- 当前未发现 Story 8.8 既有 code-review 产物。
- 决策：后续提交只暂存 Story 8.8 开发、CR 产物、文档、测试和 tracking 文件；不得使用 `git add -A` 或把无关文件带入提交。

## Execution Order（执行顺序）

- [x] 初始化 Story 8-8 code review 目录。
- [x] 创建中文 `PLAN.md`、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md`。
- [x] Step 1: `/bmad-dev-story story 8-8`
- [x] Step 2: `/bmenhance-cr-01-reviewer 8-8`
- [x] Step 3: `/bmenhance-cr-02-evaluator 8-8`
- [x] Step 4: 如需修复，执行 `/bmenhance-cr-03-fixer 8-8`
- [x] Step 5: 修复后重新 reviewer/evaluator，直到两者均通过
- [x] Step 6: 通过后执行 04 rules extractor
- [x] Step 7: 执行 05 todo tracker
- [x] Step 8: 执行 06 finalizer
- [x] Step 9: 更新本文件、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md` 为 Story 终态
- [ ] Step 10: 最终验证与本地提交

## Current State（当前状态）

Story `8-8` 已完成开发并进入 `review`。下一步启动 fresh reviewer sub-agent 执行 `/bmenhance-cr-01-reviewer 8-8`。

## Development Result（开发结果）

`2026-06-16` fresh dev sub-agent 执行 `/bmad-dev-story story 8-8` 已完成：

- Story 文件状态：`Status: review`
- Sprint status：`8-8-cli-human-output-presentation-profiles: review`
- 主要修改：
  - 新增 `operation`、`diagnostic`、`report-support` presentation profile taxonomy 与 command mapping。
  - shared human frame 改为 profile-aware section order。
  - 移除默认独立 `Empty State` section，将 empty state 归入所属 section。
  - install human renderer 增加 non-enumerable target presentation context，human output 可展示 absolute target path 与 command cwd，JSON 不暴露 absolute target。
  - install Next Actions 改为 path-safe，custom install 建议使用 `--yes --interactive`。
  - 默认 human output 去掉 `completedSteps=`、`pendingSteps=`、`selectedModules=` 等 raw-field 双写。
  - 更新 docs matrix、focused tests 与 smoke tests。
- 验证：
  - RED 基线：`npm test -- test/install-outcome-human-output.test.ts` 初始失败，确认目标问题存在。
  - Focused tests：26 passed。
  - 相关 renderer 回归：59 passed。
  - `npm run build`：通过。
  - `npm test`：52 files / 371 tests passed。
  - `git diff --check`：通过。
- 遗留风险：无已知阻塞；legacy renderer 未全量重写，只加入 profile mapping 与 shared frame 迁移基础。

## Review Round 1（审查第 1 轮）

Reviewer 已生成：

- File: `_bmad-output/implementation-artifacts/code-reviews/8-8-code-review/8-8-code-review-summary-20260616-round-1.md`
- Round: `1`
- Conclusion: 不通过
- Findings: `2`
- 分类：`patch` 2 个
- 严重性：`[中]` 1 个，`[低]` 1 个
- Internal fallback: 当前 reviewer agent 无可用 Agent 子代理工具，已按 CR-01 降级为当前上下文串行三层审查。

主要发现：

1. 跨目录相对 target 如 `../noi` 仍会在 human Next Actions 中退化为 basename `noi`，违反 path-safe 要求。
2. shared frame 把 `未写入项目文件` 这类非 issue 写入空态放入 `Issues` section，削弱 `- 无问题` 的语义。

验证：

- `npm test -- test/install-outcome-human-output.test.ts`：通过，7/7。
- `npm test -- test/cli-output-presentation.test.ts test/cli-message-catalog.test.ts test/cli-human-output-matrix.test.ts`：通过，19/19。
- `npm run build`：通过。
- `npm test`：通过，371/371。
- `git diff --check`：通过。
- `npm run lint`：未执行，`package.json` 未配置 `lint` script。

下一步：启动 fresh evaluator sub-agent 执行 `/bmenhance-cr-02-evaluator 8-8`。

## Evaluation Round 1（评估第 1 轮）

Evaluator 已生成：

- File: `_bmad-output/implementation-artifacts/code-reviews/8-8-code-review/8-8-code-review-evaluation-20260616-round-1.md`
- Round: `1`
- Conclusion: `not approved`
- Finding 1：确认有效，非误报，P1，阻塞修复项。
- Finding 2：确认有效，非误报，P1，阻塞修复项。
- 阻塞修复项：2。
- 非阻塞 CR TODO：0。
- 误报：0。

Evaluator 决定：

1. 跨目录相对 target 的 human Next Actions 退化为 basename，违反 path-safe command preview。
2. 非 issue 的写入空态进入 `Issues` section，违反 empty state 归属语义。

下一步：启动 fresh fixer sub-agent 执行 `/bmenhance-cr-03-fixer 8-8`。

## Fix Round 1（修复第 1 轮）

Fixer 已完成：

- Target evaluation: `_bmad-output/implementation-artifacts/code-reviews/8-8-code-review/8-8-code-review-evaluation-20260616-round-1.md`
- Fix items: 2
- Status: fixed
- Evaluation append: 已追加 `## 修复执行记录`

修复摘要：

1. `src/commands/install.ts` 调整 install presentation context：绝对 target 继续使用 resolved `targetRoot`；非空相对 target 保留 raw command target，因此 `../noi` 不再退化为 basename。
2. `src/diagnostics/output.ts` 调整 shared frame fallback：`Issues` section 只输出真实 issue 或 `- 无问题`，不再混入 `未写入项目文件`。
3. `test/install-outcome-human-output.test.ts` 补充 `../noi` regression 与 install no-issue `Issues` section 精确归属断言。

验证：

- `npm test -- test/install-outcome-human-output.test.ts`：通过，8 tests。
- `npm test -- test/cli-output-presentation.test.ts test/cli-message-catalog.test.ts test/cli-human-output-matrix.test.ts test/install-outcome-human-output.test.ts`：通过，27 tests。
- `npm run build`：通过。
- `npm test`：通过，52 files / 372 tests。
- `git diff --check`：通过。
- `release/packaging-manifest.json` 的生成性 packageHash drift 已恢复，未扩大修复范围。

下一步：启动 fresh reviewer sub-agent 执行 `/bmenhance-cr-01-reviewer 8-8` Round 2。

## Review Round 2（审查第 2 轮）

Reviewer 已生成：

- File: `_bmad-output/implementation-artifacts/code-reviews/8-8-code-review/8-8-code-review-summary-20260616-round-2.md`
- Round: `2`
- Conclusion: 通过
- Findings: `0`
- 分类：无阻塞项或中高优先级问题
- Internal fallback: 当前 reviewer agent 无可用 Agent 子代理工具，已按 CR-01 降级为当前上下文串行三层审查。

复核结果：

1. Round 1 的 `../noi` basename 退化问题已修复。
2. Round 1 的 `Issues` section 混入 `未写入项目文件` 问题已修复。
3. 新增 focused regression 覆盖 relative cross-directory target、JSON 不泄漏 absolute target 和 install no-issue section 归属。
4. 未发现 install core flow、exit code、write authorization 或 public JSON schema 回归。

验证：

- `npm test -- test/install-outcome-human-output.test.ts`：通过，8/8。
- `npm test -- test/cli-output-presentation.test.ts test/cli-message-catalog.test.ts test/cli-human-output-matrix.test.ts test/install-outcome-human-output.test.ts`：通过，27/27。
- `npm run build`：通过。
- `npm test`：通过，372/372。
- `git diff --check`：通过。
- `npm run lint`：未执行，`package.json` 未配置 `lint` script。

下一步：启动 fresh evaluator sub-agent 执行 `/bmenhance-cr-02-evaluator 8-8` Round 2。

## Evaluation Round 2（评估第 2 轮）

Evaluator 已生成：

- File: `_bmad-output/implementation-artifacts/code-reviews/8-8-code-review/8-8-code-review-evaluation-20260616-round-2.md`
- Round: `2`
- Conclusion: `Approved`
- Round 1 finding 修复状态：2/2 已修复。
- Round 2 新 findings：0。
- 阻塞修复项：0。
- 非阻塞 CR TODO：0。
- 误报：0。
- Fixer：不需要。

下一步：启动 fresh sub-agent 执行 `bmenhance-cr-04-rules-extractor`。

## Rules Extraction（规则提取）

04 rules extractor 已完成：

- File: `_bmad-output/implementation-artifacts/code-reviews/8-8-code-review/8-8-cr-rules-extraction-20260616.md`
- Mode: analysis-only + Story 级追溯记录
- Candidate rules: 2
- 结论：无需全局规则更新；无需 `cr-rules-summary.md` 更新；无需 TODO backlog。

候选规则：

1. 可复制的 human Next Actions 不应复用展示/脱敏 target 名称；评分 4；不沉淀，保留 Story 级记录。
2. `Issues` section 只承载真实问题或 issue-owned empty state；评分 4；不沉淀，保留 Story 级记录。

验证：

- `git diff --check -- _bmad-output/implementation-artifacts/code-reviews/8-8-code-review/8-8-cr-rules-extraction-20260616.md`：通过。

下一步：执行 `bmenhance-cr-05-todo-tracker` 做无待办确认。

## TODO Tracker（待办跟踪）

05 TODO tracker 已完成：

- Mode: check / read-only
- Backlog 文件：`_bmad-output/implementation-artifacts/cr-rules/cr-todo-backlog.md`
- 结论：无待办。
- Backlog 变更：0。
- 不需要后续 CR TODO backlog 处理。

依据：

- Round 2 summary：非阻塞待办为无。
- Round 2 evaluation：CR TODO 0。
- 04 rules extraction：无需 TODO backlog。

下一步：启动 fresh sub-agent 执行 `bmenhance-cr-06-finalizer`。

## Finalizer（收尾）

06 finalizer 已完成：

- Story status: `done`
- Sprint status: `8-8-cli-human-output-presentation-profiles: done`
- Epic status: `epic-8: done`
- `epic-8-retrospective`: 保持 `optional`
- `last_updated`: `2026-06-16 14:45 CST`
- Workflow status: `_bmad-output/planning-artifacts/bmm-workflow-status.yaml` 不存在，已跳过且未创建。

修改文件：

- `_bmad-output/implementation-artifacts/stories/8-8-cli-human-output-presentation-profiles.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

验证：

- 最新 CR evaluation Round 2 为 Approved。
- Story 8.1 到 8.8 均为 `done`。
- `git diff --check -- <story> <sprint-status>`：通过。

下一步：执行最终验证与本地中文 Conventional Commit；不 push。

## Final Verification（最终验证）

`2026-06-16` Story 8.8 最终验证结果：

- `npm test -- test/install-outcome-human-output.test.ts`：通过，1 file / 8 tests。
- `npm test -- test/cli-output-presentation.test.ts test/cli-message-catalog.test.ts test/cli-human-output-matrix.test.ts test/install-outcome-human-output.test.ts`：通过，4 files / 27 tests。
- `npm test -- test/status-command.test.ts test/validate-command.test.ts test/update-command.test.ts test/resolve-cli.test.ts`：通过，4 files / 59 tests。
- `npm run build`：通过。
- `npm test`：通过，52 files / 372 tests。
- `git diff --check`：通过。
- `release/packaging-manifest.json` / `dist/packaging-manifest.json` 当前无 diff；`npm run build` 写回的 packageHash 副作用已精确恢复。

提交策略：

- 精确暂存 Story 8.8 代码、测试、文档、CR 产物、Epic/Story 一致性调整和 tracking 文件。
- 不使用 `git add .` 或 `git add -A`。
- 本地提交；不 push。
