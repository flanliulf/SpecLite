---
project: SpecLite
date: 2026-05-26
stepsCompleted:
  - step-01-document-discovery
  - step-02-prd-analysis
  - step-03-epic-coverage-validation
  - step-04-ux-alignment
  - step-05-epic-quality-review
  - step-06-final-assessment
includedDocuments:
  prd: "_bmad-output/planning-artifacts/prd/"
  architecture: "_bmad-output/planning-artifacts/architecture/"
  epics: "_bmad-output/planning-artifacts/epics/"
  ux: "_bmad-output/planning-artifacts/ux-design-specification.md"
  specs: "_bmad-output/planning-artifacts/specs/"
  context: "CONTEXT.md"
excludedDocuments:
  - "_bmad-output/planning-artifacts/archive/"
  - "_bmad-output/planning-artifacts/research/"
  - "_bmad-output/planning-artifacts/specs/*.en.md"
  - "_bmad-output/planning-artifacts/prd-validation-report.md"
---

# Implementation Readiness Assessment Report

**Date:** 2026-05-26
**Project:** SpecLite

## Document Discovery（文档发现）

### Selected Scope（选定范围）

- PRD：`_bmad-output/planning-artifacts/prd/`
- Architecture：`_bmad-output/planning-artifacts/architecture/`
- Epics & Stories：`_bmad-output/planning-artifacts/epics/`
- UX：`_bmad-output/planning-artifacts/ux-design-specification.md`
- Contract artifacts：`_bmad-output/planning-artifacts/specs/` 中的中文 canonical `.md`
- Context artifact：`CONTEXT.md`

### PRD Files Found（PRD 文件）

**Whole Documents（整本文档）**

- `prd-validation-report.md`（13,310 bytes，2026-05-13 10:48:21）- validation report，未作为 PRD 正本纳入。

**Sharded Documents（拆分文档）**

- Folder: `prd/`
  - `index.md`
  - `01-executive-summary执行摘要.md`
  - `02-project-classification项目分类.md`
  - `03-success-criteria成功标准.md`
  - `04-product-scope产品范围.md`
  - `05-user-journeys用户旅程.md`
  - `06-domain-specific-requirements领域特定需求.md`
  - `07-innovation-novel-patterns创新与新模式.md`
  - `08-developer-tool-specific-requirements开发者工具特定需求.md`
  - `09-project-scoping-phased-development项目范围界定与阶段化开发.md`
  - `10-functional-requirements功能需求.md`
  - `11-non-functional-requirements非功能需求.md`

### Architecture Files Found（Architecture 文件）

**Whole Documents（整本文档）**

- 未发现 active whole architecture document。

**Sharded Documents（拆分文档）**

- Folder: `architecture/`
  - `index.md`
  - `01-project-context-analysis项目上下文分析.md`
  - `02-starter-template-evaluationstarter-模板评估.md`
  - `03-core-architectural-decisions核心架构决策.md`
  - `04-implementation-patterns-consistency-rules实现模式与一致性规则.md`
  - `05-project-structure-boundaries项目结构与边界.md`
  - `06-architecture-validation-results架构验证结果.md`

### Epics & Stories Files Found（Epics 与 Stories 文件）

**Whole Documents（整本文档）**

- 未发现 active whole epics document。

**Sharded Documents（拆分文档）**

- Folder: `epics/`
  - `index.md`
  - `01-overview概览.md`
  - `02-requirements-inventory需求清单.md`
  - `03-epic-listepic-列表.md`
  - `04-epic-1-project-installation-onboarding项目安装引导.md`
  - `05-epic-2-methodology-discovery-and-skill-execution方法论发现与-skill-执行.md`
  - `06-epic-3-installed-state-and-deterministic-validation已安装状态与确定性验证.md`
  - `07-epic-4-safe-update-and-repair安全更新与修复.md`
  - `08-epic-5-source-integrity-and-distribution-channels来源完整性与分发渠道.md`
  - `09-epic-6-maintainer-fixture-and-release-confidence维护者-fixture-与发布信心.md`
  - `10-epic-7-post-mvp-governance-expansionpost-mvp-治理扩展.md`

### UX Design Files Found（UX Design 文件）

**Whole Documents（整本文档）**

- `ux-design-specification.md`（55,968 bytes，2026-05-25 20:42:05）

**Sharded Documents（拆分文档）**

- 未发现。

### Contract And Context Files Found（契约与上下文文件）

**Contract Documents（契约文档）**

- Folder: `specs/`
  - `README.md`
  - `01-command-result-json-contract.md`
  - `02-source-descriptor-contract.md`
  - `03-install-plan-contract.md`
  - `04-manifest-index-contract.md`
  - `05-ide-adapter-registry-contract.md`
  - `06-resolve-command-contract.md`
  - `07-validation-issue-taxonomy.md`
  - `08-fixture-contract.md`

**Context Documents（上下文文档）**

- `CONTEXT.md`（67,587 bytes，2026-05-19 12:08:00）

### Issues Found（发现的问题）

