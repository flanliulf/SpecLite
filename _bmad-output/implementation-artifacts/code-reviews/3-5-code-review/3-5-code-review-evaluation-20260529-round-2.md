---
Story: 3-5
Round: 2
Date: 2026-05-29
Model Used: GPT-5 Codex (codex)
Review Source: 3-5-code-review-summary-20260529-round-2.md
Review Model: GPT-5 Codex (codex)
Type: Code Review Evaluation
---

## 评估总结

对 Story 3-5 的第 2 轮 CR 代码审查结果（复审）进行逐条评估。审查报告确认 Round 1 的原始问题已修复，但提出 1 个新阻塞发现：当前修复把 `undefined` 作为 recursive redaction guard 的通用安全值，导致 `details` 内部的 `undefined` 也被 `ValidationIssueSchema` 接受，并在 JSON 渲染时被静默丢弃或转换，破坏 Story 3.5 对 `ValidationIssue.details` 的 stable、JSON-serializable、fixture-comparable 契约。经独立代码验证与定向复现，该发现有效，严重性为 P1，需要进入 fixer 做最小修复。评估结论如下。

---

## 上轮问题回顾确认

### Round 1 修复项：已修复原始症状，但引入相邻契约回归

Round 1 的阻塞问题是无 `details` 的合法 `ValidationIssue` 会被 redaction guard 判为 unsafe。当前代码已在 `src/validation/issue-model.ts:64-70` 将顶层 `undefined` 视为安全值，且 `test/contract-anchors.test.ts:135-144` 已补充无 `details` 的合法 issue 应通过。因此 Round 1 原始症状已修复。

但这次修复发生在 recursive guard 内部，`findUnsafeIssueValueAt` 对任意层级的 `undefined` 都返回 `undefined`，而 `ValidationIssueSchema.superRefine` 仍把 `issue.details` 整体交给该 guard 检查：`src/diagnostics/command-result-schema.ts:39-45`。这会让 `details` 对象内部的 `undefined` 被当作合法 JSON payload，形成 Round 2 新阻塞项。

### 历史 CR TODO（非阻塞）

无。

---

## 发现 #1 评估

### 审查原文

> **[高][新] `details` 内部的 `undefined` 被 schema 接受，破坏 JSON-serializable / fixture-comparable 契约**
> - 来源：edge+auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

Story 的 `ValidationIssue` 最小模型把 `details` 定义为可选对象字段：`_bmad-output/implementation-artifacts/stories/3-5-commandresult-and-validationissue-json-contract.md:275-283` 中为 `details?: Record<string, unknown>;`。同一 Story 的 redaction / fixture 要求明确要求 `ValidationIssue.details` 拒绝不稳定或不可公开的值，并要求 repeated runs 保持 stable semantic output：`_bmad-output/implementation-artifacts/stories/3-5-commandresult-and-validationissue-json-contract.md:388-397`。

当前 executable schema 的 `details` 类型是 `z.record(z.string(), z.unknown()).optional()`：`src/diagnostics/command-result-schema.ts:18-27`。该字段虽然 optional，但一旦出现，其内容需要满足 public JSON contract。`superRefine` 会把 `details`、`impact`、`suggestedNextStep` 逐项交给 `findUnsafeIssueValue`：`src/diagnostics/command-result-schema.ts:39-45`。

Round 1 fix 将 `value === undefined` 加入 `findUnsafeIssueValueAt` 的安全原子值集合：`src/validation/issue-model.ts:64-70`。由于该函数是递归实现，安全判断不区分 root optional 缺省与 nested object/array value。因此 `details: { reason: undefined }`、`details: { reasons: ["ok", undefined] }` 这类不是稳定 JSON payload 的值会通过 schema。

我独立执行定向复现，结果如下：

```text
{
  "noDetailsSuccess": true,
  "nestedUndefinedSuccess": true,
  "nestedDetailsJson": "{}",
  "arrayUndefinedSuccess": true,
  "arrayDetailsJson": "{\"reasons\":[\"ok\",null]}"
}
```

