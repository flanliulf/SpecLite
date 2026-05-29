# Story 3.1: Lightweight Install Status Summary（轻量安装状态摘要）

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story（故事）

作为工具链维护者，  
我希望运行 `speclite status` 时快速看到当前项目的 SpecLite 安装状态，  
以便判断项目是否已配置、哪些 IDE targets 可用，以及下一步应运行安装、验证还是修复流程。

## Acceptance Criteria（验收标准）

1. **Uninstalled project returns a successful not-configured summary（未安装项目返回成功的 not-configured 摘要）**  
   **前提** 用户在未安装 SpecLite 的目标项目中运行 `speclite status`；  
   **当** status 发现 `_speclite/_config/manifest.yaml` 不存在，且本次 lightweight read 未发现可读 installed-state manifest；  
   **则** 命令必须返回 `CommandResult.status: "success"`，exit code 为 0，并在 `status.data.highLevelHealth` 中输出 `not-configured`；  
   **并且** `nextActions` 必须按 command-specific priority order 建议运行 `speclite install`；  
   **并且** 该状态不得产生 warning issue，也不得被当作 command failure。

2. **Installed state summary uses only local lightweight evidence（已安装状态摘要只使用本地轻量证据）**  
   **前提** 目标项目存在 SpecLite manifest 或 installed state；  
   **当** `speclite status` 读取本地安装摘要；  
   **则** 输出必须包含 source/channel/version、manifest presence、manifest version、installed modules、IDE target summary 和关键路径；  
   **并且** 只允许读取 local manifest/index、source descriptor projection、adapter summary 和 required path presence；  
   **并且** 不得执行 full file hash scan、remote source access、remote freshness check、provenance revalidation、implicit update check 或 repair planning。

3. **IDE target summary uses status-layer vocabulary and canonical order（IDE Target 摘要使用 Status 层词汇与规范顺序）**  
   **前提** 已配置一个或多个 IDE targets；  
   **当** status 生成 target coverage 摘要；  
   **则** `data.ideTargets` 必须按 adapter registry canonical target order 输出：`claude`，然后 `agents`；  
   **并且** 每个 target 只能使用 status summary layer 的 `not-configured`、`configured`、`partial` 或 `failed`；  
   **并且** `partial` 或 `failed` target 必须提供原因摘要和 project-relative POSIX affected path；  
   **并且** 不得把 installed phase coverage 的 `mapped` / `unsupported` / `failed` 或 install planning 的 `planned` / `unsupported` / `failed` 当作 status summary 语义复用；  
   **并且** MVP 不得输出 branded `copilot` 或 `cursor` target id，也不得把 `agents` 渲染为 Copilot/Cursor readiness。

4. **High-level health is independent from command status（High-Level Health 独立于命令状态）**  
   **前提** status 命令成功读取到足够信息来判断安装健康摘要；  
   **当** `data.highLevelHealth` 为 `not-configured`、`partial` 或 `failed`；  
   **则** `CommandResult.status` 仍可为 `success`，exit code 仍应为 0；  
   **并且** `partial` 或 `failed` 不得自动生成 warning issue，也不得自动把 `CommandResult.status` 推导为 `warning`；  
   **并且** 只有 lightweight read 本身发现明确 command-level warning/error 条件时，才可以产生 `issues[]`。

5. **Status JSON is not a weak validate output（Status JSON 不是弱化版 Validate 输出）**  
   **前提** 自动化需要判断安装健康或读取可修复问题；  
   **当** 它消费 `speclite status --json`；  
   **则** 安装健康断言必须读取 `data.highLevelHealth`；  
   **并且** `status.data` 不得包含 `issueCounts`、`checkedCategories`、`checkedTargets`、`validatedPaths` 或 full validation category coverage；  
   **并且** 需要 issue id、category、severity、affected path、impact 或 suggested next step 时必须运行 `speclite validate`。

6. **Empty issues are allowed and do not prove health（空 Issues 合法且不证明安装健康）**  
   **前提** 用户请求 `speclite status --json`；  
   **当** 命令成功生成 lightweight summary；  
   **则** JSON 可以包含 `issues: []`；  
   **并且** 空 issues 只表示本次 lightweight status 命令无命令级 warning/error/critical issue；  
   **并且** 空 issues 不得被实现、fixture 或文档解释为 installation healthy，健康判断必须读取 `data.highLevelHealth`。

