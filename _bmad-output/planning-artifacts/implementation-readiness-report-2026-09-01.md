---
stepsCompleted:
  - step-01-document-discovery
  - step-02-prd-analysis
  - step-03-epic-coverage-validation
  - step-04-ux-alignment
  - step-05-epic-quality-review
  - step-06-final-assessment
assessmentScope: Epic 11
overallStatus: NOT READY
issueCounts:
  critical: 0
  major: 4
  minor: 1
assessor: Codex / BMad Implementation Readiness
completedAt: 2026-09-01
includedFiles:
  prd:
    - _bmad-output/planning-artifacts/prd/index.md
    - _bmad-output/planning-artifacts/prd/01-executive-summary执行摘要.md
    - _bmad-output/planning-artifacts/prd/02-project-classification项目分类.md
    - _bmad-output/planning-artifacts/prd/03-success-criteria成功标准.md
    - _bmad-output/planning-artifacts/prd/04-product-scope产品范围.md
    - _bmad-output/planning-artifacts/prd/05-user-journeys用户旅程.md
    - _bmad-output/planning-artifacts/prd/06-domain-specific-requirements领域特定需求.md
    - _bmad-output/planning-artifacts/prd/07-innovation-novel-patterns创新与新模式.md
    - _bmad-output/planning-artifacts/prd/08-developer-tool-specific-requirements开发者工具特定需求.md
    - _bmad-output/planning-artifacts/prd/09-project-scoping-phased-development项目范围界定与阶段化开发.md
    - _bmad-output/planning-artifacts/prd/10-functional-requirements功能需求.md
    - _bmad-output/planning-artifacts/prd/11-non-functional-requirements非功能需求.md
  prdValidation:
    - _bmad-output/planning-artifacts/prd/prd-validate-report-2026-08-18.md
  architecture:
    - _bmad-output/planning-artifacts/architecture/index.md
    - _bmad-output/planning-artifacts/architecture/01-project-context-analysis项目上下文分析.md
    - _bmad-output/planning-artifacts/architecture/02-starter-template-evaluationstarter-模板评估.md
    - _bmad-output/planning-artifacts/architecture/03-core-architectural-decisions核心架构决策.md
    - _bmad-output/planning-artifacts/architecture/04-implementation-patterns-consistency-rules实现模式与一致性规则.md
    - _bmad-output/planning-artifacts/architecture/05-project-structure-boundaries项目结构与边界.md
    - _bmad-output/planning-artifacts/architecture/06-architecture-validation-results架构验证结果.md
  epics:
    - _bmad-output/planning-artifacts/epics/index.md
    - _bmad-output/planning-artifacts/epics/01-overview概览.md
    - _bmad-output/planning-artifacts/epics/02-requirements-inventory需求清单.md
    - _bmad-output/planning-artifacts/epics/03-epic-listepic-列表.md
    - _bmad-output/planning-artifacts/epics/04-epic-1-project-installation-onboarding项目安装引导.md
    - _bmad-output/planning-artifacts/epics/05-epic-2-methodology-discovery-and-skill-execution方法论发现与-skill-执行.md
    - _bmad-output/planning-artifacts/epics/06-epic-3-installed-state-and-deterministic-validation已安装状态与确定性验证.md
    - _bmad-output/planning-artifacts/epics/07-epic-4-safe-update-and-repair安全更新与修复.md
    - _bmad-output/planning-artifacts/epics/08-epic-5-source-integrity-and-distribution-channels来源完整性与分发渠道.md
    - _bmad-output/planning-artifacts/epics/09-epic-6-maintainer-fixture-and-release-confidence维护者-fixture-与发布信心.md
    - _bmad-output/planning-artifacts/epics/10-epic-7-post-mvp-governance-expansionpost-mvp-治理扩展.md
    - _bmad-output/planning-artifacts/epics/11-epic-8-cli-outcome-oriented-human-output-systemcli-outcome-导向人类输出体系.md
    - _bmad-output/planning-artifacts/epics/12-epic-9-installed-runtime-activation-contract-hardening已安装-runtime-激活契约收口.md
    - _bmad-output/planning-artifacts/epics/13-epic-10-canonical-source-ecosystem-module-governancecanonical-source-生态模块治理.md
    - _bmad-output/planning-artifacts/epics/14-epic-11-phase-aligned-workflow-artifact-governance阶段对齐的-workflow-artifact-治理.md
  ux:
    - _bmad-output/planning-artifacts/ux-design-specification.md
    - _bmad-output/planning-artifacts/ux-install-cli-interaction-spec-2026-06-12.md
excludedFiles:
  - _bmad-output/planning-artifacts/prd-validation-report.md
  - _bmad-output/planning-artifacts/prd/prd-validate-report-2026-07-22.md
  - _bmad-output/planning-artifacts/prd/prd-validate-report-2026-08-17.md
---

# Implementation Readiness Assessment Report（实施就绪性评估报告）

**Date（日期）：** 2026-09-01
**Project（项目）：** SpecLite

## Document Discovery（文档发现）

本次评估范围聚焦 Epic 11，同时纳入完整 PRD、Architecture、Epics/Stories 与 UX corpus，以检查跨 artifact 对齐、依赖关系和需求可追溯性。

- PRD：采用 `prd/index.md` 与 11 个正文 shards。
- PRD validation：采用最新的 `prd-validate-report-2026-08-18.md` 作为补充验证证据；排除 3 份历史报告。
- Architecture：采用 `architecture/index.md` 与 6 个 shards。
- Epics/Stories：采用 `epics/index.md`、requirements inventory、Epic list 与 Epic 1–11 全部 shards，最终结论聚焦 Epic 11。
- UX：采用主 UX specification 与 CLI interaction supplement。
- Current checkout：Epic 11 shard 与 `epics/index.md` 存在未提交修改，本报告按工作区当前版本评估。


## PRD Analysis（PRD 分析）

### Functional Requirements（功能需求）

