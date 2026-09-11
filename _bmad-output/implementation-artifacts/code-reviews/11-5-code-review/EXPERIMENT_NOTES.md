# Experiment Notes（实验备注）

## 2026-09-04 — Initial Decision（初始决策）

- 实时判断：11.5前序gate已满足，但whole/sharded coexistence、explicit selection、broken/missing shape、stable issues与zero-mutation是新的owner contract，不能仅从Story表格推断为已批准实现语义。
- 决策原因：Story Dependency Gate明确要求`SPEC 09`承载或Owner批准同变更contract update；项目宪法禁止在信息不足时猜测。Development必须先输出kickoff evidence并停在精确Owner gate。
- 风险：若直接修改producer/consumer，会让多个installed Markdown workflow各自复制precedence，形成第二root/discovery contract；若用当前仓库active sharded Epic corpus反推generic behavior，也可能把仓库自身形态误当产品默认。
- 范围边界：只处理PRD/Epics/Architecture；UX、validation/readiness/CR与migration属于后续。外部drawer与`.agents/.claude`镜像保持隔离。
- 用户介入点：若kickoff确认`SPEC 09`缺表，将请求批准Story11.5表格作为同变更owner contract update，或要求用户提供替代decision/issue mapping。

## 2026-09-04 — Kickoff Decision Needed（启动门禁需决策）

- 实时判断：Owner gate已被fresh Development以live evidence确认未关闭；继续编码会让Story表或各consumer成为事实上的第二contract，违反Dependency Gate。
- 推荐Owner决策：批准Story11.5 AC5 decision table原样成为`SPEC 09`同变更contract update；批准在`SPEC 07`注册`artifact-path.ambiguous-subject-document-shape`、`artifact-path.invalid-sharded-document-shape`、`artifact-path.broken-shard-reference`、`artifact-path.subject-document-missing`。
- 预期影响：允许同一shared resolver实现whole-only、valid sharded-only、ambiguous with/without invocation selection、missing index、broken/outside/unreadable shard、subject missing；所有block为stable issue且零write/progress mutation。不会授权migration或11.6+。
- 用户介入点：必须明确确认推荐方案，或给出替代decision table/stable ID mapping；在此之前保持HALT。

## 2026-09-04 — Owner Approval（Owner批准）

- 用户原文：`确认 11.5 推荐方案`。
- 受控语义：whole-only只消费whole；valid sharded-only只消费index及其显式shards；whole+sharded无invocation selection则不选不混并block；有selection只消费所选并记录未选；缺index、broken/outside/unreadable shard、subject missing均stable issue block且零write/progress mutation。
- Evidence：每次记录`resolvedRoot`、`resolutionMode`、`actualConsumedPath`、`discoveryShape`、`ambiguityStatus`与selection source；selection仅当前invocation有效。
- 范围：允许同变更更新`SPEC 09/07`及11.5必要实现，不允许迁移、自动择一、持久化selection或进入11.6+。
- 用户介入点：当前关闭。若实现发现table无法映射现有producer/consumer而需改变continuation或issue语义，必须重新HALT。

## 2026-09-04 — Development Result（开发结果）

- 实时判断：11.5 candidate已有current owner contract、executable resolver、producer/consumer消费与完整fixture矩阵，可进入Reviewer；development green不等于Story完成。
- Reviewer重点：decision table所有block是否零write/progress mutation；index Markdown links是否只消费显式shards且拒绝outside/unreadable；invocation selection是否不持久化；nine consumers是否真实消费shared contract而非只写文案；legacy solutioning fallback/mismatch/no-migration证据是否完整。
- 外部边界：live canonical/affected中的drawer failures必须与isolated 68-skill基线分开；Reviewer不得为追求global green修改外部package或fixed counts。
- 用户介入点：无。Reviewer findings先交fresh Evaluator，不直接修复。

## 2026-09-04 — Reviewer Round 1 Result（第一轮审查结果）

