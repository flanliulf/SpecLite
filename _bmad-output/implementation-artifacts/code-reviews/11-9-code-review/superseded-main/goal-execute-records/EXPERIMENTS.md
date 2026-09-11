# Directory Routing Experiments（目录归属执行记录）

## 2026-09-09 CR01 Round 2 Complete（第二轮审查完成）

- fresh3/3审查完成，review summary raw/canonical=`7e3c77ad7dbcee3cb43eb8bf5951aa2d1c93aa1b985bddfd3b0cfc9941277914`，5patch/2dismiss候选，12AC完整覆盖。原始层输出原样保存，root仅代调度。
- Reviewer实际focused31passed/4todo/0failed、syntax与42路径diff-check通过；受控fixture复现closingdelimiter、CRLF、hardlink与旧series marker阻断，不运行主目录writers。
- Root读完整正文/结构化header并重算scope1315de86…、findingSet71ff8f86…、42currentdigests，live709actual与manifest相同，无新增/缺失路径或实施漂移，staged06426fd…保持。三日志写前exactproductionvalidator均ok。
- 本轮12个新增workflow paths：summary及.tmp/directory-routing-round-2中的review-input.diff、spec-content.md、anchor-evidence.md、history-registry.json、三个原始layers、normalized-findings.json、classified-findings.json、scope-manifest.json、scope-manifest-final.json。全部为真实actual/excluded，不哈希自身内容。
- 下一步fresh CR02 round2；候选关闭、5项新问题和收敛门禁均待Evaluator独立裁决。

## 2026-09-09 CR03 Round 1 Complete（第一轮修复完成）

- Fresh Sol medium完成F1/F2/F3/F4/F5/F6/F7/F9；RED为7failed/24passed/4todo，GREEN为31passed/4todo/0failed。F7新增固定五字段ownership marker的写前validator顺序、bounded reader和恢复/ambiguity/zero-migration测试。
- Syntax、相关consumer/docs断言、3个Skill density、canonical warn/strict通过；固定输入隔离build与packaging通过。目录`/private/tmp/speclite-119-packaging.xWHjZ8`，inputHash=`89e2e227744b15acbc7a807ff380446344d16575327a457e9e071fb279436f42`，manifest raw=`46af6656c082fd17eb94b0d2ec8178533c38a0c06e42ac96907ec12b7b0ccdf5`，packageHash=`sha256:5b47ae5d416c18e535d24b1fb558faf3e41a3cdaa6b1b32bc7dc5be5ba005172`。
- Root按原archive逐文件比较42输入，只有fixRecord列出的8个有变化；其余34不变，审批tail与HEAD逐字节相同，staged hash仍06426fd…，manifest与真实隔离产物相同。canonical strict再次ok/findings=[]。
- 最终evaluation hash=`bbbc4df791371ed585896614dcaf486961e290d1c21c914544d2b3b4867dbded`，fixRecord completed，sourceMutationAt=`2026-09-09T12:36:20.348Z`。模型元信息由同一Fixer作机械更正并留痕，未重做修复。下一步fresh round2 Reviewer→Evaluator。

## 2026-09-09 CR02 Round 1 Complete（第一轮评估完成）

- Fresh Sol medium Evaluator 完整执行独立只读评估，正式产物 `../11-9-code-review-evaluation-20260909-directory-routing-round-1.md`，raw hash=`2068bc9c0252b59e9c539226fe9d390be360080f0842bc04654ef72a74f7a5fe`。
- 结果 FIX_REQUIRED：F1/F2/F3/F4/F5/F6/F7/F9 accepted P1，F8 dismissed；无 deferred 或 verify-only。TODO018–022逐项核验，保留 open/partially superseded/owner-transferred 的区别，未修改 backlog。
- Root 完整读后复算 bindings、42个实施摘要和live scope；697actual/42declared/655excluded，新增仅 evaluation，staged unchanged。三日志写前 production validate-context 均ok，没有重跑resolver。
- 收敛 new8/recurred0/resolved0/churn=false，未命中stop-loss；下一步fresh CR03 patch，完成后fresh round2，不直接收口。

## 2026-09-09 CR01 Round 1 Complete（第一轮审查完成）