7. **Human-readable status remains compact but evidence-backed（人类可读 Status 保持紧凑且有证据）**  
   **前提** 用户运行默认 human-readable `speclite status`；  
   **当** renderer 输出结果；  
   **则** 默认输出应使用 Compact profile：command title、high-level health、source/version、IDE target count 或 per-target summary、key paths 和 Next actions；  
   **并且** 输出不得依赖 ANSI color、图标、spinner-only progress 或 terminal-width-specific layout 才能理解；  
   **并且** automation 必需字段必须进入 `CommandResult.data`、`issues` 或 `nextActions`，不得只存在于 human-readable prose。

## Tasks / Subtasks（任务 / 子任务）

- [x] Task 1: 验证前置实现与当前仓库状态（AC: 1-7）
  - [x] 确认 Epic 1 / Epic 2 的实际代码已建立 TypeScript CLI scaffold、`speclite install`、manifest/index generation、source descriptor projection、IDE adapter registry、diagnostics/output、`src/fixtures/fixture-contract.ts` 和 fixture assets/tests；不能只依据 story context 的 `ready-for-dev` 状态判断完成。
  - [x] 如果 `package.json`、`src/`、`test/`、`src/bin/speclite.ts`、`src/commands/status.ts`、`src/diagnostics/command-result-schema.ts`、`src/manifest/manifest-schema.ts`、`src/source/source-descriptor-schema.ts` 或 `src/ide/adapter-registry.ts` 仍不存在，先完成前置 stories；不得在 Story 3.1 中一次性重建全部安装器或 IDE mirror pipeline。
  - [x] 检查 worktree dirty 状态，保留与本 Story 无关的 planning artifacts、story 文件、sprint status 或用户改动；不得格式化、重写、同步或回滚无关文件。

- [x] Task 2: 接入 `speclite status` 命令编排（AC: 1, 2, 4, 5）
  - [x] 在 `src/commands/status.ts` 或既有 status command module 中实现 command orchestration；`src/commands/` 只做参数解析、调用领域读取函数和返回 `CommandResult<StatusCommandData>`。
  - [x] 支持默认 human-readable 输出与 `--json` 输出，command id 必须稳定为 `status`，不得使用 raw argv、alias 或带 flags 的字符串。
  - [x] 默认 project root resolution 必须复用 Story 1.2 / `src/fs/path-normalizer.ts` 或既有 project-root helper；public path fields 使用 project-relative POSIX path。
  - [x] `status` 默认不得检查 project operation lock；lock checks 保留给 write-capable commands 和显式 `speclite validate`。

- [x] Task 3: 实现 lightweight installed-state reader（AC: 1, 2, 4, 6）
  - [x] 新增或复用 `src/status/installed-state.ts`、`src/manifest/manifest-reader.ts` 或等价模块，读取 `_speclite/_config/manifest.yaml` 和必要 indexes 的最小 shape。
  - [x] 读取 `SourceDescriptor` projection 时必须复用 `src/source/source-descriptor-schema.ts`；不要手写第二套 source descriptor parser。
  - [x] 读取 manifest/index 时必须复用 `src/manifest/manifest-schema.ts` 或同一 schema/parser anchor；不要在 status command 内复制 manifest field contract。
  - [x] 未安装时返回 `manifestPresent: false`、`installedModules: []`、`ideTargets` 的空或 not-configured 摘要、`highLevelHealth: "not-configured"` 和推荐安装的 next action。
  - [x] Manifest/index/source descriptor 损坏或不可读时，status 可以输出 `highLevelHealth: "failed"`；只有 lightweight read 本身无法生成稳定 command result 时，才通过 command-level issue 改变 `CommandResult.status`。

- [x] Task 4: 实现 `highLevelHealth` deterministic aggregation（AC: 1, 2, 4, 5, 6）
  - [x] 按 owning SPEC 的 first-match order 计算：`not-configured` -> `failed` -> `partial` -> `configured`。
  - [x] `not-configured` 条件：`manifestPresent === false`，且本次 lightweight status 没有发现可读 installed-state manifest。
  - [x] `failed` 条件：manifest/index/source descriptor shape 损坏或不可读，导致无法产生稳定 installed summary；或任何已安装/显式选择的 IDE target summary 为 `failed`。
  - [x] `partial` 条件：manifest 可读但 installed summary 不完整，例如 `installedModules` 为空、任一已安装/显式选择的 IDE target 为 `not-configured` 或 `partial`，或 required runtime path summary 缺失。
  - [x] `configured` 条件：manifest、source descriptor、installed modules、required runtime paths 和所有已安装/显式选择的 IDE target summary 都可读且为 configured。
  - [x] 不得从 `CommandResult.status` 反推 `highLevelHealth`，也不得从 `highLevelHealth` 自动生成 warning issue 或 non-zero exit code。

