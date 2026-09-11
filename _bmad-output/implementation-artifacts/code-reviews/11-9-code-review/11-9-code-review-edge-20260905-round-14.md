---
schemaVersion: "speclite.code-review.layer.v1"
storyKey: "11-9-normalize-code-review-artifact-directories-by-story-id"
round: 14
layer: "edge"
result: "FAIL"
generatedAt: "2026-09-05T01:10:11.000Z"
sourceSkill: "bmad-review-edge-case-hunter"
modelUsed: "OpenAI GPT-5.6 Sol (gpt-5.6-sol)"
headSha: "ff7528d3f9ec34072bb669ee79f7569345c23d47"
---

# Story 11.9 Code Review Edge Hunter（边界路径审查）

## Verdict（结论）

`FAIL`。发现 `2` 项 fresh P1；Round 5 起已确认的 `supersededIndex` identity/continuity 缺口继续维持 `1` 项 carried deferred P2，不升级、不混入当前 patch。Round 13 Fixer 已在授权 fixture shape 内关闭跨物理行第二 YAML property、flow plain scalar literal quote、raw closure 后的 later-comment raw reopening，以及非法 explicit-value fixture。机械遍历这些修复的相邻分支后，current production scanner 仍证明：flow collection 内的 tag/anchor property 会过早结束 node-boundary state，使其后的 quoted scalar 内部 delimiter 被误当 collection closure并泄露伪 terminal；raw closure 后隔着 visible text 出现第二个 closed comment时，第二个 comment 正文中的 bounded raw opening会被当作真实 opening，错误遮蔽后续真实 Story terminal。

Findings 仅限 Story 11.9 current resolver、focused tests、shared contract 与 Round 13 修复边界。未读取或归因 Story 11.10；未扫描 external drawer；未纳入 workspace mirrors 或 fixed-count baseline；未运行 build、full suite、packaging 或 canonical governance。

## P1 Findings（P1 发现）

### P1-1 — Flow node property 后的 quoted scalar 未进入 quoted state

- **Location**：`assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs:1031-1083`；`test/code-review-contract.test.ts:2515-2539`
- **Trigger condition**：合法 YAML flow sequence/mapping 的 node 先含 tag 或 anchor，再含 multiline quoted scalar，且 quoted 正文包含 `]` / `}` 后出现与 tracker key 同名文本，例如 `notes: [!str "start]` 后续缩进行为 `owner: done`。
- **Unhandled path**：Round 13 新增的 `nodeBoundary` 在 collection opening / comma / mapping value boundary 为 `true`，但 scanner 读取 `!tag` 或 `&anchor` 的第一个非空字符后立即置为 `false`。随后合法 quoted scalar opening不再进入 `quote` state；quoted正文内的 `]` / `}` 被当作 collection closure。若 delimiter 位于物理行尾，flow state立即归零，下一缩进行的 `owner: done` 被暴露为真实 terminal。Current production-function probes 对 sequence tag、sequence anchor、mapping tag及 single-quoted tag 四种合法 bytes均返回 terminal=`true`；项目现有 `yaml@2.9.0` 对四种输入均返回 zero parse errors。现有 Round 13 regression只覆盖无 property 的 flow plain/quoted scalar，以及 flow opening前位于外层 header 的 tag/anchor，不覆盖 collection内部 property→quoted node。
- **Consequence**：non-owning YAML value可认证 sprint/workflow completion，使 unfinished legacy被误判完成并错误开启 canonical new run。
- **Guard sketch**：仅在既有 bounded flow scanner 内识别 node-boundary处的单个 `!tag` / `&anchor` property token，并在其后仍允许既有 quoted/flow node opening；duplicate/third property、unclosed quote、mismatched delimiter继续fail-close。补 tag/anchor、single/double quote、sequence/mapping、sprint/workflow、正文 delimiter与真实 owner controls；不得引入通用 YAML parser、新 dependency或第二 tracker authority。

### P1-2 — Later-comment 后的第二 comment 正文被误读为 raw opening