- 已实际执行 fresh Sol high CR01，内部三层由 root 代调度；Blind/Edge 先运行，槽位释放后启动 fresh Auditor。三层完成后才汇总，未复用角色冒充 quorum，未并行启动 CR02。
- 结果：`FINDINGS_REPORTED`，9 patch candidates，3/3 layers；report raw/canonical hash（单 terminal LF）024c2d4923d9111e1c2f5dce2c2d113641f716038203852047d6ca256fd836a9。完整 source-of-truth 为 canonical summary 与 `.tmp/directory-routing-round-1/` 的十个实际 inputs/outputs。
- 本轮 Reviewer 实际执行目录 focused tests 10/10 PASS、node syntax PASS、diff check PASS；F1–F5 临时 fixture 与 F9 文档命令实际复现。其通过测试未覆盖这些反例；原 full 695/13/4 仍为历史非全绿结果。
- Root 已独立验证 final scope payload 的规范化 JSON 与 scopeHash d0b1ef37… 完全一致、finding JSON hash 01de0380… 一致、42 个 normalized contentHash 全部匹配、当前 696 路径与 manifest actual 完全一致。复查原字节 archive、HEAD、staged 均未漂移。
- 本轮新增11个实际workflow paths：canonical summary + round tmp中的review-input.diff、spec-content.md、anchor-evidence.md、history-registry.json、scope-manifest.json、scope-manifest-final.json、b1-blind-hunter.md、b2-edge-case-hunter.json、b3-acceptance-auditor.md、classified-findings.json；全部显式excluded，不把报告内容纳入自身digest。
- 下一步：fresh CR02 Sol medium，逐项第一手反证、范围/职责裁决和 TODO018–022 新实现处置核验。没有批准修复、清理历史或改 tracker。

## 2026-09-09 Authorized Task Continuation（已授权任务接续）

- 本任务承接原任务完整目标并已 create_goal，不设 token 预算；用户已授权当前 checkout 新任务，无需再等待相同授权。
- 全量读取当前三个 goal records、baseline JSON、runtime context、Story、tracker、development gate；实际执行 resolve config 和三个日志路径的 production validate-context，均成功；没有第二次 directory resolve。
- 42 个 source/manifest 与真实字节归档一致；HEAD、staged raw hash、development gate、manifest 和 frozen context raw hashes 与交接相同；原 shared approval tail 逐字节保全。
- 首次 git name-only 默认 rename 合并只显示 666 个路径；改用 --no-renames 完整列入旧/新路径后得到 685 actual / 42 declared / 643 excluded / 0 exceptions，21 个已暂存 rename 保持。此为审计列举方式纠正，不是工作树漂移。
- 当前无 directory-routing round review/evaluation；沿用完成的 development，下一步实际启动 fresh CR01 Sol high。CR02、11.10、commit 均须按既定 gate 串行推进。

## 2026-09-09 Preflight（预检）

- Story：11.9；series：directory-routing；round：开发阶段，CR round 1 尚未开始。
- Skills：goal-orchestrator-epic-story-code-review-runner、bmad-dev-story、canonical-source-governance-runner、check-canonical-source-change。
- 原因：用户已批准完整替换方案，需冻结混合工作树并按原始 AC 收敛。
- 结果：HEAD=ff7528d3f9ec34072bb669ee79f7569345c23d47；678 actual changed paths；41 source/test/docs 授权路径；staged diff sha256:06426fd385ef8a387cfe9aecb0ac0472274c3c0de69ed2fd107ed0d44f17787f。
- Checker：warn status=ok，findings=[]；不等于本轮实现完成。
- 当前 completion gate 仍为旧 FAIL_FUNCTION，旧日志中的 PASS_EQUIVALENT 仅历史事实。没有重写或绕过。
- 下一步：fresh Sol medium 执行开发；未启动 CR 或 11.10。

## 2026-09-09 Development Baseline（开发基线）

