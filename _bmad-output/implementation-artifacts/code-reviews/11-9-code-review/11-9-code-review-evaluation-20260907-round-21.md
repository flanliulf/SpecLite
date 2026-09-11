---
Story: 11-9
Round: 21
Date: 2026-09-07
Model Used: GPT-5.6Sol
Review Source: 11-9-code-review-summary-20260907-round-21.md
Review Model: GPT-5.6Sol
Type: Code Review Evaluation
---

## Evaluation Summary（评估总结）

对 Story 11-9 的第 21 轮 CR 代码审查结果（复审）进行独立逐条评估。已核对被评估文件 SHA-256 为 `dde1638d1bca4a37e53ce74caad2911016db0ac963059e63688b42763b289604`。Reviewer 的 3 个 finding 均有 current resolver、focused positive control 与 owning CR contract 的直接证据：Finding #1 是 bounded YAML state 的 routine fail-close 遗漏；Finding #2 由 scope、safe integer、CR04 clean PASS 与 CR05 exact deferred set 四个 routine authenticity 子问题组成；Finding #3 的 scalar `fixRecord` 是 routine shape 遗漏，same-round positive 则是 Round 20 evaluation 与更高优先级 owning authority 冲突。

三项全部确认为阻塞交付的 P1，结论为 `FIX_REQUIRED`。本轮不要求修改历史 Round 20 evaluation；应以 current Round 21 evaluation 纠正其对 valid same-round `fixRecord` 的错误授权。该纠正不改变用户已明确批准的业务语义，而是恢复 shared contract / CR06 已存在的 strict-serial authority，因此 `Owner Gate: NONE`。

Option A 保持不变：named handles 全拒绝，不实现 `%TAG` binding、通用 YAML parser、通用 HTML parser 或扩展 tag vocabulary。`supersededIndex` identity/continuity 继续作为 carried deferred P2，不得混入本轮 patch。

## Previous Round Review（上轮问题回顾确认）

### Round 20 Finding #2：已关闭

caller-frozen Story path basename、sprint exact key 与 normalized `storyId` 已在 filesystem inspection 前绑定为同一 `storyKey`。Round 21 Reviewer 没有提供反例，该项保持关闭，不得重开。

### Round 20 Finding #1/#3/#4：部分关闭

- Finding #1 的单个合法 document-start property + plain remainder 已关闭；仅 rejected duplicate/malformed property 分支尚未 fail-close。
- Finding #3 的四类 predecessor required shape、bounded list 与主要 verdict/count 互斥已关闭；仅 scope、safe integer、CR04 clean PASS 与 CR05 exact deferred identity 残余。
- Finding #4 已正确读取 review mutation 与 nested `fixRecord` 时间；但 scalar shape 与 same-round completion authority 仍未关闭。

### Historical CR TODO（历史 CR TODO，非阻塞）

| # | 发现 | 状态 | 评估意见 |
|---|---|---|---|
| Round 5–21 | `supersededIndex` identity/continuity | CR TODO / P2 | 继续 deferred；不得混入本轮 P1 patch。 |

## Finding #1 Evaluation（发现 #1 评估）

### Review Original（审查原文）

> **[高][上轮遗留] document-start 后 rejected root property 未 fail-close**
> - 来源：edge + aggregator
> - 分类：patch

### Evaluation Conclusion（评估结论）：✅ 确认有效 — 需要修复（P1 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性：准确**

`resolve-cr-directory.mjs:1297-1301` 先调用 rejected-property detector，但 current document-start remainder 的受界解析在 `:1343-1356`。当 exact `---` 后出现 duplicate/malformed property 时，helper 在 `:1351` 返回 `false`，而 caller 只在 `:1325` 的 `true` 分支进入 root plain state，没有将“已进入 bounded property grammar 但被拒绝”传递为 ambiguity。因此 `--- !local !other note` 类 parser-invalid bytes 可继续暴露缩进 owner-like scalar。

**严重性判断：合理**

该分支可让无效 sprint/workflow tracker 认证 terminal authority，进而影响 legacy completion 与 canonical sibling 选择，属于 lifecycle fail-close 功能缺陷，P1 合理。

**修复建议：可行**

仅在 exact document-start 后的 existing bounded property grammar 增加 rejected-state 传递；重复、畸形或超出既有 property 组合的 remainder 一律 ambiguous fail-close。正常 `---`、单个合法 `!local` / `&memo` 及已有 controls 必须保持。

**误报评估：非误报**

现有 control 只覆盖合法 property 正控，没有覆盖 helper 的 rejected branch；控制流缺口明确。

## Finding #2 Evaluation（发现 #2 评估）

### Review Original（审查原文）

