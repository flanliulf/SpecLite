---
Story: 4-3
Round: 3
Date: 2026-05-31
Model Used: GPT-5.5 (gpt-5.5)
Type: Code Review Summary
---

## 审查结论

本轮为复审。由于当前环境没有可调用的 `Agent` 子代理工具，本轮按 `bmenhance-cr-01-reviewer` 降级规则串行完成 Blind Hunter、Edge Case Hunter、Acceptance Auditor 三层审查；审查层均已完成，无失败层。Round 2 的 manifest 缺失 / 读取失败 / YAML parse 失败路径现在会在生成 write-capable update plan 前阻断，Round 1 的两个 blocker 也未回归。但全量 `npm test` 目前有 2 个非 timeout 失败，原因是 `test/update-command.test.ts` 仍按旧的 missing files-index conflict 输出断言，未随 source descriptor gate 语义更新。本轮建议不通过，进入 evaluator/fixer。

## 上轮问题回顾

### 已修复

1. Round 2 / Finding #1 — manifest 文件缺失或不可读时仍绕过 source descriptor blocker 并授权 update plan
   - `src/update/update-plan.ts:198-230` 的 `readManifestContext()` 现在在读取 `_speclite/_config/manifest.yaml` 或 YAML parse 失败时返回 `source-integrity.missing-source-descriptor` error issue。
   - `src/update/update-plan.ts:169-178` 会在该 error issue 出现后返回空 `updatePlan.actions` 并设置 `blocked: true`，因此 `--yes` 也不会暴露 write-capable update plan。
   - `test/update-planning.test.ts:366-460` 已覆盖 manifest 文件缺失与 manifest YAML parse 失败，断言 `updatePlan.actions: []`、`writeAuthorized: false`、exit code non-zero。

2. Round 1 / Finding #1 — Story 4.3 越界实现 `update --repair` repair plan / `restore-canonical`
   - `src/update/update-plan.ts:112-126` 的 `planRepair()` 仍只返回空 `repairPlan.actions`、空 apply results 和 `writeAuthorized: false`，未重新生成 `restore-canonical` / `regenerate` executable repair actions。

3. Round 1 / Finding #2 — manifest 存在但缺失或 malformed `sourceDescriptor` 被当作无问题
   - `src/update/update-plan.ts:249-290` 仍将 manifest 中缺失 `sourceDescriptor` 映射为 `source-integrity.missing-source-descriptor`，将 schema parse 失败映射为 `source-integrity.malformed-source-descriptor`。
   - `test/update-planning.test.ts:318-364` 与 `test/update-planning.test.ts:462-517` 继续覆盖这两条路径。

### 仍为非阻塞待办

1. Round 1 / Finding #3 — 默认 `npm test` 5s timeout 下慢测治理
   - 本轮 `npm test` 的失败不是 5s timeout 慢测问题，而是 `test/update-command.test.ts` 的断言与当前 source descriptor gate 输出不一致。
   - 维持既有评估结论：默认 timeout 慢测治理仍为 CR TODO / 非阻塞。

## 新发现

### 1. [中][新] `test/update-command.test.ts` 仍断言旧 missing files-index 行为，导致全量测试失败

- **来源**：auditor+edge
- **分类**：patch

- **证据**
  - `test/update-command.test.ts:15-75` 构造只含 `_speclite/config.toml` / custom TOML、但没有 `_speclite/_config/manifest.yaml` 的 fixture，却仍期望 `issues[0].issueId === "update.conflicts"`、`conflicts[0].affectedPath === "_speclite/_config/files-index.json"`、`requiresConfirmation === true`。
  - `test/update-command.test.ts:77-137` 的 `update --repair --json` fixture 同样没有 manifest，却断言 issues 只包含 `update.conflicts`。
  - 实际执行 `npx vitest run test/update-command.test.ts --testTimeout=15000` 失败：第一个 case 实际返回 `source-integrity.missing-source-descriptor`、`conflicts: []`、`requiresConfirmation: false`；第二个 case 实际返回 `source-integrity.missing-source-descriptor` 加 `update.conflicts` 两个 issues。

- **影响**
  - 全量 `npm test` 当前失败（28 files 中 1 failed，180 tests 中 2 failed），不属于已记录的默认 5s timeout 慢测治理。
  - Story 4.3 的当前 source descriptor gate 语义要求 manifest/source descriptor gate 先于 write-capable update planning 生效；保留旧断言会让回归套件持续失败，并让缺 manifest 场景的预期输出不清晰。

- **建议**
  - 如果这两个 tests 的目标是验证 missing files-index conflict，则 fixture 应补齐有效 `_speclite/_config/manifest.yaml` 与可信 `sourceDescriptor`，让流程越过 manifest gate 后再触发 files-index conflict。
  - 如果目标是验证 missing manifest gate，则应更新断言为 `source-integrity.missing-source-descriptor`、空 `conflicts`、`requiresConfirmation: false`、空 plan/apply results。
  - `update --repair` case 还需明确是否应在 `planRepair()` blocked 时继续保留 files-index conflict；若保留，应同步更新 expected issues 数组包含 source descriptor blocker 和 `update.conflicts`。

## 验证摘要

- `npm test` ❌ 失败（28 files：27 passed / 1 failed；180 tests：178 passed / 2 failed），失败均位于 `test/update-command.test.ts`，不是 timeout。
- `npm run lint` ❌ 未配置：`package.json` 没有 `lint` script，npm 返回 `Missing script: "lint"`。
- `npm run build` ✅ 通过（ESM / DTS build success）。
- `npx vitest run test/update-planning.test.ts --testTimeout=15000` ✅ 通过（1 file / 12 tests）。
- `npx vitest run test/update-command.test.ts --testTimeout=15000` ❌ 失败（1 file / 5 tests；2 failed）。
- `git diff --check -- src/update/update-plan.ts test/update-planning.test.ts` ✅ 通过。
- 额外复核：
  - manifest 缺失和 YAML parse 失败路径已通过 focused tests 证明会阻断 `--yes` 下的 write-capable update plan。
  - `planRepair()` 未重新生成 executable repair actions。
  - manifest 存在但缺失或 malformed `sourceDescriptor` 的 blocker 未回归。

## 通过项

- Round 2 的剩余 blocker 已修复：manifest 读取/解析失败会在 action construction 前产生 source integrity blocker。
- Round 1 的两个 blocker 未回归：repair executable actions 未恢复；manifest 内缺失或 malformed `sourceDescriptor` 仍阻断 planning。
- 已知既有问题（defer）：默认 `npm test` 5s timeout 慢测治理继续作为非阻塞 CR TODO；本轮实际失败不是该 defer 项。

## 结论

- **结论：不通过**
- **阻塞项**：1 个 patch 项。
- **建议**：进入 `bmenhance-cr-02-evaluator` 评估后，由 fixer 同步 `test/update-command.test.ts` 的 fixture 或断言，使测试预期与当前 source descriptor gate 契约一致。
