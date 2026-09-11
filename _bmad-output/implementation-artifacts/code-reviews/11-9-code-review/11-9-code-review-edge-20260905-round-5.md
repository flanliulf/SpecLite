---
schemaVersion: "speclite.code-review.layer.v1"
storyKey: "11-9-normalize-code-review-artifact-directories-by-story-id"
round: 5
layer: "edge"
result: "FAIL"
generatedAt: "2026-09-04T22:04:08.000Z"
sourceSkill: "bmad-review-edge-case-hunter"
headSha: "ff7528d3f9ec34072bb669ee79f7569345c23d47"
---

# Story 11.9 Code Review Edge Hunter（边界路径审查）

## Verdict（结论）

`FAIL`。发现 `5` 项 P1、`1` 项 P2。Round 4 Fixer 后 focused test 为 `44 passed / 4 todo`，但真实 tracker 格式、malformed-intent 分类、round 连续性、tracker change-set 唯一解析、unsafe diagnostic 全候选证据与 superseded 序号唯一性仍存在未处理分支。Findings 仅限 Story 11.9；不涉及 Story 11.10、external drawer、workspace mirrors、fixed-count baseline、report basename、CR producer algorithm、approval policy、build、full suite或 packaging。

## P1 Findings（P1 发现）

### P1-1 — Terminal-state parser 无法读取真实缩进 YAML tracker key

- **Location**：`assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs:643-649`；`_bmad-output/implementation-artifacts/sprint-status.yaml:47,152`；`test/code-review-contract.test.ts:1948-1962`
- **Trigger condition**：production CLI 使用 live `sprint-status.yaml` 的完整 Story key 验证 authentic completed legacy；该 key 位于 `development_status:` 下并带两个空格缩进。
- **Unhandled path**：`trackerHasExactTerminalState()` 的正则从行首直接匹配 key，不接受 YAML mapping 的合法前导缩进。Round 4 helper 却把 sprint fixture 写成顶层 `${storyKey}: done`，因此 focused GREEN 未穿过真实 tracker 形状。只读探针对 live 文件得到 production regex `0` match，而 indentation-aware同 key得到唯一值 `review`。
- **Consequence**：即使 CR06 将 live sprint key 正确更新为 `done` 并记录真实 `afterHash`，production resolver仍会把 authentic `DONE` 判为 invalid，completed legacy → canonical new run在真实 tracker上不可达。
- **Guard sketch**：用 owner-frozen tracker role 解析其实际格式；sprint/workflow YAML允许受控缩进并仍要求完整 key唯一、scalar唯一、terminal value精确，Story Markdown保持独立的 exact parser；fresh CLI测试必须复制真实嵌套 tracker形状。

### P1-2 — Structured classifier 将近似 current 的 malformed round 分隔符当作 unrelated

- **Location**：`resolve-cr-directory.mjs:367-390`；`test/code-review-contract.test.ts:692-720,722-781`
- **Trigger condition**：目录含 `11-9-code-review-summary-20260905-main-round_1.md`（或同 family 的 `round_` / misspelled round delimiter），其余 identity 明确指向 current Story/series。
- **Unhandled path**：文件先无法通过 canonical/superseded pattern；malformed guard又只查字面量 `-main-round-`。只要损坏发生在该 delimiter，本应属于 `malformed-current-intent` 的文件就落入 `unrelated`。只读 resolver探针返回 `ok=true / compatibilityMode=canonical`。
- **Consequence**：损坏的 active current artifact可被静默忽略，runner可能在同目录开启或继续另一条 lifecycle，违反 malformed evidence fail-close。
- **Guard sketch**：在 exact Story + family prefix 后按 tokenized basename grammar判定 current intent；series/date/round/superseded任一结构残缺都归 malformed，仅明确其他 Story、其他 series或ordinary notes归 unrelated。

### P1-3 — Resolver 未验证 review round 从 1 开始连续递增

