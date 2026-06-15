# EXPERIMENTS

## 2026-06-16 04:57 CST — Attempt 1

- **Story**: `8-6-localized-next-actions-and-message-catalog`
- **方案**: 按 `goal-orchestrator-epic-story-code-review-runner` 启动 Story 8.6 严格串行闭环，先初始化 code review 目录与三份中文进度文件，再启动 fresh dev sub-agent。
- **选择原因**: Story 8.5 已完成 04/05/06 并标记 `done`；Epic 8 下一个 `ready-for-dev` Story 是 8.6。按 orchestrator 要求，当前 Story 完成后才能进入下一个 Story。
- **前置结果**:
  - Story 文件存在，状态为 `ready-for-dev`。
  - `sprint-status.yaml` 中 `8-6-localized-next-actions-and-message-catalog: ready-for-dev`。
  - `8-1` 到 `8-5` 已为 `done`。
  - `epic-8` 仍为 `in-progress`。
  - 当前工作树已有 Story 8.1 到 8.5 目标内改动，属于本 Epic 8 目标范围。
  - 未发现 Story 8.6 既有 code-review 产物。
- **当前结果**: 已创建本目录与三份初始进度文件。
- **下一步判断**: 启动 fresh dev sub-agent 执行 `/bmad-dev-story story 8-6`。

## 2026-06-16 — Attempt 2

- **Story**: `8-6-localized-next-actions-and-message-catalog`
- **方案**: 启动 fresh dev sub-agent 执行 `/bmad-dev-story story 8-6`。
- **选择原因**: Story 8.6 为当前 Epic 8 顺序中的下一个 `ready-for-dev` Story，且 code-review 进度文件已初始化。按 orchestrator 流程必须先完成开发，不能直接进入 CR。
- **执行结果**: 开发完成，Story 进入 `review`。
- **主要修改范围**:
  - `src/cli/messages.ts`：扩展为 `zh-CN` 默认与 `en-US` fallback 的 command output catalog。
  - `src/diagnostics/output.ts`：human renderers 消费 localized catalog，并本地化 Next Actions。
  - `src/bin/speclite.ts`、`src/commands/resolve.ts`：为相关 human output 路径传播 `--locale` / `SPECLITE_LOCALE`。
  - `test/cli-message-catalog.test.ts` 与多组现有 CLI tests：覆盖默认中文、英文 fallback、JSON parity、technical identifiers 与旧英文 fallback 兼容。
  - Story 文件与 `sprint-status.yaml`：记录 Story 8.6 完成开发并进入 `review`。
- **验证结果**:
  - `npm test -- test/cli-message-catalog.test.ts`：先 RED 4 failed，修复后 4 passed。
  - `npm test -- test/cli-message-catalog.test.ts test/cli-smoke.test.ts test/install-outcome-human-output.test.ts test/status-command.test.ts test/validate-command.test.ts test/update-command.test.ts test/resolve-cli.test.ts`：通过，80 tests。
  - `npm run build`：通过。
  - `npm test`：通过，50 files / 360 tests。
  - `git diff --check`：通过。
- **Build side effect**: `release/packaging-manifest.json` build hash drift 已恢复，当前无 diff。
- **HALT / 遗留风险**: 无。
- **下一步判断**: 启动 fresh reviewer sub-agent 执行 `/bmenhance-cr-01-reviewer 8-6`。

## 2026-06-16 — Attempt 3

- **Story**: `8-6-localized-next-actions-and-message-catalog`
- **方案**: 启动 fresh reviewer sub-agent 执行 `/bmenhance-cr-01-reviewer 8-6`。
- **选择原因**: Story 已进入 `review`，按用户流程必须先审查，不能直接进入 evaluator 或 fixer。
- **执行结果**: Round 1 review 完成，结论不通过。
- **输出文件**: `_bmad-output/implementation-artifacts/code-reviews/8-6-code-review/8-6-code-review-summary-20260616-round-1.md`
- **发现摘要**:
  - Finding 1：默认 `zh-CN` human output 仍直接展示英文自然语言，包括 `CommandResult.summary` 和 renderer 中硬编码英文说明，阻塞 AC1。
