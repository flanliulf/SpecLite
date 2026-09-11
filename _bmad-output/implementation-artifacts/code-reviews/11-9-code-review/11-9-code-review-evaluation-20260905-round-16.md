---
Story: 11-9
Round: 16
Date: 2026-09-05
Model Used: OpenAI GPT-5.6 Sol (gpt-5.6-sol)
Review Source: 11-9-code-review-summary-20260905-round-16.md
Review Model: OpenAI GPT-5.6 Sol (gpt-5.6-sol)
Type: Code Review Evaluation
---

## Evaluation Summary（评估总结）

对 Story 11-9 的第 16 轮 CR 代码审查结果（复审）进行逐条独立评估。Round 16 三层正式结果均有效，Aggregator 将 `6` 条 raw finding 归并为 `2` 个 fresh production P1 与 `1` 个 carried deferred P2。

评估确认：

1. outer YAML value-opening、block header、property-only 与 pending-property detectors 均要求 `!` 后至少存在一个非 whitespace 字符，因而漏掉 parser-valid 的 bare non-specific tag `!`。隐藏状态未建立后，scalar 正文中的伪 terminal 会泄露到 owner matcher；追加真实 owner 时又会形成 duplicate candidate。该问题有效，维持 P1。
2. 已进入 flow collection 后，inner property matcher 为接受合法 bare `!` 而把 shorthand remainder 设为可选，因而会完整消费 parser-invalid 的 empty-suffix shorthand `!!` 与 `!h!`。malformed tracker 可被当作已完成 tracker 认证。该问题有效，维持独立 P1。
3. 两项共享同一套受界 tag token vocabulary，但 mutation entry、错误方向和所需 RED→GREEN 证据不同，必须分别关闭，不得合并为一个 finding。
4. `supersededIndex` identity/continuity 缺口继续维持 carried P2，仅交由后续 CR05 登记，不得混入本轮 Fixer。

**Verdict：`FAIL / FIX_REQUIRED`。Owner Gate：`NONE`。** 仅授权 resolver 与 focused test 两个白名单文件中的 bounded 修复；不授权通用 YAML parser、tag directive/schema resolver、contract 扩张、Story/tracker/completion gate 修改、11.10 或 drawer。

## Previous Round Review（上轮问题回顾确认）

### Round 15 合法 inner-flow bare/verbatim tag：在授权矩阵内已关闭

Current focused regression 已覆盖 flow collection 内合法 bare `!`、完整 non-empty verbatim `!<...>`、tag/anchor 次序、same/cross-line 与 quoted node 内 flow closing 字符。Round 16 Finding #1 发生在进入 inner scanner 之前的 outer detectors；Finding #2 是 inner matcher 尚未覆盖的 malformed empty-suffix control。二者均不推翻 Round 15 已关闭的合法 inner-flow矩阵，也不能被 Round 15 绿灯替代。

### Historical CR TODO（历史 CR TODO，非阻塞）

| # | 发现 | 状态 | 评估意见 |
|---|------|------|---------|
| R5–R16-P2-1 | `supersededIndex` identity/continuity 未验证 | CR TODO / 非阻塞 | 同意维持 carried deferred P2；本轮 Fixer 禁止实现。 |

## Finding #1 Evaluation（发现 #1 评估）

### Review Original（审查原文）

> **[高][新] Outer YAML detectors 漏识别合法 bare `!`，scalar 伪 terminal 可认证或遮蔽 completed legacy**
> - 来源：blind + edge
> - 分类：patch

### Evaluation Conclusion（评估结论）：✅ 确认有效 — 需要修复（P1 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性：准确**

`pendingProperty` next-node matcher 使用 `(?:([!&])[^ #\t\r\n]+[ \t]+)?`（`resolve-cr-directory.mjs:955-976`）；block scalar explicit/general header 使用 `(?:[!&][^ \t\r\n]+[ \t]+)*`（`:997-1006`）；`yamlFlowCollectionOpening()` 与 `yamlQuotedScalarOpening()` 使用同构 property pattern（`:1028-1037,1146-1155`）；`yamlPropertyOnlyOpening()` 则要求 `[!&][^ #\t\r\n]+` 并以该形式提取 property token（`:1158-1173`）。这些入口均无法表达必须以 whitespace 与 node 分隔的单字符合法 token `!`。

