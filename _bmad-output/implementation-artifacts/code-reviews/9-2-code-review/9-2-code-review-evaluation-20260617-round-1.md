---
Story: 9-2
Round: 1
Date: 2026-06-17
Model Used: GPT-5 Codex (gpt-5-codex)
Review Source: 9-2-code-review-summary-20260617-round-1.md
Review Model: GPT-5 Codex (gpt-5-codex)
Type: Code Review Evaluation
---

## 评估总结

对 Story 9-2 的第 1 轮 CR 代码审查结果（首轮）进行逐条评估。审查结果提出 1 个阻塞发现：explicit repair 无法恢复 fresh install 投影的 Python compatibility scripts。经独立代码验证，该发现有效，属于 AC4 repair ownership lifecycle 缺口，建议本轮 FAIL 并进入 fixer。

---

## 发现 #1 评估

### 审查原文

> **[高] explicit repair 无法恢复 fresh install 投影的 Python compatibility scripts**
> - 来源：edge+auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

`src/installer/runtime-structure.ts:176-201` 在 install 阶段会把 `COMPAT_RUNTIME_SCRIPTS` 写入 `_speclite/scripts/{scriptName}`，并把 files-index entry 记录为 `ownership: "installer-owned"`、`artifactKind: "runtime-compat-script"`、`sourceRef: compatScript.sourceRef`。fixture 也确认 fresh install 后两个 compatibility scripts 的 `sourceRef` 是 `assets/source/speclite/scripts/resolve_config.py` 与 `assets/source/speclite/scripts/resolve_customization.py`，见 `test/fixtures/fresh-install-empty-project/expected/installed-state/files-index-full.json:64-82`。

repair 规划在 installer-owned drift 时调用 `readRepairCandidateBytes({ sourceRef: entry.sourceRef })`；读取不到就把该 entry 转成 `missing-source-evidence` conflict，见 `src/update/update-plan.ts:217-225`。但 `readRepairCandidateBytes` 当前只委托 `readSourceEvidence`，而 `readSourceEvidence` 只接受目标项目内的 project-relative path 并从 `projectRoot/sourceRef` 读取，见 `src/update/update-plan.ts:539-562`。fresh install 目标项目通常不包含 `assets/source/speclite/scripts/resolve_*.py`，因此删除、篡改或 mode drift 后，repair 无法从当前 SpecLite package 的 bundled source 恢复这些 installer-owned compatibility scripts。

fallback 情况也成立：`readCompatibilityScript` 在 canonical source 缺脚本时会从 `packageRoot/assets/source/speclite/scripts/{scriptName}` 读取 bytes，但记录 `sourceRef: "bundled-runtime-compat:scripts/{scriptName}"`，见 `src/installer/runtime-structure.ts:450-462`。该 `sourceRef` 不是 project-relative path，`readSourceEvidence` 会直接返回 `undefined`，因此 fallback sourceRef 也不可 repair。

现有测试确实覆盖了 fresh install 投影与 metadata：`test/runtime-structure.test.ts:102-176` 断言两个 resolver scripts 被写入并记录为 `runtime-compat-script`。validation allowlist 也已覆盖：`test/runtime-path-validation.test.ts:130-186` 允许 approved compatibility scripts，同时拒绝 `runtime-script`。但现有 update/repair 测试只覆盖一般 missing source evidence、示例 repair plan 和 ownership 分类，没有覆盖 fresh install 后对 `_speclite/scripts/resolve_config.py` / `resolve_customization.py` 的 drift 或 missing repair。`test/update-planning.test.ts:637-671` 与 `test/update-planning.test.ts:839-868` 反而说明 missing project-relative source evidence 会阻塞 update/repair；这正是当前 compatibility script sourceRef 会触发的路径。

**严重性判断：合理**

