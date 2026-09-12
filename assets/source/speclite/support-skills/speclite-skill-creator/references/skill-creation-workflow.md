# Skill Creation Workflow（技能创建流程）

## Overview（概述）

本文档承载 `speclite-skill-creator` 的详细创建流程。入口 SKILL.md 只保留阶段路由；执行创建时按本文档收集需求、规划结构、生成文件、运行 density gate 并总结交付。

本 workflow 只适用于普通 workflow 风格 Skill。若目标名称匹配 `speclite-agent-*` / `bmad-agent-*`，或源目录包含 `customize.toml` 的 `[agent]` 定制面，必须停止当前流程并改用 `speclite-agent-creator`。

## Requirement Collection（需求收集）

先复用用户已经提供的信息与授权；只对影响目标、输出或执行的缺失信息提问，一次最多 3 个。核心信息：
1. Skill 名称是什么？最终目录名自动转为以 `speclite-` 开头的 kebab-case。
2. Skill 要解决什么问题？核心功能是什么？
3. 什么时候触发？描述用户目标、相邻用途与排除边界；覆盖中文意图和关键英文术语，不按关键词数量设门槛。

如果答案表明这是 Agent 定义包，而不是一次性 workflow SOP，例如用户提到 persona、talk to、agent menu、`[agent]`、`bmad-agent-*` 或 `speclite-agent-*`，立即转交 `speclite-agent-creator`。

按需追问：
- 输入是什么：文件、参数、MCP 数据、其他 Skill 输出或用户上下文。
- 输出是什么：新文件、现有文件修改、分析结果或外部服务调用。
- 是否有明确执行步骤。
- 是否会推进 Story/Epic 状态、消费 Story 文件、检查 implementation anchor，或依赖前序 Epic 的实现证据。
- 归属分区是什么。已有参考：`core-skills/`、`sdlc-skills/<phase>/`、`support-skills/`、`ecosystems/<category>/<id>/`。
- 目标宿主是否包含 Codex，是否需要显示信息、仅显式调用或真实 MCP 依赖。
- 优先 instruction-only；有确定性处理需求时再添加 scripts，按需提供 references / assets。

生成前展示下列清单；信息与授权已齐备时直接继续，不新增确认 gate：
- Skill 名称和 `speclite-` kebab-case 目录名。
- 核心功能、触发场景和触发关键词。
- 输入、输出、SpecLite 分区或 SDLC phase。
- Ecosystem target 时的 `category`、`ecosystem_id`、module code、module-help row 和 selected-only install 边界。
- 工作流模式和推荐理由。
- 是否需要 Flow Gate guidance，以及 owning SPEC / equivalent implementation policy 的表达方式。
- 文件结构草案。
- 是否需要脚本、reference 或模板。

## Structure Planning（结构规划）

先读取 `references/spec-guide.md`，解析实际配套 lint 及共享 registry，确认 contract_version；按所选 scope 列出适用规则。需要选择执行模式时读取 `references/workflow-patterns.md`。

写入用户明确指定的 SpecLite canonical 源定义：
- Core skill：`assets/source/speclite/core-skills/<skill-name>/`。
- SDLC skill：`assets/source/speclite/sdlc-skills/<phase>/<skill-name>/`。
- Support skill：`assets/source/speclite/support-skills/<skill-name>/`。
- Ecosystem skill：`assets/source/speclite/ecosystems/<category>/<id>/<skill-name>/`。

Ecosystem target 只允许 `frontend`、`backend`、`other` 三类 category。`ecosystem_id` 必须是 lowercase kebab-case，并与 module root 和 `module.yaml` 一致；module code 必须是 `ecosystem-<category>-<id>`。生成前必须确认：

- `assets/source/speclite/ecosystems/<category>/<id>/module.yaml` 存在或本次会由维护者补齐，并声明 `module_kind: ecosystem`、`ecosystem_category`、`ecosystem_id`、`required_dependencies: [sdlc]`、`default_selected: false`、`required: false`。
- `module-help.csv` 会新增至少一条非 `_meta` row，覆盖 stable `skill` id、display name、phase、menu code / action、output location 和 artifact type。
- `SKILL.md`、`SKILL.en.md`、`CHANGELOG.md` 与 `metadata.version` 同步。
- 文档中的 runtime path 使用 `{project-root}`、`.claude/skills/<skill-name>`、`.agents/skills/<skill-name>` 和 `_speclite`，不得把 `assets/source/speclite/ecosystems/...` 写成目标项目 runtime dependency。
- 从 `sdlc-skills/` 迁移到 ecosystem module 时，记录 source path move、runtime behavior unchanged 和 package id 是否保持不变。

当 `category` 为 `other` 时，还必须确认 `ecosystem_id` 不是无边界命名。默认禁止 `misc`、`general`、`tools`；新增 id 必须记录 `why-not-frontend`、`why-not-backend`、目标项目事实、安装价值和 selected-only 验收。初始允许 examples 是 `npm-package`、`cli-tool`、`documentation-only`，对应 npm package、CLI tool、documentation-only project 三种稳定项目形态。

运行产物路径：
- 运行产物写入 `.specskills/output/<skill-name>/` 或更具体的 `.specskills/output/<domain>/<skill-name>/`。
- 过程分析文档写入 `.specskills/docs/analysis/<skill-name>/`。

需要外部 forge mirror 时，在 canonical 完成后仅同步用户授权的实际路径，单独报告来源和验证结果；不得使用固定个人机器路径或把 mirror 当作主源头。

