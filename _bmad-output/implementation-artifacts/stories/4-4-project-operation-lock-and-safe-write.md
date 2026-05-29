# Story 4.4: Project Operation Lock And Safe Write（项目操作锁与安全写入）

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story（故事）

作为项目维护者，  
我希望所有会写入项目的 SpecLite 命令都使用 project operation lock 和 safe write，  
以便避免并发更新、路径逃逸、符号链接逃逸或部分写入破坏项目状态。

## Acceptance Criteria（验收标准）

1. **Acquire project operation lock before writes（写入前获取项目操作锁）**  
   **前提** write-capable command 准备进入写入阶段；  
   **当** 系统尝试获取项目锁；  
   **则** 必须创建或获取 `_speclite/.lock` project operation lock；  
   **并且** 未获取锁时不得写入任何文件。

2. **Lock contention fails safely（锁竞争安全失败）**  
   **前提** `_speclite/.lock` 已被其他操作持有；  
   **当** 当前命令无法安全获取锁；  
   **则** 命令返回 failure 且非 0 exit code；  
   **并且** 输出 `operation-lock.project-locked` command-level issue。

3. **Public command path is non-reentrant（Public 命令路径不可重入）**  
   **前提** 同一 process 已持有 project operation lock；  
   **当** 它再次进入 public write-capable command path；  
   **则** MVP 仍按 non-reentrant lock 处理，不得绕过 lock acquisition；  
   **并且** 内部 orchestration 若需复用锁，只能传递 private lock handle，不得重新调用 public command path。

4. **Validate reports stale lock conservatively（Validate 保守报告陈旧锁）**  
   **前提** validate 发现 stale lock；  
   **当** stale lock 不阻断当前只读验证；  
   **则** validate 可以输出 `operation-lock.stale-lock` warning；  
   **并且** 不得自动删除 lock file。

5. **Installer-owned writes use temp-write and rename（Installer-Owned 写入使用临时写入与重命名）**  
   **前提** installer-owned 文件准备写入；  
   **当** 系统执行 safe write；  
   **则** 必须使用 temp-write + rename 或等价安全写入策略；  
   **并且** temporary file 必须位于 target file 同一目录，文件名包含 `.speclite-tmp-` marker，且不进入 files index、manifest/index、public JSON 或 stable fixture snapshot。

6. **Unsafe target paths are blocked（不安全目标路径被阻断）**  
   **前提** 目标路径存在 symlink escape、path escape、case conflict 或 unsafe overwrite 风险；  
   **当** 系统规划或执行写入；  
   **则** 写入必须被阻断；  
   **并且** 输出稳定 issue 或 conflict reason。

7. **Partial failures remain diagnosable（部分失败保持可诊断）**  
   **前提** 写入过程中发生 partial failure；  
   **当** 命令生成结果；  
   **则** 输出 completed steps、failed step、pending steps、changed paths 和 manual action；  
   **并且** 不声称未完成的文件已成功更新。

8. **Volatile lock fields stay out of stable outputs（不稳定锁字段不进入稳定输出）**  
   **前提** lock file shape 被记录或诊断；  
   **当** 输出 public JSON 或 fixture snapshot；  
   **则** 不暴露不稳定的 createdAt、pid 或 checkout-specific absolute path；  
   **并且** lock file 不进入 files index 或 stable files-index hash。

## Tasks / Subtasks（任务 / 子任务）

- [ ] Task 1: 验证前置实现、当前仓库状态和只读边界（AC: 1-8）
  - [ ] 实现前重新检查 root `package.json`、`src/`、`test/`、`tests/`、`fixtures/` 是否与当前 sprint/source 状态一致。截至 2026-05-29，Epic 3 提交 `395b017` 已提供 root TypeScript CLI scaffold、`src/commands/update.ts`、`CommandResult` / `ValidationIssue` anchors 和 validation/diagnostics tests；不得把 ready-for-dev story context 当作 Epic 4 源码已完成证据。
  - [ ] 确认 Story 3.5 `CommandResult` / `ValidationIssue` anchors 仍可复用，并重新验证 Story 4.1 ownership/files index anchors、Story 4.2 shared config/customization resolver anchors、Story 4.3 update plan/write authorization anchors 是否真实存在；若不存在，按前序 story implementation 顺序补齐，不得在本 Story 中绕过契约创建私有 lock/write model。
  - [ ] 检查当前 worktree dirty 状态，保留用户、父 agent 或其他 sub-agent 的 planning artifacts、story 文件、源码和状态文件改动；不得格式化、重写、同步或回滚无关文件。
  - [ ] 修改任何 UPDATE 文件前完整读取该文件，记录 current behavior、data shape、public output、tests 和必须保留的行为；不得用本 Story 重构无关模块。

