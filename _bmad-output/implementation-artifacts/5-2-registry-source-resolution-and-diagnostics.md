# Story 5.2: Registry Source Resolution And Diagnostics（Registry 来源解析与诊断）

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story（故事）

作为项目维护者，  
我希望 SpecLite 能从 npm public registry 或 private registry 解析安装来源，  
以便在标准环境或企业内网环境中获得可诊断、可记录、可验证的 registry source。

## Acceptance Criteria（验收标准）

1. **Public registry resolves package and version（Public Registry 解析包与版本）**  
   **前提** 用户选择 npm public registry source；  
   **当** 系统执行 source resolution；  
   **则** 系统会解析 package name、requested version 或 channel，并得到 resolved version；  
   **并且** 记录 registry integrity 或 version-lock evidence。

2. **Private registry uses explicit configuration and redaction（Private Registry 使用显式配置并脱敏）**  
   **前提** 用户选择 private registry source；  
   **当** 系统执行 source resolution；  
   **则** 系统会使用用户显式配置的 registry/channel 信息；  
   **并且** public output 中不得泄露 token、credential-bearing URL 或 private query string。

3. **Resolved registry source becomes SourceDescriptor（已解析 Registry Source 生成 SourceDescriptor）**  
   **前提** registry source 成功解析；  
   **当** 系统生成 SourceDescriptor；  
   **则** descriptor 会包含 source type、resolved version、integrity evidence 和 trust status，registry package identity 只能通过 `integrityEvidence[].packageName` 表示；  
   **并且** npm public/private registry source 不会因为来源类型本身自动成为 `trusted`。

4. **Trust requires expected hash or lock match（信任必须来自 Expected Hash 或 Lock Match）**  
   **前提** expected hash 或 expected lock match 验证成功；  
   **当** 系统计算 trust status；  
   **则** source 可以标记为 `trusted`；  
   **并且** 信任结论必须来自 expected hash 或 lock match，而不是 registry integrity evidence 或 registry 类型。

5. **Resolvable registry source without trust anchor stays unverified（无信任锚的可解析 Registry Source 保持 Unverified）**  
   **前提** registry source 可解析但没有信任锚；  
   **当** source 仍满足最小 integrity evidence 要求；  
   **则** source 可以标记为 `unverified`；  
   **并且** 只有在用户显式选择并确认该 source 后才能进入 install planning。

6. **Registry failures are stable and redacted（Registry 失败稳定且脱敏）**  
   **前提** registry 不可达、认证失败或 package/version 不存在；  
   **当** source resolution 失败；  
   **则** 系统会报告稳定 `source-integrity` issue id，例如 registry unreachable 或 authentication required；  
   **并且** credentials 与 credential-bearing URLs 必须 redacted。

7. **Validate stays local-only（Validate 保持本地只读）**  
   **前提** validate 检查已安装 registry source descriptor；  
   **当** 本地 manifest 中已有 source descriptor；  
   **则** validate 只检查 descriptor 和 integrity evidence shape；  
   **并且** 不重新访问 registry 或执行 remote freshness check。

## Tasks / Subtasks（任务 / 子任务）

- [ ] Task 1: 验证前置实现、工作树和只读边界（AC: 1-7）
  - [ ] 实现前重新检查 root `package.json`、`package-lock.json`、`src/`、`test/`、`tests/`、root `fixtures/` 是否已经由前序 stories 创建。创建本 Story 时这些 TypeScript CLI implementation scaffold 仍不存在；不得把本 ready-for-dev story 当作源码已完成证据。
  - [ ] 确认 Story 5.1 的 source selection、channel/requestedVersion capture、`SourceResolutionPlan.externalAccesses[]`、未确认前 no access/no write、redaction 和 unsupported custom source boundary 是否真实实现；若不存在，先按前序 story 顺序补齐或记录 blocker，不得在本 Story 中绕过 5.1 边界直接访问 registry。
  - [ ] 确认 Story 1.1 CLI/runtime guard、Story 3.5 `CommandResult`/`ValidationIssue`、Story 4.3 plan-before-write、Story 4.4 operation lock/safe write 和 Story 5.1 source descriptor projection anchors 是否真实存在；若不存在，不得创建私有 JSON shape、私有 trust model 或隐藏写入流程。
  - [ ] 检查当前 worktree dirty 状态，保留用户、父 agent 或其他 sub-agent 的 planning artifacts、story 文件、源码和状态文件改动；不得格式化、重写、同步或回滚无关文件。
  - [ ] 修改任何 UPDATE 文件前完整读取该文件，记录 current behavior、data shape、public output、tests 和必须保留的行为。

