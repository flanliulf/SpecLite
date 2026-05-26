# Story 5.4: Git Source Pinning And Floating Source Rejection（Git 来源固定与浮动来源拒绝）

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story（故事）

作为项目维护者，  
我希望从 Git source 安装 SpecLite 时必须固定到具体 commit SHA，  
以便安装结果可复现，并避免 branch、tag 或 remote URL 浮动导致不可审查的安装状态。

## Acceptance Criteria（验收标准）

1. **Git source resolves remote, requested ref and commit SHA（Git Source 解析 Remote、Requested Ref 与 Commit SHA）**  
   **前提** 用户选择 Git source；  
   **当** 系统执行 source resolution；  
   **则** 系统会解析 remote、requested ref 和 resolved commit SHA；  
   **并且** 只有 resolved commit SHA 存在时才允许进入 install planning。

2. **Floating Git sources are blocked before planning（浮动 Git Source 在规划前被阻断）**  
   **前提** 用户只提供 remote URL、branch 或 tag；  
   **当** 系统无法固定到具体 commit SHA；  
   **则** source 必须被标记为 `blocked`；  
   **并且** 不得进入 install planning 或写入步骤。

3. **Git commit evidence is recorded without selector override（记录 Git Commit 证据且 Selector 不覆盖结果）**  
   **前提** Git source 成功解析到 commit SHA；  
   **当** 系统生成 integrity evidence；  
   **则** evidence 至少包含 `git-commit` 记录；  
   **并且** requested branch、tag 或输入 ref 不得覆盖 resolved version 或 commit evidence。

4. **Remote access intent is explicit before Git resolution（Git 解析前显式声明远程访问意图）**  
   **前提** Git source 解析需要访问远程 source；  
   **当** 系统准备执行 external access；  
   **则** external access intent 必须在 source resolution plan 中显式声明；  
   **并且** 用户未确认前不得访问未声明 remote。

5. **Git failures are stable and redacted（Git 失败稳定且脱敏）**  
   **前提** Git remote 不可达、认证失败或 ref 无法解析；  
   **当** source resolution 失败；  
   **则** 系统会输出稳定 `source-integrity` issue；  
   **并且** redacted output 不泄露 credential-bearing URL、token 或 private query string。

6. **Validate stays local-only for Git descriptors（Validate 对 Git Descriptor 保持本地只读）**  
   **前提** Git source 已写入 manifest 的 source descriptor；  
   **当** 后续运行 `speclite validate`；  
   **则** validate 只检查本地记录的 source descriptor、integrity evidence shape 和 hash baseline；  
   **并且** 不访问 Git remote 或重新验证 freshness/provenance。

7. **Commit evidence without trust anchor remains unverified（无信任锚的 Commit Evidence 保持 Unverified）**  
   **前提** Git source 没有 expected hash 或 lock match；  
   **当** resolved commit SHA evidence 可复现且无 mismatch；  
   **则** source 可以是 `unverified`；  
   **并且** 不得自动标记为 `trusted`。

## Tasks / Subtasks（任务 / 子任务）

- [ ] Task 1: 验证前置实现、工作树和只读边界（AC: 1-7）
  - [ ] 实现前重新检查 root `package.json`、`package-lock.json`、`src/`、`test/`、`tests/`、root `fixtures/` 是否已经由前序 stories 创建。创建本 Story 时这些 TypeScript CLI implementation scaffold 仍不存在；不得把本 ready-for-dev story 当作源码已完成证据。
  - [ ] 确认 Story 5.1 的 source selection、Git source external access intent、source summary confirmation、redaction policy 和 unsupported custom source boundary 是否真实实现；若不存在，先按前序 story 顺序补齐或记录 blocker，不得绕过 5.1 直接访问 Git remote。
  - [ ] 确认 Story 5.2 的 registry resolver 与 Story 5.3 的 local artifact/path resolver 不被本 Story 回归；本 Story 只能解除 `git` source type 的 unsupported boundary。
  - [ ] 确认 Story 3.5 `CommandResult`/`ValidationIssue`、Story 4.3 plan-before-write、Story 4.4 operation lock/safe write、Story 5.1 source descriptor projection、Story 5.2/5.3 trust/evidence helper patterns 是否真实存在；若不存在，不得创建私有 JSON shape、私有 trust model 或隐藏写入流程。
  - [ ] 检查当前 worktree dirty 状态，保留用户、父 agent 或其他 sub-agent 的 planning artifacts、story 文件、源码和状态文件改动；不得格式化、重写、同步或回滚无关文件。
  - [ ] 修改任何 UPDATE 文件前完整读取该文件，记录 current behavior、data shape、public output、tests 和必须保留的行为。

