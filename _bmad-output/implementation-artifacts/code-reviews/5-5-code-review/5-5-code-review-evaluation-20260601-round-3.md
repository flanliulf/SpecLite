---
Story: 5-5
Round: 3
Date: 2026-06-01
Model Used: GPT-5 Codex (gpt-5-codex)
Review Source: 5-5-code-review-summary-20260601-round-3.md
Review Model: GPT-5 Codex (gpt-5-codex)
Type: Code Review Evaluation
---

## 评估总结

对 Story 5-5 的第 3 轮 CR 代码审查结果（复审）进行逐条评估。Reviewer 确认 Round 1 blocked source gate 与 Round 2 unauthorized apply failure shape 均保持已修复，标准 focused tests、Story 5.5 focused suite、全量 `npm test`、`npm run build` 和白名单 `git diff --check` 均通过；本轮唯一新发现是补充 `npx tsc --noEmit` 失败中存在 touched-file 相关类型诊断。经独立代码验证，该发现有效；应进入 fixer 做最小清理，不应扩大到全仓既有 typecheck 债务。评估结论如下。

---

## 上轮问题回顾确认

### Round 1 Finding #1：已修复

Round 1 evaluator 要求补齐 blocked source 的 schema/runtime write boundary。当前代码仍满足该边界：

- `src/installer/install-plan-schema.ts:53-60` 仍在 `InstallPlanSchema.superRefine` 中拒绝 `writeAuthorized=true` 且 `sourceDescriptor.trustStatus === "blocked"` 的 install plan。
- `src/installer/runtime-structure.ts:65-78` 仍在 `writeAuthorized` 检查之后、`acquireProjectOperationLock` 之前拒绝 blocked descriptor，并返回 redacted `source-integrity.blocked-source` failure，包含 `changedPaths: []`。
- `test/runtime-structure.test.ts:507-589` 覆盖 write-authorized blocked source direct apply，断言 `changedPaths=[]`、no lock/no write 与无本机路径泄漏。

### Round 2 Finding #1：已修复

Round 2 evaluator 要求 `writeAuthorized=false` direct apply failure branch 补齐完整 failure contract。当前代码仍满足该边界：

- `src/installer/runtime-structure.ts:45-62` 的未授权 early return 已返回 `changedPaths: []`。
- `test/runtime-structure.test.ts:425-505` 覆盖 unauthorized direct apply regression，断言 failure、`changedPaths=[]`、`completedSteps=[]`、pending steps 和 no lock/no write。

### 历史 CR TODO（非阻塞）

无。

---

## 发现 #1 评估

### 审查原文

> **[低][新] touched files 在补充 `tsc --noEmit` 下仍有类型诊断**
> - 来源：blind+edge
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

Reviewer 把 `npx tsc --noEmit` 的全仓既有失败与 touched-file 相关诊断分开处理，这一点准确。本次评估不把全仓既有 typecheck 债务纳入 Story 5.5 修复范围，只评估当前 touched files 中可由本轮改动解释的诊断。

第一处诊断有效。`ValidationIssueSchema` 将 `details` 定义为 optional，见 `src/diagnostics/command-result-schema.ts:21-33`。但 `src/installer/runtime-structure.ts:303-318` 的 `addPartialFailureChangedPaths` 在 `changedPaths.length > 0` 时直接访问 `issue.details.manualAction`，见 `src/installer/runtime-structure.ts:313-315`。这不仅是类型层问题：如果某个 partial write failure 已产生 `changedPaths`，但原始 `ValidationIssue` 没有 `details`，当前代码会在构造 structured failure 时抛出异常，导致原本应返回的失败结果退化为 thrown error。

第二处诊断也有效。`SourceDescriptorSchema` 要求 `integrityEvidence` 是 mutable `z.array(...)`，见 `src/source/source-descriptor-schema.ts:52-61`。新增 direct apply regression 在 `test/runtime-structure.test.ts:427-432` 与 `test/runtime-structure.test.ts:509-514` 对 descriptor 使用 `as const`，会把 `integrityEvidence: []` 推导为 readonly empty tuple；随后同一对象传给 `applyInstallPlan` 的 `sourceDescriptor` 与 `installPlan.sourceDescriptor`，见 `test/runtime-structure.test.ts:435-441`、`test/runtime-structure.test.ts:517-523`，与 `SourceDescriptor` 的 mutable array 类型不一致。

**严重性判断：偏低，但不宜转为 CR TODO**

Reviewer 标记为 `[低]` 对运行时覆盖面判断合理：当前标准 gate 的 focused tests、全量 `npm test` 与 `npm run build` 已通过，且 `npx tsc --noEmit` 的全仓失败包含既有类型债务，不能把全仓债务提升为 Story 5.5 阻塞项。

但本发现中的 touched-file 诊断不应作为 CR TODO 延后。原因有两点：