每个 Skill 至少包含：
- SKILL.md：中文 canonical 入口。
- SKILL.en.md：英文 mirror 入口。
- CHANGELOG.md：版本记录。

例外：`speclite-agent-*` Agent 定义包不在本 workflow 中创建；其 `SKILL.en.md` 可选性由 `speclite-agent-creator` 管理。

按需添加：
- references/：低频详细资料、复杂工作流、规则矩阵、示例说明。
- scripts/：确定性操作脚本，必须有 docstring、参数验证、错误处理和退出码。
- assets/：执行中复制或转换的模板或资源。
- agents/openai.yaml：仅有 Codex 显示、调用策略或真实 MCP 依赖需求时添加。

禁止在 Skill 目录创建 README.md。

## Entry Generation（入口生成）

先读取 `references/templates.md`。按共享 registry 生成：

- 中文 SKILL.md 与英文 SKILL.en.md，正文与 description 可翻译，目标、触发、排除边界及执行语义等价。
- 身份字段 name、allowed-tools、license、metadata 保持相等；metadata.version / author 必填，catalog 可选且存在时为 speclite。
- 已核验扩展字段保留，不使用旧五字段白名单冒充官方限制；兼容性未知需记录，不编造支持保证。
- 输入输出、依赖缺失和停止条件明确；章节支持 Markdown 或方括号，中文标题为 English（中文）。
- 按需要生成 agents/openai.yaml；只填真实且已确认的配置，allowed-tools 不替代权限或 MCP 声明。

CHANGELOG.md：
- 初始版本为 1.0.0。
- 日期使用 YYYY-MM-DD。
- 从 Core Capabilities 提取初始功能清单。
- 如有已知限制，写入已知问题。

## Flow Gate Guidance（流程门控指引）

当新 Skill 属于 implementation workflow，或会推进 Story/Epic 状态、读取 Story 文件、检查 implementation anchor、消费前序 Epic 产物时，生成内容必须包含：
- `Contract Anchor`、`Functional Anchor`、`Evidence Anchor`、`Guidance Anchor` 的区分。
- `Contract -> Functional -> Evidence` 的检查顺序。
- 固定源码路径、fixture、schema 或 command 只有在 owning SPEC 明确要求时才是 hard gate。
- 如果固定路径只是 Story guidance 或历史实现形态，必须允许 equivalent implementation policy，并要求测试、fixture、snapshot 或 command evidence 支撑。
- 若 Skill 会推进状态，必须说明应消费或生成的 `speclite-flow-gate` report，以及允许继续的结果仅为 `PASS` 或 `PASS_EQUIVALENT`。

不得生成只写"某文件 must exist"却没有 owning SPEC 或 equivalent implementation policy 的 workflow 规则。

## Workflow Density Gate（Workflow 密度门禁）

生成草稿后运行 deterministic checker，不得用 LLM 估算：

```bash
python3 assets/source/speclite/support-skills/speclite-skill-lint/scripts/check_skill_density.py <skill-dir>
```

使用 spec-guide.md 解析的实际 `{lint-root}/scripts/check_skill_density.py`，不能优先选择版本滞后的安装副本。输出要求 schema_version=2。

脚本字段含义：
- `body_chars`：正文字符数。
- `workflow_status`：identified / missing / ambiguous；后两者不能判密度通过。
- `workflow_chars`：已识别 Workflow 的字符数；未识别或歧义为 null。
- `workflow_ratio`：Workflow 占正文比例。
- `near_body_limit`：正文是否达到 4500 字。
- `has_workflow_reference`：reference 文件名线索；还需核验文件存在、用途和加载路由。
- `triggered_density_warning`：`workflow_chars > 1500` 且 `workflow_ratio > 0.5`。

命中 `triggered_density_warning` 时：
- 创建 `references/<skill-name>-workflow.md` 或等价 workflow reference。
- 将详细步骤、命令清单、规则矩阵、长校验列表、示例和边界条件移入 reference。
- 入口 Workflow 只保留阶段摘要、何时读取 reference、关键停止条件。
- SKILL.md 和 SKILL.en.md 必须引用同一 workflow reference 路径。

## Validation（验证）

读取 `references/testing-guide.md`，运行配套 lint 的规则计划，逐条静态检查，并按授权执行真实宿主用例。记录未执行项，不将测试建议等同于通过。若 source 改动不含安装授权，安装消费验证记 NOT_CHECKED。

## Generation Metadata（生成标注）

维护来源可在 Notes 说明。同步本次授权的两个入口、references/scripts 与 CHANGELOG；安装和外部 mirror 单独记录。运行文档可附来源署名，但不得破坏 JSON、代码或用户固定输出格式。

## Completion（完成总结）

交付时输出：
- 完整文件树。
- 渐进式披露分层说明。
- 如何使用：说明实际目标宿主调用方式；Codex 通常自动发现变化，未显示时再重启。
- 契约版本、静态检查及行为用例的证据与未执行原因。
- 建议运行 `speclite-skill-lint`，并按需同步安装副本或 forge mirror。

## Error Handling（错误处理）

- 名称含大写、空格或下划线：转换为以 `speclite-` 开头的 kebab-case 并告知用户。
- description 超过项目 1024 字符预算：保留目标与边界并精简，避免机械堆叠能力。
- 正文超过 5000 字符：拆分低频内容到 references/。
- `git config user.name` 读取失败：请求用户提供 author。
- 安装根不存在：只报告未发现，不创建新的安装副本。
