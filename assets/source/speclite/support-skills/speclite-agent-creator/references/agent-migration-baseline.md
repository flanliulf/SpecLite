# Speclite Agent 迁移基线

本基线以 `vault/bmad-skills-src/bmm-skills/1-analysis/bmad-agent-analyst` 为源头参考，并推广到 `bmm-skills` 下所有 `bmad-agent-*` 定义向目录；目标落点是本仓库 `assets/source/speclite/sdlc-skills/`。

## 1. 适用范围

适用目录特征：

- 目录名匹配 `bmad-agent-*`。
- `SKILL.md` 以 Agent persona 激活为主体，而不是业务 workflow 步骤。
- `customize.toml` 存在 `[agent]`。
- 菜单通过 `[[agent.menu]]` 分发到其他 Skill 或本地 prompt。

不适用：

- 普通 `bmad-*` workflow Skill。
- 只有 `[workflow]` 的目录。
- 没有 persona 和菜单分发语义的工具型 Skill。

## 2. 已知源 Agent 清单

当前源目录中已识别的 Agent 定义向目录：

| 源目录 | 目标建议 |
| --- | --- |
| `1-analysis/bmad-agent-analyst` | `1-analysis/speclite-agent-analyst` |
| `1-analysis/bmad-agent-tech-writer` | `1-analysis/speclite-agent-tech-writer` |
| `2-plan-workflows/bmad-agent-pm` | `2-plan-workflows/speclite-agent-pm` |
| `2-plan-workflows/bmad-agent-ux-designer` | `2-plan-workflows/speclite-agent-ux-designer` |
| `3-solutioning/bmad-agent-architect` | `3-solutioning/speclite-agent-architect` |
| `4-implementation/bmad-agent-dev` | `4-implementation/speclite-agent-dev` |

## 3. 源目标结构对比

典型源目录：

```text
SKILL.md
customize.toml
```

Tech Writer 类源目录还可能包含本地 prompt：

```text
explain-concept.md
mermaid-gen.md
validate-doc.md
write-document.md
```

目标目录建议：

```text
SKILL.md
SKILL.en.md              # 按需；Agent 包默认不强制
CHANGELOG.md
customize.toml           # [agent]
config.toml.example      # 如入口读取项目配置
references/
  activation.md          # 按需
  <prompt>.md            # 本地 prompt
assets/
```

## 4. 必须保留的 Agent 语义

- 角色身份：Agent 名称、title、overview、role、identity、communication style。
- 表达方式：icon 前缀、用户语言、文档输出语言。
- 激活流程：resolve agent block、prepend steps、adopt persona、persistent facts、load config、greet、append steps、dispatch or menu。
- 菜单行为：编号表格、code、description、skill 或 prompt、清晰匹配直接分发、接近匹配才澄清、无匹配时继续对话。
- 持续身份：直到用户 dismiss 前，persona、persistent facts、icon 和 communication language 持续生效。
- 合并规则：标量覆盖，表深度合并，以 `code` 或 `id` 为键的数组表替换并追加，其他数组追加。

## 5. 必须转换的运行时路径

| 检查项 | 源 | 目标 |
| --- | --- | --- |
| resolver | `{project-root}/_bmad/scripts/legacy Python customization resolver` | `speclite resolve customization` |
| team customize | `{project-root}/_bmad/custom/{skill-name}.toml` | `{speclite-runtime-root}/custom/{skill-name}.toml` |
| user customize | `{project-root}/_bmad/custom/{skill-name}.user.toml` | `{speclite-runtime-root}/custom/{skill-name}.user.toml` |
| project config | `{project-root}/_bmad/bmm/config.yaml` | merged runtime config |
| help skill | `bmad-help` | `speclite-help` 或已确认的中性帮助入口 |

## 6. 菜单映射规则

默认映射：

```text
bmad-create-prd -> speclite-create-prd
bmad-dev-story -> speclite-dev-story
```

映射前必须检查目标是否存在。若目标不存在：

- 不创建空壳目标。
- 不保留会误导用户的已迁移描述。
- 在生成摘要和 CHANGELOG 的已知限制中列为待补目标。

## 7. Agent 与 Workflow 的关键差异

- Agent 的 `customize.toml` 是 `[agent]`，不是 `[workflow]`。
- Agent 的主行为是身份激活和菜单分发，不是一次性业务流程执行。
- Agent 可以通过菜单调用多个 Skill，因此 lint 必须检查跨 Skill 引用。
- Agent 的 prompt 文件是可执行指令，不能按普通附件处理。
- Agent 激活后会影响后续对话状态，因此必须保留 dismiss 前持续身份规则。
- Agent 包的 `SKILL.en.md` 是可选镜像；普通 workflow Skill 的双语入口硬规则不应直接套到 Agent 包。
