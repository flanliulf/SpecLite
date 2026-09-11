---
Story: 11-9
Round: 22
Date: 2026-09-07
Model Used: GPT-5.6Sol
Review Source: 11-9-code-review-summary-20260907-round-22.md
Review Model: GPT-5.6Sol
Type: Code Review Evaluation
---

## Evaluation Summary（评估总结）

对 Story 11-9 的第 22 轮 CR 代码审查结果（复审）进行独立逐条评估。被评估文件 SHA-256 已核对为 `00352427fc71a7beacca08bab671eb7ea56894257e1628a3bfb60c64b398cdf6`；current resolver、focused test 与 Round 21 evaluation append 的 SHA-256 分别为 `a928e35392488e5c5b0977c68f8801d28f66590ab840c55f3b7430ec996d67b0`、`4c5fe99384d2601e2474be7ab0d0d69746389af638392a0ac59d2d1b018d5c5e`、`ad7bb0d3b2b5a9275b6044baf44e8340621bd9befb71e8efdf36840f2e0628ba`，与 Round 22 Reviewer 冻结的 source/test identity 一致。

Reviewer 的 3 个 finding 均有 current production control flow、focused fixture 时间或缺失 test matrix 的直接证据。三项全部确认为阻塞交付的 P1 routine patch，结论为 `FIX_REQUIRED`。Round 21 已按 shared contract / owning CR06 裁决 fresh-round authority；本轮不重开 owner、不改 Round 20 历史，只关闭 R21 bounded contract 的残余缺口。

---

## Previous Round Review（上轮问题回顾确认）

### Round 21 已关闭组：保持关闭

document-start rejected property state、empty `scopeExceptions`、nonnegative safe integer、CR04 clean-PASS zero counts，以及 `PASS_WITH_DEFERRED_TODOS` exact fingerprint set 主路径已有 current code/test evidence，本轮没有反例。不得将其重开或扩入本轮 patch。

### Round 21 部分关闭组：本轮仅补残余

- CR05：只补 clean `PASS` 对 exact Deferred TODO table 的空集合一致性；不改 deferred verdict 的已闭合 exact-set 语义。
- freshness：只补 selected current series 的 lower-round latest valid fix mutation 与 current higher-round review/evaluation 的时间关系；不重开 same-round owner authority。
- `fixRecord`：只补 leading frontmatter 内 quoted/spaced semantic key 的 targeted fail-close；不扩成通用 YAML parser。

### Historical CR TODO（历史 CR TODO，非阻塞）

| # | 发现 | 状态 | 评估意见 |
|---|------|------|---------|
| Round 5–22 | `supersededIndex` identity/continuity | CR TODO / P2 | 同意维持非阻塞；不得混入本轮 P1 patch。 |

---

## Finding #1 Evaluation（发现 #1 评估）

### Review Original（审查原文）

> **[高][上轮遗留] higher round 未证明晚于 prior fix**
> - 来源：auditor + aggregator
> - 分类：patch

### Evaluation Conclusion（评估结论）：✅ 确认有效 — 需要修复（P1 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性：准确**

`inspectCandidate()` 虽逐项读取 selected current series 的 current artifacts，但调用 `validDoneFinalizer()` 时只传当前 finalizer 的 `round`，没有将 lower-round fix mutation 聚合进 finalization 判断（`resolve-cr-directory.mjs:246-347`）。`validDoneFinalizer()` 又只绑定同 round review/evaluation（`:451-510`）；current evaluation 必须无 `fixRecord` 后，`:563-565` 将 `fixMutationTime` 退化为 current `evaluationTime`，最终 `:577-580` 只证明 current round 内部时序，没有证明 current higher round 晚于 prior fix。

focused positive 在 Round 1 写入 `sourceMutationAt: 2026-09-05T12:19:00Z` 后创建 Round 2（`test/code-review-contract.test.ts:3550-3578`），而 helper 对任意 round 固定产生 review `12:00:00Z` 与 evaluation `12:10:00Z`（`:3879-3943`）。因此该 positive 的 round number 更高，但 review/evaluation 实际早于 prior fix；current suite 仍 GREEN，不能证明 freshness。