- [ ] Task 2: 接入 Git source resolution entrypoint（AC: 1, 4-5）
  - [ ] 在 `src/source/` 的既有 source resolver dispatch 中为 `git` 接入 Git-specific resolver；不要在 `src/commands/install.ts`、reporter、fixture helper 或 validation rule 中复制 Git resolution logic。
  - [ ] 复用 Story 5.1 的 source selection model：`sourceType` 只能是 `git`，用户输入的 branch、tag、ref、URL selector 或 raw ref 进入 `requestedVersion`、internal `requestedRef` 或 display-safe planning state，resolved commit SHA 才能进入 `git-commit` evidence。
  - [ ] Git remote access 必须发生在 `SourceResolutionPlan` 已声明 external access intent 且用户确认之后；未确认时只展示 redacted remote label、requested ref、访问原因和 confirmation state，不访问 remote、不 fetch、不 clone、不获取 operation lock、不写入项目文件。
  - [ ] Git resolver 只负责解析 remote/ref 到 commit evidence 和 source descriptor；不得执行 package install、修改 `node_modules`、写 package-lock、运行 Git hooks、执行 remote-provided scripts 或把 temporary Git checkout 当成 public artifact。
  - [ ] 如果实现选择调用 Git CLI，必须通过 wrapper 隔离 stdout/stderr、exit status、timeout 和 redaction；不得让 raw Git error、credential-bearing remote 或 private query string 直接进入 `ValidationIssue.details`、human output 或 fixture snapshots。

- [ ] Task 3: 解析 remote/ref 并证明 concrete commit SHA（AC: 1-3）
  - [ ] Git source resolution 必须产出 concrete commit SHA；仅检测字符串像 SHA、仅保存 remote URL、仅保存 branch/tag/ref name，均不能作为可写入 evidence。
  - [ ] 对 branch/tag 输入，可以先把原始 selector 保存在 `requestedVersion` 或 internal planning state；只有当 resolver 明确解析出 commit SHA 后，source 才可继续。
  - [ ] 对 remote URL only、branch-only、tag-only、symbolic ref only 或任何解析后仍没有 concrete commit SHA 的输入，生成 `trustStatus: "blocked"` 和 `source-integrity.floating-git-source`，并阻止进入 `InstallPlan`。
  - [ ] 如果 remote 可达但 requested ref 不存在或无法解析到 commit-ish，使用稳定 `source-integrity` issue。当前 taxonomy 没有 Git-specific unreachable/ref-not-found id 时，优先使用 `source-integrity.unsupported-source` 并在 redaction-safe `details.reason` 中使用稳定 reason，例如 `git-ref-unresolved`。
  - [ ] 如果认证缺失、凭据无效或权限不足，使用 `source-integrity.authentication-required`；不得输出 token、username/password、credential-bearing URL、private query string 或 auth header。
  - [ ] 如果使用 `git ls-remote`，它只能在确认后的 external access 阶段执行；解析输出时只接受 `<oid> TAB <ref>` 形式的 deterministic data，不得解析 human stderr 作为契约字段。
  - [ ] 如果需要在 temporary object database 中验证 commit-ish，使用 `git rev-parse --verify --end-of-options <rev>^{commit}` 或等价 Git-safe path；该检查只能针对已经由显式 Git resolution 获取的对象，不能把本机当前 repo 的 object database 当作 remote source 证明。

- [ ] Task 4: 生成 Git SourceDescriptor 与 git-commit evidence（AC: 3, 7）
  - [ ] `SourceDescriptor.sourceType` 必须是 `git`；`integrityEvidence` 至少包含 `{ kind: "git-commit", commitSha, verified }`。
  - [ ] `commitSha` 必须是 resolved concrete commit SHA；不得存 branch、tag、short ref、symbolic ref、remote URL 或 display label。
  - [ ] Git source 不需要伪造 `contentHash`。`contentHash` 只对 local tarball、offline bundle 和 local source snapshot 等 content-addressable artifacts required。
  - [ ] `version` 如需用于 display-safe resolved version，必须与 resolved commit SHA 语义一致；用户输入的 branch/tag/ref/range 只能保存在 `requestedVersion` 或 internal requested ref 字段，不得覆盖 commit evidence。
  - [ ] `trustStatus: "trusted"` 只能由 expected hash、lock match 或 owning SPEC 明确允许的 trust anchor 产生；Git source 不得因为来自 Git、来自企业 remote、解析到 commit SHA 或用户确认而自动 trusted。
  - [ ] Git source 成功解析到 commit SHA、存在 reproducible `git-commit` evidence、没有 mismatch/policy failure 且用户显式选择确认时，可以是 `trustStatus: "unverified"` 并进入 install planning。
  - [ ] `integrityEvidence[].verified === false` 只能表示 commit evidence 可复现但没有 expected hash 或 lock match 背书；不得用于表示 ref 解析失败、remote 不可达、认证失败或 hash/lock mismatch。

