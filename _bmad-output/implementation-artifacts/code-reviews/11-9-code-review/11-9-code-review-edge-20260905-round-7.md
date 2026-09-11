---
schemaVersion: "speclite.code-review.layer.v1"
storyKey: "11-9-normalize-code-review-artifact-directories-by-story-id"
round: 7
layer: "edge"
result: "FAIL"
generatedAt: "2026-09-04T22:45:38.000Z"
sourceSkill: "bmad-review-edge-case-hunter"
headSha: "ff7528d3f9ec34072bb669ee79f7569345c23d47"
---

# Story 11.9 Code Review Edge Hunter（边界路径审查）

## Verdict（结论）

`FAIL`。发现 `2` 项 P1；Round 5 起已确认的 `supersededIndex` identity/continuity 缺口继续维持 `1` 项 carried deferred P2，不升级、不混入当前 patch。Round 6 Fixer 已关闭其明确覆盖的普通 mapping block scalar、Markdown fence与 body-only `trackerChangeSet` placement，但当前 bounded scanner 仍遗漏合法 YAML block scalar header 分支，且 frontmatter change-set parser 接受 YAML 禁止的 tab indentation。两项只读探针均返回 `accepted=true`，因此不是测试命名或文档表述问题。

Findings 仅限 Story 11.9 current resolver、shared CR contract与 focused regression。未读取或归因 Story 11.10；未扫描 external drawer；未运行 build、full suite、packaging或 canonical governance。

## P1 Findings（P1 发现）

### P1-1 — YAML block-scalar scanner 漏掉 sequence、tag 与 anchor header

- **Location**：`assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs:698-724`；`test/code-review-contract.test.ts:1024-1062`
- **Trigger condition**：sprint/workflow tracker 的 exact terminal key 仅出现在 `- |` / `- >-` sequence scalar，或 `notes: &anchor |` / `notes: !!str >-` 的 scalar body 中。
- **Unhandled path**：`trackerLinesOutsideYamlBlockScalars()` 只把带 colon 且 scalar indicator 紧跟 value 起点的行识别为 header。合法 YAML 的 sequence scalar没有 colon；tag/anchor node properties可位于 `|`/`>`之前，也不匹配当前 header regex。随后 scalar body被加入 `visible`，任意空格缩进的 exact key被 `candidatePattern` 当作真实 mapping entry。对 current private function 的只读探针分别输入 `notes:\n  - |\n    {storyKey}: done`、`notes: &copy |\n  {storyKey}: done`、`notes: !!str >-\n  {storyKey}: done`，全部得到 `accepted=true`。Round 6 regression仅枚举 `notes: ${indicator}`，没有穿过 sequence/node-property header分支。
- **Consequence**：真实 owning key缺失时，hash-consistent finalizer仍可用 scalar正文伪装 terminal tracker，completed legacy被认证并开启 canonical new run。
- **Guard sketch**：识别 YAML block scalar 的完整合法 header族（含 sequence indicator与 tag/anchor node properties），或使用等价 bounded tokenization；所有 scalar正文必须排除，同时保留 scalar结束后的真实 mapping正向可达。

### P1-2 — `trackerChangeSet` 接受 tab-indented 非法 YAML frontmatter

- **Location**：`resolve-cr-directory.mjs:570-625`；`test/code-review-contract.test.ts:1087-1140`
- **Trigger condition**：leading frontmatter中的每个 role item与字段使用 tab或tab/space混合缩进，但字段、顺序、path/key/hash/value均正确。
- **Unhandled path**：bounded region已限制到 leading frontmatter，但 capture允许 `^[ \t]+`，item split和field regex又使用 `\s*`，没有拒绝 YAML indentation中的 tab。只读调用 current `validTrackerChangeSet()`，以三项 `\t- path` / `\t  key` / hashes构造change-set并提供真实tracker bytes，得到 `accepted=true`；该 frontmatter并不是可解析的 YAML structured schema。Round 5 exact/unique/order regressions与Round 6 placement regressions都只使用合法space indentation，因此未覆盖这条 lexical boundary。
- **Consequence**：invalid frontmatter bytes可被resolver当成规范CR06 mutation evidence，shared schema与实际认证语言分裂，历史 `DONE`真实性门禁 fail-open。
- **Guard sketch**：在解析前拒绝 frontmatter indentation tab，并将 item/field indentation冻结为合法space-only YAML层级；随后继续执行既有exact field/order/role/hash/terminal验证。

