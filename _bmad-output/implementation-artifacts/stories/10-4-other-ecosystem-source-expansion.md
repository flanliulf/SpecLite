# Story 10.4: Other Ecosystem Source Expansion（其他生态源定义扩展）

Status: done

<!-- Expansion Story: 为非 frontend / backend 的 ecosystem modules 建立受约束的 `other` 示例、分类门槛和验收规则，避免 `other` 成为无边界杂项目录。 -->

## Story（故事）

作为维护 SpecLite canonical source 的方法论维护者，
我希望 `ecosystems/other/<id>/` 有明确示例、命名规则、准入标准和安装验收，
以便 npm package、CLI tool、documentation-only project 等非前端 / 后端类别可以获得专属 Skill 支持，同时 `other` 不会变成所有无法分类内容的默认堆放区。

## Acceptance Criteria（验收标准）

1. **Other category has strict admission rules（other 类别有严格准入规则）**
   **前提** Story 10.1 已定义 category enum 为 `frontend`、`backend`、`other`；
   **当** 维护者创建 `ecosystems/other/<id>/`；
   **则** `other` 只能用于不能归入 frontend / backend 且具有稳定项目形态的生态；
   **并且** 初始允许 examples 为 `npm-package`、`cli-tool`、`documentation-only`；
   **并且** 新增其他 id 必须记录 why-not-frontend、why-not-backend、目标项目事实、安装价值和 selected-only 验收。

2. **Seed other modules are concrete and bounded（初始 other modules 具体且有边界）**
   **前提** canonical source 中还没有 `ecosystems/other/`；
   **当** 实现本 Story；
   **则** 至少建立以下 module roots 中的一个，并优先建立三者完整矩阵：`ecosystems/other/npm-package/`、`ecosystems/other/cli-tool/`、`ecosystems/other/documentation-only/`；
   **并且** module code 必须分别使用 `ecosystem-other-npm-package`、`ecosystem-other-cli-tool`、`ecosystem-other-documentation-only`；
   **并且** 每个 module root 必须有 `module.yaml`、`module-help.csv` 和至少一个有效 Skill package root；
   **并且** `module_kind: ecosystem`、`ecosystem_category: other`、`ecosystem_id`、`required_dependencies: [sdlc]`、`default_selected: false`、`required: false` 必须通过 validation。

3. **Existing SDLC workflows are not silently removed（既有 SDLC workflow 不被静默移除）**
   **前提** 当前 `sdlc` 中已有 `speclite-npm-publisher`、`speclite-write-opensource-docs`、`speclite-agent-docs-steward` 等与 npm / docs 相关能力；
   **当** 实现 other ecosystem examples；
   **则** 不得默认从 `sdlc` 迁移这些 workflow；
   **并且** 如果实现选择迁移某个 workflow，必须提供 explicit migration rationale、default SDLC baseline impact、module-help / docs / fixture updates 和 selected-only negative assertions；
   **并且** 在没有足够证据时，推荐创建 ecosystem-specific companion Skill 或 wrapper guidance，而不是破坏现有默认生命周期能力。

4. **Other Skill content proves project-shape specificity（other Skill 内容证明项目形态特异性）**
   **前提** 用户选择某个 other ecosystem module；
   **当** 对应 Skill 被运行；
   **则** `npm-package` 能围绕 `package.json`、package manager、publish metadata、tarball / `npx` / package surface、release gate 或 library / CLI smoke 取证；
   **并且** `cli-tool` 能围绕 `bin` entry、command surface、TTY / non-TTY output、exit code、JSON contract、shell portability 或 install smoke 取证；
   **并且** `documentation-only` 能围绕 `docs/`、README、Diataxis、package-facing docs、link integrity、public docs source 和 project facts 取证；
   **并且** 不得把泛化写作、通用发布或通用 CLI output 规则搬出 `sdlc`。

5. **Install selection and projection remain isolated（安装选择与投影保持隔离）**
   **前提** source tree 同时存在 frontend、backend、other modules；
   **当** 用户选择 `other` category；
   **则** installer 只能展示 `npm-package`、`cli-tool`、`documentation-only` 等 other ids；
   **并且** 选择 `ecosystem-other-npm-package` 不得安装 frontend / backend / other unselected modules；
   **并且** `--yes`、`--json` 和 default no-prompt install 仍不得选择任何 other ecosystem module；
   **并且** skip `other` 是合法路径。

