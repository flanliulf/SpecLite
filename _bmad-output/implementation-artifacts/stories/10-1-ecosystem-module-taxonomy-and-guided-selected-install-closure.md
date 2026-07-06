# Story 10.1: Ecosystem Module Taxonomy And Guided Selected Install Closure（生态模块分类、引导选择与选择性安装闭环）

Status: ready-for-dev

<!-- Expansion Story: `assets/source/speclite/` 需要从 only core+sdlc 的 module model 扩展到 optional ecosystem modules，且安装必须 selected-only。 -->

## Story（故事）

作为 SpecLite 维护者和目标项目安装者，
我希望技术生态相关的 canonical source 能放入 `assets/source/speclite/ecosystems/<category>/<id>/`，并在安装时通过“前端 / 后端 / 其他”到具体生态的两级选择只安装匹配的 ecosystem modules，
以便 `sdlc` 保持通用方法论边界，Java / Spring Boot、Node.js、Python、React、Vue 等技术生态扩展可以增量增长，而目标项目不会被不相关的 Skill 全量混入。

## Acceptance Criteria（验收标准）

1. **Ecosystem source taxonomy is canonical（生态源目录成为 canonical taxonomy）**
   **前提** `assets/source/speclite/` 继续作为 canonical source authoring root；
   **当** 维护者新增技术生态定义；
   **则** ecosystem modules 必须位于 `assets/source/speclite/ecosystems/<category>/<id>/`；
   **并且** 初始 category 只能是 `frontend`、`backend`、`other`；
   **并且** `core-skills/`、`sdlc-skills/`、`support-skills/`、`hooks/`、`scripts/` 和 `custom/` 的现有职责不被重新定义；
   **并且** generic SDLC workflow 仍留在 `sdlc-skills/`，只有具化到某个技术生态的 Skill 才迁入 ecosystem module。

2. **Nested ecosystem modules are discovered deterministically（嵌套生态模块可确定发现）**
   **前提** ecosystem module root 存在 `module.yaml`；
   **当** `discoverOfficialModules` 扫描 bundled source；
   **则** 它必须同时发现 top-level modules（例如 `core-skills/`、`sdlc-skills/`）和 nested modules（例如 `ecosystems/backend/java-springboot/`）；
   **并且** `OfficialModule.sourceDirectory` 必须保存稳定 POSIX path，例如 `ecosystems/backend/java-springboot`；
   **并且** duplicate module code、duplicate canonical skill id、unknown dependency、missing module-help reference 和 invalid ecosystem metadata 必须继续 fail fast；
   **并且** module ordering 必须 deterministic，不能受 filesystem ordering 影响。

3. **Ecosystem metadata and dependency contract are explicit（生态元数据与依赖契约显式）**
   **前提** module kind 是 ecosystem；
   **当** parser 读取 `module.yaml`；
   **则** `module_kind: ecosystem`、`ecosystem_category`、`ecosystem_id`、`required_dependencies: [sdlc]`、`default_selected: false`、`required: false` 必须被验证；
   **并且** module code 必须使用 `ecosystem-<category>-<id>` 形态，例如 `ecosystem-backend-java-springboot`；
   **并且** 选择任何 ecosystem module 时必须自动包含 `sdlc`，`sdlc` 再通过 existing dependency 包含 `core`；
   **并且** ecosystem module 不得绕过 `sdlc` config、artifact roots、activation contract 或 `speclite resolve`。

4. **Initial backend ecosystem migration proves the loop（首批后端生态迁移证明闭环）**
   **前提** 当前 `sdlc-skills/1-analysis/` 下存在具化到 backend 技术生态的 Skill；
   **当** 实现本 Story；
   **则** 至少迁移这些技术栈专属 Skill 到 ecosystem modules：`speclite-brownfield-java-springboot-backend-tech-stack-digger`、`speclite-brownfield-nodejs-backend-tech-stack-digger`、`speclite-brownfield-python-backend-tech-stack-digger`；
   **并且** 迁移后的 source paths 应分别归属 `ecosystems/backend/java-springboot/`、`ecosystems/backend/nodejs/`、`ecosystems/backend/python/`；
   **并且** generic `speclite-brownfield-backend-tech-stack-digger` 保持在 `sdlc`，除非实现时明确证明它应成为 `ecosystems/backend/generic` 并同步更新本 Story 的证据；
   **并且** 迁移不得改变 Skill 的 runtime activation contract、artifact output contract 或 source-independent installed behavior。

