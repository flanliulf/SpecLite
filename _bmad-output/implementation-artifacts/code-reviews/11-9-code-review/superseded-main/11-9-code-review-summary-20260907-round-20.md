---
Story: 11-9
Round: 20
Date: 2026-09-07
Model Used: GPT-5.6Sol
Type: Code Review Summary
---

## Review Conclusion（审查结论）

本轮为 Round 19 bounded Fixer 后的 fresh 复审。Blind Hunter、Edge Case Hunter、Acceptance Auditor 均由独立 fresh agent 完成，正式输出 `3/3`，无 timeout、empty output 或降级。受四个并发 slot 限制，先并行执行 Blind + Edge；Blind完成释放 slot后再启动 Acceptance。Blind 只读取冻结的 isolated `review-input.diff`，其余两层没有读取任何其他 Round 20 layer 输出。

三层共返回 `11` 条 raw observations（Blind `7`、Edge `4`、Acceptance `0`）。Aggregator 以 current source、Round 19 evaluation/Fix Summary 与 shared CR contract 为准进行定向核验；不按层数投票，也不把同一词法根因拆成无限新 P1。去重后保留 **4 个 fresh P1**：document-start root property、caller-frozen cross-role identity、完整 predecessor v2 authenticity、completion freshness。总体结论：**FAIL / FIX_REQUIRED**。

Round 19 的 current `disposition`、raw exact Story `Status` 与 CR04/CR05 docs/help 双输出修复保持关闭；document-root plain remainder、module exact frozen inputs及 predecessor authenticity/freshness 为部分关闭。`supersededIndex` 继续作为 carried deferred P2。Option A 保持：named handles 全拒绝，不实现 `%TAG` binding、通用 YAML parser或扩展 tag vocabulary。

## Layer Results（三层结果）

| Layer | Execution | Formal output | Aggregated result |
| --- | --- | --- | --- |
| Blind Hunter | PASS | 7 observations | freshness 与 predecessor semantic authenticity 并入 Findings #3/#4；raw HTML type扩张、malformed delimiter、unfinished-minimal artifact与 TOCTOU 不在本轮受界结论中。 |
| Edge Case Hunter | PASS | 4 findings | document-start property、cross-role binding、invalid inline list、freshness分别并入 Findings #1–#4。 |
| Acceptance Auditor | PASS | `PASS` / 0 P1 | R19 六个显式 focused tests 与 AC7/9/11/12 矩阵为 GREEN；未覆盖 Findings #1–#4 的相邻 production branches，故不推翻可复现证据。 |
| Aggregator targeted replay | PASS as reproduction | 3 probe groups + code inspection | 复现 Findings #1/#2 与 #3 invalid inline-list；对 #3 CR04/05 schema skip及 #4 wrong mutation source完成current-code定向核验。 |

### Layer Identity（审查层身份）

- Blind Hunter SHA-256：`7fb212bff90b341f1e4071ff050840faed5733c86f91e4fffbb43661597c4d53`
- Edge Case Hunter SHA-256：`bcd3fc4609af1641d6067aa45967315c4a0f486b14c376c22338041ec2b10781`
- Acceptance Auditor SHA-256：`86c0ba58dfccc5ab3f4c7d9ed2775cf0fc259335a8b09331b0842eaa956f9ff2`
- Isolated review input SHA-256：`33c61f605e5ba339b61443a2acbc8879e8d6085b9b5d446bb1505747d5635455`

## Previous Round Review（上轮问题回顾）

### Partially Closed（部分关闭）

1. Round 19 / Finding #1 — document-root property + plain remainder
   - `!local note` / `&memo note` 行首矩阵已关闭。
   - YAML document-start marker 后的同一 root property plain remainder仍绕过 bounded state。见 Finding #1。
2. Round 19 / Finding #2 — module exact inputs
   - non-string series、missing/partial/extra-field bindings已入口 fail-close。
   - 三 role 局部 shape之间仍未绑定同一个 caller-frozen Story identity。见 Finding #2。
3. Round 19 / Finding #4 — full predecessor schema / calendar
   - review/evaluation显式 groups与 Gregorian date controls已关闭。
   - inline-list value grammar、CR04/CR05 required schema、verdict/count invariants及最后 source mutation freshness仍未完整认证。见 Findings #3/#4。

### Closed（已关闭）