- [x] Task 5: 实现 IDE target status summary（AC: 2, 3, 7）
  - [x] 在 `src/ide/adapter-registry.ts` 中复用 canonical target order：`claude`，然后 `agents`。
  - [x] Status summary layer 使用 `StatusSummaryTargetHealth = "not-configured" | "configured" | "partial" | "failed"` 或等价类型；不要复用 installed phase coverage 的 `mapped`。
  - [x] 每个 `IdeTargetStatus` 至少包含 `id` 和 `status`；可按 contract 输出 `targetPath`、`skillCount` 或原因摘要，但 path 必须是 project-relative POSIX path。
  - [x] 对 target directory 缺失、expected entry 缺失、manifest/index 与 target projection 不完整等轻量可读问题，输出 `partial` 或 `failed` 摘要并给出原因；不要执行 package hash comparison 或 full file integrity scan。
  - [x] 不新增 `copilot`、`cursor` 或 branded target id；`.agents/skills` 一律显示为 `agents` / `.agents/skills` target。

- [x] Task 6: 投影 `StatusCommandData` 与 JSON renderer（AC: 1, 2, 4, 5, 6）
  - [x] `speclite status --json` 必须输出 `CommandResult<StatusCommandData>`，并通过 `src/diagnostics/command-result-schema.ts` 或同一 executable contract anchor 校验。
  - [x] Required `data` fields：`manifestPresent`、`installedModules`、`ideTargets`、`highLevelHealth`、`paths`。
  - [x] Optional `data` fields：`sourceDescriptor`、`manifestVersion`；只在可读且通过 schema shape 时输出。
  - [x] `data.paths.projectRoot` 必须是 `"."`；其他 path fields 必须 project-relative POSIX。
  - [x] `issues` 允许为空数组；不要因为 `highLevelHealth` 为 `partial` 或 `failed` 自动填充 warning issue。
  - [x] 不得输出 `issueCounts`、`checkedCategories`、`checkedTargets`、`validatedPaths`、`readySummary`、`validationSummary`、`hashScanResult`、timestamp 或未契约化字段。

- [x] Task 7: 实现 compact human-readable output（AC: 2, 3, 7）
  - [x] 在 `src/diagnostics/output.ts` 或既有 renderer 层扩展 Compact profile，用于默认 `speclite status`。
  - [x] 输出顺序建议为：command title、high-level health、source/version、manifest summary、installed modules、IDE targets、key paths、Next actions。
  - [x] `not-configured` empty state 必须显式呈现，不以空白表示；Next actions 推荐 `speclite install`。
  - [x] `partial` / `failed` 摘要应引导用户运行 `speclite validate` 获取完整 issue list；不要把 full validation details 塞入 status。
  - [x] 输出必须支持 `NO_COLOR`、non-TTY、CI 和窄终端；颜色、符号或布局变化不得丢失 health、target id、path 或 next action。

- [x] Task 8: 编写 focused tests、integration tests 和 fixture assertions（AC: 1-7）
  - [x] 单元测试覆盖 `highLevelHealth` 聚合：not-configured、failed、partial、configured、manifest unreadable、source descriptor invalid、target partial/failed。
  - [x] 单元测试覆盖 `StatusCommandData` schema：required fields、optional fields、`issues: []`、无 `issueCounts`、无 full validation fields、`data.paths.projectRoot === "."`。
  - [x] 单元测试覆盖 target ordering 与 target semantics：`claude` before `agents`，不输出 branded Copilot/Cursor target，不混用 `mapped`/`unsupported`。
  - [x] Regression tests 通过 dependency injection / spies 断言 status 不调用 full validate、file hash scan、remote source resolver、implicit update check、repair planner 或 operation lock checker。
  - [x] 集成测试覆盖未安装 fixture：exit code 0、`CommandResult.status: "success"`、`highLevelHealth: "not-configured"`、next action 包含 `speclite install`。
  - [x] 集成测试覆盖已安装 fixture：manifest present、source/channel/version、manifest version、installed modules、IDE target summary、key paths、compact human-readable output。
  - [x] Fixture snapshots 对 `speclite status --json` 做 deterministic comparison；不得包含 absolute local path、home directory、timestamp、terminal width formatting、ANSI escape、hash-scan-only data 或 platform-specific separators。

