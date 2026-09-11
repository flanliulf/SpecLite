# Evidence Normalization Authorization（证据规范化授权）

## Controlled Completion Contract Acceptance（受控收口契约接受）

- 2026-09-09，用户对“批准受控修订收口契约，为这三项已接受风险建立明确例外，并保留技术失败事实”的请求回复「接受」。此前缺少受控契约修订方向授权的条件已解除，不再次申请 TODO-018/019/020 风险延期或四文件排除授权。
- 本次限定 Story 11.9、`reviewSeries=evidence-v2`、`round=6` 与下文三项原技术 P1 指纹；保留 `FAIL_FUNCTION`、未修复、原始反例及 TODO 状态。不视为全局 P1 自动放行、技术等价或已修复，不启动原缺陷 Fixer/R7。
- Root 进入 `bmad-correct-course` 影响分析，选择 batch 汇总方案；尚未完成完整提案或实施新契约。具体 schema、消费者改动与验证范围须由有证据的最小方案明确，不能将方向接受写成未经展示的全部文件修改授权。
- 只读消费者核验确认 kickoff-only hook 不属于本次 completion 改动范围。任何需要修改 canonical contract/resolver 的方案均须真实验证及独立验收，不以既有 41 文件审查直接证明新增行为。
- Correct Course 的 PRD 发现遇到独立前置冲突：源码与 dist 的 `resolve artifact-documents --subject prd` 均返回 `artifact-path.broken-shard-reference / outside-subject-directory`；`prd/index.md` 包含 `../specs/README.md` 等跨目录导航。该问题不是本次三项风险例外，不擅自修改 PRD、放宽 resolver 或忽略其 block 结果。完整提案状态保持未完成；具体诊断见三份 progress 记录。

## R6 Concurrent File Exclusion Approval（第六轮并发文件排除批准）

- 2026-09-09，用户对上一轮明确列出的四文件“保持原样并排除出11.9”请求回复「批准」。精确排除：`assets/source/speclite/core-skills/speclite-domain-modeling/SKILL.md`、`assets/source/speclite/core-skills/speclite-grill-with-docs/SKILL.md`、`assets/source/speclite/core-skills/speclite-grill-with-docs/SKILL.en.md`、`assets/source/speclite/core-skills/speclite-grilling/SKILL.md`。仅授权排除，不修改、回滚或归为11.9成果，不扩展为其它新文件的泛化排除。
- Root fresh核验HEAD保持ff7528d3f9ec34072bb669ee79f7569345c23d47，live672，原41declared无内容漂移；相对663快照仅新增四项及五个合法CR输出，无missing。
- 现在执行同round=6、同series=evidence-v2的scope-only重绑，不新增实现轮次、不改变finding seed/disposition。先机械保全待替代evaluation/CR04/CR05与旧gate，再fresh Reviewer重绑完整scope，依次fresh Evaluator→CR04→CR05重绑、fresh gate→CR06。旧报告保持可还原，不重复登记TODO或把风险接受冒充修复。

## R6 User-directed Risk Acceptance（第六轮用户指定风险接受）

