---
Story: 9-2
Round: 2
Date: 2026-06-17
Model Used: GPT-5 Codex (gpt-5-codex)
Review Source: 9-2-code-review-summary-20260617-round-2.md
Review Model: GPT-5 Codex (gpt-5-codex)
Type: Code Review Evaluation
---

## 评估总结

对 Story 9-2 的第 2 轮 CR 代码审查结果（复审）进行逐条评估。审查结果确认 Round 1 Finding #1 的核心修复已落地，并提出 1 个新阻塞发现：explicit repair 的 `runtime-compat-script` allowlist 只绑定 `sourceRef`，未绑定目标 path。经独立代码验证，该新发现有效，属于 AC4 repair 边界缺口，建议本轮 FAIL 并进入 fixer。

---

## 上轮问题回顾确认

### Round 1 Finding #1：已关闭

Round 1 evaluation 要求 fixer 仅修复 `runtime-compat-script` repair source resolution，并补充 fresh installed project 中删除或篡改 `_speclite/scripts/resolve_config.py` / `_speclite/scripts/resolve_customization.py` 后 `speclite update --repair --yes` 可恢复的 focused tests，同时覆盖 `bundled-runtime-compat:scripts/resolve_*.py` fallback sourceRef repair 行为。

`src/update/update-plan.ts:564-591` 已新增 `readRepairCandidateBytes` 对 `runtime-compat-script` 的 bundled source resolution：当 `artifactKind === "runtime-compat-script"` 且 `sourceRef` 能解析为 `resolve_config.py` 或 `resolve_customization.py` 时，从 `PACKAGE_ROOT/assets/source/speclite/scripts/{scriptName}` 读取 canonical bytes；未命中时回退到既有 `readSourceEvidence`。`src/update/update-plan.ts:223-241` 和 `src/update/update-plan.ts:992-1017` 已在 planning 与 apply repair 阶段传入 `entry.artifactKind`，因此原先 package-bundled compatibility source 无法读取的问题已关闭。

测试侧，`test/update-planning.test.ts:911-964` 覆盖 fresh install runtime compatibility scripts deleted / drifted 后可由 explicit repair 从 bundled package source 恢复；`test/update-planning.test.ts:966-1018` 覆盖 `bundled-runtime-compat:scripts/resolve_*.py` fallback sourceRef 同样可恢复。该覆盖与 Round 1 fixer 精确范围一致。

### 历史 CR TODO（非阻塞）

| # | 发现 | 状态 | 评估意见 |
|---|------|------|---------|
| 无 | 无 | 无 | Round 2 reviewer 未列出历史 CR TODO。 |

---

## 发现 #1 评估

### 审查原文

> **[中][新] explicit repair 的 compat allowlist 未绑定目标 path，可把 Python resolver 写入非 resolver script path**
> - 来源：edge+auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

`src/update/update-plan.ts:223-241` 在 repair planning 中对所有 `installer-owned-drift` entry 调用 `readRepairCandidateBytes`，并把生成的 repair action `affectedPath` 设置为 `entry.path`。该调用只传入 `projectRoot`、`sourceRef`、`artifactKind`，没有传入或校验 `entry.path`。

`src/update/update-plan.ts:564-591` 的 `readRepairCandidateBytes` 只检查 `artifactKind === "runtime-compat-script"`，再由 `compatRuntimeScriptName(sourceRef)` 从 canonical 或 `bundled-runtime-compat:` sourceRef 中解析脚本名；只要脚本名属于 `COMPAT_RUNTIME_SCRIPTS`，就读取 bundled resolver bytes。这里没有校验目标 path 必须与 resolver script 匹配。

`src/update/update-plan.ts:992-1017` 在 apply repair 阶段再次按 `entry.sourceRef` 和 `entry.artifactKind` 读取 source bytes，然后把 bytes 写入 `action.affectedPath`。因此如果 files-index entry 是 schema-valid、`ownership: "installer-owned"`、`artifactKind: "runtime-compat-script"`，且 path 是 `_speclite/scripts/not_a_resolver.py`、sourceRef 是 `assets/source/speclite/scripts/resolve_config.py`，当前逻辑会把 `resolve_config.py` bytes 写入非 resolver target path。

该路径能进入 repair 的前置条件也成立：`src/update/ownership-model.ts:103-112` 将 `_speclite/scripts/*` 归类为 installer-owned；`src/update/conflict-detector.ts:20-61` 对 installer-owned hash drift 返回 `installer-owned-drift` conflict。现有 `test/update-planning.test.ts:911-1018` 只覆盖 approved resolver target paths，未覆盖非 resolver target path 的 negative case。

