---
Story: 9-2
Round: 3
Date: 2026-06-17
Model Used: GPT-5 Codex (gpt-5-codex)
Type: Code Review Summary
---

## 审查结论

本轮为复审。Agent 子审查工具在当前环境不可用，本轮按 skill 降级规则由当前模型执行单一复审，并覆盖 Blind Hunter、Edge Case Hunter、Acceptance Auditor 三类检查视角。Round 2 Finding #1 已关闭：`runtime-compat-script` repair 现在同时绑定 target path 与 sourceRef，approved resolver scripts repair 未被误伤，非 resolver `_speclite/scripts/*` target path 仍被阻断。focused tests 通过；未发现 Round 2 fixer 引入新的阻塞问题。建议本轮通过。

## 上轮问题回顾

### 已修复

1. Round 2 / Finding #1 — explicit repair 的 compat allowlist 未绑定目标 path，可把 Python resolver 写入非 resolver script path
   - 修复位置：`src/update/update-plan.ts:225-230` 在 repair planning 阶段把 `entry.path` 作为 `targetPath` 传入 `readRepairCandidateBytes`；`src/update/update-plan.ts:996-1001` 在 apply repair 阶段把 `action.affectedPath` 作为 `targetPath` 传入。
   - 修复位置：`src/update/update-plan.ts:571-579` 仅当 `artifactKind === "runtime-compat-script"`、`sourceRef` 解析为 allowlisted resolver script，且 `targetPath === "_speclite/scripts/${scriptName}"` 时才读取 bundled canonical bytes。
   - 验证结果：`test/update-planning.test.ts:911-964` 继续证明 deleted / drifted approved `_speclite/scripts/resolve_config.py` 与 `_speclite/scripts/resolve_customization.py` 可被 explicit repair 恢复；`test/update-planning.test.ts:966-1018` 继续覆盖 `bundled-runtime-compat:scripts/resolve_*.py` fallback sourceRef；`test/update-planning.test.ts:1020-1058` 覆盖非 resolver target path 即使带 allowlisted resolver sourceRef 也保持 `missing-source-evidence` 阻断且不写入。
   - 本轮复核：`npm test -- --run test/update-planning.test.ts` 通过，1 个 test file / 23 tests passed；`git diff --check -- src/update/update-plan.ts test/update-planning.test.ts` 通过。

### 仍为非阻塞待办

无。

## 新发现

本轮未发现新的阻塞项或中高优先级问题。

## 验证摘要

- `npm test -- --run test/update-planning.test.ts` ✅（1 个 test file / 23 tests passed）
- `npm test -- --run test/runtime-path-validation.test.ts test/installed-activation-contract.test.ts test/uninstall-command.test.ts` ✅（3 个 test files / 10 tests passed）
- `npm test -- --run test/update-command.test.ts test/runtime-structure.test.ts` ❌（`test/update-command.test.ts` 通过；`test/runtime-structure.test.ts` 2 个断言失败，原因仍是 unrelated untracked SDLC skill roots 让 `skillCount` 从 57 变为 61，符合 Story 与 Round 2 中记录的既有非 Story 9.2 失败）
- `git diff --check -- src/update/update-plan.ts test/update-planning.test.ts` ✅（无 whitespace 错误）
- `npm run lint` 未运行（本轮按 Round 3 复审范围执行 focused verification）
- `npm run build` 未运行（本轮按 Round 3 复审范围执行 focused verification）
- 额外复核：
  - 静态复核 `readRepairCandidateBytes` 仅在 `planRepair` 与 `applyRepairActions` 中使用，且两处均传入目标 path。
  - 静态复核 `isGeneratedInstallerArtifact` 仍只影响 generated installer artifact 的 repair action 类型，不改变 human-owned / workflow-owned 保护。
  - 静态复核 IDE mirror repair 路径仍走 `applyIdeMirrorRepairAction` / `findIdeMirrorRepairSource`，不依赖 `runtime-compat-script` bundled source resolution。

## 通过项

- Round 2 指出的 target path/sourceRef 未成对匹配问题已修复：`resolve_config.py` 只能恢复到 `_speclite/scripts/resolve_config.py`，`resolve_customization.py` 只能恢复到 `_speclite/scripts/resolve_customization.py`。
- Approved resolver scripts repair 未被误伤：canonical sourceRef 与 `bundled-runtime-compat:*` sourceRef 两类 focused tests 均通过。
- 非 resolver `_speclite/scripts/*` target path 未被扩大为 repairable compatibility script：negative focused test 断言无 repair action、无写入、保持 `missing-source-evidence` conflict。
- 未发现 default activation resolver 被扩大；`test/installed-activation-contract.test.ts` 继续通过。
- 未发现 human-owned / workflow-owned 边界被改变；Round 2 fixer 仅改变 installer-owned drift 的 repair source resolution 入参与 compat path 配对。
- 未发现 normal update hidden repair、IDE mirror repair 或 uninstall 行为被 Round 2 fixer 改变；相关 focused tests 中 `update-command`、IDE mirror repair 覆盖和 uninstall 覆盖保持通过或未出现 Story 9.2 相关失败。

## 结论

- **结论：通过**
- **阻塞项**：无
- **建议**：可进入 evaluator 对 Round 3 复审结论进行独立确认；全量 suite 的 `skillCount 57 -> 61` 失败仍应继续按既有 unrelated dirty / untracked skill roots 处理，不应作为 Story 9.2 repair 阻塞项。
