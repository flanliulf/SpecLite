# Story 9.3: Installed Skill Data Directory Projection（已安装 Skill data 目录投影）

Status: done

<!-- Corrective Story: `data/` 已是 canonical skill package layout 的合法 runtime resource，但 installed self-contained entry copy/hash/validation surface 尚未包含它。 -->

## Story（故事）

作为 SpecLite 维护者和 AI IDE 使用者，
我希望 canonical skill package 中的 skill-local `data/` 目录被安装到 `.claude/skills` 与 `.agents/skills` 的 self-contained skill entry 中，并被 hash、validate、fixture 和 update/repair 逻辑一致覆盖，
以便已安装 Workflow 可以从 `{skill-root}/data/` 读取结构化查表数据，不再依赖 source checkout，也不因缺少 `project-types.csv` 或 `domain-complexity.csv` 阻断执行。

## Acceptance Criteria（验收标准）

1. **Installed entries include skill-local data resources（安装入口包含 Skill 本地 data 资源）**
   **前提** canonical skill package root 中存在 `data/` 目录；
   **当** fresh install、existing update 或 IDE mirror writer 生成 `.claude/skills/<canonicalSkillId>/` 与 `.agents/skills/<canonicalSkillId>/`；
   **则** `data/` 下 regular files 必须按原 relative path 递归复制到两个 installed self-contained entries；
   **并且** 复制过程必须保留 raw bytes、relative POSIX path、file hash、`sourceRef`、ownership 和 executable intent；
   **并且** 不得复制 source-only `SKILL.en.md`，不得改写 canonical skill content，不得生成 adapter-owned placeholder data。

2. **Copy, package hash and validation surfaces stay identical（复制、包 Hash 与校验面保持一致）**
   **前提** `canonicalPackageHash` 用于证明同一 canonical skill package 在不同 IDE targets 中内容一致；
   **当** `data/` 被纳入 installed entry surface；
   **则** copy predicate、`hashPackageDirectory(... include ...)` predicate 和 `validateIdeMirror` hash predicate 必须使用同一语义，全部包含 `data/`；
   **并且** `.claude` 与 `.agents` 中同一 skill 的 `canonicalPackageHash` 必须一致；
   **并且** `ide-mirror.hash-mismatch`、duplicate-entry detection 和 file-integrity diagnostics 不得因为漏扫 `data/` 而误报健康；
   **并且** validate 不得扫描 source checkout 来补齐 baseline。

3. **Data-dependent workflow regressions are covered（依赖 data 的 Workflow 回归被覆盖）**
   **前提** canonical source 中存在 root-level `data/` 的 skill packages，包括 `speclite-create-prd`、`speclite-validate-prd`、`speclite-edit-prd`、`speclite-create-architecture`、`speclite-document-project`、`speclite-prfaq` 和 `speclite-product-brief`；
   **当** release gate 运行安装、fixture 或 focused tests；
   **则** 每个包含 root-level `data/` 的 installed skill entry 都必须在 `.claude/skills/<id>/data/` 和 `.agents/skills/<id>/data/` 中出现相同文件；
   **并且** `speclite-create-prd` 必须至少断言 `data/domain-complexity.csv` 与 `data/project-types.csv` 可从 installed skill root 旁路读取；
   **并且** `speclite-validate-prd` 必须至少断言同名 CSV 被安装；
   **并且** `references/data/` 继续通过 existing `references/` copy surface 覆盖，不得与 root-level `data/` 混淆。

4. **Installed-state fixtures and release gates are refreshed（安装态 Fixture 与发布门禁同步刷新）**
   **前提** `data/` 进入 installed package surface 会改变 files-index、installed tree 和 package hash；
   **当** 实现本 Story；
   **则** `test/fixtures/fresh-install-empty-project/expected/installed-state/files-index-full.json`、`skill-index-full.json`、`installed-tree.txt` 和相关 focused expected outputs 必须从真实 install / fixture runner 语义刷新；
   **并且** fixture updates 必须遵守 `08-fixture-contract.md` 的 change policy：先更新 owning contract / executable parser 或 predicate，再更新 snapshots；
   **并且** `release/packaging-manifest.json` 已包含 source `data/` files 时不得倒退；若 packaging check 对 installed surface 有 expected assertions，也必须同步；
   **并且** 若工作树出现 unrelated canonical skill roots 或 unrelated fixture drift，必须停止并记录为 scope blocker，不得把无关 baseline 改动混入本 Story。