5. **Install prompts use two-level ecosystem selection（安装提示使用两级生态选择）**
   **前提** 用户运行 interactive `speclite install` 且最终选择包含 `sdlc`；
   **当** installer 进入 module selection；
   **则** 它必须先展示 ecosystem category selection：`frontend` / `backend` / `other` / skip；
   **并且** 用户选择 category 后只能看到该 category 下的 ecosystem ids，例如 backend 下的 `java-springboot`、`nodejs`、`python`；
   **并且** skip 是合法路径，因为 ecosystem module 强烈推荐但非 mandatory；
   **并且** `--yes`、`--json` 或无交互默认路径不得自动选择任何 ecosystem module，只能保持 existing default `core` + `sdlc`；
   **并且** CLI / programmatic selection 仍必须支持 exact module code，并对 unknown ecosystem module id 返回现有 invalid module selection error。

6. **Installed projection is selected-only（安装投影只包含已选择模块）**
   **前提** canonical source 中存在多个 ecosystem modules；
   **当** 用户只选择一个 ecosystem module；
   **则** `.claude/skills/`、`.agents/skills/`、`skill-index-full.json`、`help-index.json`、`phase-coverage.json`、`files-index-full.json` 和 installed tree 只能包含 `core`、`sdlc` 与用户选择的 ecosystem module packages；
   **并且** 未选择的 ecosystem modules 不得出现在 installed IDE mirrors、help rows、phase rows、skill index、files index 或 ready summary selected module count；
   **并且** `target-writer`、validate、status、update、repair 和 uninstall 必须继续以 selected modules 为 installed-state truth；
   **并且** 不得因为 `assets/source/speclite/ecosystems/**` 存在 source packages 就全量安装。

7. **Minimal proof hands off fixture and release generalization（最小证明交接 Fixture 与发布泛化）**
   **前提** ecosystem modules 进入 official source；
   **当** 实现完成；
   **则** `_speclite/config.toml` 或 installed summary 必须能表达 selected ecosystem module ids，且未来带 config prompts 的 ecosystem module 可以写入稳定 config table；
   **并且** 本 Story 只需用首批 backend migration 提供最小 selected-only proof，证明 selected ecosystem module 被安装、unselected backend ecosystem module 不被安装、默认 no-ecosystem install 不变；
   **并且** 只更新支撑该最小 proof 所需的 docs / fixtures / release evidence，不负责全矩阵 fixture、fixed count 泛化、release packaging manifest 和 canonical source check 的全面泛化；
   **并且** 必须把 full matrix fixture、fixed count 泛化、release packaging、canonical source check 和 public docs 全面闭环交接给 Story 10.5 / 10.6；
   **并且** 不得把 current package root count hardcode 为 only `core` + `sdlc` 的长期真相。

## Tasks / Subtasks（任务 / 子任务）

- [ ] Task 1: Preflight and current contract review（AC: 1-7）
  - [ ] 读取 Epic 10、本 Story、Story 1.3、Story 1.5、Story 2.1、Story 6.2、Story 6.7、Story 8.9 和 Story 9.3。
  - [ ] 读取 contract / docs anchors：`assets/source/speclite/README.md`、`docs/reference/runtime-layout.md`、`_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md`、`_bmad-output/planning-artifacts/specs/05-ide-adapter-registry-contract.md`、`_bmad-output/planning-artifacts/specs/08-fixture-contract.md`。
  - [ ] 读取 implementation anchors：`src/modules/module-metadata.ts`、`src/modules/module-selection.ts`、`src/commands/install.ts`、`src/config/config-initialization.ts`、`src/ide/target-writer.ts`、`src/commands/status.ts`、`src/commands/validate.ts`、`scripts/release/packaging-check.mjs`、`assets/source/speclite/support-skills/speclite-check-canonical-source-change/scripts/check_canonical_source_change.mjs`。
  - [ ] 检查 `git status --short --branch`，确认没有 unrelated canonical source、fixture、release manifest 或 generated dist drift；如有冲突，先记录并请求授权。

