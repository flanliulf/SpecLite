---
workflow: bmad-correct-course
project: SpecLite
date: 2026-08-17
mode: batch
status: applying
changeId: CC-2026-08-17-architecture-root
iterationId: 1
changeRequest: architecture-artifact-canonical-root-unification
selectedApproach: direct-adjustment
decisionRoot: architecture
decisionTarget: "{solutioning_artifacts}/architecture/"
triggerEvidence:
  - implementation-readiness-report-2026-08-17-rerun.md
---

# Sprint Change Proposal（Sprint 变更提案）

## Executive Summary（执行摘要）

2026-08-17 rerun Implementation Readiness（IR）确认：PRD `FR23c`、Epic 11 / Story 11.5 将 Architecture whole/sharded artifacts 放在 `{planning_artifacts}/architecture/`，但 owning `SPEC 09` 与 Architecture 将 Architecture 定义为 Solutioning artifact。两个互斥 producer roots 会迫使实现者猜测，Epic 11 因此处于 `NOT READY`。

本提案采用 Direct Adjustment（直接调整），保留 `SPEC 09` 的阶段语义和 existing-install compatibility contract，明确 Architecture 的唯一 fresh-install canonical root 为 `{solutioning_artifacts}/architecture/`。随后按 Architecture → PRD → UX → Epics 的 owner/downstream 顺序同步 living artifacts；PRD 修改后重跑 `[VP]`，最后重跑 `[IR]`。本提案不授权实现代码、artifact migration 或 sprint tracking 更新。

## Issue Summary（问题摘要）

### Trigger（触发项）

- 触发门禁：`implementation-readiness-report-2026-08-17-rerun.md`。
- 触发范围：Epic 11，直接影响 Story 11.5，并级联影响 fresh directory creation、producer output、whole/sharded discovery、fixtures、coverage 与 traceability。
- 问题类型：规划契约误同步导致的 Architecture root 双真源，不是技术实现失败，也不要求改变 MVP 产品目标。

### Evidence（证据）

- `SPEC 09` 声明 `{planning_artifacts}` 承载 PRD、Epics、UX 与 planning status；`{solutioning_artifacts}` 承载 Architecture、Specs 与 implementation readiness。
- Architecture project structure 同样把 Architecture、Specs、IR 放在 `3-solutioning-artifacts/`。
- PRD `FR23c` 要求 `{planning_artifacts}` 预创建 `epics/`、`prd/`、`architecture/`。
- Story 11.5 要求 Architecture producer、shards 和 consumers 使用 `{planning_artifacts}/architecture/`。
- rerun IR 将该冲突判定为唯一 Critical，并给出总体 `NOT READY`。

## Change-Controlled Decision（受控变更决策）

### Decision（决策）

1. `SPEC 09` 继续作为 runtime artifact roots 的 field-level owning contract，不改变七类 roots 的 ownership 或 compatible-evolution 语义。
2. Architecture whole document、sharded `index.md` 与 shards 的 fresh-install canonical root 统一为 `{solutioning_artifacts}/architecture/`。
3. PRD 与 Epics whole/sharded artifacts 继续位于 `{planning_artifacts}/prd/` 与 `{planning_artifacts}/epics/`；UX 继续位于 `{planning_artifacts}/ux/`。
4. Existing install 的显式配置继续权威；缺少 `solutioning_artifacts` 时 fallback 到既有 `{planning_artifacts}`。该 fallback 是 `legacy-compatible`，不得被描述为 canonical root，也不得触发自动迁移。
5. 普通 install、update、repair 与 downstream discovery 不得移动、复制、重命名、删除或重写既有 Architecture artifacts。显式 artifact migration 仍为 Post-MVP 独立能力。

### Rationale（理由）

- Architecture 属于 solutioning phase；该决定与七阶段 topology、`SPEC 09`、Architecture、IR 现有路由一致。
- 保留 owning contract 可将变更限制为一次 downstream correction，避免反向改写 root 语义。
- legacy fallback 已为 existing installs 提供兼容路径，不需要通过把 Architecture 归回 Planning 来换取兼容性。
- 决策不改变 MVP goals、FR/NFR 总体范围、Epic 数量或已完成 Epic 的 identity。

### Alternatives Considered（备选方案评估）

| Option（方案） | Viability（可行性） | Effort（工作量） | Risk（风险） | Decision（结论） |
| --- | --- | --- | --- | --- |
| Direct Adjustment：统一到 `{solutioning_artifacts}/architecture/` | 可行 | Medium | Low | 采用 |
| Direct Adjustment：改写 `SPEC 09`，统一到 `{planning_artifacts}/architecture/` | 技术可行 | High | Medium | 不采用；破坏 phase ownership，并扩大 Architecture、IR、Specs 的连锁修改 |
| Rollback Epic 11 planning changes | 不可行 | High | High | 不采用；不能消除 owning-contract 冲突 |
| PRD MVP Review / scope reduction | 不需要 | Medium | Medium | 不采用；MVP 目标仍可实现 |

