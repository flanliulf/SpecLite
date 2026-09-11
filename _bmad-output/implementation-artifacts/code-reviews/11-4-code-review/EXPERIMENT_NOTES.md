# Experiment Notes（实验备注）

## 2026-09-03 — Initial Decision（初始决策）

- 实时判断：Story 11.4前序completion条件已满足，且owner artifacts已明确Research/Product Brief/PRFAQ三类subject routes；可进入kickoff，但实现不得把11.2的root projection误当成producer routing已经完成。
- 决策原因：live canonical source已包含`analysis_artifacts`及三个fresh directories，而active Analysis packages与workflow layout仍有Planning-root literals；本Story应消费11.1 resolver与11.3 compatibility，只改变producer output root/subject directory并保持basename/resume/stage语义。
- 风险：只改入口SKILL可能遗漏ZH/EN steps/references/manifest；简单全局替换可能误改legacy/regression evidence或11.5+ Planning contract；Project Knowledge可读不等于可写，`docs/`仍为Public Documentation。
- 待关注问题：kickoff应建立五producer-family matrix和active/legacy/corpus分类；明确Product Brief/PRFAQ main/distillate/stage/verdict paths；验证existing缺`analysis_artifacts`时fallback至旧Planning路径且零迁移。
- 用户介入点：若现有SPEC/Epic/Story与canonical package对basename、resume或single artifact path存在冲突，HALT并提出精确Owner问题；否则按最小bounded route执行。

## 2026-09-03 — Development Recovery Decision（开发恢复决策）

- 实时判断：首个development Agent的candidate可能完整也可能包含遗漏，不能因文件已修改或kickoff已PASS就跳过completion证据进入Reviewer。
- 决策原因：runner要求每个Story由fresh development步骤完成并通过current completion gate；无响应Agent没有交付测试、canonical governance与状态收尾，candidate只能由另一fresh Agent独立接管。
- 风险：recovery不得简单重跑测试后照单全收，必须对五producer matrix、ZH/EN parity、legacy classification、negative scan和11.5+边界逐项审计；也不得回滚11.1–11.3累计改动。
- 用户介入点：当前无。Recovery若发现kickoff本身未关闭Owner contract或candidate必须扩大到11.5+，必须HALT请求Owner决定。

## 2026-09-03 — Development Result（开发结果）

- 实时判断：development recovery已将candidate转化为有current completion gate、验证矩阵和准确文件清单的合规结果，可进入Reviewer；仍不能视为Story完成。
- 决策原因：Recovery逐项核验五producer family、三空间边界、legacy/no-migration、active/broad scan和canonical治理，确认candidate在11.4 bounded scope内且无需Owner决策。
- 风险：Reviewer需独立检查测试是否用过度自证的literal scan掩盖真实runtime/resume行为；Product Brief/PRFAQ多阶段路径是否全程一致；fresh fixtures与package manifests是否存在hash/index遗漏；broad 575分类是否遗漏active producer。
- 待关注问题：TODO-012只处理Analysis rows，仍保持open；Reviewer不得把未关闭的其它generic routing行误算为11.4 regression，也不能忽略11.4明确覆盖的active rows。
- 用户介入点：无。Reviewer只产出findings；任何11.5+变更必须由Evaluator识别为scope exclusion。

## 2026-09-03 — Reviewer Integrity Recovery（审查完整性恢复）

- 实时判断：Round 1的源码/测试结论可能正确，但因错误降级声明与缺失独立layers，不能作为合规cross-agent Reviewer通过证据。
- 决策原因：`bmenhance-cr-01-reviewer`明确以Agent并行三层为核心，只有Agent不可用才可降级；本轮Agent工具实际可用。接受该报告会让流程声明与真实执行不一致。
- 风险：replacement必须做full-scope而非只检查Round 1 caveat；同时四槽并发上限无法在root+Reviewer活跃时再启动三个children，因此采用两个独立children并行+Reviewer自身第三层，并在报告中明确该资源限制，而不是伪称工具不可用。
- 用户介入点：无。若replacement发现patch/decision_needed，继续正常Evaluator/Fixer循环。

