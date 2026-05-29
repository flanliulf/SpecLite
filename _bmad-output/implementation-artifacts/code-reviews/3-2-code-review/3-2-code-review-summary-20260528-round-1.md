---
Story: 3-2
Round: 1
Date: 2026-05-28
Model Used: GPT-5 Codex (gpt-5-codex)
Type: Code Review Summary
---

## 审查结论

首轮审查。Agent 工具不可用，已按 skill 降级为当前上下文串行三层审查；Blind Hunter、Edge Case Hunter、Acceptance Auditor 均完成。审查范围限定为 Story 3.2 `File List` 与 manifest/index schema projection 直接相关差异。发现 1 个 `patch` 问题：`skill-index` completeness 当前只按数量判断，不能保证 selected modules 的每个 canonical package root 都被覆盖。建议本轮不直接通过，进入 evaluator 评估该 patch finding。

## 新发现

### 1. [中] Skill index completeness check can pass when a selected package root is missing

- **来源**：blind+edge+auditor
- **分类**：patch

- **证据**
  - `src/validation/rules/manifest-schema.ts:209-227` 中 `validateSelectedModuleCompleteness` 只检查 `skillIndex.entries.length !== CORE_SDLC_BASELINE_ENTRY_COUNT`。如果 `skill-index.json` 仍有 53 个 entries，但缺少一个 selected canonical package root，同时另一个 root 被重复或替换，该校验会返回通过。
  - Story AC 3 要求 selected modules 下全部 canonical package roots 都必须覆盖，缺少任一 selected package root 都必须报告 stable `manifest-schema` issue：`_bmad-output/implementation-artifacts/stories/3-2-manifest-and-index-schema-validation.md:30-36`。
  - `test/validate-command.test.ts:245-281` 只覆盖 entries 数量不足的情况，没有覆盖“总数仍为 53 但具体 root 缺失”的回归场景。

- **影响**
  - `speclite validate` 可能对不完整的 installed skill index 返回成功，后续 `status`、`update` 或 IDE adapter 会信任一个缺少 canonical package root 的投影。这直接削弱 AC 3 的 completeness contract。

- **建议**
  - 用 selected module 的 canonical package root inventory 构造期望集合，按 `moduleId` + `sourcePackagePath` / `canonicalSkillId` 逐项比对，而不是仅比较总数。
  - 补充回归测试：构造 53 个 entries，但删除一个 expected root、用重复或错误 root 补足数量，断言输出 stable `manifest-schema.malformed-field`。

## 验证摘要

- `npm test` 未在本 CR 轮次执行：本次 reviewer 步骤按用户约束只读源码和 Story 文档，不执行可能写入工作区或改变外部状态的验证命令。Story dev log 记录此前完整测试通过，但本轮未重新确认。
- `npm run lint` 未执行：同上；并且 `package.json` 当前未声明 `lint` script。
- `npm run build` 未执行：同上，避免写入 `dist/` 或其他构建产物。
- `git diff --check` ✅ 通过：限定 Story 3.2 相关源码/测试路径检查，无输出。

## 通过项

- `speclite validate` command hook、`CommandResult<ValidateCommandData>` projection、issue sorting、stable issue category 和 human/json renderer 分层整体符合 Story 3.2 的结构要求。
- Manifest、help index、files index 的 required fields、target id、project-relative POSIX path、stable issue id 和 redaction-safe details 基本覆盖到位。
- 未发现把 manifest/index schema issue 错分到 `file-integrity`、`ide-mirror`、`runtime-path` 或自由文本 issue 的问题。
