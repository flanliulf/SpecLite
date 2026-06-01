# Story 4.5: Conflict Detection And Default Non-Overwrite Behavior（冲突检测与默认不覆盖行为）

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story（故事）

作为项目维护者，  
我希望普通 `speclite update` 在发现本地 drift 或不确定安全性的文件时默认标记 conflict，  
以便避免静默覆盖用户修改、IDE mirror drift 或其它已安装状态异常。

## Acceptance Criteria（验收标准）

1. **Installer-owned drift becomes conflict（Installer-Owned Drift 默认进入冲突）**  
   **前提** installer-owned 文件的 current hash 与 files index baseline 不一致；  
   **当** 用户运行普通 `speclite update`；  
   **则** 系统会将该路径标记为 conflict；  
   **并且** 不会静默覆盖当前文件内容。

2. **IDE mirror drift becomes conflict（IDE Mirror Drift 默认进入冲突）**  
   **前提** IDE mirror 中的 canonical skill package 与 manifest baseline 不一致；  
   **当** 普通 update 生成计划；  
   **则** 系统会报告 IDE mirror drift conflict；  
   **并且** 不会直接恢复 canonical 内容。

3. **Human-owned custom files are never overwritten（Human-Owned Custom 文件绝不被自动覆盖）**  
   **前提** human-owned custom 文件存在本地内容；  
   **当** update 检查该路径；  
   **则** 系统不会把它加入 overwrite plan；  
   **并且** 不会因为 source 有更新而修改、重排或格式化该文件。

4. **Workflow-owned artifacts are excluded from changed paths（Workflow-Owned 产物不进入 Changed Paths）**  
   **前提** workflow-owned artifact 存在；  
   **当** update 检查 artifact path；  
   **则** 系统不会覆盖或删除该产物；  
   **并且** artifact path 不进入 installer-owned changed paths。

5. **Conflicts use one command-level issue（冲突只使用一个命令级 Issue）**  
   **前提** update 发现一个或多个 conflicts；  
   **当** 生成 command-level issue；  
   **则** 使用 `update.conflicts` 作为 command-level planning blocker；  
   **并且** 逐路径冲突只放入 `data.conflicts`，不得复制成多个 issues。

6. **Conflict summary exposes stable details（冲突摘要暴露稳定细节）**  
   **前提** update 输出 conflict summary；  
   **当** 用户查看 human-readable 或 `--json` 结果；  
   **则** 每个 conflict 包含 affected path、ownership、reason code 和 suggested next step；  
   **并且** producer 只能输出 owning SPEC registry 中的 reason code，suggested next step 指向明确的 repair、manual action 或验证命令。

7. **Conflict ordering is deterministic（冲突排序确定）**  
   **前提** 相同 drift 状态下重复运行 update planning；  
   **当** files、manifest 和 source 未变化；  
   **则** conflicts 的 affected path、reason code 和 action 集合保持稳定；  
   **并且** 不依赖 filesystem traversal order。

## Tasks / Subtasks（任务 / 子任务）

- [x] Task 1: 验证前置实现、工作树和只读边界（AC: 1-7）
  - [x] 实现前重新检查 root `package.json`、`package-lock.json`、`src/`、`test/`、`tests/`、root `fixtures/` 是否与当前 sprint/source 状态一致。截至 2026-05-29，Epic 3 提交 `395b017` 已提供 root TypeScript CLI scaffold、`src/commands/update.ts`、`CommandResult` / `ValidationIssue` anchors 和 validation/diagnostics tests；不得把 ready-for-dev story context 当作 Epic 4 源码已完成证据。
  - [x] 确认 Story 3.5 `CommandResult` / `ValidationIssue` anchors 仍可复用，并重新验证 Story 4.1 ownership/files index anchors、Story 4.2 shared resolver anchors、Story 4.3 update plan/authorization anchors、Story 4.4 operation lock/safe write anchors 是否真实存在；若不存在，按前序 story implementation 顺序补齐，不得在本 Story 中绕过契约创建私有 conflict model。
  - [x] 检查当前 worktree dirty 状态，保留用户、父 agent 或其他 sub-agent 的 planning artifacts、story 文件、源码和状态文件改动；不得格式化、重写、同步或回滚无关文件。
  - [x] 修改任何 UPDATE 文件前完整读取该文件，记录 current behavior、data shape、public output、tests 和必须保留的行为；不得用本 Story 重构无关模块。