> **[高][上轮遗留] 四类 predecessor authenticity 尚未绑定完整 scope/count/finding-set 语义**
> - 来源：blind + edge + auditor + aggregator
> - 分类：patch

### Evaluation Conclusion（评估结论）：✅ 确认有效 — 需要修复（P1 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性：准确**

1. Review validator 在 `resolve-cr-directory.mjs:617-634` 要求 `scopeExceptions` 只是可解析 inline list，没有要求 empty；但 shared contract `cr-contract.md:122-135` 明确规定 nonempty scope exception 必须 `REVIEW_DEGRADED`，不得出现 `PASS_RECOMMENDED`。
2. `integerBlockValues()` 与 `boundedNonnegativeInteger()` 在 `resolve-cr-directory.mjs:781-810` 将任意长度 decimal 直接转为 `Number`，没有 `Number.isSafeInteger` guard；因此舍入或 `Infinity <= Infinity` 可绕过 count invariant。
3. CR04 validator 在 `resolve-cr-directory.mjs:658-667` 只检查 hash shape 与 `global <= candidate`，没有执行 shared contract `cr-contract.md:239-260` 的 clean PASS zero eligible / zero candidate 不变量。
4. Finalizer 在 `resolve-cr-directory.mjs:512-523` 只比较 `mappedFingerprints.length` 与 `acceptedCounts.deferred`，没有执行 CR06 `finalizer-workflow.md:21-36` 要求的 accepted deferred fingerprint 全覆盖。Round 20 test `code-review-contract.test.ts:3373-3393` 使用任意 hash 仅满足长度便期待 success，正控本身就固化了该缺口。

**严重性判断：合理**

四个子问题都可让 hash-consistent 但语义不真实的 predecessor 组成 authentic `DONE`。其中 CR05 错配可直接遗漏真实 deferred item，属于收口数据完整性缺陷，P1 合理。

**修复建议：可行，且不需要新 schema field**

- `PASS_RECOMMENDED` 必须要求 parsed `scopeExceptions` 为空。
- 所有 finding/accepted/convergence/CR04 count 必须在 decimal grammar 之外同时满足 `Number.isSafeInteger` 且非负。
- Clean `PASS` 的 evaluation 不存在 eligible finding 时，CR04 必须 `candidateRuleCount: 0` 且 `globalRuleEligibleCount: 0`；不得仅靠一个 shape-valid `eligibleFindingSetHash` 伪造非零候选。
- CR05 exact-set 不需要发明 frontmatter 字段：现有 evaluator output template `speclite-code-review-02-evaluator/assets/output-template.md:43-68` 已给每条 finding 固定 `发现指纹`、`处置`与独立 `Deferred TODO Candidates` 表；CR05 owning workflow `todo-tracker-workflow.md:19-25,50-56` 明确从该区段读取 accepted deferred fingerprints。Resolver 应以该 exact heading/table 为已存机械表达，fail-close duplicate row、duplicate fingerprint、非 hash cell、count/table 不一致，然后将去重后的 evaluation set 与 CR05 `mappedFingerprints` 去重集合做无序 exact equality。禁止从自由 prose 猜测，禁止新增 unknown schema field。

**误报评估：非误报**

以上四个 predicate 在 current code 中均缺失；已有 positive tests 只证明当前放行，不能证明 authenticity。Deferred fingerprint 已有受界机械表达，因此这是 routine consumer 校验遗漏，不是需要发明字段的 contract gap。

## Finding #3 Evaluation（发现 #3 评估）

### Review Original（审查原文）

> **[高][上轮遗留] fixRecord freshness 的 routine shape 缺口与 authority 冲突未解决**
> - 来源：edge + auditor + aggregator
> - 分类：decision_needed

### Evaluation Conclusion（评估结论）：✅ 确认有效，但不需要 owner 新决策 — 需要修复（P1 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性：准确；Reviewer 的 authority 冲突识别正确，但已有 owning authority 可裁决**

`boundedFixRecord()` 在 `resolve-cr-directory.mjs:813-832` 只计数 exact `fixRecord:` block header。`fixRecord: ignored` 不匹配 occurrence，于 `:816` 被当作 absent 返回。另一方面，`validDoneFinalizer()` 在 `:553-569` 明确允许 current evaluation 携带完整 `fixRecord`，只要 gate 不早于 fix mutation 便成功；`code-review-contract.test.ts:3424-3428` 又将该 same-round 路径固化为 success。

但 shared contract `cr-contract.md:398-412` 要求“最后一次修复或 verify-only 后已完成 fresh reviewer/evaluator”；owning CR06 `finalizer-workflow.md:19-28` 进一步明确要求 fixRecord 后有更高 round fresh review/evaluation，且 current evaluation 不带未复验 fixRecord。这是专门 owning finalization authority，优先于 Round 20 evaluator 对局部 positive test 的授权。

