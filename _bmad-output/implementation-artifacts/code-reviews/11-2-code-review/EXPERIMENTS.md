# Experiments（实验记录）

## 2026-09-03 00:40:33 CST — Preflight / Round 0

- Story ID：11.2
- 执行项：`goal-orchestrator-epic-story-code-review-runner` Next Story Gate / Step 0–1
- 选择原因：Story 11.1 已满足全部 completion criteria，strict-serial 允许进入 Story 11.2。
- 结果：确认 11.1 为 `done` 且 completion gate `PASS`；11.2 为 `ready-for-dev`，无 kickoff/CR 历史；mixed worktree 仅为同一 Epic goal 的前序累积变更。
- 下一步判断：启动 fresh development sub-agent 执行 `/bmad-dev-story story 11-2`。必须先关闭 `SPEC 01`/`SPEC 04` owner decision，并取得 kickoff `PASS` / `PASS_EQUIVALENT`；否则 HALT，不启动 Reviewer。

## 2026-09-03 — Development / Round 1

- Story ID：11.2
- 执行项：`bmad-dev-story`
- 选择原因：Story 11.1 completion 与 current gate 已满足，Story 11.2 kickoff 可关闭 public schema owner decision并实现 fresh projection。
- 结果：Owner decision 选择 additive optional `artifactRoots[]` 且 v1 不 bump，`SPEC 01/04` 同变更更新；kickoff/completion gate 均 `PASS`；Story/tracker 为 `review`。实现覆盖七 field config、authorization+lock 后七目录、manifest/CommandResult/ReadyCheck/Ready Summary 与 fresh fixtures。Focused 31/31、affected 81/81、full 475 passed/4 todo、canonical/packaging/build/diff checks 通过。
- 下一步判断：启动 fresh `bmenhance-cr-01-reviewer 11-2`；Development green evidence 不替代独立 CR。

## 2026-09-03 — Canonical Source Governance / D0-D2

- Story ID：11.2
- 执行项：`speclite-canonical-source-governance-runner`
- 选择原因：Story 11.2 修改 `assets/source/speclite/sdlc-skills/module.yaml`，workspace hook 要求影响分类、D0 closure 与 D1/D2 决策记录。
- 结果：warn/strict checker 均 `status: ok`、findings 0、decisionRecordRequired false；影响类为 `canonical-source-truth:D0` 与 `module-discovery-contract:D0`。补跑 module/fixture focused 61/61、packaging check 与 diff check 均通过。D1 public docs 发现旧 defaults，但不在 Story 授权范围，记录 `skipped` 并交 CR；D2 living legacy `skipped`，frozen records `historical snapshot`。
- 下一步判断：治理 runner 不越权修改 docs；Reviewer 必须判断 D1 skip 是后续受控文档同步还是 Story 11.2 blocker。最终完成前仍需重新运行 `speclite-check-canonical-source-change`。

## 2026-09-03 — CR Reviewer / Round 1

- Story ID：11.2
- 执行项：`bmenhance-cr-01-reviewer`
- 选择原因：Development/gates/治理 D0 已完成，需独立审查 fresh projection 与 D1 docs决策。
- 结果：不通过；2 个 `[中]/patch`。ReadyCheck 缺 fresh manifest projection reconciliation；D1 public docs 仍发布旧 defaults。Additive v1、必要额外文件、packaging evidence 与 11.3+ boundary 通过。验证全绿，审查方法层串行降级。
- 下一步判断：启动 fresh `bmenhance-cr-02-evaluator 11-2`；不得直接修复或把 D1 finding 擅自写入 TODO。

## 2026-09-03 — CR Evaluator / Round 1