- 2026-09-08，用户明确要求：「将新的 P1 ，作为 todo 项，目标是收敛结束 11.9，从而进行下一个 story 的执行。」这取代上一轮“修复3项并继续R7”的建议：不启动R6 Fixer，不增加maxRounds，不创建新series或新review round来延长实现循环。
- 精确目标为R6三项已接受且尚未修复的技术P1：`sha256:3efe0732e9f9a20aa9940913efe212d59102bf583c2ffbe8a551e123e5bacb20`（unfinished current-v2 authenticity）、`sha256:6a902447d67688642c6465da4fe74e1914a6011c0a9214b3346d734836dbfdc8`（tilde round delimiter）、`sha256:dd07435baba8abce70cb0f54bdf7a7a43c42b020c7c42cb8dbe5325983813ddc`（inline-list flow mapping）。不改变失败场景、指纹或技术事实，不声称fixed/resolved，不删除原P1/STOP_LOSS/churn历史。
- 用户本次指令是Story11.9当前交付范围内的显式风险接受和延期处置例外：由fresh Evaluator在同轮supersession中区分“技术原等级P1、未修复”与“用户接受延期、当前不阻塞收口”，然后CR05以T1紧迫度登记，记录原等级、风险、来源与下次触及相关认证/classifier之前必须处理的触发条件。原两项T2继续保留，不机械升级或遗漏。
- 本次只调整上述3项的当前交付处置，不永久修改shared contract的P1/TODO规则，不修改canonical Skill、production source/test、SPEC/PRD/Epic，不豁免其它质量、scope、freshness、tracker一致性门禁。先保全原R6 evaluation（canonical hash `sha256:55fef42da7c9a90f7b311721667a6b7a6922bacc05580a5258fdf844f3a2fd61`），再产生唯一current替代评估；原review FINDINGS_REPORTED和其三层失败证据保留，不改成技术零缺陷。
- 收口授权覆盖必要的CR04 record-only、CR05 backlog与durable result、fresh completion gate、CR06最小Story/sprint状态同步以及三份progress记录；必须按顺序完成并独立核验后才能启动11.10。无commit/push或范围外文件修改授权。
- 四个并发canonical文件仍未获得明确scope纳入/排除决定；已另行提出不阻塞当前评估/TODO准备的范围问题。风险接受不自动豁免该scope门禁；当前41declared digest、HEAD与staged hash已复核未漂移。

## Round 5 Stop-Loss Exception（第五轮止损例外）

- 2026-09-08，用户对「R5单次止损例外 + 本系列maxRounds=6；随后仅修复该P1，再执行fresh R6复审」明确回复「批准」。本次解除R5执行门禁，并将 `storyId=11-9 / reviewSeries=evidence-v2` 当前run的 `maxRounds` 从5调整为6；不修改共享契约默认阈值或全局Skills，不重置series/round，不授权未来新门禁例外。
- 原R5 STOP_LOSS evaluation：`11-9-code-review-evaluation-20260908-evidence-v2-round-5.md`，canonical hash=`sha256:c1a2d4bbf76d74fd3b9e1893e6fbb7d4b759b5bc96db2fccbfa413cd3bacae5a`；绑定review canonical hash=`sha256:d3f8b9a7a7015f4fa7313535df23ce219a60ab9db76fae98a693a235c66e53eb`，scopeHash=`sha256:5100d046395d281a6bfce4aa7a55a3d36edd9b10995e5d1b811b3e533b287c19`。Root恢复时核验HEAD、41declared、review/evaluation hash与staged diff均无漂移。
- fresh Evaluator按same-round supersession保留原STOP_LOSS副本，生成唯一current执行性 `FIX_REQUIRED` evaluation；保留原finding dispositions、counts、fingerprints、convergence及真实止损事实，不将授权写成修复完成或PASS。
- 唯一accepted P1：`EVIDENCE-V2-R5-F1`，fingerprint=`sha256:f901eda7efb58650982cf9e821fce188a4e6e64468449e0b2ca04493b79ed7e3`。仅修改 `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs` 与 `test/code-review-contract.test.ts`，另按CR03职责更新current evaluation fixRecord。
- 技术方向：在既有bounded inline-list grammar内拒绝quote外YAML comment introducer，保留合法quoted `#`及普通list，验证authentic predecessor、zero-write与既有producer controls；先真实RED→GREEN，再完整fresh Round6 CR01→CR02。不引入full YAML parser，不吸收quoted tracker key、两T2及其他dismissed/deferred，不改Story/tracker/gate/globalSkills/mirrors，不build/packaging、不commit/push。
- 后续调用参数：`mode=patch / confirmationPolicy=preauthorized / orchestrationMode=runner / handoffTarget=runner`，`authorizationSource`为本记录；冻结目录与tracker bindings不变。643 current实际路径相比R5 review快照只多R5 evaluation，属于mutable workflow output；后续新增/替代报告仍须显式审计，不冒称冻结scope已覆盖尚未产生的文件。

## R5 External Package Exclusion（第五轮外部包排除授权）

