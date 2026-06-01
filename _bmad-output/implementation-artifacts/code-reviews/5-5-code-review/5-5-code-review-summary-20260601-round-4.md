---
Story: 5-5
Round: 4
Date: 2026-06-01
Model Used: GPT-5 Codex (gpt-5-codex)
Type: Code Review Summary
---

## 审查结论

本轮为复审。Agent 调度工具不可用，已按 skill fallback 在当前 reviewer 中串行执行 Blind Hunter、Edge Case Hunter、Acceptance Auditor 三层审查。Round 1 blocked source schema/runtime write gate 未回退；Round 2 unauthorized direct apply failure shape `changedPaths=[]` 未回退；Round 3 指出的 `src/installer/runtime-structure.ts` optional `details` 与 `test/runtime-structure.test.ts` readonly descriptor 诊断已消失。

focused tests、Story 5.5 相关 suite、全量 `npm test`、`npm run build` 和白名单 `git diff --check` 均通过；项目 `package.json` 无 `lint` script，未运行 `npm run lint`。补充 `npx tsc --noEmit --pretty false` 仍因全仓既有类型债务失败，但复核发现当前 touched file 中仍有 1 个 Story 5.5 相关类型诊断：`src/ide/target-writer.ts` 向 optional `onChangedPath` 传入显式 `undefined`。

结论：不通过。未发现新的高/中优先级运行时阻塞项；但 touched-file typecheck 仍未完全清零，新增 1 个低优先级 `patch`，需要 evaluator 裁决是否进入下一轮 fixer。

四桶数量：`decision_needed=0`，`patch=1`，`defer=0`，`dismiss=0`。

## 上轮问题回顾

### 已修复

1. Round 1 / Finding #1 - 写入边界未直接拒绝 `trustStatus=blocked` 的 SourceDescriptor
   - `src/installer/install-plan-schema.ts:53-60` 仍在 `InstallPlanSchema.superRefine` 中拒绝 `writeAuthorized=true` 且 `sourceDescriptor.trustStatus="blocked"` 的 install plan。
   - `src/installer/runtime-structure.ts:65-78` 仍在 `writeAuthorized` 检查之后、`acquireProjectOperationLock` 之前拒绝 blocked descriptor。
   - `src/installer/runtime-structure.ts:322-334` 的 blocked issue 只包含 `reason` 与 `sourceType`，未输出 `resolvedRoot`、raw URL、本机 absolute path、cache/temp/staging path、raw stderr 或 stack trace。
   - `test/runtime-structure.test.ts:508-590` 覆盖 direct blocked apply，断言 `source-integrity.blocked-source`、`changedPaths=[]`、`completedSteps=[]`、pending steps、no lock/no write 和无本机路径泄漏。

2. Round 2 / Finding #1 - `writeAuthorized=false` apply failure branch 缺少 `changedPaths: []`
   - `src/installer/runtime-structure.ts:45-62` 的未授权 early return 仍返回 `changedPaths: []`。
   - `test/runtime-structure.test.ts:426-505` 覆盖 unauthorized direct apply regression，断言 failure、`changedPaths=[]`、`completedSteps=[]`、pending steps 和 no lock/no write。

3. Round 3 / Finding #1 - touched files 在补充 `tsc --noEmit` 下仍有类型诊断
   - `src/installer/runtime-structure.ts:303-319` 已使用 `const details = issue.details ?? {}` 后再拼接 `manualAction`，不再直接访问 optional `issue.details.manualAction`。
   - `test/runtime-structure.test.ts:428-433` 与 `test/runtime-structure.test.ts:510-515` 的 direct apply descriptor 已显式声明为 `SourceDescriptor`，不再把 `integrityEvidence: []` 推导为 readonly tuple。
   - 定向过滤 `npx tsc --noEmit --pretty false 2>&1 | rg "(src/installer/runtime-structure\\.ts|test/runtime-structure\\.test\\.ts)"` 无输出，确认 Round 3 评估点已清理。

### 仍为非阻塞待办

无。

## 新发现

### 1. [低][新] `writeIdeMirrors` 在 `exactOptionalPropertyTypes` 下向 optional callback 传入显式 `undefined`

- **来源**：blind+edge
- **分类**：patch

- **证据**
  - `src/ide/target-writer.ts:33-41` 将 `onChangedPath` 定义为 optional callback。
  - `src/ide/target-writer.ts:92-98` 调用 `copyCanonicalPackage` 时总是传入 `onChangedPath: input.onChangedPath`。当 caller 未提供 callback 时，该对象属性值为显式 `undefined`。
  - `src/fs/copy-tree.ts:11-16` 的 `copyCanonicalPackage` 输入同样将 `onChangedPath` 定义为 optional callback；在 `exactOptionalPropertyTypes: true` 下，optional property 不能接收显式 `undefined`，除非类型包含 `undefined`。
  - 补充定向过滤命令输出：`src/ide/target-writer.ts(92,47): error TS2379 ... onChangedPath: ((relativePath: string) => void) | undefined is not assignable to ... onChangedPath?: (relativePath: string) => void`。

