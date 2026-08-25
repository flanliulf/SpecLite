---
stepsCompleted:
  - step-01-document-discovery
  - step-02-prd-analysis
  - step-03-epic-coverage-validation
  - step-04-ux-alignment
  - step-05-epic-quality-review
  - step-06-final-assessment
includedFiles:
  prd:
    - prd/index.md
    - prd/01-executive-summary执行摘要.md
    - prd/02-project-classification项目分类.md
    - prd/03-success-criteria成功标准.md
    - prd/04-product-scope产品范围.md
    - prd/05-user-journeys用户旅程.md
    - prd/06-domain-specific-requirements领域特定需求.md
    - prd/07-innovation-novel-patterns创新与新模式.md
    - prd/08-developer-tool-specific-requirements开发者工具特定需求.md
    - prd/09-project-scoping-phased-development项目范围界定与阶段化开发.md
    - prd/10-functional-requirements功能需求.md
    - prd/11-non-functional-requirements非功能需求.md
  prdValidationEvidence:
    - prd/prd-validate-report-2026-08-17.md
  architecture:
    - architecture/index.md
    - architecture/01-project-context-analysis项目上下文分析.md
    - architecture/02-starter-template-evaluationstarter-模板评估.md
    - architecture/03-core-architectural-decisions核心架构决策.md
    - architecture/04-implementation-patterns-consistency-rules实现模式与一致性规则.md
    - architecture/05-project-structure-boundaries项目结构与边界.md
    - architecture/06-architecture-validation-results架构验证结果.md
  epics:
    - epics/index.md
    - epics/01-overview概览.md
    - epics/02-requirements-inventory需求清单.md
    - epics/03-epic-listepic-列表.md
    - epics/04-epic-1-project-installation-onboarding项目安装引导.md
    - epics/05-epic-2-methodology-discovery-and-skill-execution方法论发现与-skill-执行.md
    - epics/06-epic-3-installed-state-and-deterministic-validation已安装状态与确定性验证.md
    - epics/07-epic-4-safe-update-and-repair安全更新与修复.md
    - epics/08-epic-5-source-integrity-and-distribution-channels来源完整性与分发渠道.md
    - epics/09-epic-6-maintainer-fixture-and-release-confidence维护者-fixture-与发布信心.md
    - epics/10-epic-7-post-mvp-governance-expansionpost-mvp-治理扩展.md
    - epics/11-epic-8-cli-outcome-oriented-human-output-systemcli-outcome-导向人类输出体系.md
    - epics/12-epic-9-installed-runtime-activation-contract-hardening已安装-runtime-激活契约收口.md
    - epics/13-epic-10-canonical-source-ecosystem-module-governancecanonical-source-生态模块治理.md
    - epics/14-epic-11-phase-aligned-workflow-artifact-governance阶段对齐的-workflow-artifact-治理.md
  ux:
    - ux-design-specification.md
    - ux-install-cli-interaction-spec-2026-06-12.md
excludedFiles:
  - prd-validation-report.md
  - prd/prd-validate-report-2026-07-22.md
---

# Implementation Readiness Assessment Report

**Date:** 2026-08-17
**Project:** SpecLite

## Document Discovery（文档发现）

### Documents Selected（已选文档）

- PRD：使用 `prd/index.md` 与 11 个正文分片。
- PRD 验证证据：使用用户指定的 `prd/prd-validate-report-2026-08-17.md`。
- Architecture：使用 `architecture/index.md` 与 6 个正文分片。
- Epics/Stories：使用 `epics/index.md`、需求清单、Epic 列表与 Epic 1–11 文件。
- UX：使用 `ux-design-specification.md`，并将 `ux-install-cli-interaction-spec-2026-06-12.md` 作为专项补充。

### Discovery Resolution（发现结论）

- 未发现 PRD、Architecture 或 Epics 的 whole/sharded 正文冲突。
- 四类必需规划制品均已找到。
- 排除旧版 `prd-validation-report.md` 与 `prd/prd-validate-report-2026-07-22.md`，避免历史验证结论与本次修订基线混用。

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
- FR23c: `{planning_artifacts}` 必须预创建 `epics/`、`prd/` 和 `architecture/`，对应 workflow 的 whole documents 与 `shard-doc` 产生的 shards 必须在各自目录内保持可发现、无 whole/sharded 双真源歧义。
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

**Scope Boundary（范围边界）：** `FR1`–`FR71b` 属于 MVP；`FR72`–`FR78` 明确属于 Post-MVP backlog，不应进入本次 MVP implementation readiness gate。

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

**Total NFRs（NFR 总数）：** 100 个 canonical NFR；另包含 1 条补充契约行 `NFR35a-schema`。本报告逐条保留全部 101 个 anchored NFR rows。

### Additional Requirements（附加要求）

- 产品形态必须保持为 Node-first CLI installer/control plane；Node.js 最低版本为 22，并覆盖 Node 22/24 release matrix。
- MVP 核心命令面为 `install`、`status`、`validate`、`update`，`resolve config/customization` 是 runtime support command；`init/list/doctor/sync/uninstall` 属于 Post-MVP。
- MVP 硬交付 execution targets 为 `.claude/skills` 与 `.agents/skills`；GitHub Copilot/Cursor 仅通过共享 `agents` target 兼容，不生成专用 command pointer。
- Canonical source、installer control plane、IDE execution plane、`_speclite` metadata hub、`_speclite-output` workflow artifacts、`project-knowledge-base/` 与目标项目 `docs/` 必须保持清晰边界。
- 系统必须本地、离线、可重复运行，不依赖云服务、数据库或后台守护进程；同时支持 bundled、npm public/private registry、local tarball、offline bundle、pinned Git source 与 local path。
- 所有权模型必须区分 installer-owned、human-owned、workflow-owned；普通 install/update/repair 不得覆盖或迁移 human-owned/custom 与 workflow artifacts。
- public JSON、source descriptor、install plan、manifest/index、IDE adapter、resolve、issue taxonomy、fixture 和 SDLC artifact lifecycle 的字段级真源分别由 SPEC 01–09 中对应 owning SPEC 管理；PRD 只拥有产品需求和验收意图。
- Fresh install 必须生成阶段对齐的 artifact topology；existing install 必须保留显式配置与 legacy fallback，不得把 config path 变化误报为 artifact migration。
- Fixture/release evidence 必须覆盖 `fresh-install-empty-project`、`existing-install-update`、`source-integrity`、`ide-drift`、`skill-artifact-loop`、macOS/Windows portability、Node 22/24 与 packaging acceptance。

### PRD Completeness Assessment（PRD 完整性评估）

- 修订后 PRD 为 BMAD Standard，6/6 核心章节完整。
- 共识别 106 个 FR、100 个 canonical NFR，并核对 `NFR35a-schema` 补充契约行；无重复 canonical label 或缺失编号。
- 2026-08-17 Validation Run 2 结果为 `Pass`、`5/5 - Excellent`，Measurability、Traceability、Implementation Leakage、SMART Quality 与 Completeness 均通过。
- Run 1 的 5 个非阻断 finding 已全部闭环；Run 2 为 0 critical、0 warning、0 non-blocking finding。
- PRD 本身已达到下游 Architecture、UX 与 Epic/Story 一致性核查所需的完整度；最终 implementation readiness 仍取决于后续跨制品 coverage 与 alignment 验证。

