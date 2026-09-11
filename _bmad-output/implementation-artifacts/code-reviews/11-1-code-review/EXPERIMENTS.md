# Experiments（实验记录）

## 2026-09-02 23:03:46 CST — Preflight / Round 0

- Story ID：11.1
- 执行项：`goal-orchestrator-epic-story-code-review-runner` Step 0–1
- 选择原因：用户启动 Epic 11 development/CR goal；编排器必须先判断新任务或续跑，并初始化当前 Story 日志。
- 结果：确认 fresh IR 为 `READY`、Epic 11 SR Round 2 双通过、11.1–11.10 均为 `ready-for-dev`、工作树干净、Story 11.1 无 code-review 或 Flow Gate 产物。
- 下一步判断：启动 fresh development sub-agent 执行 `/bmad-dev-story story 11-1`。必须先通过 `story-kickoff` gate；未通过则 HALT 并记录，不启动 Reviewer。

## 2026-09-02 23:27:09 CST — Development / Round 1

- Story ID：11.1
- 执行项：`bmad-dev-story`
- 选择原因：fresh IR 与 SR 已通过，Story 11.1 是 Epic 11 strict-serial 起点；必须先完成 Story-level gates 与 bounded development。
- 结果：kickoff gate 与 completion gate 均为 `PASS`；新增 config-owned artifact-root resolver、schema fields、共享 symlink boundary guard、`artifact-path.unresolved-token` taxonomy 条目与 focused tests；Story/tracker 已进入 `review`。验证为 focused 7/7、reader 4/4、path 9/9、affected 26/26、full 473 passed/4 todo，build 与 diff check 通过。
- 下一步判断：Development 已满足进入 CR 的条件。启动 fresh `bmenhance-cr-01-reviewer 11-1`，等待完成后才可启动 Evaluator。

## 2026-09-02 — CR Reviewer / Round 1

- Story ID：11.1
- 执行项：`bmenhance-cr-01-reviewer`
- 选择原因：Development、completion gate 与 review 状态均已满足，需由独立只读 Reviewer 审查 AC 与实现证据。
- 结果：结论不通过；发现 1 个 `[中]/patch` finding。`resolveArtifactRootsFromProjectConfig()` 返回正确 roots/modes，但 `configSources` 为空，可能未满足 merged config/provenance handoff。测试、build、diff check 均通过；无 failed layer，三层按串行降级执行。
- 下一步判断：不得直接修复。启动 fresh `bmenhance-cr-02-evaluator 11-1` 独立评估 finding 的准确性、严重性与修复授权。

## 2026-09-02 — CR Evaluator / Round 1

- Story ID：11.1
- 执行项：`bmenhance-cr-02-evaluator`
- 选择原因：Reviewer Round 1 不通过；必须由独立 evaluator 判断唯一 finding 是否为真实交付 blocker。
- 结果：确认 finding 有效并评为 P1。定向复现 roots/modes 正确但 `configSources` 为空；判定缺口位于 Story 11.1 的 Functional Anchor，而非未来 consumer concern。无误报、无 CR TODO、无用户决策点。
- 下一步判断：启动 fresh `bmenhance-cr-03-fixer 11-1`，仅在 evaluator 明确列出的 source/test scope 内修复；修复后重新 Reviewer/Evaluator。

## 2026-09-02 — CR Fixer / Round 1

- Story ID：11.1
- 执行项：`bmenhance-cr-03-fixer`
- 选择原因：Evaluator 确认唯一 P1 并授权 bounded source/test scope。
- 结果：已将 no-key full-read source selection 改为 nested leaf dotted-key provenance；新增两组 regression，focused 12/12、build、diff check 通过。Full suite 60/61 files，473 tests passed、4 todo；唯一失败是 `test/contract-anchors.test.ts` 仍锚定旧 `sources: {}`。Fixer 未越权修改范围外文件，并已恢复 packaging hash churn。
- 下一步判断：按 CR 循环回到 fresh Reviewer Round 2。Reviewer 必须同时复核历史 P1 与新的 full-suite anchor failure；外层不直接扩大 fixer scope。

## 2026-09-02 — CR Reviewer / Round 2

- Story ID：11.1
- 执行项：`bmenhance-cr-01-reviewer`
- 选择原因：Fixer Round 1 后必须复审，且 full suite 存在一个范围外 contract anchor 失败。
- 结果：Round 1 P1 已关闭；新增 1 个 `[中][新]/patch` finding。`test/contract-anchors.test.ts` 仍期望 no-key full-read `sources: {}`，与 approved leaf provenance handoff 冲突；runtime roots/modes、public resolve output、explicit-key behavior 与 merge precedence 未见回归。Full suite 唯一失败为该 anchor。
- 下一步判断：启动 fresh `bmenhance-cr-02-evaluator 11-1` Round 2，判断 stale test anchor 是否为 P1 bounded patch，并明确 fixer scope。

## 2026-09-03 — CR Evaluator / Round 2

- Story ID：11.1
- 执行项：`bmenhance-cr-02-evaluator`
- 选择原因：Reviewer Round 2 发现新的 stale contract anchor，并判定整体不通过。
- 结果：历史 P1 已关闭；新 finding 确认有效、P1、test-only。`sources: {}` 不是 public CLI contract，当前 leaf provenance 不应回退。授权仅修改 `test/contract-anchors.test.ts` 指定用例，并追加 evaluation fix record；无用户决策点。
- 下一步判断：启动 fresh `bmenhance-cr-03-fixer 11-1` Round 2，执行极窄 expectation 更新；随后重新 Reviewer/Evaluator。

