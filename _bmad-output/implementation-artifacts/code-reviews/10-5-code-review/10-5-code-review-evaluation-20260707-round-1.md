---
Story: 10-5
Round: 1
Date: 2026-07-07
Model Used: GPT-5 Codex (gpt-5-codex)
Review Source: 10-5-code-review-summary-20260707-round-1.md
Review Model: GPT-5 Codex (gpt-5-codex)
Type: Code Review Evaluation
---

## 评估总结

对 Story 10-5 的第 1 轮 CR 代码审查结果（首轮）进行逐条评估。本轮 reviewer 提出 3 个 `[中] patch` 发现，分别指向 core-only installed state validation 短路、packaging ecosystem assertion 示例化、release packaging exclusion gate 缺少 cache/temp/build output 负向断言。经独立代码验证，3 个发现均有效，严重性判断合理，均属于 Story 10.5 AC3/AC5/Task 5 范围内的交付质量门禁缺口，应列入“需要修复（阻塞交付）”。

---

## 发现 #1 评估

### 审查原文

> **[中] core-only installed state bypasses selected-module validation**
> - 来源：blind+edge+auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

`src/validation/rules/manifest-schema.ts:321-330` 的 `validateInstalledStateSelection` 在 `manifest.installedModules` 不包含 `sdlc` 时直接 `return undefined`，因此后续 selected-module 校验不会执行。被短路的逻辑包括 `skillIndex.entries` 的 unexpected `moduleId` 拦截、missing module root 检查、`sourcePackagePath` 与 selected module 对齐、`phaseCoverage.rows.moduleId` 对齐、`filesIndex.entries.sourceRef` 对齐以及 help target 校验，见 `src/validation/rules/manifest-schema.ts:332-396` 和 `src/validation/rules/manifest-schema.ts:399-477`。

Story 10.5 AC3 明确要求 validate / status / update / repair 读取 installed state 时以 installed selected modules 为真相，且 unselected ecosystem source tree 不得参与 installed-state truth，见 `_bmad-output/implementation-artifacts/stories/10-5-ecosystem-fixture-and-release-gate-generalization.md:30-35`。同时，代码中已有 core-only install shape：`test/install-module-selection.test.ts:176-225` 证明 detailed config 可选择 `["core"]`，并断言 `installedModules` 为 `["core"]`、`canonicalPackageRoots=core=13, total=13`。因此 reviewer 指出的 core-only installed state 绕过 selected-module validation 是真实缺口。

**严重性判断：合理**

原始 `[中]` 合理。该问题不是直接安全漏洞，但会让 supported core-only installed state 无法被 selected truth 校验覆盖，违反 AC3 的 deterministic validation 目标，并可能使 unselected ecosystem 条目进入 installed-state indexes 后仍通过 validate。按评估模板优先级定义，应作为功能/质量门禁违规处理，评估为 P1 阻塞交付。

**修复建议：可行**

移除 `!installedModules.includes("sdlc")` 的整体验证短路，并让现有 selected module 校验覆盖所有 `manifest.installedModules` 是可行方向。还应补 core-only negative validation 用例，证明 manifest 只有 `core` 时，混入 ecosystem `skill-index`、`files-index`、`phase-coverage` 或 `help-index` 条目会产生 `manifest-schema.malformed-field`。

**误报评估：非误报**

该 finding 有直接代码短路证据，也有 core-only installed state 的测试证据，不是误报。

---

## 发现 #2 评估

### 审查原文

> **[中] packaging ecosystem assertion is example-based instead of covering all nested ecosystem modules**
> - 来源：blind+edge+auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

当前 canonical source tree 下存在 8 个 ecosystem module：`assets/source/speclite/ecosystems/backend/java-springboot/module.yaml`、`backend/nodejs/module.yaml`、`backend/python/module.yaml`、`frontend/react/module.yaml`、`frontend/vue/module.yaml`、`other/cli-tool/module.yaml`、`other/documentation-only/module.yaml`、`other/npm-package/module.yaml`。但 `scripts/release/packaging-check.mjs:131-138` 的 `ecosystem-source-included` assertion 只证明每个 category 至少有一个 `SKILL.md`，并硬编码检查 `java-springboot`、`react`、`npm-package` 三个 `module.yaml`。