- [ ] Task 2: 接入 registry source resolution entrypoints（AC: 1-2, 6）
  - [ ] 在 `src/source/` 的既有 source resolver dispatch 中为 `npm` 与 `private-registry` 接入 registry-specific resolver；不要在 `src/commands/install.ts`、reporter、fixture helper 或 validation rule 中复制 registry resolution logic。
  - [ ] 复用 Story 5.1 的 source selection model：`sourceType` 只能是 `npm` 或 `private-registry`，用户输入的 range、dist-tag、tag 或 channel 进入 `requestedVersion` 或 `channel`，resolved package version 只能进入 `version`。
  - [ ] Public npm registry source 使用 npm 默认 registry 语义；private registry source 必须来自用户显式配置的 registry/channel 信息。不得把未配置 private registry 的情况降级为 public registry，也不得隐式猜测企业 registry host。
  - [ ] Registry access 必须发生在 `SourceResolutionPlan` 已声明 external access intent 且用户确认之后；未确认时只展示 package/channel/registry label intent，不访问 registry、不下载 tarball、不获取 operation lock、不写入项目文件。
  - [ ] Registry resolver 只解析 source metadata、resolved version 和 evidence；不得执行 package install、修改 `node_modules`、写 package-lock、运行 lifecycle scripts 或把 npm cache 当成 public artifact。

- [ ] Task 3: 生成 registry SourceDescriptor 与 integrity evidence（AC: 1, 3-5）
  - [ ] `SourceDescriptor.sourceType` 使用 `npm` 或 `private-registry`；`version` 必须是 resolved installed source version；`requestedVersion`/`channel` 保留用户请求的 selector；不要让 requested selector 覆盖 resolved version。
  - [ ] Registry source 成功解析后，`integrityEvidence` 至少包含一个 `registry-integrity` 或 `version-lock` entry。缺少任何可复现 evidence 时，source 必须变成 `blocked` 并产生 `source-integrity.missing-evidence`。
  - [ ] `registry-integrity` evidence 必须包含 `packageName`、resolved `version`、SRI `integrity` 和 `verified`。当 registry metadata 缺失或 shape 不符合 executable schema/parser 时，不得猜测字段；输出稳定 `source-integrity` failure。
  - [ ] `version-lock` evidence 必须只来自明确的 lock/expected source input，`lockPath` 使用 project-relative POSIX path，不得输出 absolute path、home directory、private registry URL 或 npm cache path。
  - [ ] `trustStatus: "trusted"` 只能由 expected hash 或 lock match 成功产生；registry source 不能因为来自 npm public registry、企业 private registry、scope registry 或 auth registry 就自动 trusted。
  - [ ] 可解析且有可复现 evidence、但没有 expected hash 或 lock match 的 registry source 使用 `trustStatus: "unverified"`，并且只能在用户显式选择并确认该 source 后进入 install planning。
  - [ ] Hash mismatch、lock mismatch、evidence verification failure 或 source policy rejection 必须输出 `source-integrity.hash-mismatch`、`source-integrity.lock-mismatch`、`source-integrity.policy-rejected` 或 owning SPEC 中更具体的 issue，并阻止写入。

