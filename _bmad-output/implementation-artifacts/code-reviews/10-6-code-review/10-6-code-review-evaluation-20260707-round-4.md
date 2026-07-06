---
Story: 10-6
Round: 4
Date: 2026-07-07
Model Used: GPT-5 Codex (gpt-5-codex)
Review Source: 10-6-code-review-summary-20260707-round-4.md
Review Model: GPT-5 Codex (gpt-5-codex)
Type: Code Review Evaluation
---

## 评估总结

对 Story 10-6 的第 4 轮 CR 代码审查结果（复审）进行独立评估。本轮 reviewer 只提出 1 个新 finding：`skill-index` selected root completeness 可被最小合法 root 集绕过。

评估结论：finding 真实有效，属于 selected installed state 的完整性校验缺口。`validateManifestSchema` 当前只从 installed manifest / index artifacts 推导一致性，无法从 artifacts 自身凭空知道缺失的 canonical package roots；但本仓库已有官方 module metadata、fixture truth 和 ReadyCheck expected skill entry 逻辑可作为 expected roots 来源。因此该问题应在 `manifest-schema` 或其可注入的 expected-root provider 层阻塞已知官方 selected modules，同时必须避免对缺少 canonical source truth 的 local/custom source 做硬编码误伤。

本轮评为 **P1**。需要 fixer；当前不允许继续 final verification / finalizer。

---

## 上轮问题回顾确认

### Round 3 / Finding #1：`files-index` 未拒绝未选择的 core / SDLC source refs：维持已修复

Round 4 reviewer 已确认 Round 3 P1 修复关闭：`validateFilesIndexSelectedSourceRefs` 现在调用统一的 `moduleIdFromSourcePath(entry.sourceRef)`，可识别 `core-skills/`、`sdlc-skills/` 与 `ecosystems/<category>/<id>/`，并对可识别 module source refs 执行 selected-module 校验（`src/validation/rules/manifest-schema.ts:439-455`、`src/validation/rules/manifest-schema.ts:479-492`）。本轮 evaluator 未重新打开该项。

### 历史 CR TODO（非阻塞）

| # | 发现 | 状态 | 评估意见 |
|---|------|------|---------|
| - | 无 | - | Round 1 两项 docs / governance P1 已在 round 2 确认修复；Round 3 P1 已在 round 4 reviewer 中确认修复。 |

---

## 发现 #1 评估

### 审查原文

> **[中][新] `skill-index` selected root completeness 可被最小合法 root 集绕过**
> - 来源：blind+edge+auditor（主审查串行降级）
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

代码验证确认 reviewer 描述成立。`validateManifestSchema` 只读取 installed artifacts：`manifest.yaml`、`skill-index.json`、`help-index.json`、`files-index.json` 和 `phase-coverage.json`（`src/validation/rules/manifest-schema.ts:167-174`），在这些 artifacts 都可解析后调用 `validateInstalledStateSelection`（`src/validation/rules/manifest-schema.ts:204-218`）。

当前 `validateInstalledStateSelection` 对 `skill-index.entries` 做了四类校验：entry 的 `moduleId` 必须属于 `manifest.installedModules`（`src/validation/rules/manifest-schema.ts:332-340`）、同一 `moduleId:sourcePackagePath` 不得重复（`src/validation/rules/manifest-schema.ts:341-351`）、每个 selected module 至少出现一次（`src/validation/rules/manifest-schema.ts:358-366`）、`sourcePackagePath` 必须匹配 entry 的 moduleId（`src/validation/rules/manifest-schema.ts:395-417`）。这些校验都不能证明 selected module 的所有 package roots 已被投影。

文件中仍定义 `EXPECTED_SELECTED_MODULE_PACKAGE_ROOTS`（`src/validation/rules/manifest-schema.ts:90-165`），但 `rg -n "EXPECTED_SELECTED_MODULE_PACKAGE_ROOTS" src/validation/rules/manifest-schema.ts package.json tsconfig*.json` 仅命中定义本身，当前没有调用点。独立临时复现也确认：构造 `installedModules: ["core", "sdlc"]`，`skill-index` 只包含 1 条合法 core entry 和 1 条合法 SDLC entry，其他 indexes 保持空或最小自洽时，直接调用 `validateManifestSchema` 返回 `[]`。

**严重性判断：偏低**

Reviewer 原始严重性为 `[中]`。Evaluator 将其升级为 **P1**，原因是本仓库已经把 selected module installed-state 完整性作为质量门禁语义的一部分：`test/validate-command.test.ts:469-508` 的用例名明确要求 stable `manifest-schema` diagnostics 报告 selected module package root incompleteness；`src/installer/ready-check.ts:106-115`、`src/installer/ready-check.ts:224-258` 已通过 selected `OfficialModule.packageRoots` 推导 expected skill entries；缺失时生成 `selected-package-root-missing-from-skill-index`（`src/installer/ready-check.ts:462-476`）。如果 `speclite validate` 的 `manifest-schema` gate 接受极小 skill-index，用户或发布流程会得到一个声明安装了 `core` + `sdlc` 但只投影少量 selected roots 的 false green。

