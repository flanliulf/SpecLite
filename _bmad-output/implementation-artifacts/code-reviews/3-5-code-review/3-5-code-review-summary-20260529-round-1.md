---
Story: 3-5
Round: 1
Date: 2026-05-29
Model Used: GPT-5 Codex (codex)
Type: Code Review Summary
---

## 审查结论

首轮审查。Agent 工具在当前环境不可用，本轮按 `bmenhance-cr-01-reviewer` 降级规则执行串行三层审查：Blind Hunter、Edge Case Hunter、Acceptance Auditor 均在当前上下文完成。`npm test -- test/contract-anchors.test.ts test/update-command.test.ts test/validate-command.test.ts`、全量 `npm test`、`npm run build` 和定向 `git diff --check` 均通过；但发现 1 个 `ValidationIssue` executable schema 与 Story 契约不一致的问题，会导致合法 public issue 被 schema/fixture parser 拒绝。本轮建议：不通过。

## 新发现

### 1. [高] `ValidationIssue.details` 被声明为可选但缺失时会被 redaction guard 判为 unsafe

- **来源**：edge+auditor
- **分类**：patch

- **证据**
  - Story 明确把 `details` 定义为 optional：`_bmad-output/implementation-artifacts/stories/3-5-commandresult-and-validationissue-json-contract.md:275-283` 中 `details?: Record<string, unknown>;`。
  - `ValidationIssueSchema` 也把 `details` 建模为 optional，但 `superRefine` 无条件把 `issue.details` 传给 `findUnsafeIssueValue`：`src/diagnostics/command-result-schema.ts:18-53`。
  - `findUnsafeIssueValueAt` 没有把 `undefined` 当作缺省可接受值处理；当输入为 `undefined` 时会落到末尾 `return path`：`src/validation/issue-model.ts:55-90`。
  - 当前代码中已有多个无 `details` 的真实 `ValidationIssue` producer，例如 `src/source/source-discovery.ts:21-30`、`src/installer/ready-check.ts:77-86`、`src/installer/ready-check.ts:287-311`。
  - 定向复现：
    ```text
    node --import tsx - <<'NODE'
    import { ValidationIssueSchema } from './src/diagnostics/command-result-schema.ts';
    const result = ValidationIssueSchema.safeParse({
      issueId: 'manifest-schema.missing-version',
      category: 'manifest-schema',
      severity: 'error',
      affectedPath: '_speclite/_config/manifest.yaml',
      impact: 'Manifest version is missing.',
      suggestedNextStep: 'Rerun install.'
    });
    console.log(result.success);
    NODE
    ```
    实际结果为 `false`，错误路径为 `details`，消息为 `details contains redaction-unsafe value at value`。

- **影响**
  - 这会破坏 AC 1 对统一 `ValidationIssue` model 的要求，也破坏 AC 7 中“当写入 `details`、`impact` 或 `suggestedNextStep` 时才进行稳定/脱敏约束”的语义。
  - `ExpectedStderrJsonLineSchema` 与 `ExpectedCommandJsonSchema` 均复用该 schema；一旦 command 或 resolver 输出合法的无 `details` issue，fixture semantic comparison 会失败，或者迫使 producer 为所有 issue 填充无意义 `details`，改变公共契约。

- **建议**
  - 在 `findUnsafeIssueValueAt` 中把 `undefined` 视为安全缺省值，或在 `ValidationIssueSchema.superRefine` 中仅当 optional 字段不为 `undefined` 时调用 redaction guard。
  - 增加一个 schema 测试：无 `details`、但包含稳定 `issueId` / `category` / `severity` / `impact` / `suggestedNextStep` 的 `ValidationIssue` 应通过；包含 unsafe `details` 的 issue 应失败。

## 验证摘要

- `npm test -- test/contract-anchors.test.ts test/update-command.test.ts test/validate-command.test.ts` 通过（3 个 test files / 21 个 tests）。
- `npm test` 通过（25 个 test files / 152 个 tests）。
- `npm run build` 通过。
- 定向 `git diff --check -- _bmad-output/implementation-artifacts/code-reviews/3-5-code-review src/bin/speclite.ts src/commands/update.ts src/diagnostics/command-result-schema.ts src/diagnostics/command-result.ts src/diagnostics/output.ts src/fixtures/fixture-contract.ts src/validation/issue-model.ts test/contract-anchors.test.ts test/update-command.test.ts test/validate-command.test.ts` 通过。
- 定向复现 `ValidationIssueSchema.safeParse` 无 `details` issue 失败，确认发现有效。

## 通过项

- Covered command JSON envelope 使用统一 top-level allowlist，`schemaVersion` 为 `speclite.command-result.v1`，`install` / `status` / `validate` / `update` / `update.repair` 均有 schema anchor。
- `status.data.highLevelHealth` 与 `CommandResult.status` 保持独立；status command 始终以 lightweight summary 成功读取结果表达 health。
- `update` / `update.repair` 已按授权边界保持 non-write placeholder：`writeAuthorized: false`、`changedPaths: []`、`skippedPaths: []`、`conflicts: []`，未实现 Epic 4 的真实 plan/conflict/repair/operation lock。
- `update.conflicts` projection helper 将 path-level conflicts 保留在 `data.conflicts`，并只投影一个 command-level `update.conflicts` issue。
- `command` id、`targetProject` config-name fallback、path sorting、issue sorting、fixture parsed semantic comparison均有定向测试覆盖。

## 结论

- **结论：不通过**
- **阻塞项**：1 个。`ValidationIssue.details` optional contract 与 redaction guard 实现冲突。
- **建议**：进入 evaluator 判定后由 fixer 最小修复 optional `details` 处理与缺失测试；不需要扩大到 Epic 4 update 行为。
