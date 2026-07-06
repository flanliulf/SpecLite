---
Story: 10-6
Round: 3
Date: 2026-07-07
Model Used: GPT-5 Codex (gpt-5-codex)
Type: Code Review Summary
---

## 审查结论

本轮为复审。Agent 并行子审查工具在当前会话不可用，本轮按 `bmenhance-cr-01-reviewer` 降级路径由主审查上下文串行覆盖 Blind Hunter、Edge Case Hunter、Acceptance Auditor 三个视角。

Round 1 evaluator 标为 P1 的 2 个 docs / governance 问题在 round 2 已确认修复并通过。本轮仅复审 Epic final verification 后的 selected-module validation fix。定向测试均通过，但发现 1 个新的 selected-only validation gap：`files-index` 只拒绝未安装 ecosystem source refs，不拒绝未安装 `core-skills` / `sdlc-skills` source refs。因此 core-only installed state 仍可残留 SDLC file projection 而不触发 `manifest-schema` issue。

结论：不通过。建议补齐 `files-index.entries.sourceRef` 的 core / sdlc / ecosystem module 归属校验，并增加负向测试后再进入下一轮复审。

## 上轮问题回顾

### 已修复

1. Round 1 / Finding #1 - SDLC skill catalog 仍把已迁移 backend ecosystem skills 列为 SDLC workflow
   - Round 2 reviewer / evaluator 已确认修复：SDLC catalog、canonical source layout、workflow explanation 已移除 backend-specific ecosystem package roots 的 SDLC 归属表达。
   - Focused docs test 已覆盖迁移后的 backend package ids 不再出现在 SDLC catalog / layout / workflow explanation 中，同时仍出现在 ecosystem catalog。

2. Round 1 / Finding #2 - canonical governance map 未把 `ecosystems/**` 纳入 ecosystem-only 变更分类
   - Round 2 reviewer / evaluator 已确认修复：`canonical-governance.json` 已纳入 ecosystem source、ecosystem `module.yaml` / `module-help.csv`，并新增 `ecosystem-module-change` impact rule。
   - `canonical-source-change-check-script` test 已覆盖 ecosystem-only changed path 触发对应 class、rule 和 followups。

### 仍为非阻塞待办

无。

## 新发现

### 1. [中][新] `files-index` 未拒绝未选择的 core / SDLC source refs

- **来源**：blind+edge+auditor（主审查串行降级）
- **分类**：patch

- **证据**
  - `src/validation/rules/manifest-schema.ts:399-417` 会对 `skill-index.entries.sourcePackagePath` 调用 `sourcePackagePathMatchesModule`，因此 `skill-index` 能拒绝 moduleId 与 source path 不一致、或未安装 ecosystem module 的 entry。
  - `src/validation/rules/manifest-schema.ts:439-452` 的 `validateFilesIndexSelectedSourceRefs` 只调用 `ecosystemModuleIdFromSourcePath(entry.sourceRef)`，只在 `sourceRef` 形如 `ecosystems/<category>/<id>/...` 时校验是否已安装；`core-skills/...` 与 `sdlc-skills/...` 不会映射到 module id。
  - `src/validation/rules/manifest-schema.ts:475-488` 已有 core / sdlc source segment 识别逻辑，但当前只用于 `skill-index` 的 `sourcePackagePath`，没有用于 `files-index.entries.sourceRef`。
  - 定向临时复现：构造 `installedModules: ["core"]`、`skill-index` / `help-index` / `phase-coverage` 全部只含 `core`，但 `files-index.entries[0].sourceRef` 为 `assets/source/speclite/sdlc-skills/4-implementation/speclite-dev-story/SKILL.md`；直接调用 `validateManifestSchema` 返回 `[]`，未产生 `manifest-schema` issue。

- **影响**
  - 这会留下 core-only 绕过面：只要未选择的 SDLC 或 core-family file projection 不出现在 `skill-index` / `phase-coverage` / `help-index`，而仅残留在 `files-index`，`manifest-schema` 仍会认为 installed state selection 合法。
  - Story 10.6 的 selected-only projection 目标要求 IDE mirrors、indexes、files index 都只反映 selected modules；当前 fix 对 ecosystem refs 有保护，但对 `sdlc-skills` / `core-skills` refs 不完整。
  - 现有测试覆盖了 unselected ecosystem 出现在 `skill-index` 的场景，也覆盖 descriptor-only empty indexes 使用 `installedModules: []`，但没有覆盖 core-only manifest 中 `files-index` 残留 `sdlc-skills/...` sourceRef 的负向场景。

