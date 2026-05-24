# SpecLite

SpecLite 是一个本地安装器与治理层，用于把 SpecLite 方法论源定义安装到目标项目和多个 AI IDE 中，并保持安装结果可发现、可验证、可更新。

## Language（语言）

**Canonical Source Tree（规范来源树）**:
经过校验的 SpecLite 源定义树，安装器可以将其打包、镜像到 AI IDE skill 目录，并记录到 manifest 中。
_避免_: `_bmad`、`_bmad-output`、开发辅助产物

**Canonical Skill Package（规范 Skill 包）**:
一个安装到目标项目和 IDE execution plane 后应保持不变的 skill 定义包，包含 `SKILL.md`、`CHANGELOG.md`、references、assets、scripts、`config.toml.example`、`customize.toml` 和其他随 skill 发布的定义内容。
_避免_: IDE wrapper、command pointer、adapter metadata、workflow output

**Bundled Source Assets（内置源资产）**:
随产品发布的 SpecLite 源定义，存放在 `assets/source/speclite/`，安装时由 source resolver 读取。
_避免_: `src/source/`、resolver 实现代码

**Source Resolver（来源解析器）**:
位于 `src/source/` 的 TypeScript 实现，用于把内置源、npm、tarball、offline bundle、Git 或 local source 归一为 **Canonical Source Tree（规范来源树）**。
_避免_: 内置源资产、skill package 内容

**Source Trust Status（来源信任状态）**:
`SourceDescriptor.trustStatus` 的 MVP 枚举语义。`trusted` 只表示来源通过 expected hash 或 lock match 验证；`unverified` 表示来源可安装但缺少可证明的信任锚；`blocked` 表示 hash mismatch、lock mismatch、unsupported source 或 Post-MVP source policy 拒绝导致不得安装。MVP 不提供通用 trusted source allowlist schema。
_避免_: 把所有 npm source 默认视为可信、把 local/offline source 静默视为可信、在 MVP 中引入未定义的 trusted source 配置

**Source Integrity Evidence（来源完整性证据）**:
`SourceDescriptor` 中用于说明安装来源如何被固定或校验的稳定证据。MVP 不要求所有 source 都有 `contentHash`，但进入写入步骤的 source 必须至少记录一种证据：registry integrity/version lock、tarball/offline bundle content hash、Git commit SHA 或 local source snapshot hash。MVP 可以消费 expected hash 或 lock match 作为信任锚，但不负责生成、轮转或批量维护外部 source lockfile。`integrityEvidence[].verified === false` 只表示证据可复现但尚未命中 expected hash 或 lock match，不表示校验失败。
_避免_: 把 `contentHash` 误当成所有 source 的强制字段、只记录浮动 branch/tag、无证据写入、用 `verified: false` 表示 hash mismatch

**Source Lockfile Management（来源锁文件管理）**:
Post-MVP 的完整 source lockfile 生命周期能力，包括外部 source lockfile 生成、刷新、轮转、批量迁移、审计和 source policy/provenance/signature 集成。它不是 MVP 的最小完整性证据与校验能力；MVP 只负责记录并验证进入安装写入步骤所需的 integrity evidence。
_避免_: 把完整供应链治理塞进 MVP、把 MVP trustStatus 依赖的 hash/lock 校验误放到 Post-MVP、让无证据 source 写入

**Pinned Git Source（固定 Git 来源）**:
MVP 中允许作为正式安装来源的 Git source，但必须在写入前解析到具体 commit SHA，并以 `git-commit` 形式记录为 **Source Integrity Evidence（来源完整性证据）**。只指定 remote URL、branch 或 tag 的浮动 Git source 可以用于解析输入，但不得进入 install planning 或写入步骤。
_避免_: 浮动 branch/tag 安装、把 Git ref 当版本锁、未记录 commit SHA 的 Git source 写入

**Source Integrity Issue（来源完整性问题）**:
`ValidationIssue.category === "source-integrity"` 的问题类别，用于 source resolver 或 install planning 阶段发现的来源证据缺失、hash mismatch、lock mismatch、unsupported source 或 Post-MVP source policy 拒绝。
_避免_: `file-integrity`、IDE mirror drift、已安装文件 hash mismatch

**File Integrity Issue（文件完整性问题）**:
`ValidationIssue.category === "file-integrity"` 的问题类别，用于已安装文件、manifest files index 或 IDE mirror 文件与记录 hash 不一致。
_避免_: source descriptor 缺少 integrity evidence、registry integrity 校验失败、Git source 未固定 commit

**Validation Issue Identifier（验证问题标识）**:
`ValidationIssue.issueId` 的稳定问题类型标识。MVP 必须采用 `<category>.<stable-code>` 形式，不得包含 path、IDE target、source name、计数、hash、时间或其它动态值；动态上下文必须放入 `affectedPath`、`component` 或 `details`。
_避免_: `manifest-schema.missing-version._speclite/config.yaml`、`ide-mirror.claude-3`、把动态上下文当问题类型

**Validation Issue Details（验证问题详情）**:
`ValidationIssue.details` 的机器可读结构化上下文。MVP 只允许可 JSON 序列化、可脱敏、确定性的字段；不得放入人类长文、absolute path、stack trace、原始异常对象、环境变量、认证信息或非确定性字段。
_避免_: 把 details 当日志正文、泄露本机路径或密钥、snapshot 因堆栈或时间抖动

**Validation Issue Severity（验证问题严重级别）**:
`ValidationIssue.severity` 的固定分级语义。`critical` 表示 unsafe overwrite、schema corruption、missing required runtime contract 等必须阻断；`error` 表示命令或验证不能完成，或安装不可用；`warning` 表示流程可继续但需要人工处理；`info` 表示状态说明或建议。
_避免_: 各 validation rule 自行解释 severity、warning 阻断命令、error 仍报告 success

**Validation Issue Message Template（验证问题消息模板）**:
`ValidationIssue.impact` 与 `ValidationIssue.suggestedNextStep` 的 JSON 内稳定短句模板。二者是 human-readable 字段，但仍属于机器可读 JSON 契约；不得包含 path、timestamp、stack trace、随机值或长段解释。动态上下文必须放入 `affectedPath`、`component` 或 `details`。
_避免_: 把动态路径拼进 impact、把 suggestedNextStep 当自由日志、fixture 因文案抖动失败

**Command JSON Timestamp Boundary（命令 JSON 时间戳边界）**:
public `CommandResult` JSON 的 timestamp 规则。默认所有 public JSON 字段不得包含 timestamp；只有 manifest/generated metadata 中明确声明的字段可以使用 ISO 8601 string，且不得作为 fixture snapshot 的稳定比较字段。
_避免_: 在 summary/details/issues 中输出时间、用当前时间污染 snapshot、把 generated metadata timestamp 当稳定断言

**Validate No-Network Boundary（验证无网络边界）**:
MVP `speclite validate` 的确定性边界。它只检查本地 manifest、source descriptor、files index、IDE mirrors、runtime path、menu target 和 artifact path，不重新访问 npm registry、private registry、Git remote 或其他远程 source。
_避免_: remote freshness check、provenance revalidation、把 `validate` 变成依赖网络的命令

**Status Lightweight Boundary（状态轻量边界）**:
MVP `speclite status` 的轻量只读边界。它只读取本地 manifest、source descriptor、IDE target summary 和 high-level health，不执行完整文件 hash scan，不访问 npm registry、private registry、Git remote 或其他远程 source。
_避免_: full validate、remote freshness check、provenance revalidation、隐式 update check

**Node Config Resolver（Node 配置解析器）**:
MVP 中由 Node/TypeScript 实现的配置与定制化解析器，负责替代旧 Python resolver，并以 Python parity fixture 证明行为兼容。
_避免_: Python runtime dependency、重新发明合并语义

**Resolver Runtime Entry（解析器运行入口）**:
skills 调用配置与定制化解析能力时使用的稳定产品接口，例如 `speclite resolve config` 与 `speclite resolve customization`，或安装器生成的薄 wrapper。
_避免_: `node dist/...`、内部构建产物路径、Python 脚本入口

**Runtime Support Command（运行时支撑命令）**:
MVP 必须实现但不作为主用户旅程宣传的 CLI surface，用于支撑已安装 skills 的运行时能力。
_避免_: Post-MVP 可选命令、内部私有 API