- [ ] Task 4: 维护 registry diagnostics、redaction 和 public output（AC: 2, 6）
  - [ ] Registry unreachable、proxy/network failure 或 registry metadata 无法读取时使用 `source-integrity.registry-unreachable`；认证失败、缺少 token、权限不足或 auth challenge 使用 `source-integrity.authentication-required`。
  - [ ] Package/version 不存在、unsupported selector 或 npm-compatible registry shape 不满足 MVP resolver 要求时，优先使用 taxonomy 中已有 reserved issue id；没有更具体 id 时使用 `source-integrity.unsupported-source`，不得发明 dynamic issue id。
  - [ ] `ValidationIssue.details` 只保留 deterministic、redaction-safe、fixture-stable fields，例如 `sourceType`、display-safe `packageName`、`requestedVersion`、`channel`、`registryKind` 或 stable failure kind；不得包含 token、credential-bearing URL、private query string、proxy secret、stack trace、timestamp 或 raw exception。
  - [ ] Human-readable output 与 `install --json` 使用同一 redaction policy。Private registry host、registry endpoint、proxy、auth header、token、query string 和 cache/temp path 不得进入 public JSON、manifest/index、fixture snapshot、impact 或 suggested next step。
  - [ ] `impact` 和 `suggestedNextStep` 使用 stable short sentence templates，动态上下文放入 redacted-safe `details`、`component` 或 display-safe source label。
  - [ ] Registry failure 在 operation lock 或 install write planning 前发生时，不得输出假装 planning 完成的 planned writes、changed paths、skipped paths 或 conflicts。

- [ ] Task 5: 保持 install planning、manifest/index 和 validate 边界（AC: 3, 5, 7）
  - [ ] 严格保持 `SourceResolutionPlan -> registry source resolution -> SourceDescriptor -> InstallPlan -> operation lock -> safe write -> CommandResult projection` 顺序。
  - [ ] `--yes` 或 command-level write confirmation 不得自动接受缺少 evidence、mismatched evidence、unsupported selector、private registry auth failure 或 source policy rejection。
  - [ ] Manifest/index 只投影 owning SPEC 允许的 source descriptor fields；不得新增 registry URL、auth status、token scope、raw metadata、npm cache path 或 package manager implementation fields。
  - [ ] `speclite status` 只读取本地 manifest/source descriptor summary；不得执行 registry freshness check、latest version check、provenance revalidation 或 implicit update check。
  - [ ] `speclite validate` 只检查本地 recorded source descriptor、integrity evidence shape、manifest/index、files index、IDE mirrors 和 local hash baseline；不得访问 npm public registry、private registry、proxy 或 remote provenance service。
  - [ ] Registry source descriptor 若已写入 installed state，后续 validate 对 shape mismatch、missing evidence 或 blocked trust state 使用本地 `source-integrity` diagnostics，不通过网络重新判断可达性或最新版本。

- [ ] Task 6: 编写 focused tests 与 registry fixture assertions（AC: 1-7）
  - [ ] Unit tests 覆盖 public registry source：package name + requested version/range/dist-tag/channel 解析、resolved version 写入 `version`、selector 保留在 `requestedVersion`/`channel`、`registry-integrity` evidence 排序和 `trustStatus` 推导。
  - [ ] Unit tests 覆盖 private registry source：显式 registry/channel 配置、auth scoped-to-registry input、display-safe registry label、credential-bearing URL/token/private query redaction。
  - [ ] Unit tests 覆盖 trust matrix：expected hash/lock match -> `trusted`；可复现 evidence 无 trust anchor -> `unverified`；missing evidence、hash mismatch、lock mismatch、unsupported selector -> `blocked`。
  - [ ] Diagnostics tests 覆盖 `source-integrity.registry-unreachable`、`source-integrity.authentication-required`、package/version not found fallback、redaction-safe `details`、stable `impact` 和 `suggestedNextStep`。
  - [ ] JSON contract tests 覆盖 `install --json` 的 `CommandResult<InstallCommandData>`、`data.sourceDescriptor.integrityEvidence`、`issues` 排序、`nextActions` 排序、path policy 和 no private registry leakage。
  - [ ] Validate/status tests 使用已安装 local descriptor fixture，断言不调用 registry client、不访问 network、不做 latest/freshness check。
  - [ ] Fixture assertions 仅覆盖 Story 5.2 registry 范围：`source-integrity/registry-lock-trusted`、`source-integrity/registry-unverified` 以及 `source-integrity/source-unreadable-blocked` 中的 registry unreachable/auth required sub-cases；不要提前实现 Story 5.3 tarball/offline/local path、Story 5.4 Git pinning、Story 5.5 full trust reporting 或 Epic 6 full fixture matrix。
  - [ ] 所有 tests 必须 deterministic、local-only。Registry responses 使用 mocks、local fixture metadata 或 injected client；不得访问 npm registry、private registry、Git remote、offline bundle origin、package-manager cache 或外部网络。

