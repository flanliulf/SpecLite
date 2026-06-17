---
Story: 9-2
Round: 2
Date: 2026-06-17
Model Used: GPT-5 Codex (gpt-5-codex)
Type: Code Review Summary
---

## 审查结论

本轮为复审。Agent 子审查工具在当前环境不可用，本轮按 skill 降级规则由当前模型串行执行 Blind Hunter、Edge Case Hunter、Acceptance Auditor 三层审查。Round 1 Finding #1 的核心修复已落地：`runtime-compat-script` repair 现在可从 bundled source 恢复两个 Python compatibility scripts，focused `test/update-planning.test.ts` 通过。但复审发现 1 个新阻塞问题：repair source allowlist 只绑定 `sourceRef`，没有同时绑定 target path，导致 explicit repair 可把 allowlisted resolver bytes 写入任意 `_speclite/scripts/*` installer-owned entry。建议本轮不通过。

## 上轮问题回顾

### 已修复

1. Round 1 / Finding #1 — explicit repair 无法恢复 fresh install 投影的 Python compatibility scripts
   - 修复位置：`src/update/update-plan.ts:564-591` 新增 `runtime-compat-script` repair source resolution，仅接受 `assets/source/speclite/scripts/resolve_config.py`、`assets/source/speclite/scripts/resolve_customization.py`、`bundled-runtime-compat:scripts/resolve_config.py`、`bundled-runtime-compat:scripts/resolve_customization.py` 这四类 sourceRef，并从 package bundled source 读取 canonical bytes。
   - 调用位置：`src/update/update-plan.ts:223-241` 和 `src/update/update-plan.ts:992-1017` 在 planning 与 apply repair 时传入 `entry.artifactKind`，使 compat scripts 不再落入 `missing-source-evidence`。
   - 测试覆盖：`test/update-planning.test.ts:911-1014` 新增两个 focused tests，覆盖 canonical sourceRef 与 `bundled-runtime-compat:*` fallback sourceRef 的 deleted / drifted compat script repair。
   - 验证结果：`npm test -- --run test/update-planning.test.ts` 通过，1 个测试文件、22 个测试用例全部通过。

### 仍为非阻塞待办

无。

## 新发现

### 1. [中][新] explicit repair 的 compat allowlist 未绑定目标 path，可把 Python resolver 写入非 resolver script path

- **来源**：edge+auditor
- **分类**：patch

- **证据**
  - `src/update/update-plan.ts:564-591` 的 `readRepairCandidateBytes` 仅检查 `entry.artifactKind === "runtime-compat-script"` 和 allowlisted `sourceRef` / scriptName，没有接收或校验 `entry.path` / `action.affectedPath` 必须是 `_speclite/scripts/resolve_config.py` 或 `_speclite/scripts/resolve_customization.py`。
  - `src/update/update-plan.ts:223-241` 只要 `detectFilesIndexEntryConflict` 给出 installer-owned drift，就会为该 entry 生成 repair action；`src/update/update-plan.ts:992-1017` apply 阶段随后把 allowlisted source bytes 写入 `action.affectedPath`。
  - `src/update/update-plan.ts:320-370` 的 update/repair planning 读取 `files-index.json` 和 manifest sourceDescriptor，但没有调用 `validateRuntimePaths`；因此 `src/validation/rules/runtime-path.ts:109-117` 中更严格的 approved compat asset path allowlist 不会在 `update --repair` 前阻断该场景。
  - 定向复现：构造 schema-valid files-index entry，`path: "_speclite/scripts/not_a_resolver.py"`、`ownership: "installer-owned"`、`artifactKind: "runtime-compat-script"`、`sourceRef: "assets/source/speclite/scripts/resolve_config.py"`，并让文件 hash drift；执行 `runUpdateCommand({ options: { repair: true, yes: true } })` 返回 `exitCode: 0`、`changedPaths: ["_speclite/scripts/not_a_resolver.py"]`，最终该非 resolver path 被写入 `resolve_config.py` bundled bytes。

- **影响**
  - Round 1 修复关闭了 missing source evidence 问题，但 repair allowlist 的目标范围比 Story 9.2 AC4 所述的 compatibility scripts 更宽。AC4 要求 explicit repair 只可恢复 installer-owned compatibility scripts；当前实现可在 schema-valid 但语义错误的 files-index 下把 resolver bytes 写到其它 `_speclite/scripts/*` installer-owned entry。
  - 未发现该问题扩大 default activation resolver，也未发现它改变 human-owned / workflow-owned 保护或 normal update hidden repair 语义；风险限定在 explicit `update --repair --yes` 对 malformed-but-schema-valid installed metadata 的写入边界。

- **建议**
  - 将 repair allowlist 同时绑定 sourceRef 和 target path：只有 `entry.path === "_speclite/scripts/resolve_config.py"` 且 sourceRef 指向 `resolve_config.py`，或 `entry.path === "_speclite/scripts/resolve_customization.py"` 且 sourceRef 指向 `resolve_customization.py` 时，才从 bundled source 读取 repair bytes。
  - 增加 focused negative test：`runtime-compat-script` entry 若 target path 不是上述两个 approved resolver paths，即使 sourceRef allowlisted，也应保持 conflict / missing-source-evidence，不得写入。
  - 保持现有 human-owned / workflow-owned classifier 优先级、normal update conflict 语义和 Node-only default activation negative tests 不变。

## 验证摘要

- `npm test` ❌（未重跑全量；沿用 Story 记录，全量 suite 当前受 unrelated untracked SDLC skill roots 改变 corpus count 影响失败）
- `npm test -- --run test/update-planning.test.ts` ✅（1 个测试文件 / 22 个测试通过）
- `npm test -- --run test/runtime-path-validation.test.ts test/installed-activation-contract.test.ts` ✅（2 个测试文件 / 9 个测试通过）
- `npm run lint` 未运行（本轮只做复审 focused verification）
- `npm run build` 未运行（本轮只做复审 focused verification）
- `git diff --check -- src/update/update-plan.ts test/update-planning.test.ts` ✅
- 额外复核：
  - 静态复核 Round 1 修复 diff、validation approved compat allowlist、ownership classifier、repair planning/apply 路径。
  - 定向动态探针复现了新 finding 中的 widened target-path repair 行为。

## 通过项

- Round 1 原始 P1 的核心场景已修复：deleted / drifted `_speclite/scripts/resolve_config.py` 与 `_speclite/scripts/resolve_customization.py` 可通过 explicit repair 从 bundled source 恢复。
- `bundled-runtime-compat:scripts/resolve_*.py` fallback sourceRef 已被纳入 focused repair tests。
- 未发现修复把 Python resolver 重新变成 default installed activation resolver；`test/installed-activation-contract.test.ts` 仍通过。
- 未发现修复改变 human-owned / workflow-owned protected boundary；`detectFilesIndexEntryConflict` 仍先按 classifier 保护 human/workflow/unknown path。
- 未发现 normal update hidden repair 语义变化；新增 bundled source resolution 只接入 `planRepair` / `applyRepairActions`。

## 结论

- **结论：不通过**
- **阻塞项**：新 Finding #1
- **建议**：进入 evaluator/fixer，仅收紧 `runtime-compat-script` repair source resolution 的 target path allowlist，并补充 negative focused test 后再复审。
