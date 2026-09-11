# Experiments（实验记录）

## 2026-09-03 — Preflight / Round 0

- Story ID：11.4
- 执行项：`goal-orchestrator-epic-story-code-review-runner` Next Story Gate / Step 0–1
- 选择原因：Story 11.3已满足development、completion gate、最新Reviewer/Evaluator双通过、CR04/05/06、日志与Story/tracker done全部条件，strict-serial允许进入Story 11.4。
- 结果：确认11.1–11.3均`done`；11.4为`ready-for-dev`且无kickoff/CR历史。`analysis_artifacts` root与fresh subject directories已由11.2投影，但Analysis producers/help/metadata/docs仍存在Planning-root旧路由；TODO-012只在11.4覆盖范围内部分关闭。
- 下一步判断：启动fresh`bmad-dev-story story 11-4`。Kickoff需先锁定exact producer/path matrix、三空间边界、legacy no-migration和negative corpus分类。

## 2026-09-03 — Development Process Recovery

- Story ID：11.4
- 执行项：outer orchestrator recovery gate
- 触发原因：首个fresh development Agent已生成kickoff gate并落盘多文件candidate，Story/tracker进入`in-progress`；但长时间无工具进程、未响应多次状态与最终收敛请求，且始终未生成completion gate或最终验证记录。
- 处置：中断该Agent；保留落盘内容作为未受信candidate，避免在Epic 11 mixed worktree中误回滚前序Story，但不将其视为合规development完成。
- 下一步判断：启动全新的`bmad-dev-story` development recovery，独立读取Skill/Story/kickoff与candidate diff，修正并完成bounded implementation和completion gate后才可进入Reviewer。

## 2026-09-03 — Fresh Development Recovery Result

- Story ID：11.4
- 执行项：`bmad-dev-story` recovery
- 选择原因：恢复fresh development ownership与completion evidence，防止无响应Agent的candidate直接进入CR。
- 结果：独立审计并采用candidate，无Owner blocker或越界源码；kickoff/completion gates均`PASS`，Story/tracker进入`review`。五类producer、ZH/EN/references/manifests/help/docs/fixtures与focused test完成Analysis subject routing；existing legacy保持no-migration。
- 验证：focused 4、affected 55、canonical focused 61、full 495 passed/4 todo；active scan无violation，broad 575 hits完成historical/frozen分类；canonical warn+strict/density/docs/build/packaging/diff均通过。系统Python缺`tomllib`时按项目既有方案使用`/opt/homebrew/bin/python3.12`。
- 下一步判断：启动fresh`bmenhance-cr-01-reviewer 11-4` Round 1。

## 2026-09-03 — Reviewer Round 1 Process Invalidated

- Story ID：11.4
- 执行项：outer orchestrator review-integrity gate
- 触发原因：Round 1 summary声称当前上下文未提供Agent调度工具，因而单上下文串行覆盖三层；但Reviewer Skill明确要求Agent-based独立layers，且实际工具可用。其通过结论缺少所声明cross-agent review的真实证据。
- 处置：保留Round 1 summary作为失效流程记录，不修改其findings或直接进入Evaluator；启动fresh replacement Reviewer。由于平台总并发4槽且外层/root+Reviewer占2槽，replacement需并行启动两个独立layer并自身完成第三layer，如实记录资源约束。
- 下一步判断：replacement输出Round 2但按full-scope首轮审查执行，并明确supersede无效Round 1；之后才可启动fresh Evaluator。

## 2026-09-03 — CR Reviewer / Round 2 (Valid Full-scope)

