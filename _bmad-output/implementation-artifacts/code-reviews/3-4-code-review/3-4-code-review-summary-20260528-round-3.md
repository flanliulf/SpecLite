---
Story: 3-4
Round: 3
Date: 2026-05-28
Model Used: GPT-5 Codex (gpt-5-codex)
Type: Code Review Summary
---

## 审查结论

本轮为复审。Agent 子代理工具不可用，已按 skill 降级为串行三层审查模式；Blind Hunter、Edge Case Hunter、Acceptance Auditor 均完成。Round 2 的 directory artifact `<directory>/metadata.json` production validation 已闭环，Round 1 的 installed canonical `SKILL.md` legacy config reference、runtime symlink realpath boundary 分类和 `src/manifest/hash.ts` include traversal 修复仍保持闭环。`npm run build` 通过，完整 `npm test` 通过，`git diff --check` 通过；仓库未定义 `lint` script。当前发现 1 个中优先级 patch finding，建议不通过本轮 CR，进入 evaluator。

## 上轮问题回顾

### 已修复

1. Round 2 / Finding #1 — Directory artifact metadata is still not validated after Round 1 artifact metadata fix
   - `src/validation/validate-project.ts:211-237` 现在把包含 `metadata.json` 的目录作为 directory artifact entity；`src/validation/validate-project.ts:263-275` 读取 `<directory>/metadata.json` 并传入 `metadataLocation: "directory"`。
   - `test/validate-command.test.ts:103-173` 覆盖 production validate 下 `missing-directory/metadata.json` 与 `invalid-directory/metadata.json`，分别断言 `artifact-path.missing-required-metadata` 和 `artifact-path.invalid-required-metadata`，focused regression 通过。

2. Round 1 / Finding #2 — Installed skill legacy config references are not checked
   - `src/validation/rules/legacy-namespace.ts:69-96` 仍按 `skillIndex.entries[].installedTargets` 与 adapter registry 定位当前 installed canonical `SKILL.md`，只读检查 `_bmad/config.yaml` / `_bmad/` references。
   - `test/legacy-namespace-validation.test.ts:66-100` 的 regression 仍通过。

3. Round 1 / Finding #3 — Runtime symlink escape classification does not resolve whether the symlink escapes
   - `src/validation/rules/runtime-path.ts:152-185` 仍使用 `realpath` 比较 symlink target 与 target project realpath，只有解析后逃出 project boundary 才报告 `runtime-path.symlink-escape`。
   - `test/runtime-path-validation.test.ts:100-128` 的 project-internal symlink regression 仍通过。

4. HALT 修复 — `src/manifest/hash.ts` include traversal
   - `src/manifest/hash.ts:38-59` 保持目录始终递归，include predicate 只决定 file 是否进入 hash；included symlink 才触发 canonical package hash guard。
   - `test/ide-target-writer.test.ts` 与 `test/runtime-structure.test.ts` regression 仍通过。

### 仍为非阻塞待办

无。

## 新发现

### 1. [中][新] Artifact path symlink validation reports internal project symlinks as symlink escape

- **来源**：blind+edge+auditor
- **分类**：patch

- **证据**
  - Story 3.4 将 `artifact-path.symlink-escape` 定义为 artifact path 通过 symlink 逃出 project boundary：`_bmad-output/implementation-artifacts/stories/3-4-runtime-path-menu-target-legacy-entry-and-artifact-path-validation.md:267-268`。
  - `src/validation/rules/artifact-path.ts:278-300` 只要任一 path segment 是 symlink 就立即返回 `artifact-path.symlink-escape`，没有像 runtime-path 修复那样解析 symlink target 并判断是否仍在 target project boundary 内。
  - 定向复现：创建 `_speclite-output/link -> _speclite-output/real` 的项目内 symlink 后，以 `actualArtifactPath: "_speclite-output/link/report.md"` 调用 `validateArtifactPathContract()`，实际返回 `artifact-path.symlink-escape`，即使 symlink target 仍位于项目内。

- **影响**
  - AC5 要求的是 symlink escape 诊断；当前 artifact-path rule 会把合法的项目内 symlink 误报为 escape，和 Round 1 已修复的 runtime symlink 语义不一致，可能阻塞合法 workflow artifact root / output layout。

- **建议**
  - 复用 runtime-path 的 `realpath` boundary 分类思路，artifact-path 只在 symlink 解析后逃出 target project boundary 时报告 `artifact-path.symlink-escape`。
  - 补充 artifact path project-internal symlink regression，并保留 existing outside symlink escape regression。

## 验证摘要

- `npm test -- --run test/runtime-path-validation.test.ts test/legacy-namespace-validation.test.ts test/menu-target-validation.test.ts test/artifact-path-validation.test.ts test/validate-command.test.ts test/ide-target-writer.test.ts test/runtime-structure.test.ts` ✅ 通过（40 / 40）
- `npm run lint` 不适用：`package.json` 未定义 `lint` script。
- `npm run build` ✅ 通过。
- `npm test` ✅ 通过（144 / 144）
- `git diff --check` ✅ 通过。
- 额外复核：
  - Directory artifact `<directory>/metadata.json` production validation 已覆盖 missing / invalid metadata。
  - Runtime internal symlink regression 通过，Round 1 runtime-path finding 仍闭环。
  - Installed canonical `SKILL.md` legacy config reference regression 通过，Round 1 legacy finding 仍闭环。
  - `src/manifest/hash.ts` include traversal 修复保持目录递归，include predicate 只决定 file 是否进入 hash，included symlink 才触发 guard。
  - Artifact internal symlink 定向复现返回 `artifact-path.symlink-escape`，形成本轮新增 patch finding。

## 通过项

- Round 2 directory artifact metadata 修复已覆盖 production discovery、metadata 读取、diagnostic projection 和 command-level regression。
- Runtime path validation、legacy namespace validation、menu target validation、file artifact metadata validation 和 hash include traversal 未发现回归。
- Menu target validation 仍以 `skill-index.json` 作为 installed inventory，保持 `claude` / `agents` canonical target id，不输出 branded `copilot` / `cursor` target id。

## 结论

- **结论：不通过**
- **阻塞项**：无 decision_needed；存在 1 个 patch finding。
- **建议**：进入 `bmenhance-cr-02-evaluator`，评估本轮 artifact internal symlink finding 是否纳入 fixer。