独立 parser/detector probe 证明 `notes: ! [value]`、`notes: ! "value"`、`notes: ! |` 与 cross-line `notes: !` 后接 quoted node 均为 zero parse errors，但四类 current detector 均不匹配。`trackerLinesOutsideYamlBlockScalars()` 会先把当前行加入 visible lines，再尝试建立 hidden/pending state（`:954-1018`）；因此 detector 漏检后，后续 scalar 正文仍进入 exact terminal candidate matcher。该 matcher要求 candidate 恰为一条，否则返回 false（`:680-690`），所以伪 owner-only 会 false accept，伪 owner + 真实 owner 会 false reject。

现有 focused tests 覆盖 non-empty shorthand、anchor、inner flow bare/verbatim tag与若干 malformed controls（`test/code-review-contract.test.ts:2276-2312,2432-2513,2542-2605`），但没有 outer bare `!` 的 quoted、flow、block、property-only/pending矩阵。Fresh focused suite仍为 `71 passed / 4 todo`，不能排除本反例。

**严重性判断：合理**

该缺陷改变 completed legacy 的真实性认证与后续 continuation：缺少真实 owner 时可能错误开启 canonical new run，存在真实 owner 时又可能错误阻断恢复。它直接违反 AC9、AC11 以及 shared contract 对唯一、可解析、role-owned exact terminal 与 read-only recovery decision 的要求（`cr-contract.md:65-79,409`），属于阻塞交付的 production P1。

**修复建议：可行，严格受界授权**

只允许修改：

- `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs` 中现有 outer value-opening、block header、property-only 与 pending-property tag detection；
- `test/code-review-contract.test.ts` 中对应 focused regression。

允许在 resolver 局部复用或集中 Shared Bounded Tag Vocabulary（共享受界 Tag 词汇），但不得引入 runtime YAML dependency、通用 parser、directive/schema resolution、第二 terminal authority或 tracker grammar扩张。现有 hidden/pending状态机、最多一个 tag + 一个 anchor、owner matcher与 recovery contract必须保持不变。

**误报评估：非误报**

Blind 与 Edge 对同一组 outer入口形成互补证据；代码中的必需非空 remainder与 YAML parser 对 bare `!` 的接受形成直接矛盾，且漏检到 candidate cardinality错判的控制流可由 current source完整追踪。

### Independent RED→GREEN Criteria（独立 RED→GREEN 准则）

**RED（Fixer 修改 production 前必须新增并稳定证明）**

1. 对 sprint/workflow 两种 role，outer bare `!` 的 parser-valid fixture 在伪 owner-only 时 current resolver错误返回 canonical continuation；在伪 owner + 唯一真实 owner时 current resolver错误返回 evidence-invalid。
2. 覆盖 mapping/sequence/explicit-value，quoted/flow/block，same-line/cross-line property，tag-only以及 tag+anchor 两种次序；每个合法 fixture先证明 parser zero errors。
3. 至少一个完整 authentic completed-legacy recovery probe 同时断言错误 continuation 与 before/after filesystem snapshot相同，证明问题是 read-only decision authenticity而非写副作用。

**GREEN（Finding #1 独立关闭条件）**

1. 同一合法矩阵中，伪 owner-only全部 fail-close；伪 owner + 唯一真实 owner全部返回 `ok:true / compatibilityMode:"canonical"`，filesystem snapshot保持相同。
2. malformed delimiter、dangling/no-node property、duplicate/third property、unclosed quote/flow、mismatched closure及无合法 block body结构继续 fail-close。
3. 该 finding的 RED→GREEN 不得依赖 Finding #2 的 invalid empty-suffix fixtures；报告必须能单独证明 outer entry已关闭。

## Finding #2 Evaluation（发现 #2 评估）

### Review Original（审查原文）

> **[高][新] Inner flow matcher 误接受空后缀 shorthand tag，语法无效 tracker 被 false-accept**
> - 来源：auditor
> - 分类：patch / Round 15 matcher 的互补 malformed 边界

### Evaluation Conclusion（评估结论）：✅ 确认有效 — 需要修复（P1 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性：准确**

