# Story 1.3: Official Module Selection And Install Summary（官方模块选择与安装摘要）

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story（故事）

作为项目维护者，  
我希望在安装前选择要安装的官方 SpecLite 模块或能力包，并看到清晰的版本与选择摘要，  
以便确认本次安装范围符合项目需要。

## Acceptance Criteria（验收标准）

1. **Module discovery starts only after Story 1.2 target confirmation.**  
   **前提** runtime/platform guard 已通过，目标目录已解析，且用户已确认可以继续安装流程；  
   **当** `speclite install` 进入官方模块发现阶段；  
   **则** 系统才可以读取 bundled official source tree；  
   **并且** 在目标目录未确认、explicit dry-run、脚本模式缺少 `--yes` 或 existing-install branch 阻断时，不得继续到 module selection 的写入型后续阶段；  
   **并且** 本 Story 仍不得创建或修改 `_speclite`、`_speclite-output`、`.claude/skills` 或 `.agents/skills`。

2. **Bundled official source is projected through `SourceDescriptor`.**  
   **前提** 系统进入 official source discovery；  
   **当** 使用默认官方来源；  
   **则** 来源必须投影为 `sourceType: "bundled"` 的 `SourceDescriptor`；  
   **并且** canonical source tree 必须来自 package 内 `assets/source/speclite/`；  
   **并且** public `resolvedRoot` 只能使用 display-safe label，例如 `assets/source/speclite`，不得泄露 npm cache、temporary extraction path、home directory 或 absolute local path；  
   **并且** 必须复用 `src/source/source-descriptor-schema.ts`，不得在 installer 或 module parser 中手写第二套 source descriptor shape。

3. **Bundled source integrity is checked before module selection succeeds.**  
   **前提** 系统准备把 bundled source 作为可安装官方来源；  
   **当** 构造 `SourceDescriptor.integrityEvidence`；  
   **则** 必须至少记录一种可复现 evidence；  
   **并且** 若 Story 1.1/1.2 或 packaging scaffold 已提供 packaging manifest、package hash 或 package lock/hash anchor，必须复用该 anchor；  
   **并且** 缺少 bundled source packaging evidence 时必须输出 `source-integrity.missing-evidence` 并停止后续安装阶段；  
   **并且** 不得仅因为 source type 是 `bundled` 就把 `trustStatus` 设置为 `trusted`。

4. **Official modules are discovered from distributable module metadata only.**  
   **前提** bundled source descriptor 可用且未被 source-integrity blocker 阻断；  
   **当** 系统发现可安装模块；  
   **则** 只能从 `assets/source/speclite/` 下正式可分发的 module metadata 和 source skill packages 读取模块；  
   **并且** 当前已知 module metadata 至少包括 `assets/source/speclite/core-skills/module.yaml` 与 `assets/source/speclite/sdlc-skills/module.yaml`；  
   **并且** module help/menu source 至少包括对应的 `module-help.csv`；  
   **并且** module package discovery 必须支持 module directory 下的 nested `SKILL.md` package roots，不得只检查 module directory top-level；  
   **并且** 默认可安装、可镜像或可进入 installed-state / ReadyCheck 的 module 必须具备 canonical self-contained skill packages；缺少 canonical packages 的 module 只能作为不可默认安装的 diagnostic state，除非后续补齐 packages 或 owning SPEC 明确引入 metadata-only module contract；  
   **并且** 不得把 `_bmad-output/`、archive docs、test fixtures、local cache、build output、IDE mirrors、workflow output、已删除路径或非目标辅助来源列为可安装模块。

5. **Module list presents stable identity, name and version information.**  
   **前提** 系统发现一个或多个 official modules；  
   **当** 向用户展示模块列表或返回 `install --json` module selection state；  
   **则** 每个模块必须有 stable module id、display name 和 version information；  
   **并且** module id 使用 source metadata 中的 `code`，例如 `core`、`sdlc`；  
   **并且** display name 使用 source metadata 中的 `name`；  
   **并且** 当前 live `module.yaml` 尚未包含显式 module `version` 字段，因此实现必须先通过 module metadata schema 或 source/package version projection 定义版本来源，再展示版本；不得静默显示 `unknown`、目录名、当前日期或 hard-coded placeholder 作为成功版本。

