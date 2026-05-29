# Story 5.5: SourceDescriptor Trust Status And Redacted Reporting（SourceDescriptor 信任状态与脱敏报告）

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story（故事）

作为项目维护者，  
我希望所有安装来源都被归一为稳定的 `SourceDescriptor`，并以脱敏方式报告 `trustStatus` 和 `integrityEvidence`，  
以便团队能审查安装来源是否可信，同时不会泄露凭据、本机路径或临时实现细节。

## Acceptance Criteria（验收标准）

1. **Successful source resolution creates canonical SourceDescriptor（成功来源解析生成规范 SourceDescriptor）**  
   **前提** source resolution 成功；  
   **当** 系统生成 `SourceDescriptor`；  
   **则** descriptor 会包含 source type、channel、resolved version 或 display-safe source label、`integrityEvidence` 和 `trustStatus`；  
   **并且** source/channel/version 信息可在 install summary、`status` 和 `validate` 中可见。

2. **Trusted status requires trust anchor（Trusted 状态需要信任锚）**  
   **前提** source 通过 expected hash 或 lock match 验证；  
   **当** 系统计算 `trustStatus`；  
   **则** `trustStatus` 可以是 `trusted`；  
   **并且** bundled source 的 packaging manifest / package hash / package lock match 视为等价 trust anchor；  
   **并且** MVP 不提供通用 trusted source allowlist schema。

3. **Unverified status means reproducible but unauthenticated evidence（Unverified 表示可复现但无信任锚证据）**  
   **前提** source 缺少信任锚但具备可复现 `integrityEvidence`；  
   **当** 用户显式选择并确认该 source；  
   **则** `trustStatus` 可以是 `unverified`；  
   **并且** evidence 中的 `verified: false` 只表示未被 expected hash 或 lock match 背书，不表示校验失败。

4. **Blocked status prevents writes（Blocked 状态阻止写入）**  
   **前提** source 存在 missing evidence、hash mismatch、lock mismatch、unsupported source、local source self-reference、floating Git source、bundled packaging evidence 缺失、failed evidence verification 或 source policy 拒绝；  
   **当** 系统计算 `trustStatus`；  
   **则** `trustStatus` 必须是 `blocked`；  
   **并且** install/update 不得继续写入步骤。

5. **Source reporting is redacted everywhere（来源报告在所有公开面脱敏）**  
   **前提** public JSON、manifest/index、issues 或 fixture snapshot 需要展示 source 信息；  
   **当** 系统渲染 source descriptor 或 diagnostics；  
   **则** credential、credential-bearing URL、private query string、home directory、本机 absolute source path、cache path、temporary extraction path 和临时 Git checkout path 必须 redacted；  
   **并且** source staging 和 package-manager cache path 不进入 public contract。

6. **Validate stays local-only（Validate 保持本地只读）**  
   **前提** validate 读取已安装 `SourceDescriptor`；  
   **当** 检查 source integrity 状态；  
   **则** validate 只检查本地 descriptor、integrity evidence shape 与 installed state 是否一致；  
   **并且** 不重新访问远程 source 或执行 provenance revalidation。

7. **SourceDescriptor semantics are owned by SPEC（SourceDescriptor 语义由 SPEC 拥有）**  
   **前提** source descriptor 字段语义需要被 PRD、Architecture、Manifest/index 或 `CommandResult` 引用；  
   **当** 文档或实现描述该对象；  
   **则** 必须引用 source-descriptor owning SPEC 作为字段与语义真源；  
   **并且** 不在多个文件中定义第二套 trust/evidence 规则。

## Tasks / Subtasks（任务 / 子任务）

- [ ] Task 1: 验证前置实现、工作树和只读边界（AC: 1-7）
  - [ ] 实现前重新检查 root `package.json`、`package-lock.json`、`src/`、`test/`、`tests/`、root `fixtures/` 是否与当前 sprint/source 状态一致。截至 2026-05-29，Epic 3 提交 `395b017` 已提供 root TypeScript CLI scaffold、`src/commands/update.ts`、`CommandResult` / `ValidationIssue` anchors 和 validation/diagnostics tests；Epic 4 update/repair write anchors 与 Epic 5 source anchors 仍必须按当前源码验证。
  - [ ] 确认 Story 5.1 的 source selection / external access intent / redaction boundary、Story 5.2 的 registry evidence / trust helper、Story 5.3 的 local artifact/path evidence、Story 5.4 的 Git commit evidence / floating source rejection 是否真实实现；若不存在，先按前序 story 顺序补齐或记录 blocker，不得在本 Story 中伪造成功状态。
  - [ ] 确认 Story 3.5 `CommandResult` / `ValidationIssue` anchors 仍可复用，并重新验证 Story 3.2 manifest/index schema、Story 4.3 plan-before-write、Story 4.4 operation lock/safe write 和 Story 4.6 repair source policy anchors 是否真实存在；若不存在，不得创建私有 JSON shape、私有 trust model 或隐藏写入流程。
  - [ ] 检查当前 worktree dirty 状态，保留用户、父 agent 或其它 sub-agent 的 planning artifacts、story 文件、源码和状态文件改动；不得格式化、重写、同步或回滚无关文件。
  - [ ] 修改任何 UPDATE 文件前完整读取该文件，记录 current behavior、data shape、public output、tests 和必须保留的行为。

