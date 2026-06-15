---
Story: 8-2
Round: 1
Date: 2026-06-16
Model Used: GPT-5 Codex (gpt-5-codex)
Review Source: 8-2-code-review-summary-20260616-round-1.md
Review Model: GPT-5 Codex (gpt-5-codex)
Type: Code Review Evaluation
---

## 评估总结

对 Story 8-2 的第 1 轮 CR 代码审查结果（首轮）进行逐条评估。本轮审查提出 1 个新发现：真实 `prewrite-paused` 分支缺少 Story 8.2 AC1 要求的 `speclite install <target> --yes` 与 `speclite install <target> --interactive` Next Actions。经独立代码检查和临时目录 CLI 复现，发现成立，且阻塞 AC1 交付。评估结论如下。

---

## 发现 #1 评估

### 审查原文

> **[中] 真实 prewrite-paused 分支缺少 AC1 要求的 `--yes` 和 `--interactive` Next Actions**
> - 来源：edge+auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

Story 8.2 AC1 明确要求：用户执行 `speclite install <target>` 且未传入 `--yes`、命令在写入前暂停时，输出 outcome 为 `prewrite-paused`，并且 Next Actions 同时给出默认安装命令 `speclite install <target> --yes` 与自定义安装命令 `speclite install <target> --interactive`。见 `_bmad-output/implementation-artifacts/stories/8-2-install-outcome-oriented-output.md:15-20`。

真实 install orchestration 在无 `--yes` 且需要写入前暂停时，直接把 `createTargetNextActions(targetDirectoryState, context.writeAuthorized)` 的结果写入 success result，见 `src/commands/install.ts:191-199`。而 `createTargetNextActions()` 的未授权分支只返回 `Confirm the target directory before continuing with later install stages.`，没有生成目标化的 `speclite install <target> --yes` 或 `speclite install <target> --interactive`，见 `src/commands/install.ts:1325-1327`。

renderer 侧也没有补齐该缺失：`formatInstallOutcomeNextActions()` 对 `prewrite-paused` 走默认路径，直接返回 `result.nextActions`，见 `src/diagnostics/output.ts:953-968`。因此缺口存在于真实 command result / renderer 组合路径，而不是仅存在于审查描述中。

独立复现命令：

```sh
tmp=$(mktemp -d /tmp/speclite-cr82-eval-XXXXXX); node dist/bin/speclite.js install "$tmp" --locale en-US; rm -rf "$tmp"
```

复现输出包含 `Outcome: prewrite-paused`，但 `Next Actions / Next actions:` 下只有 `Confirm the target directory before continuing with later install stages.`，未包含 `speclite install <target> --yes` 或 `speclite install <target> --interactive`。

现有 focused test 不能证明真实分支满足 AC1：`test/install-outcome-human-output.test.ts:10-35` 使用 synthetic `createInstallSuccessResult()` 手工传入符合 AC 的 `nextActions` 后只测试 renderer 输出；它没有调用 `runInstallCommand()` 或 `createSpecliteProgram()` 覆盖真实无 `--yes` prewrite branch。已有 CLI smoke tests 覆盖 `install --yes` 和 `install --yes --interactive` 成功路径，见 `test/cli-smoke.test.ts:133-210`，但不覆盖 `speclite install <target>` 无 `--yes` 的 prewrite-paused Next Actions。

**严重性判断：偏低**

原始严重性为 `[中]`，但该问题直接违反 Story 8.2 AC1 的明确验收条件，属于功能缺陷和质量门禁违规。用户首次安装时无法从真实 CLI 输出获得继续安装的默认命令和自定义命令，AC1 未满足。因此评估后应提升为 **P1 阻塞交付**。

**修复建议：可行**

审查建议可行：需要在真实 install prewrite 分支生成 branch-specific Next Actions，至少覆盖 `speclite install <target> --yes` 与 `speclite install <target> --interactive`。测试也应补充基于 `runInstallCommand()` 或 `createSpecliteProgram()` 的 focused test，直接覆盖无 `--yes` 的真实 prewrite-paused 分支，避免 synthetic renderer result 掩盖 command-result 生成缺口。

**误报评估：非误报**

该发现由 Story AC、真实代码路径、现有测试覆盖缺口和临时目录 CLI 复现共同支持，不是误报。

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | 真实 `prewrite-paused` 分支缺少 AC1 要求的 `--yes` 和 `--interactive` Next Actions | [中] | **P1** | 直接违反 Story 8.2 AC1，真实 CLI 输出没有给出继续安装的两条命令，阻塞交付。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| - | - | - | - | 本轮无建议纳入 CR TODO 的非阻塞项。 |

### 可忽略（误报）

| # | 发现 | 原始严重性 | 忽略理由 |
|---|------|----------|---------|
| - | - | - | 本轮无误报。 |

### 评估决定

- **发现 #1（真实 `prewrite-paused` 分支缺少 AC1 要求的 Next Actions）**：确认有效，升级为 **P1 阻塞修复**。需要进入 fixer，修复真实 prewrite branch 的 Next Actions，并补充真实 CLI / `runInstallCommand()` / `createSpecliteProgram()` focused test 后再复审。

## 修复执行记录

### 修复执行记录
- **Date**: 2026-06-16
- **Model Used**: GPT-5 Codex (gpt-5-codex)
- **Fix Items**: 1

#### 修复范围

- 修复确认有效的 P1：真实 `prewrite-paused` branch 缺少 AC1 要求的 Next Actions。
- 未实现 Story 8.3-8.7；未新增 public JSON fields；未改变 install core 行为、source resolution、module selection、ReadyCheck core behavior。
- 未修改 Story 文档内容或 `sprint-status.yaml`。

#### 修改文件

- `src/commands/install.ts`：`shouldStopBeforeSourceSelection()` 的无 `--yes` prewrite-paused 成功结果现在向 `createTargetNextActions()` 传入真实 target display path；未授权写入分支输出 `speclite install <target> --yes` 与 `speclite install <target> --interactive` 两条 Next Actions。
- `test/install-outcome-human-output.test.ts`：新增 focused test，覆盖 `runInstallCommand()` 真实 command result 与 `createSpecliteProgram()` 真实 CLI human output，验证无 `--yes` prewrite-paused 分支包含两条目标化 Next Actions。

#### 验证结果

- `npx vitest run test/install-outcome-human-output.test.ts`：通过，1 file / 6 tests passed。
- `npm test -- test/cli-smoke.test.ts test/install-progress-ready-summary.test.ts test/install-module-selection.test.ts`：通过，3 files / 31 tests passed。
- `npm run build`：通过，tsup build success。
- `npm test`：通过，49 files / 343 tests passed。
- `git diff --check`：通过。

#### HALT / 阻塞 / 遗留风险

- 未触发 HALT。
- 无阻塞。
- 未发现与本 P1 修复相关的遗留风险；当前工作树仍包含进入本次 fixer 前已存在的 Story 8.1 / 8.2 目标内改动和文档状态，本次未回滚、覆盖或清理这些改动。