6. **User can select one or more official modules.**  
   **前提** 模块列表有效；  
   **当** 用户在交互模式中选择模块，或脚本模式使用后续已契约化的 selection input；  
   **则** 系统会产生 deterministic selected module set；  
   **并且** `default_selected: true` 只能作为默认选择提示，不得绕过用户确认直接写入；  
   **并且** 如果 core module 是运行时必需能力，必须通过 module metadata/schema 或 installer rule 显式表达 required dependency，不得在 prompt renderer 中隐式硬编码。

7. **Install scope summary is shown before any project write.**  
   **前提** 用户已选择一个或多个官方模块；  
   **当** 系统生成安装范围摘要；  
   **则** 摘要必须列出 selected modules、module versions、capability/scope summary、source descriptor summary 和后续会参与安装的能力范围；  
   **并且** 该摘要必须在任何 project file write 之前展示给用户确认；  
   **并且** 摘要不是 Story 1.6 的 ready summary，不得声称 runtime、manifest、IDE mirrors、config 或 ReadyCheck 已完成。

8. **No official module is a blocking diagnostic state.**  
   **前提** bundled source descriptor 可用；  
   **当** 系统无法发现任何有效可安装 official module；  
   **则** 命令必须停止后续安装阶段；  
   **并且** 输出可诊断 failure、stable issue 和 next action；  
   **并且** 不得进入 config initialization、IDE mirror creation、manifest generation、runtime writes 或 ready summary。

9. **`install --json` reuses `CommandResult` and does not invent automation fields.**  
   **前提** 用户请求 `speclite install --json`；  
   **当** module selection 阶段完成、等待确认或失败；  
   **则** 输出必须通过 `src/diagnostics/command-result-schema.ts` 的 `CommandResult<InstallCommandData>` executable anchor；  
   **并且** `sourceDescriptor`、`installedModules`、`paths`、`completedSteps` 和 `pendingSteps` 必须遵守 owning SPEC 的字段、排序和 path policy；  
   **并且** pre-write fresh install 中 `installedModules` 只能为空，或在 existing-install branch 中反映已存在且已验证的 installed-state fact；不得把 selected、pending、planned 或 configured module state 塞入 `installedModules`；  
   **并且** pending / selected state 只能通过 `completedSteps`、`pendingSteps`、`issues`、`nextActions` 与 human-readable summary 表达；  
   **并且** 如果未来需要暴露 `pendingModuleSelection`、`selectedModules` 或 module summary 的新 public JSON field，必须先更新 `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md` 并同步 schema/tests；不得只在 reporter 或 fixture 中发明字段。

## Tasks / Subtasks（任务 / 子任务）

- [x] Task 1: 验证 Story 1.1 / Story 1.2 前置实现与范围边界（AC: 1, 9）
  - [x] 确认 Story 1.1 已经提供 TypeScript/commander scaffold、runtime/platform guard、`CommandResult` anchor、`SourceDescriptor` anchor、`InstallPlan` anchor、manifest anchor、adapter registry anchor 和 fixture contract anchor。
  - [x] 确认 Story 1.2 已经提供 target directory resolution、directory state inspection、existing-install detection 和 target confirmation gate。
  - [x] 如果 `package.json`、`src/`、`test/` 或 Story 1.1/1.2 预期实现文件仍不存在，停止 Story 1.3 实现并先完成前序 Story；不得在本 Story 中重建前序 scaffold 或绕过 target confirmation gate。
  - [x] 保留 Story 1.1/1.2 的 no-write guarantees：runtime/platform failure、target confirmation pending、missing target、existing install 或 malformed manifest branch 不得产生 project writes。

