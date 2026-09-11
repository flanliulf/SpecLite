---
schemaVersion: "speclite.code-review.layer.v1"
storyKey: "11-9-normalize-code-review-artifact-directories-by-story-id"
round: 13
layer: "edge"
result: "FAIL"
generatedAt: "2026-09-05T00:47:25.000Z"
sourceSkill: "bmad-review-edge-case-hunter"
modelUsed: "OpenAI GPT-5.6 Sol (gpt-5.6-sol)"
headSha: "ff7528d3f9ec34072bb669ee79f7569345c23d47"
---

# Story 11.9 Code Review Edge Hunter（边界路径审查）

## Verdict（结论）

`FAIL`。发现 `2` 项 fresh P1；Round 5 起已确认的 `supersededIndex` identity/continuity 缺口继续维持 `1` 项 carried deferred P2，不升级、不混入当前 patch。Round 12 Fixer 已在授权 fixture shape 内关闭跨物理行 YAML property/value、flow plain scalar 非分隔 `#`、active-comment / immediate raw-comment suffix handoff，以及 exact-current `+` / `:` delimiter。机械遍历这些修复的相邻分支后，current production scanner 仍证明：flow plain scalar 正文中的引号会被误当 quoted-node delimiter，导致合法 collection closure 丢失并 false-reject 后续真实 owner；raw closure 后若先有非空 visible text、再出现 closed comment 与新 bounded raw opening，scanner 既不接力也不 fail-close，后续 raw body 可泄露 Story terminal。

Findings 仅限 Story 11.9 current resolver、focused tests、shared contract 与 Round 12 修复边界。未读取或归因 Story 11.10；未扫描 external drawer；未纳入 workspace mirrors 或 fixed-count baseline；未运行 build、full suite、packaging 或 canonical governance。

## P1 Findings（P1 发现）

### P1-1 — Flow plain scalar 内部引号被误当 quoted-node delimiter

- **Location**：`assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs:1024-1060`；`test/code-review-contract.test.ts:2474-2503`
- **Trigger condition**：合法 YAML flow sequence/mapping 的 plain scalar 在首字符之后包含 literal 单引号或双引号，例如 `notes: [foo"bar]`、`notes: [foo'bar]` 或 `notes: {label: foo"bar}`，collection 闭合后存在唯一真实 role-owned terminal key。
- **Unhandled path**：`scanYamlFlowCollectionLine()` 在 quote 外遇到任意 `'` / `"` 都进入 quoted state，没有区分 quote 是否位于 flow node 起点，还是已进入 plain scalar 后的 literal content。literal quote 后若没有同类 quote，scanner 保留非空 `quote` state并漏掉同行 `]` / `}` closure，后续真实 owner 被隐藏。Current production-function probes 对三种输入的 `trackerHasExactTerminalState(..., "owner", "done", "sprint")` 均返回 `false`；Ruby `Psych` 独立解析分别确认 `notes` 为合法 sequence/mapping，且 root `owner: done` 存在。现有 Round 12 regression 只覆盖 plain scalar 中的 `#` 与从 node 起点开始的 quoted scalar，未覆盖 plain scalar 内部 quote。
- **Consequence**：合法且 whole-file hash 真实的 completed legacy 会被误判为 unfinished/invalid，阻止 canonical new run，破坏 AC9/AC11。
- **Guard sketch**：仅在既有 bounded flow scanner 内跟踪当前 token 是否已进入 plain scalar；只在 flow node boundary 识别 quoted scalar opening，plain scalar 正文中的 literal quote 继续作为普通字符扫描 closure。补 sequence/mapping、single/double quote、sprint/workflow、真实 owner、从 node 起点开始的 quoted scalar、unclosed/mismatched controls；不得引入通用 YAML parser、新 dependency 或第二 tracker authority。

### P1-2 — 非立即 closed comment 后的新 raw opening 未接力且未 fail-close

