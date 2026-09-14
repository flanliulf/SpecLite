# Epic 1: Project Installation Onboarding Glossary（项目安装引导术语表）

本文解释 Epic 1「Project Installation Onboarding」中反复出现的英文组合术语，帮助项目维护者理解从 CLI 启动、目标目录确认、模块与配置选择，到 runtime、IDE mirror 和 Ready Summary 生成的完整安装链路。

> Note: 本文解释的是 Epic 1 规划文档中的术语语义，不表示相应 Story 已经实施或通过验证。命令、字段、路径、schema 和 issue id 保留英文。

## Installation Flow（安装流程）

| Term | 中文直译 | Definition |
|---|---|---|
| **Project Installation Onboarding** | 项目安装引导 | 引导维护者完成安装环境检查、目标项目选择、模块与配置确认、文件写入和就绪验证的端到端流程。 |
| **fresh install** | 全新安装 | 目标项目没有既有 SpecLite 安装状态时进行的首次安装。它可以使用当前默认配置，但仍须在写入前完成确认和安全检查。 |
| **install command context** | 安装命令上下文 | `speclite install` 在通过环境守卫后建立的执行上下文，保存本次安装所需的 target、source、选择和阶段状态，但本身不代表已经写入文件。 |
| **install stage** | 安装阶段 | 安装链路中职责单一的阶段，例如 source discovery、module selection、config initialization、runtime structure creation 和 manifest generation。 |
| **install scope** | 安装范围 | 本次安装实际选择的 module、capability、IDE target 和 canonical package root 集合。 |
| **install summary** | 安装摘要 | 写入前展示 source、module、version、配置和 target 的范围摘要，供用户确认安装内容。 |
| **planned write** | 计划写入 | 已进入安装计划、但尚未获得执行授权的文件或目录变更。 |
| **final pre-write review** | 最终预写审查 | 任何项目文件写入前的最终审阅，明确展示 target、source、config mode、modules、IDE targets、planned writes 和 pending phases。 |
| **write authorization** | 写入授权 | 用户确认或 `--yes` 对无冲突计划写入给予的明确授权。缺少授权时，安装只能停留在计划状态。 |

## CLI And Environment Guards（CLI 与环境守卫）

| Term | 中文直译 | Definition |
|---|---|---|
| **CLI install entry** | 命令行安装入口 | `speclite install` 的命令入口，负责接收参数、初始化命令上下文并按约定顺序调度安装阶段。 |
| **runtime guard** | 运行时防护 | 在修改项目文件前检查 Node.js 等运行时是否满足最低要求的保护逻辑。 |
| **platform guard** | 平台防护 | 在修改项目文件前判断当前操作系统或执行平台是否支持 MVP 安装路径的保护逻辑。 |
| **runtime baseline** | 运行时基线 | CLI、`package.json engines.node`、fixture matrix 和 diagnostics 共同遵守的最低运行时版本约定。 |
| **unsupported Node** | 不支持的Node | 检测到的 Node.js 版本不在支持范围内的状态，对应稳定 diagnostic `environment.unsupported-node`。 |
| **unsupported platform** | 不支持的平台 | 当前平台不支持安装路径的状态，对应稳定 diagnostic `environment.unsupported-platform`。 |
| **ESM package** | ESM包 | 使用 ECMAScript Modules 组织和发布的 Node.js package，是 Epic 1 CLI scaffold 的模块格式基础。 |
| **command layer** | 命令层 | 基于 `commander` 等命令框架解析命令、flags 和选项，并调用内部 service 的薄调度层。 |
| **CLI scaffold** | 命令行框架 | 建立 package、build、local execution、test 和 binary entry 的最小可运行骨架。 |
| **executable contract anchor** | 可执行契约锚点 | 由 schema、parser 或 registry 代码承载并可被测试的契约真源，例如 `command-result-schema.ts`；调用方不能绕过它手写第二套逻辑。 |
| **failure envelope** | 失败封装 | 命令失败时仍保持稳定字段和层级的 `CommandResult` 外层结构，使 CLI、fixture 和 automation 读取同一形状。 |
| **smoke test** | 冒烟测试 | 快速验证命令入口、contract anchor 和基本 guard 能否工作的小范围测试。 |

