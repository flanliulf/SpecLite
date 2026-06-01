---
Story: 4-5
Round: 1
Date: 2026-06-01
Model Used: GPT-5.5 (gpt-5.5)
Review Source: 4-5-code-review-summary-20260601-round-1.md
Review Model: GPT-5.5 (gpt-5.5)
Type: Code Review Evaluation
---

## 评估总结

对 Story 4-5 的第 1 轮 CR 代码审查结果（首轮）进行逐条评估。Reviewer 报告 1 个 `patch` finding：`detectFilesIndexEntryConflict` 能把 classifier unknown path 正确投影为 `data.conflicts[].ownership="unknown"`，但 `planUpdate` 随后会把同一路径加入 `updatePlan.actions[]` 并标记为 `ownership="installer-owned"`。经 Story 与当前源码核对，该 finding 有效，属于 Story 4.5 protected boundary / public JSON contract 缺陷，评估结论为不通过。

---

## 发现 #1 评估

### 审查原文

> **[中] unknown ownership conflict 在 `updatePlan.actions` 中被误投影为 `installer-owned`**
> - 来源：blind+edge+auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

Reviewer 对当前控制流的描述准确。`src/update/conflict-detector.ts:20-31` 会先用 path classifier 判断 protected ownership；当 classifier 给出 `unknown` 时，返回的 conflict 使用 `ownership: "unknown"` 与 `reason: "unknown-ownership"`。`src/update/conflict-detector.ts:44-51` 也保留了 classifier unknown 的显式返回路径，确保 `data.conflicts[]` 的 path-level detail 不会默认为 installer-owned。

但 `src/update/update-plan.ts:57-67` 在收到任意 conflict 后，只检查 `entry.ownership !== "workflow-owned" && entry.ownership !== "human-owned"`，然后无条件向 `updatePlan.actions[]` 追加 `ownership: "installer-owned"`、`action: "conflict"`。因此当 files-index entry 自身为 `installer-owned`，但 path classifier 不能证明该 path 属于 installer-owned 区域（例如 project root `README.md`）时，同一路径会在 `data.conflicts[]` 中显示为 `unknown`，在 `updatePlan.actions[]` 中显示为 `installer-owned`。

Story 4.5 明确要求 unknown ownership、path escape、symlink escape 等必须进入 protected blocker path，且不得默认当作 installer-owned（`_bmad-output/implementation-artifacts/stories/4-5-conflict-detection-and-default-non-overwrite-behavior.md:65-72`）。Conflict matrix 也明确 `ownership missing or cannot be proven` 的 ownership 为 `unknown`、outcome 为 `conflict`、reason 为 `unknown-ownership`，并注明不得默认当作 installer-owned（同文件 `:185-197`）。Task 3 进一步要求 executable overwrite plan 不得包含 unknown ownership path（同文件 `:74-80`）。

现有 public schema 也支持 reviewer 的边界判断：`UpdateConflictSchema` 允许 conflict ownership 为 `installer-owned`、`human-owned`、`workflow-owned` 或 `unknown`，但 `UpdatePlanActionSchema` 的 ownership 只允许 `installer-owned`、`human-owned`、`workflow-owned`（`src/diagnostics/command-result-schema.ts:137-155`）。在不修改 owning SPEC / schema 的前提下，把 classifier unknown path 写入 `updatePlan.actions[]` 只能伪装成非 unknown ownership；当前实现选择 `installer-owned`，正是 Story 禁止的默认归类。

测试缺口判断也准确。`test/update-planning.test.ts:520-578` 的测试标题包含 unknown ownership，但 fixture 只创建 `_speclite/config.toml`、`_speclite/custom/config.toml` 和 `_speclite-output/review.md` 三类路径，断言的 conflicts 也只有 installer-owned drift、human-owned 和 workflow-owned 三项。该用例没有构造 classifier unknown path，因此无法发现 `updatePlan.actions[]` 的 unknown-to-installer-owned 投影问题。

**严重性判断：合理**

原始严重性为 `[中]`，作为代码审查分类合理；从交付门禁看应评估为 **P1 阻塞修复**。这是 Story 4.5 的核心安全边界：普通 `speclite update` 对不确定安全性的文件必须默认 non-overwrite / conflict，不能让 public planned effects 暗示该 path 是 installer-owned。该问题不一定直接执行覆盖写入，因为 blocked-by-conflict 时 `changedPaths` / `skippedPaths` 为空，但它会破坏 `CommandResult.data.updatePlan.actions[]` 与 `data.conflicts[]` 的语义一致性，影响 automation 和后续 Story 4.6 repair/apply 判断。

**修复建议：可行**