- [ ] Task 5: 维护 Git diagnostics、redaction 和 public output（AC: 4-5）
  - [ ] Public JSON、manifest/index、fixture snapshot 和 human output 只能展示 redacted/display-safe Git remote label 和 resolved commit SHA；不得展示 credential-bearing remote URL、token、username/password、private query string、temporary checkout path、local Git object path 或 raw Git stderr。
  - [ ] `SourceResolutionPlan.requestedSourceValue` 与 `ExternalAccess.sourceValue` 必须是 display-safe value；raw remote URL 只能存在于 private in-memory planning state。
  - [ ] `ValidationIssue.details` 只保留 deterministic、redaction-safe、fixture-stable fields，例如 `sourceType: "git"`、`reason`、`requestedRefKind`、`remoteKind` 或 `hasResolvedCommit: false`；不得包含 hash mismatch raw values、remote URL、credentials、stack trace、timestamp 或 random id。
  - [ ] `impact` 和 `suggestedNextStep` 使用 stable short sentence templates，动态上下文放入 redacted-safe `details`、`component` 或 display-safe source label。
  - [ ] Git resolution failure 在 operation lock 或 install write planning 前发生时，不得输出假装 planning 完成的 planned writes、changed paths、skipped paths 或 conflicts。
  - [ ] Human-readable output 与 `install --json` 使用同一 redaction policy；不能因为是 human output 就显示 raw remote。

- [ ] Task 6: 保持 install planning、manifest/index、status 和 validate 边界（AC: 1-2, 6-7）
  - [ ] 严格保持 `SourceResolutionPlan -> Git source resolution -> SourceDescriptor -> InstallPlan -> operation lock -> safe write -> CommandResult projection` 顺序。
  - [ ] `--yes` 或 command-level write confirmation 不得自动接受 floating Git source、missing commit evidence、authentication failure、unresolved ref、unsupported Git transport、failed evidence verification 或 source policy rejection。
  - [ ] Manifest/index 只投影 source descriptor owning SPEC 允许的 fields；不得新增 `remoteUrl`、`branch`、`tag`、`authStatus`、`checkoutPath`、`gitConfig`、`fetchDepth`、`temporaryObjectDb` 或 implementation-only fields。
  - [ ] `speclite status` 只读取本地 manifest/source descriptor summary；不得执行 Git remote freshness check、latest tag check、branch head check、provenance revalidation 或 implicit update check。
  - [ ] `speclite validate` 只检查本地 recorded source descriptor、`git-commit` evidence shape、manifest/index、files index、IDE mirrors 和 local hash baseline；不得访问 Git remote、重新执行 `git ls-remote`、重新 fetch、重新 clone 或验证 branch/tag 是否仍指向同一 SHA。
  - [ ] Git source descriptor 若已写入 installed state，后续 validate 对 shape mismatch、missing evidence 或 blocked trust state 使用本地 `source-integrity` diagnostics，不通过网络重新判断 remote 可达性、ref freshness 或 provenance。

- [ ] Task 7: 编写 focused tests 与 Git source-integrity fixture assertions（AC: 1-7）
  - [ ] Unit tests 覆盖 Git source request parsing：remote + branch、remote + tag、remote + full ref、remote URL only、explicit commit SHA、unsupported selector 和 requested/ref/resolved commit separation。
  - [ ] Unit tests 覆盖 `SourceResolutionPlan.externalAccesses[]`：Git source 在未确认前只输出 display-safe intent，不访问 remote、不调用 Git client、不获取 operation lock、不写项目文件。
  - [ ] Unit tests 覆盖 Git resolver：confirmed branch/tag/ref 解析到 commit SHA 后产生 `git-commit` evidence；remote URL only 或 unresolved selector 产生 `source-integrity.floating-git-source` 或 taxonomy-compliant stable fallback issue。
  - [ ] Trust matrix tests 覆盖 expected hash/lock match -> `trusted`；resolved commit evidence without trust anchor -> `unverified`；missing commit evidence、floating source、auth required、unsupported transport、policy rejected -> `blocked`。
  - [ ] Diagnostics/redaction tests 覆盖 credential-bearing HTTPS URL、SSH URL with embedded username、token、private query string、temporary checkout path、raw Git stderr、home directory 和 stack trace 不进入 public JSON、human-readable output、manifest/index 或 fixture snapshots。
  - [ ] JSON contract tests 覆盖 `install --json` 的 `CommandResult<InstallCommandData>`、`data.sourceDescriptor.integrityEvidence` 中的 `git-commit` ordering、`issues` sorting、`nextActions` ordering、path policy 和 no remote leakage。
  - [ ] Validate/status no-network tests 使用已安装 Git descriptor fixture，断言不会调用 Git client、不会访问 remote、不会执行 freshness/provenance check。
  - [ ] Fixture assertions 仅覆盖 Story 5.4 范围：至少包含 `test/fixtures/source-integrity/git-floating-blocked/`，并可增加 Git pinned/unverified focused case 或 contract tests；不要提前实现 Story 5.5 full reporting、Epic 6 full fixture matrix、enterprise allowlist、signature verification 或 provenance verification。
  - [ ] 所有 tests 必须 deterministic、local-only。Git remote responses 使用 injected Git client、mocked `ls-remote` output 或 local fixture repository；不得访问 public GitHub、private Git server、npm registry、private registry、offline bundle origin、package-manager cache 或外部网络。

