---
Story: 10-6
Round: 4
Date: 2026-07-07
Model Used: GPT-5 Codex (gpt-5-codex)
Type: Code Review Summary
---

## 审查结论

本轮为复审。Agent 并行子审查工具在当前会话不可用，本轮按 `bmenhance-cr-01-reviewer` 降级路径由主审查上下文串行覆盖 Blind Hunter、Edge Case Hunter、Acceptance Auditor 三个视角。

Round 3 evaluator 确认的 P1（`files-index.entries.sourceRef` 只校验未选择 ecosystem refs，未校验未选择的 `core-skills` / `sdlc-skills` refs）已修复：`validateFilesIndexSelectedSourceRefs` 现在通过统一的 `moduleIdFromSourcePath` 识别 `core-skills/`、`sdlc-skills/` 与 `ecosystems/<category>/<id>/`，并对所有可识别 module source refs 执行 selected-module 校验；新增 core-only + SDLC `files-index` 负向测试也通过。

但本轮发现一个新的 selected-module validation gap：`skill-index` completeness 仍可被绕过。当前 `validateInstalledStateSelection` 只要求每个 selected module 在 `skill-index` 至少出现一次，并校验单条 entry 的 `moduleId` / `sourcePackagePath` 一致性；它不再使用完整 expected roots 集合校验 selected module 的所有 package roots。因此 `installedModules: ["core", "sdlc"]` 但 `skill-index` 只保留 1 个 core root + 1 个 SDLC root 时，`manifest-schema` 仍返回通过。

结论：不通过。建议恢复 selected module root completeness 校验，并增加最小缺失 root 负向测试后再进入下一轮复审。

## 上轮问题回顾

### 已修复

1. Round 3 / Finding #1 - `files-index` 未拒绝未选择的 core / SDLC source refs
   - 修复位置：`src/validation/rules/manifest-schema.ts:439-455` 的 `validateFilesIndexSelectedSourceRefs` 改为调用 `moduleIdFromSourcePath(entry.sourceRef)`，不再只识别 ecosystem refs。
   - 修复位置：`src/validation/rules/manifest-schema.ts:475-493` 新增统一 source path module 识别，`core-skills/` -> `core`、`sdlc-skills/` -> `sdlc`、`ecosystems/<category>/<id>/` -> `ecosystem-<category>-<id>`。
   - 回归覆盖：`test/validate-command.test.ts:659-742` 新增 core-only installed state 下 `files-index.entries.sourceRef` 指向 `sdlc-skills/...` 的负向测试，断言返回 `manifest-schema.malformed-field`、`affectedPath: "_speclite/_config/files-index.json"`、`field: "entries.sourceRef"`、`unexpectedModuleId: "sdlc"`。
   - 验证结果：`npm test -- test/validate-command.test.ts` 通过，1 个 test file / 22 个 tests passed；5 文件回归组合通过，5 个 test files / 66 个 tests passed。

### 仍为非阻塞待办

无。

## 新发现

### 1. [中][新] `skill-index` selected root completeness 可被最小合法 root 集绕过

- **来源**：blind+edge+auditor（主审查串行降级）
- **分类**：patch

- **证据**
  - `src/validation/rules/manifest-schema.ts:321-390` 的 `validateInstalledStateSelection` 在遍历 `skill-index.entries` 时只检查：entry.moduleId 是否属于 `manifest.installedModules`、`moduleId:sourcePackagePath` 是否重复、每个 selected module 是否至少出现一次、单条 source path 是否匹配 moduleId。
  - `src/validation/rules/manifest-schema.ts:358-366` 的 missing module 判断只要求 `uniqueRootsByModule` 中存在对应 module id；只要 `core` 和 `sdlc` 各有 1 条 entry，就不会报告缺失 selected module。
  - `src/validation/rules/manifest-schema.ts:90-165` 仍定义 `EXPECTED_SELECTED_MODULE_PACKAGE_ROOTS`，但当前文件中已无调用点；`rg -n "EXPECTED_SELECTED_MODULE_PACKAGE_ROOTS|noUnused" package.json tsconfig*.json src/validation/rules/manifest-schema.ts` 只命中定义本身，且 `tsconfig.json` 未启用 `noUnusedLocals`。
  - 定向临时复现：构造 `installedModules: ["core", "sdlc"]`，`skill-index` 只包含 `speclite-help` 的 core root 和 `speclite-dev-story` 的 SDLC root，`help-index` / `phase-coverage` 为空，`files-index` 只有 `sourceRef: "installed-state:manifest"`；直接调用 `validateManifestSchema` 输出 `[]`，未产生任何 `manifest-schema` issue。
  - 现有测试没有覆盖这个绕过：`test/validate-command.test.ts:470-508` 只覆盖 1 个 core entry 导致缺失 `sdlc` module 的场景；`test/validate-command.test.ts:510-545` 覆盖 duplicate root，但不是 selected module 缺少大量 package roots 且每个 module 至少出现一次的场景。

