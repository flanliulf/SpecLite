# Story 1.4: Project Config Initialization（项目配置初始化）

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story（故事）

作为项目维护者，  
我希望在安装过程中配置项目名称、用户称呼、交流语言、文档语言和产物输出目录，  
以便安装后的 SpecLite skills 能读取统一项目配置并按团队约定工作。

## Acceptance Criteria（验收标准）

1. **Config initialization starts only after target and module selection are confirmed.**  
   **前提** runtime/platform guard 已通过，目标目录已解析并确认，且 official module selection 已完成；  
   **当** `speclite install` 进入配置初始化阶段；  
   **则** 系统才可以收集 project config 输入并构造 config initialization plan；  
   **并且** 在 target confirmation、module selection、source integrity 或 existing-install 分支仍 pending / blocked 时，不得进入配置初始化；  
   **并且** 本 Story 不得创建或修改 `_speclite`、`_speclite-output`、`.claude/skills`、`.agents/skills`、manifest/index 或任何 IDE mirror 文件。

2. **Interactive install exposes quick and detailed configuration modes.**  
   **前提** 用户在交互式 `speclite install` 流程中进入配置初始化阶段；  
   **当** 系统询问配置方式；  
   **则** 用户可以选择 quick config 或 detailed config；  
   **并且** prompt 必须说明默认值、影响范围和本阶段尚未写入文件；  
   **并且** 不得新增未在 CommandResult flag matrix 中声明的 install flags，例如 `--config-mode`、`--project-name` 或 `--output-folder`，除非先更新 owning SPEC、parser/schema 和 fixtures。

3. **Quick config collects the minimum required project configuration.**  
   **前提** 用户选择 quick config；  
   **当** 系统收集最小配置输入；  
   **则** 系统必须确定 `user_name`、`project_name`、`communication_language`、`document_output_language` 和 `output_folder`；  
   **并且** 未显式提供的值必须来自可展示、可确认的 deterministic defaults，例如 target directory basename、source module metadata defaults 和 `_speclite-output`；  
   **并且** 所有 public path display 必须使用 project-relative POSIX-style path，不得泄露 absolute path、home directory、drive letter、cache path 或 temporary path。

4. **Detailed config extends the same model without reimplementing previous stages.**  
   **前提** 用户选择 detailed config；  
   **当** 系统收集项目级配置输入；  
   **则** 用户可以确认或调整 `user_name`、`project_name`、`communication_language`、`document_output_language`、`output_folder`、module-specific artifact paths、安装模块和 IDE targets；  
   **并且** 安装模块和 IDE targets 必须基于 Story 1.3 已产生的 selected module set 与 existing install context，只能更新 internal install planning state，不得重新实现 source discovery、module parser 或 adapter writer；  
   **并且** detailed config 可以收集 `user_skill_level`、`planning_artifacts`、`implementation_artifacts` 和 `project_knowledge` 等 source module metadata 已声明的字段；  
   **并且** 不得把 Story 1.5 的 runtime directory creation、IDE mirror creation 或 manifest/index generation 提前到本 Story。

5. **Config values are represented through the shared config schema and TOML contract.**  
   **前提** 配置值已收集完成；  
   **当** 系统构造 project config model；  
   **则** 实现必须复用 `src/config/` 的 config schema / writer / resolver anchors；  
   **并且** 不得在 `src/commands/install.ts`、prompt renderer、IDE adapter 或 skill helper 中手写第二套 config merge logic；  
   **并且** installer-owned config plan 至少覆盖 `_speclite/config.toml` 与 `_speclite/config.user.toml`；  
   **并且** resolver merge order 必须继续兼容 `_speclite/config.toml` -> `_speclite/config.user.toml` -> `_speclite/custom/config.toml` -> `_speclite/custom/config.user.toml`。

