---
Story: 11-9
Round: 17
Date: 2026-09-05
Model Used: OpenAI GPT-5.6 Sol (gpt-5.6-sol)
Type: Code Review Summary
---

## Review Conclusion（审查结论）

本轮为 fresh 复审。Blind Hunter、Edge Case Hunter、Acceptance Auditor 三层正式结果均成功返回（`3/3`，无 timeout、empty output 或降级），三层 formal result 均为 **FAIL**。Aggregator 对三份 Round 17 正式报告做 normalization、语义去重，并只读核对 current resolver、focused regression、shared terminal-authenticity contract、Round 16 summary/evaluation/Fix Summary 与 current completion gate。

三层共提出 `6` 条 formal raw finding（`3` 条 fresh P1、`3` 条 carried P2）；语义去重后形成 `3` 条 retained finding：**2 个相邻但独立的 production P1** 与 **1 个 carried deferred P2**。duplicates merged=`3`，dismissed findings=`0`，decision-needed=`1`，**Owner Gate: REQUIRED**。总体结论为 **FAIL / OWNER_DECISION_REQUIRED**。

Round 16 的两个 P1 在其授权形态内已经关闭：合法 outer bare `!` 已进入 hidden/pending state，inner flow 中 parser-invalid empty-suffix `!!` / `!h!` 已 fail-close。Round 17 发现的是 shared bounded tag vocabulary 两端的两个新缺口：

1. **词法拒绝后的 outer fallback 不 fail-close**：当 flow collection 外的 quoted/flow/block/property-only/pending opening 使用 parser-invalid `!!` / `!h!` 时，shared matcher正确拒绝该 property token，但 outer detector匹配失败后仍把当前行留在 `visible`，也没有建立 ambiguous state；multiline scalar正文中的伪 terminal 因而重新进入 owner matcher。
2. **词法接受后的 named-handle authorization 缺失**：shared matcher完整接受 non-empty `!h!suffix`，但 resolver不读取或绑定 `%TAG !h! ...`；未声明 handle与已声明 handle走同一认证路径，前者虽被项目 current YAML parser判为 `TAG_RESOLVE_FAILED`，仍可获得 completed-legacy认证。

二者共享“bounded tag property进入 terminal-authenticity scanner时没有在所有入口形成完整 fail-close”的上位关系，但不能合并为一个 finding。Finding #1 是 **rejected token 的 outer detector fallback**，Finding #2 是 **accepted token 的 document-context authorization**；修复 #1 不会让未声明 `!h!suffix`失效，收窄或绑定 named handle也不会自动让所有 outer rejected property-like opening建立 ambiguous state。两项必须保留独立 RED→GREEN。

Finding #1 的局部修复方向明确；Finding #2 则存在两种互斥 observable contract。Round 16 一方面保留了带合法 directive context 的 `!h!suffix` positive control，另一方面禁止 directive/schema resolution，因此 Reviewer/Aggregator不能代替 Owner选择。Owner裁决后须由 fresh Evaluator冻结唯一方案、白名单、RED→GREEN与scope boundary；在此前不得启动 Fixer，也不得进入 CR04、CR05 或 CR06。

## Layer Results（三层结果）

| Layer | Execution | Formal result | Aggregated result |
| --- | --- | --- | --- |
| Blind Hunter | PASS | `FAIL` / 1 fresh P1 / 1 carried P2 | Outer invalid empty-suffix opening未fail-close，保留为 Finding #1；P2合并。 |
| Edge Case Hunter | PASS | `FAIL` / 1 fresh P1 / 1 carried P2 | Undeclared non-empty named handle与合法control同路径，保留为 Finding #2；P2合并。 |
| Acceptance Auditor | PASS | `FAIL / OWNER_DECISION_REQUIRED` / 1 fresh P1 / 1 carried P2 | Named-handle contract矛盾并入 Finding #2；Owner Gate升级为 `REQUIRED`；P2合并。 |

## Previous Round Review（上轮问题回顾）

### Closed Within Round 16 Authorized Shapes（在 Round 16 授权形态内已关闭）

