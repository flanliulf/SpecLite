# Story 5.1: Source Selection And Channel Summary（来源选择与 Channel 摘要）

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story（故事）

作为项目维护者，
我希望在安装过程中选择 SpecLite 的安装来源和 channel，
以便明确本次安装使用默认 bundled source，还是来自 npm registry、本地包、离线包、Git source 或本地路径，并在写入前确认来源摘要。

## Acceptance Criteria（验收标准）

1. **Available source options are explicit（可用来源选项明确展示）**
   **前提** 用户运行 `speclite install` 并进入来源选择阶段；
   **当** 系统展示可用来源选项；
   **则** 用户可以选择默认 `bundled` source，或选择 npm public registry、private registry、local tarball、offline bundle、Git source 或 local path；
   **并且** 每种来源都以清晰的 source type 展示。

2. **Bundled source summary is display-safe（Bundled 来源摘要可安全展示）**
   **前提** 用户选择默认来源；
   **当** 系统生成安装来源摘要；
   **则** 摘要会显示 source type 为 `bundled`，canonical tree 来自 package 内 `assets/source/speclite/`，并展示 display-safe resolved root；
   **并且** 不会隐式访问未声明的远程 source。

3. **Custom source input records request before resolution（自定义来源解析前记录请求）**
   **前提** 用户选择自定义来源；
   **当** 系统收集 source 输入；
   **则** 系统会记录 requested source、requested version 或 requested channel；
   **并且** 在解析前展示 external access intent 和需要确认的原因。

4. **Resolved source appears in install summary and JSON（已解析来源进入安装摘要和 JSON）**
   **前提** source resolution 完成；
   **当** 系统生成 install summary 或 `install --json` 输出；
   **则** 输出包含 source type、channel、requested version、resolved version 或可展示的 source label；
   **并且** 不泄露 credential-bearing URL、home directory 或本机 absolute source path。

5. **No unconfirmed source access or writes（未确认前不访问外部来源或写入）**
   **前提** 用户尚未确认来源摘要；
   **当** 系统准备进入 install planning；
   **则** 不得访问未确认的外部 source 或下载额外资源；
   **并且** 不得写入任何项目文件。

6. **Invalid source or channel fails diagnostically（非法来源或 Channel 以可诊断方式失败）**
   **前提** 来源选择或 channel 输入不合法；
   **当** 系统无法继续 source resolution；
   **则** 命令输出明确失败原因和建议下一步；
   **并且** 使用稳定 `source-integrity` issue category 或对应 command-level diagnostic。

## Tasks / Subtasks（任务 / 子任务）

- [ ] Task 1: 验证前置实现、工作树和只读边界（AC: 1-6）
  - [ ] 实现前重新检查 root `package.json`、`package-lock.json`、`src/`、`test/`、`tests/`、root `fixtures/` 是否已经由前序 stories 创建。创建本 Story 时这些 TypeScript CLI implementation scaffold 仍不存在；不得把本 ready-for-dev story 当作源码已完成证据。
  - [ ] 确认 Story 1.1 CLI/diagnostics scaffold、Story 1.3 bundled source module selection、Story 1.6 install progress/ready summary、Story 3.5 `CommandResult`/`ValidationIssue`、Story 4.3 plan-before-write 和 Story 4.4 operation lock/safe write anchors 是否真实存在；若不存在，停止并按前置 story 顺序补齐或记录 blocker，不得在本 Story 中创建私有 JSON shape 或私有 source model。
  - [ ] 检查当前 worktree dirty 状态，保留用户、父 agent 或其他 sub-agent 的 planning artifacts、story 文件、源码和状态文件改动；不得格式化、重写、同步或回滚无关文件。
  - [ ] 修改任何 UPDATE 文件前完整读取该文件，记录 current behavior、data shape、public output、tests 和必须保留的行为。

