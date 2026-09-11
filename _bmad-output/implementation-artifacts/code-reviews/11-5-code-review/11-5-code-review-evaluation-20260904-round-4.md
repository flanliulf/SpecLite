---
Story: 11-5
Round: 4
Date: 2026-09-04
Model Used: GPT-5.5 (gpt-5.5)
Review Source: 11-5-code-review-summary-20260904-round-4.md
Review Model: GPT-5.5 (gpt-5.5)
Type: Code Review Evaluation
---

## Evaluation Summary（评估总结）

对 Story 11-5 的第 4 轮 CR 复审结果进行独立逐项评估。Round 4 报告的 6 个运行时反例均能由 current source 解释；其中 Finding #1-#5 与既有 Owner L、portable POSIX、malformed fail-closed 或已批准的 first-definition-wins 约束直接冲突，确认是阻塞交付的 P1 patch。Finding #6 的反例也真实，但 current owning contract 同时包含“只消费所选形态”与不带 selection 限定的 broken-index block，未明确“显式选择 whole 时是否仍验证未选 index 的 shard graph”，因此不能把 Reviewer 推荐方案直接视为唯一授权修复，必须先经过窄化 Owner decision。

本轮整体结论为 **FAIL / DECISION_NEEDED**：fresh Fixer 仅获授权修复 #1-#5；#6 在 Owner 决策前不得修改。Round 4 Reviewer 与 Evaluator 尚未同时 PASS，不得进入 CR04、CR05 或 CR06。

## Previous Round Closure（上轮问题回顾确认）

### Round 3 #1 non-shard definition state：PASS（原 finding 已关闭）

Current definition table 已保留 `local-md` 与 `defined-but-ignore` 两种状态，full/collapsed/shortcut usage 可确定性区分“已定义但非 shard”与“未定义”（`src/config/artifact-document-discovery.ts:459-462,520-555`）。Round 4 #2 与 #3 分别针对 duplicate precedence 和 empty definition，不重开原 finding。

### Round 3 #2 post-decode drive-letter：PASS（原 finding 已关闭）

Current parser 已在 single decode 后再次检查 slash/backslash drive-letter（`src/config/artifact-document-discovery.ts:585-593`），对应 fixtures 覆盖 encoded colon 与 encoded backslash（`test/artifact-document-discovery.test.ts:430-458`）。Round 4 #1 指向更完整的 decode-before-classification 顺序与 decoded external/network 语义，属于相邻缺口。

### Round 3 #3 malformed inline destination：PASS（原 finding 已关闭）

Missing outer `)`、missing angle `>` 与 angle close 后的 non-whitespace tail 已进入 `malformed-link-destination`（`src/config/artifact-document-discovery.ts:500-515,568-579`；`test/artifact-document-discovery.test.ts:364-405`）。Round 4 #5 仅针对 angle body 内部首尾空白被 `trim()` 消除的另一分支。

### Round 3 #4 escaped opening bracket：PASS（原 finding 已关闭）

Outer scanner 已在接受 `[` 前应用连续反斜杠 odd/even 分类（`src/config/artifact-document-discovery.ts:490-495,597-600`），focused fixture 同时保留 image、nested、reference、dedupe 与 self-link 回归（`test/artifact-document-discovery.test.ts:483-507`）。

### Historical CR TODO（历史 CR TODO，非阻塞）

无。本轮 #1-#5 是 current Story 11-5 的交付阻塞项；#6 是同一 Story 的 P1 contract decision gate，不得降级为 CR TODO。

## Finding #1 Evaluation（发现 #1 评估）

### Review Finding（审查原文）

> **[P1] Destination 在 single decode 前提前分类，造成 drive/external/network 语义错位**
> - 来源：Blind Hunter + Edge Case Hunter + Acceptance Auditor；Aggregator 独立确认
> - 分类：patch

### Evaluation Conclusion（评估结论）：✅ 确认有效 — 需要修复（P1 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性：准确**

Current parser 在 `stripQueryAndFragment()` 与 `decodeURIComponent()` 之前先检查 raw drive、generic scheme 与 network path（`src/config/artifact-document-discovery.ts:565-587`），decode 后只重做 drive-letter 与 `.md` suffix 判断（`src/config/artifact-document-discovery.ts:591-594`）。因此 raw encoding 可改变同一 decoded destination 的分类：raw-colon + encoded separator 可被 raw generic-scheme 分支忽略，encoded scheme/network 可逃过 external/network 分类并进入 local path 流程。这与 `SPEC 09` 明确规定的 `parse -> strip query/fragment -> single percent-decode -> portable/subject containment/readability` 顺序直接冲突（`_bmad-output/planning-artifacts/specs/09-sdlc-workflow-lifecycle-contract.md:100`）。