6. **Human-owned project-level custom stubs are create-if-absent only.**  
   **前提** config initialization plan 需要声明 human-owned TOML stubs；  
   **当** 系统检查 `_speclite/custom/config.toml` 与 `_speclite/custom/config.user.toml`；  
   **则** 只有当目标 path 不存在时，plan 才可以包含 create-if-absent action；  
   **并且** 如果任一目标已存在，install/update/repair 不得覆盖、重写、重排、格式化或 normalize 其内容、顺序或注释；  
   **并且** 本 Story 不得默认创建 `_speclite/custom/{skill}.toml` 或 `_speclite/custom/{skill}.user.toml`；  
   **并且** skill-specific human-owned files 只能由用户手工创建，或由未来显式 customization command 在 owning SPEC 更新后创建。

7. **Final configuration summary gates every config write.**  
   **前提** 配置值与 planned config paths 已确定；  
   **当** 系统准备进入写入阶段；  
   **则** 必须先展示 final configuration summary，至少包含 config mode、project name、user display name、communication/document languages、artifact root、selected modules、IDE targets、planned config paths 和 protected human-owned stubs；  
   **并且** 在用户明确确认最终配置摘要之前，不得写入任何 project file，也不得创建 operation lock、safe-write temporary file、runtime directory、artifact directory 或 IDE mirror directory；  
   **并且** `--yes` 只能表达 command-level write authorization，不得绕过 source trust、unsupported target、path escape、existing human-owned stub 或 ownership protection。

8. **`install --json` stays within the current CommandResult contract.**  
   **前提** 用户请求 `speclite install --json`；  
   **当** 配置初始化完成、等待确认或失败；  
   **则** 输出必须继续使用 `CommandResult<InstallCommandData>`，并通过 `completedSteps`、`pendingSteps`、`paths`、`issues` 和 `nextActions` 表达 automation-relevant state；  
   **并且** 不得新增未契约化的 `configInitializationStatus`、`configPaths`、`quickConfig`、`detailedConfig` 或 `readySummary` JSON blob；  
   **并且** pre-write fresh install 中 `installedModules` 只能为空，或在 existing-install branch 中反映已存在且已验证的 installed-state fact；不得用它表达 selected modules、pending module selection、config summary 或 planned config state；  
   **并且** 如果产品确实需要新增 machine-readable config path/status 字段，必须先更新 `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md`、`src/diagnostics/command-result-schema.ts` 和 fixture expected outputs。

9. **Privacy and sensitive information are protected in all outputs.**  
   **前提** 系统渲染 prompt、summary、issue、next action 或 JSON output；  
   **当** 输出涉及 path、source、environment 或 user-provided value；  
   **则** 不得泄露 home directory、absolute local path、environment variable value、credential、token、credential-bearing URL、npm cache path、temporary extraction path、stack trace、timestamp 或 random id；  
   **并且** user-provided display values 必须经过 trim 和 safety validation，空白值不得覆盖 deterministic defaults；  
   **并且** `ValidationIssue.details` 只允许 deterministic、redaction-safe、fixture-stable fields。

## Tasks / Subtasks（任务 / 子任务）

- [x] Task 1: 验证 Story 1.1-1.3 前置实现与 no-write 边界（AC: 1, 4, 7）
  - [x] 确认 Story 1.1 已提供 TypeScript/commander scaffold、runtime/platform guard、`CommandResult` anchor、`InstallPlan` anchor、manifest anchor、adapter registry anchor 和 fixture contract anchor。
  - [x] 确认 Story 1.2 已提供 target directory resolution、existing-install detection、path normalization 和 target confirmation gate。
  - [x] 确认 Story 1.3 已提供 bundled source discovery、module metadata parser、module selection model 和 pre-write install scope summary。
  - [x] 如果 `package.json`、`src/`、`test/` 或前序 Story 预期实现文件仍不存在，停止 Story 1.4 实现并先完成前序 Story；不得在本 Story 中重建前序 scaffold 或绕过前序 confirmation gates。
  - [x] 保留 Story 1.1-1.3 的 no-write guarantees：guard failure、target confirmation pending、existing-install blocker、source-integrity blocker、module selection pending 或 no-module failure 均不得产生 config writes。

