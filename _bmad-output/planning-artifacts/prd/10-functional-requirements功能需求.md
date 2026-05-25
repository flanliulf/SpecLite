# Functional Requirements（功能需求）

## Installation & Project Onboarding（安装与项目引导）

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

## Methodology Discovery & Execution（方法论发现与执行）

- FR18: 安装器可以生成 IDE-specific discovery metadata，列出研发阶段、canonical skill id、skill 名称、目标 IDE entry path 和激活 target。Manifest、skill index、help index、files index 与最小阶段覆盖矩阵的字段、版本、hash 和 ownership 规则由 `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md` 作为 canonical contract 管理；IDE adapter id、target id、target order、capability 与 status 语义由 `_bmad-output/planning-artifacts/specs/05-ide-adapter-registry-contract.md` 管理。
- FR19: MVP 中每个 IDE adapter 必须把 discovery metadata 映射为该 IDE target directory 中的 self-contained skill entry，并报告 mapped、unsupported 或 failed 状态。Adapter schema 可以声明 `commandPointerBehavior: "none" | "unsupported"` 作为 Post-MVP 扩展位，但 MVP 不生成 command pointer artifact。
- FR20: AI IDE 使用者可以通过已映射的 IDE entry 选择并激活 SpecLite skill。
- FR21: AI IDE 使用者可以调用 SPEC、方案评审、故事规划、实现、测试和审查相关能力；每项能力必须映射到至少一个 canonical skill id。
- FR22: 已激活的 skill 可以读取项目级配置、customization 覆盖和相关上下文。
- FR23: 已激活的 workflow 可以将产物输出到配置约定的位置，并在产物中记录 workflow type、source skill 和生成时间。MVP artifact contract 至少校验 artifact type、默认输出路径、configured artifact root、`workflowType`、`sourceSkill` 和 `generatedAt` 元数据字段；artifact root 和默认输出路径必须是 project-relative POSIX path 且位于 target project boundary 内，产物内容质量不进入 MVP validation。
- FR23a: Artifact metadata 的 MVP 校验必须覆盖最小值域：`workflowType` 必须是非空稳定字符串，`sourceSkill` 必须是非空 canonical skill id，`generatedAt` 必须存在且是 ISO 8601 string，且默认在 stable fixture snapshot comparison 中 normalize 或 exclude。
- FR24: 企业规范负责人可以查看 MVP 最小阶段覆盖矩阵，确认 SPEC、方案评审、故事规划、实现、测试和审查阶段是否存在 mapped skill entry、对应 canonical skill id、以及目标 IDE target 是否可见。MVP 阶段覆盖矩阵来自 manifest、help index 和 installed skill entries，最小字段必须覆盖 `phaseId`、`phaseLabel`、`moduleId`、`canonicalSkillId`、`ideTargets[].targetId`、`ideTargets[].entryPath`、`ideTargets[].activationTarget`、`ideTargets[].status` 和可选 `artifactContract`；不提供覆盖率百分比、趋势、团队汇总或治理 dashboard。

## Methodology Responsibility Matrix（方法论责任矩阵）

| Capability | Installer Control Plane | IDE Adapter | Skill Content | Validation Method |
| --- | --- | --- | --- | --- |
| Stage discovery | Generate discovery metadata with phase, canonical skill id, entry path, and activation target | Map metadata to IDE-specific self-contained skill entry; command pointer remains Post-MVP | N/A | Validate each menu target resolves to one installed skill entry |
| Skill activation | Install self-contained skill package and record target mapping | Expose mapped entry and report mapped/unsupported/failed state | Follow `SKILL.md` activation protocol | Fixture activation test for at least one mapped skill |
| Workflow execution | Provide resolved config paths and output directory contract | N/A | Read config/customization and execute workflow steps | Skill execution fixture writes expected artifact |
| Artifact governance | Record configured output locations in manifest/index | N/A | Write artifact metadata and content | Validate artifact exists at configured path with expected metadata |
| Process governance | Generate minimum phase coverage metadata from manifest/help index/installed skill entries | Report mapped skill entry visibility per IDE target | Produce standard artifacts for executed workflows | Validate MVP phase coverage matrix locally; richer coverage reports remain Post-MVP |

## Status & Validation（状态与验证）

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

## Update & File Ownership Protection（更新与文件所有权保护）

- FR36: 项目维护者可以更新已安装的 SpecLite installer-owned 文件。
- FR37: 系统可以区分 installer-owned、human-owned 和 workflow-owned 文件。
- FR38: 系统可以在更新前识别本地文件是否被用户修改。
- FR39: 系统可以避免覆盖 human-owned custom 文件。
- FR40: 系统可以避免覆盖 workflow-owned 过程产物。
- FR41: 项目维护者可以看到 update 对安装内容、用户定制和过程产物的影响摘要，包括 planned effects、实际 changed/skipped paths 和 conflicts；public output 契约以 `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md` 为准。
- FR41a: `update` 遇到 IDE mirror drift 或其他 installer-owned drift 时必须默认标记 conflict，不得静默覆盖；普通 `update` 的用户确认或 `--yes` 只授权无 conflict 的 planned update writes，不得恢复 drift。MVP 只有 `speclite update --repair` 才可恢复可安全 repair 的 canonical 内容，不新增顶级 `speclite repair` 命令，`speclite sync` 保持 Post-MVP。
- FR41b: `speclite update --repair` 必须只修复可安全恢复或重建的 installer-owned drift，并继续保护 human-owned custom 文件和 workflow-owned artifacts；repair eligibility、missing source evidence、`expectedHash`、restore-canonical/regenerate、conflict projection 和 reason code producer/consumer 语义以 owning SPEC 为准。
- FR41c: Install/update/repair 必须坚持 plan-before-write、显式写入授权、project operation lock、safe write、保守 stale lock 处理和 partial failure 可诊断性；具体 planning/write authorization 契约以 `_bmad-output/planning-artifacts/specs/03-install-plan-contract.md` 为准。MVP 不生成 standalone report artifact，不提供事务性 rollback、backup/restore、顶级 repair 或 sync。

