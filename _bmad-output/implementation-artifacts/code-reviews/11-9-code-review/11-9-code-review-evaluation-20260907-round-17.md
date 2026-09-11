---
Story: 11-9
Round: 17
Date: 2026-09-07
Model Used: OpenAI GPT-5.6 Sol (gpt-5.6-sol)
Review Source: 11-9-code-review-summary-20260905-round-17.md
Review Source SHA-256: 1921d950b471353dd6f5a1f65adbdfe5e2bc3001b7738393a32f5e4bcd5dacaf
Review Model: OpenAI GPT-5.6 Sol (gpt-5.6-sol)
Type: Code Review Evaluation
Owner Decision: Option A approved on 2026-09-07
---

## Evaluation Summary（评估总结）

对 Story 11-9 的第 17 轮 CR 代码审查结果（复审）进行逐条独立评估。Round 17 三层正式结果均成功返回，Aggregator 将 `6` 条 raw finding 去重为 `2` 个 fresh production P1 与 `1` 个 carried deferred P2；Review Source 精确 SHA-256 为 `1921d950b471353dd6f5a1f65adbdfe5e2bc3001b7738393a32f5e4bcd5dacaf`。

评估确认：

1. outer quoted/flow/block/property-only/pending opening 在 Shared Bounded Tag Vocabulary（共享受界 Tag 词汇）拒绝 parser-invalid `!!` / `!h!` 等 empty-suffix property-like token 后，没有建立 ambiguous state；scalar 正文中的伪 terminal 因而仍可能进入 exact owner matcher。该问题有效，维持独立 P1。
2. current shared matcher完整接受 non-empty named-handle `!h!suffix`，但 resolver不读取或绑定 `%TAG` declaration；declared 与 undeclared 输入走同一认证路径。该问题有效，维持独立 P1。
3. 用户于 `2026-09-07` 明确批准 **Option A — Narrow Bounded Vocabulary**：所有 named-handle `!h!suffix`，无论是否存在 `%TAG` declaration，均属于 current tracker-authenticity scanner 范围外并必须 fail-close；继续保留 bare `!`、primary `!local`、secondary `!!str` 与完整 non-empty verbatim `!<...>`。Owner Gate 已解除，不授权 `%TAG` binding。
4. 两个 P1 共享 tag-property 上位边界，但 entry、失败机制与 closure evidence 不同，必须分别执行并记录 RED→GREEN，不得合并为一个测试或以一个结果替代另一个。
5. `supersededIndex` identity/continuity 继续维持 carried P2，仅供后续 CR05 登记；本轮不得实现。

**Verdict：`FAIL / FIX_REQUIRED`。Owner Gate：`RESOLVED — OPTION_A_APPROVED`。** 仅授权 current resolver、focused test 与本 evaluation 的 Fix Summary append；不授权 contract、Story、tracker、completion gate、11.10、drawer、通用 parser、`%TAG` binding 或任何其他文件。

## Previous Round Review（上轮问题回顾确认）

### Round 16 Finding #1 — 合法 outer bare `!`：CLOSED within authorized shapes

Current resolver已通过 `YAML_BOUNDED_NODE_PROPERTIES_SOURCE` 将合法 bare `!` 纳入 outer quoted/flow/block/property-only/pending detection（`resolve-cr-directory.mjs:916-918,959-983,1001-1023,1151-1179`）。focused test 对 sprint/workflow、伪 owner-only、追加真实 owner与 filesystem snapshot已有闭环（`test/code-review-contract.test.ts:2612-2648`）。Round 17 Finding #1只处理 bounded matcher拒绝后的 invalid property-like opening，不重开合法 bare `!`。

### Round 16 Finding #2 — inner empty-suffix shorthand：CLOSED within authorized shapes