## Target And Existing State（目标与既有状态）

| Term | 中文直译 | Definition |
|---|---|---|
| **target project** | 目标项目 | 用户希望安装 SpecLite 的项目；所有路径解析、边界检查和 public path 都以它为基准。 |
| **target directory resolution** | 目标目录解析 | 将当前工作目录、命令参数或交互输入规范化为最终目标项目路径的过程。 |
| **project-relative POSIX-style path** | 项目相对POSIX路径 | 相对于 target project、使用 `/` 分隔符的稳定路径表示，避免 public output 泄露机器相关 absolute path。 |
| **directory state** | 目录状态 | 目标目录不存在、为空、非空或已经安装 SpecLite 等写入前状态。 |
| **existing install detection** | 既有安装检测 | 通过 `_speclite`、manifest/index 等本地证据判断目标目录是否已经安装 SpecLite。 |
| **existing-install state** | 既有安装状态 | 检测到既有 runtime、manifest、IDE target 或其他安装投影时报告的状态；用户应转向 status、validate 或 update，而不是重新当作 fresh install。 |
| **project boundary** | 项目边界 | 允许安装流程解析和写入的目标项目范围。Path escape、symlink escape 或越界路径必须被阻断。 |

## Source And Module Selection（来源与模块选择）

| Term | 中文直译 | Definition |
|---|---|---|
| **official module** | 官方模块 | SpecLite 正式分发 source tree 中可被安装的 module，例如 `core` 或 `sdlc`。 |
| **capability package** | 能力包 | 将一组相关 Skill 或能力作为可选择安装单位表达的 package。 |
| **bundled source** | 内置来源 | 随 npm package 一同分发的默认官方来源，`sourceType` 为 `bundled`，canonical tree 位于 `assets/source/speclite/`。 |
| **SourceDescriptor** | 来源描述符 | 描述安装来源类型、版本、channel、integrity evidence 和 trust status 的结构化对象。 |
| **source discovery** | 来源发现 | 在写入前定位并验证可供本次安装使用的 canonical source tree。 |
| **canonical package root** | 规范包根目录 | Canonical source 中包含 `SKILL.md`、可作为完整 Skill package 安装的目录根。 |
| **canonical package root count** | 规范包根目录计数 | 某个 module 中本次将安装的完整 canonical package 数量，用于让用户核对安装范围。 |
| **selected module** | 选定模块 | 用户或默认策略明确纳入本次安装计划的 module。只有具有所需 package evidence 的 module 才能进入 ReadyCheck。 |
| **pending module state** | 待处理模块状态 | 写入前已经选择但尚未成为 installed state 的 module 状态，应通过步骤、issue 和 human summary 表达，而不是伪装成 `installedModules`。 |

## Configuration Initialization（配置初始化）

| Term | 中文直译 | Definition |
|---|---|---|
| **quick config** | 快速配置 | 只收集项目名称、称呼、语言和输出目录等最小输入，并为其余项目使用可确认默认值的配置模式。 |
| **detailed config** | 详细配置 | 允许用户显式选择语言、artifact path、module 和 IDE target 等完整选项的配置模式。 |
| **config mode** | 配置模式 | 本次安装采用 quick config 还是 detailed config 的选择。 |
| **project-level config** | 项目级配置 | 对整个项目生效的 `_speclite/config.toml`、`config.user.toml` 及其 custom overrides。 |
| **installer-owned initialization plan** | Installer 所有的初始化计划 | Installer 计划创建或管理的配置文件集合；实际写入仍受授权、ownership 和 existing state 约束。 |
| **create-if-absent** | 若不存在则创建 | 只有目标文件不存在时才创建 stub；如果文件已经存在，则不修改其内容、顺序或注释。 |
| **human-owned project-level stub** | 人工所有的项目级存根 | 为团队或个人 customization 预留的最小 TOML 文件，由人维护，installer 后续不得覆盖或格式化。 |
| **skill-specific customization** | 技能特定定制 | 以 Skill directory basename 为 key 的 `{skill}.toml` 或 `{skill}.user.toml` 覆盖；fresh install 不为每个 Skill 自动创建。 |
| **config summary** | 配置摘要 | 写入配置前展示的最终项目名称、语言、输出路径、module 和 IDE target 选择。 |