- [x] Task 9: 本地验证与范围控制（AC: 1-7）
  - [x] 运行 `npm run build`。
  - [x] 运行 `npm test`，或至少运行 Story 3.1 touched modules 的 focused Vitest tests 与 status integration tests。
  - [x] 重复运行相同 status fixtures 至少 3 次，确认 JSON semantic output 除明确允许字段外保持稳定。
  - [x] 如果前置 implementation 尚未完成，保留失败为有效前置信号；不要伪造 status fixture pass。
  - [x] 检查 diff，确认没有修改 `_bmad-output/planning-artifacts/`、其他 story 文件或无关用户改动。
  - [x] 检查 diff，确认没有实现 full `speclite validate` category coverage、Epic 4 update/repair behavior、Epic 5 remote freshness/provenance checks、Epic 6 full fixture matrix、Post-MVP `doctor` / `sync` / `uninstall` / top-level `repair`、command pointer artifacts 或 branded Copilot/Cursor target。

## Dev Notes（开发备注）

### Current Repository State（当前仓库状态）

- 创建本 Story 时，仓库根目录未发现 `package.json`、`package-lock.json`、`src/`、`test/`、`tests/` 或 root `fixtures/` 实现目录。Story 3.1 的开发必须在 Epic 1 / Epic 2 的实际代码完成后进行。
- `_bmad-output/implementation-artifacts/1-1-cli-install-entry-and-runtime-guard.md` 到 `1-6-install-progress-and-ready-summary.md`，以及 `2-1` 到 `2-5` 当前是 `ready-for-dev` story context，不是完成后的代码证据。
- 当前 worktree 已存在与本 Story 创建无关的 dirty planning artifacts、`sprint-status.yaml` 改动和未跟踪 Epic 1 / Epic 2 story 文件。实现 Story 3.1 时不得格式化、重写、同步或回滚这些无关改动。
- `_bmad-output/project-context.md` 当前仍是初始化占位内容；实际 implementation guardrails 以 live PRD、Architecture、UX、ADR 和 owning SPEC artifacts 为准。
- `assets/source/speclite/` 已存在，并包含 bundled source assets、module metadata、custom stubs、legacy Python resolver scripts 和 canonical skill packages。Status 必须读取 installed projection，不得把 source checkout 当成 installed state。

### Scope Boundary（范围边界）

- 本 Story 只负责 `speclite status` 的 lightweight installed-state summary、`StatusCommandData` projection、high-level health aggregation、target coverage summary、compact human-readable output 和 focused status tests/fixtures。
- 本 Story 不负责：
  - Epic 1 的 CLI scaffold、install source discovery、module selection、config initialization、manifest/index generation、IDE mirror writes 或 install ready summary。
  - Epic 2 的 methodology discovery metadata、skill entry mapping、phase coverage generation、activation target validation、`speclite resolve` runtime support 或 workflow artifact metadata validation。
  - Story 3.2-3.6 的 full `speclite validate` category coverage、issueCounts、checkedCategories、checkedTargets、validatedPaths、validation progress 或 complete issue taxonomy traversal。
  - Epic 4 的 ownership model、update plan、conflict detection、operation lock enforcement、safe write 或 `update --repair` apply behavior。
  - Epic 5 remote source freshness/provenance revalidation、source lockfile lifecycle、enterprise source policy 或 source channel migration。
  - Epic 6 release gate fixture matrix beyond focused status fixtures.
  - Post-MVP `doctor`、`sync`、`uninstall`、top-level `repair`、governance dashboard、coverage percentage、trend report、command pointer artifacts 或 dedicated Copilot/Cursor adapters。

### Architecture Requirements（架构要求）