- [ ] Task 2: 统一 `SourceDescriptor` executable schema/parser（AC: 1, 7）
  - [ ] 在 `src/source/source-descriptor-schema.ts` 中集中定义并导出 `SourceDescriptor` 与 `SourceIntegrityEvidence` executable schema/parser；该 module 是 SPEC implementation anchor，不是第二份契约真源。
  - [ ] 只允许 SPEC 中声明的 `sourceType`：`bundled`、`npm`、`private-registry`、`local-tarball`、`offline-bundle`、`git`、`local`；不得新增 `registry`、`npm-public`、`enterprise-registry`、`path`、`archive` 等未契约化别名。
  - [ ] 字段语义必须遵守 source descriptor SPEC：`version` 是 resolved installed source version；用户输入的 range、dist-tag、tag、branch 或 selector 使用 `requestedVersion` 或 internal planning state，不得覆盖 resolved `version`。
  - [ ] `resolvedRoot` 出现在 public output 时只能是 project-relative POSIX path 或 display-safe source label；不得包含 npm cache、temporary extraction、local absolute path、home directory、drive letter 或 OS-specific separator。
  - [ ] `contentHash` 只对 local tarball、offline bundle 和 local source snapshot 等 content-addressable source artifacts required；registry 和 Git source 不得伪造 `contentHash`。
  - [ ] `integrityEvidence` 进入写入步骤前至少包含一项可复现 evidence；排序遵守 CommandResult SPEC：registry integrity / version lock -> content hash -> git commit，同 kind 按 normalized stable key 排序。

- [ ] Task 3: 集中实现 `trustStatus` 推导（AC: 2-4）
  - [ ] 在 `src/source/` 中建立单一 trust evaluator（例如 `source-trust.ts` 或并入既有 `source-integrity.ts`）；所有 resolver 只能调用该入口，不得在 registry、local、Git、manifest、status 或 validate 中复制 trust matrix。
  - [ ] `trusted` 只能由 expected hash、lock match，或 bundled source 的 packaging manifest / package hash / package lock match 产生；不得仅因 source type、public npm、private registry、Git、tarball、offline bundle、本机文件存在或用户确认而 trusted。
  - [ ] `unverified` 必须同时满足：用户显式选择并确认该 source、至少存在一个 reproducible `integrityEvidence`、没有 blocking source-integrity issue。`verified: false` 只能表达“证据可复现但无信任锚”，不能表达 verification failure。
  - [ ] `blocked` 必须覆盖 missing evidence、hash mismatch、lock mismatch、unsupported source、local source self-reference、floating Git source、bundled packaging evidence 缺失、failed evidence verification 和 source policy rejection；blocked source 不得进入 install/update planned writes。
  - [ ] `--yes` 或 command-level write confirmation 不得自动接受 `unverified` source、floating Git source、unsupported source、failed evidence verification 或 source policy rejection。

- [ ] Task 4: 统一 redacted public projection（AC: 1, 5, 7）
  - [ ] 建立或复用 `src/fs/path-normalizer.ts` / redaction helpers，集中生成 project-relative POSIX path、display-safe source label 和 `RedactedExternalPathDiagnostic`。
  - [ ] Public JSON、manifest/index、`ValidationIssue.details`、human-readable output、fixture snapshots 和 ready/status/validate summaries 使用同一 redaction policy。
  - [ ] 不得在 public contract 中输出 credential、token、auth header、credential-bearing URL、private query string、private registry endpoint、proxy secret、home directory、本机 absolute path、drive letter、OS-specific separator、npm cache path、temporary extraction path、source staging directory、temporary Git checkout path、temporary object database 或 raw stack trace。
  - [ ] Registry source display 使用 package name、resolved version、registry kind 或 redacted registry label；Git source display 使用 redacted remote label + resolved commit SHA；local/tarball/offline source display 使用 display-safe label 或 redacted diagnostic object。
  - [ ] `impact`、`suggestedNextStep`、`summary` 和 `nextActions` 使用 stable short templates，不拼入 source name、hash、raw path、timestamp、stack trace 或环境相关文本。