**严重性判断：合理**

错误可导致本应 fail-closed 的 Windows drive 被忽略、本应忽略的 decoded external URL 被当作本地 shard 消费、或 decoded network path 被误报越界。它改变 `ok`、`actualConsumedPath`、`consumedPaths`、`continuation` 与 stable issue，影响 AC3、AC4、AC5、AC8、AC10，P1 合理。

**修复建议：可行且唯一**

Fixer 应先完成 raw grammar parse，再 strip query/fragment、exactly-once decode，之后在同一 post-decode classifier 中按既有语义分类：Windows drive 为 `unsupported-local`，generic external scheme 与 network path 为 `ignore`，其余 local-ish input再进入 backslash portable guard与 `.md` acceptance。不得保留会在 decode 前终止的 drive/scheme/network classification，不得 second decode，不得引入 URL fetch、完整 URL parser或泄露 raw/absolute/drive evidence。

**误报评估：非误报**

现有 encoded-drive fixtures只证明部分 post-decode guard，不能证明 decoded external/network 或 raw-colon + encoded separator 的统一顺序已实现。

## Finding #2 Evaluation（发现 #2 评估）

### Review Finding（审查原文）

> **[P1] Duplicate reference definition 在 first-definition-wins 之前验证 destination**
> - 来源：Blind Hunter + Edge Case Hunter；Aggregator 独立确认
> - 分类：patch

### Evaluation Conclusion（评估结论）：✅ 确认有效 — 需要修复（P1 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性：准确**

Definition loop 先调用 `parseMarkdownLinkDestination()` 并立即传播 malformed/unsupported-local error，之后才以 `definitions.has(label)` 决定是否写入（`src/config/artifact-document-discovery.ts:474-487`）。所以一个已经由合法首定义确定的 label，仍可被后续 duplicate 的 malformed destination 阻断。

**严重性判断：合理**

Round 3 evaluation 明确授权并要求“保持 first-definition-wins”，current focused fixture也把首定义 classification 当作可执行 contract（`11-5-code-review-evaluation-20260904-round-3.md:67-69,193-198`；`test/artifact-document-discovery.test.ts:139-179`）。后续 duplicate 改变首定义结果会把合法 sharded input错误转成 broken reference block，P1 合理。

**修复建议：可行且唯一**

Normalized label 已存在时必须在 destination parse、decode、portable classification 与任何 filesystem access 前跳过该 duplicate；只由首定义建立 `local-md` 或 `defined-but-ignore` 状态。补充“合法 local首定义 + malformed duplicate”“合法 local首定义 + unsupported-local duplicate”“ignore首定义 + local duplicate”回归，证明 duplicate不改变结果且不访问其 target。

**误报评估：非误报**

现有 fixture覆盖首 external/local分类，但未覆盖一个 malformed duplicate 在 `definitions.has()` 之前提前返回的路径。

## Finding #3 Evaluation（发现 #3 评估）

### Review Finding（审查原文）

> **[P1] 空 reference definition 被标记为 defined-but-ignore，未按 malformed 失败关闭**
> - 来源：Blind Hunter + Acceptance Auditor；Aggregator 独立确认
> - 分类：patch

### Evaluation Conclusion（评估结论）：✅ 确认有效 — 需要修复（P1 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性：准确**

Definition regex 把 destination 设为可选，随后将缺失值转换为空串传给 parser（`src/config/artifact-document-discovery.ts:474-478`）；parser 又把空串与 fragment-only 一并返回 `ignore`（`src/config/artifact-document-discovery.ts:565-566`），最终保存为 `defined-but-ignore`（`src/config/artifact-document-discovery.ts:482-485`）。因此 `[d]:` 可使 `[x][d]` 静默通过。

**严重性判断：合理**

Owner L 要求 supported reference-style grammar中的 malformed destination fail closed，并要求在 details 中记录 `referenceKind`（`_bmad-output/planning-artifacts/specs/09-sdlc-workflow-lifecycle-contract.md:100`）。空 definition 没有可分类 destination，不能与明确 fragment/external/network destination 等价；静默 `continue` 会影响 AC3、AC4、AC5、AC8、AC10，P1 合理。

