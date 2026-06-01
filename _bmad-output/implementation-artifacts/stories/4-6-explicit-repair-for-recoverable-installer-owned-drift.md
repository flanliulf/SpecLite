# Story 4.6: Explicit Repair For Recoverable Installer-Owned Drift（可恢复 Installer-Owned Drift 的显式修复）

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story（故事）

作为项目维护者，  
我希望通过 `speclite update --repair` 显式修复可安全恢复的 installer-owned drift，  
以便恢复 `_speclite` metadata、runtime scripts 或 IDE mirrors 的 canonical 状态，同时继续保护人工配置和 workflow 产物。

## Acceptance Criteria（验收标准）

1. **Repair mode only evaluates repairable installer-owned drift（Repair 模式只评估可修复 Installer-Owned Drift）**  
   **前提** 用户运行 `speclite update --repair`；  
   **当** 系统进入 repair planning；  
   **则** 只评估 installer-owned drift 是否可安全恢复或重建；  
   **并且** human-owned custom 文件与 workflow-owned artifacts 始终排除在 repair overwrite 范围外。

2. **Recoverable drift becomes repair actions（可恢复 Drift 进入 Repair Action）**  
   **前提** drift 文件可以从 resolved canonical source 或 installed canonical package baseline 恢复；  
   **当** 系统生成 repair plan；  
   **则** 该路径可被标记为 `restore-canonical` 或 `regenerate` action；  
   **并且** plan 会列出 affected path、ownership、current hash、expected hash 和 action。

3. **Repair actions always carry expected hash（Repair Action 必须携带 Expected Hash）**  
   **前提** repair planner 生成 `restore-canonical` 或 `regenerate` action；  
   **当** action 进入 repair plan；  
   **则** 每个 action 都必须包含 `RepairPlan.actions[].expectedHash`；  
   **并且** `regenerate` 必须先 dry-run candidate content，计算 expected hash 后才能进入 repair plan。

4. **Missing source evidence remains conflict（缺少来源证据仍为 Conflict）**  
   **前提** 缺少 resolved canonical source 或 installed canonical package baseline；  
   **当** repair 无法证明可安全恢复；  
   **则** 该路径进入 conflict；  
   **并且** reason code 为 `missing-source-evidence` 或 owning SPEC 定义的等价稳定值。

5. **Script mode without authorization stays unapplied（脚本模式未授权保持未应用计划）**  
   **前提** 用户以脚本模式运行 `update --repair` 且未传入 `--yes`；  
   **当** repair plan 需要写入授权；  
   **则** 命令输出 unapplied repair plan；  
   **并且** 不写入任何文件。

6. **Authorized repair uses lock and safe write（授权 Repair 使用 Lock 与 Safe Write）**  
   **前提** 用户确认 repair plan 或传入 `--yes`；  
   **当** 系统执行 repair 写入；  
   **则** 只修改 repair plan 中获授权的 installer-owned paths；  
   **并且** 使用 project operation lock 与 safe write。

7. **Repair result reports changed, skipped, remaining conflicts and validation next step（Repair 结果报告变更、跳过、剩余冲突与验证命令）**  
   **前提** repair 完成；  
   **当** 系统生成结果；  
   **则** 输出 changed paths、skipped paths、remaining conflicts 和 suggested validation command；  
   **并且** 不生成 standalone report artifact、backup/restore 或顶级 `speclite repair` 命令。

8. **Repeated repair planning is deterministic and consumers are future-tolerant（重复 Repair Planning 确定且 Consumer 容忍未来 Reason Code）**  
   **前提** 相同 drift 状态下重复生成 repair plan；  
   **当** source evidence、manifest 和 files index 未变化；  
   **则** affected path、hash、reason code 和 action 集合保持稳定；  
   **并且** consumer/parser 必须容忍 unknown future reason codes，不得仅因 code unknown 而 parsing failed。

## Tasks / Subtasks（任务 / 子任务）

- [x] Task 1: 验证前置实现、工作树和只读边界（AC: 1-8）
  - [x] 实现前重新检查 root `package.json`、`package-lock.json`、`src/`、`test/`、`tests/`、root `fixtures/` 是否与当前 sprint/source 状态一致。截至 2026-05-29，Epic 3 提交 `395b017` 已提供 root TypeScript CLI scaffold、`src/commands/update.ts`、`CommandResult` / `ValidationIssue` anchors 和 validation/diagnostics tests；不得把 ready-for-dev story context 当作 Epic 4 源码已完成证据。
  - [x] 确认 Story 3.5 `CommandResult` / `ValidationIssue` anchors 仍可复用，并重新验证 Story 4.1 ownership/files index anchors、Story 4.2 shared resolver anchors、Story 4.3 update plan/write authorization anchors、Story 4.4 operation lock/safe write anchors、Story 4.5 conflict detector anchors 是否真实存在；若不存在，按前序 story implementation 顺序补齐，不得在本 Story 中绕过契约创建私有 repair model。
  - [x] 检查当前 worktree dirty 状态，保留用户、父 agent 或其他 sub-agent 的 planning artifacts、story 文件、源码和状态文件改动；不得格式化、重写、同步或回滚无关文件。
  - [x] 修改任何 UPDATE 文件前完整读取该文件，记录 current behavior、data shape、public output、tests 和必须保留的行为；不得用本 Story 重构无关模块。

