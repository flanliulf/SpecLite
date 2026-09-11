---
Story: 11-9
Round: 22
Date: 2026-09-07
Model Used: GPT-5.6Sol
Type: Code Review Summary
---

## Review Conclusion（审查结论）

本轮为 Round 21 bounded Fixer 后的 fresh 复审。Blind Hunter、Edge Case Hunter、Acceptance Auditor 均由独立 fresh agent 完成，正式输出 `3/3`，无 timeout、empty output 或降级。受四个并发 slot 限制，先并行执行 Blind + Edge；Blind 完成释放 slot 后再启动 Acceptance。Blind 仅读取冻结的 isolated `review-input.diff`，没有读取 Story、历史 CR、项目上下文或其他审查层输出。

三层共返回 `19` 条 raw observations/findings（Blind `14`、Edge `2`、Acceptance `3`）。Aggregator 不按层数投票，并排除通用 YAML/HTML parser、`%TAG`/tag vocabulary、TOCTOU、active filename chronology、lineage/scope 泛化、`supersededIndex` 与其他超出本轮授权的观察；证据充分后立即收敛。按 Round 21 五组 bounded fix 去重后保留 **3 个阻塞 finding**：prior-fix 跨 round freshness 未验证、clean `PASS` 跳过非空 deferred table、YAML-equivalent `fixRecord` key 被当 absent。总体结论：**FAIL / FINDINGS_REPORTED**；不得进入可收口 PASS。

Round 21 对 owning authority 的裁决保持有效：shared contract / owning CR06 高于 Round 20 的错误 same-round positive，Round 20 文件仅保留为历史；本轮没有重开 Owner Gate。`supersededIndex` identity/continuity 继续作为 carried deferred P2。

## Layer Results（三层结果）

| Layer | Execution | Formal output | Aggregated result |
| --- | --- | --- | --- |
| Blind Hunter | PASS | 14 observations | clean `PASS` 跳过 deferred table 并入 Finding #2；其余多为超出 bounded current contract 的通用语法、scope/lineage或列表语义观察，未进入正式结论。 |
| Edge Case Hunter | PASS | 2 findings | clean `PASS` deferred table并入 Finding #2；quoted/spaced `fixRecord` key并入 Finding #3。 |
| Acceptance Auditor | PASS as execution / `FINDINGS_REPORTED` | 3 findings | 独立确认 Findings #1–#3，并确认其余五组主路径闭合。 |
| Aggregator targeted inspection | PASS as reproduction | current code/test/contract inspection + read-only helper probe | 直接确认三条控制流；focused suite GREEN 包含一个未证明时间 freshness 的 positive control。 |

### Layer Identity（审查层身份）

- Blind Hunter SHA-256：`4959fc9c7a7bae3137eac5da1fb609e6bb6091b1a61ca3dccaff36bb67f05c3c`
- Edge Case Hunter SHA-256：`382320eea572d71b13e1fb5697abde76b760de4633ec67f0a97ed9244ba3df6c`
- Acceptance Auditor SHA-256：`43c0985953daa2b25a046e0a88e2ce779c72d1aee7c633c11ff5b9adc2e2ba46`
- Isolated review input SHA-256：`a79806b2728687473a128a4e13a76a4af866c609bd175aa49b358b5367e6a7c2`
- Resolver SHA-256：`a928e35392488e5c5b0977c68f8801d28f66590ab840c55f3b7430ec996d67b0`
- Focused test SHA-256：`4c5fe99384d2601e2474be7ab0d0d69746389af638392a0ac59d2d1b018d5c5e`

## Previous Round Review（上轮问题回顾）

### Closed（已关闭）

1. Round 21 / Fix group 1 — document-start rejected property state
   - exact `---` 后 duplicate tag、duplicate anchor、第三个 property 与已有 malformed bounded property路径会进入 ambiguous fail-close；sprint/workflow authentic controls通过。
2. Round 21 / Fix group 2 — scope exception 与 safe integer
   - `PASS_RECOMMENDED` 现在要求 empty `scopeExceptions`；finding/accepted/convergence/CR04 counts要求 nonnegative safe integer。