- Runtime baseline 保持 Node.js 22 minimum 和 Node.js 24 recommended。除非已有 Node 22-compatible path 并同步更新 runtime policy / fixtures，否则不得使用 Node 24-only API。
- CLI foundation 保持 TypeScript + commander。不要为本 Story 引入 oclif/yargs/cac/clipanion。
- Storage model 是 local-first filesystem。不要引入 database、web service、daemon、REST API、GraphQL、desktop UI、persistent cache server 或 background process。
- `src/commands/status.ts` 只负责 orchestration。Manifest/index parsing 属于 `src/manifest/`；source descriptor shape 属于 `src/source/`；target ordering/status mapping 属于 `src/ide/`；public projection 和 rendering 属于 `src/diagnostics/`；path normalization 属于 `src/fs/`。
- command output、issues、manifest/index projections、fixtures 和 tests 中的所有 public paths 必须使用 project-relative POSIX-style paths，除非 owning SPEC 明确标记字段为 non-stable/redacted。
- Human-readable output 与 `--json` output 必须共享同一 semantic model。Renderer modules 不得发明第二套 command status、issue shape、target ordering 或 path policy。

### Implementation Anchors（实现锚点）

需要创建或扩展的 implementation anchors，实际命名应贴合已有实现：

- `src/bin/speclite.ts` 通过 commander 注册 `speclite status`。
- `src/commands/status.ts` 拥有 command orchestration，并返回 `CommandResult<StatusCommandData>`。
- `src/diagnostics/command-result-schema.ts` 拥有 `CommandResult`、`StatusCommandData`、`IdeTargetStatus` 与 command id validation。
- `src/diagnostics/command-result.ts` 拥有 status/exit-code projection，并且必须保持 `highLevelHealth` 独立于 `CommandResult.status`。
- `src/diagnostics/output.ts` 拥有 Compact human-readable status rendering 与 Structured JSON rendering。
- `src/manifest/manifest-schema.ts` / manifest reader 拥有 manifest/index parsing、schema version checks 与 installed modules projection。
- `src/source/source-descriptor-schema.ts` 拥有 `SourceDescriptor` parsing 与 public redaction-safe shape。
- `src/ide/adapter-registry.ts` 拥有 canonical target order 与 status summary type mapping。
- `src/fs/path-normalizer.ts` 拥有 project-relative POSIX path normalization。

如果这些文件已经由前置 stories 创建，修改前必须完整阅读并保留既有行为。如果它们因为前置 stories 尚未实现而不存在，停止 Story 3.1 实现并先完成前置条件，不要构建一个孤立的 status-only scaffold。

### Status Data Contract（Status 数据契约）

最小 `StatusCommandData` shape：

```ts
type StatusCommandData = {
  sourceDescriptor?: SourceDescriptor;
  manifestPresent: boolean;
  manifestVersion?: string;
  installedModules: string[];
  ideTargets: IdeTargetStatus[];
  highLevelHealth: "not-configured" | "configured" | "partial" | "failed";
  paths: CommandPathSummary;
};
```

最小 `IdeTargetStatus` shape：

```ts
type IdeTargetStatus = {
  id: string;
  status: "not-configured" | "configured" | "partial" | "failed";
  targetPath?: string;
  skillCount?: number;
};
```

必需规则：

- `status.data` 不得包含 `issueCounts`。
- `status.data` 不得包含 `checkedCategories`、`checkedTargets` 或 `validatedPaths`。
- `data.paths.projectRoot` 必须是 `"."`。
- `installedModules` 遵守 source manifest module order；如果该顺序不可用，则按 normalized module id 排序。
- `ideTargets` 遵守 adapter registry canonical order。
- `issues` 可以是 `[]`。
- Public JSON 不包含 ANSI、icons、terminal-width formatting、timestamps、absolute paths、home directories、cache paths 或 temporary extraction paths。

### High-Level Health Algorithm（High-Level Health 算法）

严格使用以下 first-match order：

1. `not-configured`: `manifestPresent === false`，且 lightweight status 未发现可读 installed-state manifest。
2. `failed`: manifest/index/source descriptor shape 损坏或不可读，导致 status 无法产生 stable installed summary；或任何 installed/explicitly selected IDE target summary 为 `failed`。
3. `partial`: manifest 可读但 installed summary 不完整，例如 `installedModules` 为空、任一 installed/explicitly selected target 为 `not-configured` 或 `partial`，或 required runtime path summary 缺失。
4. `configured`: manifest、source descriptor、installed modules、required runtime paths 和所有 installed/explicitly selected IDE target summary 都可读且为 configured。

禁止：

- 从 `highLevelHealth` 反推 `CommandResult.status`；
- 从 `CommandResult.status` 反推 `highLevelHealth`；
- 把 `partial` 或 `failed` health 自动转换成 warning issues；
- 把 `issues: []` 当成 health proof；
- 为 status health 读取 file hashes、remote sources、update plans 或 validation category coverage。

