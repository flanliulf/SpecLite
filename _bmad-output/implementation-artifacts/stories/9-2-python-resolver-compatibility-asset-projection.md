# Story 9.2: Python Resolver Compatibility Asset Projection（Python Resolver 兼容资产投影）

Status: blocked-by-9-1-corpus-gate

<!-- Corrective Story: Python resolver scripts 只作为兼容资产，不作为默认 installed skill activation path。 -->

## Story（故事）

作为 SpecLite 维护者，
我希望 legacy Python resolver scripts 在安装结果中被明确定义为 compatibility assets，而不是默认 runtime support，
以便保留排查和迁移价值，同时防止 installed skills 重新依赖 `_speclite/scripts/resolve_*.py`。

## Acceptance Criteria（验收标准）

1. **Python scripts are compatibility assets only（Python Scripts 仅是兼容资产）**
   **前提** `assets/source/speclite/scripts/resolve_config.py` 与 `assets/source/speclite/scripts/resolve_customization.py` 仍保留在 bundled source 中；
   **当** install / update / repair / packaging 处理这些 scripts；
   **则** 它们必须被标记为 compatibility assets，例如 `artifactKind: "runtime-compat-script"` 或 owning SPEC 允许的等价分类；
   **并且** docs / manifest / files-index 必须说明它们不是默认 skill activation path；
   **并且** Story 9.1 的 full corpus tests 必须继续拒绝 installed skills 引用这些 scripts。

2. **Fresh install projects compatibility scripts with ownership metadata（Fresh Install 投影兼容脚本与所有权元数据）**
   **前提** 用户执行 fresh install；
   **当** installer 写入 `_speclite` runtime structure；
   **则** 若产品决策保留 compatibility assets，必须写入 `_speclite/scripts/resolve_config.py` 与 `_speclite/scripts/resolve_customization.py`；
   **并且** `files-index.json` 必须记录 project-relative path、`installer-owned` ownership、`runtime-compat-script` artifact kind、`sourceRef`、`sha256` hash、`hashAlgorithm` 和 executable intent；
   **并且** safe-write、path boundary、line ending 和 hash projection 必须与其它 installer-owned assets 一致。

3. **Validation distinguishes compat assets from legacy activation dependency（Validation 区分兼容资产与 Legacy 激活依赖）**
   **前提** `validateRuntimePaths` 或等价 validation 读取 files-index；
   **当** `_speclite/scripts/resolve_*.py` 以 approved compatibility asset 形态存在；
   **则** 不得仅因该 path 存在而报告 `runtime-path.legacy-resolver-path`；
   **并且** 如果 Skill activation text、manifest runtime entry、help/phase reference 或 docs default path 引用这些 scripts 作为 resolver，则必须报告 legacy resolver dependency 或让 corpus test 失败。

4. **Update, repair and uninstall honor compatibility asset ownership（Update、Repair 与 Uninstall 尊重兼容资产所有权）**
   **前提** installed project 中 compatibility scripts 缺失、hash drift、mode drift 或 sourceRef drift；
   **当** normal update、explicit `update --repair` 或 uninstall 执行；
   **则** normal update 对 installer-owned drift 保持 conflict / planned update 语义；
   **并且** explicit repair 只可恢复 installer-owned compatibility scripts；
   **并且** uninstall 可移除 installer-owned compatibility scripts；
   **并且** human-owned custom files 与 workflow-owned artifacts 不受影响。

5. **Packaging inventory includes source and installed compatibility asset rules（Packaging Inventory 包含源码与安装兼容资产规则）**
   **前提** 运行 release packaging gate；
   **当** package inventory 校验 runtime assets；
   **则** `assets/source/speclite/scripts/resolve_config.py` 与 `assets/source/speclite/scripts/resolve_customization.py` 必须作为 packaged source assets 存在；
   **并且** packaging manifest / tests 必须断言它们的 classification 是 compatibility，不是 default resolver runtime dependency；
   **并且** 不得为了让 packaging gate 通过而把 `test/fixtures/` 或 root `fixtures/` 打包。

6. **Docs and fixtures state the Node-only default clearly（Docs 与 Fixture 清楚声明 Node-only 默认）**
   **前提** 用户或维护者阅读 runtime boundary、CLI reference、install docs 或 fixture README；
   **当** 文档提到 `_speclite/scripts/resolve_*.py`；
   **则** 必须明确这些 scripts 是 legacy compatibility / troubleshooting assets；
   **并且** `speclite resolve config` 与 `speclite resolve customization` 是唯一默认 installed activation resolver；
   **并且** docs 不得建议 users 在正常 activation 中运行 Python resolver。

