---
workflowType: 'prd'
workflow: 'edit'
releaseMode: 'phased'
stepsCompleted:
  - 'step-e-01-discovery'
  - 'step-e-02-review'
  - 'step-e-03-edit'
inputDocuments:
  - path: '_bmad-output/planning-artifacts/research/technical-speclite-bmad-tooling-system-design-research-2026-05-11.md'
    type: 'research'
    title: 'SpecLite 工具化系统设计研究'
  - path: '_bmad-output/planning-artifacts/sprint-change-proposal-2026-07-22.md'
    type: 'change-proposal'
    title: 'Sprint Change Proposal（Sprint 变更提案）'
  - path: '_bmad-output/planning-artifacts/sprint-change-proposal-2026-08-17.md'
    type: 'change-proposal'
    title: 'Sprint Change Proposal（Architecture Root 变更提案）'
classification:
  projectType: 'developer_tool'
  subtype: 'cli_tool + IDE integration tooling + local installer/control plane'
  domain: 'AI-assisted SDLC / developer tooling'
  complexity: 'high technical/system complexity; general/low regulatory complexity'
  projectContext: 'brownfield'
user_name: 'Fancyliu'
project_name: 'SpecLite'
date: '2026-05-11'
lastEdited: '2026-08-18'
editHistory:
  - date: '2026-08-18'
    workflow: 'bmad-edit-prd'
    changes: '依据 CC-2026-08-17-architecture-root，将 FR23c 中 Architecture whole/sharded fresh canonical subject directory 从 planning root 修正为 {solutioning_artifacts}/architecture/，并保留 SPEC 09 的 existing-install explicit config、legacy-compatible fallback 与 no-migration contract；未新增或删除 FR/NFR，未改变 requirement ID、数量或产品范围。'
  - date: '2026-08-17'
    workflow: 'bmad-edit-prd'
    changes: '依据 2026-08-17 PRD validation，增加 Role Decision Briefs 与 Decision Narrative Map 两个既有内容聚合导航层，并精炼 FR23f、FR28、FR35c、FR71a 与 NFR40d 的责任主体、可枚举验证集合和实现中立措辞；未修改 requirement ID、数量、意图、schema 或产品范围。'
  - date: '2026-08-06'
    workflow: 'bmad-edit-prd'
    changes: '依据 Run 3 validation 的三项非阻断性建议，新增角色化 Reading Guide、Outcome-to-Evidence Overview 与 CLI User States & Recovery Paths；仅聚合既有章节、106 FR / 100 NFR、fixture/release evidence 和 owning SPEC anchors，未修改 requirement content、count、schema 或产品范围。'
  - date: '2026-07-24'
    workflow: 'bmad-edit-prd'
    changes: '经 active PRD label inventory、Git HEAD 与当前 diff 三方审计，将 requirements baseline 的 off-by-one 计数从 106 FR / 101 NFR 修正为 106 FR / 100 NFR；未新增、删除或改写任何 FR/NFR 内容，后续 validation 以 206 个 unique requirements 为准。'
  - date: '2026-07-22'
    workflow: 'bmad-edit-prd'
    changes: '按已批准的 Sprint Change Proposal 完成阶段化 artifact topology 兼容演进，补齐 PRD 权威需求至 106 FR / 100 NFR，并依据同日 validation 精炼 metadata、Success Criteria 和需求可测试性；validation report 位于 _bmad-output/planning-artifacts/prd/prd-validate-report-2026-07-22.md。'
---

# Product Requirements Document - SpecLite（SpecLite 产品需求文档）

## Reading Guide（阅读指南）