`scanYamlFlowCollectionLine()` 在 node boundary 遇到 `!` 时，非 verbatim分支使用 `/^!(?:[^ \t\r\n,\[\]{}]+)?/u`（`resolve-cr-directory.mjs:1097-1104`）。可选 remainder使 `!` 合法，但也让 matcher完整消费 `!!` 与 `!h!`；随后 whitespace token-end check通过，`nodePropertyKinds`记录 tag并继续维持 node boundary（`:1104-1116`）。后续 quoted node因此进入 hidden state，tracker-level scanner没有任何分支拒绝 empty-suffix shorthand。

独立 probe 证明 current matcher对 `!!` 与 `!h!` 均为 full-token match，而项目 `yaml` parser分别返回 `TAG_RESOLVE_FAILED`。对照 control中，`!`、`!local`、`!!str`均为 zero errors；`!h!suffix` 在提供合法 `%TAG !h! ...` directive context时为 zero errors，而同一 context中的 `!h!`仍为 `TAG_RESOLVE_FAILED`。这只用于证明 fixture validity，不授权 resolver实现或解析 `%TAG` directive。

现有 malformed matrix包含 duplicate tag、`!<>`、unterminated verbatim、无 whitespace delimiter、dangling property、unclosed quote与mismatched closure（`test/code-review-contract.test.ts:2590-2605`），但不包含 `!!`、`!h!`或同构 handle-ending-`!` empty-suffix controls。

**严重性判断：合理**

语法无效的 sprint/workflow tracker仍可能通过唯一 terminal与完成证据认证，错误开启 canonical continuation。该缺陷违反 AC9、AC11及 shared contract 的“唯一、可解析 scalar”要求，属于阻塞交付的 P1，而非仅有风格或兼容性影响。

**修复建议：可行，严格受界授权**

只允许修改：

- 同一 resolver中 `scanYamlFlowCollectionLine()` 的 bounded tag-property token slice，或 resolver局部共享的同一 bounded matcher；
- `test/code-review-contract.test.ts` 中对应 focused valid/malformed controls。

修复必须区分 bare `!`、non-empty shorthand、完整 non-empty verbatim 与 empty-suffix shorthand，不得借机实现完整 YAML tag grammar、`%TAG`/schema resolver、新 dependency、contract/schema修改或 terminal authority扩张。

**误报评估：非误报**

Acceptance Auditor命中的是 Round 15 matcher中可选 remainder引入的明确 lexical over-accept。parser-invalid与 production matcher full-token accept可稳定复现，且该错误方向与 Finding #1 的合法 outer token漏检相反。

### Independent RED→GREEN Criteria（独立 RED→GREEN 准则）

**RED（Fixer 修改 production 前必须新增并稳定证明）**

1. 对 sprint/workflow 两种 role，至少覆盖 `!!`、`!h!`及一个同构 named-handle empty-suffix；每个 malformed fixture先证明 parser存在 parse error，再证明 current完整 authentic recovery错误返回 `ok:true / compatibilityMode:"canonical"`。
2. 覆盖 sequence/mapping/explicit-key，same/cross-line，tag-only与 tag+anchor 两种次序，single/double quote及 quoted正文中的 `]` / `}`；before/after filesystem snapshot必须相同。
3. 合法 control必须包含 bare `!`、`!local`、`!!str`、完整 `!<content>`及 parser-valid context中的 `!h!suffix`，防止把 over-accept修成新的 false reject。

**GREEN（Finding #2 独立关闭条件）**

1. 所有 empty-suffix shorthand malformed fixtures均 fail-close；合法 bare/shorthand/verbatim controls保持既有 canonical recovery与zero-write。
2. `!<>`、`!<content`、duplicate tag、third property、dangling property、unclosed quote/flow与mismatched closure继续 fail-close。
3. 该 finding的 RED→GREEN 不得依赖 outer opening修复；报告必须能单独证明 inner flow matcher拒绝 invalid empty suffix。

## Shared Bounded Tag Vocabulary（共享受界 Tag 词汇）

以下词汇仅服务 current tracker scanner的局部 lexical safety，不声明完整 YAML tag grammar：

