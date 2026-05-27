---
Story: 2-5
Round: 1
Date: 2026-05-27
Model Used: GPT-5 Codex (gpt-5-codex)
Review Source: 2-5-code-review-summary-20260527-round-1.md
Review Model: GPT-5 Codex (gpt-5-codex)
Type: Code Review Evaluation
---

## 评估总结

对 Story 2-5 的第 1 轮 CR 代码审查结果（首轮）进行逐条评估。Reviewer 提出 3 个发现：2 个 artifact path structural validation 缺口、1 个 `generatedAt` ISO 8601 值域偏窄问题。经源码、Story contract、owning SPEC 与定向复现核实，前两项确认有效且阻塞交付；第三项确认有效但不影响当前 helper 生成路径，建议纳入 CR TODO 非阻塞跟踪。评估结论如下。

---

## 发现 #1 评估

### 审查原文

> **[中] `actualArtifactPath` 未校验位于 configured/default output root 下**
> - 来源：edge+auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

`src/validation/rules/artifact-path.ts:33-57` 分别对 `configuredRoot`、`defaultOutputPath` 和 `actualArtifactPath` 调用 `validateProjectPathRole`，但没有在三者之间做 containment / contract relationship 校验。`validateProjectPathRole` 在 `src/validation/rules/artifact-path.ts:64-100` 只解析 project-relative path、检查 project boundary 与 symlink segment；`requireDirectory=false` 时直接返回 `[]`，因此不会确认实际产物路径是否位于 configured workflow artifact root 或 default output path / configured allowed path 下。

Story AC1 要求 artifact 写入 `_speclite-output` 或配置约定的 workflow artifact root，并且 actual artifact path 以 project-relative POSIX-style path 记录；AC7 要求 artifact path 缺失、越界、symlink/path escape 等结构问题使用 `artifact-path.*` reserved issue id 报告（`_bmad-output/implementation-artifacts/stories/2-5-workflow-artifact-output-and-metadata-validation.md:15-21`、`58-63`）。Owning SPEC 进一步要求 `defaultOutputPath` 必须落在 `_speclite-output/` 或 configured workflow artifact root 下，MVP validation 检查 output path 符合 `defaultOutputPath` 或配置允许的 project-relative path（`_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md:125-127`、`140-147`）。

定向复现确认：当 `configuredRoot="_speclite-output/planning-artifacts"`、`defaultOutputPath="_speclite-output/planning-artifacts"`、`actualArtifactPath="_speclite-output/other/report.md"` 时，`validateArtifactPathContract(...)` 当前返回 `[]`。

**严重性判断：合理**

该问题直接违反 Story AC1 / AC7 和 owning SPEC 的 artifact output path contract，且会让项目内但错误 artifact root 的路径进入通过态。Reviewer 标注为 [中] 合理；按评估模板优先级映射为 P1，阻塞 Story 2.5 交付。

**修复建议：可行**

建议在 `validateArtifactPathContract` 中先保留现有 project boundary / symlink safety check，再对规范化后的 path role 做关系校验：`defaultOutputPath` 必须位于 configured workflow artifact root 或 `_speclite-output/` 允许边界内；`actualArtifactPath` 必须符合 `defaultOutputPath` 或配置允许的 artifact root。修复时需避免把“只能位于 defaultOutputPath”误写成过窄规则，因为 SPEC 允许 configured project-relative path。

**误报评估：非误报**

源码路径与定向复现均支持 reviewer 结论，非误报。

---

## 发现 #2 评估

### 审查原文

> **[中] Artifact path validator 会放行反斜杠路径，未强制 POSIX-style public path contract**
> - 来源：edge+auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

`src/validation/rules/artifact-path.ts:70-75` 对所有 artifact path role 调用 `resolveProjectRelativePath`。该 helper 进入 `src/fs/path-normalizer.ts:63-78` 的 `normalizeProjectRelativePosixPath`，会先执行 `value.trim().replaceAll("\\", "/")`，再用 `path.posix.normalize` 规范化。因此传入 `_speclite-output\\planning-artifacts\\report.md` 会被转换为 `_speclite-output/planning-artifacts/report.md` 后继续验证，而不是作为 public contract violation 报告。

