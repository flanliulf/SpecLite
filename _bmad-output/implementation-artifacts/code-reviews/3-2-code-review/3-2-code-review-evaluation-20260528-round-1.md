---
Story: 3-2
Round: 1
Date: 2026-05-28
Model Used: GPT-5 Codex (gpt-5-codex)
Review Source: 3-2-code-review-summary-20260528-round-1.md
Review Model: GPT-5 Codex (gpt-5-codex)
Type: Code Review Evaluation
---

## 评估总结

对 Story 3-2 的第 1 轮 CR 代码审查结果（首轮）进行逐条评估。本轮审查提出 1 个 `patch` finding：`skill-index` completeness 当前只按 baseline entry 数量判断，无法保证 selected modules 的每个 canonical package root 都被覆盖。经独立代码验证，该发现成立，属于阻塞 Story 3.2 AC 3 的有效问题，需要进入 fixer 修复。

---

## 发现 #1 评估

### 审查原文

> **[中] Skill index completeness check can pass when a selected package root is missing**
> - 来源：blind+edge+auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

`src/validation/rules/manifest-schema.ts:209-227` 的 `validateSelectedModuleCompleteness` 只在 manifest 同时选择 `core` 和 `sdlc` 时检查 `input.skillIndex.entries.length !== CORE_SDLC_BASELINE_ENTRY_COUNT`，没有构造 selected modules 的 expected canonical package root 集合，也没有逐项比较 `moduleId`、`canonicalSkillId` 或 `sourcePackagePath`。因此只要 `entries.length` 仍为 53，即使缺少一个 selected canonical package root 并用重复或错误 root 补齐数量，该函数也会返回 `undefined`。

`src/manifest/manifest-schema.ts:140-190` 仅验证单条 skill index entry 的字段 shape 和 project-relative POSIX path，没有 array-level uniqueness、selected module root coverage 或 source inventory 对齐约束。`src/validation/rules/manifest-schema.ts:230-240` 的 identity check 只验证 `path.posix.basename(entry.sourcePackagePath) === entry.canonicalSkillId`，仍不能发现“缺少某个 expected root，但另一个合法 root 重复或替换”的情况。

Story AC 3 明确要求 selected modules 下全部 canonical package roots 必须覆盖，默认 `core` + `sdlc` baseline 必须有 53 个 entries，且缺少任一 selected package root 都必须报告 stable `manifest-schema` issue（`_bmad-output/implementation-artifacts/stories/3-2-manifest-and-index-schema-validation.md:30-36`）。当前实现满足了数量分支，但没有满足“缺少任一 selected package root”这一分支。

`test/validate-command.test.ts:245-281` 的现有回归测试只构造 `actualCount: 1` 的数量不足场景；`test/validate-command.test.ts:386-405` 的 valid projection helper 构造了 13 个 core roots 与 40 个 sdlc roots，但没有覆盖“总数仍为 53、具体 root 缺失或重复”的失败场景。因此审查指出的测试缺口也成立。

**严重性判断：偏低**

原始严重性为 `[中]`。从交付门禁看，该问题直接违反 Story AC 3，且会让 `speclite validate` 对不完整 installed projection 返回成功，属于功能缺陷和验收标准缺口。按评估模板优先级定义，应提升为 **P1 阻塞交付**，需要在进入 finalizer 前修复。

**修复建议：可行**

审查建议“用 selected module 的 canonical package root inventory 构造期望集合，按 `moduleId` + `sourcePackagePath` / `canonicalSkillId` 逐项比对，而不是仅比较总数”方向可行。仓库中已有相近实现可参考：`src/installer/ready-check.ts:224-259` 会基于 `selectedModules` 生成 expected skill entries，并用 `moduleId:canonicalSkillId` 检测缺失 root；不过 Story 3.2 的 `manifest-schema` rule 需要保持 local-only、read-only，并产出 `manifest-schema` category issue，不能直接复用 `ready-check` 的 `ide-mirror.missing-entry` issue。

建议 fixer 补充一个 focused regression：构造 53 个 entries，删除一个 expected selected root，再用重复或错误 root 补足数量，断言 `speclite validate` 输出 stable `manifest-schema.malformed-field` 或既有 taxonomy 内合适的 `manifest-schema` issue。

**误报评估：非误报**

该发现有三层来源 `blind+edge+auditor`，且源码、schema、测试与 Story AC 均能交叉验证。没有发现其他代码路径已经在 `speclite validate` 的 `manifest-schema` rule 中覆盖该 completeness contract，因此不是误报。

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | `skill-index` completeness 只按数量判断，不能发现 selected package root 缺失但总数仍为 53 | [中] | **P1** | 直接违反 Story AC 3，需补逐项 root coverage 校验与回归测试。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| - | 无 | - | - | 本轮没有适合降级为 CR TODO 的事项。 |

### 可忽略（误报）

| # | 发现 | 原始严重性 | 忽略理由 |
|---|------|----------|---------|
| - | 无 | - | 本轮未发现误报。 |

### 评估决定

- **发现 #1（`skill-index` completeness 只按数量判断）**：确认有效，升级为 P1 阻塞项。建议进入 fixer，补 selected canonical package root 逐项覆盖校验，并补充总数正确但 root 缺失的 focused regression。

## 修复执行记录

### 修复执行记录
- **Date**: 2026-05-28
- **Model Used**: GPT-5 Codex (gpt-5-codex)
- **Fix Items**: 1

#### 修复项 #1：selected canonical package root 覆盖校验

- **评估结论**: `skill-index` completeness 只按 53 个 entries 数量判断，无法发现 selected package root 缺失但总数仍正确的投影。
- **修改文件**:
  - `src/validation/rules/manifest-schema.ts`
  - `test/validate-command.test.ts`
- **关键变更**:
  - 在 `validateSelectedModuleCompleteness` 的 baseline 数量校验之后，新增 selected root 覆盖校验。
  - 对 `core+sdlc` baseline 检查 `moduleId:sourcePackagePath` 是否重复，并校验 core/root 与 sdlc/root 的实际覆盖数量仍分别为 13 和 40。
  - 对“总数仍为 53，但缺失 root 被重复 root 补齐”的场景返回 stable `manifest-schema.malformed-field` issue，保持 `category: manifest-schema` 与 `affectedPath: _speclite/_config/skill-index.json`。
  - 新增 focused regression，构造 53 个 entries，使用重复的 `core:assets/source/speclite/core-skills/core-skill-2` 替代缺失 root，断言 validate 失败并输出 stable diagnostics。
- **验证结果**:
  - `npx vitest run test/validate-command.test.ts`：通过，1 个 test file / 6 个 tests。
  - `git diff --check`：通过，无输出。
  - `git diff --check --no-index /dev/null <本轮 untracked 文件>`：通过，无输出。
