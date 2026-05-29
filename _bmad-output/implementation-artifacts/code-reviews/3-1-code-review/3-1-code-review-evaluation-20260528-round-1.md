---
Story: 3-1
Round: 1
Date: 2026-05-28
Model Used: GPT-5 Codex (gpt-5-codex)
Review Source: 3-1-code-review-summary-20260528-round-1.md
Review Model: GPT-5 Codex (gpt-5-codex)
Type: Code Review Evaluation
---

## 评估总结

对 Story 3-1 的第 1 轮 CR 代码审查结果（首轮）进行逐条评估。审查结果包含 2 条 `patch` 发现，分别涉及 public path projection 泄露未校验 manifest paths，以及损坏的 `skill-index.json` 被降级为 `partial`。经 Story 验收标准与当前源码交叉验证，两条发现均确认有效，均应作为阻塞交付的修复项处理。

---

## 发现 #1 评估

### 审查原文

> **[中] Status 会原样暴露 manifest 中未校验的 public paths**
> - 来源：blind+edge+auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

审查描述与当前源码一致。`src/status/installed-state.ts:81-99` 先用 `manifest.paths` 做 required path 检查，随后在 `StatusCommandData.paths` 中直接返回 `manifest.paths`。`src/manifest/manifest-schema.ts:101-108` 对 `paths.specliteRoot`、`paths.artifactRoot`、`paths.manifestPath` 只做 `z.string().min(1)`，没有复用同文件 `src/manifest/manifest-schema.ts:10-36` 的 project-relative POSIX path 校验。`src/diagnostics/command-result-schema.ts:33-40` 的 `CommandPathSummarySchema` 同样只校验非空字符串。

Story 3.1 明确要求 public path fields 使用 project-relative POSIX path（Story 行 76、105、161），且 JSON snapshot 不得包含 absolute local path、home directory 或 platform-specific separators（Story 行 123、215）。因此 malformed manifest path 会被 public JSON 透传这一点违反验收标准。

**严重性判断：合理**

原始严重性为 `[中]`，评估后按 P1 处理。原因是该问题直接违反 AC 2 / AC 6 的 public JSON path contract 和 fixture determinism contract，属于 Story 3.1 的交付门禁，不适合作为非阻塞 TODO。

**修复建议：可行**

建议在 manifest schema 或 status reader projection 边界校验 `specliteRoot`、`artifactRoot`、`manifestPath` 为 project-relative POSIX path，校验失败时不要返回原始 path。该方向与现有 `isProjectRelativePosixPath` helper 一致，修复面可控。

**误报评估：非误报**

当前 schema 与 projection 路径均缺少对应约束，且 Story 文档对 public path 明确提出禁止 absolute / home / platform-specific path 的要求，因此不是误报。

---

## 发现 #2 评估

### 审查原文

> **[中] 损坏的 skill-index 被归类为 partial，弱化了 corrupted installed-state 语义**
> - 来源：edge+auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

审查描述与当前源码一致。`src/status/installed-state.ts:153-160` 的 `readSkillIndex` 在 JSON parse、schema parse 或文件读取失败时统一返回 `undefined`，未区分 missing 与 invalid / corrupted。随后 `src/status/installed-state.ts:188-193` 只把 `input.skillIndex !== undefined` 作为 `hasSkillIndex`，并在 `src/status/installed-state.ts:218-223` 将缺少或不可读的 skill-index 统一映射为 target `partial`。`aggregateStatusHealth` 在 `src/status/installed-state.ts:109-123` 只有 manifest unreadable 或 target `failed` 才进入 failed，target `partial` 则导致整体 `partial`。

Story 3.1 的 health algorithm 明确要求 manifest/index/source descriptor shape 损坏或不可读，导致无法产生 stable installed summary 时进入 `failed`（Story 行 89、222）。因此 corrupted `skill-index.json` 被归类为 `partial` 与 Story 契约不一致。