## Epic Coverage Validation（Epic 覆盖验证）

### Coverage Matrix（覆盖矩阵）

| FR Number | PRD Requirement | Epic Coverage | Status |
| --- | --- | --- | --- |
| FR1 | 项目维护者可以指定 SpecLite 安装目录。 | Epic 1 - 指定安装目录。 | ✓ Covered |
| FR2 | 系统可以解析并展示最终安装路径。 | Epic 1 - 解析并展示最终安装路径。 | ✓ Covered |
| FR3 | 系统可以检查安装目录是否存在、是否为空、是否已有 SpecLite 安装内容。 | Epic 1 - 检查安装目录状态与既有安装内容。 | ✓ Covered |
| FR4 | 项目维护者可以确认是否安装到解析后的目录。 | Epic 1 - 确认安装目标目录。 | ✓ Covered |
| FR5 | 项目维护者可以选择要安装的官方 SpecLite 模块或能力包。 | Epic 1 - 选择官方 SpecLite 模块或能力包。 | ✓ Covered |
| FR6 | 系统可以检查并展示可安装模块的版本信息。 | Epic 1 - 展示可安装模块版本信息。 | ✓ Covered |
| FR7 | 系统可以展示用户已选择的模块、版本和安装摘要。 | Epic 1 - 展示模块、版本和安装摘要。 | ✓ Covered |
| FR8 | 项目维护者可以选择是否从自定义来源安装 SpecLite。 | Epic 5 - 选择自定义安装来源。 | ✓ Covered |
| FR9 | 项目维护者可以从 Git source 或 local path 安装或验证 SpecLite source；local path 不得指向目标项目中的 installed state、IDE mirrors、workflow output、dependency/cache/build 目录。 | Epic 5 - 从 Git source 或 local path 安装或验证 source。 | ✓ Covered |
| FR10 | 项目维护者可以选择要集成的 AI IDE 目标。 | Epic 1 - 选择 AI IDE targets。 | ✓ Covered |
| FR11 | 系统可以展示每个目标 AI IDE 的配置结果。 | Epic 1 - 展示每个 AI IDE target 配置结果。 | ✓ Covered |
| FR12 | 系统可以为目标项目创建 SpecLite 项目级运行元数据结构。 | Epic 1 - 创建 SpecLite 项目级运行元数据结构。 | ✓ Covered |
| FR13 | 系统可以为目标项目创建 SpecLite 过程产物输出结构。 | Epic 1 - 创建 SpecLite 过程产物输出结构。 | ✓ Covered |
| FR13a | Fresh install 必须在 `_speclite-output/` 下预创建阶段对齐的一级 artifact roots：`0-brainstorming-artifacts/`、`1-analysis-artifacts/`、`2-planning-artifacts/`、`3-solutioning-artifacts/`、`4-implementation-artifacts/`、`5-devops-artifacts/`；workflow 产生的 project knowledge 默认位于 `_speclite-output/project-knowledge-base/`，目标项目 `docs/` 保持 Primary Public Document（主要公开文档）定位。 | Epic 11 - Fresh install 预创建阶段对齐 artifact roots，并区分 `docs/` 与 `_speclite-output/project-knowledge-base/`。 | ✓ Covered |
| FR14 | 系统可以发现正式可分发的 SpecLite source skills；MVP 默认官方安装集合必须递归发现 `core-skills/` 与 `sdlc-skills/` 下全部包含 `SKILL.md` 的 canonical package roots，并排除 `support-skills/`、已删除入口和非正式分发辅助来源。 | Epic 1 - 发现正式可分发 source skills。 | ✓ Covered |
| FR15 | 系统可以将同一 canonical skill 暴露到多个目标 AI IDE；对于被选中模块下的每个 canonical package root，MVP 必须在每个已选择且支持的 IDE target 中生成 self-contained skill entry，并在 skill index / files index 中记录 source reference 与 hash。 | Epic 1 - 将 canonical skill 暴露到多个 AI IDE。 | ✓ Covered |
| FR16 | 项目维护者可以查看安装完成后的项目结构和安装摘要。 | Epic 1 - 查看安装完成后的项目结构和安装摘要。 | ✓ Covered |
| FR17 | 项目维护者可以查看安装完成后的下一步使用指引。 | Epic 1 - 查看安装完成后的下一步指引。 | ✓ Covered |
| FR17a | 首次安装的 human-readable CLI 输出必须使用分阶段 block 呈现模块选择、配置模式、写入计划确认、写入进度和 Ready Summary；日志、摘要、提示和用户输入必须在视觉上分离，不得把长段 summary 与 prompt 拼接到同一个输入问题中。 | Epic 1 - 首次安装 human-readable CLI 使用分阶段 blocks，并分离 summary、prompt、确认和用户输入。 | ✓ Covered |
| FR18 | 安装器可以生成 IDE-specific discovery metadata，列出研发阶段、canonical skill id、skill 名称、目标 IDE entry path 和激活 target。Manifest、skill index、help index、files index 与最小阶段覆盖矩阵的字段、版本、hash 和 ownership 规则由 `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md` 作为 canonical contract 管理；IDE adapter id、target id、target order、capability 与 status 语义由 `_bmad-output/planning-artifacts/specs/05-ide-adapter-registry-contract.md` 管理。 | Epic 2 - 生成 IDE-specific discovery metadata。 | ✓ Covered |
| FR19 | MVP 中每个 IDE adapter 必须把 discovery metadata 映射为该 IDE target directory 中的 self-contained skill entry，并报告 mapped、unsupported 或 failed 状态。Adapter schema 可以声明 `commandPointerBehavior: "none" \| "unsupported"` 作为 Post-MVP 扩展位，但 MVP 不生成 command pointer artifact。 | Epic 2 - 将 discovery metadata 映射为 self-contained skill entry。 | ✓ Covered |
| FR20 | AI IDE 使用者可以通过已映射的 IDE entry 选择并激活 SpecLite skill。 | Epic 2 - 通过 IDE entry 选择并激活 SpecLite skill。 | ✓ Covered |
| FR21 | AI IDE 使用者可以调用 SPEC、方案评审、故事规划、实现、测试和审查相关能力；每项能力必须映射到至少一个 canonical skill id。 | Epic 2 - 调用 SPEC、方案评审、故事规划、实现、测试和审查能力。 | ✓ Covered |
| FR22 | 已激活的 skill 可以读取项目级配置、customization 覆盖和相关上下文。 | Epic 2 - 已激活 skill 读取项目级配置、customization 覆盖和上下文。 | ✓ Covered |
| FR23 | 已激活的 workflow 可以将产物输出到配置约定的位置，并在产物中记录 workflow type、source skill 和生成时间。MVP artifact contract 至少校验 artifact type、默认输出路径、configured artifact root、`workflowType`、`sourceSkill` 和 `generatedAt` 元数据字段；artifact root 和默认输出路径必须是 project-relative POSIX path 且位于 target project boundary 内，产物内容质量不进入 MVP validation。 | Epic 2 - workflow 按约定输出 artifact 并记录 metadata。 | ✓ Covered |
| FR23a | Artifact metadata 的 MVP 校验必须覆盖最小值域：`workflowType` 必须是非空稳定字符串，`sourceSkill` 必须是非空 canonical skill id，`generatedAt` 必须存在且是 ISO 8601 string，且默认在 stable fixture snapshot comparison 中 normalize 或 exclude。 | Epic 2 - 校验 artifact metadata 的最小值域。 | ✓ Covered |
| FR23b | 1-analysis 阶段的 domain、market、technical research 必须写入 `{analysis_artifacts}/research/`；product brief 必须写入 `{analysis_artifacts}/product-brief/`；PRFAQ 必须写入 `{analysis_artifacts}/prfaq/`。这些 research skills 不是 `{project_knowledge}` 的产生者。 | Epic 11 - Analysis research、product brief 与 PRFAQ 统一写入 `{analysis_artifacts}` 下的规范子目录。 | ✓ Covered |
| FR23c | `{planning_artifacts}` 必须预创建 `epics/`、`prd/` 和 `architecture/`，对应 workflow 的 whole documents 与 `shard-doc` 产生的 shards 必须在各自目录内保持可发现、无 whole/sharded 双真源歧义。 | Epic 11 - PRD、Epics 与 Architecture whole/sharded documents 统一写入 `{planning_artifacts}` 对应子目录。 | ✓ Covered |
| FR23d | `{planning_artifacts}` 必须预创建 `ux/`，承载 `ux-design-specification.md`、`ux-color-themes.html`、`ux-design-directions.html`；`design-system/` 子树仅在对应 workflow 首次需要时按需创建，UX workflow、discovery 与引用必须统一使用该 root。 | Epic 11 - UX artifacts 与后续 design-system 子树统一写入 `{planning_artifacts}/ux/`。 | ✓ Covered |
| FR23e | `speclite-validate-prd` 的报告文件名必须固定为 `prd-validate-report-{yyyy-MM-dd}.md`，并写入 `{planning_artifacts}/prd/`；existing install 中的旧名称报告必须保持原位且可作为历史 evidence 被发现，install、update 或 repair 不得自动重命名、迁移、覆盖或删除。 | Epic 11 - PRD validation 使用固定 dated report filename。 | ✓ Covered |
| FR23f | SpecLite 方法论维护者必须将 Canonical skill `speclite-ir-grill-consistency-reviewer` 更名为 `speclite-implementation-readiness-grill-consistency-reviewer`，将 `speclite-check-implementation-readiness` 更名为 `speclite-implementation-readiness-check`，并将两者的输出统一置于 `{solutioning_artifacts}/implementation-readiness-report/grill-consistency/`；readiness report 文件名保持 `implementation-readiness-report-{yyyy-MM-dd}.md`。SpecLite 方法论维护者必须同步更新 package、help、manifest、activation、cross-skill 与 docs references。Canonical metadata 必须维护旧 ID 到新 ID 的 rename mapping，不得生成 alias package/help/phase row；fresh install 只投影新 canonical ID，existing install 的 update 必须显式展示 rename/reprojection，并保护发生 drift 的旧 package。 | Epic 11 - Implementation Readiness Skills 更名并统一 solutioning output root。 | ✓ Covered |
| FR23g | Epic Story code-review orchestrator 及 reviewer/evaluator/fixer/finalizer 相关 workflows 必须把每个 Story 的 CR artifact root 规范为 `{story-id}-code-review/`，其中 `story-id` 使用 `x-x` 形式；不得再把 Story title/name 拼入目录名。既有 title-bearing CR 目录不得被自动迁移、重命名或删除；恢复 legacy-only 未完成 CR 时必须在一个目录内完成，canonical 与 legacy 目录并存且无法唯一判断当前轮次时必须停止并报告稳定冲突诊断。 | Epic 11 - Story CR artifact root 统一为 `{story-id}-code-review/`。 | ✓ Covered |
| FR24 | 企业规范负责人可以查看 MVP 最小阶段覆盖矩阵，确认 SPEC、方案评审、故事规划、实现、测试和审查阶段是否存在 mapped skill entry、对应 canonical skill id、以及目标 IDE target 是否可见。MVP 阶段覆盖矩阵来自 manifest、help index 和 installed skill entries，最小字段必须覆盖 `phaseId`、`phaseLabel`、`moduleId`、`canonicalSkillId`、`ideTargets[].targetId`、`ideTargets[].entryPath`、`ideTargets[].activationTarget`、`ideTargets[].status` 和可选 `artifactContract`；不提供覆盖率百分比、趋势、团队汇总或治理 dashboard。 | Epic 2 - 查看 MVP 最小阶段覆盖矩阵。 | ✓ Covered |
| FR25 | 工具链维护者可以查看当前项目的 SpecLite 安装状态。 | Epic 3 - 查看当前项目 SpecLite 安装状态。 | ✓ Covered |
| FR26 | 工具链维护者可以查看安装来源、版本和目标 IDE 覆盖情况。 | Epic 3 - 查看安装来源、版本和 IDE target 覆盖情况。 | ✓ Covered |
| FR27 | 工具链维护者可以验证 manifest、skill index、help index 和 files index 的有效性。 | Epic 3 - 验证 manifest、skill index、help index 和 files index。 | ✓ Covered |
| FR28 | 工具链维护者可以验证 manifest 中记录的所有已选择且支持的 IDE target mirrors 是否与 canonical source 一致。 | Epic 3 - 验证多个 IDE mirrors 与 canonical source 一致。 | ✓ Covered |
| FR28a | 当 IDE mirror 中的 canonical skill package 文件偏离 manifest 记录的 canonical package hash 时，`validate` 必须报告 `ide-mirror` 或 `file-integrity` error，但不得自动修复。 | Epic 3 - 报告 IDE mirror canonical package hash drift。 | ✓ Covered |
| FR29 | 工具链维护者可以检测缺失的菜单目标或不可激活的 skill。 | Epic 3 - 检测缺失菜单目标或不可激活 skill。 | ✓ Covered |
| FR30 | 工具链维护者可以检测错误 runtime path、legacy namespace residue 和产物路径问题。 | Epic 3 - 检测 runtime path、legacy namespace residue 和 artifact path 问题。 | ✓ Covered |
| FR31 | 工具链维护者可以检测旧版或遗留 AI IDE 入口。 | Epic 3 - 检测旧版或遗留 AI IDE 入口。 | ✓ Covered |
| FR32 | 系统可以在检测到遗留入口与当前 canonical skill id 或 IDE target 重叠时，提示重复加载、菜单冲突或能力漂移风险。 | Epic 3 - 报告遗留入口重叠导致的重复加载、菜单冲突或能力漂移风险。 | ✓ Covered |
| FR33 | 系统可以为遗留入口提供包含 path、risk category、manual action 和 verification command 的人工清理建议。 | Epic 3 - 为遗留入口提供人工清理建议。 | ✓ Covered |
| FR34 | 工具链维护者可以验证 shared scripts、module directories、configuration、help catalog 和 IDE mirrors 是否安装完成。 | Epic 3 - 验证 shared scripts、module directories、configuration、help catalog 和 IDE mirrors 安装完成。 | ✓ Covered |
| FR35 | 系统可以输出可诊断的验证结果，指出问题类型、影响范围和修复方向。 | Epic 3 - 输出可诊断验证结果。 | ✓ Covered |
| FR35a | MVP 面向用户的核心命令必须支持 `--json`，并使用统一 `CommandResult` envelope；详细字段、排序、路径、timestamp、schema evolution、status 推导、exit code 和 fixture comparison 契约以 `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md` 为准。 | Epic 3 - 核心命令支持统一 CommandResult JSON envelope。 | ✓ Covered |
| FR35b | `CommandResult` 中的 issues 必须复用同一 `ValidationIssue` model，并与 human-readable output、exit code 和 fixture assertions 保持一致；issue category、issue id 与默认 severity 语义以 `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md` 为准。 | Epic 3 - CommandResult issues 复用 ValidationIssue model。 | ✓ Covered |
| FR35c | PRD 不定义第二份 public JSON 字段真源。负责 public JSON contract 变更的 SpecLite 维护者在新增 public JSON 字段、reason code、redacted path 形状、排序规则或 command-specific payload 行为时，必须先更新 owning SPEC，再同步 executable schema/parser 和 fixture expected outputs。Reason code producer 只能输出 owning SPEC registry 中的 MVP codes；consumer/parser 必须容忍 unknown future codes，并保留其 stable display string。 | Epic 3 - public JSON 字段以 owning SPEC 为真源。 | ✓ Covered |
| FR36 | 项目维护者可以更新已安装的 SpecLite installer-owned 文件。 | Epic 4 - 更新 installer-owned 文件。 | ✓ Covered |
| FR37 | 系统可以区分 installer-owned、human-owned 和 workflow-owned 文件。 | Epic 4 - 区分 installer-owned、human-owned 和 workflow-owned 文件。 | ✓ Covered |
| FR38 | 系统可以在更新前识别本地文件是否被用户修改。 | Epic 4 - 更新前识别本地文件是否被用户修改。 | ✓ Covered |
| FR39 | 系统可以避免覆盖 human-owned custom 文件。 | Epic 4 - 避免覆盖 human-owned custom 文件。 | ✓ Covered |
| FR40 | 系统可以避免覆盖 workflow-owned 过程产物。 | Epic 4 - 避免覆盖 workflow-owned 过程产物。 | ✓ Covered |
| FR41 | 项目维护者可以看到 update 对安装内容、用户定制和过程产物的影响摘要，包括 planned effects、实际 changed/skipped paths 和 conflicts；public output 契约以 `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md` 为准。 | Epic 4 - 展示 update 影响摘要、changed/skipped paths 和 conflicts。 | ✓ Covered |
| FR41a | `update` 遇到 IDE mirror drift 或其他 installer-owned drift 时必须默认标记 conflict，不得静默覆盖；普通 `update` 的用户确认或 `--yes` 只授权无 conflict 的 planned update writes，不得恢复 drift。MVP 只有 `speclite update --repair` 才可恢复可安全 repair 的 canonical 内容，不新增顶级 `speclite repair` 命令，`speclite sync` 保持 Post-MVP。 | Epic 4 - update 默认将 IDE mirror drift 或 installer-owned drift 标记为 conflict。 | ✓ Covered |
| FR41b | `speclite update --repair` 必须只修复可安全恢复或重建的 installer-owned drift，并继续保护 human-owned custom 文件和 workflow-owned artifacts；repair eligibility、missing source evidence、`expectedHash`、restore-canonical/regenerate、conflict projection 和 reason code producer/consumer 语义以 owning SPEC 为准。 | Epic 4 - update --repair 只修复可安全恢复或重建的 installer-owned drift。 | ✓ Covered |
| FR41c | Install/update/repair 必须坚持 plan-before-write、显式写入授权、project operation lock、safe write、保守 stale lock 处理和 partial failure 可诊断性；具体 planning/write authorization 契约以 `_bmad-output/planning-artifacts/specs/03-install-plan-contract.md` 为准。MVP 不生成 standalone report artifact，不提供事务性 rollback、backup/restore、顶级 repair 或 sync。 | Epic 4 - install/update/repair 遵守 plan-before-write、写入授权、operation lock、safe write 和 partial failure 诊断。 | ✓ Covered |
| FR42 | 项目维护者可以在安装过程中配置用户称呼或团队名称。 | Epic 1 - 安装过程中配置用户称呼或团队名称。 | ✓ Covered |
| FR43 | 项目维护者可以在安装过程中配置项目名称。 | Epic 1 - 安装过程中配置项目名称。 | ✓ Covered |
| FR44 | 项目维护者可以在安装过程中配置 AI agent 的交流语言。 | Epic 1 - 安装过程中配置 AI agent 交流语言。 | ✓ Covered |
| FR45 | 项目维护者可以在安装过程中配置文档输出语言。 | Epic 1 - 安装过程中配置文档输出语言。 | ✓ Covered |
| FR46 | 项目维护者可以在安装过程中配置过程产物输出目录。 | Epic 1 - 安装过程中配置过程产物输出目录。 | ✓ Covered |
| FR47 | 项目维护者可以选择快速配置或详细配置模式。 | Epic 1 - 选择快速配置或详细配置模式。 | ✓ Covered |
| FR47a | `speclite install --yes` 必须采用 module metadata、config contract 和 adapter registry 明确声明的 deterministic defaults，并仅授权 `_bmad-output/planning-artifacts/specs/03-install-plan-contract.md` 定义的无 conflict planned writes；该模式不得发起或等待 module selection、config mode、IDE target selection 或 final write confirmation 等交互输入。若必需值无法由 defaults 或显式 flags 解析，或 planning 产生 unsupported target、drift 或 conflict，命令必须在写入前失败，以非 0 exit code 和 owning SPEC registry 中的 stable issue id 报告原因；显式 flags 必须覆盖对应 default。需要人工选择时，用户必须显式进入 interactive mode，`--yes` 不得隐式切换为 interactive mode。 | Epic 1 - `install --yes` 使用 deterministic defaults，只授权无 conflict writes，并保持 no-prompt behavior。 | ✓ Covered |
| FR48 | 项目维护者可以使用项目级配置定义用户称呼、项目名称、交流语言、文档输出语言、产物路径、安装模块和 IDE targets。 | Epic 1 - 使用项目级配置定义用户称呼、项目名称、语言、产物路径、安装模块和 IDE targets。 | ✓ Covered |
| FR49 | 用户可以通过定制化配置覆盖 skill workflow、agent persona、菜单项和输出路径默认值。 | Epic 2 - 通过 customization 覆盖 skill workflow、agent persona、菜单项和输出路径默认值。 | ✓ Covered |
| FR50 | 系统可以按 installer base、installer user、team custom、user custom 的优先级解析并合并配置。 | Epic 4 - 按 installer base、installer user、team custom、user custom 优先级解析并合并配置。 | ✓ Covered |
| FR51 | 系统可以通过 ownership manifest、路径规则和只读策略保留 human-owned 配置的人工维护边界。 | Epic 4 - 通过 ownership manifest、路径规则和只读策略保留 human-owned 配置维护边界。 | ✓ Covered |
| FR51a | MVP 默认不修改 human-owned TOML，包括 `_speclite/custom/*.toml` 和 `_speclite/custom/*.user.toml`。所谓保守更新在 MVP 中只表示读取并保护；任何对 human-owned TOML 的写入都必须由未来显式命令或交互确认引入，并通过 ADR 记录。 | Epic 4 - MVP 默认不修改 human-owned TOML。 | ✓ Covered |
| FR51b | Fresh install 可以在目标路径不存在时按 create-if-absent 规则创建 human-owned TOML stub；MVP scope 仅限 project-level stubs：`_speclite/custom/config.toml` 与 `_speclite/custom/config.user.toml`。Ownership 规则由 Epic 4 / Story 4.1 验证，fresh-install 初始化由 Epic 1 / Story 1.4 执行。Fresh install 不默认创建 skill-specific `_speclite/custom/{skill}.toml` 或 `_speclite/custom/{skill}.user.toml`；如果任何 human-owned custom TOML 已存在，install/update/repair 不得覆盖、重写、重排或格式化。 | Epic 1 / Story 1.4 + Epic 4 / Story 4.1 - Fresh install 只 create-if-absent 创建 _speclite/custom/config.toml 与 _speclite/custom/config.user.toml project-level stubs，已存在时不得覆盖或重排；skill-specific custom stubs 不由 fresh install 默认创建。 | ✓ Covered |
| FR52 | 系统可以让 skills 使用统一配置访问项目名称、用户偏好、输出路径和流程约定。 | Epic 2 - skills 使用统一配置访问项目名称、用户偏好、输出路径和流程约定。 | ✓ Covered |
| FR52a | 系统必须提供 `speclite resolve config` 与 `speclite resolve customization` 作为 MVP runtime support command，使已安装 skills 能通过稳定入口读取 config/customization，而不依赖 Python resolver 或内部构建路径。 | Epic 2 - 提供 speclite resolve config 与 speclite resolve customization runtime support command。 | ✓ Covered |
| FR52b | `speclite resolve` 必须保持 Python resolver parity，包括 stdout/stderr shape、exit code、missing key、repeated key、project-root fallback、required/optional layer failure、array merge、config/customization merge order 和 customization lookup key。详细契约以 `_bmad-output/planning-artifacts/specs/06-resolve-command-contract.md` 为准；PRD 与 Architecture 不重新定义第二份 resolve 字段真源。 | Epic 2 - speclite resolve 保持 Python resolver parity。 | ✓ Covered |
| FR52c | `resolve-parity` fixture 必须覆盖 config/customization resolver 兼容性，并随 resolver 行为变更同步更新 owning SPEC、parser/schema 和 expected outputs。 | Epic 2 - resolve-parity fixture 覆盖 config/customization resolver 兼容性。 | ✓ Covered |
| FR53 | 项目维护者可以从 npm public registry 安装 SpecLite。 | Epic 5 - 从 npm public registry 安装 SpecLite。 | ✓ Covered |
| FR54 | 项目维护者可以从 private registry 安装 SpecLite。 | Epic 5 - 从 private registry 安装 SpecLite。 | ✓ Covered |
| FR55 | 项目维护者可以从 local tarball 安装 SpecLite。 | Epic 5 - 从 local tarball 安装 SpecLite。 | ✓ Covered |
| FR56 | 项目维护者可以从 offline bundle 安装 SpecLite。 | Epic 5 - 从 offline bundle 安装 SpecLite。 | ✓ Covered |
| FR57 | 项目维护者可以从 Git source 安装 SpecLite，并在 install/update 的 source resolution 阶段验证 Git source；写入前 Git source 必须解析到具体 commit SHA，只指定 remote URL、branch 或 tag 的浮动 Git source 不得进入 install planning。`speclite validate` 不负责访问 Git remote 或重新验证远程 freshness/provenance，只检查本地记录的 source descriptor、integrity evidence shape 和 hash baseline。 | Epic 5 - 从 Git source 安装并在写入前固定到 commit SHA。 | ✓ Covered |
| FR58 | 系统可以记录并展示安装来源、channel 和版本信息。 | Epic 5 - 记录并展示安装来源、channel 和版本信息。 | ✓ Covered |
| FR59 | 当安装来源不可用或不合法时，系统必须在写入前失败，并通过统一 `CommandResult` / `ValidationIssue` model 输出 stable issue id、category、severity、affected component、impact 和 suggested next step；command data 或 summary 中的 source facts 必须遵守 source descriptor 的 display-safe/redaction contract，human-readable output、`--json` output 与 exit code 必须由同一 issue/status 语义推导。各 source type 的 unavailable、invalid descriptor、integrity failure 和 unsupported case 必须由 owning SPEC registry 定义，并由 fixture assertions 验证。 | Epic 5 - 在安装来源不可用或不合法时给出明确失败原因。 | ✓ Covered |
| FR60 | 系统可以在安装过程中展示 source discovery、manifest generation、IDE mirror creation、config initialization 和 ready check 的执行状态。 | Epic 1 - 展示 source discovery、manifest generation、IDE mirror creation、config initialization 和 ready check 阶段状态。 | ✓ Covered |
| FR61 | 系统可以展示 shared scripts、module directories、configuration、help catalog 和 IDE integrations 的安装结果。 | Epic 1 - 展示 shared scripts、module directories、configuration、help catalog 和 IDE integrations 安装结果。 | ✓ Covered |
| FR62 | 系统可以展示每个已配置 AI IDE 的 skill 数量和目标目录。 | Epic 1 - 展示每个已配置 AI IDE 的 skill 数量和目标目录。 | ✓ Covered |
| FR63 | 系统可以在安装完成后展示包含安装路径、manifest version、source descriptor、已安装模块、IDE targets、关键目录和下一步命令的 SpecLite ready summary。 | Epic 1 - 展示 SpecLite ready summary。 | ✓ Covered |
| FR63a | Ready summary 的 human-readable 输出可以包含解释性文案，但 automation 依赖必须进入 `install --json` 的 `InstallCommandData` 字段，例如 `sourceDescriptor`、`manifestVersion`、`installedModules`、`ideTargets`、`paths`、`completedSteps` 和 `pendingSteps`；MVP 不新增未契约化的 `readySummary` JSON blob。 | Epic 1 - install --json 的 InstallCommandData 承载 ready summary 自动化字段。 | ✓ Covered |
| FR63b | Human-readable install output 必须支持 CLI message catalog。MVP 默认 locale 为 `zh-CN`，并提供 `en-US` fallback；locale 可以通过 `--locale` 或 `SPECLITE_LOCALE` 显式指定。Message catalog 只翻译自然语言，不翻译 command name、flag、module id、target id、step id、path、schema id、issue id、reason code 或 JSON field。 | Epic 1 - Human-readable install output 使用 `zh-CN` 默认 message catalog 与 `en-US` fallback。 | ✓ Covered |
| FR64 | 系统可以在安装完成后展示用户下一步如何启动 AI agent 和调用帮助 skill。 | Epic 1 - 展示如何启动 AI agent 和调用帮助 skill。 | ✓ Covered |
| FR65 | 系统可以在安装完成后展示安装位置、已安装模块和已配置工具清单。 | Epic 1 - 展示安装位置、已安装模块和已配置工具清单。 | ✓ Covered |
| FR65a | 安装写入前的 final review 必须以稳定顺序展示 target、source descriptor、config mode、selected modules、IDE targets、planned writes 和 pending phases，并明确说明当前是否已写入项目文件以及确认后将发生的写入阶段。 | Epic 1 - 写入前 final review 以稳定顺序展示 target、source、config、modules、IDE targets、planned writes 和 pending phases。 | ✓ Covered |
| FR66 | SpecLite 维护者可以验证新增或修改的 source skill 是否可安装。 | Epic 6 - 验证新增或修改 source skill 是否可安装。 | ✓ Covered |
| FR66a | SpecLite 维护者必须能够生成完整、可复查、只读的全 canonical Skill corpus `grill` 引用清单，逐项记录 skill id、引用文件、引用表达、目标 skill/path 与引用用途，用于更名和路由变更后的人工确认与负向残留检查；生成清单不得修改被盘点的 canonical Skill definitions。 | Epic 11 - 生成全 canonical Skill corpus 的 `grill` 引用清单与残留检查证据。 | ✓ Covered |
| FR67 | SpecLite 维护者可以使用 fixture project 复现 fresh install 流程。 | Epic 6 - 使用 fixture project 复现 fresh install。 | ✓ Covered |
| FR68 | SpecLite 维护者可以使用 fixture project 验证安装前后目录变化。 | Epic 6 - 使用 fixture project 验证安装前后目录变化。 | ✓ Covered |
| FR69 | SpecLite 维护者可以使用 fixture project 验证 status、validate 和 update 行为。 | Epic 6 - 使用 fixture project 验证 status、validate 和 update。 | ✓ Covered |
| FR70 | SpecLite 维护者可以验证至少一个 skill 从 IDE 发现到产物输出的最小闭环。 | Epic 6 - 验证至少一个 skill 从 IDE 发现到 artifact 输出的闭环。 | ✓ Covered |
| FR71 | MVP 文档必须提供 fresh install、安装前后目录树、manifest/index、status/validate output 和 update protection 五类可执行示例；每类示例必须包含前置条件、命令或操作、expected artifact/output 与 verification step，并通过 docs link/reference check 及对应 fixture/CLI assertions 验证示例中的 command、path、field 与当前 contract 一致。 | Epic 6 - 用示例与 fixture 帮助文档读者理解安装结构和验证结果。 | ✓ Covered |
| FR71a | SpecLite 维护者必须将 Fixture expected outputs 作为契约测试资产，而不是仅供阅读的示例；新增模块、adapter、source type、validation rule、ownership 行为或 installed artifact kind 时，SpecLite 维护者必须同步相关 fixture 输入和 expected outputs。 | Epic 6 - Fixture expected outputs 作为契约测试资产同步维护。 | ✓ Covered |
| FR71b | Fixture case directory、expected output classes、snapshot comparison、ready summary gate、release gate / regression asset 区分和 baseline case 集合由 `_bmad-output/planning-artifacts/specs/08-fixture-contract.md` 管理。实现不得先更新 snapshots 再反推契约行为；契约变更必须先更新 owning SPEC 和 executable schema/parser，再更新 fixture expected outputs。 | Epic 6 - Fixture layout、expected outputs、snapshot comparison 和 release gate 由 owning SPEC 管理。 | ✓ Covered |
| FR72 | 项目维护者可以初始化或重建项目级配置。 | Epic 7 - 初始化或重建项目级配置。 | ✓ Covered |
| FR73 | 项目维护者可以列出可安装模块、skills、IDE targets 或版本。 | Epic 7 - 列出模块、skills、IDE targets 或版本。 | ✓ Covered |
| FR74 | 工具链维护者可以运行环境、source、权限、IDE target、manifest、路径规范化和文件完整性诊断。 | Epic 7 - 运行环境、source、权限、IDE target、manifest、路径和文件完整性诊断。 | ✓ Covered |
| FR75 | 工具链维护者可以显式同步 source 与 IDE mirrors。 | Epic 7 - 显式同步 source 与 IDE mirrors。 | ✓ Covered |
| FR76 | 项目维护者可以移除 installer-owned 安装结果。 | Epic 7 - 移除 installer-owned 安装结果。 | ✓ Covered |
| FR77 | Post-MVP 工具链维护者可以让 CI、企业工具链和自动化验证流程消费 MVP 机器可读输出；MVP 只负责提供稳定 `CommandResult` JSON 和 file contracts，不实现企业集成工作流本身。 | Epic 7 - Post-MVP CI、企业工具链和自动化验证流程消费 MVP 机器可读输出；MVP 不实现企业集成 workflow。 | ✓ Covered |
| FR78 | 企业规范负责人可以查看包含阶段入口覆盖率、标准产物存在率、validate 通过率和未解决缺口数量的规范落地与流程覆盖报告。该报告属于 Post-MVP，可在 MVP 最小阶段覆盖矩阵与 validate output 之上增加趋势、导出、多项目/团队视角和企业治理汇总。 | Epic 7 - 查看规范落地与流程覆盖报告。 | ✓ Covered |

