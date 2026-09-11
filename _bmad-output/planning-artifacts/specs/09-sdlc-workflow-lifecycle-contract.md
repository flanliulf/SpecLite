# SDLC Workflow Lifecycle Contract（SDLC Workflow 生命周期契约）

## Status（状态）

已接受用于 SpecLite canonical skill 体系建设、Story 创建、Story 开发、Flow Gate、SR/CR 和后续流程审计。

本 SPEC 管理 SpecLite 自身 SDLC workflow 的 artifact roots、Story lifecycle schema、Flow Gate mode/result、anchor policy 和 legacy baseline rule。产品 runtime 的 install/update/validate JSON schema 仍由各自 owning SPEC 管理；本 SPEC 只管理 canonical skill 驱动的研发流程契约。

## Purpose（用途）

本 SPEC 防止 canonical skill 的流程规则只存在于单个 skill 文档中，导致 PRD、Architecture、Epic 或 Story 不能完整表达前置依赖、状态推进、证据和等价实现判断。

Implementation agents、Story reviewers、Code reviewers、finalizer 和流程审计脚本在判断 Story 是否可进入开发、评审或完成状态前，必须使用本 SPEC 解释以下术语：

- runtime artifact roots
- Story lifecycle artifact paths
- Flow Gate mode 和 Flow Gate result
- Contract Anchor、Functional Anchor、Evidence Anchor、Guidance Anchor
- legacy Story baseline 和 future Story enforcement boundary

## Ownership Boundary（所有权边界）

本 SPEC 是以下字段和流程术语的 field-level contract source：

- `[core].brainstorming_artifacts`
- `[modules.sdlc].analysis_artifacts`
- `[modules.sdlc].planning_artifacts`
- `[modules.sdlc].solutioning_artifacts`
- `[modules.sdlc].implementation_artifacts`
- `[modules.sdlc].devops_artifacts`
- `[modules.sdlc].project_knowledge`
- `{brainstorming_artifacts}`
- `{analysis_artifacts}`
- `{planning_artifacts}`
- `{solutioning_artifacts}`
- `{implementation_artifacts}`
- `{devops_artifacts}`
- `{project_knowledge}`
- `story_location`
- `story_location_absolute`
- `story_root`
- `flow_gate_root`
- `sprint_status_file`
- `{sprint_status_file}`
- `sprint_status`
- `{sprint_status}`
- `development_status`
- `development_status{story_key}`
- `{current_sprint_status}`
- `default_output_file`
- `{default_output_file}`
- `anchor_contract_map`
- `dependency_gate`
- `epic_status`
- `evidence_plan`
- `story_completion_status`

Architecture、Epic、Story、canonical skill 和 audit report 可以引用这些字段，但不得重新定义其语义。若本 SPEC 与单个 Story 或 skill guidance 冲突，以本 SPEC 为准；若 skill guidance 只是建议路径或建议文件名，Flow Gate 必须先按 Contract -> Functional -> Evidence -> Guidance 评估等价实现。

## Runtime Artifact Roots（Runtime Artifact 根路径）

Runtime config 中的 `[core]` 与 `[modules.sdlc]` 定义 workflow 使用的项目级 artifact roots。`speclite resolve config` 是 raw merged config surface，并保留既有 `--key` 对 merged config 的选择语义；它不得为缺失 artifact root 合成 legacy fallback。Skill 需要 effective artifact roots 时必须通过 `speclite resolve artifact-roots --project-root {project-root}` 消费本 SPEC 的 resolver result，并读取每个 root 的 `resolvedRoot`、`resolutionMode`、`plane`、`ownership`、`contractRefs` 与 source/provenance evidence，不得从 source checkout、Skill package 文案、hardcoded command path、manifest projection 或手写 fallback 反推。

