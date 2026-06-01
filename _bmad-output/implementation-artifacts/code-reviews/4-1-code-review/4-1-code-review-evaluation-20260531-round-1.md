---
Story: 4-1
Round: 1
Date: 2026-05-31
Model Used: GPT-5.5
Review Source: 4-1-code-review-summary-20260531-round-1.md
Review Model: GPT-5.5
Type: Code Review Evaluation
---

## 评估总结

对 Story 4-1 的第 1 轮 CR 代码审查结果（首轮）进行逐条评估。审查共提出 2 个新发现：1 个 `update --repair` protected boundary 漏洞，1 个 `validate` file-integrity configured artifact root 覆盖缺口。经当前代码独立核验，两个发现均成立，均需要修复后再复审。评估结论如下。

---

## 发现 #1 评估

### 审查原文

> **[高] `update --repair` 会把路径已判定为 human-owned / workflow-owned 的错误索引项当作 installer-owned 修复**
> - 来源：blind+edge+auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

`src/update/update-plan.ts:194-199` 先按 `entry.path` 和 configured `artifactRoot` 调用 `classifyOwnership()`，但只在 classifier 返回 `unknown` 时使用 classifier ownership；否则回退到 `input.entry.ownership`。因此 `_speclite/custom/config.toml` 这类 classifier 可判定为 `human-owned` 的路径，如果 files-index entry 被错标为 `installer-owned`，`src/update/update-plan.ts:201-207` 的 protected ownership conflict 不会触发。随后 repair 分支在 `src/update/update-plan.ts:81-88` 只按 `entry.ownership !== "installer-owned"` 过滤 protected paths，错标 entry 会继续进入 source evidence 读取，并在 `src/update/update-plan.ts:105-115` 生成 `restore-canonical` action。

该行为与 ownership classifier 自身定义冲突：`src/update/ownership-model.ts:40-47` 将 `_speclite/custom/*.toml` 分类为 protected `human-owned`，`src/update/ownership-model.ts:49-56` 将 configured artifact root 下路径分类为 protected `workflow-owned`，`src/update/ownership-model.ts:91-93` 明确非 `installer-owned` 都是 protected。Story 4-1 也要求 `update --repair` 不得将 workflow artifacts 纳入 `restore-canonical`、`regenerate` 或 changed paths，并要求 human-owned / workflow-owned / unknown ownership 进入 conflicts（`_bmad-output/implementation-artifacts/stories/4-1-ownership-model-and-protected-file-boundaries.md:50-55`、`:87-91`）。

**严重性判断：合理**

原始严重性 `[高]` 合理。当前实现把“索引声称 installer-owned”置于“路径 classifier 判定 protected”之上；一旦后续 repair apply 接入实际写入，错误 files-index 会把 human-owned 或 workflow-owned 文件纳入可执行 repair action，存在用户配置或工作流产物被 canonical 内容覆盖的风险。该问题违反 protected boundary，是阻塞交付问题，评估为 P1。

**修复建议：可行**

建议可行。`classifyEntryConflict()` 应把 classifier 的 `human-owned`、`workflow-owned`、`unknown` 作为硬边界；当 classifier 与 files-index ownership 冲突时，优先返回 path-level conflict，而不是允许 entry ownership 将 protected classification 降级为 installer-owned。还应补充错标 files-index 的 update 与 repair focused tests。

**误报评估：非误报**

非误报。现有 focused test 仅覆盖 files-index 已正确标注 `human-owned` 时不会进入 repair action（`test/update-planning.test.ts:122-159`），没有覆盖 files-index 错标为 `installer-owned` 但路径 classifier 可判定为 protected 的场景。

---

## 发现 #2 评估

### 审查原文

> **[中] `validate` 的 file-integrity ownership 检查未接收 configured artifact root**
> - 来源：edge+auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

`src/validation/validate-project.ts:83-89` 已读取 `manifestSchemaResult.manifest.paths.artifactRoot` 并传给 artifact path validation；但随后 `src/validation/validate-project.ts:94-97` 调用 `validateFileIntegrity()` 时只传入 `projectRoot` 和 `filesIndex`，没有传 configured artifact root。`src/validation/rules/file-integrity.ts:14-17` 的函数签名也没有 `artifactRoot` 参数，`src/validation/rules/file-integrity.ts:42-46` 调用 `classifyOwnership({ relativePath: entry.path })` 时只能使用 ownership classifier 的默认 `_speclite-output` root。由于 `src/update/ownership-model.ts:49-56` 只有在收到 `artifactRoot` 时才会把非默认 configured root 下路径判为 `workflow-owned`，file-integrity 当前无法识别 `.artifacts/**` 这类 configured workflow artifact root。

