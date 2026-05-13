---
name: speclite-party-mode
description: "Orchestrate group discussions between installed SpecLite agents using independent subagents or solo roleplay fallback. Use when user requests party mode, multi-agent conversation, roundtable, multiple perspectives, 群聊模式, 多 Agent 讨论, 圆桌讨论, 多角色评审, or wants several agents to discuss a project. Capable of resolving agent roster, choosing relevant voices, spawning parallel subagents, presenting unabridged responses, and managing follow-up rounds."
allowed-tools: Read, Grep, Glob, Bash
metadata:
  version: "1.0.0"
  author: "fancyliu"
  catalog: "speclite"
---

[技能说明]
    Speclite Party Mode 组织已安装 Speclite agents 进行圆桌讨论。默认使用独立 subagents 产生真实多视角；`--solo` 模式下由当前模型直接 roleplay 多个 agents，并明确告知用户。

[核心能力]
    - **参数解析**：支持 `--model` 和 `--solo`。
    - **Agent roster 解析**：通过 Speclite runtime 解析 agents 列表，获得 code、name、title、icon、description、module 和 team。
    - **上下文加载**：读取 `**/project-context.md`，在相关讨论中传递给 agents。
    - **声音选择**：根据用户问题选择 2-4 个最相关 agents，避免同一组合长期垄断。
    - **并行讨论**：默认并行 spawn subagents；solo 模式下清晰分段 roleplay。
    - **原文呈现**：完整呈现每个 agent 的响应，不混合、不压缩、不提前总结。

[执行流程]
    1. 解析用户 invocation 中的 `--model` 和 `--solo`。
    2. 读取 `{project-root}/_speclite/config.toml`，解析 user_name 和 communication_language。
    3. 运行 `python3 {speclite-runtime-root}/scripts/resolve_config.py --project-root {project-root} --key agents` 获取 agent roster。
    4. 搜索并读取相关 `**/project-context.md` 作为背景。
    5. 欢迎用户，展示 roster，询问要讨论的问题。
    6. 每轮根据用户消息选择 2-4 个 agents；用户点名时必须包含点名 agent。
    7. 默认并行 spawn agents；`--solo` 时跳过 spawn 并直接分角色回答。
    8. 逐个完整呈现 agent 响应；可选添加简短 Orchestrator Note。
    9. 对 follow-up 按用户意图选择单 agent、反应式 agent 或新一轮 roster。
    10. 用户结束时简短总结关键 takeaway 并退出 party mode。

[注意事项]
    - `{speclite-runtime-root}` = `{project-root}/_speclite`。
    - 默认模式下不要自己编写 agent 回复，必须使用独立 subagent；只有 `--solo` 才 roleplay。
    - 传给 subagent 的 Discussion Context 应控制在 400 字以内。
    - 不要混合、转述或压缩 agent 响应。
    - 当前运行规约不得依赖旧 runtime 路径或 YAML 配置。

