# Story 5.3: Local Tarball, Offline Bundle And Local Path Integrity（本地包、离线包与本地路径完整性）

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story（故事）

作为项目维护者，  
我希望 SpecLite 能从 local tarball、offline bundle 或 local path 安装，并记录可复现的完整性证据，  
以便在离线、受限网络或内部交付场景中安全验证安装来源。

## Acceptance Criteria（验收标准）

1. **Local tarball records artifact hash and redacts path（Local Tarball 记录 Artifact Hash 并脱敏路径）**  
   **前提** 用户选择 local tarball source；  
   **当** 系统执行 source resolution；  
   **则** 系统会验证 tarball 可读取并记录包文件 artifact hash；  
   **并且** public output 不泄露本机 absolute source path。

2. **Offline bundle records artifact hash and hides extraction state（Offline Bundle 记录 Artifact Hash 并隐藏解包状态）**  
   **前提** 用户选择 offline bundle source；  
   **当** 系统执行 source resolution；  
   **则** 系统会验证 bundle 可读取并记录 offline bundle artifact hash；  
   **并且** 不在 public JSON、manifest/index 或 fixture snapshot 中暴露临时解包目录。

3. **Local path snapshot hash is allowlist-based（Local Path Snapshot Hash 基于 Allowlist）**  
   **前提** 用户选择 local path source；  
   **当** 系统计算 local source snapshot hash；  
   **则** hash 只覆盖 canonical source tree allowlist；  
   **并且** 排除 `.git`、临时文件、`node_modules`、fixture output、本地 cache、build output 和 editor/OS metadata。

4. **Local source self-reference is blocked（Local Source Self-Reference 被阻断）**  
   **前提** 用户选择 local path source；  
   **当** 该 path 指向目标项目的 installed state、IDE mirrors、workflow output、dependency/cache/build 目录；  
   **则** source 必须被标记为 `blocked`；  
   **并且** 不得把 `_speclite/`、`.claude/skills/`、`.agents/skills/`、`_speclite-output/`、fixture output、`node_modules/`、cache、temporary 或 build output 当作 canonical source root。

5. **Artifact hash and extracted tree hash stay separate（Artifact Hash 与解包后 Tree Hash 保持分离）**  
   **前提** tarball 或 offline bundle 被解包用于安装规划；  
   **当** 系统需要记录 expected installed state 输入；  
   **则** 可以额外记录解包后的 canonical source tree hash；  
   **并且** 不得与 artifact `contentHash` 混用或把 cache/extraction directory hash 当成 source evidence。

6. **Missing local evidence blocks writes（缺少本地来源证据阻断写入）**  
   **前提** local tarball、offline bundle 或 local path source 缺少 integrity evidence；  
   **当** source resolution 结束；  
   **则** source 必须被标记为 `blocked`；  
   **并且** 命令输出 `source-integrity` error 并阻止写入。

7. **Reproducible evidence without trust anchor stays unverified（无信任锚的可复现证据保持 Unverified）**  
   **前提** local tarball、offline bundle 或 local path source 有可复现 evidence 但没有 expected hash 或 lock match；  
   **当** 系统计算 trust status；  
   **则** source 可以标记为 `unverified`；  
   **并且** 只有用户显式选择并确认后才能进入 install planning。

8. **Staging and unreadable failures are stable and redacted（暂存与不可读失败稳定且脱敏）**  
   **前提** source staging 或临时解包过程中发生失败；  
   **当** 命令输出诊断结果；  
   **则** issue 使用稳定 `source-integrity` issue id，例如 tarball unreadable 或 offline bundle unreadable；  
   **并且** cache path、temporary extraction path 和本机 absolute path 必须 redacted。

## Tasks / Subtasks（任务 / 子任务）

- [ ] Task 1: 验证前置实现、工作树和只读边界（AC: 1-8）
  - [ ] 实现前重新检查 root `package.json`、`package-lock.json`、`src/`、`test/`、`tests/`、root `fixtures/` 是否与当前 sprint/source 状态一致。截至 2026-05-29，Epic 3 提交 `395b017` 已提供 root TypeScript CLI scaffold、`src/commands/update.ts`、`CommandResult` / `ValidationIssue` anchors 和 validation/diagnostics tests；Epic 4 update/repair write anchors 与 Epic 5 source anchors 仍必须按当前源码验证。
  - [ ] 确认 Story 5.1 的 source selection、external access intent、source summary confirmation、redaction policy 和 unsupported custom source boundary 是否真实实现；若不存在，先按前序 story 顺序补齐或记录 blocker，不得绕过 5.1 直接读取 project-external local sources。
  - [ ] 确认 Story 5.2 的 registry-specific implementation 不被本 Story 回归；本 Story 只能解除 `local-tarball`、`offline-bundle` 和 `local` 这三个 source type 的 unsupported boundary。
  - [ ] 确认 Story 3.5 `CommandResult` / `ValidationIssue` anchors 仍可复用，并重新验证 Story 4.3 plan-before-write、Story 4.4 operation lock/safe write、Story 5.1 source descriptor projection 和 Story 5.2 trust/evidence helpers 是否真实存在；若不存在，不得创建私有 JSON shape、私有 trust model 或隐藏写入流程。
  - [ ] 检查当前 worktree dirty 状态，保留用户、父 agent 或其他 sub-agent 的 planning artifacts、story 文件、源码和状态文件改动；不得格式化、重写、同步或回滚无关文件。
  - [ ] 修改任何 UPDATE 文件前完整读取该文件，记录 current behavior、data shape、public output、tests 和必须保留的行为。

