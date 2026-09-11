---
Story: 11-9
Round: 14
Date: 2026-09-05
Model Used: OpenAI GPT-5.6 Sol (gpt-5.6-sol)
Review Source: 11-9-code-review-summary-20260905-round-14.md
Review Model: OpenAI GPT-5.6 Sol (gpt-5.6-sol)
Type: Code Review Evaluation
---

## Evaluation Summary（评估总结）

对 Story 11-9 的第 14 轮 CR 代码审查结果（复审）进行逐条独立评估。Round 14 三层正式结果均有效，Aggregator 将 `7` 条 raw finding 按 root cause 归并为 `2` 个 fresh production P1 与 `1` 个 carried deferred P2。

评估确认：

1. YAML 的 `?` explicit-key indicator、`!tag`、`&anchor`、single/double quote、sequence/mapping 以及 false-accept/false-reject 分支都由同一个 `nodeBoundary` transition 缺口造成，合并为一个 P1 是准确且必要的；不得拆分修复或扩张为通用 YAML parser。
2. HTML raw region 闭合后的 `visible → closed comment → visible → second comment` 是独立 P1。第二个 comment 正文中的 `<pre>` / `<code>` 会被误当真实 raw opening并遮蔽后续真实 `Status: done`；Round 13 已关闭的单个 later-comment handoff不覆盖该 repeated transition。
3. `supersededIndex` identity/continuity 严格维持 Round 5–13 的 carried deferred P2，由 CR05 后续登记；本轮 Fixer 不得实现。

因此本轮结论为 **FAIL / FIX_REQUIRED**。Owner Gate 为 `NONE`。Fixer 只获准修改 current resolver 与 focused test 两个文件内的 bounded scanner slice；不得修改 shared contract、Story、tracker、completion gate、11.10、drawer 或任何其他文件，也不得引入 dependency、通用 parser、tracker grammar/authority 或 recovery contract 扩张。完成 bounded Fixer、outer owner 重生 completion gate，以及 fresh Reviewer/Evaluator 双 PASS 前，不得进入 CR04、CR05 或 CR06。

## Previous Round Review（上轮问题回顾确认）

### Round 13 Finding #1 — 跨物理行第二个 YAML node property：在外层 property composition 边界内关闭

Current focused regression 已覆盖相邻第二 property，并保持 duplicate/third property fail-close（`test/code-review-contract.test.ts:2480-2513`）。本轮 Finding #1 只针对已经进入 flow collection 后，`?` / `!tag` / `&anchor` 到真实 quoted node 的 lexical boundary，不重开外层 `pendingProperty` finding。

### Round 13 Finding #2 — Flow plain scalar literal quote：在 bare plain-scalar 边界内关闭

Current scanner只在 `nodeBoundary=true` 时把 quote当 quoted-node opening（`resolve-cr-directory.mjs:1034,1051-1053`），现有 regression 已覆盖无 property 的 sequence/mapping plain scalar literal quote（`test/code-review-contract.test.ts:2515-2539`）。本轮 Finding #1 不授权把 plain scalar正文中的 literal quote、`?`、`!` 或 `&` 改成 node opening。

### Round 13 Finding #3 — Raw closure 后单个 later-comment handoff：在单次 transition 边界内关闭

Current code在 raw stack归零后把第一个 immediate/later comment交给 `scanHtmlCommentTransitions()`（`resolve-cr-directory.mjs:789-802`），现有 regression 覆盖单个 later comment 后的真实 raw reopening及 immediate consecutive comments（`test/code-review-contract.test.ts:2541-2558,2591-2621`）。本轮 Finding #2 只处理第一 comment关闭后又经 visible segment遇到第二 comment的 repeated transition。

### Round 13 Finding #4 — 非法 explicit-value fixture：关闭

Round 13 current test 已移除意外字面量 `+`，并以项目现有 YAML parser验证 property fixtures为合法结构（`test/code-review-contract.test.ts:2485-2495`）。本轮不授权调整该 fixture 或 parser assertion。

### Historical CR TODO（历史 CR TODO，非阻塞）

