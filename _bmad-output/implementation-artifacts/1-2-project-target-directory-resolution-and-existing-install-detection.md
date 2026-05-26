# Story 1.2: Project Target Directory Resolution And Existing Install Detection（项目目标目录解析与既有安装检测）

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story（故事）

作为项目维护者，  
我希望 `speclite install` 能解析我要安装到的项目目录，并在写入前识别目录状态，  
以便确认 SpecLite 会安装到正确位置，且不会误覆盖已有安装或非空项目内容。

## Acceptance Criteria（验收标准）

1. **Default target directory uses current working directory.**  
   **前提** 用户启动 `speclite install` 且未显式指定安装目录；  
   **当** 命令进入目标目录解析阶段；  
   **则** 系统会使用当前工作目录作为默认目标项目目录；  
   **并且** public JSON 中的 target project path fields 必须使用 project-relative POSIX-style path，`data.paths.projectRoot` 必须为 `"."`；  
   **并且** human-readable output 可以展示用户选择的目录摘要，但 fixture-stable output 不得包含 absolute path、home directory、drive letter 或 OS-specific separator。

2. **Explicit target directory is normalized before status inspection.**  
   **前提** 用户通过参数或交互输入指定安装目录；  
   **当** 系统解析该目录；  
   **则** 系统会先规范化最终安装路径，再进入目录状态检查；  
   **并且** 目标路径摘要必须以 display-safe 方式展示给用户确认；  
   **并且** 如果 Story 1.1 的 command parser 尚未定义 explicit install target 输入，本 Story 应使用 commander optional argument `[target-directory]`，不得给 `speclite install` 新增未在 CommandResult flag matrix 中声明的 `--project-root` flag。

3. **Missing target directory is reported without creating it.**  
   **前提** 解析后的安装目录不存在；  
   **当** 系统检查目录状态；  
   **则** 系统会报告目录将被创建；  
   **并且** 在用户确认前不创建该目录，不创建 `_speclite`、`_speclite-output`、`.claude/skills` 或 `.agents/skills`。

4. **Existing target directory without SpecLite state is classified.**  
   **前提** 解析后的安装目录已存在但没有 SpecLite 安装状态；  
   **当** 系统检查目录内容；  
   **则** 系统会区分 empty directory 与 non-empty directory；  
   **并且** 向用户展示继续安装可能影响的项目根目录；  
   **并且** 该检查不得把普通项目内容误判为已安装 SpecLite runtime。

5. **Existing SpecLite install is detected before any write.**  
   **前提** 解析后的安装目录已有 SpecLite 安装内容；  
   **当** 系统检测到 `_speclite` 或 manifest/index 等安装状态；  
   **则** 系统会报告 existing-install 状态；  
   **并且** 列出检测到的 runtime、manifest version、IDE targets 和建议下一步；  
   **并且** 如果 manifest/index 不可读或 schema version 不受支持，必须使用现有 `manifest-schema` issue model 报告，不得用自由文本 issue id 或 raw parser error。

6. **Target confirmation gates all later install stages.**  
   **前提** 用户尚未确认目标目录；  
   **当** 目标目录解析与状态检查完成；  
   **则** 系统不会创建或修改 `_speclite`、`_speclite-output`、`.claude/skills` 或 `.agents/skills` 文件；  
   **并且** 后续 source discovery、module selection、config initialization、IDE mirror creation、manifest generation 和 ready summary 阶段必须等待明确确认后才能继续；  
   **并且** confirmation pending、显式 dry-run 或脚本模式缺少 `--yes` 时，不得把真实 planned actions 改写为 path-level `skip:not-authorized`。

## Tasks / Subtasks（任务 / 子任务）

- [ ] Task 1: 验证 Story 1.1 前置 scaffold 与契约锚点（AC: 1-6）
  - [ ] 确认 Story 1.1 已经完成实现并提供 `package.json`、`src/bin/speclite.ts`、`src/commands/install.ts`、`src/installer/install-context.ts`、`src/installer/install-plan-schema.ts`、`src/diagnostics/command-result-schema.ts`、`src/diagnostics/command-result.ts`、`src/diagnostics/output.ts`、`src/validation/issue-model.ts`、`src/manifest/manifest-schema.ts`、`src/fixtures/fixture-contract.ts` 和基础 Vitest 配置。
  - [ ] 如果这些文件不存在，停止 Story 1.2 实现并先完成 Story 1.1；不得在本 Story 中重建第二套 scaffold 或绕过 Story 1.1 的 diagnostics/runtime guard。
  - [ ] 复用 Story 1.1 的 `CommandResult`、`ValidationIssue`、runtime/platform guard、install command skeleton 和 fixture contract anchors；不得 hand-roll 第二套 output shape。