- [ ] Task 8: 本地验证与范围控制（AC: 1-7）
  - [ ] 运行 `npm run build`。
  - [ ] 运行 `npm test`，或至少运行 Git source resolver、source descriptor schema、install plan、diagnostics output、redaction、validate no-network 和 affected source-integrity fixtures 的 focused Vitest tests。
  - [ ] 如果前置 implementation 尚未完成，保留失败为有效前置信号；不要伪造 fixture pass、不要跳过 Git pinning/redaction/no-network tests、不要创建 private JSON shape。
  - [ ] 检查 diff，确认没有修改 `_bmad-output/planning-artifacts/`、Story 5.1、Story 5.2、Story 5.3、已有 Story 1-4 文件、无关源码或用户改动。
  - [ ] 检查 diff，确认没有提前实现 Story 5.5 source descriptor full trust/reporting matrix、Epic 6 fixture matrix、Post-MVP `doctor` / `sync` / `uninstall`、enterprise source policy、allowlists、signatures、provenance verification 或完整 source lockfile lifecycle。

## Dev Notes（开发备注）

### Current Repository State（当前仓库状态）

- 创建本 Story 时，仓库根目录未发现 root `package.json`、`package-lock.json`、`src/`、`test/`、`tests/`、root `fixtures/` implementation scaffold。`assets/source/speclite/` 下存在 source skill assets、module metadata、custom examples 和 legacy Python resolver scripts，但它们不是 MVP TypeScript CLI implementation。
- `_bmad-output/implementation-artifacts/1-1` 到 `5-3` 当前是 ready-for-dev story context，不是完成后的源码证据。实现 Story 5.4 前必须重新确认前置 stories 是否已经由其他 agent 添加 actual implementation。
- 当前 worktree 已有与本 Story 创建无关的 dirty planning artifacts、`sprint-status.yaml` 改动和未跟踪 Epic 1-5 story 文件。实现 Story 5.4 时不得格式化、重写、同步或回滚这些无关改动。
- `_bmad-output/project-context.md` 当前仍是初始化占位内容；实际 implementation guardrails 以 live PRD、Architecture、UX、ADR 和 owning SPEC artifacts 为准。
- 本 create-story run 使用 `python3.12 _bmad/scripts/resolve_customization.py --skill .agents/skills/bmad-create-story --key workflow` 成功解析 workflow；裸 `python3` 在本机可能是 3.9.6，不满足 resolver 对 `tomllib` 的要求。

### Scope Boundary（范围边界）

- 本 Story 负责：Git source external access intent、remote/ref resolution、resolved commit SHA pinning、floating branch/tag/URL-only source rejection、`git-commit` integrity evidence、Git-specific source-integrity diagnostics、credential-bearing remote redaction、install/status/validate no-network boundary 和 focused tests。
- 本 Story 消费：
  - Story 5.1 的 source selection、source type display、external access intent、source summary confirmation、redaction policy 和 unsupported custom source boundary。
  - Story 5.2 的 source resolver dispatch、trust/evidence helper patterns、registry no-network validate/status boundary 和 source-integrity diagnostics discipline。
  - Story 5.3 的 local source redaction/no-access discipline、trustStatus 推导纪律和 source staging/cache privacy boundary。
  - Story 3.5 的 `CommandResult` / `ValidationIssue` public JSON contract、issue ordering、path policy、timestamp policy 和 `InstallCommandData.sourceDescriptor` projection。
  - Story 4.3 的 plan-before-write、write authorization、planned vs actual result separation 和 Evidence profile output。
  - Story 4.4 的 project operation lock、safe write 和 operation-lock pre-write failure boundary。
