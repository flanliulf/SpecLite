# Developer Tool Specific Requirements（开发者工具特定需求）

## Project-Type Overview（项目类型概览）

SpecLite 作为 developer tool，核心交付物是一个 Node-first CLI installer/control plane，用于把 SpecLite 方法论体系安装、状态检查、验证和更新到目标项目及多个 AI IDE 中。它不是通用脚手架，也不是单一 IDE 插件，而是围绕 SpecLite skills、runtime metadata、manifest/index、IDE mirrors 和 workflow artifacts 建立本地可治理工具链。

MVP 必须把既有 SpecLite source skill 体系转化为可安装系统：用户通过 CLI 完成安装后，目标项目中应生成 `_speclite` metadata/control hub、阶段对齐的 `_speclite-output` workflow artifact repository、manifest/index 文件，以及 `.claude/skills`、`.agents/skills` 等 IDE execution mirrors；目标项目 `docs/` 独立承担 Primary Public Document（主要公开文档）职责。CLI 还必须提供安装状态检查、确定性验证和安全更新入口，使 SpecLite 能作为团队研发规范工具链被持续使用。

## Technical Architecture Considerations（技术架构考量）

MVP 运行时与控制面必须以 Node.js 为主。现有 Python resolver 可作为历史参考或过渡实现，但 MVP 需要实现 Node 版 config/customization resolver，保证安装器、配置解析、定制化合并、manifest/index 生成、IDE adapter 和验证逻辑位于同一主工具链中。

TOML 继续作为外部配置与定制化契约。Node 工具链必须能够读取和生成 installer-owned TOML，同时对 human-owned TOML 默认采用只读或保守更新策略，避免破坏注释、排序和人工维护结构。YAML、CSV、Markdown、JSON 可继续承担 manifest、skill index、help index、source metadata 和报告输出等职责。

架构上应保持 canonical source、installer control plane、IDE execution plane、workflow artifact repository、workflow-generated project knowledge 与 public docs 的清晰边界。source skill 是唯一权威来源；IDE skills 目录是可再生成 mirror；`_speclite` 存放配置、manifest、索引、runtime scripts 和安装状态；`_speclite-output` 按 `0-brainstorming-artifacts/`、`1-analysis-artifacts/`、`2-planning-artifacts/`、`3-solutioning-artifacts/`、`4-implementation-artifacts/`、`5-devops-artifacts/` 保存阶段产物，并以 `project-knowledge-base/` 保存 workflow-generated project knowledge；`docs/` 不属于 project knowledge alias 或 fallback。Domain、market、technical research 及 product brief、PRFAQ 属于 Analysis 产物。

## Language Matrix（语言矩阵）

MVP 支持以下语言和文件契约：

- Node.js: CLI installer/control plane、config/customization resolver、IDE adapter、manifest/index 生成、status/validate/update。
- TOML: 用户可见配置与定制化契约，包括 project config、user config、custom override。
- Markdown: skill 定义、workflow 说明、菜单提示、PRD/ADR/story/review 等过程文档。
- YAML/CSV/JSON: module metadata、manifest、skill/help/files index、验证报告和机器可读状态。
- Python: 仅作为既有 resolver 参考或兼容背景，不作为 MVP 主控制面依赖。

MVP 不要求支持运行时插件语言扩展，也不要求为第三方开发者提供多语言 SDK。语言支持重点是让 SpecLite 自身安装控制面可维护、可验证、可跨平台运行。

## Installation Methods（安装方式）

MVP 必须支持以下安装来源和分发方式：

- bundled source: 默认官方内置来源，来自当前 package 中的 `assets/source/speclite/`，由 Epic 1 的 fresh install 垂直切片覆盖。
- npm public registry: 面向标准开发环境的替代分发路径。
- private npm registry: 面向企业内网、镜像源和统一工具链治理环境的替代分发路径。
- local tarball: 支持从本地包文件安装，便于离线验证和受限网络环境使用。
- offline bundle: 支持完整离线包安装，避免安装过程隐式访问公网。
- Git source: 支持从指定 Git source 安装或生成安装包，用于开发版、内部 fork 或特定版本验证；MVP 只允许解析到具体 commit SHA 的 pinned Git source 进入 install planning 和写入步骤。
- local path: 支持从本地 canonical source tree 安装或验证，但不得把目标项目中的 installed state、IDE mirrors、workflow output、dependency/cache/build 目录当作 canonical source。

