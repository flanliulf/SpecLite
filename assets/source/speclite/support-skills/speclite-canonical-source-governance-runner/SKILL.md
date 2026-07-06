---
name: speclite-canonical-source-governance-runner
description: "执行 SpecLite canonical source 变更治理。用于 hook 提醒 assets/source/speclite 变更、需要分类影响面、需要 D0/D1/D2 决策记录、或要一次性修订 docs、fixtures、packaging manifest 和 checker 发现。核心能力：读取治理映射、分析 git diff、生成影响面矩阵、指导定点修订并用 strict checker 收口。"
allowed-tools: Read, Write, Bash, Grep, Glob
metadata:
  version: "1.0.0"
  author: "fancyliu"
  catalog: "speclite"
---

[Overview（技能说明）]
    在 `canonical-source-change-check` hook 发现 `assets/source/speclite/` 变化后，执行完整 canonical source governance workflow。它不是只读 checker，而是把治理映射、影响面矩阵、人工决策记录、定点修订和验证命令串成一个落地流程。

[Core Capabilities（核心能力）]
    - **治理分类**：读取 `assets/source/speclite/canonical-governance.json` 和 `docs/reference/canonical-source-governance.md`，区分 `D0`、`D1`、`D2`。
    - **影响面矩阵**：根据 git diff 判断变更触及 canonical source、module discovery、hook source、public docs、living legacy、frozen history 或 release evidence。
    - **Hook 后续执行**：消费 `canonical-source-change-check` 的 warning，明确下一步是治理 runner，而不是只跑只读 checker。
    - **定点修订**：在用户授权执行时，只修改影响面矩阵要求的文件，不扩大到无关源码。
    - **决策记录**：对 `D1` / `D2` 面向记录 `updated`、`skipped` 或 `historical snapshot`，避免把历史记录误当当前事实。
    - **验证收口**：运行 canonical checker 的 warn / strict 模式、相关 lint、focused tests、build、full tests、packaging check 和 `git diff --check`。

[Workflow（执行流程）]
    本 Skill 使用顺序工作流与治理检查组合。详细步骤、矩阵和停止条件见 `references/canonical-source-governance-runner-workflow.md`。

    1. 读取治理映射和治理文档。
    2. 读取 git diff / staged diff / untracked files，限定到本轮 canonical source 变更和相关派生文件。
    3. 生成影响面矩阵，先处理 `D0`，再处理 `D1` / `D2`。
    4. 若需要修改，按矩阵定点更新 canonical source、docs、fixtures、tests、checker 或 packaging manifest。
    5. 使用 `templates/decision-record.md` 结构记录 `D1` / `D2` 的更新或跳过理由。
    6. 运行 warn 与 strict checker，并执行相关验证命令后总结。

[Notes（注意事项）]
    - 本 Skill 只用于维护 SpecLite 自身 canonical source，不属于目标项目默认 SDLC runtime install set。
    - 本地 hook 仍是 warning-only；阻断语义来自 strict checker、CI 或 release gate。
    - `D0` 问题必须用文件证据和脚本结果收口，不凭记忆更新数量。
    - `D1` / `D2` 问题必须留下决策理由；不能把旧 `PLAN.md`、`EXPERIMENTS.md`、handoff snapshot 静默改成当前事实。
    - 修改 support skill 时，不要把它加入 `core` / `sdlc` `module-help.csv`，除非产品决策明确要求安装到目标项目。

[Generation Metadata（生成信息）]
    本 Skill 由 speclite-skill-creator 自动生成。如需修改，必须同步更新 SKILL.md 与 SKILL.en.md，并同步 `assets/source/speclite/support-skills/speclite-canonical-source-governance-runner/` 与实际安装副本。
