---
Story: 5-5
Round: 5
Date: 2026-06-01
Model Used: GPT-5 Codex (gpt-5-codex)
Review Source: 5-5-code-review-summary-20260601-round-5.md
Review Model: GPT-5 Codex (gpt-5-codex)
Type: Code Review Evaluation
---

## 评估总结

对 Story 5-5 的第 5 轮 CR 代码审查结果（复审）进行逐条评估。Reviewer 确认 Round 1 / Round 2 / Round 3 / Round 4 修复均未回退，focused tests、Story 5.5 focused suite、全量 `npm test`、`npm run build` 和相关 `git diff --check` 均通过；补充 `npx tsc --noEmit --pretty false` 仍因全仓既有类型债务失败，但当前争议点只限 Story 5.5 validation/test touched surface 中的 `src/validation/validate-project.ts`、`test/git-source-resolution.test.ts`、`test/validate-command.test.ts` 诊断。经独立代码验证，本轮 1 个 `patch` 发现有效，应进入 fixer 做最小清理；不应扩大到全仓既有 typecheck 债务，也不产生 CR TODO。评估结论如下。

---

## 上轮问题回顾确认

### Round 1 Finding #1：已修复

Round 1 evaluator 要求补齐 blocked source 的 schema/runtime write boundary。当前 Round 5 reviewer 复核显示该边界未回退：

- `src/installer/install-plan-schema.ts:53-60` 仍拒绝 `writeAuthorized=true` 且 `sourceDescriptor.trustStatus === "blocked"` 的 install plan。
- `src/installer/runtime-structure.ts:65-78` 仍在 `writeAuthorized` 检查之后、`acquireProjectOperationLock` 之前拒绝 blocked descriptor，并返回 redacted `source-integrity.blocked-source` failure。
- `test/runtime-structure.test.ts` direct blocked apply regression 继续覆盖 `changedPaths=[]`、no lock/no write 与本机路径不泄漏。

### Round 2 Finding #1：已修复

Round 2 evaluator 要求 `writeAuthorized=false` direct apply failure branch 补齐完整 failure contract。当前 Round 5 reviewer 复核显示该边界未回退：

- `src/installer/runtime-structure.ts:45-62` 的未授权 early return 已返回 `changedPaths: []`。
- `test/runtime-structure.test.ts` unauthorized direct apply regression 继续断言 failure、`changedPaths=[]`、`completedSteps=[]`、pending steps 和 no lock/no write。

### Round 3 Finding #1：已修复

Round 3 evaluator 要求清理 `src/installer/runtime-structure.ts` 与 `test/runtime-structure.test.ts` touched-file typecheck 诊断。当前 Round 5 reviewer 复核显示原始评估点已清理：

- `src/installer/runtime-structure.ts:303-319` 已使用 `const details = issue.details ?? {}` 后再拼接 `manualAction`。
- `test/runtime-structure.test.ts` 的 direct apply descriptor 已显式声明为 `SourceDescriptor`，不再把 `integrityEvidence: []` 推导为 readonly tuple。
- 定向过滤 `src/installer/runtime-structure.ts` 与 `test/runtime-structure.test.ts` 无 `tsc` 输出。

### Round 4 Finding #1：已修复

Round 4 evaluator 要求清理 `src/ide/target-writer.ts` optional callback 显式 `undefined` 诊断。当前 Round 5 reviewer 复核显示原始评估点已清理：

- `src/ide/target-writer.ts:92-98` 调用 `copyCanonicalPackage` 时仅在 `input.onChangedPath !== undefined` 时传入 `onChangedPath`。
- 定向过滤 `src/ide/target-writer.ts`、`src/installer/runtime-structure.ts`、`test/runtime-structure.test.ts` 无 `tsc` 输出。

### 历史 CR TODO（非阻塞）

无。

---

## 发现 #1 评估

### 审查原文

> **[低][新] Story 5.5 validation/test touched surface 在补充 `tsc --noEmit` 过滤下仍有相关诊断**
> - 来源：blind+edge
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