### Missing Requirements（缺失需求）

- 无。PRD 中全部 106 个 FR 均在 Epic coverage map 中有唯一可追踪归属。

### Coverage Statistics（覆盖统计）

- Total PRD FRs：106
- FRs covered in epics：106
- Missing FRs：0
- Extra Epic-only FR labels：0
- Overall coverage：100.0%
- MVP gate scope：99/99 FR covered（FR1–FR71b，包含 lettered extensions）。
- Post-MVP backlog：7/7 FR covered by Epic 7（FR72–FR78），但按 PRD/Epic guard 不进入本次 MVP implementation readiness gate。

### Coverage Assessment（覆盖评估）

- Epic 1–6 覆盖初始 MVP 控制面；Epic 8–11 对已发现的 corrective scope 提供叠加覆盖。
- `FR13a`、`FR23b`–`FR23g`、`FR66a` 由 Epic 11 提供 artifact-topology corrective coverage。
- 未发现 Epic coverage map 中存在 PRD 未定义的 FR label。
- 本步骤仅确认 FR coverage presence；Epic/Story 内容与修订后 PRD 语义是否完全一致，将在后续 Story quality 与跨制品 alignment 步骤判断。

## UX Alignment Assessment（UX 对齐评估）

### UX Document Status（UX 文档状态）

