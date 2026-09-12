# Changelog

本文件记录 `speclite-skill-lint` 技能的版本变更历史。

格式基于 [Keep a Changelog](https://keepachangelog.com/)，版本号遵循 [Semantic Versioning](https://semver.org/)。

## [3.0.0] - 2026-09-08

### Added（新增）

- 新增唯一 rule-registry、只读 list_rules.py 待检查清单及按 scope 计算的规则数量；保留全部旧 rule id，覆盖 ECO-07。
- 新增 Codex 可选配置、MCP 依赖、调用/发现策略、资源路由与真实行为证据规则；source / scope / severity / method 明确可追溯。
- 新增脚本回归覆盖：中英文标题、代码示例、frontmatter 分隔符、未识别/歧义、外部 profile 及 ecosystem 适用性。

### Changed（修改）

- 项目约定不再统一称为官方硬性要求；按资源用途和触发语义检查，英文 description 允许等价翻译。
- 报告使用 PASS / FAIL / WARN / N/A / NOT_CHECKED；清单生成与静态检查不代表真实行为通过。
- 修正历史入口/流程/清单的数量漂移；当前数量从注册表生成，不采用历史写死的分母。

### Compatibility（兼容性）

- density 输出 schema_version=2：Workflow missing / ambiguous 时 workflow_chars、workflow_ratio、triggered_density_warning 为 null，新增 workflow_status 与 workflow_section_count。消费者必须检查识别状态，不能把 null 当作零或 PASS。
- 已识别 Workflow 的字段及 warning 时 exit 0 保持兼容；缺少 SKILL.md、读取失败或 frontmatter 未结束返回非零。
- creator 2.x 与本版本共用 contract_version=1.0.0；SpecLite 项目契约要求的 mirror / changelog / version / author 缺失统一为 Error，外部 base profile 不套用这些规则。

## [2.8.1] - 2026-08-25

### Fixed（修复）

- `check_skill_density.py` 同时识别 `[Workflow（执行流程）]` 与 Markdown `## Workflow（工作流）` / `## Workflow` 章节。
- Markdown 模式按同级或更高级标题结束 Workflow，避免把 `### Step` 子标题误判为下一章节。

## [2.8.0] - 2026-07-06

### Added

- 新增 Ecosystem Source 检查规则 ECO-01 ~ ECO-06，覆盖 ecosystem path classification、category enum、`ecosystem_id`、module code、`module-help.csv` row、version / changelog / mirror sync 和 runtime path boundary。
- 将通用 workflow Skill 规则总数从 36 条扩展到 42 条，ecosystem package 仍继承 YAML、description、density、fixed path 和 `speclite-` 前缀规则。

## [2.7.0] - 2026-06-11

### Changed

- 新增 Agent 定义包路由规则：遇到 `speclite-agent-*` 或 `[agent]` 定制面时，交给 `speclite-agent-lint`，避免 workflow-only 规则误报。
- 明确 `speclite-agent-*` 的 `SKILL.en.md` 是可选镜像，由 Agent 专属 lint 规则按存在性检查。

## [2.6.0] - 2026-06-05

### Changed

- 将 SpecLite canonical 和安装副本的命名检查调整为必须使用 `speclite-` 前缀。
- 生成标注改为“本 Skill 由 speclite-skill-creator 自动生成”。

## [2.5.0] - 2026-05-27

### Added

- 新增 BODY-10 Config reference classification rule：配置状引用必须归类为本地定义、本地占位、runtime config、artifact path、workflow 变量、模板占位、schema 字段、workflow 参数、外部项目引用或 contract-defined 引用。
- 规则总数从 35 条增加到 36 条。

## [2.4.0] - 2026-05-27

### Added

- 新增 BODY-09 Fixed path hard gate rule：当正文出现 `must exist` 与具体源码路径组合时，必须同时说明 owning SPEC 或 equivalent implementation policy。
- 规则总数从 34 条增加到 35 条。

## [2.3.0] - 2026-05-26

### Added

- 新增只读脚本 `scripts/check_skill_density.py`，用于统计 SKILL.md 与 SKILL.en.md 的正文长度、Workflow 长度、占比和 workflow reference 引用情况。
- 新增 BODY-07 Workflow density 与 BODY-08 Workflow extraction 两条规则，规则总数从 32 条增加到 34 条。
- 新增 `references/lint-workflow.md`，承载完整扫描流程，降低入口 Workflow 体积。
- 新增 metadata 字段契约说明，覆盖 `metadata.version`、`metadata.author` 和可选 `metadata.catalog` 的检查边界。

### Changed

- allowed-tools 增加 Bash，仅用于运行只读 density checker。
- SKILL.md 与 SKILL.en.md 的 Workflow 改为阶段路由，详细扫描步骤转入 reference。
- Workflow 入口明确“完整步骤见 `references/lint-workflow.md`”，执行细则以 reference 为准。

## [2.2.0] - 2026-05-25

### Added

- 新增 `SKILL.en.md` mirror 检查规则：文件存在、版本一致、YAML frontmatter 对齐、英文章节齐备和引用路径同步。
- 新增中文 canonical 语言规则检查：SKILL.md 章节标题使用 English（中文）形式，正文内容使用中文，技术标识使用英文。
- 新增 `skill-tooling` catalog，用于归类 Skill 创建、检查、升级工具链。

### Changed

- 规则总数从 28 条增加到 32 条，检查维度从 7 个扩展为 8 个。
- 必需章节检查从旧的中文标题更新为 `[Overview（技能说明）]` 等 English（中文）标题。

## [2.1.0] - 2026-04-09

### Added

- 新增 VER-04 规则：检查 `metadata.author` 字段是否存在且非空（Warning 级别）
- references/check-rules.md 新增 VER-04 详细说明，包含检查标准和缺失时的修复建议

### Changed

- 规则总数从 27 条增加到 28 条
- 版本一致性检查维度从 3 条扩展为 4 条（VER-01 ~ VER-04）

## [2.0.0] - 2026-04-08

### Changed

- Skill 更名：`skill-lint` → `skills-lint`，与项目命名规范（skills-creator 等）保持一致
- YAML `name` 字段由 `skill-lint` 改为 `skills-lint`
- description 中新增触发词 `'skills-lint'`，同时保留旧触发词（`'skill lint'`、`'lint skill'` 等）向后兼容
- 正文中对 `skill-upgrade` 的引用更新为 `skills-upgrade`

## [1.1.0] - 2026-04-08

### Added

- 新增文件分类合理性检查维度（CLASS-01 ~ CLASS-03）：检测模板文件是否误放 references/、脚本文件是否误放 references/ 或 assets/、纯知识文档是否误放 assets/
- 新增 BODY-05 核心能力条数检查：[核心能力] 章节内 `- **` 开头的行数应在 4-8 范围内
- 新增 VER-03 CHANGELOG 日期格式检查：版本标题中的日期必须匹配 YYYY-MM-DD 格式
- 模糊表述检测词列表新增"必要时"

### Changed

- 检查维度从 6 个扩展为 7 个，规则总数从 22 条增加到 27 条
- 检查报告总结行从 X/22 更新为 X/27

## [1.0.0] - 2026-03-25

### 初始版本

- YAML Frontmatter 验证：name 格式、description 长度、顶级属性合法性、安全检查
- description 质量分析：三段式结构验证、中英文双语触发词覆盖、触发词具体性
- 文件结构合规检查：SKILL.md 大写、目录名 kebab-case、无 README.md、CHANGELOG.md 存在
- 版本一致性检查：SKILL.md metadata.version 与 CHANGELOG.md 最新版本号一致
- 正文约束检查：字数限制、必需章节、引用路径、无模糊表述
- 命名规范检查：references/scripts/assets 文件命名格式
- 结构化表格报告输出，区分 Error 和 Warning

### 已知问题

- 暂无

---

版本变更类型说明：
- **Added**：新增功能
- **Changed**：已有功能的变更
- **Fixed**：缺陷修复
- **Removed**：移除的功能

后续版本更新时，在最新版本记录之前插入新版本记录，并同步更新 SKILL.md 中的 metadata.version。
已知问题修复后，用删除线标注并注明修复版本，如：
- ~~**问题描述**~~ → 已在 vX.Y.Z 修复
