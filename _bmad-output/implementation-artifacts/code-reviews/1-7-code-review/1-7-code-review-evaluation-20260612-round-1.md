---
Story: 1-7
Round: 1
Date: 2026-06-12
Model Used: GPT-5.5 (gpt-5.5)
Review Source: 1-7-code-review-summary-20260612-round-1.md
Review Model: GPT-5.5 (gpt-5.5)
Type: Code Review Evaluation
---

## 评估总结

对 Story 1-7 的第 1 轮 CR 代码审查结果（首轮）进行逐条评估。审查结果提出 1 个 Story 相关 `patch` 问题，并将 `speclite-npm-publisher` fixture hash mismatch 标记为既有 `defer` 问题。经独立代码验证，`patch` 发现成立且阻塞本 Story 交付；`defer` 发现真实存在但不属于 Story 1-7 fixer 范围。

---

## 发现 #1 评估

### 审查原文

> **[中] 中文 Ready Summary 在自定义 interactive 安装后仍声明使用默认值且无交互**
> - 来源：blind+edge+auditor
> - 分类：patch

### 评估结论：✅ 确认有效，需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

代码验证确认 `speclite install --yes --interactive` 是合法的 human prompt flow：`src/bin/speclite.ts:156-181` 在 `commandOptions.json !== true && commandOptions.interactive === true` 时注册 `selectModuleIds`、`configureProject`、`confirmSourceAccess` 和 `confirmPrewriteInstallScope` prompt adapter。安装计划随后会读取交互选择：`src/commands/install.ts:621-640` 和 `src/commands/install.ts:932-951` 使用 `configSelection?.selectedModuleIds` 与 `configSelection?.ideTargetIds` 计算最终 `selectedModules` 和 `ideTargetIds`。

中文 Ready Summary 目前没有区分默认 no-prompt flow 与 explicit interactive custom flow。`src/diagnostics/output.ts:469-489` 无条件输出 `install --yes 已使用默认 modules、quick config 和默认 IDE targets 完成无交互安装。` 以及 `已通过 --yes 授权...`。这会在用户通过 `--interactive` 选择 `core`、`detailed` 或自定义 IDE targets 后仍声明默认值和无交互，和实际安装结果不一致。

测试也暴露了覆盖缺口：`test/cli-smoke.test.ts:133-165` 只验证 `install --yes` 默认中文 no-prompt happy path 应包含该声明；`test/cli-smoke.test.ts:278-294` 覆盖了 `--yes --interactive --locale en-US` 可选择 `core` 且有 3 个 prompt；`test/install-module-selection.test.ts:219-237` 覆盖底层 interactive core-only 选择。但当前没有对应的中文 `--yes --interactive` Ready Summary 断言来防止错误声明。

**严重性判断：合理**

原始严重性为中，评估后按 P1 处理。原因是该问题直接违反 AC4/AC5 的语义边界：AC4 要求 `install --yes` no-prompt happy path 说明使用默认值并由 `--yes` 授权，AC5 则要求自定义安装必须通过显式 interactive mode 或显式 flags 进入。当前中文 Ready Summary 把显式自定义 interactive flow 误报成默认无交互安装，属于用户可见功能语义错误，阻塞 Story 1-7 的验收。

**修复建议：可行**

reviewer 建议可行。fixer 应避免在 renderer 内无条件硬编码“默认值/无交互”声明，改为基于安装结果或 presentation metadata 判定输出语义。最小修复可以限定在 Story 1-7 已触及的 install human-readable 输出链路：让中文 Ready Summary 只在真实 no-prompt default flow 中输出默认/无交互声明；在 `--interactive` 或最终选择非默认时输出中性摘要，至少准确展示实际 `selectedModules`、config mode 和 IDE targets。需补充 focused test 覆盖 `install --yes --interactive` 默认中文输出中用户选择 `core` 时不得出现“默认 modules”或“无交互安装”。

**误报评估：非误报**

不是误报。三层来源一致命中，且代码路径能复现该语义矛盾。

---

## 发现 #2 评估

### 审查原文

> **[已知既有问题] `test/fixture-release-gates.test.ts` 的 `speclite-npm-publisher` fixture hash mismatch**
> - 分类：defer

### 评估结论：⚠️ 有效但降级，建议纳入 CR TODO 跟踪（P2 优先级）

### 评估分析

**问题描述准确性：基本准确**

