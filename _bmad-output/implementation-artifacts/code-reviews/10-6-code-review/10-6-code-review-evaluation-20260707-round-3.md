---
Story: 10-6
Round: 3
Date: 2026-07-07
Model Used: GPT-5 Codex (gpt-5-codex)
Review Source: 10-6-code-review-summary-20260707-round-3.md
Review Model: GPT-5 Codex (gpt-5-codex)
Type: Code Review Evaluation
---

## 评估总结

对 Story 10-6 的第 3 轮 CR 代码审查结果（复审）进行独立评估。本轮 reviewer 只提出 1 个新 finding：`files-index.entries.sourceRef` 只校验未选择的 ecosystem refs，未校验未选择的 `core-skills` / `sdlc-skills` refs。

评估结论：finding 真实有效，属于 selected-only runtime projection 的 validation gap。该问题会让 core-only installed state 中残留的 SDLC file projection 绕过 `manifest-schema`，阻塞 Story 10.6 最终 closeout / commit。需要进入 fixer，修复后再做 round 4 复审；当前不允许继续 final verification / finalizer。

---

## 上轮问题回顾确认

### Round 1 / Finding #1：SDLC skill catalog 仍把已迁移 backend ecosystem skills 列为 SDLC workflow：维持已修复

Round 2 evaluator 已确认该项修复，并记录了 SDLC catalog、canonical source layout、workflow explanation 与 focused docs test 的证据。本轮 reviewer 未报告该项回归；本轮 evaluator 仅对 round 3 selected-module validation finding 做独立验证，不重新打开 docs / catalog 修复面。

### Round 1 / Finding #2：canonical governance map 未把 `ecosystems/**` 纳入 ecosystem-only 变更分类：维持已修复

Round 2 evaluator 已确认该项修复，并记录了 `canonical-governance.json`、治理文档和 `canonical-source-change-check-script` test 的证据。本轮 reviewer 未报告该项回归；本轮 evaluator 仅对 round 3 selected-module validation finding 做独立验证。

### 历史 CR TODO（非阻塞）

| # | 发现 | 状态 | 评估意见 |
|---|------|------|---------|
| - | 无 | - | Round 1 两项均曾被评为 P1 并已在 round 2 确认修复；round 3 未继承非阻塞 CR TODO。 |

---

## 发现 #1 评估

### 审查原文

> **[中][新] `files-index` 未拒绝未选择的 core / SDLC source refs**
> - 来源：blind+edge+auditor（主审查串行降级）
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

代码验证确认 reviewer 描述成立。`validateInstalledStateSelection` 会调用 `validateFilesIndexSelectedSourceRefs` 校验 files index（`src/validation/rules/manifest-schema.ts:380-384`），但当前 `validateFilesIndexSelectedSourceRefs` 只调用 `ecosystemModuleIdFromSourcePath(entry.sourceRef)`（`src/validation/rules/manifest-schema.ts:439-452`）。因此只有 `ecosystems/<category>/<id>/...` 可被映射为 module id 并与 `installedModules` 对比；`core-skills/...` 与 `sdlc-skills/...` 不会产生 module id。

同一文件已有 `sourcePackagePathMatchesModule` 对 `skill-index.entries.sourcePackagePath` 做 core / sdlc / ecosystem 归属判断（`src/validation/rules/manifest-schema.ts:395-417`、`src/validation/rules/manifest-schema.ts:475-488`），但该逻辑未复用于 `files-index.entries.sourceRef`。

临时复现进一步确认 gap：

- `installedModules: ["core"]`，`skill-index` / `help-index` / `phase-coverage` 均只包含 `core`，但 `files-index.entries[0].sourceRef` 指向 `assets/source/speclite/sdlc-skills/4-implementation/speclite-dev-story/SKILL.md` 时，`validateManifestSchema` 返回 `[]`。
- 同样 fixture 仅把 `sourceRef` 改成 `assets/source/speclite/ecosystems/frontend/react/speclite-react-project-context-and-review/SKILL.md` 时，会返回 `manifest-schema.malformed-field`，`affectedPath: "_speclite/_config/files-index.json"`，`field: "entries.sourceRef"`，`unexpectedModuleId: "ecosystem-frontend-react"`。