- Skill activation：完整读取 `.agents/skills/bmad-dev-story/SKILL.md`；系统 `python3` 缺 `tomllib`，改用 `/opt/homebrew/bin/python3.12` 成功解析 workflow；prepend/append 为空，persistent project context 已读取。
- Scope：41 个 approved source/test/docs 路径逐项 raw hash 与 `directory-routing-baseline.json` 匹配；Story 文件仅因已批准 replacement tasks 与 authorization 记录相对冻结 hash 改变。
- Build：`npm run build` PASS。
- Focused baseline：`npm test -- test/code-review-contract.test.ts` → `110 passed / 4 todo`。
- Affected baseline：`37 passed / 4 failed`；四项均为工作树外部 core `18 -> 19`、default total `68 -> 69` fixed-count drift。
- Full baseline：`776 passed / 17 failed / 4 todo`。除同一 fixed-count drift 外，包含 title-bearing ledger 扫描遇到当前 symlink、npm cache `EPERM` 与 packaging manifest 缺失的链式失败。
- Incident：full suite 内 `story-6-4-path-portability` / `release-packaging-check` 间接调用 packaging writer；在 `npm pack` cache `EPERM` 后使主目录 `release/packaging-manifest.json` 缺失。已停止主目录 writer tests；冻结 hash 为 `sha256:82bf17e81ce0ce06cab618084f79c817707bf8537146772e3bf2e69bd4a3c976`，未用 HEAD/index/其他错误 hash 覆盖。恢复由主 orchestrator 单独处理。
- 下一步：新增 directory-only / production context validator RED tests；后续 full 与 packaging 只在 fixed-input 隔离副本执行。

## 2026-09-09 Development And Validation（开发与验证）

- RED：新增 `test/cr-directory-resolution.test.ts` 首次 `1 passed / 9 failed`；resolver/validator 首轮后 `8 passed / 2 failed`，剩余为消费者接入和 title ledger。
- GREEN：focused 最终 `25 passed / 4 todo`；原 shared contract tests 精确保留 15 项与 4 个 `it.todo`。production install test 真实安装到临时 `.agents/.claude`，逐字节比较 resolver 并从 target cwd 执行 resolve/validate CLI。
- Build/docs/governance：`npm run build` PASS；`npm run docs:check` PASS（72 Markdown、5 drafts）；canonical strict status=ok/findings=[]；八个 changed Skill density lint 均 exit 0；`git diff --check` PASS。
- Affected：`37 passed / 4 failed`；四项均是已存在且范围外的 core `18→19` / total `68→69` 固定计数。
- Full 隔离输入：`/tmp/speclite-119-full.3X30U6`，独立 npm cache，关闭 file parallelism 后 `695 passed / 13 failed / 4 todo`；12 项为同一范围外固定计数，另 1 项是 copy 位于 `/private/tmp` 被 local-source 安全规则拒绝。该单项在 `/private/var/folders/m8/1dsqp1x11bq5mwvk4tjdf0cw0000gn/T/speclite-119-local.K9xT5P` 重跑为 `14 passed`。manifest 并发缺失不再复现。
- Packaging 最终固定输入：`/tmp/speclite-119-pack-final.AVpTDw`；完整 canonical source 聚合 hash `8991d397…`。独立 cache 的 `release:packaging-check` PASS，731 files / 726 runtime assets；早期隔离快照 `/tmp/speclite-119-pack.qEsgro` 的 baseline JSON hash 为 `b3965a10…`、Story 相关 packages 聚合 hash为 `4acc897f…`。
- 新派生 manifest：隔离与主目录 rawHash 均 `029b8110cd2cc87d5870a9ddd7ac185af11b7ff5c4b574d90a791c91efcc576a` 且 `cmp` 一致；packageHash `sha256:143d04dc22b6ab4dfe2248352841588a696baa7c7146efc8197a28c6ed2c2335`。这是工具真实新派生，不是旧 `82bf17e8…` 原字节恢复。
- 下一步：正式 fresh CR01 round 1。开发期 installed production CLI/path 验证不冒充六个 LLM Skill 审批 E2E；后者由正式 CR01–06 持续形成最终证据。

## 2026-09-09 Development Completion Flow Gate（开发完成门禁）

- 流程纠正：先将 Story/sprint 从提前写入的 `review` 恢复 `in-progress`，再激活并完整读取 canonical `speclite-flow-gate`、workflow details、regression scenarios、report template 与 customization。
- 旧 live `FAIL_FUNCTION` gate 在覆盖前逐字节保存到 `goal-execute-records/.tmp/directory-routing-development-completion/gate-before-refresh-fail-function.md`；源/备份 raw SHA-256 均为 `b013691d7d53c2b91c1397294ba2c82688356212fc596e043e4987ca534c65ff`，`cmp` 一致。
- Fresh `story-completion` development gate 依据当前 contract/function/evidence 生成 `PASS`，raw SHA-256=`e7f93a5531ebfaffe7e483361eca67dd45a4b7e56a8b645d8532dded6935cd1f`；frontmatter machine check 允许继续，Flow Gate skill/hook tests `18 passed / 0 failed`。报告如实记录 Model Used=`OpenAI GPT-5.6 Sol (medium)`。
- Gate 只允许 development → review，不预先要求或替代正式 CR 链。确认 allowing result 后才把 Story/sprint 更新为 `review`；后续顺序为 CR01/02 → 必要 CR03 与复审复评 → CR04/05 → fresh closeout gate → CR06。