- [ ] Task 2: 实现 project operation lock module 与生命周期（AC: 1-4, 8）
  - [ ] 在 `src/fs/operation-lock.ts` 或等价 `fs/` anchor 中实现 lock acquisition、release、stale inspection 和 private lock handle 类型；`fs/` 是 lock file I/O 的 owning module。
  - [ ] Lock path 固定为 target project 内 `_speclite/.lock`，所有 public path display 使用 project-relative POSIX path，内部可以保留 private absolute path 但不得进入 public JSON、manifest/index、files index、fixture snapshot 或 `ValidationIssue.details`。
  - [ ] Lock file shape 必须为 `schemaVersion: "speclite.operation-lock.v1"`、`operation: "install" | "update" | "update.repair"`、optional `pid`、`createdAt`、`projectRootHash`。
  - [ ] `createdAt` 仅用于 stale 判断和 private diagnostics，fixture 使用 injected/normalized clock；`pid` 只是 best-effort hint，不得作为唯一 stale criterion；`projectRootHash` 是 normalized project root hint，不是跨 checkout 稳定 public value。
  - [ ] Controlled success 或 controlled failure 后释放 lock；process crash 可能留下 stale lock，MVP 只通过 validate warning 与 manual cleanup guidance 处理，不自动删除。
  - [ ] 如果 `_speclite/` 尚未存在但 install 需要创建 lock，先明确 lock parent creation 的 ownership 和 safe creation 顺序；不得把 parent creation 当作绕过 operation lock 的任意写入入口。

- [ ] Task 3: 接入 write-capable command orchestration（AC: 1-3, 7-8）
  - [ ] 在 `src/commands/install.ts`、`src/commands/update.ts` 和 `update --repair` orchestration 中接入 lock acquisition，覆盖 `install`、`update`、`update.repair` 三类 write-capable command。
  - [ ] `speclite status` 保持 lightweight read-only summary，默认不得检查 project operation lock。
  - [ ] `speclite validate` 保持 read-only，可以检查 stale lock 并报告 `operation-lock.stale-lock` warning，但不得获取写锁、不得删除 lock file、不得修复 stale temp files。
  - [ ] Public write-capable command path 必须 non-reentrant：即使同一 process 已持有 lock，再次进入 public command path 也必须走 acquisition 并按 contention 失败处理；内部复用只能通过 private lock handle 传递，不得重新调用 public command path。
  - [ ] Lock acquisition failure 必须发生在任何 write、safe planning 或 apply side effect 之前；失败时不得写入 installer-owned、human-owned、workflow-owned、manifest/index、files index、IDE mirror、artifact root 或 temp target。
  - [ ] 如果 command 在 lock acquisition 前失败，不得输出 `updatePlan`、`repairPlan`、`changedPaths`、`skippedPaths` 或 `conflicts` 假装 planning 已安全完成。

- [ ] Task 4: 实现 safe write primitive（AC: 5-6, 8）
  - [ ] 在 `src/fs/safe-write.ts` 实现 installer-owned file mutation 的唯一写入 primitive；`src/commands/`、`src/update/`、`src/installer/` 不得各自复制 temp-write/rename logic。
  - [ ] Safe write 必须将 candidate content 写入 target file 同一目录下的 temporary file，temporary name 包含 `.speclite-tmp-` marker 和 private nonce / operation-local id，然后在支持时 flush，再 rename into place。
  - [ ] 不得在原位置 truncate 或 partial rewrite target file；不得跨目录 rename；不得把 temporary filename、nonce、pid、timestamp 或 absolute temp path 输出到 public JSON、manifest/index、files index 或 stable fixture snapshot。
  - [ ] Controlled success 或 controlled failure 应 best-effort 清理 temporary files；cleanup failure 若只留下不阻断后续 safe write 的 stale temp file，validate 可报告 `file-integrity.stale-temp-file` warning；若 stale temp file 阻断 target naming、rename 或 safe mutation，必须报告 error。
  - [ ] `changedPaths` 只记录当前命令实际完成 rename 的 project-relative POSIX paths；未尝试、未授权或未完成的 planned writes 留在 `InstallPlan.plannedWrites`、`UpdatePlan.actions` 或 `RepairPlan.actions`。