- [ ] Task 2: 建立 install source selection model（AC: 1, 3, 6）
  - [ ] 在 `src/source/` 的既有 source descriptor / resolver anchor 中集中定义 source selection 输入模型；不得在 prompt、command parser、JSON reporter 或 fixture helper 中复制 source type 枚举。
  - [ ] 支持 MVP source types：`bundled`、`npm`、`private-registry`、`local-tarball`、`offline-bundle`、`git`、`local`，并把 UI 文案或 CLI 输入归一到这些 stable source type values。
  - [ ] 记录 `requestedSourceValue`、`requestedVersion` 或 `channel` 时只保存在 private planning state 或 display-safe projection 中；raw credential-bearing URL、token、本机 absolute path、cache path、temporary extraction path 不得进入 public JSON、manifest/index、fixture snapshot 或 `ValidationIssue.details`。
  - [ ] Channel/version 输入必须区分 `requestedVersion` 和 resolved `version`；range、dist-tag、tag、branch 或用户输入 selector 不得覆盖 resolved installed version。
  - [ ] 对非法 source type、非法 selector、空必填输入或当前阶段尚未实现的 source-specific resolver，输出稳定 `source-integrity` issue，优先使用 taxonomy 中已有 issue id；不得以 free-form issue id 或 raw parser error 结束。

- [ ] Task 3: 生成 SourceResolutionPlan 与 external access intent（AC: 3, 5）
  - [ ] 在 source resolution 前生成 internal `SourceResolutionPlan`，包含 `requestedSourceType`、display-safe `requestedSourceValue`、`externalAccesses[]`、`requiresConfirmation` 和 `confirmed`。
  - [ ] `bundled` source 不声明 network/registry/remote Git external access；canonical tree label 固定为 display-safe `assets/source/speclite`。
  - [ ] npm public/private registry source 在真正访问 registry 前必须声明 registry/package/version 或 channel intent，并说明访问原因；private registry 的 host/registry label 必须 redacted，不显示 token、credential-bearing URL 或 private query string。
  - [ ] local tarball、offline bundle、Git source 和 local path 在进入 source-specific resolution 前必须展示访问/读取 intent；本 Story 只建立 selection + intent + summary 边界，不实现 Story 5.2-5.4 的深度 resolution/trust rules。
  - [ ] 未确认来源摘要时不得访问 registry、Git remote、tarball/offline bundle origin 或读取/解包 project-external source；也不得获取 operation lock 或写入项目文件。

- [ ] Task 4: 输出 bundled source summary 与 install summary projection（AC: 2, 4）
  - [ ] `bundled` source 作为默认选项时，install summary human-readable output 必须展示 source type、display-safe resolved root、selected channel/version（如存在）和 no external access。
  - [ ] `install --json` 必须使用 `CommandResult<InstallCommandData>`，并通过 `data.sourceDescriptor` 投影 resolved source；不得新增未契约化 `readySummary` blob、`sourceSummary` blob 或 automation-only 字段。
  - [ ] `data.sourceDescriptor.sourceType`、`channel`、`requestedVersion`、`version`、`resolvedRoot`、`contentHash`、`integrityEvidence` 和 `trustStatus` 的字段语义必须遵守 source descriptor SPEC；本 Story 不得定义第二套 trust/evidence 规则。
  - [ ] 当 custom source 被选择但 source-specific resolver 尚未由 Story 5.2-5.5 实现时，命令必须在写入前失败并给出 `source-integrity.unsupported-source` 或更具体 reserved issue；不得伪造 `SourceDescriptor` 成功或写入 half-installed state。
  - [ ] Human-readable output 使用 Evidence profile：Summary、Source、External Access、Authorization、Issues、Next Actions；automation 依赖必须仍在 `CommandResult.data`、`issues` 或 `nextActions` 中。

- [ ] Task 5: 保持 install planning、write authorization 和 operation lock 边界（AC: 5）
  - [ ] 严格保持 `SourceResolutionPlan -> InstallPlan -> operation lock -> safe write -> CommandResult projection` 顺序。
  - [ ] `--yes` 或 interactive confirmation 只能授权 command-level writes；不得自动接受 unverified source、floating Git source、unsupported source、failed evidence verification 或 source policy rejection。
  - [ ] `--dry-run`、pending confirmation 和 script mode without `--yes` 必须保留真实 plan、`writeAuthorized: false`、`changedPaths: []`、`skippedPaths: []`；不得把 planned actions 改写为 `skip:not-authorized`。
  - [ ] 在 source selection / source summary 阶段不得修改 `_speclite/`、IDE mirrors、manifest/index、`_speclite-output/` 或 human-owned TOML。
  - [ ] 如果 command 在 operation lock 前因 source selection/source integrity 失败，public JSON 不得输出假装 planning 完成的 planned writes、changed paths、skipped paths 或 conflicts。

