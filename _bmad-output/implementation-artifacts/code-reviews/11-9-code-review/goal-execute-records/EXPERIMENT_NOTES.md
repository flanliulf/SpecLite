# Directory Routing Decisions（目录归属决策记录）

## CR01 Round 2 Triage Boundary（第二轮审查分类边界）

- Reviewer只形成5newpatch与2dismiss候选；root不把8→5或Reviewerresolved直接当acceptedcounts、最终closure或fixer授权。fresh CR02须逐项核对fingerprint、同场景是否关闭、convergence与scope。
- 两个被Reviewer驳回的层候选涉及validator签发证明及跨consumer原子writer，必须继续以已批准职责边界评估，不因security术语自动重建新引擎。hardlink与marker lifecycle等有受控第一手反例，仍需Evaluator决定严重性和最小范围。
- Root在CR03范围接收发现marker跨series关注点，仅交outerReviewer独立复现，未补灌Blind/Auditor；Reviewer已经建立真实反例与独立fingerprint，原始层报告均完整保留。
- 本轮仅workflow outputs变化，D0/D1/D2沿CR03治理记录，无新的canonical修订；42个输入与r2snapshot一致，主目录writer禁令和历史full caveat保持。

## CR03 Acceptance And Governance（CR03 接收与治理）

- 8项定点修复与evaluator授权一致，root接收completed fixRecord只授权进入fresh review，不授权closeout。Round2须审完整当前42项diff并核验本轮8fingerprints，不复用旧PASS。
- D0：bounded parser/classifier/CLI、marker ownership、consumer说明与tests/ledger已同步，真实隔离manifest已派生，root strict复核无findings。未修改原shared approval tail、package roots、module count或install policy。
- D1：skipped，F7低层marker schema由shared contract拥有，当前public目录说明无需扩大为schema说明；F8 dismissed禁止借机改全局cleanup策略。D2：historical snapshot，旧review/失败gates/legacy记录保留，不静默升级历史事实。
- 主工作树未跑build/full/packaging writer；31/4 focused与隔离build/packaging是当前证据，历史full695/13/4不宣称全绿。模型元信息只以实际Sol medium调度为准，不以generic人格文本推断。

## CR02 Decision And Convergence（CR02 裁决与收敛）

- 采用fresh evaluator的8项P1裁决，root核验后允许局部patch；尚未触发maxRounds5、连续3轮new blocking或churn门禁。本轮不是旧series审批或风险例外的延续。
- F2只补current-family最小schema/type provenance；F5只处理bounded identity语义重复；不得借此恢复whole-document审批扫描。F7允许现有shared contract/resolver/tests范围内最小machine-readable恢复证据；不能把任意.tmp/普通PLAN存在当authority，不能猜最新目录；若超出已有授权面需返回triage。
- F8驳回：运行级保留证据不扩张为全局cleanup政策。本run旧/current.tmp继续完整保留。TODO018–022不能仅因旧代码删除标resolved，CR05后续按fresh证据处理。
- Fixer仅修F1/F2/F3/F4/F5/F6/F7/F9，保留原审批尾部、round规则、tracker要求和scope边界；验证使用focused命令，build/full/packaging只在固定输入隔离副本和独立npm cache运行。新派生manifest只能由真实工具产出。

## CR01 Handoff And Governance（CR01 交接与治理）

- Round 1 正式结果为 FINDINGS_REPORTED，9项仅为候选；severity、有效性、职责边界及修复义务由fresh CR02独立裁决，root不把审查层的blocking标签直接当fixer授权。
- Reviewer环境没有spawn入口，root代为创建三个fresh内层只属于CR01内部调度；3/3完成后交回同一Reviewer汇总。Blind保持diff-only；没有补灌Story/AC/方案。模型元数据以显式spawn参数Sol high为依据，Blind/Edge基于generic人格的GPT-6自述均已明确撤回，原始说明保留。
- Scope透明消费：冻结snapshot的base/head/declared/actual/excluded清单和42个实现摘要均可独立复算；后续consumer还必须扫描live完整工作树，把新真实workflow outputs显式列为actual/excluded delta并检查policy覆盖。允许这种输出增长，不允许实施内容漂移、未知文件静默排除或future路径假装actual。保留本轮.tmp供后续consumer复算，旧.tmp不删除。
- D0：本次接续仅生成workflow outputs，无canonical修改；42个实施输入和派生manifest与批准archive原字节一致。已完整执行治理runner的mapping/doc/impact复核；warn/strict均ok/findings=[]，core19/sdlc50/support8/hooks2/total69，diff check PASS。
- D1 current-public-docs：updated（沿用并已核验），source README中英文、module-help与两份public reference已有directoryContext/production validator/CR路径说明；本次不重复写。D2 living-legacy：skipped，本次未改变package mapping或install policy；D2旧reports/gates：historical snapshot，保留原失败及旧series事实。201个canonical path hook提醒属于整个mixed worktree，不扩入本轮。
- Full/build/packaging既有隔离验证沿用当前未漂移输入，不在主工作树重复运行writer；canonical后续只有evaluator接受的授权修改发生后再执行定向治理及隔离派生。