Current `scanYamlFlowCollectionLine()` 在 tag property无法完整匹配或 token delimiter不完整时返回 ambiguous（`resolve-cr-directory.mjs:1102-1121`）；focused test已覆盖 inner `!!`、`!h!` 与同构 empty-suffix shorthand的 parser error、fail-close及 zero-write（`test/code-review-contract.test.ts:2650-2672`）。Round 17 Finding #1位于 inner scanner之前；Round 17 Finding #2只收窄 non-empty named handle，不重开该 inner empty-suffix closure。

### Historical CR TODO（历史 CR TODO，非阻塞）

| # | 发现 | 状态 | 评估意见 |
|---|------|------|---------|
| R5–R17-P2-1 | `supersededIndex` identity/continuity 未验证 | CR TODO / 非阻塞 | 同意继续 defer；本轮 Fixer 禁止实现、保留 ordinal或扩展 supersession algorithm。 |

## Finding #1 Evaluation（发现 #1 评估）

### Review Original（审查原文）

> **[高][新] Outer matcher拒绝invalid empty-suffix opening后未fail-close，scalar伪terminal仍可认证completed legacy**
> - 来源：blind
> - 分类：patch

### Evaluation Conclusion（评估结论）：✅ 确认有效 — 需要修复（P1 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性：准确**

Shared matcher位于 `resolve-cr-directory.mjs:916-918`；它正确要求 secondary/named shorthand具有 non-empty suffix，因此不会完整接受 `!!` / `!h!`。但是 outer tracker scanner在 `:1001` 先将当前物理行加入 `visible`，随后只有 detector完整匹配时才建立 block、quoted、flow或 pending state（`:1002-1025`）。pending-property next-node路径同样在 matcher失败时只把既有 pending state标为 ambiguous（`:959-983`），没有为普通 outer opening提供“property-like token存在但不属于 bounded vocabulary”的对等 fallback。

因此 `notes: !! "...`、`notes: !h! [...]`、block header与 property-only/cross-line node等 parser-invalid opening可能保持 visible；其 multiline scalar正文中的 `<storyKey>: done` 会重新进入 exact terminal matching。Blind报告的 parser proof与 authentic recovery proof证明：没有真实root owner时，current resolver可错误返回 `ok:true / compatibilityMode:"canonical"`，而 before/after filesystem snapshot相同。错误属于 read-only authenticity decision，不是写副作用。

现有 Round 16 outer regression只覆盖 parser-valid bare `!`（`test/code-review-contract.test.ts:2612-2648`）；inner malformed regression只覆盖已进入 flow collection的 empty suffix（`:2650-2672`），没有 outer rejected-token matrix。故 fresh `73 passed / 4 todo` 不能驳回本 finding。

**严重性判断：合理**

该缺陷使 parser-invalid tracker中的伪 terminal具备 completed-legacy认证能力，直接影响 canonical continuation，并违反 shared contract对唯一、可解析、role-owned exact scalar的要求（`cr-contract.md:65-79,409`）。维持 production P1、阻塞交付合理。

**修复建议：可行，严格受界授权**

只允许在 current resolver既有 outer quoted/flow/block/property-only/pending入口增加对 rejected property-like opening的 ambiguous/fail-close处理，并在 focused test增加对应矩阵。不得改为完整 YAML parser，不得扩大 accepted grammar，不得借用 Finding #2 的 named-handle收窄来替代 outer fallback修复。

**误报评估：非误报**

代码控制流、parser-invalid反例、authentic recovery错误 continuation 与 zero-write形成闭合证据链。

### Independent RED→GREEN Criteria（独立 RED→GREEN 准则）

**RED（production 修改前必须单独新增并稳定失败）**

1. 对 sprint/workflow 两种 role，先由项目 current YAML parser证明 outer `!!`、`!h!`及同构 empty-suffix opening存在 error，再证明 current resolver未 fail-close。
2. 覆盖 mapping/sequence/explicit-value、quoted/flow/block、same-line/cross-line property、tag-only与 tag+anchor两种次序；伪 owner-only与伪 owner + 唯一真实 owner均须验证 terminal真实性语义。
3. 至少一个完整 authentic completed-legacy recovery fixture必须同时断言错误 continuation与 before/after完整 filesystem snapshot一致。