3. Round 21 / Fix group 3 — CR04 clean PASS counts
   - clean `PASS` 要求 candidate/global counts均为零，current focused negative覆盖持续通过。

### Partially Closed（部分关闭）

1. Round 21 / Fix group 4 — CR05 exact Deferred TODO set
   - `PASS_WITH_DEFERRED_TODOS` 已从 exact heading/table读取 fingerprint并与 CR05 unique mapped set做无序 exact equality。
   - clean `PASS` 分支仍完全跳过正文 table，见 Finding #2。
2. Round 21 / Fix group 5 — `fixRecord` shape 与 higher fresh round
   - exact unquoted `fixRecord:` 的 scalar/duplicate/partial/unknown/malformed与 current完整 block均 fail-close。
   - YAML-equivalent quoted/spaced key仍被当 absent；higher-round positive只验证编号更高，未验证时间晚于 prior fix，见 Findings #1/#3。

### Still Non-blocking Deferred（仍为非阻塞待办）

1. Round 5–22 / `supersededIndex` identity/continuity
   - 维持 carried deferred P2 / CR05 TODO；本轮无升级证据，不得混入 P1 patch。

## New Findings（新发现）

### 1. [高][上轮遗留] higher round 未证明晚于 prior fix

- **来源**：auditor + aggregator
- **分类**：patch

- **证据**
  - `inspectCandidate()` 会逐个读取 current artifacts，但调用 `validDoneFinalizer()` 时只传当前 finalizer round；`validDoneFinalizer()` 又只读取该 round 的 review/evaluation，并在 current evaluation 不带 `fixRecord` 时将 `fixMutationTime` 退化为 current `evaluationTime`。它没有累积 lower-round latest `fixRecord.sourceMutationAt`。位置：`assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs:246-347,451-580`。
  - Round 21 positive control 先给 Round 1 evaluation 写入 `fixRecord.sourceMutationAt: 2026-09-05T12:19:00Z`，随后创建 Round 2。可是 helper 对所有 round 固定生成 review `12:00:00Z`、evaluation `12:10:00Z`，仍期待 resolver success。位置：`test/code-review-contract.test.ts:3550-3578,3888-3943,4126-4178`。

- **影响**
  - 仅凭更高 round number，修复前已生成的 stale review/evaluation也可被当作 fresh evidence并认证 legacy `DONE`，违反 shared completion freshness、owning CR06 与 Round 21 第 5 组授权。

- **建议**
  - 在 selected current series 的 lower-round evaluation evidence中受界取得 latest valid `fixRecord.sourceMutationAt`，要求 current review/evaluation的 freshness时间不早于该 mutation；将现有 positive control改为先证明旧时间 fail-close，再用确实晚于 prior fix 的 higher round证明 success。不得重写 Round 20历史或重开 Owner Gate。

### 2. [高][上轮遗留] clean PASS 可携带非空 Deferred TODO Candidates

- **来源**：blind + edge + auditor + aggregator
- **分类**：patch

- **证据**
  - `validDoneFinalizer()` 在 evaluation verdict为 `PASS` 时直接令 `deferredFingerprints = []`；只有 `PASS_WITH_DEFERRED_TODOS` 才调用 `deferredTodoCandidateFingerprints()`。因此 frontmatter为 `PASS`、`acceptedCounts.deferred: 0`、CR05 `mappedFingerprints: []` 时，正文仍可含合法的非空 exact `Deferred TODO Candidates（延期候选）` rows而通过。位置：`resolve-cr-directory.mjs:512-532,1382-1400`。
  - current RED matrix只对 `PASS_WITH_DEFERRED_TODOS` 变异 wrong/duplicate/missing/invalid set，没有覆盖 clean `PASS` 与非空 table的冲突。位置：`test/code-review-contract.test.ts:3517-3548`。
  - Aggregator read-only helper probe确认同一 current parser可从该 `PASS` 正文提取非空 fingerprint，但 finalizer PASS分支不会调用它。

- **影响**
  - evaluation正文中的真实 deferred candidate可被 CR05 empty mapping静默忽略，最终以未登记 TODO 的失真 predecessor graph收口，违反 AC9/AC11/AC12。

