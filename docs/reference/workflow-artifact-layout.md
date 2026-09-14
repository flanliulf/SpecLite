# Workflow Artifact Layout（Workflow 产物目录结构）

本文介绍 SpecLite 安装到目标项目后，Skills 在 runtime 执行过程中如何形成 `_speclite-output/` 目录。它回答“哪些目录由安装器预创建、哪些文件由 Workflow 按需生成、谁负责维护，以及哪些路径只是输入或保留位”。

本文中的路径均为默认值。目标项目可以通过 runtime config 修改输出根目录。执行时，非 artifact-root runtime fields 以 `speclite resolve config --project-root <project-root>` 的 raw merged config 为准；effective artifact roots 以 `speclite resolve artifact-roots --project-root <project-root>` 返回的 `resolvedRoot`、`resolutionMode` 与 provenance 为准。

## Scope and Boundaries（范围与边界）

SpecLite 的 source、runtime projection 和 workflow artifacts 分属三个层次：

| Layer | Default Path | Responsibility |
|---|---|---|
| Canonical source | `assets/source/speclite/` | 定义 Module、Skill、Hook、默认配置和输出契约。 |
| Runtime projection | `_speclite/`、`.agents/skills/`、`.claude/skills/` | 由 installer 写入目标项目，供 CLI、Hook 和 AI IDE 执行。 |
| Workflow artifacts | `_speclite-output/{0..5}-*-artifacts/`、`_speclite-output/project-knowledge-base/` | 由已安装 Skill 在研发过程中创建和维护，按七个 workflow-owned filesystem planes 记录规划、实现、评审、发布证据和长期项目知识。 |
| Public Documentation | `docs/` | 面向读者的公开文档信息架构；它不是 fresh `project_knowledge` 默认目录。 |

`_speclite-output/` 不是 canonical source mirror，也不是 SpecLite 源仓库自身的 `_bmad-output/`。只有方法论或 Skill 契约本身需要修订时，才应回到 `assets/source/speclite/`；目标项目的执行产物应保留在目标项目中。

## Source of Truth（事实来源）

目录结构由多个契约共同形成，应按以下顺序理解：

1. 目标项目通过 `speclite resolve artifact-roots --project-root <project-root>` 解析出的 artifact-root resolver result 决定实际根路径。
2. `core-skills/module.yaml` 和 `sdlc-skills/module.yaml` 定义默认路径与安装时预创建目录。
3. 各 Skill 的 `SKILL.md`、`references/` 和 `assets/` 定义实际写入时机、动态子目录与文件名。
4. `module-help.csv` 提供面向用户的输出位置 catalog，但不替代单个 Skill 的写入规约。

当 catalog、预创建目录和 Skill 写入规约不一致时，不能把它们静默合并成一个并不存在的契约。本文会将这类差异明确标为“当前差异”。

## Configuration Mapping（配置映射）

默认输出路径由 Core 与 SDLC Module 组合得到。本表是七个 workflow-owned filesystem planes 的唯一源定义，其它文档的目录表以本表为准：

| Config Key | Default Value | Purpose |
|---|---|---|
| `core.output_folder` | `_speclite-output` | 兼容 display root 和 fresh artifact root 默认值的共同前缀。 |
| `core.brainstorming_artifacts` | `{output_folder}/0-brainstorming-artifacts` | Brainstorming session 与发散探索产物。 |
| `modules.sdlc.analysis_artifacts` | `{output_folder}/1-analysis-artifacts` | Product Brief、Research、PRFAQ 等 analysis 产物。 |
| `modules.sdlc.planning_artifacts` | `{output_folder}/2-planning-artifacts` | PRD、UX、Epics 等 planning 产物。 |
| `modules.sdlc.solutioning_artifacts` | `{output_folder}/3-solutioning-artifacts` | Architecture、Specs、implementation readiness 等 solutioning 产物。 |
| `modules.sdlc.implementation_artifacts` | `{output_folder}/4-implementation-artifacts` | Sprint、Story、Flow Gate、Review、QA、Retrospective 与 Quick Dev 产物。 |
| `modules.sdlc.devops_artifacts` | `{output_folder}/5-devops-artifacts` | CI/CD、deployment 与 npm release 产物。 |
| `modules.sdlc.project_knowledge` | `{output_folder}/project-knowledge-base` | Brownfield baseline、长期项目知识和 TSD 等 Project Knowledge 产物。 |