- [x] Task 2: 实现 bundled official source descriptor 读取与 evidence gate（AC: 2, 3）
  - [x] 在 `src/source/` 中扩展或新增 bundled source discovery helper；优先复用现有 `source-descriptor-schema.ts`。
  - [x] 将默认官方来源解析为 `SourceDescriptor`，`sourceType: "bundled"`，`resolvedRoot: "assets/source/speclite"` 或等价 display-safe label。
  - [x] 从 packaging manifest、package file inventory hash、package hash 或 package lock/hash 中读取 bundled source integrity evidence；如果这些 anchor 尚未由前序 Story 建立，先实现最小可测试 anchor，或用 blocking `source-integrity.missing-evidence` 明确停止。
  - [x] `trustStatus: "trusted"` 只能来自 verified evidence；evidence 存在但未命中 trust anchor 时只能是 `unverified`；hash mismatch、missing evidence 或 failed verification 必须是 `blocked` 并阻断写入规划。
  - [x] Source staging/cache/temp paths 是 private implementation state，不能进入 public JSON、manifest/index、fixture snapshot 或 issue details。

- [x] Task 3: 实现 official module metadata parser（AC: 4, 5）
  - [x] 在 `src/modules/module-metadata.ts` 或等价 module 中读取 `assets/source/speclite/*/module.yaml`，并用 existing YAML parser dependency 解析。
  - [x] 当前 source tree 中至少应发现 `core` 与 `sdlc` 两个 official module；不要把 helper scripts、custom examples、support-only tooling、fixtures、archives 或 installed-state directories 当作 modules。
  - [x] 明确 module metadata schema 的必填字段：`code`、`name`、`description` 和 version source；如需要新增 `version` 字段，必须同步 source metadata fixture 和 parser tests。
  - [x] 读取 `module-help.csv` 时只用于 capability/help/menu summary；不得从 menu code 或 display label 反推 module id。
  - [x] 验证 default installable / mirrorable module 的 canonical package availability；package root discovery 必须递归识别 module directory 下的 nested `SKILL.md` package roots，不得只检查 top-level；缺少 package 的 module 不得作为默认 installed module 进入后续 IDE mirror 或 ReadyCheck。
  - [x] Parser 对 malformed YAML/CSV、missing required field、duplicate module code、duplicate skill id、unsupported directory shape 输出 deterministic diagnostic；不要抛 raw parser error 作为用户主输出。

- [x] Task 4: 处理 module version 与 dependency semantics（AC: 5, 6）
  - [x] 解决 live metadata 缺少 module `version` 的实现缺口：推荐在 module metadata schema 中新增明确 `version`，并更新 bundled `module.yaml`；若采用 source/package version fallback，必须把 fallback 写入 schema/tests，而不是 renderer 私有逻辑。
  - [x] 如果 `core` 是 `sdlc` 或其他 module 的 required dependency，使用 metadata field 或 module selection rule 显式表达；不得让用户取消后才在后续写入阶段失败。
  - [x] `default_selected: true` 只作为 default selection source；required module、default module 与 user-selected module 必须在 internal state 中可区分。
  - [x] Module ordering 使用 source manifest/module order；没有 source order 时才使用 normalized module id lexicographic order。

- [x] Task 5: 实现 module selection model 和 prompt/headless boundary（AC: 6, 7）
  - [x] 在 `src/modules/module-selection.ts` 或等价 module 中实现 deterministic selection state，至少包含 available modules、default selected modules、required modules、user selected modules 和 rejected/invalid selections。
  - [x] 交互 prompt 必须展示 module id、name、version 和简短 scope，不依赖颜色或符号才能理解。
  - [x] MVP `speclite install` 当前 public flag matrix 只有 `--json`、`--yes`；如果要新增 module selection flag，必须先更新 owning SPEC 和 parser/schema/tests。
  - [x] Headless/automation mode 若无法获得明确 module selection，应保留 no-write pending state 或使用已契约化 defaults；不得在无确认情况下写入项目文件。
  - [x] Invalid module id 必须返回 stable diagnostic；不要把 free-form prompt text 作为唯一错误表达。

