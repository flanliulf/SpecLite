---
Story: 11-9
Round: 7
Date: 2026-09-05
Model Used: OpenAI GPT-5.6 Sol (gpt-5.6-sol)
Review Source: 11-9-code-review-summary-20260905-round-7.md
Review Model: GPT-5.6
Type: Code Review Evaluation
---

## Evaluation Summary（评估总结）

对 Story 11-9 的第 7 轮 CR 代码审查结果（复审）进行逐条独立评估。Reviewer 三层均成功返回；Aggregator 将 `7` 条 raw finding 按根因合并为 `3` 个 P1 与 `1` 个 carried deferred P2。经只读核对 current resolver、shared CR contract、focused regression、Round 6 evaluation/Fix Summary 与本轮 layer records，三个 P1 均确认有效：YAML block scalar 的 sequence、tag、anchor 与 quoted-key header 未被现有有限 scanner 识别；Story HTML comment 及 raw `pre`/`code` body 未从 status authority 中排除；leading frontmatter 的 `trackerChangeSet` 仍接受 tab-indented invalid YAML。`supersededIndex` identity/continuity 继续维持 deferred P2，不得混入本轮 patch。无误报、无 decision-needed，`Owner Gate: NONE`。整体裁决为 `FIX_REQUIRED`。

---

## Previous Round Review（上轮问题回顾确认）

### Round 6 两项 bounded source/test 修复：CLOSED / NEW GRAMMAR BRANCHES

Round 6 已关闭普通 mapping `|`/`>` block scalar（含 chomping 与显式 indentation indicator）、Markdown backtick/tilde fence，以及 body-only `trackerChangeSet` placement；focused evidence 为 `49 passed / 4 todo`，outer completion gate也已在该轮修复后刷新。本轮不重开这些结论：Finding #1只针对先前未枚举的 sequence/node-property/quoted-key block-scalar header，Finding #2只针对 fence 之外的 HTML comment/raw body region，Finding #3只针对已受界 leading frontmatter 内部的 indentation lexical validity。

### Historical CR TODO（历史 CR TODO，非阻塞）

| # | 发现 | 状态 | 评估意见 |
|---|------|------|---------|
| R5-P2-1 | `supersededIndex` identity/continuity audit | CR TODO候选 / P2 | 维持 deferred；只影响 historical replacement ordinal 审计，不授权混入本轮 P1 patch。 |

---

## Finding #1 Evaluation（发现 #1 评估）

### Review Original（审查原文）

> **[P1] 合法 YAML block-scalar header 变体仍会让正文冒充 owning tracker key**
> - 来源：blind + edge
> - 分类：patch

### Evaluation Conclusion（评估结论）：✅ 确认有效 — 需要修复（P1 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性：准确。** `resolve-cr-directory.mjs:698-724` 的 `trackerLinesOutsideYamlBlockScalars()` 只在 `: ` 后直接出现 `|`/`>` 时开启 block state。其 header regex 不识别无 mapping colon 的 sequence scalar（`- |` / `- >-`），不识别 indicator 前带 `&anchor` 或 `!!tag` node property 的 mapping scalar，也不识别 key 自身合法包含 colon 的 quoted-key header。随后这些 scalar body 被加入 `visible`，而 `trackerHasExactTerminalState()` 在 `:665-675` 对 sprint/workflow 允许空格缩进 exact key，因此正文中的唯一 key 可被认证为 role-owned terminal scalar。现有 regression `test/code-review-contract.test.ts:1024-1062` 只覆盖 `notes: ${indicator}` 的普通 header，未穿过上述分支。shared contract `cr-contract.md:65,409` 已要求 block/non-scalar、missing owning key与 ambiguity 一律 fail-close。

**严重性判断：合理。** `validTrackerChangeSet()` 即使在 `resolve-cr-directory.mjs:614-622` 验证了真实 tracker bytes 与 whole-file `afterHash`，仍会把这些 bytes 内的非 owning scalar 正文提升为 terminal state。真实 sprint/workflow owning key可以完全缺失，伪证据仍可把 legacy finalizer 认证为 `DONE` 并开启 canonical new run，直接破坏 AC9/AC11 authenticity gate。

