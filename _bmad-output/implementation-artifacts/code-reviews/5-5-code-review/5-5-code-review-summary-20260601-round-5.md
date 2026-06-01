---
Story: 5-5
Round: 5
Date: 2026-06-01
Model Used: GPT-5 Codex (gpt-5-codex)
Type: Code Review Summary
---

## 审查结论

本轮为复审。Agent 调度工具不可用，已按 skill fallback 在当前 reviewer 中串行执行 Blind Hunter、Edge Case Hunter、Acceptance Auditor 三层审查。Round 1 blocked source schema/runtime write gate 未回退；Round 2 unauthorized direct apply failure shape `changedPaths=[]` 未回退；Round 3 `runtime-structure.ts` / `runtime-structure.test.ts` touched-file diagnostics 未回退；Round 4 `src/ide/target-writer.ts` optional callback 显式 `undefined` 诊断已修复。

focused tests、Story 5.5 相关 suite、全量 `npm test`、`npm run build` 和相关文件 `git diff --check` 均通过；项目 `package.json` 无 `lint` script，未运行 `npm run lint`。补充 `npx tsc --noEmit --pretty false` 仍因全仓既有类型债务失败；过滤 `src/ide/target-writer.ts`、`src/installer/runtime-structure.ts`、`test/runtime-structure.test.ts` 后无输出，但按本轮要求扩大到 Story 5.5 source/diagnostics/validation touched surface 后仍存在 `src/validation/validate-project.ts`、`test/git-source-resolution.test.ts`、`test/validate-command.test.ts` 相关诊断。

结论：不通过。未发现新的高/中优先级运行时阻塞项；但 Story 5.5 touched validation/test surface 的 typecheck 复核仍未清零，新增 1 个低优先级 `patch`，需要 evaluator 裁决是否进入下一轮 fixer。

四桶数量：`decision_needed=0`，`patch=1`，`defer=0`，`dismiss=0`。

## 上轮问题回顾

### 已修复

1. Round 1 / Finding #1 - 写入边界未直接拒绝 `trustStatus=blocked` 的 SourceDescriptor
   - `src/installer/install-plan-schema.ts:53-60` 仍在 `InstallPlanSchema.superRefine` 中拒绝 `writeAuthorized=true` 且 `sourceDescriptor.trustStatus="blocked"` 的 install plan。
   - `src/installer/runtime-structure.ts:65-78` 仍在 `writeAuthorized` 检查之后、`acquireProjectOperationLock` 之前拒绝 blocked descriptor。
   - blocked failure 仍返回 redacted `source-integrity.blocked-source`，未输出 `resolvedRoot`、raw URL、本机 absolute path、cache/temp/staging path、raw stderr 或 stack trace。
   - `test/runtime-structure.test.ts` direct blocked apply regression 继续由 focused tests 覆盖，断言 `changedPaths=[]`、`completedSteps=[]`、pending steps、no lock/no write 和无本机路径泄漏。

2. Round 2 / Finding #1 - `writeAuthorized=false` apply failure branch 缺少 `changedPaths: []`
   - `src/installer/runtime-structure.ts:45-62` 的未授权 early return 仍返回 `changedPaths: []`。
   - `test/runtime-structure.test.ts` unauthorized direct apply regression 继续由 focused tests 覆盖，断言 failure、`changedPaths=[]`、`completedSteps=[]`、pending steps 和 no lock/no write。

3. Round 3 / Finding #1 - touched files 在补充 `tsc --noEmit` 下仍有 `runtime-structure` / direct test 类型诊断
   - `src/installer/runtime-structure.ts:303-319` 已使用 `const details = issue.details ?? {}` 后再拼接 `manualAction`，不再直接访问 optional `issue.details.manualAction`。
   - `test/runtime-structure.test.ts` 的 direct apply descriptor 已显式声明为 `SourceDescriptor`，不再把 `integrityEvidence: []` 推导为 readonly tuple。
   - 定向过滤 `npx tsc --noEmit --pretty false 2>&1 | rg "(src/installer/runtime-structure\\.ts|test/runtime-structure\\.test\\.ts)"` 无输出，确认 Round 3 评估点未回退。

