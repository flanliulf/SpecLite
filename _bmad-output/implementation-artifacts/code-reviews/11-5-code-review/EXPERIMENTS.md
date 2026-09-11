# Experiments（实验记录）

## 2026-09-04 — Next Story Gate / Preflight

- Story ID：11.5
- 执行项：`goal-orchestrator-epic-story-code-review-runner` Step 0–1
- 选择原因：Story11.4已满足development、completion gate、latest Reviewer/Evaluator双通过、CR04/05/06、日志与Story/tracker done全部条件，strict-serial允许进入11.5。
- 结果：11.5为`ready-for-dev`且无kickoff/CR历史；phase-owned roots由11.1–11.3提供，11.5负责PRD/Epics/Architecture whole-sharded单一discovery contract及producer/consumer消费。
- Owner Gate：Story明确要求完整decision table由`SPEC 09`承载或获得Owner批准；live preflight未发现完整table，只发现原则性subject-directory/discovery描述。
- 下一步判断：启动fresh`bmad-dev-story story 11-5`，先运行kickoff；若contract不足则`DECISION_NEEDED`，不得抢跑实现。

## 2026-09-04 — Development Kickoff / Owner Gate

- Story ID：11.5
- 执行项：fresh `bmad-dev-story story 11-5`
- 结果：kickoff gate=`DECISION_NEEDED`，仅新增`11-5-...-story-kickoff-gate.md`，未进入实现或修改Story/tracker/completion gate。
- 证据：`SPEC 09`只有phase roots、fallback/no-migration、确定性发现原则与部分evidence字段，未承载AC5完整decision table/blocking continuation；`SPEC 07`只有generic artifact-path IDs，未映射ambiguity/invalid-sharded/broken-reference/missing-subject四种状态。
- 推荐：批准将Story11.5 AC5表作为同变更`SPEC 09` owner contract，并在`SPEC 07`注册四个stable issue IDs；批准后由fresh development recovery继续。
- 下一步判断：等待Owner明确批准或提供替代contract/mapping，未关闭前不得修改producer/consumer/runtime/tests。

## 2026-09-04 — Owner Decision Closed / Development Resume

- Story ID：11.5
- 用户裁决：明确回复`确认 11.5 推荐方案`。
- 授权：将Story11.5 AC5完整whole/sharded decision table、blocking continuation与required evidence model作为同变更`SPEC 09` contract update；在`SPEC 07`注册四个推荐stable issue IDs。
- Stable IDs：`artifact-path.ambiguous-subject-document-shape`、`artifact-path.invalid-sharded-document-shape`、`artifact-path.broken-shard-reference`、`artifact-path.subject-document-missing`。
- 边界：授权PRD/Epics/Architecture shared discovery与必要producer/consumer/docs/fixtures；不授权migration、UX、validation/readiness/CR、外部drawer或镜像。
- 下一步判断：启动fresh development recovery，关闭kickoff后完成bounded implementation/completion gate。

## 2026-09-04 — Fresh Development Recovery Result

- Story ID：11.5
- 执行项：`bmad-dev-story` recovery
- 结果：Owner contract与bounded implementation完成。`SPEC 09`承载完整decision/evidence/continuation，`SPEC 07`注册四IDs；新增shared read-only discovery resolver与`resolve artifact-documents`，同步PRD/Epics/Architecture producers、shard-doc与9个consumers、metadata/help/docs/fixtures。
- Gates：kickoff保留历史`DECISION_NEEDED`并以controlled correction更新current`PASS`；completion=`PASS_EQUIVALENT`；Story/tracker进入`review`。
- 验证：focused17、isolated affected86、isolated full64 files/522 passed/4 todo、build/docs/isolated packaging/canonical strict/diff通过。Live strict5 findings与18→19/68→69 count漂移均归因外部drawer。
- 边界：未处理UX、11.7-11.10、migration、历史Story、CR logs或IDE mirrors。
- 下一步判断：启动fresh Reviewer Round1三层只读审查。

