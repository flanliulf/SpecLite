# Story 1.1: CLI Install Entry And Runtime Guard（CLI 安装入口与运行时守卫）

Status: Done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story（故事）

作为项目维护者，  
我希望运行 `speclite install` 时先获得清晰的运行时与平台就绪反馈，  
以便在任何项目文件被修改前，确认当前环境是否可以安全开始 SpecLite 安装。

## Acceptance Criteria（验收标准）

1. **MVP CLI scaffold exists before runtime guard work.**  
   **前提** 代码库尚未具备 MVP CLI 脚手架；  
   **当** 维护者开始 Story 1.1；  
   **则** 必须建立 ESM package、commander 命令层、tsup 构建、tsx 本地执行和 vitest 测试骨架；  
   **并且** `bin.speclite` 必须指向 `dist/bin/speclite.js`；  
   **并且** package scripts 必须至少包含 `build`、`test` 和 `release:packaging-check` stub，后者在 Epic 6 完成 packaging assertions；  
   **并且** 在接入 runtime/platform guard 之前，必须先建立 `src/diagnostics/command-result-schema.ts` executable contract anchor、producer/consumer contract tests 和最小 fixture expected output skeleton。

2. **Owning SPEC implementation anchors exist before orchestration shortcuts.**  
   **前提** 代码库尚未具备 owning SPEC implementation anchors；  
   **当** 维护者建立 MVP scaffold；  
   **则** 必须创建 `src/diagnostics/command-result-schema.ts`、`src/source/source-descriptor-schema.ts`、`src/installer/install-plan-schema.ts`、`src/manifest/manifest-schema.ts`、`src/ide/adapter-registry.ts`、`src/config/resolve-output-schema.ts` 和 `src/fixtures/fixture-contract.ts`；  
   **并且** 每个 anchor 可以先提供最小 parser/schema/registry stub，但不得让 CLI orchestration、reporters、fixture assertions 或 adapters 绕过这些 anchors 手写契约逻辑。

3. **CLI entry loads the install command skeleton and passes smoke tests.**  
   **前提** CLI 脚手架已建立；  
   **当** 维护者运行本地构建或冒烟测试；  
   **则** `speclite` 入口可以加载安装命令骨架；  
   **并且** 最小测试能验证命令入口、diagnostics contract anchor、runtime guard、`package.json engines.node` 和确定性失败输出形状。

4. **Runtime/platform guard reuses the diagnostics contract.**  
   **前提** CLI 骨架和 diagnostics contract anchor 已通过冒烟测试；  
   **当** 维护者接入 runtime/platform guard；  
   **则** runtime/platform guard 必须复用 diagnostics contract anchor 产生确定性 `CommandResult` failure envelope；  
   **并且** 不得在命令实现中临时拼接第二套 failure JSON shape。

5. **Unsupported Node.js reports the reserved environment issue.**  
   **前提** 用户在目标项目中运行 `speclite install`；  
   **当** CLI 启动；  
   **则** 命令会根据 MVP 运行时策略校验检测到的 Node.js 版本；  
   **并且** 当版本不受支持时，报告 `environment.unsupported-node`，包含检测到的版本和要求的版本范围；  
   **并且** 该 guard 必须与 `package.json engines.node`、fixture matrix 和 taxonomy details 保持一致。

6. **Unsupported platform reports the reserved environment issue.**  
   **前提** 检测到的 Node.js 版本满足最低要求；  
   **当** CLI 继续启动流程；  
   **则** 命令会验证当前平台是否支持 MVP 安装路径；  
   **并且** 当平台不受支持时，报告 `environment.unsupported-platform` 诊断。

7. **Passing guard creates command context but performs no project writes.**  
   **前提** 运行时与平台检查均通过；  
   **当** 安装命令初始化；  
   **则** 命令会创建 install command context，但尚不写入 installer-owned 项目文件；  
   **并且** 后续安装阶段会按定义顺序准备执行。

8. **Failing guard performs no project writes and provides next actions.**  
   **前提** 运行时或平台校验失败；  
   **当** 命令退出；  
   **则** 不会创建或修改 `_speclite`、`_speclite-output`、`.claude/skills` 或 `.agents/skills` 文件；  
   **并且** 失败结果包含清晰的下一步建议。

9. **`install --json` guard failures are deterministic fixture assets.**  
   **前提** 用户请求机器可读输出；  
   **当** `speclite install --json` 在运行时或平台守卫阶段失败；  
   **则** 命令返回符合 `CommandResult` 契约的 install failure envelope；  
   **并且** 输出可用于 fixture assertion 的确定性 issue 字段。