- [ ] Task 2: 接入 local tarball artifact resolver（AC: 1, 5-8）
  - [ ] 在 `src/source/` 的既有 source resolver dispatch 中为 `local-tarball` 接入 tarball-specific resolver；不要在 `src/commands/install.ts`、reporter、fixture helper 或 validation rule 中复制 tarball resolution logic。
  - [ ] 复用 Story 5.1 的 `SourceResolutionPlan.externalAccesses[]`：读取 tarball 前必须已有 display-safe source label、reason 和 confirmation state；未确认时不读取 tarball、不解包、不获取 operation lock、不写项目文件。
  - [ ] 验证 tarball 路径指向可读取文件；不可读取、权限不足、不是 regular file 或 parser/extractor 不支持时输出 `source-integrity.tarball-unreadable` 或 owning SPEC 中更具体的 reserved issue，不得输出 raw filesystem error。
  - [ ] 对 tarball 文件本身按 raw bytes 计算 `sha256` artifact hash，并写入 `SourceDescriptor.contentHash` 和 `integrityEvidence[]` 中的 `content-hash` evidence；不要用解包后目录 hash、npm cache hash、mtime 或平台 metadata 替代 artifact hash。
  - [ ] 如果 expected hash 或 lock match 成功，`trustStatus` 可以是 `trusted`；如果只有可复现 artifact hash 且用户显式选择并确认，`trustStatus` 可以是 `unverified`；missing evidence、hash mismatch 或 unsupported tarball shape 必须为 `blocked`。
  - [ ] Public output、manifest/index、fixture snapshot 和 `ValidationIssue.details` 只能展示 display-safe tarball label 或 redacted diagnostic object；不得包含 absolute path、home directory、drive letter、OS-specific separator、cache path 或 temporary extraction path。

- [ ] Task 3: 接入 offline bundle resolver 与 staging redaction（AC: 2, 5-8）
  - [ ] 在 `src/source/` 中接入 `offline-bundle` resolver，保持与 tarball resolver 相同的 pre-confirmation no-read/no-extract/no-write 顺序。
  - [ ] 验证 offline bundle 可读取，并对 bundle artifact raw bytes 计算 `sha256` hash；`SourceDescriptor.contentHash` 对 bundle artifact required。
  - [ ] 如果 bundle 需要 staging/extraction，staging root、temporary extraction path、package-manager cache path 和 cleanup nonce 都是 private implementation state；不得进入 `CommandResult`、manifest/index、files index、fixture snapshot、impact、suggestedNextStep 或 `ValidationIssue.details`。
  - [ ] Controlled success 和 controlled failure 应 best-effort cleanup staging/extraction directories；cleanup failure 只有影响 target project safety、write eligibility 或 redaction safety 时才产生 public issue，且必须 redacted。
  - [ ] Offline bundle 不可读、格式不支持、缺少 source payload 或 extraction failure 使用稳定 `source-integrity.offline-bundle-unreadable` 或 owning SPEC 中更具体的 reserved issue；不得把 stack trace、temp path 或 absolute bundle path 写入 public output。
  - [ ] 解包后的 canonical source tree hash 只能作为 optional expected installed-state input；不得覆盖 artifact `contentHash`，不得把 raw extraction directory hash 当作 source evidence。

