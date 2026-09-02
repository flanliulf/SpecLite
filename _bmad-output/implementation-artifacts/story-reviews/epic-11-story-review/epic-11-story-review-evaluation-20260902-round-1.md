---
Epic: 11
Scope: epic
Round: 1
Date: 2026-09-02
Model Used: GPT-5.5 (gpt-5.5)
Review Source: epic-11-story-review-summary-20260902-round-1.md
Review Model: GPT-5.5 (gpt-5.5)
Type: Story Review Evaluation
---

## 评估总结

本轮评估独立核验了 reviewer summary 的 4 个正式 findings 及其引用的 live Story、Epic、SPEC 01 / 04 / 07 / 09、Architecture 与 fresh IR。Reviewer 披露未执行独立三层 Agent、采用单一 LLM fallback，这是质量背景；本评估不直接接受 reviewer 结论，而以当前 artifacts 的 owner contract 和可执行边界为准。

评估结论：4 个 finding 均非纯误报。其中 #1、#2 的 contract owner gap 有效，属于 P1，阻塞受影响 Story 进入实现，但不授权 SR Fixer 修改 owning SPEC；Fixer 只可把 Story 文档中的 owner decision / Files To Modify / Dependency Gate 表达补齐。#3、#4 有效但降级为 P2，属于非阻塞 Story precision patch。

## 发现 #1 评估

### 审查原文

> **[高] Story 11.2 把 public JSON / manifest projection 的 exact shape 留给 kickoff，但 owning SPEC 更新不在 Story 范围内**
> - 来源：consistency+contract
> - 分类：decision_needed
> - 涉及 Story：11-2
> - 证据 - `_bmad-output/implementation-artifacts/stories/11-2-fresh-install-artifact-root-projection.md:63-65` 要求 kickoff 决定逐 root projection 的 container、exact fields、required/optional、ordering、backward compatibility 与 `schemaVersion`；同文件 `120-132` 的 Files To Modify 只列实现代码、metadata 和 fixtures，没有列 `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md` 或 `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md`。`_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md:46-52` 要求 public JSON additions 先更新本 SPEC、schema module 和 fixtures；`_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md:7-18`、`55-68` 声明 manifest/index fields 与 schema evolution 由 SPEC 04 拥有。
> - 影响 - Story 11.2 需要把七类 roots、mode、plane/ownership 投影到 config、manifest/index 和 Ready Summary；若 exact public shape 只由 kickoff 或实现代码临场决定，会使 CLI JSON、manifest/index 与 fixtures 各自发明字段，违反 owner contract。
> - 建议 - 修订 Story 11.2：在 Dependency Gate 与 Files To Modify 中显式加入 `SPEC 01` / `SPEC 04` 同变更更新，或明确本 Story 不改变 public JSON / manifest schema 并给出如何用既有字段表达七 root evidence 的等价方案。未关闭前，Story 11.2 不应进入 implementation。

### 评估结论：✅ 确认有效 — 需要修订（P1 优先级）

### 评估分析

**问题描述准确性**：准确 — Story 11.2 明确把逐 root projection 的 public shape 留给 kickoff，但 Files To Modify 未列 `SPEC 01` / `SPEC 04`。`SPEC 01` 要求 public JSON additions 先更新 SPEC、schema module 和 fixtures；`SPEC 04` 拥有 manifest/index public fields 与 schema evolution。Architecture 也要求 public projection 与 manifest/index 不由 implementation 层复制定义。

**严重性判断**：合理 — 这是 Story 11.2 自身 implementation 前的 contract blocker。fresh IR 的 `READY` 只说明 planning artifacts 足以进入受控实施，不等于可跳过 Story-level Flow Gate，也不关闭 public JSON / manifest exact-shape owner decision。

**修订建议**：可行但需边界限制 — 可授权 SR Fixer 只修改 Story 11.2：在 Contract Decision、Dependency Gate、Files To Modify 或 Anchor Contract Map 中补充 `SPEC 01` / `SPEC 04` owner decision。不得由 SR Fixer 实际修改 `SPEC 01` / `SPEC 04` 或替 implementation 决定 public schema shape。

