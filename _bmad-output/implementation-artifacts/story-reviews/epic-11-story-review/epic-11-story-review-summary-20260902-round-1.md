---
Epic: 11
Scope: epic
Round: 1
Date: 2026-09-02
Model Used: GPT-5.5 (gpt-5.5)
Type: Story Review Summary
Stories Reviewed: 10
---

## 审查结论

首轮审查。共审查 Epic 11 下 10 个 Story。审查层状态：当前任务环境未提供独立 Agent 子审查工具，已按 `bmenhance-sr-01-reviewer` 的单一 LLM 回退策略完成 structure / consistency / contract 三维合并审查；未保留 `.tmp` 临时产物。

- 通过：4 个
- 有条件通过：4 个
- 硬阻塞：2 个

总体判断：Epic 11 的 strict-serial 主线、FR 覆盖、Flow Gate 入口和 no-migration 边界总体成立，但 Story 11.2 与 Story 11.5 在 owning SPEC / public schema 边界上仍有开发前必须关闭的设计缺口。建议先修正本 summary 中的 2 个高严重度 finding，再进入 Story 11.1 kickoff；其余中低风险项可以作为同轮 Story 文档补丁处理。

## 审查范围

- Story 文件：
  - `_bmad-output/implementation-artifacts/stories/11-1-executable-artifact-root-resolution-contract.md`
  - `_bmad-output/implementation-artifacts/stories/11-2-fresh-install-artifact-root-projection.md`
  - `_bmad-output/implementation-artifacts/stories/11-3-existing-install-compatibility-and-diagnostics.md`
  - `_bmad-output/implementation-artifacts/stories/11-4-route-analysis-workflows-into-dedicated-artifact-subdirectories.md`
  - `_bmad-output/implementation-artifacts/stories/11-5-govern-planning-and-solutioning-documents-as-whole-and-sharded-artifacts.md`
  - `_bmad-output/implementation-artifacts/stories/11-6-consolidate-ux-artifacts-under-the-planning-ux-space.md`
  - `_bmad-output/implementation-artifacts/stories/11-7-standardize-the-prd-validation-report-filename.md`
  - `_bmad-output/implementation-artifacts/stories/11-8-rename-and-relocate-implementation-readiness-skills.md`
  - `_bmad-output/implementation-artifacts/stories/11-9-normalize-code-review-artifact-directories-by-story-id.md`
  - `_bmad-output/implementation-artifacts/stories/11-10-inventory-all-grill-related-skill-references-for-human-confirmation.md`
- 对照基准：
  - `_bmad-output/project-context.md`
  - `_bmad-output/planning-artifacts/epics/index.md`
  - `_bmad-output/planning-artifacts/epics/14-epic-11-phase-aligned-workflow-artifact-governance阶段对齐的-workflow-artifact-治理.md`
  - `_bmad-output/planning-artifacts/implementation-readiness-report-2026-09-02.md`
  - `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md`
  - `_bmad-output/planning-artifacts/specs/03-install-plan-contract.md`
  - `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md`
  - `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md`
  - `_bmad-output/planning-artifacts/specs/09-sdlc-workflow-lifecycle-contract.md`
  - `_bmad-output/planning-artifacts/architecture/03-core-architectural-decisions核心架构决策.md`
  - `_bmad-output/planning-artifacts/architecture/04-implementation-patterns-consistency-rules实现模式与一致性规则.md`
  - `_bmad-output/implementation-artifacts/sprint-status.yaml`
- 审查维度：
  - 结构完整性
  - AC 可测性
  - 与 Epic 一致性
  - 与架构文档一致性
  - Story 间冲突与依赖
  - 任务拆分合理性
  - 交互 / 认证 / 安全 / 性能口径
  - 跨 Epic 共享契约
  - `SPEC 09` Flow Gate / artifact-root owner boundary
  - whole/sharded discovery、rename/no-alias、CR directory normalization、grill inventory read-only boundary

## 新发现

### 1. [高] Story 11.2 把 public JSON / manifest projection 的 exact shape 留给 kickoff，但 owning SPEC 更新不在 Story 范围内

