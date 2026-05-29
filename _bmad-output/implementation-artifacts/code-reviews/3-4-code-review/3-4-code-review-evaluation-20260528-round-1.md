---
Story: 3-4
Round: 1
Date: 2026-05-28
Model Used: GPT-5 Codex (gpt-5-codex)
Review Source: 3-4-code-review-summary-20260528-round-1.md
Review Model: GPT-5 Codex (gpt-5-codex)
Type: Code Review Evaluation
---

## 评估总结

对 Story 3-4 的第 1 轮 CR 代码审查结果（首轮）进行逐条评估。审查结果包含 3 个 patch findings：2 个中优先级 AC 覆盖缺口和 1 个低优先级诊断精度问题。经独立代码验证，3 个发现均成立，均应进入 fixer；不建议降级为 CR TODO，也未发现误报。

---

## 发现 #1 评估

### 审查原文

> **[中] Production validate does not validate workflow artifact metadata**
> - 来源：blind+edge+auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

Story AC5 明确要求 workflow artifact metadata 缺失或值域非法时报告 `artifact-path.missing-required-metadata` 或 `artifact-path.invalid-required-metadata`（`_bmad-output/implementation-artifacts/stories/3-4-runtime-path-menu-target-legacy-entry-and-artifact-path-validation.md:53-61`），并且 metadata source 不能只依赖 manifest/index projection（同文件 `245-250`）。当前 production 聚合路径 `validateArtifactPaths()` 仅把 `configuredRoot`、`defaultOutputPath`、`artifactType` 和固定 `metadataLocation: "frontmatter"` 传给 `validateArtifactPathContract()`，没有读取 on-disk artifact metadata，也没有传入 `metadata` 或 `actualArtifactPath`（`src/validation/validate-project.ts:137-166`）。规则层只有在 `input.metadata !== undefined` 时才调用 `validateRequiredMetadata()`（`src/validation/rules/artifact-path.ts:81-83`），因此 production `speclite validate` 无法触发 metadata missing/invalid issue。现有 metadata 测试只直接调用 rule helper 并显式传入 metadata（`test/artifact-path-validation.test.ts:88-120`、`263-289`），没有覆盖 command-level metadata 读取。

**严重性判断：合理**

这是 AC5 明确要求的 production validate 覆盖缺口，且三层来源均命中。虽然不造成写入破坏，但会让 `speclite validate` 漏报 required workflow artifact metadata 问题，阻塞 Story 3.4 验收，评估为 P1。

**修复建议：可行**

建议方向可行：在 `validateProject` 的 artifact-path 聚合中根据 artifact contract / metadata location 只读读取 on-disk frontmatter、sidecar JSON 或 directory `metadata.json`，把解析出的 metadata 和 actual artifact path 传入 `validateArtifactPathContract()`，并补 command-level regression。修复时需保持 Story 要求的只读边界，不得写 probe file。

**误报评估：非误报**

当前代码路径和测试覆盖均支持该发现成立。

---

## 发现 #2 评估

### 审查原文

> **[中] Installed skill legacy config references are not checked**
> - 来源：blind+edge+auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

Story AC3 要求 installed skill 仍引用 legacy config path 时报告 `legacy-namespace.legacy-config-reference`（`_bmad-output/implementation-artifacts/stories/3-4-runtime-path-menu-target-legacy-entry-and-artifact-path-validation.md:38-41`），Story task 也要求 legacy validation 检查 known legacy runtime namespaces、legacy config references 和 stale IDE skill entries（同文件 `97-101`）。当前 `validateLegacyNamespace()` 对 `legacy-config-reference` 的实际检查只遍历 `filesIndex.entries`，判断 `entry.path` 或 `entry.sourceRef` 是否以 `_bmad/` 开头（`src/validation/rules/legacy-namespace.ts:47-67`）。同文件已有 `installedSkillReferencesLegacyConfig()` helper 可读取 installed `SKILL.md` 内容并识别 `_bmad/config.yaml` 或 `_bmad/`（`src/validation/rules/legacy-namespace.ts:142-149`），但主流程没有调用。现有测试也只覆盖 `_bmad/config.yaml` files-index residue 与 stale legacy skill directory（`test/legacy-namespace-validation.test.ts:23-64`），没有写入 canonical installed `SKILL.md` 中的 `_bmad/` 内容并断言 production rule 报告。

**严重性判断：合理**

这是 AC3 明确要求的 installed skill 内容检查缺口，属于 production validation 漏报，评估为 P1。审查原始 [中] 严重性合理。

**修复建议：可行**

建议方向可行：基于 `skillIndex.entries[].installedTargets` 和 adapter registry 精确定位当前 installed canonical `SKILL.md`，只读读取对应内容，发现 legacy config reference 时报告 `legacy-namespace.legacy-config-reference`。需要避免全项目任意扫描，避免把无关历史目录误判为当前 installed entry。

**误报评估：非误报**

helper 存在但未接入主流程，且 AC 明确要求 installed skill reference 检查；该 finding 成立。

---

## 发现 #3 评估

### 审查原文

> **[低] Runtime symlink escape classification does not resolve whether the symlink escapes**
> - 来源：blind+edge+auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

