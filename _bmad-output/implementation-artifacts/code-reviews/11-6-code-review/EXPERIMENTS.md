# Experiments（实验记录）

## 2026-09-04 — Live Preflight

- Story ID：11.6
- 结果：11.1–11.5均已完成；11.6为`ready-for-dev`，hard predecessor gate满足。
- Scope：UX artifacts统一进入`{planning_artifacts}/ux/`；三个核心文件basename不变；`design-system/`按需创建；legacy artifacts原位发现且不迁移。
- Verification Focus：ZH/EN producer-consumer parity、relative links/assets、project containment、negative scan、legacy evidence与三空间边界。
- Worktree Boundary：保留11.1–11.5累计变更；external drawer/zip与IDE mirrors不得混入11.6修复判断。
- 下一步判断：启动fresh `bmad-dev-story story 11-6`并先执行kickoff gate。

## 2026-09-04 — Development Result

- Story ID：11.6
- 结果：kickoff=`PASS`、completion=`PASS_EQUIVALENT`、tasks6/6、Story/tracker=`review`，无Owner blocker或新stable issue。
- Implementation：三个exact UX outputs、on-demand design-system、15步ZH/EN producer、readiness/Architecture/Epics/IR grill/Correct Course/Create Story consumers、legacy evidence、relative links/assets containment、metadata/docs/packaging。
- Verification：RED 2 pass/4 fail；final focused6/6；affected47/47；build/docs/packaging/canonical/density/diff均PASS；full598 pass/12 fail/4 todo，12项仅drawer fixed-count drift。
- Scope：未改drawer/mirrors/fixed counts/CR records/已完成Story历史，未commit/push。
- 下一步判断：启动fresh Reviewer Round1三层只读审查。

## 2026-09-04 — CR Reviewer / Round 1

- Story ID：11.6
- 结果：FAIL；3/3 layers无降级，fresh aggregator去重为7 P1 + 1 P2。
- P1：fresh path state未回填、canonical无progress可能覆盖、legacy sibling output策略待裁决、resolver/candidate fail-close、post-decode local-ref containment、六个scope内config examples旧defaults、AC10行为fixtures不足。
- P2：shipped inactive Architecture duplicate step仍使用`*ux-design*.md` wildcard。
- 验证：focused6/6；aggregator matrix42/44，2项仅drawer69 count；docs/canonical/diff通过。
- 下一步判断：启动fresh Evaluator Round1，先裁决legacy sibling策略与P2去向。

## 2026-09-04 — CR Evaluator / Round 1

- Story ID：11.6
- 结果：FAIL；7/7 P1均确认有效并授权patch，Finding#8确认P2 defer至CR05。
- Owner Gate：NONE。AC2/AC4要求new writes进入canonical exact paths，AC8保护existing legacy原位；因此existing legacy sibling原位选择，missing sibling写canonical UX exact path。
- Fix授权：仅#1-#7与executable behavior matrix；禁止修P2 duplicate step、扩完整Markdown/browser parser、建立UX-local root resolver或处理drawer/11.7+。
- 下一步判断：启动fresh Fixer Round1，完成后进入fresh Reviewer/Evaluator Round2。

## 2026-09-04 — CR Fixer / Round 1

- Story ID：11.6
- 结果：#1-#7全部修复并追加evaluation fix record；#8 P2未修改。
- Implementation：新增`src/config/ux-artifact-routing.ts`；fresh回填、invalid frontmatter/candidate/root fail-close、legacy selected siblings、bounded local-reference validation、六config seven-root parity与Steps8/9/14 selected paths已落地。
- Verification：focused33/33、affected191/191、build/docs/packaging/canonical warn+strict/density/diff均PASS；full624 pass/4 todo/12 fail仅drawer fixed counts。
- Governance：D1 public layout同步，D2 legacy skip/frozen-history snapshot决策记录；无Owner blocker。
- 下一步判断：启动fresh Reviewer Round2三层复审，随后fresh aggregator与Evaluator。

