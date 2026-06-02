---
Story: 1-3
Round: 3
Date: 2026-05-28
Model Used: GPT-5 Codex (gpt-5-codex)
Type: Code Review Summary
---

## 审查结论

本轮为复审。当前执行环境无独立 `Agent` 工具，已按 reviewer skill 降级为主流程串行三层审查；Blind Hunter、Edge Case Hunter、Acceptance Auditor 三个视角均已覆盖，但不具备独立 sub-agent 上下文隔离。Round 2 历史 CR / evaluator 已通过，本轮重点复核 reopened corrective dev verification 新增的 full canonical package root closure。实际代码与测试已验证 `core=13`、`sdlc=40`、total `53` 的发现、安装后 IDE mirror / skill index / ReadyCheck 投影和回归测试，但发现 1 个新的 AC7 阻塞缺口：package root count evidence 没有真正出现在成功路径的写入前展示结果中。当前 reviewer 结论为不通过，建议进入 fixer；本轮按用户要求不启动 fixer。

## 上轮问题回顾

### 已修复

1. Round 1 / Finding #1 — Install 命令没有任何用户模块选择入口，AC6 尚未真正落地
   - Round 2 reviewer 与 Round 2 evaluator 已确认 human interactive module selection 接入 command path，invalid id 有 stable diagnostic，测试覆盖充分。
   - 本轮未发现该问题回归。

2. Round 1 / Finding #2 — Selected modules 只存在于 summary 文本，没有进入 internal `InstallPlan.selectedModules`
   - Round 2 reviewer 与 Round 2 evaluator 已确认 install path 构造 internal `InstallPlan.selectedModules`，public `CommandResult` 未暴露未契约化字段。
   - 本轮未发现该问题回归。

3. Round 1 / Finding #3 — `required_dependencies` 指向不存在模块时会被静默忽略
   - Round 2 reviewer 与 Round 2 evaluator 已确认 metadata discovery 会阻断 unknown dependency，并通过 install path 输出 deterministic diagnostic reason。
   - 本轮未发现该问题回归。

### 仍为非阻塞待办

无。

## 新发现

### 1. [中][新] Canonical package root count 没有真正出现在成功路径的写入前展示结果中

- **来源**：blind+auditor
- **分类**：patch

- **证据**
  - Story AC7 要求安装范围摘要列出每个 selected module 的 canonical package root count，并且默认 `core` + `sdlc` 摘要必须表达 `53` 个 canonical package roots 将进入后续 IDE mirror、skill index、files index 和 ReadyCheck；该摘要必须在任何 project file write 之前展示给用户确认，且不是 Story 1.6 ready summary（`_bmad-output/implementation-artifacts/stories/1-3-official-module-selection-and-install-summary.md:64-70`）。
  - corrective 改动确实把 count 放进 config summary：`src/installer/config-initialization.ts:157-179` 返回 `summary`，`src/installer/config-initialization.ts:345-359` 包含 `Canonical package roots: ...` 和 “before any project file is written” 文案。
  - 但 `runInstallCommand` 成功路径在 `configPlan.ok` 后没有输出或要求确认 `configPlan.summary`，而是直接构造 `installPlan` 并调用 `applyInstallPlan`（`src/commands/install.ts:295-341`）。
  - 用户最终看到的 success `summary` 来自 `createInstalledReadySummary`（`src/commands/install.ts:402-419`），此时 `completedSteps` 已包含 `runtime-structure`、`ide-mirror-creation`、`manifest-generation`、`ready-check`、`ready-summary`，不再是写入前摘要。
  - 现有 test 只断言完整成功结果中出现 `Canonical package roots: core=13, sdlc=40, total=53.`，同时断言 `completedSteps` 已到 `ready-summary`（`test/install-module-selection.test.ts:55-78`）；未覆盖写入前展示或确认。
  - `createPrewriteModuleSummary` 仍未被调用，且自身没有 package root count 字段（`src/commands/install.ts:711-732`）。

