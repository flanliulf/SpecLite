# Story 9.3 Experiment Notes（执行笔记）

## 2026-06-20 14:55 CST

- 决策：允许 Story 9.3 进入 development。
- 原因：Story 9.3 已创建为 `ready-for-dev`；Story 9.1 和 Story 9.2 均已 `done`，且最新 CR evaluator 均 PASS；Epic 9 因新增 corrective Story 重新进入 `in-progress`，当前 tracker 与 Story 状态一致。
- 范围边界：Story 9.3 只处理 installed self-contained skill package 的 root-level `data/` projection、hash、validation、fixture、update/repair ownership 和 docs references；不得修改 `speclite resolve` contract、workflow business logic、CSV schema、`SKILL.en.md` source-only 策略或 Python fallback 边界。
- 工作树注意事项：当前存在本次已授权的 Story 9.3 创建与 Epic/tracker 同步改动。后续 sub-agent 必须保留其他人的改动，不得回滚、不格式化无关文件、不扩大提交范围。
- 当前下一步：启动 fresh sub-agent 执行 `bmad-dev-story story 9-3`，等待完成后再进入 CR reviewer。

## 2026-06-20 14:55 CST - Development Gate

- 决策：等待 Dalton 完成 development。
- 原因：外层 runner 的串行规则要求开发完成后才能启动 CR reviewer；当前只能做记录和准备，不进入后续 CR 步骤。
- 待关注：Story 9.3 涉及 copy/hash/validate/fixtures/update-repair 多个面，dev 完成后 CR 需要重点检查这些 surface 是否复用了同一 predicate，避免再次出现 writer 与 validator 漂移。

## 2026-06-20 15:09 CST - Development Complete

- 决策：development gate 通过，允许进入 CR reviewer。
- 原因：fresh development sub-agent 已完成，Story 和 sprint tracker 均进入 `review`，并报告 focused、fixture、activation lint、build、full test、packaging check 和 diff check 全部通过。
- 风险：当前通过结果来自 development sub-agent 报告，CR reviewer/evaluator 仍必须基于当前工作树重新审查代码、fixtures 和 Story 证据，不把 development 报告本身当作 CR 通过。
- 待关注：CR 首轮重点检查 shared predicate 是否真正覆盖 copy/hash/validate；fixture refresh 是否由实现语义驱动；`release/packaging-manifest.json` 是否存在不相关漂移；update/repair/uninstall 证据是否足以覆盖 AC5。

## 2026-06-20 15:09 CST - Reviewer Gate

- 决策：已启动首轮 CR reviewer，暂停其它外层步骤。
- 原因：runner 串行规则要求 reviewer 完成后才能启动 evaluator；同一 Story 不允许并行 reviewer/evaluator/fixer。
- 待关注：如果 reviewer 产出包含 patch/decision_needed findings，必须先进入 evaluator 判断有效性，再决定是否 fixer；不得直接修复。

## 2026-06-20 15:09 CST - Reviewer Complete

- 决策：reviewer gate 通过，可进入 evaluator。
- 原因：Round 1 review 文件存在，结论 PASS，0 findings；reviewer 明确未执行修复、提交或推送。
- 风险：reviewer 采用降级串行审查模式，且未重跑 full test / packaging check；evaluator 需要独立确认这是否影响通过结论。
- 待关注：如果 evaluator 认为 reviewer 对全量 release gate 或 package manifest 证据不足，必须进入 fixer 或补证据路径，不能直接 closeout。

## 2026-06-20 15:09 CST - Evaluator Gate

- 决策：已启动首轮 CR evaluator，暂停 fixer 和 closeout。
- 原因：runner 串行规则要求 evaluator 先判断 reviewer findings 是否有效，以及 reviewer PASS 是否足够。
- 待关注：如果 evaluator PASS 且无有效需修复项，才能进入 rules extractor；否则必须按 evaluator 结论启动 fixer。

## 2026-06-20 15:10 CST - Evaluator Conditional Result

- 决策：不启动 fixer，先补 release evidence。
- 原因：evaluator 确认 0 个有效代码 findings，但明确 full test 与 packaging check 的当轮证据缺失，阻塞 finalizer。
- 风险：当前出现 15 个 Story 9.3 scope 外的 `assets/source/speclite/**/references/workflow-details.md` 修改；这些不能作为 `data/` projection 的必要变更纳入最终提交。若 packaging check 因这些 source drift 失败，需要停止并隔离/请示，不能通过扩大 Story 9.3 范围解决。
- 待关注：补证据后仍需让最新 CR reviewer/evaluator 产物反映完整证据，避免直接用主 agent 手工记录替代 CR gate。

## 2026-06-20 15:18 CST - Scope Blocker

- 决策：暂停进入 packaging check、Round 2 reviewer/evaluator 和 closeout。
- 原因：full test 已因 Story 9.3 scope 外 canonical source drift 失败；继续刷新 fixtures 或 manifest 会把不相关 workflow path normalization 混入 Story 9.3。
- 风险：如果直接扩大 Story 9.3 范围，会违反 Story 的 `data/` projection 边界；如果直接回滚这些文件，也会违反不擅自回退用户/生成改动的规则。
- 用户介入点：需要用户确认如何处理 15 个 scope 外 `workflow-details.md` 改动：隔离/还原后继续 Story 9.3，或授权扩大范围并同步 fixtures/package evidence。