**GREEN（Finding #1 单独关闭条件）**

1. 所有 outer rejected property-like opening均进入 ambiguous/fail-close；不得只依赖 inner flow scanner。
2. 合法 bare `!`、`!local`、`!!str`与完整 non-empty `!<...>`在原冻结矩阵中继续 canonical recovery且 zero-write。
3. 既有 hidden/pending state、最多一个 tag + 一个 anchor、唯一root owner、classifier/recovery与 zero-write语义不变。
4. Finding #1的定向测试必须可单独运行并由 RED变为 GREEN，不得依赖 Finding #2测试通过。

## Finding #2 Evaluation（发现 #2 评估）

### Review Original（审查原文）

> **[高][新] Non-empty named handle未绑定`%TAG` declaration，declared/undeclared tracker走同一认证路径**
> - 来源：edge + auditor
> - 分类：decision_needed

### Evaluation Conclusion（评估结论）：✅ 确认有效 — 需要修复（P1 优先级；Option A 已批准）

### Evaluation Analysis（评估分析）

**问题描述准确性：准确**

`YAML_BOUNDED_TAG_PROPERTY_SOURCE` 的 named-handle分支接受 handle与suffix均非空的 `!h!suffix`（`resolve-cr-directory.mjs:916`）；outer detectors与 `scanYamlFlowCollectionLine()`复用该 matcher（`:964-981,1002-1023,1033-1042,1102-1121,1151-1179`）。resolver没有收集、绑定或认证 `%TAG` directive，因此移除合法control中的 directive不会改变 property token、hidden state或 owner matching路径。

Edge 与 Acceptance报告均给出 parser differential：项目 current `yaml@2.9.0` 对 undeclared `!h!suffix`返回 `TAG_RESOLVE_FAILED`，带有效 `%TAG !h! ...` context时才 zero-error；current resolver却可在两种输入上采用相同认证路径。现有 positive control仍把带directive的 `!h!suffix`当作合法（`test/code-review-contract.test.ts:2674-2687`），且没有 declared/undeclared均应 fail-close的 Option A regression。

**严重性判断：合理**

在 Owner裁决前该项确实是 `decision_needed`；用户现已选择 Option A，决策歧义解除，但 production缺陷仍存在并继续阻塞交付。parser-invalid tracker可伪造 completed evidence，故维持 P1。

**修复建议：Option A 可行且为唯一授权方案**

所有 named-handle `!h!suffix`无论是否声明 `%TAG`均必须 fail-close。Fixer应在现有 bounded matcher内移除 named-handle acceptance或以等价局部方式拒绝它，并将 Round 16带directive named-handle positive control改为 negative。不得实现 `%TAG` scanning、handle-to-prefix binding、tag URI验证、document directive scope、schema resolution、新 runtime dependency或通用 YAML parser。

**误报评估：非误报**

多来源报告、current matcher代码、parser differential与 authentic recovery证据一致；Owner批准 A只解决 contract选择，不会使 current false-accept自动消失。

### Option A Frozen Vocabulary（方案 A 冻结词汇）

| Token shape | 冻结结果 |
| --- | --- |
| `!` | 保留；合法 bare non-specific tag control。 |
| `!local` | 保留；合法 primary-handle shorthand，suffix非空。 |
| `!!str` | 保留；合法 secondary-handle shorthand，suffix非空。 |
| `!<content>` | 保留；`content`非空、同一 token内闭合 `>`；现有完整 non-empty verbatim controls继续通过。 |
| `!h!suffix` | **拒绝**；任意 non-empty named handle均 fail-close，不区分是否存在 `%TAG` declaration。 |
| `!!` / `!h!` / 同构 empty-suffix | **拒绝**；继续 fail-close。 |
| `!<>` / `!<content`、未分隔 node、duplicate/third/dangling property | **拒绝/ambiguous**；保持既有 fail-close。 |

