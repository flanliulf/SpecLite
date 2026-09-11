# Experiment Notes（实验备注）

## 2026-09-03 00:40:33 CST — Initial Decision（初始决策）

- 实时判断：Story 11.2 的前序 gate 已满足，但 public manifest/index 与 `CommandResult` shape 的 owning contract decision 尚未执行，必须由 kickoff 关闭。
- 决策原因：Story Dependency Gate 明确禁止 generator/presenter 临场发明逐-root public shape；`SPEC 01` 与 `SPEC 04` 分别拥有 public JSON 与 manifest/index schema evolution。
- 风险：若为了展示七 roots 同时修改未批准的 public fields，会造成 schema ownership 越界；若用 snapshot-only 或 command-local constants 投影 roots，会形成 Story 11.1 resolver 的第二套 defaults。
- 待关注问题：优先选择最小、兼容且可审计的 owner decision；必须保留 final authorization + lock 前零写入、Public Docs 与 Project Knowledge separation、project-relative POSIX 与 deterministic ordering。
- 用户介入点：普通 contract engineering decision按最保守方案并记录；若需要改变既定需求边界或无法在 `SPEC 01`/`SPEC 04` owning contract 内形成唯一 bounded shape，则 kickoff 返回 `DECISION_NEEDED` 并请求用户。

## 2026-09-03 — Development Result（开发结果）

- 实时判断：Story 11.2 development 已满足进入 CR 的必要条件，但 public schema additive compatibility 与大量 fixture 变化必须由 Reviewer/Evaluator独立确认。
- 决策原因：Owner decision、Flow Gates、Story/tracker 与验证证据均已 live 核验；11.1 累积变更仍是当前 baseline，不应被 Reviewer误判为 11.2 新 scope。
- 风险：optional `artifactRoots[]` 在不 bump v1 时必须对旧 consumers 真正向后兼容；manifest/index/CommandResult/Ready Summary 的 path、ordering、mode、ownership、contractRefs 需完全一致；`src/bin/speclite.ts` 与 `release/packaging-manifest.json` 不在 Story 初始预计列表，必须验证其必要性与最小性。
- 待关注问题：Reviewer 应检查 writeAuthorized=false、lock conflict、invalid/missing target path 的 zero-mutation evidence；检查 module metadata 是否消费 shared registry而非成为第二真源；检查 existing fallback/mismatch/migration 和 workflow routing未被混入。
- 用户介入点：Reviewer 阶段只产出 findings，不自行修复；任何 public contract ambiguity 交由 Evaluator分类。

## 2026-09-03 — Canonical Governance Decision Record（Canonical 治理决策记录）

| Surface | Decision | Reason | Evidence |
| --- | --- | --- | --- |
| `canonical-source-truth` / `module-discovery-contract` (`D0`) | updated / verified | `module.yaml` 的七 root fields/defaults/directories 是 Story 11.2 fresh projection 的 canonical metadata；package roots 与 skill counts 未变化 | warn + strict checker `status: ok`，core 18、sdlc 50、defaultInstall 68；focused module/fixture tests 61/61 |
| `release-evidence` (`D0`) | updated / verified | packaged canonical source 内容变化，需要新的 package hash | `release/packaging-manifest.json` diff；`npm run release:packaging-check` passed |
| `current-public-docs` (`D1`) | skipped | `docs/quick-start.md`、`docs/reference/workflow-artifact-layout.md`、`docs/explanation/speclite-modules.md` 等仍含旧 fresh defaults，但它们不在 Story 11.2 `Files To Modify` 授权范围；按 AGENTS.md 不擅自扩 scope，交 Reviewer/Evaluator 判断是否阻塞或后续受控同步 | `rg` 命中旧 `planning-artifacts`、`project_knowledge=docs`；Story 11.2 bounded file list |
| `living-legacy-reference` (`D2`) | skipped | 本轮只改变 fresh runtime/module projection，没有证据要求改写仍指导维护的 legacy mapping/context | governance map 与 scoped diff |
| `frozen-historical-record` (`D2`) | historical snapshot | 已完成的 canonical source `PLAN.md` / `EXPERIMENTS.md` / handoff 记录必须保留当时事实，不静默刷新为当前 defaults | governance policy `frozen-historical-record` |