- [ ] Task 2: Add failing tests for nested discovery and ecosystem metadata（AC: 1-3）
  - [ ] 增加 module metadata tests，构造 `ecosystems/backend/java-springboot/module.yaml` fixture，证明当前 `findModuleDirectories` flat scan 无法发现 nested module。
  - [ ] 增加 validation tests：invalid category、missing `ecosystem_id`、wrong module code pattern、missing `required_dependencies: [sdlc]`、`default_selected: true`、`required: true` 都应 fail fast。
  - [ ] 增加 uniqueness tests，证明 nested ecosystem module 与 top-level module 的 code / canonical skill id 全局去重。
  - [ ] 增加 ordering tests，证明 discovered modules 按 stable source directory / module code 排序。

- [ ] Task 3: Implement ecosystem source taxonomy and nested discovery（AC: 1-3）
  - [ ] 扩展 `OfficialModule` type，新增 `moduleKind`、`ecosystemCategory`、`ecosystemId`、可选 display label 或等价 metadata。
  - [ ] 修改 module metadata parser，让 top-level modules 默认 `module_kind: standard`，ecosystem modules 必须显式 `module_kind: ecosystem`。
  - [ ] 修改 `findModuleDirectories` 或等价 discovery 逻辑，使其发现 `sourceRoot/*/module.yaml` 与 `sourceRoot/ecosystems/*/*/module.yaml`，并避免扫描 arbitrary deep source tree。
  - [ ] 保持 `findPackageRoots` 从 module root 内递归发现 `SKILL.md` package roots 的既有行为。
  - [ ] 保持 `assertKnownRequiredDependencies`、`assertHelpEntriesReferenceDiscoveredPackageRoots`、duplicate checks 和 machine error codes 的可诊断性。

- [ ] Task 4: Migrate initial backend ecosystem modules（AC: 1, 4, 7）
  - [ ] 创建 `assets/source/speclite/ecosystems/backend/java-springboot/`、`assets/source/speclite/ecosystems/backend/nodejs/`、`assets/source/speclite/ecosystems/backend/python/`。
  - [ ] 为每个 backend ecosystem module 编写 `module.yaml`、`module-help.csv` 和必要 docs，module code 分别为 `ecosystem-backend-java-springboot`、`ecosystem-backend-nodejs`、`ecosystem-backend-python`。
  - [ ] 迁移对应 tech-stack digger Skill package，保留 package-local `SKILL.md`、`customize.toml`、`references/`、`assets/`、`data/` 和 `scripts/` surface。
  - [ ] 更新任何 source-local reference、support lint expectation、README inventory 和 packaging inventory，避免留下 old source path runtime assumption。
  - [ ] 明确记录 generic backend digger 是否保持在 `sdlc`，并用 test / docs 说明它不会因 backend category selection 被误装成所有 backend ecosystems。

- [ ] Task 5: Implement two-level install ecosystem selection（AC: 3, 5）
  - [ ] 在 module selection prompt input 中按 ecosystem category / id 分组，交互式 install 展示 category -> ecosystem id 的两级选择。
  - [ ] 当 `sdlc` 被选择时展示 ecosystem recommendation；当用户 skip 时保持 `core` + `sdlc`。
  - [ ] 保持 `--yes`、`--json` 和无 selector 默认路径不选择 ecosystem modules。
  - [ ] 确认 programmatic `selectModuleIds` 和 any existing CLI module flag 仍接受 exact module code，并通过 dependency 自动包含 `sdlc`。
  - [ ] 更新 human output 文案，明确 selected modules、skipped ecosystem 和 next actions，但不改变 `CommandResult` JSON contract。

