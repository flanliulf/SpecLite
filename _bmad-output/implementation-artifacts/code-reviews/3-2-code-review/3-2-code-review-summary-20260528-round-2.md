---
Story: 3-2
Round: 2
Date: 2026-05-28
Model Used: GPT-5 Codex (gpt-5-codex)
Type: Code Review Summary
---

## 审查结论

本轮为复审。Agent 工具不可用，已按 skill 降级为当前上下文串行三层审查；Blind Hunter、Edge Case Hunter、Acceptance Auditor 均完成。Round 1 的 selected canonical package root 覆盖校验修复只解决了“重复 root 补齐数量”的场景，尚未解决“缺少 expected canonical package root、但用另一个唯一非 expected root 补齐”的覆盖缺口。当前 focused test 通过，但仍存在 1 个 `patch` 阻塞项；建议不通过，进入 evaluator。

## 上轮问题回顾

### 已修复

1. Round 1 / Finding #1 — `skill-index` completeness 只按 53 个 entries 数量判断，不能发现 duplicate root 补齐数量
   - `src/validation/rules/manifest-schema.ts:229-277` 新增了 `validateSelectedModuleRootCoverage`，会检查 `moduleId:sourcePackagePath` 重复，并验证 `core` / `sdlc` root 数量分别为 `13` / `40`。
   - `test/validate-command.test.ts:287-323` 新增“总数仍为 53，但缺失 root 被重复 root 补齐”的 regression。
   - 验证结果：`npx vitest run test/validate-command.test.ts` 通过，1 个 test file / 6 个 tests。

### 仍为非阻塞待办

无。

## 新发现

### 1. [中] Selected root 覆盖校验仍未按 canonical package root inventory 逐项比对

- **来源**：blind+edge+auditor
- **分类**：patch

- **证据**
  - `src/validation/rules/manifest-schema.ts:215-230` 仍只在 manifest 同时选择 `core` 与 `sdlc` 时先检查总数为 `53`，随后调用 root coverage helper。
  - `src/validation/rules/manifest-schema.ts:235-277` 的 helper 只检查 duplicate `moduleId:sourcePackagePath`，以及 `core` / `sdlc` 的 unique root 数量是否分别为 `13` / `40`；它没有构造 selected modules 的 expected canonical package root set，也没有逐项校验每个 expected root 是否存在。
  - 因此，如果缺少 `assets/source/speclite/core-skills/speclite-help`，同时用一个唯一但不属于 selected canonical inventory 的 `core` root 补齐，`entries.length === 53`、无 duplicate、`coreRootCount === 13`、`sdlcRootCount === 40` 均可成立，当前校验会返回通过。
  - `test/validate-command.test.ts:287-323` 只覆盖 duplicate root 替换场景，没有覆盖“唯一错误 root 替换 expected root”的同 count 缺失场景。
  - Story AC 3 要求 selected modules 下全部 canonical package roots 都必须覆盖，缺少任一 selected package root 都必须报告 stable `manifest-schema` issue：`_bmad-output/implementation-artifacts/stories/3-2-manifest-and-index-schema-validation.md:30-36`。

- **影响**
  - Round 1 的核心问题仍未被完整修复：`speclite validate` 仍可能接受一个数量正确但 selected canonical package root 集合不正确的 `skill-index.json`。这会让后续 `status`、`validate`、`update` 和 IDE adapter 信任不完整或被替换的 installed-state projection，直接违反 AC 3。

- **建议**
  - 复用或提取 source-side official module discovery / package root inventory，按 selected module 构造 expected key set，例如 `moduleId:sourcePackagePath` 或 `moduleId:canonicalSkillId:sourcePackagePath`。
  - 将 actual skill index entries 与 expected set 做 set equality：缺失 expected root、出现 unexpected root、重复 root 都应输出 stable `manifest-schema.malformed-field`。
  - 补充 regression：保持 53 个 entries，删除一个 expected root，用一个唯一但非 expected root 或错误 module path 补齐，断言 validate 失败且 issue category 为 `manifest-schema`。

## 验证摘要

- `npx vitest run test/validate-command.test.ts` 通过（6 / 6）。
- `npm test` 未执行：本轮复审按用户要求限定为 Story 3.2 修复后 reviewer，已执行 focused validation test。
- `npm run lint` 未执行：`package.json` 当前未声明 `lint` script。
- `npm run build` 未执行：本轮 reviewer 不生成构建产物。
- `git diff --check` 通过：限定已跟踪 Story 3.2 相关路径无 whitespace error。
- `git diff --check --no-index /dev/null src/commands/validate.ts` 通过。
- `git diff --check --no-index /dev/null src/validation/rules/manifest-schema.ts` 通过。
- `git diff --check --no-index /dev/null src/validation/validate-project.ts` 通过。
- `git diff --check --no-index /dev/null test/validate-command.test.ts` 通过。

## 通过项

- 修复后的 duplicate root 场景已被源码逻辑和 focused test 覆盖。
- 修复仍保持 stable `manifest-schema.malformed-field`、`affectedPath: _speclite/_config/skill-index.json`，未把问题错误归类到 `file-integrity`、`ide-mirror` 或 `runtime-path`。
- 未发现本轮修复引入源码写入、remote access、update/repair 或 Story 3.3+ 范围外行为。

## 结论

- **结论：不通过**
- **阻塞项**：1 个 patch finding，Round 1 selected canonical package root 覆盖校验问题仍未完整修复。
- **建议**：进入 evaluator，由 evaluator 判断该 finding 是否确认有效；若确认，应进入 fixer 补 expected canonical package root inventory set equality 校验和唯一错误 root regression。
