---
Epic: 4
Scope: epic
Round: 1
Date: 2026-05-26
Model Used: GPT-5.5 (gpt-5.5)
Type: Story Review Summary
Stories Reviewed: 6
---

## Review Conclusion（审查结论）

首轮审查。共审查 Epic 4 下 6 个 Story。审查层状态：3/3 层完成（structure、consistency、contract 均已覆盖；本轮按 skill review-engine 的串行模式完成三层分析，未记录失败层）。

- 通过：4 个
- 有条件通过：2 个
- 硬阻塞：0 个

总体判断：Epic 4 Story 组覆盖 ownership、resolver、plan-before-write、operation lock/safe write、conflict detection 和 explicit repair 的主链路，整体具备进入实现的基础。但 Story 4.3 与 Story 4.6 对 operation lock acquisition 时序存在跨文档不一致，Story 4.6 对 `RepairPlan` skip/protected projection 的表述也需要与 owning SPEC 收齐。结论为有条件通过；修订下列 `patch` 问题后再进入对应 Story 开发更稳妥。

## Review Scope（审查范围）

- Story 文件：
  - `_bmad-output/implementation-artifacts/4-1-ownership-model-and-protected-file-boundaries.md`
  - `_bmad-output/implementation-artifacts/4-2-config-and-customization-merge-order-for-updates.md`
  - `_bmad-output/implementation-artifacts/4-3-update-plan-before-write.md`
  - `_bmad-output/implementation-artifacts/4-4-project-operation-lock-and-safe-write.md`
  - `_bmad-output/implementation-artifacts/4-5-conflict-detection-and-default-non-overwrite-behavior.md`
  - `_bmad-output/implementation-artifacts/4-6-explicit-repair-for-recoverable-installer-owned-drift.md`
- 路径偏差记录：
  - skill config 默认 Story 目录为 `_bmad-output/implementation-artifacts/stories/`。
  - 本仓库 Epic 4 Story 实际位于 `_bmad-output/implementation-artifacts/` 根目录，文件名以 `4-` 开头；本轮按真实文件路径审查。
- 分批记录：
  - Batch 1：Story 4.1 至 Story 4.5。
  - Batch 2：Story 4.6。
- 对照基准：
  - `_bmad-output/project-context.md`
  - `_bmad-output/planning-artifacts/epics/07-epic-4-safe-update-and-repair安全更新与修复.md`
  - `_bmad-output/planning-artifacts/architecture/03-core-architectural-decisions核心架构决策.md`
  - `_bmad-output/planning-artifacts/architecture/04-implementation-patterns-consistency-rules实现模式与一致性规则.md`
  - `_bmad-output/planning-artifacts/architecture/05-project-structure-boundaries项目结构与边界.md`
  - `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md`
  - `_bmad-output/planning-artifacts/specs/03-install-plan-contract.md`
  - `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md`
  - `_bmad-output/planning-artifacts/specs/06-resolve-command-contract.md`
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
  - Operation lock、safe write、repair plan、conflict projection 与 fixture stability

## New Findings（新发现）

### 1. [中] Operation lock acquisition 时序在 Story 4.3 / 4.6 与 canonical contract 不一致

- **来源**：consistency+contract
- **分类**：patch
- **涉及 Story**：4-3, 4-6
- **证据** - Story 4.3 Task 2 将顺序写成 `generate update plan -> render unapplied plan or request confirmation -> acquire lock/apply only after authorization`（`4-3-update-plan-before-write.md` 第 77-82 行）。Story 4.6 Task 5 又写成 apply 阶段先获取 lock（`4-6-explicit-repair-for-recoverable-installer-owned-drift.md` 第 96-102 行）。但 `03-install-plan-contract.md` 明确要求 install/update/repair 在 planning 可以写入或应用变更之前获取 project-level operation lock，且 lock 竞争失败时由于 safe planning 尚未开始，public JSON 不得包含 update/repair plan、changed/skipped/conflicts（第 122-130 行）。Story 4.4 与该 contract 一致，要求 lock acquisition failure 发生在任何 write、safe planning 或 apply side effect 之前（`4-4-project-operation-lock-and-safe-write.md` 第 79-85 行）。
- **影响** - Dev agent 可能按 Story 4.3 / 4.6 把 update/repair planning 放在 lock acquisition 之前，导致 lock contention output、plan payload presence、side-effect boundary 与 owning SPEC / Story 4.4 冲突。
- **建议** - 修订 Story 4.3 Task 2 和 Story 4.6 Task 5：明确 command mode normalization / read-only preflight 可先执行，但任何 safe planning、plan payload construction that can lead to writes、source/package mutation、manifest/index/mirror mutation 和 apply 前必须先 acquire `_speclite/.lock`；lock contention failure 不输出 `updatePlan` / `repairPlan` / `changedPaths` / `skippedPaths` / `conflicts`。

### 2. [中] Story 4.6 对 `RepairPlan` skip/protected projection 的要求未完全贴合 schema