- 未发现 active whole + sharded 的阻塞性重复格式。
- `_bmad-output/planning-artifacts/archive/` 下存在旧 whole 文件：`prd.md`、`architecture.md`、`epics.md`。这些文件是 historical snapshot，不参与 readiness gate。
- `_bmad-output/planning-artifacts/specs/*.en.md` 是 mirror，不作为独立契约来源。
- `_bmad-output/planning-artifacts/research/` 是 historical evidence，不参与 readiness gate。
- `prd-validation-report.md` 是 PRD validation report，不作为 PRD source document。

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
- FR14: 系统可以发现正式可分发的 SpecLite source skills。
- FR15: 系统可以将同一 canonical skill 暴露到多个目标 AI IDE。
- FR16: 项目维护者可以查看安装完成后的项目结构和安装摘要。
- FR17: 项目维护者可以查看安装完成后的下一步使用指引。
- FR18: 安装器可以生成 IDE-specific discovery metadata，列出研发阶段、canonical skill id、skill 名称、目标 IDE entry path 和激活 target。Manifest、skill index、help index、files index 与最小阶段覆盖矩阵的字段、版本、hash 和 ownership 规则由 `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md` 作为 canonical contract 管理；IDE adapter id、target id、target order、capability 与 status 语义由 `_bmad-output/planning-artifacts/specs/05-ide-adapter-registry-contract.md` 管理。
- FR19: MVP 中每个 IDE adapter 必须把 discovery metadata 映射为该 IDE target directory 中的 self-contained skill entry，并报告 mapped、unsupported 或 failed 状态。Adapter schema 可以声明 `commandPointerBehavior: "none" | "unsupported"` 作为 Post-MVP 扩展位，但 MVP 不生成 command pointer artifact。
- FR20: AI IDE 使用者可以通过已映射的 IDE entry 选择并激活 SpecLite skill。
- FR21: AI IDE 使用者可以调用 SPEC、方案评审、故事规划、实现、测试和审查相关能力；每项能力必须映射到至少一个 canonical skill id。
- FR22: 已激活的 skill 可以读取项目级配置、customization 覆盖和相关上下文。
- FR23: 已激活的 workflow 可以将产物输出到配置约定的位置，并在产物中记录 workflow type、source skill 和生成时间。MVP artifact contract 至少校验 artifact type、默认输出路径、configured artifact root、`workflowType`、`sourceSkill` 和 `generatedAt` 元数据字段；artifact root 和默认输出路径必须是 project-relative POSIX path 且位于 target project boundary 内，产物内容质量不进入 MVP validation。
- FR23a: Artifact metadata 的 MVP 校验必须覆盖最小值域：`workflowType` 必须是非空稳定字符串，`sourceSkill` 必须是非空 canonical skill id，`generatedAt` 必须存在且是 ISO 8601 string，且默认在 stable fixture snapshot comparison 中 normalize 或 exclude。
- FR24: 企业规范负责人可以查看 MVP 最小阶段覆盖矩阵，确认 SPEC、方案评审、故事规划、实现、测试和审查阶段是否存在 mapped skill entry、对应 canonical skill id、以及目标 IDE target 是否可见。MVP 阶段覆盖矩阵来自 manifest、help index 和 installed skill entries，最小字段必须覆盖 `phaseId`、`phaseLabel`、`moduleId`、`canonicalSkillId`、`ideTargets[].targetId`、`ideTargets[].entryPath`、`ideTargets[].activationTarget`、`ideTargets[].status` 和可选 `artifactContract`；不提供覆盖率百分比、趋势、团队汇总或治理 dashboard。
- FR25: 工具链维护者可以查看当前项目的 SpecLite 安装状态。
- FR26: 工具链维护者可以查看安装来源、版本和目标 IDE 覆盖情况。
- FR27: 工具链维护者可以验证 manifest、skill index、help index 和 files index 的有效性。
- FR28: 工具链维护者可以验证多个 IDE mirrors 是否与 canonical source 一致。
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
- FR35c: PRD 不定义第二份 public JSON 字段真源。新增 public JSON 字段、reason code、redacted path 形状、排序规则或 command-specific payload 行为时，必须先更新 owning SPEC，再同步 executable schema/parser 和 fixture expected outputs。Reason code producer 只能输出 owning SPEC registry 中的 MVP codes；consumer/parser 必须容忍 unknown future codes，并保留其 stable display string。
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
- FR59: 系统可以在安装来源不可用或不合法时给出明确失败原因。
- FR60: 系统可以在安装过程中展示 source discovery、manifest generation、IDE mirror creation、config initialization 和 ready check 的执行状态。
- FR61: 系统可以展示 shared scripts、module directories、configuration、help catalog 和 IDE integrations 的安装结果。
- FR62: 系统可以展示每个已配置 AI IDE 的 skill 数量和目标目录。
- FR63: 系统可以在安装完成后展示包含安装路径、manifest version、source descriptor、已安装模块、IDE targets、关键目录和下一步命令的 SpecLite ready summary。
- FR63a: Ready summary 的 human-readable 输出可以包含解释性文案，但 automation 依赖必须进入 `install --json` 的 `InstallCommandData` 字段，例如 `sourceDescriptor`、`manifestVersion`、`installedModules`、`ideTargets`、`paths`、`completedSteps` 和 `pendingSteps`；MVP 不新增未契约化的 `readySummary` JSON blob。
- FR64: 系统可以在安装完成后展示用户下一步如何启动 AI agent 和调用帮助 skill。
- FR65: 系统可以在安装完成后展示安装位置、已安装模块和已配置工具清单。
- FR66: SpecLite 维护者可以验证新增或修改的 source skill 是否可安装。
- FR67: SpecLite 维护者可以使用 fixture project 复现 fresh install 流程。
- FR68: SpecLite 维护者可以使用 fixture project 验证安装前后目录变化。
- FR69: SpecLite 维护者可以使用 fixture project 验证 status、validate 和 update 行为。
- FR70: SpecLite 维护者可以验证至少一个 skill 从 IDE 发现到产物输出的最小闭环。
- FR71: 文档读者可以通过 fresh install 示例、安装前后目录树、manifest/index 示例、status/validate 输出示例和 update 保护示例理解安装后结构、常用命令和验证结果。
- FR71a: Fixture expected outputs 是契约测试资产，不是仅供阅读的示例；新增模块、adapter、source type、validation rule、ownership 行为或 installed artifact kind 时，必须同步相关 fixture 输入和 expected outputs。
- FR71b: Fixture case directory、expected output classes、snapshot comparison、ready summary gate、release gate / regression asset 区分和 baseline case 集合由 `_bmad-output/planning-artifacts/specs/08-fixture-contract.md` 管理。实现不得先更新 snapshots 再反推契约行为；契约变更必须先更新 owning SPEC 和 executable schema/parser，再更新 fixture expected outputs。
- FR72: 项目维护者可以初始化或重建项目级配置。
- FR73: 项目维护者可以列出可安装模块、skills、IDE targets 或版本。
- FR74: 工具链维护者可以运行环境、source、权限、IDE target、manifest、路径规范化和文件完整性诊断。
- FR75: 工具链维护者可以显式同步 source 与 IDE mirrors。
- FR76: 项目维护者可以移除 installer-owned 安装结果。
- FR77: Post-MVP 工具链维护者可以让 CI、企业工具链和自动化验证流程消费 MVP 机器可读输出；MVP 只负责提供稳定 `CommandResult` JSON 和 file contracts，不实现企业集成工作流本身。
- FR78: 企业规范负责人可以查看包含阶段入口覆盖率、标准产物存在率、validate 通过率和未解决缺口数量的规范落地与流程覆盖报告。该报告属于 Post-MVP，可在 MVP 最小阶段覆盖矩阵与 validate output 之上增加趋势、导出、多项目/团队视角和企业治理汇总。

Total FR entries: 94（包含 FR1-FR78 及 `FR23a`、`FR28a` 等子需求；FR72-FR78 标注为 Post-MVP backlog）。

### Non-Functional Requirements（非功能需求）

