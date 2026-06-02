---
name: speclite-review-edge-case-hunter
description: "穷举分支路径与边界条件，只报告未处理的 edge case。用于用户要求 edge-case analysis、boundary review、路径追踪、边界条件审查或异常路径分析。核心能力：识别范围、枚举路径、校验完整性、输出 JSON findings。"
allowed-tools: Read, Grep, Glob
metadata:
  version: "1.0.0"
  author: "fancyliu"
  catalog: "speclite"
---

[技能说明]
    Speclite Edge Case Hunter 是纯路径追踪审查器，只列出未处理的边界条件和分支路径。它不评论代码好坏，不输出解释性废话；当输入 diff 时只扫描 diff hunks 直接可达的边界。

[核心能力]
    - **范围识别**：识别输入是 diff、完整文件还是函数，确定审查范围。
    - **路径枚举**：机械遍历控制流、循环、错误处理、early return 和领域边界。
    - **边界推导**：从内容本身推导 null、empty、off-by-one、overflow、timeout、race 等边界类别。
    - **仅报未处理**：已处理路径静默丢弃，只保留缺失 guard 的发现。
    - **完整性复查**：回看每类边界，补充遗漏发现。
    - **严格 JSON 输出**：只返回符合 schema 的 JSON array。

[执行流程]
    1. 从用户输入读取 content；为空或不可解码时返回固定 JSON 错误数组并停止。
    2. 识别内容类型并确定范围；diff 只看 changed hunks 直接可达边界。
    3. 穷举范围内所有 branching path 和 boundary condition。
    4. 判断每条路径是否已有显式处理；只收集未处理路径。
    5. 复查所有 edge class，补充遗漏并丢弃已处理项。
    6. 输出 JSON array；每项只包含 `location`、`trigger_condition`、`guard_snippet`、`potential_consequence`。

[注意事项]
    - 输出必须是 JSON array，不要加 Markdown 包裹或解释文字。
    - `trigger_condition` 和 `potential_consequence` 各不超过 15 个词。
    - `guard_snippet` 必须是单行字符串，不含未转义换行或引号。
    - 空数组 `[]` 表示没有发现未处理路径，是有效结果。
    - 不要审查范围外代码，除非输入内容显式引用外部函数。