| # | 发现 | 状态 | 评估意见 |
|---|------|------|---------|
| R5–R14 / P2-1 | `supersededIndex` identity/continuity 未验证 ordinal 从 `1` 开始、唯一且连续 | CR TODO / 非阻塞 | 同意维持 carried deferred P2；本轮 Fixer 禁止实现或扩张 supersession algorithm。 |

## Finding #1 Evaluation（发现 #1 评估）

### Review Original（审查原文）

> **[高][新] Flow node property 未保留 quoted-node boundary，导致 tracker terminal false accept / false reject与 recovery错选**
> - 来源：blind + edge + auditor
> - 分类：patch

### Evaluation Conclusion（评估结论）：✅ 确认有效 — 需要修复（P1 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性：准确**

Production scanner只在 flow opening、`,` 与特定 `:` 后把 `nodeBoundary` 设为 `true`（`resolve-cr-directory.mjs:1031-1035,1055-1067`）。遇到 `?`、tag或anchor的首个非空字符时，通用分支会立即把该状态设为 `false`（`resolve-cr-directory.mjs:1069-1070`），因此随后的 single/double quote无法进入 quoted state（`resolve-cr-directory.mjs:1051-1053`）。quoted scalar正文中的 `]` / `}` 随后落入 collection closure逻辑（`resolve-cr-directory.mjs:1073-1078`），可导致提前闭合或 mismatch/ambiguous。

独立使用项目当前 YAML parser核对 explicit key、anchor与tag样例均为 zero-error 合法 YAML；quoted正文中的 tracker-like text仍属于单一 scalar，不能取得 terminal authority。Shared contract又明确要求 sprint/workflow terminal只能来自 block scalar外唯一、可解析、role-owned exact scalar，并要求 completed legacy恢复到canonical新run（`cr-contract.md:65,67-79,409`）。因此 false-accept unfinished legacy与false-reject completed legacy都是实际 AC9/AC11 违约，而非 parser 风格分歧。

现有 focused test仅覆盖 bare flow plain scalar literal quote（`test/code-review-contract.test.ts:2515-2539`）以及 flow collection外的跨行 property composition（`test/code-review-contract.test.ts:2480-2513`），未覆盖 flow内部 property/explicit-key 到 quoted node 的组合。Fresh focused `69 passed / 4 todo` 不能反证该 finding。

**严重性判断：合理**

该缺口会让 quoted scalar内的伪 tracker terminal通过认证，或遮蔽 comment/scalar外唯一真实 terminal，从而造成 canonical/legacy recovery 错选。它直接破坏 read-only preflight 的 terminal authenticity 与唯一恢复根选择，属于阻塞交付的 P1。

**修复建议：可行**

可在现有 `scanYamlFlowCollectionLine()` lexical state内，bounded识别 node boundary处的 `?` explicit-key indicator，以及至多一个tag与一个anchor（允许两者任一合法次序），并保持 boundary直到真实 quoted/flow/plain node开始。该局部状态修复无需引入 YAML parser或新 dependency，也无需修改 tracker grammar、authority、classifier或 recovery contract。

**误报评估：非误报**

三层独立命中且代码路径、合法 YAML control、两类 recovery后果与测试缺口相互一致。`?`、`!tag`、`&anchor` 的 observable consequence虽有 false-accept / false-reject 分叉，但状态根因相同；维持单一 finding 是正确去重。

## Finding #2 Evaluation（发现 #2 评估）

### Review Original（审查原文）

> **[高][新] Raw closure 后第二个 comment中的 raw opening被误读并遮蔽真实 Story terminal**
> - 来源：edge
> - 分类：patch

### Evaluation Conclusion（评估结论）：✅ 确认有效 — 需要修复（P1 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性：准确**

Raw stack归零后，scanner只对当次 immediate或later comment调用一次 `scanHtmlCommentTransitions()`（`resolve-cr-directory.mjs:789-802`）。该 helper仅会跳过空白并连续消费当前位置上的 comments；一旦遇到 visible text即返回（`resolve-cr-directory.mjs:813-831`）。控制流回到 raw tag loop后会直接从下一个 `<` 调用 `parseBoundedRawTag()`（`resolve-cr-directory.mjs:767-780`），不会再次判定它是否位于第二个 comment中。

