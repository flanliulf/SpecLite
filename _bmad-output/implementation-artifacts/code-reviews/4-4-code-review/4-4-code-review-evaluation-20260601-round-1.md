---
Story: 4-4
Round: 1
Date: 2026-06-01
Model Used: GPT-5.5 (gpt-5.5)
Review Source: 4-4-code-review-summary-20260601-round-1.md
Review Model: GPT-5.5 (gpt-5.5)
Type: Code Review Evaluation
---

## 评估总结

对 Story 4-4 的第 1 轮 CR 代码审查结果（首轮）进行逐条评估。Reviewer 提出的 4 个 finding 均经当前源码、Story AC 和 focused tests 独立验证，均为有效 patch 项，不属于误报，也不适合 defer。评估结论：不通过；需要修复 4 项，建议纳入 CR TODO 0 项，可忽略 0 项，待讨论 0 项。

---

## 发现 #1 评估

### 审查原文

> **[高] Partial failure diagnostics 不记录已成功写入路径，失败后无法满足 changed paths / completed steps 可诊断要求**
> - 来源：edge+auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

Story 4.4 AC7 明确要求 partial failure 输出 completed steps、failed step、pending steps、changed paths 和 manual action（`_bmad-output/implementation-artifacts/stories/4-4-project-operation-lock-and-safe-write.md:51-55`），并且 Story 技术说明要求 rename success 才能进入 `changedPaths`，partial failure 必须报告 completed mutations（`_bmad-output/implementation-artifacts/stories/4-4-project-operation-lock-and-safe-write.md:214-215`）。

当前 install apply 中，`runtime-structure.ts` 会先通过多次 `safeWriteFile` 写入 `_speclite/config.toml`、`_speclite/config.user.toml`、human-owned stub、IDE mirror 和 manifest/index（`src/installer/runtime-structure.ts:109-127`、`src/installer/runtime-structure.ts:129-175`、`src/installer/runtime-structure.ts:214-242`）。但失败路径只把 `issue`、`completedSteps`、`pendingSteps` 返回给上层（`src/installer/runtime-structure.ts:258-267`），`install.ts` 也只是把该 issue 和 step 列表投影到 failure result（`src/commands/install.ts:370-386`）。`safe-write.ts` 自身的失败 details 固定 `changedPaths: []`（`src/fs/safe-write.ts:84-99`），无法表达本命令此前已经成功 rename 的路径。

**严重性判断：合理**

原始严重性为高，评估为 P1 阻塞交付。该问题直接违反 AC7 和 Story 4.3/4.4 对 actual changed paths 的边界要求，不是体验优化。

**修复建议：可行**

Reviewer 建议在 apply orchestration 层维护 operation-local `changedPaths` 是可行方向，因为单个 `safeWriteFile` 只能知道当前写入结果，只有 orchestration 层知道此前成功的 mutation 序列。输出位置应遵守 Story 约束，优先使用稳定 `issues[].details` / `nextActions`，不要新增未契约化 data 字段。

**误报评估：非误报**

测试中只验证 safe write success 返回当前 path、failure details 为空 changed paths，没有覆盖“前一个写入成功、后一个写入失败时 diagnostics 包含前一个 changed path”的场景（`test/operation-lock-safe-write.test.ts:131-152`）。该 finding 与代码和测试缺口一致。

---

## 发现 #2 评估

### 审查原文

> **[中] Validate 只扫描 `_speclite` 顶层 stale temp，漏报 safe-write 在目标同目录产生的嵌套 `.speclite-tmp-*`**
> - 来源：edge+auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

safe write temp path 使用 `path.dirname(safety.absolutePath)`，即 target file 同目录（`src/fs/safe-write.ts:65-69`）。因此 `_speclite/_config/manifest.yaml` 的 temp 会出现在 `_speclite/_config/.speclite-tmp-*`，IDE mirror 的 temp 会出现在对应 mirror 目录。

但 validate 的 stale temp discovery 只读取 `projectRoot/_speclite` 顶层，并只返回 `_speclite/${entry.name}`（`src/validation/rules/file-integrity.ts:152-172`）。focused validate test 也只创建 `_speclite/.speclite-tmp-leftover` 顶层 temp（`test/validate-command.test.ts:85-115`），没有覆盖 `_speclite/_config/**`、IDE mirror 或其他 installer-owned target 目录下的 `.speclite-tmp-*`。

**严重性判断：合理**

原始严重性为中，评估为 P1 阻塞交付。该问题会让 Story 4.4 AC5 中“temporary file 不进入稳定输出、cleanup failure/stale temp 可诊断”的安全链条失效，并可能漏报阻断后续 safe mutation 的 stale temp。

**修复建议：可行**

Reviewer 建议按 installed files index、installer-owned roots 或受控目录集合递归发现 `.speclite-tmp-*` 是可行的。修复需要保持 project-relative POSIX path，并避免扫描无界用户目录。

