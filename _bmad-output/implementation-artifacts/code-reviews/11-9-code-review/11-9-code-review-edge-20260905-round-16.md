---
schemaVersion: "speclite.code-review.layer.v1"
storyKey: "11-9-normalize-code-review-artifact-directories-by-story-id"
round: 16
layer: "edge"
result: "FAIL"
generatedAt: "2026-09-05T01:47:07.000Z"
sourceSkill: "bmad-review-edge-case-hunter"
modelUsed: "OpenAI GPT-5.6 Sol (gpt-5.6-sol)"
headSha: "ff7528d3f9ec34072bb669ee79f7569345c23d47"
---

# Story 11.9 Code Review Edge Hunter（边界路径审查）

## Verdict（结论）

`FAIL`。发现 `1` 项 fresh P1；Round 5 起已确认的 `supersededIndex` identity/continuity 缺口继续维持 `1` 项 carried deferred P2，不升级、不混入当前 patch。Round 15 Fixer 已在授权的 inner-flow property-token branch 内关闭 bare `!` 与完整 non-empty verbatim `!<...>`，focused suite 为 `71 passed / 4 todo`。机械遍历同一 tag 的 value-opening 边界后，current outer YAML detectors 仍要求 `!` 后至少存在一个非空白字符；合法 bare `!` 因而无法让 quoted、flow 或 block scalar进入隐藏状态，scalar 正文中的伪 terminal 会泄露为 owner candidate。

Findings 仅限 Story 11.9 current resolver、focused tests、shared contract与Round 15修复边界。未读取或归因 Story 11.10；未扫描 external drawer；未纳入 workspace mirrors 或 fixed-count baseline；未运行 build、full suite、packaging 或 canonical governance。

## P1 Findings（P1 发现）

### P1-1 — 外层bare `!`未进入YAML value state并泄露伪terminal

- **Location**：`assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs:1000-1019,1028-1037,1146-1174`；`test/code-review-contract.test.ts:2283-2312,2439-2470,2542-2605`
- **Trigger condition**：合法 sprint/workflow YAML value在 quoted、flow或block scalar前使用non-specific tag `!`，value正文包含唯一伪tracker terminal。
- **Unhandled path**：Round 15只修改 `scanYamlFlowCollectionLine()` 已进入 collection 后的 property token。外层 block header、`yamlQuotedScalarOpening()`、`yamlFlowCollectionOpening()` 与 `yamlPropertyOnlyOpening()` 仍使用要求 `[!&]` 后至少一个非空白字符的 property grammar。`notes: ! "..."`、`notes: ! [...]`、`notes: ! |`，以及 `notes: !` 后相邻行开启 quoted/flow value均不建立对应 hidden/pending state，后续物理行进入 `visible`。Fresh production-function probe 对same-line quoted/flow/block、cross-line quoted/flow与bare-tag+anchor flow共 `6` 个样例验证：项目现有 `yaml@2.9.0` 均为zero parse errors且document root不拥有目标key，current `trackerHasExactTerminalState()`却全部返回`true`；同一输入追加真实root owner后因伪/真两条candidate并存返回`false`。
- **Consequence**：伪造或遮蔽required terminal，可误认证DONE或阻断合法completed legacy恢复。
- **Guard sketch**：在既有bounded outer value-opening/property-only grammar复用Round 15 bare-tag token，覆盖quoted/flow/block与same/cross-line；保持malformed/duplicate、无node、unclosed/mismatched及真实owner controls fail-close。不得引入YAML parser dependency、通用tag grammar、第二tracker authority或改变recovery contract。

## P2 Findings（P2 发现）

### P2-1 — `supersededIndex` identity/continuity 继续维持 carried deferred

- **Location**：`resolve-cr-directory.mjs:266,292-332,380-389`；`speclite-code-review-contract/references/cr-contract.md:113-120`
- **Trigger condition**：同 family/round 历史副本重复使用同一 ordinal，或首个副本从大于 `1` 的 ordinal开始。
- **Unhandled path**：classifier解析后仍未把 `supersededIndex` 纳入 historical identity；validation不验证 ordinal从`1`开始、唯一且连续。
- **Consequence**：replacement timeline不能唯一审计，但不改变 current artifact cardinality、consumer、canonical/legacy continuation或runtime write target。
- **Disposition**：严格沿用 Round 5–15 Evaluator 的 deferred P2策略，交由 CR05登记；不得在本轮 P1 Fixer中实现或扩展 producer retry/supersession algorithm。

