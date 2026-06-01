---
Story: 4-6
Round: 1
Date: 2026-06-01
Model Used: GPT-5 Codex (gpt-5-codex)
Review Source: 4-6-code-review-summary-20260601-round-1.md
Review Model: GPT-5 Codex (gpt-5-codex)
Type: Code Review Evaluation
---

## Evaluation Summary（评估总结）

对 Story 4-6 的第 1 轮 CR 代码审查结果（首轮）进行逐条评估。Reviewer 提出 1 个 blocking `patch` finding：IDE mirror package 级 `restore-canonical` 只写回 canonical source 中存在的文件，未处理目标 package 中额外但仍参与 canonical package hash 的文件，可能导致 `update --repair --yes` 返回 success 但 package hash 仍不等于 action `expectedHash`。经 Story AC/Tasks 与当前代码独立验证，该发现成立，且属于 Story 4.6 repair 语义范围内的交付阻塞问题。

评估结论：不通过。需修复 1 项，可忽略 0 项，待讨论 0 项，CR TODO 0 项。

---

## Finding #1 Evaluation（发现 #1 评估）

### Review Original（审查原文）

> **[中] IDE mirror package repair 不会移除目标包中的额外 canonical-hash 文件**
> - 来源：edge+auditor
> - 分类：patch

### Evaluation Conclusion（评估结论）：✅ 确认有效 — 需要修复（P1 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性：准确**

Story 4.6 明确要求 `update --repair` 恢复 IDE mirrors 的 canonical 状态，并继续保护 human/workflow 产物；AC 2 要求可恢复 drift 进入 `restore-canonical` action 且列出 `expected hash`，AC 6 要求授权 repair 只修改 repair plan 中获授权的 installer-owned paths，AC 7 要求 repair 完成后真实报告 changed/skipped/remaining conflicts。相关文本见 `_bmad-output/implementation-artifacts/stories/4-6-explicit-repair-for-recoverable-installer-owned-drift.md:9-11`、`:21-25`、`:45-55`。

当前 package hash 语义会纳入 `SKILL.md`、`CHANGELOG.md`、`config.toml.example`、`customize.toml`，以及 `references` / `assets` / `scripts` 下的文件；`src/validation/rules/ide-mirror.ts:128-133` 的 `isCanonicalPackageHashFile()` 定义了该 include 范围，`src/manifest/hash.ts:17-32` 与 `:35-67` 会把 include 范围内的文件名和内容作为 package hash 输入。因此目标包内额外的 `references/obsolete.md` 会改变 current package hash。

Planner 对 IDE mirror 使用 package-level action：`src/update/update-plan.ts:553-593` 在 current hash 与 `entry.canonicalPackageHash` 不同且 source hash 可证明时生成 affectedPath 为整个 IDE skill package 的 `restore-canonical`，并把 `expectedHash` 设置为 canonical package hash。这说明 action 的目标不是单个文件 hash，而是 package/hash 级恢复。

Apply 侧只读取 source package 文件并逐个 `safeWriteFile()`：`src/update/update-plan.ts:817-885` 遍历 `sourceFiles` 写入目标 package，之后 `src/update/update-plan.ts:887-890` 直接返回 `{ ok: true, changedPaths }`。该路径没有枚举目标 package 中 source 不存在但仍满足 `isCanonicalPackageHashFile()` 的额外文件，也没有在 apply 后复算目标 package hash 与 `action.expectedHash` 比对。上层 `applyRepairActions()` 在 IDE repair 返回 ok 后仅合并 changed paths 并继续，见 `src/update/update-plan.ts:688-706`；`createRepairCommandResult()` 会在无 issues、无 conflicts 且 commandCompleted 为 true 时得出 success，见 `src/diagnostics/command-result.ts:203-238`、`:241-252`。

现有 focused test 只覆盖 missing target package 和单文件内容 drift：`test/update-planning.test.ts:871-927` 断言 `.agents` 缺失 package 与 `.claude` `SKILL.md` drift 可以被写回，但未覆盖目标 package 内额外 canonical-hash 文件仍留存的情况。

**严重性判断：合理**

原始严重性为 `[中]`，评估后作为 P1 blocking patch 处理。理由是该问题不会扩大为数据安全风险，但会破坏 Story 4.6 的核心功能承诺：authorized repair 可能报告成功，实际 canonical package hash 仍不匹配 `expectedHash`。这直接影响 AC 2、AC 6、AC 7，以及 Task 3/5/7 对 expected hash、真实 changed paths 和 deterministic hash behavior 的要求。

**修复建议：可行**

建议保持最小修复范围：