- [ ] Task 5: 投影到 install summary、`status`、`validate` 和 manifest/index（AC: 1, 5-7）
  - [ ] `install --json` 继续输出 `CommandResult<InstallCommandData>`，`data.sourceDescriptor` 使用 owning SPEC 字段；不得新增未契约化 `sourceSummary`、`trustReport`、`readySummary` blob 或 automation-only field。
  - [ ] Human-readable install summary / ready summary 使用 Evidence profile，在 Source block 中展示 source type、channel/requestedVersion/version、display-safe source label、`trustStatus`、evidence summary 和 next action；automation 依赖必须仍在 structured fields。
  - [ ] `speclite status` 只读取本地 manifest/source descriptor projection、manifest version、installed modules、IDE target summary、required paths 和 high-level health；不得访问 npm registry、private registry、Git remote、offline bundle origin、本地 source origin 或 package-manager cache。
  - [ ] `speclite validate` 只检查本地 recorded descriptor shape、evidence shape、manifest/index projection、files index、IDE mirrors 和 local hash baseline；不得执行 remote freshness check、Git branch/tag freshness、registry latest check、provenance revalidation 或 source lockfile refresh。
  - [ ] Manifest/index 只投影 source descriptor SPEC 允许的 fields；不得加入 registry URL、auth status、token scope、raw metadata、tarball path、bundle path、local path、remote URL、checkout path、staging/cache/temp path 或 implementation-only fields。
  - [ ] `source-integrity` 与 `file-integrity` category 必须保持分离：source resolver/install planning 阶段的问题用 `source-integrity`；已安装文件、files index 或 IDE mirror drift 用 `file-integrity` 或 `ide-mirror`。

- [ ] Task 6: 实现 cross-source reporting matrix（AC: 1-6）
  - [ ] Bundled source：记录 packaging manifest / package hash / package lock match evidence；evidence 可验证时 `trusted`，缺失 evidence 时 `source-integrity.missing-evidence` + `blocked`，`resolvedRoot` 只能是 `assets/source/speclite` 等 package-internal display-safe label。
  - [ ] Registry source：复用 Story 5.2 `registry-integrity` / `version-lock` evidence；lock/hash match -> `trusted`，registry evidence without trust anchor -> `unverified`，missing/mismatch/auth/unreachable -> `blocked` 或 stable `source-integrity` issue；不得因为 npm public/private registry 类型 trusted。
  - [ ] Tarball/offline/local source：复用 Story 5.3 `content-hash` evidence、snapshot allowlist 和 self-reference guard；artifact/snapshot hash without trust anchor -> `unverified`，missing/mismatch/unreadable/self-reference -> `blocked`。
  - [ ] Git source：复用 Story 5.4 `git-commit` evidence；resolved commit without trust anchor -> `unverified`，floating remote/branch/tag/unresolved ref/auth failure -> `blocked`；不得把 branch/tag/requested ref 当 resolved evidence。
  - [ ] 所有 source type 的 trust/evidence display 必须在 `NO_COLOR`、non-TTY、CI、Windows path portability 和窄终端下保留文本等价说明；不得只靠颜色或图标表达 `trusted`、`unverified`、`blocked`。

- [ ] Task 7: 编写 focused tests 与 source-integrity fixture assertions（AC: 1-7）
  - [ ] Unit tests 覆盖 `SourceDescriptor` parser：allowed source types、field optionality、`version`/`requestedVersion` separation、`contentHash` source-type requirements、evidence kind schemas 和 evidence ordering。
  - [ ] Trust matrix tests 覆盖 bundled、registry、tarball/offline bundle、local path 和 Git source：expected hash/lock/packaging match -> `trusted`；reproducible evidence without trust anchor -> `unverified`；missing evidence、hash mismatch、lock mismatch、unsupported source、floating Git、local self-reference 和 policy rejection -> `blocked`。
  - [ ] Redaction tests 覆盖 credential-bearing URL、registry token、proxy secret、private query string、home directory、absolute local source path、drive letter、OS-specific separator、npm cache path、temporary extraction path、staging directory、temporary Git checkout/object DB、raw Git stderr、raw fs error 和 stack trace 不进入 public JSON、manifest/index、human-readable output 或 fixture snapshots。
  - [ ] JSON contract tests 覆盖 `install --json`、`status --json` 和 `validate --json` 中 `sourceDescriptor` projection、issue sorting、nextActions sorting、`data.paths.projectRoot: "."`、absence of timestamps 和 no private path leakage。
  - [ ] Validate/status no-network tests 使用已安装 descriptor fixtures，断言不会调用 registry client、Git client、tarball reader、offline bundle extractor、local source scanner、package-manager cache reader 或 provenance service。
  - [ ] Fixture assertions 覆盖 Story 5.5 收口范围：`source-integrity/bundled-packaging-trusted`、`source-integrity/bundled-packaging-missing-evidence-blocked`，并复核 5.2-5.4 已引入的 required source-integrity sub-cases在 trustStatus、evidence ordering 和 redaction policy 上一致；不要扩大到 Epic 6 full fixture matrix。
  - [ ] 所有 tests 必须 deterministic、local-only，不访问 npm registry、private registry、Git remote、offline bundle origin、package-manager cache、remote provenance service 或外部网络；source-specific inputs 使用 mocks、temporary files、local fixture metadata 或 injected clients。