**误报评估**：非误报 — 现有 Story 文案已感知该决策，但未把 owning SPEC update / no-schema-change rationale 纳入明确 Story scope。

## 发现 #2 评估

### 审查原文

> **[高] Story 11.5 的 whole/sharded decision table 尚未由 `SPEC 09` owning contract 承载**
> - 来源：consistency+contract
> - 分类：decision_needed
> - 涉及 Story：11-5
> - 证据 - `_bmad-output/planning-artifacts/specs/09-sdlc-workflow-lifecycle-contract.md:58` 规定 Story 可以引用字段但不得重新定义语义；`SPEC 09:74` 只要求 whole/sharded producer 与 consumer 使用确定性发现规则并记录实际消费路径，没有给出 `whole-only`、`sharded-only`、`whole+sharded` ambiguity、broken shard、missing subject 等完整决策表。`_bmad-output/implementation-artifacts/stories/11-5-govern-planning-and-solutioning-documents-as-whole-and-sharded-artifacts.md:17-29` 在 Story 内定义该唯一 decision table；同文件 `87-92` 的 Files To Modify 未包含 `SPEC 09` 更新。
> - 影响 - Story 11.5 将 decision table 作为 hard contract 和 cross-consumer precedence，但 owning SPEC 目前只提供抽象要求。实现者可能在 Story-local helper、workflow consumer 或后续 docs 中复制不同版本的 precedence，导致 PRD/Epics/Architecture discovery 再次形成多真源。
> - 建议 - 在 Story 11.5 中增加 `SPEC 09` contract update，或先通过 Correct Course / SPEC owner revision 把 whole/sharded decision table、blocking continuation、required evidence fields 和 stable issue mapping 纳入 `SPEC 09`。随后再让 producer/consumer implementation 消费同一表。

### 评估结论：✅ 确认有效 — 需要修订（P1 优先级）

### 评估分析

**问题描述准确性**：基本准确 — live `SPEC 09` 只给出 phase-owned subject directories 和确定性发现要求，没有承载完整 decision table；Story 11.5 自身定义了该表。更关键的是 Epic 11 的 Anchor Contract Map 已写明 `SPEC 09` 必须拥有 discovery decision table，说明 reviewer 的 owner concern 与 Epic 约束一致。

**严重性判断**：合理但需限定 — 这会阻塞 Story 11.5 implementation，不应扩大为“Epic 11 整体不可从 Story 11.1 开始”。fresh IR 已将 Epic 11 判定为 `READY`，但同样强调每个 Story 必须通过 `SPEC 09` Flow Gate；因此 #2 是受影响 Story 的 P1，不是否定 fresh IR 的全局 blocker。

**修订建议**：可行但非普通 SPEC patch — 可授权 SR Fixer 只修改 Story 11.5：补充 `SPEC 09` contract-update / owner-decision gate，明确 decision table、blocking continuation、evidence fields 先由 owning SPEC 承载或由用户/owner 决策。SR Fixer 不得直接修改 `SPEC 09`，也不得把 Story-local table伪装为 owning SPEC 已更新。

**误报评估**：非误报 — Story、Epic 与 `SPEC 09` 之间存在可复核的 owner承载缺口；fresh IR 的 ready 结论不消除该 Story-level contract hardening 需求。

## 发现 #3 评估

### 审查原文