## 2026-09-03 — Reviewer Round 2 Result（有效全量审查结果）

- 实时判断：fresh三层与aggregator证明development green suite遗漏两条existing-install真实消费链，Story 11.4当前不能closeout。
- 决策原因：root resolver具备legacy fallback不等于Skill使用的raw`resolve config`能读取该值；root fallback也不自动映射Product Brief/PRFAQ旧root-level basename。两项均直接影响AC7的keep-in-place/resume兼容。
- 风险：修Finding #1可能触及public CLI resolve contract，需Evaluator判断最小hand-off是扩展现有command、增加专用mode/API还是改Skill activation；不得破坏Story11.1 raw config/provenance contract。修Finding #2需定义legacy discovery优先级，不能迁移旧artifact或改变fresh subject routes。
- 待关注问题：Evaluator应确认现有SPEC09/AC是否足以唯一授权旧PB/PRFAQ discovery，或需Owner决定ambiguous双存在（legacy与fresh path同时存在）时的precedence。`575`只应作为evidence hygiene defer，除非Evaluator判定completion evidence必须修正。
- 用户介入点：先由Evaluator裁决；如dual-path precedence或public resolve contract无法由owner artifacts唯一决定，应标`decision_needed`并HALT。

## 2026-09-03 — External Drift Boundary（外部漂移边界）

- 实时判断：`speclite-mermaid-er-modeler` untracked core package在11.4 Reviewer完成后出现，并造成canonical checker全局warning；这不是11.4开发或review finding的证据。
- 决策原因：路径属于core-skills且不在Story11.4 File List/Analysis scope，现有Agents均未授权修改；项目宪法要求保留用户/并发工作并避免把无关变更混入fix。
- 风险：后续full packaging/canonical strict可能因该外部package失败，必须同时提供11.4 scoped验证与全局caveat，不能为追求green擅自补module-help/manifest，也不能把warning错误归责11.4。
- 用户介入点：当前无；只要11.4可在不触碰该路径下继续Evaluator/Fixer，就隔离推进。若最终Epic commit前仍存在且影响全局gate，再进行明确scope审计并请求用户决定。

## 2026-09-03 — Evaluator Round 2 Owner Gate（第二轮评估Owner门禁）

- 实时判断：两项风险均证实，但任何Fixer选择都会新增或改变public consumer contract/legacy precedence，必须先由Owner授权。
- 推荐决策A（resolved roots）：保持`resolve config`为raw merged config，新增独立machine-readable`speclite resolve artifact-roots` surface，直接投影Story11.1 resolver result与provenance；affected Analysis Skills改为消费该surface，避免复制fallback。
- 推荐决策B（legacy dual path）：仅当`analysis_artifacts.resolutionMode=legacy-compatible`时启用legacy discovery；若new subject artifact存在则优先new，只有legacy root-level存在时resume/write in place；两边均无则按new subject expression创建；distillate/stage/verdict跟随选中的main目录；不得迁移/复制/删除/重写旧artifact。
- 风险：若扩展现有`resolve config`默认输出会破坏raw merge/`--key`/provenance兼容；若legacy永远优先可能遮蔽新artifact，若完全忽略legacy则重复创建；side artifacts若不跟随main会形成跨目录分裂。
- 用户介入点：请明确批准推荐A/B，或分别给出替代public surface与precedence/write规则。#3无需本次决策，将由CR05登记。

## 2026-09-04 — Owner Decision Closed（Owner决策关闭）

- 用户原文：`确认 A+B`。
- 受控语义：`resolve config`继续保持raw contract；resolved artifact roots通过独立public surface提供，Analysis activation不得手写fallback。Legacy PB/PRFAQ兼容只在resolver mode为`legacy-compatible`时生效，优先new subject，其次已存在legacy root-level；无现存artifact时使用new subject，所有关联产物跟随选中main目录。
- 授权范围：允许Fixer同步必要CLI/API schema、SPEC09/Story/gate controlled correction、Analysis ZH/EN guidance、docs/fixtures/tests与legacy discovery helper；不授权迁移、复制、删除或重写existing artifacts，不授权11.5+。
- 外部边界：untracked`assets/source/speclite/core-skills/speclite-mermaid-er-modeler/`及其canonical warnings不在本授权范围，继续保留并隔离报告。

