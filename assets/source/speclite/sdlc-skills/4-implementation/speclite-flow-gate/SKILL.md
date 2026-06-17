---
name: speclite-flow-gate
description: "验证 SpecLite Story 与 Epic 的流程门控，检查 contract、functional 与 evidence anchors。用于用户要求 flow gate、story kickoff gate、epic gate、门控检查或防止 dev-story 前后锚点漂移。核心能力：执行四种 gate 模式、判定 PASS_EQUIVALENT、生成报告与交接建议。"
allowed-tools: Read, Write, Grep, Glob, Bash
metadata:
  version: "1.0.0"
  author: "fancyliu"
  catalog: "speclite"
---

[Overview（技能说明）]
    SpecLite 实现阶段流程门控 Skill，用于在 Story/Epic 启动或完成时检查 planning contract、实际源码实现和测试证据是否一致，避免等到 `speclite-dev-story` 执行中途才 HALT。

[Core Capabilities（核心能力）]
    - **Mode 驱动门控**：支持 `story-kickoff`、`story-completion`、`epic-completion`、`epic-kickoff` 四种检查模式。
    - **Anchor 分类**：区分 `Contract Anchor`、`Functional Anchor`、`Evidence Anchor` 和 `Guidance Anchor`，禁止把未契约化文件名当成唯一 hard gate。
    - **等价实现裁决**：当实现形态偏离 Story guidance 但 owning SPEC、源码路径和测试证据成立时，输出 `PASS_EQUIVALENT`。
    - **失败类型定位**：用 `FAIL_CONTRACT`、`FAIL_FUNCTION`、`FAIL_EVIDENCE`、`DECISION_NEEDED` 精确说明阻断原因。
    - **报告生成**：把 gate report 写入 `{implementation_artifacts}/flow-gates/`，供 `sprint-status`、`dev-story`、CR 和 finalizer 消费。
    - **流转建议**：给出下一步动作，例如继续 `dev-story`、修订 Story、补测试证据、或先运行 Epic completion gate。

[Workflow（执行流程）]
    1. 完整阅读 `references/workflow-details.md`；该文件是四种 gate mode、结果枚举、报告格式和 HALT 规则的权威定义。遇到等价实现或固定路径歧义时，同时读取 `references/regression-scenarios.md`。
    2. 解析目标 mode 与目标对象：Story key、Story 文件路径、Epic 编号或下一 Epic 编号。
    3. 加载 merged runtime config、`sprint-status.yaml`、目标 Story/Epic、owning SPECs、相关源码和测试证据。
    4. 按 `Contract -> Functional -> Evidence -> Guidance` 顺序做门控判断，并生成 `assets/report-template.md` 规定的报告。
    5. 只有 `PASS` 或 `PASS_EQUIVALENT` 允许后续 workflow 继续；其他结果必须先修正文档、实现或证据。

[Notes（注意事项）]
    - 固定文件名只有在 owning SPEC 明确指定时才是 hard gate；否则必须先检查等价 functional implementation 和测试证据。
    - 本 Skill 只生成 gate report，不修改源码、不推进 Story/Epic 状态、不替代 CR。
    - 报告必须写入 `{implementation_artifacts}/flow-gates/`，文件名按 mode 和目标对象稳定生成。
    - 报告开头的 YAML frontmatter 是 downstream hook、dev-story、CR 和 finalizer 的 machine-readable source；不得要求消费者解析 Markdown prose 判断 gate result。
    - `Guidance Anchor` mismatch 不能直接判定 blocked；只能在确认 contract/function/evidence 缺失后输出失败。
    - 中英文入口必须同步更新；新增 mode 或结果枚举时同步更新 `references/workflow-details.md`。

[Generation Metadata（生成信息）]
    本 Skill 由 speclite-skill-creator 自动生成。如需修改，必须同步更新 SKILL.md 与 SKILL.en.md，并通过 skills-upgrade 管理版本。
