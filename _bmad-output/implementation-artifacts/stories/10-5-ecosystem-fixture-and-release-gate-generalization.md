# Story 10.5: Ecosystem Fixture And Release Gate Generalization（生态 Fixture 与发布门禁泛化）

Status: ready-for-dev

<!-- Expansion Story: 将 fixture、release gate、packaging manifest、canonical source check 和 installed-state validation 从固定 core+sdlc baseline 泛化到 selected ecosystem matrix。 -->

## Story（故事）

作为 SpecLite 维护者，
我希望 fresh install、existing update、resolve parity、IDE drift、packaging manifest、canonical source check 和 release gates 能覆盖 selected ecosystem modules 与 unselected negative assertions，
以便 Epic 10 引入 frontend、backend、other ecosystem modules 后，发布门禁不再依赖 only `core+sdlc` 的静态包数量，也不会把 optional ecosystem source 误装或漏包。

## Acceptance Criteria（验收标准）

1. **Default baseline remains explicit but not global truth（默认 baseline 明确但不是全局真相）**
   **前提** `core` required、`sdlc` default selected、ecosystem optional；
   **当** default no-ecosystem install 运行；
   **则** fixture 仍可断言 default baseline 的 `core` + `sdlc` package count；
   **并且** `CORE_SDLC_BASELINE_ENTRY_COUNT`、fixture text、docs counts 和 ready summary 不得被当作 selected ecosystem installs 的全局 expected count；
   **并且** selected ecosystem install 的 expected count 必须由 selected module package roots 推导或由 fixture case 独立声明。

2. **Fixture matrix covers selected ecosystems（Fixture 矩阵覆盖已选择生态）**
   **前提** source tree 有 backend、frontend、other ecosystem examples；
   **当** fixture release gates 运行；
   **则** 至少包含 default no-ecosystem fixture、selected backend ecosystem fixture、selected frontend ecosystem fixture 和 selected other ecosystem fixture；
   **并且** 每个 selected fixture 必须断言 selected ecosystem Skill 出现；
   **并且** 每个 selected fixture 必须断言同 category 未选择 ecosystem 和跨 category ecosystem 不出现；
   **并且** fixtures 不得泄漏本机绝对路径、cache/temp/build path、ANSI-only semantics 或 non-deterministic generatedAt。

3. **Installed-state validation uses selected module truth（安装状态验证使用 selected module 真相）**
   **前提** `_speclite/_config/manifest.yaml`、skill index、help index、files index 和 phase coverage 存在；
   **当** validate / status / update / repair 读取 installed state；
   **则** expected package roots、skill index entry count、help rows、phase rows 和 files index entries 必须基于 installed selected modules；
   **并且** unselected ecosystem source tree 不得参与 installed-state truth；
   **并且** repair 不得因为 bundled source 有未选 ecosystem packages 就补装它们。

4. **Canonical source change check understands nested ecosystems（Canonical source 检查理解嵌套生态）**
   **前提** `assets/source/speclite/ecosystems/<category>/<id>/` 存在；
   **当** `speclite-check-canonical-source-change` 运行；
   **则** 它必须统计 ecosystem modules 与 package roots；
   **并且** 检查每个 ecosystem module 的 `module-help.csv` 覆盖；
   **并且** 报告 default install total 与 optional ecosystem totals 时不得混淆；
   **并且** stale docs scan 必须捕获 only core+sdlc、固定 total、缺少 ecosystem docs 或 packaging drift。

5. **Packaging manifest includes ecosystem source files（打包清单包含生态源文件）**
   **前提** npm package release gate 运行；
   **当** `npm pack --dry-run --json` 生成 package inventory；
   **则** `release/packaging-manifest.json` 与 `dist/packaging-manifest.json` 必须包含 nested ecosystem module source files；
   **并且** packaging assertions 必须证明 bundled source includes `assets/source/speclite/ecosystems/**`；
   **并且** release fixtures 仍不得把 `test/fixtures/` 或 fixture outputs 打进 npm package。

6. **Release gates are serial and build-first（发布门禁保持串行且先 build）**
   **前提** Story 10.5 修改 tests、fixtures、source checks 或 packaging manifest；
   **当** release verification 执行；
   **则** 必须先运行 `npm run build`；
   **并且** 再运行 focused tests / fixture gates；
   **并且** 最后运行 `npm run release:packaging-check`；
   **并且** 不得并行运行会读写 `dist/` 或 packaging manifests 的命令。

7. **Docs describe fixture ownership and ecosystem matrix（文档说明 fixture ownership 与生态矩阵）**
   **前提** public docs 和 maintainer docs 更新；
   **当** 维护者查阅 release confidence / fixture contract；
   **则** docs 必须说明 default baseline、selected ecosystem fixture cases、negative assertions、packaging boundary 和 canonical source check 的职责；
   **并且** docs 必须说明 optional ecosystem modules 不改变 default install guarantee；
   **并且** docs 不得继续把 `core=13, sdlc=51, total=64` 写成长期全局真相。

## Tasks / Subtasks（任务 / 子任务）

