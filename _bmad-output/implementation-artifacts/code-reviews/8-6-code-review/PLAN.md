# PLAN

## Goal（目标）

针对 Story `8-6-localized-next-actions-and-message-catalog` 执行严格串行的开发与 CR 闭环：

1. fresh sub-agent 执行 `/bmad-dev-story story 8-6`。
2. fresh sub-agent 执行 `/bmenhance-cr-01-reviewer 8-6`。
3. fresh sub-agent 执行 `/bmenhance-cr-02-evaluator 8-6`。
4. 如 reviewer 或 evaluator 未通过，fresh sub-agent 执行 `/bmenhance-cr-03-fixer 8-6`，然后回到 reviewer/evaluator。
5. reviewer 与 evaluator 都通过后，fresh sub-agent 依次执行 `bmenhance-cr-04-rules-extractor`、`bmenhance-cr-05-todo-tracker`、`bmenhance-cr-06-finalizer`。
6. 当前 Story 完成后才进入 Story `8-7`。
7. 所有 Epic 8 Story 完成后，使用 `git-commit-convention` 做中文 Conventional Commit，本地提交，不 push。

## Context（上下文）

- Repository: `/Users/fancyliu/Repos/SpecLite`
- Epic: `8`
- Story file: `_bmad-output/implementation-artifacts/stories/8-6-localized-next-actions-and-message-catalog.md`
- Code review directory: `_bmad-output/implementation-artifacts/code-reviews/8-6-code-review/`
- Epic source: `_bmad-output/planning-artifacts/epics/11-epic-8-cli-outcome-oriented-human-output-systemcli-outcome-导向人类输出体系.md`
- 当前时间：`2026-06-16 04:57 CST`

## Epic Story Order（Epic Story 顺序）

1. `8-1-shared-cli-outcome-and-presentation-contract`：done
2. `8-2-install-outcome-oriented-output`：done
3. `8-3-update-and-repair-outcome-oriented-output`：done
4. `8-4-status-and-validate-human-output-separation`：done
5. `8-5-resolve-command-support-output`：done
6. `8-6-localized-next-actions-and-message-catalog`：当前 Story
7. `8-7-human-output-fixture-and-documentation-matrix`

## Preflight（前置审计）

- Story `8-6` 存在，状态为 `ready-for-dev`。
- `sprint-status.yaml` 当前记录 `epic-8: in-progress`。
- `8-1` 到 `8-5` 已为 `done`；`8-6` 为下一个 `ready-for-dev` Story。
- `8-7` 仍为 `ready-for-dev`，不得提前启动。
- 当前分支为 `main...origin/main [ahead 1]`；ahead 1 是上一轮 Epic 8 SR 本地提交。
- 当前工作树已有 Story 8.1 到 8.5 开发与 CR closeout 相关改动；这些是本 Epic 8 目标的一部分，不得回滚。
- 当前未发现 Story 8.6 既有 code-review 产物。
- `_bmad-output/planning-artifacts/bmm-workflow-status.yaml` 不存在，finalizer 阶段应跳过该同步文件并记录。
- 决策：后续提交只暂存本次 Epic 8 Story 开发与 CR 闭环相关文件；不得使用 `git add -A` 或把无关文件带入提交。

## Execution Order（执行顺序）

- [x] 初始化 Story 8-6 code review 目录。
- [x] 创建中文 `PLAN.md`、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md`。
- [x] Step 1: `/bmad-dev-story story 8-6`
- [x] Step 2: `/bmenhance-cr-01-reviewer 8-6`
- [x] Step 3: `/bmenhance-cr-02-evaluator 8-6`
- [x] Step 4: 如需修复，执行 `/bmenhance-cr-03-fixer 8-6`
- [x] Step 5: 修复后重新 reviewer/evaluator，直到两者均通过
- [x] Step 6: 通过后执行 04 rules extractor
- [x] Step 7: 执行 05 todo tracker
- [x] Step 8: 执行 06 finalizer
- [x] Step 9: 更新本文件、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md` 为 Story 终态

## Current State（当前状态）