- [x] Task 2: 建立 project config schema 与 config initialization model（AC: 3, 4, 5, 9）
  - [x] 在 `src/config/` 中新增或扩展 `config-schema.ts`、`config-writer.ts`、`config-reader.ts` 和 shared validation helpers；复用 Story 1.1 的 `src/config/resolve-output-schema.ts`。
  - [x] 定义 config model 的 canonical field names：`project_name`、`user_name`、`communication_language`、`document_output_language`、`output_folder`，以及 source module metadata 需要的 `user_skill_level`、`planning_artifacts`、`implementation_artifacts`、`project_knowledge`。
  - [x] 从 `assets/source/speclite/core-skills/module.yaml` 和 `assets/source/speclite/sdlc-skills/module.yaml` 读取 prompt defaults / config tables；不得把 `config.toml.example` 当作 runtime fallback source。
  - [x] 明确 installer-owned config split：project/module defaults 写入 `_speclite/config.toml`，install-time user-scoped values 写入 `_speclite/config.user.toml`；如实现选择不同 split，必须在 `src/config/config-schema.ts` 和 tests 中显式表达，不得隐式散落在 renderer 中。
  - [x] 对 string values 执行 trim；空字符串或纯空白回退到 deterministic defaults，不得写入空白覆盖值。

- [x] Task 3: 实现 quick / detailed config collection（AC: 2, 3, 4, 7）
  - [x] 在 `src/installer/` 中新增或扩展 config initialization step，例如 `src/installer/config-initialization.ts`；`src/commands/install.ts` 只负责 orchestration。
  - [x] Quick config 使用最小 prompt set：`user_name`、`project_name`、`communication_language`、`document_output_language`、`output_folder`。
  - [x] Detailed config 在 quick config 基础上允许确认或调整 `user_skill_level`、module artifact paths、selected modules 和 IDE targets；模块与 target 数据必须来自前序 install planning state。
  - [x] 交互 prompt 必须展示 default、resolved project-relative path、是否影响 installer-owned config 或 human-owned stub；不得依赖颜色或符号才能理解。
  - [x] Non-interactive / headless mode 若缺少必要输入且不能安全使用 deterministic defaults，必须返回 pending/no-write state；不得用隐式 prompt fallback 写入配置。

- [x] Task 4: 构造 config planned writes 与 human-owned stub plan（AC: 5, 6, 7）
  - [x] 将 `_speclite/config.toml` 和 `_speclite/config.user.toml` 作为 installer-owned planned writes 加入 internal `InstallPlan.plannedWrites`。
  - [x] 将 `_speclite/custom/config.toml` 与 `_speclite/custom/config.user.toml` 作为 human-owned create-if-absent planned writes；路径存在时 action 必须是 protected skip，不读取、重排或格式化内容。
  - [x] 不为每个 installed skill 生成 `_speclite/custom/{skill}.toml` 或 `_speclite/custom/{skill}.user.toml`。
  - [x] Planned write path 必须是 project-relative POSIX path；internal absolute path 只能存在于 private state。
  - [x] 如果 output/artifact root path 解析到 target project 外、symlink escape 或 path escape，返回 `artifact-path.escapes-project` 或 `artifact-path.symlink-escape` 类 issue，不进入写入阶段。

- [x] Task 5: 生成 final configuration summary 与 no-write confirmation gate（AC: 1, 7, 8, 9）
  - [x] Human-readable summary 使用 Evidence profile：Summary、Config、Paths、Protected stubs、Pending steps、Next actions。
  - [x] Summary 必须明确哪些动作尚未发生：runtime structure creation、artifact directory creation、IDE mirror creation、manifest/index generation、ReadyCheck 和 ready summary。
  - [x] 在 final configuration summary confirmed 之前，`writeAuthorized` 必须为 false，且不得创建 operation lock、safe-write temp file、`_speclite` directory、`_speclite-output` directory 或 IDE target directory。
  - [x] `completedSteps` / `pendingSteps` 使用 command-defined stable lifecycle order；如果加入 `config-initialization` step，必须同步 tests 和 fixture expected outputs。
  - [x] JSON output 只使用当前 `CommandResult<InstallCommandData>` 字段；pre-write config state 通过 `completedSteps`、`pendingSteps`、`issues`、`nextActions` 和 human-readable final configuration summary 表达，`installedModules` 不得承载 selected/config state；新增 public JSON 字段必须先更新 owning SPEC。

