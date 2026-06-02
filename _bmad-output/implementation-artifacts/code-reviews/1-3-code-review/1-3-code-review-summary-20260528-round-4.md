---
Story: 1-3
Round: 4
Date: 2026-05-28
Model Used: GPT-5 Codex (gpt-5-codex)
Type: Code Review Summary
---

## 审查结论

本轮为复审。当前执行环境无独立 `Agent` 工具，已按 reviewer skill 降级为主流程串行三层审查；Blind Hunter、Edge Case Hunter、Acceptance Auditor 三个视角均已覆盖，但不具备独立 sub-agent 上下文隔离。Round 3 P1 已在默认 human quick prompt 路径部分修复：`configureProject` prompt 现在包含 canonical package root count，且新增测试证明 prompt 触发时尚未创建安装产物。复检发现该修复仍未覆盖最终 selected module set 变更后的 pre-write 摘要：detailed config 可在该 prompt 之后改变 selected modules，导致用户写入前看到的 count 与实际安装范围不一致。当前 reviewer 结论为不通过，建议进入 evaluator/fixer；本轮按用户要求不启动 evaluator / fixer / finalizer。

## 上轮问题回顾

### 已修复

1. Round 3 / Finding #1 — Canonical package root count 没有真正出现在成功路径的写入前展示结果中（默认 human quick 子路径）
   - `runInstallCommand` 现在先构造 `configPromptInput`，并在调用 `configureProject` 时把 prompt 替换为 `createPrewriteModuleSummary(...)` 的结果（`src/commands/install.ts:250-265`）。
   - `createPrewriteModuleSummary` 现在包含 selected modules、source descriptor、capability scope、pending write phases、`No project files were changed.`，以及 `Canonical package roots: ...`（`src/commands/install.ts:718-740`）。
   - 新增测试在 `configureProject` 回调内断言 prompt 包含 `core=13, sdlc=40, total=53`，并在同一时刻调用 `assertNoInstallWrites` 证明 `_speclite`、`_speclite-output`、`.claude/skills`、`.agents/skills`、manifest/config 均未创建（`test/install-module-selection.test.ts:106-140`、`test/install-module-selection.test.ts:373-386`）。

### 仍为非阻塞待办

无。

### 仍未关闭（阻塞）

1. Round 3 / Finding #1 — Canonical package root count 未绑定最终 selected module set 的写入前展示 / 确认
   - 详见本轮“新发现 / 上轮遗留”第 1 项。

## 新发现

### 1. [中][上轮遗留] Pre-write package root count summary 可能与最终 selected module set 不一致

- **来源**：blind+edge+auditor
- **分类**：patch

- **证据**
  - Story AC7 要求安装范围摘要列出 selected modules、module versions、capability/scope summary、source descriptor summary、每个 selected module 的 canonical package root count 和后续完整能力范围；并且该摘要必须在任何 project file write 之前展示给用户确认（`_bmad-output/implementation-artifacts/stories/1-3-official-module-selection-and-install-summary.md:64-70`）。
  - fixer 将 pre-write summary 接到 `configureProject` prompt，但这个 prompt 在 `configSelection` 产生之前构造，使用的是配置前的 `selectedModules`（`src/commands/install.ts:250-265`）。
  - detailed config 仍允许 `configureProject` 返回 `selectedModuleIds`，随后 `runInstallCommand` 才用该结果计算 `finalSelectedModuleIds` 与 `finalSelectedModules`（`src/commands/install.ts:290-311`），并在没有再次展示 / 确认最终 summary 的情况下进入 `applyInstallPlan` 写入阶段（`src/commands/install.ts:330-348`）。
  - CLI adapter 的 detailed flow 也允许用户在配置阶段重新选择 selected modules（`src/bin/speclite.ts:153-192`）。
  - 定向复现命令确认：当 `configureProject` 返回 `mode: "detailed"` 且 `selectedModuleIds: ["core"]` 时，pre-write prompt 仍包含 `Canonical package roots: core=13, sdlc=40, total=53.`；最终结果实际为 `installedModules: ["core"]`，final summary 为 `Canonical package roots: core=13, total=13.`，且 `config.toml` 不包含 `[modules.sdlc]`。
  - 当前新增测试只覆盖默认 quick path：它断言 pre-write prompt 包含 `core=13, sdlc=40, total=53`，但没有覆盖 detailed config 改变 `selectedModuleIds` 后的最终写入范围（`test/install-module-selection.test.ts:106-140`）。

