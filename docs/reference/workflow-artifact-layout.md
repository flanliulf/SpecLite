# Workflow Artifact Layout（Workflow 产物目录结构）

本文介绍 SpecLite 安装到目标项目后，Skills 在 runtime 执行过程中如何形成 `_speclite-output/` 目录。它回答“哪些目录由安装器预创建、哪些文件由 Workflow 按需生成、谁负责维护，以及哪些路径只是输入或保留位”。

本文中的路径均为默认值。目标项目可以通过 runtime config 修改输出根目录，因此执行时应以 `speclite resolve config --project-root <project-root>` 的结果为准。

## Scope and Boundaries（范围与边界）

SpecLite 的 source、runtime projection 和 workflow artifacts 分属三个层次：

| Layer | Default Path | Responsibility |
|---|---|---|
| Canonical source | `assets/source/speclite/` | 定义 Module、Skill、Hook、默认配置和输出契约。 |
| Runtime projection | `_speclite/`、`.agents/skills/`、`.claude/skills/` | 由 installer 写入目标项目，供 CLI、Hook 和 AI IDE 执行。 |
| Workflow artifacts | `_speclite-output/` | 由已安装 Skill 在研发过程中创建和维护，记录规划、实现、评审与发布证据。 |

`_speclite-output/` 不是 canonical source mirror，也不是 SpecLite 源仓库自身的 `_bmad-output/`。只有方法论或 Skill 契约本身需要修订时，才应回到 `assets/source/speclite/`；目标项目的执行产物应保留在目标项目中。

## Source of Truth（事实来源）

目录结构由多个契约共同形成，应按以下顺序理解：

1. 目标项目解析后的 runtime config 决定实际根路径。
2. `core-skills/module.yaml` 和 `sdlc-skills/module.yaml` 定义默认路径与安装时预创建目录。
3. 各 Skill 的 `SKILL.md`、`references/` 和 `assets/` 定义实际写入时机、动态子目录与文件名。
4. `module-help.csv` 提供面向用户的输出位置 catalog，但不替代单个 Skill 的写入规约。

当 catalog、预创建目录和 Skill 写入规约不一致时，不能把它们静默合并成一个并不存在的契约。本文会将这类差异明确标为“当前差异”。

## Configuration Mapping（配置映射）

默认输出路径由 Core 与 SDLC Module 组合得到：

| Config Key | Default Value | Purpose |
|---|---|---|
| `core.output_folder` | `{project-root}/_speclite-output` | Core Workflow 的默认输出根；三类 SDLC artifact root 默认从该路径派生。长期知识、用户指定输出和存在差异的 Workflow 可以写入其他路径。 |
| `modules.sdlc.planning_artifacts` | `{output_folder}/planning-artifacts` | 分析、产品、UX、架构与 readiness 产物。 |
| `modules.sdlc.implementation_artifacts` | `{output_folder}/implementation-artifacts` | Sprint、Story、Flow Gate、Review、QA 与 Retrospective 产物。 |
| `modules.sdlc.devops_artifacts` | `{output_folder}/devops-artifacts` | CI/CD、deployment 与 release 产物。 |
| `modules.sdlc.project_knowledge` | `{project-root}/docs` | 长期项目知识；默认不在 `_speclite-output/` 中。 |

> Note: `{project_knowledge}` 与 `_speclite-output/` 是不同的持久化面。Brownfield baseline、公开文档或其他长期知识可能写入 `docs/`，不应为了目录整齐强制迁入 artifact root。

## Default Directory Tree（默认目录树）

下面的树同时展示安装时预创建目录与 Skill 运行后可能出现的主要动态产物。未执行对应 Skill 时，动态路径不会出现。