- 实时判断：主体decision table成立，但边界实现暴露canonical entry symlink、legacy actual-path discovery、Markdown link grammar与order/self-link缺口；当前不能closeout。
- 待评估：symlink whole/index应映射既有broken-shard ID还是新增ID；mismatch需要搜索哪些known legacy locations；canonical index支持inline/reference/query/percent grammar的边界是否已由CommonMark或owner artifact唯一确定。前三项不得由Fixer猜测。
- 可直接patch候选：保留index声明首次出现顺序去重；排除index self-link避免重复consumedPaths。仍需Evaluator正式授权。
- 外部边界：drawer与packaging副作用不属于11.5 findings，不得混入修复。
- 用户介入点：先等Evaluator；若其确认owner artifacts不足，再提出精确选项。

## 2026-09-04 — Evaluator Round 1 Owner Gate（第一轮评估Owner门禁）

- 实时判断：五项均阻塞当前交付；三项已有唯一contract可直接patch，两项若由Fixer自行选择会改变public discovery contract，必须Owner裁决。
- 推荐M（mismatch）：采用contract-owned finite read-only probe set。PRD/Epics探测历史`{planning_artifacts}/prd.md`与`{planning_artifacts}/epics.md`；Architecture在explicit`solutioning_artifacts`下探测历史`{planning_artifacts}/architecture.md`及Planning architecture subject whole/index。命中只返回`config-artifact-mismatch`证据并block，绝不消费/迁移；缺solutioning时既有Planning subject fallback仍按`legacy-compatible`正常消费。
- 推荐L（link grammar）：采用无dependency upgrade的bounded CommonMark-compatible subset，支持inline与reference-style local links；解析destination后剥离query/fragment、单次percent-decode，再做portable/containment/readability校验。Malformed encoding、unsupported/malformed local-ish reference使用既有`artifact-path.broken-shard-reference`并在details记录`referenceKind`，不得静默忽略；external schemes不作为shard。
- 已授权但待同轮Fix：whole/index symlink escape用`artifact-path.symlink-escape`；declared shards保持first-declaration order/first-occurrence dedupe；index self-link确定性exclude。
- 用户介入点：请确认推荐M+L，或分别给出替代mismatch输入边界与Markdown支持集。

## 2026-09-04 — Owner Approval M+L（Owner批准M+L）

- 用户原文：`确认 M+L`。
- 受控M语义：finite probes只产生diagnostic evidence；resolved canonical subject仍是唯一可消费路径。若canonical missing且known legacy candidate存在，返回`config-artifact-mismatch`、`actualConsumedPath=null`、`consumedPaths=[]`、block与零mutation；缺solutioning时Planning subject fallback仍为合法`legacy-compatible`。
- 受控L语义：支持inline与reference definitions；destination规范化顺序为parse→strip query/fragment→decode once→portable/subject containment/readability。Undefined/malformed/unsupported local-ish引用不得静默忽略，使用现有`broken-shard-reference`并记录`referenceKind`；不新增dependency或stable ID。
- 实现边界：可按必要同变更同步`SPEC 07/09` contract细节、shared resolver/CLI、focused fixtures/tests与受影响consumer guidance；不授权migration、11.6+、external drawer、mirror、packaging side-effect治理、commit/push。
- 用户介入点：当前关闭。若多legacy候选或grammar冲突需要改变上述continuation/issue mapping，Fixer必须HALT。

## 2026-09-04 — Fixer Round 1 Result（第一轮修复结果）

- 实时判断：M+L与另外三项P1已有实现和fixture证据，具备复审条件；Fixer green不等于CR通过。
- Reviewer重点：finite probes是否只在canonical missing后诊断且不消费；explicit/fallback Architecture区分是否精确；reference definitions与query/fragment/decode顺序、undefined/malformed local-ish与external schemes是否无静默遗漏；whole/index in-bound/outside symlink、order/dedupe/self-link是否稳定。
- 风险：full仍因external drawer count红色；Reviewer必须分别报告11.5 scoped pass与global caveat，不得补外部baseline。
- 用户介入点：无。Round2 findings先交Evaluator，不直接修复。