- [ ] Task 4: 实现 local path snapshot allowlist 与 self-reference guard（AC: 3-4, 6-8）
  - [ ] 在 `src/source/` 中集中实现 local path resolver / snapshot hasher；不得在 installer runner、manifest generator、validation rule 或 fixture helper 中复制 allowlist/hash 规则。
  - [ ] Local path source 进入 snapshot 前必须运行 self-reference guard，并基于 normalized project root、resolved source root 和 blocked root kinds 判断是否指向 target project installed state、IDE execution plane、workflow output、dependency、cache、temporary 或 build output。
  - [ ] 至少阻断 `_speclite/`、`.claude/skills/`、`.agents/skills/`、`_speclite-output/`、fixture output、`node_modules/`、cache、temporary 和 build output；命中时输出 `source-integrity.local-source-self-reference`，`details.reason` 固定为 `local-source-self-reference`，`details.blockedRootKind` 使用稳定枚举值，不包含 raw path。
  - [ ] Snapshot hash scope 只能覆盖 canonical source tree allowlist。Allowlist 应来自 source discovery / module metadata / canonical source package boundaries；如果实际 source layout 尚未由前序实现固化，先读取 `assets/source/speclite/` 和前置 source discovery anchors，不得对整个 repository 做递归 hash。
  - [ ] Snapshot hash 必须排除 `.git`、temporary files、`node_modules`、fixture output、本地 cache directories、build output、editor/OS metadata、safe-write temp files、operation lock 和所有 project-external staging roots。
  - [ ] Local source snapshot hash 使用 deterministic traversal：project-relative POSIX path normalization、stable lexicographic ordering、raw file bytes、fixed inclusion/exclusion policy；不得依赖 filesystem traversal order、mtime、ctime、inode、owner、platform separator 或 async completion order。
  - [ ] Local absolute source path 不得进入 stable public JSON、manifest/index、fixture snapshot 或 human-readable output；对 project-external local source 只能展示 display-safe label 或 `RedactedExternalPathDiagnostic` shape。

- [ ] Task 5: 推导 local source trustStatus 与 write eligibility（AC: 5-7）
  - [ ] `trusted` 只能由 expected hash、lock match 或 owning SPEC 明确允许的等价 trust anchor 产生；local tarball、offline bundle 或 local path source 不得因为 source type、本机文件存在、用户选择、企业内网来源或离线来源而自动 trusted。
  - [ ] 有 artifact hash / snapshot hash 等可复现 evidence、没有 expected hash 或 lock match、且没有 blocking issue 时，source 使用 `trustStatus: "unverified"`；只有用户显式选择并确认该 source 后才能进入 install planning。
  - [ ] Missing evidence、hash mismatch、lock mismatch、self-reference、unsupported source shape、source policy rejection、unreadable artifact 或 failed evidence verification 必须产生 `source-integrity` error，`trustStatus: "blocked"`，并阻止 InstallPlan planned writes。
  - [ ] `integrityEvidence[].verified === false` 只能表示 evidence 可复现但没有 trust anchor 背书；不得用于表示 verification failure。Verification failure 必须变成 blocked issue。
  - [ ] `SourceDescriptor.integrityEvidence` 排序遵守 CommandResult SPEC：registry integrity / version lock -> content hash -> git commit；本 Story 产生的 `content-hash` entries 同 kind 多条按 normalized stable key 排序。
  - [ ] `--yes` 或 command-level write confirmation 不得自动接受 missing evidence、hash mismatch、self-reference、unsupported source、unreadable artifact 或 source policy rejection。

- [ ] Task 6: 维护 CommandResult、manifest/index、status 和 validate 边界（AC: 1-8）
  - [ ] `install --json` 继续输出 `CommandResult<InstallCommandData>`，`command: "install"`，`data.paths.projectRoot: "."`；不得新增未契约化 `sourceSummary`、`localSourceReport`、`stagingPath` 或 automation-only blob。
  - [ ] Manifest/index 只投影 source descriptor owning SPEC 允许的 fields；不得加入 raw tarball path、offline bundle path、local path、extraction root、cache path、artifact file name、host-specific temporary metadata 或 parser implementation fields。
  - [ ] `speclite status` 只读取本地 manifest/source descriptor summary；不得重新读取 tarball、重新解包 offline bundle、重新扫描 project-external local path、访问 package-manager cache 或执行 implicit update/source freshness check。
  - [ ] `speclite validate` 只检查本地 recorded source descriptor、integrity evidence shape、manifest/index、files index、IDE mirrors 和 local installed-state hash baseline；不得访问 npm registry、private registry、Git remote、offline bundle origin、tarball origin、project-external local source 或 temporary extraction roots。
  - [ ] Source resolver / install planning 阶段的本地来源问题使用 `source-integrity`；已安装文件、files index 或 IDE mirror drift 使用 `file-integrity` 或 `ide-mirror`，不得混用 category。
  - [ ] Human-readable output 使用 Evidence profile：Summary、Source、External Access、Authorization、Issues、Next Actions；`trusted`、`unverified`、`blocked` 必须有文本等价解释，不依赖颜色或图标。
  - [ ] `NO_COLOR`、non-TTY、CI、Windows path portability 和窄终端下，source type、display-safe label、content hash summary、trustStatus、issueId 和 next action 仍必须纯文本可读。