- [ ] Task 7: 本地验证与范围控制（AC: 1-7）
  - [ ] 运行 `npm run build`。
  - [ ] 运行 `npm test`，或至少运行 registry source resolver、source descriptor schema、install plan, diagnostics output, redaction, validate no-network 和 affected registry fixtures 的 focused Vitest tests。
  - [ ] 如果前置 implementation 尚未完成，保留失败为有效前置信号；不要伪造 fixture pass、不要跳过 registry/redaction/no-network tests、不要创建 private JSON shape。
  - [ ] 检查 diff，确认没有修改 `_bmad-output/planning-artifacts/`、Story 5.1、已有 Story 1-4 文件、无关源码或用户改动。
  - [ ] 检查 diff，确认没有提前实现 Story 5.3 tarball/offline/local path、Story 5.4 Git source pinning、Story 5.5 source descriptor full trust reporting、Epic 6 fixture matrix、Post-MVP `doctor` / `sync` / `uninstall` 或完整 source lockfile lifecycle。

## Dev Notes（开发备注）

### Current Repository State（当前仓库状态）

- 创建本 Story 时，仓库根目录未发现 root `package.json`、`package-lock.json`、`src/`、`test/`、`tests/`、root `fixtures/` implementation scaffold。`assets/source/speclite/` 下存在 source skill assets、module metadata、custom examples 和 legacy Python resolver scripts，但它们不是 MVP TypeScript CLI implementation。
- `_bmad-output/implementation-artifacts/1-1` 到 `5-1` 当前是 ready-for-dev story context，不是完成后的源码证据。实现 Story 5.2 前必须重新确认前置 stories 是否已经由其他 agent 添加 actual implementation。
- 当前 worktree 已有与本 Story 创建无关的 dirty planning artifacts、`sprint-status.yaml` 改动和未跟踪 Epic 1-5 story 文件。实现 Story 5.2 时不得格式化、重写、同步或回滚这些无关改动。
- `_bmad-output/project-context.md` 当前仍是初始化占位内容；实际 implementation guardrails 以 live PRD、Architecture、UX、ADR 和 owning SPEC artifacts 为准。
- 本 create-story run 使用 `python3.12 _bmad/scripts/resolve_customization.py --skill .agents/skills/bmad-create-story --key workflow` 成功解析 workflow；裸 `python3` 在本机可能是 3.9.6，不满足 resolver 对 `tomllib` 的要求。

### Scope Boundary（范围边界）

- 本 Story 负责：npm public registry 与 private registry source resolution、package/channel/requestedVersion 到 resolved version 的解析、registry integrity 或 version-lock evidence、registry trust status 推导、registry-specific diagnostics、redaction、install/status/validate no-network 边界和 focused tests。
- 本 Story 消费：
  - Story 5.1 的 source selection、source type display、external access intent、source summary confirmation、redaction policy 和 unsupported source boundary。
  - Story 3.5 的 `CommandResult` / `ValidationIssue` public JSON contract、issue ordering、path policy、timestamp policy 和 `InstallCommandData.sourceDescriptor` projection。
  - Story 4.3 的 plan-before-write、write authorization、planned vs actual result separation 和 Evidence profile output。
  - Story 4.4 的 project operation lock、safe write 和 operation-lock pre-write failure boundary。
  - Source descriptor owning SPEC 的 registry evidence、trust status、source staging/cache redaction 和 validate no-network contract。