- [ ] Task 6: 实现 redaction 与 path policy（AC: 3-4, 6）
  - [ ] 所有 public path fields 使用 project-relative POSIX path；project-external source 使用 display-safe label 或 redacted diagnostic object，不输出 absolute path、home directory、drive letter 或 OS-specific separator。
  - [ ] Registry endpoint、proxy、private registry host、Git remote、tarball/offline bundle/local path display 必须 redacted；credentials、tokens、private query strings 和 cache/temp paths 不得进入 JSON、manifest/index、fixture snapshot、impact 或 suggestedNextStep。
  - [ ] `ValidationIssue.details` 只保留 deterministic、redaction-safe、fixture-stable fields；动态原始输入放在 private state 或 redacted display label。
  - [ ] Human-readable output 遵守同一 redaction/display-safe policy，不能因为不是 JSON 就显示 raw URL 或本机路径。

- [ ] Task 7: 编写 focused tests 与 fixture assertions（AC: 1-6）
  - [ ] Unit tests 覆盖 source type normalization、default `bundled` selection、custom source input capture、channel/requestedVersion separation 和 invalid input diagnostics。
  - [ ] Unit tests 覆盖 `SourceResolutionPlan.externalAccesses[]`：bundled 无 external access；registry/Git/tarball/offline/local source 在未确认前只输出 intent，不访问外部来源。
  - [ ] JSON contract tests 覆盖 `install --json` 的 `CommandResult<InstallCommandData>`、`data.sourceDescriptor`、stable `command: "install"`、`data.paths.projectRoot: "."`、issue sorting 和 nextActions ordering。
  - [ ] Redaction tests 覆盖 credential-bearing URL、private registry token、home directory、local absolute path、npm cache path、temporary extraction path 和 Git credential URL 不进入 public JSON、human-readable output 或 fixture snapshots。
  - [ ] Fixture tests 覆盖 `fresh-install-empty-project` 的 bundled source summary、ready summary gate，以及 `source-integrity` group 中与 selection/summary 直接相关的 redaction/unsupported-source cases；Story 5.2-5.5 再补 registry/tarball/Git/local path 深度 trust/evidence sub-cases。
  - [ ] 所有 tests 必须 deterministic、local-only，不访问 npm registry、private registry、Git remote、offline bundle origin、package-manager cache 或外部网络；source-specific resolution 用 mocks 或 local fixture input。

- [ ] Task 8: 本地验证与范围控制（AC: 1-6）
  - [ ] 运行 `npm run build`。
  - [ ] 运行 `npm test`，或至少运行 source selection、source descriptor schema、install plan、diagnostics output、redaction、path policy 和 affected fixtures 的 focused Vitest tests。
  - [ ] 如果前置 implementation 尚未完成，保留失败为有效前置信号；不要伪造 fixture pass、不要跳过 source selection/redaction tests、不要创建 private JSON shape。
  - [ ] 检查 diff，确认没有修改 `_bmad-output/planning-artifacts/`、无关 Story 文件、无关源码或用户改动。
  - [ ] 检查 diff，确认没有提前实现 Story 5.2 registry resolution、Story 5.3 tarball/offline/local integrity、Story 5.4 Git pinning、Story 5.5 trust status full reporting、Epic 6 fixture matrix全量范围或 Post-MVP `doctor` / `sync` / `uninstall`。

## Dev Notes（开发备注）

### Current Repository State（当前仓库状态）

