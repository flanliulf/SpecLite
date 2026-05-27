---
Story: 2-3
Round: 1
Date: 2026-05-27
Model Used: GPT-5 Codex (gpt-5-codex)
Review Source: 2-3-code-review-summary-20260527-round-1.md
Review Model: GPT-5 Codex (gpt-5-codex)
Type: Code Review Evaluation
---

## 评估总结

对 Story 2-3 的第 1 轮 CR 代码审查结果（首轮）进行逐条评估。Reviewer 提出 2 个 `patch` 阻塞项，分别涉及 `skill-index.installedTargets` 与 mapped phase/help target 的一致性缺口、ReadyCheck 对 invalid activation target 的 issue 分类缺口。经独立代码验证和定向复现，2 个发现均属实，严重性判断合理，均需要 fixer 修复。

---

## 发现 #1 评估

### 审查原文

> **[中] `validateMenuTargets` 未校验 mapped target 是否存在于 `skill-index.installedTargets`**
> - 来源：edge+auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

`src/validation/rules/menu-target.ts:16-18` 只从 `skillIndex.entries` 建立 `knownSkillIds`，并从 `phaseCoverage` 收集 mapped targets；`src/validation/rules/menu-target.ts:55-59` 对 help entry 的匹配条件只有 `canonicalSkillId` 与 `activationTarget`，没有检查该 mapped target 的 `targetId` 是否包含在对应 skill index entry 的 `installedTargets` 中。`src/validation/rules/menu-target.ts:112-165` 对 phase coverage row 只检查 mapped 数量、重复 mapped key、空 mapped target 与 activation target path shape，也没有把 `row.ideTargets[].targetId` 反查到 `skill-index.installedTargets`。

独立定向复现确认：构造 `skillIndex.installedTargets=["agents"]`，但 `helpIndex` 与 `phaseCoverage` 均声明 `.claude/skills/speclite-dev-story/SKILL.md` 为 mapped，`validateMenuTargets(...)` 返回 `[]`。这说明未安装 target 可以被 help/phase coverage 伪装为已 mapped。

**严重性判断：合理**

Story 2.3 AC 2 要求每个 help/menu/phase entry 必须解析到且仅解析到一个 installed canonical skill entry，AC 4 要求缺失覆盖不可伪造并使用 reserved issue ids，AC 8 要求 focused tests 覆盖 activation target uniqueness 与 missing/no-mapped diagnostics。当前实现允许 installed-state projections 内部自洽但违背 `skill-index.installedTargets` 真值，属于验证语义缺口，会让 ReadyCheck 或 validation 接受不存在/未登记的 target 覆盖。因此原始 [中] 严重性合理，评估后作为 P1 阻塞项处理。

**修复建议：可行**

建议在 `validateMenuTargets` 中建立 `canonicalSkillId -> installedTargets` 映射，并对每个 mapped phase target 校验 `target.targetId` 是否属于对应 skill entry 的 installed target set。对 help index 也应校验其 `targetIds` 和 `activationTarget` 指向的 target 与 skill index installed target set 一致；不一致时返回 `menu-target.missing-target` 或 `menu-target.no-mapped-target` 这类已有 reserved issue id。还需要补充 focused test 覆盖 `skillIndex.installedTargets=["agents"]` 但 help/phase 声明 `claude` mapped 的场景。

**误报评估：非误报**

该发现不依赖独立 `skill-index.ts`、`help-index.ts`、`files-index.ts` 或 `phase-coverage.ts` split files；问题存在于当前集中式 `manifest-schema.ts` + `validateMenuTargets` helper 的实际语义中，符合用户修订后的 functional anchor 标准。

---

## 发现 #2 评估

### 审查原文

> **[中] ReadyCheck 会把 invalid activation target 提前归类为 `manifest-schema.unreadable`**
> - 来源：blind+auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

`src/installer/ready-check.ts:90-101` 只有在 `readRequiredIndexes(...)` 成功读取并 parse indexes 后才调用 `validateMenuTargets(...)`。但 `src/installer/ready-check.ts:262-269` 对 `help-index.json`、`phase-coverage.json` 使用严格 schema `safeParse`，一旦 `activationTarget` 不满足 `InstalledSkillActivationTargetSchema`，直接返回 `createInvalidIndexIssue(...)`。`src/installer/ready-check.ts:295-304` 的 `createInvalidIndexIssue` 固定产出 `manifest-schema.unreadable`，因此不会进入 `src/validation/rules/menu-target.ts:37-50` 中为 invalid help activation target 准备的 `menu-target.missing-target` 诊断。

独立定向复现确认：构造可读 manifest、skill-index、files-index、phase-coverage，并让 `help-index.json` 的 `activationTarget` 为 `"DS"`，`runReadyCheck(...)` 返回 `issueId: "manifest-schema.unreadable"`，`affectedPath: "_speclite/_config/help-index.json"`。

**严重性判断：合理**