- **来源**：consistency+contract
- **分类**：decision_needed
- **涉及 Story**：11-2
- **证据** - `_bmad-output/implementation-artifacts/stories/11-2-fresh-install-artifact-root-projection.md:63-65` 要求 kickoff 决定逐 root projection 的 container、exact fields、required/optional、ordering、backward compatibility 与 `schemaVersion`；同文件 `120-132` 的 Files To Modify 只列实现代码、metadata 和 fixtures，没有列 `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md` 或 `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md`。`_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md:46-52` 要求 public JSON additions 先更新本 SPEC、schema module 和 fixtures；`_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md:7-18`、`55-68` 声明 manifest/index fields 与 schema evolution 由 SPEC 04 拥有。
- **影响** - Story 11.2 需要把七类 roots、mode、plane/ownership 投影到 config、manifest/index 和 Ready Summary；若 exact public shape 只由 kickoff 或实现代码临场决定，会使 CLI JSON、manifest/index 与 fixtures 各自发明字段，违反 owner contract。
- **建议** - 修订 Story 11.2：在 Dependency Gate 与 Files To Modify 中显式加入 `SPEC 01` / `SPEC 04` 同变更更新，或明确本 Story 不改变 public JSON / manifest schema 并给出如何用既有字段表达七 root evidence 的等价方案。未关闭前，Story 11.2 不应进入 implementation。

### 2. [高] Story 11.5 的 whole/sharded decision table 尚未由 `SPEC 09` owning contract 承载

- **来源**：consistency+contract
- **分类**：decision_needed
- **涉及 Story**：11-5
- **证据** - `_bmad-output/planning-artifacts/specs/09-sdlc-workflow-lifecycle-contract.md:58` 规定 Story 可以引用字段但不得重新定义语义；`SPEC 09:74` 只要求 whole/sharded producer 与 consumer 使用确定性发现规则并记录实际消费路径，没有给出 `whole-only`、`sharded-only`、`whole+sharded` ambiguity、broken shard、missing subject 等完整决策表。`_bmad-output/implementation-artifacts/stories/11-5-govern-planning-and-solutioning-documents-as-whole-and-sharded-artifacts.md:17-29` 在 Story 内定义该唯一 decision table；同文件 `87-92` 的 Files To Modify 未包含 `SPEC 09` 更新。
- **影响** - Story 11.5 将 decision table 作为 hard contract 和 cross-consumer precedence，但 owning SPEC 目前只提供抽象要求。实现者可能在 Story-local helper、workflow consumer 或后续 docs 中复制不同版本的 precedence，导致 PRD/Epics/Architecture discovery 再次形成多真源。
- **建议** - 在 Story 11.5 中增加 `SPEC 09` contract update，或先通过 Correct Course / SPEC owner revision 把 whole/sharded decision table、blocking continuation、required evidence fields 和 stable issue mapping 纳入 `SPEC 09`。随后再让 producer/consumer implementation 消费同一表。

### 3. [中] 多个 Story 要求新 stable diagnostics，但 Files To Modify 未覆盖 `SPEC 07` issue registry

- **来源**：structure+contract
- **分类**：patch
- **涉及 Story**：11-3、11-8、11-9
- **证据** - `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md:13-25` 要求 issue ids 使用 stable `<category>.<stable-code>`，producers 不得输出 free-form issue ids；`247-274` 的 `artifact-path` reserved IDs 尚无 `config-artifact-mismatch`、old-ID deprecation、modified-old-package rename conflict、legacy-only CR resume 或 dual-directory ambiguity；`345-357` 要求新增 validation categories / issue ids 同步 fixtures。Story 11.3 在 `72` 和 `90` 明说 `config-artifact-mismatch` exact issue ID 未固定，但 `98-105` 未列 `SPEC 07`。Story 11.8 在 `49` 和 `56` 明说 old-ID deprecation / modified-old-package conflict 未关闭，但 `71-76` 未列 `SPEC 07`。Story 11.9 在 `47-50` 和 `60` 明说 legacy-only / dual-directory diagnostic 未关闭，但 `75-80` 未列 `SPEC 07`。
- **影响** - 这些 diagnostic 是 downstream validator、update、activation、CR01-06 和 fixtures 会消费的 contract。若 Story 只改代码或 CR contract，不同步 taxonomy owner，后续审查只能看到实现行为，无法判断 issue id/category/details 是否 canonical。
- **建议** - 给 Story 11.3、11.8、11.9 补充 `SPEC 07` 更新路径或明确的 no-new-ID reuse rationale；在各自 Anchor Contract Map 中要求同变更更新 fixture assertion，且 producer 在 issue ID 未关闭时必须停在 `DECISION_NEEDED`。

