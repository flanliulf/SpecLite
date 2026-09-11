---
schemaVersion: "speclite.flow-gate-report.v2"
mode: "story-completion"
target: "11-9-normalize-code-review-artifact-directories-by-story-id"
storyKey: "11-9-normalize-code-review-artifact-directories-by-story-id"
result: "PASS_EQUIVALENT"
generatedAt: "2026-09-07T04:45:00.000Z"
handoffContractVersion: "speclite.story-completion-handoff.v1"
foundationPrerequisiteStatus: "PASS"
foundationPrerequisiteRefs: "Story 11.1-11.8 completion gates allow continuation; Story 11.9 story-kickoff gate result=PASS"
closureOwnerCheckStatus: "PASS"
closureOwnerRefs: "Epic 11 Story 11.9; PRD FR23g; shared speclite-code-review-contract"
sourceSkill: "speclite-flow-gate"
---

# Flow Gate Report: 11-9-normalize-code-review-artifact-directories-by-story-id

## Summary（摘要）

- Result: `PASS_EQUIVALENT`
- Model Used: `GPT-5`
- Story Status Target: `review`
- Kickoff: exact target-matched v2 gate `PASS`；legacy-only write target 与 dual-directory diagnostic owner/stable contract 均已唯一化，无 `DECISION_NEEDED`。
- Equivalence basis: Story 11.9 focused、affected、build、docs、packaging、canonical strict 与 diff evidence 均满足 Story contract；full suite 的十二项非绿均来自范围外 `speclite-drawer-er-modeler` 令固定数量 `core=18 -> 19`、`total=68 -> 69`。

## Contract Evidence（契约证据）

- PASS：shared resolver 只接受正整数字段组成的 `storyId`（如 `11.9` / `11-9`），统一输出 `{implementation_artifacts}/code-reviews/11-9-code-review/`；title、slug、filename、中文、空格、标点与 traversal 均不是 fallback source。
- PASS：runner 在 Story 开始阶段仅调用一次 resolver，并冻结、显式传递同一 project-relative `crDir` 给 CR01–06；review、evaluation、fix、rules、TODO、finalizer、`.tmp/` 与 goal records 不再由下游重新推导。
- PASS：legacy-only 且存在唯一 unfinished run 时选择该 legacy directory，并以 `compatibilityMode=legacy-resume` 原位继续；不创建 canonical sibling、不迁移、不重命名、不拆轮。仅 completed legacy 存在时，新 run 使用 canonical directory。
- PASS：canonical 与 unfinished legacy 并存、多个 unfinished legacy、或 round evidence 不安全时，由 shared CR-local contract 发出 `cr-directory.ambiguous-resume-root`，固定 `category=lifecycle`、`severity=error`、`continuation=block`。
- PASS：ambiguity details 仅包含 `storyId`、project-relative `canonicalCrDir`、排序去重后的 `legacyCrDirs`、`reviewSeries`、structured `roundEvidence` 与 stable `reason`；不包含 absolute/home/temp/raw/stack/random/timestamp。
- PASS：ambiguity 在 artifact、goal record、temp、progress 与 tracker write 前停止；filesystem snapshot 与 progress mutation 测试为零变化。
- PASS：latest requested-series round 决定 unfinished/completed；较早 `DONE` finalizer 不会掩盖较晚 unfinished round。
- PASS：CR01–06 中英文入口和 workflow 均声明 runner mode 必传 `crDir`、manual mode 只调用一次 shared resolver，且不得由 Story title、slug 或 filename 重新推导。
- PASS：report basenames、CR algorithm、round numbering 与 approval rules 未修改；existing legacy directories 保持原位。
- PASS：active title-bearing directory expression negative scan 通过；保留项仅限明确的 legacy compatibility 语义与测试证据。
- PASS：fresh install 的 `.agents` / `.claude` resolver bytes、executable mode 与 CLI probe 与 canonical source 一致。
- PASS：未修改 `SPEC 07`，因为该 ambiguity 是 CR workflow-local continuation diagnostic，不是 project validation taxonomy issue。
- PASS：未修改 Story 11.10、drawer/zip、workspace mirrors、fixed-count assertions 或 root-owned `11-9-code-review` goal records。

