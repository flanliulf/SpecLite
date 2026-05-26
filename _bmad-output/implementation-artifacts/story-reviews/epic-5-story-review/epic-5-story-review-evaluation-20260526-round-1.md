---
Epic: 5
Scope: epic
Round: 1
Date: 2026-05-26
Model Used: GPT-5.5 (gpt-5.5)
Review Source: epic-5-story-review-summary-20260526-round-1.md
Review Model: GPT-5.5 (gpt-5.5)
Type: Story Review Evaluation
---

## 评估总结

本次评估对象为 Epic 5 首轮 SR 审查总结。审查总结中的 3 条发现均能被 Story 文档与 SourceDescriptor / CommandResult owning SPEC 证据支持，问题描述准确，修订建议可执行，未发现误报。

整体评估决定为需修订后再审。Story 5.2 的 trust anchor 与 public JSON 字段冲突会直接影响供应链信任边界和契约稳定性；Story 5.5 的 blocked-status AC 覆盖缺口会影响 Epic 收口验收完整性，建议作为进入开发前的阻塞修订处理。

## 发现 #1 评估

### 审查原文

> **[高] Registry trust AC 将 registry integrity 写成可触发 trusted 的条件**
> - 来源：consistency+contract
> - 分类：patch
> - 涉及 Story：5-2
> - 证据 - `_bmad-output/implementation-artifacts/5-2-registry-source-resolution-and-diagnostics.md` AC4 写明 registry integrity 或 expected lock match 验证成功时 source 可以标记为 `trusted`；同文件 Registry Resolution Matrix 又写明 registry SRI-only 应为 `unverified`。`_bmad-output/planning-artifacts/specs/02-source-descriptor-contract.md` 要求 registry sources 只有 lock 或 expected hash verification 成功才可 trusted。
> - 影响 - 开发或测试可能把 npm registry SRI 视为信任锚，绕过 Epic 5 的 source trust 边界，属于供应链安全相关歧义。
> - 建议 - 修订 Story 5.2 AC4，把 registry integrity 从 trusted 前置条件中移除；明确 `registry-integrity` 只是 reproducible evidence，只有 expected hash 或 `version-lock` match 才能产生 `trusted`。

### 评估结论：✅ 确认有效 — 需要修订（P1 优先级）

### 评估分析

**问题描述准确性**：准确 — Story 5.2 AC4 的前提确实把 `registry integrity` 与 expected lock match 并列为可触发 `trusted` 的条件；但同 Story 的 Task 3 和 Registry Resolution Matrix 已写明 SRI-only registry evidence 应为 `unverified`，owning SPEC 也限定 registry source 只有 lock 或 expected hash verification 成功才可 `trusted`。

**严重性判断**：合理 — 该冲突位于 trustStatus 推导的验收条件，可能让实现或测试把 registry SRI 当成 trust anchor，属于供应链信任边界错误。

**修订建议**：可行 — 直接修订 Story 5.2 AC4，将 trusted 前提收窄为 expected hash 或 lock match，并保留 `registry-integrity` 作为 reproducible evidence。

**误报评估**：非误报 — Story 5.2 内部矩阵与 SourceDescriptor SPEC 均支持该发现。

## 发现 #2 评估

### 审查原文

> **[中] Registry SourceDescriptor AC 要求 top-level package 字段**
> - 来源：consistency+contract
> - 分类：patch
> - 涉及 Story：5-2
> - 证据 - `_bmad-output/implementation-artifacts/5-2-registry-source-resolution-and-diagnostics.md` AC3 要求 descriptor 包含 `package`；但 `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md` 与 `02-source-descriptor-contract.md` 的 `SourceDescriptor` shape 没有 top-level `package` 或 `packageName` 字段。Story 5.2 后文也要求 registry package identity 通过 `integrityEvidence[].packageName` 表示。
> - 影响 - AC 与契约真源冲突，可能诱导实现新增未契约化 public JSON 字段，破坏 CommandResult / manifest projection 的稳定性。
> - 建议 - 修订 Story 5.2 AC3，将 `package` 表述改为 registry evidence 中的 `packageName` / package identity，或直接引用 SourceDescriptor SPEC 允许字段。

### 评估结论：✅ 确认有效 — 需要修订（P1 优先级）

### 评估分析

**问题描述准确性**：准确 — Story 5.2 AC3 明确要求 SourceDescriptor 包含 `package`，但 CommandResult 与 SourceDescriptor SPEC 的 `SourceDescriptor` shape 只允许 `sourceType`、`channel`、`requestedVersion`、`version`、`resolvedRoot`、`contentHash`、`integrityEvidence` 和 `trustStatus` 等字段，registry package identity 位于 `integrityEvidence[].packageName`。

**严重性判断**：偏低 — 原始严重性为中，但这是 AC 层与 public JSON canonical contract 的直接冲突，若按 AC 实现会新增未契约化字段，应按 P1 阻塞修订。

**修订建议**：可行 — 将 AC3 中的 `package` 改为 `integrityEvidence[].packageName` 或更泛化的 package identity 表述即可，不需要改变 Story 范围。