> **[中] 多个 Story 要求新 stable diagnostics，但 Files To Modify 未覆盖 `SPEC 07` issue registry**
> - 来源：structure+contract
> - 分类：patch
> - 涉及 Story：11-3、11-8、11-9
> - 证据 - `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md:13-25` 要求 issue ids 使用 stable `<category>.<stable-code>`，producers 不得输出 free-form issue ids；`247-274` 的 `artifact-path` reserved IDs 尚无 `config-artifact-mismatch`、old-ID deprecation、modified-old-package rename conflict、legacy-only CR resume 或 dual-directory ambiguity；`345-357` 要求新增 validation categories / issue ids 同步 fixtures。Story 11.3 在 `72` 和 `90` 明说 `config-artifact-mismatch` exact issue ID 未固定，但 `98-105` 未列 `SPEC 07`。Story 11.8 在 `49` 和 `56` 明说 old-ID deprecation / modified-old-package conflict 未关闭，但 `71-76` 未列 `SPEC 07`。Story 11.9 在 `47-50` 和 `60` 明说 legacy-only / dual-directory diagnostic 未关闭，但 `75-80` 未列 `SPEC 07`。
> - 影响 - 这些 diagnostic 是 downstream validator、update、activation、CR01-06 和 fixtures 会消费的 contract。若 Story 只改代码或 CR contract，不同步 taxonomy owner，后续审查只能看到实现行为，无法判断 issue id/category/details 是否 canonical。
> - 建议 - 给 Story 11.3、11.8、11.9 补充 `SPEC 07` 更新路径或明确的 no-new-ID reuse rationale；在各自 Anchor Contract Map 中要求同变更更新 fixture assertion，且 producer 在 issue ID 未关闭时必须停在 `DECISION_NEEDED`。

### 评估结论：⚠️ 有效但降级 — 建议纳入后续改善跟踪（P2）

### 评估分析

**问题描述准确性**：基本准确 — `SPEC 07` 当前 reserved IDs 确实没有这些 exact diagnostic；Story 11.3、11.8、11.9 的 Files To Modify 也没有一致列出 `SPEC 07`。该缺口会影响 fixer/dev agent 对 owner文件范围的判断。

**严重性判断**：偏高 — 三篇 Story 已在不同位置写出保护：Story 11.3 Task / Dev Notes / Anchor Contract Map 明确 `SPEC 07` 注册或复用 rationale；Story 11.8 明确 issue contract 未关闭时 kickoff 返回 `DECISION_NEEDED`；Story 11.9 明确 legacy-only write target 或 dual-directory diagnostic 未关闭时不得开始实现。因此这不是当前 planning readiness 的硬阻塞，而是降低执行确定性的 P2 Story patch。

**修订建议**：可行 — 可授权 SR Fixer 只修改 Story 11.3、11.8、11.9 的 Files To Modify / Dependency Gate / Anchor Contract Map：补充 `SPEC 07` stable issue registry 或明确 no-new-ID reuse rationale。对 Story 11.9，如最终决定由 shared CR contract 而非 `SPEC 07` 承载 CR-specific diagnostic，也必须在 Story 中写清 owner和 fixture assertion边界。

**误报评估**：非误报 — 但 reviewer 将其作为中级 patch合理，作为 blocker则不成立。

## 发现 #4 评估

### 审查原文

> **[低] Story 11.4 的 AC 对 exact paths 和 canonical Skill IDs 压缩过度**
> - 来源：structure
> - 分类：patch
> - 涉及 Story：11-4
> - 证据 - Epic 11 定义中 `_bmad-output/planning-artifacts/epics/14-epic-11-phase-aligned-workflow-artifact-governance阶段对齐的-workflow-artifact-治理.md:237-258` 明确列出 `{analysis_artifacts}/research/`、`{analysis_artifacts}/product-brief/`、`{analysis_artifacts}/prfaq/` 与完整 workflow names；Story 11.4 的 implementation artifact 在 `_bmad-output/implementation-artifacts/stories/11-4-route-analysis-workflows-into-dedicated-artifact-subdirectories.md:13-16` 将后两个路径压缩为 `product-brief/`、`prfaq/`，并把 `speclite-market-research` / `speclite-technical-research` 压缩为 `market-research` / `technical-research`。
> - 影响 - 不改变核心范围，但给实现 agent、negative scan 和 ZH/EN parity 对照增加了不必要解释空间。
> - 建议 - 将 Story 11.4 AC 1-4 改为与 Epic 定义同样的完整 `{analysis_artifacts}/...` 路径和 full canonical Skill IDs。

### 评估结论：⚠️ 有效但降级 — 建议纳入后续改善跟踪（P2）

### 评估分析

**问题描述准确性**：准确 — Story 11.4 AC 1-4 使用了缩写路径和缩写 Skill IDs；Epic 11 与 `SPEC 09` 使用完整 `{analysis_artifacts}/...` 语义，Story 11.4 后续 Files To Modify 虽然补足了部分完整路径，但 AC 本身仍不够精确。

