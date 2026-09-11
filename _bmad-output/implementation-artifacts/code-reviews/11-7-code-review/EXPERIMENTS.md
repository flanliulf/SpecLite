# Experiments（实验记录）

## 2026-09-04 — Live Preflight

- Story ID：11.7
- 结果：11.1–11.6均`done`且completion/CR closeout已完成；11.7=`ready-for-dev`，hard predecessor gate满足。
- Scope：canonical basename=`prd-validate-report-{yyyy-MM-dd}.md`；默认路径=`{planning_artifacts}/prd/...`；runtime date每次invocation只生成一次；canonical target存在即pre-write hard block且no suffix。
- Legacy：legacy-name reports仅原位发现；install/update/repair不得rename/migrate/overwrite/delete；legacy-only时保留旧报告并允许创建canonical target。
- Verification Focus：clock-controlled exact path、same/different content zero report/progress/temp/suffix mutation、stable SPEC07 issue、ZH/EN/help/contracts/examples/downstream discovery、classified negative scan。
- Worktree Boundary：保留11.1–11.6累计变更；external drawer/zip、IDE mirrors与fixed-count baselines不得混入11.7判断。
- 下一步判断：启动fresh `bmad-dev-story story 11-7`并先执行kickoff gate。

## 2026-09-04 — Development Result

- Story ID：11.7
- 结果：kickoff=`PASS`、completion=`PASS_EQUIVALENT`、tasks5/5、Story/tracker=`review`，无Owner blocker。
- Implementation：exact dated basename/path、single invocation date、early read-only probe+commit-time exclusive `wx` create、SPEC07 stable issue、legacy discovery/preservation、install/update/repair no-migration、ZH/EN/help/contracts/examples/downstream/D1同步。
- Evidence：Skill-private report operation由真实installer投影到`.agents/.claude`并执行；same/different target zero report/progress/temp/suffix mutation；legacy-only保留旧报告并创建canonical。
- Verification：focused7/7；affected177 pass/4 fail；full668 pass/12 fail/4 todo，失败仅drawer fixed counts；build/docs/packaging/density/canonical normal+strict/diff均PASS，npm script mode0755。
- Scope：未改validation rules/scoring/body、IR filename、11.8+、TODO-017、drawer/mirrors/baselines或completed history，未commit/push。
- 下一步判断：启动fresh Reviewer Round1三层只读审查。

## 2026-09-04 — CR Reviewer / Round 1

- Story ID：11.7
- 结果：FAIL；Blind/Edge/Acceptance有效3/3，fresh aggregator确认5个P1，Owner Gate NONE。
- P1：`{current_date}`与`{validationInvocationDate}`分裂；repair未assert成功；parity/negative scan漏example+3 downstream、无日期/任意suffix与整行legacy skip；三类downstream historical discovery缺regular/readable/real PRD-owner资格；completion gate affected177/4无exact inventory且current重建197/4。
- 驳回：commit-time重验后的OS-level race不升级；current test seam在final check前且replacement复现fail-close，不要求native API。
- Verification：focused7/7、diff PASS；drawer caveat保持。
- 下一步判断：启动fresh Evaluator Round1裁决5项P1修复边界。

## 2026-09-04 — CR Evaluator / Round 1

- Story ID：11.7
- 结果：FAIL；5/5 P1确认，无新增P2，Owner Gate=`NONE`。
- Fix：所有report date surface只消费单一`validationInvocationDate`；repair统一assert exit/status/command/success data及逐阶段invariants；完整classified corpus inventory/negative scan；三个downstream采用portable/readable/no-follow regular/real PRD-owner资格。
- Gate：affected command inventory与current counts由root在Fixer后刷新，Fixer不得修改completion gate。
- 驳回：final revalidation后的OS-level race/native API扩面；stable issue/current producer缺失。
- 授权：仅evaluation列出的6个active/test文件与必要private script真实缺口；只跑focused/精确相关/diff，不跑build/full/packaging。
- 下一步判断：启动fresh Fixer Round1修#1-#4，随后root刷新#5。

## 2026-09-04 — CR Fixer / Round 1