- [x] Task 6: 生成 pre-write install scope summary（AC: 7, 9）
  - [x] 在 `src/installer/` 中把 selected modules 写入 internal `InstallPlan.selectedModules`，但不要执行 project writes。
  - [x] Summary 必须展示 selected module ids、module names、versions、source descriptor summary、capability scope 和 next action。
  - [x] Summary 必须明确哪些动作尚未发生：config initialization、runtime structure creation、IDE mirror creation、manifest/index generation、ReadyCheck 和 ready summary。
  - [x] Human-readable output 使用 Evidence profile 的克制结构，支持 `NO_COLOR`、non-TTY 和 CI 文本等价。
  - [x] JSON output 使用契约化 `CommandResult` fields；pre-write fresh install 的 `installedModules` 保持为空，不要新增未契约化 `installSummary`、`readySummary`、`selectedModules` 或 `pendingModuleSelection` blob。

- [x] Task 7: 处理 no-module、invalid-source 和 evidence-missing 分支（AC: 3, 8, 9）
  - [x] no official module 时，命令停止并输出 failure；`completedSteps` 与 `pendingSteps` 保持 command-defined stable lifecycle order。
  - [x] bundled source 缺少 evidence 时输出 `source-integrity.missing-evidence`，category 为 `source-integrity`，severity 为 `error`，并停止后续安装阶段。
  - [x] malformed module metadata 不得被忽略为“没有模块”；应输出明确 diagnostic，区分 no module 与 invalid module source。
  - [x] 失败分支均断言未创建 `_speclite`、`_speclite-output`、`.claude/skills`、`.agents/skills`、manifest/index、config TOML 或 operation lock。

- [x] Task 8: 编写 focused tests 与 fixture assertions（AC: 1-9）
  - [x] Unit tests 覆盖 bundled `SourceDescriptor` projection、evidence ordering、trustStatus derivation 和 missing evidence failure。
  - [x] Unit tests 覆盖 module metadata parser：`core`、`sdlc`、missing version、duplicate code、malformed YAML/CSV、non-distributable directory filtering。
  - [x] Unit tests 覆盖 module selection：default selected、required dependency、multi-select、invalid id、stable ordering。
  - [x] Integration tests 覆盖 `speclite install` 在 target confirmation 后进入 module selection，但仍不写入项目文件。
  - [x] Integration tests 覆盖 `speclite install --json` module selection success/pending/failure 的 semantic JSON parse；不得 raw byte 比较当前时间、absolute path 或 terminal formatting。
  - [x] Regression tests 覆盖 Story 1.1/1.2 failure/pending branches，确保 Story 1.3 没有提前读取 source 或写文件。
  - [x] Tests 不访问 npm registry、private registry、Git remote、offline bundle origin 或外部网络。

- [x] Task 9: 本地验证与范围控制（AC: 1-9）
  - [x] 运行 `npm run build`。
  - [x] 运行 `npm test`，或至少运行 Story 1.3 touched modules 的 focused Vitest tests。
  - [x] 如果 Story 1.3 新增或改变 public JSON field、module metadata schema 或 source descriptor producer behavior，确认同一变更中更新 owning SPEC、executable schema/parser 和 fixture expected outputs。
  - [x] 检查 diff，确认没有实现 Story 1.4 config initialization、Story 1.5 runtime/IDE mirror writes、Story 1.6 ready summary 或 Post-MVP `list` / `doctor` / `sync` / `uninstall`。
  - [x] 检查 no-write tests 覆盖 module discovery failure、module selection pending、missing evidence 和 no official module 分支。

## Dev Notes（开发备注）

### Current Repository State（当前仓库状态）