### Independent RED→GREEN Criteria（独立 RED→GREEN 准则）

**RED（production 修改前必须单独新增并稳定失败）**

1. 对 sprint/workflow 两种 role，证明 current resolver对 declared 与 undeclared non-empty named handle均仍可 canonical；undeclared fixture还须由项目 current YAML parser证明 `TAG_RESOLVE_FAILED`。
2. 覆盖 outer与 inner、mapping/sequence/explicit-value、same-line/cross-line、quoted/flow/block、tag-only与 tag+anchor两种次序；至少包含 declared/undeclared pair。
3. 每个 complete recovery fixture均断言 before/after filesystem snapshot不变；不得以实现 `%TAG`解析取得 GREEN。

**GREEN（Finding #2 单独关闭条件）**

1. declared 与 undeclared `!h!suffix`在冻结矩阵中全部 fail-close且 zero-write。
2. bare `!`、`!local`、`!!str`与完整 non-empty `!<...>` controls继续通过；empty-suffix与既有 malformed controls继续 fail-close。
3. 定向测试必须可单独运行并由 RED变为 GREEN，不得依赖 Finding #1 outer invalid-opening测试通过。
4. production代码不得读取或解释 `%TAG` directive；directive存在与否不能改变 named-handle fail-close结果。

## Finding #3 Evaluation（发现 #3 评估）

### Review Original（审查原文）

> **[中][延续] `supersededIndex` identity/continuity未验证**
> - 来源：blind + edge + auditor
> - 分类：defer / CR05 TODO

### Evaluation Conclusion（评估结论）：⚠️ 有效但降级 — 建议纳入 CR TODO 跟踪（P2 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性：准确**

`classifyArtifactName()`解析并验证 `supersededIndex`为 safe positive integer，但返回 identity时不保留 ordinal（`resolve-cr-directory.mjs:266,292-332,380-389`）；historical validation仍不验证同 family/round ordinal从 `1`开始、唯一且连续。该差异自 Round 5起持续存在。

**严重性判断：合理**

它影响 historical replacement timeline的唯一审计，但不改变 current artifact cardinality、consumer选择、canonical/legacy continuation或 runtime write target。维持 P2非阻塞合理。

**修复建议：可行但本轮禁止实施**

继续交由 CR05登记；本轮不得保留 ordinal、增加 continuity validation或扩展 same-round producer retry/supersession algorithm。

**误报评估：非误报**

代码差异客观存在，但没有新证据支持升级。

## Overall Evaluation Conclusion（整体评估结论）

### Required Fixes（需要修复，阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | outer rejected empty-suffix opening未fail-close | [高] | **P1** | 在所有既有 outer入口建立 bounded ambiguous/fail-close fallback，并以独立 outer RED→GREEN关闭。 |
| 2 | named handle缺少 authorization | [高] | **P1** | 按用户批准的 Option A，无条件拒绝所有 `!h!suffix`，不实现 `%TAG` binding，并以独立 named-handle RED→GREEN关闭。 |

### CR TODO（建议纳入 CR TODO跟踪，非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 3 | `supersededIndex` identity/continuity 未验证 | [中] | **P2** | 维持 carried deferred；CR05登记，本轮禁止实现。 |

### Fixer Whitelist（Fixer 最小白名单）

Fixer只可修改以下现有文件/区域：

1. `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs`：仅限 Shared Bounded Tag Vocabulary及其 outer/inner property-like fail-close所必需的局部 resolver slice。
2. `test/code-review-contract.test.ts`：仅限两个 P1的 focused、parser-backed、authentic recovery与 zero-write regression；允许因新增fixture造成的同文件内测试计数、skip计数或 frozen mechanical expectation的机械更新，但不得借机扩大 classifier、contract或其他功能测试。
3. `11-9-code-review-evaluation-20260907-round-17.md`：仅允许 Fixer在文末 append `## Fix Summary（修复摘要）`，记录每个 finding的独立 RED、GREEN、修改位置、精确验证结果与 boundary audit；不得改写本评估结论正文。

