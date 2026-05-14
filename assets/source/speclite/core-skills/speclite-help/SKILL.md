---
name: speclite-help
description: "Analyze current workflow state and user query to answer SpecLite questions or recommend next skills. Use when user asks for help, speclite help, what to do next, where am I, next skill, 使用帮助, 下一步, 我现在该做什么, Speclite 帮助, or wants orientation in a SpecLite workflow. Capable of reading skill catalog, config, artifacts, project knowledge, and module docs to give grounded recommendations."
allowed-tools: Read, Grep, Glob, Bash
metadata:
  version: "1.0.0"
  author: "fancyliu"
  catalog: "speclite"
---

[技能说明]
    Speclite Help 用于帮助用户理解当前工作流位置、已完成内容、下一步建议和可调用 Skill。它从 Speclite runtime catalog、配置、产物、项目知识和模块文档中取证，不凭空猜测项目状态。

[核心能力]
    - **状态定位**：判断用户所处模块和阶段，并识别可能已完成的产物。
    - **下一步推荐**：按 phase、preceded-by、followed-by、required 和 outputs 推荐下一批 Skill。
    - **调用说明**：给出 Skill name、menu code、action context 和可用 args。
    - **快速启动建议**：当只有一个明确下一步时，主动询问是否立即运行。
    - **通用问答**：对不映射到具体 Skill 的问题，读取模块文档和项目知识后回答。
    - **不过载输出**：只展示与当前上下文相关的项目和步骤。

[执行流程]
    1. 读取 `{speclite-runtime-root}/_config/speclite-help.csv`；如不存在，尝试读取 `{project-root}/_speclite/_config/speclite-help.csv`。
    2. 读取 `{project-root}/_speclite/config.toml` 和 `{project-root}/_speclite/config.user.toml`，解析 output-location、communication_language 和 project_knowledge。
    3. 按 catalog 的 `outputs` pattern 搜索已完成产物；必要时读取内容作为推荐依据。
    4. 如果 project_knowledge 指向存在路径，读取相关文件作为项目上下文。
    5. 对 `_meta` 行中的模块文档 URL 或路径，按需读取或抓取，用于回答一般问题。
    6. 根据 phase、sequencing 和 required gate 输出推荐项；可选项在前，下一个 required 项明确标注。
    7. 若用户问题已有明确目标，只回答该目标并给出如何调用。

[注意事项]
    - `{speclite-runtime-root}` = `{project-root}/_speclite`。
    - 所有输出使用 `{communication_language}`。
    - 推荐每个 Skill 在 fresh context window 中运行。
    - 不得制造项目特定事实；缺少证据时说明无法确认。
    - 当前运行规约不得依赖 BMAD catalog 或 YAML 配置。

