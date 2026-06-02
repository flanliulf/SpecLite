---
Story: 6-2
Round: 1
Date: 2026-06-02
Model Used: GPT-5.5
Review Source: 6-2-code-review-summary-20260602-round-1.md
Review Model: GPT-5.5
Type: Code Review Evaluation
---

## 评估总结

对 Story 6-2 的第 1 轮 CR 代码审查结果（首轮）进行逐条评估。本轮审查提出 2 个 blocking findings：normal update apply 后未同步 installed-state/files-index projection，以及 existing update conflict failure 缺少 AC8 要求的 step state 且 expected JSON summary 错误宣称已应用更新。经独立代码验证，两项发现均准确、严重性合理、修复必要，整体评估结论为不通过。

---

## 发现 #1 评估

### 审查原文

> **[高] Normal update apply 后未同步 installed-state 投影，下一次 update 会把刚应用的更新误判为 installer-owned drift**
> - 来源：blind+edge+auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

`src/update/update-plan.ts:120-132` 在 installer-owned path 的当前 hash 等于 files-index 记录 hash、且 canonical `sourceHash` 已变化时，生成 `update` action，并把 `expectedHash` 设置为新的 canonical hash。`src/update/update-plan.ts:146-153` 随后在 `writeAuthorized` 且无 conflicts 时调用 `applyUpdateActions`，传入的是原始 `context.filesIndex`。但 `src/update/update-plan.ts:575-685` 的 apply 阶段只读取 source evidence、调用 `safeWriteFile`、累积 `changedPaths` / `skippedPaths`，返回时没有写回 `_speclite/_config/files-index.json`，也没有更新 manifest/index projection 或 files-index entry hash。

fixture expected output 也吻合该问题：`test/fixtures/existing-install-update/expected/command-json/normal-update-success.json:31-67` 记录 `_speclite/config.toml` 的 action 为 `update`，`expectedHash` 是新 hash，`changedPaths` 包含该路径，但输出数据没有任何 installed-state projection 更新结果。Story AC4 明确要求 `changedPaths`、`skippedPaths`、`updatePlan.actions` 和 manifest/files-index projection 必须与 actual apply result 和 planned effects 分离并保持一致（`_bmad-output/implementation-artifacts/stories/6-2-fresh-install-and-existing-update-fixture-gates.md:34-38`）。因此 reviewer 对持续基线漂移的判断成立。

**严重性判断：合理**

这是 functional correctness 和 release gate 完整性问题。普通 update 成功写入 installer-owned planned update 后，如果 files-index 仍保留旧 hash，下一次普通 update 会把刚由 installer 写入的新内容视为 recorded hash 不一致的 installer-owned drift。Story AC7 又要求 installer-owned drift 在 normal update 中必须进入 conflict 且不得静默覆盖（`_bmad-output/implementation-artifacts/stories/6-2-fresh-install-and-existing-update-fixture-gates.md:52-56`），所以该缺陷会把一次成功 apply 转化为下一次失败 conflict，阻塞 Story 6.2 对 existing install update fixture gate 的交付证明。评为高 / P1 合理。

**修复建议：可行**

reviewer 建议在 normal update 成功 apply installer-owned `create` / `update` 后同步 installed-state projection，并增加 `update --yes` 后立即再跑普通 `update` 的回归断言。该方向与当前实现边界一致：apply 阶段已有每个 action 的 source evidence、affected path、current/expected hash 和 files-index entry，可在安全写入成功后更新 projection，并用 fixture gate 断言第二次 update 不再报告同一路径 `installer-owned-drift`。

**误报评估：非误报**

当前代码和 expected output 均未体现 apply 后 projection 更新。该 finding 非误报。

---

## 发现 #2 评估

### 审查原文

> **[高] Existing update conflict failure 缺少 AC8 要求的 step state，且冲突 summary 错误宣称已应用更新**
> - 来源：blind+auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

Story AC8 要求 fresh install 或 existing update fixture 失败时，human-readable output 和 JSON 必须包含 completed steps、failed step、pending steps、blocking issue/conflict reason 和 suggested manual action，且 automation 依赖必须在 structured fields 中存在（`_bmad-output/implementation-artifacts/stories/6-2-fresh-install-and-existing-update-fixture-gates.md:58-62`）。

当前 update conflict projection 不满足该要求。`src/diagnostics/command-result.ts:297-315` 为 `update.conflicts` issue 只写入 `details.conflictCount`，没有 completed / failed / pending step state，也没有 conflict-specific manual action。`src/diagnostics/command-result-schema.ts:213-222` 的 `UpdateCommandDataSchema` 只包含 `updatePlan`、`changedPaths`、`skippedPaths`、`conflicts`、`requiresConfirmation`、`writeAuthorized`，不同于 install data 的 `completedSteps` / `pendingSteps` 字段（`src/diagnostics/command-result-schema.ts:107-116`）。`src/diagnostics/output.ts:178-285` 的 update human renderer 输出 summary、plan、authorization、changed/skipped paths、conflicts、issues 和 next actions；conflict 分支只打印 `affectedPath`、`ownership`、`reason`、`nextAction`，没有完整 step state。

