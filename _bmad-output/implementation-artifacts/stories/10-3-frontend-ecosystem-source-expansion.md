# Story 10.3: Frontend Ecosystem Source Expansion（前端生态源定义扩展）

Status: ready-for-dev

<!-- Expansion Story: 在 Story 10.1 的 ecosystem module foundation 与 Story 10.2 的 authoring contract 之后，建立首批 frontend ecosystem modules，并证明 frontend 选择不会污染 backend / other runtime。 -->

## Story（故事）

作为需要在前端项目中使用 SpecLite 的开发者和维护者，
我希望 SpecLite 能提供首批 `ecosystems/frontend/<id>/` 官方生态模块，例如 React 与 Vue，
以便前端项目可以安装更贴近组件架构、状态管理、测试、可访问性、构建和迁移场景的 Skill，同时没有选择 frontend ecosystem 的项目不会被这些前端能力污染。

## Acceptance Criteria（验收标准）

1. **Frontend ecosystem modules are explicit（前端生态模块显式存在）**
   **前提** Story 10.1 已支持 nested ecosystem module discovery；
   **当** 维护者新增前端生态源定义；
   **则** 首批 frontend modules 必须位于 `assets/source/speclite/ecosystems/frontend/react/` 与 `assets/source/speclite/ecosystems/frontend/vue/`；
   **并且** module code 分别为 `ecosystem-frontend-react` 与 `ecosystem-frontend-vue`；
   **并且** 每个 module root 必须有 `module.yaml`、`module-help.csv` 和至少一个有效 Skill package root；
   **并且** `module_kind: ecosystem`、`ecosystem_category: frontend`、`ecosystem_id`、`required_dependencies: [sdlc]`、`default_selected: false`、`required: false` 必须通过 metadata validation。

2. **Frontend package content is ecosystem-specific（前端包内容具备生态特异性）**
   **前提** React / Vue ecosystem modules 被选择安装；
   **当** 用户运行对应 Skill；
   **则** React module 至少提供与 React 项目事实相关的 Skill，例如组件架构 / hook state / routing / test strategy / migration review 中的一项或多项；
   **并且** Vue module 至少提供与 Vue 项目事实相关的 Skill，例如 Composition API / SFC structure / routing / state / test strategy / migration review 中的一项或多项；
   **并且** Skill 不得伪造具体框架版本或 API 细节，必须从目标项目文件、lockfile、官方 docs 或用户提供资料中取证；
   **并且** 通用 UX、PRD、Architecture、Story creation 和 code review workflow 仍留在 `sdlc`，不因 frontend module 存在而迁移。

3. **Two-level install selection handles frontend category（两级安装选择支持前端类别）**
   **前提** 用户交互式运行 `speclite install` 且选择包含 `sdlc`；
   **当** installer 展示 ecosystem recommendation；
   **则** category 层必须包含 `frontend`；
   **并且** 用户选择 `frontend` 后只看到 frontend ecosystem ids，例如 `react`、`vue`；
   **并且** 用户 skip frontend 是合法路径；
   **并且** `--yes`、`--json`、无 selector 默认路径不得自动选择 React / Vue module。

4. **Selected-only projection prevents cross-category leakage（选择性投影防止跨类别污染）**
   **前提** source tree 中同时存在 frontend、backend 和 other ecosystem modules；
   **当** 用户只选择 `ecosystem-frontend-react`；
   **则** `.claude/skills/`、`.agents/skills/`、`skill-index-full.json`、`help-index.json`、`phase-coverage.json`、`files-index-full.json` 只能包含 `core`、`sdlc` 与 React ecosystem package；
   **并且** Vue、backend、other 未选 ecosystem packages 不得出现在 IDE mirrors、help rows、phase rows、files index 或 ready summary；
   **并且** 只选择 Vue 时也必须对 React 作同等 negative assertion。

5. **Frontend module help is complete and discoverable（前端 module help 完整可发现）**
   **前提** frontend ecosystem Skill package 被创建；
   **当** `discoverOfficialModules` 读取 frontend module；
   **则** 每个 package root 必须至少有一条非 `_meta` `module-help.csv` row；
   **并且** help row 必须包含稳定 display name、menu code 或 action、phase、output location 和 artifact type；
   **并且** duplicate module code、duplicate skill id、unknown help row、unknown dependency 必须继续 fail fast。

6. **Docs and examples teach frontend ecosystem boundaries（文档和示例说明前端生态边界）**
   **前提** frontend ecosystem modules 进入 canonical source；
   **当** 用户阅读 public docs 或 maintainer docs；
   **则** docs 必须说明 React / Vue modules 是 optional ecosystem extensions；
   **并且** docs 必须说明 SpecLite 本身仍是 CLI + filesystem control plane，不因 frontend ecosystem module 而新增 Web UI product scope；
   **并且** docs 必须说明 generic frontend discussion belongs in `sdlc` unless it is bound to a concrete framework ecosystem。

