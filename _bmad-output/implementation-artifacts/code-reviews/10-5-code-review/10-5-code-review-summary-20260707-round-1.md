---
Story: 10-5
Round: 1
Date: 2026-07-07
Model Used: GPT-5 Codex (gpt-5-codex)
Type: Code Review Summary
---

## 审查结论

首轮审查。Agent 工具不可用，本轮按 reviewer skill 降级为串行三层审查：Blind Hunter、Edge Case Hunter、Acceptance Auditor 均在当前上下文中执行。Focused tests 通过，白名单 diff whitespace check 通过；未运行 `npm run build` 与 `npm run release:packaging-check`，因为二者会写入 `dist/` 或刷新 packaging manifests，违反本轮 reviewer no-write 边界。发现 3 个中优先级 `patch` 桶问题，均直接影响 Story 10.5 的 AC3/AC5 release confidence，因此本轮不建议通过。

## 新发现

### 1. [中] core-only installed state bypasses selected-module validation

- **来源**：blind+edge+auditor
- **分类**：patch

- **证据**
  - `src/validation/rules/manifest-schema.ts:321-330` 中 `validateInstalledStateSelection` 在 `manifest.installedModules` 不包含 `sdlc` 时直接 `return undefined`。
  - `test/install-module-selection.test.ts:176-225` 已证明 `core` only 是支持的 selected install shape，且 `test/install-module-selection.test.ts:207-221` 断言该模式的 package roots 为 `core=13, total=13`。

- **影响**
  - AC3 要求 installed-state validation 使用 selected module truth；当前实现只在 `sdlc` selected 时执行 selected-state 校验。core-only installed state 若混入 unselected ecosystem `skill-index`、`files-index`、`phase-coverage` 或 `help-index` 条目，`validate` 不会通过这段逻辑拦截，selected module truth 存在空洞。

- **建议**
  - 移除 `!installedModules.includes("sdlc")` 的整体验证短路，改为对所有 manifest selected modules 执行 subset/missing-root/source-path/help-target/phase/files 校验。
  - 补充 core-only negative validation 用例：manifest 只有 `core`，但 indexes 中混入 `ecosystem-*` 条目时必须产生 `manifest-schema.malformed-field`。

### 2. [中] packaging ecosystem assertion is example-based instead of covering all nested ecosystem modules

- **来源**：blind+edge+auditor
- **分类**：patch

- **证据**
  - 当前 canonical source tree 有 8 个 ecosystem modules：backend `java-springboot`、`nodejs`、`python`，frontend `react`、`vue`，other `cli-tool`、`documentation-only`、`npm-package`。
  - `scripts/release/packaging-check.mjs:131-138` 的 `ecosystem-source-included` 只要求每个 category 至少出现一个 `SKILL.md`，并硬编码 `java-springboot`、`react`、`npm-package` 三个 `module.yaml`。
  - `test/release-packaging-check.test.ts:114-123` 与 `test/release-packaging-check.test.ts:264-288` 的 temp inventory 也只构造这 3 个 example modules。

- **影响**
  - AC5 要求 packaging manifest/release check 包含 nested ecosystem source files。当前 release gate 可以在 `nodejs`、`python`、`vue`、`cli-tool` 或 `documentation-only` source files 缺失时仍通过 `ecosystem-source-included`，门禁证明力度弱于当前 source tree。

- **建议**
  - 从 canonical source 或 package inventory 动态推导所有 `assets/source/speclite/ecosystems/<category>/<id>/module.yaml` 与其 `SKILL.md` package roots，并逐个断言存在。
  - 扩展 `test/release-packaging-check.test.ts`，至少覆盖一个同 category 非首选示例缺失会失败的 negative case。

### 3. [中] release packaging exclusion gate lacks cache/temp/build output assertions

- **来源**：blind+edge+auditor
- **分类**：patch

- **证据**
  - `scripts/release/packaging-check.mjs:163-164` 的 `release-fixtures-excluded` 只排除 `test/fixtures/` 和 `fixtures/`。
  - Story 10.5 重点审查要求 packaging manifest/release check 在包含 nested ecosystem source files 的同时排除 fixtures/cache/temp/build outputs。
  - `test/release-packaging-check.test.ts:70-147` 只验证 ecosystem source inclusion 与 `release/packaging-manifest.json` 不进入 package inventory，没有构造 cache/temp/build output 的负向 package inventory。

- **影响**
  - 若 canonical source 或 package inventory 中误入 `.cache/`、`tmp/`、`temp/`、ecosystem-local `dist/`、`build/` 等 generated outputs，当前 release gate 没有明确失败条件，可能把非 source artifact 打进 npm package。

- **建议**
  - 增加 `generated-output-excluded` assertion，集中判定 forbidden patterns，例如 `**/.cache/**`、`**/cache/**`、`**/tmp/**`、`**/temp/**`、ecosystem/source-local `dist/**` 与 `build/**`，同时保留 top-level `dist/bin/**` 作为 build output allowlist。
  - 增加 negative unit test：temp package inventory 含 forbidden generated output 时 `runPackagingCheck` 或对应 assertion 必须失败。

## 验证摘要

- `npm test -- test/source-and-modules.test.ts test/install-module-selection.test.ts test/runtime-structure.test.ts test/fixture-release-gates.test.ts test/canonical-source-change-check-script.test.ts test/release-packaging-check.test.ts` PASS（6 test files / 62 tests）
- `git diff --check -- <Story 10.5 File List tracked paths>` PASS
- `npm run build` 未运行：会写入 `dist/`，不符合本轮 reviewer no-write 边界；Story Dev Agent Record 记录为已通过。
- `npm run release:packaging-check` 未运行：会刷新 `release/packaging-manifest.json` 与 `dist/packaging-manifest.json`，不符合本轮 reviewer no-write 边界；Story Dev Agent Record 记录为已通过。
- 定向复核：静态检查 `package.json:44-46`，`release:verify`、`release:check`、`prepublishOnly` 均使用 `&&` 串行 build-first，没有发现 build 与 packaging-check 并行执行。

## 通过项

- Default no-ecosystem baseline 仍作为 explicit fixture baseline 保留；selected ecosystem install 的 summary/test 断言不再复用 `total=61` 作为全局 truth。
- Selected backend/frontend/other fixture cases 已注册到 fixture contract，并包含 selected Skill positive assertions 与同 category/cross-category/support Skill negative assertions。
- Canonical source checker 已识别 nested ecosystem modules、module-help coverage、default install total、ecosystem totals、stale count text 与 packaging manifest drift。
- `release/packaging-manifest.json` 当前实际包含 8 个 ecosystem modules 的 source files；本轮问题是 release gate assertion 不够泛化，而不是当前 manifest 缺少这些文件。
