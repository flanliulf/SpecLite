# BMAD To SpecLite Skill Mapping（BMAD 到 SpecLite Skill 映射）

## Purpose（目的）

本文档记录 BMAD skill 与 SpecLite canonical skill 源定义之间的工作映射。它的用途不是说明 SpecLite 运行时要安装 BMAD，而是帮助团队把使用 BMAD 开发 SpecLite 过程中暴露出的流程问题，系统性反馈到 SpecLite canonical skill 源定义中。

当 BMAD 的原生 workflow 在本项目开发过程中出现问题时，应先在本文件中定位对应的 SpecLite skill，再判断是否需要修改 `core-skills/`、`sdlc-skills/`、模板、checklist、lint 规则或 flow gate。

## Scope（范围）

本映射覆盖三类对象：

- BMAD 原生 skill：本项目当前研发过程中实际使用或参考的 upstream workflow。
- SpecLite canonical skill：位于 `core-skills/` 与 `sdlc-skills/` 的目标方法论源定义。
- SpecLite support skill：位于 `support-skills/`，用于创建、迁移、检查和迭代 canonical skill 源定义，不属于目标项目运行时 SDLC 方法论的安装集合。

## Mapping Rules（映射规则）

- `DIRECT`：SpecLite 保留同等工作流语义，并按 SpecLite 路径、产物和运行模型改造。
- `ADAPTED`：SpecLite 保留核心意图，但会按 SpecLite 的 artifact taxonomy、gate、template 或 review chain 重构。
- `SPLIT_CHAIN`：BMAD 单入口或较粗粒度能力，在 SpecLite 中拆成编号链路或多个协作 skill。
- `SPECLITE_ONLY`：SpecLite 为解决自身方法论和流程可靠性新增的能力，BMAD 无直接同名来源。
- `SUPPORT_ONLY`：只服务 canonical skill 源定义的创建和维护，不作为目标项目运行时 SDLC skill。

当前所有标记为 `DIRECT` 和 `SPLIT_CHAIN` 的 SpecLite canonical skill，都是以对应 BMAD skill 定义为参考，通过 `support-skills/speclite-skill-creator` 进行体系化和自定义创建，并通过 `support-skills/speclite-skill-lint` 进行结构、密度、runtime model 和迁移一致性检查后沉淀而来。后续新增或重构这两类映射时，也应继续把这两个 support skill 作为 canonical skill 体系建设的基础支撑工具。

固定源码路径、anchor 文件名或产物路径不应在映射中被当作硬门控。只有 owning SPEC、template 或明确 contract 要求固定路径时，固定路径才可成为 hard gate；否则必须优先按 `Contract -> Functional -> Evidence` 判断等价实现。

## Core Skills Mapping（Core Skills 映射）

| BMAD Skill | SpecLite Canonical Skill | Type | Notes（说明） |
| --- | --- | --- | --- |
| `bmad-advanced-elicitation` | `core-skills/speclite-advanced-elicitation` | DIRECT | 保留深入追问、反思和改进近期输出的能力。 |
| `bmad-brainstorming` | `core-skills/speclite-brainstorming` | DIRECT | 保留结构化头脑风暴能力，并按 SpecLite 输出语境调整。 |
| `bmad-customize` | `core-skills/speclite-customize` | ADAPTED | 用于 SpecLite customization 覆盖语义，不应引用 BMAD runtime 路径。 |
| `bmad-distillator` | `core-skills/speclite-distillator` | DIRECT | 保留 LLM 优化压缩文档的能力。 |
| `bmad-editorial-review-prose` | `core-skills/speclite-editorial-review-prose` | DIRECT | 保留 prose 级编辑审查。 |
| `bmad-editorial-review-structure` | `core-skills/speclite-editorial-review-structure` | DIRECT | 保留结构级编辑审查。 |
| `bmad-help` | `core-skills/speclite-help` | ADAPTED | 帮助入口必须推荐 SpecLite skill、目录和产物路径。 |
| `bmad-index-docs` | `core-skills/speclite-index-docs` | DIRECT | 保留目录索引生成能力。 |
| `bmad-party-mode` | `core-skills/speclite-party-mode` | ADAPTED | 多 agent 协作语义保留，输出和 agent 路由按 SpecLite 调整。 |
| `bmad-review-adversarial-general` | `core-skills/speclite-review-adversarial-general` | DIRECT | 作为 review chain 的 Blind Hunter 支撑能力。 |
| `bmad-review-edge-case-hunter` | `core-skills/speclite-review-edge-case-hunter` | DIRECT | 作为 review chain 的 Edge Case Hunter 支撑能力。 |
| BMAD acceptance review pattern | `core-skills/speclite-review-acceptance-auditor` | ADAPTED | 对照 Story AC、contract、evidence 做验收审计。 |
| `bmad-shard-doc` | `core-skills/speclite-shard-doc` | DIRECT | 保留文档拆分能力。 |

