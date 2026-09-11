# SDLC Workflows（SDLC 工作流）

本文按 SDLC 阶段记录 `assets/source/speclite/sdlc-skills/` 下的 canonical skill package roots。它是快速查阅用 Reference，不替代各 Skill 包内的 `SKILL.md`、`references/` 和 `assets/`。

## Snapshot（当前快照）

| Item | Value |
|---|---|
| Canonical source root | `assets/source/speclite/sdlc-skills/` |
| 当前 package roots | 49 个带 `SKILL.md` 的目录 |
| Agent roster | 7 个 `speclite-agent-*` role activation skills |
| Backend tech-stack boundary | 通用 backend tech-stack workflow 留在 SDLC；language / runtime specific backend workflows 已迁移到 ecosystem catalog |
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
| `speclite-document-project` | Workflow | `DP` | `{project_knowledge}` | 为既有项目生成面向规划的项目文档。 |
| `speclite-domain-research` | Workflow | `DR` | `{analysis_artifacts}/research` | 领域研究和术语上下文；可读取 Project Knowledge 作为输入。 |
| `speclite-market-research` | Workflow | `MR` | `{analysis_artifacts}/research` | 市场、竞品和客户信号研究；可读取 Project Knowledge 作为输入。 |
| `speclite-prfaq` | Workflow | `WB` | `{analysis_artifacts}/prfaq` | Working Backwards PRFAQ 产品概念挑战。 |
| `speclite-product-brief` | Workflow | `CB` | `{analysis_artifacts}/product-brief` | 创建或更新产品简报。 |
| `speclite-technical-research` | Workflow | `TR` | `{analysis_artifacts}/research` | 技术可行性、架构选项和实现风险研究；可读取 Project Knowledge 作为输入。 |
| `speclite-write-opensource-docs` | Workflow | `OSD` | `{project_knowledge}` | 编写、迁移、脚手架和校验开源项目 `docs/`。 |

> Note: language / runtime specific backend tech-stack workflows 是 optional ecosystem modules，见 [`ecosystem-skills.md`](ecosystem-skills.md)。后续新增 SDLC package root 时，必须同步至少一条 help/menu row。

## Planning（计划阶段）

| Skill | Type | Menu | Output | Purpose |
|---|---|---|---|---|
| `speclite-agent-pm` | Agent | `PM` | - | 激活 Paul 做产品规划和需求澄清。 |
| `speclite-agent-ux-designer` | Agent | `UX` | - | 激活 Uma 做 UX 设计和用户体验约束。 |
| `speclite-create-prd` | Workflow | `CP` | `{planning_artifacts}/prd` | 创建 canonical `prd/prd.md`。 |
| `speclite-create-ux-design` | Workflow | `CU` | `{planning_artifacts}/ux` | 创建 `ux-design-specification.md` 与条件 HTML 视觉产物。Exclusive create 通过 private `node "{skill-root}/scripts/ux-artifact-operation.mjs" create-file --project-root "{project-root}" --planning-root "{planning_artifacts}" --target "{target}" --source "{source-file}"` 执行；on-demand mkdir 使用同一 script 的 exact `create-directory` flags。该 binding 非 public CLI，并在 commit-time physical-owner/nearest-ancestor revalidation 后立即操作；stdout 只允许一个 JSON，non-zero、invalid JSON 或 `ok !== true` 均 HALT 且不推进状态。Markdown duplicate first-wins，local-ish HTML `&` fail closed；`design-system/` 按需创建。 |
| `speclite-edit-prd` | Workflow | `EP` | `{planning_artifacts}` | 修订既有 PRD。 |
| `speclite-validate-prd` | Workflow | `VP` | `{planning_artifacts}/prd/prd-validate-report-{yyyy-MM-dd}.md` | 通过 shared whole/sharded resolver 校验 PRD；invocation date 只生成一次并锁定 exact target。Private `scripts/prd-validation-report-operation.mjs` 在 report/progress write 前 probe 并以 `wx` exclusive create；target 已存在时使用 `artifact-path.prd-validation-report-exists` read-only block，给出“保留并移走或删除既有报告后重新运行”，不 overwrite/reuse/suffix/temp/progress mutation。Legacy report 仅原位 historical discovery，install/update/repair 不迁移。 |

## Solutioning（方案阶段）

