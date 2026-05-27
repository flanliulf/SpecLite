# Story 4.3: Update Plan Before Write（写入前更新计划）

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story（故事）

作为项目维护者，  
我希望 `speclite update` 在修改任何文件前先生成明确的 update plan，  
以便看到哪些文件将被修改、跳过或标记冲突，并在授权前确认影响范围。

## Acceptance Criteria（验收标准）

1. **Read installed state before planning（规划前读取已安装状态）**  
   **前提** 用户运行 `speclite update`；  
   **当** 系统开始更新流程；  
   **则** 系统会先读取 installed state、source descriptor、files index、ownership 信息和 resolved config；  
   **并且** 在生成 update plan 前不修改项目文件。

2. **Plan entries expose planned effects（Plan 条目展示预期影响）**  
   **前提** update plan 生成中；  
   **当** 系统比较 expected state 与 current installed state；  
   **则** plan 会列出 planned effects、affected paths、ownership、current hash、expected hash 和 proposed action；  
   **并且** 路径使用 project-relative POSIX path。

3. **Installer-owned source updates require authorization（Installer-Owned 来源更新需要授权）**  
   **前提** 某个 installer-owned 文件未发生本地 drift 且 source 有更新；  
   **当** 系统生成 update plan；  
   **则** 该文件可被标记为 planned change；  
   **并且** 只有获得明确写入授权后才允许进入写入阶段。

4. **Unsafe paths remain unchanged（不安全路径保持不变）**  
   **前提** 某个文件无法确认安全更新；  
   **当** 系统生成 update plan；  
   **则** 该文件会进入 skipped 或 conflicts 集合；  
   **并且** 原文件在本次命令中保持不变。

5. **Interactive pending confirmation preserves real planned actions（交互式待确认保留真实计划动作）**  
   **前提** 用户以交互模式运行 update；  
   **当** plan 已生成但用户尚未确认；  
   **则** 系统会展示 impact summary、changed/skipped/conflict paths 的预期结果；  
   **并且** 不会把未授权的 planned action 改写成 `skip:not-authorized`。

6. **Script mode without `--yes` is unapplied（无 `--yes` 的脚本模式不应用写入）**  
   **前提** 用户以脚本模式运行 update 且未传入 `--yes`；  
   **当** plan 需要写入授权；  
   **则** 命令保持 unapplied plan 状态；  
   **并且** 不写入 installer-owned 文件。

7. **`--json` separates planned and actual results（`--json` 区分计划与实际结果）**  
   **前提** 用户请求 `update --json` 输出；  
   **当** plan 生成完成；  
   **则** machine-readable data 会区分 planned effects、actual apply results、skipped paths 和 conflicts；  
   **并且** 不把逐路径 conflicts 复制成多个 command-level issues。

8. **Evidence profile shows authorization and protected boundaries（Evidence Profile 展示授权与保护边界）**  
   **前提** update plan 使用 human-readable output 展示；  
   **当** 系统进入写入授权前的 Evidence profile；  
   **则** 输出必须明确展示 planned effects、write authorization status、changed paths、skipped paths、conflicts 和 protected boundaries；  
   **并且** conflicts 与 skipped paths 必须包含稳定 reason code 或文本等价说明，不能只依赖颜色、图标或表格位置传达含义。

9. **Terminal fallback remains readable（终端降级仍可读）**  
   **前提** update plan 在窄终端、`NO_COLOR`、non-TTY 或 CI 环境展示；  
   **当** renderer 降级表格或移除颜色；  
   **则** affected path、ownership、proposed action、conflict reason、suggested next step 和是否需要 `--yes` 仍必须可读；  
   **并且** human-readable output 不得把 automation 依赖字段作为唯一承载位置。

## Tasks / Subtasks（任务 / 子任务）

- [ ] Task 1: 验证前置实现、当前仓库状态和只读边界（AC: 1-9）
  - [ ] 实现前重新检查 root `package.json`、`src/`、`test/`、`tests/`、`fixtures/` 是否已由前序 stories 创建。创建本 Story 时这些 TypeScript CLI 实现目录仍不存在，不能把 ready-for-dev story context 当成源码已完成证据。
  - [ ] 确认 Story 4.1 ownership model / files index anchors、Story 4.2 shared config/customization resolver anchors、Story 3.5 `CommandResult` / `ValidationIssue` anchors 是否真实存在；若不存在，按前序 story 顺序补齐，不得在本 Story 中绕过契约创建私有 update-only 模型。
  - [ ] 检查当前 worktree dirty 状态，保留用户、父 agent 或其他 sub-agent 的 planning artifacts、story 文件、源码和状态文件改动；不得格式化、重写、同步或回滚无关文件。
  - [ ] 修改任何 UPDATE 文件前完整读取该文件，记录 current behavior、data shape、public output、tests 和必须保留的行为；不得用本 Story 重构无关模块。

