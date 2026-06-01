---
Story: 4-3
Round: 1
Date: 2026-05-31
Model Used: GPT-5.5 (gpt-5.5)
Type: Code Review Summary
---

## 审查结论

首轮审查。由于当前环境没有可调用的 `Agent` 子代理工具，本轮按 `bmenhance-cr-01-reviewer` 降级规则串行完成 Blind Hunter、Edge Case Hunter、Acceptance Auditor 三层审查；审查层均已完成，无失败层。`npm run build` 通过；`npx vitest run test/update-planning.test.ts test/update-command.test.ts --testTimeout=15000` 通过（2 files / 15 tests）。本轮发现 2 个需要修复的 patch 项，建议不通过，进入 evaluator/fixer。

## 新发现

### 1. [中] Story 4.3 越界实现 `update --repair` repair plan / `restore-canonical`

- **来源**：auditor+edge
- **分类**：patch

- **证据**
  - `src/commands/update.ts:53-63` 在 `--repair` 分支直接调用 `planRepair()` 并返回 `RepairCommandResult`，摘要也声明产生 protected dry-run repair plan。
  - `src/update/update-plan.ts:112-183` 新增 `planRepair()`；其中 `src/update/update-plan.ts:162-168` 会为 installer-owned drift 生成 `action: "restore-canonical"`。
  - `test/update-planning.test.ts:382-512` 新增 repair planning tests，并明确断言 `restore-canonical` repair actions。

- **影响**
  - Story 4.3 的任务边界明确要求不在本 Story 中实现 Story 4.6 的 `update --repair`、`restore-canonical`、`regenerate` 或 `RepairPlan` 行为。当前实现提前引入 repair plan 行为，会改变 `update --repair` 的 public contract，并让后续 Story 4.6 难以区分新增行为与既有行为。

- **建议**
  - 将本 Story 中的 `--repair` 行为恢复为既有占位或无 repair actions 的稳定 command id 投影；移除或改写本轮新增的 repair planning tests，保留到 Story 4.6 实现。
  - Story 4.3 只保留 normal update 的 pre-write plan、authorization state、planned vs actual result separation 和 Evidence profile。

### 2. [中] 缺失或 malformed `sourceDescriptor` 被当作无问题，仍可能生成写入计划

- **来源**：auditor+edge
- **分类**：patch

- **证据**
  - `src/update/update-plan.ts:263-267` 在 manifest 中没有可解析 `sourceDescriptor` 时直接返回 `issues: []`。
  - `src/update/update-plan.ts:295-305` 对 `SourceDescriptorSchema.safeParse()` 失败只返回 `undefined`，没有生成 malformed/source-integrity blocker。
  - `src/update/update-plan.ts:33-40` 只有 `context.blocked` 才会阻止 plan；因此只要 config/files index 可读，缺失或 malformed source descriptor 不会阻断后续 `planUpdate()`。

- **影响**
  - AC 4 / Task 4 要求 update 写入计划前消费 source descriptor 的 trust/evidence model，并在缺少 reproducible integrity evidence、blocked/floating/local self-reference/source policy blocker 时阻断 write planning。当前实现会把缺失或 schema-malformed 的 source descriptor 视作没有 source issue，可能基于 `files-index` 和 `sourceRef` 继续生成 `update` action，绕过 source trust gate。

- **建议**
  - 当 manifest 缺失 `sourceDescriptor`、`sourceDescriptor` schema parse 失败，或 source descriptor 缺少 verified integrity evidence 时，生成稳定的 `source-integrity.*` / malformed issue 并设置 `blocked: true`。
  - 增加测试覆盖：缺失 `sourceDescriptor`、malformed `sourceDescriptor`、缺少 verified evidence 均不得暴露 write-capable `updatePlan.actions[]`。

## 验证摘要

- `npm test` 未在本轮重新执行。dev 记录显示默认 5s timeout 下有 2 个既有慢测 timeout；同一记录显示 `npx vitest run --testTimeout=15000` 全量 178/178 通过，本轮不将该 5s timeout 归为 Story 4.3 回归。
- `npm run build` ✅ 通过。
- `npx vitest run test/update-planning.test.ts test/update-command.test.ts --testTimeout=15000` ✅ 通过（2 files / 15 tests）。
- 额外复核：
  - 对照 Story 4.3 AC / Task 7 边界，确认 `planRepair()` / `restore-canonical` 属于越界实现。
  - 对照 AC 4 source descriptor trust/evidence gate，确认缺失或 malformed `sourceDescriptor` 当前不会产生 blocker。

## 通过项

- normal update 的 planned update、unchanged skip、conflict projection、`writeAuthorized === false` 时 empty `changedPaths` / `skippedPaths`、single command-level `update.conflicts` issue 和 Evidence profile 有 focused test 覆盖。
- human-owned `_speclite/custom/*.toml` 与 workflow-owned artifact root 在当前 classifier/planner 中不会进入 executable overwrite plan。
- 已知既有问题（defer）：默认 `npm test` 5s timeout 下 2 个慢测超时，dev 记录已用 `npx vitest run --testTimeout=15000` 全量通过区分为既有慢测门槛，不作为本 Story patch 项。

## 结论

- **结论：不通过**
- **阻塞项**：2 个 patch 项。
- **建议**：进入 `bmenhance-cr-02-evaluator` 评估后，由 fixer 收敛 repair 越界行为和 source descriptor blocker 缺口。
