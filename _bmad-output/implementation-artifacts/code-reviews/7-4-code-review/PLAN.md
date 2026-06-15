# PLAN

## Goal（目标）

针对 Story `7-4-process-governance-coverage-report` 执行严格串行的开发与 CR 闭环：

1. fresh sub-agent 执行 `/bmad-dev-story story 7-4`，模型 `gpt-5.5`。
2. fresh sub-agent 执行 `/bmenhance-cr-01-reviewer 7-4`，模型 `gpt-5.5`。
3. fresh sub-agent 执行 `/bmenhance-cr-02-evaluator 7-4`，模型 `gpt-5.5`。
4. 如 reviewer 或 evaluator 未通过，fresh sub-agent 执行 `/bmenhance-cr-03-fixer 7-4`，模型 `gpt-5.5`，然后回到 review/evaluate。
5. reviewer 与 evaluator 都通过后，fresh sub-agent 依次执行 `bmenhance-cr-04-rules-extractor`、`bmenhance-cr-05-todo-tracker`、`bmenhance-cr-06-finalizer`。
6. 不在单个 Story 完成后提交；Epic 7 全部 Story 完成后统一执行中文 Conventional Commit，本地提交，不 push。

## Context（上下文）

- Repository: `/Users/fancyliu/Repos/SpecLite`
- Story file: `_bmad-output/implementation-artifacts/stories/7-4-process-governance-coverage-report.md`
- Code review directory: `_bmad-output/implementation-artifacts/code-reviews/7-4-code-review/`
- Epic source: `_bmad-output/planning-artifacts/epics/10-epic-7-post-mvp-governance-expansionpost-mvp-治理扩展.md`
- 当前时间：`2026-06-15 14:57 CST`

## Preflight（前置审计）

- Story `7-4` 存在，状态为 `ready-for-dev`。
- `sprint-status.yaml` 当前记录 `epic-7: in-progress`，`7-1`、`7-2`、`7-3` 均为 `done`，`7-4-process-governance-coverage-report: ready-for-dev`。
- Epic-level predecessor evidence 已存在：`_bmad-output/implementation-artifacts/flow-gates/epic-7-kickoff-gate.md`。
- Story `7-4` 的 scope boundary 明确：不判断文档内容质量、人工 review 是否充分或团队真实执行质量；不新增 Web dashboard、数据库趋势服务、后台 daemon 或 hosted registry UI；不改变 install/status/validate/update 核心契约；不引入第二套 phase、skill、artifact 或 issue identity。
- 当前工作树包含 Story `7-1`、`7-2`、`7-3` 已完成但未提交的改动，以及 Epic 8 既有未追踪文件；后续提交必须白名单暂存，不能使用 `git add -A`。
- 决策：在启动 dev sub-agent 前补齐 `7-4` Story kickoff gate evidence，避免 `bmad-dev-story` 在缺失门禁上 HALT。

## Execution Order（执行顺序）

- [x] 初始化 Story 7-4 code review 目录。
- [x] 创建中文 `PLAN.md`、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md`。
- [x] 生成 `_bmad-output/implementation-artifacts/flow-gates/7-4-process-governance-coverage-report-story-kickoff-gate.md`，结果为 `PASS`。
- [x] Step 1: `/bmad-dev-story story 7-4` 已完成，Story 进入 `review`。
- [x] Step 2: `/bmenhance-cr-01-reviewer 7-4` Round 1 已完成，结论不通过。
- [x] Step 3: `/bmenhance-cr-02-evaluator 7-4` Round 1 已完成，Not Approved。
- [x] Step 4: 执行 `/bmenhance-cr-03-fixer 7-4`，仅修复 evaluator 确认的 P1 阻塞项。
- [x] Step 5: 回到 reviewer/evaluator，Round 2 reviewer 与 evaluator 均已通过。
- [x] Step 6: 通过后执行 04 rules extractor，analysis-only 完成。
- [x] Step 7: 执行 05 todo tracker，确认无需 backlog 变更。
- [x] Step 8: 执行 06 finalizer。
- [x] Step 9: 更新本文件、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md` 为终态。

## Gate（终止条件）

Story `7-4` 只有在以下条件同时满足后才视为本 Story 闭环完成：

- 最新 `bmenhance-cr-01-reviewer` 结论为通过。
- 最新 `bmenhance-cr-02-evaluator` 评估结论为通过 / Approved。
- 如果执行过 fixer，则 fixer 后已重新执行 reviewer 与 evaluator。
- `bmenhance-cr-04-rules-extractor`、`bmenhance-cr-05-todo-tracker`、`bmenhance-cr-06-finalizer` 已按顺序完成。
- 本目录三份进度文件记录终态。

## Kickoff Gate（启动门禁）

