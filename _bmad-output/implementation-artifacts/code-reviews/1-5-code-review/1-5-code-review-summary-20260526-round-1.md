---
Story: 1-5
Round: 1
Date: 2026-05-26
Model Used: GPT-5.5 (gpt-5.5)
Type: Code Review Summary
---

## 审查结论

首轮审查。由于当前环境未安装项目依赖，`npm run build`、`npm test` 未能复验通过，`npm run lint` 在 `package.json` 中不存在对应脚本；Story 开发日志记录此前 `npm run build` 与 `npm test` 已通过，但本轮 reviewer 未能独立复现。审查层状态：`Agent` 工具不可用，已按 skill 降级为当前 agent 串行执行 Blind Hunter、Edge Case Hunter、Acceptance Auditor 三层审查；无三层输出失败。

结论：不通过。发现 3 个阻塞级 `patch` 问题，均属于 Story 1.5 验收范围内的 runtime/IDE mirror 写入安全、manifest/help projection 完整性或 failure diagnosability 问题。ReadyCheck / ready summary 未被提前实现，但失败路径仍需修正后进入 evaluator，再根据评估结果进入 fixer。

## 新发现

### 1. [高] IDE mirror entry root 在 path/symlink 安全校验前被创建

- **来源**：blind+edge+auditor
- **分类**：patch

- **证据**
  - `src/fs/copy-tree.ts:25` 在复制 canonical package 前直接执行 `mkdir(path.join(input.projectRoot, input.targetEntryRoot), { recursive: true })`。
  - `src/ide/target-writer.ts:55-62` 将 `.claude/skills/<canonicalSkillId>` 或 `.agents/skills/<canonicalSkillId>` 传入 `copyCanonicalPackage`，随后才在单个文件写入时通过 `safeWriteFile` 做安全校验。
  - 如果目标项目中 `.claude` 或 `.agents` 已是指向项目外的 symlink，raw `mkdir` 会先跟随 symlink 创建外部目录，之后的 `safeWriteFile` 才可能发现 symlink segment 并失败。

- **影响**
  - 违反 AC2 “任何 installer-owned path mutation 必须先做 project-boundary / symlink escape / path escape / case conflict / unsafe overwrite 检查”的要求。
  - 影响 AC6/AC7 IDE mirror creation：target mirror 目录创建本身就是 mutation，不能绕过 safe-write/path-safety guard。
  - 失败时可能已经在项目边界外留下 `.claude/skills` 或 `.agents/skills` 目录，属于安全边界缺陷。

- **建议**
  - 移除 raw `mkdir`，改用与 artifact/runtime directory 相同的安全目录创建 primitive，或新增受 `validateProjectPath`/symlink/case checks 保护的 IDE mirror directory creation helper。
  - 增加测试：目标项目存在 `.claude` symlink 和 `.agents` symlink 时，install 必须在任何 mirror directory mutation 前失败，且外部目录不被创建。

### 2. [高] `module-help.csv` 引用缺失 canonical package 时会被静默丢弃

- **来源**：edge+auditor
- **分类**：patch

- **证据**
  - `src/modules/module-metadata.ts:100-110` 读取 `helpEntries` 与递归发现的 `packageRoots`，但只校验 `packageRoots.length > 0`，未校验每个 help row 的 `canonicalSkillId` 都有对应 package root。
  - `src/modules/module-metadata.ts:277-285` 会接受任意非空 `row.skill` 作为 `canonicalSkillId`。
  - `src/ide/target-writer.ts:139-153` 只从 `module.packageRoots` 构建 package entries，并用 `module.helpEntries.filter(...)` 附着匹配行；不存在 package root 的 help row 不会生成 mirror entry、help index、phase coverage，也不会产生 blocking diagnostic。

- **影响**
  - 违反 AC9：selected module metadata 或 help rows 引用的 canonical skill package 不存在时，不得合成、复制错误目录或静默跳过 required entry，必须 blocking diagnostic。
  - 会导致 installed projection 缺少 help/menu/phase coverage rows，但命令仍可能成功，后续 Story 1.6 / Epic 3 验证基于不完整 installed state。