- [x] Task 2: 接入 explicit `speclite update --repair` command mode（AC: 1, 5-7）
  - [x] 在 `src/commands/update.ts` 或既有 update command anchor 中解析并归一化 `--repair`，使 `speclite update --repair --json` 输出 `command: "update.repair"`，不得输出 raw argv、带 flag 的 command string 或新增顶级 `speclite repair`。
  - [x] `update --repair` 必须复用 Story 4.2 shared config/customization resolver；lock 前只允许 command mode normalization 和 read-only preflight，读取 installed state、source descriptor、manifest/index、files index、ownership projection、IDE mirror baseline、operation mode 和 write authorization inputs，但不得构造可写 `RepairPlan` payload 或执行 source/package、manifest/index、mirror、runtime script mutation。
  - [x] read-only preflight 完成后，write-capable public command path 必须先获取 Story 4.4 project operation lock；只有 lock 获取成功后，才允许进入 safe repair planning、`RepairPlan.actions[]` construction、unapplied plan rendering / confirmation 和 authorized apply。
  - [x] 普通 `speclite update` 继续保持 Story 4.5 conflict/non-overwrite 行为；不得因本 Story 把 ordinary update confirmation 或 `--yes` 转换成 drift repair 授权。
  - [x] `--dry-run`、interactive pending confirmation、script mode without `--yes` 都必须保留真实 `repairPlan.actions[]`，设置 `writeAuthorized: false`，且 `changedPaths` / `skippedPaths` 为空；不得把未授权状态改写成 `skip:not-authorized`。

- [x] Task 3: 实现 repair planner eligibility 与 action semantics（AC: 1-4, 8）
  - [x] 在 `src/update/repair-plan.ts` 或既有 update repair anchor 中集中实现 repair planner；不要在 command、renderer、fixture helper 或 validation rule 中复制 repair eligibility 判断。
  - [x] Repair planner 只允许 installer-owned drift 成为 `RepairPlan.actions[]`；human-owned、workflow-owned、unknown ownership、missing source evidence、unsupported repair 或 unsafe path 必须保持 excluded / conflict projection，不得进入 executable repair plan。
  - [x] `restore-canonical` 只能从 resolved canonical source content 或能够证明 expected content hash 的 installed canonical package baseline 恢复 IDE mirror / canonical skill package content；不得从 stale IDE mirror files 反推 canonical content。
  - [x] `regenerate` 只允许用于可由 current source descriptor 和 installer templates 派生的 installer-owned generated metadata/control files，例如 manifest、index、runtime scripts 或 `_speclite` control files。
  - [x] 每个 `RepairPlan.actions[]` entry 必须包含 project-relative POSIX `affectedPath`、`ownership: "installer-owned"`、`currentHash`（如存在）、required `expectedHash` 和 action；这包括 `restore-canonical`、`regenerate` 和 installer-owned `skip`。
  - [x] Installer-owned `skip` 只允许表达 planned no-op，例如 current hash already matches expected state；它必须携带 `expectedHash` 和 stable reason code，例如 `reason: "unchanged"`，不得用于 human-owned、workflow-owned 或 unknown ownership 的 protected projection。
  - [x] `regenerate` 必须先 dry-run candidate content，按 files index raw-byte hash 语义计算 expected hash，再进入 repair plan；没有 expected hash 的 repair action 不可审计、不可 snapshot-stable，必须阻断。
  - [x] Missing source evidence、missing canonical baseline 或不足以证明 expected content hash 时，产生 conflict `reason: "missing-source-evidence"`；如果 path/artifact kind 无法派生 safe repair action，使用 `unsupported-repair`。

- [x] Task 4: 维护 conflict、issue、reason code 和 parser 边界（AC: 4, 7-8）
  - [x] Repair output 中 `data.conflicts[]` 只表示无法安全 repair 的 path-level blockers，例如 human-owned、workflow-owned、unknown ownership、missing source evidence、unsupported repair 或 unsafe overwrite risk。
  - [x] 当 `data.conflicts.length > 0` 时，`CommandResult.status` 必须为 `failure`，exit code 必须 non-zero，即使命令是 dry-run、interactive pending confirmation 或 `writeAuthorized === false`。
  - [x] `issues[]` 对 conflict set 必须包含且仅包含一个 command-level blocker：`issueId: "update.conflicts"`、`category: "update"`、`severity: "error"`、无 `affectedPath`、`details.conflictCount` 等于 `data.conflicts.length`。
  - [x] 不得把每个 path-level conflict 复制成独立 `issues[]` entry。Per-path details 只放在 `data.conflicts`。
  - [x] `operation-lock.project-locked` 仍是 command-level blocker，不属于 `data.conflicts`；lock acquisition 前失败不得输出 `repairPlan`、`changedPaths`、`skippedPaths` 或 `conflicts` 假装 planning 已完成。
  - [x] Producer 只能输出 owning SPEC registry 中的 MVP reason codes：`unchanged`、`installer-owned-drift`、`human-owned`、`workflow-owned`、`unknown-ownership`、`missing-source-evidence`、`unsupported-repair`、`not-authorized`。
  - [x] `not-authorized` 只能表示 path-level authorization policy 阻止 specific path 进入 executable repair plan；不得表示 dry-run、pending confirmation 或 script mode without `--yes`。
  - [x] Consumer/parser 必须保留 unknown future reason codes 为 stable display string，不得仅因 code unknown 而 parsing failed。

