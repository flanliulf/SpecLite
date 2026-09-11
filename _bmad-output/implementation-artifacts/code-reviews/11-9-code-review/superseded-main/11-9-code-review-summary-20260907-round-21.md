---
Story: 11-9
Round: 21
Date: 2026-09-07
Model Used: GPT-5.6Sol
Type: Code Review Summary
---

## Review Conclusion（审查结论）

本轮为 Round 20 bounded Fixer 后的 fresh 复审。Blind Hunter、Edge Case Hunter、Acceptance Auditor 均由独立 fresh agent 完成，正式输出 `3/3`，无 timeout、empty output 或降级。受四个并发 slot 限制，先并行执行 Blind + Edge；Blind 完成释放 slot 后再启动 Acceptance。Blind 只读取冻结的 isolated `review-input.diff`，其余两层没有读取任何其他 Round 21 layer 输出。

三层共返回 `18` 条 raw observations/findings（Blind `12`、Edge `4`、Acceptance `2`）。Aggregator 不按层数投票，并将 active-series filename、通用 YAML/HTML、TOCTOU、CR04/CR05 chronology、tracker `beforeHash`、diagnostic wording 与 `supersededIndex` 等超出本轮授权的观察排除或维持既有 deferred。按 Round 20 四个根因去重后保留 **3 个阻塞 finding**：document-start rejected property fail-close、四类 predecessor 跨产物 authenticity、fixRecord freshness authority conflict。总体结论：**FAIL / FINDINGS_REPORTED**；不得进入可收口 PASS。

Round 20 Finding #2 caller-frozen cross-role identity 已关闭；Finding #1、#3、#4 仅部分关闭。Option A 保持：named handles 全拒绝，不实现 `%TAG` binding、通用 YAML parser、通用 HTML parser或扩展 tag vocabulary。`supersededIndex` 继续作为 carried deferred P2。

## Layer Results（三层结果）

| Layer | Execution | Formal output | Aggregated result |
| --- | --- | --- | --- |
| Blind Hunter | PASS | 12 observations | unsafe count、CR04/CR05 finding-set binding与 freshness evidence并入 Findings #2/#3；其余超出 bounded contract 的观察未进入正式结论。 |
| Edge Case Hunter | PASS | 4 findings | document-start rejected property、nonempty `scopeExceptions`、unsafe count、scalar `fixRecord` 分别并入 Findings #1–#3。 |
| Acceptance Auditor | PASS as execution / `FINDINGS_REPORTED` | 2 findings | CR05 exact deferred fingerprint coverage并入 Finding #2；same-round `fixRecord` 的 owning workflow / R20 authorization 冲突并入 Finding #3。 |
| Aggregator targeted inspection | PASS as reproduction | current code + authentic fixture graph inspection | 直接确认 Findings #1–#3 的控制流；focused suite GREEN 不会覆盖被测试正控主动接受的失真语义。 |

### Layer Identity（审查层身份）

- Blind Hunter SHA-256：`08965c818ca8be9f6a43bcffb86196629997f626afdf1f97f560db38492006fe`
- Edge Case Hunter SHA-256：`ab1394ec51c33d688e23793faf5c217a9a532b07cf220860b50ab2b261d7b4f7`
- Acceptance Auditor SHA-256：`8c74745fde8409e2b9411bc178594aad2ccff717f962e423ab7dd802a9c0fbc9`
- Isolated review input SHA-256：`cba234805f9aba53da67b7d7d0d129b227e0645538e27685141ddbd2f217eb5a`
- Resolver SHA-256：`4e35595700d40a06e8242ef11558fd78a4357a79305586eb138a55ab5cf53e5c`
- Focused test SHA-256：`47cf7e5a43fd95abbf66658906d443fbe310b5b198544c8ce523612c488d45cc`

## Previous Round Review（上轮问题回顾）

### Closed（已关闭）

1. Round 20 / Finding #2 — caller-frozen cross-role Story identity
   - `validTrackerBindingsPreflight()` 在 filesystem inspection 前从 immediate Story basename取得 `storyKey`，要求 Story path、sprint exact key与 normalized `storyId` 同一身份。
   - missing/canonical/legacy、module/CLI与 zero-write focused matrix通过。

### Partially Closed（部分关闭）

1. Round 20 / Finding #1 — document-start root property plain remainder
   - 单个合法 bounded `!local` / `&memo` property 后 plain remainder已进入 root scalar state。
   - exact `---` 后被 existing bounded grammar拒绝的重复/畸形 property仍未进入 ambiguous fail-close。见 Finding #1。
