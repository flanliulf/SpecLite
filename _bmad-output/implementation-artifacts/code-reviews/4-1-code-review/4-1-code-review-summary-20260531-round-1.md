---
Story: 4-1
Round: 1
Date: 2026-05-31
Model Used: GPT-5.5
Type: Code Review Summary
---

## 审查结论

首轮审查。Agent 工具不可用，本轮按 skill 降级规则在当前上下文中串行执行 Blind Hunter、Edge Case Hunter、Acceptance Auditor 三层审查。Focused tests 通过，`npm run build` 通过，`git diff --check` 通过；但发现 1 个阻塞级 protected boundary 漏洞和 1 个 AC 覆盖缺口。建议不通过，需先修复 patch 桶问题后再进入 evaluator。

## 新发现

### 1. [高] `update --repair` 会把路径已判定为 human-owned / workflow-owned 的错误索引项当作 installer-owned 修复

- **来源**：blind+edge+auditor
- **分类**：patch

- **证据**
  - `src/update/update-plan.ts:194-207` 先调用 `classifyOwnership()` 得到路径分类，但当分类结果不是 `unknown` 时又把 `ownership` 设置回 `input.entry.ownership`。因此 `_speclite/custom/config.toml` 这类路径即使 classifier 判为 `human-owned`，只要 files-index entry 错标为 `installer-owned`，后续 `isProtectedOwnership(ownership)` 就不会触发 conflict。
  - `src/update/update-plan.ts:81-115` 的 repair 分支只用 `entry.ownership !== "installer-owned"` 过滤 protected paths；上述错标 entry 会继续读取 `sourceRef` 并生成 `restore-canonical` action。
  - 定向复现：临时项目中将 `_speclite/custom/config.toml` 写入 files-index 为 `ownership: "installer-owned"`，并提供 canonical source evidence。执行 `runUpdateCommand({ options: { repair: true } })` 后实际返回 `repairPlan.actions[0].affectedPath === "_speclite/custom/config.toml"`、`action === "restore-canonical"`，`conflicts === []`，`exitCode === 0`。

- **影响**
  - 违反 AC3 / AC4 / AC5：human-owned custom TOML 必须对 install/update/repair 只读，existing file 不得覆盖、重写、重排、格式化或删除。
  - 违反 AC7：ownership 冲突或不可证明安全时应进入稳定 diagnostics/conflicts，而不是生成可执行 repair action。
  - 一旦后续 Story 4.4-4.6 接入实际写入，这会把错误 files-index 的受保护用户文件恢复为 canonical content，造成用户配置丢失风险。

- **建议**
  - 在 `classifyEntryConflict()` 中以 classifier 的 protected path result 作为硬边界：当 `classification.ownership` 为 `human-owned`、`workflow-owned` 或 `unknown` 时直接返回对应 conflict，不得被 files-index entry ownership 降级为 installer-owned。
  - 增加 update 与 repair 测试：files-index 错标 `_speclite/custom/config.toml` / configured artifact root path 为 `installer-owned` 时，普通 update 和 `update --repair` 都必须进入 `data.conflicts`，且 `repairPlan.actions[]` 为空。

### 2. [中] `validate` 的 file-integrity ownership 检查未接收 configured artifact root

- **来源**：edge+auditor
- **分类**：patch

- **证据**
  - `src/validation/validate-project.ts:83-89` 已读取 `manifest.paths.artifactRoot` 并传给 artifact-path validation。
  - `src/validation/validate-project.ts:94-97` 调用 `validateFileIntegrity()` 时只传 `projectRoot` 和 `filesIndex`，没有传 configured artifact root。
  - `src/validation/rules/file-integrity.ts:42` 调用 `classifyOwnership({ relativePath: entry.path })`，因此只能使用 `_speclite-output` 默认 root，不能识别 manifest/config 中配置的 workflow artifact root。

- **影响**
  - 违反 AC6：workflow artifacts 必须包括配置约定的 workflow artifact 目录，不能硬编码只识别默认路径。
  - 当 files-index 把 configured artifact root 下的文件错标为 `installer-owned` 且 hash 当前匹配时，file-integrity 不会产生 `unsafe-overwrite-risk`，validate 无法证明 update/repair 的 protected boundary。

- **建议**
  - 扩展 `validateFileIntegrity()` 入参，传入 `artifactRoot: manifestSchemaResult.manifest.paths.artifactRoot`，并在 `classifyOwnership()` 调用中使用该值。
  - 增加 focused test：manifest artifact root 为 `.artifacts`，files-index entry `.artifacts/report.md` 被错标为 `installer-owned` 时，validate 应报告 `file-integrity.unsafe-overwrite-risk` 且 `classifiedOwnership: "workflow-owned"`。

## 验证摘要

- `npm test -- test/ownership-model.test.ts test/update-planning.test.ts test/file-integrity-ownership.test.ts test/update-command.test.ts` ✅ 通过（15 / 15）
- `npm run build` ✅ 通过
- `git diff --check -- src/commands/update.ts src/diagnostics/output.ts src/manifest/manifest-generator.ts src/validation/rules/file-integrity.ts src/update/ownership-model.ts src/update/update-plan.ts test/file-integrity-ownership.test.ts test/ownership-model.test.ts test/update-command.test.ts test/update-planning.test.ts` ✅ 通过
- 定向复现 ❌ 失败场景成立
  - 输入：files-index 将 `_speclite/custom/config.toml` 错标为 `installer-owned`，实际路径按 classifier 应为 `human-owned`。
  - 预期：`update --repair` 生成 path-level conflict，`repairPlan.actions[]` 为空。
  - 实际：`repairPlan.actions[]` 包含 `_speclite/custom/config.toml` 的 `restore-canonical`，`conflicts` 为空。

## 通过项

- Ownership classifier 对默认 `_speclite/custom/*.toml`、skill-specific custom TOML、默认 `_speclite-output/**`、configured artifact root、path escape 的基础分类测试已覆盖并通过。
- Files index projection 已包含 `ownership`、raw-byte `sha256`、`hashAlgorithm`、`executable`、`artifactKind`、`sourceRef`，并排除 `_speclite/.lock` 与 `_speclite/.speclite-tmp-*`。
- `changedPaths` / `skippedPaths` 在 dry-run、`writeAuthorized === false` 状态下保持空数组。
- `data.conflicts` 非空时共享 producer 仍只生成一个 command-level `update.conflicts` issue。

## 结论

- **结论：不通过**
- **阻塞项**：Finding #1
- **建议**：先修复 protected classifier 与 files-index ownership 冲突时的 update/repair 硬边界，再补齐 configured artifact root 的 file-integrity 验证覆盖后复审。