Reviewer 对诊断归属的判断准确。`npx tsc --noEmit --pretty false --noErrorTruncation` 的定向过滤仍输出三类 Story 5.5 validation/test touched-surface 诊断；同时目标三文件 `src/ide/target-writer.ts`、`src/installer/runtime-structure.ts`、`test/runtime-structure.test.ts` 已无输出。因此，本轮不能把这些诊断和全仓既有 typecheck 债务混为一谈。

第一类诊断位于 `src/validation/validate-project.ts`。`validateManifestSchema` 的结果类型将 `manifest` 声明为 optional，见 `src/validation/rules/manifest-schema.ts:25-33`；但 `validateProject` 的 guard 只检查 `issues.length`、`skillIndex`、`helpIndex`、`filesIndex`、`phaseCoverage`，没有显式检查或局部窄化 `manifest`，见 `src/validation/validate-project.ts:40-46`。同一 guard 内随后把 `manifestSchemaResult.manifest` 传给 `validateRuntimePaths`、读取 `manifest.paths.artifactRoot`，并传给 `validateSourceIntegrity`，见 `src/validation/validate-project.ts:56-60`、`src/validation/validate-project.ts:85-100`、`src/validation/validate-project.ts:105-107`。而 `validateSourceIntegrity` 要求 `manifest: Manifest`，不是 `Manifest | undefined`，见 `src/validation/rules/source-integrity.ts:12-17`。定向 `tsc` 输出也确认 `src/validation/validate-project.ts(58,7)`、`(87,23)`、`(99,21)`、`(106,7)` 均与 `manifest` 未窄化相关。

第二类诊断位于 `test/git-source-resolution.test.ts`。当前 `GitClient` 类型要求同时提供 `lsRemote` 与 `verifyCommit`，见 `src/source/git-source-resolver.ts:19-29`；但该测试在 unresolved / unreachable 两个 mock 中只提供 `lsRemote`，见 `test/git-source-resolution.test.ts:327-344`。定向 `tsc` 输出确认 `test/git-source-resolution.test.ts(333,7)` 与 `(340,7)` 报 `Property 'verifyCommit' is missing`。

第三类诊断位于 `test/validate-command.test.ts`。测试直接将 `outputs[0]` 传给 `renderCommandResultJson`，见 `test/validate-command.test.ts:85`；在当前配置下数组索引结果类型包含 `undefined`，定向 `tsc` 输出确认 `test/validate-command.test.ts(85,44)` 报 `... | undefined` 不可赋给 renderer 参数类型。

**严重性判断：原始运行时严重性合理，但应作为 CR 阻塞修复**

Reviewer 标记为 `[低]` 对 runtime 影响判断合理：当前 focused tests、Story 5.5 suite、全量 `npm test`、`npm run build` 和相关 whitespace check 均通过，未发现新的高/中优先级运行时阻塞项。

但本发现不宜降级为 CR TODO。原因是这些诊断都位于 Story 5.5 相关 validation/test touched surface，且 reviewer 已明确要求本轮区分全仓既有债务与本 Story touched-surface 诊断。若不清理，后续 reviewer/evaluator 继续使用 `npx tsc --noEmit --pretty false` 过滤 Story 5.5 范围时会持续命中这些文件，导致本 Story 相关 typecheck 复核无法收敛。

因此评估后优先级定为 **P1**：不是要求修复全仓 `tsc`，而是要求清理 Story 5.5 validation/test touched surface 中明确、局部、低风险的 typecheck 缺口，属于 CR 质量门禁阻塞。

**修复建议：可行**

Reviewer 建议的最小修复边界可行，且应严格保持窄范围：

- `src/validation/validate-project.ts`：在当前 guard 中显式窄化 `manifest`，例如先绑定局部 `const manifest = manifestSchemaResult.manifest` 并纳入 guard，后续 `validateRuntimePaths`、artifact/file integrity、`validateSourceIntegrity` 均使用该局部变量；不得重写 validation pipeline。
- `test/git-source-resolution.test.ts`：只给两个 affected `gitClient` mock 补齐 `verifyCommit` stub，以满足 `GitClient` 类型；不得改 resolver 行为或 Git resolution contract。
- `test/validate-command.test.ts`：稳定取得 `outputs[0]`，例如先断言长度或使用项目既有测试风格的非空取值；不得改 renderer public type 或 validate command result schema。