- **影响**
  - Corrective Task 10 的核心计数事实已被发现并用于写入后验证，但 AC7 的用户可见时序仍不满足：用户不能在 project writes 发生前看到包含 `core=13`、`sdlc=40`、total `53` 的 install scope summary。
  - 当前测试可能给出误导性通过信号，因为它验证的是写入后的 ready summary / final result，而不是 Story 1.3 要求的 pre-write install scope summary。

- **建议**
  - 在成功路径进入 `applyInstallPlan` 之前，将包含 selected modules、module versions、capability scope、source descriptor summary、per-module package root counts 和 pending write phases 的 pre-write summary 暴露为实际用户可见/可确认的结果或 prompt input。
  - 复用或修正 `createPrewriteModuleSummary`：加入 `Canonical package roots: core=13, sdlc=40, total=53.`，并确保它在 project writes 前被调用，而不是仅保留未使用 helper。
  - 补充测试：验证写入前 summary / confirmation 输入包含 canonical package root counts，并断言在该阶段 `_speclite`、`_speclite-output`、IDE mirrors、manifest/index 尚未创建；保留 final ready summary 中的 count 可作为补充而非 AC7 的唯一证据。

## 验证摘要

- ✅ `find assets/source/speclite/core-skills -name SKILL.md | wc -l`：13。
- ✅ `find assets/source/speclite/sdlc-skills -name SKILL.md | wc -l`：40。
- ✅ `git diff --check`：通过。
- ✅ `npm test -- --run test/source-and-modules.test.ts test/install-module-selection.test.ts test/runtime-structure.test.ts test/install-progress-ready-summary.test.ts test/ide-target-writer.test.ts test/menu-target-validation.test.ts`：6 files / 45 tests 通过。
- ✅ `npm test`：20 files / 116 tests 通过。
- ❌ `npm run lint`：失败，`package.json` 未定义 `lint` script；这不是本轮 corrective code finding。
- ✅ `npm run build`：通过，ESM 与 DTS build 成功。
- 额外复核：
  - `test/source-and-modules.test.ts` 已断言 default official module package roots 为 `core=13`、`sdlc=40`、total `53`，并核对当前 help skill ids 与 package roots 对齐。
  - `src/installer/ready-check.ts` 新增 selected package root 对 skill index 和 target skill count 的 ReadyCheck 校验，覆盖安装后投影完整性。
  - Public `CommandResult<InstallCommandData>` 未新增 `selectedModules` 或 `pendingModuleSelection` 字段；当前 count 只进入 summary 文本。

## 通过项

- Bundled official module discovery 当前能递归识别 canonical `SKILL.md` package roots，实际计数为 `core=13`、`sdlc=40`、total `53`。
- `module-help.csv` 仍作为 help/menu/phase projection metadata；新增 writer / menu target tests 覆盖 package root 没有 help/phase row 时仍可进入 IDE mirror 和 skill index。
- IDE mirror / skill index / files index / ReadyCheck 的 installed-state 投影已从代表性 workflow skill 扩展到完整 selected module package root closure。
- Fresh install expected JSON fixture 已从 54 skills 修正为 53 skills，并在 summary 中包含 canonical package root count。
- 本轮未发现 corrective 改动新增未契约化 public JSON field，未发现 npm registry、Git remote 或外部网络访问。

## 结论

- **结论：不通过**
- **阻塞项**：1 个。AC7 的 canonical package root count 需要出现在成功路径的写入前展示 / 确认结果中，而不是只出现在未输出的 config summary 或写入后的 ready summary。
- **新发现数量**：1。
- **分类**：`decision_needed: 0`，`patch: 1`，`defer: 0`，`dismiss: 0`。
- **建议**：进入 `bmenhance-cr-03-fixer` 修复该 patch，然后重新执行 reviewer/evaluator；本轮按用户要求不执行 evaluator / fixer / finalizer。