## 2026-06-20 15:29 CST - Scope Blocker Resolved

- 决策：按用户授权隔离 scope 外 canonical source drift，恢复 Story 9.3 release evidence 链路。
- 原因：用户确认 15 个 `workflow-details.md` 改动来自另一个会话，并要求隔离后继续。
- 风险：`release/packaging-manifest.json` 仍有 package hash diff；需要由 `npm run release:packaging-check` 判断它是否属于 Story 9.3 的有效变更，不能仅凭 diff 猜测。
- 待关注：补证据通过后需进入 Round 2 reviewer/evaluator，让最新 CR 产物反映完整 evidence。

## 2026-06-20 15:31 CST - Evidence Complete

- 决策：进入 Round 2 reviewer/evaluator，而不是直接 closeout。
- 原因：Round 1 evaluator 的阻塞点已通过命令证据消除，但最新 CR 产物仍是 conditional pass；需要新的 reviewer/evaluator 文件形成可追溯放行依据。
- 风险：Round 2 reviewer 需要识别这是 evidence-only continuation，不应重新引入 scope 外 `workflow-details.md` 改动，也不应执行 fixer。

## 2026-06-20 15:31 CST - Round 2 Reviewer Gate

- 决策：已启动 Round 2 reviewer，暂停 evaluator 和 closeout。
- 原因：外层 strict serial 要求 reviewer 完成后才能启动 evaluator。
- 待关注：Round 2 reviewer 应重点确认 evidence gap 已关闭、scope 外 canonical source drift 已隔离、当前 diff 仍符合 Story 9.3 边界。

## 2026-06-20 15:32 CST - Round 2 Reviewer Complete

- 决策：进入 Round 2 evaluator。
- 原因：Round 2 reviewer PASS，0 findings，并明确确认 Round 1 evidence gaps 已关闭。
- 风险：closeout 仍需 evaluator 独立评估；不能只凭 reviewer PASS 执行 finalizer。

## 2026-06-20 15:32 CST - Round 2 Evaluator Gate

- 决策：已启动 Round 2 evaluator，暂停 closeout。
- 原因：runner 要求 reviewer 与 evaluator 均通过后才能进入 CR 收口。
- 待关注：如果 evaluator 仍认为证据不足，需要按其结论处理；否则进入 rules extractor / todo tracker / finalizer。

## 2026-06-20 15:33 CST - Round 2 Evaluator Complete

- 决策：不执行 fixer，进入 closeout。
- 原因：Round 2 evaluator PASS，0 effective findings，明确无需 CR TODO，可进入 closeout / finalizer。
- 风险：rules extractor 默认 analysis-only，未获用户确认不得写全局文档；TODO tracker 只有识别到非阻塞项且需确认时才写 backlog。

## 2026-06-20 15:33 CST - Rules Extractor Gate

- 决策：已启动 rules extractor，暂停 TODO tracker。
- 原因：closeout 顺序必须为 rules extractor -> TODO tracker -> finalizer。
- 待关注：若 rules extractor 提出候选但需用户确认，不得在当前 closeout 中擅自写全局文档；可记录为无需阻塞 finalizer的建议。

## 2026-06-20 15:34 CST - Rules Extractor Complete

- 决策：继续执行 TODO tracker。
- 原因：rules extractor 无候选规则、无写入建议、无交给 TODO tracker 的项；但 runner closeout 仍要求执行 TODO tracker 作为独立步骤。
- 风险：TODO tracker 不应创建空 backlog 或写入无候选条目。

## 2026-06-20 15:34 CST - TODO Tracker Gate

- 决策：已启动 TODO tracker，暂停 finalizer。
- 原因：finalizer 只能在 rules extractor 和 TODO tracker 都完成后执行。
- 待关注：如果 TODO tracker 无候选，应保持 backlog 不变；如果有候选需要确认，不得擅自写入。

## 2026-06-20 15:35 CST - TODO Tracker Complete

- 决策：进入 finalizer。
- 原因：TODO tracker 确认无需新增 TODO，backlog 未变更；closeout 前置步骤已完成。
- 风险：finalizer 如判断 Epic 9 全部 Story done 并要求更新 Epic status，需要遵循其确认要求，不擅自越权。

## 2026-06-20 15:35 CST - Finalizer Gate

- 决策：已启动 finalizer，暂停 commit。
- 原因：finalizer 完成前，Story done 和 tracker done 尚未形成权威状态。
- 待关注：若 finalizer 未更新 Epic status，最终 commit 前要明确记录原因和当前 tracker 状态。

## 2026-06-20 15:42 CST - Finalizer Complete

- 决策：进入最终 scoped audit 和本地 commit。
- 原因：Story 9.3 已 `done`，sprint story entry 已 `done`，Round 2 evaluator approved，closeout 三步已完成。
- 风险：Epic 9 仍为 `in-progress`，因为 finalizer 要求用户确认后才可更新 Epic status；本次提交不擅自改 Epic 状态。
- 待关注：最终 staging 必须排除已隔离到 `/tmp/speclite-story-9-3-scope-out-workflow-details-20260620-1520.patch` 的 scope 外 canonical source 改动。