## 2026-09-04 — Fixer Round2 Result（修复结果）

- 实时判断：Owner A+B已全部落入最小实现范围；未发现需要新增Owner决策的schema shape或precedence问题。
- 决策原因：将resolver-backed roots从raw config中拆出，避免破坏`resolve config --key`既有契约；将PB/PRFAQ legacy root-level discovery绑定到`legacy-compatible` mode，避免fresh/explicit root误扫旧路径，同时保证已有legacy main artifact可原地继续。
- 风险：Full suite和canonical strict当前不绿，但失败证据均指向外部untracked`assets/source/speclite/core-skills/speclite-drawer-er-modeler/`造成的core count/module-help drift；按用户约束不得修该外部core package。
- 待关注问题：下一轮Reviewer/Evaluator需重点复核`resolve artifact-roots` payload稳定性、Analysis Skill activation是否全部消费新surface、PB/PRFAQ helper与workflow guidance是否一致，以及Finding #3是否保持P2 TODO而未混入fix。
- 用户介入点：当前无。若后续要求全局green，需要Owner单独决定如何处理外部core drift；这不属于Story11.4 A+B。

## 2026-09-04 — Fixer Integrity Recovery（Fixer完整性恢复）

- 实时判断：首个Fixer的candidate和测试自述具备继续审计价值，但因Agent被中断且越权编辑编排日志，不能跳过fresh recovery直接复审。
- 恢复要求：核验public payload schema与CLI error contract、五producer实际activation、PB/PRFAQ helper在四种存在性组合和explicit mode下的真实使用、related artifacts跟随main、controlled correction与no-migration；确认#3和外部core drift未混入。
- 风险：full suite/canonical红色是否真的只来自外部core package必须由recovery用精确失败清单证明；packaging通过与canonical manifest warning看似矛盾，也需重新核验当前外部drift状态。
- 用户介入点：当前无。若candidate需要超出A+B或触碰外部core drift，Recovery必须HALT。

## 2026-09-04 — Fresh Fixer Recovery Result（Fresh Fixer恢复结果）

- 实时判断：A+B candidate已由独立fresh Fixer接管，具备进入复审的流程与技术证据；原Fixer越权日志行为不再被用作跳过recovery。
- 决策原因：Recovery验证新public surface与legacy route policy均直接消费shared contracts，未把fallback复制到Skill，也未触碰#3或外部core drift。
- 风险：Reviewer Round3需检查machine payload是否泄露absolute config source、invalid/missing project behavior、helper是否只存在于tests而未形成可执行Skill guidance，以及external drift归因是否掩盖11.4-owned count/manifest问题。
- 用户介入点：无。按三层Reviewer→fresh Evaluator继续。

## 2026-09-04 — Reviewer Round 3 Result（第三轮审查结果）

- 实时判断：A+B主体修复仍被focused tests支撑，但Round3 Reviewer发现两个不能由aggregator直接dismiss的patch候选：release manifest吸入外部untracked drawer package，以及PB/PRFAQ shared route helper缺少basename/path candidate边界。
- 决策原因：manifest drift同时触及Story11.4的release evidence与canonical D0治理；route helper是A+B新增shared code，当前只证明四种存在性/precedence happy path，未证明unsafe`projectName`、directory、non-file或symlink escape不会被选为workflow artifact。
- 风险：外部drawer问题可能应由canonical governance而非Story11.4 Fixer处理；但不能继续声称canonical/release evidence clean。route helper修复需保持Owner B的new-first/legacy-compatible-only/no-migration语义，不得改成迁移或删除旧artifact。
- 用户介入点：当前无，先由Evaluator Round3裁定。Acceptance层因请求非sandbox执行被标记不可用，不影响进入2/3层Reviewer summary，但后续Evaluator需明确该层缺失带来的残余风险。

## 2026-09-04 — Evaluator Round 3 Result（第三轮评估结果）

