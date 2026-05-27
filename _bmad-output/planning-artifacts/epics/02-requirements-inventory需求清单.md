# Requirements Inventory（需求清单）

## Functional Requirements（功能需求）

FR1: 项目维护者可以指定 SpecLite 安装目录。

FR2: 系统可以解析并展示最终安装路径。

FR3: 系统可以检查安装目录是否存在、是否为空、是否已有 SpecLite 安装内容。

FR4: 项目维护者可以确认是否安装到解析后的目录。

FR5: 项目维护者可以选择要安装的官方 SpecLite 模块或能力包。

FR6: 系统可以检查并展示可安装模块的版本信息。

FR7: 系统可以展示用户已选择的模块、版本和安装摘要。

FR8: 项目维护者可以选择是否从自定义来源安装 SpecLite。

FR9: 项目维护者可以从 Git source 或 local path 安装或验证 SpecLite source；local path 不得指向目标项目中的 installed state、IDE mirrors、workflow output、dependency/cache/build 目录。

FR10: 项目维护者可以选择要集成的 AI IDE 目标。

FR11: 系统可以展示每个目标 AI IDE 的配置结果。

FR12: 系统可以为目标项目创建 SpecLite 项目级运行元数据结构。

FR13: 系统可以为目标项目创建 SpecLite 过程产物输出结构。

FR14: 系统可以发现正式可分发的 SpecLite source skills。

FR15: 系统可以将同一 canonical skill 暴露到多个目标 AI IDE。

FR16: 项目维护者可以查看安装完成后的项目结构和安装摘要。

FR17: 项目维护者可以查看安装完成后的下一步使用指引。

FR18: 安装器可以生成 IDE-specific discovery metadata，列出研发阶段、canonical skill id、skill 名称、目标 IDE entry path 和激活 target，并遵守 manifest/index 与 IDE adapter registry 的 owning SPEC 契约。

FR19: MVP 中每个 IDE adapter 必须把 discovery metadata 映射为该 IDE target directory 中的 self-contained skill entry，并报告 mapped、unsupported 或 failed 状态；MVP 不生成 command pointer artifact。

FR20: AI IDE 使用者可以通过已映射的 IDE entry 选择并激活 SpecLite skill。

FR21: AI IDE 使用者可以调用 SPEC、方案评审、故事规划、实现、测试和审查相关能力；每项能力必须映射到至少一个 canonical skill id。

FR22: 已激活的 skill 可以读取项目级配置、customization 覆盖和相关上下文。

FR23: 已激活的 workflow 可以将产物输出到配置约定的位置，并在产物中记录 workflow type、source skill 和 generatedAt；MVP artifact contract 至少校验 artifact type、默认输出路径、configured artifact root、workflowType、sourceSkill 和 generatedAt 元数据字段；artifact root 和默认输出路径必须是 project-relative POSIX path 且位于 target project boundary 内。

FR23a: Artifact metadata 的 MVP 校验必须覆盖最小值域：workflowType 必须是非空稳定字符串，sourceSkill 必须是非空 canonical skill id，generatedAt 必须存在且是 ISO 8601 string，且默认在 stable fixture snapshot comparison 中 normalize 或 exclude。

FR24: 企业规范负责人可以查看 MVP 最小阶段覆盖矩阵，确认 SPEC、方案评审、故事规划、实现、测试和审查阶段是否存在 mapped skill entry、canonical skill id，以及目标 IDE target 是否可见；矩阵最小字段必须覆盖 phaseId、phaseLabel、moduleId、canonicalSkillId、ideTargets[].targetId、ideTargets[].entryPath、ideTargets[].activationTarget、ideTargets[].status 和可选 artifactContract。

FR25: 工具链维护者可以查看当前项目的 SpecLite 安装状态。

FR26: 工具链维护者可以查看安装来源、版本和目标 IDE 覆盖情况。

FR27: 工具链维护者可以验证 manifest、skill index、help index 和 files index 的有效性。

FR28: 工具链维护者可以验证多个 IDE mirrors 是否与 canonical source 一致。

FR28a: 当 IDE mirror 中的 canonical skill package 文件偏离 manifest 记录的 canonical package hash 时，validate 必须报告 ide-mirror 或 file-integrity error，但不得自动修复。

FR29: 工具链维护者可以检测缺失的菜单目标或不可激活的 skill。

FR30: 工具链维护者可以检测错误 runtime path、legacy namespace residue 和产物路径问题。

FR31: 工具链维护者可以检测旧版或遗留 AI IDE 入口。

FR32: 系统可以在检测到遗留入口与当前 canonical skill id 或 IDE target 重叠时，提示重复加载、菜单冲突或能力漂移风险。

FR33: 系统可以为遗留入口提供包含 path、risk category、manual action 和 verification command 的人工清理建议。

FR34: 工具链维护者可以验证 shared scripts、module directories、configuration、help catalog 和 IDE mirrors 是否安装完成。

FR35: 系统可以输出可诊断的验证结果，指出问题类型、影响范围和修复方向。

FR35a: MVP 面向用户的核心命令必须支持 --json，并使用统一 CommandResult envelope；详细字段、排序、路径、timestamp、schema evolution、status 推导、exit code 和 fixture comparison 契约以 command-result JSON owning SPEC 为准。

FR35b: CommandResult 中的 issues 必须复用同一 ValidationIssue model，并与 human-readable output、exit code 和 fixture assertions 保持一致；issue category、issue id 与默认 severity 语义以 validation issue taxonomy owning SPEC 为准。

FR35c: PRD 不定义第二份 public JSON 字段真源；新增 public JSON 字段、reason code、redacted path 形状、排序规则或 command-specific payload 行为时，必须先更新 owning SPEC，再同步 executable schema/parser 和 fixture expected outputs。Reason code producer 只能输出 owning SPEC registry 中的 MVP codes；consumer/parser 必须容忍 unknown future codes，并保留其 stable display string。

FR36: 项目维护者可以更新已安装的 SpecLite installer-owned 文件。

FR37: 系统可以区分 installer-owned、human-owned 和 workflow-owned 文件。

FR38: 系统可以在更新前识别本地文件是否被用户修改。

FR39: 系统可以避免覆盖 human-owned custom 文件。

FR40: 系统可以避免覆盖 workflow-owned 过程产物。

FR41: 项目维护者可以看到 update 对安装内容、用户定制和过程产物的影响摘要，包括 planned effects、实际 changed/skipped paths 和 conflicts；public output 契约以 command-result JSON owning SPEC 为准。

FR41a: update 遇到 IDE mirror drift 或其他 installer-owned drift 时必须默认标记 conflict，不得静默覆盖；普通 update 的用户确认或 --yes 只授权无 conflict 的 planned update writes，不得恢复 drift。MVP 只有 speclite update --repair 才可恢复可安全 repair 的 canonical 内容，不新增顶级 speclite repair 命令，speclite sync 保持 Post-MVP。

FR41b: speclite update --repair 必须只修复可安全恢复或重建的 installer-owned drift，并继续保护 human-owned custom 文件和 workflow-owned artifacts；repair eligibility、missing source evidence、expectedHash、restore-canonical/regenerate、conflict projection 和 reason code producer/consumer 语义以 owning SPEC 为准。

FR41c: Install/update/repair 必须坚持 plan-before-write、显式写入授权、project operation lock、safe write、保守 stale lock 处理和 partial failure 可诊断性；具体 planning/write authorization 契约以 install-plan owning SPEC 为准，MVP 不生成 standalone report artifact，不提供事务性 rollback、backup/restore、顶级 repair 或 sync。

FR42: 项目维护者可以在安装过程中配置用户称呼或团队名称。

FR43: 项目维护者可以在安装过程中配置项目名称。

FR44: 项目维护者可以在安装过程中配置 AI agent 的交流语言。