- [ ] Task 2: 建立 update planning orchestration 顺序（AC: 1, 3-6）
  - [ ] 在 `src/commands/update.ts` 或既有 update command orchestration 中保持顺序：parse flags -> build command context -> command mode normalization -> read-only preflight（读取 installed state、source descriptor、files index/hash baseline、ownership、resolved config/customization，不构造可写 plan payload）-> acquire project operation lock -> safe update planning / `UpdatePlan` construction -> render unapplied plan or request confirmation -> apply authorized writes through shared safe-write primitives。
  - [ ] 在 project operation lock 获取成功前，只允许 command mode normalization 和 read-only preflight；不得执行 safe planning、构造可导致写入的 `UpdatePlan` payload、解析为可写 source/package mutation、修改 `_speclite/`、IDE mirrors、`_speclite-output/`、human-owned TOML、manifest/index、files index 或任何 target project file。
  - [ ] `--dry-run`、interactive confirmation pending、non-TTY/script mode without `--yes` 都必须保留真实 `UpdatePlan.actions[]`，设置 `writeAuthorized: false`，并保持 `changedPaths: []` 与 `skippedPaths: []`。
  - [ ] `--yes` 只授权无 conflict 的 planned update writes；不得授权 installer-owned drift repair，不得修改 human-owned TOML 或 workflow-owned artifacts，不得绕过 source trust / ownership / hash blockers。
  - [ ] 如果 write-capable command 在获取 project operation lock 前失败，不得输出 `updatePlan`、`changedPaths`、`skippedPaths` 或 `conflicts` 假装 safe planning 已完成；该 blocker 属于 Story 4.4 的 lock path，但本 Story 的 reporter 必须遵守 `CommandResult` 边界。

- [ ] Task 3: 构建 UpdatePlan action model 与 reason code 映射（AC: 2-4, 7）
  - [ ] 复用 `src/diagnostics/command-result-schema.ts` 中的 `UpdatePlan`、`UpdateConflict` 和 producer guards；不要在 `src/update/` 或 renderer 中定义第二套 public JSON shape。
  - [ ] 每个 `UpdatePlan.actions[]` entry 必须包含 project-relative POSIX `affectedPath`、`ownership` 和 `action`；对于需要 hash comparison 的 installer-owned path，包含 `currentHash` 与 `expectedHash`。
  - [ ] `action` 只能使用 `create`、`update`、`skip`、`conflict`；`skip` 必须包含 stable lower-kebab `reason`。
  - [ ] Normal update 中的 installer-owned drift 必须进入 `conflicts` 或 conflict action，reason 为 `installer-owned-drift`；普通 confirmation 或 `--yes` 不得把它转换成 repair。
  - [ ] Human-owned 与 workflow-owned paths 不得进入 executable overwrite plan；需要展示时使用 `skip` 或 conflict projection，reason 使用 `human-owned`、`workflow-owned`、`unknown-ownership`、`missing-source-evidence`、`unsupported-repair` 等 owning SPEC registry 允许值。
  - [ ] Public arrays 按 contract ordering 排序：`updatePlan.actions` 以 normalized affected path -> action -> ownership -> reason 排序，`conflicts` 以 affected path -> ownership -> reason 排序，不能依赖 filesystem traversal order。

- [ ] Task 4: 接入 source descriptor、files index、ownership 与 resolved config（AC: 1-4）
  - [ ] Source descriptor 必须来自 `src/source/` 与 `02-source-descriptor-contract.md` 的 trust/evidence model；在 install/update 写入前至少有一项 reproducible integrity evidence。
  - [ ] `trustStatus: "blocked"`、floating Git source、local source self-reference、missing bundled packaging evidence 或 source policy blocker 必须阻断 write planning，不得用 `writeAuthorized` 表达 source acceptance。
  - [ ] Files index 必须遵守 `04-manifest-index-contract.md`：file-level hash 使用 raw bytes，fields 包含 `path`、`ownership`、`hash`、`hashAlgorithm: "sha256"`、`executable`、`artifactKind`、`sourceRef`。
  - [ ] `_speclite/.lock` 与 `.speclite-tmp-` safe-write temporary files 不得进入 files index，也不得影响 stable files-index hash。
  - [ ] Ownership truth 来自 Story 4.1 的 ownership model / files index projection；update planner 不得用 hard-coded path list 替代 ownership classifier。
  - [ ] Resolved config/customization 来自 Story 4.2 的 shared `src/config/` resolver；update planner 不得实现第二套 merge order、array merge 或 layer failure semantics。
  - [ ] Resolver warning-only diagnostics 允许 conservative planning，但必须进入 shared semantic model；resolver error/critical diagnostics 必须阻断 planning。

