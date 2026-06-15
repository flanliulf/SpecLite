# PLAN

## Goal（目标）

针对 Story `8-7-human-output-fixture-and-documentation-matrix` 执行严格串行的开发与 CR 闭环：

1. fresh sub-agent 执行 `/bmad-dev-story story 8-7`。
2. fresh sub-agent 执行 `/bmenhance-cr-01-reviewer 8-7`。
3. fresh sub-agent 执行 `/bmenhance-cr-02-evaluator 8-7`。
4. 如 reviewer 或 evaluator 未通过，fresh sub-agent 执行 `/bmenhance-cr-03-fixer 8-7`，然后回到 reviewer/evaluator。
5. reviewer 与 evaluator 都通过后，fresh sub-agent 依次执行 `bmenhance-cr-04-rules-extractor`、`bmenhance-cr-05-todo-tracker`、`bmenhance-cr-06-finalizer`。
6. Story `8-7` 完成后，Epic 8 所有 Story 应进入 `done`，再执行最终验证与中文 Conventional Commit，本地提交，不 push。

## Context（上下文）

- Repository: `/Users/fancyliu/Repos/SpecLite`
- Epic: `8`
- Story file: `_bmad-output/implementation-artifacts/stories/8-7-human-output-fixture-and-documentation-matrix.md`
- Code review directory: `_bmad-output/implementation-artifacts/code-reviews/8-7-code-review/`
- Epic source: `_bmad-output/planning-artifacts/epics/11-epic-8-cli-outcome-oriented-human-output-systemcli-outcome-导向人类输出体系.md`
- 当前时间：`2026-06-16 06:48 CST`

## Epic Story Order（Epic Story 顺序）

1. `8-1-shared-cli-outcome-and-presentation-contract`：done
2. `8-2-install-outcome-oriented-output`：done
3. `8-3-update-and-repair-outcome-oriented-output`：done
4. `8-4-status-and-validate-human-output-separation`：done
5. `8-5-resolve-command-support-output`：done
6. `8-6-localized-next-actions-and-message-catalog`：done
7. `8-7-human-output-fixture-and-documentation-matrix`：当前 Story

## Preflight（前置审计）

- Story `8-7` 存在，状态为 `ready-for-dev`。
- `sprint-status.yaml` 当前记录 `epic-8: in-progress`。
- `8-1` 到 `8-6` 已为 `done`；`8-7` 为 Epic 8 最后一个 `ready-for-dev` Story。
- 当前分支为 `main...origin/main [ahead 1]`；ahead 1 是上一轮 Epic 8 SR 本地提交。
- 当前工作树已有 Story 8.1 到 8.6 开发与 CR closeout 相关改动；这些是本 Epic 8 目标的一部分，不得回滚。
- 当前未发现 Story 8.7 既有 code-review 产物。
- `_bmad-output/planning-artifacts/bmm-workflow-status.yaml` 不存在，finalizer 阶段应跳过该同步文件并记录。
- 决策：后续提交只暂存本次 Epic 8 Story 开发与 CR 闭环相关文件；不得使用 `git add -A` 或把无关文件带入提交。

## Execution Order（执行顺序）

- [x] 初始化 Story 8-7 code review 目录。
- [x] 创建中文 `PLAN.md`、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md`。
- [x] Step 1: `/bmad-dev-story story 8-7`
- [x] Step 2: `/bmenhance-cr-01-reviewer 8-7`
- [x] Step 3: `/bmenhance-cr-02-evaluator 8-7`
- [x] Step 4: 如需修复，执行 `/bmenhance-cr-03-fixer 8-7`
- [x] Step 5: 修复后重新 reviewer/evaluator，直到两者均通过
- [x] Step 6: 通过后执行 04 rules extractor
- [x] Step 7: 执行 05 todo tracker
- [x] Step 8: 执行 06 finalizer
- [x] Step 9: 更新本文件、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md` 为 Story 终态
- [x] Step 10: Epic 8 最终验证与本地提交

## Current State（当前状态）

当前 Story `8-7` 已完成全部开发与 CR closeout。Story 状态为 `done`，`sprint-status.yaml` 中 `8-7-human-output-fixture-and-documentation-matrix: done`，`epic-8: done`。Epic 8 最终验证已通过，下一步执行精确暂存与本地提交。

## Final Verification（最终验证）

`2026-06-16` Epic 8 最终验证结果：