5. **Update and repair preserve ownership boundaries（Update 与 Repair 保持所有权边界）**
   **前提** 既有安装缺少新纳入的 installed skill `data/` files，或这些 files 出现 installer-owned drift；
   **当** normal update、explicit `update --repair` 或 uninstall 处理 IDE skill entries；
   **则** new/missing `data/` files 必须按 installer-owned canonical package content 进入 planned update 或 repair eligibility；
   **并且** human-owned custom files、workflow-owned artifacts、`_speclite/custom/*.toml` 和 `_speclite-output/**` 不得被覆盖；
   **并且** restore / regenerate 行为必须复用既有 ownership、safe-write、conflict 和 hash evidence 模型，不新增第二套 repair semantics。

6. **Runtime activation contract remains Node-only and source-independent（运行时激活契约保持 Node-only 且不依赖源码）**
   **前提** Workflow activation 已由 Story 9.1 收口到 `speclite resolve`；
   **当** installed workflow 读取 `{skill-root}/data/*.csv` 或 `{skill-root}/data/*.json`；
   **则** 读取目标必须是 installed self-contained skill entry 中的相邻资源；
   **并且** 不得回退 `assets/source/speclite/**/data`、source checkout path、package cache path、legacy `_bmad` 目录或 Python resolver；
   **并且** `speclite resolve` 的 stdout/stderr、merge order、missing key behavior 和 `CommandResult` JSON contract 不得改变。

## Tasks / Subtasks（任务 / 子任务）

- [x] Task 1: Preflight and contract review（AC: 1-6）
  - [x] 读取 Epic 9、Story 9.1、Story 9.2、Story 2.2、Story 3.3、Story 6.2、Story 6.7 和本 Story。
  - [x] 读取 contract anchors：`04-manifest-index-contract.md`、`05-ide-adapter-registry-contract.md`、`08-fixture-contract.md`、ADR `0003-separate-canonical-skill-packages-from-adapter-artifacts.md`。
  - [x] 读取 implementation anchors：`src/fs/copy-tree.ts`、`src/ide/target-writer.ts`、`src/validation/rules/ide-mirror.ts`、`src/update/update-plan.ts`、`src/update/ownership-model.ts`、`test/runtime-structure.test.ts`、`scripts/release/packaging-check.mjs`。
  - [x] 检查 `git status --short`，确认没有 unrelated canonical roots、fixture drift 或用户改动需要隔离；若存在，先记录并请求授权。

- [x] Task 2: Add failing tests for missing installed data surface（AC: 1-4, 6）
  - [x] 增加 focused unit test，证明 `isInstallableCanonicalPackageFile("data/project-types.csv")` 或等价 shared predicate 初始必须覆盖 `data/`。
  - [x] 增加 install / fixture assertion，断言 `.claude/skills/speclite-create-prd/data/domain-complexity.csv`、`.claude/skills/speclite-create-prd/data/project-types.csv`、`.agents/skills/speclite-create-prd/data/domain-complexity.csv`、`.agents/skills/speclite-create-prd/data/project-types.csv` 存在并进入 files-index。
  - [x] 增加 `speclite-validate-prd` data mirror assertion。
  - [x] 增加 corpus assertion：source package root 下所有 `data/**` regular files 都必须出现在每个 selected installed target entry 的相同 relative path。
  - [x] 增加 negative assertion：删除 installed entry 中任一 `data/` file 后，`validateIdeMirror` 或 focused hash test 必须产生 mismatch / drift evidence。

