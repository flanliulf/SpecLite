# EXPERIMENT_NOTES

## 2026-06-16 02:34 CST

当前执行 Story `8-2-install-outcome-oriented-output`。

已确认用户要求的关键约束：

- 每一步都必须 fresh sub-agent。
- 外层步骤绝对不并行。
- 当前 Story 未完成前，不得启动 Story `8-3`。
- 需要决策时优先采用推荐方案并记录，避免无谓挂起；但不得扩大需求边界、推送远端或纳入无关文件。

当前仓库状态：

- Story `8-1` 已完成并标记 `done`。
- Story `8-2` 当前为 `ready-for-dev`。
- 工作树已有 Story 8.1 目标内改动，不属于无关改动。
- `main` 相对 `origin/main` ahead 1，来自上一轮 Epic 8 SR 本地提交。
- 本目标默认继续本地提交，不 push。

Story 8.2 的重点风险：

- 不得新增未契约化 public JSON fields。
- install outcome label 只用于 human-readable output。
- Story 1.7 的 no-prompt、locale、prompt separation 行为必须保持。
- Story 8.1 的 shared frame 是依赖基础，8.2 应在该 frame 上实现 install-specific outcome 分支。

下一步：启动 fresh sub-agent 执行 `/bmad-dev-story story 8-2`，使用 `gpt-5.5`，并要求它只按 Story `8-2` 范围实现，不处理后续 Story。

## 2026-06-16

fresh dev sub-agent 已完成 Story `8-2` 开发：

- Story 进入 `review`。
- `sprint-status.yaml` 中 `8-2-install-outcome-oriented-output` 进入 `review`。
- 新增 focused test：`test/install-outcome-human-output.test.ts`。
- 验证命令全部通过：install outcome focused tests、Story 指定 install tests、`npm run build`、`npm test`、`git diff --check`。
- `release/packaging-manifest.json` 的 build hash drift 已由 dev sub-agent 恢复，最终无 diff。

当前注意点：

- CR reviewer 需要重点审查 install outcome 是否只影响 human output，未改变 public JSON contract。
- 需要确认 `blocked-before-write`、`write-failed`、`ready-check-failed` 三类失败分支是否有足够 evidence 与 next action。
- 需要确认 Story 1.7 的 no-prompt / explicit interactive 文案没有回退。

下一步只能启动 reviewer，不能直接 evaluator 或 fixer。

## 2026-06-16

Reviewer Round 1 已完成，结论不通过。

需要 evaluator 重点评估：

- Finding 1 是否成立：真实 CLI / `runInstallCommand()` 的 `prewrite-paused` 分支是否缺少 AC1 指定的 `speclite install <target> --yes` 与 `speclite install <target> --interactive` Next Actions。
- 该问题是否属于必须当前 Story 修复的阻塞项，而不是仅测试缺口或文案偏好。
- 修复边界是否应限定在 install prewrite branch 的 next actions 与对应 integration-level focused test。

不直接修复；下一步必须先跑 evaluator。

## 2026-06-16

Evaluator Round 1 已完成，未 Approved。

明确修复边界：

- Fixer 必须修复真实 `prewrite-paused` branch 的 Next Actions。
- Output 需要包含 `speclite install <target> --yes` 与 `speclite install <target> --interactive`。
- Fixer 必须补充真实 CLI 或 command-level focused test，不应只调整 synthetic renderer fixture。
- 本轮没有 CR TODO，也没有误报。

下一步只能启动 fixer。Fixer 完成后必须重新 review/evaluate，不能直接进入 04/05/06。

## 2026-06-16

Fixer Round 1 已完成。

当前 gate 判断：

- P1 blocker 已按 evaluator 要求修复。
- 新增测试覆盖真实 command result 和真实 CLI human output，不再只依赖 synthetic renderer fixture。
- 没有 CR TODO 候选，也没有误报。
- `release/packaging-manifest.json` 曾出现 build hash drift，已由主 agent 精确恢复并确认无 diff。

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
- evaluator Round 2 自身未重新跑测试，验证证据来自 reviewer Round 2 summary。

下一步按用户指定顺序启动 04 rules extractor；04 完成后才能启动 05。

## 2026-06-16

Rules extractor 04 已完成 `analysis-only`。

当前判断：

- 04 没有修改任何文件。
- 04 不建议新增全局规则；核心模式已有 `CR-API-03` 等价覆盖。
- 04 只建议将本次作为既有 `CR-API-03` 的证据补充候选，但默认模式下没有用户确认，不能写入。
- 04 没有 05 TODO 候选；evaluator Round 2 也明确 CR TODO 为 0。

下一步按固定顺序启动 05 todo tracker。05 应确认无 backlog 变更；如果 05 发现与 evaluator 冲突的新 TODO 候选，需要记录依据后再决策。

## 2026-06-16

TODO tracker 05 已完成。

当前判断：

- 05 没有修改 backlog。
- 没有 Story 8.2 需要处理的 open/in-progress 相关 TODO。
- backlog 当前有 `TODO-009`、`TODO-010`、`TODO-011` 三条 open，但涉及文件不匹配 Story 8.2。
- 没有新增非阻塞 TODO 候选。

下一步只能启动 06 finalizer。06 应验证最新 evaluation 为 Approved，然后将 Story `8-2` 与 sprint status 更新为 `done`；`bmm-workflow-status.yaml` 缺失时按 skill 容错跳过。

## 2026-06-16 03:07 CST

Finalizer 06 已完成。

当前终态：

- Story `8-2` 文件状态为 `done`。
- `sprint-status.yaml` 中 Story `8-2` 状态为 `done`。
- `_bmad-output/planning-artifacts/bmm-workflow-status.yaml` 不存在，已跳过且未创建。
- Epic 8 仍为 `in-progress`，因为 `8-3` 到 `8-7` 未完成。

Story `8-2` 已满足本 goal 的 Story 级完成标准。下一步可以初始化 Story `8-3`，但仍必须保持严格串行：先建 8.3 进度文件，再启动 fresh dev sub-agent。
