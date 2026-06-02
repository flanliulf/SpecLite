---
Story: 2-3
Round: 4
Date: 2026-05-28
Model Used: GPT-5 Codex (gpt-5-codex)
Type: Code Review Summary
---

## 审查结论

本轮为 reopened corrective dev verification 后的复审。Agent 子代理工具在当前环境不可用，已按 skill 降级规则由当前模型串行执行 Blind Hunter、Edge Case Hunter 和 Acceptance Auditor 三层审查。Round 1 的 2 个 P1 与 Round 2 的 1 个 P1 历史修复仍由既有 regression 覆盖；本轮新增 corrective 重点也已验证：phase coverage 仍是阶段导航/审计投影，不会被误用为 full installed inventory；full selected canonical package roots 则由 ReadyCheck 的 selected module inventory gate 与 IDE mirror/index gate 校验。当前 `npm run build`、targeted Vitest、全量 `npm test` 和 `git diff --check` 均通过，未发现新的阻塞问题，建议 Story 2.3 reviewer round 4 通过。

## 上轮问题回顾

### 已修复

1. Round 1 / Finding #1 - `validateMenuTargets` 未校验 mapped target 是否存在于 `skill-index.installedTargets`
   - `src/validation/rules/menu-target.ts:27-30` 建立 `canonicalSkillId -> installedTargets` 映射。
   - `src/validation/rules/menu-target.ts:69-99` 校验 help `targetIds` 与 help `activationTarget` 只能指向该 skill 已安装 target。
   - `src/validation/rules/menu-target.ts:250-267` 校验 phase coverage mapped `targetId` 必须存在于对应 `skill-index.installedTargets`。
   - `test/menu-target-validation.test.ts:118-165` 覆盖 `skillIndex.installedTargets=["agents"]` 但 help/phase 声明 `claude` mapped 的 regression。

2. Round 1 / Finding #2 - ReadyCheck 会把 invalid activation target 提前归类为 `manifest-schema.unreadable`
   - `src/installer/ready-check.ts:92-104` 读取 indexes 后调用 `validateMenuTargets`，并用 blocking `menu-target.*` issue 阻断 ReadyCheck。
   - `src/installer/ready-check.ts:401-430` 将 help/phase target 语义字段的 schema failure 映射为 reserved `menu-target.missing-target` 或 `menu-target.no-mapped-target`。
   - `test/install-progress-ready-summary.test.ts:240-267` 覆盖 invalid `help-index.activationTarget` 返回 `menu-target.missing-target` 的 ReadyCheck regression。

3. Round 2 / Finding #1 - `activationTarget` 可以指向另一个 canonical skill 的 installed `SKILL.md`
   - `src/validation/rules/menu-target.ts:70-99` 校验 help `activationTarget` 的 installed skill directory basename 必须等于当前 `canonicalSkillId`。
   - `src/validation/rules/menu-target.ts:198-248` 校验 phase coverage mapped `entryPath` 与 `activationTarget` 的 target family / skill directory basename 均绑定到当前 `canonicalSkillId`。
   - `src/validation/rules/menu-target.ts:291-309` 集中解析 installed entry path 与 activation target。
   - `test/menu-target-validation.test.ts:167-206` 与 `test/install-progress-ready-summary.test.ts:394-510` 覆盖 cross-skill target mismatch。

4. Corrective verification - phase coverage 与 full installed inventory 分层
   - `src/ide/target-writer.ts:54-115` 对 selected module `packageRoots` 生成完整 `skillIndexEntries`，即 no-help-row skill 仍进入 installed skill index。
   - `src/ide/target-writer.ts:117-153` 只对有 help metadata 的 package root 生成 help index 与 phase coverage rows，保持 phase coverage 为阶段投影。
   - `test/ide-target-writer.test.ts:143-191` 覆盖无 help/phase row 的 package root 仍被 mirror/index 收录。
   - `test/menu-target-validation.test.ts:208-244` 覆盖 installed skill 缺少 help/phase row 时 `validateMenuTargets` 不误报。

5. Corrective verification - selected package root 缺失不能被 ReadyCheck 放过
   - `src/commands/install.ts:388-395` 在真实 install flow 中把 `finalSelectedModules` 传入 `runReadyCheck`。
   - `src/installer/ready-check.ts:106-116` 将 selected module package roots 与 `skill-index.json` 做独立一致性检查。
   - `src/installer/ready-check.ts:168-178` 校验 IDE target reported `skillCount` 与 `skill-index.installedTargets` 数量一致。
   - `src/installer/ready-check.ts:189-205` 校验 selected expected entry 已在当前 configured target 中安装。
   - `test/install-progress-ready-summary.test.ts:270-392` 覆盖 `skill-index.json` 缺少 selected package root 时返回 blocking `ide-mirror.missing-entry`。

### 仍为非阻塞待办

无。

## 新发现

本轮未发现新的阻塞项或中高优先级问题。

## 验证摘要

- `npm test -- test/source-and-modules.test.ts test/runtime-structure.test.ts test/install-module-selection.test.ts test/manifest-discovery.test.ts test/menu-target-validation.test.ts test/install-progress-ready-summary.test.ts test/ide-target-writer.test.ts` ✅ 通过（7 files / 54 tests）
- `npm run build` ✅ 通过
- `npm test` ✅ 通过（20 files / 118 tests）
- `npm run lint` 不适用：`package.json` 当前未定义 `lint` script
- `git diff --check` ✅ 通过
- 额外复核：
  - no-help-row installed skill 不要求必须出现在 help index 或 phase coverage。
  - selected canonical package root 缺失由 `skill-index` / selected IDE mirror validation 阻断，不通过 phase coverage row 伪造覆盖。
  - 本轮未执行 evaluator、fixer 或 finalizer。

## 通过项

- Story 2.3 的 activation target 校验仍绑定 installed project-relative `SKILL.md` path、target family 与 `canonicalSkillId` basename。
- `validateMenuTargets` 继续只校验 help index / phase coverage 引用到的 skill rows，不要求所有 installed canonical skills 都必须有 phase coverage row。
- ReadyCheck 已补足 full selected package root gate，避免 partial inventory 被误判 ready，同时不把 phase coverage 扩展为 full inventory。
- Focused tests、full regression、build 和 diff whitespace check 均通过。

## 结论

- **结论：通过**
- **阻塞项**：无
- **建议**：不需要进入 fixer；如需继续 CR 流程，应由用户另行触发 evaluator，本轮按要求未执行 evaluator / fixer / finalizer。