**严重性判断**：合理但不阻塞 — 该问题不会改变 Story 11.4 的核心范围，也不会导致当前 Story 不可实施；但 AC 是 dev agent 最直接消费的验收入口，保留缩写会增加 negative scan 与 ZH/EN parity 的解释空间。评估为 P2，而不是 P1。

**修订建议**：可行 — 可授权 SR Fixer 只修改 Story 11.4 AC 1-4 的文字：补齐 `{analysis_artifacts}/research/`、`{analysis_artifacts}/product-brief/`、`{analysis_artifacts}/prfaq/`，并使用 `speclite-domain-research`、`speclite-market-research`、`speclite-technical-research` 完整 canonical Skill IDs。不得扩大 11.4 到 Planning、UX、Readiness 或 CR routing。

**误报评估**：非误报 — 这是 precision patch，不是 contract blocker。

## 整体评估结论

### 需要修订（阻塞进入开发）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|------------|------|
| 1 | Story 11.2 public JSON / manifest projection owner decision 未闭合 | [高] | P1 | 阻塞 11.2 implementation |
| 2 | Story 11.5 whole/sharded decision table 未由 SPEC 09 承载 | [高] | P1 | 阻塞 11.5 implementation |

说明：上述 P1 阻塞的是对应 Story 的 kickoff / implementation，不等于否定 fresh IR 的 Epic 11 `READY`，也不等于阻止 Story 11.1 依 strict-serial 顺序启动；但若本 SR workflow 要求 Epic 11 Story corpus 先收口再开发，建议先执行 SR-03 的 Story-only 修订后再进入开发。

### 建议纳入后续改善跟踪（非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|------------|------|
| 3 | Story 11.3 / 11.8 / 11.9 stable diagnostics owner范围表达不完整 | [中] | P2 | 补齐 Story owner范围 |
| 4 | Story 11.4 AC exact paths / Skill IDs 压缩过度 | [低] | P2 | 补齐 AC 精确性 |

### 可忽略（误报）

| # | 发现 | 原始严重性 | 忽略理由 |
|---|------|----------|---------|
| 无 | 无 | 无 | 本轮 4 个正式 findings 均非纯误报 |

### 评估决定

**整体结论**：需修订后再审

授权后续 SR Fixer 仅做 Story 文档补丁，不授权修改 Epic、SPEC、Architecture、IR、源码、tracker、PLAN 或 Git。允许修改的 Story 文件与边界如下：

| Story 文件 | 授权边界 |
|---|---|
| `_bmad-output/implementation-artifacts/stories/11-2-fresh-install-artifact-root-projection.md` | 仅补充 `SPEC 01` / `SPEC 04` owner decision、同变更条件或 no-schema-change rationale；不得决定或写入 actual public schema shape |
| `_bmad-output/implementation-artifacts/stories/11-5-govern-planning-and-solutioning-documents-as-whole-and-sharded-artifacts.md` | 仅补充 `SPEC 09` contract-update / owner-decision gate 与 Files To Modify 表达；不得把 Story-local table宣称为 owning SPEC 已更新 |
| `_bmad-output/implementation-artifacts/stories/11-3-existing-install-compatibility-and-diagnostics.md` | 仅补齐 `SPEC 07` issue registry 或 no-new-ID reuse rationale 的 Story范围表达 |
| `_bmad-output/implementation-artifacts/stories/11-8-rename-and-relocate-implementation-readiness-skills.md` | 仅补齐 `SPEC 07` deprecation / modified-old-package diagnostic owner范围表达 |
| `_bmad-output/implementation-artifacts/stories/11-9-normalize-code-review-artifact-directories-by-story-id.md` | 仅补齐 CR stable diagnostic 的 owning taxonomy / shared CR contract 选择与 fixture assertion边界 |
| `_bmad-output/implementation-artifacts/stories/11-4-route-analysis-workflows-into-dedicated-artifact-subdirectories.md` | 仅补齐 AC 1-4 的完整 `{analysis_artifacts}/...` paths 与 canonical Skill IDs |

若 #1 或 #2 的后续执行需要实际修改 `SPEC 01`、`SPEC 04` 或 `SPEC 09`，必须先取得用户 / owner decision，或由对应 implementation Story 在明确授权后处理；SR Fixer 不得越权修改 owning SPEC。