- Story ID：11.4
- 执行项：`bmenhance-cr-01-reviewer` integrity recovery
- 执行方式：第一次replacement reviewer因其子任务上下文真实无collaboration工具而未写产物；额度恢复后由外层并行启动Blind/Edge/Acceptance三个fresh GPT-5.5只读layers，再由fresh aggregator生成Round 2 summary。
- 结果：不通过。Blind两项高patch被aggregator独立复现：raw`resolve config`缺legacy artifact-root fallback；Product Brief/PRFAQ subject-dir表达式错过旧Planning root-level artifacts。Edge无finding；Acceptance与aggregator确认`575`精确计数缺命令为低defer，active scan clean。
- 验证：aggregator focused 3 files / 17 tests通过，并完成CLI与contract定向复现；三个layers各自提供独立测试/scan证据。
- 下一步判断：启动fresh`bmenhance-cr-02-evaluator 11-4` Round 2，不得由Reviewer直接授权修复。

## 2026-09-03 — Concurrent Worktree Drift Audit

- 触发：Round 2 summary落盘后canonical hook首次从development时`core=18/findings=[]`变化为`core=19`与5个warnings。
- 只读定位：新增untracked`assets/source/speclite/core-skills/speclite-mermaid-er-modeler/`，导致core module-help缺row与packaging manifest缺4 files；三个Reviewer layers与aggregator均声明只新增summary或零写入，且该core Skill不在Story11.4范围。
- 处置：视为并发外部/用户worktree变更，保留且不修改、不删除、不纳入11.4 Fixer。后续canonical/full packaging结果必须把该unrelated drift与11.4 scoped结果分开报告。

## 2026-09-03 — CR Evaluator / Round 2

- Story ID：11.4
- 执行项：`bmenhance-cr-02-evaluator`
- 结果：`DECISION_NEEDED`。Reviewer #1/#2均确认真实且为P1，但从patch改裁为decision_needed：public resolved artifact-root consumption contract与PB/PRFAQ legacy root-level vs new subject-dir precedence/write policy均无唯一owner答案。#3 broad scan 575复现性为P2 CR TODO。
- 验证：focused 3 files/17 tests通过；CLI/API复现raw key输出`{}`而resolver返回planning/legacy-compatible；contract复现new subject paths不命中旧root-level basename。
- 下一步判断：Owner关闭两个P1决策前不启动Fixer；外部core Skill drift保持隔离。

## 2026-09-04 — Owner Decision Closed / Round 2

- Story ID：11.4
- 用户裁决：明确回复`确认 A+B`。
- 决策A：保留`speclite resolve config` raw merged-config语义；新增独立machine-readable`speclite resolve artifact-roots` surface，投影Story11.1 resolver的root、mode与provenance；受影响Analysis Skills改为消费该surface。
- 决策B：仅在`analysis_artifacts`为`legacy-compatible`时启用PB/PRFAQ旧root-level discovery；new subject artifact存在则优先new，只有legacy存在则resume/write in place，两者均无则在new subject path创建；distillate/stage/verdict跟随选中main目录；不迁移、复制、删除或重写旧artifact。
- 下一步判断：启动fresh Fixer Round 2；#3 broad scan evidence hygiene不进入本轮fix，留CR05。

## 2026-09-04 — CR Fixer / Round 2

- Story ID：11.4
- 执行项：`bmenhance-cr-03-fixer`
- 结果：完成Owner A+B两项P1受控修复。新增`resolve artifact-roots` public surface并保持raw `resolve config`；五个Analysis producer Skill改为消费resolver-backed roots；Product Brief/PRFAQ增加legacy-compatible root-level discovery与selected-main同目录策略，禁止migration/copy/delete/rename/rewrite。
- 验证：focused 3 files/20 tests通过；focused+contract 5 files/34 tests通过；resolve CLI/activation 2 files/20 tests通过；CLI e2e raw-config negative guard通过；build/docs/packaging/density/diff通过。Full `npm test`当前仅因外部untracked`assets/source/speclite/core-skills/speclite-drawer-er-modeler/`导致core count 18->19、total 68->69的固定基线断言失败；canonical warn/strict也仅报该external module-help row。
- 下一步判断：进入fresh Reviewer/Evaluator复审复评；不得直接CR04-06或Done。

## 2026-09-04 — Fixer Round 2 Process Recovery