Story AC1 要求 symlink 解析后逃出 target project boundary 时报告 `runtime-path.symlink-escape`（`_bmad-output/implementation-artifacts/stories/3-4-runtime-path-menu-target-legacy-entry-and-artifact-path-validation.md:16-22`），issue definition 也定义为 runtime path resolves outside target project through symlink（同文件 `256-259`）。当前 `findSymlinkSegment()` 在路径任一 segment 是 symlink 时立即返回 `runtime-path.symlink-escape`，没有调用 `realpath` 或边界分类来判断 symlink target 是否实际逃出项目（`src/validation/rules/runtime-path.ts:152-181`）。测试只构造指向 outside root 的 symlink 并断言报告该 issue（`test/runtime-path-validation.test.ts:49-98`），未覆盖项目内 symlink 不应按 escape 误报的场景。Story task 还要求复用 path normalization 进行 symlink resolution（Story 文件 `80-84`、`449`），当前实现只识别 symlink segment，不做 resolved target boundary 判定。

**严重性判断：偏低**

审查原文标为 [低]，但该问题直接关系 AC1 的“解析后逃出”语义和诊断准确性。虽然当前实现能覆盖真实逃逸的一部分场景，误报项目内 symlink 会降低信任度并可能阻断合法项目结构；同时三层来源均命中，建议在评估中提升为 P1 修复项，而不是 TODO。

**修复建议：可行**

建议复用 path normalizer / filesystem realpath 边界分类，只在 symlink target 解析后位于 project boundary 外时报告 `runtime-path.symlink-escape`；对项目内 symlink 应允许或输出与 AC 一致的非 escape 诊断。修复同时应补充项目内 symlink regression，避免仅用 outside symlink happy-path 覆盖。

**误报评估：非误报**

该 finding 不是误报。它指出的是分类条件过宽，不是说真实 outside symlink 不应报错。

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | Production validate 未验证 workflow artifact metadata | [中] | **P1** | AC5 production validation 漏报 metadata missing/invalid，需要修复并补 command-level regression。 |
| 2 | Installed skill legacy config references 未检查 | [中] | **P1** | AC3 installed `SKILL.md` 内容检查未接入主流程，需要修复并补 regression。 |
| 3 | Runtime symlink escape 未判断 symlink 是否实际逃逸 | [低] | **P1** | AC1 要求解析后逃出才报 `symlink-escape`，当前会误报项目内 symlink，需要修复分类逻辑。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| - | 无 | - | - | 本轮 3 个发现均为当前 Story 验收相关 patch，不建议降级为 TODO。 |

### 可忽略（误报）

| # | 发现 | 原始严重性 | 忽略理由 |
|---|------|----------|---------|
| - | 无 | - | 未发现误报。 |

### 评估决定

- **发现 #1（Production validate 未验证 workflow artifact metadata）**：确认有效，需进入 fixer，优先级 P1。
- **发现 #2（Installed skill legacy config references 未检查）**：确认有效，需进入 fixer，优先级 P1。
- **发现 #3（Runtime symlink escape 未判断 symlink 是否实际逃逸）**：确认有效，原始严重性偏低，评估提升为 P1，需进入 fixer。
- **整体决定**：本轮 CR 评估不通过；需修复项 3 个，CR TODO/记录项 0 个，误报 0 个。可以进入 `bmenhance-cr-03-fixer`。

## 修复执行记录

### 修复执行记录
- **Date**: 2026-05-28
- **Model Used**: GPT-5 Codex (gpt-5-codex)
- **Fix Items**: 3

#### 修复项 #1：Production validate 未验证 workflow artifact metadata

- 修改文件: `src/validation/validate-project.ts`、`test/validate-command.test.ts`
- 执行结果: 已修复。
- 关键差异: `validateProject` 的 artifact-path aggregation 现在会只读发现 `artifactContract.defaultOutputPath` 下的 artifact files，解析 Markdown frontmatter 或 sidecar JSON metadata，并把 `actualArtifactPath` 与 metadata 传入 `validateArtifactPathContract()`；无 artifact file 时保留原有 path contract validation。新增 command-level regression 覆盖 missing/invalid workflow artifact metadata。

#### 修复项 #2：Installed skill legacy config references 未检查

- 修改文件: `src/validation/rules/legacy-namespace.ts`、`test/legacy-namespace-validation.test.ts`
- 执行结果: 已修复。
- 关键差异: `validateLegacyNamespace()` 现在基于 `skillIndex.entries[].installedTargets` 与 adapter registry 精确定位当前 installed canonical `SKILL.md`，复用既有 `installedSkillReferencesLegacyConfig()` 只读检查 `_bmad/config.yaml` / `_bmad/` references，并报告 `legacy-namespace.legacy-config-reference`。未新增全项目扫描。

#### 修复项 #3：Runtime symlink escape 未判断 symlink 是否实际逃逸

- 修改文件: `src/validation/rules/runtime-path.ts`、`test/runtime-path-validation.test.ts`
- 执行结果: 已修复。
- 关键差异: `runtime-path` symlink 检查现在使用 `realpath` 解析 symlink target，并与 target project realpath 做边界比较；只有解析后逃出 project boundary 才报告 `runtime-path.symlink-escape`。新增项目内 symlink regression，防止合法内部 symlink 被误报。

#### 验证结果

- `npm test -- --run test/runtime-path-validation.test.ts test/legacy-namespace-validation.test.ts test/artifact-path-validation.test.ts test/validate-command.test.ts`: 通过，4/4 文件，23/23 测试。
- `npm run build`: 通过。
- `npm test`: 通过，24/24 文件，144/144 测试。
- `git diff --check`: 通过。

✅ CR 修复执行完成，修复记录已追加到评估文件