- [x] Task 3: Extend canonical package surface implementation（AC: 1-2, 6）
  - [x] 将 canonical self-contained entry surface 扩展为：required `SKILL.md`，optional `CHANGELOG.md`、`references/`、`assets/`、`data/`、`scripts/`、`config.toml.example`、`customize.toml`。
  - [x] 优先让 copy、hash 和 validate 复用同一个 exported predicate 或 shared constants，避免 `copy-tree.ts` 与 `ide-mirror.ts` 再次漂移。
  - [x] 保持 `SKILL.en.md` 为 source-only 文件，除非另有 owning SPEC 变更；本 Story 不扩大到英文镜像安装策略。
  - [x] 确认 copied files 的 `artifactKind` 仍为 `ide-skill-package`，不新增 `data-file` 之类第二套分类，除非先更新 manifest/index owning SPEC。

- [x] Task 4: Update existing update / repair behavior if needed（AC: 5）
  - [x] 确认 normal update 对 newly included `data/` files 生成 planned writes 或 installer-owned drift conflicts，而不是静默忽略。
  - [x] 确认 `update --repair` 可以恢复 installer-owned `data/` drift，且不会覆盖 human-owned custom 或 workflow-owned artifacts。
  - [x] 确认 uninstall 删除 installer-owned skill entry 时包含 `data/` files。
  - [x] 若现有 update/repair tests 已由 files-index coverage 间接覆盖，记录等价证据；否则补 focused tests。

- [x] Task 5: Refresh fixtures, docs and packaging evidence（AC: 3-4, 6）
  - [x] 从真实 install 或 fixture runner 刷新 `fresh-install-empty-project` expected installed-state、installed tree 和 relevant hash snapshots。
  - [x] 同步 `path-portability`、`ide-drift` 或其它 release gate fixture 中受 `canonicalPackageHash` / files-index 影响的 expected outputs。
  - [x] 确认 `release/packaging-manifest.json` 与 `dist/packaging-manifest.json` 包含 source `data/` files；若 build/check 会刷新 dist，按 release gate 规则更新。
  - [x] 必要时更新 docs / reference，明确 installed skill package 的 self-contained runtime resources 包含 `data/`。
  - [x] 不修改 skill persona、workflow business content、PRD 模板内容或非 data 相关 copy policy。

- [x] Task 6: Verification（AC: 1-6）
  - [x] 运行 focused tests：`npm test -- test/runtime-structure.test.ts test/local-source-integrity.test.ts test/runtime-path-validation.test.ts` 或包含新增 data-surface tests 的等价命令。
  - [x] 运行 fixture release gate tests that cover `fresh-install-empty-project`。
  - [x] 运行 Story 9.1 activation corpus tests，确认没有因 `data/` 投影重新引入 source checkout / Python resolver fallback。
  - [x] 运行 update / repair / uninstall focused tests if touched。
  - [x] 运行 `npm run build`。
  - [x] 运行 `npm test -- --testTimeout 30000`。
  - [x] 运行 `npm run release:packaging-check`。
  - [x] 运行 `git diff --check`。

## Dev Notes（开发备注）

### Source Requirements（需求来源）

- Epic source: `_bmad-output/planning-artifacts/epics/12-epic-9-installed-runtime-activation-contract-hardening已安装-runtime-激活契约收口.md`
- Direct trigger: `/Users/fancyliu/Repos/noi` installed `speclite-create-prd` 缺少 installed `data/project-types.csv` 与 `data/domain-complexity.csv`，导致 workflow step 无法读取 `{skill-root}/data/*.csv`。
- Canonical package layout: `assets/source/speclite/README.md` 和 `docs/explanation/speclite-workflows.md` 均把 `data/` 定义为结构化查表数据目录。
- Runtime consumer examples: `speclite-create-prd`、`speclite-validate-prd`、`speclite-edit-prd`、`speclite-create-architecture`、`speclite-document-project`、`speclite-prfaq`、`speclite-product-brief`。

### Current Verified Gap（当前已验证缺口）

