---
Epic: 3
Scope: epic
Round: 1
Date: 2026-05-26
Model Used: GPT-5.5 (gpt-5.5)
Review Source: epic-3-story-review-summary-20260526-round-1.md
Review Model: GPT-5.5 (gpt-5.5)
Type: Story Review Evaluation
---

## 评估总结

本轮评估对象为 Epic 3 Story Review 首轮总结。逐条核验 reviewer 的 3 个新发现后，结论是 3 项均为有效发现，无误报；其中 Finding 1 与 Finding 2 属于需要人工裁决后修订的契约/范围问题，Finding 3 属于必须修正 Story 文案边界的 patch 问题。

整体评估决定为：需修订后再审。当前审查结论的严重性判断基本合理，建议先完成 Story 3.3、Story 3.6 的 decision_needed 裁决，并同步修订 Story 3.4 的 no-write / fixture harness 表述，再进入开发或下一轮 SR。

## 发现 #1 评估

### 审查原文

> **[高] canonicalPackageHash 的计算算法没有形成可执行契约**
> - 来源：consistency+contract
> - 分类：decision_needed
> - 涉及 Story：3-3
> - 证据 - `_bmad-output/implementation-artifacts/3-3-ide-mirror-and-file-integrity-validation.md` 的 Task 2 要求按 self-contained entry layout 计算 canonical package content，并列出 `SKILL.md`、`CHANGELOG.md`、`references/`、`assets/`、`scripts/`、`config.toml.example`、`customize.toml` 参与 hash；IDE Mirror Contract Notes 也只列出内容范围。`_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md` 仅说明 `canonicalPackageHash` 是 package-level equality，`_bmad-output/planning-artifacts/specs/05-ide-adapter-registry-contract.md` 仅说明 adapter artifacts 不得混入 canonical package hash。
> - 影响 - 不同实现可能对目录遍历顺序、relative path 拼接、空目录、symlink、file mode、换行、缺失 optional path 和 installed entry 与 source baseline 的比较方式作出不同选择，导致 `ide-mirror.hash-mismatch`、fixture snapshots 和 repair baseline 不稳定。
> - 建议 - 在 Story 3.3 或 owning SPEC 中先裁决 canonical package hash algorithm：输入文件 allowlist、排序、hash 输入格式、目录/空目录/symlink/权限处理、缺失 optional paths 处理、adapter artifact 排除规则，以及与 source package baseline / installed entry baseline 的关系；再让 Story 3.3 实现 `src/manifest/hash.ts`。

### 评估结论：✅ 确认有效 — 需要修订（P1 优先级）

### 评估分析

**问题描述准确性**：准确 — Story 3.3 明确要求计算 canonical package content，并列出参与路径与 adapter artifact 排除规则；owning SPEC 说明 `canonicalPackageHash` 是 package-level equality，但没有定义稳定输入序列、排序、目录/缺失 optional path/symlink/file mode 等算法细节。

**严重性判断**：合理 — 这是 deterministic validation 与 fixture expected output 的核心契约。如果算法未被裁决，不同实现会生成不同 package hash，直接影响 `ide-mirror.hash-mismatch`、跨 IDE target equality 和后续 repair baseline。

**修订建议**：可行 — reviewer 建议把 algorithm 放入 Story 3.3 或 owning SPEC 均可行；更稳妥的落点是 owning SPEC 定义规范，Story 3.3 引用并实现。

**误报评估**：非误报 — 已核验现有 Story/SPEC 确有内容范围与排除项，但缺少可执行算法定义。

## 发现 #2 评估

### 审查原文