- [ ] Task 2: 实现 target directory input 与路径规范化（AC: 1, 2）
  - [ ] 在 `src/commands/install.ts` 接入 target directory input：优先复用 Story 1.1 已定义的 parser；若尚无 explicit target 输入，使用 commander optional argument `[target-directory]`。
  - [ ] 不给 `speclite install` 新增 `--project-root` flag；该 flag 在当前 owning SPEC 中属于 `speclite resolve config` / `speclite resolve customization`。
  - [ ] 在 `src/fs/path-normalizer.ts` 或同等 `src/fs/` module 中实现 target root normalization helper：未指定时以 `process.cwd()` 为目标，显式相对路径相对当前 cwd 解析，public report path 输出转换为 project-relative POSIX path。
  - [ ] 确保 path helper 支持 macOS 与 Windows path semantics；测试中可使用 `node:path` 的 `posix` / `win32` helpers 模拟分隔符与 drive-letter 输入，但 public fixture output 不得泄露 drive letter。
  - [ ] 所有 public JSON path fields 通过同一 normalization function 生成；命令、installer、manifest、validation 不得各自拼接 report path。

- [ ] Task 3: 实现 directory state inspector（AC: 3, 4, 5）
  - [ ] 新增或扩展 `src/installer/target-directory.ts`（或现有 `src/installer/install-context.ts` 中的 Story-scoped helper），输出 stable internal state：`missing`、`empty`、`non-empty`、`existing-install`。
  - [ ] 对 missing target 只报告将创建，不调用 `mkdir`，不创建任何 runtime、artifact 或 IDE mirror directory。
  - [ ] 对 existing target 使用 deterministic directory listing 判断 empty / non-empty；过滤 `.` / `..` 语义，不依赖 filesystem traversal order。
  - [ ] 检测 SpecLite installed-state 时至少检查 `_speclite/`、`_speclite/_config/manifest.yaml`、`_speclite/_config/skill-index.json`、`_speclite/_config/help-index.json`、`_speclite/_config/files-index.json` 和 `_speclite/_config/phase-coverage.json`。
  - [ ] `_speclite/` 存在但 manifest/index 缺失时仍视为 possible existing install，不继续 fresh write；报告 detected runtime present 与 manifest unavailable，而不是静默覆盖。
  - [ ] 使用 `lstat` / `realpath` 或等价 Node 22-compatible API 区分普通目录、文件和 symlink；不得跟随 symlink 产生 path escape 写入风险。

- [ ] Task 4: 读取 existing install summary，复用 manifest schema（AC: 5）
  - [ ] 若 `_speclite/_config/manifest.yaml` 存在，使用 `src/manifest/manifest-schema.ts` 的 parser/schema 读取 manifest schemaVersion / manifestVersion 投影；不得在 installer 中复制 manifest YAML 字段真源。
  - [ ] 按 canonical target order `claude`、`agents` 检测 `.claude/skills` 和 `.agents/skills` target visibility；如果 manifest/index 可读，优先从 manifest/index 投影获取 target 信息。
  - [ ] 对 unreadable 或 malformed manifest/index 产生 `manifest-schema` issue，例如 `manifest-schema.missing-version`、`manifest-schema.unsupported-version`、`manifest-schema.malformed-field` 或 `manifest-schema.schema-corruption`；details 不得包含 absolute path、timestamp、stack trace 或 environment-specific text。
  - [ ] next actions 使用 stable short templates，例如建议运行 `speclite status` / `speclite validate` 或先确认是否要处理 existing install；不要把 future Post-MVP `doctor`、`sync`、`uninstall` 当作 MVP 可用路径。