- [x] Task 6: 编写 focused tests 与 fixture assertions（AC: 1-9）
  - [x] Unit tests 覆盖 quick config defaults、detailed config collection、string trim、empty value fallback、language field preservation 和 artifact path normalization。
  - [x] Unit tests 覆盖 config TOML model/writer/parser round trip；不得把 example files 当 runtime fallback。
  - [x] Unit tests 覆盖 human-owned stubs create-if-absent：missing -> planned create，existing -> protected skip，existing content/order/comment untouched。
  - [x] Integration tests 覆盖 `speclite install` 在 module selection 后进入 config initialization，但在 final config confirmation 前不写入任何 project file。
  - [x] Integration tests 覆盖 `install --json` config initialization success/pending/failure 的 semantic JSON parse；不得 raw byte 比较当前时间、absolute path 或 terminal formatting。
  - [x] Regression tests 覆盖 Story 1.1-1.3 failure/pending branches，确保 Story 1.4 不提前执行 config prompts 或 planned writes。
  - [x] Fixture assertions 更新 `fresh-install-empty-project` 的 config step expected command JSON / file tree only after owning SPEC 与 executable schema 支持对应 fields；不得先更新 snapshots 再反推契约行为。

- [x] Task 7: 本地验证与范围控制（AC: 1-9）
  - [x] 运行 `npm run build`。
  - [x] 运行 `npm test`，或至少运行 Story 1.4 touched modules 的 focused Vitest tests。
  - [x] 如新增或改变 public JSON field、config TOML schema、step id 或 fixture comparison behavior，确认同一变更中更新 owning SPEC、executable schema/parser 和 fixture expected outputs。
  - [x] 检查 diff，确认没有实现 Story 1.5 runtime writes / IDE mirror creation / manifest generation，也没有实现 Story 1.6 progress full sequence、ReadyCheck 或 ready summary。
  - [x] 检查 diff，确认没有新增 Post-MVP `init` / `list` / `doctor` / `sync` / `uninstall` 命令，也没有格式化、重写或同步 planning artifacts。

## Dev Notes（开发备注）

### Current Repository State（当前仓库状态）

- 创建本 Story 时，仓库根目录仍没有 `package.json`、`package-lock.json`、`src/`、`test/`、`tests/` 或 root `fixtures/` 实现目录。Story 1.4 的开发必须在 Story 1.1、Story 1.2 和 Story 1.3 实际实现之后进行。
- `_bmad-output/implementation-artifacts/1-1-cli-install-entry-and-runtime-guard.md`、`1-2-project-target-directory-resolution-and-existing-install-detection.md` 和 `1-3-official-module-selection-and-install-summary.md` 当前是 ready-for-dev story context，不是完成后的代码证据。
- 当前 worktree 已存在与本 Story 创建无关的 dirty planning artifacts、`sprint-status.yaml` 改动和未跟踪 Story 1.1-1.3 文件。实现 Story 1.4 时不得格式化、重写、同步或回滚这些无关改动。
- `assets/source/speclite/` 已存在，并包含 config prompt metadata、skill packages、custom stub examples 和 legacy Python resolver scripts。本 Story 应读取 source module metadata，但不得把 legacy Python scripts 作为 MVP runtime implementation。

### Scope Boundary（范围边界）

- 本 Story 只负责 project config initialization：quick/detailed config collection、config model、TOML planned writes、human-owned project-level custom stub plan、final config summary 和 no-write confirmation gate。
- 本 Story 不负责：
  - Story 1.5 `_speclite` runtime directory creation、`_speclite-output` directory creation、IDE mirror creation、manifest/index generation、files index/hash projection 或 actual config file writes。
  - Story 1.6 install progress full sequence、ReadyCheck、ready summary 或 final installed-state summary。
  - Story 1.3 bundled source discovery、module metadata parser、module version semantics 或 source integrity evidence。
  - `speclite status`、`speclite validate`、`speclite update`、`update --repair` 的完整实现。
  - Post-MVP `init`、`list`、`doctor`、`sync`、`uninstall`、top-level `repair`、Copilot/Cursor branded target ids 或 command pointer artifacts。

