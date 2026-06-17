# PLAN（计划）

## Goal（目标）

针对 Story `8-9-cli-human-output-scan-friendly-layout-and-color` 执行严格串行的开发与 CR 闭环：

1. fresh sub-agent 执行 `/bmad-dev-story story 8-9`。
2. fresh sub-agent 执行 `/bmenhance-cr-01-reviewer 8-9`。
3. fresh sub-agent 执行 `/bmenhance-cr-02-evaluator 8-9`。
4. 如 reviewer 或 evaluator 未通过，fresh sub-agent 执行 `/bmenhance-cr-03-fixer 8-9`，然后回到 reviewer/evaluator。
5. reviewer 与 evaluator 都通过后，fresh sub-agent 依次执行 `bmenhance-cr-04-rules-extractor`、`bmenhance-cr-05-todo-tracker`、`bmenhance-cr-06-finalizer`。
6. Story `8-9` 完成后执行最终验证与中文 Conventional Commit，本地提交，不 push。

## Context（上下文）

- Repository: `/Users/fancyliu/Repos/SpecLite`
- Epic: `8`
- Story file: `_bmad-output/implementation-artifacts/stories/8-9-cli-human-output-scan-friendly-layout-and-color.md`
- Code review directory: `_bmad-output/implementation-artifacts/code-reviews/8-9-code-review/`
- Epic source: `_bmad-output/planning-artifacts/epics/11-epic-8-cli-outcome-oriented-human-output-systemcli-outcome-导向人类输出体系.md`
- 当前时间：`2026-06-17`

## Preflight（前置审计）

- Story `8-9` 存在，状态为 `ready-for-dev`。
- `sprint-status.yaml` 当前记录 `epic-8: in-progress`，`8-9-cli-human-output-scan-friendly-layout-and-color: ready-for-dev`。
- 当前分支为 `main...origin/main`。
- 当前工作树是 mixed 状态，已有大量非 8.9 修改；这些改动不得回滚，也不得在最终提交中被误纳入。
- 当前未发现 Story 8.9 既有 code-review 产物。
- 决策：本次后续提交只暂存 Story 8.9 开发、CR 产物、相关 Story/sprint tracking、必要源码/测试/docs/package 变更；不得使用 `git add -A`。

## Execution Order（执行顺序）

- [x] 初始化 Story 8-9 code review 目录。
- [x] 创建中文 `PLAN.md`、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md`。
- [x] Step 1: `/bmad-dev-story story 8-9`
- [x] Step 2: `/bmenhance-cr-01-reviewer 8-9`
- [x] Step 3: `/bmenhance-cr-02-evaluator 8-9`
- [x] Step 4: 如需修复，执行 `/bmenhance-cr-03-fixer 8-9`
- [x] Step 5: 修复后重新 reviewer/evaluator，直到两者均通过
- [x] Step 6: 通过后执行 04 rules extractor
- [x] Step 7: 执行 05 todo tracker
- [x] Step 8: 执行 06 finalizer
- [x] Step 9: 更新本文件、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md` 为 Story 终态
- [ ] Step 10: 最终验证与本地提交

## Current State（当前状态）

Story `8-9` 已完成开发、CR reviewer/evaluator/fixer 闭环、04 rules extractor、05 TODO tracker 和 06 finalizer。下一步进入最终验证与本地中文 Conventional Commit，不 push。

## Development Result（开发结果）

`2026-06-17` fresh dev sub-agent 执行 `/bmad-dev-story story 8-9` 已完成：

- Story 文件状态：`Status: review`
- Sprint status：`8-9-cli-human-output-scan-friendly-layout-and-color: review`
- 主要修改：
  - install prewrite human output 改为 scan-friendly layout：Summary / Scope / State / Evidence / Issues / Next Actions 使用 bullet、nested bullet、数量和 grouped evidence。
  - 新增 `src/diagnostics/ansi-style.ts`，通过 `picocolors@1.1.1` 实现受控 ANSI helper。
  - `install --yes --interactive` prompt layout 补齐 Step 1/2/3 空行、module name、quick/detailed 对比、localized section label、IDE target directory 和 trailing slash write boundary。
  - 更新 `docs/reference/cli-human-output-matrix.md`、focused tests、`package.json` 和 `package-lock.json`。
- 验证：
  - `npm test -- test/install-outcome-human-output.test.ts test/cli-output-presentation.test.ts test/cli-human-output-matrix.test.ts test/cli-smoke.test.ts test/source-selection.test.ts test/git-source-resolution.test.ts test/cli-message-catalog.test.ts`：通过，63 tests passed。
  - `npm test -- test/status-command.test.ts test/validate-command.test.ts test/update-command.test.ts test/resolve-cli.test.ts`：通过，59 tests passed。
  - `npm run build`：通过。
  - `npm run release:packaging-check`：通过。
  - `git diff --check`：通过。
  - `npm test`：失败；剩余失败集中在当前 mixed worktree 里已有的非 8.9 变更，canonical SDLC skill package roots 从 `44/57` 漂移到 `48/61`，并伴随全量并发下相关 install fixture timeout。
