---
Story: 2-3
Round: 1
Date: 2026-05-27
Model Used: GPT-5 Codex (gpt-5-codex)
Type: Code Review Summary
---

## 审查结论

首轮审查。Agent 子代理工具在当前环境不可用，已降级为当前模型串行执行 Blind Hunter、Edge Case Hunter 和 Acceptance Auditor 三层审查。`npm test -- --run test/manifest-discovery.test.ts test/ide-target-writer.test.ts test/menu-target-validation.test.ts test/skill-artifact-loop.test.ts` 通过，`npm test -- --run test/runtime-structure.test.ts` 通过，`npm run build` 通过，`npm test` 通过。尽管自动化测试通过，当前实现仍存在 2 个 Story 2.3 AC 4 / AC 8 相关的验证语义缺口，建议本轮 CR 不通过。

## 新发现

### 1. [中] `validateMenuTargets` 未校验 mapped target 是否存在于 `skill-index.installedTargets`

- **来源**：edge+auditor
- **分类**：patch

- **证据**
  - `src/validation/rules/menu-target.ts:16-18` 只从 `skillIndex.entries` 建立 `knownSkillIds`，随后从 `phaseCoverage` 收集 mapped targets；没有建立 `canonicalSkillId -> installedTargets` 的 skill-index 真值映射。
  - `src/validation/rules/menu-target.ts:55-59` help entry 只要能匹配 phase coverage 中相同 `canonicalSkillId` 和 `activationTarget` 就视为 resolved。
  - `src/validation/rules/menu-target.ts:112-152` phase coverage 只检查 mapped 数量、重复 target key 和 activation target 格式；没有检查 `target.targetId` 是否被对应 skill-index entry 声明为 installed。
  - 定向复现：构造 `skillIndex.installedTargets=["agents"]`，但 `helpIndex` 与 `phaseCoverage` 都声明 `.claude/skills/speclite-dev-story/SKILL.md` 为 mapped，执行 `validateMenuTargets(...)` 实际返回 `[]`。

- **影响**
  - Story 2.3 AC 2 要求 help/menu/phase entry 解析到唯一 installed canonical skill entry，AC 4 要求缺失覆盖不可伪造。当前只要 `help-index` 与 `phase-coverage` 彼此一致，就能绕过 `skill-index` installed truth，导致未安装的 target 被伪装为 mapped 覆盖。
  - ReadyCheck 可能接受内部不一致的 installed-state projections，后续 IDE activation 会指向不存在或未登记的 target。

- **建议**
  - 在 `validateMenuTargets` 中建立 `skillIndex` 的 installed target set，并对每个 mapped phase target 校验 `row.canonicalSkillId` 对应 entry 是否包含该 `targetId`。
  - 同时校验 `helpIndex.targetIds` 与 `skillIndex.installedTargets` / phase coverage mapped targets 的交集关系，避免 help entry 宣称未安装 target。
  - 补充 focused test：`skillIndex.installedTargets=["agents"]` 但 phase/help 声明 `claude` mapped 时应产生 `menu-target.missing-target` 或 `menu-target.no-mapped-target`。

### 2. [中] ReadyCheck 会把 invalid activation target 提前归类为 `manifest-schema.unreadable`

- **来源**：blind+auditor
- **分类**：patch

- **证据**
  - `src/installer/ready-check.ts:263-269` 对 `help-index.json`、`phase-coverage.json` 先执行严格 schema parse；一旦 activation target 不符合 `InstalledSkillActivationTargetSchema`，直接返回 `createInvalidIndexIssue(...)`。
  - `src/installer/ready-check.ts:295-304` `createInvalidIndexIssue` 固定使用 `manifest-schema.unreadable`，不会进入 `validateMenuTargets` 生成 `menu-target.missing-target`。
  - `src/validation/rules/menu-target.ts:37-50` 虽然定义了 invalid activation target 对应 `menu-target.missing-target`，但 ReadyCheck 的 schema parse 已经在调用 validation 前拦截。
  - 定向复现：构造 `help-index.json` 中 `activationTarget: "DS"`，执行 `runReadyCheck(...)` 实际返回 `issueId: "manifest-schema.unreadable"`，`affectedPath: "_speclite/_config/help-index.json"`。

- **影响**
  - Story 2.3 AC 4 明确要求 missing activation target 使用 reserved issue ids，例如 `menu-target.missing-target`。当前 ReadyCheck 对 installed-state 反向验证给出 generic schema issue，自动化和用户无法区分 JSON 不可读、schema 破损和 menu target 语义错误。
  - 下游 evaluator / fixer / CR TODO 也会丢失 Story 2.3 要求的诊断分类边界。

- **建议**
  - 对 help-index / phase-coverage 的 activation target、entry path、status vocabulary 这类 Story 2.3 menu-target 语义错误，提供专门的 schema error mapping，转换为 `menu-target.missing-target`、`menu-target.no-mapped-target` 或相应 reserved issue id。
  - 或者在 ReadyCheck 中先以宽松 schema 读取结构，再调用 `validateMenuTargets` 做语义诊断，最后再执行严格 schema gate；但必须保留 malformed JSON / missing file 仍归入 `manifest-schema.unreadable`。
  - 补充 ReadyCheck 级测试，验证 invalid `help-index.activationTarget` 返回 `menu-target.missing-target`，而不是只测试 `validateMenuTargets` 纯函数。

## 验证摘要

- `npm test -- --run test/manifest-discovery.test.ts test/ide-target-writer.test.ts test/menu-target-validation.test.ts test/skill-artifact-loop.test.ts` ✅ 通过（13 / 13）
- `npm test -- --run test/runtime-structure.test.ts` ✅ 通过（8 / 8）
- `npm run build` ✅ 通过
- `npm test` ✅ 通过（78 / 78）
- 定向复现 ✅ 完成
  - `validateMenuTargets(...)` 对 skillIndex / phaseCoverage target 不一致场景返回 `[]`。
  - `runReadyCheck(...)` 对 invalid help-index activation target 返回 `manifest-schema.unreadable`。

## 通过项

- 未将缺少独立 `skill-index.ts`、`help-index.ts`、`files-index.ts`、`phase-coverage.ts` 作为缺陷；当前集中式 `manifest-schema.ts` / `manifest-generator.ts` builder/helper 模式符合用户修订后的 functional anchor 标准。
- Installed `SKILL.md` activation target helper、project-relative POSIX path schema、canonical target order、phase coverage status vocabulary、focused tests 和 fixture assertions 已覆盖主要 happy path。
- CLI phase coverage evidence renderer 未引入 dashboard、percentage、Copilot/Cursor branded target 或外部网络依赖。
