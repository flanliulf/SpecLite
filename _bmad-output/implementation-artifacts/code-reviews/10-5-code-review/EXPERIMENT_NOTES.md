# Story 10.5 Experiment Notes（实验笔记）

## 2026-07-06 23:47 CST

当前判断：

- Story 10.5 是 Epic 10 中 Story 10.4 后的第一个待执行 Story。
- Story 10.1-10.4 的 development、CR、rules extractor、TODO tracker、finalizer 均已完成，允许进入 10.5。
- Story 10.5 拥有 fixture matrix、fixed count 泛化、packaging manifest、canonical source check 和 installed-state validation 的 release gate 泛化职责。

决策：

- 继续在当前 mixed worktree 中推进 Story 10.5。
- development sub-agent 只允许处理 Story 10.5 明确任务涉及的文件。
- 外部 drift 不纳入 Story 10.5 范围；若必须触碰同一文件，需在结果中明确说明 Story 10.5 改动与既有 drift 的边界。

风险：

- Story 10.5 会触及 fixtures、expected snapshots、release manifest、dist manifest、canonical source check、manifest validation 和 docs，变更面大，CR 必须重点看 selected module truth 与 default baseline 是否混淆。
- `npm run build` 与 `npm run release:packaging-check` 不能并行；release gate 必须 build-first 串行执行。
- 当前 worktree 仍有用户外部 drift，尤其 PPT / html-ppt 相关 support skill 与 analysis docs，development 和最终提交均需隔离。

待关注问题：

- default no-ecosystem baseline 仍要明确，但不能成为 selected ecosystem install 的全局 expected count。
- selected backend / frontend / other fixture cases 必须有正向断言和 unselected negative assertions。
- Packaging manifest 必须包含 nested ecosystem source files，同时继续排除 `test/fixtures/`、cache/temp/build output。

## 2026-07-07 00:02 CST

development 已完成，当前可进入 CR reviewer。

补充判断：

- worker 明确未执行 CR、未 commit、未 push，符合外层编排边界。
- Story 10.5 的验证包含 build-first 串行 release gate，符合 AC6。
- Story 10.5 触及 release manifest、fixtures 和 docs，reviewer 需要重点检查 selected module truth 是否真的替代了 global fixed count。

下一步：

- 启动 fresh reviewer sub-agent 执行 `bmenhance-cr-01-reviewer 10.5`。
- reviewer 完成前不启动 evaluator。

## 2026-07-07 00:13 CST

reviewer round 1 已完成，发现 3 个 `[中] patch`。

补充判断：

- 三个 finding 都直指 Story 10.5 AC3 / AC5 的 release confidence 闭环，不能由外层直接忽略。
- 按编排规则，必须先启动 evaluator 独立评估 finding 是否有效；evaluator 确认需要修复后再启动 fixer。

下一步：

- 启动 fresh evaluator sub-agent 执行 `bmenhance-cr-02-evaluator 10.5`。
- evaluator 完成前不启动 fixer。

## 2026-07-07 00:18 CST

evaluator round 1 已完成，确认 3 个 reviewer findings 均有效且阻塞。

补充判断：

- 当前不能进入 closeout。
- fixer 的范围必须严格限定为 3 个 P1：core-only selected validation、packaging ecosystem assertion 泛化、generated output exclusion gate。
- 修复完成后必须重新 reviewer / evaluator。

下一步：

- 启动 fresh fixer sub-agent 执行 `bmenhance-cr-03-fixer 10.5`。

## 2026-07-07 00:23 CST

fixer 已完成 3 个 P1 修复并追加修复记录。

补充判断：

- 当前仍不能进入 rules extractor / TODO tracker / finalizer。
- 必须先启动 fresh reviewer round 2，复核 selected-module validation、ecosystem source inclusion 和 generated output exclusion 三个闭环。
- reviewer round 2 完成后再启动 evaluator round 2；不得跳过 evaluator。

下一步：

- 关闭已完成 fixer sub-agent。
- 启动 fresh reviewer sub-agent 执行 `bmenhance-cr-01-reviewer 10.5` round 2。

## 2026-07-07 00:29 CST

reviewer round 2 已通过，确认 3 个 P1 修复闭环且未发现新阻塞项。

补充判断：

- 当前仍不能进入 rules extractor / TODO tracker / finalizer。
- 按 strict serial，必须先启动 evaluator round 2 独立评估 reviewer round 2 结论。
- 若 evaluator round 2 通过，才允许进入 rules extractor。

下一步：

- 关闭已完成 reviewer sub-agent。
- 启动 fresh evaluator sub-agent 执行 `bmenhance-cr-02-evaluator 10.5` round 2。

## 2026-07-07 00:34 CST

evaluator round 2 已通过，确认 reviewer round 2 结论成立。

补充判断：

- Story 10.5 不需要重新 fixer。
- 可以进入 closeout 链，但仍必须严格按 `rules extractor -> TODO tracker -> finalizer` 顺序执行。
- 只有 finalizer 完成并同步 Story / sprint 状态后，才允许进入 Story 10.6。

下一步：

- 关闭已完成 evaluator sub-agent。
- 启动 fresh rules extractor sub-agent 执行 `bmenhance-cr-04-rules-extractor 10.5`。

## 2026-07-07 00:41 CST

rules extractor 已完成，Story 10.5 的 3 个 P1 均沉淀为可复用 CR 规则。

补充判断：

- 规则提取只更新 `cr-rules-summary.md`，未触碰实现代码或 Story 状态。
- closeout 链下一步只能进入 TODO tracker，不能跳到 finalizer。

下一步：

- 关闭已完成 rules extractor sub-agent。
- 启动 fresh TODO tracker sub-agent 执行 `bmenhance-cr-05-todo-tracker 10.5`。

## 2026-07-07 00:43 CST

TODO tracker 已完成，确认无新增/更新 CR TODO backlog。

补充判断：

- closeout 链只剩 finalizer。
- finalizer 必须同步 Story 10.5 文件状态与 `sprint-status.yaml`，并在完成后才能进入 Story 10.6。

下一步：

- 关闭已完成 TODO tracker sub-agent。
- 启动 fresh finalizer sub-agent 执行 `bmenhance-cr-06-finalizer 10.5`。

## 2026-07-07 00:47 CST

finalizer 已完成，Story 10.5 与 sprint tracker 均为 `done`。

补充判断：

- Story 10.5 已满足进入下一 Story 的终止条件。
- Story 10.6 是 Epic 10 中下一个 `ready-for-dev` Story。
- `epic-10` 仍为 `in-progress`，因为 Story 10.6 尚未完成。

下一步：

- 进入 Story 10.6 preflight。