- UX 文档已提供：主规格 `ux-design-specification.md`，以及 CLI 交互补充规格 `ux-install-cli-interaction-spec-2026-06-12.md`。
- 主 UX 规格已覆盖 CLI-only 产品形态、用户角色与旅程、Compact/Evidence/Structured 输出层级、plan-before-write、Ready Summary、Filesystem Space Map、Artifact Evidence Card、五个 plane、七类 runtime roots、`resolutionMode`、`legacy-compatible`、config/artifact mismatch 与 canonical Skill rename/deprecation 呈现。
- CLI 补充规格覆盖分阶段输出、prompt/summary 分离、ReadyCheck/Ready Summary gate、`zh-CN` 默认 locale、`en-US` fallback、`--yes` no-prompt flow、显式 interactive mode、终端宽度及无颜色输出；这些内容已被 PRD 的 `FR17a`、`FR63b`、`FR65a`、`NFR1a`、`NFR11a`、`NFR35b-14`、`NFR40e` 吸收。

### UX ↔ PRD Alignment（UX 与 PRD 对齐）

**Aligned Areas（已对齐领域）：**

- 产品界面边界一致：均限定为 local-first CLI/control plane，不引入 browser、mobile 或 desktop GUI。
- 用户模型一致：技术负责人、项目规范负责人、AI IDE 使用者、工具链维护者与方法论维护者均有对应任务流。
- 安装交互一致：模块选择、config mode、IDE targets、final review、write progress、ReadyCheck 与 Ready Summary 的顺序和阻断语义一致。
- 输出契约一致：human-readable output 与 structured JSON 分离；颜色、符号、TTY、locale 不改变机器契约。
- artifact topology 一致：UX 已采用 Brainstorming、Analysis、Planning、Solutioning、Implementation、DevOps 与 Project Knowledge roots，并明确 explicit config、fresh default、legacy fallback 与 non-migration。
- ownership、安全写入、诊断与 next action 的呈现原则与 PRD 一致。

