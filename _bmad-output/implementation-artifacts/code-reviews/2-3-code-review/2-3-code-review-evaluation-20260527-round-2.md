---
Story: 2-3
Round: 2
Date: 2026-05-27
Model Used: GPT-5 Codex (gpt-5-codex)
Review Source: 2-3-code-review-summary-20260527-round-2.md
Review Model: GPT-5 Codex (gpt-5-codex)
Type: Code Review Evaluation
---

## 评估总结

对 Story 2-3 的第 2 轮 CR 代码审查结果（复审）进行逐条评估。Reviewer 确认 Round 1 的 2 个 P1 修复点已生效，但提出 1 个新的 `patch` 阻塞项：`canonicalSkillId="speclite-dev-story"` 时，help index 与 phase coverage 可以同时把 `activationTarget` 错指到 `.claude/skills/other-skill/SKILL.md`，`validateMenuTargets(...)` 返回 `[]`，ReadyCheck 可返回 `ok: true`。经独立代码验证和定向复现，该发现属实，严重性判断合理，需要 fixer 修复。

---

## 上轮问题回顾确认

### Round 1 Finding #1：已修复

`src/validation/rules/menu-target.ts:23-25` 已建立 `canonicalSkillId -> installedTargets` 映射；`src/validation/rules/menu-target.ts:64-70` 会校验 help `targetIds` 和 help `activationTarget` 的 target family 是否属于该 skill 的 installed target set；`src/validation/rules/menu-target.ts:206-220` 会校验 phase coverage mapped `targetId` 是否存在于对应 `skill-index.installedTargets`。`test/menu-target-validation.test.ts:118-165` 已覆盖 `skillIndex.installedTargets=["agents"]` 但 help/phase 声明 `claude` mapped 的回归场景。

### Round 1 Finding #2：已修复

`src/installer/ready-check.ts:90-101` 会在读取可用 indexes 后调用 `validateMenuTargets` 并用 blocking `menu-target.*` issue 阻断 ReadyCheck；`src/installer/ready-check.ts:296-344` 已把 `help-index.json` / `phase-coverage.json` 的 target 语义 schema failure 映射为 reserved `menu-target.missing-target` 或 `menu-target.no-mapped-target`，而不是统一退化为 `manifest-schema.unreadable`。`test/install-progress-ready-summary.test.ts:160-267` 已覆盖 invalid `help-index.activationTarget="DS"` 返回 `menu-target.missing-target` 的 ReadyCheck regression。

### 历史 CR TODO（非阻塞）

| # | 发现 | 状态 | 评估意见 |
|---|------|------|---------|
| - | 无 | - | Round 1 没有非阻塞 CR TODO。 |

---

## 发现 #1 评估

### 审查原文

> **[中][新] `activationTarget` 可以指向另一个 canonical skill 的 installed `SKILL.md`**
> - 来源：edge+auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

`src/manifest/manifest-schema.ts:43-49` 的 `isInstalledSkillActivationTarget` 只验证路径是 project-relative POSIX，并匹配 `.claude/skills/<任意目录>/SKILL.md` 或 `.agents/skills/<任意目录>/SKILL.md`；它没有把路径中的 skill directory basename 绑定到当前 `canonicalSkillId`。

`src/validation/rules/menu-target.ts:64-70` 只从 `activationTarget` 推断 target family，并检查该 family 是否存在于 `skill-index.installedTargets`；它不解析 `.claude/skills/<basename>/SKILL.md` 中的 `<basename>`。`src/validation/rules/menu-target.ts:93-98` 的 help entry 匹配条件是相同 `canonicalSkillId`、相同 `activationTarget`，且 mapped target family 已安装；因此 help 与 phase coverage 同时错指 `.claude/skills/other-skill/SKILL.md` 时，会内部自洽。`src/validation/rules/menu-target.ts:187-220` 对 phase coverage mapped target 也只检查 activation target shape 与 `targetId` 是否已安装，未校验 `activationTarget` 是否指向 `row.canonicalSkillId` 的 installed entry。

ReadyCheck 的后续 IDE mirror existence check 也不会补上该语义：`src/installer/ready-check.ts:154-160` 使用 `skill-index.canonicalSkillId` 计算并检查 `.claude/skills/speclite-dev-story/SKILL.md` 是否存在，但没有验证 help/phase coverage 中声明的 `activationTarget` 是否等于该 canonical skill 的 installed `SKILL.md`。

