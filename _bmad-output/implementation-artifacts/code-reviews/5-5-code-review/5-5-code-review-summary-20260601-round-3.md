---
Story: 5-5
Round: 3
Date: 2026-06-01
Model Used: GPT-5 Codex (gpt-5-codex)
Type: Code Review Summary
---

## 审查结论

本轮为复审。Agent 调度工具不可用，已按 skill fallback 在当前 reviewer 中串行执行 Blind Hunter、Edge Case Hunter、Acceptance Auditor 三层审查。Round 1 P1 的 blocked source schema/runtime write gate 仍有效；Round 2 P1 的 `writeAuthorized=false` apply failure shape 已补齐 `changedPaths=[]`，并有 direct regression 覆盖 no lock/no write。

focused tests、Story 5.5 相关测试、全量 `npm test`、`npm run build` 和白名单 `git diff --check` 均通过；项目 `package.json` 无 `lint` script，未运行 `npm run lint`。补充 `npx tsc --noEmit` 仍失败，且本轮 touched 文件仍有相关类型诊断。

结论：不通过。未发现新的高/中优先级阻塞项，Story 行为门禁和 build/test 通过；但发现 1 个低优先级 `patch`，需要 evaluator 裁决是否在下一轮 fixer 中清理 touched-file 类型诊断。

四桶数量：`decision_needed=0`，`patch=1`，`defer=0`，`dismiss=0`。

## 上轮问题回顾

### 已修复

1. Round 1 / Finding #1 - 写入边界未直接拒绝 `trustStatus=blocked` 的 SourceDescriptor
   - `src/installer/install-plan-schema.ts:53-60` 仍在 `InstallPlanSchema.superRefine` 中拒绝 `writeAuthorized=true` 且 `sourceDescriptor.trustStatus="blocked"` 的 install plan。
   - `src/installer/runtime-structure.ts:65-78` 仍在 `writeAuthorized` 检查之后、`acquireProjectOperationLock` 之前拒绝 blocked descriptor。
   - `src/installer/runtime-structure.ts:321-333` 的 blocked issue 只包含 `reason` 与 `sourceType`，未输出 `resolvedRoot`、raw URL、本机 absolute path、cache/temp/staging path、raw stderr 或 stack trace。
   - `test/runtime-structure.test.ts:507-589` 覆盖 direct blocked apply，断言 `source-integrity.blocked-source`、`changedPaths=[]`、`completedSteps=[]`、pending steps、no lock/no write 和无本机路径泄漏。

2. Round 2 / Finding #1 - `writeAuthorized=false` apply failure branch 缺少 `changedPaths: []`
   - `src/installer/runtime-structure.ts:45-62` 的未授权 early return 已补 `changedPaths: []`。
   - `test/runtime-structure.test.ts:425-505` 新增 direct unauthorized apply regression，断言 failure、`changedPaths=[]`、`completedSteps=[]`、pending steps 和 no lock/no write。
   - `src/commands/install.ts:1004-1015` 的 failure caller 读取 `applyResult.changedPaths.length`，当前 direct apply failure shape 已满足该 contract。

### 仍为非阻塞待办

无。

## 新发现

### 1. [低][新] touched files 在补充 `tsc --noEmit` 下仍有类型诊断

- **来源**：blind+edge
- **分类**：patch

- **证据**
  - `npx tsc --noEmit` 失败。项目仍有大量既有类型错误，但本轮 touched 文件中仍有相关诊断。
  - `src/installer/runtime-structure.ts:303-317` 的 `addPartialFailureChangedPaths` 在读取 `issue.details.manualAction` 时没有先处理 `details` 可选性；`ValidationIssueSchema` 将 `details` 定义为 optional，见 `src/diagnostics/command-result-schema.ts:21-33`。本次类型诊断包含 `src/installer/runtime-structure.ts(314,16)` 与 `(315,16)`：`issue.details` is possibly `undefined`。
  - `test/runtime-structure.test.ts:427-431` 与 `:509-513` 使用 `as const` 构造 descriptor，导致 `integrityEvidence` 推导为 readonly `[]`；`SourceDescriptorSchema` 的类型要求 mutable array，见 `src/source/source-descriptor-schema.ts:52-61`。本次类型诊断包含 `test/runtime-structure.test.ts(438,9)`、`(440,11)`、`(520,9)`、`(522,11)`。

