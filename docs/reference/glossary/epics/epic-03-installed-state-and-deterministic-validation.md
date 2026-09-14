# Epic 3: Installed State And Deterministic Validation Glossary（已安装状态与确定性验证术语表）

本文解释 Epic 3「Installed State And Deterministic Validation」中的英文组合术语，帮助维护者区分轻量状态检查、完整本地验证、drift diagnostics 与稳定 JSON contract。

> Note: 本文解释的是 Epic 3 规划文档中的术语语义，不表示相应 Story 已经实施或通过验证。命令、字段、category、issue id 和 schema 名称保留英文。

## Installed State（已安装状态）

| Term | 中文直译 | Definition |
|---|---|---|
| **installed state** | 安装状态 | Target project 中由 manifest、indexes、runtime paths、IDE mirrors 和 ownership/hash baseline 共同描述的实际安装状态。 |
| **lightweight status summary** | 轻量级状态摘要 | `speclite status` 只读取本地摘要信息、快速展示安装健康和下一步，不执行完整 hash scan 或全类别验证。 |
| **high-level health** | 高层健康状态 | `status.data.highLevelHealth` 表达的安装健康摘要，例如 `not-configured`、`configured`、`partial` 或 `failed`。 |
| **not-configured** | 未配置 | 当前项目没有可识别 SpecLite 安装状态；它是一种健康摘要，不是命令执行错误。 |
| **configured** | 已配置 | 目标 IDE 或安装状态的关键配置已存在，轻量检查没有发现不完整迹象。 |
| **partial** | 部分 | 只完成部分 target、module 或 runtime projection，仍需 validate 获取具体问题。 |
| **failed health** | 失败健康状态 | 已安装状态存在明显失败迹象；即使 status 成功读取该状态，`CommandResult.status` 仍可以是 `success`。 |
| **target coverage summary** | 目标覆盖摘要 | 逐个 IDE target 展示配置状态、原因摘要和 affected path 的轻量视图。 |
| **manifest presence** | 清单存在性 | 是否能在约定路径找到 manifest 的基础 installed-state 信号。 |
| **local-only status** | 仅本地状态检查 | Status 不访问 registry、Git remote 或 bundle origin，也不执行 remote freshness 或隐式 update check。 |

## Status And Command Semantics（状态与命令语义）

| Term | 中文直译 | Definition |
|---|---|---|
| **CommandResult status** | 命令结果状态 | 表示本次命令是否成功执行的 `CommandResult.status`，不能从项目健康状态直接推导。 |
| **health/result separation** | 健康/结果分离 | 命令成功读取 `partial` 或 `failed` 安装状态时仍可返回 exit code 0；健康结论必须读取 `data.highLevelHealth`。 |
| **empty issues** | 空问题列表 | `status --json` 中的 `issues: []` 只表示轻量命令没有 command-level issue，不证明安装健康。 |
| **suggested next step** | 建议下一步 | Diagnostic 为用户提供的明确后续动作，例如运行 install、validate 或 update/repair。 |
| **affected path** | 受影响路径 | Issue 涉及的 project-relative POSIX path，用于精确定位问题且不泄露无关 absolute path。 |

## Manifest And Index Validation（Manifest 与索引验证）

| Term | 中文直译 | Definition |
|---|---|---|
| **manifest schema validation** | Manifest Schema 验证 | 检查 manifest schema version、required fields 和 installed-state projection shape。 |
| **schema migration needed** | 需要模式迁移 | Manifest/index 版本旧于当前支持版本的状态，对应 `manifest-schema.migration-needed`。 |
| **migration kind** | 迁移类型 | Diagnostic 中说明迁移方式的字段；MVP producer 只输出 `manual` 或 `unsupported`。 |
| **manual migration** | 手动迁移 | 需要维护者按明确步骤完成的迁移，工具不会自动修改 installed state。 |
| **unsupported migration** | 不支持的迁移 | 当前版本没有安全迁移路径，必须停止并由用户决定后续处理。 |
| **skill-index coverage** | Skill Index 覆盖 | `skill-index.json` 必须包含 selected modules 下全部 canonical package roots，不能静默省略缺失 entry。 |
| **reference integrity** | 引用完整性 | Help index 或 phase coverage 中引用的每个 `canonicalSkillId` 都必须存在于 skill index。 |
| **files-index validation** | Files Index 验证 | 检查 ownership、file-level hash、executable intent 和 project-relative path 等逐文件字段。 |
| **executable intent** | 可执行意图 | Manifest/index 对文件是否应具有可执行权限的跨平台意图，不等同于单个文件系统的当前 mode。 |
| **independent validation dimension** | 独立验证维度 | Line ending、executable bit、file mode、symlink 和 case conflict 分别检查，不能全部被 hash normalization 掩盖。 |