> Note: `core.brainstorming_artifacts` 虽然位于 `[core]`，但它的交互式提问与其余六个 root 一起定义在 SDLC Module 的 `module.yaml` 中，只在 `--yes --interactive` 且选中 `sdlc` 时出现；未选中时使用默认值。Fresh install 中 `{project_knowledge}` 默认解析到 `_speclite-output/project-knowledge-base/`。`docs/` 是 Public Documentation plane；公开文档可以引用 Project Knowledge，但二者不是同一个默认目录。

## Default Directory Tree（默认目录树）

下面的树同时展示安装时预创建目录与 Skill 运行后可能出现的主要动态产物。未执行对应 Skill 时，动态路径不会出现。

```text
_speclite-output/
├── 0-brainstorming-artifacts/                 # 安装时预创建
│   └── brainstorming-session-{date}-{time}.md
├── 1-analysis-artifacts/                       # 安装时预创建
│   ├── product-brief/                          # 安装时预创建
│   │   ├── product-brief-{project_name}.md
│   │   └── product-brief-{project_name}-distillate.md
│   ├── prfaq/                                  # 安装时预创建
│   │   ├── prfaq-{project_name}.md
│   │   └── prfaq-{project_name}-distillate.md
│   └── research/                               # 安装时预创建
│       ├── domain-{topic}-research-{date}.md
│       ├── market-{topic}-research-{date}.md
│       └── technical-{topic}-research-{date}.md
├── 2-planning-artifacts/                       # 安装时预创建
│   ├── epics/                                  # 安装时预创建；也可承载 epics shards
│   │   ├── epics.md                            # canonical whole
│   │   ├── index.md                            # sharded entry（与 whole 可共存）
│   │   └── epic-*.md                           # 仅 index 明确声明的 shards
│   ├── prd/                                    # 安装时预创建
│   │   ├── prd.md                              # canonical whole
│   │   ├── index.md                            # sharded entry（与 whole 可共存）
│   │   └── *.md                                # 仅 index 明确声明的 shards
│   ├── ux/                                     # 安装时预创建
│   │   ├── ux-design-specification.md
│   │   ├── ux-color-themes.html
│   │   ├── ux-design-directions.html
│   │   └── design-system/                      # workflow 首次需要时按需创建
│   └── sprint-change-proposal-{date}.md
├── 3-solutioning-artifacts/                    # 安装时预创建
│   ├── architecture/                           # 安装时预创建
│   │   ├── architecture.md                     # canonical whole
│   │   ├── index.md                            # sharded entry（与 whole 可共存）
│   │   └── *.md                                # 仅 index 明确声明的 shards
│   ├── specs/                                  # 安装时预创建
│   └── implementation-readiness-report/        # 安装时预创建
│       └── grill-consistency/                  # 安装时预创建
│           ├── implementation-readiness-report-{yyyy-MM-dd}.md
│           ├── summary.md
│           └── goal-execute-records/
├── 4-implementation-artifacts/                 # 安装时预创建
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
│   │       ├── {story-id}-code-review-summary-{YYYYMMDD}-{review-series}-round-{n}.md
│   │       ├── {story-id}-code-review-evaluation-{YYYYMMDD}-{review-series}-round-{n}.md
│   │       ├── {story-id}-cr-rules-extraction-{YYYYMMDD}-{review-series}-round-{n}.md
│   │       ├── {story-id}-cr-todo-result-{YYYYMMDD}-{review-series}-round-{n}.md
│   │       ├── {story-id}-cr-finalizer-{YYYYMMDD}-{review-series}-round-{n}.md
│   │       ├── .tmp/
│   │       └── goal-execute-records/
│   │           ├── PLAN.md
│   │           ├── EXPERIMENTS.md
│   │           └── EXPERIMENT_NOTES.md
│   ├── cr-rules/                               # 安装时预创建
│   │   └── cr-todo-backlog.md
│   ├── retrospectives/                         # 安装时预创建
│   │   └── epic-{N}-retro-{date}.md
│   ├── tests/
│   │   └── test-summary.md
│   ├── spec-{slug}.md
│   ├── deferred-work.md
│   └── epic-{N}-context.md
├── 5-devops-artifacts/                         # 安装时预创建
│   ├── ci-cd/                                  # 安装时预创建的保留目录
│   ├── deployments/                            # 安装时预创建的保留目录
│   └── npm-releases/                           # 安装时预创建
│       └── <package-name>-<version>-release-report.md
└── project-knowledge-base/                     # 安装时预创建
    ├── brownfield/                             # 安装时预创建
    │   ├── baseline/                           # 安装时预创建
    │   ├── deep-dives/                         # 安装时预创建
    │   ├── evidence/                           # 安装时预创建
    │   ├── planning/                           # 安装时预创建
    │   └── validation/                         # 安装时预创建
    └── tsd/                                    # 安装时预创建
```

