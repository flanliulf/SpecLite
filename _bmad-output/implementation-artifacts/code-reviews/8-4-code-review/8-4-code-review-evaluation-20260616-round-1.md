---
Story: 8-4
Round: 1
Date: 2026-06-16
Model Used: GPT-5 Codex (gpt-5-codex)
Review Source: 8-4-code-review-summary-20260616-round-1.md
Review Model: GPT-5 Codex (gpt-5-codex)
Type: Code Review Evaluation
---

## 评估总结

对 Story 8-4 的第 1 轮 CR 代码审查结果（首轮）进行逐条评估。审查结果提出 1 个发现：`validate` human output 未按 canonical order 展示 `checkedTargets`。经独立代码验证，该发现准确、非误报，并且违反 AC3 中 checked targets 必须按 canonical order 展示的要求。评估结论如下。

---

## 发现 #1 评估

### 审查原文

> **[中] Validate human output 未按 canonical order 展示 checked targets**
> - 来源：edge+auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

Story 8.4 AC3 明确要求 `validate` 输出中的 issue counts、checked categories、checked targets、validated paths 和 issue list 必须按 canonical order 展示。当前 `renderValidateHumanOutput()` 已对 `checkedCategories`、`issues`、`validatedPaths` 做排序：`src/diagnostics/output.ts:413-415` 分别调用 `sortIssueCategories()`、`sortValidationIssues()`、`sortValidatedPaths()`。但 `Scope` 中的 checked targets 行仍直接输出 `result.data.checkedTargets`：`src/diagnostics/output.ts:450` 为 `Checked targets: ${formatList(result.data.checkedTargets)}`。

仓库已有 canonical target 排序 helper：`src/validation/validation-order.ts:22-24` 的 `sortCheckedTargets()` 按 `CANONICAL_TARGET_ORDER` 过滤排序；canonical 顺序定义在 `src/ide/adapter-registry.ts:1`，即 `["claude", "agents"]`。同时 `src/diagnostics/output.ts:17-22` 当前只导入了 `CANONICAL_ISSUE_CATEGORY_ORDER`、`sortIssueCategories()`、`sortValidatedPaths()`、`sortValidationIssues()`，未导入或调用 `sortCheckedTargets()`。

独立定向复现确认：构造 `ValidateCommandResult`，传入 `checkedTargets: ["agents", "claude"]` 并调用 `renderValidateHumanOutput()`，实际输出为 `Checked targets: agents, claude`，不是 canonical `Checked targets: claude, agents`。这与 reviewer 的证据一致。

**严重性判断：合理**

原始严重性标为 `[中]` 合理；按本评估模板优先级应归为 **P1**，因为这是 Story 8.4 AC3 的明确验收项缺口，属于质量门禁违规，阻塞本 Story 交付。即使 `validateProject()` 正常路径会在 `src/validation/validate-project.ts:126` 对 `checkedTargets` 调用 `sortCheckedTargets()`，human renderer 仍是 Story 8.4 的输出契约边界；fixture、未来适配层或直接构造的 `ValidateCommandResult` 仍可能把非 canonical 顺序泄露到 human output。

**修复建议：可行**

建议复用已有 `sortCheckedTargets()`，在 `renderValidateHumanOutput()` 内先计算 canonical `checkedTargets`，再输出 `formatList(checkedTargets)`。修复范围应很小，且与当前 categories、issues、paths 的排序方式一致。测试应补充覆盖 `checkedTargets: ["agents", "claude"]` 时 human output 包含 `Checked targets: claude, agents`。

**误报评估：非误报**

该发现有明确 AC3 依据、代码证据和定向复现结果；不是误报。

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | Validate human output 未按 canonical order 展示 checked targets | [中] | **P1** | 违反 AC3 的 checked targets canonical order 要求，需阻塞修复。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|

### 可忽略（误报）

| # | 发现 | 原始严重性 | 忽略理由 |
|---|------|----------|---------|

### 评估决定

- **发现 #1（Validate human output 未按 canonical order 展示 checked targets）**：确认有效，评估为 P1 阻塞修复。需要在 `renderValidateHumanOutput()` 中复用 `sortCheckedTargets()`，并补充测试断言非 canonical 输入 `["agents", "claude"]` 的 human output 必须展示为 `Checked targets: claude, agents`。
- **整体决定**：not approved。当前 Round 1 CR 发现成立，需要进入 fixer 修复后再复审。
- **CR TODO 数量**：0。
- **误报数量**：0。

---

## 修复执行记录

### 修复执行记录
- **Date**: 2026-06-16
- **Model Used**: GPT-5 Codex (gpt-5-codex)
- **Fix Items**: 1

#### 修复项 #1：Validate human output 未按 canonical order 展示 checked targets

- **评估优先级**: P1
- **修复状态**: 已完成
- **修改文件**:
  - `src/diagnostics/output.ts`
  - `test/validate-command.test.ts`
- **修复摘要**:
  - 在 `renderValidateHumanOutput()` 中复用 `sortCheckedTargets()`，将 `result.data.checkedTargets` 规范化为 canonical target order 后再渲染 human output。
  - 新增 focused test，覆盖 `checkedTargets: ["agents", "claude"]` 时 human output 必须包含 `Checked targets: claude, agents`。
- **范围控制**:
  - 未新增 public JSON fields。
  - 未改变 `status` 的 `highLevelHealth` enum 或 aggregation。
  - 未让 `status` 执行 `validate`、`repair` 或 implicit update。
  - 未改变 validate core behavior。
  - 未实现 Story 8.5-8.7。
- **验证命令与结果**:
  - `npx vitest run test/validate-command.test.ts -t "sorts validate human checked targets by canonical target order"`：通过，1 passed。
  - `npx vitest run test/status-command.test.ts test/validate-command.test.ts`：通过，2 files passed，32 tests passed。
  - `npm run build`：通过，tsup ESM/DTS build success。
  - `npm test`：通过，49 files passed，349 tests passed。
  - `git diff --check`：通过，无 whitespace error。
- **packaging manifest 检查**:
  - `npm run build` 后检查 `release/packaging-manifest.json`，无 diff，未发生 hash drift。
