---
schemaVersion: "speclite.code-review.layer.v1"
storyKey: "11-9-normalize-code-review-artifact-directories-by-story-id"
round: 11
layer: "edge"
result: "FAIL"
generatedAt: "2026-09-05T00:06:14.000Z"
sourceSkill: "bmad-review-edge-case-hunter"
modelUsed: "OpenAI GPT-5.6 Sol (gpt-5.6-sol)"
headSha: "ff7528d3f9ec34072bb669ee79f7569345c23d47"
---

# Story 11.9 Code Review Edge Hunter（边界路径审查）

## Verdict（结论）

`FAIL`。发现 `2` 项 fresh P1；Round 5 起已确认的 `supersededIndex` identity/continuity 缺口继续维持 `1` 项 carried deferred P2，不升级、不混入当前 patch。Round 10 Fixer 已在其授权 fixture shape 内关闭 flow collection multiline quote、invalid plain-scalar continuation、consecutive comment / raw-closure suffix transition，以及 alphabetic、`_`、`.` current date/delimiter，并由 current completion gate 记录 focused `58 passed / 4 todo`。但是机械遍历修复后相邻分支后，current production probes 仍证明：tag/anchor 修饰的 flow collection 没有进入 bounded flow state，其嵌套 key 可冒充 tracker terminal；malformed `pre-main` / `main-v2` other-series artifact 会因 current-token substring fallback 被误归为 `malformed-current-intent`，从而阻断 `main` series。

Findings 仅限 Story 11.9 current resolver、focused tests、shared contract 与 Round 10 修复边界。未读取或归因 Story 11.10；未扫描 external drawer；未纳入 workspace mirrors 或 fixed-count baseline；未运行 build、full suite、packaging 或 canonical governance。

## P1 Findings（P1 发现）

### P1-1 — Tag/anchor 修饰的 YAML flow collection 仍会泄露嵌套 tracker key

- **Location**：`assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs:944-963`；`test/code-review-contract.test.ts:1295-1335`
- **Trigger condition**：sprint/workflow tracker 将 non-owning flow mapping/sequence 置于合法 tag 或 anchor 后，例如 `notes: &bucket { ... }`、`notes: !!map { ... }` 或 `notes: &bucket !!map { ... }`，且 flow collection 内存在唯一 exact target key、真实 owning key 缺失。
- **Unhandled path**：`yamlFlowCollectionOpening()`的 explicit、sequence 与 mapping 三个入口都要求 `[` / `{` 紧跟 value indicator，不接受同一 scanner 已为 block scalar 支持的 bounded `[!&]token` modifier。scanner 因此未建立 `flow` state，下一物理行的嵌套 exact key进入 `visible`。Current production-function probe 对 anchor、tag、anchor+tag 三种有效 YAML 均返回 `trackerHasExactTerminalState(...)=true`；独立 `yaml` 解析证明 document root 只有 `notes`，target key仅位于其嵌套 object/array中。
- **Consequence**：真实 role-owned tracker key 缺失时，non-owning flow collection内的嵌套 key可配合 authentic whole-file hash认证legacy completion，并错误开启canonical new run。
- **Guard sketch**：仅在现有 `yamlFlowCollectionOpening()` 三个 bounded入口允许已支持的有限 tag/anchor token序列后再识别 `[` / `{`，或对该形态保守 fail-close；保留 collection闭合后的真实同级/嵌套owner controls，不引入通用 YAML parser、tag解析、alias展开或新dependency。

### P1-2 — Malformed other-series basename 会因 current token substring 被错误阻断

- **Location**：`resolve-cr-directory.mjs:391-399`；`test/code-review-contract.test.ts:725-754`；`assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/references/cr-contract.md:81`
- **Trigger condition**：同一目录含 exact Story + known family +合法非当前 series（其名称包含 caller-frozen `main` token），但该 other-series artifact 的 round/extension等尾部损坏，例如 `11-9-code-review-summary-20260905-pre-main-round-x.md` 或 `...-main-v2-round-x.md`。
- **Unhandled path**：`:391-395`只有完整 canonical-shaped other-series basename才能先返回 `unrelated`；一旦其 round尾部损坏，`:397`的贪婪 remainder regex会把 `pre-main` / `main-v2` 中的 `main` 当成独立current series token并返回 `malformed-current-intent`。Current classifier probe对上述两种 malformed other-series均返回该分类，而对应合法 `round-1`仍为 `unrelated`；真实临时目录 resolver probe仅放置 malformed `pre-main` artifact时返回 `ok:false / reason=current-series-evidence-invalid`，目录快照前后一致，证明这是read-only false block而非mutation副作用。
- **Consequence**：不属于 caller-frozen current series的损坏历史/并行世代 artifact 可阻断 `main` series preflight，违反 other-series isolation并造成无关证据拒绝服务。
- **Guard sketch**：在 exact 8位 date后按完整合法 series slot做 bounded partition，再判断该 slot是否精确等于 caller-frozen series；`pre-main`、`main-v2`等完整other-series slot即使尾部 malformed也保持 `unrelated`。不得退回任意 substring检测、改变 report basename/round policy，或要求通用 filename parser。

## P2 Findings（P2 发现）

### P2-1 — `supersededIndex` identity/continuity继续维持carried deferred