```text
_speclite-output/
├── brainstorming/
│   └── brainstorming-session-{date}-{time}.md
├── project-context.md
├── planning-artifacts/                         # 安装时预创建
│   ├── epics/                                  # 安装时预创建；也可承载 epics shards
│   ├── research/
│   │   ├── domain-{research_topic_slug}-research-{date}.md
│   │   ├── market-{research_topic_slug}-research-{date}.md
│   │   └── technical-{research_topic_slug}-research-{date}.md
│   ├── ir-grill/
│   │   ├── summary.md
│   │   └── goal-execute-records/
│   │       └── round-{N}/
│   │           ├── PLAN.md
│   │           ├── EXPERIMENTS.md
│   │           └── EXPERIMENT_NOTES.md
│   ├── product-brief-{project_name}.md
│   ├── product-brief-{project_name}-distillate.md
│   ├── prfaq-{project_name}.md
│   ├── prfaq-{project_name}-distillate.md
│   ├── brownfield-planning-brief.md
│   ├── candidate-change-slices.md
│   ├── feature-entry-points.md
│   ├── prd.md
│   ├── ux-design-specification.md
│   ├── ux-color-themes.html
│   ├── ux-design-directions.html
│   ├── architecture.md
│   ├── epics.md
│   ├── implementation-readiness-report-{date}.md
│   └── sprint-change-proposal-{date}.md
├── implementation-artifacts/                  # 安装时预创建
│   ├── sprint-status.yaml
│   ├── stories/                                # 安装时预创建
│   │   └── {story-key}.md
│   ├── flow-gates/                             # 安装时预创建
│   │   ├── {story-key}-story-kickoff-gate.md
│   │   ├── {story-key}-story-completion-gate.md
│   │   ├── epic-{N}-kickoff-gate.md
│   │   └── epic-{N}-completion-gate.md
│   ├── story-reviews/                          # 安装时预创建
│   │   ├── epic-{epic-id}-story-review/
│   │   │   ├── epic-{epic-id}-story-review-summary-{YYYYMMDD}-round-{n}.md
│   │   │   ├── epic-{epic-id}-story-review-evaluation-{YYYYMMDD}-round-{m}.md
│   │   │   └── goal-execute-records/
│   │   │       ├── PLAN.md
│   │   │       ├── EXPERIMENTS.md
│   │   │       └── EXPERIMENT_NOTES.md
│   │   └── {story-id}-story-review/
│   │       ├── {story-id}-story-review-summary-{YYYYMMDD}-round-{n}.md
│   │       └── {story-id}-story-review-evaluation-{YYYYMMDD}-round-{m}.md
│   ├── code-reviews/                           # 安装时预创建
│   │   └── {story-id}-code-review/
│   │       ├── {story-id}-code-review-summary-{YYYYMMDD}-round-{n}.md
│   │       ├── {story-id}-code-review-evaluation-{YYYYMMDD}-round-{m}.md
│   │       └── goal-execute-records/
│   │           ├── PLAN.md
│   │           ├── EXPERIMENTS.md
│   │           └── EXPERIMENT_NOTES.md
│   ├── cr-rules/                               # 安装时预创建
│   │   └── cr-todo-backlog.md
│   ├── retrospectives/                         # 安装时预创建；见“当前差异”
│   ├── tests/
│   │   └── test-summary.md
│   ├── spec-{slug}.md
│   ├── deferred-work.md
│   ├── epic-{N}-context.md
│   └── epic-{N}-retro-{date}.md
└── devops-artifacts/                           # 安装时预创建
    ├── ci-cd/                                  # 安装时预创建的保留目录
    ├── deployments/                            # 安装时预创建的保留目录
    └── npm-releases/                           # 安装时预创建；见“当前差异”
```

`speclite-shard-doc` 可以把 `prd.md`、`architecture.md`、`ux-design-specification.md`、`epics.md` 或其他大文档转换为同级的 `*/index.md` 与 shard 文件。该转换由目标文件和用户选择决定，因此 `prd/`、`architecture/`、`ux-design-specification/`、`epics/` 以及可能的 `archive/` 都属于合法派生结构，但不是首次运行基础 Workflow 时必然存在的目录。

## Root and Planning Artifacts（根目录与规划产物）

