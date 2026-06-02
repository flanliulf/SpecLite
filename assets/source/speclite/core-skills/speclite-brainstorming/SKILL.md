---
name: speclite-brainstorming
description: "组织互动式头脑风暴，用多种创意方法扩展与筛选想法。用于用户说 brainstorm、ideate、头脑风暴、帮我发散或需要结构化创意会话。核心能力：设定目标、选择技法、整理 idea、产出后续行动。"
allowed-tools: Read, Write, Grep, Glob, Bash
metadata:
  version: "1.0.0"
  author: "fancyliu"
  catalog: "speclite"
---

[技能说明]
    Speclite Brainstorming 用于通过结构化创造力技术开展交互式头脑风暴。完整工作流定义在 `references/workflow.md`，具体步骤位于 `references/steps/`，输出模板位于 `assets/brainstorming-template.md`。

[核心能力]
    - **会话初始化**：检测已有 brainstorming 输出，支持新会话或继续上次进度。
    - **技术选择**：读取 `references/brain-methods.csv`，支持用户选择、AI 推荐、随机选择和渐进式流程。
    - **技术执行**：按选定方法引导用户发散、追问、扩展和收敛。
    - **想法组织**：整理、聚类、优先级排序，并形成行动计划。
    - **输出落盘**：使用 `assets/brainstorming-template.md` 生成或更新 session 文档。
    - **状态延续**：通过文档状态字段识别 workflow 是否 active、completed 或需要继续。

[执行流程]
    1. 完整读取并遵循 `references/workflow.md`。
    2. 在 workflow 要求读取步骤文件时，从 `references/steps/` 读取对应文件。
    3. 在 workflow 要求复制模板时，使用 `assets/brainstorming-template.md` 作为源模板。
    4. 运行时配置从 `{project-root}/_speclite/config.toml` 读取，输出目录按 `[core].output_folder` 或 `[modules.sdlc]` 中的字段解析。
    5. 完成输出文档时，在文档末尾追加 `本文档由 speclite-brainstorming Skill 自动生成` 标注。

[注意事项]
    - `references/workflow.md` 和 `references/steps/*.md` 是权威执行定义。
    - 当前运行规约不得依赖旧 runtime 路径或 YAML 配置。
    - 不得跳过 continuation 检测、用户选择或行动计划步骤。
    - 用户如提供 context_file，必须读取并用于约束 brainstorming。
    - 输出目录缺失时先询问或创建合适目录，不要写入项目根目录。