- Story ID：11.2
- 执行项：`bmenhance-cr-02-evaluator`
- 选择原因：Reviewer Round 1 不通过，需独立裁决 ReadyCheck reconciliation 与 D1 docs scope。
- 结果：Finding #1 为 P1 bounded source/test fix，复用 `manifest-schema.malformed-field`；Finding #2 为 P2 current docs patch，精确授权 8 个文件/章节，不转 TODO。整体不通过，无用户决策点。
- 下一步判断：启动 fresh `bmenhance-cr-03-fixer 11-2`；只修 evaluator批准范围，随后重新 Reviewer/Evaluator。

## 2026-09-03 — CR Fixer / Round 1

- Story ID：11.2
- 执行项：`bmenhance-cr-03-fixer`
- 选择原因：Evaluator 确认 P1 ReadyCheck 与 P2 D1 docs bounded fixes。
- 结果：ReadyCheck fail-closed reconciliation 与 regressions完成；8 docs限定章节已同步；evaluation 已追加 fix record。Focused/affected/docs/canonical/full/build/packaging/diff checks 全绿。授权外 generic path示例仅记录未改。
- 下一步判断：回到 fresh Reviewer Round 2，复核历史 findings 与 docs follow-up；不得直接 finalizer。

## 2026-09-03 — CR Reviewer / Round 2

- Story ID：11.2
- 执行项：`bmenhance-cr-01-reviewer`
- 选择原因：Fixer Round 1 后强制复审两项历史 finding 与授权外 docs evidence。
- 结果：历史 ReadyCheck P1关闭，bounded docs主体关闭；新增2个 `[中][新]/patch`：detailed explicit root被标为 `fresh-default`，brownfield tutorial Step1/6仍为旧default quick paths。其余 generic routing strings不属于当前patch。验证全绿。
- 下一步判断：启动 fresh `bmenhance-cr-02-evaluator 11-2` Round 2；需先裁决 fresh lifecycle显式override的mode语义，不能直接改resolver。

## 2026-09-03 — CR Evaluator / Round 2

- Story ID：11.2
- 执行项：`bmenhance-cr-02-evaluator`
- 选择原因：Reviewer Round 2 发现 fresh detailed per-root override 与 `resolutionMode` literal 可能冲突，必须由独立 Evaluator 对 owner contracts 做证据裁决。
- 结果：整体不通过。Finding #1 判为 `P1 / decision_needed`：Story 11.2 AC4 与 kickoff gate 要求 fresh roots 为 `fresh-default`，但 detailed prompt/tests 允许非空逐-root显式输入，Story 11.1 resolver contract 又要求 mode反映实际来源；`SPEC 09` 未定义该交叉情形。Finding #2 判为 P2 exact patch，可修 tutorial Step 1/6；其余 generic route strings 保留为 Story 11.4+ / CR TODO 候选。
- 下一步判断：在 Owner 明确选择 `explicit-config` 或 `fresh-default` 前 HALT；不启动 Fixer、不修改 contract、不进入 closeout。Owner 决策后仅按批准的 controlled correction 与 evaluator-bounded范围继续。

## 2026-09-03 — Owner Decision / Round 2 Resume

- Story ID：11.2
- 执行项：Owner Decision Gate
- 选择原因：Evaluator Round 2 的 P1 `decision_needed` 必须由用户明确裁决，不能由 Fixer 猜测。
- 结果：用户确认方案 A，并授权 controlled correction：fresh detailed 非空逐-root输入使用 `explicit-config`；quick/default 与仅由 `output_folder` 派生的逐-root defaults继续使用 `fresh-default`。授权 owner artifacts为 `SPEC 09`、Story 11.1 resolver contract、Story 11.2 AC/kickoff evidence。
- 下一步判断：启动 fresh `bmenhance-cr-03-fixer 11-2` Round 2；严格限定在 owner correction、evaluator列明的 resolver/tests/必要 detailed fixture，以及 tutorial Step 1/6，不扩展到 Story 11.3+ routing。

## 2026-09-03 — CR Fixer / Round 2