- 创建本 Story 时，仓库根目录仍没有 `package.json`、`package-lock.json`、`src/`、`test/`、`tests/` 或 root `fixtures/` 实现目录。Story 1.3 的开发必须在 Story 1.1 和 Story 1.2 实际实现之后进行。
- `_bmad-output/implementation-artifacts/1-1-cli-install-entry-and-runtime-guard.md` 与 `_bmad-output/implementation-artifacts/1-2-project-target-directory-resolution-and-existing-install-detection.md` 当前是 ready-for-dev story context，不是完成后的代码证据。
- 当前 worktree 已存在与本 Story 创建无关的 dirty planning artifacts 和 `sprint-status.yaml` 改动；实现 Story 1.3 时不得格式化、重写或同步这些 planning artifacts。
- `assets/source/speclite/` 已存在，并包含 official bundled source assets。当前可见模块入口包括：
  - `assets/source/speclite/core-skills/module.yaml`
  - `assets/source/speclite/core-skills/module-help.csv`
  - `assets/source/speclite/sdlc-skills/module.yaml`
  - `assets/source/speclite/sdlc-skills/module-help.csv`
  - `assets/source/speclite/sdlc-skills/**/SKILL.md` nested canonical skill packages（当前 40 个 package entries，例如 `2-plan-workflows/speclite-create-prd/SKILL.md`、`3-solutioning/speclite-story-review-02-evaluator/SKILL.md`、`4-implementation/speclite-dev-story/SKILL.md`）
- 当前 `module.yaml` 文件包含 `code`、`name`、`description`、config prompts、directories 或 agents 等字段，但未包含显式 module `version` 字段。Story 1.3 必须正面处理该缺口。

### Scope Boundary（范围边界）

- 本 Story 只负责 official bundled source discovery、module metadata parsing、module selection、pre-write install scope summary 和对应 JSON/diagnostics。
- 本 Story 不负责：
  - Story 1.4 project config initialization、快速/详细配置模式、`_speclite/config.toml` 或 human-owned TOML stubs。
  - Story 1.5 `_speclite` runtime writes、`_speclite-output` creation、IDE mirror creation、manifest/index generation、files index/hash projection。
  - Story 1.6 install progress full sequence、ReadyCheck、ready summary、final installed-state summary。
  - `speclite status`、`speclite validate`、`speclite update`、`update --repair` 的完整实现。
  - Epic 5 alternative sources：npm/private registry/local tarball/offline bundle/Git/local path 的完整 source selection。
  - Post-MVP `init`、`list`、`doctor`、`sync`、`uninstall`、top-level `repair`、Copilot/Cursor branded target ids 或 command pointer artifacts。

### Architecture Requirements（架构要求）

- Runtime baseline remains Node.js 22 minimum and Node.js 24 recommended. Do not use Node 24-only APIs unless a Node 22-compatible path exists.
- CLI foundation remains TypeScript + commander. Do not introduce oclif/yargs/cac/clipanion for this Story.
- Storage model is local-first filesystem. Do not introduce database, web service, daemon, REST API, GraphQL, desktop UI, cache server or background process.
- `src/commands/install.ts` should orchestrate only. Source rules belong in `src/source/`; module parsing/selection belongs in `src/modules/`; public JSON projection belongs in `src/diagnostics/`.
- `assets/source/speclite/` is bundled source asset boundary. It is read by `src/source/` / `src/modules/`, but must not be treated as resolver code or runtime installed state.
- All public paths in output, issues, fixtures and command data must use project-relative POSIX-style paths or display-safe labels.

### Contract Requirements（契约要求）

- `CommandResult` public JSON shape is owned by `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md` and implemented through `src/diagnostics/command-result-schema.ts`.
- `SourceDescriptor` trust/evidence/write eligibility is owned by `_bmad-output/planning-artifacts/specs/02-source-descriptor-contract.md` and implemented through `src/source/source-descriptor-schema.ts`.
- Install planning, selected modules, external access, confirmation and write authorization are owned by `_bmad-output/planning-artifacts/specs/03-install-plan-contract.md` and implemented through `src/installer/install-plan-schema.ts`.
- Manifest/index installed projections and source-side module metadata truth are owned by `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md` and implemented through `src/manifest/manifest-schema.ts`.
- Issue categories and reserved issue ids are owned by `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md`; this Story may use `source-integrity` and existing categories but must not invent free-form issue ids.
- Fixture layout and comparison policy are owned by `_bmad-output/planning-artifacts/specs/08-fixture-contract.md`; command JSON fixtures must compare parsed semantics, not raw pretty-printed bytes.

### Suggested Implementation Files（建议实现文件）

Use actual files from Story 1.1/1.2 if they differ, but preserve these ownership boundaries:

