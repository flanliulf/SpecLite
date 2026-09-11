# Directory Routing Implementation Plan（目录归属重实现计划）

## Authority And Goal（授权与目标）

- 2026-09-09 用户明确批准「按上一条完整方案实施」；本文件落实已批准的 Story 11.9「目录归属与 CR 审批解耦」方案，不是新的待确认提案。
- Epic 11 原顺序不变：11.1–11.8 已 done；当前只执行 11.9；11.9 完整闭环后执行 11.10，最后范围审计并本地中文 Conventional Commit，禁止 push。
- 原 Story 12 条 AC 全部保留，FR23g、report basenames、CR 算法、round numbering、approval rules 不变。
- 新实现世代为 `reviewSeries=directory-routing`，fresh CR 从 round 1 开始；旧 `evidence-v2` 是历史，不复制或重标其 PASS，不继续旧风险豁免方案。
- 本次既有 canonical 目录的明确归属为 `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review`；三个当前执行记录固定在此目录的 `goal-execute-records/`。旧根位置日志、所有失败报告、旧 completion gate 证据保留。

## Scope And Baseline（范围与基线）

- `directory-routing-baseline.json` 冻结 current HEAD、staged diff 原始 hash、678 个 actual changed paths 的原始字节摘要，以及本次 41 个 source/test/docs 精确允许路径。禁止从 HEAD 整体回滚。
- Canonical：shared contract、runner、CR01–06 各自已有的中英文 SKILL、CHANGELOG、workflow reference；仅 shared package 已有 resolver 脚本。
- Tests：保留 `test/code-review-contract.test.ts` 原始审批测试，新增已批准 `test/cr-directory-resolution.test.ts`；重建既有 title-bearing ledger 的逐项分类。
- Docs：只更新 source README 中英文、SDLC module-help.csv 和两个 public reference 的相关 CR 条目。
- 生命周期允许路径只由对应步骤修改：11.9 Story 的允许 sections、11.9 gates、精确五项 TODO 及必要计数、最终 tracker、当前新系列报告和执行记录。全局 CR rules 仅 CR04 规范授权内容。
- Packaging 为固定输入隔离环境中的受控派生生成，必须审核差异；不得直接在混合工作树运行会写 manifest 的 packaging-check，也不得手工造 hash。
- 排除 SPEC07/SPEC09/PRD、installer src、依赖与 lockfile、其他 Story、外部 drawer/zip、skill-lint/creator 和四个并行 grill 文件、全局/工作区 installed mirrors。Templates、hooks、其他 metadata 只读扫描，不能机械改写。

## Directory Contract（目录契约）

1. 目录解析只负责 numeric Story ID、候选归属和真实路径安全；不认证报告审批、TODO、gate freshness、tracker 终态，不重放整个 CR 历史。
2. 在已有 `resolve-cr-directory.mjs` 内提供目录解析和小型 production context validation 入口，不新增 package/framework/dependency。
3. resolver 输入为 projectRoot、implementationArtifacts、storyId、reviewSeries 和可选的显式 `directoryChoice`；移除 trackerBindings 及 tracker CLI 参数。返回核心字段 `ok/storyId/reviewSeries/crDir/canonicalCrDir/compatibilityMode/legacyArtifactPaths/issue`。
4. 显式新 run 无 current candidate/ownership conflict 使用 canonical；唯一 current canonical 使用 canonical；唯一 current legacy 原位绑定，即使有 DONE claim 也先绑定，由既有审批 owner 验证其完成。无 silent series reset、同 run 二次换目录。
5. 多 current candidate 或缺失/矛盾身份返回稳定 redacted diagnostic 并 stop-before-write；显式目录选择只能解决归属，不允许合并拆轮、迁移、审批豁免或绕过 unsafe path。
6. 物理 symlink/escape/non-directory 和写入子路径检查保留。解析只读且失败零 mutation；历史 legacy 不移动、不重命名、不删除。
7. 生产 context validator 只验证已冻结 Story/series、四个目录字段及 write subpath，不重新发现或选择目录；六个真实 consumers 在写前调用这个入口。测试不能以本地复制 validator 代替生产消费。
8. 既有 runner/finalizer 保留完整审批、hash、tracker binding、freshness、coordinated writes 与 stop-loss。删去 resolver 独有的大型 Markdown/HTML/YAML 审批扫描器，不原样搬家。