## 修订执行记录

### 修订执行记录
- **Date**: 2026-09-02
- **Model Used**: GPT-5.5 (gpt-5.5)
- **Fix Items**: 6

#### 修订项 #1: Story 11.2 public JSON / manifest projection owner decision
- **文件**: `_bmad-output/implementation-artifacts/stories/11-2-fresh-install-artifact-root-projection.md`
- **章节**: `Contract Decision Required Before Development`、`Dependency Gate`、`Files To Modify`
- **修改摘要**: 补充 `SPEC 01` / `SPEC 04` 分别拥有 public `CommandResult` JSON 与 manifest/index schema evolution；要求 schema 变更必须同变更更新 owning SPEC，或在 kickoff 记录 no-schema-change rationale；未决定前 gate 停止，不由 implementation 临场发明 public shape。
- **状态**: 已完成

#### 修订项 #2: Story 11.5 whole/sharded decision table owner gate
- **文件**: `_bmad-output/implementation-artifacts/stories/11-5-govern-planning-and-solutioning-documents-as-whole-and-sharded-artifacts.md`
- **章节**: `Acceptance Criteria`、`Dependency Gate`、`Files To Modify`
- **修改摘要**: 明确 decision table 在 implementation 前必须由 `SPEC 09` owner decision 承载或批准同变更更新；在 owner gate 关闭前只作为 Story implementation target，不宣称 owning SPEC 已更新；Files To Modify 增加 owner-gated `SPEC 09` 条件或 no-contract-update rationale。
- **状态**: 已完成

#### 修订项 #3: Story 11.3 stable mismatch issue owner boundary
- **文件**: `_bmad-output/implementation-artifacts/stories/11-3-existing-install-compatibility-and-diagnostics.md`
- **章节**: `Dependency Gate`、`Files To Modify`
- **修改摘要**: 补充 `config-artifact-mismatch` 必须通过 `SPEC 07` registry update 或 no-new-ID reuse rationale 关闭；fixtures 需断言 category、stable code、details 与 redaction。
- **状态**: 已完成

#### 修订项 #4: Story 11.8 deprecation / modified-old-package diagnostic owner boundary
- **文件**: `_bmad-output/implementation-artifacts/stories/11-8-rename-and-relocate-implementation-readiness-skills.md`
- **章节**: `Dependency Gate`、`Files To Modify`
- **修改摘要**: 补充 old-ID deprecation 与 modified-old-package conflict 的 stable diagnostic 必须由 `SPEC 07` registry 新增承载或记录 no-new-ID reuse rationale；producer、activation 与 update plan 不得输出 free-form issue。
- **状态**: 已完成

#### 修订项 #5: Story 11.9 CR stable diagnostic owner / fixture assertion boundary
- **文件**: `_bmad-output/implementation-artifacts/stories/11-9-normalize-code-review-artifact-directories-by-story-id.md`
- **章节**: `Technical / Architecture / Testing Requirements`、`Dependency Gate`、`Files To Modify`
- **修改摘要**: 补充 legacy-only 与 dual-directory diagnostics 必须在 `SPEC 07` taxonomy 与 shared `speclite-code-review-contract` 之间选择唯一 owner；fixtures 必须断言 owner、stable ID/category/details、redaction、stop-before-write 与 zero progress mutation。
- **状态**: 已完成

#### 修订项 #6: Story 11.4 AC 1-4 exact paths and canonical Skill IDs
- **文件**: `_bmad-output/implementation-artifacts/stories/11-4-route-analysis-workflows-into-dedicated-artifact-subdirectories.md`
- **章节**: `Acceptance Criteria`
- **修改摘要**: 将 AC 1-2 的缩写路径与缩写 Skill ID 改为完整 `{analysis_artifacts}/research/`、`{analysis_artifacts}/product-brief/`、`{analysis_artifacts}/prfaq/` 以及 `speclite-domain-research`、`speclite-market-research`、`speclite-technical-research`；未扩展到 Planning、UX、Readiness 或 CR routing。
- **状态**: 已完成