- 本 Story 不负责：source selection UI 本身（Story 5.1）、local tarball/offline bundle/local path integrity（Story 5.3）、Git commit pinning/floating source rejection（Story 5.4）、full cross-source trust reporting matrix（Story 5.5）、complete source lockfile lifecycle、enterprise source policy、signatures、provenance verification、allowlists、Post-MVP `doctor`/`sync`/`uninstall` 或 Epic 6 full fixture matrix。

### Architecture Requirements（架构要求）

- Runtime baseline 保持 Node.js 22 minimum 和 Node.js 24 recommended。Node.js official releases 在 2026-05-26 显示 Node 22 与 Node 24 为 LTS、Node 26 为 Current；生产应用应使用 Active LTS 或 Maintenance LTS。不要把 MVP baseline 提升到 Node 26，也不要使用 Node 24-only API，除非提供 Node 22-compatible path 并更新 runtime policy / fixtures。Source: https://nodejs.org/en/about/previous-releases
- CLI foundation 保持 TypeScript + commander。不要为 registry source resolution 引入 oclif/yargs/cac/clipanion，也不要把 resolver 绑定到 commander lifecycle。
- Runtime schema validation 继续使用 architecture-pinned `zod@4.4.3` 与 executable schema/parser anchors。不要为 registry metadata、diagnostics 或 source descriptor 引入新的 schema/runtime validation library。
- Storage model 是 filesystem-first / local-first。不要引入 database、web service、daemon、REST API、GraphQL、desktop UI、persistent registry cache server 或 background process。
- `src/commands/install.ts` 只做 flag/prompt mapping 和 orchestration；registry resolution 属于 `src/source/`；external access planning 属于 `src/installer/` 与 `src/source/` 的 internal planning boundary；public projection/rendering 属于 `src/diagnostics/`；write boundary 属于 `src/installer/` 与 `src/fs/`。
- `src/source/` 是 source/channel abstraction 的唯一领域边界；它把 bundled source、registry、tarball、offline bundle、Git source 和 local path 归一为 canonical source descriptor 或 stable `source-integrity` failure。

### Implementation Anchors（实现锚点）

需要创建或扩展的 implementation anchors，实际命名应贴合已有实现：

- `src/commands/install.ts`：复用 Story 5.1 source selection，传入 registry source request、confirmation state 和 command context，不直接解析 registry metadata。
- `src/source/source-descriptor-schema.ts`：`SourceDescriptor`、`SourceIntegrityEvidence`、`registry-integrity` 和 `version-lock` executable schema/parser anchor。
- `src/source/source-resolver.ts`：source-specific resolver orchestration，dispatch `npm` / `private-registry` 到 registry resolver，并把 failures 归一为 source-integrity issues。
- `src/source/registry-source-resolver.ts` 或等价模块：registry metadata client abstraction、package/channel/version resolution、integrity evidence construction、trustStatus derivation。
- `src/source/source-integrity.ts`：registry failure issue helpers、hash/lock mismatch issue helpers、redaction-safe details builder；不得与 `file-integrity` 混用。
- `src/installer/install-plan-schema.ts`：`SourceResolutionPlan`、`ExternalAccess`、`InstallPlan`、confirmation 和 `writeAuthorized` schema/parser anchor。
- `src/installer/install-runner.ts`：保持 source summary confirmation、registry resolution、install planning、operation lock 和 write/apply 顺序。
- `src/manifest/manifest-schema.ts`：source descriptor installed projection；不得加入未契约化 registry URL/auth/cache fields。
- `src/validation/rules/source-integrity.ts`：validate local source descriptor/evidence shape；不得访问 registry。
- `src/diagnostics/command-result-schema.ts`：`CommandResult<InstallCommandData>`、`ValidationIssue` 和 source descriptor public projection。
- `src/diagnostics/command-result.ts`：status/exit-code derivation、registry issue ordering、nextActions ordering。
- `src/diagnostics/output.ts`：Evidence profile 中的 Source、External Access、Authorization、Issues、Next Actions 和 redaction-safe registry labels。
- `src/fs/path-normalizer.ts`：project-relative POSIX path policy 和 redacted external source diagnostic helpers。
- `test/unit/source/`、`test/integration/install.test.ts`、`test/fixtures/source-integrity/registry-lock-trusted/`、`test/fixtures/source-integrity/registry-unverified/`、`test/fixtures/source-integrity/source-unreadable-blocked/`：registry-focused tests 和 expected outputs。

