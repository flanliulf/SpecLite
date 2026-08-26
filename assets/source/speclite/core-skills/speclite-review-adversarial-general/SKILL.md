---
name: speclite-review-adversarial-general
description: "对内容、spec、story、diff 或文档做批判性审查并产出 findings。用于用户要求 critical review、adversarial review、挑刺或风险审查。核心能力：识别输入类型、应用怀疑式分析、给出可修复问题并在空输入时停止。"
allowed-tools: Read, Grep, Glob
metadata:
  version: "2.0.0"
  author: "fancyliu"
  catalog: "speclite"
---

## Overview（概述）

    Speclite Adversarial Review General 用于以高度怀疑的态度审查内容并输出 findings。它关注缺失、风险和不严谨之处，使用精准专业语气，不做人身攻击。

## Core Capabilities（核心能力）

- **内容接收**：从用户输入、文件、diff、spec、story 或文档中加载待审查内容。
- **类型识别**：识别内容类型并据此调整审查角度。
- **怀疑式分析**：默认假设问题存在，找缺失、矛盾、风险和不可验证部分。
- **零数量配额**：只报告有具体失败场景和证据的实质问题；零 finding 是合法结果。
- **稳定发现身份**：每条 finding 提供 category、invariant、concrete failure scenario 和 primary location，供上层生成 fingerprint。
- **发现报告**：以结构化 Markdown list 输出 findings 描述。
- **空输入停止**：内容为空或不可读时 HALT 并要求补充。

## Workflow（工作流）

    1. 从提供输入或上下文加载 content；为空时 HALT。
    2. 识别内容类型：diff、branch、uncommitted changes、document、spec、story 或其它 artifact。
    3. 使用高度怀疑视角审查，但不设最低问题数。每个候选问题必须先回答：
        - 被违反的单一 invariant 是什么？
        - 具体输入/状态如何导致错误结果？
        - primary location 在哪里？
       无法给出具体失败场景或第一手证据时丢弃，不得为凑数制造问题。
    4. 输出 Markdown list；每项包含 `category`、`invariant`、`concrete_failure_scenario`、`primary_location` 和描述。

## Notes（注意事项）
    - 使用精确、专业语气；不要使用人身攻击或粗鲁语言。
    - 找缺失，不只找明显错误。
    - 零 findings 是合法结论；不得因为零 finding 重新生成噪音。
    - “可能存在另一分支”不构成 finding，除非能给出具体输入/状态 → 错误结果。
    - 不要把本 Skill 与 edge-case hunter 混淆；本 Skill 是态度驱动的广义审查。