- [x] Task 2: 实现 conflict detector 输入模型与 drift 分类（AC: 1-4）
  - [x] 在 `src/update/conflict-detector.ts` 或既有 update conflict anchor 中集中实现 conflict detection；不得在 `src/commands/update.ts`、renderer 或 fixture helper 中复制判断逻辑。
  - [x] 输入必须来自 installed manifest/index/source descriptor、files index raw-byte hash baseline、ownership projection、resolved config/customization、IDE mirror canonical package baseline 和 current filesystem inspection。
  - [x] Installer-owned path 的 current raw-byte hash 与 files index baseline 不一致时，普通 `update` 必须生成 conflict，reason 为 `installer-owned-drift`；不得把 confirmation、`--yes` 或 source update 解释成 repair drift 授权。
  - [x] IDE mirror canonical skill package 与 manifest `canonicalPackageHash` 或 file-level baseline 不一致时，普通 `update` 必须生成 IDE mirror drift conflict；不得从 stale IDE mirror 恢复 canonical 内容，也不得直接覆盖 mirror。
  - [x] Human-owned custom files 包括 `_speclite/custom/*.toml` 和 `_speclite/custom/*.user.toml`。这些文件可被 resolver 读取，但 update 不得覆盖、重写、重排、格式化、normalize、删除或 create-if-present。
  - [x] Workflow-owned artifact paths 包括 `_speclite-output/**` 和 configured workflow artifact root。Artifact metadata validation failure 只能产生诊断，不得触发 overwrite、restore-canonical、regenerate 或 changed path。
  - [x] Unknown ownership、path escape、symlink escape、case conflict、file/directory type mismatch、stale temp file blocking mutation 或 missing source evidence 都必须进入 protected blocker path，不得默认当作 installer-owned。

- [x] Task 3: 生成 `UpdateConflict` 与 `UpdatePlan` 的稳定 public projection（AC: 1-7）
  - [x] 复用 `src/diagnostics/command-result-schema.ts` 中的 `UpdateConflict`、`UpdatePlan` 和 reason-code producer guards；不要在 `src/update/` 或 output layer 定义第二套 public JSON shape。
  - [x] 每个 `data.conflicts[]` entry 必须包含 project-relative POSIX `affectedPath`、`ownership`、stable lower-kebab `reason`，并在适用时包含 `currentHash` 和 `expectedHash`。
  - [x] Conflict 的 human guidance 不得塞进 `reason`。`reason` 只能是 owning SPEC registry 中的 stable code；human-readable explanation 或 suggested next step 由 output / next action 层承载。
  - [x] `UpdatePlan.actions[]` 可以包含 `action: "conflict"` 或 protected `skip` projection，但 executable overwrite plan 不得包含 human-owned、workflow-owned、unknown ownership 或 drifted installer-owned path。
  - [x] `changedPaths` 与 `skippedPaths` 只表示 actual apply result。`writeAuthorized === false` 或 blocked-by-conflict 时必须为空，不能用它们表达 planned conflicts。
  - [x] 所有 path fields 必须是 project-relative POSIX path；不得输出 absolute path、home directory、temporary/cache path、drive letter、OS-specific separator、raw stack trace、timestamp 或随机 id。

- [x] Task 4: 保持 single `update.conflicts` issue 和 status/exit-code 语义（AC: 5）
  - [x] 当 `data.conflicts.length > 0` 时，`CommandResult.status` 必须为 `failure`，exit code 必须 non-zero，即使命令是 dry-run、interactive pending confirmation 或 `writeAuthorized === false`。
  - [x] `issues[]` 必须包含且仅包含一个 command-level conflict blocker：`issueId: "update.conflicts"`、`category: "update"`、`severity: "error"`、无 `affectedPath`、`details.conflictCount` 等于 `data.conflicts.length`。
  - [x] 不得把每个 path-level conflict 复制成独立 `issues[]` entry。Per-path details 只放在 `data.conflicts`。
  - [x] `operation-lock.project-locked` 仍是 Story 4.4 的 command-level blocker，不属于 `data.conflicts`，不得复用 `update.conflicts` 表示 lock contention。
  - [x] Resolver warning、source warning 或 validation warning 可以进入 shared issue model，但不得破坏 single `update.conflicts` blocker rule；若存在 error/critical diagnostics，按 owning SPEC 的 status derivation 处理。