- **影响**
  - 这会让 `_speclite/_config/manifest.yaml` 声明安装 `core` + `sdlc`，但 `_speclite/_config/skill-index.json` 仅投影极少数 selected roots 的 installed state 通过 `speclite validate` 的 manifest-schema gate。
  - Story 10.6 AC2 / AC7 要求 IDE mirrors、skill indexes、help index、phase coverage、files index 和 runtime projection 只包含 selected modules；selected-only 不等于 selected module 可以缺失大部分应投影 roots。当前 gap 会削弱 release / fixture gate 对 installed-state 完整性的保护。
  - Round 3 的 `files-index` gap 已关闭，但这个 `skill-index` completeness gap 属于同一 selected-module validation 面，不能在最终 closeout 前忽略。

- **建议**
  - 恢复并泛化 selected module root completeness 校验：对 `manifest.installedModules` 中每个已知 module，校验 `skill-index.entries.sourcePackagePath` 覆盖该 module 的 expected package roots；若要支持 ecosystem dynamic modules，应基于 module metadata / fixture truth 生成 expected roots，而不是只检查 module id 是否出现。
  - 保留当前 `moduleIdFromSourcePath` 对 custom/local source root 的 segment 识别，并继续跳过 `installed-state:*`、`generated:*`、`bundled-runtime-compat:*` 等非 module source refs。
  - 增加 focused negative test：`installedModules: ["core", "sdlc"]`，`skill-index` 只含 1 个 core root + 1 个 SDLC root，其他 indexes 保持自洽时，应返回 `manifest-schema.malformed-field`，并指出缺失 selected module package roots / expected root coverage。

## 验证摘要

- ✅ `npm test -- test/validate-command.test.ts`
  - 通过，1 个 test file / 22 个 tests passed。
- ✅ `npm test -- test/git-source-resolution.test.ts test/local-source-integrity.test.ts test/registry-source-resolution.test.ts test/governance-report-command.test.ts test/validate-command.test.ts`
  - 通过，5 个 test files / 66 个 tests passed。
- ✅ `npx tsx --eval <async wrapper: minimal core+sdlc skill-index completeness fixture>`
  - 通过执行；`validateManifestSchema` 输出 `[]`，复现 `skill-index` selected root completeness 绕过。
- ❌ `npx tsx --eval <same fixture without async wrapper>`
  - 失败；`Top-level await is currently not supported with the "cjs" output format`。这是临时复现脚本包装问题，已用 async wrapper 重跑同一逻辑并得到上方有效结果。
- ✅ `git diff --check -- src/validation/rules/manifest-schema.ts test/validate-command.test.ts _bmad-output/implementation-artifacts/code-reviews/10-6-code-review/10-6-code-review-summary-20260707-round-4.md`
  - 通过，无 whitespace error 输出。
- ✅ `awk '/[ \t]$/{print FILENAME ":" FNR ": trailing whitespace"; bad=1} END{exit bad}' _bmad-output/implementation-artifacts/code-reviews/10-6-code-review/10-6-code-review-summary-20260707-round-4.md`
  - 通过，无 trailing whitespace 输出；用于覆盖普通 `git diff --check` 不检查 untracked review summary 文件内容的问题。
- ✅ `node assets/source/speclite/support-skills/speclite-check-canonical-source-change/scripts/check_canonical_source_change.mjs --project-root . --scope all --format json`
  - 通过，`status: "ok"`、`findings: []`；该命令由 warning-only canonical source hook 提醒触发，本轮只读执行，未跟进 strict mode / build / packaging recommended followups。
- 未运行 `npm run lint`
  - `package.json` 当前未定义 `lint` script。
- 未运行 `npm run build`
  - 本轮按用户建议执行 focused verification；`npm run build` 会写入 `dist/`，当前混合 worktree 未授权生成构建产物。

## 通过项

- Round 3 P1 已关闭：core-only installed state 下 `files-index.entries.sourceRef` 指向 `sdlc-skills/...` 会被拒绝，新增测试已覆盖。
- `moduleIdFromSourcePath` 对任意稳定 source root 前缀下的 `core-skills/`、`sdlc-skills/` 和 `ecosystems/<category>/<id>/` 采用 path segment 识别，能覆盖 `assets/source/speclite/...` 与 `local-source/...` 这类 source root。
- `installed-state:manifest` 在定向临时复现中未被 `moduleIdFromSourcePath` 误判为 module source ref；`installed-state:*` 等非 module refs 仍可跳过 selected-module sourceRef 校验。
- `skill-index.entries.moduleId` 仍会拒绝未安装 moduleId；`sourcePackagePathMatchesModule` 仍会拒绝 moduleId 与 source path 不一致的 entry；ecosystem source path 归属校验未被本次修复重新打开缺口。

## 结论

- **结论：不通过**
- **阻塞项**：1 个中优先级 selected-module validation gap（本轮新发现 #1）。
- **建议**：恢复 / 泛化 `skill-index` selected root completeness 校验，并补充缺失 root 负向测试后再发起 round 5 复审。

## 操作边界

- 本轮未修复代码或文档。
- 本轮未修改 Story 状态或 sprint status。
- 本轮未 commit。
- 本轮未 push。
- 本轮未触碰 PPT / html-ppt 相关外部 drift。