1. Round 16 / Finding #1 — outer detector漏识别合法 bare `!`
   - quoted/flow/block/property-only/pending入口已接受 parser-valid bare non-specific tag；伪owner-only fail-close，追加唯一真实owner后canonical recovery，且完整filesystem snapshot保持不变。
   - 本轮Finding #1仅针对这些outer入口在 bounded matcher拒绝 **非法 property-like token** 后未进入 ambiguous状态，不重开合法 bare `!`。
2. Round 16 / Finding #2 — inner flow matcher误接受empty-suffix shorthand
   - flow collection内部 `!!`、`!h!`及同构empty-suffix shorthand已fail-close；合法 bare、primary、secondary、verbatim与带directive context的non-empty named control保持通过。
   - 本轮Finding #1位于inner scanner之前；Finding #2只指出non-empty named control缺少declaration precondition，不重开已关闭的inner empty-suffix矩阵。

### Still Non-blocking Deferred（仍为非阻塞待办）

1. Round 5–16 / `supersededIndex` identity/continuity
   - 维持 carried deferred P2 / CR05 TODO；本轮不升级、不实现，不得混入任一P1 patch。

## Production P1 Findings（实现侧 P1 发现）

### 1. [高][新] Outer matcher拒绝invalid empty-suffix opening后未fail-close，scalar伪terminal仍可认证completed legacy

- **来源**：blind
- **分类**：patch（但执行顺序受整体 Owner Gate阻断）
- **位置**：`assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs:916-918,959-983,1001-1025,1033-1042,1151-1179`；测试缺口位于`test/code-review-contract.test.ts:2612-2693`；shared terminal/recovery contract位于`assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/references/cr-contract.md:65-79,409`。

- **证据**
  - `YAML_BOUNDED_TAG_PROPERTY_SOURCE`正确地不能完整消费empty-suffix `!!` / `!h!`；inner flow scanner会因property match失败或token delimiter不完整返回`ambiguous:true`。
  - outer quoted/flow/block/property-only/pending detectors却只把“matcher成功”作为建立hidden/pending状态的条件。普通outer路径先在`:1001`执行`visible.push(line)`；matcher失败后没有与inner scanner对等的“property-like但不属于bounded vocabulary”ambiguous fallback。
  - 因此`notes: !! "...`、`notes: !h! [...]`及property-only后续node等parser-invalid opening可把scalar物理行重新暴露给exact terminal matcher。完整 authentic recovery probe显示：没有真实root owner、只有scalar正文伪terminal时，current resolver仍可返回`ok:true / compatibilityMode:"canonical"`；调用前后全树hash一致，错误位于read-only authenticity decision而非写副作用。
  - Round 16 outer regression只覆盖parser-valid bare `!`；inner malformed regression只覆盖已进入flow collection后的empty suffix，没有outer rejected-token matrix。Fresh focused `73 passed / 4 todo`不能排除该路径。

- **独立 RED**
  1. sprint/workflow两种role中，outer `!!` / `!h!`及同构empty-suffix opening先由项目current YAML parser证明存在error，再证明current outer scanner未fail-close。
  2. 覆盖mapping/sequence/explicit-value、quoted/flow/block、same-line/cross-line property、tag-only与tag+anchor双次序；伪owner-only当前错误canonical，伪owner+真实owner路径也必须纳入candidate真实性断言。
  3. 至少一个完整 authentic completed-legacy recovery断言错误continuation与before/after filesystem snapshot完全一致。

- **独立 GREEN**
  1. 所有outer rejected property-like opening均进入ambiguous/fail-close；不得仅依赖inner flow scanner。
  2. 合法bare `!`、`!local`、`!!str`、完整non-empty verbatim与Owner方案允许的named-handle controls继续符合冻结后的预期。
  3. 既有hidden/pending state、唯一root owner、classifier/recovery与zero-write语义不变。

### 2. [高][新] Non-empty named handle未绑定`%TAG` declaration，declared/undeclared tracker走同一认证路径

- **来源**：edge + auditor
- **分类**：decision_needed
- **位置**：`assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs:916-918,1001-1023,1033-1179`；测试缺口位于`test/code-review-contract.test.ts:2650-2687`。

