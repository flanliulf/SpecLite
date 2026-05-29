---
Story: 3-5
Round: 3
Date: 2026-05-29
Model Used: GPT-5 Codex (codex)
Type: Code Review Summary
---

## 审查结论

本轮为复审。Agent 工具在当前环境不可用，本轮按 `bmenhance-cr-01-reviewer` 降级规则由当前模型串行执行 Blind Hunter、Edge Case Hunter、Acceptance Auditor 三层复审。Round 1 与 Round 2 两个 P1 均已修复且未见 redaction guard 回归：无 `details` 的合法 `ValidationIssue` 通过，`details` object / array 内部 `undefined` 失败，unsafe path details 仍失败。focused tests、全量 `npm test`、`npm run build` 与定向 `git diff --check` 均通过；但本轮全量核对 AC 1-9 / Tasks 1-9 时发现 `install` command 仍未按 AC6 使用 project config name 作为 `targetProject`。本轮建议：不通过。

## 上轮问题回顾

### 已修复

1. Round 1 / Finding #1 — `ValidationIssue.details` 被声明为可选但缺失时会被 redaction guard 判为 unsafe
   - 修复位置：`src/validation/issue-model.ts:55-58` 在 `findUnsafeIssueValue` root 入口允许 optional 字段缺省。
   - 测试位置：`test/contract-anchors.test.ts:135-144` 覆盖无 `details` 的合法 `ValidationIssue` 应通过。
   - 验证结果：定向复现显示 `ValidationIssueSchema.safeParse` 对无 `details` issue 返回 `success: true`。

2. Round 2 / Finding #1 — `details` 内部的 `undefined` 被 schema 接受，破坏 JSON-serializable / fixture-comparable 契约
   - 修复位置：`src/validation/issue-model.ts:60-90` 的递归检查不再把 nested `undefined` 当作安全原子值。
   - 测试位置：`test/contract-anchors.test.ts:158-181` 覆盖 object nested `undefined` 与 array `undefined` 均应失败。
   - 验证结果：定向复现显示 `details: { reason: undefined }` 与 `details: { reasons: ["schema-version", undefined] }` 均返回 `success: false`。

### 仍为非阻塞待办

无。

## 新发现

### 1. [高][新] `install` command 的 `targetProject` 未读取 project config name，违反 AC6

- **来源**：auditor+edge
- **分类**：patch

- **证据**
  - Story AC6 要求 `targetProject` 必须使用 trim 后非空的 project config name，缺失时才 fallback 到 target project directory basename：`_bmad-output/implementation-artifacts/stories/3-5-commandresult-and-validationissue-json-contract.md:52-58`。
  - 共享 helper 已实现 config-name 优先逻辑：`src/diagnostics/command-result.ts:262-273` 的 `resolveTargetProjectDisplayName` 会读取 `_speclite/config.toml` 并 trim `core.project_name`。
  - `status`、`validate`、`update` 已调用该 helper：`src/commands/status.ts:34-37`、`src/commands/validate.ts:37-40`、`src/commands/update.ts:43-46`。
  - `install` 没有调用该 helper。运行时 guard 失败路径使用 `runtime.targetProject ?? basename(cwd)`：`src/commands/install.ts:101-107`；主路径传给 `createInstallCommandContext` 的也是 `runtime.targetProject ?? normalizedTarget.targetProject`：`src/commands/install.ts:117-129`。`normalizedTarget.targetProject` 来自 target directory basename：`src/fs/path-normalizer.ts:30-34`。
  - 定向复现：
    ```text
    tempRoot/_speclite/config.toml:
    [core]
    project_name = " 项目 Install "

    runInstallCommand({ runtime: { cwd: tempRoot, nodeVersion: "v22.12.0", platform: "darwin", platformRelease: "23.0.0" } })
    ```
    实际结果：`targetProject` 为临时目录 basename（如 `speclite-install-target-name-kIXDiX`），不是 trim 后的 `项目 Install`。

- **影响**
  - `speclite install --json` 是 AC1 覆盖命令之一；它输出的 `CommandResult.targetProject` 与同一项目下 `status` / `validate` / `update` 的 display identifier 不一致。
  - 这会破坏 AC6 的 stable display identifier contract，也会让 fixture / automation 在已有 `_speclite/config.toml` 的项目中看到 checkout-root-dependent 的 target name。

- **建议**
  - 让 `runInstallCommand` 复用 `resolveTargetProjectDisplayName`，并在 normalized target directory 确定后统一生成 `targetProject`。
  - runtime guard 失败路径若需要在 target directory 归一化前返回，也应优先根据 target directory / config name 推导；至少补 focused test 覆盖 `install` 在存在 `_speclite/config.toml` 且 project name 含空白或非 ASCII 时输出 trim 后原文。
  - 修复边界只限 `install` targetProject display id，不要扩大到 Epic 4 update/repair 写入行为。

## 验证摘要

- `npm test -- test/contract-anchors.test.ts test/update-command.test.ts test/validate-command.test.ts` ✅ 通过（3 个 test files / 21 个 tests）。
- `npm test` ✅ 通过（25 个 test files / 152 个 tests）。
- `npm run build` ✅ 通过。
- `npm run lint` 未执行：`package.json` 未配置 `lint` 脚本。
- `git diff --check -- src/validation/issue-model.ts test/contract-anchors.test.ts src/diagnostics/command-result-schema.ts src/diagnostics/command-result.ts src/diagnostics/output.ts src/commands/install.ts src/commands/status.ts src/commands/update.ts src/commands/validate.ts test/update-command.test.ts test/validate-command.test.ts test/status-command.test.ts test/cli-smoke.test.ts _bmad-output/implementation-artifacts/code-reviews/3-5-code-review` ✅ 通过。
- 额外复核：
  - 无 `details` 的合法 `ValidationIssue`：`success === true`。
  - `details: { reason: undefined }`：`success === false`。
  - `details: { reasons: ["schema-version", undefined] }`：`success === false`。
  - unsafe path details：`success === false`。
  - `install` targetProject config-name 复现：当前输出目录 basename，确认新阻塞项有效。

## 通过项

- Round 1 optional `details` 缺失问题已修复。
- Round 2 nested `undefined` 非 JSON value 问题已修复。
- `ValidationIssue` redaction guard 仍拒绝 unsafe path / cache path details。
- `update` / `update.repair` command id、non-write placeholder payload、`update.conflicts` single command-level blocker、status/exit projection和 focused command tests 未见回归。
- `status.data.highLevelHealth` 与 `CommandResult.status` 独立性未见回归。

## 结论

- **结论：不通过**
- **阻塞项**：1 个。`install` command 未按 AC6 使用 project config name 作为 `targetProject`。
- **建议**：进入 evaluator 判定后由 fixer 做最小修复，限定为 `install` targetProject display id 与 focused test；不要扩大到 Epic 4 update/repair 行为，也不要修改 Story 文档或 owning SPEC。