- [ ] Task 5: 实现 `CommandResult<UpdateCommandData>` 投影（AC: 5-7）
  - [ ] `speclite update --json` 输出 `schemaVersion: "speclite.command-result.v1"`、`command: "update"`、stable `targetProject`、`summary`、`issues`、`nextActions` 和 `data`。
  - [ ] `data` required fields 为 `updatePlan`、`changedPaths`、`skippedPaths`、`conflicts`、`requiresConfirmation`、`writeAuthorized`；不得添加未契约化字段，除非同一变更先更新 owning SPEC、schema/parser 和 fixtures。
  - [ ] `UpdatePlan` 描述 planned effects，不是 execution log；`changedPaths` / `skippedPaths` 只描述当前 command 的 actual apply result。
  - [ ] `writeAuthorized === false` 时，`changedPaths` 与 `skippedPaths` 必须为空，即使 plan 中存在 `update`、`create`、`skip` 或 `conflict` actions。
  - [ ] `data.conflicts.length > 0` 时，`CommandResult.status` 必须为 `failure`，exit code non-zero，`issues[]` 包含且仅包含一个 command-level `update.conflicts` issue，`details.conflictCount` 等于 path-level conflict 数量。
  - [ ] 不得把逐路径 conflicts 复制成多个 `issues[]` entries；path-level detail 只放入 `data.conflicts`。
  - [ ] `summary`、`issues`、`nextActions` 和 path fields 不得包含 timestamp、absolute path、home directory、temporary/cache path、random id 或环境相关文本。

- [ ] Task 6: 实现 human-readable Evidence profile 和 terminal fallback（AC: 5, 8-9）
  - [ ] 复用 `src/diagnostics/output.ts` 或既有 shared output layer；`src/commands/update.ts` 不得自行拼接 status text、JSON fields、path display、issue layout 或 next action order。
  - [ ] Evidence profile 至少展示 Summary、Update Plan / Planned Effects、Authorization、Changed Paths、Skipped Paths、Conflicts、Protected Boundaries、Next Actions。
  - [ ] Authorization 文案必须清楚区分 `requiresConfirmation`、`writeAuthorized`、interactive pending confirmation、script mode without `--yes` 和 explicit `--yes` authorized apply。
  - [ ] 对 `blocked-by-conflict`、`ready-to-apply`、`no-op`、`applied`、`partial-failure` 等状态，必须有文本状态，不只靠颜色、图标或表格位置。
  - [ ] Conflict 和 skipped 行必须展示 affected path、ownership、proposed action 或 skipped/conflict reason、suggested next step。
  - [ ] 窄终端可以把表格降级为 key-value block，但不得丢失 affected path、ownership、proposed action、reason、next action 或是否需要 `--yes`。
  - [ ] `NO_COLOR`、non-TTY、CI 和 Windows path portability 场景下 human-readable output 仍保持纯文本可读；`--json` 不输出 ANSI、icons 或 human-only decoration fields。
  - [ ] Human-readable output 不得成为 automation 依赖字段唯一承载位置；CI、fixtures 和 installed skills 需要的 state 必须在 `CommandResult.data`、`issues`、`nextActions` 或 file contract 中表达。

- [ ] Task 7: 保持 Story 4.3 与 Story 4.4-4.6 的边界（AC: 1-9）
  - [ ] 本 Story 可以建立 pre-write update plan、authorization state、unapplied plan output、public JSON projection、Evidence profile 和 focused tests。
  - [ ] 不在本 Story 中完成 project operation lock acquisition、safe write temp-write + rename、partial failure cleanup 或 stale lock cleanup；这些属于 Story 4.4。
  - [ ] 不在本 Story 中完成 full conflict detector / default non-overwrite matrix；本 Story 只使用已有 ownership/hash blockers 并为 Story 4.5 保留扩展点。
  - [ ] 不在本 Story 中实现 `update --repair` 的 full repair apply、`restore-canonical`、`regenerate` 或 `RepairPlan` 行为；这些属于 Story 4.6。
  - [ ] 不新增顶级 `speclite repair`、`speclite sync`、`doctor`、`uninstall`、backup/restore、standalone update report artifact、enterprise dashboard 或 Post-MVP migration commands。

