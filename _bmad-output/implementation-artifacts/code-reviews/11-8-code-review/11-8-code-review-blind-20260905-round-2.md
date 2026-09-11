---
Story: 11-8
Round: 2
Date: 2026-09-05
Model Used: GPT-5.6
Layer: Blind Hunter
Verdict: FAIL
---

# Blind Review（盲审）

## Verdict（结论）

**FAIL**。Round 1 的六项修复中，type mismatch、Solutioning route/current docs、old-ID deterministic redirect、authorized apply/precondition、bounded candidate scan 与 legacy lifecycle 均已形成可重放的 current evidence；但 old entrypoint 的 redirect 写入被 planner 表述为无 rename metadata 的普通 `update`，使 Story AC7 的“update plan 显式展示 rename/reprojection”仍未闭环，也与 refreshed completion gate 的明确声明冲突。

- **P1：1**
- **P2：0**
- **Owner Gate：`NONE`**
- **Focused verification**：`npx vitest run test/implementation-readiness-rename-routing.test.ts test/update-planning.test.ts test/ide-target-writer.test.ts --reporter=dot` → `3 files / 47 tests passed`。
- **Review boundary**：Story 11.8 current scoped diff、Round 1 summary/evaluation/Fix Summary、refreshed completion gate、两个 renamed packages、update/redirect implementation、focused tests、bounded ledger 与 current D1 docs。
- **Explicit exclusions**：未运行 build、full suite、packaging 或 canonical governance；未将 external `speclite-drawer-er-modeler/`、zip、workspace `.agents` / `.claude` mirrors、fixed-count drift或其他 Story 的 TypeScript baseline 归因于 Story 11.8；未处理 Story 11.9/11.10 或 generic grill semantics。

## P1 Findings（P1 发现）

### P1-1 Redirect entrypoint 的 update action 丢失 canonical rename/replacement 语义

- **Location**：`src/update/update-plan.ts:188-200,241-253,1023-1048`；`src/diagnostics/command-result-schema.ts:266-306`；`test/update-planning.test.ts:369-442`；completion gate `:32,38`。
- **Evidence**：
  - `buildCanonicalMigrationProjection()` 将每个 historical `<old-id>/SKILL.md` 放入 `desired`，内容为指向唯一 active package 的最小 redirect。
  - Planner 只有在 `entry.artifactKind === "ide-skill-package" && desired === undefined` 时才产生 `action=skip`、`reason=canonical-skill-renamed` 与 `replacementCanonicalSkillId`。Historical entrypoint 因已有 redirect `desired`，不会进入该分支，而是在 source hash 变化分支生成无 `reason`、无 replacement ID 的普通 `action=update`。
  - Machine schema进一步规定所有 non-skip actions 必须省略 `reason`，且 `replacementCanonicalSkillId` 只允许出现在 `canonical-skill-renamed` skip 上，因此 current schema无法把真正执行 redirect 的 entrypoint action表达为 rename。
  - 两 old IDs × 两 IDE targets 的 clean apply test只断言 `changedPaths`、最终 redirect正文与 active indexes；没有断言 `updatePlan.actions` 中 old entrypoint 的 rename/replacement binding，也没有再次运行 update证明 refreshed gate所称的“幂等”。该 fixture只索引 historical `SKILL.md`，所以不会有 companion old files产生 `canonical-skill-renamed` skip 来间接补偿计划语义。
  - Refreshed completion gate `:32` 声称 clean old installed package 会“显式输出 `reason=canonical-skill-renamed` 与 `replacementCanonicalSkillId`”，`:38` 又声称已有幂等证据；两项均不能由 current clean matrix重放。
- **Consequence**：更新执行虽会得到正确 redirect，但 machine-consumable plan把最关键的 old→active identity transition伪装为普通文件更新；调用方无法从执行该 rename 的 entrypoint action确定 replacement，minimal valid old package也完全没有 explicit rename action。AC7 与 completion evidence因此仍不成立。
- **Classification**：`patch`。唯一方向是让执行 redirect 的 old entrypoint plan action本身携带 typed `canonical-skill-renamed` 与 `replacementCanonicalSkillId`（或提供等价、唯一且 machine-validated 的 rename/reprojection record），并在两 IDs × 两 targets 上断言 plan→apply binding；随后二次 authorized update应证明无额外变更且 mapping/redirect/index仍一致。不得用是否存在 companion files决定 rename evidence，也不得改写 drifted old package。

## P2 Findings（P2 发现）

无。

## Round 1 Closure Review（Round 1 闭环复核）

| Round 1 finding | Round 2 status | Current evidence |
| --- | --- | --- |
| #1 Phase projection必填参数错位 | **CLOSED** | 未消费参数已移除；focused IDE tests通过，原 Story-owned `TS2345`路径不再存在。 |
| #2 Grill producer/spec/current docs route分叉 | **CLOSED** | producer/spec只消费resolver提供的`solutioning_artifacts.resolvedRoot`，failure为HALT/zero-write；D1 docs已统一exact route/date basename且删除幽灵预创建目录。 |
| #3 Old-ID真实activation redirect | **PARTIAL** | clean existing old entrypoint已被同transaction改写为最小redirect，active package/index唯一；但执行该redirect的plan action丢失rename/replacement语义，形成P1-1。 |
| #4 Authorized apply与precondition evidence | **CLOSED** | 两 IDs × 两 targets执行`yes: true` clean apply；content/mode/type/missing在operation/journal前fail-close，零partial write。 |
| #5 Exact classified scan false-green | **CLOSED** | 方案 I 使用冻结roots、raw-byte/no-follow candidate scan；24个occurrence与ledger双向exact equality，roles受限且active为零。 |
| #6 Legacy discovery/preservation仅prose | **CLOSED** | temp project真实legacy tree经install/update/repair后path/type/bytes/hash/tree不变，mutation集合无交集。 |

## Positive Evidence（正向证据）

1. Candidate-scan 方案 I 已覆盖 `assets/source/speclite/`、`src/`、`test/`、active `docs/`、root `README.md` 与 exact release manifest；legacy docs、external drawer/zip 和 `dist/` 的排除边界明确。
2. Ledger记录 `path + token + occurrence + role + rationale`，重复、extra、missing、symlink/non-file 与scan error均通过current实现fail-close；未扩大到Story 11.10 generic inventory。
3. Grill workflow/record spec已经删除 `.specskills/output` 第三root，并对 explicit-config、legacy-compatible 与 resolver failure使用同一root contract。
4. Redirect内容不复制old workflow，只指向唯一active `SKILL.md`；modified historical package仍生成redaction-safe conflict并保持`changedPaths=[]`。
5. Legacy `ir-grill` behavior test执行真实write-capable lifecycle，而非仅匹配说明文字。

## Scope Audit（范围审计）

- 本层只记录 Story 11.8 AC7 与 completion evidence 的 current residual；没有把 accumulated Epic 11 worktree、其他 Story TypeScript errors或 external drawer fixed-count drift转为finding。
- 未要求改 IR algorithm/scoring/report body、generic grill semantics、Story 11.9/11.10、external drawer/zip、workspace mirrors或fixed-count baselines。
- 除本 Blind report外未修改source、tests、Story、tracker、gate、root logs或历史CR产物。

## Owner Gate（Owner 门禁）

**Owner Gate：`NONE`。** Story AC7 已明确要求 update plan 显式展示 rename/reprojection；current typed mapping、redirect target与安全边界也都唯一，不需要产品或Architecture选择。可由fresh Aggregator/Evaluator决定具体schema/action表达并授权Fixer；本层不直接授权修改。