## 2026-09-04 — CR Reviewer / Round 1

- Story ID：11.5
- 执行项：`bmenhance-cr-01-reviewer`三层审查与fresh aggregator
- 结果：FAIL，3/3层完成。去重后5项：canonical whole/index symlink escape、config-vs-actual mismatch误报missing、reference/query/encoded Markdown links静默少消费为高decision-needed候选；alphabetical sort破坏声明顺序、index self-link重复消费为低patch。
- 验证：focused17通过但未覆盖上述边界；Aggregator独立复现全部候选。External drawer排除；Acceptance误运行packaging只记process caveat。
- 下一步判断：启动fresh `bmenhance-cr-02-evaluator 11-5` Round1，先裁决owner contract与patch范围。

## 2026-09-04 — CR Evaluator / Round 1

- Story ID：11.5
- 执行项：`bmenhance-cr-02-evaluator`
- 结果：FAIL，5项均有效。#1 canonical whole/index symlink escape使用既有`artifact-path.symlink-escape`；#4保留首次声明顺序；#5排除index self-link，三项均P1 patch。#2 mismatch与#3 Markdown grammar为P1 decision-needed。
- Owner问题#2：选择trusted actual-path input或contract-owned finite diagnostic probes；不得把probe当fallback消费。
- Owner问题#3：选择minimal inline-only block策略或bounded CommonMark subset；必须定义query/fragment/percent-decode与malformed/unsupported行为。
- 下一步判断：等待Owner裁决#2/#3；随后fresh Fixer一次性关闭五项，再复审复评。

## 2026-09-04 — Owner Decision M+L Closed / Round 1

- Story ID：11.5
- 用户裁决：明确回复`确认 M+L`。
- M：采用contract-owned finite read-only legacy probes；PRD/Epics历史Planning根级whole，Architecture历史Planning根级whole及explicit Solutioning配置下的Planning architecture subject whole/index。命中仅报告`config-artifact-mismatch`并block，绝不fallback消费、迁移或持久化。
- L：采用无dependency upgrade的bounded CommonMark-compatible subset，支持inline/reference-style local links；解析后剥离query/fragment、单次percent-decode，再做portable/containment/readability；malformed/unsupported local-ish引用以`broken-shard-reference`+`referenceKind` block，external schemes不作为shard。
- 同轮授权：#1 whole/index symlink escape、#4 first-declaration order、#5 exclude index self-link按Evaluator语义修复。
- 下一步判断：启动fresh `bmenhance-cr-03-fixer 11-5` Round1，随后复审复评。

## 2026-09-04 — CR Fixer / Round 1

- Story ID：11.5
- 执行项：`bmenhance-cr-03-fixer`
- 结果：五项P1全部关闭。Canonical whole/index symlink escape、finite mismatch probes、bounded inline/reference/query/fragment/percent grammar、first-declaration order/first-occurrence dedupe与index self-link exclude均落入shared resolver/CLI/tests；SPEC07/09与两份public docs同步M+L contract。
- 验证：discovery29、resolver/portability34、build、docs、canonical normal+strict、packaging与diff通过；full为522 passed/4 todo/12 failed，12项均是external drawer固定counts 18→19/68→69。
- 范围：未改Story/tracker/gates/CR04-06/rules/TODO/drawer/mirrors或commit/push；无新Owner blocker。
- 下一步判断：启动fresh Reviewer Round2三层复审，随后fresh Evaluator。

## 2026-09-04 — CR Reviewer / Round 2

- Story ID：11.5
- 执行项：`bmenhance-cr-01-reviewer`三层复审与fresh aggregator
- 结果：FAIL，3/3层完成；去重后6项P1：Architecture Planning root-level probe在`legacy-compatible`下漏诊、subject directory symlink重绑定authoritative boundary、angle-bracket external误判local、fenced code误扫描、Windows drive-letter被generic scheme静默忽略、nested inline/shortcut reference静默少消费。
- Round1闭环：#1 canonical entry symlink、#4 first-declaration order、#5 index self-link已关闭；#2 mismatch与#3 Markdown grammar仅partial。
- 验证：discovery29、resolver/portability34、docs、canonical warn与diff通过；Aggregator临时复现7/7并清理。Blind误运行build但确认无tracked `dist`变化，只记process caveat。
- 范围：external drawer、`.agents/.claude` mirrors与fixed-count drift继续隔离，不计入11.5 finding。
- 下一步判断：启动fresh `bmenhance-cr-02-evaluator 11-5` Round2；未获授权不得直接修复。

