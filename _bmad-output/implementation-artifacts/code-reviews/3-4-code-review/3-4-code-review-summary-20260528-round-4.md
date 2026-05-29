---
Story: 3-4
Round: 4
Date: 2026-05-28
Model Used: GPT-5 Codex (gpt-5-codex)
Type: Code Review Summary
---

## 审查结论

本轮为复审。Agent 子代理工具不可用，已按 skill 降级为串行三层审查模式；Blind Hunter、Edge Case Hunter、Acceptance Auditor 均完成。Round 3 的 artifact path project-internal symlink 误报修复已闭环：项目内 symlink 不再报告 `artifact-path.symlink-escape`，project-external symlink escape 仍报告 `artifact-path.symlink-escape`。Round 1 / Round 2 的 runtime symlink realpath boundary、installed canonical `SKILL.md` legacy config reference、directory artifact metadata validation 和 `src/manifest/hash.ts` include traversal 修复仍保持闭环。`npm run build` 通过，完整 `npm test` 通过，`git diff --check` 通过；仓库未定义 `lint` script。当前未发现新的阻塞项或 patch finding，建议通过本轮 CR，可进入 evaluator。

## 上轮问题回顾

### 已修复

1. Round 3 / Finding #1 — Artifact path symlink validation reports internal project symlinks as symlink escape
   - `src/validation/rules/artifact-path.ts:278-318` 现在对 symlink segment 执行 `realpath()`，并与 project root realpath 做 native path boundary 比较；只有解析后不在 project boundary 内才返回 `artifact-path.symlink-escape`。
   - `test/artifact-path-validation.test.ts:35-98` 保留 project-external symlink escape regression，并断言 `details.reason: "symlink-escape"` 且不泄漏外部绝对路径。
   - `test/artifact-path-validation.test.ts:100-129` 新增 project-internal artifact symlink regression，`_speclite-output/link -> _speclite-output/real` 且 `actualArtifactPath` 为 `_speclite-output/link/report.md` 时返回 `[]`。
   - 本轮 focused regression 通过：`npm test -- --run test/runtime-path-validation.test.ts test/artifact-path-validation.test.ts test/validate-command.test.ts test/legacy-namespace-validation.test.ts test/menu-target-validation.test.ts test/ide-target-writer.test.ts test/runtime-structure.test.ts`，7/7 文件、41/41 测试。

2. Round 2 / Finding #1 — Directory artifact metadata is still not validated after Round 1 artifact metadata fix
   - `src/validation/validate-project.ts:232-249` 仍将包含 `metadata.json` 的目录识别为 directory artifact entity。
   - `src/validation/validate-project.ts:252-276` 仍读取 `<directory>/metadata.json` 并标记 `metadataLocation: "directory"`。
   - `test/validate-command.test.ts:83-182` 仍覆盖 production validate 下 directory artifact metadata 缺失 required keys 与值域非法。

3. Round 1 / Finding #2 — Installed skill legacy config references are not checked
   - `src/validation/rules/legacy-namespace.ts:69-96` 仍基于 `skillIndex.entries[].installedTargets` 和 adapter registry 定位当前 installed canonical `SKILL.md`，只读检查 legacy config references。

4. Round 1 / Finding #3 — Runtime symlink escape classification does not resolve whether the symlink escapes
   - `src/validation/rules/runtime-path.ts:152-190` 仍使用 `realpath()` 比较 symlink target 与 project root realpath，只有解析后逃出 project boundary 才报告 `runtime-path.symlink-escape`。

5. HALT 修复 — `src/manifest/hash.ts` include traversal
   - `src/manifest/hash.ts:35-67` 保持目录始终递归，include predicate 只决定 file 是否进入 hash；included symlink 才触发 canonical package hash guard。

### 仍为非阻塞待办

无。

## 新发现

本轮未发现新的阻塞项或中高优先级问题。

## 验证摘要

- `npm test -- --run test/runtime-path-validation.test.ts test/artifact-path-validation.test.ts test/validate-command.test.ts test/legacy-namespace-validation.test.ts test/menu-target-validation.test.ts test/ide-target-writer.test.ts test/runtime-structure.test.ts` ✅ 通过（41 / 41）
- `npm run lint` 不适用：`package.json` 未定义 `lint` script。
- `npm run build` ✅ 通过。
- `npm test` ✅ 通过（145 / 145）
- `git diff --check` ✅ 通过。
- 额外复核：
  - Artifact path project-internal symlink regression 覆盖 `_speclite-output/link -> _speclite-output/real` 并返回 `[]`。
  - Artifact path project-external symlink regression 仍报告 `artifact-path.symlink-escape`，且 public issue 不包含外部绝对路径。
  - Directory artifact `<directory>/metadata.json` production validation、runtime symlink realpath boundary、installed canonical `SKILL.md` legacy config reference 和 hash include traversal 修复均未发现回归。

## 通过项

- Round 3 artifact path symlink 修复符合 Story 3.4 AC5 / issue mapping：`artifact-path.symlink-escape` 仅用于 symlink 解析后逃出 project boundary 的情况。
- Round 1 / Round 2 历史修复持续有效，未发现闭环缺口。
- 本轮审查范围保持在 Story 3.4 相关源码、测试与 CR 产物内；未修复源码、未修改 Story 文件、未提交、未推送。

## 结论

- **结论：通过**
- **阻塞项**：无
- **建议**：可进入 `bmenhance-cr-02-evaluator` 进行通过结论评估。
