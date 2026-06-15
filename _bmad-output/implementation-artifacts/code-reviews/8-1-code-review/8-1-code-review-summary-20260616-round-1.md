---
Story: 8-1
Round: 1
Date: 2026-06-16
Model Used: GPT-5 Codex (gpt-5-codex)
Type: Code Review Summary
---

## 审查结论

首轮审查。Agent 工具不可用，本轮未能启动独立 Blind Hunter / Edge Case Hunter / Acceptance Auditor 子代理，已按 CR-01 降级为当前模型串行三层视角审查，存在上下文隔离不足的限制。

`npm test -- test/cli-output-presentation.test.ts`、`npm run build`、`npm test` 和 `git diff --check` 均通过；`npm run lint` 因 `package.json` 未定义 `lint` script，未能执行。审查发现 2 个 `patch` 类问题，均影响 Story 8.1 的 shared presentation semantics / locale empty state 目标；建议本轮不通过，先进入 evaluator/fixer 处理。

## 新发现

### 1. [中] Install ready summary 将已授权并完成写入的安装结果显示为未写入

- **来源**：blind+edge+auditor
- **分类**：patch

- **证据**
  - `src/diagnostics/output.ts:109-136` 的 `formatOutcomeSummary()` 只通过 `changedPaths` / `removedPaths` 判断写入状态；`InstallCommandResult` 不包含这些字段，因此 install 分支会落到 `writeNone`。
  - `src/diagnostics/output.ts:659-717` 的 `renderInstallReadySummary()` 复用该共享 Summary，同时又在 Evidence 中输出 `已通过 --yes 授权无 conflict 的 planned writes；source 与 install scope 已在写入前完成确认。`
  - `src/commands/install.ts:753-781` / `src/commands/install.ts:1071-1088` 显示 ready summary 是在 `runtime-structure`、`ide-mirror-creation`、`manifest-generation`、`ready-check`、`ready-summary` 完成后返回的 successful install result。
  - 定向复现：运行 `speclite install --yes` 的 human output，`exitCodes=[0]`，同时出现 `写入状态：未写入项目文件` 与 `已通过 --yes 授权无 conflict 的 planned writes...`。

- **影响**
  - 破坏 Story 8.1 AC1 要求的 Summary 首先回答“是否写入”；用户会把已经执行写入的 ready install 误判为未写入。
  - 破坏 Epic 8 的核心目标：“有没有写入项目文件”必须清楚，尤其对 write-capable command 是安全边界。

- **建议**
  - 不要让共享 Summary 只依赖 `changedPaths` / `removedPaths`。为 install ready / ready-check-failed 等分支传入 explicit write state，或在 presentation input 中允许 command renderer 显式覆盖 `writes` 行。
  - 补充 focused test：`install --yes` ready summary 应显示已写入或等价写入完成状态；prewrite install result 仍应显示未写入。

### 2. [中] `validate` 的 zh-CN empty state 仍硬编码英文文案

- **来源**：edge+auditor
- **分类**：patch

- **证据**
  - `src/diagnostics/output.ts:344-353` 在 `renderValidateHumanOutput()` 中直接追加 `No issues found for checked categories.`、`No conflicts detected.`、`No categories checked.`、`Skipped / not checked categories are listed above and must not be interpreted as healthy.`，未通过 `getCliMessage()` 或 locale catalog。
  - `src/cli/messages.ts:33-80` 已提供 locale catalog，但上述 validate empty state 未接入 catalog。
  - 定向复现：`renderValidateHumanOutput(result, { locale: "zh-CN" })` 输出 `Summary（摘要）` 和 `Empty State（空状态）`，但同一区块仍包含英文 `No issues found for checked categories.`、`No conflicts detected.`、`Skipped / not checked categories...`。

- **影响**
  - 违反 Story 8.1 AC2 的中文 locale 自然语言中文化要求，以及 Task 3 “Empty states 使用 catalog，而不是硬编码散落在各 command renderer 中”。
  - 使 `validate` 的 empty state 与 shared presentation frame 语义不一致；后续 Story 8.6 本地化收敛会继承这里的债务。

- **建议**
  - 将 validate-specific empty state 文案纳入 `CliMessageKey` / `MESSAGE_CATALOG`，或通过 command-specific message lookup 传入。
  - 补充 zh-CN validate empty-state focused test，断言自然语言无英文句子，同时保留 `checkedCategories`、issue id、path 等 technical identifiers。

## 验证摘要

- `npm test -- test/cli-output-presentation.test.ts` 通过（1 file / 4 tests）
- `npm run build` 通过（tsup ESM / DTS build success）
- `npm test` 通过（48 files / 335 tests）
- `npm run lint` 未通过执行（`package.json` 未定义 `lint` script）
- `git diff --check` 通过（无 whitespace error）
- 定向复现通过：
  - `speclite install --yes` ready summary 复现写入状态误报。
  - `renderValidateHumanOutput(..., { locale: "zh-CN" })` 复现 validate empty state 英文硬编码。

## 通过项

- `renderCommandResultJson()` 保持独立，未引入 `outcome` public JSON field。
- 新增 `test/cli-output-presentation.test.ts` 已覆盖 shared title / Outcome / Summary / Next Actions、中文技术标识保留、empty state 和 JSON parity 基础路径。
- `createValidateCommandResult()` 继续使用 `sortValidationIssues()`，human issue 输出按 `result.issues` 顺序渲染，未发现 issue ordering 回归。
- 未发现 Story 8.5 `resolve` human output、Story 8.7 docs / fixture matrix 等后续范围被完整提前实现；本轮仅包含 Story 8.1 内声明的 catalog / focused test 基础工作。