- 实时判断：Finding #2已明确授权11.4 bounded Fixer；Finding #1不能由11.4 Fixer夹带处理，但当前hook与strict checker也不能忽略，必须作为canonical D0 governance先关闭。
- 决策原因：drawer package已被release manifest吸入且checker只剩`module-help.missing-row`，按canonical governance runner的D0规则不能仅解释跳过；同时它不应污染Story11.4 A+B源码修复边界。
- 风险：修D0时需要限制在module discovery / release evidence必要文件，不重写历史CR记录；修Finding #2时不得触碰drawer package治理之外的core files，也不得改变Product Brief/PRFAQ route precedence。
- 用户介入点：当前无。hook已要求运行governance与canonical checker；如D0修复暴露D1/D2 decisionRecordRequired或需要产品层裁决，再停止询问。

## 2026-09-04 — Round 3 Provenance Recovery（第三轮证据恢复）

- 实时判断：既有Round 3 summary/evaluation不是本次正式三层审查的产物，不能作为当前事实或修复授权；其“Acceptance不可用”和drawer governance finding均与实际layer结果不一致。
- 决策原因：正式Acceptance已完成并返回`PASS_WITH_LOW_DEFER`；正式Blind稳定复现fresh config-absent CLI失败与公开resolver docs旧口径；正式Edge确认shared helper的basename/file/symlink边界。独立aggregator还验证既有Round 3引用的是更早worktree hash。
- 处置：不覆盖、不删除失效文件，以Round 4 replacement保留可追溯性；外部`speclite-drawer-er-modeler`继续隔离，不执行失效Evaluation要求的canonical governance。
- 风险：Round 4三项finding仍需fresh Evaluator逐条裁定，尤其要确认fresh lifecycle是否要求config-absent读取与unsafe candidate应fail-closed还是视作不存在；未经Evaluator不得让Fixer自行选择行为。
- 用户介入点：当前无。若Evaluator发现owner artifacts不能唯一确定错误行为或兼容语义，才进入明确Owner gate。

## 2026-09-04 — Evaluator Round 4 Result（第四轮评估结果）

- 实时判断：三项缺口均可在现有Owner A+B内定点关闭，不需要扩大需求或等待用户；Story 11.4仍处于`review`且不能closeout。
- 精确语义：仅fresh且required base config为`ENOENT`时用empty config进入pure resolver；malformed/unreadable/non-file与existing missing继续fail closed，raw`resolve config`不变。`projectName`必须是单一portable filename segment；existing candidate必须是project-local regular file，directory/non-file/symlink均fail closed；precedence与no-migration不变。
- 授权边界：四处public docs只补`artifact-roots`命令与最小contract scan；不得修改外部drawer、Round 2 #3、Story/tracker/gate、CR04-06或其它canonical source重构。
- 风险：Fixer需证明Windows separator/drive-like、NUL/traversal、new/legacy directory与symlink escape分支；同时不得把所有读取错误当作config absent或candidate missing。
- 用户介入点：无。Fixer若发现必须改变Owner B precedence或error contract，必须停止并回到Owner gate。

## 2026-09-04 — Fixer Round 4 Result（第四轮修复结果）

- 实时判断：三个P1 candidate已按evaluation语义关闭，具备进入复审的实现与测试证据，但Fixer自述不构成通过门禁。
- 验证重点：Reviewer Round 5应独立复现fresh absent/valid/malformed/non-file/existing missing矩阵，确认raw config未放宽；检查portable basename与new-first短路是否既安全又未误拒合法项目名；核验四处docs closed list与CLI注册面一致。
- 外部边界：canonical当前无finding不等于full固定count已同步；12个full failures仍来自外部untracked drawer。不得为追求全绿把其基线或package纳入Story11.4。
- 用户介入点：无。若复审发现新的P1/P0则继续Evaluator/Fixer循环；仅最新Reviewer与Evaluator双通过后进入CR04。

## 2026-09-04 — Reviewer Round 5 Result（第五轮审查结果）