- [ ] Task 5: 阻断 path escape、symlink escape、case conflict 与 unsafe overwrite（AC: 5-6）
  - [ ] 复用或补齐 `src/fs/path-normalizer.ts` 的 project-relative POSIX normalization、absolute path rejection、project boundary check、symlink-aware boundary check 和 case conflict helper。
  - [ ] Safe write 目标路径必须在 target project boundary 内；任何 path escape 或 symlink escape 都必须阻断写入，并按 taxonomy 输出 `artifact-path.*`、`runtime-path.symlink-escape`、`file-integrity.*` 或 owning SPEC 定义的更具体 stable issue。
  - [ ] 对 case-insensitive conflict，必须在 planning 或 write preflight 中报告 `file-integrity.case-conflict` 或 stable conflict reason；不得依赖 host filesystem 是否实际大小写敏感作为唯一安全判断。
  - [ ] Unsafe overwrite risk 包括但不限于：目标 ownership 非 installer-owned、ownership unknown、existing human-owned/workflow-owned target、hash baseline 不匹配、目标是 symlink、file/directory type mismatch、create action 目标已存在且不能证明安全、stale temp file 阻断 safe mutation。
  - [ ] Normal `update` 遇到 installer-owned drift 仍应由 Story 4.5 的 conflict detector 默认标记 conflict；本 Story 只负责 write path 在 apply 前再次阻断 unsafe overwrite，不得把 drift 自动转换成 repair。

- [ ] Task 6: 保持 public JSON、issues 和 fixture 稳定（AC: 2, 4, 7-8）
  - [ ] `operation-lock.project-locked` 是 command-level blocker，category 为 `operation-lock`，severity 为 `error`，必须导致 `CommandResult.status: "failure"` 和 non-zero exit code；不得放入 `data.conflicts`。
  - [ ] `operation-lock.stale-lock` 只在 validate 等 read-only inspection 中作为 warning；validate 可以返回 `CommandResult.status: "warning"` 和 exit code 0。
  - [ ] Lock 前失败时 public JSON 不得包含 plan payload、changed/skipped/conflict arrays、temporary paths、lock nonce、raw `pid`、`createdAt`、absolute path 或 checkout-specific `projectRootHash`。
  - [ ] Partial failure diagnostics 必须包含 completed steps、failed step、pending steps、changed paths 和 manual action。若现有 `UpdateCommandData` / `RepairCommandData` 没有 top-level step fields，不得偷偷新增未契约化 fields；优先使用 stable `issues[].details` / `nextActions` 承载，或先同步更新 owning SPEC、schema/parser 和 fixtures。
  - [ ] `summary`、`issues[].details`、`impact`、`suggestedNextStep`、`nextActions` 和 path fields 不得包含 timestamp、absolute local path、home directory、temporary/cache path、raw stack trace、random id 或 credential-bearing source locator。
  - [ ] Fixture snapshots 必须 normalize 或 exclude operation-lock volatile fields、safe-write temporary names、projectRootHash、duration 和 environment-specific paths。

