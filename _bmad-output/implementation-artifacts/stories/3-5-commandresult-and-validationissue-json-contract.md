# Story 3.5: CommandResult And ValidationIssue JSON Contract（CommandResult 与 ValidationIssue JSON 契约）

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story（故事）

作为工具链维护者，
我希望核心命令的人类可读输出、`--json` 输出、exit code 和 fixture assertions 使用同一套 `CommandResult` 与 `ValidationIssue` 语义，
以便自动化、CI 和人工排查看到一致、稳定、可测试的结果。

## Acceptance Criteria（验收标准）

1. **Covered commands use one CommandResult envelope（覆盖命令使用统一 CommandResult Envelope）**
   **前提** 用户运行 MVP user-facing core commands 并传入 `--json`；
   **当** `speclite install --json`、`speclite status --json`、`speclite validate --json`、`speclite update --json` 或 `speclite update --repair --json` 生成机器可读输出；
   **则** 输出必须使用统一 `CommandResult<TData>` envelope；
   **并且** `schemaVersion` 必须为 `speclite.command-result.v1`；
   **并且** top-level fields 只能包含 owning SPEC 声明的 `schemaVersion`、`status`、`command`、`targetProject`、`summary`、`issues`、`nextActions` 和 `data`；
   **并且** `issues` 必须复用同一个 `ValidationIssue` model，不得为每个 command 定义第二套 issue shape。

2. **Command status and exit code are derived from completion and severity（命令状态与退出码由完成状态和严重级别推导）**
   **前提** command 完成后生成 `CommandResult`；
   **当** 存在任一 `error` 或 `critical` issue，或 command 无法完成；
   **则** `CommandResult.status` 必须为 `failure`，exit code 必须为 non-zero；
   **并且** 当只存在 `warning` issue 且 command 完成时，`CommandResult.status` 必须为 `warning`，exit code 必须为 0；
   **并且** 当不存在 `warning` / `error` / `critical` issue 且 command 完成时，`CommandResult.status` 必须为 `success`，exit code 必须为 0。

3. **Update conflicts are represented once as command-level blockers（Update Conflicts 只作为命令级阻塞问题呈现一次）**
   **前提** `speclite update --json` 或 `speclite update --repair --json` 生成 planning result；
   **当** `data.conflicts.length > 0`；
   **则** `CommandResult.status` 必须为 `failure`，exit code 必须为 non-zero；
   **并且** `issues` 中必须包含且仅包含一个 command-level blocking issue：`issueId: "update.conflicts"`、`category: "update"`、`severity: "error"`；
   **并且** 每个 path-level conflict 的 details 必须保留在 `data.conflicts`，不得复制成多个 `issues[]` entry；
   **并且** `operation-lock.project-locked` 仍是 command-level blocker，不得放入 `data.conflicts`。

4. **Status health remains independent from CommandResult status（Status Health 独立于 CommandResult Status）**
   **前提** `speclite status --json` 成功读取或判断 installed-state lightweight summary；
   **当** `data.highLevelHealth` 为 `not-configured`、`partial` 或 `failed`；
   **则** 不得自动把 `CommandResult.status` 推导为 `warning` 或 `failure`；
   **并且** 不得自动生成 warning issue；
   **并且** status health 只能由 `status.data.highLevelHealth` 表达，详细 diagnostics 仍属于显式 `speclite validate`。

5. **Human-readable and JSON outputs share one semantic source（人类可读与 JSON 输出共享同一语义来源）**
   **前提** 同一 semantic command result 需要渲染为 default human-readable output 和 `--json` output；
   **当** reporter 输出 Compact、Evidence 或 Structured profile；
   **则** issue id、category、severity、affected path、command status、exit code、next actions、path normalization 和 sorting 必须来自同一 `CommandResult` / domain projection；
   **并且** human-readable output 不得成为 automation-relevant value 的唯一承载位置；
   **并且** command implementation 不得绕过 `src/diagnostics/output.ts` 或 reporter layer 自行拼接状态词、issue layout、path display、summary template 或 next action order。

6. **Command id and target project are stable display identifiers（Command ID 与 Target Project 是稳定显示标识）**
   **前提** JSON reporter 写入 `CommandResult.command` 和 `CommandResult.targetProject`；
   **当** 用户使用不同 shell、参数顺序、flags 或 command alias；
   **则** command id 仍必须稳定为 `install`、`status`、`validate`、`update` 或 `update.repair`；
   **并且** `update --repair` 的 command id 必须为 `update.repair`，不得输出 raw argv、alias、flag string 或 `repair`；
   **并且** `targetProject` 必须使用 trim 后非空的 project config name，缺失时 fallback 到 target project directory basename；
   **并且** 不得通过 slugify、字符集限制、长度截断、absolute path 或 checkout-root-dependent path 改写该显示标识。