| Runtime key | Placeholder | Meaning | Fresh-install default | Existing-install behavior |
| --- | --- | --- | --- | --- |
| `core.brainstorming_artifacts` | `{brainstorming_artifacts}` | Brainstorming workflow artifacts 根目录。 | `{project-root}/_speclite-output/0-brainstorming-artifacts` | 缺少新增 field 时 fallback 到 `{output_folder}/brainstorming`。 |
| `modules.sdlc.analysis_artifacts` | `{analysis_artifacts}` | Research、Product Brief、PRFAQ 等 Analysis artifacts 根目录。 | `{project-root}/_speclite-output/1-analysis-artifacts` | 缺少新增 field 时 fallback 到已有 `{planning_artifacts}`。 |
| `modules.sdlc.planning_artifacts` | `{planning_artifacts}` | PRD、Epics、UX 与 planning status 等 Planning artifacts 根目录。 | `{project-root}/_speclite-output/2-planning-artifacts` | 已有显式配置继续权威，不得因 fresh default 变化自动改写。 |
| `modules.sdlc.solutioning_artifacts` | `{solutioning_artifacts}` | Architecture、Specs 与 implementation readiness 等 Solutioning artifacts 根目录。 | `{project-root}/_speclite-output/3-solutioning-artifacts` | 缺少新增 field 时 fallback 到已有 `{planning_artifacts}`。 |
| `modules.sdlc.implementation_artifacts` | `{implementation_artifacts}` | sprint status、stories、flow-gates、reviews、retrospectives 和 implementation audits 根目录。 | `{project-root}/_speclite-output/4-implementation-artifacts` | 已有显式配置继续权威，不得因 fresh default 变化自动改写。 |
| `modules.sdlc.devops_artifacts` | `{devops_artifacts}` | DevOps 与 release workflow artifacts 根目录。 | `{project-root}/_speclite-output/5-devops-artifacts` | 已有显式配置继续权威，不得因 fresh default 变化自动改写。 |
| `modules.sdlc.project_knowledge` | `{project_knowledge}` | Workflow-generated project knowledge 与长期内部参考材料根目录。 | `{project-root}/_speclite-output/project-knowledge-base` | 已有显式配置继续权威，包括 legacy 显式 `{project-root}/docs`；不得因 fresh default 变化自动改写。 |

### Controlled Correction 2026-09-03（受控修正 2026-09-03）

Fresh install 的 `fresh-default` 语义只适用于未显式输入逐 field artifact root 的默认解析结果，包括 quick/default flow，以及仅显式设置 `core.output_folder` 后由 canonical defaults 派生出的七类 roots。

Fresh detailed prompt 中，若用户对某个 artifact root field 输入非空值，该 field 的实际 root 继续作为 fresh install config 投影写入，但 `resolutionMode` 必须标记为 `explicit-config`。未显式输入的其它 artifact root fields 仍按 fresh defaults 或 `output_folder` 派生值解析，并逐 field 标记为 `fresh-default`。本修正保留 2026-09-02 Story 11.2 kickoff 中“fresh install all seven roots are `fresh-default`”的原始决策轨迹，并将其范围收窄为 quick/default 与未显式逐 field 覆盖的 fresh roots。

Fresh install 的 phase-owned subject directories 必须保持单一 canonical producer root：PRD 与 Epics 分别使用 `{planning_artifacts}/prd/`、`{planning_artifacts}/epics/`，UX 使用 `{planning_artifacts}/ux/`，Architecture whole document、sharded `index.md` 与 shards 使用 `{solutioning_artifacts}/architecture/`。Whole/sharded producer 与 consumer 必须在对应 subject directory 内使用确定性发现规则，并记录实际消费路径。Existing install 若缺少 `solutioning_artifacts`，仍按下述 legacy fallback 解析；该 fallback 不改变 fresh canonical root，也不授权迁移既有 Architecture artifacts。

### Controlled Correction 2026-09-04 — Whole/Sharded Document Discovery（整篇/分片文档发现）

PRD、Epics 与 Architecture 的 canonical whole outputs 分别为 `{planning_artifacts}/prd/prd.md`、`{planning_artifacts}/epics/epics.md` 与 `{solutioning_artifacts}/architecture/architecture.md`。Sharded documents 必须与 whole document 位于同一 subject directory，使用 canonical `index.md` 及其明确声明的 shard links；不得新增 `shards/` 层，也不得通过 glob 自动混入未被 index 声明的 Markdown 文件。

所有 producer continuation 与 downstream consumer discovery 必须调用同一个 resolver-backed public surface：`speclite resolve artifact-documents --subject <prd|epics|architecture> --project-root {project-root} [--selection whole|sharded]`。各 Skill 不得自行复制、改写或定义 precedence。`--selection` 只代表当前 invocation 的显式选择，不得持久化，不得删除、覆盖、修改或自动迁移未选版本。