- [ ] Task 6: Preserve selected-only installed projection and validation（AC: 6-7）
  - [ ] 增加 install integration tests：只选择 `ecosystem-backend-java-springboot` 时，Java / Spring Boot Skill 出现在 `.claude/skills` 与 `.agents/skills`，Node.js / Python ecosystem Skill 不出现。
  - [ ] 断言 skill-index、help-index、phase-coverage、files-index 和 installed tree 只包含 selected ecosystem packages。
  - [ ] 增加 validate/status/update/repair focused tests 或等价 evidence，证明 installed-state truth 来自 selected modules 和 installed indexes，不从 source tree 补装 unselected ecosystems。
  - [ ] 确认 uninstall 删除 selected ecosystem installed entries 时不会触碰从未安装的 ecosystem source。

- [ ] Task 7: Minimal selected-only proof and handoff（AC: 7）
  - [ ] 更新支撑 Story 10.1 foundation 所需的最小 docs / evidence，说明 `ecosystems/<category>/<id>/` taxonomy、module metadata 和 selected-only projection；不得把全面 public docs 闭环提前纳入本 Story。
  - [ ] 更新或新增最小 selected backend proof：default no-ecosystem baseline 保持不变、至少一个 selected backend ecosystem module 被安装、至少一个 unselected backend ecosystem module 不被安装。
  - [ ] 只在必要范围内触碰 fixtures / release evidence，以证明 nested discovery、backend migration 和 selected-only projection；不得把 frontend / other / full matrix fixture 泛化写成本 Story完成条件。
  - [ ] 记录 handoff 给 Story 10.5：full matrix fixtures、fixed count 泛化、release packaging manifest 和 canonical source check 的全面泛化由 Story 10.5 负责。
  - [ ] 记录 handoff 给 Story 10.6：最终 public docs、catalog 和 maintainer release workflow 由 Story 10.6 在 10.3 / 10.4 / 10.5 completion evidence 后发布。

- [ ] Task 8: Verification（AC: 1-7）
  - [ ] 运行 focused module tests，例如 `npm test -- test/module-metadata.test.ts test/module-selection.test.ts` 或当前等价测试文件。
  - [ ] 运行 install selection / runtime structure tests，例如 `npm test -- test/install-command.test.ts test/runtime-structure.test.ts` 或当前等价测试文件。
  - [ ] 运行 fixture release gate tests that cover default no-ecosystem and selected ecosystem cases。
  - [ ] 运行 canonical source check：`node assets/source/speclite/support-skills/speclite-check-canonical-source-change/scripts/check_canonical_source_change.mjs --project-root . --scope all --format json`。
  - [ ] 运行 `npm run build`。
  - [ ] 运行 `npm run release:packaging-check`。
  - [ ] 运行 `git diff --check`。

## Dev Notes（开发备注）

### Source Requirements（需求来源）

- 用户明确要求把 `assets/source/speclite/` 作为 canonical source 源定义目录，并为技术生态源定义建立独立 module。
- 用户明确要求新 module 依赖 `sdlc`，但在目标项目落地时由 installer 强烈建议选择特定 technology ecosystem module，而不是 mandatory。
- 用户明确要求最小落地路径采用 `ecosystems/<category>/<id>/` 层级，并通过“前端 / 后端 / 其他”到“React / Vue / Java / SpringBoot”等两级配置引导。
- 用户明确要求安装时按选择匹配对应 ecosystem skills，不得全量安装。

### Current Verified Baseline（当前已验证基线）