7. **ValidationIssue details and prose are deterministic and redaction-safe（ValidationIssue 详情与文案确定且可脱敏）**
   **前提** command 或 validation rule 生成 `ValidationIssue`；
   **当** 写入 `details`、`impact` 或 `suggestedNextStep`；
   **则** 字段必须 stable、JSON-serializable、fixture-comparable，并且不包含 absolute path、home directory、environment variable value、credential、token、stack trace、raw exception、timestamp、random id、temporary path、cache path、hash value 或长段非确定性解释；
   **并且** dynamic context 必须放入 `affectedPath`、`component` 或 stable enum/details fields；
   **并且** `impact` 与 `suggestedNextStep` 必须使用稳定短句模板，不拼接 path、target id、source name、hash、timestamp 或本机环境文本。

8. **Structured JSON is presentation-free and fixture-stable（Structured JSON 无展示装饰且适合 Fixture 比较）**
   **前提** 用户请求 `--json`；
   **当** Structured renderer 输出 `CommandResult`；
   **则** JSON 不得包含 ANSI escape、terminal width formatting、颜色标记、图标、spinner text、table drawing、human-only decoration fields 或 locale-dependent layout；
   **并且** public JSON timestamps 默认禁止，只有 owning SPEC 明确声明的 manifest / generated metadata timestamps 可以存在，并必须从 stable fixture snapshot comparison 中 normalize 或 exclude；
   **并且** fixture expected outputs 必须 parse JSON 并比较 semantic fields，而不是依赖 raw byte-for-byte 文本。

9. **Public arrays and paths follow owning SPEC ordering and path policy（公共数组与路径遵守契约排序和路径策略）**
   **前提** command result 包含 `issues`、`nextActions`、`checkedCategories`、`checkedTargets`、`ideTargets`、`validatedPaths`、`changedPaths`、`skippedPaths`、`conflicts`、`completedSteps`、`pendingSteps`、`installedModules` 或 plan actions；
   **当** reporter 生成 public JSON 或 human-readable evidence rows；
   **则** arrays 必须遵守 `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md` 声明的 ordering rules；
   **并且** 所有 public path fields 必须是 project-relative POSIX path，`data.paths.projectRoot` 必须为 `"."`；
   **并且** output 不得依赖 filesystem traversal、glob order、object insertion order、validation rule registration order、adapter completion order、async completion order 或平台返回顺序。

## Tasks / Subtasks（任务 / 子任务）

- [ ] Task 1: 验证前置实现与当前仓库状态（AC: 1-9）
  - [ ] 确认 Epic 1 / Epic 2 / Story 3.1 / Story 3.2 / Story 3.3 / Story 3.4 的实际代码已经建立 TypeScript CLI scaffold、core command orchestration、manifest/index parser、IDE adapter registry、validation aggregation、path normalization、diagnostics/output、`src/fixtures/fixture-contract.ts` 和 fixture assets/tests；不能只依据 story context 的 `ready-for-dev` 状态判断完成。
  - [ ] 如果 `package.json`、`src/`、`test/`、`tests/`、`src/bin/speclite.ts`、`src/commands/install.ts`、`src/commands/status.ts`、`src/commands/validate.ts`、`src/commands/update.ts`、`src/diagnostics/command-result-schema.ts`、`src/diagnostics/command-result.ts`、`src/diagnostics/output.ts` 或 `src/fs/path-normalizer.ts` 尚不存在，先完成前置 stories；不得在 Story 3.5 中创建孤立的 diagnostics-only scaffold。
  - [ ] 修改前完整读取所有 UPDATE files，尤其是 `src/diagnostics/command-result-schema.ts`、`src/diagnostics/command-result.ts`、`src/diagnostics/output.ts`、`src/validation/issue-model.ts` 或等价 issue model、`src/validation/validate-project.ts`、`src/commands/*.ts`、`src/manifest/manifest-schema.ts`、`src/source/source-descriptor-schema.ts`、`src/installer/install-plan-schema.ts`、`src/ide/adapter-registry.ts` 和 `src/fs/path-normalizer.ts`。
  - [ ] 检查 worktree dirty 状态，保留与本 Story 无关的 planning artifacts、已有 story 文件、sprint status 或用户改动；不得格式化、重写、同步或回滚无关文件。

- [ ] Task 2: 建立或收口 `CommandResult` executable schema anchor（AC: 1, 6, 8, 9）
  - [ ] 在 `src/diagnostics/command-result-schema.ts` 或既有 diagnostics schema anchor 中集中定义 `CommandResult`、`ValidationIssue`、command id enum、status enum、command-specific `data` payload 和 public projection types。
  - [ ] 固定 schema version `speclite.command-result.v1`，并在 producer mode 禁止输出 owning SPEC 未声明的 top-level public fields。
  - [ ] Command-specific data 必须覆盖 `InstallCommandData`、`StatusCommandData`、`ValidateCommandData`、`UpdateCommandData` 和 `RepairCommandData`；不要把 per-command private domain fields 泄露到 public JSON。
  - [ ] `speclite resolve` 不使用 `CommandResult`，但其 stderr diagnostics 必须复用 `ValidationIssue` shape；不要把 resolve stdout 改成 envelope。
  - [ ] Schema module 只能是 executable anchor，不是第二份 contract source；若 implementation 需要改变 public JSON behavior，必须先更新 owning SPEC，再同步 schema、reporter 和 fixtures。