- [ ] Task 8: 编写 focused tests 和 fixture assertions（AC: 1-9）
  - [ ] Unit tests 覆盖 update planning 输入顺序：installed state、source descriptor、files index、ownership、resolved config/customization 全部在 planning 前读取，并且未授权阶段不写文件。
  - [ ] Unit tests 覆盖 `UpdatePlan.actions[]`：planned change、unchanged skip、human-owned skip/protection、workflow-owned skip/protection、unknown ownership、missing source evidence、installer-owned drift conflict。
  - [ ] Unit tests 覆盖 authorization semantics：interactive pending、script mode without `--yes`、`--dry-run`、explicit `--yes`，并断言 pending/unapplied plan 不改写为 `skip:not-authorized`。
  - [ ] JSON reporter tests 覆盖 `UpdateCommandData` required fields、`writeAuthorized === false` 时 empty `changedPaths` / `skippedPaths`、single `update.conflicts` issue、stable ordering、project-relative POSIX paths 和 no timestamp policy。
  - [ ] Human-readable renderer tests 覆盖 Evidence profile、NO_COLOR、non-TTY、CI 和窄终端 fallback；断言文本中仍有 severity/issueId/affectedPath/ownership/reason/next action/`--yes` guidance。
  - [ ] Fixture `test/fixtures/existing-install-update/` 增加 update-plan-before-write case，断言 plan-before-write、unapplied plan、changed/skipped/conflict separation 和 human-owned/workflow-owned preservation。
  - [ ] Fixture `test/fixtures/ide-drift/` 若前置 drift detector 已存在，断言 normal update 对 IDE mirror drift 只产生 conflict，不执行 repair。
  - [ ] 所有 JSON assertions parse 后 semantic compare；不得比较 absolute path、home directory、timestamp、random id、stack trace、terminal color 或当前时间。
  - [ ] Tests 必须 local-only、deterministic，不访问 npm registry、private registry、Git remote、offline bundle origin、package-manager cache 或外部网络。

- [ ] Task 9: 本地验证与范围控制（AC: 1-9）
  - [ ] 运行 `npm run build`。
  - [ ] 运行 `npm test`，或至少运行 update planning、source descriptor gating、files index/hash、ownership protection、resolver consumption、CommandResult reporter、Evidence profile renderer 和 affected fixtures 的 focused Vitest tests。
  - [ ] 如果前置 implementation 尚未完成，保留失败为有效前置信号；不要伪造 fixture pass、不要绕过 shared resolver、不要创建 update-private JSON 或 merge implementation。
  - [ ] 检查 diff，确认没有修改 `_bmad-output/planning-artifacts/`、已有 Story 1-3 文件、Story 4.1/4.2、无关源码或用户改动。
  - [ ] 检查 diff，确认没有提前实现 Story 4.4 operation lock/safe write、Story 4.5 full conflict detector、Story 4.6 repair apply、Epic 5 source channel 扩展、Epic 6 release fixture matrix 或 Post-MVP governance commands。

## Dev Notes（开发备注）

### Current Repository State（当前仓库状态）

- 创建本 Story 时，仓库根目录未发现 root `package.json`、`package-lock.json`、`src/`、`test/`、`tests/`、root `fixtures/` implementation scaffold。`assets/source/speclite/` 下存在 source skill assets、module metadata、custom examples 和 legacy Python resolver scripts，但它们不是 MVP TypeScript CLI implementation。
- `_bmad-output/implementation-artifacts/1-1` 到 `1-6`、`2-1` 到 `2-5`、`3-1` 到 `3-6`、`4-1`、`4-2` 当前是 ready-for-dev story context，不是完成后的源码证据。实现 Story 4.3 前必须重新确认前置 stories 是否已经由其他 agent 添加 actual implementation。
- 当前 worktree 已有与本 Story 创建无关的 dirty planning artifacts、`sprint-status.yaml` 改动和未跟踪 Epic 1-4 story 文件。实现 Story 4.3 时不得格式化、重写、同步或回滚这些无关改动。
- `_bmad-output/project-context.md` 当前仍是初始化占位内容；实际 implementation guardrails 以 live PRD、Architecture、UX、ADR 和 owning SPEC artifacts 为准。
- 本 create-story run 复现了 skill activation runtime 行为：裸 `python3 _bmad/scripts/resolve_customization.py --skill .agents/skills/bmad-create-story --key workflow` 因 stdlib `tomllib` 缺失失败；`python3.12` 成功解析 workflow。