- [x] Task 5: 维护 stable reason code registry 与 producer/consumer 边界（AC: 1-7）
  - [x] Producer 只能输出 `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md` 的 MVP reason code registry：`unchanged`、`installer-owned-drift`、`human-owned`、`workflow-owned`、`unknown-ownership`、`missing-source-evidence`、`unsupported-repair`、`not-authorized`。
  - [x] `not-authorized` 只能表示 path-level authorization policy 阻止 specific path 进入 executable plan；不得表示 normal dry-run、pending confirmation 或 script mode without `--yes`。
  - [x] Consumer/parser 必须容忍 unknown future reason codes，并保留其 stable display string；不得仅因 code unknown 而 parsing failed。
  - [x] 如果实现确需新增 reason code、issue id 或 public JSON field，必须先更新 owning SPEC、executable schema/parser 和 fixtures；本 Story 没有授权修改 planning artifacts 时不得擅自新增。
  - [x] Suggested next step 必须基于 reason code 和 ownership 稳定派生，优先指向 `speclite validate`、`speclite update --repair`、manual review/manual action 或重新运行 update planning；不得默认建议删除或覆盖 human-owned/workflow-owned 文件。

- [x] Task 6: 实现 deterministic ordering 和 fixture-stable output（AC: 6-7）
  - [x] `conflicts` 排序必须按 normalized affected path -> ownership -> reason；不得依赖 filesystem traversal、object insertion、validation rule execution、adapter completion 或 async completion order。
  - [x] `updatePlan.actions` 排序必须按 normalized affected path -> action -> ownership -> reason；`issues` 和 `nextActions` 排序复用 diagnostics/output 层的 canonical rules。
  - [x] IDE target ordering 必须复用 adapter registry canonical target order，不得按本机目录顺序。
  - [x] Hash comparison 使用 files index raw-byte hash；line endings、executable bit、file mode、symlink handling 和 case conflict 是独立 validation dimensions，不得被 hash normalization 隐式吸收。
  - [x] Fixture snapshots 必须 normalize 或排除 timestamp、duration、operation-lock volatile fields、safe-write temporary paths、projectRootHash 和 environment-specific paths。

- [x] Task 7: 实现 conflict summary 和 protected boundary UX（AC: 5-7）
  - [x] 复用 `src/diagnostics/output.ts` 或既有 shared output layer；`src/commands/update.ts` 不得自行拼接 conflict table、status text、JSON fields、path display 或 next action order。
  - [x] Human-readable Evidence profile 至少展示 Summary、Update Plan / Planned Effects、Authorization、Conflicts、Protected Boundaries、Changed Paths、Skipped Paths 和 Next Actions。
  - [x] 每条 conflict/skipped row 必须展示 affected path、ownership、reason code 或文本等价说明、proposed action / blocked action、suggested next step。
  - [x] `blocked-by-conflict`、`ready-to-apply`、`no-op`、`applied`、`partial-failure` 等状态必须有文本状态，不只靠颜色、图标或表格位置。
  - [x] `NO_COLOR`、non-TTY、CI、Windows path portability 和窄终端场景仍必须可读；表格可以降级为 key-value block，但不得丢失 issueId、affected path、ownership、reason、next action 或是否需要 `--yes`。
  - [x] Human-readable output 不得成为 automation 依赖字段的唯一承载位置；CI、fixtures 和 installed skills 必须依赖 `CommandResult.data`、`issues`、`nextActions`、manifest/index 或 fixture expected outputs。

- [x] Task 8: 编写 focused tests 和 release-gate fixture assertions（AC: 1-7）
  - [x] Unit tests 覆盖 installer-owned unchanged -> planned skip `unchanged`，installer-owned drift -> conflict `installer-owned-drift`，source updated but no local drift -> planned `update`，source updated plus local drift -> conflict。
  - [x] Unit tests 覆盖 IDE mirror drift：canonical package hash mismatch、file-level mirror hash mismatch、missing target mirror entry 和 duplicate target entry；普通 `update` 只报告 conflict，不执行 repair。
  - [x] Unit tests 覆盖 human-owned TOML preservation：existing project-level custom stubs、skill-specific custom files、empty/malformed/commented/reordered TOML 均保持原始字节、顺序和注释不变。
  - [x] Unit tests 覆盖 workflow-owned artifact preservation：artifact root、metadata sidecar、configured output root、missing/invalid metadata 只产生诊断，不进入 overwrite plan 或 changed paths。
  - [x] JSON reporter tests 覆盖 single `update.conflicts` issue、`details.conflictCount`、path-level conflicts only in `data.conflicts`、status failure、non-zero exit、stable ordering 和 path policy。
  - [x] Human-readable renderer tests 覆盖 conflict summary、protected boundary block、NO_COLOR、non-TTY、CI、narrow terminal fallback 和 reason text visibility。
  - [x] Integration / fixture tests 覆盖 `test/fixtures/existing-install-update/`、`test/fixtures/ide-drift/`、`test/fixtures/path-portability/` 和 relevant `fresh-install-empty-project` preservation assertions。
  - [x] 所有 tests 必须 deterministic、local-only，不访问 npm registry、private registry、Git remote、offline bundle origin、package-manager cache 或外部网络。

