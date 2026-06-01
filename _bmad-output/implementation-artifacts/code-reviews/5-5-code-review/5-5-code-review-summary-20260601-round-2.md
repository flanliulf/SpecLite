---
Story: 5-5
Round: 2
Date: 2026-06-01
Model Used: GPT-5 Codex (gpt-5-codex)
Type: Code Review Summary
---

## 审查结论

本轮为复审。Agent 调度工具不可用，已按 skill fallback 在当前 reviewer 中串行执行 Blind Hunter、Edge Case Hunter、Acceptance Auditor 三层审查。Round 1 P1 已按 evaluator 指定边界修复：schema anchor 拒绝已授权 blocked plan，runtime apply gate 在 `writeAuthorized` 检查之后、operation lock 之前拒绝 blocked source，返回 redacted `source-integrity.blocked-source`，且 `changedPaths=[]`、no lock/no write。

focused tests、`npm test`、`npm run build` 均通过；项目 `package.json` 无 `lint` script，未运行 `npm run lint`。补充类型诊断 `npx tsc --noEmit` 失败，项目当前存在多处既有类型错误；其中本轮相关新增证据显示 `applyInstallPlan` 的 `writeAuthorized=false` 失败分支缺少失败结果契约中的 `changedPaths`。

结论：不通过。Round 1 P1 本身已修复，但发现 1 个新的低优先级 `patch` 项，需要补齐未授权 apply 失败结果形状，避免导出的 write boundary API 和 command caller 假设不一致。

四桶数量：`decision_needed=0`，`patch=1`，`defer=0`，`dismiss=0`。

## 上轮问题回顾

### 已修复

1. Round 1 / Finding #1 - 写入边界未直接拒绝 `trustStatus=blocked` 的 SourceDescriptor
   - `src/installer/install-plan-schema.ts:53-60` 已在 `InstallPlanSchema.superRefine` 中拒绝 `writeAuthorized=true` 且 `sourceDescriptor.trustStatus="blocked"` 的 install plan。
   - `test/contract-anchors.test.ts:231-267` 同时覆盖 `writeAuthorized=false` 的 blocked pending/unapplied plan anchor 仍可解析，以及 `writeAuthorized=true` 的 blocked plan 被拒绝且 issue path 指向 `sourceDescriptor.trustStatus`。
   - `src/installer/runtime-structure.ts:45-78` 已保持先检查 `writeAuthorized`，再在 `acquireProjectOperationLock` 之前拒绝 blocked descriptor。
   - `src/installer/runtime-structure.ts:320-333` 返回 redacted `source-integrity.blocked-source`，`details` 仅包含 `reason` 与 `sourceType`，不包含 `resolvedRoot`、raw URL、本机 absolute path、cache/temp/staging path、raw stderr 或 stack trace。
   - `test/runtime-structure.test.ts:425-507` 覆盖 direct `applyInstallPlan` runtime gate，断言 `changedPaths=[]`，且 `_speclite`、manifest/files index/config、lock 和 artifact root 均未创建。

### 仍为非阻塞待办

无。

## 新发现

### 1. [低][新] `writeAuthorized=false` 的 apply 失败分支没有返回 `changedPaths`

- **来源**：blind+edge
- **分类**：patch

- **证据**
  - `src/installer/runtime-structure.ts:27-33` 的 `ApplyInstallPlanResult` 失败分支现在要求 `changedPaths: string[]`。
  - `src/installer/runtime-structure.ts:45-61` 的 `writeAuthorized=false` 早退分支仍只返回 `ok`、`issue`、`completedSteps` 和 `pendingSteps`，缺少 `changedPaths: []`。
  - `src/commands/install.ts:1004-1015` 的 apply failure caller 已假设所有 apply failure 都有 `applyResult.changedPaths.length`。当前 main install path 会在未授权时更早停止，通常不会触发该分支；但 `applyInstallPlan` 是导出的 runtime write boundary API，直接调用或未来内部复用会得到不完整 failure shape。
  - 定向复核命令直接调用 `applyInstallPlan({ installPlan.writeAuthorized: false })`，结果为 `{"ok":false,...,"pendingSteps":[...]}`，没有 `changedPaths` 字段。
  - 补充 `npx tsc --noEmit` 输出也包含本轮相关错误：`src/installer/runtime-structure.ts(46,5)` 的返回对象缺少 required `changedPaths`。该命令同时暴露大量既有类型错误，因此不作为项目当前标准 gate，只作为本发现的辅助证据。