## Tasks / Subtasks（任务 / 子任务）

- [ ] Task 0: Enforce Story 9.1 corpus gate before implementation（AC: 1, 3）
  - [ ] 在开始本 Story implementation 前，确认 Story 9.1 已完成，或至少已提供并通过 full corpus activation negative tests。
  - [ ] hard check 必须覆盖 canonical source `SKILL*.md`、references、workflow terminal step files、fresh install mirrored `SKILL*.md` / references，以及 Story 9.1 定义的 support-side `speclite-agent-*` inventory negative scan。
  - [ ] 若缺少上述证据，本 Story 保持 `blocked-by-9-1-corpus-gate`，不得投影 `_speclite/scripts/resolve_*.py` compatibility assets。
  - [ ] 修订实现记录必须链接 Story 9.1 corpus gate 的测试命令与通过结果；不得用手工抽样替代 full corpus gate。

- [ ] Task 1: Preflight and ownership contract review（AC: 1-6）
  - [ ] 读取 Story 1.5、3.4、4.1、4.6、6.2、6.4、6.7、9.1 和 Epic 9。
  - [ ] 读取 implementation anchors：`src/installer/runtime-structure.ts`、`src/manifest/manifest-schema.ts`、`src/validation/rules/runtime-path.ts`、`src/update/ownership-model.ts`、`src/update/update-plan.ts`、`scripts/release/packaging-check.mjs`。
  - [ ] 确认现有 tests 中对 `_speclite/scripts/resolve_config.py` 的期待，例如 path-portability fixture，目前是否仍使用 `artifactKind: "runtime-script"`。
  - [ ] 保留所有与本 Story 无关的 dirty worktree 改动。

- [ ] Task 2: Add failing tests for compat classification（AC: 1-3）
  - [ ] 新增 fresh install assertion：`_speclite/scripts/resolve_config.py` 与 `resolve_customization.py` 存在，且 `artifactKind` 为 `runtime-compat-script`。
  - [ ] 新增 validation assertion：approved compat entries 不产生 `runtime-path.legacy-resolver-path`。
  - [ ] 新增 negative assertion matrix：Skill activation text、manifest runtime entry、help/phase reference、docs default resolver path、packaging metadata 中任一把 `_speclite/scripts/resolve_*.py` 宣称为 default resolver / default runtime support 时必须失败。
  - [ ] 新增 allowed assertion：只有明确标注 `runtime-compat-script`、legacy compatibility、migration aid 或 troubleshooting asset，且未作为 default activation resolver 的引用可以通过。
  - [ ] 更新 path-portability fixture expected files-index，把 Python resolver scripts 从 `runtime-script` 改为 compatibility classification。

- [ ] Task 3: Project compatibility scripts during install（AC: 2）
  - [ ] 在 runtime structure writer 中从 `assets/source/speclite/scripts/` 复制 `resolve_config.py` 与 `resolve_customization.py` 到 `_speclite/scripts/`。
  - [ ] 为 compatibility scripts 记录 `installer-owned`、`runtime-compat-script`、`sourceRef`、hash 和 executable intent。
  - [ ] 保持 safe-write、path boundary、LF canonical text 和 source descriptor redaction。
  - [ ] 不让 installed skill activation 文案引用 `_speclite/scripts/`。

- [ ] Task 4: Adjust runtime validation and ownership logic（AC: 3-4）
  - [ ] 更新 `validateRuntimePaths`：approved `runtime-compat-script` under `_speclite/scripts/resolve_*.py` 不再被当作 legacy namespace violation。
  - [ ] 保留对 `_bmad/`、unapproved `_speclite/scripts/*`、activation text legacy reference、manifest default resolver reference、help/phase default resolver reference、docs default path reference、packaging metadata default resolver reference 和 source checkout resolver reference 的 negative behavior。
  - [ ] 更新 update / repair ownership model，确保 compatibility scripts 走 installer-owned drift、restore-canonical 或 regenerate 语义。
  - [ ] 更新 uninstall tests，确保 installer-owned `_speclite/scripts/` compatibility assets 被移除，human/workflow paths 保留。