**修复建议：可行。** 在现有 role-specific有限状态 scanner 中识别或保守拒绝本轮已证明的 block-scalar header families：sequence item、tag、anchor与quoted-key mapping；一旦进入 scalar region，跳过其完整正文，并保留 scalar 结束后的真实同级/嵌套 mapping正向可达。允许使用 bounded tokenization 或 ambiguity fail-close；继续保持 exact key唯一、space indentation、exact terminal scalar与whole-file hash。不得引入通用 YAML parser、展开 aliases/tags、修改 tracker schema，或把 Story 11.10 generic inventory纳入本轮。

**范围裁剪：** Blind 报告另提到 multiline quoted value。Aggregator没有把它确立为独立 P1 family，本评估也不授权为其实现完整 quoted-scalar grammar。若 Fixer 发现本轮同一个 bounded header/state guard 无需新增 parser surface 即自然 fail-close，可在 RED 中作为额外防回归；否则必须停止并交回 fresh evaluation，不得借此扩张为完整 YAML 语言支持。

**误报评估：非误报。** current header regex 与 candidate regex 的组合直接证明 context 未开启；Blind与Edge的 production-function probes也独立命中 sequence、tag、anchor分支。

---

## Finding #2 Evaluation（发现 #2 评估）

### Review Original（审查原文）

> **[P1] Story HTML comment/raw HTML body 中的 `Status` 会被认证为真实状态**
> - 来源：blind
> - 分类：patch

### Evaluation Conclusion（评估结论）：✅ 确认有效 — 需要修复（P1 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性：准确。** `resolve-cr-directory.mjs:678-695` 的 `trackerLinesOutsideMarkdownFences()` 只维护 backtick/tilde fence state；HTML comment与raw HTML `pre`/`code` body中的行仍进入 `visible`。Story candidate在 `:667-672` 要求未缩进 exact `Status`，但 `<!--\nStatus: done\n-->`、`<pre>\nStatus: done\n</pre>` 与等价 `code` body恰好满足这一行级条件。现有 tests `test/code-review-contract.test.ts:1064-1085` 只覆盖 closed/unclosed Markdown fences，没有覆盖 HTML region。shared contract `cr-contract.md:65,409` 明确只接受真实 Story owning scalar，并拒绝 comment、block/non-scalar与missing。

**严重性判断：合理。** Story真实 `Status` 可以缺失或保持 non-terminal；只要 comment/example body含唯一 `Status: done` 且 finalizer绑定真实bytes hash，legacy `DONE`仍会通过，属于 AC9/AC11 的直接功能性 fail-open。

**修复建议：可行。** 在现有 Story scanner 中加入 bounded region state：至少排除 closed/unclosed HTML comment以及已证明的 raw `pre`/`code` body；closed region之后真实、未缩进 exact `Status`必须继续可达，unclosed region必须 fail-close。允许对 `pre`/`code` opening/closing tag做有限、保守的大小写/attribute识别或直接按 ambiguity fail-close；不得实现完整 CommonMark/HTML parser、改变 Story metadata格式，或把任意 inline HTML重新定义为第二 authority。

**误报评估：非误报。** current scanner没有任何 HTML state；Blind的只读 production-function probe已对 comment与`pre` body得到 `accepted=true`，Acceptance的现有 `49 passed / 4 todo` 未覆盖这些反例，不能驳回该 finding。

---

## Finding #3 Evaluation（发现 #3 评估）

### Review Original（审查原文）

> **[P1] `trackerChangeSet` 接受 tab-indented invalid YAML frontmatter**
> - 来源：edge
> - 分类：patch