- **Location**：`resolve-cr-directory.mjs:763-809`；`test/code-review-contract.test.ts:2505-2535`
- **Trigger condition**：Story tracker 的 bounded raw region 在闭合 tag 后先出现非空 visible text，随后同一物理行出现 closed comment 与新的 `pre` / `code` opening，例如 `</pre> visible <!-- closed --><code>`，而唯一 `Status: done` 位于第二个 raw region 正文。
- **Unhandled path**：raw tag stack 在 `:789` 归零后，immediate-comment 分支会在 closed comment 后继续扫描；但 `:797-800` 的 later-comment 分支无条件返回 `{ ambiguous: false, tags: [] }`，既未将 closed-comment suffix 交回 raw scanner，也未将存在 non-empty prefix/suffix 的组合标为 ambiguous。下一物理行因此退出 raw state。Current production-function probes 对 `pre→visible→closed-comment→code` 与 `code→visible→closed-comment→pre` 均把 raw body 的 `Status: done` 暴露到 visible lines，并返回 terminal=`true`；immediate closed-comment control 保持 terminal=`false`。Round 12 Fix Summary 明确要求保留非立即 comment 的既有 fail-close，但 focused regression 只覆盖 immediate comment chain。
- **Consequence**：authentic tracker hash 不能修正 scanner 的 raw ownership错误；raw example body 可认证 legacy completion并错误开启 canonical new run。
- **Guard sketch**：保持 Round 12 immediate closed-comment suffix handoff；当 raw closure 与 later comment 之间存在 non-empty visible text时保守进入既有 ambiguous/fail-close state，或在不扩 element inventory 的前提下继续消费 closed-comment suffix并识别现有 `pre` / `code` opening。补 `pre`/`code` 交叉组合、空白与非空 prefix、closed/unclosed comment、第二 raw opening及 raw 闭合后真实 `Status` controls；不得扩张为通用 HTML/CommonMark parser。

## P2 Findings（P2 发现）

### P2-1 — `supersededIndex` identity/continuity 继续维持 carried deferred

- **Location**：`resolve-cr-directory.mjs:266,292-332,380-389`；`speclite-code-review-contract/references/cr-contract.md:113-120`
- **Trigger condition**：同 family/round 历史副本重复使用同一 ordinal，或首个副本从大于 `1` 的 ordinal 开始。
- **Unhandled path**：classifier 解析后仍未把 `supersededIndex` 纳入 historical identity；validation 不验证 ordinal 从 `1` 开始、唯一且连续。
- **Consequence**：replacement timeline 不能唯一审计，但不改变 current artifact cardinality、consumer、canonical/legacy continuation 或 runtime write target。
- **Disposition**：严格沿用 Round 5–12 Evaluator 的 deferred P2 策略，交由 CR05 登记；不得在本轮 P1 Fixer 中实现或扩展 producer retry/supersession algorithm。

## Prior Closure Audit（既有闭环边界审计）

- Round 12 跨物理行 YAML property/value 在其 direct quoted/flow opening fixture shape 内持续闭环；P1-1 只针对 flow collection 已进入 plain scalar 后出现 literal quote 的相邻 lexical branch，不重开 pending-property finding。
- Round 12 flow plain scalar 非分隔 `#` 持续闭环；P1-1 不改变 comment boundary，只区分 quoted-node opening 与 plain-scalar literal quote。
- Round 12 active comment closure 与 immediate raw-closure→closed-comment→raw chain 持续闭环；P1-2 只针对 raw closure 与 later comment 之间存在 non-empty visible text 的分支，并核对 Fix Summary 已冻结的 fail-close 义务。
- Round 12 exact-current `+` / `:` delimiter、Round 11 `.round` 与 malformed other-series isolation 持续闭环；未发现新的可复现 current-series classifier 反例。
- Filesystem containment、candidate byte ordering、legacy-only/canonical/dual/multi recovery、unsafe evidence、stable redacted diagnostic 与 blocked-preflight zero mutation 矩阵未发现新反例。
- Current rounds `1..N`、artifact/frontmatter identity、source/evaluation/CR04/CR05 lineage、supersession binding、trackerChangeSet exact schema 与 whole-file hash 未出现新反例；`supersededIndex` 仅维持 carried P2。

