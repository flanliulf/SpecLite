---
Story: 3-6
Round: 1
Date: 2026-05-29
Model Used: GPT-5 Codex (gpt-5-codex)
Review Source: 3-6-code-review-summary-20260529-round-1.md
Review Model: GPT-5 Codex (gpt-5-codex)
Type: Code Review Evaluation
---

## 评估总结

对 Story 3-6 的第 1 轮 CR 代码审查结果（首轮）进行逐条评估。Reviewer 提出的 2 个 finding 分别覆盖 validate projection 的 `issueCounts` 派生责任，以及 `ValidationIssue.affectedPath` 的 project-relative POSIX / redaction-safe contract 与排序 key。经独立代码核对，两项均确认有效，均属于当前 Story 3.6 AC / Task 范围内的 blocking patch 项。评估结论如下。

---

## 发现 #1 评估

### 审查原文

> **[中] `createValidateCommandResult` 信任调用方传入的 `issueCounts`，没有从最终 sorted issues 派生**
> - 来源：auditor+edge
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

`src/diagnostics/command-result.ts:128-155` 中 `createValidateCommandResult` 先执行 `const issues = sortValidationIssues(input.issues)`，并基于排序后的 `issues` 计算 status / summary / nextActions，但最终 `data` 字段仍直接返回 `input.data`。这意味着 `input.data.issueCounts` 不会被 projection boundary 重新计算或校验。

`test/validate-command.test.ts:568-587` 的 deterministic sorting regression 构造了 6 个 issues，但传入 `issueCounts: { info: 0, warning: 0, error: 0, critical: 0 }`；该测试只检查 `result.issues` 的排序稳定性，没有断言 `result.data.issueCounts` 与最终 issues 一致。该测试样例本身证明当前 helper 可输出 stale counts。

Story 3.6 明确要求 `issueCounts` 必须由最终 sorted issues 派生，并固定包含 `info`、`warning`、`error`、`critical` 四个 key；因此 reviewer 对 AC 3 / Task 4 缺口的描述成立。

**严重性判断：合理**

原始严重性为中等，但从交付门禁看应作为 P1 blocking 修复项处理。原因是 public `ValidateCommandResult` JSON 允许出现 issues 与 counts 不一致，破坏 Story 3.6 的 machine-readable validate contract。虽然当前 `validateProject` happy path 在 `src/validation/validate-project.ts:103-108` 已从 sorted issues 计算 counts，但 `createValidateCommandResult` 是更靠近 public projection 的边界，不能信任调用方已正确传入派生数据。

**修复建议：可行**

建议在 `createValidateCommandResult` 内从最终 `issues` 派生 `data.issueCounts`，保留调用方提供的 `checkedCategories`、`checkedTargets`、`validatedPaths`，并新增 focused regression：输入非空 issues 与错误 counts 时，最终 `result.data.issueCounts` 必须按 sorted issues 计算且四 key 完整。

**误报评估：非误报**

源码与测试均能支持该 finding；不存在 reviewer 误读。

---

## 发现 #2 评估

### 审查原文

> **[中] `ValidationIssue.affectedPath` 没有 schema guard，issue sorting 也按 raw path 排序**
> - 来源：blind+auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

`src/diagnostics/command-result-schema.ts:18-27` 的 `ValidationIssueSchema` 对 `affectedPath` 仅声明为 `z.string().min(1).optional()`，没有使用 `isProjectRelativePosixPath` refine。相同文件 `src/diagnostics/command-result-schema.ts:120-126` 已对 `ValidateCommandData.validatedPaths` 增加 project-relative POSIX guard，说明 validate data path 已有保护，但 issue path 没有同等约束。

`src/diagnostics/command-result-schema.ts:39-52` 的 redaction-safe 检查只覆盖 `details`、`impact`、`suggestedNextStep`，没有覆盖 `affectedPath`。因此 absolute path、home path、Windows drive path、backslash path 等值可进入 `ValidationIssue.affectedPath`，并通过 `src/diagnostics/output.ts:302-303` 作为 `location=...` 输出。

`src/validation/validation-order.ts:43-64` 的 `sortValidationIssues` 直接使用 `issue.affectedPath ?? COMMAND_LEVEL_PATH_SORT_KEY` 作为排序 key。虽然该文件已导入并用于 `sortValidatedPaths` 的 `normalizeProjectRelativePosixPath`，但 issue sorting 没有对 `affectedPath` 做 normalization 或 rejection。这与 Story 3.6 对 normalized affected path、global deterministic sorting、redaction-safe local determinism 的要求不一致。

**严重性判断：合理**

