---
schemaVersion: "speclite.code-review.layer.v1"
storyKey: "11-9-normalize-code-review-artifact-directories-by-story-id"
round: 17
layer: "edge"
result: "FAIL"
generatedAt: "2026-09-05T02:10:39.000Z"
sourceSkill: "bmad-review-edge-case-hunter"
modelUsed: "OpenAI GPT-5.6 Sol (gpt-5.6-sol)"
headSha: "ff7528d3f9ec34072bb669ee79f7569345c23d47"
---

# Story 11.9 Code Review Edge Hunter（边界路径审查）

## Verdict（结论）

`FAIL`。发现 `1` 项 fresh P1；Round 5 起已确认的 `supersededIndex` identity/continuity 缺口继续维持 `1` 项 carried deferred P2，不升级、不混入当前 patch。Round 16 Fixer 已关闭合法 outer bare `!` 的隐藏状态与 inner empty-suffix shorthand 的 fail-close，但其新共享 matcher 同时接受 named-handle shorthand `!h!suffix`，却没有确认当前 YAML document 是否声明 `%TAG !h! ...`。因此未声明 handle 的 parser-invalid tracker 仍可通过 terminal authenticity 并把 completed legacy 错误认证为 canonical continuation。

Findings 仅限 Story 11.9 current resolver、focused tests、shared contract与 Round 16 修复边界。未读取或归因 Story 11.10；未扫描 external drawer；未纳入 workspace mirrors 或 fixed-count baseline；未运行 build、full suite、packaging 或 canonical governance。

## P1 Findings（P1 发现）

### P1-1 — 未声明named tag handle的parser-invalid tracker仍可获得completed认证

- **Location**：`assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs:916-918,964-981,1002-1023,1033-1179`；`test/code-review-contract.test.ts:2612-2693`
- **Trigger condition**：sprint/workflow tracker在 outer quoted/flow/block/property-only 或 inner flow node中使用 `!h!suffix`，但 document 不含对应 `%TAG !h! ...` declaration，随后存在唯一真实 root terminal。
- **Unhandled path**：`YAML_BOUNDED_TAG_PROPERTY_SOURCE` 只检查 named handle 与 suffix 均非空；outer detectors与 `scanYamlFlowCollectionLine()` 复用该 matcher 后直接建立 hidden/flow state，没有把 handle 与 document directive context绑定。Round 16 positive control仅覆盖带 `%TAG !h! ...` 的 `!h!suffix`，negative matrix只覆盖empty suffix `!h!`，没有未声明的non-empty named handle。Fresh production-function probe对inner flow、outer quoted、block、property-only/pending及tag/anchor形态均得到 YAML parser `TAG_RESOLVE_FAILED`，而 terminal matcher仍返回`true`。完整 authentic completed-legacy probe对 sprint/workflow 两种 role 均返回`ok:true / compatibilityMode:"canonical"`，调用前后filesystem snapshot相同。
- **Consequence**：语法无效tracker可伪造completed evidence并错误开启canonical new run。
- **Guard sketch**：当前 reviewer不授权实现通用 YAML parser或 `%TAG` directive/schema resolver。Owner必须在两条互斥边界中裁决：要么从 bounded accepted vocabulary移除named-handle shorthand并调整 Round 16 positive expectation；要么单独授权最小 declaration-to-handle binding及其 malformed/duplicate/multi-document fail-close矩阵。未裁决前不得猜测修复。

## P2 Findings（P2 发现）

### P2-1 — `supersededIndex` identity/continuity 继续维持 carried deferred

- **Location**：`resolve-cr-directory.mjs:266,292-332,380-389`；`speclite-code-review-contract/references/cr-contract.md:113-120`
- **Trigger condition**：同 family/round 历史副本重复使用同一 ordinal，或首个副本从大于 `1` 的 ordinal开始。
- **Unhandled path**：classifier解析后仍未把 `supersededIndex` 纳入 historical identity；validation不验证 ordinal从`1`开始、唯一且连续。
- **Consequence**：replacement timeline不能唯一审计，但不改变 current artifact cardinality、consumer、canonical/legacy continuation或runtime write target。
- **Disposition**：严格沿用 Round 5–16 Evaluator 的 deferred P2策略，交由 CR05登记；不得在本轮 P1 Fixer中实现或扩展 producer retry/supersession algorithm。

## Round 16 Closure Audit（Round 16 闭环审计）

