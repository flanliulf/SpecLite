# Experiment Notes（实验备注）

## 2026-09-04 — Initial Decision（初始决策）

- 实时判断：hard predecessors满足，但`ready-for-dev`不等于实现授权或completion evidence；必须由fresh Development先运行11.7 kickoff。
- 核心不变量：exact dated basename、single invocation date、canonical target existing时same/different content均block、zero progress/report/temp/suffix mutation、legacy preservation与no suffix。
- 风险：机械重命名可能改变validation body/scoring、把legacy discovery误作producer fallback，或在跨日steps重复取时钟产生路径漂移。
- Stable issue：same-day conflict必须先注册/复用`SPEC 07` stable issue，再由active workflow消费；不得临时发明非stable文本。
- 外部边界：IR filename、11.8+、drawer/mirrors/fixed counts不属于11.7。
- 用户介入点：当前无；若kickoff发现issue taxonomy或同日处置语义不唯一，输出精确Owner gate并HALT。

## 2026-09-04 — Development Result（开发结果）

- 实时判断：11.7已有active private producer、stable issue、installed consumption与focused evidence，可进入Reviewer；development green不等于Story完成。
- Reviewer重点：single date是否真正跨steps锁定；early probe是否在任何mutation前；commit-time existing是否保持bytes；same/different/no-suffix/temp/progress；legacy producer/discovery分离；installed CLI与source single truth。
- Corpus重点：ZH/EN/help/contracts/examples/downstream historical patterns与negative scan分类，不能把legacy name从discovery误删，也不能保留为active output default。
- 外部例外：affected4/full12仅drawer fixed counts；Reviewer不得修改外部package或baseline。
- 用户介入点：无。Reviewer findings先交fresh Evaluator，不直接修复。

## 2026-09-04 — Reviewer Round 1 Result（第一轮审查结果）

- 实时判断：核心producer行为成立，但single-date active prose、lifecycle success evidence、corpus gate、downstream candidate safety与completion command identity仍不足，不能closeout。
- 合并边界：negative scan与parity合并为一项evidence缺口；三类downstream同一candidate qualification根因合并，不拆成三个finding。
- Race边界：只处理caller-visible deterministic seam；final revalidation后不可消除的普通path-based OS竞争不属于本Story P1。
- Completion边界：affected计数差异先作为command inventory/evidence缺口，不误报为functional regression；drawer4 failures仍隔离。
- 用户介入点：无。等待fresh Evaluator，不直接授权Fixer。

## 2026-09-04 — Evaluator Round 1 Result（第一轮评估结果）

- 实时判断：五项均阻塞交付且修复语义唯一，无需Owner决策。
- Date边界：只改变量消费，不改变report标题/章节/评分/body语义；跨午夜fixture证明首次日期保持。
- Corpus边界：按file+exact clause分类legacy allowlist，不能整行skip；downstream安全以active prose+shared focused test闭环，不跨Skill调用private script。
- Evidence边界：repair需公开成功结果后再判no-migration；completion exact command/inventory由root单独刷新。
- 用户介入点：无。Fixer严格按授权，不运行扩大验证或改gate。

## 2026-09-04 — Fixer Round 1 Result（第一轮修复结果）

- 实时判断：四项实现/证据P1已修，gate replayability也由root闭环，具备Round2复审条件。
- Date/corpus：所有report date surface锁定首次date；legacy allowlist按精确clause分类，三类downstream资格一致。
- Lifecycle：repair先证明真实成功再判no-migration，不再允许短路假绿。
- Gate：affected223/4是current exact command结果；原177/4与Reviewer197/4只保留历史解释，不能再作为current数字。
- 用户介入点：无。Round2 findings仍须fresh Evaluator后才能修或closeout。

## 2026-09-04 — Reviewer Round 2 Result（第二轮审查结果）

- 实时判断：Round1修复成立，但workflow state binding、owner-root chain与evidence inventory仍存在独立缺口，不能closeout。
- State边界：锁定date/path不仅要在prose声明，还要闭合所有Step frontmatter token的producer-consumer alias。
- Classifier边界：必须解析完整basename/token并anchored exact判定，不能用ASCII片段regex或在首个`.md`截断。
- Legacy边界：authoritative五类historical family均须进入install/update/repair逐阶段snapshot；customize/config/private script属于active同步面。
- 用户介入点：无。等待Evaluator唯一化owner chain与alias修复。