- [ ] Task 7: 编写 focused tests 与 source-integrity fixture assertions（AC: 1-8）
  - [ ] Unit tests 覆盖 local tarball：readable artifact hash、`contentHash` required、`content-hash` evidence、expected hash match -> `trusted`、no trust anchor -> `unverified`、hash mismatch/missing evidence/unreadable -> `blocked`。
  - [ ] Unit tests 覆盖 offline bundle：artifact hash、private extraction root、cleanup best-effort redaction、optional canonical tree hash 与 artifact `contentHash` 分离、unreadable/extraction failure diagnostics。
  - [ ] Unit tests 覆盖 local path snapshot：allowlist inclusion、required exclusions、stable traversal ordering、raw-byte hash、path separator normalization、mtime/platform metadata ignored。
  - [ ] Unit tests 覆盖 self-reference guard：`_speclite/`、`.claude/skills/`、`.agents/skills/`、`_speclite-output/`、fixture output、`node_modules/`、cache、temporary、build output 各自产生 stable `blockedRootKind`。
  - [ ] Diagnostics/redaction tests 覆盖 absolute path、home directory、drive letter、OS-specific separator、cache path、temporary extraction path、safe-write temp path、stack trace、raw fs error 和 credentials 不进入 public JSON、human-readable output 或 fixture snapshots。
  - [ ] JSON contract tests 覆盖 `CommandResult<InstallCommandData>`、`data.sourceDescriptor.contentHash`、`integrityEvidence` 排序、`issues` 排序、`nextActions` 排序、path policy 和 no staging/cache leakage。
  - [ ] Validate/status no-access tests 使用已安装 local descriptor fixture，断言不会重新读取 project-external source artifact、offline bundle origin、temporary extraction root、package-manager cache 或 local source root。
  - [ ] Fixture assertions 仅覆盖 Story 5.3 范围：`source-integrity/local-source-snapshot-unverified`、`source-integrity/local-source-path-redacted`、`source-integrity/local-source-installed-state-blocked`、`source-integrity/artifact-hash-mismatch-blocked`、`source-integrity/source-unreadable-blocked` 中的 tarball/offline unreadable sub-cases；不要提前实现 Story 5.4 Git pinning、Story 5.5 full reporting 或 Epic 6 full fixture matrix。
  - [ ] 所有 tests 必须 deterministic、local-only，不访问 npm registry、private registry、Git remote、offline bundle origin、package-manager cache 或外部网络；local artifacts 使用 temporary test files、fixture source packages 或 injected filesystem/extractor。

- [ ] Task 8: 本地验证与范围控制（AC: 1-8）
  - [ ] 运行 `npm run build`。
  - [ ] 运行 `npm test`，或至少运行 local source resolver、tarball/offline bundle resolver、source descriptor schema、install plan、diagnostics output、redaction、validate no-access 和 affected source-integrity fixtures 的 focused Vitest tests。
  - [ ] 如果前置 implementation 尚未完成，保留失败为有效前置信号；不要伪造 fixture pass、不要跳过 local source/redaction/no-access tests、不要创建 private JSON shape。
  - [ ] 检查 diff，确认没有修改 `_bmad-output/planning-artifacts/`、Story 5.1、Story 5.2、已有 Story 1-4 文件、无关源码或用户改动。
  - [ ] 检查 diff，确认没有提前实现 Story 5.4 Git source pinning、Story 5.5 source descriptor full trust reporting、Epic 6 fixture matrix、Post-MVP `doctor` / `sync` / `uninstall`、enterprise allowlist、signatures、provenance verification 或完整 source lockfile lifecycle。

## Dev Notes（开发备注）

### Current Repository State（当前仓库状态）

- 截至 2026-05-29 的 Epic 3 提交 `395b017`，root TypeScript CLI scaffold、status/validate/update command anchors、`CommandResult` / `ValidationIssue` schema、diagnostics/output 和 validation ordering anchors 已存在。root `fixtures/`、Epic 4 update/repair write behavior 和 Story 5.1/5.2 source anchors 仍需按当前源码逐项确认。
- Story 3.5 anchors 已存在，但 Epic 3 没有实现 source-integrity domain rule、source descriptor trust model 或 local tarball/offline bundle behavior；不要把 canonical category reserved position 当成 Epic 5 source-integrity 已落地。Story 5.3 的 ready-for-dev context 不是其自身实现完成证据。
- 当前 worktree 已有与本 Story 创建无关的 dirty planning artifacts、`sprint-status.yaml` 改动和未跟踪 Epic 1-5 story 文件。实现 Story 5.3 时不得格式化、重写、同步或回滚这些无关改动。
- `_bmad-output/project-context.md` 当前仍是初始化占位内容；实际 implementation guardrails 以 live PRD、Architecture、UX、ADR 和 owning SPEC artifacts 为准。
- 本 create-story run 使用 `python3.12 _bmad/scripts/resolve_customization.py --skill .agents/skills/bmad-create-story --key workflow` 成功解析 workflow；裸 `python3` 在本机可能是 3.9.6，不满足 resolver 对 `tomllib` 的要求。