## Mirror And Integrity Validation（镜像与完整性验证）

| Term | 中文直译 | Definition |
|---|---|---|
| **IDE mirror validation** | IDE镜像验证 | 将 `.claude/skills`、`.agents/skills` 中的 installed package 与 manifest baseline 比较。 |
| **manifest baseline** | 清单基线 | Manifest/index 记录的预期 installed content、ownership 和 hash，供 validate 判断当前状态是否 drift。 |
| **canonical package hash** | 规范包哈希 | 对整个 canonical Skill package 计算的 hash，用于比较多个 IDE mirrors 是否内容一致。 |
| **file-level hash** | 文件级哈希 | Files index 对单个 installer-owned 文件 raw bytes 计算的 hash。 |
| **raw-byte hash** | 原始字节哈希 | 不先修改 line ending 或 file mode，直接对实际文件字节计算的完整性值。 |
| **IDE mirror drift** | IDE镜像漂移 | Installed IDE entry 与 manifest baseline 或其他 target 中同一 canonical package 不一致。 |
| **file integrity drift** | 文件完整性漂移 | Installer-owned file 的当前 raw-byte hash 与 files index baseline 不一致。 |
| **missing entry** | 缺失项 | Selected canonical package 应存在于 target mirror，但实际未找到的状态。 |
| **overlapping extra entry** | 重叠多余项 | Mirror 中额外 entry 与已有 canonical Skill identity 重叠，可能导致重复加载或漂移。 |
| **non-mutating validation** | 非修改式验证 | Validate 只报告 drift 和建议动作，不自动修复或覆盖文件。 |

## Runtime And Path Validation（Runtime 与路径验证）

| Term | 中文直译 | Definition |
|---|---|---|
| **runtime path** | 运行时路径 | Manifest 或 installed Skill 指向当前 `_speclite` runtime namespace 的路径。 |
| **runtime-path issue** | 运行时路径问题 | Runtime path 指向旧 namespace、错误目录或不可用位置时产生的 validation category。 |
| **menu target resolution** | 菜单目标解析 | 将 help/menu target 解析为唯一 installed self-contained Skill entry。 |
| **menu-target issue** | 菜单目标问题 | Menu target 缺失、重复、引用未知 `canonicalSkillId` 或不可激活时产生的 issue。 |
| **legacy namespace residue** | 遗留命名空间残留 | 旧 runtime 或旧 IDE entry 在当前安装中残留，并与 canonical identity 或 target 重叠。 |
| **legacy-namespace issue** | 遗留命名空间问题 | 对重复加载、菜单冲突或能力漂移风险的稳定诊断类别。 |
| **artifact path validation** | 产物路径验证 | 检查 configured artifact root 和默认输出路径可解析、可写且位于 project boundary 内。 |
| **artifact-path issue** | 产物路径问题 | Artifact root 缺失、越界、不可写或发生 symlink/path escape 时的稳定诊断类别。 |
| **verification command** | 验证命令 | Suggested next step 中用于复核人工处理结果的具体命令。 |

## CommandResult And ValidationIssue（命令结果与验证问题）