**严重性判断：合理**

该缺口可让修复前形成的 stale review/evaluation 仅凭 higher round ordinal 认证 legacy `DONE`，直接削弱已裁决的 fresh reviewer/evaluator completion gate，属于阻塞交付的 P1。

**修复建议：可行**

仅在 selected current series 的 current evidence 内，受界读取 lower-round evaluation 中 latest valid `fixRecord.sourceMutationAt`，要求 current higher-round review/evaluation 的 freshness 时间均不早于该 mutation。范围不得扩为 active filename chronology、任意 superseded ordinal、任意全链时间验证、跨 series lineage 或 P2 `supersededIndex`。

**误报评估：非误报**

独立时间 probe 得到 `higherRoundNumber=true`，但 `reviewFresh=false`、`evaluationFresh=false`，与 production control flow 和 fixture 常量一致。

---

## Finding #2 Evaluation（发现 #2 评估）

### Review Original（审查原文）

> **[高][上轮遗留] clean PASS 可携带非空 Deferred TODO Candidates**
> - 来源：blind + edge + auditor + aggregator
> - 分类：patch

### Evaluation Conclusion（评估结论）：✅ 确认有效 — 需要修复（P1 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性：准确**

`validDoneFinalizer()` 在 verdict 为 `PASS` 时直接赋值 `deferredFingerprints = []`；仅 `PASS_WITH_DEFERRED_TODOS` 调用 exact table parser（`resolve-cr-directory.mjs:512-532`）。因此即使 `deferredTodoCandidateFingerprints()` 能从正文 exact section 解析出非空 row（`:1382-1400`），clean `PASS` 分支也不会观察它。current tests只覆盖 deferred verdict 的 wrong/duplicate/missing/invalid set（`test/code-review-contract.test.ts:3517-3548`），没有 clean `PASS` + nonempty exact table negative。

**严重性判断：合理**

该缺口允许正文已声明 deferred candidate、CR05 却保持 empty mapping 并完成收口，造成 predecessor graph 语义失真，违反 clean `PASS` 的零 deferred 约束，属于 P1。

**修复建议：可行**

clean `PASS` 也应通过现有 exact `Deferred TODO Candidates（延期候选）` grammar 检查其集合为空。正控必须同时覆盖符合现有 evaluator template 的两种合法 clean `PASS`：exact table 存在但无 rows，以及 optional section 完全 absent；二者均应继续成功。不得从自由 prose 提取 fingerprint，也不得新增 schema field。

**误报评估：非误报**

独立 control-flow probe 显示 exact parser 可得到 1 个 fingerprint，而 current clean-PASS 分支验证集合长度仍为 0；这正是静默跳过，而非 parser 拒绝。

---

## Finding #3 Evaluation（发现 #3 评估）

### Review Original（审查原文）

> **[高][上轮遗留] quoted/spaced fixRecord key 被当作 absent**
> - 来源：edge + auditor + aggregator
> - 分类：patch

### Evaluation Conclusion（评估结论）：✅ 确认有效 — 需要修复（P1 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性：准确**

`boundedFixRecord()` 的 occurrence detector 只匹配 `^fixRecord:[^\r\n]*$`（`resolve-cr-directory.mjs:833-837`）。`"fixRecord":`、`'fixRecord':` 与 `fixRecord :` 均不产生 occurrence，函数会在 shape validation 前返回 `{ok:true,value:null}`；而 current tests只覆盖 exact unquoted header 的 scalar、duplicate、partial、unknown 与 complete current record（`test/code-review-contract.test.ts:3550-3571`）。

**严重性判断：合理**

YAML-equivalent key 可携带语义上的 fix evidence却被 finalizer 当作 absent，绕开已裁决的 higher fresh round requirement，影响 completion authenticity，属于 P1。

**修复建议：可行**

增加仅针对 leading frontmatter 中 `fixRecord` semantic key 的 bounded grammar detector：quoted/spaced 或其他非唯一 canonical complete block表达应 fail-close；canonical historical complete block与 current absent 路径应保持各自既定语义。该修复必须是 targeted detector，不得扩展为通用 YAML parser、`%TAG` binding、tag vocabulary 或任意 key canonicalizer。