**Issues（问题）：**

1. **UX artifact location 尚未闭合到修订后的 `FR23d`。** `FR23d` 要求 UX workflow、discovery 与引用统一使用 `{planning_artifacts}/ux/`，但本次实际发现并用于 gate 的主文件仍为 `ux-design-specification.md`，CLI 补充规格也仍位于 planning root。考虑到 Architecture 明确禁止 ordinary lifecycle 自动迁移既有 workflow artifacts，这不是授权迁移的理由；但在进入实现前必须明确由哪个 workflow/显式变更完成 canonical location、legacy discovery 与引用更新，否则 fresh-path contract 和当前 planning evidence 之间仍存在歧义。
2. **UX `Phase Coverage Matrix` vocabulary 超出 PRD 契约。** UX 定义 `mapped`、`missing`、`unsupported`、`failed`，而 `NFR24a` 与 Architecture 规定 installed phase coverage 只能使用 `mapped`、`unsupported`、`failed`。若 `missing` 仅为 human presentation state，应明确其由契约状态/缺失 row 派生且不得进入 installed matrix schema；否则必须移除或由 owning contract 扩展后再使用。

### UX ↔ Architecture Alignment（UX 与 Architecture 对齐）

**Aligned Areas（已对齐领域）：**

- CLI、filesystem-first、无数据库/无服务端、无前端 UI 的总体架构一致。
- UX 的五 plane / 七 runtime roots、`resolvedRoot`、`resolutionMode`、`legacy-compatible`、config/artifact mismatch 和 no-auto-migration 表达，均与 `SPEC 09` ownership 及 Architecture resolution flow 一致。
- UX 的 `CommandResult`、`ValidationIssue`、status/validate 分工、plan-before-write、operation safety、ownership evidence、terminal fallback 与 Architecture diagnostics/output boundary 一致。
- UX 对 Ready Summary 的 gate、installer step order、stable `stepId` 和 next action 呈现与 Architecture implementation patterns 一致。
- canonical Skill rename 只呈现 active identity 与 deprecation/redirect，不创建 alias surface，与 `SPEC 04`/Architecture 一致。