- **影响**
  - Round 3 P1 仍未完全关闭。用户在 project writes 前看到的 canonical package root count 可能不是最终参与 IDE mirror、skill index、files index 和 ReadyCheck 的能力范围。
  - 该缺口会削弱 AC7 的核心保证：安装范围摘要必须描述“本次即将写入”的 selected modules 和 package root closure，而不是配置阶段之前的临时选择。
  - 当前测试会给出局部通过信号，但无法防止 detailed mode 在 summary 之后改变安装范围。

- **建议**
  - 在 `finalSelectedModules` 和 `configPlan` 都确定之后、调用 `applyInstallPlan` 之前，生成并展示 / 确认最终 pre-write install scope summary；该 summary 应包含最终 selected modules、versions、source descriptor、capability scope、per-module package root counts、planned write phases 和 no-write evidence。
  - 或者收紧 detailed config 边界：如果 pre-write summary 已经作为最终安装范围确认，则 detailed config 不应再改变 selected module set；若仍允许改变，必须追加第二次最终 summary confirmation。
  - 补充 regression test：让 `configureProject` 返回 `mode: "detailed"` 和不同的 `selectedModuleIds`，断言写入前展示的最终 summary 与实际 `installedModules` / `config.toml` / IDE mirror 目标一致，并在展示时仍未创建安装产物。

## 验证摘要

- ✅ `find assets/source/speclite/core-skills -name SKILL.md | wc -l`：13。
- ✅ `find assets/source/speclite/sdlc-skills -name SKILL.md | wc -l`：40。
- ✅ `git diff --check -- src/commands/install.ts test/install-module-selection.test.ts _bmad-output/implementation-artifacts/code-reviews/1-3-code-review`：通过。
- ✅ `npm test -- --run test/install-module-selection.test.ts`：1 file / 9 tests 通过。
- ✅ `npm test -- --run test/source-and-modules.test.ts test/install-module-selection.test.ts test/config-initialization.test.ts test/runtime-structure.test.ts test/install-progress-ready-summary.test.ts test/ide-target-writer.test.ts test/menu-target-validation.test.ts test/cli-smoke.test.ts`：8 files / 57 tests 通过。
- ✅ `npm test`：20 files / 117 tests 通过。
- ❌ `npm run lint`：失败，`package.json` 未定义 `lint` script；这不是本轮 fixer code finding。
- ✅ `npm run build`：通过，ESM 与 DTS build 成功。
- 额外复核：
  - 默认 human quick path 的 pre-write prompt count 已被新测试覆盖。
  - detailed config 变更 selected modules 的定向复现确认仍存在 AC7 时序缺口。

## 通过项

- `createPrewriteModuleSummary` 现在不再是完全未使用 helper；human non-JSON path 会在 config prompt 阶段展示 source、selected modules、canonical package root count、capability scope、pending write phases 和 no-write 文案。
- 新增测试在写入前回调内检查 canonical count 和无安装产物，覆盖 Round 3 P1 的默认 quick 子路径。
- 最终 ready summary 仍包含 canonical package root count，且 `runReadyCheck` 仍接收 `selectedModules`，未发现 full package root closure 的 installed-state 投影回归。
- Public `CommandResult<InstallCommandData>` 未新增未契约化 `selectedModules` 或 `pendingModuleSelection` 字段。
- 本轮未发现 npm registry、Git remote、private registry 或外部网络访问回归。

## 结论

- **结论：不通过**
- **阻塞项**：1 个。Round 3 P1 未完全关闭：pre-write canonical package root count summary 可能与 detailed config 后的最终 selected module set 不一致。
- **新发现数量**：0 个全新无关 finding；1 个上轮遗留 finding。
- **分类**：`decision_needed: 0`，`patch: 1`，`defer: 0`，`dismiss: 0`。
- **建议**：进入 `bmenhance-cr-02-evaluator` 评估本轮遗留 finding；若确认有效，再进入 `bmenhance-cr-03-fixer` 修复。当前轮次按用户要求不执行 evaluator / fixer / finalizer。
