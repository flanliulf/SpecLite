---
Story: 5-5
Round: 2
Date: 2026-06-01
Model Used: GPT-5 Codex (gpt-5-codex)
Review Source: 5-5-code-review-summary-20260601-round-2.md
Review Model: GPT-5 Codex (gpt-5-codex)
Type: Code Review Evaluation
---

## 评估总结

对 Story 5-5 的第 2 轮 CR 代码审查结果（复审）进行逐条评估。Reviewer 确认 Round 1 P1 已修复，并报告 1 个新的 `patch` 发现：`applyInstallPlan` 的 `writeAuthorized=false` failure branch 缺少 `changedPaths: []`。经独立代码验证，该发现有效；虽然当前 CLI 主路径通常会在 apply 前停止未授权 install，但这是导出 runtime write boundary API 的 failure contract 缺口，且 caller 已按完整 contract 读取 `changedPaths.length`。评估结论如下。

---

## 上轮问题回顾确认

### Round 1 Finding #1：已修复

Round 1 evaluator 要求同时补齐 schema 层已授权 blocked plan invariant 与 apply 层 no-lock/no-write runtime gate。当前代码已满足该边界：

- `src/installer/install-plan-schema.ts:54-60` 在 `InstallPlanSchema.superRefine` 中拒绝 `writeAuthorized=true` 且 `sourceDescriptor.trustStatus === "blocked"` 的 plan。
- `src/installer/runtime-structure.ts:64-78` 在 `writeAuthorized` 检查之后、`acquireProjectOperationLock` 之前拒绝 blocked source，并返回 redacted `source-integrity.blocked-source` failure，包含 `changedPaths: []`。
- `test/runtime-structure.test.ts:425-507` 覆盖 write-authorized blocked source direct apply：返回 `source-integrity.blocked-source`、`changedPaths=[]`，并断言 no lock/no write 与无本机路径泄露。

### 历史 CR TODO（非阻塞）

无。

---

## 发现 #1 评估

### 审查原文

> **[低][新] `writeAuthorized=false` 的 apply 失败分支没有返回 `changedPaths`**
> - 来源：blind+edge
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

`ApplyInstallPlanResult` 的 failure 分支已经声明必须包含 `changedPaths: string[]`，见 `src/installer/runtime-structure.ts:27-33`。但 `applyInstallPlan` 的 `writeAuthorized=false` 早退分支只返回 `ok`、`issue`、`completedSteps` 和 `pendingSteps`，缺少 `changedPaths: []`，见 `src/installer/runtime-structure.ts:45-61`。

Reviewer 指出的 caller 假设也成立。`src/commands/install.ts:1004-1015` 在 `!applyResult.ok` 分支中直接读取 `applyResult.changedPaths.length`，说明 apply failure contract 已被调用方视为稳定字段。当前普通 install CLI 在 `!writeAuthorized` 时会先由 `shouldStopBeforeSourceSelection` 停止，见 `src/commands/install.ts:191-201`、`:1214-1224`，因此这不是现有 CLI happy path 的立即崩溃；但 `applyInstallPlan` 是导出的 runtime write boundary API，直接调用或未来内部复用该 branch 时会得到不完整 failure shape。

**严重性判断：偏低但仍阻塞本轮 CR**

Reviewer 标记为 `[低]` 对当前用户路径影响判断基本合理：未授权 install 通常不进入 apply，且 Round 1 blocked source P1 的 no-lock/no-write 修复没有被推翻。但从代码契约看，这是本轮 touched runtime API 的结构性错误：TypeScript 类型要求 `changedPaths`，blocked source failure branch 已按 contract 返回 `changedPaths: []`，partial failure helper 也围绕 changed paths 建立语义，见 `src/installer/runtime-structure.ts:302-317`。

因此评估后优先级定为 **P1**：不是因为功能范围大，而是因为这是导出 API 的 required failure field 缺失，且已有 caller 按该字段读取。将其作为 CR TODO 延后会留下已知 contract violation，并可能在 direct API 或后续复用路径中触发 runtime error。

**修复建议：可行**

最小修复边界非常窄：

- 只在 `src/installer/runtime-structure.ts:45-61` 的 `writeAuthorized=false` 早退 failure 对象中补 `changedPaths: []`。
- 补一条 direct `applyInstallPlan` regression：构造 `installPlan.writeAuthorized=false`，断言 result 为 failure、`changedPaths=[]`、`completedSteps=[]`、pending steps 保持 runtime apply 后续步骤，并继续确认 no lock/no write。
- 不应扩大到 resolver、install CLI prewrite flow、update planning、Epic 6 fixture matrix、source lock lifecycle 或 reporting 重构。

**误报评估：非误报**

该发现有明确类型契约、当前实现和 caller 读取证据支撑；不是误报。

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | `writeAuthorized=false` apply failure branch 缺少 `changedPaths: []` | [低] | **P1** | 导出 apply failure contract 要求 `changedPaths`，caller 已读取该字段；需在本轮 fixer 中做一行修复并补 direct regression。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

无。

### 可忽略（误报）

无。

### 评估决定

- **发现 #1（`writeAuthorized=false` apply failure branch 缺少 `changedPaths: []`）**：确认有效，阻塞本轮 CR 通过。下一步应进入 fixer，仅补齐未授权 early return 的 `changedPaths: []` 与定向 regression；不得扩大到 resolver、install/update command flow、Epic 6 fixture matrix 或 source lock lifecycle。

## 修复执行记录

### 修复执行记录
- **Date**: 2026-06-01
- **Model Used**: GPT-5 Codex (gpt-5-codex)
- **Fix Items**: 1

#### 修复项 #1：`writeAuthorized=false` apply failure branch 补齐 `changedPaths: []`

- **状态**: 已修复。
- **修改文件**:
  - `src/installer/runtime-structure.ts`: 在 `applyInstallPlan` 的 `writeAuthorized=false` early return failure 对象中补充 `changedPaths: []`，对齐 `ApplyInstallPlanResult` failure contract。
  - `test/runtime-structure.test.ts`: 新增 direct `applyInstallPlan` regression，断言 `writeAuthorized=false` 返回 failure、`changedPaths=[]`、`completedSteps=[]`、pending steps 保持 runtime apply 后续步骤，并通过 `assertNoRuntimeApplyWrites` 继续确认 no lock/no write。
- **未扩大范围**: 未改 resolver、install CLI prewrite flow、update planning、Epic 6 fixture matrix、source lock lifecycle 或 reporting 重构。
- **验证**:
  - `npm test -- test/runtime-structure.test.ts test/contract-anchors.test.ts`：通过，2 个 test files、16 个 tests。
  - `npm test`：通过，34 个 test files、258 个 tests。
  - `npm run build`：通过，tsup ESM 与 DTS build 成功。
  - `git diff --check -- src/installer/runtime-structure.ts test/runtime-structure.test.ts _bmad-output/implementation-artifacts/code-reviews/5-5-code-review/5-5-code-review-evaluation-20260601-round-2.md _bmad-output/implementation-artifacts/code-reviews/5-5-code-review/PLAN.md _bmad-output/implementation-artifacts/code-reviews/5-5-code-review/EXPERIMENTS.md _bmad-output/implementation-artifacts/code-reviews/5-5-code-review/EXPERIMENT_NOTES.md`：通过。