6. **Other category docs prevent dumping-ground drift（文档防止 other 演变为杂项目录）**
   **前提** public docs 和 maintainer docs 更新；
   **当** 维护者阅读 ecosystem authoring guidance；
   **则** docs 必须明确 `other` 的准入问题清单、命名规则、example ids、anti-pattern 和 migration policy；
   **并且** docs 必须说明 `other/misc`、`other/general`、`other/tools` 这类无边界 id 默认不允许；
   **并且** docs 必须要求新 other id 在 `module-help.csv`、creator/lint rules、release gate 和 docs index 中可追踪。

7. **Release gates cover other ecosystem examples（发布门禁覆盖 other 示例）**
   **前提** other ecosystem source files 存在；
   **当** build、fixture、canonical source check 和 packaging check 运行；
   **则** nested other modules 必须被 discovered、packaged、documented，并通过 module-help drift 检查；
   **并且** focused tests 必须覆盖 selected one other module、unselected other module absence 和 cross-category absence；
   **并且** fixture / docs 不得把 default install total 写成包含 optional other modules 的 unconditional baseline。

## Tasks / Subtasks（任务 / 子任务）

- [x] Task 1: Preflight and existing capability classification（AC: 1-7）
  - [x] 读取 Story 10.1、Story 10.2、Story 10.3、Epic 10 和 current source tree。
  - [x] 检查是否存在 `assets/source/speclite/ecosystems/other/`；若存在，作为用户已有变更处理。
  - [x] 读取 existing candidate workflows：`assets/source/speclite/sdlc-skills/5-devops/speclite-npm-publisher/`、`assets/source/speclite/sdlc-skills/1-analysis/speclite-write-opensource-docs/`、`assets/source/speclite/sdlc-skills/1-analysis/speclite-agent-docs-steward/`。
  - [x] 记录 classification decision：哪些保留在 `sdlc`，哪些可以作为 other companion Skill，哪些需要用户授权才可迁移。

- [x] Task 2: Define `other` admission and anti-pattern contract（AC: 1, 6）
  - [x] Dependency Gate: Story 10.2 未完成时，本 Task 只能整理 `other` admission policy、anti-pattern、classification evidence 和待写入位置，不得落地新的 `ecosystems/other/**` package root。
  - [x] 更新 `assets/source/speclite/README.md`，新增 `other` 准入规则和 banned ids。
  - [x] 更新 `docs/reference/canonical-source-layout.md`，说明 `ecosystems/other/<id>/` 只接受稳定项目形态，不接受 `misc` / `general`。
  - [x] 更新 Story 10.2 的 authoring / lint references，要求新增 other id 时记录 why-not-frontend / why-not-backend。

- [x] Task 3: Create seed other ecosystem modules（AC: 2, 4-5）
  - [x] Dependency Gate: 在创建任何 `assets/source/speclite/ecosystems/other/**` module root 或 seed Skill package 前，必须读取 Story 10.2 completion evidence，确认 ecosystem authoring contract、creator / lint、module-help 和 changelog discipline 已完成。
  - [x] 如果 Story 10.2 尚未完成，本 Task 只能执行 discovery / preflight；除非本 Story 明确采用等价策略，并把最小 creator / lint contract 写入本 Story，同时要求 Story 10.2 fixer 反向吸收该 contract。
  - [x] 创建 `assets/source/speclite/ecosystems/other/npm-package/`，module code `ecosystem-other-npm-package`。
  - [x] 创建 `assets/source/speclite/ecosystems/other/cli-tool/`，module code `ecosystem-other-cli-tool`。
  - [x] 创建 `assets/source/speclite/ecosystems/other/documentation-only/`，module code `ecosystem-other-documentation-only`。
  - [x] 为每个 module 创建 `module.yaml`、`module-help.csv` 和至少一个 seed Skill。
  - [x] 使用 Story 10.2 的 creator / lint contract 生成 `SKILL.md`、`SKILL.en.md`、`CHANGELOG.md` 和必要 `references/`。

- [x] Task 4: Preserve or explicitly migrate existing SDLC workflows（AC: 3-4）
  - [x] 默认保留 `speclite-npm-publisher` 在 `sdlc`，因为它是生命周期 DevOps 发布 workflow；如实现者认为要迁移，先新增 migration evidence section 和 tests。
  - [x] 默认保留 `speclite-write-opensource-docs` 与 `speclite-agent-docs-steward` 在 `sdlc`，因为它们服务公开文档治理；documentation-only ecosystem seed 应提供 project-shape-specific companion guidance。
  - [x] 如果创建 wrapper / companion Skill，必须明确它调用或引用 existing SDLC workflow 的边界，不复制大段 workflow 内容。