## 2026-09-04 — Reviewer Round 2 Result（第二轮审查结果）

- 实时判断：Round1修复覆盖了主路径，但M的Architecture fallback probe与L的Markdown边界仍有分支偏差；subject-directory symlink另暴露authoritative boundary重绑定。当前不能closeout。
- 去重结论：6项均按P1候选进入Evaluator。Windows drive为Blind/Edge重复证据；Acceptance的Markdown候选按angle external与fenced context拆分；nested/shortcut由Aggregator判定为patch候选而非新Owner decision，因为现行contract要求支持或稳定拒绝，禁止silent omission。
- 评估重点：确认Architecture root-level candidate的explicit限定范围；subject directory symlink应否统一映射既有`artifact-path.symlink-escape`；bounded parser对angle external、fence、drive-letter、nested/shortcut的最小fail-closed实现边界。
- 外部边界：drawer/mirrors/count drift不属于本轮finding；Blind误跑build没有tracked `dist`变化，不授权借此刷新或修复生成物。
- 用户介入点：先等fresh Evaluator。只有Evaluator确认现有M+L无法唯一裁决某项时，才提出新的精确Owner gate。

## 2026-09-04 — Evaluator Round 2 Result（第二轮评估结果）

- 实时判断：六项均已由现有Story AC、Owner M+L与`SPEC 07/09`唯一裁决，不需要新的Owner gate；当前应进入bounded Fixer而非再次询问用户。
- 修复边界：Architecture root-level candidate无条件、额外Planning subject candidates仅explicit；subject directory symlink用既有`symlink-escape`；angle unwrap后分类；排除fenced context；drive-letter在scheme前fail closed；nested inline与shortcut reference必须支持。
- 验证重点：所有block保持`actualConsumedPath=null`、`consumedPaths=[]`与零mutation；external/network不访问；声明顺序/dedupe/self-link与既有29/34矩阵不回归。
- 范围边界：不实现完整CommonMark，不处理HTML/code-span/image grammar，不改stable IDs、Story/tracker/gates、CR closeout或external drift。
- 用户介入点：无。Fixer若发现必须改变上述公开语义才HALT；否则完成后直接进入Round3复审复评。

## 2026-09-04 — Fixer Round 2 Result（第二轮修复结果）

- 实时判断：六项P1均已有bounded实现与新fixtures，具备Round3复审条件；Fixer green仍不等于CR通过。
- Reviewer重点：Architecture fallback/explicit候选顺序；subject directory与entry两层symlink containment；angle external/network不访问；fence masker边界；drive-letter安全evidence；nested/shortcut完整消费且不破坏order/dedupe/self-link。
- 验证解释：focused与构建/文档/packaging/canonical均绿；full的12项红色继续唯一归因external drawer固定count漂移，不能写成live full PASS，也不得据此修baseline。
- 范围边界：本轮未改Story/tracker/gates/SPEC/docs/closeout或外部文件；Round3 Reviewer必须保持只读并避免运行会刷新生成物的命令。
- 用户介入点：无。Round3 findings仍先交fresh Evaluator，不直接修复。

## 2026-09-04 — Reviewer Round 3 Result（第三轮审查结果）

- 实时判断：Round2授权目标已按原finding闭环，但相邻destination/reference边界仍违反Owner L的ignore、single-decode后portable、malformed fail-closed与escape语义；当前不能closeout。
- 去重结论：三层候选合并为4项P1。External/network/fragment reference definitions必须保留non-shard状态；encoded drive必须在decode后复检；两种malformed表现合并；escaped opener按连续反斜杠奇偶处理。
- 评估重点：这些边界是否均可由现有Owner L唯一裁决；Fixer最小授权不得扩大为完整CommonMark、HTML/code-span/image grammar。
- 验证口径：discovery38与related三文件24均绿但未覆盖8个反例；不同命令的32统计不构成功能finding。
- 用户介入点：先等fresh Evaluator；若其确认现有contract不足才提出精确Owner gate。

