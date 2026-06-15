# PLAN

## Goal（目标）

针对 Story `8-5-resolve-command-support-output` 执行严格串行的开发与 CR 闭环：

1. fresh sub-agent 执行 `/bmad-dev-story story 8-5`，模型 `gpt-5.5`。
2. fresh sub-agent 执行 `/bmenhance-cr-01-reviewer 8-5`，模型 `gpt-5.5`。
3. fresh sub-agent 执行 `/bmenhance-cr-02-evaluator 8-5`，模型 `gpt-5.5`。
4. 如 reviewer 或 evaluator 未通过，fresh sub-agent 执行 `/bmenhance-cr-03-fixer 8-5`，模型 `gpt-5.5`，然后回到 reviewer/evaluator。
5. reviewer 与 evaluator 都通过后，fresh sub-agent 依次执行 `bmenhance-cr-04-rules-extractor`、`bmenhance-cr-05-todo-tracker`、`bmenhance-cr-06-finalizer`。
6. 当前 Story 完成后才进入 Story `8-6`。
7. 所有 Epic 8 Story 完成后，使用 `git-commit-convention` 做中文 Conventional Commit，本地提交，不 push。

## Context（上下文）

- Repository: `/Users/fancyliu/Repos/SpecLite`
- Epic: `8`
- Story file: `_bmad-output/implementation-artifacts/stories/8-5-resolve-command-support-output.md`
- Code review directory: `_bmad-output/implementation-artifacts/code-reviews/8-5-code-review/`
- Epic source: `_bmad-output/planning-artifacts/epics/11-epic-8-cli-outcome-oriented-human-output-systemcli-outcome-导向人类输出体系.md`
- 当前时间：`2026-06-16 04:08 CST`

## Epic Story Order（Epic Story 顺序）

1. `8-1-shared-cli-outcome-and-presentation-contract`：done
2. `8-2-install-outcome-oriented-output`：done
3. `8-3-update-and-repair-outcome-oriented-output`：done
4. `8-4-status-and-validate-human-output-separation`：done
5. `8-5-resolve-command-support-output`：当前 Story
6. `8-6-localized-next-actions-and-message-catalog`
7. `8-7-human-output-fixture-and-documentation-matrix`

## Preflight（前置审计）

- Story `8-5` 存在，状态为 `ready-for-dev`。
- `sprint-status.yaml` 当前记录 `epic-8: in-progress`。
- `8-1` 到 `8-4` 已为 `done`；`8-5` 为下一个 `ready-for-dev` Story。
- 当前分支为 `main...origin/main [ahead 1]`；ahead 1 是上一轮 Epic 8 SR 本地提交。
- 当前工作树已有 Story 8.1 / 8.2 / 8.3 / 8.4 开发与 CR closeout 相关改动；这些是本 Epic 8 目标的一部分，不得回滚。
- 当前未发现 Story 8.5 既有 code-review 产物。
- `_bmad-output/planning-artifacts/bmm-workflow-status.yaml` 不存在，finalizer 阶段应跳过该同步文件并记录。
- 决策：后续提交只暂存本次 Epic 8 Story 开发与 CR 闭环相关文件；不得使用 `git add -A` 或把无关文件带入提交。

## Execution Order（执行顺序）

- [x] 初始化 Story 8-5 code review 目录。
- [x] 创建中文 `PLAN.md`、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md`。
- [x] Step 1: `/bmad-dev-story story 8-5`
- [x] Step 2: `/bmenhance-cr-01-reviewer 8-5`
- [x] Step 3: `/bmenhance-cr-02-evaluator 8-5`
- [x] Step 4: 如需修复，执行 `/bmenhance-cr-03-fixer 8-5`
- [x] Step 5: 修复后重新 reviewer/evaluator，直到两者均通过
- [x] Step 6: 通过后执行 04 rules extractor
- [x] Step 7: 执行 05 todo tracker
- [x] Step 8: 执行 06 finalizer
- [x] Step 9: 更新本文件、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md` 为 Story 终态

## Current State（当前状态）

