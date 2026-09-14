---
name: speclite-terminology-governance
description: "Extract, normalize, and govern project terminology from planning and implementation-intent documents. Use when users ask for 'Epic glossary', 'terminology governance', '术语表', '提取英文术语', '统一术语', or '领域术语候选'. Core capabilities: provenance-aware extraction, Chinese naming, cross-artifact conflict detection, human-readable glossary projection, and DDD candidate handoff."
allowed-tools: Read, Write, Bash, Grep, Glob
metadata:
  version: "1.1.0"
  author: "fancyliu"
  catalog: "speclite"
---

[Overview（技能说明）]
    从 PRD、UX、Architecture、SPEC、Epic、Story 和 technical solution document 中提取、解释并统一项目术语。输出分为 Terminology Inventory、Glossary Projection 和 Domain Candidate Handoff 三层；公开 Glossary 始终是派生 Reference，不覆盖 owning artifact，也不证明功能已经实现。

[Core Capabilities（核心能力）]
    - **Epic Glossary**：逐节读取 Epic，生成带稳定编号、中文直译和人类可读定义的独立术语文档。
    - **Story Expansion**：可选扫描 Story 的 AC、状态、异常和数据契约，只补充具有实现边界意义的新术语。
    - **Cross-Artifact Governance**：归一大小写、单复数和连字符 aliases，保留来源，并显式报告同词异义和跨 artifact 冲突。
    - **Chinese Term Inclusion**：纳入项目特有、影响规则或易漂移的中文组合术语，不为普通叙述制造术语。
    - **Human-Readable Projection**：生成 `Term | 中文直译 | Definition` 的 Epic 页面、共享 inventory 和 glossary index。
    - **Domain Candidate Handoff**：筛选业务规则、状态、事件、命令、策略、Entity 和 Value Object 候选，交给 `speclite-domain-modeling` 确认。
    - **Deterministic Validation**：使用 `scripts/validate_glossary.py` 检查编号、标题、表格、中文名称、重复项、冲突状态和 index 链接。

[Workflow（执行流程）]
    完整流程见 `references/terminology-governance-workflow.md`。

    Step 1：确认 `source_documents`、目标模式、`glossary_root` 和写入授权；未指定输出位置时先读取项目文档规范，仍无法确定则使用 `{project_knowledge}/glossary/`；`{project_knowledge}` 取 `speclite resolve artifact-roots --project-root {project-root}` 返回的 `resolvedRoot`。

    Step 2：按来源职责建立 provenance，逐节提取候选，并依据 `references/term-taxonomy-and-promotion.md` 分类、翻译、定义和归一。

    Step 3：先生成或更新 Terminology Inventory，再投影 Epic Glossary；公开 index 属于单独的导航写入面，写入前列出 touched files。

    Step 4：运行 `python3 scripts/validate_glossary.py <glossary-root> --require-index --format json`，只修复报告命中的位置，最多循环 3 轮；仍有 Error 时停止并报告。

    Step 5：仅在用户要求领域抽象时生成 `domain-candidates.md`。未经人工确认不得修改 `CONTEXT.md` 或 ADR。

[Notes（注意事项）]
    - 本 Skill 是 `core-skills` 的 `anytime` workflow，可消费 0–5 阶段 artifact，但不属于 `support-skills` 或 `4-implementation`。
    - Epic、Story 是 Contract / Guidance Anchor；code、tests、runtime results 是 Functional / Evidence Anchor。按 `Contract -> Functional -> Evidence` 区分意图和当前事实。
    - 固定 Story 路径只有 owning SPEC 明确要求时才是 hard gate；否则必须接受 resolved root 或有测试、fixture、snapshot、command evidence 支撑的 equivalent implementation policy。
    - 本 Skill 不推进 Epic/Story 状态，不生成或消费状态转换用 `speclite-flow-gate` report，不得把 planned、approved 或 accepted 改写为 implemented、verified 或 released。
    - 过程分析写入 `.specskills/docs/analysis/speclite-terminology-governance/`；最终运行产物写入用户确认的 `glossary_root` 或 fallback output root。
    - 中文 canonical 正文使用中文；命令、路径、字段名、fixture、schema/issue id、Skill ID 和专有技术术语保留英文。

[Generation Metadata（生成信息）]
    本 Skill 由 speclite-skill-creator 自动生成。如需修改，必须同步更新 SKILL.md 与 SKILL.en.md，并同步 `assets/source/speclite/core-skills/speclite-terminology-governance/` 与实际安装副本。