- **来源**：consistency+contract
- **分类**：patch
- **涉及 Story**：4-6
- **证据** - `01-command-result-json-contract.md` 定义 `RepairPlan.actions[]` 的 `ownership` 只能是 `installer-owned`，且每个 action 都 required `expectedHash`，action 可为 `restore-canonical`、`regenerate` 或 `skip`（第 474-484 行）；同一 SPEC 还强调每个 repair action 都 required `RepairPlan.actions[].expectedHash`（第 508-514 行）。Story 4.6 Task 3 / CommandResult Requirements 只明确 `restore-canonical` / `regenerate` 必须有 `expectedHash`（`4-6...md` 第 80-84 行、第 210-213 行），同时 Repair Eligibility Matrix 将 human-owned / workflow-owned 记录为 “conflict or protected skip projection”（第 193-206 行）。
- **影响** - Dev agent 可能生成 human-owned / workflow-owned 的 `RepairPlan.actions[]` skip，或对 installer-owned `skip` action 省略 `expectedHash`，从而违反 `RepairPlan` executable schema、fixture expectations 和 parser contract。
- **建议** - 修订 Story 4.6：明确 `RepairPlan.actions[]` 只允许 installer-owned entries；installer-owned `skip` 也必须携带 `expectedHash` 和 `reason: "unchanged"` 或其他 registry reason；human-owned、workflow-owned、unknown ownership、missing source evidence 和 unsupported repair 只能进入 `data.conflicts[]` 或非 plan 的 protected boundary display，不得进入 `RepairPlan.actions[]`。

## Per-Story Review（逐篇审查结论）

### Story 4.1: Ownership Model And Protected File Boundaries（所有权模型与受保护文件边界）

**结论：通过**

**优点**
- AC、Tasks、Dev Notes 与 Epic ownership / protected boundary 目标一致。
- 明确把 resolver、plan、lock、conflict、repair 的完整职责留给后续 Story，边界清晰。

**关注点**
- 实现时需继续遵守“若前置 scaffold 不存在，先完成前置 anchors”的顺序，避免孤立 update-only scaffold。

### Story 4.2: Config And Customization Merge Order For Updates（更新中的配置与定制化合并顺序）

**结论：通过**

**优点**
- Config / customization merge order、human-owned TOML read-only、warning diagnostic 和 parity fixture 要求与 resolver SPEC 对齐。
- 对 Python parity、Node runtime 收口和 `src/config/` single implementation boundary 表述充分。

**关注点**
- `_bmad-output/project-context.md` 仍是 placeholder；Story 已正确要求以 live PRD / Architecture / ADR / owning SPEC 为准。

### Story 4.3: Update Plan Before Write（写入前更新计划）

**结论：有条件通过**

**关键问题**
1. **Operation lock acquisition 时序需修订** — Task 2 的 orchestration 顺序把 lock 放在 plan/render/confirmation 之后，与 `03-install-plan-contract.md` 和 Story 4.4 的 lock-before-safe-planning 语义冲突。

**建议动作**
- 按 Finding 1 修订 Story 4.3 Task 2，明确哪些 read-only preflight 可在 lock 前执行，哪些 safe planning / plan payload / mutation-adjacent steps 必须在 lock 后执行。

### Story 4.4: Project Operation Lock And Safe Write（项目操作锁与安全写入）

**结论：通过**

**优点**
- 与 `03-install-plan-contract.md` 对 lock file shape、non-reentrant rule、safe write、stale lock、volatile field exclusion 和 partial failure 的基线一致。
- 明确 `fs/` 是 operation lock、path normalization 和 safe write 的 owning module。

**关注点**
- 后续修订 Story 4.3 / 4.6 后，应以 Story 4.4 的 lock-before-safe-planning wording 作为相邻 Story 的共同表述。

### Story 4.5: Conflict Detection And Default Non-Overwrite Behavior（冲突检测与默认不覆盖行为）

**结论：通过**

**优点**
- Normal update conflict matrix、single `update.conflicts` issue、reason code registry、deterministic ordering 和 protected boundary UX 与 `01-command-result-json-contract.md` 对齐。
- 明确普通 `update` 不把 confirmation 或 `--yes` 转成 repair 授权。

**关注点**
- 实现时需确保 unknown ownership 进入 `data.conflicts[]`，不要塞入不支持 `unknown` ownership 的 `UpdatePlan.actions[]` schema。

### Story 4.6: Explicit Repair For Recoverable Installer-Owned Drift（可恢复 Installer-Owned Drift 的显式修复）

**结论：有条件通过**

**关键问题**
1. **Operation lock acquisition 时序需修订** — Task 5 把 lock 获取描述为 apply 阶段动作，与 canonical lock-before-safe-planning contract 不一致。
2. **`RepairPlan` skip/protected projection 需修订** — 当前文本可能允许 human/workflow-owned protected skip projection 进入 `RepairPlan.actions[]`，并可能遗漏 installer-owned skip 的 `expectedHash` 要求。

**建议动作**
- 按 Finding 1 和 Finding 2 修订 Story 4.6 Task 3、Task 5、Repair Eligibility Matrix 和 CommandResult Requirements。

## Passed Checks（通过项）

- Epic 4 Story 文件齐全：4-1 至 4-6 均存在，且与 Epic 4 中列出的 Story 顺序一致。
- Story 结构基本完整：每篇均包含 Story、Acceptance Criteria、Tasks / Subtasks、Dev Notes、References 和 Dev Agent Record。
- AC 大多采用前提 / 当 / 则 / 并且格式，具备可测试性。
- Story 4.1 至 4.6 的职责链路整体连续：ownership -> resolver -> plan -> lock/safe write -> conflict -> repair。
- `project-context.md` 的 placeholder 状态已在 Story Dev Notes 中被显式标注，Story 未把它误当成完整实现规则来源。
- 本轮未发现 `decision_needed` 桶问题。
- 本轮未记录 `defer` 桶问题。