- [ ] Task 8: 本地验证与范围控制（AC: 1-7）
  - [ ] 运行 `npm run build`。
  - [ ] 运行 `npm test`，或至少运行 source descriptor schema、trust evaluator、redaction helpers、install/status/validate projection、source-integrity validation rule 和 affected source-integrity fixture tests。
  - [ ] 如果前置 implementation 尚未完成，保留失败为有效前置信号；不要伪造 fixture pass、不要跳过 trust/redaction/no-network tests、不要创建 private JSON shape。
  - [ ] 检查 diff，确认没有修改 `_bmad-output/planning-artifacts/`、Story 5.1/5.2/5.3/5.4、已有 Story 1-4 文件、无关源码或用户改动。
  - [ ] 检查 diff，确认没有提前实现 Epic 6 full fixture matrix、complete source lockfile lifecycle、enterprise allowlist/signatures/provenance、Post-MVP `doctor` / `sync` / `uninstall`、top-level `repair`、backup/restore 或 standalone report artifact。

## Dev Notes（开发备注）

### Current Repository State（当前仓库状态）

- 截至 2026-05-29 的 Epic 3 提交 `395b017`，root TypeScript CLI scaffold、status/validate/update command anchors、`CommandResult` / `ValidationIssue` schema、diagnostics/output 和 validation ordering anchors 已存在。root `fixtures/`、Epic 4 update/repair write behavior 和 Story 5.1 到 5.4 source anchors 仍需按当前源码逐项确认。
- Story 3.5 anchors 已存在，但 Epic 3 没有实现 source-integrity domain rule、source descriptor trust model 或 redacted source reporting behavior；不要把 canonical category reserved position 当成 Epic 5 source-integrity 已落地。Story 5.5 的 ready-for-dev context 不是其自身实现完成证据。
- 当前 worktree 已有与本 Story 创建无关的 dirty planning artifacts、`sprint-status.yaml` 改动和未跟踪 Epic 1-5 story 文件。实现 Story 5.5 时不得格式化、重写、同步或回滚这些无关改动。
- `_bmad-output/project-context.md` 当前仍是初始化占位内容；实际 implementation guardrails 以 live PRD、Architecture、UX、ADR 和 owning SPEC artifacts 为准。
- 本 create-story run 使用 `python3.12 _bmad/scripts/resolve_customization.py --skill .agents/skills/bmad-create-story --key workflow` 成功解析 workflow；裸 `python3` 在本机可能是 3.9.6，不满足 resolver 对 `tomllib` 的要求。

### Scope Boundary（范围边界）

- 本 Story 负责：Epic 5 收口；统一 `SourceDescriptor` schema/parser、cross-source `trustStatus` 推导、`integrityEvidence` ordering、redacted reporting、install/status/validate summary projection、manifest/index projection、source descriptor field semantics 引用 owning SPEC，以及 focused trust/redaction/no-network tests。
- 本 Story 消费：
  - Story 5.1 的 source selection、source type display、external access intent、source summary confirmation、redaction policy 和 unsupported custom source boundary。
  - Story 5.2 的 registry resolver dispatch、registry integrity/version-lock evidence、registry trust matrix、private registry redaction 和 status/validate no-network boundary。
  - Story 5.3 的 local tarball/offline bundle artifact hash、local path snapshot allowlist、self-reference guard、staging/cache redaction 和 local source trust matrix。
  - Story 5.4 的 Git remote/ref resolution、concrete commit SHA pinning、floating source rejection、`git-commit` evidence、Git redaction 和 Git validate no-network boundary。
  - Story 3.5 的 `CommandResult` / `ValidationIssue` public JSON contract、issue ordering、path policy、timestamp policy 和 command-specific payload boundaries。
  - Story 4.3/4.4/4.6 的 plan-before-write、write authorization、operation lock、safe write、repair source policy 和 missing source evidence conflict discipline。
- 本 Story 不负责：source selection UI 本身、registry package resolution、tarball/offline/local path hashing internals、Git remote/ref resolution internals、Epic 6 full fixture matrix、complete source lockfile lifecycle、enterprise source policy、allowlists、signatures、provenance verification、Post-MVP `doctor`/`sync`/`uninstall`、top-level `repair`、backup/restore 或 standalone update report artifact。

### Architecture Requirements（架构要求）