- **证据**
  - shared matcher的named-handle分支完整接受`!h!suffix`；outer detectors与`scanYamlFlowCollectionLine()`复用该matcher后建立hidden/flow状态。
  - resolver没有读取、登记或验证`%TAG` directive。移除合法control前的`%TAG !h! tag:example.com,2026:`与document start后，property token与terminal认证控制流没有变化。
  - 项目current `yaml@2.9.0`对无directive的`!h!suffix`返回`TAG_RESOLVE_FAILED`，加入有效directive后才zero-error。Fresh production probe与authentic sprint/workflow recovery证明undeclared形态仍可返回`ok:true / compatibilityMode:"canonical"`且zero-write。
  - Current test只覆盖“带directive的合法named control”和“empty-suffix `!h!` malformed control”，缺少相同non-empty token在无directive时的parser-error + recovery negative fixture。

- **后果**：语法无效tracker可沿合法tracker同一路径伪造completed evidence并开启canonical new run，违反AC9、AC11及shared contract的“唯一、可解析、role-owned exact scalar”要求。
- **处置**：必须等待下方Owner Gate选择A或B；不得由Fixer猜测移除合法control或擅自新增directive grammar。

## Owner Gate（Owner门禁）

**Owner Gate：`REQUIRED`。以下方案互斥，推荐方案 A。**

### Option A — Narrow Bounded Vocabulary（收窄受界词汇，不支持named handle，推荐）

- **Contract decision**：Story 11.9 tracker-authenticity scanner明确不支持任何`!h!suffix` named-handle shorthand；无论是否存在`%TAG` declaration，一律视为scanner范围外并fail-close。保留bare `!`、primary `!local`、secondary `!!str`与完整non-empty verbatim `!<...>`。
- **推荐理由**：当前功能目标是可信地定位唯一terminal与恢复CR目录，不是提供YAML通用解析。A可在现有bounded scanner内关闭风险，不增加document directive state、跨document binding或新dependency；安全边界最小、可审计性最高。
- **Observable impact**：Round 16带directive的`!h!suffix` positive control需改为预期fail-close；任何目前依赖named handle的tracker不能用于completed-legacy认证，需改用受支持tag形态或无tag形态。该兼容性收窄必须由Owner显式批准。
- **RED**：current resolver对declared与undeclared `!h!suffix`均返回canonical；undeclared输入由current YAML parser证明error，同时outer invalid empty-suffix仍可能泄露伪terminal。
- **GREEN**：declared/undeclared named handle在outer/inner、same/cross-line、tag-only/tag+anchor、sprint/workflow矩阵中均稳定fail-close且zero-write；Finding #1的outer invalid openings也独立fail-close；其余bounded controls保持通过。
- **无需实现**：`%TAG` directive扫描、handle-to-prefix binding、tag URI验证、multi-document directive scope、schema resolution或通用YAML parser。

### Option B — Minimal `%TAG` Binding Authentication（授权最小`%TAG`绑定认证）

- **Contract decision**：继续支持non-empty `!h!suffix`，但仅在同一YAML document的受界directive prelude中存在唯一、合法、与该handle精确匹配的`%TAG !h! <prefix>` binding时接受；缺失、未知、冲突、重复、位置非法或document scope不明确均fail-close。
- **Observable impact**：保留Round 16带directive named-handle positive control，但新增document-level state与更大的negative matrix；resolver/test白名单是否足够、directive位置/document-start规则、duplicate与multi-document policy必须由fresh Evaluator在Fixer前精确冻结。
- **RED**：相同`!h!suffix` token在declared与undeclared输入中当前走同一路径并均可canonical；parser仅对undeclared输入返回`TAG_RESOLVE_FAILED`。outer invalid empty-suffix另以独立RED复现。
- **GREEN**：唯一有效binding的named handle在冻结矩阵中保持canonical；undeclared、unknown、duplicate/conflicting、misplaced、malformed及ambiguous multi-document形态全部fail-close并zero-write；Finding #1的outer invalid openings独立关闭。
- **仍无需实现**：完整YAML AST parser、schema/tag resolution、tag prefix可达性检查、tag URI语义解析、任意directive支持、新runtime dependency或第二terminal authority。只允许认证当前document中受界`%TAG` declaration与实际named handle的精确绑定。

### Recommendation（建议）

推荐 **Option A**。它与“bounded scanner只为terminal authenticity服务”的既有设计更一致，并能在不引入document-level YAML语义的前提下保持fail-closed。只有Owner确认真实tracker必须兼容named handle，且愿意承担更宽的directive/document-scope测试与维护面时，才选择Option B。