- 实时判断：D0 已确定性闭环；D1 docs drift 真实存在但当前未获文件修改授权，不能伪称 resolved。
- 决策原因：canonical governance 要求 D1 明确 `updated`/`skipped`，项目 AGENTS.md 要求修改未点名文件前取得授权；因此保留 evidence 并交 CR gate。
- 风险：若 Reviewer/Evaluator 判定 current public docs 是 Story 11.2 completion blocker，需要新的明确授权或 evaluator-bounded fixer scope，不能由外层直接改。
- 待关注问题：Reviewer 需区分 Story 11.2 public schema SPEC 更新与 repository public docs maintenance，不把 glossary 当 canonical runtime contract。
- 用户介入点：当前先进入只读 Reviewer；若 Evaluator 将 docs 同步判为 P1 且范围明确，可按 CR fixer workflow执行，否则请求用户。

## 2026-09-03 — Reviewer Round 1 Result（首轮审查结果）

- 实时判断：两个 finding 均有直接证据，必须由独立 Evaluator；full suite green 不足以证明 ReadyCheck reconciliation 或 public docs current truth。
- 决策原因：Reviewer 通过删除/错配 manifest projection 的定向复现证明 `readyOk=true`，并引用 governance policy 与具体 docs 旧 defaults。
- 风险：Finding #1 的修复必须保持旧 manifest兼容，不能让 additive optional field 变成所有 lifecycle 的无条件 required；需要以 fresh/install context 或 command input presence定义 reconciliation。Finding #2 修改 docs 会扩大原 Story file list，必须由 Evaluator明确 bounded scope或转 TODO。
- 待关注问题：Evaluator 应检查是否已有 stable issue ID 可表达 ReadyCheck projection mismatch；若新增 issue ID，需要 owner-gated SPEC 07 或复用 rationale，不能临场自由文本。
- 用户介入点：若 docs 修复或 ReadyCheck issue taxonomy 需要改变需求边界/未授权 contract owner，Evaluator 应标 decision_needed；否则可给出 bounded fixer授权。

## 2026-09-03 — Evaluator Round 1 Gate（首轮评估门禁）

- 实时判断：两个 finding 均已得到明确 bounded fix path，可以进入 Fixer；不允许新增 issue ID 或扩展 docs scope。
- 决策原因：ReadyCheck false positive 破坏 AC4-6，P1；D1 docs current truth 可在精确 8 文件章节内闭环，P2。
- 风险：reconciliation 必须以 input `artifactRoots` presence 代表 fresh/install expected projection，避免旧 caller/旧 manifest被 optional additive field误伤；比较需覆盖 count/order/field唯一性与完整 entry，不得只比 resolvedRoot。Docs 修订不得提前实现 11.4+ routing。
- 待关注问题：Fixer 应补 manifest projection missing、order/field/resolvedRoot mismatch、duplicate field regressions；details deterministic且不含 path/hash/timestamp。Docs 应保留 existing-install/legacy compatibility语境，不把 fresh defaults误写成自动迁移。
- 用户介入点：无。若 fixer 需要新增 taxonomy、修改第 9 个 docs文件/其他章节或改变 schema，必须 HALT。

## 2026-09-03 — Fixer Round 1 Result（首轮修复结果）

- 实时判断：两个 evaluator-authorized finding 已有修复与 green evidence，但必须复审复评；授权外 docs示例不能自动认定为 blocker或误报。
- 决策原因：Fixer只在 `input.artifactRoots` present 的 fresh/install path强制 reconciliation，保留 legacy omit compatibility；docs patch严格受 evaluation 8 文件/章节限制。
- 风险：ReadyCheck comparison helper较大，需审查是否对 optional fields、contractRefs排序、manifest parser invalid-entry issue重复/覆盖正确；issue details必须持续 redacted。Docs follow-up中的 generic paths可能是 workflow routing/historical example，而非 fresh config default，需按语义分类。
- 待关注问题：Reviewer Round 2 应对 missing/count/order/duplicate/entry mismatch逐分支复核；检查旧 caller compatibility与manifest-present/input-absent行为；判断授权外 docs是否属于 11.4+ routing、现有安装示例或 current fresh default drift。
- 用户介入点：若 Reviewer产生新 finding，交 Evaluator；不得由外层扩 docs scope。

## 2026-09-03 — Reviewer Round 2 Result（第二轮复审结果）

