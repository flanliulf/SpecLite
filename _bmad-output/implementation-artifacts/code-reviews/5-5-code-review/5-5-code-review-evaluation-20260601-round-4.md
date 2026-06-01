---
Story: 5-5
Round: 4
Date: 2026-06-01
Model Used: GPT-5 Codex (gpt-5-codex)
Review Source: 5-5-code-review-summary-20260601-round-4.md
Review Model: GPT-5 Codex (gpt-5-codex)
Type: Code Review Evaluation
---

## 评估总结

对 Story 5-5 的第 4 轮 CR 代码审查结果（复审）进行逐条评估。Reviewer 确认 Round 1 / Round 2 / Round 3 的问题均未回退，focused tests、Story 5.5 focused suite、全量 `npm test`、`npm run build` 和白名单 `git diff --check` 均通过；本轮唯一新发现是 `src/ide/target-writer.ts` 在 `exactOptionalPropertyTypes` 下向 optional callback 传入显式 `undefined`。经独立代码验证，该发现有效；应进入 fixer 做最小清理，不应扩大到全仓既有 typecheck 债务，也不产生 CR TODO。评估结论如下。

---

## 上轮问题回顾确认

### Round 1 Finding #1：已修复

Round 1 evaluator 要求补齐 blocked source 的 schema/runtime write boundary。当前 reviewer 复核显示该边界未回退：

- `src/installer/install-plan-schema.ts:53-60` 仍在 `InstallPlanSchema.superRefine` 中拒绝 `writeAuthorized=true` 且 `sourceDescriptor.trustStatus === "blocked"` 的 install plan。
- `src/installer/runtime-structure.ts:65-78` 仍在 `writeAuthorized` 检查之后、`acquireProjectOperationLock` 之前拒绝 blocked descriptor，并返回 redacted `source-integrity.blocked-source` failure，包含 `changedPaths: []`。
- `test/runtime-structure.test.ts:508-590` 覆盖 write-authorized blocked source direct apply，断言 `changedPaths=[]`、no lock/no write 与无本机路径泄漏。

### Round 2 Finding #1：已修复

Round 2 evaluator 要求 `writeAuthorized=false` direct apply failure branch 补齐完整 failure contract。当前 reviewer 复核显示该边界未回退：

- `src/installer/runtime-structure.ts:45-62` 的未授权 early return 已返回 `changedPaths: []`。
- `test/runtime-structure.test.ts:426-505` 覆盖 unauthorized direct apply regression，断言 failure、`changedPaths=[]`、`completedSteps=[]`、pending steps 和 no lock/no write。

### Round 3 Finding #1：已修复

Round 3 evaluator 要求清理 touched-file `tsc --noEmit` 诊断中的 optional `details` 访问和 readonly descriptor 推导。当前 reviewer 复核显示原始评估点已清理：

- `src/installer/runtime-structure.ts:303-319` 已使用 `const details = issue.details ?? {}` 后再拼接 `manualAction`，不再直接访问 optional `issue.details.manualAction`。
- `test/runtime-structure.test.ts:428-433` 与 `test/runtime-structure.test.ts:510-515` 的 direct apply descriptor 已显式声明为 `SourceDescriptor`，避免 `integrityEvidence: []` 推导为 readonly tuple。
- 定向过滤 `npx tsc --noEmit --pretty false 2>&1 | rg "(src/installer/runtime-structure\\.ts|test/runtime-structure\\.test\\.ts)"` 无输出，确认 Round 3 原始评估点已消失。

### 历史 CR TODO（非阻塞）

无。

---

## 发现 #1 评估

### 审查原文

> **[低][新] `writeIdeMirrors` 在 `exactOptionalPropertyTypes` 下向 optional callback 传入显式 `undefined`**
> - 来源：blind+edge
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

Reviewer 对诊断归属的判断准确。本轮不把全仓既有 `npx tsc --noEmit --pretty false` 债务纳入 Story 5.5 修复范围，只评估 Story 5.5 touched surface 中仍存在的相关诊断。

`writeIdeMirrors` 的输入把 `onChangedPath` 定义为 optional callback，见 `src/ide/target-writer.ts:33-41`。但当前调用 `copyCanonicalPackage` 时始终构造 `onChangedPath: input.onChangedPath`，见 `src/ide/target-writer.ts:92-98`。当 caller 未提供 callback 时，该对象属性仍被显式传入，值为 `undefined`。

`copyCanonicalPackage` 的输入同样把 `onChangedPath` 定义为 optional callback，见 `src/fs/copy-tree.ts:11-17`。项目 `tsconfig.json:6` 开启 `strict`，`tsconfig.json:16` 开启 `exactOptionalPropertyTypes`；在该配置下，optional property 允许属性缺席，但不等价于允许显式 `undefined`，除非目标类型显式包含 `undefined`。

独立复核命令 `npx tsc --noEmit --pretty false 2>&1 | rg "(src/ide/target-writer\\.ts|src/installer/runtime-structure\\.ts|test/runtime-structure\\.test\\.ts)"` 当前输出仅包含：

```text
src/ide/target-writer.ts(92,47): error TS2379: Argument of type '{ projectRoot: string; sourcePackageRoot: string; sourceRefRoot: string; targetEntryRoot: string; onChangedPath: ((relativePath: string) => void) | undefined; }' is not assignable to parameter of type '{ projectRoot: string; sourcePackageRoot: string; sourceRefRoot: string; targetEntryRoot: string; onChangedPath?: (relativePath: string) => void; }' with 'exactOptionalPropertyTypes: true'. Consider adding 'undefined' to the types of the target's properties.
```