- 触发：Fixer已落盘shared CLI/helper/tests与fix record，但长时间无验证进程/文件更新，未响应多次状态和最终收敛请求；同时违反外层明确约束，直接修改了三份编排日志。
- 处置：中断该Agent；其产品改动与fix record保留为未受信candidate，三份日志中的“Fixer完成”仅作为candidate自述，不用于进入Reviewer。
- 下一步判断：启动全新Fixer Recovery，逐项对照Owner A+B、实际diff与tests独立接管；必要时重写/删除越界内容，并在evaluation追加superseding recovery record后才可Reviewer Round3。

## 2026-09-04 — Fresh Fixer Recovery Result / Round 2

- 结果：fresh GPT-5.5 Fixer独立审计并采用首个Fixer candidate，无需源码重写；evaluation追加superseding recovery record，流程ownership已恢复。
- 覆盖：raw`resolve config`负向兼容、新`resolve artifact-roots`payload/CLI errors/provenance、五producer activation、PB/PRFAQ四种存在性组合与explicit禁用legacy、related artifacts同目录、no-migration及controlled correction均核验通过。
- 验证：focused 5 files/34与2 files/20通过；CLI e2e/negative guards、build/docs/packaging/density/diff通过。Affected/full/canonical红色仅由外部drawer core package改变固定counts及缺module-help row造成，Story11.4 scoped surfaces无failure。
- 下一步判断：启动fresh Reviewer Round3三层复审；Reviewer/Evaluator双通过前不得CR04。

## 2026-09-04 — CR Reviewer / Round 3

- Story ID：11.4
- 执行项：`bmenhance-cr-01-reviewer` Round 3复审
- 执行方式：外层启动三个fresh GPT-5.5只读layers。Blind Hunter与Edge Case Hunter完成；Acceptance Auditor在`tsx` IPC `listen EPERM`后请求非sandbox执行并停在`waitingOnApproval`，外层按权限约束不批准，标记该层不可用。
- 结果：不通过。Blind新增1项高patch：tracked `release/packaging-manifest.json`吸入外部untracked`speclite-drawer-er-modeler` inventory/hash，导致release evidence与Story11.4隔离边界不一致。Edge新增1项中patch：`resolveAnalysisDocumentRoute()`未约束`projectName` basename，也未确认existing candidate为project-local regular file / 非symlink。
- 验证：`npx vitest run test/resolve-readers.test.ts test/analysis-artifact-routing.test.ts test/artifact-root-resolution.test.ts test/contract-anchors.test.ts test/cli-message-catalog.test.ts --reporter=dot` -> 5 files / 34 tests passed；canonical strict -> D0 `module-help.missing-row` for external drawer；`git diff --check` passed。
- 下一步判断：启动fresh`bmenhance-cr-02-evaluator 11-4` Round 3。Evaluator需区分Story11.4-owned helper边界问题、外部drawer governance问题与可defer/dismiss项。

## 2026-09-04 — CR Evaluator / Round 3

- Story ID：11.4
- 执行项：`bmenhance-cr-02-evaluator` Round 3
- 结果：两个Round3 findings均确认有效。Finding #1评为P1阻塞但改裁为`decision_needed / canonical-governance`：外部`speclite-drawer-er-modeler`已进入manifest/hash且缺module-help row，必须先做canonical D0治理，不授权11.4 Fixer直接纳入或修外部core package。Finding #2评为P1 bounded patch：`resolveAnalysisDocumentRoute()`需补basename、regular-file与symlink/path boundary。
- 验证：Evaluator仅新增evaluation文件；复跑canonical checker仍为warning且唯一finding为`module-help.missing-row` for drawer，`git diff --check -- <evaluation-file>`通过。
- 下一步判断：先按hook要求运行canonical governance并关闭D0；随后启动fresh Fixer Round3只修Finding #2相关helper/test，除非governance已独立处理Finding #1。

## 2026-09-04 — Round 3 Concurrent Artifact Invalidated / Reviewer Round 4 Replacement