- [ ] Task 7: 保持 Story 4.4 与相邻 stories 的边界（AC: 1-8）
  - [ ] 本 Story 可以实现 operation lock、safe write primitive、unsafe target preflight、partial failure diagnostics 和 focused tests。
  - [ ] 不在本 Story 中重新定义 Story 4.1 ownership classifier、files index shape、raw-byte hash semantics 或 human/workflow-owned protection。
  - [ ] 不在本 Story 中重新定义 Story 4.2 config/customization merge order、array merge、layer failure semantics 或 customization lookup key。
  - [ ] 不在本 Story 中重新定义 Story 4.3 update plan shape、write authorization semantics、Evidence profile 或 planned vs actual result separation；本 Story 只接入 lock/apply 边界。
  - [ ] 不在本 Story 中完成 Story 4.5 full conflict detector / default non-overwrite matrix。
  - [ ] 不在本 Story 中完成 Story 4.6 full repair planner/apply、`restore-canonical`、`regenerate`、repair source policy 扩展。
  - [ ] 不新增顶级 `speclite repair`、`speclite sync`、`doctor`、`uninstall`、backup/restore、transactional rollback、standalone update report artifact、daemon/background service 或 Post-MVP migration commands。

- [ ] Task 8: 编写 focused tests 和 fixture assertions（AC: 1-8）
  - [ ] Unit tests 覆盖 lock acquisition success、lock contention、controlled release、stale lock inspection、non-reentrant public command path、private lock handle reuse 和 no auto-delete stale lock。
  - [ ] Unit tests 覆盖 `OperationLockFile` shape、`createdAt` injected clock、`pid` best-effort semantics、`projectRootHash` redaction/normalization 和 files-index exclusion。
  - [ ] Unit tests 覆盖 safe write success path：temp file same directory、name contains `.speclite-tmp-`、flush/rename path、changedPaths only after completed mutation、temp cleanup best effort。
  - [ ] Unit tests 覆盖 safe write failure path：write failure before rename、rename failure after temp write、cleanup failure、partial failure diagnostics、manual action guidance 和 no false success。
  - [ ] Unit tests 覆盖 path blockers：absolute path、`..` path escape、symlink escape、case conflict、unsafe overwrite、file/directory type mismatch、human-owned/workflow-owned target、unknown ownership 和 stale temp file blocking mutation。
  - [ ] JSON reporter tests 覆盖 `operation-lock.project-locked` command-level issue、no `data.conflicts` duplication、no plan payload before lock, no timestamp/temp/absolute path/lock volatile leakage。
  - [ ] Validate tests 覆盖 `operation-lock.stale-lock` warning、`file-integrity.stale-temp-file` warning/error split、canonical issue ordering 和 exit code behavior。
  - [ ] Integration / fixture tests 使用 temporary target project 构造 `install`、`update`、`update --repair` lock contention 与 safe-write apply cases；不要依赖当前 repo 的 `_bmad` 或 `_bmad-output` 作为 installed target state。
  - [ ] Path-portability fixtures 覆盖 macOS / Windows path separator、case behavior、symlink/path escape 和 project-relative POSIX output。
  - [ ] 所有 tests 必须 deterministic、local-only，不访问 npm registry、private registry、Git remote、offline bundle origin、package-manager cache 或外部网络。

- [ ] Task 9: 本地验证与范围控制（AC: 1-8）
  - [ ] 运行 `npm run build`。
  - [ ] 运行 `npm test`，或至少运行 operation lock、safe write、path normalization、update/apply、installer apply、CommandResult reporter、validate stale lock 和 affected fixtures 的 focused Vitest tests。
  - [ ] 如果前置 implementation 尚未完成，保留失败为有效前置信号；不要伪造 fixture pass、不要跳过 lock/safe write tests、不要创建 private JSON shape 或 duplicate path safety implementation。
  - [ ] 检查 diff，确认没有修改 `_bmad-output/planning-artifacts/`、已有 Story 1-3 文件、Story 4.1/4.2/4.3、无关源码或用户改动。
  - [ ] 检查 diff，确认没有提前实现 Story 4.5 full conflict detector、Story 4.6 repair apply、Epic 5 source channel 扩展、Epic 6 release fixture matrix 或 Post-MVP governance commands。

## Dev Notes（开发备注）

### Current Repository State（当前仓库状态）