## P2 Findings（P2 发现）

### P2-1 — `supersededIndex` identity/continuity 继续维持 carried deferred

- **Location**：`resolve-cr-directory.mjs:380-389,266,292-332`；`assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/references/cr-contract.md:113-120`
- **Trigger condition**：同family/round历史副本重复使用同一ordinal，或首个副本从大于1的ordinal开始。
- **Unhandled path**：classifier解析后仍未把 `supersededIndex` 纳入identity；historical validation不验证ordinal从1开始、唯一且连续。
- **Consequence**：replacement timeline不能唯一审计，但不改变current artifact cardinality、consumer或canonical write target。
- **Disposition**：严格沿用Round 5/6 Evaluator的deferred P2策略，交由CR05登记；不得在本轮P1 Fixer中实现或扩展producer retry/supersession algorithm。

## Prior Closure Audit（既有闭环边界审计）

- Round 6 的普通 `notes: |/|- /|+/>/>-/>+` 与显式indent indicator正文排除在其fixture shape内已关闭；本轮P1-1只针对此前未枚举的sequence与node-property header，不重开已验证分支。
- Round 6 的backtick/tilde、closed/unclosed Markdown fence排除已关闭；当前路径遍历未发现新的fence反例。
- body-only `trackerChangeSet`失败、合法frontmatter后的body同名block不参与认证已关闭；P1-2只针对受界frontmatter内部的YAML lexical validity，不重开placement finding。
- Round 5 的malformed round delimiter、current rounds精确`1..N`、item exact/unique/order、unsafe candidate完整`roundEvidence`与classified candidate ledger未出现新反例。
- Current completion gate `generatedAt=2026-09-04T22:42:04.000Z`晚于Round 6 Fix Summary与affected evidence，Round 6 gate刷新顺序成立；但本轮Reviewer为FAIL，未来Fixer与latest Evaluator之后仍须由outer owner刷新最终gate。此为既定顺序义务，不作为新增finding。

## Verification And Boundary（核证与边界）

- `npx vitest run test/code-review-contract.test.ts --reporter=dot`：`49 passed / 4 todo`；现有绿灯没有覆盖上述两个反例。
- Private-function read-only probe：sequence/tag/anchor block scalar body中的exact sprint key均返回 `accepted=true`。
- `validTrackerChangeSet()` read-only probe：三role tab-indented change-set在真实tracker bytes与正确whole-file hashes下返回 `accepted=true`。
- Allowed source/test `git diff --check`：PASS。
- Live Story 11.9 status=`review`；Round 6 summary/evaluation/Fix Summary链存在，current completion gate已记录Round 6 evidence。
- 本层除创建本报告外未修改source、tests、fixtures、contract、Story、tracker、completion gate、root goal records或既有CR artifacts。
- 未运行`npm run build`、full suite、packaging或canonical governance；未读取/修改Story 11.10或external drawer。

## Edge JSON（边界结果）

```json
[
  {"location":"resolve-cr-directory.mjs:698-724","trigger_condition":"Terminal key appears inside sequence or decorated YAML block scalar","guard_snippet":"tokenize sequence and tag or anchor block scalar headers before scanning mappings","potential_consequence":"Non-terminal trackers authenticate completed legacy"},
  {"location":"resolve-cr-directory.mjs:585-604","trigger_condition":"Tracker change-set uses tab indentation inside leading frontmatter","guard_snippet":"reject tabs and require space-only YAML item and field indentation","potential_consequence":"Invalid frontmatter authenticates CR06 tracker evidence"},
  {"location":"resolve-cr-directory.mjs:380-389","trigger_condition":"Superseded history repeats or skips its ordinal index","guard_snippet":"defer unique consecutive supersededIndex validation to tracked TODO","potential_consequence":"Replacement history remains ambiguously ordered"}
]
```

## Exclusions（明确排除）

- 未审查或建议修改Story 11.10 generic inventory。
- 未扫描或纳入`assets/source/speclite/core-skills/speclite-drawer-er-modeler/`及zip。
- 未运行build、full suite、packaging或canonical governance。
- 未建议修改report basenames、CR producer/supersession algorithm、round numbering、approval policy、dependencies或fixed-count baselines。