## SDLC Skills Mapping（SDLC Skills 映射）

| BMAD Skill | SpecLite Canonical Skill | Type | Notes（说明） |
| --- | --- | --- | --- |
| `bmad-agent-analyst` | `sdlc-skills/1-analysis/speclite-agent-analyst` | DIRECT | 分析师 persona 和发现阶段能力。 |
| `bmad-agent-tech-writer` | `sdlc-skills/1-analysis/speclite-agent-tech-writer` | DIRECT | 技术写作 persona。 |
| `bmad-document-project` | `sdlc-skills/1-analysis/speclite-document-project` | ADAPTED | Brownfield 文档化输出应落到 SpecLite project knowledge 结构。 |
| `bmad-domain-research` | `sdlc-skills/1-analysis/research/speclite-domain-research` | DIRECT | 领域研究能力。 |
| `bmad-market-research` | `sdlc-skills/1-analysis/research/speclite-market-research` | DIRECT | 市场研究能力。 |
| `bmad-technical-research` | `sdlc-skills/1-analysis/research/speclite-technical-research` | DIRECT | 技术研究能力。 |
| `bmad-prfaq` | `sdlc-skills/1-analysis/speclite-prfaq` | DIRECT | Working Backwards / PRFAQ 能力。 |
| `bmad-product-brief` | `sdlc-skills/1-analysis/speclite-product-brief` | DIRECT | 产品简报能力。 |
| Brownfield context builder pattern | `sdlc-skills/1-analysis/speclite-brownfield-context-builder` | SPECLITE_ONLY | 用于恢复既有系统基线并交给后续 planning workflow。 |
| `bmad-agent-pm` | `sdlc-skills/2-plan-workflows/speclite-agent-pm` | DIRECT | PM persona。 |
| `bmad-agent-ux-designer` | `sdlc-skills/2-plan-workflows/speclite-agent-ux-designer` | DIRECT | UX persona。 |
| `bmad-create-prd` | `sdlc-skills/2-plan-workflows/speclite-create-prd` | ADAPTED | PRD 创建输出必须遵守 SpecLite artifact 路径和章节约定。 |
| `bmad-edit-prd` | `sdlc-skills/2-plan-workflows/speclite-edit-prd` | ADAPTED | PRD 修订能力，需保持 SpecLite contract 边界。 |
| `bmad-validate-prd` | `sdlc-skills/2-plan-workflows/speclite-validate-prd` | ADAPTED | PRD validation 应反馈到 SpecLite readiness 和 planning gates。 |
| `bmad-create-ux-design` | `sdlc-skills/2-plan-workflows/speclite-create-ux-design` | ADAPTED | UX 输出按 SpecLite planning artifacts 组织。 |
| `bmad-agent-architect` | `sdlc-skills/3-solutioning/speclite-agent-architect` | DIRECT | 架构师 persona。 |
| `bmad-create-architecture` | `sdlc-skills/3-solutioning/speclite-create-architecture` | ADAPTED | 架构产物需对齐 SpecLite specs、ADRs 和 implementation readiness。 |
| `bmad-create-epics-and-stories` | `sdlc-skills/3-solutioning/speclite-create-epics-and-stories` | ADAPTED | Epic / Story 拆分应输出可被 `speclite-create-story` 消费的前置约束。 |
| `bmad-check-implementation-readiness` | `sdlc-skills/3-solutioning/speclite-check-implementation-readiness` | ADAPTED | Readiness gate 应检查 PRD、UX、Architecture、Epics、Specs 和 project context 的一致性。 |
| `bmad-generate-project-context` | `sdlc-skills/3-solutioning/speclite-generate-project-context` | ADAPTED | Project context 生成必须避免把源码路径写成 runtime 依赖。 |
| BMAD Story Review pattern | `sdlc-skills/3-solutioning/speclite-story-review-01-reviewer` | SPLIT_CHAIN | SR 审查链路入口，执行结构、契约和一致性审查。 |
| BMAD Story Review evaluation pattern | `sdlc-skills/3-solutioning/speclite-story-review-02-evaluator` | SPLIT_CHAIN | 评估 SR findings 的有效性和处置结论。 |
| BMAD Story Review fix pattern | `sdlc-skills/3-solutioning/speclite-story-review-03-fixer` | SPLIT_CHAIN | 按 SR 评估结论修订 Story 文档。 |
| `bmad-agent-dev` | `sdlc-skills/4-implementation/speclite-agent-dev` | DIRECT | 开发者 persona。 |
| `bmad-create-story` | `sdlc-skills/4-implementation/speclite-create-story` | ADAPTED | Story 输出应位于 `{implementation_artifacts}/stories/`，并显式表达 dependency gate、anchor policy 和 evidence plan。 |
| `bmad-dev-story` | `sdlc-skills/4-implementation/speclite-dev-story` | ADAPTED | Story 开发前后应调用 flow gate，避免推进状态后才发现 anchor drift。 |
| BMAD no direct equivalent | `sdlc-skills/4-implementation/speclite-flow-gate` | SPECLITE_ONLY | 为 story/epic kickoff 与 completion 增加显式门控，区分 contract、function、evidence 和 decision-needed。 |
| `bmad-sprint-planning` | `sdlc-skills/4-implementation/speclite-sprint-planning` | ADAPTED | Sprint status 的 Story 位置应统一指向 `{implementation_artifacts}/stories`。 |
| `bmad-sprint-status` | `sdlc-skills/4-implementation/speclite-sprint-status` | ADAPTED | 状态查询应提示缺失或过期的 flow gate，而不是只推荐进入 dev-story。 |
| `bmad-code-review` | `sdlc-skills/4-implementation/speclite-code-review-01-reviewer` plus `02`-`06` | SPLIT_CHAIN | 非编号 `speclite-code-review` 不再是 canonical 入口；CR 从 `01-reviewer` 开始，并由 evaluator、fixer、rules、todo、finalizer 完成链路。 |
| `bmad-correct-course` | `sdlc-skills/4-implementation/speclite-correct-course` | ADAPTED | Sprint 中重大调整应更新 SpecLite 状态和 artifact，而不是只生成讨论结论。 |
| `bmad-checkpoint-preview` | `sdlc-skills/4-implementation/speclite-checkpoint-preview` | DIRECT | 人机协同 checkpoint review。 |
| `bmad-qa-generate-e2e-tests` | `sdlc-skills/4-implementation/speclite-qa-generate-e2e-tests` | ADAPTED | QA 生成应引用 SpecLite story、fixture 和 test evidence。 |
| `bmad-quick-dev` | `sdlc-skills/4-implementation/speclite-quick-dev` | ADAPTED | 快速开发仍需遵守 SpecLite contract 和 artifact 边界。 |
| `bmad-retrospective` | `sdlc-skills/4-implementation/speclite-retrospective` | ADAPTED | 回顾结论应能反馈到 canonical skill、template、lint 或 gate。 |