review summary 记录全量 `npm test` 仍有 `test/fixture-release-gates.test.ts` 的 deterministic fixture hash mismatch。Story 文件的 Dev Agent Record 也记录 `npm test` 未全量通过，唯一失败为 `speclite-npm-publisher` asset package hash 与 fixture expected hash 不一致，并说明当前工作树没有对应 asset package 改动。独立范围核对显示，限定 Story 1-7 相关 pathspec 后，当前 diff 只包含 `src/bin/speclite.ts`、`src/commands/install.ts`、`src/diagnostics/output.ts`，不包含 `assets/source/speclite/sdlc-skills/5-devops/speclite-npm-publisher/`、fresh-install expected fixture 或 `test/fixture-release-gates.test.ts`。

**严重性判断：合理但不阻塞本 Story**

该 hash mismatch 会影响全量测试红绿状态，作为仓库质量问题真实存在；但它不是 Story 1-7 的 install CLI interaction/localized human output 改动引入，也不在本 Story 明确范围内。把它作为本 Story blocker 修复会扩大 fixer 范围，违反范围控制。

**修复建议：可行但非必要**

建议维持 `defer`：记录到 CR TODO 或单独任务，由后续专门处理 canonical package hash 与 fixture expected 的同步。Story 1-7 fixer 不应修改 `speclite-npm-publisher` asset package、fresh-install expected fixture 或 release gate test。

**误报评估：非误报**

不是误报，但不是本 Story 应修复的问题。

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | 中文 Ready Summary 在 explicit interactive 自定义安装后仍声明默认 no-prompt 安装 | [中] | **P1** | 用户可见输出与实际交互选择不一致，违反 AC4/AC5，需在本 Story fixer 中修复并补测试。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 2 | `speclite-npm-publisher` fixture hash mismatch | [既有问题] | **P2** | 真实存在但不属于 Story 1-7 diff 和修复范围，应单独跟踪处理。 |

### 可忽略（误报）

无。

### 评估决定

- **发现 #1（中文 Ready Summary 错误声明默认/无交互安装）**：确认有效，本轮 CR 不通过，需要 fixer 修复。修复范围应限于 install summary/presentation metadata、human renderer 和 focused tests，不应扩大到无关 install contract。
- **发现 #2（`speclite-npm-publisher` fixture hash mismatch）**：确认真实但降级为非阻塞 defer。建议进入 CR TODO 或单独维护任务，不进入 Story 1-7 fixer 范围。
- **整体决定**：本轮评估不通过；存在 1 个阻塞交付的 P1 修复项。无需要人工裁决的 blocker。

## 修复执行记录

### 修复执行记录
- **Date**: 2026-06-12
- **Model Used**: GPT-5.5 (gpt-5.5)
- **Fix Items**: 1

#### 修复项 #1：中文 Ready Summary 区分 default no-prompt 与 explicit interactive

- **对应评估发现**: 发现 #1（P1）中文 Ready Summary 在 explicit interactive 自定义安装后仍声明默认 no-prompt 安装。
- **修复结果**: 已修复。
- **修改范围**:
  - `src/commands/install.ts`: 在两个 Ready Summary success path 上追加非枚举 presentation metadata，标记 `installFlow=default-no-prompt|explicit-interactive` 与 `configMode=quick|detailed`；该 metadata 不进入 JSON contract。
  - `src/diagnostics/output.ts`: 中文 Ready Summary 仅在 `default-no-prompt` 时输出“默认 modules / quick config / 默认 IDE targets / 无交互安装”；explicit interactive 时改为输出“已按显式交互选择完成安装”，并展示实际 `selectedModules`、`configMode` 和 `ideTargets`。
  - `test/cli-smoke.test.ts`: 新增中文 `install --yes --interactive` custom flow smoke test，覆盖选择 `core` 后不得出现“默认 modules”或“无交互安装”。
- **验证结果**:
  - `npx vitest run test/cli-smoke.test.ts`: 通过，1 个测试文件、11 个测试通过。
  - `npx vitest run test/install-module-selection.test.ts test/install-progress-ready-summary.test.ts`: 通过，2 个测试文件、20 个测试通过。
  - `npm run build`: 通过。
  - `git diff --check`: 通过。
  - `npm test`: 未全量通过；唯一失败仍为 `test/fixture-release-gates.test.ts` 中 `speclite-npm-publisher` fixture hash mismatch，差异集中在 `_speclite/_config/skill-index.json`、`.agents/skills/speclite-npm-publisher/*`、`.claude/skills/speclite-npm-publisher/*` 和 `canonicalPackageHash`。该问题已由本 evaluation 降级为 P2 defer，且本轮按要求未修改 `speclite-npm-publisher` asset package、fresh-install expected fixture 或 `test/fixture-release-gates.test.ts`。
- **剩余 blocker**: 无本轮 P1 blocker；全量测试存在范围外 P2 defer。