### 4. [低] Story 11.4 的 AC 对 exact paths 和 canonical Skill IDs 压缩过度

- **来源**：structure
- **分类**：patch
- **涉及 Story**：11-4
- **证据** - Epic 11 定义中 `_bmad-output/planning-artifacts/epics/14-epic-11-phase-aligned-workflow-artifact-governance阶段对齐的-workflow-artifact-治理.md:237-258` 明确列出 `{analysis_artifacts}/research/`、`{analysis_artifacts}/product-brief/`、`{analysis_artifacts}/prfaq/` 与完整 workflow names；Story 11.4 的 implementation artifact 在 `_bmad-output/implementation-artifacts/stories/11-4-route-analysis-workflows-into-dedicated-artifact-subdirectories.md:13-16` 将后两个路径压缩为 `product-brief/`、`prfaq/`，并把 `speclite-market-research` / `speclite-technical-research` 压缩为 `market-research` / `technical-research`。
- **影响** - 不改变核心范围，但给实现 agent、negative scan 和 ZH/EN parity 对照增加了不必要解释空间。
- **建议** - 将 Story 11.4 AC 1-4 改为与 Epic 定义同样的完整 `{analysis_artifacts}/...` 路径和 full canonical Skill IDs。

## 逐篇审查结论

### Story 11.1: Executable Artifact Root Resolution Contract

**结论：通过**

**优点**
- 建立七类 roots、placeholders、fresh defaults、explicit config、legacy fallback、Project Knowledge/Public Docs boundary 的单一 resolver contract。
- 明确把 unresolved-token issue ID 和 staged ownership boundary 放入 kickoff 决策，并禁止提前实现 11.2/11.3 projection。

**关注点**
- 当前 status 仍是 `ready-for-dev`，进入 `in-progress` 前必须按 Story 自身要求生成 `story-kickoff` Gate。

### Story 11.2: Fresh Install Artifact Root Projection

**结论：硬阻塞**

**优点**
- Fresh config、directory plan、manifest/index、Ready Summary 和 zero-write cases 都有实现任务与 evidence plan。

**关键问题**
1. **Public schema / manifest owner decision 未关闭** — 见 Finding 1。

**建议动作**
- 先修订 Story 11.2 的 owning SPEC update / no-schema-change 决策，再执行 kickoff。

### Story 11.3: Existing Install Compatibility And Diagnostics

**结论：有条件通过**

**优点**
- explicit config authority、legacy-compatible fallback、actual consumed path、no-migration 与 byte-identical evidence 的边界清楚。

**关键问题**
1. **`config-artifact-mismatch` stable issue registry 未纳入修改范围** — 见 Finding 3。

**建议动作**
- 补上 `SPEC 07` issue registry / fixture assertion scope，或在 kickoff 中给出可复核的 reuse rationale。

### Story 11.4: Route Analysis Workflows Into Dedicated Artifact Subdirectories

**结论：有条件通过**

**优点**
- `1-analysis` scope、五类 producer、legacy fallback、no-migration、negative scan 与三 plane separation 都明确。

**关键问题**
1. **AC path / Skill ID 表达不够精确** — 见 Finding 4。

**建议动作**
- 补全 AC 1-4 的 exact paths 与 canonical Skill IDs。

### Story 11.5: Govern Planning And Solutioning Documents As Whole And Sharded Artifacts

**结论：硬阻塞**

**优点**
- whole/sharded states、explicit selection、zero write/progress mutation、no-migration 与 consumer coverage 的设计目标完整。

**关键问题**
1. **Whole/sharded decision table owner 与 `SPEC 09` 当前内容不闭合** — 见 Finding 2。

**建议动作**
- 先把 decision table 和 blocking issue mapping 落入 owning SPEC / taxonomy，再让 implementation 消费。

### Story 11.6: Consolidate UX Artifacts Under The Planning UX Space

**结论：通过**

**优点**
- UX parent root、三个 exact basenames、on-demand design-system、relative-link traversal、legacy no-migration 与 consumer updates 都有明确验收表达。

**关注点**
- 该 Story 必须等待 11.1-11.5 的 completion Gates，不得因为自身文档完整而提前并行。

### Story 11.7: Standardize The PRD Validation Report Filename

**结论：通过**

**优点**
- exact basename、single invocation date、same-day pre-write block、legacy discovery、no suffix 与 zero progress/write mutation 都可测。
- Files To Modify 已显式包含 `SPEC 07` stable issue registry。