| Discovery State | Canonical Behavior | Continuation |
| --- | --- | --- |
| `whole-only` | 只消费 subject directory 中的 canonical whole document。 | Continue |
| valid `sharded-only` | 只消费 `index.md` 及其明确声明的 shards。 | Continue |
| `whole+sharded` 且无显式 selection | 不选择、不混合；报告 ambiguity 并请求人工选择。 | Block |
| `whole+sharded` 且当前 invocation 显式选择 `whole` | Canonical whole 与 canonical `index.md` entry 均先通过安全校验；只读取并消费 whole，记录未选 `index.md`，不读取或解析其 shard graph。 | Continue |
| `whole+sharded` 且当前 invocation 显式选择 `sharded` | 完整验证并消费 sharded index 及其声明 shards，记录未选 whole。 | Continue |
| shards 存在但缺 `index.md` | 报告 invalid sharded shape。 | Block |
| index 引用缺失、越出 subject directory（含 symlink escape）或不可读 shard | 报告 broken shard reference。 | Block |
| whole 与有效 sharded input 均不存在 | 报告 subject document missing。 | Block |

Canonical whole document 与 canonical `index.md` 自身必须先通过 `lstat`、readability、`realpath` subject containment 与 dereferenced target regular-file 校验；canonical whole entry 为 non-file/unreadable 时必须在 shape、selection、index graph 与 mismatch probe 处理前，以 `artifact-path.subject-document-missing` / `reason=canonical-whole-unreadable` block。若 symlink 指向 subject directory 外，必须使用既有 `artifact-path.symlink-escape` block，`actualConsumedPath=null`、`consumedPaths=[]`，不得读取或消费逃逸目标。位于 subject directory 内且最终 target 为 readable regular file 的 canonical entry symlink 可以继续按 normal whole/sharded discovery 处理；由合法 `index.md` 声明的 shard target 逃逸仍映射为 `artifact-path.broken-shard-reference`。显式 `selection=whole` 只豁免未选 `index.md` 内容及 shard graph 的读取与验证，不豁免 canonical index entry 自身的 entry safety；无 selection 或 `selection=sharded` 时仍须完整验证 index graph。Shard-candidate recursive scan 只允许在 canonical `index.md` 不存在、需要判定 `shards-without-index` 时执行；`index.md` 存在时不得扫描未声明 subtree。该必要 scan 的 root 或 nested directory 因 non-`ENOENT` failure 无法枚举时，必须使用 `artifact-path.invalid-sharded-document-shape` / `reason=shard-candidate-scan-unreadable`、`discoveryShape=invalid-sharded` block，并仅记录实际失败目录的 project-relative POSIX evidence；不得继续 mismatch probes、吞为空集合或泄露 raw filesystem error。

`index.md` shard link grammar 采用 bounded CommonMark-compatible subset 且不得新增 runtime dependency：支持 inline local Markdown links 与 reference-style local Markdown links。Destination 必须按 `parse -> strip query/fragment -> single percent-decode -> portable/subject containment/readability` 顺序处理。External scheme 与 network-path links 不作为 shard。Malformed destination、undefined reference-style link、unsupported local-ish destination、越界或不可读 local Markdown destination 不得静默忽略，必须使用 `artifact-path.broken-shard-reference` block，并在 details 中记录 `referenceKind`。Declared shard consumption 必须保留 `index.md` 首次声明顺序并按首次出现去重；direct、normalized 或 repeated `index.md` self-link 必须确定性排除，不得重复加入 `declaredShardPaths` 或 `consumedPaths`。

每次 discovery evidence 必须记录 `resolvedRoot`、`resolutionMode`、`subjectDirectory`、`actualConsumedPath`、`consumedPaths`、`declaredShardPaths`、`discoveryShape`、`ambiguityStatus`、invocation selection value/source、`unselectedPath`、`continuation` 与 stable issues。Block result 的 `actualConsumedPath` 必须为 `null`，`consumedPaths` 必须为空；对应 `SPEC 07` IDs 为 `artifact-path.ambiguous-subject-document-shape`、`artifact-path.invalid-sharded-document-shape`、`artifact-path.broken-shard-reference`、`artifact-path.subject-document-missing`，以及 canonical whole/index 自身逃逸时的 `artifact-path.symlink-escape`。Resolver 和 consumer 在 block 前后必须保持零 artifact write 与零 progress mutation。