- FR1: 项目维护者可以指定 SpecLite 安装目录。
- FR2: 系统可以解析并展示最终安装路径。
- FR3: 系统可以检查安装目录是否存在、是否为空、是否已有 SpecLite 安装内容。
- FR4: 项目维护者可以确认是否安装到解析后的目录。
- FR5: 项目维护者可以选择要安装的官方 SpecLite 模块或能力包。
- FR6: 系统可以检查并展示可安装模块的版本信息。
- FR7: 系统可以展示用户已选择的模块、版本和安装摘要。
- FR8: 项目维护者可以选择是否从自定义来源安装 SpecLite。
- FR9: 项目维护者可以从 Git source 或 local path 安装或验证 SpecLite source；local path 不得指向目标项目中的 installed state、IDE mirrors、workflow output、dependency/cache/build 目录。
- FR10: 项目维护者可以选择要集成的 AI IDE 目标。
- FR11: 系统可以展示每个目标 AI IDE 的配置结果。
- FR12: 系统可以为目标项目创建 SpecLite 项目级运行元数据结构。
- FR13: 系统可以为目标项目创建 SpecLite 过程产物输出结构。
- FR13a: Fresh install 必须在 `_speclite-output/` 下预创建阶段对齐的一级 artifact roots：`0-brainstorming-artifacts/`、`1-analysis-artifacts/`、`2-planning-artifacts/`、`3-solutioning-artifacts/`、`4-implementation-artifacts/`、`5-devops-artifacts/`；workflow 产生的 project knowledge 默认位于 `_speclite-output/project-knowledge-base/`，目标项目 `docs/` 保持 Primary Public Document（主要公开文档）定位。
- FR14: 系统可以发现正式可分发的 SpecLite source skills；MVP 默认官方安装集合必须递归发现 `core-skills/` 与 `sdlc-skills/` 下全部包含 `SKILL.md` 的 canonical package roots，并排除 `support-skills/`、已删除入口和非正式分发辅助来源。
- FR15: 系统可以将同一 canonical skill 暴露到多个目标 AI IDE；对于被选中模块下的每个 canonical package root，MVP 必须在每个已选择且支持的 IDE target 中生成 self-contained skill entry，并在 skill index / files index 中记录 source reference 与 hash。
- FR16: 项目维护者可以查看安装完成后的项目结构和安装摘要。
- FR17: 项目维护者可以查看安装完成后的下一步使用指引。
- FR17a: 首次安装的 human-readable CLI 输出必须使用分阶段 block 呈现模块选择、配置模式、写入计划确认、写入进度和 Ready Summary；日志、摘要、提示和用户输入必须在视觉上分离，不得把长段 summary 与 prompt 拼接到同一个输入问题中。
- FR18: 安装器可以生成 IDE-specific discovery metadata，列出研发阶段、canonical skill id、skill 名称、目标 IDE entry path 和激活 target。Manifest、skill index、help index、files index 与最小阶段覆盖矩阵的字段、版本、hash 和 ownership 规则由 `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md` 作为 canonical contract 管理；IDE adapter id、target id、target order、capability 与 status 语义由 `_bmad-output/planning-artifacts/specs/05-ide-adapter-registry-contract.md` 管理。
- FR19: MVP 中每个 IDE adapter 必须把 discovery metadata 映射为该 IDE target directory 中的 self-contained skill entry，并报告 mapped、unsupported 或 failed 状态。Adapter schema 可以声明 `commandPointerBehavior: "none" | "unsupported"` 作为 Post-MVP 扩展位，但 MVP 不生成 command pointer artifact。
- FR20: AI IDE 使用者可以通过已映射的 IDE entry 选择并激活 SpecLite skill。
- FR21: AI IDE 使用者可以调用 SPEC、方案评审、故事规划、实现、测试和审查相关能力；每项能力必须映射到至少一个 canonical skill id。
- FR22: 已激活的 skill 可以读取项目级配置、customization 覆盖和相关上下文。
- FR23: 已激活的 workflow 可以将产物输出到配置约定的位置，并在产物中记录 workflow type、source skill 和生成时间。MVP artifact contract 至少校验 artifact type、默认输出路径、configured artifact root、`workflowType`、`sourceSkill` 和 `generatedAt` 元数据字段；artifact root 和默认输出路径必须是 project-relative POSIX path 且位于 target project boundary 内，产物内容质量不进入 MVP validation。
- FR23a: Artifact metadata 的 MVP 校验必须覆盖最小值域：`workflowType` 必须是非空稳定字符串，`sourceSkill` 必须是非空 canonical skill id，`generatedAt` 必须存在且是 ISO 8601 string，且默认在 stable fixture snapshot comparison 中 normalize 或 exclude。
- FR23b: 1-analysis 阶段的 domain、market、technical research 必须写入 `{analysis_artifacts}/research/`；product brief 必须写入 `{analysis_artifacts}/product-brief/`；PRFAQ 必须写入 `{analysis_artifacts}/prfaq/`。这些 research skills 不是 `{project_knowledge}` 的产生者。
- FR23c: `{planning_artifacts}` 必须预创建 `epics/` 与 `prd/`；`{solutioning_artifacts}` 必须预创建 `architecture/`。PRD、Epics、Architecture 对应 workflow 的 whole documents 与 `shard-doc` 产生的 shards 必须在各自 phase-owned subject directory 内保持可发现、无 whole/sharded 双真源歧义；existing install 必须遵守 `SPEC 09` 的显式配置权威、`legacy-compatible` fallback 与 no-migration contract。
- FR23d: `{planning_artifacts}` 必须预创建 `ux/`，承载 `ux-design-specification.md`、`ux-color-themes.html`、`ux-design-directions.html`；`design-system/` 子树仅在对应 workflow 首次需要时按需创建，UX workflow、discovery 与引用必须统一使用该 root。
- FR23e: `speclite-validate-prd` 的报告文件名必须固定为 `prd-validate-report-{yyyy-MM-dd}.md`，并写入 `{planning_artifacts}/prd/`；existing install 中的旧名称报告必须保持原位且可作为历史 evidence 被发现，install、update 或 repair 不得自动重命名、迁移、覆盖或删除。
- FR23f: SpecLite 方法论维护者必须将 Canonical skill `speclite-ir-grill-consistency-reviewer` 更名为 `speclite-implementation-readiness-grill-consistency-reviewer`，将 `speclite-check-implementation-readiness` 更名为 `speclite-implementation-readiness-check`，并将两者的输出统一置于 `{solutioning_artifacts}/implementation-readiness-report/grill-consistency/`；readiness report 文件名保持 `implementation-readiness-report-{yyyy-MM-dd}.md`。SpecLite 方法论维护者必须同步更新 package、help、manifest、activation、cross-skill 与 docs references。Canonical metadata 必须维护旧 ID 到新 ID 的 rename mapping，不得生成 alias package/help/phase row；fresh install 只投影新 canonical ID，existing install 的 update 必须显式展示 rename/reprojection，并保护发生 drift 的旧 package。
- FR23g: Epic Story code-review orchestrator 及 reviewer/evaluator/fixer/finalizer 相关 workflows 必须把每个 Story 的 CR artifact root 规范为 `{story-id}-code-review/`，其中 `story-id` 使用 `x-x` 形式；不得再把 Story title/name 拼入目录名。既有 title-bearing CR 目录不得被自动迁移、重命名或删除；恢复 legacy-only 未完成 CR 时必须在一个目录内完成，canonical 与 legacy 目录并存且无法唯一判断当前轮次时必须停止并报告稳定冲突诊断。
- FR24: 企业规范负责人可以查看 MVP 最小阶段覆盖矩阵，确认 SPEC、方案评审、故事规划、实现、测试和审查阶段是否存在 mapped skill entry、对应 canonical skill id、以及目标 IDE target 是否可见。MVP 阶段覆盖矩阵来自 manifest、help index 和 installed skill entries，最小字段必须覆盖 `phaseId`、`phaseLabel`、`moduleId`、`canonicalSkillId`、`ideTargets[].targetId`、`ideTargets[].entryPath`、`ideTargets[].activationTarget`、`ideTargets[].status` 和可选 `artifactContract`；不提供覆盖率百分比、趋势、团队汇总或治理 dashboard。
- FR25: 工具链维护者可以查看当前项目的 SpecLite 安装状态。
- FR26: 工具链维护者可以查看安装来源、版本和目标 IDE 覆盖情况。
- FR27: 工具链维护者可以验证 manifest、skill index、help index 和 files index 的有效性。
- FR28: 工具链维护者可以验证 manifest 中记录的所有已选择且支持的 IDE target mirrors 是否与 canonical source 一致。
- FR28a: 当 IDE mirror 中的 canonical skill package 文件偏离 manifest 记录的 canonical package hash 时，`validate` 必须报告 `ide-mirror` 或 `file-integrity` error，但不得自动修复。
- FR29: 工具链维护者可以检测缺失的菜单目标或不可激活的 skill。
- FR30: 工具链维护者可以检测错误 runtime path、legacy namespace residue 和产物路径问题。
- FR31: 工具链维护者可以检测旧版或遗留 AI IDE 入口。
- FR32: 系统可以在检测到遗留入口与当前 canonical skill id 或 IDE target 重叠时，提示重复加载、菜单冲突或能力漂移风险。
- FR33: 系统可以为遗留入口提供包含 path、risk category、manual action 和 verification command 的人工清理建议。
- FR34: 工具链维护者可以验证 shared scripts、module directories、configuration、help catalog 和 IDE mirrors 是否安装完成。
- FR35: 系统可以输出可诊断的验证结果，指出问题类型、影响范围和修复方向。
- FR35a: MVP 面向用户的核心命令必须支持 `--json`，并使用统一 `CommandResult` envelope；详细字段、排序、路径、timestamp、schema evolution、status 推导、exit code 和 fixture comparison 契约以 `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md` 为准。
- FR35b: `CommandResult` 中的 issues 必须复用同一 `ValidationIssue` model，并与 human-readable output、exit code 和 fixture assertions 保持一致；issue category、issue id 与默认 severity 语义以 `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md` 为准。
- FR35c: PRD 不定义第二份 public JSON 字段真源。负责 public JSON contract 变更的 SpecLite 维护者在新增 public JSON 字段、reason code、redacted path 形状、排序规则或 command-specific payload 行为时，必须先更新 owning SPEC，再同步 executable schema/parser 和 fixture expected outputs。Reason code producer 只能输出 owning SPEC registry 中的 MVP codes；consumer/parser 必须容忍 unknown future codes，并保留其 stable display string。
- FR36: 项目维护者可以更新已安装的 SpecLite installer-owned 文件。
- FR37: 系统可以区分 installer-owned、human-owned 和 workflow-owned 文件。
- FR38: 系统可以在更新前识别本地文件是否被用户修改。
- FR39: 系统可以避免覆盖 human-owned custom 文件。
- FR40: 系统可以避免覆盖 workflow-owned 过程产物。
- FR41: 项目维护者可以看到 update 对安装内容、用户定制和过程产物的影响摘要，包括 planned effects、实际 changed/skipped paths 和 conflicts；public output 契约以 `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md` 为准。
- FR41a: `update` 遇到 IDE mirror drift 或其他 installer-owned drift 时必须默认标记 conflict，不得静默覆盖；普通 `update` 的用户确认或 `--yes` 只授权无 conflict 的 planned update writes，不得恢复 drift。MVP 只有 `speclite update --repair` 才可恢复可安全 repair 的 canonical 内容，不新增顶级 `speclite repair` 命令，`speclite sync` 保持 Post-MVP。
- FR41b: `speclite update --repair` 必须只修复可安全恢复或重建的 installer-owned drift，并继续保护 human-owned custom 文件和 workflow-owned artifacts；repair eligibility、missing source evidence、`expectedHash`、restore-canonical/regenerate、conflict projection 和 reason code producer/consumer 语义以 owning SPEC 为准。
- FR41c: Install/update/repair 必须坚持 plan-before-write、显式写入授权、project operation lock、safe write、保守 stale lock 处理和 partial failure 可诊断性；具体 planning/write authorization 契约以 `_bmad-output/planning-artifacts/specs/03-install-plan-contract.md` 为准。MVP 不生成 standalone report artifact，不提供事务性 rollback、backup/restore、顶级 repair 或 sync。
- FR42: 项目维护者可以在安装过程中配置用户称呼或团队名称。
- FR43: 项目维护者可以在安装过程中配置项目名称。
- FR44: 项目维护者可以在安装过程中配置 AI agent 的交流语言。
- FR45: 项目维护者可以在安装过程中配置文档输出语言。
- FR46: 项目维护者可以在安装过程中配置过程产物输出目录。
- FR47: 项目维护者可以选择快速配置或详细配置模式。
- FR47a: `speclite install --yes` 必须采用 module metadata、config contract 和 adapter registry 明确声明的 deterministic defaults，并仅授权 `_bmad-output/planning-artifacts/specs/03-install-plan-contract.md` 定义的无 conflict planned writes；该模式不得发起或等待 module selection、config mode、IDE target selection 或 final write confirmation 等交互输入。若必需值无法由 defaults 或显式 flags 解析，或 planning 产生 unsupported target、drift 或 conflict，命令必须在写入前失败，以非 0 exit code 和 owning SPEC registry 中的 stable issue id 报告原因；显式 flags 必须覆盖对应 default。需要人工选择时，用户必须显式进入 interactive mode，`--yes` 不得隐式切换为 interactive mode。
- FR48: 项目维护者可以使用项目级配置定义用户称呼、项目名称、交流语言、文档输出语言、产物路径、安装模块和 IDE targets。
- FR49: 用户可以通过定制化配置覆盖 skill workflow、agent persona、菜单项和输出路径默认值。
- FR50: 系统可以按 installer base、installer user、team custom、user custom 的优先级解析并合并配置。
- FR51: 系统可以通过 ownership manifest、路径规则和只读策略保留 human-owned 配置的人工维护边界。
- FR51a: MVP 默认不修改 human-owned TOML，包括 `_speclite/custom/*.toml` 和 `_speclite/custom/*.user.toml`。所谓保守更新在 MVP 中只表示读取并保护；任何对 human-owned TOML 的写入都必须由未来显式命令或交互确认引入，并通过 ADR 记录。
- FR51b: Fresh install 可以在目标路径不存在时按 create-if-absent 规则创建 human-owned TOML stub；MVP scope 仅限 project-level stubs：`_speclite/custom/config.toml` 与 `_speclite/custom/config.user.toml`。Ownership 规则由 Epic 4 / Story 4.1 验证，fresh-install 初始化由 Epic 1 / Story 1.4 执行。Fresh install 不默认创建 skill-specific `_speclite/custom/{skill}.toml` 或 `_speclite/custom/{skill}.user.toml`；如果任何 human-owned custom TOML 已存在，install/update/repair 不得覆盖、重写、重排或格式化。
- FR52: 系统可以让 skills 使用统一配置访问项目名称、用户偏好、输出路径和流程约定。
- FR52a: 系统必须提供 `speclite resolve config` 与 `speclite resolve customization` 作为 MVP runtime support command，使已安装 skills 能通过稳定入口读取 config/customization，而不依赖 Python resolver 或内部构建路径。
- FR52b: `speclite resolve` 必须保持 Python resolver parity，包括 stdout/stderr shape、exit code、missing key、repeated key、project-root fallback、required/optional layer failure、array merge、config/customization merge order 和 customization lookup key。详细契约以 `_bmad-output/planning-artifacts/specs/06-resolve-command-contract.md` 为准；PRD 与 Architecture 不重新定义第二份 resolve 字段真源。
- FR52c: `resolve-parity` fixture 必须覆盖 config/customization resolver 兼容性，并随 resolver 行为变更同步更新 owning SPEC、parser/schema 和 expected outputs。
- FR53: 项目维护者可以从 npm public registry 安装 SpecLite。
- FR54: 项目维护者可以从 private registry 安装 SpecLite。
- FR55: 项目维护者可以从 local tarball 安装 SpecLite。
- FR56: 项目维护者可以从 offline bundle 安装 SpecLite。
- FR57: 项目维护者可以从 Git source 安装 SpecLite，并在 install/update 的 source resolution 阶段验证 Git source；写入前 Git source 必须解析到具体 commit SHA，只指定 remote URL、branch 或 tag 的浮动 Git source 不得进入 install planning。`speclite validate` 不负责访问 Git remote 或重新验证远程 freshness/provenance，只检查本地记录的 source descriptor、integrity evidence shape 和 hash baseline。
- FR58: 系统可以记录并展示安装来源、channel 和版本信息。
- FR59: 当安装来源不可用或不合法时，系统必须在写入前失败，并通过统一 `CommandResult` / `ValidationIssue` model 输出 stable issue id、category、severity、affected component、impact 和 suggested next step；command data 或 summary 中的 source facts 必须遵守 source descriptor 的 display-safe/redaction contract，human-readable output、`--json` output 与 exit code 必须由同一 issue/status 语义推导。各 source type 的 unavailable、invalid descriptor、integrity failure 和 unsupported case 必须由 owning SPEC registry 定义，并由 fixture assertions 验证。
- FR60: 系统可以在安装过程中展示 source discovery、manifest generation、IDE mirror creation、config initialization 和 ready check 的执行状态。
- FR61: 系统可以展示 shared scripts、module directories、configuration、help catalog 和 IDE integrations 的安装结果。
- FR62: 系统可以展示每个已配置 AI IDE 的 skill 数量和目标目录。
- FR63: 系统可以在安装完成后展示包含安装路径、manifest version、source descriptor、已安装模块、IDE targets、关键目录和下一步命令的 SpecLite ready summary。
- FR63a: Ready summary 的 human-readable 输出可以包含解释性文案，但 automation 依赖必须进入 `install --json` 的 `InstallCommandData` 字段，例如 `sourceDescriptor`、`manifestVersion`、`installedModules`、`ideTargets`、`paths`、`completedSteps` 和 `pendingSteps`；MVP 不新增未契约化的 `readySummary` JSON blob。
- FR63b: Human-readable install output 必须支持 CLI message catalog。MVP 默认 locale 为 `zh-CN`，并提供 `en-US` fallback；locale 可以通过 `--locale` 或 `SPECLITE_LOCALE` 显式指定。Message catalog 只翻译自然语言，不翻译 command name、flag、module id、target id、step id、path、schema id、issue id、reason code 或 JSON field。
- FR64: 系统可以在安装完成后展示用户下一步如何启动 AI agent 和调用帮助 skill。
- FR65: 系统可以在安装完成后展示安装位置、已安装模块和已配置工具清单。
- FR65a: 安装写入前的 final review 必须以稳定顺序展示 target、source descriptor、config mode、selected modules、IDE targets、planned writes 和 pending phases，并明确说明当前是否已写入项目文件以及确认后将发生的写入阶段。
- FR66: SpecLite 维护者可以验证新增或修改的 source skill 是否可安装。
- FR66a: SpecLite 维护者必须能够生成完整、可复查、只读的全 canonical Skill corpus `grill` 引用清单，逐项记录 skill id、引用文件、引用表达、目标 skill/path 与引用用途，用于更名和路由变更后的人工确认与负向残留检查；生成清单不得修改被盘点的 canonical Skill definitions。
- FR67: SpecLite 维护者可以使用 fixture project 复现 fresh install 流程。
- FR68: SpecLite 维护者可以使用 fixture project 验证安装前后目录变化。
- FR69: SpecLite 维护者可以使用 fixture project 验证 status、validate 和 update 行为。
- FR70: SpecLite 维护者可以验证至少一个 skill 从 IDE 发现到产物输出的最小闭环。
- FR71: MVP 文档必须提供 fresh install、安装前后目录树、manifest/index、status/validate output 和 update protection 五类可执行示例；每类示例必须包含前置条件、命令或操作、expected artifact/output 与 verification step，并通过 docs link/reference check 及对应 fixture/CLI assertions 验证示例中的 command、path、field 与当前 contract 一致。
- FR71a: SpecLite 维护者必须将 Fixture expected outputs 作为契约测试资产，而不是仅供阅读的示例；新增模块、adapter、source type、validation rule、ownership 行为或 installed artifact kind 时，SpecLite 维护者必须同步相关 fixture 输入和 expected outputs。
- FR71b: Fixture case directory、expected output classes、snapshot comparison、ready summary gate、release gate / regression asset 区分和 baseline case 集合由 `_bmad-output/planning-artifacts/specs/08-fixture-contract.md` 管理。实现不得先更新 snapshots 再反推契约行为；契约变更必须先更新 owning SPEC 和 executable schema/parser，再更新 fixture expected outputs。
- FR72: 项目维护者可以初始化或重建项目级配置。
- FR73: 项目维护者可以列出可安装模块、skills、IDE targets 或版本。
- FR74: 工具链维护者可以运行环境、source、权限、IDE target、manifest、路径规范化和文件完整性诊断。
- FR75: 工具链维护者可以显式同步 source 与 IDE mirrors。
- FR76: 项目维护者可以移除 installer-owned 安装结果。
- FR77: Post-MVP 工具链维护者可以让 CI、企业工具链和自动化验证流程消费 MVP 机器可读输出；MVP 只负责提供稳定 `CommandResult` JSON 和 file contracts，不实现企业集成工作流本身。
- FR78: 企业规范负责人可以查看包含阶段入口覆盖率、标准产物存在率、validate 通过率和未解决缺口数量的规范落地与流程覆盖报告。该报告属于 Post-MVP，可在 MVP 最小阶段覆盖矩阵与 validate output 之上增加趋势、导出、多项目/团队视角和企业治理汇总。

