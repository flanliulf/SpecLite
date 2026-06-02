---
Story: 1-3
Round: 3
Date: 2026-05-28
Model Used: GPT-5 Codex (gpt-5-codex)
Review Source: 1-3-code-review-summary-20260528-round-3.md
Review Model: GPT-5 Codex (gpt-5-codex)
Type: Code Review Evaluation
---

## 评估总结

对 Story 1-3 的第 3 轮 CR 代码审查结果（复审）进行逐条评估。本轮 reviewer 结论为不通过，提出 1 个 `patch` finding：AC7 要求的 canonical package root count 没有真正出现在成功路径的写入前展示 / 确认结果中。评估结论如下。

---

## 上轮问题回顾确认

### Round 1 三项阻塞问题：已关闭，未在本轮重新打开

Round 3 review 明确记录 Round 1 / Finding #1、#2、#3 已由 Round 2 reviewer 与 Round 2 evaluator 确认修复，且本轮未发现回归（`_bmad-output/implementation-artifacts/code-reviews/1-3-code-review/1-3-code-review-summary-20260528-round-3.md:13-27`）。本次 evaluator 仅评估 Round 3 新发现，不重新扩大到历史已关闭问题。

### 历史 CR TODO（非阻塞）

| # | 发现 | 状态 | 评估意见 |
|---|------|------|---------|
| - | 无 | 无 | Round 3 review 记录“仍为非阻塞待办：无”（`_bmad-output/implementation-artifacts/code-reviews/1-3-code-review/1-3-code-review-summary-20260528-round-3.md:29-31`）。 |

---

## 发现 #1 评估

### 审查原文

> **[中][新] Canonical package root count 没有真正出现在成功路径的写入前展示结果中**
> - 来源：blind+auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

Story AC7 明确要求安装范围摘要必须列出每个 selected module 的 canonical package root count，默认 `core` + `sdlc` 摘要必须表达 53 个 canonical package roots 将进入后续 IDE mirror、skill index、files index 和 ReadyCheck，并且该摘要必须在任何 project file write 之前展示给用户确认；它不是 Story 1.6 ready summary（`_bmad-output/implementation-artifacts/stories/1-3-official-module-selection-and-install-summary.md:64-70`）。

代码中 `createConfigInitializationPlan` 的成功结果确实生成了 `summary` 和 `nextActions`，且 `createFinalConfigSummary` 包含 `Canonical package roots: ...`、后续 pending steps、以及 “before any project file is written” 文案（`src/installer/config-initialization.ts:157-178`、`src/installer/config-initialization.ts:345-359`）。但 `runInstallCommand` 的成功路径只在 `!configPlan.ok` 时把 `configPlan.summary` 返回给用户；当 `configPlan.ok` 为 true 时，它直接构造 `InstallPlanSchema.parse(...)` 并调用 `applyInstallPlan(...)`（`src/commands/install.ts:295-341`）。因此成功写入路径没有实际把该 pre-write summary 作为用户可见 / 可确认结果输出。

最终成功结果的 `summary` 来自 `createInstalledReadySummary`（`src/commands/install.ts:402-419`）。该 summary 虽然包含 canonical package root count，但同时声明 “Final configuration summary confirmed.”、列出 runtime / artifact / manifest paths，并声明 runtime structure、IDE mirrors、manifest/index projections 与 ReadyCheck 已通过（`src/commands/install.ts:449-464`）。这已经是写入和 ReadyCheck 之后的 ready summary，不满足 AC7 的 pre-write 时序。

测试也印证了当前覆盖点在最终成功结果而非写入前确认：`test/install-module-selection.test.ts` 断言最终 `outcome.result.summary` 包含 `Canonical package roots: core=13, sdlc=40, total=53.`，同时断言 `completedSteps` 已完整到 `ready-summary`（`test/install-module-selection.test.ts:55-78`）。此外，`rg` 只定位到 `createPrewriteModuleSummary` 的定义，未发现调用点；该 helper 当前定义也没有 canonical package root count 字段（`src/commands/install.ts:711-732`）。

**严重性判断：合理**