- **分类 / 严重性**: `patch` 1 个，`[高]` 1 个。
- **验证证据**:
  - Focused locale/output tests 通过。
  - `npm run build` 通过。
  - `npm test` 通过，50 files / 360 tests。
  - `git diff --check` 通过。
  - 定向复现确认默认 `zh-CN` 的 `status`、`validate`、`resolve --human` 仍输出英文自然语言。
- **Build side effect**: `release/packaging-manifest.json` build hash drift 已恢复，当前无 diff。
- **下一步判断**: 启动 fresh evaluator sub-agent 执行 `/bmenhance-cr-02-evaluator 8-6`，独立评估 review finding。

## 2026-06-16 — Attempt 4

- **Story**: `8-6-localized-next-actions-and-message-catalog`
- **方案**: 启动 fresh evaluator sub-agent 执行 `/bmenhance-cr-02-evaluator 8-6`，只评估最新 CR summary，不修改代码、测试、Story、sprint status 或进度文件。
- **选择原因**: Reviewer Round 1 未通过，按 CR 闭环必须先由 evaluator 判定 finding 是否有效、是否阻塞、是否需要 fixer。
- **执行结果**: Evaluator Round 1 完成，结论 `not approved`。
- **输出文件**: `_bmad-output/implementation-artifacts/code-reviews/8-6-code-review/8-6-code-review-evaluation-20260616-round-1.md`
- **评估摘要**:
  - Finding 1 确认有效，非误报。
  - 严重性保持 P1，阻塞交付。
  - 默认 `zh-CN` human output 中的英文 summary/prose/label 不属于应保留的技术标识。
  - CR TODO 数量为 0，误报数量为 0。
- **下一步判断**: 启动 fresh fixer sub-agent 执行 `/bmenhance-cr-03-fixer 8-6`；修复后必须重新执行 reviewer/evaluator。

## 2026-06-16 — Attempt 5

- **Story**: `8-6-localized-next-actions-and-message-catalog`
- **方案**: 启动 fresh fixer sub-agent 执行 `/bmenhance-cr-03-fixer 8-6`，只修复 Evaluation Round 1 确认的 P1 finding。
- **选择原因**: Evaluator 已判定 finding 有效且阻塞交付，按 CR 闭环必须先修复，再重新 reviewer/evaluator。
- **执行结果**: Fixer Round 1 完成，finding 标记为 fixed，并在 evaluation 文件末尾追加 `## 修复执行记录`。
- **修复摘要**:
  - 默认 `zh-CN` human output 不再直接展示英文 `CommandResult.summary`。
  - `status`、`validate`、`update`、`resolve --human` 的 human label 和说明句改为 catalog/locale-aware 输出。
  - 保留 command、flag、path、issue id、reason code、schema id、JSON field、enum value 等英文技术标识。
  - 增加默认 `zh-CN` deny-list 回归测试，并保留 technical identifier whitelist。
- **验证结果**:
  - `npm test -- test/cli-message-catalog.test.ts`：通过，5 / 5。
  - `npm test -- test/cli-message-catalog.test.ts test/cli-output-presentation.test.ts test/status-command.test.ts test/validate-command.test.ts test/update-command.test.ts test/resolve-cli.test.ts`：通过，70 / 70。
  - `npm run build`：通过。
  - `npm test`：通过，50 files / 361 tests。
  - `git diff --check`：通过。
  - `release/packaging-manifest.json` build/full-test hash drift 已恢复，当前无 diff。
- **下一步判断**: 启动 fresh reviewer sub-agent 执行 `/bmenhance-cr-01-reviewer 8-6` Round 2。