安装过程必须显式记录 source/channel/version 信息，并在 `status` 与 `validate` 中可见。安装失败时应输出可诊断原因，例如 registry 不可达、权限不足、source 缺失、manifest 不合法、IDE target 不可写或路径不兼容。

## API Surface（API 接口面）

MVP 对用户暴露的 CLI 命令面为：

- `speclite install`: 在目标项目中安装 SpecLite runtime、manifest/index、IDE mirrors 和输出目录。
- `speclite status`: 展示当前项目安装状态、source/channel/version、目标 IDE 覆盖情况和关键健康摘要。
- `speclite validate`: 执行确定性验证，检查 manifest/schema、IDE mirror、runtime path、菜单 target、legacy namespace residue、产物路径和文件完整性。
- `speclite update`: 基于 source/channel/version 更新 installer-owned 文件，并保护 human-owned custom 文件和 workflow artifacts。

MVP 还必须提供 runtime support command（运行时支撑命令），但不作为主用户旅程命令宣传：

- `speclite resolve config`: 通过 Node resolver 解析项目级配置，支持 key 抽取，并兼容 Python resolver baseline。
- `speclite resolve customization`: 通过 Node resolver 解析 skill customization，支持 key 抽取，并兼容 Python resolver baseline。

`speclite resolve` 的 stdout 必须只输出解析结果 JSON；诊断信息以 JSON Lines 输出到 stderr，每行一个 `ValidationIssue` 形状的 diagnostic；命令通过退出码表达成功或失败。
当 `speclite resolve` 解析成功但产生 warning diagnostics 时，命令必须返回 exit code 0；只有 error 或 critical diagnostics 才返回非 0。
`speclite resolve` 的产品输出应使用 2 空格缩进、末尾换行，并保留非 ASCII 字符不转义；parity fixtures 必须比较 JSON 语义，而不是 byte-for-byte 文本。
默认情况下，请求不存在的 `--key` 不视为失败：命令输出 `{}`、退出码为 0、stderr 不输出 issue。严格缺失校验只能通过未来显式 flag 增加，不能改变默认兼容行为。
`speclite resolve` 必须支持重复 `--key`；输出对象必须使用原 dotted key 字符串作为字段名，缺失 key 省略。
`speclite resolve config` 必须要求显式 `--project-root`。`speclite resolve customization` 应支持显式 `--project-root`；为兼容 Python resolver baseline，未传 `--project-root` 时保留向上查找 fallback：先从 skill directory 查找 `_speclite` 或 `.git`，找不到再从 cwd 查找。
`speclite resolve` 对 TOML layer 读取或解析失败必须区分 required 与 optional：required layer 失败时命令失败；optional layer 失败时输出 `ValidationIssue` 形状的 warning JSON diagnostic 到 stderr，并将该层视为 `{}` 继续解析。
`speclite resolve` 必须保留 Python resolver 的数组合并规则：只有当 base+override 的所有数组元素都是 table，且全部拥有同一个 `code` 或全部拥有同一个 `id` 时才 keyed merge；命中同 key 时 override item 整项替换 base item，不做 item-level deep merge；混用 `code`/`id`、部分元素缺 key 或出现非 table 元素时必须 append。
`speclite resolve` 的 MVP 合并模型不提供删除机制：override 不能删除 base item；禁用默认项只能通过同 key 整项替换为 no-op 或未来显式 deletion schema 处理。
`speclite resolve config` 必须严格保持四层合并顺序：installer-owned `_speclite/config.toml` → installer-owned `_speclite/config.user.toml` → human-owned `_speclite/custom/config.toml` → human-owned `_speclite/custom/config.user.toml`。custom 层必须覆盖 installer user 层。
`speclite resolve customization` 必须严格保持三层合并顺序：skill `customize.toml` defaults → `_speclite/custom/{skill}.toml` team custom → `_speclite/custom/{skill}.user.toml` user custom。Node parity 以 Python 实际代码行为为准，而不是 docstring 的优先级措辞。
`speclite resolve customization --skill` 必须使用 skill directory basename 作为 customization lookup key。IDE adapters 不应重命名 canonical skill directory；如未来确需改名，必须在 manifest 中显式记录 customization key，并让 resolver 使用该 key。