## 2026-09-04 — CR Reviewer / Round 2

- Story ID：11.6
- 结果：FAIL；3/3 layers，fresh aggregator确认4项P1，existing P2 wildcard继续defer。
- P1：missing ancestor与cross-space symlink合并physical-owner gate；duplicate reference definitions last-wins；HTML character-reference containment bypass；install-existing no-migration fixture与completion gate evidence不闭环。
- 驳回：active Step1先写`stepsCompleted: [1]`再bind，真实template初始`[]`不是运行缺陷；Skill prose是active executable contract，internal helper仅test引用不单独构成P1。
- 验证：focused33/33、diff通过，四类反例复现并清理；drawer隔离。
- 下一步判断：启动fresh Evaluator Round2裁决四项修复边界。

## 2026-09-04 — CR Evaluator / Round 2

- Story ID：11.6
- 结果：FAIL；4/4 P1确认，existing Architecture wildcard维持P2 defer，Owner Gate=`NONE`。
- 唯一语义：canonical/legacy physical owner与nearest existing ancestor gate，actual write前重验；duplicate refs first-definition-wins；local-ish HTML raw `href/src`含`&`时在strip/decode前fail-close；legacy先于install存在并逐阶段验证install/update/repair成功与path/type/hash/no-copy invariants。
- 驳回：raw template `stepsCompleted: []`与helper-only候选均为误报。
- 授权：fresh Fixer仅修4项P1及active prose/tests/D1定点同步，并向evaluation追加fix record；completion gate由root另行刷新。
- 下一步判断：启动fresh Fixer Round2，禁止处理P2、Story/tracker、drawer/mirrors/fixed counts。

## 2026-09-04 — CR Fixer / Round 2

- Story ID：11.6
- 结果：Findings #1-#4全部修复；evaluation已追加fix record；P2 wildcard未动，无Owner blocker。
- Implementation：physical owner/nearest ancestor/pre-write revalidation、Markdown duplicate first-wins、local-ish HTML raw `&` fail-close、install-before-existing三阶段lifecycle invariants；active ZH/EN与D1 docs定点同步。
- Verification：focused64/64、affected221/221、build/docs/density/packaging/canonical warn+strict/diff均PASS；full656 pass/12 fail/4 todo，12项仅external drawer fixed counts。
- Flow Gate：root已将completion gate刷新为current Round2证据，维持`PASS_EQUIVALENT`并明确drawer caveat。
- 下一步判断：启动fresh Reviewer Round3三层只读复审。

## 2026-09-04 — CR Reviewer / Round 3

- Story ID：11.6
- 结果：FAIL；fresh replacement Blind PASS、Edge提出2项候选、Acceptance PASS，fresh aggregator确认2个P1；existing P2继续defer，Owner Gate NONE。
- P1：`preflightUxArtifactWrite()`成功返回后到actual `wx`/`mkdir`之间存在确定性caller-visible替换窗口；lifecycle canonical no-copy断言只排除三个core basenames，未覆盖legacy asset directory/file/symlink counterpart。
- 收窄：不把native `openat`当唯一方案，也不把不可消除的OS-level race泛化为finding；Round2静态owner/ancestor guard仍成立。
- 验证：focused64/64、scoped diff通过；E1复现`preflight=true`后替换owner并`escapedToDocs=true`；E2由fixture assertion audit确认。
- 下一步判断：启动fresh Evaluator Round3限定operation coupling与asset no-copy最小修复。

## 2026-09-04 — CR Evaluator / Round 3

