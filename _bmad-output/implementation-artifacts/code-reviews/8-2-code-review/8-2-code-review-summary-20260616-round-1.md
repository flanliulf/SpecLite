---
Story: 8-2
Round: 1
Date: 2026-06-16
Model Used: GPT-5 Codex (gpt-5-codex)
Type: Code Review Summary
---

## 审查结论

首轮审查。内部三层审查因当前会话没有可调用的 Agent 工具，按 `bmenhance-cr-01-reviewer` 降级规则改为当前上下文串行执行；Blind Hunter、Edge Case Hunter、Acceptance Auditor 三层均完成，未出现单层审查失败。

验证命令整体通过：focused outcome tests、既有 install/CLI 回归、`npm run build`、全量 `npm test`、`git diff --check` 均通过。但发现 1 个阻塞 Story 8.2 AC1 的功能问题：真实 `prewrite-paused` 分支没有输出 AC 要求的两个 Next Actions 命令。因此本轮结论为：不通过。

## 新发现

### 1. [中] 真实 prewrite-paused 分支缺少 AC1 要求的 `--yes` 和 `--interactive` Next Actions

- **来源**：edge+auditor
- **分类**：patch

- **证据**
  - `src/commands/install.ts:191-199` 在无 `--yes` 时直接返回 `createTargetNextActions(targetDirectoryState, context.writeAuthorized)`。
  - `src/commands/install.ts:1325-1327` 的未授权分支只返回 `Confirm the target directory before continuing with later install stages.`。
  - `src/diagnostics/output.ts:953-968` 的 `formatInstallOutcomeNextActions()` 对 `prewrite-paused` 直接返回 `result.nextActions`，没有补齐 `speclite install <target> --yes` 和 `speclite install <target> --interactive`。
  - 定向复现命令：
    `tmp=$(mktemp -d /tmp/speclite-cr82-prewrite-XXXXXX); node dist/bin/speclite.js install "$tmp" --locale en-US; rm -rf "$tmp"`
    实际输出包含 `Outcome: prewrite-paused`，但 `Next Actions / Next actions:` 下只有 `Confirm the target directory before continuing with later install stages.`，没有 `speclite install <target> --yes` 或 `speclite install <target> --interactive`。
  - `test/install-outcome-human-output.test.ts:21-35` 只用 synthetic `createInstallSuccessResult()` 手工传入符合 AC 的 `nextActions`，没有覆盖真实 `runInstallCommand()` / CLI 的 prewrite branch，因此测试没有捕获该回归。

- **影响**
  - 违反 AC1：`prewrite-paused` 的 Next Actions 必须同时给出默认安装命令 `speclite install <target> --yes` 与自定义安装命令 `speclite install <target> --interactive`。
  - 首次安装用户看到的真实 CLI 输出仍是泛化提示，无法从 outcome output 直接得到下一步安装命令。

- **建议**
  - 在真实 install prewrite 分支生成 branch-specific Next Actions，至少覆盖 `speclite install <target> --yes` 与 `speclite install <target> --interactive`。
  - 补充基于 `runInstallCommand()` 或 `createSpecliteProgram()` 的 focused test，避免只通过 synthetic renderer result 覆盖 AC1。

## 验证摘要

- `npm test -- test/install-outcome-human-output.test.ts` ✅ 通过（1 file / 5 tests）
- `npm test -- test/cli-smoke.test.ts test/install-progress-ready-summary.test.ts test/install-module-selection.test.ts` ✅ 通过（3 files / 31 tests）
- `npm run build` ✅ 通过（tsup build success）
- `npm test` ✅ 通过（49 files / 342 tests）
- `git diff --check` ✅ 通过
- 定向复现 ❌ 失败：
  - `tmp=$(mktemp -d /tmp/speclite-cr82-prewrite-XXXXXX); node dist/bin/speclite.js install "$tmp" --locale en-US; rm -rf "$tmp"`
  - 预期：`prewrite-paused` Next Actions 包含 `speclite install <target> --yes` 和 `speclite install <target> --interactive`。
  - 实际：只包含 `Confirm the target directory before continuing with later install stages.`。

## 通过项

- `install --json --yes` 输出未新增 public JSON `outcome` 字段；定向 JSON 输出只包含既有 `data` 字段集合。
- `ready` 分支可区分默认 no-prompt 与 explicit interactive 文案，相关 CLI smoke tests 通过。
- `ready-check-failed`、`write-failed` renderer 路径会展示 failed step、completed write scope 和 pending steps，focused tests 通过。
- `NO_COLOR` / `CI` 无 ANSI 回归由既有 ready summary test 覆盖并通过。

## 结论

- **结论：不通过**
- **阻塞项**：Finding #1
- **建议**：先修复真实 prewrite branch 的 Next Actions 并补充 integration-level focused test，再进入 CR-02 evaluator。