- NFR1: 在常规 fixture 项目中，fresh install 必须至少输出 source discovery、manifest generation、IDE mirror creation、config initialization 和 ready check 5 个阶段状态；fixture baseline 应记录阶段顺序和完成结果。Machine-readable progress `stepId` 必须使用 stable lower-kebab id，例如 `ready-check`，作为 fixture-observable deterministic signal；它不是 MVP automation API。Automation 依赖必须读取 `CommandResult.data.completedSteps` 和 `CommandResult.data.pendingSteps`。Human-readable step label 可以是 `ready check`；contract/internal guard 名称统一为 `ReadyCheck`。阶段耗时只作为 performance evidence 或 human-readable/profiling 数据，默认不得进入 stable command JSON snapshots。
- NFR2: `status` 在常规 fixture 项目中应在 2 秒内返回项目安装摘要，不执行完整文件完整性扫描；性能基准以 3 次连续运行的 p95 结果为准。
- NFR2a: MVP `status` 必须是轻量本地只读摘要，只读取本地 manifest、source descriptor、manifest version、installed modules、IDE target summary、关键路径和 high-level health；不得访问 npm registry、private registry、Git remote、offline bundle origin 或其他远程 source，不得执行 remote freshness check、provenance revalidation、完整文件 hash scan 或隐式 update check。
- NFR3: `validate` 可以执行完整 local deterministic validation；`validate.data.checkedCategories` 和 validate progress 必须使用 canonical issue category order：`environment`、`manifest-schema`、`source-integrity`、`ide-mirror`、`runtime-path`、`menu-target`、`legacy-namespace`、`artifact-path`、`file-integrity`、`operation-lock`、`update`。常规 fixture 项目中每个实际执行类别必须在开始和结束时输出状态。
- NFR4: `update` 与 `validate` 必须跳过 hash 未变化的 source skills 和 IDE mirrors；在 fixture baseline 中，未变化文件的重复写入次数必须为 0。
- NFR5: fixture project 中的 fresh install、status、validate、update 必须记录 baseline runtime；任一命令相较上一 accepted baseline 退化超过 25% 时，验证报告必须标记为 performance regression。
- NFR5a: Runtime/p95 baseline、regression percentage 和 profiling sample 必须作为 release/performance evidence 保存，不得进入 stable `CommandResult` JSON 或 stable fixture snapshots。MVP 可以用 release checklist section 或 non-stable `performance-evidence` artifact 承载 measurement；fixture 只断言 evidence 存在、测量口径和 pass/fail conclusion，不比较具体 wall-clock values。
- NFR6: 相同 source、配置、目标 IDE 和安装目录在同一平台上重复安装，应生成 byte-for-byte 一致的 `_speclite/_config`、manifest/index 和 IDE mirror 文件；允许差异仅限明确标记的时间戳字段。
- NFR7: `install` 对已存在安装内容必须输出 existing-install 状态，列出 detected runtime、manifest version、IDE targets 和下一步选项，不得静默覆盖已有 SpecLite 状态。
- NFR8: `update` 必须在修改文件前完成所有权和本地变更判断；无法确认安全时必须跳过该文件、输出 conflict 状态，并保留原文件不变。
- NFR9: `validate` 的检查结果必须可复现，同一安装状态下连续运行 3 次应返回相同 issue id、category、severity 和 affected path 集合。
- NFR9a: MVP `validate` 必须是本地确定性命令，不得访问 npm registry、private registry、Git remote、offline bundle origin 或其他远程 source；不得执行 remote freshness check 或 provenance revalidation。远程重新验证只能发生在显式 `update`、安装来源解析流程或 Post-MVP `doctor` 中。
- NFR10: 安装失败时，系统不得展示 ready summary；失败结果必须列出 completed steps、failed step、pending steps 和 manual action，且退出状态不得为成功。
- NFR11: ready summary 只能在 source discovery、manifest generation、IDE mirror creation、config initialization 和 ReadyCheck 全部成功后展示；ReadyCheck 是 install 内部最小就绪检查，不等同于完整 `speclite validate`。
- NFR12: 安装器不得在 install plan 未声明且用户未确认的情况下访问远程 source、下载额外资源或执行外部脚本；install summary 必须记录每个 external access 的 redacted/display-safe source、reason 和 confirmation state。
- NFR13: bundled source、自定义 Git source、local path、tarball 和 offline bundle 必须在安装摘要中展示 source type、redacted/display-safe source value、resolved version 或 content hash。
- NFR13a: `sourceDescriptor.trustStatus` 必须区分 `trusted`、`unverified` 和 `blocked`：MVP 中只有 expected hash、lock match，或 bundled source 的等价 packaging manifest / package hash / package lock match 可产生 `trusted`，不提供通用 trusted source allowlist schema；缺少信任锚但可安装的 source 为 `unverified`；hash mismatch、lock mismatch、unsupported source 或 Post-MVP source policy 拒绝必须为 `blocked` 并阻止写入。
- NFR13b: `sourceDescriptor.contentHash` 不对所有 source type 强制存在；MVP 必须强制 `sourceDescriptor.integrityEvidence` 至少包含一种可复现证据。bundled source 记录 packaging manifest / package hash / lock evidence；registry source 记录 package/version/integrity 或 lock match；tarball/offline bundle 记录 content hash；Git source 记录 commit SHA；local source 记录 snapshot hash 或等价 manifest hash。只指定 remote URL、branch 或 tag 的浮动 Git source 不得写入。缺少完整性证据时必须输出 `source-integrity` error 并阻止写入。
- NFR13b-1: Local source snapshot hash 只覆盖 canonical source tree allowlist，必须排除 `.git`、临时文件、`node_modules`、fixture output、本地 cache、build output 和 editor/OS metadata。Local source 不得指向目标项目中的 `_speclite/`、`.claude/skills/`、`.agents/skills/`、`_speclite-output/`、fixture output、`node_modules/`、cache、temporary 或 build output；违反时必须输出 `source-integrity.local-source-self-reference` 并阻止写入。Tarball/offline bundle 至少必须记录包文件 artifact hash；解包后的 canonical source tree hash 可作为 expected installed state 输入，但不得与 artifact `contentHash` 混用。
- NFR13b-2: Source staging、临时解包目录、package-manager cache path 和临时 Git checkout path 是 private implementation state，不得进入 public JSON、manifest/index、files index、fixture snapshot 或 `ValidationIssue.details`。受控成功/失败应 best-effort cleanup；崩溃残留不属于 installed-state validation 范围。
- NFR13c: `integrityEvidence[].verified === false` 只能表示 evidence 可复现但未被 expected hash 或 lock match 背书，并且只能对应 `sourceDescriptor.trustStatus === "unverified"`。hash mismatch、lock mismatch 或 evidence 校验失败必须输出 `source-integrity` error，将 source 标记为 `blocked` 并阻止写入。
- NFR13d: `source-integrity` 与 `file-integrity` 必须是不同 issue category。source resolver/install planning 阶段的来源证据、registry/proxy/authentication failure、unreadable tarball/offline bundle 或 Post-MVP source policy 问题必须使用 `source-integrity`；已安装文件、manifest files index 或 IDE mirror hash mismatch 必须使用 `file-integrity` 或更具体的 `ide-mirror` category。
- NFR13e: Source descriptor 字段与语义以 `_bmad-output/planning-artifacts/specs/02-source-descriptor-contract.md` 为准。PRD、Architecture、Manifest/index 和 CommandResult 中的 source descriptor 描述只作为摘要或投影，不得各自定义 trust/evidence 规则。
- NFR14: human-owned custom 文件、workflow-owned 产物和发生 drift 的 IDE mirror 文件不得被 install 或 update 静默覆盖；覆盖保护通过 ownership manifest、路径规则和 hash comparison 共同判断。
- NFR15: 对遗留入口或 stale entries 的处理必须默认提供 path、risk category、suggested manual action 和 verification command，不应在未确认的情况下删除用户目录中的文件。
- NFR16: validate 报告和 JSON payload 不得泄露 home directory 以外的无关本机路径、环境变量值或认证信息；路径展示应使用 project-relative POSIX path，只有项目外诊断场景可使用明确标记的 redacted absolute path。
- NFR17: installer 生成的脚本和配置文件必须在 manifest 中记录 generator、source version、content hash 和 ownership，便于用户审查其由 SpecLite 安装器生成。
- NFR17a: Manifest/index schema、skill/help/files index、minimum phase coverage matrix、canonical target ordering、package-level hash 与 file-level hash 的职责分离必须遵守 `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md`。Canonical skill package hash 用于跨 IDE mirror 一致性；files index 的 file-level hash 用于 drift detection、update planning、repair planning、changed paths、skipped paths 和 conflicts。File hash 基于 raw bytes；line ending、executable bit、file mode、symlink handling 和 case conflict 是独立 validation dimensions。Runtime scripts 与 generated scripts 必须在 files index 中记录 `executable`。
- NFR17b: Canonical source text files 必须使用 LF。Installer 不得按平台改写 canonical text line endings；如果必须生成平台专用脚本，必须作为独立 generated file 记录自己的 files index entry 和 raw-byte hash。`executable` 表示 POSIX executable intent；Windows 不要求 POSIX chmod 语义，但仍保留该字段用于脚本生成意图和跨平台 fixture。
- NFR18: MVP 必须支持 macOS 13+ 和 Windows 11 的核心安装、状态检查、验证和更新路径；不满足平台要求时必须输出 `environment.unsupported-platform` 诊断。
- NFR19: 所有 manifest、index、hash、validate 报告、IDE target 记录、`CommandResult.data` path fields、`issues[].affectedPath` 和 plan action affected paths 必须使用 project-relative POSIX-style path，并通过同一 normalization function 生成。
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
- NFR35c: command-specific `data` payload 不得使用未记录字段作为自动化依赖；新增、弃用或重命名 payload 字段必须通过 `CommandResult.schemaVersion` 和 fixture expected outputs 管理。
- NFR35d: JSON path fields 必须可跨 macOS/Windows 和不同 checkout root 稳定比较；fixture snapshots 不得依赖 absolute local path、OS-specific separators 或 home directory；`data.paths.projectRoot` 必须为 `"."`。
- NFR35e: `ValidationIssue.issueId` 必须可跨不同 affected path、IDE target、source name、hash 和运行次数稳定比较。Issue id 不得包含动态值；新增 validation rule 可以新增 issue id，但不得改变已有 issue id 的问题类型语义。
- NFR35f: `ValidationIssue.details` 必须可被 fixture snapshot 稳定比较，并不得泄露 absolute path、home directory、环境变量、认证信息、stack trace、raw exception object、timestamp、随机 id 或其它非确定性字段。
- NFR35g: `ValidationIssue.severity` 必须作为 `CommandResult.status` 和 exit code 的稳定输入；各 validation rule 不得自行重定义 severity 语义，不得用 warning 阻断命令，也不得在 error/critical issue 存在时输出 command success。
- NFR35h: `ValidationIssue.impact` 与 `ValidationIssue.suggestedNextStep` 必须可被 fixture snapshot 稳定比较；不得包含 path、IDE target、source name、timestamp、stack trace、hash、随机值或长段解释。
- NFR35i: public JSON timestamp 必须是显式例外而非默认能力；任何允许 timestamp 的字段必须在 schema 中声明，并从 stable fixture snapshot comparison 中排除。
- NFR35j: public JSON arrays 不得依赖 filesystem traversal、object insertion、rule execution、adapter completion 或 async completion order。`changedPaths`、`skippedPaths`、`conflicts`、`completedSteps`、`pendingSteps`、`installedModules` 等数组必须在 schema 中声明排序规则。
- NFR36: source discovery、module selection、IDE adapter、manifest/index 生成和 validation checks 必须通过独立模块边界和公开接口连接；新增 adapter 不得修改 source discovery 逻辑。
- NFR37: 新增官方模块只允许通过 module metadata、skill package 和 manifest/index generation 扩展安装流程，不应要求重写 installer pipeline。
- NFR38: 新增验证规则不得改变已有 issue id、category、severity 字段含义；需要新增字段时必须通过 schema version 扩展。
- NFR39: 配置和定制化解析逻辑必须集中在统一 resolver 中；skill 或 adapter 不得实现自己的配置合并规则。
- NFR40: fixture project 应作为维护者验证 installer 行为的基础资产；每个新增安装能力必须同步新增或更新 fixture case、expected output 和 validation assertion。
- NFR40a: MVP release gate fixtures 必须在 Node 22 和 Node 24 上通过，并包含 macOS 与 Windows path-portability 证据。Windows fixture 不要求 POSIX chmod，但必须验证 files index 中的 `executable` intent 和受支持的脚本入口可用性。
- NFR40b: MVP release gate fixtures 必须包含最小 `skill-artifact-loop`，覆盖 installed IDE entry discovery、activation protocol、resolver access 和 artifact metadata 值域；多 skill、复杂 workflow 质量和人工评审结论属于 regression assets 或 Post-MVP validation。
- NFR40c: `source-integrity` release gate 必须拆为稳定 sub-cases，至少覆盖 `bundled-packaging-trusted`、`bundled-packaging-missing-evidence-blocked`、`registry-lock-trusted`、`registry-unverified`、`git-floating-blocked`、`local-source-snapshot-unverified`、`local-source-path-redacted`、`local-source-installed-state-blocked`、`artifact-hash-mismatch-blocked` 和 `source-unreadable-blocked`。
- NFR40d: Release packaging acceptance 必须作为 release checklist gate 生成 packaging manifest，验证 npm package、local tarball 和 offline bundle 包含 compiled CLI、`package.json` bin mapping、`assets/source/speclite/`、installer/runtime schemas、runtime scripts/templates 和安装执行所需 runtime assets；`test/fixtures/` 与 root `fixtures/` 默认不得进入 package，除非明确标记为 packaged documentation example。Packaging acceptance 不一定是 fixture project case，但必须有 stable artifact、expected assertions 和 CI/release evidence。