**Warnings（警告）：**

1. 主 UX frontmatter 的 `inputDocuments` 仅列出 Epic 1–7，没有记录本轮已用于 artifact topology/rename corrective scope 的 Epic 8–11，元数据 provenance 落后于正文与当前 Epic baseline。
2. CLI 补充规格仍标记为 `ready-for-prd-and-story`，属于较早输入制品；其规范内容已经被 PRD/Epic 吸收，但其状态和引用元数据未反映当前 downstream 已完成的事实。实现人员应以现行 PRD、Architecture owning SPEC 和 Epic/Story 为契约真源，不应把该补充规格当作更高优先级 schema owner。
3. Architecture validation 文件仍保留“UX/Epic 尚未同步、`Revalidation Required`”的历史交接语句；本次证据显示下游已发生同步。该语句应由本次 IR 结论取代，而不应被误读为 Architecture 本体仍缺少相应设计。

### UX Alignment Verdict（UX 对齐结论）

- **总体对齐度：高，但存在 2 个需要在 implementation authorization 前处置或明确裁决的跨制品缺口。**
- UX 设计本身足以指导 CLI 交互实现；阻断风险集中在 artifact routing/discovery 的 canonical location 闭合，以及 `Phase Coverage Matrix` 的 layer-scoped status vocabulary。

