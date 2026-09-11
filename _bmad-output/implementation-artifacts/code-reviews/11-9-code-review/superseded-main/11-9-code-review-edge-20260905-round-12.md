---
schemaVersion: "speclite.code-review.layer.v1"
storyKey: "11-9-normalize-code-review-artifact-directories-by-story-id"
round: 12
layer: "edge"
result: "FAIL"
generatedAt: "2026-09-05T00:26:43.000Z"
sourceSkill: "bmad-review-edge-case-hunter"
modelUsed: "OpenAI GPT-5.6 Sol (gpt-5.6-sol)"
headSha: "ff7528d3f9ec34072bb669ee79f7569345c23d47"
---

# Story 11.9 Code Review Edge Hunter（边界路径审查）

## Verdict（结论）

`FAIL`。发现 `2` 项 fresh P1；Round 5 起已确认的 `supersededIndex` identity/continuity 缺口继续维持 `1` 项 carried deferred P2，不升级、不混入当前 patch。Round 11 Fixer 已在其授权 fixture shape 内关闭同一物理行的 tag/anchor + quoted/flow opening、flow comment token 污染、comment→raw handoff、exact-current `.round` 与 malformed other-series slot。机械遍历这些修复的相邻分支后，current production matcher 仍证明：合法 YAML 可把 node property 与 quoted/flow content 分置于不同物理行，此时 scanner 不建立 hidden state，non-owning value 内的 exact key 可冒充 tracker terminal；flow plain scalar 内不构成 comment indicator 的 `#` 被无条件当作 comment start，导致 collection closure 丢失并 false-reject 后续真实 owner。

Findings 仅限 Story 11.9 current resolver、focused tests、shared contract 与 Round 11 修复边界。未读取或归因 Story 11.10；未扫描 external drawer；未纳入 workspace mirrors 或 fixed-count baseline；未运行 build、full suite、packaging 或 canonical governance。

## P1 Findings（P1 发现）

### P1-1 — 跨物理行的 YAML property/value composition 仍会泄露 nested terminal

- **Location**：`assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs:899-978,981-1041`；`test/code-review-contract.test.ts:2239-2275`
- **Trigger condition**：sprint/workflow tracker 将合法 tag/anchor property 单独放在 mapping value 的一行，并在下一物理行开始 quoted scalar 或 flow collection，例如 `notes: &bucket` 后接缩进的 `[`，或 `notes:` 后接缩进的 `&memo "...`；真实 role-owned key 缺失，唯一 exact key 位于该 non-owning value 正文。
- **Unhandled path**：Round 11 新增的 `properties` grammar 只在 mapping、sequence、explicit value indicator 与 quote/`[`/`{` 位于同一物理行时生效。property-only line不会建立 pending-property state；下一行的独立 quote/flow opening也不匹配三个 value入口，故正文进入 `visible`。Current production-function probes 对 sprint 的分行 anchor+flow、workflow 的缩进 anchor+multiline quote均返回 `true`；Ruby `Psych` 独立解析分别证明 root 只有 `notes`，exact key仅是 nested flow mapping或quoted scalar正文。
- **Consequence**：authentic whole-file `afterHash` 不能修正错误的 scalar ownership；non-owning tracker正文可认证 legacy completion并错误开启 canonical new run。
- **Guard sketch**：仅为现有 role-specific scanner增加 bounded pending-property/value-opening state，允许 property-only line之后紧邻的缩进 quoted/flow node进入既有 hidden state；无歧义闭合后恢复真实同级/嵌套 owner，空值、跨 dedent、重复/非法property组合保守 fail-close。不得引入通用 YAML parser、tag/alias语义展开、新dependency或第二tracker authority。

### P1-2 — Flow plain scalar 中的 literal `#` 被误判为 YAML comment start

- **Location**：`resolve-cr-directory.mjs:993-1029`；`test/code-review-contract.test.ts:2278-2305`
- **Trigger condition**：合法 flow sequence/mapping含未加引号且 `#` 前无 separation space 的 plain scalar，例如 `notes: [foo#bar]` 或 `notes: {label: foo#bar}`，collection闭合后存在唯一真实 role-owned terminal key。
- **Unhandled path**：`scanYamlFlowCollectionLine()`在quote外遇到任意 `#` 都立即 `break`，没有区分 YAML comment indicator 与 plain-scalar literal。它因此漏掉同行 `]`/`}` closure并保留非空flow stack，后续真实owner行被无条件隐藏。Current production-function probes 对 sprint sequence 与 workflow mapping均返回 `false`；Ruby `Psych` 独立解析证明 `foo#bar` 是 scalar值，collection已闭合且root真实owner分别为`11-9: done`与`implementation-readiness: done`。现有正向control仅覆盖有separation space的真实comment和quoted `#`，均返回`true`。
- **Consequence**：合法且hash真实的completed legacy被误判为unfinished并原位resume，造成AC9/AC11的read-only false block。
- **Guard sketch**：在既有flow scanner中仅当 `#` 位于 YAML separation boundary 时终止当前物理行；plain scalar内部的literal `#`继续扫描后续collection closure。补sequence/mapping、sprint/workflow、literal/comment/quoted `#`及unclosed/mismatched controls；不得引入通用YAML parser或改变tracker authority。