如果这些文件已经由前置 stories 创建，修改前必须完整读取并保留既有 behavior。如果这些文件尚不存在，按前置 story implementation 顺序补齐或记录 blocker，不要绕过 owning SPECs 创建私有实现。

### Registry Resolution Matrix（Registry 解析矩阵）

| Scenario（场景） | Required Evidence（必要证据） | Trust Outcome（信任结果） | Diagnostics / Notes（诊断 / 备注） |
| --- | --- | --- | --- |
| Public registry package + exact version resolves with expected lock match | `version-lock` 或 matching expected hash；可同时记录 `registry-integrity` | `trusted` | 信任来自 lock/hash match，不来自 public registry 类型。 |
| Public registry package + dist-tag/range/channel resolves with registry SRI only | `registry-integrity` with `verified: false` | `unverified` | `requestedVersion`/`channel` 保留 selector，`version` 写 resolved version；必须由用户显式选择并确认后才能进入 install planning。 |
| Private registry package resolves with expected lock match | `version-lock` 或 matching expected hash；registry label display-safe | `trusted` | Auth token、credential-bearing URL、private query string 不得进入 public output。 |
| Private registry package resolves with registry SRI only | `registry-integrity` with `verified: false` | `unverified` | 不因 enterprise/private registry 类型自动 trusted。 |
| Registry metadata exists but lacks reproducible evidence | none | `blocked` | `source-integrity.missing-evidence`；不得伪造 `contentHash`。 |
| Expected hash or lock mismatches resolved registry package | mismatched evidence | `blocked` | `source-integrity.hash-mismatch` 或 `source-integrity.lock-mismatch`；阻止写入。 |
| Registry unreachable / proxy failure | none | `blocked` | `source-integrity.registry-unreachable`；redacted registry/proxy details。 |
| Auth missing / token invalid / permission denied | none | `blocked` | `source-integrity.authentication-required`；redacted credentials and URLs。 |
| Package/version/selector unsupported or not found | none | `blocked` | 使用已有 reserved issue id；无更具体 id 时用 `source-integrity.unsupported-source`，不得发明 dynamic issue id。 |

### CommandResult And SourceDescriptor Requirements（CommandResult 与 SourceDescriptor 要求）

- `install --json` 必须输出 `CommandResult<InstallCommandData>`，`command: "install"`，`data.paths.projectRoot: "."`。
- `InstallCommandData.sourceDescriptor` 必须遵守 source descriptor SPEC；registry source 不得新增 `registryUrl`、`authToken`、`cachePath`、`metadata`、`distTags`、`tarballUrl` 或 implementation-only fields。
- Registry source descriptor allowed fields：`sourceType`、`channel`、`requestedVersion`、`version`、`integrityEvidence`、`trustStatus`。`resolvedRoot` 只有在有 display-safe source label 且符合 SPEC 时才可出现；registry source 不需要伪造 `contentHash`。
- Registry package identity 通过 `integrityEvidence[].packageName` 表示；不得为满足 AC 额外添加未契约化的 top-level `package` 或 `packageName` field。
- `SourceDescriptor.integrityEvidence` 排序遵守 CommandResult SPEC：registry integrity / version lock -> content hash -> git commit；registry evidence 同 kind 多条按 normalized stable key 排序。
- `ValidationIssue.issueId` 必须是 `<category>.<stable-code>`；不得包含 package name、version、registry host、hash、timestamp、count 或 random id。
- Public JSON 默认不得包含 timestamps；summary、impact、suggestedNextStep 和 nextActions 不得包含 raw path、token、registry URL、hash、stack trace 或环境相关文本。
- Human-readable output 可以解释 registry source，但不得成为 automation-relevant state 的唯一承载位置；automation 依赖必须进入 `CommandResult.data`、`issues`、`nextActions`、manifest/index 或 fixture expected outputs。