- 2026-09-08，用户对「保留并排除 speclite-skill-lint、speclite-skill-creator 两个独立包的变更及后续同包增量，不纳入本次11.9 CR/提交」明确回复「批准」。此前范围阻断已解除。
- 精确包边界：`assets/source/speclite/support-skills/speclite-skill-lint/` 与 `assets/source/speclite/support-skills/speclite-skill-creator/`。本次及后续同包增量进入 actual/excluded，保留原文件，不修改、回滚、打包或纳入本次11.9提交；超出这两个包的新路径仍须按既有scope规则检查。
- 继续保留原41 declared、历史exact excluded与mutable workflow output policy。共享 `release/packaging-manifest.json` 原本已在41 declared内，继续完整绑定当前文件内容，不从scopeHash中裁剪字节；其中来自独立skill-lint的三条新增文件及对应packageHash更新仅作共享派生变更记录，不当作11.9实现成果或本次提交授权。
- Root 将R4 manifest冻结版从已审查diff重建，canonical hash=`sha256:f6304cb3c36f227100460c5099eb569c80fc44c824a536467bb761340b184f15`，与原contentDigest一致；和当前release manifest比较仅有 `rule-registry.json`、`list_rules.py`、`test_skill_tools.py` 的 files/includedRuntimeAssets新增项及packageHash变化，无删除。本任务未执行该刷新。
- 本授权仅解除外部范围门禁，不修改R4 finding裁决，不创建新series，不降低3/3 quorum、fresh evaluation或maxRounds=5；下一步重新冻结完整scope并执行fresh R5 CR01→CR02。

## Round 4 Stop-Loss Exception（第四轮止损例外）

- 2026-09-08，用户明确回复「批准 R4 单次止损例外」，解除本轮执行门禁；仅作用于 `storyId=11-9 / reviewSeries=evidence-v2 / round=4` 已接受的 terminal-state grammar P1。
- 原 STOP_LOSS evaluation 为 `11-9-code-review-evaluation-20260908-evidence-v2-round-4.md`，canonical hash=`sha256:38c7b666aeadda338a7500e4a31a565c428072b850d80c5e22fbbef21a8a5f97`；review canonical hash=`sha256:89fcdab79e86493a2d9cbf60ae992c45865824ed5f5035959d9b434dea28b634`；scopeHash=`sha256:580f0ee9364b4666cf7e908ad93842ab578e9d245acdd745ebaadc9337a2c9a4`。Root 恢复时核验 hash 与 41 个 declared content digest 无漂移。
- fresh Evaluator 按 same-round supersession 保留原 STOP_LOSS 副本，并将唯一 current evaluation 改为本次明确授权后的执行性 `FIX_REQUIRED`；保留所有 finding disposition、counts、fingerprints 与 convergence 真相，不把授权写成修复或 PASS。
- 唯一 accepted P1 fingerprint=`sha256:13ca7c2e80fa880328288c79731adb48aa04f1ffdacdb94ebb93e7886dccafaa`。执行技术方向：保留 preflight 已接受且 contract 未禁止的内部 pipe scalar，使 bounded matcher 能精确认证；不得通过收窄合法输入来改变要求，继续拒绝首位 block indicator、comment、duplicate、missing、substring 与 non-terminal。
- fresh CR03 只修改 `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs` 与 `test/code-review-contract.test.ts`，另按职责更新 current evaluation 的 fixRecord；`mode=patch / confirmationPolicy=preauthorized / orchestrationMode=runner / handoffTarget=runner`。
- 保持真实 RED→GREEN，随后重新冻结完整 scope 并 fresh Round 5 CR01→CR02。仍为同一 series，`maxRounds=5` 不变，不授权未来新止损例外，不改 shared contract 阈值。
- 不吸收 selected-series prefix、两项 T2、whole-YAML、TOCTOU 或其他 dismissed/deferred；不改 Story/tracker/gate/global Skills/mirrors，不 build/packaging、不 commit/push。原有所有历史授权与 STOP_LOSS 事实保留。

## Round 3 Stop-Loss Exception（第三轮止损例外）

