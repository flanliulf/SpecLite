# Project Context Analysis（项目上下文分析）

## Requirements Overview（需求概览）

**Functional Requirements（功能需求）：**
SpecLite 的功能需求覆盖完整的本地安装控制面、阶段化 SDLC artifact topology 与跨 IDE 方法论执行能力，而不是单点脚本能力。PRD 使用 FR1-FR78 作为 base numbering；纳入 lettered extensions 后，explicit tracked FR entries 共 106 条，主要分布在以下领域：

- Installation & Project Onboarding（安装与项目接入）：指定安装目录、选择模块和 AI IDE target，并在 fresh install 中生成 `_speclite` runtime、IDE skill mirrors，以及 `0-brainstorming-artifacts/` 至 `5-devops-artifacts/` 六个阶段 roots。
- Phase-Aligned Artifact Governance（阶段对齐的产物治理）：以 canonical runtime metadata 管理 Brainstorming、Analysis、Planning、Solutioning、Implementation、DevOps 和 Project Knowledge roots；fresh install 使用新默认值，existing install 的显式配置继续权威，缺失新增 fields 时使用 legacy fallback。
- Methodology Discovery & Execution（方法论发现与执行）：生成 IDE discovery metadata，将阶段化研发能力映射为 canonical skill id、IDE entry path 和 activation target；支持 whole/sharded PRD、Epics、Architecture 的确定性发现，以及 UX、validation、readiness、Story、CR 等产物的阶段化路由。
- Analysis And Knowledge Boundaries（分析与知识边界）：domain、market、technical research、Product Brief 和 PRFAQ 属于 Analysis producers；workflow-generated project knowledge 默认进入 `_speclite-output/project-knowledge-base/`；`docs/` 保持 Primary Public Document 定位。
- Status & Validation（状态与验证）：检查 manifest、skill/help/files index、IDE mirrors、runtime path、legacy namespace residue、菜单 target、artifact roots、whole/sharded ambiguity 和 config/artifact mismatch。
- Update & File Ownership Protection（更新与文件所有权保护）：区分 installer-owned、human-owned 和 workflow-owned 文件；普通 install、update 和 `update --repair` 不得静默迁移、移动、复制、重命名、删除或重写 workflow-owned artifacts。
- Configuration & Customization（配置与定制化）：支持项目级配置、团队/个人覆盖、skill workflow/agent customization，并统一解析包括新增 artifact roots 在内的 runtime fields。
- Distribution Sources & Channels（分发来源与渠道）：支持 bundled source、npm public/private registry、local tarball、offline bundle、Git source 和 local path。
- Installation Feedback & Readiness（安装反馈与就绪状态）：安装过程提供阶段状态、Filesystem Space Map、IDE target 摘要、实际 resolved roots、compatibility mode、ready summary 和下一步指引。
- Maintainer Workflow & Examples（维护者工作流与示例）：通过 fresh install、existing install update、config/artifact mismatch 和 skill artifact loop fixtures 验证 topology、fallback 与 non-migration。
- Post-MVP Governance & Expansion（Post-MVP 治理与扩展）：预留 explicit artifact migration、init/list/doctor/sync/uninstall、CI/企业自动化集成增强和流程覆盖报告。

架构上，这些需求要求 source discovery、module manager、installer pipeline、runtime config resolver、manifest/index generator、IDE adapter registry、validator、update protection、fixture test harness 和 phase-aligned artifact governance 协同工作。

**Non-Functional Requirements（非功能需求）：**
PRD 使用 NFR1-NFR40 作为 base numbering；纳入 lettered sub-requirements 后，explicit tracked NFR entries 共 101 条，对架构有直接约束：

- Performance（性能）：`status` 需要轻量返回，`validate` 和 `update` 需要分阶段输出并避免重复写未变化文件。
- Reliability & Determinism（可靠性与确定性）：相同 source、配置、IDE target 和 artifact topology 输入必须生成可重复结果；whole/sharded discovery、fallback 和 validate issue set 必须稳定。
- Security & Safety（安全与保护）：安装计划外不得隐式访问外部 source；human-owned custom、workflow-owned artifacts 和 public docs 不得静默覆盖或迁移；路径输出需避免泄露无关本机信息。
- Compatibility & Portability（兼容性与可移植性）：fresh install 使用新 topology；existing install 保留显式配置和既有 artifacts；缺失新增 fields 时使用 legacy fallback；所有公开路径采用 project-relative POSIX-style path，并继续覆盖 macOS 13+ 与 Windows 11。
- Integration Quality（集成质量）：IDE adapter 必须声明能力与限制；canonical skill package hash 不应因 IDE target 不同而变化；canonical Skill rename 只能通过 owning contract 的正式映射表达，不得形成第二个 active identity。
- Diagnostics & Observability（诊断与可观测性）：所有核心命令必须输出明确状态、issue id、category、severity、affected path、resolved root、actual consumed path 和 suggested next step。
- Maintainability & Extensibility（可维护性与可扩展性）：artifact roots、canonical identity、manifest projection 和 validation checks 必须由单一 owning contract 管理，consumer 不得各自定义第二套语义。
- Fixture Evidence（Fixture 证据）：fresh install、existing install update 和 config/artifact mismatch 必须共同证明新 topology、legacy compatibility 和 no-silent-migration。

这些 NFR 会强烈推动架构选择：本地文件契约优先、phase-aligned artifact routing、确定性 manifest/index、集中 resolver、数据驱动 IDE adapter、hash-backed update protection、fixture-driven validation 和兼容演进。