### UX / Output Requirements（UX 与输出要求）

- Registry source 访问前必须展示 source type、display-safe package label、requested version/channel、registry kind、reason 和 confirmation state。
- Private registry 输出必须让用户知道“正在访问用户显式配置的 private registry/channel”，但不显示 token、credential-bearing URL、private query string 或 auth header。
- Source summary 语气保持克制、具体、可操作；不要只输出 `done`，也不要把 `unverified` 表述为安全通过。
- `trusted`、`unverified`、`blocked` 必须在 human-readable output 中有文本等价解释；不得只依赖颜色或图标。
- `NO_COLOR`、non-TTY、CI、Windows path portability 和窄终端下，source type、package label、requested selector、resolved version、trustStatus、issueId 和 next action 仍必须纯文本可读。
- Failure output 应把问题组织为 Summary、Source、External Access、Issues、Next Actions；不要显示 raw registry response、stack trace 或 secret-bearing command。

### Previous Story Intelligence（前序 Story 情报）

- Story 5.1 建立了 source selection / external access intent boundary：registry source 在未确认前只能展示 intent，不能访问 registry、下载资源、获取 operation lock 或写入项目文件。Story 5.2 必须继承此顺序。
- Story 5.1 明确 custom source-specific resolver 尚未实现时必须以稳定 `source-integrity` issue 停止写入，而不是伪造 `SourceDescriptor` 成功。Story 5.2 只解除 npm public/private registry 这一范围的 unsupported boundary。
- Story 5.1 的 source selection matrix 已把 `npm` 与 `private-registry` 作为 stable source type values。Story 5.2 不得重命名为 `npm-public`、`registry`、`enterprise-registry` 或其它未契约化枚举。
- Story 5.1 继承了 Story 4.3/4.4 的 planned vs actual、write authorization、operation lock 和 safe write边界；registry resolution failure 如果发生在 lock 前，不得输出 planned writes 或 changed/skipped paths。
- Story 4.6 与 Story 5.1 均强调当前 ready-for-dev story contexts 不是源码完成证据；dev agent 必须重新检查实际 implementation scaffold 与前置 anchors。
- 最近 5 个 commit 均为 docs/context/source/glossary/specs 方向，没有可复用的 TypeScript registry implementation commit pattern。实现必须以 live owning SPEC、previous story contexts 和实际源码为准，不以 docs commits 推断源码已存在。

### Latest Technical Information（最新技术信息）

- Node.js official releases 页面在 2026-05-26 显示 Node 22 和 Node 24 为 LTS、Node 26 为 Current，并说明生产应用应只使用 Active LTS 或 Maintenance LTS。实现保持 `engines.node >=22`、Node 22/24 fixture matrix，不升级到 Node 26。Source: https://nodejs.org/en/about/previous-releases
- npm registry docs 说明 npm 默认使用 public registry `https://registry.npmjs.org`，registry 可配置为兼容 registry，registry URL 会受 package scope 和 `registry` config 影响，auth tokens/certificates scoped to individual registry。实现 private registry source summary 时只能展示 display-safe registry label，不得输出 token 或 credential-bearing URL。Source: https://docs.npmjs.com/cli/v11/using-npm/registry/
- npm package-lock docs 说明 lockfile 描述 exact dependency tree；package entry 的 `resolved` 是实际 resolved source，registry source 通常是 tarball URL，`integrity` 是 unpacked artifact 的 SRI 字符串，`registry.npmjs.org` 在 lockfile 中有 currently configured registry 的特殊语义。Story 5.2 可以消费 lock/integrity 作为 evidence，但不得把 raw tarball URL、custom registry URL 或 cache path暴露为 SourceDescriptor 真源。Source: https://docs.npmjs.com/cli/v8/configuring-npm/package-lock-json/
- No new third-party dependency is required by default. 如果实现需要 registry client abstraction，优先使用 Node 22-compatible APIs 和已有 project-pinned libraries；新增 dependency 前必须确认 package policy、Node 22 support、testability 和 redaction behavior。