## Execution Sequence（执行顺序）

| Step | Status | Requirement |
|---|---|---|
| Scope freeze | complete | current working tree 原始摘要、精确 included/excluded 已冻结 |
| Development | complete | directory-only resolver、production validator、runner/CR01–06 consumers、tests/docs 已同步 |
| Dev validation | complete | RED→GREEN、installed CLI、build/focused/docs/canonical/lint/diff/隔离 full 与 packaging 均已记录；fresh development completion gate=`PASS`，Story/tracker 已按顺序进入 review |
| CR01 | complete (round 2) | fresh Sol high与3/3 layers完成；5 new patch候选、2 dismiss候选 |
| CR02 | next (round 2) | fresh Sol medium独立核验本轮7项与历史8项关闭、convergence；round1已FIX_REQUIRED |
| CR03 if required | complete (round 1) | 8项accepted P1修复；fixRecord completed；下一步fresh round2 |
| CR04 | pending | 规范提取和 scoped 更新 |
| CR05 | pending | TODO018–022 逐项证据判定，禁止靠删代码自动 resolved |
| Completion gate | pending | 新鲜真实 evidence，无 risk-accepted 替代 PASS |
| CR06 | pending | 正常原始审批门槛通过后才 done |
| Story 11.10 | pending | 11.9 完整闭环后才启动 |
| Epic commit | pending | 全部完成后范围隔离、本地提交，不 push |

## Verification（验证）

- 八组：numeric/title；canonical/legacy/series/ambiguity；unsafe paths；single resolution+六消费者；全部 CR artifact/fixer append/.tmp/三个日志；blocked zero-write/no migration；temp installed .agents/.claude 从目标 cwd 实际执行且无 node_modules/source 依赖；原审批不变。
- 原始 15 个 CR contract tests 和 4 个原始 it.todo 保留。移除的审批重放断言必须记录旧职责→现 owner→替代测试或不再适用原因；不得为绿而删除失败。
- 至少一次受控真实 Skill 链验证，记录实际产生/读取/写入路径。Installed resolver CLI PASS 不冒充 CR01–06 真实执行。
- 命令顺序：`npm run build`；两个 CR focused tests；runtime-structure/source-and-modules/fixture-release-gates；`npm run docs:check`；`npm test`；canonical strict；`git diff --check`；最后隔离 fixed-input packaging。
- 当前 baseline checker：core=19、sdlc=50、support=8、hooks=2、defaultInstall.total=69、ecosystems=8，warn status=ok、无 findings。前序 full-suite 外部失败不能算本轮源码回归，也不能写 full PASS。

## Stop Conditions（停止条件）

- 严格串行外层，fresh agents，完成一步记录后才下一步；不是到里程碑就停止。
- 原 max 5 stop-loss 保留，本授权不是新的 stop-loss 例外；不通过换 series 假复位。
- 仅真正需要新增权限、改变需求或改范围外文件时请求用户；普通技术取舍自主记录决策继续。
- 11.9 真正完成前不启动 11.10，Epic 未真正全部完成不标 goal complete。

## Current State（当前状态）