- [x] Task 5: 执行 authorized repair apply，复用 lock/safe-write/partial-failure 语义（AC: 5-7）
  - [x] 只有 `writeAuthorized === true` 且没有 blocking conflicts 的 authorized repair actions 才能进入 apply 阶段；未授权 plan、dry-run 或 script mode without `--yes` 不写入任何文件。
  - [x] Apply 阶段必须在 Story 4.4 project operation lock 已获取并通过 private lock handle 传递的边界内运行；public `update --repair` command path 不得把 lock acquisition 推迟到 plan rendering / confirmation 之后。
  - [x] 对每个 installer-owned repair action 调用 shared safe write primitive；不得在 repair planner、command 或 renderer 中直接写文件。
  - [x] `changedPaths` 只记录当前命令实际完成 mutation 的 paths；未尝试、未授权、失败或仍为 planned 的 actions 不得放入 `changedPaths`。
  - [x] `skippedPaths` 只记录当前命令实际到达 planned skip outcome 的 paths；未授权状态不得用 `skippedPaths` 表达。
  - [x] Partial failure 时输出 completed steps、failed step、pending steps、changed paths 和 manual action；不得声称未完成文件已成功更新，也不得声明事务性 rollback。
  - [x] Safe-write temporary files、operation lock volatile fields、absolute temp paths、pid、timestamp、projectRootHash 不得进入 public JSON、manifest/index、files index 或 stable fixture snapshots。

- [x] Task 6: 实现 RepairCommandData 与 human-readable repair output（AC: 2-8）
  - [x] 复用 `src/diagnostics/command-result-schema.ts` 中的 `RepairCommandData`、`RepairPlan`、`UpdateConflict` 和 reason-code producer/consumer guards；不要在 `src/update/`、renderer 或 tests 中定义第二套 public JSON shape。
  - [x] `RepairCommandData` 必须包含 `repairPlan`、`changedPaths`、`skippedPaths`、`conflicts`、`requiresConfirmation`、`writeAuthorized`，且不新增未契约化 optional fields；如确需新增字段，必须先更新 owning SPEC、schema/parser 和 fixtures。
  - [x] Human-readable Evidence profile 至少展示 Summary、Repair Plan / Planned Effects、Authorization、Conflicts / Remaining Conflicts、Protected Boundaries、Changed Paths、Skipped Paths 和 Next Actions。
  - [x] Repair result 必须给出 suggested validation command，优先通过 `nextActions` 指向 `speclite validate` 或 `speclite validate --json`；不要生成 standalone report artifact。
  - [x] `NO_COLOR`、non-TTY、CI、Windows path portability 和窄终端下，affected path、ownership、action、reason、issueId、authorization state、next action 和是否需要 `--yes` 仍必须纯文本可读。
  - [x] Human-readable output 不得成为 automation 依赖字段的唯一承载位置；CI、fixtures 和 installed skills 必须依赖 `CommandResult.data`、`issues`、`nextActions`、manifest/index 或 fixture expected outputs。

- [x] Task 7: 保持 deterministic ordering 与 stable fixture behavior（AC: 2-4, 7-8）
  - [x] `repairPlan.actions` 排序必须按 normalized affected path -> action -> reason；`conflicts` 排序必须按 normalized affected path -> ownership -> reason。
  - [x] `changedPaths` / `skippedPaths` 排序必须按 normalized project-relative POSIX path；`issues` 和 `nextActions` 复用 diagnostics/output 层 canonical ordering。
  - [x] IDE target repair planning 必须复用 adapter registry canonical target order，MVP 为 `claude`、`agents`；不得按本机目录顺序、filesystem traversal、object insertion 或 async completion order 排序。
  - [x] Hash comparison 和 expectedHash calculation 使用 files index raw-byte hash 语义；line endings、executable bit、file mode、symlink handling 和 case conflict 是独立 validation dimensions，不得被 hash normalization 隐式吸收。
  - [x] Fixture snapshots 必须 normalize 或排除 timestamp、duration、operation-lock volatile fields、safe-write temporary paths、projectRootHash、environment-specific paths 和 generated artifact metadata timestamps。