| Path or Pattern | Producer Skill | Creation and Maintenance |
|---|---|---|
| `brainstorming/brainstorming-session-{date}-{time}.md` | `speclite-brainstorming` | 每次 session 按时间创建或续写，不属于 `planning-artifacts/`。 |
| `project-context.md` | `speclite-generate-project-context` | 在输出根目录创建，跨迭代持续维护 AI agent 需要的项目规则。 |
| `planning-artifacts/research/*.md` | `speclite-domain-research`、`speclite-market-research`、`speclite-technical-research` | 按研究类型、主题和日期新增。 |
| `planning-artifacts/product-brief-*.md` | `speclite-product-brief` | 主 brief 分阶段增量维护；distillate 按用户选择创建。 |
| `planning-artifacts/prfaq-*.md` | `speclite-prfaq` | 主 PRFAQ 跨 stage 增量维护；完成时生成 distillate。 |
| `planning-artifacts/brownfield-planning-brief.md`、`candidate-change-slices.md`、`feature-entry-points.md` | `speclite-brownfield-context-builder` | 条件生成 planning handoff，也可按配置写入 `{brownfield_output}/planning/`；主要 baseline 默认位于 `{project_knowledge}/brownfield/`。 |
| `planning-artifacts/prd.md` | `speclite-create-prd`、`speclite-edit-prd` | 创建后原位增量维护，是下游 Architecture 与 Epics 的 living contract。 |
| PRD 邻接 validation report | `speclite-validate-prd` | 写在被校验 PRD 旁边；当前 canonical source 未固定文件名构造规则。 |
| `planning-artifacts/ux-design-specification.md` | `speclite-create-ux-design` | 增量维护 UX 主规格；两个 HTML 文件是条件生成的视觉化派生产物。 |
| `planning-artifacts/architecture.md` | `speclite-create-architecture` | 只有用户选择 Continue 后才追加并推进 frontmatter。 |
| `planning-artifacts/epics.md` | `speclite-create-epics-and-stories` | 逐步写入 Epic 与 Story 规划；可在后续 shard。 |
| `planning-artifacts/implementation-readiness-report-{date}.md` | `speclite-check-implementation-readiness` | 日期化 readiness snapshot。 |
| `planning-artifacts/ir-grill/**` | `speclite-ir-grill-consistency-reviewer` | 每轮新增 `round-{N}` 记录，`summary.md` 用于阶段性汇总。 |
| `planning-artifacts/sprint-change-proposal-{date}.md` | `speclite-correct-course` | 日期化重大变更提案。 |

Agent 写作、Mermaid、文档校验和部分 ecosystem auditor 的输出位置可由用户指定。它们可以写入 `{planning_artifacts}`，但没有统一固定文件名，不应据此增加虚构的必选子目录。

## Implementation Artifacts（实现产物）

| Path or Pattern | Producer or Updater | Creation and Maintenance |
|---|---|---|
| `sprint-status.yaml` | `speclite-sprint-planning` 创建；`speclite-create-story`、`speclite-dev-story`、`speclite-sprint-status`、`speclite-quick-dev`、`speclite-code-review-06-finalizer`、`speclite-retrospective` 更新 | Sprint 级 tracker-ledger，保留既有更先进状态，避免状态降级。 |
| `stories/{story-key}.md` | `speclite-create-story` 创建；`speclite-dev-story`、`speclite-story-review-03-fixer`、`speclite-code-review-06-finalizer` 更新 | Story 的 living execution contract。 |
| `flow-gates/*.md` | `speclite-flow-gate` | 针对 Story / Epic transition 创建 gate snapshot；YAML frontmatter 是下游 machine contract。 |
| `story-reviews/{scope}-story-review/*.md` | `speclite-story-review-01-reviewer`、`speclite-story-review-02-evaluator` 创建；`speclite-story-review-03-fixer` 追加修订记录 | Epic 或 Story 粒度的轮次化设计审查轨迹。 |
| `code-reviews/{story-id}-code-review/*.md` | `speclite-code-review-01-reviewer`、`speclite-code-review-02-evaluator` 创建；`speclite-code-review-03-fixer` 追加修复记录 | Story 粒度的轮次化代码审查轨迹。 |
| `story-reviews/**/goal-execute-records/` | `speclite-goal-orchestrator-epic-story-review-runner` | 严格串行 Story Review 的执行账本，固定包含 `PLAN.md`、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md`。 |
| `code-reviews/**/goal-execute-records/` | `speclite-goal-orchestrator-epic-story-code-review-runner` | 严格串行 Story 实现与 Code Review 的执行账本，固定包含 `PLAN.md`、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md`。 |
| `cr-rules/cr-todo-backlog.md` | `speclite-code-review-05-todo-tracker` | 跨 Story 延迟事项账本，编号持续递增，状态从 Open 推进到 Resolved。 |
| `tests/test-summary.md` | `speclite-qa-generate-e2e-tests` | 记录自动化测试生成结果；真实测试代码写入目标项目的测试目录。 |
| `spec-{slug}.md` | `speclite-quick-dev` | Quick Dev 的 living spec，随实现流程推进状态。 |
| `deferred-work.md` | `speclite-quick-dev` | 条件追加延期事项，跨 Quick Dev 任务保留。 |
| `epic-{N}-context.md` | `speclite-quick-dev` | 可重建 cache；planning artifacts 更新后可能失效。 |
| `epic-{N}-retro-{date}.md` | `speclite-retrospective` | Epic 完成后的日期化复盘 snapshot。 |

