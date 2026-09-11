---
schemaVersion: "speclite.code-review.layer.v1"
storyKey: "11-9-normalize-code-review-artifact-directories-by-story-id"
round: 4
layer: "edge"
result: "FAIL"
generatedAt: "2026-09-04T21:36:58.000Z"
sourceSkill: "bmad-review-edge-case-hunter"
headSha: "ff7528d3f9ec34072bb669ee79f7569345c23d47"
---

# Story 11.9 Code Review Edge Hunter（边界路径审查）

## Verdict（结论）

`FAIL`。发现 `6` 项 P1、`0` 项 P2。Round 3 Fixer 后 focused test 为 `36 passed / 4 todo`，但 executable CLI、supersession、同轮唯一性、tracker terminal state、stable diagnostic evidence 与 detector family 的组合分支仍未被 guard 或测试覆盖。Findings 仅限 Story 11.9；不涉及 Story 11.10、external drawer、workspace mirrors、fixed-count baseline、report basename、CR algorithm、round/approval policy、build、full suite或 packaging。

## P1 Findings（P1 发现）

### P1-1 — 唯一 executable resolver CLI 无法传入 frozen tracker bindings

- **Location**：`assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs:18-24,386-452,521-558,626-667`；`assets/source/speclite/sdlc-skills/4-implementation/speclite-goal-orchestrator-epic-story-code-review-runner/references/runner-workflow.md:17`
- **Trigger condition**：runner 通过合同规定的唯一 CLI 命令解析一个含 authentic `DONE` finalizer 的 completed legacy-only 目录。
- **Unhandled path**：Round 3 将 DONE 验证改为必须消费 `trackerBindings`，但 `parseArguments()` 不解析任何 tracker binding，runner 命令也只传 project root、implementation artifacts、Story ID 与 series。于是 production CLI 中 `trackerBindings` 恒为 `undefined`，`validTrackerBindings()` 恒为 false；任何 `result: DONE` finalizer都会在 `inspectCandidate()` 被降为 invalid evidence。当前 GREEN 只直接调用 exported function并手工传 bindings，installed CLI probe只覆盖空目录，没有穿过 completed-legacy路径。
- **Consequence**：恢复矩阵的“completed legacy only → canonical new run”在真实 runner/installed入口不可达，合法历史 run 被稳定误阻断。
- **Guard sketch**：在唯一 resolver CLI/runner preflight中传递并验证由 merged runtime config冻结的 exact tracker bindings；增加 source与两个 installed resolver的 completed-legacy CLI probe，禁止 resolver自行猜测 workflow tracker。

### P1-2 — 合法 superseded 历史 artifact 被 malformed-intent guard 当作损坏 current evidence

- **Location**：`resolve-cr-directory.mjs:252-270,338-359`；`speclite-code-review-contract/references/cr-contract.md:107-114`；`test/code-review-contract.test.ts:653-689`
- **Trigger condition**：同轮重建后目录按合同保留 `11-9-code-review-evaluation-20260905-main-round-1-superseded-1.md`，frontmatter为 `disposition: superseded`，同时存在合法 current canonical evaluation。
- **Unhandled path**：`looksLikeCrArtifactSignal()` 会因 Story prefix、known family与 `-main-round-` 命中 superseded filename；随后 strict `suffixPattern`要求 filename精确以 `round-{n}.md`结束，合法 `-superseded-{n}.md` 必然返回 `invalidEvidence()`。Round 3 unrelated matrix没有合法 superseded family。
- **Consequence**：合同要求保留的 replacement历史会令 canonical/legacy run无法 resume或完成，违反 current-only consumption与禁止覆盖旧 current的约束。
- **Guard sketch**：在 current-intent校验前精确识别合同允许的 superseded filename/frontmatter并只作历史证据忽略；仅 malformed current或伪造 superseded identity fail-close。

### P1-3 — 同一 family/round 的多份 current artifact 没有唯一性门禁