| Token shape | Bounded expectation |
| --- | --- |
| `!` | 合法 bare non-specific tag；必须为完整 token，并以 whitespace与后续 node分隔。 |
| `!local` | 合法 primary-handle shorthand control；suffix非空。 |
| `!!str` | 合法 secondary-handle shorthand control；suffix非空。 |
| `!h!suffix` | named-handle与suffix均非空；作为 parser-valid control时须提供必要的既有 directive context，但 resolver不得解析 directive。 |
| `!<content>` | content非空、同一 token内闭合 `>`，内部 comma/brace不得提前截断，闭合后以 whitespace分隔 node。 |
| `!!` / `!h!` | 非法 empty-suffix shorthand，必须 fail-close。 |
| `!<>` / `!<content` | 非法 empty/unterminated verbatim，必须 fail-close。 |
| 未以 whitespace分隔 node、duplicate tag、third property、dangling property | 非法或 current scanner范围内 ambiguous，必须 fail-close。 |

共享该词汇不改变两个 finding的独立 closure要求。若 resolver/test两个白名单文件不足以同时满足合法/非法矩阵，Fixer必须停止并返回 fresh Owner Gate，不得扩张 contract、parser或 tracker authority。

## Finding #3 Evaluation（发现 #3 评估）

### Review Original（审查原文）

> **[中][延续] `supersededIndex` identity/continuity 未验证**
> - 来源：blind + edge + auditor
> - 分类：defer / CR05 TODO

### Evaluation Conclusion（评估结论）：⚠️ 有效但降级 — 建议纳入 CR TODO 跟踪（P2 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性：准确**

`classifyArtifactName()`解析并验证 filename中的 `supersededIndex` 为safe positive integer，却在返回 identity时丢弃该 ordinal（`resolve-cr-directory.mjs:372-389`）。historical validation只验证 `supersededBy` 指向同 family/round的现存 current basename（`:266,292-332`），没有验证 ordinal从 `1` 开始、唯一且连续；shared contract则明确要求 `-superseded-{n}` 的 `n` 从 `1` 递增（`cr-contract.md:113-120`）。

**严重性判断：合理**

该缺口影响 historical replacement timeline的唯一审计，但不改变 current artifact cardinality、consumer选择、canonical/legacy continuation或 runtime write target。维持 P2 非阻塞合理。

**修复建议：可行但本轮禁止实施**

继续由 CR05 登记；本轮 Fixer不得保留 ordinal、增加 continuity validation或扩张 same-round producer retry/supersession algorithm。

**误报评估：非误报**

代码与contract差异客观存在，但其影响边界不构成本轮 P1。

## Overall Evaluation Conclusion（整体评估结论）

### Required Fixes（需要修复，阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | outer detectors漏识别合法 bare `!` | [高] | **P1** | 修复现有 outer opening/property-only/pending入口，并以独立 outer RED→GREEN关闭伪 owner认证与真实 owner遮蔽。 |
| 2 | inner matcher误接受 `!!` / `!h!` empty suffix | [高] | **P1** | 修复现有 inner bounded property-token slice，并以独立 malformed RED→GREEN关闭 parser-invalid tracker false accept。 |

### CR TODO（建议纳入 CR TODO跟踪，非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 3 | `supersededIndex` identity/continuity 未验证 | [中] | **P2** | 维持 Round 5–15 carried deferred结论；CR05登记，本轮禁止实现。 |

### Evaluation Decision（评估决定）

- **Finding #1（outer bare `!`漏识别）**：确认有效，P1；授权 resolver outer detector与 focused tests的 bounded修复。
- **Finding #2（inner empty-suffix shorthand误接受）**：确认有效，独立 P1；授权 inner bounded tag-property matcher与 focused tests的 bounded修复。
- **Finding #3（`supersededIndex` continuity）**：确认有效但维持 P2，仅作为 carried deferred CR TODO。
- **Shared boundary**：两个 P1共享本文件冻结的 bounded tag vocabulary，但必须保留独立 RED→GREEN与独立 closure evidence。
- **Verdict**：`FAIL / FIX_REQUIRED`。
- **Owner Gate**：`NONE`。
- **Sequence Gate**：bounded Fixer → outer completion gate重生 → fresh Reviewer → fresh Evaluator；双 PASS前禁止进入 CR04、CR05或CR06。