**误报评估：非误报**

独立 regex probe 确认 canonical `fixRecord:` 被检测，而双引号、单引号与 colon 前空格三种表达均未被检测，与 Reviewer 结论一致。

---

## Overall Evaluation Conclusion（整体评估结论）

### Required Fixes（需要修复，阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | higher round 未证明晚于 prior fix | [高] | **P1** | 只补 selected current series / current evidence 的 lower-round latest fix freshness。 |
| 2 | clean `PASS` 跳过非空 exact deferred table | [高] | **P1** | clean PASS 必须与 exact table empty set 一致，并保留 empty-table/absent 正控。 |
| 3 | quoted/spaced `fixRecord` key 被当 absent | [高] | **P1** | 仅补 targeted semantic-key fail-close，不实现通用 parser。 |

### CR TODO Candidates（建议纳入 CR TODO，非阻塞）

本轮不新增 CR TODO。既有 `supersededIndex` identity/continuity 继续维持 carried P2，不进入本次 Fixer 白名单。

### False Positives（可忽略，误报）

无。

### Evaluation Decision（评估决定）

- **Finding #1**：确认有效，P1 routine patch；不得扩到 active filename chronology、跨 series、superseded ordinal 或任意全链时间。
- **Finding #2**：确认有效，P1 routine patch；只校验 exact table，正常 empty table 与 optional absent 均须正控通过。
- **Finding #3**：确认有效，P1 routine patch；仅实现 `fixRecord` targeted grammar，不扩通用 YAML parser。
- **Owner Gate**：`NONE`。R21 authority 裁决保持，不重开 owner，也不修改 R20 历史。
- **Overall Verdict**：`FIX_REQUIRED`。latest Reviewer/Evaluator 双 PASS 前不得进入 CR04、CR05 或 CR06。

## Bounded Fixer Authorization（受界 Fixer 授权）

### Exact File Whitelist（精确文件白名单）

1. `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs`
2. `test/code-review-contract.test.ts`
3. 本 evaluation 文件仅允许 append `Fix Summary`

除上述文件外零写入。禁止修改 shared contract、CR01–06 Skills/workflows/templates、runner、Story、tracker、completion/kickoff gate、review logs、PLAN/EXPERIMENTS、SPEC、source/installed mirrors、其他测试或其他文档。

### Independent RED / GREEN Matrix（独立 RED / GREEN 矩阵）

1. **Selected-series prior-fix freshness**
   - RED：从 complete authentic multi-round control 出发，在 lower round current evaluation 放入合法 complete `fixRecord`，令 higher current round review/evaluation 时间早于 latest `sourceMutationAt`；递归重绑 review/evaluation、CR04、CR05、finalizer 依赖哈希后，先证明 unpatched production resolver 错误成功。
   - GREEN：同一 stale-time graph fail-close；只把 higher current review/evaluation 改为确实不早于 latest lower-round mutation并递归重绑后成功。另保留无 prior fix 的正常 multi-round positive。
2. **Clean PASS exact empty set**
   - RED：从 complete authentic clean-PASS control 出发，只增加 1 个合法 exact table row，保持 `acceptedCounts.deferred: 0` 与 CR05 `mappedFingerprints: []`；递归重绑 evaluation、CR04、CR05、finalizer hashes后，先证明 unpatched resolver 错误成功。
   - GREEN：nonempty row fail-close；符合现有模板的 exact empty table 与 optional absent section 两个 clean-PASS controls 均成功。
3. **Targeted `fixRecord` semantic key**
   - RED：从 complete authentic control 分别变异为 `"fixRecord":`、`'fixRecord':`、`fixRecord :`，每例仅改变目标 key 表达并递归重绑 evaluation、CR04、CR05、finalizer hashes，先证明 unpatched resolver把它们当 absent并错误成功。
   - GREEN：三例全部 fail-close；canonical historical complete block与 current evaluation absent 正控保持。不得加入通用 YAML parser 测试或实现。

