---
Story: 8-8
Round: 1
Date: 2026-06-16
Model Used: GPT-5 Codex (codex)
Review Source: 8-8-code-review-summary-20260616-round-1.md
Review Model: GPT-5 Codex (codex)
Type: Code Review Evaluation
---

## 评估总结

对 Story 8-8 的第 1 轮 CR 代码审查结果（首轮）进行逐条评估。本轮审查发现 2 个 patch 类问题：1 个路径安全缺陷、1 个 human output 空态归属缺陷。经独立代码验证，两个 finding 均有效，均建议进入 fixer；无 CR TODO，未发现误报。评估结论如下。

---

## 发现 #1 评估

### 审查原文

> **[中] 跨目录相对 target 仍会在 human Next Actions 中退化为 basename**
> - 来源：edge+auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

代码验证确认该问题成立。[src/commands/install.ts](/Users/fancyliu/Repos/SpecLite/src/commands/install.ts:84) 仅在 `rawTarget` 为绝对路径时将 `pathSafeTarget` 设置为 `targetRoot`，否则回落到 `displayPath`。同时，[src/fs/path-normalizer.ts](/Users/fancyliu/Repos/SpecLite/src/fs/path-normalizer.ts:121) 会把 `../noi`、`..` 等跨目录相对路径折叠为 basename。最终 [src/diagnostics/output.ts](/Users/fancyliu/Repos/SpecLite/src/diagnostics/output.ts:1458) 使用 `pathSafeTarget` 生成 human install command，因此 `../noi` 会退化为 `noi`。

**严重性判断：合理**

原始严重性标为「中」合理。该问题不是构建失败或数据破坏，但直接违反 path-safe human Next Actions 目标；用户复制输出命令时可能在当前执行目录下解析到错误目标目录，属于 Story 8.8 的验收阻塞项，评估后列为 P1。

**修复建议：可行**

审查建议可行。install presentation context 应保留 raw command target 或计算 command-safe target：绝对输入继续使用 `targetRoot`；相对输入应保留可从原 `commandCwd` 复制执行的相对路径，尤其不能把 `..` 场景折叠为 basename。补充 focused regression 也必要。

**误报评估：非误报**

该 finding 与当前代码路径一致，且审查原文给出的影响链条完整，不属于误报。

---

## 发现 #2 评估

### 审查原文

> **[低] shared frame 把非 issue 的写入空态放进了 Issues section**
> - 来源：blind+auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

代码验证确认该问题成立。install renderer 在 [src/diagnostics/output.ts](/Users/fancyliu/Repos/SpecLite/src/diagnostics/output.ts:424) 将 `getCommonEmptyStateLines(result, locale)` 作为 `emptyStateLines` 传入 shared frame；shared frame 在 [src/diagnostics/output.ts](/Users/fancyliu/Repos/SpecLite/src/diagnostics/output.ts:216) 至 [src/diagnostics/output.ts](/Users/fancyliu/Repos/SpecLite/src/diagnostics/output.ts:218) 会把所有 empty state fallback 都合并进 `Issues` section；而 [src/diagnostics/output.ts](/Users/fancyliu/Repos/SpecLite/src/diagnostics/output.ts:1469) 至 [src/diagnostics/output.ts](/Users/fancyliu/Repos/SpecLite/src/diagnostics/output.ts:1476) 明确会同时加入 `noIssues` 和 `writeNone`。因此 `未写入项目文件` 会出现在 `Issues（问题）` 下。

**严重性判断：合理**

原始严重性标为「低」合理，因为它主要影响 human output 信息架构和可读性，不会改变安装执行结果。但该问题仍违反 Story 8.8 对 empty state 归属与扫描语义的优化目标，应在本 Story 交付前修复；评估后作为验收阻塞项列为 P1。

**修复建议：可行**

审查建议可行。应拆分 issue-owned empty state 与 write/plan/checked-items empty state：`Issues` 只承载 `- 无问题` 或真实 issue；`未写入项目文件` 应由 Summary 或写入/计划相关 section 表达，避免在 Issues 中重复。

**误报评估：非误报**

该 finding 与当前 shared frame fallback 逻辑一致，且属于本次 Story 8.8 引入或触达的人类输出布局问题，不属于误报。

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | 跨目录相对 target 的 human Next Actions 退化为 basename | [中] | **P1** | 违反 path-safe command preview，用户复制命令可能安装到错误目录。 |
| 2 | 非 issue 的写入空态进入 Issues section | [低] | **P1** | 违反 empty state 归属语义，削弱 `Issues` section 的扫描可信度。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 无 | 无 | 无 | 无 | 本轮没有建议延后处理的 CR TODO。 |

### 可忽略（误报）

| # | 发现 | 原始严重性 | 忽略理由 |
|---|------|----------|---------|
| 无 | 无 | 无 | 本轮未发现误报。 |

### 评估决定

- **发现 #1（跨目录相对 target 的 human Next Actions 退化为 basename）**：确认有效，阻塞交付，需要 fixer 修复并补充 `../noi` 之类跨目录相对 target 的 regression。
- **发现 #2（非 issue 的写入空态进入 Issues section）**：确认有效，阻塞交付，需要 fixer 将 issue empty state 与写入空态拆分，确保 `Issues` 只表达问题或 `无问题`。

---

## 修复执行记录

### 修复执行记录
- **Date**: 2026-06-16
- **Model Used**: GPT-5 Codex (codex)
- **Fix Items**: 2

### 修复条目

1. **跨目录相对 target 的 human Next Actions 退化为 basename**
   - 修改 `src/commands/install.ts` 的 install presentation context 生成逻辑：绝对 target 继续使用 resolved `targetRoot`；非空相对 target 保留原始命令参数作为 `pathSafeTarget`，确保 `../noi` 可从原 `commandCwd` 直接复制执行。
   - 在 `test/install-outcome-human-output.test.ts` 增加 `targetDirectory="../noi"` regression，验证 human output 使用 `speclite install ../noi --yes` 与 `speclite install ../noi --yes --interactive`，同时 JSON 不泄漏 resolved absolute target。

2. **非 issue 的写入空态进入 Issues section**
   - 修改 `src/diagnostics/output.ts` 的 shared frame fallback：`Issues` section 仅输出真实 issue 或 `- 无问题`。
   - 将非 issue 空态保留在命令状态上下文中，并过滤 `writeNone`，由 Summary 继续表达写入状态，避免 `未写入项目文件` 混入 `Issues`。
   - 在 `test/install-outcome-human-output.test.ts` 增加 `Issues` section 精确归属断言，验证 install no-issue section 只包含 `- 无问题`。

### 验证结果

- `npm test -- test/install-outcome-human-output.test.ts`：通过，8 tests passed。
- `npm test -- test/cli-output-presentation.test.ts test/cli-message-catalog.test.ts test/cli-human-output-matrix.test.ts test/install-outcome-human-output.test.ts`：通过，27 tests passed。
- `npm run build`：通过。
- `npm test`：通过，52 files / 372 tests passed。
