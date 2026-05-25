---
stepsCompleted: [1, 2, 3, 4]
currentStep: 4
status: 'complete'
inputDocuments:
  - path: '_bmad-output/planning-artifacts/prd.md'
    type: 'prd'
    title: 'Product Requirements Document - SpecLite'
  - path: '_bmad-output/planning-artifacts/architecture.md'
    type: 'architecture'
    title: 'Architecture Decision Document（架构决策文档）'
workflowType: 'epics-and-stories'
sourceSkill: 'bmad-create-epics-and-stories'
project_name: 'SpecLite'
user_name: 'Fancyliu'
date: '2026-05-24'
---

# SpecLite Epic Breakdown（SpecLite Epic 拆解）

## Overview（概览）

本文档提供 SpecLite 的完整 Epic 与 Story 拆解，将 PRD、UX Design（如存在）和 Architecture 中的需求拆解为可实施的 stories（故事）。

## Requirements Inventory（需求清单）

### Functional Requirements（功能需求）

FR1: 项目维护者可以指定 SpecLite 安装目录。

FR2: 系统可以解析并展示最终安装路径。

FR3: 系统可以检查安装目录是否存在、是否为空、是否已有 SpecLite 安装内容。

FR4: 项目维护者可以确认是否安装到解析后的目录。

FR5: 项目维护者可以选择要安装的官方 SpecLite 模块或能力包。

FR6: 系统可以检查并展示可安装模块的版本信息。

FR7: 系统可以展示用户已选择的模块、版本和安装摘要。

FR8: 项目维护者可以选择是否从自定义来源安装 SpecLite。

FR9: 项目维护者可以从 Git source 或 local path 安装或验证 SpecLite source。

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

FR23: 已激活的 workflow 可以将产物输出到配置约定的位置，并在产物中记录 workflow type、source skill 和 generatedAt；MVP artifact contract 至少校验 artifact type、默认输出路径、workflowType、sourceSkill 和 generatedAt 元数据字段。

FR23a: Artifact metadata 的 MVP 校验必须覆盖最小值域：workflowType 必须是非空稳定字符串，sourceSkill 必须是非空 canonical skill id，generatedAt 若存在必须是 ISO 8601 string，且默认排除出 stable fixture snapshot comparison。

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

FR35c: PRD 不定义第二份 public JSON 字段真源；新增 public JSON 字段、reason code、redacted path 形状、排序规则或 command-specific payload 行为时，必须先更新 owning SPEC，再同步 executable schema/parser 和 fixture expected outputs。

FR36: 项目维护者可以更新已安装的 SpecLite installer-owned 文件。

FR37: 系统可以区分 installer-owned、human-owned 和 workflow-owned 文件。

FR38: 系统可以在更新前识别本地文件是否被用户修改。

FR39: 系统可以避免覆盖 human-owned custom 文件。

FR40: 系统可以避免覆盖 workflow-owned 过程产物。

FR41: 项目维护者可以看到 update 对安装内容、用户定制和过程产物的影响摘要，包括 planned effects、实际 changed/skipped paths 和 conflicts；public output 契约以 command-result JSON owning SPEC 为准。

FR41a: update 遇到 IDE mirror drift 或其他 installer-owned drift 时必须默认标记 conflict，不得静默覆盖；MVP 只有 speclite update --repair 或用户确认后才可恢复 canonical 内容，不新增顶级 speclite repair 命令，speclite sync 保持 Post-MVP。

FR41b: speclite update --repair 必须只修复可安全恢复或重建的 installer-owned drift，并继续保护 human-owned custom 文件和 workflow-owned artifacts；repair eligibility、missing source evidence、restore-canonical/regenerate、conflict projection 和 reason code 语义以 owning SPEC 为准。

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

