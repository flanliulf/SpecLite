---
Epic: 8
Scope: epic
Round: 1
Date: 2026-06-15
Model Used: GPT-5 (codex)
Review Source: epic-8-story-review-summary-20260615-round-1.md
Review Model: GPT-5 (codex)
Type: Story Review Evaluation
---

## 评估总结

本次评估对象为 Epic 8 首轮 Story Review summary。审查结果虽然是在 `Agent` 子代理工具不可用时按单一 LLM 回退生成，但 4 个 findings 均给出了明确 Story、契约来源、分类、证据和建议，问题描述整体可追溯、可执行，未发现误报。

评估结论为：Finding 1、Finding 2、Finding 3 需要在进入开发前修订，其中 Finding 1 属于核心 `resolve` public contract 冲突，应按 P0 处理；Finding 2 和 Finding 3 分别涉及 AC 可测性缺口与 public JSON / human outcome 映射不确定，应按 P1 处理。Finding 4 有效但可降级为非阻塞改善项，建议作为 P2 纳入后续 Story 文档修订或 implementation alignment 跟踪。

## 发现 #1 评估

### 审查原文

> **[高] Story 8.5 的 unresolved human outcome 与 resolve 默认 missing-key / pure JSON 契约存在未决冲突**
> - 来源：consistency+contract
> - 分类：decision_needed
> - 涉及 Story：8-5
> - 证据 - Story 8.5 AC3 要求 resolver 无法返回请求值时 outcome 为 `unresolved`，且 `Issues` 包含 `reason`、`missing key` 或 `failed layer`（`_bmad-output/implementation-artifacts/stories/8-5-resolve-command-support-output.md` 第 27-31 行）。同一 Story 的 Dependency Gate 承认现有 resolve contract 要求 stdout pure JSON、Epic 8 又要求 human-readable result，不能直接改默认 stdout（第 85-88 行）。而 canonical resolve contract 明确 stdout 只能包含 resolved JSON object，machine mode stderr 不能混入 human-readable prose（`_bmad-output/planning-artifacts/specs/06-resolve-command-contract.md` 第 30-39 行），并规定默认 missing key 行为是 stdout `{}`、exit code 0、stderr 为空（第 59-68 行）。Architecture 也把 `resolve` 定义为 runtime support command，stdout 必须只输出解析结果 JSON（`_bmad-output/planning-artifacts/architecture/03-core-architectural-decisions核心架构决策.md` 第 96-100 行）。
> - 影响 - 如果开发者按 AC3 直接把默认 missing key 渲染为 `unresolved` / `Issues`，会破坏 installed skills 依赖的 resolve automation contract；如果开发者选择新增 human mode，又缺少明确触发方式、flag 名称、strict missing-key 语义和 SPEC 更新范围，容易在实现时自行做设计决策。
> - 建议 - 在 Story 8.5 进入开发前先裁决并写入 Story：默认 `resolve config/customization` 继续 pure JSON；human-readable mode 通过哪个显式入口触发；`missing key` 在默认模式下是否仍保持 `{}` / exit 0；`unresolved` 只适用于 required layer failure、显式 strict/human mode，还是需要先变更 `06-resolve-command-contract.md`。

### 评估结论：✅ 确认有效 — 需要修订（P0 优先级）

### 评估分析

**问题描述准确性**：准确 — 审查指出的是 Story-level human outcome 与 canonical `resolve` stdout pure JSON / missing-key 行为之间的契约冲突，且证据同时覆盖 AC、Dependency Gate、SPEC 和 Architecture，属于多来源命中。
**严重性判断**：合理 — 该问题会影响 runtime support command 的 public automation contract；若未先裁决，开发者可能在实现阶段自行定义默认 stdout、stderr、exit code 或 human mode 入口。
**修订建议**：可行 — 建议不是直接改实现，而是先将默认模式、人类可读模式入口、missing-key 语义和 SPEC/schema/fixture 更新范围写清楚，符合 `decision_needed` 分类。
**误报评估**：非误报 — 被审查 summary 已说明 Story 8.5 自身承认冲突但未完成设计裁决，因此不是 reviewer 对需求的误读。

