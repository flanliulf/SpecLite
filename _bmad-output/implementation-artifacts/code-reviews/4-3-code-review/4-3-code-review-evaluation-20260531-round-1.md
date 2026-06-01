---
Story: 4-3
Round: 1
Date: 2026-05-31
Model Used: GPT-5.5 (gpt-5.5)
Review Source: 4-3-code-review-summary-20260531-round-1.md
Review Model: GPT-5.5 (gpt-5.5)
Type: Code Review Evaluation
---

## 评估总结

对 Story 4-3 的第 1 轮 CR 代码审查结果（首轮）进行逐条评估。审查提出 2 个 `patch` 项和 1 个 `defer` 项：2 个 patch 项均经代码与 Story 边界复核确认有效，需进入 fixer 修复；1 个 defer 项属于既有慢测门槛记录，不阻塞本轮 Story 4.3 交付。评估结论如下。

---

## 发现 #1 评估

### 审查原文

> **[中] Story 4.3 越界实现 `update --repair` repair plan / `restore-canonical`**
> - 来源：auditor+edge
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

审查描述与当前实现一致。`src/commands/update.ts:53-63` 在 `repairRequested` 分支直接调用 `planRepair()`，并返回 `command: "update.repair"` 的 `RepairCommandResult`。`src/update/update-plan.ts:112-183` 已实现 `planRepair()`，其中 `src/update/update-plan.ts:162-168` 会生成 `action: "restore-canonical"`。`test/update-planning.test.ts:382-512` 还新增了 repair planning 测试，明确断言 `restore-canonical` repair action。

Story 4.3 的边界明确不是 repair 实现范围：`_bmad-output/implementation-artifacts/stories/4-3-update-plan-before-write.md:120-125` 写明本 Story 只建立 pre-write update plan 等能力，不在本 Story 中实现 `update --repair` 的 full repair apply、`restore-canonical`、`regenerate` 或 `RepairPlan` 行为；同文件 `:159-164` 也将 Story 4.6 repair planning/apply、`restore-canonical`、`RepairPlan` output 和 `update --repair` 全流程排除在本 Story 外。

**严重性判断：合理**

该问题改变了 `update --repair` 的 public contract，并提前占用了 Story 4.6 的行为边界。虽然当前代码仍是 dry-run repair plan 且未写文件，但它已经暴露 repair command data 和 `restore-canonical` action，因此属于交付边界违规，P1 阻塞修复合理。

**修复建议：可行**

建议将 Story 4.3 中的 `--repair` 行为恢复为既有占位或不暴露 repair actions 的稳定投影，并移除或改写本轮新增的 repair planning 测试。修复范围清晰，且能把 repair contract 留给 Story 4.6。

**误报评估：非误报**

不是误报。代码、测试和 Story 边界均能直接支持 reviewer 判断。

---

## 发现 #2 评估

### 审查原文

> **[中] 缺失或 malformed `sourceDescriptor` 被当作无问题，仍可能生成写入计划**
> - 来源：auditor+edge
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

审查描述与当前实现一致。`src/update/update-plan.ts:254-277` 读取 manifest context；当 `readSourceDescriptorFromManifest()` 返回 `undefined` 时，`src/update/update-plan.ts:263-267` 直接返回 `{ artifactRoot, issues: [] }`。`src/update/update-plan.ts:295-305` 对 `SourceDescriptorSchema.safeParse()` 失败也只返回 `undefined`，没有产生 malformed source descriptor issue。随后 `readPlanningContext()` 仅在 `hasBlockingResolverIssue(issues)` 为真时阻断 planning（`src/update/update-plan.ts:225-235`、`:245-251`），因此缺失或 malformed `sourceDescriptor` 不会阻断 `planUpdate()` 继续构建 `updatePlan.actions[]`。

当前实现只覆盖了可解析 descriptor 的部分 blocker：`src/update/update-plan.ts:308-341` 会处理 `trustStatus: "blocked"`、缺少 verified evidence、floating git source。对应测试也只覆盖 blocked source descriptor（`test/update-planning.test.ts:267-319`），没有覆盖缺失 `sourceDescriptor`、schema-malformed `sourceDescriptor` 或 malformed field 的阻断行为。

Story 4.3 的 AC / Task 明确要求 update planning 前读取 source descriptor，并在 source trust/evidence 不满足时阻断 write planning：`_bmad-output/implementation-artifacts/stories/4-3-update-plan-before-write.md:15-19` 要求规划前读取 source descriptor；同文件 `:92-99` 要求 source descriptor 来自 trust/evidence model，并且 `trustStatus: "blocked"`、floating Git source、local source self-reference、missing bundled packaging evidence 或 source policy blocker 必须阻断 write planning。Source descriptor contract 也要求只有显式选择 source、存在 reproducible integrity evidence 且无 blocking source-integrity problem 时，才可以进入 install/update write planning（`_bmad-output/planning-artifacts/specs/02-source-descriptor-contract.md:91-96`）。

**严重性判断：合理**

该缺口会让 malformed 或缺失的 source trust evidence 静默通过，继续暴露 write-capable update plan。它违反 AC 1 / Task 4 的 source trust gate，是功能与质量门禁问题，P1 阻塞修复合理。

**修复建议：可行**