FR51b: Fresh install 可以在目标路径不存在时创建 human-owned TOML stub；如果 _speclite/custom/*.toml 或 _speclite/custom/*.user.toml 已存在，install/update/repair 不得覆盖、重写、重排或格式化。

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

FR77: 工具链维护者可以把 MVP 机器可读输出接入 CI、企业工具链和自动化验证流程。

FR78: 企业规范负责人可以查看包含阶段入口覆盖率、标准产物存在率、validate 通过率和未解决缺口数量的规范落地与流程覆盖报告；该报告属于 Post-MVP，可在 MVP 最小阶段覆盖矩阵与 validate output 之上增加趋势、导出、多项目/团队视角和企业治理汇总。

### NonFunctional Requirements（非功能需求）

NFR1: 在常规 fixture 项目中，fresh install 必须至少输出 source discovery、manifest generation、IDE mirror creation、config initialization 和 ready check 5 个阶段状态；fixture baseline 应记录阶段顺序、完成结果和阶段耗时。

NFR2: status 在常规 fixture 项目中应在 2 秒内返回项目安装摘要，不执行完整文件完整性扫描；性能基准以 3 次连续运行的 p95 结果为准。

NFR2a: MVP status 必须是轻量本地只读摘要，只读取本地 manifest、source descriptor、manifest version、installed modules、IDE target summary、关键路径和 high-level health；不得访问远程 source，不得执行 remote freshness check、provenance revalidation、完整文件 hash scan 或隐式 update check。

NFR3: validate 可以执行完整校验，但必须按 manifest/schema、IDE mirror、runtime path、menu target、artifact path 和 file integrity 类别输出进度；常规 fixture 项目中每个类别必须在开始和结束时输出状态。

NFR4: update 与 validate 必须跳过 hash 未变化的 source skills 和 IDE mirrors；在 fixture baseline 中，未变化文件的重复写入次数必须为 0。

NFR5: fixture project 中的 fresh install、status、validate、update 必须记录 baseline runtime；任一命令相较上一 accepted baseline 退化超过 25% 时，验证报告必须标记为 performance regression。

NFR6: 相同 source、配置、目标 IDE 和安装目录在同一平台上重复安装，应生成 byte-for-byte 一致的 _speclite/_config、manifest/index 和 IDE mirror 文件；允许差异仅限明确标记的时间戳字段。

NFR7: install 对已存在安装内容必须输出 existing-install 状态，列出 detected runtime、manifest version、IDE targets 和下一步选项，不得静默覆盖已有 SpecLite 状态。

NFR8: update 必须在修改文件前完成所有权和本地变更判断；无法确认安全时必须跳过该文件、输出 conflict 状态，并保留原文件不变。

NFR9: validate 的检查结果必须可复现，同一安装状态下连续运行 3 次应返回相同 issue id、category、severity 和 affected path 集合。

NFR9a: MVP validate 必须是本地确定性命令，不得访问 npm registry、private registry、Git remote、offline bundle origin 或其他远程 source；不得执行 remote freshness check 或 provenance revalidation。

NFR10: 安装失败时，系统不得展示 ready summary；失败结果必须列出 completed steps、failed step、pending steps 和 manual action，且退出状态不得为成功。

NFR11: ready summary 只能在 source discovery、manifest generation、IDE mirror creation、config initialization 和 basic validation 全部成功后展示。

NFR12: 安装器不得在 install plan 未声明且用户未确认的情况下访问远程 source、下载额外资源或执行外部脚本；install summary 必须记录每个 external access 的 redacted/display-safe source、reason 和 confirmation state。

NFR13: 自定义 Git source、local path、tarball 和 offline bundle 必须在安装摘要中展示 source type、redacted/display-safe source value、resolved version 或 content hash。

NFR13a: sourceDescriptor.trustStatus 必须区分 trusted、unverified 和 blocked；MVP 中只有 expected hash/lock match 可产生 trusted，缺少信任锚但可安装的 source 为 unverified，hash mismatch、lock mismatch、unsupported source 或 source policy 拒绝必须为 blocked 并阻止写入。

NFR13b: sourceDescriptor.contentHash 不对所有 source type 强制存在；MVP 必须强制 sourceDescriptor.integrityEvidence 至少包含一种可复现证据，并按 registry、tarball/offline bundle、Git source、local source 分别记录合适 evidence。

NFR13b-1: Local source snapshot hash 只覆盖 canonical source tree allowlist，必须排除 .git、临时文件、node_modules、fixture output、本地 cache、build output 和 editor/OS metadata；tarball/offline bundle 至少必须记录包文件 artifact hash，解包后的 canonical source tree hash 可作为 expected installed state 输入但不得与 artifact contentHash 混用。

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

NFR18: MVP 必须支持 macOS 13+ 和 Windows 11 的核心安装、状态检查、验证和更新路径；不满足版本要求时必须输出 unsupported-platform 诊断。

NFR19: 所有 manifest、index、hash、validate 报告、IDE target 记录、CommandResult.data path fields、issues[].affectedPath 和 plan action affected paths 必须使用 project-relative POSIX-style path，并通过同一 normalization function 生成。

NFR20: 系统必须通过跨平台 fixture 覆盖路径分隔符、LF/CRLF、可执行权限、大小写敏感路径冲突、symlink escape、path escape 和 shell invocation 差异；写入前必须阻断 symlink/path escape、case conflict 和 unsafe overwrite。

NFR21: Node.js MVP 运行时版本要求必须在安装前检查；不满足要求时必须输出 detected version、required range 和安装前置建议。

NFR22: npm public registry、private registry、local tarball、offline bundle 和 Git source 的安装入口必须最终归一为包含 source type、resolved root、version、integrity evidence 和 trust status 的 source descriptor；完整 source lockfile 生成、刷新、轮转和迁移属于 Post-MVP，MVP 只消费最小 trust evidence。

NFR23: 不同 AI IDE 的平台差异必须限制在 adapter 配置、target directory metadata 和 Post-MVP command pointer artifact 中；MVP 不生成 command pointer artifact，canonical skill package 内容 hash 不得因 IDE target 不同而变化；MVP target id 必须表示物理 execution target：claude 对应 .claude/skills，agents 对应 .agents/skills，GitHub Copilot/Cursor 在 MVP 中只能通过 agents target 表示。

NFR24: 每个 AI IDE adapter 必须声明 id、target directory、supported entry types、shared target policy、known limitations、validation checks 和 canonical target order；manifest generation、CommandResult.data.ideTargets、validate.data.checkedTargets 和 fixture snapshots 必须复用 adapter registry 的 canonical target order，不得使用 glob、filesystem、user selection 或 async completion order。

NFR24a: Target status 词汇必须按层区分：install planning 使用 planned、unsupported、failed；installed phase coverage 使用 mapped、unsupported、failed；status summary 使用 not-configured、configured、partial、failed；这些枚举不得跨层复用含义，用户显式选择的 unsupported target 必须成为 blocking error。

NFR25: IDE mirror 生成结果必须能被 validate 反向检查，确认 skill 数量、canonical id、relative path、content hash 和 source reference 一致。

NFR25a: IDE mirror drift 必须产生稳定 issue id、category、severity 和 affected path；MVP 的 speclite update --repair 或用户确认行为必须显式触发并可被 fixture 验证，speclite sync 保持 Post-MVP。

NFR25b: installer-owned drift repair 必须覆盖 _speclite metadata/control hub 与 IDE execution plane 中的 installer-owned files，并通过 fixture 验证 human-owned 与 workflow-owned 内容保持不变。

NFR25c: repair plan 输出必须稳定、可诊断、可测试；相同 drift 状态下 repeated repair planning 应产生相同 affected path、hash 和 action 集合。

NFR26: 系统必须用 not-configured、configured、partial、failed 4 类状态报告每个 IDE target，并为 partial/failed 输出原因和 affected path。

NFR27: 新增 IDE adapter 不应要求修改 canonical skill 内容；adapter 测试必须证明 canonical skill package hash 在新增前后不变。

NFR28: manifest/index、help catalog 和 menu target 之间必须保持可验证的一致关系：MVP 中每个 menu target 必须能解析到唯一 installed self-contained skill entry，command pointer target 保持 Post-MVP。

NFR28a: Source 侧以 assets/source/speclite/ 下的 module metadata 与 source skill package 作为 canonical truth；installed 侧以 manifest/index 作为已安装投影；help index 只能引用 canonicalSkillId、phase、entry label 和 activation target，不得定义第二套 skill identity、alias-only identity 或 IDE-specific skill identity。

NFR29: shared scripts、module directories、configuration 和 help catalog 的安装结果必须能在 ready summary 和 validate 中以 installed/missing/mismatched 状态检查。

NFR30: 所有核心命令必须输出 success、warning 或 failure 状态；每个状态必须包含 command、target project、summary 和 next action；failure 必须对应非 0 exit code，success 和 warning 必须对应 0 exit code。

NFR31: 错误信息必须包含 issue id、category、severity、affected path 或 component、impact 和 suggested next step。

NFR32: stale legacy entries、legacy namespace residue、runtime path 错误、manifest/schema 错误、source integrity 错误、installed file integrity 错误、operation lock 错误、update/repair planning blocker 和 IDE mirror 漂移必须以不同 issue category 呈现，并在 validate summary 或 command-level issue 输出中分别计数或呈现。

NFR32a: ValidationIssue.category、issue id 边界、默认 severity 指引和 validation fixture ownership 由 validation issue taxonomy owning SPEC 管理；新增 issue category 必须先更新该 SPEC，新增 issue id 必须在同一变更中补 fixture assertion。

NFR32b: manifest-schema.migration-needed 是 MVP 保留 issue id，用于旧版或不兼容 manifest/index schema 需要迁移时的诊断；不得用自由文本 issue id 表示 schema migration。

NFR32c: manifest-schema.migration-needed 的 details 至少必须包含 currentSchemaVersion、supportedSchemaVersion、migrationKind 和 manualActionRequired，且不得包含 absolute path、timestamp、stack trace 或环境相关文本。

NFR32d: 每个 MVP issue category 必须在 taxonomy SPEC 中预留最小 issue id baseline；实现不得发明自由文本 issue id，新增 issue id 必须先更新 taxonomy，并在同一变更中补 fixture assertion。

NFR32e: 企业 source 失败必须使用稳定 source-integrity issue id，包括 registry unreachable、authentication required、offline bundle unreadable 和 tarball unreadable；credentials 和 credential-bearing URLs 必须 redacted。

NFR32f: Write-capable command 出现 operation-lock.project-locked 必须为 failure 且非 0 exit code；validate 发现 stale lock 时可以输出 operation-lock.stale-lock warning，不阻断。

NFR32g: update.conflicts 是 command-level update/repair planning blocker，category 必须为 update，severity 必须为 error；逐路径冲突只放在 data.conflicts，不得复制成多个 issues。

NFR33: status 只提供 source/channel/version、IDE target coverage、manifest presence 和 high-level health；validate 提供逐项 issue id、category、severity、affected path 和修复建议。

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

NFR35b-7: validate.data.checkedCategories 必须按 canonical issue category order 输出：manifest-schema、source-integrity、ide-mirror、runtime-path、menu-target、legacy-namespace、artifact-path、file-integrity、operation-lock、update；部分执行时必须保留已执行类别的相对顺序。

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

### Additional Requirements（补充需求）

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

- status 与 validate 必须分工清晰：status 是 lightweight local-only summary，不执行完整 hash scan 或远程 freshness check；validate 执行完整 local deterministic validation。

- validation rules 只读取状态并产生 issues，不直接修复；validate 发现 IDE drift、legacy residue、file integrity 或 runtime path 问题时只报告，不写入。

- validation issue category、issue id 和默认 severity 必须遵守 validation-issue-taxonomy owning SPEC；实现不得发明自由文本 issue id。

- validation checkedCategories 必须使用 canonical order：manifest-schema、source-integrity、ide-mirror、runtime-path、menu-target、legacy-namespace、artifact-path、file-integrity、operation-lock、update。

- Source resolution 与 install planning 必须分两阶段执行：SourceResolutionPlan 先声明 external access intent，InstallPlan 再记录 resolved source descriptor、target adapter plan、planned writes、confirmation state 和 write authorization。

- SourceDescriptor trust/evidence 语义以 source-descriptor owning SPEC 为准；MVP 的 trusted 只能由 expected hash/lock match 产生，floating Git source 不得进入 install planning 或写入。

- validate 不重新访问远程 source；远程 freshness/provenance revalidation 只能发生在显式 update、安装来源解析或 Post-MVP doctor 中。

- data-driven IDE adapter registry 必须拥有 canonical target order；MVP target order 为 claude、agents，target id 表示物理 execution target，MVP 不伪造 copilot 或 cursor target id。

- IDE adapters 只能映射 target directory 与 metadata；不得修改 canonical skill package 内容，不得在 MVP 生成 command pointer artifact。

- manifest/index 是 selected modules、source descriptor、IDE targets、phase coverage、installed files、ownership 和 hash 的已安装投影；字段契约以 manifest-index owning SPEC 为准。

- Help index 只能引用 canonicalSkillId、phase、entry label 和 activation target，不得定义第二套 skill identity、alias-only identity 或 IDE-specific identity。

- canonical skill package hash 用于跨 IDE mirror 一致性；files index 的 file-level hash 用于 drift detection、update planning、repair planning、changed/skipped paths 和 conflicts。

- src/fs 是唯一 path normalization、safe writes 与跨平台文件操作模块；所有 public path 必须先规范化为 project-relative POSIX path。

- installer-owned 写入必须使用 temp-write + rename；safe-write temporary files 不进入 files index；MVP update/repair 不自动清理 lock 或 stale temp files。

- 写入前必须阻断 symlink escape、path escape、case conflict 和 unsafe overwrite。

- write-capable command 必须获取 _speclite/.lock project operation lock；lock 是 volatile control file，不进入 files index，也不参与 stable files-index hash。

- update 默认遇到 installer-owned drift 也产生 conflict，不静默覆盖；update --repair 或用户确认才可恢复 canonical 内容。

- repair plan 必须列出 affected paths、ownership、current hash、expected hash 和 action；脚本模式需要 --yes，dry-run 或未确认时保留真实 unapplied plan，不得伪装为 skip:not-authorized。

- MVP update/repair 输出 impact summary、changed/skipped/conflict paths 和 machine-readable plan，但不生成 standalone report artifact，不提供 backup/restore、顶级 repair 或 sync。

- human-owned custom TOML 默认只读保护；fresh install 可 create-if-absent 创建 stub，但如果已存在不得覆盖、重写、重排或格式化。

- workflow-owned artifacts 不参与 update 覆盖，并且必须被 ownership/path 规则保护。

- fixture projects 是验收资产，不是可选示例；MVP release gate fixtures 至少包括 fresh-install-empty-project、existing-install-update、ide-drift、source-integrity、resolve-parity 和 path-portability。

- skill-artifact-loop 至少作为 regression asset 覆盖一个阶段化 skill 从 IDE entry 发现、激活到写出 planning 或 review artifact 的闭环。

- Release readiness 必须依赖 fixture acceptance，包括 Node 22/Node 24 兼容、macOS/Windows path-portability evidence、manifest/index snapshots、status/validate/update/resolve expected outputs。

- 第一实现优先级必须先阅读 _bmad-output/planning-artifacts/specs/README.md，再按其中顺序阅读 owning SPEC，随后再读 PRD 与 Architecture 摘要。

- 第一批代码应优先建立 src/bin、src/commands、src/fs、src/diagnostics 和测试骨架，并优先落地 CommandResult executable contract anchor、producer/consumer contract tests 和最小 fixture expected outputs。

- CLI 提示、进度事件、就绪摘要、诊断消息和人类可读输出的文案必须由 diagnostics/output 或 owning SPEC 统一管理；stories 可以定义行为和必需信息层级，但不得让实现者在各命令中临场拼接互相冲突的文案。

- 交互模式与脚本模式必须明确分层：交互模式可以展示提示、确认和解释性摘要；脚本模式必须依赖 flags、exit code、`CommandResult` data payload 和稳定 JSON，不得依赖 human-readable output 承载自动化字段。

### UX Design Requirements（UX 设计需求）

无独立 UX Design 文档；本轮未提取 UX-DR。

### FR Coverage Map（FR 覆盖映射）

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

FR51b: Epic 4 - Fresh install 只 create-if-absent 创建 human-owned TOML stub，已存在时不得覆盖或重排。

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

FR72: Epic 7 - 初始化或重建项目级配置。

FR73: Epic 7 - 列出模块、skills、IDE targets 或版本。

FR74: Epic 7 - 运行环境、source、权限、IDE target、manifest、路径和文件完整性诊断。

FR75: Epic 7 - 显式同步 source 与 IDE mirrors。

FR76: Epic 7 - 移除 installer-owned 安装结果。

FR77: Epic 7 - 将 MVP 机器可读输出接入 CI、企业工具链和自动化验证流程。

FR78: Epic 7 - 查看规范落地与流程覆盖报告。

## Epic List（Epic 列表）

### Epic 1: Project Installation Onboarding（项目安装引导）

项目维护者可以使用默认官方内置来源，从选择目录、官方模块和 AI IDE targets 到生成 `_speclite` runtime、IDE skill mirrors、`_speclite-output` 和 ready summary，完成一次可信 fresh install。npm/private registry、local tarball、offline bundle、Git source 和 local path 等替代来源路径由 Epic 5 扩展，不属于 Epic 1 的最小垂直切片。

**覆盖 FR：** FR1, FR2, FR3, FR4, FR5, FR6, FR7, FR10, FR11, FR12, FR13, FR14, FR15, FR16, FR17, FR42, FR43, FR44, FR45, FR46, FR47, FR48, FR60, FR61, FR62, FR63, FR63a, FR64, FR65

### Epic 2: Methodology Discovery And Skill Execution（方法论发现与 Skill 执行）

AI IDE 使用者可以在 `.claude/skills` 与 `.agents/skills` 中发现、选择并激活 SpecLite 方法论能力，并让 workflow 读取统一配置、应用 customization、输出带 metadata 的过程产物。

**覆盖 FR：** FR18, FR19, FR20, FR21, FR22, FR23, FR23a, FR24, FR49, FR52, FR52a, FR52b, FR52c

### Epic 3: Installed State And Deterministic Validation（已安装状态与确定性验证）

工具链维护者可以查看安装状态，并用本地 deterministic validation 诊断 manifest、IDE mirror、runtime path、menu target、legacy residue、artifact path、file integrity 和 JSON issue contract 问题。

**覆盖 FR：** FR25, FR26, FR27, FR28, FR28a, FR29, FR30, FR31, FR32, FR33, FR34, FR35, FR35a, FR35b, FR35c

### Epic 4: Safe Update And Repair（安全更新与修复）

项目维护者可以安全更新 installer-owned 文件，在写入前获得 plan、ownership/hash 判断、operation lock 和 conflict 可见性，同时保护 human-owned custom 与 workflow-owned artifacts，并通过 `update --repair` 显式修复可恢复 drift。

**覆盖 FR：** FR36, FR37, FR38, FR39, FR40, FR41, FR41a, FR41b, FR41c, FR50, FR51, FR51a, FR51b

### Epic 5: Source Integrity And Distribution Channels（来源完整性与分发渠道）

项目维护者可以从 npm public/private registry、local tarball、offline bundle、Git source 或 local path 安装 SpecLite，并获得可诊断的 source descriptor、integrity evidence、trust status、channel/version 和失败原因。

**覆盖 FR：** FR8, FR9, FR53, FR54, FR55, FR56, FR57, FR58, FR59

### Epic 6: Maintainer Fixture And Release Confidence（维护者 Fixture 与发布信心）

SpecLite 维护者可以用 fixture projects 和 expected outputs 验证 fresh install、existing update、IDE drift、source integrity、resolve parity、path portability 和 skill artifact loop，形成发布前可信证据。

**覆盖 FR：** FR66, FR67, FR68, FR69, FR70, FR71, FR71a, FR71b

### Epic 7: Post-MVP Governance Expansion（Post-MVP 治理扩展）

团队后续可以在不破坏 MVP 契约的前提下扩展 init/list/doctor/sync/uninstall、CI/企业自动化集成和规范落地覆盖报告。

**实施范围：** 仅作为 Post-MVP backlog。Epic 7 不进入 MVP implementation readiness gate，也不阻塞 MVP sprint planning；只有当团队单独启动 Phase 2/Post-MVP planning 时，才把本 Epic 纳入 implementation readiness 检查。

**覆盖 FR：** FR72, FR73, FR74, FR75, FR76, FR77, FR78

## Epic 1: Project Installation Onboarding（项目安装引导）

项目维护者可以使用默认官方内置来源，从选择目录、官方模块和 AI IDE targets，到生成 `_speclite` runtime、IDE skill mirrors、`_speclite-output` 和 ready summary，完成一次可信 fresh install。替代来源路径由 Epic 5 扩展。

### Story 1.1: CLI Install Entry And Runtime Guard（CLI 安装入口与运行时守卫）

作为项目维护者，
我希望运行 `speclite install` 时先获得清晰的运行时与平台就绪反馈，
以便在任何项目文件被修改前，确认当前环境是否可以安全开始 SpecLite 安装。

**验收标准：**

**前提** 代码库尚未具备 MVP CLI 脚手架
**当** 维护者开始 Story 1.1
**则** 必须建立 ESM package、commander 命令层、tsup 构建、tsx 本地执行和 vitest 测试骨架
**并且** `bin.speclite` 必须指向 `dist/bin/speclite.js`。

**前提** CLI 脚手架已建立
**当** 维护者运行本地构建或冒烟测试
**则** `speclite` 入口可以加载安装命令骨架
**并且** 最小测试能验证命令入口、运行时守卫接入和确定性失败输出形状。

**前提** 用户在目标项目中运行 `speclite install`
**当** CLI 启动
**则** 命令会根据 MVP 运行时策略校验检测到的 Node.js 版本
**并且** 当版本不受支持时，报告检测到的版本和要求的版本范围。

**前提** 检测到的 Node.js 版本满足最低要求
**当** CLI 继续启动流程
**则** 命令会验证当前平台是否支持 MVP 安装路径
**并且** 当平台不受支持时，报告 `unsupported-platform` 诊断。

**前提** 运行时与平台检查均通过
**当** 安装命令初始化
**则** 命令会创建 install command context，但尚不写入 installer-owned 项目文件
**并且** 后续安装阶段会按定义顺序准备执行。

**前提** 运行时或平台校验失败
**当** 命令退出
**则** 不会创建或修改 `_speclite`、`_speclite-output`、`.claude/skills` 或 `.agents/skills` 文件
**并且** 失败结果包含清晰的下一步建议。

**前提** 用户请求机器可读输出
**当** `speclite install --json` 在运行时或平台守卫阶段失败
**则** 命令返回符合 `CommandResult` 契约的 install failure envelope
**并且** 输出可用于 fixture assertion 的确定性 issue 字段。

### Story 1.2: Project Target Directory Resolution And Existing Install Detection（项目目标目录解析与既有安装检测）

作为项目维护者，
我希望 `speclite install` 能解析我要安装到的项目目录，并在写入前识别目录状态，
以便确认 SpecLite 会安装到正确位置，且不会误覆盖已有安装或非空项目内容。

**验收标准：**

**前提** 用户启动 `speclite install` 且未显式指定安装目录
**当** 命令进入目标目录解析阶段
**则** 系统会使用当前工作目录作为默认目标项目目录
**并且** 以 project-relative POSIX-style path 展示解析后的安装位置。

**前提** 用户通过参数或交互输入指定安装目录
**当** 系统解析该目录
**则** 系统会规范化最终安装路径
**并且** 展示可供用户确认的目标路径摘要。

**前提** 解析后的安装目录不存在
**当** 系统检查目录状态
**则** 系统会报告目录将被创建
**并且** 在用户确认前不写入任何项目文件。

**前提** 解析后的安装目录已存在但没有 SpecLite 安装状态
**当** 系统检查目录内容
**则** 系统会区分空目录与非空目录
**并且** 向用户展示继续安装可能影响的项目根目录。

**前提** 解析后的安装目录已有 SpecLite 安装内容
**当** 系统检测到 `_speclite` 或 manifest/index 等安装状态
**则** 系统会报告 existing-install 状态
**并且** 列出检测到的 runtime、manifest version、IDE targets 和建议下一步。

**前提** 用户尚未确认目标目录
**当** 目标目录解析与状态检查完成
**则** 系统不会创建或修改 `_speclite`、`_speclite-output`、`.claude/skills` 或 `.agents/skills` 文件
**并且** 后续安装阶段必须等待明确确认后才能继续。

### Story 1.3: Official Module Selection And Install Summary（官方模块选择与安装摘要）

作为项目维护者，
我希望在安装前选择要安装的官方 SpecLite 模块或能力包，并看到清晰的版本与选择摘要，
以便确认本次安装范围符合项目需要。

**验收标准：**

**前提** 目标目录已解析且用户已确认可以继续安装流程
**当** 系统进入官方模块发现阶段
**则** 系统会从正式可分发的 SpecLite source tree 读取可安装模块
**并且** 不会把已删除、非目标辅助来源或非正式分发内容列为可安装模块。

**前提** 系统发现可安装模块
**当** 向用户展示模块列表
**则** 每个模块会显示模块标识、名称和版本信息
**并且** 用户可以选择一个或多个官方模块或能力包。

**前提** 用户选择模块后继续
**当** 系统生成安装范围摘要
**则** 摘要会列出已选择的模块、版本和将参与安装的能力范围
**并且** 该摘要在写入项目前展示给用户确认。

**前提** 没有发现任何可安装官方模块
**当** 系统无法形成有效安装范围
**则** 命令会停止后续安装阶段
**并且** 输出可诊断的失败原因和建议下一步。

**前提** 用户请求 `install --json` 输出
**当** 模块选择阶段完成或失败
**则** 机器可读输出会包含可用于自动化判断的 installedModules 或 pending module selection 信息
**并且** 不依赖 human-readable summary 承载自动化必需字段。

### Story 1.4: Project Config Initialization（项目配置初始化）

作为项目维护者，
我希望在安装过程中配置项目名称、用户称呼、交流语言、文档语言和产物输出目录，
以便安装后的 SpecLite skills 能读取统一项目配置并按团队约定工作。

**验收标准：**

**前提** 用户已确认安装目录和模块选择
**当** 系统进入配置初始化阶段
**则** 系统会提供快速配置与详细配置两种模式
**并且** 用户可以选择适合当前项目的配置方式。

**前提** 用户选择快速配置模式
**当** 系统收集最小配置输入
**则** 系统会确定用户称呼或团队名称、项目名称、交流语言、文档输出语言和过程产物输出目录
**并且** 对未显式提供的值使用可展示、可确认的默认值。

**前提** 用户选择详细配置模式
**当** 系统收集项目级配置输入
**则** 用户可以定义用户称呼、项目名称、交流语言、文档输出语言、产物路径、安装模块和 IDE targets
**并且** 系统会在写入前展示最终配置摘要。

**前提** 配置值已收集完成
**当** 系统准备生成项目级配置
**则** 配置会进入 `_speclite/config.toml` 与 `_speclite/config.user.toml` 的 installer-owned 初始化计划
**并且** 不会在本 Story 中修改 `_speclite/custom/*.toml` 或 `_speclite/custom/*.user.toml`。

**前提** 用户尚未确认最终配置摘要
**当** 配置初始化阶段结束
**则** 系统不会写入配置文件
**并且** 后续写入阶段必须等待明确确认后才能继续。

**前提** 用户请求 `install --json` 输出
**当** 配置初始化完成或失败
**则** 机器可读输出会包含配置初始化状态、关键配置路径和 pending/completed step 信息
**并且** 不泄露 home directory、环境变量或认证信息。

### Story 1.5: Runtime Structure, Artifact Directory And IDE Mirror Creation（运行时结构、产物目录与 IDE 镜像创建）

作为项目维护者，
我希望在确认安装计划后由系统创建 SpecLite 运行时结构、过程产物目录和 AI IDE skill mirrors，
以便目标项目获得可运行、可发现、可验证的 SpecLite 安装结果。

**验收标准：**

**前提** 用户已确认安装目录、模块选择和项目配置
**当** 系统进入写入阶段
**则** 系统会创建 `_speclite` metadata/control hub
**并且** 写入 shared scripts、module directories、configuration、help catalog 和 manifest/index 所需的 installer-owned 文件。

**前提** 项目配置中定义了过程产物输出目录
**当** 系统创建 artifact repository
**则** 系统会创建 `_speclite-output` 或配置约定的输出结构
**并且** 不会覆盖已有 workflow-owned 过程产物。

**前提** 用户选择了 `claude` IDE target
**当** 系统创建 IDE execution mirror
**则** 系统会把所选 canonical skills 安装到 `.claude/skills`
**并且** 记录每个 skill 的 canonical identity、target path 和 source reference。

**前提** 用户选择了 `agents` IDE target
**当** 系统创建 IDE execution mirror
**则** 系统会把同一批 canonical skills 安装到 `.agents/skills`
**并且** canonical skill package 内容不会因 IDE target 不同而变化。

**前提** 写入过程中目标路径已存在
**当** 系统判断文件所有权和路径安全性
**则** installer-owned 文件按计划生成或更新
**并且** human-owned custom 文件、workflow-owned artifacts、symlink escape、path escape、case conflict 和 unsafe overwrite 会被保护或阻断。

**前提** IDE mirror creation 完成
**当** 系统生成安装投影
**则** manifest/index 会记录安装模块、IDE targets、skill/help/files index、ownership 和 hash 信息
**并且** 所有 public path 使用 project-relative POSIX-style path。

**前提** 任一关键写入步骤失败
**当** 命令返回失败结果
**则** 系统不会展示 ready summary
**并且** 输出 completed steps、failed step、pending steps 和 manual action。

### Story 1.6: Install Progress And Ready Summary（安装进度与就绪摘要）

作为项目维护者，
我希望安装过程展示清晰的阶段进度，并在成功后给出完整 ready summary，
以便确认 SpecLite 已正确安装、哪些 IDE targets 已配置，以及接下来该如何开始使用。

**验收标准：**

**前提** 用户执行 `speclite install`
**当** 安装流程运行
**则** 系统会按顺序展示 source discovery、manifest generation、IDE mirror creation、config initialization 和 ready check 阶段状态
**并且** 每个阶段只在实际开始或完成时报告对应状态。

**前提** source discovery、manifest generation、IDE mirror creation、config initialization 和 basic validation 全部成功
**当** 安装流程完成
**则** 系统会展示 SpecLite ready summary
**并且** 摘要包含安装位置、manifest version、source descriptor、已安装模块、IDE targets、关键目录和下一步命令。

**前提** 已配置一个或多个 AI IDE targets
**当** 系统生成 ready summary
**则** 摘要会展示每个 AI IDE 的 skill 数量和目标目录
**并且** 标明用户下一步如何启动 AI agent 或调用帮助 skill。

**前提** 任一 required step 失败
**当** 命令结束
**则** 系统不会展示 ready summary
**并且** 失败结果会列出 completed steps、failed step、pending steps 和 manual action。

**前提** 用户请求 `install --json` 输出
**当** 安装完成、warning 或 failure
**则** 机器可读输出会包含 `sourceDescriptor`、`manifestVersion`、`installedModules`、`ideTargets`、`paths`、`completedSteps` 和 `pendingSteps` 等契约字段
**并且** 不新增未契约化的 `readySummary` JSON blob。

**前提** human-readable output 与 `--json` output 同时需要表达安装结果
**当** 命令生成最终输出
**则** 两种输出共享同一 command status 与 issue model
**并且** automation 依赖的字段必须进入 structured JSON 或 file contract。

## Epic 2: Methodology Discovery And Skill Execution（方法论发现与 Skill 执行）

AI IDE 使用者可以在 `.claude/skills` 与 `.agents/skills` 中发现、选择并激活 SpecLite 方法论能力，并让 workflow 读取统一配置、应用 customization、输出带 metadata 的过程产物。

### Story 2.1: Methodology Discovery Metadata Generation（方法论发现元数据生成）

作为 AI IDE 使用者，
我希望安装后的 SpecLite 能提供稳定的方法论发现元数据，
以便 IDE 可以展示研发阶段、可用 skills、入口路径和激活目标，而不需要用户手工查找 Markdown 文件。

**验收标准：**

**前提** SpecLite 已完成所选模块的安装规划
**当** 系统生成 discovery metadata
**则** 每个可发现能力都会记录 phaseId、phaseLabel、moduleId、canonicalSkillId、skill 名称、entry label 和 activation target
**并且** canonicalSkillId 必须来自 source skill package，不得由 IDE adapter 重新命名。

**前提** 某个 skill 属于 SPEC、方案评审、故事规划、实现、测试或审查阶段
**当** 系统生成 MVP 最小阶段覆盖数据
**则** 该 skill 会被映射到对应阶段
**并且** 每个关键研发阶段至少可以表达是否存在 mapped skill entry。

**前提** 系统生成 help index 或菜单发现数据
**当** discovery metadata 写入 installed projection
**则** help index 只能引用 canonicalSkillId、phase、entry label 和 activation target
**并且** 不得定义第二套 skill identity、alias-only identity 或 IDE-specific identity。

**前提** 某个 workflow 具有默认产物输出约定
**当** 系统生成 discovery metadata
**则** 可以记录可选 artifactContract 摘要
**并且** artifactContract 至少能支持后续校验 artifact type、默认输出路径、workflowType、sourceSkill 和 generatedAt。

**前提** discovery metadata 已生成
**当** 后续 IDE adapter 或 validation rule 读取它
**则** 字段、target order、hash 和 ownership 投影遵守 manifest/index owning SPEC
**并且** 不依赖 filesystem traversal order、glob 顺序或异步完成顺序。

### Story 2.2: IDE Skill Entry Mapping（IDE Skill Entry 映射）

作为 AI IDE 使用者，
我希望 SpecLite 把方法论发现元数据映射成 `.claude/skills` 与 `.agents/skills` 中可加载的 skill entries，
以便我可以在不同 AI IDE 中看到一致的 SpecLite 能力入口。

**验收标准：**

**前提** discovery metadata 已生成
**当** 系统处理 `claude` IDE target
**则** 每个可映射的 canonical skill 会生成 `.claude/skills` 下的 self-contained skill entry
**并且** entry 会保留 canonical skill package 内容，不因 target 不同而改写。

**前提** discovery metadata 已生成
**当** 系统处理 `agents` IDE target
**则** 每个可映射的 canonical skill 会生成 `.agents/skills` 下的 self-contained skill entry
**并且** GitHub Copilot 或 Cursor 在 MVP 中只通过 `agents` target 兼容使用，不生成专用 target id。

**前提** 某个 IDE target 支持映射
**当** adapter 完成 entry 写入或规划
**则** 系统会报告 mapped 状态
**并且** 记录 targetId、entryPath、activationTarget 和 canonicalSkillId。

**前提** 某个 IDE target 不支持当前 entry type 或 capability
**当** adapter 无法完成映射
**则** 系统会报告 unsupported 或 failed 状态
**并且** 状态语义遵守 adapter registry owning SPEC，不与 install planning 或 status summary 的状态词混用。

**前提** 同一 canonical skill 被映射到多个 IDE targets
**当** 系统生成 manifest/index 投影
**则** 不同 target 的 canonical skill package hash 必须一致
**并且** target-specific 差异只能出现在 adapter metadata、target directory 或 Post-MVP command pointer 扩展位中。

**前提** MVP 不支持 command pointer artifact
**当** adapter registry 声明 commandPointerBehavior
**则** 系统只允许记录 `none` 或 `unsupported` 语义
**并且** 不会生成 GitHub Copilot/Cursor 专用 command pointer artifact。

### Story 2.3: Skill Activation And Phase Capability Coverage（Skill 激活与阶段能力覆盖）

作为 AI IDE 使用者，
我希望从已映射的 IDE entry 中选择并激活 SpecLite skills，
以便按照 SPEC、方案评审、故事规划、实现、测试和审查等研发阶段推进工作。

**验收标准：**

**前提** `.claude/skills` 或 `.agents/skills` 中存在 mapped skill entry
**当** 用户在 AI IDE 中选择该 entry
**则** IDE 可以加载对应 self-contained skill package
**并且** 激活目标指向该 canonical skill 的 `SKILL.md` 或等价入口。

**前提** 用户需要执行 SPEC、方案评审、故事规划、实现、测试或审查阶段能力
**当** 系统生成或读取最小阶段覆盖矩阵
**则** 每个关键阶段都会显示是否存在 mapped skill entry
**并且** 对应 canonical skill id、moduleId、entryPath、activationTarget 和 target status 可被检查。

**前提** 某个关键阶段没有 mapped skill entry
**当** 用户或验证器查看阶段覆盖结果
**则** 系统会清晰表达该阶段未覆盖或 unsupported
**并且** 不会用 alias-only identity 或 IDE-specific identity 伪造覆盖。

**前提** 用户从 IDE entry 激活某个 skill
**当** skill 的激活协议开始执行
**则** skill 可以按照自身 `SKILL.md` activation protocol 继续运行
**并且** 不要求用户手工查找 source skill 文件或复制提示词内容。

**前提** 阶段覆盖矩阵被写入 manifest/index 或 command output
**当** 自动化或 validation 读取它
**则** 输出顺序遵守 manifest/adapter registry canonical target order
**并且** 字段值使用稳定、可比较的 project-relative POSIX path。

### Story 2.4: Runtime Config And Customization Resolve（Runtime Config 与 Customization Resolve）

作为 AI IDE 使用者，
我希望已激活的 SpecLite skill 能通过稳定命令读取项目配置和 customization 覆盖，
以便不同 IDE 中运行的同一 skill 使用一致的项目名称、语言、输出路径、persona 和 workflow 设置。

**验收标准：**

**前提** 已安装项目包含 `_speclite` 配置层
**当** 已激活 skill 调用 `speclite resolve config --project-root <project>`
**则** 命令会按 installer base、installer user、team custom、user custom 的顺序合并配置
**并且** stdout 只输出解析结果 JSON。

**前提** 已安装 skill 需要读取 workflow 或 agent customization
**当** skill 调用 `speclite resolve customization --skill <skill-dir> --project-root <project>`
**则** 命令会按 skill defaults、team custom、user custom 的顺序合并 customization
**并且** 使用 skill directory basename 作为 customization lookup key。

**前提** 用户请求一个不存在的 dotted key
**当** `speclite resolve` 执行成功
**则** 命令默认输出 `{}` 并返回 exit code 0
**并且** 不向 stderr 输出 issue，除非未来显式 strict missing flag 被引入。

**前提** 用户重复传入多个 `--key`
**当** `speclite resolve` 输出结果
**则** 输出对象使用原 dotted key 字符串作为字段名
**并且** 缺失 key 会被省略。

**前提** optional TOML layer 读取或解析失败
**当** resolver 继续合并其余配置层
**则** stderr 会输出 ValidationIssue 形状的 warning JSON diagnostic
**并且** 命令在没有 error 或 critical diagnostics 时仍返回 exit code 0。

**前提** required TOML layer 读取或解析失败
**当** resolver 无法继续安全解析
**则** 命令返回非 0 exit code
**并且** stdout/stderr shape 仍遵守 resolve-command owning SPEC。

**前提** customization 包含数组字段
**当** resolver 合并数组
**则** 只有所有元素都是 table 且共享同一个 `code` 或同一个 `id` 时才 keyed merge
**并且** 命中同 key 时 override item 整项替换 base item，不做 item-level deep merge。

### Story 2.5: Workflow Artifact Output And Metadata Validation（Workflow Artifact 输出与 Metadata 校验）

作为 AI IDE 使用者，
我希望已激活的 workflow 能把产物写入配置约定的位置，并记录稳定 metadata，
以便团队可以追踪每个产物来自哪个 workflow、哪个 skill，以及是否满足 MVP artifact contract。

**验收标准：**

**前提** 已激活 workflow 读取到项目级输出路径配置
**当** workflow 生成 planning、implementation 或 review artifact
**则** artifact 会写入 `_speclite-output` 或配置约定的输出目录
**并且** 输出路径使用 project-relative POSIX-style path 记录。

**前提** workflow 写入 artifact
**当** artifact metadata 被生成
**则** metadata 至少包含非空稳定字符串 `workflowType`
**并且** 至少包含非空 canonical skill id 形式的 `sourceSkill`。

**前提** artifact metadata 包含 `generatedAt`
**当** validator 或 fixture comparison 读取该字段
**则** `generatedAt` 必须是 ISO 8601 string
**并且** 默认排除出 stable fixture snapshot comparison。

**前提** workflow artifact 已存在
**当** 新 workflow 产物准备写入
**则** 系统不得被 installer/update 逻辑静默覆盖 workflow-owned artifact
**并且** artifact 写入行为必须遵守该 workflow 自己的输出策略。

**前提** validate 检查 artifact contract
**当** artifact metadata 缺失或值域不合法
**则** 系统会报告 artifact-path 或相关 validation issue
**并且** 不把产物叙事质量、人工评审结论或内容完整度作为 MVP validation 范围。

**前提** artifact contract 被写入 manifest/index 或 discovery metadata
**当** 后续 skill、validator 或自动化读取它
**则** artifact type、默认输出路径、workflowType、sourceSkill 和 generatedAt 语义保持一致
**并且** 不在 PRD、Architecture、Manifest/index 或 CommandResult 中各自定义第二套 artifact contract。

## Epic 3: Installed State And Deterministic Validation（已安装状态与确定性验证）

工具链维护者可以查看安装状态，并用本地 deterministic validation 诊断 manifest、IDE mirror、runtime path、menu target、legacy residue、artifact path、file integrity 和 JSON issue contract 问题。

### Story 3.1: Lightweight Install Status Summary（轻量安装状态摘要）

作为工具链维护者，
我希望运行 `speclite status` 时快速看到当前项目的 SpecLite 安装状态，
以便判断项目是否已配置、哪些 IDE targets 可用，以及下一步应运行安装、验证还是修复流程。

**验收标准：**

**前提** 用户在目标项目中运行 `speclite status`
**当** 项目尚未安装 SpecLite
**则** 命令返回成功状态并显示 `not-configured` high-level health
**并且** 下一步建议包含运行 `speclite install`。

**前提** 项目存在 SpecLite manifest 或安装状态
**当** status 读取本地安装摘要
**则** 输出包含 source/channel/version、manifest presence、manifest version、installed modules、IDE target summary 和关键路径
**并且** 不执行完整 file hash scan。

**前提** 已配置一个或多个 IDE targets
**当** status 生成 target coverage 摘要
**则** 每个 target 使用 `not-configured`、`configured`、`partial` 或 `failed` 状态表达 high-level 状态
**并且** partial 或 failed target 会提供原因摘要和 affected path。

**前提** status 命令运行
**当** 需要判断安装健康摘要
**则** `status.data.highLevelHealth` 与 `CommandResult.status` 不互相推导
**并且** 命令成功读取到 `not-configured`、`partial` 或 `failed` 安装状态时，`CommandResult.status` 仍可为 `success` 且 exit code 为 0。

**前提** 用户请求 `speclite status --json`
**当** 命令成功生成轻量摘要
**则** JSON 可以包含 `issues: []`
**并且** 空 issues 只表示本次轻量 status 命令无命令级 warning/error/critical issue，不表示安装健康通过。

**前提** status 命令执行
**当** 生成 lightweight summary
**则** 命令不得访问 npm registry、private registry、Git remote、offline bundle origin 或其他远程 source
**并且** 不得执行 remote freshness check、provenance revalidation、完整文件 hash scan 或隐式 update check。

### Story 3.2: Manifest And Index Schema Validation（Manifest 与索引 Schema 验证）

作为工具链维护者，
我希望运行 `speclite validate` 时能够验证 manifest、skill index、help index 和 files index 的结构与版本，
以便确认当前安装投影可被后续 status、validate、update 和 IDE adapter 稳定读取。

**验收标准：**

**前提** 项目中存在 `_speclite/_config/manifest.yaml`
**当** 用户运行 `speclite validate`
**则** 系统会验证 manifest schema version、必需字段和 installed-state 投影结构
**并且** 缺失或不兼容 schema 时报告 `manifest-schema` category issue。

**前提** manifest/index schema 版本旧于当前支持版本
**当** validate 判断需要迁移
**则** 系统会报告稳定 issue id `manifest-schema.migration-needed`
**并且** details 至少包含 `currentSchemaVersion`、`supportedSchemaVersion`、`migrationKind` 和 `manualActionRequired`。

**前提** skill index 存在
**当** validate 检查 skill index
**则** 系统会验证 canonical skill id、moduleId、source reference、target projection 和 hash 字段是否满足 manifest/index owning SPEC
**并且** 不允许 skill index 定义第二套 skill identity。

**前提** help index 存在
**当** validate 检查 help index
**则** 系统会验证 help entry 只引用 canonicalSkillId、phase、entry label 和 activation target
**并且** menu target 必须能在后续检查中解析到唯一 installed self-contained skill entry。

**前提** files index 存在
**当** validate 检查 files index
**则** 系统会验证 ownership、file-level hash、executable intent 和 project-relative POSIX path 字段
**并且** line ending、executable bit、file mode、symlink handling 和 case conflict 作为独立 validation dimensions，不被 hash normalization 隐式吸收。

**前提** manifest、skill index、help index 或 files index 缺失
**当** validate 生成诊断结果
**则** 系统会报告稳定 issue id、category、severity 和 affected path
**并且** 不使用自由文本 issue id 表达 schema 或 index 问题。

### Story 3.3: IDE Mirror And File Integrity Validation（IDE 镜像与文件完整性验证）

作为工具链维护者，
我希望 `speclite validate` 能检查 IDE mirrors 与 installed manifest/hash baseline 是否一致，
以便发现 `.claude/skills`、`.agents/skills` 或 installer-owned 文件发生的 drift，并获得稳定、可复现的诊断结果。

**验收标准：**

**前提** manifest 记录了 canonical skill package hash
**当** validate 检查 `.claude/skills` 中的 mapped skill entry
**则** 系统会验证该 entry 的 canonical skill package 内容是否匹配 manifest baseline
**并且** mismatch 时报告 `ide-mirror` 或 `file-integrity` category issue。

**前提** manifest 记录了 canonical skill package hash
**当** validate 检查 `.agents/skills` 中的 mapped skill entry
**则** 系统会验证该 entry 与同一 canonical skill 在其他 target 中的 package hash 是否一致
**并且** 不因 target directory 不同而允许 canonical package 内容漂移。

**前提** files index 记录了 installer-owned 文件的 file-level hash
**当** validate 检查已安装文件
**则** 系统会基于 raw bytes 计算当前 hash
**并且** 将 mismatch 报告为稳定的 `file-integrity` issue。

**前提** validate 发现 IDE mirror drift
**当** 命令输出诊断结果
**则** issue 包含稳定 issue id、category、severity 和 affected path
**并且** validate 不会自动修复或重写 drift 文件。

**前提** validate 检查 target mirrors
**当** 某个 expected skill entry 缺失或额外 entry 与 canonical skill id 重叠
**则** 系统会报告 missing、mismatched 或 drift 诊断
**并且** 建议用户运行后续明确的 update/repair 路径，而不是静默覆盖。

**前提** 同一安装状态连续运行 `speclite validate` 三次
**当** IDE mirrors 和 files index 未发生变化
**则** 返回的 issue id、category、severity 和 affected path 集合保持一致
**并且** 输出不依赖 filesystem traversal order。

### Story 3.4: Runtime Path, Menu Target, Legacy Entry And Artifact Path Validation（运行时路径、菜单目标、遗留入口与产物路径验证）

作为工具链维护者，
我希望 `speclite validate` 能检查 runtime path、menu target、legacy namespace residue、遗留入口冲突和 artifact path，
以便快速定位安装漂移、重复加载、菜单冲突或产物路径不可用的问题。

**验收标准：**

**前提** manifest 或 installed skill entry 记录了 runtime path
**当** validate 检查 runtime path
**则** 系统会确认路径指向当前 `_speclite` runtime namespace
**并且** 发现旧 runtime path 或错误 namespace 时报告 `runtime-path` category issue。

**前提** help index 或 menu metadata 中存在 menu target
**当** validate 解析该 menu target
**则** 每个 target 必须解析到唯一 installed self-contained skill entry
**并且** 缺失、重复或不可激活 target 会报告 `menu-target` category issue。

**前提** 项目中存在旧版或遗留 AI IDE entry
**当** validate 检测到它与当前 canonical skill id 或 IDE target 重叠
**则** 系统会报告 `legacy-namespace` category issue
**并且** issue 会说明重复加载、菜单冲突或能力漂移风险。

**前提** validate 报告 legacy entry 问题
**当** 生成 suggested next step
**则** 系统会提供 path、risk category、manual action 和 verification command
**并且** 不会在未确认的情况下删除用户目录中的文件。

**前提** manifest 或 discovery metadata 记录 artifact contract
**当** validate 检查 artifact path
**则** 系统会确认默认输出路径可解析为 project-relative POSIX path
**并且** 缺失、越界或不可写路径会报告 `artifact-path` category issue。

**前提** validate 检查 legacy、runtime、menu 和 artifact path 问题
**当** 输出诊断结果
**则** affected path 不泄露无关 absolute local path、home directory、环境变量或认证信息
**并且** 必须使用稳定 issue id、category、severity 和 suggested next step。

### Story 3.5: CommandResult And ValidationIssue JSON Contract（CommandResult 与 ValidationIssue JSON 契约）

作为工具链维护者，
我希望核心命令的人类可读输出、`--json` 输出、exit code 和 fixture assertions 使用同一套 `CommandResult` 与 `ValidationIssue` 语义，
以便自动化、CI 和人工排查看到一致、稳定、可测试的结果。

**验收标准：**

**前提** 用户运行 MVP 核心命令并传入 `--json`
**当** 命令生成机器可读输出
**则** 输出必须使用统一 `CommandResult` envelope
**并且** `issues` 必须复用同一 `ValidationIssue` model。

**前提** 命令产生 error 或 critical issue
**当** 系统推导 command status 与 exit code
**则** `CommandResult.status` 不得为 `success`
**并且** exit code 必须为非 0。

**前提** 命令只产生 success 或 warning 状态
**当** 系统推导 exit code
**则** exit code 必须为 0
**并且** warning issue 不得阻断命令成功返回。

**前提** 同一检查结果需要同时输出 human-readable 和 `--json`
**当** reporter 渲染结果
**则** issue id、category、severity 和 affected path 必须一致
**并且** human-readable output 不得成为自动化依赖的唯一承载位置。

**前提** `CommandResult.command` 被写入 JSON
**当** 用户使用不同 shell、参数顺序或命令别名
**则** command id 仍保持稳定
**并且** `update --repair` 的 command id 必须为 `update.repair`。

**前提** `CommandResult.targetProject` 被写入 JSON
**当** 同一项目在不同 checkout root 下运行命令
**则** targetProject 使用稳定显示标识
**并且** 不通过 slugify、字符集限制或长度改写改变该标识。

**前提** `ValidationIssue.details`、impact 或 suggestedNextStep 被写入 JSON
**当** fixture snapshot 比较输出
**则** 这些字段必须稳定可比较
**并且** 不包含 absolute path、home directory、环境变量、认证信息、stack trace、timestamp、随机 id、hash 或长段非确定性解释。

### Story 3.6: Validation Progress, Category Coverage And Local Determinism（验证进度、类别覆盖与本地确定性）

作为工具链维护者，
我希望 `speclite validate` 按稳定顺序展示检查进度、覆盖类别、目标和路径，
以便验证结果可以被人读懂，也可以被 fixture、CI 和自动化脚本稳定比较。

**验收标准：**

**前提** 用户运行 `speclite validate`
**当** validate 开始执行检查
**则** 系统会按 canonical issue category order 处理并报告 checkedCategories
**并且** 顺序为 `manifest-schema`、`source-integrity`、`ide-mirror`、`runtime-path`、`menu-target`、`legacy-namespace`、`artifact-path`、`file-integrity`、`operation-lock`、`update`。

**前提** validate 只执行部分类别
**当** 输出 checkedCategories
**则** 已执行类别仍保留 canonical relative order
**并且** 不使用文件系统遍历、规则注册或对象 key 顺序作为输出顺序。

**前提** validate 输出 issueCounts
**当** 某个 severity 没有 issue
**则** `validate.data.issueCounts` 仍固定包含 `info`、`warning`、`error` 和 `critical` 四个 key
**并且** 计数为 0 的 severity 不得省略。

**前提** validate 输出 checkedTargets
**当** 已安装多个 IDE targets
**则** target 顺序必须遵守 manifest/adapter registry canonical target order
**并且** 不依赖 glob、文件系统、平台返回或 adapter 完成顺序。

**前提** validate 输出 validatedPaths
**当** 路径集合生成完成
**则** 每个路径先规范化为 project-relative POSIX path
**并且** 再按字典序输出。

**前提** validate 输出 CommandResult.issues
**当** 多个 issue 同时存在
**则** issues 必须按 severity order、canonical issue category order、normalized affected path、issue id 排序
**并且** 不按发现顺序、rule execution order 或异步完成顺序输出。

**前提** 同一安装状态连续运行 `speclite validate`
**当** source、manifest、IDE mirrors 和 artifacts 未发生变化
**则** 除明确允许的 timestamp 字段外，JSON 语义内容保持一致
**并且** validate 不访问远程 source、不执行 remote freshness check 或 provenance revalidation。

## Epic 4: Safe Update And Repair（安全更新与修复）

项目维护者可以安全更新 installer-owned 文件，在写入前获得 plan、ownership/hash 判断、operation lock 和 conflict 可见性，同时保护 human-owned custom 与 workflow-owned artifacts，并通过 `update --repair` 显式修复可恢复 drift。

### Story 4.1: Ownership Model And Protected File Boundaries（所有权模型与受保护文件边界）

作为项目维护者，
我希望 SpecLite 明确区分 installer-owned、human-owned 和 workflow-owned 文件，
以便 update 和 repair 可以安全修改工具生成内容，同时保护人工配置和研发过程产物。

**验收标准：**

**前提** SpecLite 安装生成文件清单
**当** 系统记录 installed state
**则** 每个受管理文件会被标记为 installer-owned、human-owned 或 workflow-owned
**并且** ownership 信息可被 update、repair 和 validate 读取。

**前提** 文件位于 `_speclite/config.toml` 或 `_speclite/config.user.toml`
**当** 系统判断 ownership
**则** 这些 installer 初始化配置文件可被标记为 installer-owned 或 installer-managed 配置层
**并且** 后续 update 必须按 manifest/hash 与配置契约判断是否可安全修改。

**前提** 文件位于 `_speclite/custom/*.toml` 或 `_speclite/custom/*.user.toml`
**当** 系统判断 ownership
**则** 这些文件默认视为 human-owned
**并且** install/update/repair 不得覆盖、重写、重排或格式化已存在文件。

**前提** fresh install 发现 human-owned TOML stub 不存在
**当** 系统需要初始化 custom 层入口
**则** 可以按 create-if-absent 规则创建 stub
**并且** 如果目标文件已存在，则不得修改其内容、顺序或注释。

**前提** 文件位于 `_speclite-output` 或配置约定的 workflow artifact 目录
**当** 系统判断 ownership
**则** workflow 产物默认视为 workflow-owned
**并且** update/repair 不得将其纳入覆盖或重写计划。

**前提** validate 或 update 发现 ownership 缺失或冲突
**当** 系统生成诊断结果
**则** issue 会包含稳定 issue id、category、severity 和 affected path
**并且** suggested next step 不会建议用户删除或覆盖 human-owned/workflow-owned 文件作为默认修复方式。

### Story 4.2: Config And Customization Merge Order For Updates（更新中的配置与定制化合并顺序）

作为项目维护者，
我希望 update 和 repair 在规划前使用统一 resolver 读取项目配置和 customization 覆盖，
以便更新行为尊重团队/个人配置，并且不会破坏 human-owned TOML 文件。

**验收标准：**

**前提** update 或 repair 需要读取项目配置
**当** 系统解析 config
**则** 必须按 `_speclite/config.toml`、`_speclite/config.user.toml`、`_speclite/custom/config.toml`、`_speclite/custom/config.user.toml` 的顺序合并
**并且** custom 层覆盖 installer user 层。

**前提** update 或 repair 需要读取 skill customization
**当** 系统解析 customization
**则** 必须按 skill `customize.toml` defaults、`_speclite/custom/{skill}.toml`、`_speclite/custom/{skill}.user.toml` 的顺序合并
**并且** 使用 skill directory basename 作为 customization lookup key。

**前提** human-owned TOML 文件存在
**当** update 或 repair 完成 resolver 读取
**则** 系统只能读取并保护这些文件
**并且** 不得覆盖、重写、重排、格式化或删除它们。

**前提** optional custom layer 缺失
**当** resolver 合并配置或 customization
**则** 缺失 layer 被视为 `{}` 并继续
**并且** 不产生阻断性 error。

**前提** optional custom layer 存在但无法读取或解析
**当** update 或 repair 需要继续规划
**则** 系统会输出 ValidationIssue 形状 warning diagnostic
**并且** 在没有 error 或 critical diagnostics 时仍可继续进入保守规划。

**前提** resolver 行为发生变更
**当** 更新 config/customization 解析实现
**则** 必须同步 resolve parity fixture、owning SPEC 和 expected outputs
**并且** update/repair 不得实现第二套私有 merge logic。

### Story 4.3: Update Plan Before Write（写入前更新计划）

作为项目维护者，
我希望 `speclite update` 在修改任何文件前先生成明确的 update plan，
以便看到哪些文件将被修改、跳过或标记冲突，并在授权前确认影响范围。

**验收标准：**

**前提** 用户运行 `speclite update`
**当** 系统开始更新流程
**则** 系统会先读取 installed state、source descriptor、files index、ownership 信息和 resolved config
**并且** 在生成 update plan 前不修改项目文件。

**前提** update plan 生成中
**当** 系统比较 expected state 与 current installed state
**则** plan 会列出 planned effects、affected paths、ownership、current hash、expected hash 和 proposed action
**并且** 路径使用 project-relative POSIX path。

**前提** 某个 installer-owned 文件未发生本地 drift 且 source 有更新
**当** 系统生成 update plan
**则** 该文件可被标记为 planned change
**并且** 只有获得明确写入授权后才允许进入写入阶段。

**前提** 某个文件无法确认安全更新
**当** 系统生成 update plan
**则** 该文件会进入 skipped 或 conflicts 集合
**并且** 原文件在本次命令中保持不变。

**前提** 用户以交互模式运行 update
**当** plan 已生成但用户尚未确认
**则** 系统会展示 impact summary、changed/skipped/conflict paths 的预期结果
**并且** 不会把未授权的 planned action 改写成 `skip:not-authorized`。

**前提** 用户以脚本模式运行 update 且未传入 `--yes`
**当** plan 需要写入授权
**则** 命令保持 unapplied plan 状态
**并且** 不写入 installer-owned 文件。

**前提** 用户请求 `update --json` 输出
**当** plan 生成完成
**则** machine-readable data 会区分 planned effects、actual apply results、skipped paths 和 conflicts
**并且** 不把逐路径 conflicts 复制成多个 command-level issues。

### Story 4.4: Project Operation Lock And Safe Write（项目操作锁与安全写入）

作为项目维护者，
我希望所有会写入项目的 SpecLite 命令都使用 project operation lock 和 safe write，
以便避免并发更新、路径逃逸、符号链接逃逸或部分写入破坏项目状态。

**验收标准：**

**前提** write-capable command 准备进入写入阶段
**当** 系统尝试获取项目锁
**则** 必须创建或获取 `_speclite/.lock` project operation lock
**并且** 未获取锁时不得写入任何文件。

**前提** `_speclite/.lock` 已被其他操作持有
**当** 当前命令无法安全获取锁
**则** 命令返回 failure 且非 0 exit code
**并且** 输出 `operation-lock.project-locked` command-level issue。

**前提** validate 发现 stale lock
**当** stale lock 不阻断当前只读验证
**则** validate 可以输出 `operation-lock.stale-lock` warning
**并且** 不得自动删除 lock file。

**前提** installer-owned 文件准备写入
**当** 系统执行 safe write
**则** 必须使用 temp-write + rename 或等价安全写入策略
**并且** safe-write temporary files 不进入 files index。

**前提** 目标路径存在 symlink escape、path escape、case conflict 或 unsafe overwrite 风险
**当** 系统规划或执行写入
**则** 写入必须被阻断
**并且** 输出稳定 issue 或 conflict reason。

**前提** 写入过程中发生 partial failure
**当** 命令生成结果
**则** 输出 completed steps、failed step、pending steps、changed paths 和 manual action
**并且** 不声称未完成的文件已成功更新。

**前提** lock file shape 被记录或诊断
**当** 输出 public JSON 或 fixture snapshot
**则** 不暴露不稳定的 createdAt、pid 或 checkout-specific absolute path
**并且** lock file 不进入 files index 或 stable files-index hash。

### Story 4.5: Conflict Detection And Default Non-Overwrite Behavior（冲突检测与默认不覆盖行为）

作为项目维护者，
我希望普通 `speclite update` 在发现本地 drift 或不确定安全性的文件时默认标记 conflict，
以便避免静默覆盖用户修改、IDE mirror drift 或其它已安装状态异常。

**验收标准：**

**前提** installer-owned 文件的 current hash 与 files index baseline 不一致
**当** 用户运行普通 `speclite update`
**则** 系统会将该路径标记为 conflict
**并且** 不会静默覆盖当前文件内容。

**前提** IDE mirror 中的 canonical skill package 与 manifest baseline 不一致
**当** 普通 update 生成计划
**则** 系统会报告 IDE mirror drift conflict
**并且** 不会直接恢复 canonical 内容。

**前提** human-owned custom 文件存在本地内容
**当** update 检查该路径
**则** 系统不会把它加入 overwrite plan
**并且** 不会因为 source 有更新而修改、重排或格式化该文件。

**前提** workflow-owned artifact 存在
**当** update 检查 artifact path
**则** 系统不会覆盖或删除该产物
**并且** artifact path 不进入 installer-owned changed paths。

**前提** update 发现一个或多个 conflicts
**当** 生成 command-level issue
**则** 使用 `update.conflicts` 作为 command-level planning blocker
**并且** 逐路径冲突只放入 `data.conflicts`，不得复制成多个 issues。

**前提** update 输出 conflict summary
**当** 用户查看 human-readable 或 `--json` 结果
**则** 每个 conflict 包含 affected path、ownership、reason code 和 suggested next step
**并且** suggested next step 指向明确的 repair、manual action 或验证命令。

**前提** 相同 drift 状态下重复运行 update planning
**当** files、manifest 和 source 未变化
**则** conflicts 的 affected path、reason code 和 action 集合保持稳定
**并且** 不依赖 filesystem traversal order。

### Story 4.6: Explicit Repair For Recoverable Installer-Owned Drift（可恢复 Installer-Owned Drift 的显式修复）

作为项目维护者，
我希望通过 `speclite update --repair` 显式修复可安全恢复的 installer-owned drift，
以便恢复 `_speclite` metadata、runtime scripts 或 IDE mirrors 的 canonical 状态，同时继续保护人工配置和 workflow 产物。

**验收标准：**

**前提** 用户运行 `speclite update --repair`
**当** 系统进入 repair planning
**则** 只评估 installer-owned drift 是否可安全恢复或重建
**并且** human-owned custom 文件与 workflow-owned artifacts 始终排除在 repair overwrite 范围外。

**前提** drift 文件可以从 resolved canonical source 或 installed canonical package baseline 恢复
**当** 系统生成 repair plan
**则** 该路径可被标记为 `restore-canonical` 或 `regenerate` action
**并且** plan 会列出 affected path、ownership、current hash、expected hash 和 action。

**前提** 缺少 resolved canonical source 或 installed canonical package baseline
**当** repair 无法证明可安全恢复
**则** 该路径进入 conflict
**并且** reason code 为 `missing-source-evidence` 或 owning SPEC 定义的等价稳定值。

**前提** 用户以脚本模式运行 `update --repair` 且未传入 `--yes`
**当** repair plan 需要写入授权
**则** 命令输出 unapplied repair plan
**并且** 不写入任何文件。

**前提** 用户确认 repair plan 或传入 `--yes`
**当** 系统执行 repair 写入
**则** 只修改 repair plan 中获授权的 installer-owned paths
**并且** 使用 project operation lock 与 safe write。

**前提** repair 完成
**当** 系统生成结果
**则** 输出 changed paths、skipped paths、remaining conflicts 和 suggested validation command
**并且** 不生成 standalone report artifact、backup/restore 或顶级 `speclite repair` 命令。

**前提** 相同 drift 状态下重复生成 repair plan
**当** source evidence、manifest 和 files index 未变化
**则** affected path、hash、reason code 和 action 集合保持稳定
**并且** 可被 fixture 验证。

## Epic 5: Source Integrity And Distribution Channels（来源完整性与分发渠道）

项目维护者可以从 npm public/private registry、local tarball、offline bundle、Git source 或 local path 安装 SpecLite，并获得可诊断的 source descriptor、integrity evidence、trust status、channel/version 和失败原因。

### Story 5.1: Source Selection And Channel Summary（来源选择与 Channel 摘要）

作为项目维护者，
我希望在安装过程中选择 SpecLite 的安装来源和 channel，
以便明确本次安装来自 npm registry、本地包、离线包、Git source 还是本地路径，并在写入前确认来源摘要。

**验收标准：**

**前提** 用户运行 `speclite install` 并进入来源选择阶段
**当** 系统展示可用来源选项
**则** 用户可以选择 npm public registry、private registry、local tarball、offline bundle、Git source 或 local path
**并且** 每种来源都以清晰的 source type 展示。

**前提** 用户选择默认来源
**当** 系统生成安装来源摘要
**则** 摘要会显示默认 channel、source type 和即将解析的 package 或 source 标识
**并且** 不会隐式访问未声明的远程 source。

**前提** 用户选择自定义来源
**当** 系统收集 source 输入
**则** 系统会记录 requested source、requested version 或 requested channel
**并且** 在解析前展示 external access intent 和需要确认的原因。

**前提** source resolution 完成
**当** 系统生成 install summary 或 `install --json` 输出
**则** 输出包含 source type、channel、requested version、resolved version 或可展示的 source label
**并且** 不泄露 credential-bearing URL、home directory 或本机 absolute source path。

**前提** 用户尚未确认来源摘要
**当** 系统准备进入 install planning
**则** 不得访问未确认的外部 source 或下载额外资源
**并且** 不得写入任何项目文件。

**前提** 来源选择或 channel 输入不合法
**当** 系统无法继续 source resolution
**则** 命令输出明确失败原因和建议下一步
**并且** 使用稳定 `source-integrity` issue category 或对应 command-level diagnostic。

### Story 5.2: Registry Source Resolution And Diagnostics（Registry 来源解析与诊断）

作为项目维护者，
我希望 SpecLite 能从 npm public registry 或 private registry 解析安装来源，
以便在标准环境或企业内网环境中获得可诊断、可记录、可验证的 registry source。

**验收标准：**

**前提** 用户选择 npm public registry source
**当** 系统执行 source resolution
**则** 系统会解析 package name、requested version 或 channel，并得到 resolved version
**并且** 记录 registry integrity 或 version-lock evidence。

**前提** 用户选择 private registry source
**当** 系统执行 source resolution
**则** 系统会使用用户显式配置的 registry/channel 信息
**并且** public output 中不得泄露 token、credential-bearing URL 或 private query string。

**前提** registry source 成功解析
**当** 系统生成 SourceDescriptor
**则** descriptor 会包含 source type、package、resolved version、integrity evidence 和 trust status
**并且** npm public/private registry source 不会因为来源类型本身自动成为 `trusted`。

**前提** registry integrity 或 expected lock match 验证成功
**当** 系统计算 trust status
**则** source 可以标记为 `trusted`
**并且** 信任结论必须来自 expected hash 或 lock match，而不是 registry 类型。

**前提** registry source 可解析但没有信任锚
**当** source 仍满足最小 integrity evidence 要求
**则** source 可以标记为 `unverified`
**并且** 只有在用户显式选择并确认该 source 后才能进入 install planning。

**前提** registry 不可达、认证失败或 package/version 不存在
**当** source resolution 失败
**则** 系统会报告稳定 `source-integrity` issue id，例如 registry unreachable 或 authentication required
**并且** credentials 与 credential-bearing URLs 必须 redacted。

**前提** validate 检查已安装 registry source descriptor
**当** 本地 manifest 中已有 source descriptor
**则** validate 只检查 descriptor 和 integrity evidence shape
**并且** 不重新访问 registry 或执行 remote freshness check。

### Story 5.3: Local Tarball, Offline Bundle And Local Path Integrity（本地包、离线包与本地路径完整性）

作为项目维护者，
我希望 SpecLite 能从 local tarball、offline bundle 或 local path 安装，并记录可复现的完整性证据，
以便在离线、受限网络或内部交付场景中安全验证安装来源。

**验收标准：**

**前提** 用户选择 local tarball source
**当** 系统执行 source resolution
**则** 系统会验证 tarball 可读取并记录包文件 artifact hash
**并且** public output 不泄露本机 absolute source path。

**前提** 用户选择 offline bundle source
**当** 系统执行 source resolution
**则** 系统会验证 bundle 可读取并记录 offline bundle artifact hash
**并且** 不在 public JSON、manifest/index 或 fixture snapshot 中暴露临时解包目录。

**前提** 用户选择 local path source
**当** 系统计算 local source snapshot hash
**则** hash 只覆盖 canonical source tree allowlist
**并且** 排除 `.git`、临时文件、`node_modules`、fixture output、本地 cache、build output 和 editor/OS metadata。

**前提** tarball 或 offline bundle 被解包用于安装规划
**当** 系统需要记录 expected installed state 输入
**则** 可以额外记录解包后的 canonical source tree hash
**并且** 不得与 artifact `contentHash` 混用或把 cache/extraction directory hash 当成 source evidence。

**前提** local tarball、offline bundle 或 local path source 缺少 integrity evidence
**当** source resolution 结束
**则** source 必须被标记为 `blocked`
**并且** 命令输出 `source-integrity` error 并阻止写入。

**前提** local tarball、offline bundle 或 local path source 有可复现 evidence 但没有 expected hash 或 lock match
**当** 系统计算 trust status
**则** source 可以标记为 `unverified`
**并且** 只有用户显式选择并确认后才能进入 install planning。

**前提** source staging 或临时解包过程中发生失败
**当** 命令输出诊断结果
**则** issue 使用稳定 `source-integrity` issue id，例如 tarball unreadable 或 offline bundle unreadable
**并且** cache path、temporary extraction path 和本机 absolute path 必须 redacted。

### Story 5.4: Git Source Pinning And Floating Source Rejection（Git 来源固定与浮动来源拒绝）

作为项目维护者，
我希望从 Git source 安装 SpecLite 时必须固定到具体 commit SHA，
以便安装结果可复现，并避免 branch、tag 或 remote URL 浮动导致不可审查的安装状态。

**验收标准：**

**前提** 用户选择 Git source
**当** 系统执行 source resolution
**则** 系统会解析 remote、requested ref 和 resolved commit SHA
**并且** 只有 resolved commit SHA 存在时才允许进入 install planning。

**前提** 用户只提供 remote URL、branch 或 tag
**当** 系统无法固定到具体 commit SHA
**则** source 必须被标记为 `blocked`
**并且** 不得进入 install planning 或写入步骤。

**前提** Git source 成功解析到 commit SHA
**当** 系统生成 integrity evidence
**则** evidence 至少包含 `git-commit` 记录
**并且** requested branch、tag 或输入 ref 不得覆盖 resolved version 或 commit evidence。

**前提** Git source 解析需要访问远程 source
**当** 系统准备执行 external access
**则** external access intent 必须在 source resolution plan 中显式声明
**并且** 用户未确认前不得访问未声明 remote。

**前提** Git remote 不可达、认证失败或 ref 无法解析
**当** source resolution 失败
**则** 系统会输出稳定 `source-integrity` issue
**并且** redacted output 不泄露 credential-bearing URL、token 或 private query string。

**前提** Git source 已写入 manifest 的 source descriptor
**当** 后续运行 `speclite validate`
**则** validate 只检查本地记录的 source descriptor、integrity evidence shape 和 hash baseline
**并且** 不访问 Git remote 或重新验证 freshness/provenance。

**前提** Git source 没有 expected hash 或 lock match
**当** resolved commit SHA evidence 可复现且无 mismatch
**则** source 可以是 `unverified`
**并且** 不得自动标记为 `trusted`。

### Story 5.5: SourceDescriptor Trust Status And Redacted Reporting（SourceDescriptor 信任状态与脱敏报告）

作为项目维护者，
我希望所有安装来源都被归一为稳定的 SourceDescriptor，并以脱敏方式报告 trust status 和 integrity evidence，
以便团队能审查安装来源是否可信，同时不会泄露凭据、本机路径或临时实现细节。

**验收标准：**

**前提** source resolution 成功
**当** 系统生成 SourceDescriptor
**则** descriptor 会包含 source type、channel、resolved version 或 display-safe source label、integrityEvidence 和 trustStatus
**并且** source/channel/version 信息可在 install summary、status 和 validate 中可见。

**前提** source 通过 expected hash 或 lock match 验证
**当** 系统计算 trustStatus
**则** trustStatus 可以是 `trusted`
**并且** MVP 不提供通用 trusted source allowlist schema。

**前提** source 缺少信任锚但具备可复现 integrity evidence
**当** 用户显式选择并确认该 source
**则** trustStatus 可以是 `unverified`
**并且** evidence 中的 `verified: false` 只表示未被 expected hash 或 lock match 背书，不表示校验失败。

**前提** source 存在 hash mismatch、lock mismatch、unsupported source 或 source policy 拒绝
**当** 系统计算 trustStatus
**则** trustStatus 必须是 `blocked`
**并且** install/update 不得继续写入步骤。

**前提** public JSON、manifest/index、issues 或 fixture snapshot 需要展示 source 信息
**当** 系统渲染 source descriptor 或 diagnostics
**则** credential、credential-bearing URL、private query string、home directory、本机 absolute source path、cache path、temporary extraction path 和临时 Git checkout path 必须 redacted
**并且** source staging 和 package-manager cache path 不进入 public contract。

**前提** validate 读取已安装 SourceDescriptor
**当** 检查 source integrity 状态
**则** validate 只检查本地 descriptor、integrity evidence shape 与 installed state 是否一致
**并且** 不重新访问远程 source 或执行 provenance revalidation。

**前提** source descriptor 字段语义需要被 PRD、Architecture、Manifest/index 或 CommandResult 引用
**当** 文档或实现描述该对象
**则** 必须引用 source-descriptor owning SPEC 作为字段与语义真源
**并且** 不在多个文件中定义第二套 trust/evidence 规则。

## Epic 6: Maintainer Fixture And Release Confidence（维护者 Fixture 与发布信心）

SpecLite 维护者可以用 fixture projects 和 expected outputs 验证 fresh install、existing update、IDE drift、source integrity、resolve parity、path portability 和 skill artifact loop，形成发布前可信证据。

### Story 6.1: Fixture Case Layout And Expected Output Contract（Fixture Case 布局与 Expected Output 契约）

作为 SpecLite 维护者，
我希望每个 fixture case 都有稳定的目录布局、输入数据和 expected outputs，
以便新增或修改安装能力时，可以用同一套契约测试资产验证行为是否仍然正确。

**验收标准：**

**前提** 维护者创建新的 fixture case
**当** fixture case 被加入测试资产
**则** case directory 使用稳定 lower-kebab 命名
**并且** layout 遵守 fixture contract owning SPEC。

**前提** fixture case 描述安装前后状态
**当** 维护者定义 expected outputs
**则** expected outputs 至少可以包含 expected file tree、expected manifest/index snapshot、expected command output 摘要和 validation assertions
**并且** 每类 expected output 的比较规则由 owning SPEC 管理。

**前提** fixture snapshot 包含路径字段
**当** 生成或比较 expected outputs
**则** 路径必须使用 project-relative POSIX-style path
**并且** 不依赖 absolute local path、home directory、OS-specific separators 或 checkout root。

**前提** fixture snapshot 包含 public JSON
**当** 进行 stable comparison
**则** 允许的 timestamp 字段必须由 schema 显式声明并排除比较
**并且** 未声明字段不得引入随机值、环境相关文本或不稳定顺序。

**前提** 契约行为发生变化
**当** 维护者需要更新 fixture expected outputs
**则** 必须先更新 owning SPEC 和 executable schema/parser
**并且** 不得先更新 snapshots 再反推契约行为。

**前提** 新增模块、adapter、source type、validation rule、ownership 行为或 installed artifact kind
**当** 维护者提交变更
**则** 必须同步新增或更新相关 fixture 输入和 expected outputs
**并且** release gate 或 regression asset 分类保持明确。

### Story 6.2: Fresh Install And Existing Update Fixture Gates（Fresh Install 与 Existing Update Fixture Gate）

作为 SpecLite 维护者，
我希望 fixture gates 覆盖空项目 fresh install 和既有安装 update，
以便证明安装控制面能生成正确结构，并在更新时保护 human-owned custom 文件和 workflow artifacts。

**验收标准：**

**前提** `fresh-install-empty-project` fixture
**当** 测试运行 fresh install
**则** expected outputs 验证 `_speclite`、`_speclite-output`、manifest/index、`.claude/skills` 和 `.agents/skills` 已按预期生成
**并且** ready summary 只在 basic validation 成功后出现。

**前提** fresh install fixture 完成
**当** 比较 expected file tree 和 manifest/index snapshot
**则** 生成结果在相同 source、配置、目标 IDE 和平台上保持确定性
**并且** 允许差异仅限 schema 明确排除的 timestamp 字段。

**前提** `existing-install-update` fixture
**当** 测试运行 update
**则** installer-owned 文件可以按 plan 更新
**并且** human-owned custom 文件保留不变。

**前提** `existing-install-update` fixture 中存在 workflow-owned artifacts
**当** update 执行
**则** workflow artifacts 不会被覆盖、删除或重排
**并且** fixture assertions 明确验证这些 artifacts 仍然存在且内容未被修改。

**前提** fixture 测试 update behavior
**当** installer-owned 文件存在本地 drift
**则** 普通 update 会产生 conflict 而不是静默覆盖
**并且** repair 行为由显式 `update --repair` fixture 或后续 fixture 覆盖。

**前提** fresh install 或 update fixture 失败
**当** 测试生成结果
**则** 不展示 ready summary 或 release-ready summary
**并且** failure 输出包含 completed steps、failed step、pending steps 和 suggested manual action。

### Story 6.3: Drift, Source Integrity And Resolve Parity Fixtures（Drift、来源完整性与 Resolve Parity Fixtures）

作为 SpecLite 维护者，
我希望 fixture suite 覆盖 IDE drift、source integrity 和 resolver parity，
以便验证安装漂移、来源信任和配置解析这些高风险路径在变更后仍然稳定。

**验收标准：**

**前提** `ide-drift` fixture
**当** 测试人为修改某个 IDE mirror 中的 canonical skill package 文件
**则** `speclite validate` 会报告稳定的 `ide-mirror` 或 `file-integrity` issue
**并且** expected output 包含 target、canonical skill id、hash mismatch 和 suggested next step。

**前提** `source-integrity` fixture
**当** 测试 registry、tarball、offline bundle、local source 或 Git source 的 integrity evidence
**则** expected outputs 覆盖 `trusted`、`unverified` 和 `blocked` trust status
**并且** blocked source 不得进入 install planning 或写入步骤。

**前提** `source-integrity` fixture 覆盖失败来源
**当** registry unreachable、authentication required、tarball unreadable 或 offline bundle unreadable 发生
**则** expected issues 使用稳定 `source-integrity` issue id
**并且** credentials、credential-bearing URLs、cache path 和临时路径被 redacted。

**前提** `resolve-parity` fixture
**当** 测试 `speclite resolve config`
**则** expected outputs 验证 config merge order、missing key、repeated key、required/optional layer failure 和 stdout/stderr shape
**并且** 与 Python resolver baseline 语义保持一致。

**前提** `resolve-parity` fixture
**当** 测试 `speclite resolve customization`
**则** expected outputs 验证 customization merge order、skill directory basename lookup key、array merge rules 和 optional layer warning diagnostics
**并且** 不允许 adapter 或 skill helper 实现第二套 merge logic。

**前提** validation issue taxonomy 或 resolve contract 发生变化
**当** 维护者更新 fixture expected outputs
**则** 必须同一变更中更新 owning SPEC、executable schema/parser 和 fixture assertions
**并且** 不得只改 snapshot 让测试通过。

### Story 6.4: Path Portability And Runtime Matrix Evidence（路径可移植性与运行时矩阵证据）

作为 SpecLite 维护者，
我希望 fixture gates 覆盖 Node 22/24、macOS/Windows 和关键路径可移植性场景，
以便证明 MVP 在声明支持的运行时与平台上可重复安装、验证和更新。

**验收标准：**

**前提** release gate fixture suite 运行
**当** CI 或本地验证执行 MVP fixture gates
**则** 必须覆盖 Node 22 minimum 和 Node 24 recommended runtime
**并且** 不得使用 Node 24-only API，除非提供 Node 22 兼容路径或更新 runtime policy。

**前提** path-portability fixture 运行在 macOS 13+ 和 Windows 11
**当** 执行 install、status、validate、update 或 resolve 相关路径
**则** public path fields 必须使用 project-relative POSIX-style path
**并且** fixture snapshot 不依赖 OS-specific separators、drive letter、home directory 或 checkout root。

**前提** fixture 覆盖 canonical source text files
**当** 安装器复制 canonical source 内容
**则** canonical text line endings 保持 LF
**并且** installer 不按平台改写 canonical text line endings。

**前提** fixture 覆盖 generated scripts 或 runtime scripts
**当** files index 记录脚本信息
**则** 必须记录 `executable` intent
**并且** Windows fixture 不要求 POSIX chmod 语义，但必须验证受支持脚本入口可用。

**前提** fixture 覆盖大小写敏感路径冲突
**当** install、update 或 repair 规划写入
**则** case conflict 必须被阻断并产生稳定 issue 或 conflict reason
**并且** 不允许同一项目在不同操作系统上产生不可比较安装结果。

**前提** fixture 覆盖 symlink escape 或 path escape
**当** safe write 或 validation 处理目标路径
**则** 写入必须被阻断或 validate 必须报告稳定 issue
**并且** 不得把项目外路径写入 public JSON、manifest/index 或 fixture snapshot。

**前提** fixture 覆盖 shell invocation 差异
**当** 命令在支持平台上执行
**则** command id、path normalization、exit code 和 JSON output 语义保持稳定
**并且** 不依赖 shell-specific path separators 或别名行为。

### Story 6.5: Skill Artifact Loop And Documentation Examples（Skill Artifact Loop 与文档示例）

作为 SpecLite 维护者，
我希望至少有一个阶段化 skill 从 IDE entry 发现、激活到输出 artifact 的闭环 fixture，
以便证明 SpecLite 安装后不只是文件存在，而是真正能驱动研发流程并产出可检查文档。

**验收标准：**

**前提** `skill-artifact-loop` fixture
**当** fixture 从 installed IDE entry 发现某个阶段化 skill
**则** entry 可以解析到 canonicalSkillId、activationTarget 和 installed skill package
**并且** 不需要手工查找 source skill 文件或复制提示词内容。

**前提** fixture 激活该 skill
**当** skill 按自身 activation protocol 执行
**则** skill 可以读取项目级 config 和 customization
**并且** 不依赖 Python resolver 或内部构建路径。

**前提** skill workflow 完成最小闭环
**当** workflow 写出 planning 或 review artifact
**则** artifact 位于配置约定路径
**并且** metadata 包含 `workflowType`、`sourceSkill` 和可选 `generatedAt`。

**前提** fixture validate artifact loop
**当** 检查生成 artifact
**则** 只校验 artifact type、默认输出路径和 metadata 值域
**并且** 不把叙事质量、人工评审结论或内容完整度作为 MVP validation 范围。

**前提** 文档读者查看安装示例
**当** 文档展示 fresh install、目录树、manifest/index、status/validate 输出或 update 保护示例
**则** 示例应引用或来自 fixture expected outputs
**并且** 不复制 schema 真源或定义第二套 contract。

**前提** 维护者新增阶段化 skill 或 artifact kind
**当** 更新 documentation examples
**则** 同步更新相关 fixture 输入、expected outputs 和 validation assertions
**并且** 保持 release gate / regression asset 分类明确。

## Epic 7: Post-MVP Governance Expansion（Post-MVP 治理扩展）

团队后续可以在不破坏 MVP 契约的前提下扩展 init/list/doctor/sync/uninstall、CI/企业自动化集成和规范落地覆盖报告。

### Story 7.1: Project Config Init And Listing Commands（项目配置初始化与列表命令）

作为项目维护者，
我希望 Post-MVP 提供 `speclite init` 和 `speclite list`，
以便在不重新安装全部内容的情况下初始化或重建项目配置，并查看可用模块、skills、IDE targets 或版本。

**验收标准：**

**前提** 项目需要初始化或重建 SpecLite 项目级配置
**当** 用户运行 Post-MVP `speclite init`
**则** 命令可以创建或重建项目级配置入口
**并且** 不得静默覆盖 human-owned custom 文件。

**前提** 项目已有 `_speclite` 安装状态
**当** 用户运行 `speclite init`
**则** 命令必须读取现有 manifest、config 和 ownership 信息
**并且** 在修改 installer-owned 配置前展示 plan 和影响范围。

**前提** 用户想查看可安装模块、skills、IDE targets 或版本
**当** 用户运行 Post-MVP `speclite list`
**则** 命令会从 manifest/index、source metadata 或 adapter registry 中读取可列信息
**并且** 不定义第二套 skill identity 或 IDE target identity。

**前提** `speclite list` 输出机器可读结果
**当** 用户传入 `--json`
**则** 输出复用 MVP `CommandResult` envelope 和已契约化 data payload 扩展机制
**并且** 不破坏 `speclite.command-result.v1` 的既有字段语义。

**前提** `speclite init` 或 `speclite list` 需要新增 public JSON 字段
**当** 实现该字段
**则** 必须先更新 owning SPEC、executable schema/parser 和 fixture expected outputs
**并且** 不依赖 human-readable output 承载自动化字段。

### Story 7.2: Doctor, Sync And Uninstall Commands（Doctor、Sync 与 Uninstall 命令）

作为工具链维护者，
我希望 Post-MVP 提供 `speclite doctor`、`speclite sync` 和 `speclite uninstall`，
以便进行更深入环境诊断、显式同步 source 与 IDE mirrors，并安全移除 installer-owned 安装结果。

**验收标准：**

**前提** 用户运行 Post-MVP `speclite doctor`
**当** 命令执行环境、source、权限、IDE target、manifest、路径规范化和文件完整性诊断
**则** 输出复用 `ValidationIssue` category、issue id、severity 和 affected path 语义
**并且** 不发明第二套诊断模型。

**前提** `doctor` 需要访问远程 source 或执行 freshness/provenance revalidation
**当** 命令规划外部访问
**则** external access intent 必须显式展示并等待授权
**并且** 不改变 MVP `validate` local-only 边界。

**前提** 用户运行 Post-MVP `speclite sync`
**当** 命令显式同步 source 与 IDE mirrors
**则** 同步行为必须复用 manifest/index、files index、ownership/hash 和 adapter registry
**并且** 不修改 human-owned custom 文件或 workflow-owned artifacts。

**前提** 用户运行 Post-MVP `speclite uninstall`
**当** 命令移除安装结果
**则** 只能移除 installer-owned 文件或目录
**并且** 对 human-owned custom 文件和 workflow-owned artifacts 必须保留或提示人工处理。

**前提** `doctor`、`sync` 或 `uninstall` 需要写入项目
**当** 命令进入写入阶段
**则** 必须使用 project operation lock、plan-before-write 和 safe write
**并且** 失败时输出 completed steps、failed step、pending steps 和 manual action。

**前提** Post-MVP 新命令输出 `--json`
**当** 机器可读结果被生成
**则** 复用 `CommandResult` 兼容扩展机制
**并且** 不破坏 MVP fixture 和既有 automation 依赖。

### Story 7.3: CI And Enterprise Automation Integration（CI 与企业自动化集成）

作为工具链维护者，
我希望把 MVP 的机器可读输出接入 CI 和企业自动化工具链，
以便团队可以自动检查安装健康、验证结果、更新冲突和发布门禁，而不依赖人工读取 CLI 文案。

**验收标准：**

**前提** CI 运行 `speclite status --json`
**当** 项目处于未安装、partial 或 failed high-level health 状态
**则** CI 可以读取 `status.data.highLevelHealth` 判断安装摘要
**并且** 不把 `issues: []` 误判为安装健康通过。

**前提** CI 运行 `speclite validate --json`
**当** validate 输出 issueCounts、checkedCategories、checkedTargets 和 validatedPaths
**则** 自动化可以基于稳定字段判断验证是否通过
**并且** 不依赖 human-readable output。

**前提** CI 运行 `speclite update --json` 或 `speclite update --repair --json`
**当** 命令输出 planned effects、changed paths、skipped paths 和 conflicts
**则** 自动化可以区分 unapplied plan、actual apply result 和 blocking conflicts
**并且** 不把 path-level conflicts 当成多个 command-level issues。

**前提** 企业工具链接入 SpecLite JSON output
**当** 需要解析 command status 和 exit code
**则** 必须遵守 MVP `CommandResult.status`、issue severity 和 exit code 推导规则
**并且** 不定义企业私有的第二套状态语义。

**前提** CI 或企业自动化需要新增字段
**当** 扩展 command-specific data payload
**则** 必须通过 `CommandResult.schemaVersion`、owning SPEC 和 fixture expected outputs 管理兼容性
**并且** 不破坏 `speclite.command-result.v1` 的既有字段语义。

**前提** 自动化记录路径或 source 信息
**当** 生成日志、报告或 artifacts
**则** 仍需遵守 project-relative POSIX path 与 redaction 策略
**并且** 不泄露 credentials、home directory、cache path 或 temporary extraction path。

### Story 7.4: Process Governance Coverage Report（流程治理覆盖报告）

作为企业规范负责人，
我希望 Post-MVP 能基于已安装状态、阶段覆盖矩阵、标准产物和 validate 结果生成流程治理覆盖报告，
以便判断 SpecLite 是否真正把 SPEC、方案评审、故事规划、实现、测试和审查规范落到团队执行过程中。

**验收标准：**

**前提** 项目已安装 SpecLite 并生成 MVP 最小阶段覆盖矩阵
**当** 系统生成 Post-MVP 流程治理覆盖报告
**则** 报告可以展示阶段入口覆盖率、标准产物存在率、validate 通过率和未解决缺口数量
**并且** 这些指标建立在 MVP manifest/index、phase coverage 和 validate output 之上。

**前提** 某个研发阶段缺少 mapped skill entry
**当** 报告计算阶段入口覆盖
**则** 该阶段被标记为缺口
**并且** 报告显示对应 phaseId、phaseLabel、moduleId、canonicalSkillId 或缺失原因。

**前提** 某个标准过程产物缺失或 metadata 不合法
**当** 报告计算标准产物存在率
**则** 报告引用 artifact contract、artifact path 和 validation issue
**并且** 不把文档内容质量或人工评审结论作为自动覆盖率指标。

**前提** 团队需要查看趋势、导出、多项目或团队视角
**当** Post-MVP 扩展报告能力
**则** 这些能力只能在 MVP 最小阶段覆盖矩阵与 validate output 的基础上扩展
**并且** 不改变 MVP install/status/validate/update 的核心契约。

**前提** 治理报告需要机器可读输出
**当** 输出 `--json` 或报告 artifact
**则** 必须复用 `CommandResult`、`ValidationIssue` 或明确新增的 owning SPEC
**并且** 不定义第二套 issue category、skill identity 或 artifact identity。

**前提** 报告暴露团队或项目路径信息
**当** 生成 human-readable 或 machine-readable output
**则** 路径和 source 信息遵守 project-relative POSIX path 与 redaction 策略
**并且** 不泄露 credentials、home directory、cache path 或 temporary extraction path。