- 本 Story 不负责：source selection UI 本身（Story 5.1）、registry source resolution（Story 5.2）、local tarball/offline bundle/local path integrity（Story 5.3）、full cross-source trust/status/redacted reporting matrix（Story 5.5）、complete source lockfile lifecycle、enterprise source policy、signatures、provenance verification、allowlists、Post-MVP `doctor`/`sync`/`uninstall` 或 Epic 6 full fixture matrix。

### Architecture Requirements（架构要求）

- Runtime baseline 保持 Node.js 22 minimum 和 Node.js 24 recommended。Node.js official releases 在 2026-05-26 显示 Node 22 和 Node 24 为 LTS、Node 26 为 Current，并说明 production applications should use Active LTS or Maintenance LTS。实现保持 `engines.node >=22`、Node 22/24 fixture matrix，不升级到 Node 26。Source: https://nodejs.org/en/about/previous-releases
- CLI foundation 保持 TypeScript + commander。不要为 Git source resolution 引入 oclif/yargs/cac/clipanion，也不要把 resolver 绑定到 commander lifecycle。
- Runtime schema validation 继续使用 architecture-pinned `zod@4.4.3` 与 executable schema/parser anchors。不要为 Git diagnostics 或 source descriptor 引入新的 schema/runtime validation library。
- Storage model 是 filesystem-first / local-first。不要引入 database、web service、daemon、REST API、GraphQL、desktop UI、persistent Git cache server 或 background process。
- `src/commands/install.ts` 只做 flag/prompt mapping 和 orchestration；Git resolution 属于 `src/source/`；external access planning 属于 `src/installer/` 与 `src/source/` 的 internal planning boundary；public projection/rendering 属于 `src/diagnostics/`；write boundary 属于 `src/installer/` 与 `src/fs/`。
- `src/source/` 是 source/channel abstraction 的唯一领域边界；它把 bundled source、registry、tarball、offline bundle、Git source 和 local path 归一为 canonical source descriptor 或 stable `source-integrity` failure。
- `src/fs/` 是 path normalization、redacted external path helpers、safe writes 和 platform filesystem preflight 的唯一低层边界；Git resolver 可以消费这些 helpers，但不得复制 path escape、separator normalization 或 redaction rules。

### Implementation Anchors（实现锚点）

需要创建或扩展的 implementation anchors，实际命名应贴合已有实现：

- `src/commands/install.ts`：复用 Story 5.1 source selection，传入 Git source request、confirmation state 和 command context，不直接访问 Git remote 或解析 raw Git output。
- `src/source/source-descriptor-schema.ts`：`SourceDescriptor`、`SourceIntegrityEvidence` 和 `git-commit` executable schema/parser anchor。
- `src/source/source-resolver.ts`：source-specific resolver orchestration，dispatch `git` 到 Git resolver，并把 failures 归一为 source-integrity issues。
- `src/source/git-source-resolver.ts` 或等价模块：Git remote/ref client abstraction、requested ref parsing、commit SHA resolution、temporary object verification、trustStatus derivation 和 redacted failures。
- `src/source/git-client.ts` 或 equivalent injected adapter：封装 `git ls-remote`、`git rev-parse --verify` 或等价实现，支持 deterministic mocks，不让 raw stderr 进入 public output。
- `src/source/source-integrity.ts`：floating Git source、auth required、unsupported source/ref、hash/lock mismatch、policy rejection 和 redaction-safe details builder；不得与 `file-integrity` 混用。
- `src/installer/install-plan-schema.ts`：`SourceResolutionPlan`、`ExternalAccess`、`InstallPlan`、confirmation 和 `writeAuthorized` schema/parser anchor。
- `src/installer/install-runner.ts`：保持 source summary confirmation、Git source resolution、install planning、operation lock 和 write/apply 顺序。
- `src/manifest/manifest-schema.ts`：source descriptor installed projection；不得加入未契约化 remote URL、branch/tag/raw ref、auth/cache/temp checkout fields。
- `src/validation/rules/source-integrity.ts`：validate local recorded Git descriptor/evidence shape；不得访问 Git remote 或执行 freshness check。
- `src/diagnostics/command-result-schema.ts`：`CommandResult<InstallCommandData>`、`ValidationIssue` 和 source descriptor public projection。
- `src/diagnostics/command-result.ts`：status/exit-code derivation、source-integrity issue ordering、nextActions ordering。
- `src/diagnostics/output.ts`：Evidence profile 中的 Source、External Access、Authorization、Issues、Next Actions 和 redaction-safe Git source labels。
- `src/fs/path-normalizer.ts`：project-relative POSIX path policy 和 `RedactedExternalPathDiagnostic` helpers。
- `test/unit/source/`、`test/integration/install.test.ts`、`test/fixtures/source-integrity/git-floating-blocked/`：Story 5.4 focused tests 和 expected outputs。