测试侧也只构造这 3 个示例 module：`test/release-packaging-check.test.ts:114-123` 断言 package files 包含 `java-springboot`、`react`、`npm-package` 的 `module.yaml` / `SKILL.md`，`test/release-packaging-check.test.ts:264-288` 的 `writeRequiredRuntimeAssets` 也只写入这 3 个 ecosystem module。Story 10.5 AC5 要求 packaging assertions 必须证明 bundled source includes `assets/source/speclite/ecosystems/**`，见 `_bmad-output/implementation-artifacts/stories/10-5-ecosystem-fixture-and-release-gate-generalization.md:45-50`；Epic 10 completion gate 也要求 packaging manifest 和 fixture release gate 不再把 official source hardcode 为 only core+sdlc，见 `_bmad-output/planning-artifacts/epics/13-epic-10-canonical-source-ecosystem-module-governancecanonical-source-生态模块治理.md:111-117`。

**严重性判断：合理**

原始 `[中]` 合理。当前 `release/packaging-manifest.json` 可能实际包含 8 个 module，但 release gate assertion 只证明 3 个示例存在，无法防止 `nodejs`、`python`、`vue`、`cli-tool`、`documentation-only` 之一缺包时仍通过门禁。该缺口削弱 AC5 的 release confidence，应评估为 P1 阻塞交付。

**修复建议：可行**

从 canonical source 或 package inventory 动态枚举 `assets/source/speclite/ecosystems/<category>/<id>/module.yaml` 及对应 package roots，然后逐个断言 package inventory 包含这些 source files，是可行且更贴合 Story 10.5 “泛化”目标的修复方向。测试应至少覆盖同 category 非硬编码示例缺失时 assertion 失败。

**误报评估：非误报**

该 finding 与现有代码、测试、Story AC 均一致，不是误报。

---

## 发现 #3 评估

### 审查原文

> **[中] release packaging exclusion gate lacks cache/temp/build output assertions**
> - 来源：blind+edge+auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

`scripts/release/packaging-check.mjs:163-164` 的 `release-fixtures-excluded` assertion 只排除 `test/fixtures/` 和 `fixtures/`。对应的 manifest metadata 也只记录 `excludedFixtureDirectories` 为 `test/fixtures/` 与 `fixtures/`，见 `release/packaging-manifest.json:1373-1376`；assertion 列表中也只有 `release-fixtures-excluded`，见 `release/packaging-manifest.json:1417-1420`。`test/release-packaging-check.test.ts:70-147` 的 packaging test 覆盖 manifest 写入、runtime manifest 对齐、示例 ecosystem source inclusion 和 `release/packaging-manifest.json` 不进入 package inventory；`test/release-packaging-check.test.ts:195-261` 覆盖 packaged documentation examples classification，但没有 cache/temp/build output 的负向 inventory case。

Story 10.5 AC2 要求 fixtures 不泄漏 cache/temp/build path，AC5 要求 release fixtures 或 fixture outputs 不进入 npm package，Task 5 又明确要求确认 `test/fixtures/`、`fixtures/`、cache/temp/build output 仍被排除，见 `_bmad-output/implementation-artifacts/stories/10-5-ecosystem-fixture-and-release-gate-generalization.md:22-29`、`45-50`、`93-98`。因此 reviewer 指出的 exclusion gate 缺少 cache/temp/build output 负向断言成立。

**严重性判断：合理**

原始 `[中]` 合理。该问题不表示当前 package inventory 已经包含 generated output，但 release gate 没有明确失败条件来阻止 `.cache/`、`cache/`、`tmp/`、`temp/`、source-local `dist/`、`build/` 等误入 npm package。由于 Story 10.5 把该排除项列为 Task 5 收口要求，缺口应评估为 P1 阻塞交付。

**修复建议：可行**

新增 `generated-output-excluded` 或等价 assertion，并集中维护 forbidden package path patterns 是可行方向。需要谨慎保留允许项，例如 top-level `dist/bin/**`、`dist/packaging-manifest.json` 属于当前 package build/runtime output，不应被 source-local generated output 排除规则误伤。测试应构造含 forbidden generated output 的 temp package inventory，并断言 packaging check assertion 失败。

**误报评估：非误报**