## Tasks / Subtasks（任务 / 子任务）

- [x] Task 1: 建立 root Node/TypeScript CLI scaffold（AC: 1, 3）
  - [x] 新增 `package.json`，设置 `"type": "module"`、`bin.speclite: "./dist/bin/speclite.js"` 和 `engines.node: ">=22"`。
  - [x] 新增 `package-lock.json`，锁定 Story 1.1 选择的依赖版本，避免后续 dev/test 环境漂移。
  - [x] 新增 `tsconfig.json`、`tsup.config.ts`、`vitest.config.ts`。
  - [x] 新增 npm scripts：`build`、`test`、`dev` 或等价 tsx 本地执行入口，以及 `release:packaging-check` stub。
  - [x] 确保 `release:packaging-check` 当前只作为 Epic 6 packaging acceptance placeholder，不假装已经执行 package file inventory assertions。

- [x] Task 2: 建立 CLI entrypoint 与 install command skeleton（AC: 1, 3, 7）
  - [x] 新增 `src/bin/speclite.ts`，负责创建 commander program、注册 `install` command、处理 exit code。
  - [x] 新增 `src/commands/install.ts`，只做 install command orchestration skeleton、runtime/platform guard 调用和 command context 创建。
  - [x] 不得在 Story 1.1 中写入 `_speclite`、`_speclite-output`、`.claude/skills` 或 `.agents/skills`。
  - [x] 不得提前实现 Story 1.2+ 的 target directory resolution、module selection、config initialization、IDE mirror creation 或 ready summary。

- [x] Task 3: 建立 owning SPEC executable anchors（AC: 1, 2, 4）
  - [x] 新增 `src/diagnostics/command-result-schema.ts`，作为 `CommandResult` 与 `ValidationIssue` public JSON executable schema anchor。
  - [x] 新增 `src/source/source-descriptor-schema.ts`，作为 `SourceDescriptor` 与 `SourceIntegrityEvidence` anchor，当前可提供最小 stub 供 `InstallCommandData` schema 引用。
  - [x] 新增 `src/installer/install-plan-schema.ts`，作为 `SourceResolutionPlan`、`InstallPlan`、planned writes、confirmation state 和 write authorization anchor。
  - [x] 新增 `src/manifest/manifest-schema.ts`，作为 manifest、skill/help/files index 和 phase coverage projection anchor。
  - [x] 新增 `src/ide/adapter-registry.ts`，作为 `claude`、`agents` adapter ids、target ids、canonical target order 和 status mapping anchor。
  - [x] 新增 `src/config/resolve-output-schema.ts`，作为 `speclite resolve` stdout JSON、stderr JSON Lines diagnostics 和 merge-result parser anchor。
  - [x] 新增 `src/fixtures/fixture-contract.ts`，作为 fixture manifest parsing、expected-output comparison 和 release gate classification anchor。

- [x] Task 4: 实现共享 diagnostics projection，禁止第二套 JSON shape（AC: 3, 4, 5, 6, 9）
  - [x] 新增 `src/diagnostics/command-result.ts` 或等价 module，用于由领域结果构造 `CommandResult<InstallCommandData>`。
  - [x] 新增 `src/validation/issue-model.ts` 或等价 module，用于导出 stable issue category / severity ordering，或直接从 `command-result-schema.ts` 复用。
  - [x] 实现 `install` command failure projection：`schemaVersion: "speclite.command-result.v1"`、`command: "install"`、`status: "failure"`、`issues`、`nextActions`、`data`。
  - [x] JSON path fields 使用 project-relative POSIX path；guard failure 不应产生 project write path。
  - [x] `summary` 与 `nextActions` 保持 stable、无 timestamp、无 absolute path、无环境特定措辞。

- [x] Task 5: 实现 runtime/platform guard（AC: 4, 5, 6, 8, 9）
  - [x] 新增 `src/installer/runtime-guard.ts` 或更合适的 Story-scoped guard module。
  - [x] Node version guard 在读取或写入目标项目文件前执行；最低支持范围与 `package.json engines.node` 保持一致：`>=22`。
  - [x] 不满足 Node range 时输出 `environment.unsupported-node`，severity 为 `error`，details 至少包含 `detectedVersion` 与 `requiredRange`。
  - [x] Platform guard 支持 MVP 平台策略：macOS 13+ 与 Windows 11 核心安装路径；不支持时输出 `environment.unsupported-platform`，details 至少包含 `detectedPlatform` 与 `supportedPlatforms`。
  - [x] Details 不得包含 absolute paths、home directory、environment variable values、timestamps、stack traces 或 raw process dumps。
  - [x] 失败时不得创建或修改 `_speclite`、`_speclite-output`、`.claude/skills` 或 `.agents/skills`。