- 合法 outer bare `!` 的 quoted/flow/block/property-only/pending路径已进入既有hidden state；伪owner-only fail-close、追加唯一真实owner后canonical continuation及zero-write矩阵通过。
- Inner `!!`、`!h!`及同构empty-suffix shorthand已进入ambiguous/fail-close；合法 bare `!`、`!local`、`!!str`、完整non-empty verbatim `!<...>`与带directive context的`!h!suffix` controls持续通过。
- 本轮P1不重开上述closed shapes，只指出 Round 16明确纳入的non-empty named handle缺少其自身的declaration precondition。该缺口不能通过增加任意tag grammar来旁路。

## Exhaustive Path Result（穷举路径结果）

- **YAML**：已复核 block/quoted/plain/flow state、same/cross-line property、`?`、bare/primary/secondary/named/verbatim tag、anchor、tag+anchor、empty suffix、duplicate/third/dangling property、quote escape、comment boundary、nested sequence/mapping、matched/mismatched closure与真实owner；仅non-empty named handle未绑定declaration context存在新反例。
- **HTML / Markdown**：closed/unclosed comment、visible-separated repeated comments、raw/comment交叉、comment外reopening、pending multiline opening、quoted attribute、compound stack、fence closed/unclosed与真实Story terminal的现有focused矩阵持续通过，未发现Round 16 mutation可达的新反例。
- **Classifier / filesystem**：exact current、other-series、malformed intent、round `1..N`、canonical/legacy/dual/multi、symlink/non-file/I/O、candidate byte order与containment路径由focused suite覆盖，未发现新反例。
- **Lineage / redaction / zero mutation**：source/evaluation/CR04/CR05/finalizer identity/hash/round binding、fresh completion gate、trackerChangeSet exact schema、stable project-relative diagnostic与blocked-preflight snapshot持续通过；完整undeclared-handle反例本身为zero mutation但continuation decision错误；`supersededIndex`仅维持carried P2。

## Verification（验证）

- `npx vitest run test/code-review-contract.test.ts --reporter=dot`：✅ `1 file passed / 73 passed / 4 todo`；当前suite没有undeclared non-empty named-handle negative control。
- `node --check assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs`：✅ exit `0`。
- Resolver/test/evaluation/gate scoped `git diff --check`：✅ exit `0`。
- YAML parser + production-function probe：❌ 未声明 `!h!suffix` 的inner、quoted、block、pending及tag+anchor五类形态均出现parser error，但 terminal matcher `5/5`返回`true`；✅ 带 `%TAG !h! ...` 的 sprint/workflow controls为zero parser errors且 matcher返回`true`。
- Authentic recovery probe：❌ sprint/workflow `2/2` parser-invalid tracker均返回`ok:true / compatibilityMode:"canonical"`；✅ before/after filesystem snapshot `2/2`完全一致。
- Current SHA-256：resolver=`92f1c31e571b078ea5b4f67b85ac8d5d736fc24489f712f055d83049d5fab976`；test=`97c08a4dcc95d8e235548b46071e399cc998d31bff5713dc7cf8f30156ff66a0`；completion gate=`afeda4e8bc013aa1f4ce7c978403a3ac6fdb0cc7a83ba0fe0dc0a7dac62be607`。
- Current completion gate `generatedAt=2026-09-05T02:05:41.000Z`，记录Round 16 mutation后的focused `73 passed / 4 todo`；freshness成立，但本轮production反例推翻AC9/AC11语义充分性，不构成stale-gate finding。

## Owner Gate（Owner 门禁）

`REQUIRED`。Round 16 Evaluator一方面要求带合法directive context的`!h!suffix`继续canonical recovery，另一方面明确禁止Fixer解析 `%TAG` directive。Current resolver/test两个既有白名单文件无法在不增加directive-to-handle binding的前提下同时区分“已声明named handle”与“未声明named handle”。Owner须明确选择：收窄bounded vocabulary、移除named-handle acceptance；或授权最小directive binding及其fail-close边界。该裁决仅限named handle，不授权通用YAML parser、schema/tag URI resolver、新dependency或terminal authority扩张。

## Evidence Boundary（证据边界）

- 本层仅创建本 Round 17 Edge report；未修改source、tests、fixtures、contract、Story、tracker、completion gate、goal records或既有CR artifacts。
- 未实现或升级carried P2，未进入CR04、CR05或CR06。
- 本结果只代表fresh Edge Case Hunter；仍须由同轮Blind Hunter、Acceptance Auditor、Aggregator与fresh Evaluator形成最终裁决。

---

*本文档由 bmad-review-edge-case-hunter Skill 自动生成*