- [ ] Task 1: Preflight and fixture inventory（AC: 1-7）
  - [ ] 读取 Story 10.1 到 Story 10.4、Epic 10、`test/fixtures/`、`src/fixtures/fixture-contract.ts`、`test/fixture-release-gates.test.ts`。
  - [ ] 读取 `src/validation/rules/manifest-schema.ts`，定位 `CORE_SDLC_BASELINE_ENTRY_COUNT` 和相关 count assertions。
  - [ ] 读取 `scripts/release/packaging-check.mjs`、`test/release-packaging-check.test.ts`、`release/packaging-manifest.json`。
  - [ ] 读取 `speclite-check-canonical-source-change` 脚本与 tests。
  - [ ] 检查当前 worktree 是否已有 fixture / manifest / dist drift；只处理本 Story 范围内文件。

- [ ] Task 2: Split default baseline from selected module expectations（AC: 1, 3）
  - [ ] 将 manifest-schema validation 的 fixed count 改为基于 selected installed modules / manifest data 推导；保留 default no-ecosystem fixture 的 explicit expected count。
  - [ ] 更新 ready summary / prewrite prompt count 文案，使 default baseline 与 selected ecosystem counts 可并存。
  - [ ] 更新 tests，证明 default no-ecosystem 仍为 `core+sdlc`，selected ecosystem count 增加只影响对应 selected case。

- [ ] Task 3: Add selected ecosystem fixture cases（AC: 2-3）
  - [ ] 新增或扩展 fixture cases：selected backend、selected frontend、selected other。
  - [ ] 每个 fixture case 写入 expected command JSON、installed tree / indexes、human output semantic assertions。
  - [ ] 对每个 selected case 添加 unselected negative assertions：同 category 未选 module absent、跨 category modules absent、support-skills absent。
  - [ ] 将 fixture cases 注册到 `src/fixtures/fixture-contract.ts`，并更新 `test/fixture-contract.test.ts`。

- [ ] Task 4: Generalize canonical source change check（AC: 4, 7）
  - [ ] 扩展 counts：`core`、`sdlc`、`support`、`hooks`、`ecosystems.byCategory`、`ecosystems.totalPackageRoots`、`defaultInstall.total`。
  - [ ] 对每个 ecosystem module 运行 `module-help.csv` coverage check。
  - [ ] 更新 stale text scan，识别 docs / fixtures / source 中 outdated static counts 和 only core+sdlc wording。
  - [ ] 更新 `test/canonical-source-change-check-script.test.ts`，加入 nested ecosystem fixture 和 expected findings。

- [ ] Task 5: Generalize packaging manifest assertions（AC: 5-6）
  - [ ] 更新 `scripts/release/packaging-check.mjs`，确保 runtime assets / assertions 覆盖 nested ecosystem source files。
  - [ ] 更新 `test/release-packaging-check.test.ts`，构造 temp package inventory 中的 `assets/source/speclite/ecosystems/.../SKILL.md` 与 `module.yaml`。
  - [ ] 重新生成 `release/packaging-manifest.json` 和 `dist/packaging-manifest.json`，并确认 package hash 只反映真实 package inventory。
  - [ ] 确认 `test/fixtures/`、`fixtures/`、cache/temp/build output 仍被排除。

- [ ] Task 6: Update docs and maintainer guidance（AC: 7）
  - [ ] 更新 `docs/reference/canonical-source-layout.md`、`docs/reference/runtime-layout.md`、`docs/reference/skills/support-skills.md`。
  - [ ] 更新 fixture README / docs，说明 selected ecosystem matrix 和 negative assertions。
  - [ ] 更新 release SOP 或 maintainer docs，明确 `npm run build` -> focused tests -> `npm run release:packaging-check` 的顺序。

- [ ] Task 7: Verification（AC: 1-7）
  - [ ] 运行 `npm run build`。
  - [ ] 运行 focused tests：`npm test -- test/source-and-modules.test.ts test/install-module-selection.test.ts test/runtime-structure.test.ts test/fixture-release-gates.test.ts test/canonical-source-change-check-script.test.ts test/release-packaging-check.test.ts`。
  - [ ] 运行 canonical source check：`node assets/source/speclite/support-skills/speclite-check-canonical-source-change/scripts/check_canonical_source_change.mjs --project-root . --scope all --format json`。
  - [ ] 运行 `npm run release:packaging-check`。
  - [ ] 运行 `git diff --check -- assets/source/speclite docs src test release dist _bmad-output/implementation-artifacts/stories/10-5-ecosystem-fixture-and-release-gate-generalization.md`。

## Dev Notes（开发备注）

### Source Requirements（需求来源）

- Epic 10 要求 Story 10.5 将 fresh install、existing update、resolve parity、IDE drift、packaging manifest 和 canonical source check 从 `core+sdlc` baseline 泛化到 selected ecosystem matrix，并增加 unselected negative assertions。
- Story 10.1 定义 selected-only installed projection；Story 10.3 / 10.4 分别引入 frontend / other category examples；10.5 必须把这些作为 release confidence matrix，而不是只更新 docs。