- [x] Task 8: 编写 focused tests 与 release-gate fixture assertions（AC: 1-8）
  - [x] Unit tests 覆盖 `restore-canonical` eligibility：resolved canonical source 可证明 expected hash、installed canonical package baseline 可证明 expected hash、stale IDE mirror 不可作为 canonical source。
  - [x] Unit tests 覆盖 `regenerate` eligibility：manifest/index/runtime script/control file 可以从 current source descriptor + templates dry-run 生成 candidate content，并在进入 plan 前计算 expected hash。
  - [x] Unit tests 覆盖 missing source evidence / missing baseline -> conflict `missing-source-evidence`，unsupported artifact kind -> `unsupported-repair`，unknown ownership -> `unknown-ownership`，human-owned -> `human-owned`，workflow-owned -> `workflow-owned`。
  - [x] Unit tests 覆盖 authorization semantics：`--dry-run`、interactive pending、script mode without `--yes`、explicit `--yes`，并断言 pending/unapplied repair plan 不写入、不填充 `changedPaths` / `skippedPaths`、不改写为 `skip:not-authorized`。
  - [x] Apply tests 覆盖 lock acquisition、safe write same-directory temp + rename、changedPaths after completed mutation、partial failure diagnostics、temporary file exclusion 和 no rollback claim。
  - [x] JSON reporter tests 覆盖 `command: "update.repair"`、single `update.conflicts` issue、`details.conflictCount`、`RepairPlan.actions[].expectedHash` required、unknown future reason code consumer tolerance、path policy 和 stable ordering。
  - [x] Human-readable renderer tests 覆盖 repair plan block、protected boundaries、remaining conflicts、suggested validation command、NO_COLOR、non-TTY、CI 和 narrow terminal fallback。
  - [x] Integration / fixture tests 覆盖 `test/fixtures/existing-install-update/`、`test/fixtures/ide-drift/`、`test/fixtures/path-portability/`、`test/fixtures/fresh-install-empty-project/` 和 source-integrity relevant sub-cases；所有 tests 必须 deterministic、local-only，不访问 npm registry、private registry、Git remote、offline bundle origin、package-manager cache 或外部网络。

- [x] Task 9: 本地验证与范围控制（AC: 1-8）
  - [x] 运行 `npm run build`。
  - [x] 运行 `npm test`，或至少运行 repair planner、repair apply、operation lock、safe write、files index/hash、ownership preservation、IDE mirror repair、CommandResult reporter、Evidence profile renderer、path ordering 和 affected fixtures 的 focused Vitest tests。
  - [x] 如果前置 implementation 尚未完成，保留失败为有效前置信号；不要伪造 fixture pass、不要跳过 repair/preservation tests、不要创建 update-private JSON shape 或 duplicate repair reason registry。
  - [x] 检查 diff，确认没有修改 `_bmad-output/planning-artifacts/`、已有 Story 1-3 文件、Story 4.1/4.2/4.3/4.4/4.5、无关源码或用户改动。
  - [x] 检查 diff，确认没有实现 Epic 5 source channel 扩展、Epic 6 release fixture matrix 全量范围、Post-MVP `doctor` / `sync` / `uninstall` / top-level `repair` / backup-restore / standalone update report artifact。

## Dev Notes（开发备注）

### Current Repository State（当前仓库状态）

- 截至 2026-05-29 的 Epic 3 提交 `395b017`，仓库根目录已有 root `package.json`、`src/`、`test/` 以及 status/validate/update command anchors、`CommandResult` / `ValidationIssue` schema、diagnostics/output 和 validation issue/order anchors。root `fixtures/`、Story 4.1 到 4.5 update anchors 仍需按当前源码逐项确认。
- Epic 3 / Story 3.5 已完成：`src/commands/update.ts` 是 non-write placeholder 与 public contract seam。Story 4.1 到 4.5 的 actual implementation 仍需按 sprint 状态和源码重新确认；本 Story 4.6 的 ready-for-dev context 不是其自身实现完成证据。
- 当前 worktree 已有与本 Story 创建无关的 dirty planning artifacts、`sprint-status.yaml` 改动和未跟踪 Epic 1-4 story 文件。实现 Story 4.6 时不得格式化、重写、同步或回滚这些无关改动。
- `_bmad-output/project-context.md` 当前仍是初始化占位内容；实际 implementation guardrails 以 live PRD、Architecture、UX、ADR 和 owning SPEC artifacts 为准。
- 本 create-story run 复现了 skill activation runtime 行为：裸 `python3 _bmad/scripts/resolve_customization.py --skill .agents/skills/bmad-create-story --key workflow` 因 stdlib `tomllib` 缺失失败；`python3.12` 成功解析 workflow。

### Scope Boundary（范围边界）

- 本 Story 负责 explicit `speclite update --repair` command mode、repair planner、repair eligibility、`restore-canonical` / `regenerate` actions、`RepairPlan.actions[].expectedHash`、missing source evidence conflicts、authorization/unapplied semantics、authorized repair apply、changed/skipped/remaining conflicts output、suggested validation command、deterministic ordering、unknown future reason code consumer tolerance 和 focused tests。
- 本 Story 消费：
  - Story 4.1 的 ownership model、files index ownership projection、human/workflow-owned protection、repair action exclusion 和 protected boundary output。
  - Story 4.2 的 shared config/customization resolver output，尤其是 human-owned TOML 只读保护。
  - Story 4.3 的 update plan、write authorization、planned vs actual result separation、Evidence profile 和 public `UpdateCommandData` / `RepairCommandData` boundary。
  - Story 4.4 的 project operation lock、safe write、unsafe target preflight、partial failure diagnostics 和 volatile output exclusion。
  - Story 4.5 的 conflict detector、default non-overwrite behavior、single `update.conflicts` issue、reason-code producer guards 和 deterministic conflict ordering。
  - Story 3.5 的 `CommandResult` / `ValidationIssue` JSON, status, exit-code, path policy and reporter boundary。