## 2026-06-16 — Attempt 6

- **Story**: `8-6-localized-next-actions-and-message-catalog`
- **方案**: 启动 fresh reviewer sub-agent 执行 `/bmenhance-cr-01-reviewer 8-6` Round 2，复核 CR-03 修复后的代码和契约。
- **选择原因**: CR-03 fixer 已完成，按闭环要求必须重新 reviewer/evaluator，不能直接进入 04/05/06。
- **执行结果**: Reviewer Round 2 完成，结论不通过。
- **输出文件**: `_bmad-output/implementation-artifacts/code-reviews/8-6-code-review/8-6-code-review-summary-20260616-round-2.md`
- **发现摘要**:
  - Findings 数量为 1，是 Round 1 finding 的遗留阻塞范围。
  - `status`、`validate`、`update` 默认 `zh-CN` human output 已基本修复。
  - `resolve --human` 默认中文仍残留 `source path：`、`source paths：`、`fallback source：` 等英文 label，以及英文 `issue.impact` prose。
- **验证结果**:
  - `npm test -- test/cli-message-catalog.test.ts test/cli-output-presentation.test.ts test/status-command.test.ts test/validate-command.test.ts test/update-command.test.ts test/resolve-cli.test.ts`：通过，6 files / 70 tests。
  - `npm run build`：通过。
  - `npm test`：通过，50 files / 361 tests。
  - `git diff --check`：通过。
  - `release/packaging-manifest.json` full-test hash drift 已恢复，当前无 diff。
- **下一步判断**: 启动 fresh evaluator sub-agent 执行 `/bmenhance-cr-02-evaluator 8-6` Round 2，独立评估遗留 finding。

## 2026-06-16 — Attempt 7

- **Story**: `8-6-localized-next-actions-and-message-catalog`
- **方案**: 启动 fresh evaluator sub-agent 执行 `/bmenhance-cr-02-evaluator 8-6` Round 2，只评估 Round 2 review summary。
- **选择原因**: Reviewer Round 2 仍不通过，按 CR 闭环必须先由 evaluator 判定遗留 finding 是否有效、是否阻塞、是否需要第二轮 fixer。
- **执行结果**: Evaluator Round 2 完成，结论 `not approved`。
- **输出文件**: `_bmad-output/implementation-artifacts/code-reviews/8-6-code-review/8-6-code-review-evaluation-20260616-round-2.md`
- **评估摘要**:
  - Finding 1 确认有效，非误报。
  - 严重性保持 P1，阻塞交付。
  - `source path`、`source paths`、`fallback source` 属于 human label，应本地化。
  - `issue.impact` 英文 prose 应改为 catalog / locale-aware 输出。
  - CR TODO 数量为 0，误报数量为 0。
- **下一步判断**: 启动 fresh fixer sub-agent 执行 `/bmenhance-cr-03-fixer 8-6` Round 2；修复后必须重新执行 reviewer/evaluator。

## 2026-06-16 — Attempt 8

- **Story**: `8-6-localized-next-actions-and-message-catalog`
- **方案**: 启动 fresh fixer sub-agent 执行 `/bmenhance-cr-03-fixer 8-6` Round 2，严格限定修复默认 `zh-CN` 的 `resolve --human` 残留英文 label/prose。
- **选择原因**: Evaluator Round 2 判定遗留 finding 有效且阻塞交付，按 CR 闭环必须先修复，再重新 reviewer/evaluator。
- **执行结果**: Fixer Round 2 完成，finding 标记为 fixed，并在 Round 2 evaluation 文件末尾追加 `## 修复执行记录`。
- **修复摘要**:
  - 默认 `zh-CN` 的 `source path` / `source paths` / `fallback source` label 改为中文 catalog 文案。
  - `zh-CN` 的 `formatResolveHumanIssues()` 不再直出英文 `issue.impact`，改用中文 catalog impact summary。
  - 保留 `issueId`、`affectedPath`、`details.status` 等技术标识。
  - 新增 focused regression test 覆盖中文冒号形式和两条 resolver 英文 issue prose。
