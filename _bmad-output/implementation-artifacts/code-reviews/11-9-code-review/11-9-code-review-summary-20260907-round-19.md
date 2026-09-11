---
Story: 11-9
Round: 19
Date: 2026-09-07
Model Used: OpenAI GPT-5.6 Sol (gpt-5.6-sol)
Type: Code Review Summary
---

## Review Conclusion（审查结论）

本轮为 Round 18 bounded Fixer 后的 fresh 复审。Blind Hunter、Edge Case Hunter、Acceptance Auditor 三层均由独立 fresh agent 完成，正式输出为 `3/3`，无 timeout、empty output 或降级。受 root 与本 Reviewer共用四个并发 slot的调度限制，先并行执行 Blind Hunter + Edge Case Hunter，Edge完成释放 slot后再启动 Acceptance Auditor；三层没有共享其他层输出。Blind Hunter严格只读取冻结的 `review-input.diff`，未读取 Story、history、spec或项目其他文件。

三层共返回 `18` 条 raw observations。Aggregator 对照 current source、Round 18 evaluation/Fix Summary、latest completion gate与shared contract，去重并排除通用 YAML parser/`%TAG` binding/词汇扩张、test-only真实runner扩张、Story 11.9范围外layout漂移及未复现的root quoted-scalar误报后，保留 **6 个 fresh P1**；另保留 `supersededIndex` 为 carried deferred P2。总体结论：**FAIL / FIX_REQUIRED**。

Round 18 三项修复在其明确矩阵内持续有效：document-root quoted/flow/block/property-only、owner-before/after whole-file invalidity与bounded anchor/tag lexer均通过 fresh focused复核 `3 passed / 79 skipped`。但 document-root property + plain remainder仍是同一bounded scanner的相邻 fail-open分支，因此 Round 18 Findings #1/#2 只能标记为部分关闭；Finding #3保持关闭。其余五项属于 current实现中独立的input/schema/tracker/doc contract缺口，不要求实现通用 parser或改变用户批准的 Option A。

## Layer Results（三层结果）

| Layer | Execution | Formal output | Aggregated result |
| --- | --- | --- | --- |
| Blind Hunter | PASS | 14 observations | 保留 module input、current disposition、DONE schema、Story exact key与CR04/05 output-plane问题；其余按历史裁决、范围或可复现性dismiss。 |
| Edge Case Hunter | PASS | 3 findings | `reviewSeries` coercion并入Finding #2；strict calendar timestamp并入Finding #4；root quoted scalar经production-function复核为已正确隐藏，dismiss。 |
| Acceptance Auditor | PASS | `FAIL` / 1 P1 | Document-root property + plain remainder保留为Finding #1。 |
| Aggregator targeted replay | PASS as reproduction | 5 probe groups | 复现 Findings #1-#5；Round 18三项focused持续GREEN。 |

### Layer Identity（审查层身份）

- Blind Hunter SHA-256：`a031f1be0b24b42d715e28ee5501a01b1d46e781f9fa771b56289c33a775dcf3`
- Edge Case Hunter SHA-256：`ae5203ea758e48e6f8b872bea662fadca5f51a84e9c970f2edd022adf99f7732`
- Acceptance Auditor SHA-256：`0fd03599fb39e74310fe2a98ed03063c9fe84e2dfc3ba80e6f4ccb8b5a6e53d8`
- Isolated review input SHA-256：`e55a0d200aaaab1bf964d68c53d8032c504a29c32ac0ca02edebe0f34f0ee5e1`

## Previous Round Review（上轮问题回顾）

### Partially Closed（部分关闭）

1. Round 18 / Finding #1 — Document-root property fail-close
   - **已通过部分**：named handle、empty suffix与合法 bare/primary/secondary/verbatim controls在quoted/flow/block/property-only root node矩阵内持续符合预期。
   - **未关闭部分**：合法property后直接出现plain remainder时没有建立bounded state，后续缩进伪owner仍可泄露。见本轮Finding #1。
2. Round 18 / Finding #2 — Whole-file validity
   - **已通过部分**：rejected/ambiguous、unterminated quoted/flow与pending property在owner前后双顺序下持续fail-close。
   - **未关闭部分**：property + plain remainder没有进入任何invalid/ambiguous终态，whole-file gate仍可被绕过。见本轮Finding #1。

### Closed（已关闭）

1. Round 18 / Finding #3 — Bounded property lexer narrowing
   - invalid/bounded-disallowed anchor与primary tag token持续被拒绝；bare/primary/secondary/verbatim controls持续通过。

### Still Non-blocking Deferred（仍为非阻塞待办）

1. Round 5–18 / `supersededIndex` identity/continuity
   - 维持 carried deferred P2 / CR05 TODO；本轮无新证据支持升级，不得混入P1 patch。

