---
Story: 2-3
Round: 2
Date: 2026-05-27
Model Used: GPT-5 Codex (gpt-5-codex)
Type: Code Review Summary
---

## 审查结论

本轮为复审。Agent 子代理工具在当前环境不可用，已按 skill 降级规则由当前模型串行执行 Blind Hunter、Edge Case Hunter 和 Acceptance Auditor 三层审查。Round 1 的 2 个 P1 修复点已补入实现和 regression tests，`npx vitest run test/menu-target-validation.test.ts test/install-progress-ready-summary.test.ts`、`npm run build` 和 `npm test` 均通过。但本轮发现 1 个新的 Story 2.3 AC 1 / AC 2 阻塞问题：validator 和 ReadyCheck 仍允许 `canonicalSkillId` 与 `activationTarget` 中的 installed skill directory basename 不一致。建议本轮 CR 不通过。

## 上轮问题回顾

### 已修复

1. Round 1 / Finding #1 — `validateMenuTargets` 未校验 mapped target 是否存在于 `skill-index.installedTargets`
   - `src/validation/rules/menu-target.ts:23-25` 已建立 `canonicalSkillId -> installedTargets` 映射。
   - `src/validation/rules/menu-target.ts:64-70` 已校验 help `targetIds` 和 `activationTarget` 所属 target 是否在 installed target set 内。
   - `src/validation/rules/menu-target.ts:206-220` 已校验 phase coverage mapped `targetId` 是否存在于 `skill-index.installedTargets`。
   - `test/menu-target-validation.test.ts:118-145` 已补充 `skillIndex.installedTargets=["agents"]` 但 help/phase 声明 `claude` mapped 的 regression。

2. Round 1 / Finding #2 — ReadyCheck 会把 invalid activation target 提前归类为 `manifest-schema.unreadable`
   - `src/installer/ready-check.ts:90-102` 已在读取 indexes 后调用 `validateMenuTargets`，并让阻塞级 `menu-target.*` issue 阻断 ReadyCheck。
   - `src/installer/ready-check.ts:296-340` 已把 `help-index.json` / `phase-coverage.json` 中 target 语义字段的 schema failure 映射到 reserved `menu-target.missing-target` 或 `menu-target.no-mapped-target`。
   - `test/install-progress-ready-summary.test.ts:160-263` 已补充 invalid `help-index.activationTarget="DS"` 返回 `menu-target.missing-target` 的 ReadyCheck regression。

### 仍为非阻塞待办

无。

## 新发现

### 1. [中][新] `activationTarget` 可以指向另一个 canonical skill 的 installed `SKILL.md`

- **来源**：edge+auditor
- **分类**：patch

- **证据**
  - `src/manifest/manifest-schema.ts:43-49` 只验证 `activationTarget` 是 `.claude/skills/<任意目录>/SKILL.md` 或 `.agents/skills/<任意目录>/SKILL.md`，没有把目录 basename 绑定到当前 `canonicalSkillId`。
  - `src/validation/rules/menu-target.ts:64-70` 只从 `activationTarget` 推断 target family，并校验该 target family 是否安装；没有校验路径中的 skill directory 是否等于 `entry.canonicalSkillId`。
  - `src/validation/rules/menu-target.ts:93-98` help entry 的 resolved match 只要求 phase coverage 中存在相同 `canonicalSkillId` 和相同 `activationTarget`；如果 help 与 phase coverage 同时错指 `.claude/skills/other-skill/SKILL.md`，会被视为匹配。
  - `src/validation/rules/menu-target.ts:187-220` phase coverage mapped target 只检查 path shape 和 `targetId` 是否在 `skill-index.installedTargets`，未检查 `activationTarget` 是否指向 `row.canonicalSkillId` 对应的 installed entry。
  - `src/installer/ready-check.ts:154-160` 后续 mirror existence check 使用 `skill-index.canonicalSkillId` 计算 `.claude/skills/speclite-dev-story/SKILL.md` 是否存在，不会验证 help/phase coverage 中声明的 `activationTarget` 实际指向同一个 skill。
  - 定向复现 1：构造 `canonicalSkillId="speclite-dev-story"`，但 help/phase coverage 的 `activationTarget=".claude/skills/other-skill/SKILL.md"`，且 `skillIndex.installedTargets=["claude"]`，执行 `validateMenuTargets(...)` 实际返回 `[]`。
  - 定向复现 2：在临时项目中同时创建 `.claude/skills/speclite-dev-story/SKILL.md` 和 `.claude/skills/other-skill/SKILL.md`，indexes 中 `canonicalSkillId="speclite-dev-story"` 但 help/phase coverage 均指向 `other-skill`，执行 `runReadyCheck(...)` 实际返回 `ok: true`。

- **影响**
  - Story 2.3 AC 1 要求 activation target 必须指向 installed entry 中该 canonical skill 的 `SKILL.md`，AC 2 要求每个 help/menu/phase entry 解析到且仅解析到一个 installed canonical skill entry。当前实现允许 projections 内部一致但跨 skill 错指，导致用户从 `speclite-dev-story` 菜单 entry 激活到另一个 skill package。
  - ReadyCheck 会接受这种错配 installed-state，后续 IDE activation 可能执行错误 skill 的 activation protocol，同时 automation 仍认为目标 skill 覆盖已 mapped。

- **建议**
  - 在 `validateMenuTargets` 中解析 `entryPath` / `activationTarget` 的 target id 与 skill directory basename，并校验 basename 必须等于对应 `canonicalSkillId`。
  - help entry 校验应确保 `activationTarget === createInstalledSkillActivationTarget({ targetId: activationTargetId, canonicalSkillId })`，phase coverage target 校验应确保 `entryPath` 与 `activationTarget` 均指向同一个 `row.canonicalSkillId`。
  - 补充 focused tests：help/phase coverage 同时把 `canonicalSkillId="speclite-dev-story"` 错指到 `.claude/skills/other-skill/SKILL.md` 时，应返回 reserved `menu-target.missing-target`，ReadyCheck 应不通过。

## 验证摘要

- `npx vitest run test/menu-target-validation.test.ts test/install-progress-ready-summary.test.ts` ✅ 通过（2 files / 11 tests）
- `npm run build` ✅ 通过
- `npm test` ✅ 通过（14 files / 80 tests）
- 额外复核：
  - Round 1 Finding #1 regression 已覆盖并通过。
  - Round 1 Finding #2 regression 已覆盖并通过。
  - 新增定向复现确认：cross-skill `activationTarget` 错配当前未被 `validateMenuTargets` 或 ReadyCheck 阻断。

## 通过项

- 本轮未把缺少独立 `skill-index.ts`、`help-index.ts`、`files-index.ts`、`phase-coverage.ts` 作为缺陷；集中式 `manifest-schema.ts` / `manifest-generator.ts` builder/helper 模式仍符合修订后的 functional anchor 标准。
- Round 1 的 `skill-index.installedTargets` 交叉校验缺口已修复，未安装 target 不再能单纯通过 help/phase mapped 投影伪装为 installed target。
- Round 1 的 ReadyCheck invalid activation target issue 映射已修复，可读 index 中 target 语义字段错误会进入 reserved `menu-target.*` issue。

## 结论

- **结论：不通过**
- **阻塞项**：1 个新发现，`activationTarget` canonical skill basename 未与 `canonicalSkillId` 绑定。
- **建议**：进入 evaluator round 2，对本轮新发现做独立评估；若确认有效，再由 fixer 定点修复 validator / ReadyCheck regression。
