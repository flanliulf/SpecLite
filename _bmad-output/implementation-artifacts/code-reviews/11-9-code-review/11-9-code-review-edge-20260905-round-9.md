---
schemaVersion: "speclite.code-review.layer.v1"
storyKey: "11-9-normalize-code-review-artifact-directories-by-story-id"
round: 9
layer: "edge"
result: "FAIL"
generatedAt: "2026-09-04T23:27:25.000Z"
sourceSkill: "bmad-review-edge-case-hunter"
modelUsed: "OpenAI GPT-5.6 Sol (gpt-5.6-sol)"
headSha: "ff7528d3f9ec34072bb669ee79f7569345c23d47"
---

# Story 11.9 Code Review Edge Hunter（边界路径审查）

## Verdict（结论）

`FAIL`。发现 `3` 项 fresh P1；Round 5 起已确认的 `supersededIndex` identity/continuity 缺口继续维持 `1` 项 carried deferred P2，不升级、不混入当前 patch。Round 8 Fixer 已在其授权形态内关闭 ordinary mapping multiline quotes、single-line explicit-key block scalar、single-line quote-aware/compound `pre` / `code` opening，以及 `pre-main` / `main-v2` other-series isolation；focused regression 当前为 `53 passed / 4 todo`。但是机械遍历这些新状态机的邻接分支后，current production probes 仍证明：explicit mapping value 的 multiline quoted scalar 正文、跨物理行的 bounded raw tag opening 正文可冒充 terminal；current-series known-family filename 一旦 date 槽自身含 `-`、为空或使用 `_` 分隔，则会被静默归为 unrelated。

Findings 仅限 Story 11.9 current resolver、focused tests 与 Round 8 修复边界。未读取或归因 Story 11.10；未扫描 external drawer；未纳入 workspace mirrors 或 fixed-count baseline；未运行 build、full suite、packaging 或 canonical governance。

## P1 Findings（P1 发现）

### P1-1 — Explicit mapping 的 multiline quoted value 正文仍可冒充 terminal tracker key

- **Location**：`assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs:789-838`；`test/code-review-contract.test.ts:1160-1208`
- **Trigger condition**：sprint/workflow tracker 使用合法 explicit mapping value，例如 `? notes\n: "example\n  {storyKey}: done\n  ending"` 或对应 single-quoted 形式，且真实 owning key 缺失。
- **Unhandled path**：Round 8 的 `explicitHeader` 只识别 explicit value line 上的 `|` / `>` block indicator；`quotedHeader` 又只识别 `key: "...` / `key: '...` 同行普通 mapping。于是 `: "` / `: '` 不开启 `quoted` state，正文中的空格缩进 exact key 进入 `candidatePattern`。对 current production function 的只读探针中，single/double quoted explicit values 均返回 `accepted=true`；项目当前 `yaml` parser 将这些 bytes 解析为单一 `notes` scalar，而不是 owning tracker mapping。
- **Consequence**：真实 owning tracker key 缺失时，non-owning quoted scalar 正文可配合 authentic whole-file hash 认证 completed legacy，并错误开启 canonical new run。
- **Guard sketch**：在现有 bounded YAML state machine 中让同 indentation 的 explicit value indicator 同时识别 single/double multiline quote；保留 quote 无歧义结束后的真实同级/嵌套 owner 可达，unclosed/ambiguous value fail-close，不引入通用 YAML parser。

### P1-2 — 跨物理行的 `pre` / `code` opening 正文仍可冒充 Story status

