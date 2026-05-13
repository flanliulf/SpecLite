---
name: speclite-distillator
description: "Lossless LLM-optimized compression of source documents into dense distillates. Use when user requests distill documents, create a distillate, compress source docs, LLM context compression, 文档蒸馏, 无损压缩, 生成蒸馏文档, 压缩上下文, or wants source documents converted into token-efficient context. Capable of source analysis, compressor subagent orchestration, semantic splitting, completeness checks, output writing, and optional round-trip validation."
allowed-tools: Read, Write, Bash, Grep, Glob
metadata:
  version: "1.0.0"
  author: "fancyliu"
  catalog: "speclite"
---

[技能说明]
    Speclite Distillator 将一组源文档转换为面向 LLM 消费的无损压缩 distillate。它是压缩任务，不是摘要任务；必须保留事实、决策、约束和关系，同时去除人类阅读所需但 LLM 不需要的冗余。

[核心能力]
    - **输入分析**：运行 `scripts/analyze_sources.py` 估算 token、识别文件组和路由模式。
    - **压缩执行**：使用 `references/agents/distillate-compressor.md` 指令进行 single 或 fan-out 压缩。
    - **语义拆分**：依据 `references/resources/splitting-strategy.md` 输出单文件或多 section distillate。
    - **格式约束**：按 `references/resources/distillate-format-reference.md` 生成 bullets-only、主题清晰、无重复的结构。
    - **完整性检查**：用 compressor 返回的 headings 和 named entities 检查遗漏，最多执行 2 次 targeted fix pass。
    - **回环验证**：在 `--validate` 模式下使用 `references/agents/round-trip-reconstructor.md` 进行重建验证。

[执行流程]
    1. 校验输入：`source_documents` 必填，`downstream_consumer`、`token_budget`、`output_path`、`--validate` 可选。
    2. 运行 `python3 {skill-root}/scripts/analyze_sources.py --help`，再用源路径执行分析，获得 routing、groups 和 token 估算。
    3. routing 为 single 时，用 `references/agents/distillate-compressor.md` 对全部源文件压缩。
    4. routing 为 fan-out 时，每组分别压缩，再用同一 compressor 指令合并 intermediate distillates。
    5. 对输出执行完整性检查和格式检查，必要时定向修补，最多 2 次。
    6. 根据 token_budget 和实际大小决定单文件或 `{base-name}-distillate/` 多文件输出。
    7. 再次运行分析脚本测量最终 distillate token，返回结构化 JSON 结果。
    8. 如传入 `--validate`，按 round-trip reconstruction 规则生成 validation report。

[注意事项]
    - 不得把 distillation 当摘要；摘要丢信息，distillate 必须无损压缩。
    - Stage 1 正常情况下不要直接读取源文档，应先使用分析脚本决定路由。
    - 若无法 spawn subagent，可读取对应 `references/agents/*.md` 后在当前上下文按同一规则执行。
    - 输出文件必须写到用户指定路径或源文件相邻位置，不得写入项目根目录。
    - 当前运行规约不得依赖旧 runtime 路径。

