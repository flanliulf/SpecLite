---
workflow: bmad-create-epics-and-stories
stepsCompleted:
  - 1
  - 2
  - 3
  - 4
mode: brownfield-sharded
inputDocuments:
  - "prd/index.md"
  - "architecture/index.md"
  - "ux-design-specification.md"
  - "ux-install-cli-interaction-spec-2026-06-12.md"
  - "epics/index.md"
  - "../implementation-artifacts/sprint-status.yaml"
  - "assets/source/speclite/"
  - "src/"
  - "test/fixtures/"
changeRequest: "architecture-artifact-canonical-root-unification"
confirmedAt: "2026-08-18"
revisionSource: "../sprint-change-proposal-2026-08-17.md"
revisionStatus: "complete"
revisionStepsCompleted:
  - 1
  - 2
  - 3
  - 4
revisionInputDocuments:
  - "../prd/index.md"
  - "../prd/prd-validate-report-2026-08-18.md"
  - "../architecture/index.md"
  - "../specs/09-sdlc-workflow-lifecycle-contract.md"
  - "../ux-design-specification.md"
  - "../ux-install-cli-interaction-spec-2026-06-12.md"
  - "../sprint-change-proposal-2026-08-17.md"
  - "./index.md"
  - "../../implementation-artifacts/sprint-status.yaml"
revisionUpdatedAt: "2026-09-01"
readinessRevision:
  changeRequest: "epic-11-implementation-readiness-contract-closure"
  status: "complete"
  stepsCompleted:
    - 1
    - 2
    - 3
    - 4
  confirmedAt: "2026-09-02"
  completedAt: "2026-09-02"
  inputDocuments:
    - "../prd/index.md"
    - "../architecture/index.md"
    - "../ux-design-specification.md"
    - "../ux-install-cli-interaction-spec-2026-06-12.md"
    - "../implementation-readiness-report-2026-09-01.md"
    - "./index.md"
---

# SpecLite Epic Breakdown（SpecLite Epic 拆解）

## Table of Contents（目录）