Total NFR entries: 95（包含 NFR1-NFR40 及 `NFRxxa/b/c` 子需求）。

### Additional Requirements（其他要求与约束）

- MVP 类型是 Platform MVP / Control Plane MVP，目标是交付 source skills 到多 AI IDE mirrors、`_speclite` metadata、manifest/index、`_speclite-output`、status/validate/update 的最小可信闭环。
- MVP 必须服务五类核心旅程：多 AI IDE 安装、阶段化 skill 使用、安装漂移排查、可安装 skill 发布验证、企业研发规范落地验证。
- 正式 MVP 主命令只宣传 `install`、`status`、`validate`、`update`；`resolve` 是 runtime support command，不作为主用户旅程命令宣传。
- GitHub Copilot/Cursor 在 MVP 中只能通过 `.agents/skills` 兼容 target 使用；专用 command pointer、专用 adapter、`sync`、顶层 `repair`、`doctor`、`uninstall`、完整迁移指南、企业 dashboard 和完整 source lockfile lifecycle 均为 Post-MVP。
- PRD 明确声明 field-level contract 不由 PRD/Architecture 复制维护；当 owning SPEC 存在时，字段 schema、排序、路径、timestamp、fixture、taxonomy、resolver、manifest、adapter 和 install plan 以对应 SPEC 为准。
- 安装与验证必须是本地、离线、可重复的文件系统控制面，不依赖云服务、数据库或后台守护进程。
- 文件所有权必须清晰区分 installer-owned、human-owned 与 workflow-owned；human-owned custom TOML 和 workflow artifacts 不得被 install/update/repair 静默覆盖。
- Fixture project 和 expected outputs 是验收资产；新增模块、adapter、source type、validation rule、ownership 行为或 installed artifact kind 必须同步 fixture 输入与 expected outputs。