### Scope Boundary（范围边界）

- 本 Story 负责 `speclite update` 的 pre-write update plan、unapplied plan state、write authorization projection、planned vs actual result separation、human-readable Evidence profile、terminal fallback 和 focused tests。
- 本 Story 消费 Story 4.1 的 ownership/files index boundary 和 Story 4.2 的 resolved config/customization boundary；不得重新定义 ownership classifier、files index schema、config merge order 或 customization lookup key。
- 本 Story 不负责：
  - 完整 `speclite resolve` command 实现，除非前置 Story 2.4 尚未落地且当前实现顺序需要补齐 shared resolver anchors。
  - Story 4.4 的 project operation lock acquisition、safe write、partial failure handling 和 stale lock behavior。
  - Story 4.5 的完整 conflict detection / default non-overwrite behavior。
  - Story 4.6 的 explicit repair planning/apply、`restore-canonical`、`regenerate`、`RepairPlan` output 和 `update --repair` 全流程。
  - Epic 5 source channel 扩展、Epic 6 full release-gate matrix、Post-MVP `doctor` / `sync` / `uninstall` / top-level `repair` / backup-restore / standalone report artifact。

### Architecture Requirements（架构要求）

- Runtime baseline 保持 Node.js 22 minimum 和 Node.js 24 recommended。Node.js official releases 在 2026-05-26 显示 Node 22 与 Node 24 为 LTS、Node 26 为 Current；不要把 MVP baseline 提升到 Node 26，也不要使用 Node 24-only API，除非提供 Node 22-compatible path 并更新 runtime policy / fixtures。Source: https://nodejs.org/en/about/previous-releases
- CLI foundation 保持 TypeScript + commander。不要为本 Story 引入 oclif/yargs/cac/clipanion。
- Runtime schema validation 继续使用 architecture-pinned `zod@4.4.3` 与 executable schema/parser anchors。不要为 update plan 引入新的 schema/runtime validation library。
- Storage model 是 filesystem-first / local-first。不要引入 database、web service、daemon、REST API、GraphQL、desktop UI、persistent cache server 或 background process。
- `src/commands/update.ts` 只做 flag parsing、command mode normalization 和 orchestration；source trust 属于 `src/source/`，resolver 属于 `src/config/`，ownership/hash 属于 `src/update/` 与 `src/manifest/`，path normalization/safe write 属于 `src/fs/`，public projection/rendering 属于 `src/diagnostics/`。
- `update/` 只基于 ownership/hash 生成 Update Plan。普通 `update` 的交互确认或 `--yes` 只授权无 conflict 的 planned update writes，不得把 drift conflict 转成 repair。
- `fs/` 是唯一允许实现 Path Normalization 和 Safe Writes 的模块。本 Story 可以准备 apply boundary，但不得在 update command 中直接写文件或复制 safe-write logic。

### Implementation Anchors（实现锚点）

需要创建或扩展的 implementation anchors，实际命名应贴合已有实现：

- `src/commands/update.ts`：normal update orchestration、flag/mode normalization、confirmation state routing。
- `src/update/update-plan.ts`：UpdatePlan construction、planned effects、ownership/hash/source/resolver inputs 和 action ordering。
- `src/update/conflict-detector.ts`：如前置已存在，消费其 path-level blocker output；本 Story 不应完成 Story 4.5 full matrix。
- `src/update/ownership-model.ts`：由 Story 4.1 建立的 ownership truth，必须复用。
- `src/manifest/manifest-generator.ts` / `src/manifest/manifest-schema.ts` 或等价 files-index helper，以及 `src/manifest/hash.ts`：files index/raw-byte hash baseline，必须复用。
- `src/source/source-descriptor-schema.ts` 与 `src/source/` resolver：source descriptor、trust/evidence 和 blocked source gating。
- `src/config/config-reader.ts`、`src/config/customization-reader.ts`、`src/config/merge-rules.ts`、`src/config/resolve-output-schema.ts`：Story 4.2 shared resolver anchors，update planner 只能消费。
- `src/installer/install-plan-schema.ts`：internal planning/write authorization schema anchor，确保 dry-run、`--yes` 和 `writeAuthorized` 语义一致。
- `src/diagnostics/command-result-schema.ts`：`CommandResult`、`UpdateCommandData`、`UpdatePlan`、`UpdateConflict` producer/parser schema anchor。
- `src/diagnostics/command-result.ts`：status/exit-code derivation、single `update.conflicts` issue projection、nextActions ordering。
- `src/diagnostics/output.ts`：Compact/Evidence/Structured profiles、NO_COLOR/non-TTY/CI/narrow terminal fallback。
- `src/validation/issue-model.ts`：`ValidationIssue` construction helpers、taxonomy guards 和 redaction-safe details policy。
- `src/fs/path-normalizer.ts`：project-relative POSIX path normalization、absolute path rejection 和 project boundary checks。
- `test/fixtures/existing-install-update/`、`test/fixtures/ide-drift/`、`test/fixtures/resolve-parity/`：focused fixture assertions。