因此 `raw closure → visible → closed comment → visible → second closed comment(<pre>/<code>)` 会把第二 comment正文中的raw token压入tag stack，后续真实、未缩进 `Status: done` 被视为raw body并从Story visible lines排除。现有 test覆盖的只是单个 later comment handoff与 immediate consecutive comments（`test/code-review-contract.test.ts:2541-2558,2591-2621`），没有 visible segment分隔的第二 comment。该 finding与 Round 13 closed shape边界不重叠。

**严重性判断：合理**

Comment正文错误取得 raw-state authority并遮蔽唯一真实 Story terminal，会把 authentic completed legacy判为invalid并阻止canonical restart，直接违反 AC9/AC11，属于 P1。

**修复建议：可行**

可只在 raw stack归零后的既有 bounded suffix loop中，交替消费 visible segment与完整 closed/unclosed comment transition；comment正文始终不得进入 `pre` / `code` recognizer，comment外真实opening继续维持当前 bounded行为。无需扩大 element inventory或实现通用 HTML/CommonMark parser。

**误报评估：非误报**

虽然该项只有 Edge 单层命中，但 production control flow明确存在 repeated-transition缺口，且相邻的 single-comment与consecutive-comment regression没有覆盖该分支。单来源不降低其代码证据的确定性。

## Finding #3 Evaluation（发现 #3 评估）

### Review Original（审查原文）

> **[中][既有] `supersededIndex` identity/continuity维持 carried deferred**
> - 来源：blind + edge + auditor；carried from Round 5
> - 分类：defer / CR05 TODO

### Evaluation Conclusion（评估结论）：⚠️ 有效但降级 — 建议纳入 CR TODO 跟踪（P2 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性：准确**

Classifier解析并验证 `supersededIndex` 为 safe positive integer，但返回的historical identity没有保存该ordinal（`resolve-cr-directory.mjs:380-389`）；后续只验证 `supersededBy` 指向同 family/round current，不验证同 family/round ordinal从 `1` 开始、唯一且连续（`resolve-cr-directory.mjs:292-332`）。这与 shared supersession规则中的递增要求一致（`cr-contract.md:113-120`）。

**严重性判断：合理**

缺口影响 historical replacement timeline 的唯一审计，但不改变 current artifact cardinality、latest round、consumer选择、canonical/legacy continuation或runtime write target，维持 P2 合理。

**修复建议：可行但本轮禁止**

该问题可由未来独立 CR05 TODO处理；不得与本轮两个 P1 的 bounded scanner patch混合，也不得在本轮扩张 same-round producer retry/supersession algorithm。

**误报评估：非误报**

问题存在，但属于既有非阻塞治理缺口，不是 Round 14 fresh regression。

## Authorized Fix Boundary（授权修复边界）

### Mutation White-list（改动白名单）

Fixer只允许修改以下两个文件，且仅限对应代码块：

1. `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs`
   - `scanYamlFlowCollectionLine()` 的 bounded node-property / explicit-key lexical transition。
   - `scanBoundedRawTagLine()` 与既有 comment-transition helper之间的 bounded repeated-comment handoff。
2. `test/code-review-contract.test.ts`
   - 仅增加两个 P1 的 focused RED/GREEN regression与必要negative controls；优先使用现有inline fixture/helper，不新增fixture文件。

不在白名单中的文件和区域均禁止修改。尤其禁止修改或生成：shared `cr-contract.md`、Story 11.9、任何 tracker、completion gate、CR04/CR05/CR06产物、Story 11.10、drawer目录或zip、workspace mirrors、fixed-count baselines、dependency/lockfile。

### RED Criteria（修复前必须可证伪）