- 创建本 Story 时，仓库根目录未发现 root `package.json`、`package-lock.json`、`src/`、`test/`、`tests/`、root `fixtures/` implementation scaffold。`assets/source/speclite/` 下存在 source skill assets、module metadata、custom examples 和 legacy Python resolver scripts，但它们不是 MVP TypeScript CLI implementation。
- `_bmad-output/implementation-artifacts/1-1` 到 `4-6` 当前是 ready-for-dev story context，不是完成后的源码证据。实现 Story 5.1 前必须重新确认前置 stories 是否已经由其他 agent 添加 actual implementation。
- 当前 worktree 已有与本 Story 创建无关的 dirty planning artifacts、`sprint-status.yaml` 改动和未跟踪 Epic 1-4 story 文件。实现 Story 5.1 时不得格式化、重写、同步或回滚这些无关改动。
- `_bmad-output/project-context.md` 当前仍是初始化占位内容；实际 implementation guardrails 以 live PRD、Architecture、UX、ADR 和 owning SPEC artifacts 为准。
- 本 create-story run 使用 `python3.12 _bmad/scripts/resolve_customization.py --skill .agents/skills/bmad-create-story --key workflow` 成功解析 workflow；裸 `python3` 在本机可能是 3.9.6，不满足 resolver 对 `tomllib` 的要求。

### Scope Boundary（范围边界）

- 本 Story 负责：install 过程的 source selection、source type display、channel/requestedVersion capture、source summary、external access intent、未确认前 no access/no write、install summary/`install --json` 中的 source descriptor projection、redaction 和 invalid source diagnostics。
- 本 Story 消费：
  - Story 1.1 的 TypeScript CLI skeleton、diagnostics schema anchor、fixture/test scaffold 和 Node runtime guard。
  - Story 1.3 的 official module selection 和 bundled source asset discovery baseline。
  - Story 1.6 的 install progress、ready summary、completed/pending steps 和 human-readable output flow。
  - Story 3.5 的 `CommandResult` / `ValidationIssue` public JSON contract。
  - Story 4.3 的 plan-before-write、write authorization 和 planned vs actual result separation。
  - Story 4.4 的 project operation lock 与 safe write primitives。
- 本 Story 不负责：registry package resolution/integrity（Story 5.2）、tarball/offline bundle/local path integrity（Story 5.3）、Git commit pinning（Story 5.4）、full `SourceDescriptor.trustStatus` reporting matrix（Story 5.5）、完整 source lockfile lifecycle、enterprise source policy、signatures、provenance allowlists、Post-MVP `doctor`/`sync`/`uninstall` 或 top-level `speclite repair`。
- Story 5.1 不得通过临时字段绕过后续 stories。对尚未实现的 source-specific resolver，必须以稳定 issue 停止写入，而不是声称安装成功。

### Architecture Requirements（架构要求）

- Runtime baseline 保持 Node.js 22 minimum 和 Node.js 24 recommended。Node.js official releases 在 2026-05-26 显示 Node 22 与 Node 24 为 LTS、Node 26 为 Current；生产应用应使用 Active/Maintenance LTS。不要把 MVP baseline 提升到 Node 26，也不要使用 Node 24-only API，除非提供 Node 22-compatible path 并更新 runtime policy / fixtures。Source: https://nodejs.org/en/about/previous-releases
- CLI foundation 保持 TypeScript + commander。不要为本 Story 引入 oclif/yargs/cac/clipanion，也不要把 source selection 逻辑绑定到 CLI framework lifecycle。
- Runtime schema validation 继续使用 architecture-pinned `zod@4.4.3` 与 executable schema/parser anchors。不要为 source selection 或 diagnostics 引入新的 schema/runtime validation library。
- Storage model 是 filesystem-first / local-first。不要引入 database、web service、daemon、REST API、GraphQL、desktop UI、persistent cache server 或 background process。
- `src/commands/install.ts` 只做参数解析、prompt/flag mapping、command context 和 orchestration；source type validation、redaction、external access plan 和 descriptor creation 属于 `src/source/`；public projection/rendering 属于 `src/diagnostics/`；write boundary 属于 `src/installer/` 与 `src/fs/`。
- `src/source/` 是 source/channel abstraction 的唯一领域边界；它把 bundled source、registry、tarball、offline bundle、Git source 和 local path 归一为 canonical source descriptor 或 stable source-integrity failure。

### Implementation Anchors（实现锚点）

需要创建或扩展的 implementation anchors，实际命名应贴合已有实现：

