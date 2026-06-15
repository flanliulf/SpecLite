# EXPERIMENT_NOTES

## 2026-06-16 04:57 CST

当前执行 Story `8-6-localized-next-actions-and-message-catalog`。

已确认用户要求的关键约束：

- 每一步都必须 fresh sub-agent。
- 外层步骤绝对不并行。
- 当前 Story 未完成前，不得启动 Story `8-7`。
- 需要决策时优先采用推荐方案并记录，避免无谓挂起；但不得扩大需求边界、推送远端或纳入无关文件。

当前仓库状态：

- Story `8-1` 到 `8-5` 已完成并标记 `done`。
- Story `8-6` 当前为 `ready-for-dev`。
- Story `8-7` 当前为 `ready-for-dev`，不得提前启动。
- 工作树已有 Story 8.1 到 8.5 目标内改动，不属于无关改动。
- `main` 相对 `origin/main` ahead 1，来自上一轮 Epic 8 SR 本地提交。
- 本目标默认继续本地提交，不 push。

Story 8.6 的重点风险：

- 默认 human-readable 自然语言应使用 `zh-CN` catalog，但 command、flag、path、issue id、schema id、step id、target id、JSON field 等技术标识必须保持英文。
- `--locale en-US` 或 `SPECLITE_LOCALE=en-US` 只能影响 human output，不能改变 `CommandResult` JSON、exit code、issue ordering 或 path normalization。
- 默认中文 Next Actions 不得直接透传英文内部 `nextActions`，但必须保留 reason code、affected path 和 technical command。
- Next Actions 命令建议必须包含 target/display path 或占位，并按安全优先级排序：先修 blocker，再授权写入，再运行 validate/status。
- 不把 localization catalog 扩展成 plugin system、remote translation service 或 user-editable runtime customization。

下一步：启动 fresh sub-agent 执行 `/bmad-dev-story story 8-6`，并要求它只按 Story `8-6` 范围实现，不处理 Story `8-7`。

## 2026-06-16

fresh dev sub-agent 已完成 Story `8-6` 开发：

- Story 进入 `review`。
- `sprint-status.yaml` 中 `8-6-localized-next-actions-and-message-catalog` 进入 `review`。
- 修改涉及 message catalog、human output renderer、locale propagation、resolve human mode 和多组 CLI tests。
- 验证命令全部通过：focused catalog test、focused CLI regression set、`npm run build`、`npm test`、`git diff --check`。
- `release/packaging-manifest.json` 的 build hash drift 已恢复，当前无 diff。

当前注意点：

- CR reviewer 需要重点审查默认中文 human output 是否真的不透传英文内部 `nextActions`。
- 需要确认 `--locale en-US` / `SPECLITE_LOCALE=en-US` 只影响 human output，不改变 JSON contract、exit code、issue ordering 或 path normalization。
- 需要确认技术标识仍保持英文，且 Next Actions command suggestions 包含 target/display path 或 `<target>` 占位。
- 需要确认 `--json` output 不受 locale、TTY、terminal width 或 `NO_COLOR` 影响。

下一步只能启动 reviewer，不能直接 evaluator 或 8.7。

## 2026-06-16

Reviewer Round 1 已完成，结论不通过。

需要 evaluator 重点评估：

- Finding 1 是否成立：默认 `zh-CN` human output 是否仍透出英文自然语言。
- 这些英文是否属于应保留的技术标识，还是 `CommandResult.summary` / renderer hard-coded prose。
- 该问题是否直接违反 AC1 默认 human-readable natural language 使用 `zh-CN` catalog。
- 修复是否应将 human-only summary、state/evidence label、resolve human bullets 纳入 catalog，或用 catalog summary 替代 `CommandResult.summary` 的英文句子。

不直接修复；下一步必须先跑 evaluator。

## 2026-06-16

Evaluator Round 1 已完成，结论 `not approved`。

确认结果：

- Reviewer Finding 1 有效，非误报。
- 优先级保持 P1，阻塞交付。
- 默认 `zh-CN` human output 中的 `CommandResult.summary` 英文句子、`Command status`、`Output profile`、`requested key`、`machine contract` 等属于 human-readable prose / label，不是必须保留英文的技术标识。
- 需要保留英文的是 command、flag、path、issue id、reason code、schema id、JSON field、enum value 等技术标识。
- CR TODO 数量为 0，误报数量为 0。