- `src/installer/runtime-structure.ts` 的 optional `details` 访问是本轮 changed paths reporting helper 内的真实异常风险，会影响 partial failure 的 structured error contract。
- `test/runtime-structure.test.ts` 的 readonly descriptor 是本轮新增 direct regression 的局部类型问题，会持续污染后续 typecheck 复检，使 reviewer 难以区分新增回归与既有债务。

因此评估后优先级定为 **P1**：不是要求修复全仓 typecheck，而是要求清理 Story 5.5 touched files 中由本轮改动引入或暴露的类型/contract 缺口。该修复边界很小，适合进入下一轮 fixer。

**修复建议：可行**

最小修复边界如下：

- 在 `src/installer/runtime-structure.ts` 的 `addPartialFailureChangedPaths` 中先稳定读取 `const details = issue.details ?? {}`，再基于 `details.manualAction` 拼接 `manualAction`；保持 public issue shape 与 `changedPaths` 语义不变。
- 在 `test/runtime-structure.test.ts` 的两个 direct apply regression 中去掉会制造 readonly tuple 的 `as const`，或显式声明 descriptor 为 `SourceDescriptor` / 使用满足 mutable array 类型的 fixture；保持测试断言语义不变。
- 不修全仓其他 `npx tsc --noEmit` 既有错误，不扩大到 resolver、install/update command flow、Epic 6 fixture matrix、source lock lifecycle、reporting 重构或 Story 文档。

**误报评估：非误报**

该发现有 schema 类型、当前实现、测试 fixture 推导与 touched diff 证据支撑；不是误报。

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | touched files 在补充 `tsc --noEmit` 下仍有类型诊断 | [低] | **P1** | 只修 Story 5.5 touched files 中的 optional `details` 访问和新增 direct test readonly descriptor，不扩大到全仓既有 typecheck 债务。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

无。

### 可忽略（误报）

无。

### 评估决定

- **发现 #1（touched files 在补充 `tsc --noEmit` 下仍有类型诊断）**：确认有效，当前 CR 仍不通过。下一步应进入 fixer，最小修复 `src/installer/runtime-structure.ts` 的 optional `details` 访问与 `test/runtime-structure.test.ts` 两个 direct apply descriptor 的 readonly array 推导；不得扩大修复全仓既有 `npx tsc --noEmit` 债务，也不得修改 Story 文档或启动 finalizer。

---

## 修复执行记录

### 修复执行记录

- **Date**: 2026-06-01
- **Model Used**: GPT-5 Codex (gpt-5-codex)
- **Fix Items**: 1

#### 修复项 #1：touched files 的 `tsc --noEmit` 相关诊断

- **状态**: 已修复。
- **修改文件**:
  - `src/installer/runtime-structure.ts`
  - `test/runtime-structure.test.ts`
- **修复内容**:
  - `addPartialFailureChangedPaths` 先将 optional `issue.details` 稳定为 `const details = issue.details ?? {}`，再展开 details 并拼接 `manualAction`，保持 public issue shape 与 `changedPaths` 语义不变。
  - 两个 direct `applyInstallPlan` regression 的 descriptor 显式声明为 `SourceDescriptor`，避免 `integrityEvidence: []` 被推导为 readonly tuple，同时保持测试断言语义不变。
- **未扩大范围**:
  - 未修复全仓其他 `npx tsc --noEmit` 既有错误。
  - 未修改 resolver、install/update command flow、Epic 6 fixture matrix、source lock lifecycle、reporting 重构或 Story 文档正文。
- **验证结果**:
  - `npm test -- test/runtime-structure.test.ts test/contract-anchors.test.ts`：通过，2 个 test files、16 个 tests。
  - `npm test -- test/source-descriptor-trust-reporting.test.ts test/source-and-modules.test.ts test/registry-source-resolution.test.ts test/local-source-integrity.test.ts test/git-source-resolution.test.ts test/status-command.test.ts test/validate-command.test.ts test/install-module-selection.test.ts test/install-progress-ready-summary.test.ts test/contract-anchors.test.ts test/runtime-structure.test.ts`：通过，11 个 test files、120 个 tests。
  - `npm test`：通过，34 个 test files、258 个 tests。
  - `npm run build`：通过，ESM 与 DTS build 成功。
  - `npx tsc --noEmit --pretty false`：失败，仍有全仓既有类型错误；本次评估点涉及的 `src/installer/runtime-structure.ts` 与 `test/runtime-structure.test.ts` 相关诊断已消失。
  - `git diff --check -- src/installer/runtime-structure.ts test/runtime-structure.test.ts _bmad-output/implementation-artifacts/code-reviews/5-5-code-review/5-5-code-review-evaluation-20260601-round-3.md _bmad-output/implementation-artifacts/code-reviews/5-5-code-review/PLAN.md _bmad-output/implementation-artifacts/code-reviews/5-5-code-review/EXPERIMENTS.md _bmad-output/implementation-artifacts/code-reviews/5-5-code-review/EXPERIMENT_NOTES.md`：通过；因 Story 5.5 CR 目录当前为 untracked，另用 `git diff --check --no-index -- /dev/null <CR doc>` 检查 4 个 CR 文档，无 whitespace errors。