- [ ] Task 3: 实现统一 `ValidationIssue` model 与 taxonomy guardrails（AC: 1, 5, 7, 9）
  - [ ] 将 `ValidationIssue` shape 统一为 `issueId`、`category`、`severity`、optional `affectedPath`、optional `component`、optional `details`、`impact`、`suggestedNextStep`。
  - [ ] Producer 必须使用 taxonomy 中的 category 与 reserved issue id；不得在 rule 内拼接自由文本 issue id，也不得把 path、target id、source name、hash、count 或 timestamp 拼进 issue id。
  - [ ] Validation rule 可以新增 existing category 下的 issue id，但必须在同一变更中更新 `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md` 和 fixtures；若本 Story 没有授权修改 SPEC，则不得新增。
  - [ ] 建立 redaction-safe issue details helper 或 validation guard，拒绝 absolute path、home directory、credential-bearing URL、environment variable value、stack trace、raw exception、timestamp、random id、temporary/cache path 和 hash value 进入 `details`。
  - [ ] `impact` 和 `suggestedNextStep` 必须使用 stable short templates；human-readable renderer 可以在 JSON contract 外补充解释，但不得改变 automation fields。

- [ ] Task 4: 实现 command status、exit code 和 special blockers projection（AC: 2, 3, 4）
  - [ ] 在 `src/diagnostics/command-result.ts` 或等价 module 中实现单一 status derivation function：command incomplete 或任一 error/critical issue => `failure`；仅 warning issue => `warning`；无 warning/error/critical issue => `success`。
  - [ ] 将 exit code projection 与 `CommandResult.status` 绑定：`failure` => non-zero，`success` / `warning` => 0；禁止 command handler 单独重写 exit code。
  - [ ] 对 `update` / `update.repair` 实现 conflict blocker rule：`data.conflicts.length > 0` 必须产生 `failure`，并只投影一个 `update.conflicts` command-level issue。
  - [ ] 对 write-capable commands 的 `operation-lock.project-locked` 保持 command-level blocker；在获取 lock 前失败时不得输出看似完整的 update/repair plan payload。
  - [ ] 保持 Story 3.1 的 status health 分工：`highLevelHealth` 不影响 `CommandResult.status`，`status` 的 partial/failed health 不自动生成 warning issue。

- [ ] Task 5: 统一 command id、target project、path 与 ordering helpers（AC: 6, 8, 9）
  - [ ] 建立 command id normalization helper，输出仅限 `install`、`status`、`validate`、`update`、`update.repair`；不得从 raw argv、alias、flag order 或 shell string 生成 public command id。
  - [ ] 建立 `targetProject` display identifier helper：优先使用 trim 后非空 project config name；否则使用 target project directory basename；不得 slugify、truncate、转义为 path 或按 checkout root 改写。
  - [ ] 所有 public path fields 必须通过 `src/fs/path-normalizer.ts` 或等价 shared helper 生成 project-relative POSIX path；`data.paths.projectRoot` 固定为 `"."`。
  - [ ] 实现 shared sorting helpers：severity order、canonical issue category order、adapter target order、normalized path lexicographic order、command-specific next action priority order 和 plan action ordering。
  - [ ] Tests 必须断言 arrays 不依赖 object key insertion、filesystem traversal、glob order、rule registration order 或 async completion order。

- [ ] Task 6: 接入 covered command reporters and presentation profiles（AC: 1, 5, 8）
  - [ ] `src/commands/install.ts`、`src/commands/status.ts`、`src/commands/validate.ts` 和 `src/commands/update.ts` 只做 orchestration，并返回 domain result 或 `CommandResult` input；不要在 command modules 内直接拼接 JSON。
  - [ ] `src/diagnostics/output.ts` 拥有 Compact、Evidence 和 Structured profile；default human-readable output 与 `--json` 必须共享同一 semantic model。
  - [ ] `status` default human-readable 使用 Compact profile；`install`、`validate`、`update` default human-readable 使用 Evidence profile；`--json` 始终使用 Structured profile。
  - [ ] Structured renderer 输出 raw JSON object / string，不得包含 ANSI escape、颜色、图标、table layout、terminal width formatting 或 human-only decoration fields。
  - [ ] Human-readable output 必须保留 severity、category、issue id、affected path 或 component、impact、suggested next step、next actions 和 required path/target evidence；颜色和符号只能作为可选增强。