`speclite-shard-doc` 对 canonical `prd/prd.md`、`epics/epics.md` 与 `architecture/architecture.md` 必须把 `index.md` 和 shards 直接生成在同一个 subject directory，不增加 `shards/` 层。Whole 与 sharded 可以共存，但 consumer 必须调用 `speclite resolve artifact-documents`；无当前 invocation selection 时 resolver 会阻塞，绝不自动择一或混合。其它大文档保留通用目标目录选择规则。

`resolve artifact-documents` 的 machine evidence 包含 `resolvedRoot`、`resolutionMode`、`actualConsumedPath`、`consumedPaths`、`declaredShardPaths`、`discoveryShape`、`ambiguityStatus`、selection source、`unselectedPath` 和 `continuation`。Canonical whole/index entry（包括 symlink）只有在最终 target 为 subject 内 readable regular file 时才可继续；`index.md` 只授权其明确声明且位于 subject directory 内的可读 shards。Resolver 支持 inline 与 reference-style local Markdown links，按 parse、strip query/fragment、single percent-decode、portable/subject containment/readability 的顺序处理。Missing index、broken/outside/unreadable reference、malformed/undefined/unsupported local-ish reference、missing subject 或 unresolved coexistence 都使用 `SPEC 07` stable issue 并以零写入、零 progress mutation 阻塞；missing-index 所必需的 shard-candidate scan 若无法读取 root/nested directory，则以 `artifact-path.invalid-sharded-document-shape` / `shard-candidate-scan-unreadable` 阻塞并只报告失败目录的 project-relative evidence；`index.md` self-link 只排除，不重复消费。Existing Architecture 缺 `solutioning_artifacts` 时只在 resolver 报告的 Planning fallback subject directory 读取并标记 `legacy-compatible`，不迁移文件；explicit `solutioning_artifacts` 配置下发现 Planning history candidates 时仅报告 `config-artifact-mismatch`，不 fallback 消费。

显式 `selection=whole` 时，resolver 仍安全校验 canonical `index.md` entry，但不读取或解析未选 index 的 shard graph；无 selection 或 `selection=sharded` 时完整验证该 graph。

## Root and Planning Artifacts（根目录与规划产物）