1. Round 19 / Finding #3 — current artifact required `disposition`
   - current只接受 exact `disposition: current`，focused canonical/legacy negatives通过。
2. Round 19 / Finding #5 — raw exact Story `Status`
   - bold/italic/link/code/comment/body variants拒绝，plain exact key通过；不把 prior Round 7 仅批准的 bounded `pre`/`code` 扩张为通用 HTML parser义务。
3. Round 19 / Finding #6 — CR04/CR05 docs/help output planes
   - stale public row已删除，CR05 help使用既有 `|` 双路径语法，parsed metadata test通过。

### Still Non-blocking Deferred（仍为非阻塞待办）

1. Round 5–20 / `supersededIndex` identity/continuity
   - 维持 carried deferred P2 / CR05 TODO；本轮无升级证据，不得混入 P1 patch。

## New Findings（新发现）

### 1. [高][新] YAML document-start 后的 root property plain remainder 仍泄露伪 terminal

- **来源**：edge + reviewer-probe
- **分类**：patch

- **证据**
  - `yamlDocumentRootPropertyPlainScalar()`只从行首 property token开始识别；`trackerLinesOutsideYamlBlockScalars()`没有在 exact YAML document-start marker后重用该 root scanner。位置：`assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs:1021-1154,1167-1180`。
  - production-function probe：sprint `--- !local note\n  11-9-story: done` 与 workflow `--- &memo note\n  implementation: done` 均返回 `accepted:true`；项目 current `yaml` parser 对两组 bytes 分别报告 `MISSING_CHAR` / `MULTILINE_IMPLICIT_KEY`。

- **影响**
  - parser-invalid tracker仍可伪造唯一 terminal，错误认证 completed legacy并开启 canonical sibling，违反 AC9/AC11。

- **建议**
  - 仅识别 exact document-start indicator 后的 existing bounded root-property plain state；补 sprint/workflow、owner前后与正常 `---` document controls。不得增加 directive/`%TAG` binding、named handle、通用 YAML parser或 tag vocabulary。

### 2. [高][新] Caller-frozen tracker bindings 未冻结同一 Story identity

- **来源**：edge + reviewer-probe
- **分类**：patch

- **证据**
  - `validTrackerBindingsPreflight()`只校验 Story path位于 `stories/`、sprint path固定及各 role局部 shape；未要求 Story basename与 sprint key相同，也未要求该 key属于当前 normalized `storyId`。位置：`resolve-cr-directory.mjs:25-55,744-759`。
  - 定向 probe 传入 current `storyId=11-9`、Story path=`state/stories/12-1-wrong-story.md`、sprint key=`99-9-other-story`。module API 与 production CLI 在 missing-root topology均返回 `ok:true` / exit `0`。

- **影响**
  - caller可冻结彼此矛盾的 Story/sprint authority，resolver仍批准新 run；single resolved context在首次写入前已经失去 identity一致性，违反 AC4/AC9。

- **建议**
  - 在 filesystem inspection前从 immediate Story filename取得 frozen `storyKey`，要求其以 `${storyId}-` 开头且精确等于 sprint key；保持 workflow required/optional existing schema。补 module/CLI、missing/canonical/legacy parity negatives，不新增默认 tracker。

### 3. [高][新] Existing predecessor v2 authenticity 仍未完整验证

- **来源**：blind + edge + reviewer-inspection
- **分类**：patch

- **证据**
  - `validInlineList()`仅检查外层方括号；`[src/a.ts,,]` 与 `[\"unterminated]` 均被 current production validator接受。位置：`resolve-cr-directory.mjs:598-630`。
  - `validPredecessorSchema()`仅处理 review/evaluation后直接 `return true`；CR04 contract要求 `eligibleFindingSetHash`、`candidateRuleCount`、`globalRuleEligibleCount`，CR05要求 `operationScope`、`mode`、`confirmationPolicy`、`authorizationSource`、`mappedFingerprints`、`backlogSource`/hash 等 existing字段，但 current happy fixtures `test/code-review-contract.test.ts:3612-3648` 全部省略仍用于 authentic completed run。
  - Evaluation 的 `PASS` 只与整数语法绑定；non-zero `acceptedCounts.p0/p1/verifyRequired`或 `convergence.newBlocking` 没有与 verdict 互斥。