Existing explicit roots 继续权威；若 existing install 缺少 `solutioning_artifacts`，Architecture subject directory 使用 resolver 报告的 Planning fallback root 并标记 `legacy-compatible`。该兼容发现只读且不授权 migration、copy、rename、delete、config rewrite 或“迁移成功”声明。Config root 与实际 artifact location 不一致时使用 `artifact-path.config-artifact-mismatch` 诊断并 block，不得在 discovery 中搜索第二 root 作为隐式 fallback。允许的只读 diagnostic probes 仅限以下 bounded candidates：PRD 探测历史 `{planning_artifacts}/prd.md`；Epics 探测历史 `{planning_artifacts}/epics.md`；Architecture 探测历史 `{planning_artifacts}/architecture.md`，且当 `solutioning_artifacts` 为 explicit 配置时额外探测 Planning architecture subject 的 canonical whole 与 `index.md`。Probe 命中只产生 deterministic mismatch evidence，不授权消费、迁移、复制、删除、config rewrite 或 fallback continuation；若多候选命中，按本段声明顺序记录 `candidatePaths`。

`{project-root}` 是 runtime config 中允许持久化的 portable token，不是 raw absolute path。七类 artifact placeholders 是 logical placeholders；它们可以在 runtime config 中展开为 `{project-root}/...`，但任何 filesystem I/O 前必须解析为当前 target project root 下的真实路径。Public report、manifest projection、audit result 和 fixture snapshot 中持久化路径时，必须记录 display-safe project-relative POSIX path，不得泄露真实 absolute path、home directory、drive letter 或 temporary/cache path。

### Compatible Evolution And Legacy Fallback（兼容演进与旧配置回退）

- Fresh install 必须使用表中的新 fields 与新 defaults，并由 canonical module metadata/directory declarations 驱动 root creation；command 层不得维护第二份 hardcoded path list。
- Existing install 已显式配置的 `planning_artifacts`、`implementation_artifacts`、`devops_artifacts` 和 `project_knowledge` 继续权威。
- Legacy fallback 只补足 existing install 缺少的新增 `brainstorming_artifacts`、`analysis_artifacts` 和 `solutioning_artifacts`，不得自动把 fallback value 回写到 config。
- Fallback resolution 必须可报告为 `legacy-compatible`；它不得表示 artifact migration 已完成。
- `analysis_artifacts.resolutionMode = legacy-compatible` 时，Product Brief 和 PRFAQ 可以发现旧配置时代已存在的 `{analysis_artifacts}/product-brief-{project_name}.md` 与 `{analysis_artifacts}/prfaq-{project_name}.md` root-level main artifact；若新的 subject-directory main artifact 已存在则必须优先使用新路径。只有 legacy root-level main artifact 存在且 new subject main 不存在时，workflow 才可 resume/write in place 到 legacy root-level main artifact。若两者都不存在，则创建新的 subject-directory main artifact。Product Brief distillate、PRFAQ stage/resume updates、distillate 和 verdict 必须跟随所选 main artifact 的同一目录。
- 上述 Product Brief/PRFAQ legacy root-level discovery 只在 `analysis_artifacts.resolutionMode` 精确为 `legacy-compatible` 时启用；`fresh-default` 或 `explicit-config` 的 analysis root 不得启用 legacy root-level discovery。
- 普通 install、update 和 repair 不得根据新 defaults 移动、复制、重命名、删除或重写 workflow-owned artifacts。
- 仅修改 config root、但实际 artifacts 仍在旧路径时，validator 必须产生 config/artifact mismatch 诊断，不得报告 migration success。
- Explicit artifact migration 属于未来独立能力，不属于本 SPEC 当前 install/update/repair contract。

### Public Docs And Project Knowledge Boundary（Public Docs 与 Project Knowledge 边界）

- `docs/` 是 Primary Public Document；它不是 fresh-install `{project_knowledge}` default、alias 或 fallback。
- Existing install 若显式配置 `project_knowledge = "{project-root}/docs"`，该 explicit value 继续权威；这只是 legacy configured value，不改变 `docs/` 的 steady-state public-document 定位。
- Workflow-generated project knowledge 的 fresh-install default 是 `_speclite-output/project-knowledge-base/`。
- Domain、market、technical research 必须写入 `{analysis_artifacts}/research/`。Product Brief 默认写入 `{analysis_artifacts}/product-brief/`，PRFAQ 默认写入 `{analysis_artifacts}/prfaq/`；existing install 的 legacy-compatible exception 仅限上文定义的 root-level main artifact resume/write-in-place policy。这些 workflows 不是 project knowledge producers。