4. Round 4 / Finding #1 - `writeIdeMirrors` 在 `exactOptionalPropertyTypes` 下向 optional callback 传入显式 `undefined`
   - `src/ide/target-writer.ts:92-98` 调用 `copyCanonicalPackage` 时使用条件展开，仅当 `input.onChangedPath !== undefined` 时传入 `onChangedPath`。
   - 定向过滤 `npx tsc --noEmit --pretty false 2>&1 | rg "(src/ide/target-writer\\.ts|src/installer/runtime-structure\\.ts|test/runtime-structure\\.test\\.ts)"` 无输出，确认 Round 4 诊断已消失。

### 仍为非阻塞待办

无。

## 新发现

### 1. [低][新] Story 5.5 validation/test touched surface 在补充 `tsc --noEmit` 过滤下仍有相关诊断

- **来源**：blind+edge
- **分类**：patch

- **证据**
  - `src/validation/validate-project.ts:105-107` 在 Story 5.5 新增 source-integrity validate projection 时，将 `manifestSchemaResult.manifest` 传给 `validateSourceIntegrity`。当前 guard 只检查 issues、skillIndex/helpIndex/filesIndex/phaseCoverage，未显式窄化 `manifest`；`tsc` 报告 `src/validation/validate-project.ts(106,7)` 仍存在 manifest 类型不匹配 / 可能为 `undefined` 的诊断。该文件同一 guard 下的 `manifest` 既有访问在 `tsc` 中也继续报 `src/validation/validate-project.ts(58,7)`、`(87,23)`、`(99,21)`。
  - `test/git-source-resolution.test.ts:333` 与 `test/git-source-resolution.test.ts:340` 的 mocked `gitClient` 只提供 `lsRemote`，但当前 `GitClient` 类型要求 `verifyCommit`；`tsc` 输出 `TS2741: Property 'verifyCommit' is missing`。
  - `test/validate-command.test.ts:85` 将 `outputs[0]` 直接传给 `renderCommandResultJson`；在当前 typecheck 配置下 `outputs[0]` 可能为 `undefined`，`tsc` 输出 `Type 'undefined' is not assignable`。
  - 这些诊断不影响当前 `npm test` 与 `npm run build`，但出现在本轮要求额外复核的 Story 5.5 source/diagnostics/validation/test touched surface 中；不应把它们与已清除的 `target-writer.ts` / `runtime-structure.ts` 诊断混为一谈。

- **影响**
  - Runtime 行为、blocked source no-lock/no-write、redaction、status/validate local-only 与 human output confirmed 断言仍由测试覆盖并通过。
  - 但 Story 5.5 touched surface 的 typecheck 复核仍未清零；后续 reviewer/evaluator 继续用 `npx tsc --noEmit --pretty false` 区分全仓既有债务与本 Story 相关诊断时，这些 validation/test 诊断会持续污染结果。

- **建议**
  - evaluator 应先裁决哪些诊断属于 Story 5.5 必修 touched-surface 缺口，哪些是全仓既有 typecheck 债务。
  - 若进入 fixer，修复边界应保持最小：只处理 `src/validation/validate-project.ts` 的 manifest 窄化 / source-integrity 调用类型、相关 Git test mock 的 `verifyCommit` 类型补齐，以及 `test/validate-command.test.ts` 中 `outputs[0]` 的非空断言或稳定取值方式。
  - 不应扩大到全仓 `tsc --noEmit` 债务、resolver 重写、install/update command flow、Epic 6 fixture matrix、source lock lifecycle、Story 文档正文或 CR finalizer。

## 验证摘要

