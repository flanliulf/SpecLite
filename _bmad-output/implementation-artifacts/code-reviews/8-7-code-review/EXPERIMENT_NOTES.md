# EXPERIMENT_NOTES

## 2026-06-16 06:48 CST

当前执行 Story `8-7-human-output-fixture-and-documentation-matrix`。

已确认用户要求的关键约束：

- 每一步都必须 fresh sub-agent。
- 外层步骤绝对不并行。
- Story 8.7 是 Epic 8 最后一个开发 Story；它未完成前不得执行最终提交。
- 需要决策时优先采用推荐方案并记录，避免无谓挂起；但不得扩大需求边界、推送远端或纳入无关文件。

当前仓库状态：

- Story `8-1` 到 `8-6` 已完成并标记 `done`。
- Story `8-7` 当前为 `ready-for-dev`。
- 工作树已有 Story 8.1 到 8.6 目标内改动，不属于无关改动。
- `main` 相对 `origin/main` ahead 1，来自上一轮 Epic 8 SR 本地提交。
- 本目标默认继续本地提交，不 push。

Story 8.7 的重点风险：

- 本 Story 收敛 coverage、fixtures 和 docs，不新增 outcome vocabulary，不改变 command core behavior 或 JSON schema。
- Docs 示例不能成为唯一 contract source；contract source 仍是 SPEC、schema 和 tests。
- Human-readable fixture / docs 示例必须稳定：不得包含本机绝对路径、private source、颜色依赖、terminal width 依赖、timestamp 或未 normalized path。
- `--json` output 必须证明不受 locale、TTY、terminal width、颜色或 human renderer changes 影响。
- `NO_COLOR`、non-TTY、CI、窄终端必须仍能表达完整语义，不依赖 ANSI、图标或动态覆盖行作为唯一语义。
- 若 release packaging check 因本轮或既有工作树问题失败，必须记录真实失败，不跳过证据。

下一步：启动 fresh sub-agent 执行 `/bmad-dev-story story 8-7`，并要求它只按 Story `8-7` 范围实现，不做最终提交。

## 2026-06-16

fresh dev sub-agent 已完成 Story `8-7` 开发：

- Story 进入 `review`。
- `sprint-status.yaml` 中 `8-7-human-output-fixture-and-documentation-matrix` 进入 `review`。
- 新增 CLI human output matrix 文档和 focused test。
- 更新 README、quick-start、CLI reference、how-to docs 和 docs index 的示例流。
- 验证命令全部通过：matrix focused test、focused CLI output tests、`npm run build`、`npm test`、`npm run release:packaging-check`、`git diff --check`。
- `release/packaging-manifest.json` 的 packageHash drift 已恢复，当前无 diff。

当前注意点：

- CR reviewer 需要重点审查 matrix 是否覆盖 install/update/update --repair/status/validate/resolve human mode 的 outcome/test/docs/fixture/JSON parity。
- 需要确认 docs 示例没有成为唯一 contract source，且没有本机绝对路径、private source、颜色/terminal width/timestamp 依赖。
- 需要确认 `NO_COLOR`、non-TTY、CI、窄终端语义测试和 `--json` parity 足够。
- 需要确认 release packaging check 不把 human docs 示例误当 runtime assets。

下一步只能启动 reviewer，不能直接 evaluator、finalizer 或最终提交。

## 2026-06-16

Reviewer Round 1 已完成，结论不通过。

需要 evaluator 重点评估：

- Finding 1 是否成立：`docs/reference/cli.md` 是否把 `--locale` 错列到 `init/list`，同时漏列真实支持 `--locale` 的 `status/validate`。
- 该问题是否直接违反 AC4 docs examples/options 与实际 CLI surface 一致性的要求。
- 是否需要在修复中补充 docs/reference parity focused test，避免 option 表错位。

不直接修复；下一步必须先跑 evaluator。

## 2026-06-16

Evaluator Round 1 已完成，结论 `not approved`。

确认结果：

- Reviewer Finding 1 有效，非误报。
- 优先级评估为 P1，阻塞交付。
- `docs/reference/cli.md` option 表与真实 CLI surface 不一致，违反 Story 8.7 AC4。
- 修复方向：从 `Init Options` / `List Options` 删除 `--locale`，在 `Status Options` / `Validate Options` 增加 `--locale <locale>`，并补充 focused docs/reference option parity test。
- 阻塞修复项数量为 1，非阻塞 CR TODO 为 0，误报为 0。