除上述三项外无任何隐含白名单。若 resolver/test两个代码白名单文件不足以关闭两个 P1，Fixer必须停止并返回 fresh Owner Gate，不得修改 contract、Story、tracker、completion gate、goal records、CR rules/TODO、11.10、drawer、installed mirrors、package或 governance artifacts。

### Evaluation Decision（评估决定）

- **Finding #1（outer rejected opening fallback）**：确认有效，P1；授权现有 outer detector slice与 focused test的 bounded修复。
- **Finding #2（named handle authorization）**：确认有效，P1；用户已批准 Option A，所有 named handles无条件 fail-close；严禁 `%TAG` binding。
- **Finding #3（`supersededIndex` continuity）**：确认有效但维持 P2，仅作为 carried deferred CR TODO。
- **Verdict**：`FAIL / FIX_REQUIRED`。
- **Owner Gate**：`RESOLVED — OPTION_A_APPROVED`。
- **Sequence Gate**：两个独立 RED → bounded Fixer → 两个独立 GREEN + focused suite/syntax/scoped whitespace → 由 outer owner重生 completion gate → fresh Reviewer → fresh Evaluator；latest Reviewer/Evaluator双 PASS前禁止 CR04、CR05、CR06。

## Verification Summary（验证摘要）

- 独立核对 current resolver SHA-256=`92f1c31e571b078ea5b4f67b85ac8d5d736fc24489f712f055d83049d5fab976`、focused test SHA-256=`97c08a4dcc95d8e235548b46071e399cc998d31bff5713dc7cf8f30156ff66a0`、shared contract SHA-256=`ca2ee91f7a789a6f3f330a710dfe7d9e724f5675fd46a87070c4830089a3a935`。
- Round 17 layer identity：blind SHA-256=`662caae4f054c2bf6e962a1f46e6c7f1c8e082f487281aed7c15378edae8b0a9`；edge SHA-256=`d49d6ba5eb3704701c9f4adbebb57a289eae2f17649b44b103f4e83a8346c832`；acceptance SHA-256=`ebc83086dbc3588456ff0d1f7a20174805ce6a5e8d13b2c0f4cada2c645fdfec`。
- Current source证明 named-handle acceptance位于 `resolve-cr-directory.mjs:916`，inner property consumption位于 `:1102-1121`，outer detector与 visible-first控制流位于 `:959-1025,1033-1042,1151-1179`。
- Current tests证明 outer bare control位于 `test/code-review-contract.test.ts:2612-2648`，inner empty-suffix malformed与带directive named-handle positive control位于 `:2650-2687`；现状没有本评估冻结的两条独立 negative matrix。
- 本 Evaluator只读核对 current code与证据，未运行 build、full suite、packaging、canonical governance，也未将 Round 17 Reviewer记录的 `73 passed / 4 todo`冒充本轮 fresh execution。

## Boundary Audit（边界审计）

- 本 Evaluator仅新增 `11-9-code-review-evaluation-20260907-round-17.md`；未修改 source、tests、fixtures、contract、Story、tracker、completion gate、goal records、CR rules/TODO或既有 CR artifacts。
- 未读取、扫描、修改或归因 Story 11.10、drawer/zip、workspace mirrors或 fixed-count baselines。
- 未实现两个 P1或 carried P2，未进入 CR04、CR05或 CR06。
- 本评估记录用户于 `2026-09-07` 对 Option A的明确批准；该批准不扩张 tracker grammar、parser authority或文件白名单。

## Fix Summary（修复摘要）

