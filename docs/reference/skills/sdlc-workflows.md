# SDLC Workflows（SDLC 工作流）

本文按 SDLC 阶段记录 `assets/source/speclite/sdlc-skills/` 下的 canonical skill package roots。它是快速查阅用 Reference，不替代各 Skill 包内的 `SKILL.md`、`references/` 和 `assets/`。

## Snapshot（当前快照）

| Item | Value |
|---|---|
| Canonical source root | `assets/source/speclite/sdlc-skills/` |
| 当前 package roots | 48 个带 `SKILL.md` 的目录 |
| Agent roster | 7 个 `speclite-agent-*` role activation skills |
| 新增 backend tech-stack skills | 4 个 `speclite-brownfield-*tech-stack-digger` skills |
| Help catalog | `assets/source/speclite/sdlc-skills/module-help.csv` |
| Module metadata | `assets/source/speclite/sdlc-skills/module.yaml` |

> Note: CLI module discovery 以递归发现 `SKILL.md` package roots 为准。`module-help.csv` 提供 menu code、阶段和输出位置，但不是 package root 发现的唯一来源。

## Agent Roster（Agent 名录）

当前 SDLC Module 在 `module.yaml` 中声明 7 个 Agent。Agent 负责 role activation 和 workflow 分发，不是普通执行 workflow。

| Skill | Persona | Phase | Menu | Purpose |
|---|---|---|---|---|
| `speclite-agent-analyst` | Alice / Business Analyst | `1-analysis` | `BA` | 分析、研究、Product Brief、PRFAQ 路由。 |
| `speclite-agent-tech-writer` | Taylor / Technical Writer | `1-analysis` | `WD` / `EC` 等 | 技术文档、概念解释、Mermaid 和文档验证。 |
| `speclite-agent-docs-steward` | Sarah / Open Source Docs Steward | `1-analysis` | `ODS` | `docs/` 信息架构、Diataxis 和公开文档质量治理。 |
| `speclite-agent-pm` | Paul / Product Manager | `2-plan-workflows` | `PM` | PRD、需求发现、Epic 和 readiness 对齐。 |
| `speclite-agent-ux-designer` | Uma / UX Designer | `2-plan-workflows` | `UX` | UX 设计、界面规划和用户约束。 |
| `speclite-agent-architect` | Adam / System Architect | `3-solutioning` | `ARCH` | 架构方案、技术取舍和 implementation readiness。 |
| `speclite-agent-dev` | David / Senior Software Engineer | `4-implementation` | `DEV` | Story 实现、test-first 执行和代码交付。 |

## Analysis（分析阶段）

| Skill | Type | Menu | Output | Purpose |
|---|---|---|---|---|
| `speclite-agent-analyst` | Agent | `BA` | - | 激活 Alice 做需求、研究和产品发现路由。 |
| `speclite-agent-docs-steward` | Agent | `ODS` | `{project_knowledge}` | 激活 Sarah 做开源文档治理、写作分发和质量校验。 |
| `speclite-agent-tech-writer` | Agent | `WD` / `US` / `MG` / `VD` / `EC` | `{project_knowledge}` 或 `{planning_artifacts}` | 激活 Taylor 做技术写作、Mermaid、概念解释和文档验证。 |
| `speclite-brownfield-context-builder` | Workflow | `BB` | `{project_knowledge}/brownfield`、`{planning_artifacts}` | 把既有代码库恢复为证据化 baseline 和 planning handoff。 |
| `speclite-brownfield-backend-tech-stack-digger` | Workflow | - | 用户指定 output dir | 通用后端技术栈分析，基于代码事实生成 Markdown 技术栈报告。 |
| `speclite-brownfield-java-springboot-backend-tech-stack-digger` | Workflow | - | 用户指定 output dir | Java / Spring Boot 后端技术栈分析，处理 Maven / Gradle、BOM、Spring 生态和运行配置。 |
| `speclite-brownfield-nodejs-backend-tech-stack-digger` | Workflow | - | 用户指定 output dir | Node.js 后端技术栈分析，处理 package manager、lockfile、runtime、框架和中间件证据。 |
| `speclite-brownfield-python-backend-tech-stack-digger` | Workflow | - | 用户指定 output dir | Python 后端技术栈分析，处理 packaging、lockfile、ASGI / WSGI、框架和中间件证据。 |
| `speclite-document-project` | Workflow | `DP` | `{project_knowledge}` | 为既有项目生成面向规划的项目文档。 |
| `speclite-domain-research` | Workflow | `DR` | `{planning_artifacts}`、`{project_knowledge}` | 领域研究和术语上下文。 |
| `speclite-market-research` | Workflow | `MR` | `{planning_artifacts}`、`{project_knowledge}` | 市场、竞品和客户信号研究。 |
| `speclite-prfaq` | Workflow | `WB` | `{planning_artifacts}` | Working Backwards PRFAQ 产品概念挑战。 |
| `speclite-product-brief` | Workflow | `CB` | `{planning_artifacts}` | 创建或更新产品简报。 |
| `speclite-technical-research` | Workflow | `TR` | `{planning_artifacts}`、`{project_knowledge}` | 技术可行性、架构选项和实现风险研究。 |
| `speclite-write-opensource-docs` | Workflow | `OSD` | `{project_knowledge}` | 编写、迁移、脚手架和校验开源项目 `docs/`。 |

> Note: 4 个 `speclite-brownfield-*tech-stack-digger` 是 canonical package roots，并已在 `module-help.csv` 分配 menu code。后续新增 SDLC package root 时，必须同步至少一条 help/menu row。

## Planning（计划阶段）

