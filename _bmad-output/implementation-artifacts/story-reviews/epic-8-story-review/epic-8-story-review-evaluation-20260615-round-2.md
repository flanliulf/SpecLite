---
Epic: 8
Scope: epic
Round: 2
Date: 2026-06-15
Model Used: GPT-5 Codex (gpt-5-codex)
Review Source: epic-8-story-review-summary-20260615-round-2.md
Review Model: GPT-5 Codex (gpt-5-codex)
Type: Story Review Evaluation
---

## 评估总结

本次评估对象为 Epic 8 Story Review Round 2 summary。Round 2 reviewer 对 Round 1 Finding 1-3 的已修复判断成立：Story 8.5 已把默认 `resolve` machine contract 与显式 `--human` human-readable mode 分离；Story 8.3 已补齐 `partial-or-failed` 的 AC、renderer 与测试口径；Story 8.4 已补齐 `status.data.highLevelHealth` 到 human outcome 的 deterministic mapping，并限制 `stale` / `unknown` 为 human-derived label。

Round 2 reviewer 将 Finding 4 维持为 P2 非阻塞改善项是合理的。Story 8.1 与 Story 8.6 仍存在 message catalog / Next Actions ownership 需要实现阶段对齐的成本，但现有 Dependency Gate、Scope Boundary 和 Equivalent Implementation Policy 已足以防止它阻塞 Epic 8 进入开发。本轮未发现仍需修订的阻塞项，未发现误报；整体结论为：可直接进入开发。

## 上轮问题回顾确认

### Round 1 / Finding 1：已确认修复

Round 2 reviewer 的判断成立。Story 8.5 新增 `Resolve Output Mode Decision`，明确默认 `speclite resolve config` 和 `speclite resolve customization` 继续保持 pure JSON stdout，默认 missing key 仍为 stdout `{}`、exit code 0、stderr empty；human-readable support 必须通过显式 `--human` opt-in 触发，且 `unresolved` 只适用于 explicit human mode。Task 1、Task 3、Task 4 也同步要求保护默认 JSON mode、补充 SPEC / commander / docs / tests / fixtures 记录与覆盖。

结论：原 P0/P1 级 contract 冲突已消除，不再阻塞进入开发。后续开发仍必须按 Story 8.5 要求同步更新 `06-resolve-command-contract.md`、CLI registration、docs、tests 和 fixtures，不能在未同步契约的情况下暴露 `--human`。

### Round 1 / Finding 2：已确认修复

Round 2 reviewer 的判断成立。Story 8.3 AC6 已将 `partial-or-failed` 提升为独立验收标准，覆盖 apply、safe-write、operation-lock 和 partial execution failure 阻止完整完成的场景，并明确 Summary、Evidence、Issues、Next Actions 必须分别说明未完整完成、已完成写入、失败步骤或 blocker、未执行项、受保护边界和恢复/验证动作。Tasks 1、2、4 也同步覆盖 outcome 推导、renderer 展示和 focused tests。

结论：原 AC 可测性缺口已补齐，不再阻塞进入开发。

### Round 1 / Finding 3：已确认修复

Round 2 reviewer 的判断成立。Story 8.4 AC1 已新增 deterministic mapping table：`configured -> installed`、`not-configured -> not-installed`、`partial -> partial`、`failed -> failed`；同时明确 `stale` 和 `unknown` 只能是 human-derived label，证据必须来自 manifest、source descriptor、version/evidence insufficiency 或 installed-state summary 不足，且不得新增 public JSON enum，除非先更新 `01-command-result-json-contract.md`。Tasks 1 和 4 同步要求实现与测试证明 `stale` / `unknown` 不会作为新的 public JSON enum 输出。

结论：原 JSON contract 与 human label 映射不确定性已消除，不再阻塞进入开发。

### 历史非阻塞待办