- [x] Task 6: 建立最小 fixture expected output skeleton（AC: 1, 3, 8, 9）
  - [x] 新增 `test/fixtures/fresh-install-empty-project/` 的最小 `input/`、`expected/command-json/` 和 `README.md` skeleton，或采用 fixture contract 推荐的等价 layout。
  - [x] 为 unsupported Node / unsupported platform guard failure 保留 expected command JSON skeleton，字段来自 `CommandResult` contract。
  - [x] expected output 不得包含 absolute paths、home directories、timestamps、环境变量或本机 checkout-specific text。
  - [x] 若添加 stderr JSON Lines fixture，必须逐行 parse 为 `ValidationIssue` shape。

- [x] Task 7: 编写 Story 1.1 最小测试（AC: 1, 2, 3, 4, 5, 6, 8, 9）
  - [x] `package.json` test：验证 `bin.speclite`、`engines.node`、required scripts 存在。
  - [x] CLI smoke test：验证 `speclite install` command skeleton 可加载，不要求执行后续 install stages。
  - [x] Contract producer/consumer tests：验证 guard failure 通过 `command-result-schema.ts` parse/validate。
  - [x] Runtime guard tests：模拟 unsupported Node 与 unsupported platform，断言 issue id、category、severity、details、exit code、`CommandResult.status`。
  - [x] No-write tests：guard failure 后断言不会创建 `_speclite`、`_speclite-output`、`.claude/skills` 或 `.agents/skills`。

- [x] Task 8: 本地验证与范围控制（AC: 1-9）
  - [x] 运行 `npm install` 或等价 dependency install，确认 lockfile 可复现。
  - [x] 运行 `npm run build`。
  - [x] 运行 `npm test`。
  - [x] 运行 `npm run release:packaging-check`，当前应通过 stub 并清楚表明完整 packaging assertions deferred to Epic 6。
  - [x] 检查 diff，确保本 Story 未修改 planning artifacts，未实现 Post-MVP commands，未写入目标项目 runtime directories。

## Dev Notes（开发备注）

### Current Repository State（当前仓库状态）

- 当前仓库根目录没有 `package.json`，没有 `src/`、`test/`、`tests/` 或 `fixtures/` 实现目录；Story 1.1 预期新增 scaffold，而不是修改既有实现文件。
- `assets/source/speclite/` 已存在，并包含 bundled source skills、module metadata、custom stubs 和 legacy Python resolver scripts。Story 1.1 不需要实现 source discovery，但 scaffold 不得把 `assets/source/speclite/` 与 `src/source/` resolver code 混放。
- 当前 git worktree 中已有 planning artifacts 的未提交改动。Story 1.1 implementation 不应顺手格式化、重写或同步 `_bmad-output/planning-artifacts/`。
- 没有 previous Story 1.0 或 Story 1.1 implementation learnings；这是第一条 implementation Story。

### Scope Boundary（范围边界）

- 本 Story 的目标是最小可执行 CLI/control-plane foundation：scaffold、contract anchors、guard failure envelope 和 tests。
- 本 Story 只允许创建 install command skeleton 和 runtime/platform preflight。它不负责完整 fresh install。
- 不要提前实现：
  - Story 1.2 target directory resolution / existing install detection。
  - Story 1.3 module selection / install summary。
  - Story 1.4 project config initialization。
  - Story 1.5 runtime structure / IDE mirror creation。
  - Story 1.6 progress events / ready summary。
  - Epic 2+ discovery metadata、resolve parity full behavior、status/validate/update flows。
  - Post-MVP `init`、`list`、`doctor`、`sync`、`uninstall`、top-level `repair`、command pointer artifacts、Copilot/Cursor branded target ids。

### Architecture Requirements（架构要求）

- Runtime baseline: Node.js 22 LTS minimum, Node.js 24 LTS recommended. Do not use Node 24-only APIs unless a Node 22-compatible path exists.
- CLI foundation: TypeScript + commander, with SpecLite-owned installer pipeline modules. Do not introduce oclif/yargs/cac/clipanion unless a new ADR changes the starter decision.
- Package must be ESM. Build output must put the executable CLI at `dist/bin/speclite.js`.
- MVP is local-first filesystem control plane. Do not introduce database, web server, desktop UI, daemon, REST API, GraphQL, or long-lived cache.
- All public paths in command output, fixtures, manifest/index, and issues must be project-relative POSIX-style paths.
- All command failures must use structured diagnostics and then render human-readable or JSON output. Do not throw raw parser/runtime errors to users as the primary UX.

