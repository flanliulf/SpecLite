---
Story: 11-9
Round: 18
Date: 2026-09-07
Model Used: OpenAI GPT-5.6 Sol (gpt-5.6-sol)
Review Source: 11-9-code-review-summary-20260907-round-18.md
Review Source SHA-256: 5d0da3b126df9cc89be47d71c9cbb6c53acf1dfeec040853416904d258d165f2
Review Model: OpenAI GPT-5.6 Sol (gpt-5.6-sol)
Type: Code Review Evaluation
Owner Decision: Option A approved on 2026-09-07
---

## Evaluation Summary（评估总结）

对 Story 11-9 的第 18 轮 CR 代码审查结果（复审）进行逐条独立评估。被评估文件是当前最大 review 轮次，精确 SHA-256 为 `5d0da3b126df9cc89be47d71c9cbb6c53acf1dfeec040853416904d258d165f2`；其三层正式输出均成功返回，Aggregator 将 `20` 条 raw observations 去重为 `3` 个 fresh production P1，并延续 `1` 个 deferred P2。

评估确认：

1. `hasRejectedOuterYamlNodeProperty()`与 outer quoted/flow/block/property-only helpers均只识别 explicit-value、sequence-value或mapping-value入口；document-root tag/property node不在这些入口内。故 document-root declared/undeclared named handle以及 empty-suffix tag可使 scalar正文中的伪 terminal保持 visible。该问题有效，维持独立 P1。
2. `trackerLinesOutsideYamlBlockScalars()`只返回已累积的 `visible` 行；rejected/ambiguous状态仅抑制后续行，未产生 whole-file invalid终态，也未在 EOF 对未闭合 quoted/flow状态作失败判定。故 owner先出现时，后续 unsupported或parser-invalid construct不能撤销已收集证据。该问题有效，维持独立 P1。
3. shared outer anchor matcher `&[^ #\\t\\r\\n]+`接受 flow delimiters `,[]{}`，宽于 inner anchor matcher；primary tag matcher还完整接受 quote、invalid percent escape与backslash。项目 current `yaml@2.9.0` 对审查样例均报告 parser error，而 current bounded regex仍将其消费为完整property。该问题有效，维持独立 P1。
4. 用户已批准 **Option A — Narrow Bounded Vocabulary**：任意 named handle `!h!suffix`均必须 fail-close，不区分 `%TAG` declaration；不得实现 `%TAG` binding，也不得借本轮修复扩大任何 tag 词汇。保留的 positive controls仅为既已冻结的 bare `!`、primary `!local`、secondary `!!str`与完整 non-empty verbatim `!<...>`。
5. `supersededIndex` identity/continuity继续维持 carried P2，仅供后续 CR05 登记，本轮不得实现。

**Verdict：`FAIL / FIX_REQUIRED`。Owner Gate：`RESOLVED — OPTION_A_APPROVED`。** 仅授权 current resolver、focused test与本 evaluation的 Fix Summary append；不授权 contract、Story、tracker、completion gate、11.10、drawer、installed mirrors或其他文件。

## Previous Round Review（上轮问题回顾确认）

### Round 17 Finding #1 — Outer rejected empty-suffix opening：PARTIALLY CLOSED

Current resolver已在 mapping / sequence / explicit-value入口加入 rejected property detection（`resolve-cr-directory.mjs:920-938,1021-1025`），且 focused test覆盖 malformed construct位于 owner之前的 outer矩阵（`test/code-review-contract.test.ts:2650-2686`）。但 document-root不进入该 detector，且 owner先于invalid construct时既有 `visible` 不会被撤销，因此不能标记为全量 CLOSED。

### Round 17 Finding #2 — Option A named-handle rejection：PARTIALLY CLOSED