这与 reviewer 证据一致：无 `details` 的合法 issue 通过是正确的，但 nested `undefined` 也通过会导致 in-memory validated data 和 public JSON/fixture snapshot 不一致。对象属性中的 `undefined` 会被 `JSON.stringify` 静默删除，数组中的 `undefined` 会被转换成 `null`，均不满足 fixture-comparable details 的契约边界。

现有 focused test 只覆盖了无 `details` issue 通过，以及 unsafe path details 失败：`test/contract-anchors.test.ts:135-157`；尚未覆盖 nested `undefined` 或 array `undefined` 应失败。因此测试缺口也与 reviewer 判断一致。

**严重性判断：合理**

原始严重性 `[高]` 合理，评估后映射为 **P1**。原因是该问题发生在 Story 3.5 的 public JSON / diagnostics contract seam，会让 producer-side executable schema 接受非稳定 JSON payload，使 schema validation、runtime object 和 fixture semantic comparison 的边界不一致。这是功能契约与质量门禁违规，阻塞交付。

该问题不属于 P0，因为没有直接安全漏洞或数据破坏证据；但它会破坏 AC7 所要求的 stable / JSON-serializable / fixture-comparable guardrail，因此不能降级为非阻塞 CR TODO。

**修复建议：可行**

Reviewer 的修复建议可行，且应保持最小边界：

- 不要在 recursive `findUnsafeIssueValueAt` 中把所有层级的 `undefined` 都视为安全。
- 推荐将 root optional 缺省与 nested value 分开处理：例如在 `ValidationIssueSchema.superRefine` 中仅当 optional `details` 不是 `undefined` 时调用 redaction / JSON payload guard，或给 guard 增加 root-only 缺省处理参数。
- 补充 focused schema 测试：无 `details` 的 issue 应继续通过；`details: { reason: undefined }`、数组内 `undefined` 等非 JSON-serializable details payload 应失败；已有 unsafe path/cache path details 仍应失败。

修复不应扩大到 Epic 4 的 update/repair 写入行为，不应修改 Story 文档或 owning SPEC。

**误报评估：非误报**

代码路径、Story 契约、现有测试缺口和定向复现四者一致。该发现不是误报。

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | `details` 内部的 `undefined` 被 schema 接受 | [高] | **P1** | 非稳定 JSON payload 会通过 executable schema，JSON 渲染后被删除或转换，破坏 stable / JSON-serializable / fixture-comparable contract。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

无。

### 可忽略（误报）

无。

### 评估决定

- **发现 #1（`details` 内部的 `undefined` 被 schema 接受）**：确认有效，阻塞交付，需要 fixer 执行最小修复与 focused 测试补充。
- **本轮评估结论**：不通过。
- **是否要求 fixer**：是。
- **修复边界建议**：只修复 optional root `details` 与 nested non-JSON value 的边界处理，并补充 schema tests；不要扩大到 Epic 4 update/repair 行为，不要修改 Story 文档或 owning SPEC。

## 修复执行记录

### 修复执行记录
- **Date**: 2026-05-29
- **Model Used**: GPT-5 Codex (codex)
- **Fix Items**: 1

#### 修复项 #1：区分 root optional `details` 缺省与 nested non-JSON value

- **修改文件**: `src/validation/issue-model.ts`, `test/contract-anchors.test.ts`
- **修复摘要**: 将 `findUnsafeIssueValue` 的 root `undefined` 缺省处理保留在导出入口；递归检查函数 `findUnsafeIssueValueAt` 不再把 nested `undefined` 当作安全原子值。因此无 `details` 的合法 `ValidationIssue` 继续通过，而 `details` 对象属性或数组元素中的 `undefined` 会被判为 unsafe。
- **测试补充**: 在 focused contract anchor 中补充 `details: { reason: undefined }` 和 `details: { reasons: ["schema-version", undefined] }` 应失败的断言，同时保留无 `details` issue 通过与 unsafe path details 失败的既有覆盖。
- **验证结果**:
  - `npm test -- test/contract-anchors.test.ts`: 6 tests passed。
  - `npm test -- test/contract-anchors.test.ts test/update-command.test.ts test/validate-command.test.ts`: 21 tests passed。