**Total FRs（FR 总数）：** 106

### Non-Functional Requirements（非功能需求）

- NFR1: 在常规 fixture 项目中，fresh install 必须至少输出 source discovery、manifest generation、IDE mirror creation、config initialization 和 ready check 5 个阶段状态；fixture baseline 必须记录阶段顺序和完成结果。Machine-readable progress `stepId` 必须使用 stable lower-kebab id，例如 `ready-check`，作为 fixture-observable deterministic signal；它不是 MVP automation API。Automation 依赖必须读取 `CommandResult.data.completedSteps` 和 `CommandResult.data.pendingSteps`。Human-readable step label 可以是 `ready check`。阶段耗时只作为 performance evidence 或 human-readable/profiling 数据，默认不得进入 stable command JSON snapshots。
- NFR1a: Fresh install human-readable output 必须按稳定 block hierarchy 展示阶段标题、摘要、prompt 和确认说明；prompt 必须单独占行且与上一段 summary 空行分隔。默认输出不得把多段摘要拼成单个长段落，也不得把 summary 与用户输入确认内容合并为同一个输入提示字符串。
- NFR2: `status` 在 versioned performance fixture profile 的常规项目中必须在 2 秒内返回项目安装摘要，且不得执行完整文件完整性扫描；性能基准以 3 次连续运行的 p95 结果为准。Performance evidence 必须记录 fixture profile id/revision、SpecLite version、OS、Node.js version 和资源环境标识；只有相同 profile revision 与可比资源环境的结果可以用于门槛判定。
- NFR2a: MVP `status` 必须是轻量本地只读摘要，只读取本地 manifest、source descriptor、manifest version、installed modules、IDE target summary、关键路径和 high-level health；不得访问 npm registry、private registry、Git remote、offline bundle origin 或其他远程 source，不得执行 remote freshness check、provenance revalidation、完整文件 hash scan 或隐式 update check。
- NFR3: `validate` 可以执行完整 local deterministic validation；`validate.data.checkedCategories` 和 validate progress 必须使用 canonical issue category order：`environment`、`manifest-schema`、`source-integrity`、`ide-mirror`、`runtime-path`、`menu-target`、`legacy-namespace`、`artifact-path`、`file-integrity`、`operation-lock`、`update`。常规 fixture 项目中每个实际执行类别必须在开始和结束时输出状态。
- NFR4: `update` 与 `validate` 必须跳过 hash 未变化的 source skills 和 IDE mirrors；在 fixture baseline 中，未变化文件的重复写入次数必须为 0。
- NFR5: fixture project 中的 fresh install、status、validate、update 必须记录 baseline runtime；每个 accepted baseline 必须具有 stable baseline id，并记录 command、fixture profile id/revision、SpecLite version、OS、Node.js version、资源环境标识和 acceptance state。只有相同 command、相同 fixture profile revision 与可比资源环境的结果可以比较；任一命令相较适用的 accepted baseline 退化超过 25% 时，验证报告必须标记为 performance regression。
- NFR5a: Runtime/p95 baseline、regression percentage 和 profiling sample 必须作为 release/performance evidence 保存，不得进入 stable `CommandResult` JSON 或 stable fixture snapshots。MVP 可以用 release checklist section 或 non-stable `performance-evidence` artifact 承载 measurement；fixture 只断言 evidence 存在、测量口径和 pass/fail conclusion，不比较具体 wall-clock values。
- NFR6: 相同 source、配置、目标 IDE 和安装目录在同一平台上重复安装，应生成 byte-for-byte 一致的 `_speclite/_config`、manifest/index 和 IDE mirror 文件；允许差异仅限明确标记的时间戳字段。
- NFR7: `install` 对已存在安装内容必须输出 existing-install 状态，列出 detected runtime、manifest version、IDE targets 和下一步选项，不得静默覆盖已有 SpecLite 状态。
- NFR8: `update` 必须在修改文件前完成所有权和本地变更判断；无法确认安全时必须跳过该文件、输出 conflict 状态，并保留原文件不变。
- NFR9: `validate` 的检查结果必须可复现，同一安装状态下连续运行 3 次应返回相同 issue id、category、severity 和 affected path 集合。
- NFR9a: MVP `validate` 必须是本地确定性命令，不得访问 npm registry、private registry、Git remote、offline bundle origin 或其他远程 source；不得执行 remote freshness check 或 provenance revalidation。远程重新验证只能发生在显式 `update`、安装来源解析流程或 Post-MVP `doctor` 中。
- NFR10: 安装失败时，系统不得展示 ready summary；失败结果必须列出 completed steps、failed step、pending steps 和 manual action，且退出状态不得为成功。
- NFR11: ready summary 只能在 source discovery、manifest generation、IDE mirror creation、config initialization 全部成功，且安装结果满足最小就绪条件后展示；该条件必须可由 fixture 中的阶段完成结果与 required installation artifacts 断言，不等同于完整 `speclite validate`。
- NFR11a: `install --yes` happy path 必须是 no-prompt flow：使用默认 modules、quick config 和默认 IDE targets，并在 human-readable 输出中说明采用了默认值。需要用户选择模块、配置模式或 IDE targets 的流程必须通过显式 interactive mode 或显式 flags 进入；`--json --yes` 必须保持无交互。
- NFR12: 安装器不得在 install plan 未声明且用户未确认的情况下访问远程 source、下载额外资源或执行外部脚本；install summary 必须记录每个 external access 的 redacted/display-safe source、reason 和 confirmation state。
- NFR13: bundled source、自定义 Git source、local path、tarball 和 offline bundle 必须在安装摘要中展示 source type、redacted/display-safe source value、resolved version 或 content hash。
- NFR13a: `sourceDescriptor.trustStatus` 必须区分 `trusted`、`unverified` 和 `blocked`：MVP 中只有 expected hash、lock match，或 bundled source 的等价 packaging manifest / package hash / package lock match 可产生 `trusted`，不提供通用 trusted source allowlist schema；缺少信任锚但可安装的 source 为 `unverified`；hash mismatch、lock mismatch、unsupported source 或 Post-MVP source policy 拒绝必须为 `blocked` 并阻止写入。
- NFR13b: `sourceDescriptor.contentHash` 不对所有 source type 强制存在；MVP 必须强制 `sourceDescriptor.integrityEvidence` 至少包含一种可复现证据。bundled source 记录 packaging manifest / package hash / lock evidence；registry source 记录 package/version/integrity 或 lock match；tarball/offline bundle 记录 content hash；Git source 记录 commit SHA；local source 记录 snapshot hash 或等价 manifest hash。只指定 remote URL、branch 或 tag 的浮动 Git source 不得写入。缺少完整性证据时必须输出 `source-integrity` error 并阻止写入。
- NFR13b-1: Local source snapshot hash 只覆盖 canonical source tree allowlist，必须排除 `.git`、临时文件、`node_modules`、fixture output、本地 cache、build output 和 editor/OS metadata。Local source 不得指向目标项目中的 `_speclite/`、`.claude/skills/`、`.agents/skills/`、`_speclite-output/`、fixture output、`node_modules/`、cache、temporary 或 build output；违反时必须输出 `source-integrity.local-source-self-reference` 并阻止写入。Tarball/offline bundle 至少必须记录包文件 artifact hash；解包后的 canonical source tree hash 可作为 expected installed state 输入，但不得与 artifact `contentHash` 混用。
- NFR13b-2: Source staging、临时解包目录、package-manager cache path 和临时 Git checkout path 是 private implementation state，不得进入 public JSON、manifest/index、files index、fixture snapshot 或 `ValidationIssue.details`。受控成功或失败结束后，本次操作创建的 staging、解包和临时 Git checkout 路径必须已被移除；不存在这些 operation-owned 临时路径为 cleanup pass。仍有残留时必须输出 owning taxonomy 定义的稳定 cleanup failure diagnostic，且只能使用 redacted component，不得泄露 private path；共享 package-manager cache 不属于 operation-owned cleanup。进程崩溃产生的残留不属于 installed-state validation 范围。
- NFR13c: `integrityEvidence[].verified === false` 只能表示 evidence 可复现但未被 expected hash 或 lock match 背书，并且只能对应 `sourceDescriptor.trustStatus === "unverified"`。hash mismatch、lock mismatch 或 evidence 校验失败必须输出 `source-integrity` error，将 source 标记为 `blocked` 并阻止写入。
- NFR13d: `source-integrity` 与 `file-integrity` 必须是不同 issue category。source resolver/install planning 阶段的来源证据、registry/proxy/authentication failure、unreadable tarball/offline bundle 或 Post-MVP source policy 问题必须使用 `source-integrity`；已安装文件、manifest files index 或 IDE mirror hash mismatch 必须使用 `file-integrity` 或更具体的 `ide-mirror` category。
- NFR13e: Source descriptor 字段与语义以 `_bmad-output/planning-artifacts/specs/02-source-descriptor-contract.md` 为准。PRD、Architecture、Manifest/index 和 CommandResult 中的 source descriptor 描述只作为摘要或投影，不得各自定义 trust/evidence 规则。
- NFR14: human-owned custom 文件、workflow-owned 产物和发生 drift 的 IDE mirror 文件不得被 install 或 update 静默覆盖；覆盖保护通过 ownership manifest、路径规则和 hash comparison 共同判断。
- NFR14a: 阶段 artifact root 演进必须采用兼容演进策略：fresh install 使用新字段与新默认路径；existing install 继续以已有 `planning_artifacts`、`implementation_artifacts`、`devops_artifacts`、`project_knowledge` 配置为权威；缺少新字段时，`brainstorming_artifacts` fallback 到旧 `{output_folder}/brainstorming`，`analysis_artifacts` 与 `solutioning_artifacts` fallback 到既有 `{planning_artifacts}`。普通 install/update/repair 不得静默移动、重命名或重写 workflow-owned artifacts；显式 artifact migration 属于独立后续能力。
- NFR15: 对遗留入口或 stale entries 的处理必须默认提供 path、risk category、suggested manual action 和 verification command，不应在未确认的情况下删除用户目录中的文件。
- NFR16: validate 报告和 JSON payload 不得泄露 home directory 以外的无关本机路径、环境变量值或认证信息；路径展示应使用 project-relative POSIX path，只有项目外诊断场景可使用明确标记的 redacted absolute path。
- NFR17: installer 生成的脚本和配置文件必须在 manifest 中记录 generator、source version、content hash 和 ownership，便于用户审查其由 SpecLite 安装器生成。
- NFR17a: Manifest/index schema、skill/help/files index、minimum phase coverage matrix、canonical target ordering、package-level hash 与 file-level hash 的职责分离必须遵守 `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md`。Canonical skill package hash 用于跨 IDE mirror 一致性；files index 的 file-level hash 用于 drift detection、update planning、repair planning、changed paths、skipped paths 和 conflicts。File hash 基于 raw bytes；line ending、executable bit、file mode、symlink handling 和 case conflict 是独立 validation dimensions。Runtime scripts 与 generated scripts 必须在 files index 中记录 `executable`。
- NFR17b: Canonical source text files 必须使用 LF。Installer 不得按平台改写 canonical text line endings；如果必须生成平台专用脚本，必须作为独立 generated file 记录自己的 files index entry 和 raw-byte hash。`executable` 表示 POSIX executable intent；Windows 不要求 POSIX chmod 语义，但仍保留该字段用于脚本生成意图和跨平台 fixture。
- NFR18: MVP 必须支持 macOS 13+ 和 Windows 11 的核心安装、状态检查、验证和更新路径；不满足平台要求时必须输出 `environment.unsupported-platform` 诊断。
- NFR19: 所有 manifest、index、hash、validate 报告、IDE target 记录、`CommandResult.data` path fields、`issues[].affectedPath` 和 plan action affected paths 必须使用 project-relative POSIX-style path；相同 project root 与相同输入路径必须在所有 public projections 中产生一致的 normalized path value。
- NFR20: 系统必须通过跨平台 fixture 覆盖路径分隔符、LF/CRLF、可执行权限、大小写敏感路径冲突、symlink escape、path escape 和 shell invocation 差异；写入前必须阻断 symlink/path escape、case conflict 和 unsafe overwrite。
- NFR21: Node.js MVP 运行时版本要求必须在安装前检查；`package.json engines.node` 必须表达 Node 22 minimum（`>=22`），CLI preflight 必须在读取或写入项目文件前校验 detected version。不满足要求时必须输出 `environment.unsupported-node`，并包含 detected version、required range 和安装前置建议。Node 22 和 Node 24 必须进入 fixture/release matrix；Node 24-only API 不得进入 MVP，除非提供 Node 22 兼容路径或更新 runtime policy。
- NFR22: bundled source、npm public registry、private registry、local tarball、offline bundle、Git source 和 local source 的安装入口必须最终归一为包含 source type、resolved root、version、integrity evidence 和 trust status 的 source descriptor。完整 source lockfile 生成、刷新、轮转和迁移属于 Post-MVP；MVP 只消费 packaging manifest / package hash / lock evidence、expected hash、version-lock、registry integrity、content hash、snapshot hash 或 Git commit SHA 作为最小 trust evidence。
- NFR23: 不同 AI IDE 的平台差异必须限制在 adapter 配置、target directory metadata 和 Post-MVP command pointer artifact 中；MVP 不生成 command pointer artifact，canonical skill package 内容 hash 不得因 IDE target 不同而变化。MVP target id 必须表示物理 execution target：`claude` 对应 `.claude/skills`，`agents` 对应 `.agents/skills`；GitHub Copilot/Cursor 在 MVP 中只能通过 `agents` target 表示，不能伪造专用 target id，也不得在 human-readable output 中把 `agents` 渲染为 branded Copilot/Cursor readiness。
- NFR24: 每个 AI IDE adapter 必须声明 id、target directory、supported entry types、shared target policy、known limitations、validation checks 和 canonical target order。Adapter registry 字段与状态语义必须遵守 `_bmad-output/planning-artifacts/specs/05-ide-adapter-registry-contract.md`。MVP adapter schema 可以声明 `commandPointerBehavior: "none" | "unsupported"`，但不得生成 command pointer artifact。Manifest generation、`CommandResult.data.ideTargets`、`validate.data.checkedTargets` 和 fixture snapshots 必须复用 adapter registry 的 canonical target order，不得使用 glob、filesystem、user selection 或 async completion order。
- NFR24a: Target status 词汇必须按层区分。Install planning 使用 `planned`、`unsupported`、`failed`；installed phase coverage 使用 `mapped`、`unsupported`、`failed`；status summary 使用 `not-configured`、`configured`、`partial`、`failed`。同名 literal 可以出现在不同层，但必须由 layer-scoped type 解释，不能跨层复用含义。用户显式选择的 target 若 unsupported 必须成为 blocking error；未选择或可选 target 的 unsupported 可作为 warning、info 或 known limitation。
- NFR25: IDE mirror 生成结果必须能被 validate 反向检查，确认 skill 数量、canonical id、relative path、content hash 和 source reference 一致。
- NFR25a: IDE mirror drift 必须产生稳定 issue id、category、severity 和 affected path；MVP 只有 `speclite update --repair` 可以显式触发 repair 行为并被 fixture 验证，普通 `update` 的用户确认或 `--yes` 不得修复 drift，`speclite sync` 保持 Post-MVP。
- NFR25b: installer-owned drift repair 必须覆盖 `_speclite` metadata/control hub 与 IDE execution plane 中的 installer-owned files，并通过 fixture 验证 human-owned 与 workflow-owned 内容保持不变。
- NFR25c: repair plan 输出必须稳定、可诊断、可测试；相同 drift 状态下 repeated repair planning 应产生相同 affected path、hash 和 action 集合。
- NFR26: 系统必须用 not-configured、configured、partial、failed 4 类状态报告每个 IDE target，并为 partial/failed 输出原因和 affected path。
- NFR27: 新增 IDE adapter 不应要求修改 canonical skill 内容；adapter 测试必须证明 canonical skill package hash 在新增前后不变。
- NFR28: manifest/index、help catalog 和 menu target 之间必须保持可验证的一致关系：MVP 中每个 menu target 必须能解析到唯一 installed self-contained skill entry；command pointer target 保持 Post-MVP。
- NFR28a: Source 侧以 `assets/source/speclite/` 下的 module metadata 与 source skill package 作为 canonical truth；installed 侧以 manifest/index 作为已安装投影。Help index 只能引用 `canonicalSkillId`、phase、entry label 和 activation target，不得定义第二套 skill identity、alias-only identity 或 IDE-specific skill identity。
- NFR28b: Configured workflow artifact root 和 `artifactContract.defaultOutputPath` 必须是 project-relative POSIX path，并且解析后位于 target project boundary 内；symlink/path escape 必须报告 `artifact-path.escapes-project` 或 `artifact-path.symlink-escape`，不得把 escaped absolute path 写入 public JSON、manifest/index 或 fixture snapshot。
- NFR29: shared scripts、module directories、configuration 和 help catalog 的安装结果必须能在 ready summary 和 validate 中以 installed/missing/mismatched 状态检查。
- NFR30: 所有核心命令必须输出 success、warning 或 failure 状态；每个状态必须包含 command、target project、summary 和 next action。`failure` 必须对应非 0 exit code；`success` 和 `warning` 必须对应 0 exit code。
- NFR31: 错误信息必须包含 issue id、category、severity、affected path 或 component、impact 和 suggested next step。
- NFR32: environment guard、stale legacy entries、legacy namespace residue、runtime path 错误、manifest/schema 错误、source integrity 错误、installed file integrity 错误、operation lock 错误、update/repair planning blocker 和 IDE mirror 漂移必须以不同 issue category 呈现，并在 validate summary 或 command-level issue 输出中分别计数或呈现。
- NFR32a: `ValidationIssue.category`、issue id 边界、默认 severity 指引和 validation fixture ownership 由 `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md` 作为 canonical taxonomy 管理。新增 issue category 必须先更新该 SPEC；新增 issue id 必须在同一变更中补 fixture assertion。
- NFR32b: `manifest-schema.migration-needed` 是 MVP 保留 issue id，用于旧版或不兼容 manifest/index schema 需要迁移时的诊断；不得用自由文本 issue id 表示 schema migration。
- NFR32c: `manifest-schema.migration-needed` 的 `details` 至少必须包含 `currentSchemaVersion`、`supportedSchemaVersion`、`migrationKind` 和 `manualActionRequired`，且不得包含 absolute path、timestamp、stack trace 或环境相关文本。MVP producers 只能输出 `migrationKind: "manual"` 或 `"unsupported"`；`"automated-available"` 只作为 Post-MVP migration tooling 的 forward-compatible enum value。
- NFR32d: 每个 MVP issue category 必须在 taxonomy SPEC 中预留最小 issue id baseline。实现不得发明自由文本 issue id；新增 issue id 必须先更新 taxonomy，并在同一变更中补 fixture assertion。
- NFR32e: 企业 source 失败必须使用稳定 source-integrity issue id，包括 registry unreachable、authentication required、offline bundle unreadable 和 tarball unreadable；credentials 和 credential-bearing URLs 必须 redacted。
- NFR32f: Write-capable command 出现 `operation-lock.project-locked` 必须为 `failure` 且非 0 exit code；`validate` 发现 stale lock 时可以输出 `operation-lock.stale-lock` warning，不阻断。
- NFR32g: `update.conflicts` 是 command-level update/repair planning blocker，category 必须为 `update`，severity 必须为 `error`；逐路径冲突只放在 `data.conflicts`，不得复制成多个 issues。
- NFR33: `status` 只提供 source/channel/version、IDE target coverage、manifest presence、required path presence 和 high-level health；`status` 不提供 full validation category coverage，也不证明 installation healthy。安装健康断言必须读取 `status.data.highLevelHealth`；逐项 issue id、category、severity、affected path 和修复建议属于 `validate`。
- NFR34: 安装完成摘要必须展示安装位置、已安装模块、已配置 AI IDE、关键目录、manifest version、source descriptor 和下一步使用建议。
- NFR35: MVP 的机器可读输出必须与人类可读输出共享同一 issue model；同一检查结果的 issue id、category、severity 和 affected path 必须一致。
- NFR35a: `--json` 输出必须保持 deterministic schema；相同安装状态和命令参数下，除明确允许的 timestamp 字段外，`CommandResult.schemaVersion`、`CommandResult`、`ValidationIssue` 和 command-specific `data` 的语义内容必须一致。详细 deterministic comparison policy 以 `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md` 为准。
- NFR35a-schema: `CommandResult.schemaVersion` 必须作为真实兼容性边界使用。`speclite.command-result.v1` 内不得删除字段、重命名字段、改变既有字段语义、收窄枚举、做字段类型不兼容改变或新增必填字段；这些变更必须发布为新的 schema version。
- NFR35a-0: `CommandResult.command` 必须可跨 shell、参数顺序和命令别名稳定比较；`--json`、`--yes`、`--project-root`、source 参数和其他 flags 不得影响 command ID。`update --repair` 的 command ID 必须为 `update.repair`。
- NFR35a-1: `CommandResult.targetProject` 必须可跨不同 checkout root 稳定比较；同一 trim 后非空的 project config 项目名称应产生相同 targetProject，缺失、空字符串或纯空白项目名称时同一目录 basename 应产生相同 targetProject；MVP 不得通过 slugify、字符集限制或长度改写改变该显示标识。
- NFR35b: human-readable output、`--json` output、exit code 和 fixture assertions 必须从同一 `CommandResult.status` 推导；不得出现 JSON 为 `success` 但 exit code 非 0，或存在 error/critical issue 但 exit code 为 0 的情况。
- NFR35b-1: `status.data.highLevelHealth` 不得与 `CommandResult.status` 互相推导。`CommandResult.status` 表示命令结果；`highLevelHealth` 表示安装健康摘要。命令成功读取到 `not-configured`、`partial` 或 `failed` 安装状态时，`CommandResult.status` 仍可为 `success`，exit code 仍应为 0。
- NFR35b-2: `status.data.highLevelHealth === "not-configured"` 是合法未安装状态，不是命令失败。`status` 成功判断该状态时必须返回 `CommandResult.status: "success"`，exit code 0，并在 `nextActions` 中建议运行 `speclite install`。
- NFR35b-3: `status.data.highLevelHealth === "partial"` 或 `"failed"` 不得自动生成 warning issue，也不得自动把 `CommandResult.status` 推导为 `warning`。`status` 必须优先通过 `summary`、`highLevelHealth` 和 `nextActions` 表达轻量摘要；只有轻量读取过程本身发现明确 warning 条件时，才产生 warning issue。
- NFR35b-4: `speclite status --json` 必须允许 `issues: []`；空 issues 只表示本次轻量 status 命令无命令级 warning/error/critical issue，不得作为安装健康通过的证明。安装健康断言必须读取 `data.highLevelHealth`。
- NFR35b-5: MVP `status.data` 不得包含 `issueCounts`；`issueCounts` 只属于 `validate.data`。fixture、CI 和自动化脚本不得要求 `status` 输出问题计数，也不得把 `status` 当成弱化版 `validate`。
- NFR35b-6: `validate.data.issueCounts` 必须固定包含 `info`、`warning`、`error` 和 `critical` 四个 key；计数为 0 的 severity 也不得省略。fixture、CI 和自动化脚本可以依赖该固定 key set。
- NFR35b-7: `validate.data.checkedCategories` 必须按 canonical issue category order 输出：`environment`、`manifest-schema`、`source-integrity`、`ide-mirror`、`runtime-path`、`menu-target`、`legacy-namespace`、`artifact-path`、`file-integrity`、`operation-lock`、`update`。部分执行时必须保留已执行类别的相对顺序，不得使用文件系统遍历、规则注册或对象 key 顺序作为输出顺序。
- NFR35b-8: `validate.data.checkedTargets` 和 command data 中的 `ideTargets` 必须按 manifest/adapter registry canonical target order 输出。部分执行时必须保留已执行 targets 的相对顺序，不得使用 glob、文件系统、平台返回或 adapter 完成顺序作为输出顺序。
- NFR35b-9: `validate.data.validatedPaths` 必须先规范化为 project-relative POSIX path，再按字典序输出。不得使用 validation rule execution order、filesystem traversal order 或 issue discovery order 作为输出顺序。
- NFR35b-10: `CommandResult.issues` 必须按 severity order（`critical`、`error`、`warning`、`info`）、canonical issue category order、normalized affected path、issue id 依次排序。
- NFR35b-11: `CommandResult.nextActions` 必须按 command-specific priority order 输出：blocking remediation、recommended next step、optional exploration。同一 priority tier 内按命令定义的稳定顺序输出，不得按字母序或 reporter 拼接顺序重排。
- NFR35b-12: `CommandResult.summary` 必须使用 command-specific stable summary template，且该约束只适用于 `--json` output。JSON summary 不得包含 timestamp、absolute path、home directory、环境相关措辞、随机排序内容或未规范化路径；human-readable output 不受该模板限制。
- NFR35b-13: Human-readable output 可以更丰富，但不得成为自动化依赖的唯一承载位置；automation 需要的值必须进入 structured JSON 或 file contract。Human output 也必须遵守 credential、cache path、temporary extraction path、home directory 和 local absolute source path 的 redaction/display-safe 策略。
- NFR35b-14: Human-readable CLI message 必须通过 message catalog 渲染。默认 locale 为 `zh-CN`，`en-US` 作为 fallback；locale 变化不得改变 `CommandResult` JSON、exit code、issue ordering、path normalization、fixture stable JSON comparison 或 manifest/index 内容。
- NFR35c: command-specific `data` payload 不得使用未记录字段作为自动化依赖；新增、弃用或重命名 payload 字段必须通过 `CommandResult.schemaVersion` 和 fixture expected outputs 管理。
- NFR35d: JSON path fields 必须可跨 macOS/Windows 和不同 checkout root 稳定比较；fixture snapshots 不得依赖 absolute local path、OS-specific separators 或 home directory；`data.paths.projectRoot` 必须为 `"."`。
- NFR35e: `ValidationIssue.issueId` 必须可跨不同 affected path、IDE target、source name、hash 和运行次数稳定比较。Issue id 不得包含动态值；新增 validation rule 可以新增 issue id，但不得改变已有 issue id 的问题类型语义。
- NFR35f: `ValidationIssue.details` 必须可被 fixture snapshot 稳定比较，并不得泄露 absolute path、home directory、环境变量、认证信息、stack trace、raw exception object、timestamp、随机 id 或其它非确定性字段。
- NFR35g: `ValidationIssue.severity` 必须作为 `CommandResult.status` 和 exit code 的稳定输入；各 validation rule 不得自行重定义 severity 语义，不得用 warning 阻断命令，也不得在 error/critical issue 存在时输出 command success。
- NFR35h: `ValidationIssue.impact` 与 `ValidationIssue.suggestedNextStep` 必须使用 `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md` 定义的 bounded stable template 与 length policy，并可被 fixture snapshot 稳定比较；不得包含 path、IDE target、source name、timestamp、stack trace、hash、随机值或其他未由该 contract 允许的动态内容。
- NFR35i: public JSON timestamp 必须是显式例外而非默认能力；任何允许 timestamp 的字段必须在 schema 中声明，并从 stable fixture snapshot comparison 中排除。
- NFR35j: public JSON arrays 不得依赖 filesystem traversal、object insertion、rule execution、adapter completion 或 async completion order。`changedPaths`、`skippedPaths`、`conflicts`、`completedSteps`、`pendingSteps`、`installedModules` 等数组必须在 schema 中声明排序规则。
- NFR36: 新增 IDE adapter 后，在相同 source、配置和既有 target 输入下，source discovery 结果、既有 target 的 installed projections、canonical skill package hash 和 validation 结果必须保持不变；新增 adapter 必须通过 isolation fixture，证明其新增 target projection 不改变既有 adapter 的 observable behavior。
- NFR37: 新增官方模块后，既有模块在 discovery、selection、install、status、validate 和 update 中的 observable behavior、identity 与 installed projection 必须保持兼容；除新增模块对应的预期记录外，既有模块的 manifest/index entries 和 fixture expected results 不得改变。新增模块必须通过 module compatibility fixture 后才能进入官方安装集合。
- NFR38: 新增验证规则不得改变已有 issue id、category、severity 字段含义；需要新增字段时必须通过 schema version 扩展。
- NFR39: 对相同有效 config/customization layers、project root 和 customization lookup key，`speclite resolve`、installed skills 与 IDE adapters 必须获得语义一致的 resolved result、precedence、warning 和 failure outcome；任何 consumer 都不得产生与 `_bmad-output/planning-artifacts/specs/06-resolve-command-contract.md` 不一致的合并结果或诊断。
- NFR40: fixture project 应作为维护者验证 installer 行为的基础资产；每个新增安装能力必须同步新增或更新 fixture case、expected output 和 validation assertion。
- NFR40a: MVP release gate fixtures 必须在 Node 22 和 Node 24 上通过，并包含 macOS 与 Windows path-portability 证据。Windows fixture 不要求 POSIX chmod，但必须验证 files index 中的 `executable` intent 和受支持的脚本入口可用性。
- NFR40b: MVP release gate fixtures 必须包含最小 `skill-artifact-loop`，覆盖 installed IDE entry discovery、activation protocol、resolver access 和 artifact metadata 值域；多 skill、复杂 workflow 质量和人工评审结论属于 regression assets 或 Post-MVP validation。
- NFR40c: `source-integrity` release gate 必须拆为稳定 sub-cases，至少覆盖 `bundled-packaging-trusted`、`bundled-packaging-missing-evidence-blocked`、`registry-lock-trusted`、`registry-unverified`、`git-floating-blocked`、`local-source-snapshot-unverified`、`local-source-path-redacted`、`local-source-installed-state-blocked`、`artifact-hash-mismatch-blocked` 和 `source-unreadable-blocked`。
- NFR40d: Release packaging acceptance 必须作为 release checklist gate 生成 packaging manifest，验证 npm package、local tarball 和 offline bundle 包含 executable CLI runtime entry、`package.json` bin mapping、`assets/source/speclite/`、installer/runtime schemas、runtime scripts/templates 和安装执行所需 runtime assets；`test/fixtures/` 与 root `fixtures/` 默认不得进入 package，除非明确标记为 packaged documentation example。Packaging acceptance 不一定是 fixture project case，但必须有 stable artifact、expected assertions 和 CI/release evidence。
- NFR40e: Install interaction fixture / CLI smoke 必须覆盖默认中文 human-readable 输出、英文 locale fallback、prompt/summary 分离、`install --yes` no-prompt flow、`install --interactive --yes` 或等价显式交互入口、`NO_COLOR` / non-TTY / CI 无 ANSI 输出，以及 `install --json --yes` 无交互稳定输出。
- NFR40f: Artifact topology 变更必须由 fresh-install 与 existing-install-update fixtures 共同验证：新安装生成所有新 root/subdirectory 与新 config fields；旧配置缺少新 fields 时仍可解析旧 whole/sharded planning documents、旧 `sprint-status.story_location` 和既有 workflow artifacts；手工只改 config path 而未迁移 artifacts 时必须产生可诊断结果，不得误报迁移完成。