- [x] Task 5: Extend selection, projection and docs tests（AC: 5-7）
  - [x] 增加 install selection tests：选择 `other` category 后只列 other ids。
  - [x] 增加 selected `ecosystem-other-npm-package` install tests，断言 npm package seed Skill 被安装，`cli-tool`、`documentation-only`、frontend、backend absent。
  - [x] 增加 selected `ecosystem-other-cli-tool` 或 `ecosystem-other-documentation-only` negative assertion，证明 other category 内部也 selected-only。
  - [x] 更新 docs tests / text assertions，防止 `other` 被描述为 catch-all。

- [x] Task 6: Update release and canonical checks（AC: 7）
  - [x] 扩展 canonical source change check fixture，覆盖 `ecosystems/other/npm-package/` 等 nested module。
  - [x] 更新 packaging manifest / release check assertions，确保 other ecosystem source files 进入 npm package inventory。
  - [x] 更新 fixture release gates，覆盖 default no-ecosystem baseline 与 selected other ecosystem baseline。

- [x] Task 7: Verification（AC: 1-7）
  - [x] 运行 `npm test -- test/source-and-modules.test.ts test/install-module-selection.test.ts test/canonical-source-change-check-script.test.ts`。
  - [x] 运行 selected projection / fixture tests：`npm test -- test/runtime-structure.test.ts test/fixture-release-gates.test.ts` 或当前等价测试文件。
  - [x] 运行 canonical source check：`node assets/source/speclite/support-skills/speclite-check-canonical-source-change/scripts/check_canonical_source_change.mjs --project-root . --scope all --format json`。
  - [x] 运行 `npm run build` 与 `npm run release:packaging-check`。
  - [x] 运行 `git diff --check -- assets/source/speclite docs src test release _bmad-output/implementation-artifacts/stories/10-4-other-ecosystem-source-expansion.md`。

## Dev Notes（开发备注）

### Source Requirements（需求来源）

- Epic 10 要求 Story 10.4 为 npm package、CLI tool、documentation-only project 或其他非前端 / 后端类别建立 `ecosystems/other/<id>/` 示例和验收规则，避免 `other` 成为无约束杂项目录。
- Story 10.1 已定义 ecosystem metadata 和 selected-only projection；Story 10.2 已定义 ecosystem authoring / lint contract；Story 10.3 已定义 cross-category isolation 对 frontend 的要求。

### Current Verified Baseline（当前已验证基线）

- 当前 canonical source 已有 `speclite-npm-publisher`，它是 `sdlc-skills/5-devops/` 下的 npm 发布 workflow，包含 release gates、registry auth、tarball smoke、publish 和 postpublish verification。
- 当前 canonical source 已有 `speclite-write-opensource-docs` 与 `speclite-agent-docs-steward`，它们是 `sdlc-skills/1-analysis/` 下的公开文档治理能力。
- 当前 `assets/source/speclite/` 未发现 `ecosystems/other/` source root。
- `package.json` 已有 `release:verify`、`release:check`、`prepublishOnly` 等 release scripts，other ecosystem release gate 应复用而不是发明平行发布系统。

### Recommended Classification Decision（推荐分类决策）

- `speclite-npm-publisher` 默认保留在 `sdlc`，因为它是 DevOps 生命周期 workflow。`ecosystem-other-npm-package` 可以新增 package-specific audit / companion Skill，除非实现时用 tests 和 docs 证明迁移不会破坏默认 SDLC 发布能力。
- `speclite-write-opensource-docs` 与 `speclite-agent-docs-steward` 默认保留在 `sdlc`，因为文档治理是跨项目生命周期能力。`ecosystem-other-documentation-only` 应强调 documentation-only project shape，而不是复制公开文档 workflow。
- `ecosystem-other-cli-tool` 应关注 CLI tool 项目形态，例如 `bin`、command surface、exit codes、TTY / non-TTY、JSON contract、shell portability 和 install smoke，而不是通用 SpecLite CLI 自身实现。

### Scope Boundary（范围边界）

