# Project Context Analysis（项目上下文分析）

## Requirements Overview（需求概览）

**Functional Requirements（功能需求）：**
SpecLite 的功能需求覆盖一个完整的本地安装控制面，而不是单点脚本能力。PRD 使用 FR1-FR78 作为 base numbering；纳入 lettered extensions 后，explicit tracked FR entries 共 94 条，主要分布在以下领域：

- Installation & Project Onboarding（安装与项目接入）：指定安装目录、选择模块、选择 AI IDE target、生成 `_speclite` runtime、`_speclite-output` artifact repository 和 IDE skill mirrors。
- Methodology Discovery & Execution（方法论发现与执行）：生成 IDE discovery metadata，将阶段化研发能力映射为 canonical skill id、IDE entry path 和 activation target，并支持 SPEC、方案评审、故事规划、实现、测试和审查等能力调用。
- Status & Validation（状态与验证）：检查 manifest、skill/help/files index、IDE mirrors、runtime path、legacy namespace residue、菜单 target 和产物路径。
- Update & File Ownership Protection（更新与文件所有权保护）：区分 installer-owned、human-owned 和 workflow-owned 文件，更新前检测本地修改，避免覆盖用户定制和过程产物。
- Configuration & Customization（配置与定制化）：支持项目级配置、团队/个人覆盖、skill workflow/agent customization，并统一解析输出。
- Distribution Sources & Channels（分发来源与渠道）：支持 npm public/private registry、local tarball、offline bundle 和 Git source。
- Installation Feedback & Readiness（安装反馈与就绪状态）：安装过程需要清晰阶段状态、IDE target 摘要、ready summary 和下一步指引。
- Maintainer Workflow & Examples（维护者工作流与示例）：通过 fixture project 验证 fresh install、status、validate、update 和 skill artifact loop。
- Post-MVP Governance & Expansion（Post-MVP 治理与扩展）：预留 init/list/doctor/sync/uninstall、CI/企业自动化集成增强和流程覆盖报告。

架构上，这些需求意味着系统至少需要 source discovery、module manager、installer pipeline、IDE adapter registry、manifest/index generator、config/customization resolver、validator、update protection 和 fixture test harness 等组件。

**Non-Functional Requirements（非功能需求）：**
PRD 使用 NFR1-NFR40 作为 base numbering；纳入 lettered sub-requirements 后，explicit tracked NFR entries 共 95 条，对架构有直接约束：

- Performance（性能）：`status` 需要轻量返回，`validate` 和 `update` 需要分阶段输出并避免重复写未变化文件。
- Reliability & Determinism（可靠性与确定性）：相同 source、配置和 IDE target 应生成可重复结果；validate issue set 必须稳定。
- Security & Safety（安全与保护）：安装计划外不得隐式访问外部 source；human-owned custom 和 workflow-owned artifacts 不得静默覆盖；路径输出需避免泄露无关本机信息。
- Compatibility & Portability（兼容性与可移植性）：MVP 至少覆盖 macOS 13+ 和 Windows 11；所有 manifest/index/hash/report 使用 project-relative POSIX-style path。
- Integration Quality（集成质量）：IDE adapter 必须声明能力与限制；canonical skill package hash 不应因 IDE target 不同而变化。
- Diagnostics & Observability（诊断与可观测性）：所有核心命令必须输出明确状态、issue id、category、severity、affected path 和 suggested next step。
- Maintainability & Extensibility（可维护性与可扩展性）：source discovery、module selection、IDE adapter、manifest/index generation 和 validation checks 必须模块化，新增 adapter 不应修改 canonical skill 内容。

这些 NFR 会强烈推动架构选择：本地文件契约优先、确定性 manifest/index、集中 resolver、数据驱动 IDE adapter、hash-backed update protection、fixture-driven validation。

**Scale & Complexity（规模与复杂度）：**
SpecLite 的复杂度主要来自本地工具链治理和跨 IDE 一致性，而不是高并发或大数据量。

