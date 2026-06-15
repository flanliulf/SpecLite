---
Story: 7-2
Round: 1
Date: 2026-06-15
Model Used: GPT-5 Codex (gpt-5-codex)
Review Source: 7-2-code-review-summary-20260615-round-1.md
Review Model: GPT-5 Codex (gpt-5-codex)
Type: Code Review Evaluation
---

## 评估总结

对 Story 7-2 的第 1 轮 CR 代码审查结果（首轮）进行逐条评估。审查共提出 2 个发现：1 个 `uninstall` installer-owned directory 删除缺陷，1 个 `sync` / `uninstall` human output 缺少 step state 的输出完整性缺口。经独立代码验证和临时目录复现，第 1 项确认有效且阻塞交付；第 2 项确认有效但不阻塞，可降级为 CR TODO。评估结论如下。

---

## 发现 #1 评估

### 审查原文

> **[中] `uninstall` 计划移除 installer-owned directory，但 apply 阶段不会递归删除目录**
> - 来源：edge+auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

Story AC4 明确要求 `uninstall` 只能移除 installer-owned 文件或目录，并保留 human-owned custom 文件和 workflow-owned artifacts：`_bmad-output/implementation-artifacts/stories/7-2-doctor-sync-and-uninstall-commands.md:35-39`。当前实现会把 ownership 为 `installer-owned` 的 files-index entry 统一规划成 `action: "remove"`：`src/commands/uninstall.ts:130-136`。apply 阶段对所有 remove action 只执行 `rm(target.absolutePath, { force: true })`：`src/commands/uninstall.ts:176-182`，没有对 directory 使用 `recursive: true`。

我在 `/tmp` 构造最小 target project 独立复现：files-index entry 指向 installer-owned directory `_speclite/scripts/tool`，目录内包含 `run.mjs`。运行 `runUninstallCommand({ options: { json: true, yes: true } })` 后得到 `status: "failure"`、`exitCode: 1`、`issueIds: ["file-integrity.uninstall-remove-failed"]`、`pendingSteps: ["remove:_speclite/scripts/tool"]`，且 `dirStillExists: true`。这与审查发现一致。

**严重性判断：合理**

原始严重性为 `[中]`，评估后按 CR 模板归类为 **P1 阻塞交付**。原因是该缺陷直接违反 AC4 的 directory 删除要求，并会在用户已授权且路径归属正确时导致 uninstall 失败，留下 installer-owned state，影响后续 reinstall / sync / validation。

**修复建议：可行**

审查建议可行。实现应在 apply 前识别目标 path 类型；对 directory 在现有 `resolveProjectRelativePath` containment 校验之后执行递归删除，例如使用 `lstat` 判定 directory 并对 directory 执行安全的 `rm(..., { recursive: true, force: true })`。同时需要补充 focused test，覆盖 files-index entry 指向 installer-owned directory 且目录内含文件时，`uninstall --json --yes` 成功删除整棵 directory，并继续保留 human-owned / workflow-owned paths。

**误报评估：非误报**

不是误报。代码路径和独立复现均证明该 directory case 当前失败。

---

## 发现 #2 评估

### 审查原文

> **[低] `sync` / `uninstall` human output 未展示失败 step state**
> - 来源：blind+auditor
> - 分类：patch

### 评估结论：⚠️ 有效但降级 — 建议纳入 CR TODO 跟踪（P2 优先级）

### 评估分析

**问题描述准确性：准确**

Story AC5 要求写入命令失败时输出 completed steps、failed step、pending steps 和 manual action：`_bmad-output/implementation-artifacts/stories/7-2-doctor-sync-and-uninstall-commands.md:41-45`。`sync` 命令会把 lifecycle fields 写入 `CommandResult.data`：`src/commands/sync.ts:61-70`；`uninstall` 在 remove failure 时也会写入 `completedSteps`、`failedStep`、`pendingSteps`：`src/commands/uninstall.ts:82-87`，并在 issue details 中写入 `manualAction`：`src/commands/uninstall.ts:275-280`。schema 也允许 `UninstallCommandData` 携带这些 lifecycle fields：`src/diagnostics/command-result-schema.ts:293-300`。