Story kickoff gate 已完成并通过：

- File: `_bmad-output/implementation-artifacts/flow-gates/7-4-process-governance-coverage-report-story-kickoff-gate.md`
- Result: `PASS`
- 关键结论：Story `7-4` 已具备进入开发的 contract、functional、evidence anchors；报告必须建立在 manifest/index、phase coverage、validate output 与 workflow artifact contract 上，不能创建第二套 identity 或评价 prose quality。

下一步：启动 fresh dev sub-agent 执行 `/bmad-dev-story story 7-4`。

## Development Result（开发结果）

fresh dev sub-agent 已完成 `/bmad-dev-story story 7-4`：

- Story status: `review`
- Sprint status: `7-4-process-governance-coverage-report: review`
- HALT: 未触发
- Resolver note: 标准 resolver 因系统 `/usr/bin/python3` 缺少 `tomllib` 失败，dev agent 按 fallback 处理。
- Key implementation:
  - 新增只读 CLI：`speclite governance-report [target-directory] [--json]`。
  - 新增 `GovernanceReportData` schema，指标包括 `phaseEntryCoverage`、`artifactPresenceRate`、`validatePassRate`、`openGapCount`。
  - phase gap 复用 phase coverage / canonical target order，并映射为 `menu-target.phase-entry-gap`。
  - artifact 检查拆出复用 helper，只检查 existence、metadata、configured root、default output path，不评价文档质量或人工 review。
  - 新增 owning SPEC 和 how-to 文档，明确趋势、导出、多项目只能基于 MVP matrix 与 validate output 扩展。
- Verification:
  - `npm test -- test/governance-report-command.test.ts`：先红后绿，最终 2 tests passed。
  - `npm test -- test/artifact-metadata.test.ts test/artifact-path-validation.test.ts test/skill-artifact-loop.test.ts test/governance-report-command.test.ts`：通过，4 files / 20 tests。
  - `npm run build`：通过。
  - `npm test`：通过，45 files / 323 tests。
  - `git diff --check`：通过。

下一步：启动 fresh reviewer sub-agent 执行 `/bmenhance-cr-01-reviewer 7-4`。

## Review Round 1（审查第 1 轮）

Reviewer 已生成：

- File: `_bmad-output/implementation-artifacts/code-reviews/7-4-code-review/7-4-code-review-summary-20260615-round-1.md`
- Round: `1`
- Conclusion: 不通过
- Blocking findings: `1`
- Non-blocking findings: `0`
- Internal fallback: 当前 reviewer agent 无可用 Agent 子代理工具，已按 skill 降级为串行审查模式。

主要阻塞项：malformed workflow artifact frontmatter 会让 `governance-report --json` 抛 `YAMLParseError`、stdout 无 `CommandResult`，stderr 泄露本地绝对路径；这违反 AC3、AC5、AC6。

Reviewer 验证：

- `npm test -- test/governance-report-command.test.ts`：通过，1 file / 2 tests。
- `git diff --check`：通过。
- `npm run build`：通过。
- `npm test -- test/artifact-metadata.test.ts test/artifact-path-validation.test.ts test/skill-artifact-loop.test.ts test/governance-report-command.test.ts`：通过，4 files / 20 tests。
- `npm run lint`：仓库未配置 `lint` script，返回失败；不计为 finding。
- `npm test`：通过，45 files / 323 tests。
- malformed frontmatter 定向复现：失败符合 finding。

下一步：启动 fresh evaluator sub-agent 执行 `/bmenhance-cr-02-evaluator 7-4`。

## Evaluation Round 1（评估第 1 轮）

Evaluator 已生成：

- File: `_bmad-output/implementation-artifacts/code-reviews/7-4-code-review/7-4-code-review-evaluation-20260615-round-1.md`
- Round: `1`
- Conclusion: Not Approved
- Need fix: `1`
- Suggested TODO: `0`
- False positives: `0`

修复范围：只处理 malformed Markdown artifact frontmatter 的稳定 issue 映射与 `governance-report --json` contract-first 输出，补 redaction regression test。不得处理 Epic 8 或其他 Story。

下一步：启动 fresh fixer sub-agent 执行 `/bmenhance-cr-03-fixer 7-4`。

## Fix Round 1（修复第 1 轮）

Fixer 已完成：

- Fix items: `1`
- Fixed: Finding #1，malformed YAML frontmatter 现在会返回稳定 `ValidationIssue` / `CommandResult`，并避免 parser message、绝对路径或 raw artifact 内容泄露。
- Fix record: 已追加到 `_bmad-output/implementation-artifacts/code-reviews/7-4-code-review/7-4-code-review-evaluation-20260615-round-1.md`
- Modified files:
  - `src/validation/artifact-paths.ts`
  - `src/validation/rules/artifact-path.ts`
  - `test/governance-report-command.test.ts`
  - `_bmad-output/implementation-artifacts/code-reviews/7-4-code-review/7-4-code-review-evaluation-20260615-round-1.md`