- Development 正式交接完成，fresh development completion gate 为 `PASS`，raw SHA-256=`e7f93a5531ebfaffe7e483361eca67dd45a4b7e56a8b645d8532dded6935cd1f`；Story/sprint 均为 `review`。
- 当前 `directory-routing` round 1：下一步 fresh CR01 reviewer（Sol high），然后 fresh CR02 evaluator（Sol medium）；如实记录同模型独立性限制。
- Root scope audit：baseSha=headSha=`ff7528d3f9ec34072bb669ee79f7569345c23d47`；685 actual / 42 declared / 643 excluded / 0 exceptions。Declared 为 baseline 41 个 source paths 加真实隔离派生 release manifest。
- 输入 snapshot hash=`sha256:0c17ac20abbe3bed4211177ee35e07c519496eee88a8f3f0b0f359db0fa5963b`；sourceMutationAt=`2026-09-09T08:00:19.114Z`。Reviewer 独立重算最终输入；实际新增 CR outputs 按既有用户批准 mutable workflow policy 显式列入 actual/excluded，不隐藏或哈希报告自身内容。
- Directory resolver 已唯一调用并冻结到 `directory-routing-runtime-context.json`；后续只运行 production validator，禁止重选目录。

## Environment Halt（执行环境阻断，接续前历史）

- 2026-09-09：在真正创建 fresh CR01 前，collaboration.spawn_agent 返回 `agent thread limit reached`。指定新 reviewer task 未创建，当前不存在 directory-routing round 1 review/evaluation；CR01 仍 pending，不计已启动或完成。
- 只读 CLI fresh-agent 能力检查也失败：codex-cli 0.132.0 对规定模型 gpt-5.6-sol 返回 `requires a newer version of Codex`；只要求 READY，未读取项目或产生审查证据，进程已 exit 1。
- 当前状态为 `HALT_ENVIRONMENT`（不是 STOP_LOSS、不是代码失败、不是 Story done）。11.9 Story/sprint 保持 review，11.10 未启动，未 commit/push；不复用 dev actor 或旧 reviewer 冒充 fresh 独立角色。
- 唯一下一步：获得新的 fresh-agent 可用执行环境后，直接从本系列 round 1 CR01 接续，不重跑 development、不重置 series/round、不重跑已冻结 directory resolver。创建用户可见新任务或升级工具环境需用户授权，未擅自执行。

### Blocked Audit 2（第二次阻断复核）

- 2026-09-09T08:58:13Z 的 live 复核：fresh-agent 创建仍返回 `agent thread limit reached`；CLI 仍为 0.132.0，无新的独立审查入口。当前未产生任何 directory-routing round review/evaluation。
- 42 个实施文件与已冻结 byte archive 全部相同；excludedDrift=[]；staged diff hash 和 fresh development gate raw hash 均未变化。Story/sprint=review，11.10=ready-for-dev。
- 本次自动 goal continuation 未授权新建用户任务或升级工具，不扩大操作范围。相同阻断连续出现第 2 个 goal turn，goal 保持 active；尚未满足 blocked 的第 3 turn 阈值。

### Blocked Audit 3（第三次阻断复核）

- 2026-09-09T09:01:14Z：fresh-agent 再次返回 `agent thread limit reached`；CLI 仍为 0.132.0。同一环境阻断已连续出现 3 个 goal turn，安全只读替代入口此前已验证不能运行规定模型。
- 42 个当前实施输入与 byte archive 逐字节一致，stagedUnchanged=true；development gate raw hash 仍为 e7f93a55…，Story=review，current directory-routing review/evaluation 文件仍为空。
- 已调用 update_goal(status=blocked) 并收到 status=blocked；不是 complete，不缩减 Epic 目标。CR01 pending、11.10 未启动、Epic 本地提交未执行。
- 解除条件：用户授权在当前工作区建立新的任务以恢复 fresh-agent 容量，或外部恢复兼容的独立执行环境。恢复后读取本记录与冻结 context，直接执行 directory-routing round 1 CR01，不重做开发、不伪重置轮次、不重跑 resolver。

## Authorized Continuation（已授权接续）