**Total NFR Labels（NFR 标签总数）：** 101（100 条 canonical NFR，另含补充 schema 兼容性边界 `NFR35a-schema`）

### Additional Requirements（额外要求）

- **MVP boundary：** `FR72`–`FR78` 明确属于 Post-MVP backlog，不进入本次 MVP implementation readiness 或 release gate。
- **Artifact topology：** fresh install 必须生成阶段化 artifact roots；existing install 的显式配置继续权威，缺失新增字段时采用 `legacy-compatible` fallback，普通 install/update/repair 不得自动迁移 workflow artifacts。
- **Canonical ownership：** PRD 负责产品需求与验收意图；详细 schema、路径、排序、taxonomy、fixture comparison 和 lifecycle 规则由对应 owning SPEC 管理，发生冲突时以 owning SPEC 为准。
- **Write safety：** write-capable commands 必须 plan-before-write、显式授权、保护 human-owned/workflow-owned 内容，并对 conflict、operation lock、partial failure 提供稳定诊断。
- **Determinism：** public JSON、paths、issues、arrays、fixture snapshots 与 validation results 必须遵守稳定排序、project-relative POSIX path、redaction 和可重复比较约束。
- **Platform/runtime：** MVP 目标为 macOS 13+、Windows 11、Node.js 22 minimum，并要求 Node 22/24 release matrix 与跨平台 path-portability evidence。
- **Evidence gates：** readiness 不能只依赖文档声明；fixture expected tree、manifest/index snapshots、CLI assertions、artifact metadata、packaging evidence、performance evidence 和 release-gate fixtures 共同构成验收证据。