- [ ] Task 5: Refresh fixtures, packaging and docs（AC: 2, 5, 6）
  - [ ] 更新 `test/fixtures/fresh-install-empty-project/expected/installed-state/`。
  - [ ] 更新 `test/fixtures/path-portability/expected/manifest-index/files-index.json`。
  - [ ] 更新 `release/packaging-manifest.json` 和 `scripts/release/packaging-check.mjs` expected classification，并增加 packaging metadata negative assertion：不得把 Python resolver scripts 标记为 default resolver runtime dependency。
  - [ ] 更新 `README.md`、`docs/reference/cli.md`、`docs/explanation/local-first-control-plane.md`、`docs/glossary/speclite-runtime-boundaries.md` 或等价 docs，明确 Python scripts 是 compatibility assets。
  - [ ] docs default path 负向断言必须覆盖上述 docs：若文档把 `_speclite/scripts/resolve_*.py` 作为默认 activation resolver、默认 CLI resolver 或推荐正常路径，测试必须失败；仅 troubleshooting / compatibility / migration context 可通过。

- [ ] Task 6: Verification（AC: 1-6）
  - [ ] 先运行 Story 9.1 full corpus activation tests 和 support-side inventory negative scan；未通过则停止本 Story。
  - [ ] 运行 `npm test -- test/runtime-path-validation.test.ts test/story-6-4-path-portability.test.ts test/release-packaging-check.test.ts`。
  - [ ] 运行 fresh install fixture focused tests。
  - [ ] 运行 update / repair / uninstall focused tests。
  - [ ] 运行 negative assertion matrix focused tests，覆盖 manifest runtime entry、help/phase reference、docs default resolver path 和 packaging metadata。
  - [ ] 运行 `npm test -- --testTimeout 30000`。
  - [ ] 运行 `npm run release:packaging-check`。
  - [ ] 运行 `git diff --check`。

## Dev Notes（开发备注）

### Source Requirements（需求来源）

- Epic source: `_bmad-output/planning-artifacts/epics/12-epic-9-installed-runtime-activation-contract-hardening已安装-runtime-激活契约收口.md`
- Story 1.5 已说明：若安装 shared runtime scripts，必须 files-index、sourceRef、executable intent，并且 legacy Python resolver 不得成为主 resolver。
- Story 6.7 已要求 packaging inventory 覆盖 runtime scripts/templates。
- Story 9.1 定义 Node-only 默认 activation contract，Story 9.2 不得削弱该负向断言。

### Current Verified Gap（当前已验证缺口）

- `assets/source/speclite/scripts/` 中存在 `resolve_config.py` 和 `resolve_customization.py`，但 fresh install 当前未必投影到目标 `_speclite/scripts/`。
- `test/story-6-4-path-portability.test.ts` 当前存在 `_speclite/scripts/resolve_config.py` 的 `runtime-script` expected assertion；该语义会让 Python resolver 看起来像默认 runtime support。
- `src/validation/rules/runtime-path.ts` 当前把 `_speclite/scripts/` 视为 runtime entry，并可能把 resolver script path 识别成 legacy reference；实现本 Story时要区分 approved compat asset 和 default activation dependency。

### Negative Assertion Matrix（负向断言矩阵）

| Surface | Must Fail When | Allowed When |
| --- | --- | --- |
| Skill activation text | `SKILL*.md` 或 installed mirror 引用 `_speclite/scripts/resolve_*.py` 作为 resolver / activation command。 | 文本只说明 Python scripts 是 legacy compatibility / troubleshooting assets，且默认 activation 仍是 `speclite resolve`。 |
| Manifest runtime entry | manifest / files-index / module metadata 将 resolver scripts 标记为 `runtime-script`、default resolver 或 default runtime support。 | 条目使用 `runtime-compat-script` 或 owning SPEC 允许的等价 compatibility classification。 |
| Help / phase reference | help index、phase coverage、workflow phase metadata 把 Python scripts 作为正常 resolver 路径或默认 activation dependency。 | 仅在 migration aid、diagnostics 或 troubleshooting context 中说明其兼容用途。 |
| Docs default resolver path | README、CLI reference、runtime boundary docs 建议用户在正常 activation 中运行 `_speclite/scripts/resolve_*.py`。 | docs 明确 Node `speclite resolve` 是唯一默认 installed activation resolver，Python scripts 只用于 compatibility / troubleshooting。 |
| Packaging metadata | packaging manifest / release check 把 scripts 宣称为 default resolver runtime dependency。 | packaging metadata 保留 source asset 和 installed compat asset，classification 为 compatibility。 |

