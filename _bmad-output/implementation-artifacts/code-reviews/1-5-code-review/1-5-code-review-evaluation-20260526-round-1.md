---
Story: 1-5
Round: 1
Date: 2026-05-26
Model Used: GPT-5.5 (gpt-5.5)
Review Source: 1-5-code-review-summary-20260526-round-1.md
Review Model: GPT-5.5 (gpt-5.5)
Type: Code Review Evaluation
---

## 评估总结

对 Story 1-5 的第 1 轮 CR 代码审查结果（首轮）进行逐条评估。审查共提出 3 个高严重性 `patch` findings，分别覆盖 IDE mirror directory mutation 安全、`module-help.csv` 到 canonical package 的完整性校验、以及写入中途失败后的 public failure progress 表达。经代码和 Story 验收标准独立核对，3 个 findings 均确认有效，均为阻塞交付的 P1 修复项；误报数量为 0。

---

## 发现 #1 评估

### 审查原文

> **[高] IDE mirror entry root 在 path/symlink 安全校验前被创建**
> - 来源：blind+edge+auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

`src/fs/copy-tree.ts:25` 在 `copyCanonicalPackage` 中直接执行 `mkdir(path.join(input.projectRoot, input.targetEntryRoot), { recursive: true })`。该调用发生在逐文件 `safeWriteFile` 之前，而 `src/ide/target-writer.ts:55-62` 会把 `.claude/skills/<canonicalSkillId>` 或 `.agents/skills/<canonicalSkillId>` 作为 `targetEntryRoot` 传入。`src/fs/safe-write.ts:114-123` 中已有 `ensureSafeDirectory` 会先跑 `validateProjectPath` 再 `mkdir`，`src/fs/safe-write.ts:211-213` 与 `src/fs/safe-write.ts:254-282` 会检查 symlink segment；但 `copy-tree.ts` 的 raw `mkdir` 绕过了这一套检查。

Story AC2 明确要求任何 installer-owned path mutation 前必须执行 project-boundary、symlink escape、path escape、case conflict 和 unsafe overwrite 检查（`_bmad-output/implementation-artifacts/stories/1-5-runtime-structure-artifact-directory-and-ide-mirror-creation.md:21-28`）。AC6/AC7 又明确 `.claude/skills/<canonicalSkillId>/` 与 `.agents/skills/<canonicalSkillId>/` 是本 Story 的 IDE mirror mutation 范围（同文件 `:51-66`）。因此 `.claude` 或 `.agents` 为 symlink 时，raw `mkdir` 可能先跟随 symlink 在项目边界外创建目录，之后文件级 `safeWriteFile` 才报错，问题描述成立。

**严重性判断：合理**

该问题属于安全边界和 path-safety gate 绕过，且发生在 installer-owned mirror mutation 上。虽然不一定写入文件内容，但目录创建本身已经是 mutation，并可能发生在项目边界外。按本 Story AC2 和 AC6/AC7，这是阻塞交付的高严重性缺陷，评估为 P1 合理。

**修复建议：可行**

建议移除 raw `mkdir`，改用已有 `ensureSafeDirectory` 或新增受同等 `validateProjectPath`、symlink、case conflict、unsafe overwrite 检查保护的 IDE mirror directory creation helper。还应补充 `.claude` 与 `.agents` symlink target 的 failure-path regression test，断言外部目录未被创建。

**误报评估：非误报**

静态路径清楚显示 raw `mkdir` 先于 safe-write/path-safety guard 执行；该 finding 非误报。

---

## 发现 #2 评估

### 审查原文

> **[高] `module-help.csv` 引用缺失 canonical package 时会被静默丢弃**
> - 来源：edge+auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

`src/modules/module-metadata.ts:100-110` 读取 `helpEntries` 和 `packageRoots` 后只校验 `packageRoots.length > 0`，没有校验每个 `helpEntries[].canonicalSkillId` 都存在对应 canonical package root。`src/modules/module-metadata.ts:277-303` 会接受任意非空 `row.skill` 为 `canonicalSkillId`。后续 `src/ide/target-writer.ts:139-153` 只从 `module.packageRoots` 构造 mirror package entries，并通过 `module.helpEntries.filter((help) => help.canonicalSkillId === canonicalSkillId)` 附着匹配 help row；不匹配任何 package root 的 help row 不会生成 mirror entry、help index 或 phase coverage，也不会产生 blocking diagnostic。

