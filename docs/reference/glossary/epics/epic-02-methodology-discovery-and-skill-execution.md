# Epic 2: Methodology Discovery And Skill Execution Glossary（方法论发现与 Skill 执行术语表）

本文解释 Epic 2「Methodology Discovery And Skill Execution」中的英文组合术语，帮助 AI IDE 使用者和工具链维护者理解 Skill 如何被发现、映射、激活、读取配置并生成带 metadata 的 Workflow artifacts。

> Note: 本文解释的是 Epic 2 规划文档中的术语语义，不表示相应 Story 已经实施或通过验证。字段、路径、Skill ID 和 schema 名称保留英文。

## Methodology Discovery（方法论发现）

| Term | 中文直译 | Definition |
|---|---|---|
| **methodology discovery** | 方法论发现 | AI IDE 或用户通过 installed metadata 找到 SpecLite 阶段、Skill、入口和激活目标的过程，无需手工搜索 canonical source。 |
| **discovery metadata** | 发现元数据 | 描述 Skill identity、module、phase、entry、target 和可选 artifact contract 的结构化 installed data。 |
| **canonical Skill** | 规范Skill | 由 canonical source 定义身份与内容的 Skill；IDE adapter 只能映射，不能重新命名它。 |
| **canonicalSkillId** | 规范SkillID | 跨 source、manifest、IDE target 和 activation 保持不变的 Skill 唯一标识。 |
| **moduleId** | 模块ID | 表示 Skill 所属 SpecLite module 的稳定标识。 |
| **source package path** | 来源包路径 | Canonical Skill package 在 source tree 中的路径，用于追踪 installed entry 的来源。 |
| **installed target** | 安装目标 | 已实际获得该 canonical package 投影的 IDE target。 |
| **phase ID** | 阶段ID | 研发阶段的稳定机器标识，供 coverage、help 和 automation 关联。 |
| **phase label** | 阶段标签 | 面向人展示的阶段名称，可以本地化，但不能替代稳定 `phaseId`。 |
| **entry label** | 入口标签 | Help 或 IDE 菜单中展示给用户的 Skill 入口名称。 |
| **activation target** | 激活目标 | IDE 选择 entry 后实际加载的 `SKILL.md` 或等价执行入口。 |
| **help index** | 帮助索引 | 汇总 phase、entry label、canonicalSkillId 和 activation target 的 installed discovery index。 |
| **artifact contract summary** | 产物契约摘要 | Discovery metadata 中对 artifact type、默认路径、`workflowType`、`sourceSkill` 和 `generatedAt` 的可选简要投影。 |

## IDE Entry Mapping（IDE 入口映射）

| Term | 中文直译 | Definition |
|---|---|---|
| **IDE Skill entry** | IDE Skill入口 | AI IDE 能直接发现和加载的 installed Skill package 入口。 |
| **self-contained Skill entry** | 自包含Skill入口 | 包含运行所需 Skill 内容、无需回到 canonical source 查找额外提示词的完整安装入口。 |
| **IDE execution plane** | IDE执行平面 | `.claude/skills`、`.agents/skills` 等由目标 IDE 实际加载 Skill 的文件空间。 |
| **IDE adapter** | IDE适配器 | 把 canonical Skill package 映射到特定 target directory，并报告映射结果的组件。 |
| **target ID** | 目标ID | IDE adapter registry 中表示目标平台的稳定标识，例如 `claude` 或 `agents`。 |
| **mapped status** | 映射状态 | Adapter 已成功生成可激活 entry 的状态。 |
| **unsupported status** | 不支持状态 | Target 不支持当前 entry type 或 capability，且未生成伪造入口的状态。 |
| **failed status** | 失败状态 | Adapter 本应支持映射，但执行未成功的状态。 |
| **adapter metadata** | 适配器元数据 | 描述 target、entry path、activation target、mapping status 和 target-specific 行为的数据。 |
| **canonical package hash parity** | 规范包哈希一致性 | 同一 canonical Skill 投影到多个 IDE targets 后，package 内容 hash 必须一致。 |
| **target-specific difference** | 目标特定差异 | 仅由 IDE target 导致的目录或 adapter metadata 差异，不能改变 canonical Skill 内容。 |
| **command pointer artifact** | 命令指针产物 | 某些 IDE 用来指向可执行命令的 target-specific artifact；Epic 2 的 MVP 不生成此类文件。 |
| **command pointer behavior** | 命令指针行为 | Adapter registry 对 command pointer 支持状态的声明；MVP 只允许 `none` 或 `unsupported`。 |

## Phase Capability Coverage（阶段能力覆盖）