- 截至 2026-05-29 的 Epic 3 提交 `395b017`，仓库根目录已有 root `package.json`、`src/`、`test/` 以及 status/validate/update command anchors、`CommandResult` / `ValidationIssue` schema、diagnostics/output 和 validation issue/order anchors。root `fixtures/`、Story 4.1/4.2/4.3 update anchors 仍需按当前源码逐项确认。
- Epic 3 / Story 3.5 已完成：`src/commands/update.ts` 是 non-write placeholder 与 public contract seam。Story 4.1 / 4.2 / 4.3 的 actual implementation 仍需按 sprint 状态和源码重新确认；本 Story 4.4 的 ready-for-dev context 不是其自身实现完成证据。
- 当前 worktree 已有与本 Story 创建无关的 dirty `sprint-status.yaml` 改动和未跟踪 Epic 1-4 story 文件。实现 Story 4.4 时不得格式化、重写、同步或回滚这些无关改动。
- `_bmad-output/project-context.md` 当前仍是初始化占位内容；实际 implementation guardrails 以 live PRD、Architecture、UX、ADR 和 owning SPEC artifacts 为准。
- 本 create-story run 复现了 skill activation runtime 行为：裸 `python3 _bmad/scripts/resolve_customization.py --skill .agents/skills/bmad-create-story --key workflow` 因 stdlib `tomllib` 缺失失败；`python3.12` 成功解析 workflow。

### Scope Boundary（范围边界）

- 本 Story 负责 project operation lock、safe write primitive、unsafe target preflight、partial failure diagnostics、volatile lock/temp output exclusion、focused tests 和 fixture assertions。
- 本 Story 消费：
  - Story 4.1 的 ownership model、files index ownership projection、human/workflow-owned protection 和 volatile `_speclite/.lock` / `.speclite-tmp-` exclusion。
  - Story 4.2 的 shared config/customization resolver output，尤其是 human-owned TOML 只读保护。
  - Story 4.3 的 update plan、write authorization、planned vs actual result separation、`changedPaths` / `skippedPaths` actual apply semantics 和 lock-before-plan failure reporting boundary。
  - Story 3.5 的 `CommandResult` / `ValidationIssue` public JSON and reporter boundary。
- 本 Story 不负责完整 source trust、full conflict detector、repair action eligibility、top-level governance commands、backup/restore 或 transaction rollback。

### Architecture Requirements（架构要求）

- Runtime baseline 保持 Node.js 22 minimum 和 Node.js 24 recommended。Node.js official releases 在 2026-05-26 显示 Node 22 与 Node 24 为 LTS、Node 26 为 Current；不要把 MVP baseline 提升到 Node 26，也不要使用 Node 24-only API，除非提供 Node 22-compatible path 并更新 runtime policy / fixtures。Source: https://nodejs.org/en/about/previous-releases
- CLI foundation 保持 TypeScript + commander。不要为本 Story 引入 oclif/yargs/cac/clipanion。
- Runtime schema validation 继续使用 architecture-pinned `zod@4.4.3` 与 executable schema/parser anchors。不要为了 operation lock 或 safe write 引入新的 schema/runtime validation library。
- Storage model 是 filesystem-first / local-first。不要引入 database、web service、daemon、REST API、GraphQL、desktop UI、persistent cache server 或 background process。
- `src/commands/` 只做 flag parsing、command mode normalization 和 orchestration；operation lock、path normalization 和 safe write 属于 `src/fs/`，ownership/hash 属于 `src/update/` 与 `src/manifest/`，public projection/rendering 属于 `src/diagnostics/`。
- `fs/` 是唯一允许实现 Path Normalization、Operation Lock 和 Safe Writes 的模块。Installer/update/repair 只能调用 shared fs primitives。

### Implementation Anchors（实现锚点）

需要创建或扩展的 implementation anchors，实际命名应贴合已有实现：