当前 Story `8-6` 已完成全部开发与 CR closeout。Story 状态为 `done`，`sprint-status.yaml` 中 `8-6-localized-next-actions-and-message-catalog: done`。Epic 8 仍为 `in-progress`，因为 `8-7` 仍为 `ready-for-dev`。下一步进入 Story `8-7-human-output-fixture-and-documentation-matrix`。

## Development Result（开发结果）

`2026-06-16` fresh dev sub-agent 执行 `/bmad-dev-story story 8-6` 已完成：

- Story 文件状态：`Status: review`
- Sprint status：`8-6-localized-next-actions-and-message-catalog: review`
- 修改文件：
  - `_bmad-output/implementation-artifacts/stories/8-6-localized-next-actions-and-message-catalog.md`
  - `_bmad-output/implementation-artifacts/sprint-status.yaml`
  - `src/cli/messages.ts`
  - `src/diagnostics/output.ts`
  - `src/bin/speclite.ts`
  - `src/commands/resolve.ts`
  - `test/cli-message-catalog.test.ts`
  - `test/cli-output-presentation.test.ts`
  - `test/fixture-release-gates.test.ts`
  - `test/install-progress-ready-summary.test.ts`
  - `test/resolve-cli.test.ts`
  - `test/source-selection.test.ts`
  - `test/status-command.test.ts`
  - `test/target-directory.test.ts`
  - `test/update-command.test.ts`
  - `test/validate-command.test.ts`
- 实现摘要：
  - `src/cli/messages.ts` 扩展为 command output catalog，默认 `zh-CN`，支持 `en-US` fallback。
  - Human renderers 默认中文输出，`CommandResult` JSON 不变。
  - Next Actions 改为本地化 builder，默认中文不透传内部英文 `nextActions`，保留 command/flag/path/id 等英文技术标识。
  - Command suggestions 包含实际 target 或 `<target>` 占位，并按 blocker 修复、授权写入、validate/status 复查排序。
  - Issue human `suggestedNextStep` 可本地化，并保留 `issueId`、`affectedPath`、reason code。
  - `update/status/validate/resolve` 支持 `--locale` 或 `SPECLITE_LOCALE` human output；`--json` 不受 locale 影响。
- 验证：
  - `npm test -- test/cli-message-catalog.test.ts`：先 RED 4 failed，修复后 4 passed。
  - `npm test -- test/cli-message-catalog.test.ts test/cli-smoke.test.ts test/install-outcome-human-output.test.ts test/status-command.test.ts test/validate-command.test.ts test/update-command.test.ts test/resolve-cli.test.ts`：通过，80 tests。
  - `npm run build`：通过。
  - `npm test`：通过，50 files / 360 tests。
  - `git diff --check`：通过。
- Build side effect：`release/packaging-manifest.json` 曾出现 `packageHash` drift，已精确恢复，当前该文件无 diff。
- HALT / 遗留风险：无。

下一步：启动 fresh reviewer sub-agent 执行 `/bmenhance-cr-01-reviewer 8-6`。

## Review Round 1（审查第 1 轮）

Reviewer 已生成：

- File: `_bmad-output/implementation-artifacts/code-reviews/8-6-code-review/8-6-code-review-summary-20260616-round-1.md`
- Round: `1`
- Conclusion: 不通过
- Findings: `1`
- 分类：`patch` 1 个
- 严重性：`[高]` 1 个
- Internal fallback: 当前 reviewer agent 无可用 Agent 子代理工具，已按 CR-01 降级为当前模型串行三层视角审查。

主要发现：

1. 默认 `zh-CN` human output 仍直接展示英文自然语言，包括 `CommandResult.summary` 和 renderer 中硬编码的英文说明；这不是 command、flag、path、id 等应保留英文的技术标识。

验证：