### Contract Anchors（契约锚点）

| Anchor | Required path | Story 1.1 expectation |
| --- | --- | --- |
| CommandResult / ValidationIssue | `src/diagnostics/command-result-schema.ts` | Must exist before reporter, fixture, or guard projection code depends on JSON shape. |
| SourceDescriptor | `src/source/source-descriptor-schema.ts` | Minimal stub is acceptable; needed because install data references source descriptor semantics. |
| InstallPlan | `src/installer/install-plan-schema.ts` | Minimal parser/schema for plan-before-write concepts; Story 1.1 should not apply writes. |
| Manifest / indexes | `src/manifest/manifest-schema.ts` | Minimal schema anchor only; do not implement full manifest generation in this Story. |
| IDE adapter registry | `src/ide/adapter-registry.ts` | Must expose canonical MVP target order `claude`, then `agents`; no command pointer artifacts. |
| Resolve output | `src/config/resolve-output-schema.ts` | Minimal anchor only; full parity belongs to later Stories. |
| Fixture contract | `src/fixtures/fixture-contract.ts` | Minimal fixture layout/comparison anchor for Story 1.1 guard expected outputs. |

### CommandResult And Issue Requirements（CommandResult 与 Issue 要求）

- Covered core command JSON uses:

```ts
type CommandResult<TData> = {
  schemaVersion: "speclite.command-result.v1";
  status: "success" | "warning" | "failure";
  command: "install" | "status" | "validate" | "update" | "update.repair";
  targetProject: string;
  summary: string;
  issues: ValidationIssue[];
  nextActions: string[];
  data: TData;
};
```

- `speclite install --json` must use `command: "install"` and `CommandResult<InstallCommandData>`.
- Guard failure must produce `status: "failure"` and a non-zero exit code.
- `issues` sorting must follow severity order, canonical category order, normalized affected path, issue id.
- `nextActions` sorting must follow command-specific priority: blocking remediation, recommended next step, optional exploration.
- `summary` must be stable and must not contain timestamp, absolute path, home directory, random ordering, or environment-specific wording.
- Public JSON must not contain ANSI escape, icons, human-only decoration, raw stack traces, environment variables, cache paths, temporary extraction paths, or credentials.

### Runtime Guard Details（运行时守卫细节）

- `environment` category is reserved for command runtime/platform guard failures, not installed-state drift.
- `environment.unsupported-node`:
  - severity: `error` when command must stop before reading or writing project files.
  - details: at minimum `detectedVersion` and `requiredRange`.
  - required range must match `package.json engines.node`, currently `>=22`.
- `environment.unsupported-platform`:
  - severity: `error` when command must stop before continuing install.
  - details: at minimum `detectedPlatform` and `supportedPlatforms`.
  - supported MVP policy from PRD/Architecture: macOS 13+ and Windows 11 core paths.
- Guard must run before project writes. It may read process/runtime facts required to detect Node and platform, but it must not create target project runtime directories on failure.

### File Structure Requirements（文件结构要求）

Expected new or scaffolded paths for this Story:

```text
package.json
package-lock.json
tsconfig.json
tsup.config.ts
vitest.config.ts
src/bin/speclite.ts
src/commands/install.ts
src/diagnostics/command-result-schema.ts
src/diagnostics/command-result.ts
src/diagnostics/output.ts
src/validation/issue-model.ts
src/installer/runtime-guard.ts
src/installer/install-context.ts
src/installer/install-plan-schema.ts
src/source/source-descriptor-schema.ts
src/manifest/manifest-schema.ts
src/ide/adapter-registry.ts
src/config/resolve-output-schema.ts
src/fixtures/fixture-contract.ts
test/fixtures/fresh-install-empty-project/
```

This list is intentionally Story-scoped. If implementation needs tiny helper files to keep modules clean, add them only when they support the ACs directly and keep names aligned with architecture kebab-case conventions.

### Dependency And Runtime Notes（依赖与运行时说明）

- Architecture-selected starter versions:
  - `commander@14.0.3`
  - `yaml@2.9.0`
  - `toml@4.1.1`
  - `csv-parse@6.2.1`
  - `fs-extra@11.3.5`
  - `zod@4.4.3`
  - `typescript@6.0.3`
  - `tsx@4.21.0`
  - `tsup@8.5.1`
  - `vitest@4.1.6`
  - `@types/node@22`