## Authorized Continuation Decision（已授权接续决策）

- 2026-09-09 用户已明确批准在当前 checkout 建立新任务，原记录的等待新任务授权已解除；新 goal 保留 11.9 → 11.10 → 中文本地提交完整目标，不 push。
- 本次只接续 directory-routing round 1，fresh CR01 是唯一下一步；新任务不等于新实现世代，也不构成 stop-loss 例外。旧 series PASS 与风险接受均不能驱动本系列审批。
- 已独立比较 42 个输入字节、HEAD、staged、gate、context 与原审批 tail，支持跳过已完成开发；逐日志真实 production validate-context 支持本次记录写入，禁止再次 --mode resolve。
- 审计使用 --no-renames 避免漏掉 rename 源端；缺失文件以 baseline 的 absent 语义核对，不把 missing/absent 标签差异当物理漂移。新实际 workflow outputs 按既有明确 policy 追加 actual/excluded，不纳入自身内容 digest。
- Fresh reviewer 与 evaluator 依用户要求使用 Sol high / medium，记录同模型独立性限制；三层必须由真实 fresh actors 形成 3/3 quorum，不复用旧角色补位。

## Approved Boundary（已批准边界）

- 用户的「批准按上一条完整方案实施」授权本轮实施；不再就同一方案或普通技术取舍反复请求确认。
- 目录归属和 CR 审批解耦：DONE 只是目录中报告的 claim，不能由 resolver 判断为已完成并换目录；原审批 owner 的验证继续有效。
- directory-routing 是用户批准的真实实现 replacement；旧 evidence-v2 不重标、不续借 PASS，不新增风险或止损豁免。
- TODO018–022 先保留原状态，待新实现与 fresh evaluation 逐项证据判定。

## Governance Decisions（治理决策）

| Surface | Decision | Reason | Evidence |
|---|---|---|---|
| canonical shared/runner/CR01–06 | updated（待执行） | 本次批准的目录职责收敛和生产消费者接入 | PLAN + directory-routing-baseline.json 精确 source paths |
| source README/module-help/public CR docs | updated（待执行） | 必须与新的 directory-only 契约一致 | 同上，只改 CR 相关条目 |
| legacy CR reports、旧根日志、evidence-v2 | historical snapshot | 保留实际失败和审批历史，禁止改写为当前 PASS | 原路径原位保留，baseline raw hashes |
| unrelated current docs/source、living legacy | skipped | 本次无新增 package/数量/安装语义变化；范围外保留 | baseline excluded paths，checker 当前无 findings |
| release manifests | updated（待隔离验证） | canonical bytes 改变需派生闭环，混合工作树不能整体冒充本轮输入 | 后续 fixed-input packaging；当前尚未生成 |

## Risks And Controls（风险与控制）

- 禁止把 1791 行旧 resolver 的审批 engine 整体迁移为新 helper。
- 禁止把 test-local helper 或手工写 PASS artifacts 当真实 Skill 链证据。
- 包装脚本失败也会写 manifest；因此仅隔离固定输入执行并审计，不在混合主目录直接运行。
- 原 Story 的既有 implementation notes/gate 记录保留为历史；新一轮以本计划与新鲜执行证据为准，AC 和 owner 文档不变。

## Development Decisions（开发决策）

- `D0 canonical-source-truth`：`updated`；只修改 baseline 允许的 shared contract、runner、CR01–06 与精确 tests/docs，生产入口保留在既有 resolver script。
- `D0 module-discovery-contract`：`skipped`；未新增、删除或重命名 package root，`module-help.csv` 只评估 CR help 文案。
- `D1 current-public-docs`：`updated`；source README 与两个 public reference 只同步 directory-only resolver / production validator 边界。
- `D2 living-legacy-reference`：`skipped`；本次不改变 package mapping/install policy，living legacy 无受影响 current guidance。
- `D2 frozen-historical-record`：`historical snapshot`；旧 `main`/`evidence-v2` reports、失败与 gate 原位保留，不重标 PASS。
- `D0 release-evidence`：`updated by isolated derivation`；主 manifest 因 baseline full-suite 间接 writer 失败丢失后，未用 HEAD 或手工 hash 替代；同步隔离 packaging 工具新派生的 `029b8110…` bytes，并与隔离输出逐字节比对。旧 `82bf17e8…` 无法原样恢复，此差异如实保留。

### Removed Replay Responsibility Map（退出 resolver 的审批重放职责映射）

| 旧 resolver/test 组 | 当前 owner | 本轮处理 |
|---|---|---|
| finalizer predecessor schema/hash、evaluation verdict、TODO fingerprint、scope/fix freshness | CR02、CR04、CR05、CR06 + shared approval contract | 保留原 contract assertions；从 directory resolver tests 移除，不迁移实现 |
| trackerBindings、Markdown/HTML/YAML terminal grammar、trackerChangeSet/coordinated write | CR06 finalizer + tracker owners | resolver API/CLI 删除；finalizer workflow 与原审批 test 保留 |
| round continuity、supersession lineage、duplicate current artifact | runner state machine + CR producer/consumer schemas | resolver 仅识别 current candidate ownership；原 4 个 E2E `it.todo` 保留 |
| completion gate mandatory fields / freshness | Flow Gate + CR06 | resolver 不认证 `DONE`；原 gate/hash/freshness contract assertions保留 |
| numeric identity、legacy/current ambiguity、unsafe path、single propagation、scan/install | directory-layer resolver/production validator | 移入新的 `test/cr-directory-resolution.test.ts` 作为真实 production-entry coverage |

