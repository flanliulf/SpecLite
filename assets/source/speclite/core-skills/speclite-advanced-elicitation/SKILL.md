---
name: speclite-advanced-elicitation
description: "用结构化引导方法推动 LLM 复盘、质疑并改进近期输出。用于用户要求深度追问、Socratic review、first principles、pre-mortem、red team 或提升草稿质量。核心能力：选择方法、迭代提问、整合改进结论。"
allowed-tools: Read, Grep, Glob, Bash
metadata:
  version: "1.0.0"
  author: "fancyliu"
  catalog: "speclite"
---

[技能说明]
    Speclite Advanced Elicitation 用于推动模型重新审视、批判和改进最近产出的内容。它保留 BMAD 源 Skill 的方法注册表、1-5/r/a/x 交互循环、用户确认后才应用修改、以及可被其他 Skill 间接调用的增强语义。

[核心能力]
    - **方法注册表加载**：读取 `references/methods.csv` 获取 elicitation 方法、说明和 output pattern。
    - **上下文分析**：分析内容类型、复杂度、利益相关者需求、风险等级和创造潜力。
    - **智能方法选择**：默认选择 5 个最适合当前内容的方法，并支持 reshuffle、list all 和直接反馈。
    - **迭代增强**：针对当前内容逐轮应用选中方法，展示增强结果并等待用户确认。
    - **间接调用返回**：被其它 Skill 调用时，将用户接受的增强内容返回给调用方作为替换内容。
    - **Agent roster 支持**：如需要 party mode 视角，可通过 Speclite runtime 解析 agents roster。

[执行流程]
    1. 读取 `references/methods.csv`；如需要 party mode 参与，运行 `python3 {speclite-runtime-root}/scripts/resolve_config.py --project-root {project-root} --key agents` 解析 agent roster。
    2. 分析当前内容和对话上下文，选择 5 个最匹配的 elicitation 方法。
    3. 展示选项：数字 `1-5`、`r` reshuffle、`a` list all、`x` proceed。
    4. 用户选择方法后，依据 CSV description 和 output_pattern 应用于当前内容，展示增强版本。
    5. 必须询问用户是否应用修改；仅当用户确认 yes 时才把增强内容作为当前版本。
    6. 每轮结束后重新展示 `1-5/r/a/x`，直到用户选择 `x`。
    7. 间接调用场景下，将最终接受的增强内容返回给调用 Skill。

[注意事项]
    - `{speclite-runtime-root}` = `{project-root}/_speclite`。
    - 输出语言必须遵循当前 Agent 的 communication style 和 communication_language。
    - 不得跳过用户确认；用户拒绝时必须丢弃该轮拟议修改。
    - 多个方法编号可按顺序执行，但每轮仍需回到选择菜单。
    - 当前运行规约不得依赖 BMAD runtime 路径。