**Unified JSON Output Contract（统一 JSON 输出契约）**:
MVP 面向用户的核心命令在传入 `--json` 时使用的统一机器可读输出 envelope，覆盖 `install`、`status`、`validate`、`update` 和 `update --repair`。
_避免_: 每个命令自定义 JSON shape、只提供人类可读输出、把 Post-MVP 命令面提前到 MVP

**CommandResult JSON Contract SPEC（命令结果 JSON 契约 SPEC）**:
位于 `docs/specs/command-result-json-contract.md` 的 canonical public JSON contract。PRD 只拥有产品需求和验收意图，Architecture 只拥有实现映射；字段 schema、排序、路径、timestamp、兼容性和 fixture comparison policy 以该 SPEC 为准。
_避免_: PRD/architecture 复制契约细节后漂移、fixture 断言缺少单一依据、把 schema version 写成装饰字段

**Executable Contract Anchor（可执行契约锚点）**:
`CommandResult JSON Contract SPEC（命令结果 JSON 契约 SPEC）` 的实现期唯一 runtime schema 入口，MVP 位置为 `src/diagnostics/command-result-schema.ts`。JSON reporter、fixture assertions 和 contract tests 必须复用它；它是实现锚点，不是第二份契约真源。
_避免_: Markdown SPEC、Zod schema、fixture helper 各自维护字段规则、在实现 schema 中新增未声明 public 字段、提前维护独立 JSON Schema 文件

**CommandResult Envelope（命令结果信封）**:
统一 JSON 输出的顶层结构，包含 `schemaVersion`、`status`、`command`、`targetProject`、`summary`、`issues`、`nextActions` 和命令专属 `data`。
_避免_: 顶层裸数组、缺少 issue model、缺少 schema version、把 repair plan 只藏在人类可读文本里

**CommandResult Schema Version（命令结果 Schema 版本）**:
MVP `CommandResult Envelope（命令结果信封）` 的顶层 schema 标识，固定为 `speclite.command-result.v1`。
_避免_: 省略版本、用包版本替代输出 schema、让自动化脚本猜字段形状

**CommandResult Schema Evolution（命令结果 Schema 演进）**:
`speclite.command-result.v1` 的演进策略。MVP 内 `v1` 只允许 backward-compatible additive changes；字段删除、重命名、语义改变、枚举收窄或新增必填字段都必须升到新的 schema version，例如 `speclite.command-result.v2`。
_避免_: 把 schema version 当装饰字段、在 v1 内破坏已有 consumer、用包版本掩盖输出契约变化

**Command Identifier（命令标识）**:
`CommandResult.command` 的规范命令 ID。MVP 核心用户命令必须输出 `install`、`status`、`validate`、`update` 或 `update.repair`；不得输出原始 argv、shell command string、命令别名或带 flags 的字符串。Flags、参数和模式信息必须进入 command-specific `data` 或专门字段。
_避免_: `speclite update --repair`、`update --repair --json`、原始 shell quoting、参数顺序污染 snapshot

**Target Project Identifier（目标项目标识）**:
`CommandResult.targetProject` 中的人类可读稳定项目标识，优先使用 trim 后非空的 project config 项目名；缺失、空字符串或纯空白时使用目标项目目录 basename。MVP 不做 slugify、字符集限制或长度改写。
_避免_: absolute project path、空字符串、纯空白项目名、slugified project id、`data.paths.projectRoot` 的重复路径、机器相关 checkout root

**CommandResult Status（命令结果状态）**:
`CommandResult.status` 的推导规则：命令无法完成或存在 error/critical issue 时为 `failure`；`update` / `update.repair` 中 `conflicts.length > 0` 时也必须为 `failure`，即使当前只是 dry-run，并且 `issues` 必须包含且只包含一个 command-level blocking issue：`issueId: "update.conflicts"`、`category: "update"`、`severity: "error"`，具体逐路径冲突仍只放在 `data.conflicts`；命令完成且只有 warning issue 时为 `warning`；命令完成且没有 warning/error/critical issue 且没有 blocking conflicts 时为 `success`。
_避免_: 把 installation health 当成 command status、warning 默认失败、error issue 但 status 仍为 success

**High-Level Health（高级健康摘要）**:
`status.data.highLevelHealth` 的安装状态摘要，取值为 `not-configured`、`configured`、`partial` 或 `failed`。它描述目标项目的安装健康状态，不描述本次 `status` 命令是否执行成功。
_避免_: `CommandResult.status`、exit code、validation issue severity

**Not Configured Status（未配置状态）**:
`status.data.highLevelHealth === "not-configured"` 的合法状态，表示目标项目尚未安装 SpecLite 或未发现本地 manifest。只要 `status` 成功判断出该状态，`CommandResult.status` 必须为 `success`，exit code 必须为 0，并通过 `nextActions` 建议运行 `speclite install`。
_避免_: command failure、non-zero exit code、把未安装项目当异常

**Status Summary Issues（状态摘要问题）**:
`speclite status` 的轻量摘要不因 `highLevelHealth` 为 `partial` 或 `failed` 自动生成 warning issue。`status` 可以通过 `summary`、`data.highLevelHealth` 和 `nextActions` 表达健康摘要；只有轻量读取本身发现明确 warning 条件时才写入 warning issue。`issues: []` 只表示本次 status 命令没有产生命令级 warning/error，不表示安装完全健康。
_避免_: 为健康摘要自动制造 warning、把 status 当 validate、用 issue severity 推导 highLevelHealth、把空 issues 当健康证明

**Validate Issue Counts（验证问题计数）**:
`validate.data.issueCounts` 中的详细问题计数，来自完整验证流程。MVP `status.data` 不包含 `issueCounts`，避免把 `status` 实现成弱化版 `validate`。`issueCounts` 必须固定包含 `info`、`warning`、`error` 和 `critical` 四个 key，即使某类计数为 0 也不得省略。
_避免_: `status.data.issueCounts`、从 status 估算详细问题数量、轻量摘要承担完整诊断、省略 0 值 severity key

**Validation Category Order（验证类别顺序）**:
`validate.data.checkedCategories` 的 canonical 输出顺序。MVP 必须按 `manifest-schema`、`source-integrity`、`ide-mirror`、`runtime-path`、`menu-target`、`legacy-namespace`、`artifact-path`、`file-integrity` 输出已执行类别。
_避免_: 文件系统遍历顺序、规则注册顺序、对象 key 顺序、按发现问题数量排序

**IDE Target Order（IDE 目标顺序）**:
`validate.data.checkedTargets`、`status.data.ideTargets` 和 `install.data.ideTargets` 的 canonical 输出顺序，来自 manifest/adapter registry 中声明的 IDE target order。MVP 不得按 glob、文件系统遍历、平台返回顺序或 adapter 执行完成顺序输出 target。
_避免_: `.agents/skills` 与 `.claude/skills` 顺序随机、平台相关排序、按发现问题数量排序

**Validated Path Order（已验证路径顺序）**:
`validate.data.validatedPaths` 的 canonical 输出顺序。MVP 必须先通过 path normalizer 生成 project-relative POSIX path，再按字典序输出。不得按 validation rule execution order、filesystem traversal order 或 issue discovery order 输出。
_避免_: 规则执行顺序污染输出、文件系统遍历顺序抖动、跨平台 snapshot 不稳定

**Command Issue Order（命令问题顺序）**:
`CommandResult.issues` 的 canonical 输出顺序。MVP 必须按 severity order（`critical`、`error`、`warning`、`info`）→ category order → normalized affected path → issue id 排序；category order 优先使用 **Validation Category Order（验证类别顺序）**，未列入的 category 排在其后并按 category 字符串排序。
_避免_: validation rule execution order、adapter completion order、对象插入顺序、同一批 issues 在 snapshots 中随机抖动

**Command Next Action Order（命令后续动作顺序）**:
`CommandResult.nextActions` 的 canonical 输出顺序。MVP 必须按 command-specific priority order 输出：blocking remediation → recommended next step → optional exploration；同一 priority tier 内按该命令定义的稳定顺序输出，不按字母序重排。
_避免_: reporter 拼接顺序、按字母序丢失优先级、同一命令在 snapshots 中随机抖动

**Command Summary Template（命令摘要模板）**:
`CommandResult.summary` 的 JSON-only 稳定摘要模板。MVP 每个核心命令必须定义稳定 summary 模板，不得包含 timestamp、absolute path、环境相关措辞或随机排序内容；human-readable output 可以使用更丰富的说明，不受该模板限制。
_避免_: 把 human 文案当 JSON 契约、summary 随环境或时间变化、fixture snapshots 因措辞抖动失败