原始严重性为中等，但应作为 P1 blocking 修复项处理。该缺口可能同时导致路径泄露和跨平台排序差异，并直接影响 public JSON 与 human output。它命中 Story 3.6 AC 5、AC 6、AC 7 以及 Task 5 的 redaction-safe determinism 要求。

**修复建议：可行**

建议在 `ValidationIssueSchema.affectedPath` 上增加 `isProjectRelativePosixPath` refine，并确保 public command result schema 能拒绝 absolute path、`~` home path、Windows drive path 和 backslash path。对于 sorting，可优先依赖 schema / producer 层保证 `affectedPath` 已为 project-relative POSIX；如排序 helper 需要更强防御，可在排序 key 生成前使用 shared normalization 并让非法路径显式失败，而不是按 raw path 排序。

建议补充 regression tests：`ValidationIssueSchema` / `ValidateCommandResultSchema` 拒绝 absolute path、home path、Windows backslash path、drive-letter path；`sortValidationIssues` 对 normalized POSIX path 与 command-level missing path 保持稳定顺序。

**误报评估：非误报**

源码中确实缺少 `affectedPath` guard，且 human output 会直接展示该字段；finding 不属于误报。

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | `createValidateCommandResult` 未从最终 sorted issues 派生 `issueCounts` | [中] | **P1** | Public validate JSON 可输出 stale counts，违反 AC 3 / Task 4。 |
| 2 | `ValidationIssue.affectedPath` 缺少 project-relative POSIX / redaction guard，sorting 使用 raw path | [中] | **P1** | Public issue path 可能泄露本地路径并破坏 normalized deterministic ordering，违反 AC 5 / AC 6 / AC 7。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| - | - | - | - | 本轮无非阻塞 TODO；两项均应在 CR fixer 中修复。 |

### 可忽略（误报）

| # | 发现 | 原始严重性 | 忽略理由 |
|---|------|----------|---------|
| - | - | - | 本轮无误报。 |

### 评估决定

- **发现 #1（`issueCounts` 未从最终 issues 派生）**：确认有效，要求 fixer 在 `createValidateCommandResult` 边界派生 / 覆盖 `data.issueCounts`，并补充 mismatch regression。
- **发现 #2（`affectedPath` 缺少 path / redaction guard 且排序用 raw path）**：确认有效，要求 fixer 增加 schema guard 与路径异常测试，并确保 sorting 使用的 issue path 不绕过 project-relative POSIX contract。
- **整体决定**：CR evaluation 不通过；需要执行 `bmenhance-cr-03-fixer` 后再进入 reviewer / evaluator 复检。当前轮次不得 finalizer。

## 修复执行记录

### 修复执行记录
- **Date**: 2026-05-29
- **Model Used**: GPT-5 Codex (gpt-5-codex)
- **Fix Items**: 2

#### 修复项 #1：`createValidateCommandResult` 覆盖 stale `issueCounts`

- 修改文件：`src/diagnostics/command-result.ts`、`test/validate-command.test.ts`
- 执行结果：`createValidateCommandResult` 现在基于最终 sorted `issues` 重新派生 `data.issueCounts`，保留调用方提供的 `checkedCategories`、`checkedTargets`、`validatedPaths`，不再信任输入中的 stale counts。
- 回归覆盖：扩展 deterministic issue sorting regression，传入全 0 counts 时断言输出 counts 为 `{ info: 0, warning: 4, error: 1, critical: 1 }`，并验证反序输入得到一致 counts。

#### 修复项 #2：`ValidationIssue.affectedPath` 增加 path / redaction guard，排序不再信任 raw path

- 修改文件：`src/diagnostics/command-result-schema.ts`、`src/validation/issue-model.ts`、`src/validation/validation-order.ts`、`test/validate-command.test.ts`
- 执行结果：新增共享 `isValidationIssueAffectedPath` guard，要求 `affectedPath` 为 `.` 或 project-relative POSIX，且通过 redaction-safe 检查；`ValidationIssueSchema` 使用该 guard，并把 `affectedPath` 纳入 unsafe value scan。
- 排序修复：`sortValidationIssues` 先为每个 issue 预计算并校验 path sort key，再排序；非法 path 即使只有单个 issue 也会失败，不再依赖 raw `affectedPath` 直接排序。
- 回归覆盖：新增 unsafe path regression，覆盖 absolute path、home path、Windows backslash path、Windows drive path，并断言 `ValidationIssueSchema`、`ValidateCommandResultSchema` 与 `createValidateCommandResult` 均拒绝。

#### 验证结果

- `npm test -- test/validate-command.test.ts`：通过，15 tests passed。
- `npm run build`：通过，ESM 与 DTS build success。
- `npm test`：通过，25 files / 158 tests passed。
- `git diff --check`：通过，无 whitespace error。