## Verification Summary（验证摘要）

- Fresh focused：`npx vitest run test/code-review-contract.test.ts --reporter=dot` → `1 file passed / 71 passed / 4 todo`；现有 suite缺少本轮两个反例矩阵。
- Syntax：`node --check assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs` → exit `0`。
- Independent parser/detector probe：四类合法 outer bare `!` fixture均 zero parser errors但 detector不匹配；`!!` / `!h!`均被 inner matcher完整消费但 parser返回 `TAG_RESOLVE_FAILED`；带合法 directive context的 `!h!suffix`为 zero errors。
- Scoped `git diff --check`：resolver/test两个白名单文件通过。
- 本轮未运行 build、full suite、packaging或 canonical governance；这些不影响两个 P1的代码级可复现性，也不构成本轮授权扩张。

## Boundary Audit（边界审计）

- 本 Evaluator仅新增本 Round 16 evaluation文件；未修改 source、tests、fixtures、contract、Story、tracker、completion gate、goal records或既有 CR artifacts。
- 未实现 carried P2，未进入 CR04、CR05或CR06。
- 未读取、扫描、修改或归因 Story 11.10、drawer/zip、workspace mirrors或 fixed-count baselines。
- Fixer授权严格限于 current resolver与 `test/code-review-contract.test.ts` 两个文件中的 bounded tag-property slice；禁止通用 parser、contract扩张、11.10与 drawer。

## 修复执行记录

### 修复执行记录
- **Date**: 2026-09-05
- **Model Used**: OpenAI GPT-5.6 Sol (gpt-5.6-sol)
- **Fix Items**: 2

#### Finding #1：outer bare `!` detector

- 在 resolver 内定义并复用 Shared Bounded Tag Vocabulary，使 outer quoted/flow/block/property-only/pending-property detector 接受以 whitespace 与 node 分隔的合法 bare `!`，同时保留最多一个 tag + 一个 anchor、hidden/pending state 与唯一 owner matcher。
- focused regression 覆盖 sprint/workflow、mapping/sequence/explicit-value、quoted/flow/block、same/cross-line、tag-only 与 tag+anchor 双次序；每个 fixture 先断言 parser zero errors，再分别验证伪 owner-only fail-close、追加唯一真实 owner 后 canonical continuation，以及 filesystem snapshot 不变。
- 独立 RED：production 修改前该测试稳定失败，current resolver 将伪 owner-only错误返回 `ok:true`。
- 独立 GREEN：按测试名运行 `isolates parser-valid outer bare-tag nodes before exact terminal matching`，结果 `1 passed / 76 skipped`。

#### Finding #2：inner empty-suffix shorthand

- inner flow scanner 复用同一受界 tag token source：继续接受 bare `!`、non-empty primary/secondary/named shorthand与完整 non-empty verbatim，同时使 `!!`、`!h!`及同构 named-handle empty suffix 因 token delimiter不完整而进入 ambiguous/fail-close。
- focused regression 覆盖 sprint/workflow、sequence/mapping/explicit-key、same/cross-line、tag-only 与 tag+anchor 双次序、single/double quote及 quoted正文中的 `]` / `}`；malformed fixture 先断言 parser error，合法 bare、`!local`、`!!str`、`!<...>`与 directive context中的 `!h!suffix`均先断言 zero errors，并验证所有 recovery为 zero-write。
- 独立 RED：production 修改前该测试稳定失败，current resolver 将 malformed empty-suffix tracker错误返回 `ok:true / compatibilityMode:"canonical"`。
- 独立 GREEN：按测试名运行 `rejects parser-invalid empty-suffix shorthand tags inside flow nodes`，结果 `1 passed / 76 skipped`。

#### Verification（验证）

- `node --check assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs` → exit `0`。
- `npx vitest run test/code-review-contract.test.ts --reporter=dot` → `1 file passed / 73 passed / 4 todo`。
- scoped `git diff --check`（resolver、focused test、Round 16 evaluation）→ exit `0`。
- 未运行 build、full suite、packaging或 canonical governance；未修改 Story、tracker、completion gate、11.10、drawer、contract或 carried P2。