## 2026-09-04 — Evaluator Round 3 Result（第三轮评估结果）

- 实时判断：四项均由现有Owner L唯一裁决，不需要再次请求Owner；应进入bounded Fixer。
- 修复边界：definition map保留`defined-but-ignore`；single decode后复检drive-letter；missing close/missing angle close/angle trailing junk统一`malformed-link-destination`；outer opener按连续反斜杠奇偶处理。
- 禁止扩面：不支持link title、不实现完整CommonMark/HTML/code-span/image，不重构URL/portable subsystem，不改SPEC/docs/Story/tracker/closeout。
- 验证重点：external/network/fragment full/collapsed/shortcut均ignore且不访问；encoded drive安全block；malformed三类空消费；odd/even escape与既有order/dedupe/self-link不回归。
- 用户介入点：无。Fixer发现必须改变上述contract时才HALT，否则完成后进入Round4。

## 2026-09-04 — Fixer Round 3 Result（第三轮修复结果）

- 实时判断：Round3四项P1已有实现与fixtures，具备Round4复审条件；仍需latest Reviewer/Evaluator双PASS。
- Reviewer重点：non-shard definition在full/collapsed/shortcut下均ignore且first-definition-wins；encoded drive exactly-once后block；malformed三分支安全空消费；escaped opener odd/even不破坏nested/image/order/dedupe/self-link。
- 验证解释：focused48与related41全绿；full唯一红色仍为external drawer counts。Packaging生成性改写已恢复到pre-fix共享状态。
- 范围边界：未改SPEC/docs/Story/tracker/gates/closeout/drawer/mirrors或11.6+。
- 用户介入点：无。Round4 findings先交fresh Evaluator，不直接修复。

## 2026-09-04 — Reviewer Round 4 Result（第四轮审查结果）

- 实时判断：连续修复已关闭历史原finding，但current pipeline仍在decode前做部分分类，definition precedence与selection分支也尚未完全遵循decision table；当前不能closeout。
- 去重结论：六项P1候选进入Evaluator。尤其`selection=whole`应只消费whole并记录未选index，未选shard graph不得提前阻塞。
- 驳回边界：link title/tail与完整punctuation unescape不在Owner L授权范围；普通backslash应按portable contract fail closed，不转义后消费。
- 验证解释：48/41全绿但缺11个复现变体；external drawer仍不计入finding。
- 用户介入点：先等fresh Evaluator；若现有Owner L/AC5已足够则直接授权Fixer，不重复询问Owner。

## 2026-09-04 — Evaluator Round 4 Owner Gate（第四轮评估Owner门禁）

- 实时判断：#1-#5已有唯一patch语义；#6同时受到“只消费所选形态”、unconditional broken-index row与canonical index entry validation约束，Evaluator无法合法推导唯一validation precedence。
- 推荐S：显式`selection=whole`时验证并消费whole；未选index只做`lstat`、readability与realpath containment entry安全校验并记录`unselectedPath`，不读取其shard graph。无selection或选择sharded时仍完整验证graph。
- 推荐原因：S让invocation selection真正解除内容层歧义，同时保留未选canonical entry的路径安全门禁；G会使明确选择whole仍被未选内容阻塞，削弱selection的操作意义。
- 备选G：继续验证未选index完整graph，任何broken reference都block，并同步澄清`SPEC 09`/docs/tests为全局integrity gate。
- 用户介入点：请明确确认S或G。Owner裁决前不启动Fixer，以便由同一个fresh Fixer一次性处理#1-#6并避免半轮状态。

## 2026-09-04 — Owner Approval S（Owner批准S）