- **Location**：`resolve-cr-directory.mjs:252-315,345-359,418-440`；`cr-contract.md:107-114`
- **Trigger condition**：目录同时含两个不同 date token、但相同 Story/series/round/type且均为 `disposition: current` 的 review/evaluation/finalizer artifact，或同轮同时存在一个 valid DONE finalizer与另一个非 DONE current finalizer。
- **Unhandled path**：扫描只累积 `maxRound`与 `doneRounds`，未按 `{artifactType, round}`计数并要求唯一 current。finalizer只要任意一个同轮文件通过就把 round加入 `doneRounds`；另一个合法 identity但非 DONE的 current finalizer不会撤销完成状态。source binding又只引用其中一个 basename。
- **Consequence**：无法唯一判定 current artifact/current round时仍可能返回 completed并切换 canonical sibling，形成 split lifecycle或选择性消费。
- **Guard sketch**：按 `{storyId, reviewSeries, round, artifactType}`冻结唯一 current basename；任一 family同轮出现多个 current或多个 finalizer disposition冲突时 stable block，superseded副本不计入 current集合。

### P1-4 — Tracker authenticity 只验证 current bytes hash，不验证 key 的 terminal state

- **Location**：`resolve-cr-directory.mjs:521-583`；`test/code-review-contract.test.ts:732-764,1637-1744`；`cr-contract.md:396-406`
- **Trigger condition**：真实 Story/sprint/workflow tracker文件仍为 `review`、`in-progress`或其他非 terminal值，finalizer把这些未完成 bytes的真实 hash写为 `afterHash`并声明 reread consistent。
- **Unhandled path**：`validTrackerChangeSet()`验证 frozen path/key、文件类型与 whole-file `afterHash`，却从不解析对应 key并验证目标 terminal value；`beforeHash`也只验形状。只要报告诚实哈希当前未完成内容，就可通过 authenticity。GREEN helper固定写 `done`，没有将真实 hash同步到 non-terminal内容的反例。
- **Consequence**：legacy run可在 required tracker未完成时被判 authentic DONE并启动新 canonical lifecycle，tracker与artifact状态分叉。
- **Guard sketch**：frozen binding同时携带 owner-defined expected terminal state；no-follow重读后既验证 canonicalized `afterHash`，也验证 Story `Status`、完整 sprint key及 configured workflow key精确处于该 terminal state。

### P1-5 — Canonical malformed diagnostic 遗漏 canonical roundEvidence

- **Location**：`resolve-cr-directory.mjs:107-122,329-335`；`cr-contract.md:79-87`；`test/code-review-contract.test.ts:653-675,821-943`
- **Trigger condition**：canonical candidate含 malformed current evidence，无 legacy candidate；或 canonical与legacy同时存在且 canonical evidence invalid。
- **Unhandled path**：invalid branch用 `legacy.map(candidate => candidate.evidence)`构造 `roundEvidence`，始终排除 canonical candidate。canonical-only malformed时返回空数组；canonical+legacy时也只报告 legacy evidence，尽管 stable `reason`选择了 `current-series-evidence-invalid`。现有 matrix精确冻结 reason但不冻结每个 candidate的 evidence completeness。
- **Consequence**：stable diagnostic声称 canonical current evidence invalid，却不给出 owning canonical候选的结构化状态，调用方无法按合同审计阻断原因并可能误判恢复面。
- **Guard sketch**：invalid branch按 byte-wise candidate顺序输出所有 relevant candidate evidence（包含 canonical），并测试 canonical-only及canonical+legacy下 `roundEvidence`与候选集合双向 exact equality。

### P1-6 — Split-expression detector 只覆盖 slug/filename特例，仍漏 title/name/filename等价族

