# Speclite Agent Lint 规则

本规则集在通用 Skill 规范和 Speclite runtime 规则基础上，增加 Agent 定义向目录的专属检查。执行时必须只读。

## 1. 通用 Skill 规范

### YML：frontmatter

- `name` 必须 kebab-case，且与目录名一致。
- `description` 不超过 1024 字符，包含 Agent 功能、触发条件、核心能力。
- `description` 至少包含 2 个中文触发词和 2 个英文触发词。
- YAML 顶级字段只允许：`name`、`description`、`license`、`allowed-tools`、`metadata`。
- YAML 中不得出现尖括号、代码执行逻辑或 shell 片段。
- `metadata.catalog` 对 Speclite Agent 应为 `speclite`。

### FILE：文件结构

- 必须存在 `SKILL.md` 和 `CHANGELOG.md`。
- Agent 必须存在 `customize.toml`，且包含 `[agent]`。
- 根目录 Markdown 白名单：`SKILL.md`、`SKILL.en.md`、`CHANGELOG.md`。
- Agent 包不强制存在 `SKILL.en.md`；如存在，按双语入口一致性规则检查。
- 禁止 `README.md`。
- 规约型文档和本地 prompt 必须放 `references/`。
- 模板骨架必须放 `assets/`。
- 可执行脚本必须放 `scripts/`。

### VER：版本

- `SKILL.md` 的 `metadata.version` 必须与 `CHANGELOG.md` 最新版本一致。
- `SKILL.en.md` 如存在，版本必须与 `SKILL.md` 一致。
- `CHANGELOG.md` 最新版本日期应为 `YYYY-MM-DD`。
- `metadata.author` 必须存在且非空。

### BODY：正文

- 正文建议不超过 5000 字，超过时应拆入 `references/`。
- 必须包含 `[Overview（技能说明）]`、`[Core Capabilities（核心能力）]`、`[Workflow（执行流程）]`、`[Notes（注意事项）]`。历史迁移包如仍使用 `[技能说明]` 等旧标题，应列为 Minor 并建议更新。
- `[核心能力]` 推荐 4-8 条。
- 所有引用的 `references/`、`assets/`、`scripts/` 路径必须存在。
- 扫描模糊词：`妥善验证`、`适当处理`、`酌情考虑`、`合理安排`、`必要时`。

## 2. Agent 定制块

`customize.toml` 必须满足：

- 仅承载 `[agent]` 默认定制面，不应包含 `[workflow]` 作为主定制面。
- 必须有 `name`、`title`、`role`、`identity`、`communication_style`。
- `icon` 建议存在；如缺失列为 Minor。
- `principles` 必须是非空数组。
- `persistent_facts` 必须是数组；允许为空。
- `activation_steps_prepend` 和 `activation_steps_append` 必须是数组；允许为空。
- `[[agent.menu]]` 如存在，每项必须包含唯一 `code` 和非空 `description`。
- 每个菜单项必须且只能包含 `skill` 或 `prompt` 之一。

严重度：

- Critical：缺失 `[agent]` 或 `customize.toml` 不存在。
- Major：关键 persona 字段缺失、菜单项同时包含或同时缺失 `skill` 和 `prompt`。
- Minor：icon 缺失、description 过短、字段顺序或注释不一致。

## 3. Agent 激活流程

入口或权威 `references/activation.md` 必须覆盖：

- 解析 Agent block：`resolve_customization.py --key agent`。
- fallback 三层：`{skill-root}/customize.toml`、`{speclite-runtime-root}/custom/{skill-name}.toml`、`{speclite-runtime-root}/custom/{skill-name}.user.toml`。
- 执行 `agent.activation_steps_prepend`。
- 采用 persona，并叠加 `role`、`identity`、`communication_style`、`principles`。
- 加载 `agent.persistent_facts`。
- 读取 `{project-root}/_speclite/config.toml` 并解析核心字段。
- 问候用户并使用 `agent.icon`。
- 执行 `agent.activation_steps_append`。
- 根据初始意图直接分发或渲染 `agent.menu`。
- 直到用户 dismiss 前持续保持 persona、persistent facts、icon 和 communication language。