- **验证结果**:
  - `npm test -- test/cli-message-catalog.test.ts`：通过，6 tests。
  - `npm test -- test/cli-message-catalog.test.ts test/resolve-cli.test.ts`：通过，21 tests。
  - `npm run build`：通过。
  - `npm test`：通过，50 files / 362 tests。
  - `git diff --check`：通过。
  - `release/packaging-manifest.json` full-test hash drift 已恢复，当前无 diff。
- **下一步判断**: 启动 fresh reviewer sub-agent 执行 `/bmenhance-cr-01-reviewer 8-6` Round 3。

## 2026-06-16 — Attempt 9

- **Story**: `8-6-localized-next-actions-and-message-catalog`
- **方案**: 启动 fresh reviewer sub-agent 执行 `/bmenhance-cr-01-reviewer 8-6` Round 3，复核第二轮 fixer 后的代码和契约。
- **选择原因**: Fixer Round 2 已完成，按闭环要求必须重新 reviewer/evaluator，不能直接进入 04/05/06。
- **执行结果**: Reviewer Round 3 完成，结论不通过。
- **输出文件**: `_bmad-output/implementation-artifacts/code-reviews/8-6-code-review/8-6-code-review-summary-20260616-round-3.md`
- **发现摘要**:
  - Findings 数量为 1，是 Round 1 broad finding 的遗留范围。
  - Round 2 的 `resolve --human` 默认中文残留已确认修复。
  - `status`、`validate`、`update`、`resolve --human` 重点路径通过复核。
  - 默认 `zh-CN` 的 `install` human output 仍输出英文 prose/label。
- **验证结果**:
  - `npm test -- test/cli-message-catalog.test.ts test/resolve-cli.test.ts`：通过，21 tests。
  - `npm test -- test/cli-message-catalog.test.ts test/cli-output-presentation.test.ts test/status-command.test.ts test/validate-command.test.ts test/update-command.test.ts test/resolve-cli.test.ts`：通过，71 tests。
  - `npm run build`：通过。
  - `npm test`：通过，50 files / 362 tests。
  - `git diff --check`：通过。
  - `release/packaging-manifest.json` full-test hash drift 已恢复，当前无 diff。
- **下一步判断**: 启动 fresh evaluator sub-agent 执行 `/bmenhance-cr-02-evaluator 8-6` Round 3，独立评估 install 遗留 finding。

## 2026-06-16 — Attempt 10

- **Story**: `8-6-localized-next-actions-and-message-catalog`
- **方案**: 启动 fresh evaluator sub-agent 执行 `/bmenhance-cr-02-evaluator 8-6` Round 3，只评估 Round 3 review summary。
- **选择原因**: Reviewer Round 3 仍不通过，按 CR 闭环必须先由 evaluator 判定 install 遗留 finding 是否有效、是否阻塞、是否需要第三轮 fixer。
- **执行结果**: Evaluator Round 3 完成，结论 `not approved`。
- **输出文件**: `_bmad-output/implementation-artifacts/code-reviews/8-6-code-review/8-6-code-review-evaluation-20260616-round-3.md`
- **评估摘要**:
  - Finding 1 确认有效，非误报。
  - 严重性保持 P1，阻塞交付。
  - 默认 `zh-CN` `install` human output 中的 target summary、State/Evidence/Authorization label 和 ready summary label 属于 human prose/label，应本地化。
  - CR TODO 数量为 0，误报数量为 0。
- **下一步判断**: 启动 fresh fixer sub-agent 执行 `/bmenhance-cr-03-fixer 8-6` Round 3；修复后必须重新执行 reviewer/evaluator。

## 2026-06-16 — Attempt 11

