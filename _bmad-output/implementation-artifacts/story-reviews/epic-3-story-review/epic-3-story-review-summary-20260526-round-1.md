---
Epic: 3
Scope: epic
Round: 1
Date: 2026-05-26
Model Used: GPT-5.5 (gpt-5.5)
Type: Story Review Summary
Stories Reviewed: 6
---

## 审查结论

首轮审查。共审查 Epic 3 下 6 个 Story。审查层状态：3/3 层完成（Structure & Completeness Hunter、Consistency Checker、Contract & Boundary Auditor 均完成；当前环境没有独立 Agent 工具，因此按 skill 引擎的三层维度在同一审查上下文中串行执行）。

- 通过：3 个
- 有条件通过：1 个
- 硬阻塞：2 个

总体判断：不通过。Epic 3 的 Story 主体结构完整，AC、Tasks、Dev Notes、References 基本齐全，且大多数范围边界与 Architecture / owning SPEC 对齐。但 Story 3.3 的 canonical package hash 算法缺少可执行契约，Story 3.6 的 `source-integrity` 归属不清；这两处会直接影响 deterministic validation 和 fixture expected output 的一致性，建议先裁决再进入开发。

## 审查范围

- Story 文件：
  - `_bmad-output/implementation-artifacts/3-1-lightweight-install-status-summary.md`
  - `_bmad-output/implementation-artifacts/3-2-manifest-and-index-schema-validation.md`
  - `_bmad-output/implementation-artifacts/3-3-ide-mirror-and-file-integrity-validation.md`
  - `_bmad-output/implementation-artifacts/3-4-runtime-path-menu-target-legacy-entry-and-artifact-path-validation.md`
  - `_bmad-output/implementation-artifacts/3-5-commandresult-and-validationissue-json-contract.md`
  - `_bmad-output/implementation-artifacts/3-6-validation-progress-category-coverage-and-local-determinism.md`
- 对照基准：
  - `_bmad-output/project-context.md`
  - `_bmad-output/planning-artifacts/epics/06-epic-3-installed-state-and-deterministic-validation已安装状态与确定性验证.md`
  - `_bmad-output/planning-artifacts/architecture/03-core-architectural-decisions核心架构决策.md`
  - `_bmad-output/planning-artifacts/architecture/04-implementation-patterns-consistency-rules实现模式与一致性规则.md`
  - `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md`
  - `_bmad-output/planning-artifacts/specs/02-source-descriptor-contract.md`
  - `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md`
  - `_bmad-output/planning-artifacts/specs/05-ide-adapter-registry-contract.md`
  - `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md`
  - `_bmad-output/planning-artifacts/specs/08-fixture-contract.md`
- 审查维度：
  - 结构完整性
  - AC 可测性
  - 与 Epic 一致性
  - 与架构文档一致性
  - Story 间冲突与依赖
  - 任务拆分合理性
  - 交互/认证/安全/性能口径
  - 跨 Epic 共享契约
  - deterministic validation / fixture contract 可执行性

路径偏差记录：skill 配置默认 Story 文件目录为 `_bmad-output/implementation-artifacts/stories/`，但当前仓库没有该目录；本轮按用户指示和真实仓库状态审查 `_bmad-output/implementation-artifacts/3-*.md`。

## 新发现

### 1. [高] canonicalPackageHash 的计算算法没有形成可执行契约
- **来源**：consistency+contract
- **分类**：decision_needed
- **涉及 Story**：3-3
- **证据** - `_bmad-output/implementation-artifacts/3-3-ide-mirror-and-file-integrity-validation.md` 的 Task 2 要求按 self-contained entry layout 计算 canonical package content，并列出 `SKILL.md`、`CHANGELOG.md`、`references/`、`assets/`、`scripts/`、`config.toml.example`、`customize.toml` 参与 hash；IDE Mirror Contract Notes 也只列出内容范围。`_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md` 仅说明 `canonicalPackageHash` 是 package-level equality，`_bmad-output/planning-artifacts/specs/05-ide-adapter-registry-contract.md` 仅说明 adapter artifacts 不得混入 canonical package hash。
- **影响** - 不同实现可能对目录遍历顺序、relative path 拼接、空目录、symlink、file mode、换行、缺失 optional path 和 installed entry 与 source baseline 的比较方式作出不同选择，导致 `ide-mirror.hash-mismatch`、fixture snapshots 和 repair baseline 不稳定。
- **建议** - 在 Story 3.3 或 owning SPEC 中先裁决 canonical package hash algorithm：输入文件 allowlist、排序、hash 输入格式、目录/空目录/symlink/权限处理、缺失 optional paths 处理、adapter artifact 排除规则，以及与 source package baseline / installed entry baseline 的关系；再让 Story 3.3 实现 `src/manifest/hash.ts`。