- Story ID：11.7
- 结果：Findings #1-#4已按授权修复并追加evaluation fix record；Owner Gate NONE；#5由root刷新。
- Fix：single invocation date统一消费；repair完整success+逐阶段invariants；classified full corpus gate；三个downstream physical PRD-owner candidate qualification。
- Verification：focused8/8、精确相关3 files/51 tests、diff PASS；private script无真实缺口未改；未跑build/full/packaging。
- Flow Gate：root记录exact 11-file affected command/inventory，current223 pass/4 fail，UTC/HEAD/worktree evidence；4 fail仅drawer；full明确为未重跑development baseline。
- 下一步判断：启动fresh Reviewer Round2三层复审。

## 2026-09-04 — CR Reviewer / Round 2

- Story ID：11.7
- 结果：FAIL；有效3/3 layers，fresh aggregator确认5 P1/0 P2，Owner Gate NONE。
- P1：Step2-13 snake_case path无producer/alias；downstream缺realProject→realPlanning→realPRD owner chain；negative classifier漏Unicode/space/parentheses/`${date}`/post-`.md` suffix；lifecycle仅覆盖五类legacy中的两类；AC5 inventory漏customize/config/private script。
- Closed保持：Round1 single-date、repair success与completion gate exact inventory未重开。
- Verification：current focused8/8仅说明旧suite漏检；summary diff PASS。
- 下一步判断：启动fresh Evaluator Round2裁决5项bounded修复。

## 2026-09-04 — CR Evaluator / Round 2

- Story ID：11.7
- 结果：FAIL；5/5 P1确认，0 P2，Owner Gate=`NONE`。
- 唯一语义：13 steps直接统一camelCase token无alias；realProject→realPlanning→exact realPlanning/prd→candidate owner chain；完整delimiter-aware basename分类；install前五类legacy+canonical control三阶段全量invariants；customize/config/private script按role进入inventory。
- 白名单：13个Validate PRD steps、3个downstream、focused test与evaluation append；customize/config/script仅作为assertion输入，当前不授权修改。
- Closed保持：Round1 date、repair success、completion gate inventory不重开。
- 下一步判断：启动fresh Fixer Round2；不跑build/full/packaging，counts变化由root刷新。

## 2026-09-05 — CR Fixer / Round 2

- Story ID：11.7
- 结果：5/5 P1已修复，evaluation已追加fix record，Owner Gate NONE。
- Fix：13 steps统一camelCase locked path；三downstream完整owner chain；delimiter-aware full basename classifier；五类legacy+canonical control lifecycle；customize/config/private script role inventory。
- Verification：focused9/9、related52/52、active snake token零命中、diff PASS；只读角色输入未改；未跑build/full/packaging。
- Gate：root exact affected rerun=`224 pass/4 fail`，4项仅drawer；UTC/HEAD/worktree evidence已刷新。
- 下一步判断：启动fresh Reviewer Round3。

## 2026-09-05 — CR Reviewer / Round 3

- Story ID：11.7
- 结果：FAIL；有效3/3，fresh aggregator确认3 P1/0 P2，Owner Gate NONE。
- P1：framed whole-value classifier与config/private role gates fail-open；negated `arrayContaining(allPaths)`仅全部同时出现才fail；same-basename inventory忽略symlink/non-file。
- 驳回：Step13必须重复frontmatter date binding；File References不等于完整runtime state，现有invocation state可继承。
- Closed保持：owner chain、13 path bindings、五family corpus；focused9/9。
- 下一步判断：启动fresh Evaluator Round3。

## 2026-09-05 — CR Evaluator / Round 3

- Story ID：11.7
- 结果：FAIL；3/3 P1确认，Owner Gate=`NONE`，均限定为test-oracle修复。
- Fix：framed classifier/config override/private exact set-role三组独立assertions；四类lifecycle surface逐项求report交集为空；same-basename inventory记录所有entry location+no-follow type并仅允许owner内regular集合。
- 驳回：Step13 date frontmatter重复绑定；其他closed项不重开。
- 授权：只改focused test与evaluation append；禁止source/prose/build/full/packaging。
- 下一步判断：启动fresh Fixer Round3。

## 2026-09-05 — CR Fixer / Round 3