2. Round 20 / Finding #3 — four predecessor schema/list/count authenticity
   - required fields、基本 list shape、主要 verdict/count predicates与递归下游 artifact hash rebind已实现。
   - review scope hard gate、safe integer及 CR04/CR05 accepted-finding-set semantics仍可被 hash-consistent bytes绕过。见 Finding #2。
3. Round 20 / Finding #4 — review/fixRecord freshness
   - review `sourceMutationAt` 与 nested `fixRecord.sourceMutationAt` 已被读取，完整 block shape已有受界 parser。
   - malformed scalar record仍被当作 absent；valid same-round record的 positive path与 owning finalizer workflow冲突。见 Finding #3。

### Still Non-blocking Deferred（仍为非阻塞待办）

1. Round 5–21 / `supersededIndex` identity/continuity
   - 维持 carried deferred P2 / CR05 TODO；本轮无升级证据，不得混入 P1 patch。

## New Findings（新发现）

### 1. [高][上轮遗留] document-start 后 rejected root property 未 fail-close

- **来源**：edge + aggregator
- **分类**：patch

- **证据**
  - `trackerLinesOutsideYamlBlockScalars()` 先调用不识别 document-start prefix 的 `hasRejectedOuterYamlNodeProperty()`，随后 `yamlDocumentRootPropertyPlainScalar()` 对 exact `---` 后重复同类 property返回 `false`；两条路径都没有把该 document标为 ambiguous。位置：`assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs:1297-1326,1343-1356`。
  - 具体场景：`--- !local !other note\n  <owner>: done`。YAML bytes因重复 `!` node property无效，但 helper返回非 root-plain，后续缩进 owner保持 visible；现有 focused test `test/code-review-contract.test.ts:3249-3277` 只覆盖单个合法 `!local` / `&memo` property，没有覆盖 existing bounded grammar 的 rejected branch。

- **影响**
  - parser-invalid sprint/workflow tracker仍可伪造唯一 terminal，错误认证 completed legacy并开启 canonical sibling，违反 AC9/AC11。

- **建议**
  - exact document-start 后若 remainder进入 existing bounded property grammar但出现 duplicate/malformed property，应直接进入 ambiguous fail-close；只补这一现有 state transition 与 sprint/workflow authentic recovery negative。不得扩展 `%TAG`、named handles、tag vocabulary或通用 YAML parser。

### 2. [高][上轮遗留] 四类 predecessor authenticity 尚未绑定完整 scope/count/finding-set 语义

- **来源**：blind + edge + auditor + aggregator
- **分类**：patch

- **证据**
  - Review `PASS_RECOMMENDED` 只验证 `scopeExceptions` 是合法 inline list，没有要求为空；这与 shared contract `cr-contract.md:129-135` 的 nonempty scope exception 必须 `REVIEW_DEGRADED` hard gate冲突。位置：`resolve-cr-directory.mjs:617-634`。
  - `integerBlockValues()` / `boundedNonnegativeInteger()` 接受任意长度 decimal 后直接 `Number()`；超出 safe range会舍入或成为 `Infinity`，而 CR04 的 `global <= candidate` 可在 `Infinity <= Infinity` 下成立。位置：`resolve-cr-directory.mjs:781-810`。
  - Clean `PASS` evaluation 可配 `candidateRuleCount: 1`、`globalRuleEligibleCount: 0` 的 CR04 report并通过，未落实 owning CR04 workflow 对 zero eligible clean PASS 必须 `candidateRuleCount: 0` 的不变量；`eligibleFindingSetHash` 也没有与 bound evaluation 的 existing eligible evidence关联。位置：`resolve-cr-directory.mjs:658-667`。
  - CR05 只比较 `mappedFingerprints.length === acceptedCounts.deferred`，未验证去重后的 fingerprint set恰好覆盖 evaluation 已接受的 deferred findings。`test/code-review-contract.test.ts:3373-3393` 仅修改 deferred count并填入人为 `9...` / `6...` hash后期待 canonical success；`rewriteAuthenticPredecessorGraph()` 已递归重绑 evaluation、CR04、CR05与 finalizer hashes，因此该结果不是 stale-hash 误报，而是 positive control本身没有 accepted fingerprint identity。

- **影响**
  - Hash-consistent但 scope降级、count非整数、CR04候选失真或 deferred TODO错配的 predecessor仍能组成 authentic `DONE`；真实 accepted deferred item可未登记，违反 AC9/AC11/AC12。

- **建议**
  - 在现有 schema内补四项 bounded semantic guards：`PASS_RECOMMENDED` 要求 empty `scopeExceptions`；所有 count必须 `Number.isSafeInteger`；clean PASS 的 CR04 eligible/candidate不变量与 existing evaluation evidence一致；CR05 对 evaluation已有 accepted deferred fingerprints做去重集合相等校验。不得新增 unknown schema field；如 durable evaluation正文没有稳定可机械解析的 existing fingerprint表达，先由 owning contract明确既有表达，不能以长度相等替代 coverage。