- [ ] Task 5: 将 target state 接入 install orchestration 与 confirmation gate（AC: 1-6）
  - [ ] 扩展 install command context，使 runtime/platform guard 通过后进入 `target-directory-resolution` 和 `directory-state-check`，再进入后续 install stages。
  - [ ] 在用户未确认目标目录时设置 command-level `requiresConfirmation: true`、`writeAuthorized: false` 或等价 internal state；不得产生任何 filesystem mutation。
  - [ ] `--yes` 只能表达 command-level write authorization；它不得自动接受 unverified source、floating Git source、unsupported source、failed evidence 或 source policy rejection。
  - [ ] existing-install 状态必须阻止 fresh install 覆盖已有 installed state；如果后续要进入 update/repair，应由未来对应命令或明确故事处理，不在本 Story 中实现。
  - [ ] 保持 `InstallPlan` ordering：target resolution / directory inspection 先于 source discovery、module selection、target adapter planning 和 planned writes。

- [ ] Task 6: 实现 human-readable 与 `--json` output 的 no-write evidence（AC: 1-6）
  - [ ] Human-readable output 使用克制、具体、可操作的 target summary：target root、directory state、detected SpecLite state、next action；不得依赖颜色、符号或 spinner 才能理解。
  - [ ] `install --json` 继续输出 `CommandResult<InstallCommandData>`，不得添加未在 `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md` 声明的 required public fields。
  - [ ] 对 public path fields 使用 `data.paths.projectRoot: "."`，并按需要填充 `specliteRoot: "_speclite"`、`artifactRoot: "_speclite-output"`、`manifestPath: "_speclite/_config/manifest.yaml"`。
  - [ ] 若需要暴露 target directory state 的新 machine-readable field，先停止并更新 owning SPEC；不得只在 schema module 或 fixture snapshot 中发明字段。
  - [ ] `completedSteps` / `pendingSteps` 使用 command-defined stable lifecycle order；如果加入 `target-directory-resolution` 或 `directory-state-check`，同步测试其排序，不依赖 execution timing。

- [ ] Task 7: 编写 focused tests 与 fixture assertions（AC: 1-6）
  - [ ] Unit tests 覆盖默认 cwd、显式相对路径、显式绝对路径、Windows-style input normalization、project-relative POSIX output 和 path escape guard。
  - [ ] Unit tests 覆盖 missing / empty / non-empty / existing-install / malformed-manifest directory states。
  - [ ] Integration tests 覆盖 `speclite install` 默认 target no-write 行为：命令完成目标解析后不创建 `_speclite`、`_speclite-output`、`.claude/skills` 或 `.agents/skills`。
  - [ ] Integration tests 覆盖 explicit `[target-directory]` no-write 行为和 deterministic output。
  - [ ] Integration tests 覆盖 existing install detection：可读 manifest 输出 runtime、manifest version、IDE targets 和 next actions；malformed manifest 复用 `manifest-schema` issue。
  - [ ] `install --json` tests 解析 JSON 语义，不做 raw text snapshot；断言无 absolute path、home directory、OS-specific separator、timestamp、stack trace 或 random id。
  - [ ] 不把 `existing-install-update` release gate 宣称为完成；本 Story 只覆盖 target directory resolution 与 existing install detection 的 Story-scoped sub-cases。

- [ ] Task 8: 本地验证与范围控制（AC: 1-6）
  - [ ] 运行 `npm run build`。
  - [ ] 运行 `npm test`，或至少运行 Story 1.2 touched modules 的 focused Vitest tests。
  - [ ] 检查 diff，确保未修改 `_bmad-output/planning-artifacts/`、未实现 Story 1.3+ module selection / config initialization / IDE mirror creation / ready summary、未添加 Post-MVP commands。
  - [ ] 确认 no-write tests 在 failure、pending confirmation 和 existing-install 分支均断言目标项目未发生 mutation。

## Dev Notes（开发备注）

### Current Repository State（当前仓库状态）

- 创建本 Story 时，工作区根目录尚无 `package.json`、`src/`、`test/`、`tests/` 或 root `fixtures/` 实现目录。Story 1.2 是 Story 1.1 之后的实现故事，不能在 Story 1.1 未完成时独立重建 scaffold。
- `_bmad-output/implementation-artifacts/1-1-cli-install-entry-and-runtime-guard.md` 当前提供的是 Story 1.1 的 ready-for-dev context；它本身不是完成后的代码证据。
- 当前 worktree 中已有 planning artifacts 和 Story 1.1 相关未提交改动。实现 Story 1.2 时不要格式化、重写或同步 `_bmad-output/planning-artifacts/`，也不要修改其他 story 文件。
- `assets/source/speclite/` 是 bundled source assets；本 Story 不做 source discovery，不读取或复制 source skill package。