- **Story**: `8-6-localized-next-actions-and-message-catalog`
- **方案**: 启动 fresh fixer sub-agent 执行 `/bmenhance-cr-03-fixer 8-6` Round 3，严格限定修复默认 `zh-CN` install human output 的英文 prose/label。
- **选择原因**: Evaluator Round 3 判定 install 遗留 finding 有效且阻塞交付，按 CR 闭环必须先修复，再重新 reviewer/evaluator。
- **执行结果**: Fixer Round 3 完成，finding 标记为 fixed，并在 Round 3 evaluation 文件末尾追加 `## 修复执行记录`。
- **修复摘要**:
  - 默认 `zh-CN` install human output 不再直通英文 `result.summary`。
  - install State / Evidence / Authorization / ready summary 的 human label 已切到中文 catalog。
  - 保留 `targetProject`、`projectRoot`、`manifestVersion`、`completedSteps`、`pendingSteps`、source descriptor fields、step id、IDE target id/status code、command/flag 等英文技术标识和值。
  - `en-US` fallback 保持兼容。
- **验证结果**:
  - `npm test -- test/cli-message-catalog.test.ts test/install-progress-ready-summary.test.ts test/source-selection.test.ts`：通过，3 files / 27 tests。
  - `npm test -- test/target-directory.test.ts test/cli-smoke.test.ts`：通过，2 files / 26 tests。
  - `npm run build`：通过。
  - `npm test`：通过，50 files / 363 tests。
  - `git diff --check`：通过。
  - `release/packaging-manifest.json` full-test hash drift 已恢复，当前无 diff。
- **下一步判断**: 启动 fresh reviewer sub-agent 执行 `/bmenhance-cr-01-reviewer 8-6` Round 4。

## 2026-06-16 — Attempt 12

- **Story**: `8-6-localized-next-actions-and-message-catalog`
- **方案**: 启动 fresh reviewer sub-agent 执行 `/bmenhance-cr-01-reviewer 8-6` Round 4，复核第三轮 fixer 后的代码和契约。
- **选择原因**: Fixer Round 3 已完成，按闭环要求必须重新 reviewer/evaluator，不能直接进入 04/05/06。
- **执行结果**: Reviewer Round 4 完成，结论通过。
- **输出文件**: `_bmad-output/implementation-artifacts/code-reviews/8-6-code-review/8-6-code-review-summary-20260616-round-4.md`
- **发现摘要**:
  - Findings 数量为 0。
  - 前三轮默认中文 prose/label findings 均已复核关闭。
  - 英文 fallback 与 machine/JSON contract 未发现回归。
- **验证结果**:
  - `npm test -- test/cli-message-catalog.test.ts test/install-progress-ready-summary.test.ts test/source-selection.test.ts`：通过，3 files / 27 tests。
  - `npm test -- test/cli-message-catalog.test.ts test/cli-output-presentation.test.ts test/status-command.test.ts test/validate-command.test.ts test/update-command.test.ts test/resolve-cli.test.ts`：通过，6 files / 72 tests。
  - `npm run build`：通过。
  - `npm test`：通过，50 files / 363 tests。
  - `git diff --check`：通过。
  - `release/packaging-manifest.json` full-test hash drift 已恢复，当前无 diff。
- **下一步判断**: 启动 fresh evaluator sub-agent 执行 `/bmenhance-cr-02-evaluator 8-6` Round 4。

## 2026-06-16 — Attempt 13

- **Story**: `8-6-localized-next-actions-and-message-catalog`
- **方案**: 启动 fresh evaluator sub-agent 执行 `/bmenhance-cr-02-evaluator 8-6` Round 4，只评估最新 review summary 与修复闭环。
- **选择原因**: Reviewer Round 4 已通过，按 CR 闭环必须由 evaluator 做最终确认后才能进入 04/05/06。
- **执行结果**: Evaluator Round 4 完成，结论 Approved。
- **输出文件**: `_bmad-output/implementation-artifacts/code-reviews/8-6-code-review/8-6-code-review-evaluation-20260616-round-4.md`
- **评估摘要**:
  - Round 4 findings 为 0。
  - 前三轮默认中文 prose/label findings 均已复核关闭。
  - CR TODO 数量为 0，误报数量为 0。
  - 不需要 fixer。