### Contract Requirements（契约要求）

- `_bmad-output/planning-artifacts/specs/02-source-descriptor-contract.md` 拥有 `SourceDescriptor`、`SourceIntegrityEvidence`、registry source type rules、trust status、source staging/cache redaction 和 validate no-network boundary。
- `_bmad-output/planning-artifacts/specs/03-install-plan-contract.md` 拥有 `SourceResolutionPlan`、external access、confirmation、`InstallPlan`、`writeAuthorized`、operation lock 和 safe write semantics。
- `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md` 拥有 `CommandResult` envelope、`InstallCommandData`、`ValidationIssue` model、path policy、timestamp policy、ordering 和 fixture comparison policy。
- `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md` 拥有 `source-integrity` category、reserved issue ids、default severity 和 redaction-safe details policy。
- `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md` 拥有 manifest/index installed projection、source descriptor projection、files index ownership/hash 和 fixture update policy。
- `_bmad-output/planning-artifacts/specs/08-fixture-contract.md` 拥有 `source-integrity` registry sub-cases、expected output classes、semantic JSON comparison、snapshot redaction 和 release gate classification。
- `_bmad-output/planning-artifacts/specs/06-resolve-command-contract.md` 只适用于 installed skills 的 config/customization resolve command；registry source resolver 不得复用 `speclite resolve` stdout contract 或把 registry resolution 包进 `CommandResult` exception path。
- ADRs 可以解释决策历史，但不得重新定义 field-level schema、issue taxonomy、fixture layout、command payload 或 implementation anchors。若 ADR 与 owning SPEC 冲突，follow owning SPEC。

### Testing Requirements（测试要求）

- Use Vitest。
- Tests 必须 deterministic、local-only，不访问 npm registry、private registry、Git remote、offline bundle origin、package-manager cache 或外部网络。
- 使用 injected registry client、mock fetch 或 local fixture metadata 构造 registry resolution cases。不要使用当前 repo 的 `_bmad` 或 `_bmad-output` 作为 installed target state。
- JSON tests 必须 parse 后断言 semantic fields。不要比较 raw pretty-printed JSON bytes，除非 formatting 本身是测试目标。
- Redaction tests 必须覆盖 token、Bearer/basic auth、credential-bearing URL、private query string、proxy secret、private registry host、npm cache path、temporary path、home directory 和 stack trace。
- Validate/status no-network tests 必须通过 mock/spies 证明 registry client 未被调用；不能只依赖没有网络配置。
- Fixture snapshots 必须 normalize 或 exclude timestamps、duration、operation-lock volatile fields、temporary paths、environment-specific paths、home directory 和 generated metadata timestamps。

### Project Context Reference（项目上下文引用）

- `_bmad-output/project-context.md` currently contains initialized metadata and placeholder sections only; it does not add implementation rules beyond live PRD, Architecture, UX, ADR and owning SPEC artifacts.
- The project-level language rule remains: conversation and generated docs in Chinese, section headings in `English（中文）` form, technical identifiers in English.

### References（参考）

- `_bmad-output/planning-artifacts/epics/08-epic-5-source-integrity-and-distribution-channels来源完整性与分发渠道.md`
- `_bmad-output/implementation-artifacts/5-1-source-selection-and-channel-summary.md`
- `_bmad-output/implementation-artifacts/4-6-explicit-repair-for-recoverable-installer-owned-drift.md`
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
- `_bmad-output/planning-artifacts/specs/06-resolve-command-contract.md`
- `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md`
- `_bmad-output/planning-artifacts/specs/08-fixture-contract.md`
- `_bmad-output/planning-artifacts/adr/0004-source-descriptor-trust-model.md`
- `_bmad-output/planning-artifacts/adr/0005-manifest-index-contract-boundary.md`
- `_bmad-output/planning-artifacts/adr/0006-validation-issue-taxonomy-boundary.md`
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

- Story context created by bmad-create-story sub-agent for Story 5.2 only.
- Ultimate context engine analysis completed - comprehensive developer guide created.

### File List（文件列表）

TBD by dev agent.
