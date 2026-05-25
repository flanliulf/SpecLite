# Epic List（Epic 列表）

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

团队后续可以在不破坏 MVP 契约的前提下扩展 init/list/doctor/sync/uninstall、CI/企业自动化集成和规范落地覆盖报告。

**实施范围：** 仅作为 Post-MVP backlog。Epic 7 不进入 MVP implementation readiness gate，也不阻塞 MVP sprint planning；只有当团队单独启动 Phase 2/Post-MVP planning 时，才把本 Epic 纳入 implementation readiness 检查。

**MVP guard：** FR72-FR78 不进入 MVP sprint backlog、MVP release gate 或 MVP fixture release gate。MVP 只需保证这些未来能力可以复用现有 `CommandResult`、manifest/index、fixture 和 owning SPEC 边界。

**覆盖 FR：** FR72, FR73, FR74, FR75, FR76, FR77, FR78