### PRD Completeness Assessment（PRD 完整性初评）

PRD 的需求编号、分层边界、owner contract、MVP/Post-MVP 范围以及可验证 evidence 类型表达充分。当前抽取结果为 106/106 FR、101/101 NFR labels，未发现重复 ID。Epic 11 readiness 的关键后续检查是：Epic/Story 是否完整覆盖与其相关的 artifact topology、canonical skill rename、CR artifact root、grill inventory、fixture/release evidence 和 strict-serial dependency；且 downstream 文本不得重新定义 owning SPEC。


## Epic Coverage Validation（Epic 覆盖验证）

### Coverage Matrix（覆盖矩阵）

| FR Number | PRD Requirement | Epic / Story Coverage | Status |
| --- | --- | --- | --- |
| FR1 | 项目维护者可以指定 SpecLite 安装目录。 | Epic 1 / Story 1.2 | ✓ Covered |
| FR2 | 系统可以解析并展示最终安装路径。 | Epic 1 / Story 1.2<br>Epic 10 / Story 10.1 | ✓ Covered |
| FR3 | 系统可以检查安装目录是否存在、是否为空、是否已有 SpecLite 安装内容。 | Epic 1 / Story 1.2<br>Epic 10 / Story 10.1<br>Epic 10 / Story 10.3<br>Epic 10 / Story 10.4<br>Epic 10 / Story 10.6 | ✓ Covered |
| FR4 | 项目维护者可以确认是否安装到解析后的目录。 | Epic 1 / Story 1.2 | ✓ Covered |
| FR5 | 项目维护者可以选择要安装的官方 SpecLite 模块或能力包。 | Epic 1 / Story 1.3 | ✓ Covered |
| FR6 | 系统可以检查并展示可安装模块的版本信息。 | Epic 1 / Story 1.3 | ✓ Covered |
| FR7 | 系统可以展示用户已选择的模块、版本和安装摘要。 | Epic 1 / Story 1.3 | ✓ Covered |
| FR8 | 项目维护者可以选择是否从自定义来源安装 SpecLite。 | Epic 5 / Story 5.1 | ✓ Covered |
| FR9 | 项目维护者可以从 Git source 或 local path 安装或验证 SpecLite source；local path 不得指向目标项目中的 installed state、IDE mirrors、workflow output、dependency/cache/build 目录。 | Epic 5 / Story 5.3<br>Epic 5 / Story 5.4 | ✓ Covered |
| FR10 | 项目维护者可以选择要集成的 AI IDE 目标。 | Epic 1 / Story 1.5 | ✓ Covered |
| FR11 | 系统可以展示每个目标 AI IDE 的配置结果。 | Epic 1 / Story 1.5 | ✓ Covered |
| FR12 | 系统可以为目标项目创建 SpecLite 项目级运行元数据结构。 | Epic 1 / Story 1.5 | ✓ Covered |
| FR13 | 系统可以为目标项目创建 SpecLite 过程产物输出结构。 | Epic 1 / Story 1.5 | ✓ Covered |
| FR13a | Fresh install 必须在 `_speclite-output/` 下预创建阶段对齐的一级 artifact roots：`0-brainstorming-artifacts/`、`1-analysis-artifacts/`、`2-planning-artifacts/`、`3-solutioning-artifacts/`、`4-implementation-artifacts/`、`5-devops-artifacts/`；workflow 产生的 project knowledge 默认位于 `_speclite-output/project-knowledge-base/`，目标项目 `docs/` 保持 Primary Public Document（主要公开文档）定位。 | Epic 11 / Story 11.1<br>Epic 11 / Story 11.2<br>Epic 11 / Story 11.3 | ✓ Covered |
| FR14 | 系统可以发现正式可分发的 SpecLite source skills；MVP 默认官方安装集合必须递归发现 `core-skills/` 与 `sdlc-skills/` 下全部包含 `SKILL.md` 的 canonical package roots，并排除 `support-skills/`、已删除入口和非正式分发辅助来源。 | Epic 1 / Story 1.3<br>Epic 1 / Story 1.5 | ✓ Covered |
| FR15 | 系统可以将同一 canonical skill 暴露到多个目标 AI IDE；对于被选中模块下的每个 canonical package root，MVP 必须在每个已选择且支持的 IDE target 中生成 self-contained skill entry，并在 skill index / files index 中记录 source reference 与 hash。 | Epic 1 / Story 1.5 | ✓ Covered |
| FR16 | 项目维护者可以查看安装完成后的项目结构和安装摘要。 | Epic 1 / Story 1.6 | ✓ Covered |
| FR17 | 项目维护者可以查看安装完成后的下一步使用指引。 | Epic 1 / Story 1.6 | ✓ Covered |
| FR17a | 首次安装的 human-readable CLI 输出必须使用分阶段 block 呈现模块选择、配置模式、写入计划确认、写入进度和 Ready Summary；日志、摘要、提示和用户输入必须在视觉上分离，不得把长段 summary 与 prompt 拼接到同一个输入问题中。 | Epic 1 / Story 1.7 | ✓ Covered |
| FR18 | 安装器可以生成 IDE-specific discovery metadata，列出研发阶段、canonical skill id、skill 名称、目标 IDE entry path 和激活 target。Manifest、skill index、help index、files index 与最小阶段覆盖矩阵的字段、版本、hash 和 ownership 规则由 `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md` 作为 canonical contract 管理；IDE adapter id、target id、target order、capability 与 status 语义由 `_bmad-output/planning-artifacts/specs/05-ide-adapter-registry-contract.md` 管理。 | Epic 2 / Story 2.1<br>Epic 10 / Story 10.1<br>Epic 10 / Story 10.2<br>Epic 10 / Story 10.3<br>Epic 10 / Story 10.4<br>Epic 10 / Story 10.5<br>Epic 10 / Story 10.6 | ✓ Covered |
| FR19 | MVP 中每个 IDE adapter 必须把 discovery metadata 映射为该 IDE target directory 中的 self-contained skill entry，并报告 mapped、unsupported 或 failed 状态。Adapter schema 可以声明 `commandPointerBehavior: "none" \| "unsupported"` 作为 Post-MVP 扩展位，但 MVP 不生成 command pointer artifact。 | Epic 2 / Story 2.2<br>Epic 9 / Story 9.3<br>Epic 10 / Story 10.1<br>Epic 10 / Story 10.3<br>Epic 10 / Story 10.4<br>Epic 10 / Story 10.5 | ✓ Covered |
| FR20 | AI IDE 使用者可以通过已映射的 IDE entry 选择并激活 SpecLite skill。 | Epic 2 / Story 2.3<br>Epic 9 / Story 9.3<br>Epic 10 / Story 10.1<br>Epic 10 / Story 10.3<br>Epic 10 / Story 10.4<br>Epic 10 / Story 10.5 | ✓ Covered |
| FR21 | AI IDE 使用者可以调用 SPEC、方案评审、故事规划、实现、测试和审查相关能力；每项能力必须映射到至少一个 canonical skill id。 | Epic 2 / Story 2.3 | ✓ Covered |
| FR22 | 已激活的 skill 可以读取项目级配置、customization 覆盖和相关上下文。 | Epic 2 / Story 2.4 | ✓ Covered |
| FR23 | 已激活的 workflow 可以将产物输出到配置约定的位置，并在产物中记录 workflow type、source skill 和生成时间。MVP artifact contract 至少校验 artifact type、默认输出路径、configured artifact root、`workflowType`、`sourceSkill` 和 `generatedAt` 元数据字段；artifact root 和默认输出路径必须是 project-relative POSIX path 且位于 target project boundary 内，产物内容质量不进入 MVP validation。 | Epic 2 / Story 2.5 | ✓ Covered |
| FR23a | Artifact metadata 的 MVP 校验必须覆盖最小值域：`workflowType` 必须是非空稳定字符串，`sourceSkill` 必须是非空 canonical skill id，`generatedAt` 必须存在且是 ISO 8601 string，且默认在 stable fixture snapshot comparison 中 normalize 或 exclude。 | Epic 2 / Story 2.5 | ✓ Covered |
| FR23b | 1-analysis 阶段的 domain、market、technical research 必须写入 `{analysis_artifacts}/research/`；product brief 必须写入 `{analysis_artifacts}/product-brief/`；PRFAQ 必须写入 `{analysis_artifacts}/prfaq/`。这些 research skills 不是 `{project_knowledge}` 的产生者。 | Epic 11 / Story 11.4 | ✓ Covered |
| FR23c | `{planning_artifacts}` 必须预创建 `epics/` 与 `prd/`；`{solutioning_artifacts}` 必须预创建 `architecture/`。PRD、Epics、Architecture 对应 workflow 的 whole documents 与 `shard-doc` 产生的 shards 必须在各自 phase-owned subject directory 内保持可发现、无 whole/sharded 双真源歧义；existing install 必须遵守 `SPEC 09` 的显式配置权威、`legacy-compatible` fallback 与 no-migration contract。 | Epic 11 / Story 11.5 | ✓ Covered |
| FR23d | `{planning_artifacts}` 必须预创建 `ux/`，承载 `ux-design-specification.md`、`ux-color-themes.html`、`ux-design-directions.html`；`design-system/` 子树仅在对应 workflow 首次需要时按需创建，UX workflow、discovery 与引用必须统一使用该 root。 | Epic 11 / Story 11.6 | ✓ Covered |
| FR23e | `speclite-validate-prd` 的报告文件名必须固定为 `prd-validate-report-{yyyy-MM-dd}.md`，并写入 `{planning_artifacts}/prd/`；existing install 中的旧名称报告必须保持原位且可作为历史 evidence 被发现，install、update 或 repair 不得自动重命名、迁移、覆盖或删除。 | Epic 11 / Story 11.7 | ✓ Covered |
| FR23f | SpecLite 方法论维护者必须将 Canonical skill `speclite-ir-grill-consistency-reviewer` 更名为 `speclite-implementation-readiness-grill-consistency-reviewer`，将 `speclite-check-implementation-readiness` 更名为 `speclite-implementation-readiness-check`，并将两者的输出统一置于 `{solutioning_artifacts}/implementation-readiness-report/grill-consistency/`；readiness report 文件名保持 `implementation-readiness-report-{yyyy-MM-dd}.md`。SpecLite 方法论维护者必须同步更新 package、help、manifest、activation、cross-skill 与 docs references。Canonical metadata 必须维护旧 ID 到新 ID 的 rename mapping，不得生成 alias package/help/phase row；fresh install 只投影新 canonical ID，existing install 的 update 必须显式展示 rename/reprojection，并保护发生 drift 的旧 package。 | Epic 11 / Story 11.8 | ✓ Covered |
| FR23g | Epic Story code-review orchestrator 及 reviewer/evaluator/fixer/finalizer 相关 workflows 必须把每个 Story 的 CR artifact root 规范为 `{story-id}-code-review/`，其中 `story-id` 使用 `x-x` 形式；不得再把 Story title/name 拼入目录名。既有 title-bearing CR 目录不得被自动迁移、重命名或删除；恢复 legacy-only 未完成 CR 时必须在一个目录内完成，canonical 与 legacy 目录并存且无法唯一判断当前轮次时必须停止并报告稳定冲突诊断。 | Epic 11 / Story 11.9 | ✓ Covered |
| FR24 | 企业规范负责人可以查看 MVP 最小阶段覆盖矩阵，确认 SPEC、方案评审、故事规划、实现、测试和审查阶段是否存在 mapped skill entry、对应 canonical skill id、以及目标 IDE target 是否可见。MVP 阶段覆盖矩阵来自 manifest、help index 和 installed skill entries，最小字段必须覆盖 `phaseId`、`phaseLabel`、`moduleId`、`canonicalSkillId`、`ideTargets[].targetId`、`ideTargets[].entryPath`、`ideTargets[].activationTarget`、`ideTargets[].status` 和可选 `artifactContract`；不提供覆盖率百分比、趋势、团队汇总或治理 dashboard。 | Epic 2 / Story 2.1<br>Epic 2 / Story 2.3 | ✓ Covered |
| FR25 | 工具链维护者可以查看当前项目的 SpecLite 安装状态。 | Epic 3 / Story 3.1<br>Epic 8 / Story 8.4 | ✓ Covered |
| FR26 | 工具链维护者可以查看安装来源、版本和目标 IDE 覆盖情况。 | Epic 3 / Story 3.1<br>Epic 8 / Story 8.4 | ✓ Covered |
| FR27 | 工具链维护者可以验证 manifest、skill index、help index 和 files index 的有效性。 | Epic 3 / Story 3.2 | ✓ Covered |
| FR28 | 工具链维护者可以验证 manifest 中记录的所有已选择且支持的 IDE target mirrors 是否与 canonical source 一致。 | Epic 3 / Story 3.3 | ✓ Covered |
| FR28a | 当 IDE mirror 中的 canonical skill package 文件偏离 manifest 记录的 canonical package hash 时，`validate` 必须报告 `ide-mirror` 或 `file-integrity` error，但不得自动修复。 | Epic 3 / Story 3.3 | ✓ Covered |
| FR29 | 工具链维护者可以检测缺失的菜单目标或不可激活的 skill。 | Epic 3 / Story 3.2<br>Epic 3 / Story 3.4 | ✓ Covered |
| FR30 | 工具链维护者可以检测错误 runtime path、legacy namespace residue 和产物路径问题。 | Epic 3 / Story 3.4 | ✓ Covered |
| FR31 | 工具链维护者可以检测旧版或遗留 AI IDE 入口。 | Epic 3 / Story 3.4 | ✓ Covered |
| FR32 | 系统可以在检测到遗留入口与当前 canonical skill id 或 IDE target 重叠时，提示重复加载、菜单冲突或能力漂移风险。 | Epic 3 / Story 3.4 | ✓ Covered |
| FR33 | 系统可以为遗留入口提供包含 path、risk category、manual action 和 verification command 的人工清理建议。 | Epic 3 / Story 3.4 | ✓ Covered |
| FR34 | 工具链维护者可以验证 shared scripts、module directories、configuration、help catalog 和 IDE mirrors 是否安装完成。 | Epic 3 / Story 3.2<br>Epic 3 / Story 3.3 | ✓ Covered |
| FR35 | 系统可以输出可诊断的验证结果，指出问题类型、影响范围和修复方向。 | Epic 3 / Story 3.5<br>Epic 3 / Story 3.6<br>Epic 8 / Story 8.4 | ✓ Covered |
| FR35a | MVP 面向用户的核心命令必须支持 `--json`，并使用统一 `CommandResult` envelope；详细字段、排序、路径、timestamp、schema evolution、status 推导、exit code 和 fixture comparison 契约以 `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md` 为准。 | Epic 1 / Story 1.1<br>Epic 3 / Story 3.5<br>Epic 3 / Story 3.6<br>Epic 8 / Story 8.1<br>Epic 8 / Story 8.4<br>Epic 8 / Story 8.8 | ✓ Covered |
| FR35b | `CommandResult` 中的 issues 必须复用同一 `ValidationIssue` model，并与 human-readable output、exit code 和 fixture assertions 保持一致；issue category、issue id 与默认 severity 语义以 `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md` 为准。 | Epic 1 / Story 1.1<br>Epic 3 / Story 3.5<br>Epic 3 / Story 3.6<br>Epic 8 / Story 8.1<br>Epic 8 / Story 8.4<br>Epic 8 / Story 8.6<br>Epic 8 / Story 8.8 | ✓ Covered |
| FR35c | PRD 不定义第二份 public JSON 字段真源。负责 public JSON contract 变更的 SpecLite 维护者在新增 public JSON 字段、reason code、redacted path 形状、排序规则或 command-specific payload 行为时，必须先更新 owning SPEC，再同步 executable schema/parser 和 fixture expected outputs。Reason code producer 只能输出 owning SPEC registry 中的 MVP codes；consumer/parser 必须容忍 unknown future codes，并保留其 stable display string。 | Epic 3 / Story 3.5<br>Epic 8 / Story 8.1 | ✓ Covered |
| FR36 | 项目维护者可以更新已安装的 SpecLite installer-owned 文件。 | Epic 4 / Story 4.3<br>Epic 4 / Story 4.6 | ✓ Covered |
| FR37 | 系统可以区分 installer-owned、human-owned 和 workflow-owned 文件。 | Epic 4 / Story 4.1<br>Epic 4 / Story 4.2 | ✓ Covered |
| FR38 | 系统可以在更新前识别本地文件是否被用户修改。 | Epic 4 / Story 4.3<br>Epic 4 / Story 4.5 | ✓ Covered |
| FR39 | 系统可以避免覆盖 human-owned custom 文件。 | Epic 4 / Story 4.1<br>Epic 4 / Story 4.2<br>Epic 4 / Story 4.5<br>Epic 4 / Story 4.6 | ✓ Covered |
| FR40 | 系统可以避免覆盖 workflow-owned 过程产物。 | Epic 4 / Story 4.1<br>Epic 4 / Story 4.5<br>Epic 4 / Story 4.6 | ✓ Covered |
| FR41 | 项目维护者可以看到 update 对安装内容、用户定制和过程产物的影响摘要，包括 planned effects、实际 changed/skipped paths 和 conflicts；public output 契约以 `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md` 为准。 | Epic 4 / Story 4.3<br>Epic 4 / Story 4.5<br>Epic 8 / Story 8.3<br>Epic 8 / Story 8.8 | ✓ Covered |
| FR41a | `update` 遇到 IDE mirror drift 或其他 installer-owned drift 时必须默认标记 conflict，不得静默覆盖；普通 `update` 的用户确认或 `--yes` 只授权无 conflict 的 planned update writes，不得恢复 drift。MVP 只有 `speclite update --repair` 才可恢复可安全 repair 的 canonical 内容，不新增顶级 `speclite repair` 命令，`speclite sync` 保持 Post-MVP。 | Epic 4 / Story 4.5 | ✓ Covered |
| FR41b | `speclite update --repair` 必须只修复可安全恢复或重建的 installer-owned drift，并继续保护 human-owned custom 文件和 workflow-owned artifacts；repair eligibility、missing source evidence、`expectedHash`、restore-canonical/regenerate、conflict projection 和 reason code producer/consumer 语义以 owning SPEC 为准。 | Epic 4 / Story 4.6 | ✓ Covered |
| FR41c | Install/update/repair 必须坚持 plan-before-write、显式写入授权、project operation lock、safe write、保守 stale lock 处理和 partial failure 可诊断性；具体 planning/write authorization 契约以 `_bmad-output/planning-artifacts/specs/03-install-plan-contract.md` 为准。MVP 不生成 standalone report artifact，不提供事务性 rollback、backup/restore、顶级 repair 或 sync。 | Epic 4 / Story 4.3<br>Epic 4 / Story 4.4<br>Epic 4 / Story 4.6<br>Epic 8 / Story 8.3<br>Epic 8 / Story 8.8 | ✓ Covered |
| FR42 | 项目维护者可以在安装过程中配置用户称呼或团队名称。 | Epic 1 / Story 1.4 | ✓ Covered |
| FR43 | 项目维护者可以在安装过程中配置项目名称。 | Epic 1 / Story 1.4 | ✓ Covered |
| FR44 | 项目维护者可以在安装过程中配置 AI agent 的交流语言。 | Epic 1 / Story 1.4 | ✓ Covered |
| FR45 | 项目维护者可以在安装过程中配置文档输出语言。 | Epic 1 / Story 1.4 | ✓ Covered |
| FR46 | 项目维护者可以在安装过程中配置过程产物输出目录。 | Epic 1 / Story 1.4 | ✓ Covered |
| FR47 | 项目维护者可以选择快速配置或详细配置模式。 | Epic 1 / Story 1.4 | ✓ Covered |
| FR47a | `speclite install --yes` 必须采用 module metadata、config contract 和 adapter registry 明确声明的 deterministic defaults，并仅授权 `_bmad-output/planning-artifacts/specs/03-install-plan-contract.md` 定义的无 conflict planned writes；该模式不得发起或等待 module selection、config mode、IDE target selection 或 final write confirmation 等交互输入。若必需值无法由 defaults 或显式 flags 解析，或 planning 产生 unsupported target、drift 或 conflict，命令必须在写入前失败，以非 0 exit code 和 owning SPEC registry 中的 stable issue id 报告原因；显式 flags 必须覆盖对应 default。需要人工选择时，用户必须显式进入 interactive mode，`--yes` 不得隐式切换为 interactive mode。 | Epic 1 / Story 1.7 | ✓ Covered |
| FR48 | 项目维护者可以使用项目级配置定义用户称呼、项目名称、交流语言、文档输出语言、产物路径、安装模块和 IDE targets。 | Epic 1 / Story 1.4 | ✓ Covered |
| FR49 | 用户可以通过定制化配置覆盖 skill workflow、agent persona、菜单项和输出路径默认值。 | Epic 2 / Story 2.4 | ✓ Covered |
| FR50 | 系统可以按 installer base、installer user、team custom、user custom 的优先级解析并合并配置。 | Epic 4 / Story 4.2 | ✓ Covered |
| FR51 | 系统可以通过 ownership manifest、路径规则和只读策略保留 human-owned 配置的人工维护边界。 | Epic 4 / Story 4.1<br>Epic 4 / Story 4.2 | ✓ Covered |
| FR51a | MVP 默认不修改 human-owned TOML，包括 `_speclite/custom/*.toml` 和 `_speclite/custom/*.user.toml`。所谓保守更新在 MVP 中只表示读取并保护；任何对 human-owned TOML 的写入都必须由未来显式命令或交互确认引入，并通过 ADR 记录。 | Epic 4 / Story 4.1<br>Epic 4 / Story 4.2 | ✓ Covered |
| FR51b | Fresh install 可以在目标路径不存在时按 create-if-absent 规则创建 human-owned TOML stub；MVP scope 仅限 project-level stubs：`_speclite/custom/config.toml` 与 `_speclite/custom/config.user.toml`。Ownership 规则由 Epic 4 / Story 4.1 验证，fresh-install 初始化由 Epic 1 / Story 1.4 执行。Fresh install 不默认创建 skill-specific `_speclite/custom/{skill}.toml` 或 `_speclite/custom/{skill}.user.toml`；如果任何 human-owned custom TOML 已存在，install/update/repair 不得覆盖、重写、重排或格式化。 | Epic 1 / Story 1.4<br>Epic 4 / Story 4.1 | ✓ Covered |
| FR52 | 系统可以让 skills 使用统一配置访问项目名称、用户偏好、输出路径和流程约定。 | Epic 2 / Story 2.4 | ✓ Covered |
| FR52a | 系统必须提供 `speclite resolve config` 与 `speclite resolve customization` 作为 MVP runtime support command，使已安装 skills 能通过稳定入口读取 config/customization，而不依赖 Python resolver 或内部构建路径。 | Epic 2 / Story 2.4<br>Epic 8 / Story 8.5<br>Epic 8 / Story 8.8<br>Epic 9 / Story 9.1<br>Epic 9 / Story 9.2<br>Epic 9 / Story 9.3 | ✓ Covered |
| FR52b | `speclite resolve` 必须保持 Python resolver parity，包括 stdout/stderr shape、exit code、missing key、repeated key、project-root fallback、required/optional layer failure、array merge、config/customization merge order 和 customization lookup key。详细契约以 `_bmad-output/planning-artifacts/specs/06-resolve-command-contract.md` 为准；PRD 与 Architecture 不重新定义第二份 resolve 字段真源。 | Epic 2 / Story 2.4<br>Epic 8 / Story 8.5<br>Epic 8 / Story 8.8<br>Epic 9 / Story 9.1<br>Epic 9 / Story 9.2 | ✓ Covered |
| FR52c | `resolve-parity` fixture 必须覆盖 config/customization resolver 兼容性，并随 resolver 行为变更同步更新 owning SPEC、parser/schema 和 expected outputs。 | Epic 2 / Story 2.4 | ✓ Covered |
| FR53 | 项目维护者可以从 npm public registry 安装 SpecLite。 | Epic 5 / Story 5.2 | ✓ Covered |
| FR54 | 项目维护者可以从 private registry 安装 SpecLite。 | Epic 5 / Story 5.2 | ✓ Covered |
| FR55 | 项目维护者可以从 local tarball 安装 SpecLite。 | Epic 5 / Story 5.3 | ✓ Covered |
| FR56 | 项目维护者可以从 offline bundle 安装 SpecLite。 | Epic 5 / Story 5.3 | ✓ Covered |
| FR57 | 项目维护者可以从 Git source 安装 SpecLite，并在 install/update 的 source resolution 阶段验证 Git source；写入前 Git source 必须解析到具体 commit SHA，只指定 remote URL、branch 或 tag 的浮动 Git source 不得进入 install planning。`speclite validate` 不负责访问 Git remote 或重新验证远程 freshness/provenance，只检查本地记录的 source descriptor、integrity evidence shape 和 hash baseline。 | Epic 5 / Story 5.4 | ✓ Covered |
| FR58 | 系统可以记录并展示安装来源、channel 和版本信息。 | Epic 5 / Story 5.1<br>Epic 5 / Story 5.2<br>Epic 5 / Story 5.3<br>Epic 5 / Story 5.4<br>Epic 5 / Story 5.5 | ✓ Covered |
| FR59 | 当安装来源不可用或不合法时，系统必须在写入前失败，并通过统一 `CommandResult` / `ValidationIssue` model 输出 stable issue id、category、severity、affected component、impact 和 suggested next step；command data 或 summary 中的 source facts 必须遵守 source descriptor 的 display-safe/redaction contract，human-readable output、`--json` output 与 exit code 必须由同一 issue/status 语义推导。各 source type 的 unavailable、invalid descriptor、integrity failure 和 unsupported case 必须由 owning SPEC registry 定义，并由 fixture assertions 验证。 | Epic 5 / Story 5.1<br>Epic 5 / Story 5.2<br>Epic 5 / Story 5.3<br>Epic 5 / Story 5.4<br>Epic 5 / Story 5.5 | ✓ Covered |
| FR60 | 系统可以在安装过程中展示 source discovery、manifest generation、IDE mirror creation、config initialization 和 ready check 的执行状态。 | Epic 1 / Story 1.1<br>Epic 1 / Story 1.6 | ✓ Covered |
| FR61 | 系统可以展示 shared scripts、module directories、configuration、help catalog 和 IDE integrations 的安装结果。 | Epic 1 / Story 1.5<br>Epic 1 / Story 1.6 | ✓ Covered |
| FR62 | 系统可以展示每个已配置 AI IDE 的 skill 数量和目标目录。 | Epic 1 / Story 1.6 | ✓ Covered |
| FR63 | 系统可以在安装完成后展示包含安装路径、manifest version、source descriptor、已安装模块、IDE targets、关键目录和下一步命令的 SpecLite ready summary。 | Epic 1 / Story 1.6 | ✓ Covered |
| FR63a | Ready summary 的 human-readable 输出可以包含解释性文案，但 automation 依赖必须进入 `install --json` 的 `InstallCommandData` 字段，例如 `sourceDescriptor`、`manifestVersion`、`installedModules`、`ideTargets`、`paths`、`completedSteps` 和 `pendingSteps`；MVP 不新增未契约化的 `readySummary` JSON blob。 | Epic 1 / Story 1.6<br>Epic 8 / Story 8.1<br>Epic 8 / Story 8.2<br>Epic 8 / Story 8.8<br>Epic 8 / Story 8.9<br>Epic 9 / Story 9.1<br>Epic 10 / Story 10.1<br>Epic 10 / Story 10.3<br>Epic 10 / Story 10.4<br>Epic 10 / Story 10.5<br>Epic 10 / Story 10.6 | ✓ Covered |
| FR63b | Human-readable install output 必须支持 CLI message catalog。MVP 默认 locale 为 `zh-CN`，并提供 `en-US` fallback；locale 可以通过 `--locale` 或 `SPECLITE_LOCALE` 显式指定。Message catalog 只翻译自然语言，不翻译 command name、flag、module id、target id、step id、path、schema id、issue id、reason code 或 JSON field。 | Epic 1 / Story 1.7<br>Epic 8 / Story 8.2<br>Epic 8 / Story 8.6 | ✓ Covered |
| FR64 | 系统可以在安装完成后展示用户下一步如何启动 AI agent 和调用帮助 skill。 | Epic 1 / Story 1.6 | ✓ Covered |
| FR65 | 系统可以在安装完成后展示安装位置、已安装模块和已配置工具清单。 | Epic 1 / Story 1.6 | ✓ Covered |
| FR65a | 安装写入前的 final review 必须以稳定顺序展示 target、source descriptor、config mode、selected modules、IDE targets、planned writes 和 pending phases，并明确说明当前是否已写入项目文件以及确认后将发生的写入阶段。 | Epic 1 / Story 1.7<br>Epic 8 / Story 8.2 | ✓ Covered |
| FR66 | SpecLite 维护者可以验证新增或修改的 source skill 是否可安装。 | Epic 6 / Story 6.1<br>Epic 6 / Story 6.3<br>Epic 6 / Story 6.4<br>Epic 6 / Story 6.6<br>Epic 6 / Story 6.7<br>Epic 6 / Story 6.8<br>Epic 8 / Story 8.7<br>Epic 9 / Story 9.3<br>Epic 10 / Story 10.1<br>Epic 10 / Story 10.2<br>Epic 10 / Story 10.3<br>Epic 10 / Story 10.4<br>Epic 10 / Story 10.5 | ✓ Covered |
| FR66a | SpecLite 维护者必须能够生成完整、可复查、只读的全 canonical Skill corpus `grill` 引用清单，逐项记录 skill id、引用文件、引用表达、目标 skill/path 与引用用途，用于更名和路由变更后的人工确认与负向残留检查；生成清单不得修改被盘点的 canonical Skill definitions。 | Epic 11 / Story 11.10 | ✓ Covered |
| FR67 | SpecLite 维护者可以使用 fixture project 复现 fresh install 流程。 | Epic 6 / Story 6.1<br>Epic 6 / Story 6.2<br>Epic 6 / Story 6.4<br>Epic 9 / Story 9.3<br>Epic 10 / Story 10.1<br>Epic 10 / Story 10.3<br>Epic 10 / Story 10.4<br>Epic 10 / Story 10.5 | ✓ Covered |
| FR68 | SpecLite 维护者可以使用 fixture project 验证安装前后目录变化。 | Epic 6 / Story 6.1<br>Epic 6 / Story 6.2<br>Epic 6 / Story 6.4 | ✓ Covered |
| FR69 | SpecLite 维护者可以使用 fixture project 验证 status、validate 和 update 行为。 | Epic 6 / Story 6.1<br>Epic 6 / Story 6.2<br>Epic 6 / Story 6.3<br>Epic 6 / Story 6.4<br>Epic 6 / Story 6.6<br>Epic 6 / Story 6.8<br>Epic 8 / Story 8.7<br>Epic 10 / Story 10.5 | ✓ Covered |
| FR70 | SpecLite 维护者可以验证至少一个 skill 从 IDE 发现到产物输出的最小闭环。 | Epic 6 / Story 6.5 | ✓ Covered |
| FR71 | MVP 文档必须提供 fresh install、安装前后目录树、manifest/index、status/validate output 和 update protection 五类可执行示例；每类示例必须包含前置条件、命令或操作、expected artifact/output 与 verification step，并通过 docs link/reference check 及对应 fixture/CLI assertions 验证示例中的 command、path、field 与当前 contract 一致。 | Epic 6 / Story 6.5<br>Epic 6 / Story 6.7<br>Epic 8 / Story 8.7<br>Epic 8 / Story 8.8<br>Epic 8 / Story 8.9<br>Epic 9 / Story 9.1<br>Epic 9 / Story 9.2<br>Epic 9 / Story 9.3<br>Epic 10 / Story 10.1<br>Epic 10 / Story 10.2<br>Epic 10 / Story 10.3<br>Epic 10 / Story 10.4<br>Epic 10 / Story 10.5<br>Epic 10 / Story 10.6 | ✓ Covered |
| FR71a | SpecLite 维护者必须将 Fixture expected outputs 作为契约测试资产，而不是仅供阅读的示例；新增模块、adapter、source type、validation rule、ownership 行为或 installed artifact kind 时，SpecLite 维护者必须同步相关 fixture 输入和 expected outputs。 | Epic 6 / Story 6.1<br>Epic 6 / Story 6.3<br>Epic 6 / Story 6.5<br>Epic 6 / Story 6.6<br>Epic 6 / Story 6.7<br>Epic 6 / Story 6.8<br>Epic 8 / Story 8.7<br>Epic 10 / Story 10.5 | ✓ Covered |
| FR71b | Fixture case directory、expected output classes、snapshot comparison、ready summary gate、release gate / regression asset 区分和 baseline case 集合由 `_bmad-output/planning-artifacts/specs/08-fixture-contract.md` 管理。实现不得先更新 snapshots 再反推契约行为；契约变更必须先更新 owning SPEC 和 executable schema/parser，再更新 fixture expected outputs。 | Epic 6 / Story 6.1<br>Epic 6 / Story 6.3<br>Epic 6 / Story 6.4<br>Epic 6 / Story 6.6<br>Epic 6 / Story 6.7<br>Epic 6 / Story 6.8<br>Epic 10 / Story 10.5 | ✓ Covered |
| FR72 | 项目维护者可以初始化或重建项目级配置。 | Epic 7 / Story 7.5 | ✓ Covered |
| FR73 | 项目维护者可以列出可安装模块、skills、IDE targets 或版本。 | Epic 7 / Story 7.5 | ✓ Covered |
| FR74 | 工具链维护者可以运行环境、source、权限、IDE target、manifest、路径规范化和文件完整性诊断。 | Epic 7 / Story 7.2 | ✓ Covered |
| FR75 | 工具链维护者可以显式同步 source 与 IDE mirrors。 | Epic 7 / Story 7.2 | ✓ Covered |
| FR76 | 项目维护者可以移除 installer-owned 安装结果。 | Epic 7 / Story 7.2 | ✓ Covered |
| FR77 | Post-MVP 工具链维护者可以让 CI、企业工具链和自动化验证流程消费 MVP 机器可读输出；MVP 只负责提供稳定 `CommandResult` JSON 和 file contracts，不实现企业集成工作流本身。 | Epic 7 / Story 7.3 | ✓ Covered |
| FR78 | 企业规范负责人可以查看包含阶段入口覆盖率、标准产物存在率、validate 通过率和未解决缺口数量的规范落地与流程覆盖报告。该报告属于 Post-MVP，可在 MVP 最小阶段覆盖矩阵与 validate output 之上增加趋势、导出、多项目/团队视角和企业治理汇总。 | Epic 7 / Story 7.4 | ✓ Covered |