当前 Story `8-5` 已完成全部开发与 CR closeout。Story 状态为 `done`，`sprint-status.yaml` 中 `8-5-resolve-command-support-output: done`。Epic 8 仍为 `in-progress`，因为 `8-6` 和 `8-7` 仍为 `ready-for-dev`。下一步进入 Story `8-6-localized-next-actions-and-message-catalog`。

## Development Result（开发结果）

`2026-06-16` fresh dev sub-agent 执行 `/bmad-dev-story story 8-5` 已完成：

- Story 文件状态：`Status: review`
- Sprint status：`8-5-resolve-command-support-output: review`
- 修改文件：
  - `README.md`
  - `_bmad-output/planning-artifacts/specs/06-resolve-command-contract.md`
  - `docs/reference/cli.md`
  - `src/commands/resolve.ts`
  - `src/config/resolve-output-schema.ts`
  - `test/resolve-cli.test.ts`
  - `test/fixtures/resolve-parity/README.md`
  - `test/fixtures/resolve-parity/expected/human/*.txt`
  - `_bmad-output/implementation-artifacts/stories/8-5-resolve-command-support-output.md`
  - `_bmad-output/implementation-artifacts/sprint-status.yaml`
- 实现摘要：
  - 默认 `resolve config/customization` pure JSON stdout contract 保持不变。
  - 新增显式 `--human` opt-in human-readable resolve support。
  - 默认 missing key 保持 stdout `{}`、exit code 0、stderr empty。
  - `unresolved` 仅在 explicit human mode 下出现。
  - 同步更新 resolve contract SPEC、CLI docs、tests 和 fixtures。
- 验证：
  - `npm test -- test/resolve-cli.test.ts`：通过，15 tests。
  - `npm test -- test/resolve-cli.test.ts test/resolve-readers.test.ts`：通过，19 tests。
  - `npm run build`：通过。
  - `npm test`：通过，49 files / 356 tests。
  - `git diff --check`：通过。
- Build side effect：`npm run build` 曾造成 `release/packaging-manifest.json` `packageHash` drift，dev sub-agent 已恢复该文件，最终无 diff。
- HALT / 遗留风险：无。

下一步：启动 fresh sub-agent 执行 `/bmenhance-cr-01-reviewer 8-5`。

## Review Round 1（审查第 1 轮）

Reviewer 已生成：

- File: `_bmad-output/implementation-artifacts/code-reviews/8-5-code-review/8-5-code-review-summary-20260616-round-1.md`
- Round: `1`
- Conclusion: 不通过
- Findings: `1`
- 分类：`patch` 1 个
- 严重性：`[中]` 1 个
- Internal fallback: 当前 reviewer agent 无可用 Agent 子代理工具，已按 CR-01 降级为当前模型串行三层视角审查。

主要发现：

1. Human resolve output 的 `source path` 使用候选首层硬编码，而不是真实 resolved key 来源。例如 `core.project_name` 实际由 `_speclite/config.user.toml` 覆盖得到，但 human output 显示 `_speclite/config.toml`。

验证副作用：

- reviewer 的 `npm run build` 造成 `release/packaging-manifest.json` `packageHash` drift，主 agent 已精确恢复，当前该文件无 diff。

## Evaluation Round 1（评估第 1 轮）

Evaluator 已生成：

- File: `_bmad-output/implementation-artifacts/code-reviews/8-5-code-review/8-5-code-review-evaluation-20260616-round-1.md`
- Round: `1`
- Conclusion: `not approved`
- Finding 1：确认有效，非误报。
- 评估后优先级：P1。
- CR TODO：0。
- 误报：0。

Evaluator 决定：

1. Human resolve output 当前把候选首层 `_speclite/config.toml` 渲染为单数 `source path`，但 `core.project_name` 的 effective value 来自 `_speclite/config.user.toml`。
2. 该问题直接违反 AC1 对 successful resolve human output 中 `source path` 准确性的要求。
3. 下一步必须执行 CR-03 fixer；推荐修复方向是携带 selected key 的 effective source metadata。如果不能精确表达真实来源，则不能继续用单数 `source path` 伪装为精确来源，并需同步调整 AC/SPEC 语义。

下一步：启动 fresh fixer sub-agent 执行 `/bmenhance-cr-03-fixer 8-5`。