- 遗留风险：full test suite 受非 8.9 mixed worktree 影响未通过；按当前范围不自动修复这些非 8.9 fixture/count 断言。

## Review Round 1（审查第 1 轮）

Reviewer 已生成：

- File: `_bmad-output/implementation-artifacts/code-reviews/8-9-code-review/8-9-code-review-summary-20260617-round-1.md`
- Round: `1`
- Conclusion: 不通过
- Findings: `1`
- 分类：`patch` 1 个；另记录 `defer / 外部阻塞` 的全量测试失败边界
- 严重性：`[中]` 1 个
- Internal fallback: 当前 reviewer agent 无可用 Agent 子代理工具，已按 CR-01 降级为单一 LLM 串行审查。

主要发现：

1. `NO_COLOR` / CI 禁色护栏可被 `options.noColor=false` / `options.ci=false` 绕过；当环境设置 `NO_COLOR=1` 或 CI 时，调用方仍可能强制得到 ANSI 输出，违反 AC 7 / AC 11。

验证：

- Focused layout/color tests、CLI smoke、非 install 回归测试、`npm run build`、`npm run release:packaging-check`、`git diff --check`、dependency/import 边界检查通过。
- `NO_COLOR=1 npm run dev -- install /Users/fancyliu/Repos/noi --locale zh-CN` 通过，无 ANSI。
- 定向 `npx tsx -e '...'` 复现：`NO_COLOR=1` 加 `{ noColor:false, isTty:true, ci:false }` 时仍输出 ANSI。
- `npm test` 未通过，失败集中在 mixed worktree 中非 8.9 的 canonical skill count / fixture count 漂移。

下一步：启动 fresh evaluator sub-agent 执行 `/bmenhance-cr-02-evaluator 8-9`。

## Evaluation Round 1（评估第 1 轮）

Evaluator 已生成：

- File: `_bmad-output/implementation-artifacts/code-reviews/8-9-code-review/8-9-code-review-evaluation-20260617-round-1.md`
- Round: `1`
- Conclusion: `not approved`
- Finding 1：确认有效，非误报，P1，阻塞修复项。
- 阻塞修复项：1。
- 非阻塞 CR TODO：0。
- 误报：0。

Evaluator 决定：

1. `NO_COLOR=1` 与真实 `CI=true` 场景均可通过显式 options 绕过并产生 ANSI，违反 Story AC 7 / AC 11。
2. 修复范围限定在 `src/diagnostics/ansi-style.ts` 的禁色 guard 优先级，以及现有颜色护栏测试附近补 `NO_COLOR + noColor:false`、`CI + ci:false` 回归测试。
3. 非 8.9 的 skill count / fixture count 漂移不计入本 Story 阻塞。

下一步：启动 fresh fixer sub-agent 执行 `/bmenhance-cr-03-fixer 8-9`。

## Fix Round 1（修复第 1 轮）

Fixer 已完成：

- Target evaluation: `_bmad-output/implementation-artifacts/code-reviews/8-9-code-review/8-9-code-review-evaluation-20260617-round-1.md`
- Fix items: 1
- Status: fixed
- Evaluation append: 已追加 `## 修复执行记录`

修复摘要：

1. `src/diagnostics/ansi-style.ts` 调整 `shouldUseAnsi()` 禁色优先级：真实 `NO_COLOR` / `CI` 先于 explicit false options 生效。
2. `test/cli-human-output-matrix.test.ts` 补充强禁色回归：`NO_COLOR=1 + noColor:false`、`CI=true + ci:false`、`options.noColor === true`、`options.ci === true`、`options.isTty === false`，同时保留 TTY positive path。

验证：

- `npx vitest run test/cli-human-output-matrix.test.ts`：通过，1 file / 5 tests。
- `NO_COLOR=1` 最小复现：无 ANSI。
- `CI=true` 最小复现：无 ANSI。

下一步：启动 fresh reviewer sub-agent 执行 `/bmenhance-cr-01-reviewer 8-9` Round 2。

## Review Round 2（审查第 2 轮）

Reviewer 已生成：

- File: `_bmad-output/implementation-artifacts/code-reviews/8-9-code-review/8-9-code-review-summary-20260617-round-2.md`
- Round: `2`
- Conclusion: 通过
- Findings: `0`
- 分类：无阻塞项或中高优先级问题；记录 1 个非 8.9 `defer` 边界
- Internal fallback: 当前 reviewer agent 无可用 Agent 子代理工具，已按 CR-01 降级为单一 LLM 串行复审。

复核结果：