## Story Lifecycle Artifact Paths（Story 生命周期产物路径）

Story lifecycle 相关 artifact paths 由 `implementation_artifacts` 派生。除 `story_location_absolute` 外，所有路径都必须是 project-relative POSIX path。

| Field | Default | Meaning | Persistence rule |
| --- | --- | --- | --- |
| `sprint_status_file` / `{sprint_status_file}` | `{implementation_artifacts}/sprint-status.yaml` | Sprint tracking 的 YAML 文件。 | 可持久化为 project-relative POSIX path。 |
| `sprint_status` / `{sprint_status}` | loaded content of `sprint_status_file` | 当前 Sprint/Epic/Story 状态映射。 | 作为读取对象，不作为单独 artifact path。 |
| `story_location` | `{implementation_artifacts}/stories` | Story 文件所在目录。 | `sprint-status.yaml` 可记录该 project-relative path。 |
| `story_location_absolute` | resolved absolute path of `story_location` | 当前执行进程内部用于读取文件的绝对路径。 | 不得写入 public JSON、manifest、Story 或 audit report。 |
| `story_root` / `{story_root}` | value of `story_location`, fallback `{implementation_artifacts}/stories` | Story consumer 的解析根目录。 | 可在 report 中记录 project-relative path。 |
| `flow_gate_root` / `{flow_gate_root}` | `{implementation_artifacts}/flow-gates` | Flow Gate report 输出目录。 | 可持久化为 project-relative POSIX path。 |
| `default_output_file` / `{default_output_file}` | `{story_root}/{story_key}.md` | `speclite-create-story` 的默认 Story 输出文件。 | 必须落在 `story_root` 下。 |

## Sprint Status Schema（Sprint Status Schema）

`sprint-status.yaml` 的 lifecycle state map 使用 `development_status`。Epic、Story 和 retrospective 状态可以共存在同一个 map 中，但 key 语义必须稳定：

| Key form | Example | Meaning |
| --- | --- | --- |
| `epic-{n}` | `epic-2` | Epic 主状态。 |
| `{epic}-{story}-{slug}` | `2-1-methodology-discovery-metadata-generation` | Story 状态。 |
| `epic-{n}-retrospective` | `epic-2-retrospective` | Epic retrospective 状态。 |
| `development_status{story_key}` | `development_status["2-1-methodology-discovery-metadata-generation"]` | Skill 文档中指向具体 Story 状态的逻辑引用。 |

Story 状态值为：

- `backlog`
- `ready-for-dev`
- `in-progress`
- `review`
- `done`

Flow Gate 和 finalizer 使用 `story_completion_status` 表达 Story completion decision，不得把 `review` 或 `done` 与 Flow Gate result 混用。`epic_status` 表达 Epic 主状态，不得从任意子 Story 状态自由推断。

## Flow Gate Modes（Flow Gate 模式）

Flow Gate 是 Story/Epic 状态推进前的 evidence gate。它不负责实现代码，也不负责自动修复文档；它只输出可复核 report 和 gate result。

| Mode | Required timing | Target | Required report location |
| --- | --- | --- | --- |
| `story-kickoff` | `ready-for-dev` -> `in-progress` 前 | Story key 或 Story file | `{flow_gate_root}/{story_key}-story-kickoff-gate.md` |
| `story-completion` | Story 进入 `review` 前 | Story key 或 Story file | `{flow_gate_root}/{story_key}-story-completion-gate.md` |
| `epic-completion` | Epic 全部 Stories `done` 后 | Epic number | `{flow_gate_root}/epic-{n}-completion-gate.md` |
| `epic-kickoff` | 下一 Epic 首个 Story 创建或开发前 | Epic number | `{flow_gate_root}/epic-{n}-kickoff-gate.md` |

如果 mode、target 或 required source document 缺失，skill 必须停止并请求补充信息，不得静默推进 `development_status`。

## Flow Gate Results（Flow Gate 结果）

Flow Gate result 是状态推进和 review/finalizer 的 gate input。结果枚举固定为：