1. **YAML false-accept**：对 sprint/workflow，合法 sequence/mapping flow collection在 `?`、`!tag`、`&anchor` 或一个tag+一个anchor任一合法次序后进入 single/double quoted node，quoted正文含 `]` / `}` 与伪 terminal；current resolver错误认证 unfinished legacy并选择canonical。新增测试在未修 production code时必须失败，并验证调用前后 filesystem zero-write。
2. **YAML false-reject**：同一 bounded property/explicit-key matrix中，quoted node闭合后存在唯一真实 terminal；current resolver错误返回 `legacy-current-series-evidence-invalid`。新增测试在未修 production code时必须失败，并由项目现有 YAML parser断言 fixture zero-error与预期结构。
3. **HTML false-reject**：`pre→comment→visible→second comment(<code>)` 与 `code→comment→visible→second comment(<pre>)` 后存在唯一真实 `Status: done`；current resolver错误判invalid。新增测试在未修 production code时必须失败，并验证无第二raw token、仅空白分隔consecutive comments等相邻controls仍通过。

若任一 RED 只能通过修改 contract、扩大 grammar/element inventory、引入 parser/dependency或触碰白名单外文件才能构造，Fixer必须停止并返回 fresh Owner Gate，不得自行扩张范围。

### GREEN Criteria（修复后必须同时成立）

1. 上述 YAML false-accept / false-reject matrix全部按真实 terminal authority与 recovery matrix返回正确结果；sequence/mapping、explicit key、tag/anchor、single/double quote、`]`/`}`、sprint/workflow均有代表性覆盖。
2. Plain scalar正文中的 literal `?` / `!` / `&` / quote保持plain；重复/第三property、无node、不完整property、unclosed quote、mismatched closure继续fail-close；Round 13 outer property composition与bare literal-quote regression持续通过。
3. 第二comment正文中的 `<pre>` / `<code>` 不再进入raw stack；comment外真实raw opening仍按现有 inventory处理；最终closed/unclosed comment、两个comments间空白/非空visible、单comment handoff与真实visible `Status` controls全部保持正确。
4. `npx vitest run test/code-review-contract.test.ts --reporter=dot` fresh PASS；`node --check .../resolve-cr-directory.mjs` PASS；两文件 scoped `git diff --check` PASS；source/fresh-installed bytes、mode与CLI parity以及既有zero-write matrices由focused suite持续验证。
5. Fixer完成后由 outer owner重生 current Story 11.9 completion gate；重生前不得把旧 gate视为当前修复的fresh completion evidence。

## Overall Evaluation Conclusion（整体评估结论）

### Required Fixes（需要修复，阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | Flow node property未保留quoted-node boundary，造成terminal false accept / false reject与recovery错选 | 高 | **P1** | 同一 `nodeBoundary` 根因，按bounded YAML lexical-state patch与focused regression关闭。 |
| 2 | Raw closure后第二comment正文中的raw opening遮蔽真实Story terminal | 高 | **P1** | 独立 repeated-comment transition缺口，按bounded raw/comment suffix patch关闭。 |

### CR TODO（建议纳入 CR TODO 跟踪，非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 3 | `supersededIndex` identity/continuity | 中 / carried | **P2** | 维持Round 5–14 deferred策略；CR05后续登记，本轮禁止实现。 |

### Ignored Findings（可忽略，误报）

无。

### Evaluation Decision（评估决定）

- **Finding #1（YAML flow property → quoted node boundary）**：确认有效，P1；`?` / tag / anchor、quote种类、collection形态与两类 recovery后果合并为单一根因，授权两文件白名单内的 bounded patch。
- **Finding #2（HTML second-comment raw-state误判）**：确认有效，P1；与Round 13单comment handoff不同，授权同一两文件白名单内的 bounded repeated-transition patch。
- **Finding #3（`supersededIndex` continuity）**：确认存在但维持 P2 carried deferred；只进入 CR05 TODO，不进入 Fixer。
- **Owner Gate**：`NONE`。若 Fixer无法在白名单与 RED/GREEN 边界内关闭两个 P1，必须停止并返回 fresh Owner Gate。
- **Final Verdict**：`FAIL / FIX_REQUIRED`。完成 bounded Fixer、outer completion gate重生及 fresh Reviewer/Evaluator双PASS前，禁止进入 CR04、CR05 或 CR06。

