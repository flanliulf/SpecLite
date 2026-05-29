---
Story: 3-3
Round: 1
Date: 2026-05-28
Model Used: GPT-5 Codex (gpt-5-codex)
Review Source: 3-3-code-review-summary-20260528-round-1.md
Review Model: GPT-5 Codex (gpt-5-codex)
Type: Code Review Evaluation
---

## 评估总结

对 Story 3-3 的第 1 轮 CR 代码审查结果（首轮）进行逐条评估。本轮 reviewer 结论为不通过，提出 2 个 `patch` 桶发现，均指向 IDE mirror canonical package hash 与 files index symlink handling 的边界缺口。经独立代码验证，2 个发现均成立，均建议作为阻塞修复项进入 fixer；无误报，无可降级 CR TODO。

---

## 发现 #1 评估

### 审查原文

> **[中] 非 canonical adapter artifact symlink 会误触发 `ide-mirror.hash-mismatch`**
> - 来源：blind+edge+auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

Story 3.3 明确要求 target-specific wrapper、discovery metadata 或 adapter artifact 不得混入 canonical package hash，只能通过 files index 独立校验：`_bmad-output/implementation-artifacts/stories/3-3-ide-mirror-and-file-integrity-validation.md:27`、`:225`。同时，canonical candidate path 下出现 symlink 才应作为 canonical package shape mismatch：`_bmad-output/implementation-artifacts/stories/3-3-ide-mirror-and-file-integrity-validation.md:224`。

当前实现中，`validateIdeMirror()` 通过 `hashPackageDirectory(expectedRoot, { include: isCanonicalPackageHashFile })` 计算 mirror package hash：`src/validation/rules/ide-mirror.ts:65-68`。但 `hashPackageDirectory()` 先调用 `listFiles(packageRoot)`，随后才执行 `include` 过滤：`src/manifest/hash.ts:17-23`。`listFiles()` 在遍历 entry root 时遇到任意 symlink 都会直接 throw：`src/manifest/hash.ts:35-57`。因此，即使 symlink 位于非 canonical adapter artifact 路径，例如 `.claude/skills/<id>/adapter-link`，也会在 include 过滤前触发异常，并被 `validateIdeMirror()` catch 后报告为 `shape: "symlink-in-canonical-package"`：`src/validation/rules/ide-mirror.ts:82-93`。

现有测试只覆盖普通 adapter artifact 文件被排除：`test/validate-command.test.ts:483-502`，没有覆盖非 canonical adapter artifact 为 symlink 的情况。因此 reviewer 指出的误报路径成立。

**严重性判断：合理**

原始严重性为 `[中]`，评估后按 P1 处理。原因是该缺口会让合法 target-local adapter artifact 触发 `ide-mirror.hash-mismatch`，导致 `speclite validate` 非零退出并阻塞交付；同时诊断 details 会把非 canonical 路径误表达成 canonical package symlink shape，不符合 Story 3.3 的 adapter artifact exclusion contract。

**修复建议：可行**

建议方向可行：应让 canonical package walker 只遍历 canonical candidate paths，或在处理 symlink 前判断该 normalized relative path 是否属于 canonical candidate 范围；只有 canonical candidate path 下的 symlink 才报告 `ide-mirror.hash-mismatch` 和 `shape: "symlink-in-canonical-package"`。同时补充两类测试：非 canonical adapter artifact symlink 不影响 validate；canonical candidate path 下 symlink 仍产生 redaction-safe hash mismatch。

**误报评估：非误报**

该发现由 Story 契约、实现调用顺序和测试覆盖缺口共同支持，不是误报。

---

## 发现 #2 评估

### 审查原文

> **[低] dangling symlink 的 file-integrity 诊断被误报为 missing installer-owned file**
> - 来源：edge+auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

Story 3.3 要求 files index installer-owned entries 按 raw bytes 校验，缺失文件报告 `file-integrity.missing-installer-owned-file`，同时 symlink handling 必须作为独立 validation dimension，不得被 hash normalization 隐式吸收：`_bmad-output/implementation-artifacts/stories/3-3-ide-mirror-and-file-integrity-validation.md:29-35`、`:232-233`。

当前实现中，`validateFileIntegrity()` 对 installer-owned entry 先调用 `fileExists(absolutePath)`：`src/validation/rules/file-integrity.ts:36-48`。该 helper 使用 `access()`：`src/validation/rules/file-integrity.ts:103-110`。`access()` 会跟随 symlink，因此 dangling symlink 的 link 本身存在，但 target 不存在时会返回失败，代码随即报告 `file-integrity.missing-installer-owned-file`，不会进入后续 `lstat()` 的 symlink 分支：`src/validation/rules/file-integrity.ts:50-63`。