- Live package check on 2026-05-26 found `vitest@4.1.7` and `tsx@4.22.3` newer than the architecture starter text. For this Story, prefer the architecture-pinned versions unless you intentionally update the dependency choice in the implementation diff and explain the reason. Do not silently drift versions.
- `@types/node` must stay on the Node 22 baseline even if latest `@types/node` is newer; this prevents accidental Node 24-only API usage.
- Node.js official release data currently shows Node 22 and Node 24 as LTS and Node 20 as EOL. Story behavior still follows project contract: `engines.node: ">=22"`, Node 22 minimum, Node 24 recommended.
- Node v22 to v24 migration notes include platform/runtime behavior changes. Avoid APIs or assumptions that would pass only on Node 24.

### Testing Requirements（测试要求）

- Use Vitest for unit and smoke tests.
- Tests should be deterministic and local-only; do not access npm registry, Git remote, private registry, offline bundle origin, or external network during tests.
- Use dependency injection or small pure functions to simulate unsupported Node/platform. Do not require actually running tests under unsupported Node to test the guard.
- Fixture expected output should parse JSON semantically, not compare fragile raw text.
- No-write tests should run in a temporary fixture directory and assert the absence of `_speclite`, `_speclite-output`, `.claude/skills`, and `.agents/skills` after guard failure.
- If human-readable output is included, it must work without color, spinner-only progress, or terminal-width-specific semantics.

### UX / Output Requirements（UX 与输出要求）

- Output tone should be sober, specific, and actionable.
- Human-readable and `--json` output must share the same status, issue, exit-code, and next-action semantics.
- Do not make `status`, `summary`, or progress text the only automation surface; automation-required fields must be in `CommandResult.data`, `issues`, or `nextActions`.
- For guard failure, next actions should tell the user how to install/use a supported Node/runtime or choose a supported platform. Keep these strings stable and avoid embedding local paths.

### Previous Story Intelligence（前序 Story 情报）

- Not applicable. This is the first implementation Story in Epic 1.
- There are no previous implementation files or review learnings to preserve.

### Git Intelligence（Git 情报）

- Recent commits are documentation/context/spec oriented, not implementation scaffold:
  - `a0b08ef style(docs): 清理参考文档尾随空白`
  - `1ab545f docs(context): 初始化项目上下文文档`
  - `a4f8ab9 docs(source): 同步内置源资产路径说明`
  - `6e3d4e4 docs(glossary): 整理术语目录与文档索引`
  - `5b2c7a4 docs(specs): 收敛 MVP 契约与实现锚点`
- Treat live sharded docs and owning SPECs as current implementation truth. Do not use archived whole documents as contract sources.

### References（参考）

