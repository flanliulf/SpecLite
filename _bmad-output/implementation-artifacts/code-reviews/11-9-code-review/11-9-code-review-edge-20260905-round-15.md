---
schemaVersion: "speclite.code-review.layer.v1"
storyKey: "11-9-normalize-code-review-artifact-directories-by-story-id"
round: 15
layer: "edge"
result: "FAIL"
generatedAt: "2026-09-05T01:29:41.000Z"
sourceSkill: "bmad-review-edge-case-hunter"
modelUsed: "OpenAI GPT-5.6 Sol (gpt-5.6-sol)"
headSha: "ff7528d3f9ec34072bb669ee79f7569345c23d47"
---

# Story 11.9 Code Review Edge Hunter（边界路径审查）

## Verdict（结论）

`FAIL`。发现 `1` 项 fresh P1；Round 5 起已确认的 `supersededIndex` identity/continuity 缺口继续维持 `1` 项 carried deferred P2，不升级、不混入当前 patch。Round 14 Fixer 已在授权边界内关闭 flow collection 的 `?` / shorthand tag / anchor → quoted node state，以及 raw closure 后 visible-separated second comment 的 repeated transition；fresh focused 为 `71 passed / 4 todo`。机械遍历其相邻 property-token 分支后，current production classifier 仍证明：标准 YAML verbatim tag `!<...>` 会在 URI 允许的逗号处被误切断并把整个 flow state永久标为 ambiguous，遮蔽其后唯一真实 sprint/workflow terminal。

Findings 仅限 Story 11.9 current resolver、focused tests、shared contract与Round 14修复边界。未读取或归因 Story 11.10；未扫描 external drawer；未纳入 workspace mirrors 或 fixed-count baseline；未运行 build、full suite、packaging 或 canonical governance。

## P1 Findings（P1 发现）

### P1-1 — Verbatim tag URI被当作flow delimiter并遮蔽真实terminal

- **Location**：`assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs:1097-1107`；`test/code-review-contract.test.ts:2542-2594`
- **Trigger condition**：合法 sprint/workflow YAML flow node使用标准 verbatim tag，例如 `!<tag:example.org,2026:tracker-note>`，tagged quoted scalar后存在唯一真实 root tracker terminal。
- **Unhandled path**：`scanYamlFlowCollectionLine()` 只用 `^[!&][^ \\t\\r\\n,\\[\\]{}]+` 消费 node property。verbatim tag URI 中合法的 `,` 因此提前结束 token；下一字符不是 whitespace，`:1101-1107` 立即返回 `ambiguous:true`。`trackerLinesOutsideYamlBlockScalars()` 此后跳过所有物理行，连 flow collection外唯一真实 owner也不可见。Fresh production-function probe对 sprint与workflow分别使用 `notes: [!<tag:example.org,2026:tracker-note> "example]\\n  <key>: done\\n  ending"]` 后接 root `<key>: done`：项目现有 `yaml@2.9.0` 均为 zero parse errors且 root terminal=`done`，current `trackerHasExactTerminalState()` 均返回 `false`；同构 `!!str` control返回 `true`。
- **Consequence**：authentic completed legacy被误判 `legacy-current-series-evidence-invalid`，无法按 AC9 在 canonical root开始新 run。
- **Guard sketch**：仅在现有 node-boundary property branch 增加 bounded verbatim-tag token `!<...>`；要求同一 token内存在 closing `>` 且其后为 whitespace，随后继续复用现有 quoted/flow/plain node state。unclosed `!<`、duplicate/third property、无node、unclosed quote与mismatched delimiter继续fail-close；补 sprint/workflow、single/double quote、sequence/mapping、真实 owner与 filesystem zero-write controls。不得引入 YAML parser dependency、第二 tracker authority或通用 tag grammar。

## P2 Findings（P2 发现）

### P2-1 — `supersededIndex` identity/continuity 继续维持 carried deferred

- **Location**：`resolve-cr-directory.mjs:266,292-332,380-389`；`speclite-code-review-contract/references/cr-contract.md:113-120`
- **Trigger condition**：同 family/round 历史副本重复使用同一 ordinal，或首个副本从大于 `1` 的 ordinal开始。
- **Unhandled path**：classifier解析后仍未把 `supersededIndex` 纳入 historical identity；validation不验证 ordinal从`1`开始、唯一且连续。
- **Consequence**：replacement timeline不能唯一审计，但不改变 current artifact cardinality、consumer、canonical/legacy continuation或runtime write target。
- **Disposition**：严格沿用 Round 5–14 Evaluator 的 deferred P2策略，交由 CR05登记；不得在本轮 P1 Fixer中实现或扩展 producer retry/supersession algorithm。