- Story 10.2 未完成前，本 Story 只允许做 `other` category discovery、classification、policy drafting 和 docs / test planning，不得创建 `ecosystems/other/npm-package/`、`ecosystems/other/cli-tool/`、`ecosystems/other/documentation-only/` 或任何 seed package root。
- 若必须与 Story 10.2 并行，等价策略必须显式记录：本 Story 内嵌的最小 creator / lint / module-help / changelog contract、后续由 Story 10.2 吸收的条目，以及回写验证责任。
- 不创建 `other/misc`、`other/general`、`other/tools` 这类无稳定项目形态的 module。
- 不默认迁移 existing SDLC workflow；迁移需要 explicit rationale 和 regression evidence。
- 不把 optional other ecosystem packages 算入 unconditional default install baseline。
- 不把 docs-only project support 写成“所有文档工作都属于 other”；通用文档工作仍归 `sdlc`。

### Testing Guidance（测试指引）

- 对 `other` category 的 tests 必须包含 both within-category negative assertions 和 cross-category negative assertions。
- 对 migration candidate 的 tests 必须覆盖 baseline impact；如果保持不迁移，也应有 docs / source tests 说明 classification。
- Canonical source check 的 stale text scan 应能识别“other 是 catch-all”或 only core+sdlc count 的过时表达。

### References（参考）

- [Source: `_bmad-output/planning-artifacts/epics/13-epic-10-canonical-source-ecosystem-module-governancecanonical-source-生态模块治理.md#Story-10.4`]
- [Source: `_bmad-output/implementation-artifacts/stories/10-1-ecosystem-module-taxonomy-and-guided-selected-install-closure.md#Module-Decision`]
- [Source: `_bmad-output/implementation-artifacts/stories/10-2-ecosystem-authoring-contract-and-creator-support.md#Acceptance-Criteria`]
- [Source: `_bmad-output/implementation-artifacts/stories/10-3-frontend-ecosystem-source-expansion.md#Scope-Boundary`]
- [Source: `assets/source/speclite/sdlc-skills/5-devops/speclite-npm-publisher/SKILL.md#Overview`]
- [Source: `assets/source/speclite/sdlc-skills/1-analysis/speclite-write-opensource-docs/SKILL.md#Overview`]
- [Source: `assets/source/speclite/sdlc-skills/1-analysis/speclite-agent-docs-steward/SKILL.md#Overview`]
- [Source: `package.json#scripts`]

## Dev Agent Record（开发代理记录）

### Agent Model Used（使用模型）

GPT-5 Codex

### Debug Log References（调试日志引用）

- `npm test -- test/source-and-modules.test.ts test/install-module-selection.test.ts test/canonical-source-change-check-script.test.ts`：RED 阶段先失败 5 项，证明 other modules、other admission docs、selected-only install 和 checker catch-all drift 尚未实现；GREEN 后通过 3 个 test files / 34 个 tests。
- `npm test -- test/runtime-structure.test.ts test/fixture-release-gates.test.ts`：通过 2 个 test files / 16 个 tests，确认 default no-ecosystem fixture baseline 和 selected projection 仍稳定。
- `node assets/source/speclite/support-skills/speclite-check-canonical-source-change/scripts/check_canonical_source_change.mjs --project-root . --scope all --format json`：最终通过，`status: "ok"`、`findings: []`，counts 为 `frontend=2`、`backend=3`、`other=3`、`defaultInstall.total=61`。
- `npm run build`：通过。
- `npm run release:packaging-check`：通过，并刷新 `release/packaging-manifest.json` / `dist/packaging-manifest.json`。
- `npm test`：通过 56 个 test files / 412 个 tests。
- `git diff --check -- assets/source/speclite docs src test release _bmad-output/implementation-artifacts/stories/10-4-other-ecosystem-source-expansion.md`：通过。

### Completion Notes List（完成说明）