## 2026-09-04 — CR Evaluator / Round 2

- Story ID：11.5
- 执行项：`bmenhance-cr-02-evaluator`
- 结果：FAIL；6/6 findings均确认有效且均为P1 patch，无P0/P2/误报。
- Owner Gate：`Owner decision: not required`。Owner M已唯一裁决Architecture root-level/subject-level probes，Owner L已唯一裁决external/fence/drive/nested/shortcut行为；subject directory symlink复用既有`artifact-path.symlink-escape`。
- Fix授权：仅#1-#6及其focused tests；docs只有在现有文字不精确时允许最小澄清。禁止新增dependency/stable issue、完整CommonMark、fallback消费/migration、Story/tracker/gates/CR04-06、drawer/mirrors或11.6+。
- 下一步判断：启动fresh `bmenhance-cr-03-fixer 11-5` Round2；完成后进入fresh Reviewer/Evaluator Round3。

## 2026-09-04 — CR Fixer / Round 2

- Story ID：11.5
- 执行项：`bmenhance-cr-03-fixer`
- 结果：已严格关闭授权#1-#6并追加Round2 evaluation修复记录；修改仅限shared discovery实现、focused discovery tests与evaluation记录。
- 修复：拆分Architecture probes；拒绝subject directory symlink重绑定；angle unwrap后分类；bounded fence masking；drive-letter fail closed；支持nested inline与normalized/case-insensitive shortcut reference。
- 验证：discovery38/38、resolver/path/CLI24/24、build、docs、canonical normal+strict、packaging与scoped diff均PASS。Full为531 passed/4 todo/12 failed，12项均为external drawer固定count 18/68→19/69，无11.5新增失败。
- 范围：未改Story/tracker/gates/SPEC/docs/CR closeout/drawer/mirrors/fixed counts或11.6+，无新Owner blocker。
- 下一步判断：启动fresh Reviewer Round3三层只读复审，随后fresh aggregator与Evaluator Round3。

## 2026-09-04 — CR Reviewer / Round 3

- Story ID：11.5
- 执行项：`bmenhance-cr-01-reviewer`三层复审与fresh aggregator
- 结果：FAIL，3/3层完成；Round2 #1-#6原finding均关闭，去重后新增4项P1：external/network/fragment definition状态丢失、decode后drive-letter、malformed inline missing close/angle trailing junk、escaped opener奇偶语义。
- 验证：discovery38/38、同口径related三文件24/24、docs、canonical warn/strict与diff通过；Aggregator临时反例8/8复现并清理。
- 判定：related 32/32与24/24来自不同命令口径，不作为finding；external drawer/mirrors/count drift继续隔离。
- 下一步判断：启动fresh `bmenhance-cr-02-evaluator 11-5` Round3；未授权前不得直接修复。

## 2026-09-04 — CR Evaluator / Round 3

- Story ID：11.5
- 执行项：`bmenhance-cr-02-evaluator`
- 结果：FAIL；4/4 findings均确认有效且均为P1 patch，无P0/P2/误报。
- Owner Gate：`Owner decision: not required`；Owner L已唯一裁决non-shard definition ignore、decode后portable guard、malformed fail-closed与escaped opener语义。
- Fix授权：仅shared discovery source、focused tests与Round3 evaluation fix record；禁止完整CommonMark、link title、HTML/code-span/image、SPEC/docs、Story/tracker、drawer/mirrors或11.6+。
- 下一步判断：启动fresh `bmenhance-cr-03-fixer 11-5` Round3，完成后进入fresh Reviewer/Evaluator Round4。