- [Source: `_bmad-output/planning-artifacts/epics/04-epic-1-project-installation-onboarding项目安装引导.md#Story 1.1`]
- [Source: `_bmad-output/planning-artifacts/architecture/02-starter-template-evaluationstarter-模板评估.md#Selected Starter`]
- [Source: `_bmad-output/planning-artifacts/architecture/03-core-architectural-decisions核心架构决策.md#Runtime Baseline`]
- [Source: `_bmad-output/planning-artifacts/architecture/04-implementation-patterns-consistency-rules实现模式与一致性规则.md#Format Patterns`]
- [Source: `_bmad-output/planning-artifacts/architecture/05-project-structure-boundaries项目结构与边界.md#Complete Project Directory Structure`]
- [Source: `_bmad-output/planning-artifacts/architecture/06-architecture-validation-results架构验证结果.md#Implementation Handoff`]
- [Source: `_bmad-output/planning-artifacts/prd/10-functional-requirements功能需求.md#Installation & Project Onboarding`]
- [Source: `_bmad-output/planning-artifacts/prd/11-non-functional-requirements非功能需求.md#Compatibility & Portability`]
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Core User Experience`]
- [Source: `_bmad-output/planning-artifacts/specs/README.md#Reading Order`]
- [Source: `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md#CommandResult Envelope`]
- [Source: `_bmad-output/planning-artifacts/specs/03-install-plan-contract.md#Install Plan`]
- [Source: `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md#environment`]
- [Source: `_bmad-output/planning-artifacts/specs/08-fixture-contract.md#Directory Layout`]
- [External: Node.js releases, https://nodejs.org/en/about/previous-releases]
- [External: Node.js v22 to v24 migration notes, https://nodejs.org/en/blog/migrations/v22-to-v24]

## Dev Agent Record（开发代理记录）

### Agent Model Used（使用模型）

GPT-5 Codex

### Debug Log References（调试日志引用）

- `python3 _bmad/scripts/resolve_customization.py --skill .agents/skills/bmad-dev-story --key workflow`：失败，默认 Python 3.9.6 缺 `tomllib`。
- `python3.12 _bmad/scripts/resolve_customization.py --skill .agents/skills/bmad-dev-story --key workflow`：通过，workflow 无 prepend/append，persistent facts 为 `project-context.md`。
- `npm install`：通过，生成 `package-lock.json`。
- `npm run build`：首轮发现双 shebang 与 TypeScript optional-property 问题；修复后通过，产物路径为 `dist/bin/speclite.js`。
- `npm test`：通过，4 个 test files、7 个 tests。
- `node dist/bin/speclite.js install --json`：通过，built CLI 可执行并返回 success preflight `CommandResult`。
- `npm run release:packaging-check`：通过，明确输出 packaging file inventory assertions deferred to Epic 6。
- `git diff --check`：通过。

### Implementation Plan（实现计划）

- 先建立 Node/TypeScript ESM package scaffold 与 commander CLI entry，保证 `bin.speclite` 构建到 `dist/bin/speclite.js`。
- 以 `src/diagnostics/command-result-schema.ts` 为唯一 `CommandResult` / `ValidationIssue` executable contract anchor，fixture consumer 与 producer 测试复用同一 schema。
- 将 runtime/platform guard 放在 install command orchestration 的最前面，guard failure 只创建 deterministic failure envelope，不读取或写入目标项目 runtime directories。
- 只创建 Story 1.1 所需 schema/registry anchors 和 install command context skeleton，不实现 target directory resolution、source selection、config initialization、IDE mirror creation 或 ready summary。

### Completion Notes List（完成备注）

- Ultimate context engine analysis completed - comprehensive developer guide created.
- 建立 root ESM package scaffold、`commander` CLI、`tsup` build、`tsx` dev entry、Vitest 测试骨架与 `release:packaging-check` Epic 6 placeholder。
- 新增 `CommandResult`、`ValidationIssue`、source descriptor、install plan、manifest/index、IDE adapter registry、resolve output 与 fixture contract executable anchors。
- 实现 install runtime/platform guard：Node `<22` 输出 `environment.unsupported-node`，unsupported platform 输出 `environment.unsupported-platform`，二者均复用 diagnostics contract 并返回 deterministic install failure envelope。
- 建立 `fresh-install-empty-project` fixture skeleton 与 unsupported Node / unsupported platform expected command JSON。
- 验证 guard failure 不创建 `_speclite`、`_speclite-output`、`.claude/skills` 或 `.agents/skills`，且 passing guard 只创建 command context、不写入项目文件。

### File List（文件列表）

- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/implementation-artifacts/stories/1-1-cli-install-entry-and-runtime-guard.md`
- `package.json`
- `package-lock.json`
- `tsconfig.json`
- `tsup.config.ts`
- `vitest.config.ts`
- `src/bin/speclite.ts`
- `src/commands/install.ts`
- `src/config/resolve-output-schema.ts`
- `src/diagnostics/command-result-schema.ts`
- `src/diagnostics/command-result.ts`
- `src/diagnostics/output.ts`
- `src/fixtures/fixture-contract.ts`
- `src/ide/adapter-registry.ts`
- `src/installer/install-context.ts`
- `src/installer/install-plan-schema.ts`
- `src/installer/runtime-guard.ts`
- `src/manifest/manifest-schema.ts`
- `src/source/source-descriptor-schema.ts`
- `src/validation/issue-model.ts`
- `test/cli-smoke.test.ts`
- `test/contract-anchors.test.ts`
- `test/fixtures/fresh-install-empty-project/README.md`
- `test/fixtures/fresh-install-empty-project/input/.gitkeep`
- `test/fixtures/fresh-install-empty-project/expected/command-json/unsupported-node.json`
- `test/fixtures/fresh-install-empty-project/expected/command-json/unsupported-platform.json`
- `test/package-scaffold.test.ts`
- `test/runtime-guard.test.ts`

### Change Log（变更日志）

- 2026-05-26：完成 Story 1.1 CLI scaffold、contract anchors、runtime/platform guard、fixture skeleton、最小测试与本地验证；Story 状态更新为 `review`。