**Command Exit Code（命令退出码）**:
MVP 核心用户命令的退出码规则：`CommandResult.status === "failure"` 时非 0；`success` 或 `warning` 时为 0。
_避免_: human/json 输出与退出码不一致、warning 破坏脚本化流程、error issue 仍返回 0

**Command Data Payload（命令数据载荷）**:
`CommandResult.data` 中的命令专属稳定 payload schema；MVP 必须为 `install`、`status`、`validate`、`update` 和 `update --repair` 分别定义形状。
_避免_: `Record<string, unknown>` 长期作为公共契约、把 CI 所需字段只放在人类可读 summary、不同命令随意命名同类字段

**Command Data Public Projection（命令数据公开投影）**:
`CommandResult.data` 中会暴露给 CLI consumers 的嵌套类型字段，例如 `SourceDescriptor`、`IdeTargetStatus`、`CommandPathSummary`、`UpdatePlan`、`RepairPlan` 和 `UpdateConflict`。这些字段属于 `docs/specs/command-result-json-contract.md` 的 public projection；内部 resolver、installer、validator 或 update model 可以更丰富，但不得直接泄漏到 public JSON。
_避免_: 只稳定顶层 envelope、嵌套 data 字段随实现漂移、把内部 model 当输出契约

**Command Data Array Order（命令数据数组顺序）**:
`CommandResult.data` 中 public JSON arrays 的排序契约。MVP 中所有数组字段都必须声明排序规则；未声明专属顺序时，必须按 normalized stable key 字典序输出。`changedPaths`、`skippedPaths`、`completedSteps`、`pendingSteps`、`installedModules`、`updatePlan.actions`、`repairPlan.actions` 和 `conflicts` 的排序规则由 CommandResult JSON Contract SPEC 定义。
_避免_: 文件系统遍历顺序、对象插入顺序、规则执行顺序、同一数组在 snapshots 中抖动

**Command Path Contract（命令路径契约）**:
`CommandResult.data`、`ValidationIssue.affectedPath`、update plan 和 repair plan 中的路径必须使用 project-relative POSIX path。
_避免_: absolute local path、Windows separator、home directory 泄露、跨机器 fixture snapshot 不稳定

**Resolve Output Contract（解析输出契约）**:
`speclite resolve` 的机器可读 I/O 契约：stdout 只输出解析结果 JSON，stderr 以 JSON Lines 输出 `ValidationIssue` 形状的 diagnostics，退出码表达成功或失败。
_避免_: stdout 混入人类可读提示、非 JSON 结果、stderr 自由文本 reporter、stderr JSON 数组

**Resolve Exit Code（解析退出码）**:
`speclite resolve` 的退出码语义：解析成功即使有 warning diagnostics 也返回 0；error 或 critical diagnostics 才返回非 0。
_避免_: warning 导致失败退出、成功时无 stdout 结果

**Resolve JSON Formatting（解析 JSON 格式）**:
`speclite resolve` 的产品输出格式偏好：2 空格缩进、末尾换行、非 ASCII 字符不转义；parity fixtures 比较 JSON 语义而非 byte-for-byte 文本。
_避免_: 压缩 JSON、转义中文、用字段顺序或空白做脆弱验收

**Python Resolver Baseline（Python 解析器基线）**:
现有 `resolve_config.py` 与 `resolve_customization.py` 的输入、合并规则、错误处理和 JSON 输出行为，用作 Node resolver 迁移期的兼容性基线。
_避免_: MVP 主运行时依赖、长期运行入口

**Missing Resolve Key（缺失解析键）**:
`speclite resolve --key` 请求的 dotted key 不存在时的默认兼容行为：输出 `{}`、退出码为 0、stderr 不输出 issue。
_避免_: 默认报错、默认写入 stderr、破坏 Python parity

**Repeated Resolve Keys（重复解析键）**:
`speclite resolve` 支持重复传入 `--key`，并以原 dotted key 字符串作为输出 JSON 的字段名。
_避免_: 只支持单 key、把 dotted key 展开成嵌套对象

**Resolve Project Root（解析项目根）**:
`speclite resolve` 确定目标项目根的规则：`config` 必须显式传 `--project-root`；`customization` 的正式 skill instructions 应显式传 `--project-root`，未传时保留 Python baseline 的向上查找 fallback。
_避免_: 只依赖 cwd、只依赖 skill directory、在 IDE mirror/monorepo 中隐式猜测

**Resolver Layer Failure（解析层失败）**:
resolver 读取 TOML layer 失败时的兼容语义：required layer 失败使命令失败；optional layer 失败输出 warning issue 并按 `{}` 忽略该层继续解析。
_避免_: optional layer 默认失败、warning 自由文本、静默吞掉 required layer 错误

**Resolver Array Merge（解析器数组合并）**:
resolver 合并数组时的兼容规则：只有当 base+override 的所有元素都是 table 且全部拥有同一个 `code` 或全部拥有同一个 `id` 时，才按该字段 keyed merge；命中同 key 时 override item 整项替换 base item；其他情况 append。
_避免_: 混用 `code`/`id` 时合并、部分元素有 key 时合并、命中同 key 时递归 deep merge、按字段名猜测合并

**Resolver No-Deletion Semantics（解析器无删除语义）**:
resolver 合并配置时不提供默认删除机制；override 不能删除 base item，只能覆盖或追加。
_避免_: `null` 删除、`enabled=false` 特判删除、`remove` 列表、隐式 schema 扩展

**Config Merge Order（配置合并顺序）**:
`resolve config` 的四层合并顺序：`_speclite/config.toml` → `_speclite/config.user.toml` → `_speclite/custom/config.toml` → `_speclite/custom/config.user.toml`。
_避免_: custom 层早于 installer user、按 ownership 重新排序、按文件名排序

**Customization Merge Order（定制化合并顺序）**:
`resolve customization` 的三层合并顺序：skill `customize.toml` defaults → `_speclite/custom/{skill}.toml` team custom → `_speclite/custom/{skill}.user.toml` user custom。
_避免_: 按 docstring 优先级措辞反向合并、user custom 早于 team custom、跳过 skill defaults

**Customization Key（定制化键）**:
`resolve customization --skill` 使用 skill directory basename 作为 customization lookup key，读取 `_speclite/custom/{skill}.toml` 与 `_speclite/custom/{skill}.user.toml`。
_避免_: IDE adapter 重命名 mirror directory、另设未记录的 lookup key、从 display name 推导 key

**SpecLite Source Definition（SpecLite 源定义）**:
由 SpecLite 作者维护的 skill、module、runtime、script 和 metadata 内容，作为产品源码的一部分被安装到用户项目中。
_避免_: 已安装项目状态、BMad 工作文件

**Installer Control Plane（安装控制面）**:
Node-first CLI 系统，负责解析源定义、写入 runtime metadata、创建 IDE mirrors、验证安装健康度，并在 update 时保护受所有权管理的文件。
_避免_: 文件复制器、prompt library

**IDE Execution Plane（IDE 执行面）**:
目标 AI IDE 的 skill 目录，用于加载并执行已安装的 SpecLite skill packages。
_避免_: `_speclite` runtime、source tree

**MVP IDE Target（MVP IDE 目标）**:
MVP 硬交付的 IDE execution target：`.claude/skills` 与 `.agents/skills`。GitHub Copilot 和 Cursor 如果支持 `.agents/skills`，可通过该通用 target 使用 SpecLite skills；它们的专用 command pointer、专用 platform registry 或专有 adapter 属于 Post-MVP。
_避免_: 把 Copilot/Cursor 专用适配器当作 MVP 承诺、把 `.agents/skills` 兼容支持误写成专有集成

**Minimum Phase Coverage Matrix（最小阶段覆盖矩阵）**:
MVP 中由 manifest、help index 和 installed skill entries 生成的本地可验证矩阵，只回答每个研发阶段是否存在 mapped skill entry、对应 canonical skill id、以及目标 IDE target 是否可见。它不计算覆盖率百分比、标准产物存在率、validate 通过率、未解决缺口数量、趋势或团队级治理视图。
_避免_: Post-MVP 流程覆盖报告、dashboard、趋势分析、多项目治理报表

**Process Coverage Report（流程覆盖报告）**:
Post-MVP 的治理报告能力，基于 MVP 的阶段覆盖 metadata 和 validate output 进一步计算阶段入口覆盖率、标准产物存在率、validate 通过率、未解决缺口数量，并支持团队/多项目视角、趋势、导出或企业治理汇总。
_避免_: MVP 最小阶段覆盖矩阵、单项目 manifest/help index 检查、fixture 级断言