## 4. Speclite 运行模型

必须定义或正确使用：

- `{skill-root}`：安装后的单个 Agent Skill 目录。
- `{project-root}`：目标项目工作目录。
- `{speclite-runtime-root}`：`{project-root}/_speclite`。
- `{skill-name}`：Agent Skill 目录 basename。

禁止：

- 将源码目录 `assets/source/speclite/scripts`、`assets/source/speclite/custom`、`forge/speclite/scripts`、`forge/speclite/custom` 或其他源码仓库目录写成运行时依赖。
- 将 `{skill-root}/..` 推导为 Speclite runtime root。
- 在当前执行规约中依赖 `_bmad`、`config.yaml` 或 `/bmad:*`。

严重度：

- Critical：入口或权威 reference 仍要求读取 `_bmad`、`config.yaml`、`/bmad:*`。
- Major：入口或权威 reference 同时混用 BMAD 和 Speclite 运行模型。
- Minor：CHANGELOG 历史描述提到 BMAD 来源，可保留但不应作为当前规约。

## 5. 配置来源

若 Agent 读取项目配置，必须满足：

- 运行配置来源是 `{project-root}/_speclite/config.toml`。
- `config.toml.example` 只用于字段结构参考，不作为 runtime fallback。
- 缺失配置或关键字段为空时应 HALT 或清晰询问用户补充。
- 字段应归入 `[core]` 与 `[modules.sdlc]`。

推荐字段：

```toml
[core]
project_name = ""
user_name = ""
communication_language = "Chinese"
document_output_language = "Chinese"
user_skill_level = "intermediate"
output_folder = "{project-root}/_speclite-output"

[modules.sdlc]
planning_artifacts = "{project-root}/_speclite-output/planning-artifacts"
implementation_artifacts = "{project-root}/_speclite-output/implementation-artifacts"
project_knowledge = "{project-root}/docs"
```

## 6. 菜单和 prompt 引用

检查 `[[agent.menu]]`：

- `code` 在同一 Agent 内必须唯一。
- `description` 必须描述用户意图，不应只是目标文件名。
- `skill` 值不得保留 `bmad-*`，除非报告明确说明目标仍未迁移且当前 Agent 尚不可发布。
- `skill` 目标应能在 `assets/source/speclite/**/<skill>/SKILL.md`、目标项目已安装技能清单或调用环境已安装技能清单中找到。
- `prompt` 中的 `{skill-root}/...` 路径必须指向存在文件。
- 根目录旧 prompt 路径迁移到 `references/` 后，prompt 文本必须同步更新。

严重度：

- Critical：默认分发路径指向不存在的必需目标。
- Major：菜单项目标不存在、仍指向 `bmad-*`、prompt 文件缺失。
- Minor：菜单描述不清晰、code 命名不一致。

## 7. 双语入口一致性

Agent 包不强制存在 `SKILL.en.md`。support skill 自身仍应遵守通用 support-skills 的双语入口要求。

若存在 `SKILL.en.md`：

- `name`、`allowed-tools`、`metadata.version`、`metadata.catalog` 与中文入口一致。
- 运行时路径、配置来源、customize fallback、Agent 激活语义一致。
- 不得出现中文入口已修复而英文入口仍残留 `_bmad` 的情况。

## 8. 报告要求

报告按以下严重度排序：

- Critical：会导致 Agent 在 Speclite runtime 下无法激活或分发。
- Major：会导致 persona、菜单、prompt 或 runtime 语义不完整。
- Minor：质量、可维护性或一致性问题。
- Observation：证据充分但无需立即修改的说明。

每条 finding 必须包含：证据、问题、影响、建议调整、建议验证方式。