- **Location**：`resolve-cr-directory.mjs:763-810`；`test/code-review-contract.test.ts:2541-2558,2591-2621`
- **Trigger condition**：bounded raw region闭合后先有 visible text和一个 closed comment，随后再有 visible text与第二个 closed comment；第二个 comment正文包含 `<pre>` 或 `<code>`，下一物理行存在唯一真实 `Status: done`。
- **Unhandled path**：Round 13 修复在 `:797-802` 找到第一个 later comment后调用 `scanHtmlCommentTransitions()`；该 helper只连续消费由空白分隔的 comments，遇到第二段 visible text即返回。控制流随后回到 raw tag loop，直接寻找下一个 `<`，不会重新进入 comment transition，因此把第二个 comment正文中的 `<code>` / `<pre>` 当作真实 raw opening并保留非空 tag stack。Current production-function probes 对 `pre→comment→visible→comment(<code>)` 与 `code→comment→visible→comment(<pre>)` 均错误返回 terminal=`false`、visible lines=`[]`；相邻的无第二 raw token control与仅由空白分隔的 consecutive-comment control均返回 terminal=`true`。
- **Consequence**：合法 Story 中唯一真实、未缩进 terminal被错误遮蔽，authentic completed legacy无法canonical restart。
- **Guard sketch**：在 raw stack归零后的既有 bounded suffix loop中交替消费 visible segment与完整 closed/unclosed comment transition；comment正文永不交给 `pre` / `code` recognizer，comment外真实 opening仍维持当前 bounded行为。补 `pre`/`code`交叉、两个comments间空白/非空visible、comment内 raw token、最终closed/unclosed及后续真实 `Status` controls；不得扩大 element inventory或实现通用 HTML/CommonMark parser。

## P2 Findings（P2 发现）

### P2-1 — `supersededIndex` identity/continuity 继续维持 carried deferred

- **Location**：`resolve-cr-directory.mjs:266,292-332,380-389`；`speclite-code-review-contract/references/cr-contract.md:113-120`
- **Trigger condition**：同 family/round 历史副本重复使用同一 ordinal，或首个副本从大于 `1` 的 ordinal 开始。
- **Unhandled path**：classifier解析后仍未把 `supersededIndex` 纳入 historical identity；validation不验证 ordinal从`1`开始、唯一且连续。
- **Consequence**：replacement timeline不能唯一审计，但不改变current artifact cardinality、consumer、canonical/legacy continuation或runtime write target。
- **Disposition**：严格沿用 Round 5–13 Evaluator 的 deferred P2 策略，交由 CR05 登记；不得在本轮 P1 Fixer 中实现或扩展 producer retry/supersession algorithm。

## Prior Closure Audit（既有闭环边界审计）

- Round 13 跨物理行第二 YAML property在已枚举外层 property composition内持续闭环；P1-1只针对 flow collection内部 node property后的 quoted scalar，不重开 pending-property finding。
- Round 13 flow plain scalar literal quote持续闭环；P1-1只针对 `!tag` / `&anchor` 后的真实 quoted-node opening，不把 plain正文中的 literal quote重新解释为 opening。
- Round 13 raw closure→visible→closed comment→new raw opening持续闭环；P1-2只针对第一 later comment已关闭后、隔着第二段 visible text出现第二 comment的重复transition，不推翻当前单comment handoff。
- Round 13 explicit-value fixture当前由 `yaml@2.9.0` validity/structure assertion覆盖；未发现该test-only finding复现。
- Exact-current classifier、other-series isolation、filesystem containment、candidate byte ordering、legacy-only/canonical/dual/multi recovery、unsafe evidence、stable redacted diagnostic与blocked-preflight zero mutation矩阵未发现新反例。
- Current rounds `1..N`、artifact/frontmatter identity、source/evaluation/CR04/CR05 lineage、supersession binding、trackerChangeSet exact schema与whole-file hash未出现新反例；`supersededIndex`仅维持 carried P2。

## Owner Gate（Owner 门禁）