- [ ] Task 7: 收口 command-specific data payload contracts（AC: 1, 4, 8, 9）
  - [ ] `InstallCommandData` 必须只输出 owning SPEC 声明的 `sourceDescriptor`、`manifestVersion`、`installedModules`、`ideTargets`、`paths`、`completedSteps`、`pendingSteps` 等字段；不得新增未契约化 `readySummary` blob 或 timing fields。
  - [ ] `StatusCommandData` 必须包含 `manifestPresent`、`installedModules`、`ideTargets`、`highLevelHealth`、`paths`，可选 `sourceDescriptor`、`manifestVersion`；不得包含 `issueCounts`、`checkedCategories`、`checkedTargets`、`validatedPaths` 或 hash scan data。
  - [ ] `ValidateCommandData` 必须包含 `issueCounts`、`checkedCategories`、`checkedTargets`、`validatedPaths`；`issueCounts` 固定包含 `info`、`warning`、`error`、`critical` 四个 key。
  - [ ] `UpdateCommandData` 必须区分 `updatePlan`、`changedPaths`、`skippedPaths`、`conflicts`、`requiresConfirmation`、`writeAuthorized`；`changedPaths` / `skippedPaths` 只表示 actual apply result，`writeAuthorized === false` 时必须为空。
  - [ ] `RepairCommandData` 必须区分 `repairPlan`、`changedPaths`、`skippedPaths`、`conflicts`、`requiresConfirmation`、`writeAuthorized`；repair actions 只能面向 installer-owned paths。
  - [ ] Producer mode 只能输出 owning SPEC reason code registry 中的 reason codes；consumer/parser mode 必须容忍 unknown future reason codes，并保留其 stable display string。

- [ ] Task 8: 编写 contract tests、focused unit tests 和 fixture assertions（AC: 1-9）
  - [ ] Schema tests 覆盖 valid / invalid `CommandResult` envelope、top-level field allowlist、schemaVersion、command id enum、status enum、command-specific data payload required fields 和 producer-only unknown field rejection。
  - [ ] Status derivation tests 覆盖 success、warning、failure、error/critical issue、command incomplete、warning exit 0、failure non-zero、`status.data.highLevelHealth` 与 command status 独立。
  - [ ] Update conflict tests 覆盖 `data.conflicts.length > 0` 产生 single `update.conflicts` issue、non-zero exit code、per-path conflict details 不复制到 `issues[]`、dry-run 或 `writeAuthorized === false` 仍暴露 conflicts。
  - [ ] Command id tests 覆盖 alias、flag order、`--json`、`--yes`、`--project-root` 不影响 command id；`update --repair` 输出 `update.repair`。
  - [ ] Target project tests 覆盖 project config name、空白 config name fallback、checkout root 改变、非 ASCII 项目名和不 slugify。
  - [ ] ValidationIssue redaction tests 覆盖 details / impact / suggestedNextStep 不含 absolute path、home directory、Windows drive letter、environment variable value、credential、stack trace、timestamp、hash、temporary/cache path 或 random id。
  - [ ] Ordering tests 覆盖 issues severity/category/path/id order、nextActions priority order、checkedCategories canonical order、checkedTargets adapter order、validatedPaths lexicographic order、plan/conflict/changed/skipped paths stable order。
  - [ ] Renderer tests 覆盖 Compact / Evidence / Structured profile 共享同一 semantic model，`--json` 无 ANSI / icon / terminal width formatting，human-readable 不是 automation-only carrier。
  - [ ] Resolve exception tests 覆盖 `speclite resolve` stdout 不包裹 `CommandResult`，stderr JSON Lines diagnostics 使用 `ValidationIssue` shape，warning diagnostics 不导致 resolve failure。
  - [ ] Fixture tests 覆盖至少 install/status/validate/update/update.repair 的 representative success、warning 和 failure JSON snapshots，并用 parsed semantic comparison 而不是 raw text comparison。

- [ ] Task 9: 本地验证与范围控制（AC: 1-9）
  - [ ] 运行 `npm run build`。
  - [ ] 运行 `npm test`，或至少运行 diagnostics schema、CommandResult projection、renderer、status/validate/update command projection、path normalization 和 fixture comparison focused tests。
  - [ ] 如果前置 implementation 尚未完成，保留失败为有效前置信号；不要伪造 fixture pass 或创建 diagnostics-only fallback implementation。
  - [ ] 检查 diff，确认没有修改 `_bmad-output/planning-artifacts/`、其他 story 文件或无关用户改动。
  - [ ] 检查 diff，确认没有实现 Story 3.6 的完整 validate progress/category coverage UX、Epic 4 update/repair apply behavior、Epic 5 source integrity expansion、Epic 6 release fixture matrix、Post-MVP `doctor` / `sync` / `uninstall` / top-level `repair`、command pointer artifacts 或 dedicated Copilot/Cursor target ids。

## Dev Notes（开发备注）

### Current Repository State（当前仓库状态）