- **Location**：`resolve-cr-directory.mjs:266,292-332,380-389`；`speclite-code-review-contract/references/cr-contract.md:113-120`
- **Trigger condition**：同family/round历史副本重复使用同一ordinal，或首个副本从大于1的ordinal开始。
- **Unhandled path**：classifier解析后仍未把`supersededIndex`纳入historical identity；validation不验证ordinal从1开始、唯一且连续。
- **Consequence**：replacement timeline不能唯一审计，但不改变current artifact cardinality、consumer、canonical/legacy continuation或runtime write target。
- **Disposition**：严格沿用Round 5–10 Evaluator的deferred P2策略，交由CR05登记；不得在本轮P1 Fixer中实现或扩展producer retry/supersession algorithm。

## Prior Closure Audit（既有闭环边界审计）

- Round 10 direct flow collection multiline quote与invalid plain continuation在其fixture shape内已关闭；P1-1仅针对flow value前存在bounded tag/anchor modifiers的相邻入口，不重开普通flow finding。
- Round 10 consecutive comment、raw closure完整suffix、text/entity handoff持续闭环；机械遍历 fence/comment/pending/open/raw/close状态未发现新的可复现Story `Status` impersonation。
- Round 10 exact-current alphabetic及date-like `_` / `.` malformed date/delimiter持续闭环；P1-2是other-series false block，不允许回退这些 current-intent fail-close规则。
- Filesystem containment、candidate byte ordering、legacy-only/canonical/dual/multi recovery、unsafe evidence、redacted diagnostic与blocked-preflight zero mutation矩阵未发现新反例；本轮malformed other-series resolver probe也保持directory snapshot零变化。
- Round 5–10 current rounds精确`1..N`、artifact/frontmatter identity、source/evaluation/CR04/CR05 lineage、supersession binding、trackerChangeSet exact schema与whole-file hash未出现新反例；`supersededIndex`仅维持carried P2。

## Owner Gate（Owner 门禁）

`NONE`。两项P1的observable behavior已由Story 11.9与shared CR contract冻结：terminal只能来自真实role-owned scalar，other series必须保持`unrelated`。修复只能限于现有role-specific bounded YAML flow入口、bounded filename classifier与focused regression；不得引入通用YAML/filename parser、修改tracker/reviewSeries schema、扩展producer/supersession algorithm，或纳入Story 11.10/drawer。若无法在这些边界内同时保持普通flow/tag-anchor block controls、exact-current malformed fail-close与完整other-series isolation，必须停止并返回fresh Owner Gate。

## Verification Summary（验证摘要）

- `npx vitest run test/code-review-contract.test.ts --reporter=dot`：`1 file passed / 58 passed / 4 todo`；该绿灯不含本轮两个fresh反例。
- `node --check assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs`：PASS。
- Allowed slice `git diff --check -- test/code-review-contract.test.ts`：PASS。
- YAML current production-function probe：anchor、tag、anchor+tag flow三种YAML均由`yaml`解析为root-only `notes` structure、root无target key，但`trackerHasExactTerminalState(..., role="sprint")`均返回`true`；普通无modifier flow control返回`false`。
- Classifier probe：malformed `pre-main`与`main-v2`均返回`malformed-current-intent`，对应合法other-series names返回`unrelated`；`next` malformed control仍为`unrelated`。
- Resolver filesystem probe：仅含malformed `pre-main` artifact的canonical目录对current `main`返回`current-series-evidence-invalid`，before/after entry list完全一致（zero mutation）。
- Current completion gate `generatedAt=2026-09-05T00:02:52.000Z`晚于Round 10 source/test mutation并记录focused `58 passed / 4 todo`；本轮fresh反例推翻其completion语义充分性，但不质疑其刷新顺序或既有evidence provenance。
- Current resolver/test/ledger SHA-256分别为`b892dedd6562c425d1cf6877fe7fb849753304c3eb52cc1d2b911ee2351ca6ca`、`ff2fb75fb0ba1e94838871297496c25bb99434b7f096946aa481153c7c3e3c0e`、`2ec82a7e71571d273d26063c1565f415892ae6f514ad1c894e9b6737f2c0e914`；completion gate SHA-256为`b1e33e382ceb64642ceaf7426836bd57ee3e8043a6c88751c49d43c9478224f9`。
- Current HEAD=`ff7528d3f9ec34072bb669ee79f7569345c23d47`；审查对象包含current uncommitted Story 11.9 slice。

## Edge Findings JSON（边界发现 JSON）

```json
[
  {
    "location": "resolve-cr-directory.mjs:944-963",
    "trigger_condition": "Tagged or anchored flow collection contains the only terminal-looking key",
    "guard_snippet": "accept bounded tag/anchor tokens before flow opening or fail closed",
    "potential_consequence": "Nested non-owner key authenticates legacy completion"
  },
  {
    "location": "resolve-cr-directory.mjs:391-399",
    "trigger_condition": "Malformed other-series name contains caller series as a hyphenated token",
    "guard_snippet": "partition the complete series slot before classifying malformed current intent",
    "potential_consequence": "Unrelated generation blocks current-series preflight"
  },
  {
    "location": "resolve-cr-directory.mjs:266-389",
    "trigger_condition": "Superseded history repeats or skips its ordinal index",
    "guard_snippet": "defer unique consecutive supersededIndex validation to tracked TODO",
    "potential_consequence": "Replacement history remains ambiguously ordered"
  }
]
```

## Boundary Audit（边界审计）

- 本Edge Hunter仅创建本Round 11 edge report；未修改source、tests、fixtures、contract、Story、tracker、completion gate、goal records或既有CR artifacts。
- 未审查或建议修改Story 11.10 generic inventory。
- 未扫描或纳入`assets/source/speclite/core-skills/speclite-drawer-er-modeler/`及zip、workspace mirrors或fixed-count baselines。
- 未运行build、full suite、packaging或canonical governance。