| Path or Pattern | Producer Skill | Creation and Maintenance |
|---|---|---|
| `{brainstorming_artifacts}/brainstorming-session-{date}-{time}.md` | `speclite-brainstorming` | 每次 session 按时间创建或续写；输出根来自 `speclite resolve artifact-roots` 的 `brainstorming_artifacts`，不属于 `planning-artifacts/`。 |
| `{output_folder}/project-context.md` | `speclite-generate-project-context` | 在输出根目录创建，跨迭代持续维护 AI agent 需要的项目规则。 |
| `{analysis_artifacts}/research/*.md` | `speclite-domain-research`、`speclite-market-research`、`speclite-technical-research` | 按研究类型、主题和日期新增；可读取 `{project_knowledge}`，但不把 research 输出写入 Project Knowledge 或 Public Documentation。 |
| `{analysis_artifacts}/product-brief/product-brief-*.md` | `speclite-product-brief` | 主 brief 分阶段增量维护；distillate 按用户选择创建在同一 subject directory。 |
| `{analysis_artifacts}/prfaq/prfaq-*.md` | `speclite-prfaq` | 主 PRFAQ 跨 stage 增量维护；完成时生成 distillate 到同一 subject directory。 |
| `{planning_artifacts}/brownfield-planning-brief.md`、`candidate-change-slices.md`、`feature-entry-points.md` | `speclite-brownfield-context-builder` | 条件生成 planning handoff，也可按配置写入 `{brownfield_output}/planning/`；主要 baseline 默认位于 `{project_knowledge}/brownfield/`。 |
| `{planning_artifacts}/prd/prd.md` | `speclite-create-prd`、`speclite-edit-prd` | Canonical whole PRD；sharded shape 使用同目录 `index.md` 与声明 shards。 |
| `{planning_artifacts}/prd/prd-validate-report-{yyyy-MM-dd}.md` | `speclite-validate-prd` | 每次 invocation 只生成一次日期并锁定 exact path；private `scripts/prd-validation-report-operation.mjs` 以 exclusive create 写入。同日目标已存在时用 `artifact-path.prd-validation-report-exists` 阻断，人工处置为“保留并移走或删除既有报告后重新运行”；legacy report 原位可发现，不迁移。 |
| `{planning_artifacts}/ux/ux-design-specification.md` | `speclite-create-ux-design` | 增量维护 UX 主规格；`{planning_artifacts}/ux/ux-color-themes.html` 与 `{planning_artifacts}/ux/ux-design-directions.html` 是条件生成的视觉化派生产物，`{planning_artifacts}/ux/design-system/` 按需创建。写入由 Skill-private `scripts/ux-artifact-operation.mjs` 执行，见下文写入规约。 |
| `{solutioning_artifacts}/architecture/architecture.md` | `speclite-create-architecture` | Canonical whole Architecture；只有用户选择 Continue 后才追加并推进 frontmatter。 |
| `{planning_artifacts}/epics/epics.md` | `speclite-create-epics-and-stories` | Canonical whole Epics；sharded shape 使用同目录 `index.md` 与声明 shards。 |
| `{solutioning_artifacts}/implementation-readiness-report/grill-consistency/implementation-readiness-report-{yyyy-MM-dd}.md` | `speclite-implementation-readiness-check` | 日期化 readiness snapshot；`{solutioning_artifacts}` 只取 artifact-root resolver 的 `resolvedRoot`，basename 保持不变。 |
| `{solutioning_artifacts}/implementation-readiness-report/grill-consistency/**` | `speclite-implementation-readiness-grill-consistency-reviewer` | 每轮新增 `round-{N}` 记录，`summary.md` 用于阶段性汇总。`explicit-config` 与 `legacy-compatible` 均服从 resolver；resolver block/error 时 HALT 且 zero artifact write。旧 Planning readiness / `ir-grill/` artifacts 只读原位发现，不迁移。 |
| `{planning_artifacts}/sprint-change-proposal-{date}.md` | `speclite-correct-course` | 日期化重大变更提案。 |

PRD validation report 写入规约：`speclite-validate-prd` 的 Skill-private report operation script（位于该 Skill 的 `scripts/`）在任何 report / progress / temp / suffix write 前做 read-only probe，并在 commit-time 重验后以 `wx` exclusive create 写入。同日目标已存在时，无论内容是否相同都不 overwrite、append、truncate、delete、reuse 或加 suffix，也不更新 progress。旧命名的报告仅作 historical discovery 原位保留，install / update / repair 不迁移。

UX artifact 写入规约：canonical target 必须物理落在 real UX owner 内。每次 exclusive create 使用 `node "{skill-root}/scripts/ux-artifact-operation.mjs" create-file --project-root "{project-root}" --planning-root "{planning_artifacts}" --target "{target}" --source "{source-file}"`，on-demand mkdir 使用同一 script 的 `create-directory` flags；该 binding 不是 public `speclite` CLI，并在 commit-time 检查 physical owner 与 nearest existing ancestor 后立即执行。stdout 必须恰为一个 JSON；non-zero、invalid JSON 或 `ok !== true` 必须 HALT，且不得推进 frontmatter / progress / append target。Legacy `{planning_artifacts}/ux-design-specification.md` 及 sibling 只在 real Planning owner 内只读发现并原位继续，不由 install / update / repair 迁移。Markdown duplicate definition 采用 first-definition-wins；local-ish HTML attribute raw value 含 `&` 时在 strip / decode 前 fail closed，external scheme 与 literal fragment / query-only 除外。任一 resolver / candidate / frontmatter / reference 门禁失败时保持空消费、空 append target 与零 artifact / progress mutation。

