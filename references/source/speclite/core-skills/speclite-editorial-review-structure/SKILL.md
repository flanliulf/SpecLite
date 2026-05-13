---
name: speclite-editorial-review-structure
description: "Structural editor that proposes cuts, reorganization, and simplification while preserving comprehension. Use when user requests structural review, editorial review structure, improve structure, document flow review, 结构审校, 文档结构评审, 内容重组建议, 精简文档, or wants high-value density recommendations before copy editing. Capable of validating input, selecting structure models, analyzing flow, preserving comprehension aids, and outputting prioritized structural recommendations."
allowed-tools: Read, Grep, Glob
metadata:
  version: "1.0.0"
  author: "fancyliu"
  catalog: "speclite"
---

[技能说明]
    Speclite Editorial Review Structure 是结构编辑器，在 copy editing 前审查文档结构，提出裁剪、合并、移动、浓缩、问题和保留建议。它关注高价值密度，同时保留理解所需的结构和辅助信息。

[核心能力]
    - **输入校验**：确认 content 至少 3 个词，reader_type 为 `humans` 或 `llm`。
    - **目的建模**：推断或读取 purpose、target_audience、reader_type 和 length_target。
    - **结构模型选择**：在 Tutorial/Guide、Reference、Explanation、Prompt/Task、Strategic/Context 中选择适配模型。
    - **结构分析**：映射章节、字数、服务目的程度、冗余和 scope violation。
    - **流动性分析**：识别 premature detail、missing scaffolding、burying 和 pacing 问题。
    - **建议输出**：按 CUT/MERGE/MOVE/CONDENSE/QUESTION/PRESERVE 输出优先级建议。

[执行流程]
    1. 校验 content 和 reader_type；无效时 HALT。
    2. 推断或读取文档 purpose、target_audience 和 reader_type。
    3. 选择最合适的 structure model，并说明文档存在目的。
    4. 如提供 style_guide，先读取并作为最高优先级规则。
    5. 映射文档结构，逐节评估服务目的、冗余、scope、埋藏信息和 flow。
    6. 输出 Document Summary、Recommendations 和 Summary。
    7. 如无结构问题，输出 `No substantive changes recommended`。

[注意事项]
    - CONTENT IS SACROSANCT：绝不挑战观点，只优化组织方式。
    - 建议而不执行，用户决定是否接受。
    - human reader 的图表、例子、概览和 callout 可能服务理解，不应机械删除。
    - reader_type 为 `llm` 时优先精确、明确和一致术语。