## Runtime And IDE Projection（Runtime 与 IDE 投影）

| Term | 中文直译 | Definition |
|---|---|---|
| **runtime structure** | 运行时结构 | 安装在 target project 中、支持配置解析、帮助发现和 Skill 执行的 `_speclite` 文件体系。 |
| **metadata/control hub** | 元数据/控制中枢 | `_speclite` 的职责描述：它承载安装元数据、配置和控制文件，不是 Workflow artifact repository。 |
| **artifact repository** | 产物仓库 | `_speclite-output` 或配置指定的过程产物空间，由 Workflow 和项目维护者管理。 |
| **IDE target** | IDE目标 | SpecLite 支持投影 Skill 的 AI IDE 类型，例如 `claude` 或 `agents`。 |
| **IDE execution mirror** | IDE执行镜像 | 位于 `.claude/skills` 或 `.agents/skills` 的已安装 Skill package 副本，供对应 AI IDE 直接加载执行。 |
| **canonical identity** | 规范标识 | Skill 在所有 IDE target 中共享且不可由 adapter 重命名的 `canonicalSkillId`。 |
| **target path** | 目标路径 | 某个 canonical package 在指定 IDE mirror 中的实际安装路径。 |
| **source reference** | 来源引用 | Installed entry 指向其 canonical source package 的可审计引用。 |
| **installed projection** | 安装投影 | Canonical source 经 module 选择、配置解析和 adapter 映射后写入 target project 的实际安装态。 |
| **canonical package hash** | 规范包哈希 | 对完整 canonical Skill package 内容计算的 hash，用于证明不同 IDE mirrors 安装的是同一内容。 |
| **installer-owned hash projection** | Installer 所有的哈希投影 | `files-index.json` 记录的已安装文件 hash baseline，供 validate、update 和 repair 判断 drift。 |

## Manifest And Indexes（Manifest 与索引）

| Term | 中文直译 | Definition |
|---|---|---|
| **manifest/index** | Manifest / 索引 | 记录 source、module、IDE target、Skill、file、ownership 和 hash 的安装态投影集合；它不应成为 canonical source 或 config 的替代真源。 |
| **skill index** | 技能索引 | 逐个记录 `canonicalSkillId`、`sourcePackagePath`、`canonicalPackageHash` 和 `installedTargets` 的 installed inventory。 |
| **files index** | 文件索引 | 逐文件记录 IDE target 中 installer-owned file、ownership 和 hash baseline 的索引。 |
| **manifest version** | Manifest 版本 | 当前 installed-state contract 的版本标识，用于 status、validate 和 migration diagnostics。 |
| **public path** | 公共路径 | 可以进入 CLI、manifest/index、JSON 或文档的脱敏路径，必须使用 project-relative POSIX form。 |

## Progress And Readiness（进度与就绪）

| Term | 中文直译 | Definition |
|---|---|---|
| **install progress** | 安装进度 | 按实际开始和完成顺序展示各安装阶段状态的输出。未开始的阶段不能被显示为已完成。 |
| **stable step ID** | 稳定步骤ID | Fixture 可观察、不会因文案或 locale 改变的 lower-kebab 阶段标识，例如 `ready-check`。 |
| **completed steps** | 已完成步骤 | `CommandResult.data.completedSteps` 中已成功完成的契约化步骤集合。 |
| **pending steps** | 待处理步骤 | 尚未开始或因失败、未授权而未完成的步骤集合。 |
| **required step** | 必需步骤 | ReadyCheck 必须确认成功的安装步骤；任一 required step 失败时不能展示 ready summary。 |
| **ReadyCheck** | 就绪检查 | Install 内部的轻量就绪门，只检查 manifest/index、source projection、selected mirrors、package entries 和 required paths，不执行完整 hash scan 或远程检查。 |
| **ready summary** | 就绪摘要 | 所有 required steps 成功后展示的最终摘要，包含安装位置、source、manifest version、modules、IDE targets、关键路径和 next actions。 |
| **Evidence profile** | 证据型 Profile | 面向人审阅证据与结果的输出布局，按稳定顺序呈现 Summary、steps、modules、targets、paths 和 Next actions。 |