FR45: 项目维护者可以在安装过程中配置文档输出语言。

FR46: 项目维护者可以在安装过程中配置过程产物输出目录。

FR47: 项目维护者可以选择快速配置或详细配置模式。

FR48: 项目维护者可以使用项目级配置定义用户称呼、项目名称、交流语言、文档输出语言、产物路径、安装模块和 IDE targets。

FR49: 用户可以通过定制化配置覆盖 skill workflow、agent persona、菜单项和输出路径默认值。

FR50: 系统可以按 installer base、installer user、team custom、user custom 的优先级解析并合并配置。

FR51: 系统可以通过 ownership manifest、路径规则和只读策略保留 human-owned 配置的人工维护边界。

FR51a: MVP 默认不修改 human-owned TOML，包括 _speclite/custom/*.toml 和 _speclite/custom/*.user.toml；所谓保守更新在 MVP 中只表示读取并保护，任何写入都必须由未来显式命令或交互确认引入并通过 ADR 记录。

FR51b: Fresh install 可以在目标路径不存在时创建 human-owned TOML stub；MVP create-if-absent scope 仅限 _speclite/custom/config.toml 与 _speclite/custom/config.user.toml，由 Epic 1 / Story 1.4 执行、Epic 4 / Story 4.1 验证 ownership 规则；skill-specific _speclite/custom/{skill}.toml 与 _speclite/custom/{skill}.user.toml 不由 fresh install 默认创建。已存在的 human-owned custom TOML 不得被 install/update/repair 覆盖、重写、重排或格式化。

FR52: 系统可以让 skills 使用统一配置访问项目名称、用户偏好、输出路径和流程约定。

FR52a: 系统必须提供 speclite resolve config 与 speclite resolve customization 作为 MVP runtime support command，使已安装 skills 能通过稳定入口读取 config/customization，而不依赖 Python resolver 或内部构建路径。

FR52b: speclite resolve 必须保持 Python resolver parity，包括 stdout/stderr shape、exit code、missing key、repeated key、project-root fallback、required/optional layer failure、array merge、config/customization merge order 和 customization lookup key；详细契约以 resolve-command owning SPEC 为准。

FR52c: resolve-parity fixture 必须覆盖 config/customization resolver 兼容性，并随 resolver 行为变更同步更新 owning SPEC、parser/schema 和 expected outputs。

FR53: 项目维护者可以从 npm public registry 安装 SpecLite。

FR54: 项目维护者可以从 private registry 安装 SpecLite。

FR55: 项目维护者可以从 local tarball 安装 SpecLite。

FR56: 项目维护者可以从 offline bundle 安装 SpecLite。

FR57: 项目维护者可以从 Git source 安装 SpecLite，并在 install/update 的 source resolution 阶段验证 Git source；写入前 Git source 必须解析到具体 commit SHA，只指定 remote URL、branch 或 tag 的浮动 Git source 不得进入 install planning；speclite validate 不负责访问 Git remote 或重新验证远程 freshness/provenance，只检查本地记录的 source descriptor、integrity evidence shape 和 hash baseline。

FR58: 系统可以记录并展示安装来源、channel 和版本信息。

FR59: 系统可以在安装来源不可用或不合法时给出明确失败原因。

FR60: 系统可以在安装过程中展示 source discovery、manifest generation、IDE mirror creation、config initialization 和 ready check 的执行状态。

FR61: 系统可以展示 shared scripts、module directories、configuration、help catalog 和 IDE integrations 的安装结果。

FR62: 系统可以展示每个已配置 AI IDE 的 skill 数量和目标目录。

FR63: 系统可以在安装完成后展示包含安装路径、manifest version、source descriptor、已安装模块、IDE targets、关键目录和下一步命令的 SpecLite ready summary。

FR63a: Ready summary 的 human-readable 输出可以包含解释性文案，但 automation 依赖必须进入 install --json 的 InstallCommandData 字段，例如 sourceDescriptor、manifestVersion、installedModules、ideTargets、paths、completedSteps 和 pendingSteps；MVP 不新增未契约化的 readySummary JSON blob。

FR64: 系统可以在安装完成后展示用户下一步如何启动 AI agent 和调用帮助 skill。

FR65: 系统可以在安装完成后展示安装位置、已安装模块和已配置工具清单。

FR66: SpecLite 维护者可以验证新增或修改的 source skill 是否可安装。

FR67: SpecLite 维护者可以使用 fixture project 复现 fresh install 流程。

FR68: SpecLite 维护者可以使用 fixture project 验证安装前后目录变化。

FR69: SpecLite 维护者可以使用 fixture project 验证 status、validate 和 update 行为。

FR70: SpecLite 维护者可以验证至少一个 skill 从 IDE 发现到产物输出的最小闭环。

FR71: 文档读者可以通过 fresh install 示例、安装前后目录树、manifest/index 示例、status/validate 输出示例和 update 保护示例理解安装后结构、常用命令和验证结果。

FR71a: Fixture expected outputs 是契约测试资产，不是仅供阅读的示例；新增模块、adapter、source type、validation rule、ownership 行为或 installed artifact kind 时，必须同步相关 fixture 输入和 expected outputs。

FR71b: Fixture case directory、expected output classes、snapshot comparison、ready summary gate、release gate / regression asset 区分和 baseline case 集合由 fixture contract owning SPEC 管理；实现不得先更新 snapshots 再反推契约行为，契约变更必须先更新 owning SPEC 和 executable schema/parser，再更新 fixture expected outputs。

FR72: 项目维护者可以初始化或重建项目级配置。

FR73: 项目维护者可以列出可安装模块、skills、IDE targets 或版本。

FR74: 工具链维护者可以运行环境、source、权限、IDE target、manifest、路径规范化和文件完整性诊断。

FR75: 工具链维护者可以显式同步 source 与 IDE mirrors。

FR76: 项目维护者可以移除 installer-owned 安装结果。

FR77: Post-MVP 工具链维护者可以让 CI、企业工具链和自动化验证流程消费 MVP 机器可读输出；MVP 只负责提供稳定 CommandResult JSON 和 file contracts，不实现企业集成工作流本身。

FR78: 企业规范负责人可以查看包含阶段入口覆盖率、标准产物存在率、validate 通过率和未解决缺口数量的规范落地与流程覆盖报告；该报告属于 Post-MVP，可在 MVP 最小阶段覆盖矩阵与 validate output 之上增加趋势、导出、多项目/团队视角和企业治理汇总。

Post-MVP FR72-FR78 只作为 backlog inventory，不得进入 MVP sprint backlog、MVP implementation readiness gate 或 MVP release gate。MVP 只需保持 `CommandResult`、manifest/index、fixture 和 owning SPEC 边界可被这些未来能力消费。

### Traceability Count Convention（可追踪计数口径）

本文档保留 PRD 的 base numbering：FR1-FR78 与 NFR1-NFR40 表示主编号范围。为 implementation readiness、fixture planning 和 story acceptance tracking，lettered extensions 也作为独立可追踪条目统计；当前显式条目为 94 个 FR entries 与 95 个 NFR entries。后续报告应同时说明 base range 与 explicit tracked entry count，避免把 lettered extensions 误判为缺失或额外范围。

## NonFunctional Requirements（非功能需求）

NFR1: 在常规 fixture 项目中，fresh install 必须至少输出 source discovery、manifest generation、IDE mirror creation、config initialization 和 ready check 5 个阶段状态；fixture baseline 应记录阶段顺序和完成结果。Machine-readable progress `stepId` 必须使用 stable lower-kebab id，例如 `ready-check`，作为 fixture-observable deterministic signal；它不是 MVP automation API。Automation 依赖必须读取 `CommandResult.data.completedSteps` 和 `CommandResult.data.pendingSteps`。human-readable step label 可以是 ready check；contract/internal guard 名称统一为 ReadyCheck。阶段耗时只作为 performance evidence 或 human-readable/profiling 数据，默认不得进入 stable command JSON snapshots。

NFR2: status 在常规 fixture 项目中应在 2 秒内返回项目安装摘要，不执行完整文件完整性扫描；性能基准以 3 次连续运行的 p95 结果为准。

NFR2a: MVP status 必须是轻量本地只读摘要，只读取本地 manifest、source descriptor、manifest version、installed modules、IDE target summary、关键路径和 high-level health；不得访问远程 source，不得执行 remote freshness check、provenance revalidation、完整文件 hash scan 或隐式 update check。

NFR3: validate 可以执行完整 local deterministic validation；`validate.data.checkedCategories` 和 validate progress 必须使用 canonical issue category order：`environment`、`manifest-schema`、`source-integrity`、`ide-mirror`、`runtime-path`、`menu-target`、`legacy-namespace`、`artifact-path`、`file-integrity`、`operation-lock`、`update`。常规 fixture 项目中每个实际执行类别必须在开始和结束时输出状态。

NFR4: update 与 validate 必须跳过 hash 未变化的 source skills 和 IDE mirrors；在 fixture baseline 中，未变化文件的重复写入次数必须为 0。

NFR5: fixture project 中的 fresh install、status、validate、update 必须记录 baseline runtime；任一命令相较上一 accepted baseline 退化超过 25% 时，验证报告必须标记为 performance regression。

NFR5a: Runtime/p95 baseline、regression percentage 和 profiling sample 必须作为 release/performance evidence 保存，不得进入 stable CommandResult JSON 或 stable fixture snapshots；fixture 只断言 evidence 存在、测量口径和 pass/fail conclusion，不比较具体 wall-clock values。

NFR6: 相同 source、配置、目标 IDE 和安装目录在同一平台上重复安装，应生成 byte-for-byte 一致的 _speclite/_config、manifest/index 和 IDE mirror 文件；允许差异仅限明确标记的时间戳字段。

NFR7: install 对已存在安装内容必须输出 existing-install 状态，列出 detected runtime、manifest version、IDE targets 和下一步选项，不得静默覆盖已有 SpecLite 状态。

NFR8: update 必须在修改文件前完成所有权和本地变更判断；无法确认安全时必须跳过该文件、输出 conflict 状态，并保留原文件不变。

NFR9: validate 的检查结果必须可复现，同一安装状态下连续运行 3 次应返回相同 issue id、category、severity 和 affected path 集合。

NFR9a: MVP validate 必须是本地确定性命令，不得访问 npm registry、private registry、Git remote、offline bundle origin 或其他远程 source；不得执行 remote freshness check 或 provenance revalidation。

NFR10: 安装失败时，系统不得展示 ready summary；失败结果必须列出 completed steps、failed step、pending steps 和 manual action，且退出状态不得为成功。

NFR11: ready summary 只能在 source discovery、manifest generation、IDE mirror creation、config initialization 和 ReadyCheck 全部成功后展示；ReadyCheck 是 install 内部最小就绪检查，不等同于完整 speclite validate。

NFR12: 安装器不得在 install plan 未声明且用户未确认的情况下访问远程 source、下载额外资源或执行外部脚本；install summary 必须记录每个 external access 的 redacted/display-safe source、reason 和 confirmation state。

NFR13: bundled source、自定义 Git source、local path、tarball 和 offline bundle 必须在安装摘要中展示 source type、redacted/display-safe source value、resolved version 或 content hash。

NFR13a: sourceDescriptor.trustStatus 必须区分 trusted、unverified 和 blocked；MVP 中只有 expected hash、lock match，或 bundled source 的等价 packaging manifest / package hash / package lock match 可产生 trusted，缺少信任锚但可安装的 source 为 unverified，hash mismatch、lock mismatch、unsupported source 或 source policy 拒绝必须为 blocked 并阻止写入。

NFR13b: sourceDescriptor.contentHash 不对所有 source type 强制存在；MVP 必须强制 sourceDescriptor.integrityEvidence 至少包含一种可复现证据，并按 bundled source、registry、tarball/offline bundle、Git source、local source 分别记录合适 evidence。

NFR13b-1: Local source snapshot hash 只覆盖 canonical source tree allowlist，必须排除 .git、临时文件、node_modules、fixture output、本地 cache、build output 和 editor/OS metadata；local source 不得指向目标项目中的 _speclite/、.claude/skills/、.agents/skills/、_speclite-output/、fixture output、node_modules/、cache、temporary 或 build output；违反时必须输出 `source-integrity.local-source-self-reference` 并阻止写入。tarball/offline bundle 至少必须记录包文件 artifact hash，解包后的 canonical source tree hash 可作为 expected installed state 输入但不得与 artifact contentHash 混用。

NFR13b-2: Source staging、临时解包目录、package-manager cache path 和临时 Git checkout path 是 private implementation state，不得进入 public JSON、manifest/index、files index、fixture snapshot 或 ValidationIssue.details；受控成功/失败应 best-effort cleanup，崩溃残留不属于 installed-state validation 范围。

NFR13c: integrityEvidence[].verified === false 只能表示 evidence 可复现但未被 expected hash 或 lock match 背书，并且只能对应 sourceDescriptor.trustStatus === "unverified"；hash mismatch、lock mismatch 或 evidence 校验失败必须输出 source-integrity error，将 source 标记为 blocked 并阻止写入。

NFR13d: source-integrity 与 file-integrity 必须是不同 issue category；source resolver/install planning 阶段的问题使用 source-integrity，已安装文件、manifest files index 或 IDE mirror hash mismatch 使用 file-integrity 或更具体的 ide-mirror category。

NFR13e: Source descriptor 字段与语义以 source-descriptor owning SPEC 为准，PRD、Architecture、Manifest/index 和 CommandResult 中的 source descriptor 描述只作为摘要或投影，不得各自定义 trust/evidence 规则。

NFR14: human-owned custom 文件、workflow-owned 产物和发生 drift 的 IDE mirror 文件不得被 install 或 update 静默覆盖；覆盖保护通过 ownership manifest、路径规则和 hash comparison 共同判断。

NFR15: 对遗留入口或 stale entries 的处理必须默认提供 path、risk category、suggested manual action 和 verification command，不应在未确认的情况下删除用户目录中的文件。

NFR16: validate 报告和 JSON payload 不得泄露 home directory 以外的无关本机路径、环境变量值或认证信息；路径展示应使用 project-relative POSIX path，只有项目外诊断场景可使用明确标记的 redacted absolute path。

NFR17: installer 生成的脚本和配置文件必须在 manifest 中记录 generator、source version、content hash 和 ownership，便于用户审查其由 SpecLite 安装器生成。

NFR17a: Manifest/index schema、skill/help/files index、minimum phase coverage matrix、canonical target ordering、package-level hash 与 file-level hash 的职责分离必须遵守 manifest-index owning SPEC；canonical skill package hash 用于跨 IDE mirror 一致性，files index 的 file-level hash 用于 drift detection、update planning、repair planning、changed/skipped paths 和 conflicts；file hash 基于 raw bytes，line ending、executable bit、file mode、symlink handling 和 case conflict 是独立 validation dimensions，runtime scripts 与 generated scripts 必须在 files index 中记录 executable。

NFR17b: Canonical source text files 必须使用 LF；installer 不得按平台改写 canonical text line endings；如果必须生成平台专用脚本，必须作为独立 generated file 记录自己的 files index entry 和 raw-byte hash；executable 表示 POSIX executable intent，Windows 不要求 POSIX chmod 语义但仍保留该字段用于脚本生成意图和跨平台 fixture。

NFR18: MVP 必须支持 macOS 13+ 和 Windows 11 的核心安装、状态检查、验证和更新路径；不满足平台要求时必须输出 environment.unsupported-platform 诊断。

NFR19: 所有 manifest、index、hash、validate 报告、IDE target 记录、CommandResult.data path fields、issues[].affectedPath 和 plan action affected paths 必须使用 project-relative POSIX-style path，并通过同一 normalization function 生成。

NFR20: 系统必须通过跨平台 fixture 覆盖路径分隔符、LF/CRLF、可执行权限、大小写敏感路径冲突、symlink escape、path escape 和 shell invocation 差异；写入前必须阻断 symlink/path escape、case conflict 和 unsafe overwrite。

NFR21: Node.js MVP 运行时版本要求必须在安装前检查；`package.json engines.node` 必须表达 Node 22 minimum（`>=22`），CLI preflight 必须在读取或写入项目文件前校验 detected version。不满足要求时必须输出 environment.unsupported-node，并包含 detected version、required range 和安装前置建议；Node 22 和 Node 24 必须进入 fixture/release matrix，Node 24-only API 不得进入 MVP，除非提供 Node 22 兼容路径或更新 runtime policy。

NFR22: bundled source、npm public registry、private registry、local tarball、offline bundle、Git source 和 local source 的安装入口必须最终归一为包含 source type、resolved root、version、integrity evidence 和 trust status 的 source descriptor；完整 source lockfile 生成、刷新、轮转和迁移属于 Post-MVP，MVP 只消费最小 trust evidence。

NFR23: 不同 AI IDE 的平台差异必须限制在 adapter 配置、target directory metadata 和 Post-MVP command pointer artifact 中；MVP 不生成 command pointer artifact，canonical skill package 内容 hash 不得因 IDE target 不同而变化；MVP target id 必须表示物理 execution target：claude 对应 .claude/skills，agents 对应 .agents/skills，GitHub Copilot/Cursor 在 MVP 中只能通过 agents target 表示，不得在 human-readable output 中把 agents 渲染为 branded Copilot/Cursor readiness。

NFR24: 每个 AI IDE adapter 必须声明 id、target directory、supported entry types、shared target policy、known limitations、validation checks 和 canonical target order；manifest generation、CommandResult.data.ideTargets、validate.data.checkedTargets 和 fixture snapshots 必须复用 adapter registry 的 canonical target order，不得使用 glob、filesystem、user selection 或 async completion order。

NFR24a: Target status 词汇必须按层区分：install planning 使用 planned、unsupported、failed；installed phase coverage 使用 mapped、unsupported、failed；status summary 使用 not-configured、configured、partial、failed。同名 literal 可以出现在不同层，但必须由 layer-scoped type 解释，不能跨层复用含义；用户显式选择的 unsupported target 必须成为 blocking error。

NFR25: IDE mirror 生成结果必须能被 validate 反向检查，确认 skill 数量、canonical id、relative path、content hash 和 source reference 一致。

NFR25a: IDE mirror drift 必须产生稳定 issue id、category、severity 和 affected path；MVP 只有 speclite update --repair 可以显式触发 repair 行为并被 fixture 验证，普通 update 的用户确认或 --yes 不得修复 drift，speclite sync 保持 Post-MVP。

NFR25b: installer-owned drift repair 必须覆盖 _speclite metadata/control hub 与 IDE execution plane 中的 installer-owned files，并通过 fixture 验证 human-owned 与 workflow-owned 内容保持不变。

NFR25c: repair plan 输出必须稳定、可诊断、可测试；相同 drift 状态下 repeated repair planning 应产生相同 affected path、hash 和 action 集合。

NFR26: 系统必须用 not-configured、configured、partial、failed 4 类状态报告每个 IDE target，并为 partial/failed 输出原因和 affected path。

NFR27: 新增 IDE adapter 不应要求修改 canonical skill 内容；adapter 测试必须证明 canonical skill package hash 在新增前后不变。

NFR28: manifest/index、help catalog 和 menu target 之间必须保持可验证的一致关系：MVP 中每个 menu target 必须能解析到唯一 installed self-contained skill entry，command pointer target 保持 Post-MVP。

NFR28a: Source 侧以 assets/source/speclite/ 下的 module metadata 与 source skill package 作为 canonical truth；installed 侧以 manifest/index 作为已安装投影；help index 只能引用 canonicalSkillId、phase、entry label 和 activation target，不得定义第二套 skill identity、alias-only identity 或 IDE-specific skill identity。

NFR28b: Configured workflow artifact root 和 artifactContract.defaultOutputPath 必须是 project-relative POSIX path，并且解析后位于 target project boundary 内；symlink/path escape 必须报告 artifact-path.escapes-project 或 artifact-path.symlink-escape，不得把 escaped absolute path 写入 public JSON、manifest/index 或 fixture snapshot。

NFR29: shared scripts、module directories、configuration 和 help catalog 的安装结果必须能在 ready summary 和 validate 中以 installed/missing/mismatched 状态检查。

NFR30: 所有核心命令必须输出 success、warning 或 failure 状态；每个状态必须包含 command、target project、summary 和 next action；failure 必须对应非 0 exit code，success 和 warning 必须对应 0 exit code。

NFR31: 错误信息必须包含 issue id、category、severity、affected path 或 component、impact 和 suggested next step。

NFR32: environment guard、stale legacy entries、legacy namespace residue、runtime path 错误、manifest/schema 错误、source integrity 错误、installed file integrity 错误、operation lock 错误、update/repair planning blocker 和 IDE mirror 漂移必须以不同 issue category 呈现，并在 validate summary 或 command-level issue 输出中分别计数或呈现。

NFR32a: ValidationIssue.category、issue id 边界、默认 severity 指引和 validation fixture ownership 由 validation issue taxonomy owning SPEC 管理；新增 issue category 必须先更新该 SPEC，新增 issue id 必须在同一变更中补 fixture assertion。

NFR32b: manifest-schema.migration-needed 是 MVP 保留 issue id，用于旧版或不兼容 manifest/index schema 需要迁移时的诊断；不得用自由文本 issue id 表示 schema migration。

NFR32c: manifest-schema.migration-needed 的 details 至少必须包含 currentSchemaVersion、supportedSchemaVersion、migrationKind 和 manualActionRequired，且不得包含 absolute path、timestamp、stack trace 或环境相关文本；MVP producers 只能输出 migrationKind: "manual" 或 "unsupported"，"automated-available" 只作为 Post-MVP migration tooling 的 forward-compatible enum value。

NFR32d: 每个 MVP issue category 必须在 taxonomy SPEC 中预留最小 issue id baseline；实现不得发明自由文本 issue id，新增 issue id 必须先更新 taxonomy，并在同一变更中补 fixture assertion。

NFR32e: 企业 source 失败必须使用稳定 source-integrity issue id，包括 registry unreachable、authentication required、offline bundle unreadable 和 tarball unreadable；credentials 和 credential-bearing URLs 必须 redacted。

NFR32f: Write-capable command 出现 operation-lock.project-locked 必须为 failure 且非 0 exit code；validate 发现 stale lock 时可以输出 operation-lock.stale-lock warning，不阻断。

NFR32g: update.conflicts 是 command-level update/repair planning blocker，category 必须为 update，severity 必须为 error；逐路径冲突只放在 data.conflicts，不得复制成多个 issues。

NFR33: status 只提供 source/channel/version、IDE target coverage、manifest presence、required path presence 和 high-level health；status 不提供 full validation category coverage，也不证明 installation healthy。安装健康断言必须读取 status.data.highLevelHealth；逐项 issue id、category、severity、affected path 和修复建议属于 validate。

NFR34: 安装完成摘要必须展示安装位置、已安装模块、已配置 AI IDE、关键目录、manifest version、source descriptor 和下一步使用建议。

NFR35: MVP 的机器可读输出必须与人类可读输出共享同一 issue model；同一检查结果的 issue id、category、severity 和 affected path 必须一致。

NFR35a: --json 输出必须保持 deterministic schema；相同安装状态和命令参数下，除明确允许的 timestamp 字段外，CommandResult.schemaVersion、CommandResult、ValidationIssue 和 command-specific data 的语义内容必须一致。

NFR35a-schema: CommandResult.schemaVersion 必须作为真实兼容性边界使用；speclite.command-result.v1 内不得删除字段、重命名字段、改变既有字段语义、收窄枚举、做字段类型不兼容改变或新增必填字段，这些变更必须发布为新的 schema version。

NFR35a-0: CommandResult.command 必须可跨 shell、参数顺序和命令别名稳定比较；--json、--yes、--project-root、source 参数和其他 flags 不得影响 command ID；update --repair 的 command ID 必须为 update.repair。

NFR35a-1: CommandResult.targetProject 必须可跨不同 checkout root 稳定比较；同一 trim 后非空的 project config 项目名称应产生相同 targetProject，缺失、空字符串或纯空白项目名称时同一目录 basename 应产生相同 targetProject；MVP 不得通过 slugify、字符集限制或长度改写改变该显示标识。

NFR35b: human-readable output、--json output、exit code 和 fixture assertions 必须从同一 CommandResult.status 推导；不得出现 JSON 为 success 但 exit code 非 0，或存在 error/critical issue 但 exit code 为 0 的情况。

NFR35b-1: status.data.highLevelHealth 不得与 CommandResult.status 互相推导；CommandResult.status 表示命令结果，highLevelHealth 表示安装健康摘要。

NFR35b-2: status.data.highLevelHealth === "not-configured" 是合法未安装状态，不是命令失败；status 成功判断该状态时必须返回 CommandResult.status: "success"，exit code 0，并在 nextActions 中建议运行 speclite install。

NFR35b-3: status.data.highLevelHealth === "partial" 或 "failed" 不得自动生成 warning issue，也不得自动把 CommandResult.status 推导为 warning；status 必须优先通过 summary、highLevelHealth 和 nextActions 表达轻量摘要。

NFR35b-4: speclite status --json 必须允许 issues: []；空 issues 只表示本次轻量 status 命令无命令级 warning/error/critical issue，不得作为安装健康通过的证明。

NFR35b-5: MVP status.data 不得包含 issueCounts；issueCounts 只属于 validate.data。

NFR35b-6: validate.data.issueCounts 必须固定包含 info、warning、error 和 critical 四个 key；计数为 0 的 severity 也不得省略。

NFR35b-7: validate.data.checkedCategories 必须按 canonical issue category order 输出：environment、manifest-schema、source-integrity、ide-mirror、runtime-path、menu-target、legacy-namespace、artifact-path、file-integrity、operation-lock、update；部分执行时必须保留已执行类别的相对顺序。

NFR35b-8: validate.data.checkedTargets 和 command data 中的 ideTargets 必须按 manifest/adapter registry canonical target order 输出；部分执行时必须保留已执行 targets 的相对顺序。

NFR35b-9: validate.data.validatedPaths 必须先规范化为 project-relative POSIX path，再按字典序输出。

NFR35b-10: CommandResult.issues 必须按 severity order、canonical issue category order、normalized affected path、issue id 依次排序。

NFR35b-11: CommandResult.nextActions 必须按 command-specific priority order 输出：blocking remediation、recommended next step、optional exploration；同一 priority tier 内按命令定义的稳定顺序输出。

NFR35b-12: CommandResult.summary 必须使用 command-specific stable summary template，且该约束只适用于 --json output；JSON summary 不得包含 timestamp、absolute path、home directory、环境相关措辞、随机排序内容或未规范化路径。

NFR35b-13: Human-readable output 可以更丰富，但不得成为自动化依赖的唯一承载位置；automation 需要的值必须进入 structured JSON 或 file contract，human output 也必须遵守 credential、cache path、temporary extraction path、home directory 和 local absolute source path 的 redaction/display-safe 策略。

NFR35c: command-specific data payload 不得使用未记录字段作为自动化依赖；新增、弃用或重命名 payload 字段必须通过 CommandResult.schemaVersion 和 fixture expected outputs 管理。

NFR35d: JSON path fields 必须可跨 macOS/Windows 和不同 checkout root 稳定比较；fixture snapshots 不得依赖 absolute local path、OS-specific separators 或 home directory；data.paths.projectRoot 必须为 "."。

NFR35e: ValidationIssue.issueId 必须可跨不同 affected path、IDE target、source name、hash 和运行次数稳定比较；issue id 不得包含动态值，新增 validation rule 可以新增 issue id，但不得改变已有 issue id 的问题类型语义。

NFR35f: ValidationIssue.details 必须可被 fixture snapshot 稳定比较，并不得泄露 absolute path、home directory、环境变量、认证信息、stack trace、raw exception object、timestamp、随机 id 或其它非确定性字段。

NFR35g: ValidationIssue.severity 必须作为 CommandResult.status 和 exit code 的稳定输入；各 validation rule 不得自行重定义 severity 语义，不得用 warning 阻断命令，也不得在 error/critical issue 存在时输出 command success。

NFR35h: ValidationIssue.impact 与 ValidationIssue.suggestedNextStep 必须可被 fixture snapshot 稳定比较；不得包含 path、IDE target、source name、timestamp、stack trace、hash、随机值或长段解释。

NFR35i: public JSON timestamp 必须是显式例外而非默认能力；任何允许 timestamp 的字段必须在 schema 中声明，并从 stable fixture snapshot comparison 中排除。

NFR35j: public JSON arrays 不得依赖 filesystem traversal、object insertion、rule execution、adapter completion 或 async completion order；changedPaths、skippedPaths、conflicts、completedSteps、pendingSteps、installedModules 等数组必须在 schema 中声明排序规则。

NFR36: source discovery、module selection、IDE adapter、manifest/index 生成和 validation checks 必须通过独立模块边界和公开接口连接；新增 adapter 不得修改 source discovery 逻辑。

NFR37: 新增官方模块只允许通过 module metadata、skill package 和 manifest/index generation 扩展安装流程，不应要求重写 installer pipeline。

NFR38: 新增验证规则不得改变已有 issue id、category、severity 字段含义；需要新增字段时必须通过 schema version 扩展。

NFR39: 配置和定制化解析逻辑必须集中在统一 resolver 中；skill 或 adapter 不得实现自己的配置合并规则。

NFR40: fixture project 应作为维护者验证 installer 行为的基础资产；每个新增安装能力必须同步新增或更新 fixture case、expected output 和 validation assertion。

NFR40a: MVP release gate fixtures 必须在 Node 22 和 Node 24 上通过，并包含 macOS 与 Windows path-portability 证据；Windows fixture 不要求 POSIX chmod，但必须验证 files index 中的 executable intent 和受支持的脚本入口可用性。

NFR40b: MVP release gate fixtures 必须包含最小 skill-artifact-loop，覆盖 installed IDE entry discovery、activation protocol、resolver access 和 artifact metadata 值域；多 skill、复杂 workflow 质量和人工评审结论属于 regression assets 或 Post-MVP validation。

NFR40c: source-integrity release gate 必须拆为稳定 sub-cases，至少覆盖 bundled-packaging-trusted、bundled-packaging-missing-evidence-blocked、registry-lock-trusted、registry-unverified、git-floating-blocked、local-source-snapshot-unverified、local-source-path-redacted、local-source-installed-state-blocked、artifact-hash-mismatch-blocked 和 source-unreadable-blocked。

NFR40d: Release packaging acceptance 必须作为 release checklist gate 生成 packaging manifest，验证 npm package、local tarball 和 offline bundle 包含 compiled CLI、package.json bin mapping、assets/source/speclite/、installer/runtime schemas、runtime scripts/templates 和安装执行所需 runtime assets；test/fixtures/ 与 root fixtures/ 默认不得进入 package，除非明确标记为 packaged documentation example。Packaging acceptance 不一定是 fixture project case，但必须有 stable artifact、expected assertions 和 CI/release evidence。

## Additional Requirements（补充需求）

- 启动模板：使用自定义 TypeScript Node CLI 启动模板，并采用 commander；不采用 oclif/yargs/cac/clipanion 作为主框架；CLI 框架保持轻量，业务架构由 SpecLite 自己拥有。

- 运行时基线：Node.js 22 LTS 是最低支持运行时，Node.js 24 LTS 是推荐运行时；TypeScript 类型基线使用 Node 22，避免使用 Node 24-only API，除非提供兼容路径或调整 runtime policy。

- 初始化故事必须建立 ESM package、commander 命令层、tsup 构建、tsx 本地执行、vitest 测试，并设置 bin.speclite 指向 dist/bin/speclite.js。

- MVP 不引入数据库、REST/GraphQL API、browser UI、desktop UI、后台 daemon 或云服务；系统状态来自本地文件系统和 manifest/hash baselines。

- canonical source、installer control plane、IDE execution plane 和 artifact repository 必须保持边界清晰：assets/source/speclite/ 是内置 source definitions，_speclite 是 metadata/control hub，.claude/skills 与 .agents/skills 是 execution plane，_speclite-output 是 artifact repository。

- bundled source assets 必须位于 assets/source/speclite/，不得与 src/source/ resolver 代码混放；已删除或非正式分发辅助来源不得进入 installer scope、IDE mirrors 或 manifest。

- 项目代码结构必须按能力边界组织，至少包含 src/bin、src/commands、src/installer、src/source、src/modules、src/config、src/manifest、src/ide、src/validation、src/diagnostics、src/update、src/fs、test/fixtures 等模块。

- src/commands 只负责参数解析、命令编排和返回 CommandResult，不直接写 manifest、复制 IDE mirrors 或执行深层 validation rule。

- src/config 是唯一 config/customization merge implementation；skills、adapters 或 helpers 不得实现第二套合并规则。

- speclite resolve config/customization 是 MVP runtime support command：stdout 只输出解析结果 JSON，stderr 以 JSON Lines 输出 ValidationIssue 形状 diagnostics，warning diagnostics 不导致非 0 退出码。

- resolve customization 必须用 skill directory basename 作为 customization lookup key；IDE adapters 不得重命名 canonical skill directory，除非未来 manifest 明确记录 customization key 且 resolver 支持。

- src/diagnostics/command-result-schema.ts 是 CommandResult executable contract anchor；JSON reporter、fixture assertions 和 contract tests 必须复用该 module。

- status 与 validate 必须分工清晰：status 是 lightweight local-only summary，不执行完整 hash scan、full validation category coverage 或远程 freshness check；validate 执行完整 local deterministic validation。

- validation rules 只读取状态并产生 issues，不直接修复；validate 发现 IDE drift、legacy residue、file integrity 或 runtime path 问题时只报告，不写入。

- validation issue category、issue id 和默认 severity 必须遵守 validation-issue-taxonomy owning SPEC；实现不得发明自由文本 issue id。

- validation checkedCategories 必须使用 canonical order：environment、manifest-schema、source-integrity、ide-mirror、runtime-path、menu-target、legacy-namespace、artifact-path、file-integrity、operation-lock、update。

- Source resolution 与 install planning 必须分两阶段执行：SourceResolutionPlan 先声明 external access intent，InstallPlan 再记录 resolved source descriptor、target adapter plan、planned writes、confirmation state 和 write authorization。

- SourceDescriptor trust/evidence 语义以 source-descriptor owning SPEC 为准；MVP 的 trusted 只能由 expected hash、lock match 或 bundled source 的等价 packaging manifest/package hash/package lock match 产生，floating Git source 不得进入 install planning 或写入。
- Local source self-reference guard 必须使用 `source-integrity.local-source-self-reference`，不能用自由文本 issue id 表示。

- validate 不重新访问远程 source；远程 freshness/provenance revalidation 只能发生在显式 update、安装来源解析或 Post-MVP doctor 中。

- data-driven IDE adapter registry 必须拥有 canonical target order；MVP target order 为 claude、agents，target id 表示物理 execution target，MVP 不伪造 copilot 或 cursor target id。

- IDE adapters 只能映射 target directory 与 metadata；不得修改 canonical skill package 内容，不得在 MVP 生成 command pointer artifact。

- manifest/index 是 selected modules、source descriptor、IDE targets、phase coverage、installed files、ownership 和 hash 的已安装投影；字段契约以 manifest-index owning SPEC 为准。

- Help index 只能引用 canonicalSkillId、phase、entry label 和 activation target，不得定义第二套 skill identity、alias-only identity 或 IDE-specific identity。

- canonical skill package hash 用于跨 IDE mirror 一致性；files index 的 file-level hash 用于 drift detection、update planning、repair planning、changed/skipped paths 和 conflicts。

- src/fs 是唯一 path normalization、safe writes 与跨平台文件操作模块；所有 public path 必须先规范化为 project-relative POSIX path。

- installer-owned 写入必须使用同目录 temp-write + rename；temporary filename 必须包含 `.speclite-tmp-` marker，且不得进入 files index、manifest/index、public JSON 或 stable fixture snapshot；MVP update/repair 不自动清理 lock 或 stale temp files。

- 写入前必须阻断 symlink escape、path escape、case conflict 和 unsafe overwrite。

- write-capable command 必须获取 _speclite/.lock project operation lock；MVP lock 是 non-reentrant，lock 是 volatile control file，不进入 files index，也不参与 stable files-index hash。

- update 默认遇到 installer-owned drift 也产生 conflict，不静默覆盖；普通 update 的用户确认或 --yes 只授权无 conflict 的 planned update writes，不得恢复 drift；只有 update --repair 才可恢复可安全 repair 的 canonical 内容。

- repair plan 必须列出 affected paths、ownership、current hash、expected hash 和 action；脚本模式需要 --yes，dry-run 或未确认时保留真实 unapplied plan，不得伪装为 skip:not-authorized。

- MVP update/repair 输出 impact summary、changed/skipped/conflict paths 和 machine-readable plan，但不生成 standalone report artifact，不提供 backup/restore、顶级 repair 或 sync。

- human-owned custom TOML 默认只读保护；fresh install 可 create-if-absent 创建 stub，但如果已存在不得覆盖、重写、重排或格式化。

- workflow-owned artifacts 不参与 update 覆盖，并且必须被 ownership/path 规则保护。

- fixture projects 是验收资产，不是可选示例；MVP release gate fixtures 至少包括 fresh-install-empty-project、existing-install-update、ide-drift、source-integrity fixture group required sub-cases、resolve-parity、path-portability 和最小 skill-artifact-loop。

- skill-artifact-loop 作为 MVP 最小 release gate 覆盖一个阶段化 skill 从 IDE entry 发现、激活、读取 resolver 到写出带 metadata planning 或 review artifact 的闭环；richer multi-skill 或文档示例场景属于 regression assets。

- Release readiness 必须依赖 fixture acceptance，包括 Node 22/Node 24 兼容、macOS/Windows path-portability evidence、manifest/index snapshots、status/validate/update/resolve expected outputs。

- 第一实现优先级必须先阅读 _bmad-output/planning-artifacts/specs/README.md，再按其中顺序阅读 owning SPEC，随后再读 PRD 与 Architecture 摘要。

- 第一批代码应优先建立 src/bin、src/commands、src/fs、src/diagnostics 和测试骨架，并优先落地 CommandResult executable contract anchor、producer/consumer contract tests 和最小 fixture expected outputs。

- CLI 提示、进度事件、就绪摘要、诊断消息和人类可读输出的文案必须由 diagnostics/output 或 owning SPEC 统一管理；stories 可以定义行为和必需信息层级，但不得让实现者在各命令中临场拼接互相冲突的文案。

- 交互模式与脚本模式必须明确分层：交互模式可以展示提示、确认和解释性摘要；脚本模式必须依赖 flags、exit code、`CommandResult` data payload 和稳定 JSON，不得依赖 human-readable output 承载自动化字段。

## NFR Coverage Map（NFR 覆盖映射）

本映射按 cross-cutting capability 分组，说明 NFR 由哪些 Epic/Story 和 owning SPEC 承接；字段、排序、issue id、hash 和 fixture comparison 细节仍以对应 SPEC 为准。

| NFR Group | Primary Coverage | Owning Contract / Validation Anchor |
| --- | --- | --- |
| NFR1、NFR10-NFR11、NFR34 | Epic 1 / Story 1.6 覆盖 install progress、ready summary gate、失败时不展示 ready summary 和安装摘要信息；Epic 6 / Story 6.2 用 fixture gate 验证。 | `01-command-result-json-contract.md`、`08-fixture-contract.md` |
| NFR2-NFR3、NFR5-NFR5a、NFR9-NFR9a、NFR33 | Epic 3 / Story 3.1 与 Story 3.6 覆盖 lightweight status、local deterministic validate、checked categories 和 status/validate 分工；Epic 6 / Story 6.4 覆盖 performance evidence。 | `01-command-result-json-contract.md`、`07-validation-issue-taxonomy.md`、`08-fixture-contract.md` |
| NFR4-NFR8、NFR14-NFR17b、NFR25a-NFR25c、NFR32f-NFR32g | Epic 4 / Story 4.1-4.6 覆盖 ownership/hash、update conflict、operation lock、safe write、repair planning 和 protected files；Epic 6 / Story 6.2-6.3 用 drift/update fixtures 验证。 | `03-install-plan-contract.md`、`04-manifest-index-contract.md`、`08-fixture-contract.md` |
| NFR12-NFR13e、NFR22 | Epic 5 / Story 5.1-5.5 覆盖 source selection、source integrity evidence、trust status、redaction、Git pinning 和 validate no-network boundary。 | `02-source-descriptor-contract.md`、`03-install-plan-contract.md`、`07-validation-issue-taxonomy.md` |
| NFR18-NFR21、NFR35d、NFR40a | Epic 1 / Story 1.1 覆盖 runtime/platform guard；Epic 3 / Story 3.6 和 Epic 6 / Story 6.4 覆盖 project-relative POSIX path、Node 22/24、macOS/Windows portability、case/symlink/path escape 和 executable intent。 | `01-command-result-json-contract.md`、`04-manifest-index-contract.md`、`08-fixture-contract.md` |
| NFR23-NFR29、NFR24a、NFR28b | Epic 2 / Story 2.1-2.3 覆盖 discovery metadata、IDE target mapping 和 phase coverage；Epic 3 / Story 3.2-3.4 覆盖 manifest/help/menu/IDE mirror/artifact root validation；Epic 6 / Story 6.3 验证 drift。 | `04-manifest-index-contract.md`、`05-ide-adapter-registry-contract.md` |
| NFR30-NFR32e、NFR35-NFR35j | Epic 3 / Story 3.5-3.6 覆盖 `CommandResult`、`ValidationIssue`、exit code、issue ordering、summary、nextActions、stable details 和 JSON determinism。 | `01-command-result-json-contract.md`、`07-validation-issue-taxonomy.md` |
| NFR36-NFR40 | Architecture component boundaries 与 Epic 6 release confidence 覆盖 source/module/adapter/manifest/validation 独立边界、schema evolution、统一 resolver 和 fixture release gate。 | `04-manifest-index-contract.md`、`06-resolve-command-contract.md`、`08-fixture-contract.md` |

## UX Design Requirements（UX 设计需求）

已纳入独立 UX Design 文档：`_bmad-output/planning-artifacts/ux-design-specification.md`。

UX 设计确认 SpecLite MVP 不提供传统 Web、mobile 或 desktop GUI；核心体验是 terminal + local filesystem control plane。UX 要求通过 CLI 输出、文件系统空间模型、structured JSON、fixture expected outputs 和文档示例共同实现。

本轮提取的 UX-DR 如下：

- UX-DR1: Human-readable output 与 `--json` output 必须共享同一 semantic model；automation 依赖字段必须进入 structured JSON 或 file contract，不得只存在于 human-readable 文案。
- UX-DR2: 输出层必须支持 Compact、Evidence、Structured 三类 presentation profiles；`status` 默认偏 compact，`install`/`validate`/`update` 默认偏 evidence，`--json`/fixture/CI 使用 structured。
- UX-DR3: Ready summary 必须展示可复核证据，包括 completed steps、installed modules、IDE targets、key paths 和 next actions，而不是只输出 `done` 或 `success`。
- UX-DR4: Phase Coverage Matrix 必须可作为方法论导航和治理证据，展示 phaseId、phaseLabel、moduleId、canonicalSkillId、targetId、entryPath、activationTarget、status 和 artifactContract。
- UX-DR5: Validation Issue Row 必须包含 severity、category、issueId、affectedPath、impact 和 suggestedNextStep；颜色或符号不得成为唯一语义载体。
- UX-DR6: Update Plan Block 必须在授权前展示 planned effects、write authorization status、changed/skipped/conflict paths 和 protected boundaries。
- UX-DR7: Filesystem Space Map 必须把 `_speclite`、IDE execution plane、`_speclite-output` 和 project knowledge 的 path role / ownership / safe action 表达清楚。
- UX-DR8: Artifact Evidence Card 必须展示 artifact path、workflowType、sourceSkill、generatedAt、configured root 和 default output path，并明确 workflow-owned artifacts 不由 install/update 静默覆盖。
- UX-DR9: Human-readable output 必须在 compact terminal width、standard width、wide width 下保持关键字段可读；窄终端宽表格必须降级为 key-value block。
- UX-DR10: `NO_COLOR`、non-TTY 和 CI 环境下 human-readable output 不得包含 ANSI escape，且不依赖 spinner-only progress、颜色、图标或动态覆盖行传达唯一信息。
- UX-DR11: 文档示例默认使用无颜色、固定顺序、可复制输出，并应与 fixture expected outputs 的结构语言一致。

这些 UX-DR 通过现有 stories 承接，不新增 MVP Epic：Story 1.6 承接 ready summary 与 install progress；Story 3.5 承接 shared semantic model 与 renderer profiles；Story 3.6 承接 validate ordering、terminal fallback 和 no-color/non-TTY 可读性；Story 4.3 承接 update plan block；Story 6.1 与 Story 6.4 承接 fixture/snapshot、terminal width、no-color/CI 和 cross-platform evidence。

## FR Coverage Map（FR 覆盖映射）

FR1: Epic 1 - 指定安装目录。

FR2: Epic 1 - 解析并展示最终安装路径。

FR3: Epic 1 - 检查安装目录状态与既有安装内容。

FR4: Epic 1 - 确认安装目标目录。

FR5: Epic 1 - 选择官方 SpecLite 模块或能力包。

FR6: Epic 1 - 展示可安装模块版本信息。

FR7: Epic 1 - 展示模块、版本和安装摘要。

FR8: Epic 5 - 选择自定义安装来源。

FR9: Epic 5 - 从 Git source 或 local path 安装或验证 source。

FR10: Epic 1 - 选择 AI IDE targets。

FR11: Epic 1 - 展示每个 AI IDE target 配置结果。

FR12: Epic 1 - 创建 SpecLite 项目级运行元数据结构。

FR13: Epic 1 - 创建 SpecLite 过程产物输出结构。

FR14: Epic 1 - 发现正式可分发 source skills。

FR15: Epic 1 - 将 canonical skill 暴露到多个 AI IDE。

FR16: Epic 1 - 查看安装完成后的项目结构和安装摘要。

FR17: Epic 1 - 查看安装完成后的下一步指引。

FR18: Epic 2 - 生成 IDE-specific discovery metadata。

FR19: Epic 2 - 将 discovery metadata 映射为 self-contained skill entry。

FR20: Epic 2 - 通过 IDE entry 选择并激活 SpecLite skill。

FR21: Epic 2 - 调用 SPEC、方案评审、故事规划、实现、测试和审查能力。

FR22: Epic 2 - 已激活 skill 读取项目级配置、customization 覆盖和上下文。

FR23: Epic 2 - workflow 按约定输出 artifact 并记录 metadata。

FR23a: Epic 2 - 校验 artifact metadata 的最小值域。

FR24: Epic 2 - 查看 MVP 最小阶段覆盖矩阵。

FR25: Epic 3 - 查看当前项目 SpecLite 安装状态。

FR26: Epic 3 - 查看安装来源、版本和 IDE target 覆盖情况。

FR27: Epic 3 - 验证 manifest、skill index、help index 和 files index。

FR28: Epic 3 - 验证多个 IDE mirrors 与 canonical source 一致。

FR28a: Epic 3 - 报告 IDE mirror canonical package hash drift。

FR29: Epic 3 - 检测缺失菜单目标或不可激活 skill。

FR30: Epic 3 - 检测 runtime path、legacy namespace residue 和 artifact path 问题。

FR31: Epic 3 - 检测旧版或遗留 AI IDE 入口。

FR32: Epic 3 - 报告遗留入口重叠导致的重复加载、菜单冲突或能力漂移风险。

FR33: Epic 3 - 为遗留入口提供人工清理建议。

FR34: Epic 3 - 验证 shared scripts、module directories、configuration、help catalog 和 IDE mirrors 安装完成。

FR35: Epic 3 - 输出可诊断验证结果。

FR35a: Epic 3 - 核心命令支持统一 CommandResult JSON envelope。

FR35b: Epic 3 - CommandResult issues 复用 ValidationIssue model。

FR35c: Epic 3 - public JSON 字段以 owning SPEC 为真源。

FR36: Epic 4 - 更新 installer-owned 文件。

FR37: Epic 4 - 区分 installer-owned、human-owned 和 workflow-owned 文件。

FR38: Epic 4 - 更新前识别本地文件是否被用户修改。

FR39: Epic 4 - 避免覆盖 human-owned custom 文件。

FR40: Epic 4 - 避免覆盖 workflow-owned 过程产物。

FR41: Epic 4 - 展示 update 影响摘要、changed/skipped paths 和 conflicts。

FR41a: Epic 4 - update 默认将 IDE mirror drift 或 installer-owned drift 标记为 conflict。

FR41b: Epic 4 - update --repair 只修复可安全恢复或重建的 installer-owned drift。

FR41c: Epic 4 - install/update/repair 遵守 plan-before-write、写入授权、operation lock、safe write 和 partial failure 诊断。

FR42: Epic 1 - 安装过程中配置用户称呼或团队名称。

FR43: Epic 1 - 安装过程中配置项目名称。

FR44: Epic 1 - 安装过程中配置 AI agent 交流语言。

FR45: Epic 1 - 安装过程中配置文档输出语言。

FR46: Epic 1 - 安装过程中配置过程产物输出目录。

FR47: Epic 1 - 选择快速配置或详细配置模式。

FR48: Epic 1 - 使用项目级配置定义用户称呼、项目名称、语言、产物路径、安装模块和 IDE targets。

FR49: Epic 2 - 通过 customization 覆盖 skill workflow、agent persona、菜单项和输出路径默认值。

FR50: Epic 4 - 按 installer base、installer user、team custom、user custom 优先级解析并合并配置。

FR51: Epic 4 - 通过 ownership manifest、路径规则和只读策略保留 human-owned 配置维护边界。

FR51a: Epic 4 - MVP 默认不修改 human-owned TOML。

FR51b: Epic 1 / Story 1.4 + Epic 4 / Story 4.1 - Fresh install 只 create-if-absent 创建 _speclite/custom/config.toml 与 _speclite/custom/config.user.toml project-level stubs，已存在时不得覆盖或重排；skill-specific custom stubs 不由 fresh install 默认创建。

FR52: Epic 2 - skills 使用统一配置访问项目名称、用户偏好、输出路径和流程约定。

FR52a: Epic 2 - 提供 speclite resolve config 与 speclite resolve customization runtime support command。

FR52b: Epic 2 - speclite resolve 保持 Python resolver parity。

FR52c: Epic 2 - resolve-parity fixture 覆盖 config/customization resolver 兼容性。

FR53: Epic 5 - 从 npm public registry 安装 SpecLite。

FR54: Epic 5 - 从 private registry 安装 SpecLite。

FR55: Epic 5 - 从 local tarball 安装 SpecLite。

FR56: Epic 5 - 从 offline bundle 安装 SpecLite。

FR57: Epic 5 - 从 Git source 安装并在写入前固定到 commit SHA。

FR58: Epic 5 - 记录并展示安装来源、channel 和版本信息。

FR59: Epic 5 - 在安装来源不可用或不合法时给出明确失败原因。

FR60: Epic 1 - 展示 source discovery、manifest generation、IDE mirror creation、config initialization 和 ready check 阶段状态。

FR61: Epic 1 - 展示 shared scripts、module directories、configuration、help catalog 和 IDE integrations 安装结果。

FR62: Epic 1 - 展示每个已配置 AI IDE 的 skill 数量和目标目录。

FR63: Epic 1 - 展示 SpecLite ready summary。

FR63a: Epic 1 - install --json 的 InstallCommandData 承载 ready summary 自动化字段。

FR64: Epic 1 - 展示如何启动 AI agent 和调用帮助 skill。

FR65: Epic 1 - 展示安装位置、已安装模块和已配置工具清单。

FR66: Epic 6 - 验证新增或修改 source skill 是否可安装。

FR67: Epic 6 - 使用 fixture project 复现 fresh install。

FR68: Epic 6 - 使用 fixture project 验证安装前后目录变化。

FR69: Epic 6 - 使用 fixture project 验证 status、validate 和 update。

FR70: Epic 6 - 验证至少一个 skill 从 IDE 发现到 artifact 输出的闭环。

FR71: Epic 6 - 用示例与 fixture 帮助文档读者理解安装结构和验证结果。

FR71a: Epic 6 - Fixture expected outputs 作为契约测试资产同步维护。

FR71b: Epic 6 - Fixture layout、expected outputs、snapshot comparison 和 release gate 由 owning SPEC 管理。

Post-MVP backlog coverage，不进入 MVP implementation readiness gate：

FR72: Epic 7 - 初始化或重建项目级配置。

FR73: Epic 7 - 列出模块、skills、IDE targets 或版本。

FR74: Epic 7 - 运行环境、source、权限、IDE target、manifest、路径和文件完整性诊断。

FR75: Epic 7 - 显式同步 source 与 IDE mirrors。

FR76: Epic 7 - 移除 installer-owned 安装结果。

FR77: Epic 7 - Post-MVP CI、企业工具链和自动化验证流程消费 MVP 机器可读输出；MVP 不实现企业集成 workflow。

FR78: Epic 7 - 查看规范落地与流程覆盖报告。