- `src/commands/install.ts`：进入 source selection，收集/映射 source 输入，调用 source planner/resolver，维护 no access/no write before confirmation。
- `src/source/source-descriptor-schema.ts`：`SourceDescriptor` 与 `SourceIntegrityEvidence` executable schema/parser anchor。
- `src/source/source-resolver.ts`：source-specific resolver orchestration；本 Story 只要求 bundled path 和 resolver dispatch/unsupported failure boundary。
- `src/source/source-selection.ts` 或等价模块：source type enum、channel/requestedVersion capture、display-safe source labels 和 invalid input diagnostics。
- `src/source/source-integrity.ts`：source integrity issue construction helpers；不得与 `file-integrity` 混用。
- `src/installer/install-plan-schema.ts`：`SourceResolutionPlan`、`InstallPlan`、`ExternalAccess`、`PlannedWrite` 和 write authorization schema/parser anchor。
- `src/installer/install-runner.ts`：保持 source summary confirmation、install planning、operation lock 和 write/apply 顺序。
- `src/installer/progress-events.ts`：包含 `source-discovery` step；progress `stepId` 必须 stable lower-kebab。
- `src/installer/ready-summary.ts`：安装成功后显示 source descriptor、manifest version、installed modules、IDE targets、paths 和 next commands，不输出未契约化 automation blob。
- `src/diagnostics/command-result-schema.ts`：`CommandResult<InstallCommandData>`、`ValidationIssue`、`SourceDescriptor` public projection。
- `src/diagnostics/command-result.ts`：status/exit-code derivation、issue ordering、nextActions ordering。
- `src/diagnostics/output.ts`：Evidence profile source summary、External Access、Authorization、Issues、Next Actions、redaction-safe human output。
- `src/fs/path-normalizer.ts`：project-relative POSIX path policy 和 project-external redaction helpers。
- `test/fixtures/fresh-install-empty-project/`、`test/fixtures/source-integrity/`：source selection summary、redaction 和 no access/no write fixture assertions。

如果这些文件已经由前置 stories 创建，修改前必须完整读取并保留既有 behavior。如果这些文件尚不存在，按前置 story implementation 顺序补齐或记录 blocker，不要绕过 owning SPECs 创建私有实现。

### Source Selection Matrix（来源选择矩阵）

| Source Type（来源类型） | Selection Requirement（选择要求） | External Access Intent（外部访问意图） | Story 5.1 Outcome（Story 5.1 结果） |
| --- | --- | --- | --- |
| `bundled` | 默认选项；canonical tree label 为 `assets/source/speclite` | 不需要 network/registry/remote Git access | 可生成 display-safe summary 和 source descriptor projection；packaging trust evidence 细节遵守 source descriptor SPEC。 |
| `npm` | 记录 package/channel/requested version | 访问 public npm registry 前必须展示 intent | 本 Story 建立 selection + intent + redacted summary；resolution/integrity 由 Story 5.2 完成。 |
| `private-registry` | 记录 display-safe registry label、package/channel/requested version | 访问 private registry 前必须展示 intent；auth scoped to registry | 不显示 token/credential URL；resolution/integrity 由 Story 5.2 完成。 |
| `local-tarball` | 记录 display-safe tarball label 或 redacted path | 读取 tarball 前必须展示 intent | 不泄露 absolute path；artifact hash/integrity 由 Story 5.3 完成。 |
| `offline-bundle` | 记录 display-safe bundle label 或 redacted path | 读取/解包 bundle 前必须展示 intent | 不泄露 cache/temp extraction path；integrity 由 Story 5.3 完成。 |
| `git` | 记录 redacted remote label、requested ref/channel | 访问 remote Git 前必须展示 intent | 不接受 floating source 为可写入成功；commit pinning 由 Story 5.4 完成。 |
| `local` | 记录 display-safe local source label | 读取 local source 前必须展示 intent；必须先做 self-reference guard | 不泄露 local absolute path；snapshot hash/self-reference details 由 Story 5.3 完成。 |

### CommandResult And InstallPlan Requirements（CommandResult 与 InstallPlan 要求）