**严重性判断：偏低**

Reviewer 原始严重性为 `[中]`。Evaluator 将其升级为 **P1**，原因是 Story 10.6 AC2 / AC7 明确要求 runtime layout 与 validation 体现 selected-only projection，且 `files-index` 是 selected installed state 的机器可读索引之一。当前 gap 会让非法残留的 SDLC file projection 在 core-only manifest 中通过 `manifest-schema`，属于质量门禁缺口，不应进入最终 closeout / commit。

**修复建议：可行**

Reviewer 的建议可行：将 `ecosystemModuleIdFromSourcePath` 泛化为可识别 `core-skills/`、`sdlc-skills/`、`ecosystems/<category>/<id>/` 的 module id 解析函数，并让 `validateFilesIndexSelectedSourceRefs` 对所有可识别 module source refs 执行 `installedModules` 校验。修复时应保留对非 module source refs 的跳过语义，例如 `installed-state:*`、`bundled-runtime-compat:*`、`generated:*`，以及当前未定义为 install module 的 `scripts/` / `hooks/` / `support-skills/` 路径，除非产品契约另有明确要求。

建议补充 focused negative test：`installedModules: ["core"]` 且 `files-index.entries.sourceRef` 指向 `assets/source/speclite/sdlc-skills/...` 时，应返回 `manifest-schema.malformed-field`，`affectedPath: "_speclite/_config/files-index.json"`，`field: "entries.sourceRef"`。可同步补一条 core / sdlc 正向或非 module token 正向断言，防止误伤 runtime support refs。

**误报评估：非误报**

该 finding 可由当前代码路径和临时 fixture 复现直接证明，不是误报。

---

## Reviewer 漏报检查

在本轮限定范围内，未发现 reviewer 漏报的明显阻塞项。代码检查集中在 `src/validation/rules/manifest-schema.ts` 的 selected installed state 校验链路，以及 `test/validate-command.test.ts` 中现有 manifest-schema focused tests。现有 tests 覆盖 unselected ecosystem package root 与 core-only skill-index 场景，但未覆盖 core-only files-index 残留 `sdlc-skills/...` sourceRef 的负向场景，这与 reviewer finding 一致。

本轮未扩展审查 PPT / html-ppt 相关外部 drift，未执行全仓库 docs / build / packaging gate；这些不属于本次 round 3 finding 评估范围。

---

## 验证记录

| 命令 | 结果 |
|---|---|
| `npm test -- test/validate-command.test.ts` | 通过；1 个 test file / 21 个 tests passed。说明现有 focused suite 未覆盖本 finding。 |
| `npx tsx --eval <临时 core-only manifest + sdlc/ecosystem files-index sourceRef 对照复现>` | 通过执行；`sdlc-files-index-source-ref []`，`ecosystem-files-index-source-ref` 返回 `manifest-schema.malformed-field`，确认 `files-index` 只拒绝未选择 ecosystem refs，不拒绝未选择 SDLC refs。 |
| `npx tsx --eval <首次临时复现脚本>` | 失败；`Top-level await is currently not supported with the "cjs" output format`。已用 async wrapper 重跑同一复现逻辑并得到上方有效结果。 |
| `git diff --check --no-index /dev/null _bmad-output/implementation-artifacts/code-reviews/10-6-code-review/10-6-code-review-evaluation-20260707-round-3.md` | 通过；无 whitespace error 输出。该命令通过 wrapper 处理 no-index 对新增文件的 diff exit code。 |
| `node assets/source/speclite/support-skills/speclite-check-canonical-source-change/scripts/check_canonical_source_change.mjs --project-root . --scope all --format json` | 通过；hook 提示当前 canonical source 有外部变更后只读运行，返回 `status: "ok"`、`findings: []`。 |

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | `files-index` 未拒绝未选择的 core / SDLC source refs | [中] | **P1** | selected-only validation gate 缺口，可让 core-only installed state 残留 SDLC file projection 而不报 `manifest-schema` issue。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| - | 无 | - | - | 本轮 finding 直接影响质量门禁，不建议降级为 CR TODO。 |