- Focused tests：`npm test -- test/cli-human-output-matrix.test.ts test/docs-reference-cli-options.test.ts test/cli-message-catalog.test.ts test/cli-output-presentation.test.ts test/install-outcome-human-output.test.ts test/cli-smoke.test.ts test/install-progress-ready-summary.test.ts test/update-command.test.ts test/status-command.test.ts test/validate-command.test.ts test/resolve-cli.test.ts` 通过，11 files / 104 tests。
- Build：`npm run build` 通过。
- Full tests：`npm test` 通过，52 files / 368 tests。
- Release packaging：`npm run release:packaging-check` 通过。
- Diff hygiene：`git diff --check` 通过。
- Manifest hygiene：`release/packaging-manifest.json` / `dist/packaging-manifest.json` 当前无 diff；`release:packaging-check` 写回的 canonical `packageHash` 副作用已恢复。

提交策略：

- 只暂存 Epic 8 Story 开发、CR 产物、文档、测试和 tracking 文件。
- 不使用 `git add .` 或 `git add -A`。
- 本地提交；不 push。

## Development Result（开发结果）

`2026-06-16` fresh dev sub-agent 执行 `/bmad-dev-story story 8-7` 已完成：

- Story 文件状态：`Status: review`
- Sprint status：`8-7-human-output-fixture-and-documentation-matrix: review`
- 修改文件：
  - `README.md`
  - `docs/quick-start.md`
  - `docs/reference/cli-human-output-matrix.md`
  - `docs/reference/cli.md`
  - `docs/reference/index.md`
  - `docs/index.md`
  - `docs/how-to/install-speclite.md`
  - `docs/how-to/update-and-repair.md`
  - `docs/how-to/validate-installation.md`
  - `test/cli-human-output-matrix.test.ts`
  - `_bmad-output/implementation-artifacts/stories/8-7-human-output-fixture-and-documentation-matrix.md`
  - `_bmad-output/implementation-artifacts/sprint-status.yaml`
- 实现摘要：
  - 新增 CLI human output matrix，覆盖 `install`、`update`、`update --repair`、`status`、`validate`、`resolve --human` 的 outcome/test/docs/fixture/JSON parity 关系。
  - 明确 docs 示例不是 contract source。
  - 新增 focused test 覆盖 matrix 完整性、`NO_COLOR` / non-TTY / CI / 窄终端语义、`--json` 稳定性、resolve human mode 和 packaging boundary。
  - 文档示例区分 read-only、prewrite preview、write-authorized、repair-authorized、validation flows。
- 验证：
  - `npm test -- test/cli-human-output-matrix.test.ts`：通过，4 tests。
  - Focused CLI output tests：通过，9 files / 96 tests。
  - `npm run build`：通过。
  - `npm test`：通过，51 files / 367 tests。
  - `npm run release:packaging-check`：通过。
  - `git diff --check`：通过。
- Build / release side effect：`release/packaging-manifest.json` 的 `packageHash` drift 已精确恢复，当前该文件无 diff。
- HALT / 遗留风险：无。

下一步：启动 fresh reviewer sub-agent 执行 `/bmenhance-cr-01-reviewer 8-7`。

## Review Round 1（审查第 1 轮）

Reviewer 已生成：

- File: `_bmad-output/implementation-artifacts/code-reviews/8-7-code-review/8-7-code-review-summary-20260616-round-1.md`
- Round: `1`
- Conclusion: 不通过
- Findings: `1`
- 分类：`patch` 1 个
- 严重性：`[中]` 1 个
- Internal fallback: 当前 reviewer agent 无可用 Agent 子代理工具，已按 CR-01 降级为当前模型串行三层视角审查。

主要发现：

1. `docs/reference/cli.md` 把 `--locale` 记录到实际不支持的 `init/list` option 表里，同时漏列真实支持 `--locale` 的 `status/validate`。构建后的 CLI 复现 `init/list --locale` 返回 `unknown option '--locale'`。

验证：

- `npm test -- test/cli-human-output-matrix.test.ts`：通过，4 tests。
- Focused CLI output tests：通过，9 files / 96 tests。
- `npm run build`：通过。
- `npm test`：通过，51 files / 367 tests。
- `npm run release:packaging-check`：通过。
- `git diff --check`：通过。
- `release/packaging-manifest.json` 的 packageHash drift 已精确恢复，当前无 diff。

下一步：启动 fresh evaluator sub-agent 执行 `/bmenhance-cr-02-evaluator 8-7`。

## Evaluation Round 1（评估第 1 轮）