测试覆盖也印证了缺口：`test/file-integrity-ownership.test.ts:14-36` 只创建并检查默认 `_speclite-output/report.md` 和 `_speclite/custom/config.toml` 的错标诊断，未覆盖 manifest configured artifact root。Story 4-1 明确要求 configured workflow artifact root 不能硬编码只识别默认路径（`_bmad-output/implementation-artifacts/stories/4-1-ownership-model-and-protected-file-boundaries.md:50-55`、`:72-78`）。

**严重性判断：偏低**

原始严重性 `[中]` 对运行期破坏风险本身可以理解，但作为 Story 4-1 AC6 的直接缺口，它会让 `validate` 无法在 configured artifact root 场景下报告 `file-integrity.unsafe-overwrite-risk`。这是 protected boundary 质量门禁缺口，不应延迟到 CR TODO，评估提升为 P1。

**修复建议：可行**

建议可行。扩展 `validateFileIntegrity()` 入参以接收 `artifactRoot`，由 `validateProject()` 传入 `manifestSchemaResult.manifest.paths.artifactRoot`，并在 `classifyOwnership()` 调用中使用该值即可。补充 `.artifacts/report.md` 被错标为 `installer-owned` 时产生 `file-integrity.unsafe-overwrite-risk` 且 `classifiedOwnership: "workflow-owned"` 的 focused test，能直接锁定回归。

**误报评估：非误报**

非误报。当前代码路径没有任何方式把 manifest configured artifact root 传入 file-integrity ownership classification。

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | `update --repair` 会把 protected path 的错标 files-index entry 当作 installer-owned 修复 | [高] | **P1** | protected classifier result 没有作为硬边界，错标 entry 可生成 `restore-canonical` action。 |
| 2 | `validate` 的 file-integrity ownership 检查未接收 configured artifact root | [中] | **P1** | configured workflow artifact root 未参与 file-integrity classifier，违反 AC6 并漏报 unsafe overwrite risk。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| — | — | — | — | 本轮无建议延迟项。 |

### 可忽略（误报）

| # | 发现 | 原始严重性 | 忽略理由 |
|---|------|----------|---------|
| — | — | — | 本轮无误报。 |

### 评估决定

- **发现 #1（`update --repair` protected boundary 漏洞）**：确认有效，需要修复后复审；当前评估决定为不通过。
- **发现 #2（file-integrity 未接收 configured artifact root）**：确认有效，需要修复后复审；不建议降级为 CR TODO。
- **整体决定**：不通过。需要完成 2 项修复，0 项可延迟，0 项可忽略。

## 修复执行记录

### 修复执行记录
- **Date**: 2026-05-31
- **Model Used**: GPT-5.5
- **Fix Items**: 2

#### 修复条目

1. **发现 #1：`update --repair` protected boundary 漏洞**
   - 修改 `src/update/update-plan.ts`，让 `classifyEntryConflict()` 优先以 path classifier 的 `human-owned`、`workflow-owned`、`unknown` 结果作为 protected 硬边界。
   - 修改 `planRepair()`，当 conflict ownership 为 protected 时直接记录 conflict 并跳过 source evidence 与 `restore-canonical` action 生成，避免错标为 `installer-owned` 的 protected path 进入 repair action。
   - 在 `test/update-planning.test.ts` 增加错标 files-index 场景，覆盖 `_speclite/custom/config.toml` 与 configured artifact root `.artifacts/report.md` 均不会生成 `restore-canonical`。

2. **发现 #2：`validate` file-integrity 未接收 configured artifact root**
   - 修改 `src/validation/validate-project.ts`，将 `manifestSchemaResult.manifest.paths.artifactRoot` 传入 `validateFileIntegrity()`。
   - 修改 `src/validation/rules/file-integrity.ts`，扩展 `validateFileIntegrity()` 入参并在 `classifyOwnership()` 调用中使用 configured artifact root。
   - 在 `test/file-integrity-ownership.test.ts` 增加 `.artifacts/report.md` 错标为 `installer-owned` 的回归测试，确认输出 `file-integrity.unsafe-overwrite-risk` 且 `classifiedOwnership` 为 `workflow-owned`。

#### 验证记录

- `npm test -- test/update-planning.test.ts test/file-integrity-ownership.test.ts`：通过，2 个测试文件、7 个测试全部通过。
- `npm run build`：通过，ESM 与 DTS build 均成功。
- `git diff --check`：通过，无空白错误。