## Verification（验证）

- Focused final：Round23 Fixer、Round24 Reviewer与root current full均通过 `test/code-review-contract.test.ts` 的 `97 tests passed; 4 todo`。
- Focused coverage：numeric-only normalization、arbitrary title isolation、traversal rejection、single resolver call、CR01–06 propagation、goal records、legacy-only resume、completed legacy canonical restart、latest-round detection、dual/multi ambiguity stable/redacted/zero-write、active negative scan、installed resolver bytes/mode/probe。
- Affected exact command：`npx vitest run test/code-review-contract.test.ts test/config-initialization.test.ts test/runtime-structure.test.ts test/fixture-release-gates.test.ts test/source-and-modules.test.ts test/skill-artifact-loop.test.ts --reporter=dot`。
- Affected matrix：`3 files passed / 3 failed; 147 tests passed / 4 failed / 4 todo`；四项非绿仅为外部 drawer fixed-count drift。
- Affected run evidence：start UTC `2026-09-07T04:27:21Z`，recorded UTC `2026-09-07T04:27:47Z`，HEAD=`ff7528d3f9ec34072bb669ee79f7569345c23d47`，包含当前 uncommitted Epic11 worktree。
- Round23：单predicate `reviewMutationTime >= latestPriorFixMutationTime`，单变量真实RED→GREEN及equal/after/no-prior正控。resolver SHA-256=`c3b12e5f226050ef8c774ce8b4c613fd5a0007f91f5eaedeb4a7b53ecee44689`，test SHA-256=`d5a99d579908d0505238e61152ec327fd825cf2f862b72fc7f25c4507e5d1154`。
- Round22：三组独立先RED后GREEN；selectedseries prior-fix freshness、cleanPASS exactemptytable/absent、targetedquoted/spacedfixRecord。resolver SHA-256=`65eda951ef3dacda92b7ae82afcd934c87b07af3d8d215a937d734d711758617`，test SHA-256=`43bfefbb3ce3e37266e662cb84829e249a52fcf45dd18bbcff893ffc3c0e0943`。
- Round21：五组独立真实 RED 后才写生产，五组 GREEN + focused93/4 todo；scope/safecount/CR04cleanPASS/CR05exacttable fingerprint与currentfixRecord拒绝落实。resolver SHA-256=`a928e35392488e5c5b0977c68f8801d28f66590ab840c55f3b7430ec996d67b0`，test SHA-256=`4c5fe99384d2601e2474be7ab0d0d69746389af638392a0ac59d2d1b018d5c5e`。R20 same-round正控错误已按owningCR06纠正，历史报告保留。
- Round20：四项 P1 已补修；完整 authentic recovery baseline 与递归 hash 重绑独立 RED/GREEN。resolver SHA-256=`4e35595700d40a06e8242ef11558fd78a4357a79305586eb138a55ab5cf53e5c`；test SHA-256=`47cf7e5a43fd95abbf66658906d443fbe310b5b198544c8ce523612c488d45cc`。先写 production 后逆转 baseline replay 的顺序偏差如实记录于 Fix Summary。
- Round19：六项授权 P1 已修复并独立 GREEN；root property plain remainder、module frozen inputs、exact current disposition、existing v2 predecessor/calendar、raw Story key与CR04/05 docs/help双输出。resolver SHA-256=`90681391e31f440ca3416d5b2468da9cf79265d83d4923981151108adad60134`；test SHA-256=`4d61bee12d035981dd4e6cdd14b7c2c7f1487d24d91b1409c696072d940fad4c`。Finding #1 RED 使用 isolated baseline replay，顺序偏差见 Fix Summary。
- Round18：三个 P1 分别 RED→GREEN；补齐 document-root property、whole-file validity 与 bounded lexer 收窄。resolver SHA-256=`9b8b1b9beb1ed6ec97f5d37513356080b7d914ff77bb1e5263f760babedfdd51`，focused test SHA-256=`3a9ab8ea3b19b9b1e47ae2bc9746bee0dbbd52ae86a196525e5ed16da61bf2e6`。语法合法但 bounded-disallowed 的 fixture 如实记录，不伪称 parser error。
- Round17：用户于 2026-09-07 批准方案 A；outer invalid property-like opening 与 declared/undeclared named handle 两项独立 RED→GREEN。所有 named handle 均 fail-close，不解析 %TAG。其他已支持 tag controls 继续通过。
- Round16 evidence hardening：共享 bounded tag vocabulary 同时保证 outer detectors 接受 parser-valid bare `!`，inner shorthand matcher 拒绝 parser-invalid empty suffix `!!`/`!h!`。
- Round15 evidence hardening：bounded YAML property-token lexer 支持合法 bare `!` 与完整 non-empty `!<...>`（含 comma/brace），malformed/duplicate inputs 仍 fail-close。
- Round14 evidence hardening：YAML flow `?`/tag/anchor-to-quoted node boundary 与 raw closure 后 second-comment raw-opening state 已闭环。
- Round13 evidence hardening：跨行第二 YAML property、flow plain literal quote 与 raw closure/later-comment/new-raw handoff 已闭环；Round12 explicit-value fixture 修为合法 YAML 并增加 parser validity/structure assertion，dismissed filename 形态保持 unrelated。
- Round12 evidence hardening：bounded adjacent-line YAML property/value state、flow plain scalar non-separation `#`、HTML comment/raw suffix transitions 与 exact-current `+round`/`:round` fail-close 均进入 focused gate。
- Round11 evidence hardening：YAML property-to-quoted/flow 与 flow-comment lexical boundary 已闭环；HTML comment-to-raw same-line handoff 保留 raw state；exact current `.round` 与完整 malformed other-series slot 分离，避免 unrelated/substring 误判。
- Round10 evidence hardening：bounded YAML scanner 覆盖 flow multiline 与 invalid plain continuation；raw HTML scanner 保留连续 comment 与 closure suffix transition；known-family exact-current malformed alphabetic、underscore 与 dot date/delimiter 均 fail-close。
- Round9 evidence hardening：bounded YAML role scanner 覆盖 sequence/explicit mapping multiline quoted scalar、explicit-key comment 与 bare `?`；raw `pre`/`code` scanner 覆盖 multiline opening、closing-to-comment handoff 与非法 closing attributes；known-family current-series malformed date/separator 不再被误归 unrelated。
- Round8 evidence hardening：bounded YAML scanner 隔离 explicit-key block scalar 与 multiline quoted scalar body；bounded raw HTML scanner 以 quote-aware `pre`/`code` stack 处理 quoted `>` 与嵌套区域；review-series detector 先隔离完整合法 other-series slot，避免 `pre-main`/`main-v2` substring 误判。
- Round7 evidence hardening：bounded tracker scanner 对 YAML sequence/tag/anchor、同 root quoted-key block scalar body 与 tab-indented invalid frontmatter fail-close；bounded Story scanner 对 HTML comment 及 raw `pre`/`code` body 内伪造 `Status` fail-close，未扩展为通用 YAML/CommonMark parser。
- Round6 evidence hardening：YAML block scalar（含chomping/显式indent）与Markdown backtick/tilde closed/unclosed fence内的terminal文本不再冒充tracker mapping；trackerChangeSet严格为唯一leading frontmatter字段，body-only失败且body duplicate不污染解析。
- Round5 evidence hardening：role-specific真实缩进YAML terminal grammar、malformed round intent、current round `1..N` continuity、tracker exact/unique/order schema、unsafe first/middle/last完整roundEvidence、bare title/name/slug/filename × JS/array/config detector均闭环；`generatedAt`晚于本轮affected evidence，freshness恢复。
- Round4 production evidence：runner merged context→real CLI→resolver tracker bindings/terminal state；source与两套fresh-installed executable CLI均证明authentic completed legacy→canonical且不改写legacy；structured current/superseded、family/round唯一性、canonical roundEvidence、leaf ok/issue与完整detector变量族闭环。
- Round3 evidence hardening：malformed filename fail-close；CR04/05 evaluation lineage与caller-frozen tracker identities/real afterHash；leaf exact schema含reviewSeries；14类reason exact matrix；八包ZH/EN no-title-rederive hard gate；bare与true-split detector。
- Round2 evidence hardening：canonical malformed fail-close；完整DONE v2/state/predecessor/gate/no-follow/real canonicalized hash/tracker matrix；CR01–06 shared executable context oracle；14类blocked runner-wide snapshot；source ZH/EN semantic parity与installed SKILL.md parity/activation、installed ENOENT；bounded concrete/placeholder/concat/config detector与mechanical ledger。
- Round1 evidence hardening：ancestor no-follow containment、合法current-series/round identity、finalizer story/round/authenticity、四字段frozen context及六leaf mismatch-before-write、stable/redacted I/O、runner-wide zero mutation、双IDE installed full-consumer parity与frozen full classified scan/ledger均进入focused gate。
- Full suite（Round24 双PASS后 fresh）：`67 files total; 62 passed / 5 failed`；`784 tests total; 768 passed / 12 failed / 4 todo`。十二项失败为外部 drawer 造成的 `core=19` / `total=69` 与旧 fixed-count expectations 不一致。
- Full run evidence：`npm test -- --reporter=dot`，start UTC `2026-09-07T04:43:57Z`，recorded UTC `2026-09-07T04:45:00Z`，HEAD=`ff7528d3f9ec34072bb669ee79f7569345c23d47`，包含当前 uncommitted Epic 11 worktree；build ESM/DTS 同次 fresh通过。
- Build：ESM 与 DTS passed。
- Docs：`72 Markdown files / 5 drafts`，links 与 governance passed。
- Packaging：`release/packaging-manifest.json` 与 `dist/packaging-manifest.json` passed；resolver 已进入 manifest。
- Resolver mode：canonical source 为 executable `755`；installed regression probe 通过。
- Canonical checker strict：`status=ok`、`mode=strict`、`findings=[]`；live counts=`core=19`、`sdlc=50`、`support=8`、`hooks=2`、`defaultInstall.total=69`。
- Changed package density：shared contract、runner、CR01–06 的 ZH/EN entrypoints 均无 `triggered_density_warning`。
- `git diff --check`: passed。