- 用户原文：`确认 11.5 selection-whole 方案 S`。
- 受控语义：explicit whole selection只消费whole；未选index保留entry-level path safety与`unselectedPath` evidence，不解析内容或shard references。未选entry自身若symlink escape、不可读或非regular仍按既有stable issue block。
- Contract落点：Fixer可对`SPEC 09` decision table与直接public guidance做最小必要澄清，使selection validation precedence成为唯一owner truth；不得改变无selection/sharded selection语义。
- 修复边界：与Round4 #1-#5同轮处理；继续排除title/tail、punctuation unescape、完整CommonMark、migration、external drawer/mirrors与11.6+。
- 用户介入点：当前关闭。若实现需要跳过canonical index entry安全校验或改变stable issue，必须重新HALT。

## 2026-09-04 — Fixer Round 4 Result（第四轮修复结果）

- 实时判断：六项P1与方案S均已有实现、contract与fixtures，具备Round5复审条件；Fixer green不等于latest CR通过。
- Reviewer重点：所有分类必须基于single decoded destination；duplicate不得parse；empty/angle malformed安全block；backslash不被伪装；whole selection跳过未选graph但保留index entry symlink/readability/containment。
- 验证解释：67/41矩阵全绿，full唯一失败仍为drawer fixed counts；Reviewer不得为global green修改外部baseline。
- 范围边界：title/tail、punctuation unescape、完整CommonMark仍排除；Story/tracker与closeout未触碰。
- 用户介入点：无。Round5 findings先交fresh Evaluator，不直接修复。

## 2026-09-04 — Reviewer Round 5 Result（第五轮审查结果）

- 实时判断：方案S已正确跳过未选index内容，但resolver在更早阶段仍扫描整个subject tree；同时whole entry的unreadable状态缺少与index对称的fail-close。当前不能closeout。
- 去重结论：2项P1。A影响whole entry truth与安全；B只需在`indexPresent`时不运行用于`shards-without-index`判定的递归candidate scan，不授权泛化filesystem异常框架。
- 评估重点：A应映射既有哪个stable issue并保持安全evidence；B是否可直接限定`listMarkdownFiles()`仅在`!indexPresent`执行。
- 历史边界：Round4与Owner S核心不重开；drawer/mirrors/count仍隔离。
- 用户介入点：先等fresh Evaluator；若现有SPEC07/09足够则无需新Owner gate。

## 2026-09-04 — Evaluator Round 5 Result（第五轮评估结果）

- 实时判断：现有SPEC07/09足够唯一裁决两项，不需要新Owner gate。
- 修复边界：whole non-file/unreadable使用既有subject-missing ID与`canonical-whole-unreadable` reason安全block；index存在时完全跳过只为shards-without-index服务的递归candidate scan。
- 验证重点：whole unsafe在no selection/whole/sharded三种调用均空消费block；indexPresent+无关unreadable subtree在三种selection下不抛raw异常，后续行为只由whole/index/graph contract决定；`!indexPresent`仍能识别shards-without-index。
- 范围边界：不新增stable ID，不持久化raw filesystem error，不扩展通用异常框架，不重开Owner S。
- 用户介入点：无。Fixer完成后直接进入Round6复审复评。

## 2026-09-04 — Fixer Round 5 Result（第五轮修复结果）

- 实时判断：whole entry安全与candidate scan两项已有对称实现和注入fixtures，具备Round6复审条件。
- Reviewer重点：whole unreadable必须先于mismatch/shape/selection返回安全稳定issue；indexPresent下不能调用candidate readdir；index缺失时nested shards-without-index仍被检测；S核心与graph semantics不回归。
- 验证解释：76/99矩阵绿，full红色仍唯一来自external drawer counts；不据此修外部baseline。
- 范围边界：未泛化filesystem异常处理，未重开S，未改Story/tracker/gates/closeout或11.6+。
- 用户介入点：无。Round6 findings仍先交fresh Evaluator。