现有模块级校验只覆盖 duplicate skill id 和 required dependency（`src/modules/module-metadata.ts:339-368`），没有覆盖 help row 到 package root 的引用完整性。虽然 `src/commands/install.ts:515-523` 会把 `ModuleMetadataError` 映射为 `source-integrity.unsupported-source`，但当前缺失引用场景不会抛出 `ModuleMetadataError`。Story AC9 明确要求 selected module metadata 或 help rows 引用的 canonical skill package 不存在时，不得合成、复制错误目录或静默跳过 required entry，且必须使用 reserved issue id 或先更新 owning SPEC（Story 文件 `:76-81`）。

**严重性判断：合理**

该问题会让 installed projection 在命令成功时缺少应有 help/menu/phase coverage 记录，破坏 canonical identity 和 installed-state 完整性。由于 AC9 将此场景定义为必须 blocking diagnostic，评估为高严重性、P1 阻塞项合理。

**修复建议：可行**

建议在 module discovery 阶段或 mirror planning 前增加 help row 引用校验：`helpEntries[].canonicalSkillId` 必须属于 `packageRoots` basename 集合。若触发，应返回契约化 diagnostic；如现有 taxonomy 无精确 id，应先更新 owning SPEC/schema/fixtures 后再新增公开 issue id。还应补充 fixture/unit test 覆盖 `module-help.csv` 引用不存在 skill package 时 install 失败且不生成成功 projection。

**误报评估：非误报**

当前代码确实存在 unmatched help row 被过滤掉且不报错的路径；该 finding 非误报。

---

## 发现 #3 评估

### 审查原文

> **[高] 写入中途失败时 public failure output 隐藏已完成的 runtime/artifact mutations**
> - 来源：blind+edge+auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

`src/installer/runtime-structure.ts:73-84` 会先创建 `_speclite/_config`、`_speclite/custom` 和 artifact directories；`src/installer/runtime-structure.ts:86-152` 随后写入 config files 和 human-owned stubs；`src/installer/runtime-structure.ts:154-160` 才进入 IDE mirror 写入；`src/installer/runtime-structure.ts:201-228` 又在 mirror 成功后写 manifest/index/files-index。任一阶段失败时 `applyInstallPlan` 只返回 `{ ok: false, issue }`，没有携带已完成 lifecycle step 或 partial progress。

`src/commands/install.ts:324-340` 对所有 `applyInstallPlan` 失败固定使用 `completedSteps: configInitializationCompletedSteps`，并固定 `pendingSteps: ["ide-mirror-creation", "manifest-generation", "ready-check", "ready-summary"]`。因此如果 runtime structure、artifact directories 或部分 config writes 已经完成，但 IDE mirror 或 manifest/index 写入失败，public failure output 会把已完成 mutation 隐藏成仍未完成。成功路径 `src/commands/install.ts:345-354` 则清楚列出 `runtime-structure`、`artifact-directory-creation`、`ide-mirror-creation` 和 `manifest-generation`，说明这些 stable lifecycle steps 已存在。

Story AC10 要求失败输出通过 `CommandResult<InstallCommandData>`、`issues`、`nextActions`、`completedSteps` 和 `pendingSteps` 表达 completed、failed 和 pending state（Story 文件 `:83-88`）。Task 7 进一步要求任一关键写入失败时不得声称 rollback，MVP 不提供 transactional rollback，输出应报告 completed mutations、blocking issue、pending steps 和 manual action（Story 文件 `:154-159`）。当前实现与该要求不一致。

**严重性判断：合理**

该问题不会直接造成额外写入越界，但会让失败后的安装状态不可诊断，误导人工恢复或后续 repair/validate。因为它违反 AC10/AC11 中对 partial failure public state 的硬性要求，且发生在非事务写入流程中，评估为高严重性、P1 阻塞项合理。

**修复建议：可行**

建议让 `applyInstallPlan` 在失败时返回已完成的 stable lifecycle steps 或等价 partial progress，再由 `runInstallCommand` 映射到已契约化的 `completedSteps` / `pendingSteps`。修复不应新增未契约化 `failedStep`、`readySummary`、`changedPaths` 或 ad-hoc JSON blob。应补充 failure-path test：在 runtime/config/artifact writes 后制造 IDE mirror 或 manifest write failure，断言 public output 表达已完成 write-phase step，且 `ready-check` / `ready-summary` 仍 pending。