如果这些文件已经由前置 stories 创建，修改前必须完整读取并保留既有 behavior。如果这些文件尚不存在，按前置 story implementation 顺序补齐或记录 blocker，不要绕过 owning SPECs 创建私有实现。

### Git Source Pinning Matrix（Git Source 固定矩阵）

| Scenario（场景） | Required Evidence（必要证据） | Trust Outcome（信任结果） | Diagnostics / Notes（诊断 / 备注） |
| --- | --- | --- | --- |
| Remote + requested branch resolves to concrete commit SHA | `git-commit` with `verified: false` unless expected lock/hash matches | `unverified` or `trusted` if matched | Branch 是 requested selector，不是 resolved evidence。 |
| Remote + requested tag resolves to concrete commit SHA | `git-commit` with `verified: false` unless expected lock/hash matches | `unverified` or `trusted` if matched | Annotated tag 必须最终解析到 commit-ish SHA。 |
| Remote + full ref resolves to concrete commit SHA | `git-commit` | `unverified` or `trusted` if matched | `requestedVersion` 或 internal requested ref 保留用户输入。 |
| Remote + explicit commit SHA can be proven as commit-ish by explicit Git resolution | `git-commit` | `unverified` or `trusted` if matched | 不允许只做字符串 shape 检查；必须有 resolver 证明。 |
| Remote URL only, branch-only, tag-only, symbolic ref only, or unresolved selector | none | `blocked` | `source-integrity.floating-git-source`；不得进入 `InstallPlan`。 |
| Git remote authentication missing or permission denied | none | `blocked` | `source-integrity.authentication-required`；credentials 和 URL redacted。 |
| Git remote unreachable, unsupported transport, malformed remote, or ref cannot be resolved | none | `blocked` | 使用 stable `source-integrity` issue；无更具体 reserved id 时用 `source-integrity.unsupported-source` + stable `details.reason`。 |
| Expected hash or lock mismatches resolved commit | mismatched evidence | `blocked` | `source-integrity.hash-mismatch` 或 `source-integrity.lock-mismatch`；阻止写入。 |

### CommandResult And SourceDescriptor Requirements（CommandResult 与 SourceDescriptor 要求）

- `install --json` 必须输出 `CommandResult<InstallCommandData>`，`command: "install"`，`data.paths.projectRoot: "."`。
- `InstallCommandData.sourceDescriptor` 必须遵守 source descriptor SPEC；Git source 不得新增 `remoteUrl`、`branch`、`tag`、`ref`、`rawRef`、`checkoutPath`、`objectDatabasePath`、`gitConfig`、`credentials` 或 implementation-only fields。
- Git source descriptor allowed public fields：`sourceType: "git"`、`channel`（如上层 source selection 已定义）、`requestedVersion`（display-safe requested selector）、`version`（如用于 resolved commit display）、`resolvedRoot`（仅 display-safe label）、`integrityEvidence`、`trustStatus`。Git source 不需要伪造 `contentHash`。
- `git-commit` evidence 使用 full resolved `commitSha`；`verified: false` 表示 evidence 可复现但没有 expected hash 或 lock match 背书，不表示校验失败。
- `SourceDescriptor.integrityEvidence` 排序遵守 CommandResult SPEC：registry integrity / version lock -> content hash -> git commit；Git source 只产生 `git-commit` 时也必须保持排序稳定。
- `ValidationIssue.issueId` 必须是 `<category>.<stable-code>`；不得包含 remote host、branch、tag、commit SHA、path、timestamp、count 或 random id。
- Public JSON 默认不得包含 timestamps；summary、impact、suggestedNextStep 和 nextActions 不得包含 raw remote URL、token、path、hash、stack trace 或环境相关文本。
- Human-readable output 可以解释 Git source pinning，但不得成为 automation-relevant state 的唯一承载位置；automation 依赖必须进入 `CommandResult.data`、`issues`、`nextActions`、manifest/index 或 fixture expected outputs。

### UX / Output Requirements（UX 与输出要求）

- Git remote 访问前必须展示 source type、display-safe remote label、requested ref、reason 和 confirmation state。
- Source summary 语气保持克制、具体、可操作；不要只输出 `done`，也不要把 resolved commit 或 `unverified` 表述为安全通过。
- `trusted`、`unverified`、`blocked` 必须在 human-readable output 中有文本等价解释；不得只依赖颜色或图标。
- Failure output 应组织为 Summary、Source、External Access、Issues、Next Actions；不要显示 raw Git stderr、stack trace、credential-bearing URL、token、private query string、home directory、temporary checkout path 或 local object database path。
- Floating Git source failure 必须让用户知道需要 pin 到 concrete commit SHA，但不得泄露 raw remote；可通过 stable `issueId`、display-safe source label 和 suggested next step 指向重新提供 pinned ref/commit。
- `NO_COLOR`、non-TTY、CI、Windows path portability 和窄终端下，source type、display-safe label、requested ref kind、resolved commit SHA、trustStatus、issueId 和 next action 仍必须纯文本可读。