- 创建本 Story 时，仓库根目录未发现 root `package.json`、`src/`、`test/`、`tests/` 或 root `fixtures/` implementation scaffold。`assets/source/speclite/` 下存在 source skill assets 和少量 skill-local tests，但它们不是 MVP TypeScript CLI implementation。
- `_bmad-output/implementation-artifacts/1-1` 到 `1-6`、`2-1` 到 `2-5`、`3-1` 到 `3-4` 当前是 `ready-for-dev` story context，不是完成后的代码证据。
- 当前 worktree 已存在与本 Story 创建无关的 dirty planning artifacts、`sprint-status.yaml` 改动和未跟踪 Epic 1 / Epic 2 / Epic 3 story 文件。实现 Story 3.5 时不得格式化、重写、同步或回滚这些无关改动。
- `_bmad-output/project-context.md` 当前仍是初始化占位内容；实际 implementation guardrails 以 live PRD、Architecture、UX、ADR 和 owning SPEC artifacts 为准。
- `assets/source/speclite/` 已存在，并包含 bundled source assets、module metadata、module help catalog、custom stubs、legacy Python resolver scripts 和 canonical skill packages。Story 3.5 不得把 source checkout 当成 installed state。

### Previous Story Intelligence（前序 Story 延续约束）

- Story 3.1 明确 `status` 是 lightweight installed-state summary：`highLevelHealth` 独立于 `CommandResult.status`，`status.data` 不输出 `issueCounts`、`checkedCategories`、`checkedTargets` 或 `validatedPaths`。
- Story 3.2 已把 manifest、skill index、help index、files index 和 phase coverage 的 schema/shape validation 放入 `manifest-schema` boundary。Story 3.5 不应重复实现 manifest parser，而应复用 `src/manifest/manifest-schema.ts` 的 projection。
- Story 3.3 已把 IDE mirror drift 与 files index raw-byte integrity 分为 `ide-mirror` 和 `file-integrity` categories。Story 3.5 只统一 issue model、sorting、redaction、status projection 和 renderer，不重新定义 drift rules。
- Story 3.4 已把 runtime path、menu target、legacy namespace 和 artifact path validation 放在各自 categories。Story 3.5 不得抢做这些 rules 的领域逻辑，只保证这些 rules 产出的 issues 进入统一 `CommandResult`。
- Story 3.6 仍负责完整 validation progress、category coverage、local determinism 和输出覆盖。Story 3.5 可以建立 shared sorting/schema/rendering primitives，但不要把 3.6 的全部 validate progress matrix 和 category coverage fixtures 提前塞入本 Story。

### Git Intelligence Summary（Git 历史摘要）

- 最近 5 个 commit 均为 docs/context/source/spec cleanup 类变更：`style(docs): 清理参考文档尾随空白`、`docs(context): 初始化项目上下文文档`、`docs(source): 同步内置源资产路径说明`、`docs(glossary): 整理术语目录与文档索引`、`docs(specs): 收敛 MVP 契约与实现锚点`。
- 当前可引用的实现模式主要来自 live planning artifacts 和 owning SPECs，而不是已提交 TypeScript implementation；dev agent 不得从这些 docs commit 推断源码已经存在。
- Story 3.5 实现前必须重新检查 git history 和 worktree，确认前置 stories 是否已经由其他 agent 添加了 actual implementation。

### Scope Boundary（范围边界）

- 本 Story 只负责 covered user-facing commands 的 unified `CommandResult` envelope、`ValidationIssue` model projection、status/exit-code derivation、command id normalization、targetProject display id、path/sorting helpers、renderer profile parity、redaction guardrails 和 focused contract fixtures/tests。
- 本 Story 不负责：
  - Epic 1 的 CLI scaffold、fresh install source discovery、module selection、manifest/index generation、IDE mirror writes 或 ready summary domain logic。
  - Epic 2 的 methodology discovery metadata、skill entry mapping、phase coverage generation、activation target validation、`speclite resolve` resolver implementation 或 artifact metadata validation。
  - Story 3.1 的 lightweight status aggregation domain reads。
  - Story 3.2 的 manifest/index schema validation rules。
  - Story 3.3 的 IDE mirror package hash comparison 或 files index current hash scan。
  - Story 3.4 的 runtime/menu/legacy/artifact path validation rules。
  - Story 3.6 的 complete validation progress, category coverage, repeated-run local determinism matrix and human-readable progress coverage.
  - Epic 4 update/repair write planning, safe write, operation lock acquisition, conflict detection implementation or repair apply behavior.
  - Epic 5 remote source freshness/provenance revalidation, source lockfile lifecycle or enterprise source policy.
  - Epic 6 full release gate fixture matrix beyond focused CommandResult contract fixtures.
  - Post-MVP `doctor`、`sync`、`uninstall`、top-level `repair`、migration tooling、governance dashboard、coverage percentage、trend report、command pointer artifacts or dedicated Copilot/Cursor adapters.

### Architecture Requirements（架构要求）

