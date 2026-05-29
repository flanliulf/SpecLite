---
Story: 3-6
Round: 1
Date: 2026-05-29
Model Used: GPT-5 Codex (gpt-5-codex)
Type: Code Review Summary
---

## 审查结论

首轮审查。Agent 子审查工具在当前运行时不可用，本轮按 `bmenhance-cr-01-reviewer` 降级路径在当前上下文串行完成 Blind Hunter、Edge Case Hunter、Acceptance Auditor 三层视角审查。`npm run build`、`npm test -- test/validate-command.test.ts` 和全量 `npm test` 均通过；但发现 2 个需要修复的 validate contract / projection 问题。建议：不通过，进入 evaluator / fixer。

## 新发现

### 1. [中] `createValidateCommandResult` 信任调用方传入的 `issueCounts`，没有从最终 sorted issues 派生

- **来源**：auditor+edge
- **分类**：patch

- **证据**
  - `src/diagnostics/command-result.ts:128-155` 中 `createValidateCommandResult` 只对 `input.issues` 做排序并计算 status，但最终直接返回 `data: input.data`。
  - `test/validate-command.test.ts:568-587` 已构造 6 个 issues，却传入全 0 `issueCounts`；测试只断言排序后的 `issues`，没有断言 `result.data.issueCounts` 与 issues 一致。

- **影响**
  - 当前 `runValidateCommand` 路径依赖 `validateProject` 先算好 counts，因此 happy path 通过；但 CommandResult projection 边界本身仍允许 stale / mismatched `issueCounts` 被序列化为 public JSON。
  - 这削弱 AC 3 和 Task 4 的约束：`ValidateCommandData.issueCounts` 应由最终 sorted issues 派生，并固定包含 `info`、`warning`、`error`、`critical` 四个 key。

- **建议**
  - 在 `createValidateCommandResult` 内从 sorted `issues` 派生 `issueCounts`，或至少 assert / normalize `input.data.issueCounts` 与 issues 一致。
  - 补一个 regression test：传入非空 issues 与错误 counts 时，最终 `result.data.issueCounts` 必须反映 sorted issues。

### 2. [中] `ValidationIssue.affectedPath` 没有 schema guard，issue sorting 也按 raw path 排序

- **来源**：blind+auditor
- **分类**：patch

- **证据**
  - `src/diagnostics/command-result-schema.ts:20-24` 对 `affectedPath` 只要求 non-empty string；同文件 `:39-52` 的 redaction-safe 检查只覆盖 `details`、`impact`、`suggestedNextStep`，没有覆盖 `affectedPath`。
  - `src/validation/validation-order.ts:43-64` 的 `sortValidationIssues` 使用 `issue.affectedPath` 原值作为排序 key，没有通过 `normalizeProjectRelativePosixPath` 规范化或拒绝 absolute / OS-specific path。
  - 相比之下，同文件 `src/diagnostics/command-result-schema.ts:120-126` 已对 `validatedPaths` 做 project-relative POSIX refine，说明 validate data path 已有 guard，但 issue path 没有同等保护。

- **影响**
  - 任一 validation rule 若误传 absolute path、home path、Windows separator 或临时目录 path，`ValidateCommandResultSchema` 不会拦截，human output 的 `location=...` 会直接展示该路径。
  - 这会破坏 AC 5、AC 6、AC 7 对 normalized affected path、global deterministic sorting 和 redaction-safe local determinism 的要求。

- **建议**
  - 给 `ValidationIssueSchema.affectedPath` 增加 `isProjectRelativePosixPath` refine，或在 shared issue construction / projection 层统一 normalize/reject。
  - `sortValidationIssues` 对有 `affectedPath` 的 issue 应使用 normalized sort key；无法规范化时应让 producer/schema 失败，而不是按 raw path 排序。
  - 补测试覆盖 absolute path、home path、Windows backslash path 与 command-level missing path。

## 验证摘要

- `npm run build` 通过。
- `npm test -- test/validate-command.test.ts` 通过：1 file / 14 tests passed。
- `npm test` 通过：25 files / 157 tests passed。
- 定向复核：
  - AC 1 / AC 2：`validateProject` 按 canonical relative order 聚合已实现类别；`source-integrity` 未进入 `checkedCategories`。
  - AC 3：生产路径当前输出四类 `issueCounts`，但 projection boundary 存在上述 counts mismatch 缺口。
  - AC 4 / AC 5 / AC 6：target/path/issues happy path 有排序实现；issue `affectedPath` guard 仍不足。
  - AC 7：未发现 validate 调用 update/repair/write/chmod/remote source 的新增路径。
  - AC 8 / AC 9：human Evidence output 覆盖 checked / not checked / empty state 文本信号，`--json` 不含 presentation 字段。

## 通过项

- 未发现 Story 3.6 误拉 `source-integrity` domain validation rule；`source-integrity` 仅作为 canonical order / not checked reserved category 出现在 human output。
- `checkedCategories`、`checkedTargets`、`validatedPaths` 的 happy path 排序与空状态输出有 focused tests 覆盖。
- validate 默认 human output 有 `No issues found`、`No conflicts detected`、`No categories checked` 条件文本，且不同 terminal width 不改变 JSON 输出。
- 本轮发现均为当前 Story 相关 patch 项，不属于 defer 桶。