- 实时判断：ReadyCheck历史 P1已关闭，但最新 Reviewer仍不通过；resolutionMode finding可能揭示 Story AC4“fresh-default”与 detailed explicit input的边界，需要Evaluator从 SPEC09/CLI contract裁决。
- 决策原因：路径override确实生效且用户非空输入是显式选择；现实现将mode统一为fresh-default，可能导致Ready Summary语义错误。但若owning contract规定fresh lifecycle永远fresh-default，则Reviewer建议可能越界。
- 风险：直接改为explicit-config可能改变 manifest/CommandResult fixtures与 completion gate expectation；必须确认“fresh default projection”是否允许 detailed override及 mode literal。Tutorial Step1/6修复必须仅更新default quick config检查路径，不修改brownfield Skill routing。
- 待关注问题：Evaluator应检查 Story11.1 resolver contract、SPEC09 root matrix、Story11.2 AC1/4/5、detailed prompt与tests；若语义冲突无法由owner contract唯一决定，应标decision_needed而非猜测。
- 用户介入点：如果 contract证据不能唯一裁决mode，需请求用户；若可确定，则给bounded resolver/test/fixture scope。

## 2026-09-03 — Evaluator Round 2 Owner Decision Gate（第二轮评估 Owner 决策门禁）

- 实时判断：contract evidence 无法唯一裁决 fresh detailed 非空逐-root输入的 `resolutionMode`，属于需求语义分叉，不能由 Fixer 或外层 orchestrator 猜测。
- 决策原因：Story 11.2 AC4 与 kickoff gate 把七 roots 写为 `fresh-default`；CLI detailed prompt 与 tests 又允许用户逐-root覆盖；Story 11.1 public resolver enum/summary要求 mode 表示真实来源；`SPEC 09` 只定义 fresh defaults 与 existing explicit config，未定义 fresh lifecycle + detailed explicit input 的交叉语义。
- 推荐方案 A：非空逐-root输入标为 `explicit-config`。仅 quick/default 或只由 `output_folder` 派生的逐-root defaults 保持 `fresh-default`；保留现有 override能力，并使 manifest/CommandResult/Ready Summary 如实表达来源。该方案需要受控修订 `SPEC 09`、Story 11.1 resolver contract、Story 11.2 AC/kickoff evidence，再按 evaluator批准范围修改 resolver/tests。
- 备选方案 B：继续标为 `fresh-default`。必须明确 fresh lifecycle 的 mode只表示 lifecycle而非值来源，并同步澄清 Story 11.1 contract、prompt/tests；若无法接受显式输入仍称 default，则应禁止或移除逐-root override，行为影响更大。
- 已授权但暂停项：Finding #2 的 P2 tutorial Step 1/6 exact patch不需要额外语义决策，但为保持 strict-serial 与紧急停止协议，等 P1 Owner Decision Gate关闭后再由同一 fresh Fixer执行。
- 当前状态：HALT。未启动 Fixer；未修改 resolver、tests、SPEC、Story、kickoff gate 或 tutorial；未进入 CR04/CR05/CR06 或 Story 11.3。
- 用户介入点：请明确批准方案 A（推荐）或方案 B；若批准 A，还需确认允许把上述 owner artifacts 纳入 controlled correction scope。

## 2026-09-03 — Owner Decision Closed（Owner 决策已关闭）

- 用户裁决：批准方案 A，并确认 controlled correction scope。
- 稳定语义：fresh detailed prompt 对某个 artifact root 的非空逐-field输入是 `explicit-config`；未显式输入的 fields仍由 fresh defaults解析为 `fresh-default`。仅设置 `output_folder` 时，其派生出的七个逐-root路径仍为 `fresh-default`。
- Owner correction：允许同步 `SPEC 09`、Story 11.1 executable resolver contract、Story 11.2 AC及其 kickoff evidence；必须以 dated controlled correction保留原决策轨迹，不得静默改写为从未发生过冲突。
- Fixer scope：`src/config/artifact-root-resolver.ts`、`test/artifact-root-resolution.test.ts`、`test/config-initialization.test.ts`、必要的 detailed fixture，以及 `docs/tutorials/first-brownfield-project.md` Step 1/6。`src/installer/config-initialization.ts` 仅在传播或类型证据确实要求时允许修改；quick default snapshots不得为掩盖 regression而改动。
- 排除范围：不修改 brownfield Skill runtime routing、其他 generic workflow route strings、Story 11.3+ implementation、schema version、`SPEC 01/04/07` 或其他未授权 owner artifacts。
- 下一步：启动 fresh Fixer Round 2；完成后必须回到 fresh Reviewer Round 3 / Evaluator Round 3，不能直接 closeout。

## 2026-09-03 — Fixer Round 2 Result（第二轮修复结果）