- **Location**：`resolve-cr-directory.mjs:260-345`；`assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/references/cr-contract.md:53-55`
- **Trigger condition**：legacy-only目录没有 Round 1，却从一组合法 Round 2 current artifact开始；或中间缺 Round N 后存在更高 current/DONE round。
- **Unhandled path**：扫描只计算 `maxRound`、`doneRounds`与 per-family/round cardinality，没有建立 observed round set并验证 `1..maxRound` 连续。只读探针表明仅有合法 Round 2 review artifact的 legacy目录返回 `ok=true / legacy-resume`；若补齐 authentic Round 2 finalizer及其同轮 sources，还可被判 completed。
- **Consequence**：断裂或移除历史轮次的 run仍可恢复，甚至被认证 completed并切到 canonical，破坏 round lineage与不可猜测恢复。
- **Guard sketch**：对所有 current artifact收集 round set，要求最小值为 1 且逐轮无 gap；发现缺口统一进入既有 current-series invalid reason，superseded不独立补齐 current round。

### P1-4 — `trackerChangeSet` 重复字段由后值覆盖后仍可认证

- **Location**：`resolve-cr-directory.mjs:579-603`
- **Trigger condition**：finalizer某个 tracker item重复 `path`、`key`、`beforeHash`、`afterHash`或 `rereadConsistent`，后一个值恰好匹配 frozen binding与当前文件。
- **Unhandled path**：item parser对每个字段直接执行 `values[field[1]] = field[2]`，既不拒绝 duplicate，也不拒绝 unknown extra field。攻击性或损坏证据可先声明冲突值、再用合法值覆盖，随后通过 exact path/key/hash/terminal checks；这与 CLI/frontmatter的 duplicate fail-close边界不一致。
- **Consequence**：语义歧义的 tracker mutation evidence可被认证为 authentic `DONE`，调用方无法唯一重建 CR06 实际声明。
- **Guard sketch**：每个 item使用 exact schema set；遇 duplicate、unknown、missing或乱序 role立即 false，完成后再执行 frozen binding、hash及 terminal-state验证。

### P1-5 — 后置 unsafe candidate 的 diagnostic 遗漏此前已检查候选

- **Location**：`resolve-cr-directory.mjs:82-111`；`cr-contract.md:89-93`
- **Trigger condition**：byte-wise较早的 canonical candidate已安全检查，随后较晚的 legacy candidate为 symlink、non-directory或 inspection failure。
- **Unhandled path**：`!state.safe` 分支立即用 `roundEvidence: [state.evidence]` 返回，丢弃 `inspected` 中此前实际检查的 canonical/legacy evidence。只读探针以 canonical unfinished + 后置 legacy symlink复现：diagnostic只含 legacy `UNSAFE`，不含已检查的 canonical candidate。
- **Consequence**：`roundEvidence`与本次实际检查的候选集合不再双向一致，dual-directory阻断证据会隐藏 canonical一侧状态。
- **Guard sketch**：unsafe return使用 `[...inspected.map(candidate => candidate.evidence), state.evidence]`，保持 candidate byte order；为 first/middle/last unsafe位置冻结候选集合与 evidence exact equality。

## P2 Findings（P2 发现）

### P2-1 — Superseded 序号未纳入 identity，重复或跳号历史可同时通过

- **Location**：`resolve-cr-directory.mjs:375-385,265,291-330`；`cr-contract.md:115-120`
- **Trigger condition**：同一 family/round存在两个不同 date basename但都使用 `-superseded-1.md`，或首个历史文件直接使用 `-superseded-2.md`，且都绑定同一 current basename。
- **Unhandled path**：classifier解析 `supersededIndex`后未把它保存到 identity；后续 `superseded` 数组只验证 type、round与 `supersededBy`，不验证同 family/round index唯一、从 1 连续。只读探针表明两个 `superseded-1` 文件并存仍返回 `ok=true`。
- **Consequence**：历史 replacement顺序无法唯一审计，same-round重建证据可出现重复 ordinal而不被发现。
- **Guard sketch**：保留 `supersededIndex`，按 artifactType + round要求 index从 1连续且唯一；重复、gap或非单调集合使用既有 invalid reason阻断。

