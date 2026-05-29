---
Story: 3-3
Round: 1
Date: 2026-05-28
Model Used: GPT-5 Codex (gpt-5-codex)
Type: Code Review Summary
---

## 审查结论

首轮审查。当前环境无 Agent 工具，已按 `bmenhance-cr-01-reviewer` 降级为串行三层审查（Blind Hunter、Edge Case Hunter、Acceptance Auditor 均在当前上下文完成）。本轮未复跑 `npm test` / `npm run lint` / `npm run build`，仅引用 Story Dev Agent Record 中的验证记录；代码审查发现 2 个 `patch` 桶问题，均有明确修复方向。建议进入 evaluator，但本轮 reviewer 结论为不通过，需修复后复审。

## 新发现

### 1. [中] 非 canonical adapter artifact symlink 会误触发 `ide-mirror.hash-mismatch`

- **来源**：blind+edge+auditor
- **分类**：patch

- **证据**
  - Story 3.3 明确要求 target-specific wrapper、discovery metadata 或 adapter artifact 不得混入 canonical package hash，只能通过 files index 独立校验：`_bmad-output/implementation-artifacts/stories/3-3-ide-mirror-and-file-integrity-validation.md:27`、`:225`。
  - `validateIdeMirror()` 调用 `hashPackageDirectory(expectedRoot, { include: isCanonicalPackageHashFile })`，但 `hashPackageDirectory()` 先执行 `listFiles(packageRoot)` 再过滤 include：`src/validation/rules/ide-mirror.ts:65-68`、`src/manifest/hash.ts:17-23`。
  - `listFiles()` 对 entry root 下任何 symlink 都直接 throw，不区分该 symlink 是否位于 `SKILL.md` / `CHANGELOG.md` / `references/` / `assets/` / `scripts/` / `config.toml.example` / `customize.toml` 的 canonical candidate 范围内：`src/manifest/hash.ts:35-57`。
  - 结果是 `.claude/skills/<id>/adapter-link`、`.agents/skills/<id>/wrapper-link` 这类本应排除的 adapter artifact 只要是 symlink，就会被 catch 成 `shape: "symlink-in-canonical-package"` 并报告 `ide-mirror.hash-mismatch`：`src/validation/rules/ide-mirror.ts:82-93`。现有测试只覆盖普通 `adapter.json` 文件不会影响 hash，未覆盖 symlink artifact：`test/validate-command.test.ts:483-502`。

- **影响**
  - 合法的 target-local adapter artifact 可能让 validate 错误失败，破坏 AC2 的 adapter artifact exclusion contract，并给用户提供错误的 canonical package drift 信号。
  - 错误原因被写成 `symlink-in-canonical-package`，但实际 symlink 可能不在 canonical candidate path 下，诊断语义不准确。

- **建议**
  - 调整 canonical package walker：先按 candidate roots 收集，或在遇到 symlink 时先判断 normalized path 是否属于 include 范围；只有 canonical candidate path 下的 symlink 才触发 package shape mismatch。
  - 增加测试：在 entry root 下放置非 canonical `adapter-link` / wrapper symlink，validate 应保持 success；在 `references/` 或 `assets/` 下放置 symlink，validate 应报告 redaction-safe `ide-mirror.hash-mismatch`。

### 2. [低] dangling symlink 的 file-integrity 诊断被误报为 missing installer-owned file

- **来源**：edge+auditor
- **分类**：patch

- **证据**
  - Story 3.3 要求 file-level hash 基于 raw bytes，并要求 symlink handling 作为独立 validation dimension，不能被 hash normalization 隐式吸收：`_bmad-output/implementation-artifacts/stories/3-3-ide-mirror-and-file-integrity-validation.md:29-35`。
  - `validateFileIntegrity()` 对 files index entry 先调用 `fileExists()`；该 helper 使用 `access()`，会跟随 symlink。dangling symlink 因 target 不存在返回 false，代码随即报告 `file-integrity.missing-installer-owned-file`，不会进入后续 `lstat()` 的 symlink 分支：`src/validation/rules/file-integrity.ts:36-52`。
  - 现有测试实际创建了 dangling symlink `../outside.md`，但期望 file-integrity 仍报告 missing installer-owned file：`test/validate-command.test.ts:513-515`、`:556-590`。

- **影响**
  - 物理路径存在但为 dangling symlink 时，validate 把 unsafe shape / symlink handling 误表达为缺失文件；这会降低 drift 诊断的可操作性，也与 Story 对 symlink 维度独立处理的要求不完全一致。
  - 对后续 repair/evaluator 来说，missing file 与 symlink shape 的修复策略不同，误分类可能导致修复计划选择错误。

- **建议**
  - 对 files-index entry 先用 `lstat()` 判断路径实体是否存在及是否 symlink；只有 `lstat()` 返回 ENOENT 时才报告 `file-integrity.missing-installer-owned-file`。
  - 对 symlink entry 使用现有 reserved taxonomy 中最具体的安全诊断，例如继续用 `file-integrity.hash-mismatch` 并在 details 中标注 `shape: "symlink"`，或若产品决定需要更精细 issue id，则先更新 owning SPEC。
  - 更新测试期望，覆盖 dangling symlink 与 symlink-to-existing-file 两种情况，确保不 follow symlink target、不泄露 readlink 结果。

## 验证摘要

- `npm test` 未在本轮 CR 复跑；Story Dev Agent Record 记录最终通过，22 个 test files / 138 个 tests。
- `npm run lint` 未在本轮 CR 复跑；Story 记录中未见 lint 独立结果。
- `npm run build` 未在本轮 CR 复跑；Story Dev Agent Record 记录通过，tsup ESM 与 DTS build 均成功。
- 定向复现未执行；本轮为只读审查，以上 findings 基于代码路径与测试覆盖缺口推导。

## 通过项

- `speclite validate` 的 orchestration 保持在 `validateProject()` / validation rules 中，`src/commands/validate.ts` 没有直接拼接 Story 3.3 issue。
- manifest-schema 成功后才执行 `ide-mirror` 与 `file-integrity`，避免把 schema corruption 错归类为 drift。
- IDE mirror missing/hash/duplicate、files index hash/missing/unknown ownership、checkedTargets/validatedPaths deterministic projection 和 details redaction 均有 focused tests 覆盖。

## 结论

- **结论：不通过**
- **阻塞项**：无 `decision_needed`；存在 2 个明确可修复的 `patch` 桶问题。
- **建议**：进入 evaluator 评估本轮 findings；修复后执行下一轮 reviewer 复审。