- Source side exists: `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-prd/data/domain-complexity.csv` and `data/project-types.csv` exist and are packaged in `release/packaging-manifest.json`.
- Installed side missing: `/Users/fancyliu/Repos/noi/.agents/skills/speclite-create-prd/data` and `/Users/fancyliu/Repos/noi/.claude/skills/speclite-create-prd/data` are absent.
- Current copy surface in `src/fs/copy-tree.ts` includes `references/`、`assets/`、`scripts/` only; it omits `data/`.
- Current package hash in `src/ide/target-writer.ts` uses `isInstallableCanonicalPackageFile`, so it also omits `data/`.
- Current mirror validation in `src/validation/rules/ide-mirror.ts` has a separate candidate list, also omitting `data/`.
- `test/fixtures/fresh-install-empty-project/expected/installed-state/files-index-full.json` contains `references/data/prd-purpose.md` for PRD workflows, but does not contain root-level `speclite-create-prd/data/*.csv` entries.

### Existing Patterns To Reuse（可复用既有模式）

- Story 2.2 established registry-driven target writer and self-contained entry layout. Extend that surface; do not add target-specific package rewrites.
- Story 3.3 established deterministic `canonicalPackageHash` validation against installed entry roots. Keep validate source-independent.
- Story 6.2 established `fresh-install-empty-project` as release gate fixture and requires real install-derived expected outputs.
- Story 6.7 established release packaging check discipline. Do not hand-edit package inventory without running the packaging gate if generated artifacts change.
- Story 9.1 established Node-only activation and corpus negative tests. `data/` projection must not weaken those tests.

### Root-Level Data Inventory At Story Creation（创建时 root-level data 清单）

The current source tree contains these skill-local root `data/` files:

- `assets/source/speclite/sdlc-skills/1-analysis/speclite-document-project/data/documentation-requirements.csv`
- `assets/source/speclite/sdlc-skills/1-analysis/speclite-document-project/data/project-types.csv`
- `assets/source/speclite/sdlc-skills/1-analysis/speclite-prfaq/data/speclite-manifest.json`
- `assets/source/speclite/sdlc-skills/1-analysis/speclite-product-brief/data/speclite-manifest.json`
- `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-prd/data/domain-complexity.csv`
- `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-prd/data/project-types.csv`
- `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-edit-prd/data/project-types.csv`
- `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-validate-prd/data/domain-complexity.csv`
- `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-validate-prd/data/project-types.csv`
- `assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-architecture/data/domain-complexity.csv`
- `assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-architecture/data/project-types.csv`

Implementation should discover this inventory dynamically instead of hard-coding only these paths.

### Scope Boundary（范围边界）

- 本 Story 只处理 installed self-contained skill package 的 `data/` projection、hash、validation、fixture、update/repair ownership 和 docs references。
- 不修改 `speclite resolve` command behavior。
- 不修改 workflow step business logic、CSV schema、PRD/Architecture content generation quality 或 `data/*.csv` 内容。
- 不改变 `SKILL.en.md` source-only 策略。
- 不新增 branded IDE target、command pointer artifact、daemon 或 Python fallback。
- 不把 source checkout 作为 runtime data fallback。

## Dependency Gate（依赖门禁）

- Story 9.1 必须保持 `done`，且 activation corpus negative tests 仍拒绝 source checkout / Python resolver fallback。
- Story 9.2 compatibility script projection 不得被本 Story 修改为 default activation dependency。
- Story 2.2 / 3.3 已完成，不回写历史 AC；本 Story 作为 corrective Story 扩展 installed package surface。
- 若 `sprint-status.yaml` 与 Story 文档状态冲突，先记录 gate artifact 或请求用户授权，不擅自改 unrelated tracker entries。

## Anchor Contract Map（锚点契约映射）