**修复建议：可行，但必须带 source truth 边界**

Reviewer 建议恢复 / 泛化 root completeness 校验方向正确，但修复不应简单复用当前硬编码常量作为唯一 truth。该常量目前只列出 `core`、`sdlc` 和 3 个 backend ecosystem modules（`src/validation/rules/manifest-schema.ts:90-165`），而现有 module discovery / tests 已包含 frontend 和 other ecosystem modules（`test/source-and-modules.test.ts:196-207`、`test/source-and-modules.test.ts:337-354`）。直接硬编码恢复会制造新的 drift。

可行修复范围：

1. 为 `manifest-schema` selected completeness 增加 expected-root provider，优先复用 `OfficialModule.packageRoots` / module metadata truth，或由 release/fixture 生成一份 build-time official expected roots map，避免手写漂移清单。
2. 对 `manifest.sourceDescriptor` 可证明为 bundled official source，或 source root 可访问且 module metadata 可读取的 local/custom source，阻塞缺失 selected package roots。
3. 对无法访问 canonical source truth 的 local/custom source，不从 installed artifacts 反推出不存在的 roots；保持现有 moduleId、source path、help/phase/files 交叉一致性校验，并由 ReadyCheck、fixture release gate 或后续 source-aware validation 覆盖。
4. 增加 focused negative test：`installedModules: ["core", "sdlc"]`，`skill-index` 仅含 1 个合法 core root + 1 个合法 SDLC root，其余 installed artifacts 自洽时，应返回 `manifest-schema.malformed-field`，`affectedPath: "_speclite/_config/skill-index.json"`，details 指出 missing selected package root / expected root coverage。
5. 增加至少一条 local/custom source 边界测试，证明修复不会因为缺少官方 expected roots 而误伤自定义 source；如果使用官方 generated map，则同步覆盖 frontend / other ecosystem selected module。

**误报评估：非误报**

该 finding 可由当前代码路径、未使用的 expected-root 常量、现有 focused tests 缺口和独立临时复现共同证明，不是误报。

---

## Reviewer 漏报检查

在本轮限定范围内，未发现 reviewer 漏报的额外明显阻塞项。需要注意的是，`EXPECTED_SELECTED_MODULE_PACKAGE_ROOTS` 当前未被使用且内容不完整，缺少 frontend / other ecosystem modules；这不是独立于本 finding 的新阻塞项，而是 fixer 选择修复策略时必须处理的同一 root-completeness 风险。

本轮未扩展审查 PPT / html-ppt 相关外部 drift，未执行全仓库 docs / build / packaging gate；这些不属于 Story 10.6 round 4 finding 评估范围。

---

## 验证记录

| 命令 | 结果 |
|---|---|
| `sed -n '1,240p' /Users/fancyliu/.agents/skills/bmenhance-cr-02-evaluator/SKILL.md` | 通过；已读取 evaluator skill。 |
| `sed -n '1,240p' /Users/fancyliu/.agents/skills/bmenhance-cr-02-evaluator/references/cr-config.md` | 通过；确认 CR 路径与文件命名规则。 |
| `sed -n '1,260p' /Users/fancyliu/.agents/skills/bmenhance-cr-02-evaluator/assets/output-format.md` | 通过；确认 evaluation 输出格式。 |
| `ls -1 _bmad-output/implementation-artifacts/code-reviews/10-6-code-review` | 通过；已有 evaluation round 1-3 和 reviewer summary round 1-4。 |
| `test ! -e _bmad-output/implementation-artifacts/code-reviews/10-6-code-review/10-6-code-review-evaluation-20260707-round-4.md` | 通过；写入前目标文件不存在。 |
| `rg -n "EXPECTED_SELECTED_MODULE_PACKAGE_ROOTS" src/validation/rules/manifest-schema.ts package.json tsconfig*.json` | 通过；仅命中 `src/validation/rules/manifest-schema.ts:90` 的定义，未发现调用点。 |
| `npx tsx --eval <minimal core+sdlc skill-index completeness fixture>` | 首次失败；`Top-level await is currently not supported with the "cjs" output format`。 |
| `npx tsx --eval <async wrapper: minimal core+sdlc skill-index completeness fixture>` | 通过执行；输出 `[]`，确认 `validateManifestSchema` 接受 1 个 core root + 1 个 SDLC root 的最小合法 root 集。 |
| `git diff -- src/validation/rules/manifest-schema.ts test/validate-command.test.ts` | 只读执行；确认当前 diff 从旧的固定 count/root coverage 改成通用 selected installed-state 一致性校验，确实移除了 expected root coverage。 |
| `git diff --check --no-index /dev/null _bmad-output/implementation-artifacts/code-reviews/10-6-code-review/10-6-code-review-evaluation-20260707-round-4.md` | 通过；无 whitespace error 输出。首次 wrapper 使用 zsh 只读变量名 `status` 导致 shell 失败，改用 `diff_status` 后同一检查通过。 |
| `node assets/source/speclite/support-skills/speclite-check-canonical-source-change/scripts/check_canonical_source_change.mjs --project-root . --scope all --format json` | 通过；warning-only hook 返回 `status: "ok"`、`findings: []`，changedPathCount 为 118。 |
| `git status --short -- _bmad-output/implementation-artifacts/code-reviews/10-6-code-review/10-6-code-review-evaluation-20260707-round-4.md` | 通过；目标文件显示为 untracked 新增文件。 |

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | `skill-index` selected root completeness 可被最小合法 root 集绕过 | [中] | **P1** | `manifest-schema` 可对声明安装 `core` + `sdlc` 但只投影少量 selected roots 的 installed state 返回 false green。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| - | 无 | - | - | 本轮 finding 影响 installed-state 质量门禁，不建议降级为 CR TODO。 |

