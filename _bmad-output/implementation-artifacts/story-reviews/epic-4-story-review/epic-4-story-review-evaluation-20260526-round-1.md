---
Epic: 4
Scope: epic
Round: 1
Date: 2026-05-26
Model Used: GPT-5.5 (gpt-5.5)
Review Source: epic-4-story-review-summary-20260526-round-1.md
Review Model: GPT-5.5 (gpt-5.5)
Type: Story Review Evaluation
---

## 评估总结

本次评估对象为 Epic 4 首轮 Story Review Summary。审查发现共 2 条，均带有 `consistency+contract` 来源和 `patch` 分类；逐条核对 Epic、Story 与 owning SPEC 后，2 条均确认有效，且都属于进入对应 Story 开发前应修订的契约一致性问题。

未发现需要忽略的误报。Finding 2 的问题描述中关于 human-owned / workflow-owned 可能进入 `RepairPlan.actions[]` 的表述偏宽，因为 Story 4.6 已有排除语句；但 `skip` action 的 `expectedHash` 要求和 protected projection 的非 plan 边界仍未完全写清，因此结论仍为有效。

## 发现 #1 评估

### 审查原文

> **[中] Operation lock acquisition 时序在 Story 4.3 / 4.6 与 canonical contract 不一致**
> - 来源：consistency+contract
> - 分类：patch
> - 涉及 Story：4-3, 4-6
> - 证据 - Story 4.3 Task 2 将顺序写成 `generate update plan -> render unapplied plan or request confirmation -> acquire lock/apply only after authorization`（`4-3-update-plan-before-write.md` 第 77-82 行）。Story 4.6 Task 5 又写成 apply 阶段先获取 lock（`4-6-explicit-repair-for-recoverable-installer-owned-drift.md` 第 96-102 行）。但 `03-install-plan-contract.md` 明确要求 install/update/repair 在 planning 可以写入或应用变更之前获取 project-level operation lock，且 lock 竞争失败时由于 safe planning 尚未开始，public JSON 不得包含 update/repair plan、changed/skipped/conflicts（第 122-130 行）。Story 4.4 与该 contract 一致，要求 lock acquisition failure 发生在任何 write、safe planning 或 apply side effect 之前（`4-4-project-operation-lock-and-safe-write.md` 第 79-85 行）。
> - 影响 - Dev agent 可能按 Story 4.3 / 4.6 把 update/repair planning 放在 lock acquisition 之前，导致 lock contention output、plan payload presence、side-effect boundary 与 owning SPEC / Story 4.4 冲突。
> - 建议 - 修订 Story 4.3 Task 2 和 Story 4.6 Task 5：明确 command mode normalization / read-only preflight 可先执行，但任何 safe planning、plan payload construction that can lead to writes、source/package mutation、manifest/index/mirror mutation 和 apply 前必须先 acquire `_speclite/.lock`；lock contention failure 不输出 `updatePlan` / `repairPlan` / `changedPaths` / `skippedPaths` / `conflicts`。

### 评估结论：✅ 确认有效 — 需要修订（P1 优先级）

### 评估分析

**问题描述准确性**：准确 — Story 4.3 的 orchestration 顺序确实把 `generate update plan` 和 render/confirmation 放在 lock acquisition 前；Story 4.6 Task 5 也把 lock 写成 apply 阶段动作。  
**严重性判断**：合理 — 该问题会影响 lock contention 时的 public JSON 边界，以及 safe planning 是否已经开始，属于跨 Story 与 owning SPEC 的行为契约冲突。  
**修订建议**：可行 — 建议保留 read-only preflight 在 lock 前执行，同时把 safe planning、可导致写入的 plan payload construction、mutation 与 apply 统一放到 lock 成功后，能同时兼容 Story 4.3、4.4、4.6。  
**误报评估**：非误报 — `03-install-plan-contract.md` 与 Story 4.4 均要求 lock acquisition failure 发生在 safe planning 和 apply side effect 之前，审查发现与证据一致。

## 发现 #2 评估

### 审查原文

> **[中] Story 4.6 对 `RepairPlan` skip/protected projection 的要求未完全贴合 schema**
> - 来源：consistency+contract
> - 分类：patch
> - 涉及 Story：4-6
> - 证据 - `01-command-result-json-contract.md` 定义 `RepairPlan.actions[]` 的 `ownership` 只能是 `installer-owned`，且每个 action 都 required `expectedHash`，action 可为 `restore-canonical`、`regenerate` 或 `skip`（第 474-484 行）；同一 SPEC 还强调每个 repair action 都 required `RepairPlan.actions[].expectedHash`（第 508-514 行）。Story 4.6 Task 3 / CommandResult Requirements 只明确 `restore-canonical` / `regenerate` 必须有 `expectedHash`（`4-6...md` 第 80-84 行、第 210-213 行），同时 Repair Eligibility Matrix 将 human-owned / workflow-owned 记录为 “conflict or protected skip projection”（第 193-206 行）。
> - 影响 - Dev agent 可能生成 human-owned / workflow-owned 的 `RepairPlan.actions[]` skip，或对 installer-owned `skip` action 省略 `expectedHash`，从而违反 `RepairPlan` executable schema、fixture expectations 和 parser contract。
> - 建议 - 修订 Story 4.6：明确 `RepairPlan.actions[]` 只允许 installer-owned entries；installer-owned `skip` 也必须携带 `expectedHash` 和 `reason: "unchanged"` 或其他 registry reason；human-owned、workflow-owned、unknown ownership、missing source evidence 和 unsupported repair 只能进入 `data.conflicts[]` 或非 plan 的 protected boundary display，不得进入 `RepairPlan.actions[]`。