MVP 面向用户的核心命令必须支持统一 JSON output：`speclite install --json`、`speclite status --json`、`speclite validate --json`、`speclite update --json` 和 `speclite update --repair --json`。JSON 输出必须使用统一 `CommandResult` envelope，并让 `issues` 复用同一 `ValidationIssue` model；`speclite resolve` 是 runtime support command 例外，stdout 必须保持纯解析结果 JSON，供 installed skills 稳定读取配置。

PRD 只拥有产品需求和验收意图；Architecture 只保留实现映射。详细字段 schema、排序规则、路径策略、timestamp 策略、schema evolution、fixture comparison policy 和 executable schema anchor 由 `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md` 管理；`speclite resolve` 的例外输出契约由 `_bmad-output/planning-artifacts/specs/06-resolve-command-contract.md` 管理；fixture layout、expected output、ready summary gate 和 release gate 分类由 `_bmad-output/planning-artifacts/specs/08-fixture-contract.md` 管理。若 PRD 或 Architecture 的摘要性描述与 owning SPEC 冲突，以 SPEC 为准。

`SourceDescriptor` 的 trust status、integrity evidence、write eligibility、Git pinning、source lock boundary 和 validate no-network boundary 由 `_bmad-output/planning-artifacts/specs/02-source-descriptor-contract.md` 管理。Install/update/repair 的 pre-write planning、external access、`--yes`、dry-run、operation lock、safe write、partial failure 和 write authorization 语义由 `_bmad-output/planning-artifacts/specs/03-install-plan-contract.md` 管理。Manifest/index projection 由 `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md` 管理；validation issue taxonomy 由 `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md` 管理。

验收意图是：核心命令的 human-readable output、`--json` output、exit code 和 fixture assertions 共享同一 issue/status 语义；`status` 保持 lightweight local-only summary，并与 `validate` 的详细 diagnostics 分工清晰。`status` 不提供 full validation category coverage，也不证明 installation healthy；自动化健康判断必须读取 `data.highLevelHealth`，需要可修复问题列表时必须运行 `validate`。`update` 和 `update --repair` 坚持 plan-before-write、ownership protection、conflict visibility 和 explicit write authorization；新增 public JSON 字段、reason code、redacted path 形状或 fixture comparison 规则时，必须先更新 owning SPEC，再同步 executable schema/parser 和 fixture expected outputs。

Post-MVP 命令包括：

- `speclite init`: 初始化或重建项目级配置。
- `speclite list`: 列出可安装模块、skills、IDE targets 或版本。
- `speclite doctor`: 提供环境、source、权限、IDE target、manifest、路径规范化和文件完整性诊断与修复建议。
- `speclite sync`: 显式同步 source 与 IDE mirrors。
- `speclite uninstall`: 移除 installer-owned 安装结果，并保留或提示处理 human-owned/workflow-owned 内容。

CLI 应同时支持交互式使用和脚本化使用。MVP 输出必须同时提供人类可读文本和统一 JSON output；Post-MVP 可在该契约基础上扩展 CI、企业工具链和自动化验证集成。

## CLI User States & Recovery Paths（CLI 用户状态与恢复路径）

下表聚合既有用户可观察状态、写入边界与恢复入口，便于区分 command result、installed health 与 update/repair planning。它不新增 state、command、issue id、schema 或自动迁移能力；精确字段和 producer/consumer 语义以 Existing Contract Anchors（既有契约锚点）为准。