| Skill | Type | Menu | Output | Purpose |
|---|---|---|---|---|
| `speclite-agent-pm` | Agent | `PM` | - | 激活 Paul 做产品规划和需求澄清。 |
| `speclite-agent-ux-designer` | Agent | `UX` | - | 激活 Uma 做 UX 设计和用户体验约束。 |
| `speclite-create-prd` | Workflow | `CP` | `{planning_artifacts}` | 创建产品需求文档。 |
| `speclite-create-ux-design` | Workflow | `CU` | `{planning_artifacts}` | 创建 UX 设计规格。 |
| `speclite-edit-prd` | Workflow | `EP` | `{planning_artifacts}` | 修订既有 PRD。 |
| `speclite-validate-prd` | Workflow | `VP` | `{planning_artifacts}` | 校验 PRD 完整性与可实施性。 |

## Solutioning（方案阶段）

| Skill | Type | Menu | Output | Purpose |
|---|---|---|---|---|
| `speclite-agent-architect` | Agent | `ARCH` | - | 激活 Adam 做架构方案和 readiness 对齐。 |
| `speclite-create-architecture` | Workflow | `CA` | `{planning_artifacts}` | 创建技术架构决策文档。 |
| `speclite-create-epics-and-stories` | Workflow | `CE` | `{planning_artifacts}` | 从 PRD / Architecture / UX 拆解 Epic 和 Story。 |
| `speclite-generate-project-context` | Workflow | `GPC` | `{output_folder}` | 生成 AI agent 使用的项目上下文。 |
| `speclite-check-implementation-readiness` | Workflow | `IR` | `{planning_artifacts}` | 检查 PRD、UX、Architecture、Epics 和 Stories 是否可进入实现。 |
| `speclite-story-review-01-reviewer` | Workflow | `SR` | `{implementation_artifacts}/story-reviews` | 执行 Story 设计审查。 |
| `speclite-story-review-02-evaluator` | Workflow | `SRE` | `{implementation_artifacts}/story-reviews` | 评估 Story Review findings。 |
| `speclite-story-review-03-fixer` | Workflow | `SRF` | `{implementation_artifacts}/story-reviews` | 按评估结论修订 Story 文档。 |

## Implementation（实现阶段）

| Skill | Type | Menu | Output | Purpose |
|---|---|---|---|---|
| `speclite-agent-dev` | Agent | `DEV` | - | 激活 David 做 Story 实现和 test-first 交付。 |
| `speclite-sprint-planning` | Workflow | `SP` | `{implementation_artifacts}` | 创建 sprint tracking 状态。 |
| `speclite-sprint-status` | Workflow | `SS` | - | 汇总 sprint 状态并推荐下一步。 |
| `speclite-flow-gate` | Workflow | `FG` | `{implementation_artifacts}/flow-gates` | 验证 Story / Epic flow gate。 |
| `speclite-create-story` | Workflow | `CS` / `VS` | `{implementation_artifacts}` | 创建或校验上下文完整的 Story。 |
| `speclite-dev-story` | Workflow | `DS` | - | 执行 Story 实现、测试和交付。 |
| `speclite-code-review-01-reviewer` | Workflow | `CR1` | `{implementation_artifacts}/code-reviews` | 执行代码审查。 |
| `speclite-code-review-02-evaluator` | Workflow | `CR2` | `{implementation_artifacts}/code-reviews` | 评估代码审查 findings。 |
| `speclite-code-review-03-fixer` | Workflow | `CR3` | `{implementation_artifacts}/code-reviews` | 按评估结论执行代码修复。 |
| `speclite-code-review-04-rules-extractor` | Workflow | `CR4` | `{implementation_artifacts}/cr-rules` | 从历史 CR 中提炼可复用规则。 |
| `speclite-code-review-05-todo-tracker` | Workflow | `CR5` | `{implementation_artifacts}/cr-rules` | 维护 CR TODO backlog。 |
| `speclite-code-review-06-finalizer` | Workflow | `CR6` | `{implementation_artifacts}` | 在 CR 通过后同步 Story 和 workflow 状态。 |
| `speclite-checkpoint-preview` | Workflow | `CK` | - | 帮助人工检查一次变更的目的、差异和风险。 |
| `speclite-qa-generate-e2e-tests` | Workflow | `QA` | `{implementation_artifacts}` | 生成自动化 API / E2E 测试。 |
| `speclite-qa-write-test-guide` | Workflow | `TG` | `{implementation_artifacts}` | 生成可执行 QA 测试指南。 |
| `speclite-quick-dev` | Workflow | `QQ` | `{implementation_artifacts}` | 把明确需求转成可审查实现补丁。 |
| `speclite-correct-course` | Workflow | `CC` | `{planning_artifacts}` | 处理 sprint 期间的重大范围或方向调整。 |
| `speclite-retrospective` | Workflow | `ER` | `{implementation_artifacts}` | 执行 Epic 或 sprint 复盘。 |

## DevOps（DevOps 阶段）

| Skill | Type | Menu | Output | Purpose |
|---|---|---|---|---|
| `speclite-npm-publisher` | Workflow | `NP` | `{devops_artifacts}/npm-releases` | 发布开源 Node.js package 到 npm，并保留证据化 release gate 报告。 |

## Related Contracts（相关契约）

| Contract | Source |
|---|---|
| SDLC module metadata、Agent roster 和 artifact directories | `assets/source/speclite/sdlc-skills/module.yaml` |
| menu code、phase、preceded-by / followed-by 和 output location | `assets/source/speclite/sdlc-skills/module-help.csv` |
| package root discovery | `src/modules/module-metadata.ts` |
| Agent 概念解释 | [`../../explanation/speclite-agents.md`](../../explanation/speclite-agents.md) |
| Workflow 概念解释 | [`../../explanation/speclite-workflows.md`](../../explanation/speclite-workflows.md) |

本文档由 speclite-agent-docs-steward Skill 自动生成