## 2026-09-04 — Evaluator Round 2 Result（第二轮评估结果）

- 实时判断：五项均有唯一bounded方案，无Owner决策；当前不能closeout。
- Token：禁止新增snake_case alias，所有consumer直接使用locked camelCase变量。
- Owner：先验证owner roots自身链，再验证candidate；不能只用candidate-in-owner形成自证。
- Test：完整basename分类与五类legacy/inventory角色必须以新增RED证明，不能只改prose。
- 用户介入点：无。Fixer严格白名单，outer owner负责后续gate current evidence。

## 2026-09-05 — Fixer Round 2 Result（第二轮修复结果）

- 实时判断：五项P1实现与evidence已闭环，gate current，可进入Round3。
- State/owner：全部steps单token；owner roots chain先于candidate资格，不再自证。
- Corpus/lifecycle：完整basename分类覆盖非ASCII与post-extension；五类legacy及三角色inventory均进入回归门禁。
- 外部例外：affected4 failures仍仅drawer fixed counts，未修改baseline。
- 用户介入点：无。Round3仍须fresh双门禁。

## 2026-09-05 — Reviewer Round 3 Result（第三轮审查结果）

- 实时判断：主contract已闭环，但三类test oracle仍会假绿，当前evidence不足。
- Classifier：quoted/code-span必须整体分类；role gates需精确限制override keys与legacy constants，不能因一个标记整文件continue。
- Lifecycle：逐report集合应先filter交集再断言空；全项目inventory先记录matching entry再判断type，不能漏symlink/non-file。
- 用户介入点：无。等待Evaluator限定测试修复，不能只追求green。

## 2026-09-05 — Evaluator Round 3 Result（第三轮评估结果）

- 实时判断：production/prose无需扩面，三项均是evidence oracle fail-open；只修测试即可。
- 断言语义：保留完整framing、逐surface集合交集、all-entry no-follow inventory，避免negative matcher的逻辑反转或预过滤。
- 用户介入点：无。Fixer后由root刷新current counts，再进入Round4。

## 2026-09-05 — Fixer Round 3 Result（第三轮修复结果）

- 实时判断：三项test-oracle fail-open均已关闭，production/prose未扩面，具备Round4 fresh复审条件。
- Evidence：focused10/10、related53/53、affected225/4；四项失败仍严格归因于范围外drawer fixed counts。
- Full-suite边界：依Evaluator授权未重跑build/full/packaging；completion gate保留668/12/4 development baseline并明确非current rerun。
- 用户介入点：无。Round4 findings仍须fresh Evaluator裁决后才可修复或closeout。

## 2026-09-05 — Reviewer Round 4 Result（第四轮审查结果）

- 实时判断：Round3两项oracle已闭环，但classifier/config/private-role仍存在可复现false-green，不能closeout。
- 去重边界：三层表象归并为managed basename、config key-role与private whole-file discovery三个独立root causes。
- 用户介入点：无。三项均可由Evaluator限定test-only语义。

## 2026-09-05 — Evaluator Round 4 Result（第四轮评估结果）

- 实时判断：三项均为PATCH-EVIDENCE且修复语义唯一，无需production/prose或Owner决策。
- 授权边界：只改focused test与evaluation append；outer owner独立刷新related/affected/gate。
- 用户介入点：无。Fixer不得因新增assertion变RED而自行改private source。

## 2026-09-05 — Fixer Round 4 Result（第四轮修复结果）

- 实时判断：三项test oracle已按唯一语义闭环，root复跑related53/53与affected225/4稳定，可进入Round5。
- Classifier/config：完整frame、`=`、role-scoped support与显式report-target deny不再因全局skip或窄predicate假绿。
- Private evidence：whole-file唯一producer、static mutation deny及真实discovery前后no-follow snapshot同时成立。
- 外部例外：affected4 failures仍仅drawer fixed counts；未修改baseline或外部包。
- 用户介入点：无。仍需fresh Reviewer/Evaluator双PASS。