Shared bounded vocabulary已移除 named-handle分支；outer入口可通过未完整消费检测拒绝 `!h!suffix`，inner scanner也可转为 ambiguous（`resolve-cr-directory.mjs:916,920-938,1126-1145`）。focused test确认 declared/undeclared named handle在既有 outer/inner矩阵中 fail-close（`test/code-review-contract.test.ts:2732-2764`）。但 document-root入口绕过与 owner-first顺序缺口仍允许 named handle tracker获得认证，因此 Option A尚未完整实现。

### Historical CR TODO（历史 CR TODO，非阻塞）

| # | 发现 | 状态 | 评估意见 |
|---|------|------|---------|
| R5–R18-P2-1 | `supersededIndex` identity/continuity 未验证 | CR TODO / 非阻塞 | 同意继续 defer；本轮 Fixer禁止保留 ordinal或扩展 supersession algorithm。 |

## Finding #1 Evaluation（发现 #1 评估）

### Review Original（审查原文）

> **[高][新] Document-root tag property绕过Option A与invalid-opening fail-close**
> - 来源：auditor + reviewer-probe
> - 分类：patch

### Evaluation Conclusion（评估结论）：✅ 确认有效 — 需要修复（P1 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性：准确**

`trackerHasExactTerminalState()`将 sprint/workflow tracker交给 `trackerLinesOutsideYamlBlockScalars()`后，直接在返回的 visible lines中执行 exact owner matching（`resolve-cr-directory.mjs:680-690`）。current rejected-property helper只从 explicit value、sequence value与mapping value提取 `remainder`（`:920-926`）；document-root `!h!suffix ...`、`!! ...`等行得到空 `remainder`并返回 `false`（`:927-937`）。quoted、flow、block及property-only helpers也只定义上述三种container入口（`:1026-1047,1057-1066,1175-1204`），没有 document-root等价入口。

因此，document-root tagged multiline scalar的首行会先进入 `visible`（`:1021`），却不建立 quoted/flow/block/pending或rejected状态；其正文内唯一形似 owner 的行可进入 exact matcher。declared named handle即使由 YAML parser判定合法，也必须按已批准 Option A fail-close；undeclared named handle与 empty-suffix tag则同时违反 parser-valid evidence要求。两类都属于 production真实性缺陷。

**严重性判断：合理**

该缺陷允许unsupported或invalid document-root node中的伪 terminal认证 completed legacy，进而错误开启 canonical continuation；它直接破坏 AC9 的 tracker authenticity与 AC11 的回归闭环，维持 P1并阻塞交付合理。

**修复建议：可行，且必须保持受界**

只允许为现有 scanner增加 document-root property/node入口及其 ambiguous/fail-close语义，并复用已冻结 bounded vocabulary；不得读取或绑定 `%TAG`，不得引入通用 YAML parser/schema resolver，也不得增加任何新的 accepted tag token shape。

**误报评估：非误报**

入口正则、visible-first控制流、Option A裁决与 Reviewer authentic replay相互印证，证据链闭合。

### Independent RED→GREEN Criteria（独立 RED→GREEN 准则）

**RED（production修改前必须单独新增并稳定失败）**

1. 对 sprint/workflow两种 role，覆盖 document-root declared/undeclared `!h!suffix`、`!!`与 `!h!` empty-suffix；分别包含 quoted、flow、block、property-only/pending node。
2. 每个 fixture区分“scalar内伪 owner-only”与“scalar外追加唯一真实 owner”；unsupported/invalid token在两种情况下均须 fail-close，且完整 filesystem snapshot保持不变。
3. declared named handle必须由 current YAML parser证明 zero-error；undeclared named handle必须精确包含 `TAG_RESOLVE_FAILED`；empty-suffix必须证明至少一个 parser error。
4. 独立 positive controls覆盖 document-root bare `!`、`!local`、`!!str`与完整 non-empty `!<...>`：scalar内伪 owner不能认证，scalar外唯一真实 owner仍可 canonical recovery，且 zero-write。

**GREEN（Finding #1单独关闭条件）**