- 实时判断：Owner decision与两个 Round 2 findings已按授权落地，具备进入独立复审的必要条件；green tests不替代Reviewer/Evaluator结论。
- 决策原因：contract、runtime、tests和current tutorial现在表达同一 field-level来源语义；quick/default与`output_folder`派生场景有明确 negative guards；原 kickoff决策通过 dated correction保留轨迹。
- 风险：Reviewer需检查 controlled correction是否在 `SPEC 09`、Story 11.1、Story 11.2、kickoff之间完全一致；还需确认 fresh detailed一处override不会误标其它 fields，public projections与ReadyCheck propagation不会分裂。
- 待关注问题：复核 tutorial修改是否只覆盖 Step 1/6且未暗示 brownfield runtime routing已迁移；`workflow-artifact-layout` generic routes仍属于 Story 11.4+/CR TODO候选，不得在本轮扩大。
- 用户介入点：无。若Round 3产生新的需求边界分叉，再按Evaluator结论决定是否请求用户；普通bounded finding继续strict-serial修复。

## 2026-09-03 — Reviewer Round 3 Result（第三轮复审结果）

- 实时判断：Reviewer已通过且没有新finding，但CR closeout仍不成立；必须等待fresh Evaluator独立确认reviewer结论。
- 决策原因：strict-serial completion要求最新Reviewer/Evaluator双通过；ad-hoc propagation与全量测试增强证据，但不能替代Evaluator裁决。
- 风险：Evaluator仍需检查Reviewer是否把`npm run lint`缺失、canonical D1/D2与future routing分类得当，并确认controlled correction不是用post-hoc文档掩盖runtime/public projection分裂。
- 待关注问题：已知唯一deferred项仍是`workflow-artifact-layout` generic routing，归属Story 11.4+/CR TODO候选；不能在Story 11.2 closeout前擅自修。
- 用户介入点：无。Evaluator若确认0 actionable findings，则进入CR04→CR05→CR06；否则按其分类继续循环。

## 2026-09-03 — Evaluator Round 3 Result（第三轮评估结果）

- 实时判断：最新Reviewer与Evaluator已双通过，Story 11.2 CR fix循环结束，可以进入closeout，但Story尚不能标Done。
- 决策原因：Evaluator独立复核了owner correction、runtime/tests/public projections、ReadyCheck、docs、canonical/package与scope boundary，确认0 actionable findings。
- 风险：CR04只能提取可复用规则，不能借机改实现；CR05必须对generic routing候选做现有TODO去重/归属判断；CR06必须再次核验Story completion与tracker同步。
- 待关注问题：`npm run lint`未配置不作为回归；canonical module dirty path仍需在最终Epic完成前重新执行governance/checker闭环。
- 用户介入点：无。按默认推荐决策执行CR04→CR05→CR06，任一步若发现P1/owner conflict则停止并返回相应gate。

## 2026-09-03 — CR04 Rules Extraction Result（CR04 规则提炼结果）

- 实时判断：Story 11.2 存在 3 条可复用且已解决/已确认可沉淀的规则，适合 record-only 写入规则总结；不存在需要 CR04 直接修改全局文档的项。
- 决策原因：ReadyCheck false-ready 属于 optional additive projection 与 readiness gate 的稳定实现陷阱；`resolutionMode` finding 证明 field-level 来源语义不能被 lifecycle 标签吞掉；owner decision/fixer/Round 3 复核证明 dated controlled correction 能保留历史 gate 轨迹并收口语义冲突。
- 新增规则：`CR-API-35`、`CR-API-36`、`CR-PROCESS-02`，均写入 `_bmad-output/implementation-artifacts/cr-rules/cr-rules-summary.md`。
- 跳过规则：D1 current public docs fresh defaults 已由 canonical governance D1 policy 覆盖，不重复新增 CR-DOC；brownfield tutorial Step 1/6 是单一 tutorial section 漏洞，不单独沉淀；`workflow-artifact-layout.md` generic route strings 状态未闭合，交 CR05 做 TODO 去重/登记判断。
- 治理复核：本轮重新执行 canonical governance runner 的映射/文档读取与 checker；当前 canonical 变更仍为 `assets/source/speclite/sdlc-skills/module.yaml`，impacted classes 为 `canonical-source-truth:D0` 与 `module-discovery-contract:D0`，checker `decisionRecordRequired=false`，无新增 D1/D2 decision record requirement。
- 待关注问题：CR05 应只处理 evaluator 明确保留的 `workflow-artifact-layout.md` generic route strings 候选，不把已解决的 D1 docs/tutorial findings重复登记。
- 用户介入点：无。下一步严格进入CR05；不得直接执行CR06。