- [x] Task 9: 本地验证与范围控制（AC: 1-7）
  - [x] 运行 `npm run build`。
  - [x] 运行 `npm test`，或至少运行 conflict detector、files index/hash、ownership preservation、IDE mirror drift、CommandResult reporter、Evidence profile renderer、path ordering 和 affected fixtures 的 focused Vitest tests。
  - [x] 如果前置 implementation 尚未完成，保留失败为有效前置信号；不要伪造 fixture pass、不要跳过 conflict/preservation tests、不要创建 update-private JSON shape 或 duplicate conflict reason registry。
  - [x] 检查 diff，确认没有修改 `_bmad-output/planning-artifacts/`、已有 Story 1-3 文件、Story 4.1/4.2/4.3/4.4、无关源码或用户改动。
  - [x] 检查 diff，确认没有提前实现 Story 4.6 repair apply、Epic 5 source channel 扩展、Epic 6 release fixture matrix 或 Post-MVP `doctor` / `sync` / `uninstall` / top-level `repair` / backup-restore / standalone update report artifact。

## Dev Notes（开发备注）

### Current Repository State（当前仓库状态）

- 截至 2026-05-29 的 Epic 3 提交 `395b017`，仓库根目录已有 root `package.json`、`src/`、`test/` 以及 status/validate/update command anchors、`CommandResult` / `ValidationIssue` schema、diagnostics/output 和 validation issue/order anchors。root `fixtures/`、Story 4.1/4.2/4.3/4.4 update anchors 仍需按当前源码逐项确认。
- Epic 3 / Story 3.5 已完成：`src/commands/update.ts` 是 non-write placeholder 与 public contract seam。Story 4.1 到 4.4 的 actual implementation 仍需按 sprint 状态和源码重新确认；本 Story 4.5 的 ready-for-dev context 不是其自身实现完成证据。
- 当前 worktree 已有与本 Story 创建无关的 dirty planning artifacts、`sprint-status.yaml` 改动和未跟踪 Epic 1-4 story 文件。实现 Story 4.5 时不得格式化、重写、同步或回滚这些无关改动。
- `_bmad-output/project-context.md` 当前仍是初始化占位内容；实际 implementation guardrails 以 live PRD、Architecture、UX、ADR 和 owning SPEC artifacts 为准。
- 本 create-story run 复现了 skill activation runtime 行为：裸 `python3 _bmad/scripts/resolve_customization.py --skill .agents/skills/bmad-create-story --key workflow` 因 stdlib `tomllib` 缺失失败；`python3.12` 成功解析 workflow。

### Scope Boundary（范围边界）

- 本 Story 负责 normal `speclite update` 的 full conflict detector、default non-overwrite matrix、path-level `data.conflicts` projection、single command-level `update.conflicts` issue、reason code producer guards、deterministic ordering、conflict summary / protected boundary output 和 focused tests。
- 本 Story 消费：
  - Story 4.1 的 ownership model、files index ownership projection、human/workflow-owned protection、volatile `_speclite/.lock` / `.speclite-tmp-` exclusion。
  - Story 4.2 的 shared config/customization resolver output，尤其是 human-owned TOML 只读保护。
  - Story 4.3 的 update plan、write authorization、planned vs actual result separation、Evidence profile 和 public `UpdateCommandData` boundary。
  - Story 4.4 的 project operation lock、safe write、unsafe target preflight 和 partial failure boundary。
  - Story 3.5 的 `CommandResult` / `ValidationIssue` JSON, status, exit-code, path policy and reporter boundary。
- 本 Story 不负责：
  - 重新定义 ownership classifier、files index schema、raw-byte hash semantics、resolver merge order、operation lock、safe write 或 source trust model。
  - `update --repair` full repair planner/apply、`restore-canonical`、`regenerate`、repair source policy extension 或 `RepairPlan` apply semantics，除非只为 normal update conflict guidance 提供 next action。
  - 新增 top-level `speclite repair`、`speclite sync`、`doctor`、`uninstall`、backup/restore、transactional rollback、standalone update report artifact、daemon/background service 或 Post-MVP governance commands。

### Architecture Requirements（架构要求）