- Runtime baseline 保持 Node.js 22 minimum 和 Node.js 24 recommended。除非已有 Node 22-compatible path 并同步更新 runtime policy / fixtures，否则不得使用 Node 24-only API。
- CLI foundation 保持 TypeScript + commander。不要为本 Story 引入 oclif/yargs/cac/clipanion。
- Storage model 是 local-first filesystem。不要引入 database、web service、daemon、REST API、GraphQL、desktop UI、persistent cache server 或 background process。
- Runtime schema validation 如已在前置 stories 中使用 `zod@4.4.3`，继续复用同一 dependency 和 style；不要为了 Story 3.5 引入新 schema library。
- `src/commands/` 负责参数解析、command mode normalization 和 orchestration，不直接定义 public JSON 字段、status derivation、exit code policy 或 deep domain rules。
- `src/diagnostics/command-result-schema.ts` 是 `CommandResult` / `ValidationIssue` executable contract anchor；JSON reporter、fixture assertions 和 contract tests 必须复用该 module。
- `src/diagnostics/command-result.ts` 与 `src/diagnostics/output.ts` 负责把领域结果投影为 `CommandResult`、human-readable output 和 exit code。
- `src/source/`、`src/installer/`、`src/update/`、`src/manifest/`、`src/ide/` 和 `src/validation/` 只产出各自领域结果；public projection 和排序规则由 owning SPEC 约束。
- `speclite resolve` 是 runtime support command，不包裹 `CommandResult`；stdout/stderr、merge order、fallback 和 parity fixture 行为以 `_bmad-output/planning-artifacts/specs/06-resolve-command-contract.md` 为准。
- All public paths in command output, issues, details, fixtures and manifest/index projections must be project-relative POSIX-style unless an owning SPEC explicitly marks a field as redacted/non-stable.

### Implementation Anchors（实现锚点）

需要创建或扩展的 implementation anchors，实际命名应贴合已有实现：

- `src/bin/speclite.ts` 通过 commander 注册 covered user-facing commands 和 `--json` behavior。
- `src/commands/install.ts` 拥有 install command orchestration，但不直接拼接 public JSON。
- `src/commands/status.ts` 拥有 status command orchestration，并保留 lightweight summary boundary。
- `src/commands/validate.ts` 拥有 validate command orchestration，并调用 validation aggregation。
- `src/commands/update.ts` 拥有 update / update.repair command orchestration。
- `src/diagnostics/command-result-schema.ts` 拥有 `CommandResult`、`ValidationIssue`、command-specific data payloads、public projection types 和 schemaVersion validation。
- `src/diagnostics/command-result.ts` 拥有 status derivation、exit code projection、command id normalization、targetProject display id 和 update conflict projection。
- `src/diagnostics/output.ts` 拥有 Compact、Evidence 和 Structured renderers。
- `src/validation/issue-model.ts` 或等价 module 拥有 issue construction helpers、taxonomy guards 和 redaction-safe details policy。
- `src/validation/validate-project.ts` 拥有 validation aggregation、issueCounts、checkedCategories、checkedTargets、validatedPaths 和 deterministic sorting。
- `src/fs/path-normalizer.ts` 拥有 project-relative POSIX path normalization、absolute path rejection、drive letter rejection 和 project boundary checks。
- `src/ide/adapter-registry.ts` 拥有 canonical target order：`claude`、`agents`。
- `src/manifest/manifest-schema.ts`、`src/source/source-descriptor-schema.ts` 和 `src/installer/install-plan-schema.ts` 提供 command-specific data projection 需要的 executable schema anchors。
- `src/fixtures/fixture-contract.ts` 或等价 fixture assertion helper 负责 parsed semantic JSON comparison policy。

如果这些文件已经由前置 stories 创建，修改前必须完整读取并保留既有行为。如果它们因为前置 stories 尚未实现而不存在，停止 Story 3.5 实现并先完成前置条件，不要构建孤立的 diagnostics scaffold。

### CommandResult Contract Notes（CommandResult 契约备注）

Covered commands：

- `speclite install --json`
- `speclite status --json`
- `speclite validate --json`
- `speclite update --json`
- `speclite update --repair --json`

Explicit exception：

- `speclite resolve config`
- `speclite resolve customization`

Minimum envelope：

```ts
type CommandId =
  | "install"
  | "status"
  | "validate"
  | "update"
  | "update.repair";

type CommandResult<TData> = {
  schemaVersion: "speclite.command-result.v1";
  status: "success" | "warning" | "failure";
  command: CommandId;
  targetProject: string;
  summary: string;
  issues: ValidationIssue[];
  nextActions: string[];
  data: TData;
};
```

Rules：

- `command` is a normalized command id, not raw argv, shell string, alias or flag-bearing string.
- `targetProject` is a stable display identifier, not an absolute path or slugified id.
- `data.paths.projectRoot` must be `"."`.
- `schemaVersion` is the compatibility boundary. `speclite.command-result.v1` only allows backward-compatible additive changes.
- Breaking changes require a new schema version and synchronized owning SPEC, executable schema and fixtures.