| Result | Meaning | Downstream action |
| --- | --- | --- |
| `PASS` | Contract、functional implementation 和 evidence 全部一致。 | 可以继续下游 workflow。 |
| `PASS_EQUIVALENT` | Story guidance 命名或拆分不同，但 owning SPEC、实际实现和证据证明行为等价。 | 可以继续下游 workflow，并必须保留 equivalence rationale。 |
| `FAIL_CONTRACT` | Owning SPEC 要求的 contract anchor 缺失或被矛盾实现破坏。 | 先修 contract anchor 或修订 SPEC/Story。 |
| `FAIL_FUNCTION` | Contract 存在，但实际 runtime/source 行为缺失。 | 先实现或修复功能。 |
| `FAIL_EVIDENCE` | 功能可能存在，但缺少 test、fixture、snapshot、command output 或 CI/release evidence。 | 先补证据。 |
| `DECISION_NEEDED` | 文档冲突、scope 模糊或等价判断需要人工决策。 | 先请求用户决策或运行 correct-course。 |

Finalizer 在标记 `done` 前必须看到 `story-completion` gate 的 `PASS` 或 `PASS_EQUIVALENT`，或看到由人工记录的等价批准证据。

## Flow Gate Report Metadata（Flow Gate 报告元数据）

Flow Gate report 是 downstream hook、dev-story、CR 和 finalizer 的 machine-readable gate input。Markdown report 必须在文件开头使用 YAML frontmatter；human-readable Markdown prose 只能作为解释材料，不能作为 gate result 的 parser source。

`flow_gate_report_metadata` 的最小字段为：

```ts
type FlowGateReportMetadata = {
  schemaVersion: "speclite.flow-gate-report.v1";
  mode: "story-kickoff" | "story-completion" | "epic-completion" | "epic-kickoff";
  target: string;
  storyKey?: string;
  result: "PASS" | "PASS_EQUIVALENT" | "FAIL_CONTRACT" | "FAIL_FUNCTION" | "FAIL_EVIDENCE" | "DECISION_NEEDED";
  generatedAt: string;
  sourceSkill: "speclite-flow-gate";
};
```

`generatedAt` 必须是 JavaScript `Date.toISOString()` 产生的 canonical UTC ISO string。`story-kickoff` 和 `story-completion` report 必须包含 `storyKey`，且 `target` 必须等于完整 Story key。Hook、finalizer 或 validation 不得通过扫描 Summary prose、标题或人工说明来判断 gate result。

## Flow Gate Hook Enforcement Artifacts（Flow Gate Hook 强制执行产物）

Flow Gate kickoff enforcement hook 是独立 canonical source，不属于 `speclite-dev-story` skill package。默认 source root 是 `assets/source/speclite/hooks/flow-gate-enforcement/`；等价路径必须同时满足：

- 位于 `assets/source/speclite/` canonical source tree。
- 独立于 `assets/source/speclite/sdlc-skills/4-implementation/speclite-dev-story/`。
- Installer 可投射到项目级 Claude/Codex execution-plane hook config。
- tests/fixtures 证明 installed runtime 可阻断 `speclite-dev-story`。

Installed hook artifact 至少包含：

- hook source metadata，例如 `hook-manifest.json`。
- executable hook runner，例如 `_speclite/hooks/flow-gate-enforcement/runner.mjs`。
- per-platform project hook config，例如 `.claude/settings.json` 和 `.codex/hooks.json`。
- `_speclite/config.toml` 中的 `[hooks.flow-gate-enforcement]` runtime descriptor，供 skills、support commands 和用户理解 hook 安装状态与 trust boundary。

Hook descriptor 的最小 shape 由 `_bmad-output/planning-artifacts/specs/03-install-plan-contract.md#Runtime Config Descriptor Sections` 定义。它必须包含 `source_skill`、`protected_skill`、`runtime_root`、`runner`、`events`、`platform_configs` 和 Codex `/hooks` trust note。Descriptor 是 human/skill-facing runtime metadata；hook file hashes、ownership、executable intent 和 `sourceRef` 仍由 files index 负责。

Hook runner 必须从 stdin 读取 hook event JSON，识别 `speclite-dev-story` intent，解析唯一 Story key，通过 installed runtime config 解析 `{implementation_artifacts}`。如果 config value 以 `{project-root}/` 开头，runner 必须先把 token 解析为当前 target project root，再读取 `{implementation_artifacts}/flow-gates/{story-key}-story-kickoff-gate.md` frontmatter。Hook 只允许 `mode=story-kickoff` 且 `result=PASS` 或 `PASS_EQUIVALENT`。缺失、非通过、目标不匹配、无法唯一解析或过期 metadata 必须阻断并给出下一步命令。Runner 不得运行 `speclite-flow-gate`、写 report、修改 Story 或推进 `sprint-status.yaml`。

