# Skill Specification Guide（技能规范指南）

## Shared Contract（共享契约）

本 creator 专用于 SpecLite source authoring。生成前读取配套 lint 的 `references/rule-registry.json` 与 `references/check-rules.md`；不维护第二份规则白名单。当前需要 contract_version=1.0.0，creator 2.x 与 lint 3.x 配套。

从本 reference 所在目录出发，canonical source 的 [共享注册表](../../speclite-skill-lint/references/rule-registry.json) 与 [规则解释](../../speclite-skill-lint/references/check-rules.md) 位于同级 support package。执行根 `{lint-root}` 是该配套 package 的真实路径，不是目标项目 CWD。安装环境先定位实际配套 Skill，再检查契约版本；不得退回读取缺少 registry 的旧安装副本。找不到依赖时可整理需求，但不能声称生成/验证已按当前契约完成。

根据目标选择 base + speclite；明确支持 Codex 时再启用 codex；ecosystem 路径启用相应规则。`scripts/list_rules.py` 生成检查计划并记录 registry hash；其成功退出仅代表清单生成成功。

## Official Baseline（官方依据）

2026-09-08 已核验 [OpenAI Build skills](https://learn.chatgpt.com/docs/build-skills) 与 [Plugin Build skills](https://developers.openai.com/plugins/build/skills)。前者说明入口、发现与可选配置，后者说明资源组织、依赖与行为测试。规则更新时重新核验受影响页面，不将网页未声明的限制写成官方强制项。

基础结构为 SKILL.md（name、description、正文），辅以按需资源。SpecLite 的双语、CHANGELOG、命名空间及字符预算来自项目规则。它们不能用于判外部 Skill 官方不合规。

## Progressive Disclosure（渐进式披露）

description 前置用户目标与关键触发信息；正文保留执行入口、输入输出和停止条件。详细规则与示例放 references，供复制/转换的模板放 assets，需要确定性处理的代码放 scripts。入口或流程明确每个关键资源何时读取，不一次加载整个包。

在 references 中保留模板写法指南是合理的；不要以代码围栏判定资源必须移动。正文预算与 Workflow density 是 SpecLite 质量策略，不是官方加载器限制。

## Metadata and Language（元数据与语言）

- 生成非空 name、description；SpecLite 名称使用 speclite- kebab-case，与目录一致。
- metadata.version / author 必填，保留原作者；catalog 可选且存在时为 speclite。版本与 CHANGELOG 同步。
- identity 字段（name、allowed-tools、license、metadata）在 mirror 间相等；description 可翻译，目标、触发和排除边界等价。
- 中文 canonical 使用 English（中文）标题；英文维护镜像不构成 Codex 自动选择的第二入口。
- 不强制三段式或固定能力条数。中文入口覆盖中文意图与关键英文术语，英文 mirror 可自然翻译。
- 对 compatibility、metadata 扩展或其他宿主字段先核实消费方；不能凭旧五字段白名单禁止，也不能未经核验宣称支持。
- 用安全 YAML parser 检查；合法 `>` 折叠标量与字符串尖括号不单独判错。模板中的占位符须在生成时替换。

## Codex Configuration（Codex 配置）

有显示、调用策略或 MCP 依赖需求时才生成 agents/openai.yaml。模板见 templates.md；需要填入真实服务信息时查用户提供的配置或已验证宿主资料。无实际依赖时不复制示例 MCP。依赖信息缺失时不编造 URL 或 service id。

interface 的已文档化字段包括 display_name、short_description、icon_small、icon_large、brand_color、default_prompt。policy.allow_implicit_invocation 默认为 true；需要仅显式调用时设 false。dependencies.tools 声明真实 MCP 依赖。图标路径指向实际资源；未知字段标明待核验，不发明宿主全量 schema。

allowed-tools 可以保留已有目标宿主工具约定，但不得作为通用权限隔离保证或依赖注册机制。先使用指令和现有工具；只有确定性计算、文件处理等需求才生成脚本，不为所有 API 集成强制生成脚本。

## Discovery and Distribution（发现与分发）

SpecLite source 是维护真源。Codex repo/user 本地发现使用 .agents/skills；多个同名 Skill 不自动合并。变更通常自动发现，未显示时再重启。可复用分发可选 plugin，但本 creator 不自动把 authoring 工作扩大为发布或安装。

安装与 source 变更分开验证；只同步本次授权的实际位置，不凭空创建 legacy .codex/skills，也不把个人机器绝对路径写成所有使用者的运行依赖。

## Implementation Workflows（实现流程）

消费 Story、推进状态或检查实现锚点时，保留 Contract / Functional / Evidence / Guidance Anchor 分类、owning SPEC 和 equivalent implementation policy。固定路径仅在 owning SPEC 明确要求时为 hard gate；状态推进需明确 Flow Gate report 消费与允许结果。SpecLite ecosystem 的 module、help、selected-only 和 other admission 不因 Codex 适配而放宽。