| Anchor Type | Anchor | Requirement |
| --- | --- | --- |
| Contract Anchor | `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md` | `canonicalPackageHash` 是 package-level equality hash，必须覆盖 installed canonical package surface。 |
| Contract Anchor | `_bmad-output/planning-artifacts/specs/05-ide-adapter-registry-contract.md` | Adapter maps canonical skill packages to self-contained target entries and must update release gate fixtures when adapter behavior changes。 |
| Contract Anchor | `_bmad-output/planning-artifacts/specs/08-fixture-contract.md` | `fresh-install-empty-project` release gate 必须覆盖全部 canonical package roots、IDE mirrors、files-index 和 expected outputs。 |
| Decision Anchor | `_bmad-output/planning-artifacts/adr/0003-separate-canonical-skill-packages-from-adapter-artifacts.md` | Canonical skill package content must stay identical across IDE targets; adapter artifacts remain separate。 |
| Functional Anchor | `src/fs/copy-tree.ts` | Canonical package copy predicate and copied files metadata。 |
| Functional Anchor | `src/ide/target-writer.ts` | `canonicalPackageHash` generation and target mirror writing。 |
| Functional Anchor | `src/validation/rules/ide-mirror.ts` | Installed entry hash validation and duplicate detection。 |
| Functional Anchor | `src/update/update-plan.ts` / `src/update/ownership-model.ts` | Existing update / repair ownership handling for newly included installed files。 |
| Evidence Anchor | `test/runtime-structure.test.ts` | Fresh install integration assertions for generated tree, files-index, phase coverage and package count。 |
| Evidence Anchor | `test/fixtures/fresh-install-empty-project/expected/installed-state/` | Expected installed-state snapshots must include `data/` entries and updated package hashes。 |
| Evidence Anchor | `release/packaging-manifest.json` / `scripts/release/packaging-check.mjs` | Source `data/` files must remain packaged and release check must stay green。 |

## Equivalent Implementation Policy（等价实现策略）

The preferred implementation is to add `data/` to a shared canonical package surface predicate reused by copy, hash and validation. An equivalent implementation is acceptable only if it proves identical behavior across writer, hash and validation with focused tests. Tests must fail if one surface includes `data/` and another omits it.

## Evidence Plan（证据计划）

- Focused predicate / copy tests for `data/`.
- Fresh install assertions for `speclite-create-prd` and `speclite-validate-prd` root-level `data/` files under both `.claude/skills` and `.agents/skills`.
- Corpus assertion for all source packages with root-level `data/**`.
- IDE mirror validation mismatch test when installed `data/` file is missing or drifted.
- Fixture refresh proof for `fresh-install-empty-project`.
- Story 9.1 activation corpus tests remain green.
- `npm run build`
- `npm test -- --testTimeout 30000`
- `npm run release:packaging-check`
- `git diff --check`

## Anchor Evidence Summary（锚点证据摘要）

待实现后填写。必须记录 root-level `data/` corpus count、`speclite-create-prd` installed data file evidence、`speclite-validate-prd` installed data file evidence、hash/validation mismatch evidence、fixture refresh command 和 Story 9.1 activation corpus gate evidence。

## Dev Agent Record（开发代理记录）

### Agent Model Used（使用模型）

GPT-5 Codex

### Debug Log References（调试日志引用）

- `python3 _bmad/scripts/resolve_customization.py --skill /Users/fancyliu/Repos/SpecLite/.agents/skills/bmad-dev-story --key workflow`：失败，当前默认 `python3` 缺少 stdlib `tomllib`。
- `python3.12 _bmad/scripts/resolve_customization.py --skill /Users/fancyliu/Repos/SpecLite/.agents/skills/bmad-dev-story --key workflow`：通过；workflow 无 prepend/append，persistent fact 为 `file:{project-root}/**/project-context.md`。
- Preflight：读取 Epic 9、Story 9.1、Story 9.2、Story 2.2、Story 3.3、Story 6.2、Story 6.7、contract anchors 和 implementation anchors；`git status --short` 显示 Story/Epic/tracker 已有授权改动和 untracked `9-3-code-review/`，未发现 `assets/source/speclite`、`src`、`test/fixtures`、`release` 范围的 unrelated drift。
- RED：`npm test -- test/installed-skill-data-surface.test.ts` 初始 3/3 失败，暴露 `data/` 未进入 copy/hash predicate、fresh install entry 和 validate drift surface。
- GREEN：`npm test -- test/installed-skill-data-surface.test.ts` 通过，3 tests passed。
- Fresh install fixture：从真实 `runInstallCommand` 刷新 `fresh-install-empty-project` expected installed-state 和 installed tree。
- `npm test -- test/runtime-structure.test.ts test/fixture-release-gates.test.ts`：2 files / 16 tests passed。
- `npm test -- test/update-planning.test.ts test/update-command.test.ts test/uninstall-command.test.ts`：3 files / 38 tests passed。
- `npm test -- test/runtime-structure.test.ts test/local-source-integrity.test.ts test/runtime-path-validation.test.ts test/installed-skill-data-surface.test.ts test/installed-activation-contract.test.ts`：5 files / 37 tests passed。
- `python3 assets/source/speclite/support-skills/speclite-agent-lint/scripts/check_agent_skill.py --self-test-legacy-activation`：pass，checked=6。
- `python3 assets/source/speclite/support-skills/speclite-agent-lint/scripts/check_agent_skill.py --all assets/source/speclite/sdlc-skills`：pass，checked=7，0 findings。
- `npm run build`：通过。
- `npm run release:packaging-check`：通过，刷新 `release/packaging-manifest.json` 与 `dist/packaging-manifest.json`。
- `npm test -- --testTimeout 30000`：56 files / 396 tests passed。
- `git diff --check`：通过。