### Scope Boundary（范围边界）

- 本 Story 只负责 `speclite install` 的 target directory resolution、directory state inspection、existing install detection 和 confirmation-before-write gate。
- 本 Story 不负责：
  - Story 1.3 official module selection、source discovery 或 install summary。
  - Story 1.4 config initialization。
  - Story 1.5 `_speclite` runtime writes、`_speclite-output` creation、IDE mirror creation、manifest/index generation。
  - Story 1.6 progress events full sequence、ReadyCheck 或 ready summary。
  - `speclite status`、`speclite validate`、`speclite update`、`update --repair` 的完整实现。
  - Post-MVP `init`、`list`、`doctor`、`sync`、`uninstall`、top-level `repair`、Copilot/Cursor branded target ids 或 command pointer artifacts。

### Architecture Requirements（架构要求）

- Runtime baseline remains Node.js 22 minimum, Node.js 24 recommended. Do not use Node 24-only APIs unless a Node 22-compatible path exists.
- CLI foundation remains TypeScript + commander. Do not introduce oclif/yargs/cac/clipanion for this Story.
- Storage model is local-first filesystem. Do not introduce database, web service, daemon, REST API, GraphQL, desktop UI, cache server, or long-lived background process.
- All public paths in command output, issues, fixtures, manifest/index projections and tests must be project-relative POSIX-style paths unless an owning SPEC explicitly marks a field non-stable/redacted.
- `src/commands/install.ts` should orchestrate only; target directory rules belong in `src/installer/` and path normalization belongs in `src/fs/`.
- `src/fs/` is the only place for path normalization, target-boundary checks and cross-platform path conversion. Avoid ad hoc `path.join(...).replace(...)` in command/report modules.
- Existing install detection reads installed state but does not repair, update, migrate or overwrite it.

### Contract Requirements（契约要求）

- `CommandResult` public JSON shape is owned by `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md` and implemented through `src/diagnostics/command-result-schema.ts`.
- `InstallPlan` write authorization, confirmation and planned writes semantics are owned by `_bmad-output/planning-artifacts/specs/03-install-plan-contract.md` and implemented through `src/installer/install-plan-schema.ts`.
- Manifest/index fields and schema versions are owned by `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md` and implemented through `src/manifest/manifest-schema.ts`.
- Issue category and issue id semantics are owned by `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md`; this Story may reuse `manifest-schema` and `operation-lock` semantics but must not invent `existing-install.*` issue ids unless the taxonomy SPEC is updated first.
- Fixture layout and comparison rules are owned by `_bmad-output/planning-artifacts/specs/08-fixture-contract.md`; expected command JSON must be compared semantically after parsing.
- `speclite install` MVP flags currently listed by the CommandResult contract are `--json` and `--yes`. Use optional argument `[target-directory]` for explicit target input unless a later owning SPEC explicitly adds a flag.

### Target Directory State Model（目标目录状态模型）

Recommended internal type, adjusted to existing Story 1.1 patterns if names differ:

```ts
type TargetDirectoryState =
  | {
      kind: "missing";
      targetRoot: string;
      displayPath: string;
    }
  | {
      kind: "empty";
      targetRoot: string;
      displayPath: string;
    }
  | {
      kind: "non-empty";
      targetRoot: string;
      displayPath: string;
      entryCount: number;
    }
  | {
      kind: "existing-install";
      targetRoot: string;
      displayPath: string;
      detectedRuntime: boolean;
      manifestVersion?: string;
      ideTargets: Array<{
        id: "claude" | "agents";
        status: "not-configured" | "configured" | "partial" | "failed";
        targetPath: string;
      }>;
    };
```

- `targetRoot` is private/internal and may be absolute in memory.
- `displayPath`, `targetPath`, `affectedPath` and all public path fields must be project-relative POSIX or redacted/display-safe.
- `entryCount` is allowed only as internal or human-readable context; do not add it to public JSON without updating the owning SPEC.

