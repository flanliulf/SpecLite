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

- `[modules.sdlc].planning_artifacts`
- `[modules.sdlc].implementation_artifacts`
- `[modules.sdlc].project_knowledge`
- `{planning_artifacts}`
- `{implementation_artifacts}`
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

Runtime config 中的 `[modules.sdlc]` 定义 SDLC workflow 使用的项目级 artifact roots。Skill 必须通过 installed runtime config 或 `speclite resolve config` 读取这些值，不得从 source checkout 或 skill package 文案反推。

| Runtime key | Placeholder | Meaning | Contract |
| --- | --- | --- | --- |
| `modules.sdlc.planning_artifacts` | `{planning_artifacts}` | PRD、Architecture、Specs、Epics、readiness、workflow status 等 planning artifacts 的根目录。 | Runtime config 中必须写成 `{project-root}`-prefixed portable path；消费时必须解析到 target project 内。 |
| `modules.sdlc.implementation_artifacts` | `{implementation_artifacts}` | sprint status、stories、flow-gates、story reviews、code reviews、retrospectives、implementation audits 等 implementation artifacts 的根目录。 | Runtime config 中必须写成 `{project-root}`-prefixed portable path；消费时必须解析到 target project 内。 |
| `modules.sdlc.project_knowledge` | `{project_knowledge}` | 项目知识、背景文档和长期参考材料的根目录。 | Runtime config 中必须写成 `{project-root}`-prefixed portable path；Skill 可以读取；写入必须由具体 workflow 明确授权。 |

`{project-root}` 是 runtime config 中允许持久化的 portable token，不是 raw absolute path。`{planning_artifacts}`、`{implementation_artifacts}` 和 `{project_knowledge}` 是 logical placeholders；它们可以在 runtime config 中展开为 `{project-root}/...`，但任何 filesystem I/O 前必须解析为当前 target project root 下的真实路径。Public report、manifest projection、audit result 和 fixture snapshot 中持久化路径时，必须记录 display-safe path，不得泄露真实 absolute path、home directory、drive letter 或 temporary/cache path。

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