1. 所有冻结的 document-root unsupported/invalid property node均返回 `legacy-current-series-evidence-invalid`，不再暴露 scalar正文伪 owner。
2. 四类既有合法 control语义不变；不得以拒绝全部 document-root tag来取得 GREEN。
3. 不读取 `%TAG` directive、不扩大 tag vocabulary、不新增 runtime dependency。
4. Finding #1定向测试可独立运行并由 RED变为 GREEN，不依赖 Finding #2或 #3测试名命中。

## Finding #2 Evaluation（发现 #2 评估）

### Review Original（审查原文）

> **[高][新] Rejected/invalid state只跳过后续行，已收集terminal仍可通过**
> - 来源：blind + reviewer-probe
> - 分类：patch

### Evaluation Conclusion（评估结论）：✅ 确认有效 — 需要修复（P1 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性：准确**

scanner在处理普通物理行时先执行 `visible.push(line)`（`resolve-cr-directory.mjs:1021`），随后才检测 rejected outer property并设置 `ambiguousPendingProperty`（`:1022-1025`）。一旦进入 `ambiguousExplicitKey`、`ambiguousPlainScalar`或`ambiguousPendingProperty`，循环只对后续行执行 `continue`（`:978`）；quoted与flow状态同样仅跳过后续行（`:954-968`）。函数最终无条件返回此前累积的 `visible`（`:1053-1054`），不会返回 validity，也不会因 EOF时 quoted/flow仍未闭合而使整份 tracker invalid。

所以当 exact owner先进入 `visible` 后，后续 named handle、rejected property或unterminated quoted/flow只会阻断更晚行，无法撤销已收集 terminal。current focused tests中 malformed/named-handle fixtures均把 invalid construct置于 owner之前（`test/code-review-contract.test.ts:2657-2680,2739-2758`），不能覆盖反向顺序。

**严重性判断：合理**

同一unsupported/invalid construct仅因 physical line顺序变化就改变 authenticity结论，违反 whole-file fail-close与zero-guess continuation要求。它能使 invalid tracker错误认证 completed legacy，故为 P1。

**修复建议：可行，必须表达 whole-file validity**

让 bounded scanner返回 visible lines之外的显式 validity/ambiguous终态，或采用等价的局部机制使任一 rejected、ambiguous、mismatched或 EOF未闭合状态令整份 tracker不可认证。不得仅清除“后续”lines，也不得把 parser扩张到本 scanner之外。

**误报评估：非误报**

控制流清楚显示该状态是单向抑制而非 whole-file validity；Reviewer的 owner-first replay与代码路径一致。

### Independent RED→GREEN Criteria（独立 RED→GREEN 准则）

**RED（production修改前必须单独新增并稳定失败）**

1. 对 sprint/workflow两种 role，先放置唯一 exact owner，再放置 unsupported/invalid construct；覆盖 outer与inner named handle、outer rejected property、EOF unterminated quoted scalar及 EOF unterminated flow collection。
2. named handle包含 declared/undeclared pair，并继续服从 Option A；quoted/flow EOF fixture由 current YAML parser证明 error。
3. 每个 fixture当前必须稳定重现错误 `ok:true / compatibilityMode:"canonical"`，并断言 before/after完整 filesystem snapshot一致。
4. 增加反向顺序配对，证明修复后的结果与 physical line顺序无关。

**GREEN（Finding #2单独关闭条件）**

1. 任一受界 rejected/ambiguous/unterminated状态使 whole tracker返回 `legacy-current-series-evidence-invalid`，无论它位于 owner之前或之后。
2. parser-valid普通额外 mapping、完整 quoted/flow node与四类冻结合法 tag controls在 owner前后均保持既有成功语义。
3. whole-file validity不得改变 story markdown scanner、terminal cardinality、tracker binding或 write target。
4. Finding #2定向测试可独立运行并由 RED变为 GREEN；不得以 Finding #1的 root detector或 Finding #3的词法测试替代。