## 2026-09-04 — CR Fixer / Round 3

- Story ID：11.5
- 执行项：`bmenhance-cr-03-fixer`
- 结果：已关闭授权#1-#4并追加Round3 evaluation修复记录；实现仅修改shared discovery与focused tests。
- 修复：typed `defined-but-ignore` sentinel；single decode后drive guard；missing close/missing angle close/trailing junk fail-closed；outer opener反斜杠odd/even。
- 验证：discovery48/48、related41/41、build、docs、packaging、canonical normal+strict与scoped diff均PASS；full 541 passed/4 todo/12 failed，12项均为external drawer fixed-count drift。
- 生成物处理：packaging曾刷新manifest，Fixer已恢复pre-fix external drawer状态，未保留本轮生成hash。
- 下一步判断：启动fresh Reviewer Round4三层只读复审，随后fresh aggregator与Evaluator Round4。

## 2026-09-04 — CR Reviewer / Round 4

- Story ID：11.5
- 执行项：`bmenhance-cr-01-reviewer`三层复审与fresh aggregator
- 结果：FAIL，3/3层完成；确认6项P1：decode前分类、duplicate destination validation precedence、empty definition、raw/encoded backslash portability、angle inner whitespace、whole selection读取未选broken index。
- 驳回：non-angle title/tail超出bounded contract；不授权CommonMark punctuation unescape；Edge `guard_snippet`为建议伪代码而非current evidence。
- 验证：discovery48/48、related41/41、docs、canonical warn/strict、diff均PASS；11个反例变体复现并清理。
- 下一步判断：启动fresh `bmenhance-cr-02-evaluator 11-5` Round4，先裁决六项最小授权。

## 2026-09-04 — CR Evaluator / Round 4

- Story ID：11.5
- 执行项：`bmenhance-cr-02-evaluator`
- 结果：`FAIL / DECISION_NEEDED`。#1-#5确认P1 patch并授权；#6反例有效但contract不足以唯一裁决validation precedence。
- 已授权：post-decode统一分类、duplicate parse前first-definition-wins、empty definition malformed、普通backslash portable block、angle body inner whitespace malformed。
- Owner Gate：S=显式whole时只验证/消费whole，未选index只做entry安全校验并记录，不解析graph；G=仍完整验证未选graph，broken继续block并同步澄清contract/docs/tests。
- 范围：title/tail与punctuation unescape继续驳回；Owner决策前不修#6，不进入CR04-06。
- 下一步判断：等待Owner回复`确认 11.5 selection-whole 方案 S`或`确认 ... 方案 G`，随后由一个fresh Fixer统一执行授权项。

## 2026-09-04 — Owner Decision S Closed / Round 4

- Story ID：11.5
- 用户裁决：明确回复`确认 11.5 selection-whole 方案 S`。
- 授权语义：显式`selection=whole`时只验证/消费canonical whole；未选canonical `index.md`仍必须完成entry级`lstat`、readability与realpath containment并记录`unselectedPath`，但不得读取/解析其shard graph。
- 保持不变：无selection或`selection=sharded`时完整验证并消费sharded graph；symlink/unreadable/outside canonical index entry仍block；不授权跳过entry安全校验。
- 同轮授权：Evaluator Round4已批准的#1-#5与方案S下的#6由同一个fresh Fixer统一修复并追加记录。
- 下一步判断：启动fresh `bmenhance-cr-03-fixer 11-5` Round4，随后进入fresh Reviewer/Evaluator Round5。

## 2026-09-04 — CR Fixer / Round 4