## Human And Machine Output（人类与机器输出）

| Term | 中文直译 | Definition |
|---|---|---|
| **human-readable output** | 人类可读输出 | 面向终端用户的阶段标题、摘要、提示、issue 和 next action，可以本地化和自适应宽度。 |
| **machine-readable output** | 机器可读输出 | `--json` 返回的稳定 `CommandResult` 数据，不受 locale、TTY、颜色和 terminal width 影响。 |
| **message catalog** | 消息目录 | 按 locale 保存终端自然语言文案的资源集合；技术标识、path 和 JSON field 不本地化。 |
| **locale fallback** | Locale 回退 | 请求的 locale 不可用时使用约定 catalog 的规则；Epic 1 以 `zh-CN` 为默认并支持 `en-US`。 |
| **no-prompt flow** | 无提示流程 | `--yes` 或 `--json --yes` 下不等待 stdin 的非交互执行路径。 |
| **default authorization** | 默认授权 | `--yes` 对无 conflict 的默认 module、quick config 和 IDE targets 计划给予授权，同时仍需在输出中说明采用了默认值。 |
| **NO_COLOR** | 不着色 | 要求 CLI 禁用 ANSI color 的通用环境约定；禁用颜色不能导致状态语义丢失。 |
| **TTY / non-TTY** | TTY/非TTY | TTY 是交互式终端，non-TTY 常见于 CI 或管道；输出必须在两种环境中保持相同核心信息。 |
| **narrow-terminal fallback** | 窄终端回退布局 | 终端宽度不足时从 table 降级为 key-value block 的布局策略，不得省略 target、path、issue 或 next action。 |
| **ANSI escape** | ANSI转义 | 用于颜色和光标控制的终端控制序列；`--json`、`NO_COLOR`、non-TTY 和 CI 输出中不得出现。 |

## Common Distinctions（常见区别）

| Do Not Confuse | Difference |
|---|---|
| **install summary vs. ready summary** | Install summary 在写入前确认范围；ready summary 只在写入和 ReadyCheck 成功后出现。 |
| **selected module vs. installed module** | Selected 表示计划纳入安装；installed 表示已经成功投影并通过所需证据检查。 |
| **runtime structure vs. artifact repository** | Runtime structure 支撑工具运行；artifact repository 保存 Workflow 过程产物。 |
| **canonical source vs. IDE execution mirror** | Canonical source 定义应安装什么；IDE mirror 是 target project 中供 IDE 执行的安装副本。 |
| **ReadyCheck vs. full validation** | ReadyCheck 是 install 内部轻量门；full validation 执行更广的 schema、hash、path 和 integrity 检查。 |
| **human-readable output vs. machine-readable output** | 前者可本地化和调整布局；后者必须保持稳定 schema，供 automation 读取。 |
| **`--yes` vs. unsafe overwrite** | `--yes` 只授权无 conflict 的计划写入，不会绕过 ownership、path safety 或 operation lock。 |

## Related Documents（相关文档）

| Relationship | Document |
|---|---|
| 安装操作指南 | [`../../how-to/install-speclite.md`](../../how-to/install-speclite.md) |
| Runtime 边界解释 | [`../../explanation/runtime-boundaries.md`](../../explanation/runtime-boundaries.md) |
| IDE discovery 术语 | [`ide-discovery.md`](ide-discovery.md) |
| 文件所有权术语 | [`file-ownership.md`](file-ownership.md) |
| CLI 参考 | [`../cli.md`](../cli.md) |