**修复建议：可行且唯一**

对被 definition scanner识别、但 destination缺失或 trim 后为空的首定义返回既有 `malformed-link-destination`；保留非空 fragment-only、external scheme与network definition的 `defined-but-ignore`。Duplicate应先按 Finding #2 跳过，因此空的后续 duplicate不得覆盖或阻断合法首定义。

**误报评估：非误报**

即使把 `[d]:` 视作无效 definition而不入表，其显式 usage也应成为 `undefined-reference` block；current `defined-but-ignore` 的成功 continuation在任何一种 bounded解释下都不成立。既有 malformed fail-closed contract支持将已识别 definition的空 destination映射为 `malformed-link-destination`。

## Finding #4 Evaluation（发现 #4 评估）

### Review Finding（审查原文）

> **[P1] 普通 raw/encoded backslash destination 可依赖 POSIX 字面文件并伪造 POSIX evidence**
> - 来源：Edge Case Hunter；Aggregator 独立确认
> - 分类：patch

### Evaluation Conclusion（评估结论）：✅ 确认有效 — 需要修复（P1 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性：准确**

Decode 后 current parser 只拒绝 drive-letter form，普通含反斜杠 destination仍返回 `local-md`（`src/config/artifact-document-discovery.ts:585-594`）。在 POSIX host上，反斜杠可以成为字面 filename字符；但 evidence normalizer 会将反斜杠改写为 `/`（`src/fs/path-normalizer.ts:48-65`），使被访问对象与报告路径语义不一致。

**严重性判断：合理**

Story明确要求 project-relative POSIX 与跨平台可复核 evidence（`11-5-govern-planning-and-solutioning-documents-as-whole-and-sharded-artifacts.md:56-62`），`SPEC 09` 又要求 decode 后执行 portable校验并只持久化 project-relative POSIX path（`09-sdlc-workflow-lifecycle-contract.md:100,106`）。同一 input在 POSIX/Windows host可解析为不同对象，且 POSIX evidence可能指向不存在的 slash path，属于功能与证据完整性缺陷，P1合理。

**修复建议：可行且唯一**

在 exactly-once decode 后，把任何仍含 `\\` 的 local-ish destination映射为既有 `unsupported-local-reference` fail-closed；raw与 percent-encoded backslash必须同结果。该规则是 portable path guard，不授权 CommonMark punctuation unescape，也不得把 `dir\\chapter.md` 改写成 `dir/chapter.md` 后消费。

**误报评估：非误报**

现有 tests只覆盖 drive-letter backslash，未覆盖普通 raw/encoded backslash。Aggregator 的字面 POSIX filename复现与 current source路径一致。

## Finding #5 Evaluation（发现 #5 评估）

### Review Finding（审查原文）

> **[P1] Angle destination 内部首尾空白被 trim 后接受**
> - 来源：Edge Case Hunter；Aggregator 独立确认
> - 分类：patch

### Evaluation Conclusion（评估结论）：✅ 确认有效 — 需要修复（P1 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性：准确**

Parser 提取 `<...>` body 后再次执行 `destination.trim()`（`src/config/artifact-document-discovery.ts:568-579`），因此 `< good.md>` 与 `<good.md >` 被规范化成 `good.md`。这与 outside-angle trailing whitespace 的合法处理是两个不同边界：`>` 后至 outer `)` 之间可只含 whitespace，但 angle body本身的 leading/trailing whitespace不能被静默删除。

**严重性判断：合理**

Owner L 采用 bounded CommonMark-compatible inline destination并要求 malformed destination fail closed（`_bmad-output/planning-artifacts/specs/09-sdlc-workflow-lifecycle-contract.md:100`）。当前实现把 malformed supported form变成有效 local shard，改变消费集合与 evidence，影响 AC3、AC4、AC5、AC8、AC10，P1合理。

**修复建议：可行且唯一**

保留 angle body原值；body为空或 `body !== body.trim()` 时返回既有 `malformed-link-destination`。继续允许 `>` 与 outer `)` 之间只有 whitespace的 current fixture（`test/artifact-document-discovery.test.ts:510-525`），并保持合法 local/external/network angle destination分类。不得借此识别或支持 link title/tail grammar。

**误报评估：非误报**

Round 3只修复 missing `>` 与 close-angle 后 non-whitespace tail，不覆盖 angle body内部空白。