### Previous Story Intelligence（前序 Story 情报）

- Story 5.1 建立了 source selection / external access intent boundary：Git source 在未确认前只能展示 intent，不能访问 remote、fetch、clone、获取 operation lock 或写项目文件。Story 5.4 必须继承此顺序。
- Story 5.1 明确 custom source-specific resolver 尚未实现时必须以稳定 `source-integrity` issue 停止写入，而不是伪造 `SourceDescriptor` 成功。Story 5.4 只解除 `git` source type 的 unsupported boundary。
- Story 5.2 建立了 trustStatus 推导纪律：`trusted` 必须来自 expected hash 或 lock match；可复现 evidence 无 trust anchor 时是 `unverified`；missing evidence、mismatch 或 source policy failure 是 `blocked`。Story 5.4 对 Git commit evidence 复用同一 trust model。
- Story 5.2 明确 status/validate 对已安装 source descriptor 只做 local descriptor/evidence shape 检查，不访问 source origin。Story 5.4 必须确保 validate 不访问 Git remote、不会检查 branch/tag freshness、不会执行 provenance revalidation。
- Story 5.3 强化了 source staging/cache/temporary path privacy boundary。Story 5.4 的 temporary Git checkout、temporary object database、Git cache 和 cleanup state 都是 private implementation state，不得进入 public contract。
- Story 5.1/5.2/5.3 都强调 current ready-for-dev story contexts 不是源码完成证据；dev agent 必须重新检查实际 implementation scaffold 与前置 anchors。
- Story 4.6 和 Story 5.1/5.2/5.3 均强调当前 worktree 有无关 dirty planning artifacts 和未跟踪 story 文件；dev agent 不得格式化、重写、同步或回滚无关改动。
- 最近 5 个 commit 均为 docs/context/source/glossary/specs 方向，没有可复用的 TypeScript Git source implementation commit pattern。实现必须以 live owning SPEC、previous story contexts 和实际源码为准，不以 docs commits 推断源码已存在。

### Latest Technical Information（最新技术信息）

- Node.js official releases 页面在 2026-05-26 显示 Node 22 和 Node 24 为 LTS、Node 26 为 Current，并说明生产应用应使用 Active LTS 或 Maintenance LTS。实现保持 `engines.node >=22`、Node 22/24 fixture matrix，不升级到 Node 26。Source: https://nodejs.org/en/about/previous-releases
- Git 官方 `git ls-remote` 文档说明该命令会列出 remote repository 可用 refs 及对应 commit IDs，输出形态为 `<oid> TAB <ref> LF`；`--exit-code` 可在没有匹配 ref 时返回特定状态，`--quiet` 可避免向 stderr 打印 remote URL。实现只能在用户确认 external access 后使用它，并必须 redacted stdout/stderr。Source: https://git-scm.com/docs/git-ls-remote
- Git 官方 `git rev-parse` 文档说明 `--verify` 会验证单个参数可转成可访问 object name，`^{commit}` 可要求对象为 commit-ish；示例使用 `git rev-parse --verify --end-of-options $REV^{commit}`。实现可在 explicit Git resolution 获取对象后用它验证 commit-ish，不得把本机当前 repo object database 当作 remote source 证明。Source: https://git-scm.com/docs/git-rev-parse
- No new third-party dependency is required by default. 如果实现需要 Git client abstraction，优先使用 Node 22-compatible APIs、injected command runner 和 existing project-pinned libraries；新增 dependency 前必须确认 package policy、Node 22 support、testability、redaction behavior 和 offline determinism。

### Contract Requirements（契约要求）