## New Findings（新发现）

### 1. [高][新] Document-root property 后的 plain remainder 泄露伪 terminal owner

- **来源**：auditor + reviewer-probe
- **分类**：patch

- **证据**
  - `hasRejectedOuterYamlNodeProperty()`只校验property token是否合法，消费后没有把plain remainder状态传给scanner；`plainHeader`又只覆盖sequence/mapping，不覆盖document root。位置：`assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs:920-938,1022-1051`。
  - production-function probe对sprint `!local note\n  <storyKey>: done`与workflow `&memo note\n  implementation: done`均返回terminal accepted；项目current `yaml` parser对同一bytes均返回`MULTILINE_IMPLICIT_KEY`。

- **影响**
  - parser-invalid tracker可用缩进正文伪造唯一 terminal，错误认证 completed legacy并开启canonical新run，违反AC9/AC11。

- **建议**
  - 仅在现有bounded scanner内处理document-root allowed property后的plain remainder，使其进入受界plain/ambiguous whole-file状态；新增sprint/workflow、owner前后顺序及bare/primary/secondary/verbatim/anchor controls。不得实现`%TAG` binding、通用YAML parser或扩大tag词汇。

### 2. [高][新] Module API 未对 caller-frozen input contract 统一 fail-close

- **来源**：blind + edge + reviewer-probe
- **分类**：patch

- **证据**
  - `resolveCrDirectory()`在`assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs:25-55`用`RegExp.test()`直接处理`reviewSeries`，没有先验证string；`null`、`123`、`true`及自定义object在code-review root缺失时均实际返回`ok:true`并原样进入result。
  - `trackerBindings`只在`validDoneFinalizer()`路径调用`validTrackerChangeSet()`时验证；missing/partial binding在new run、canonical-only或unfinished legacy路径不参与入口校验。shared contract明确要求module API与production CLI消费同一组caller-frozen bindings。

- **影响**
  - Module caller可冻结非法series或不完整tracker identity，结果还会随filesystem topology在success/throw/failure之间漂移；同一resolver不再提供稳定、fail-closed的identity preflight。

- **建议**
  - 在任何filesystem inspection前精确验证`reviewSeries`类型/值与完整三role `trackerBindings` schema；保持CLI现有unknown/duplicate/partial拒绝语义，并增加module/CLI parity负例。

### 3. [高][新] Current artifact 缺失 `disposition` 仍被当作current evidence

- **来源**：blind + reviewer-probe
- **分类**：patch

- **证据**
  - `validArtifactIdentity()`在`resolve-cr-directory.mjs:435-445`显式接受`frontmatter.disposition === undefined`。
  - 定向filesystem probe在唯一legacy directory写入缺失`disposition`的canonical review basename，resolver实际返回`ok:true / compatibilityMode:legacy-resume`，而非`legacy-current-series-evidence-invalid`。

- **影响**
  - 截断、旧格式或手写artifact可静默升级为current round evidence，绕过current/superseded identity与fail-close continuation contract。

- **建议**
  - Current candidate必须精确要求`disposition: current`；missing、unknown或不匹配值均进入现有stable invalid-evidence路径，并补canonical/legacy与zero-write负例。

### 4. [高][新] Authentic `DONE` 未验证完整 predecessor schema与严格日历时间

- **来源**：blind + edge + reviewer-probe
- **分类**：patch

- **证据**
  - `validDoneFinalizer()`在`resolve-cr-directory.mjs:448-503`对review/evaluation predecessor只要求identity、`storyKey`、`generatedAt`、`modelUsed`、verdict与`scopeHash`；没有验证review的scope fields、`availableLayers`/`failedLayers`、`acCoverageComplete`、`findingSetHash`/counts，也没有验证evaluation的`reviewSourceHash`、`acceptedCounts`与`convergence`。
  - Focused happy-path helper `test/code-review-contract.test.ts:3391-3425`本身就是缺少上述required字段的minimal review/evaluation，仍被`writeAuthenticCompletedRound()`用于成功路径。
  - `validTimestamp()`在`resolve-cr-directory.mjs:577-580`只做regex + `Date.parse`；production-function probe证明非闰年的`2026-02-29T12:00:00Z`与`2026-02-30T12:00:00Z`均返回true，并分别被归一化到3月1日、3月2日。

- **影响**
  - 缺失3/3 quorum、scope完整性、review/evaluation绑定或使用不存在日历日期的伪造predecessor仍可构成authentic `DONE`，使unfinished legacy错误切换到canonical新run。