- 2026-09-08，用户明确回复「批准本次止损例外」，对应上一轮推荐的单次受控继续方案。
- 唯一作用：允许同一 `storyId=11-9 / reviewSeries=evidence-v2 / round=3` 在已真实触发连续三轮新增阻塞止损后，继续修复本轮已接受的 F1/F2；不删除或改写止损事实，不重置 series/round，不改变 shared contract 默认阈值。`maxRounds=5` 保留，未来新门禁不自动获例外。
- 绑定原 STOP_LOSS evaluation：`11-9-code-review-evaluation-20260907-evidence-v2-round-3.md`，canonical hash=`sha256:c008026cedb3fd693ad57a577b8b63ba964f13e446b83753e6741f7955724696`；review canonical hash=`sha256:cd196bdc14154b16cefb7b9b16a71d225344b32e60a25964db233f5e139f70a7`。
- 规范恢复步骤：fresh Evaluator 验证上述授权与输入未漂移后，按同轮 supersession 保留原 STOP_LOSS 历史副本、生成唯一 current `FIX_REQUIRED` evaluation，保留 accepted counts/fingerprints/convergence 全部事实，并明确本次用户例外是执行路由改变的唯一理由。该记录变化不意味着任何finding已修复或通过。
- 随后 fresh CR03 仅修改 `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs` 与 `test/code-review-contract.test.ts`，以及 current evaluation 的 fixRecord。
- F1 fingerprint=`sha256:246de7037cff9f0b2f51929313785794e67b5066e9c99ba1cd27de5c559efdfd`：exact selected-series `@round` malformed intent fail-close。
- F2 fingerprint=`sha256:c51fd1f311e9dbfd75b522ce77000dbbd2731670a1160c0634c492ccd7f3051e`：bounded double-quoted inline-list 非法 escape fail-close。
- 保持真实RED→GREEN、修后fresh Round4 CR01→CR02；禁止吸收TOCTOU、两项T2或其他dismissed项，不扩大grammar/owner contract，不更改Story/tracker/gate/globalSkills/mirrors，不commit/push。

## Round 2 and Subsequent Bounded Fix Authorization（第二轮及后续定点修复授权）

- 用户明确确认：「确认两文件方案，后续如果有类似情况，优先自动按照你的推荐直接进行，无须等待回复确认，你需要自主决策来保障顺序进行而不是挂起任务」。
- 本次批准 R2 F6（fingerprint `sha256:4ac82b8bd024bfb5ba610fa75e3eba2230a93105fbbee4caf6de478cf629030a`）：仅修改 `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs` 与 `test/code-review-contract.test.ts`，在reserved `.tmp`/`goal-execute-records`预检中进行no-follow lstat、真实目录和realpath containment检查，保留absent合法路径，沿既有safe diagnostic fail-close；先真实RED再GREEN，补symlink/non-directory/contained/absent与zero-write回归。
- 当前evaluation canonical hash=`sha256:6eae6ba33cd2d15e16e94c1f483d9884e6ba5270e79eed9ad23970610528a340`，mode=patch、confirmationPolicy=preauthorized、orchestrationMode=runner、handoffTarget=runner。
- 后续同类事项：fresh Evaluator已接受、在现有需求与owning contract内可定点关闭的修复/验证，由runner选择推荐方案，先记录exact finding/path/验证及排除范围，再以本授权推进，不重复请求用户确认。保持strict serial、fresh角色、真实验证和修后复审，不降低任何质量门禁。
- 本授权不允许吸收dismissed/deferred项、不允许修改无关文件、扩展需求/owner contract、破坏性操作或push；全局Skills与外部drawer/mirrors仍排除。对本轮F5/F7保持延期，不实现。
- 原有历史授权记录保留；其中对同类定点修复“需再次确认”的描述自本次起由此明确授权覆盖，不冒充历史已授权。

## Authorization（授权）

- 记录时间：2026-09-07T06:16:18Z。
- 用户先批准「11.9 收口证据规范化方案 A」，随后对明确列出的三个参数回复「确认」。
- `reviewSeries: evidence-v2`；这是证据规范化新世代，不声称有新实现、不隐藏历史 findings。
- `baseSha: ff7528d3f9ec34072bb669ee79f7569345c23d47`；本次由用户明确选定，不冒充历史 development baseline。
- 当前 `headSha` 与上述基线相同；未提交内容须由 fresh review scope 独立绑定。
- 本次 workflow tracker 显式 optional，调用上下文合并用户授权为 `workflow: {required:false}`；不是从配置缺失推断，也未修改项目配置。
- `orchestrationMode: runner`；`handoffTarget: runner`。
- CR05/06 的 `confirmationPolicy: preauthorized`，`authorizationSource` 指向本记录及原 Epic 11 goal。仍须满足全部前序证据和状态门禁。
- 本次参数确认不代替精确 scope/excludedFiles 确认；先生成 scope proposal，用户确认后再开始新系列 fresh review。