**Scale & Complexity（规模与复杂度）：**
SpecLite 的复杂度主要来自本地文件契约、跨 IDE 一致性、阶段化 artifact routing、living-contract 兼容演进和 workflow-owned artifact 保护，而不是高并发或大数据量。

- Primary Domain（主要领域）：AI-assisted SDLC developer tooling / local installer control plane
- Complexity Level（复杂度等级）：高
- Estimated Architectural Components（预计架构组件）：9-11 个核心组件，包括 CLI、source discovery、module manager、config resolver、customization resolver、manifest/index generator、IDE adapter registry、validator、update protection、fixture test harness、artifact governance layer；phase-aligned artifact governance 作为跨组件能力作用于 config、installer、manifest、validation、UX output 和 fixtures。

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
- TOML 继续作为 config/customization 的外部契约；installer-owned TOML 可生成，human-owned TOML 默认应只读或保守更新；新增 artifact root fields 的 canonical 语义由 `SPEC 09` 管理。
- 系统必须 local-first、offline-capable，不依赖数据库、云服务或后台守护进程。
- `_speclite` 是 metadata/control hub，不是 skill execution directory。
- `.claude/skills`、`.agents/skills` 是 MVP 硬交付 IDE execution plane；GitHub Copilot/Cursor 可通过 `.agents/skills` 兼容路径使用，专用 command pointer 或专有 adapter 属于 Post-MVP。
- `_speclite-output/` 是 phase-aligned workflow artifact repository，包含六个阶段 roots 和 `project-knowledge-base/`；`docs/` 是 Primary Public Document，不是 workflow-generated project knowledge root。
- Domain、market、technical research 是 `1-analysis-artifacts/research/` 的 producers，不是 project knowledge producers。
- Fresh install 使用新 fields、新默认 paths 和目录结构；existing install 的显式配置继续权威，缺失新增 fields 时使用确定性 legacy fallback，且 fallback 不得伪装成 migration。
- 普通 install、update 和 `update --repair` 不得迁移 workflow-owned artifacts；explicit artifact migration 属于未来独立能力。
- PRD、Epics、Architecture 的 whole/sharded subject directory 和发现优先级必须确定性稳定。
- Canonical Skill rename 必须保持唯一 active canonical identity，并由 `SPEC 04` 的正式 rename mapping 管理。
- manifest/index 是 discovery、routing、phase topology、minimum phase coverage matrix、integrity 和 validation 的统一入口，并投影 resolved artifact roots、identity mapping 和 compatibility evidence；它不能成为第二套配置真源。覆盖率百分比、趋势、团队汇总和治理 dashboard 属于 Post-MVP 流程覆盖报告。
- 安装来源必须显式记录 source/channel/version、integrity evidence 和 trust status。
- 文件路径、hash、manifest 和 validate report 必须跨平台稳定。
- 已删除或非正式分发的辅助来源不得进入 installer scope、IDE mirrors 或 manifest。

## Cross-Cutting Concerns Identified（已识别的横切关注点）

- Phase-Aligned Artifact Topology（阶段对齐的产物拓扑）：六个阶段 roots、Project Knowledge 与 Public Docs 的边界贯穿 install、config、manifest、validation、UX 和 fixtures。
- Compatible Evolution（兼容演进）：fresh defaults、existing explicit config、legacy fallback 和 no-silent-migration 必须形成一致策略。
- Artifact Lifecycle And Ownership（产物生命周期与所有权）：installer-owned、human-owned、workflow-owned 和 public-document boundaries 必须在所有写入路径保持一致。
- Producer And Consumer Routing（生产者与消费者路由）：research、PRD、UX、Architecture、Story、CR 和 readiness artifacts 必须落入 owning contract 定义的阶段 root。
- Whole/Sharded Discovery（整篇与分片发现）：active subject directory、legacy path 和 ambiguity diagnostics 必须确定性处理。
- Canonical Identity Evolution（Canonical 身份演进）：Skill rename 只能通过正式 compatibility mapping 解析，不能产生 alias-only identity。
- Config/Artifact Mismatch（配置与产物不匹配）：仅修改 config、未迁移 artifacts 时必须产生诊断，不得报告迁移成功。
- Deterministic Validation（确定性验证）：manifest/schema、IDE mirror、runtime path、menu target、legacy namespace residue、artifact path、resolved root、actual consumed path、fallback mode、ambiguity 和 file integrity 都需要稳定 issue model。
- Cross-IDE Consistency（跨 IDE 一致性）：同一 canonical skill 在不同 IDE target 中必须内容一致。MVP 平台差异限制在 adapter target directory 与 metadata 映射；command pointer artifact 保持 Post-MVP。
- Config/Customization Resolution（配置与定制化解析）：配置合并规则必须集中实现，skill 或 adapter 不应各自实现私有合并逻辑。
- Source/channel 抽象：npm、private registry、tarball、offline bundle 和 Git source 最终需要归一为 canonical source tree。
- Path Normalization（路径规范化）：macOS/Windows、LF/CRLF、权限、大小写敏感和 shell invocation 差异需要基础设施级处理。
- Artifact Governance（产物治理）：workflow 产物必须可追踪、可再输入，但不得被 installer/update 覆盖或静默迁移。
- Diagnostics（诊断）：所有失败都需要可操作报告，而不是只给出错误文本。
- Fixture 驱动验收：fresh install、existing install update、config/artifact mismatch、custom source、IDE drift 和 skill artifact loop 需要成为验收资产。