## P2 Finding（P2发现）

### 3. [中][延续] `supersededIndex` identity/continuity未验证

- **来源**：blind + edge + auditor
- **分类**：defer / CR05 TODO
- **位置**：`assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs:266,292-332,380-389`；shared contract：`assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/references/cr-contract.md:113-120`。
- **去重**：三层均为Round 5–16同一carried finding，合并为一项；无新证据改变严重性。
- **影响**：historical replacement ordinal可能缺号或重复，但不改变current artifact cardinality、consumer选择、canonical/legacy continuation或runtime write target。
- **Disposition**：维持carried deferred P2，后续由CR05登记；本轮不得实现，也不得扩展same-round producer retry/supersession algorithm。

## Acceptance Criteria Impact（验收标准影响）

| AC | Result | Blocking findings |
| --- | --- | --- |
| AC1–AC8 | **PASS at reviewed boundary** | Numeric root、single propagation、artifact/goal-record ownership与no-migration未被本轮反例推翻。 |
| AC9 | **FAIL** | Outer invalid opening可泄露伪terminal；undeclared named handle可与合法tracker同路径获得completed认证。 |
| AC10 | **PASS at reviewed boundary** | Active title-bearing scan、frozen classified ledger与filename classifier白名单未变化。 |
| AC11 | **FAIL / DECISION_NEEDED** | 缺少outer invalid-opening negative matrix及undeclared non-empty named-handle negative matrix；named policy尚未冻结。 |
| AC12 | **PASS at reviewed boundary** | Basename、round、approval与classifier白名单未改变；后续patch必须保持受界。 |

## Verification Summary（验证摘要）

- 三层报告共同记录fresh focused：`npx vitest run test/code-review-contract.test.ts --reporter=dot` → `1 file passed / 73 passed / 4 todo`；Aggregator未重复运行。
- 三层报告共同记录resolver syntax与scoped whitespace通过；Aggregator未运行build、full suite、packaging或canonical governance。
- Round 16两项directed RED→GREEN、source/fresh-installed `.agents` / `.claude` bytes/mode/CLI parity、active negative scan/frozen ledger与completion-gate freshness均通过；本轮不重开这些已关闭证据。
- Fresh production/parser evidence：outer invalid empty-suffix opening可错误canonical；undeclared`!h!suffix`为`TAG_RESOLVE_FAILED`但current matcher与authentic recovery仍接受；两类反例均保持filesystem zero-write。
- Current evidence identity（来自三层报告）：HEAD=`ff7528d3f9ec34072bb669ee79f7569345c23d47`；resolver SHA-256=`92f1c31e571b078ea5b4f67b85ac8d5d736fc24489f712f055d83049d5fab976`；test SHA-256=`97c08a4dcc95d8e235548b46071e399cc998d31bff5713dc7cf8f30156ff66a0`；completion gate SHA-256=`afeda4e8bc013aa1f4ce7c978403a3ac6fdb0cc7a83ba0fe0dc0a7dac62be607`。

## Final Verdict（最终裁决）

- **结论**：`FAIL / OWNER_DECISION_REQUIRED`
- **阻塞项**：2个fresh production P1；其中Finding #2为`decision_needed`
- **非阻塞项**：1个carried deferred P2（`supersededIndex`，CR05 TODO）
- **Round 16闭环**：2个原production P1均在授权形态内关闭
- **驳回项**：无
- **Owner Gate**：`REQUIRED`，A/B互斥；推荐A
- **Sequence Gate**：Owner选择A或B → fresh Evaluator冻结唯一方案与独立RED→GREEN → bounded Fixer → outer completion gate重生 → fresh Reviewer → fresh Evaluator；双PASS前禁止CR04/CR05/CR06。

## Boundary Audit（边界审计）

- 本Aggregator只创建本Round 17 summary文件；未修改source、tests、fixtures、contract、Story、tracker、completion gate、goal records或既有CR artifacts。
- 未运行build、full suite、packaging或canonical governance；未实现carried P2。
- 未读取、审查、修改或归因Story 11.10；未扫描或纳入drawer/zip、workspace mirrors或fixed-count baselines。