- 本 Story 不负责：
  - 重新定义 ownership classifier、files index schema、raw-byte hash semantics、resolver merge order、source descriptor trust model、operation lock 或 safe write primitive。
  - 普通 `speclite update` 的 full conflict detector；该行为属于 Story 4.5，本 Story只消费其 conflict facts。
  - 新增 top-level `speclite repair`、`speclite sync`、`doctor`、`uninstall`、backup/restore、standalone update report artifact、transactional rollback、daemon/background service、enterprise dashboard 或 Post-MVP migration commands。

### Architecture Requirements（架构要求）

- Runtime baseline 保持 Node.js 22 minimum 和 Node.js 24 recommended。Node.js official releases 在 2026-05-26 显示 Node 22 与 Node 24 为 LTS、Node 26 为 Current；不要把 MVP baseline 提升到 Node 26，也不要使用 Node 24-only API，除非提供 Node 22-compatible path 并更新 runtime policy / fixtures。Source: https://nodejs.org/en/about/previous-releases
- CLI foundation 保持 TypeScript + commander。不要为本 Story 引入 oclif/yargs/cac/clipanion。
- Runtime schema validation 继续使用 architecture-pinned `zod@4.4.3` 与 executable schema/parser anchors。不要为 repair planning 引入新的 schema/runtime validation library。
- Storage model 是 filesystem-first / local-first。不要引入 database、web service、daemon、REST API、GraphQL、desktop UI、persistent cache server 或 background process。
- `src/commands/update.ts` 只做 flag parsing、command mode normalization 和 orchestration；repair eligibility 属于 `src/update/`，ownership/hash 属于 `src/update/` 与 `src/manifest/`，source evidence 属于 `src/source/`，path normalization / operation lock / safe write 属于 `src/fs/`，public projection/rendering 属于 `src/diagnostics/`。
- `fs/` 是唯一允许实现 Path Normalization、Operation Lock 和 Safe Writes 的模块。Repair apply 可以消费 fs preflight results 和 private lock handle，但不得复制 path escape、symlink escape、case conflict、safe-write 或 unsafe overwrite low-level logic。

### Implementation Anchors（实现锚点）

需要创建或扩展的 implementation anchors，实际命名应贴合已有实现：

- `src/commands/update.ts`：parse `--repair`，normalize command mode to `update.repair`，route resolver -> installed state -> repair planner -> authorization -> lock/safe apply -> diagnostics projection。
- `src/update/repair-plan.ts`：central repair planner，derive `restore-canonical` / `regenerate` / `skip` actions and path-level conflicts。
- `src/update/conflict-detector.ts`：reuse Story 4.5 drift facts and reason-code guards；normal update conflict semantics must remain separate from repair eligibility。
- `src/update/update-plan.ts`：keep normal `UpdatePlan` behavior isolated; only share common planning primitives when semantics match owning SPEC.
- `src/update/apply-update.ts`：consume authorized update/repair actions and private lock handle; all mutations go through `src/fs/safe-write.ts`.
- `src/update/ownership-model.ts`：ownership truth and protected boundary predicates; human-owned/workflow-owned/unknown never enter `RepairPlan.actions[]`.
- `src/manifest/manifest-generator.ts` / `src/manifest/manifest-schema.ts` or equivalent files-index helper, and `src/manifest/hash.ts`：files index raw-byte hash baseline, current hash calculation and expectedHash comparison.
- `src/manifest/manifest-generator.ts` or equivalent skill-index helper：canonical package hash and installed target mirror projection used by `restore-canonical`.
- `src/source/source-descriptor-schema.ts` and source resolver anchors：resolved canonical source and source integrity evidence used by repair eligibility; missing evidence blocks repair.
- `src/ide/mirror-validator.ts` or `src/validation/rules/ide-mirror.ts`：IDE mirror drift facts must align with repair planner facts.
- `src/fs/path-normalizer.ts`、`src/fs/operation-lock.ts`、`src/fs/safe-write.ts`：project-relative POSIX paths, lock acquisition/release/stale diagnostics, temp-write + rename safe writes and unsafe target preflight.
- `src/diagnostics/command-result-schema.ts`：`RepairCommandData`、`RepairPlan`、`UpdateConflict`、producer/consumer reason-code modes。
- `src/diagnostics/command-result.ts`：single `update.conflicts` issue projection, status/exit-code derivation, nextActions ordering and suggested validation command。
- `src/diagnostics/output.ts`：Evidence profile, Repair Plan Block, Protected Boundaries, remaining conflict details, `NO_COLOR` / non-TTY / CI / narrow terminal fallback。
- `src/validation/issue-model.ts`：`ValidationIssue` construction helpers, taxonomy guards and redaction-safe details policy。
- `test/fixtures/existing-install-update/`、`test/fixtures/ide-drift/`、`test/fixtures/path-portability/`、`test/fixtures/fresh-install-empty-project/`、`test/fixtures/source-integrity/`：repair, preservation and source-evidence fixture assertions。