### Existing Install Detection Rules（既有安装检测规则）

- Detect possible existing install if any of these exist under target root:
  - `_speclite/`
  - `_speclite/_config/manifest.yaml`
  - `_speclite/_config/skill-index.json`
  - `_speclite/_config/help-index.json`
  - `_speclite/_config/files-index.json`
  - `_speclite/_config/phase-coverage.json`
- Detect IDE target visibility in canonical order:
  - `claude` -> `.claude/skills`
  - `agents` -> `.agents/skills`
- A target with `_speclite/` but no readable manifest is still existing installed state from the fresh-install safety perspective. It must not be overwritten by fresh install.
- Do not infer official modules, source descriptor, config values or ready status in this Story unless the manifest/index parser already exposes them.
- Do not treat `.claude/skills` or `.agents/skills` alone as a complete SpecLite install unless `_speclite` or manifest/index evidence also exists. They can be reported as possible IDE residue for human review, but fresh install overwrite rules remain governed by confirmation and later ownership checks.

### No-Write Requirements（无写入要求）

- Before target confirmation, the command must not create:
  - target directory itself
  - `_speclite`
  - `_speclite-output`
  - `.claude/skills`
  - `.agents/skills`
  - operation lock files
  - safe-write temporary files
  - manifest/index files
- If implementation needs operation lock before target directory exists, stop and revisit design; current Story requires no project writes before target confirmation.
- No-write tests must assert absence after every early-exit branch, including unsupported target directory, missing target, non-empty target, existing install and malformed manifest.

### UX / Output Requirements（UX 与输出要求）

- Output tone should be sober, specific and actionable.
- Human-readable target summary should answer:
  - what target was resolved
  - whether it is missing / empty / non-empty / existing-install
  - what will happen only after confirmation
  - what the next action is
- Do not make success text the only automation surface. Automation-stable data must be in `CommandResult.data`, `issues`, `nextActions`, manifest/index files or fixture outputs.
- Human-readable output may be richer than JSON, but it must observe the same redaction/display-safe rules for credentials, cache paths, temporary paths, home directories and local absolute source paths.
- Do not display ready summary in Story 1.2. Ready summary belongs to Story 1.6 after all required install stages and ReadyCheck pass.

### Testing Requirements（测试要求）

- Use Vitest.
- Tests must be deterministic, local-only and not access npm registry, Git remote, private registry, offline bundle origin or external network.
- Use temporary directories for command integration tests and assert no unexpected paths were created.
- Use dependency injection or controlled temp fixtures for malformed manifest and symlink/path cases.
- JSON tests parse the output and assert semantic fields. Do not compare raw pretty-printed JSON bytes unless formatting itself is the subject of the test.
- Fixture snapshots must normalize or exclude non-stable fields declared by owning SPECs; this Story should not introduce timestamps.
- Path portability tests should include Windows-style inputs even when run on macOS by using pure normalization helpers and `path.win32` test data.

### Previous Story Intelligence（前序 Story 情报）

- Story 1.1 establishes the CLI scaffold, runtime/platform guard, `CommandResult` executable schema anchor, initial install command skeleton and no-write guard failures.
- Story 1.2 must extend Story 1.1's install command skeleton; it must not replace commander setup, diagnostics projection, runtime guard, schema anchors or fixture contract helpers.
- Story 1.1 explicitly deferred target directory resolution, module selection, config initialization, IDE mirror creation and ready summary. This Story picks up only target directory resolution and existing install detection.
- Story 1.1 selected dependency pins from Architecture: `commander@14.0.3`, `yaml@2.9.0`, `toml@4.1.1`, `csv-parse@6.2.1`, `fs-extra@11.3.5`, `zod@4.4.3`, `typescript@6.0.3`, `tsx@4.21.0`, `tsup@8.5.1`, `vitest@4.1.6`, `@types/node@22`. Do not silently drift versions in Story 1.2.
- Story 1.1 expects no project writes on runtime/platform guard failure. Preserve this by keeping target directory resolution after runtime/platform guard and before any project mutation.

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