- Story ID：11.5
- 执行项：`bmenhance-cr-03-fixer`
- 结果：已关闭#1-#6并追加Round4 evaluation修复记录；方案S已写入runtime、fixtures、`SPEC 09`与两份直接public guidance。
- 修复：post-decode统一分类、duplicate parse前first-definition-wins、empty definition malformed、普通backslash portable block、angle inner whitespace malformed、whole selection只做未选index entry safety并记录。
- 验证：discovery67/67、related41/41、build、docs、packaging、canonical warn/strict与scoped diff均PASS；full 560 passed/4 todo/12 failed，12项仍为external drawer fixed-count drift。
- 范围：未改Story/tracker/gates/CR closeout/rules/TODO/drawer/mirrors/fixed counts或11.6+，无新Owner blocker。
- 下一步判断：启动fresh Reviewer Round5三层只读复审，随后fresh aggregator与Evaluator Round5。

## 2026-09-04 — CR Reviewer / Round 5

- Story ID：11.5
- 执行项：`bmenhance-cr-01-reviewer`三层复审与fresh aggregator
- 结果：FAIL，3/3层完成；去重后2项P1：canonical whole non-file/unreadable被当absent，以及indexPresent时仍递归candidate scan并可因无关unreadable目录抛raw EACCES。
- 历史闭环：Round4 #1-#6与方案S核心均PASS；第二项是tree candidate scan残余，不重开S的“未选index graph不解析”决策。
- 验证：discovery67/67、related41/41、docs、canonical warn与diff均PASS；临时反例已复现并清理。
- 下一步判断：启动fresh `bmenhance-cr-02-evaluator 11-5` Round5，裁决whole unreadable stable issue与candidate scan最小授权。

## 2026-09-04 — CR Evaluator / Round 5

- Story ID：11.5
- 执行项：`bmenhance-cr-02-evaluator`
- 结果：`FAIL / PATCH_REQUIRED`；2/2 findings均确认P1 patch，无新Owner gate，方案S核心保持关闭。
- #1映射：复用`artifact-path.subject-document-missing`，reason=`canonical-whole-unreadable`；details仅允许project-relative canonicalWholePath、entryKind与entryState，不得泄露raw error/absolute/temp/stack。
- #2授权：`listMarkdownFiles()` candidate scan仅在`!indexPresent`、需要判断shards-without-index时执行；不授权泛化filesystem exception治理。
- 下一步判断：启动fresh `bmenhance-cr-03-fixer 11-5` Round5，随后进入fresh Reviewer/Evaluator Round6。

## 2026-09-04 — CR Fixer / Round 5

- Story ID：11.5
- 执行项：`bmenhance-cr-03-fixer`
- 结果：严格关闭#1/#2并追加Round5 evaluation修复记录；whole unreadable在shape/selection/graph/candidate/mismatch前fail-close，candidate scan仅`!indexPresent`执行。
- Tests：新增portable access/readdir injection、三种selection、CLI/schema/safe details/zero mutation/repeat stability与nested shards-without-index fixtures；`SPEC 07/09`做最小澄清。
- 验证：focused76/76、related99/99、build、docs、packaging、canonical normal+strict与diff均PASS；full569 passed/4 todo/12 failed，12项仍为drawer fixed-count drift。
- 下一步判断：启动fresh Reviewer Round6三层只读复审，随后fresh aggregator与Evaluator Round6。

## 2026-09-04 — CR Reviewer / Round 6

- Story ID：11.5
- 执行项：`bmenhance-cr-01-reviewer`三层复审与fresh aggregator
- 结果：FAIL；Blind与Edge各发现1项、Acceptance PASS；Aggregator独立复现后确认2项P1、驳回0。
- #1：symlink entry通过containment后未验证final target regular file，影响whole/index与Owner M mismatch probes，已有stable mapping，P1 patch。
- #2：`!indexPresent`时必要candidate scan遇nested readdir failure可raw throw；属于11.5 structured/stable/zero-mutation范围，但现有四ID是否可准确复用需Evaluator裁决。
- 验证：focused76/76、canonical D0/no findings、diff通过；临时反例复现并清理，drawer隔离。
- 下一步判断：启动fresh Evaluator Round6；若现有ID不足，只为#2提出窄化Owner gate。

## 2026-09-04 — CR Evaluator / Round 6