## 发现 #2 评估

### 审查原文

> **[中] Story 8.3 缺少 `partial-or-failed` 的验收标准**
> - 来源：structure+consistency
> - 分类：patch
> - 涉及 Story：8-3
> - 证据 - Epic 8 的 Update / Repair outcome taxonomy 包含 `partial-or-failed`，语义是写入或 repair 执行失败，需要人工处理（`_bmad-output/planning-artifacts/epics/11-epic-8-cli-outcome-oriented-human-output-systemcli-outcome-导向人类输出体系.md` 第 86-95 行）。Story 8.3 AC 当前只覆盖 `plan-ready`、`no-op`、`blocked-by-conflict`、`repair-plan-ready` 和 `applied`（`_bmad-output/implementation-artifacts/stories/8-3-update-and-repair-outcome-oriented-output.md` 第 15-45 行）。Task 2 要求 renderer 支持 `partial-or-failed`（第 54-57 行），Task 4 也提到 operation-lock failure 和 JSON stability（第 64-67 行），但 AC 没有定义该 outcome 的触发条件和可验收输出。
> - 影响 - 写入阶段失败、partial apply、operation-lock blocker、safe write failure 等失败路径可能只被 task/test 暗示，而没有 AC 级验收口径；后续实现与 reviewer 可能无法判断 Summary、Evidence、Issues 和 Next Actions 是否达标。
> - 建议 - 给 Story 8.3 增加独立 AC：当 update/repair 已进入或准备进入写入阶段但发生 apply/safe-write/operation-lock/partial failure 时，human output outcome 为 `partial-or-failed`，必须展示已完成写入、失败步骤或 blocker、未执行项、受保护边界和具体人工恢复/验证动作。

### 评估结论：✅ 确认有效 — 需要修订（P1 优先级）

### 评估分析

**问题描述准确性**：准确 — 审查发现的是 Epic outcome taxonomy 与 Story AC 覆盖之间的缺口；Task 层提到 renderer 和 failure，但 AC 缺少可验收触发条件与输出要求。
**严重性判断**：合理 — 该缺口不会直接破坏既有 public contract，但会让 failure path 无法按 AC 验收，属于阻塞进入开发的验收标准问题。
**修订建议**：可行 — 增加独立 AC 并写明 Summary、Evidence、Issues、Next Actions 的 failure-path 口径即可，不需要改变核心需求。
**误报评估**：非误报 — `partial-or-failed` 已由 Epic taxonomy 定义，Story 8.3 若只在 Tasks 暗示而未落到 AC，会造成实现和审查口径不稳定。

## 发现 #3 评估

### 审查原文

> **[中] Story 8.4 的 status outcome 与 `highLevelHealth` contract 缺少确定性映射**
> - 来源：consistency+contract
> - 分类：patch
> - 涉及 Story：8-4
> - 证据 - Story 8.4 AC1 要求 status outcome 来自 `installed`、`not-installed`、`stale`、`partial`、`failed` 或 `unknown`（`_bmad-output/implementation-artifacts/stories/8-4-status-and-validate-human-output-separation.md` 第 15-19 行）。CommandResult contract 当前只允许 `status.data.highLevelHealth` 为 `not-configured`、`configured`、`partial`、`failed`，并给出 deterministic aggregation order（`_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md` 第 184-204 行）。Story 8.4 Dependency Gate 虽说明若需要 `stale` 或 `unknown` 超出现有 values，应实现为 human-derived label 或先更新 SPEC（第 87-91 行），但 AC/Tasks 没有提供 mapping table。
> - 影响 - 开发者可能把 `stale` / `unknown` 当成新的 public JSON health value，或反过来把所有非 configured 状态粗略映射为失败；这会冲击 `status` lightweight、local-only 和“不自动创建 warning issues”的契约。
> - 建议 - 在 Story 8.4 增加确定性映射表，例如 `configured -> installed`、`not-configured -> not-installed`、`partial -> partial`、`failed -> failed`；同时明确 `stale` / `unknown` 的证据来源、是否仅为 human-derived label、是否需要更新 `01-command-result-json-contract.md` 或 validation taxonomy。