如果这些文件已经由前置 stories 创建，修改前必须完整读取并保留既有 behavior。如果这些文件尚不存在，按前置 story implementation 顺序补齐，不要绕过 owning SPECs 创建私有实现。

### Repair Eligibility Matrix（Repair 资格矩阵）

| Condition（条件） | Repair Outcome（Repair 结果） | Action / Reason（动作 / 原因） | Notes（备注） |
| --- | --- | --- | --- |
| installer-owned IDE mirror / canonical package drift has resolved canonical source content | repair action | `restore-canonical` with required `expectedHash` | 不从 stale IDE mirror 重构 canonical content。 |
| installer-owned IDE mirror drift has installed canonical package baseline proving expected content hash | repair action | `restore-canonical` with required `expectedHash` | Baseline 必须能证明 expected content hash。 |
| installer-owned generated metadata/control file can be dry-run regenerated from current source descriptor and templates | repair action | `regenerate` with required `expectedHash` | 先生成 candidate content，再按 raw-byte hash 计算 expected hash。 |
| current hash already matches expected state | planned skip | `skip` with required `expectedHash` and `reason: "unchanged"` | 仅适用于 installer-owned entries，且只表示 planned skip；`changedPaths` / `skippedPaths` 仍取决于 actual apply。 |
| human-owned custom TOML exists | conflict or non-plan protected boundary display | `human-owned` | 永不进入 `RepairPlan.actions[]`，不得重排、格式化或 normalize。 |
| workflow-owned artifact or metadata sidecar exists | conflict or non-plan protected boundary display | `workflow-owned` | Artifact validation failure 只能诊断，不触发 repair write，也不得作为 executable repair plan action。 |
| ownership cannot be proven from manifest/files index | conflict | `unknown-ownership` | 不得默认当作 installer-owned。 |
| source evidence or canonical baseline missing | conflict | `missing-source-evidence` | 不得转换成 restore/regenerate。 |
| artifact kind/path cannot derive safe repair action | conflict | `unsupported-repair` | 不新增非契约化 action。 |
| path-level authorization policy blocks executable repair for a specific installer-owned path | non-plan protected boundary display or conflict | `not-authorized` | 不用于 dry-run、pending confirmation 或 script mode without `--yes`；不得把 human-owned / workflow-owned protection 投影成 `RepairPlan.actions[]`。 |

### CommandResult Requirements（CommandResult 要求）

- `speclite update --repair --json` 输出 `CommandResult<RepairCommandData>`，`command` 必须是 `update.repair`。
- Required `data` fields：`repairPlan`、`changedPaths`、`skippedPaths`、`conflicts`、`requiresConfirmation`、`writeAuthorized`。
- `RepairPlan.actions[]` 只能包含 installer-owned entries，`action` 只能是 `restore-canonical`、`regenerate` 或 `skip`；每个 action 都必须有 `expectedHash`，包括 installer-owned `skip`。
- `RepairPlan` 是 planned effects，不是 execution log。`changedPaths` / `skippedPaths` 只表示 actual apply result；`writeAuthorized === false` 时必须为空。
- `data.conflicts.length > 0` 是 blocking failure condition。`CommandResult.status` 必须为 `failure`，exit code 必须 non-zero。
- Conflict set 只允许一个 command-level issue：`update.conflicts`。逐路径 conflicts 属于 `data.conflicts`。
- `operation-lock.project-locked` 是 command-level blocker，不属于 `data.conflicts`。如果 lock acquisition 前失败，reporters 不得输出 `repairPlan`、`changedPaths`、`skippedPaths` 或 `conflicts`。
- 所有 path fields 必须是 project-relative POSIX path；不得输出 absolute path、home directory、temporary/cache path、drive letter、OS-specific separator、raw stack trace、timestamp 或 random id。

### UX / Output Requirements（UX 与输出要求）

- `update --repair` 是 explicit trust boundary，不是普通 update 的隐藏模式。Human-readable output 必须明确说明 repair 与 ordinary update 的差异。
- Evidence profile 应展示 Summary、Repair Plan / Planned Effects、Authorization、Remaining Conflicts、Protected Boundaries、Changed Paths、Skipped Paths 和 Next Actions。
- 每条 repair action / conflict / skipped row 必须展示 affected path、ownership、action 或 blocked action、reason code 或文本等价说明、suggested next step。
- Script mode without `--yes` 必须显示 unapplied repair plan 与 authorization state，让用户知道没有写入任何文件。
- Repair result 的 suggested validation command 应稳定指向 `speclite validate` 或 `speclite validate --json`，并由 `nextActions` 承载 automation 可见的后续动作。
- Human-readable output 不得依赖颜色、图标或表格位置传达唯一语义；`NO_COLOR`、non-TTY、CI、Windows path portability 和窄终端必须仍可读。
- Empty states 必须明确，例如 `No repairable drift detected`、`No remaining conflicts`、`No writes were performed`。

### Previous Story Intelligence（前序 Story 情报）