- `npm test -- test/cli-message-catalog.test.ts test/cli-output-presentation.test.ts test/status-command.test.ts test/validate-command.test.ts test/update-command.test.ts test/resolve-cli.test.ts`：通过，6 files / 69 tests。
- `npm run build`：通过。
- `npm test`：通过，50 files / 360 tests。
- `git diff --check`：通过。
- 定向复现确认默认 `zh-CN` 的 `status`、`validate`、`resolve --human` 仍输出英文自然语言。
- `release/packaging-manifest.json` 的 build hash drift 已精确恢复，当前无 diff。

下一步：启动 fresh evaluator sub-agent 执行 `/bmenhance-cr-02-evaluator 8-6`。

## Evaluation Round 1（评估第 1 轮）

Evaluator 已生成：

- File: `_bmad-output/implementation-artifacts/code-reviews/8-6-code-review/8-6-code-review-evaluation-20260616-round-1.md`
- Round: `1`
- Conclusion: `not approved`
- Finding 1：确认有效，非误报。
- 评估后优先级：P1。
- CR TODO：0。
- 误报：0。

Evaluator 决定：

1. 默认 `zh-CN` human output 中的 `CommandResult.summary` 英文句子、`Command status`、`Output profile`、`requested key`、`machine contract` 等属于 human-readable prose / label，不是必须保留英文的技术标识。
2. 应保留英文的是 command、flag、path、issue id、reason code、schema id、JSON field、enum value 等技术标识。
3. 该问题直接违反 AC1，影响 `status`、`validate`、`resolve --human` 等默认 human output，需要 CR-03 fixer。
4. 修复方向应聚焦 human output catalog 与 renderer 消费路径，将 human-only summary、state/evidence label、resolve human bullets 纳入 catalog，或用 catalog summary 替代 `CommandResult.summary` 的英文句子。

下一步：启动 fresh fixer sub-agent 执行 `/bmenhance-cr-03-fixer 8-6`。

## Fix Round 1（修复第 1 轮）

Fixer 已完成：

- Target evaluation: `_bmad-output/implementation-artifacts/code-reviews/8-6-code-review/8-6-code-review-evaluation-20260616-round-1.md`
- Fix items: 1
- Status: fixed
- Evaluation append: 已追加 `## 修复执行记录`

修复摘要：

1. 默认 `zh-CN` human output 不再直接展示英文 `CommandResult.summary`。
2. `status`、`validate`、`update`、`resolve --human` 的 Summary / Scope / State / Evidence / Issues / Next Actions 中的 human label 和说明句改为 catalog/locale-aware 输出。
3. 保留 command、flag、path、issue id、reason code、schema id、JSON field、enum value 等英文技术标识。
4. 补充默认 `zh-CN` 回归测试，用 deny-list 捕捉已知英文 prose，同时 whitelist 技术标识。
5. `Issues` human 输出中默认 `zh-CN` 的 `impact` / `manualAction` prose 也改为中文 catalog 文案；JSON contract 未改。

修改文件：

- `src/cli/messages.ts`
- `src/diagnostics/output.ts`
- `src/commands/resolve.ts`
- `test/cli-message-catalog.test.ts`
- `test/cli-output-presentation.test.ts`
- `test/update-command.test.ts`
- `test/validate-command.test.ts`
- `test/fixture-release-gates.test.ts`
- `test/update-planning.test.ts`
- `test/source-descriptor-trust-reporting.test.ts`
- `test/story-6-4-path-portability.test.ts`
- `_bmad-output/implementation-artifacts/code-reviews/8-6-code-review/8-6-code-review-evaluation-20260616-round-1.md`

验证：

- `npm test -- test/cli-message-catalog.test.ts`：通过，5 / 5。
- `npm test -- test/cli-message-catalog.test.ts test/cli-output-presentation.test.ts test/status-command.test.ts test/validate-command.test.ts test/update-command.test.ts test/resolve-cli.test.ts`：通过，70 / 70。
- `npm run build`：通过。
- `npm test`：通过，50 files / 361 tests。
- `git diff --check`：通过。
- `release/packaging-manifest.json` 的 build/full-test hash drift 已精确恢复，当前无 diff。

下一步：启动 fresh reviewer sub-agent 执行 `/bmenhance-cr-01-reviewer 8-6` Round 2。

## Review Round 2（审查第 2 轮）