### 评估结论：✅ 确认有效 — 需要修订（P1 优先级）

### 评估分析

**问题描述准确性**：准确 — 审查聚焦 human output label 与 `CommandResult.status.data.highLevelHealth` allowed values 的映射边界，属于 contract-aware finding。
**严重性判断**：合理 — 若映射未定义，开发者可能扩展 public JSON health value 或错误聚合 status health，影响 `status` contract 和 fixture stability。
**修订建议**：可行 — 增加 deterministic mapping table，并明确 `stale` / `unknown` 是否为 human-derived label 或是否触发 SPEC 更新，能直接消除实现歧义。
**误报评估**：非误报 — summary 中已指出 Dependency Gate 承认边界，但 AC/Tasks 未完成可执行映射，问题成立。

## 发现 #4 评估

### 审查原文

> **[低] Story 8.1 与 Story 8.6 对 message catalog / Next Actions 的职责边界仍可能重叠**
> - 来源：structure+consistency
> - 分类：patch
> - 涉及 Story：8-1, 8-6
> - 证据 - Story 8.1 Task 3 要扩展 `src/cli/messages.ts`，至少支持 `zh-CN` 默认和 `en-US` fallback，并让 empty states 使用 catalog（`_bmad-output/implementation-artifacts/stories/8-1-shared-cli-outcome-and-presentation-contract.md` 第 51-55 行）；Task 4 又要求迁移 install/status/validate/update human renderers 到 shared primitive（第 56-59 行）。Story 8.6 Task 1/2 也要求为 install/update/status/validate/resolve 提供 `zh-CN` / `en-US` catalog、建立 Next Actions builder（`_bmad-output/implementation-artifacts/stories/8-6-localized-next-actions-and-message-catalog.md` 第 41-49 行），Dependency Gate 只说要避免重复定义同一文案 key（第 86-90 行）。
> - 影响 - 8.1 和 8.6 可能分别定义 command-specific catalog keys、Next Actions priority 或 empty-state 文案，造成后续迁移时重复 key、重复 builder 或 renderer 分叉。
> - 建议 - 在 Story 8.1 明确其 ownership 是 shared output frame、primitive、key namespace / fallback resolver 和最小 common empty-state；Story 8.6 ownership 是 command-specific catalog 填充、localized Next Actions builder、locale propagation 和跨命令去重。若 8.1 需要先实现最小 catalog，应要求 8.6 只扩展同一 registry。

### 评估结论：⚠️ 有效但降级 — 建议纳入后续改善跟踪（P2）

### 评估分析

**问题描述准确性**：基本准确 — 8.1 与 8.6 的 catalog / Next Actions ownership 确实存在潜在重叠，但 summary 中也说明 Dependency Gate 已有避免重复 key 的约束，因此风险更偏向实现协调与文档精炼。
**严重性判断**：偏高 — 原始严重性为低，本身已不构成硬阻塞；评估后确认其有效，但不应与 core contract 冲突或 AC 缺口同级阻塞。
**修订建议**：可行但非必要 — 增补 ownership 说明能降低重复实现风险；如果进入开发时按 8.1 shared primitive、8.6 command-specific expansion 的顺序执行，也可以在实现计划中控制。
**误报评估**：非误报 — 两个 Story 同时涉及 `messages.ts`、catalog 和 Next Actions builder，存在真实协调成本；只是建议降级为非阻塞 P2。

## 整体评估结论