SR / CR 目录中的 `.tmp/` 只保存审查中间数据，并应在审查完成时清理。它是 transient runtime path，不属于需要长期提交的 artifact。

`speclite-qa-write-test-guide` 由用户指定或根据仓库事实推导目标路径；无法确定时 Workflow 应停止并询问，因此当前没有固定的 `test-guides/` 子目录契约。

当 runtime 无法启动 review subagents 时，`speclite-quick-dev` 会在 `{implementation_artifacts}` 下生成三份 reviewer prompt 文件，并停止等待人工执行。Canonical Workflow 未规定这些文件的稳定名称，因此它们不列入默认目录树。

## DevOps Artifacts（DevOps 产物）

SDLC Module 会预创建 `devops-artifacts/`、`ci-cd/`、`deployments/` 和 `npm-releases/`，为发布与运维 Workflow 提供稳定落点。

当前只有 `speclite-npm-publisher` 在 help catalog 中声明 `{devops_artifacts}/npm-releases`。`ci-cd/` 和 `deployments/` 目前是保留目录，不能仅凭目录存在推断已有 canonical producer。

Selected ecosystem modules 可能把审计报告写入 `{devops_artifacts}` 或 `{planning_artifacts}`，也可能写入 `{project_knowledge}`。只有显式选择并运行对应 ecosystem Skill 后，相关文件才会出现。

## External Inputs and Updater-Only Paths（外部输入与仅更新路径）

以下路径会被 Skill 或 Hook 读取，但不能当作这些消费者自动生成的输出：

| Path | Consumer | Contract |
|---|---|---|
| `implementation-artifacts/foundation-handoff/source-index.json` | `speclite-flow-gate` | Project-provided input；也可用 Story / Epic 显式引用替代。 |
| `planning-artifacts/speclite-workflow-status.yaml` | `speclite-code-review-06-finalizer` | Updater-only path；存在时更新，不存在时跳过，当前未发现 canonical creator。 |
| `flow-gates/{story-key}-story-kickoff-gate.md` | `flow-gate-enforcement` Hook | 报告由 `speclite-flow-gate` 生成；Hook 只读取 frontmatter，不生成报告，也不推进状态。 |

同理，Agent activation Skills、`speclite-sprint-status`、editorial review helpers 和 checkpoint 类 Skills 可能主要读取、汇总或原位修改已有内容，不一定创建新的 artifact subtree。

## Ownership and Lifecycle（所有权与生命周期）

`_speclite-output/` 默认属于 `workflow-owned`：

- `speclite update` 会跳过这些路径。
- `speclite update --repair` 不会自动重建真实研发过程产物。
- `speclite uninstall` 不会自动删除，而是要求人工处理。

维护目录时可以使用以下生命周期分类，但它是治理模型，不是强制写入每个文件的 metadata：

