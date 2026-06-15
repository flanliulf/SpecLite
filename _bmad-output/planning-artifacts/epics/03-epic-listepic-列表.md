# Epic List（Epic 列表）

## Cross-Epic SDLC Workflow Contract（跨 Epic SDLC Workflow 契约）

所有 MVP Epic 和 Story 的开发流转必须引用 `_bmad-output/planning-artifacts/specs/09-sdlc-workflow-lifecycle-contract.md`，不得在单个 Story、review 记录或 finalizer 中重新定义第二套流程契约。

Runtime artifact roots 使用 `modules.sdlc.planning_artifacts`、`modules.sdlc.implementation_artifacts`、`modules.sdlc.project_knowledge` 以及对应 `{planning_artifacts}`、`{implementation_artifacts}`、`{project_knowledge}` placeholders。Story lifecycle 使用 `sprint_status_file`、`{sprint_status_file}`、`sprint_status`、`{sprint_status}`、`story_location`、`story_location_absolute`、`story_root`、`{story_root}`、`flow_gate_root`、`{flow_gate_root}`、`default_output_file` 和 `{default_output_file}`。

Sprint 状态和 Story lifecycle 字段使用 `development_status`、`development_status{story_key}`、`{current_sprint_status}`、`epic_status`、`story_completion_status`、`dependency_gate`、`anchor_contract_map` 和 `evidence_plan`。Flow Gate mode 固定为 `story-kickoff`、`story-completion`、`epic-completion`、`epic-kickoff`；Flow Gate result 固定为 `PASS`、`PASS_EQUIVALENT`、`FAIL_CONTRACT`、`FAIL_FUNCTION`、`FAIL_EVIDENCE`、`DECISION_NEEDED`。

Story dependency 必须按 `Contract Anchor`、`Functional Anchor`、`Evidence Anchor`、`Guidance Anchor` 分类。固定文件名只有在 owning SPEC 明确要求时才是 hard gate；否则必须先检查 equivalent functional implementation 和 evidence anchors。历史 Story 不批量回填新版 `Dependency Gate`、`Anchor Contract Map`、`Equivalent Implementation Policy`、`Evidence Plan`、`Anchor Evidence Summary`，但新建或后续修改的 Story 必须体现这些章节或记录等价映射。

## Epic 1: Project Installation Onboarding（项目安装引导）

项目维护者可以使用默认官方内置来源，从选择目录、官方模块和 AI IDE targets 到生成 `_speclite` runtime、IDE skill mirrors、`_speclite-output` 和 ready summary，完成一次可信 fresh install。npm/private registry、local tarball、offline bundle、Git source 和 local path 等替代来源路径由 Epic 5 扩展，不属于 Epic 1 的最小垂直切片。

**覆盖 FR：** FR1, FR2, FR3, FR4, FR5, FR6, FR7, FR10, FR11, FR12, FR13, FR14, FR15, FR16, FR17, FR42, FR43, FR44, FR45, FR46, FR47, FR48, FR60, FR61, FR62, FR63, FR63a, FR64, FR65

## Epic 2: Methodology Discovery And Skill Execution（方法论发现与 Skill 执行）

AI IDE 使用者可以在 `.claude/skills` 与 `.agents/skills` 中发现、选择并激活 SpecLite 方法论能力，并让 workflow 读取统一配置、应用 customization、输出带 metadata 的过程产物。

**覆盖 FR：** FR18, FR19, FR20, FR21, FR22, FR23, FR23a, FR24, FR49, FR52, FR52a, FR52b, FR52c

## Epic 3: Installed State And Deterministic Validation（已安装状态与确定性验证）

工具链维护者可以查看安装状态，并用本地 deterministic validation 诊断 manifest、IDE mirror、runtime path、menu target、legacy residue、artifact path、file integrity 和 JSON issue contract 问题。

**覆盖 FR：** FR25, FR26, FR27, FR28, FR28a, FR29, FR30, FR31, FR32, FR33, FR34, FR35, FR35a, FR35b, FR35c

## Epic 4: Safe Update And Repair（安全更新与修复）

项目维护者可以安全更新 installer-owned 文件，在写入前获得 plan、ownership/hash 判断、operation lock 和 conflict 可见性，同时保护 human-owned custom 与 workflow-owned artifacts，并通过 `update --repair` 显式修复可恢复 drift。

**覆盖 FR：** FR36, FR37, FR38, FR39, FR40, FR41, FR41a, FR41b, FR41c, FR50, FR51, FR51a, FR51b

## Epic 5: Source Integrity And Distribution Channels（来源完整性与分发渠道）

项目维护者可以从 npm public/private registry、local tarball、offline bundle、Git source 或 local path 安装 SpecLite，并获得可诊断的 source descriptor、integrity evidence、trust status、channel/version 和失败原因。

**覆盖 FR：** FR8, FR9, FR53, FR54, FR55, FR56, FR57, FR58, FR59

## Epic 6: Maintainer Fixture And Release Confidence（维护者 Fixture 与发布信心）

SpecLite 维护者可以用 fixture projects 和 expected outputs 验证 fresh install、existing update、IDE drift、source integrity、resolve parity、path portability 和 skill artifact loop，形成发布前可信证据。

**覆盖 FR：** FR66, FR67, FR68, FR69, FR70, FR71, FR71a, FR71b

## Epic 7: Post-MVP Governance Expansion（Post-MVP 治理扩展）

团队后续可以在不破坏 MVP 契约的前提下扩展 Flow Gate hook enforcement、init/list/doctor/sync/uninstall、CI/企业自动化集成和规范落地覆盖报告。

**实施范围：** 仅作为 Post-MVP backlog。Epic 7 不进入 MVP implementation readiness gate，也不阻塞 MVP sprint planning；只有当团队单独启动 Phase 2/Post-MVP planning 时，才把本 Epic 纳入 implementation readiness 检查。

**MVP guard：** FR72-FR78 不进入 MVP sprint backlog、MVP release gate 或 MVP fixture release gate。MVP 只需保证 Flow Gate hook enforcement、Post-MVP command、CI/企业自动化和治理报告等未来能力可以复用现有 `CommandResult`、manifest/index、fixture 和 owning SPEC 边界。

**覆盖 FR：** FR72, FR73, FR74, FR75, FR76, FR77, FR78

## Epic 8: CLI Outcome-Oriented Human Output System（CLI Outcome 导向人类输出体系）

项目维护者、工具链维护者和 AI IDE 使用者可以在所有当前 CLI 命令中看到 outcome-oriented、中文默认、结构稳定、下一步明确的 human-readable output，清楚区分只读检查、写入前暂停、计划待授权、conflict、失败、已执行和就绪状态。

**实施范围：** Corrective planning Epic。覆盖 `install`、`update`、`update --repair`、`status`、`validate`、`resolve config` 和 `resolve customization` 的 human-readable 输出体系，不新增 GUI/TUI，不改变 command core behavior，不破坏 `CommandResult` JSON contract。

**MVP guard：** 本 Epic 只重构 presentation semantics、message catalog、Next Actions 和测试/文档示例。任何新增 public JSON 字段必须先更新 owning SPEC、schema/parser 和 fixture expected outputs；否则不得进入实现。

**覆盖 FR / NFR / UX：** FR35a, FR35b, FR41, FR41c, FR52a, FR52b, FR63a, FR71, NFR35b-12, UX CLI human-readable output, UX Next Actions, UX JSON parity