### Scope Boundary（范围边界）

- 本 Story 负责：`local-tarball` artifact hash、`offline-bundle` artifact hash、local path snapshot hash allowlist、local source self-reference blocking、source staging/extraction/cache path redaction、local-source `trustStatus` 推导、local source-specific diagnostics、install/status/validate no-access boundary 和 focused tests。
- 本 Story 消费：
  - Story 5.1 的 source selection、source type display、external access intent、source summary confirmation、redaction policy 和 unsupported custom source boundary。
  - Story 5.2 的 source resolver dispatch、trust/evidence helper patterns、registry no-network validate/status boundary 和 source-integrity diagnostics discipline。
  - Story 3.5 的 `CommandResult` / `ValidationIssue` public JSON contract、issue ordering、path policy、timestamp policy 和 `InstallCommandData.sourceDescriptor` projection。
  - Story 4.3 的 plan-before-write、write authorization、planned vs actual result separation 和 Evidence profile output。
  - Story 4.4 的 project operation lock、safe write 和 operation-lock pre-write failure boundary。
  - Source descriptor owning SPEC 的 content hash、snapshot hash、trust status、source staging/cache redaction 和 validate no-network contract。
- 本 Story 不负责：source selection UI 本身（Story 5.1）、npm public/private registry source resolution（Story 5.2）、Git commit pinning/floating source rejection（Story 5.4）、full cross-source reporting matrix（Story 5.5）、complete source lockfile lifecycle、enterprise source policy、signatures、provenance verification、allowlists、Post-MVP `doctor`/`sync`/`uninstall` 或 Epic 6 full fixture matrix。

### Architecture Requirements（架构要求）

- Runtime baseline 保持 Node.js 22 minimum 和 Node.js 24 recommended。Node.js official releases 在 2026-05-26 显示 Node 22 与 Node 24 为 LTS、Node 26 为 Current，并说明生产应用应使用 Active LTS 或 Maintenance LTS。不要把 MVP baseline 提升到 Node 26，也不要使用 Node 24-only API，除非提供 Node 22-compatible path 并更新 runtime policy / fixtures。Source: https://nodejs.org/en/about/previous-releases
- CLI foundation 保持 TypeScript + commander。不要为 local artifact resolution 引入 oclif/yargs/cac/clipanion，也不要把 source resolution 绑定到 commander lifecycle。
- Runtime schema validation 继续使用 architecture-pinned `zod@4.4.3` 与 executable schema/parser anchors。不要为 tarball/offline bundle/local path diagnostics 或 source descriptor 引入新的 schema/runtime validation library。
- Storage model 是 filesystem-first / local-first。不要引入 database、web service、daemon、REST API、GraphQL、desktop UI、persistent source cache server 或 background process。
- `src/commands/install.ts` 只做 flag/prompt mapping 和 orchestration；local artifact/path resolution 属于 `src/source/`；external access planning 属于 `src/installer/` 与 `src/source/` 的 internal planning boundary；public projection/rendering 属于 `src/diagnostics/`；write boundary 属于 `src/installer/` 与 `src/fs/`。
- `src/source/` 是 source/channel abstraction 的唯一领域边界；它把 bundled source、registry、tarball、offline bundle、Git source 和 local path 归一为 canonical source descriptor 或 stable `source-integrity` failure。
- `src/fs/` 是 path normalization、redacted external path helpers、safe writes 和 platform filesystem preflight 的唯一低层边界；source resolver 可以消费这些 helpers，但不得复制 path escape、separator normalization 或 redaction rules。

### Implementation Anchors（实现锚点）

需要创建或扩展的 implementation anchors，实际命名应贴合已有实现：