## Verification Summary（验证摘要）

- Fresh focused：`npx vitest run test/code-review-contract.test.ts --reporter=dot` → `1 file passed / 69 passed / 4 todo`；该绿灯不包含本轮两个 fresh反例。
- Syntax：`node --check assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs` → PASS。
- Scoped whitespace：resolver、focused test与current completion gate的 `git diff --check` → PASS。
- 项目当前 YAML parser对本轮 explicit key、tag与anchor quoted-node代表样例均为zero-error合法结构；代码路径仍会在property token首字符处清除 `nodeBoundary`。
- Current resolver/test/completion-gate SHA-256分别为 `93a448170e418fc0120b0ee0a6ccc84a3df29a83805dc83ba23ac38dcc24d3bd`、`bd6bf9e69bceaa3eb2d9ec0d1a5f03f1da3a2a300fe4ae1ee3a11132ee611fe0`、`819cc9bc555bba636d1948fe48c3003053c08782f681625e79a0ad86f3638af2`，与Round 14 review记录一致。
- Current completion gate仅证明Round 13 mutation后的 `69 passed / 4 todo`；本轮production反例推翻其AC9/AC11语义充分性。Fixer后必须由outer owner重生，不授权Fixer修改gate。

## Boundary Audit（边界审计）

- 本Evaluator只创建本 Round 14 evaluation；未修改source、tests、fixtures、contract、Story、tracker、completion gate、goal records或既有CR artifacts。
- 未实现或升级 carried P2，未进入CR04、CR05或CR06。
- 未读取、扫描、修改或归因Story 11.10、drawer/zip、workspace mirrors或fixed-count baselines。
- 未运行build、full suite、packaging或canonical governance。

## 修复执行记录

### 修复执行记录
- **Date**: 2026-09-05
- **Model Used**: OpenAI GPT-5.6 Sol (gpt-5.6-sol)
- **Fix Items**: 2

#### Fix #1（YAML flow property → quoted node boundary）

- 在 `scanYamlFlowCollectionLine()` 内增加 bounded `?` explicit-key indicator 与至多一个 tag、一个 anchor 的 lexical state；property 后继续保持 `nodeBoundary`，直到真实 quoted、flow 或 plain node 开始。
- 重复/第三 property、property 后无 node、unclosed quote 与 mismatched closure继续 fail-close；plain scalar正文中的 literal `?`、`!`、`&` 与 quote不改变语义。
- focused regression覆盖 sprint/workflow、sequence/mapping、single/double quote、`]`/`}`、false-accept、false-reject、两种 property 次序、YAML parser zero-error与 filesystem zero-write。

#### Fix #2（HTML second-comment raw-state误判）

- 在 `scanBoundedRawTagLine()` 的 raw stack归零 suffix loop中重复识别 comment opening，并将完整 closed/unclosed comment交回既有 `scanHtmlCommentTransitions()`；comment正文不再进入 `pre` / `code` recognizer。
- focused regression覆盖 `pre→code`、`code→pre`、空白/非空 visible分隔、无第二 raw token、最终 unclosed comment、comment外真实 raw reopening与 filesystem zero-write。

#### RED / GREEN Evidence（红绿验证证据）

- RED：production code修改前，`npx vitest run test/code-review-contract.test.ts --reporter=dot` → `2 failed / 69 passed / 4 todo`；两项失败分别复现 YAML false-accept 与 HTML false-reject。
- GREEN：`npx vitest run test/code-review-contract.test.ts --reporter=dot` → `1 file passed / 71 passed / 4 todo`。
- Syntax：`node --check assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs` → PASS。
- Scoped whitespace：resolver 与 focused test 的 `git diff --check` → PASS。
- 未运行 build、full suite、packaging 或 canonical governance；未修改 Story、tracker、completion gate、shared contract、Story 11.10、drawer、CR04/CR05/CR06产物，也未实现 carried P2。
- Current completion gate尚未重生；必须由 outer owner在本次 mutation之后生成 fresh completion evidence。