项目已存在严格 POSIX-style predicate：`src/manifest/manifest-schema.ts:10-36` 的 `isProjectRelativePosixPath` 明确拒绝包含 `\`、`//`、absolute path、drive letter、`..` 等输入。Story AC1 要求 artifact root、default output path 和 actual artifact path 必须以 project-relative POSIX-style path 记录（`_bmad-output/implementation-artifacts/stories/2-5-workflow-artifact-output-and-metadata-validation.md:18-21`）；Story 架构要求也要求 public paths 使用 project-relative POSIX-style paths（同文件 `166-173`）。Owning SPEC 同样声明 path fields 必须是 project-relative POSIX paths（`_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md:111`）。

定向复现确认：当 `actualArtifactPath="_speclite-output\\planning-artifacts\\report.md"` 时，`validateArtifactPathContract(...)` 当前返回 `[]`。

**严重性判断：合理**

该问题会让 Windows-style 或 mixed-separator public artifact paths 进入 manifest/evidence/fixture 通过态，直接违反 Story AC1 的 public path contract。Reviewer 标注为 [中] 合理；按评估模板优先级映射为 P1，阻塞 Story 2.5 交付。

**修复建议：可行**

建议在 artifact validator 入口对 `configuredRoot`、`defaultOutputPath`、`actualArtifactPath` 先执行严格 project-relative POSIX-style predicate，拒绝包含反斜杠、drive letter、absolute path、`..`、重复 separator 等输入；再进入现有 `resolveProjectRelativePath` 执行 filesystem safety check。这样可以保持 public contract 严格，同时保留后续 project boundary / symlink escape 保护。

**误报评估：非误报**

源码中的反斜杠替换行为与定向复现一致，非误报。

---

## 发现 #3 评估

### 审查原文

> **[低] `generatedAt` 值域校验比 Story contract 更窄**
> - 来源：auditor
> - 分类：patch

### 评估结论：⚠️ 有效但降级 — 建议纳入 CR TODO 跟踪（P2 优先级）

### 评估分析

**问题描述准确性：准确**

`src/manifest/manifest-schema.ts:69-75` 对 `generatedAt` 执行 `Date.parse(value)` 后，再要求 `new Date(parsed).toISOString() === value`。这实际只接受 canonical UTC millisecond form，例如 `2026-05-27T06:00:00.000Z`。Story AC5 只要求 `generatedAt` 必须存在且可 parse 为 ISO 8601 string（`_bmad-output/implementation-artifacts/stories/2-5-workflow-artifact-output-and-metadata-validation.md:44-49`），Dev Notes 建议使用 `Date.toISOString()`，但没有把 validator contract 收窄为 canonical UTC millisecond only（同文件 `187-191`）。Owning SPEC 也写明 `generatedAt` 存在且可 parse 为 ISO 8601 string（`_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md:119`、`147`）。

定向复现确认：`WorkflowArtifactMetadataSchema.safeParse({ generatedAt: "2026-05-27T14:00:00+08:00", ... })` 当前失败，并报告 `generatedAt must be a parseable ISO 8601 string`。

**严重性判断：合理**

Reviewer 标注为 [低] 合理。当前 `createWorkflowArtifactMetadata` 默认使用 `Date.toISOString()`，已有 tests 也使用 canonical UTC millisecond form（`test/artifact-metadata.test.ts:15-19`、`78-93`；`test/artifact-path-validation.test.ts:15-29`、`92-123`），因此现有 workflow helper 不受影响。问题主要是 validator contract 比 Story / SPEC 表述更窄，属于兼容性与契约一致性风险。

**修复建议：可行但非必要**