Story 2.3 AC 4 明确要求缺失 coverage 或 missing activation target 使用 reserved issue ids，例如 `menu-target.no-mapped-target`、`menu-target.missing-target`、`menu-target.ambiguous-target` 或 `menu-target.unknown-skill`。当前 ReadyCheck 把语义上属于 menu target 的 invalid activation target 报为 generic manifest/schema unreadable，会破坏自动化诊断分类边界，也让用户无法区分文件不可读、schema 损坏和 activation target 语义错误。原始 [中] 严重性合理，评估后作为 P1 阻塞项处理。

**修复建议：可行**

可以在 ReadyCheck 的 index 读取路径中为 help/phase coverage 的 activation target、entry path、status vocabulary 等 Story 2.3 menu-target 语义错误提供专门映射，返回 `menu-target.missing-target` 或 `menu-target.no-mapped-target` 等 reserved issue id。另一种可行路径是对 help/phase coverage 先用宽松结构读取，再调用 `validateMenuTargets` 做语义诊断，最后保留严格 schema gate；但必须确保 malformed JSON、缺失文件或整体不可读仍返回 `manifest-schema.unreadable`。

**误报评估：非误报**

该发现直接来自 ReadyCheck 当前调用顺序和 schema parse 早退行为，与 functional anchor 是否拆分为独立文件无关。集中式 builder/helper 可以继续承载 manifest/index 能力，但 ReadyCheck 需要保留 Story 2.3 约定的 issue taxonomy。

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | `validateMenuTargets` 未校验 mapped target 是否存在于 `skill-index.installedTargets` | [中] | **P1** | 未安装 target 可被 help/phase coverage 伪装为 mapped，违反 AC 2 / AC 4 / AC 8。 |
| 2 | ReadyCheck 会把 invalid activation target 提前归类为 `manifest-schema.unreadable` | [中] | **P1** | ReadyCheck schema 早退绕过 `menu-target.missing-target` reserved diagnostic，违反 AC 4 / AC 8。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| - | 无 | - | - | 本轮没有建议延迟处理的非阻塞项。 |

### 可忽略（误报）

| # | 发现 | 原始严重性 | 忽略理由 |
|---|------|----------|---------|
| - | 无 | - | 本轮 2 个发现均非误报。 |

### 评估决定

- **发现 #1（`validateMenuTargets` 未校验 mapped target 是否存在于 `skill-index.installedTargets`）**：确认有效，需要 fixer 修复。修复应保持集中式 manifest/index helper 模式，不要求新增独立 split files。
- **发现 #2（ReadyCheck 会把 invalid activation target 提前归类为 `manifest-schema.unreadable`）**：确认有效，需要 fixer 修复。修复应保留 missing/unreadable JSON 的 `manifest-schema.unreadable`，仅将 activation target 等 Story 2.3 menu-target 语义错误映射到 reserved menu-target issue ids。
- **评估结论**：Story 2.3 CR round 1 不通过；需要进入 fixer 步骤处理 2 个 P1 阻塞项。

## 修复执行记录

### 修复执行记录
- **Date**: 2026-05-27
- **Model Used**: GPT-5 Codex (gpt-5-codex)
- **Fix Items**: 2

#### 修复范围

- **P1 #1**：已在 `src/validation/rules/menu-target.ts` 中加入 `canonicalSkillId -> installedTargets` 映射校验。help index 会校验 `targetIds` 和 `activationTarget` 指向的 target 是否属于对应 skill entry 的 `installedTargets`；phase coverage 会校验 mapped `targetId` 是否属于对应 skill entry 的 `installedTargets`。不一致时返回 reserved `menu-target.missing-target`，避免未安装 target 被伪装为 mapped。
- **P1 #2**：已在 `src/installer/ready-check.ts` 中调整可读 index 的 schema 失败分类。`help-index.json` / `phase-coverage.json` 中 `activationTarget`、`entryPath`、`targetId`、`targetIds`、`status` 等 Story 2.3 menu-target 语义错误会映射为 reserved `menu-target.missing-target` 或 `menu-target.no-mapped-target`；缺失文件、JSON 不可读和非 target schema 错误仍保留 `manifest-schema.unreadable`。

#### 回归测试

- `test/menu-target-validation.test.ts` 新增 `skillIndex.installedTargets=["agents"]` 但 help/phase 声明 `claude` mapped 的 focused regression。
- `test/install-progress-ready-summary.test.ts` 新增 ReadyCheck invalid `help-index.activationTarget="DS"` 返回 `menu-target.missing-target` 的 focused regression。

#### 验证结果

- `npx vitest run test/menu-target-validation.test.ts test/install-progress-ready-summary.test.ts`：通过，2 files / 11 tests。
- `npm run build`：通过。
- `git diff --check -- src/validation/rules/menu-target.ts src/installer/ready-check.ts test/menu-target-validation.test.ts test/install-progress-ready-summary.test.ts`：通过。