- 2026-09-09：用户已明确授权在当前 checkout 新建本任务接续；本任务已建立无 token 预算的完整 goal：11.9 正常 CR 收口 → 严格串行 11.10 → 全范围审计与中文本地 Conventional Commit，不 push。上方等待新任务授权与 blocked 仅为原任务历史，不是当前 gate。
- 本次是同一 directory-routing 实施世代接续；当前 round=1，CR01 pending。唯一下一步为 fresh Sol high CR01；不重做开发，不复用旧角色，不升级 CLI 或换模型。
- Live 核验：HEAD=ff7528d3f9ec34072bb669ee79f7569345c23d47；staged raw hash=06426fd385ef8a387cfe9aecb0ac0472274c3c0de69ed2fd107ed0d44f17787f；42 个输入与 approved-source-bytes.tgz 逐字节一致。按 --no-renames 同时列出 rename 两端后 inventory=685 actual / 42 declared / 643 excluded / 0 exceptions。
- Fresh development gate raw e7f93a5531ebfaffe7e483361eca67dd45a4b7e56a8b645d8532dded6935cd1f、manifest raw 029b8110cd2cc87d5870a9ddd7ac185af11b7ff5c4b574d90a791c91efcc576a、frozen context raw eec9baeabf11640b339bb09ee502aef4e61df010c6ba59dcf38c7f6c49e26dbb 均保持；Story/sprint=review，11.10=ready-for-dev，无 current-series review。
- 已真实重读 resolve config；directory resolver 未重跑，三份日志写前已分别通过 production validate-context。原 shared approval tail 与 HEAD 逐字节一致，保留原 maxRounds=5、3/3 quorum 与所有正常收口门槛。

## CR01 Round 1 Handoff（第一轮审查交接）

- Current state：CR01 complete → fresh CR02 pending；唯一下一步为 Sol medium 独立只读 evaluator。11.9 仍 review，11.10 未启动，未 commit/push。
- Current review：`../11-9-code-review-summary-20260909-directory-routing-round-1.md`；verdict=`FINDINGS_REPORTED`；report raw/canonical SHA-256（单 terminal LF）=`024c2d4923d9111e1c2f5dce2c2d113641f716038203852047d6ca256fd836a9`。
- Scope：696 actual / 42 declared / 654 excluded / 0 exceptions；scopeHash=`sha256:d0b1ef376adacdf1ec7e2e822b75e86bc9f814c3cac457dde14e3759d3c8aa26`；findingSetHash=`sha256:01de0380c8d0bcbc9195514d66ffb8f3073850757687ec87ef24d1fb78d82145`；9 patch candidates，无最终 severity 裁决。
- Fresh actors：外层 `/root/story119_directory_routing_review1`；Blind `/root/story119_r1_blind`、Edge `/root/story119_r1_edge`、Auditor `/root/story119_r1_auditor`。均通过明确 `gpt-5.6-sol/high/fork none` dispatch；因 Reviewer 无子代理创建工具，由 root 仅代为调度内部三层，外层仍严格串行。Blind 仅获 scoped diff/core Skill。3/3 quorum 已通过。
- Root 接收正式 FINAL 后独立解析 v2 frontmatter、读取 findings、重算 canonical scope payload/finding JSON；42 个 current implementation content digest 全部匹配，actual delta=[]，source archive byte drift=[]，HEAD/staged raw hash 未变。后续真实 workflow outputs 按已批准 policy 显式列入 live actual/excluded delta，同时独立重算冻结 review input payload 与当前 42 个实现摘要，不预列 future paths。

## CR02 Round 1 Handoff（第一轮评估交接）

- Fresh `/root/story119_directory_routing_evaluate1`（Sol medium）已完成；evaluation=`../11-9-code-review-evaluation-20260909-directory-routing-round-1.md`，raw SHA-256=`2068bc9c0252b59e9c539226fe9d390be360080f0842bc04654ef72a74f7a5fe`，verdict=`FIX_REQUIRED`。
- Accepted P1：F1/F2/F3/F4/F5/F6/F7/F9，共8项；F8 dismissed，不授权修改全局 `.tmp` cleanup policy。本 run 仍保留所有临时证据。
- Convergence Gate：newBlocking=8、recurredBlocking=0、resolvedBlocking=0、churn=false、architectureCategories=[]；round1<5、连续新增阻塞1<3，允许进入 fresh CR03 `mode=patch`。F7 限于现有 shared contract/resolver/tests 的 bounded ownership 恢复证据；实际无法局部闭合时返回 triage。
- Root 已重读全部评估、独立解析 frontmatter/counts/convergence、复算 review hash/scope hash 和42个当前实施摘要；live actual=697，唯一新增为本 evaluation，显式列为 workflow excluded delta，源码和 staged 未漂移。
- 唯一下一步：fresh Sol medium Fixer，仅执行评估接受项和必要定向验证/隔离派生；不得触及 F8、TODO、Story/tracker 或范围外文件。完成后 fresh round2 Review → Evaluation。11.9仍review，11.10未启动，未commit/push。