- Runtime baseline 保持 Node.js 22 minimum 和 Node.js 24 recommended。Node.js official releases 在 2026-05-26 显示 Node 22 与 Node 24 为 LTS、Node 26 为 Current；不要把 MVP baseline 提升到 Node 26，也不要使用 Node 24-only API，除非提供 Node 22-compatible path 并更新 runtime policy / fixtures。Source: https://nodejs.org/en/about/previous-releases
- CLI foundation 保持 TypeScript + commander。不要为本 Story 引入 oclif/yargs/cac/clipanion。
- Runtime schema validation 继续使用 architecture-pinned `zod@4.4.3` 与 executable schema/parser anchors。不要为 conflict detection 引入新的 schema/runtime validation library。
- Storage model 是 filesystem-first / local-first。不要引入 database、web service、daemon、REST API、GraphQL、desktop UI、persistent cache server 或 background process。
- `src/commands/update.ts` 只做 flag parsing、command mode normalization 和 orchestration；conflict detection 属于 `src/update/`，ownership/hash 属于 `src/update/` 与 `src/manifest/`，path normalization/safe write 属于 `src/fs/`，public projection/rendering 属于 `src/diagnostics/`。
- `update/` 只基于 ownership/hash/source/resolver inputs 生成 update/repair plans 和 conflicts。普通 `update` 的交互确认或 `--yes` 只授权无 conflict 的 planned update writes，不得把 drift conflict 转成 repair。
- `fs/` 是唯一允许实现 Path Normalization、Operation Lock 和 Safe Writes 的模块。Conflict detector 可以消费 fs preflight results，但不得复制 path escape、symlink escape、case conflict 或 unsafe overwrite low-level logic。

### Implementation Anchors（实现锚点）

需要创建或扩展的 implementation anchors，实际命名应贴合已有实现：

- `src/update/conflict-detector.ts`：installer-owned drift、IDE mirror drift、human-owned/workflow-owned/unknown ownership、missing source evidence、unsupported repair、path blocker reason mapping。
- `src/update/update-plan.ts`：normal update plan construction，consume conflict detector output，keep planned effects separate from actual apply result。
- `src/update/ownership-model.ts`：ownership truth 和 protected boundary predicates，来自 Story 4.1。
- `src/update/repair-plan.ts`：仅用于 suggested next step / future repair boundary，不在本 Story 中实现 full repair apply。
- `src/manifest/manifest-generator.ts` / `src/manifest/manifest-schema.ts` 或等价 files-index helper，以及 `src/manifest/hash.ts`：files index raw-byte hash baseline、ownership projection、volatile file exclusion。
- `src/manifest/manifest-generator.ts` 或 equivalent skill-index helper：canonical package hash 与 installed target mirror projection。
- `src/ide/mirror-validator.ts` 或 `src/validation/rules/ide-mirror.ts`：IDE mirror drift detection source，必须和 update conflict detector 共享 semantic result 或 helper，避免 validate/update 产生不同 drift facts。
- `src/fs/path-normalizer.ts`：project-relative POSIX normalization、escape/case conflict helper；Story 4.5 只调用，不复制实现。
- `src/commands/update.ts`：update orchestration、lock-before-planning/apply boundary consumption、write authorization routing。
- `src/diagnostics/command-result-schema.ts`：`UpdateConflict`、`UpdatePlan`、`UpdateCommandData`、reason code producer guards。
- `src/diagnostics/command-result.ts`：single `update.conflicts` issue projection、status/exit-code derivation、nextActions ordering。
- `src/diagnostics/output.ts`：Evidence profile、Conflict / Skipped Path Detail、Protected Boundaries、NO_COLOR/non-TTY/CI/narrow terminal fallback。
- `src/validation/issue-model.ts`：`ValidationIssue` construction helpers、taxonomy guards 和 redaction-safe details policy。
- `test/fixtures/existing-install-update/`、`test/fixtures/ide-drift/`、`test/fixtures/path-portability/`、`test/fixtures/fresh-install-empty-project/`：conflict/preservation fixture assertions。

如果这些文件已经由前置 stories 创建，修改前必须完整读取并保留既有 behavior。如果这些文件尚不存在，按前置 story implementation 顺序补齐，不要绕过 owning SPECs 创建私有实现。

### Conflict Matrix（冲突矩阵）

Normal `speclite update` 必须采用以下默认 non-overwrite matrix：