**严重性判断：合理**

scalar record 可隐藏 malformed evidence；same-round record 可在没有后续 fresh reviewer/evaluator 的情况下认证 `DONE`，直接违反 strict-serial completion freshness，P1 合理。

**修复建议：可行**

1. 只要 leading frontmatter 中出现任何 `fixRecord` key，就必须是唯一、完整、顺序固定的 block；scalar、duplicate、partial、unknown 或 malformed 一律 fail-close。
2. Resolver 认证可收口 current evaluation 时，必须拒绝其携带 `fixRecord`。Fixer 记录只属于已修复的历史 evaluation；修复后必须由更高 round fresh review/evaluation 形成不带未复验 fixRecord 的 current 收口证据。
3. 将 Round 20 `code-review-contract.test.ts:3424-3428` 的 same-round success 正控改为 fail-close negative，并增加更高 round fresh review/evaluation 的 authentic success control。这是纠正历史 evaluation 错误，不修改、删除或重写 Round 20 evaluation 文件。

**误报评估：非误报**

Round 20 evaluation 不是 shared lifecycle contract 的 owner，也没有用户明确批准覆盖 CR06 strict-serial 语义的证据。因此本轮可按 owning contract 作 routine correction，无需请求 owner 在两种语义中重新选择。

## Overall Evaluation Conclusion（整体评估结论）

### Required Fixes（需要修复，阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|---|---|---|---|
| 1 | document-start rejected root property 未 fail-close | [高] | **P1** | existing bounded grammar 没有传递 rejected state。 |
| 2 | predecessor scope/count/finding-set authenticity 不完整 | [高] | **P1** | scope、safe integer、CR04 clean PASS 与 CR05 exact deferred set 都可被绕过。 |
| 3 | scalar/same-round `fixRecord` 可绕过 freshness | [高] | **P1** | scalar shape 被当 absent，same-round success 违反 owning CR06 authority。 |

### CR TODO（非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|---|---|---|---|
| carried | `supersededIndex` identity/continuity | [延续] | **P2** | 保持 deferred；不得由本轮 Fixer 处理。 |

### Evaluation Decision（评估决定）

- **Finding #1–#3**：全部确认有效，结论为 `FIX_REQUIRED`。
- **Owner Gate**：`NONE`。Finding #3 的 authority 优先级已由 shared contract 与 owning CR06 确定；本轮只纠正 R20 的局部评估错误，不改历史文件。
- **Fingerprint contract check**：现有 evaluator exact template + CR05 owning workflow 已定义 deferred fingerprint 的受界机械消费表达；不增加 schema field，不从 prose 猜测。
- **Option A**：保持不变；named handles 全部拒绝，不实现 `%TAG` binding。
- **P2**：`supersededIndex` 继续 deferred，不升级、不混入 P1 patch。

## Bounded Fixer Authorization（受界 Fixer 授权）

### Exact File Whitelist（精确文件白名单）

1. `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs`
2. `test/code-review-contract.test.ts`
3. 本 evaluation 文件仅允许 append `Fix Summary`

除上述文件外零写入。特别禁止修改 shared contract、CR01–06 Skill/workflow/template、runner、Story、tracker、completion/kickoff gate、CR review logs、PLAN/EXPERIMENTS、SPEC、source/installed mirrors、其他测试或其他文档。

### Independent RED / GREEN Matrix（独立 RED / GREEN 矩阵）

1. **Document-start rejected property**
   - RED：sprint/workflow 分别覆盖 exact `---` 后 duplicate `!`、duplicate `&`、畸形 property 及 owner 前/后；在 authentic graph 中重绑 tracker/finalizer hash 后证明 current accepted。
   - GREEN：上述全部 fail-close；正常 `---`、单个合法 `!local` / `&memo`、已有 property/quoted/flow/block/plain controls 保持。
2. **Scope + safe integers**
   - RED：nonempty `scopeExceptions` + `PASS_RECOMMENDED`；各 integer block 独立覆盖 `Number.MAX_SAFE_INTEGER + 1` 与超长 decimal/`Infinity`结果，并递归重绑 dependent hashes。
   - GREEN：scope exception 非空一律拒绝；只接受 nonnegative safe integers，已有小整数 controls 保持。
3. **CR04 clean PASS authenticity**
   - RED：对 clean `PASS` evaluation 分别伪造 nonzero candidate/global count，以及与 evaluation eligible evidence 不一致的 report，重绑下游 hash 后证明 current accepted。
   - GREEN：clean PASS 只接受 zero eligible / zero candidate / zero global 语义；不发明新 CR04 field 或规则提炼算法。