### Missing Requirements（缺失需求）

未发现缺失 FR。未发现 Epics/Stories 中引用但 PRD 不存在的额外 FR ID。

### Coverage Statistics（覆盖统计）

- Total PRD FRs：106
- FRs in requirements inventory：106
- FRs with Story traceability：106
- Missing FRs：0
- Extra FRs：0
- Overall coverage：100%
- Epic 11 corrective FR scope：8/8 covered（`FR13a`、`FR23b`–`FR23g`、`FR66a`）
- Post-MVP boundary：`FR72`–`FR78` 有 Epic 7 traceability，但明确排除在 MVP implementation readiness gate 之外

### Epic 11 Coverage Detail（Epic 11 覆盖详情）

- `FR13a` → Story 11.1、11.2、11.3
- `FR23b` → Story 11.4
- `FR23c` → Story 11.5
- `FR23d` → Story 11.6
- `FR23e` → Story 11.7
- `FR23f` → Story 11.8
- `FR23g` → Story 11.9
- `FR66a` → Story 11.10

本步骤只确认 traceability coverage，不把 100% ID coverage 解释为 Story quality、cross-artifact consistency 或 implementation authorization；这些由后续步骤继续验证。

## UX Alignment Assessment（UX 对齐评估）

### UX Document Status（UX 文档状态）