下一步只能启动 fresh fixer sub-agent 执行 `/bmenhance-cr-03-fixer 8-6`。修复完成后必须回到 reviewer/evaluator，不得直接进入 04/05/06。

## 2026-06-16

Fixer Round 1 已完成。

修复结果：

- 默认 `zh-CN` human output 不再直接展示英文 `CommandResult.summary`。
- `status`、`validate`、`update`、`resolve --human` 的 human prose/label 已改为 catalog/locale-aware 输出。
- 保留 command、flag、path、issue id、reason code、schema id、JSON field、enum value 等英文技术标识。
- 补充默认 `zh-CN` deny-list 回归测试，并 whitelist 技术标识。
- Evaluation 文件已追加 `## 修复执行记录`。
- 验证通过：focused catalog tests、focused output regression set、`npm run build`、`npm test`、`git diff --check`。
- `release/packaging-manifest.json` build/full-test hash drift 已恢复，当前无 diff。

下一步必须重新执行 reviewer/evaluator。当前只能启动 fresh reviewer sub-agent 执行 Round 2。

## 2026-06-16

Reviewer Round 2 已完成，结论不通过。

复核结果：

- Round 1 finding 在 `status`、`validate`、`update` 默认中文路径基本修复。
- 遗留阻塞集中在默认 `zh-CN` 的 `resolve --human`。
- 仍残留英文 human label/prose：`source path：`、`source paths：`、`fallback source：`。
- Invalid/warning issue 中仍直接输出英文 `issue.impact`。
- 当前测试 deny-list 只覆盖 ASCII 冒号形式，未覆盖中文冒号 `：`，也未覆盖 warning issue 英文 prose。

下一步必须启动 fresh evaluator sub-agent 执行 Round 2。只有 evaluator 判断后才能进入第二轮 fixer。

## 2026-06-16

Evaluator Round 2 已完成，结论 `not approved`。

确认结果：

- Reviewer Round 2 的遗留 finding 有效，非误报。
- 优先级保持 P1，阻塞交付。
- `source path`、`source paths`、`fallback source` 属于默认中文 human label，应本地化。
- `issue.impact` 英文 prose 需要通过 catalog / locale-aware formatter 输出中文。
- 应保留英文的仍是 command、flag、path、issue id、reason/status code、schema id、JSON field、enum value 等技术标识。
- CR TODO 数量为 0，误报数量为 0。

下一步只能启动 fresh fixer sub-agent 执行 Round 2。修复后必须重新 reviewer/evaluator。

## 2026-06-16

Fixer Round 2 已完成。

修复结果：

- 默认 `zh-CN` 的 `source path` / `source paths` / `fallback source` label 已改为中文 catalog 文案。
- `formatResolveHumanIssues()` 默认 `zh-CN` 不再直出英文 `issue.impact`，改用中文 catalog impact summary。
- 保留 `issueId`、`affectedPath`、`details.status` 等技术标识。
- 新增 focused regression test 覆盖中文冒号形式和 resolver invalid/warning issue 英文 prose。
- Round 2 evaluation 文件已追加 `## 修复执行记录`。
- 验证通过：focused catalog/resolve tests、`npm run build`、`npm test`、`git diff --check`。
- `release/packaging-manifest.json` full-test hash drift 已恢复，当前无 diff。

下一步必须重新执行 reviewer/evaluator。当前只能启动 fresh reviewer sub-agent 执行 Round 3。

## 2026-06-16

Reviewer Round 3 已完成，结论不通过。

复核结果：

- Round 2 的 `resolve --human` 默认中文残留已关闭。
- `status`、`validate`、`update`、`resolve --human` 重点路径通过复核。
- 新的遗留阻塞集中在默认 `zh-CN` 的 `install` human output。
- 仍残留英文 prose/label：`Target: ... Directory state...`、`Completed steps:`、`Pending steps:`、`Source`、`External Access`、`Authorization`。
- 该项被 reviewer 归类为 Round 1 broad finding 的遗留范围，不是独立新发现。

下一步必须启动 fresh evaluator sub-agent 执行 Round 3。只有 evaluator 判断后才能进入第三轮 fixer。

## 2026-06-16

Evaluator Round 3 已完成，结论 `not approved`。

确认结果：