**IDE Adapter（IDE 适配器）**:
将 canonical skill package 映射到具体 AI IDE target directory 和可验证 metadata 的平台适配层。MVP adapter schema 可以声明 `commandPointerBehavior: "none" | "unsupported"` 作为扩展位，但不得生成 command pointer artifact。
_避免_: 修改 canonical skill package 内容、重写 skill instructions、改变 customization key

**Command Pointer Boundary（命令指针边界）**:
专用 IDE command pointer 是 Post-MVP adapter artifact。MVP 不生成 Copilot/Cursor 专用 pointer 文件，也不把 menu target 解析到 pointer；MVP menu target 必须解析到已安装的 self-contained skill package entry。
_避免_: 把 adapter schema 扩展位当成 MVP 产物、把 `.agents/skills` 兼容路径误写成 Copilot/Cursor 专有 pointer

**Adapter Artifact（适配器产物）**:
IDE adapter 为满足某个 IDE 加载机制而生成的 wrapper、pointer 或 metadata 文件，不属于 canonical skill package。MVP 只生成 `.claude/skills` 与 `.agents/skills` self-contained skill package mirror 及其可验证 metadata；wrapper/pointer artifact 保持 Post-MVP。
_避免_: skill 定义内容、canonical package hash、customization key

**IDE Mirror Drift（IDE 镜像漂移）**:
IDE execution plane 中的 installed canonical skill package 文件偏离 manifest 记录的 canonical package hash。
_避免_: 静默覆盖、把 mirror 当 human-owned customization、忽略 drift

**Mirror Repair（镜像修复）**:
MVP 中通过 `speclite update --repair` 或 update confirmation 恢复 installer-owned drift 的操作，覆盖 IDE mirrors 与 `_speclite` metadata/control hub 中的 installer-owned files。
_避免_: 顶级 `speclite repair` 命令、update 静默覆盖 drift、validate 自动修复、把 Post-MVP `sync` 纳入 MVP、绕过 ownership/hash 检查

**Repair Plan（修复计划）**:
`speclite update --repair` 写入前必须生成的影响计划，列出 affected paths、ownership、current hash、expected hash 和 action。MVP 中所有 repair actions 只能作用于 installer-owned paths，且都必须有 `expectedHash`。`restore-canonical` 用于 IDE mirror 或 canonical skill package 文件，表示恢复 resolved canonical source content，不表示 backup restore；`regenerate` 用于 manifest、index、runtime scripts 或 `_speclite` control files，表示按当前 source descriptor 和 installer templates dry-run 生成 candidate content、计算 expected hash 后重建 generated metadata/control files。
_避免_: 直接写入、无确认修复、缺少 hash 对比、用 `restore` 混淆 Post-MVP backup/restore

**Update Plan Summary（更新计划摘要）**:
MVP update safety 的可诊断输出边界，包括 `updatePlan`、`repairPlan`、`changedPaths`、`skippedPaths`、`conflicts`、human-readable impact summary 和 `--json` 机器可读计划。`updatePlan.actions` 与 `repairPlan.actions` 表示 planned effects；`conflicts` 表示计划诊断，不依赖写入授权，dry-run 或 `writeAuthorized: false` 时也必须列出已发现冲突；`changedPaths` 与 `skippedPaths` 表示本次命令实际执行结果。`writeAuthorized: false` 时，即使 plan 中存在 `update`、`restore-canonical`、`regenerate` 或 `skip`，`changedPaths` 与 `skippedPaths` 也都必须为空；计划内将要变更或跳过的路径必须从 plan actions 推导。它不是独立报告产物系统，不包含 backup、restore、历史对比、导出报告或批量迁移报告。
_避免_: backup/restore/report、standalone report artifact、把 summary 当持久审计报告、冲突时自动覆盖

**Plan Reason Code（计划原因码）**:
`UpdateConflict.reason` 以及 `UpdatePlan.actions[]` / `RepairPlan.actions[]` 中 `action === "skip"` 时的 `reason` 字段。该字段保持 `string` 类型，但 SpecLite 作为 producer 必须使用 CommandResult JSON Contract SPEC 中的 MVP reason code registry，并由 executable schema / contract tests 校验；未来新增 code 是 backward-compatible additive change。外部 consumer 必须容忍未知 future reason code，把未知 code 当稳定展示字符串处理，不得因此解析失败。reason code 必须是稳定 lower-kebab 字符串，不得包含 path、hash、timestamp、source name、IDE target 或自由文本。`skip` action 必须提供 `reason`，非 `skip` action 默认不提供该字段；人类解释应放在 human-readable output 或 `suggestedNextStep`。普通 dry-run、交互确认前或脚本模式未传 `--yes` 不得编码成 `action: "skip"` + `reason: "not-authorized"`；plan 必须保留真实 planned effect，并用 command-level `requiresConfirmation` / `writeAuthorized` 表达写入授权状态。
_避免_: 把 reason 当日志、把动态上下文拼进 reason、没有原因的 skip、用长句解释污染 fixture、自造同义 reason code、consumer 因未知 future code 失败、把 dry-run 误当 skip

**Artifact Repository（产物仓库）**:
目标项目中配置的 workflow artifact 输出位置，用于保存 SpecLite skills 生成的过程产物。
_避免_: installer metadata、source definitions

**BMad Development Artifacts（BMad 开发辅助产物）**:
由于本项目自身使用 BMad 辅助开发而产生的 `_bmad/` 和 `_bmad-output/` 目录。
_避免_: SpecLite 源定义、installer-owned 产品文件

## Relationships（关系）