| Term | 中文直译 | Definition |
|---|---|---|
| **CommandResult envelope** | CommandResult 封装 | 核心命令统一使用的机器可读外层结构，承载 command、status、data、issues 和 nextActions。 |
| **ValidationIssue model** | 验证问题模型 | Issue 的统一结构，包含稳定 id、category、severity、affected path、impact、details 和 suggested next step。 |
| **issue ID** | 问题ID | 可供 automation 稳定匹配的具体问题标识，不能用任意自由文本代替。 |
| **issue category** | 问题类别 | 将问题归入 environment、manifest-schema、ide-mirror 等领域的稳定分类。 |
| **severity** | 严重级别 | `info`、`warning`、`error` 或 `critical`，用于表达影响程度和 exit-code 语义。 |
| **command ID** | 命令ID | 不随 shell、参数顺序或别名变化的稳定命令标识，例如 `update --repair` 对应 `update.repair`。 |
| **targetProject display ID** | 目标项目显示ID | 跨 checkout root 保持可识别的项目显示标识，不应被随意 slugify 或截断。 |
| **compact profile** | 紧凑型 Profile | 只保留快速判断所需摘要的 human-readable presentation。 |
| **evidence profile** | 证据型 Profile | 展示 issue、路径、影响和 next action，适合人工复核的 presentation。 |
| **structured profile** | 结构化 Profile | 面向 automation 的稳定 JSON presentation。 |
| **single reporter source** | 单一 Reporter 数据源 | 所有 presentation profile 共享同一 `CommandResult`、issue model 和 path normalization，command 不自行拼接第二套输出。 |

## Deterministic Validation（确定性验证）

| Term | 中文直译 | Definition |
|---|---|---|
| **deterministic validation** | 确定性验证 | 相同 installed state 重复运行时，返回相同语义内容、issue 集合和排序。 |
| **checked category** | 检查类别 | 本次 validate 实际执行的 validation category；reserved 但未执行的类别不能冒充已检查。 |
| **canonical category order** | 规范类别顺序 | `environment` 到 `update` 的固定 category 顺序，用于执行摘要和 issue sorting。 |
| **reserved category position** | 保留类别位置 | 为未来类别保留的排序位置；没有执行对应 rule 时只能显示 skipped 或 not checked。 |
| **issue counts** | 问题数量 | 按四种 severity 输出的固定计数字段，即使某类为 0 也不能省略。 |
| **checked target** | 检查目标 | 本次 validation 实际检查的 IDE target，并按 canonical target order 输出。 |
| **validated path** | 验证路径 | 本次检查过的规范化 project-relative path，集合按字典序输出。 |
| **deterministic issue sorting** | 确定性问题排序 | Issues 按 severity、category、normalized affected path 和 issue ID 排序，而不是按发现顺序。 |
| **local determinism** | 本地确定性 | Validate 不访问远程 source、不重新检查 freshness 或 provenance，因此相同本地输入可重复得到相同输出。 |
| **fixture assertion** | Fixture 断言 | 测试对 schema、字段、排序和稳定值进行精确比较的断言。 |
| **terminal-width adaptation** | 终端宽度自适应 | Human output 可以随宽度在 table 和 key-value block 间切换，但不能改变 structured JSON 或丢失关键信息。 |
| **text equivalent** | 文本等价表达 | 颜色、图标、符号或空状态必须有可复制、可被 screen reader 读取的文本表达。 |

## Common Distinctions（常见区别）

| Do Not Confuse | Difference |
|---|---|
| **status vs. validate** | Status 是轻量本地摘要；validate 执行 schema、mirror、path、integrity 和 category checks。 |
| **high-level health vs. CommandResult status** | 前者描述项目安装健康；后者描述命令本身是否成功执行。 |
| **empty issues vs. healthy install** | 空 issues 只说明当前命令没产生 issue，不代表未执行的检查全部通过。 |
| **package hash vs. file-level hash** | Package hash 比较完整 Skill package；file-level hash 比较单个 installer-owned file。 |
| **drift detection vs. repair** | Validate 发现并报告差异；repair 需要独立计划、授权和写入保护。 |
| **reserved category vs. checked category** | Reserved 只占据 canonical order；checked 表示实际执行了相应 rule。 |
| **human presentation vs. JSON contract** | Human layout 可随终端调整；JSON schema、字段和语义必须稳定。 |

## Related Documents（相关文档）

| Relationship | Document |
|---|---|
| 验证操作指南 | [`../../../how-to/validate-installation.md`](../../../how-to/validate-installation.md) |
| Validation issue 参考 | [`../../validation-issues.md`](../../validation-issues.md) |
| CommandResult 参考 | [`../../command-result-json.md`](../../command-result-json.md) |
| Runtime 边界术语 | [`../runtime-boundaries.md`](../runtime-boundaries.md) |
| 文件所有权术语 | [`../file-ownership.md`](../file-ownership.md) |