### PRD Completeness Assessment（PRD 完整性初评）

PRD 的需求提取完整度较高：FR/NFR 编号清晰，MVP 与 Post-MVP 边界有显式区分，且多个复杂领域已通过 owning SPEC 外挂为 field-level contract source。需要在后续 coverage validation 中重点确认两点：第一，Epics 是否只把 FR72-FR78 作为 Post-MVP backlog 而非 MVP gate；第二，Epics/Stories 是否覆盖 PRD 中转交给 `specs/` 的契约级要求，而不是只覆盖摘要性 user journey。

## Epic Coverage Validation（Epic 覆盖验证）

### Epic FR Coverage Extracted（Epic FR 覆盖提取）

Epics 的 `Requirements Inventory（需求清单）` 明确声明 94 个 FR entries 全部具有覆盖映射。覆盖分布如下：

- Epic 1：30 个 FR entries
- Epic 2：13 个 FR entries
- Epic 3：15 个 FR entries
- Epic 4：12 个 FR entries
- Epic 5：9 个 FR entries
- Epic 6：8 个 FR entries
- Epic 7：7 个 FR entries，仅作为 Post-MVP backlog，不进入 MVP implementation readiness gate

### Coverage Matrix（覆盖矩阵）

完整 PRD requirement text 已在上文 `Functional Requirements（功能需求）` 中逐条提取；本矩阵按 FR 编号引用该完整文本，并核对 Epic coverage map。