- Primary Domain（主要领域）：AI-assisted SDLC developer tooling / local installer control plane
- Complexity Level（复杂度等级）：高
- Estimated Architectural Components（预计架构组件）：9-11 个核心组件，包括 CLI、source discovery、module manager、config resolver、customization resolver、manifest/index generator、IDE adapter registry、validator、update protection、fixture test harness、artifact governance layer。

复杂度指标：

- Real-Time Features（实时特性）：不需要实时协作或后台服务。
- Multi-Tenancy（多租户）：不需要 SaaS 多租户，但需要 team/user 配置分层。
- Regulatory Compliance（合规要求）：无强监管行业要求，但有企业研发规范落地和 Git 可审查性要求。
- Integration Complexity（集成复杂度）：高，需适配多个 AI IDE、共享 target directory 和未来平台差异；command pointer artifact 保持 Post-MVP。
- Data Complexity（数据复杂度）：中等，主要是 TOML/YAML/CSV/Markdown/JSON 文件契约、manifest/hash 和 artifact metadata。
- User Interaction Complexity（用户交互复杂度）：中高，CLI 需要同时支持交互式和脚本化使用，并提供清晰诊断。

## Technical Constraints & Dependencies（技术约束与依赖）

SpecLite 的关键技术约束包括：

- MVP 必须以 Node.js 为 installer/control plane 主轴；现有 Python resolver 可作为参考或兼容背景，但不应成为主控制面依赖。
- TOML 继续作为 config/customization 的外部契约；installer-owned TOML 可生成，human-owned TOML 默认应只读或保守更新。
- 系统必须 local-first、offline-capable，不依赖数据库、云服务或后台守护进程。
- `_speclite` 是 metadata/control hub，不是 skill execution directory。
- `.claude/skills`、`.agents/skills` 是 MVP 硬交付 IDE execution plane；GitHub Copilot/Cursor 可通过 `.agents/skills` 兼容路径使用，专用 command pointer 或专有 adapter 属于 Post-MVP。
- `_speclite-output` 和配置指定的 `docs` 是 workflow artifact / project knowledge plane。
- manifest/index 是 discovery、routing、phase topology、minimum phase coverage matrix、integrity 和 validation 的统一入口；覆盖率百分比、趋势、团队汇总和治理 dashboard 属于 Post-MVP 流程覆盖报告。
- 安装来源必须显式记录 source/channel/version、integrity evidence 和 trust status。
- 文件路径、hash、manifest 和 validate report 必须跨平台稳定。
- 已删除或非正式分发的辅助来源不得进入 installer scope、IDE mirrors 或 manifest。

## Cross-Cutting Concerns Identified（已识别的横切关注点）

- File Ownership Model（文件所有权模型）：installer-owned、human-owned、workflow-owned 文件边界贯穿 install、update、validate 和 docs。
- Deterministic Validation（确定性验证）：manifest/schema、IDE mirror、runtime path、menu target、legacy namespace residue、artifact path 和 file integrity 都需要稳定 issue model。
- Cross-IDE Consistency（跨 IDE 一致性）：同一 canonical skill 在不同 IDE target 中必须内容一致。MVP 平台差异限制在 adapter target directory 与 metadata 映射；command pointer artifact 保持 Post-MVP。
- Config/Customization Resolution（配置与定制化解析）：配置合并规则必须集中实现，skill 或 adapter 不应各自实现私有合并逻辑。
- Source/channel 抽象：npm、private registry、tarball、offline bundle 和 Git source 最终需要归一为 canonical source tree。
- Path Normalization（路径规范化）：macOS/Windows、LF/CRLF、权限、大小写敏感和 shell invocation 差异需要基础设施级处理。
- Artifact Governance（产物治理）：workflow 产物必须可追踪、可再输入，但不得被 installer/update 覆盖。
- Diagnostics（诊断）：所有失败都需要可操作报告，而不是只给出错误文本。
- Fixture 驱动验收：fresh install、existing update、custom source、IDE drift 和 skill artifact loop 需要成为验收资产。