## 2026-09-04 — Reviewer Round 6 Result（第六轮审查结果）

- 实时判断：lexical symlink containment不足以证明final target是regular file；同时index缺失时为判断shards-without-index所需的递归scan仍可能绕过structured result。当前不能closeout。
- 去重结论：2项P1。#1可在helper中补dereferenced kind检查并复用whole/index既有映射；#2不能借“泛化FS异常排除”忽略，因为它发生在11.5必需discovery路径。
- 评估重点：#2应复用subject-missing、invalid-sharded或新增reason/ID；必须由Evaluator基于SPEC07/09唯一裁决，不由Fixer猜测。
- 历史边界：Owner M/L/S与Round1-5主体行为不重开；不扩到其它filesystem API。
- 用户介入点：先等fresh Evaluator。只有现有taxonomy确实无法唯一映射时才请求Owner。

## 2026-09-04 — Evaluator Round 6 Owner Gate（第六轮评估Owner门禁）

- 实时判断：#1已有唯一既有映射；#2的scan failure既不是subject missing，也不是已确认的broken shard reference，而是缺index场景下无法确定是否存在shards，因此taxonomy需Owner窄化扩展。
- 推荐方案I：沿用`artifact-path.invalid-sharded-document-shape`并新增reason=`shard-candidate-scan-unreadable`；`discoveryShape=invalid-sharded`，block、空消费、零mutation，只暴露project-relative failing directory与scan phase。
- 备选方案II：沿用`artifact-path.subject-document-missing`，但会把“存在但无法枚举”混同“subject不存在”，诊断与运维可读性较差。
- 推荐原因：I与failure所在的shape discovery phase一致，不新增stable ID，同时保留subject-missing的原语义。
- 用户介入点：请确认I或II。Owner裁决前不启动Fixer，以便同一fresh Fixer一次性关闭#1/#2。

## 2026-09-04 — Owner Approval I（Owner批准I）

- 用户原文：`确认 11.5 candidate-scan 方案 I`。
- 受控语义：scan失败归入invalid-sharded shape，而非subject missing；只扩展既有ID的stable reason，不新增ID，不把unknown伪装成known candidate/missing。
- 安全边界：捕获本次required candidate enumeration中的root/nested readdir failure并结构化返回；不得扩成所有filesystem API的通用异常框架。
- 同轮修复：与Round6 #1 symlink final target regular-file校验一起由一个fresh Fixer执行；whole/index/probe映射保持Evaluator裁决。
- 用户介入点：当前关闭。若实现需要新增issue ID、泄露raw error或改变M/L/S语义，必须重新HALT。

## 2026-09-04 — Fixer Round 6 Result（第六轮修复结果）

- 实时判断：symlink final target与candidate scan两项已有runtime、contract与fixtures，具备Round7复审条件。
- Reviewer重点：whole/index symlink→nonregular映射与M probe不命中；root/nested scan failure的safe directory evidence/no raw leak/repeat stability；normal shards-without-index、M probes与indexPresent no-scan回归。
- 验证解释：93/24、build/docs/packaging/canonical/density/diff均绿；full红色仍唯一来自external drawer counts。
- 范围边界：不扩展通用FS异常、不新增stable ID、不重开M/L/S，不处理Story11.6+。
- 用户介入点：无。Round7 findings先交fresh Evaluator。

## 2026-09-04 — Reviewer Round 7 Result（第七轮审查结果）

- 实时判断：canonical entry final-target gate已关闭，但同类校验尚未覆盖index声明的shard；candidate enumeration对symlink的定义也未完全明确。当前不能closeout。
- P1边界：declared shard final target必须regular，复用broken-shard-reference/unreadable-shard，无需Owner。
- P2待裁决：candidate scan只决定“缺index时是否存在`.md` candidates”，并不消费；是否仅按lexical `.md` symlink计candidate，或先区分target状态，会改变taxonomy，需要Evaluator先判断现有contract是否足够。
- 历史边界：不重开方案I或M/L/S，不扩到通用symlink治理。
- 用户介入点：先等fresh Evaluator；若P2可合法延后则进入CR TODO，否则按其最小授权处理。