## Configuration & Customization（配置与定制化）

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

## Distribution Sources & Channels（分发来源与渠道）

- FR53: 项目维护者可以从 npm public registry 安装 SpecLite。
- FR54: 项目维护者可以从 private registry 安装 SpecLite。
- FR55: 项目维护者可以从 local tarball 安装 SpecLite。
- FR56: 项目维护者可以从 offline bundle 安装 SpecLite。
- FR57: 项目维护者可以从 Git source 安装 SpecLite，并在 install/update 的 source resolution 阶段验证 Git source；写入前 Git source 必须解析到具体 commit SHA，只指定 remote URL、branch 或 tag 的浮动 Git source 不得进入 install planning。`speclite validate` 不负责访问 Git remote 或重新验证远程 freshness/provenance，只检查本地记录的 source descriptor、integrity evidence shape 和 hash baseline。
- FR58: 系统可以记录并展示安装来源、channel 和版本信息。
- FR59: 系统可以在安装来源不可用或不合法时给出明确失败原因。

## Installation Feedback & Readiness（安装反馈与就绪状态）

- FR60: 系统可以在安装过程中展示 source discovery、manifest generation、IDE mirror creation、config initialization 和 ready check 的执行状态。
- FR61: 系统可以展示 shared scripts、module directories、configuration、help catalog 和 IDE integrations 的安装结果。
- FR62: 系统可以展示每个已配置 AI IDE 的 skill 数量和目标目录。
- FR63: 系统可以在安装完成后展示包含安装路径、manifest version、source descriptor、已安装模块、IDE targets、关键目录和下一步命令的 SpecLite ready summary。
- FR63a: Ready summary 的 human-readable 输出可以包含解释性文案，但 automation 依赖必须进入 `install --json` 的 `InstallCommandData` 字段，例如 `sourceDescriptor`、`manifestVersion`、`installedModules`、`ideTargets`、`paths`、`completedSteps` 和 `pendingSteps`；MVP 不新增未契约化的 `readySummary` JSON blob。
- FR64: 系统可以在安装完成后展示用户下一步如何启动 AI agent 和调用帮助 skill。
- FR65: 系统可以在安装完成后展示安装位置、已安装模块和已配置工具清单。

## Maintainer Workflow & Examples（维护者工作流与示例）

- FR66: SpecLite 维护者可以验证新增或修改的 source skill 是否可安装。
- FR67: SpecLite 维护者可以使用 fixture project 复现 fresh install 流程。
- FR68: SpecLite 维护者可以使用 fixture project 验证安装前后目录变化。
- FR69: SpecLite 维护者可以使用 fixture project 验证 status、validate 和 update 行为。
- FR70: SpecLite 维护者可以验证至少一个 skill 从 IDE 发现到产物输出的最小闭环。
- FR71: 文档读者可以通过 fresh install 示例、安装前后目录树、manifest/index 示例、status/validate 输出示例和 update 保护示例理解安装后结构、常用命令和验证结果。
- FR71a: Fixture expected outputs 是契约测试资产，不是仅供阅读的示例；新增模块、adapter、source type、validation rule、ownership 行为或 installed artifact kind 时，必须同步相关 fixture 输入和 expected outputs。
- FR71b: Fixture case directory、expected output classes、snapshot comparison、ready summary gate、release gate / regression asset 区分和 baseline case 集合由 `_bmad-output/planning-artifacts/specs/08-fixture-contract.md` 管理。实现不得先更新 snapshots 再反推契约行为；契约变更必须先更新 owning SPEC 和 executable schema/parser，再更新 fixture expected outputs。

## Post-MVP Governance & Expansion（Post-MVP 治理与扩展）

本节所有 FR 都是 Post-MVP backlog。它们不得进入 MVP sprint backlog、MVP implementation readiness gate 或 MVP release gate；MVP 只需保证这些未来能力可以消费现有 `CommandResult`、manifest/index、fixture 和 owning SPEC 边界。

- FR72: 项目维护者可以初始化或重建项目级配置。
- FR73: 项目维护者可以列出可安装模块、skills、IDE targets 或版本。
- FR74: 工具链维护者可以运行环境、source、权限、IDE target、manifest、路径规范化和文件完整性诊断。
- FR75: 工具链维护者可以显式同步 source 与 IDE mirrors。
- FR76: 项目维护者可以移除 installer-owned 安装结果。
- FR77: Post-MVP 工具链维护者可以让 CI、企业工具链和自动化验证流程消费 MVP 机器可读输出；MVP 只负责提供稳定 `CommandResult` JSON 和 file contracts，不实现企业集成工作流本身。
- FR78: 企业规范负责人可以查看包含阶段入口覆盖率、标准产物存在率、validate 通过率和未解决缺口数量的规范落地与流程覆盖报告。该报告属于 Post-MVP，可在 MVP 最小阶段覆盖矩阵与 validate output 之上增加趋势、导出、多项目/团队视角和企业治理汇总。