## Support Skills Boundary（Support Skills 边界）

| SpecLite Support Skill | Type | Notes（说明） |
| --- | --- | --- |
| `support-skills/speclite-skill-creator` | SUPPORT_ONLY | 支持创建、迁移和迭代 SpecLite canonical skill 源定义；不是目标项目运行时 SDLC 方法论的一部分。 |
| `support-skills/speclite-skill-lint` | SUPPORT_ONLY | 支持检查 canonical skill 源定义的结构、密度、runtime model 和 migration 对齐；不是目标项目运行时 SDLC 方法论的一部分。 |

`support-skills/` 的问题反馈对象是 skill 源定义本身。除非某个目标项目明确选择安装这些 authoring support 工具，否则不应把它们写入目标项目的默认 AI IDE runtime install set。

在 SpecLite canonical skill 源体系建设中，`speclite-skill-creator` 和 `speclite-skill-lint` 是基础支撑 skill：前者负责把 BMAD 参考定义体系化改造成 SpecLite skill 源包，后者负责检查改造后的包是否符合 SpecLite 的结构、语义和 runtime 约束。

## Feedback Workflow（反馈流程）

当 BMAD 使用过程中出现流程问题时，按以下顺序处理：

1. 记录问题发生的 BMAD skill、输入、输出、HALT 条件和证据。
2. 在本映射中找到对应的 SpecLite canonical skill 或 split chain。
3. 判断问题类型：contract drift、functional drift、evidence drift、template drift、path drift、state transition drift 或 review gate drift。
4. 检查对应 SpecLite skill 是否存在同类风险。
5. 若问题具有通用性，优先修改 canonical skill、template、checklist、lint rule 或 flow gate，而不是只修一个具体 Story。
6. 增加 regression scenario，确保同类问题不会在下一个 story、epic 或 review chain 中重复出现。
7. 更新本映射或相关背景文档，记录新的映射、例外或维护规则。

## Maintenance Rules（维护规则）

- 新增、重命名、拆分或删除 canonical skill 时，必须同步更新本映射。
- BMAD workflow 的失败案例不能直接等同于 SpecLite 设计缺陷；必须通过映射和证据判断是否存在对应风险。
- SpecLite-only skill 出现后，应明确它解决的是 BMAD 缺口、SpecLite 运行模型需求，还是本项目研发经验沉淀。
- Split chain 不允许被简化回已删除的聚合入口。例如 CR 链路应指向 `speclite-code-review-01-reviewer` 到 `06-finalizer`，不应恢复非编号 `speclite-code-review`。