该 finding 有直接代码与测试缺口证据，并对应 Story 10.5 明确任务，不是误报。

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | core-only installed state bypasses selected-module validation | [中] | **P1** | core-only 是已支持 install shape，但当前 selected-state validation 对非 `sdlc` manifest 整体短路，违反 AC3。 |
| 2 | packaging ecosystem assertion is example-based instead of covering all nested ecosystem modules | [中] | **P1** | 当前 canonical source 有 8 个 ecosystem module，release gate 只证明 3 个示例 module，无法泛化证明 AC5。 |
| 3 | release packaging exclusion gate lacks cache/temp/build output assertions | [中] | **P1** | Story 10.5 Task 5 明确要求 cache/temp/build output 排除，但 release gate 只排除 fixture 目录。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| - | - | - | - | 本轮无建议降级为 CR TODO 的发现。 |

### 可忽略（误报）

| # | 发现 | 原始严重性 | 忽略理由 |
|---|------|----------|---------|
| - | - | - | 本轮无误报。 |

### 评估决定

- **发现 #1（core-only installed state bypasses selected-module validation）**：确认有效，原始 `[中] patch` 合理；需要 fixer 修复并补 core-only negative validation。
- **发现 #2（packaging ecosystem assertion is example-based instead of covering all nested ecosystem modules）**：确认有效，原始 `[中] patch` 合理；需要 fixer 将 packaging assertion 泛化到全部 nested ecosystem modules，并补缺失非示例 module 的 negative test。
- **发现 #3（release packaging exclusion gate lacks cache/temp/build output assertions）**：确认有效，原始 `[中] patch` 合理；需要 fixer 增加 generated output exclusion gate 和负向测试。
- **CR closeout 决定**：不允许进入 CR closeout。需先由 fixer 处理以上 3 个 P1 阻塞项，并在后续 CR round 中复审通过后再进入 closeout。

## 修复执行记录

### 修复执行记录
- **Date**: 2026-07-07
- **Model Used**: GPT-5 Codex (gpt-5-codex)
- **Fix Items**: 3

#### 修复条目

| # | P1 | 修改位置 | 修复结果 |
|---|----|---------|---------|
| 1 | core-only installed state 会绕过 selected-module validation | `src/validation/rules/manifest-schema.ts`、`test/validate-command.test.ts` | 移除 `validateInstalledStateSelection` 对非 `sdlc` manifest 的整体短路；新增 core-only installed state 混入 unselected ecosystem package root 的负向 validation，断言产生 `manifest-schema.malformed-field`。 |
| 2 | packaging ecosystem assertion 只覆盖示例 module，未覆盖全部 8 个 nested ecosystem modules | `scripts/release/packaging-check.mjs`、`test/release-packaging-check.test.ts`、`release/packaging-manifest.json` | release gate 从 canonical source 动态枚举 `assets/source/speclite/ecosystems/<category>/<id>/module.yaml` 和对应 `SKILL.md`，`ecosystem-source-included` 逐项比对 package inventory；新增 backend/nodejs 非示例 module 缺失的负向测试。 |
| 3 | release packaging exclusion gate 缺少 cache/temp/build output 负向断言 | `scripts/release/packaging-check.mjs`、`test/release-packaging-check.test.ts`、`release/packaging-manifest.json` | 新增 `generated-output-excluded` assertion，排除 `.cache/`、`cache/`、`tmp/`、`temp/`、`build/` 与 source-local `dist/`，同时保留 top-level `dist/bin/**` 和 `dist/packaging-manifest.json`；新增 cache/temp/build output 负向测试。 |

#### 验证记录

- `npm run build`：通过。
- `npm test -- test/validate-command.test.ts test/release-packaging-check.test.ts test/fixture-release-gates.test.ts test/canonical-source-change-check-script.test.ts`：通过，4 个 test files / 38 个 tests。
- `node assets/source/speclite/support-skills/speclite-check-canonical-source-change/scripts/check_canonical_source_change.mjs --project-root . --scope all --format json`：通过，`status=ok`，`findings=[]`。
- `npm run release:packaging-check`：通过，已刷新 `release/packaging-manifest.json` 与 `dist/packaging-manifest.json`。
- `git diff --check -- src scripts test release dist _bmad-output/implementation-artifacts/code-reviews/10-5-code-review/10-5-code-review-evaluation-20260707-round-1.md`：通过，无输出。

#### 后续状态

- 3 个 evaluator 确认的 P1 均已完成 fixer 修复。
- 未执行 reviewer、evaluator、finalizer。
- 未修改 Story 文件或 `sprint-status.yaml`。
- 未 commit，未 push。
- 建议进入下一轮 CR reviewer 复审，确认 3 个 P1 修复是否满足 closeout 前置条件。