- **Location**：`resolve-cr-directory.mjs:685-786`；`test/code-review-contract.test.ts:1210-1306`
- **Trigger condition**：Story 使用跨行 bounded raw opening，例如 `<pre\n class="example">\nStatus: done\n</pre>` 或 `<code\n>\nStatus: done\n</code>`，真实 owning `Status` 缺失。
- **Unhandled path**：`parseBoundedRawTag()` 在 tag name 恰好结束于物理行尾时由 `cursor >= line.length` 直接返回 `null`，调用方将 `<pre` / `<code` 当作完全未识别文本，而不是 Round 8 授权要求的 ambiguous/fail-close opening；后续属性/`>`行也不会建立 `rawHtmlTags` state。current production probes 对 `<pre\n>...`、multiline attribute `pre` 与 `code` 三种输入均返回 `accepted=true`，且 `trackerLinesOutsideMarkdownFences()` 把正文 `Status: done` 保留为 visible。
- **Consequence**：非 owning raw body 可在 Story 真正 `Status` 缺失时认证 historical finalizer `DONE`，破坏 terminal authority。
- **Guard sketch**：当 line-start bounded tag name 后到达 EOL 时进入有限 pending-opening state，跨行 quote-aware 扫描到 `>`；closure 后真实 `Status` 继续可达，unclosed/ambiguous opening fail-close，不扩展到其他 HTML 元素或通用 CommonMark parser。

### P1-3 — Malformed date 槽可使 current-series known-family artifact 被静默归为 unrelated

- **Location**：`resolve-cr-directory.mjs:372-401`；`test/code-review-contract.test.ts:684-723,725-756`
- **Trigger condition**：canonical 目录包含 exact Story/family/current series 但 date 槽损坏的 artifact，例如 `11-9-code-review-summary-2026-09-05-main-round-1.md`、`...-summary--main-round-1.md` 或 `...-summary-20260905_main-round-1.md`。
- **Unhandled path**：canonical/complete-name grammar 因 date 槽不满足 `[0-9]{8}` 而失败；Round 8 收窄后的 malformed fallback 又要求 remainder 以无 hyphen 的 `^[^-]+-main` 开头。date 槽自身含 hyphen、为空或 date/series separator 为 underscore 时，caller-frozen `main` intent 无法到达 `malformed-current-intent`，最终落入 `unrelated`。三个 current production resolver 临时目录探针均返回 `ok=true / compatibilityMode=canonical`，而现有 malformed matrix只覆盖合法八位 date 后的 round/extension畸形。
- **Consequence**：损坏的 active current artifact 可与新 lifecycle 在同一 canonical 目录并存，破坏 current-series evidence fail-close 与 round lineage。
- **Guard sketch**：在 exact Story + known family prefix 后先 bounded 地拆分/判定 date 与 series intent；完整合法 other series 继续 exact-isolated，仅 caller current series 的 date/delimiter 畸形进入 malformed-current-intent。

## P2 Findings（P2 发现）

### P2-1 — `supersededIndex` identity/continuity 继续维持 carried deferred

- **Location**：`resolve-cr-directory.mjs:380-389,266,292-332`；`assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/references/cr-contract.md:113-120`
- **Trigger condition**：同 family/round 历史副本重复使用同一 ordinal，或首个副本从大于 1 的 ordinal 开始。
- **Unhandled path**：classifier 解析后仍未把 `supersededIndex` 纳入 identity；historical validation 不验证 ordinal 从 1 开始、唯一且连续。
- **Consequence**：replacement timeline 不能唯一审计，但不改变 current artifact cardinality、consumer 或 canonical write target。
- **Disposition**：严格沿用 Round 5–8 Evaluator 的 deferred P2 策略，交由 CR05 登记；不得在本轮 P1 Fixer 中实现或扩展 producer retry/supersession algorithm。

## Prior Closure Audit（既有闭环边界审计）