- **建议**
  - 将 `ecosystemModuleIdFromSourcePath` 泛化为 `moduleIdFromSourcePath`：识别任意稳定 source root 下的 `core-skills/`、`sdlc-skills/`、`ecosystems/<category>/<id>/`。
  - `validateFilesIndexSelectedSourceRefs` 应对所有可识别 source refs 校验 `installedModules`，而不只校验 ecosystem refs；无法识别的 `installed-state:*`、`bundled-runtime-compat:*` 等非 canonical source refs 继续跳过。
  - 增加 focused test：`installedModules: ["core"]` 时，`files-index.entries.sourceRef` 指向 `assets/source/speclite/sdlc-skills/...` 应返回 `manifest-schema.malformed-field`，`field: "entries.sourceRef"`。

## 验证摘要

- ✅ `npm test -- test/git-source-resolution.test.ts test/local-source-integrity.test.ts test/registry-source-resolution.test.ts test/governance-report-command.test.ts`
  - 通过，4 个 test files / 44 个 tests passed。
- ✅ `npm test -- test/validate-command.test.ts test/canonical-source-change-check-script.test.ts`
  - 通过，2 个 test files / 23 个 tests passed。
- ✅ 临时定向复现：`npx tsx --eval <core-only manifest + sdlc files-index sourceRef fixture>`
  - 复现当前 gap：`validateManifestSchema` 返回 `[]`。
- ✅ `git diff --check -- src/validation/rules/manifest-schema.ts test/git-source-resolution.test.ts test/local-source-integrity.test.ts test/registry-source-resolution.test.ts test/governance-report-command.test.ts _bmad-output/implementation-artifacts/code-reviews/10-6-code-review/10-6-code-review-summary-20260707-round-3.md`
  - 通过，无 whitespace error 输出。
- ✅ `node assets/source/speclite/support-skills/speclite-check-canonical-source-change/scripts/check_canonical_source_change.mjs --project-root . --scope all --format json`
  - 通过，`status: "ok"`、`findings: []`；该命令由 warning-only canonical source hook 提醒触发，本轮未按 recommended followups 扩展执行 strict mode / build / packaging，因为本任务限定为 Story 10.6 CR reviewer round 3。
- 未运行 `npm run lint`
  - `package.json` 当前未定义 `lint` script。
- 未运行 `npm run build`
  - 本轮按用户建议的 focused verification 执行；未触发 build 产物写入。

## 通过项

- `sourcePackagePathMatchesModule` 对 `skill-index` 仍保留 moduleId 与 source package path 的一致性校验：`core` 必须落在 `core-skills/`，`sdlc` 必须落在 `sdlc-skills/`，ecosystem 必须落在匹配的 `ecosystems/<category>/<id>/`。
- `sourcePackagePathMatchesModule` / `ecosystemModuleIdFromSourcePath` 支持任意稳定 source root 前缀，能覆盖 `assets/source/speclite/...` 与 `local-source/...` 这类投影路径；`test/local-source-integrity.test.ts` 已覆盖 `local-source/core-skills/...`。
- `test/git-source-resolution.test.ts` 与 `test/registry-source-resolution.test.ts` 的 descriptor-only projection 改为 `installedModules: []` 合理：对应 `skill-index`、`help-index`、`files-index`、`phase-coverage` 都是 empty indexes，不再虚称安装了 `core`。
- `test/governance-report-command.test.ts` 当前 governance fixture 声明 `sdlc` installed module，并且 `skill-index` / `phase-coverage` 均指向 `speclite-dev-story` 的 `sdlc` package root，和实际 index / phase coverage 一致。

## 结论

- **结论：不通过**
- **阻塞项**：1 个中优先级 selected-only validation gap（本轮新发现 #1）。
- **建议**：补齐 `files-index.entries.sourceRef` 的 core / sdlc / ecosystem source module 识别与 installedModules 校验，新增负向测试后再发起 round 4 复审。

## 操作边界

- 本轮未修复代码或文档。
- 本轮未修改 Story 状态或 sprint status。
- 本轮未 commit。
- 本轮未 push。
- 本轮未触碰 PPT / html-ppt 相关外部 drift。