测试和 expected JSON 也确认缺口存在。`test/fixture-release-gates.test.ts:239-264` 只断言 exit code、`update.conflicts.details.conflictCount`、conflict path/reason、无 ready summary，并未断言 AC8 step state。`test/fixtures/existing-install-update/expected/command-json/installer-owned-drift-conflict.json:3-18` 是 failure，但 `summary` 为 `"SpecLite update applied authorized non-conflicting installer-owned planned updates."`；同一文件 `:68-80` 又显示 `changedPaths=[]`、`writeAuthorized=false`、`requiresConfirmation=true` 和 conflict failure，summary 与结构化结果矛盾。`src/commands/update.ts:117-130` 解释了错误来源：summary 仅基于 CLI `--yes` 的 `writeAuthorized` 输入选择，而不是基于 plan 是否 blocked / conflicts 是否存在。

**严重性判断：合理**

该问题同时违反 AC8 的 structured automation contract 和 failure messaging correctness。错误 summary 会让 JSON consumer 或人工读者误以为失败命令已经应用了 authorized updates，而 structured fields 又缺少自动化所需的 failed/pending step state。由于 Story 6.2 本身是 release gate fixture story，这会削弱 fixture 对 failure behavior 的证明力，评为高 / P1 合理。

**修复建议：可行**

reviewer 建议为 normal update conflict failure 建立稳定 step state，将 structured fields 写入 issue details 或合适的 command data，并在 human renderer 展示，同时修正 conflict expected JSON summary。该方向可行，并且应同步补充 fixture release gate 断言，覆盖 JSON structured fields 和 human-readable evidence profile 中的 failed/pending step state。

**误报评估：非误报**

当前 schema、result projection、human renderer、fixture expected JSON 和 fixture gate tests 都支持 reviewer 结论。该 finding 非误报。

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | Normal update apply 后未同步 installed-state / files-index projection | [高] | **P1** | 会导致已成功应用的 installer-owned planned update 在下一次普通 update 中被误判为 drift conflict，破坏 existing update 持续可用基线。 |
| 2 | Existing update conflict failure 缺少 AC8 step state，且 expected JSON summary 错误宣称已应用更新 | [高] | **P1** | 违反失败输出 structured automation contract，并使 failure summary 与 `writeAuthorized=false` / `changedPaths=[]` / conflicts 状态矛盾。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| - | 无 | - | - | 本轮 2 个发现均为阻塞修复项，不建议 defer。 |

### 可忽略（误报）

| # | 发现 | 原始严重性 | 忽略理由 |
|---|------|----------|---------|
| - | 无 | - | 未发现误报。 |

### 评估决定

- **发现 #1（Normal update apply 后未同步 installed-state / files-index projection）**：确认有效，必须修复后再复审。
- **发现 #2（Existing update conflict failure 缺少 AC8 step state 且 expected JSON summary 错误）**：确认有效，必须修复后再复审。
- **整体决定**：Not Approved / 不通过。当前 Story 6.2 最新 CR round 1 的 2 个 blocking findings 均成立，不应进入 fixer 之后的 rules、todo、finalizer 或完成状态，需先执行针对性修复并重新 CR。

## 修复执行记录

### 修复执行记录
- **Date**: 2026-06-02
- **Model Used**: GPT-5.5
- **Fix Items**: 2

#### 修复项 #1：normal update apply 后同步 installed-state / files-index projection

- **对应 P1**: Normal update apply 后未同步 installed-state / files-index projection，导致下一次普通 update 可能将刚应用的 planned update 误判为 `installer-owned-drift`。
- **修改文件**:
  - `src/update/update-plan.ts`
  - `test/update-planning.test.ts`
  - `test/fixture-release-gates.test.ts`
  - `test/fixtures/existing-install-update/expected/command-json/normal-update-success.json`
- **关键修复**:
  - `applyUpdateActions` 记录成功应用的 installer-owned `create` / `update` action。
  - apply 成功后安全写回 `_speclite/_config/files-index.json`，将已应用路径的 files-index entry `hash` 更新为 planned `expectedHash`。
  - `changedPaths` 包含 `_speclite/_config/files-index.json`，反映 actual apply result。
  - 增加 `update --yes` 后立即再跑普通 `update` 的断言，确认同一路径不再被误判为 drift conflict。
- **结果**: 已修复。

#### 修复项 #2：existing update conflict failure 输出 AC8 step state，并修正 summary

- **对应 P1**: Existing update conflict failure 缺少 AC8 要求的 completed / failed / pending step state，且 conflict expected JSON summary 错误宣称已应用更新。
- **修改文件**:
  - `src/commands/update.ts`
  - `src/diagnostics/command-result.ts`
  - `src/diagnostics/command-result-schema.ts`
  - `src/diagnostics/output.ts`
  - `test/update-planning.test.ts`
  - `test/fixture-release-gates.test.ts`
  - `test/fixtures/existing-install-update/expected/command-json/installer-owned-drift-conflict.json`
- **关键修复**:
  - normal update conflict failure 在 command data 中投影 `completedSteps`、`failedStep`、`pendingSteps`。
  - `update.conflicts.details` 同步包含 step state 与 `manualAction`，满足 automation structured fields。
  - human-readable update output 增加 `Step State`。
  - conflict summary 改为 `SpecLite update found conflicts before apply. No project files were changed.`，不再错误宣称已应用更新。
  - fixture release gate 和 update planning 测试补充 JSON 与 human output 断言。
- **结果**: 已修复。

#### 验证

- `npx vitest run test/fixture-release-gates.test.ts test/update-planning.test.ts`：通过，2 files / 24 tests passed。
- `npx vitest run test/update-command.test.ts`：通过，1 file / 8 tests passed。
- `npm run build`：通过。
- `npm test`：通过，36 files / 270 tests passed。