原始严重性为“中”，但该问题直接违反 AC7 的核心时序要求：用户必须在 project writes 前看到并确认包含 canonical package root count 的 install scope summary。因为当前成功路径只能在写入后最终 summary 中看到该 count，属于 Story 1-3 验收缺口，评估后定为 P1 阻塞交付。

**修复建议：可行**

reviewer 建议在进入 `applyInstallPlan` 之前，把包含 selected modules、module versions、capability scope、source descriptor summary、per-module package root counts 和 pending write phases 的 pre-write summary 暴露为实际用户可见 / 可确认结果，并补充测试验证该阶段尚未创建 `_speclite`、`_speclite-output`、IDE mirrors、manifest/index。该方向与现有 `configPlan.summary`、`createPrewriteModuleSummary`、`InstallPlan` / `applyInstallPlan` 边界兼容，属于可实施 patch。

**误报评估：非误报**

本次评估用真实代码路径确认：count 已进入 config summary 和最终 ready summary，但成功路径没有 pre-write 展示 / 确认门禁证据；测试也只覆盖最终 ready summary。finding 不是误报。

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | Canonical package root count 没有真正出现在成功路径的写入前展示结果中 | [中] | **P1** | AC7 明确要求 pre-write 展示 / 确认，当前成功路径只在写入后 ready summary 中可见。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| - | 无 | - | - | 本轮没有可降级为 CR TODO 的 finding。 |

### 可忽略（误报）

| # | 发现 | 原始严重性 | 忽略理由 |
|---|------|----------|---------|
| - | 无 | - | 本轮 finding 已确认有效。 |

### 评估决定

- **发现 #1（canonical package root count 未出现在成功路径写入前展示 / 确认中）**：确认有效，P1 阻塞。evaluator 结论为不通过，需要执行 fixer；fixer 应补齐成功路径的 pre-write 用户可见 / 可确认摘要，并增加测试证明该摘要包含 `core=13`、`sdlc=40`、total `53`，且发生在 project writes 之前。
- 本次按用户要求停止在 evaluator，不执行 fixer / finalizer，不修改源码或 Story 文档。

## 修复执行记录

### 修复执行记录
- **Date**: 2026-05-28
- **Model Used**: GPT-5 Codex (gpt-5-codex)
- **Fix Items**: 1

#### 修复项 #1：成功路径写入前展示 canonical package root count

- **状态**: 已修复
- **对应 Finding**: Round 3 / 发现 #1，AC7 的 canonical package root count 未出现在成功路径写入前展示 / 确认结果中。
- **修改文件**:
  - `src/commands/install.ts`
  - `test/install-module-selection.test.ts`
- **修复摘要**:
  - 在 `runInstallCommand` 的 human 成功路径中，将现有 `createPrewriteModuleSummary` 接入 `configureProject` 的 prompt input，使用户在进入 `applyInstallPlan` 写入阶段之前看到 install scope summary。
  - 在 pre-write install scope summary 中补充 `Canonical package roots: core=13, sdlc=40, total=53.`，并保留 selected modules、module version、capability scope、source descriptor、pending write phases 与 `No project files were changed.` 证据。
  - 新增 targeted regression test，在 `configureProject` 回调触发时断言 prompt 包含 canonical package root count，并同步断言 `_speclite`、`_speclite-output`、`.claude/skills`、`.agents/skills`、manifest/index/config 尚未创建。
- **验证命令与结果**:
  - `npm test -- --run test/install-module-selection.test.ts`：通过，1 file / 9 tests。
  - `npm test -- --run test/source-and-modules.test.ts test/install-module-selection.test.ts test/config-initialization.test.ts test/runtime-structure.test.ts test/install-progress-ready-summary.test.ts test/ide-target-writer.test.ts test/menu-target-validation.test.ts test/cli-smoke.test.ts`：通过，8 files / 57 tests。
  - `git diff --check`：通过。
  - `npm test`：通过，20 files / 117 tests。
- **后续建议**: 需要重新执行 reviewer/evaluator 复检，确认 Round 3 P1 finding 已关闭。