7. **Release and canonical source checks cover frontend ecosystems（发布与 canonical 检查覆盖前端生态）**
   **前提** React / Vue ecosystem source files 存在；
   **当** release gate 运行；
   **则** packaging manifest 必须包含 selected frontend ecosystem source files；
   **并且** canonical source check 必须检查 frontend module-help rows、stale docs counts 和 package inventory；
   **并且** focused install tests 必须覆盖 default no-ecosystem baseline、selected React、selected Vue 和 unselected leakage negative assertions。

## Tasks / Subtasks（任务 / 子任务）

- [ ] Task 1: Preflight and contract review（AC: 1-7）
  - [ ] 读取 Story 10.1、Story 10.2、Epic 10、`assets/source/speclite/README.md`、`docs/reference/canonical-source-layout.md`、`docs/explanation/speclite-modules.md`。
  - [ ] 检查当前是否已有 `assets/source/speclite/ecosystems/frontend/`、React、Vue 或 frontend-specific canonical package roots；若存在，作为用户已有变更处理，不移动或删除。
  - [ ] 读取 implementation anchors：`src/modules/module-metadata.ts`、`src/modules/module-selection.ts`、`src/commands/install.ts`、`src/ide/target-writer.ts`、`test/source-and-modules.test.ts`、`test/install-module-selection.test.ts`、`test/runtime-structure.test.ts`。
  - [ ] 读取 docs anchors：`_bmad-output/planning-artifacts/ux-design-specification.md`，确认 SpecLite MVP 不新增 Web / GUI scope。

- [ ] Task 2: Create React and Vue ecosystem module source roots（AC: 1, 5）
  - [ ] Dependency Gate: 在创建任何 `assets/source/speclite/ecosystems/frontend/**` package root 前，必须读取 Story 10.2 completion evidence，确认 ecosystem authoring contract、creator / lint、module-help 和 changelog discipline 已完成。
  - [ ] 如果 Story 10.2 尚未完成，本 Task 只能执行 discovery / preflight，不得创建 React / Vue module root；除非本 Story 明确采用等价策略，并把最小 creator / lint contract 写入本 Story，同时要求 Story 10.2 fixer 反向吸收该 contract。
  - [ ] 创建 `assets/source/speclite/ecosystems/frontend/react/module.yaml`，module code 为 `ecosystem-frontend-react`。
  - [ ] 创建 `assets/source/speclite/ecosystems/frontend/vue/module.yaml`，module code 为 `ecosystem-frontend-vue`。
  - [ ] 为两个 modules 创建 `module-help.csv`，每个 package root 至少一条非 `_meta` row。
  - [ ] 保持 `required_dependencies: [sdlc]`、`default_selected: false`、`required: false`。

- [ ] Task 3: Add seed frontend ecosystem Skill packages（AC: 2, 5-6）
  - [ ] Dependency Gate: 只有 Story 10.2 authoring contract 完成，或本 Story 已记录等价策略并可被 10.2 反向吸收时，才可创建 seed Skill package files。
  - [ ] 使用 Story 10.2 的 creator / lint contract 创建 React seed Skill，例如 `speclite-react-project-context-and-review` 或同等 package id。
  - [ ] 使用 Story 10.2 的 creator / lint contract 创建 Vue seed Skill，例如 `speclite-vue-project-context-and-review` 或同等 package id。
  - [ ] 每个 seed Skill 必须包含 `SKILL.md`、`SKILL.en.md`、`CHANGELOG.md`，并按需使用 `references/` 承载具体流程。
  - [ ] Skill 内容必须以项目事实提取、版本证据、组件 / 状态 / 测试 / 构建策略审查为中心，不硬编码未验证的 framework 版本。
  - [ ] 不迁移 `speclite-create-ux-design`、`speclite-create-architecture`、`speclite-check-implementation-readiness` 等 generic workflow。

- [ ] Task 4: Extend install selection and selected-only tests for frontend（AC: 3-4）
  - [ ] 增加 module selection tests：交互式 category 选择包含 `frontend`，选择后只列 React / Vue。
  - [ ] 增加 default install tests：`--yes` / JSON 默认路径仍只选择 `core` + `sdlc`，不安装 React / Vue。
  - [ ] 增加 selected React install tests，断言 React Skill 出现在 `.claude/skills`、`.agents/skills`、indexes 和 ready summary，Vue / backend / other absent。
  - [ ] 增加 selected Vue install tests，断言 Vue Skill 出现，React / backend / other absent。

- [ ] Task 5: Update docs and source inventory（AC: 6-7）
  - [ ] 更新 `assets/source/speclite/README.md`，列出 `ecosystems/frontend/react/` 与 `ecosystems/frontend/vue/` 的 role 和 authoring rule。
  - [ ] 更新 `docs/reference/canonical-source-layout.md` 与 `docs/explanation/speclite-modules.md`，说明 frontend ecosystem modules optional、selected-only、依赖 `sdlc`。
  - [ ] 更新 `docs/reference/skills/` 下相关 catalog，说明 React / Vue packages 的入口与 default install 边界。
  - [ ] 更新 package / release docs 中的 static count 表达，避免 only core+sdlc 成为长期真相。

