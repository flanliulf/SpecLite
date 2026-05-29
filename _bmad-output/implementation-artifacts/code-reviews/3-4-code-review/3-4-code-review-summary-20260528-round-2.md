---
Story: 3-4
Round: 2
Date: 2026-05-28
Model Used: GPT-5 Codex (gpt-5-codex)
Type: Code Review Summary
---

## 审查结论

本轮为复审。Agent 子代理工具不可用，已按 skill 降级为串行三层审查模式；Blind Hunter、Edge Case Hunter、Acceptance Auditor 均完成。Round 1 的 Finding #2 和 Finding #3 已闭环，Finding #1 对 file artifacts 的 production metadata validation 已闭环，但 directory artifact metadata 仍未覆盖。`npm run build` 通过，完整 `npm test` 通过，`git diff --check` 通过；当前仍存在 1 个中优先级 patch finding，建议不通过本轮 CR，进入 evaluator。

## 上轮问题回顾

### 已修复

1. Round 1 / Finding #2 — Installed skill legacy config references are not checked
   - `src/validation/rules/legacy-namespace.ts:69-96` 现在按 `skillIndex.entries[].installedTargets` 与 adapter registry 定位当前 installed canonical `SKILL.md`，只读检查 `_bmad/config.yaml` / `_bmad/` references，并报告 `legacy-namespace.legacy-config-reference`。
   - `test/legacy-namespace-validation.test.ts:66-100` 覆盖 installed canonical skill entry 内 legacy config reference；focused regression 通过。

2. Round 1 / Finding #3 — Runtime symlink escape classification does not resolve whether the symlink escapes
   - `src/validation/rules/runtime-path.ts:152-185` 使用 `realpath` 比较 symlink target 与 target project realpath，只有解析后逃出 project boundary 才报告 `runtime-path.symlink-escape`。
   - `test/runtime-path-validation.test.ts:100-128` 覆盖 project-internal symlink 不误报；focused regression 通过。

### 仍需修复

1. Round 1 / Finding #1 — Production validate does not validate workflow artifact metadata
   - file artifact 场景已修复：`src/validation/validate-project.ts:157-187` 会发现 default output path 下的 artifact files，并传入 parsed metadata；`test/validate-command.test.ts:83-158` 覆盖 Markdown frontmatter missing/invalid metadata。
   - directory artifact 场景未闭环：当前 production discovery 未读取 directory artifact 的 `metadata.json`，详见本轮发现 #1。

### 仍为非阻塞待办

无。

## 新发现

### 1. [中] Directory artifact metadata is still not validated after Round 1 artifact metadata fix

- **来源**：edge+auditor
- **分类**：patch
- **标记**：上轮遗留，Round 1 Finding #1 未完全闭环

- **证据**
  - Story 3.4 要求 workflow artifact metadata 缺失或值域非法时报告 `artifact-path.missing-required-metadata` / `artifact-path.invalid-required-metadata`，并明确 Directory artifacts 必须在 artifact directory 内写出 `metadata.json`：`_bmad-output/implementation-artifacts/stories/3-4-runtime-path-menu-target-legacy-entry-and-artifact-path-validation.md:52-61`、`_bmad-output/implementation-artifacts/stories/3-4-runtime-path-menu-target-legacy-entry-and-artifact-path-validation.md:241-249`。
  - `src/validation/validate-project.ts:211-226` 对 directory default output path 只调用 `listArtifactFiles()` 并把返回的 file paths 当作 artifacts；`src/validation/validate-project.ts:232-245` 明确跳过 `metadata.json`。当 directory artifact 只包含 `metadata.json` 时，production discovery 得到空 artifacts，后续只做 path contract check。
  - `src/validation/rules/artifact-path.ts:79-83` 只有 `metadata !== undefined` 才执行 required metadata validation。定向 rule-level 复现中，`actualArtifactPath` 指向包含非法 `metadata.json` 的 directory artifact，返回 `[]`，未报告 `artifact-path.invalid-required-metadata`。

- **影响**
  - Round 1 的 artifact metadata patch 对 Markdown frontmatter 和 file sidecar JSON 已生效，但 directory artifact metadata 仍会被漏报，未完全满足 AC5 / Artifact Path Contract Notes。

- **建议**
  - 在 production artifact discovery 中把 directory artifact 作为 artifact entity 处理：当 default output path 或其子目录包含 `metadata.json` 时，读取该 metadata 并以 directory relative path 作为 `actualArtifactPath` 传入 `validateArtifactPathContract()`。
  - 补充 command-level regression：directory artifact `metadata.json` 缺失 required keys 和值域非法时分别报告 `artifact-path.missing-required-metadata` / `artifact-path.invalid-required-metadata`，并保持输出不泄露 absolute path 或原始 timestamp。

## 验证摘要

- `npm test -- --run test/runtime-path-validation.test.ts test/legacy-namespace-validation.test.ts test/menu-target-validation.test.ts test/artifact-path-validation.test.ts test/validate-command.test.ts test/ide-target-writer.test.ts test/runtime-structure.test.ts` ✅ 通过（40 / 40）
- `npm run lint` 不适用：`package.json` 未定义 `lint` script。
- `npm run build` ✅ 通过。
- `npm test` ✅ 通过（144 / 144）
- `git diff --check` ✅ 通过。
- 额外复核：
  - Runtime internal symlink regression 通过，Round 1 Finding #3 已闭环。
  - Installed canonical `SKILL.md` legacy config reference regression 通过，Round 1 Finding #2 已闭环。
  - Production file artifact metadata regression 通过，但 directory artifact metadata 定向复现返回 `[]`，Round 1 Finding #1 未完全闭环。
  - `src/manifest/hash.ts` include traversal 修复保持目录递归，include predicate 只决定 file 是否进入 hash，included symlink 才触发 guard；未发现引入 Story 3.4 相关新问题。

## 通过项

- Runtime path validation 的 symlink escape 分类已按 realpath boundary 判断，项目内 symlink 不再误报。
- Legacy namespace validation 已覆盖当前 installed canonical skill entry 内 legacy config reference，且仍是只读检查。
- Menu target validation 仍以 `skill-index.json` 作为 installed inventory，保持 `claude` / `agents` canonical target id，不输出 branded `copilot` / `cursor` target id。
- File artifact metadata validation、artifact root/default output path containment、hash include traversal 的现有 regression 均通过。

## 结论

- **结论：不通过**
- **阻塞项**：无 decision_needed；存在 1 个 patch finding。
- **建议**：进入 `bmenhance-cr-02-evaluator`，评估本轮 directory artifact metadata finding 是否纳入 fixer。
