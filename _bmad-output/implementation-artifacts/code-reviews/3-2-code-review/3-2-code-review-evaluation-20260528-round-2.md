---
Story: 3-2
Round: 2
Date: 2026-05-28
Model Used: GPT-5 Codex (gpt-5-codex)
Review Source: 3-2-code-review-summary-20260528-round-2.md
Review Model: GPT-5 Codex (gpt-5-codex)
Type: Code Review Evaluation
---

## 评估总结

对 Story 3-2 的第 2 轮 CR 代码审查结果（复审）进行逐条评估。本轮审查提出 1 个 `patch` finding：selected canonical package root 覆盖校验仍未按 expected canonical package root inventory 做逐项 set equality 校验。经独立代码验证，该发现成立。Round 1 修复覆盖了 duplicate root 补齐数量的场景，但仍未覆盖“缺失 expected root、由另一个唯一但非 expected root 补齐”的同 count 场景，因此仍需要进入 fixer 继续修复。

---

## 上轮问题回顾确认

### Round 1 selected canonical package root 覆盖校验：部分修复，仍未完整关闭

Round 1 评估确认的问题是：`skill-index` completeness 不应只按 `53` 个 entries 数量判断，而必须保证 selected modules 下全部 canonical package roots 都被覆盖。当前源码在 `src/validation/rules/manifest-schema.ts:220-230` 已在 `entries.length === 53` 后调用 `validateSelectedModuleRootCoverage`，并在 `src/validation/rules/manifest-schema.ts:235-277` 检查 duplicate `moduleId:sourcePackagePath` 和 `core` / `sdlc` unique root 数量。

但是，该 helper 没有读取或构造 expected canonical package root inventory，也没有比较 expected set 与 actual set。它只证明 actual set 内没有重复且分组数量为 `13` / `40`，不能证明 actual set 等于 selected module 应包含的 canonical package roots。Story AC 3 要求“对 selected modules，`skill-index.json` 必须覆盖该模块下全部 canonical package roots；默认 `core` + `sdlc` baseline 必须有 `53` 个 entries，缺少任一 selected package root 都必须报告 stable `manifest-schema` issue”（`_bmad-output/implementation-artifacts/stories/3-2-manifest-and-index-schema-validation.md:30-36`）。

### 历史 CR TODO（非阻塞）

| # | 发现 | 状态 | 评估意见 |
|---|------|------|---------|
| - | 无 | - | Round 1 未产生 CR TODO，本轮也不新增非阻塞 TODO。 |

---

## 发现 #1 评估

### 审查原文

> **[中] Selected root 覆盖校验仍未按 canonical package root inventory 逐项比对**
> - 来源：blind+edge+auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

当前 `validateSelectedModuleCompleteness` 只在 manifest 同时选择 `core` 与 `sdlc` 时先校验 `input.skillIndex.entries.length !== CORE_SDLC_BASELINE_ENTRY_COUNT`，然后调用 root coverage helper（`src/validation/rules/manifest-schema.ts:211-230`）。这一步仍以默认 baseline 数量为入口。

`validateSelectedModuleRootCoverage` 的实现只维护 `seenRoots` 和 `uniqueRootsByModule`：它会发现重复的 `moduleId:sourcePackagePath`，并验证 `coreRootCount === 13`、`sdlcRootCount === 40`（`src/validation/rules/manifest-schema.ts:235-277`）。这些检查不能证明每个 expected canonical package root 都出现了；如果一个 expected core root 缺失，同时另一个唯一但不属于 expected canonical inventory 的 core root 出现，`seenRoots` 无重复、`coreRootCount === 13`、总数 `53` 都仍可成立。

现有 focused regression 只覆盖 duplicate root 替换场景：`test/validate-command.test.ts:287-323` 将 `entries[0]` 替换为 `entries[1]`，并断言 `duplicateRoot`。该测试没有覆盖“总数为 53、无 duplicate、模块数量正确，但 actual root set 与 expected canonical root set 不相等”的场景。`test/validate-command.test.ts:424-443` 的 helper 也使用 synthetic `core-skill-*` / `sdlc-skill-*` roots 构造 baseline fixture，而不是从 source-side canonical package root inventory 构造 expected set。

