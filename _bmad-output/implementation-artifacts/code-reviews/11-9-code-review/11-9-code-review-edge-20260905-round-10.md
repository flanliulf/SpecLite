---
schemaVersion: "speclite.code-review.layer.v1"
storyKey: "11-9-normalize-code-review-artifact-directories-by-story-id"
round: 10
layer: "edge"
result: "FAIL"
generatedAt: "2026-09-04T23:45:45.000Z"
sourceSkill: "bmad-review-edge-case-hunter"
modelUsed: "OpenAI GPT-5.6 Sol (gpt-5.6-sol)"
headSha: "ff7528d3f9ec34072bb669ee79f7569345c23d47"
---

# Story 11.9 Code Review Edge Hunter（边界路径审查）

## Verdict（结论）

`FAIL`。发现 `2` 项 fresh P1；Round 5 起已确认的 `supersededIndex` identity/continuity 缺口继续维持 `1` 项 carried deferred P2，不升级、不混入当前 patch。Round 9 Fixer 已在其授权 fixture shape 内关闭 sequence / explicit mapping multiline quoted value、bare/comment-separated explicit key、multiline `pre` / `code` opening、closure-to-comment handoff、illegal closing attributes，以及 numeric/hyphenated/empty date slot和 `_` separator；focused regression 当前为 `56 passed / 4 todo`。但是机械遍历修复后状态机与 classifier 的相邻分支后，current production probes 仍证明：flow collection 内的 multiline quoted scalar 正文可冒充 terminal tracker key；known-family exact current series 的 alphabetic date slot或 `.` date separator会被静默归为 unrelated。

Findings 仅限 Story 11.9 current resolver、focused tests、shared contract 与 Round 9 修复边界。未读取或归因 Story 11.10；未扫描 external drawer；未纳入 workspace mirrors 或 fixed-count baseline；未运行 build、full suite、packaging 或 canonical governance。

## P1 Findings（P1 发现）

### P1-1 — YAML flow collection 的 multiline quoted scalar 正文仍可冒充 terminal tracker key

- **Location**：`assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs:852-939`；`test/code-review-contract.test.ts:1244-1289`
- **Trigger condition**：sprint/workflow tracker 将 non-owning multiline quoted scalar 放在 flow sequence或flow mapping value中，例如 `notes: ["example\n  {storyKey}: done\n  ending"]` 或 `notes: {x: "example\n  {storyKey}: done\n  ending"}`，且真实 owning key 缺失。
- **Unhandled path**：`yamlQuotedScalarOpening()`只在普通 mapping value直接以 quote开头、block sequence item直接以quote开头，或explicit mapping value直接以quote开头时建立`quoted` state；mapping value以`[` / `{`开始后才进入quoted member的flow collection分支没有状态。current production `trackerHasExactTerminalState()`只读探针对上述两种有效YAML均返回`true`；独立`yaml`解析分别只得到`notes` array/object，顶层不存在目标owning key。
- **Consequence**：真实 owning tracker key 缺失时，non-owning flow collection正文可配合 authentic whole-file hash认证completed legacy，并错误开启canonical new run。
- **Guard sketch**：仅在现有role-specific YAML scanner内为mapping value的bounded flow `[` / `{` region维护quote-aware multiline state，或对无法唯一闭合的flow region fail-close；闭合后真实同级/嵌套owner必须继续可达，不引入通用YAML parser、alias/tag展开或新dependency。

### P1-2 — Alphabetic date slot与 `.` separator仍使exact current-series artifact落入unrelated

- **Location**：`resolve-cr-directory.mjs:372-401`；`test/code-review-contract.test.ts:684-790`；`assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/references/cr-contract.md:81`
- **Trigger condition**：canonical或legacy目录包含exact Story + known family + exact caller-frozen series，但date slot含alphabetic typo，或date-to-series separator为`.`，例如`11-9-code-review-summary-2026O905-main-round-1.md`或`11-9-code-review-summary-20260905.main-round-1.md`。
- **Unhandled path**：完整canonical/complete-name grammar先失败；malformed fallback仅接受remainder开头的`[0-9-]*[-_]main`，因此含`O`的date slot与`.` separator均无法到达`malformed-current-intent`。current production resolver临时目录探针对两种basename均返回`ok=true / compatibilityMode=canonical / issue=null`，即使文件正文只是malformed evidence。Round 9新增matrix只覆盖numeric/hyphenated/empty date与`_` separator。
- **Consequence**：损坏或半写入的active current artifact可与新lifecycle静默共存，绕过current-series evidence fail-close、stable diagnostic与zero-write stop。
- **Guard sketch**：在exact Story + known family prefix后从右侧bounded识别exact `reviewSeries`与`round` intent，再验证date槽及其separator；完整合法other series继续按完整槽位exact-isolated，避免substring规则，也不改变basename、round或producer算法。