## Closed Boundaries（已关闭边界）

- production CLI已能传输 story/sprint/workflow frozen bindings，并拒绝 unknown、duplicate、partial、empty与 workflow optional矛盾参数；本轮缺口是 live nested YAML的 value解析。
- ordinary notes、合法 current、五类合法 superseded及常见 malformed `-main-round-...` 主路径已结构化分类；同 family/round多个 current与 DONE/non-DONE finalizer冲突已阻断。
- canonical invalid branch已包含 canonical/legacy全体 `roundEvidence`；本轮缺口限定于循环中后置 unsafe candidate的早退分支。
- leaf adapter已冻结完整 `ok=true / issue=null` 且逐 CR01–06 callback语义关闭；未发现 Round 4 leaf finding复现。
- detector的 shell/template/JS/array/config/split × `title/name/slug/filename` table-driven matrix当前通过；本轮未发现新的 bounded active title-bearing绕过。

## Verification And Boundary（核证与边界）

- `npx vitest run test/code-review-contract.test.ts --reporter=dot`：`44 passed / 4 todo`。
- 只读 live tracker正则探针：Story 11.9 sprint key的 production regex `0` match；允许 YAML indentation 后为唯一 `1` match，值为 `review`。
- 只读 resolver探针：Round 2-only legacy返回 `legacy-resume`；`round_1` malformed current返回 canonical success；canonical unfinished + 后置 legacy symlink的 diagnostic仅含后者；重复 `superseded-1` 返回 canonical success。
- 未运行 build、full suite、packaging或 canonical governance；未读取/修改 Story 11.10或 external drawer。
- 本层除创建本报告外未修改 source、tests、fixtures、Story、tracker、completion gate、root goal records或既有 CR artifacts。

## Edge JSON（边界结果）

```json
[
  {"location":"resolve-cr-directory.mjs:643-649","trigger_condition":"Indented live YAML tracker key reaches terminal verification","guard_snippet":"parse role-specific YAML indentation while requiring one exact scalar","potential_consequence":"Authentic completed legacy is permanently blocked"},
  {"location":"resolve-cr-directory.mjs:367-390","trigger_condition":"Current filename misspells the round delimiter","guard_snippet":"classify exact family near-misses as malformed current intent","potential_consequence":"Damaged current evidence is silently ignored"},
  {"location":"resolve-cr-directory.mjs:260-345","trigger_condition":"Observed current rounds begin at two or contain gaps","guard_snippet":"require observed rounds equal every integer from one through maxRound","potential_consequence":"Broken lineage resumes or completes as authentic"},
  {"location":"resolve-cr-directory.mjs:579-603","trigger_condition":"Tracker change item repeats a field before a valid value","guard_snippet":"reject duplicate unknown or missing tracker item fields","potential_consequence":"Ambiguous mutation evidence authenticates DONE"},
  {"location":"resolve-cr-directory.mjs:82-111","trigger_condition":"Unsafe candidate appears after a safely inspected candidate","guard_snippet":"include inspected evidence before the unsafe candidate evidence","potential_consequence":"Diagnostic omits an actually inspected directory"},
  {"location":"resolve-cr-directory.mjs:375-385","trigger_condition":"Superseded history repeats or skips its ordinal index","guard_snippet":"retain index and require unique consecutive ordinals per family round","potential_consequence":"Replacement history cannot be uniquely audited"}
]
```

## Exclusions（明确排除）

- 未审查或建议修改 Story 11.10 generic inventory。
- 未扫描或纳入 `assets/source/speclite/core-skills/speclite-drawer-er-modeler/` 及 zip。
- 未运行 `npm run build`、full suite、packaging或 canonical governance。
- 未建议修改 report basenames、CR producer/supersession algorithm、round numbering、approval/confirmation policy或 dependencies。