## Finding #6 Evaluation（发现 #6 评估）

### Review Finding（审查原文）

> **[P1] `selection=whole` 在选择分支之前解析未选 sharded index**
> - 来源：Edge Case Hunter；Aggregator 独立确认
> - 分类：patch

### Evaluation Conclusion（评估结论）：⚠️ 反例有效但裁决不唯一 — 需要 Owner decision（P1 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性：基本准确**

Current resolver在 selection branch之前解析任何 readable `index.md`，并在 shard graph失败时立即 block（`src/config/artifact-document-discovery.ts:114-156`）；显式 `selection=whole` 的 continuation直到之后才执行（`src/config/artifact-document-discovery.ts:226-258`）。Reviewer 的复现因此真实。

但是“这必然违反 current contract、且必须跳过未选 graph”并不唯一成立。AC5 / `SPEC 09` 的 explicit-selection row只明确“只消费所选 whole 或 sharded index及其声明 shards，并记录未选版本”（`11-5-govern-planning-and-solutioning-documents-as-whole-and-sharded-artifacts.md:17-29`；`09-sdlc-workflow-lifecycle-contract.md:88-96`）；它没有明确把“消费”扩展成“只验证”。同一 decision table又无条件规定 index引用缺失/越界/不可读时 block，`SPEC 09` 还要求 canonical whole与 canonical `index.md` 自身必须先完成 entry validation（`09-sdlc-workflow-lifecycle-contract.md:95,98`）。因此现有文字无法唯一决定：显式选择 whole时，是只不消费未选 graph但仍验证它，还是连 graph也不读取/验证。

**严重性判断：P1 decision gate 合理，直接 patch 分类不成立**

该歧义决定 malformed未选 index能否阻断 invocation，直接改变 continuation与 evidence，必须在交付前消除，属于 P1。由于两种行为都能从现有条款得到部分支持，Evaluator不能代替 Owner选择；在 Owner裁决前把它归为可直接修复的 `patch` 不成立。

**修复建议：Owner 决策前不可授权**

Owner需在以下二选一中明确 owning contract：

1. 显式 `selection=whole` 只消费 whole，但仍验证已发现 `index.md` 的完整 shard graph；graph broken时按现有 unconditional row block。
2. 显式 `selection=whole` 只验证并消费 canonical whole；对未选 `index.md` 仅执行 `SPEC 09:98` 要求的 canonical entry `lstat`、readability与realpath containment，并记录 `unselectedPath`，不读取/解析其 shard graph。无 selection或 `selection=sharded` 时继续完整验证 graph。

Owner若选择方案 2，Fixer才可在 whole已通过 entry validation、index entry已安全存在且 invocation显式选择 whole时，在 `resolveDeclaredShards()` 前短路；不得跳过 canonical index自身的 symlink/readability/containment要求。Owner若选择方案 1，current graph-validation sequencing应保留，但 contract/docs/tests需明确“未选 graph仍是全局 integrity gate”，避免继续从“只消费”推导相反结论。两种方案都不得读取 symlink-escape index target。

**误报评估：不是运行时误报；Reviewer 的唯一修复主张缺少充分 contract 依据**

该 finding应保留为 Owner gate，而不是忽略或降级为 TODO。

## Rejected Candidates Confirmation（驳回候选确认）

1. **Non-angle trailing junk / link title：同意驳回。** Owner L只授权 destination bounded subset，Round 3 evaluation明确禁止借 malformed修复新增 title grammar（`11-5-code-review-evaluation-20260904-round-3.md:121-129,191-200`）。本轮 #1-#5授权不得识别、验证、接受或拒绝任意 title/tail。
2. **CommonMark backslash-escaped punctuation应被 unescape并消费：同意驳回。** Existing contract没有授权完整 punctuation escape semantics。Finding #4只授权 portable fail-close：decode后仍含反斜杠即 `unsupported-local-reference`；不得 unescape-and-consume。
3. **Edge `guard_snippet`：同意驳回。** 建议性伪代码不是 current implementation evidence，也不得作为 Fixer必须照抄的实现。

## Overall Evaluation Conclusion（整体评估结论）

### Required Fixes（需要修复，阻塞交付）