### Architecture Requirements（架构要求）

- Runtime baseline remains Node.js 22 minimum and Node.js 24 recommended. Do not use Node 24-only APIs unless a Node 22-compatible path exists.
- CLI foundation remains TypeScript + commander. Do not introduce oclif/yargs/cac/clipanion for this Story.
- Storage model is local-first filesystem. Do not introduce database, web service, daemon, REST API, GraphQL, desktop UI, cache server or background process.
- `src/commands/install.ts` should orchestrate only. Config collection and planning belong in `src/installer/` and `src/config/`; path normalization belongs in `src/fs/`; public projection belongs in `src/diagnostics/`.
- `src/config/` is the only place for config/customization merge logic. Do not implement config merge behavior in IDE adapters, installed skills, prompt renderers or command modules.
- All public paths in output, issues, fixtures, planned writes and tests must use project-relative POSIX-style paths or display-safe labels.

### Config Model Notes（配置模型备注）

- Core source metadata currently declares:
  - `code: core`
  - `config_table: core`
  - prompts for `user_name`, `project_name`, `communication_language`, `document_output_language` and `output_folder`
  - default `output_folder: "_speclite-output"`
- SDLC source metadata currently declares:
  - `code: sdlc`
  - `default_selected: true`
  - `config_table: modules.sdlc`
  - prompts for `user_skill_level`, `planning_artifacts`, `implementation_artifacts` and `project_knowledge`
  - declarative directories under configured artifact/project knowledge roots
- `config.toml.example` files document expected fields only and explicitly say they must not be used as runtime fallback. Runtime config must be generated from the config schema / module metadata and parsed through `src/config/`.
- Suggested initial TOML shape, adjusted to final schema names if needed:

```toml
[core]
project_name = "SpecLite"
user_name = "SpecLite"
communication_language = "Chinese"
document_output_language = "Chinese"
output_folder = "_speclite-output"
user_skill_level = "intermediate"

[modules.sdlc]
planning_artifacts = "_speclite-output/planning-artifacts"
implementation_artifacts = "_speclite-output/implementation-artifacts"
project_knowledge = "docs"
```

- If implementation persists selected modules or IDE targets in config, the field names and ordering must be defined in `src/config/config-schema.ts` and tests. Manifest/index remains the installed projection truth after Story 1.5; config must not replace manifest/index.

### Contract Requirements（契约要求）

- `CommandResult` public JSON shape is owned by `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md` and implemented through `src/diagnostics/command-result-schema.ts`.
- Install planning, planned writes, confirmation and write authorization are owned by `_bmad-output/planning-artifacts/specs/03-install-plan-contract.md` and implemented through `src/installer/install-plan-schema.ts`.
- Config/customization resolver stdout/stderr, merge order, fallback and parity behavior are owned by `_bmad-output/planning-artifacts/specs/06-resolve-command-contract.md` and implemented through `src/config/resolve-output-schema.ts`.
- Manifest/index installed projections are owned by `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md`; Story 1.4 may prepare config values but must not generate manifest/index.
- Issue categories and reserved issue ids are owned by `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md`; this Story may use `artifact-path`, `operation-lock`, `environment` or existing categories as applicable, but must not invent free-form issue ids.
- Fixture layout and comparison policy are owned by `_bmad-output/planning-artifacts/specs/08-fixture-contract.md`; command JSON fixtures must compare parsed semantics, not raw pretty-printed bytes.

### Human-Owned TOML Stub Guardrails（人工维护 TOML Stub 防线）

- Fresh install may create only these human-owned project-level stubs when absent:
  - `_speclite/custom/config.toml`
  - `_speclite/custom/config.user.toml`