- `install --json` 必须输出 `CommandResult<InstallCommandData>`，`command: "install"`，`data.paths.projectRoot: "."`。
- `InstallCommandData` 必填字段保持：`sourceDescriptor`、`manifestVersion`、`installedModules`、`ideTargets`、`paths`、`completedSteps`、`pendingSteps`。不得新增未契约化 required fields。
- `SourceDescriptor` public projection 只能使用 SPEC 字段：`sourceType`、`channel`、`requestedVersion`、`version`、`resolvedRoot`、`contentHash`、`integrityEvidence`、`trustStatus`。
- `SourceResolutionPlan` 是 internal planning contract，MVP 不要求进入 public command JSON；human-readable output 可以展示 redacted external access intent，但 automation 依赖必须来自 `CommandResult`、issues、nextActions 或 installed file contracts。
- `SourceResolutionPlan.externalAccesses[].sourceValue` 必须 display-safe；raw source locators 只能存在于 private in-memory state。
- `status` 与 `validate` 后续读取 source descriptor 时不得做 remote freshness check；validate 只检查本地记录的 source descriptor/evidence shape、manifest/index、files index、IDE mirrors 和 local hash baseline。

### UX / Output Requirements（UX 与输出要求）

- 默认 human-readable install output 使用 Evidence profile：先 Summary，再 Source / External Access / Authorization evidence，再 Issues，最后 Next Actions。
- 来源摘要语气必须克制、具体、可操作；不要只输出 `done` 或夸张成功语气。
- 每个可能访问外部 source 的选择都要在访问前显示 source type、display-safe source label、reason 和 confirmation state。
- Severity、issue id、source type、authorization state 和 next action 必须文本可见；不得只依赖颜色或符号。
- `NO_COLOR`、non-TTY、CI、Windows path portability 和窄终端下，source label、reason、issueId、next action 和是否需要确认仍必须纯文本可读。
- Human-readable output 不得成为 automation 依赖字段的唯一承载位置。

### Latest Technical Information（最新技术信息）

- Node.js official releases 页面在 2026-05-26 显示 Node 22 和 Node 24 为 LTS、Node 26 为 Current，并说明生产应用应只使用 Active LTS 或 Maintenance LTS。实现保持 `engines.node >=22`、Node 22/24 fixture matrix，不升级到 Node 26。Source: https://nodejs.org/en/about/previous-releases
- npm registry docs 说明 npm 默认使用 public registry，registry 可通过配置切换，package scope 会影响 registry URL，auth tokens/certificates scoped to individual registry。实现 private registry source summary 时只能展示 display-safe registry label，不得输出 token 或 credential-bearing URL。Source: https://docs.npmjs.com/cli/v11/using-npm/registry/
- npm package-lock docs 说明 lockfile 描述 exact dependency tree；package entries 的 `resolved` 可能是 registry tarball URL、Git URL with commit SHA 或 link target，`integrity` 是 unpacked artifact 的 SRI 字符串。Story 5.1 不直接把 lockfile 字段当成 SpecLite source descriptor 真源；registry lock/evidence 语义由 Story 5.2 和 source descriptor SPEC 管理。Source: https://docs.npmjs.com/cli/v8/configuring-npm/package-lock-json/

### Previous Story Intelligence（前序 Story 情报）

- Story 4.6 明确 ready-for-dev story context 不是源码完成证据，并要求实现前重新检查 root scaffold 与前置 anchors。Story 5.1 必须继承这一前置检查。
- Story 4.6 强调 CommandResult、planned vs actual result、operation lock、safe write 和 reason code producer/consumer 分离。Story 5.1 虽然不是 repair story，也必须保持 no write before confirmation、no private JSON shape 和 redaction-safe diagnostics。
- Epic 5 是 source integrity and distribution channels 的第一条 story；不存在 Epic 5 前序 implementation learnings。后续 Story 5.2-5.5 需要复用本 Story 的 source selection / external access intent boundary，而不是重新定义 source type 输入。

### Git Intelligence Summary（Git 历史摘要）

- 最近 5 个 commit 均为 docs/context/source/glossary/specs 方向，没有可复用的 TypeScript implementation commit pattern。
- 当前仓库规划文档中已经固化 source descriptor、manifest/index、validation issue taxonomy 和 fixture contract；实现必须以 live owning SPEC 为真源，不以 archive 或历史 research 替代。

### Contract Requirements（契约要求）

