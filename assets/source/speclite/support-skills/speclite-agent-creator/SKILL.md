---
name: speclite-agent-creator
description: "创建或迁移 SpecLite Agent 定义包，保留 persona、menu、customization 和 runtime model。用于用户提到 speclite agent creator、create speclite agent、migrate bmad agent、bmad agent to speclite、创建 Agent、迁移 BMad Agent、生成 agent 定义或转换 bmad-agent-* 目录。核心能力：识别 role activation skill、转换 [agent] 定制块、映射菜单、迁移 prompt 引用并交接 agent lint。"
allowed-tools: Read, Write, Bash, Grep, Glob
metadata:
  version: "1.1.0"
  author: "fancyliu"
  catalog: "speclite"
---

[Overview（技能说明）]
    Speclite Agent Creator 用于创建或迁移符合 SpecLite 运行模型的 Agent 定义包。它专门处理 `speclite-agent-*` / `bmad-agent-*` 这类以 persona 激活、`[agent]` 定制块、菜单分发和持续角色身份为核心的 role activation skill，不把它们误当作普通 `[workflow]` Skill。

[Core Capabilities（核心能力）]
    - **Agent 对象识别**：识别以 persona、`[agent]`、menu dispatch 和 dismiss 前持续身份为核心的 Agent 定义包。
    - **Persona 语义保留**：保留角色名、title、icon、role、identity、communication_style、principles、persistent_facts、激活步骤和持续身份规则。
    - **运行模型转换**：把 `_bmad/scripts`、`_bmad/custom`、`_bmad/bmm/config.yaml` 转换为 `{speclite-runtime-root}/scripts`、`{speclite-runtime-root}/custom` 和 `{project-root}/_speclite/config.toml`。
    - **Agent 定制面生成**：保留 `customize.toml` 的 `[agent]` 命名空间和结构合并规则，不转换成 `[workflow]`。
    - **菜单映射与依赖规划**：将 `agent.menu` 中的 `skill = "bmad-*"` 映射为已存在的 `speclite-*` 目标，无法确认时列入风险清单。
    - **Prompt 文件归类**：把 Agent 根目录下的规约型 prompt Markdown 迁入 `references/` 或 `assets/`，同步更新 `{skill-root}` 引用。
    - **交接检查**：生成后交给 `speclite-agent-lint`，覆盖 Agent block、菜单目标、路径残留、版本和文件归类。

[Workflow（执行流程）]
    1. 确认输入：源 Agent 目录、目标 Agent 名称、目标阶段目录、是否需要英文入口；若缺失，一次最多询问 3 个问题。
    2. 完整阅读 `references/creation-workflow.md` 与 `references/agent-migration-baseline.md`，建立源目标映射，不直接套用普通 workflow Skill 迁移规则。
    3. 盘点源目录：读取 `SKILL.md`、`customize.toml`、根目录 prompt Markdown、菜单 `skill` 和 `prompt` 引用、运行时路径与配置字段。
    4. 规划目标文件树：默认输出到 `assets/source/speclite/sdlc-skills/<phase>/<speclite-agent-name>/`，入口和配置留根目录，规约文档进 `references/`，模板骨架进 `assets/`。
    5. 转换入口和配置：`SKILL.md` 使用 Speclite frontmatter，激活协议切换到 `--key agent` 的 Speclite resolver，`customize.toml` 保持 `[agent]`。
    6. 转换菜单：把已存在的 `bmad-*` 目标映射为同名 `speclite-*` 目标；无法确认时不得猜测实现，必须在风险清单中标注。
    7. 自检并交接：检查 BMad 残留、Agent 语义、菜单目标、引用文件、版本一致性和根目录 Markdown 白名单，输出建议运行的 `speclite-agent-lint`。

[Notes（注意事项）]
    - 本 Skill 属于 `support-skills/`，只服务 SpecLite canonical skill 源定义创建和迁移，不属于目标项目默认 SDLC runtime 安装集合。
    - 本 Skill 只迁移 Agent 定义向目录；普通 `bmad-*` workflow Skill 继续使用 `speclite-skill-creator`。
    - `customize.toml` 必须承载 `[agent]` 默认定制面；不得按 workflow 规则改成 `[workflow]`。
    - 当前运行规约不得依赖 `_bmad`、`config.yaml`、`/bmad:*` 或源码仓库路径作为 runtime 位置。
    - `config.toml.example` 如生成，只能说明目标项目 runtime 配置结构，不能作为 fallback。
    - Agent 包的 `SKILL.en.md` 是可选镜像；如存在，必须与中文 canonical 入口保持版本、路径和激活语义一致。
    - 菜单项引用的本地 prompt 文件必须真实存在；迁移到 `references/` 后必须同步更新 prompt 文本。
    - 不得为了格式统一删除 persona、问候、菜单停顿、模糊匹配、持续角色身份等 Agent 核心语义。

[Generation Metadata（生成信息）]
    本 Skill 由 speclite-agent-creator 维护并纳入 SpecLite support-skills 体系。如需修改，必须同步更新 `SKILL.md`、`SKILL.en.md`、`CHANGELOG.md` 与相关 references。