建议在 manifest 缺失 `sourceDescriptor`、`SourceDescriptorSchema.safeParse()` 失败、缺少 verified integrity evidence 等场景生成稳定的 `source-integrity.*` / malformed issue，并使 planning `blocked: true`。同时增加 focused tests 覆盖缺失、malformed、缺少 verified evidence 三类 case。修复建议与现有 `createSourceIntegrityIssue()` / `hasBlockingResolverIssue()` 路径兼容。

**误报评估：非误报**

不是误报。现有代码确实把缺失和 parse 失败都折叠为 `undefined`，再返回空 issues；现有测试也未覆盖这两个负向场景。

---

## 发现 #3 评估

### 审查原文

> **[低] 默认 `npm test` 5s timeout 下 2 个慢测超时**
> - 分类：defer

### 评估结论：⚠️ 有效但降级 — 建议纳入 CR TODO 跟踪（P2 优先级）

### 评估分析

**问题描述准确性：基本准确**

审查文件的验证摘要说明默认 `npm test` 未在本轮重新执行，dev 记录显示默认 5s timeout 下有 2 个既有慢测 timeout，同时 `npx vitest run --testTimeout=15000` 全量通过。该问题不指向 Story 4.3 新增行为本身，而是测试运行时限门槛与慢测稳定性问题。

**严重性判断：合理**

作为 CR TODO 记录合理，但不应阻塞本轮 Story 4.3 修复判断。当前 reviewer 已明确“不作为本 Story patch 项”，分类为 defer 与严格串行 CR 流程一致。

**修复建议：可行但非必要**

可在后续测试治理中评估默认 timeout、慢测拆分或 test config 调整；本轮 fixer 应优先修复 2 个 P1 patch 项，不应在 Story 4.3 CR fixer 中顺手改测试门槛。

**误报评估：非误报**

不是误报，但属于既有/环境门槛问题，非本轮阻塞项。

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | Story 4.3 越界实现 `update --repair` repair plan / `restore-canonical` | [中] | **P1** | 当前代码和测试已暴露 Story 4.6 repair 行为，违反 Story 4.3 范围边界。 |
| 2 | 缺失或 malformed `sourceDescriptor` 被当作无问题，仍可能生成写入计划 | [中] | **P1** | 缺失/parse 失败 descriptor 静默返回空 issues，绕过 source trust gate。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 3 | 默认 `npm test` 5s timeout 下 2 个慢测超时 | [低] | **P2** | 仅作为既有慢测门槛记录，不阻塞 Story 4.3 本轮修复。 |

### 可忽略（误报）

无。

### 评估决定

- **发现 #1（Story 4.3 越界实现 `update --repair` repair plan / `restore-canonical`）**：确认有效，必须修复后才能通过。
- **发现 #2（缺失或 malformed `sourceDescriptor` 被当作无问题，仍可能生成写入计划）**：确认有效，必须修复后才能通过。
- **发现 #3（默认 `npm test` 5s timeout 下 2 个慢测超时）**：有效但非阻塞，建议记录为 CR TODO 或后续测试治理事项。

**最终评估决定：不通过。** 本轮共有 2 个阻塞修复项、1 个非阻塞延迟项、0 个误报。

## 修复执行记录

### 修复执行记录
- **Date**: 2026-05-31
- **Model Used**: GPT-5.5
- **Fix Items**: 2

#### 修复条目

1. **发现 #1：Story 4.3 越界实现 `update --repair` repair plan / `restore-canonical`**
   - 已将 `planRepair()` 收回为 Story 4.3 范围内的 protected dry-run placeholder projection：保留稳定 `update.repair` command data 形状，但不再遍历 files index 生成 `restore-canonical` / repair actions。
   - 已移除 `test/update-planning.test.ts` 中断言 `restore-canonical` repair planning 的越界测试。
   - `update --repair` 的 full repair planning/apply 行为继续留给后续 Story。

2. **发现 #2：缺失或 malformed `sourceDescriptor` 被当作无问题，仍可能生成写入计划**
   - 已在 manifest 存在但缺失 `sourceDescriptor` 时生成 `source-integrity.missing-source-descriptor` error issue，并阻断 update planning。
   - 已在 `SourceDescriptorSchema.safeParse()` 失败时生成 `source-integrity.malformed-source-descriptor` error issue，并阻断 update planning。
   - 已补充 focused tests 覆盖 missing / malformed `sourceDescriptor` 在 `--yes` 场景下仍不得产生 `updatePlan.actions[]` 或 `writeAuthorized=true`。

#### 延迟项记录

- **发现 #3：默认 `npm test` 5s timeout 下 2 个慢测超时**：按 evaluation 结论仅记录为 defer，本 fixer 未处理测试 timeout 治理。

#### 修改文件

- `src/update/update-plan.ts`
- `test/update-planning.test.ts`
- `_bmad-output/implementation-artifacts/code-reviews/4-3-code-review/4-3-code-review-evaluation-20260531-round-1.md`

#### 验证命令

- `npx vitest run test/update-planning.test.ts --testTimeout=15000`：通过，10 tests passed。
- `npx vitest run test/update-command.test.ts --testTimeout=15000`：通过，5 tests passed。
- `npm run build`：通过，ESM / DTS build success。
- `git diff --check`：通过，无 whitespace error。