### Completion Notes List（完成说明）

- Canonical self-contained skill package surface 已扩展到 root-level `data/`，`copyCanonicalPackage`、`hashPackageDirectory(... include ...)` 和 `validateIdeMirror` 现在复用 `isInstallableCanonicalPackageFile`，避免 copy/hash/validate surface 再次漂移。
- `SKILL.en.md` 仍保持 source-only；`data/**` copied entries 继续使用 `artifactKind: "ide-skill-package"`、`ownership: "installer-owned"`、raw-byte hash、stable `sourceRef` 和 existing safe-write model。
- 新增 `test/installed-skill-data-surface.test.ts` 覆盖 shared predicate、`speclite-create-prd` / `speclite-validate-prd` installed data files、全量 11 个 root-level `data/**` corpus files、`references/data/` 不混淆，以及删除 installed `data/project-types.csv` 后的 `ide-mirror.hash-mismatch` / file-integrity evidence。
- `update --repair` focused test 已扩展为恢复 IDE skill package 中缺失的 `data/project-types.csv`，normal update / repair / uninstall focused tests 保持通过；human-owned custom 与 workflow-owned artifacts 仍走既有 protected ownership boundary。
- `fresh-install-empty-project` expected `files-index-full.json`、`skill-index-full.json` 和 `installed-tree.txt` 已从真实 install 语义刷新；root-level `data/**` 在 `.claude/skills` 与 `.agents/skills` 下各 11 个文件，共 22 个 installed entries。
- `05-ide-adapter-registry-contract.md` 的 self-contained skill entry layout 已补充 `data/`；`release/packaging-manifest.json` 由 packaging gate 刷新且继续包含 source `data/` files。
- 未修改 `speclite resolve` command behavior、workflow business logic、CSV schema、`SKILL.en.md` 策略或 Python fallback。

### File List（文件清单）

- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/implementation-artifacts/stories/9-3-installed-skill-data-directory-projection.md`
- `_bmad-output/planning-artifacts/specs/05-ide-adapter-registry-contract.md`
- `release/packaging-manifest.json`
- `src/fs/copy-tree.ts`
- `src/validation/rules/ide-mirror.ts`
- `test/fixtures/fresh-install-empty-project/expected/installed-state/files-index-full.json`
- `test/fixtures/fresh-install-empty-project/expected/installed-state/skill-index-full.json`
- `test/fixtures/fresh-install-empty-project/expected/installed-tree.txt`
- `test/installed-skill-data-surface.test.ts`
- `test/update-planning.test.ts`

## Change Log（变更记录）

| Date | Version | Description | Author |
| --- | --- | --- | --- |
| 2026-06-20 | 0.1 | 创建 Story 9.3，定义 installed self-contained skill package `data/` projection、hash、validation、fixture 和 update/repair 边界。 | John / Codex |
| 2026-06-20 | 0.2 | 实现 installed skill root-level `data/` projection，统一 copy/hash/validate surface，刷新 fresh-install fixture 和 packaging evidence，并补充 update/repair/data-surface tests。 | GPT-5 Codex |
