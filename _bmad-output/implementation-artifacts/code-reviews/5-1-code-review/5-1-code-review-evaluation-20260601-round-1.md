---
Story: 5-1
Round: 1
Date: 2026-06-01
Model Used: GPT-5 Codex (gpt-5-codex)
Review Source: 5-1-code-review-summary-20260601-round-1.md
Review Model: GPT-5 Codex (gpt-5-codex)
Type: Code Review Evaluation
---

## 评估总结

对 Story 5-1 的第 1 轮 CR 代码审查结果（首轮）进行逐条评估。审查结果只有 1 个发现：`npm` source value 中的 token/private query string 可进入 public JSON 与 human-readable output。经 Story AC、源码路径和定向命令复现独立验证，该发现成立，属于 Story 5.1 redaction 要求的阻塞问题。评估结论如下。

---

## 发现 #1 评估

### 审查原文

> **[高] `npm` source value 可泄露 token/private query string 到 public JSON 与 human output**
> - 来源：blind+edge+auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

Story 5.1 明确要求 raw credential-bearing URL、token、本机 absolute path、cache path、temporary extraction path 不得进入 public JSON、manifest/index、fixture snapshot 或 `ValidationIssue.details`（`_bmad-output/implementation-artifacts/stories/5-1-source-selection-and-channel-summary.md:59-64`），并要求 credentials、tokens、private query strings 和 cache/temp paths 不得进入 JSON、manifest/index、fixture snapshot、impact 或 suggestedNextStep，human-readable output 也遵守同一 redaction/display-safe policy（`_bmad-output/implementation-artifacts/stories/5-1-source-selection-and-channel-summary.md:87-91`）。同时，`SourceResolutionPlan.externalAccesses[].sourceValue` 必须 display-safe，raw source locators 只能存在于 private in-memory state（`_bmad-output/implementation-artifacts/stories/5-1-source-selection-and-channel-summary.md:173-179`）。

源码验证与 reviewer 描述一致：`normalizeSourceSelection()` 会把非 bundled source 的 `sourceValue` 传给 `createDisplaySafeSourceLabel()`（`src/source/source-selection.ts:89-99`）；`npm` 分支只调用 `sanitizePackageLabel()`（`src/source/source-selection.ts:186-193`）；`sanitizePackageLabel()` 只检查 `hasUnsafeDisplayValue()`，没有检查 `containsSecretLikeToken()` 或 query string（`src/source/source-selection.ts:208-210`）；而 `containsSecretLikeToken()` 已存在但只被 `normalizeRequestedSelector()` 用于 channel/version redaction（`src/source/source-selection.ts:250-257`、`src/source/source-selection.ts:271-272`）。随后 `createBlockedSourceDescriptor()` 把 `selection.requestedSourceValue` 写入 public `sourceDescriptor.resolvedRoot`（`src/source/source-selection.ts:121-133`），`runInstallCommand()` 在 custom source unsupported path 中把该 descriptor 放入 `CommandResult.data.sourceDescriptor`（`src/commands/install.ts:201-232`）。human renderer 又直接输出 `resolvedRoot` 和由 `resolvedRoot` 推导出的 `sourceValue`（`src/diagnostics/output.ts:42-58`、`src/diagnostics/output.ts:482-515`）。

定向复现命令：

```bash
node dist/bin/speclite.js install --json --yes --source npm --source-value '@acme/source?token=secret' --version latest /private/tmp/speclite-cr-eval-npm-leak-json
node dist/bin/speclite.js install --yes --source npm --source-value '@acme/source?token=secret' --version latest /private/tmp/speclite-cr-eval-npm-leak-human
```

复现结果确认 JSON 中包含 `"resolvedRoot": "@acme/source?token=secret"`，human output 中包含 `resolvedRoot=@acme/source?token=secret` 和 `sourceValue=@acme/source?token=secret`。这不是仅测试缺口，而是 public output 实际泄露。

**严重性判断：合理**

原始严重性 `[高]` 合理。该问题直接触达 Story 5.1 的 public output redaction / display-safe contract，且泄露内容包含 `token=secret` 这种明确 secret-like query。命令虽然在 source-specific resolver 前失败且不会写项目文件，但失败输出仍是 public JSON 与 human-readable output，属于交付阻塞的安全/契约问题。按本评估优先级定义归为 **P1**：阻塞 Story 5.1 交付，但不需要上调为 P0，因为没有证据显示当前实现会访问外部网络、写入目标项目或持久化该 raw token 到 manifest/index。

**修复建议：可行**