- [ ] Task 6: Verification（AC: 1-7）
  - [ ] 运行 focused source tests：`npm test -- test/source-and-modules.test.ts test/install-module-selection.test.ts`。
  - [ ] 运行 selected projection tests：`npm test -- test/runtime-structure.test.ts test/install-command.test.ts` 或当前等价测试文件。
  - [ ] 运行 canonical source check：`node assets/source/speclite/support-skills/speclite-check-canonical-source-change/scripts/check_canonical_source_change.mjs --project-root . --scope all --format json`。
  - [ ] 运行 `npm run build`。
  - [ ] 运行 `npm run release:packaging-check`。
  - [ ] 运行 `git diff --check -- assets/source/speclite docs src test release _bmad-output/implementation-artifacts/stories/10-3-frontend-ecosystem-source-expansion.md`。

## Dev Notes（开发备注）

### Source Requirements（需求来源）

- Epic 10 明确要求 Story 10.3 在体系稳定后引入首批 frontend ecosystem modules，例如 React 与 Vue。
- Story 10.1 已建立 nested ecosystem module discovery、metadata contract、two-level install selection 和 selected-only projection。
- Story 10.2 要求 creator / lint / module-help / changelog / version discipline 覆盖 ecosystem authoring；10.3 应复用这些规则创建首批前端 source。

### Current Verified Baseline（当前已验证基线）

- 当前 `assets/source/speclite/` 下未发现已成型的 React / Vue / frontend-specific canonical Skill package root。
- 当前 `sdlc` 中存在通用 UX / Architecture / PRD workflow，会提到 frontend、React、Vue、components 等概念；这些不是 framework-specific ecosystem package，默认不迁移。
- `_bmad-output/planning-artifacts/ux-design-specification.md` 明确 SpecLite MVP 是 terminal + local filesystem control plane，不提供传统 Web / mobile / desktop GUI。
- `src/commands/install.ts` 当前 module selection 是 flat module id 选择；Story 10.1 已要求扩展为 category -> ecosystem id。
- `src/ide/target-writer.ts` 基于 `selectedModules` 创建 package entries、IDE mirrors、indexes 和 phase coverage；10.3 需要用 React / Vue negative assertions 防止 cross-category leakage。

### Previous Story Intelligence（前序 Story 情报）

- Story 10.1 的首批迁移候选是 backend 技术栈 Skill；10.3 不应与 backend migration 混在同一个 Story 中。
- Story 10.2 将 ecosystem authoring、creator 和 lint 作为前置契约；10.3 创建 seed packages 时必须走该契约，而不是直接散落文件。
- 如果实现时发现已有用户新增 frontend ecosystem source，必须先记录并围绕既有内容补齐 docs / tests，不得擅自移动或删除。

### Scope Boundary（范围边界）

- Story 10.2 未完成前，本 Story 只允许做 frontend source discovery、preflight、classification 和 docs / test planning，不得创建 `ecosystems/frontend/react/`、`ecosystems/frontend/vue/` 或任何 frontend seed package root。
- 若必须与 Story 10.2 并行，等价策略必须显式记录：本 Story 内嵌的最小 creator / lint / module-help / changelog contract、后续由 Story 10.2 吸收的条目，以及回写验证责任。
- 不新增 SpecLite Web UI、dashboard、browser runtime 或 GUI product scope。
- 不把 generic UX / Architecture / Story / Code Review workflow 迁移到 React / Vue module。
- 不硬编码 React / Vue 最新版本；框架版本必须来自目标项目 evidence、lockfile、用户输入或实现时查证的官方 docs。
- 不让 React / Vue module 被 `--yes` / JSON 默认路径自动安装。
- 不把 frontend category 作为 mandatory install step；skip 合法。

### Testing Guidance（测试指引）

- 用 module fixture 覆盖 nested frontend modules，而不是依赖真实 package inventory 才能测试 parser。
- selected-only tests 必须同时包含 positive assertion 和 negative assertion；只证明 React 出现不够，必须证明 Vue / backend / other 未出现。
- 对 docs count / package manifest 更新，避免仅改 expected snapshots 而不更新 source docs。

### References（参考）

- [Source: `_bmad-output/planning-artifacts/epics/13-epic-10-canonical-source-ecosystem-module-governancecanonical-source-生态模块治理.md#Story-10.3`]
- [Source: `_bmad-output/implementation-artifacts/stories/10-1-ecosystem-module-taxonomy-and-guided-selected-install-closure.md#Anchor-Contract-Map`]
- [Source: `_bmad-output/implementation-artifacts/stories/10-2-ecosystem-authoring-contract-and-creator-support.md#Dev-Notes`]
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#User-Experience-Goals`]
- [Source: `src/commands/install.ts#runInstallCommand`]
- [Source: `src/ide/target-writer.ts#createPackageEntries`]
- [Source: `test/install-module-selection.test.ts#install-official-module-selection-orchestration`]
- [Source: `assets/source/speclite/README.md#SDLC-Skills`]

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
| 2026-07-06 | 0.1 | 创建 Story 10.3，定义 React / Vue frontend ecosystem modules、前端 seed Skill、两级选择、selected-only 投影、docs 与 release gate 验收。 | John / Codex |