- Story ID：11.5
- 执行项：`bmenhance-cr-02-evaluator`
- 结果：`FAIL / OWNER_DECISION_REQUIRED`。
- #1：P1 patch；whole复用`subject-document-missing/canonical-whole-unreadable`，index复用`broken-shard-reference/unreadable-shard`，Owner M probe最终target非regular视为不命中。
- #2：P1 decision-needed；现有四ID/reason不能唯一表达missing-index candidate scan unreadable/indeterminate。
- 推荐I：扩展`artifact-path.invalid-sharded-document-shape`，reason=`shard-candidate-scan-unreadable`、shape=`invalid-sharded`并只记录安全project-relative failing-directory evidence。
- 备选II：扩展`subject-document-missing`，但语义弱于实际“shape不可判定”。
- 下一步判断：等待Owner回复`确认 11.5 candidate-scan 方案 I`或明确选择II，再由fresh Fixer统一处理#1/#2。

## 2026-09-04 — Owner Decision I Closed / Round 6

- Story ID：11.5
- 用户裁决：明确回复`确认 11.5 candidate-scan 方案 I`。
- 授权语义：missing-index candidate scan unreadable/indeterminate复用`artifact-path.invalid-sharded-document-shape`，reason=`shard-candidate-scan-unreadable`，`discoveryShape=invalid-sharded`。
- Evidence：仅允许project-relative POSIX failing directory、`entryKind=shard-candidate-scan`、`entryState=unreadable`与既有deterministic fields；禁止raw error/errno message/absolute/home/temp/stack。
- Continuation：block、顶层`actualConsumedPath=null`、`consumedPaths=[]`、零artifact write与零progress mutation。
- 下一步判断：启动fresh `bmenhance-cr-03-fixer 11-5` Round6统一处理#1/#2，随后进入fresh Reviewer/Evaluator Round7。

## 2026-09-04 — CR Fixer / Round 6

- Story ID：11.5
- 执行项：`bmenhance-cr-03-fixer`
- 结果：严格关闭#1/#2并追加Round6 evaluation修复记录；dereferenced target regular-file gate与方案I structured candidate-scan failure已落地。
- Contract：最小同步`SPEC 07/09`与workflow layout；D1 updated，D2 skipped/historical decisions已在fix record记录。
- 验证：focused93/93、related24/24、build、docs、packaging、canonical warn/strict、17 changed packages density lint与scoped diff均PASS；full586 passed/4 todo/12 failed，12项仍为external drawer fixed-count drift。
- 范围：未改Story/tracker/gates/logs/summary/CR04-06/rules/TODO/drawer/mirrors/fixed counts/11.6+，无新Owner blocker。
- 下一步判断：启动fresh Reviewer Round7三层只读复审，随后fresh aggregator与Evaluator Round7。

## 2026-09-04 — CR Reviewer / Round 7

- Story ID：11.5
- 执行项：`bmenhance-cr-01-reviewer`三层复审与fresh aggregator
- 结果：FAIL；去重后1项P1与1项P2。
- P1：declared shard symlink仅校验lexical entry/access/realpath containment，未验证dereferenced target regular file，可消费directory/FIFO；既有broken/unreadable mapping唯一。
- P2：missing-index candidate scan只收`Dirent.isFile()`，忽略lexical `.md` symlink，至少in-bound regular symlink会被错报subject missing；完整in/out/broken/nonregular candidate taxonomy未唯一。
- 历史闭环：Round6 #1/#2、Owner M/L/S/方案I及Round1-5均PASS。
- 下一步判断：启动fresh Evaluator Round7，裁决P2为patch、TODO或最小Owner gate。

## 2026-09-04 — CR Evaluator / Round 7