### 需要修订（阻塞进入开发）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|------------|------|
| 1 | Story 8.5 unresolved 与 resolve contract 冲突 | [高] | P0 | 核心 public contract 未裁决 |
| 2 | Story 8.3 缺少 `partial-or-failed` AC | [中] | P1 | failure path 不可验收 |
| 3 | Story 8.4 status outcome 缺少映射表 | [中] | P1 | JSON 与 human label 易混淆 |

### 建议纳入后续改善跟踪（非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|------------|------|
| 4 | Story 8.1 / 8.6 catalog ownership 重叠 | [低] | P2 | 有效但可开发中对齐 |

### 可忽略（误报）

| # | 发现 | 原始严重性 | 忽略理由 |
|---|------|----------|---------|
| - | - | - | 本轮未发现误报 |

### 评估决定

**整体结论**：需修订后再审

下一步需要执行 fixer：先修订 Finding 1、Finding 2、Finding 3 对应的 Story 文档，再发起下一轮 SR 复审。Finding 4 可由 fixer 顺手补充 ownership 边界，或作为非阻塞改善项随实现顺序跟踪。

## 修订执行记录

### 修订执行记录
- **Date**: 2026-06-15
- **Model Used**: GPT-5 (codex)
- **Fix Items**: 3

#### 修订项 #1: Story 8.5 unresolved 与 resolve contract 冲突
- **文件**: `_bmad-output/implementation-artifacts/stories/8-5-resolve-command-support-output.md`
- **章节**: `Acceptance Criteria（验收标准）`、`Resolve Output Mode Decision（Resolve 输出模式裁决）`、`Tasks / Subtasks（任务 / 子任务）`
- **修改摘要**: 新增保守裁决：默认 `speclite resolve config/customization` 继续 pure JSON stdout；默认 missing key 保持 stdout `{}`、exit code 0、stderr empty；human-readable resolve support 必须通过显式 `--human` opt-in 触发；`unresolved` 仅适用于显式 human mode 的 missing key、empty result 或 failure 说明。同步补充 dev 阶段必须在 `06-resolve-command-contract.md`、commander registration、docs、tests 和 fixtures 中记录 `--human`，但本轮 SR fixer 未修改 SPEC。
- **状态**: 已完成

#### 修订项 #2: Story 8.3 缺少 `partial-or-failed` AC
- **文件**: `_bmad-output/implementation-artifacts/stories/8-3-update-and-repair-outcome-oriented-output.md`
- **章节**: `Acceptance Criteria（验收标准）`、`Tasks / Subtasks（任务 / 子任务）`
- **修改摘要**: 新增 AC6，明确 update/repair 在 apply、safe-write、operation-lock 或 partial execution failure 时 outcome 为 `partial-or-failed`，并要求 Summary、Evidence、Issues、Next Actions 展示已完成写入、失败步骤或 blocker、未执行项、protected boundaries 和恢复/验证动作。同步扩展 Task 1-4 的 AC 覆盖范围与测试要求。
- **状态**: 已完成

#### 修订项 #3: Story 8.4 status outcome 缺少映射表
- **文件**: `_bmad-output/implementation-artifacts/stories/8-4-status-and-validate-human-output-separation.md`
- **章节**: `Acceptance Criteria（验收标准）`、`Tasks / Subtasks（任务 / 子任务）`
- **修改摘要**: 在 AC1 新增 `status.data.highLevelHealth` 到 status human outcome 的 deterministic mapping table：`configured -> installed`、`not-configured -> not-installed`、`partial -> partial`、`failed -> failed`。明确 `stale` 和 `unknown` 只能是 human-derived label，证据必须来自 manifest、source descriptor、version/evidence insufficiency 或 installed-state summary 不足，且不得新增 public JSON enum，除非先更新 `01-command-result-json-contract.md`。同步补充实现与测试任务。
- **状态**: 已完成

#### 范围说明
- Finding 4 为 P2 非阻塞改善项，本轮未修订。
- 本轮未修改源码、测试、sprint status、SPEC 或 Epic 8 SR 修订无关文件。