## Impact Analysis（影响分析）

### Epic And Story Impact（Epic 与 Story 影响）

- 不新增、不删除、不重排 Epic；Epic 1–10 的历史完成状态保持不变。
- 修改 Epic 11 / Story 11.5，使 PRD/Epics 与 Architecture 使用各自 phase-owned roots，并同步 AC、fixtures、consumer discovery、scope boundary 与 traceability。
- Story 11.1–11.10 的 strict-serial 顺序保持不变；本次 planning 修复不构成 Story implementation authorization。

### Artifact Impact（Artifact 影响）

- Architecture：明确 Architecture canonical subject directory；刷新 post-CU/CE validation state、`NFR40f` traceability、handoff；补充已存在 ecosystem topology 导航。
- PRD：修正 `FR23c`，从 Planning root 移除 Architecture，并增加 Solutioning Architecture directory 规则；保持需求 ID，必要时同步相关成功标准/范围表述。
- UX：同步 Architecture discovery/display 到 Solutioning root；保留 UX 自身 Planning root；将 CLI supplement 的固定 module count 改为动态或明确版本快照。
- Epics：同步 requirements inventory 中 materially stale 的 FR/NFR 文本；修正 Story 11.5 与 coverage/traceability；收口 `epics/index.md` lifecycle metadata。
- Specs：`SPEC 09` 不改变 root 决策，只补充或强化 `{solutioning_artifacts}/architecture/` subject-directory 与 whole/sharded discovery 投影（仅在现有文本不足以作为可执行 anchor 时）。

### Technical Impact（技术影响）

- 后续 Story 11.5 实现需同步 canonical skill producers/consumers、module metadata、directory declarations、config examples、fixtures 与 path consistency checks。
- 本轮只修改 planning artifacts；不修改 runtime code、canonical skill packages、fixture implementation 或 installed projection。

## Detailed Change Proposals（详细变更提案）

### Architecture And Owning Contract（Architecture 与 Owning Contract）

**Current（当前）：** `SPEC 09` 已定义 Architecture 属于 `{solutioning_artifacts}`，但没有消除 downstream 对 `{planning_artifacts}/architecture/` 的引用；Architecture validation 仍保留 pre-CU/CE gaps 和错误的 `NFR40f` 摘要。

**Proposed（拟议）：**

- 将 Architecture subject directory 明确为 `{solutioning_artifacts}/architecture/`，whole document 为 `{solutioning_artifacts}/architecture/architecture.md`，shards 与 `index.md` 保持在同一 subject directory。
- 保留 existing-install fallback / no-silent-migration 规则。
- 刷新 Architecture validation results：记录本 change decision、删除已完成的 UX/Epics downstream gaps、修正 `NFR40f` 映射、保留 `[VP]` / `[IR]` 尚待重跑的 gate 状态。
- 在长期目录导航中补充 `assets/source/speclite/ecosystems/<category>/<id>/`。

### PRD（产品需求文档）

**Current（当前 `FR23c`）：** `{planning_artifacts}` 必须预创建 `epics/`、`prd/` 和 `architecture/`。

**Proposed（拟议 `FR23c`，ID 保持不变）：** `{planning_artifacts}` 必须预创建 `epics/` 与 `prd/`；`{solutioning_artifacts}` 必须预创建 `architecture/`。PRD、Epics、Architecture 对应 workflows 的 whole documents 与 shards 必须在各自 phase-owned subject directory 内保持可发现、无 whole/sharded 双真源歧义；existing installs 遵守 `SPEC 09` fallback 与 no-migration contract。

### UX（用户体验）

**Current（当前）：** 主 UX 已区分 Planning 与 Solutioning spaces，但需确认 Architecture 的 discovery/evidence 展示不再继承 Planning root；CLI supplement 仍含 `core=13`、`sdlc=44` 固定数量示例。

**Proposed（拟议）：**

- Filesystem Space Map / Artifact Evidence Card 对 Architecture 显示 `Solutioning / {solutioning_artifacts}/architecture/`。
- PRD、Epics、UX 继续显示 Planning roots。
- 固定 module counts 改为由 selected modules/source inventory 推导的动态占位，或明确标注为不可用于 fixture/assertion 的历史版本快照。

### Epics And Traceability（Epic 与追踪）

**Current（当前 Story 11.5）：** PRD、Epics、Architecture 均进入 `{planning_artifacts}`，并要求预创建 `{planning_artifacts}/architecture/`。

**Proposed（拟议 Story 11.5）：**