有两条可行路线：若产品 contract 想要 canonical UTC millisecond form，应先更新 Story / owning SPEC 文案；若维持 parseable ISO 8601 contract，则放宽 schema 到可解析 ISO 8601 timestamp，同时保留 locale-specific / human-readable date 的拒绝。由于这不是当前交付阻塞点，建议先纳入 CR TODO 跟踪；若 fixer 在修复 P1 项时顺手处理，也应确保测试明确区分 ISO 8601 offset 与 locale-specific string。

**误报评估：非误报**

源码和复现均证明 validator 当前更窄，非误报；但影响面低于前两项。

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | `actualArtifactPath` 未校验位于 configured/default output root 下 | [中] | **P1** | 违反 AC1 / AC7 和 owning SPEC 的 artifact output path contract，会放行错误 artifact root。 |
| 2 | Artifact path validator 会放行反斜杠路径 | [中] | **P1** | 违反 project-relative POSIX-style public path contract，会放行 Windows-style public artifact paths。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 3 | `generatedAt` 值域校验比 Story contract 更窄 | [低] | **P2** | 当前 helper 使用 `Date.toISOString()` 不受影响，但 validator 与 Story / SPEC 的 parseable ISO 8601 contract 不完全一致。 |

### 可忽略（误报）

无。

### 评估决定

- **发现 #1（`actualArtifactPath` 未校验位于 configured/default output root 下）**：确认有效，需要 fixer 修复，并补 regression test 覆盖项目内但错误 artifact root 的路径。
- **发现 #2（Artifact path validator 会放行反斜杠路径）**：确认有效，需要 fixer 修复，并补 regression test 覆盖 `configuredRoot`、`defaultOutputPath`、`actualArtifactPath` 的反斜杠输入。
- **发现 #3（`generatedAt` 值域校验比 Story contract 更窄）**：确认有效但非阻塞，建议纳入 CR TODO；若后续 fixer 选择同步修复，必须同时保持 locale-specific / human-readable date 仍被拒绝。

评估结论：不通过。Story 2.5 需要进入 fixer 处理 P1 阻塞项；本 evaluator 未执行任何修复。

## 修复执行记录

### 修复执行记录
- **Date**: 2026-05-27
- **Model Used**: GPT-5 Codex (gpt-5-codex)
- **Fix Items**: 2

### 修复范围

- 修复发现 #1：`actualArtifactPath` 不再只做 project boundary/symlink safety check；现会校验 `defaultOutputPath` 位于 `configuredRoot` 下，且 `actualArtifactPath` 位于 `defaultOutputPath` 下，项目内但错误 artifact root 的路径会返回 `artifact-path.escapes-project`。
- 修复发现 #2：`configuredRoot`、`defaultOutputPath`、`actualArtifactPath` 在进入 `resolveProjectRelativePath` normalization 前先执行严格 `isProjectRelativePosixPath` 校验；包含反斜杠的 public artifact path 会返回 `artifact-path.escapes-project`，不再被 normalize 后放行。
- 未处理发现 #3：`generatedAt` validator 保持现状，该项已降级为 P2 CR TODO。

### 修改文件

- `src/validation/rules/artifact-path.ts`
- `test/artifact-path-validation.test.ts`
- `_bmad-output/implementation-artifacts/code-reviews/2-5-code-review/EXPERIMENTS.md`
- `_bmad-output/implementation-artifacts/code-reviews/2-5-code-review/EXPERIMENT_NOTES.md`
- `_bmad-output/implementation-artifacts/code-reviews/2-5-code-review/2-5-code-review-evaluation-20260527-round-1.md`

### 验证结果

- `npm test -- --run test/artifact-path-validation.test.ts`：通过，1 file / 6 tests。
- `npm run build`：通过。
- `npm test -- --run test/artifact-metadata.test.ts test/artifact-path-validation.test.ts test/skill-artifact-loop.test.ts test/manifest-discovery.test.ts test/runtime-structure.test.ts`：通过，5 files / 28 tests。
- `npm test`：通过，19 files / 111 tests。
- `git diff --check`：通过。

结论：两个 P1 阻塞项已完成修复并通过验证；本 fixer 未执行 reviewer、evaluator 或 finalizer。