**误报评估：非误报**

代码返回类型和 install failure mapping 均不能表达 partial progress；该 finding 非误报。

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | IDE mirror entry root 在 path/symlink 安全校验前被创建 | [高] | **P1** | raw `mkdir` 绕过 path-safety guard，可能在 symlink 外部先创建目录。 |
| 2 | `module-help.csv` 引用缺失 canonical package 时被静默丢弃 | [高] | **P1** | help row 到 package root 缺少引用完整性校验，违反 AC9 blocking diagnostic 要求。 |
| 3 | 写入中途失败时 public failure output 隐藏已完成 runtime/artifact mutations | [高] | **P1** | 非事务写入失败后无法通过已契约字段表达 partial completed state，违反 AC10/Task 7。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

无。本轮 3 个 findings 均阻塞交付，不建议降级为 CR TODO。

### 可忽略（误报）

无。误报数量：0。

### 评估决定

- **发现 #1（IDE mirror entry root 在 path/symlink 安全校验前被创建）**：确认有效，需要 fixer 修复目录创建安全路径并补充 symlink mirror regression test。
- **发现 #2（`module-help.csv` 引用缺失 canonical package 时被静默丢弃）**：确认有效，需要 fixer 增加 metadata/help 引用完整性校验和对应 failure fixture/test。
- **发现 #3（写入中途失败时 public failure output 隐藏已完成 runtime/artifact mutations）**：确认有效，需要 fixer 增加 partial progress 表达并补充 write-phase partial failure test。

### 最终决定

- **Approved / 通过**：否。
- **需要修复项数量**：3。
- **误报数量**：0。
- **是否需要 fixer**：是，进入 `bmenhance-cr-03-fixer` 执行最小修复。

## 修复执行记录

### 修复执行记录
- **Date**: 2026-05-26
- **Model Used**: GPT-5.5 (gpt-5.5)
- **Fix Items**: 3

#### 修复范围

本次仅修复 evaluation 确认的 3 个 P1 findings，未修改 Story 1-6 ReadyCheck / ready summary，未修改 Story 文档状态。

#### 修复结果

1. **IDE mirror entry root 安全校验顺序**：已修复。`copyCanonicalPackage` 移除 raw `mkdir`，改为通过 `ensureSafeDirectory` 在 `ide-mirror-writer` component 下完成 target entry root 创建；`.claude` / `.agents` symlink 会在任何外部 mirror directory mutation 前被阻断。
2. **`module-help.csv` orphan canonical package 引用**：已修复。module discovery 增加全局 package root basename 校验，`helpEntries[].canonicalSkillId` 若不对应已发现 canonical package root，则抛出 deterministic `ModuleMetadataError("module-metadata.unknown-help-skill")`，install public diagnostic 映射为既有 `source-integrity.unsupported-source`，`details.reason` 保留该稳定原因码。
3. **写入中途失败 partial progress**：已修复。`applyInstallPlan` 失败返回包含 partial `completedSteps` / `pendingSteps`，`runInstallCommand` 只映射到已契约字段；未新增 `failedStep`、`changedPaths`、`readySummary` 等未契约字段。

#### 修改文件

- `src/fs/safe-write.ts`
- `src/fs/copy-tree.ts`
- `src/modules/module-metadata.ts`
- `src/installer/runtime-structure.ts`
- `src/commands/install.ts`
- `test/runtime-structure.test.ts`
- `test/source-and-modules.test.ts`
- `test/install-module-selection.test.ts`
- `_bmad-output/implementation-artifacts/code-reviews/1-5-code-review/1-5-code-review-evaluation-20260526-round-1.md`

#### 验证记录

- `npm test -- --run test/runtime-structure.test.ts test/source-and-modules.test.ts test/install-module-selection.test.ts`：通过，3 个 test files / 24 tests passed。
- `npm test`：通过，9 个 test files / 56 tests passed。
- `npm run build`：通过，ESM 与 DTS build success。

#### 后续状态

- **Blocker**: 无。
- **是否需要重新 reviewer/evaluator**: 需要。当前 evaluation 结论仍为 Not Approved，本次 fixer 已完成修复并追加记录，下一步应重新运行 CR reviewer/evaluator 验证修复。
