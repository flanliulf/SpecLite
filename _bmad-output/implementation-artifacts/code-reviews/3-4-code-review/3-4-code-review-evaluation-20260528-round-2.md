---
Story: 3-4
Round: 2
Date: 2026-05-28
Model Used: GPT-5 Codex (gpt-5-codex)
Review Source: 3-4-code-review-summary-20260528-round-2.md
Review Model: GPT-5 Codex (gpt-5-codex)
Type: Code Review Evaluation
---

## 评估总结

对 Story 3-4 的第 2 轮 CR 代码审查结果（复审）进行逐条评估。审查结果包含 1 个 patch finding：Round 1 artifact metadata 修复已覆盖 Markdown frontmatter 与 file sidecar JSON，但 production validation 仍未覆盖 directory artifact 内的 `metadata.json`。经独立代码验证，该发现成立，应进入 fixer；不建议降级为 CR TODO，也未发现误报。

---

## 上轮问题回顾确认

### Round 1 Finding #1：部分闭环，仍需补修 directory artifact metadata

Round 1 的 artifact metadata production validation 修复已经让 `validateProject` 在发现 artifact files 后传入 `actualArtifactPath`、`metadata` 和 `metadataLocation`（`src/validation/validate-project.ts:157-187`），并新增 command-level regression 覆盖 Markdown frontmatter missing/invalid metadata（`test/validate-command.test.ts:83-158`）。但当前 discovery 对 directory default output path 只通过 `listArtifactFiles()` 递归收集普通 files（`src/validation/validate-project.ts:211-226`），且 `listArtifactFiles()` 显式排除 `metadata.json` 和 `*.metadata.json`（`src/validation/validate-project.ts:232-245`）。因此当 directory artifact 以目录本身为 artifact entity、metadata 位于目录内 `metadata.json` 时，production path 不会读取该 metadata，也不会把 directory artifact 传入 `validateArtifactPathContract()`。

### Round 1 Finding #2：已闭环

Round 2 review 已确认 installed canonical `SKILL.md` legacy config reference 检查已接入 production validation；本次评估未发现与该项相冲突的新证据。

### Round 1 Finding #3：已闭环

Round 2 review 已确认 runtime symlink escape 已按 realpath boundary 分类；本次评估未发现与该项相冲突的新证据。

### 历史 CR TODO（非阻塞）

| # | 发现 | 状态 | 评估意见 |
|---|------|------|---------|
| - | 无 | - | 本 Story 3.4 CR 链路暂无非阻塞 TODO。 |

---

## 发现 #1 评估

### 审查原文

> **[中] Directory artifact metadata is still not validated after Round 1 artifact metadata fix**
> - 来源：edge+auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

Story AC5 明确要求 workflow artifact metadata 缺失或值域非法时必须报告 `artifact-path.missing-required-metadata` 或 `artifact-path.invalid-required-metadata`（`_bmad-output/implementation-artifacts/stories/3-4-runtime-path-menu-target-legacy-entry-and-artifact-path-validation.md:52-61`）。Artifact Path Contract Notes 进一步区分 metadata 承载方式：Markdown artifact 使用 YAML frontmatter，非 Markdown file artifact 使用 `<artifact-filename>.metadata.json`，Directory artifact 必须在 artifact directory 内写出 `metadata.json`，并且 manifest/index projection 不得替代 on-disk artifact metadata（同文件 `241-249`）。

当前 production discovery 的数据模型只允许 artifact metadata location 为 `"frontmatter" | "sidecar"`（`src/validation/validate-project.ts:193-197`）。当 default output path 是目录时，`discoverArtifacts()` 调用 `listArtifactFiles()` 收集文件路径（`src/validation/validate-project.ts:211-226`），而 `listArtifactFiles()` 会跳过名为 `metadata.json` 的文件以及 `*.metadata.json` sidecar（`src/validation/validate-project.ts:232-245`）。随后 `readWorkflowArtifactMetadata()` 只读取 Markdown frontmatter 或 `<artifactPath>.metadata.json`（`src/validation/validate-project.ts:248-276`），没有读取 `<directory>/metadata.json` 的路径。规则层 `validateRequiredMetadata()` 具备 missing/invalid metadata issue 生成能力（`src/validation/rules/artifact-path.ts:228-276`），但只有 production discovery 把 directory artifact metadata 作为 input 传入时才会触发。

