---
Story: 3-4
Round: 1
Date: 2026-05-28
Model Used: GPT-5 Codex (gpt-5-codex)
Type: Code Review Summary
---

## 审查结论

首轮审查。Agent 子代理工具不可用，已按 skill 降级为串行三层审查模式；Blind Hunter、Edge Case Hunter、Acceptance Auditor 均完成。`npm run build` 通过，完整 `npm test` 通过，`git diff --check` 通过。当前存在 2 个中优先级 AC 覆盖缺口和 1 个低优先级诊断精度问题，建议不通过本轮 CR，进入 evaluator 对 findings 做评估。

## 新发现

### 1. [中] Production validate does not validate workflow artifact metadata

- **来源**：blind+edge+auditor
- **分类**：patch

- **证据**
  - `src/validation/validate-project.ts:153-161` 调用 `validateArtifactPathContract()` 时只传入 `configuredRoot`、`defaultOutputPath`、`artifactType` 和 `metadataLocation`，没有读取或传入 artifact metadata / actual artifact path。
  - `src/validation/rules/artifact-path.ts:81-83` 只有在 `input.metadata !== undefined` 时才执行 required metadata validation。

- **影响**
  - AC5 要求 workflow artifact metadata 缺失或值域非法时报告 `artifact-path.missing-required-metadata` / `artifact-path.invalid-required-metadata`，但 production `speclite validate` 路径无法触发这些 issue id。

- **建议**
  - 在 `validateProject` 的 artifact-path 聚合中基于 artifact contract / metadata location 读取 on-disk metadata，并把 metadata 传入 `validateArtifactPathContract()`；补充 command-level regression 覆盖缺失和非法 metadata。

### 2. [中] Installed skill legacy config references are not checked

- **来源**：blind+edge+auditor
- **分类**：patch

- **证据**
  - `src/validation/rules/legacy-namespace.ts:47-67` 只检查 `filesIndex.entries` 的 `path` / `sourceRef` 是否包含 `_bmad/`。
  - `src/validation/rules/legacy-namespace.ts:142-149` 存在 `installedSkillReferencesLegacyConfig()`，但当前实现没有调用它来检查 installed `SKILL.md` 内容。

- **影响**
  - AC3 要求 installed skill 仍引用 legacy config path 时报告 `legacy-namespace.legacy-config-reference`；当前 installed self-contained skill entry 内残留 `_bmad/` 引用时可能漏报。

- **建议**
  - 在 legacy namespace rule 中按 `skillIndex.installedTargets` 和 adapter registry 精确读取 installed `SKILL.md`，仅对当前 installed canonical entries 检查 legacy config reference；补充不删除文件的 regression。

### 3. [低] Runtime symlink escape classification does not resolve whether the symlink escapes

- **来源**：blind+edge+auditor
- **分类**：patch

- **证据**
  - `src/validation/rules/runtime-path.ts:152-174` 在路径任一 segment 是 symlink 时立即返回 `runtime-path.symlink-escape`，没有解析 symlink target 并判断是否位于 target project boundary 内。

- **影响**
  - AC1 要求“symlink 解析后逃出 target project boundary”时报告 `runtime-path.symlink-escape`；当前实现会覆盖真实逃逸，但也可能把项目内 symlink 误报为 escape，降低诊断精度。

- **建议**
  - 复用 path normalizer / `realpath` 边界分类，只在解析后逃逸时报告 `runtime-path.symlink-escape`；对项目内 symlink 另行允许或报告更准确的 issue。

## 验证摘要

- `npm test` ✅ 通过（141 / 141）
- `npm run lint` 不适用：`package.json` 未定义 `lint` script。
- `npm run build` ✅ 通过。
- 定向复现 ✅ 通过
  - `npm test -- --run test/runtime-path-validation.test.ts test/legacy-namespace-validation.test.ts test/menu-target-validation.test.ts test/artifact-path-validation.test.ts test/validate-command.test.ts test/ide-target-writer.test.ts test/runtime-structure.test.ts`：7 个文件 37 项测试通过。
  - `git diff --check`：通过。

## 通过项

- `src/manifest/hash.ts` 的 HALT 最小修复范围正确：目录始终递归，include predicate 只决定 file 是否进入 hash；symlink 仅在 included 时阻断，未发现扩大到 Story 3.4 之外的行为变更。
- Runtime path、menu target、legacy namespace、artifact path 的基础 rule 与 focused tests 已接入；现有测试、构建和 diff whitespace gate 均通过。
- 未发现 `menu-target` 对 `claude` / `agents` canonical target id 的 branded target 回归。