- Story ID：11.5
- 执行项：`bmenhance-cr-02-evaluator`
- 结果：`FAIL / FIX_REQUIRED`。
- #1：确认P1，授权`resolveDeclaredShards()`补dereferenced final-target regular-file gate；nonregular复用`broken-shard-reference` + `reason/referenceKind=unreadable-shard`。
- #2：确认有效但保持P2；current SPEC07/09无法唯一推出undeclared `.md` symlink对in-bound/outbound/broken/nonregular target的candidate semantics，defer至CR05 TODO，本轮不patch、不新增Owner gate。
- 下一步判断：启动fresh Fixer Round7仅修#1并追加记录；随后进入fresh Reviewer/Evaluator Round8。

## 2026-09-04 — CR Fixer / Round 7

- Story ID：11.5
- 执行项：`bmenhance-cr-03-fixer`
- 结果：仅修复Finding #1；declared shard dereferenced target regular-file gate已落地，directory/FIFO等映射existing unreadable-shard，in-bound regular symlink继续合法。
- P2隔离：Finding #2 missing-index candidate scan symlink semantics未修改，保留CR05。
- 验证：focused99、related24、build、docs、packaging、canonical warn/strict与diff均PASS；无新Owner blocker。
- 范围：未改Story/tracker/SPEC/docs/logs/summary/CR TODO/closeout/drawer/mirrors/11.6+。
- 下一步判断：启动fresh Reviewer Round8三层复审，随后fresh aggregator与Evaluator Round8。

## 2026-09-04 — CR Reviewer / Round 8

- Story ID：11.5
- 执行项：`bmenhance-cr-01-reviewer`三层复审与fresh aggregator
- 结果：PASS；3/3 layers无降级，0 P0/P1。
- Closure：Round7 P1、Owner M/L/S/I、Round1-6全部P0/P1与AC1-AC11均PASS。
- Deferred：Round7 Finding #2 missing-index lexical `.md` symlink candidate taxonomy仍为P2、未修改，必须CR05登记；AC5/7/10带此caveat但不阻塞Reviewer PASS。
- 验证：focused99、related24、docs72/5、canonical warn/strict D0/no findings、17 package density与diff均PASS；drawer隔离。
- 下一步判断：启动fresh Evaluator Round8；仅Evaluator也PASS后进入CR04→CR05→CR06。

## 2026-09-04 — CR Evaluator / Round 8

- Story ID：11.5
- 执行项：`bmenhance-cr-02-evaluator`
- 结果：PASS；latest Reviewer+Evaluator double-pass，0 P0/P1。
- Closure：Round7 P1 final-target regular-file gate、Owner M/L/S/I、Round1-6 P0/P1与AC1-AC11均确认关闭/通过。
- Deferred：Round7 Finding #2仍为非阻塞P2且未修，CR05必须登记TODO。
- 验证：同口径4 files/123 tests、docs72/5、canonical warn/strict D0/no findings与diff均PASS。
- 下一步判断：严格进入fresh CR04→fresh CR05→fresh CR06。

## 2026-09-04 — CR04 Rules Extraction

- Story ID：11.5
- 执行项：`bmenhance-cr-04-rules-extractor`
- 结果：新增`CR-API-41`（selection分离entry safety与selected graph validation，11/12）、`CR-SEC-20`（dereferenced regular-file/containment/structured failure，11/12）、`CR-DOC-06`（bounded Markdown post-decode/fail-closed/order，10/12）。
- 去重：现有规则ID无重复；Round7 Finding#2未写成已解决规则，明确交CR05。
- 验证：diff、canonical warn/strict均PASS，governance仅D0、无需decision record。
- 下一步判断：进入fresh CR05登记P2 TODO。

## 2026-09-04 — CR05 TODO Tracking

- Story ID：11.5
- 执行项：`bmenhance-cr-05-todo-tracker`
- 结果：新增去重条目`TODO-016: 定义 missing-index .md symlink candidate 语义`，P2/other/status=open，来源Round7。
- Boundaries：记录current fail-closed/空消费/零mutation、future Owner target matrix与acceptance；默认不新增stable ID、不扩通用filesystem taxonomy，未写成resolved。
- 验证：open统计7→8且与摘要一致、TODO ID唯一、diff与canonical warn/strict PASS。
- 下一步判断：进入fresh CR06 finalizer。