不得扩大到全仓 `npx tsc --noEmit` 债务、resolver 重写、install/update command flow、Epic 6 fixture matrix、source lock lifecycle、Story 文档正文、CR rules/todo/finalizer 或本轮之外的代码清理。

**误报评估：非误报**

该发现有 TypeScript 定向输出、类型定义和具体调用点支撑；不是误报。

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | Story 5.5 validation/test touched surface 仍有 `tsc --noEmit` 诊断 | [低] | **P1** | 只清理 `validate-project.ts` manifest 窄化、Git test mock `verifyCommit`、`validate-command.test.ts` 稳定取 `outputs[0]`；不扩大到全仓既有 typecheck 债务。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

无。

### 可忽略（误报）

无。

### 评估决定

- **发现 #1（Story 5.5 validation/test touched surface 仍有 `tsc --noEmit` 诊断）**：确认有效，当前 CR 仍不通过。下一步应进入 fixer，最小修复 `src/validation/validate-project.ts` manifest 窄化 / source-integrity 调用类型、`test/git-source-resolution.test.ts` 两处 mock `verifyCommit` 补齐、`test/validate-command.test.ts` 稳定取 `outputs[0]`；不得修改全仓既有 typecheck 债务、resolver 架构、install/update flow、Epic 6 fixture matrix、source lock lifecycle、Story 文档或启动 finalizer。

---

## 修复执行记录

### 修复执行记录
- **Date**: 2026-06-01
- **Model Used**: GPT-5 Codex (gpt-5-codex)
- **Fix Items**: 1

#### 修复项 #1：Story 5.5 validation/test touched surface `tsc --noEmit` 诊断

- **状态**：已完成。
- **修改文件**：
  - `src/validation/validate-project.ts`：绑定局部 `const manifest = manifestSchemaResult.manifest`，并在现有 guard 中纳入 `manifest !== undefined`；后续 `validateRuntimePaths`、artifact/file integrity 和 `validateSourceIntegrity` 使用该局部变量。
  - `test/git-source-resolution.test.ts`：仅为 unresolved / unreachable 两个 affected `gitClient` mock 补齐 `verifyCommit: vi.fn(async () => undefined)` stub，测试语义不变。
  - `test/validate-command.test.ts`：`renderCommandResultJson(outputs[0]!)` 使用既有非空取值风格，避免把可能为 `undefined` 的数组索引结果传入 renderer。
- **验证结果**：
  - `npx vitest run test/git-source-resolution.test.ts test/validate-command.test.ts test/source-descriptor-trust-reporting.test.ts`：通过，3 个 test files、37 个 tests。
  - `npm test`：通过，34 个 test files、258 个 tests。
  - `npm run build`：通过，tsup ESM 与 DTS build 成功。
  - `npx tsc --noEmit --pretty false --noErrorTruncation`：仍因全仓既有 typecheck 债务失败，退出码 2；输出不再包含 `src/validation/validate-project.ts`、`test/git-source-resolution.test.ts`、`test/validate-command.test.ts` 相关诊断。
  - `npx tsc --noEmit --pretty false --noErrorTruncation 2>&1 | rg "src/validation/validate-project\\.ts|test/git-source-resolution\\.test\\.ts|test/validate-command\\.test\\.ts" || true`：无输出，确认本轮目标三文件诊断消失。
  - `git diff --check -- src/validation/validate-project.ts test/validate-command.test.ts`：通过。
  - `git diff --check --no-index -- /dev/null <untracked affected files>`：通过，无 whitespace error 输出；覆盖 `test/git-source-resolution.test.ts`、Round 5 evaluation 和本目录三份进度文件。
- **范围控制**：未修改 Story 文档正文、resolver 架构、install/update flow、Epic 6 fixture matrix、source lock lifecycle、CR rules/todo 或 finalizer；未处理全仓既有 `tsc` 债务。

✅ CR 修复执行完成，修复记录已追加到评估文件。
