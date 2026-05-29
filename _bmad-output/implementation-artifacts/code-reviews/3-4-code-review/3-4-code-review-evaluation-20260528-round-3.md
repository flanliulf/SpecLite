---
Story: 3-4
Round: 3
Date: 2026-05-28
Model Used: GPT-5 Codex (gpt-5-codex)
Review Source: 3-4-code-review-summary-20260528-round-3.md
Review Model: GPT-5 Codex (gpt-5-codex)
Type: Code Review Evaluation
---

## 评估总结

对 Story 3-4 的第 3 轮 CR 代码审查结果（复审）进行逐条评估。审查结果包含 1 个 patch finding：`artifact-path` symlink validation 会把项目内 symlink 误报为 `artifact-path.symlink-escape`。经独立代码验证，该发现成立，应进入 fixer；不建议降级为 CR TODO，也未发现误报。

---

## 上轮问题回顾确认

### Round 2 Finding #1：已闭环

Round 2 的 directory artifact metadata production validation 已闭环。`validateProject` 现在会通过 `discoverArtifacts()` 将含 `metadata.json` 的目录作为 directory artifact entity 传入 artifact path validation（`src/validation/validate-project.ts:157-187`），`listArtifactEntities()` 在目录内发现 `metadata.json` 时返回该目录自身（`src/validation/validate-project.ts:232-249`），`readWorkflowArtifactMetadata()` 会读取 `<directory>/metadata.json` 并标记 `metadataLocation: "directory"`（`src/validation/validate-project.ts:252-276`）。对应 command-level regression 已覆盖 `missing-directory/metadata.json` 与 `invalid-directory/metadata.json`，分别断言 `artifact-path.missing-required-metadata` 和 `artifact-path.invalid-required-metadata`（`test/validate-command.test.ts:103-174`）。

### Round 1 Finding #2：已闭环

Round 3 review 已确认 installed canonical `SKILL.md` legacy config reference 检查仍闭环；本次评估未发现与该项相冲突的新证据。

### Round 1 Finding #3：已闭环

Round 3 review 已确认 runtime symlink realpath boundary 分类仍闭环。`runtime-path` 当前会对 symlink target 执行 `realpath()`，只有解析后不在 project realpath 下才报告 `runtime-path.symlink-escape`（`src/validation/rules/runtime-path.ts:152-190`）。`test/runtime-path-validation.test.ts:100-128` 已覆盖 project-internal runtime symlink 不应被分类为 escape。

### 历史 CR TODO（非阻塞）

| # | 发现 | 状态 | 评估意见 |
|---|------|------|---------|
| - | 无 | - | 本 Story 3.4 CR 链路暂无非阻塞 TODO。 |

---

## 发现 #1 评估

### 审查原文

> **[中][新] Artifact path symlink validation reports internal project symlinks as symlink escape**
> - 来源：blind+edge+auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

Story 3.4 的 Validation Issue Mapping 将 `artifact-path.symlink-escape` 定义为 artifact path 通过 symlink 逃出 project boundary（`_bmad-output/implementation-artifacts/stories/3-4-runtime-path-menu-target-legacy-entry-and-artifact-path-validation.md:267-268`）。这意味着 issue 的关键条件不是“路径中存在 symlink”，而是“symlink 解析后逃出项目边界”。

当前 `validateArtifactPathContract()` 会对 `configuredRoot`、`defaultOutputPath` 和 `actualArtifactPath` 调用 `validateProjectPathRole()`（`src/validation/rules/artifact-path.ts:34-79`）。`validateProjectPathRole()` 在 project-relative path 解析后调用 `findSymlinkSegment()`，如果返回 symlink issue 就直接返回该 issue（`src/validation/rules/artifact-path.ts:134-140`）。而 `findSymlinkSegment()` 只要 `lstat()` 发现任一路径 segment 是 symbolic link，就立即返回 `artifact-path.symlink-escape`，details.reason 为 `existing-path-segment-is-symlink`，没有读取 symlink target，也没有将 realpath 与 project boundary 比较（`src/validation/rules/artifact-path.ts:278-309`）。