## Governance Decisions（治理决策）

| Surface | Decision | Reason | Evidence |
| --- | --- | --- | --- |
| D0 canonical source truth | `updated` | numeric-only resolver、recovery matrix 与 single propagation 是 CR canonical truth。 | shared contract/script、runner、CR01–06、focused tests。 |
| D0 module/discovery contract | `updated` | help 必须解释 resolved Story-ID-only directory；未新增 package root。 | `module-help.csv`、fresh-install regression、strict checker。 |
| D1 current public docs | `updated` | 当前用户需要看到 exact root、legacy resume 与 ambiguity stop。 | source README ZH/EN、SDLC workflow catalog、artifact layout。 |
| D2 living legacy mapping | `skipped` | legacy mapping 不拥有 CR runtime continuation；新增映射会制造第二 authority。 | shared CR-local owner decision。 |
| D2 frozen/history material | `historical snapshot` | existing CR reports、Story gates 与 goal records 是历史事实。 | 本 Story 未改写既有 CR artifacts 或 root-owned `11-9-code-review` records。 |
| Release evidence | `updated` | 新 executable resolver 与 canonical content 必须进入 packaging evidence。 | packaging acceptance passed。 |
| External drawer | `skipped` | user-owned concurrent source 与本 Story 无关。 | drawer/zip/fixed counts 未修改。 |