Agent 写作、Mermaid、文档校验和部分 ecosystem auditor 的输出位置可由用户指定。它们可以写入 `{planning_artifacts}`，但没有统一固定文件名，不应据此增加虚构的必选子目录。

## Implementation Artifacts（实现产物）

| Path or Pattern | Producer or Updater | Creation and Maintenance |
|---|---|---|
| `sprint-status.yaml` | `speclite-sprint-planning` 创建；`speclite-create-story`、`speclite-dev-story`、`speclite-sprint-status`、`speclite-quick-dev`、`speclite-code-review-06-finalizer`、`speclite-retrospective` 更新 | Sprint 级 tracker-ledger，保留既有更先进状态，避免状态降级。 |
| `stories/{story-key}.md` | `speclite-create-story` 创建；`speclite-dev-story`、`speclite-story-review-03-fixer`、`speclite-code-review-06-finalizer` 更新 | Story 的 living execution contract。 |
| `flow-gates/*.md` | `speclite-flow-gate` | 针对 Story / Epic transition 创建 gate snapshot；YAML frontmatter 是下游 machine contract。 |
| `story-reviews/{scope}-story-review/*.md` | `speclite-story-review-01-reviewer`、`speclite-story-review-02-evaluator` 创建；`speclite-story-review-03-fixer` 追加修订记录 | Epic 或 Story 粒度的轮次化设计审查轨迹。 |
| `code-reviews/{story-id}-code-review/*.md` | CR01–06 使用 orchestrator 单次解析或 manual shared resolver 返回的同一 `crDir` | Story 粒度的轮次化 review、evaluation、fix、rules、TODO result 与 finalizer 轨迹；新目录只含 numeric Story ID。 |
| `story-reviews/**/goal-execute-records/` | `speclite-goal-orchestrator-epic-story-review-runner` | 严格串行 Story Review 的执行账本，固定包含 `PLAN.md`、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md`。 |
| `code-reviews/{story-id}-code-review/goal-execute-records/` | `speclite-goal-orchestrator-epic-story-code-review-runner` | 与 CR01–06 共用同一 resolved `crDir` 的严格串行执行账本；固定包含 `PLAN.md`、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md`。 |
| `cr-rules/cr-todo-backlog.md` | `speclite-code-review-05-todo-tracker` | 跨 Story 延迟事项账本，编号持续递增，状态从 Open 推进到 Resolved。 |
| `tests/test-summary.md` | `speclite-qa-generate-e2e-tests` | 记录自动化测试生成结果；真实测试代码写入目标项目的测试目录。 |
| `spec-{slug}.md` | `speclite-quick-dev` | Quick Dev 的 living spec，随实现流程推进状态。 |
| `deferred-work.md` | `speclite-quick-dev` | 条件追加延期事项，跨 Quick Dev 任务保留。 |
| `epic-{N}-context.md` | `speclite-quick-dev` | 可重建 cache；planning artifacts 更新后可能失效。 |
| `retrospectives/epic-{N}-retro-{date}.md` | `speclite-retrospective` | Epic 完成后的日期化复盘 snapshot；读取历史复盘时兼容 legacy 根目录位置，只读不迁移。 |

SR / CR 目录中的 `.tmp/` 只保存审查中间数据，并应在审查完成时清理。CR `.tmp/` 必须位于同一 resolved `code-reviews/{story-id}-code-review/` 内，不得按 title/slug 建第二目录。唯一 unfinished legacy-only run 使用 `legacy-resume` 原位续写；canonical+unfinished legacy 或多个 unfinished legacy 使用 shared `cr-directory.ambiguous-resume-root` 在任何 artifact/goal/progress/tracker write 前阻断。Legacy directory 不自动迁移、重命名或删除。

`speclite-qa-write-test-guide` 由用户指定或根据仓库事实推导目标路径；无法确定时 Workflow 应停止并询问，因此当前没有固定的 `test-guides/` 子目录契约。

当 runtime 无法启动 review subagents 时，`speclite-quick-dev` 会在 `{implementation_artifacts}` 下生成三份 reviewer prompt 文件，并停止等待人工执行。Canonical Workflow 未规定这些文件的稳定名称，因此它们不列入默认目录树。

## DevOps Artifacts（DevOps 产物）