> **[高] source-integrity 的 Epic 3 归属不清，Story 3.6 引用但未定义规则**
> - 来源：consistency+contract
> - 分类：decision_needed
> - 涉及 Story：3-6
> - 证据 - `_bmad-output/implementation-artifacts/3-6-validation-progress-category-coverage-and-local-determinism.md` 要求 canonical category order 包含 `source-integrity`，并在 local-only boundary 中说 MVP `source-integrity` validation 只检查本地记录的 source descriptor 与 integrity evidence shape；但同一 Story 的 scope 主要是 global progress/category coverage、ordering、determinism 和 renderer fallback，未给出 `source-integrity` rule 的 AC、issue details、fixtures 或与 Epic 5 source integrity stories 的交接边界。`_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md` 对 `source-integrity` 保留了完整 issue id baseline。
> - 影响 - Dev agent 可能在 Story 3.6 中实现一半 source-integrity 领域规则，越过 Epic 3 范围；也可能完全跳过该 category，导致 checkedCategories、progress skipped state 和 fixture coverage 没有统一口径。
> - 建议 - 先裁决二选一：要么把 Epic 3 的 Story 3.6 明确限定为只排序/展示已存在 categories，并把 `source-integrity` 标为未实现或由 Epic 5 引入；要么在 Epic 3 增补一个最小 local source descriptor/evidence validation Story，明确 AC、issue ids、details、fixtures 和与 Epic 5 远程/provenance 范围的边界。

### 评估结论：✅ 确认有效 — 需要修订（P1 优先级）

### 评估分析

**问题描述准确性**：准确 — Epic 3 和 taxonomy 都把 `source-integrity` 纳入 MVP category order / issue id baseline；Story 3.6 又声明 MVP 只检查本地 source descriptor 与 integrity evidence shape，但没有给出该 rule 的 AC、details shape、fixture 输入/期望输出，也没有明确哪些内容留给 Epic 5。

**严重性判断**：合理 — `checkedCategories` 只能由实际执行的 validation rules/category groups 产生。若 `source-integrity` 既被排序又缺少实现/跳过规则，会让 progress、category coverage 和 fixture determinism 失去统一口径。

**修订建议**：可行 — reviewer 提出的二选一裁决覆盖了两条可执行路径：Epic 3 只做排序/展示并显式 skipped，或补足最小本地 rule 的 AC/fixtures/boundary。

**误报评估**：非误报 — 该问题不是缺少 taxonomy id，而是 Story 3.6 的实现责任边界未闭合。

## 发现 #3 评估

### 审查原文

> **[高] artifact-path 的 fixture write probe 与 validate 只读边界存在歧义**
> - 来源：structure+contract
> - 分类：patch
> - 涉及 Story：3-4
> - 证据 - `_bmad-output/implementation-artifacts/3-4-runtime-path-menu-target-legacy-entry-and-artifact-path-validation.md` 的 AC 5 / Task 5 要求报告 `artifact-path.fixture-write-failed`，但同一 Story 的 local-only/no-write boundary 明确 `speclite validate` 不得 write、delete、chmod、normalize、format、repair、regenerate、migrate、copy、move 或 clean up project files。
> - 影响 - 如果实现者把 "fixture write probe" 理解为生产 `speclite validate` 的实际写探测，会违反只读验证边界并污染目标项目；如果它只是 fixture harness 中的测试动作，当前 Story 文案没有把它和 production validate 行为隔离清楚。
> - 建议 - 在 Story 3.4 中把 `fixture write probe` 改写为 fixture harness / test-only 行为，或改为只读权限/metadata 检查；同时在 AC、Task、issue mapping 和 tests 中明确 production `validate` 不执行实际写入探测。

### 评估结论：✅ 确认有效 — 需要修订（P1 优先级）

### 评估分析

**问题描述准确性**：准确 — Story 3.4 同时要求报告 `artifact-path.fixture-write-failed`，又反复声明 production `validate` 不得执行 write/chmod/copy/cleanup 等 mutation。当前文案没有把 fixture harness 行为与 production validate 行为隔离。

**严重性判断**：合理 — 虽然这是 patch 类文案修订，但 no-write boundary 是 validation 的安全边界。若实现者按字面执行写探测，会违反 Story 自身的只读要求。

**修订建议**：可行 — 将 write probe 明确限定为 test-only fixture harness，或替换为只读 metadata/permission 判定，都能消除歧义；同时需要同步 AC、Task、issue mapping 和 tests 的措辞。

**误报评估**：非误报 — 现有 Story 文案确实同时出现 fixture write probe 与 production no-write boundary，存在可被错误实现的空间。

## 整体评估结论