## Fix Round 1（修复第 1 轮）

Fixer 已完成：

- Target evaluation: `_bmad-output/implementation-artifacts/code-reviews/8-5-code-review/8-5-code-review-evaluation-20260616-round-1.md`
- Fix items: 1
- Status: fixed
- Evaluation append: 已追加 `## 修复执行记录`

修复摘要：

1. `ResolverResult` 增加 `sources` metadata，按现有 merge order 记录 selected dotted key 的 effective source layer。
2. explicit `--human` Summary 的 `source path` 改为读取 effective source metadata；`core.project_name` 现在显示 `_speclite/config.user.toml`。
3. 默认 machine mode 仍只输出 `result.value` JSON；missing key 默认仍是 `{}` / exit code `0` / stderr empty。

修改文件：

- `src/config/customization-reader.ts`
- `src/config/resolve-output-schema.ts`
- `src/commands/resolve.ts`
- `test/resolve-readers.test.ts`
- `test/resolve-cli.test.ts`
- `test/contract-anchors.test.ts`
- `test/fixtures/resolve-parity/expected/human/config-resolved.txt`
- `test/fixtures/resolve-parity/expected/human/config-resolved-with-warnings.txt`
- `test/fixtures/resolve-parity/expected/human/config-unresolved.txt`
- `_bmad-output/planning-artifacts/specs/06-resolve-command-contract.md`
- `docs/reference/cli.md`

验证：

- `npm test -- test/resolve-cli.test.ts test/resolve-readers.test.ts test/contract-anchors.test.ts`：通过，3 files / 26 tests。
- `npm run build`：通过。
- `npm test`：通过，49 files / 356 tests。
- `git diff --check`：通过。
- `release/packaging-manifest.json` 的 build hash drift 已精确恢复，当前无 diff。

下一步：启动 fresh reviewer sub-agent 执行 `/bmenhance-cr-01-reviewer 8-5` Round 2。

## Review Round 2（审查第 2 轮）

Reviewer 已生成：

- File: `_bmad-output/implementation-artifacts/code-reviews/8-5-code-review/8-5-code-review-summary-20260616-round-2.md`
- Round: `2`
- Conclusion: 通过
- Findings: `0`
- 分类：`decision_needed: 0`、`patch: 0`、`defer: 0`
- Internal fallback: 当前 reviewer agent 无可用 Agent 子代理工具，已按 CR-01 降级为当前模型串行三层视角审查。

复核结果：

1. Round 1 的 effective source finding 已修复。
2. 后续 layer 覆盖 base value 的 `config` 与 `customization` 场景已覆盖。
3. 默认 machine mode 未泄漏 `sources` metadata。
4. missing key 默认仍是 `{}` / exit code `0` / stderr empty。
5. `--human` source path、warning JSON Lines、invalid-input 脱敏均符合预期。

验证：

- `npm test -- test/resolve-cli.test.ts test/resolve-readers.test.ts test/contract-anchors.test.ts`：通过，3 files / 26 tests。
- `npm run build`：通过。
- `npm test`：通过，49 files / 356 tests。
- `git diff --check`：通过。
- `release/packaging-manifest.json` 的 build hash drift 已精确恢复，当前无 diff。

下一步：启动 fresh evaluator sub-agent 执行 `/bmenhance-cr-02-evaluator 8-5` Round 2。

## Evaluation Round 2（评估第 2 轮）

Evaluator 已生成：

- File: `_bmad-output/implementation-artifacts/code-reviews/8-5-code-review/8-5-code-review-evaluation-20260616-round-2.md`
- Round: `2`
- Conclusion: Approved
- approved: `true`
- CR TODO：0
- 误报：0
- 是否需要 fixer：否

评估确认：

1. Round 1 finding 已修复，不再阻塞。
2. Round 2 新发现为 0。
3. 默认 machine mode、missing key 默认行为与 `--human` effective source path 覆盖均符合预期。

验证：

- `npm test -- test/resolve-cli.test.ts test/resolve-readers.test.ts test/contract-anchors.test.ts`：通过，3 files / 26 tests。