Reviewer 已生成：

- File: `_bmad-output/implementation-artifacts/code-reviews/8-6-code-review/8-6-code-review-summary-20260616-round-2.md`
- Round: `2`
- Conclusion: 不通过
- Findings: `1`
- 分类：`patch` 1 个
- 严重性：`[高]` 1 个
- 新发现：0

主要发现：

1. Round 1 finding 在 `status`、`validate`、`update` 默认 `zh-CN` human output 中基本修复，但 `resolve --human` 默认中文仍残留英文 human label/prose，例如 `source path：`、`source paths：`、`fallback source：`，以及 invalid/warning issue 中直接输出英文 `issue.impact`。

验证：

- `npm test -- test/cli-message-catalog.test.ts test/cli-output-presentation.test.ts test/status-command.test.ts test/validate-command.test.ts test/update-command.test.ts test/resolve-cli.test.ts`：通过，6 files / 70 tests。
- `npm run build`：通过。
- `npm test`：通过，50 files / 361 tests。
- `git diff --check`：通过。
- 定向复现确认 `status` / `validate` / `update --dry-run` 默认中文未复现 Round 1 旧英文句子，但 `resolve --human` 默认中文仍复现上述残留。
- `release/packaging-manifest.json` 的 full-test hash drift 已精确恢复，当前无 diff。

下一步：启动 fresh evaluator sub-agent 执行 `/bmenhance-cr-02-evaluator 8-6` Round 2。

## Evaluation Round 2（评估第 2 轮）

Evaluator 已生成：

- File: `_bmad-output/implementation-artifacts/code-reviews/8-6-code-review/8-6-code-review-evaluation-20260616-round-2.md`
- Round: `2`
- Conclusion: `not approved`
- Finding 1：确认有效，非误报。
- 评估后优先级：P1。
- CR TODO：0。
- 误报：0。
- 是否需要 fixer：需要。

Evaluator 决定：

1. `source path`、`source paths`、`fallback source` 是默认中文 human output 中的 human label，应本地化，不属于必须保留英文的技术标识。
2. `issue.impact` 当前直接输出英文 prose，应由 catalog / locale-aware formatter 输出中文，同时保留 `issueId`、`affectedPath`、reason/status code、path 等技术标识。
3. 第二轮 fixer 应只修复 `resolve --human` 默认 `zh-CN` 残留范围，并补充覆盖中文冒号形式和 resolver issue prose 的 focused regression tests。

下一步：启动 fresh fixer sub-agent 执行 `/bmenhance-cr-03-fixer 8-6` Round 2。

## Fix Round 2（修复第 2 轮）

Fixer 已完成：

- Target evaluation: `_bmad-output/implementation-artifacts/code-reviews/8-6-code-review/8-6-code-review-evaluation-20260616-round-2.md`
- Fix items: 1
- Status: fixed
- Evaluation append: 已追加 `## 修复执行记录`

修复摘要：

1. 默认 `zh-CN` catalog 中 `resolveSourcePath`、`resolveSourcePaths`、`resolveFallbackSource` 的 human label 改为中文文案，避免输出 `source path：`、`source paths：`、`fallback source：`。
2. `formatResolveHumanIssues()` 的默认 `zh-CN` issue formatter 不再直接输出英文 `issue.impact`，改为 catalog 中文 impact summary。
3. 默认 `zh-CN` issue 行继续保留 `severity`、`category`、`issueId`、`affectedPath`、`details.status`、`details.layerKind`、`details.layerRole` 等技术标识。
4. 新增 focused regression test，覆盖中文冒号形式和 resolver invalid/warning issue 英文 prose。

修改文件：

- `src/cli/messages.ts`
- `src/commands/resolve.ts`
- `test/cli-message-catalog.test.ts`
- `_bmad-output/implementation-artifacts/code-reviews/8-6-code-review/8-6-code-review-evaluation-20260616-round-2.md`

验证：