- **Executive / Stakeholder：** [Executive Summary（执行摘要）](./01-executive-summary执行摘要.md) → [Success Criteria（成功标准）](./03-success-criteria成功标准.md) → [Product Scope（产品范围）](./04-product-scope产品范围.md) → [MVP Strategy & Philosophy（MVP 策略与理念）](./09-project-scoping-phased-development项目范围界定与阶段化开发.md#mvp-strategy-philosophymvp-策略与理念)。
- **PM：** [Outcome-to-Evidence Overview（成果到证据概览）](./03-success-criteria成功标准.md#outcome-to-evidence-overview成果到证据概览) → [User Journeys（用户旅程）](./05-user-journeys用户旅程.md) → [MVP Feature Set (Phase 1)（MVP 功能集（Phase 1））](./09-project-scoping-phased-development项目范围界定与阶段化开发.md#mvp-feature-set-phase-1mvp-功能集phase-1) → [Decision Narrative Map（决策叙事图）](#decision-narrative-map决策叙事图)。
- **Designer：** [User Journeys（用户旅程）](./05-user-journeys用户旅程.md) → [CLI User States & Recovery Paths（CLI 用户状态与恢复路径）](./08-developer-tool-specific-requirements开发者工具特定需求.md#cli-user-states-recovery-pathscli-用户状态与恢复路径) → [Installation Methods（安装方式）](./08-developer-tool-specific-requirements开发者工具特定需求.md#installation-methods安装方式) → [Product Scope（产品范围）](./04-product-scope产品范围.md)。
- **Developer / Architect / QA：** [Developer Tool Specific Requirements（开发者工具特定需求）](./08-developer-tool-specific-requirements开发者工具特定需求.md) → [Functional Requirements（功能需求）](./10-functional-requirements功能需求.md) → [Non-Functional Requirements（非功能需求）](./11-non-functional-requirements非功能需求.md) → [SPEC Contracts Index（SPEC 契约索引）](../specs/README.md)。
- **LLM / Downstream Workflow：** [Project Classification（项目分类）](./02-project-classification项目分类.md) → [Success Criteria（成功标准）](./03-success-criteria成功标准.md) → [User Journeys（用户旅程）](./05-user-journeys用户旅程.md) → [Functional Requirements（功能需求）](./10-functional-requirements功能需求.md) / [Non-Functional Requirements（非功能需求）](./11-non-functional-requirements非功能需求.md) → [SPEC Contracts Index（SPEC 契约索引）](../specs/README.md)。

## Role Decision Briefs（角色决策摘要）

本节为不同决策角色提供渐进披露入口，仅压缩既有 PRD 与 SPEC 导航，不替代对应章节的产品语义或契约定义。

| Role | Decision Focus | Short Read | Continue When Needed |
| --- | --- | --- | --- |
| Executive / Stakeholder | MVP 是否已把静态方法论转化为可安装、可验证、可更新、可跨 IDE 分发的本地研发过程系统；价值、成功证据与阶段边界是否足以支持投入决策 | [Executive Summary（执行摘要）](./01-executive-summary执行摘要.md) → [Success Criteria（成功标准）](./03-success-criteria成功标准.md) → [MVP Strategy & Philosophy（MVP 策略与理念）](./09-project-scoping-phased-development项目范围界定与阶段化开发.md#mvp-strategy-philosophymvp-策略与理念) → [Decision Narrative Map（决策叙事图）](#decision-narrative-map决策叙事图) | 核对交付边界时阅读 [MVP Feature Set (Phase 1)（MVP 功能集（Phase 1））](./09-project-scoping-phased-development项目范围界定与阶段化开发.md#mvp-feature-set-phase-1mvp-功能集phase-1) 与 [Post-MVP Features（Post-MVP 功能）](./09-project-scoping-phased-development项目范围界定与阶段化开发.md#post-mvp-featurespost-mvp-功能) |
| PM | Product outcome、用户旅程、MVP capability cluster 与可复查证据是否闭环；优先级是否仍处于既有 MVP 范围 | [Outcome-to-Evidence Overview（成果到证据概览）](./03-success-criteria成功标准.md#outcome-to-evidence-overview成果到证据概览) → [User Journeys（用户旅程）](./05-user-journeys用户旅程.md) → [MVP Feature Set (Phase 1)（MVP 功能集（Phase 1））](./09-project-scoping-phased-development项目范围界定与阶段化开发.md#mvp-feature-set-phase-1mvp-功能集phase-1) → [Decision Narrative Map（决策叙事图）](#decision-narrative-map决策叙事图) | 核对需求归属时进入 [Functional Requirements（功能需求）](./10-functional-requirements功能需求.md)、[Non-Functional Requirements（非功能需求）](./11-non-functional-requirements非功能需求.md) 与 [SPEC Contracts Index（SPEC 契约索引）](../specs/README.md) |
| Designer | 关键角色能否从安装、阶段化 skill 使用、诊断恢复到规范落地形成连续体验；用户可观察状态、恢复入口与写入边界是否清晰 | [User Journeys（用户旅程）](./05-user-journeys用户旅程.md) → [CLI User States & Recovery Paths（CLI 用户状态与恢复路径）](./08-developer-tool-specific-requirements开发者工具特定需求.md#cli-user-states-recovery-pathscli-用户状态与恢复路径) → [Installation Methods（安装方式）](./08-developer-tool-specific-requirements开发者工具特定需求.md#installation-methods安装方式) → [Product Scope（产品范围）](./04-product-scope产品范围.md) | 核对行为契约时进入 [SPEC Contracts Index（SPEC 契约索引）](../specs/README.md)，不从界面文案反推字段、状态或 lifecycle |

## Decision Narrative Map（决策叙事图）

本图仅聚合既有 product value → outcome → journey → capability cluster → owning SPEC → evidence 链路，供决策与追踪使用；不定义新的 requirement、command、fixture、schema、issue、field、enum 或 lifecycle。产品范围与可测试语义仍由 FR/NFR 管理，field-level contract、排序、comparison 与 lifecycle 细节仍以对应 owning SPEC 为准。

| Product Value | Product Outcome | Primary Journey | Existing Capability Cluster | Owning SPEC | Existing Evidence |
| --- | --- | --- | --- | --- | --- |
| 将静态 skill 源定义转化为可重复安装、跨 IDE 一致的 execution plane | 多 IDE fresh install 可重复且 installed projection 一致 | [Journey 1](./05-user-journeys用户旅程.md#journey-1-multi-ide-installation-by-tech-lead技术负责人完成多-ide-安装)、[Journey 4](./05-user-journeys用户旅程.md#journey-4-installable-skill-release-by-speclite-maintainerspeclite-维护者发布新的可安装-skill) | 安装与项目引导、分发来源、IDE projection、installed metadata 与 readiness（FR1–FR19、FR60–FR69；NFR1–NFR11a、NFR23–NFR29） | [SPEC 01](../specs/01-command-result-json-contract.md)、[SPEC 04](../specs/04-manifest-index-contract.md)、[SPEC 05](../specs/05-ide-adapter-registry-contract.md)、[SPEC 08](../specs/08-fixture-contract.md) | `fresh-install-empty-project`、`ide-drift`、expected tree、manifest/index snapshot、Ready Summary gate |
| 把研发方法论变成可发现、可激活、可沉淀产物的阶段化执行体系 | Skill 可被发现、激活并按阶段化 artifact topology 写入配置路径 | [Journey 2](./05-user-journeys用户旅程.md#journey-2-phase-based-skill-use-by-ai-ide-userai-ide-使用者按阶段调用研发-skills)、[Journey 5](./05-user-journeys用户旅程.md#journey-5-engineering-standard-adoption-verification-by-enterprise-governance-owner企业规范负责人验证研发规范落地) | 方法论发现与执行、阶段覆盖、maintainer workflow 与 artifact lifecycle（FR13a、FR20–FR24、FR66–FR71b；NFR14a、NFR17a、NFR28b、NFR40b、NFR40f） | [SPEC 04](../specs/04-manifest-index-contract.md)、[SPEC 08](../specs/08-fixture-contract.md)、[SPEC 09](../specs/09-sdlc-workflow-lifecycle-contract.md) | `skill-artifact-loop`、`fresh-install-empty-project` / `existing-install-update` topology evidence、artifact metadata assertions、docs link/reference check |
| 将安装漂移从人工猜测转化为可诊断、可恢复且保护所有权的本地治理问题 | 安装状态可诊断，update/repair 保持 ownership protection 与显式恢复边界 | [Journey 3](./05-user-journeys用户旅程.md#journey-3-installation-drift-troubleshooting-by-toolchain-maintainer工具链维护者排查安装漂移) | 状态与验证、update protection、install planning、diagnostics 与 recovery（FR25–FR41c；NFR7–NFR10、NFR25a–NFR25c、NFR30–NFR35j） | [SPEC 01](../specs/01-command-result-json-contract.md)、[SPEC 03](../specs/03-install-plan-contract.md)、[SPEC 07](../specs/07-validation-issue-taxonomy.md)、[SPEC 08](../specs/08-fixture-contract.md) | `existing-install-update`、`ide-drift`、status/validate/update/repair command snapshots |
| 让不同分发来源归一进入同一可审查安装控制面 | 多来源安装具有可审查的 trust 与 integrity evidence | [Journey 1](./05-user-journeys用户旅程.md#journey-1-multi-ide-installation-by-tech-lead技术负责人完成多-ide-安装)、[Journey 4](./05-user-journeys用户旅程.md#journey-4-installable-skill-release-by-speclite-maintainerspeclite-维护者发布新的可安装-skill) | Source discovery、distribution channels、trust、integrity 与 packaging（FR8–FR9、FR53–FR59；NFR12–NFR13e、NFR22、NFR32e、NFR40c–NFR40d） | [SPEC 02](../specs/02-source-descriptor-contract.md)、[SPEC 07](../specs/07-validation-issue-taxonomy.md)、[SPEC 08](../specs/08-fixture-contract.md) | `source-integrity` sub-cases、packaging manifest、npm/tarball/offline bundle release assertions |
| 让控制面演进具备跨平台稳定性与 release 可复查性 | 核心路径具备跨平台、性能与 release 可复查性 | [Journey 1](./05-user-journeys用户旅程.md#journey-1-multi-ide-installation-by-tech-lead技术负责人完成多-ide-安装)、[Journey 3](./05-user-journeys用户旅程.md#journey-3-installation-drift-troubleshooting-by-toolchain-maintainer工具链维护者排查安装漂移)、[Journey 4](./05-user-journeys用户旅程.md#journey-4-installable-skill-release-by-speclite-maintainerspeclite-维护者发布新的可安装-skill) | 跨平台路径、性能、maintainer verification 与 release evidence（FR66–FR71b；NFR2–NFR5a、NFR18–NFR21、NFR40–NFR40f） | [SPEC 01](../specs/01-command-result-json-contract.md)、[SPEC 08](../specs/08-fixture-contract.md) | Node 22/24、macOS/Windows `path-portability`、performance baseline 与 release evidence |

## Table of Contents（目录）

- [Product Requirements Document - SpecLite（SpecLite 产品需求文档）](#table-of-contents目录)
  - [Reading Guide（阅读指南）](#reading-guide阅读指南)
  - [Role Decision Briefs（角色决策摘要）](#role-decision-briefs角色决策摘要)
  - [Decision Narrative Map（决策叙事图）](#decision-narrative-map决策叙事图)
  - [Executive Summary（执行摘要）](./01-executive-summary执行摘要.md)
    - [What Makes This Special（差异化亮点）](./01-executive-summary执行摘要.md#what-makes-this-special差异化亮点)
  - [Project Classification（项目分类）](./02-project-classification项目分类.md)
  - [Success Criteria（成功标准）](./03-success-criteria成功标准.md)
    - [User Success（用户成功）](./03-success-criteria成功标准.md#user-success用户成功)
    - [Business Success（业务成功）](./03-success-criteria成功标准.md#business-success业务成功)
    - [Technical Success（技术成功）](./03-success-criteria成功标准.md#technical-success技术成功)
    - [Outcome-to-Evidence Overview（成果到证据概览）](./03-success-criteria成功标准.md#outcome-to-evidence-overview成果到证据概览)
    - [Measurable Outcomes（可衡量成果）](./03-success-criteria成功标准.md#measurable-outcomes可衡量成果)
  - [Product Scope（产品范围）](./04-product-scope产品范围.md)
    - [MVP - Minimum Viable Product（MVP - 最小可行产品）](./04-product-scope产品范围.md#mvp---minimum-viable-productmvp---最小可行产品)
    - [Growth Features (Post-MVP)（增长功能（Post-MVP））](./04-product-scope产品范围.md#growth-features-post-mvp增长功能post-mvp)
    - [Vision (Future)（未来愿景）](./04-product-scope产品范围.md#vision-future未来愿景)
  - [User Journeys（用户旅程）](./05-user-journeys用户旅程.md)
    - [Journey 1: Multi-IDE Installation by Tech Lead（技术负责人完成多 IDE 安装）](./05-user-journeys用户旅程.md#journey-1-multi-ide-installation-by-tech-lead技术负责人完成多-ide-安装)
    - [Journey 2: Phase-Based Skill Use by AI IDE User（AI IDE 使用者按阶段调用研发 skills）](./05-user-journeys用户旅程.md#journey-2-phase-based-skill-use-by-ai-ide-userai-ide-使用者按阶段调用研发-skills)
    - [Journey 3: Installation Drift Troubleshooting by Toolchain Maintainer（工具链维护者排查安装漂移）](./05-user-journeys用户旅程.md#journey-3-installation-drift-troubleshooting-by-toolchain-maintainer工具链维护者排查安装漂移)
    - [Journey 4: Installable Skill Release by SpecLite Maintainer（SpecLite 维护者发布新的可安装 skill）](./05-user-journeys用户旅程.md#journey-4-installable-skill-release-by-speclite-maintainerspeclite-维护者发布新的可安装-skill)
    - [Journey 5: Engineering Standard Adoption Verification by Enterprise Governance Owner（企业规范负责人验证研发规范落地）](./05-user-journeys用户旅程.md#journey-5-engineering-standard-adoption-verification-by-enterprise-governance-owner企业规范负责人验证研发规范落地)
    - [Journey Requirements Summary（旅程需求总结）](./05-user-journeys用户旅程.md#journey-requirements-summary旅程需求总结)
  - [Domain-Specific Requirements（领域特定需求）](./06-domain-specific-requirements领域特定需求.md)
    - [Compliance & Regulatory（合规与监管）](./06-domain-specific-requirements领域特定需求.md#compliance-regulatory合规与监管)
    - [Technical Constraints（技术约束）](./06-domain-specific-requirements领域特定需求.md#technical-constraints技术约束)
    - [Integration Requirements（集成需求）](./06-domain-specific-requirements领域特定需求.md#integration-requirements集成需求)
    - [Risk Mitigations（风险缓解）](./06-domain-specific-requirements领域特定需求.md#risk-mitigations风险缓解)
  - [Innovation & Novel Patterns（创新与新模式）](./07-innovation-novel-patterns创新与新模式.md)
    - [Detected Innovation Areas（已识别创新领域）](./07-innovation-novel-patterns创新与新模式.md#detected-innovation-areas已识别创新领域)
    - [Market Context & Competitive Landscape（市场背景与竞争格局）](./07-innovation-novel-patterns创新与新模式.md#market-context-competitive-landscape市场背景与竞争格局)
    - [Validation Approach（验证方法）](./07-innovation-novel-patterns创新与新模式.md#validation-approach验证方法)
    - [Risk Mitigation（风险缓解）](./07-innovation-novel-patterns创新与新模式.md#risk-mitigation风险缓解)
  - [Developer Tool Specific Requirements（开发者工具特定需求）](./08-developer-tool-specific-requirements开发者工具特定需求.md)
    - [Project-Type Overview（项目类型概览）](./08-developer-tool-specific-requirements开发者工具特定需求.md#project-type-overview项目类型概览)
    - [Technical Architecture Considerations（技术架构考量）](./08-developer-tool-specific-requirements开发者工具特定需求.md#technical-architecture-considerations技术架构考量)
    - [Language Matrix（语言矩阵）](./08-developer-tool-specific-requirements开发者工具特定需求.md#language-matrix语言矩阵)
    - [Installation Methods（安装方式）](./08-developer-tool-specific-requirements开发者工具特定需求.md#installation-methods安装方式)
    - [API Surface（API 接口面）](./08-developer-tool-specific-requirements开发者工具特定需求.md#api-surfaceapi-接口面)
    - [CLI User States & Recovery Paths（CLI 用户状态与恢复路径）](./08-developer-tool-specific-requirements开发者工具特定需求.md#cli-user-states-recovery-pathscli-用户状态与恢复路径)
    - [Code Examples（代码示例）](./08-developer-tool-specific-requirements开发者工具特定需求.md#code-examples代码示例)
    - [Migration Guide（迁移指南）](./08-developer-tool-specific-requirements开发者工具特定需求.md#migration-guide迁移指南)
    - [Implementation Considerations（实现考量）](./08-developer-tool-specific-requirements开发者工具特定需求.md#implementation-considerations实现考量)
  - [Project Scoping & Phased Development（项目范围界定与阶段化开发）](./09-project-scoping-phased-development项目范围界定与阶段化开发.md)
    - [MVP Strategy & Philosophy（MVP 策略与理念）](./09-project-scoping-phased-development项目范围界定与阶段化开发.md#mvp-strategy-philosophymvp-策略与理念)
    - [MVP Feature Set (Phase 1)（MVP 功能集（Phase 1））](./09-project-scoping-phased-development项目范围界定与阶段化开发.md#mvp-feature-set-phase-1mvp-功能集phase-1)
    - [Fixture Project Requirements（Fixture 项目需求）](./09-project-scoping-phased-development项目范围界定与阶段化开发.md#fixture-project-requirementsfixture-项目需求)
    - [Backward Compatibility Strategy（向后兼容策略）](./09-project-scoping-phased-development项目范围界定与阶段化开发.md#backward-compatibility-strategy向后兼容策略)
    - [Post-MVP Features（Post-MVP 功能）](./09-project-scoping-phased-development项目范围界定与阶段化开发.md#post-mvp-featurespost-mvp-功能)
    - [Risk Mitigation Strategy（风险缓解策略）](./09-project-scoping-phased-development项目范围界定与阶段化开发.md#risk-mitigation-strategy风险缓解策略)
  - [Functional Requirements（功能需求）](./10-functional-requirements功能需求.md)
    - [Installation & Project Onboarding（安装与项目引导）](./10-functional-requirements功能需求.md#installation-project-onboarding安装与项目引导)
    - [Methodology Discovery & Execution（方法论发现与执行）](./10-functional-requirements功能需求.md#methodology-discovery-execution方法论发现与执行)
    - [Methodology Responsibility Matrix（方法论责任矩阵）](./10-functional-requirements功能需求.md#methodology-responsibility-matrix方法论责任矩阵)
    - [Status & Validation（状态与验证）](./10-functional-requirements功能需求.md#status-validation状态与验证)
    - [Update & File Ownership Protection（更新与文件所有权保护）](./10-functional-requirements功能需求.md#update-file-ownership-protection更新与文件所有权保护)
    - [Configuration & Customization（配置与定制化）](./10-functional-requirements功能需求.md#configuration-customization配置与定制化)
    - [Distribution Sources & Channels（分发来源与渠道）](./10-functional-requirements功能需求.md#distribution-sources-channels分发来源与渠道)
    - [Installation Feedback & Readiness（安装反馈与就绪状态）](./10-functional-requirements功能需求.md#installation-feedback-readiness安装反馈与就绪状态)
    - [Maintainer Workflow & Examples（维护者工作流与示例）](./10-functional-requirements功能需求.md#maintainer-workflow-examples维护者工作流与示例)
    - [Post-MVP Governance & Expansion（Post-MVP 治理与扩展）](./10-functional-requirements功能需求.md#post-mvp-governance-expansionpost-mvp-治理与扩展)
  - [Non-Functional Requirements（非功能需求）](./11-non-functional-requirements非功能需求.md)
    - [Performance（性能）](./11-non-functional-requirements非功能需求.md#performance性能)
    - [Reliability & Determinism（可靠性与确定性）](./11-non-functional-requirements非功能需求.md#reliability-determinism可靠性与确定性)
    - [Security & Safety（安全与防护）](./11-non-functional-requirements非功能需求.md#security-safety安全与防护)
    - [Compatibility & Portability（兼容性与可移植性）](./11-non-functional-requirements非功能需求.md#compatibility-portability兼容性与可移植性)
    - [Integration Quality（集成质量）](./11-non-functional-requirements非功能需求.md#integration-quality集成质量)
    - [Diagnostics & Observability（诊断与可观测性）](./11-non-functional-requirements非功能需求.md#diagnostics-observability诊断与可观测性)
    - [Maintainability & Extensibility（可维护性与可扩展性）](./11-non-functional-requirements非功能需求.md#maintainability-extensibility可维护性与可扩展性)
    - [NFR Measurement Matrix（NFR 度量矩阵）](./11-non-functional-requirements非功能需求.md#nfr-measurement-matrixnfr-度量矩阵)