- Story 4.5 建立 ordinary `speclite update` 的 conflict detector 和 default non-overwrite matrix：installer-owned drift、IDE mirror drift、human-owned、workflow-owned、unknown ownership 和 missing source evidence 默认不会被普通 update 覆盖。Story 4.6 只能在 explicit `update --repair` 中把可证明 repairable 的 installer-owned drift 转成 repair actions。
- Story 4.5 明确 producer 只能输出 owning SPEC registry reason codes，consumer/parser 必须容忍 unknown future reason codes。Story 4.6 必须继承该 producer/consumer 分离，尤其是 `missing-source-evidence`、`unsupported-repair` 和 `not-authorized`。
- Story 4.4 建立了 project operation lock 与 safe write 边界：write-capable commands 需要 lock，installer-owned mutation 需要 same-directory temp-write + rename，unsafe target path 在 apply 前阻断。Story 4.6 authorized repair apply 必须复用这些 fs primitives，不得直接写文件。
- Story 4.4 明确 `operation-lock.project-locked` 是 command-level blocker，不进入 `data.conflicts`；lock 前失败不得输出 plan/conflict payload 假装 planning 完成。
- Story 4.3 建立 planned vs actual result separation：`UpdatePlan.actions[]` / `RepairPlan.actions[]` 是 planned effects，`changedPaths` / `skippedPaths` 只代表 actual apply result。Script mode without `--yes` 或 pending confirmation 保留真实 plan、`writeAuthorized: false`，不得改写为 `skip:not-authorized`。
- Story 4.1 建立 `_speclite/custom/*.toml` 与 `_speclite/custom/*.user.toml` 为 human-owned，install/update/repair 不得覆盖、重写、重排、格式化、normalize 或删除；workflow artifacts 是 workflow-owned，不得作为 repair changed paths。
- Story 4.2 建立 update/repair planning 前必须复用 shared config/customization resolver。Resolver 可以读取 human-owned TOML，但不得因此把 custom TOML 纳入 repair plan。
- Story 3.5 建立 human-readable output 和 `--json` output 必须共享同一 semantic source；command modules 不得 hand-roll public JSON、status text、issue layout 或 next action order。

### Contract Requirements（契约要求）

- `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md` 拥有 `CommandResult`、`ValidationIssue`、`UpdateCommandData`、`RepairCommandData`、`UpdatePlan`、`RepairPlan`、`UpdateConflict`、status/exit-code derivation、path policy、timestamp policy、reason code registry、repair action semantics、unknown future reason code consumer tolerance 和 public ordering。
- `_bmad-output/planning-artifacts/specs/03-install-plan-contract.md` 拥有 plan-before-write、`requiresConfirmation`、`writeAuthorized`、dry-run、`--yes`、operation lock、safe write、partial failure、repair source policy 和 human-owned TOML stub 规则。
- `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md` 拥有 manifest/index/files index fields、canonical package hash、ownership projection、raw-byte hash、workflow artifact semantics、volatile `_speclite/.lock` / `.speclite-tmp-` exclusion 和 deterministic fixture policy。
- `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md` 拥有 canonical issue category order、reserved issue ids、default severity guidance、`ide-mirror.hash-mismatch`、`file-integrity.hash-mismatch`、`file-integrity.unknown-ownership`、`file-integrity.unsafe-overwrite-risk`、`operation-lock.project-locked` 和 `update.conflicts` category boundaries。
- `_bmad-output/planning-artifacts/specs/08-fixture-contract.md` 拥有 fixture case names、release gates、expected output classes、semantic JSON comparison、human/workflow-owned preservation checks、stable snapshot normalization 和 release matrix policy。
- `_bmad-output/planning-artifacts/ux-design-specification.md` 拥有 repair journey、Update Plan Block、Validation Issue Row、Protected Boundaries、Evidence profile、NO_COLOR/non-TTY/CI/narrow terminal fallback 和 command-to-command next action guidance。
- ADRs 可以解释决策历史，但不得重新定义 field-level schema、issue taxonomy、fixture layout、command payload 或 implementation anchors。若 ADR 与 owning SPEC 冲突，follow owning SPEC。

### Testing Requirements（测试要求）

- Use Vitest。
- Tests 必须 deterministic、local-only，不访问 npm registry、private registry、Git remote、offline bundle origin、package-manager cache 或外部网络。
- 使用 temporary target projects 构造 installed-state cases。不要使用当前 repo 的 `_bmad` 或 `_bmad-output` 作为 installed target state。
- JSON tests 必须 parse 后断言 semantic fields。不要比较 raw pretty-printed JSON bytes，除非 formatting 本身是测试目标。
- Human-owned 和 workflow-owned preservation 必须通过 content/order/comment unchanged checks 断言；installer-owned drift 和 repair expected hash 使用 raw-byte hash comparison。
- Path-portability fixtures 覆盖 macOS / Windows path separator、case behavior、symlink/path escape 和 project-relative POSIX output。
- Fixture snapshots 必须 normalize 或 exclude timestamps、duration、operation-lock volatile fields、temporary paths、`projectRootHash`、environment-specific paths 和 generated metadata timestamps。

### Git Intelligence Summary（Git 历史摘要）