```text
src/source/source-descriptor-schema.ts
src/source/source-discovery.ts
src/source/source-integrity.ts
src/modules/module-metadata.ts
src/modules/module-selection.ts
src/modules/official-modules.ts
src/installer/install-plan-schema.ts
src/installer/install-context.ts
src/installer/install-runner.ts
src/commands/install.ts
src/diagnostics/command-result-schema.ts
src/diagnostics/command-result.ts
src/diagnostics/output.ts
src/validation/issue-model.ts
```

Possible source asset changes if needed for AC #5:

```text
assets/source/speclite/core-skills/module.yaml
assets/source/speclite/sdlc-skills/module.yaml
```

Do not change source asset metadata casually. If module `version` is added, add parser tests and document the source of truth in code comments or schema names, not in renderer prose.

### Official Module Metadata Notes（官方模块元数据备注）

- `core-skills/module.yaml` currently has `code: core`, `name: "SpecLite Core Module"` and core config prompts.
- `sdlc-skills/module.yaml` currently has `code: sdlc`, `name: "SpecLite SDLC"`, `default_selected: true`, artifact directory declarations and agent roster metadata.
- `module-help.csv` files map skills to display names, menu codes, phase, output location and outputs. They should feed capability/help summary and later manifest/help indexes, but they are not alternate module identity sources.
- Default installable / mirrorable modules 必须具备 canonical self-contained skill packages；package 可按需包含 `SKILL.md`、`CHANGELOG.md`、optional `SKILL.en.md`、`customize.toml`、`config.toml.example`、`assets/`、`references/`、`data/` 和 `scripts/`。Module discovery 可以列出 metadata，但缺 canonical packages 必须阻断默认安装 / mirror，不得静默进入 installed state。
- 当前 source facts 显示 `sdlc-skills/` 已具备 40 个 nested `SKILL.md` canonical package entries。`sdlc` 可以作为 default selected module 的前提是 discovery、install planning、mirror planning 和 manifest/help indexes 正确识别这些 nested package roots；任何 selected/default module 若实际缺少 required canonical package，仍不得合成 placeholder mirror、不得静默进入 installed state，也不得进入 ReadyCheck evidence。

### Source Descriptor Guardrails（SourceDescriptor 防线）

- Bundled source must still pass through `SourceDescriptor`; do not special-case it as "safe because it is local".
- `integrityEvidence[].verified === false` means evidence is reproducible but not backed by a trust anchor; it is not a failed verification.
- `trustStatus: "blocked"` must stop write planning.
- `source-integrity` is about source resolver/install planning safety; installed file drift belongs to `file-integrity` or `ide-mirror`.
- `resolvedRoot` for bundled source must be display-safe. Avoid exposing local package path, npm cache, extraction directory, checkout absolute path, drive letter or home directory.

### Install Summary Guardrails（安装摘要防线）

- This Story's install summary is a pre-write scope summary. It may say what modules were selected and what scope will participate in later install stages.
- It must not claim any module is installed unless a later write stage actually wrote installed state.
- It must not show ready summary, ReadyCheck result, manifest version from generated manifest, IDE target configured count, created config paths or runtime paths as completed work.
- It may list pending later phases using `pendingSteps`, but step names must be command-defined stable lifecycle ids, not ad hoc prose.
- 在 pre-write fresh install JSON 中，`data.installedModules` 必须为 `[]`；在 CommandResult SPEC 增加显式字段前，selected 或 pending modules 属于 internal `InstallPlan.selectedModules`、`completedSteps` / `pendingSteps`、`issues`、`nextActions` 和 human-readable summary。

### Previous Story Intelligence（前序 Story 情报）