- **Location**：`test/code-review-contract.test.ts:1115-1151,1497-1514`
- **Trigger condition**：bounded active producer使用 `${story_id}"-"${story_title}"-code-review"`、`${story_id}"-"${story_name}"-code-review"`、`${story_id}"-"${story_filename}"-code-review"` 或 `${story.id}${"-"}${story.title}${"-code-review"}`。
- **Unhandled path**：generic placeholder pattern要求 identity与title placeholder之间是直接 `-/_/space`；三个新增 special regex分别只覆盖 shell `story_slug`、JS `{filename}`与template `story.slug`。只读正则探针显示上述四个等价表达式全部为 zero match。mutation matrix只为每种语法选一个字段，未做语法 × `title/name/slug/filename`交叉覆盖。
- **Consequence**：frozen active roots可新增 AC3明示的 title/name/filename派生目录而不进入 candidate ledger，`active-canonical=[]` false-green。
- **Guard sketch**：让每种已支持的 split语法共享完整 title-bearing name family，并用 table-driven syntax × title/name/slug/filename mutations逐格证明“先发现、后因未分类 fail-close”。

## P2 Findings（P2 发现）

无。

## Closed Boundaries（已关闭边界）

- malformed current filename 的 round/date/extension主路径已 fail-close；本轮新问题是合法 superseded历史被误伤。
- CR04/CR05 current evaluation basename/hash lineage已验证；未发现 Round 3 lineage finding复现。
- 14类 blocked matrix的 `issueId/category/reason`已精确冻结，callback与controlled-tree保持零变化；本轮只发现 diagnostic `roundEvidence`不完整。
- 八个 source ZH/EN及installed active `SKILL.md`均已有 numeric Story identity + `reviewSeries` + `crDir` 的 explicit no-title/name/slug/filename rederive hard gate；未发现该语义再次缺失。

## Verification And Boundary（核证与边界）

- `npx vitest run test/code-review-contract.test.ts --reporter=dot`：`36 passed / 4 todo`。
- 只读 detector正则探针：`${story_id}"-"${story_title}"-code-review"`、`${story_id}"-"${story_name}"-code-review"`、`${story_id}"-"${story_filename}"-code-review"`、`${story.id}${"-"}${story.title}${"-code-review"}` 均为 `false`。
- 未运行 build、full suite、packaging或 canonical governance；未读取/修改 Story 11.10或 external drawer。
- 本层除创建本报告外未修改 source、tests、fixtures、Story、tracker、completion gate、root goal records或既有 CR artifacts。

## Edge JSON（边界结果）

```json
[
  {"location":"resolve-cr-directory.mjs:626-667","trigger_condition":"Completed legacy is resolved through the production CLI","guard_snippet":"parse and validate frozen tracker bindings before resolveCrDirectory(options)","potential_consequence":"Every authentic completed legacy run is blocked"},
  {"location":"resolve-cr-directory.mjs:252-270","trigger_condition":"A valid superseded artifact is retained beside current","guard_snippet":"if (validSupersededIdentity(entry)) continue","potential_consequence":"Required historical evidence blocks all continuation"},
  {"location":"resolve-cr-directory.mjs:252-315","trigger_condition":"Two current artifacts share family series and round","guard_snippet":"reject duplicate current identities per artifactType and round","potential_consequence":"Ambiguous lifecycle can be marked completed"},
  {"location":"resolve-cr-directory.mjs:521-558","trigger_condition":"Tracker hashes match files whose keyed states remain nonterminal","guard_snippet":"assert resolved key value equals frozen terminal state","potential_consequence":"DONE is accepted while trackers remain unfinished"},
  {"location":"resolve-cr-directory.mjs:107-122","trigger_condition":"Canonical current evidence is malformed without legacy candidates","guard_snippet":"roundEvidence = inspected.map(candidate => candidate.evidence)","potential_consequence":"Stable diagnostic omits its failing canonical evidence"},
  {"location":"test/code-review-contract.test.ts:1497-1514","trigger_condition":"Split syntax combines identity with title name or filename","guard_snippet":"cross product split syntaxes with every title-bearing field family","potential_consequence":"Active title-derived directory bypasses the exact ledger"}
]
```

## Exclusions（明确排除）

- 未审查或建议修改 Story 11.10 generic inventory。
- 未扫描或纳入 `assets/source/speclite/core-skills/speclite-drawer-er-modeler/` 及 zip。
- 未运行 `npm run build`、full suite、packaging或 canonical governance。
- 未建议修改 report basenames、CR algorithm、round numbering、approval/confirmation policy或 dependencies。
