---
Story: 7-4
Round: 1
Date: 2026-06-15
Model Used: GPT-5 (Codex)
Type: Code Review Summary
---

## 审查结论

首轮审查。由于当前环境没有 `Agent` 子代理工具，本轮按 skill fallback 降级为串行三层审查：Blind Hunter、Edge Case Hunter、Acceptance Auditor 均由当前模型顺序执行。`npm run build`、Story focused tests、全量 `npm test` 和 `git diff --check` 通过；`npm run lint` 因仓库没有 `lint` script 无法执行。

结论：不通过。存在 1 个阻塞问题：malformed workflow artifact frontmatter 会让 `governance-report` 直接崩溃并输出包含本地绝对路径的 stack trace，未按 artifact metadata validation issue 和 redaction contract 返回稳定 `CommandResult`。

## 新发现

### 1. [高] Malformed artifact frontmatter 会绕过 ValidationIssue 并泄露本地路径

- **来源**：edge+auditor
- **分类**：patch

- **证据**
  - `src/validation/artifact-paths.ts:179-184` 对 `.md` artifact frontmatter 调用 `parseYaml(frontmatter[1])`，但没有捕获 YAML parse error；一旦 frontmatter 语法错误，异常会向上传播。
  - 定向复现：构造已安装项目，其中 `_speclite-output/reports/governance.md` 的 frontmatter 为 `workflowType: [unterminated`，运行 `node dist/bin/speclite.js governance-report <temp-project> --json`。实际结果：exit 1、stdout 为空、stderr 输出 `YAMLParseError` stack trace，并包含 `/Users/fancyliu/Repos/SpecLite/node_modules/...` 本地绝对路径。
  - `test/governance-report-command.test.ts:73-119` 只覆盖可解析 YAML 中字段值不合法的情况，未覆盖 YAML 语法错误 frontmatter。

- **影响**
  - 违反 AC 3：artifact metadata 不合法时，报告应引用 artifact contract、artifact path 和 validation issue，而不是崩溃。
  - 违反 AC 5：`--json` 模式未返回 contract-first `CommandResult<GovernanceReportData>`。
  - 违反 AC 6：stderr stack trace 暴露本地仓库绝对路径，未遵守 path/source redaction 策略。

- **建议**
  - 在 `readWorkflowArtifactMetadata` 捕获 YAML parse error，将 metadata 视为 invalid/missing，并通过 `artifact-path.invalid-required-metadata` 或等价稳定 issue 表达，不让 parser exception 逃逸到 CLI。
  - 增加 focused test：malformed markdown frontmatter 下 `governance-report --json` 返回稳定 `CommandResult`、包含 redaction-safe `ValidationIssue`、stdout/stderr 不包含 temp root、home dir、repo path 或 raw parser stack。

## 验证摘要

- `npm test -- test/governance-report-command.test.ts` ✅ 通过（1 file / 2 tests）。
- `git diff --check` ✅ 通过，无 whitespace error。
- `npm run build` ✅ 通过，ESM 与 DTS build success。
- `npm test -- test/artifact-metadata.test.ts test/artifact-path-validation.test.ts test/skill-artifact-loop.test.ts test/governance-report-command.test.ts` ✅ 通过（4 files / 20 tests）。
- `npm run lint` ❌ 未执行成功：`package.json` 没有 `lint` script。
- `npm test` ✅ 通过（45 files / 323 tests）。
- 定向复现 ❌ 失败符合 finding：malformed artifact frontmatter 触发 `YAMLParseError`，无 JSON `CommandResult`，stderr 含本地绝对路径。

## 通过项

- Story 7-4 的 machine-readable report 已有 owning SPEC：`10-process-governance-report-contract.md`，并在 `01-command-result-json-contract.md` 登记 `governance-report` payload。
- `src/commands/governance-report.ts:57-107` 的核心指标来自 manifest/phase coverage、validate output 和 artifact contract；未引入第二套 phase、skill、artifact 或 issue identity。
- `src/commands/governance-report.ts:125-185` 对 missing/unsupported/failed target 生成 deterministic phase gaps，并包含 `phaseId`、`phaseLabel`、`moduleId`、`canonicalSkillId`、`targetId` 和 `missingReason`。
- `src/validation/artifact-paths.ts:20-90` 基于 artifact path、existence 和 metadata issue 生成 `artifactChecks`，没有自动评价文档 prose quality 或人工 review 结论。
- `src/diagnostics/command-result-schema.ts:32-70` 和 `src/diagnostics/command-result-schema.ts:307-414` 对 public issue/path/report schema 有 project-relative POSIX 和 redaction guard。

## 结论

- **结论：不通过**
- **阻塞项**：1 个，即 malformed artifact metadata crash/redaction leak。
- **非阻塞项 / TODO**：0 个。
- **建议**：先修复 malformed frontmatter 的稳定 issue 映射与 redaction 回归测试，再进入 CR 评估/修复阶段。