此外，现有 command-level regression 只创建 `_speclite-output/reports/missing.md` 与 `_speclite-output/reports/invalid.md`，断言 `metadataLocation: "frontmatter"`（`test/validate-command.test.ts:83-158`），未覆盖 directory artifact `metadata.json`。`src/validation/artifact-metadata.ts:89-93` 已表达 directory artifact 的 metadata path 是 `<artifactPath>/metadata.json`，但 `validate-project.ts` 的 production validation 尚未消费该约定。

**严重性判断：合理**

审查原文标为 [中] 合理；评估后作为 Story 验收阻塞项处理，优先级 P1。理由是该缺口直接对应 Story AC5 与 Artifact Path Contract Notes，且会导致 production `speclite validate` 对 directory artifact metadata 缺失或非法值漏报。它不是风格问题，也不是可延后的增强项。

**修复建议：可行**

审查建议可行：应在 production artifact discovery 中把 directory artifact 作为 artifact entity 处理。当 default output path 本身或其子目录存在 `metadata.json` 时，读取该 metadata，并用 directory relative path 作为 `actualArtifactPath` 传入 `validateArtifactPathContract()`。同时补充 command-level regression，覆盖 directory artifact `metadata.json` 缺失 required keys 和值域非法时分别报告 `artifact-path.missing-required-metadata` / `artifact-path.invalid-required-metadata`，并继续保持 redaction-safe 输出。

**误报评估：非误报**

该 finding 不是误报。代码证据显示 Round 1 修复覆盖了 file artifact discovery 与 file metadata parsing，但 directory artifact 的 `<directory>/metadata.json` 尚未进入 production validation 输入面。

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | Directory artifact metadata 仍未被 production validation 覆盖 | [中] | **P1** | AC5 明确要求 directory artifact 使用目录内 `metadata.json`，当前 production discovery 排除并未读取该 metadata，需进入 fixer。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| - | 无 | - | - | 本轮 finding 属于 Story 3.4 验收相关 patch，不建议降级为 TODO。 |

### 可忽略（误报）

| # | 发现 | 原始严重性 | 忽略理由 |
|---|------|----------|---------|
| - | 无 | - | 未发现误报。 |

### 评估决定

- **发现 #1（Directory artifact metadata 仍未被 production validation 覆盖）**：确认有效，需进入 fixer，优先级 P1。
- **整体决定**：本轮 CR 评估不通过；需修复项 1 个，CR TODO/记录项 0 个，误报 0 个。可以进入 `bmenhance-cr-03-fixer`。

## 修复执行记录

### 修复执行记录
- **Date**: 2026-05-28
- **Model Used**: GPT-5 Codex (gpt-5-codex)
- **Fix Items**: 1

#### 修复项 #1：Directory artifact metadata 仍未被 production validation 覆盖

- **状态**: 已修复
- **修改文件**:
  - `src/validation/validate-project.ts`
  - `src/validation/rules/artifact-path.ts`
  - `src/diagnostics/output.ts`
  - `test/validate-command.test.ts`
- **关键差异**:
  - `discoverArtifacts()` 的目录模式改为通过 `listArtifactEntities()` 发现 artifact entities；当目录中存在 `metadata.json` 时，该目录自身作为 directory artifact，不再只递归普通 files。
  - `readWorkflowArtifactMetadata()` 现在会读取 `<directory>/metadata.json`，并以 `metadataLocation: "directory"` 把 parsed metadata 传给 `validateArtifactPathContract()`。
  - `MetadataLocation` 类型补充 `"directory"`，保持 artifact-path rule 与诊断 evidence 类型一致。
  - `test/validate-command.test.ts` 新增 production validate regression：`missing-directory/metadata.json` 缺失 required keys 时报告 `artifact-path.missing-required-metadata`，`invalid-directory/metadata.json` 值域非法时报告 `artifact-path.invalid-required-metadata`。
- **验证命令**:
  - `npm test -- --run test/validate-command.test.ts`：通过，1/1 文件，11/11 测试。
  - `npm run build`：通过。
  - `npm test`：通过，24/24 文件，144/144 测试。
  - `git diff --check`：通过。
- **范围控制**: 未修改 Story 文档；未处理 evaluation round 2 之外的问题；未提交 git，未推送。

✅ CR 修复执行完成，修复记录已追加到评估文件