- Existing human-owned TOML files are protected even if empty, malformed, partially matching expected stub text, or containing obsolete comments. Do not overwrite or normalize them.
- Skill-specific customization files are out of scope:
  - `_speclite/custom/{skill}.toml`
  - `_speclite/custom/{skill}.user.toml`
- The installer may list protected existing stubs in the summary, but it must not read sensitive content into public output. At most report path, ownership, and action.

### No-Write Requirements（无写入要求）

- Before final configuration summary confirmation, the command must not create:
  - target directory itself
  - `_speclite`
  - `_speclite/config.toml`
  - `_speclite/config.user.toml`
  - `_speclite/custom/config.toml`
  - `_speclite/custom/config.user.toml`
  - `_speclite-output`
  - `.claude/skills`
  - `.agents/skills`
  - operation lock files
  - safe-write temporary files
  - manifest/index files
- No-write tests must assert absence after every early-exit branch, including config prompt cancellation, invalid artifact path, missing required previous stage state, headless missing input and existing human-owned stub protection.

### UX / Output Requirements（UX 与输出要求）

- Human-readable output should be sober, specific and actionable.
- Final config summary should answer:
  - which config mode was used
  - which project/user/language/artifact defaults were selected
  - which config paths are planned
  - which human-owned stubs are protected or create-if-absent
  - which later install stages remain pending
  - what the next action is
- Do not display ready summary in Story 1.4. Ready summary belongs to Story 1.6 after runtime writes, IDE mirrors, manifest/index and ReadyCheck pass.
- Do not make human-readable summary the only automation surface. Automation-stable data must be in `CommandResult.data`, `issues`, `nextActions`, manifest/index files or fixture outputs after the owning SPEC allows it.
- `--json` output must contain no ANSI escape, no local absolute path, no timestamp, no credential and no random ordering.

### Testing Requirements（测试要求）

- Use Vitest.
- Tests must be deterministic, local-only and must not access npm registry, Git remote, private registry, offline bundle origin or external network.
- Use temporary directories for command integration tests and assert no unexpected paths were created.
- Use pure path helpers and `node:path` `posix` / `win32` test data for path portability; do not rely on the host OS filesystem behavior for every case.
- JSON tests parse output and assert semantic fields. Do not compare raw pretty-printed JSON bytes unless formatting itself is the subject of the test.
- Fixture snapshots must normalize or exclude non-stable fields declared by owning SPECs. This Story should not introduce timestamps.

### Previous Story Intelligence（前序 Story 情报）

- Story 1.1 establishes scaffold, runtime/platform guard, `CommandResult` executable schema anchor, `SourceDescriptor` anchor, `InstallPlan` anchor, manifest anchor, adapter registry anchor and no-write guard failures.
- Story 1.1 explicitly deferred target directory resolution, module selection, config initialization, IDE mirror creation and ready summary.
- Story 1.2 extends Story 1.1 with target directory resolution, directory state inspection, existing install detection and confirmation-before-write gate.
- Story 1.2 explicitly defers source discovery, module selection, config initialization, IDE mirror creation and ready summary; it also requires explicit target input to use commander optional argument `[target-directory]` unless an owning SPEC adds a flag.
- Story 1.3 extends the flow with bundled source discovery, official module metadata parsing, deterministic module selection and pre-write install scope summary.
- Story 1.3 explicitly defers project config initialization, `_speclite/config.toml`, human-owned TOML stubs, runtime writes, IDE mirror creation, manifest/index generation and ready summary.
- Story 1.3 warns that install summary is pre-write scope summary only; Story 1.4's final configuration summary has the same pre-write constraint and must not claim any runtime/config files have been written.
- CommandResult SPEC currently has no public `selectedModules`, `pendingModuleSelection` or config status/path fields. Story 1.4 must not add temporary JSON fields or overload `installedModules`; future config fields require SPEC/schema/fixture updates first.

### Git Intelligence（Git 情报）