## P2 Findings（P2 发现）

### P2-1 — `supersededIndex` identity/continuity继续维持carried deferred

- **Location**：`resolve-cr-directory.mjs:266,292-332,380-389`；`speclite-code-review-contract/references/cr-contract.md:113-120`
- **Trigger condition**：同family/round历史副本重复使用同一ordinal，或首个副本从大于1的ordinal开始。
- **Unhandled path**：classifier解析后仍未把`supersededIndex`纳入historical identity；validation不验证ordinal从1开始、唯一且连续。
- **Consequence**：replacement timeline不能唯一审计，但不改变current artifact cardinality、consumer、canonical/legacy continuation或runtime write target。
- **Disposition**：严格沿用Round 5–9 Evaluator的deferred P2策略，交由CR05登记；不得在本轮P1 Fixer中实现或扩展producer retry/supersession algorithm。

## Prior Closure Audit（既有闭环边界审计）

- Round 9 sequence与explicit mapping direct multiline quoted values、bare/comment-separated explicit key在其fixture shape内已关闭；P1-1仅针对mapping value先进入flow collection、再进入multiline quote的相邻分支，不重开direct quoted scalar finding。
- Round 9 multiline raw opening、closure-to-comment handoff与illegal closing attributes持续闭环；机械遍历pending/open/raw/close/comment状态未发现新的可复现Story status impersonation。
- Round 9 numeric/hyphenated/empty date slot与`_` separator持续闭环；P1-2针对同一contract下未被current fallback覆盖的alphabetic date与`.` separator。完整合法`pre-main`、`main-v2`、`next` other series仍保持unrelated。
- Filesystem containment、candidate ordering、legacy-only/canonical/dual/multi recovery、unsafe evidence、redacted diagnostic与blocked-preflight zero mutation矩阵未发现新反例。
- Round 5–9 current rounds精确`1..N`、artifact/frontmatter identity、supersession binding与trackerChangeSet exact schema未出现新反例；`supersededIndex`仅维持carried P2。

## Owner Gate（Owner 门禁）

`NONE`。两项P1的observable behavior已由Story 11.9与shared CR contract冻结：terminal只能来自真实role-owned scalar；当前Story/family/series的近似current basename必须fail-close。修复只能限于现有role-specific bounded YAML scanner、bounded filename classifier与focused regression；不得引入通用YAML parser、修改tracker/reviewSeries schema、扩展producer/supersession algorithm，或纳入Story 11.10/drawer。若无法在这些边界内同时保持flow collection闭合后的真实owner与完整合法other-series controls，必须停止并返回fresh Owner Gate。

## Verification Summary（验证摘要）

- `npx vitest run test/code-review-contract.test.ts --reporter=dot`：`56 passed / 4 todo`；该绿灯不含本轮两个fresh反例。
- `node --check assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs`：PASS。
- Allowed slice `git diff --check`：PASS。
- YAML production-function probe：flow sequence与flow mapping两种有效YAML均由`yaml`解析为仅含`notes`的non-owning结构，但current `trackerHasExactTerminalState(..., role="sprint")`均返回`true`。
- Classifier/resolver production probe：alphabetic date与`.` separator两个canonical basename均返回`ok=true / compatibilityMode=canonical / issue=null`。
- Current completion gate `generatedAt=2026-09-04T23:41:31.000Z`晚于Round 9 Fix Summary并记录focused green；本轮fresh反例推翻其completion语义充分性，但不质疑其既有刷新顺序。
- Current HEAD=`ff7528d3f9ec34072bb669ee79f7569345c23d47`；审查对象包含current uncommitted Story 11.9 slice。

## Boundary Audit（边界审计）

- 本Edge Hunter仅创建本Round 10 edge report；未修改source、tests、fixtures、contract、Story、tracker、completion gate、goal records或既有CR artifacts。
- 未审查或建议修改Story 11.10 generic inventory。
- 未扫描或纳入`assets/source/speclite/core-skills/speclite-drawer-er-modeler/`及zip、workspace mirrors或fixed-count baselines。
- 未运行build、full suite、packaging或canonical governance。