| Lifecycle | Typical Artifacts | Expected Behavior |
|---|---|---|
| `iteration-snapshot` | brainstorming、research、readiness、Flow Gate、SR / CR round、retrospective | 新建日期化或轮次化文件，保留历史证据。 |
| `living-contract` | PRD、UX、Architecture、Epics、Story、Quick Dev spec | 在同一产品或 Story 生命周期内增量维护，必要时 shard。 |
| `tracker-ledger` | `sprint-status.yaml`、`cr-todo-backlog.md`、`goal-execute-records/`、`deferred-work.md` | 保留历史，状态单调推进，不因重新运行而倒退。 |
| `cache / transient` | review `.tmp/`、`epic-{N}-context.md` | 可清理或按上游事实重建，不能充当长期 truth source。 |
| `promoted-knowledge` | brownfield baseline、确认后的开发规则、项目公开文档 | 通常沉淀到 `{project_knowledge}`，不强制留在 artifact root。 |

## Current Differences（当前差异）

当前 canonical source 中存在几处尚未完全对齐的路径契约。文档消费者和维护者应以实际 Skill 规约为准，并在后续 canonical source 变更中显式收口。

| Area | Declared Layout | Current Skill Behavior |
|---|---|---|
| Retrospective | `module.yaml` 预创建 `implementation-artifacts/retrospectives/`，CR / SR config 也引用该目录。 | `speclite-retrospective` 当前写入 `implementation-artifacts/epic-{N}-retro-{date}.md` 根目录。 |
| npm release report | `module.yaml` 与 `module-help.csv` 声明 `devops-artifacts/npm-releases/`。 | `speclite-npm-publisher` 当前仍写入 legacy `.specskills/output/devops/speclite-npm-publisher/<package-name>-<version>-release-report.md`，因此 `npm-releases/` 暂无已对齐的 canonical writer。 |
| CR rules | Catalog 将 `speclite-code-review-04-rules-extractor` 输出定位到 `implementation-artifacts/cr-rules/`。 | CR4 当前只输出分析与建议，等待确认后更新项目文档；稳定落盘者是 CR5 的 `cr-todo-backlog.md`。 |
| PRD validation | Catalog 将报告归入 planning artifacts。 | Workflow 要求报告与 PRD 相邻，但未静态定义 `validationReportPath` 的文件名规则。 |

`review-artifacts/` 和 `research-artifacts/` 有时用于描述概念分类，但它们不是当前 `module.yaml` 声明的默认顶层目录。默认实际结构是：research 位于 `planning-artifacts/research/`，SR / CR 位于 `implementation-artifacts/` 下。

## Related Documents（相关文档）

| Topic | Link |
|---|---|
| 安装后的 runtime、IDE mirrors 与 Hook 布局 | [`runtime-layout.md`](runtime-layout.md) |
| canonical source 目录与 Module 边界 | [`canonical-source-layout.md`](canonical-source-layout.md) |
| SDLC Skills 的阶段与输出 catalog | [`skills/sdlc-workflows.md`](skills/sdlc-workflows.md) |
| installer-owned、human-owned、workflow-owned 保护模型 | [`../explanation/file-ownership-model.md`](../explanation/file-ownership-model.md) |
| Workflow 的渐进式披露与执行边界 | [`../explanation/speclite-workflows.md`](../explanation/speclite-workflows.md) |
| Workflow artifact 术语 | [`glossary/workflow-artifact.md`](glossary/workflow-artifact.md) |
| Runtime 三层边界 | [`../explanation/runtime-boundaries.md`](../explanation/runtime-boundaries.md) |
| Flow Gate 与 downstream handoff 契约 | [`flow-gate-handoff-contract.md`](flow-gate-handoff-contract.md) |

主要 canonical anchors：

`support-skills/**` 属于 SpecLite canonical source 维护工具，不是目标项目默认 selected runtime module，因此不构成本文的 `_speclite-output/` 目录条目。

- `assets/source/speclite/core-skills/module.yaml`
- `assets/source/speclite/core-skills/module-help.csv`
- `assets/source/speclite/sdlc-skills/module.yaml`
- `assets/source/speclite/sdlc-skills/module-help.csv`
- `assets/source/speclite/core-skills/**/SKILL.md`
- `assets/source/speclite/sdlc-skills/**/SKILL.md`
- `assets/source/speclite/ecosystems/**/SKILL.md`
- `assets/source/speclite/ecosystems/**/module-help.csv`