| Skill | Type | Menu | Output | Purpose |
|---|---|---|---|---|
| `speclite-agent-architect` | Agent | `ARCH` | - | 激活 Adam 做架构方案和 readiness 对齐。 |
| `speclite-create-architecture` | Workflow | `CA` | `{solutioning_artifacts}/architecture` | 创建 canonical `architecture/architecture.md`。 |
| `speclite-create-epics-and-stories` | Workflow | `CE` | `{planning_artifacts}/epics` | 从 resolver-selected PRD / Architecture 与 UX 拆解 Epic 和 Story。 |
| `speclite-generate-project-context` | Workflow | `GPC` | `{output_folder}` | 生成 AI agent 使用的项目上下文。 |
| `speclite-implementation-readiness-check` | Workflow | `IR` | `{solutioning_artifacts}/implementation-readiness-report/grill-consistency/implementation-readiness-report-{yyyy-MM-dd}.md` | 检查 PRD、UX、Architecture、Epics 和 Stories 是否可进入实现；输出 root 只取自 artifact-root resolver。 |
| `speclite-implementation-readiness-grill-consistency-reviewer` | Workflow | `IRG` | `{solutioning_artifacts}/implementation-readiness-report/grill-consistency` | 对 PRD、UX、Architecture、Epics 和 Stories 做严格串行 implementation-readiness 一致性 grill。 |
| `speclite-create-technical-solution-document` | Workflow | `TSD` | `{project_knowledge}/tsd` | 在 implementation readiness 后综合规划产物与项目事实，生成面向人类评审和交付的技术方案说明文档。 |
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
| `speclite-code-review-contract` | Workflow | `CRC` | `{implementation_artifacts}/code-reviews/{story-id}-code-review` | 拥有 CR v2 共享契约与 Story-ID-only 目录解析规则（`speclite resolve cr-directory`）；不承接 CR 审批。 |
| `speclite-code-review-01-reviewer` | Workflow | `CR1` | `{implementation_artifacts}/code-reviews/{story-id}-code-review` | 在 resolved `crDir` 执行代码审查。 |
| `speclite-code-review-02-evaluator` | Workflow | `CR2` | `{implementation_artifacts}/code-reviews/{story-id}-code-review` | 在同一 resolved `crDir` 评估 findings。 |
| `speclite-code-review-03-fixer` | Workflow | `CR3` | `{implementation_artifacts}/code-reviews/{story-id}-code-review` | 按评估结论修复并在同目录追加 fix record。 |
| `speclite-code-review-04-rules-extractor` | Workflow | `CR4` | `{implementation_artifacts}/code-reviews/{story-id}-code-review` | 在同目录写 durable rules result。 |
| `speclite-code-review-05-todo-tracker` | Workflow | `CR5` | `{implementation_artifacts}/code-reviews/{story-id}-code-review` | 维护 shared backlog，并在同目录写 Story TODO result。 |
| `speclite-code-review-06-finalizer` | Workflow | `CR6` | `{implementation_artifacts}/code-reviews/{story-id}-code-review` | 同步 Story/workflow 状态并在同目录写 finalizer report。 |
| `speclite-goal-orchestrator-epic-story-review-runner` | Workflow | `ESR` | `{implementation_artifacts}/story-reviews` | 按 Epic 严格串行编排 SR reviewer / evaluator / fixer 循环和 goal execute records。 |
| `speclite-goal-orchestrator-epic-story-code-review-runner` | Workflow | `ECR` | `{implementation_artifacts}/code-reviews/{story-id}-code-review/goal-execute-records` | 通过 `speclite resolve cr-directory` 单次解析 `crDir` 并传给 CR01–06，严格串行编排 Dev Story、CR 循环和 goal records。 |
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

## Related Documents（相关文档）

| Contract | Source |
|---|---|
| SDLC module metadata、Agent roster 和 artifact directories | `assets/source/speclite/sdlc-skills/module.yaml` |
| menu code、phase、preceded-by / followed-by 和 output location | `assets/source/speclite/sdlc-skills/module-help.csv` |
| package root discovery | `src/modules/module-metadata.ts` |
| Agent 概念解释 | [`../../explanation/speclite-agents.md`](../../explanation/speclite-agents.md) |
| Workflow 概念解释 | [`../../explanation/speclite-workflows.md`](../../explanation/speclite-workflows.md) |
| CLI、Help、Agent、Workflow 与 support Skill 选择规则 | [`../../explanation/skill-taxonomy-and-sdlc.md`](../../explanation/skill-taxonomy-and-sdlc.md) |
| 第一次 brownfield baseline 教程 | [`../../tutorials/first-brownfield-project.md`](../../tutorials/first-brownfield-project.md) |

本文档由 speclite-agent-docs-steward Skill 自动生成