| FR Number | Epic Coverage | Status |
| --- | --- | --- |
| FR1 | Epic 1 - 指定安装目录。 | Covered |
| FR2 | Epic 1 - 解析并展示最终安装路径。 | Covered |
| FR3 | Epic 1 - 检查安装目录状态与既有安装内容。 | Covered |
| FR4 | Epic 1 - 确认安装目标目录。 | Covered |
| FR5 | Epic 1 - 选择官方 SpecLite 模块或能力包。 | Covered |
| FR6 | Epic 1 - 展示可安装模块版本信息。 | Covered |
| FR7 | Epic 1 - 展示模块、版本和安装摘要。 | Covered |
| FR8 | Epic 5 - 选择自定义安装来源。 | Covered |
| FR9 | Epic 5 - 从 Git source 或 local path 安装或验证 source。 | Covered |
| FR10 | Epic 1 - 选择 AI IDE targets。 | Covered |
| FR11 | Epic 1 - 展示每个 AI IDE target 配置结果。 | Covered |
| FR12 | Epic 1 - 创建 SpecLite 项目级运行元数据结构。 | Covered |
| FR13 | Epic 1 - 创建 SpecLite 过程产物输出结构。 | Covered |
| FR14 | Epic 1 - 发现正式可分发 source skills。 | Covered |
| FR15 | Epic 1 - 将 canonical skill 暴露到多个 AI IDE。 | Covered |
| FR16 | Epic 1 - 查看安装完成后的项目结构和安装摘要。 | Covered |
| FR17 | Epic 1 - 查看安装完成后的下一步指引。 | Covered |
| FR18 | Epic 2 - 生成 IDE-specific discovery metadata。 | Covered |
| FR19 | Epic 2 - 将 discovery metadata 映射为 self-contained skill entry。 | Covered |
| FR20 | Epic 2 - 通过 IDE entry 选择并激活 SpecLite skill。 | Covered |
| FR21 | Epic 2 - 调用 SPEC、方案评审、故事规划、实现、测试和审查能力。 | Covered |
| FR22 | Epic 2 - 已激活 skill 读取项目级配置、customization 覆盖和上下文。 | Covered |
| FR23 | Epic 2 - workflow 按约定输出 artifact 并记录 metadata。 | Covered |
| FR23a | Epic 2 - 校验 artifact metadata 的最小值域。 | Covered |
| FR24 | Epic 2 - 查看 MVP 最小阶段覆盖矩阵。 | Covered |
| FR25 | Epic 3 - 查看当前项目 SpecLite 安装状态。 | Covered |
| FR26 | Epic 3 - 查看安装来源、版本和 IDE target 覆盖情况。 | Covered |
| FR27 | Epic 3 - 验证 manifest、skill index、help index 和 files index。 | Covered |
| FR28 | Epic 3 - 验证多个 IDE mirrors 与 canonical source 一致。 | Covered |
| FR28a | Epic 3 - 报告 IDE mirror canonical package hash drift。 | Covered |
| FR29 | Epic 3 - 检测缺失菜单目标或不可激活 skill。 | Covered |
| FR30 | Epic 3 - 检测 runtime path、legacy namespace residue 和 artifact path 问题。 | Covered |
| FR31 | Epic 3 - 检测旧版或遗留 AI IDE 入口。 | Covered |
| FR32 | Epic 3 - 报告遗留入口重叠导致的重复加载、菜单冲突或能力漂移风险。 | Covered |
| FR33 | Epic 3 - 为遗留入口提供人工清理建议。 | Covered |
| FR34 | Epic 3 - 验证 shared scripts、module directories、configuration、help catalog 和 IDE mirrors 安装完成。 | Covered |
| FR35 | Epic 3 - 输出可诊断验证结果。 | Covered |
| FR35a | Epic 3 - 核心命令支持统一 CommandResult JSON envelope。 | Covered |
| FR35b | Epic 3 - CommandResult issues 复用 ValidationIssue model。 | Covered |
| FR35c | Epic 3 - public JSON 字段以 owning SPEC 为真源。 | Covered |
| FR36 | Epic 4 - 更新 installer-owned 文件。 | Covered |
| FR37 | Epic 4 - 区分 installer-owned、human-owned 和 workflow-owned 文件。 | Covered |
| FR38 | Epic 4 - 更新前识别本地文件是否被用户修改。 | Covered |
| FR39 | Epic 4 - 避免覆盖 human-owned custom 文件。 | Covered |
| FR40 | Epic 4 - 避免覆盖 workflow-owned 过程产物。 | Covered |
| FR41 | Epic 4 - 展示 update 影响摘要、changed/skipped paths 和 conflicts。 | Covered |
| FR41a | Epic 4 - update 默认将 IDE mirror drift 或 installer-owned drift 标记为 conflict。 | Covered |
| FR41b | Epic 4 - update --repair 只修复可安全恢复或重建的 installer-owned drift。 | Covered |
| FR41c | Epic 4 - install/update/repair 遵守 plan-before-write、写入授权、operation lock、safe write 和 partial failure 诊断。 | Covered |
| FR42 | Epic 1 - 安装过程中配置用户称呼或团队名称。 | Covered |
| FR43 | Epic 1 - 安装过程中配置项目名称。 | Covered |
| FR44 | Epic 1 - 安装过程中配置 AI agent 交流语言。 | Covered |
| FR45 | Epic 1 - 安装过程中配置文档输出语言。 | Covered |
| FR46 | Epic 1 - 安装过程中配置过程产物输出目录。 | Covered |
| FR47 | Epic 1 - 选择快速配置或详细配置模式。 | Covered |
| FR48 | Epic 1 - 使用项目级配置定义用户称呼、项目名称、语言、产物路径、安装模块和 IDE targets。 | Covered |
| FR49 | Epic 2 - 通过 customization 覆盖 skill workflow、agent persona、菜单项和输出路径默认值。 | Covered |
| FR50 | Epic 4 - 按 installer base、installer user、team custom、user custom 优先级解析并合并配置。 | Covered |
| FR51 | Epic 4 - 通过 ownership manifest、路径规则和只读策略保留 human-owned 配置维护边界。 | Covered |
| FR51a | Epic 4 - MVP 默认不修改 human-owned TOML。 | Covered |
| FR51b | Epic 1 / Story 1.4 + Epic 4 / Story 4.1 - Fresh install 只 create-if-absent 创建 _speclite/custom/config.toml 与 _speclite/custom/config.user.toml project-level stubs，已存在时不得覆盖或重排；skill-specific custom stubs 不由 fresh install 默认创建。 | Covered |
| FR52 | Epic 2 - skills 使用统一配置访问项目名称、用户偏好、输出路径和流程约定。 | Covered |
| FR52a | Epic 2 - 提供 speclite resolve config 与 speclite resolve customization runtime support command。 | Covered |
| FR52b | Epic 2 - speclite resolve 保持 Python resolver parity。 | Covered |
| FR52c | Epic 2 - resolve-parity fixture 覆盖 config/customization resolver 兼容性。 | Covered |
| FR53 | Epic 5 - 从 npm public registry 安装 SpecLite。 | Covered |
| FR54 | Epic 5 - 从 private registry 安装 SpecLite。 | Covered |
| FR55 | Epic 5 - 从 local tarball 安装 SpecLite。 | Covered |
| FR56 | Epic 5 - 从 offline bundle 安装 SpecLite。 | Covered |
| FR57 | Epic 5 - 从 Git source 安装并在写入前固定到 commit SHA。 | Covered |
| FR58 | Epic 5 - 记录并展示安装来源、channel 和版本信息。 | Covered |
| FR59 | Epic 5 - 在安装来源不可用或不合法时给出明确失败原因。 | Covered |
| FR60 | Epic 1 - 展示 source discovery、manifest generation、IDE mirror creation、config initialization 和 ready check 阶段状态。 | Covered |
| FR61 | Epic 1 - 展示 shared scripts、module directories、configuration、help catalog 和 IDE integrations 安装结果。 | Covered |
| FR62 | Epic 1 - 展示每个已配置 AI IDE 的 skill 数量和目标目录。 | Covered |
| FR63 | Epic 1 - 展示 SpecLite ready summary。 | Covered |
| FR63a | Epic 1 - install --json 的 InstallCommandData 承载 ready summary 自动化字段。 | Covered |
| FR64 | Epic 1 - 展示如何启动 AI agent 和调用帮助 skill。 | Covered |
| FR65 | Epic 1 - 展示安装位置、已安装模块和已配置工具清单。 | Covered |
| FR66 | Epic 6 - 验证新增或修改 source skill 是否可安装。 | Covered |
| FR67 | Epic 6 - 使用 fixture project 复现 fresh install。 | Covered |
| FR68 | Epic 6 - 使用 fixture project 验证安装前后目录变化。 | Covered |
| FR69 | Epic 6 - 使用 fixture project 验证 status、validate 和 update。 | Covered |
| FR70 | Epic 6 - 验证至少一个 skill 从 IDE 发现到 artifact 输出的闭环。 | Covered |
| FR71 | Epic 6 - 用示例与 fixture 帮助文档读者理解安装结构和验证结果。 | Covered |
| FR71a | Epic 6 - Fixture expected outputs 作为契约测试资产同步维护。 | Covered |
| FR71b | Epic 6 - Fixture layout、expected outputs、snapshot comparison 和 release gate 由 owning SPEC 管理。 | Covered |
| FR72 | Epic 7 - 初始化或重建项目级配置。 | Covered |
| FR73 | Epic 7 - 列出模块、skills、IDE targets 或版本。 | Covered |
| FR74 | Epic 7 - 运行环境、source、权限、IDE target、manifest、路径和文件完整性诊断。 | Covered |
| FR75 | Epic 7 - 显式同步 source 与 IDE mirrors。 | Covered |
| FR76 | Epic 7 - 移除 installer-owned 安装结果。 | Covered |
| FR77 | Epic 7 - Post-MVP CI、企业工具链和自动化验证流程消费 MVP 机器可读输出；MVP 不实现企业集成 workflow。 | Covered |
| FR78 | Epic 7 - 查看规范落地与流程覆盖报告。 | Covered |