- PRD / Epics 使用 `{planning_artifacts}/prd/`、`{planning_artifacts}/epics/`。
- Architecture 使用 `{solutioning_artifacts}/architecture/`。
- whole/sharded precedence、actual consumed path、legacy discovery、no-migration、fixtures 与 corpus negative checks 分别覆盖 Planning 和 Solutioning roots。
- 从 authoritative PRD 同步 requirements inventory 的 materially stale FR/NFR 文本；保持 106 FR IDs、现有 NFR IDs 与 Story identity。
- 将 `epics/index.md` 的 revision lifecycle metadata 收口为单一 current state，不改历史完成 Story 状态。

## Application Matrix（应用矩阵）

| Order（顺序） | Owner / Artifact | Planned Change（计划变更） | State（状态） | Verification（验证） |
| --- | --- | --- | --- | --- |
| 1 | Correct Course proposal | 记录 root decision、影响与批准边界 | approved | 用户已于 2026-08-17 明确批准 |
| 2 | Architecture / `SPEC 09` | 固化 Solutioning Architecture subject root，刷新 Architecture validation | applied | `git diff --check`、root assertions、stale-gap scan；project-wide verification 待 `[VP]` / `[IR]` |
| 3 | PRD | 修正 `FR23c` 及必要关联导航，不改 ID | pending | `[VP]` + FR/NFR identity/count checks |
| 4 | UX | 同步 Architecture discovery/evidence 与 fixed-count example | pending | UX ↔ PRD ↔ Architecture consistency scan |
| 5 | Epics | 同步 inventory、Story 11.5、traceability 与 index lifecycle metadata | pending | coverage、Story structure、frontmatter checks |
| 6 | `[IR]` | 使用更新后的 active artifacts 重新评估 | pending | 目标为无 Critical/Major 且总体 `READY` |

状态推进必须为 `draft -> approved -> applying -> applied -> verified`。`approved` 只授权 application，不表示 living artifacts 已更新；`applied` 也不表示 `[VP]` / `[IR]` 已通过。

## Implementation Handoff（实施交接）

### Scope Classification（范围分类）

Moderate（中等）：不改变产品方向或 MVP scope，但涉及 Architecture owner contract 与多个 planning artifacts 的受控同步，需要 Architect、PM、UX 与 Epic owner 按顺序应用。

### Responsibilities（职责）

- Architect：Architecture / `SPEC 09` 一致性和 Architecture validation evidence。
- Product Manager：PRD `FR23c` 与关联导航；触发 `[VP]`。
- UX Designer：Architecture root 的用户心智、discovery/evidence 与示例同步。
- Epic Owner：requirements inventory、Story 11.5、coverage/traceability、index lifecycle metadata。
- Readiness Validator：最后独立重跑 `[IR]`，不得读取 proposal status 代替 live artifact verification。

### Success Criteria（成功标准）

1. Active corpus 中 Architecture 的 fresh canonical producer/discovery root 只有 `{solutioning_artifacts}/architecture/`。
2. Existing-install fallback 与 no-migration 语义在 `SPEC 09`、Architecture、PRD、UX、Epics 中一致。
3. PRD 的 FR/NFR IDs 与数量无意外变化，`[VP]` 通过。
4. Requirements inventory 与 authoritative PRD 不存在 materially weaker text；Story 11.5 traceability 完整。
5. Architecture validation 不再包含 pre-CU/CE stale gaps，`NFR40f` 映射正确。
6. `epics/index.md` 只有一个 current lifecycle state。
7. 重跑 `[IR]` 得到 `READY`；若仍为 `NOT READY`，停止 implementation authorization 并保留新报告证据。

## Safety And Scope Boundaries（安全与范围边界）

- 不执行或暗示 Architecture artifact migration。
- 不修改 runtime code、canonical skill definitions、fixtures implementation 或 sprint tracker。
- 不重开 Epic 1–10，不改变其完成状态或 execution evidence。
- 不把本 proposal 的 `approved` / `applied` 状态当作 `[VP]` 或 `[IR]` 的验证结论。
- 保留工作树中用户已有、与本提案无关的修改。

## Checklist Status（检查清单状态）

- 1.1–1.3 Trigger/context/evidence：[x] Done
- 2.1–2.5 Epic impact：[x] Done
- 3.1–3.4 Artifact/technical impact：[x] Done
- 4.1 Direct Adjustment：[x] Viable；4.2 Rollback：[x] Not viable；4.3 MVP Review：[x] Not required；4.4 Recommendation：[x] Done
- 5.1–5.5 Proposal components / handoff：[x] Done
- 6.1–6.2 Review / accuracy：[x] Done
- 6.3 Explicit approval：[x] Done，用户于 2026-08-17 明确回复“批准”
- 6.4 Sprint status：[N/A] 本轮明确不修改
- 6.5 Handoff confirmation：[x] Done，按 Application Matrix 顺序执行

## Approval（批准）

- Decision approval: approved on 2026-08-17
- Application authorization: approved on 2026-08-17
- Application state: applying