每个 negative 必须从 complete authentic control 出发、只变异一个目标不变量，并递归重算全部 dependent hashes；不得依靠 stale hash、缺失 predecessor 或 malformed unrelated fixture 的提前失败来宣称 GREEN。三个 RED 必须在 production patch 前逐组独立执行并保存实际 failure expectation；patch 后逐组独立 GREEN。

### Allowed Verification（允许验证）

- 仅运行上述 3 组新增 focused test name 的独立 RED / GREEN。
- `npx vitest run test/code-review-contract.test.ts --reporter=dot`
- `node --check assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs`
- 对三个白名单文件执行 scoped `git diff --check`、SHA-256 冻结与 diff 越界审计。
- 只读 production-function targeted probe。

禁止 broad build、full repository suite、packaging、canonical governance、fixture regeneration、completion gate 刷新、CR04、CR05、CR06、tracker/log 更新。Fixer 完成后只向本 evaluation append `Fix Summary`；随后由 fresh Reviewer 复审、fresh Evaluator 复评。

## Evaluation Verification（评估验证）

- `node --check .../resolve-cr-directory.mjs`：PASS。
- `npx vitest run test/code-review-contract.test.ts --reporter=dot`：PASS，`93 passed / 4 todo / 0 failed`。
- 三个冻结文件 scoped `git diff --check`：PASS。
- targeted read-only probe：prior fix `12:19` 对 current review `12:00` / evaluation `12:10` 得到两项 freshness false；quoted/spaced 三种 key 均未被 current detector识别；clean `PASS` 对可解析 nonempty table仍把 validated set置空。
- 未运行 broad build、full repository suite、packaging、governance、fixture regeneration 或任何 CR04–CR06 写流程。

## Fix Summary（修复执行记录）

### 修复执行记录
- **Date**: 2026-09-07
- **Model Used**: GPT-5.6Sol
- **Fix Items**: 3

### Fix Results（修复结果）

1. **Selected current series prior-fix freshness**：在 current-series artifact inspection 内仅聚合 lower-round 合法 complete `fixRecord.sourceMutationAt`，要求当前 higher-round review/evaluation 均不早于 latest prior mutation。未扩展到跨 series、superseded ordinal、active filename chronology 或任意全链时间验证。
2. **Clean `PASS` exact empty set**：clean `PASS` 现在只通过既有 exact `Deferred TODO Candidates（延期候选）` grammar 验证零候选；exact empty table 与 optional absent section 均保持有效，非空 exact row fail-close。未从自由 prose 提取 fingerprint，也未新增 schema field。
3. **Targeted `fixRecord` semantic key**：仅在 leading frontmatter 内定点识别 `"fixRecord":`、`'fixRecord':` 与 `fixRecord :` 等非 canonical semantic-key 表达并 fail-close；canonical complete block与 absent 路径保持原语义。未引入通用 YAML parser 或 key canonicalizer。

### RED / GREEN Evidence（红绿证据）

- production patch 前 resolver SHA-256 始终为 `a928e35392488e5c5b0977c68f8801d28f66590ab840c55f3b7430ec996d67b0`；三组新增 test 均独立运行并各自得到 `1 failed / 99 skipped`，实际错误结果均为 resolver `ok: true`。
- production patch 后三组新增 test 均独立得到 `1 passed / 99 skipped`。
- freshness 正控使用真实顺序：prior `sourceMutationAt 12:19` → current `sourceMutationAt 12:20` → review `12:21` → evaluation `12:22` → CR04 `12:23` → CR05 `12:25` → gate `12:30` → finalizer `12:40`；另保留 no-prior-fix multi-round positive。
- clean `PASS` 正控同时覆盖 exact empty table 与 optional absent section；`fixRecord` 正控由 canonical lower-round complete block与 current absent evaluation 覆盖。

### Verification（验证）

- `npx vitest run test/code-review-contract.test.ts --reporter=dot`：PASS，`96 passed / 4 todo / 0 failed`。
- `node --check assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs`：PASS。
- 三个白名单文件 scoped `git diff --check`：PASS。
- 未运行 broad build、full repository suite、packaging、canonical governance、fixture regeneration、completion gate、CR04、CR05、CR06 或 tracker/log 写流程。