## Finding #3 Evaluation（发现 #3 评估）

### Review Original（审查原文）

> **[高][新] Shared bounded property lexer接受parser-invalid anchor与primary tag token**
> - 来源：blind + edge + reviewer-probe
> - 分类：patch

### Evaluation Conclusion（评估结论）：✅ 确认有效 — 需要修复（P1 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性：准确**

shared outer node property在 `resolve-cr-directory.mjs:916-918`定义。outer anchor分支 `&[^ #\\t\\r\\n]+`未排除 `,[]{}`，而 inner flow anchor分支明确排除这些delimiter（`:1126-1132`），形成同一scanner内部的不一致。primary tag分支仅排除 `!<`、whitespace与flow delimiters，仍可完整消费 quote、invalid percent escape和backslash。

本 Evaluator使用项目 current `yaml@2.9.0`独立核验：`&bad,`、`&bad[`、`&bad]`、`&bad{`、`&bad}`均报告 `MISSING_CHAR`、`BAD_SCALAR_START`或`UNEXPECTED_TOKEN`；`!bad\"x`、`!bad%ZZ`、`!bad\\x`均报告 parser error。current outer matcher却分别把这些样例消费为完整 anchor/tag property。相同核验中 bare `!`、`!local`、`!!str`与 `!<tag:yaml.org,2002:str>`均为 zero-error controls。

**严重性判断：合理**

parser-invalid property token可沿“合法 bounded property”路径保留真实-looking owner，使 completed legacy真实性被错误认可；影响与前两项相同，维持 P1合理。

**修复建议：可行，且只能收窄**

outer anchor至少应与既有 inner delimiter集合对齐；primary tag suffix应拒绝 quote、backslash及非完整 `%[0-9A-Fa-f]{2}` escape。实现只能从 current accepted set中减去invalid lexeme，不得新增 token shape、扩大现有 delimiter/character set、解释 `%TAG`或实现通用 tag URI/schema resolution。

**误报评估：非误报**

shared regex、outer/inner差异、current parser结果与 Reviewer authentic replay一致；这不是对完整 YAML支持的要求，而是对当前 bounded accepted vocabulary的fail-close收窄。

### Independent RED→GREEN Criteria（独立 RED→GREEN 准则）

**RED（production修改前必须单独新增并稳定失败）**

1. 对 sprint/workflow两种 role，在 owner之前分别覆盖 outer anchor `&bad,`、`&bad[`、`&bad]`、`&bad{`、`&bad}`，以及 outer/inner primary tag `!bad\"x`、`!bad'x`、`!bad%ZZ`、`!bad\\x`；每项均由 current YAML parser证明 error。
2. 所有 fixture必须重现 current错误认证，并断言完整 filesystem snapshot零写入。
3. 另设 owner-first integration pair，证明 Finding #2的 whole-file validity也能阻断相同invalid property，但不得以该 integration pair替代本 finding的 property-lexer独立 RED。
4. positive controls仅覆盖冻结的 bare `!`、`!local`、`!!str`、完整 non-empty `!<...>`以及不含 forbidden delimiters的现有合法 anchor；不得新增新的 tag control形态。

**GREEN（Finding #3单独关闭条件）**

1. invalid anchor/tag矩阵在 property lexer层面即被拒绝并返回 `legacy-current-series-evidence-invalid`。
2. outer与inner anchor delimiter语义一致；primary tag的 `%`只允许完整 hex escape，quote与backslash不得作为 suffix字符被接受。
3. 四类冻结合法 tag controls及现有合法 anchor继续通过；任何 tag词汇扩张均视为失败。
4. Finding #3定向测试可独立运行并由 RED变为 GREEN，不依赖 owner-first integration pair。

## Finding #4 Evaluation（发现 #4 评估）

### Review Original（审查原文）

> **[延续] `supersededIndex` identity/continuity未验证**
> - 来源：history
> - 分类：defer / CR05 TODO

