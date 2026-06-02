---
Story: 1-3
Round: 4
Date: 2026-05-28
Model Used: GPT-5 Codex (gpt-5-codex)
Review Source: 1-3-code-review-summary-20260528-round-4.md
Review Model: GPT-5 Codex (gpt-5-codex)
Type: Code Review Evaluation
---

## 评估总结

对 Story 1-3 的第 4 轮 CR 代码审查结果（复审）进行逐条评估。本轮 reviewer 结论为不通过，提出 1 个 `patch` finding：pre-write package root count summary 可能与 detailed config 后的最终 selected module set 不一致。评估结论如下。

---

## 上轮问题回顾确认

### Round 3 P1 默认 human quick 子路径：已部分关闭

Round 4 reviewer 对 Round 3 修复的判断准确：`runInstallCommand` 现在会在调用 `configureProject` 前构造 `configPromptInput`，并把 `createPrewriteModuleSummary(...)` 写入 prompt（`src/commands/install.ts:250-265`）；该 summary 包含 selected modules、source descriptor、capability scope、pending write phases、`No project files were changed.` 和 canonical package root count（`src/commands/install.ts:718-740`）。新增测试在 `configureProject` 回调内断言 prompt 包含 `core=13, sdlc=40, total=53`，并调用 `assertNoInstallWrites` 证明此时尚未创建 `_speclite`、`_speclite-output`、IDE mirror、manifest 或 config 产物（`test/install-module-selection.test.ts:106-140`、`test/install-module-selection.test.ts:373-386`）。

### Round 3 P1 最终 selected module set 绑定：仍未关闭

该修复发生在 `configSelection` 产生之前，因此 summary 使用的是配置前 `selectedModules`（`src/commands/install.ts:250-265`）。随后 detailed config 仍可返回 `selectedModuleIds`，`runInstallCommand` 才据此计算 `finalSelectedModuleIds` 与 `finalSelectedModules`（`src/commands/install.ts:290-311`），并在没有再次展示 / 确认最终 summary 的情况下进入 `applyInstallPlan(...)`（`src/commands/install.ts:330-348`）。因此 Round 3 P1 只对默认 quick 子路径关闭，对 detailed config 改变安装范围的路径仍未关闭。

### 历史 CR TODO（非阻塞）

| # | 发现 | 状态 | 评估意见 |
|---|------|------|---------|
| - | 无 | 无 | Round 4 review 记录“仍为非阻塞待办：无”（`_bmad-output/implementation-artifacts/code-reviews/1-3-code-review/1-3-code-review-summary-20260528-round-4.md:22-24`）。 |

---

## 发现 #1 评估

### 审查原文

> **[中][上轮遗留] Pre-write package root count summary 可能与最终 selected module set 不一致**
> - 来源：blind+edge+auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

Story AC7 要求安装范围摘要必须列出 selected modules、module versions、capability/scope summary、source descriptor summary、每个 selected module 的 canonical package root count 和后续完整能力范围，并且必须在任何 project file write 之前展示给用户确认；该摘要也不能是写入后的 ready summary（`_bmad-output/implementation-artifacts/stories/1-3-official-module-selection-and-install-summary.md:64-70`）。

当前实现中，`createPrewriteModuleSummary(...)` 已被接入 `configureProject` prompt，但输入来自配置前的 `selectedModules`（`src/commands/install.ts:250-265`、`src/commands/install.ts:718-740`）。而 config prompt 本身说明 detailed config 可以调整 selected modules（`src/installer/config-initialization.ts:182-199`），CLI adapter 也确实在 detailed flow 中收集 `selectedModuleIds` 并返回给 `runInstallCommand`（`src/bin/speclite.ts:153-192`）。之后 `runInstallCommand` 使用 `configSelection?.selectedModuleIds` 计算最终安装模块，并直接构造 `InstallPlan`、调用 `applyInstallPlan(...)`（`src/commands/install.ts:290-348`）。这说明 pre-write prompt 与最终写入范围之间存在可观察的不一致窗口。

定向复现也确认该路径真实存在：当 `configureProject` 返回 `mode: "detailed"` 且 `selectedModuleIds: ["core"]` 时，pre-write prompt 仍包含 `Canonical package roots: core=13, sdlc=40, total=53.`，不包含 `Canonical package roots: core=13, total=13.`；最终结果 `installedModules` 为 `["core"]`，final summary 包含 `Canonical package roots: core=13, total=13.`，且 `config.toml` 不包含 `[modules.sdlc]`。这与 reviewer 的证据一致。

现有测试只覆盖默认 quick prompt 路径：新增测试断言 `configureProject` 回调时 prompt 包含 `core=13, sdlc=40, total=53` 并且尚无安装产物（`test/install-module-selection.test.ts:106-140`）。CLI detailed 测试会收集 detailed config values、selected modules 和 IDE targets，但使用 `core sdlc`，没有覆盖 detailed config 将 selected module set 改为 `core` only 后的最终 pre-write summary 一致性（`test/cli-smoke.test.ts:126-177`）。

**严重性判断：合理**