- 最近 5 个 commit 均为 docs/context/source/spec cleanup 类变更：`style(docs): 清理参考文档尾随空白`、`docs(context): 初始化项目上下文文档`、`docs(source): 同步内置源资产路径说明`、`docs(glossary): 整理术语目录与文档索引`、`docs(specs): 收敛 MVP 契约与实现锚点`。
- 当前可引用的实现模式主要来自 live planning artifacts、owning SPECs、previous story contexts 和 legacy resolver parity scripts，而不是已提交 TypeScript implementation。dev agent 不得从这些 docs commits 推断源码已经存在。

### Latest Technical Information（最新技术信息）

- No new third-party dependency is required for this Story. Use project-pinned libraries from Architecture and previous stories; do not introduce a new lockfile library, transactional filesystem library, CLI framework, schema library or table renderer.
- Use Node.js 22-compatible `node:fs/promises`, `node:path` and stable ECMAScript APIs. Do not introduce Node 24-only behavior.
- External web check was limited to Node.js official release status. Repair semantics are governed by project-owned live PRD, Architecture, UX and owning SPEC contracts; no dependency upgrade is part of this Story.

### Project Context Reference（项目上下文引用）

- `_bmad-output/project-context.md` currently contains initialized metadata and placeholder sections only; it does not add implementation rules beyond live PRD, Architecture, UX, ADR and owning SPEC artifacts.
- The project-level language rule remains: conversation and generated docs in Chinese, section headings in `English（中文）` form, technical identifiers in English.

### References（参考）

- `_bmad-output/planning-artifacts/epics/07-epic-4-safe-update-and-repair安全更新与修复.md`
- `_bmad-output/implementation-artifacts/4-5-conflict-detection-and-default-non-overwrite-behavior.md`
- `_bmad-output/implementation-artifacts/4-4-project-operation-lock-and-safe-write.md`
- `_bmad-output/implementation-artifacts/4-3-update-plan-before-write.md`
- `_bmad-output/implementation-artifacts/4-2-config-and-customization-merge-order-for-updates.md`
- `_bmad-output/implementation-artifacts/4-1-ownership-model-and-protected-file-boundaries.md`
- `_bmad-output/planning-artifacts/prd/10-functional-requirements功能需求.md`
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
- Node.js official releases: https://nodejs.org/en/about/previous-releases

## Dev Agent Record（开发代理记录）

### Agent Model Used（使用模型）

GPT-5 Codex

### Debug Log References（调试日志引用）

- 2026-06-01 13:42 CST：解析 `bmad-dev-story` workflow，读取 Story 4.6 与 `sprint-status.yaml`。
- 2026-06-01 13:46 CST：新增 Story 4.6 focused tests 后运行 `npx vitest run test/update-planning.test.ts test/update-command.test.ts`，预期红灯。
- 2026-06-01 13:51 CST：实现 repair planner/apply/output 后运行 focused tests、`npm run build`、`npm test` 与 `git diff --check`，全部通过。
- 详细命令与结果记录见 `_bmad-output/implementation-artifacts/code-reviews/4-6-code-review/EXPERIMENTS.md`。

### Completion Notes List（完成备注）

- Story context created by bmad-create-story sub-agent #6.
- Ultimate context engine analysis completed - comprehensive developer guide created.
- 实现 `speclite update --repair` 的真实 repair planning：installer-owned drift 可从本地 canonical source 或 IDE mirror canonical package source 生成 `restore-canonical` / `regenerate` actions；每个 action 都携带 `expectedHash`。
- 保留 protected ownership 与 source evidence 边界：human-owned、workflow-owned、unknown ownership、missing source evidence 与 unsupported IDE mirror duplicate repair 均进入 `data.conflicts`，并只通过单个 command-level `update.conflicts` issue 汇总。
- 实现未授权与授权语义：无 `--yes` / `--dry-run` 输出 unapplied repair plan 且不写入；`--yes` 且无 conflicts 时在 operation lock 内通过 `safeWriteFile` 应用 repair，并只记录实际完成的 `changedPaths` / `skippedPaths`。
- 更新 human-readable Evidence profile，repair 模式展示 Repair Plan / Planned Effects、Authorization、Remaining Conflicts、Protected Boundaries、Changed Paths、Skipped Paths 和 Next Actions，并通过 `nextActions` 指向 `speclite validate`。
- 验证通过：focused tests 27 个、全量 `npm test` 198 个 tests、`npm run build`、`git diff --check`。

### File List（文件列表）

- `_bmad-output/implementation-artifacts/code-reviews/4-6-code-review/PLAN.md`
- `_bmad-output/implementation-artifacts/code-reviews/4-6-code-review/EXPERIMENTS.md`
- `_bmad-output/implementation-artifacts/code-reviews/4-6-code-review/EXPERIMENT_NOTES.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/implementation-artifacts/stories/4-6-explicit-repair-for-recoverable-installer-owned-drift.md`
- `src/commands/update.ts`
- `src/update/update-plan.ts`
- `src/diagnostics/output.ts`
- `test/update-command.test.ts`
- `test/update-planning.test.ts`

### Change Log（变更日志）

- 2026-06-01：完成 Story 4.6 dev step，实现 explicit `update --repair` planning/apply/output 与 focused tests，并将 Story 状态推进到 `review`。