## Round 15 Closure Audit（Round 15 闭环审计）

- Collection内部 node boundary上的bare `!`、verbatim `!<...>`、shorthand tag、anchor、tag+anchor及explicit key持续进入quoted node state；完整/空/未闭合/非法分隔与duplicate/third property controls保持既有fail-close。
- Verbatim tag URI内逗号与flow brace不再提前截断；sequence/mapping、same/cross-line、single/double quote及真实owner controls持续通过。
- 本轮P1只针对同一non-specific tag在outer value-opening/property-only入口仍未被Round 15 token修复覆盖；不要求完整YAML tag directive、schema resolution或通用parser。

## Exhaustive Path Result（穷举路径结果）

- **YAML**：已复核 block/quoted/plain/flow state、same/cross-line property、`?`、bare/verbatim/shorthand tag、anchor、tag+anchor、duplicate/third/dangling property、quote escape、comment boundary、nested sequence/mapping、matched/mismatched closure与真实owner；仅outer bare-tag value opening存在新反例。
- **HTML / Markdown**：已复核closed/unclosed comment、visible-separated repeated comments、raw/comment交叉、comment外reopening、pending multiline opening、quoted attribute、compound stack、fence closed/unclosed与真实Story terminal；未发现新反例。
- **Classifier / filesystem**：exact current、other-series、malformed intent、round `1..N`、canonical/legacy/dual/multi、symlink/non-file/I/O、candidate byte order与containment路径由focused suite覆盖，未发现新反例。
- **Lineage / redaction / zero mutation**：source/evaluation/CR04/CR05/finalizer identity/hash/round binding、completion-gate freshness、trackerChangeSet exact schema、stable project-relative diagnostic与blocked-preflight filesystem/progress snapshot持续通过；`supersededIndex`仅维持carried P2。

## Verification（验证）

- `npx vitest run test/code-review-contract.test.ts --reporter=dot`：✅ `1 file passed / 71 passed / 4 todo`；当前suite没有outer bare-tag value fixture。
- `node --check assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs`：✅ exit `0`。
- Resolver/test scoped `git diff --check`：✅ exit `0`。
- YAML parser + production-function probe：✅ six-shape sprint key matrix `6/6` zero parse errors且root owner absent；❌ production terminal matcher `6/6`错误返回`true`。Quoted/flow/block三类追加真实root owner后，matcher `3/3`错误返回`false`。
- Current SHA-256：resolver=`6488d674f101c58ebeed0b81a4e215ae7f7d16b03173ba95a6179501cf57a0a5`；test=`c0b40d52c9b3ba81807387033cd3fa1408f4b422abdc0954b1e57f9d91c973b1`；completion gate=`3c7d4c368f3f2584514150a798368d8c211a3dd2c8d3156c06f9a9ab1b7b6d2d`。
- Current completion gate `generatedAt=2026-09-05T01:43:48.000Z`，记录Round 15 mutation后的focused `71 passed / 4 todo`；本轮production反例推翻其AC9/AC11语义充分性，但不存在stale-gate finding。

## Owner Gate（Owner 门禁）

`NONE`。Observable behavior已由 Story 11.9 AC9/AC11 与 shared terminal-authenticity contract冻结：合法non-owner YAML scalar不得产生terminal authority，真实owner也不得被scalar正文伪candidate遮蔽。修复只能限制在现有bounded outer value-opening/property-only tag token及focused regression；不得引入通用YAML parser、新dependency、扩大tracker grammar/authority、修改recovery contract，或纳入Story 11.10 / drawer。

## Evidence Boundary（证据边界）

- 本层仅创建本 Round 16 Edge report；未修改source、tests、fixtures、contract、Story、tracker、completion gate、goal records或既有CR artifacts。
- 未实现或升级carried P2，未进入CR04、CR05或CR06。
- 本结果只代表fresh Edge Case Hunter；仍须由同轮Blind Hunter、Acceptance Auditor、Aggregator与fresh Evaluator形成最终裁决。

---

*本文档由 bmad-review-edge-case-hunter Skill 自动生成*
