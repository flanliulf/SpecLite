---
Story: 3-5
Round: 4
Date: 2026-05-29
Model Used: GPT-5 Codex (codex)
Type: Code Review Summary
---

## 审查结论

本轮为复审。Agent 工具在当前环境不可用，本轮按 `bmenhance-cr-01-reviewer` 降级规则由当前模型串行执行 Blind Hunter、Edge Case Hunter、Acceptance Auditor 三层复审。Round 1、Round 2、Round 3 三个 P1 均已修复且未发现回归：optional `details` 缺省通过，nested `undefined` 被拒绝，`install` 的 `targetProject` 已复用 config-name 优先 helper。focused tests、全量 `npm test`、`npm run build` 与定向 `git diff --check` 均通过。本轮建议：通过。

## 上轮问题回顾

### 已修复

1. Round 1 / Finding #1 — `ValidationIssue.details` 被声明为可选但缺失时会被 redaction guard 判为 unsafe
   - 修复位置：`src/validation/issue-model.ts:55-58` 在 `findUnsafeIssueValue` root 入口允许 optional 字段缺省。
   - 测试位置：`test/contract-anchors.test.ts:135-144` 覆盖无 `details` 的合法 `ValidationIssue` 应通过。
   - 验证结果：定向复现显示无 `details` issue 返回 `success: true`。

2. Round 2 / Finding #1 — `details` 内部的 `undefined` 被 schema 接受，破坏 JSON-serializable / fixture-comparable 契约
   - 修复位置：`src/validation/issue-model.ts:60-90` 的递归检查不再把 nested `undefined` 当作安全原子值。
   - 测试位置：`test/contract-anchors.test.ts:158-181` 覆盖 object nested `undefined` 与 array `undefined` 均应失败。
   - 验证结果：定向复现显示 `details: { reason: undefined }` 与 `details: { reasons: ["schema-version", undefined] }` 均返回 `success: false`。

3. Round 3 / Finding #1 — `install` command 的 `targetProject` 未读取 project config name，违反 AC6
   - 修复位置：`src/commands/install.ts:102-110` 在 target directory 归一化后调用 `resolveTargetProjectDisplayName`；`src/commands/install.ts:130-139` 后续 install context 复用同一 `targetProject`。
   - Helper 证据：`src/diagnostics/command-result.ts:262-272` 优先读取 trim 后 config project name，再 fallback 到 explicit runtime name 和 target directory basename；`src/diagnostics/command-result.ts:387-391` 从 `_speclite/config.toml` 读取 `core.project_name` 并过滤空白值。
   - 测试位置：`test/config-initialization.test.ts:290-365` 覆盖 install config name 优先与 missing / empty / blank config name fallback。
   - 验证结果：定向复现显示 supported path 与 runtime guard failure path 都输出 `项目 Install`，且 runtime guard failure exit code 为 `1`。

### 仍为非阻塞待办

无。

## 新发现

本轮未发现新的阻塞项或中高优先级问题。

## 验证摘要

- `npx vitest run test/contract-anchors.test.ts test/config-initialization.test.ts test/update-command.test.ts test/status-command.test.ts test/validate-command.test.ts test/cli-smoke.test.ts` 通过：6 files / 44 tests。
- `npm test` 通过：25 files / 154 tests。
- `npm run build` 通过：ESM 与 DTS build 均成功。
- `git diff --check -- <Story 3.5 相关文件>` 通过：无 whitespace error。
- 额外复核：
  - `install` 在 `_speclite/config.toml` 中存在 `project_name = " 项目 Install "` 且 runtime 显式传入 `targetProject: "explicit-name"` 时，输出 `targetProject === "项目 Install"`。
  - `install` runtime guard failure 路径同样输出 `targetProject === "项目 Install"`，且 `exitCode === 1`。
  - 无 `details` 的合法 `ValidationIssue`：`success === true`。
  - `details: { reason: undefined }`：`success === false`。
  - `details: { reasons: ["schema-version", undefined] }`：`success === false`。

## 通过项

- AC1 / Task 2 / Task 7：covered command envelope、top-level allowlist、command-specific data payload 和 fixture consumer schema 仍由 `src/diagnostics/command-result-schema.ts` 与 `src/fixtures/fixture-contract.ts` 统一锚定。
- AC2 / AC3 / AC4 / Task 4：status/exit projection、update conflict single blocker 与 status health 独立性已由 shared helper 和 focused tests 覆盖。
- AC5 / AC8 / Task 6：Structured JSON 与 human-readable output 共享 `CommandResult` semantic source，Structured renderer 不加入展示装饰。
- AC6 / Task 5：`install`、`status`、`validate`、`update` 均通过 `resolveTargetProjectDisplayName` 使用 config-name 优先的 stable target display identifier；`update --repair` command id 保持 `update.repair`。
- AC7 / Task 3：optional `details` root 缺省与 nested non-JSON value 边界已同时覆盖，redaction guard 仍拒绝 unsafe path/cache path details。
- AC9 / Task 5 / Task 8：public paths、checked arrays、conflicts 和 plan actions 的排序/路径策略仍有 focused tests 覆盖。
- Scope Boundary：`update` / `update.repair` 仍为 Epic 4 前 non-write placeholder，未扩展到真实 update plan、conflict detector、operation lock、repair apply 或 safe write。

## 结论

- **结论：通过**
- **阻塞项**：无。
- **建议**：可进入后续 evaluator 进行独立通过确认；本轮 reviewer 不执行 evaluator/fixer/finalizer，不 commit，不 push。