Round 1 / Finding 4 仍为有效的 P2 非阻塞改善项。Story 8.1 定义 shared output frame、outcome vocabulary、catalog fallback、empty state 和 renderer primitive；Story 8.6 定义 command-specific catalog、Next Actions builder、locale propagation 和跨命令去重要求。两者边界仍可在实现记录或 PR 中更明确地标注 key ownership 与 registry 扩展策略，但现有文档已要求 Story 8.6 消费 Story 8.1 的 shared frame，避免重复定义同一文案 key，并拒绝散落在 command renderer 中的硬编码中文/英文混排。

结论：维持 P2 非阻塞，建议进入开发后在 Story 8.1 / 8.6 的 implementation notes 或 PR description 中显式记录 ownership 决策。

## 发现 #1 评估

### 审查原文

> **Round 1 / Finding 1 — Story 8.5 的 unresolved human outcome 与 resolve 默认 missing-key / pure JSON 契约存在未决冲突**
> - 修复位置和方式：Story 8.5 新增 `Resolve Output Mode Decision`，明确默认 `speclite resolve config` 和 `speclite resolve customization` 继续保持 machine contract：stdout 只输出 resolved JSON object，stderr 只输出 JSON Lines diagnostics，不混入 human-readable prose；默认 missing key 继续为 stdout `{}`、exit code 0、stderr empty；human-readable resolve support 必须通过显式 `--human` opt-in 触发；`unresolved` 只适用于显式 human mode。
> - 验证结果：已消除默认 resolve pure JSON / missing-key contract 与 explicit human mode 的设计冲突。Story 8.5 还要求 Dev 阶段把 `--human` 同步记录到 `06-resolve-command-contract.md`、commander registration、docs、tests 和 fixtures，且明确未传入 `--human` 时 automation contract 不变。

### 评估结论：✅ 确认有效 — 已修复（原 P0，当前不阻塞）

### 评估分析

**问题描述准确性**：准确 — Round 2 summary 对修复内容的概括与 Story 8.5 当前 AC、`Resolve Output Mode Decision`、Tasks、Dependency Gate 和 Equivalent Implementation Policy 一致。
**严重性判断**：合理 — Round 1 将其作为进入开发前必须修订的核心 contract 问题是合理的；Round 2 确认修复后不再阻塞，也合理。
**修订建议**：可行 — 已采用保守裁决：default JSON mode 不变，human-readable resolve 通过 explicit `--human` 暴露，并要求 SPEC、registration、docs、tests、fixtures 同步。
**误报评估**：非误报 — 原问题确实存在，且当前 Story 已通过明确设计裁决消除冲突。

## 发现 #2 评估

### 审查原文

> **Round 1 / Finding 2 — Story 8.3 缺少 `partial-or-failed` 的验收标准**
> - 修复位置和方式：Story 8.3 新增 AC6 `Partial or failed write shows partial-or-failed`，覆盖 update/repair 已进入、准备进入或部分完成写入阶段时，apply、safe-write、operation-lock 或 partial execution failure 阻止完整完成的场景；并要求 Summary、Evidence、Issues、Next Actions 分别说明未完整完成、已完成写入、失败步骤或 blocker、未执行项、受保护边界、恢复/验证动作。
> - 验证结果：已补齐 `partial-or-failed` AC 和验收口径；Task 1、Task 2、Task 4 同步覆盖 outcome 推导、renderer 展示和 focused tests。

### 评估结论：✅ 确认有效 — 已修复（原 P1，当前不阻塞）

### 评估分析

**问题描述准确性**：准确 — Round 2 summary 准确反映 Story 8.3 已新增 AC6，并把 failure path 的 Summary、Evidence、Issues 和 Next Actions 口径落到 AC 与 Tasks。
**严重性判断**：合理 — Round 1 的 AC 缺口曾阻塞进入开发；Round 2 确认补齐后，该问题已不再阻塞。
**修订建议**：可行 — 新增 AC 与 task coverage 足以让 dev 和后续 reviewer 验收 `partial-or-failed`。
**误报评估**：非误报 — 原问题是实际验收缺口，当前已完成文档修订。