- Story ID：11.2
- 执行项：`bmenhance-cr-03-fixer`
- 选择原因：用户已批准方案 A 与 owner-artifact controlled correction，Evaluator Round 2 的 P1 decision gate和P2 tutorial patch均已有精确修复边界。
- 结果：四份 owner artifacts追加 dated correction；resolver对 fresh detailed非空逐-field输入返回 `explicit-config`，未显式 fields、quick/default及仅 `output_folder` 派生 roots保持 `fresh-default`；补 focused/negative-guard tests；tutorial仅更新 Step 1/6；evaluation追加 GPT-5.5 fix record。Focused 18/18、affected 48/48、full 481 passed/4 todo，docs/build/canonical warn+strict/packaging/diff checks通过。
- 下一步判断：启动 fresh `bmenhance-cr-01-reviewer 11-2` Round 3，复核两轮历史 findings、controlled correction一致性和范围；不得直接 finalizer。

## 2026-09-03 — CR Reviewer / Round 3

- Story ID：11.2
- 执行项：`bmenhance-cr-01-reviewer`
- 选择原因：Fixer Round 2完成后必须由fresh reviewer独立复核，不得以fixer green evidence直接closeout。
- 结果：通过，新增 findings为0；Round 1 ReadyCheck/docs与Round 2 mode/tutorial findings全部Closed。Focused 18/18、affected 48/48、full 481 passed/4 todo，docs/build/canonical warn+strict/packaging/diff checks及ad-hoc detailed full-install propagation均通过；`npm run lint`仅因未配置script失败，不计产品回归。
- 下一步判断：启动 fresh `bmenhance-cr-02-evaluator 11-2` Round 3；只有Evaluator也通过才允许进入CR04。

## 2026-09-03 — CR Evaluator / Round 3

- Story ID：11.2
- 执行项：`bmenhance-cr-02-evaluator`
- 选择原因：Reviewer Round 3虽通过，strict-serial仍要求fresh Evaluator独立确认0 findings与历史closure。
- 结果：通过；0 blocking fixes、0 new findings、0 false positives，无需Fixer或新Owner Decision。唯一非阻塞候选是`workflow-artifact-layout.md` generic routing strings，维持Story 11.4+/CR TODO并交CR05处理。Focused 66/66、canonical recommended 61/61、full 481 passed/4 todo，docs/build/canonical warn+strict/packaging/diff checks通过；lint缺失证实为未配置script。
- 下一步判断：最新Reviewer/Evaluator双通过，严格进入CR04 rules extractor；不得跳过CR04/05直接Finalizer。

## 2026-09-03 — CR04 Rules Extractor

- Story ID：11.2
- 执行项：`bmenhance-cr-04-rules-extractor`
- Model Used：GPT-5.5 (gpt-5.5)
- 选择原因：最新 Reviewer Round 3 与 Evaluator Round 3 双通过，strict-serial closeout 允许进入 CR04，但仍禁止执行 CR05/CR06 或 Story 11.3。
- 结果：按 record-only 更新 `_bmad-output/implementation-artifacts/cr-rules/cr-rules-summary.md`。新增 `CR-API-35`（Fresh ReadyCheck optional additive projection fail-closed reconciliation）、`CR-API-36`（`resolutionMode` field-level 来源语义）与 `CR-PROCESS-02`（dated controlled correction 保留原决策轨迹）。D1 current docs drift 因 canonical governance 已覆盖而不重复沉淀；brownfield tutorial Step 1/6 因绑定单一文档 section 不沉淀；`workflow-artifact-layout.md` generic route strings 保持 Story 11.4+ / CR TODO 候选，交 CR05 判断。
- 验证：CR04 后执行结构抽查、canonical source check warn/strict、CR 目录 focused grep、`npm run docs:check`、`npm test -- test/canonical-source-change-check-script.test.ts test/canonical-source-change-check-hook.test.ts` 与 `git diff --check`。
- 下一步判断：进入 CR05 TODO Tracker；不得跳过到 CR06。