**Found（已找到）：**

- `_bmad-output/planning-artifacts/ux-design-specification.md`：完整主规范，`stepsCompleted: 1–14`、`revisionStatus: complete`，输入包含当前 PRD、Architecture 与 Epic 1–11 corpus。
- `_bmad-output/planning-artifacts/ux-install-cli-interaction-spec-2026-06-12.md`：CLI interaction supplement。

SpecLite 不包含 Web、mobile 或 desktop GUI；UX 对象是 terminal + local filesystem control plane，因此不存在缺失传统 UI specification 的 warning。

### UX ↔ PRD Alignment（UX 与 PRD 对齐）

- 用户旅程一致：install、status/validate、update/repair、phase-based Skill activation 与 governance verification 均可追溯到 PRD journeys 和 FR clusters。
- CLI semantics 一致：human-readable 与 JSON 共用 semantic model；prompt/summary 分离；`--yes` no-prompt；`zh-CN` 默认与 `en-US` fallback；no-color/non-TTY/CI 可读性均与 `FR17a`、`FR47a`、`FR63b`、`NFR1a`、`NFR11a`、`NFR40e` 对齐。
- Artifact topology 一致：UX 明确 Planning 下的 PRD/Epics/UX subject directories、Solutioning 下的 Architecture、Project Knowledge 与 `docs/` 的独立 plane，并保留 explicit config、`legacy-compatible` fallback 与 no-migration 边界。
- Discovery/evidence 一致：UX 的 Filesystem Space Map 与 Artifact Evidence Card 同时展示 `resolvedRoot`、`resolutionMode`、`actualConsumedPath`、whole/sharded shape 与 ambiguity；不把配置路径等同于实际消费路径。
- Schema vocabulary 一致：installed phase coverage 只使用 `mapped | unsupported | failed`；`missing` 仅作 human-readable derived presentation，不进入 installed matrix schema。