- Recent commits are documentation/context/spec oriented, not implementation scaffold:
  - `a0b08ef style(docs): 清理参考文档尾随空白`
  - `1ab545f docs(context): 初始化项目上下文文档`
  - `a4f8ab9 docs(source): 同步内置源资产路径说明`
- Treat live sharded docs and owning SPECs as current implementation truth. Do not use `_bmad-output/planning-artifacts/archive/` whole documents as contract sources.
- Worktree was already dirty when this Story was created; implementation agents must preserve unrelated user changes.

### Latest Technical Information（最新技术信息）

- No new third-party dependency is required for this Story. Use project-pinned libraries from Architecture and Story 1.1: `commander@14.0.3`, `toml@4.1.1`, `yaml@2.9.0`, `zod@4.4.3`, `typescript@6.0.3`, `tsx@4.21.0`, `tsup@8.5.1`, `vitest@4.1.6` and `@types/node@22`.
- Use Node.js 22-compatible `node:fs/promises`, `node:path` and, if needed, `node:readline/promises` for local CLI prompts. Do not introduce Node 24-only behavior.
- If a richer prompt library seems useful, stop and justify it against the existing dependency policy before adding it. Do not add `inquirer`, `prompts`, `enquirer` or another prompt framework silently.
- No external web research is required for this Story beyond the already documented Node/runtime and dependency choices, because the implementation surface is project-owned config metadata and local file contracts.

### Project Context Reference（项目上下文引用）

- `_bmad-output/project-context.md` currently contains initialized metadata and placeholder sections only; it does not add implementation rules beyond live PRD, Architecture, UX and owning SPEC artifacts.
- The project-level language rule remains: conversation and generated docs in Chinese, section headings in `English（中文）` form, technical identifiers in English.

### References（参考）

- [Source: `_bmad-output/planning-artifacts/epics/04-epic-1-project-installation-onboarding项目安装引导.md#Story 1.4`]
- [Source: `_bmad-output/planning-artifacts/epics/04-epic-1-project-installation-onboarding项目安装引导.md#Epic 1`]
- [Source: `_bmad-output/planning-artifacts/prd/05-user-journeys用户旅程.md#Journey 1`]
- [Source: `_bmad-output/planning-artifacts/prd/08-developer-tool-specific-requirements开发者工具特定需求.md#Technical Architecture Considerations`]
- [Source: `_bmad-output/planning-artifacts/prd/08-developer-tool-specific-requirements开发者工具特定需求.md#API Surface`]
- [Source: `_bmad-output/planning-artifacts/prd/10-functional-requirements功能需求.md#Configuration & Customization`]
- [Source: `_bmad-output/planning-artifacts/prd/11-non-functional-requirements非功能需求.md#Security & Safety`]
- [Source: `_bmad-output/planning-artifacts/prd/11-non-functional-requirements非功能需求.md#Compatibility & Portability`]
- [Source: `_bmad-output/planning-artifacts/prd/11-non-functional-requirements非功能需求.md#Diagnostics & Observability`]
- [Source: `_bmad-output/planning-artifacts/architecture/02-starter-template-evaluationstarter-模板评估.md#Selected Starter`]
- [Source: `_bmad-output/planning-artifacts/architecture/03-core-architectural-decisions核心架构决策.md#Data Architecture`]
- [Source: `_bmad-output/planning-artifacts/architecture/03-core-architectural-decisions核心架构决策.md#Authentication & Security`]
- [Source: `_bmad-output/planning-artifacts/architecture/03-core-architectural-decisions核心架构决策.md#API & Communication Patterns`]
- [Source: `_bmad-output/planning-artifacts/architecture/04-implementation-patterns-consistency-rules实现模式与一致性规则.md#Structure Patterns`]
- [Source: `_bmad-output/planning-artifacts/architecture/04-implementation-patterns-consistency-rules实现模式与一致性规则.md#Format Patterns`]
- [Source: `_bmad-output/planning-artifacts/architecture/05-project-structure-boundaries项目结构与边界.md#Architectural Boundaries`]
- [Source: `_bmad-output/planning-artifacts/architecture/05-project-structure-boundaries项目结构与边界.md#File Organization Patterns`]
- [Source: `_bmad-output/planning-artifacts/architecture/06-architecture-validation-results架构验证结果.md#Implementation Handoff`]
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Core User Experience`]
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Form Patterns`]
- [Source: `_bmad-output/planning-artifacts/specs/README.md#Reading Order`]
- [Source: `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md#Command Data Payloads`]
- [Source: `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md#Path Policy`]
- [Source: `_bmad-output/planning-artifacts/specs/03-install-plan-contract.md#Install Plan`]
- [Source: `_bmad-output/planning-artifacts/specs/03-install-plan-contract.md#Authorization Semantics`]
- [Source: `_bmad-output/planning-artifacts/specs/03-install-plan-contract.md#Human-Owned TOML Stubs`]
- [Source: `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md#Source Of Truth`]
- [Source: `_bmad-output/planning-artifacts/specs/05-ide-adapter-registry-contract.md#MVP Targets`]
- [Source: `_bmad-output/planning-artifacts/specs/06-resolve-command-contract.md#Config Merge`]
- [Source: `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md#Issue Id Policy`]
- [Source: `_bmad-output/planning-artifacts/specs/08-fixture-contract.md#Ready Summary Gate`]
- [Source: `assets/source/speclite/core-skills/module.yaml`]
- [Source: `assets/source/speclite/sdlc-skills/module.yaml`]
- [Source: `assets/source/speclite/core-skills/speclite-help/config.toml.example`]
- [Source: `_bmad-output/implementation-artifacts/1-1-cli-install-entry-and-runtime-guard.md`]
- [Source: `_bmad-output/implementation-artifacts/1-2-project-target-directory-resolution-and-existing-install-detection.md`]
- [Source: `_bmad-output/implementation-artifacts/1-3-official-module-selection-and-install-summary.md`]