| # | Finding | 原始严重性 | 评估后优先级 | 分类 | 说明 |
|---|---------|-----------|---------------|------|------|
| 1 | Decode 前提前分类 | P1 | **P1** | patch | 所有 drive/external/network/portable分类必须基于 exactly-once decoded destination。 |
| 2 | Duplicate 在 first-definition-wins 前验证 | P1 | **P1** | patch | 后续 duplicate必须在 destination parse前跳过。 |
| 3 | Empty definition被静默 ignore | P1 | **P1** | patch | 首个空 definition destination必须 `malformed-link-destination` block。 |
| 4 | 普通 raw/encoded backslash可被消费 | P1 | **P1** | patch | Decode后任意 local-ish backslash必须 portable fail-close。 |
| 5 | Angle body内部空白被 trim接受 | P1 | **P1** | patch | 空 body或内部首尾空白必须 malformed block。 |

### Owner Decision Required（需要 Owner 决策，阻塞交付）

| # | Finding | 原始严重性 | 评估后优先级 | 分类 | 说明 |
|---|---------|-----------|---------------|------|------|
| 6 | `selection=whole` 是否验证未选 shard graph | P1 | **P1** | decision_needed | Runtime反例真实，但“只消费所选”与 unconditional broken-index block未定义 validation precedence。 |

### CR TODO（非阻塞）

无。

### False Positives（可忽略/误报）

无。Finding #6不是运行时误报，而是其 `patch` 分类和唯一修复主张未经 owning contract充分授权。

### Evaluation Decision（评估决定）

- **Finding #1**：确认有效，P1 patch；统一到 post-decode classification。
- **Finding #2**：确认有效，P1 patch；duplicate在 parse前遵循 first-definition-wins。
- **Finding #3**：确认有效，P1 patch；empty first definition fail closed。
- **Finding #4**：确认有效，P1 patch；raw/encoded ordinary backslash portable fail closed。
- **Finding #5**：确认有效，P1 patch；angle body内部首尾空白 fail closed。
- **Finding #6**：反例有效，P1 decision_needed；Owner裁决 validation precedence前不授权源码修复。

## Owner Decision Gate（Owner 决策门禁）

**Owner decision: required for Finding #6 only**。

Owner L 已足够唯一裁决 #1、#3、#4、#5；Round 3 已批准的 first-definition-wins足够裁决 #2。对于 #6，Owner需明确“显式选择 whole是否跳过未选 index shard graph validation”，并同时说明 `SPEC 09:95` 的 unconditional broken-reference row与 `SPEC 09:98` canonical index entry validation在该分支如何适用。

建议 Owner 精确回复以下之一：

- `确认 11.5 selection-whole 方案 S`：只验证/消费 whole；未选 index只做 canonical entry安全校验并记录，不解析 shard graph。
- `确认 11.5 selection-whole 方案 G`：仍验证未选 index完整 shard graph；broken graph继续 block，并同步澄清 contract/docs/tests。

Evaluator不替 Owner推荐 S 或 G；二者对 integrity gate与显式选择语义有实质不同。

## Fix Authorization（修复授权）

Fresh Fixer仅获授权修改 Story 11-5 shared artifact-document discovery的直接实现、focused tests，并把 fix record追加到本 evaluation；当前授权 findings为 **#1、#2、#3、#4、#5**。Finding #6明确不在本次授权内，等待 Owner decision后再由 root orchestrator发出追加授权。

1. **#1 pipeline**：strip query/fragment、exactly-once decode后统一执行 drive/external/network/portable/local-md分类；decoded drive为 `unsupported-local-reference`，decoded external/network为ignore。
2. **#2 duplicate**：normalized label已存在时，在 destination parse/decode/access前跳过后续 definition，保持首定义状态。
3. **#3 empty definition**：首定义缺失或空 destination以 `malformed-link-destination` block；明确 fragment/external/network definition继续ignore。
4. **#4 backslash portable**：single decode后任意含反斜杠的 local-ish destination以 `unsupported-local-reference` block；不得改写分隔符或unescape消费。
5. **#5 angle whitespace**：angle body为空或含内部首尾空白时以 `malformed-link-destination` block；outside-angle whitespace继续合法。

不得新增/重命名 stable issue，不得修改 Story、tracker、flow gates、CR summaries、rules/TODO、CR04-06、external drawer、IDE mirrors或 Story 11.6+。Current `SPEC 07`、`SPEC 09` 与 public docs足以描述 #1-#5，Fixer不得为重复表述修改它们；#6 contract变更需等 Owner选择后由 root重新定界。

