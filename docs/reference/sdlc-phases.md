# SDLC Phases（SDLC 阶段）

本文是 SpecLite SDLC 五阶段的唯一源定义：阶段顺序、canonical 目录名、catalog phase 标识、阶段回答的问题、职责、典型 Workflow 与典型产物。其它文档引用本文，不再各自维护阶段表。

事实锚点：`assets/source/speclite/sdlc-skills/` 的目录结构、`assets/source/speclite/sdlc-skills/module-help.csv` 的 `phase` 列，以及 SPEC 09 的 artifact roots。

## Phase Table（阶段表）

| Order | Phase | Canonical Directory | Catalog Phase | Artifact Root | 主要问题 | Responsibility（职责） | 典型 Workflow | 典型产物 |
|---:|---|---|---|---|---|---|---|---|
| 1 | Analysis（分析） | `1-analysis/` | `1-analysis` | `{analysis_artifacts}` | 当前系统、用户、市场或领域的事实是什么？ | 研究、brownfield baseline、通用技术栈分析、产品发现和文档治理。 | domain / market / technical research、brownfield context builder、generic backend tech-stack digger、Product Brief、PRFAQ、docs writing。 | research、baseline、planning handoff、brief、PRFAQ。 |
| 2 | Planning（规划） | `2-plan-workflows/` | `2-planning` | `{planning_artifacts}` | 要解决什么问题，范围和用户体验是什么？ | PRD、UX 和产品规划 Agent。 | create / edit / validate PRD、UX design。 | PRD、PRD validation report、UX specification。 |
| 3 | Solutioning（方案） | `3-solutioning/` | `3-solutioning` | `{solutioning_artifacts}` | 如何实现，工作如何拆分，是否具备实现条件？ | 架构、Epics / Stories、Story Review 和 implementation readiness。 | Architecture、Epics and Stories、Story Review、implementation readiness check、readiness grill consistency review、technical solution document。 | Architecture、Epics、Stories、review 记录与 readiness report。 |
| 4 | Implementation（实现） | `4-implementation/` | `4-implementation` | `{implementation_artifacts}` | 如何逐项实现、测试、检查并安全收口？ | Sprint、Story、Flow Gate、Dev Story、Code Review、QA 和 Retrospective。 | Sprint Planning、Flow Gate、Create Story、Dev Story、Code Review 链路、Epic 级 SR / CR 编排、QA、Quick Dev、Correct Course、Retrospective。 | sprint tracker、Story、gate report、代码与 review evidence、retrospective。 |
| 5 | DevOps（DevOps） | `5-devops/` | `5-devops` | `{devops_artifacts}` | 如何验证并执行发布？ | 发布和运维流程。 | npm publisher；`ci-cd/` 与 `deployments/` 目前是保留目录。 | release gate 与 publishing report。 |

## Identifier Rules（标识规则）

- Canonical directory 与 catalog phase 是两个不同的技术标识：目录名 `2-plan-workflows/` 对应 catalog phase `2-planning`，其余四个阶段两者同名。
- Canonical directory 不带前导零，写 `1-analysis/` 至 `5-devops/`，不能把 `01-analysis` 当作真实路径。
- Agent 与部分 Workflow 在 `module-help.csv` 中标为 `anytime`，例如文档、术语和快速处理类能力；package 所在目录不等于只能在该阶段调用。
- 阶段是发现、排序和交接模型，不要求每个任务机械走完整链路：brownfield 项目可以先建立 baseline 再进入 Planning，已有明确 Story 的任务可以从 Implementation 开始，小型明确变更可以使用 Quick Dev。

## Related Documents（相关文档）

| Relationship | Document |
|---|---|
| 各阶段 Skill catalog | [`skills/sdlc-workflows.md`](skills/sdlc-workflows.md) |
| Agent 名录 | [`skills/agent-roster.md`](skills/agent-roster.md) |
| Artifact root 与目录布局 | [`workflow-artifact-layout.md`](workflow-artifact-layout.md) |
| Canonical source 目录 | [`canonical-source-layout.md`](canonical-source-layout.md) |
| Skill 分类与入口选择 | [`../explanation/skill-taxonomy-and-sdlc.md`](../explanation/skill-taxonomy-and-sdlc.md) |
| Workflow 体系解释 | [`../explanation/speclite-workflows.md`](../explanation/speclite-workflows.md) |