### 评估结论：✅ 确认有效 — 需要修订（P1 优先级）

### 评估分析

**问题描述准确性**：基本准确 — Story 4.6 已在 Task 3 和 CommandResult Requirements 中写明 `RepairPlan.actions[]` 只允许 installer-owned entries，因此“可能生成 human-owned / workflow-owned actions”的风险被部分缓解；但 Repair Eligibility Matrix 的 “protected skip projection” 没有明确限定为非 plan display，且 `skip` action 的 `expectedHash` 要求确实遗漏。  
**严重性判断**：合理 — `RepairPlan` 是 public JSON / fixture / parser contract 的核心模型，`expectedHash` 是否 required 以及 protected entries 是否进入 plan 会直接影响 schema 合法性和可测试性。  
**修订建议**：可行 — 在 Story 4.6 中补充 `RepairPlan.actions[]` 的 skip 也必须携带 `expectedHash`，并明确 protected skip projection 只能用于 human-readable protected boundary display 或 `data.conflicts[]` 语义，不属于 executable repair plan。  
**误报评估**：非误报 — 虽然审查原文对 human/workflow-owned 进入 actions 的风险表述偏宽，但核心 schema 对齐问题成立，需要修订。

## 整体评估结论

### 需要修订（阻塞进入开发）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|------------|------|
| 1 | Operation lock acquisition 时序不一致 | [中] | P1 | lock 与 safe planning 边界冲突 |
| 2 | `RepairPlan` skip/protected projection 未贴合 schema | [中] | P1 | schema required 字段不完整 |

### 建议纳入后续改善跟踪（非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|------------|------|
| - | - | - | - | 无 |

### 可忽略（误报）

| # | 发现 | 原始严重性 | 忽略理由 |
|---|------|----------|---------|
| - | - | - | 无误报 |

### 评估决定

**整体结论**：需修订后再审

建议先按 Finding 1 修订 Story 4.3 / 4.6 的 lock-before-safe-planning 表述，再按 Finding 2 修订 Story 4.6 的 `RepairPlan.actions[]` skip schema 与 protected projection 边界；修订完成后再进入下一轮 SR 复审。

## 修订执行记录

### 修订执行记录
- **Date**: 2026-05-26
- **Model Used**: GPT-5.5 (gpt-5.5)
- **Fix Items**: 2
- **执行决策**: 按本轮用户要求采用推荐决策直接执行，不在 Step 2 停等确认。推荐决策为：command mode normalization 和 read-only preflight 可以在 lock 前执行；safe planning、可写 plan payload construction、source/package mutation、manifest/index/mirror mutation、plan rendering / confirmation 和 authorized apply 必须处于 project operation lock 成功后的边界内。该决策与 `_bmad-output/planning-artifacts/specs/03-install-plan-contract.md` 的 lock-before-safe-planning contract、Story 4.4 的 lock failure projection boundary、以及 `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md` 的 `RepairPlan` schema 保持一致。

#### 修订项 #1: Operation lock acquisition 时序在 Story 4.3 / 4.6 与 canonical contract 不一致
- **文件**: `_bmad-output/implementation-artifacts/4-3-update-plan-before-write.md`; `_bmad-output/implementation-artifacts/4-6-explicit-repair-for-recoverable-installer-owned-drift.md`
- **章节**: Story 4.3 `Tasks / Subtasks（任务 / 子任务）` / Task 2; Story 4.6 `Tasks / Subtasks（任务 / 子任务）` / Task 2 与 Task 5
- **修改摘要**: 将原先 `generate update plan -> render unapplied plan or request confirmation -> acquire lock/apply only after authorization` 和 apply 阶段才获取 repair lock 的表述，修订为 lock 前仅允许 command mode normalization 与 read-only preflight；project operation lock 获取成功后才允许 safe update/repair planning、`UpdatePlan` / `RepairPlan` construction、unapplied plan rendering / confirmation 和 authorized apply。同步明确 lock acquisition 前失败不得输出 plan、changed/skipped/conflicts payload 假装 safe planning 已完成。
- **状态**: 已完成

#### 修订项 #2: Story 4.6 的 `RepairPlan` skip/protected projection 与 schema 边界未完全贴合
- **文件**: `_bmad-output/implementation-artifacts/4-6-explicit-repair-for-recoverable-installer-owned-drift.md`
- **章节**: `Tasks / Subtasks（任务 / 子任务）` / Task 3; `Repair Eligibility Matrix（Repair 资格矩阵）`; `CommandResult Requirements（CommandResult 要求）`
- **修改摘要**: 明确 `RepairPlan.actions[]` 只能包含 installer-owned entries，且 `restore-canonical`、`regenerate` 和 installer-owned `skip` 都必须携带 required `expectedHash`；installer-owned `skip` 仅用于 planned no-op，例如 `reason: "unchanged"`。将 human-owned、workflow-owned 和 path-level authorization protection 的 “protected skip projection” 收口为 non-plan protected boundary display 或 `data.conflicts[]` 语义，明确不得进入 executable `RepairPlan.actions[]`。
- **状态**: 已完成
