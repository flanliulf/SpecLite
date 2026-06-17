---
Story: 9-2
Round: 1
Date: 2026-06-17
Model Used: GPT-5 Codex (gpt-5-codex)
Type: Code Review Summary
---

## 审查结论

首轮审查。Agent 子审查工具在当前环境不可用，本轮按 skill 降级规则由当前模型串行执行 Blind Hunter、Edge Case Hunter、Acceptance Auditor 三层审查。focused tests、agent lint、build、release packaging check、`git diff --check` 依据 Story 记录和用户提供状态为通过；全量 `npm test -- --testTimeout 30000` 因 unrelated untracked SDLC skill roots 改变 corpus count 失败。审查发现 1 个必须修复的 AC4 阻塞问题，建议本轮不通过。

## 新发现

### 1. [高] explicit repair 无法恢复 fresh install 投影的 Python compatibility scripts

- **来源**：edge+auditor
- **分类**：patch

- **证据**
  - `src/installer/runtime-structure.ts:176-201` 会把 `_speclite/scripts/resolve_config.py` 和 `_speclite/scripts/resolve_customization.py` 写入目标项目，并在 `files-index` 中记录 `artifactKind: "runtime-compat-script"` 与 `sourceRef: compatScript.sourceRef`。
  - `test/fixtures/fresh-install-empty-project/expected/installed-state/files-index-full.json:66-82` 断言 fresh install 后两个 compat script 的 `sourceRef` 是 `assets/source/speclite/scripts/resolve_*.py`。
  - `src/update/update-plan.ts:218-225` 在 `update --repair` 遇到 installer-owned drift 时必须先通过 `readRepairCandidateBytes({ sourceRef })` 读取恢复源；读取不到就把该 entry 放入 `missing-source-evidence` conflict。
  - `src/update/update-plan.ts:541-562` 的 `readRepairCandidateBytes` 仅委托 `readSourceEvidence`，而 `readSourceEvidence` 只读取目标项目内的 project-relative `sourceRef`。fresh install 目标项目通常不包含 `assets/source/speclite/scripts/resolve_*.py`；local source 缺脚本时 fallback 写入的 `bundled-runtime-compat:scripts/...` 也会因不是 project-relative path 而返回 `undefined`。
  - 当前新增测试覆盖 fresh install 投影和 validation allowlist，例如 `test/runtime-structure.test.ts:102-176`、`test/runtime-path-validation.test.ts:130-186`，但没有覆盖 `update --repair` 对 drift/missing compat script 的实际恢复路径。

- **影响**
  - Story AC4 要求 explicit repair 只可恢复 installer-owned compatibility scripts。当前实现只把 `runtime-compat-script` 加入 generated installer artifact 分类，但 repair 仍依赖不可用的 `sourceRef` 读取恢复源，导致 hash drift、mode drift、缺失脚本或 sourceRef drift 时不能按 AC 恢复 compat scripts。
  - 这不会把 Python resolver 重新变成 default activation resolver，但会破坏 compatibility asset 的 ownership lifecycle：fresh install 能写入，validation 能放行，uninstall 能删除，repair 却无法恢复。

- **建议**
  - 为 `runtime-compat-script` 增加明确的 repair source resolution：当 `sourceRef` 是 `assets/source/speclite/scripts/resolve_*.py` 或 `bundled-runtime-compat:scripts/resolve_*.py` 时，从当前 SpecLite package bundled source 读取 canonical bytes，而不是只从目标项目读取。
  - 增加 focused tests：fresh installed project 中删除或篡改 `_speclite/scripts/resolve_config.py` / `resolve_customization.py` 后，`speclite update --repair --yes` 能恢复 installer-owned compat scripts，并保持 human-owned / workflow-owned paths 不受影响。
  - 同时覆盖 local source 缺 compatibility scripts 时 fallback `bundled-runtime-compat:scripts/...` 的 repair 行为，防止 fallback sourceRef 成为不可修复状态。

## 验证摘要

- `npm test` ❌（依据 Story Dev Agent Record / 用户提供状态：全量 `npm test -- --testTimeout 30000` 因 4 个 unrelated untracked SDLC skill roots 将 corpus count 从 57 改为 61 而失败；非 Story 9.2 直接失败）
- focused tests ✅（依据 Story Dev Agent Record / 用户提供状态：runtime path、release packaging、installed activation、update/repair/uninstall 等 focused suites 已通过）
- `npm run lint` ✅（依据用户提供状态：agent lint 通过）
- `npm run build` ✅（依据 Story Dev Agent Record / 用户提供状态：通过）
- `npm run release:packaging-check` ✅（依据 Story Dev Agent Record / 用户提供状态：通过）
- `git diff --check` ✅（依据 Story Dev Agent Record / 用户提供状态：通过）
- 额外复核：
  - 静态复核 install projection、files-index fixture、validation allowlist、packaging metadata、docs default resolver wording、uninstall behavior。
  - 定向复现脚本未形成独立产品结论：临时 update/repair 场景被当前 manifest/sourceDescriptor 或 customization resolver 前置错误挡住；最终 finding 以上述代码路径为证据。

## 通过项

- Python resolver scripts 在 install projection 和 fixtures 中使用 `runtime-compat-script`，未作为 `runtime-script` 或 default resolver runtime dependency。
- `validateRuntimePaths` 对 approved compat entries 放行，并保留对 `runtime-script` / legacy resolver path 的 negative behavior。
- Packaging manifest 增加 `packagedCompatibilityAssets`，两个 Python resolver source assets 的 classification 为 `runtime-compat-script` 且 `defaultRuntimeDependency: false`。
- README、CLI reference、runtime boundary docs 明确 `_speclite/scripts/resolve_*.py` 仅是 legacy compatibility / migration aid / troubleshooting asset，默认 resolver 仍是 `speclite resolve config` 与 `speclite resolve customization`。
- Story 9.1 Node-only default activation contract 的负向扫描仍覆盖 canonical source、installed mirror 和 support-side `speclite-agent-*` inventory。

## 结论

- **结论：不通过**
- **阻塞项**：Finding #1
- **建议**：进入 evaluator/fixer，修复 `runtime-compat-script` 的 explicit repair source resolution，并补充对应 focused tests 后再复审。