- `npm test -- test/cli-message-catalog.test.ts`：通过，6 tests。
- `npm test -- test/cli-message-catalog.test.ts test/resolve-cli.test.ts`：通过，21 tests。
- `npm run build`：通过。
- `npm test`：通过，50 files / 362 tests。
- `git diff --check`：通过。
- `release/packaging-manifest.json` 的 full-test hash drift 已精确恢复，当前无 diff。

下一步：启动 fresh reviewer sub-agent 执行 `/bmenhance-cr-01-reviewer 8-6` Round 3。

## Review Round 3（审查第 3 轮）

Reviewer 已生成：

- File: `_bmad-output/implementation-artifacts/code-reviews/8-6-code-review/8-6-code-review-summary-20260616-round-3.md`
- Round: `3`
- Conclusion: 不通过
- Findings: `1`
- 分类：`patch` 1 个
- 严重性：`[高]` 1 个
- 新发现：0，归类为 Round 1 broad finding 遗留。

主要发现：

1. Round 2 的 `resolve --human` 默认中文残留已确认修复；`status`、`validate`、`update`、`resolve --human` 重点路径通过复核。但默认 `zh-CN` 的 `install` human output 仍输出英文 prose/label，例如 `Target: ... Directory state...`、`Completed steps:`、`Pending steps:`、`Source`、`External Access`、`Authorization`。

验证：

- `npm test -- test/cli-message-catalog.test.ts test/resolve-cli.test.ts`：通过，21 tests。
- `npm test -- test/cli-message-catalog.test.ts test/cli-output-presentation.test.ts test/status-command.test.ts test/validate-command.test.ts test/update-command.test.ts test/resolve-cli.test.ts`：通过，71 tests。
- `npm run build`：通过。
- `npm test`：通过，50 files / 362 tests。
- `git diff --check`：通过。
- `release/packaging-manifest.json` 的 full-test hash drift 已精确恢复，当前无 diff。

下一步：启动 fresh evaluator sub-agent 执行 `/bmenhance-cr-02-evaluator 8-6` Round 3。

## Evaluation Round 3（评估第 3 轮）

Evaluator 已生成：

- File: `_bmad-output/implementation-artifacts/code-reviews/8-6-code-review/8-6-code-review-evaluation-20260616-round-3.md`
- Round: `3`
- Conclusion: `not approved`
- Finding 1：确认有效，非误报。
- 评估后优先级：P1。
- CR TODO：0。
- 误报：0。
- 是否需要 fixer：需要。

Evaluator 决定：

1. 默认 `zh-CN` `install` human output 中 `Target: ... Directory state...`、`Completed steps:`、`Pending steps:`、`IDE target statuses:`、`Source`、`External Access`、`Authorization` 等属于 human prose/label，应纳入 catalog 或 locale-aware formatter。
2. 应保留英文的技术标识包括 `targetProject`、`projectRoot`、`manifestVersion`、`completedSteps`、`pendingSteps`、path/status code、source descriptor fields、step id、command/flag、issue id、schema/JSON field 等。
3. 第三轮 fixer 应聚焦 install target summary、step state label、IDE target label、Source / External Access / Authorization、ready summary label，并补充默认 `zh-CN` install regression tests。

下一步：启动 fresh fixer sub-agent 执行 `/bmenhance-cr-03-fixer 8-6` Round 3。

## Fix Round 3（修复第 3 轮）

Fixer 已完成：

- Target evaluation: `_bmad-output/implementation-artifacts/code-reviews/8-6-code-review/8-6-code-review-evaluation-20260616-round-3.md`
- Fix items: 1
- Status: fixed
- Evaluation append: 已追加 `## 修复执行记录`

修复摘要：

1. 默认 `zh-CN` 的 `renderInstallHumanOutput()` 不再直通英文 `result.summary`；改为输出本地化 outcome summary、`目标项目` 与 `项目根目录`。
2. Install State / Evidence / Authorization 使用 catalog label：`已完成 steps`、`待处理 steps`、`IDE 目标状态`、`来源`、`外部访问`、`授权状态`。
3. Install ready summary 默认中文改为 `目标项目`、`安装位置`、`manifest version`、`关键路径`、`已完成 steps`、`已安装 modules`、`IDE 目标`、`来源`、`外部访问`、`授权状态`。
4. 保留 `targetProject=`、`projectRoot=`、`manifestVersion=`、`completedSteps=`、`pendingSteps=`、path/display path、source descriptor fields、step id、IDE target id/status code、command/flag 等技术标识。
5. 补充默认 `zh-CN` install regression，覆盖 prewrite 与 ready summary 代表路径。