4. **CR05 exact deferred fingerprint set**
   - RED：在 deferred count 不变时，分别使用 wrong same-length set、duplicate set、missing member、extra member、invalid/duplicate evaluation table row，并递归重绑 hashes。
   - GREEN：只从 exact `Deferred TODO Candidates` 表读取受界 fingerprint，与 CR05 `mappedFingerprints` 去重集合 exact equality；任何表/count/identity ambiguity fail-close。
5. **fixRecord shape + fresh-round authority**
   - RED：scalar、duplicate、partial、unknown `fixRecord` 以及完整 same-round record 都在 authentic graph 中单独复现 current accepted。
   - GREEN：malformed shape 一律 fail-close；current finalizing evaluation 带任何 `fixRecord` 一律拒绝；更高 round fresh review/evaluation 且 current evaluation 无未复验 record 时 authentic success。

每个 negative 必须从 complete authentic control 出发，只变异一个目标不变量，并按 dependency graph 重算下游 hashes；否则 stale binding 的提前失败不能证明目标 validator。

### Allowed Verification（允许验证）

- 仅运行上述 5 组新增 focused test name 的独立 RED，再在 patch 后逐组独立 GREEN。
- `npx vitest run test/code-review-contract.test.ts --reporter=dot`
- `node --check assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs`
- 对三个白名单文件执行 scoped `git diff --check` 与实际 diff 越界审计。
- 只读 production-function 定向 probe。

禁止 broad build、full repository suite、packaging、canonical governance、fixture regeneration、completion gate 刷新、CR04、CR05、CR06 执行或 logs/tracker 更新。Fixer 完成后只向本 evaluation append `Fix Summary`；随后必须由更高 round fresh Reviewer 复审、fresh Evaluator 复评。latest Reviewer/Evaluator 双 PASS 前不得进入 CR04、CR05 或 CR06。

## Fix Summary（修复总结）

### 修复执行记录
- **Date**: 2026-09-07
- **Model Used**: GPT-5.6Sol
- **Fix Items**: 3

### Fix Results（修复结果）

1. **Finding #1 — document-start rejected property**：`yamlDocumentRootPropertyPlainScalar()` 现在显式返回 `accepted` / `rejected` / `null`，exact `---` 后 duplicate tag、duplicate anchor、第三个 property 或畸形 bounded property 会将 tracker 解析标记为 ambiguous 并 fail-close；既有合法单 property 与其他 YAML controls 保持不变。
2. **Finding #2 — predecessor authenticity**：`PASS_RECOMMENDED` 要求 `scopeExceptions: []`；所有 finding、accepted、convergence、CR04 count 统一限制为 nonnegative safe integer；clean `PASS` 强制 CR04 candidate/global 均为零；`PASS_WITH_DEFERRED_TODOS` 仅从 exact `Deferred TODO Candidates（延期候选）` heading/table grammar 机械读取 fingerprint，并与 CR05 `mappedFingerprints` 的唯一无序集合做 exact equality。未新增 schema field，未从 prose 推断。
3. **Finding #3 — fixRecord shape/freshness**：leading frontmatter 中任何 `fixRecord` key 都会进入严格 shape 校验；scalar、duplicate、partial、unknown 或 malformed 均 fail-close。current finalizing evaluation 携带任何完整 `fixRecord` 也会拒绝；只有更高 round fresh review/evaluation 且 current evaluation 无未复验 record 的路径可收口。R20 same-round success 正控已纠正为 negative，未修改 R20 evaluation 文件。

### Verification（验证）

- 五组新增 focused test 在生产 patch 前均独立真实 RED，并在 patch 后逐组独立 GREEN；fixture 均从 `writeAuthenticCompletedRound()` complete authentic control 出发，通过 `rewriteAuthenticPredecessorGraph()` 或 `rewriteTrackerAndFinalizerHash()` 递归重绑 dependent hashes。
- `npx vitest run test/code-review-contract.test.ts --reporter=dot`：PASS，`93 passed | 4 todo`。
- `node --check assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs`：PASS。
- scoped `git diff --check`：PASS。
- resolver SHA-256：`a928e35392488e5c5b0977c68f8801d28f66590ab840c55f3b7430ec996d67b0`。
- test SHA-256：`4c5fe99384d2601e2474be7ab0d0d69746389af638392a0ac59d2d1b018d5c5e`。

### Scope Audit（范围审计）

- 实际写入仅限授权白名单：resolver、`test/code-review-contract.test.ts`、本 evaluation 的 append-only `Fix Summary`。
- 未修改 contracts、CR01–06 Skills/workflows/templates、docs/help、Story、tracker、gate、logs、Story 11.10、drawer、mirrors；未执行 broad build、full repository suite、packaging、governance、CR04、CR05 或 CR06。
- `supersededIndex` P2 与 Option A 保持不变。