这说明 Round 3 原始 touched-file 诊断已消失，但 `src/ide/target-writer.ts(92,47)` 仍是 Story 5.5 changed-path tracking 相关 touched-file 诊断，不应被归类为全仓既有 typecheck 债务。

**严重性判断：偏低，但不宜转为 CR TODO**

Reviewer 标记为 `[低]` 对运行时影响判断合理：当前 `npm test`、Story 5.5 focused suite、全量 `npm test`、`npm run build` 与白名单 `git diff --check` 均通过，该问题不构成新的高/中优先级 runtime write gate 阻塞。

但该发现不应转为 CR TODO 延后。原因是它位于 Story 5.5 本轮 touched surface，并且由 changed-path tracking callback 传递方式引起；如果不修，后续 reviewer/evaluator 每次用 `npx tsc --noEmit --pretty false` 区分全仓既有债务与 Story 5.5 touched-file 诊断时都会持续命中该文件，导致 CR 复核无法清零本 Story 相关 typecheck 诊断。

因此评估后优先级定为 **P1**：不是要求修复全仓 typecheck，而是要求清理 Story 5.5 touched-file 中明确、局部、低风险的 typecheck 缺口。该修复边界很小，适合进入下一轮 fixer。

**修复建议：可行**

最小修复边界应限于 `src/ide/target-writer.ts` 的 `writeIdeMirrors` 调用点：调用 `copyCanonicalPackage` 时使用条件展开，仅当 `input.onChangedPath !== undefined` 时传入 `{ onChangedPath: input.onChangedPath }`。这样保持 public type、callback 语义和 changed-path tracking 行为不变，同时避免显式传入 `undefined`。

不建议把 `copyCanonicalPackage` 的 public input type 扩大为 `onChangedPath?: ((relativePath: string) => void) | undefined`，因为当前问题可以在 caller 侧更保守地消除。不得扩大到 resolver、install/update command flow、Epic 6 fixture matrix、source lock lifecycle、Story 文档或全仓既有 `tsc` 债务。

**误报评估：非误报**

该发现有 TypeScript 配置、caller 调用点、callee input type 和当前 `tsc` 定向输出支撑；不是误报。

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | `writeIdeMirrors` 向 optional callback 传入显式 `undefined` | [低] | **P1** | 只修 `src/ide/target-writer.ts` 调用 `copyCanonicalPackage` 时的 optional callback 条件传参，不扩大到全仓既有 typecheck 债务。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

无。

### 可忽略（误报）

无。

### 评估决定

- **发现 #1（`writeIdeMirrors` 向 optional callback 传入显式 `undefined`）**：确认有效，当前 CR 仍不通过。下一步应进入 fixer，最小修复 `src/ide/target-writer.ts` 的 `copyCanonicalPackage` 调用对象，仅当 `input.onChangedPath !== undefined` 时传入 `onChangedPath`；不得修改 public type、resolver、install/update flow、Epic 6 fixture matrix、source lock lifecycle、Story 文档或全仓既有 `npx tsc --noEmit` 债务。

---

## 修复执行记录

### 修复执行记录
- **Date**: 2026-06-01
- **Model Used**: GPT-5 Codex (gpt-5-codex)
- **Fix Items**: 1

#### 修复项 #1：`writeIdeMirrors` optional callback 条件传参

- **状态**: 已修复
- **修改文件**: `src/ide/target-writer.ts`
- **修改内容**: `copyCanonicalPackage` 调用对象不再固定传入 `onChangedPath: input.onChangedPath`，改为条件展开；仅当 `input.onChangedPath !== undefined` 时传入 `{ onChangedPath: input.onChangedPath }`。
- **边界确认**: 未修改 `copyCanonicalPackage` public input type，未修改 resolver、install/update flow、Epic 6 fixture matrix、source lock lifecycle、Story 文档或全仓既有 typecheck 债务。

#### 验证结果

- `npx tsc --noEmit --pretty false`: 仍因全仓既有类型债务失败，退出码 2；过滤 `src/ide/target-writer.ts`、`src/installer/runtime-structure.ts`、`test/runtime-structure.test.ts` 后无输出，确认本轮 touched-file 诊断已消失。
- `npm test -- test/runtime-structure.test.ts test/contract-anchors.test.ts`: 通过，2 个 test files、16 个 tests。
- `npm test -- test/source-descriptor-trust-reporting.test.ts test/source-and-modules.test.ts test/registry-source-resolution.test.ts test/local-source-integrity.test.ts test/git-source-resolution.test.ts test/status-command.test.ts test/validate-command.test.ts test/install-module-selection.test.ts test/install-progress-ready-summary.test.ts test/contract-anchors.test.ts test/runtime-structure.test.ts`: 通过，11 个 test files、120 个 tests。
- `npm test`: 通过，34 个 test files、258 个 tests。
- `npm run build`: 通过，tsup ESM 与 DTS build 成功。
- `git diff --check -- src/ide/target-writer.ts`: 通过。
- `git diff --check --no-index -- /dev/null <Story 5.5 Round 4 fixer CR doc>`: 通过；对 Round 4 evaluation、PLAN、EXPERIMENTS、EXPERIMENT_NOTES 执行 no-index whitespace check，无 whitespace errors。