### ValidationIssue Contract Notes（ValidationIssue 契约备注）

Minimum issue model：

```ts
type ValidationIssue = {
  issueId: string;
  category: string;
  severity: "info" | "warning" | "error" | "critical";
  affectedPath?: string;
  component?: string;
  details?: Record<string, unknown>;
  impact: string;
  suggestedNextStep: string;
};
```

Issue id policy：

- Must use `<category>.<stable-code>`.
- Must not include path, IDE target, source name, hash, count, timestamp, random id or dynamic value.
- Dynamic context belongs in `affectedPath`, `component` or deterministic `details`.

Severity semantics：

- `critical`: unsafe overwrite, schema corruption, missing required runtime contract or equivalent blocking condition.
- `error`: command or validation cannot complete, or installation is unusable.
- `warning`: flow can continue but needs human action.
- `info`: status note or recommendation.

Do not let individual validation rules redefine severity semantics.

### Command Status And Exit Code（命令状态与退出码）

Status derivation：

- `failure`: command cannot complete, or any `error` / `critical` issue exists.
- `warning`: command completes and only `warning` issues exist.
- `success`: command completes and no `warning` / `error` / `critical` issue exists.

Exit code：

- `failure`: non-zero.
- `success`: 0.
- `warning`: 0.

Special cases：

- `status.data.highLevelHealth` is independent from `CommandResult.status`.
- `status.data.highLevelHealth === "not-configured"` is a valid command success state.
- `update` / `update.repair` with `data.conflicts.length > 0` must be `failure` and emit one `update.conflicts` issue.
- `operation-lock.project-locked` is command-level blocker and must not be represented as `data.conflicts`.

### Data Payload Contract Notes（Data Payload 契约备注）

Required command-specific payload boundaries：

- `InstallCommandData`: `sourceDescriptor`、`manifestVersion`、`installedModules`、`ideTargets`、`paths`、`completedSteps`、`pendingSteps`。
- `StatusCommandData`: `manifestPresent`、`installedModules`、`ideTargets`、`highLevelHealth`、`paths`，可选 `sourceDescriptor`、`manifestVersion`。
- `ValidateCommandData`: `issueCounts`、`checkedCategories`、`checkedTargets`、`validatedPaths`。
- `UpdateCommandData`: `updatePlan`、`changedPaths`、`skippedPaths`、`conflicts`、`requiresConfirmation`、`writeAuthorized`。
- `RepairCommandData`: `repairPlan`、`changedPaths`、`skippedPaths`、`conflicts`、`requiresConfirmation`、`writeAuthorized`。

Rules：

- `status.data` must not contain `issueCounts`、`checkedCategories`、`checkedTargets` or `validatedPaths`.
- `validate.data.issueCounts` must always include `info`、`warning`、`error`、`critical`.
- `changedPaths` and `skippedPaths` describe actual apply result, not planned effects.
- When `writeAuthorized === false`, `changedPaths` and `skippedPaths` must be empty.
- `conflicts` are planning diagnostics and must be visible even in dry-run or unauthorized output.
- `RepairPlan.actions[]` can only target installer-owned paths.

### Ordering And Path Policy（排序与路径策略）

Required ordering：

- `issues`: severity order (`critical`, `error`, `warning`, `info`) -> canonical category order -> normalized affected path -> issue id.
- `nextActions`: command-specific priority order.
- `checkedCategories`: canonical issue category order.
- `checkedTargets` and `ideTargets`: adapter registry order (`claude`, then `agents`).
- `validatedPaths`, `changedPaths`, `skippedPaths`: normalized project-relative POSIX lexicographic order.
- `conflicts`: normalized affected path -> ownership -> reason.
- `updatePlan.actions`: normalized affected path -> action -> ownership -> reason.
- `repairPlan.actions`: normalized affected path -> action -> reason.
- `completedSteps` and `pendingSteps`: command-defined lifecycle order, not timing order.
- `installedModules`: source manifest module order, or normalized module id lexicographic order if source order unavailable.

Path policy：

- Public JSON path fields must use project-relative POSIX paths.
- `data.paths.projectRoot` must be `"."`.
- Absolute local paths, OS-specific separators, home directory paths, checkout-root-dependent paths, npm cache paths, temporary extraction directories and drive letters must not appear in stable public JSON fields.

### Output UX Requirements（输出体验要求）

- Default human-readable `status` uses Compact profile.
- Default human-readable `install`、`validate` and `update` use Evidence profile.
- `--json` uses Structured profile.
- Compact / Evidence / Structured profiles must share the same semantic source.
- Issue rows must show severity, category, issue id, affected path or component, impact and suggested next step.
- Color, symbol or table layout must not be the only carrier of status, severity, issue id, path or next action.
- Narrow terminal output can fall back to key-value blocks; `--json` must not change with terminal width, TTY, color, locale or platform.
- Empty states such as no issues, no conflicts, not configured, or unchecked categories must be explicit in human-readable output where relevant.