- Runtime baseline 保持 Node.js 22 minimum 和 Node.js 24 recommended。Node.js official releases 在 2026-05-26 显示 Node 22 与 Node 24 为 LTS、Node 26 为 Current；生产应用应使用 Active LTS 或 Maintenance LTS。不要把 MVP baseline 提升到 Node 26，也不要使用 Node 24-only API，除非提供 Node 22-compatible path 并更新 runtime policy / fixtures。Source: https://nodejs.org/en/about/previous-releases
- CLI foundation 保持 TypeScript + commander。不要为 trust reporting 引入 oclif/yargs/cac/clipanion，也不要把 source descriptor schema 或 trust matrix 绑定到 commander lifecycle。
- Runtime schema validation 继续使用 architecture-pinned `zod@4.4.3` 与 executable schema/parser anchors。不要为 source descriptor、redaction、diagnostics 或 reporting 引入新的 schema/runtime validation library。
- Storage model 是 filesystem-first / local-first。不要引入 database、web service、daemon、REST API、GraphQL、desktop UI、persistent source cache server 或 background process。
- `src/source/` 是 source/channel abstraction 的唯一领域边界；它把 bundled source、registry、tarball、offline bundle、Git source 和 local path 归一为 canonical source descriptor 或 stable `source-integrity` failure。
- `src/diagnostics/` 是 public JSON、human-readable output、status/exit-code derivation、issue ordering 和 nextActions ordering 的唯一投影边界；command modules 不得 hand-roll JSON fields 或 trust report layout。
- `src/manifest/` 只投影 owning SPEC 允许的 installed-state fields；manifest/index 是 installed projection，不是 source trust 规则的新真源。
- `src/validation/` 只读取本地 state 并产生 issues；validate 不修复、不访问远程 source、不做 provenance revalidation。

### Implementation Anchors（实现锚点）

需要创建或扩展的 implementation anchors，实际命名应贴合已有实现：

- `src/source/source-descriptor-schema.ts`：`SourceDescriptor`、`SourceIntegrityEvidence`、source type、evidence kind、trustStatus executable schema/parser anchor。
- `src/source/source-descriptor.ts` 或等价 module：source descriptor construction、normalization 和 public-safe descriptor assembly；不得承载第二套 SPEC 语义。
- `src/source/source-integrity.ts` 或 `src/source/source-trust.ts`：single trust evaluator、source-integrity issue helpers、hash/lock/evidence failure helpers、redaction-safe details builder。
- `src/source/source-resolver.ts`：source-specific resolver orchestration；只接受各 resolver 产生的 evidence/failure facts，再调用 centralized trust evaluator。
- `src/installer/install-plan-schema.ts`：`SourceResolutionPlan`、`ExternalAccess`、`InstallPlan`、confirmation 和 `writeAuthorized` schema/parser anchor。
- `src/installer/install-runner.ts`：保持 source summary confirmation、source resolution、install planning、operation lock 和 write/apply 顺序。
- `src/installer/ready-summary.ts`：安装完成后显示 source descriptor、manifest version、installed modules、IDE targets、paths 和 next commands；不输出未契约化 `readySummary` JSON blob。
- `src/manifest/manifest-schema.ts`：manifest/index source descriptor installed projection；不得加入 source origin、auth、cache、staging、checkout 或 implementation-only fields。
- `src/validation/rules/source-integrity.ts`：validate local recorded source descriptor/evidence shape、manifest/index projection 和 installed state consistency；不得访问 remote source 或 project-external source origins。
- `src/diagnostics/command-result-schema.ts`：`CommandResult<InstallCommandData>`、`StatusCommandData`、`ValidateCommandData`、`ValidationIssue` 和 source descriptor public projection。
- `src/diagnostics/command-result.ts`：status/exit-code derivation、source-integrity issue ordering、nextActions ordering 和 JSON summary stability。
- `src/diagnostics/output.ts`：Evidence profile Source block、trustStatus text equivalents、Issues、Next Actions、NO_COLOR/non-TTY/CI/narrow terminal fallback。
- `src/fs/path-normalizer.ts`：project-relative POSIX path policy、redacted external source labels 和 `RedactedExternalPathDiagnostic` helpers。
- `test/unit/source/`、`test/unit/diagnostics/`、`test/integration/install.test.ts`、`test/integration/status.test.ts`、`test/integration/validate.test.ts`、`test/fixtures/source-integrity/bundled-packaging-trusted/`、`test/fixtures/source-integrity/bundled-packaging-missing-evidence-blocked/`：Story 5.5 focused tests 和 expected outputs。

如果这些文件已经由前置 stories 创建，修改前必须完整读取并保留既有 behavior。如果这些文件尚不存在，按前置 story implementation 顺序补齐或记录 blocker，不要绕过 owning SPECs 创建私有实现。

### SourceDescriptor Field Semantics（SourceDescriptor 字段语义）

