---
Story: 3-5
Round: 1
Date: 2026-05-29
Model Used: GPT-5 Codex (codex)
Review Source: 3-5-code-review-summary-20260529-round-1.md
Review Model: GPT-5 Codex (codex)
Type: Code Review Evaluation
---

## 评估总结

对 Story 3-5 的第 1 轮 CR 代码审查结果（首轮）进行逐条评估。审查报告提出 1 个阻塞发现：`ValidationIssue.details` 在 Story 与 executable schema 中均为 optional，但当前 redaction guard 会把缺失的 `details` 当作 unsafe value。经独立代码验证与定向复现，发现有效，严重性判断合理，需要进入 fixer 做最小修复。评估结论如下。

---

## 发现 #1 评估

### 审查原文

> **[高] `ValidationIssue.details` 被声明为可选但缺失时会被 redaction guard 判为 unsafe**
> - 来源：edge+auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

Story 的 `ValidationIssue` 最小模型明确将 `details` 定义为 optional：`_bmad-output/implementation-artifacts/stories/3-5-commandresult-and-validationissue-json-contract.md:275-283` 中为 `details?: Record<string, unknown>;`。

当前 executable schema 也将 `details` 建模为 optional：`src/diagnostics/command-result-schema.ts:18-27` 中 `details: z.record(z.string(), z.unknown()).optional()`。但同一 schema 的 `superRefine` 会无条件遍历 `["details", issue.details]` 并调用 `findUnsafeIssueValue(value)`：`src/diagnostics/command-result-schema.ts:39-50`。

`findUnsafeIssueValue(undefined)` 进入 `findUnsafeIssueValueAt` 后，`undefined` 不属于 string、null、number、boolean、array 或 object，最终走到 `return path`：`src/validation/issue-model.ts:55-90`。因此 optional 字段缺失会被误判为 redaction-unsafe，而不是被视为缺省可接受。

该问题不是纯理论风险。当前已有合法 producer 省略 `details`，例如 `src/source/source-discovery.ts:21-30` 生成 `source-integrity.missing-evidence` issue；`src/installer/ready-check.ts:77-86`、`src/installer/ready-check.ts:287-295`、`src/installer/ready-check.ts:301-311` 也生成无 `details` 的 issue。

我独立执行定向复现：

```text
ValidationIssueSchema.safeParse({
  issueId: 'manifest-schema.missing-version',
  category: 'manifest-schema',
  severity: 'error',
  affectedPath: '_speclite/_config/manifest.yaml',
  impact: 'Manifest version is missing.',
  suggestedNextStep: 'Rerun install.'
})
```

实际结果为 `success: false`，错误路径为 `details`，消息为 `details contains redaction-unsafe value at value`。这与 reviewer 证据一致。

**严重性判断：合理**

原始严重性 `[高]` 合理，评估后映射为 **P1**。原因是该缺陷会拒绝 Story 契约明确允许的 public `ValidationIssue` shape，并影响 `ExpectedStderrJsonLineSchema` / `ExpectedCommandJsonSchema` 等 semantic parser 复用的 validation path。它会阻塞合法 fixture 与 command output 通过契约校验，但不属于安全漏洞或数据破坏风险，因此不是 P0。

**修复建议：可行**

建议保持 reviewer 给出的最小修复方向：要么在 `findUnsafeIssueValueAt` 中把 `undefined` 视为安全缺省值，要么在 `ValidationIssueSchema.superRefine` 中仅对非 `undefined` 的 optional 字段执行 redaction guard。更推荐前者，因为 `findUnsafeIssueValue` 是当前 redaction guard 的统一入口，语义上应把缺失值视为“没有 unsafe payload”。

需要补充 focused schema 测试：

- 无 `details`、且 `issueId` / `category` / `severity` / `impact` / `suggestedNextStep` 合法的 `ValidationIssue` 应通过。
- 包含 unsafe `details` 的 `ValidationIssue` 仍应失败，避免修复时放松 redaction policy。

**误报评估：非误报**

代码路径、Story 契约和定向复现三者一致，且当前 producer 已存在无 `details` issue。该发现不是误报。

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | `ValidationIssue.details` optional 缺失会被 redaction guard 判为 unsafe | [高] | **P1** | 合法无 `details` issue 无法通过 executable schema / fixture semantic parser，阻塞 Story 3.5 契约交付。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

无。

### 可忽略（误报）

无。

### 评估决定

- **发现 #1（`ValidationIssue.details` optional 缺失会被 redaction guard 判为 unsafe）**：确认有效，阻塞交付，需要 fixer 执行最小修复与 focused 测试补充。
- **本轮评估结论**：不通过。
- **是否要求 fixer**：是。
- **修复边界建议**：只修复 optional `details` 的 redaction guard 处理与对应测试；不要扩大到 Epic 4 update/repair 行为，也不要改动 Story 文档或 owning SPEC。

---

## 修复执行记录

### 修复执行记录
- **Date**: 2026-05-29
- **Model Used**: GPT-5 Codex (codex)
- **Fix Items**: 1

#### 修复项 1：`ValidationIssue.details` 缺失时被 redaction guard 判为 unsafe

- **涉及文件**:
  - `src/validation/issue-model.ts`
  - `test/contract-anchors.test.ts`
- **修复内容**:
  - 在 `findUnsafeIssueValueAt` 中将 `undefined` 视为安全缺省值，与 optional `details` 契约保持一致。
  - 在 contract anchors focused schema 测试中补充无 `details` 的合法 `ValidationIssue` 应通过。
  - 保留并聚焦 unsafe `details` 失败断言，确认 redaction policy 未被放松。
- **验证结果**:
  - `npm test -- test/contract-anchors.test.ts`：通过，1 个 test file / 6 个 tests。
  - `npm test -- test/contract-anchors.test.ts test/update-command.test.ts test/validate-command.test.ts`：通过，3 个 test files / 21 个 tests。
  - `npm run build`：通过。
  - `git diff --check -- src/validation/issue-model.ts test/contract-anchors.test.ts`：通过。
  - `git diff --check --no-index -- /dev/null _bmad-output/implementation-artifacts/code-reviews/3-5-code-review/3-5-code-review-evaluation-20260529-round-1.md`：无空白问题。
- **边界确认**:
  - 未修改 Story 文档。
  - 未修改 owning SPEC。
  - 未扩大到 Epic 4 update/repair 行为。
  - 未执行 reviewer/evaluator/finalizer。
