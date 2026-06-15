---
Story: 8-1
Round: 1
Date: 2026-06-16
Model Used: GPT-5 Codex (gpt-5-codex)
Review Source: 8-1-code-review-summary-20260616-round-1.md
Review Model: GPT-5 Codex (gpt-5-codex)
Type: Code Review Evaluation
---

## 评估总结

对 Story 8-1 的第 1 轮 CR 代码审查结果（首轮）进行逐条评估。本轮审查提出 2 个 `patch` 类发现，分别涉及 install ready summary 写入状态误报和 `validate` zh-CN empty state 英文硬编码。经只读代码验证，2 个发现均确认有效，均应作为阻塞交付的 P1 修复项处理；本轮未识别误报，暂无建议转入 CR TODO 的非阻塞项。

---

## 发现 #1 评估

### 审查原文

> **[中] Install ready summary 将已授权并完成写入的安装结果显示为未写入**
> - 来源：blind+edge+auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

`src/diagnostics/output.ts:109-136` 的 `formatOutcomeSummary()` 通过 `commandChangedProjectFiles()` 判断 `Writes`/`写入状态`，而 `commandChangedProjectFiles()` 只检查 `result.data.changedPaths` 和 `result.data.removedPaths`。`src/diagnostics/command-result-schema.ts:120-130` 定义的 `InstallCommandDataSchema` 仅包含 `sourceDescriptor`、`manifestVersion`、`installedModules`、`ideTargets`、`paths`、`completedSteps`、`pendingSteps`，没有 `changedPaths` 或 `removedPaths`，因此 install 结果会被该共享 summary 判为 `writeNone`。

`src/commands/install.ts:753-790` 和 `src/commands/install.ts:1071-1095` 显示 successful install ready result 在 `runtime-structure`、`ide-mirror-creation`、`manifest-generation`、`ready-check`、`ready-summary` 完成后返回，且 `renderInstallReadySummary()` 在 `src/diagnostics/output.ts:659-717` 又明确输出 `--yes` 授权写入证据。此时 summary 仍显示 `写入状态：未写入项目文件`，与 install ready 语义冲突。

**严重性判断：合理**

原始严重性为 `[中]`，评估后按 CR-02 优先级归为 **P1**。理由是该问题直接影响 Story 8.1 对 shared presentation semantics 的核心目标：write-capable command 必须清楚回答是否写入项目文件。对 `install --yes` ready summary 来说，误报为未写入会造成用户对实际文件写入状态的错误判断，属于用户可见功能缺陷。

**修复建议：可行**

审查建议可行。修复方向应避免让 shared outcome 只依赖 `changedPaths` / `removedPaths` 推断所有 command 的写入状态，可为 install ready / ready-check-failed 等分支传入 explicit write state，或允许 command renderer 覆盖 `writes` 行。同时需要补充 focused test，覆盖 `install --yes` ready summary 的写入状态，以及 prewrite install result 仍显示未写入的场景。

**误报评估：非误报**

不是误报。代码中存在可验证的数据结构缺口和 renderer 推断缺陷，且多来源 `blind+edge+auditor` 同时命中，可信度高。

---

## 发现 #2 评估

### 审查原文

> **[中] `validate` 的 zh-CN empty state 仍硬编码英文文案**
> - 来源：edge+auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

`src/diagnostics/output.ts:328-354` 的 `renderValidateHumanOutput()` 在 `result.issues.length === 0` 时直接追加英文字符串：`No issues found for checked categories.`、`No conflicts detected.`、`No categories checked.`、`Skipped / not checked categories are listed above and must not be interpreted as healthy.`。这些分支没有通过 `getCliMessage()` 或 locale catalog。

`src/cli/messages.ts:33-80` 已存在 `MESSAGE_CATALOG`，且 zh-CN catalog 覆盖了 shared empty state keys，例如 `noIssues`、`noConflicts`、`noPlannedWrites`、`noCheckedItems`。但 validate-specific empty state 没有接入 catalog。`test/validate-command.test.ts:613-627` 当前还显式断言默认 human output 包含英文 empty state，因此现有测试会固化该行为；`test/cli-output-presentation.test.ts:50-72` 只覆盖 status/update 的 zh-CN empty state，没有覆盖 `validate` zh-CN 的自然语言空状态。

**严重性判断：合理**