| Field（字段） | Required Semantics（必要语义） | Guardrail（护栏） |
| --- | --- | --- |
| `sourceType` | 只能是 SPEC 声明的 7 个 source types。 | 不新增别名；CLI/input aliases 只能在 source selection 层归一。 |
| `channel` | 用户选择的 channel 或 source selection channel。 | 不替代 resolved version；不得包含 credential-bearing source locator。 |
| `requestedVersion` | 用户请求的 range、dist-tag、tag、branch、ref 或 selector。 | 不得覆盖 `version`。 |
| `version` | resolved installed source version 或 display-safe resolved source version。 | Git 可使用 resolved commit display 语义；requested selector 不得写入此字段。 |
| `resolvedRoot` | project-relative POSIX path 或 display-safe source label。 | 不得泄露 cache、temp、absolute path、home directory、drive letter。 |
| `contentHash` | content-addressable source artifact hash；tarball/offline/local required。 | Registry/Git 不伪造；tarball/offline artifact hash 不与 extracted tree hash 混用。 |
| `integrityEvidence` | 至少一项可复现 evidence，按 SPEC 稳定排序。 | `verified: false` 不表示失败；失败必须转 `source-integrity` issue。 |
| `trustStatus` | `trusted`、`unverified` 或 `blocked`。 | 只能由 centralized trust evaluator 推导；不得在 reporter/manifest/validate 里重算。 |

### Trust Status Matrix（信任状态矩阵）

| Source Class（来源类别） | Trusted（可信） | Unverified（未验证） | Blocked（阻断） |
| --- | --- | --- | --- |
| `bundled` | packaging manifest / package hash / package lock match 可验证。 | 有 reproducible packaging evidence 但未命中 trust anchor，且用户确认。 | 缺少 packaging evidence、hash/lock mismatch 或 source policy failure。 |
| `npm` / `private-registry` | expected hash 或 lock match。 | 有 `registry-integrity` / `version-lock` reproducible evidence，但无 trust anchor，且用户确认。 | missing evidence、hash/lock mismatch、registry unreachable、auth required、unsupported selector。 |
| `local-tarball` / `offline-bundle` | artifact hash 匹配 expected hash 或 lock。 | 有 artifact `content-hash`，无 trust anchor，且用户确认。 | unreadable、missing evidence、hash/lock mismatch、unsupported artifact、staging failure 影响安全。 |
| `local` | allowlist snapshot hash 匹配 expected hash 或 lock。 | 有 allowlist snapshot evidence，无 trust anchor，且用户确认。 | self-reference、missing evidence、hash/lock mismatch、unsupported source shape。 |
| `git` | resolved commit evidence 匹配 expected hash 或 lock。 | 有 concrete resolved `git-commit` evidence，无 trust anchor，且用户确认。 | floating remote/branch/tag、unresolved ref、auth failure、unsupported transport、missing commit evidence。 |

### Reporting Matrix（报告矩阵）

- `install --json`：`data.sourceDescriptor` 是 automation truth；`issues` 和 `nextActions` 承载 blocking source-integrity diagnostics；不新增 `sourceSummary` 或 `trustReport` blob。
- Human-readable install summary / ready summary：Source block 展示 source type、display-safe label、channel/requestedVersion/version、evidence summary、`trustStatus` 和 next action；不把 unverified 表述为安全通过。
- `status --json`：从本地 manifest/index 读取 source descriptor projection 和 high-level health；允许 `issues: []`，不得把 status 当成 validate。
- `validate --json`：检查 descriptor/evidence shape、manifest/index 和 installed state consistency；`checkedCategories` 遵守 canonical issue category order，且不访问 source origin。
- Manifest/index：只存 installed projection；不存 registry URL、remote URL、local path、cache/temp/staging/checkout/auth fields。
- Fixture snapshots：parse JSON 做 semantic comparison；normalize/omit允许的 timestamps；不得出现 absolute path、home directory、credentials、cache path、temporary extraction path 或 platform-specific separators。

### Previous Story Intelligence（前序 Story 情报）

- Story 4.6 强调 ready-for-dev story context 不是源码完成证据，并要求实现前重新检查 root scaffold、前置 anchors 和 dirty worktree。Story 5.5 必须继承这一前置检查。
- Story 5.1 建立 source selection、external access intent、no access/no write before confirmation、source summary redaction 和 `SourceResolutionPlan -> InstallPlan` 顺序。Story 5.5 不能绕过这些边界重新访问 source。
- Story 5.2 建立 registry trust discipline：registry source 不能因为 public/private registry 类型 trusted；`trusted` 来自 expected hash/lock match，可复现 registry evidence 无 trust anchor 时是 `unverified`，缺失/mismatch/auth/unreachable 是 `blocked`。
- Story 5.3 建立 local artifact/path integrity discipline：tarball/offline bundle artifact hash 与 extracted tree hash 分离；local snapshot 只覆盖 allowlist；staging/cache/temp path 永远 private；validate/status 不重新读取 project-external source。
- Story 5.4 建立 Git source pinning discipline：Git source 必须解析到 concrete commit SHA；branch/tag/remote-only 是 floating source 并 blocked；Git remote/raw stderr/temporary checkout 不得进入 public output。
- Story 5.1-5.4 均强调 source-specific resolver 只解除各自范围的 unsupported boundary。Story 5.5 是 reporting/trust/schema 收口，不得重写 resolver internals 或扩展到 Epic 6 full fixture matrix。
- 最近 5 个 commit 均为 docs/context/source/glossary/specs 方向，没有可复用的 TypeScript implementation commit pattern。实现必须以 live owning SPEC、previous story contexts 和实际源码为准，不以 docs commits 推断源码已存在。