独立定向复现确认：构造 `skillIndex.entries[0].canonicalSkillId="speclite-dev-story"`、`installedTargets=["claude"]`，但 help index 与 phase coverage 的 `activationTarget` 均为 `.claude/skills/other-skill/SKILL.md`，`validateMenuTargets(...)` 实际输出 issue id 列表为 `[]`。在临时项目中同时创建 `.claude/skills/speclite-dev-story/SKILL.md` 和 `.claude/skills/other-skill/SKILL.md` 后，使用相同 indexes 调用 `runReadyCheck(...)`，实际返回 `ok: true`。

**严重性判断：合理**

Story 2.3 AC 1 明确要求 activation target 必须指向 installed entry 中该 canonical skill 的 `SKILL.md`；AC 2 明确要求每个 help/menu/phase entry 必须解析到且仅解析到一个 installed canonical skill entry。当前实现允许 `canonicalSkillId="speclite-dev-story"` 的 help/phase entry 激活 `.claude/skills/other-skill/SKILL.md`，这会让 installed-state validation 与 ReadyCheck 接受错误 skill 的 activation protocol。原始 [中] 严重性合理，评估后作为 P1 阻塞项处理。

**修复建议：可行**

建议在 `validateMenuTargets` 中集中解析 installed target path 的 target id 与 skill directory basename，并校验 basename 必须等于对应 `canonicalSkillId`。help entry 的 `activationTarget` 应等于由 `targetId + canonicalSkillId` 派生的 installed `SKILL.md` path；phase coverage mapped target 的 `entryPath` 与 `activationTarget` 也应同时指向 `row.canonicalSkillId` 对应的 installed entry。不一致时可使用 reserved `menu-target.missing-target`，并补充 focused tests 覆盖 help/phase 同时错指 `other-skill` 时 validator 返回 blocking issue、ReadyCheck 不通过。

**误报评估：非误报**

该发现不依赖独立 `skill-index.ts`、`help-index.ts`、`files-index.ts` 或 `phase-coverage.ts` split files。问题存在于当前集中式 `manifest-schema.ts`、`validateMenuTargets` 和 ReadyCheck 的实际语义中，符合用户修订后的 functional anchor 标准。

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | `activationTarget` 可以指向另一个 canonical skill 的 installed `SKILL.md` | [中] | **P1** | `canonicalSkillId` 未与 installed path basename 绑定，导致 validator 和 ReadyCheck 接受跨 skill 错指，违反 AC 1 / AC 2。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| - | 无 | - | - | 本轮没有建议延迟处理的非阻塞项。 |

### 可忽略（误报）

| # | 发现 | 原始严重性 | 忽略理由 |
|---|------|----------|---------|
| - | 无 | - | 本轮发现非误报。 |

### 评估决定

- **发现 #1（`activationTarget` 可以指向另一个 canonical skill 的 installed `SKILL.md`）**：确认有效，需要 fixer 修复。修复应保持集中式 manifest/index helper 模式，不要求新增独立 split files；重点是把 `activationTarget` / `entryPath` 中的 installed skill directory basename 与对应 `canonicalSkillId` 绑定，并补充 validator 与 ReadyCheck regression。
- **评估结论**：Story 2.3 CR round 2 不通过；需要进入 fixer 步骤处理 1 个 P1 阻塞项。

## 修复执行记录

### 修复执行记录

- **Date**: 2026-05-27
- **Model Used**: GPT-5 Codex (gpt-5-codex)
- **Fix Items**: 1

#### 修复项 #1：cross-skill activation target 错指

- **状态**：已修复。
- **修改文件**：
  - `src/validation/rules/menu-target.ts`
  - `test/menu-target-validation.test.ts`
  - `test/install-progress-ready-summary.test.ts`
- **修复摘要**：在 `validateMenuTargets` 中增加 installed skill path 解析，绑定 help `activationTarget`、phase mapped `entryPath` 与 `activationTarget` 的 target family / skill directory basename；当 basename 与对应 `canonicalSkillId` 不一致时返回 blocking `menu-target.missing-target`，并记录 `reason="skill-id-mismatch"`。
- **回归覆盖**：新增 validator regression，覆盖 `canonicalSkillId="speclite-dev-story"` 但 help/phase 同时错指 `.claude/skills/other-skill/SKILL.md`；新增 ReadyCheck regression，覆盖临时项目中真实存在 `speclite-dev-story` 与 `other-skill` mirrors 时仍必须因 `menu-target.missing-target` 失败。
- **验证命令**：
  - `npx vitest run test/menu-target-validation.test.ts test/install-progress-ready-summary.test.ts`
  - `npm run build`
  - `git diff --check -- src/validation/rules/menu-target.ts test/menu-target-validation.test.ts test/install-progress-ready-summary.test.ts`
  - `npm test`
- **验证结果**：targeted Vitest 2 files / 13 tests 通过；build 通过；diff whitespace 检查通过；全量 Vitest 14 files / 82 tests 通过。