如果这些文件已经由前置 stories 创建，修改前必须完整读取并保留既有 behavior。如果这些文件尚不存在，按前置 story implementation 顺序补齐，不要绕过 owning SPECs 创建私有实现。

### Update Planning Data Model（更新计划数据模型）

- Planning inputs 必须来自 installed project state，而不是 source docs 快照：
  - installed manifest/index/source descriptor
  - files index file-level hash baseline
  - ownership projection
  - resolved config/customization
  - selected/available canonical source descriptor and integrity evidence
- `UpdatePlan` public projection：
  - `actions[].affectedPath`：project-relative POSIX path。
  - `actions[].ownership`：`installer-owned`、`human-owned` 或 `workflow-owned`。
  - `actions[].action`：`create`、`update`、`skip` 或 `conflict`。
  - `actions[].currentHash` / `expectedHash`：仅在需要 hash comparison 或审计的 path 上出现。
  - `actions[].reason`：仅 `skip` required，producer 只能输出 owning SPEC registry 中 stable lower-kebab reason code。
- `UpdateConflict` public projection：
  - `affectedPath`、`ownership`、optional `currentHash`、optional `expectedHash`、`reason`。
  - Conflicts 是 planning diagnostics，不是 apply execution result，不依赖 write authorization。
- Reason code registry 当前 MVP 包括：`unchanged`、`installer-owned-drift`、`human-owned`、`workflow-owned`、`unknown-ownership`、`missing-source-evidence`、`unsupported-repair`、`not-authorized`。
- `not-authorized` 只能表示 path-level authorization policy 阻止 specific path 进入 executable plan；不得表示 normal dry-run、pending confirmation 或没有 `--yes` 的 script mode。

### Write Authorization Semantics（写入授权语义）

- `requiresConfirmation` 与 `writeAuthorized` 是 command-level write authorization，不是 source trust、conflict repair 或 path safety 的替代字段。
- `--dry-run`：生成真实 plan、不写入、`writeAuthorized: false`、保留 planned actions、`changedPaths: []`、`skippedPaths: []`。
- Interactive pending confirmation：同 dry-run 的 unapplied plan shape；不得把 planned update 改写为 `skip:not-authorized`。
- Script mode without `--yes`：保持 unapplied plan；不写 installer-owned 文件；仍输出可供 automation 判断的 update plan 和 conflicts。
- Explicit `--yes`：只授权无 conflict 的 planned update writes；不能授权 drift repair、human-owned TOML mutation、workflow artifact overwrite、unverified/blocked source acceptance 或 unsafe path write。
- `changedPaths` 只记录当前命令实际完成的 mutations；未尝试、未授权或未完成的 planned writes 保留在 `UpdatePlan.actions[]`。
- `skippedPaths` 是 actual apply result，不是 planned skip list。Unapplied plan 中应为空；planned skips 从 `UpdatePlan.actions[]` 读取。

### Human-Readable Output Requirements（人类可读输出要求）

- Evidence profile 用于默认 `speclite update` human-readable output，必须帮助用户在授权前理解：
  - planned effects
  - write authorization status
  - changed paths
  - skipped paths
  - conflicts
  - protected boundaries
  - next actions
- Ordinary update 与 explicit repair 必须清晰区分；本 Story 的 normal update output 不得暗示普通 confirmation 会 repair drift。
- Conflict 与 skipped 行必须有文本 reason 或 stable code，不得只靠颜色、图标、表格位置或紧凑符号表达。
- Empty state 必须明确，例如 `No conflicts detected`、`No paths changed yet`、`No writes authorized`。
- Path display 应帮助用户理解 `_speclite` metadata/control hub、IDE execution plane、`_speclite-output` artifact repository 和 project knowledge 的空间角色。
- Terminal renderer 必须支持 `NO_COLOR`、non-TTY、CI、窄终端和 Windows path portability。窄终端可以降级为 key-value block，但不得丢失 automation-relevant state。

### JSON And Diagnostics Requirements（JSON 与诊断要求）