缺口发生在 human output renderer：`renderSyncHumanOutput` 只输出 plan、authorization、changed/skipped paths、conflicts、issues、next actions：`src/diagnostics/output.ts:405-449`；`renderUninstallHumanOutput` 只输出 plan、authorization、removed/preserved paths、issues、next actions：`src/diagnostics/output.ts:452-491`。相比之下，update renderer 在 lifecycle fields 存在时会输出 `Step State` block：`src/diagnostics/output.ts:339-350`。此外，issue details renderer 会过滤 array 值：`src/diagnostics/output.ts:749-755`，所以 `completedSteps` / `pendingSteps` 不会通过 Issues 行补偿展示。

我用最小 `SyncCommandResult` / `UninstallCommandResult` object 调用 renderer 独立验证：即使 data 中包含 `completedSteps`、`failedStep`、`pendingSteps`，`renderSyncHumanOutput` 和 `renderUninstallHumanOutput` 的输出也均不包含 `Step State`、`Failed step:` 或 `Pending steps:`。

**严重性判断：偏高为阻塞则不合理；作为低优先级合理**

原始严重性 `[低]` 合理。该问题影响非 JSON 用户的诊断完整性和 AC5 human output 体验，但 JSON data 已保留 lifecycle state，`uninstall` issue details 也包含可渲染的 `manualAction` 字符串。因此它应作为 **P2 CR TODO** 跟踪，而不应与发现 #1 一起阻塞当前修复闭环。

**修复建议：可行但非必要**

审查建议可行：为 `renderSyncHumanOutput` 和 `renderUninstallHumanOutput` 增加与 update renderer 等价的 `Step State` block，并补充 human output focused tests。由于这属于输出完整性增强，建议进入 CR TODO，在阻塞功能缺陷修复后安排。

**误报评估：非误报**

不是误报。renderer 行为与审查描述一致，但优先级应维持 P2 非阻塞。

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | `uninstall` 无法递归删除 installer-owned directory | [中] | **P1** | 直接违反 AC4，已通过临时 target project 复现 failure 且目录仍存在。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 2 | `sync` / `uninstall` human output 未展示失败 step state | [低] | **P2** | JSON lifecycle data 已存在，human renderer 缺少 Step State block；建议后续补齐输出体验与 focused tests。 |

### 可忽略（误报）

无。

### 评估决定

- **发现 #1（`uninstall` 无法递归删除 installer-owned directory）**：确认有效，必须修复；本轮 CR 评估不通过，不能 Approved。
- **发现 #2（`sync` / `uninstall` human output 未展示失败 step state）**：确认有效但降级为 P2 CR TODO，不阻塞本轮 fixer 对 P1 的修复。
- **最终决定**：Not Approved。需要执行 fixer，至少修复 1 个 P1 阻塞项，并建议登记 1 个 P2 CR TODO；误报 0 个。

## 修复执行记录

### 修复执行记录
- **Date**: 2026-06-15
- **Model Used**: GPT-5 Codex (gpt-5-codex)
- **Fix Items**: 1

#### 修复项 #1：`uninstall` 无法递归删除 installer-owned directory

- **对应评估发现**: 发现 #1，P1 阻塞项。
- **修复范围**: `src/commands/uninstall.ts`、`test/uninstall-command.test.ts`。
- **修复内容**:
  - 在 `applyUninstallPlan` 中保留既有 `resolveProjectRelativePath` containment 校验。
  - 对 remove action 的目标先通过 `lstat` 判定路径类型；当目标为 directory 时执行 `rm(..., { force: true, recursive: true })`，非 directory 保持非递归删除。
  - 保留缺失路径在 `force: true` 下可继续完成的原有行为。
  - 扩展 `uninstall` safety test，使 `files-index` 包含 installer-owned directory `_speclite/scripts/tool`，并验证 `uninstall --json --yes` 成功删除整棵目录且继续保留 human-owned / workflow-owned 路径。
- **未处理项**: 发现 #2 已由 evaluator 降级为 P2 CR TODO，本轮未修复。
- **验证结果**:
  - `npm test -- --run test/uninstall-command.test.ts`：通过，1 个 test file / 1 个 test passed。
  - `npm run build`：通过，ESM 与 DTS build success。
  - `npm test`：通过，43 个 test files / 316 个 tests passed。
- **结果**: P1 阻塞项已修复，当前 fixer 范围内无剩余 blocker。