- [SpecLite Epic Breakdown（SpecLite Epic 拆解）](#table-of-contents目录)
  - [Overview（概览）](./01-overview概览.md)
  - [Requirements Inventory（需求清单）](./02-requirements-inventory需求清单.md)
    - [Functional Requirements（功能需求）](./02-requirements-inventory需求清单.md#functional-requirements功能需求)
    - [NonFunctional Requirements（非功能需求）](./02-requirements-inventory需求清单.md#nonfunctional-requirements非功能需求)
    - [Additional Requirements（补充需求）](./02-requirements-inventory需求清单.md#additional-requirements补充需求)
    - [UX Design Requirements（UX 设计需求）](./02-requirements-inventory需求清单.md#ux-design-requirementsux-设计需求)
    - [FR Coverage Map（FR 覆盖映射）](./02-requirements-inventory需求清单.md#fr-coverage-mapfr-覆盖映射)
  - [Epic List（Epic 列表）](./03-epic-listepic-列表.md)
    - [Epic 1: Project Installation Onboarding（项目安装引导）](./03-epic-listepic-列表.md#epic-1-project-installation-onboarding项目安装引导)
    - [Epic 2: Methodology Discovery And Skill Execution（方法论发现与 Skill 执行）](./03-epic-listepic-列表.md#epic-2-methodology-discovery-and-skill-execution方法论发现与-skill-执行)
    - [Epic 3: Installed State And Deterministic Validation（已安装状态与确定性验证）](./03-epic-listepic-列表.md#epic-3-installed-state-and-deterministic-validation已安装状态与确定性验证)
    - [Epic 4: Safe Update And Repair（安全更新与修复）](./03-epic-listepic-列表.md#epic-4-safe-update-and-repair安全更新与修复)
    - [Epic 5: Source Integrity And Distribution Channels（来源完整性与分发渠道）](./03-epic-listepic-列表.md#epic-5-source-integrity-and-distribution-channels来源完整性与分发渠道)
    - [Epic 6: Maintainer Fixture And Release Confidence（维护者 Fixture 与发布信心）](./03-epic-listepic-列表.md#epic-6-maintainer-fixture-and-release-confidence维护者-fixture-与发布信心)
    - [Epic 7: Post-MVP Governance Expansion（Post-MVP 治理扩展）](./03-epic-listepic-列表.md#epic-7-post-mvp-governance-expansionpost-mvp-治理扩展)
    - [Epic 8: CLI Outcome-Oriented Human Output System（CLI Outcome 导向人类输出体系）](./03-epic-listepic-列表.md#epic-8-cli-outcome-oriented-human-output-systemcli-outcome-导向人类输出体系)
    - [Epic 9: Installed Runtime Activation Contract Hardening（已安装 Runtime 激活契约收口）](./03-epic-listepic-列表.md#epic-9-installed-runtime-activation-contract-hardening已安装-runtime-激活契约收口)
    - [Epic 10: Canonical Source Ecosystem Module Governance（Canonical Source 生态模块治理）](./03-epic-listepic-列表.md#epic-10-canonical-source-ecosystem-module-governancecanonical-source-生态模块治理)
    - [Epic 11: Phase-Aligned Workflow Artifact Governance（阶段对齐的 Workflow Artifact 治理）](./03-epic-listepic-列表.md#epic-11-phase-aligned-workflow-artifact-governance阶段对齐的-workflow-artifact-治理)
  - [Epic 1: Project Installation Onboarding（项目安装引导）](./04-epic-1-project-installation-onboarding项目安装引导.md)
    - [Story 1.1: CLI Install Entry And Runtime Guard（CLI 安装入口与运行时守卫）](./04-epic-1-project-installation-onboarding项目安装引导.md#story-11-cli-install-entry-and-runtime-guardcli-安装入口与运行时守卫)
    - [Story 1.2: Project Target Directory Resolution And Existing Install Detection（项目目标目录解析与既有安装检测）](./04-epic-1-project-installation-onboarding项目安装引导.md#story-12-project-target-directory-resolution-and-existing-install-detection项目目标目录解析与既有安装检测)
    - [Story 1.3: Official Module Selection And Install Summary（官方模块选择与安装摘要）](./04-epic-1-project-installation-onboarding项目安装引导.md#story-13-official-module-selection-and-install-summary官方模块选择与安装摘要)
    - [Story 1.4: Project Config Initialization（项目配置初始化）](./04-epic-1-project-installation-onboarding项目安装引导.md#story-14-project-config-initialization项目配置初始化)
    - [Story 1.5: Runtime Structure, Artifact Directory And IDE Mirror Creation（运行时结构、产物目录与 IDE 镜像创建）](./04-epic-1-project-installation-onboarding项目安装引导.md#story-15-runtime-structure-artifact-directory-and-ide-mirror-creation运行时结构产物目录与-ide-镜像创建)
    - [Story 1.6: Install Progress And Ready Summary（安装进度与就绪摘要）](./04-epic-1-project-installation-onboarding项目安装引导.md#story-16-install-progress-and-ready-summary安装进度与就绪摘要)
    - [Story 1.7: Install CLI Interaction And Localized Human Output（安装 CLI 交互与本地化人类输出）](./04-epic-1-project-installation-onboarding项目安装引导.md#story-17-install-cli-interaction-and-localized-human-output安装-cli-交互与本地化人类输出)
  - [Epic 2: Methodology Discovery And Skill Execution（方法论发现与 Skill 执行）](./05-epic-2-methodology-discovery-and-skill-execution方法论发现与-skill-执行.md)
    - [Story 2.1: Methodology Discovery Metadata Generation（方法论发现元数据生成）](./05-epic-2-methodology-discovery-and-skill-execution方法论发现与-skill-执行.md#story-21-methodology-discovery-metadata-generation方法论发现元数据生成)
    - [Story 2.2: IDE Skill Entry Mapping（IDE Skill Entry 映射）](./05-epic-2-methodology-discovery-and-skill-execution方法论发现与-skill-执行.md#story-22-ide-skill-entry-mappingide-skill-entry-映射)
    - [Story 2.3: Skill Activation And Phase Capability Coverage（Skill 激活与阶段能力覆盖）](./05-epic-2-methodology-discovery-and-skill-execution方法论发现与-skill-执行.md#story-23-skill-activation-and-phase-capability-coverageskill-激活与阶段能力覆盖)
    - [Story 2.4: Runtime Config And Customization Resolve（Runtime Config 与 Customization Resolve）](./05-epic-2-methodology-discovery-and-skill-execution方法论发现与-skill-执行.md#story-24-runtime-config-and-customization-resolveruntime-config-与-customization-resolve)
    - [Story 2.5: Workflow Artifact Output And Metadata Validation（Workflow Artifact 输出与 Metadata 校验）](./05-epic-2-methodology-discovery-and-skill-execution方法论发现与-skill-执行.md#story-25-workflow-artifact-output-and-metadata-validationworkflow-artifact-输出与-metadata-校验)
  - [Epic 3: Installed State And Deterministic Validation（已安装状态与确定性验证）](./06-epic-3-installed-state-and-deterministic-validation已安装状态与确定性验证.md)
    - [Story 3.1: Lightweight Install Status Summary（轻量安装状态摘要）](./06-epic-3-installed-state-and-deterministic-validation已安装状态与确定性验证.md#story-31-lightweight-install-status-summary轻量安装状态摘要)
    - [Story 3.2: Manifest And Index Schema Validation（Manifest 与索引 Schema 验证）](./06-epic-3-installed-state-and-deterministic-validation已安装状态与确定性验证.md#story-32-manifest-and-index-schema-validationmanifest-与索引-schema-验证)
    - [Story 3.3: IDE Mirror And File Integrity Validation（IDE 镜像与文件完整性验证）](./06-epic-3-installed-state-and-deterministic-validation已安装状态与确定性验证.md#story-33-ide-mirror-and-file-integrity-validationide-镜像与文件完整性验证)
    - [Story 3.4: Runtime Path, Menu Target, Legacy Entry And Artifact Path Validation（运行时路径、菜单目标、遗留入口与产物路径验证）](./06-epic-3-installed-state-and-deterministic-validation已安装状态与确定性验证.md#story-34-runtime-path-menu-target-legacy-entry-and-artifact-path-validation运行时路径菜单目标遗留入口与产物路径验证)
    - [Story 3.5: CommandResult And ValidationIssue JSON Contract（CommandResult 与 ValidationIssue JSON 契约）](./06-epic-3-installed-state-and-deterministic-validation已安装状态与确定性验证.md#story-35-commandresult-and-validationissue-json-contractcommandresult-与-validationissue-json-契约)
    - [Story 3.6: Validation Progress, Category Coverage And Local Determinism（验证进度、类别覆盖与本地确定性）](./06-epic-3-installed-state-and-deterministic-validation已安装状态与确定性验证.md#story-36-validation-progress-category-coverage-and-local-determinism验证进度类别覆盖与本地确定性)
  - [Epic 4: Safe Update And Repair（安全更新与修复）](./07-epic-4-safe-update-and-repair安全更新与修复.md)
    - [Story 4.1: Ownership Model And Protected File Boundaries（所有权模型与受保护文件边界）](./07-epic-4-safe-update-and-repair安全更新与修复.md#story-41-ownership-model-and-protected-file-boundaries所有权模型与受保护文件边界)
    - [Story 4.2: Config And Customization Merge Order For Updates（更新中的配置与定制化合并顺序）](./07-epic-4-safe-update-and-repair安全更新与修复.md#story-42-config-and-customization-merge-order-for-updates更新中的配置与定制化合并顺序)
    - [Story 4.3: Update Plan Before Write（写入前更新计划）](./07-epic-4-safe-update-and-repair安全更新与修复.md#story-43-update-plan-before-write写入前更新计划)
    - [Story 4.4: Project Operation Lock And Safe Write（项目操作锁与安全写入）](./07-epic-4-safe-update-and-repair安全更新与修复.md#story-44-project-operation-lock-and-safe-write项目操作锁与安全写入)
    - [Story 4.5: Conflict Detection And Default Non-Overwrite Behavior（冲突检测与默认不覆盖行为）](./07-epic-4-safe-update-and-repair安全更新与修复.md#story-45-conflict-detection-and-default-non-overwrite-behavior冲突检测与默认不覆盖行为)
    - [Story 4.6: Explicit Repair For Recoverable Installer-Owned Drift（可恢复 Installer-Owned Drift 的显式修复）](./07-epic-4-safe-update-and-repair安全更新与修复.md#story-46-explicit-repair-for-recoverable-installer-owned-drift可恢复-installer-owned-drift-的显式修复)
  - [Epic 5: Source Integrity And Distribution Channels（来源完整性与分发渠道）](./08-epic-5-source-integrity-and-distribution-channels来源完整性与分发渠道.md)
    - [Story 5.1: Source Selection And Channel Summary（来源选择与 Channel 摘要）](./08-epic-5-source-integrity-and-distribution-channels来源完整性与分发渠道.md#story-51-source-selection-and-channel-summary来源选择与-channel-摘要)
    - [Story 5.2: Registry Source Resolution And Diagnostics（Registry 来源解析与诊断）](./08-epic-5-source-integrity-and-distribution-channels来源完整性与分发渠道.md#story-52-registry-source-resolution-and-diagnosticsregistry-来源解析与诊断)
    - [Story 5.3: Local Tarball, Offline Bundle And Local Path Integrity（本地包、离线包与本地路径完整性）](./08-epic-5-source-integrity-and-distribution-channels来源完整性与分发渠道.md#story-53-local-tarball-offline-bundle-and-local-path-integrity本地包离线包与本地路径完整性)
    - [Story 5.4: Git Source Pinning And Floating Source Rejection（Git 来源固定与浮动来源拒绝）](./08-epic-5-source-integrity-and-distribution-channels来源完整性与分发渠道.md#story-54-git-source-pinning-and-floating-source-rejectiongit-来源固定与浮动来源拒绝)
    - [Story 5.5: SourceDescriptor Trust Status And Redacted Reporting（SourceDescriptor 信任状态与脱敏报告）](./08-epic-5-source-integrity-and-distribution-channels来源完整性与分发渠道.md#story-55-sourcedescriptor-trust-status-and-redacted-reportingsourcedescriptor-信任状态与脱敏报告)
  - [Epic 6: Maintainer Fixture And Release Confidence（维护者 Fixture 与发布信心）](./09-epic-6-maintainer-fixture-and-release-confidence维护者-fixture-与发布信心.md)
    - [Story 6.1: Fixture Case Layout And Expected Output Contract（Fixture Case 布局与 Expected Output 契约）](./09-epic-6-maintainer-fixture-and-release-confidence维护者-fixture-与发布信心.md#story-61-fixture-case-layout-and-expected-output-contractfixture-case-布局与-expected-output-契约)
    - [Story 6.2: Fresh Install And Existing Update Fixture Gates（Fresh Install 与 Existing Update Fixture Gate）](./09-epic-6-maintainer-fixture-and-release-confidence维护者-fixture-与发布信心.md#story-62-fresh-install-and-existing-update-fixture-gatesfresh-install-与-existing-update-fixture-gate)
    - [Story 6.3: Drift, Source Integrity And Resolve Parity Fixtures（Drift、来源完整性与 Resolve Parity Fixtures）](./09-epic-6-maintainer-fixture-and-release-confidence维护者-fixture-与发布信心.md#story-63-drift-source-integrity-and-resolve-parity-fixturesdrift来源完整性与-resolve-parity-fixtures)
    - [Story 6.4: Path Portability And Runtime Matrix Evidence（路径可移植性与运行时矩阵证据）](./09-epic-6-maintainer-fixture-and-release-confidence维护者-fixture-与发布信心.md#story-64-path-portability-and-runtime-matrix-evidence路径可移植性与运行时矩阵证据)
    - [Story 6.5: Skill Artifact Loop And Documentation Examples（Skill Artifact Loop 与文档示例）](./09-epic-6-maintainer-fixture-and-release-confidence维护者-fixture-与发布信心.md#story-65-skill-artifact-loop-and-documentation-examplesskill-artifact-loop-与文档示例)
    - [Story 6.6: Fixture Contract Hardening（Fixture Contract 收口）](./09-epic-6-maintainer-fixture-and-release-confidence维护者-fixture-与发布信心.md#story-66-fixture-contract-hardeningfixture-contract-收口)
    - [Story 6.7: Packaging Gate Hardening（Packaging Gate 收口）](./09-epic-6-maintainer-fixture-and-release-confidence维护者-fixture-与发布信心.md#story-67-packaging-gate-hardeningpackaging-gate-收口)
    - [Story 6.8: Test Stability And CR TODO Closure（测试稳定性与 CR TODO 收尾）](./09-epic-6-maintainer-fixture-and-release-confidence维护者-fixture-与发布信心.md#story-68-test-stability-and-cr-todo-closure测试稳定性与-cr-todo-收尾)
  - [Epic 7: Post-MVP Governance Expansion（Post-MVP 治理扩展）](./10-epic-7-post-mvp-governance-expansionpost-mvp-治理扩展.md)
    - [Story 7.1: Flow Gate Hook Enforcement（Flow Gate Hook 强制执行）](./10-epic-7-post-mvp-governance-expansionpost-mvp-治理扩展.md#story-71-flow-gate-hook-enforcementflow-gate-hook-强制执行)
    - [Story 7.2: Doctor, Sync And Uninstall Commands（Doctor、Sync 与 Uninstall 命令）](./10-epic-7-post-mvp-governance-expansionpost-mvp-治理扩展.md#story-72-doctor-sync-and-uninstall-commandsdoctorsync-与-uninstall-命令)
    - [Story 7.3: CI And Enterprise Automation Integration（CI 与企业自动化集成）](./10-epic-7-post-mvp-governance-expansionpost-mvp-治理扩展.md#story-73-ci-and-enterprise-automation-integrationci-与企业自动化集成)
    - [Story 7.4: Process Governance Coverage Report（流程治理覆盖报告）](./10-epic-7-post-mvp-governance-expansionpost-mvp-治理扩展.md#story-74-process-governance-coverage-report流程治理覆盖报告)
    - [Story 7.5: Project Config Init And Listing Commands（项目配置初始化与列表命令）](./10-epic-7-post-mvp-governance-expansionpost-mvp-治理扩展.md#story-75-project-config-init-and-listing-commands项目配置初始化与列表命令)
  - [Epic 8: CLI Outcome-Oriented Human Output System（CLI Outcome 导向人类输出体系）](./11-epic-8-cli-outcome-oriented-human-output-systemcli-outcome-导向人类输出体系.md)
    - [Story 8.1: Shared CLI Outcome And Presentation Contract（共享 CLI Outcome 与展示契约）](./11-epic-8-cli-outcome-oriented-human-output-systemcli-outcome-导向人类输出体系.md#story-81-shared-cli-outcome-and-presentation-contract共享-cli-outcome-与展示契约)
    - [Story 8.2: Install Outcome-Oriented Output（Install Outcome 导向输出）](./11-epic-8-cli-outcome-oriented-human-output-systemcli-outcome-导向人类输出体系.md#story-82-install-outcome-oriented-outputinstall-outcome-导向输出)
    - [Story 8.3: Update And Repair Outcome-Oriented Output（Update 与 Repair Outcome 导向输出）](./11-epic-8-cli-outcome-oriented-human-output-systemcli-outcome-导向人类输出体系.md#story-83-update-and-repair-outcome-oriented-outputupdate-与-repair-outcome-导向输出)
    - [Story 8.4: Status And Validate Human Output Separation（Status 与 Validate 人类输出分层）](./11-epic-8-cli-outcome-oriented-human-output-systemcli-outcome-导向人类输出体系.md#story-84-status-and-validate-human-output-separationstatus-与-validate-人类输出分层)
    - [Story 8.5: Resolve Command Support Output（Resolve 命令支持输出）](./11-epic-8-cli-outcome-oriented-human-output-systemcli-outcome-导向人类输出体系.md#story-85-resolve-command-support-outputresolve-命令支持输出)
    - [Story 8.6: Localized Next Actions And Message Catalog（本地化 Next Actions 与消息目录）](./11-epic-8-cli-outcome-oriented-human-output-systemcli-outcome-导向人类输出体系.md#story-86-localized-next-actions-and-message-catalog本地化-next-actions-与消息目录)
    - [Story 8.7: Human Output Fixture And Documentation Matrix（人类输出 Fixture 与文档矩阵）](./11-epic-8-cli-outcome-oriented-human-output-systemcli-outcome-导向人类输出体系.md#story-87-human-output-fixture-and-documentation-matrix人类输出-fixture-与文档矩阵)
    - [Story 8.8: CLI Human Output Presentation Profiles（CLI 人类输出展示 Profile）](./11-epic-8-cli-outcome-oriented-human-output-systemcli-outcome-导向人类输出体系.md#story-88-cli-human-output-presentation-profilescli-人类输出展示-profile)
    - [Story 8.9: CLI Human Output Scan-Friendly Layout And Color（CLI 人类输出可扫描布局与颜色）](./11-epic-8-cli-outcome-oriented-human-output-systemcli-outcome-导向人类输出体系.md#story-89-cli-human-output-scan-friendly-layout-and-colorcli-人类输出可扫描布局与颜色)
  - [Epic 9: Installed Runtime Activation Contract Hardening（已安装 Runtime 激活契约收口）](./12-epic-9-installed-runtime-activation-contract-hardening已安装-runtime-激活契约收口.md)
    - [Story 9.1: Installed Skill Activation Contract Hardening（已安装 Skill 激活契约收口）](./12-epic-9-installed-runtime-activation-contract-hardening已安装-runtime-激活契约收口.md#story-91-installed-skill-activation-contract-hardening已安装-skill-激活契约收口)
    - [Story 9.2: Python Resolver Compatibility Asset Projection（Python Resolver 兼容资产投影）](./12-epic-9-installed-runtime-activation-contract-hardening已安装-runtime-激活契约收口.md#story-92-python-resolver-compatibility-asset-projectionpython-resolver-兼容资产投影)
    - [Story 9.3: Installed Skill Data Directory Projection（已安装 Skill data 目录投影）](./12-epic-9-installed-runtime-activation-contract-hardening已安装-runtime-激活契约收口.md#story-93-installed-skill-data-directory-projection已安装-skill-data-目录投影)
  - [Epic 10: Canonical Source Ecosystem Module Governance（Canonical Source 生态模块治理）](./13-epic-10-canonical-source-ecosystem-module-governancecanonical-source-生态模块治理.md)
    - [Story 10.1: Ecosystem Module Taxonomy And Guided Selected Install Closure（生态模块分类、引导选择与选择性安装闭环）](./13-epic-10-canonical-source-ecosystem-module-governancecanonical-source-生态模块治理.md#story-101-ecosystem-module-taxonomy-and-guided-selected-install-closure生态模块分类引导选择与选择性安装闭环)
    - [Story 10.2: Ecosystem Authoring Contract And Creator Support（生态源定义创作契约与 Creator 支持）](./13-epic-10-canonical-source-ecosystem-module-governancecanonical-source-生态模块治理.md#story-102-ecosystem-authoring-contract-and-creator-support生态源定义创作契约与-creator-支持)
    - [Story 10.3: Frontend Ecosystem Source Expansion（前端生态源定义扩展）](./13-epic-10-canonical-source-ecosystem-module-governancecanonical-source-生态模块治理.md#story-103-frontend-ecosystem-source-expansion前端生态源定义扩展)
    - [Story 10.4: Other Ecosystem Source Expansion（其他生态源定义扩展）](./13-epic-10-canonical-source-ecosystem-module-governancecanonical-source-生态模块治理.md#story-104-other-ecosystem-source-expansion其他生态源定义扩展)
    - [Story 10.5: Ecosystem Fixture And Release Gate Generalization（生态 Fixture 与发布门禁泛化）](./13-epic-10-canonical-source-ecosystem-module-governancecanonical-source-生态模块治理.md#story-105-ecosystem-fixture-and-release-gate-generalization生态-fixture-与发布门禁泛化)
    - [Story 10.6: Public Docs And Maintainer Workflow（公开文档与维护者工作流）](./13-epic-10-canonical-source-ecosystem-module-governancecanonical-source-生态模块治理.md#story-106-public-docs-and-maintainer-workflow公开文档与维护者工作流)
  - [Epic 11: Phase-Aligned Workflow Artifact Governance（阶段对齐的 Workflow Artifact 治理）](./14-epic-11-phase-aligned-workflow-artifact-governance阶段对齐的-workflow-artifact-治理.md)
    - [Story 11.1: Executable Artifact Root Resolution Contract（可执行 Artifact Root 解析契约）](./14-epic-11-phase-aligned-workflow-artifact-governance阶段对齐的-workflow-artifact-治理.md#story-111-executable-artifact-root-resolution-contract可执行-artifact-root-解析契约)
    - [Story 11.2: Fresh Install Artifact Root Projection（Fresh Install Artifact Root 投影）](./14-epic-11-phase-aligned-workflow-artifact-governance阶段对齐的-workflow-artifact-治理.md#story-112-fresh-install-artifact-root-projectionfresh-install-artifact-root-投影)
    - [Story 11.3: Existing Install Compatibility And Diagnostics（Existing Install 兼容与诊断）](./14-epic-11-phase-aligned-workflow-artifact-governance阶段对齐的-workflow-artifact-治理.md#story-113-existing-install-compatibility-and-diagnosticsexisting-install-兼容与诊断)
    - [Story 11.4: Route Analysis Workflows into Dedicated Artifact Subdirectories（将 Analysis Workflows 路由至专属 Artifact 子目录）](./14-epic-11-phase-aligned-workflow-artifact-governance阶段对齐的-workflow-artifact-治理.md#story-114-route-analysis-workflows-into-dedicated-artifact-subdirectories将-analysis-workflows-路由至专属-artifact-子目录)
    - [Story 11.5: Govern Planning and Solutioning Documents as Whole and Sharded Artifacts（治理 Planning 与 Solutioning 文档的整篇与分片产物）](./14-epic-11-phase-aligned-workflow-artifact-governance阶段对齐的-workflow-artifact-治理.md#story-115-govern-planning-and-solutioning-documents-as-whole-and-sharded-artifacts治理-planning-与-solutioning-文档的整篇与分片产物)
    - [Story 11.6: Consolidate UX Artifacts under the Planning UX Space（将 UX Artifacts 归集到 Planning UX 空间）](./14-epic-11-phase-aligned-workflow-artifact-governance阶段对齐的-workflow-artifact-治理.md#story-116-consolidate-ux-artifacts-under-the-planning-ux-space将-ux-artifacts-归集到-planning-ux-空间)
    - [Story 11.7: Standardize the PRD Validation Report Filename（统一 PRD Validation Report 文件名）](./14-epic-11-phase-aligned-workflow-artifact-governance阶段对齐的-workflow-artifact-治理.md#story-117-standardize-the-prd-validation-report-filename统一-prd-validation-report-文件名)
    - [Story 11.8: Rename and Relocate Implementation Readiness Skills（更名并迁移 Implementation Readiness Skills）](./14-epic-11-phase-aligned-workflow-artifact-governance阶段对齐的-workflow-artifact-治理.md#story-118-rename-and-relocate-implementation-readiness-skills更名并迁移-implementation-readiness-skills)
    - [Story 11.9: Normalize Code Review Artifact Directories by Story ID（按 Story ID 统一 Code Review Artifact 目录）](./14-epic-11-phase-aligned-workflow-artifact-governance阶段对齐的-workflow-artifact-治理.md#story-119-normalize-code-review-artifact-directories-by-story-id按-story-id-统一-code-review-artifact-目录)
    - [Story 11.10: Inventory All Grill-Related Skill References for Human Confirmation（盘点全部 Grill 相关 Skill 引用供人工确认）](./14-epic-11-phase-aligned-workflow-artifact-governance阶段对齐的-workflow-artifact-治理.md#story-1110-inventory-all-grill-related-skill-references-for-human-confirmation盘点全部-grill-相关-skill-引用供人工确认)