### Evaluation Conclusion（评估结论）：⚠️ 有效但降级 — 建议纳入 CR TODO 跟踪（P2 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性：准确**

`classifyArtifactName()`解析并验证 `supersededIndex`是 safe positive integer，却在返回 identity时只保留 `round`（`resolve-cr-directory.mjs:380-389`），仍未验证同 family/round的 ordinal从 `1`开始、唯一且连续。

**严重性判断：合理**

该缺口影响 historical replacement timeline审计，但没有本轮新证据表明它会改变 current artifact cardinality、consumer选择、canonical/legacy continuation或 write target。维持 P2非阻塞合理。

**修复建议：可行但本轮禁止实施**

继续交由 CR05登记；本轮不得保留 ordinal、添加 continuity validation或扩展 supersession algorithm。

**误报评估：非误报**

代码差异客观存在，但不满足升级为本轮阻塞项的证据门槛。

## Overall Evaluation Conclusion（整体评估结论）

### Required Fixes（需要修复，阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | document-root tag property绕过 | [高] | **P1** | 增加受界 document-root node入口并冻结独立 root RED→GREEN；Option A不因 `%TAG` declaration改变。 |
| 2 | rejected/invalid状态不撤销既有terminal | [高] | **P1** | 让 scanner表达 whole-file validity，消除 owner前后顺序依赖及 EOF未闭合漏判。 |
| 3 | bounded property lexer接受invalid anchor/tag | [高] | **P1** | 只收窄 shared lexer并对齐 outer/inner delimiter；禁止任何 tag词汇扩张。 |

### CR TODO（建议纳入 CR TODO跟踪，非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 4 | `supersededIndex` identity/continuity未验证 | [延续] | **P2** | 维持 carried deferred；CR05登记，本轮禁止实现。 |

### Fixer Whitelist（Fixer最小白名单）

Fixer只可修改以下现有文件/区域：

1. `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs`：仅限 `trackerHasExactTerminalState()`的 YAML调用边界、`trackerLinesOutsideYamlBlockScalars()`及其紧邻的 bounded YAML property/node helpers与constants；只实现 document-root detection、whole-file invalid终态和 lexer收窄。
2. `test/code-review-contract.test.ts`：仅限三个 P1的 focused、parser-backed、authentic completed-legacy、before/after order与 zero-write regression；允许因新增测试造成的同文件机械计数/skip expectation更新，不得扩展其他功能测试。
3. `11-9-code-review-evaluation-20260907-round-18.md`：仅允许在文末 append `## Fix Summary（修复摘要）`，记录每个 finding各自的 RED、GREEN、修改位置、精确验证结果与 boundary audit；不得改写本评估正文。

除上述三项外无任何隐含白名单。若 resolver/test两个代码白名单文件不足以关闭三个 P1，Fixer必须停止并返回 fresh Owner Gate，不得修改 contract、Story、tracker、completion gate、goal records、CR rules/TODO、11.10、drawer、installed mirrors、package或 governance artifacts。

### Frozen Scope and Sequence（冻结范围与顺序）

1. 先为 Finding #1、#2、#3分别建立可单独选择执行的 RED；每项必须在 production修改前稳定失败，不能用一个聚合失败替代三个finding identity。
2. 仅修改 whitelist resolver slice；tag词汇只能收窄，named handle仍全部拒绝，不得实现 `%TAG` binding。
3. 分别执行三个独立 GREEN，再执行三项交叉 integration矩阵：document-root × whole-file validity、owner-first × invalid property lexer、positive controls × before/after order。
4. Fixer只运行三个定向测试、focused `test/code-review-contract.test.ts`、`node --check <resolver>`与 `git diff --check -- <resolver> <focused-test>`；完成后由 outer owner负责刷新 completion gate及其更广验证。
5. Fixer完成后必须对实际 diff做越界审计，并仅向本 evaluation append Fix Summary；随后依次进入 fresh Reviewer与 fresh Evaluator。latest Reviewer/Evaluator双 PASS前禁止 CR04、CR05、CR06。

