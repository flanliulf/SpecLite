---
name: speclite-validate-prd
description: "Validate PRD workflow for Speclite 规划与产品设计, migrated from a legacy source skill with runtime-model conversion. Use when user mentions 'validate prd', 'speclite validate prd', 'create validate prd', 'run validate prd', 'Validate PRD', '创建Validate PRD', '生成Validate PRD', '执行Validate PRD', '检查Validate PRD', '运行Validate PRD'. Capable of config-driven activation, three-tier customization, source artifact discovery, step-file orchestration, output generation, and completion handoff."
allowed-tools: Read, Write, Bash, Grep, Glob, WebSearch
metadata:
  version: "1.0.0"
  author: "fancyliu"
  catalog: "speclite"
---

[技能说明]
    Validate PRD 是 Speclite 规划与产品设计工作流 Skill，用于在目标项目中按配置语言、输出语言和工作流步骤完成对应制品或交付动作。

    源入口说明：Validate a PRD against standards. Use when the user says "validate this PRD" or "run PRD validation"

[核心能力]
    - **Speclite 激活解析**：解析三层 customize（base→team→user）、`workflow.persistent_facts` 和 `workflow.on_complete`，并从 `{project-root}/_speclite/config.toml` 加载运行配置。
    - **源制品发现与上下文加载**：按 workflow 规约读取项目制品、配置字段、历史上下文和必要数据文件，保持源流程的输入发现语义。
    - **步骤化工作流执行**：按 `references/workflow-details.md` 与拆分后的 reference/step 文件逐步执行，遵守顺序、HALT 条件、菜单等待和状态推进规则。
    - **模板化输出生成**：使用 assets 中的模板或示例骨架生成文档、报告、规格或交付产物，输出语言服从 `document_output_language`。
    - **质量校验与交接**：执行清单、报告、状态同步或 completion handoff，并在退出前解析和执行 `workflow.on_complete`。
    - **迁移一致性约束**：当前运行规约只依赖 Speclite runtime，不读取旧运行目录、旧配置文件或旧命令命名空间。

[约定]
    裸路径相对于 `{skill-root}` 解析；`{project-root}` 是目标项目工作目录；`{speclite-runtime-root}` 是 `{project-root}/_speclite`；`{skill-name}` 是目录 basename。

[激活流程]
    触发后先解析 `workflow`，执行 `activation_steps_prepend`，加载 `persistent_facts`，读取 `{project-root}/_speclite/config.toml`，按 `communication_language` 与用户沟通，并执行 `activation_steps_append`。配置文件缺失或关键字段为空时必须 HALT；`config.toml.example` 只说明字段结构，不作为 runtime fallback。

    customize fallback 顺序为 `{skill-root}/customize.toml`、`{speclite-runtime-root}/custom/{skill-name}.toml`、`{speclite-runtime-root}/custom/{skill-name}.user.toml`。缺失覆盖文件时跳过；标量覆盖，表深度合并，以 `code` 或 `id` 为键的表数组按键替换并追加，其他数组追加。`workflow.on_complete` 使用同一路径解析。

[执行流程]
    1. 先完整阅读 `references/workflow-details.md`；该文件是从源入口转换后的权威工作流规约。随后按需读取 `references/workflow-details.md`、`references/data/prd-purpose.md`、`references/steps/step-v-01-discovery.md`、`references/steps/step-v-02-format-detection.md`、`references/steps/step-v-02b-parity-check.md`、`references/steps/step-v-03-density-validation.md` 等 reference 文件。
    2. 执行工作流前，确认 `{skill-root}`、`{project-root}`、`{speclite-runtime-root}`、`{skill-name}` 四个路径变量均已明确。
    3. 若 workflow 指向 step 文件，必须一次只读取当前 step，完整执行后再进入下一步；遇到菜单或用户确认点时 HALT 等待。
    4. 生成或更新产物时，按源 workflow 的模板、清单、状态字段和输出位置要求执行，不得因为迁移而改变核心需求。
    5. 收尾前运行 checklist 或质量检查，解析 `workflow.on_complete`，并在输出文档末尾追加本 Skill 的生成标注。

[注意事项]
    - 名称、目录与 YAML `name` 字段保持 kebab-case 一致：`speclite-validate-prd`。
    - `references/workflow-details.md` 和配套 reference 文件均为有效执行规约，不是背景资料。
    - 如工作流需要模板，必须从 `assets/` 中读取，不得临时省略模板结构。
    - 数据和结构化参考位于 `data/domain-complexity.csv`、`data/project-types.csv`。
    - `config.toml.example` 仅作字段结构参考，不作为 runtime fallback。
    - 当前运行规约不得依赖旧运行目录、旧 YAML 配置或旧命令命名空间。
    - 输出文档末尾必须追加 `*本文档由 speclite-validate-prd Skill 自动生成*` 标注。

[生成信息]
    本 Skill 由 skills-creator 自动生成。