- Reviewer Round 3 的 install 遗留 finding 有效，非误报。
- 优先级保持 P1，阻塞交付。
- 默认 `zh-CN` `install` human output 中的 target summary、step state label、IDE target label、Source / External Access / Authorization、ready summary label 属于 human prose/label，应本地化。
- 应保留英文的仍是 `targetProject`、`projectRoot`、`manifestVersion`、`completedSteps`、`pendingSteps`、path/status code、source descriptor fields、step id、command/flag、issue id、schema/JSON field 等技术标识。
- CR TODO 数量为 0，误报数量为 0。

下一步只能启动 fresh fixer sub-agent 执行 Round 3。修复后必须重新 reviewer/evaluator。

## 2026-06-16

Fixer Round 3 已完成。

修复结果：

- 默认 `zh-CN` install human output 不再直通英文 `result.summary`。
- Install State / Evidence / Authorization / ready summary 的 human label 已切到中文 catalog。
- 保留 `targetProject`、`projectRoot`、`manifestVersion`、`completedSteps`、`pendingSteps`、source descriptor fields、step id、IDE target id/status code、command/flag 等英文技术标识和值。
- `en-US` fallback 保持兼容。
- Round 3 evaluation 文件已追加 `## 修复执行记录`。
- 验证通过：focused install/catalog tests、`npm run build`、`npm test`、`git diff --check`。
- `release/packaging-manifest.json` full-test hash drift 已恢复，当前无 diff。

下一步必须重新执行 reviewer/evaluator。当前只能启动 fresh reviewer sub-agent 执行 Round 4。

## 2026-06-16

Reviewer Round 4 已完成，结论通过。

复核结果：

- 本轮 findings 为 0。
- Round 3 install 默认中文 prose/label 残留已修复。
- Round 2 `resolve --human` 默认中文 label/prose 修复持续有效。
- Round 1 `status`、`validate`、`update`、`resolve --human` 默认中文路径未发现英文自然语言 prose/label 回归。
- 英文 fallback 保持可用。
- `CommandResult` JSON、exit code、issue ordering、path normalization、默认 resolve machine mode、`--json` output 未发现 locale 相关回归。

下一步必须启动 fresh evaluator sub-agent 执行 Round 4。只有 evaluator Approved 后才能进入 04/05/06。

## 2026-06-16

Evaluator Round 4 已完成，结论 Approved。

确认结果：

- Round 4 findings 为 0。
- 前三轮默认中文 prose/label findings 均已复核关闭。
- CR TODO 为 0，误报为 0。
- 不需要再次 fixer。
- 英文 fallback 与 machine/JSON contract 未发现回归。

CR loop 已通过。下一步只能进入 `bmenhance-cr-04-rules-extractor`，然后再顺序执行 05 和 06。

## 2026-06-16

04 rules extractor 已完成。

结果：

- 生成 `8-6-cr-rules-extraction-20260616.md`。
- 提取候选规则 `CAND-CR-API-8-6-01`。
- 晋升分数 `9/12`，达到全局文档建议阈值。
- 未更新 `_bmad-output/project-context.md`、`_bmad-output/implementation-artifacts/cr-rules/cr-rules-summary.md` 或其他项目级规则文档。
- Round 1-4 均无 CR TODO；04 判断无需 05 backlog 处理。

仍需按 orchestrator 顺序执行 05 TODO tracker，做明确无待办确认，然后才能执行 06 finalizer。

## 2026-06-16

05 TODO tracker 已完成。

结果：

- 未新增/更新 CR TODO。
- `_bmad-output/implementation-artifacts/cr-rules/cr-todo-backlog.md` 本次未修改。
- Backlog 变更为 0。
- 不需要后续 CR TODO backlog 处理。
- `CAND-CR-API-8-6-01` 是否写入项目级规则文档属于后续确认事项，不进入 CR TODO backlog。

下一步只能执行 `bmenhance-cr-06-finalizer`，将 Story 8.6 标记为 Done 并同步 sprint tracking。

## 2026-06-16

06 finalizer 已完成。

结果：

- Story `8-6-localized-next-actions-and-message-catalog` 状态已更新为 `done`。
- `sprint-status.yaml` 中 `8-6-localized-next-actions-and-message-catalog: done`。
- `last_updated` 更新为 `2026-06-16 06:46 CST`。
- Epic 8 保持 `in-progress`，因为 `8-7` 仍为 `ready-for-dev`。
- `_bmad-output/planning-artifacts/bmm-workflow-status.yaml` 不存在，已跳过且未创建。

Story 8.6 已终态完成。下一步进入 Story `8-7-human-output-fixture-and-documentation-matrix`。