- Story ID：11.7
- 结果：3/3 P1已按test-only授权修复，evaluation已追加fix record，Owner Gate NONE。
- RED/GREEN：新增oracle先得`1 failed / 8 passed`，修复后focused=`10/10`。
- Fix：framed/unframed whole-value classifier与config/private exact role断言；四类lifecycle surface逐项report intersection；all-entry same-basename location+no-follow type inventory。
- Verification：exact related=`53/53`；root exact affected=`225 pass/4 fail`，四项仍仅drawer fixed-count drift；未跑build/full/packaging。
- 下一步判断：启动fresh Reviewer Round4三层复审。

## 2026-09-05 — CR Reviewer / Round 4

- Story ID：11.7
- 结果：FAIL；有效3/3 layers，fresh aggregator去重为3 P1/0 P2，Owner Gate NONE。
- P1：managed basename classifier仍漏framed前置文本、`=`前界与support basename role；config同义report-target keys漏检；private script整文件producer/discovery read-only evidence不完整。
- Closed：Round3逐surface zero intersection与all-entry no-follow inventory，及Round1-2其余闭环项。
- Verification：focused10/10仅证明current corpus合规，不能覆盖已复现反例；未跑build/full/packaging。
- 下一步判断：启动fresh Evaluator Round4。

## 2026-09-05 — CR Evaluator / Round 4

- Story ID：11.7
- 结果：FAIL；3/3 P1确认为PATCH-EVIDENCE，0 P2，Owner Gate=`NONE`。
- 唯一语义：role-scoped完整classifier、显式config deny vocabulary、private whole-file唯一producer/static mutation gate/discovery前后no-follow snapshot。
- 授权：仅focused test与本轮evaluation追加Fix Summary；禁止source/prose/gate/build/full/packaging。
- 下一步判断：启动fresh Fixer Round4。

## 2026-09-05 — CR Fixer / Round 4

- Story ID：11.7
- 结果：3/3 P1已按test-only授权修复，evaluation已追加fix record，Owner Gate NONE。
- RED/GREEN：`1 failed / 9 passed`（命中`validation_report`漏检）→ focused=`10/10`。
- Fix：framed/`=`/support role classifier；config report-target同义key deny；private whole-file producer/static mutation/discovery immutability三重证据。
- Verification：root exact related=`53/53`；exact affected=`225 pass/4 fail`，四项仍仅drawer fixed-count drift；未跑build/full/packaging。
- 下一步判断：启动fresh Reviewer Round5三层复审。

## 2026-09-05 — CR Reviewer / Round 5

- Story ID：11.7
- 结果：FAIL；Acceptance PASS但Blind/Edge有稳定mutants，fresh aggregator去重为3 P1/0 P2，Owner Gate NONE。
- P1：support allowlist缺clause-role且delimiter不对称；TOML table/quoted-dotted/dir-folder semantic path漏检；第二aliased fs import与限定local-helper reachability可绕过private role gate。
- 边界：驳回“任意alias/helper均可绕过”的过宽表述；只保留active corpus/role invariant直接相关反例。
- 下一步判断：启动fresh Evaluator Round5。

## 2026-09-05 — CR Evaluator / Round 5

- Story ID：11.7
- 结果：FAIL；3/3 P1确认，0 P2，Owner Gate=`NONE`，且明确禁止通用TOML/JS meta-parser扩张。
- 授权：仅focused test与本轮evaluation append；逐项RED→GREEN，仅跑focused/diff。
- 下一步判断：启动fresh Fixer Round5。

## 2026-09-05 — CR Fixer / Round 5

- Story ID：11.7
- 结果：3/3有限P1已修复，evaluation已追加fix record，Owner Gate NONE。
- RED/GREEN：clause role-swap、`report_dir`、second aliased import与indirect helper均先证明旧oracle假绿；最终focused=`10/10`。
- Fix：complete-clause support allowlist+对称delimiter；existing TOML parser recursive semantic paths；all static fs named bindings与discovery local-function reachability。
- Verification：root exact related=`53/53`；exact affected=`225 pass/4 fail`，四项仍仅drawer fixed-count drift；未跑build/full/packaging。
- 下一步判断：启动fresh Reviewer Round6三层复审。

## 2026-09-05 — CR Reviewer / Round 6