Story 9-2 AC4 明确要求 normal update、explicit `update --repair` 和 uninstall 都要把 compatibility assets 当作 installer-owned asset，并且 explicit repair 只可恢复 installer-owned compatibility scripts，见 `_bmad-output/implementation-artifacts/stories/9-2-python-resolver-compatibility-asset-projection.md:35-39`。当前实现让 install、validate、uninstall 侧基本闭环，但 repair 源解析仍缺少 package-bundled compatibility asset 的恢复能力，导致 AC4 的 repair 部分不能成立。因此 `[高]` / P1 阻塞交付合理。

**修复建议：可行**

建议范围准确：只需要为 `runtime-compat-script` 增加明确的 repair source resolution，并补充 focused tests。实现上应让 repair 在 entry 为 installer-owned compatibility script 且 `sourceRef` 为 `assets/source/speclite/scripts/resolve_*.py` 或 `bundled-runtime-compat:scripts/resolve_*.py` 时，从当前 SpecLite package bundled source 读取 canonical bytes；同时保持 human-owned、workflow-owned、IDE mirror 和普通 project-relative source evidence 的现有边界不变。

**误报评估：非误报**

该发现有明确代码路径和 AC 对应关系。没有发现已有代码或测试能证明 fresh install 投影的 compatibility scripts 可被 `update --repair` 从 package bundled source 恢复。

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | explicit repair 无法恢复 fresh install 投影的 Python compatibility scripts | [高] | **P1** | AC4 要求 explicit repair 可恢复 installer-owned compatibility scripts，当前 repair source resolution 无法读取 package bundled compatibility source。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|

### 可忽略（误报）

| # | 发现 | 原始严重性 | 忽略理由 |
|---|------|----------|---------|

### 评估决定

- **发现 #1（explicit repair 无法恢复 fresh install 投影的 Python compatibility scripts）**：确认有效，阻塞 Story 9-2 交付。本轮 CR 评估结论为 **FAIL**，需要进入 fixer。
- **fixer 精确范围**：仅修改 repair source resolution 对 `runtime-compat-script` 的 canonical bytes 读取逻辑，并新增 focused tests 覆盖 fresh installed project 中删除或篡改 `_speclite/scripts/resolve_config.py` / `_speclite/scripts/resolve_customization.py` 后 `speclite update --repair --yes` 可恢复；同时覆盖 `bundled-runtime-compat:scripts/resolve_*.py` fallback sourceRef repair 行为。不得改变默认 activation resolver、human-owned/workflow-owned 边界、normal update hidden repair 语义或 unrelated docs/progress files。
- **用户裁决**：无需用户裁决。该问题是 AC4 明确要求下的实现缺口，修复方向明确。

## 修复执行记录

### 修复执行记录
- **Date**: 2026-06-17
- **Model Used**: GPT-5 Codex (gpt-5-codex)
- **Fix Items**: 1

#### 修复项 #1：runtime-compat-script repair source resolution

- **状态**：已完成。
- **修改文件**：
  - `src/update/update-plan.ts`
  - `test/update-planning.test.ts`
- **修复摘要**：
  - 为 `runtime-compat-script` 的 repair candidate 增加 allowlist sourceRef 解析，仅接受 `assets/source/speclite/scripts/resolve_config.py`、`assets/source/speclite/scripts/resolve_customization.py`、`bundled-runtime-compat:scripts/resolve_config.py`、`bundled-runtime-compat:scripts/resolve_customization.py`。
  - explicit repair 在上述 sourceRef 命中时从当前 SpecLite package 的 `assets/source/speclite/scripts/` 读取 canonical bytes；未命中时保持原有 project-relative source evidence 逻辑。
  - 新增 focused tests 覆盖 fresh installed project 中删除或篡改两个 resolver scripts 后 `update --repair --yes` 可恢复，并覆盖 `bundled-runtime-compat:scripts/resolve_*.py` fallback sourceRef repair 行为。
- **验证结果**：
  - `npm test -- --run test/update-planning.test.ts`：通过，1 个测试文件、22 个测试用例全部通过。