## Owner Gate（Owner 门禁）

`NONE`。两项 P1 的 observable behavior 已由 Story 11.9、shared CR contract 与 Round 12 Fixer 授权边界冻结：合法 role-owned tracker terminal 不得因 flow plain scalar literal quote 被遮蔽；comment/raw 正文不得成为 Story status authority，且非立即 comment compound branch 必须 fail-close。修复只能限制在现有 role-specific bounded flow lexical state、bounded `pre` / `code` later-comment transition及 focused regression；不得引入通用 YAML/HTML/CommonMark parser、修改 tracker schema、扩展 element inventory、改变 report basename/round/approval，或纳入 Story 11.10/drawer。若无法在这些边界内保持从 node 起点开始的 quoted scalar、immediate comment handoff、真实 visible owner 与 invalid/unclosed controls，必须停止并返回 fresh Owner Gate。

## Verification Summary（验证摘要）

- `npx vitest run test/code-review-contract.test.ts --reporter=dot`：`1 file passed / 66 passed / 4 todo`；该绿灯不含本轮两个 fresh 反例。
- `node --check assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs`：PASS。
- Allowed slice `git diff --check`（resolver、focused test、current completion gate）：PASS。
- YAML production-function probes：`[foo"bar]`、`[foo'bar]` 与 `{label: foo"bar}` 均 false-reject 后续真实 owner；独立 Ruby `Psych` parse 全部成功并确认 root owner。
- Story production-function probes：`</pre> visible <!-- closed --><code>` 与 `</code> text <!-- closed --> <pre>` 均 false-accept raw-body `Status`；immediate `</pre><!-- closed --><code>` control 持续正确隔离。
- Current resolver/test/completion-gate SHA-256 分别为 `5b77741cb4ef203c25ff58950256e217529c73add24964f55288e4a85da654a8`、`3b019b2078727b98fd85f2d8433ed44eea97c0a9360c619850d01cf29778b653`、`715668060465fefe808e1be91aeab0b6de420134cfbfe1572e386169dc516e54`；current HEAD=`ff7528d3f9ec34072bb669ee79f7569345c23d47`。
- Current completion gate `generatedAt=2026-09-05T00:44:35.000Z` 晚于 Round 12 source/test mutation并记录 `66 passed / 4 todo`；其 provenance/freshness 成立，但本轮 fresh 反例推翻 completion 语义充分性。后续 source/test mutation 后仍须由 outer owner 重生 gate。
- 按 bounded reviewer 范围未运行 build、full suite、packaging 或 canonical governance；未读取或归因 Story 11.10/drawer。

## Final Verdict（最终裁决）

- **结论**：`FAIL / FIX_REQUIRED`
- **阻塞项**：`2` 个 fresh P1
- **非阻塞项**：`1` 个 carried deferred P2（`supersededIndex`，CR05 TODO）
- **Owner Gate**：`NONE`
- **下一步**：交由 Round 13 aggregator 与 fresh Evaluator 独立确认、合并或驳回；任何 Fixer 授权必须保持 bounded scanner + focused regression，且不得混入 P2、Story 11.10 或 drawer。

## Boundary Audit（边界审计）

- 本层仅创建本 Round 13 edge report；未修改 source、tests、fixtures、contract、Story、tracker、completion gate、goal records或既有 CR artifacts。
- 未审查或建议修改 Story 11.10 generic inventory。
- 未扫描或纳入 `assets/source/speclite/core-skills/speclite-drawer-er-modeler/` 及 zip、workspace mirrors 或 fixed-count baselines。
- 未运行 build、full suite、packaging 或 canonical governance。
