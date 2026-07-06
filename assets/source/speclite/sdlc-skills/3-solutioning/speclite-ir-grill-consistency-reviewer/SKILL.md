---
name: speclite-ir-grill-consistency-reviewer
description: "Review PRD, UX, Architecture and Epics for implementation-readiness consistency. Use when user asks IR grill, consistency review, grill with docs, implementation readiness cross-doc check, PRD/UX/Architecture/Epics alignment, 一致性审查, 实施就绪, 多轮 grill, 文档对齐. Capable of strict-serial rounds, targeted fixes, evidence recording, and exit gating."
allowed-tools: Read, Write, Bash, Grep, Glob
metadata:
  version: "1.0.1"
  author: "fancyliu"
  catalog: "speclite"
---

[Overview（技能说明）]
    本 Skill 用于对 PRD、UX、Architecture、Epics / Stories 做 implementation-readiness 一致性 grill。它内建 grill-with-docs 协议：围绕既有领域模型和文档决策逐分支追问，先用证据回答可回答的问题，再提出单题推荐决策并定点修订、验证和记录。

[Core Capabilities（核心能力）]
    - **目标文档发现**：定位 canonical PRD、UX、Architecture、Epics / Stories、共享 UX / route 合同、readiness / review / spec / prototype gate 报告和 archive。
    - **Grill 协议内建**：执行术语校准、设计树逐分支追问、具体场景探测、代码/文档交叉验证、单题推荐答案和内联文档更新。
    - **严格串行轮次**：默认每轮 50 个 grill question，按 `round-N` 独立记录，禁止并行处理多个问题。
    - **维度覆盖矩阵**：覆盖 source of truth、traceability、terminology、UX contract、API schema、state lifecycle、evidence gate、runtime ownership、security / privacy、QA fixture、implementation handoff。
    - **问题归类与修复**：把发现归类为 missing anchor、orphan reference、overclaim、terminology drift、gate evidence gap、snapshot freshness gap、handoff gap 等，并给出针对性修复。
    - **Prompt 编排**：提供 goal prompt、round prompt、single-question prompt、repair prompt、verification prompt 和 final handoff prompt 的组织方式。
    - **记录与输出规范**：定义 `PLAN.md`、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md`、`summary.md` 的位置、字段和校验要求。
    - **退出门禁**：区分 `COMPLETE`、`CONTINUE`、`BLOCKED`，避免无限 grill 或在仍有 blocker 时误报完成。

[Workflow（执行流程）]
    1. 先读取 `references/workflow.md`，确认输入文档、输出目录、轮次编号、问题数量和退出条件。
    2. 需要组织 goal 或子任务提示词时，读取 `references/prompt-library.md`。
    3. 需要创建或校验记录文件时，读取 `references/record-output-spec.md`。
    4. 需要选择审查维度或归类问题时，读取 `references/review-dimensions.md`。
    5. 需要验证本 Skill 触发或执行质量时，读取 `references/testing-scenarios.md`。
    6. 每个 grill question 必须完成：证据检查 -> 问题与推荐决策 -> 定点修订 -> 验证 -> 记录。用户明确要求只读时，只输出 findings，不修改文件。

[Notes（注意事项）]
    - 默认只修改 planning artifacts、IR grill 记录和用户明确指定的文档；不修改产品源码。
    - 如果用户授权“执行”或“按建议修订”，可采用推荐决策直接落盘；若发现真实产品决策、法律/合规承诺或互相冲突的 canonical source 无法从证据判断，必须 HALT 并请用户确认。
    - 每轮默认 50 题。除非用户设置不同数量，否则不得把多个问题合并成一个 experiment，也不得用批量总结替代单题验证。
    - 本 Skill 可配合 `speclite-check-implementation-readiness`、`speclite-review-adversarial-general`、`speclite-review-edge-case-hunter`、`speclite-flow-gate`、`speclite-index-docs` 使用；核心 grill 协议以本 Skill 的内建规则为准。
    - 输出文档末尾必须追加 `本文档由 speclite-ir-grill-consistency-reviewer Skill 自动生成` 标注。

[Generation Metadata（生成信息）]
    本 Skill 由 speclite-skill-creator 自动生成。如需修改，必须同步更新 SKILL.md 与 SKILL.en.md，并同步 `assets/source/speclite/sdlc-skills/3-solutioning/speclite-ir-grill-consistency-reviewer/` 与实际安装副本。