### 修复执行记录
- **Date**: 2026-09-07
- **Model Used**: OpenAI GPT-5.6 Sol (gpt-5.6-sol)
- **Fix Items**: 2
- **Authorized Evaluation SHA-256（append 前）**: `575828509b169f0c10f227dfe499105843e0a78c34c314bd1901b58eb1107121`

### Finding #1 — Outer rejected empty-suffix opening fail-close

- **RED**：先新增独立测试 `fails closed on parser-invalid outer empty-suffix tag openings`；production 修改前定向执行稳定失败，resolver 对 malformed outer opening错误返回 `ok:true`，Vitest结果为 `1 failed / 77 skipped`。
- **Fix**：在 `resolve-cr-directory.mjs:920-938` 新增共享 bounded property精确消费与 rejected-token判定；在 outer visible-first detector入口 `:1021-1025` 将不属于 bounded vocabulary的 property-like opening转入既有 ambiguous/fail-close状态。未替换为通用 YAML parser。
- **Matrix**：`sprint` / `workflow`；mapping / sequence / explicit-value；quoted / flow / block；same-line / cross-line property；tag-only及 tag + anchor两种次序；伪 owner-only与追加唯一真实 owner；每个fixture均由项目 current YAML parser证明 invalid，并断言完整 filesystem snapshot零写入。
- **GREEN**：同一定向测试结果为 `1 passed / 78 skipped`；所有 rejected outer opening均返回 `legacy-current-series-evidence-invalid`。

### Finding #2 — Option A named-handle rejection

- **RED**：先新增独立测试 `fails closed on declared and undeclared named-handle tags`；production词汇收窄前定向执行稳定失败，resolver 对 named handle错误返回 `ok:true`，Vitest结果为 `1 failed / 78 skipped`。
- **Fix**：在 `resolve-cr-directory.mjs:916` 从 Shared Bounded Tag Vocabulary移除 named-handle分支；`!h!suffix`在 outer helper及既有 inner scanner中均因 token未完整消费而 fail-close。未读取、解析或绑定 `%TAG`。
- **Matrix**：`sprint` / `workflow`；declared / undeclared pair；outer / inner；mapping / sequence / explicit-value；same-line / cross-line；quoted / flow / block；tag-only及 tag + anchor两种次序；undeclared由 current YAML parser精确断言 `TAG_RESOLVE_FAILED`，declared断言 zero parser error，全部fixture断言完整 filesystem snapshot零写入。
- **GREEN**：同一定向测试结果为 `1 passed / 78 skipped`；declared与undeclared named handle均返回 `legacy-current-series-evidence-invalid`。

### Verification（验证）

- Finding #1独立 GREEN：`1 passed / 78 skipped`。
- Finding #2独立 GREEN：`1 passed / 78 skipped`。
- focused `test/code-review-contract.test.ts`：`75 passed / 4 todo`，共 `79` tests。
- syntax：`node --check assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs`，exit `0`。
- scoped whitespace：`git diff --check -- <resolver> <focused-test>`，exit `0`。
- 最终 resolver SHA-256：`39e90743fc6e0b45d3b9b7b36b54f8b7b83a78d9d837c7bd3e16336a27f724f8`。
- 最终 focused test SHA-256：`b1acd3c6ff18784c3a6d05a293dd5b41077690a05f62ae354950828f0a1ab924`。

### Boundary Audit（边界审计）

- 仅修改 whitelist中的 current resolver、focused test与本 evaluation append；未修改 evaluation既有正文。
- 保留 bare `!`、primary `!local`、secondary `!!str`与完整 non-empty `!<...>`；既有 malformed/empty-suffix controls继续 fail-close。
- 未实现 `supersededIndex` identity/continuity P2；未读取或实现 `%TAG` binding。
- 未触碰 contract、Story、tracker、completion/kickoff gate、goal records、CR rules/TODO、11.10、drawer/zip、installed mirrors、package或 governance artifacts。
- 未运行 build、full suite、packaging、canonical governance、CR04、CR05或CR06。
