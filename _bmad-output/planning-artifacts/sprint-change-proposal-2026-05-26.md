---
project: SpecLite
date: 2026-05-26
workflow: bmad-correct-course
changeScope: Minor
mode: Batch
trigger: implementation-readiness-report-2026-05-25
approval: user-requested-direct-adjustment
---

# Sprint Change Proposal（冲刺变更提案）

## Issue Summary（问题摘要）

2026-05-25 的 implementation readiness report 在 UX spec 补齐后需要重新对齐 Epics、Story AC 与 Architecture。当前变更修复 4 个实现就绪问题：

1. `epics/02-requirements-inventory需求清单.md` 仍保留“无独立 UX Design 文档”的过期说明。
2. UX spec 中的 CLI output、accessibility、terminal fallback、no-color/non-TTY/CI 要求未明确进入 Story AC。
3. traceability 计数混用 base numbering 与 explicit tracked entries，导致 FR/NFR 覆盖口径不一致。
4. Story 1.1 与 Story 6.3 密度较高，需要加入实现拆分提示，降低 implementation agent 一次性处理过多契约的风险。

## Impact Analysis（影响分析）

**PRD Impact（PRD 影响）：** 无 PRD scope change。MVP 边界、FR/NFR 本身和 Epic 1-6 的 MVP 范围保持不变；Epic 7 继续作为 Post-MVP backlog。

**UX Spec Impact（UX 规格影响）：** 无需修改 UX spec。本轮只把既有 UX spec 要求投射到 Epics、Story AC 与 Architecture。

**Epic / Story Impact（Epic / Story 影响）：** 需要修改 Epic requirements inventory、Story 1.1、Story 1.6、Story 3.5、Story 3.6、Story 4.3、Story 6.1、Story 6.3 和 Story 6.4 的说明或验收标准。

**Architecture Impact（架构影响）：** 需要同步需求计数口径，并在 core architecture 中明确 CLI output renderer profile、terminal fallback、`NO_COLOR`、non-TTY、CI 和 structured JSON 的边界。

**Sprint Tracking Impact（冲刺跟踪影响）：** 当前仍处 planning gate 阶段，不更新 `sprint-status.yaml`。

## Recommended Path Forward（推荐路径）

采用 Direct Adjustment（直接调整）。该变更属于 Minor change，不改变产品范围、实现顺序或 release gate，只补齐 planning artifact 之间的一致性。

不建议 rollback 或重新规划 MVP，因为 readiness gap 来自 UX spec 后置写入后的映射缺口，而不是产品方向变化。

## Detailed Change Proposals（详细变更提案）

**Requirements Inventory（需求清单）：**

- 增加 Traceability Count Convention，明确 FR1-FR78 / NFR1-NFR40 是 base numbering，explicit tracked entries 为 94 FR / 95 NFR。
- 将过期 UX section 替换为 UX-DR1 至 UX-DR11，并映射到 Story 1.6、3.5、3.6、4.3、6.1 和 6.4。

**Story AC Alignment（Story AC 对齐）：**

- Story 1.6 增加 ready summary evidence、key paths、NO_COLOR、non-TTY 和 CI 输出要求。
- Story 3.5 增加 Compact / Evidence / Structured profiles、shared semantic model 和 `--json` renderer 边界。
- Story 3.6 增加 terminal width fallback、text equivalents 和 explicit empty states。
- Story 4.3 增加 update plan Evidence profile、write authorization、protected boundaries 和 no-color/narrow terminal 可读性要求。
- Story 6.1 增加 human-readable expected outputs、renderer profiles、terminal fallback 和 stable comparison 约束。
- Story 6.4 增加 terminal width、NO_COLOR、non-TTY、CI、screen reader 和 copy-paste review fixture 要求。

**Implementation Tasking Guidance（实现拆分建议）：**

- Story 1.1 按 CLI scaffold、contract anchors/tests、runtime/platform guard、fixture expected output skeleton 拆分。
- Story 6.3 按 `ide-drift`、`source-integrity` sub-cases、`resolve-parity` fixture 分批实现，保持每个 sub-case 的 input、expected command JSON、expected issues 和 redaction assertions 独立。

**Architecture Alignment（架构对齐）：**

- `01-project-context-analysis` 和 `06-architecture-validation-results` 使用 94 FR / 95 NFR explicit tracked entry 口径。
- `03-core-architectural-decisions` 明确 `src/diagnostics/output.ts` 拥有 output profiles，并约束 human-readable 与 structured JSON renderer。

## Checklist Results（检查清单结果）

- [x] Trigger 已确认：readiness report 晚于 PRD / Architecture / Epics，但早于 UX spec 对齐。
- [x] Scope 已确认：不修改 PRD，不扩大 MVP，不更新 UX spec。
- [x] Artifact impact 已确认：只修改 Epics、Architecture 和本 sprint change proposal。
- [x] Risk 已确认：Low。变更补充验收口径，不改变实现范围。
- [x] Handoff 已确认：implementation agent 应按更新后的 Story AC 与 Architecture renderer boundary 执行。

## Implementation Handoff（实现交接）

后续 implementation story 创建与执行时，以更新后的 Epics/Story AC 为准。尤其需要确保 CLI output 不把 automation 字段只放在人类文案里，`--json` 与 file contracts 承载机器可读语义，human-readable output 在窄终端、无颜色、non-TTY 和 CI 环境下仍然可审查、可复制、可被 fixture 断言。
