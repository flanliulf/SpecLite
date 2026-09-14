# Agent Roster（Agent 名录）

本文是 SpecLite SDLC Module 七个 role activation Agent 的唯一源定义：Agent ID、persona、package 目录、catalog phase、菜单码、职责与 runtime 投影角色。其它文档引用本文，不再各自维护 roster 表。

事实锚点：`assets/source/speclite/sdlc-skills/module.yaml` 的 Agent 声明、`module-help.csv` 的 Agent 行，以及各 `speclite-agent-*/customize.toml` 中的 `name` 与 `title`。

## Roster（名录）

| Agent ID | Name | Title | Package Directory | Catalog Phase | Menu | Responsibility（职责） | Runtime Role（config 投影） |
|---|---|---|---|---|---|---|---|
| `speclite-agent-analyst` | Alice | Business Analyst | `1-analysis/` | `1-analysis` | `BA` | 需求分析、调研、Product Brief、PRFAQ 路由。 | 分析和产品发现。 |
| `speclite-agent-tech-writer` | Taylor | Technical Writer | `1-analysis/` | `anytime` | `WD`、`EC`、`MG`、`US`、`VD` | 技术文档、概念解释、Mermaid、标准更新和文档验证。 | 技术写作和项目知识。 |
| `speclite-agent-docs-steward` | Sarah | Open Source Docs Steward | `1-analysis/` | `anytime` | `ODS` | `docs/` 信息架构、Diataxis 和公开文档质量治理。 | `docs/` 信息架构和公开文档治理。 |
| `speclite-agent-pm` | Paul | Product Manager | `2-plan-workflows/` | `2-planning` | `PM` | PRD、需求发现、Epic 和 readiness 对齐。 | PRD 和规划。 |
| `speclite-agent-ux-designer` | Uma | UX Designer | `2-plan-workflows/` | `2-planning` | `UX` | UX 设计、界面规划和用户约束。 | UX 设计和用户约束。 |
| `speclite-agent-architect` | Adam | System Architect | `3-solutioning/` | `3-solutioning` | `ARCH` | 架构方案、技术取舍和 implementation readiness。 | 架构方案和 readiness。 |
| `speclite-agent-dev` | David | Senior Software Engineer | `4-implementation/` | `4-implementation` | `DEV` | Story 实现、test-first 执行和代码交付。 | Story 实现和 test-first 交付。 |

## Rules（规则）

- Agent 负责 role activation 和 workflow 分发，不是普通执行 Workflow；它们与 SDLC 阶段对齐，但不强制用户只能按阶段调用。
- Package Directory 是 canonical source 中的位置；Catalog Phase 来自 `module-help.csv`，`anytime` 表示可在任意阶段介入。
- `name` 与 `title` 是 Agent 的固定身份，不可通过 customization 修改；persona、菜单与 activation 可按 [`../../how-to/customize-a-skill.md`](../../how-to/customize-a-skill.md) 覆盖。
- Install 时 roster 会投影到 `_speclite/config.toml` 的 `[agents.<agent-id>]`；descriptor 不替代 installed Skill package，完整 persona 与 menu 以 `.claude/skills/<agent-id>/` 或 `.agents/skills/<agent-id>/` 中的 `SKILL.md` / `customize.toml` 为准。
- 当前没有独立的 DevOps persona。

## Related Documents（相关文档）

| Relationship | Document |
|---|---|
| SDLC 阶段源定义 | [`../sdlc-phases.md`](../sdlc-phases.md) |
| SDLC Skill catalog | [`sdlc-workflows.md`](sdlc-workflows.md) |
| Agent 体系解释 | [`../../explanation/speclite-agents.md`](../../explanation/speclite-agents.md) |
| Runtime config 投影 | [`../runtime-layout.md`](../runtime-layout.md) |
| 配置与 customization | [`../config-and-customization.md`](../config-and-customization.md) |
