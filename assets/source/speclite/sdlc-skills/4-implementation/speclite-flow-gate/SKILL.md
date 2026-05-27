---
name: speclite-flow-gate
description: "Validate SpecLite story and epic flow gates before or after implementation by checking contract, functional, and evidence anchors. Use when user mentions 'flow gate', 'speclite flow gate', 'story kickoff gate', 'story completion gate', 'epic gate', '门控检查', '流程门控', 'Story 启动门控', 'Story 完成门控', or wants to prevent anchor drift before dev-story or epic handoff. Capable of four mode gate assessment, PASS_EQUIVALENT decisions, anchor classification, report generation, and sprint handoff guidance."
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
    1. 完整阅读 `references/workflow-details.md`；该文件是四种 gate mode、结果枚举、报告格式和 HALT 规则的权威定义。
    2. 解析目标 mode 与目标对象：Story key、Story 文件路径、Epic 编号或下一 Epic 编号。
    3. 加载 `{project-root}/_speclite/config.toml`、`sprint-status.yaml`、目标 Story/Epic、owning SPECs、相关源码和测试证据。
    4. 按 `Contract -> Functional -> Evidence -> Guidance` 顺序做门控判断，并生成 `assets/report-template.md` 规定的报告。
    5. 只有 `PASS` 或 `PASS_EQUIVALENT` 允许后续 workflow 继续；其他结果必须先修正文档、实现或证据。

[Notes（注意事项）]
    - 固定文件名只有在 owning SPEC 明确指定时才是 hard gate；否则必须先检查等价 functional implementation 和测试证据。
    - 本 Skill 只生成 gate report，不修改源码、不推进 Story/Epic 状态、不替代 CR。
    - 报告必须写入 `{implementation_artifacts}/flow-gates/`，文件名按 mode 和目标对象稳定生成。
    - `Guidance Anchor` mismatch 不能直接判定 blocked；只能在确认 contract/function/evidence 缺失后输出失败。
    - 中英文入口必须同步更新；新增 mode 或结果枚举时同步更新 `references/workflow-details.md`。

[Generation Metadata（生成信息）]
    本 Skill 由 skills-creator 自动生成。如需修改，必须同步更新 SKILL.md 与 SKILL.en.md，并通过 skills-upgrade 管理版本。