- `npm test -- test/runtime-structure.test.ts test/contract-anchors.test.ts` ✅ 通过（2 / 2 test files，16 / 16 tests）。
- `npm test -- test/source-descriptor-trust-reporting.test.ts test/source-and-modules.test.ts test/registry-source-resolution.test.ts test/local-source-integrity.test.ts test/git-source-resolution.test.ts test/status-command.test.ts test/validate-command.test.ts test/install-module-selection.test.ts test/install-progress-ready-summary.test.ts test/contract-anchors.test.ts test/runtime-structure.test.ts` ✅ 通过（11 / 11 test files，120 / 120 tests）。
- `npm test` ✅ 通过（34 / 34 test files，258 / 258 tests）。
- `npm run build` ✅ 通过（tsup ESM 与 DTS build success）。
- `npm run lint` 未运行：`package.json` scripts 中没有 `lint`。
- `npx tsc --noEmit --pretty false` ❌ 失败：仍有全仓既有类型错误；过滤 `src/ide/target-writer.ts`、`src/installer/runtime-structure.ts`、`test/runtime-structure.test.ts` 后无输出；扩大过滤 Story 5.5 source/diagnostics/validation/test touched surface 后仍输出 `src/validation/validate-project.ts`、`test/git-source-resolution.test.ts`、`test/validate-command.test.ts` 相关诊断。
- `git diff --check -- src/bin/speclite.ts src/commands/install.ts src/diagnostics/output.ts src/fs/copy-tree.ts src/ide/target-writer.ts src/installer/install-plan-schema.ts src/installer/runtime-structure.ts src/source/source-descriptor-schema.ts src/source/source-discovery.ts src/validation/issue-model.ts src/validation/validate-project.ts src/validation/rules/source-integrity.ts test/contract-anchors.test.ts test/install-module-selection.test.ts test/install-progress-ready-summary.test.ts test/runtime-structure.test.ts test/source-and-modules.test.ts test/status-command.test.ts test/validate-command.test.ts` ✅ 通过。
- `git diff --check --no-index -- /dev/null test/git-source-resolution.test.ts` 无 whitespace error 输出；命令因 no-index 差异本身返回 1。

## 通过项

- Round 1 blocked source gate 未回退：schema anchor 拒绝已授权 blocked plan；runtime apply 在获取 operation lock 前返回 redacted `source-integrity.blocked-source`，`changedPaths=[]`，未创建 lock、runtime 目录、manifest/index/config 或 artifact root。
- Round 2 unauthorized apply failure shape 未回退：`writeAuthorized=false` direct apply 返回 failure、`changedPaths=[]`、`completedSteps=[]` 和完整 pending steps，并保持 no lock/no write。
- Round 3 原始 touched-file 诊断未回退：`runtime-structure.ts` optional details 访问安全，direct apply descriptor 不再产生 readonly `integrityEvidence` 推导。
- Round 4 optional callback 诊断已修复：`target-writer.ts` 不再向 `copyCanonicalPackage` 传入显式 `undefined` 的 optional `onChangedPath`。
- Redaction 边界未见回退：blocked source issue details 仅含 `reason` 与 `sourceType`；partial changed paths 为 project-relative paths；验证输出未显示 credential、private URL/query、home/absolute/cache/temp/staging/Git checkout/raw stderr/stack trace。
- Story 5.4 `TODO-004` human output confirmed 状态仍有效：`src/diagnostics/output.ts:508-513` 基于 evidence/version/contentHash 显示 `confirmationState=confirmed`，相关 tests 覆盖 resolved Git install confirmed 与 unconfirmed pending 分支。
- `status` / `validate` local-only 边界仍由相关 focused tests 覆盖；未发现新增 registry/Git remote/local origin/cache/provenance 访问。
- 未发现越界实现 Epic 6 full fixture matrix、source lockfile lifecycle、enterprise policy/signatures/provenance 或 Post-MVP commands。

## 结论

- **结论：不通过**
- **阻塞项**：无新的高/中优先级运行时阻塞项；新增 1 个低优先级 `patch`。
- **建议**：进入 evaluator 复核本轮低优先级新发现。若 evaluator 确认为需修复，fixer 只应清理 Story 5.5 validation/test touched-surface typecheck 诊断，不应扩大到全仓既有 `npx tsc --noEmit` 债务或 Epic 6 范围。