- Story ID：11.6
- 结果：FAIL；2/2 P1确认，existing P2继续defer，Owner Gate=`NONE`。
- 唯一语义：同一bounded internal primitive在commit-time owner/ancestor重验后直接执行exclusive file create或on-demand mkdir，不再返回approval给caller自行写；允许module-internal test-only interposition，不规定native API且不承诺消除全部OS race。
- Evidence：install/update/repair每阶段须排除main、HTML、asset directory/file/symlink全部canonical counterpart，同时允许空canonical `ux/` parent。
- 授权：fresh Fixer仅修改internal helper、focused test、直接受影响active ZH/EN与D1 docs，并向evaluation追加fix record；completion gate由root刷新。
- 下一步判断：启动fresh Fixer Round3，禁止处理P2、Story/tracker与external drawer。

## 2026-09-04 — CR Fixer / Round 3

- Story ID：11.6
- 结果：Findings #1-#2已修复并追加evaluation fix record；P2未动，无Owner blocker。
- Implementation：新增`executeUxArtifactOperation()`，同一internal primitive完成commit-time guard与actual exclusive create/single mkdir；test-only interposition证明owner替换在operation前被拒绝；lifecycle逐阶段排除六类canonical counterparts。
- Verification：focused68/68、affected226/226、build/docs/density/packaging/canonical warn+strict/diff均PASS；full660 pass/12 fail/4 todo，12项仅external drawer fixed counts。
- Flow Gate：root已刷新completion gate为current Round3 evidence，维持`PASS_EQUIVALENT`并保留drawer caveat。
- 下一步判断：启动fresh Reviewer Round4三层只读复审。

## 2026-09-04 — CR Reviewer / Round 4

- Story ID：11.6
- 结果：FAIL；Blind提出1 P1，fresh replacement Edge PASS，Acceptance PASS，fresh aggregator确认1 P1；existing P2继续defer，Owner Gate NONE。
- P1：active Step明确要求`runtime-internal bounded operation`，但helper仅存在repo `src/`/tests，未进入dist、npm published source或installed Skill scripts，真实installed workflow无exact invocation binding。
- 区分：Round2“必须新增public CLI”旧候选继续驳回；test-only hook不独立构成P1。本轮只确认installed artifact availability/consumption gap。
- Evidence：package files、tsup entry、dist、installer projection、release manifest与installed-tree均无operation executable；focused68/68不能替代installed invocation。
- 下一步判断：启动fresh Evaluator Round4限定private Skill-local binding与single source-of-truth，禁止public CLI/schema扩面。

## 2026-09-04 — CR Evaluator / Round 4

- Story ID：11.6
- 结果：FAIL；R4-1确认P1，existing wildcard维持P2 defer，Owner Gate=`NONE`。
- 唯一方案：canonical Create UX `scripts/ux-artifact-operation.mjs`作为private Node ESM executable与operation唯一source-of-truth；repo harness直接import，同一script由installer投影到`.agents/.claude`。
- Invocation：仅`create-file`/`create-directory`，exact `{skill-root}` command；stdout单JSON，success exit0，guard/fs/argv failure non-zero且structured HALT；test hook不得进入installed argv/env/input。
- Evidence：真实fresh installed-tree从两种mirror执行main create/design-system mkdir与negative matrix，校验canonical/installed hash、files-index/sourceRef/mode、skill hash、installed tree与packaging inventory。
- 下一步判断：启动fresh Fixer Round4；禁止public CLI/schema/dependency、P2与手工workspace mirror修改。

## 2026-09-04 — CR Fixer / Round 4

- Story ID：11.6
- 结果：installed binding Finding #1已修复并追加evaluation fix record；P2未动，无Owner blocker。
- Implementation：canonical Create UX private executable是operation唯一实现与direct CLI；repo tests直接import同一export，真实installer投影到`.agents/.claude`，exact command与single JSON/non-zero HALT已同步active ZH/EN和D1 docs。
- Evidence：两类installed main/mkdir调用、existing preservation、owner/ancestor negatives、canonical/install hash/sourceRef/mode、skill hash、installed tree与npm inventory闭环；test hook不接受argv/env/stdin。
- Verification：focused69/69、affected231/231、build/docs/density/packaging/npm inventory/canonical warn+strict/diff均PASS；full661 pass/12 fail/4 todo仅drawer fixed counts。
- Flow Gate：root已刷新completion gate为current installed evidence，维持`PASS_EQUIVALENT`。
- 下一步判断：启动fresh Reviewer Round5三层只读复审。