### Evaluation Decision（评估决定）

- **Finding #1（document-root tag property绕过）**：确认有效，P1；授权 bounded document-root入口与 focused regression，不授权 `%TAG` binding或新 tag词汇。
- **Finding #2（owner-first whole-file fail-close缺口）**：确认有效，P1；授权显式 whole-file validity/等价局部机制与双顺序 regression。
- **Finding #3（invalid bounded property lexeme）**：确认有效，P1；授权仅收窄 shared lexer、对齐既有 outer/inner delimiter并补 parser-backed regression。
- **Finding #4（`supersededIndex` continuity）**：确认有效但维持 P2，仅作为 carried deferred CR TODO。
- **Verdict**：`FAIL / FIX_REQUIRED`。
- **Owner Gate**：`RESOLVED — OPTION_A_APPROVED`。
- **Sequence Gate**：三个独立 RED → bounded Fixer → 三个独立 GREEN + integration/focused/syntax/scoped-whitespace → outer owner刷新 completion gate → fresh Reviewer → fresh Evaluator；latest Reviewer/Evaluator双 PASS前禁止 CR04、CR05、CR06。

## Verification Summary（验证摘要）

- Review Source SHA-256独立核对为 `5d0da3b126df9cc89be47d71c9cbb6c53acf1dfeec040853416904d258d165f2`，与指定身份完全一致。
- Current resolver SHA-256=`39e90743fc6e0b45d3b9b7b36b54f8b7b83a78d9d837c7bd3e16336a27f724f8`；focused test SHA-256=`b1acd3c6ff18784c3a6d05a293dd5b41077690a05f62ae354950828f0a1ab924`。
- Current source独立证明 document-root入口缺失（`resolve-cr-directory.mjs:920-938,1021-1047,1057-1066,1175-1204`）、visible-only顺序依赖与 EOF validity缺失（`:940-1054`），以及 outer/inner anchor和primary tag词法差异（`:916-918,1126-1145`）。
- Current tests独立证明既有 outer invalid/named-handle矩阵只覆盖 invalid construct先于 owner（`test/code-review-contract.test.ts:2650-2686,2732-2764`），尚无 document-root、owner-first、invalid anchor/tag lexeme矩阵。
- 使用项目 current `yaml@2.9.0`做只读 parser probe：5个 invalid anchor与3类 invalid primary tag均返回 parser error；bare、primary、secondary、verbatim四类冻结 control均 zero-error。另用 current bounded regex probe确认 invalid anchor/tag仍被完整消费。
- 本 Evaluator未运行 build、full suite、packaging、canonical governance、affected matrix或 completion gate；未将 Reviewer的 targeted replay与历史 completion结果冒充本轮 fresh执行。

## Boundary Audit（边界审计）

- 本 Evaluator仅新增 `11-9-code-review-evaluation-20260907-round-18.md`；未修改 source、tests、fixtures、contract、Story、tracker、completion gate、goal records、CR rules/TODO或既有 CR artifacts。
- 未读取、扫描、修改或归因 Story 11.10、drawer/zip、installed mirrors或 fixed-count baselines。
- 未实现三个 P1或 carried P2，未进入 CR04、CR05或 CR06。
- 本评估继续落实用户于 `2026-09-07`批准的 Option A：named handle全部拒绝；任何 `%TAG` binding或 tag词汇扩张均不在授权范围。

## Fix Summary（修复摘要）

### 修复执行记录

- **Date**: 2026-09-07
- **Model Used**: OpenAI GPT-5.6 Sol (gpt-5.6-sol)
- **Fix Items**: 3

### Finding #1（Document-root property fail-close）