### Latest Technical Information（最新技术信息）

- Node.js official releases 页面在 2026-05-26 显示 Node 22 和 Node 24 为 LTS、Node 26 为 Current，并说明 production applications should use Active LTS or Maintenance LTS。实现保持 `engines.node >=22`、Node 22/24 fixture matrix，不升级到 Node 26。Source: https://nodejs.org/en/about/previous-releases
- npm registry docs 说明 npm 默认使用 public registry `https://registry.npmjs.org`，registry URL 可由 scope 和 config 决定，auth tokens/certificates scoped to individual registry。实现 private registry source reporting 时只能展示 display-safe registry label，不得输出 token、credential-bearing URL 或 private query string。Source: https://docs.npmjs.com/cli/v11/using-npm/registry/
- npm package-lock docs 说明 package entry 的 `resolved` 表示实际 resolved source，registry source 通常是 tarball URL，Git source 可包含 commit SHA，link/local tarball 可表现为 file target；`integrity` 是 unpacked artifact 的 SRI 字符串。Story 5.5 只把这些作为生态参考；SpecLite trust/evidence 仍以 source descriptor SPEC 为真源。Source: https://docs.npmjs.com/cli/v8/configuring-npm/package-lock-json/
- Git 官方 `git ls-remote` 文档说明输出格式为 `<oid> TAB <ref> LF`；Git 官方 `git rev-parse --verify --end-of-options <rev>^{commit}` 可验证 commit-ish object。Story 5.5 不新增 Git resolver，但 reporting 必须尊重 Story 5.4 的 resolved commit evidence 与 redacted Git diagnostics。Sources: https://git-scm.com/docs/git-ls-remote, https://git-scm.com/docs/git-rev-parse
- No new third-party dependency is required by default. 如需调整 schema/parser 或 redaction helper，优先使用 Node 22-compatible APIs 和 architecture-pinned libraries；新增 dependency 前必须确认 package policy、Node 22 support、testability、redaction behavior 和 offline determinism。

### Contract Requirements（契约要求）

- `_bmad-output/planning-artifacts/specs/README.md` 定义 implementation reading order：owning SPEC 是字段/issue/fixture/schema 真源，PRD 和 Architecture 只是摘要与映射；archive 不参与 live gate。
- `_bmad-output/planning-artifacts/specs/02-source-descriptor-contract.md` 拥有 `SourceDescriptor`、`SourceIntegrityEvidence`、source type rules、trust status、source staging/cache redaction、source lock boundary 和 validate no-network boundary。
- `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md` 拥有 `CommandResult` envelope、`InstallCommandData`、`StatusCommandData`、`ValidateCommandData`、`ValidationIssue` model、path policy、timestamp policy、ordering、summary policy 和 fixture comparison policy。
- `_bmad-output/planning-artifacts/specs/03-install-plan-contract.md` 拥有 `SourceResolutionPlan`、external access、`InstallPlan`、confirmation、`writeAuthorized`、operation lock、safe write 和 rollback boundary。
- `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md` 拥有 manifest/index installed projection、source descriptor projection、files index ownership/hash、canonical target order consumption 和 fixture update policy。
- `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md` 拥有 `source-integrity` category、reserved issue ids、default severity、redaction-safe details policy，以及 `source-integrity` 与 `file-integrity` category boundary。
- `_bmad-output/planning-artifacts/specs/08-fixture-contract.md` 拥有 `source-integrity` group required sub-cases、expected output classes、semantic JSON comparison、snapshot redaction、ready summary gate 和 release gate classification。
- ADRs 可以解释决策历史，但不得重新定义 field-level schema、issue taxonomy、fixture layout、command payload 或 implementation anchors。若 ADR 与 owning SPEC 冲突，follow owning SPEC。

### Testing Requirements（测试要求）