Reviewer 建议可行且范围合适。当前 `UpdatePlanActionSchema` 不能表达 `ownership: "unknown"`，因此保守修法应避免为 classifier unknown conflict 追加误导性的 installer-owned plan action，仅保留 `data.conflicts[]` 作为 path-level protected blocker detail。若产品确实要求 `updatePlan.actions[]` 也表达 unknown conflict action，则必须先扩展 owning SPEC、schema/parser、fixtures 和 tests，这会扩大 Story 4.5 修复范围，不建议在本轮 fixer 中采用。

建议 fixer 最小修复：

- `planUpdate` 在处理 `detectFilesIndexEntryConflict` 返回值时，以 `conflict.ownership` 或等价 classifier 结果决定是否追加 `updatePlan.actions[]`，不要用 `entry.ownership` 推断 unknown/human/workflow protected conflict。
- 对 `conflict.ownership === "unknown"` 的路径，不追加 `ownership: "installer-owned"` 的 action；保留 `data.conflicts[]` 中的 `ownership: "unknown"`、`reason: "unknown-ownership"`。
- 补充 focused test：构造 files-index entry path 为 classifier unknown（例如 `README.md`）且 entry `ownership: "installer-owned"`，断言 `data.conflicts[]` 包含 `ownership: "unknown"` / `reason: "unknown-ownership"`，同时 `updatePlan.actions[]` 不包含该 path 的 `ownership: "installer-owned"` conflict action。

**误报评估：非误报**

该 finding 可由当前源码静态路径直接复现，不依赖推测或外部环境。Reviewer 没有误读 Story：unknown ownership 不得默认 installer-owned 是 Story 4.5 的显式边界；现有测试标题与 fixture 内容不一致，也确实形成覆盖缺口。

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | unknown ownership conflict 在 `updatePlan.actions` 中被误投影为 `installer-owned` | [中] | **P1** | 违反 Story 4.5 unknown ownership protected boundary 和 public projection 一致性，需要修复后复审。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

无。

### 可忽略（误报）

无。

### 待讨论

无。

### 评估决定

- **发现 #1（unknown ownership conflict 在 `updatePlan.actions` 中被误投影为 `installer-owned`）**：确认有效，必须修复；不建议 defer，不建议 dismiss。后续 fixer 应只修复 unknown ownership public projection 与测试缺口，不应借机实现 Story 4.6 repair apply 或扩展 top-level repair/sync/doctor/backup/daemon。

### 四桶统计

| 分类 | 数量 | 评估意见 |
|------|------|---------|
| 需修复 | 1 | Finding #1 为 P1 阻塞项。 |
| 可忽略 | 0 | 无误报。 |
| 待讨论 | 0 | 无需人工裁决。 |
| CR TODO | 0 | 无非阻塞延期项。 |

### 评估决定摘要

- **结论**：不通过。
- **需修复**：1。
- **可忽略**：0。
- **待讨论**：0。
- **CR TODO**：0。

## 修复执行记录

### 修复执行记录

- **Date**: 2026-06-01
- **Model Used**: GPT-5.5 (gpt-5.5)
- **Fix Items**: 1

#### Fix Items（修复项）

1. unknown ownership conflict 在 `updatePlan.actions` 中被误投影为 `installer-owned`。

#### 修复摘要

- `src/update/update-plan.ts`：`planUpdate` 处理 `detectFilesIndexEntryConflict` 返回值时，改为仅当 `conflict.ownership === "installer-owned"` 才追加 installer-owned conflict action；classifier unknown path 只保留在 `data.conflicts[]` 中，不再进入 `updatePlan.actions[]` 的 installer-owned planned effect。
- `test/update-planning.test.ts`：在 conflict projection focused test 中新增 `README.md` classifier unknown path fixture，entry 为 `installer-owned`，断言 `data.conflicts[]` 包含 `ownership: "unknown"` / `reason: "unknown-ownership"`，同时断言 `updatePlan.actions[]` 不包含该 path 的 `ownership: "installer-owned"` / `action: "conflict"`。
- 未扩展 `UpdatePlanActionSchema` 支持 `unknown`；未实现 Story 4.6 repair apply；未新增 top-level repair/sync/doctor/backup/daemon。

#### 验证命令结果

- `npm test -- --run test/update-planning.test.ts test/update-command.test.ts`：通过，2 test files / 21 tests passed。
- `npm run build`：通过，ESM / DTS build success。
- `npm test`：通过，29 test files / 192 tests passed。
- `git diff --check`：通过，无 whitespace errors。

#### 边界确认

- 未修改 Story 4.5 文档内容。
- 未修改 `sprint-status.yaml`。
- 未提交 git。
- 未启动 reviewer/evaluator。