- Story ID：11.4
- 执行项：`bmenhance-cr-01-reviewer` provenance recovery
- 触发原因：三个正式fresh只读layer实际均已完成，但并发落盘的Round 3 summary错误记录Acceptance不可用，并遗漏Blind的fresh lifecycle与public docs findings；其Evaluation继承错误evidence set。
- 处置：保留Round 3 summary/evaluation作为失效流程证据，明确禁止据此启动canonical governance或Fixer；fresh aggregator只读审计后以Round 4生成不覆盖的replacement summary。
- 结果：Round 4不通过。三项Story-owned patch为fresh config-absent `resolve artifact-roots --lifecycle fresh`失败、public resolver docs仍为两命令旧口径、route helper未防护unsafe basename/directory/non-file/symlink boundary。Acceptance为`PASS_WITH_LOW_DEFER`；外部drawer仅为unrelated caveat；Round 2 #3继续P2 defer。
- 下一步判断：启动fresh `bmenhance-cr-02-evaluator 11-4` Round 4；不得沿用失效Round 3 Evaluation。

## 2026-09-04 — CR Evaluator / Round 4

- Story ID：11.4
- 执行项：`bmenhance-cr-02-evaluator`
- 结果：`FIX_REQUIRED`。fresh config-absent public resolution、四处public resolver docs旧口径、Analysis route helper portable basename/regular-file/symlink boundary三项均确认有效并评为P1 `patch`。
- 决策：Owner A+B与Story11.1 pure resolver contract已足够授权最小修复；无需新增Owner gate。失效Round 3、外部drawer drift与Round 2 #3 P2均明确排除。
- 下一步判断：启动fresh `bmenhance-cr-03-fixer 11-4` Round 4，仅执行evaluation精确授权；完成后重新三层Reviewer与fresh Evaluator。

## 2026-09-04 — CR Fixer / Round 4

- Story ID：11.4
- 执行项：`bmenhance-cr-03-fixer`
- 结果：三项P1均完成。fresh config-absent只在精确`ENOENT`分支进入pure resolver；四处public docs补齐`artifact-roots`；route helper对portable basename、project boundary与regular non-symlink file fail closed，同时保持Owner B precedence/no-migration。
- 验证：focused 3 files/26 tests、CLI A/B矩阵、build、docs、packaging、diff通过；canonical warn/strict均`status=ok/findings=[]`。Full为491 passed/4 todo/12 failed，12项均由外部drawer令固定count从18/68漂移至19/69导致，未纳入或修复。
- 范围审计：仅evaluation授权源码、四份docs、focused tests与有效Round4 evaluation追加记录；未修改Story/tracker/gate/编排日志/CR04-06/TODO/rules/外部drawer。
- 下一步判断：启动fresh Reviewer Round 5三层只读审查，随后fresh Evaluator；不得直接closeout。

## 2026-09-04 — CR Reviewer / Round 5

- Story ID：11.4
- 执行项：`bmenhance-cr-01-reviewer`三层复审与fresh aggregator
- 结果：不通过。Blind确认TS route helper仅被tests引用，实际installed Product Brief/PRFAQ Markdown仍只按path拼接与`exists`选路，缺portable basename、project-local regular non-symlink与symlink/HALT runtime指令；Edge复现trimmed只用于校验、原始`projectName`仍生成带首尾空格basename。Acceptance按AC通过，但未覆盖上述实际执行链缺口。
- 验证：focused 3 files/26、fresh CLI、docs/build/packaging/diff、canonical check通过；full仅外部drawer固定count导致12 failures。Aggregator按3/3 provenance裁决2项阻塞，外部drawer与Round2#3 P2均保持隔离。
- 流程caveat：Acceptance运行build/packaging产生工具副作用，已如实记录；未据此扩大Story范围或视为修复授权。
- 下一步判断：启动fresh `bmenhance-cr-02-evaluator 11-4` Round 5。