下一步只能启动 fresh fixer sub-agent 执行 `/bmenhance-cr-03-fixer 8-7`。修复完成后必须回到 reviewer/evaluator。

## 2026-06-16

Fixer Round 1 已完成。

修复结果：

- `docs/reference/cli.md` 的 `Init Options` / `List Options` 已移除 `--locale <locale>`。
- `Status Options` / `Validate Options` 已补充 `--locale <locale>`。
- 新增 `test/docs-reference-cli-options.test.ts`，覆盖 docs/reference option parity。
- Evaluation 文件已追加 `## 修复执行记录`。
- 验证通过：focused docs parity test、matrix test、`npm run build`、`npm test`、`npm run release:packaging-check`、`git diff --check`。
- `release/packaging-manifest.json` packageHash drift 已恢复，当前无 diff。

下一步必须重新执行 reviewer/evaluator。当前只能启动 fresh reviewer sub-agent 执行 Round 2。

## 2026-06-16

Reviewer Round 2 已完成，结论通过。

复核结果：

- 本轮 findings 为 0。
- Round 1 option 表错位 finding 已修复。
- `test/docs-reference-cli-options.test.ts` 能覆盖 `init/list/status/validate --locale` 错列和漏列回归。
- 未发现 CLI runtime behavior、command core behavior、JSON schema 或 outcome vocabulary 回归。
- Matrix focused test、full test、release packaging check 均通过。

下一步必须启动 fresh evaluator sub-agent 执行 Round 2。只有 evaluator Approved 后才能进入 04/05/06。

## 2026-06-16

Evaluator Round 2 已完成，结论 Approved。

确认结果：

- Round 1 finding 已修复，不再阻塞。
- Round 2 findings 为 0。
- CR TODO 为 0，误报为 0。
- 不需要再次 fixer。
- Focused docs/reference option parity 与 matrix tests 通过。

CR loop 已通过。下一步只能进入 `bmenhance-cr-04-rules-extractor`，然后再顺序执行 05 和 06。

## 2026-06-16

04 rules extractor 已完成。

结果：

- 生成 `8-7-cr-rules-extraction-20260616.md`。
- 提取候选规则 `CAND-CR-DOC-8-7-01`。
- 晋升分数 `7/12`，未达到全局文档规则阈值。
- 未更新 `_bmad-output/implementation-artifacts/cr-rules/cr-rules-summary.md` 或其他项目级规则文档。
- Round 2 已修复且非阻塞 CR TODO 为 0；04 判断无需 05 backlog 处理。

仍需按 orchestrator 顺序执行 05 TODO tracker，做明确无待办确认，然后才能执行 06 finalizer。

## 2026-06-16

05 TODO tracker 已完成。

结果：

- 未新增/更新 CR TODO。
- `_bmad-output/implementation-artifacts/cr-rules/cr-todo-backlog.md` 本次未修改。
- Backlog 变更为 0。
- 不需要后续 CR TODO backlog 处理。

下一步只能执行 `bmenhance-cr-06-finalizer`，将 Story 8.7 标记为 Done，并同步 Epic 8 tracking。

## 2026-06-16

06 finalizer 已完成。

结果：

- Story `8-7-human-output-fixture-and-documentation-matrix` 状态已更新为 `done`。
- `sprint-status.yaml` 中 `8-7-human-output-fixture-and-documentation-matrix: done`。
- `sprint-status.yaml` 中 `epic-8: done`。
- `last_updated` 更新为 `2026-06-16 07:38 CST`。
- `epic-8-retrospective` 保持 `optional`。
- `_bmad-output/planning-artifacts/bmm-workflow-status.yaml` 不存在，已跳过且未创建。

Story 8.7 已终态完成。Epic 8 所有 Story 已完成，下一步进入最终验证与本地提交。

## 2026-06-16

Epic 8 最终验证已完成。

结果：

- Focused tests 通过：11 files / 104 tests。
- `npm run build` 通过。
- `npm test` 通过：52 files / 368 tests。
- `npm run release:packaging-check` 通过。
- `git diff --check` 通过。
- `release/packaging-manifest.json` 与 `dist/packaging-manifest.json` 当前无 diff。
- `release:packaging-check` 写回的 `release/packaging-manifest.json` packageHash drift 已恢复，未纳入本次提交。

下一步执行精确暂存与中文 Conventional Commit，本地提交，不 push。