仓库中已有相近的 expected inventory 思路可作为修复参考：`src/installer/ready-check.ts:224-241` 会基于 selected modules 的 `packageRoots` 生成 expected skill entries；`src/installer/ready-check.ts:244-258` 再检查 `skillIndex` 是否缺失 expected `moduleId:canonicalSkillId`。不过 ready-check 产出的是 `ide-mirror` category，Story 3.2 的 validate rule 仍需要在 `manifest-schema` category 内实现 local-only、stable issue 的 set equality。

**严重性判断：偏低**

原始严重性为 `[中]`。该缺口直接违反 Story AC 3，并会让 `speclite validate` 接受数量正确但 canonical root inventory 错误的 installed-state projection。按评估模板，这属于功能缺陷和验收门禁缺口，应评为 **P1 阻塞交付**，不是可延后 TODO。

**修复建议：可行**

审查建议可行：在 Story 3.2 范围内构造 selected modules 的 expected canonical package root set，并与 `skill-index.entries` 的 actual set 做 set equality。最小修复应至少覆盖：

- expected root 缺失；
- unexpected root 出现；
- duplicate root；
- 同 count replacement（总数、unique count、module count 都正确但 set 不相等）。

修复仍应保持 local-only/read-only，不访问 remote source、registry、cache 或 update/repair pipeline；issue 应保持 stable `manifest-schema.malformed-field`、`category: "manifest-schema"`、`affectedPath: "_speclite/_config/skill-index.json"`。

**误报评估：非误报**

该 finding 有 `blind+edge+auditor` 三层来源。源码路径、现有 regression 和 Story AC 3 能相互印证；未发现当前 `speclite validate` 的 `manifest-schema` rule 已经通过其他路径执行 expected canonical package root set equality。因此不是误报。

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | Selected root 覆盖校验仍未按 canonical package root inventory 逐项 set equality | [中] | **P1** | 当前逻辑可被唯一错误 root 替换场景绕过，仍违反 Story AC 3。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| - | 无 | - | - | 本轮没有适合降级为 CR TODO 的事项。 |

### 可忽略（误报）

| # | 发现 | 原始严重性 | 忽略理由 |
|---|------|----------|---------|
| - | 无 | - | 本轮未发现误报。 |

### 评估决定

- **发现 #1（Selected root 覆盖校验仍未按 canonical package root inventory 逐项 set equality）**：确认有效，评为 P1 阻塞项。建议进入 fixer，补 expected canonical package root inventory 与 actual skill-index root set 的 set equality 校验，并补充“总数 53、无 duplicate、module count 正确但 expected root 被唯一 unexpected root 替换”的 focused regression。

## 修复执行记录

### 修复执行记录
- **Date**: 2026-05-28
- **Model Used**: GPT-5 Codex (gpt-5-codex)
- **Fix Items**: 1

#### 修复项 #1：selected canonical package root expected set equality

- **评估结论**: `validateSelectedModuleRootCoverage` 只检查 duplicate root 与 `core`/`sdlc` unique count，无法发现总数 53、无 duplicate、module count 正确但 expected root 被唯一 unexpected root 替换的投影。
- **修改文件**:
  - `src/validation/rules/manifest-schema.ts`
  - `test/validate-command.test.ts`
- **关键修改**:
  - 在 manifest-schema rule 中加入当前 `core+sdlc` selected baseline 的 expected canonical package root inventory。
  - 将 actual `skill-index.entries` 的 `moduleId:sourcePackagePath` set 与 expected set 做 equality，比对缺失 root 与 unexpected root，并保持 stable `manifest-schema.malformed-field`、`category: manifest-schema`、`affectedPath: _speclite/_config/skill-index.json`。
  - 将 focused fixture helper 改为真实 canonical package root inventory，并新增同 count replacement regression：总数 53、无 duplicate、`core=13`、`sdlc=40`，但缺失 `speclite-advanced-elicitation` 且出现唯一 `speclite-unexpected-core-skill`。
- **验证结果**:
  - `npm test -- test/validate-command.test.ts`：通过，1 个 test file / 7 个 tests。
  - `npm run build`：通过。
  - `git diff --check`：通过，无 whitespace error。
- **状态**: 修复成功，可进入 reviewer 复审。