- `src/fs/operation-lock.ts`：operation lock acquisition/release/stale inspection、private lock handle、lock file shape、volatile field redaction helpers。
- `src/fs/safe-write.ts`：same-directory temp-write + flush + rename primitive、best-effort cleanup、partial failure classification。
- `src/fs/path-normalizer.ts`：project-relative POSIX path normalization、absolute path rejection、project boundary checks、symlink escape detection、case conflict helpers。
- `src/update/apply-update.ts`：consume authorized update/repair actions and private lock handle；all mutations must go through `safe-write.ts`。
- `src/installer/install-runner.ts` 或 existing install apply anchor：install writes must acquire lock and use shared safe write primitive。
- `src/commands/install.ts`、`src/commands/update.ts`、`src/commands/validate.ts`：command orchestration, lock acquisition handoff, validate stale-lock read-only reporting。
- `src/validation/rules/operation-lock.ts`：validate stale lock shape/state reporting。
- `src/validation/rules/file-integrity.ts`：stale temp file warning/error and unsafe overwrite risk reporting。
- `src/diagnostics/command-result-schema.ts`：ensure issue/data projections do not expose volatile lock/temp fields；do not add public fields without SPEC update。
- `src/diagnostics/command-result.ts`：status/exit-code derivation for `operation-lock.project-locked`, pre-plan failure projection, partial failure issue details。
- `src/diagnostics/output.ts`：human-readable Evidence output for lock contention, stale lock, safe write partial failure and manual action.
- `src/manifest/manifest-generator.ts` / `src/manifest/manifest-schema.ts` 或等价 files-index helper：exclude `_speclite/.lock` and `.speclite-tmp-` temporary files from files index and stable hash inputs。
- `test/fixtures/existing-install-update/`、`test/fixtures/path-portability/`、`test/fixtures/ide-drift/`：lock/safe-write/path blocker fixture assertions。

如果这些文件已经由前置 stories 创建，修改前必须完整读取并保留既有 behavior。如果这些文件尚不存在，按前置 story implementation 顺序补齐，不要绕过 owning SPECs 创建私有实现。

### Operation Lock Rules（操作锁规则）

- Write-capable commands：`speclite install`、`speclite update`、`speclite update --repair`。
- Read-only commands：`speclite status` 默认不检查 lock；`speclite validate` 可以检查 lock shape/stale state，但不得获取 lock 或删除 lock。
- Lock file 是 volatile installer-owned control file，不进入 files index，不参与 stable files-index hash，不进入 manifest/index，不进入 public JSON stable fields。
- Lock contention failure:
  - `issueId: "operation-lock.project-locked"`
  - `category: "operation-lock"`
  - `severity: "error"`
  - `CommandResult.status: "failure"`
  - exit code non-zero
  - no writes
  - no `data.conflicts`
  - no plan payload if safe planning has not started
- Stale lock validation:
  - `issueId: "operation-lock.stale-lock"`
  - `category: "operation-lock"`
  - `severity: "warning"`
  - no auto delete
  - suggested manual action must be stable and concise
- Non-reentrant rule：public write-capable command path must always acquire lock; internal orchestration can reuse only a private lock handle with a type that cannot be serialized into public JSON.

### Safe Write Rules（安全写入规则）

- Safe write is mandatory for installer-owned file mutation.
- Temporary file must be created in the same directory as the target and include `.speclite-tmp-`.
- Temporary file identifiers are private, non-stable implementation details.
- Candidate content should be written fully before rename. Use Node 22-compatible `node:fs/promises` APIs and stable ECMAScript APIs.
- Flush file and parent directory when supported; platform limitations should be handled conservatively and tested without relying on Node 24-only APIs.
- Rename success is the moment a path can enter `changedPaths`.
- Partial failure is not transactional rollback. Report completed mutations, failed step, pending steps and manual action; do not claim rollback or success for unfinished files.
- Stale safe-write temp files:
  - not in files index
  - not in stable fixture snapshots
  - warning if not blocking future safe write
  - error if blocking target naming, rename or safe mutation

### Path And Overwrite Blockers（路径与覆盖阻断）

- Path fields in public JSON must be project-relative POSIX paths.
- Absolute paths, home directories, OS-specific separators, temporary/cache paths and checkout-root-dependent paths must not appear in stable public JSON.
- Block before write when any target:
  - escapes project boundary by normalization or symlink resolution
  - creates case-insensitive path conflict
  - is a symlink target not proven safe
  - has unknown ownership
  - is human-owned or workflow-owned
  - is installer-owned but current hash/type/baseline does not match expected safe state
  - would overwrite an existing path for a create action
  - has file/directory type mismatch
  - is blocked by a stale temp file
- Source self-reference is a `source-integrity` blocker and should not be converted into a file-integrity overwrite issue.

### JSON And Diagnostics Requirements（JSON 与诊断要求）