我用临时目录做了独立复现：创建 `_speclite-output/link -> _speclite-output/real` 的项目内 symlink，并以 `actualArtifactPath: "_speclite-output/link/report.md"` 调用 `validateArtifactPathContract()`。返回结果包含 `artifact-path.symlink-escape`，`affectedPath` 为 `artifact:actualArtifactPath`，`details.reason` 为 `existing-path-segment-is-symlink`。该 symlink target 仍在项目内，因此符合 reviewer 描述的误报行为。

现有 artifact path regression 只覆盖 symlink 指向项目外时应报告 `artifact-path.symlink-escape`（`test/artifact-path-validation.test.ts:35-81`），没有覆盖 project-internal symlink 不应误报。对比 runtime path 已有 project-internal symlink regression（`test/runtime-path-validation.test.ts:100-128`），artifact path 的分类语义确实落后于 Story issue mapping。

**严重性判断：合理**

审查原文标为 [中] 合理；评估后作为 P1 阻塞修复项处理。理由是该问题直接影响 Story 3.4 的 reserved issue mapping 准确性，会让合法的项目内 workflow artifact path 被报告为 escape，从而可能阻塞 production validation 或合法 output layout。它不是单纯测试增强，也不是可延后清理项。

**修复建议：可行**

审查建议可行：复用 `runtime-path` 的 realpath boundary 分类思路。`artifact-path` 在遇到 symlink segment 时应解析 symlink target，并与 target project realpath 比较；只有 target 不在 project boundary 内时才报告 `artifact-path.symlink-escape`。同时补充 artifact path project-internal symlink regression，并保留现有 outside symlink escape regression。

**误报评估：非误报**

该 finding 不是误报。代码证据和临时目录复现均显示，当前 artifact path validation 把“存在 symlink”直接等同于“symlink escape”，与 Story 3.4 对 `artifact-path.symlink-escape` 的定义不一致。

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | Artifact path symlink validation 会把项目内 symlink 误报为 escape | [中] | **P1** | Story issue mapping 要求 symlink 逃出 project boundary 才报告 escape，当前实现只要存在 symlink segment 就报错，需进入 fixer。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| - | 无 | - | - | 本轮 finding 属于 Story 3.4 验收相关 patch，不建议降级为 TODO。 |

### 可忽略（误报）

| # | 发现 | 原始严重性 | 忽略理由 |
|---|------|----------|---------|
| - | 无 | - | 未发现误报。 |

### 评估决定

- **发现 #1（Artifact path symlink validation 会把项目内 symlink 误报为 escape）**：确认有效，需进入 fixer，优先级 P1。
- **整体决定**：本轮 CR 评估不通过；需修复项 1 个，CR TODO/记录项 0 个，误报 0 个。可以进入 `bmenhance-cr-03-fixer`。

## 修复执行记录

### 修复执行记录
- **Date**: 2026-05-28
- **Model Used**: GPT-5 Codex (gpt-5-codex)
- **Fix Items**: 1

#### 修复项 #1：Artifact path symlink validation 会把项目内 symlink 误报为 escape

- **状态**: 已修复。
- **修改文件**:
  - `src/validation/rules/artifact-path.ts`
  - `test/artifact-path-validation.test.ts`
- **关键修改**:
  - `artifact-path` 的 `findSymlinkSegment()` 在发现 symlink segment 后改为调用 `realpath()`，并与 project root 的 realpath 做 native path boundary 比较。
  - symlink target 仍位于 project boundary 内时继续校验后续 segment，不再报告 `artifact-path.symlink-escape`。
  - 只有 symlink target 逃出 project boundary 时才报告 `artifact-path.symlink-escape`，并将 details.reason 调整为 `symlink-escape`。
  - 新增 project-internal artifact symlink regression，覆盖 `_speclite-output/link -> _speclite-output/real` 且 `actualArtifactPath` 为 `_speclite-output/link/report.md` 时不产生 issue；保留 outside symlink escape regression。
- **验证结果**:
  - `npm test -- --run test/artifact-path-validation.test.ts` 通过，1/1 文件、8/8 测试。
  - `npm test -- --run test/runtime-path-validation.test.ts test/artifact-path-validation.test.ts test/validate-command.test.ts` 通过，3/3 文件、22/22 测试。
  - `npm run build` 通过。
  - `npm test` 通过，24/24 文件、145/145 测试。
  - `git diff --check` 通过。
