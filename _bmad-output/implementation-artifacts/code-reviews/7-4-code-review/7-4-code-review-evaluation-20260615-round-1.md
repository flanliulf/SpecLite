---
Story: 7-4
Round: 1
Date: 2026-06-15
Model Used: GPT-5 (Codex)
Review Source: 7-4-code-review-summary-20260615-round-1.md
Review Model: GPT-5 (Codex)
Type: Code Review Evaluation
---

## 评估总结

对 Story 7-4 的第 1 轮 CR 代码审查结果（首轮）进行逐条评估。本轮审查提出 1 个阻塞发现：malformed workflow artifact frontmatter 会绕过 `ValidationIssue` 并导致 `governance-report --json` 崩溃，同时在 stderr 中泄露本地绝对路径。经代码验证和临时 fixture 复现，该发现成立。评估结论如下。

---

## 发现 #1 评估

### 审查原文

> **[高] Malformed artifact frontmatter 会绕过 ValidationIssue 并泄露本地路径**
> - 来源：edge+auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

代码路径与审查描述一致。`src/validation/artifact-paths.ts:179-184` 在识别 `.md` artifact frontmatter 后直接调用 `parseYaml(frontmatter[1])`，该调用外层没有 `try/catch`。`discoverArtifacts` 在 `src/validation/artifact-paths.ts:123-126` 将 `readWorkflowArtifactMetadata` 的结果直接展开进 artifact 列表，因此 YAML parser exception 会继续向上传播，而不会进入 `validateArtifactPathContract` 的 `ValidationIssue` 生成路径。

`src/commands/governance-report.ts:57-68` 在生成 governance report 时调用 `validateArtifactPaths`，但该调用同样没有捕获 artifact metadata parser exception；后续 `createGovernanceReportCommandResult` 的稳定 `CommandResult` 构造只发生在 `src/commands/governance-report.ts:110-122`，异常抛出时不会执行到该返回路径。

本次评估用系统临时目录构造完整 installed-state fixture，并把 `_speclite-output/reports/governance.md` frontmatter 写为 `workflowType: [unterminated` 后运行 `npm run dev -- governance-report <temp-project> --json`。实际结果为 exit 1，输出 `YAMLParseError` stack trace，且 stderr 包含 `/Users/fancyliu/Repos/SpecLite/node_modules/...`，没有输出 `speclite.command-result.v1` JSON。

现有测试也支持审查判断：`test/governance-report-command.test.ts:73-119` 覆盖的是可解析 YAML 中 metadata 字段值非法的场景，并断言 `artifact-path.invalid-required-metadata` 与 redaction；但该测试没有覆盖 YAML 语法错误 frontmatter。

**严重性判断：合理**

评为 blocking 合理。Story AC 3 要求 artifact metadata 不合法时报告 artifact contract、artifact path 和 validation issue；AC 5 要求 `--json` 复用 `CommandResult` / `ValidationIssue`；AC 6 要求输出遵守 redaction 策略。当前 malformed frontmatter 同时破坏三项验收标准，并且在 `--json` 模式下无法给调用方返回稳定 machine-readable result。

**修复建议：可行**

审查建议可行且范围明确：在 `readWorkflowArtifactMetadata` 对 Markdown frontmatter YAML parse error 做局部捕获，将 malformed metadata 映射为稳定 artifact metadata validation issue，不允许 parser exception 穿透 CLI 边界；同时新增 focused regression test，断言 malformed frontmatter 下 `governance-report --json` 返回稳定 `CommandResult`、包含 redaction-safe `ValidationIssue`，且 stdout/stderr 不包含 temp root、home dir、repo path 或 raw parser stack。

实现时需要注意：如果当前 `validateArtifactPathContract` 只能区分 missing/invalid field values，fixer 应选择最小契约扩展方式传递 “frontmatter parse failed” 信号，避免把语法错误误判为 artifact 缺失，也不要引入第二套 issue category。

**误报评估：非误报**

不是误报。代码中的未捕获 `parseYaml`、现有测试缺口、Story AC 要求和本次临时复现结果相互印证。

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | Malformed artifact frontmatter 绕过 `ValidationIssue` 并泄露本地路径 | [高] | **P1** | 破坏 AC 3、AC 5、AC 6，`--json` 无法返回稳定 `CommandResult`，并泄露 repo/node_modules 绝对路径。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| - | 无 | - | - | 本轮没有建议延后处理的非阻塞项。 |

### 可忽略（误报）

| # | 发现 | 原始严重性 | 忽略理由 |
|---|------|----------|---------|
| - | 无 | - | 本轮没有误报。 |

### 评估决定

- **发现 #1（Malformed artifact frontmatter 绕过 `ValidationIssue` 并泄露本地路径）**：确认有效，必须启动 fixer。修复范围应限制在 Markdown artifact metadata parse error 的稳定 issue 映射、`governance-report --json` 的 contract-first 输出保持，以及对应 redaction regression test；不应处理 Epic 8 或其他 Story。

## 修复执行记录

### 修复执行记录
- **Date**: 2026-06-15
- **Model Used**: GPT-5 (Codex)
- **Fix Items**: 1

#### 修复项 1：Malformed artifact frontmatter 绕过 `ValidationIssue` 并泄露本地路径

- **对应 finding**: 发现 #1（P1）
- **修改文件**:
  - `src/validation/artifact-paths.ts`
  - `src/validation/rules/artifact-path.ts`
  - `test/governance-report-command.test.ts`
- **修复内容**:
  - 在 Markdown artifact frontmatter 解析处局部捕获 YAML parse error，避免 parser exception 穿透 `validateArtifactPaths` / `governance-report --json`。
  - 通过最小内部契约扩展把 malformed frontmatter 映射为稳定 `artifact-path.invalid-required-metadata`。
  - `ValidationIssue.details` 只包含稳定 `reason: "malformed-frontmatter"`、`metadataLocation: "frontmatter"` 和 `metadataKeys: ["frontmatter"]`，不写入 parser message、绝对路径或 raw artifact 内容。
  - 新增 command-level regression test，断言 malformed frontmatter 下 `governance-report --json` 返回可解析 `GovernanceReportCommandResult`、exit code 为 1、artifact check 标记为 invalid，且 stdout/stderr 不包含 temp root、home dir、repo path、`YAMLParseError`、`node_modules` 或 raw malformed value。
- **验证结果**:
  - `npm test -- governance-report-command`：通过，1 个测试文件、3 个测试全部 passed。
  - `npm run build`：通过，ESM build 与 DTS build 均 success。
- **范围说明**: 未处理 Epic 8 或其他 Story；未进行全局 CLI error handling 重构；未 commit，未 push。