## 2026-09-03 — CR Fixer / Round 2

- Story ID：11.1
- 执行项：`bmenhance-cr-03-fixer`
- 选择原因：Evaluator Round 2 授权 test-only stale anchor P1 修复。
- 结果：仅修改 `test/contract-anchors.test.ts` 指定 expectation，并在 Round 2 evaluation 追加 fix record。Focused 19/19、full 474 passed/4 todo、build、diff check 通过；生成的 packaging hash drift 已恢复。
- 下一步判断：启动 fresh Reviewer Round 3，复核历史 findings 与全量回归；不能因 tests 绿跳过复审复评。

## 2026-09-03 — CR Reviewer / Round 3

- Story ID：11.1
- 执行项：`bmenhance-cr-01-reviewer`
- 选择原因：Fixer Round 2 后必须复审，确认两项历史 P1 关闭且无新回归。
- 结果：通过。两个历史 P1 均关闭，新 findings 0，failed layers 0。Focused 19/19、affected 35/35、public output check、full 474 passed/4 todo、build、diff check 全绿；无 lint script。
- 下一步判断：启动 fresh `bmenhance-cr-02-evaluator 11-1` Round 3；Reviewer 通过不替代 Evaluator gate。

## 2026-09-03 — CR Evaluator / Round 3

- Story ID：11.1
- 执行项：`bmenhance-cr-02-evaluator`
- 选择原因：Reviewer Round 3 通过后，必须由独立 Evaluator 完成最新双 gate。
- 结果：通过。两个历史 P1 均关闭；新 findings、TODO、用户决策点均为 0。独立 focused 43/43 与 diff check 通过；11.2+ deferred surfaces 无 diff。
- 下一步判断：进入 closeout，严格串行执行 CR04 rules extractor、CR05 TODO tracker、CR06 finalizer；任一步失败则停止后续步骤。

## 2026-09-02 — Verification Side Effect Cleanup（验证副作用清理）

- Story ID：11.1
- 执行项：外层 scope hygiene
- 选择原因：Reviewer 的 packaging verification 改写了 Story File List 之外的 `release/packaging-manifest.json` package hash。
- 结果：live diff 证明仅单行 `packageHash` 漂移；已使用精确 patch 恢复 pre-review 原值，未回滚任何 Story 11.1 变更。
- 下一步判断：该文件不纳入 evaluator/fixer 或最终 commit scope。

## 2026-09-03 — CR04 Rules Extractor（规则提炼）

- Story ID：11.1
- 执行项：`bmenhance-cr-04-rules-extractor`
- 选择原因：最新 Reviewer Round 3 与 Evaluator Round 3 均通过，且外层编排授权 CR04 采用默认推荐决策；本 Story 只能 record-only，不得修改全局文档。
- 结果：完成全部 CR 历史分析。新增 `CR-API-34`：Artifact-root resolver handoff 必须保留 leaf dotted-key provenance；Story 11.1 的 stale contract anchor 复现已归并到既有 `CR-API-13`，索引来源更新为 `2-4, 11-1`、评分更新为 `9/12`。未修改 project-context、Architecture、AGENTS、CLAUDE、Story、SPEC、Flow Gate、源码、测试或 tracker。
- 下一步判断：CR04 未识别未解决非阻塞项，交给 CR05 的候选为 0。严格串行进入 `bmenhance-cr-05-todo-tracker 11-1`，不得提前执行 CR06。

## 2026-09-03 — CR05 TODO Tracker（待办提取）

- Story ID：11.1
- 执行项：`bmenhance-cr-05-todo-tracker`
- 选择原因：CR04 已完成并更新三份日志，且需要独立确认所有 11-1 CR 产物是否存在未解决非阻塞候选。
- 结果：扫描全部 11-1 CR summaries/evaluations 后确认无新增 TODO。Round 1、Round 2、Round 3 evaluation 均明确“无需要转入 CR TODO 的 finding”；Round 3 evaluation 进一步明确 TODO/用户决策点为 0。现有 `cr-todo-backlog.md` 无 11-1 open 项，本步未修改 backlog。
- 下一步判断：CR05 完成后允许进入 `bmenhance-cr-06-finalizer 11-1`。CR06 必须重新核验 latest evaluation、completion gate、Story status 和 sprint tracker，不得推进 Story 11.2 或更新 Epic 状态。

## 2026-09-03 00:36 CST — CR06 Finalizer（状态收尾）

- Story ID：11.1
- 执行项：`bmenhance-cr-06-finalizer`
- 选择原因：CR04 与 CR05 均已完成并更新三份日志；最新 Reviewer/Evaluator 双通过，且 CR05 确认无 open TODO 候选。
- 结果：重新核验 latest evaluation 为通过，completion gate frontmatter 为 `mode: story-completion`、`target/storyKey: 11-1-executable-artifact-root-resolution-contract`、`result: PASS`，Story 与 sprint tracker 入场状态均为 `review`。已将 Story `Status` 改为 `done`，将 `sprint-status.yaml` 中 `11-1-executable-artifact-root-resolution-contract` 改为 `done`，并更新 `last_updated: 2026-09-03 00:36 CST`。
- 下一步判断：`_bmad-output/planning-artifacts/bmm-workflow-status.yaml` 不存在，按 CR06 文件容错规则跳过。Epic 11 仍有 Story 11.2-11.10 未 done，因此 Epic 11 保持 `in-progress`，不得更新 Epic 状态或推进 Story 11.2。