- **影响**
  - `writeAuthorized=false` runtime gate 本身仍保持 no lock/no write；因此不推翻 Round 1 P1 的修复。
  - 但失败结果形状不完整，和 fixer 新增的 `changedPaths` partial failure contract 不一致；若调用方进入该 branch 并按当前 caller 方式读取 `changedPaths.length`，会出现 runtime error。

- **建议**
  - 在 `src/installer/runtime-structure.ts:45-61` 的未授权早退结果中补 `changedPaths: []`。
  - 补一条小型 regression：direct `applyInstallPlan` with `writeAuthorized=false` 返回 `changedPaths=[]`，并继续断言 no lock/no write。

## 验证摘要

- `npm test -- test/contract-anchors.test.ts test/runtime-structure.test.ts` 通过（2 / 2 test files，15 / 15 tests）。
- `npm test -- test/source-descriptor-trust-reporting.test.ts test/source-and-modules.test.ts test/registry-source-resolution.test.ts test/local-source-integrity.test.ts test/git-source-resolution.test.ts test/status-command.test.ts test/validate-command.test.ts test/install-module-selection.test.ts test/install-progress-ready-summary.test.ts test/contract-anchors.test.ts test/runtime-structure.test.ts` 通过（11 / 11 test files，119 / 119 tests）。
- `npm test` 通过（34 / 34 test files，257 / 257 tests）。
- `npm run build` 通过（tsup ESM build success，DTS build success）。
- `npm run lint` 未运行：`package.json` scripts 中没有 `lint`。
- `npx tsx -e <direct applyInstallPlan writeAuthorized=false probe>` 执行成功，复现 failure result 缺少 `changedPaths`。
- `npx tsc --noEmit` 失败：项目当前有多处既有类型错误；本轮相关错误包括 `src/installer/runtime-structure.ts(46,5)` missing required `changedPaths`。

## 通过项

- Round 1 P1 schema anchor 已修复，且没有破坏 `writeAuthorized=false` 的 blocked pending/unapplied plan anchor。
- Round 1 P1 runtime gate 已修复：blocked source 在 write authorization 检查之后、operation lock 之前返回 redacted `source-integrity.blocked-source`，`changedPaths=[]`，未创建 lock、runtime 目录、manifest/index/config 或 artifact root。
- Story 5.4 `TODO-004` 修复仍有效：`src/diagnostics/output.ts:508-513` 不再固定输出 `pending`，resolved Git install human output 测试覆盖 `confirmationState=confirmed`；未确认 Git source 测试仍断言 `confirmationState=pending` 且不调用 Git client。
- `status` / `validate` local-only 边界仍由相关 focused tests 覆盖；未发现新增 registry/Git remote/local origin/cache/provenance 访问。
- 未发现越界实现 Epic 6 full fixture matrix、source lock lifecycle、enterprise policy/signatures/provenance 或 Post-MVP commands。

## 结论

- **结论：不通过**
- **阻塞项**：无新的高/中优先级阻塞项；Round 1 P1 已修复。
- **建议**：进入 evaluator 复核本轮低优先级新 `patch`。若 evaluator 确认为需修复，fixer 只需补齐 `writeAuthorized=false` apply failure 的 `changedPaths: []` 与定向 regression，不应扩大到 resolver、update、Epic 6 fixture matrix 或 source lock lifecycle。
