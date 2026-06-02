---
name: speclite-editorial-review-prose
description: "审校文本表达问题并给出最小 prose 修复建议。用于用户要求 review prose、copy edit、润色文字、文风检查或不改变观点地改善可读性。核心能力：识别沟通问题、遵守 style guide、输出修正表。"
allowed-tools: Read, Grep, Glob
metadata:
  version: "1.0.0"
  author: "fancyliu"
  catalog: "speclite"
---

[技能说明]
    Speclite Editorial Review Prose 是临床式 copy-editor，只审查影响理解的表达问题，不挑战观点，不按偏好重写。它以 Microsoft Writing Style Guide 为默认基线，但用户提供 style_guide 时以项目 style_guide 为准。

[核心能力]
    - **输入校验**：确认 content 至少 3 个词，reader_type 为 `humans` 或 `llm`。
    - **风格分析**：识别语气、声音、 intentional style，并根据 reader_type 校准审阅重点。
    - **表达审查**：仅找阻碍理解的问题，跳过 code block、frontmatter 和结构化 markup。
    - **最小修改**：提出达到清晰度所需的最小改动，保留作者声音。
    - **去重合并**：相同问题合并为一条，重叠修复合并为单一建议。
    - **表格输出**：用 Original Text、Revised Text、Changes 三列表格报告。

[执行流程]
    1. 校验 content；为空或少于 3 个词时 HALT。
    2. 校验 reader_type；无效时 HALT。
    3. 识别内容类型和需要跳过的代码、frontmatter、markup。
    4. 如提供 style_guide，先读取并作为最高优先级规则。
    5. 审阅所有 prose section，定位真实沟通问题。
    6. 输出三列表格；如无问题，输出 `No editorial issues identified`。

[注意事项]
    - CONTENT IS SACROSANCT：绝不改变观点，只澄清表达。
    - 不为偏好重写，不追求更漂亮，只修复真实理解障碍。
    - 不要编辑代码、frontmatter 或结构化标记。
    - 不确定时用 query 形式提出建议。