- Verification:
  - `npm test -- governance-report-command`：通过，1 file / 3 tests。
  - `npm run build`：通过。
  - `git diff --check -- src/validation/artifact-paths.ts src/validation/rules/artifact-path.ts test/governance-report-command.test.ts _bmad-output/implementation-artifacts/code-reviews/7-4-code-review/7-4-code-review-evaluation-20260615-round-1.md`：通过。

下一步：重新启动 fresh reviewer sub-agent 执行 `/bmenhance-cr-01-reviewer 7-4` Round 2。

## Review Round 2（审查第 2 轮）

Reviewer 已生成：

- File: `_bmad-output/implementation-artifacts/code-reviews/7-4-code-review/7-4-code-review-summary-20260615-round-2.md`
- Round: `2`
- Conclusion: 通过
- Blocking findings: `0`
- Non-blocking findings: `0`
- Internal fallback: 当前 reviewer agent 无可用 Agent 子代理工具，已按 skill 降级为串行审查模式。
- Verification:
  - `npm test -- governance-report-command`：通过，1 file / 3 tests。
  - `npm run build`：通过。
  - `git diff --check`：通过。
  - `npm run lint`：仓库未配置 `lint` script，返回失败；不计为 finding。
  - `npm test`：通过，45 files / 324 tests。

下一步：启动 fresh evaluator sub-agent 执行 `/bmenhance-cr-02-evaluator 7-4` Round 2。

## Evaluation Round 2（评估第 2 轮）

Evaluator 已生成：

- File: `_bmad-output/implementation-artifacts/code-reviews/7-4-code-review/7-4-code-review-evaluation-20260615-round-2.md`
- Round: `2`
- Conclusion: 通过 / Approved
- Need fix: `0`
- Suggested TODO: `0`
- False positives: `0`
- Next fixer: 不需要
- Verification:
  - `npm test -- governance-report-command`：通过，1 file / 3 tests。

Gate 决策：reviewer Round 2 与 evaluator Round 2 均通过，可以进入 04/05/06 收尾链。

## Rules Extractor（规则提炼）

04 rules extractor 已完成 analysis-only，未修改文件。

- Candidate rules: `1`
- Candidate: `Malformed artifact metadata parse failure 必须进入稳定 ValidationIssue / CommandResult，并覆盖 redaction regression`
- Score: `8/12`
- Suggested destination: `cr-rules-summary.md`
- Suggested TODO: `0`
- User confirmation needed: 需要用户明确确认 `record-only` 后才写入规则总结。

决策：候选规则需要用户确认才能落地；为避免流程挂起，本轮不越权写入 `cr-rules-summary.md`，继续执行 05 TODO Tracker。Round 1 / Round 2 均无非阻塞 TODO，预期 05 无 backlog 变更。

下一步：启动 05 TODO tracker。

## TODO Tracker（TODO 跟踪）

05 TODO tracker 已完成，未修改 `_bmad-output/implementation-artifacts/cr-rules/cr-todo-backlog.md`。

- Added / Updated / Closed TODO: `0 / 0 / 0`
- Story `7-4` related open TODO: `0`
- 注意：现有 `TODO-011` 虽共享 `src/diagnostics/output.ts`，但限定为 `sync` / `uninstall` failure human output，不属于 Story `7-4` 的 `governance-report` scope。

下一步：启动 fresh finalizer sub-agent 执行 `bmenhance-cr-06-finalizer 7-4`。

## Finalizer（最终化）

06 finalizer 已完成。

- Story status: `done`
- Sprint status: `7-4-process-governance-coverage-report: done`
- Epic status: `epic-7` 仍为 `in-progress`，因为 `7-5` 尚未完成。
- Workflow status: 未更新，因为 `_bmad-output/planning-artifacts/bmm-workflow-status.yaml` 不存在；按 skill 默认容错决策跳过。
- Verification:
  - `rg -n ... _bmad-output/implementation-artifacts/stories/7-4-process-governance-coverage-report.md _bmad-output/implementation-artifacts/sprint-status.yaml`：确认状态同步。
  - `find _bmad-output/planning-artifacts -name 'bmm-workflow-status.yaml' -print`：未找到 workflow status 文件。
  - `git diff --check -- _bmad-output/implementation-artifacts/stories/7-4-process-governance-coverage-report.md _bmad-output/implementation-artifacts/sprint-status.yaml`：通过。

Story `7-4` 闭环完成。下一步进入 Story `7-5`；当前不能提交，必须等 Epic 7 全部 Story 完成后统一本地 commit。