- **影响**
  - 缺失 required fields、invalid list bytes或仍有 blocking findings的 predecessor可在重算 hash后组成 authentic `DONE`，把 unfinished legacy错误切换到 canonical新run，违反 AC9/AC11/AC12。

- **建议**
  - 只实现 owning contract已存在的四类 predecessor bounded validators与 verdict/count一致性；精确验证 current list/value domains及 CR04/CR05 evaluation binding，不新增 schema字段、不改 producer/basename/round/approval algorithm。

### 4. [高][新] Completion freshness 读取错误的 mutation 来源

- **来源**：blind + edge + reviewer-inspection
- **分类**：patch

- **证据**
  - `validDoneFinalizer()`在 `resolve-cr-directory.mjs:535-551`读取 `sourceStates.evaluationSource.sourceMutationAt`；current evaluation v2没有该 top-level required field，review的 `sourceMutationAt`在 review frontmatter，修复时间则位于 evaluation `fixRecord.sourceMutationAt`。
  - `parseLeadingFrontmatter()`只读取未缩进 scalar，不解析 nested `fixRecord`。因此 mutation time通常回退为 evaluation `generatedAt`；evaluation早于 review source mutation、或 gate早于 fixRecord source mutation时仍可通过现有比较。

- **影响**
  - stale evaluator/gate可认证 `DONE`，不能证明“最后一次修复后已完成 fresh reviewer/evaluator”，直接破坏 completion freshness与 AC9。

- **建议**
  - 使用 review `sourceMutationAt`并受界解析 current evaluation `fixRecord`；要求 evaluation不早于 review source mutation，gate不早于 evaluation与有效 fix mutation，finalizer不早于 gate。仅实现 existing timestamp/order contract，不扩展全链任意 chronology。

## Verification Summary（验证摘要）

- Four Fixer artifact SHA-256：✅ 与 Round 19 Fix Summary全部一致：resolver `906813...0134`、test `4d61be...fad4c`、docs `2dff7d...664`、module help `a196fa...433a`。
- Fresh Reviewer focused slice：✅ `6 passed / 82 skipped`，命令：`npx vitest run test/code-review-contract.test.ts -t "CR19 Finding" --reporter=dot`。
- Edge 与 Acceptance fresh focused suite：✅ `84 passed / 4 todo`。
- R19/Fixer recorded affected matrix：`134 passed / 4 drawer failures / 4 todo`；full：`755 passed / 12 drawer failures / 4 todo`；docs/strict/packaging：PASS。本 Reviewer按授权未重复运行 broad build/full/packaging/governance。
- 定向复现：✅ document-start root property两 role均 parser-invalid但 scanner accepted；✅ cross-role binding mismatch在 module/CLI均 `ok:true`；✅ malformed inline lists被 `validPredecessorSchema()`接受。
- 定向代码核验：✅ CR04/CR05 schema直接落入 `return true`；✅ freshness读取不存在的 evaluation top-level mutation field。

## Passed Items（通过项）

- Round 19 六个显式 regression tests持续 GREEN；current `disposition`、raw exact Story status、docs/help双输出修复保持有效。
- Numeric-only Story ID、single resolved `crDir` propagation、legacy no-migration、dual/multi ambiguity、goal records与 title-bearing negative scan未出现新反例。
- `---` marker之外既有 bare / primary / secondary / verbatim、quoted/flow/block/property-only矩阵持续由 focused suite覆盖。
- Dismiss：generic raw HTML type扩张超出 prior bounded `pre`/`code`授权；`+` malformed delimiter延续既有 bounded inventory裁决；unfinished-minimal artifact与 TOCTOU 未形成当前受界、稳定可复现的新增 contract义务。
- 已知既有问题：`supersededIndex` identity/continuity维持 carried deferred P2 / CR05 TODO。

## Conclusion（结论）

- **结论：不通过（FAIL / FIX_REQUIRED）**
- **阻塞项**：4 个 fresh P1。
- **Owner Gate**：`NONE`。四项均为 existing Story/shared contract的 routine implementation defects，不需要重复 owner decision。
- **建议**：由 fresh Evaluator独立裁决；若确认，Fixer只处理 evaluator批准的 bounded resolver/test slice。禁止实现 `%TAG`、通用 parser、tag vocabulary expansion、generic HTML parser、`supersededIndex` P2、Story 11.10、drawer、mirrors或 broad governance/build范围。