- `operation-lock.project-locked` 不属于 `data.conflicts`；它是 command-level blocker。
- `update.conflicts` remains Story 4.5/Story 4.3 update-planning blocker behavior; do not reuse it for lock contention.
- Lock failures before planning must not output `UpdatePlan` / `RepairPlan` payloads, `changedPaths`, `skippedPaths` or `conflicts`.
- Public `CommandResult` JSON default must not include timestamps. Lock `createdAt` is private/fixture-normalized only.
- If partial failure step evidence needs machine-readable shape, use stable `issues[].details` fields or update `01-command-result-json-contract.md` and executable schema in the same implementation change. Do not add undocumented `data` fields.
- Human-readable output must include text equivalents for lock failure, stale lock, partial failure and manual action. Do not rely on color, icons or table position.

### Previous Story Intelligence（前序 Story 情报）

- Story 4.3 established that `update` planning must separate planned effects from actual apply results; `changedPaths` / `skippedPaths` are actual apply results only. Story 4.4 safe write must append to these arrays only after actual mutation completes.
- Story 4.3 established that if a write-capable command fails before acquiring project operation lock, public JSON must not include plan payload, `changedPaths`, `skippedPaths` or `conflicts` as if planning completed.
- Story 4.3 explicitly left project operation lock acquisition, safe write temp-write + rename, partial failure cleanup and stale lock behavior to Story 4.4.
- Story 4.1 established `_speclite/.lock` and `.speclite-tmp-` files are volatile and must not enter files index or stable files-index hash.
- Story 4.1 established `_speclite/custom/*.toml` and `_speclite/custom/*.user.toml` are human-owned; install/update/repair must not overwrite, rewrite, reorder, format, normalize or delete them.
- Story 4.1 established `_speclite-output/**` and configured workflow artifact roots are workflow-owned; update/repair must not overwrite or include them as changed paths.
- Story 4.2 established update/repair must consume shared resolver output and preserve human-owned TOML read-only boundaries; lock/safe write implementation must not mutate custom TOML.
- Story 3.5 established human-readable output and `--json` output must share the same semantic source; command modules must not hand-roll public JSON, status text, issue layout or next action order.

### Contract Requirements（契约要求）

- `_bmad-output/planning-artifacts/specs/03-install-plan-contract.md` owns operation lock, safe write, rollback boundary, partial failure behavior, `writeAuthorized`, dry-run, `--yes`, repair source policy and human-owned TOML stub rules.
- `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md` owns `CommandResult`, `ValidationIssue`, `UpdateCommandData`, `RepairCommandData`, `UpdatePlan`, `RepairPlan`, `UpdateConflict`, status/exit-code derivation, path policy, timestamp policy, reason code registry and public ordering.
- `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md` owns manifest/index/files index fields, ownership projection, raw-byte hash, `_speclite/.lock` and `.speclite-tmp-` volatile exclusion, and deterministic fixture rules.
- `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md` owns canonical issue category order, reserved issue ids, category boundaries and default severity guidance for `operation-lock.project-locked`, `operation-lock.stale-lock`, `file-integrity.case-conflict`, `file-integrity.unsafe-overwrite-risk` and `file-integrity.stale-temp-file`.
- ADRs can explain decision history but must not redefine field-level schema, issue taxonomy, fixture layout, command payload or implementation anchors. If ADR conflicts with owning SPEC, follow the owning SPEC.

### UX / Output Requirements（UX 与输出要求）

- Safety must be visible: lock failure, unsafe path blockers, partial failure and manual actions must be understandable in human-readable output and in structured diagnostics.
- Evidence profile should continue to show Summary, Issues/Conflicts, affected paths, changed paths, pending/manual actions and Next Actions.
- `NO_COLOR`, non-TTY, CI and narrow terminal output must remain pure-text readable; tables may degrade to key-value blocks without losing issueId, affected path, reason, next action, changed paths or manual action.
- Human-readable output must not be the only carrier of automation-relevant state. CI/fixtures must rely on `CommandResult`, `ValidationIssue`, manifest/index files or fixture expected outputs.
- Empty states should be explicit, for example `No writes were performed` or `No lock issue detected`, instead of relying on blank sections.

### Testing Requirements（测试要求）