`NONE`。两项 P1 的 observable behavior已由 Story 11.9 与 shared CR contract冻结：terminal只能来自唯一、可解析、role-owned scalar；flow quoted value及HTML comment正文不得成为tracker authority，真实comment外terminal必须保持可达。修复只能限制在现有 bounded flow node-property lexical state、bounded raw/comment repeated transition及focused regression；不得引入通用 YAML/HTML/CommonMark parser、修改tracker schema、扩展element inventory、改变report basename/round/approval，或纳入Story 11.10/drawer。若无法在这些边界内保持plain literal quote、outer property composition、单comment raw reopening、unclosed/mismatched controls与真实visible owner，必须停止并返回fresh Owner Gate。

## Verification Summary（验证摘要）

- `npx vitest run test/code-review-contract.test.ts --reporter=dot`：`1 file passed / 69 passed / 4 todo`；该绿灯不含本轮两个 fresh反例。
- `node --check assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs`：PASS。
- Allowed slice `git diff --check`（resolver、focused test、current completion gate）：PASS。
- YAML production-function probes：sequence tag、sequence anchor、mapping tag及single-quoted tag四种合法flow bytes均false-accept quoted正文中的伪owner；`yaml@2.9.0` parse均为zero errors。
- Story production-function probes：raw closure后`visible → closed comment → visible → comment(<code/pre>)`错误遮蔽后续真实`Status`；无第二raw token及空白分隔consecutive-comment controls保持terminal=`true`。
- Current resolver/test/completion-gate SHA-256分别为`93a448170e418fc0120b0ee0a6ccc84a3df29a83805dc83ba23ac38dcc24d3bd`、`bd6bf9e69bceaa3eb2d9ec0d1a5f03f1da3a2a300fe4ae1ee3a11132ee611fe0`、`819cc9bc555bba636d1948fe48c3003053c08782f681625e79a0ad86f3638af2`；current HEAD=`ff7528d3f9ec34072bb669ee79f7569345c23d47`。
- Current completion gate `generatedAt=2026-09-05T01:06:39.000Z`晚于 Round 13 source/test mutation并记录`69 passed / 4 todo`；其provenance/freshness成立，但本轮fresh反例推翻completion语义充分性。后续source/test mutation后仍须由outer owner重生gate。
- 按bounded reviewer范围未运行build、full suite、packaging或canonical governance；未读取或归因Story 11.10/drawer。

## Edge JSON（边界发现 JSON）

[
  {
    "location": "resolve-cr-directory.mjs:1031-1083",
    "trigger_condition": "Flow property precedes quoted scalar containing collection delimiter",
    "guard_snippet": "preserve nodeBoundary after one bounded tag or anchor property",
    "potential_consequence": "Quoted value can impersonate tracker terminal"
  },
  {
    "location": "resolve-cr-directory.mjs:763-810",
    "trigger_condition": "Visible text separates two comments after raw closure",
    "guard_snippet": "consume every bounded comment before scanning raw tags",
    "potential_consequence": "Real Story terminal can be hidden"
  }
]

## Final Verdict（最终裁决）

- **结论**：`FAIL / FIX_REQUIRED`
- **阻塞项**：`2` 个 fresh P1
- **非阻塞项**：`1` 个 carried deferred P2（`supersededIndex`，CR05 TODO）
- **Owner Gate**：`NONE`
- **下一步**：交由 Round 14 aggregator与fresh Evaluator独立确认、合并或驳回；任何Fixer授权必须保持bounded scanner + focused regression，且不得混入P2、Story 11.10或drawer。

## Boundary Audit（边界审计）

- 本层仅创建本 Round 14 edge report；未修改source、tests、fixtures、contract、Story、tracker、completion gate、goal records或既有CR artifacts。
- 未审查或建议修改 Story 11.10 generic inventory。
- 未扫描或纳入`assets/source/speclite/core-skills/speclite-drawer-er-modeler/`及zip、workspace mirrors或fixed-count baselines。
- 未运行build、full suite、packaging或canonical governance。