SDLC Module 会预创建 `{devops_artifacts}/` 及其下的 `ci-cd/`、`deployments/` 和 `npm-releases/`，为发布与运维 Workflow 提供稳定落点。

当前只有 `speclite-npm-publisher` 写入 `{devops_artifacts}/npm-releases/`（`<package-name>-<version>-release-report.md` 与可选的 `release-check.json` sentinel）。`ci-cd/` 和 `deployments/` 目前是保留目录，不能仅凭目录存在推断已有 canonical producer。

Selected ecosystem modules 可能把审计报告写入 `{devops_artifacts}` 或 `{planning_artifacts}`，也可能写入 `{project_knowledge}`。只有显式选择并运行对应 ecosystem Skill 后，相关文件才会出现。

## External Inputs and Updater-Only Paths（外部输入与仅更新路径）

以下路径会被 Skill 或 Hook 读取，但不能当作这些消费者自动生成的输出：

| Path | Consumer | Contract |
|---|---|---|
| `{implementation_artifacts}/foundation-handoff/source-index.json` | `speclite-flow-gate` | Project-provided input；也可用 Story / Epic 显式引用替代。 |
| `{planning_artifacts}/speclite-workflow-status.yaml` | `speclite-code-review-06-finalizer` | Updater-only path；存在时更新，不存在时跳过，当前未发现 canonical creator。 |
| `{implementation_artifacts}/flow-gates/{story-key}-story-kickoff-gate.md` | `flow-gate-enforcement` Hook | 报告由 `speclite-flow-gate` 生成；Hook 只读取 frontmatter，不生成报告，也不推进状态。 |

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
| PRD validation historical compatibility | Catalog 与 producer 已将新报告固定为 `{planning_artifacts}/prd/prd-validate-report-{yyyy-MM-dd}.md`。 | 旧 basename 仅作 historical evidence 可发现且原位保留，不是 active producer default。 |

`review-artifacts/` 和 `research-artifacts/` 有时用于描述概念分类，但它们不是当前 `module.yaml` 声明的默认顶层目录。默认实际结构是：research、Product Brief 和 PRFAQ 位于 `{analysis_artifacts}/` 的对应 subject directory，SR / CR 位于 `{implementation_artifacts}/` 下。

## Canonical Anchors（规范锚点）

本文的事实来源是以下 canonical source 文件；`support-skills/**` 属于 SpecLite canonical source 维护工具，不是目标项目默认 selected runtime module，因此不构成本文的 `_speclite-output/` 目录条目。

- `assets/source/speclite/core-skills/module.yaml`
- `assets/source/speclite/core-skills/module-help.csv`
- `assets/source/speclite/sdlc-skills/module.yaml`
- `assets/source/speclite/sdlc-skills/module-help.csv`
- `assets/source/speclite/core-skills/**/SKILL.md`
- `assets/source/speclite/sdlc-skills/**/SKILL.md`
- `assets/source/speclite/ecosystems/**/SKILL.md`
- `assets/source/speclite/ecosystems/**/module-help.csv`

## Related Documents（相关文档）

| Relationship | Document |
|---|---|
| 安装后的 runtime、IDE mirrors 与 Hook 布局 | [`runtime-layout.md`](runtime-layout.md) |
| canonical source 目录与 Module 边界 | [`canonical-source-layout.md`](canonical-source-layout.md) |
| SDLC Skills 的阶段与输出 catalog | [`skills/sdlc-workflows.md`](skills/sdlc-workflows.md) |
| Core Skills catalog | [`skills/core-skills.md`](skills/core-skills.md) |
| validation issue 参考 | [`validation-issues.md`](validation-issues.md) |
| installer-owned、human-owned、workflow-owned 保护模型 | [`../explanation/file-ownership-model.md`](../explanation/file-ownership-model.md) |
| Workflow 的渐进式披露与执行边界 | [`../explanation/speclite-workflows.md`](../explanation/speclite-workflows.md) |
| Workflow artifact 术语 | [`glossary/workflow-artifact.md`](glossary/workflow-artifact.md) |
| Runtime 三层边界 | [`../explanation/runtime-boundaries.md`](../explanation/runtime-boundaries.md) |
| Flow Gate 与 downstream handoff 契约 | [`specs/flow-gate-handoff-contract.md`](specs/flow-gate-handoff-contract.md) |