- Use Vitest.
- Tests must be deterministic and local-only. Do not access npm registry, private registry, Git remote, offline bundle origin, package-manager cache or external network.
- Use temporary directories for installed-state cases. Do not use this repo's `_bmad` or `_bmad-output` as target project installed state.
- Cross-platform tests should use `node:path` `posix` / `win32` test data and shared path normalization helpers. Do not make host OS filesystem behavior the only assertion.
- JSON tests must parse output and assert semantic fields. Do not compare raw pretty-printed JSON bytes unless formatting itself is under test.
- Fixture snapshots must normalize or exclude timestamps, operation-lock volatile fields, temporary paths, `projectRootHash`, duration and environment-specific paths.
- Preservation tests must verify human-owned TOML and workflow-owned artifacts remain byte/content/order/comment unchanged. Installer-owned files use raw-byte hash comparison.

### Git Intelligence Summary（Git 历史摘要）

- 最近 5 个 commit 均为 docs/context/source/spec cleanup 类变更：`style(docs): 清理参考文档尾随空白`、`docs(context): 初始化项目上下文文档`、`docs(source): 同步内置源资产路径说明`、`docs(glossary): 整理术语目录与文档索引`、`docs(specs): 收敛 MVP 契约与实现锚点`。
- 当前可引用的实现模式主要来自 live planning artifacts、owning SPECs、ADR、legacy Python parity scripts 和 previous story contexts，而不是已提交 TypeScript implementation。dev agent 不得从这些 docs commits 推断源码已经存在。

### Latest Technical Information（最新技术信息）

- No new third-party dependency is required for this Story. Use project-pinned libraries from Architecture and previous stories; do not introduce a new lockfile library, transactional filesystem library, CLI framework, schema library or table renderer.
- Use Node.js 22-compatible `node:fs/promises`, `node:path` and stable ECMAScript APIs. Do not introduce Node 24-only behavior.
- External web check was limited to Node.js official release status. Operation lock and safe write semantics are governed by project-owned live PRD, Architecture, UX, ADR and owning SPEC contracts; no dependency upgrade is part of this Story.

### Project Context Reference（项目上下文引用）

- `_bmad-output/project-context.md` currently contains initialized metadata and placeholder sections only; it does not add implementation rules beyond live PRD, Architecture, UX, ADR and owning SPEC artifacts.
- The project-level language rule remains: conversation and generated docs in Chinese, section headings in `English（中文）` form, technical identifiers in English.

### References（参考）

- `_bmad-output/planning-artifacts/epics/07-epic-4-safe-update-and-repair安全更新与修复.md`
- `_bmad-output/implementation-artifacts/4-3-update-plan-before-write.md`
- `_bmad-output/implementation-artifacts/4-2-config-and-customization-merge-order-for-updates.md`
- `_bmad-output/implementation-artifacts/4-1-ownership-model-and-protected-file-boundaries.md`
- `_bmad-output/planning-artifacts/implementation-readiness-report-2026-05-26.md`
- `_bmad-output/planning-artifacts/prd/10-functional-requirements功能需求.md`
- `_bmad-output/planning-artifacts/prd/11-non-functional-requirements非功能需求.md`
- `_bmad-output/planning-artifacts/architecture/03-core-architectural-decisions核心架构决策.md`
- `_bmad-output/planning-artifacts/architecture/04-implementation-patterns-consistency-rules实现模式与一致性规则.md`
- `_bmad-output/planning-artifacts/architecture/05-project-structure-boundaries项目结构与边界.md`
- `_bmad-output/planning-artifacts/ux-design-specification.md`
- `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md`
- `_bmad-output/planning-artifacts/specs/03-install-plan-contract.md`
- `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md`
- `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md`
- Node.js official releases: https://nodejs.org/en/about/previous-releases

## Dev Agent Record（开发代理记录）

### Agent Model Used（使用模型）

TBD by dev-story agent.

### Debug Log References（调试日志引用）

TBD by dev-story agent.

### Completion Notes List（完成备注）

- Story context created by bmad-create-story sub-agent #4.
- Ultimate context engine analysis completed - comprehensive developer guide created.

### File List（文件列表）

- TBD by dev-story agent.