**关注点**
- 需要在 kickoff 中实际注册或绑定 same-day conflict issue ID，不能把 Story 文案视为 registry 完成。

### Story 11.8: Rename And Relocate Implementation Readiness Skills

**结论：有条件通过**

**优点**
- Rename/no-alias、fresh-only-new projection、`renamedFromCanonicalSkillIds`、new solutioning output root、modified-old-package protection 与 exact scan 都是 bounded contract。
- 明确不把 11.10 broad inventory 作为 11.8 completion gate。

**关键问题**
1. **old-ID deprecation / modified-old-package conflict stable diagnostics 未纳入 `SPEC 07` scope** — 见 Finding 3。

**建议动作**
- 补充 taxonomy owner update 或 reuse rationale，并保持 exact scan 与 11.10 broad inventory 分离。

### Story 11.9: Normalize Code Review Artifact Directories By Story ID

**结论：有条件通过**

**优点**
- Story-ID-only root、title/slug/traversal exclusion、single `$cr_dir` propagation、round artifacts 同目录、legacy no-migration 与 dual-dir ambiguity stop 均有设计表达。

**关键问题**
1. **legacy-only resume target 与 dual-directory stable diagnostic 的 owner scope 未闭合** — 见 Finding 3。

**建议动作**
- 补充 `SPEC 07` 或明确 CR contract 自身的 stable diagnostic registry，并在 kickoff 前关闭 write-target decision。

### Story 11.10: Inventory All Grill-Related Skill References For Human Confirmation

**结论：通过**

**优点**
- Read-only inventory boundary、full corpus scan、line-level match-to-entry reconciliation、ZH/EN separation、relationship summary、11.8 regression split 与 human confirmation gate 均明确。
- 明确以 Story 11.8 完成后的 current state 为 baseline，且不反向成为 11.8 completion gate。

**关注点**
- 空 inventory section 是正确的 planned state；实施时必须等待 11.1-11.9 全部 completion evidence。

## 通过项

- Epic live 文件定位正确：当前 authoritative Epic 11 定义位于 `_bmad-output/planning-artifacts/epics/14-epic-11-phase-aligned-workflow-artifact-governance阶段对齐的-workflow-artifact-治理.md`，不是不存在的 `epic-11.md`；`epics/index.md` 作为 sharded corpus navigation owner 使用。
- Story 清单完整：`_bmad-output/implementation-artifacts/stories/` 下存在 11-1 至 11-10 共 10 个 Story，且 tracker 中 `epic-11` 为 `in-progress`、10 个 Story 均为 `ready-for-dev`。
- Strict serial 规则明确：Epic 11 定义要求 `11.1 -> 11.10`，每个 Story 只能消费更早 evidence；tracker 也明确不得同时推进多个 Epic 11 Story。
- Fresh IR 对 implementation readiness 的边界表达正确：`implementation-readiness-report-2026-09-02.md` 结论为 `READY`，同时明确这不表示 Epic 11 已实现、已验证或可跳过 Story-level Flow Gates。
- Current repository legacy physical layout 已被正确分类：Architecture、Specs 与 IR 仍物理位于 `_bmad-output/planning-artifacts/`，可作为 existing / `legacy-compatible` current state 解释，不冒充 fresh `{solutioning_artifacts}` topology。
- Story 11.8 与 Story 11.10 的职责分离通过：11.8 做 exact old-ID/path bounded closure，11.10 做完成后的 broad read-only semantic inventory；未发现反向后置依赖。
- Defer：`_bmad-output/project-context.md` 仍是 initialized skeleton，且 Story 11.1 已说明实现约束以 current PRD、Architecture、Specs、Epic/Story、UX 与 repository code 为准。该 skeleton 不是本轮 SR blocker。
- Defer：PRD NFR count metadata drift 已由 fresh IR 标记为非阻塞维护项，不影响 Epic 11 Story design readiness。

## 分类统计

- Findings 总数：4
- 四桶分类：`decision_needed` 2、`patch` 2、`defer` 2、`dismiss` 0
- 严重性：`[高]` 2、`[中]` 1、`[低]` 1
- 来源：`consistency+contract` 2、`structure+contract` 1、`structure` 1
- 失败 / 未执行审查层：独立 Agent 版 Structure Hunter、Consistency Checker、Contract Auditor 未执行；已使用单一 LLM fallback 覆盖三类审查维度。