## Anchor Contract Map（Anchor Contract Map）

Story、Flow Gate report 和 review output 使用 `anchor_contract_map` 记录依赖判断。每个依赖必须按以下类型分类：

| Anchor type | Definition | Gate behavior |
| --- | --- | --- |
| `Contract Anchor` | Owning SPEC 明确要求的文件、schema、parser、issue id、command output 或 fixture contract。 | 缺失为 `FAIL_CONTRACT`。 |
| `Functional Anchor` | 满足契约行为的实际 source/runtime implementation。它可以集中实现，也可以拆分实现。 | 缺失为 `FAIL_FUNCTION`。 |
| `Evidence Anchor` | 证明行为存在且稳定的 test、fixture、snapshot、command result、CI 或 release evidence。 | 缺失为 `FAIL_EVIDENCE`。 |
| `Guidance Anchor` | Story-local 建议路径、建议模块拆分、命名提示或实现建议，且未被 owning SPEC 提升为 contract。 | 单独不构成 hard gate；若有等价实现和证据，可为 `PASS_EQUIVALENT`。 |

固定文件名只有在 owning SPEC 明确要求时才是 hard gate。否则必须先检查 equivalent functional implementation 和 evidence anchors，不能只因 suggested file path 不存在而 HALT。

## Story Template Sections（Story 模板章节）

新建或后续修改的 Story 必须具备以下 lifecycle sections，或记录等价章节名称和映射理由：

- `Dependency Gate`
- `Anchor Contract Map`
- `Equivalent Implementation Policy`
- `Evidence Plan`
- `Anchor Evidence Summary`

`dependency_gate` 记录开发前置检查与 gate expectation。`evidence_plan` 记录计划中的 tests、fixtures、commands 或 release evidence。`Anchor Evidence Summary` 在开发完成后记录实际验证结果、File List 对齐和 `PASS_EQUIVALENT` rationale。

## Legacy Baseline Rule（历史基线规则）

本 SPEC 生效前已经完成或已经处于 review/done 状态的 historical Story 不要求批量回填新增 Story template sections、Flow Gate reports 或 `Anchor Evidence Summary`。

Audit 可以将这些旧 Story 记录为 `LEGACY_BASELINE`，但不得把它们当作当前 implementation blocker。以下场景必须执行 future enforcement：

- 新建 Story。
- 旧 Story 被重新打开并修改 scope、acceptance criteria、Dev Notes 或 implementation plan。
- Story 需要从 `ready-for-dev` 推进到 `in-progress`。
- Story 需要从 implementation 完成推进到 `review`。
- CR finalizer 准备把 Story 标记为 `done`。

## Consumer Requirements（消费方要求）

- `speclite-create-story` 必须默认把 Story 写入 `{implementation_artifacts}/stories/{story_key}.md`，并填充 lifecycle sections。
- `speclite-dev-story` 必须优先从 `sprint_status.story_location` 发现 Story，fallback 到 `{implementation_artifacts}/stories`。
- `speclite-dev-story` 在 `ready-for-dev` -> `in-progress` 前必须要求 `story-kickoff` gate。
- `speclite-dev-story` 在进入 `review` 前必须要求 `story-completion` gate，并更新 `Anchor Evidence Summary`。
- `speclite-sprint-status` 必须提示缺失、失败或过期的 kickoff gate，并推荐运行 flow gate。
- SR/CR reviewers 必须区分 Contract Anchor、Functional Anchor、Evidence Anchor 和 Guidance Anchor，不能把 guidance path 写成 hard gate。
- CR finalizer 必须在 `done` 前检查 `story-completion` gate result 为 `PASS` 或 `PASS_EQUIVALENT`，或存在人工批准的等价证据。

## Change Rule（变更规则）

任何新增 lifecycle field、Flow Gate mode、Flow Gate result、anchor type 或 Story template section，必须先更新本 SPEC，再更新 canonical skill、template、lint/audit 规则和 regression scenario。不得只修改单个 skill 文案并让下游 Story 或 reviewer 自行推断新契约。