| User Scenario | Observable State/Result | Write Behavior | Recovery/Next Action | Existing Contract Anchors |
| --- | --- | --- | --- | --- |
| Fresh interactive flow | 依次展示 plan、稳定顺序的 final review、独立 confirmation prompt、执行阶段与成功后的 Ready Summary | confirmation 前不写入；确认只授权 plan 中声明且无 blocker 的 writes | 在确认前调整 modules、config mode、IDE targets 或 source；写入后运行 `status` / `validate` | FR47、FR65a；NFR1、NFR1a、NFR11、NFR40e；SPEC 03、SPEC 08 |
| Fresh `install --yes` | 使用 deterministic defaults，human-readable output 说明默认值；`--json --yes` 保持 no-prompt | 仅授权无 conflict 的 planned writes；required value 无法解析或出现 unsupported target、drift、conflict 时在写入前失败 | 提供显式 flags、进入显式 interactive mode，或先处理 reported blocker；不得隐式切换为 interactive mode | FR47a；NFR11a、NFR40e；SPEC 03 |
| Existing install detected | Human-readable output 给出 `existing-install` 检测结果，列出 detected runtime、manifest version、IDE targets 与下一步选项；该词不是新的 `CommandResult.status` | 不得静默覆盖已有 SpecLite 状态、human-owned custom 文件或 workflow-owned artifacts | 先运行 `status` / `validate` 核对 installed state，再按计划运行 `update`；artifact roots 继续遵守 existing config 与 legacy fallback | NFR7、NFR14、NFR14a、NFR40f；SPEC 03、SPEC 09 |
| `not-configured` / `configured` / `partial` / `failed` health | `status.data.highLevelHealth` 表示 installed health；它不与 `CommandResult.status` 互相推导，成功读取 `partial` / `failed` 时 command 仍可为 `success`、exit code 0 | `status` 是 local-only read-only summary，不执行完整 hash scan、remote check 或隐式 update | `not-configured` 时运行 `install`；`partial` / `failed` 时运行 `validate` 获取逐项 issue 与修复建议 | NFR2a、NFR24a、NFR26、NFR33、NFR35b-1–NFR35b-5；SPEC 01、SPEC 05 |
| Command warning | `CommandResult.status: warning`，exit code 0；warning 不等于 installation healthy，也不得作为 blocking error | warning 本身不授权额外写入；write-capable command 仍受既有 plan 与 authorization 约束 | 按稳定 `nextActions` 处理；需要完整健康判断或逐项诊断时运行 `validate` | NFR30、NFR31、NFR35g；SPEC 01、SPEC 07；resolve 例外见 SPEC 06 |
| Update conflict / IDE drift | 普通 `update` 输出 blocking conflict；IDE mirror/file drift 具有稳定 issue 与 affected path，且不得被 `--yes` 隐式修复 | 冲突路径保持原样并进入 `data.conflicts`；普通 `update` 跳过，只有显式 `update --repair` 可修复 eligible installer-owned drift | 审查 conflict 与 ownership；对可安全恢复内容运行 `update --repair`，随后运行 `validate`；human-owned 与 workflow-owned 内容继续受保护 | FR41a–FR41b；NFR8、NFR14、NFR25a–NFR25c、NFR32g；SPEC 01、SPEC 03、SPEC 07 |
| Partial write failure / operation lock | failure 返回非 0 exit code；install failure 列出 completed steps、failed step、pending steps 与 manual action，且不展示 Ready Summary；`operation-lock.project-locked` 是 command-level blocker | lock 获取失败时不写入；partial failure 前已完成的 safe writes 不得被报告为已 rollback，MVP 不提供 transactional rollback | 处理 reported issue 或 lock；随后运行 `validate`、`update` 或 `update --repair`。stale lock 只按 warning 与 manual guidance 处理，不自动删除 | FR41c；NFR10、NFR30、NFR32f；SPEC 01、SPEC 03 |
| Config/artifact mismatch or schema migration needed | config path 与实际 artifacts 不一致时输出可诊断结果；不兼容 schema 使用 `manifest-schema.migration-needed`，包含版本、migration kind 与 manual-action requirement | 普通 install/update/repair 不移动 workflow artifacts，也不执行未契约化 schema migration；不得误报 migration 已完成 | 恢复 authoritative existing config，或按 manual action 完成显式人工迁移后重新 `validate`；MVP 的 migration kind 仅为 `manual` / `unsupported` | FR23b–FR23g；NFR14a、NFR32b–NFR32c、NFR40f；SPEC 07、SPEC 09 |

