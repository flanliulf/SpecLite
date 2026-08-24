---
name: speclite-create-technical-solution-document
description: "Generate evidence-grounded human-readable technical solution documents from SpecLite planning artifacts and project facts. Use when the user asks for '技术方案', '技术实现方案', '方案设计', 'technical solution', 'implementation design', or 'solution design document'. Capable of scope tailoring, multi-system contract design, Mermaid diagram selection, traceability, and readability validation."
allowed-tools: Read, Write, Bash, Grep, Glob
metadata:
  version: "1.0.0"
  author: "fancyliu"
  catalog: "speclite"
---

[Overview（技能说明）]
    将 PRD、UX、Architecture、Epics / Stories、Implementation Readiness 报告和项目事实综合为面向人类评审与交付的技术方案说明文档。主输出为 `{project_knowledge}/tsd/<requirement-id>-technical-solution-document.md`。

    本 Skill 生成的是 human-facing derived artifact，不替代 PRD、Architecture、Story 或源码契约，也不静默回写这些 canonical owner。若来源冲突或证据不足，输出冲突与缺口并路由回 owning workflow。

[Core Capabilities（核心能力）]
    - **证据化综合**：区分 `Confirmed`、`Proposed`、`TBD`、`N/A`，追踪来源版本、commit 或文档状态。
    - **范围自适应**：按 requirement、Epic 或跨系统变更裁剪章节，禁止空章节和无解释的“暂无”。
    - **人类可读结构**：先结论、后图表、再细节，提供 Executive Summary、Current / Target State 与 Applicability Matrix。
    - **多系统契约设计**：覆盖职责、协议、认证、超时、重试、幂等、错误语义、兼容性、数据责任和 owner。
    - **Mermaid 图表治理**：按问题选择 flowchart、sequence、state、class 或 ER 图，并限制单图复杂度。
    - **质量与追溯验证**：通过结构化脚本检查元数据、章节、占位符、Mermaid fence、追溯表和 finalization 条件。

[Workflow（执行流程）]
    详细流程见 `references/workflow-details.md`。执行前还必须按需读取 `references/document-structure.md`、`references/diagram-guidelines.md`、`references/multi-system-design-checklist.md`、`references/evidence-and-traceability.md` 与 `references/quality-checklist.md`。

    Step 1：确认 requirement id、文档受众、交付范围和 `Draft` / `Review` 模式。

    Step 2：发现并锁定输入 baseline；Finalization 前要求最新 Implementation Readiness 结论允许进入实现。缺少或未通过时只生成 `Draft`。

    Step 3：基于 `assets/technical-solution-template.md` 生成大纲，使用 Applicability Matrix 解释条件章节的保留或省略，并等待用户确认大纲。

    Step 4：按章节综合事实与方案，生成必要的 Mermaid 图、多系统契约表和 Requirement → Design → Verification 追溯关系。

    Step 5：运行 `python3 scripts/validate_technical_solution.py <document> --mode draft|final`，最多执行 3 轮“检查→定点修复→复查”。

    Step 6：Final 文档仅可进入 `Review`；只有用户或既有审批事实明确授权时才能标记 `Approved`。完成后报告输出路径、状态、来源 baseline、遗留风险和下一步。

[Notes（注意事项）]
    - SKILL.md 是中文 canonical，SKILL.en.md 是等价英文 mirror；版本、YAML、能力、步骤、限制和引用路径必须同步。
    - 正文使用中文，章节标题使用 English（中文）形式；命令、路径、字段名、schema id、API、协议名和专有技术术语保留英文。
    - 不得猜测依赖版本、API 字段、数据库结构、第三方响应、容量数字或现有实现。`TBD` 必须记录 owner、due date 和阻塞影响。
    - 完整 API Schema、DDL 或事件定义应链接到其权威契约；正文只写变更摘要、关键语义和影响。
    - 固定路径只有 owning SPEC 明确要求时才是 hard gate；否则遵循 equivalent implementation policy，并按 `Contract Anchor -> Functional Anchor -> Evidence Anchor` 检查，`Guidance Anchor` 不得冒充契约。
    - 本 Skill 不推进 Story / Epic 状态。若消费 `speclite-flow-gate` report，仅把 `PASS` 或 `PASS_EQUIVALENT` 作为可用证据，其他结论必须保留为 blocker。
    - 输出文档末尾必须追加 `*本文档由 speclite-create-technical-solution-document Skill 自动生成*`。
    - PDF 或 Word 导出不是 v1.0.0 的能力；Markdown 是唯一内容真源，格式转换应由独立渲染流程完成。

[Generation Metadata（生成信息）]
    本 Skill 由 speclite-skill-creator 自动生成。如需修改，必须同步更新 SKILL.md 与 SKILL.en.md，并同步 `assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-technical-solution-document/` 与实际安装副本。