1. 仅针对 IDE mirror package 级 `restore-canonical` action，比较 source package 与 target package 中 `isCanonicalPackageHashFile()` 范围内的文件集合。
2. 对 target 中存在、source 中不存在、且仍属于 canonical package hash 范围的文件，必须选择一种可验证结果：删除并把 path 记录到 `changedPaths`；或若当前 MVP 不支持删除/无法安全证明 ownership，则转为 blocking apply issue 或 `unsupported-repair` conflict，不得返回 success。
3. Apply 后复算 target package hash，与 action `expectedHash` 比对；若仍不匹配，返回 blocking issue，避免 misleading success。
4. 增加 focused test：在 IDE mirror package 目标目录放入额外 `references/obsolete.md`，断言 repair 后 package hash 恢复，或断言该场景不会成功返回而是被投影为 blocking issue/conflict。

修复不得扩大到 human-owned、workflow-owned、unknown ownership 或 protected boundaries；不得把 protected 文件纳入 executable repair plan；不得为普通 `speclite update` 改变 non-overwrite/conflict 语义。这里的边界只覆盖可证明属于 installer-owned IDE mirror canonical package hash drift 的 repair 语义。

**误报评估：非误报**

该 finding 有代码证据、Story AC 支撑和测试缺口支撑。`restore-canonical` action 的 `expectedHash` 是 package hash；如果 apply 后不处理额外 hash 文件也不校验 post-apply hash，就可能出现“报告 success 但目标 package 仍不 canonical”的误导结果。因此不能忽略。

---

## Overall Evaluation Conclusion（整体评估结论）

### Need Fix（需要修复，阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | IDE mirror package repair 不会移除目标包中的额外 canonical-hash 文件 | [中] | **P1** | Package-level `expectedHash` 必须在 apply 后真实满足；否则需返回 blocking issue/conflict，不能 success。 |

### CR TODO Tracking（建议纳入 CR TODO 跟踪，非阻塞）

无。

### Ignorable（可忽略，误报）

无。

### Discussion Needed（待讨论）

无。

### Evaluation Decision（评估决定）

- **发现 #1（IDE mirror package repair 不会移除目标包中的额外 canonical-hash 文件）**：确认有效，需修复。修复边界应限于 IDE mirror package 级 `restore-canonical` 的 installer-owned canonical-hash drift：处理额外 hash 文件或阻断成功结果，并增加 post-apply package hash 校验与 focused test；不得扩大到 human/workflow/unknown/protected 覆盖。

## 修复执行记录

### 修复执行记录

- **Date**: 2026-06-01
- **Model Used**: GPT-5 Codex (gpt-5-codex)
- **Fix Items**: 1

#### Fix Item #1（IDE mirror package repair 处理额外 canonical-hash 文件）

- **Status**: 已完成
- **Scope**: 仅修复 IDE mirror package 级 `restore-canonical` action；未扩大到 human-owned、workflow-owned、unknown ownership 或 protected boundaries。
- **Changed Files**:
  - `src/update/update-plan.ts`
  - `test/update-planning.test.ts`
  - `_bmad-output/implementation-artifacts/code-reviews/4-6-code-review/PLAN.md`
  - `_bmad-output/implementation-artifacts/code-reviews/4-6-code-review/EXPERIMENTS.md`
  - `_bmad-output/implementation-artifacts/code-reviews/4-6-code-review/EXPERIMENT_NOTES.md`
  - `_bmad-output/implementation-artifacts/code-reviews/4-6-code-review/4-6-code-review-evaluation-20260601-round-1.md`
- **Implementation Summary**:
  - `applyIdeMirrorRepairAction()` 现在会读取 source package 与 target package 的 canonical package hash 文件集合。
  - 对 target 中存在、source 中不存在、且属于 `isCanonicalPackageHashFile()` 范围的文件执行删除，并把删除路径记录到 `changedPaths`。
  - package repair 写回 source 文件后重新计算 target package hash；若不等于 action `expectedHash`，返回 `update.repair-postcondition` blocking issue，避免 repair success 误导。
  - focused regression 覆盖 `.agents/skills/speclite-help/references/obsolete.md` 这类 target-only canonical-hash 文件，断言 repair 删除该文件并恢复 canonical package hash。
- **Verification**:
  - `npx vitest run test/update-planning.test.ts test/update-command.test.ts`：通过，2 个 test files，28 个 tests。
  - `npm run build`：通过。
  - `npm test`：通过，29 个 test files，199 个 tests。
  - `git diff --check`：通过。
- **Residual Risk**: 无已知未解决风险；仍需后续 reviewer/evaluator 复检，本轮未执行。