- Story 1.1 establishes scaffold, runtime/platform guard, `CommandResult` executable schema anchor, `SourceDescriptor` anchor, `InstallPlan` anchor, manifest anchor, adapter registry anchor and no-write guard failures.
- Story 1.1 explicitly deferred target directory resolution, module selection, config initialization, IDE mirror creation and ready summary.
- Story 1.2 extends Story 1.1 with target directory resolution, directory state inspection, existing install detection and confirmation-before-write gate.
- Story 1.2 explicitly defers source discovery, module selection, config initialization, IDE mirror creation and ready summary. Story 1.3 picks up only source/module selection and pre-write scope summary.
- Story 1.2 expects `speclite install` explicit target input to use commander optional argument `[target-directory]` unless an owning SPEC later adds a flag. Do not add `--project-root` to `install`.
- Story 1.2 states `completedSteps` / `pendingSteps` ordering must be command-defined and stable, not execution timing.
- Story 1.1/1.2 dependency guidance remains: keep architecture-pinned versions unless intentionally changed with explanation; do not silently drift dependency versions.

### Git Intelligence（Git 情报）

- Recent commits are documentation/context/spec oriented, not implementation scaffold:
  - `a0b08ef style(docs): 清理参考文档尾随空白`
  - `1ab545f docs(context): 初始化项目上下文文档`
  - `a4f8ab9 docs(source): 同步内置源资产路径说明`
  - `6e3d4e4 docs(glossary): 整理术语目录与文档索引`
  - `5b2c7a4 docs(specs): 收敛 MVP 契约与实现锚点`
- Treat live sharded docs and owning SPECs as current implementation truth. Do not use `_bmad-output/planning-artifacts/archive/` whole documents as contract sources.
- Worktree was already dirty when this Story was created; implementation agents must preserve unrelated user changes.

### Latest Technical Information（最新技术信息）

- No new third-party dependency is required by this Story. Use the existing project-pinned parser/tooling choices established by Architecture and Story 1.1.
- Use the existing YAML parser dependency selected by the project for `module.yaml`; do not introduce another YAML parser for module metadata.
- Use Node.js 22-compatible `node:fs/promises` and `node:path` APIs for local file reads and path normalization; do not introduce Node 24-only behavior.
- No external web research is required for this Story beyond the already documented Node/runtime and dependency choices, because the implementation surface is project-owned source metadata and local file contracts.

### Project Context Reference（项目上下文引用）

- `_bmad-output/project-context.md` currently contains initialized metadata and placeholder sections only; it does not add implementation rules beyond live PRD, Architecture, UX and owning SPEC artifacts.
- The project-level language rule remains: conversation and generated docs in Chinese, section headings in `English（中文）` form, technical identifiers in English.

### References（参考）

- [Source: `_bmad-output/planning-artifacts/epics/04-epic-1-project-installation-onboarding项目安装引导.md#Story 1.3`]
- [Source: `_bmad-output/planning-artifacts/epics/04-epic-1-project-installation-onboarding项目安装引导.md#Epic 1`]
- [Source: `_bmad-output/planning-artifacts/prd/05-user-journeys用户旅程.md#Journey 1`]
- [Source: `_bmad-output/planning-artifacts/prd/06-domain-specific-requirements领域特定需求.md#Technical Constraints`]
- [Source: `_bmad-output/planning-artifacts/prd/08-developer-tool-specific-requirements开发者工具特定需求.md#Installation Methods`]
- [Source: `_bmad-output/planning-artifacts/prd/10-functional-requirements功能需求.md#Installation & Project Onboarding`]
- [Source: `_bmad-output/planning-artifacts/prd/10-functional-requirements功能需求.md#Distribution Sources & Channels`]
- [Source: `_bmad-output/planning-artifacts/prd/11-non-functional-requirements非功能需求.md#Security & Safety`]
- [Source: `_bmad-output/planning-artifacts/prd/11-non-functional-requirements非功能需求.md#Compatibility & Portability`]
- [Source: `_bmad-output/planning-artifacts/prd/11-non-functional-requirements非功能需求.md#Integration Quality`]
- [Source: `_bmad-output/planning-artifacts/architecture/03-core-architectural-decisions核心架构决策.md#Data Architecture`]
- [Source: `_bmad-output/planning-artifacts/architecture/04-implementation-patterns-consistency-rules实现模式与一致性规则.md#Structure Patterns`]
- [Source: `_bmad-output/planning-artifacts/architecture/05-project-structure-boundaries项目结构与边界.md#Architectural Boundaries`]
- [Source: `_bmad-output/planning-artifacts/architecture/05-project-structure-boundaries项目结构与边界.md#Source Descriptor Trust Semantics`]
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Core User Experience`]
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Component Strategy`]
- [Source: `_bmad-output/planning-artifacts/specs/README.md#Reading Order`]
- [Source: `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md#Command Data Payloads`]
- [Source: `_bmad-output/planning-artifacts/specs/02-source-descriptor-contract.md#Bundled source`]
- [Source: `_bmad-output/planning-artifacts/specs/03-install-plan-contract.md#Install Plan`]
- [Source: `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md#Source Of Truth`]
- [Source: `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md#source-integrity`]
- [Source: `assets/source/speclite/core-skills/module.yaml`]
- [Source: `assets/source/speclite/sdlc-skills/module.yaml`]
- [Source: `assets/source/speclite/core-skills/module-help.csv`]
- [Source: `assets/source/speclite/sdlc-skills/module-help.csv`]
- [Source: `_bmad-output/implementation-artifacts/1-1-cli-install-entry-and-runtime-guard.md`]
- [Source: `_bmad-output/implementation-artifacts/1-2-project-target-directory-resolution-and-existing-install-detection.md`]