- **下一步判断**: 启动 fresh sub-agent 执行 `bmenhance-cr-04-rules-extractor`。

## 2026-06-16 — Attempt 14

- **Story**: `8-6-localized-next-actions-and-message-catalog`
- **方案**: 启动 fresh sub-agent 执行 `bmenhance-cr-04-rules-extractor`，分析本 Story 多轮 CR/evaluation/fix 记录是否能提取可推广规则。
- **选择原因**: Reviewer/evaluator 已通过，按 orchestrator 必须先执行 04，再执行 05/06。
- **执行结果**: 04 完成，生成 Story 级规则提取总结。
- **输出文件**: `_bmad-output/implementation-artifacts/code-reviews/8-6-code-review/8-6-cr-rules-extraction-20260616.md`
- **规则结论**:
  - 提取候选规则 `CAND-CR-API-8-6-01`。
  - 晋升分数 `9/12`，达到全局文档建议阈值。
  - 未更新全局/项目级规则文档；总结建议后续确认写入 `_bmad-output/project-context.md` 或 `cr-rules-summary.md`。
  - 无需 05 TODO Tracker 处理的 backlog 项。
- **下一步判断**: 仍按流程启动 fresh `bmenhance-cr-05-todo-tracker` 做无待办确认。

## 2026-06-16 — Attempt 15

- **Story**: `8-6-localized-next-actions-and-message-catalog`
- **方案**: 启动 fresh sub-agent 执行 `bmenhance-cr-05-todo-tracker`，确认是否存在需要登记的 deferred CR TODO。
- **选择原因**: 04 明确无需 backlog，但 orchestrator 要求 05 阶段仍需串行执行并记录结果。
- **执行结果**: 05 完成，未新增/更新 CR TODO。
- **Backlog 文件**: `_bmad-output/implementation-artifacts/cr-rules/cr-todo-backlog.md`
- **结论**:
  - Backlog 变更为 0。
  - 不需要后续 CR TODO backlog 处理。
  - `CAND-CR-API-8-6-01` 是否写入项目级规则文档属于后续确认事项，不进入 `cr-todo-backlog.md`。
- **下一步判断**: 启动 fresh sub-agent 执行 `bmenhance-cr-06-finalizer`。

## 2026-06-16 — Attempt 16

- **Story**: `8-6-localized-next-actions-and-message-catalog`
- **方案**: 启动 fresh sub-agent 执行 `bmenhance-cr-06-finalizer`，在 CR Approved 后更新 Story 和 sprint tracking。
- **选择原因**: 04/05 已完成，Story 只有在 06 同步状态后才可视为 done。
- **执行结果**: 06 完成。
- **修改文件**:
  - `_bmad-output/implementation-artifacts/stories/8-6-localized-next-actions-and-message-catalog.md`
  - `_bmad-output/implementation-artifacts/sprint-status.yaml`
- **状态结果**:
  - Story status: `done`
  - Sprint status: `8-6-localized-next-actions-and-message-catalog: done`
  - Epic 8: 保持 `in-progress`
  - `8-7`: 保持 `ready-for-dev`
  - `_bmad-output/planning-artifacts/bmm-workflow-status.yaml` 不存在，已跳过且未创建。
- **验证结果**:
  - latest evaluation Round 4 为 Approved，CR TODO 0，误报 0，不需要 fixer。
  - latest review Round 4 结论通过，findings 0。
  - `git diff --check -- <两个修改文件>` 通过。
- **终态判断**: Story 8.6 严格串行 dev/CR/04/05/06 闭环完成。下一步进入 Story 8.7。