### 可忽略（误报）

| # | 发现 | 原始严重性 | 忽略理由 |
|---|------|----------|---------|
| - | 无 | - | 本轮 finding 非误报。 |

### 评估决定

- **发现 #1（`skill-index` selected root completeness 可被最小合法 root 集绕过）**：确认有效，升级为 P1，阻塞最终 closeout / commit。
- **是否应在 `manifest-schema` 层阻塞**：应该阻塞已知 official selected module expected roots 的缺失；但必须通过 module metadata / generated expected roots / accessible source truth 实现，不能用不完整硬编码清单误伤 local/custom source。
- **Fixer 需求**：需要 fixer。
- **建议修复范围**：限于 `src/validation/rules/manifest-schema.ts` 的 selected root completeness 校验与相关 focused tests（优先 `test/validate-command.test.ts` 或等价 manifest-schema validation test）；如需 expected-root truth，优先复用 / 生成官方 module metadata，不修改 Story 状态，不触碰 PPT / html-ppt 外部 drift。
- **Final verification / finalizer**：当前不允许继续；需修复并通过下一轮 CR evaluator 后再进入 final verification / finalizer。

---

## Fix Follow-up（修复跟踪）

### 2026-07-07 02:37 CST

Round 4 P1 已完成针对性修复：

- `src/validation/rules/manifest-schema.ts` 将未使用且不完整的 expected-root 表接入为 `OFFICIAL_BUNDLED_SELECTED_MODULE_PACKAGE_ROOTS`，补齐 frontend / other ecosystem roots，并只在 `sourceDescriptor.sourceType === "bundled"` 且 `resolvedRoot === "assets/source/speclite"` 时启用。
- `validateInstalledStateSelection` 在 moduleId、duplicate root、missing module 和 source path 归属校验通过后，继续检查 selected official module 的完整 package root 集合；缺失 root 时返回稳定的 `manifest-schema.malformed-field` / `skill-index` diagnostic。
- `test/validate-command.test.ts` 新增回归：`installedModules: ["core", "sdlc"]` 且 `skill-index` 每个 selected module 只有 1 条合法 root 时必须失败，覆盖 round 4 reviewer 提出的最小合法 root 集绕过。
- `test/governance-report-command.test.ts` 的 governance fixture 改为带 `content-hash` 证据的 `local` source，避免最小治理 fixture 伪装成 official bundled full installation，也验证 local/custom source 不套用官方 root 完整性表。

验证结果：

| 命令 | 结果 |
|---|---|
| `npm test -- test/validate-command.test.ts -t "reports selected module package root incompleteness when every selected module has one entry"` | 通过；新增回归从失败转为通过。 |
| `npm test -- test/validate-command.test.ts` | 通过；1 file / 23 tests。 |
| `npm test -- test/git-source-resolution.test.ts test/local-source-integrity.test.ts test/registry-source-resolution.test.ts test/governance-report-command.test.ts test/validate-command.test.ts` | 通过；5 files / 67 tests。 |

下一步：按 strict serial 启动 reviewer round 5 复审 round 4 P1 修复。

## 操作边界

- 本轮只新增本 evaluation 文件。
- 本轮未修复代码或文档。
- 本轮未修改 Story 状态或 sprint status。
- 本轮未 commit。
- 本轮未 push。
- 本轮未触碰 PPT / html-ppt 相关外部 drift。
