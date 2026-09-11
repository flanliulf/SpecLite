---
Story: 11-9
Round: 8
Date: 2026-09-05
Model Used: OpenAI GPT-5.6 Sol (gpt-5.6-sol)
Review Source: 11-9-code-review-summary-20260905-round-8.md
Review Model: OpenAI GPT-5.6 Sol (gpt-5.6-sol)
Type: Code Review Evaluation
---

## Evaluation Summary（评估总结）

对 Story 11-9 的第 8 轮 CR 代码审查结果（复审）进行逐条独立评估。Reviewer 三层均成功返回；Aggregator 将 `8` 条 raw finding 按 authority root cause 合并为 `3` 个 fresh P1 与 `1` 个 carried deferred P2。经只读核对 current resolver、shared CR contract、focused regression、Round 7 evaluation/Fix Summary 与本轮三份 layer records，三个 P1 均确认有效：YAML explicit-key block scalar与multiline quoted scalar正文仍可进入sprint/workflow terminal候选；raw `pre`/`code`的compound opening及quoted `>` attribute仍可让正文冒充Story `Status`；合法other `reviewSeries`只要包含current series token就会被substring fallback误判为malformed current evidence。`supersededIndex` identity/continuity继续维持deferred P2，不得混入本轮patch。无误报、无decision-needed，`Owner Gate: NONE`。整体裁决为`FIX_REQUIRED`。

---

## Previous Round Review（上轮问题回顾确认）

### Round 7 三项 bounded source/test 修复：CLOSED / ADJACENT BRANCHES REMAIN

Round 7已在明确fixture shape内关闭sequence/tag/anchor/quoted-key block-scalar header、HTML comment与普通整行raw `pre`/`code` region，以及tab-indented `trackerChangeSet`；focused evidence为`50 passed / 4 todo`，outer completion gate也已在该轮source/test mutation后刷新。本轮不重开这些结论：Finding #1只处理独立`: |` / `: >-` explicit value indicator及multiline single/double quoted scalar state；Finding #2只处理同一raw tag family的compound opening与quoted delimiter；Finding #3是独立的other-series filename isolation分支，不改变已关闭的current-series malformed filename fail-close规则。

### Historical CR TODO（历史 CR TODO，非阻塞）

| # | 发现 | 状态 | 评估意见 |
|---|------|------|---------|
| R5-P2-1 | `supersededIndex` identity/continuity audit | CR TODO候选 / P2 | 维持deferred；只影响historical replacement ordinal审计，不授权混入本轮P1 patch。 |

---

## Finding #1 Evaluation（发现 #1 评估）

### Review Original（审查原文）

> **[P1] YAML explicit-key block scalar与multiline quoted scalar正文仍可冒充tracker owning key**
> - 来源：blind + edge
> - 分类：patch

### Evaluation Conclusion（评估结论）：✅ 确认有效 — 需要修复（P1 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性：准确。** `resolve-cr-directory.mjs:720-745`的`trackerLinesOutsideYamlBlockScalars()`只在当前有限header regex命中时进入block state。合法explicit mapping key的value indicator独占一行，例如`? notes\n: |\n  <key>: done`，其中`: |`既不满足sequence分支，也没有可被mapping-key分支消费的key；因此正文会进入`visible`。同一scanner也没有single/double multiline quoted-scalar state。随后`trackerHasExactTerminalState()`在`:667-677`对sprint/workflow接受空格缩进exact key，故真实owning key完全缺失时，scalar正文仍可成为唯一terminal candidate。现有regression `test/code-review-contract.test.ts:1024-1102`覆盖普通mapping、sequence、tag/anchor与quoted-key block headers，但没有覆盖explicit-key value line或multiline quoted value。shared contract `cr-contract.md:65,409`明确要求block/non-owning scalar、missing与ambiguity一律fail-close。

**严重性判断：合理。** `validTrackerChangeSet()`即使绑定真实tracker bytes与whole-file `afterHash`，仍会把同一真实文件中的非owning scalar正文提升为terminal authority。该结果可把实际未完成的legacy round认证为`DONE`并错误开启canonical new run，直接破坏AC9/AC11的terminal真实性门禁，因此为P1阻塞项。

**修复建议：可行。** 只在现有role-specific scanner内增加两个bounded state分支：其一，识别同一indentation下由explicit-key indicator引出的独立block-scalar value line，并复用现有block content-indent/chomping/indent-indicator处理；其二，当普通mapping value以single/double quote开始且未在当前物理行无歧义闭合时进入quoted-scalar region，single quote只处理YAML doubled quote，double quote只处理backslash escape，直至无歧义closing quote。scalar region内所有正文不得参与terminal candidate；closing之后的真实同级或嵌套owner必须继续可达。对无法在该有限状态内唯一判断的explicit/quoted形态应保守fail-close，不得猜测为可见owning scalar。

