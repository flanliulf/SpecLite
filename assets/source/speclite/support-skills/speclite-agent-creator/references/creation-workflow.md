# Speclite Agent 创建工作流

## Step 1：确认输入

一次最多询问 3 个缺失信息：

- 源 Agent 目录，通常为 `vault/bmad-skills-src/bmm-skills/**/bmad-agent-*`。
- 目标 Agent 名称，默认将 `bmad-agent-*` 转换为 `speclite-agent-*`。
- 目标阶段目录，默认沿用源目录所在阶段，并归入 `assets/source/speclite/sdlc-skills/`，如 `1-analysis`、`2-plan-workflows`、`3-solutioning`、`4-implementation`。
- 是否需要 Agent 包英文入口。默认不生成 `SKILL.en.md`，除非用户明确要求双语安装面。

如果用户提供多个源目录，可以批量规划，但每个 Agent 必须保留独立的源目标映射和风险清单。

## Step 2：盘点源 Agent 包

读取并记录：

- `SKILL.md` 的 frontmatter、Overview、Conventions 和 On Activation 步骤。
- `customize.toml` 的 `[agent]` 字段、数组、数组表和菜单项。
- 根目录 Markdown 文件，区分本地 prompt、规约说明和模板骨架。
- `agent.menu` 中的 `skill` 引用和 `prompt` 引用。
- 运行时路径：resolver、custom fallback、配置文件、项目知识路径。

必须确认源目录真的是 Agent 定义向目录：至少包含 `--key agent` 或 `[agent]`，否则交回 `speclite-skill-creator` 处理。

## Step 3：设计目标文件树

推荐结构：

```text
assets/source/speclite/sdlc-skills/<phase>/<speclite-agent-name>/
  SKILL.md
  SKILL.en.md              # 按需；Agent 包默认不强制
  CHANGELOG.md
  customize.toml           # 必须保留 [agent]
  config.toml.example      # 如入口读取 _speclite/config.toml
  references/
    activation.md          # 如激活流程较长
    agent-semantics.md     # 如需沉淀 persona 或菜单规则
    <prompt>.md            # 从根目录迁移的本地 prompt
  assets/
    <template>.md          # 模板骨架
```

根目录 Markdown 白名单：`SKILL.md`、`SKILL.en.md`、`CHANGELOG.md`。Agent 包可以没有 `SKILL.en.md`；如存在必须与中文 canonical 入口保持版本和运行模型一致。其他 Markdown 必须迁入 `references/` 或 `assets/`。

## Step 4：转换入口 SKILL.md

入口必须包含：

- `name`：与目录一致，kebab-case。
- `description`：说明该 Agent 的身份、触发条件和核心能力，覆盖中英文触发词。
- `allowed-tools`：按 Agent 菜单和本地 prompt 需要选择；只读问答通常为 `Read, Grep, Glob`，涉及生成或迁移则使用 `Read, Write, Bash, Grep, Glob`。
- `metadata.version`、`metadata.author`、`metadata.catalog = "speclite"`。
- `[Overview（技能说明）]`、`[Core Capabilities（核心能力）]`、`[Workflow（执行流程）]`、`[Notes（注意事项）]`。

入口可以保留短版激活流程；若激活规则超过 5000 字或可复用，拆入 `references/activation.md`，并在入口声明该文件是权威流程。

## Step 5：转换 Agent runtime 模型

逐项替换并人工校验语义：

| BMAD 源语义 | Speclite 目标语义 |
| --- | --- |
| `{project-root}/_bmad/scripts/resolve_customization.py --key agent` | `{speclite-runtime-root}/scripts/resolve_customization.py --key agent` |
| `{project-root}/_bmad/custom/{skill-name}.toml` | `{speclite-runtime-root}/custom/{skill-name}.toml` |
| `{project-root}/_bmad/custom/{skill-name}.user.toml` | `{speclite-runtime-root}/custom/{skill-name}.user.toml` |
| `{project-root}/_bmad/bmm/config.yaml` | `{project-root}/_speclite/config.toml` |
| `bmad-help` | `speclite-help` 或中性帮助入口，按目标项目实际存在情况确认 |

必须定义：

- `{skill-root}`：安装后的单个 Agent Skill 目录。
- `{project-root}`：目标项目工作目录。
- `{speclite-runtime-root}`：`{project-root}/_speclite`。
- `{skill-name}`：Agent Skill 目录 basename。

## Step 6：转换 customize.toml

`customize.toml` 必须保留 `[agent]` 命名空间。标准字段包括：

- `name`、`title`、`icon`。
- `activation_steps_prepend`、`activation_steps_append`。
- `persistent_facts`。
- `role`、`identity`、`communication_style`、`principles`。
- `[[agent.menu]]`，每项必须且只能包含 `skill` 或 `prompt` 之一。

保留结构合并规则：标量覆盖，表深度合并，以 `code` 或 `id` 为键的表数组替换匹配项并追加新项，其他数组追加。

## Step 7：转换菜单和 prompt 引用

- `skill = "bmad-*"` 默认映射为 `skill = "speclite-*"`。
- 映射前必须检查目标 Speclite Skill 是否存在；不存在时保留在风险清单，不要虚构实现。
- `prompt = "Read and follow the instructions in {skill-root}/file.md"` 若文件被迁入 `references/`，必须改为 `{skill-root}/references/file.md`。
- 本地 prompt 文件应作为执行指令保留原有约束，不得压缩到只剩摘要。

## Step 8：自检与交接

完成后检查：

- 通用 Skill 规范：frontmatter、description、版本、正文长度、引用路径、文件分类。
- Agent 专属规范：`[agent]` 存在、`--key agent`、persona 语义、菜单结构、prompt 文件、持续角色身份。
- Speclite 规范：runtime 路径、config.toml、custom fallback、BMad 残留、公共源码目录混用。

最后建议运行 `python3 assets/source/speclite/support-skills/speclite-agent-lint/scripts/check_agent_skill.py <agent-dir>` 和 `speclite-agent-lint`，并列出菜单目标未迁移、prompt 文件迁移、帮助入口命名等人工审核点。
