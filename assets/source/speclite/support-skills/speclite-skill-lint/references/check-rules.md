# Skill Rules Contract（技能规则契约）

## Authority（来源与权威）

`references/rule-registry.json` 是 creator 与 lint 共享的唯一规则注册表；本文件解释执行方式，不复制规则矩阵。每条规则包含 `id`、`scope`、`source`、`severity`、`method`、`criteria`。规则数从注册表计算，不能硬编码报告分母。

官方依据于 2026-09-08 核验：
- [OpenAI Build skills](https://learn.chatgpt.com/docs/build-skills)：入口、发现、调用策略与可选配置。
- [OpenAI Plugin Build skills](https://developers.openai.com/plugins/build/skills)：工作流、资源、MCP 与测试。

官方页面未给出完整 parser schema；不要把未说明的字段推断为禁止或已支持。历史记录中的“Anthropic Skills 开放标准”及旧规则数量不再作为当前判定依据。OpenAI 文档引用 Agent Skills 开放标准，但本契约不声称覆盖其完整规范。

## Profiles（适用层次）

| Scope | 启用条件 | 约束来源 |
|---|---|---|
| base | 普通 workflow Skill | 官方基础结构与建议，以及明确标注的项目质量方法 |
| codex | 用户明确目标宿主为 Codex，或本次评估专门核验 Codex 适配 | Codex 已文档化能力 |
| speclite | 用户指定或确认目标属于 SpecLite source / 安装副本 | 项目治理约定 |
| ecosystem | SpecLite canonical ecosystem 路径 | module 与 selected-only 约定 |
| ecosystem-other | ecosystem category 为 other | Other admission evidence |

外部目录默认 base，不能仅因当前执行宿主是 Codex 就声称目标依赖 Codex。名称不足以证明安装副本身份；以 source path、安装 provenance 或用户指定为依据。SpecLite source 明确选择 speclite。Agent 包（speclite-agent-*、bmad-agent-* 或 customize.toml 的 [agent]）转交 agent 专属 Skill，不套用普通 workflow 项目规则。

## Fields and Mirrors（字段与镜像）

Ecosystem source 路由识别 `assets/source/speclite/ecosystems/<category>/<id>/<skill>/`：按注册表逐条消费 ecosystem 规则，包括 ECO-01 的路径校验；category=other 再消费 ECO-07 的准入证据。读取 module.yaml、module-help.csv、CHANGELOG.md 和 SKILL.en.md 核验相关契约。这是 authoring source 定位，不要求目标项目运行时拥有此路径。

通用必需字段是非空 name 与 description。使用已存在的安全 YAML parser 检查语法、重复键和类型；缺少 parser 证据就记 NOT_CHECKED，不用正则冒充完整 YAML 验证。合法折叠标量 `>` 不构成错误；字符串中的尖括号不证明注入。

SpecLite 保留 speclite- 命名空间、name 64 字符及 description 1024 字符预算、中文 canonical、英文 mirror、CHANGELOG、metadata.version / author、可选 catalog=speclite。README 禁止项和 5000 字符预算同样只属于 SpecLite。已知 metadata 扩展需说明消费方；未知字段核验宿主与来源，不根据封闭白名单删除它，也不凭未知判官方 Error。

Mirror 的身份字段（name、allowed-tools、license、metadata）一致；description 可翻译，但目标、触发与排除边界语义等价。SKILL.en.md 是维护镜像，不是 Codex 自动选择的第二个入口。不强制固定能力条数、三段式 description 或按引号统计触发词。

## Measurement（测量边界）

BODY-07 / BODY-08 消费 `check_skill_density.py` 的 schema_version=2 输出。识别中英文 Markdown / 方括号 Workflow，屏蔽 fenced code 示例，保留子标题内容。missing / ambiguous 返回 null，代表无法判断；应人工定位实际步骤再决定 N/A 或 NOT_CHECKED，不能报告密度 PASS。

`has_workflow_reference` 只是命名线索；需阅读实际 reference 确认存在、用途和路由。不能为了满足正则而给无关文件改名。references 内的模板讲解或示例可以保留；真正被复制、转换的输出模板放 assets。scripts 中代码样例不等于必须执行的脚本。

## Codex Configuration（Codex 配置）

按需使用 agents/openai.yaml；缺失文件本身不是通用违规。需要 MCP 时核验真实依赖声明；需要显示元数据或显式调用策略时按已文档化字段检查。`allowed-tools` 不是跨宿主权限隔离保证，也不能代替 dependencies.tools。只检查有官方依据的类型与依赖，不发明完整 schema 或伪造服务 URL。

## Findings（结论格式）

Error 表示所选 scope 内强制契约不满足；只有 source 对应官方明确要求时才称官方错误。Warning 表示质量建议或兼容性疑点。状态与严重级别分开：

| Status | 含义 |
|---|---|
| PASS | 已执行检查且满足 criteria，有证据 |
| FAIL | 已证实违反适用 Error 规则 |
| WARN | 已证实命中适用 Warning 规则 |
| N/A | scope 或规则条件不适用，注明理由 |
| NOT_CHECKED | 适用但缺工具、资料、执行记录或尚未检查 |

逐条报告 rule id、source、scope、severity、method、status、证据路径/行号、原因与修复建议。报告 registered_count、applicable_count、executed_count、各状态数量；applicable_count 排除 N/A，executed_count 仅计 PASS/FAIL/WARN。只要有 NOT_CHECKED，就不能声称全部通过。行为验证单独列出；静态 PASS 不等于宿主加载、触发或结果已验证。

## Maintenance（维护）

改变规则语义时同步 creator 指引、lint workflow、回归用例及两个包 CHANGELOG。保留旧 rule id 便于追溯，但以当前 contract_version 和 criteria 为准。发布说明需注明 density schema 变化及翻译语义策略；宿主支持随时间变化，更新规则时重新核验对应官方页面。