## P2 Findings（P2 发现）

### P2-1 — `supersededIndex` identity/continuity继续维持carried deferred

- **Location**：`resolve-cr-directory.mjs:266,292-332,380-389`；`speclite-code-review-contract/references/cr-contract.md:113-120`
- **Trigger condition**：同family/round历史副本重复使用同一ordinal，或首个副本从大于1的ordinal开始。
- **Unhandled path**：classifier解析后仍未把`supersededIndex`纳入historical identity；validation不验证ordinal从1开始、唯一且连续。
- **Consequence**：replacement timeline不能唯一审计，但不改变current artifact cardinality、consumer、canonical/legacy continuation或runtime write target。
- **Disposition**：严格沿用Round 5–11 Evaluator的deferred P2策略，交由CR05登记；不得在本轮P1 Fixer中实现或扩展producer retry/supersession algorithm。

## Prior Closure Audit（既有闭环边界审计）

- Round 11 同一物理行的tag/anchor + quoted/flow composition在其fixture shape内持续闭环；P1-1只针对YAML允许property与node content跨物理行组合的相邻入口，不重开same-line finding。
- Round 11 flow comment中的bracket/brace/quote token污染已关闭；P1-2只针对无separation space、仍属于plain scalar内容的literal `#`，不回退真实comment lexical boundary。
- Round 11 comment→raw `pre`/`code`同行交接、exact-current `.round`与malformed complete other-series slot持续闭环；未发现新的可复现Story `Status` impersonation或series false-classification。
- Filesystem containment、candidate byte ordering、legacy-only/canonical/dual/multi recovery、unsafe evidence、stable redacted diagnostic与blocked-preflight zero mutation矩阵未发现新反例。
- Current rounds `1..N`、artifact/frontmatter identity、source/evaluation/CR04/CR05 lineage、supersession binding、trackerChangeSet exact schema与whole-file hash未出现新反例；`supersededIndex`仅维持carried P2。

## Owner Gate（Owner 门禁）

`NONE`。两项P1的observable behavior均由Story 11.9与shared CR contract冻结：terminal只能来自真实role-owned scalar，合法completed tracker不能因bounded scanner误判而被拒绝。修复只能限于现有role-specific YAML pending opening与flow lexical boundary、focused regression；不得引入通用YAML parser、修改tracker schema、扩展producer/supersession algorithm，或纳入Story 11.10/drawer。若无法在这些边界内同时保持same-line property、真实comment、quoted hash、invalid/unclosed YAML与真实owner controls，必须停止并返回fresh Owner Gate。

## Verification Summary（验证摘要）

- `npx vitest run test/code-review-contract.test.ts --reporter=dot`：`1 file passed / 62 passed / 4 todo`；该绿灯不含本轮两个fresh反例。
- `node --check assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs`：PASS。
- Allowed slice `git diff --check -- test/code-review-contract.test.ts`：PASS。
- Current production matcher probes：分行anchor+flow与缩进anchor+multiline quote均false-accept nested terminal；flow sequence/mapping的`foo#bar`均false-reject真实owner；真实spaced comment与quoted `#` controls保持正确。
- 独立YAML validity probe：Ruby `Psych`成功解析上述四个反例；property/value cases的root只有`notes`，literal-hash cases的root同时存在闭合collection与真实terminal owner。
- Current resolver/test/contract SHA-256分别为`55acca48012068c65b02852590636eeec0789e17d431ad2f1bfbb482682aba96`、`f06017e4028b8fae76c38c2cf995fdf12a918223a448a5498ffae311e4f3ca7a`、`ca2ee91f7a789a6f3f330a710dfe7d9e724f5675fd46a87070c4830089a3a935`。
- Current completion gate SHA-256=`f8d95f1de2a64450cd7b66f053aef801817ba889bcd20d71a404285dd727940d`，`generatedAt=2026-09-05T00:23:49.000Z`，记录Round 11 focused `62 passed / 4 todo`；provenance/freshness成立，但本轮反例推翻其completion语义充分性。
- Current HEAD=`ff7528d3f9ec34072bb669ee79f7569345c23d47`；审查对象包含current uncommitted Story 11.9 slice。

## Boundary Audit（边界审计）

- 本层仅创建`11-9-code-review-edge-20260905-round-12.md`；未修改source、tests、fixtures、contract、Story、tracker、completion gate、goal records或既有CR artifacts。
- 未审查或建议修改Story 11.10 generic inventory。
- 未扫描或纳入`assets/source/speclite/core-skills/speclite-drawer-er-modeler/`及zip、workspace mirrors或fixed-count baselines。
- 未运行build、full suite、packaging或canonical governance。