### Missing Requirements（缺失需求）

未发现缺失 FR coverage。

Epics 中也未发现不属于 PRD 的额外 FR 编号。

### Coverage Statistics（覆盖统计）

- Total PRD FR entries: 94
- FR entries covered in epics: 94
- Coverage percentage: 100%
- MVP gate FR entries covered by Epic 1-6: 87 / 87
- Post-MVP backlog FR entries covered by Epic 7: 7 / 7

## UX Alignment Assessment（UX 对齐评估）

### UX Document Status（UX 文档状态）

Found: `_bmad-output/planning-artifacts/ux-design-specification.md`。

UX 文档已完成 14 个 workflow steps，并明确 SpecLite MVP 不提供传统 Web、mobile 或 desktop GUI；核心体验是 terminal + local filesystem control plane。该定位与 PRD 的 developer tool / CLI installer/control plane 叙事一致，也与 Architecture 中 “MVP 不提供 browser UI 或 desktop UI” 的决策一致。

### UX ↔ PRD Alignment（UX 与 PRD 对齐）

UX 与 PRD 对齐良好：

- PRD 要求 `install`、`status`、`validate`、`update`、`resolve` 构成本地控制面；UX 将其定义为 “Run a command, see the truth, trust the next action” 的命令体验。
- PRD FR35a-FR35c、NFR35-NFR35j 要求 human-readable output、`--json`、exit code、fixture assertions 共享语义；UX-DR1、UX-DR2 和 design system 要求 Compact / Evidence / Structured profiles 共享同一 semantic model。
- PRD FR60-FR65、FR63a、NFR1、NFR10-NFR11 要求 install progress、ReadyCheck 和 ready summary；UX 的 Ready Summary 组件要求展示 completed steps、installed modules、IDE targets、key paths 和 next actions。
- PRD FR18-FR24 与 FR23/FR23a 要求 phase coverage、artifact contract 和 artifact metadata；UX 的 Phase Coverage Matrix 与 Artifact Evidence Card 覆盖同一字段集合。
- PRD FR36-FR41c、NFR14、NFR25a-NFR25c 要求 update plan、conflicts、repair boundary 和 protected files；UX 的 Update Plan Block 与 “Protect user work by default” 原则直接承接。
- PRD NFR18-NFR20、NFR35d、NFR40a 要求跨平台路径、terminal / CI / no-color 稳定性；UX 的 responsive/accessibility strategy 明确 terminal width、`NO_COLOR`、non-TTY、CI 和 project-relative POSIX paths。

未发现 UX requirement 不在 PRD/Epics 中承接。Epics 的 Requirements Inventory 已列出 UX-DR1 至 UX-DR11，并说明由 Story 1.6、3.5、3.6、4.3、6.1、6.4 承接。

### UX ↔ Architecture Alignment（UX 与架构对齐）

Architecture 对 UX 需求有明确承载：

- `src/diagnostics/output.ts` 拥有 Compact、Evidence、Structured output profiles 的渲染边界，承接 UX 的 shared semantic model、terminal width fallback、no-color/non-TTY/CI 和文本等价要求。
- `src/diagnostics/command-result-schema.ts`、`src/diagnostics/command-result.ts`、JSON/human reporters 承接 `CommandResult` / `ValidationIssue` parity、issue ordering、summary 和 next actions。
- `src/installer/progress-events.ts` 与 `src/installer/ready-summary.ts` 承接 install progress、ReadyCheck 和 Ready Summary。
- `src/manifest/`、`src/ide/` 与 manifest/index owning SPEC 承接 Phase Coverage Matrix、canonical skill id、target order、entry path 和 activation target。
- `src/update/`、`src/fs/` 与 install-plan owning SPEC 承接 Update Plan Block、plan-before-write、authorization boundary、conflicts、safe write 和 protected files。
- `src/fs/path-normalizer.ts` 与 path-portability fixtures 承接 UX 的 filesystem space map、project-relative POSIX paths、terminal/CI/cross-platform 稳定输出。
- `test/fixtures/`、expected outputs、`path-portability` 和 `skill-artifact-loop` 承接 UX 对 documentation examples、fixture expected outputs、artifact evidence 和 no-color/terminal width coverage 的要求。

### Alignment Issues（对齐问题）

未发现阻塞性 UX / PRD / Architecture mismatch。

### Warnings（警告）

无 missing UX warning。UX 文档存在，且产品没有隐含未覆盖的 GUI surface。

Non-blocking implementation watch item: UX 成败高度依赖共享 renderer 与 fixture expected outputs。实现时必须避免各 command 自行拼接 human-readable output、status text、issue layout 或 path display；这一点已被 Architecture 约束到 `src/diagnostics/output.ts` 和 fixture gates。

## Epic Quality Review（Epic 质量评审）

### Overall Result（总体结论）

Epic 与 Story 结构满足 implementation readiness 要求。未发现 technical milestone 被伪装为 Epic、未发现 Epic N 依赖 Epic N+1 才能交付用户价值、未发现阻塞 MVP 实现的 forward dependency。

本轮发现 0 个 Critical violations、0 个 Major issues、3 个 Minor concerns。Minor concerns 不阻塞进入实现，但需要在 Story tasking 和验收时显式看住。

### Critical Violations（严重违规）

未发现。

### Major Issues（主要问题）

未发现。

### Minor Concerns（轻微关注点）

1. Story 1.1 密度较高。`_bmad-output/planning-artifacts/epics/04-epic-1-project-installation-onboarding项目安装引导.md` 的 Story 1.1 同时覆盖 CLI skeleton、runtime guard、diagnostics contract anchor、producer/consumer tests、fixture skeleton 和 starter 修正。Architecture 明确要求第一条 implementation story 承接这些 starter/contract anchors，因此这不是拆分阻塞项；实现时应把 Story 1.1 控制为 vertical slice，contract anchors 可以先以最小可执行 schema/test skeleton 落地，不应扩展成全域功能实现。
2. FR51b 被拆到 Epic 1 / Story 1.4 与 Epic 4 / Story 4.1。`_bmad-output/planning-artifacts/epics/02-requirements-inventory需求清单.md` 已说明 fresh install 的 create-if-absent stub 由 Story 1.4 执行，ownership 规则由 Story 4.1 验证。这是合理的 install vs update/ownership 职责拆分；实现时不得让 Story 1.4 反向依赖 Epic 4 的完整 update 模型，只需满足 create-if-absent、已存在不覆盖、不重排的 fresh-install 行为。
3. Story 6.2 中 “repair 行为由显式 `update --repair` fixture 或后续 fixture 覆盖” 表述略有歧义。由于 Epic 6 还包含 release fixture 与 repair gate 相关故事，这不是 forward dependency 缺陷；建议实现排期时将该验收点绑定到明确的 `update --repair` fixture 或 Story 6.3/6.4 的 expected outputs，避免测试责任漂移。