### 可忽略（误报）

| # | 发现 | 原始严重性 | 忽略理由 |
|---|------|----------|---------|
| - | 无 | - | 本轮 finding 非误报。 |

### 评估决定

- **发现 #1（`files-index` 未拒绝未选择的 core / SDLC source refs）**：确认有效，升级为 P1，阻塞最终 closeout / commit。
- **Fixer 需求**：需要 fixer。
- **建议修复范围**：仅限 `src/validation/rules/manifest-schema.ts` 的 sourceRef -> module id 识别 / selectedModules 校验，以及相关 focused tests（优先 `test/validate-command.test.ts` 或等价 manifest-schema validation test）。不需要修改 Story 状态、CR 历史文件、PPT / html-ppt 相关文件。
- **Final verification / finalizer**：当前不允许继续；需修复并通过 round 4 CR evaluator 后再进入 final verification / finalizer。

## 操作边界

- 本轮只新增本 evaluation 文件。
- 本轮未修复代码或文档。
- 本轮未修改 Story 状态或 sprint status。
- 本轮未 commit。
- 本轮未 push。
- 本轮未触碰 PPT / html-ppt 相关外部 drift。

## 修复执行记录

### 修复执行记录
- **Date**: 2026-07-07
- **Model Used**: GPT-5 Codex (gpt-5-codex)
- **Fix Items**: 1

### Fix Summary（修复摘要）

1. **P1 #1：`files-index` 未拒绝未选择的 core / SDLC source refs**
   - 更新 `src/validation/rules/manifest-schema.ts`：新增统一的 `moduleIdFromSourcePath`，识别任意稳定 source root 下的 `core-skills/`、`sdlc-skills/` 与 `ecosystems/<category>/<id>/`。
   - `sourcePackagePathMatchesModule` 改为复用 `moduleIdFromSourcePath`，保持 `skill-index.entries.sourcePackagePath` 的 moduleId / source path 一致性校验。
   - `validateFilesIndexSelectedSourceRefs` 改为对所有可识别 module source refs 执行 `installedModules` 校验；`installed-state:*` 等非 canonical module source refs 仍不会被误判。
   - 扩展 `test/validate-command.test.ts`：新增 core-only installed state 下 `files-index.entries.sourceRef` 残留 `sdlc-skills/...` 的负向测试，断言返回 `manifest-schema.malformed-field`、`affectedPath: "_speclite/_config/files-index.json"`、`field: "entries.sourceRef"`、`unexpectedModuleId: "sdlc"`。

### Verification（验证）

- `npm test -- test/validate-command.test.ts`：通过，1 个 test file / 22 个 tests passed。
- `npm test -- test/git-source-resolution.test.ts test/local-source-integrity.test.ts test/registry-source-resolution.test.ts test/governance-report-command.test.ts test/validate-command.test.ts`：通过，5 个 test files / 66 个 tests passed。

### Boundary（边界）

- 未修改 Story 状态。
- 未执行 finalizer。
- 未 commit。
- 未 push。
- 未触碰 `assets/source/speclite/support-skills/speclite-docs-intro-ppt-creator/*`、`assets/source/speclite/support-skills/speclite-html-ppt-generator/**` 或 `.specskills/docs/analysis/speclite-canonical-source-governance-runner/2026-07-06-html-ppt-generator-decision-record.md`。