- **SpecLite Source Definition（SpecLite 源定义）** 随产品发布时位于 **Bundled Source Assets（内置源资产）** 中，经 source resolution 和 validation 后成为 **Canonical Source Tree（规范来源树）**。
- **Canonical Skill Package（规范 Skill 包）** 是 **Canonical Source Tree（规范来源树）** 中的 skill 级不可变安装单元；安装后在目标项目和 IDE 中保持固化，直到下一次人为 update/install。
- **Source Resolver（来源解析器）** 从 `assets/source/speclite/` 读取 **Bundled Source Assets（内置源资产）**；`src/source/` 存放 resolver 代码，不存放内置 skill 内容。
- **Source Resolver（来源解析器）** 必须为每个 source descriptor 输出 **Source Trust Status（来源信任状态）**；MVP 中只有 expected hash 或 lock match 可以把 source 升格为 `trusted`。缺少这些证据时，local tarball、offline bundle、Git 和 local source 默认是 `unverified`，不得静默升格为 `trusted`。
- **Source Resolver（来源解析器）** 必须为进入安装写入步骤的 source descriptor 输出 **Source Integrity Evidence（来源完整性证据）**；`contentHash` 只在内容可整体 hash 的 source 上强制，例如 local tarball、offline bundle 和 local source snapshot。
- **Pinned Git Source（固定 Git 来源）** 是 MVP 正式安装来源，但必须解析并记录 commit SHA 后才能进入 install planning；只记录 remote URL、branch 或 tag 的 Git source 必须产生 source-integrity 问题并阻止写入。
- 当任一 **Source Integrity Evidence（来源完整性证据）** 为 `verified: false` 且没有其它 verified evidence 时，`SourceDescriptor.trustStatus` 只能是 `unverified`；校验失败、hash mismatch 或 lock mismatch 必须是 `blocked`，不得继续写入。
- **Source Integrity Issue（来源完整性问题）** 与 **File Integrity Issue（文件完整性问题）** 必须保持不同 issue category：前者发生在 source resolution/install planning，后者发生在 installed file validation/update drift 检查。
- **Validation Issue Identifier（验证问题标识）** 只表示稳定问题类型；path、target、source name、hash、计数和其它实例上下文不得拼入 `issueId`。
- **Validation Issue Details（验证问题详情）** 只承载机器可读上下文；人类解释应放入 `impact` 和 `suggestedNextStep`。
- **Validation Issue Severity（验证问题严重级别）** 必须作为 **CommandResult Status（命令结果状态）** 的稳定输入；rule 不得自行重定义 severity 语义。
- **Validation Issue Message Template（验证问题消息模板）** 必须用于 `impact` 和 `suggestedNextStep`；二者不得承载动态上下文。
- **Command JSON Timestamp Boundary（命令 JSON 时间戳边界）** 默认禁止 public JSON timestamp；明确允许的 generated metadata timestamp 也不得进入稳定 snapshot 比较字段。
- `speclite validate` 必须遵守 **Validate No-Network Boundary（验证无网络边界）**；远程 freshness、provenance revalidation 或 registry/Git 重新校验只能发生在显式 `update`、安装来源解析或 Post-MVP `doctor` 流程中。
- `speclite status` 必须遵守 **Status Lightweight Boundary（状态轻量边界）**；它不得触发完整验证、远程 freshness/provenance revalidation 或隐式 update check。
- **Node Config Resolver（Node 配置解析器）** 必须覆盖 **Python Resolver Baseline（Python 解析器基线）** 中的四层 config merge、三层 customization merge、`--key` 抽取和 JSON 输出语义。
- **Resolver Runtime Entry（解析器运行入口）** 暴露 **Node Config Resolver（Node 配置解析器）** 的能力；skill instructions 只能依赖这个稳定入口，不得依赖 `dist/` 内部文件路径。
- `speclite resolve config` 与 `speclite resolve customization` 是 **Runtime Support Command（运行时支撑命令）**，属于 MVP 支撑 API，但不是面向终端用户宣传的主命令。
- `speclite install`、`speclite status`、`speclite validate`、`speclite update` 和 `speclite update --repair` 必须支持 **Unified JSON Output Contract（统一 JSON 输出契约）**；`--json` 只改变输出格式，不改变写入确认语义。
- **CommandResult JSON Contract SPEC（命令结果 JSON 契约 SPEC）** 是 MVP public JSON behavior 的 canonical source；PRD/architecture 中的 JSON 规则均应视为摘要或实现映射。
- **Executable Contract Anchor（可执行契约锚点）** 必须实现并校验 **CommandResult JSON Contract SPEC（命令结果 JSON 契约 SPEC）** 的 public JSON shape；若二者冲突，以 SPEC 为准并修正实现锚点。
- **CommandResult Envelope（命令结果信封）** 必须包含顶层 `schemaVersion: "speclite.command-result.v1"`，并复用 `ValidationIssue` issue model；命令专属结构放入 `data`，例如 `update --repair --json` 的 repair plan。
- **CommandResult Schema Evolution（命令结果 Schema 演进）** 必须保护 `speclite.command-result.v1` 的 consumer；`v1` 内只允许向后兼容扩展。
- `CommandResult.command` 必须使用 **Command Identifier（命令标识）**，不得使用原始 argv、shell command string、别名或带 flags 的字符串。
- `CommandResult.targetProject` 必须使用 **Target Project Identifier（目标项目标识）**，不得使用路径、空字符串或 slugified identifier；目标项目根路径在 `data.paths.projectRoot` 中固定为 `"."`。
- **CommandResult Status（命令结果状态）** 必须由 command completion 与 `ValidationIssue.severity` 共同推导；human 输出、JSON 输出和 fixture assertions 必须使用同一结果。
- **High-Level Health（高级健康摘要）** 不得与 **CommandResult Status（命令结果状态）** 互相推导；`speclite status --json` 可以返回 `CommandResult.status: "success"`，同时 `data.highLevelHealth` 为 `not-configured`、`partial` 或 `failed`。
- **Not Configured Status（未配置状态）** 是 `status` 的正常可诊断结果，不是命令失败；`nextActions` 必须包含安装建议。
- **Status Summary Issues（状态摘要问题）** 不得把 `partial` 或 `failed` 自动转成 warning issue；`issues: []` 不得被解释为 installed health 通过，详细诊断 issue 应由 `speclite validate` 负责。
- **Validate Issue Counts（验证问题计数）** 只属于 `validate.data`；`status.data` 不得包含 `issueCounts`，fixture assertions 不得要求 status 输出问题计数。`validate.data.issueCounts` 必须总是输出 `info`、`warning`、`error`、`critical` 四个 key。
- **Validation Category Order（验证类别顺序）** 必须用于 `validate.data.checkedCategories`；输出不得依赖文件系统遍历、规则注册或对象 key 顺序。
- **IDE Target Order（IDE 目标顺序）** 必须用于 `validate.data.checkedTargets` 和 command data 中的 `ideTargets`；输出不得依赖 glob、文件系统或平台顺序。
- **Validated Path Order（已验证路径顺序）** 必须用于 `validate.data.validatedPaths`；输出必须先规范化为 project-relative POSIX path，再按字典序排序。
- **Command Issue Order（命令问题顺序）** 必须用于 `CommandResult.issues`；输出不得依赖 rule execution、adapter completion 或 discovery order。
- **Command Next Action Order（命令后续动作顺序）** 必须用于 `CommandResult.nextActions`；输出不得依赖 reporter 拼接顺序或字母序。
- **Command Summary Template（命令摘要模板）** 必须用于 `CommandResult.summary`；该约束只适用于 JSON envelope，不限制 human-readable output。
- **Command Exit Code（命令退出码）** 必须与 **CommandResult Status（命令结果状态）** 一致：`failure` 非 0，`success`/`warning` 为 0。
- **Command Data Payload（命令数据载荷）** 不能长期是无约束对象；MVP 必须定义 `install`、`status`、`validate`、`update` 和 `update --repair` 的稳定 `data` shape，fixture assertions 应覆盖这些 payload。
- **Command Data Public Projection（命令数据公开投影）** 也归 **CommandResult JSON Contract SPEC（命令结果 JSON 契约 SPEC）** 管理；PRD/architecture 中的内部类型或实现模型不得自动成为 public JSON 字段。
- **Command Data Array Order（命令数据数组顺序）** 必须用于所有 public JSON arrays；新增数组字段必须同时声明排序规则。
- **Command Path Contract（命令路径契约）** 适用于所有 public JSON path fields，包括 `data.paths`、`data.validatedPaths`、`data.changedPaths`、`data.skippedPaths`、`issues[].affectedPath`、`updatePlan.actions[].affectedPath` 和 `repairPlan.actions[].affectedPath`。
- **Plan Reason Code（计划原因码）** 让 update/repair 中的 conflict 与 skip 可由自动化稳定比较；动态上下文必须留在 path/hash/details 字段或 human-readable output 中。
- `speclite resolve` 是 **Unified JSON Output Contract（统一 JSON 输出契约）** 的明确例外：它服务 installed skills，stdout 必须保持纯解析结果 JSON，不包裹 `CommandResult Envelope（命令结果信封）`。
- `speclite resolve` 必须遵守 **Resolve Output Contract（解析输出契约）**：stdout 只输出解析结果 JSON，stderr 以 JSON Lines 输出 `ValidationIssue` 形状的 diagnostics，退出码表达成功或失败。
- **Resolve Exit Code（解析退出码）** 必须区分 warning 与 failure：有 warning diagnostics 但解析成功时 exit code 为 0；出现 error/critical diagnostics 时 exit code 非 0。
- **Resolve JSON Formatting（解析 JSON 格式）** 是产品输出偏好，不是 parity fixture 的 byte-for-byte 断言；fixtures 应解析 JSON 后比较语义。
- **Missing Resolve Key（缺失解析键）** 是成功状态，不是诊断问题；严格缺失校验只能通过未来显式 flag（例如 `--require-key`）添加，不得改变默认行为。
- **Repeated Resolve Keys（重复解析键）** 必须保持 Python parity：重复 `--key` 输出一个对象，存在的 key 以原 dotted key 字符串作为字段名，缺失 key 省略。
- **Resolve Project Root（解析项目根）** 区分两个子命令：`resolve config` 的 `--project-root` 必填；`resolve customization` 支持 `--project-root`，未传时为 Python parity 保留 fallback：先从 skill directory 向上找 `_speclite` 或 `.git`，找不到再从 cwd 向上找。
- **Resolver Layer Failure（解析层失败）** 必须保持 Python parity：required TOML layer 读取或解析失败时命令失败；optional TOML layer 读取或解析失败时命令继续，stderr 输出 `ValidationIssue` 形状的 warning JSON diagnostic，并把该层视为 `{}`。
- **Resolver Array Merge（解析器数组合并）** 必须保持 Python parity：全体 table 元素共享同一个 `code` 或 `id` 才 keyed merge；命中同 key 时 override item 整项替换 base item，不做 item-level deep merge；混用 `code`/`id`、部分元素缺 key、非 table 元素出现时均 append。
- **Resolver No-Deletion Semantics（解析器无删除语义）** 必须保持 Python parity：override 不能删除 base items；禁用默认项只能通过同 key 整项替换为 no-op 或未来显式 deletion schema 处理。
- **Config Merge Order（配置合并顺序）** 必须严格保持 Python parity：installer-owned team → installer-owned user → human-owned team custom → human-owned user custom；human-owned custom 层覆盖 installer-owned user 层。
- **Customization Merge Order（定制化合并顺序）** 必须以 Python 实际代码行为为准：skill defaults → team custom → user custom；后者覆盖前者。
- **Customization Key（定制化键）** 必须保持 Python parity：key 取 `--skill` 指向目录的 basename；IDE adapters 不得随意重命名 canonical skill directory，否则会改变 customization lookup。
- **Python Resolver Baseline（Python 解析器基线）** 只作为迁移参考和 parity fixture oracle；通过兼容性验证后，正式安装后的 skills 不应依赖 Python resolver。
- **Installer Control Plane（安装控制面）** 将 **Canonical Source Tree（规范来源树）** 安装到 **IDE Execution Plane（IDE 执行面）** 和目标项目 runtime metadata 中。
- **MVP IDE Target（MVP IDE 目标）** 只承诺 `.claude/skills` 与 `.agents/skills` 两类目录。GitHub Copilot/Cursor 的 MVP 路径是复用 `.agents/skills`，不是提供专用 command pointer 或专有 adapter。
- **Minimum Phase Coverage Matrix（最小阶段覆盖矩阵）** 属于 MVP，但只由本地 manifest/help index/installed skill entries 支撑；**Process Coverage Report（流程覆盖报告）** 属于 Post-MVP，不得把覆盖率百分比、趋势、团队汇总或 dashboard 塞进 MVP。
- **IDE Adapter（IDE 适配器）** 可以生成 **Adapter Artifact（适配器产物）**，但不得改变 **Canonical Skill Package（规范 Skill 包）** 内容；同一 canonical skill 的定义内容在所有 IDE 中必须严格一致。
- Manifest 必须分别记录 canonical package hash 和 adapter artifact hash，避免 IDE 差异污染 canonical skill package hash。
- **IDE Mirror Drift（IDE 镜像漂移）** 由 `validate` 报告为 `ide-mirror` 或 `file-integrity` error；`validate` 不自动修复，MVP 恢复必须通过 `speclite update --repair` 或 update confirmation，并遵守 ownership/hash 保护。
- `update` 遇到 **IDE Mirror Drift（IDE 镜像漂移）** 时默认标记 conflict，不静默覆盖；只有 **Mirror Repair（镜像修复）** 或交互确认后才覆盖恢复。`speclite sync` 保持 Post-MVP。
- `speclite update --repair` 可修复 installer-owned drift，包括 IDE mirrors、manifest/index 和 runtime scripts；不得覆盖 human-owned custom files 或 workflow-owned artifacts。
- `speclite update --repair` 写入前必须生成 **Repair Plan（修复计划）**；交互模式需要用户确认，脚本模式需要显式 `--yes`。
- **Update Plan Summary（更新计划摘要）** 属于 MVP；backup、restore、standalone report artifact、更丰富的更新影响报告、批量迁移报告和历史对比属于 Post-MVP。
- **IDE Execution Plane（IDE 执行面）** 执行已安装的 skills，这些 skills 可以把 workflow 输出写入 **Artifact Repository（产物仓库）**。
- **BMad Development Artifacts（BMad 开发辅助产物）** 可以作为规划过程参考，但不是 **Canonical Source Tree（规范来源树）** 的一部分，也不得进入 installer scope、IDE mirrors 或新的 SpecLite manifests。