| Term | 中文直译 | Definition |
|---|---|---|
| **phase capability coverage** | 阶段能力覆盖 | 检查 SPEC、方案评审、Story 规划、实现、测试和审查等关键阶段是否有 mapped Skill entry。 |
| **minimum phase coverage matrix** | 最小阶段覆盖率矩阵 | 以稳定字段列出每个关键阶段、canonical Skill、entry path、activation target 和 target status 的最小覆盖表。 |
| **mapped Skill entry** | 已映射 Skill 入口 | 已安装并由 IDE adapter 成功暴露到某个阶段和 target 的 Skill 入口。 |
| **uncovered phase** | 未覆盖阶段 | 没有 mapped Skill entry 的关键阶段，必须如实显示未覆盖或 unsupported。 |
| **installed but unexposed Skill** | 已安装但未暴露技能 | Skill 已存在于 skill index 和 IDE mirror，但没有对应 phase/help row；它不能被误报为缺失 installed entry。 |
| **alias-only identity** | 仅别名身份 | 只依赖别名、却没有对应 canonical Skill identity 的伪入口；它不能用于证明阶段覆盖。 |
| **IDE-specific identity** | IDE特定身份 | Adapter 自行创造、只在单个 IDE 中存在的 Skill 标识；Epic 2 禁止用它替代 `canonicalSkillId`。 |
| **canonical target order** | 规范目标顺序 | Manifest 或 adapter registry 定义的稳定 IDE target 顺序，输出不能依赖 glob 或异步完成顺序。 |

## Skill Activation（Skill 激活）

| Term | 中文直译 | Definition |
|---|---|---|
| **Skill activation** | 技能激活 | 用户选择 mapped entry 后，IDE 加载 self-contained package 并开始执行 Skill activation protocol 的过程。 |
| **activation protocol** | 激活协议 | `SKILL.md` 定义的启动步骤，例如解析 customization、加载事实、读取配置、问候和菜单 dispatch。 |
| **activation entrypoint** | 激活入口 | Activation target 指向的实际入口文件，通常是 installed package 内的 `SKILL.md`。 |
| **source lookup independence** | 来源查找独立性 | Installed Skill 可以独立执行，不要求用户定位 source package 或复制 canonical prompt。 |
| **menu target** | 菜单目标 | Help/menu metadata 指向某个可激活 Skill entry 的引用，必须解析为唯一 installed entry。 |

## Runtime Config Resolution（Runtime 配置解析）

| Term | 中文直译 | Definition |
|---|---|---|
| **runtime config** | 运行时配置 | Installed Skill 在执行时读取的项目名称、语言、输出路径和 module 设置。 |
| **config resolve** | 配置解析 | `speclite resolve config` 按固定 precedence 合并项目配置层并输出 JSON 的过程。 |
| **configuration precedence** | 配置优先级 | Project config 的覆盖顺序：installer base → installer user → team custom → user custom，后层覆盖前层。 |
| **resolved config** | 解析后配置 | 应用全部有效配置层后得到、供 Skill 实际使用的最终配置对象。 |
| **dotted key** | 点分键 | 使用点号访问嵌套配置的查询表达，例如 `agent.menu`；原字符串在多 key 输出中保持为字段名。 |
| **optional TOML layer** | 可选TOML层 | 可以缺失的配置层；缺失时按 `{}` 处理，读取或解析失败时通常产生 warning diagnostic。 |
| **required TOML layer** | 必需TOML层 | 安全解析必须依赖的配置层；读取或解析失败会阻止 resolve 成功。 |
| **stdout contract** | 标准输出契约 | Resolve 成功时 stdout 只承载解析结果 JSON 的约定。 |
| **stderr diagnostic** | 标准错误诊断 | Optional layer 等非结果信息使用 `ValidationIssue` 形状写入 stderr，避免污染 stdout JSON。 |
| **strict missing behavior** | 严格缺失行为 | 对缺失 key 返回错误的可选严格模式；Epic 2 默认不存在该模式，单个缺失 key 返回 `{}` 或被省略。 |

## Customization Resolution（Customization 解析）

| Term | 中文直译 | Definition |
|---|---|---|
| **customization resolve** | Customization 解析 | `speclite resolve customization` 合并 Skill defaults、team custom 和 user custom 的过程。 |
| **Skill defaults** | 技能默认值 | Skill package 内 `customize.toml` 提供的基础 persona、menu 或 Workflow 设置。 |
| **team custom** | 团队自定义 | 项目级 `{skill}.toml` 覆盖，对团队成员共享。 |
| **user custom** | 用户自定义 | 项目级 `{skill}.user.toml` 覆盖，只表达个人差异。 |
| **customization lookup key** | Customization 查找键 | 用于查找 team/user override 文件的 Skill directory basename。 |
| **deep merge** | 深层合并 | 对普通 TOML tables 递归合并，override 中的 scalar 替换 base 值。 |
| **keyed merge** | 按键合并 | 当数组所有元素都是 table 且共享 `code` 或 `id` 时，按该 key 匹配元素的合并方式。 |
| **whole-item replacement** | 整项替换 | Keyed merge 命中同一 `code` 或 `id` 后，以 override item 整项替换 base item，而不是继续对 item 做 deep merge。 |