## Round 14 Closure Audit（Round 14 闭环审计）

- `?` explicit-key indicator、`!!str` / `!local` shorthand tag、anchor及tag+anchor任一合法次序后的 single/double quoted node持续进入 quoted state；sequence/mapping、sprint/workflow、false-accept/false-reject及duplicate/third property controls通过。
- Raw closure后 `visible → closed comment → visible → second comment` 已由重复 comment transition消费；第二comment正文中的 `<pre>` / `<code>` 不再进入raw stack，comment外真实raw reopening仍fail-close。
- Round 13 outer cross-line property、flow plain scalar literal quote、non-separated `#`、raw later-comment handoff与exact-current filename delimiter controls持续闭环。
- 本轮P1仅针对 shorthand-tag fix的相邻标准 verbatim-tag lexical form；不要求完整 YAML tag directive、schema resolution或通用 parser。

## Exhaustive Path Result（穷举路径结果）

- **YAML**：已复核 block/quoted/plain/flow state、`?`、shorthand tag、anchor、tag+anchor、duplicate/third/dangling property、quote escape、comment boundary、nested sequence/mapping、matched/mismatched closure与真实 owner；仅 verbatim tag token存在新反例。
- **HTML / Markdown**：已复核 closed/unclosed comment、visible-separated repeated comments、raw/comment交叉、comment外 reopening、pending multiline opening、quoted attribute、compound stack、fence closed/unclosed与真实 Story terminal；未发现新反例。
- **Classifier / filesystem**：exact current、other-series、malformed intent、round `1..N`、canonical/legacy/dual/multi、symlink/non-file/I/O、candidate byte order与containment路径由focused suite覆盖，未发现新反例。
- **Lineage / redaction / zero mutation**：source/evaluation/CR04/CR05/finalizer identity/hash/round binding、completion-gate freshness、trackerChangeSet exact schema、stable project-relative diagnostic与blocked-preflight filesystem/progress snapshot持续通过；`supersededIndex`仅维持carried P2。

## Verification（验证）

- `npx vitest run test/code-review-contract.test.ts --reporter=dot`：✅ `1 file passed / 71 passed / 4 todo`。
- `node --check assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs`：✅ exit `0`。
- Resolver/test scoped `git diff --check`：✅ exit `0`。
- Verbatim-tag parser probe：✅ sprint/workflow `2/2` zero parse errors、root terminal=`done`；❌ production terminal classifier `2/2`返回`false`；✅同构 `!!str` control返回`true`。
- Current SHA-256：resolver=`5fa13478c11b4a8c481d52d297fd5d77aa49e4f1b5516e476065334368a90738`；test=`08767bf8e1df64500665de82be12c2914d320a36bd10c52377c181596e0135ef`；completion gate=`86c13b9b8787e6c7c074cdd0f8e8c382bb2f0bb5e6890f827c446c92654ac48b`。
- Current completion gate `generatedAt=2026-09-05T01:25:21.000Z`，记录Round 14 mutation后的focused `71 passed / 4 todo`；本轮production反例推翻其AC9/AC11语义充分性，但不存在stale-gate finding。

## Owner Gate（Owner 门禁）

`NONE`。observable behavior已由 Story 11.9 AC9/AC11 与 shared terminal-authenticity contract冻结：合法非owner YAML node property不得遮蔽其后唯一真实 terminal。修复只能限制在现有 bounded verbatim-tag token与focused regression；不得引入通用 YAML parser、新dependency、扩大 tracker grammar/authority、修改 recovery contract，或纳入 Story 11.10 / drawer。

## Evidence Boundary（证据边界）

- 本层仅创建本 Round 15 Edge report；未修改 source、tests、fixtures、contract、Story、tracker、completion gate、goal records或既有CR artifacts。
- 未实现或升级carried P2，未进入CR04、CR05或CR06。
- 本结果只代表fresh Edge Case Hunter；仍须由同轮Blind Hunter、Acceptance Auditor、Aggregator与fresh Evaluator形成最终裁决。

---

*本文档由 bmad-review-edge-case-hunter Skill 自动生成*