## Example Dialogue（示例对话）

> **Dev:** “安装器是否应该扫描 `_bmad/`？它里面也有 manifest 和 skill list。”
> **Domain expert:** “不应该。`_bmad/` 存在是因为这个仓库本身使用 BMad 辅助开发。SpecLite 内置源定义位于 `assets/source/speclite/`。”

## Flagged Ambiguities（已澄清歧义）

- “`_bmad/` 看起来像可安装 source tree，因为它包含 manifests 和 skills” — 已澄清：它是 BMad 辅助开发产物，不是 SpecLite 产品源。
- “`references/source/speclite` 看起来只是 reference-only 文件夹” — 已澄清：该过渡目录已迁移到 `assets/source/speclite/`，`references/` 不再作为产品源或参考源保留。
- “`src/source/` 听起来像 SpecLite 源定义未来归宿” — 已澄清：它是 source resolver 实现目录；内置源定义存放在 `assets/source/speclite/`。
- “Node-first 是否意味着可以直接丢弃 Python resolver 语义” — 已澄清：不可以。Node resolver 要替代 Python runtime 依赖，但必须先通过 Python parity fixture 证明合并与输出行为兼容。
- “skills 是否可以调用 `node dist/...` 来使用 Node resolver” — 已澄清：不可以。skills 应调用稳定的 **Resolver Runtime Entry（解析器运行入口）**，例如 `speclite resolve ...` 或安装器生成的薄 wrapper。
- “`speclite resolve` 是否是 Post-MVP 命令” — 已澄清：不是。它是 MVP 的 **Runtime Support Command（运行时支撑命令）**，用于支撑 skill 激活时读取 config/customization。
- “`speclite resolve` 是否可以输出人类可读说明” — 已澄清：stdout 不可以。stdout 必须保持纯解析结果 JSON，诊断信息以 JSON Lines 写入 stderr，每行一个 `ValidationIssue`。
- “`speclite resolve` 有 warning diagnostics 是否应该失败退出” — 已澄清：不应该。只要解析成功，exit code 为 0；error/critical 才非 0。
- “Node resolver parity 是否要求 JSON 文本 byte-for-byte 相同” — 已澄清：不要求。验收比较 JSON 语义；产品输出格式固定为 2 空格缩进、末尾换行、非 ASCII 不转义。
- “`speclite resolve --key missing.path` 是否应该失败” — 已澄清：默认不失败。为兼容 Python baseline，缺失 key 输出 `{}`、退出码 0、stderr 为空。
- “多个 `--key` 是否输出嵌套对象” — 已澄清：不输出嵌套对象。输出对象字段名保留原 dotted key，例如 `{ "core": ..., "modules.sdlc": ... }`。
- “两个 resolve 子命令是否都能隐式猜 project root” — 已澄清：不能。`resolve config` 必须显式传 `--project-root`；`resolve customization` 为兼容保留 fallback，但正式 installed skill instructions 应显式传 `--project-root`。
- “optional TOML layer 解析失败是否应阻止 skill 运行” — 已澄清：默认不阻止。为兼容 Python baseline，可选层失败输出 warning issue 并忽略该层；必需层失败才导致命令失败。
- “数组里只要有 `code` 或 `id` 是否就 keyed merge” — 已澄清：不是。必须所有元素都是 table 且共享同一种 key；混用或不完整时 append。命中同 key 时是整项替换，不是递归合并。
- “override 是否可以删除 base item” — 已澄清：MVP 不支持默认删除机制；不得通过 `null`、`enabled=false` 或 `remove` 做隐式删除。
- “`custom/config.toml` 是否应该排在 `config.user.toml` 前面” — 已澄清：不应该。为兼容 Python baseline，custom 层在 installer user 层之后，并会覆盖 installer user。
- “`resolve_customization.py` docstring 的 highest priority first 是否决定合并顺序” — 已澄清：不决定。Node parity 以实际代码行为为准：defaults → team → user。
- “customization lookup 是否可以用 skill display name 或 adapter path” — 已澄清：MVP 不可以。lookup key 是 skill directory basename；adapter 不应改名 canonical skill directory。
- “IDE adapter 是否可以为某个 IDE 改写 `SKILL.md` 内容” — 已澄清：不可以。MVP adapter 只做 target directory 与可验证 metadata 映射，不改变 canonical skill package 内容，也不生成 command pointer artifact。
- “IDE 所需 wrapper/pointer 是否属于 skill 定义内容” — 已澄清：不属于。它们是 **Adapter Artifact（适配器产物）**；其中 command pointer 属于 Post-MVP，未来 manifest hash 必须与 canonical package hash 分开记录。
- “MVP 是否承诺 GitHub Copilot/Cursor 专用集成” — 已澄清：不承诺。MVP 硬交付 `.claude/skills` 与 `.agents/skills`；Copilot/Cursor 理论上可通过 `.agents/skills` 使用，专用 command pointer、platform registry 或 adapter 属于 Post-MVP。
- “Command pointer 是 MVP 产物还是 Post-MVP 产物” — 已澄清：Post-MVP。MVP adapter schema 可保留 `commandPointerBehavior: "none" | "unsupported"` 扩展位，但 MVP 不生成 pointer artifact；menu target 必须解析到已安装 self-contained skill package entry。
- “阶段覆盖矩阵是 MVP 还是 Post-MVP 流程覆盖报告的一部分” — 已澄清：拆分。MVP 保留 **Minimum Phase Coverage Matrix（最小阶段覆盖矩阵）**，只回答阶段、canonical skill id、mapped skill entry 和 IDE target 可见性；Post-MVP 才提供 **Process Coverage Report（流程覆盖报告）**，包含覆盖率百分比、标准产物存在率、validate 通过率、未解决缺口数量、趋势和企业治理视图。
- “`CHANGELOG.md` 是否影响 canonical skill package hash” — 已澄清：会影响。它属于 **Canonical Skill Package（规范 Skill 包）** 的定义内容，安装后应保持不变。
- “`config.toml.example` 是否可作为目标项目配置直接修改” — 已澄清：不可以。它属于 **Canonical Skill Package（规范 Skill 包）** 并影响 hash；human-owned 覆盖只应写入 `_speclite/custom/*.toml`。
- “用户手工修改 IDE mirror 里的 `SKILL.md` 是否应被 validate 自动恢复” — 已澄清：不自动恢复。`validate` 报告 drift，MVP 恢复由 `speclite update --repair` 或 update confirmation 执行。
- “`update` 是否可以默认覆盖 IDE mirror drift” — 已澄清：不可以。默认标记 conflict；`speclite update --repair` 或确认后才覆盖恢复，`sync` 保持 Post-MVP。
- “MVP 是否需要顶级 `speclite repair` 命令” — 已澄清：不需要。repair 是 `speclite update --repair` 的显式模式，不扩展 MVP 顶级命令面。
- “`update --repair` 是否只修 IDE mirror drift” — 已澄清：不是。它修复 installer-owned drift，包括 IDE mirrors 和 `_speclite` control hub 的 installer-owned files，但不覆盖 human-owned custom 或 workflow artifacts。
- “显式 repair 是否可以直接写文件” — 已澄清：不可以。必须先生成 repair plan，交互确认或 `--yes` 后才写入。
- “update 的报告/备份策略是否属于 MVP” — 已澄清：拆分。MVP 提供 **Update Plan Summary（更新计划摘要）**，包括 update/repair plan、changed/skipped/conflict paths、human-readable impact summary 和 `--json` 机器可读计划；backup、restore、standalone report artifact、更丰富更新影响报告、批量迁移报告和历史对比属于 Post-MVP。
- “`RepairPlan.action: "restore"` 是否应保留” — 已澄清：不保留。MVP 使用 `restore-canonical` 表示恢复 installer-owned canonical package content，避免和 Post-MVP backup/restore 混淆。
- “`restore-canonical` 与 `regenerate` 的职责是否需要拆开” — 已澄清：需要。`restore-canonical` 只用于 IDE mirror/canonical skill package 这类 canonical content drift；`regenerate` 只用于 manifest/index/runtime scripts/`_speclite` control files 这类 generated metadata/control files；两者都只能作用于 installer-owned paths。
- “`RepairPlan.expectedHash` 对 `regenerate` 是否必须存在” — 已澄清：必须。所有 repair actions 都必须在写入前具备可比较 expected hash；`regenerate` 必须先 dry-run 生成 candidate content 并计算 expected hash，否则不得进入 repair plan。
- “`UpdatePlan` / `RepairPlan` 的 `skip` 是否必须带稳定 reason code” — 已澄清：必须。`skip` action 必须提供稳定 lower-kebab `reason`；`UpdateConflict.reason` 也必须是稳定 reason code，不得包含 path、hash、timestamp、source name、IDE target 或自由文本。
- “`reason` 是否要定义封闭枚举” — 已澄清：不做完全封闭枚举。`reason` 保持 `string` 类型，但 MVP 已知 code 必须来自 CommandResult JSON Contract SPEC 的 reason code registry；未来新增 code 属于 backward-compatible additive change。
- “producer 和 consumer 对 reason code 的严格程度是否要分开” — 已澄清：需要。SpecLite producer 必须只输出 registry code，并由 executable schema / contract tests 校验；外部 consumer 必须容忍未知 future code，不得因新增 code 解析失败。
- “`not-authorized` 应该表示未传 `--yes` 还是路径级不可授权” — 已澄清：只表示路径级授权策略导致该路径不能进入可执行计划。普通 dry-run、确认前或未传 `--yes` 必须保留真实 planned effect，并通过 command-level `requiresConfirmation` / `writeAuthorized` 表达。
- “`changedPaths` / `skippedPaths` 表示计划摘要还是实际执行结果” — 已澄清：实际执行结果。计划摘要由 `updatePlan.actions` / `repairPlan.actions` 表达；`writeAuthorized: false` 时 `changedPaths` 和 `skippedPaths` 都必须为空。
- “`conflicts` 是计划诊断还是实际执行结果” — 已澄清：计划诊断。它不依赖 `writeAuthorized`，dry-run / 未授权写入也必须列出冲突；实际执行结果只由 `changedPaths` / `skippedPaths` 表达。
- “`CommandResult.status` 遇到 conflicts 是否必须 failure” — 已澄清：必须。`update` / `update.repair` 只要 `conflicts.length > 0`，`CommandResult.status` 必须为 `failure` 且 exit code 非 0，即使当前只是 dry-run。
- “conflicts 导致 failure 时是否必须同步 `issues[]`” — 已澄清：必须同步一个 command-level blocking issue：`update.conflicts`。不得把每个 conflict 复制成 issue；逐路径细节保留在 `data.conflicts`。
- “`speclite resolve` 是否可以输出人类可读说明” — 已澄清：stdout 不可以。stdout 必须保持纯 JSON，诊断信息写入 stderr。
- “统一 JSON output 是否仍是 Post-MVP” — 已澄清：不是。MVP 核心用户命令必须支持 `--json` 和统一 `CommandResult` envelope；Post-MVP 只保留 CI/企业集成增强和新增命令的 JSON 扩展。
- “`speclite resolve` 是否也应包裹统一 `CommandResult`” — 已澄清：不应。`resolve` 是 runtime support command，stdout 契约服务 skills，必须保持纯解析结果 JSON。
- “`CommandResult` 是否需要顶层 schema version” — 已澄清：需要。MVP 顶层 `schemaVersion` 固定为 `speclite.command-result.v1`。
- “`schemaVersion` 是否需要规定演进策略” — 已澄清：需要。`speclite.command-result.v1` 在 MVP 内只允许 backward-compatible additive changes；字段删除、重命名、语义改变、枚举收窄或新增必填字段都必须升到新的 schema version，例如 `speclite.command-result.v2`。
- “`CommandResult.command` 是否可以使用用户输入的原始 argv 字符串” — 已澄清：不可以。它必须是 **Command Identifier（命令标识）**，MVP 取值为 `install`、`status`、`validate`、`update` 或 `update.repair`；flags、参数和模式信息进入 command-specific `data` 或专门字段，避免参数顺序、别名或 shell quoting 影响 JSON snapshot。
- “`CommandResult.status` 是否应只表示命令执行状态” — 已澄清：它表示命令结果状态，由命令是否完成和 issue severity 共同推导；存在 error/critical issue 时必须为 `failure` 并返回非 0，只有 warning issue 时为 `warning` 且返回 0。
- “`status.highLevelHealth` 是否应该和 `CommandResult.status` 使用同一枚举或互相推导” — 已澄清：不应该。`CommandResult.status` 是本次命令结果；`highLevelHealth` 是安装健康摘要。`status` 命令成功读取到一个部分损坏的安装时，命令结果仍可为 `success`，健康摘要可为 `partial` 或 `failed`。
- “`not-configured` 是否应该让 `status` 命令返回 failure” — 已澄清：不应该。`not-configured` 是合法健康摘要；只要 `status` 成功判断目标项目未安装，`CommandResult.status` 为 `success`、exit code 为 0，并通过 `nextActions` 建议运行 `speclite install`。
- “`partial` / `failed` 是否应该让 `status` command 产生 warning issue” — 已澄清：MVP 不强制。`status` 是轻量摘要，用 `summary`、`highLevelHealth`、`nextActions` 表达状态；详细 issue 留给 `validate`。只有轻量读取本身发现明确 warning 条件时才产生 warning issue。
- “`status` 的 `issues` 是否应该允许为空数组” — 已澄清：必须允许。`issues: []` 表示本次轻量 status 命令没有产生命令级 warning/error，不等于安装完全健康；安装健康由 `data.highLevelHealth` 表达。
- “`status` 是否应该包含 `issueCounts`” — 已澄清：MVP 不包含。`issueCounts` 属于 `validate.data`；`status` 只提供 `highLevelHealth` 和轻量摘要，避免用户把 status 当成弱化版 validate。
- “`validate.data.issueCounts` 是否需要固定 severity keys” — 已澄清：需要。`info`、`warning`、`error`、`critical` 四个 key 必须总是存在，计数为 0 也不省略，避免 CI 和 fixture 为缺失字段做额外兼容逻辑。
- “`checkedCategories` 是否也应该固定顺序” — 已澄清：需要。`validate.data.checkedCategories` 必须按 **Validation Category Order（验证类别顺序）** 输出，避免 snapshot 和 CI 因遍历顺序不稳定而抖动。
- “`checkedTargets` 是否也应该固定顺序” — 已澄清：需要。`validate.data.checkedTargets` 必须按 **IDE Target Order（IDE 目标顺序）** 输出，避免 `.claude/skills`、`.agents/skills` 等目标因 glob、文件系统或平台差异顺序抖动。
- “`validatedPaths` 是否也应该固定顺序” — 已澄清：需要。`validate.data.validatedPaths` 必须先经过 **Command Path Contract（命令路径契约）** 规范化为 project-relative POSIX path，再按字典序输出，避免 validation rule execution order、filesystem traversal order 或 issue discovery order 影响 snapshots。
- “`issues[]` 是否也应该固定顺序” — 已澄清：需要。`CommandResult.issues` 必须按 **Command Issue Order（命令问题顺序）** 输出：severity order（`critical`、`error`、`warning`、`info`）→ category order → normalized affected path → issue id，避免同一批问题因规则执行、adapter 完成或 discovery 顺序不同而导致 snapshots 抖动。
- “`ValidationIssue.issueId` 是否需要稳定命名规则” — 已澄清：需要。`issueId` 必须采用 `<category>.<stable-code>`，不得包含 path、IDE target、source name、计数或动态值；动态上下文放入 `affectedPath`、`component` 或 `details`。
- “`ValidationIssue.details` 是否需要规定边界” — 已澄清：需要。`details` 只放 machine-readable、可 JSON 序列化、可脱敏、确定性的结构化上下文；不得放人类长文、absolute path、stack trace、原始异常对象、环境变量、认证信息或非确定性字段。
- “`ValidationIssue.severity` 是否需要固定分级语义” — 已澄清：需要。`critical` 表示 unsafe overwrite、schema corruption、missing required runtime contract 等必须阻断；`error` 表示命令或验证不能完成，或安装不可用；`warning` 表示可继续但需要人工处理；`info` 表示状态说明或建议。
- “`impact` 与 `suggestedNextStep` 是否需要稳定性边界” — 已澄清：需要。它们是 human-readable 字段，但仍属于 JSON 契约，必须使用稳定短句模板，不放 path、timestamp、stack trace、随机值或长段解释；动态内容继续放 `affectedPath`、`component` 或 `details`。
- “JSON 中允许 timestamp 的位置是否需要规定” — 已澄清：需要。默认 public `CommandResult` JSON 不允许 timestamp；只有 manifest/generated metadata 等明确字段可使用 ISO 8601 string，且不得进入 fixture snapshot 的稳定比较字段。
- “`nextActions[]` 是否也应该固定顺序” — 已澄清：需要，但不应按字母序。`CommandResult.nextActions` 必须按 **Command Next Action Order（命令后续动作顺序）** 输出：blocking remediation → recommended next step → optional exploration；同一 priority tier 内按命令定义的稳定顺序输出。
- “`summary` 是否要做稳定模板化” — 已澄清：需要，但只限定 JSON 的 `CommandResult.summary`。MVP 每个核心命令必须使用 **Command Summary Template（命令摘要模板）**，不得包含 timestamp、absolute path、环境相关措辞或随机排序内容；human-readable output 可以自由组织更详细说明。
- “`CommandResult.data` 是否可以长期保持 `Record<string, unknown>`” — 已澄清：不可以。实现可用泛型承载扩展，但 MVP 公共契约必须定义每个核心命令的稳定 payload schema。
- “`CommandResult.data` 中数组字段是否需要默认排序策略” — 已澄清：需要。所有 public JSON arrays 都必须声明排序；未声明专属顺序时按 normalized stable key 字典序。`changedPaths`、`skippedPaths`、`updatePlan.actions`、`repairPlan.actions`、`conflicts`、`completedSteps`、`pendingSteps`、`installedModules` 等已由 CommandResult JSON Contract SPEC 声明排序规则。
- “统一 JSON output 的细则应该独立成 SPEC 还是继续放在 PRD” — 已澄清：独立 SPEC 更合理。`docs/specs/command-result-json-contract.md` 是 canonical contract；PRD 只保留产品需求和验收意图，Architecture 只保留实现映射。
- “Markdown SPEC 与实现期 Zod schema 谁是真源” — 已澄清：Markdown SPEC 是 canonical contract；`src/diagnostics/command-result-schema.ts` 是唯一 **Executable Contract Anchor（可执行契约锚点）**，供 reporter、fixture assertions 和 contract tests 复用，但不是第二份契约真源。
- “JSON payload 里的路径是否可以使用绝对路径或平台分隔符” — 已澄清：不可以。除明确标记的 redacted absolute diagnostic 外，公共 JSON path fields 必须使用 project-relative POSIX path。
- “`CommandResult.targetProject` 是否可以是目标项目路径” — 已澄清：不可以。它是稳定项目标识，优先 trim 后非空的 project config 项目名，缺失、空字符串或纯空白时用目录 basename；`data.paths.projectRoot` 固定为 `"."`。
- “project config 项目名为空字符串或纯空白时是否算缺失” — 已澄清：算缺失。`targetProject` 不得输出空字符串，必须 fallback 到目录 basename。
- “`targetProject` 是否需要 slugify、字符集或长度限制” — 已澄清：MVP 不需要。它是显示用稳定标识，不参与 path、hash 或 lookup key；未来如需 CI-friendly id 必须新增独立字段。
- “`sourceDescriptor.contentHash` 是否对所有 source 强制存在” — 已澄清：不强制。MVP 强制的是 **Source Integrity Evidence（来源完整性证据）**；registry source 可用 registry integrity/version lock，Git source 至少记录 commit SHA，tarball/offline bundle/local snapshot 才强制 content hash。
- “外部 source lock/hash 是否属于 MVP” — 已澄清：拆分。MVP 包含最小完整性证据与校验，可以记录并消费 expected hash、lock match、content hash、registry integrity、Git commit SHA；Post-MVP 才包含完整 **Source Lockfile Management（来源锁文件管理）**，例如 lockfile 生成、刷新、轮转、批量迁移、审计、source policy/provenance/signature 集成。
- “Git source 是否是 MVP 正式安装来源” — 已澄清：是，但边界收窄为 **Pinned Git Source（固定 Git 来源）**。Git source 必须解析到具体 commit SHA 后才允许进入 install planning；只指定 remote URL、branch 或 tag 的浮动来源不得写入。
- “MVP 是否实现通用 trusted source allowlist schema” — 已澄清：不实现。MVP 的 `trusted` 只由 expected hash 或 lock match 产生；企业 source policy、allowlist、签名和 provenance 属于 Post-MVP。
- “`integrityEvidence.verified` 是否允许为 `false` 但仍继续安装” — 已澄清：允许，但只对应 `trustStatus: "unverified"`；它表示证据已记录且可复现，但未被 expected hash 或 lock match 背书。校验失败必须转为 `blocked` 并停止写入。
- “`source-integrity` issue 是否复用 `file-integrity` category” — 已澄清：不复用。`source-integrity` 用于 source resolver/install planning；`file-integrity` 用于已安装文件、manifest files index 和 IDE mirror drift。
- “`validate` 是否应该重新检查远程 registry/Git source” — 已澄清：MVP 不应该。`validate` 必须保持本地、确定性、无网络；远程 freshness/provenance revalidation 放到显式 `update` 或 Post-MVP `doctor`。
- “`status` 是否也应该保持 no-network” — 已澄清：应该。MVP `status` 比 `validate` 更轻，只读本地 manifest、source descriptor、IDE target summary 和 high-level health，不做完整 hash scan、不访问远程 source、不做隐式 update check。