## Required Verification（必需验证）

Fixer完成 #1-#5 后至少需要以下 focused evidence。所有 block cases同时断言 `artifact-path.broken-shard-reference`、正确 `referenceKind`、`actualConsumedPath=null`、`consumedPaths=[]`、`continuation=block`、safe details与 before/after zero mutation：

- **Pipeline**：raw-colon + encoded slash/backslash drive均为 `unsupported-local-reference`；fully encoded external scheme与encoded network path确定性ignore且不访问 target；raw external/network保持ignore；malformed percent encoding仍fail closed；exactly-once decode fixture不回归。
- **Duplicate definition**：合法 local首定义后跟 malformed、unsupported-local、external duplicate均保持首定义结果；ignore首定义后跟 local/malformed duplicate仍ignore；duplicate target不得被访问。
- **Empty definition**：full、collapsed、shortcut usage分别覆盖首个 empty definition并以 `malformed-link-destination` block；非空 fragment/external/network definition继续 `defined-but-ignore`；empty duplicate不改变合法首定义。
- **Backslash portability**：普通 raw与 percent-encoded backslash local-ish `.md`均为 `unsupported-local-reference`；drive-letter slash/backslash与encoded variants继续同类block；不得报告被 `/` 伪装的 evidence path。
- **Angle body**：`< good.md>`、`<good.md >`与空 `<>`均为 `malformed-link-destination`；`<good.md>`、`<https://...>`、`<//...>`及 `>` 后仅 whitespace保持现有语义。
- **Regression**：declaration order、first-use dedupe、direct/normalized/repeated self-link、odd/even opener、nested/reference forms、whole/sharded正常 selection、subject containment/readability与zero mutation均不回归。

Finding #6 的 verification matrix必须等 Owner选择：若 S，覆盖 whole-selected + broken/malformed/missing-shard index继续whole且只记录未选 index，同时保留 canonical index entry symlink/readability/containment gate；若 G，覆盖相同输入继续broken block并验证澄清后的 contract/docs parity。

## Scope Exclusions（范围排除）

- 不新增 dependency或完整 CommonMark parser。
- 不新增 link-title/tail grammar，不处理 HTML、code span、image destination或任意 Markdown AST扩展。
- 不执行 CommonMark punctuation unescape；Finding #4只做portable rejection。
- 不进行 second decode、external fetch、fallback consumption、migration、copy、rename、delete或config rewrite。
- 不改变 Owner M finite probes、Architecture explicit/fallback或 mismatch semantics。
- 不修改 `speclite-drawer-er-modeler`、`.agents/.claude` mirrors、fixed-count baseline或 Story 11.6+。
- 本 Evaluator未运行 build、full suite、packaging或任何写型生成命令；Reviewer报告的 drawer/count drift仅为外部 caveat。

## Next Gate（下一门禁）

1. Fresh Fixer先按当前唯一授权修复 #1-#5，并在本文件追加 fix record；不得触碰 #6。
2. Root orchestrator向 Owner取得 Finding #6 的 S/G明确选择，再向 fresh Fixer发出窄化追加授权；若 Owner选 G且无需runtime变更，只同步 Owner明确授权的最小 contract/docs/tests。
3. 完成全部授权项后，执行 fresh Reviewer Round 5三层审查与 fresh Evaluator Round 5。
4. 只有 latest Reviewer与latest Evaluator均PASS，且 required verification无Story 11.5新增失败，才可进入 CR04、CR05、CR06。

## 修复执行记录

### 修复执行记录

- **Date**: 2026-09-04
- **Model Used**: GPT-5.5 (gpt-5.5)
- **Fix Items**: 6
- **Owner Decision**: 用户已明确确认 `确认 11.5 selection-whole 方案 S`；该确认仅追加授权 Finding #6 的方案 S，不改变 Finding #1-#5 的 Evaluator 授权边界。

### Fix Results（修复结果）