该授权不是通用YAML parser授权：不得展开alias/tag、引入YAML dependency、改变tracker schema、接受第二种authority，或为相邻未证明grammar扩张完整YAML语言支持。若上述有限状态无法同时保住正向controls，Fixer必须停止并返回fresh Owner Gate，而不是扩大实现面。

**误报评估：非误报。** current header regex和quote-state缺失可由代码直接确认；Blind/Edge/Aggregator的production probes对explicit-key及single/double multiline quoted samples均得到错误接受，Acceptance的`50 passed / 4 todo`未覆盖这些分支，不能驳回finding。

---

## Finding #2 Evaluation（发现 #2 评估）

### Review Original（审查原文）

> **[P1] raw `pre`/`code` compound opening与quoted `>` attribute可绕过Story Status region**
> - 来源：blind + edge
> - 分类：patch

### Evaluation Conclusion（评估结论）：✅ 确认有效 — 需要修复（P1 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性：准确。** `resolve-cr-directory.mjs:680-717`仅用`^ {0,3}<(pre|code)(?:[ \t][^>]*)?>[ \t]*$`识别raw opening。`[^>]*`会把quoted attribute内部的`>`误当tag terminator，行尾空白约束又排除`<pre><code>`这类同一行nested opening；两类opening均不会设置`rawHtmlTag`。其后独立`Status: done`行进入`visible`并在`:667-677`被认证。现有tests `test/code-review-contract.test.ts:1127-1164`只覆盖HTML comment、`<pre class="example">`与case-insensitive`<CODE>`，没有quoted delimiter或compound opening分支。shared contract `cr-contract.md:65,409`不允许raw example body成为Story status authority。

**严重性判断：合理。** Story真实`Status`可以缺失或保持non-terminal；带合法quoted attribute或compound opening的raw example body仍能配合authentic whole-file hash认证legacy `DONE`。这是与Finding #1等价的authority fail-open，直接阻塞AC9/AC11。

**修复建议：可行。** 在现有Story scanner中实现只面向`pre`/`code`的bounded、case-insensitive raw-tag state：tag name后必须是空白、`>`或合法tag boundary；扫描opening terminator时区分single/double quoted attribute并只把quote外`>`视为terminator；允许同一物理行继续出现bounded `pre`/`code` nested opening，并在raw region内跳过正文直至对应bounded closure。closed region后的真实未缩进exact `Status`必须可达；unclosed、quote未闭合、tag结构无法唯一判断时必须fail-close。不得把任意`<pre...`前缀（如`<pretext>`）误识别为tag。

该授权不得实现通用HTML/CommonMark parser、不得扩大到其他HTML元素、不得改变Markdown/Story metadata authority，也不得重开Round 7已关闭的comment或普通raw-region结论。

**误报评估：非误报。** current regex的首个`>`终止与line-end限制直接呈现两条绕过路径；Blind/Edge/Aggregator probes对quoted-`>`及`<pre><code>`均得到错误接受，现有focused fixture没有覆盖。

---

## Finding #3 Evaluation（发现 #3 评估）

### Review Original（审查原文）

> **[P1] 其他合法review series包含当前series token时被误判为malformed current evidence**
> - 来源：edge
> - 分类：patch

### Evaluation Conclusion（评估结论）：✅ 确认有效 — 需要修复（P1 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性：准确。** `classifyArtifactName()`先在`resolve-cr-directory.mjs:372-374`尝试按caller-frozen current series解析canonical identity；失败后，`:375-395`并未解析完整series槽位，而是在整个family remainder上搜索`(?:^|[-_])<currentSeries>(?:[-_]|$)`。当caller为`main`时，完整合法other series `pre-main`或`main-v2`都命中该substring token并返回`malformed-current-intent`。然而contract `cr-contract.md:54,81`允许连字符series并明确要求其他series保持`unrelated`。现有tests `test/code-review-contract.test.ts:684-723`只有不含current token的`next`正向control，无法覆盖该错分支。

**严重性判断：合理。** `inspectCandidate()`在`:268-270`遇到该分类立即返回invalid evidence。因此canonical目录只含合法`pre-main` artifact时，本应忽略并允许current `main` new run，却会被稳定阻断；若legacy目录已有合法current `main` evidence，额外合法other series也会毒化原本可resume的current run。该行为破坏caller-frozen series隔离与AC9 continuation语义，属于P1功能缺陷。