### Evaluation Conclusion（评估结论）：✅ 确认有效 — 需要修复（P1 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性：准确。** `validTrackerChangeSet()` 已在 `resolve-cr-directory.mjs:585-589` 将 authority限定到唯一 leading frontmatter，但 capture显式允许 `^[ \t]+`，item split在 `:590` 使用 `\s*`，field parser在 `:600` 同样使用 `\s*`。因此 `\t- path`、`\t  key`及tab/space混合缩进可被提升为规范 role items。现有 schema tests `test/code-review-contract.test.ts:1087-1140` 覆盖 placement、field exact/unique/order与role order，却只使用 fixture在 `:2231-2246` 冻结的 `2`/`4` spaces合法层级，没有覆盖tab indentation。

**严重性判断：合理。** YAML indentation禁止tab；invalid frontmatter bytes却能被 resolver当成 CR06 structured mutation evidence，使shared schema与实际认证语言分裂。结合真实 tracker bytes与正确after hashes，这一 lexical fail-open可认证历史 `DONE`，因此阻塞交付。

**修复建议：可行。** 在解析前拒绝 `trackerChangeSet`受界 region内的leading indentation tab，并将item/field层级冻结为现有合法shape：`trackerChangeSet:`位于column 0，item使用exact two-space + `- `，fields使用exact four-space indentation。继续执行既有exact fields、field uniqueness/order、role order、path/key/hash/reread/terminal验证。不得拒绝字段值中与indentation无关的合法字符、重写frontmatter、引入通用 YAML parser或新schema。

**误报评估：非误报。** current regex明确接受tab indentation；Edge以真实三role tracker bytes与正确whole-file hashes完成的只读probe返回`accepted=true`。

---

## Finding #4 Evaluation（发现 #4 评估）

### Review Original（审查原文）

> **[P2] `supersededIndex` identity/continuity 维持 carried deferred**
> - 来源：blind + edge + auditor
> - 分类：deferred / CR05 TODO

### Evaluation Conclusion（评估结论）：⚠️ 有效但维持 P2 — 建议纳入 CR TODO 跟踪

### Evaluation Analysis（评估分析）

**问题描述准确性：准确。** `classifyArtifactName()` 在 `resolve-cr-directory.mjs:380-389` 解析 `supersededIndex`，但返回的 historical identity丢弃该值；`:266,292-332` 的historical validation只验证`supersededBy`同family/round current basename，不验证ordinal从1开始、唯一且连续。该事实与Round 5–6 evaluation一致。

**严重性判断：合理。** 缺口降低historical replacement timeline的唯一审计性，但不改变current artifact cardinality、current consumer、canonical/legacy continuation或runtime write target，因此保持P2而非升级P1。

**修复建议：可行但本轮不授权。** CR05仅登记deferred TODO。后续若获独立授权，可保存并验证ordinal identity；不得借此扩展same-round producer retry/supersession algorithm。

**误报评估：非误报。** 本轮只冻结既有deferred disposition，不计入Fixer授权。

---

## Fixer Authorization（Fixer 授权）

### Authorized Findings（授权发现）

Fixer仅授权修复Finding #1、Finding #2与Finding #3。Finding #4保持deferred P2并交由CR05登记；不得实现`supersededIndex` audit，不得扩展CR producer/supersession algorithm或Story 11.10 generic inventory。

### Allowed Files（允许文件白名单）

1. `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs`
2. `test/code-review-contract.test.ts`
3. `test/fixtures/code-review-contract/title-bearing-path-ledger.json`（仅当新增test fixture token/line导致既有classified ledger发生机械位移时允许同步；不得扩大candidate detector或inventory）
4. 本evaluation文件（仅允许append-only Fix Summary，不得改写评估结论）

Shared `cr-contract.md` 已在第65、409行冻结“真实role-owned scalar、comment/block/non-scalar拒绝、leading-frontmatter exact structured schema”的observable contract，本轮不需要修改。不得修改contract/public docs、runner/CR01–06 algorithm、Story、tracker、completion gate、SPEC、Epic、root goal records、其他CR artifact、installer projection、dependencies、Story 11.10、external drawer/zip、workspace mirrors、fixed-count baselines或archive/history。若修复需要白名单外文件，必须停止并返回新的authorization/Owner Gate。