- **RED**：production 修改前独立运行 `CR18 Finding 1`，结果为 `1 failed / 81 skipped`；document-root named handle / empty-suffix property仍错误返回 `ok:true`。
- **Fix**：在既有 bounded outer property、quoted、flow、block与property-only入口内补充document-root property node识别；named handle继续无条件拒绝，不读取或绑定 `%TAG`。
- **GREEN**：独立定向测试 `1 passed / 81 skipped`。覆盖 sprint/workflow、declared/undeclared named handle、`!!`/`!h!` empty suffix、quoted/flow/block/property-only节点、伪owner-only、外部真实owner及完整filesystem snapshot零写入。
- **Positive controls**：bare `!`、primary `!local`、secondary `!!str`、完整non-empty verbatim `!<...>`均保持成功语义。由于root scalar后直接追加mapping不是合法的single-document YAML，外部真实owner使用语义等价且由 `parseAllDocuments()`证明zero-error的第二document fixture；未伪造parser结果。

### Finding #2（Whole-file validity）

- **RED**：production 修改前独立运行 `CR18 Finding 2`，结果为 `1 failed / 81 skipped`；owner-first unsupported/invalid construct仍错误返回 `ok:true`。
- **Fix**：`trackerLinesOutsideYamlBlockScalars()`在 rejected/ambiguous、未闭合quoted/flow、pending property或未完成explicit-key终态下返回不可认证结果，从而撤销先前收集的terminal evidence。
- **GREEN**：独立定向测试 `1 passed / 81 skipped`。outer/inner named handle、outer rejected property、EOF unterminated quoted/flow均在owner before/after双顺序下fail-close；普通mapping、完整quoted/flow与四类冻结tag controls保持成功，并验证零写入。

### Finding #3（Bounded property lexer narrowing）

- **RED**：production 修改前独立运行 `CR18 Finding 3`，结果为 `1 failed / 81 skipped`；invalid anchor/tag lexeme仍错误返回 `ok:true`。
- **Fix**：outer anchor排除`,[]{}`并与inner delimiter集合对齐；primary tag suffix排除quote/backslash，且 `%`仅允许完整`%[0-9A-Fa-f]{2}` escape。该修改只收窄既有accepted set，没有增加tag token shape或runtime dependency。
- **GREEN**：独立定向测试 `1 passed / 81 skipped`。invalid anchor矩阵、outer/inner primary tag矩阵、owner-first integration及冻结positive controls全部通过，完整filesystem snapshot保持不变。
- **Parser truth correction**：项目current `yaml@2.9.0`实测 `!bad'x`（outer/inner）与inner `!bad\\x`为zero-error，而非评估准则所写的parser-invalid；本测试如实将其登记为Option A下的bounded-disallowed负控。其余`,[]{}` anchor、double-quote、invalid percent及outer backslash fixture继续精确要求parser error。

### Verification（验证）

- 三项合并integration：`3 passed / 79 skipped`。
- Focused `test/code-review-contract.test.ts`：`78 passed / 4 todo`。
- Syntax：`node --check assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs`通过。
- Scoped whitespace：`git diff --check -- <resolver> <focused-test>`通过。
- Resolver SHA-256：`9b8b1b9beb1ed6ec97f5d37513356080b7d914ff77bb1e5263f760babedfdd51`。
- Focused test SHA-256：`3a9ab8ea3b19b9b1e47ae2bc9746bee0dbbd52ae86a196525e5ed16da61bf2e6`。

### Boundary Audit（边界审计）

- 本Fixer仅修改whitelist resolver slice、focused test及本evaluation的append-only Fix Summary；未改写evaluation既有正文。
- 未修改Story、tracker、completion gate、goal logs、contract、11.10、drawer、installed mirrors、package、CR rules/TODO或其他文件；未实现`supersededIndex` P2。
- 未运行broad build、full suite、packaging、canonical governance、affected matrix或completion gate；warning-only canonical hook的建议检查因明确超出本轮冻结序列而未执行。
- 未新增通用YAML parser/runtime dependency，未实现`%TAG` binding，未扩张bounded tag vocabulary。