**修复建议：可行。** 在known family前缀之后先以现有canonical basename grammar做bounded structural parse，提取完整的date、`reviewSeries`槽位、round与可选superseded suffix；对schema合法且完整的other series，在与caller-frozen series作exact comparison后立即分类为`unrelated`，不得再走current-token substring fallback。只有完整series槽位精确等于caller current series、但date/round delimiter、round value、extension或superseded结构畸形时，才归入`malformed-current-intent`。不得用“包含/前缀/后缀current token”替代exact series identity。

该授权必须保留现有current-series malformed filename fail-close矩阵，不改变report basenames、round numbering、`reviewSeries` schema、producer/supersession algorithm或artifact frontmatter contract；不得顺带实现`supersededIndex` continuity。

**误报评估：非误报。** current fallback regex对`pre-main`和`main-v2`必然命中。Edge/Aggregator的完整resolver probe得到`current-series-evidence-invalid`，与contract要求的other-series isolation冲突；单层来源不降低这条机械可证结论的有效性。

---

## Finding #4 Evaluation（发现 #4 评估）

### Review Original（审查原文）

> **[P2] `supersededIndex` identity/continuity维持carried deferred**
> - 来源：blind + edge + auditor
> - 分类：defer / CR05 TODO

### Evaluation Conclusion（评估结论）：⚠️ 有效但维持 P2 — 建议纳入 CR TODO 跟踪

### Evaluation Analysis（评估分析）

**问题描述准确性：准确。** `classifyArtifactName()`在`resolve-cr-directory.mjs:380-389`解析`supersededIndex`，但返回的historical identity丢弃该值；`:266,292-332`的historical validation只验证`supersededBy`指向同family/round current basename，不验证ordinal从1开始、唯一且连续。该事实与Round 5–7 evaluation一致。

**严重性判断：合理。** 缺口降低historical replacement timeline的唯一审计性，但不改变current artifact cardinality、current consumer、canonical/legacy continuation或runtime write target，因此继续保持P2而不升级为P1。

**修复建议：可行但本轮不授权。** CR05仅登记deferred TODO。后续如获独立授权，可保存并验证ordinal identity；本轮不得扩展same-round producer retry/supersession algorithm。

**误报评估：非误报。** 本轮只冻结既有deferred disposition，不计入Fixer授权。

---

## Fixer Authorization（Fixer 授权）

### Authorized Findings（授权发现）

Fixer仅授权修复Finding #1、Finding #2与Finding #3。Finding #4保持deferred P2并交由CR05登记；不得实现`supersededIndex` audit，不得修改review-series contract或扩展CR producer/supersession algorithm。

### Allowed Files（允许文件白名单）

1. `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs`
2. `test/code-review-contract.test.ts`
3. `test/fixtures/code-review-contract/title-bearing-path-ledger.json`（仅当新增focused test行导致既有classified ledger发生机械位移时允许同步；不得扩大candidate detector、inventory或分类集合）
4. 本evaluation文件（仅允许append-only Fix Summary，不得改写评估结论）

Shared `cr-contract.md`第54、65、81、409行已冻结series exact isolation与真实role-owned terminal authority，本轮不需要修改。不得修改contract/public docs、runner/CR01–06、Story、tracker、completion gate、SPEC、Epic、root goal records、其他CR artifact、installer projection、dependencies、Story 11.10、external drawer/zip、workspace mirrors、fixed-count baselines或archive/history。若修复需要白名单外文件，必须停止并返回新的authorization/Owner Gate。

### RED Evidence（红灯证据）

Fixer必须先只增加失败断言，不修改production bytes、不放宽既有断言，再运行focused test并记录production patch前的RED：

1. 对sprint与required workflow分别使用真实tracker bytes、真实`afterHash`且真实owning key缺失，覆盖`? notes\n: |\n  <key>: done`、`? notes\n: >-\n  <key>: done`，以及single/double multiline quoted mapping value正文中的唯一`<key>: done`；每个scalar family都必须在current resolver上形成错误canonical completion的RED。
2. 为Finding #1加入正向controls：explicit block或quoted scalar无歧义结束后，真实同级owner与真实嵌套owner均可达；unclosed/ambiguous quote不得借由后续正文认证terminal。不得用拒绝全部explicit key、quoted value或nested YAML制造假绿灯。
3. 对Story分别覆盖single-quoted `>` attribute、double-quoted `>` attribute、`<pre><code>`与`<code><pre>`compound opening；每族至少覆盖closed与unclosed/ambiguous region，且唯一`Status: done`位于raw body时形成RED。另保留完整closure后真实未缩进`Status: done`的正向control，以及`<pretext>`不被误当raw tag的control。
4. 对known artifact families至少建立caller=`main`的other-series隔离矩阵：合法`pre-main`与`main-v2` canonical basenames不得被归入current malformed intent。至少同时覆盖canonical other-series-only允许new run，以及legacy已有合法current `main` evidence时附加other-series artifact仍允许原位resume；frontmatter内容不得被用来掩盖filename classifier错误。
5. 保留current series exact-slot malformed负向矩阵：非法date/round delimiter、空或非法round、错误extension、非法superseded结构仍返回既有stable invalid reason；既有普通notes、其他Story、`next` series与合法current artifact controls继续成立。
6. RED阶段不得运行build/full/packaging/canonical governance，不得扫描Story 11.10或drawer，不得实现`supersededIndex`，不得修改evaluation以外的CR artifacts。

