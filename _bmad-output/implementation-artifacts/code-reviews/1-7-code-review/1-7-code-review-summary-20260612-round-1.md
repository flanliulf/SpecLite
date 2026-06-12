---
Story: 1-7
Round: 1
Date: 2026-06-12
Model Used: GPT-5.5 (gpt-5.5)
Type: Code Review Summary
---

## 审查结论

首轮审查。内部 Agent 工具在当前环境不可用，本轮按 skill fallback 降级为串行三层审查模式：Blind Hunter、Edge Case Hunter、Acceptance Auditor 均由当前审查上下文依次完成。Focused tests、`npm run build`、`git diff --check` 均通过；全量 `npm test` 仍失败，独立复核后确认稳定失败集中在既有 `speclite-npm-publisher` fixture hash mismatch，另 6 个全量并发 timeout 对应文件单独复跑均通过。

审查发现 1 个 Story 1-7 相关功能问题，分类为 `patch`。建议本轮 **不通过**，先进入 evaluator/fixer 处理中文自定义安装 Ready Summary 的错误声明。

## 新发现

### 1. [中] 中文 Ready Summary 在自定义 interactive 安装后仍声明使用默认值且无交互

- **来源**：blind+edge+auditor
- **分类**：patch

- **证据**
  - `src/bin/speclite.ts:156-181` 只有 `--interactive` 才注册 prompt adapter；因此 `speclite install --yes --interactive` 是合法自定义 human prompt flow，不是 no-prompt flow。
  - `src/commands/install.ts:621-640` / `src/commands/install.ts:932-951` 会根据 `configSelection?.selectedModuleIds` 和 `configSelection?.ideTargetIds` 生成实际安装计划；用户可把默认 `core,sdlc` 改成 `core` 或改 IDE targets。
  - `src/diagnostics/output.ts:469-489` 的中文 Ready Summary 无条件输出 `install --yes 已使用默认 modules、quick config 和默认 IDE targets 完成无交互安装。` 和 `已通过 --yes 授权...`，没有读取实际 `configPlan.mode`、是否触发 prompt、或最终选择是否等于默认值。
  - 定向复现：运行 `speclite install --yes --interactive`，prompt 回答 module 为 `core` 且配置为 `quick`。输出同时包含 `selectedModules=core` 和 `install --yes 已使用默认 modules、quick config 和默认 IDE targets 完成无交互安装。`，并记录 `prompts=3`。

- **影响**
  - 违反 AC4/AC5 的语义边界：`--yes` no-prompt happy path 与 explicit interactive custom flow 被中文输出混淆。
  - 用户看到的中文 Ready Summary 会错误声称“默认 modules / 默认 IDE targets / 无交互安装”，但实际可能已经通过 prompt 做了自定义选择。
  - 英文 fallback 目前复用 `result.summary`，不会追加同一条硬编码 no-prompt 声明；风险集中在默认中文输出路径。

- **建议**
  - 不要在 renderer 中无条件硬编码“默认值/无交互”声明。
  - 将 no-prompt/defaults 说明移到能知道实际选择来源的 install summary 构造层，或向 human renderer 传入明确的 presentation metadata。
  - 补充 focused test：`install --yes --interactive` 默认中文输出中，用户选择 `core` 时不得出现“默认 modules”或“无交互安装”，并应准确展示 `selectedModules=core`。

## 验证摘要

- ✅ `npm test -- test/cli-smoke.test.ts test/install-module-selection.test.ts test/install-progress-ready-summary.test.ts`：通过，3 files / 30 tests passed。
- ✅ `npm run build`：通过，ESM 与 DTS build success。验证后已清理该命令产生的 `dist/packaging-manifest.json` hash 副作用。
- ✅ `git diff --check`：通过，无 whitespace error。
- ❌ `npm test`：失败，7 failed / 38 files；其中 1 个为 `test/fixture-release-gates.test.ts` 的 deterministic fixture hash mismatch，6 个为并发运行时 5000ms timeout。
- ✅ timeout 文件独立复跑：
  - `npm test -- test/git-source-resolution.test.ts`：14 passed。
  - `npm test -- test/registry-source-resolution.test.ts`：13 passed。
  - `npm test -- test/runtime-structure.test.ts`：10 passed。
  - `npm test -- test/install-progress-ready-summary.test.ts`：10 passed。
  - `npm test -- test/install-module-selection.test.ts`：10 passed。
  - `npm test -- test/cli-smoke.test.ts`：10 passed。
- ❌ `npm test -- test/fixture-release-gates.test.ts`：1 failed / 5 tests。差异为 `_speclite/_config/skill-index.json` 以及 `.agents/.claude` 下 `speclite-npm-publisher` 的 `CHANGELOG.md`、`references/speclite-npm-publisher-workflow.md`、`SKILL.md` hash，另含 `canonicalPackageHash` mismatch。
- ✅ Story 1-7 关联性复核：`git diff --name-only HEAD -- assets/source/speclite/sdlc-skills/5-devops/speclite-npm-publisher test/fixtures/fresh-install-empty-project src/commands/install.ts src/diagnostics/output.ts src/bin/speclite.ts test/fixture-release-gates.test.ts` 仅返回 `src/bin/speclite.ts`、`src/commands/install.ts`、`src/diagnostics/output.ts`；未包含 `speclite-npm-publisher` asset package、fresh-install fixture expected 文件或 `test/fixture-release-gates.test.ts`。
- ✅ 定向复现：`node --input-type=module` 调用 built CLI，执行 `install --yes --interactive` 默认中文输出，确认实际 `selectedModules=core` 且 `prompts=3`，但输出仍声明“默认 modules / 无交互安装”。

## 通过项

- `--yes` 默认 happy path 已覆盖：focused CLI smoke 证明 `install --yes` 不触发 prompt，输出默认中文 Ready Summary，且无 ANSI escape。
- `--json --yes` 已覆盖：focused CLI smoke 证明不触发 prompt，JSON contract 字段仍为既有集合，未新增 public JSON 字段。
- locale resolution 已覆盖：explicit flag 优先于 env，env 可选 `en-US`，unsupported locale fallback 到 `zh-CN`。
- prompt/summary 分离在主 prompt 路径已覆盖：module selection、config mode、final pre-write review 的长文本输出到 stdout，`readline.question()` prompt 不包含 long pre-write summary。
- final pre-write review 已按 target、source descriptor、config mode、selected modules、IDE targets、planned writes、pending phases 展示，并声明 `projectFilesWritten=false`。
- 已知既有问题（defer）：`test/fixture-release-gates.test.ts` 的 `speclite-npm-publisher` fixture hash mismatch 真实存在，但本 Story diff 未改 `assets/source/speclite/sdlc-skills/5-devops/speclite-npm-publisher/`、fresh-install expected fixture 或 release gate test，本轮不建议作为 Story 1-7 blocker 修复。

## Findings 分类汇总

- `patch`: 1
- `decision_needed`: 0
- `defer`: 1
- `dismiss`: 0

## 结论

- **结论：不通过**
- **阻塞项**：中文 Ready Summary 在 explicit interactive 自定义安装后仍错误声明默认 no-prompt 安装。
- **建议**：继续进入 evaluator/fixer，修复该输出语义并补充对应 focused test；`speclite-npm-publisher` fixture hash mismatch 作为既有 defer 项单独处理，不应混入 Story 1-7 fixer 范围。