`src/validation/rules/runtime-path.ts:109-117` 已有更严格的 approved compatibility asset 判断，要求 path 匹配 `_speclite/scripts/resolve_(config|customization).py` 且 sourceRef 匹配 resolver source。但本次 repair planning/apply 路径没有在写入前复用该 target path 约束，所以 reviewer 指出的 bypass 成立。

**严重性判断：偏低**

Reviewer 标为 `[中]`，但评估后应按 P1 阻塞处理。Story AC4 明确要求 explicit repair 只可恢复 installer-owned compatibility scripts，见 `_bmad-output/implementation-artifacts/stories/9-2-python-resolver-compatibility-asset-projection.md:35-40`。当前行为允许 explicit repair 将 allowlisted resolver bytes 写入非 compatibility script target path，破坏的是本 Story 的核心 repair 边界，而不是单纯防御性优化。虽然风险限定在 malformed-but-schema-valid installed metadata 下，仍然阻塞 Story 9-2 交付。

**修复建议：可行**

Reviewer 建议将 repair allowlist 同时绑定 `sourceRef` 和 target path，方向准确。实现上应让 `readRepairCandidateBytes` 或其调用者接收 `entry.path` / `action.affectedPath`，只允许以下成对组合读取 bundled bytes：

- `entry.path === "_speclite/scripts/resolve_config.py"` 且 `sourceRef` 指向 `resolve_config.py`
- `entry.path === "_speclite/scripts/resolve_customization.py"` 且 `sourceRef` 指向 `resolve_customization.py`

同时补充 focused negative test：`runtime-compat-script` entry 若 target path 不是上述 approved resolver paths，即使 sourceRef allowlisted，也不得生成 repair action 或写入，应该保持 conflict / `missing-source-evidence` 等安全阻断结果。

**误报评估：非误报**

该发现有明确代码路径、Story AC4 对应关系和测试缺口。未发现当前 repair planning/apply 在写入前对 `runtime-compat-script` target path 与 sourceRef 做成对校验。

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | explicit repair 的 compat allowlist 未绑定目标 path | [中] | **P1** | AC4 要求 explicit repair 只可恢复 compatibility scripts；当前逻辑可把 allowlisted resolver bytes 写入非 resolver `_speclite/scripts/*` entry。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|

### 可忽略（误报）

| # | 发现 | 原始严重性 | 忽略理由 |
|---|------|----------|---------|

### 评估决定

- **Round 1 Finding #1（explicit repair 无法恢复 fresh install 投影的 Python compatibility scripts）**：确认已关闭。当前代码和 focused tests 已覆盖 canonical sourceRef 与 `bundled-runtime-compat:*` fallback sourceRef 的 bundled source repair。
- **发现 #1（explicit repair 的 compat allowlist 未绑定目标 path）**：确认有效，阻塞 Story 9-2 交付。本轮 CR 评估结论为 **FAIL**，需要进入 fixer。
- **fixer 精确范围**：仅收紧 `runtime-compat-script` repair source resolution 的 target path allowlist，使 sourceRef 与 target path 必须成对匹配；新增 focused negative test 覆盖非 resolver `_speclite/scripts/*` target path 即使带 allowlisted resolver sourceRef 也不得被 repair 写入。不得改变 default activation resolver、human-owned/workflow-owned 保护、normal update hidden repair 语义、IDE mirror repair、uninstall 行为或 unrelated docs/progress files。
- **用户裁决**：无需用户裁决。问题和修复范围均由 Story AC4 直接限定。

## 修复执行记录

### 修复执行记录
- **Date**: 2026-06-17
- **Model Used**: GPT-5 Codex (gpt-5-codex)
- **Fix Items**: 1

#### Fix Item 1：收紧 runtime-compat-script repair target/sourceRef 配对

- **状态**: 已完成
- **修改文件**:
  - `src/update/update-plan.ts`
  - `test/update-planning.test.ts`
- **修复内容**:
  - `readRepairCandidateBytes` 新增 `targetPath` 入参，planning 阶段传入 `entry.path`，apply 阶段传入 `action.affectedPath`。
  - `runtime-compat-script` repair source resolution 只允许以下成对组合读取 bundled resolver bytes：
    - `_speclite/scripts/resolve_config.py` + `resolve_config.py` sourceRef
    - `_speclite/scripts/resolve_customization.py` + `resolve_customization.py` sourceRef
  - 对非 resolver `_speclite/scripts/*` target path，即使 `sourceRef` 是 allowlisted resolver，也返回 `undefined` 并保留现有 `missing-source-evidence` 阻断结果，不生成 repair action，不写入文件。
  - 新增 focused negative test `keeps non-resolver runtime compatibility script targets blocked even with resolver sourceRefs`，覆盖非 resolver target path 不得被 repair 写入。
- **验证结果**:
  - `npm test -- test/update-planning.test.ts`：通过，1 个 test file / 23 个 tests passed。
  - `git diff --check`：通过，无 whitespace 错误。