| Condition（条件） | Ownership（所有权） | Normal Update Outcome（普通 Update 结果） | Reason Code（原因码） | Notes（备注） |
| --- | --- | --- | --- | --- |
| current hash matches files index baseline and source has no newer expected content | `installer-owned` | `skip` planned action | `unchanged` | 不写入，`changedPaths` 为空。 |
| current hash matches baseline and source has newer expected content | `installer-owned` | planned `update` action | omitted | 仍需 write authorization；未授权时不写入。 |
| current hash differs from files index baseline | `installer-owned` | conflict | `installer-owned-drift` | 普通 `update` 不恢复、不覆盖；`--yes` 不能转 repair。 |
| IDE mirror canonical package hash differs from manifest baseline | `installer-owned` / `ide-mirror` projection | conflict | `installer-owned-drift` or owning SPEC equivalent | Target-specific diagnostics 可以使用 `ide-mirror.hash-mismatch`，但 path-level update conflict 仍进入 `data.conflicts`。 |
| existing `_speclite/custom/*.toml` or `_speclite/custom/*.user.toml` | `human-owned` | protected skip or conflict projection | `human-owned` | 保持原始字节、顺序和注释；resolver 只能读取。 |
| `_speclite-output/**` or configured workflow artifact root | `workflow-owned` | protected skip or conflict projection | `workflow-owned` | 不进入 installer-owned changed paths。 |
| ownership missing or cannot be proven | `unknown` | conflict | `unknown-ownership` | 不得默认当作 installer-owned。 |
| source evidence missing for safe update decision | any relevant ownership | conflict | `missing-source-evidence` | Source blocker 也可能产生 `source-integrity` issue；不要转换成 overwrite 授权。 |
| path-level authorization policy blocks executable write | any relevant ownership | protected skip | `not-authorized` | 不能用于 command-level dry-run 或 pending confirmation。 |

Producer 只能输出 owning SPEC registry 中的 reason code。Consumer/parser 必须容忍 unknown future reason codes。

### CommandResult Requirements（CommandResult 要求）

- `speclite update --json` 输出 `CommandResult<UpdateCommandData>`，required `data` fields 为 `updatePlan`、`changedPaths`、`skippedPaths`、`conflicts`、`requiresConfirmation`、`writeAuthorized`。
- `UpdatePlan` 是 planned effects，不是 execution log。`changedPaths` / `skippedPaths` 是 actual apply result。当 `writeAuthorized === false` 或 blocked-by-conflict 时，二者必须为空。
- `data.conflicts.length > 0` 是 blocking failure condition。`CommandResult.status` 必须为 `failure`，exit code 必须 non-zero。
- `issues[]` 对 conflict set 只允许一个 command-level blocker：`update.conflicts`。逐路径细节属于 `data.conflicts`。
- `operation-lock.project-locked` 是 command-level blocker，不属于 `data.conflicts`。如果 lock acquisition 前失败，reporters 不得输出 plan/conflict payload 假装 planning 完成。
- `summary`、`issues[].details`、`impact`、`suggestedNextStep`、`nextActions` 和 path fields 不得包含 timestamp、absolute local path、home directory、temporary/cache path、raw stack trace、random id 或 credential-bearing source locator。

### Deterministic Ordering Rules（确定性排序规则）

- `conflicts`：normalized affected path -> ownership -> reason。
- `updatePlan.actions`：normalized affected path -> action -> ownership -> reason。
- `issues`：severity order（`critical`、`error`、`warning`、`info`）-> category order -> normalized affected path -> issue id。
- `nextActions`：blocking remediation -> recommended next step -> optional exploration；tier 内使用 command-defined stable order。
- `changedPaths` / `skippedPaths`：normalized project-relative POSIX path。
- IDE target summaries：adapter registry canonical order，MVP 为 `claude`、`agents`。
- Public JSON arrays 不得依赖 filesystem traversal、object insertion、validation rule execution、adapter completion 或 async completion order。

### UX / Output Requirements（UX 与输出要求）

- Conflict 是安全边界组件，不是普通失败文案末端。Human-readable output 必须说明为什么不能安全写入，以及用户下一步如何验证、repair 或手动处理。
- Evidence profile 应展示 Summary、Update Plan / Planned Effects、Authorization、Conflicts、Protected Boundaries、Changed Paths、Skipped Paths 和 Next Actions。
- Conflict / skipped detail 必须包含 affected path、ownership、reason code 或文本等价说明、suggested next step。不能只依赖颜色、图标、表格位置或紧凑符号。
- Ordinary `update` 与 explicit `update --repair` 必须清晰区分。`--yes` 只能授权无 conflict 的 planned writes，不能隐式 repair drift。
- `NO_COLOR`、non-TTY、CI、Windows path portability 和窄终端下，affected path、ownership、reason、next action、issueId 和是否需要 `--yes` 仍必须纯文本可读。
- Empty states 必须明确，例如 `No conflicts detected`、`No protected paths changed`、`No writes were performed`。

### Previous Story Intelligence（前序 Story 情报）