## 发现 #3 评估

### 审查原文

> **Round 1 / Finding 3 — Story 8.4 的 status outcome 与 `highLevelHealth` contract 缺少确定性映射**
> - 修复位置和方式：Story 8.4 AC1 新增 deterministic mapping table：`configured -> installed`、`not-configured -> not-installed`、`partial -> partial`、`failed -> failed`；同时明确 `stale` 和 `unknown` 只能是 human-derived label，其证据必须来自 manifest、source descriptor、version/evidence insufficiency 或 installed-state summary 不足，且不得新增 public JSON enum，除非先更新 `01-command-result-json-contract.md`。
> - 验证结果：已补齐 `highLevelHealth` 到 human outcome 的 deterministic mapping，且未新增 public JSON enum。Task 1 和 Task 4 也要求实现与测试证明 `stale` / `unknown` 不会作为新的 public JSON enum 输出。

### 评估结论：✅ 确认有效 — 已修复（原 P1，当前不阻塞）

### 评估分析

**问题描述准确性**：准确 — Round 2 summary 准确反映 Story 8.4 当前 AC1 的 mapping table 与 `stale` / `unknown` 约束。
**严重性判断**：合理 — Round 1 的 mapping 缺口曾可能导致 public JSON enum 被误扩展；Round 2 确认 AC 与 tests 口径已补齐后，该问题不再阻塞。
**修订建议**：可行 — deterministic mapping 加 human-derived label 约束足以消除实现歧义。
**误报评估**：非误报 — 原问题成立，当前已完成文档修订。

## 发现 #4 评估

### 审查原文

> **Round 1 / Finding 4 — Story 8.1 与 Story 8.6 的 message catalog / Next Actions ownership 边界仍可更明确**
> - 维持既有评估结论：该问题有效，但属于 P2 非阻塞改善项。
> - Round 2 判断：Story 8.1 已声明 shared output frame、primitive、catalog fallback 和 empty-state 基础；Story 8.6 已声明 command-specific catalog、Next Actions builder、locale propagation 和去重要求。当前边界足以支撑 Epic 8 进入开发，但后续实现时仍建议在开发记录或实现 PR 中显式标注 key ownership 与 registry 扩展策略。

### 评估结论：⚠️ 有效但降级 — 建议纳入后续改善跟踪（P2）

### 评估分析

**问题描述准确性**：基本准确 — 8.1 与 8.6 均涉及 `src/cli/messages.ts`、catalog 和 Next Actions，ownership 仍有实现阶段协调成本；Round 2 对现状的描述与 Story 文档一致。
**严重性判断**：合理 — 该问题不影响 core contract、AC 可测性或进入开发的前置裁决，维持 P2 非阻塞是合理的。
**修订建议**：可行但非必要 — 可以在开发记录、PR description 或 implementation notes 中明确 shared key namespace、command-specific key ownership 和 registry 扩展策略；无需在进入开发前再次触发 fixer。
**误报评估**：非误报 — 潜在重叠真实存在，但已被 Dependency Gate 与 Equivalent Implementation Policy 控制在非阻塞范围。

## 整体评估结论

### 需要修订（阻塞进入开发）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|------------|------|
| - | - | - | - | 本轮无阻塞修订项 |

### 建议纳入后续改善跟踪（非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|------------|------|
| 4 | Story 8.1 / 8.6 catalog ownership 边界 | [低] | P2 | 开发中记录 key ownership |

### 可忽略（误报）

| # | 发现 | 原始严重性 | 忽略理由 |
|---|------|----------|---------|
| - | - | - | 本轮未发现误报 |

### 评估决定

**整体结论**：可直接进入开发

不需要执行 fixer。建议外层 strict-serial goal 进入 Epic 8 开发阶段；开发时继续跟踪 Finding 4，将 message catalog / Next Actions 的 shared registry、command-specific key ownership 和扩展策略记录在实现产物或 PR 说明中。