### RED Evidence（红灯证据）

Fixer必须先只增加失败断言，再运行focused test并记录production patch前的RED：

1. 对sprint与required workflow，使用真实tracker bytes、真实`afterHash`且真实owning key缺失，覆盖exact key只位于以下block scalar正文：`- |`、`- >-`、`notes: &anchor |`、`notes: !!str >-`、`"notes: example": |`与`'notes: example': >-`；current resolver的错误接受必须形成RED。
2. 为Finding #1保留正向controls：上述scalar结束后的真实同级mapping与真实嵌套mapping均可达；不得用拒绝所有sequence、quoted key或嵌套YAML制造假绿灯。
3. 对Story，覆盖closed/unclosed `<!-- ... -->`、raw `<pre> ... </pre>`与`<code> ... </code>`中唯一`Status: done`的伪装；每族至少有一个closed与一个unclosed/ambiguous case形成RED。另保留comment/raw region关闭后真实未缩进`Status`的正向control。
4. 对完整三role `trackerChangeSet`，分别把item indentation、field indentation改为tab与tab/space混合；在字段、顺序、path/key/hash/value均保持正确时必须形成RED。合法exact 2/4-space schema必须继续作为正向control。
5. RED阶段不得修改production bytes、放宽断言、实现generic YAML/CommonMark parser、扫描Story 11.10或实现`supersededIndex`。

### GREEN Criteria（绿灯标准）

1. sprint/workflow不会把sequence、tag、anchor或quoted-key block scalar的正文当成terminal candidate；完整scalar正文被排除，scalar结束后的真实同级/嵌套mapping仍可达。
2. Story不会把closed/unclosed HTML comment或raw `pre`/`code` body中的文本当成status authority；region外未缩进exact `Status`仍可达，unclosed/ambiguous region fail-close。
3. `trackerChangeSet`仅接受leading frontmatter内exact space-only indentation shape；item/field indentation出现tab或混合缩进时，在hash/terminal认证前失败。
4. 三种role继续要求exact key恰一次、scalar唯一且精确等于caller-frozen terminal state；comment、duplicate、missing、non-terminal、non-scalar、hash mismatch继续fail-close。
5. Round 5–6已关闭的malformed round、round `1..N` continuity、frontmatter-only placement、item exact fields、field uniqueness/order、role order、完整unsafe evidence与candidate detector行为不得变化。
6. source module API、source CLI与focused fresh-installed executable CLI对新增正反例保持同一结果；不得新增fallback parser、dependency或installation-only差异。
7. `npx vitest run test/code-review-contract.test.ts --reporter=dot`最终PASS且仍恰为原有`4`个`it.todo`；resolver `node --check` PASS；Allowed Files `git diff --check` PASS。

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
| 1 | sequence/tag/anchor/quoted-key block scalar正文伪装tracker terminal | P1 | **P1** | 非owning YAML scalar正文可认证completed legacy。 |
| 2 | Story HTML comment/raw `pre`/`code` body伪装`Status` | P1 | **P1** | 非owning文档region可认证Story terminal。 |
| 3 | tab-indented invalid `trackerChangeSet`通过schema gate | P1 | **P1** | 非法YAML frontmatter可认证CR06 mutation evidence。 |

### CR TODO（建议纳入 CR TODO，非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 4 | `supersededIndex`未验证唯一连续 | P2 | **P2** | carried deferred；只作historical ordinal审计增强。 |

### False Positives（可忽略/误报）

无。

### Evaluation Decision（评估决定）