**误报评估：非误报**

当前实现确实只扫 `_speclite` 顶层；与 safe-write 同目录 temp 策略存在明显覆盖不一致。

---

## 发现 #3 评估

### 审查原文

> **[中] Safe-write cleanup failure 不是 best-effort；清理失败会抛出 raw error 而不是稳定 issue**
> - 来源：blind+edge
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

Story 4.4 Task 4 要求 controlled success 或 controlled failure 后 best-effort 清理 temporary files，cleanup failure 留下 stale temp 时应由 validate 报 warning/error（`_bmad-output/implementation-artifacts/stories/4-4-project-operation-lock-and-safe-write.md:87-92`）。当前 `safeWriteFile` 在 temp-write 或 rename 异常后进入 catch，但直接 `await rm(tempPath, { force: true })`，没有为 cleanup 自身设置独立 `try/catch`（`src/fs/safe-write.ts:80-84`）。如果 `rm` 失败，函数会在返回稳定 `ValidationIssue` 前抛出 cleanup 的底层错误，绕过后续 `file-integrity.stale-temp-file` issue 构造（`src/fs/safe-write.ts:84-103`）。

**严重性判断：合理**

原始严重性为中，评估为 P1 阻塞交付。它直接破坏 controlled failure 和 stable diagnostics，不是只影响日志质量。

**修复建议：可行**

Reviewer 建议把 cleanup 放入独立 `try/catch` 并返回稳定 issue 是可行的。实现时需要区分原始 safe-write failure 和 cleanup failure，保留 manual action，并确保不泄露 absolute temp path、随机 nonce 或 raw stack。

**误报评估：非误报**

当前代码没有捕获 cleanup failure；测试也没有覆盖 cleanup failure 失败后仍稳定返回 issue 的场景。该 finding 成立。

---

## 发现 #4 评估

### 审查原文

> **[中] `safeWriteFile(...allowExisting=true)` 缺少 ownership/hash baseline preflight，未来 apply 可直接覆盖不安全目标**
> - 来源：auditor+edge
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

Story 4.4 AC6 要求规划或执行写入时阻断 unsafe overwrite 风险（`_bmad-output/implementation-artifacts/stories/4-4-project-operation-lock-and-safe-write.md:45-49`），Task 5 进一步明确 unsafe overwrite 包括 ownership unknown、human/workflow-owned、hash baseline 不匹配、file/directory type mismatch 和 stale temp blocker（`_bmad-output/implementation-artifacts/stories/4-4-project-operation-lock-and-safe-write.md:94-99`），技术说明也要求 block before write when target has unknown/protected ownership or baseline mismatch（`_bmad-output/implementation-artifacts/stories/4-4-project-operation-lock-and-safe-write.md:226-235`）。

当前 `safeWriteFile` API 只有 `allowExisting?: boolean`，没有 expected ownership、expected hash、baseline 或 files-index entry 参数（`src/fs/safe-write.ts:48-56`）。`validateProjectPath` 对现有目标只检查 directory/type 和 `allowExistingFile`：当目标是普通文件且 `allowExistingFile=true` 时不会阻断，后续会 rename 覆盖（`src/fs/safe-write.ts:159-184`）。规划阶段虽然在 `update-plan.ts` 有 ownership 和 hash drift conflict 判断（`src/update/update-plan.ts:360-407`），但 shared write primitive 本身无法在 apply 前重新验证 TOCTOU 后的目标状态。

**严重性判断：合理**

原始严重性为中，评估为 P1 阻塞交付。虽然当前生产调用面尚未大量使用 `allowExisting=true`，但 Story 4.4 的职责包括 write path apply 前再次阻断 unsafe overwrite；primitive 缺少该能力会让后续 update/repair apply 错误调用或 TOCTOU 漂移变成不安全覆盖。

**修复建议：可行**

Reviewer 建议增加 expected baseline 参数或专门 installer-owned mutation wrapper 是可行方向。更保守的实现可以让 `allowExisting=true` 只能通过带 files-index baseline 的 wrapper 使用，rename 前重新 lstat/read/hash/classify，并将 protected ownership、hash mismatch、type mismatch、symlink 和 stale temp blocker 映射为稳定 issue。

**误报评估：非误报**

测试只覆盖 `allowExisting=true` 时目标是目录会被阻断（`test/operation-lock-safe-write.test.ts:158-215`），没有覆盖 existing human/workflow-owned/unknown 或 installer-owned baseline drift 的 apply-preflight 负向场景。该 finding 成立。

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | Partial failure diagnostics 不记录已成功写入路径 | [高] | **P1** | 违反 AC7，失败输出无法说明此前已完成 rename 的 project-relative changed paths。 |
| 2 | Validate 只扫描 `_speclite` 顶层 stale temp | [中] | **P1** | 与 safe-write 同目录 temp 策略不一致，漏报嵌套/IDE mirror stale temp。 |
| 3 | Safe-write cleanup failure 不是 best-effort | [中] | **P1** | cleanup 失败会绕过稳定 issue 返回路径，破坏 controlled failure。 |
| 4 | `allowExisting=true` 缺少 ownership/hash baseline preflight | [中] | **P1** | apply 前无法证明现有目标仍为安全 installer-owned baseline，存在 unsafe overwrite 风险。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