### Testing Requirements（测试要求）

- Contract schema tests:
  - valid `CommandResult` for install/status/validate/update/update.repair passes.
  - missing required top-level field fails.
  - unknown producer top-level field fails.
  - wrong `schemaVersion` fails.
  - `speclite resolve` outputs are not parsed as `CommandResult`.
- Status/exit tests:
  - success without issues => exit 0.
  - warning-only issues => exit 0.
  - error/critical issues => non-zero.
  - command incomplete => failure and non-zero.
  - status health partial/failed does not imply warning/failure.
- Redaction tests:
  - `ValidationIssue.details` rejects absolute path, home directory, drive letter, environment value, credentials, stack trace, raw exception, timestamp, random id, temporary/cache path and hash value.
  - `impact` and `suggestedNextStep` remain stable short templates.
- Renderer tests:
  - human-readable and `--json` outputs use the same issue/status/source data.
  - Structured JSON contains no ANSI escape, icons, terminal-width formatting or human-only fields.
  - Compact and Evidence profiles preserve textual severity/status equivalents without color.
- Fixture comparison tests:
  - parsed semantic JSON comparison ignores only explicitly non-stable fields.
  - repeated runs with same input keep stable semantic output.
  - snapshot changes cannot define new behavior without schema/SPEC updates.

### Latest Technical Information（最新技术信息）

本 Story 不需要引入或升级外部依赖。遵守仓库中 Architecture 已固定的平台与契约：

- Node.js 22 LTS minimum，Node.js 24 LTS recommended。
- TypeScript + commander CLI foundation。
- Runtime schema validation 如已在前置 stories 中使用，复用 `zod@4.4.3`。
- JSON rendering、path normalization、issue sorting、schema validation 和 fixture comparison 应复用前置 stories 建立的 shared modules；不要为了 Story 3.5 添加新 CLI framework、schema library、terminal renderer 或 path library。
- Story 3.5 是受契约约束的 public JSON / diagnostics contract migration，不应在本实现中追逐最新 dependency version。如果确实需要 dependency 变更，必须停止并在单独授权的变更中更新 owning Architecture / SPEC / fixtures。

### Project Context Reference（项目上下文引用）

- `_bmad-output/project-context.md` 当前存在，但只包含初始化占位内容。不要把它当作完整 implementation rule source。
- 本 Story 的 live source of truth 是 Epic 3 shard、PRD status/validation FR/NFR、Architecture implementation mapping、UX control-plane guidance，以及 `_bmad-output/planning-artifacts/specs/` 下的 owning SPECs。

## References（参考）

- `_bmad-output/project-context.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/implementation-artifacts/3-1-lightweight-install-status-summary.md`
- `_bmad-output/implementation-artifacts/3-2-manifest-and-index-schema-validation.md`
- `_bmad-output/implementation-artifacts/3-3-ide-mirror-and-file-integrity-validation.md`
- `_bmad-output/implementation-artifacts/3-4-runtime-path-menu-target-legacy-entry-and-artifact-path-validation.md`
- `_bmad-output/planning-artifacts/epics/06-epic-3-installed-state-and-deterministic-validation已安装状态与确定性验证.md`
- `_bmad-output/planning-artifacts/prd/08-developer-tool-specific-requirements开发者工具特定需求.md`
- `_bmad-output/planning-artifacts/prd/10-functional-requirements功能需求.md`
- `_bmad-output/planning-artifacts/prd/11-non-functional-requirements非功能需求.md`
- `_bmad-output/planning-artifacts/architecture/03-core-architectural-decisions核心架构决策.md`
- `_bmad-output/planning-artifacts/architecture/04-implementation-patterns-consistency-rules实现模式与一致性规则.md`
- `_bmad-output/planning-artifacts/architecture/05-project-structure-boundaries项目结构与边界.md`
- `_bmad-output/planning-artifacts/ux-design-specification.md`
- `_bmad-output/planning-artifacts/specs/README.md`
- `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md`
- `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md`
- `_bmad-output/planning-artifacts/specs/05-ide-adapter-registry-contract.md`
- `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md`
- `assets/source/speclite/core-skills/module.yaml`
- `assets/source/speclite/core-skills/module-help.csv`
- `assets/source/speclite/sdlc-skills/module.yaml`
- `assets/source/speclite/sdlc-skills/module-help.csv`

## Dev Agent Record（开发代理记录）

### Agent Model Used（使用的代理模型）

由 dev agent 填写。

### Debug Log References（调试日志引用）

由 dev agent 填写。

### Completion Notes List（完成备注列表）

- Story context 由 `bmad-create-story` workflow 创建。
- Ultimate context engine analysis completed - comprehensive developer guide created.

### File List（文件列表）

由 dev agent 填写。