- `speclite update --json` 必须输出 `CommandResult<UpdateCommandData>`；`speclite resolve` 仍是 explicit exception，不包裹 `CommandResult`。
- `data.conflicts.length > 0` 时，`CommandResult.status` 为 `failure`，exit code non-zero，并且 `issues[]` 中只生成一个 command-level `update.conflicts` issue。
- `operation-lock.project-locked` 不属于 `data.conflicts`；它是 command-level blocker。若 lock 前失败，public JSON 不得包含 plan payload。
- Public path fields 必须是 project-relative POSIX path；不得出现 absolute local path、home directory、OS-specific separator、cache/temp path 或 credential-bearing source locator。
- Public JSON 默认不得包含 timestamps。`summary`、`issues[].details`、`nextActions`、`updatePlan.actions[]`、`conflicts`、`changedPaths`、`skippedPaths` 都不得依赖当前时间。
- JSON reporter、fixture assertions 和 contract tests 必须复用 `src/diagnostics/command-result-schema.ts`；不得 hand-roll field checks。

### Previous Story Intelligence（前序 Story 情报）

- Story 4.1 明确 `_speclite/custom/*.toml` 与 `_speclite/custom/*.user.toml` 默认是 `human-owned`，install/update/repair 不得覆盖、重写、重排、格式化、normalize 或删除。Update plan 可以读取它们支持 resolver 行为，但不能把它们加入 overwrite plan。
- Story 4.1 明确 `_speclite-output/**` 和 configured workflow artifact root 是 `workflow-owned`，update/repair 不得将其纳入 overwrite、restore-canonical、regenerate 或 changed paths。
- Story 4.1 明确 `data.conflicts.length > 0` 时只生成一个 command-level `update.conflicts` issue，path-level conflicts 留在 `data.conflicts`。
- Story 4.2 明确 update/repair 在 planning 前必须使用 shared config/customization resolver，并且 update/repair 不得实现第二套私有 merge logic。
- Story 4.2 明确 resolver warning 必须进入 covered command reporter 的 semantic source，不得只存在于 human-readable prose。
- Story 4.2 明确 `changedPaths` / `skippedPaths` 只表示 actual apply result；`writeAuthorized === false` 时必须为空。Resolved config/customization 只影响 planning，不得直接触发 writes。
- Story 2.4 明确 `speclite resolve config` / `speclite resolve customization` 是 runtime support command；stdout 不包裹 `CommandResult`，stderr 使用 `ValidationIssue` JSON Lines。
- Story 3.5 明确 human-readable output 与 `--json` output 共享同一 semantic source，command modules 不得自行拼接 public JSON、status text、issue layout 或 next action order。

### Contract Requirements（契约要求）

- `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md` 拥有 `CommandResult` public JSON shape、`UpdateCommandData`、`UpdatePlan`、`UpdateConflict`、reason code registry、ordering、path policy、timestamp policy、`changedPaths` / `skippedPaths` actual apply semantics 和 `resolve` exception。
- `_bmad-output/planning-artifacts/specs/02-source-descriptor-contract.md` 拥有 `SourceDescriptor` trust/evidence、source type rules、write eligibility、source staging/cache redaction 和 validate no-network boundary。
- `_bmad-output/planning-artifacts/specs/03-install-plan-contract.md` 拥有 pre-write planning、external access、`--dry-run`、`--yes`、`writeAuthorized`、operation lock、safe write、rollback boundary、repair source policy 和 human-owned TOML stub rules。
- `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md` 拥有 manifest/index/files index fields、ownership projection、raw-byte hash、volatile file exclusion 和 deterministic fixture rules。
- `_bmad-output/planning-artifacts/specs/06-resolve-command-contract.md` 拥有 config/customization resolver stdout/stderr、merge order、fallback、layer failure、array merge 和 parity fixture requirements。
- `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md` 拥有 issue categories、reserved issue ids 和 severity guidance，尤其是 `update.conflicts`、`operation-lock.project-locked`、`file-integrity.*`。
- `_bmad-output/planning-artifacts/specs/08-fixture-contract.md` 拥有 fixture layout、expected output classes、semantic JSON comparison、stderr JSON Lines comparison、release gate ownership 和 preservation assertions。
- ADR 只能解释决策背景，不重新定义 field-level schema、issue taxonomy、fixture layout、command payload 或 implementation anchor。若 ADR 与 owning SPEC 冲突，以 owning SPEC 为准。

### Testing Requirements（测试要求）