- **建议**
  - 对四类predecessor执行各自required v2 schema validator，至少冻结review quorum/scope/finding counts、evaluation review binding/accepted counts/convergence；timestamp须验证真实日历日期与offset，而非接受`Date.parse`归一化。无需引入通用YAML parser。

### 5. [高][新] Story tracker允许`**Status**`冒充exact machine-owned key

- **来源**：blind + reviewer-probe
- **分类**：patch

- **证据**
  - `trackerHasExactTerminalState()`在`resolve-cr-directory.mjs:680-690`为Story key增加可选`**`前后缀。
  - production-function probe对`# state\n**Status**: done`实际返回true；shared contract要求Markdown fence外、未缩进的exact `Status` scalar。

- **影响**
  - Markdown展示文本可冒充Story terminal authority；whole-file hash真实也不能证明owner identity精确，completed legacy认证可被伪造。

- **建议**
  - Story role只接受原始`Status:`；新增bold/italic/link/code/comment/body等non-owner负例与现有plain control。若确需兼容bold key，必须先形成新的owner contract，当前不得自行扩大。

### 6. [高][新] CR04/CR05 durable output plane在public docs与help metadata中未同步

- **来源**：blind
- **分类**：patch

- **证据**
  - `docs/reference/workflow-artifact-layout.md:183-186`已声明Story-local CR04/CR05 reports与project-level `cr-rules/cr-todo-backlog.md`并存，但`:237-245`仍称CR04只输出分析建议、CR05 backlog才是稳定落盘者。
  - `assets/source/speclite/sdlc-skills/module-help.csv:48-49`中CR05 description声明双output plane，Output列却只保留`{implementation_artifacts}/code-reviews`，未表达shared backlog。

- **影响**
  - Canonical public docs与catalog对同一durable output contract给出互斥指引，消费者可能跳过CR04 current report或遗漏CR05 shared backlog，AC7的docs/help/metadata同步不成立。

- **建议**
  - 删除或更新stale `Current Differences` CR rules row，并让CR05 help metadata明确表达既有的Story-local result + project-level backlog双output事实；不得改变report basename、round或approval algorithm。

## Verification Summary（验证摘要）

- Resolver SHA-256：`9b8b1b9beb1ed6ec97f5d37513356080b7d914ff77bb1e5263f760babedfdd51`（与Round 18 Fix Summary一致）。
- Focused test SHA-256：`3a9ab8ea3b19b9b1e47ae2bc9746bee0dbbd52ae86a196525e5ed16da61bf2e6`（与Round 18 Fix Summary一致）。
- Fresh Round 18 focused slice：✅ `3 passed / 79 skipped`，命令：`npx vitest run test/code-review-contract.test.ts -t 'CR18 Finding' --reporter=dot`。
- Latest full focused suite：沿用current hash对应的Round 18 evidence `78 passed / 4 todo`；本Reviewer未重复运行全focused文件。
- Latest affected matrix：沿用completion gate current evidence `128 passed / 4 drawer fixed-count failures / 4 todo`。
- Full suite：仅引用Round 17历史快照 `746 passed / 12 drawer fixed-count failures / 4 todo`，不是本轮fresh。
- 本Reviewer未运行build、full suite、packaging、canonical governance或completion gate；也未把上述历史结果冒充本轮执行。
- 定向复现：✅ invalid `reviewSeries` 4/4均错误`ok:true`；✅ missing `disposition`错误`legacy-resume`；✅Story bold key错误accepted；✅document-root property plain remainder在parser error下错误accepted；✅impossible calendar timestamp错误accepted。

## Passed Items（通过项）

- Round 18 bounded root quoted/flow/block/property-only、whole-file owner双顺序与property lexer既有matrix持续GREEN。
- Option A保持：named handles全部拒绝；未读取或绑定`%TAG`。
- bare / primary / secondary / verbatim controls在现有冻结matrix持续有效。
- Numeric-only Story ID、single resolved `crDir` propagation、legacy no-migration、dual/multi ambiguity、goal records与title-bearing negative scan未出现新反例。
- 已知既有问题：`supersededIndex` identity/continuity维持carried deferred P2 / CR05 TODO，本轮不升级。

## Conclusion（结论）

- **结论：不通过（FAIL / FIX_REQUIRED）**
- **阻塞项**：6个fresh P1。
- **Owner Gate**：`NONE`。六项observable behavior均由current Story/shared contract或existing output事实唯一确定；不需要新增产品/Architecture裁决。
- **建议**：由fresh Evaluator逐项裁决；若确认，Fixer仅修改evaluation批准的bounded resolver/test与CR04/05 docs/help slice。禁止实现`%TAG` binding、通用YAML parser、tag vocabulary expansion、`supersededIndex` P2、真实runner新执行面或Story 11.10/drawer/governance范围。