## 2026-09-04 — CR Evaluator / Round 5

- Story ID：11.4
- 执行项：`bmenhance-cr-02-evaluator`
- 结果：`FIX_REQUIRED`。两项均确认有效并评为P1 `patch`：installed PB/PRFAQ Markdown需同步portable/project-local/regular non-symlink/symlink escape HALT语义；helper应使用trimmed project name生成basename。
- 决策：现有Owner B足够，内部空格与Unicode保持合法，首尾空格采用trim后identity而非直接拒绝。Round4主体三项已关闭；外部drawer、Acceptance工具副作用与Round2#3 P2均排除。
- 下一步判断：启动fresh `bmenhance-cr-03-fixer 11-4` Round 5，范围仅两份workflow Markdown、route helper与focused test。

## 2026-09-04 — CR Fixer / Round 5

- Story ID：11.4
- 执行项：`bmenhance-cr-03-fixer`
- 结果：两项P1均完成。helper改用trimmed project name生成PB/PRFAQ main/distillate basename并保留内部空格/Unicode；两份installed workflow同步portable single filename、project-local regular non-symlink、symlink escape/non-ENOENT错误HALT与ENOENT-only missing语义。
- 验证：`test/analysis-artifact-routing.test.ts` 1 file/9 tests通过；targeted workflow contract scan、canonical checker与scoped `git diff --check`通过。未运行会刷新未授权生成物的build/packaging/full。
- 范围审计：只修改evaluation授权的两份workflow、route helper、focused test与有效Round5 evaluation追加记录；外部drawer/manifest/module-help、其它docs/Skill、Story/tracker/gates/logs/CR04-06/TODO/rules均未修改。
- 下一步判断：启动fresh Reviewer Round 6三层只读复审，随后fresh Evaluator；不得直接closeout。

## 2026-09-04 — CR Reviewer / Round 6

- Story ID：11.4
- 执行项：`bmenhance-cr-01-reviewer`三层复审与fresh aggregator
- 结果：不通过。Edge确认existing regular candidate仅以`lstat().isFile()`分类，未在route selection阶段验证readability；Blind确认两份workflow的Load Config未把raw merged`core.project_name`绑定为后续`{project_name}`。Acceptance按AC通过，但未覆盖这两个执行链细节。
- 验证：focused 3 files/27与1 file/9、fresh artifact-roots CLI、raw config project_name、docs、canonical与scoped diff通过；未运行有副作用的build/packaging/full。Round4/5 findings保持closed。
- 下一步判断：启动fresh `bmenhance-cr-02-evaluator 11-4` Round 6，独立裁定readability gate与project-name binding。

## 2026-09-04 — CR Evaluator / Round 6

- Story ID：11.4
- 执行项：`bmenhance-cr-02-evaluator`
- 结果：`FIX_REQUIRED`。readability与project-name binding均确认有效并评为P1 `patch`。
- 决策：不用`access(R_OK)`作为最终contract，采用`open(candidate.absolutePath,"r")`后close的实际readability probe；`ENOENT`仍是唯一missing，其他open/read failure HALT。PB/PRFAQ必须显式从raw merged config `core.project_name`绑定`{project_name}`，缺失/非string/trim空在route selection前HALT。
- 排除：Round4/5 findings保持closed；external drawer、`.agents/.claude`镜像、build/packaging副作用、Round2#3 P2与CR04-06均不进入Fixer。
- 下一步判断：启动fresh `bmenhance-cr-03-fixer 11-4` Round 6，范围仅route helper、两份workflow与focused test。

## 2026-09-04 — CR Fixer / Round 6

- Story ID：11.4
- 执行项：`bmenhance-cr-03-fixer`
- 结果：两个P1均完成。route helper在既有path/symlink/lstat门槛后执行`open("r")`readability probe并在finally close；仅`ENOENT`视为missing。PB/PRFAQ Load Config显式绑定raw merged`core.project_name`，missing/non-string/trim-empty在route selection前HALT。
- 验证：focused 1 file/9 tests、targeted workflow scan、canonical checker与scoped diff通过；未运行build/packaging/full，未触碰外部drawer或其它排除范围。
- 下一步判断：启动fresh Reviewer Round 7三层只读复审，随后fresh Evaluator；不得直接closeout。