## 2026-09-04 — Evaluator Round 7 Result（第七轮评估结果）

- 实时判断：阻塞项只剩declared shard final target regular-file gate；candidate scan symlink为真实P2但不具备唯一patch语义，可合法延后CR05。
- Fix边界：只在declared shard解析中补final-target type check；directory/FIFO等nonregular统一existing unreadable mapping，in-bound regular symlink继续合法。
- P2边界：不得借本轮Fixer定义undeclared symlink candidate taxonomy；CR05需登记目标、证据、影响与未来Owner contract问题。
- 验证重点：direct/reference shard symlink→directory/FIFO均安全block，sharded-only/ambiguous/selection-sharded覆盖，regular in-bound回归，zero mutation/no raw leak。
- 用户介入点：无。Fixer后进入Round8复审复评。

## 2026-09-04 — Fixer Round 7 Result（第七轮修复结果）

- 实时判断：latest阻塞P1已有实现和direct/reference/shape/selection/nonregular fixtures，具备Round8复审条件。
- Reviewer重点：declared symlink→directory/FIFO不得进入declared/consumed paths；regular in-bound仍合法；outside仍symlink escape；P2 candidate scan行为必须保持未改。
- 验证解释：99/24与build/docs/packaging/canonical/diff均绿；external drawer继续只作为fixed-count caveat。
- 用户介入点：无。若Round8 Reviewer/Evaluator双PASS，进入CR04→CR05登记P2→CR06。

## 2026-09-04 — Reviewer Round 8 Result（第八轮审查结果）

- 实时判断：latest Reviewer已PASS，所有current P0/P1闭环；仍需fresh Evaluator独立确认，不能提前closeout。
- P2状态：candidate scan忽略lexical `.md` symlink仍存在且未修，保持Round7 evaluation的defer语义；CR05必须登记，不能在PASS summary中写成resolved。
- 验证解释：三层与Aggregator均确认99/24及docs/canonical/density/diff；Edge的123为4文件组合口径，不与99+24矛盾。
- 用户介入点：无。Evaluator若PASS则严格进入CR04、CR05、CR06。

## 2026-09-04 — Evaluator Round 8 Result（第八轮评估结果）

- 实时判断：latest Reviewer与Evaluator已双PASS，Story11.5代码审查阻塞项清零，可进入closeout。
- P2状态：missing-index lexical `.md` symlink candidate taxonomy保持未修，CR05必须登记；不得被CR04规则提炼或CR06 done误写成resolved。
- Closeout顺序：fresh CR04提炼可复用规则；fresh CR05去重并登记P2；fresh CR06核验所有gate后更新Story/tracker。
- 用户介入点：无。按strict serial继续。

## 2026-09-04 — CR04 Result（规则提炼结果）

- 实时判断：三个可复用系统约束达到阈值并已去重落地；CR04完成且未改动P2语义。
- 新规则：selection/entry-vs-graph、dereferenced file safety/structured failure、bounded Markdown destination parser三类。
- P2交接：missing-index lexical `.md` symlink candidate semantics仍未定义/未修，必须由CR05登记，不得在规则中暗示closure。
- 用户介入点：无。严格进入CR05。

## 2026-09-04 — CR05 Result（TODO登记结果）

- 实时判断：唯一deferred P2已以`TODO-016`去重登记，Reviewer PASS summary与Evaluator裁决的defer义务已满足。
- TODO状态：open；未修改candidate scan实现，也未预判in-bound/outbound/broken/nonregular target语义。
- Closeout条件：latest Round8双PASS、CR04规则与CR05 TODO已齐；下一步CR06只需核验gate identity、Story/tracker状态与验证证据。
- 用户介入点：无。严格进入CR06。