- **影响**
  - 当前 `npm test` 与 `npm run build` 仍通过，因此这不是当前标准 gate 的运行时失败。
  - 但 touched source 的 optional details 访问会让 future partial write failure 在遇到无 `details` 的 `ValidationIssue` 时存在 structured failure 退化为 thrown error 的风险。
  - 新增 tests 的 readonly array 类型诊断会继续污染后续 typecheck 复检，降低下一轮 reviewer 对真实类型回归的判读信噪比。

- **建议**
  - 在 `addPartialFailureChangedPaths` 中使用 `const details = issue.details ?? {}` 和 optional access 处理 `manualAction`，保持 public issue shape 不变。
  - 在 direct apply regression 中去掉 `as const` 或显式声明为 `SourceDescriptor` / 使用 mutable `integrityEvidence: []`，只修测试类型，不改变断言语义。
  - 不扩大到 resolver、install/update command flow、Epic 6 fixture matrix、source lock lifecycle 或全仓既有 `tsc --noEmit` 债务。

## 验证摘要

- `npm test -- test/runtime-structure.test.ts test/contract-anchors.test.ts` ✅ 通过（2 / 2 test files，16 / 16 tests）。
- `npm test -- test/source-descriptor-trust-reporting.test.ts test/source-and-modules.test.ts test/registry-source-resolution.test.ts test/local-source-integrity.test.ts test/git-source-resolution.test.ts test/status-command.test.ts test/validate-command.test.ts test/install-module-selection.test.ts test/install-progress-ready-summary.test.ts test/contract-anchors.test.ts test/runtime-structure.test.ts` ✅ 通过（11 / 11 test files，120 / 120 tests）。
- `npm test` ✅ 通过（34 / 34 test files，258 / 258 tests）。
- `npm run build` ✅ 通过（tsup ESM build success，DTS build success）。
- `npm run lint` 未运行：`package.json` scripts 中没有 `lint`。
- `npx tsc --noEmit` ❌ 失败：项目存在多处既有类型错误；本轮相关 touched-file 诊断见新发现 #1。
- `git diff --check -- src/installer/runtime-structure.ts src/installer/install-plan-schema.ts test/runtime-structure.test.ts test/contract-anchors.test.ts _bmad-output/implementation-artifacts/code-reviews/5-5-code-review/5-5-code-review-evaluation-20260601-round-2.md _bmad-output/implementation-artifacts/code-reviews/5-5-code-review/PLAN.md _bmad-output/implementation-artifacts/code-reviews/5-5-code-review/EXPERIMENTS.md _bmad-output/implementation-artifacts/code-reviews/5-5-code-review/EXPERIMENT_NOTES.md` ✅ 通过。

## 通过项

- Round 1 blocked source gate 未回退：schema anchor 拒绝已授权 blocked plan；runtime apply 在获取 operation lock 前返回 redacted `source-integrity.blocked-source`，`changedPaths=[]`，未创建 lock、runtime 目录、manifest/index/config 或 artifact root。
- Round 2 unauthorized apply failure shape 已补齐：`writeAuthorized=false` direct apply 返回 failure、`changedPaths=[]`、`completedSteps=[]` 和完整 pending steps，并保持 no lock/no write。
- Redaction 边界未见回退：blocked source issue details 仅含 `reason` 与 `sourceType`；partial changed paths 为 project-relative paths；验证输出未显示 credential、private URL/query、home/absolute/cache/temp/staging/Git checkout/raw stderr/stack trace。
- Story 5.4 `TODO-004` human output confirmed 状态仍有效：`src/diagnostics/output.ts:508-513` 基于 evidence/version/contentHash 显示 `confirmationState=confirmed`，相关 test 覆盖 resolved Git install confirmed 与 unconfirmed pending 分支。
- `status` / `validate` local-only 边界仍由相关 focused tests 覆盖；未发现新增 registry/Git remote/local origin/cache/provenance 访问。
- 未发现越界实现 Epic 6 full fixture matrix、source lockfile lifecycle、enterprise policy/signatures/provenance 或 Post-MVP commands。

## 结论

- **结论：不通过**
- **阻塞项**：无新的高/中优先级阻塞项；新增 1 个低优先级 `patch`。
- **建议**：进入 evaluator 复核本轮低优先级新发现。若 evaluator 确认为需修复，fixer 只应清理 touched-file type diagnostics，不应扩大到全仓 `tsc --noEmit` 既有债务或 Epic 6 范围。