- **Finding #1**：确认P1；只授权existing YAML role scanner的bounded block-header/state guard，不授权通用YAML parser。
- **Finding #2**：确认P1；只授权Story scanner排除HTML comment与raw `pre`/`code` region，不授权通用CommonMark/HTML parser。
- **Finding #3**：确认P1；`trackerChangeSet`必须冻结为leading-frontmatter内space-only exact indentation schema。
- **Finding #4**：确认有效且维持P2；交由CR05登记，本轮Fixer不得实现。
- **Owner Gate**：`NONE`。三个P1的observable behavior已由shared CR contract与caller-frozen role/frontmatter authority唯一约束，无需产品、Architecture或scope裁决。
- **整体裁决**：`FIX_REQUIRED`。完成bounded Fixer、outer completion gate重生及fresh Reviewer/Evaluator双PASS前，不得进入CR04、CR05或CR06。

---

## Verification And Boundary（核证与边界）

- 本Evaluator只读核对current source/tests、Round 7 summary/layers与既有evaluation lineage；未运行build、full suite、packaging或canonical governance。
- 被评估summary SHA-256为`49d52a8aece9b0d7a38278207da8c7af1db1d6d70df8ee63c45dc0967be79ed5`；三层hash与summary记录一致。
- Current HEAD=`ff7528d3f9ec34072bb669ee79f7569345c23d47`；评估对象包含current uncommitted Story 11.9 slice。
- 未读取、修改或归因Story 11.10；未纳入external `assets/source/speclite/core-skills/speclite-drawer-er-modeler/`及zip、workspace mirrors、fixed-count baseline或既有`4 todo`。
- 本Evaluator仅创建本evaluation文件；未修改source、tests、fixtures、Story、tracker、completion gate、root goal records或既有CR artifacts。

## 修复执行记录

### 修复执行记录
- **Date**: 2026-09-05
- **Model Used**: OpenAI GPT-5.6 Sol (`gpt-5.6-sol`)
- **Fix Items**: 3

### Fix Summary（修复总结）

1. **Finding #1 — YAML block-scalar header impersonation**：在既有role-specific scanner内补充有限header识别，覆盖sequence scalar、tag、anchor及quoted-key mapping，并保持scalar结束后的真实同级/嵌套owning key可达；未引入通用YAML parser、alias/tag展开或schema变更。
2. **Finding #2 — Story HTML region impersonation**：在既有Story scanner内加入bounded HTML comment及raw `pre`/`code` region状态，closed region后真实未缩进`Status`仍可达，unclosed region保持fail-close；未实现通用CommonMark/HTML parser。
3. **Finding #3 — tab-indented `trackerChangeSet`**：将leading frontmatter内item/field解析冻结为exact `2`/`4` spaces，tab与tab/space混合缩进在tracker hash/terminal认证前失败；既有字段集合、唯一性、顺序与role顺序验证保持不变。

### RED And GREEN Evidence（红绿证据）

- **RED**：仅新增失败断言后运行 `npx vitest run test/code-review-contract.test.ts --reporter=dot`，结果为 `4 failed / 46 passed / 4 todo`；三个授权finding各自独立失败，另一个失败为新增test行导致的ledger机械漂移。
- **GREEN**：完成bounded source patch及ledger机械同步后运行同一focused命令，结果为 `50 passed / 4 todo`。
- **Syntax**：`node --check assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs` 通过。
- **Diff Check**：使用独立临时Git index对全部四个Allowed Files执行`git diff --check`，结果通过；真实Git index未变更。
- **Parity**：focused test覆盖source module API、source CLI与安装到`.agents/skills`、`.claude/skills`的fresh-installed executable CLI；新增三类反例均一致fail-close。

### Boundary Audit（边界审计）

- 修改范围仅限Evaluator白名单中的resolver、focused test、必要机械ledger及本evaluation append。
- 未修改shared contract/public docs、Story、tracker、completion gate、Story 11.10、drawer/zip、workspace mirrors、CR01–06 algorithm或其他CR artifact。
- Finding #4 `supersededIndex`保持deferred P2，未实现、未改动其identity/continuity逻辑。
- 未运行`npm run build`、full suite、packaging或canonical governance；completion gate留给outer Flow Gate owner刷新。