- No new third-party dependency is required for this Story. Use Node.js built-in `node:path`, `node:fs/promises` and existing project-pinned libraries from Story 1.1.
- Node.js official docs for Node 22 state that relative filesystem paths are resolved relative to `process.cwd()`. This supports the default cwd target behavior and explicit relative target handling. [External: https://nodejs.org/download/release/v22.16.0/docs/api/fs.html#file-paths]
- Node.js path docs document `path.posix` and `path.win32` for consistent POSIX/Windows path behavior. Use these for path portability tests and avoid custom separator replacement logic. [External: https://nodejs.org/download/release/latest-jod/docs/api/path.html]
- Avoid newer Node APIs that are not part of the Node 22 baseline. In particular, do not introduce implementation reliance on Node 24-only behavior unless the runtime policy and fixture matrix are updated.

### Project Context Reference（项目上下文引用）

- `_bmad-output/project-context.md` currently contains only initialized metadata and placeholder sections; it does not define additional implementation rules beyond live PRD/Architecture/SPEC artifacts.
- The project-level language rule remains: conversation and generated docs in Chinese, section headings in `English（中文）` form, technical identifiers in English.

### References（参考）

- [Source: `_bmad-output/planning-artifacts/epics/04-epic-1-project-installation-onboarding项目安装引导.md#Story 1.2`]
- [Source: `_bmad-output/planning-artifacts/epics/04-epic-1-project-installation-onboarding项目安装引导.md#Epic 1`]
- [Source: `_bmad-output/planning-artifacts/prd/10-functional-requirements功能需求.md#Installation & Project Onboarding`]
- [Source: `_bmad-output/planning-artifacts/prd/11-non-functional-requirements非功能需求.md#Reliability & Determinism`]
- [Source: `_bmad-output/planning-artifacts/prd/11-non-functional-requirements非功能需求.md#Compatibility & Portability`]
- [Source: `_bmad-output/planning-artifacts/prd/11-non-functional-requirements非功能需求.md#Diagnostics & Observability`]
- [Source: `_bmad-output/planning-artifacts/prd/05-user-journeys用户旅程.md#Journey 1`]
- [Source: `_bmad-output/planning-artifacts/prd/09-project-scoping-phased-development项目范围界定与阶段化开发.md#MVP Feature Set`]
- [Source: `_bmad-output/planning-artifacts/architecture/02-starter-template-evaluationstarter-模板评估.md#Selected Starter`]
- [Source: `_bmad-output/planning-artifacts/architecture/03-core-architectural-decisions核心架构决策.md#Runtime Baseline`]
- [Source: `_bmad-output/planning-artifacts/architecture/04-implementation-patterns-consistency-rules实现模式与一致性规则.md#Format Patterns`]
- [Source: `_bmad-output/planning-artifacts/architecture/05-project-structure-boundaries项目结构与边界.md#Architectural Boundaries`]
- [Source: `_bmad-output/planning-artifacts/architecture/05-project-structure-boundaries项目结构与边界.md#Complete Project Directory Structure`]
- [Source: `_bmad-output/planning-artifacts/architecture/06-architecture-validation-results架构验证结果.md#Implementation Handoff`]
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Core User Experience`]
- [Source: `_bmad-output/planning-artifacts/specs/README.md#Reading Order`]
- [Source: `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md#Command Data Payloads`]
- [Source: `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md#Path Policy`]
- [Source: `_bmad-output/planning-artifacts/specs/03-install-plan-contract.md#Install Plan`]
- [Source: `_bmad-output/planning-artifacts/specs/03-install-plan-contract.md#Authorization Semantics`]
- [Source: `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md#Scope`]
- [Source: `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md#Canonical Target Identity`]
- [Source: `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md#manifest-schema`]
- [Source: `_bmad-output/planning-artifacts/specs/08-fixture-contract.md#Directory Layout`]
- [External: Node.js File System docs, https://nodejs.org/download/release/v22.16.0/docs/api/fs.html#file-paths]
- [External: Node.js Path docs, https://nodejs.org/download/release/latest-jod/docs/api/path.html]

## Dev Agent Record（开发代理记录）

### Agent Model Used（使用模型）

_To be filled by the dev-story agent._

### Debug Log References（调试日志引用）

### Completion Notes List（完成备注）

- Ultimate context engine analysis completed - comprehensive developer guide created.

### File List（文件列表）