## 2026-09-04 — CR Reviewer / Round 5

- Story ID：11.6
- 结果：PASS；Blind/Edge/Acceptance有效3/3均PASS，fresh aggregator独立复核后0 P0/P1/new P2。
- Evidence：canonical private script单一实现、direct exact CLI与import-only hook、真实`.agents/.claude` installer projection/hash/mode/sourceRef/skill hash、main/mkdir/negative matrix、legacy/reference闭环均成立。
- Verification：focused69/69、scoped diff PASS；completion gate的69/231/661与drawer caveat准确。
- Deferred：inactive Architecture wildcard维持existing P2，等待CR05。
- 下一步判断：启动fresh Evaluator Round5；Evaluator PASS前不得进入CR04。

## 2026-09-04 — CR Evaluator / Round 5

- Story ID：11.6
- 结果：PASS；0 P0/P1/new P2，Owner Gate=`NONE`，latest Reviewer/Evaluator双PASS成立。
- Confirmed：canonical private script唯一实现、repo/installed同源、exact CLI/JSON/HALT、hook不暴露、installer两类projection/hash/mode/index/package evidence与operation/lifecycle历史修复全部闭环。
- Deferred：inactive Architecture wildcard维持P2，必须由CR05处理，不得夹带修复。
- Verification：current completion gate准确记录focused69、affected231、full661/12/4与drawer caveat。
- 下一步判断：严格串行进入fresh CR04 rules extraction。

## 2026-09-04 — CR04 Rules Extraction

- Story ID：11.6
- 结果：PASS；仅更新`cr-rules-summary.md`，可进入CR05。
- New：`CR-SEC-21` physical owner/nearest ancestor与actual operation coupling（11/12）；`CR-DOC-07` bounded markup renderer-validator parity（10/12）。
- Updated：`CR-DOC-05` installed Markdown与executable双向同源binding（11/12）；`CR-TEST-02` fixture前置gate/install-before-existing逐阶段证据（9/12）。
- Excluded：inactive wildcard留给CR05；drawer、Story basename、template初始状态与public CLI主张不沉淀。
- Verification：diff、canonical normal/strict均PASS；D0 verified、D1 updated、D2 skipped/history。
- 下一步判断：启动fresh CR05，仅对existing P2去重/登记。

## 2026-09-04 — CR05 TODO Tracking

- Story ID：11.6
- 结果：PASS；新增`TODO-017`，无等价既有条目，backlog统计`open=9/resolved=8`。
- TODO：inactive Architecture duplicate的UX wildcard，分类`duplication`、P2、`open`；active source已使用exact UX contract，非active blocker。
- Scope：仅修改`cr-todo-backlog.md`，未修P2源码或改其他artifact。
- Verification：TODO ID唯一，scoped diff PASS。
- 下一步判断：启动fresh CR06 Finalizer。

## 2026-09-04 — CR06 Finalization

- Story ID：11.6
- 结果：PASS；Story与tracker均`review -> done`，finalization summary/trace/change log已追加。
- Preconditions：completion gate=`PASS_EQUIVALENT`；latest Reviewer/Evaluator Round5双PASS；CR04完成；CR05 `TODO-017`为P2/open；无Owner blocker。
- Post Audit：Epic11仍`in-progress`；11.7仍`ready-for-dev`；11.8-11.10未变；`bmm-workflow-status.yaml`不存在且未创建。
- Verification：diff PASS；未改source/tests/config/rules/TODO/gates/drawer，未commit/push。
- 下一步判断：允许进入Story11.7只读preflight。