**严重性判断：合理**

原始严重性为 `[中]`，评估后按 P1 处理。原因是该问题直接影响 `data.highLevelHealth` 的确定性语义，自动化消费者会无法区分安装不完整与 installed-state index 损坏，属于核心功能缺陷。

**修复建议：可行**

建议让 `readSkillIndex` 返回 discriminated result，例如 `missing` / `invalid` / `valid`，并将 invalid 或 unreadable index 映射为 target `failed` 或整体 `failed`；missing 是否保持 `partial` 可以按产品语义保守处理。该建议与当前聚合器的 first-match order 兼容。

**误报评估：非误报**

当前实现确实合并了 missing 与 corrupted index，且 Story 对 corrupted index 的 failed 语义有明确约束，因此不是误报。

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | Status 会原样暴露 manifest 中未校验的 public paths | [中] | **P1** | 直接违反 public path 必须为 project-relative POSIX 且不得泄露 absolute/local path 的 Story 契约。 |
| 2 | 损坏的 skill-index 被归类为 partial，弱化 corrupted installed-state 语义 | [中] | **P1** | 直接违反 corrupted manifest/index/source descriptor 应进入 failed health 的 Story 契约。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| - | 无 | - | - | 本轮两条发现均影响 Story 3.1 验收，不建议降级为 TODO。 |

### 可忽略（误报）

| # | 发现 | 原始严重性 | 忽略理由 |
|---|------|----------|---------|
| - | 无 | - | 未发现误报。 |

### 评估决定

- **发现 #1（Status 会原样暴露 manifest 中未校验的 public paths）**：确认有效，需进入 fixer 修复，并补充 absolute / `..` / backslash path 不得泄露的 focused tests。
- **发现 #2（损坏的 skill-index 被归类为 partial）**：确认有效，需进入 fixer 修复，并补充 invalid JSON 与 schema-invalid skill-index 的 focused tests。
- **整体决定**：本轮 CR 评估不通过；需修复项 2 个，CR TODO / 记录项 0 个，可进入 fixer。

## 修复执行记录

### 修复执行记录
- **Date**: 2026-05-28
- **Model Used**: GPT-5 Codex (gpt-5-codex)
- **Fix Items**: 2

#### 修复项 1：Status 不再暴露 manifest 中未校验的 public paths

- **修改文件**: `src/manifest/manifest-schema.ts`、`src/diagnostics/command-result-schema.ts`、`test/status-command.test.ts`
- **修复内容**: 对 `specliteRoot`、`artifactRoot`、`manifestPath` 复用 `isProjectRelativePosixPath` 校验；malformed manifest path 会让 manifest 被判定为 invalid，status 返回 failed health 与默认 safe paths，不投影原始 absolute / parent traversal / backslash path。
- **测试覆盖**: 新增 malformed path 用例，覆盖 absolute path、`..` parent traversal 和 backslash path，断言 public JSON 不包含原始不可信 path。
- **结果**: 已修复。

#### 修复项 2：Corrupted skill-index 进入 failed installed-state health

- **修改文件**: `src/status/installed-state.ts`、`test/status-command.test.ts`
- **修复内容**: `readSkillIndex` 改为返回 `valid` / `missing` / `invalid` discriminated result；missing 保持 partial，JSON parse 失败、schema parse 失败或非 missing 读取失败映射为 failed target，并通过现有 health 聚合进入 overall failed。
- **测试覆盖**: 新增 invalid JSON 与 schema-invalid `skill-index.json` 用例，断言 target status 与 `data.highLevelHealth` 均为 failed。
- **结果**: 已修复。

#### 验证结果

- `npx vitest run test/status-command.test.ts`: 通过，1 个测试文件、10 个测试通过。
- `npm run build`: 通过。
- `git diff --check`: 通过。

✅ CR 修复执行完成，修复记录已追加到评估文件。