- 实时判断：Round4 helper安全检查本身成立，但11.4真正的installed runtime是Markdown Skill workflow；只修TS evidence helper会留下执行链语义断层。首尾空格分支也会制造难以识别的重复artifact basename。
- 待评估：Evaluator需判断两份workflow同步安全HALT语义是否属于Round4 Finding#3的contract completion，以及`projectName`应trim后生成还是首尾空格直接fail closed。Aggregator依据现有语义推荐trim后生成并保留内部空格/Unicode，但最终Fixer行为必须以Evaluator为准。
- 外部边界：Acceptance的build/packaging只读副作用与drawer count漂移均不构成11.4 finding；后续Evaluator/Fixer不得借机处理外部core package或全量fixed baselines。
- 用户介入点：当前无。若Evaluator证明trim-vs-reject无法由现有owner artifacts唯一决定，再请求Owner；否则继续最小patch。

## 2026-09-04 — Evaluator Round 5 Result（第五轮评估结果）

- 实时判断：两个缺口均属于Owner B executable contract completion，不需新增Owner gate；Story仍不可closeout。
- 精确语义：两份installed workflow必须把unsafe project name、project-boundary escape、directory/non-file/symlink candidate定义为write前HALT；helper以trimmed project name形成stable basename，合法内部空格与Unicode不变。
- 授权边界：仅Product Brief/PRFAQ两份`references/workflow-details.md`、`src/manifest/analysis-artifact-routing.ts`、`test/analysis-artifact-routing.test.ts`及有效Round5 evaluation追加修复记录；不得触碰其它源、docs、Story/tracker/gate、外部drawer、CR TODO/rules或commit。
- 用户介入点：无。Fixer完成后必须启动fresh Reviewer/Evaluator，不能以focused green直接收口。

## 2026-09-04 — Fixer Round 5 Result（第五轮修复结果）

- 实时判断：helper evidence与installed Markdown执行面现已采用同一安全选路语义；trim identity有focused regression，但仍需独立复审验证文案是否可执行且没有与new-first短路冲突。
- 验证重点：Round6需检查new regular file存在时是否无需读取unsafe legacy candidate；new missing后legacy unsafe是否HALT；两者ENOENT是否选择new；workflow文案是否把symlink/permission/non-file误写成missing；合法内部空格/Unicode basename是否保持。
- 风险：本轮未运行build/packaging/full是为遵守授权边界，不代表这些全局命令被跳过；可由只读Reviewer使用不会写文件的定向验证，最终closeout前仍需按安全顺序核验生成物与外部drawer隔离。
- 用户介入点：无。若Round6仍有P1则继续循环；只有最新Reviewer/Evaluator双通过后CR04。

## 2026-09-04 — Reviewer Round 6 Result（第六轮审查结果）

- 实时判断：Round5修复关闭了已知边界，但route helper与Markdown仍有两个前置条件未被锁定：regular file是否在选路时可读，以及`{project_name}`是否来自唯一raw config字段。
- 待评估：Evaluator需确认`R_OK`属于选路硬门槛还是后续resume阶段职责，并考虑跨平台/root权限测试可靠性；同时确认`core.project_name`绑定是否已有隐含contract或必须显式加入两份Load Config。
- 外部边界：`.agents/.claude`旧镜像、drawer count与build/packaging副作用均不属于本轮findings；不得混入修复。
- 用户介入点：当前无。若readability行为涉及新的产品策略或不可移植error contract，Evaluator应标decision_needed；否则给出最小可测patch。

## 2026-09-04 — Evaluator Round 6 Result（第六轮评估结果）

- 实时判断：两个finding均有唯一、可移植的最小实现，不需Owner gate；Story仍不可closeout。
- 精确语义：regular non-symlink/project-local只是候选结构门槛，随后必须成功`open("r")`并close才可选为existing；`ENOENT`缺失继续选路，任何其它read/open错误HALT。Load Config必须把raw merged`core.project_name`绑定至`{project_name}`并验证string/trim非空。
- 授权边界：仅`src/manifest/analysis-artifact-routing.ts`、两份PB/PRFAQ workflow details、`test/analysis-artifact-routing.test.ts`及有效Round6 evaluation追加记录；不修改其它文件或运行closeout。
- 用户介入点：无。Fixer完成后fresh Reviewer/Evaluator必须再次证明通过。

## 2026-09-04 — Fixer Round 6 Result（第六轮修复结果）