- Use Vitest。
- Tests 必须 deterministic、local-only，不访问 npm registry、private registry、Git remote、offline bundle origin、package-manager cache、remote provenance service 或外部网络。
- 使用 injected registry/Git/filesystem clients、temporary files/directories、fixture source packages 或 local fixture metadata 构造 source descriptor cases。不要使用当前 repo 的 `_bmad` 或 `_bmad-output` 作为 installed target state。
- JSON tests 必须 parse 后断言 semantic fields。不要比较 raw pretty-printed JSON bytes，除非 formatting 本身是测试目标。
- Human-readable output tests 必须覆盖 Evidence profile Source block、trustStatus text equivalent、`NO_COLOR`、non-TTY、CI 和窄终端 fallback，确保 source type、display-safe label、trustStatus、issueId 和 next action 不丢失。
- Redaction tests 必须覆盖 credentials、credential-bearing URL、private query string、private registry host/proxy、home directory、drive letter、OS-specific separator、cache path、temporary extraction path、staging path、temporary Git checkout/object DB、raw stderr/stdout error 和 stack trace。
- Validate/status no-network tests 必须通过 mock/spies 证明 source origin clients 未被调用；不能只依赖没有网络配置。
- Fixture snapshots 必须 normalize 或 exclude timestamps、duration、operation-lock volatile fields、temporary paths、environment-specific paths、home directory、generated metadata timestamps 和 redacted external path diagnostics。
- Fixture coverage 不得扩大到 Epic 6 full release matrix；Story 5.5 只补齐 source descriptor trust/reporting closure 与 bundled packaging focused cases，并复核 Epic 5 source-integrity sub-cases的一致性。

### Project Context Reference（项目上下文引用）

- `_bmad-output/project-context.md` currently contains initialized metadata and placeholder sections only; it does not add implementation rules beyond live PRD, Architecture, UX, ADR and owning SPEC artifacts.
- The project-level language rule remains: conversation and generated docs in Chinese, section headings in `English（中文）` form, technical identifiers in English.

### References（参考资料）

- `_bmad-output/planning-artifacts/epics/08-epic-5-source-integrity-and-distribution-channels来源完整性与分发渠道.md`
- `_bmad-output/implementation-artifacts/5-1-source-selection-and-channel-summary.md`
- `_bmad-output/implementation-artifacts/5-2-registry-source-resolution-and-diagnostics.md`
- `_bmad-output/implementation-artifacts/5-3-local-tarball-offline-bundle-and-local-path-integrity.md`
- `_bmad-output/implementation-artifacts/5-4-git-source-pinning-and-floating-source-rejection.md`
- `_bmad-output/implementation-artifacts/4-6-explicit-repair-for-recoverable-installer-owned-drift.md`
- `_bmad-output/planning-artifacts/prd/06-domain-specific-requirements领域特定需求.md`
- `_bmad-output/planning-artifacts/prd/08-developer-tool-specific-requirements开发者工具特定需求.md`
- `_bmad-output/planning-artifacts/prd/10-functional-requirements功能需求.md`
- `_bmad-output/planning-artifacts/prd/11-non-functional-requirements非功能需求.md`
- `_bmad-output/planning-artifacts/architecture/03-core-architectural-decisions核心架构决策.md`
- `_bmad-output/planning-artifacts/architecture/04-implementation-patterns-consistency-rules实现模式与一致性规则.md`
- `_bmad-output/planning-artifacts/architecture/05-project-structure-boundaries项目结构与边界.md`
- `_bmad-output/planning-artifacts/architecture/06-architecture-validation-results架构验证结果.md`
- `_bmad-output/planning-artifacts/ux-design-specification.md`
- `_bmad-output/planning-artifacts/specs/README.md`
- `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md`
- `_bmad-output/planning-artifacts/specs/02-source-descriptor-contract.md`
- `_bmad-output/planning-artifacts/specs/03-install-plan-contract.md`
- `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md`
- `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md`
- `_bmad-output/planning-artifacts/specs/08-fixture-contract.md`
- `_bmad-output/planning-artifacts/adr/0004-source-descriptor-trust-model.md`
- `_bmad-output/planning-artifacts/adr/0005-manifest-index-contract-boundary.md`
- `_bmad-output/planning-artifacts/adr/0006-validation-issue-taxonomy-boundary.md`
- `_bmad-output/project-context.md`
- Node.js releases: https://nodejs.org/en/about/previous-releases
- npm registry docs: https://docs.npmjs.com/cli/v11/using-npm/registry/
- npm package-lock docs: https://docs.npmjs.com/cli/v8/configuring-npm/package-lock-json/
- Git `ls-remote`: https://git-scm.com/docs/git-ls-remote
- Git `rev-parse`: https://git-scm.com/docs/git-rev-parse

## Dev Agent Record（开发代理记录）

### Agent Model Used（使用的代理模型）

TBD by dev agent.

### Debug Log References（调试日志引用）

TBD by dev agent.

### Completion Notes List（完成备注列表）

- Story context created by bmad-create-story sub-agent for Story 5.5 only.
- Ultimate context engine analysis completed - comprehensive developer guide created.

### File List（文件列表）

TBD by dev agent.