下一步：启动 fresh sub-agent 执行 `bmenhance-cr-04-rules-extractor`。

## Rules Extraction（规则提取）

04 rules extractor 已生成：

- File: `_bmad-output/implementation-artifacts/code-reviews/8-5-code-review/8-5-cr-rules-extraction-20260616.md`
- Candidate: `CAND-CR-API-8-5-01`
- 主题：`resolve ... --human` 单数 `source path` 必须来自 selected key effective source metadata。
- 晋升判定：`5/12`，`candidate-only`。
- 全局 / 项目级规则文档更新：无。
- 05 TODO handoff：无需处理；Round 2 已确认修复，CR TODO 为 0。
- 验证：文档提取阶段未运行代码测试；确认无 staged changes。

下一步：启动 fresh sub-agent 执行 `bmenhance-cr-05-todo-tracker` 做无待办确认。

## TODO Tracking（待办跟踪）

05 TODO tracker 已完成：

- Backlog file: `_bmad-output/implementation-artifacts/cr-rules/cr-todo-backlog.md`
- 新增 / 更新 TODO：0
- Backlog 变更：0
- 后续处理：无需 CR TODO backlog 后续处理。

依据：

1. Round 1 evaluation 的非阻塞 TODO 表为空，CR TODO 数量为 0。
2. Round 2 summary 写明“仍为非阻塞待办：无”。
3. Round 2 evaluation 写明无需新增 CR TODO，Approved。
4. rules extraction 明确无需交给 05 TODO Tracker。

下一步：启动 fresh sub-agent 执行 `bmenhance-cr-06-finalizer`。

## Finalization（最终收口）

06 finalizer 已完成：

- Story file: `_bmad-output/implementation-artifacts/stories/8-5-resolve-command-support-output.md`
- Story status: `done`
- Sprint file: `_bmad-output/implementation-artifacts/sprint-status.yaml`
- Sprint status: `8-5-resolve-command-support-output: done`
- `last_updated`: `2026-06-16 04:55 CST`
- Epic 8 status: 保持 `in-progress`，因为 `8-6` 和 `8-7` 仍为 `ready-for-dev`。
- Skipped tracking: `_bmad-output/planning-artifacts/bmm-workflow-status.yaml` 不存在，已跳过且未创建。

Finalizer 检查：

- Latest review summary: Round 2 通过，findings 0。
- Latest evaluation: Round 2 Approved，CR TODO 0，误报 0，不需要 fixer。
- 04 rules extraction: candidate-only，未更新全局规则。
- 05 TODO tracker: backlog 变更 0。
- Ruby 校验 `sprint-status.yaml`：`8-5=done`、`epic-8=in-progress`、`8-6/8-7=ready-for-dev`。

## Terminal State（终态）

Story `8-5-resolve-command-support-output` 已完成。下一步只能进入 Story `8-6-localized-next-actions-and-message-catalog` 的 fresh dev sub-agent。

## Gate（终止条件）

Story `8-5` 只有在以下条件同时满足后才视为本 Story 闭环完成：

- 开发完成，Story 状态进入 `review`。
- 最新 `bmenhance-cr-01-reviewer` 结论为通过。
- 最新 `bmenhance-cr-02-evaluator` 评估结论为通过 / Approved。
- 如果执行过 fixer，则 fixer 后已重新执行 reviewer 与 evaluator。
- `bmenhance-cr-04-rules-extractor`、`bmenhance-cr-05-todo-tracker`、`bmenhance-cr-06-finalizer` 已按顺序完成。
- 本目录三份进度文件记录终态。

## Resume Criteria（续跑条件）

- 若只有三份进度文件，无开发结果：从 `/bmad-dev-story story 8-5` 恢复。
- 若 Story 状态为 `review` 且无 CR summary：从 `/bmenhance-cr-01-reviewer 8-5` 恢复。
- 若存在最新 CR summary 但无对应 evaluation：从 `/bmenhance-cr-02-evaluator 8-5` 恢复。
- 若最新 evaluation 要求修复：从 `/bmenhance-cr-03-fixer 8-5` 恢复。
- 若 reviewer/evaluator 均通过但未 closeout：从 04/05/06 顺序恢复。