- `_bmad-output/planning-artifacts/specs/02-source-descriptor-contract.md` 拥有 `SourceDescriptor`、`SourceIntegrityEvidence`、Git source type rules、`git-commit` evidence、trust status、source staging/cache redaction 和 validate no-network boundary。
- `_bmad-output/planning-artifacts/specs/03-install-plan-contract.md` 拥有 `SourceResolutionPlan`、external access、confirmation、`InstallPlan`、`writeAuthorized`、operation lock 和 safe write semantics。
- `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md` 拥有 `CommandResult` envelope、`InstallCommandData`、`ValidationIssue` model、path policy、timestamp policy、ordering、`RedactedExternalPathDiagnostic` shape 和 fixture comparison policy。
- `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md` 拥有 `source-integrity` category、reserved issue ids、default severity 和 redaction-safe details policy，尤其是 `source-integrity.floating-git-source`、`source-integrity.authentication-required`、`source-integrity.unsupported-source`、`source-integrity.hash-mismatch` 和 `source-integrity.lock-mismatch`。
- `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md` 拥有 manifest/index installed projection、source descriptor projection、files index ownership/hash 和 fixture update policy；Git remote URL、temporary checkout state、Git cache 和 raw ref state 不得进入 manifest/index/files index。
- `_bmad-output/planning-artifacts/specs/08-fixture-contract.md` 拥有 `source-integrity/git-floating-blocked` required release-gate sub-case、expected output classes、semantic JSON comparison、snapshot redaction 和 release gate classification。
- `_bmad-output/planning-artifacts/specs/06-resolve-command-contract.md` 只适用于 installed skills 的 config/customization resolve command；Git source resolver 不得复用 `speclite resolve` stdout contract 或把 Git resolution 包进 `CommandResult` exception path。
- ADRs 可以解释决策历史，但不得重新定义 field-level schema、issue taxonomy、fixture layout、command payload 或 implementation anchors。若 ADR 与 owning SPEC 冲突，follow owning SPEC。

### Testing Requirements（测试要求）

- Use Vitest。
- Tests 必须 deterministic、local-only，不访问 public Git remotes、private Git remotes、npm registry、private registry、offline bundle origin、package-manager cache 或外部网络。
- 使用 injected Git client、mocked `git ls-remote` output、temporary local fixture repository 或 fixture source packages 构造 Git source cases。不要使用当前 repo 的 `_bmad` 或 `_bmad-output` 作为 installed target state。
- JSON tests 必须 parse 后断言 semantic fields。不要比较 raw pretty-printed JSON bytes，除非 formatting 本身是测试目标。
- Redaction tests 必须覆盖 HTTPS basic auth URL、token URL、SSH URL with username、private query string、raw Git stderr、temporary checkout root、temporary object database、home directory、drive letter、OS-specific separator 和 stack trace。
- Validate/status no-network tests 必须通过 mock/spies 证明 Git client 未被调用；不能只依赖没有网络配置。
- Fixture snapshots 必须 normalize 或 exclude timestamps、duration、operation-lock volatile fields、temporary paths、environment-specific paths、home directory、generated metadata timestamps 和 redacted external path diagnostics。
- Fixture coverage 不得扩大到 Story 5.5 full trust/reporting matrix 或 Epic 6 full release matrix；这些只作为后续 stories 的扩展点。

### Project Context Reference（项目上下文引用）

- `_bmad-output/project-context.md` currently contains initialized metadata and placeholder sections only; it does not add implementation rules beyond live PRD, Architecture, UX, ADR and owning SPEC artifacts.
- The project-level language rule remains: conversation and generated docs in Chinese, section headings in `English（中文）` form, technical identifiers in English.

### References（参考资料）

- `_bmad-output/planning-artifacts/epics/08-epic-5-source-integrity-and-distribution-channels来源完整性与分发渠道.md`
- `_bmad-output/implementation-artifacts/5-1-source-selection-and-channel-summary.md`
- `_bmad-output/implementation-artifacts/5-2-registry-source-resolution-and-diagnostics.md`
- `_bmad-output/implementation-artifacts/5-3-local-tarball-offline-bundle-and-local-path-integrity.md`
- `_bmad-output/implementation-artifacts/4-6-explicit-repair-for-recoverable-installer-owned-drift.md`
- `_bmad-output/planning-artifacts/prd/08-developer-tool-specific-requirements开发者工具特定需求.md`
- `_bmad-output/planning-artifacts/prd/10-functional-requirements功能需求.md`
- `_bmad-output/planning-artifacts/prd/11-non-functional-requirements非功能需求.md`
- `_bmad-output/planning-artifacts/architecture/03-core-architectural-decisions核心架构决策.md`
- `_bmad-output/planning-artifacts/architecture/04-implementation-patterns-consistency-rules实现模式与一致性规则.md`
- `_bmad-output/planning-artifacts/architecture/05-project-structure-boundaries项目结构与边界.md`
- `_bmad-output/planning-artifacts/architecture/06-architecture-validation-results架构验证结果.md`
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
- Git `ls-remote`: https://git-scm.com/docs/git-ls-remote
- Git `rev-parse`: https://git-scm.com/docs/git-rev-parse

## Dev Agent Record（开发代理记录）

### Agent Model Used（使用的代理模型）

TBD by dev agent.

### Debug Log References（调试日志引用）

TBD by dev agent.

### Completion Notes List（完成备注列表）

- Story context created by bmad-create-story sub-agent for Story 5.4 only.
- Ultimate context engine analysis completed - comprehensive developer guide created.

### File List（文件列表）

TBD by dev agent.