- Story 4.4 建立了 project operation lock 与 safe write 边界：write-capable commands 需要 lock，installer-owned mutation 需要 same-directory temp-write + rename，unsafe target path 在 apply 前阻断。Story 4.5 的 conflict detector 必须在 planning 阶段阻止不安全 overwrite，但不得复制 Story 4.4 的 low-level safe-write implementation。
- Story 4.4 明确 `operation-lock.project-locked` 是 command-level blocker，不进入 `data.conflicts`；lock 前失败不得输出 plan/conflict payload 假装 planning 完成。
- Story 4.3 建立 planned vs actual result separation：`UpdatePlan.actions[]` 是 planned effects，`changedPaths` / `skippedPaths` 只代表 actual apply result。Story 4.5 的 conflicts 是 planning diagnostics，不受 write authorization 影响。
- Story 4.3 明确 `--dry-run`、interactive pending confirmation、script mode without `--yes` 都保留真实 plan，设置 `writeAuthorized: false`，不得把 pending authorization 改写为 `skip:not-authorized`。
- Story 4.1 建立 `_speclite/custom/*.toml` 与 `_speclite/custom/*.user.toml` 为 human-owned，install/update/repair 不得覆盖、重写、重排、格式化、normalize 或删除；workflow artifacts 是 workflow-owned，不得作为 installer-owned changed paths。
- Story 4.1 建立 path-level conflicts 必须包含 normalized `affectedPath`、`ownership` 和 stable lower-kebab `reason`，并且 `data.conflicts.length > 0` 只生成一个 command-level `update.conflicts` issue。
- Story 4.2 建立 update/repair planning 前必须复用 shared config/customization resolver。Resolver 可以读取 human-owned TOML，但不得因此把 custom TOML 纳入 overwrite plan。
- Story 3.5 建立 human-readable output 和 `--json` output 必须共享同一 semantic source；command modules 不得 hand-roll public JSON、status text、issue layout 或 next action order。

### Contract Requirements（契约要求）

- `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md` 拥有 `CommandResult`、`ValidationIssue`、`UpdateCommandData`、`RepairCommandData`、`UpdatePlan`、`RepairPlan`、`UpdateConflict`、status/exit-code derivation、path policy、timestamp policy、reason code registry 和 public ordering。
- `_bmad-output/planning-artifacts/specs/03-install-plan-contract.md` 拥有 plan-before-write、`requiresConfirmation`、`writeAuthorized`、dry-run、`--yes`、operation lock、safe write、partial failure、repair source policy 和 human-owned TOML stub 规则。
- `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md` 拥有 manifest/index/files index fields、canonical package hash、ownership projection、raw-byte hash、workflow artifact semantics、volatile `_speclite/.lock` / `.speclite-tmp-` exclusion 和 deterministic fixture policy。
- `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md` 拥有 canonical issue category order、reserved issue ids、default severity guidance、`ide-mirror.hash-mismatch`、`file-integrity.hash-mismatch`、`file-integrity.unknown-ownership`、`file-integrity.unsafe-overwrite-risk`、`operation-lock.project-locked` 和 `update.conflicts` category boundaries。
- UX conflict summary、Update Plan Block、Validation Issue Row、Protected Boundaries 和 Evidence profile 要求来自 `_bmad-output/planning-artifacts/ux-design-specification.md`。
- ADRs 可以解释决策历史，但不得重新定义 field-level schema、issue taxonomy、fixture layout、command payload 或 implementation anchors。若 ADR 与 owning SPEC 冲突， follow owning SPEC。

### Testing Requirements（测试要求）

- Use Vitest。
- Tests 必须 deterministic、local-only，不访问 npm registry、private registry、Git remote、offline bundle origin、package-manager cache 或外部网络。
- 使用 temporary target projects 构造 installed-state cases。不要使用当前 repo 的 `_bmad` 或 `_bmad-output` 作为 installed target state。
- JSON tests 必须 parse 后断言 semantic fields。不要比较 raw pretty-printed JSON bytes，除非 formatting 本身是测试目标。
- Human-owned 和 workflow-owned preservation 必须通过 content/order/comment unchanged checks 断言；installer-owned drift 使用 raw-byte hash comparison。
- Path-portability fixtures 覆盖 macOS / Windows path separator、case behavior、symlink/path escape 和 project-relative POSIX output。
- Fixture snapshots 必须 normalize 或 exclude timestamps、duration、operation-lock volatile fields、temporary paths、`projectRootHash` 和 environment-specific paths。

### Git Intelligence Summary（Git 历史摘要）