### GREEN Criteria（绿灯标准）

1. sprint/workflow不会把explicit-key block scalar或single/double multiline quoted scalar正文当成terminal candidate；完整scalar region被排除，结束后的真实同级/嵌套owner继续可达，unclosed/ambiguous scalar fail-close。
2. Story不会把quoted-`>` attribute或compound `pre`/`code` opening后的raw body当成status authority；bounded tag-name与quote handling正确，closed region后真实exact `Status`可达，unclosed/ambiguous region fail-close。
3. 完整合法other `reviewSeries`只按完整series槽位exact comparison：`pre-main`、`main-v2`及现有`next`均保持unrelated；current `main`的malformed filename仍全部fail-close，stable reason与zero-write行为不变。
4. Round 5–7已关闭的current round `1..N` continuity、artifact/frontmatter identity、supersession binding、trackerChangeSet exact indentation/fields/order、hash/terminal authenticity、unsafe evidence、candidate detector与single-`crDir` propagation不得变化。
5. source module API、source CLI与focused fresh-installed `.agents` / `.claude` executable CLI对新增正反例保持同一结果；不得新增fallback parser、dependency、installation-only分支或第二套resolver逻辑。
6. `npx vitest run test/code-review-contract.test.ts --reporter=dot`最终全部通过且仍恰为既有`4`个`it.todo`；resolver `node --check`通过；Allowed Files `git diff --check`通过。
7. Fixer完成后仅append Fix Summary；outer Flow Gate owner必须在source/test mutation及fresh verification之后重生completion gate，随后仍需fresh Reviewer/Evaluator双PASS，方可进入CR04、CR05或CR06。

### Allowed Verification（允许验证）

- `npx vitest run test/code-review-contract.test.ts --reporter=dot`
- 仅当现有focused fresh-install链无法覆盖时，运行其明确依赖的精确install/update test文件。
- 对resolver执行`node --check`。
- 对Allowed Files执行`git diff --check`。
- 只读、临时目录内且限定Story 11.9 frozen roots的resolver probe。

不得运行`npm run build`、full suite、packaging或canonical governance。Fixer不得刷新completion gate；修复后由outer Flow Gate owner在source/test mutation及fresh verification之后重生gate。

---

## Overall Evaluation Conclusion（整体评估结论）

### Required Fixes（需要修复，阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | explicit-key block / multiline quoted scalar正文伪装tracker terminal | P1 | **P1** | 非owning YAML scalar正文可认证completed legacy。 |
| 2 | quoted-`>` / compound raw `pre`/`code` body伪装Story `Status` | P1 | **P1** | 非owning raw region可认证Story terminal。 |
| 3 | other series包含current token时被误判current malformed | P1 | **P1** | 合法独立series可阻断current continuation。 |

### CR TODO（建议纳入 CR TODO，非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 4 | `supersededIndex`未验证唯一连续 | P2 | **P2** | carried deferred；只作historical ordinal审计增强。 |

### False Positives（可忽略/误报）

无。

### Evaluation Decision（评估决定）

- **Finding #1**：确认P1；只授权existing YAML role scanner的bounded explicit-key block与multiline quote states，不授权通用YAML parser。
- **Finding #2**：确认P1；只授权Story scanner对`pre`/`code`作quote-aware、nested-opening bounded region处理，不授权通用HTML/CommonMark parser。
- **Finding #3**：确认P1；只授权完整series槽位解析与exact isolation，不授权修改`reviewSeries` contract、basename或producer/supersession algorithm。
- **Finding #4**：确认有效且维持P2；交由CR05登记，本轮Fixer不得实现。
- **Owner Gate**：`NONE`。三个P1的observable behavior已由shared CR contract与caller-frozen authority/series identity唯一约束，无需产品、Architecture或scope裁决。
- **整体裁决**：`FIX_REQUIRED`。完成bounded Fixer、outer completion gate重生及fresh Reviewer/Evaluator双PASS前，不得进入CR04、CR05或CR06。