Evaluator 已生成：

- File: `_bmad-output/implementation-artifacts/code-reviews/8-7-code-review/8-7-code-review-evaluation-20260616-round-1.md`
- Round: `1`
- Conclusion: `not approved`
- Finding 1：确认有效，非误报。
- 评估后优先级：P1。
- 阻塞修复项：1。
- 非阻塞 CR TODO：0。
- 误报：0。

Evaluator 决定：

1. `docs/reference/cli.md` 将 `--locale` 错列到 `init/list`，同时漏列 `status/validate`，与真实 CLI surface 不一致。
2. 该问题直接违反 Story 8.7 AC4。
3. 修复方向应从 `Init Options` / `List Options` 删除 `--locale`，在 `Status Options` / `Validate Options` 增加 `--locale <locale>`，并建议补充 focused docs/reference option parity test。

下一步：启动 fresh fixer sub-agent 执行 `/bmenhance-cr-03-fixer 8-7`。

## Fix Round 1（修复第 1 轮）

Fixer 已完成：

- Target evaluation: `_bmad-output/implementation-artifacts/code-reviews/8-7-code-review/8-7-code-review-evaluation-20260616-round-1.md`
- Fix items: 1
- Status: fixed
- Evaluation append: 已追加 `## 修复执行记录`

修复摘要：

1. `docs/reference/cli.md` 从 `Init Options` / `List Options` 删除 `--locale <locale>`。
2. `docs/reference/cli.md` 在 `Status Options` / `Validate Options` 增加 `--locale <locale>`，文案对齐 `src/bin/speclite.ts`。
3. 新增 `test/docs-reference-cli-options.test.ts`，解析 `docs/reference/cli.md` 中 `init/list/status/validate` documented options，并与 `createSpecliteProgram()` 生成的 CLI help option surface 比对。

验证：

- `npm test -- test/docs-reference-cli-options.test.ts`：通过，1 file / 1 test。
- `npm test -- test/docs-reference-cli-options.test.ts test/cli-human-output-matrix.test.ts`：通过，2 files / 5 tests。
- `npm run build`：通过。
- `npm test`：通过，52 files / 368 tests。
- `npm run release:packaging-check`：通过。
- `git diff --check`：通过。
- `release/packaging-manifest.json` 的 packageHash drift 已精确恢复，当前无 diff。

下一步：启动 fresh reviewer sub-agent 执行 `/bmenhance-cr-01-reviewer 8-7` Round 2。

## Review Round 2（审查第 2 轮）

Reviewer 已生成：

- File: `_bmad-output/implementation-artifacts/code-reviews/8-7-code-review/8-7-code-review-summary-20260616-round-2.md`
- Round: `2`
- Conclusion: 通过
- Findings: `0`
- 分类：`decision_needed=0`、`patch=0`、`defer=0`、`dismiss=0`

复核结果：

1. Round 1 的 `docs/reference/cli.md` option 表错位已修复。
2. 新增 `test/docs-reference-cli-options.test.ts` 能覆盖 `init/list/status/validate --locale` 的错列和漏列回归。
3. 未发现修复改变 CLI runtime behavior、command core behavior、JSON schema 或 outcome vocabulary。
4. Story 8.7 matrix/docs/tests/package boundary 仍通过。

验证：

- `npm test -- test/docs-reference-cli-options.test.ts`：通过，1 file / 1 test。
- `npm test -- test/cli-human-output-matrix.test.ts`：通过，1 file / 4 tests。
- `npm run build`：通过。
- 构建后 CLI help parity smoke：通过。
- `npm test`：通过，52 files / 368 tests。
- `npm run release:packaging-check`：通过。
- `git diff --check`：通过。
- `release/packaging-manifest.json` / `dist/packaging-manifest.json` 当前无 diff。

下一步：启动 fresh evaluator sub-agent 执行 `/bmenhance-cr-02-evaluator 8-7` Round 2。

## Evaluation Round 2（评估第 2 轮）

Evaluator 已生成：

- File: `_bmad-output/implementation-artifacts/code-reviews/8-7-code-review/8-7-code-review-evaluation-20260616-round-2.md`
- Round: `2`
- Conclusion: Approved
- approved: `true`
- CR TODO：0
- 误报：0
- 是否需要 fixer：否

评估确认：

1. Round 1 文档 option 表问题已按源码真实 CLI surface 修复。
2. 新增 parity test 覆盖 `init/list/status/validate` 文档 option 表和 CLI help option surface 的一致性。
3. Story 8.7 matrix/docs/tests/package boundary 仍有 focused test 覆盖。