## Epic Quality Review（Epic 质量审阅）

### Review Scope（审阅范围）

- 已审阅 Epic 1–11，共 68 个 Story；其中 Epic 7 的 5 个 Story 属于 Post-MVP，不进入本次 MVP implementation gate，但仍接受结构质量检查。
- 68/68 Story 均具有用户角色/目标/价值叙述、Acceptance Criteria 和 Requirement Traceability。
- Acceptance Criteria 使用中文 `前提/当/则/并且` 或英文 `Given/When/Then/And`；两种表达均可测试，未发现仅以“功能可用”之类不可验证句子作为唯一验收标准的 Story。

### Epic Structure Validation（Epic 结构验证）

**User Value（用户价值）：**

- Epic 1–7 分别向项目维护者、AI IDE 使用者、工具链维护者和 SpecLite 维护者交付安装、发现、验证、更新、来源治理、发布信心和 Post-MVP 治理能力。
- Epic 8–11 虽使用 `contract`、`hardening`、`governance` 等技术措辞，但正文均绑定可观察用户结果：可扫描 CLI 输出、source-independent installed workflow activation、可选择 ecosystem modules、phase-aligned artifact discovery 与兼容演进。因此未判定为“纯技术里程碑 Epic”。

**Epic Independence（Epic 独立性）：**

- 未发现 Epic N 明确依赖 Epic N+1 才能产生其核心用户价值的跨 Epic 前向依赖。
- Epic 1 提供可独立完成的 bundled-source fresh install；Epic 2–6 逐步消费前序安装状态并增加独立能力。Epic 8–11 是 corrective scope，各自声明 guard 与 owning contract，未反向改变前序 Epic 的 MVP 基本语义。
- Epic 7 明确隔离为 Post-MVP，不作为 MVP 完成条件。

### Story Quality Findings（Story 质量发现）

#### Critical Violations（严重违规）

1. **Epic 8 的 canonical Story 编号与其声明的逻辑依赖冲突。** `Logical Dependency / Corrective Addendum` 要求 Story 8.8 在 Story 8.2–8.7 之前完成，但文件编号仍按 8.2–8.7 后、8.8 前的历史添加顺序排列。文档说明当前 Story 均已 `done`，这可以解释历史执行，却不能使该序列满足“Story 只能依赖更早 Story”的实施规划规则。若 Epic 8 仍作为可重放/维护的 implementation plan，必须重编号或建立明确的 replacement baseline；若仅保留为已完成历史记录，应从待实施 backlog 与本次 authorization scope 中显式排除，避免 runner 按编号重放错误顺序。

#### Major Issues（主要问题）

