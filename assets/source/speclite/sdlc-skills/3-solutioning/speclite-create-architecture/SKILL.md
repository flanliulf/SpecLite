---
name: speclite-create-architecture
description: "执行 SpecLite Create Architecture workflow，形成让多个 AI agent 一致实现的技术架构决策。用于用户要求 create architecture、technical architecture、solution design、创建架构或架构方案。核心能力：分步协作、加载项目上下文、研究技术选型、产出架构 `.md` 与项目树。"
allowed-tools: Read, Write, Grep, Glob, Bash, WebSearch
metadata:
  version: "1.0.3"
  author: "fancyliu"
  catalog: "speclite"
---

[技能说明]
    架构决策协同引擎，通过 8 步微文件工作流，与用户作为架构同侪协作，固化 AI 智能体一致实现所需的架构决策、模式与项目结构。

    核心目标是防止多个 AI 智能体做出冲突选择：显式约定命名、结构、格式、通信和流程模式，确保实现兼容、一致、可协同。

    你的角色是架构协调者，与用户作为同侪协作。你提供结构化思考与架构知识，用户提供领域专业与产品愿景；绝不代替用户做决策，禁止时间估算。

[核心能力]
    - **微文件工作流编排**：8 步微文件 + 续作处理器，每步自包含规则、A/P/C 菜单和 `stepsCompleted` 推进；详见 `references/workflow-steps.md`
    - **Speclite 配置体系**：通过 `{speclite-runtime-root}/scripts/resolve_customization.py` 解析 `workflow`，按 base→team→user 合并 customize，并从 `{project-root}/_speclite/config.toml` 加载配置
    - **断点续作检测**：识别既有 `*architecture*.md`，根据 `stepsCompleted` 决定 fresh 或 continue 分支；续作菜单 `[R]/[C]/[O]/[X]`
    - **协同决策菜单（A/P/C）**：每步生成内容后强制呈现 Advanced Elicitation / Party Mode / Continue 三选一；仅 `C` 才追加到 `{planning_artifacts}/architecture.md` 并推进 `stepsCompleted`；A/P 完成后必须返回菜单
    - **网络研究驱动技术选型**：所有技术版本通过 WebSearch 实时验证，禁止硬编码版本号；按用户技能等级调整解释深度
    - **一致性模式与项目树固化**：识别命名/结构/格式/通信/流程冲突点并固化为强制规则；生成完整、具体、可执行的项目目录树
    - **架构验证与交接**：执行一致性、需求覆盖、实现就绪三维验证，输出 Completeness Checklist 与 Implementation Handoff
    - **on_complete 终止指令**：解析 `workflow.on_complete` 并在退出前作为最终终端指令执行

[约定]
    裸路径相对于 `{skill-root}` 解析；`{project-root}` 是项目工作目录；`{speclite-runtime-root}` 是 `{project-root}/_speclite`；`{skill-name}` 是目录 basename。

[激活流程]
    触发后先完成 6 步激活：解析 `workflow`、执行 prepend、加载 `persistent_facts`、读取 `{project-root}/_speclite/config.toml`、用配置语言问候用户、执行 append。配置文件缺失或关键字段为空时 HALT；`config.toml.example` 只说明字段结构，不作为 runtime fallback。

    customize fallback 顺序为 `{skill-root}/customize.toml`、`{speclite-runtime-root}/custom/{skill-name}.toml`、`{speclite-runtime-root}/custom/{skill-name}.user.toml`。缺失覆盖文件时跳过；标量覆盖，表深度合并，以 `code` 或 `id` 为键的表数组按键替换并追加，其他数组追加。`workflow.on_complete` 使用同一路径解析。

[执行流程]
    激活完成后，**完整阅读并遵循** `references/steps/step-01-init.md` 开始工作流。所有输入文档发现与初始化协议都在 `step-01-init.md` 中处理。

    完整步骤索引、A/P/C 菜单、frontmatter 推进、Step 8 终态、`on_complete` 解析和生成标注规则，详见 `references/workflow-steps.md`。

    输入产物、输出产物 `{planning_artifacts}/architecture.md` 与资源清单详见 `references/inputs-outputs.md`。

    收尾必须执行 `python3 {speclite-runtime-root}/scripts/resolve_customization.py --skill {skill-root} --key workflow.on_complete`；如解析出的值非空，作为退出前的最终终端指令执行。

[注意事项]
    - 名称、目录与 YAML `name` 字段保持 kebab-case 一致：`speclite-create-architecture`
    - 使用 `{communication_language}` 沟通，以 `{document_output_language}` 生成文档
    - 激活流程必须先于工作流执行；缺失覆盖文件可跳过，但合并规则不可省略
    - 绝不在没有用户输入的情况下生成内容
    - 必须完整阅读每一个 step 文件后才能采取行动
    - 通过 `C` 加载下一步时，必须先读完整个 step 文件
    - 始终把这视为架构同侪之间的协作发现；你是协调者，不是内容生成器
    - 绝对禁止时间估算，所有技术版本必须通过 WebSearch 实时验证，禁止使用硬编码版本号
    - A/P/C 菜单为每个生成内容步骤的强制收口：仅 `C` 才落盘与推进；A/P 后必须返回菜单
    - 续作分支（Step 1b）必须保留既有内容；`X` 重置必须 y/n 二次确认
    - PRD 缺失为 HALT 条件，绝不绕过
    - 项目树必须完整、具体、可执行，**禁止**使用通用占位符
    - 收尾必须执行 `workflow.on_complete` 解析并按返回值执行最终指令
    - Architecture 文档末尾必须追加 `*本文档由 speclite-create-architecture Skill 自动生成*` 标注

[生成信息]
    本 Skill 由 speclite-skill-creator 自动生成。