## Dev Agent Record（开发代理记录）

### Agent Model Used（使用模型）

GPT-5 Codex

### Debug Log References（调试日志引用）

- `python3 _bmad/scripts/resolve_customization.py --skill .agents/skills/bmad-dev-story --key workflow` 失败：默认 `python3` 缺 `tomllib`。
- `python3.12 _bmad/scripts/resolve_customization.py --skill .agents/skills/bmad-dev-story --key workflow` 成功。
- `npm test -- --run test/source-and-modules.test.ts test/install-module-selection.test.ts` 初次失败：`vitest: command not found`；执行 `npm ci` 安装既有依赖后继续。
- `npm run build` 通过。
- `npm test -- --run test/source-and-modules.test.ts test/install-module-selection.test.ts` 通过：2 files, 10 tests。
- `npm test` 通过：7 files, 33 tests。

### Completion Notes List（完成备注）

- Ultimate context engine analysis completed - comprehensive developer guide created.
- 已确认 Story 1.1/1.2 scaffold、runtime guard、target directory resolution、existing install detection 与 no-write gate 存在并保留。
- 新增 bundled source discovery，复用 `SourceDescriptor` schema，以 `package-lock.json` 作为可复现 `version-lock` evidence；缺失 evidence 时输出 `source-integrity.missing-evidence` 并停止后续阶段。
- 新增 official module metadata parser，读取 bundled `module.yaml`、`module-help.csv` 与 nested `SKILL.md` package roots，覆盖 duplicate/malformed/missing required field diagnostics。
- 为 `core` / `sdlc` module metadata 增加显式 `version`，并用 `required` / `required_dependencies` 表达 core 与 sdlc dependency semantics。
- 新增 deterministic module selection model，并将 `install --yes` 接入 pre-write install scope summary；JSON 仍复用既有 `CommandResult<InstallCommandData>` 字段，未新增 public automation fields。
- 已验证 pre-write fresh install 的 `installedModules` 保持为空，target confirmation pending、existing install、missing evidence 与 module selection summary 分支均不创建 `_speclite`、`_speclite-output`、`.claude/skills` 或 `.agents/skills`。

### File List（文件列表）

- `_bmad-output/implementation-artifacts/stories/1-3-official-module-selection-and-install-summary.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `assets/source/speclite/core-skills/module.yaml`
- `assets/source/speclite/sdlc-skills/module.yaml`
- `src/commands/install.ts`
- `src/diagnostics/command-result.ts`
- `src/source/source-discovery.ts`
- `src/modules/module-metadata.ts`
- `src/modules/module-selection.ts`
- `test/source-and-modules.test.ts`
- `test/install-module-selection.test.ts`

### Change Log（变更日志）

- 2026-05-26: 实现 Story 1.3 official bundled source discovery、module metadata parsing、module selection、pre-write install scope summary 和 focused regression tests；Story 状态推进至 review。