- 完成 preflight：Story 10.1、10.2、10.3 均为 `done`，Story 10.2 authoring / lint contract 已完成；开始前不存在 `assets/source/speclite/ecosystems/other/`。
- 明确 classification decision：`speclite-npm-publisher`、`speclite-write-opensource-docs`、`speclite-agent-docs-steward` 均保留在 `sdlc`，本 Story 仅新增 project-shape-specific companion Skills，不迁移既有 SDLC workflow。
- 新增 `ecosystem-other-npm-package`、`ecosystem-other-cli-tool`、`ecosystem-other-documentation-only` 三个 other ecosystem modules，均声明 `module_kind: ecosystem`、`ecosystem_category: other`、`required_dependencies: [sdlc]`、`default_selected: false`、`required: false`。
- 新增三个 seed Skill：`speclite-npm-package-project-auditor`、`speclite-cli-tool-contract-auditor`、`speclite-documentation-only-project-auditor`，分别围绕 npm package、CLI tool、documentation-only project 的稳定项目形态取证。
- 更新 other admission docs、ecosystem skill catalog、creator / lint references 和 canonical checker stale-text scan，明确 `why-not-frontend`、`why-not-backend`、banned ids、selected-only 验收和 catch-all drift 检测。
- 扩展 install selection / selected-only tests：other category 只展示 `cli-tool`、`documentation-only`、`npm-package`；选择 npm package 只安装 npm package seed Skill，不安装 other unselected、frontend 或 backend packages。
- Mixed worktree 边界：未回滚、删除、暂存或提交任何用户 / 前序 Story drift；未触碰用户点名的 `speclite-docs-intro-ppt-creator/*`、`speclite-html-ppt-generator/**` 和 `.specskills/...html-ppt-generator-decision-record.md`。

### File List（文件清单）

- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/implementation-artifacts/stories/10-4-other-ecosystem-source-expansion.md`
- `assets/source/speclite/README.md`
- `assets/source/speclite/ecosystems/other/npm-package/module.yaml`
- `assets/source/speclite/ecosystems/other/npm-package/module-help.csv`
- `assets/source/speclite/ecosystems/other/npm-package/speclite-npm-package-project-auditor/CHANGELOG.md`
- `assets/source/speclite/ecosystems/other/npm-package/speclite-npm-package-project-auditor/SKILL.md`
- `assets/source/speclite/ecosystems/other/npm-package/speclite-npm-package-project-auditor/SKILL.en.md`
- `assets/source/speclite/ecosystems/other/npm-package/speclite-npm-package-project-auditor/references/npm-package-project-audit-workflow.md`
- `assets/source/speclite/ecosystems/other/cli-tool/module.yaml`
- `assets/source/speclite/ecosystems/other/cli-tool/module-help.csv`
- `assets/source/speclite/ecosystems/other/cli-tool/speclite-cli-tool-contract-auditor/CHANGELOG.md`
- `assets/source/speclite/ecosystems/other/cli-tool/speclite-cli-tool-contract-auditor/SKILL.md`
- `assets/source/speclite/ecosystems/other/cli-tool/speclite-cli-tool-contract-auditor/SKILL.en.md`
- `assets/source/speclite/ecosystems/other/cli-tool/speclite-cli-tool-contract-auditor/references/cli-tool-contract-audit-workflow.md`
- `assets/source/speclite/ecosystems/other/documentation-only/module.yaml`
- `assets/source/speclite/ecosystems/other/documentation-only/module-help.csv`
- `assets/source/speclite/ecosystems/other/documentation-only/speclite-documentation-only-project-auditor/CHANGELOG.md`
- `assets/source/speclite/ecosystems/other/documentation-only/speclite-documentation-only-project-auditor/SKILL.md`
- `assets/source/speclite/ecosystems/other/documentation-only/speclite-documentation-only-project-auditor/SKILL.en.md`
- `assets/source/speclite/ecosystems/other/documentation-only/speclite-documentation-only-project-auditor/references/documentation-only-project-audit-workflow.md`
- `assets/source/speclite/support-skills/speclite-check-canonical-source-change/scripts/check_canonical_source_change.mjs`
- `assets/source/speclite/support-skills/speclite-skill-creator/references/skill-creation-workflow.md`
- `assets/source/speclite/support-skills/speclite-skill-lint/references/check-rules.md`
- `docs/reference/canonical-source-layout.md`
- `docs/explanation/speclite-modules.md`
- `docs/reference/skills/ecosystem-skills.md`
- `release/packaging-manifest.json`
- `test/source-and-modules.test.ts`
- `test/install-module-selection.test.ts`
- `test/canonical-source-change-check-script.test.ts`
- `test/list-command.test.ts`

## Change Log（变更记录）

| Date | Version | Description | Author |
| --- | --- | --- | --- |
| 2026-07-06 | 0.1 | 创建 Story 10.4，定义 `other` category 准入规则、npm-package / cli-tool / documentation-only seed modules、迁移边界和 selected-only 验收。 | John / Codex |
| 2026-07-06 | 1.0 | 实现 other category 准入规则、npm-package / cli-tool / documentation-only seed modules、creator / lint reference、selected-only tests、canonical checker drift scan、docs/catalog 和 release packaging 验证，并将 Story 移至 review。 | Fancyliu / Codex |