| Finding | 修改 | 结果 |
| --- | --- | --- |
| #1 post-decode classification | `parseMarkdownLinkDestination()` 先完成 bounded raw grammar 提取，再 strip query/fragment、exactly-once decode，最后统一执行 drive、external scheme、network、backslash portable 与 local Markdown 分类。 | raw-colon + encoded separator 的 drive 输入稳定 fail-close；fully encoded external/network 稳定 ignore；未增加 second decode、URL fetch 或 dependency。 |
| #2 first-definition-wins | normalized label 已存在时，在 duplicate destination parse/decode/classification 与 filesystem access 前直接跳过并 mask duplicate definition。 | malformed、unsupported-local、external、local 或 empty duplicate 均不能改变首定义结果。 |
| #3 empty first definition | 首个 reference definition 缺失 destination 或 trim 后为空时返回既有 `malformed-link-destination`。 | full、collapsed、shortcut usage 均 fail-close；合法首定义后的 empty duplicate 保持首定义权威。 |
| #4 backslash portability | exactly-once decode 后，drive classification完成后对其余 local-ish backslash destination 返回既有 `unsupported-local-reference`；不改写 separator、不做 CommonMark unescape。 | raw/encoded普通反斜杠不能依赖 POSIX 字面 filename，也不会生成伪装为 slash path 的 consumed evidence。 |
| #5 angle body whitespace | 保留 angle body 原值；空 body或 body 内 leading/trailing whitespace返回既有 `malformed-link-destination`，只允许 closing `>` 后、outer `)` 前的 whitespace。 | `< good.md>`、`<good.md >`、`<>` fail-close；合法 local/external/network angle form 与 outside-angle whitespace 保持原语义。 |
| #6 Owner方案 S | Canonical whole/index entry 的 `lstat`、readability 与 realpath containment仍先执行；当 whole+index 且 invocation显式 `selection=whole` 时，在 `resolveDeclaredShards()` 前跳过未选 index内容与 shard graph，只消费 whole并记录 `unselectedPath`。无 selection或 `selection=sharded`仍完整验证 graph。 | 安全 index entry内的 missing shard、malformed destination或undefined reference不再阻断 whole selection；index entry symlink escape或non-file/unreadable仍block。 |

### Files Changed（变更文件）

- `src/config/artifact-document-discovery.ts`：实现 #1-#6 的 bounded runtime修复。
- `test/artifact-document-discovery.test.ts`：新增 pipeline、duplicate、empty definition、ordinary backslash、angle body及方案 S正反向 fixtures，并保持 block前后 snapshot一致。
- `_bmad-output/planning-artifacts/specs/09-sdlc-workflow-lifecycle-contract.md`：按 Owner方案 S 唯一化 explicit whole/sharded validation precedence。
- `docs/reference/workflow-artifact-layout.md`、`docs/reference/cli.md`：同步最小 public guidance，明确 `selection=whole` 仍校验 index entry但不解析未选 graph。
- 本 evaluation：追加本修复记录。未修改 Story、tracker、kickoff/completion gates、review summary、CR rules/TODO、CR04-06、drawer、IDE mirrors、fixed-count baseline或 Story 11.6+。

### Verification（验证）

- `npx vitest run test/artifact-document-discovery.test.ts`：PASS，`67/67`。
- Fresh build后 related resolver/path/CLI/docs suite：PASS，`41/41`。
- `npm run build`：PASS。
- `npm run docs:check`：PASS，72 Markdown files / 5 drafts。
- `npm run release:packaging-check`：PASS；未对 external drawer/fixed-count baseline执行修复。
- Canonical source checker warn与strict：均 `status=ok`、`findings=[]`；82个既有 canonical source changed paths仅分类为 `canonical-source-truth:D0`、`module-discovery-contract:D0`，`decisionRecordRequired=false`。按 governance runner完成只读分类后无D1/D2 decision record要求，也无本 Fixer范围内D0定点修复。
- Scoped `git diff --check`：PASS。
- Full suite：64 files中59 passed、5 failed；576 tests中560 passed、12 failed、4 todo。12项失败全部为已隔离的 external `speclite-drawer-er-modeler` 使 core/default package roots从18/68变为19/69，而fixed-count expectations仍为18/68；无 Story 11.5源码或新增fixture失败。

### Scope Audit（范围审计）

- 未新增/重命名 stable issue、dependency、title grammar、完整 CommonMark parser或 second decode。
- 未改变 Owner M finite probes、Architecture explicit/fallback、mismatch semantics或 consumers。
- 未读取/消费显式 whole selection下未选 index的内容；entry安全校验仍不可绕过。
- 未修改或清理 external drawer、`.agents/.claude` mirrors、fixed-count drift及其它用户/并发改动。
- **Owner blocker**：无新增 Owner blocker；下一门禁为 fresh Reviewer Round 5 三层审查与 fresh Evaluator Round 5。