1. Round 1 P1 已修复：`NO_COLOR=1` / `CI=true` 不能再被 explicit false options 绕过。
2. 新增 regression 有效，并保留 TTY positive path。
3. JSON 无 ANSI、dependency/import boundary、install layout 和 interactive prompt 未发现 8.9 范围内的新阻塞回归。
4. full `npm test` 仍受非 8.9 skill count / fixture count 漂移影响失败，继续作为外部边界记录。

验证：

- `npx vitest run test/cli-human-output-matrix.test.ts`：通过，5/5。
- `npm test -- test/install-outcome-human-output.test.ts test/cli-output-presentation.test.ts test/cli-human-output-matrix.test.ts test/cli-smoke.test.ts`：通过，32/32。
- `npm run build`：通过。
- `npm run release:packaging-check`：通过。
- `git diff --check -- <8.9 scoped files>`：通过。
- `npm ls picocolors chalk colorette strip-ansi --depth=0`：通过，仅 `picocolors@1.1.1`。
- `NO_COLOR=1` / `CI=true` 定向复现均无 ANSI；干净 TTY positive path 仍有受控 ANSI。

下一步：启动 fresh evaluator sub-agent 执行 `/bmenhance-cr-02-evaluator 8-9` Round 2。

## Evaluation Round 2（评估第 2 轮）

Evaluator 已生成：

- File: `_bmad-output/implementation-artifacts/code-reviews/8-9-code-review/8-9-code-review-evaluation-20260617-round-2.md`
- Round: `2`
- Conclusion: `Approved`
- Round 1 finding 修复状态：1/1 已修复。
- Round 2 新 findings：0。
- 阻塞修复项：0。
- 非阻塞 CR TODO：0。
- 误报：0。
- Fixer：不需要。

Evaluator 决定：

- Round 1 P1 已关闭。
- Round 2 reviewer 通过结论有效。
- full `npm test` 的非 8.9 count drift 仅作为外部边界记录，不进入本 Story fixer。
- Story 8.9 可进入 CR-04 / CR-05 / CR-06。

下一步：启动 fresh sub-agent 执行 `bmenhance-cr-04-rules-extractor`。

## Rules Extraction（规则提取）

04 rules extractor 已完成：

- File: `_bmad-output/implementation-artifacts/cr-rules/cr-rules-summary.md`
- Candidate rules: 1
- Rule: `CR-API-30` — 环境级 terminal profile 禁色必须优先于显式 false option
- Score: `7/12`
- Destination: `rules-summary`
- 结论：仅更新 CR rules summary；未更新 `_bmad-output/project-context.md`、`CONTEXT.md`、`AGENTS.md`、architecture 文档或源码。

验证：

- `git diff --check -- _bmad-output/implementation-artifacts/cr-rules/cr-rules-summary.md`：通过。

下一步：仍按流程启动 fresh `bmenhance-cr-05-todo-tracker` 做无待办确认。

## TODO Tracker（待办跟踪）

05 TODO tracker 已完成：

- Backlog 文件：`_bmad-output/implementation-artifacts/cr-rules/cr-todo-backlog.md`
- 结论：无需新增或更新 deferred CR TODO backlog。
- Backlog 变更：0。
- 当前 backlog 数量：`open=3`、`in-progress=0`、`resolved=8`。
- Story 8.9 本次新增 TODO：0。
- Story 8.9 本次更新 TODO：0。

下一步：启动 fresh sub-agent 执行 `bmenhance-cr-06-finalizer`。

## Finalizer（最终收口）

06 finalizer 已完成：

- Story 文件：`_bmad-output/implementation-artifacts/stories/8-9-cli-human-output-scan-friendly-layout-and-color.md`
  - `Status: review` -> `Status: done`
- Sprint status：`_bmad-output/implementation-artifacts/sprint-status.yaml`
  - `last_updated` -> `2026-06-17 17:10 CST`
  - `8-9-cli-human-output-scan-friendly-layout-and-color: done`
  - `epic-8: done`
- `_bmad-output/planning-artifacts/bmm-workflow-status.yaml` 不存在，按 CR-06 容错规则跳过，未新建文件。

验证：

- 最新 evaluation 确认为 `Approved`。
- Story 8.9、`sprint-status.yaml` 中 8.9 与 `epic-8` 均为 `done`。
- `sprint-status.yaml` YAML parse 通过。
- `git diff --check -- <finalizer scoped files>`：通过。

下一步：最终验证、白名单暂存、本地中文 Conventional Commit，不 push。

## Termination Criteria（终止条件）

- Story 8.9 开发完成，并进入可审查状态。
- 最新 CR reviewer 通过。
- 最新 CR evaluator Approved。
- 如有 fixer，fixer 后已重新 reviewer/evaluator。
- 04 rules extractor、05 TODO tracker、06 finalizer 已按顺序完成。
- 三份进度文件已更新。
- 最终提交只包含本次 Story 8.9 开发与 CR 闭环相关变更，且未 push。