1. **Story 10.1 尺寸达到 Epic 级。** 单一 Story 同时改变 canonical taxonomy、nested discovery、metadata/dependency schema、三类 backend Skill 迁移、interactive two-level selection、selected-only projection、status/validate/update/repair/uninstall installed-state truth 和最小 fixture/docs proof。建议至少拆为 taxonomy/discovery contract、interactive selection、source migration 与 selected-only projection/proof 四个可独立验证 Story，并保持后续 Story 10.2–10.6 的顺序不产生前向依赖。
2. **Story 11.1 是跨多组件的大型基础 Story。** 它同时要求 config/schema、installer directory planner、resolver fallback、manifest projection、validator diagnostics、workflow compatibility 与多类 fixtures 完成七个 root 的演进。该 Story 虽具有单一用户结果且范围边界清楚，但实现风险和回归面过大；建议拆成 executable root-resolution contract、fresh-install projection、existing-install compatibility/diagnostics 三个连续 Story，或至少在 Story 文件中建立可独立 gate 的 task slices。
3. **Story 6.3 聚合三个可独立失败的验收域。** `ide-drift`、source-integrity fixture group 与 resolve-parity fixtures 分属不同 contract owner 和失败模式。建议拆分，避免一个 Story 因其中任一域延迟而无法交付其余 release evidence。
4. **Story 7.2 将三个独立产品命令合并。** `doctor`、`sync`、`uninstall` 的用户旅程、授权边界、读写模型和 failure semantics 不同，应拆为三个 Story。该问题属于 Post-MVP，不阻断本次 MVP gate，但会阻断 Epic 7 后续排期质量。

#### Minor Concerns（次要问题）

1. Epic 1–8 与 Epic 9–11 混用二级/三级 Story heading 及中英文 BDD 标记；语义不受影响，但会增加自动索引与模板验证复杂度。
2. Epic 8 在 planning artifact 内嵌“当前 sprint Story 8.1–8.9 均为 `done`”的易变状态声明。应以 sprint tracker 为权威，Epic 文档只保留 dependency rationale，避免状态陈述随 tracker 漂移。
3. 若干 corrective Story 的 AC 使用“实现本 Story”作为 `Given/前提`。这些 AC 仍有可观察 `Then`，但建议将前提改为具体输入状态或 contract baseline，使验收可在独立 fixture 中复现。

### Special Implementation Checks（专项实现检查）

- **Starter template/scaffold：通过。** Architecture 选择 custom TypeScript Node CLI starter；Story 1.1 明确建立 ESM package、commander、tsup、tsx、vitest、bin mapping、contract anchors 与最小 fixture skeleton，满足 greenfield initial setup 要求。
- **Greenfield readiness：通过。** Story 1.1 提供项目脚手架和测试基础；Architecture 同时定义 CI workflow、Node 22/24 matrix 与 packaging gate。
- **Database/entity timing：不适用。** PRD/Architecture 明确 filesystem-first 且 MVP 不使用数据库；未发现提前创建数据库表或全量 entity 的 Story。
- **Traceability：通过。** 68/68 Story 均有 Requirement Traceability；FR coverage 已在上一步达到 106/106。

### Epic Quality Verdict（Epic 质量结论）

- **Critical：1**
- **Major：4**（其中 1 项仅影响 Post-MVP）
- **Minor：3**
- Epic/Story 的需求覆盖和 AC 可测试性总体强，但 Epic 8 的前向依赖结构、Story 10.1/11.1 的尺寸会降低 deterministic serial implementation 的安全性。进入相应 Story 实施前必须先完成重排/拆分，或提供明确的 scope exclusion 与 task-level gate 作为等价处置证据。

## Summary and Recommendations（总结与建议）

### Overall Readiness Status（整体就绪状态）

**NEEDS WORK（需要修订）**

Planning artifacts 已达到较高完整度：必需文档类型齐全，修订后 PRD validation 为 Pass，106/106 FR 已映射至 Epic，UX 与 Architecture 的核心产品模型和契约边界高度一致，68/68 Story 均具备可测试 AC 与 requirement traceability。

但当前不应给出无条件 implementation authorization。Epic 8 的 Story 编号与声明的执行依赖冲突；UX 的 installed phase coverage vocabulary 超出 owning contract；Story 10.1 与 Story 11.1 的范围过大，不适合未经拆分直接进入 strict-serial 实施。这些问题不会否定已完成的需求工作，但会让 runner 顺序、schema 实现和验收边界产生不必要歧义。

### Critical Issues Requiring Immediate Action（需立即处理的关键问题）

1. **裁决 Epic 8 的实施身份与顺序。** 若 Epic 8 是已完成历史记录，必须从当前待实施 authorization scope 中显式排除，并以 live sprint tracker/完成证据确认；若需要重放或维护，应重编号或建立新的 canonical sequencing，使 Story 8.8 不再成为 Story 8.2–8.7 的前向依赖。
2. **统一 Phase Coverage Matrix vocabulary。** 明确 UX 的 `missing` 只是 human renderer 派生状态，不能进入 installed phase coverage schema；或者先修改 owning SPEC、PRD `NFR24a`、Architecture、Epic/Story 和 fixtures，再允许新增 schema literal。
3. **为大型 Story 建立可执行拆分。** Story 10.1 必须拆分为多个独立 vertical slices；Story 11.1 至少需要 contract/fresh-install/compatibility 三个独立 gate，避免一次改动跨 resolver、installer、manifest、validator、workflow 和 fixtures 后才获得反馈。

### Recommended Next Steps（建议下一步）

1. 使用 `bmad-create-epics-and-stories` 或 `bmad-edit` 等 owner workflow 修订 Epic 8 sequencing，并拆分 Story 10.1、Story 11.1；同步 Epic index、traceability 和 dependency sections。
2. 由 UX/contract owner 处置 `Phase Coverage Matrix` 的 `missing` vocabulary，并更新 UX frontmatter provenance（补充 Epic 8–11 或当前真正输入集）。
3. 对 `{planning_artifacts}/ux/` routing 做明确的 pre-implementation acceptance：区分现有 legacy artifact 的可发现性与 fresh workflow 的 canonical output path；不要把普通 update/repair 当作 artifact migration。
4. 将 Story 6.3 拆成独立 fixture evidence Story；在进入 Post-MVP 前拆分 Story 7.2 的 `doctor`、`sync`、`uninstall`。
5. 修订后重新运行 Implementation Readiness Check；只有 Critical 为 0、MVP Major 已处置或有明确等价 gate，才更新 sprint tracking 或发出 implementation authorization。

### Assessment Metrics（评估指标）

- Required document types：4/4 present（PRD、UX、Architecture、Epics/Stories）
- PRD validation：Pass；Run 2 为 5/5 Excellent，0 findings
- FR coverage：106/106，100.0%
- MVP FR coverage：99/99；Post-MVP：7/7 mapped but excluded from MVP gate
- Story review：68/68 reviewed；68/68 with traceability
- Issues requiring attention：13，分布于 2 个主要类别
  - UX alignment：2 issues + 3 warnings
  - Epic quality：1 Critical + 4 Major + 3 Minor

### Final Note（最终说明）

本次结论是“需要修订”，不是“规划失败”。PRD、Architecture 与覆盖映射已经具备稳固基线；优先修复 sequencing、schema vocabulary 和 oversized Story boundaries 后，可用较小成本重新建立 implementation gate。当前报告只提供 readiness 判断，不授权修改产品实现、迁移既有 workflow artifacts 或更新 sprint tracker。

**Assessment Date（评估日期）：** 2026-08-17  
**Assessor（评估者）：** Codex / BMAD Implementation Readiness workflow