- `_bmad-output/planning-artifacts/specs/02-source-descriptor-contract.md` 拥有 `SourceDescriptor`、`SourceIntegrityEvidence`、source type rules、trust status、source staging/cache redaction 和 validate no-network boundary。
- `_bmad-output/planning-artifacts/specs/03-install-plan-contract.md` 拥有 `SourceResolutionPlan`、`InstallPlan`、external access、confirmation、`writeAuthorized`、operation lock 和 safe write semantics。
- `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md` 拥有 `CommandResult` envelope、`InstallCommandData`、`ValidationIssue` model、path policy、timestamp policy、ordering 和 fixture comparison policy。
- `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md` 拥有 `source-integrity` category、reserved issue ids、default severity 和 redaction-safe details policy。
- `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md` 拥有 manifest/index installed projection、source descriptor projection、files index ownership/hash 和 fixture update policy。
- `_bmad-output/planning-artifacts/specs/08-fixture-contract.md` 拥有 `fresh-install-empty-project`、`source-integrity` group、expected output classes、semantic JSON comparison、snapshot redaction 和 release gate classification。
- ADRs 可以解释决策历史，但不得重新定义 field-level schema、issue taxonomy、fixture layout、command payload 或 implementation anchors。若 ADR 与 owning SPEC 冲突，follow owning SPEC。

### Testing Requirements（测试要求）

- Use Vitest。
- Tests 必须 deterministic、local-only，不访问 npm registry、private registry、Git remote、offline bundle origin、package-manager cache 或外部网络。
- 使用 temporary target projects 构造 install source selection cases。不要使用当前 repo 的 `_bmad` 或 `_bmad-output` 作为 installed target state。
- JSON tests 必须 parse 后断言 semantic fields。不要比较 raw pretty-printed JSON bytes，除非 formatting 本身是测试目标。
- Human-readable output tests 必须覆盖 `NO_COLOR`、non-TTY、CI 和窄终端 fallback，确保 source type、issue id、authorization state、redacted source label 和 next action 不丢失。
- Fixture snapshots 必须 normalize 或 exclude timestamps、duration、operation-lock volatile fields、temporary paths、environment-specific paths、home directory 和 generated metadata timestamps。
- Redaction tests 必须覆盖 credentials、credential-bearing URL、private query string、npm cache path、temporary extraction path、local absolute path 和 Git remote secrets。

### References（参考资料）

- `_bmad-output/planning-artifacts/epics/08-epic-5-source-integrity-and-distribution-channels来源完整性与分发渠道.md`
- `_bmad-output/planning-artifacts/prd/08-developer-tool-specific-requirements开发者工具特定需求.md`
- `_bmad-output/planning-artifacts/prd/10-functional-requirements功能需求.md`
- `_bmad-output/planning-artifacts/prd/11-non-functional-requirements非功能需求.md`
- `_bmad-output/planning-artifacts/architecture/03-core-architectural-decisions核心架构决策.md`
- `_bmad-output/planning-artifacts/architecture/04-implementation-patterns-consistency-rules实现模式与一致性规则.md`
- `_bmad-output/planning-artifacts/architecture/05-project-structure-boundaries项目结构与边界.md`
- `_bmad-output/planning-artifacts/ux-design-specification.md`
- `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md`
- `_bmad-output/planning-artifacts/specs/02-source-descriptor-contract.md`
- `_bmad-output/planning-artifacts/specs/03-install-plan-contract.md`
- `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md`
- `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md`
- `_bmad-output/planning-artifacts/specs/08-fixture-contract.md`
- `_bmad-output/project-context.md`
- Node.js releases: https://nodejs.org/en/about/previous-releases
- npm registry docs: https://docs.npmjs.com/cli/v11/using-npm/registry/
- npm package-lock docs: https://docs.npmjs.com/cli/v8/configuring-npm/package-lock-json/

## Dev Agent Record（开发代理记录）

### Agent Model Used（使用的代理模型）

TBD by dev agent.

### Debug Log References（调试日志引用）

TBD by dev agent.

### Completion Notes List（完成备注列表）

- Story context created by bmad-create-story workflow.
- Ultimate context engine analysis completed - comprehensive developer guide created.

### File List（文件列表）

TBD by dev agent.
