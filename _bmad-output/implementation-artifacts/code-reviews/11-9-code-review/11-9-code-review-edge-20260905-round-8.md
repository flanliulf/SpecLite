---
schemaVersion: "speclite.code-review.layer.v1"
storyKey: "11-9-normalize-code-review-artifact-directories-by-story-id"
round: 8
layer: "edge"
result: "FAIL"
generatedAt: "2026-09-04T23:06:03.000Z"
sourceSkill: "bmad-review-edge-case-hunter"
modelUsed: "OpenAI GPT-5.6 Sol (gpt-5.6-sol)"
headSha: "ff7528d3f9ec34072bb669ee79f7569345c23d47"
---

# Story 11.9 Code Review Edge Hunter（边界路径审查）

## Verdict（结论）

`FAIL`。发现 `3` 项 P1；Round 5 起已确认的 `supersededIndex` identity/continuity 缺口继续维持 `1` 项 carried deferred P2，不升级、不混入当前 patch。Round 7 Fixer 已关闭 evaluator 明确授权的 sequence/tag/anchor/quoted-key block scalar、HTML comment与普通 raw `pre`/`code` region、以及 tab-indented `trackerChangeSet`；focused regression当前为 `50 passed / 4 todo`。但是机械遍历其相邻grammar与review-series分支后，production probes仍证明：YAML explicit mapping key的block scalar正文、合法raw HTML复合开标签/quoted-`>`属性正文仍可冒充terminal；另一个合法series名称只要包含当前series的hyphen token，就会被错误归为当前series malformed evidence。

Findings仅限Story 11.9 current resolver、shared CR contract与focused regression。未读取或归因Story 11.10；未扫描external drawer；未纳入workspace mirrors或fixed-count baseline；未运行build、full suite、packaging或canonical governance。

## P1 Findings（P1 发现）

### P1-1 — YAML explicit-key block scalar正文仍可冒充terminal tracker key

- **Location**：`assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs:720-745`；`test/code-review-contract.test.ts:1024-1102`
- **Trigger condition**：sprint/workflow tracker使用合法explicit mapping key block scalar，例如`? notes\n: |\n  {storyKey}: done`，且真实owning key缺失。
- **Unhandled path**：Round 7 header regex覆盖plain/quoted mapping key、bare sequence scalar及node properties，但explicit-key value indicator位于独立的`: |` / `: >-`行；该行既不匹配`- `分支，也不匹配“key后跟colon”分支，因此不会开启`block`状态。随后正文中的空格缩进exact key进入`candidatePattern`。直接调用current production `trackerHasExactTerminalState()`，上述合法YAML由项目当前`yaml` parser解析为`{"notes":"..."}`，resolver scanner却返回`true`。
- **Consequence**：真实owning tracker key缺失时，explicit-key scalar正文仍能配合authentic whole-file hash认证completed legacy并开启canonical new run。
- **Guard sketch**：在现有bounded YAML state machine内识别独立explicit value indicator的block-scalar header并跳过完整正文；保留scalar结束后的真实同级/嵌套owning key可达，不引入通用YAML parser。

### P1-2 — 合法raw HTML复合开标签或quoted-`>`属性正文仍可冒充Story status

- **Location**：`resolve-cr-directory.mjs:680-718`；`test/code-review-contract.test.ts:1127-1164`
- **Trigger condition**：Story使用`<pre><code>`复合开标签，或`<pre data-example=">">`这类属性值含`>`的合法raw HTML开标签，正文唯一包含`Status: done`。
- **Unhandled path**：`rawOpening`要求`<pre|code ...>`闭合尖括号后只能有空白至行尾，且属性部分不能包含任何`>`。因此常见`<pre><code>`不会开启region；quoted attribute中的`>`又会提前终止`[^>]*`，同样不匹配。对current production scanner的只读探针中，`<pre><code>\nStatus: done\n</code></pre>`与`<pre data-example=">">\nStatus: done\n</pre>`均返回`true`。Round 7 regression只枚举单一、整行结束的`<pre class="example">`与`<CODE>`。
- **Consequence**：非owning raw HTML body可在真实Story `Status`缺失时认证historical finalizer `DONE`，破坏terminal authority。
- **Guard sketch**：按bounded HTML block start规则识别`pre`/`code`起始标签，至少正确跨过quoted attributes并允许同一行后续nested tag；closed region后真实`Status`继续可达，unclosed/ambiguous region fail-close。

### P1-3 — 其他合法review series包含当前series token时被误判为malformed current evidence

- **Location**：`resolve-cr-directory.mjs:372-396`；`test/code-review-contract.test.ts` current-series/malformed-round fixtures
- **Trigger condition**：当前请求`reviewSeries=main`，同一canonical目录存在合法其他series artifact，例如`11-9-code-review-summary-20260905-pre-main-round-1.md`且frontmatter `reviewSeries: pre-main`。
- **Unhandled path**：canonical identity按当前`main`匹配失败后，malformed-intent fallback不解析series槽位，而是在整个remainder搜索`(?:^|[-_])main(?:[-_]|$)`。因此合法`pre-main`（同理`main-v2`）被归为当前series的malformed intent，而不是contract要求的unrelated other-series artifact。端到端production resolver probe只放置上述合法`pre-main` review artifact并请求`main`，实际返回`ok=false`、`reason=current-series-evidence-invalid`；预期是忽略other series并返回canonical `ok=true`。
- **Consequence**：并存的独立合法review series会稳定阻断当前series的新run/resume，破坏series隔离并制造伪ambiguity。
- **Guard sketch**：先按完整canonical basename grammar提取并比较review-series槽位；仅当槽位精确等于caller-frozen series且其他结构畸形时标记malformed，完整其他series保持unrelated。