- **建议**
  - clean `PASS` 也必须校验 exact Deferred TODO section 不含任何 fingerprint；补 complete authentic control出发、递归重绑 evaluation/CR04/CR05/finalizer hashes的 nonempty-table negative，以及合法 empty-table clean PASS positive。不得从自由 prose推断 fingerprint或新增 schema field。

### 3. [高][上轮遗留] quoted/spaced fixRecord key 被当作 absent

- **来源**：edge + auditor + aggregator
- **分类**：patch

- **证据**
  - `boundedFixRecord()` 的 occurrence detector仅匹配 `^fixRecord:[^\\r\\n]*$`。YAML语义等价的 quoted key（如 `"fixRecord":` / `'fixRecord':`）或 colon前带空格的 `fixRecord :` 不产生 occurrence，函数直接返回 `{ok:true,value:null}`。位置：`resolve-cr-directory.mjs:833-852`。
  - current tests覆盖 exact `fixRecord: ignored`、duplicate、partial、unknown field与完整 block，没有覆盖同一 key的 quoted/spaced表达。位置：`test/code-review-contract.test.ts:3550-3571`。
  - Aggregator read-only probe确认 quoted/spaced输入均被 current helper返回为 absent；这与 Round 21“leading frontmatter 中任何 `fixRecord` key必须严格 shape校验”的明确授权冲突。

- **影响**
  - current evaluation 可携带语义上的 fix evidence却被认证为无 fix，绕过 higher fresh reviewer/evaluator要求并进入 historical `DONE` 认证。

- **建议**
  - 在 leading frontmatter内增加受界、针对 `fixRecord` semantic key的 fail-close识别：任何非唯一 canonical complete block表达均拒绝；补 quoted/spaced authentic negatives。保持 targeted detector，不扩展为通用 YAML parser、`%TAG` binding或新 vocabulary。

## Verification Summary（验证摘要）

- `node --check assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs`：✅ 通过。
- `npx vitest run test/code-review-contract.test.ts --reporter=dot`：✅ `93 passed / 4 todo / 0 failed`。
- Current source/test SHA-256：✅ 与 Round 21 Fix Summary指定 hashes一致。
- Scoped `git diff --check`（resolver、focused test、Round 21 evaluation）：✅ 通过。
- Aggregator read-only helper probe：✅ `PASS`正文 exact table可解析出非空 fingerprint，但 finalizer跳过；quoted/spaced `fixRecord` key均返回 `{ok:true,value:null}`。
- Current affected snapshot：引用既有 `143 passed / 4 drawer fixed-count failures / 4 todo`，本轮未重跑。
- Full snapshot：仅保留 Round 19历史 `755 passed / 12 drawer fixed-count failures / 4 todo`，本轮未重跑、未作为 current证明。
- 未运行 broad build、full repository suite、packaging、canonical governance、fixture regeneration、completion gate刷新、CR04、CR05或CR06。

## Passed Items（通过项）

- Round 21 document-start rejected-state、empty `scopeExceptions`、safe integers与 CR04 clean-PASS zero-count主路径持续闭合。
- `PASS_WITH_DEFERRED_TODOS` 的 exact heading/table fingerprint与 CR05 unique mapped set equality持续闭合。
- exact unquoted `fixRecord:` 的 malformed/current same-round路径持续 fail-close；Round 21 owning CR06 authority裁决保持，不重开 R20历史为 Owner Gate。
- Resolver syntax、focused suite与 scoped diff check持续 GREEN；current source/test hashes未漂移。
- 三层观察中的通用 YAML/HTML、`%TAG`/tag vocabulary、TOCTOU、active filename chronology、lineage/scope泛化、空列表/重复项语义与其他不在本轮授权的内容未升级为 P1。
- `supersededIndex` identity/continuity维持 non-blocking deferred P2。

## Conclusion（结论）

- **结论：FAIL / FINDINGS_REPORTED**
- **阻塞项**：3 个 `patch`。
- **Owner Gate**：`NONE`。三项均为 Round 21已授权 contract的受界残余，不需要新业务裁决。
- **建议**：由 fresh evaluator逐条裁决 Findings #1–#3；仅授权受界 routine fixes后再由 fresh Reviewer复审。latest Reviewer/Evaluator双 PASS前不得进入 CR04、CR05或CR06。