- 最近 5 个 commit 均为 docs/context/source/spec cleanup 类变更：`style(docs): 清理参考文档尾随空白`、`docs(context): 初始化项目上下文文档`、`docs(source): 同步内置源资产路径说明`、`docs(glossary): 整理术语目录与文档索引`、`docs(specs): 收敛 MVP 契约与实现锚点`。
- 当前可引用的实现模式主要来自 live planning artifacts、owning SPECs、previous story contexts 和 legacy resolver parity scripts，而不是已提交 TypeScript implementation。dev agent 不得从这些 docs commits 推断源码已经存在。

### Latest Technical Information（最新技术信息）

- No new third-party dependency is required for this Story. Use project-pinned libraries from Architecture and previous stories; do not introduce a new lockfile library, transactional filesystem library, CLI framework, schema library or table renderer.
- Use Node.js 22-compatible `node:fs/promises`, `node:path` and stable ECMAScript APIs. Do not introduce Node 24-only behavior.
- External web check was limited to Node.js official release status. Conflict detection semantics are governed by project-owned live PRD, Architecture, UX and owning SPEC contracts; no dependency upgrade is part of this Story.

### Project Context Reference（项目上下文引用）

- `_bmad-output/project-context.md` currently contains initialized metadata and placeholder sections only; it does not add implementation rules beyond live PRD, Architecture, UX, ADR and owning SPEC artifacts.
- The project-level language rule remains: conversation and generated docs in Chinese, section headings in `English（中文）` form, technical identifiers in English.

### References（参考）

- `_bmad-output/planning-artifacts/epics/07-epic-4-safe-update-and-repair安全更新与修复.md`
- `_bmad-output/implementation-artifacts/4-4-project-operation-lock-and-safe-write.md`
- `_bmad-output/implementation-artifacts/4-3-update-plan-before-write.md`
- `_bmad-output/implementation-artifacts/4-2-config-and-customization-merge-order-for-updates.md`
- `_bmad-output/implementation-artifacts/4-1-ownership-model-and-protected-file-boundaries.md`
- `_bmad-output/planning-artifacts/implementation-readiness-report-2026-05-26.md`
- `_bmad-output/planning-artifacts/prd/10-functional-requirements功能需求.md`
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

GPT-5.5 (gpt-5.5)

### Debug Log References（调试日志引用）

- `_bmad-output/implementation-artifacts/code-reviews/4-5-code-review/PLAN.md`
- `_bmad-output/implementation-artifacts/code-reviews/4-5-code-review/EXPERIMENTS.md`
- `_bmad-output/implementation-artifacts/code-reviews/4-5-code-review/EXPERIMENT_NOTES.md`

### Completion Notes List（完成备注）

- Story context created by bmad-create-story sub-agent #5.
- Ultimate context engine analysis completed - comprehensive developer guide created.
- 完成普通 `speclite update` conflict detector 集中实现，复用 files index raw-byte hash、ownership projection、configured artifact root 和 IDE mirror `canonicalPackageHash` baseline。
- 普通 update 对 installer-owned drift、project-relative source evidence 缺失、human-owned custom、workflow-owned artifact、unknown ownership、IDE mirror hash mismatch / missing target / duplicate target entry 生成 `data.conflicts`，且不写入 `changedPaths` / `skippedPaths`。
- 保持 single command-level `update.conflicts` issue；per-path details 仅放入 `data.conflicts`，并保留 `operation-lock.project-locked` 的独立 command-level blocker 边界。
- Update public parser 现在容忍 future lower-kebab reason codes；producer 仍通过 `UpdateReasonCode` 类型输出 owning registry 中的 reason code。
- Human-readable Evidence profile 中 conflict row 按 reason / ownership 派生明确 next action，覆盖 repair、manual action、validate 和 source evidence 恢复路径。
- 验证通过：focused update/ownership/lock tests、`npm run build`、全量 `npm test`、`git diff --check`。

### File List（文件列表）

- `_bmad-output/implementation-artifacts/code-reviews/4-5-code-review/EXPERIMENTS.md`
- `_bmad-output/implementation-artifacts/code-reviews/4-5-code-review/EXPERIMENT_NOTES.md`
- `_bmad-output/implementation-artifacts/code-reviews/4-5-code-review/PLAN.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/implementation-artifacts/stories/4-5-conflict-detection-and-default-non-overwrite-behavior.md`
- `src/diagnostics/command-result-schema.ts`
- `src/diagnostics/output.ts`
- `src/update/conflict-detector.ts`
- `src/update/update-plan.ts`
- `test/update-command.test.ts`
- `test/update-planning.test.ts`

### Change Log（变更日志）

- 2026-06-01: Implemented Story 4.5 conflict detection and default non-overwrite behavior; moved story to review.