现有测试实际创建 dangling symlink `../outside.md`：`test/validate-command.test.ts:513-515`，但期望 `.agents/skills/speclite-help/SKILL.md` 被报告为 `file-integrity.missing-installer-owned-file`：`test/validate-command.test.ts:556-590`。这说明测试基线固化了误分类，而不是证明行为符合契约。

**严重性判断：偏低**

原始严重性为 `[低]`，但评估后按 P1 处理。虽然触发条件是边界情况，但它直接违反 Story 3.3 对 symlink handling 独立维度的要求，并会把“路径实体存在但 shape unsafe”的问题误导为“installer-owned 文件缺失”。这会影响用户 repair 判断和后续 fixer 验证，因此不建议降级为 TODO。

**修复建议：可行**

建议方向可行：对 files-index entry 应先用 `lstat()` 判断路径实体是否存在；只有 `lstat()` 返回 `ENOENT` 时才报告 `file-integrity.missing-installer-owned-file`。若实体是 symlink，无论 symlink target 是否存在，都应避免 follow target，并用现有保留 taxonomy 中的安全诊断表达，例如 `file-integrity.hash-mismatch` 搭配 `details.shape: "symlink"`。同时更新测试覆盖 dangling symlink 与 symlink-to-existing-file 两种情况，并继续断言不泄露 readlink 结果、绝对路径或 hash 值。

**误报评估：非误报**

该发现由实现调用顺序和现有测试中的 dangling symlink fixture 直接支持，不是误报。

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | 非 canonical adapter artifact symlink 会误触发 `ide-mirror.hash-mismatch` | [中] | **P1** | 合法 adapter artifact symlink 会在 include 过滤前被当成 canonical package shape mismatch，违反 adapter artifact exclusion contract。 |
| 2 | dangling symlink 的 file-integrity 诊断被误报为 missing installer-owned file | [低] | **P1** | dangling symlink link 本身存在但被 `access()` 跟随后误报 missing，违反 symlink handling 独立维度要求。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| - | 无 | - | - | 本轮 2 个发现均与 Story 3.3 AC/contract 直接相关，不建议降级为 TODO。 |

### 可忽略（误报）

| # | 发现 | 原始严重性 | 忽略理由 |
|---|------|----------|---------|
| - | 无 | - | 本轮未发现误报。 |

### 评估决定

- **发现 #1（非 canonical adapter artifact symlink 会误触发 `ide-mirror.hash-mismatch`）**：确认有效，作为 P1 阻塞修复项进入 fixer。
- **发现 #2（dangling symlink 的 file-integrity 诊断被误报为 missing installer-owned file）**：确认有效，作为 P1 阻塞修复项进入 fixer。
- **整体决定**：本轮 CR 评估不通过；需修复项 2 个，CR TODO/记录项 0 个，误报 0 个。可进入 `bmenhance-cr-03-fixer` 执行定向修复。

## 修复执行记录

### 修复执行记录
- **Date**: 2026-05-28
- **Model Used**: GPT-5 Codex (gpt-5-codex)
- **Fix Items**: 2

#### 修复项 #1：非 canonical adapter artifact symlink 误触发 `ide-mirror.hash-mismatch`

- **修改文件**: `src/manifest/hash.ts`, `src/validation/rules/ide-mirror.ts`, `test/validate-command.test.ts`
- **执行结果**: 已修复。
- **关键差异**: `hashPackageDirectory()` 现在把 include 过滤传入 `listFiles()`，遍历阶段即跳过非 canonical path；`isCanonicalPackageHashFile()` 同时识别 canonical directory root，确保 `references` / `assets` / `scripts` 自身为 symlink 时仍被视为 canonical shape mismatch。
- **测试覆盖**: adapter artifact 普通文件和 adapter artifact symlink 均不再影响 canonical package hash；canonical candidate symlink 仍通过既有测试报告 `shape: "symlink-in-canonical-package"`。

#### 修复项 #2：dangling symlink 被误报为 missing installer-owned file

- **修改文件**: `src/validation/rules/file-integrity.ts`, `test/validate-command.test.ts`
- **执行结果**: 已修复。
- **关键差异**: files-index integrity 先使用 `lstat()` 判断路径实体；仅 `ENOENT` 报告 `file-integrity.missing-installer-owned-file`，symlink 不 follow target，统一报告 `file-integrity.hash-mismatch` 并带 `details.shape: "symlink"`。
- **测试覆盖**: 已覆盖 dangling symlink 与 symlink-to-existing-file，并继续断言输出不泄露 readlink target、临时绝对路径或 hash 值。

#### 验证记录

- `npm test -- test/validate-command.test.ts`: 通过，10 个 tests 全部通过。
- `npm run build`: 通过，ESM 与 DTS build 成功。
- `git diff --check`: 通过，无 whitespace error。