## 2026-09-05 — Reviewer Round 5 Result（第五轮审查结果）

- 实时判断：Acceptance对既有Round4义务判PASS，但Blind/Edge的三个有限mutant证明证据仍可假绿，latest Reviewer不可PASS。
- 收敛边界：只接受直接映射active corpus/role invariant的clause/delimiter、semantic key path与static fs/local reachability，不追求任意语法完备。
- 用户介入点：无。交Evaluator限定bounded语义。

## 2026-09-05 — Evaluator Round 5 Result（第五轮评估结果）

- 实时判断：3项均为有限PATCH-EVIDENCE，无Owner决策；禁止通用parser/AST扩面。
- 授权边界：focused test+evaluation append，逐项RED→GREEN；root负责gate current evidence。
- 用户介入点：无。

## 2026-09-05 — Fixer Round 5 Result（第五轮修复结果）

- 实时判断：限定mutants均闭环，related53/53与affected225/4稳定，可进入Round6。
- Evidence：support exact clause、TOML parsed semantic paths、static fs binding及local discovery reachability共同覆盖active role，不再依赖裸substring或首条import。
- 外部例外：affected4 failures仍仅drawer fixed counts；未触碰external package/baselines。
- 用户介入点：无。仍需fresh Reviewer/Evaluator双PASS。

## 2026-09-05 — Reviewer Round 6 Result（第六轮审查结果）

- 实时判断：有限门禁仍有两组稳定绕过，但TOML array类已越出授权matrix并被驳回，未发生无界扩张。
- 用户介入点：无。交Evaluator限定exact语义。

## 2026-09-05 — Evaluator Round 6 Result（第六轮评估结果）

- 实时判断：2项均为bounded PATCH-EVIDENCE，Owner Gate NONE；TOML array继续不授权。
- 用户介入点：无。Fixer仅可改focused test与evaluation append。

## 2026-09-05 — Fixer Round 6 Result（第六轮修复结果）

- 实时判断：完整clause/boundary与有限fs import/original/declaration义务已闭环，related53/53、affected225/4稳定，可进入Round7。
- 外部例外：4 failures仍仅drawer fixed counts，未触碰外部范围。
- 用户介入点：无。仍需latest Reviewer/Evaluator双PASS。

## 2026-09-05 — Reviewer Round 7 Result（第七轮审查结果）

- 实时判断：两层PASS不覆盖Edge稳定nested-local mutant；aggregator重放确认属于既有local reachability义务。
- 用户介入点：无。交Evaluator限定有限body-span修复。

## 2026-09-05 — Evaluator Round 7 Result（第七轮评估结果）

- 实时判断：唯一P1为bounded PATCH-EVIDENCE，Owner Gate NONE；禁止AST/通用parser扩张。
- 用户介入点：无。

## 2026-09-05 — Fixer Round 7 Result（第七轮修复结果）

- 实时判断：nested declaration与declaration-after direct-call mutant已闭环，related53/53、affected225/4稳定，可进入Round8。
- 外部例外：4 failures仍仅drawer fixed counts。
- 用户介入点：无。仍需latest Reviewer/Evaluator双PASS。

## 2026-09-05 — Reviewer Round 8 Result（第八轮审查结果）

- 实时判断：3/3 layers与fresh aggregator均PASS，0 findings；历轮closed/rejected边界稳定。
- 用户介入点：无。仍需fresh Evaluator独立门禁。

## 2026-09-05 — Evaluator Round 8 Result（第八轮评估结果）

- 实时判断：独立PASS，latest双门禁成立，允许进入CR04。
- Closeout边界：仍须CR04→CR05→CR06严格串行，completion PASS_EQUIVALENT的drawer caveat继续保留。
- 用户介入点：无。

## 2026-09-05 — Closeout Result（收口结果）

- 实时判断：CR04规则提炼、CR05 no-op与CR06状态同步全部完成，Story11.7真正达到done，而非仅凭completion gate或测试通过。
- Tracker：Epic11保持in-progress；Story11.8未被提前修改，仍ready-for-dev。
- 外部例外：drawer fixed-count caveat继续隔离，canonical checker warn/strict current均ok。
- 用户介入点：无。下一步进入Story11.8 fresh Development kickoff。
