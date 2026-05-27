---
Story: 2-5
Round: 1
Date: 2026-05-27
Model Used: GPT-5 Codex (gpt-5-codex)
Type: Code Review Summary
---

## 审查结论

首轮审查。`npm run build`、focused Vitest、全量 `npm test` 与 `git diff --check` 均通过。由于当前执行环境没有可调用的 Agent 工具，已按 skill 降级规则串行完成 Blind Hunter、Edge Case Hunter、Acceptance Auditor 三层审查；三层均完成，无失败层。

结论：不通过。当前实现存在 artifact-path structural validation 缺口：实际产物路径只验证了 project boundary，没有验证必须落在 configured/default artifact output root 下；并且 validator 会把反斜杠路径规范化后放行，未按 POSIX-style contract 报告问题。这两项会让不符合 AC1 / AC7 的 artifact path 进入通过态。

## 新发现

### 1. [中] `actualArtifactPath` 未校验位于 configured/default output root 下

- **来源**：edge+auditor
- **分类**：patch

- **证据**
  - `src/validation/rules/artifact-path.ts:49-57` 对 `actualArtifactPath` 仅调用 `validateProjectPathRole`，该 helper 只验证 project boundary、symlink 和目录可写性，没有和 `configuredRoot` 或 `defaultOutputPath` 做 containment 校验。
  - 定向复现：当 `configuredRoot` 与 `defaultOutputPath` 均为 `_speclite-output/planning-artifacts`，但 `actualArtifactPath` 为 `_speclite-output/other/report.md` 时，`validateArtifactPathContract(...)` 返回 `[]`。

- **影响**
  - AC1 要求 workflow artifact 写入 `_speclite-output` 或配置约定的 workflow artifact root，并记录 configured/default/actual project-relative path；AC7 要求 artifact path structural validation 捕获缺失、越界和不合法路径。当前代码会接受项目内但不属于该 workflow configured/default output path 的 artifact，导致 artifact contract 被绕过。

- **建议**
  - 在 `validateArtifactPathContract` 中将 `configuredRoot`、`defaultOutputPath`、`actualArtifactPath` 统一规范化为 project-relative POSIX path 后，显式校验 `defaultOutputPath` 在 `configuredRoot` 下，且 `actualArtifactPath` 在 `defaultOutputPath` 或 configured artifact root 下。
  - 增加 regression test：`actualArtifactPath="_speclite-output/other/report.md"` 必须返回 reserved `artifact-path.*` diagnostic，而不是 `[]`。

### 2. [中] Artifact path validator 会放行反斜杠路径，未强制 POSIX-style public path contract

- **来源**：edge+auditor
- **分类**：patch

- **证据**
  - `src/validation/rules/artifact-path.ts:70-75` 调用 `resolveProjectRelativePath` 解析所有 artifact path role。
  - `src/fs/path-normalizer.ts:63-78` 的 `normalizeProjectRelativePosixPath` 会先 `replaceAll("\\", "/")`，因此 `_speclite-output\\planning-artifacts\\report.md` 被转换为 POSIX path 后继续通过。
  - 定向复现：`actualArtifactPath="_speclite-output\\planning-artifacts\\report.md"` 时，`validateArtifactPathContract(...)` 返回 `[]`。

- **影响**
  - AC1 要求 artifact root、default output path 和 actual artifact path 必须以 project-relative POSIX-style path 记录。当前 validator 对非 POSIX 输入过于宽松，可能让 Windows-style 或 mixed-separator public artifact paths 进入 manifest/evidence/fixture 通过态。

- **建议**
  - 在 artifact contract validator 入口先使用严格 POSIX-style predicate，例如 `isProjectRelativePosixPath`，拒绝包含 `\`、absolute path、drive letter、`..`、重复 separator 等输入；解析到绝对路径只作为后续 filesystem safety check。
  - 增加 regression test 覆盖 configured/default/actual 三个 role 的反斜杠路径。

### 3. [低] `generatedAt` 值域校验比 Story contract 更窄

- **来源**：auditor
- **分类**：patch

- **证据**
  - `src/manifest/manifest-schema.ts:69-75` 要求 `Date.parse(value)` 后再 `new Date(parsed).toISOString() === value`，这只接受 canonical UTC millisecond form。
  - Story AC2 / AC5 要求 `generatedAt` 是 ISO 8601 string 且可 parse；Story Dev Notes 建议 runtime 使用 `Date.toISOString()`，但没有要求 validator 拒绝其它合法 ISO 8601 表达，例如带 timezone offset 的 timestamp。

- **影响**
  - 如果后续 workflow 或导入 artifact 产生合法 ISO 8601 offset 形式，validator 会报告 `artifact-path.invalid-required-metadata`。这属于兼容性偏窄，不会影响当前 helper 生成的 `Date.toISOString()` 值，但与“parseable ISO 8601 string”的 contract 表述不完全一致。

- **建议**
  - 若 contract 期望 canonical UTC form，应先同步 owning SPEC / Story contract 文案；若维持当前 Story 表述，则放宽 parser 到“可解析的 ISO 8601 timestamp”，同时保留 snapshot normalization 对 concrete value 的排除。

## 验证摘要

- ✅ `npm run build` 通过。
- ✅ `npm test -- --run test/artifact-metadata.test.ts test/artifact-path-validation.test.ts test/skill-artifact-loop.test.ts test/manifest-discovery.test.ts test/runtime-structure.test.ts` 通过，5 files / 26 tests。
- ✅ `npm test` 通过，19 files / 109 tests。
- ✅ `git diff --check` 通过。
- ❌ 定向复现 1：`actualArtifactPath` 位于 configured/default output root 之外但仍返回 `[]`。
- ❌ 定向复现 2：反斜杠 `actualArtifactPath` 被规范化后放行，未报告 POSIX-style violation。

## 通过项

- Markdown leading YAML frontmatter 写入和已有 frontmatter merge 路径有 focused tests 覆盖，未发现第二个 frontmatter block 问题。
- 非 Markdown file 与 directory sidecar metadata path 规则有 focused tests 覆盖，sidecar serialization 为 deterministic JSON。
- `generatedAt` snapshot normalization 已排除 concrete timestamp，同时仍校验字段存在和值域。
- `artifact-path.*` reserved issue id 已用于 missing required directory、symlink escape、missing/invalid metadata 等结构性诊断，details 未泄露 raw absolute path、timestamp、parser message 或 artifact content excerpt。
- `skill-artifact-loop` fixture 覆盖 installed entry discovery、activation protocol、resolver access、artifact write、metadata parse 与 generatedAt normalization；未扩展到 Post-MVP dashboard 或 full Epic 6 release matrix。