- **影响**
  - 当前 `npm test` 与 `npm run build` 仍通过，且不影响 Round 1 / Round 2 / Round 3 已修复的 runtime write gates。
  - 但 `src/ide/target-writer.ts` 是当前 Story 5.5 touched file，且该诊断由本轮 `onChangedPath` changed-path tracking API 引入；因此 touched-file typecheck 相关诊断仍未完全消失。
  - 后续 reviewer/evaluator 继续用 `npx tsc --noEmit --pretty false` 区分全仓既有债务时，该诊断会持续污染 Story 5.5 touched-file 复核结果。

- **建议**
  - 在 `writeIdeMirrors` 调用 `copyCanonicalPackage` 时按 `runtime-structure.ts` 现有写法使用条件展开：仅当 `input.onChangedPath !== undefined` 时传入 `{ onChangedPath: input.onChangedPath }`。
  - 或调整 `copyCanonicalPackage` 输入类型显式允许 `onChangedPath?: ((relativePath: string) => void) | undefined`；但更保守的修复是避免传递显式 `undefined`。
  - 不应扩大到全仓 `tsc --noEmit` 既有债务，也不应改动 resolver、install/update command flow、Epic 6 fixture matrix、source lock lifecycle 或 Story 文档正文。

## 验证摘要

- `npm test -- test/runtime-structure.test.ts test/contract-anchors.test.ts` ✅ 通过（2 / 2 test files，16 / 16 tests）。
- `npm test -- test/source-descriptor-trust-reporting.test.ts test/source-and-modules.test.ts test/registry-source-resolution.test.ts test/local-source-integrity.test.ts test/git-source-resolution.test.ts test/status-command.test.ts test/validate-command.test.ts test/install-module-selection.test.ts test/install-progress-ready-summary.test.ts test/contract-anchors.test.ts test/runtime-structure.test.ts` ✅ 通过（11 / 11 test files，120 / 120 tests）。
- `npm test` ✅ 通过（34 / 34 test files，258 / 258 tests）。
- `npm run build` ✅ 通过（tsup ESM 与 DTS build success）。
- `npm run lint` 未运行：`package.json` scripts 中没有 `lint`。
- `npx tsc --noEmit --pretty false` ❌ 失败：仍有全仓既有类型错误；Round 3 指出的 `src/installer/runtime-structure.ts` 与 `test/runtime-structure.test.ts` 诊断已消失，但本轮发现 `src/ide/target-writer.ts(92,47)` 仍为 Story 5.5 touched-file 相关诊断。
- `git diff --check -- src/installer/runtime-structure.ts src/installer/install-plan-schema.ts src/ide/target-writer.ts src/fs/copy-tree.ts test/runtime-structure.test.ts test/contract-anchors.test.ts test/source-descriptor-trust-reporting.test.ts test/source-and-modules.test.ts test/registry-source-resolution.test.ts test/local-source-integrity.test.ts test/git-source-resolution.test.ts test/status-command.test.ts test/validate-command.test.ts test/install-module-selection.test.ts test/install-progress-ready-summary.test.ts` ✅ 通过。

## 通过项

- Round 1 blocked source gate 未回退：schema anchor 拒绝已授权 blocked plan；runtime apply 在获取 operation lock 前返回 redacted `source-integrity.blocked-source`，`changedPaths=[]`，未创建 lock、runtime 目录、manifest/index/config 或 artifact root。
- Round 2 unauthorized apply failure shape 未回退：`writeAuthorized=false` direct apply 返回 failure、`changedPaths=[]`、`completedSteps=[]` 和完整 pending steps，并保持 no lock/no write。
- Round 3 touched-file 诊断的原始两处评估点已修复：`runtime-structure.ts` optional details 访问安全，两个 direct apply descriptor 不再产生 readonly `integrityEvidence` 推导。
- Redaction 边界未见回退：blocked source issue details 仅含 `reason` 与 `sourceType`；partial changed paths 为 project-relative paths；验证输出未显示 credential、private URL/query、home/absolute/cache/temp/staging/Git checkout/raw stderr/stack trace。
- Story 5.4 `TODO-004` human output confirmed 状态仍有效：`src/diagnostics/output.ts:508-513` 基于 evidence/version/contentHash 显示 `confirmationState=confirmed`，相关 tests 覆盖 resolved Git install confirmed 与 unconfirmed pending 分支。
- `status` / `validate` local-only 边界仍由相关 focused tests 覆盖；未发现新增 registry/Git remote/local origin/cache/provenance 访问。
- 未发现越界实现 Epic 6 full fixture matrix、source lockfile lifecycle、enterprise policy/signatures/provenance 或 Post-MVP commands。

## 结论

- **结论：不通过**
- **阻塞项**：无新的高/中优先级运行时阻塞项；新增 1 个低优先级 `patch`。
- **建议**：进入 evaluator 复核本轮低优先级新发现。若 evaluator 确认为需修复，fixer 只应清理 `src/ide/target-writer.ts` 的 optional callback typecheck 诊断，不应扩大到全仓既有 `npx tsc --noEmit` 债务或 Epic 6 范围。