原始严重性为“中”，但该问题直接影响 AC7 的核心保证：用户在 project writes 前看到的 install scope summary 必须描述“本次即将写入”的 selected modules 和 canonical package root closure。如果 detailed config 在 summary 之后改变 selected module set，用户确认的 count 与实际 IDE mirror、skill index、files index、ReadyCheck 范围不一致。该缺口阻塞 Story 1-3 的验收，评估后定为 P1。

**修复建议：可行**

reviewer 建议可行。推荐默认修复方向是在 `finalSelectedModules` 与 `configPlan` 都确定之后、`applyInstallPlan(...)` 之前，生成并展示 / 确认最终 pre-write install scope summary；该 summary 应基于最终 selected module set，包含 selected modules、versions、source descriptor、capability scope、per-module package root counts、planned write phases 和 no-write evidence。替代方案是收紧 detailed config 边界：如果已有 pre-write summary 被视为最终安装范围确认，则 detailed config 不应再改变 selected module set；若仍允许改变，则必须追加第二次最终 summary confirmation。

**误报评估：非误报**

本次评估通过代码路径、现有测试缺口和定向复现确认 finding 成立。Round 4 reviewer 不是误报。

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | Pre-write package root count summary 可能与最终 selected module set 不一致 | [中] | **P1** | detailed config 可在当前 pre-write summary 之后改变 selected modules，导致用户写入前看到的 count 与最终安装范围不一致。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| - | 无 | - | - | 本轮没有可降级为 CR TODO 的 finding。 |

### 可忽略（误报）

| # | 发现 | 原始严重性 | 忽略理由 |
|---|------|----------|---------|
| - | 无 | - | 本轮 finding 已确认有效。 |

### 评估决定

- **发现 #1（pre-write package root count summary 可能与最终 selected module set 不一致）**：确认有效，P1 阻塞。evaluator 结论为不通过，需要执行 fixer。
- **默认推荐决策**：优先在最终 selected module set 和 `configPlan` 确定后、`applyInstallPlan(...)` 前补齐最终 pre-write summary / confirmation；如果产品边界决定 detailed config 不能改变 selected modules，则需要同步收紧 detailed config 输入与测试。
- 本次按用户要求停止在 evaluator，不执行 fixer / finalizer，不修改源码、测试或 Story 文档。

## 修复执行记录

### 修复执行记录
- **Date**: 2026-05-28
- **Model Used**: GPT-5 Codex (gpt-5-codex)
- **Fix Items**: 1

#### 修复项 #1：最终 selected module set 的 pre-write install scope summary / confirmation

- **评估结论来源**: Round 4 finding #1，P1，需要修复。
- **采用决策**: 采用 evaluator 默认推荐方案；不收紧 detailed config 的 selected modules 调整能力，而是在 `finalSelectedModules` 与 `configPlan` 均确定之后、`applyInstallPlan(...)` 之前生成并确认最终 pre-write install scope summary。
- **修改文件**:
  - `src/commands/install.ts`: 新增 `PrewriteInstallScopeConfirmationInput` 与 `confirmPrewriteInstallScope` 回调入口；在 `configPlan.ok` 后、`InstallPlanSchema.parse(...)` / `applyInstallPlan(...)` 前生成最终 pre-write summary，并在 non-JSON human flow 中调用确认回调。新增 summary 基于最终 `finalSelectedModules`，包含 selected modules + versions、source descriptor、capability scope、per-module canonical package root counts、IDE targets、planned config writes、planned write phases 和 no-write evidence。
  - `src/bin/speclite.ts`: CLI adapter 接入最终 pre-write scope confirmation prompt，要求用户在任何 project file write 前确认最终 install scope。
  - `test/install-module-selection.test.ts`: 新增 detailed config 将 selected modules 从 `core+sdlc` 改为 `core` 的 regression test，断言最终 pre-write prompt 为 `core=13,total=13`，不再显示旧的 `core=13,sdlc=40,total=53`，并在确认回调内验证尚无 `_speclite`、`_speclite-output`、IDE mirror、manifest 或 config 写入。
  - `test/cli-smoke.test.ts`: 更新 CLI human prompt 断言，覆盖新增最终 pre-write install scope confirmation prompt。
- **验证命令与结果**:
  - `npm test -- --run test/install-module-selection.test.ts`: 通过，1 file / 10 tests。
  - `npm test -- --run test/cli-smoke.test.ts`: 通过，1 file / 4 tests。
  - `npm test -- --run test/source-and-modules.test.ts test/install-module-selection.test.ts test/config-initialization.test.ts test/runtime-structure.test.ts test/install-progress-ready-summary.test.ts test/ide-target-writer.test.ts test/menu-target-validation.test.ts test/cli-smoke.test.ts`: 通过，8 files / 58 tests。
  - `npm test`: 通过，20 files / 118 tests。
  - `git diff --check`: 通过。
  - `npm run build`: 通过，ESM 与 DTS build success。
- **修复结果**: 成功。detailed config 仍可调整 selected modules，但写入前最终确认摘要已绑定最终 selected module set；当最终范围为 `core` only 时，用户在 project writes 前看到的 canonical package root count 与最终安装范围一致。