## Code Examples（代码示例）

MVP 文档与测试资料必须包含 fixture project，用于展示安装前后结构和典型命令流程。示例应覆盖：

- 空项目 fresh install。
- 安装后 `_speclite`、`_speclite-output`、`.claude/skills`、`.agents/skills` 的目录变化。
- manifest/index 文件生成结果。
- `status` 输出示例。
- `validate` 成功与失败示例。
- `update` 在 installer-owned 与 human-owned 文件上的行为差异。
- 一个阶段化 skill 菜单被 IDE 发现、激活、读取 resolver，并产出带 metadata 的 planning 或 review artifact 的最小 release-gate 闭环。

示例不应只是 README 片段，而应作为 fixture install tests 的基础，使维护者可以用同一套 fixture 验证安装行为、IDE mirror 一致性、manifest/schema、runtime path 和产物路径。

## Migration Guide（迁移指南）

MVP 暂时不提供完整迁移指南。当前阶段不把从手工复制 skills、旧参考结构或其他历史目录迁移作为首版交付目标。

MVP 仅需在文档中明确：SpecLite 安装目标是新的 `_speclite` 命名空间、SpecLite source skills、SpecLite manifest/index 和 SpecLite output artifact structure。MVP 不负责自动迁移旧系统，也不在未确认的情况下删除用户已有目录或历史入口。

MVP 文档必须提供最小迁移边界清单：

- 用户在安装前确认目标项目将使用 `_speclite` 作为新的 runtime namespace。
- 用户保留原有手工复制 skills、历史配置和过程产物的人工处置权。
- 安装器只管理 installer-owned 文件，不接管 human-owned custom 文件或 workflow artifacts。
- 安装完成后，用户通过 `status` 和 `validate` 查看新的 SpecLite 安装状态、IDE target 覆盖和配置路径。
- 需要从旧结构迁移到正式 SpecLite installer/control plane 的自动化流程进入 Post-MVP。

完整迁移指南进入 Post-MVP，后续可覆盖从手工复制、旧版 SpecLite 结构、历史参考结构或企业内部 fork 迁移到正式 SpecLite installer/control plane。

## Implementation Considerations（实现考量）

实现顺序应优先保证控制面闭环，而不是先扩展大量命令或 IDE 类型。MVP 应先完成 Node CLI skeleton、source discovery、TOML resolver、manifest/index 生成、IDE adapter、fresh install、status、validate、update 和 fixture install tests。

文件所有权模型必须在第一版实现：installer-owned 文件可由 installer 管理；human-owned custom TOML 和用户定制内容不得被无提示覆盖；workflow-owned artifacts 不参与 update 覆盖。Fresh install 使用阶段对齐的新 fields 与新默认 paths；existing install 的显式 artifact root 配置继续权威，缺少新增 fields 时应用 legacy fallback。普通 install、update 和 repair 不得移动、重命名、删除或重写既有 workflow artifacts；显式 artifact migration 留作独立后续能力。`update` 必须基于 hash、manifest 或等价完整性机制识别本地改动，并输出 update plan、impact summary、changed/skipped/conflict paths；无法确认安全时保守跳过。持久报告产物、备份/恢复和历史对比留到 Post-MVP。

跨平台路径处理必须作为基础设施实现，覆盖 macOS 和 Windows 的路径分隔符、换行符、文件权限、大小写敏感性、shell 差异和可执行入口。所有 manifest、hash、IDE target 和 validate 报告应使用稳定、可比较的路径规范。

Bundled source、Git source、private registry、本地 tarball、offline bundle 和 local path 支持会显著增加安装来源复杂度，因此 source/channel abstraction 必须尽早设计。不同来源最终应归一为同一 canonical source tree，再进入 manifest/index 生成和 IDE mirror 安装流程；local path source 必须先经过 self-reference guard，避免把已安装状态或输出目录重新当作 canonical source。