### 3. [高][上轮遗留] fixRecord freshness 的 routine shape 缺口与 authority 冲突未解决

- **来源**：edge + auditor + aggregator
- **分类**：decision_needed

- **证据**
  - `boundedFixRecord()` 只查找 exact block header `fixRecord:`；`fixRecord: ignored` 等 scalar形态不产生 occurrence，直接返回 `{ok:true,value:null}`，使 malformed record被当作没有修复。位置：`resolve-cr-directory.mjs:813-832`。
  - 对完整 block，current code允许 same-round current evaluation携带 `fixRecord`，只要求 completion gate不早于其 `sourceMutationAt`。位置：`resolve-cr-directory.mjs:551-569,636-656`。
  - `test/code-review-contract.test.ts:3424-3428` 明确将 generatedAt/sourceMutationAt均晚于 current review/evaluation的完整 `fixRecord` 作为 canonical success正控。这符合 Round 20 evaluation 明示的 valid `fixRecord` positive授权，不能在复审中静默改写。
  - 但 owning `speclite-code-review-06-finalizer/references/finalizer-workflow.md:21-28` 要求最后 fixRecord 后已有更高 round fresh review/evaluation，且 current evaluation不带未复验 fixRecord；shared contract `cr-contract.md:398-412` 同样要求最后修复后完成 fresh reviewer/evaluator。

- **影响**
  - Malformed scalar fixRecord可绕过 freshness authority；完整 same-round fixRecord则可能在没有下一轮 fresh reviewer/evaluator时被认证 `DONE`，违反 strict-serial completion gate。

- **建议**
  - Routine部分可直接 fail-close任何存在但不是唯一完整 block的 `fixRecord`。Lifecycle部分必须由 fresh evaluator/contract owner显式裁决：若保持 owning CR06 authority，应拒绝 current finalizing evaluation自带 fixRecord，并由更高 round fresh review/evaluation证明修复；若意图允许 same-round positive，必须先显式修订 owning workflow/contract。不得把该冲突隐藏成普通 patch或默默删除 R20正控。

## Verification Summary（验证摘要）

- `node --check assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs`：✅ 通过。
- `npx vitest run test/code-review-contract.test.ts --reporter=dot`：✅ `88 passed / 4 todo / 0 failed`。
- Current source/test SHA-256：✅ 与 Round 20 Fix Summary指定 hashes一致。
- Authentic fixture/hash isolation inspection：✅ `writeAuthenticCompletedRound()` 生成 review/evaluation/CR04/CR05/finalizer/gate/tracker完整链；`rewriteAuthenticPredecessorGraph()` 按 review → evaluation → CR04/CR05 → finalizer递归重绑下游 hashes。该 isolation有效，但不能替代 scope/count/fingerprint semantic assertions。
- Affected snapshot：引用既有 `138 passed / 4 drawer fixed-count failures / 4 todo`，本轮未重跑。
- Full snapshot：引用 Round 19 `755 passed / 12 drawer fixed-count failures / 4 todo`，本轮未重跑。
- 未运行 broad build、full repository suite、packaging、canonical governance、fixture regeneration、completion gate刷新、CR04、CR05或CR06。

## Passed Items（通过项）

- Round 20 Finding #2 cross-role Story/sprint/current `storyId` identity在 filesystem inspection前 fail-close，module/CLI与三种 topology覆盖完整。
- Round 20 Finding #1 的单个合法 document-start property + plain remainder主路径已关闭；Finding #3 的 required fields、bounded list基本 shape与递归 hash graph主体已建立；Finding #4 的 review/fix mutation field读取已更正。
- Resolver syntax与 focused suite持续 GREEN；没有修改 report basenames、round numbering、approval rules、CR01–06 algorithm或 Story 11.9范围外实现。
- Blind raw observations中 active-series filename、通用 YAML/HTML、TOCTOU、CR04/CR05 chronology、tracker `beforeHash`与 diagnostic wording不在本轮授权；未升级为 P1。
- `supersededIndex` identity/continuity维持既有 non-blocking deferred P2。

## Conclusion（结论）

- **结论：FAIL / FINDINGS_REPORTED**
- **阻塞项**：2 个 `patch` + 1 个 `decision_needed`。
- **建议**：先由 fresh evaluator逐条裁决 Findings #1–#3，并对 Finding #3 的 owning workflow / R20 authorization冲突作显式决定；仅授权受界 routine fixes后再由 fresh Reviewer复审。latest Reviewer/Evaluator双 PASS前不得进入 CR04、CR05或CR06。
