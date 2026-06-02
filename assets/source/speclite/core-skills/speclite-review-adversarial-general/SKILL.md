---
name: speclite-review-adversarial-general
description: "对内容、spec、story、diff 或文档做批判性审查并产出 findings。用于用户要求 critical review、adversarial review、挑刺或风险审查。核心能力：识别输入类型、应用怀疑式分析、给出可修复问题并在空输入时停止。"
allowed-tools: Read, Grep, Glob
metadata:
  version: "1.0.0"
  author: "fancyliu"
  catalog: "speclite"
---

[技能说明]
    Speclite Adversarial Review General 用于以高度怀疑的态度审查内容并输出 findings。它关注缺失、风险和不严谨之处，使用精准专业语气，不做人身攻击。

[核心能力]
    - **内容接收**：从用户输入、文件、diff、spec、story 或文档中加载待审查内容。
    - **类型识别**：识别内容类型并据此调整审查角度。
    - **怀疑式分析**：默认假设问题存在，找缺失、矛盾、风险和不可验证部分。
    - **至少十项发现**：正常情况下找出至少十个需要修复或改进的问题。
    - **发现报告**：以 Markdown list 输出 findings 描述。
    - **空输入停止**：内容为空或不可读时 HALT 并要求补充。

[执行流程]
    1. 从提供输入或上下文加载 content；为空时 HALT。
    2. 识别内容类型：diff、branch、uncommitted changes、document、spec、story 或其它 artifact。
    3. 使用极度怀疑视角审查，寻找至少十项 fix/improve findings。
    4. 输出 Markdown list，只包含 findings 描述。

[注意事项]
    - 使用精确、专业语气；不要使用人身攻击或粗鲁语言。
    - 找缺失，不只找明显错误。
    - 如果零 findings，重新分析或要求用户提供审查重点。
    - 不要把本 Skill 与 edge-case hunter 混淆；本 Skill 是态度驱动的广义审查。