### 2. [高] source-integrity 的 Epic 3 归属不清，Story 3.6 引用但未定义规则
- **来源**：consistency+contract
- **分类**：decision_needed
- **涉及 Story**：3-6
- **证据** - `_bmad-output/implementation-artifacts/3-6-validation-progress-category-coverage-and-local-determinism.md` 要求 canonical category order 包含 `source-integrity`，并在 local-only boundary 中说 MVP `source-integrity` validation 只检查本地记录的 source descriptor 与 integrity evidence shape；但同一 Story 的 scope 主要是 global progress/category coverage、ordering、determinism 和 renderer fallback，未给出 `source-integrity` rule 的 AC、issue details、fixtures 或与 Epic 5 source integrity stories 的交接边界。`_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md` 对 `source-integrity` 保留了完整 issue id baseline。
- **影响** - Dev agent 可能在 Story 3.6 中实现一半 source-integrity 领域规则，越过 Epic 3 范围；也可能完全跳过该 category，导致 checkedCategories、progress skipped state 和 fixture coverage 没有统一口径。
- **建议** - 先裁决二选一：要么把 Epic 3 的 Story 3.6 明确限定为只排序/展示已存在 categories，并把 `source-integrity` 标为未实现或由 Epic 5 引入；要么在 Epic 3 增补一个最小 local source descriptor/evidence validation Story，明确 AC、issue ids、details、fixtures 和与 Epic 5 远程/provenance 范围的边界。

### 3. [高] artifact-path 的 fixture write probe 与 validate 只读边界存在歧义
- **来源**：structure+contract
- **分类**：patch
- **涉及 Story**：3-4
- **证据** - `_bmad-output/implementation-artifacts/3-4-runtime-path-menu-target-legacy-entry-and-artifact-path-validation.md` 的 AC 5 / Task 5 要求报告 `artifact-path.fixture-write-failed`，但同一 Story 的 local-only/no-write boundary 明确 `speclite validate` 不得 write、delete、chmod、normalize、format、repair、regenerate、migrate、copy、move 或 clean up project files。
- **影响** - 如果实现者把 "fixture write probe" 理解为生产 `speclite validate` 的实际写探测，会违反只读验证边界并污染目标项目；如果它只是 fixture harness 中的测试动作，当前 Story 文案没有把它和 production validate 行为隔离清楚。
- **建议** - 在 Story 3.4 中把 `fixture write probe` 改写为 fixture harness / test-only 行为，或改为只读权限/metadata 检查；同时在 AC、Task、issue mapping 和 tests 中明确 production `validate` 不执行实际写入探测。

## 逐篇审查结论

### Story 3.1: Lightweight Install Status Summary

**结论：通过**

**优点**
- 清晰区分 `status.data.highLevelHealth` 与 `CommandResult.status`，并明确 `status` 不输出 full validation coverage。
- local-only / no-network / no full hash scan 边界明确，和 CommandResult SPEC、Architecture 中的 status/validate 分工一致。

**关注点**
- 当前 `_bmad-output/project-context.md` 仍是占位内容，Story 已正确指向 live PRD、Architecture、UX、ADR 和 owning SPEC artifacts 作为真实基准。

### Story 3.2: Manifest And Index Schema Validation

**结论：通过**

**优点**
- Manifest/index schema、canonical identity、files index hash/ownership、stable `manifest-schema` issue ids 和 deterministic validate data 设计完整。
- 明确不提前实现 Story 3.3-3.6 的 full validation categories，范围控制较好。

**关注点**
- 依赖前置 Epic 1 / Epic 2 actual implementation，Story 已把缺 scaffold 作为前置 blocker 写入任务。

