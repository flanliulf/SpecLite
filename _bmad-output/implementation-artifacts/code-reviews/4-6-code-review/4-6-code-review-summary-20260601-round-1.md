---
Story: 4-6
Round: 1
Date: 2026-06-01
Model Used: GPT-5 Codex (gpt-5-codex)
Type: Code Review Summary
---

## Review Conclusion（审查结论）

首轮审查。当前环境没有 `Agent` 子工具，本轮按 `bmenhance-cr-01-reviewer` 降级策略由当前上下文完成单一审查；未启动 evaluator / fixer / finalizer，未修改源码、Story 或 `sprint-status.yaml`。Dev step 记录的 `npx vitest run test/update-planning.test.ts test/update-command.test.ts`、`npm run build`、`npm test` 已通过；reviewer 本轮只重跑 `git diff --check`，结果通过。发现 1 个 blocking `patch` 问题：IDE mirror package 级 repair 可能成功返回但未真正恢复 canonical package hash。结论：不通过。

## New Findings（新发现）

### 1. [中] IDE mirror package repair 不会移除目标包中的额外 canonical-hash 文件

- **来源**：edge+auditor
- **分类**：patch

- **证据**
  - `src/validation/rules/ide-mirror.ts:128-133` 定义 canonical package hash 会纳入 `SKILL.md`、`CHANGELOG.md`、`config.toml.example`、`customize.toml` 以及 `references` / `assets` / `scripts` 下的文件。
  - `src/manifest/hash.ts:35-67` 的 `listFiles()` 会把满足 include predicate 的文件列表作为 package hash 输入，因此目标包中多余的 `references/obsolete.md` 会导致 current hash 与 `canonicalPackageHash` 不同。
  - `src/update/update-plan.ts:553-593` 在 IDE mirror current hash 不等于 `canonicalPackageHash` 时生成 package 级 `restore-canonical` action。
  - `src/update/update-plan.ts:837-885` apply 阶段只遍历 canonical source files 并逐个 `safeWriteFile()`，没有删除、隔离或冲突化目标 package 中 canonical-hash 语义内的额外文件，也没有在 apply 后复算 package hash 验证 `expectedHash`。
  - `test/update-planning.test.ts:871-927` 只覆盖 missing target package 和单文件内容 drift，没有覆盖目标 package 内存在额外 canonical-hash 文件的 drift。

- **影响**
  - 对于 IDE mirror package 中多出来的 installer-owned 文件，例如 `.claude/skills/speclite-help/references/obsolete.md`，`speclite update --repair --yes` 可能复制 canonical source 文件后返回 success，并把 `changedPaths` 标为已变更，但额外文件仍留在目标 package 中。
  - 这违反 Story 4.6 AC 2 / AC 6 / AC 7：`restore-canonical` action 没有真正恢复 canonical 状态，authorized repair 结果也会错误报告完成。

- **建议**
  - 对 package 级 `restore-canonical` 增加 canonical-hash 文件集合对比：目标中存在但 source 中不存在、且属于 `isCanonicalPackageHashFile()` 范围的文件，应明确删除并记录 changed path，或在当前 MVP 不支持删除时转为 `unsupported-repair` conflict。
  - apply 完成后复算目标 package hash，并与 action `expectedHash` 比对；不匹配时返回 blocking issue，不得报告 success。
  - 增加 focused test：在 IDE mirror package 中放入额外 `references/obsolete.md`，断言 repair 后 hash 恢复，或断言该场景被投影为 `unsupported-repair` conflict。

## Validation Summary（验证摘要）

- `npm test` 未在 reviewer 本轮重跑；Dev step 记录为通过（29 files / 198 tests）。
- `npm run build` 未在 reviewer 本轮重跑；Dev step 记录为通过。
- `npx vitest run test/update-planning.test.ts test/update-command.test.ts` 未在 reviewer 本轮重跑；Dev step 记录为通过（2 files / 27 tests）。
- `git diff --check` reviewer 本轮重跑，通过。
- 降级说明：`Agent` 子工具不可用，未执行并行 Blind Hunter / Edge Case Hunter / Acceptance Auditor 子代理；本轮由当前上下文按 AC、边界条件和验收对照完成审查。

## Passed Items（通过项）

- `src/commands/update.ts` 已解析 `--repair` 并输出 normalized `command: "update.repair"`。
- `--yes` 且非 `--dry-run` 才进入 write stage；无授权时保留 plan，不写入，不填 `changedPaths` / `skippedPaths`。
- Repair planner 只把 installer-owned repairable drift 放入 `RepairPlan.actions[]`；human-owned、workflow-owned、unknown ownership、missing source evidence 在现有覆盖场景中保持 conflict。
- `RepairPlanActionSchema` 要求 `expectedHash` 必填，且 `skip` 必须带 reason，consumer schema 容忍 unknown future reason code。
- `issues[]` 对 path-level conflicts 投影为单个 command-level `update.conflicts`，`details.conflictCount` 与 conflict 数量对齐。
- Human-readable Evidence profile 包含 Repair Plan、Authorization、Remaining Conflicts、Protected Boundaries、Changed Paths、Skipped Paths 和 Next Actions 语义。

## Conclusion（结论）

- **结论：不通过**
- **阻塞项**：1 个 `patch`
- **计数**：`decision_needed=0`，`patch=1`，`defer=0`，`dismiss=0`
- **建议**：先修复 IDE mirror package 级 restore-canonical 的额外文件 / post-apply hash 校验问题，再进入 evaluator / fixer 后续链路。