原始严重性为 `[中]`，评估后按 CR-02 优先级归为 **P1**。该问题直接违反 Story 8.1 对 zh-CN human output 的本地化语义要求，并且出现在 shared presentation frame 的 `Empty State（空状态）` 区块中，属于用户可见功能缺陷，而不是可延后文案优化。

**修复建议：可行**

审查建议可行。应将 validate-specific empty state 文案纳入 `CliMessageKey` / `MESSAGE_CATALOG`，或通过 command-specific message lookup 传入，并补充 zh-CN focused test，断言自然语言文案中文化，同时继续保留 `checkedCategories`、issue id、path 等 technical identifiers 的英文形态。

**误报评估：非误报**

不是误报。代码中存在硬编码英文字符串，且当前测试缺口和既有英文断言能解释为什么问题未被 Story 8.1 focused tests 捕获。

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | Install ready summary 将已授权并完成写入的安装结果显示为未写入 | [中] | **P1** | `InstallCommandResult` 无 `changedPaths`/`removedPaths`，shared summary 将 ready install 误判为未写入。 |
| 2 | `validate` 的 zh-CN empty state 仍硬编码英文文案 | [中] | **P1** | validate-specific empty state 未接入 locale catalog，zh-CN 输出仍出现英文自然语言。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| - | - | - | - | 本轮无建议转入 CR TODO 的非阻塞项。 |

### 可忽略（误报）

| # | 发现 | 原始严重性 | 忽略理由 |
|---|------|----------|---------|
| - | - | - | 本轮未识别误报。 |

### 评估决定

- **发现 #1（Install ready summary 写入状态误报）**：确认有效，建议进入 fixer，按 P1 阻塞项修复，并补充 focused test 覆盖 ready install 与 prewrite install 的写入状态差异。
- **发现 #2（validate zh-CN empty state 英文硬编码）**：确认有效，建议进入 fixer，按 P1 阻塞项修复，并补充 zh-CN validate empty-state focused test。
- **整体决定**：本轮 CR 评估不通过交付门禁，需要执行 CR-03 fixer；无需新增 CR TODO；无需忽略任何 finding。

## 修复执行记录

### 修复执行记录
- **Date**: 2026-06-16
- **Model Used**: GPT-5 Codex (gpt-5-codex)
- **Fix Items**: 2

#### 修复项 #1：Install ready summary 写入状态误报

- **修改文件**: `src/diagnostics/output.ts`、`test/cli-output-presentation.test.ts`
- **修复内容**: 为 shared presentation frame 增加 `writeState` 覆盖机制，默认仍使用 `changedPaths` / `removedPaths` 自动推断；仅 `renderInstallReadySummary()` 对 ready install 显式传入 `writeState: "changed"`，并让 empty state 使用同一覆盖状态，避免 Ready Summary 再显示“未写入项目文件”。
- **回归覆盖**: 新增 focused test 同时断言 prewrite install 仍显示“写入状态：未写入项目文件”，ready install 显示“写入状态：已写入项目文件”。
- **结果**: 已修复。

#### 修复项 #2：validate zh-CN empty state 英文硬编码

- **修改文件**: `src/cli/messages.ts`、`src/diagnostics/output.ts`、`test/cli-output-presentation.test.ts`
- **修复内容**: 将 validate-specific empty state 文案加入 `CliMessageKey` / `MESSAGE_CATALOG`，`renderValidateHumanOutput()` 改为通过 `getCliMessage()` 读取文案；`zh-CN` 输出自然语言中文化，`checked categories`、`skipped / not checked categories`、`healthy` 等技术标识保持英文。
- **回归覆盖**: 新增 focused test 断言 `zh-CN` validate empty state 包含中文化文案，并不再包含原英文硬编码句子。
- **结果**: 已修复。

#### 验证结果

- `npm test -- test/cli-output-presentation.test.ts`：通过，1 个 test file，6 个 tests。
- `npm test -- test/validate-command.test.ts`：通过，1 个 test file，18 个 tests。
- `npm test -- test/cli-smoke.test.ts`：通过，1 个 test file，11 个 tests。
- `npm test -- test/status-command.test.ts test/update-command.test.ts test/update-planning.test.ts test/install-progress-ready-summary.test.ts test/install-module-selection.test.ts`：通过，5 个 test files，60 个 tests。
- `npm run build`：通过。
- `npm test`：通过，48 个 test files，337 个 tests。