### Current Verified Baseline（当前已验证基线）

- `test/fixtures/fresh-install-empty-project/README.md` 当前写明 default `core+sdlc` baseline 必须安装 64 个 package roots。
- `test/fixtures/fresh-install-empty-project/expected/command-json/fresh-install-success.json` 当前 summary 包含 `core=13, sdlc=51, total=64`。
- `src/validation/rules/manifest-schema.ts` 当前有 `CORE_SDLC_BASELINE_ENTRY_COUNT = 64`，并用该值校验 skill index、help index、phase coverage 等 entry count。
- `speclite-check-canonical-source-change` 当前 counts 和 `checkModuleHelp` 主要覆盖 `core-skills` 与 `sdlc-skills`，尚未表达 `ecosystems/**`。
- `scripts/release/packaging-check.mjs` 当前 required runtime assets 包含 `core-skills/module.yaml` 与 `sdlc-skills/module.yaml`，bundled-source assertion 只是检查存在 `assets/source/speclite/` 文件。

### Previous Story Intelligence（前序 Story 情报）

- Story 10.1 只负责 nested discovery、ecosystem metadata、首批 backend migration 和最小 selected-only proof；10.5 必须消费这份最小 proof，并把 fixture、fixed count、release packaging 和 canonical source check 扩展到 selected ecosystem matrix。
- Story 10.1 的最小 proof 不等同于 full release confidence；不得要求 10.1 完成 frontend / other / full matrix fixture 泛化，也不得把 10.5 的 release gate ownership 回压给 10.1。
- Story 10.1 要求未选择的 ecosystem modules 不进入 IDE mirrors、skill-index、help-index、phase-coverage 或 files-index。
- Story 10.2 要求 canonical source change check 覆盖 nested ecosystem package roots、module-help drift、docs stale counts 和 packaging manifest drift。
- Story 10.3 / 10.4 都要求 category 内部和 cross-category negative assertions；10.5 是这些 assertions 的 fixture / release gate 落点。

### Scope Boundary（范围边界）

- 本 Story 拥有 full matrix fixture、fixed count 泛化、release packaging manifest、canonical source check 和 installed-state validation 的全面泛化；这些不由 Story 10.1 负责。
- 本 Story 必须以 Story 10.1 的 backend 最小 selected-only proof 为输入，再扩展到 selected backend、selected frontend、selected other 和 cross-category negative assertions。
- 不把 optional ecosystem modules 加入 default install baseline。
- 不用单一 global entry count 代表所有 install states。
- 不并行运行 `npm run build` 与 `npm run release:packaging-check`。
- 不通过修改 expected snapshots 掩盖 source / docs / manifest drift；必须同步 owning code 和 docs。

### Testing Guidance（测试指引）

- 对 count 逻辑使用 selected module metadata 推导，避免每新增 ecosystem 都要改全局常量。
- 对 fixture stable JSON 继续排除 non-deterministic `generatedAt` 或本机路径。
- 对 packaging manifest 既要检查 ecosystem source included，也要检查 fixtures excluded。
- 对 canonical source check 保持 warning-only exit 0，但 findings 必须足够诊断。

### References（参考）

- [Source: `_bmad-output/planning-artifacts/epics/13-epic-10-canonical-source-ecosystem-module-governancecanonical-source-生态模块治理.md#Story-10.5`]
- [Source: `_bmad-output/implementation-artifacts/stories/10-1-ecosystem-module-taxonomy-and-guided-selected-install-closure.md#Evidence-Plan`]
- [Source: `_bmad-output/implementation-artifacts/stories/10-2-ecosystem-authoring-contract-and-creator-support.md#Acceptance-Criteria`]
- [Source: `_bmad-output/implementation-artifacts/stories/10-3-frontend-ecosystem-source-expansion.md#Acceptance-Criteria`]
- [Source: `_bmad-output/implementation-artifacts/stories/10-4-other-ecosystem-source-expansion.md#Acceptance-Criteria`]
- [Source: `src/validation/rules/manifest-schema.ts#CORE_SDLC_BASELINE_ENTRY_COUNT`]
- [Source: `test/fixture-release-gates.test.ts#fresh-install-empty-project-release-gate-fixture`]
- [Source: `scripts/release/packaging-check.mjs#createPackagingManifest`]
- [Source: `assets/source/speclite/support-skills/speclite-check-canonical-source-change/scripts/check_canonical_source_change.mjs#createReport`]

## Dev Agent Record（开发代理记录）

### Agent Model Used（使用模型）

待实现后填写。

### Debug Log References（调试日志引用）

待实现后填写。

### Completion Notes List（完成说明）

待实现后填写。

### File List（文件清单）

待实现后填写。

## Change Log（变更记录）

| Date | Version | Description | Author |
| --- | --- | --- | --- |
| 2026-07-06 | 0.1 | 创建 Story 10.5，定义 selected ecosystem fixture matrix、installed-state count 泛化、canonical source check、packaging manifest 和 release gate 验收。 | John / Codex |
