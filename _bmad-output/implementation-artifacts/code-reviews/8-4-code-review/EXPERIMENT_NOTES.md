# EXPERIMENT_NOTES

## 2026-06-16 03:30 CST

当前执行 Story `8-4-status-and-validate-human-output-separation`。

已确认用户要求的关键约束：

- 每一步都必须 fresh sub-agent。
- 外层步骤绝对不并行。
- 当前 Story 未完成前，不得启动 Story `8-5`。
- 需要决策时优先采用推荐方案并记录，避免无谓挂起；但不得扩大需求边界、推送远端或纳入无关文件。

当前仓库状态：

- Story `8-1`、`8-2`、`8-3` 已完成并标记 `done`。
- Story `8-4` 当前为 `ready-for-dev`。
- 工作树已有 Story 8.1 / 8.2 / 8.3 目标内改动，不属于无关改动。
- `main` 相对 `origin/main` ahead 1，来自上一轮 Epic 8 SR 本地提交。
- 本目标默认继续本地提交，不 push。

Story 8.4 的重点风险：

- 不改变 `status.data.highLevelHealth` enum 或 aggregation，除非 SPEC 被同步更新。
- 不让 `status` 变成 `validate` 的轻量版。
- 不让 `validate` 执行 repair、remote source freshness 或 implicit update。
- 不新增 public JSON fields。
- `status` command success 不得被人类输出误写成安装健康通过。

下一步：启动 fresh sub-agent 执行 `/bmad-dev-story story 8-4`，使用 `gpt-5.5`，并要求它只按 Story `8-4` 范围实现，不处理后续 Story。

## 2026-06-16

fresh dev sub-agent 已完成 Story `8-4` 开发：

- Story 进入 `review`。
- `sprint-status.yaml` 中 `8-4-status-and-validate-human-output-separation` 进入 `review`。
- 修改涉及 `src/cli/messages.ts`、`src/diagnostics/output.ts`、`test/status-command.test.ts`、`test/validate-command.test.ts`。
- 验证命令全部通过：status/validate focused tests、`npm run build`、`npm test`、`git diff --check`。
- `release/packaging-manifest.json` 的 build hash drift 已由 dev sub-agent 恢复，最终无 diff。

当前注意点：

- CR reviewer 需要重点审查 status command success 是否没有被误写成安装健康通过。
- 需要确认 `stale` / `unknown` 只作为 human-derived label，不进入 public JSON enum。
- 需要确认 validate error / critical 的 Next Actions 足够具体，且 issue ordering 保持 canonical。
- 需要确认 public JSON fields 不变。

下一步只能启动 reviewer，不能直接 evaluator 或 fixer。

## 2026-06-16

Reviewer Round 1 已完成，结论不通过。

需要 evaluator 重点评估：

- Finding 1 是否成立：`renderValidateHumanOutput()` 是否未对 `checkedTargets` 使用 canonical ordering。
- 该问题是否直接违反 AC3 “checked targets 必须按 canonical order 展示”。
- 修复边界是否应限定为复用 `sortCheckedTargets()` 并补充测试断言 `Checked targets: claude, agents`。

不直接修复；下一步必须先跑 evaluator。

## 2026-06-16

Evaluator Round 1 已完成，未 Approved。

明确修复边界：

- Fixer 必须在 `renderValidateHumanOutput()` 中复用 `sortCheckedTargets()`。
- Fixer 必须补充测试，覆盖 `checkedTargets: ["agents", "claude"]` 时 human output 为 `Checked targets: claude, agents`。
- 本轮没有 CR TODO，也没有误报。

下一步只能启动 fixer。Fixer 完成后必须重新 review/evaluate，不能直接进入 04/05/06。

## 2026-06-16

Fixer Round 1 已完成。

当前 gate 判断：

- P1 blocker 已按 evaluator 要求修复。
- `checkedTargets` 现在在 human renderer 边界复用 canonical sorting。
- 新增测试覆盖非 canonical 输入顺序。
- 没有 CR TODO 候选，也没有误报。
- `release/packaging-manifest.json` 当前无 diff。

根据用户要求和 workflow，修复后必须重新执行 reviewer 和 evaluator。只有两者都通过后，才能进入 04/05/06。

下一步：fresh reviewer Round 2。

## 2026-06-16

Reviewer Round 2 通过。

当前状态：

- Round 1 P1 已确认修复。
- 没有新 findings。
- `release/packaging-manifest.json` 当前无 diff。
- 仍不能收尾，因为用户 gate 要求 reviewer 和 evaluator 都通过。

下一步：fresh evaluator Round 2，评估 Round 2 review 是否 Approved。

## 2026-06-16

Evaluator Round 2 已 Approved。

当前状态：

- CR 循环 gate 已满足：reviewer 通过，evaluator 通过。
- 不需要再 fixer。
- 本轮没有 CR TODO。
- `release/packaging-manifest.json` 当前无 diff。

下一步按用户指定顺序启动 04 rules extractor；04 完成后才能启动 05。

## 2026-06-16

Rules extractor 04 已完成 `analysis-only`。

当前判断：

- 04 没有修改任何文件。
- 04 不建议新增全局规则，因为已有全局文档覆盖 canonical target order 和 renderer 边界约束。
- 04 提出 1 条 `cr-rules-summary.md` 候选：renderer 对契约排序字段应在 renderer 边界重新规范化，不信任上游输入顺序；默认模式下没有用户确认，不能写入。
- 04 没有 05 TODO 候选；evaluator Round 2 也明确 CR TODO 为 0。

下一步按固定顺序启动 05 todo tracker。05 应确认无 backlog 变更。

## 2026-06-16

TODO tracker 05 已完成。

当前判断：

- 05 没有修改 backlog。
- 没有 Story 8.4 需要处理的 open/in-progress 相关 TODO。
- 既有 `TODO-011` 只是在路径上触及 `src/diagnostics/output.ts`，但建议时机绑定 `sync` / `uninstall` failure renderer，不应扩大到 8.4。
- 没有新增非阻塞 TODO 候选。

下一步只能启动 06 finalizer。06 应验证最新 evaluation 为 Approved，然后将 Story `8-4` 与 sprint status 更新为 `done`；`bmm-workflow-status.yaml` 缺失时按 skill 容错跳过。

## 2026-06-16 04:08 CST

Finalizer 06 已完成。

当前终态：

- Story `8-4` 文件状态为 `done`。
- `sprint-status.yaml` 中 Story `8-4` 状态为 `done`。
- `_bmad-output/planning-artifacts/bmm-workflow-status.yaml` 不存在，已跳过且未创建。
- Epic 8 仍为 `in-progress`，因为 `8-5` 到 `8-7` 未完成。

Story `8-4` 已满足本 goal 的 Story 级完成标准。下一步可以初始化 Story `8-5`，但仍必须保持严格串行：先建 8.5 进度文件，再启动 fresh dev sub-agent。