- Round 8 ordinary mapping single/double multiline quotes，以及 `? notes` 后的 standalone block scalar value，在其 fixture shape 内已关闭；P1-1 仅针对两者组合后的 explicit quoted value 分支，不重开 ordinary quoted 或 explicit block finding。
- Round 8 quoted-`>` attributes、single-line compound opening、closed/unclosed bounded raw region与 `<pretext>` control 已关闭；P1-2 仅针对 tag name 在物理行尾、opening 延续到后续行的 pending state。
- Round 8 `pre-main` / `main-v2` 完整合法 other series 持续保持 unrelated；P1-3 针对 caller current series 的 malformed date/delimiter intent，不允许用 substring rule 回退并误伤合法 other series。
- Round 5–8 current rounds 精确 `1..N`、artifact/frontmatter identity、supersession binding、trackerChangeSet exact indentation/fields/order、unsafe candidate完整 `roundEvidence`、redacted diagnostic与zero-write matrix未出现新反例。
- Current completion gate `generatedAt=2026-09-04T23:22:44.000Z` 晚于 Round 8 Fix Summary 与 affected source/test evidence，Round 8 gate 刷新顺序成立；但本轮 Reviewer 为 FAIL，未来 Fixer 与 latest Evaluator 之后仍须由 outer owner 刷新最终 gate。此为既定顺序义务，不作为新增 finding。

## Owner Gate（Owner 门禁）

`NONE`。三项 P1 的 observable behavior 已由 shared CR contract 的真实 role-owned terminal、current-series exact identity 与 malformed evidence fail-close 唯一确定。修复可限制在 current resolver 与 focused regression；不得扩大为通用 YAML/HTML parser，不得修改 reviewSeries schema、report basename 或 producer/supersession algorithm。

## Verification And Boundary（核证与边界）

- `npx vitest run test/code-review-contract.test.ts --reporter=dot`：`53 passed / 4 todo`；现有绿灯未覆盖上述三个反例。
- `node --check assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs`：PASS。
- Current production YAML private-function probe：explicit single/double multiline quoted value 正文中的 exact terminal 均返回 `true`；同一 bytes 由项目当前 `yaml` parser 解析为 non-owning `notes` scalar。
- Current production Story private-function probe：跨行 `<pre` / `<code` opening 正文中的 `Status: done` 返回 `true`，且该 status 行被 scanner 保留为 visible。
- Current production resolver probe：canonical 目录分别只含 hyphenated date、empty date 或 underscore separator 的 current-family artifact 时，均返回 `ok=true / compatibilityMode=canonical`。
- Allowed source/test/ledger `git diff --check`：PASS。
- Live Story 11.9 status=`review`；Round 8 summary/evaluation/Fix Summary 链存在，current completion gate已记录 Round 8 evidence。
- 本层除创建本报告外未修改 source、tests、fixtures、contract、Story、tracker、completion gate、root goal records 或既有 CR artifacts。
- 未运行 `npm run build`、full suite、packaging 或 canonical governance；未读取/修改 Story 11.10、external drawer/zip、workspace mirrors 或 fixed-count baseline。

## Edge JSON（边界结果）

```json
[
  {"location":"resolve-cr-directory.mjs:789-838","trigger_condition":"Terminal key appears inside explicit multiline quoted YAML value","guard_snippet":"track quoted scalar state after a standalone explicit value indicator","potential_consequence":"Non-owning scalar text authenticates completed legacy"},
  {"location":"resolve-cr-directory.mjs:685-786","trigger_condition":"Story status appears under a multiline pre or code opening","guard_snippet":"carry a bounded pending raw-tag opening state across physical lines","potential_consequence":"Raw HTML body authenticates Story terminal"},
  {"location":"resolve-cr-directory.mjs:372-401","trigger_condition":"Current-series artifact has a malformed date or date separator","guard_snippet":"separate bounded date validation from exact review-series classification","potential_consequence":"Damaged current evidence is silently ignored"},
  {"location":"resolve-cr-directory.mjs:380-389","trigger_condition":"Superseded history repeats or skips its ordinal index","guard_snippet":"defer unique consecutive supersededIndex validation to tracked TODO","potential_consequence":"Replacement history remains ambiguously ordered"}
]
```

## Exclusions（明确排除）

- 未审查或建议修改 Story 11.10 generic inventory。
- 未扫描或纳入 `assets/source/speclite/core-skills/speclite-drawer-er-modeler/` 及 zip。
- 未纳入 workspace mirrors、fixed-count baselines、build、full suite、packaging 或 canonical governance。
- 未建议修改 report basenames、CR producer/supersession algorithm、round numbering、approval policy 或 dependencies。
