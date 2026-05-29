---
Story: 3-5
Round: 2
Date: 2026-05-29
Model Used: GPT-5 Codex (codex)
Type: Code Review Summary
---

## 审查结论

本轮为复审。Agent 工具在当前环境不可用，本轮按 `bmenhance-cr-01-reviewer` 降级规则由当前模型执行串行三层复审。Round 1 P1 的原始症状已经修复：缺省 `details` 的合法 `ValidationIssue` 现在可通过 `ValidationIssueSchema`，focused tests、全量 `npm test` 和 `npm run build` 均通过。但复审发现该修复把 `undefined` 作为递归 redaction guard 的通用安全值，导致 `details` 内部的 `undefined` 也被 schema 接受，并在 JSON 渲染时被静默丢弃。本轮建议：不通过。

## 上轮问题回顾

### 已修复

1. Round 1 / Finding #1 — `ValidationIssue.details` 被声明为可选但缺失时会被 redaction guard 判为 unsafe
   - 修复位置：`src/validation/issue-model.ts:64-70` 已将顶层缺省 `undefined` 纳入安全缺省值处理。
   - 测试位置：`test/contract-anchors.test.ts:135-144` 已补充无 `details` 的合法 `ValidationIssue` 应通过。
   - 验证结果：定向 `ValidationIssueSchema.safeParse` 对无 `details` issue 返回 `success: true`。

### 仍为非阻塞待办

无。

## 新发现

### 1. [高][新] `details` 内部的 `undefined` 被 schema 接受，破坏 JSON-serializable / fixture-comparable 契约

- **来源**：edge+auditor
- **分类**：patch

- **证据**
  - Story 的 `ValidationIssue` 契约只允许 `details?: Record<string, unknown>` 作为 optional 字段，且 AC7 要求写入 `details` 的内容 stable、JSON-serializable、fixture-comparable：`_bmad-output/implementation-artifacts/stories/3-5-commandresult-and-validationissue-json-contract.md:270-284`、`_bmad-output/implementation-artifacts/stories/3-5-commandresult-and-validationissue-json-contract.md:388-390`。
  - 当前 fix 在递归 guard 中把所有 `undefined` 视为安全：`src/validation/issue-model.ts:64-70`。因此不仅字段缺省被允许，`details` object 内部的 `undefined` value 也会被允许。
  - `ValidationIssueSchema.superRefine` 仍直接把 `issue.details` 交给同一个 recursive guard：`src/diagnostics/command-result-schema.ts:39-45`。当前 focused test 只覆盖了缺省 `details` 通过，未覆盖 nested `undefined` 应失败：`test/contract-anchors.test.ts:135-144`。
  - 定向复现：
    ```text
    node --import tsx - <<'NODE'
    import { ValidationIssueSchema } from './src/diagnostics/command-result-schema.ts';
    const nestedUndefined = ValidationIssueSchema.safeParse({
      issueId: 'manifest-schema.missing-version',
      category: 'manifest-schema',
      severity: 'error',
      affectedPath: '_speclite/_config/manifest.yaml',
      details: { reason: undefined },
      impact: 'Manifest version is missing.',
      suggestedNextStep: 'Rerun install.'
    });
    console.log(nestedUndefined.success);
    console.log(JSON.stringify(nestedUndefined.success ? nestedUndefined.data.details : null));
    NODE
    ```
    实际结果为 `true`，随后 `JSON.stringify(details)` 输出 `{}`。

- **影响**
  - Producer-side executable schema 会接受一个不是稳定 JSON payload 的 `details` 值；Structured JSON 渲染会静默删除该 key，造成 in-memory result、schema validation result 和 public JSON/fixture snapshot 不一致。
  - 这直接削弱 AC7 的 redaction-safe / fixture-comparable guardrail。虽然无 `details` 的合法 issue 已恢复，但当前修复引入了相邻契约回归。

- **建议**
  - 不要在 recursive `findUnsafeIssueValueAt` 中把所有 `undefined` 都视为安全。更小的修法是在 `ValidationIssueSchema.superRefine` 中仅当 optional 字段值不是 `undefined` 时调用 redaction guard，或给 guard 增加 root-only 缺省处理。
  - 补充 focused schema 测试：无 `details` 的 issue 应通过；`details: { reason: undefined }`、数组内 `undefined` 或其他非 JSON-serializable details payload 应失败；unsafe path / cache path details 仍应失败。

## 验证摘要

- `npm test -- test/contract-anchors.test.ts test/update-command.test.ts test/validate-command.test.ts` 通过（3 个 test files / 21 个 tests）。
- `npm test` 通过（25 个 test files / 152 个 tests）。
- `npm run build` 通过。
- `git diff --check -- src/validation/issue-model.ts test/contract-anchors.test.ts _bmad-output/implementation-artifacts/code-reviews/3-5-code-review` 通过。
- 额外复核：
  - 无 `details` 的合法 `ValidationIssue`：`ValidationIssueSchema.safeParse(...).success === true`。
  - `details: { reason: undefined }`：当前 `ValidationIssueSchema.safeParse(...).success === true`，且 JSON 渲染为 `{}`，确认新阻塞项有效。

## 通过项

- Round 1 P1 的原始缺陷已经修复：optional `details` 缺省不再被误判为 redaction-unsafe。
- `ValidationIssue` unsafe path guard 仍能拒绝 `/tmp/speclite-cache/file.txt` 等 unsafe `details` 字符串。
- Covered command schema、status/exit projection、`update.conflicts` single blocker projection、`status.data.highLevelHealth` 独立性和 focused command tests 未见回归。

## 结论

- **结论：不通过**
- **阻塞项**：1 个。`details` 内部 `undefined` 被 schema 接受，破坏 Story 3.5 对 `ValidationIssue.details` 的 JSON-serializable / fixture-comparable 契约。
- **建议**：进入 evaluator 判定后由 fixer 做最小修复，限定为 optional 字段缺省与 nested non-JSON value 的边界处理；不要扩大到 Epic 4 update/repair 行为。