- Story ID：11.7
- 结果：FAIL；fresh aggregator将三层候选收敛为2 P1/0 P2，Owner Gate NONE。
- P1：保持fragment/count的完整clause role-swap与既有`{` boundary；多行static fs import、`writeFileSync` original binding与leading-whitespace local declaration。
- Rejected：TOML arrays/array-of-table/inline-table超出Round5有限matrix，不进入修复。
- 下一步判断：启动fresh Evaluator Round6。

## 2026-09-05 — CR Evaluator / Round 6

- Story ID：11.7
- 结果：FAIL；2/2 P1确认，0 P2，Owner Gate=`NONE`；维持TOML arrays rejected。
- 授权：仅focused test与evaluation append；只处理exact clause/boundary及current fs original/import/declaration集合。
- 下一步判断：启动fresh Fixer Round6。

## 2026-09-05 — CR Fixer / Round 6

- Story ID：11.7
- 结果：2项P1的5个具体assertion均RED→GREEN，evaluation已追加fix record，Owner Gate NONE。
- Fix：true complete-clause role swap、`{` boundary、多行named import、`writeFileSync`拒绝、leading-whitespace local reachability。
- Verification：focused10/10；root exact related53/53；affected225 pass/4 fail且仍仅drawer；未跑build/full/packaging。
- 下一步判断：启动fresh Reviewer Round7三层复审。

## 2026-09-05 — CR Reviewer / Round 7

- Story ID：11.7
- 结果：Blind/Acceptance PASS、Edge FAIL；fresh aggregator独立重放后确认1 P1/0 P2，Owner Gate NONE。
- P1：nested local declaration截断enclosing discovery section，使声明后的direct call绕过local-function reachability。
- 边界：该项属于Round5/6既有有限授权，不是通用parser扩张。
- 下一步判断：启动fresh Evaluator Round7。

## 2026-09-05 — CR Evaluator / Round 7

- Story ID：11.7
- 结果：FAIL；唯一P1确认，Owner Gate=`NONE`。
- 授权：focused test内有限declared-function body-span扫描+evaluation append；禁止AST/通用JS parser。
- 下一步判断：启动fresh Fixer Round7。

## 2026-09-05 — CR Fixer / Round 7

- Story ID：11.7
- 结果：唯一P1已RED→GREEN，evaluation已追加fix record，Owner Gate NONE。
- Fix：quote/comment-aware有限body-span扫描，nested declaration不再截断enclosing body，unsupported/duplicate/unbalanced fail-close。
- Verification：focused10/10；root related53/53；affected225 pass/4 fail且仍仅drawer；未跑build/full/packaging。
- 下一步判断：启动fresh Reviewer Round8三层复审。

## 2026-09-05 — CR Reviewer / Round 8

- Story ID：11.7
- 结果：三层均PASS；fresh aggregator正式Reviewer verdict=`PASS`，P1=0、P2=0、Owner Gate NONE。
- Evidence：focused10/10；Round1–7 confirmed items均保持关闭；rejected通用parser/TOML array/meta-test未重开。
- Caveat：drawer fixed-count drift仅保留为范围外例外。
- 下一步判断：启动fresh Evaluator Round8。

## 2026-09-05 — CR Evaluator / Round 8

- Story ID：11.7
- 结果：独立`PASS`，P1=0、P2=0、Owner Gate=`NONE`；latest Reviewer/Evaluator双PASS。
- Decision：允许进入CR04；不得绕过CR04/05/06直接finalize。
- 下一步判断：严格串行启动CR04 rules extraction。

## 2026-09-05 — CR04 / CR05 / CR06 Closeout

- CR04：新增`CR-API-42`、`CR-TEST-08`、`CR-TEST-09`；downstream physical-owner规则去重更新既有`CR-SEC-20`。
- CR05：evidence-based no-op；Round1–8无P2/deferred候选，rejected parser/AST/meta-test与drawer未登记。
- CR06：latest Round8双PASS与completion `PASS_EQUIVALENT`身份核验通过；Story/tracker `review -> done`，Epic11仍`in-progress`，Story11.8仍`ready-for-dev`。
- Verification：related53/53；canonical checker warn/strict均`status=ok`、`findings=[]`；未commit/push。
- 下一步判断：允许outer owner严格串行进入Story11.8 preflight/kickoff。