### Story 3.3: IDE Mirror And File Integrity Validation

**结论：硬阻塞**

**优点**
- IDE mirror package-level hash 与 files index file-level hash 的分层清楚，issue id 与 taxonomy 对齐。
- Read-only drift reporting、details redaction 和 no repair boundary 表达明确。

**关键问题**
1. **canonicalPackageHash 的计算算法没有形成可执行契约** - 当前只列出参与内容类别和排除 adapter artifacts，缺少 deterministic hash 输入算法，无法保证不同实现与 fixture 的一致性。

**建议动作**
- 先补充 canonical package hash algorithm，再进入 Story 3.3 开发。

### Story 3.4: Runtime Path, Menu Target, Legacy Entry And Artifact Path Validation

**结论：有条件通过**

**优点**
- runtime/menu/legacy/artifact 四类 validation 的 issue ids、details shape、local-only/no-write boundary 和 redaction 要求比较完整。
- 对 legacy residue 采用 overlap-based 检查，避免全项目任意扫描导致误报。

**关键问题**
1. **artifact-path 的 fixture write probe 与 validate 只读边界存在歧义** - AC/Task 文字可能诱导 production validate 执行写探测。

**建议动作**
- 在 Story 3.4 中把 fixture write probe 明确限定为 test-only，或替换为只读可判定机制。

### Story 3.5: CommandResult And ValidationIssue JSON Contract

**结论：通过**

**优点**
- 统一 `CommandResult` envelope、`ValidationIssue` model、status/exit-code derivation、command id、targetProject、path policy、ordering 和 renderer profiles，和 `01-command-result-json-contract.md` 基本一致。
- 明确 `speclite resolve` 是例外，不包裹 `CommandResult`，避免破坏 runtime support command contract。

**关注点**
- Story 覆盖 `update` / `update.repair` public JSON contract，虽然实现能力属于 Epic 4，但 owning SPEC 已把这些 covered commands 纳入同一 envelope；当前作为 contract anchor 可接受。

### Story 3.6: Validation Progress, Category Coverage And Local Determinism

**结论：硬阻塞**

**优点**
- 对 canonical category order、severity order、target order、path sorting、issue sorting、terminal fallback、empty state 和 JSON presentation-free boundary 的要求完整。
- 明确不重复实现 Story 3.2-3.5 的领域规则，只统一 aggregation / projection / renderer 口径。

**关键问题**
1. **source-integrity 的 Epic 3 归属不清** - Story 3.6 同时引用 `source-integrity` category 和本地 source descriptor/evidence validation，但没有给出该 rule 的实现边界、fixtures 和与 Epic 5 的交接策略。

**建议动作**
- 在 Story 3.6 进入开发前裁决 `source-integrity` 是 Epic 3 的最小本地 rule，还是 Epic 5 引入后由 Story 3.6 的 ordering helpers 消费。

## 通过项

- Epic 3 的 6 个 Story 均包含 Story、Acceptance Criteria、Tasks / Subtasks、Dev Notes、References 和 Dev Agent Record 基本结构。
- `status` 与 `validate` 的职责分离整体清晰：`status` 只做 lightweight summary；详细 diagnostics、issue counts、category coverage 和 deterministic validation 留给 `validate`。
- Issue category、issue id、severity、path policy、target order 和 output profiles 大多能追溯到 owning SPEC，而不是在 Story 中孤立发明。
- 各 Story 普遍记录当前仓库尚无 root implementation scaffold，并要求实现前重新检查实际代码，避免用 Story context 伪装代码完成状态。
- 已知既有问题，非本次 Story 引入：SR skill 配置期望 Story 位于 `_bmad-output/implementation-artifacts/stories/`，但当前仓库实际位于 `_bmad-output/implementation-artifacts/` 根目录。本轮按真实路径审查并记录，不作为 Epic 3 Story 设计阻塞项。

## 结论

- **结论**：不通过
- **阻塞项**：Story 3.3 的 canonical package hash algorithm 决策缺失；Story 3.6 的 `source-integrity` category ownership 决策缺失。
- **建议**：先修订上述两个 decision_needed 项；同步修正 Story 3.4 的 `fixture write probe` 只读边界措辞后，再进入 SR evaluator / fixer 流程。