- `src/commands/install.ts`：复用 Story 5.1 source selection，传入 local tarball/offline bundle/local path source request、confirmation state 和 command context，不直接读取或 hash source artifacts。
- `src/source/source-descriptor-schema.ts`：`SourceDescriptor`、`SourceIntegrityEvidence`、`content-hash` executable schema/parser anchor。
- `src/source/source-resolver.ts`：source-specific resolver orchestration，dispatch `local-tarball`、`offline-bundle` 和 `local` 到对应 resolver，并把 failures 归一为 source-integrity issues。
- `src/source/local-artifact-resolver.ts`、`src/source/tarball-source-resolver.ts`、`src/source/offline-bundle-source-resolver.ts` 或等价模块：readability checks、artifact hash、private staging/extraction lifecycle 和 redacted failures。
- `src/source/local-path-source-resolver.ts` 或等价模块：local source self-reference guard、canonical source tree allowlist、snapshot hash 和 display-safe source label。
- `src/source/source-integrity.ts`：local artifact unreadable、missing evidence、hash/lock mismatch、self-reference、redaction-safe details builder；不得与 `file-integrity` 混用。
- `src/installer/install-plan-schema.ts`：`SourceResolutionPlan`、`ExternalAccess`、`InstallPlan`、confirmation 和 `writeAuthorized` schema/parser anchor。
- `src/installer/install-runner.ts`：保持 source summary confirmation、local source resolution、install planning、operation lock 和 write/apply 顺序。
- `src/manifest/manifest-schema.ts`：source descriptor installed projection；不得加入未契约化 local path、bundle path、extraction root、cache path 或 artifact implementation fields。
- `src/validation/rules/source-integrity.ts`：validate local recorded source descriptor/evidence shape；不得重新读取 local source origins 或 staging roots。
- `src/diagnostics/command-result-schema.ts`：`CommandResult<InstallCommandData>`、`ValidationIssue` 和 source descriptor public projection。
- `src/diagnostics/command-result.ts`：status/exit-code derivation、source-integrity issue ordering、nextActions ordering。
- `src/diagnostics/output.ts`：Evidence profile 中的 Source、External Access、Authorization、Issues、Next Actions 和 redaction-safe local source labels。
- `src/fs/path-normalizer.ts`：project-relative POSIX path policy、blocked root classification helpers 和 `RedactedExternalPathDiagnostic` helpers。
- `test/unit/source/`、`test/integration/install.test.ts`、`test/fixtures/source-integrity/local-source-snapshot-unverified/`、`test/fixtures/source-integrity/local-source-path-redacted/`、`test/fixtures/source-integrity/local-source-installed-state-blocked/`、`test/fixtures/source-integrity/artifact-hash-mismatch-blocked/`、`test/fixtures/source-integrity/source-unreadable-blocked/`：Story 5.3 focused tests 和 expected outputs。

如果这些文件已经由前置 stories 创建，修改前必须完整读取并保留既有 behavior。如果这些文件尚不存在，按前置 story implementation 顺序补齐或记录 blocker，不要绕过 owning SPECs 创建私有实现。

### Local Source Integrity Matrix（本地来源完整性矩阵）

| Scenario（场景） | Required Evidence（必要证据） | Trust Outcome（信任结果） | Diagnostics / Notes（诊断 / 备注） |
| --- | --- | --- | --- |
| Local tarball readable with expected hash or lock match | `content-hash` with `verified: true` or matching expected evidence | `trusted` | 信任来自 expected hash / lock match，不来自 tarball 文件存在。 |
| Local tarball readable with artifact hash only | `content-hash` with `verified: false`; `contentHash` required | `unverified` | 只有用户显式选择并确认后才能进入 install planning。 |
| Offline bundle readable with expected hash or lock match | `content-hash` with `verified: true` or matching expected evidence | `trusted` | Artifact hash 是 bundle 文件 raw bytes hash；staging/extraction path 不公开。 |
| Offline bundle readable with artifact hash only | `content-hash` with `verified: false`; `contentHash` required | `unverified` | 可选 tree hash 只能作为 expected installed-state input。 |
| Local path snapshot has allowlist hash and no trust anchor | `content-hash` with `verified: false`; snapshot hash based on canonical source tree allowlist | `unverified` | 排除 `.git`、`node_modules`、fixture output、cache、temp、build 和 editor/OS metadata。 |
| Local path points to installed state / IDE mirrors / workflow output / dependency / cache / temp / build | none | `blocked` | `source-integrity.local-source-self-reference` with stable `blockedRootKind`。 |
| Tarball/offline bundle/local source lacks reproducible evidence | none | `blocked` | `source-integrity.missing-evidence`；不得伪造 `contentHash`。 |
| Expected hash or lock mismatch for artifact/snapshot | mismatched evidence | `blocked` | `source-integrity.hash-mismatch` 或 `source-integrity.lock-mismatch`；阻止写入。 |
| Tarball unreadable | none | `blocked` | `source-integrity.tarball-unreadable`；redacted absolute path and raw fs error。 |
| Offline bundle unreadable or extraction failure | none | `blocked` | `source-integrity.offline-bundle-unreadable`；redacted bundle/extraction/cache paths。 |

### CommandResult And SourceDescriptor Requirements（CommandResult 与 SourceDescriptor 要求）