验证：

- `npm test -- test/docs-reference-cli-options.test.ts test/cli-human-output-matrix.test.ts`：通过，2 files / 5 tests。

下一步：启动 fresh sub-agent 执行 `bmenhance-cr-04-rules-extractor`。

## Rules Extraction（规则提取）

04 rules extractor 已生成：

- File: `_bmad-output/implementation-artifacts/code-reviews/8-7-code-review/8-7-cr-rules-extraction-20260616.md`
- Candidate: `CAND-CR-DOC-8-7-01`
- 主题：CLI reference option 表必须通过 focused parity test 与 command help surface 对齐。
- 晋升判定：`7/12`，未达到全局文档规则阈值 `>= 8/12`。
- 全局 / 项目级规则文档更新：无。
- 05 TODO handoff：无需处理；Round 2 已确认 findings 0、非阻塞 CR TODO 0，问题已修复关闭。

下一步：启动 fresh sub-agent 执行 `bmenhance-cr-05-todo-tracker` 做无待办确认。

## TODO Tracking（待办跟踪）

05 TODO tracker 已完成：

- Backlog file: `_bmad-output/implementation-artifacts/cr-rules/cr-todo-backlog.md`
- 新增 / 更新 TODO：0
- Backlog 变更：0
- 后续处理：无需 CR TODO backlog 后续处理。

依据：

1. Round 1 evaluation 将唯一问题判定为 P1 阻塞修复项，非阻塞 CR TODO 为 0。
2. Round 2 evaluation Approved，非阻塞 CR TODO 为 0。
3. Rules extraction 明确 `CAND-CR-DOC-8-7-01` 低于全局文档规则阈值，且无需交给 05 TODO Tracker。

下一步：启动 fresh sub-agent 执行 `bmenhance-cr-06-finalizer`。

## Finalization（最终收口）

06 finalizer 已完成：

- Story file: `_bmad-output/implementation-artifacts/stories/8-7-human-output-fixture-and-documentation-matrix.md`
- Story status: `done`
- Sprint file: `_bmad-output/implementation-artifacts/sprint-status.yaml`
- Sprint status: `8-7-human-output-fixture-and-documentation-matrix: done`
- Epic status: `epic-8: done`
- `last_updated`: `2026-06-16 07:38 CST`
- `epic-8-retrospective`: 保持 `optional`
- Skipped tracking: `_bmad-output/planning-artifacts/bmm-workflow-status.yaml` 不存在，已跳过且未创建。

Finalizer 检查：

- Latest review summary: Round 2 通过，findings 0。
- Latest evaluation: Round 2 Approved，CR TODO 0，误报 0，不需要 fixer。
- 04 rules extraction: `CAND-CR-DOC-8-7-01`，7/12，未更新全局规则。
- 05 TODO tracker: backlog 变更 0。
- `git diff --check -- <story> <sprint-status>` 通过。

## Terminal State（终态）

Story `8-7-human-output-fixture-and-documentation-matrix` 已完成。Epic 8 所有 Story 已完成，下一步执行最终验证与本地提交。

## Gate（终止条件）

Story `8-7` 只有在以下条件同时满足后才视为本 Story 闭环完成：

- 开发完成，Story 状态进入 `review`。
- 最新 `bmenhance-cr-01-reviewer` 结论为通过。
- 最新 `bmenhance-cr-02-evaluator` 评估结论为通过 / Approved。
- 如果执行过 fixer，则 fixer 后已重新执行 reviewer 与 evaluator。
- `bmenhance-cr-04-rules-extractor`、`bmenhance-cr-05-todo-tracker`、`bmenhance-cr-06-finalizer` 已按顺序完成。
- 本目录三份进度文件记录终态。

## Resume Criteria（续跑条件）

- 若只有三份进度文件，无开发结果：从 `/bmad-dev-story story 8-7` 恢复。
- 若 Story 状态为 `review` 且无 CR summary：从 `/bmenhance-cr-01-reviewer 8-7` 恢复。
- 若存在最新 CR summary 但无对应 evaluation：从 `/bmenhance-cr-02-evaluator 8-7` 恢复。
- 若最新 evaluation 要求修复：从 `/bmenhance-cr-03-fixer 8-7` 恢复。
- 若 reviewer/evaluator 均通过但未 closeout：从 04/05/06 顺序恢复。