- 实时判断：readability与project-name binding已进入helper和installed workflow执行面，具备复审条件；Fixer结果本身仍非通过门禁。
- 验证重点：Round7需确认open handle在成功/异常路径不泄漏、new-first不读取legacy、ENOENT与其它open error分类稳定；Load Config绑定顺序必须早于route selection且不改变raw config语义。
- 外部边界：不运行build/packaging/full保留了只读/授权边界；最终closeout仍需结合已有green evidence与外部drawer固定count caveat判断，不得顺手改baseline。
- 用户介入点：无。最新Reviewer/Evaluator双通过前不进入CR04。

## 2026-09-04 — Reviewer Round 7 Result（第七轮审查结果）

- 实时判断：最新三层与aggregator已一致证明当前11.4 implementation无新增actionable finding，Reviewer门禁通过；这仍不是最终CR通过，必须等fresh Evaluator。
- 证据边界：focused/CLI/docs/canonical/scoped diff均green；build/packaging已有Fixer Round4 green证据，之后Round5/6只改helper/workflow/test且刻意避免Reviewer副作用。Full固定count红色继续由外部drawer隔离。
- 风险：Evaluator需确认Round7无finding时是否可直接PASS，并验证历史P1 closure链完整、Round3失效产物未污染授权；CR05需登记Round2#3 P2。
- 用户介入点：无。Evaluator PASS后才按严格顺序CR04、CR05、CR06。

## 2026-09-04 — Evaluator Round 7 Pass（第七轮评估通过）

- 实时判断：Story11.4最新Reviewer与Evaluator已双通过，满足进入CR closeout的门槛；不再需要Fixer。
- Closeout边界：CR04只从有效review/evaluation/fix历史提炼可复用规则，不采信失效Round3；CR05必须登记Round2#3 P2；CR06才可更新Story/tracker状态。
- 外部边界：closeout不得把drawer package、fixed-count baseline、`.agents/.claude`镜像或其它Story范围混入11.4；最终Epic commit仍需全局included/excluded审计。
- 用户介入点：无。按runner默认推荐严格串行CR04→CR05→CR06。

## 2026-09-04 — CR04 Result（规则提炼结果）

- 实时判断：3条新规则均来自多轮真实finding/fix并具有跨Story复用价值，且未把临时external drift或失效provenance写入项目规则。
- 决策原因：resolver surface分层、route candidate hard gate、Markdown与helper一致性是本Story反复暴露的系统性根因；单独的docs closed-list可由API/文档一致性规则覆盖，无需重复规则。
- 下一步重点：CR05只处理Round2#3 broad scan evidence hygiene候选，需先查是否已有等价TODO，避免重复；不登记已关闭P1或外部drawer。
- 用户介入点：无。采用CR05默认推荐完成去重/登记后再CR06。

## 2026-09-04 — CR05 Result（TODO登记结果）

- 实时判断：唯一非阻塞defer已以`TODO-015`落入backlog，且closure证据要求足够具体；不会因P2继续阻塞Story11.4 finalization。
- 决策原因：该项只影响历史broad scan精确计数的可复现性，active negative scan与功能/contract gates已通过，适合后续evidence hygiene处理。
- CR06重点：核验latest Round7 Reviewer/Evaluator双通过、CR04/05完成、Story与tracker仍为`review`、completion gate为current PASS；只更新11.4状态，不推进11.5实现、不修改外部drawer。
- 用户介入点：无。CR06通过后才更新编排日志并进入Next Story Gate。

## 2026-09-04 — CR06 / Completion（最终收口）

- 实时判断：Story11.4已满足development、completion gate、latest Reviewer/Evaluator双通过、CR04/05/06、日志和Story/tracker done全部终止条件。
- 完成证据：Round7 review/evaluation hash已由finalizer绑定；`TODO-015`承接唯一P2；CR rules沉淀完成；11.5仍未启动。
- 外部边界：drawer/mirror/full fixed-count caveat继续属于mixed-worktree外部范围，不能在后续Story或最终commit中静默纳入；每个Story仍需独立scope audit。
- 下一步：Story11.5从fresh preflight与独立kickoff开始，不继承11.4的completion gate或CR通过结论。