## 2026-09-09 Root Pre Review Audit（主编排审查前审计）

- Root 重读实际 runtime config，唯一 directory resolver 返回 canonical context；实际 production validator 通过，冻结于 `directory-routing-runtime-context.json`。
- Scope audit：685 actual / 42 declared / 643 excluded / 0 exceptions；sourceMutationAt=`2026-09-09T08:00:19.114Z`，snapshot hash=`sha256:0c17ac20abbe3bed4211177ee35e07c519496eee88a8f3f0b0f359db0fa5963b`。
- 排除文件 raw hash 漂移为空；staged diff hash=`sha256:06426fd385ef8a387cfe9aecb0ac0472274c3c0de69ed2fd107ed0d44f17787f` 未变；shared approval tail 与原 HEAD 逐字节一致。
- 当前 42 个输入的可恢复字节归档：`/private/tmp/speclite-119-directory-routing-source.J0id76/approved-source-bytes.tgz`，raw SHA-256=`403315d697a0bef4ead88363ef32943f76d3231d655df2a9c0a0fefb736168ad`。不是丢失的旧 manifest 原样恢复。
- Root canonical checker 再次 status=ok/findings=[]；D1/D2 决策沿已记录 targeted changes。正式接收 dev FINAL 并独立验证 fresh gate raw hash，下一步 fresh CR01 round 1。

## 2026-09-09 Fresh Agent Launch Failure（独立角色启动失败）

- fresh CR01 spawn 参数：task=story119_directory_routing_review1，model=gpt-5.6-sol，reasoning=high，fork_turns=none。结果为 `agent thread limit reached`；精确 task prefix 查询返回空数组，未创建 reviewer。
- 安全替代检查：`codex exec --ephemeral --sandbox read-only --model gpt-5.6-sol`，仅要求 READY、禁止读取项目/工具/修改。首次受外层 sandbox 初始化限制；经工具权限审核允许后重试，实际 CLI 0.132.0 返回模型需要更新客户端，exit 1。未产生 READY 或 review，不伪报 fresh-agent 可用。
- 已停止探测，不变更模型、不升级 CLI、不创建新用户任务。保存 HALT_ENVIRONMENT 和精确 CR01 接续点；原实施输入、gate、source/staged 保护边界不变。

## 2026-09-09 Environment Revalidation 2（环境复核二）

- 以 fresh fork、Sol high 重试独立角色入口，spawn 仍失败于 agent thread limit；没有可等待的 live reviewer handle，不伪称 verified wait。
- 当前 CLI version 读取为 0.132.0，不重复启动已证实版本不兼容的模型请求。
- 只读从既有 archive 提取比较 42 个文件，approvedSourceDrift=[]；逐项 baseline 排除文件核对 excludedDrift=[]；staged hash 06426fd3… 与 gate raw e7f93a55… 未变；current-series artifacts=[]。
- 前一 goal turn 分类为 progress（完成实施、开发 gate 与真实环境失败证据）；本 turn 分类为 no progress（相同环境阻断仍在，审查状态没有推进）。日志追加不冒充交付进展。

## 2026-09-09 Environment Revalidation 3（环境复核三）

- 前一 goal turn=no progress；本次 fresh Sol high / fork none 创建仍失败，未取得 live reviewer handle，不能归类为 verified wait。
- 当前 code archive 比较无漂移、staged hash 未变、开发 gate hash 未变、current-series artifacts=[]；没有可以安全推进的下一外层步骤。
- 相同阻断已到第 3 个连续 goal turn，调用 update_goal blocked 成功。没有更新 CLI、改模型、删除旧 agents/会话数据、创建新用户任务或跳过 CR。
- 只同步三份进度记录；源码和 Story 状态未改变。精确接续点固定为 directory-routing round 1 CR01。