## 2026-09-04 — CR Reviewer / Round 7

- Story ID：11.4
- 执行项：`bmenhance-cr-01-reviewer`三层复审与fresh aggregator
- 结果：`REVIEWER_PASS`。Blind、Edge、Acceptance均无Story-owned blocking finding；aggregator独立复核后确认Round4-6全部findings关闭。
- 验证：focused 3 files/27、fresh artifact-roots CLI、raw config project_name、docs、active negative scan、canonical warn/strict与scoped diff通过。按只读约束未运行build/packaging/full。
- Caveat：Round2#3继续P2 defer；external drawer fixed-count与`.agents/.claude`旧镜像不属于11.4 scope。
- 下一步判断：启动fresh `bmenhance-cr-02-evaluator 11-4` Round 7；不得直接closeout。

## 2026-09-04 — CR Evaluator / Round 7

- Story ID：11.4
- 执行项：`bmenhance-cr-02-evaluator`
- 结果：`EVALUATION_PASS`，无需Fixer，允许进入CR04。独立确认Round4-6全部P1关闭，Reviewer Round7 no findings结论可接受。
- 验证：focused 3 files/27、fresh CLI、raw config、docs、canonical warn/strict、active negative scan与scoped diff均通过；按只读约束未运行build/packaging/full。
- 残余：Round2#3维持P2 CR TODO；Round3失效；external drawer、`.agents/.claude`镜像及full fixed-count caveat与11.4隔离。
- 下一步判断：严格串行启动fresh CR04 Rules Extractor，完成后才能CR05。

## 2026-09-04 — CR04 Rules Extractor

- Story ID：11.4
- 执行项：`bmenhance-cr-04-rules-extractor`
- 结果：在`cr-rules-summary.md`落地3条record-only规则：`CR-API-40` raw config/effective artifact-root surface分层、`CR-SEC-19` portable/project-local readable regular route candidate、`CR-DOC-05` installed Markdown与executable helper安全/config binding一致。
- 去重/排除：public docs closed-list由上述规则覆盖；Round2#3 P2留CR05；Round3 invalid provenance、drawer/mirror/full caveat不沉淀。
- 验证：规则文件diff check与canonical warn/strict通过。
- 下一步判断：严格串行启动fresh CR05 TODO Tracker，完成后才能CR06。

## 2026-09-04 — CR05 TODO Tracker

- Story ID：11.4
- 执行项：`bmenhance-cr-05-todo-tracker`
- 结果：新增`TODO-015`，P2/open，记录Round2#3 broad scan `575`缺少可复现命令的evidence hygiene问题；现有backlog无等价项，open计数6→7。
- Closure：需记录可复现command、regex、scope、include/exclude globs、per-bucket counts，并明确旧575采用/替换/作废。
- 排除：未登记已关闭P1、失效Round3、external drawer、镜像或full count caveat。
- 下一步判断：严格串行启动fresh CR06 Finalizer，确认Story/tracker done。

## 2026-09-04 — CR06 Finalizer / Next Story Gate

- Story ID：11.4
- 执行项：`bmenhance-cr-06-finalizer`
- 结果：Story状态`review -> done`，sprint tracker对应行`review -> done`，新增`11-4-cr-finalizer-20260904-main-round-7.md`并绑定Reviewer/Evaluator hash、completion gate、CR04/05证据。
- 验证：CR06 scoped diff check通过；Story/tracker重读均`done`，11.5仍`ready-for-dev`；无P0/P1残留。
- 边界：未启动11.5、未修改外部drawer/镜像/full fixed-count baseline、未commit/push。
- Next Story Gate：通过，允许进入Story11.5 preflight。