## Scope Approval（范围批准）

- 用户随后明确回复「确认」，批准 `evidence-v2-scope-proposal.md` 的 40 个 proposed declared 加 ledger fixture 共 41 个审查文件，以及 517 个 excluded 路径及其理由。
- 同意提案中的 mutable workflow output policy：本次 CR 新产物显式追加 actual/excluded 清单，不属于实现内容；不得隐藏 actual 文件，也不得让报告内容形成自身 scopeHash 循环。
- root 恢复时重算清单 558 个路径，missing=[]、extra=[]。本次批准不是源码修改授权。
- 下一步 fresh v2 Reviewer→Evaluator；仅真实双通过后进入原收口顺序。

## Frozen Resolver Context（冻结解析上下文）

当前 `node dist/bin/speclite.js resolve config --project-root /Users/fancyliu/Repos/SpecLite` 成功；merged config 未含 workflow tracker 配置，本次仅叠加上述显式用户授权。

唯一 resolver 本次已成功运行，结果如下；runner mode 下游不得重新解析：

```json
{"ok":true,"storyId":"11-9","reviewSeries":"evidence-v2","canonicalCrDir":"_bmad-output/implementation-artifacts/code-reviews/11-9-code-review","crDir":"_bmad-output/implementation-artifacts/code-reviews/11-9-code-review","compatibilityMode":"canonical","legacyArtifactPaths":[],"issue":null}
```

```json
{"story":{"required":true,"path":"_bmad-output/implementation-artifacts/stories/11-9-normalize-code-review-artifact-directories-by-story-id.md","key":"Status","expectedTerminalState":"done"},"sprint":{"required":true,"path":"_bmad-output/implementation-artifacts/sprint-status.yaml","key":"11-9-normalize-code-review-artifact-directories-by-story-id","expectedTerminalState":"done"},"workflow":{"required":false}}
```

## Boundaries（边界）

## Round 1 Fix Authorization（第一轮修复授权）

- 用户对六项已评估P1、以下三文件定点修复请求明确回复「确认」。此授权覆盖先前“仅证据规范化、不改源码”的限制，但仅限F1–F6及下列路径：
  - `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs`
  - `assets/source/speclite/sdlc-skills/4-implementation/speclite-goal-orchestrator-epic-story-code-review-runner/references/runner-workflow.md`
  - `test/code-review-contract.test.ts`
- 输入current evaluation canonical hash：`sha256:e9318114aa632493a41aee8bf487a65882ece9aaee15a29d9eb03f3a341dada3`，verdict=`FIX_REQUIRED`，F1–F6 accepted P1、F7 deferred。
- 执行 `mode=patch`、`confirmationPolicy=preauthorized`；本记录为authorizationSource，runner/handoffTarget继续为runner，目录沿用已冻结context。
- 先真实RED再patch；F4让resolver服从既有producer schema，不改schema/templates；F5恢复generic evaluator-owned审批语义，但本次run仍需fresh双通过。
- 不改全局Skills、历史P2、其他源码/测试、旧review或superseded evaluation。不因派生治理提醒扩大三文件范围；额外必要修改须报告。
- 允许按CR03职责在current evaluation追加fixRecord及执行摘要，不改原verdict或finding裁决。修复后重新冻结scope并fresh CR01→CR02。

## Original Normalization Boundaries（原规范化边界）

- 原 R1–R24 legacy review/evaluation 和 HALTED provisional CR04 原位保留，不伪造历史 schema、scope、fingerprint 或时间。
- 新 v2 CR01/02 必须真实 fresh 执行；不把 legacy 双 PASS 转抄为新 verdict。
- carried `supersededIndex` P2 保持非阻塞延期，不实现、不升级；新 fingerprint 必须公开 seed 和生成时间，不能声称历史已存在。
- 本规范化步骤不修改源码、全局 Skills、外部 drawer、mirrors、fixed-count baselines；不启动 Story 11.10、不 commit/push。
- 新系列满足全部 CR04→CR05→fresh completion gate→CR06 后，才允许 Story/tracker done 并继续原 Epic 目标。