## Workflow Artifact Output（Workflow 产物输出）

| Term | 中文直译 | Definition |
|---|---|---|
| **Workflow artifact output** | 工作流产物输出 | Activated Workflow 按 resolved config 把 planning、implementation 或 review artifact 写入约定位置的行为。 |
| **artifact output path** | 产物输出路径 | `_speclite-output` 或项目配置指定的 Workflow artifact 位置，并以 project-relative POSIX path 记录。 |
| **artifact metadata** | 产物元数据 | 说明 artifact 由哪个 Workflow 和 Skill 在何时生成的稳定来源字段。 |
| **workflowType** | 工作流类型 | Artifact metadata 中表示生成流程类型的非空稳定字符串。 |
| **sourceSkill** | 来源 Skill | Artifact metadata 中表示 producer 的 canonical Skill ID。 |
| **generatedAt** | 生成时间 | Artifact metadata 中使用 ISO 8601 string 表示的生成时间。Fixture 比较可以 normalize 或 exclude 具体值，但不能省略字段。 |
| **YAML frontmatter** | YAML 前置元数据 | Markdown artifact 文件开头由 `---` 包围的 metadata block，用于保存 `workflowType`、`sourceSkill` 和 `generatedAt`。 |
| **sidecar metadata** | 伴随元数据 | 非 Markdown file artifact 使用的同目录 `<artifact-filename>.metadata.json`，与本体一起属于 workflow-owned。 |
| **directory metadata** | 目录元数据 | Directory artifact 内的 `metadata.json`，用于描述整个目录产物的来源。 |
| **artifact contract validation** | 产物契约验证 | Validator 检查 metadata 字段、值域和路径是否符合 owning contract 的过程。 |
| **artifact contract violation** | 产物契约违规 | 缺少 required metadata、路径越界或字段值不合法等契约错误。 |
| **narrative quality boundary** | 叙述质量边界 | MVP validation 只检查 metadata 与路径契约，不判断文档叙事质量、人工结论或内容是否足够深入。 |

## Determinism And Ownership（确定性与所有权）

| Term | 中文直译 | Definition |
|---|---|---|
| **deterministic discovery output** | 确定性发现输出 | 相同 installed state 始终产生相同字段、target order、hash 和路径顺序的 discovery 数据。 |
| **filesystem traversal order** | 文件系统遍历顺序 | 文件系统返回目录项的偶然顺序，不能用作 index 或 coverage 的稳定排序依据。 |
| **workflow-owned artifact** | Workflow 所有产物 | 由 Workflow 和项目维护者管理的产物；installer、update 和 repair 不能静默覆盖。 |
| **metadata normalization** | 元数据规范化 | Fixture 比较时对允许变化的 `generatedAt` 等值进行统一处理，同时保留字段存在性和格式检查。 |
| **single artifact contract** | 单一产物契约 | PRD、Architecture、manifest 和 `CommandResult` 都引用同一 owning contract，而不是分别定义 metadata 语义。 |

## Common Distinctions（常见区别）

| Do Not Confuse | Difference |
|---|---|
| **discovery metadata vs. Skill package** | Discovery metadata 告诉 IDE 去哪里找到什么；Skill package 承载实际执行内容。 |
| **canonicalSkillId vs. entry label** | `canonicalSkillId` 是稳定机器身份；entry label 是面向人的展示名称。 |
| **mapped vs. unsupported vs. failed** | Mapped 表示成功映射；unsupported 表示能力不受支持；failed 表示本应支持但执行失败。 |
| **installed Skill vs. phase-covered Skill** | Installed 表示 package 已投影；phase-covered 还要求存在有效 phase/help mapping。 |
| **config resolve vs. customization resolve** | Config resolve 合并项目运行配置；customization resolve 合并特定 Skill 的 persona、menu 或 Workflow 设置。 |
| **YAML frontmatter vs. sidecar metadata** | Markdown 在文件头保存 metadata；其他文件或目录使用独立 JSON metadata。 |
| **artifact contract validation vs. content review** | 前者验证字段和路径；后者评估内容质量与业务结论，不属于 Epic 2 的 MVP validator 范围。 |

## Related Documents（相关文档）

| Relationship | Document |
|---|---|
| IDE discovery 深入术语 | [`ide-discovery.md`](ide-discovery.md) |
| Skill 使用指南 | [`../../how-to/use-installed-skills.md`](../../how-to/use-installed-skills.md) |
| 配置与 customization 参考 | [`../config-and-customization.md`](../config-and-customization.md) |
| Workflow artifact 基础术语 | [`workflow-artifact.md`](workflow-artifact.md) |
| Runtime 边界解释 | [`../../explanation/runtime-boundaries.md`](../../explanation/runtime-boundaries.md) |