## 2026-09-03 — CR05 TODO Tracker

- Story ID：11.2
- 执行项：`bmenhance-cr-05-todo-tracker`
- Model Used：GPT-5.5 (gpt-5.5)
- 选择原因：Round 3 Evaluator 明确 `docs/reference/workflow-artifact-layout.md` generic route strings 为 P2 / future-story / CR TODO 候选，CR04 已交给 CR05 做现有 backlog 去重与 Story 11.4+ owner 范围判断。
- 结果：新增 `TODO-012`。现有 `TODO-009` 至 `TODO-011` 均不涉及 `workflow-artifact-layout.md`、generic routing、`planning-artifacts/research` 或 `speclite-workflow-status.yaml`；Story 11.4-11.9 已覆盖 Analysis、PRD/Epics/Architecture、UX、PRD validation、Implementation Readiness 与 CR routing，但尚未充分覆盖候选行中的 brainstorming、project-context、brownfield planning handoff、correct-course proposal、updater-only workflow status 与 current-differences 说明，因此不按 duplicate skip。
- 验证：复读 backlog 统计与 `TODO-012` 字段；运行 canonical source change checker；运行 `git diff --check`。
- 下一步判断：进入 CR06 Finalizer 前必须先确认 CR05 产物和 checker 仍通过；不得进入 Story 11.3。

## 2026-09-03 — CR06 Finalizer

- Story ID：11.2
- 执行项：`bmenhance-cr-06-finalizer`
- Model Used：GPT-5.5 (gpt-5.5)
- 选择原因：Story 11.2 development、story-kickoff/story-completion gates、最新 Reviewer Round 3 与 Evaluator Round 3、CR04 rules extraction 与 CR05 TODO closeout 均已完成，strict-serial closeout 允许进入 finalizer。
- Live gate 结果：Story 11.1 为 `done` 且 completion gate `target/storyKey=11-1-executable-artifact-root-resolution-contract`、`result=PASS`；Story 11.2 kickoff/completion gate 均为 `speclite.flow-gate-report.v2`、target/storyKey 精确匹配、`result=PASS`；Round 3 reviewer/evaluator 均为 `GPT-5.5 (gpt-5.5)` 且结论通过；CR04 已记录 `CR-API-35`、`CR-API-36`、`CR-PROCESS-02`；CR05 已登记 `TODO-012`。
- 结果：Story 11.2 文件 `Status: review` -> `Status: done`；`_bmad-output/implementation-artifacts/sprint-status.yaml` 中 `11-2-fresh-install-artifact-root-projection: review` -> `done`，`last_updated` 更新为 `2026-09-03 11:54:13 CST`。
- Workflow tracking：`_bmad-output/planning-artifacts/bmm-workflow-status.yaml` 不存在，按 finalizer Skill 记录 skipped，未创建新文件；未发现其他实际存在/适用的 workflow tracking 文件。
- Deferred TODO：`TODO-012` 是 P2 / future-story / deferred non-blocking，状态保持 `open`；本 CR06 未修复、不关闭，也不把它作为 Story 11.2 blocker。
- Boundary：未修改源码、tests、SPEC、canonical source、reviewer/evaluator artifact、CR rules summary 或 TODO backlog；未进入 Story 11.3，未 commit，未 push。
- 验证：focused status/gate reread PASS；canonical source checker warn/strict 均 `status: ok`、`findings: []`、`decisionRecordRequired: false`；`speclite-canonical-source-governance-runner` 与 `speclite-check-canonical-source-change` density checks 均无 warning；focused `npm test -- ...` 8 files / 67 tests passed；`npm run build` PASS；`npm test` 61 files / 481 passed / 4 todo；`npm run release:packaging-check` PASS；`git diff --check` PASS。
- 下一步判断：Story 11.3 的下一步只能从 kickoff gate 开始；不得把 Story 11.2 的 `done` 状态当作 11.3 authorization。