### UX ↔ Architecture Alignment（UX 与 Architecture 对齐）

- Architecture 为 UX 所需的七类 runtime roots、resolved-root model、whole/sharded discovery、config/artifact mismatch、legacy fallback、non-migration 和 canonical Skill rename 提供明确组件落点。
- `src/config/`、`src/manifest/`、`src/installer/`、`src/validation/`、`src/update/`、`src/fs/` 与 shared diagnostics/output boundary 能支撑 UX components，不要求新增 GUI 技术栈。
- Architecture structure 明确 `{solutioning_artifacts}/architecture/`、`{planning_artifacts}/{prd,epics,ux}/`、`{project_knowledge}` 和 `docs/` 的 ownership，与 UX 的五 planes 模型一致。
- 当前 checkout 的 Architecture/UX 文件仍位于 legacy planning root，不构成自动迁移要求：当前 config 缺少新增 root fields，按 `SPEC 09` 适用 existing-install `legacy-compatible` fallback。

### Alignment Issues（对齐问题）

#### UX-ARCH-01 — Stale Architecture Validation Evidence（过期的 Architecture 验证证据） — Major

Architecture decision、patterns 与 project structure 已支持当前 UX/PRD contract，但 `architecture/06-architecture-validation-results架构验证结果.md` 仍声称 PRD `FR23c`、UX、Epic 11、requirements inventory 和 lifecycle metadata 尚未同步，并继续引用 2026-08-17 的旧 `NOT READY` 报告作为独立 gate。当前 live artifacts 已显示：PRD `FR23c` 使用 `{solutioning_artifacts}/architecture/`，最新 PRD validation 为 `Pass`，UX revision 为 `complete`，Epic 11 与 inventory 已包含 corrective coverage。

**Impact（影响）：** Architecture validation evidence 与 Architecture 本体及当前 downstream artifacts 自相矛盾；实现者无法仅依赖该 validation shard判断 current handoff，也不能把其中旧 gate 当作本轮 fresh IR 结论。

**Recommendation（建议）：** 由 Architecture owner workflow 刷新 validation shard 的 downstream state、handoff 与 next-priority sections，保留历史结论的 provenance，但明确 current PRD/UX/Epic sync 状态和本轮 fresh IR report identity。

### Warnings（警告）

- UX 与 Architecture capability 本身未发现 blocking mismatch。
- 在 stale Architecture validation evidence 刷新前，UX/Architecture alignment 可判定为“contract aligned, validation evidence stale”，不能判定为无条件 READY。

## Epic Quality Review（Epic 质量审查）

### Structural Compliance（结构合规）

- Epic count：11；Story count：70；duplicate Story IDs：0。
- 70/70 Stories 均具备 user-story opener、BDD-style acceptance criteria 与 Requirement Traceability。
- 106/106 FRs 均有 Story-level traceability。
- Epic 1–11 都以项目维护者、AI IDE 使用者、工具链维护者或治理者可获得的 outcome 描述；未发现纯技术里程碑式 Epic。
- 当前是 brownfield：Epic 1 / Story 1.1 已覆盖 CLI scaffold/runtime guard，Epic 11 / Story 11.3 等覆盖 existing-install compatibility；不需要数据库/entity timing 检查。
- Epic 11 的文本引用中，Story 11.5 → 11.6 与 Story 11.8 → 11.10 均出现在 scope/decomposition 语境，不是直接代码依赖；但后述验收证明仍存在串行歧义。

### Critical Violations（关键违规）

无。

### Major Issues（主要问题）

#### EQ-MAJ-01 — Story 11.5 Whole/Sharded Resolution Policy Is Underspecified（Whole/Sharded 决策策略未定义）

Story 11.5 AC3 允许 whole document 与 sharded documents 共存；AC5 要求使用“canonical workflow 已定义的 whole/sharded discovery precedence”，但 Story、`SPEC 09` 与 Architecture 只要求“确定性发现并记录实际消费路径”，没有定义以下三者中的哪一种是 canonical behavior：

1. whole 优先；
2. sharded 优先；
3. coexistence 视为 ambiguity/blocker，必须人工选择或移除一个版本。

当前 `bmad-check-implementation-readiness` 的 live discovery contract 把 whole + sharded 视为 critical duplicate，并要求用户解决后才能继续，这也不能证明 Story 11.5 所称的通用 precedence 已存在。

**Impact（影响）：** producer/consumer、fixture expected output、ambiguity evidence 与 failure behavior 无法得到唯一实现；不同 Skill 可能各自选择不同输入，正好重新引入 Story 要消除的双真源。

**Recommendation（建议）：** 在 Story 11.5 或 owning `SPEC 09` 中明确完整 decision table：whole-only、sharded-only、whole+sharded、index 缺失、broken shard link、explicit input override；为每种情况定义 chosen path 或 blocking diagnostic、`discoveryShape`、`ambiguityStatus` 和 exit/continuation behavior。

#### EQ-MAJ-02 — Story 11.7 Same-Day Conflict Policy Has No Executable Anchor（同日报告冲突策略无可执行锚点）

Story 11.7 AC8 要求“沿用当前 workflow 的显式冲突处理策略”，但 current `bmad-validate-prd` workflow 与引用的 planning contracts 未定义同一天目标文件已经存在时应 overwrite、append、stop、request confirmation 还是生成受控后缀。

**Impact（影响）：** 实现者只能猜测 write behavior；同一 basename 的重复运行可能覆盖 evidence、产生非确定性副本，或与 append-only workflow state 冲突。

**Recommendation（建议）：** 明确 owner 与行为，例如 `existing target → stop and request explicit user resolution`，并定义 machine/human diagnostic、文件保持不变断言和 fixture expected result；若由通用 artifact-write contract 管理，应给出精确 anchor。

#### EQ-MAJ-03 — Story 11.8 Completeness Gate and Story 11.10 Inventory Order Are Ambiguous（全引用同步与后置 Inventory 的串行门禁歧义）

Story 11.8 AC6/AC9 要求同步“所有 Canonical References”并排除 active 旧名称/路径；同时 Story 11.8 Scope Boundary 把“所有 grill 引用的全量盘点”交给后续 Story 11.10，而 Story 11.10 又以 11.8 完成后的 current state 为基准执行 exhaustive match-to-entry completeness check。

**Impact（影响）：** Story 11.8 无法明确证明“all references”已经完整，除非它自行完成与 Story 11.10 重叠的全量 inventory；若不做，则 11.8 的验收实际上要等未来 Story 11.10 才能确认，违反独立可完成原则。

**Recommendation（建议）：** 二选一：

- 将 Story 11.8 的 AC6/AC9 收窄为明确列举的 rename/routing surfaces 与 old-ID negative scan，并把 broader grill semantic inventory 保留给 11.10；或
- 将 inventory Story 前移到 rename Story 之前，以 inventory 作为 11.8 的输入 gate，再把 post-change residual scan 留在 11.8。

### Minor Concerns（次要关注）

#### EQ-MIN-01 — Story 11.5 Slice Size（Story 11.5 切片规模）

Story 11.5 为当前 corpus 最大 Story：约 131 行、10 个 BDD scenarios，同时覆盖三个 document families、producer、consumer、whole/sharded discovery、fallback、mismatch、negative scan 与 fixture matrix。它仍围绕单一 user outcome，不能仅凭长度判定错误，但 implementation tasking 风险较高。

**Recommendation（建议）：** 若保留一个 Story，至少在 Story implementation artifact 中预先拆成 resolver/discovery contract、producer updates、consumer updates、fixture matrix、negative scan 五个 bounded tasks，并维持一次 completion gate；不要把其中任一任务的证据推迟到未来 Story。

### Best-Practices Result（最佳实践结论）

- User value focus：Pass
- Epic independence：Pass
- Story structure and traceability：Pass
- Direct forward dependency scan：Pass
- Epic 11 independently testable acceptance：Needs Work（3 个 Major contract gaps）
- Story sizing：Warning（Story 11.5）

## Summary and Recommendations（总结与建议）

### Overall Readiness Status（总体就绪状态）

**NOT READY**

Epic 11 的 requirements coverage 已达到 8/8，整体 PRD coverage 为 106/106；PRD validation 为 Pass，UX 与 Architecture capability contract 基本一致，70/70 Stories 具备结构与 traceability。尽管如此，当前仍不足以让实现者在不猜测项目行为的情况下启动 Epic 11：核心 whole/sharded resolution、同日报告冲突和 rename/inventory serial gate 尚未形成唯一可执行结论，Architecture validation evidence 也没有反映 live downstream state。

### Critical Issues Requiring Immediate Action（必须立即处理的问题）

本轮没有标记为 Critical 的文档缺失或 FR orphan，但以下 4 个 Major issues 共同阻断 implementation authorization：

1. **Story 11.5 whole/sharded policy 未定义：** 必须明确 coexistence 时选择、阻断或人工决议的唯一行为，并补齐 diagnostic/evidence decision table。
2. **Story 11.7 same-day report conflict 未定义：** 必须给出 owner contract、write behavior、non-overwrite assertion 与 fixture expected result。
3. **Story 11.8 / 11.10 串行 completeness gate 歧义：** 必须让 rename Story 能独立验收，或把 inventory 前移成为输入 gate。
4. **Architecture validation evidence 过期：** 必须刷新 `06-architecture-validation-results架构验证结果.md`，移除与 current PRD/UX/Epic sync 状态冲突的 handoff，并引用本轮 fresh IR identity。

### Recommended Next Steps（建议下一步）

1. 先通过 Epic/Story owner workflow 修订 Story 11.5、11.7、11.8/11.10 的三处 contract gaps；只改相关 AC、dependency gate、contract anchor 与 fixture expectation，不扩大产品范围。
2. 若 Story 11.5 保持单 Story，在 implementation tasking 中拆出 resolver/discovery、producer、consumer、fixture matrix、negative scan 五个 bounded tasks；否则按独立 user-observable behavior 再拆 Story。
3. 由 Architecture owner workflow 刷新 validation shard 的 current downstream state 和 handoff；保留历史 `NOT READY` provenance，但不能继续把它描述为 current truth。
4. 对修订后的 Epic 11 运行 focused structural checks：70 Story identity、106 FR coverage、index links、forward dependency scan、whole/sharded decision table completeness 和 `git diff --check`。
5. 在 fresh context 重新运行 `bmad-check-implementation-readiness`。只有新报告达到 `READY`，才进入 sprint planning / tracker update 或 Epic 11 implementation kickoff。

### Final Note（最终说明）

本次评估发现 5 个问题，分布在 cross-artifact validation evidence、artifact discovery contract、report collision contract、strict-serial evidence gate 和 Story sizing 五类：Critical 0、Major 4、Minor 1。当前 live `sprint-status.yaml` 未发现 Epic 11 tracking entries；本轮保持 tracker 不变。`revisionStatus: complete` 仅表示 Epic/Story revision workflow 已保存，不能替代 implementation readiness authorization。

**Assessment Date（评估日期）：** 2026-09-01  
**Assessor（评估者）：** Codex / BMad Implementation Readiness