## Dev Agent Record（开发代理记录）

### Agent Model Used（使用模型）

GPT-5 Codex

### Debug Log References（调试日志引用）

- `python3 _bmad/scripts/resolve_customization.py --skill .agents/skills/bmad-dev-story --key workflow` failed because default `python3` lacks `tomllib`; reran successfully with `python3.12`.
- `npx vitest run test/config-initialization.test.ts` first failed because Story 1.4 config modules did not exist, then passed after implementation.
- `npm test` passed: 8 test files, 44 tests.
- `npm run build` passed: tsup ESM and DTS build succeeded.

### Completion Notes List（完成备注）

- Ultimate context engine analysis completed - comprehensive developer guide created.
- Verified Story 1.1-1.3 anchors in live source before implementing Story 1.4.
- Added shared project config schema, TOML reader/writer, module metadata config prompt extraction, and config initialization planning.
- Integrated config initialization after module selection while keeping `writeAuthorized: false` before final config summary confirmation.
- Added installer-owned planned writes for `_speclite/config.toml` and `_speclite/config.user.toml`.
- Added human-owned project-level stub planning for `_speclite/custom/config.toml` and `_speclite/custom/config.user.toml`, with existing stubs protected by skip actions without content rewrites.
- Preserved current `CommandResult<InstallCommandData>` shape: config state is expressed via lifecycle steps, summary, issues, next actions, and internal `InstallPlan`.
- Confirmed no Story 1.5 runtime directory writes, IDE mirror creation, manifest/index generation, ReadyCheck, ready summary, or Post-MVP commands were implemented.

### File List（文件列表）

- `src/bin/speclite.ts`
- `src/commands/install.ts`
- `src/config/config-reader.ts`
- `src/config/config-schema.ts`
- `src/config/config-writer.ts`
- `src/installer/config-initialization.ts`
- `src/installer/install-plan-schema.ts`
- `src/modules/module-metadata.ts`
- `test/cli-smoke.test.ts`
- `test/config-initialization.test.ts`
- `test/install-module-selection.test.ts`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/implementation-artifacts/stories/1-4-project-config-initialization.md`

### Change Log（变更日志）

- 2026-05-26: Implemented Story 1.4 project config initialization and moved story to review.