### Local-Only And No-Network Boundary（本地只读与无网络边界）

`speclite status` 可以读取：

- `_speclite/_config/manifest.yaml`
- `_speclite/_config/skill-index.json`
- `_speclite/_config/help-index.json`
- `_speclite/_config/files-index.json`，但仅限 lightweight path / presence summary，不做 full hash scan
- `_speclite/_config/phase-coverage.json`，但仅在 lightweight target / phase evidence 需要时读取
- installed state 中已记录的 local source descriptor projection
- `.claude/skills` 与 `.agents/skills` 的存在性或 shallow summary
- `_speclite`、`_speclite-output` 与 configured artifact roots 的 required path presence

`speclite status` 不得：

- 访问 npm registry、private registry、Git remote、offline bundle origin、tarball origin、package-manager cache 或 remote provenance service；
- 执行完整 `speclite validate`；
- 计算 full files-index hash scan；
- 比较 IDE mirrors 之间的 full canonical package hashes；
- 运行 implicit update check 或 repair planning；
- 默认获取或强制 project operation lock；
- 写入、删除、normalize、format 或 repair project files。

### Output UX Requirements（输出体验要求）

- 默认 human-readable `status` 使用 Compact profile，不使用完整 Evidence/Audit report。
- 推荐 compact 顺序：command title、high-level health、source/version、manifest summary、installed modules、IDE targets、key paths、Next actions。
- `not-configured` 输出应克制且明确，并把 `speclite install` 作为主要 next action。
- `partial` 或 `failed` health 应说明 status 是 lightweight summary，并建议运行 `speclite validate` 获取完整 issue details。
- `No issues found` 或空 issue display 不得声称 installation health 通过；health 以 `highLevelHealth` 为准。
- 颜色与符号是可选增强；health、target id、path 和 next action 必须有文本等价表达。

### Testing Requirements（测试要求）

- 单元测试：
  - 覆盖 `highLevelHealth` 四种取值的 aggregation。
  - 覆盖 manifest absent -> `not-configured` success 与 install next action。
  - 覆盖 manifest unreadable / invalid source descriptor -> failed health，除非 command-level read failure 需要 issue，否则不自动产生 warning issue。
  - 覆盖 target ordering `claude` -> `agents`。
  - 覆盖 status target vocabulary 排除 `mapped` 和 install-planning `unsupported`。
  - 覆盖 status JSON 排除 `issueCounts` 和 validate-only fields。
  - 覆盖 public paths normalize 为 project-relative POSIX。
- 集成测试 / fixture 测试：
  - 覆盖 uninstalled fixture 的 status default output 与 `--json`。
  - 覆盖 installed fixture 的 status default output 与 `--json`。
  - 覆盖 partial target fixture。
  - 覆盖 unreadable 或 invalid installed-state shape 的 failed summary fixture。
  - 覆盖重复 status 运行产生 deterministic JSON semantic output。
- 负向测试：
  - status 不调用 remote source access、full hash scan、full validate、update check、repair planner 或 lock enforcement。
  - JSON snapshots 中不得出现 absolute paths、home directory、timestamps、ANSI、icons、terminal-width formatting 或 local cache/temp paths。

### Latest Technical Information（最新技术信息）

本 Story 不需要引入或升级外部依赖。遵守仓库中 Architecture 已固定的平台与契约：

- Node.js 22 LTS minimum，Node.js 24 LTS recommended。
- TypeScript + commander CLI foundation。
- 既有实现使用 runtime schema validation 时，复用 `zod@4.4.3`。
- 复用前置 implementation stories 已选择的 YAML/TOML/CSV parser；不要为了 status-only behavior 添加新 parser。

Story 3.1 是受契约约束的本地摘要能力，不应在本实现中追逐最新 dependency version。如果确实需要 dependency 变更，必须停止并在单独授权的变更中更新 owning Architecture / SPEC / fixtures。

### Project Context Reference（项目上下文引用）

- `_bmad-output/project-context.md` 当前存在，但只包含初始化占位内容。不要把它当作完整 implementation rule source。
- 本 Story 的 live source of truth 是 Epic 3 shard、PRD status/validation FR/NFR、Architecture implementation mapping、UX control-plane guidance，以及 `_bmad-output/planning-artifacts/specs/` 下的 owning SPECs。