修改文件：

- `src/cli/messages.ts`
- `src/diagnostics/output.ts`
- `test/cli-message-catalog.test.ts`
- `test/install-progress-ready-summary.test.ts`
- `test/source-selection.test.ts`
- `test/cli-smoke.test.ts`
- `_bmad-output/implementation-artifacts/code-reviews/8-6-code-review/8-6-code-review-evaluation-20260616-round-3.md`

验证：

- `npm test -- test/cli-message-catalog.test.ts test/install-progress-ready-summary.test.ts test/source-selection.test.ts`：通过，3 files / 27 tests。
- `npm test -- test/target-directory.test.ts test/cli-smoke.test.ts`：通过，2 files / 26 tests。
- `npm run build`：通过。
- `npm test`：通过，50 files / 363 tests。
- `git diff --check`：通过。
- `release/packaging-manifest.json` 的 full-test hash drift 已精确恢复，当前无 diff。

下一步：启动 fresh reviewer sub-agent 执行 `/bmenhance-cr-01-reviewer 8-6` Round 4。

## Review Round 4（审查第 4 轮）

Reviewer 已生成：

- File: `_bmad-output/implementation-artifacts/code-reviews/8-6-code-review/8-6-code-review-summary-20260616-round-4.md`
- Round: `4`
- Conclusion: 通过
- Findings: `0`
- 分类：`decision_needed=0`、`patch=0`、`defer=0`、`dismiss=0`

复核结果：

1. Round 3 install 默认中文 prose/label 残留已修复。
2. Round 2 `resolve --human` 默认中文 label/prose 修复持续有效。
3. Round 1 `status`、`validate`、`update`、`resolve --human` 默认中文路径未发现英文自然语言 prose/label 回归。
4. 英文 fallback 保持可用。
5. `CommandResult` JSON、exit code、issue ordering、path normalization、默认 resolve machine mode、`--json` output 未发现 locale 相关回归。

验证：

- `npm test -- test/cli-message-catalog.test.ts test/install-progress-ready-summary.test.ts test/source-selection.test.ts`：通过，3 files / 27 tests。
- `npm test -- test/cli-message-catalog.test.ts test/cli-output-presentation.test.ts test/status-command.test.ts test/validate-command.test.ts test/update-command.test.ts test/resolve-cli.test.ts`：通过，6 files / 72 tests。
- `npm run build`：通过。
- `npm test`：通过，50 files / 363 tests。
- `git diff --check`：通过。
- `npm run lint` 未执行，`package.json` 没有 `lint` script。
- `release/packaging-manifest.json` 的 full-test hash drift 已精确恢复，当前无 diff。

下一步：启动 fresh evaluator sub-agent 执行 `/bmenhance-cr-02-evaluator 8-6` Round 4。

## Evaluation Round 4（评估第 4 轮）

Evaluator 已生成：

- File: `_bmad-output/implementation-artifacts/code-reviews/8-6-code-review/8-6-code-review-evaluation-20260616-round-4.md`
- Round: `4`
- Conclusion: Approved
- approved: `true`
- CR TODO：0
- 误报：0
- 是否需要 fixer：否

评估确认：

1. Round 4 reviewer 结论可信，findings 0。
2. Round 3 install 默认中文 prose/label 残留已关闭。
3. Round 2 `resolve --human` 默认中文 label/prose 修复持续有效。
4. Round 1 broad finding 在当前复核范围内未见回归。
5. 英文 fallback、`CommandResult` JSON、exit code、issue ordering、path normalization、默认 resolve machine mode 与 `--json` output 未发现 locale 相关回归。

