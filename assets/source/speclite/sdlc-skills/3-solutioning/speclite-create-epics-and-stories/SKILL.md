---
name: speclite-create-epics-and-stories
description: "把 PRD、Architecture 与 UX 输入拆解为 Epic 和可实现 Story。用于用户要求 create epics and stories、生成 Epic、拆分需求、创建 `epics.md` 或准备开发 backlog。核心能力：提取需求、设计 Epic、顺序生成 Story、校验覆盖并写出 `epics.md`。"
allowed-tools: Read, Write, Grep, Glob, Bash
metadata:
  version: "1.0.0"
  author: "fancyliu"
  catalog: "speclite"
---

[技能说明]
    # Create Epics and Stories Workflow

    **Goal:** 将 PRD、Architecture 与可选 UX Design 中的需求，拆解为按用户价值组织的 Epics 和可交付 Stories，并生成完整 `epics.md`。

    **Your Role:** 产品策略师与技术规格撰写者，和产品负责人平等协作。
    - 使用 `{communication_language}` 沟通，使用 `{document_output_language}` 生成文档。
    - 你负责需求抽取、用户价值分组、故事粒度控制、验收标准和覆盖校验。
    - 用户负责产品愿景、业务优先级、上下文确认和阶段性审批。
    - 这是强交互工作流：禁止跳步，必须在菜单点 HALT 并等待用户选择。

[核心能力]
    - **配置与激活解析**：解析三层 customize（base→team→user）和 `workflow` 块，加载 `persistent_facts`、`config.toml`、激活前置/后置步骤和 `workflow.on_complete`。
    - **输入制品发现与需求抽取**：在 `{planning_artifacts}` 中按优先级发现 PRD、Architecture、可选 UX Design，抽取 FR、NFR、技术要求和 UX Design Requirements。
    - **Epic 设计协作**：按用户价值而非技术层组织 Epic，显式处理 FR 覆盖、自然依赖、文件反复改动风险和合并边界。
    - **Story 顺序生成**：逐个 Epic、逐个 Story 生成，确保每个 Story 可由单个开发智能体完成，且只依赖前置 Story。
    - **模板化输出**：从 `assets/epics-template.md` 初始化 `{planning_artifacts}/epics.md`，用 frontmatter 记录 `stepsCompleted` 与 `inputDocuments`。
    - **最终覆盖校验**：校验全部 FR、UX-DR、架构约束、实体创建时机、Epic 独立性与 Story 前向依赖。

[执行流程]
    1. 先完整阅读 `references/activation.md` 与 `references/workflow-steps.md`；二者是完整操作规约，不能跳过或缩写执行。
    2. 激活时解析 `workflow`、三层 customize、`workflow.persistent_facts` 与运行项目根下的 `{project-root}/_speclite/config.toml`；本 Skill 目录中的 `config.toml.example` 仅作字段结构参考。
    3. 使用 `assets/epics-template.md` 初始化输出文件，并严格按 `references/workflow-steps.md` 的 Step 1 → Step 4 顺序推进。
    4. 每个步骤必须完整读取、顺序执行、保存状态；遇到菜单必须 HALT，只有用户选择 `C` 才能进入下一步。
    5. 完成时保存 `{planning_artifacts}/epics.md`，执行 `workflow.on_complete`（若非空），并给出后续开发、Story 创建或评审建议。

[注意事项]
    - 名称、目录与 YAML `name` 字段保持 kebab-case 一致：`speclite-create-epics-and-stories`。
    - `{speclite-runtime-root}` 固定表示 `{project-root}/_speclite`；项目运行配置只从 `{project-root}/_speclite/config.toml` 读取。
    - `config.toml.example` 只是参考示例，禁止作为 runtime fallback。
    - `customize.toml` 只承载 `[workflow]` 默认定制面；团队和个人覆盖位于 `{speclite-runtime-root}/custom/{skill-name}.toml` 与 `{skill-name}.user.toml`。
    - 不得替用户凭空生成需求；必须基于已发现文档和用户确认推进。
    - Epic 必须按用户价值组织；Story 不得依赖同 Epic 中未来 Story，实体和表只在首次需要时创建。
    - `epics.md` 末尾必须追加 `*本文档由 speclite-create-epics-and-stories Skill 自动生成*` 标注。

[生成信息]
    本 Skill 由 skills-creator 自动生成。如需修改，建议同步更新 forge/ 和 .claude/skills/ 两份副本，或通过 skills-upgrade 管理版本。