- `install --json` 必须输出 `CommandResult<InstallCommandData>`，`command: "install"`，`data.paths.projectRoot: "."`。
- `InstallCommandData.sourceDescriptor` 必须遵守 source descriptor SPEC；local tarball/offline bundle/local source 不得新增 `artifactPath`、`bundlePath`、`localPath`、`extractionRoot`、`cachePath`、`stagingRoot`、`snapshotFiles`、`sourceFileName` 或 implementation-only fields。
- Local tarball / offline bundle / local source snapshot 的 `contentHash` required，且语义为 artifact raw-byte hash 或 allowlist snapshot hash。Registry 和 Git sources 不需要伪造 `contentHash`。
- `content-hash` evidence 使用 `algorithm: "sha256"`；`verified: false` 表示 evidence 可复现但没有 expected hash 或 lock match 背书，不表示校验失败。
- Tarball/offline bundle 解包后的 canonical source tree hash 可作为 expected installed-state input，但不得覆盖 artifact `contentHash`，不得写入未契约化 top-level public field。
- `ValidationIssue.issueId` 必须是 `<category>.<stable-code>`；不得包含 file name、hash、path、platform、timestamp、count 或 random id。
- Public JSON 默认不得包含 timestamps；summary、impact、suggestedNextStep 和 nextActions 不得包含 raw path、hash、stack trace 或环境相关文本。
- Human-readable output 可以解释 local source integrity，但不得成为 automation-relevant state 的唯一承载位置；automation 依赖必须进入 `CommandResult.data`、`issues`、`nextActions`、manifest/index 或 fixture expected outputs。

### UX / Output Requirements（UX 与输出要求）

- Local source 读取或解包前必须展示 source type、display-safe source label、reason 和 confirmation state。
- `trusted`、`unverified`、`blocked` 必须在 human-readable output 中有文本等价解释；不得只依赖颜色或图标。
- Source summary 语气保持克制、具体、可操作；不要只输出 `done`，也不要把 `unverified` 表述为安全通过。
- Failure output 应组织为 Summary、Source、External Access、Issues、Next Actions；不要显示 raw fs error、raw extractor error、stack trace、absolute path、home directory、cache path 或 temporary extraction path。
- Self-reference failure 必须让用户知道 blocked root kind，但不得显示 raw local path；例如使用稳定 kind：`installed-state`、`execution-plane`、`workflow-output`、`dependency`、`cache`、`temporary`、`build-output`。
- `NO_COLOR`、non-TTY、CI、Windows path portability 和窄终端下，source type、display-safe label、trustStatus、issueId、blockedRootKind 和 next action 仍必须纯文本可读。

### Previous Story Intelligence（前序 Story 情报）

- Story 5.1 建立了 source selection / external access intent boundary：local tarball、offline bundle 和 local path source 在未确认前只能展示 intent，不能读取、解包、获取 operation lock 或写项目文件。Story 5.3 必须继承此顺序。
- Story 5.1 明确 custom source-specific resolver 尚未实现时必须以稳定 `source-integrity` issue 停止写入，而不是伪造 `SourceDescriptor` 成功。Story 5.3 只解除 `local-tarball`、`offline-bundle` 和 `local` 这一范围的 unsupported boundary。
- Story 5.2 建立了 trustStatus 推导纪律：`trusted` 必须来自 expected hash 或 lock match；可复现 evidence 无 trust anchor 时是 `unverified`；missing evidence、mismatch 或 source policy failure 是 `blocked`。Story 5.3 对 local artifact/path source 复用同一 trust model。
- Story 5.2 明确 status/validate 对已安装 source descriptor 只做 local descriptor/evidence shape 检查，不访问 source origin。Story 5.3 必须确保 validate 不重新读取 tarball/offline bundle/local path 或 temporary extraction root。
- Story 5.1/5.2 都强调 current ready-for-dev story contexts 不是源码完成证据；dev agent 必须重新检查实际 implementation scaffold 与前置 anchors。
- Story 4.6 和 Story 5.1/5.2 均强调当前 worktree 有无关 dirty planning artifacts 和未跟踪 story 文件；dev agent 不得格式化、重写、同步或回滚无关改动。
- 最近 5 个 commit 均为 docs/context/source/glossary/specs 方向，没有可复用的 TypeScript local artifact implementation commit pattern。实现必须以 live owning SPEC、previous story contexts 和实际源码为准，不以 docs commits 推断源码已存在。

### Latest Technical Information（最新技术信息）

- Node.js official releases 页面在 2026-05-26 显示 Node 22 和 Node 24 为 LTS、Node 26 为 Current，并说明生产应用应使用 Active LTS 或 Maintenance LTS。实现保持 `engines.node >=22`、Node 22/24 fixture matrix，不升级到 Node 26。Source: https://nodejs.org/en/about/previous-releases
- npm package-lock docs 说明 lockfile 描述 exact dependency tree；package entry 的 `resolved` 是实际 resolved source，registry source 通常是 tarball URL，Git source 可包含 commit SHA，local tarball/link 可表现为 file URL；`integrity` 是 unpacked artifact 的 SRI 字符串。Story 5.3 只把 npm lockfile 的 `resolved` / `integrity` 语义作为公开生态参考；SpecLite 的 local tarball/offline bundle/local path evidence 仍以 source descriptor owning SPEC 为真源。Source: https://docs.npmjs.com/cli/v8/configuring-npm/package-lock-json/
- No new third-party dependency is required by default. 如果实现需要 tarball/bundle extraction abstraction，优先使用 Node 22-compatible APIs 和已有 project-pinned libraries；新增 dependency 前必须确认 package policy、Node 22 support、testability、redaction behavior 和 offline determinism。

