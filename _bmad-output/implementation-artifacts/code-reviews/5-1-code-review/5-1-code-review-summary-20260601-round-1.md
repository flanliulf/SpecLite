---
Story: 5-1
Round: 1
Date: 2026-06-01
Model Used: GPT-5 Codex (gpt-5-codex)
Type: Code Review Summary
---

## 审查结论

首轮审查。当前环境未提供可调用的 `Agent` 工具，无法真正并行启动 Blind Hunter、Edge Case Hunter、Acceptance Auditor；本轮已按 `bmenhance-cr-01-reviewer` 降级策略，在当前上下文中串行执行三层审查。

`npm run build` 通过，`npm test` 通过 30 个 test files / 207 个 tests，定向 `git diff --check` 通过；`npm run lint` 因项目没有 `lint` script 失败，属于验证能力缺口而非本 Story 代码失败。审查发现 1 个阻塞级 `patch`：`npm` source value 的 token/private query string 可进入 public JSON 和 human-readable output，违反 Story 5.1 AC4/AC6 的 redaction 要求。因此 reviewer 结论为不通过，建议进入 evaluator/fixer。

## 新发现

### 1. [高] `npm` source value 可泄露 token/private query string 到 public JSON 与 human output

- **来源**：blind+edge+auditor
- **分类**：patch

- **证据**
  - `src/source/source-selection.ts:186-210` 对 `npm` source 调用 `sanitizePackageLabel()`，但该函数只检查 `hasUnsafeDisplayValue()`，没有检查 `containsSecretLikeToken()` 或 query string。
  - `src/source/source-selection.ts:260-272` 的 unsafe 检查覆盖 URL、absolute path、drive letter 和 credential URL 形态，但 `@acme/source?token=secret` 既不是 URL，也不是 absolute path，因此会被当成 safe npm package label。
  - `src/source/source-selection.ts:121-133` 会把 `requestedSourceValue` 写入 blocked `SourceDescriptor.resolvedRoot`。
  - `src/diagnostics/output.ts:482-515` 会把 `resolvedRoot` 渲染到 `Source` 和 `External Access` human-readable 输出。
  - 定向复现命令：
    `node dist/bin/speclite.js install --json --yes --source npm --source-value '@acme/source?token=secret' --version latest <tmpdir>`
    实际 JSON 输出包含 `"resolvedRoot": "@acme/source?token=secret"`。
  - 定向 human 输出同样包含 `resolvedRoot=@acme/source?token=secret` 和 `sourceValue=@acme/source?token=secret`。

- **影响**
  - 违反 Story 5.1 AC4/AC6：public JSON、human-readable output 和 source summary 不得泄露 credential-bearing URL、token、private query string 或 raw source locator。
  - `test/source-selection.test.ts:112-145` 覆盖了 private registry URL、Git credential URL 和 local absolute path，但没有覆盖 `npm` source package selector 中的 `?token=` / private query string，因此现有测试绿灯没有拦住该泄露路径。

- **建议**
  - 在 `createDisplaySafeSourceLabel()` 的 `npm` 分支或 `sanitizePackageLabel()` 中同时检查 secret-like key、query string 和 fragment；不满足 strict npm package-name allowlist 时返回 `redacted-npm-package`。
  - 增加 focused regression：`sourceType: "npm"`、`sourceValue: "@scope/pkg?token=secret"` 或其他 private query string，断言 `selection`、`SourceResolutionPlan`、`install --json`、human output 和 fixture snapshot 均不包含 raw token/query。

## 验证摘要

- `npm test` ✅ 通过（30 / 30 test files，207 / 207 tests）
- `npm run lint` ❌ 未执行成功：`package.json` 未定义 `lint` script
- `npm run build` ✅ 通过（tsup ESM 与 DTS build 成功）
- `git diff --check -- <Story 5.1 相关文件>` ✅ 通过
- 定向复现 ✅ 证实 `npm` source value 的 `token=secret` 会进入 JSON 与 human-readable output

## 通过项

- Story 5.1 没有提前实现 Story 5.2 registry resolution、Story 5.3 tarball/offline/local integrity、Story 5.4 Git pinning、Story 5.5 full trust reporting；custom source 当前在 resolver 前以 `source-integrity.unsupported-source` 停止。
- `bundled` source path 保持 display-safe `assets/source/speclite`，不会声明 external access。
- custom source failure 在 operation lock 和 project writes 前返回；定向 private registry 测试断言 `_speclite` 未创建，`installPlan` 未生成。
- `install --json` 继续使用契约化 `CommandResult<InstallCommandData>` 与 `data.sourceDescriptor`，未新增 public `sourceSummary` / `readySummary` blob。

## 结论

- **结论：不通过**
- **阻塞项**：1 个 `patch`，涉及 public output redaction/security。
- **建议**：进入 evaluator 确认阻塞结论，然后进入 fixer 修复 `npm` source value redaction 和对应 regression test。