## 2026-09-03 — CR05 TODO Tracker Result（CR05 TODO 追踪结果）

- Model Used：GPT-5.5 (gpt-5.5)
- 实时判断：应新增一条 P2 backlog，而不是 skip/duplicate。候选不阻塞 Story 11.2，但现有 backlog 与 Story 11.4-11.9 acceptance criteria 未充分覆盖 `workflow-artifact-layout.md:133-146`、`:189`、`:223` 的全部 generic route strings。
- 决策原因：backlog 只含 `TODO-009` 至 `TODO-011` 三条 open，主题分别为 release fixture hash、flow gate missing config resilience、sync/uninstall human output；没有 `workflow-artifact-layout.md` 或 generic workflow routing 追踪。Story 11.4-11.9 分别覆盖 Analysis、PRD/Epics/Architecture、UX、PRD validation、Implementation Readiness 与 CR routing，但对 brainstorming、project-context、brownfield planning handoff、correct-course proposal、updater-only workflow status 与 current-differences 说明没有完整 owner。
- 新增 TODO：`TODO-012: 收口 workflow-artifact-layout.md generic route strings`，来源为 11-2 CR round 3 (2026-09-03)，优先级 P2，类别 other，状态 open。
- 排除范围：未登记已关闭的 ReadyCheck、D1 docs、`resolutionMode` 或 tutorial findings；未修改源码、tests、Story、SPEC、Flow Gate、tracker、Reviewer、Evaluator、CR rules summary；未执行 CR06、commit 或 push。
- 待关注问题：CR06 只能消费 CR05 结果并做最终 closeout；不得把 `TODO-012` 当作 Story 11.2 blocker，也不得在 CR06 中修 `workflow-artifact-layout.md`。
- 用户介入点：无。下一步严格进入 CR06 Finalizer；Story 11.3 仍需等待 11.2 完成。

## 2026-09-03 — CR06 Finalizer Result（CR06 收口结果）

- Model Used：GPT-5.5 (gpt-5.5)
- 实时判断：Finalizer gate 满足 installed `bmenhance-cr-06-finalizer` 的收口条件，可以将 Story 11.2 与 sprint tracker 标记为 `done`。
- 决策原因：live 核验了 Story 11.1 predecessor status/gate、Story 11.2 kickoff/completion gate identity、Round 3 reviewer/evaluator pass identity、CR04 rules summary 与 CR05 `TODO-012` backlog entry；`TODO-012` 明确为 P2 / future-story / deferred non-blocking，不阻塞 Story 11.2。
- 状态变更：`_bmad-output/implementation-artifacts/stories/11-2-fresh-install-artifact-root-projection.md` 从 `Status: review` 更新为 `Status: done`；`_bmad-output/implementation-artifacts/sprint-status.yaml` 中 `11-2-fresh-install-artifact-root-projection` 从 `review` 更新为 `done`，`last_updated` 为 `2026-09-03 11:54:13 CST`。
- Workflow tracking：`_bmad-output/planning-artifacts/bmm-workflow-status.yaml` 不存在，按 Skill 记录 skipped，未创建臆造文件；未发现其他实际存在/适用的 workflow status tracker。
- Artifact identity caveat：当前 11.2 reviewer/evaluator/CR04/CR05 产物沿用 installed bmenhance legacy 记录格式；本 CR06 未伪造不存在的 `speclite.cr-rules-extraction.v2` 或 `speclite.cr-todo-result.v2` durable report，而是按本次指定的 installed finalizer Skill 绑定现有 Round 3 evaluator、rules summary 与 TODO backlog 证据。
- Boundary：未修改源码、tests、SPEC、canonical source、reviewer/evaluator artifact、CR rules summary、TODO backlog；未修复 `TODO-012`；未启动 Story 11.3；未 commit/push。
- 验证结果：focused status/gate reread PASS；canonical source checker warn/strict 均为 `status: ok`、`findings: []`、`decisionRecordRequired: false`；support skill density checks 无 warning；focused tests 8 files / 67 tests passed；`npm run build` PASS；full `npm test` 61 files / 481 passed / 4 todo；`npm run release:packaging-check` PASS；`git diff --check` PASS。
- 待关注问题：Story 11.3 仍需独立 kickoff/completion gates 与 CR lifecycle；`TODO-012` 后续由 Story 11.4+ / owner decision 分类处理。