Round17 治理复核（2026-09-07）：D0 resolver 行为按用户方案 A 更新，package roots/discovery/hook 未新增变化；D1 public layout docs 保留现有 numeric root/recovery 说明（skipped，未承诺完整 YAML tag 支持）；方案 A 的具体认证词汇由本 gate 与 Round17 evaluation 记录。D2 legacy mapping skipped、历史审查 historical snapshot；本轮使用 dated append。Build、docs、density、warn/strict checker、packaging 均通过；full/affected 非绿仍严格限定为外部 drawer 固定数量漂移，不声称 full PASS。

## External Caveat（外部例外）

Round23 治理复核：D0 bounded predicate updated，D1 docs skipped（目录/公开承诺未变），D2 mapping skipped、历史报告 historical snapshot；root current strict findings=[]、packaging/diff通过，affected对应当前R23hash，full仍为R19历史。

Round22 治理复核：D0 resolver updated，package roots/help不变；D1 public docs skipped（目录规则不变），D2 mapping skipped、历史材料 historical snapshot。current strict findings=[]、packaging与diff通过；full保留R19历史身份，当前focused与affected如上。

Round21 治理复核：D0 resolver updated，无新增root/help/discovery变化；D1 docs skipped（现有目录规则不变），D2 mapping skipped、历史报告 historical snapshot。current strict findings=[]、packaging、diff通过；full仍是R19快照，不冒充当前93项focused的全量fresh结果。