无。

### 可忽略（误报）

无。

### 评估决定

- **发现 #1（Partial failure diagnostics 不记录已成功写入路径）**：确认有效，必须修复；建议在 apply orchestration 层维护 operation-local changed paths，并在失败 issue details/nextActions 中稳定投影。
- **发现 #2（Validate 只扫描 `_speclite` 顶层 stale temp）**：确认有效，必须修复；建议递归或按受控 installed roots 扫描 `.speclite-tmp-*`，覆盖 `_speclite/_config/**` 和 IDE mirror target 目录。
- **发现 #3（Safe-write cleanup failure 不是 best-effort）**：确认有效，必须修复；cleanup failure 不得抛 raw error，应返回稳定 `file-integrity.stale-temp-file` issue 和 manual action。
- **发现 #4（`allowExisting=true` 缺少 ownership/hash baseline preflight）**：确认有效，必须修复；需要 apply-time ownership/hash/type baseline preflight 或受控 wrapper，阻断 protected ownership、unknown ownership 和 baseline drift。

### 评估决定汇总

- 评估结论：不通过。
- 需修复：4。
- 可忽略：0。
- 待讨论：0。
- CR TODO：0。

---

## 修复执行记录

### 修复执行记录

- **Date**: 2026-06-01
- **Model Used**: GPT-5.5 (gpt-5.5)
- **Fix Items**: 4

#### Fix Item 1: Partial failure diagnostics changed paths

- 修复状态：完成。
- 修复摘要：在 install apply orchestration 层维护 operation-local `changedPaths`；`src/fs/copy-tree.ts` 与 `src/ide/target-writer.ts` 通过 callback 回传 IDE mirror 已成功写入路径；失败时 `src/installer/runtime-structure.ts` 将稳定 project-relative POSIX changed paths 投影到 `issue.details.changedPaths`，`src/commands/install.ts` 同步追加 `nextActions` 复核提示。
- 验证覆盖：`test/runtime-structure.test.ts` 增加 partial mirror failure changed paths / nextActions 断言。

#### Fix Item 2: Validate nested stale temp discovery

- 修复状态：完成。
- 修复摘要：`src/validation/rules/file-integrity.ts` 将 stale temp discovery 从 `_speclite` 顶层扫描改为受控 roots 递归扫描，固定覆盖 `_speclite`、`.claude/skills`、`.agents/skills`，并纳入 files-index installer-controlled parent dirs；输出仍为去重排序后的 project-relative POSIX path。
- 验证覆盖：`test/validate-command.test.ts` 增加 `_speclite/_config/.speclite-tmp-*` 与 IDE mirror directory-shaped temp 测试。

#### Fix Item 3: Safe-write cleanup failure best-effort

- 修复状态：完成。
- 修复摘要：`src/fs/safe-write.ts` 将 cleanup failure 捕获为稳定 `file-integrity.stale-temp-file` issue，`affectedPath` 使用 project-relative temp path，details 包含 `cleanup-failed`、manual action 和 pending cleanup steps，不再抛出 raw cleanup error。
- 验证覆盖：`test/operation-lock-safe-write.test.ts` 增加 directory-shaped temp blocker 触发 cleanup failure 的稳定 diagnostics 测试。

#### Fix Item 4: `allowExisting=true` ownership/hash baseline preflight

- 修复状态：完成。
- 修复摘要：`src/fs/safe-write.ts` 为 `allowExisting=true` 增加 `expectedExistingFile` baseline；rename 前重新验证 baseline ownership、path classification、stale temp blocker 和 current hash，阻断 protected ownership、unknown ownership、baseline drift、type mismatch、symlink 和 stale temp blocker。无 baseline 的 `allowExisting=true` 默认阻断，避免后续 apply 误用。
- 验证覆盖：`test/operation-lock-safe-write.test.ts` 增加 missing baseline、protected baseline ownership、human-owned path classification、unknown path classification、baseline drift、stale temp blocker 和 matching installer-owned baseline success 测试。

#### Verification（验证）

- `npm test -- --run test/operation-lock-safe-write.test.ts test/validate-command.test.ts test/runtime-structure.test.ts test/update-command.test.ts` -> passed，4 files / 36 tests passed。
- `npm run build` -> passed，ESM/DTS build success。
- `npm test` -> passed，29 files / 188 tests passed。
- `git diff --check` -> passed，无输出。

#### Scope Notes（范围说明）

- 未修改 Story 4.4 文件内容。
- 未修改 `sprint-status.yaml`。
- 未提交 git。
- 未启动 reviewer/evaluator。