- `src/modules/module-metadata.ts` 当前 `discoverOfficialModules` 调用 `findModuleDirectories(sourceRoot)`，而 `findModuleDirectories` 只扫描 `sourceRoot` 的直接子目录是否存在 `module.yaml`。
- `src/modules/module-metadata.ts` 当前 `findPackageRoots(moduleDirectory)` 会在 module root 内递归寻找 `SKILL.md`，这部分可以复用到 nested ecosystem module。
- `src/modules/module-selection.ts` 当前 `createModuleSelection` 支持 `requiredDependencies` 递归选择，适合表达 ecosystem -> `sdlc` -> `core` dependency。
- `src/commands/install.ts` 当前在 module discovery 后创建 flat `defaultModuleSelection`，并把 `modules`、`defaultSelectedModuleIds`、`requiredModuleIds` 交给 selector；这需要扩展为 ecosystem grouping prompt。
- `src/ide/target-writer.ts` 当前只基于 `selectedModules` 创建 package entries、IDE mirrors、skill-index、help-index、phase-coverage 和 files-index；selected-only projection 已有基础，但需要用 ecosystem tests 防止 source tree 全量安装。
- `assets/source/speclite/README.md` 当前只列出 `core-skills/`、`sdlc-skills/`、`support-skills/`、`hooks/`、`scripts/`、`custom/`，尚未定义 `ecosystems/`。
- `docs/reference/runtime-layout.md` 当前把 official source snapshot 描述为 13 个 core package roots 和 48 个 SDLC package roots；ecosystem modules 引入后该描述不能再作为长期静态真相。

### Initial Migration Candidates（首批迁移候选）

首批 backend technology-specific Skill 已存在于 `sdlc-skills/1-analysis/`：

- `speclite-brownfield-java-springboot-backend-tech-stack-digger`
- `speclite-brownfield-nodejs-backend-tech-stack-digger`
- `speclite-brownfield-python-backend-tech-stack-digger`

Generic backend digger：

- `speclite-brownfield-backend-tech-stack-digger`

默认策略是 generic backend digger 留在 `sdlc`，作为跨后端技术栈的通用 brownfield analysis 能力；只有明确绑定某个 runtime / framework / language ecosystem 的 Skill 迁移到 `ecosystems/backend/<id>/`。

### Scope Boundary（范围边界）

- 本 Story 只建立 ecosystem module end-to-end foundation 与首批 backend migration，不要求一次性补齐 React、Vue、npm package 等全部生态 Skill。
- 本 Story 只负责 nested discovery、ecosystem metadata、backend migration 和最小 selected-only proof；full matrix fixture、fixed count 泛化、release packaging manifest、canonical source check 全面泛化由 Story 10.5 负责。
- 不修改 `speclite resolve` command behavior、merged config semantics、customization merge order 或 JSON contract。
- 不改变 existing `core` / `sdlc` package content，除非为了移出明确 tech-specific Skill package 且同步更新 module-help / docs / fixtures。
- 不新增 source checkout runtime fallback。
- 不把 `support-skills/` 安装成 target project runtime module。
- 不把 ecosystem selection 变成 mandatory；interactive flow 可以 strong recommend，但 skip 必须合法。

## Dependency Gate（依赖门禁）

- Story 1.3、Story 1.5、Story 2.1、Story 6.2、Story 6.7、Story 8.9 和 Story 9.3 已完成；实现本 Story 时不得回写这些历史 Story 的完成状态。
- 若 moving Skill packages 改变 package counts、installed tree、hash 或 packaging manifest，必须同步 owning docs / specs / fixtures，不得只改 snapshots。
- 若 `sprint-status.yaml` 与本 Story status 冲突，先记录 gate artifact 或请求用户授权，不擅自推进 unrelated tracker entries。
- 若发现 frontend / other ecosystem source 在实现前已经由用户新增，必须把它们当作用户改动处理，不得移动或删除，除非得到明确授权。

## Anchor Contract Map（锚点契约映射）