Round20 治理复核：D0 resolver updated，package roots/help未变；D1 docs skipped（不变公开目录规则），D2 mapping skipped、历史材料 historical snapshot。current strict findings=[]、packaging与diff通过；affected如上，full保留Round19历史身份。没有通过修 fixed-count 或移除 drawer 获取绿色。

Round19 治理复核（2026-09-07）：D0 resolver 与 CR05 help metadata updated，沿用 pipe 双输出语法且不改 manifest 算法；D1 layout doc 删除过时 CR rules 行，其他公开面 skipped（目录/命名规则未变）；D2 mapping skipped、历史材料 historical snapshot。本轮 docs72/5、strict findings=[]、packaging、diff通过；fresh affected/full 如上，非绿仍仅 drawer，不声称 full PASS。

Round18 治理复核（2026-09-07）：D0 resolver 修复已更新，无新增 package root/discovery 变化；D1 public docs skipped（公开目录规则未变，未承诺完整 YAML 支持）；D2 mapping skipped、既有报告 historical snapshot。warn/strict checker findings=[]、packaging 与 diff check 本轮通过。build/docs/density 沿用同日 Round17 验证（本轮未改对应入口或 TS/build 配置），不将历史 full 结果标为本轮 fresh。最新 CR 仍须 fresh Reviewer/Evaluator 双 PASS。

- 范围外 `assets/source/speclite/core-skills/speclite-drawer-er-modeler/` 与 zip 仍存在，使 live discovery 为 `core=19,total=69`。
- 本 Story 未修改、删除或吸收 drawer，也未修改旧 fixed-count assertions；因此 completion 使用 `PASS_EQUIVALENT`。

## Boundary（边界）

- 仅处理 Story-ID-only CR directory resolver、single propagation、legacy resume、ambiguity diagnostic、negative scan、tests、help/docs/contracts 与 release evidence。
- 未处理 report basename/CR algorithm/round/approval、legacy migration、Story 11.10、drawer/zip、workspace mirrors、fixed counts、root-owned `11-9-code-review` logs、commit 或 push。

## Recommended Next Action（推荐下一步）

Round24 Reviewer PASS/PASS_RECOMMENDED、Evaluator PASS_WITH_DEFERRED_TODOS；开发验证保持 PASS_EQUIVALENT，但 closeout preflight 已暂停：installed global bmenhance/R24 legacy 格式未提供 evaluation 所要求的完整 v2 predecessor/fingerprint。CR04 record-only成果保留，story-local provisional record为HALTED，不可消费为有效predecessor；未经受控证据规范化或明确legacy policy授权，不执行CR05/CR06、不标记Done、不推进11.10。

---

*本文档由 speclite-flow-gate Skill 自动生成*