## P2 Findings（P2 发现）

### P2-1 — `supersededIndex` identity/continuity继续维持carried deferred

- **Location**：`resolve-cr-directory.mjs:380-389,266,292-332`；`assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/references/cr-contract.md:113-120`
- **Trigger condition**：同family/round历史副本重复使用同一ordinal，或首个副本从大于1的ordinal开始。
- **Unhandled path**：classifier解析后仍未把`supersededIndex`纳入identity；historical validation不验证ordinal从1开始、唯一且连续。
- **Consequence**：replacement timeline不能唯一审计，但不改变current artifact cardinality、consumer或canonical write target。
- **Disposition**：严格沿用Round 5–7 Evaluator的deferred P2策略，交由CR05登记；不得在本轮P1 Fixer中实现或扩展producer retry/supersession algorithm。

## Prior Closure Audit（既有闭环边界审计）

- Round 7 sequence scalar、tag、anchor、quoted-key mapping block scalar正文排除在其fixture shape内已关闭；P1-1只针对此前未枚举、value indicator独占一行的YAML explicit-key分支。
- Round 7 closed/unclosed HTML comment及普通整行`pre`/`code` region已关闭；P1-2只针对同一bounded raw tag family中的复合开标签与quoted delimiter，不重开普通region finding。
- Round 7 exact 2/4-space `trackerChangeSet`与tab/mixed-tab拒绝已关闭；本轮未发现该parser的新反例。
- Round 5–7 malformed delimiter、current rounds精确`1..N`、item exact/unique/order、unsafe candidate完整`roundEvidence`、redacted diagnostic与zero-write matrix未出现新反例。P1-3是other-series隔离分支，不重开已验证的当前series malformed detection。
- Current completion gate `generatedAt=2026-09-04T23:02:01.000Z`晚于Round 7 Fix Summary与affected evidence，Round 7 gate刷新顺序成立；但本轮Reviewer为FAIL，未来Fixer与latest Evaluator之后仍须由outer owner刷新最终gate。此为既定顺序义务，不作为新增finding。

## Owner Gate（Owner门禁）

`NONE`。三项P1的observable behavior已由shared CR contract唯一确定：block/non-owning正文必须拒绝，完整其他review series必须保持unrelated。修复均可限制在current resolver与focused regression，不需要产品、Architecture或scope裁决。

## Verification And Boundary（核证与边界）

- `npx vitest run test/code-review-contract.test.ts --reporter=dot`：`50 passed / 4 todo`；现有绿灯没有覆盖上述三个反例。
- Current production scanner只读probe：YAML explicit-key block scalar、`<pre><code>`及quoted-`>` attribute三类正文中的exact terminal均返回`true`。
- Current production resolver端到端probe：请求`main`且目录只含合法`pre-main` artifact时返回`ok=false` / `current-series-evidence-invalid`。
- Allowed source/test `git diff --check`：PASS。
- Live Story 11.9 status=`review`；Round 7 summary/evaluation/Fix Summary链存在，current completion gate已记录Round 7 evidence。
- 本层除创建本报告外未修改source、tests、fixtures、contract、Story、tracker、completion gate、root goal records或既有CR artifacts。
- 未运行`npm run build`、full suite、packaging或canonical governance；未读取/修改Story 11.10、external drawer/zip、workspace mirrors或fixed-count baseline。

## Edge JSON（边界结果）

```json
[
  {"location":"resolve-cr-directory.mjs:720-745","trigger_condition":"Terminal key appears inside explicit-key YAML block scalar","guard_snippet":"recognize standalone explicit value block indicators before scanning mappings","potential_consequence":"Non-owning scalar text authenticates completed legacy"},
  {"location":"resolve-cr-directory.mjs:680-718","trigger_condition":"Status appears inside compound or quoted-attribute raw HTML block","guard_snippet":"scan bounded pre and code starts with quote-aware tag termination","potential_consequence":"Raw HTML body authenticates Story terminal"},
  {"location":"resolve-cr-directory.mjs:372-396","trigger_condition":"Other valid review series contains current series token","guard_snippet":"parse the complete series slot before classifying malformed current intent","potential_consequence":"Independent valid series blocks current continuation"},
  {"location":"resolve-cr-directory.mjs:380-389","trigger_condition":"Superseded history repeats or skips its ordinal index","guard_snippet":"defer unique consecutive supersededIndex validation to tracked TODO","potential_consequence":"Replacement history remains ambiguously ordered"}
]
```

## Exclusions（明确排除）

- 未审查或建议修改Story 11.10 generic inventory。
- 未扫描或纳入`assets/source/speclite/core-skills/speclite-drawer-er-modeler/`及zip。
- 未纳入workspace mirrors、fixed-count baselines、build、full suite、packaging或canonical governance。
- 未建议修改report basenames、CR producer/supersession algorithm、round numbering、approval policy或dependencies。
