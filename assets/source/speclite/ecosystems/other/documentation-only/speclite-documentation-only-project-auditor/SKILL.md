---
name: speclite-documentation-only-project-auditor
description: "Audit documentation-only project facts from repository evidence. Use when a selected other ecosystem module targets docs-only repositories, docs/ source, README, Diataxis boundaries, package-facing docs, link integrity, public docs source, or documentation readiness without application/runtime code."
allowed-tools:
  - Read
  - Write
  - Bash
  - Grep
  - Glob
metadata:
  version: "1.0.0"
  author: "fancyliu"
  catalog: "speclite"
---

# Speclite Documentation-only Project Auditor

[Overview（技能说明）]
    Speclite Documentation-only Project Auditor 是 `ecosystem-other-documentation-only` module 的项目形态审计工作流。它面向已选择 documentation-only other ecosystem module 的目标项目，围绕 `docs/`、README、Diataxis、package-facing docs、link integrity、public docs source 和 project facts 建立证据。

[Core Capabilities（核心能力）]
    - **Docs-only boundary discovery（文档型项目边界发现）**：确认项目主要交付物是否为文档、规范、知识库或网站内容，而不是应用 runtime。
    - **Public docs source audit（公开文档源审计）**：读取 `docs/`、README、index、style guide、package-facing docs、navigation 和 source ownership。
    - **Diataxis boundary review（Diataxis 边界审查）**：区分 tutorials、how-to、explanation、reference、glossary 和 changelog / release notes。
    - **Link and render readiness（链接与渲染就绪度）**：规划 internal link、anchor、image/media、GitHub/npm renderer 和 future docs tooling checks。
    - **Boundary protection（边界保护）**：保留 `speclite-write-opensource-docs` 与 `speclite-agent-docs-steward` 在 `sdlc`，需要写作或治理时转交它们。

[Workflow（执行流程）]
    详细步骤见 `references/documentation-only-project-audit-workflow.md`。

    1. 确认 `{project-root}`、docs source root 和输出位置；若项目并非 documentation-only，记录 why-not-documentation-only。
    2. 收集 docs evidence：`docs/`、README、style guide、index、package metadata、links、assets、site config 和 CI/docs scripts。
    3. 只记录可验证事实；不要把泛化写作建议写成项目已有规范。
    4. 输出 documentation-only audit note，覆盖 docs source、Diataxis map、link/render readiness、unknowns 和 handoff。
    5. 若用户要实际编写或迁移公开文档，转交 `speclite-write-opensource-docs`；若要做目录治理，转交 `speclite-agent-docs-steward`。

[Notes（注意事项）]
    - 本 Skill 只处理 documentation-only project shape，不表示所有 docs 工作都属于 other。
    - 通用公开文档写作、docs stewardship 和 SDLC planning docs 仍属于 `sdlc` workflow。
    - 如果项目同时包含应用代码、CLI、library 或 backend services，必须标明 docs-only scope 是否仍成立。