reviewer 建议在 `createDisplaySafeSourceLabel()` 的 `npm` 分支或 `sanitizePackageLabel()` 中同时检查 secret-like key、query string 和 fragment；不满足 strict npm package-name allowlist 时返回 `redacted-npm-package`。该建议与现有集中 redaction 结构一致，修复面可限制在 `src/source/source-selection.ts` 及 focused regression tests，不需要提前实现 Story 5.2 registry resolution 或 Story 5.3-5.5 的深度 trust/evidence 规则。

回归测试应至少覆盖 `sourceType: "npm"`、`sourceValue: "@scope/pkg?token=secret"`，断言 `selection`、`SourceResolutionPlan.externalAccesses[]`、`install --json` 与 human output 均不包含 raw token/query。现有测试只覆盖 private registry credential URL、Git credential URL 和 local absolute path（`test/source-selection.test.ts:112-145`、`test/source-selection.test.ts:176-229`），确实未覆盖 npm package selector 中的 private query string。

**误报评估：非误报**

该发现由代码路径和定向命令双重确认，不是误报。虽然 `npm` source 在 Story 5.1 中尚未真正解析 registry，unsupported-source failure output 仍然是 Story 5.1 的 public command output；Story 5.1 要求 raw source locators 只能留在 private state，不能因为后续 resolver 未实现而放松 redaction。

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | `npm` source value 可泄露 token/private query string 到 public JSON 与 human output | [高] | **P1** | 违反 Story 5.1 display-safe/redaction 要求，需在进入收尾前修复并补 focused regression。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|

### 可忽略（误报）

| # | 发现 | 原始严重性 | 忽略理由 |
|---|------|----------|---------|

### 评估决定

- **发现 #1（`npm` source value 可泄露 token/private query string）**：确认有效，不通过。本轮应进入 fixer，修复范围应限定为 Story 5.1 的 npm source display-safe redaction 与 focused regression tests；不得扩大到 Story 5.2 registry resolution、Story 5.3 tarball/offline/local integrity、Story 5.4 Git pinning 或 Story 5.5 full trust reporting。
- **需要修复数量**：1
- **可忽略数量**：0
- **待讨论数量**：0
- **CR TODO 候选数量**：0

## 修复执行记录

### 修复执行记录
- **Date**: 2026-06-01
- **Model Used**: GPT-5 Codex (gpt-5-codex)
- **Fix Items**: 1

#### 修复项 #1：`npm` source value private query redaction

- **对应评估结论**：发现 #1 确认有效，P1，需要修复 `npm` source value 中 token/private query string 泄露到 public JSON 与 human output 的问题。
- **修改文件**：
  - `src/source/source-selection.ts`
  - `test/source-selection.test.ts`
- **修复内容**：
  - 在 `sanitizePackageLabel()` 中集中处理 npm source display-safe label。
  - 对 npm source value 增加 `containsSecretLikeToken()`、query string、fragment 与 strict npm package-name label 检查。
  - 当 npm source value 不满足 display-safe package label 条件时，统一返回 `redacted-npm-package`。
  - 保持 bundled source 成功路径不变；未实现 Story 5.2 registry deep resolution、Story 5.3 tarball/offline/local integrity、Story 5.4 Git pinning 或 Story 5.5 trust matrix。
- **回归测试**：
  - 新增 focused unit regression 覆盖 `sourceType: "npm"` / `sourceValue: "@scope/pkg?token=secret"`，断言 selection 与 `SourceResolutionPlan.externalAccesses[]` 均使用 `redacted-npm-package`，且不包含 raw query/token。
  - 新增 install boundary regression 覆盖同一 npm source value，断言 `install --json` projection 与 human output 均不包含 `@scope/pkg?token=secret`、`?token=secret`、`token` 或 `secret`。
- **验证结果**：
  - `npx vitest run test/source-selection.test.ts`：通过，1 个 test file / 10 个 tests。
  - `npx vitest run test/cli-smoke.test.ts test/source-and-modules.test.ts test/install-progress-ready-summary.test.ts`：通过，3 个 test files / 24 个 tests。
  - `npm run build`：通过。
  - `node dist/bin/speclite.js install --json --yes --source npm --source-value '@scope/pkg?token=secret' --version latest <tmpdir>` + 泄露检查：通过，命令预期 exit 1，输出未包含 raw query/token。
  - `node dist/bin/speclite.js install --yes --source npm --source-value '@scope/pkg?token=secret' --version latest <tmpdir>` + 泄露检查：通过，命令预期 exit 1，human output 未包含 raw query/token。
  - `npm test`：通过，30 个 test files / 209 个 tests。
  - `git diff --check`：通过。
- **执行结论**：P1 已按 evaluation 限定范围完成修复；本 fixer 未启动 reviewer、evaluator、rules、todo、finalizer，也未执行 git commit/push。