- **建议**
  - 在 module discovery 或 mirror planning 阶段验证 `helpEntries[].canonicalSkillId` 是 `packageRoots` basename 集合的子集。
  - 对缺失项返回 reserved issue id；若现有 taxonomy 没有精确 id，先更新 owning SPEC/schema/fixtures 后再新增，不要使用自由文本 issue id。
  - 增加 fixture/unit test：`module-help.csv` 引用不存在的 skill 时，install 失败且不生成 IDE mirror / help-index / phase-coverage 的成功 projection。

### 3. [高] 写入中途失败时 public failure output 隐藏已完成的 runtime/artifact mutations

- **来源**：blind+edge+auditor
- **分类**：patch

- **证据**
  - `src/installer/runtime-structure.ts:73-160` 在 `applyInstallPlan` 中依次创建 `_speclite/_config`、`_speclite/custom`、artifact directories、config files、human-owned stubs，然后才写 IDE mirrors。
  - `src/commands/install.ts:324-340` 对任何 `applyInstallPlan` failure 都只使用 `completedSteps: configInitializationCompletedSteps`，并固定 pending `ide-mirror-creation`、`manifest-generation`、`ready-check`、`ready-summary`。
  - 因此如果 runtime/config/artifact writes 已完成但 IDE mirror 或 manifest/index 写入失败，返回结果不会表达已经完成的 write-phase state。

- **影响**
  - 违反 AC10：失败时必须通过 `CommandResult<InstallCommandData>`、`issues`、`nextActions`、`completedSteps` 和 `pendingSteps` 表达 completed、failed 和 pending state。
  - 当前实现虽然没有提前显示 ReadyCheck / ready summary，但会把部分写入后的失败表现得像尚未进入 runtime/artifact 写入阶段，降低人工恢复和后续 repair/validate 的可诊断性。

- **建议**
  - 让 `applyInstallPlan` 返回 partial progress，例如已完成的 stable lifecycle steps 与失败 step，再由 `runInstallCommand` 映射到 `completedSteps` / `pendingSteps`。
  - 保持不新增未契约化 `failedStep`、`readySummary`、`changedPaths` 或 ad-hoc blob；只使用已契约化字段表达状态。
  - 增加 failure-path test：在 runtime/config/artifact writes 后制造 IDE mirror write failure，断言 `completedSteps` 包含已完成的 write-phase step，`ready-check` / `ready-summary` 仍 pending。

## 验证摘要

- `npm test` ❌ 未通过当前复验：`vitest: command not found`。
- `npm run lint` ❌ 未通过当前复验：`package.json` 无 `lint` script。
- `npm run build` ❌ 未通过当前复验：`tsup: command not found`。
- Story 开发日志记录：`npm run build` passed；`npm test` passed，9 files / 52 tests。该记录未能在当前只读 CR 环境中复现，因为未执行会写入 `node_modules` 的依赖安装。
- 定向复现：尝试在 CR `.tmp` 中构造 IDE symlink mirror 场景，但当前环境缺少 `tsx`，未能执行 TypeScript runtime；该 finding 基于静态代码路径和 AC 对照成立。

## 通过项

- Story 文件当前状态为 `review`，File List 覆盖 runtime structure、safe write、IDE mirror、manifest/index、tests 与 fixture snapshots。
- `runInstallCommand` 成功路径未新增 `readySummary`、`failedStep`、`changedPaths` 或 ad-hoc install JSON blob；成功路径将 `ready-check` / `ready-summary` 保持 pending，未提前实现 Story 1.6 ReadyCheck。
- `safeWriteFile` 使用 same-directory `.speclite-tmp-*` + `rename`，并避免将 temp path、lock path写入 observed files index / success fixture。
- human-owned project-level stubs 在测试中覆盖 existing content preservation，并以 `human-owned` 投影到 files index。
- canonical target order 使用 `CANONICAL_TARGET_ORDER`，observed fixture 中输出顺序为 `claude` 再 `agents`。

## 结论

- **结论：不通过**
- **阻塞项**：3 个 `patch` 问题，均为 `[高]`
- **建议**：先进入 `bmenhance-cr-02-evaluator` 评估本轮 findings；若 evaluator 确认成立，再进入 fixer 执行最小修复并补充对应 failure-path / metadata mismatch / symlink mirror tests。