---

## Verification And Boundary（核证与边界）

- 本Evaluator只读核对current resolver/tests、shared contract、Round 8 summary/layers与Round 7 evaluation/Fix Summary；未运行build、full suite、packaging或canonical governance。
- 被评估summary SHA-256为`2d7d3d8a0139d402372d1c8e16bc9343345133f33f4ea1523dfe242aa7a2d087`；Blind、Edge、Acceptance SHA-256分别为`bcbbab051cb5218ba03bb2b949cbf6367bcbf12fee26dba45f55c41eb3a74d83`、`ba59873e770c0b49648bbdf4b424450e53fd5f2d80c0d12a42844120cda18fd8`、`1f856adc938ee532bc36881df8dd21ca6c45add8372077dc0ec7d1ce77784e0e`，与summary记录一致。
- Current HEAD=`ff7528d3f9ec34072bb669ee79f7569345c23d47`；评估对象包含current uncommitted Story 11.9 slice。
- 未读取、修改或归因Story 11.10；未纳入external `assets/source/speclite/core-skills/speclite-drawer-er-modeler/`及zip、workspace mirrors、fixed-count baseline或既有`4 todo`。
- 本Evaluator仅创建本evaluation文件；未修改source、tests、fixtures、Story、tracker、completion gate、root goal records或既有CR artifacts。

## 修复执行记录

### 修复执行记录
- **Date**: 2026-09-05
- **Model Used**: OpenAI GPT-5.6 Sol (gpt-5.6-sol)
- **Fix Items**: 3

#### Fix #1：bounded YAML scalar terminal isolation

- 在既有role-specific scanner内增加explicit mapping key之后的独立`: |` / `: >-` value indicator识别，并复用现有block content indentation状态；scalar正文不再进入terminal candidate。
- 增加single/double multiline quoted scalar状态：single quote处理YAML doubled quote，double quote处理backslash escape；未闭合或closing tail无法唯一判断时持续fail-close。
- focused regression覆盖sprint/workflow、literal/folded explicit block、single/double multiline quote、同级/嵌套真实owner正向control及unclosed quote负向control。

#### Fix #2：bounded raw `pre` / `code` region isolation

- 用仅面向`pre`/`code`的case-insensitive bounded tag scanner替换单regex opening判断；attribute中的single/double quoted `>`不再提前终止opening。
- 以bounded stack处理同一物理行compound opening与对应closure；unclosed、quote未闭合或tag nesting无法唯一判断时fail-close，`<pretext>`保持普通可见文本。
- focused regression覆盖single/double quoted attribute、`<pre><code>`、`<code><pre>`、closed/unclosed/ambiguous region、closure后真实`Status`及`<pretext>`正向control。

#### Fix #3：other `reviewSeries` exact isolation

- 在current malformed fallback之前先按既有canonical basename grammar提取完整合法series槽位；完整other series与caller-frozen current series作exact comparison后立即归类`unrelated`。
- 将malformed fallback限制为family remainder中date槽位之后立即出现的caller current series，移除全remainder substring判断；未修改`reviewSeries` schema、producer/supersession algorithm或artifact contract。
- focused regression覆盖canonical other-series-only new run，以及legacy current `main` evidence附加`pre-main` / `main-v2`后原位resume；既有current malformed矩阵保持通过。

#### Verification（验证）

- RED（production patch前）：`npx vitest run test/code-review-contract.test.ts --reporter=dot` → `4 failed / 49 passed / 4 todo`；三个行为组均复现错误接受或错误阻断，另一个失败为新增fixture导致的机械ledger差异。
- GREEN：同一focused命令 → `53 passed / 4 todo`。
- `node --check assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs` → PASS。
- Allowed Files `git diff --check` → PASS。
- `test/fixtures/code-review-contract/title-bearing-path-ledger.json`仅同步新增focused fixture与行号位移；未扩大candidate detector、inventory root或分类集合。
- 未运行build、full suite、packaging或canonical governance；未刷新completion gate。

#### Boundary（边界）

- 仅修改evaluation授权的resolver、focused test、mechanical ledger，并在本文件末尾append本记录。
- 未修改Story、tracker、flow gate、shared contract、public docs、runner/CR01–06、Story 11.10、drawer/zip、workspace mirror或其他CR artifact。
- Finding #4 `supersededIndex` identity/continuity保持deferred P2，未实现。