### Scope Boundary（范围边界）

- 本 Story 只处理 Python resolver scripts 的 compatibility asset projection 和 ownership lifecycle。
- 不修改 `speclite resolve` implementation。
- 不让 Skill activation 使用 Python scripts。
- 不新增 Python runtime dependency requirement、virtualenv management、pyenv docs 主路径或 automatic Python execution。
- 不把 compatibility scripts 作为 release gate 的默认 resolver path。

## Dependency Gate（依赖门禁）

- Story 9.1 必须先完成，或至少先提供并通过 full corpus negative tests，防止本 Story 安装 compat scripts 后被误用为 default activation path。
- hard gate 证据必须包含 canonical source `SKILL*.md`、references、workflow terminal step files、fresh install mirror 和 support-side `speclite-agent-*` inventory negative scan；缺失任一项时，本 Story 不得进入 implementation。
- Story 2.4 / 8.5 的 resolve machine contract 不得改变。

## Anchor Contract Map（锚点契约映射）

| Anchor Type | Anchor | Requirement |
| --- | --- | --- |
| Contract Anchor | `_bmad-output/planning-artifacts/specs/06-resolve-command-contract.md` | Node `speclite resolve` 仍是默认 runtime support。 |
| Decision Anchor | `_bmad-output/planning-artifacts/adr/0002-replace-python-resolvers-with-node-parity.md` | Python resolver 是 baseline / diagnostics，不是长期 runtime dependency。 |
| Functional Anchor | `src/installer/runtime-structure.ts` | Fresh install compatibility scripts projection。 |
| Functional Anchor | `src/validation/rules/runtime-path.ts` | Runtime path validation must distinguish compat asset vs legacy dependency。 |
| Functional Anchor | `src/update/ownership-model.ts` / `src/update/update-plan.ts` | Update / repair ownership semantics for installer-owned compat scripts。 |
| Functional Anchor | `scripts/release/packaging-check.mjs` | Packaging inventory classification。 |
| Evidence Anchor | manifest / help / phase / docs / packaging metadata negative assertion matrix | Any default resolver claim for `_speclite/scripts/resolve_*.py` must fail。 |
| Evidence Anchor | `test/story-6-4-path-portability.test.ts` | Path-portability files-index classification update。 |
| Evidence Anchor | `test/runtime-path-validation.test.ts` | Compat assets do not trigger legacy path issue。 |
| Evidence Anchor | Story 9.1 corpus tests | Installed skills still reject Python resolver dependency。 |

## Equivalent Implementation Policy（等价实现策略）

`runtime-compat-script` 是推荐 artifact kind。若 implementation 选择不同字段名或 classification，必须先更新 owning SPEC / manifest schema / fixture expected outputs，并保持以下语义：installer-owned、source-referenced、hash-indexed、repairable、uninstallable、not default resolver。

## Evidence Plan（证据计划）

- `npm test -- test/runtime-path-validation.test.ts test/story-6-4-path-portability.test.ts test/release-packaging-check.test.ts`
- Story 9.1 full corpus activation contract tests and support-side inventory negative scan
- negative assertion matrix focused tests for manifest runtime entry、help/phase reference、docs default resolver path and packaging metadata
- fresh install fixture focused tests
- update / repair / uninstall focused tests
- `npm test -- --testTimeout 30000`
- `npm run release:packaging-check`
- `git diff --check`

## Anchor Evidence Summary（锚点证据摘要）

待实现后填写。必须记录 compatibility classification、validation allowlist、activation negative test 和 packaging inventory evidence。

## Dev Agent Record（开发代理记录）

### Agent Model Used（使用模型）

待实现后填写。

### Debug Log References（调试日志引用）

待实现后填写。

### Completion Notes（完成说明）

待实现后填写。

### File List（文件清单）

待实现后填写。

## Change Log（变更记录）

| Date | Version | Description | Author |
| --- | --- | --- | --- |
| 2026-06-17 | 0.1 | 创建 Story 9.2，定义 Python resolver scripts 作为 compatibility assets 的安装投影、验证、更新修复、打包和文档边界。 | John / Codex |