### Contract Requirements（契约要求）

- `_bmad-output/planning-artifacts/specs/02-source-descriptor-contract.md` 拥有 `SourceDescriptor`、`SourceIntegrityEvidence`、tarball/offline bundle/local source rules、trust status、source staging/cache redaction 和 validate no-network boundary。
- `_bmad-output/planning-artifacts/specs/03-install-plan-contract.md` 拥有 `SourceResolutionPlan`、external access、confirmation、local source self-reference guard before `InstallPlan`、`writeAuthorized`、operation lock 和 safe write semantics。
- `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md` 拥有 `CommandResult` envelope、`InstallCommandData`、`ValidationIssue` model、path policy、timestamp policy、ordering、`RedactedExternalPathDiagnostic` shape 和 fixture comparison policy。
- `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md` 拥有 `source-integrity` category、reserved issue ids、default severity 和 redaction-safe details policy，尤其是 `source-integrity.tarball-unreadable`、`source-integrity.offline-bundle-unreadable` 和 `source-integrity.local-source-self-reference`。
- `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md` 拥有 manifest/index installed projection、source descriptor projection、files index ownership/hash 和 fixture update policy；local staging/cache/extraction state 不得进入 manifest/index/files index。
- `_bmad-output/planning-artifacts/specs/08-fixture-contract.md` 拥有 `source-integrity` required sub-cases、expected output classes、semantic JSON comparison、snapshot redaction 和 release gate classification。
- `_bmad-output/planning-artifacts/specs/06-resolve-command-contract.md` 只适用于 installed skills 的 config/customization resolve command；local source resolver 不得复用 `speclite resolve` stdout contract 或把 local artifact resolution 包进 `CommandResult` exception path。
- ADRs 可以解释决策历史，但不得重新定义 field-level schema、issue taxonomy、fixture layout、command payload 或 implementation anchors。若 ADR 与 owning SPEC 冲突，follow owning SPEC。

### Testing Requirements（测试要求）

- Use Vitest。
- Tests 必须 deterministic、local-only，不访问 npm registry、private registry、Git remote、offline bundle origin、package-manager cache 或外部网络。
- 使用 temporary files/directories、fixture source packages 或 injected filesystem/extractor 构造 local tarball、offline bundle 和 local path cases。不要使用当前 repo 的 `_bmad` 或 `_bmad-output` 作为 installed target state。
- JSON tests 必须 parse 后断言 semantic fields。不要比较 raw pretty-printed JSON bytes，除非 formatting 本身是测试目标。
- Redaction tests 必须覆盖 absolute path、home directory、drive letter、OS-specific separator、local source checkout root、tarball path、bundle path、temporary extraction path、cache path、safe-write temp path、stack trace 和 raw filesystem error。
- Validate/status no-access tests 必须通过 mock/spies 证明 artifact reader、bundle extractor、local source scanner 和 package-manager cache reader 未被调用；不能只依赖没有网络配置。
- Fixture snapshots 必须 normalize 或 exclude timestamps、duration、operation-lock volatile fields、temporary paths、environment-specific paths、home directory、generated metadata timestamps 和 redacted external path diagnostics。
- Fixture coverage 不得扩大到 Story 5.4 Git source pinning、Story 5.5 full trust reporting 或 Epic 6 full release matrix；这些只作为后续 stories 的扩展点。

### Project Context Reference（项目上下文引用）

- `_bmad-output/project-context.md` currently contains initialized metadata and placeholder sections only; it does not add implementation rules beyond live PRD, Architecture, UX, ADR and owning SPEC artifacts.
- The project-level language rule remains: conversation and generated docs in Chinese, section headings in `English（中文）` form, technical identifiers in English.

### References（参考）

- `_bmad-output/planning-artifacts/epics/08-epic-5-source-integrity-and-distribution-channels来源完整性与分发渠道.md`
- `_bmad-output/implementation-artifacts/5-1-source-selection-and-channel-summary.md`
- `_bmad-output/implementation-artifacts/5-2-registry-source-resolution-and-diagnostics.md`
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
- npm package-lock docs: https://docs.npmjs.com/cli/v8/configuring-npm/package-lock-json/

## Dev Agent Record（开发代理记录）

### Agent Model Used（使用的代理模型）

TBD by dev agent.

### Debug Log References（调试日志引用）

TBD by dev agent.

### Completion Notes List（完成备注列表）

- Story context created by bmad-create-story sub-agent for Story 5.3 only.
- Ultimate context engine analysis completed - comprehensive developer guide created.

### File List（文件列表）

TBD by dev agent.