## Development Handoff（开发交接）

- 流程顺序纠正记录：Directory-layer 实现与开发验证完成后曾在 fresh development completion gate 前提前把 Story/tracker 切为 `review`；当时先恢复 `in-progress`，再保全旧 `FAIL_FUNCTION` gate 并运行真实 development completion Flow Gate。
- 生产 validator 调用形状：`node {resolver} --mode validate-context --project-root ... --implementation-artifacts ... --frozen-context '{directoryContextJson}' --story-id ... --review-series ... --cr-dir ... --canonical-cr-dir ... --compatibility-mode ... --legacy-artifact-paths '[...]' --write-subpath ...`。
- 原 approval contract 后半段已逐字节保全；15 个原 tests + 4 todo 保留。正式 approval E2E 尚未在开发阶段执行，不计入 `25 passed / 4 todo`；顺序为 CR01/02、必要 CR03 与复审复评、CR04/05、fresh closeout gate、CR06，完整证据在 CR06 结束后齐备。
- TODO018–022、旧 reports/失败/gate 与三根历史日志均未在开发阶段更改；未启动 evaluator/fixer/CR04–06，未 commit/push。

## Gate Sequence Correction（门禁顺序纠正）

- 已纠正提前 `in-progress → review`：先恢复 `in-progress`，原字节保全旧 gate，再执行真实 Flow Gate；不是用 Story prose 或手写 PASS 绕过流程。
- Fresh development gate 根据当前 Story 12 AC、FR23g、directory-only production implementation、RED/GREEN、installed双IDE CLI、隔离 full/packaging 与原 approval tail 保全证据判为 `PASS`。范围外 fixed-count failures 被明确列出，没有伪报 full PASS。
- 只有读取到 machine-readable `result: "PASS"` 后才重新切换 Story/sprint 为 `review`。下一步仍是使用已冻结 `directory-routing-runtime-context.json` 的正式 CR01 round 1；不得重跑 resolver。

## Fresh Review Boundary（新审查边界）

- 审查对象是原 Story 12 AC 与已批准 directory-layer replacement，不借旧 evidence-v2 PASS、风险接受或止损例外收口；原 max 5 收敛规则继续有效。
- 42 个实施路径以外的 baseline 文件与实际新增 goal/CR outputs 显式 excluded；report 内容不进入自身 digest，actual/excluded 路径清单不得隐瞒新增输出。
- CR01/02 禁止在混合主目录运行 build/full/packaging writer；重现仅可只读或使用独立缓存、固定输入隔离环境。不改源码、Story、tracker、TODO 或历史 reports。
- 保存当前输入的真实字节归档，补足初始 hash-only inventory 无法恢复字节的薄弱点；旧 manifest 未原样恢复的事实保留。

## Fresh Agent Capacity Decision（独立角色容量决策）

- 本次阻断来自平台 fresh-agent thread capacity 和备用 CLI 版本兼容，不是重新讨论 11.9 方案，也不是新增需求裁决；开发 gate PASS 不因此撤销，但不等于 CR PASS。
- 原 runner 要求 fresh reviewer/evaluator，已有 dev 或旧 review actor 带历史上下文不能冒充 fresh。没有可用清理 agent-thread 的工具，不删除会话数据库或修改全局限制来绕过。
- 安全只读替代入口已验证失败；新用户任务或工具升级超出本次代码实施范围，需要明确授权。保留 goal active（首次出现该环境阻断，未满足 goal blocked 的连续三 turn 条件），不标 complete。

## Blocked Audit 2 Decision（第二次阻断判断）

- 本 turn 再次确认同一真实 fresh-agent 环境缺口；不存在运行中的审查任务，也没有授权新增用户任务或升级 CLI，不能通过换模型、复用旧角色或伪造 quorum 推进。
- 未产生代码或审查进展；保持 Story review、CR01 pending 和完整 Epic goal，不把完成开发缩减为 Epic 成功。连续阻断次数为 2，暂不调用 update_goal blocked。

## Blocked Audit 3 Decision（第三次阻断判断）

- live 第三次失败满足目标阻断阈值，已将 goal 标为 blocked，停止无进展自动续跑。根因是 fresh-agent 执行环境不可用，不是 11.9 需求复杂度或新代码缺陷判断。
- 新任务/工具环境恢复须有明确授权或外部状态变化；原 runner 的 fresh reviewer/evaluator、3层 quorum、scope/hash 与正常 closeout 不降级。
- 本次无 canonical 内容变化，D1/D2 延续已核验的 targeted updates 与 historical/skipped 分类；重跑 canonical strict checker 和 diff check，不为记录阻断而扩范围修复。