### 需要修订（阻塞进入开发）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|------------|------|
| 1 | canonicalPackageHash 的计算算法没有形成可执行契约 | [高] | P1 | 契约缺口会破坏确定性 |
| 2 | source-integrity 的 Epic 3 归属不清，Story 3.6 引用但未定义规则 | [高] | P1 | category coverage 责任未闭合 |
| 3 | artifact-path 的 fixture write probe 与 validate 只读边界存在歧义 | [高] | P1 | no-write 安全边界需明确 |

### 建议纳入后续改善跟踪（非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|------------|------|
| - | - | - | - | 无 |

### 可忽略（误报）

| # | 发现 | 原始严重性 | 忽略理由 |
|---|------|----------|---------|
| - | - | - | 无 |

### 评估决定

**整体结论**：需修订后再审

建议按 reviewer 原结论进入 SR fixer：先裁决 Story 3.3 的 canonical package hash algorithm 与 Story 3.6 的 `source-integrity` Epic 3/Epic 5 边界，再修订 Story 3.4 的 fixture write probe 表述。三项修订完成后再发起下一轮 SR review/evaluation。

## 修订执行记录

### 修订执行记录
- **Date**: 2026-05-26
- **Model Used**: GPT-5.5 (gpt-5.5)
- **Fix Items**: 3

#### 修订项 #1: canonicalPackageHash 的计算算法没有形成可执行契约
- **文件**: `_bmad-output/implementation-artifacts/3-3-ide-mirror-and-file-integrity-validation.md`
- **章节**: `Acceptance Criteria`、`Tasks / Subtasks`、`IDE Mirror Contract Notes`、`Testing Requirements`
- **修改摘要**: 将 Story 3.3 的 package hash 要求从“按 self-contained entry layout 计算”收敛为明确的 `Canonical Package Hash Algorithm Contract`；补充 candidate path allowlist、目录递归、optional path 缺失、空目录、symlink、排序、record framing、raw bytes、file mode/permission 排除、adapter artifact 排除，以及 installed manifest/index baseline 与 installed entry validate comparison 的关系。决策：在本次 Epic 3 修订范围内先把算法落入 Story 3.3，未扩大修改 owning SPEC。
- **状态**: 已完成

#### 修订项 #2: source-integrity 的 Epic 3 归属不清，Story 3.6 引用但未定义规则
- **文件**: `_bmad-output/implementation-artifacts/3-6-validation-progress-category-coverage-and-local-determinism.md`；`_bmad-output/planning-artifacts/epics/06-epic-3-installed-state-and-deterministic-validation已安装状态与确定性验证.md`
- **章节**: Story 3.6 `Acceptance Criteria`、`Tasks / Subtasks`、`Previous Story Intelligence`、`Scope Boundary`、`Validate Data Contract`；Epic 3 Story 3.6 验收标准
- **修改摘要**: 采用保守裁决：Epic 3 不新增 `source-integrity` domain validation rule；`source-integrity` 在 Story 3.6 中仅作为 canonical category order 的 reserved position。`checkedCategories` 只能包含实际执行的 category；若没有本地只读 `source-integrity` rule/category group，human-readable progress 必须显示 skipped / not checked。source descriptor / evidence shape、source lockfile lifecycle、remote freshness、provenance revalidation 和 distribution channel rules 明确归属 Epic 5。
- **状态**: 已完成

#### 修订项 #3: artifact-path 的 fixture write probe 与 validate 只读边界存在歧义
- **文件**: `_bmad-output/implementation-artifacts/3-4-runtime-path-menu-target-legacy-entry-and-artifact-path-validation.md`
- **章节**: `Acceptance Criteria`、`Tasks / Subtasks`、`Validation Issue Mapping`、`Local-Only / No-Write Boundary`、`Testing Requirements`
- **修改摘要**: 将 `artifact-path.fixture-write-failed` 明确限定为 fixture harness / test-only 行为，只能在受控临时 fixture project 中验证 expected artifact 写入失败；production `speclite validate` 只能通过只读 metadata / permission classification 报告 `artifact-path.unwritable-directory`，不得创建、touch、写入、chmod 或删除 probe file。
- **状态**: 已完成