下一步：启动 fresh sub-agent 执行 `bmenhance-cr-04-rules-extractor`。

## Rules Extraction（规则提取）

04 rules extractor 已生成：

- File: `_bmad-output/implementation-artifacts/code-reviews/8-6-code-review/8-6-cr-rules-extraction-20260616.md`
- Candidate: `CAND-CR-API-8-6-01`
- 主题：默认 `zh-CN` human output 的自然语言必须由 catalog 覆盖完整 renderer family。
- 晋升判定：`9/12`，达到全局文档建议阈值。
- 全局 / 项目级规则文档更新：无；规则提取总结建议后续确认后写入 `_bmad-output/project-context.md` 或 `cr-rules-summary.md`。
- 05 TODO handoff：无需处理；Round 1-4 均无 CR TODO，问题已在 Round 4 关闭。

下一步：启动 fresh sub-agent 执行 `bmenhance-cr-05-todo-tracker` 做无待办确认。

## TODO Tracking（待办跟踪）

05 TODO tracker 已完成：

- Backlog file: `_bmad-output/implementation-artifacts/cr-rules/cr-todo-backlog.md`
- 新增 / 更新 TODO：0
- Backlog 变更：0
- 后续处理：无需 CR TODO backlog 后续处理。
- 说明：`CAND-CR-API-8-6-01` 后续是否采纳到项目级规则文档需要另行确认，不应进入 `cr-todo-backlog.md`。

下一步：启动 fresh sub-agent 执行 `bmenhance-cr-06-finalizer`。

## Finalization（最终收口）

06 finalizer 已完成：

- Story file: `_bmad-output/implementation-artifacts/stories/8-6-localized-next-actions-and-message-catalog.md`
- Story status: `done`
- Sprint file: `_bmad-output/implementation-artifacts/sprint-status.yaml`
- Sprint status: `8-6-localized-next-actions-and-message-catalog: done`
- `last_updated`: `2026-06-16 06:46 CST`
- Epic 8 status: 保持 `in-progress`，因为 `8-7` 仍为 `ready-for-dev`。
- Skipped tracking: `_bmad-output/planning-artifacts/bmm-workflow-status.yaml` 不存在，已跳过且未创建。

Finalizer 检查：

- Latest review summary: Round 4 通过，findings 0。
- Latest evaluation: Round 4 Approved，CR TODO 0，误报 0，不需要 fixer。
- 04 rules extraction: `CAND-CR-API-8-6-01`，9/12，未更新全局规则。
- 05 TODO tracker: backlog 变更 0。
- `git diff --check -- <两个修改文件>` 通过。

## Terminal State（终态）

Story `8-6-localized-next-actions-and-message-catalog` 已完成。下一步只能进入 Story `8-7-human-output-fixture-and-documentation-matrix` 的 fresh dev sub-agent。

## Gate（终止条件）

Story `8-6` 只有在以下条件同时满足后才视为本 Story 闭环完成：

- 开发完成，Story 状态进入 `review`。
- 最新 `bmenhance-cr-01-reviewer` 结论为通过。
- 最新 `bmenhance-cr-02-evaluator` 评估结论为通过 / Approved。
- 如果执行过 fixer，则 fixer 后已重新执行 reviewer 与 evaluator。
- `bmenhance-cr-04-rules-extractor`、`bmenhance-cr-05-todo-tracker`、`bmenhance-cr-06-finalizer` 已按顺序完成。
- 本目录三份进度文件记录终态。

## Resume Criteria（续跑条件）

- 若只有三份进度文件，无开发结果：从 `/bmad-dev-story story 8-6` 恢复。
- 若 Story 状态为 `review` 且无 CR summary：从 `/bmenhance-cr-01-reviewer 8-6` 恢复。
- 若存在最新 CR summary 但无对应 evaluation：从 `/bmenhance-cr-02-evaluator 8-6` 恢复。
- 若最新 evaluation 要求修复：从 `/bmenhance-cr-03-fixer 8-6` 恢复。
- 若 reviewer/evaluator 均通过但未 closeout：从 04/05/06 顺序恢复。