## CR03 Round 1 Handoff（第一轮修复交接）

- Fresh `/root/story119_directory_routing_fix1`（Sol medium）完成8项授权P1，evaluation唯一frontmatter的fixRecord.status=completed；写后evaluation raw/canonical SHA-256=`bbbc4df791371ed585896614dcaf486961e290d1c21c914544d2b3b4867dbded`，sourceMutationAt=`2026-09-09T12:36:20.348Z`。
- 实施delta恰8个文件：shared resolver/contract、CR01与CR06 workflow、两个CR tests、title-bearing ledger及真实packaging manifest。其余34个输入与冻结archive相同；staged hash和HEAD未变，原shared审批tail保持305ac191…。
- Focused31pass/4todo/0fail；syntax、3个Skill lint、canonical warn/strict、隔离build/packaging通过。隔离目录`/private/tmp/speclite-119-packaging.xWHjZ8`，固定输入hash89e2e227…，manifest raw46af6656…，packageHash5b47ae5d…，root已确认live/隔离产物逐字节相同。
- F8未改、TODO/Story/tracker未改、旧/current.tmp保留。首次fixRecord模型误写generic GPT-6，已由同一Fixer只更正为实际Sol medium dispatch metadata，源码/轮次/sourceMutationAt未变，原误报说明保留。
- Root重读fixRecord与8文件delta、复核范围/manifest/审批tail/staged，并重新运行canonical strict=ok/findings=[]。下一步fresh Sol high CR01 round2；未进入CR04/05/06，11.10未启动。

## CR01 Round 2 Handoff（第二轮审查交接）

- Fresh Reviewer `/root/story119_directory_routing_review2` 与root代调度的Blind `/root/story119_r2_blind`、Edge `/root/story119_r2_edge`、Auditor `/root/story119_r2_auditor` 均Sol high/fork none；真实3/3、12/12 AC coverage。Blind仅diff/core输入，三层正式FINAL由Reviewer逐目标validator后原样持久化。
- Summary=`../11-9-code-review-summary-20260909-directory-routing-round-2.md`，FINDINGS_REPORTED；raw/canonical SHA-256=`7e3c77ad7dbcee3cb43eb8bf5951aa2d1c93aa1b985bddfd3b0cfc9941277914`；scopeHash=`sha256:1315de86808401598772542a2ca25e29e18f426232533d9f02207af7c0046037`；findingSetHash=`sha256:71ff8f86eacbaa9c994e6ea3599cbfe4dfc21fcada77879b2812cdd8a2a65f2a`。
- 709actual/42declared/667excluded/0exceptions。Root独立重算canonical scope/finding JSON、42个current digests、live actual集合与staged hash，全部匹配；源码无本轮漂移。新增12个真实workflow outputs为summary及round2.tmp中的11文件，不含futurepaths或输出内容自哈希。
- 5个new patch候选：逐实际writeSubpath绑定、closing delimiter、marker跨series生命周期、hard-link目标、CRLF身份；2个dismiss候选：validator签发证明、跨consumer原子writer。旧8项resolved仅为Reviewer候选关闭；连续new2轮/8→5同样仅为convergence input。
- 唯一下一步fresh Sol medium CR02 round2，独立裁决全部7项及历史关闭并计算门禁；当前没有新增fix授权。11.9仍review，11.10未启动，未commit/push。