| Anchor Type | Anchor | Requirement |
| --- | --- | --- |
| Contract Anchor | `assets/source/speclite/README.md` | Canonical source taxonomy 必须加入 `ecosystems/<category>/<id>/`，并区分 generic SDLC 与 technology ecosystem。 |
| Contract Anchor | `docs/reference/runtime-layout.md` | Installed runtime layout 必须描述 selected ecosystem modules，而不是 only core+sdlc static count。 |
| Contract Anchor | `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md` | skill-index、help-index、phase-coverage 和 files-index 必须只反映 selected installed packages。 |
| Contract Anchor | `_bmad-output/planning-artifacts/specs/05-ide-adapter-registry-contract.md` | IDE target writer must project canonical skill packages as self-contained entries for selected modules only。 |
| Contract Anchor | `_bmad-output/planning-artifacts/specs/08-fixture-contract.md` | Fixture expected outputs 必须从真实 install semantics 刷新，并包含 unselected ecosystem negative assertions。 |
| Functional Anchor | `src/modules/module-metadata.ts` | Official module discovery、metadata parsing、package root discovery、duplicate checks 和 dependency checks。 |
| Functional Anchor | `src/modules/module-selection.ts` | Required/default/user-selected module selection and dependency closure。 |
| Functional Anchor | `src/commands/install.ts` | Interactive module selection、config initialization prompt、prewrite/final install summaries。 |
| Functional Anchor | `src/config/config-initialization.ts` | Selected module config table generation and installed config projection。 |
| Functional Anchor | `src/ide/target-writer.ts` | Selected module package entries, IDE mirrors, skill/help/phase/files indexes。 |
| Functional Anchor | `assets/source/speclite/support-skills/speclite-check-canonical-source-change/scripts/check_canonical_source_change.mjs` | Canonical source change check must include nested ecosystem modules。 |
| Evidence Anchor | `test/fixtures/fresh-install-empty-project/expected/` | Default no-ecosystem installed baseline must stay stable。 |
| Evidence Anchor | selected ecosystem fixture / focused install test | Selected ecosystem module must install; unselected ecosystem modules must stay absent。 |
| Evidence Anchor | `release/packaging-manifest.json` / `scripts/release/packaging-check.mjs` | Nested ecosystem source files must be packaged and release check must stay green。 |

## Equivalent Implementation Policy（等价实现策略）

Preferred implementation is to keep module discovery intentionally bounded: scan top-level `module.yaml` modules plus exactly `ecosystems/<category>/<id>/module.yaml`. An equivalent implementation may use a more general recursive search only if it proves that `support-skills/` packages, hook packages, random Skill package roots and nested `references/` directories cannot be mistaken for official modules.

Preferred install UX is a two-level selector grouped by ecosystem category and id. An equivalent UX is acceptable only if it still exposes category first, supports skip, never auto-selects ecosystems in `--yes` / JSON default mode, and installs only selected ecosystem modules.

## Evidence Plan（证据计划）

- Module metadata tests for top-level and nested ecosystem discovery.
- Metadata validation tests for invalid ecosystem category / id / module code / dependency / default-selected / required fields.
- Module selection dependency tests proving ecosystem selection includes `sdlc` and `core`.
- Interactive install selection tests proving category -> ecosystem id prompt and skip behavior.
- Default install tests proving `--yes` / JSON installs no ecosystem modules.
- Selected ecosystem install tests proving selected backend Skill appears under both `.claude/skills` and `.agents/skills`.
- Negative install tests proving unselected backend ecosystem Skills are absent from IDE mirrors, skill-index, help-index, phase-coverage, files-index and installed tree.
- Fixture refresh evidence for default no-ecosystem baseline and selected ecosystem baseline.
- Canonical source check evidence for nested ecosystem modules.
- Packaging check evidence for nested ecosystem source files.
- `npm run build`
- `npm run release:packaging-check`
- `git diff --check`

## Anchor Evidence Summary（锚点证据摘要）

待实现后填写。必须记录 discovered ecosystem modules、selected module ids、installed skill evidence、unselected ecosystem absence evidence、fixture refresh commands、canonical source check result、packaging check result 和 build / focused test result。

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
| 2026-06-23 | 0.1 | 创建 Story 10.1，定义 ecosystem module taxonomy、nested discovery、两级安装选择、selected-only projection、首批 backend 迁移和 release gate 闭环。 | John / Codex |