## References（参考）

- `_bmad-output/planning-artifacts/epics/06-epic-3-installed-state-and-deterministic-validation已安装状态与确定性验证.md`
- `_bmad-output/planning-artifacts/prd/10-functional-requirements功能需求.md`
- `_bmad-output/planning-artifacts/prd/11-non-functional-requirements非功能需求.md`
- `_bmad-output/planning-artifacts/architecture/03-core-architectural-decisions核心架构决策.md`
- `_bmad-output/planning-artifacts/architecture/04-implementation-patterns-consistency-rules实现模式与一致性规则.md`
- `_bmad-output/planning-artifacts/architecture/05-project-structure-boundaries项目结构与边界.md`
- `_bmad-output/planning-artifacts/ux-design-specification.md`
- `_bmad-output/planning-artifacts/specs/README.md`
- `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md`
- `_bmad-output/planning-artifacts/specs/02-source-descriptor-contract.md`
- `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md`
- `_bmad-output/planning-artifacts/specs/05-ide-adapter-registry-contract.md`
- `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md`
- `assets/source/speclite/core-skills/module.yaml`
- `assets/source/speclite/sdlc-skills/module.yaml`
- `assets/source/speclite/sdlc-skills/module-help.csv`

## Dev Agent Record（开发代理记录）

### Agent Model Used（使用的代理模型）

GPT-5 Codex

### Debug Log References（调试日志引用）

- 2026-05-28: 激活 `bmad-dev-story`；`python3` resolver 因 Python 3.9 缺少 `tomllib` 失败，按 fallback 读取 customize，确认无 team/user override。
- 2026-05-28: 读取 Story 3.1、`sprint-status.yaml`、`_bmad-output/project-context.md` 和当前 worktree 状态；Story 3.1 从 `ready-for-dev` 推进到 `in-progress`。
- 2026-05-28: Red phase 新增 `test/status-command.test.ts`，确认 `src/commands/status.ts` 缺失导致 focused test 失败。
- 2026-05-28: Green/refactor phase 新增 status command、installed-state reader、StatusCommandData schema、compact renderer 和 CLI 注册；focused tests、build、full test suite 均通过。

### Completion Notes List（完成备注列表）

- Story context 由 `bmad-create-story` workflow 创建。
- Ultimate context engine analysis completed - comprehensive developer guide created.
- 已实现 `speclite status` 默认 human-readable 与 `--json` 输出，command id 固定为 `status`，并复用既有 project root resolution。
- 已新增 lightweight installed-state reader，读取 manifest、source descriptor projection、skill-index 和 IDE target shallow summary；未安装项目返回 success + `highLevelHealth: "not-configured"` + install next action。
- 已实现 `highLevelHealth` first-match aggregation，并保持其与 `CommandResult.status`、`issues: []` 独立。
- 已实现 status-layer IDE target summary，按 `claude` -> `agents` 规范顺序输出，使用 `not-configured/configured/partial/failed` 词汇；partial target 提供 `reason` 与 project-relative `affectedPath`。
- 已扩展 `StatusCommandData` / `StatusCommandResult` executable schema，JSON 输出不包含 validate-only fields、timestamp、ANSI、absolute paths 或 hash-scan-only data。
- 已新增 focused Vitest coverage：未安装 fixture、已安装 fixture、partial target、invalid manifest/source descriptor、compact human output、CLI `status --json` 三次确定性输出、health aggregation、reader contract。

### Change Log（变更日志）

- 2026-05-28: 实现 Story 3.1 lightweight install status summary，并将 Story 状态推进到 `review`。

### File List（文件列表）

- `_bmad-output/implementation-artifacts/code-reviews/3-1-code-review/PLAN.md`
- `_bmad-output/implementation-artifacts/code-reviews/3-1-code-review/EXPERIMENTS.md`
- `_bmad-output/implementation-artifacts/code-reviews/3-1-code-review/EXPERIMENT_NOTES.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/implementation-artifacts/stories/3-1-lightweight-install-status-summary.md`
- `src/bin/speclite.ts`
- `src/commands/status.ts`
- `src/diagnostics/command-result-schema.ts`
- `src/diagnostics/output.ts`
- `src/status/installed-state.ts`
- `test/status-command.test.ts`
- `dist/`（`npm run build` 生成/刷新；本轮不提交）