### Epic Compliance Checklist（Epic 合规检查表）

| Epic | User Value | Independence | Story Sizing | Forward Dependency | AC Quality | Traceability |
| --- | --- | --- | --- | --- | --- | --- |
| Epic 1: Project Installation Onboarding | Pass：用户可完成 fresh install 并获得 ready summary | Pass：可独立交付默认 bundled source 安装闭环 | Watch：Story 1.1 高密度但符合 starter story 要求 | Pass | Pass | Pass：FR1-FR17、FR42-FR48、FR60-FR65 |
| Epic 2: Methodology Discovery And Skill Execution | Pass：用户可发现并激活已安装 skill | Pass：只依赖 Epic 1 installed state | Pass | Pass | Pass | Pass：FR18-FR24、FR49、FR52-FR52c |
| Epic 3: Installed State And Deterministic Validation | Pass：维护者可查询并验证安装状态 | Pass：使用 Epic 1/2 的 installed state，不依赖未来 Epic | Pass | Pass | Pass | Pass：FR25-FR35c |
| Epic 4: Safe Update And Repair | Pass：用户可安全更新并保护人工产物 | Pass：在已安装状态上提供 update/repair，不依赖 Epic 5/6 | Pass | Pass | Pass | Pass：FR36-FR41c、FR50-FR51b |
| Epic 5: Source Integrity And Distribution Channels | Pass：用户可从不同可信来源安装 | Pass：扩展 source resolution，不要求未来治理能力 | Pass | Pass | Pass | Pass：FR8-FR9、FR53-FR59 |
| Epic 6: Maintainer Fixture And Release Confidence | Pass：维护者可用 fixture 和 packaging gate 建立发布信心 | Pass：验证前序能力，不要求 Post-MVP 功能 | Watch：release gate 覆盖面大，需要按 Story 6.1-6.5 保持边界 | Pass | Pass | Pass：FR66-FR71b |
| Epic 7: Post-MVP Governance Expansion | Pass：作为 Phase 2 backlog 有明确用户价值 | Pass：明确不进入 MVP readiness gate | Pass | Pass：文件声明不得阻塞 MVP | Pass | Pass：FR72-FR78 |

### Dependency Review（依赖评审）

- Epic 1 是完整 MVP 起点，覆盖 install entry、source discovery、IDE mirror creation、config initialization、ready check 和 ready summary。
- Epic 2 只消费 Epic 1 产生的 installed skill entries、manifest/index 和 project config，不需要 Epic 3+ 才能让用户激活 skill。
- Epic 3 的 status/validate 建立在 installed state 上，属于只读诊断与 deterministic validation，不要求 Epic 4 update 能力先存在。
- Epic 4 的 update/repair 依赖已安装状态、ownership manifest、install plan contract 和 file hash evidence；这些均来自前序安装/manifest/contract，不依赖 Epic 5/6/7。
- Epic 5 是 source channel 扩展，未把 Post-MVP source policy、source lockfile lifecycle 或 governance report 偷带进 MVP。
- Epic 6 是 maintainer confidence gate，验证前序能力与 release packaging，不是用户功能的前置运行依赖。
- Epic 7 已在 Epic list 与 Epic 7 文件中标记为 Post-MVP backlog，不进入 MVP implementation readiness gate。

### Database And Entity Timing（数据库与实体时序）

不适用。Architecture 明确 MVP 不使用持久 database cache，也不得引入 SQLite、嵌入式数据库或长期缓存存储；因此不存在“提前创建所有表”的 Epic/Story 违规。

### Starter Template Check（Starter 检查）

Architecture 选择 Custom TypeScript Node CLI Starter，且要求第一条 implementation story 先建立 TypeScript CLI skeleton、diagnostics contract anchor、producer/consumer tests 和最小 fixture expected outputs。Epic 1 / Story 1.1 符合该 starter-template 要求。

## Summary and Recommendations（总结与建议）

### Overall Readiness Status（总体就绪状态）

READY for MVP implementation。

PRD、Architecture、UX、Epics、canonical SPECs 与 `CONTEXT.md` 的当前组合已经足够支撑 MVP implementation planning 和 Story execution。MVP gate 的 FR coverage 为 87 / 87，Post-MVP FR72-FR78 已单独收敛到 Epic 7，且明确不得进入 MVP implementation readiness gate。

### Issue Summary（问题汇总）

本次 assessment 共识别 3 个需要关注的问题，分布在 1 个类别：

| Severity | Count | Category |
| --- | ---: | --- |
| Critical | 0 | 无 |
| Major | 0 | 无 |
| Minor | 3 | Epic / Story implementation watch items |

### Critical Issues Requiring Immediate Action（需要立即处理的严重问题）

无。没有必须先修正文档才能开始 MVP implementation 的 blocker。

### Recommended Next Steps（推荐下一步）

1. 进入 Story execution 前，让实现 agent 先按 `_bmad-output/planning-artifacts/specs/README.md` 的顺序阅读 owning SPECs，再读 PRD / Architecture 摘要和对应 Story，避免 public JSON、manifest、fixture 与 ownership 规则漂移。
2. 启动 Epic 1 / Story 1.1 时，将范围限制为 TypeScript CLI skeleton、diagnostics contract anchor、producer/consumer contract tests、最小 fixture expected outputs 与 runtime guard，不要把后续 command domain 一次性展开。
3. 启动 Story 1.4 与 Epic 4 / Story 4.1 前，在 Story tasking 中明确 FR51b 的边界：Story 1.4 只负责 fresh-install create-if-absent project-level custom TOML stubs；Story 4.1 负责 ownership/update/repair 验证。
4. 启动 Epic 6 前，明确 `update --repair` fixture 的归属和 expected outputs 更新顺序，确保先更新 owning SPEC / executable schema / parser，再更新 fixture snapshots。
5. 实现所有 command output 时强制复用 `src/diagnostics/output.ts` 与 `CommandResult` / `ValidationIssue` contract，不允许各 command 手写 status text、issue layout、path display 或 JSON field。

### Final Note（最终说明）

本次 assessment 没有发现 PRD coverage、UX alignment 或 Epic structure 层面的阻塞缺陷。当前 artifacts 可以进入 MVP implementation；上述 3 个 Minor concerns 应作为 implementation watch items 放入后续 Story tasking / review checklist，而不是阻塞 readiness gate。

Assessor: Codex using `bmad-check-implementation-readiness`