- 使用 Vitest。
- Tests 必须 deterministic、local-only，不访问 npm registry、Git remote、private registry、offline bundle origin、package-manager cache 或外部网络。
- 使用 temporary directories 构造 installed-state cases；不要依赖当前 repo 的 `_bmad` 或 `_bmad-output` 作为 target project installed state。
- Cross-platform tests 使用 `node:path` 的 `posix` / `win32` test data 和 shared path normalization helper，不要让 host OS filesystem behavior 成为唯一断言依据。
- JSON tests parse output 并断言 semantic fields。不要比较 raw pretty-printed JSON bytes，除非 formatting 本身是测试对象。
- Human-readable output snapshots 必须覆盖 no-color / CI / non-TTY / narrow terminal fallback，并 normalize terminal width 或以稳定 fixture width 执行。
- Fixture snapshots 必须 normalize 或 exclude owning SPEC 标记为 non-stable 的 timestamp、operation-lock volatile fields、temporary paths、projectRootHash、duration 或 environment-specific paths。
- Human-owned TOML 与 workflow-owned artifact preservation 必须通过 content/order/comment unchanged checks 断言；installer-owned 文件使用 hash comparison。

### Git Intelligence Summary（Git 历史摘要）

- 最近 5 个 commit 均为 docs/context/source/spec cleanup 类变更：`style(docs): 清理参考文档尾随空白`、`docs(context): 初始化项目上下文文档`、`docs(source): 同步内置源资产路径说明`、`docs(glossary): 整理术语目录与文档索引`、`docs(specs): 收敛 MVP 契约与实现锚点`。
- 当前可引用的实现模式主要来自 live planning artifacts、owning SPECs、ADR、legacy Python parity scripts 和 previous story contexts，而不是已提交 TypeScript implementation。dev agent 不得从这些 docs commits 推断源码已经存在。

### Latest Technical Information（最新技术信息）

- No new third-party dependency is required for this Story。Use project-pinned libraries from Architecture and previous stories；不要为了 update plan 引入新的 CLI framework、schema library、TOML parser、table renderer 或 terminal UI framework。
- Use Node.js 22-compatible `node:fs/promises`、`node:path` and stable ECMAScript APIs。不要使用 Node 24-only behavior，除非提供 Node 22-compatible path 并同步 runtime policy / fixtures。
- External web check was limited to Node.js official release status。Update plan semantics are governed by project-owned live PRD、Architecture、UX、ADR and owning SPEC contracts；no dependency upgrade is part of this Story。

### Project Context Reference（项目上下文引用）

- `_bmad-output/project-context.md` currently contains initialized metadata and placeholder sections only; it does not add implementation rules beyond live PRD, Architecture, UX, ADR and owning SPEC artifacts.
- The project-level language rule remains: conversation and generated docs in Chinese, section headings in `English（中文）` form, technical identifiers in English.

### References（参考）

- `_bmad-output/planning-artifacts/epics/07-epic-4-safe-update-and-repair安全更新与修复.md`
- `_bmad-output/implementation-artifacts/4-2-config-and-customization-merge-order-for-updates.md`
- `_bmad-output/implementation-artifacts/4-1-ownership-model-and-protected-file-boundaries.md`
- `_bmad-output/planning-artifacts/prd/10-functional-requirements功能需求.md`
- `_bmad-output/planning-artifacts/architecture/03-core-architectural-decisions核心架构决策.md`
- `_bmad-output/planning-artifacts/architecture/04-implementation-patterns-consistency-rules实现模式与一致性规则.md`
- `_bmad-output/planning-artifacts/architecture/05-project-structure-boundaries项目结构与边界.md`
- `_bmad-output/planning-artifacts/ux-design-specification.md`
- `_bmad-output/planning-artifacts/specs/README.md`
- `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md`
- `_bmad-output/planning-artifacts/specs/02-source-descriptor-contract.md`
- `_bmad-output/planning-artifacts/specs/03-install-plan-contract.md`
- `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md`
- `_bmad-output/planning-artifacts/specs/06-resolve-command-contract.md`
- `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md`
- `_bmad-output/planning-artifacts/specs/08-fixture-contract.md`
- Node.js official releases: https://nodejs.org/en/about/previous-releases

## Dev Agent Record（开发代理记录）

### Agent Model Used（使用模型）

TBD by dev-story agent.

### Debug Log References（调试日志引用）

TBD by dev-story agent.

### Completion Notes List（完成备注）

- Story context created by bmad-create-story sub-agent #3.
- Ultimate context engine analysis completed - comprehensive developer guide created.

### File List（文件列表）

- TBD by dev-story agent.