**误报评估**：非误报 — Story 5.2 后文已自我纠正为不得新增 top-level `package` 或 `packageName`，说明 AC3 存在真实不一致。

## 发现 #3 评估

### 审查原文

> **[中] Story 5.5 blocked-status AC 未覆盖完整阻断矩阵**
> - 来源：structure+contract
> - 分类：patch
> - 涉及 Story：5-5
> - 证据 - `_bmad-output/implementation-artifacts/5-5-sourcedescriptor-trust-status-and-redacted-reporting.md` AC4 只列出 hash mismatch、lock mismatch、unsupported source 和 source policy rejection；同 Story tasks 与 SourceDescriptor SPEC 还要求 missing evidence、local source self-reference、floating Git source、bundled packaging evidence missing、failed evidence verification 等都必须 `blocked`。
> - 影响 - Story 5.5 是 Epic 5 收口 Story，AC 覆盖不完整会让验收与测试漏掉关键 source-integrity 阻断路径。
> - 建议 - 扩展 Story 5.5 AC4，使 blocked status 覆盖 SourceDescriptor SPEC 的完整 blocking cases，并要求 cross-source tests 对齐该矩阵。

### 评估结论：✅ 确认有效 — 需要修订（P1 优先级）

### 评估分析

**问题描述准确性**：准确 — Story 5.5 AC4 只列出部分阻断场景；同 Story Task 3、Trust Status Matrix 与 SourceDescriptor SPEC 均包含更完整的 blocked cases，包括 missing evidence、local source self-reference、floating Git source、bundled packaging evidence 缺失和 failed evidence verification。

**严重性判断**：偏低 — 原始严重性为中，但 Story 5.5 是 Epic 5 的 trust/reporting 收口 Story，AC 覆盖面不足会直接削弱验收标准和 cross-source tests，应按 P1 修订。

**修订建议**：可行 — 将 AC4 扩展为引用 SourceDescriptor SPEC 的完整 blocking cases，并让 Task/test matrix 与 AC 文本一致。

**误报评估**：非误报 — AC、Task、矩阵和 owning SPEC 之间存在可核验的覆盖差异。

## 整体评估结论

### 需要修订（阻塞进入开发）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|------------|------|
| 1 | Registry trust AC 将 registry integrity 写成可触发 trusted 的条件 | [高] | P1 | trust anchor 边界冲突 |
| 2 | Registry SourceDescriptor AC 要求 top-level package 字段 | [中] | P1 | public JSON 契约冲突 |
| 3 | Story 5.5 blocked-status AC 未覆盖完整阻断矩阵 | [中] | P1 | 收口 AC 覆盖不足 |

### 建议纳入后续改善跟踪（非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|------------|------|
| 无 | 无 | 无 | 无 | 本轮无非阻塞降级项 |

### 可忽略（误报）

| # | 发现 | 原始严重性 | 忽略理由 |
|---|------|----------|---------|
| 无 | 无 | 无 | 本轮无误报 |

### 评估决定

**整体结论**：需修订后再审

建议先修订 Story 5.2 AC3/AC4 与 Story 5.5 AC4，使 AC 层与 SourceDescriptor / CommandResult owning SPEC 完全一致；修订完成后再进入下一轮 SR 复审。

## 修订执行记录

### 修订执行记录
- **Date**: 2026-05-26
- **Model Used**: GPT-5.5 (gpt-5.5)
- **Fix Items**: 3

#### 修订项 #1: Registry trust AC 将 registry integrity 写成可触发 trusted 的条件
- **文件**: `_bmad-output/implementation-artifacts/5-2-registry-source-resolution-and-diagnostics.md`
- **章节**: `Acceptance Criteria（验收标准）` / AC4
- **修改摘要**: 将 trusted 前提从 `registry integrity 或 expected lock match` 收窄为 `expected hash 或 expected lock match`，并明确 registry integrity evidence 或 registry 类型不能作为 trusted 来源。
- **状态**: 已完成

#### 修订项 #2: Registry SourceDescriptor AC 要求 top-level package 字段
- **文件**: `_bmad-output/implementation-artifacts/5-2-registry-source-resolution-and-diagnostics.md`
- **章节**: `Acceptance Criteria（验收标准）` / AC3
- **修改摘要**: 移除 AC3 对 top-level `package` 字段的要求，改为声明 registry package identity 只能通过 `integrityEvidence[].packageName` 表示，避免新增未契约化 public JSON 字段。
- **状态**: 已完成

#### 修订项 #3: Story 5.5 blocked-status AC 未覆盖完整阻断矩阵
- **文件**: `_bmad-output/implementation-artifacts/5-5-sourcedescriptor-trust-status-and-redacted-reporting.md`
- **章节**: `Acceptance Criteria（验收标准）` / AC4
- **修改摘要**: 扩展 blocked 前提，覆盖 missing evidence、hash mismatch、lock mismatch、unsupported source、local source self-reference、floating Git source、bundled packaging evidence 缺失、failed evidence verification 和 source policy 拒绝。
- **状态**: 已完成
