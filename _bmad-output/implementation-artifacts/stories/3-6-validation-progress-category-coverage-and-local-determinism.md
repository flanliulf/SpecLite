# Story 3.6: Validation Progress, Category Coverage And Local Determinism（验证进度、类别覆盖与本地确定性）

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story（故事）

作为工具链维护者，  
我希望 `speclite validate` 按稳定顺序展示检查进度、覆盖类别、目标和路径，  
以便验证结果可以被人读懂，也可以被 fixture、CI 和自动化脚本稳定比较。

## Acceptance Criteria（验收标准）

1. **Validation categories use canonical processing and reporting order（验证类别使用规范处理与报告顺序）**  
   **前提** 用户运行 `speclite validate`；  
   **当** validate 开始执行检查并生成 `ValidateCommandData.checkedCategories`；  
   **则** 系统必须按 canonical issue category order 处理、记录和报告已执行类别；  
   **并且** 顺序必须为 `environment`、`manifest-schema`、`source-integrity`、`ide-mirror`、`runtime-path`、`menu-target`、`legacy-namespace`、`artifact-path`、`file-integrity`、`operation-lock`、`update`；  
   **并且** `source-integrity` 在 Epic 3 中只是 canonical order 的 reserved position；除非已有本地只读 rule/category group 实际执行，否则不得为了填满 `checkedCategories` 在 Story 3.6 中实现 source integrity domain rules；  
   **并且** 每个实际执行类别的 human-readable progress 必须有稳定文本信号，不能只依赖 spinner、颜色或异步完成顺序。

2. **Partial validation preserves relative category order（部分类别验证保留相对顺序）**  
   **前提** validate 因 manifest/schema blocker、显式 scope、前置依赖缺失或 feature boundary 只执行部分类别；  
   **当** 输出 `checkedCategories`；  
   **则** 已执行类别仍必须保留 canonical relative order；  
   **并且** 不得使用 filesystem traversal、glob order、rule registration order、object key order、Promise resolution order 或 adapter completion order 作为输出顺序；  
   **并且** human-readable output 必须能让用户区分已检查类别、未检查类别和因 blocker 被跳过的类别。

3. **Issue counts always expose all severity keys（问题计数始终暴露全部严重级别 Key）**  
   **前提** validate 输出 `ValidateCommandData.issueCounts`；  
   **当** 某个 severity 没有 issue；  
   **则** `validate.data.issueCounts` 仍必须固定包含 `info`、`warning`、`error` 和 `critical` 四个 key；  
   **并且** 计数为 0 的 severity 不得省略、不得用 `null` 表达、不得依赖 renderer 后处理补齐。

4. **Checked targets use adapter registry canonical order（已检查 Target 使用 Adapter Registry 规范顺序）**  
   **前提** validate 输出 `checkedTargets`；  
   **当** 已安装、显式选择或本次实际检查多个 IDE targets；  
   **则** target 顺序必须遵守 manifest / adapter registry canonical target order：`claude`，然后 `agents`；  
   **并且** 不得依赖 glob、filesystem、用户选择顺序、平台返回顺序、adapter registry object key order 或 async adapter 完成顺序；  
   **并且** MVP 不得输出 branded `copilot`、`cursor` 或其他未在 adapter registry 契约中声明的 target id。

5. **Validated paths are normalized before sorting（已验证路径先规范化再排序）**  
   **前提** validate 输出 `validatedPaths`；  
   **当** 路径集合生成完成；  
   **则** 每个路径必须先通过 shared path normalization 变成 project-relative POSIX path；  
   **并且** 再按 normalized string lexicographic order 输出；  
   **并且** public path fields 不得包含 absolute path、home directory、drive letter、OS-specific separator、cache path、temporary extraction path 或 checkout-root-dependent path。

6. **Issues use global deterministic sorting（Issues 使用全局确定性排序）**  
   **前提** validate 输出 `CommandResult.issues`；  
   **当** 多个 issue 同时存在；  
   **则** issues 必须按 severity order、canonical issue category order、normalized affected path、issue id 排序；  
   **并且** severity order 必须为 `critical`、`error`、`warning`、`info`；  
   **并且** missing `affectedPath` 的 command-level issue 必须使用稳定排序 key，不能因 undefined / empty path 在不同 runtime 中漂移；  
   **并且** 不得按发现顺序、rule execution order、filesystem traversal order、object insertion order 或异步完成顺序输出。

7. **Repeated validate runs are local deterministic（重复 Validate 运行保持本地确定性）**  
   **前提** 同一安装状态连续运行 `speclite validate` 三次；  
   **当** source、manifest、IDE mirrors、runtime paths、workflow artifacts 和 files index 未发生变化；  
   **则** 除 owning SPEC 明确允许并在 fixture 中 normalize / exclude 的 timestamp 字段外，`CommandResult` JSON 语义内容必须保持一致；  
   **并且** validate 不得访问 npm registry、private registry、Git remote、offline bundle origin、source checkout freshness service、package-manager cache、temporary extraction root 或 provenance revalidation service；  
   **并且** validate 不得写入、删除、repair、chmod、regenerate、normalize 或覆盖任何项目文件。

8. **Human-readable validate output adapts without losing fields（人类可读验证输出可降级且不丢字段）**  
   **前提** validate 渲染 default human-readable output；  
   **当** terminal width 小于 80 columns、处于 80-119 columns 或大于等于 120 columns；  
   **则** 输出可以在 key-value block 与 table 间切换；  
   **并且** 不得丢失 severity、category、issueId、affectedPath、impact、suggestedNextStep、checkedCategories、checkedTargets、issueCounts 或 nextActions；  
   **并且** `--json` 输出不受 terminal width、TTY、locale、颜色设置、CI 环境或平台影响。

9. **Color, symbols, and empty states have text equivalents（颜色、符号与空状态有文本等价表达）**  
   **前提** validate output 使用颜色、图标、符号或表格辅助扫描；  
   **当** 用户在 `NO_COLOR`、non-TTY、screen reader、CI log、复制到 issue tracker 或 plain text 的场景阅读输出；  
   **则** severity、command status、empty state、issue category、issue id 和 next action 必须仍有文本等价物；  
   **并且** `No issues found`、`No conflicts detected`、`No categories checked` 或 skipped / not checked state 必须显式呈现，不得以空白表示；  
   **并且** 空 issues 只能表示本次已执行 validation 未产生 issue，不得被解释为未执行类别也健康。

## Tasks / Subtasks（任务 / 子任务）

- [ ] Task 1: 验证前置实现与当前仓库状态（AC: 1-9）
  - [ ] 确认 Epic 1 / Epic 2 / Story 3.1 / Story 3.2 / Story 3.3 / Story 3.4 / Story 3.5 的实际代码已经建立 TypeScript CLI scaffold、`speclite validate` command hook、manifest/index executable schemas、IDE adapter registry、validation rules、CommandResult schema/projection、diagnostics output、path normalization、`src/fixtures/fixture-contract.ts` 和 fixture assets/tests；不能只依据 story context 的 `ready-for-dev` 状态判断完成。
  - [ ] 如果 `package.json`、`src/`、`test/`、`tests/`、`src/bin/speclite.ts`、`src/commands/validate.ts`、`src/validation/validate-project.ts`、`src/diagnostics/command-result-schema.ts`、`src/diagnostics/command-result.ts`、`src/diagnostics/output.ts`、`src/fs/path-normalizer.ts` 或 `src/ide/adapter-registry.ts` 尚不存在，先完成前置 stories；不得在 Story 3.6 中创建孤立的 validation-order-only scaffold。
  - [ ] 修改前完整读取所有 UPDATE files，尤其是 `src/validation/validate-project.ts`、所有已存在的 `src/validation/rules/*.ts`、`src/validation/issue-model.ts`、`src/diagnostics/command-result.ts`、`src/diagnostics/command-result-schema.ts`、`src/diagnostics/output.ts`、`src/fs/path-normalizer.ts`、`src/ide/adapter-registry.ts` 和 fixture comparison helpers。
  - [ ] 检查 worktree dirty 状态，保留与本 Story 无关的 planning artifacts、已有 story 文件、sprint status 或用户改动；不得格式化、重写、同步或回滚无关文件。

- [ ] Task 2: 建立 validation ordering primitives（建立验证排序原语）（AC: 1, 2, 4, 5, 6）
  - [ ] 在 `src/validation/validate-project.ts`、`src/validation/validation-order.ts` 或既有 shared module 中定义 single canonical issue category order，并复用 taxonomy / CommandResult contract 中的 11 个 categories；该 order 包含 `source-integrity` reserved position，但不表示 Story 3.6 拥有该 category 的 domain validation rule。
  - [ ] 复用或扩展 Story 3.5 的 shared sorting helpers：severity order、canonical category order、adapter target order、normalized path lexicographic order 和 issue id tie-breaker。
  - [ ] `checkedCategories` 只能由实际执行的 validation rules / category groups 产生，不能通过扫描 available rules、所有 known categories 或 reserved category order 伪造；未执行的 `source-integrity` 必须在 human-readable progress 中显示 skipped / not checked，而不是进入 `checkedCategories`。
  - [ ] `checkedTargets` 必须由 manifest/index / adapter registry / actual target checks 产生，并通过 `src/ide/adapter-registry.ts` 的 canonical target order 排序。
  - [ ] `validatedPaths` 必须在进入 `CommandResult` 前完成 project-relative POSIX normalization 和 lexicographic sort；不要让 reporter 再做语义补救。

- [ ] Task 3: 收口 validate orchestration and progress model（收口 Validate 编排与进度模型）（AC: 1, 2, 7, 8, 9）
  - [ ] `src/commands/validate.ts` 继续只负责参数解析、project root resolution、调用 `validateProject` / equivalent domain service，并返回 `CommandResult<ValidateCommandData>`。
  - [ ] `src/validation/validate-project.ts` 必须按 canonical category order 编排 rules，并显式记录每个实际执行 category 的 start / complete / skipped state。
  - [ ] Human-readable progress 可以显示 category label、status 和 short reason；machine-readable `ValidateCommandData` 仍只输出 owning SPEC 声明的 `issueCounts`、`checkedCategories`、`checkedTargets`、`validatedPaths`，不得新增未契约化 progress payload。
  - [ ] 如果某个 category 因前置 schema corruption、unsupported target 或 missing installed state 被跳过，human-readable output 必须说明 skipped / not checked，不得用 `No issues found` 暗示已检查通过。
  - [ ] Progress status 不得包含 wall-clock duration、elapsed time、timestamp、random id 或 profiling samples；performance evidence 属于 Epic 6 / release evidence，不进入 stable command JSON。

- [ ] Task 4: 固化 `ValidateCommandData` projection（固化 ValidateCommandData 投影）（AC: 2, 3, 4, 5）
  - [ ] `issueCounts` 必须由最终 sorted issues 派生，并固定包含 `info`、`warning`、`error`、`critical` 四个 key，包括 0 值。
  - [ ] `checkedCategories` 必须仅包含实际执行类别，并使用 canonical relative order；部分执行不能重新编号或按执行完成顺序输出。
  - [ ] `checkedTargets` 必须仅包含实际检查 targets，并使用 `claude`、`agents` canonical order；读取失败时不要伪造 target coverage。
  - [ ] `validatedPaths` 必须包含实际读过或验证过的 relevant paths，例如 manifest/index paths、IDE target paths、runtime/menu/artifact paths、files-index paths 和 operation-lock path；每一项都必须 project-relative POSIX 并按字典序输出。
  - [ ] `status.data` 仍不得包含 `issueCounts`、`checkedCategories`、`checkedTargets` 或 `validatedPaths`；这些字段只属于 `validate.data`。

- [ ] Task 5: 实现 global issue sorting and redaction-safe determinism（实现全局 Issue 排序与脱敏确定性）（AC: 5, 6, 7）
  - [ ] 所有 validation rules 只能产出 domain findings / `ValidationIssue` inputs；最终 global sort 在 shared diagnostics / validation aggregation layer 完成。
  - [ ] Sorting key 必须是 severity rank -> category rank -> normalized affected path -> issue id -> stable component key；不得使用 array insertion order 或 object key order 做 tie-breaker。
  - [ ] `affectedPath`、`component`、`details`、`impact`、`suggestedNextStep` 必须保持 stable and redaction-safe；不得包含 absolute path、home directory、drive letter、environment variable value、credential、token、stack trace、raw exception、timestamp、hash、random id、temporary path、cache path 或 source staging path。
  - [ ] 如果 rule 需要比较 hash，hash value 不得进入 `ValidationIssue.details` 或 public stable output；可通过 stable `baselineKind`、`hashAlgorithm`、`reason` 等字段表达机器上下文。
  - [ ] Tests 必须覆盖输入 issues 打乱顺序、rules 异步完成顺序变化、paths 未排序、targets 未排序时，最终 JSON 仍稳定。

- [ ] Task 6: 强化 local-only read-only validation boundary（强化本地只读验证边界）（AC: 7）
  - [ ] `speclite validate` 不得调用 remote source resolver、registry client、Git remote、offline bundle origin、package-manager cache、temporary extraction root、source checkout freshness check 或 provenance revalidation。
  - [ ] `speclite validate` 不得调用 install/update planner、repair planner、safe write mutation、target writer、manifest generator、artifact writer、chmod、copy-tree、cleanup mutation 或 config writer。
  - [ ] Validate 可以报告 `operation-lock.stale-lock` warning，但不得删除 lock 或 stale temp files；write-capable command 的 lock acquisition / repair behavior 仍属于 Epic 4。
  - [ ] Story 3.6 不新增 `source-integrity` domain validation rule。若前置 implementation 已存在本地只读 `source-integrity` category group，本 Story 只负责按 canonical order 编排、记录 checked/skipped state 和稳定输出；若不存在，则 human-readable output 必须显示 skipped / not checked，`checkedCategories` 不得包含 `source-integrity`。
  - [ ] `source-integrity` 的 source descriptor / integrity evidence shape、source lockfile lifecycle、remote freshness 和 provenance revalidation 归属 Epic 5；Story 3.6 只保留 no-network / no-provenance boundary，避免在 Epic 3 中实现半套来源完整性规则。

- [ ] Task 7: 实现 validate Evidence profile terminal fallback（实现 Validate Evidence Profile 终端降级）（AC: 8, 9）
  - [ ] `src/diagnostics/output.ts` 的 validate default human-readable output 使用 Evidence profile，展示 command title、summary、issueCounts、checkedCategories、checkedTargets、validatedPaths 摘要、issues、nextActions 和 explicit empty states。
  - [ ] 小于 80 columns 时，宽表格必须降级为 key-value blocks；80-119 columns 可使用紧凑表格或 grouped list；大于等于 120 columns 可以使用更完整表格，但字段集合不能变化。
  - [ ] `NO_COLOR`、non-TTY、CI 和 screen reader 场景下，颜色、图标或符号只能作为增强；severity、category、issueId、affectedPath、impact、suggestedNextStep 和 nextActions 必须以文本呈现。
  - [ ] `--json` Structured profile 必须输出 raw JSON object / string，不包含 ANSI escape、颜色、图标、spinner text、table drawing、terminal width formatting、locale-dependent layout 或 human-only decoration fields。
  - [ ] Empty states 必须明确：无 issue 显示 `No issues found`，无 conflict 显示 `No conflicts detected`，没有类别被执行时显示 `No categories checked` 或更具体 blocker wording。

- [ ] Task 8: 编写 contract tests、focused tests 和 fixture assertions（AC: 1-9）
  - [ ] Unit tests 覆盖 canonical category order、partial category subset order、unknown category rejection / guarded handling，以及 `checkedCategories` 不受 rule registration order 影响。
  - [ ] Unit tests 覆盖 `issueCounts` 固定四 key，包括全 0、仅 warning、error + critical 混合、unknown severity producer rejection。
  - [ ] Unit tests 覆盖 `checkedTargets` 使用 `claude` -> `agents`，且不受 glob、filesystem、user selection 或 async completion order 影响。
  - [ ] Unit tests 覆盖 `validatedPaths` normalization：POSIX separator、relative path、lexicographic sort、absolute path / drive letter / home path rejection 或 redaction policy。
  - [ ] Unit tests 覆盖 issues global sorting：severity -> category -> affectedPath -> issueId；输入 issue arrays 打乱多次后输出稳定。
  - [ ] Repeated-run determinism tests 在同一 fixture 上连续运行 `speclite validate` 至少 3 次，比较 parsed semantic JSON；除 owning SPEC 允许 normalize / exclude 的 timestamp 字段外必须一致。
  - [ ] Boundary tests 使用 spies / dependency injection 断言 validate 不访问 remote source、不调用 update/repair/write/chmod、不读取 package-manager cache 或 temporary extraction root。
  - [ ] Renderer tests 覆盖 `<80`、`80-119`、`>=120` columns、`NO_COLOR`、non-TTY、CI、screen-reader/plain-text copy；关键字段不得丢失。
  - [ ] Fixture tests 覆盖至少 `fresh-install-empty-project`、`ide-drift`、`path-portability` 和最小 `skill-artifact-loop` 的 validate output ordering、empty state、checked categories / targets / paths 和 JSON stability。

- [ ] Task 9: 本地验证与范围控制（AC: 1-9）
  - [ ] 运行 `npm run build`。
  - [ ] 运行 `npm test`，或至少运行 validation aggregation、CommandResult projection、diagnostics output、path normalization、adapter registry 和 validate integration focused tests。
  - [ ] 如果前置 implementation 尚未完成，保留失败为有效前置信号；不要伪造 fixture pass 或创建 isolated validation ordering implementation。
  - [ ] 检查 diff，确认没有修改 `_bmad-output/planning-artifacts/`、其他 story 文件或无关用户改动。
  - [ ] 检查 diff，确认没有实现 Epic 4 update/repair apply behavior、Epic 5 remote freshness/provenance expansion、Epic 6 full release matrix beyond focused validate fixtures、Post-MVP `doctor` / `sync` / `uninstall` / top-level `repair`、command pointer artifacts、coverage dashboard、trend report 或 dedicated Copilot/Cursor target ids。

## Dev Notes（开发备注）

### Current Repository State（当前仓库状态）

- 创建本 Story 时，仓库根目录未发现 root `package.json`、`src/`、`test/`、`tests/` 或 root `fixtures/` implementation scaffold。Story 3.6 的开发必须在 Epic 1 / Epic 2 / Story 3.1-3.5 的实际代码完成后进行。
- `_bmad-output/implementation-artifacts/1-1` 到 `1-6`、`2-1` 到 `2-5`、`3-1` 到 `3-5` 当前是 `ready-for-dev` story context，不是完成后的代码证据。
- 当前 worktree 已存在与本 Story 创建无关的 dirty planning artifacts、`sprint-status.yaml` 改动和未跟踪 Epic 1 / Epic 2 / Epic 3 story 文件。实现 Story 3.6 时不得格式化、重写、同步或回滚这些无关改动。
- `_bmad-output/project-context.md` 当前仍是初始化占位内容；实际 implementation guardrails 以 live PRD、Architecture、UX、ADR 和 owning SPEC artifacts 为准。
- `assets/source/speclite/` 已存在，并包含 bundled source assets、module metadata、module help catalog、custom stubs、legacy Python resolver scripts 和 canonical skill packages。Story 3.6 validate 必须检查 installed projection / target project state，不得把 source checkout 当成 installed state。

### Previous Story Intelligence（前序 Story 延续约束）

- Story 3.1 明确 `status` 是 lightweight installed-state summary：`highLevelHealth` 独立于 `CommandResult.status`，`status.data` 不输出 `issueCounts`、`checkedCategories`、`checkedTargets`、`validatedPaths` 或 full validation category coverage。Story 3.6 不得把 validate coverage 回灌到 status。
- Story 3.2 已把 manifest、skill index、help index、files index 和 phase coverage 的 schema / shape validation 放入 `manifest-schema` boundary，并建立 `ValidateCommandData.issueCounts`、`checkedCategories`、`checkedTargets`、`validatedPaths` 的最小 deterministic projection。Story 3.6 扩展全局 coverage / progress，不重复定义 manifest parser。
- Story 3.3 已拥有 IDE mirror package-level drift detection、files index raw-byte integrity checks、read-only drift reporting 和 per-rule deterministic evidence。Story 3.6 不重新计算 canonical package hash 或 file hash，只统一 global ordering、coverage 和 repeated-run determinism。
- Story 3.4 已拥有 runtime path、menu target、legacy namespace 和 artifact path validation。Story 3.6 不重复这些 rule 的领域逻辑，只确保它们纳入 canonical category coverage、progress display、path collection 和 global sorting。
- Story 3.5 已建立 `CommandResult` / `ValidationIssue` executable contract anchor、status / exit-code projection、command id normalization、targetProject display id、path / sorting helpers 和 Compact / Evidence / Structured renderer boundary。Story 3.6 应复用这些 primitives，并补齐完整 validate progress、category coverage、local determinism 和 human-readable terminal fallback matrix。
- `source-integrity` 在 Epic 3 中不被定义为新增 validation rule。Story 3.6 只能消费已有 category group 的 execution state，或在未实现时输出 skipped / not checked；具体 source descriptor、evidence shape、lockfile、remote freshness、provenance 和 distribution channel rules 由 Epic 5 收口。

### Git Intelligence Summary（Git 历史摘要）

- 最近 5 个 commit 均为 docs/context/source/spec cleanup 类变更：`style(docs): 清理参考文档尾随空白`、`docs(context): 初始化项目上下文文档`、`docs(source): 同步内置源资产路径说明`、`docs(glossary): 整理术语目录与文档索引`、`docs(specs): 收敛 MVP 契约与实现锚点`。
- 当前可引用的实现模式主要来自 live planning artifacts、owning SPECs 和前序 story context，而不是已提交 TypeScript implementation；dev agent 不得从这些 docs commit 推断源码已经存在。
- Story 3.6 实现前必须重新检查 git history 和 worktree，确认前置 stories 是否已经由其他 agent 添加 actual implementation。

### Scope Boundary（范围边界）

- 本 Story 只负责 `speclite validate` 的 global progress / category coverage、`ValidateCommandData` projection consistency、canonical category / severity / target / path ordering、repeated-run local determinism、read-only no-network boundary、human-readable validate Evidence profile terminal fallback、explicit empty states、focused tests 和 fixture assertions。
- 本 Story 不负责：
  - Epic 1 的 CLI scaffold、fresh install source discovery、module selection、manifest/index generation、IDE mirror writes、config initialization 或 ready summary domain logic。
  - Epic 2 的 methodology discovery metadata、skill entry mapping、phase coverage generation、activation target validation、`speclite resolve` runtime support 或 artifact metadata validation。
  - Story 3.1 的 lightweight status aggregation domain reads。
  - Story 3.2 的 manifest/index schema validation rules。
  - Story 3.3 的 IDE mirror package hash comparison、files index current hash scan 或 missing installer-owned file diagnostics。
  - Story 3.4 的 runtime/menu/legacy/artifact path domain validation rules。
  - Story 3.5 的 initial `CommandResult` / `ValidationIssue` contract migration across all commands.
  - `source-integrity` domain validation rule, source descriptor / evidence shape checks, source lockfile lifecycle, remote source freshness or provenance revalidation.
  - Epic 4 update/repair write planning, safe write, operation lock acquisition, conflict detection implementation or repair apply behavior.
  - Epic 5 remote source freshness/provenance revalidation, source lockfile lifecycle, enterprise source policy or distribution channel expansion.
  - Epic 6 full release fixture matrix beyond focused validate ordering / determinism / terminal fallback fixtures.
  - Post-MVP `doctor`、`sync`、`uninstall`、top-level `repair`、migration tooling、governance dashboard、coverage percentage、trend report、command pointer artifacts or dedicated Copilot/Cursor adapters.

### Architecture Requirements（架构要求）

- Runtime baseline 保持 Node.js 22 minimum 和 Node.js 24 recommended。除非已有 Node 22-compatible path 并同步更新 runtime policy / fixtures，否则不得使用 Node 24-only API。
- CLI foundation 保持 TypeScript + commander。不要为本 Story 引入 oclif/yargs/cac/clipanion。
- Storage model 是 local-first filesystem。不要引入 database、web service、daemon、REST API、GraphQL、desktop UI、persistent cache server 或 background process。
- Runtime schema validation 如已在前置 stories 中使用 `zod@4.4.3`，继续复用同一 dependency 和 style；不要为了 Story 3.6 引入新 schema library。
- `src/commands/validate.ts` 负责 command orchestration，不直接拼接 public JSON、issue layout、path display、category coverage 或 output sorting。
- `src/validation/validate-project.ts` 或 equivalent aggregator 负责 rule orchestration、checked categories / targets / paths collection、issue aggregation 和 deterministic sorting。
- `src/diagnostics/command-result-schema.ts` 负责 `CommandResult`、`ValidationIssue`、`ValidateCommandData` 和 producer/consumer schema guardrails。
- `src/diagnostics/command-result.ts` 与 `src/diagnostics/output.ts` 负责 command result projection、exit code、Evidence / Structured rendering、terminal width fallback 和 text equivalents。
- `src/fs/path-normalizer.ts` 是 project-relative POSIX path normalization 的 shared boundary；validation rules、reporters 和 fixtures 不得各自实现 path display policy。
- `src/ide/adapter-registry.ts` 是 canonical target order 的 executable source；validate 不得从 filesystem 或 user selection 推导 target display order。

### Implementation Anchors（实现锚点）

需要创建或扩展的 implementation anchors，实际命名应贴合已有实现：

- `src/bin/speclite.ts` 通过 commander 注册 `speclite validate` 和 `--json` behavior。
- `src/commands/validate.ts` 拥有 validate command orchestration。
- `src/validation/validate-project.ts` 拥有 validation aggregation、category orchestration、checkedCategories / checkedTargets / validatedPaths collection 和 deterministic sorting。
- `src/validation/validation-order.ts` 或等价 shared module 拥有 canonical category order、severity order、target order 和 stable sorting keys。
- `src/validation/issue-model.ts` 拥有 issue construction helpers、taxonomy guards 和 redaction-safe details policy。
- `src/validation/rules/manifest-schema.ts`、`source-integrity.ts`、`ide-mirror.ts`、`runtime-path.ts`、`menu-target.ts`、`legacy-namespace.ts`、`artifact-path.ts`、`file-integrity.ts`、`operation-lock.ts` 在存在时只产出 domain findings / issues，不拥有 final global sorting。
- `src/diagnostics/command-result-schema.ts` 拥有 `ValidateCommandData`、`ValidationIssueCounts`、`IssueCategory` 和 producer schema。
- `src/diagnostics/command-result.ts` 拥有 `CommandResult` projection、issueCounts derivation、global sorting helper reuse 和 exit code projection。
- `src/diagnostics/output.ts` 拥有 Evidence validate renderer、Structured JSON renderer、terminal width fallback、NO_COLOR / non-TTY / CI behavior 和 explicit empty states。
- `src/fs/path-normalizer.ts` 拥有 project-relative POSIX path normalization、absolute path rejection、drive letter rejection 和 project boundary checks。
- `src/ide/adapter-registry.ts` 拥有 `CANONICAL_TARGET_ORDER = ["claude", "agents"]`。
- `src/fixtures/fixture-contract.ts` 或 equivalent helper 负责 parsed semantic JSON comparison、timestamp normalization / exclusion 和 stable snapshot policy。

如果这些文件已经由前置 stories 创建，修改前必须完整读取并保留既有行为。如果它们因为前置 stories 尚未实现而不存在，停止 Story 3.6 实现并先完成前置条件，不要构建孤立的 validate-progress scaffold。

### Validate Data Contract Notes（Validate 数据契约备注）

Minimum `ValidateCommandData` shape：

```ts
type ValidationIssueCounts = {
  info: number;
  warning: number;
  error: number;
  critical: number;
};

type IssueCategory =
  | "environment"
  | "manifest-schema"
  | "source-integrity"
  | "ide-mirror"
  | "runtime-path"
  | "menu-target"
  | "legacy-namespace"
  | "artifact-path"
  | "file-integrity"
  | "operation-lock"
  | "update";

type ValidateCommandData = {
  issueCounts: ValidationIssueCounts;
  checkedCategories: IssueCategory[];
  checkedTargets: string[];
  validatedPaths: string[];
};
```

Required rules：

- `issueCounts` must always include `info`、`warning`、`error`、`critical`.
- `checkedCategories` must use canonical category order and include only categories actually checked.
- `source-integrity` appears in canonical category order as a reserved position. It appears in `checkedCategories` only when an actual local rule/category group ran; skipped / not checked state belongs to human-readable progress, not to `checkedCategories`.
- `checkedTargets` must use adapter registry canonical target order.
- `validatedPaths` must be normalized project-relative POSIX paths sorted lexicographically.
- `CommandResult.issues` must be sorted by severity order, category order, normalized affected path and issue id.
- `status.data` must not contain validate-only fields.

### Canonical Ordering Rules（规范排序规则）

Category order：

1. `environment`
2. `manifest-schema`
3. `source-integrity`
4. `ide-mirror`
5. `runtime-path`
6. `menu-target`
7. `legacy-namespace`
8. `artifact-path`
9. `file-integrity`
10. `operation-lock`
11. `update`

Severity order：

1. `critical`
2. `error`
3. `warning`
4. `info`

Target order：

1. `claude`
2. `agents`

Issues sorting key：

1. severity rank
2. category rank
3. normalized affected path, with omitted path mapped to a stable command-level sort key
4. issue id
5. stable component key when needed

### Local Determinism And Redaction Rules（本地确定性与脱敏规则）

- `speclite validate` is local-only and read-only. It may read target project installed state, manifest/index files, IDE mirrors, runtime paths, artifact metadata and operation lock state; it must not access remote source or mutate project files.
- Public JSON must not include terminal width formatting, ANSI escape, icons, table drawing, timestamps, durations, profiling samples, absolute local paths, home directories, OS-specific separators, cache paths, temporary extraction roots, credentials, stack traces, raw exceptions, random ids or hash values unless an owning SPEC explicitly allows and fixtures normalize / exclude the field.
- `ValidationIssue.details` is machine-readable structured context only. It must stay deterministic, JSON-serializable and redaction-safe.
- `impact` and `suggestedNextStep` must use stable short templates. Dynamic context belongs in `affectedPath`, `component` or stable `details` enums.
- `No issues found` is valid only for categories actually checked. If categories were skipped, human-readable output must say so explicitly.

### UX Output Requirements（UX 输出要求）

- Validate default human-readable output should use Evidence profile, not Compact profile.
- Human-readable output can switch between table and key-value presentation by terminal width, but the semantic fields must not change.
- Color, symbols and icons are optional visual affordances only. Text must carry status, severity, category, issue id and next action.
- `NO_COLOR`、non-TTY、CI log、screen reader 和 issue tracker copy-paste paths must stay understandable.
- Structured JSON output must be presentation-free and stable across width, TTY, color, locale and platform.

### Fixture Strategy（Fixture 策略）

- Fixture assertions must parse `CommandResult` JSON and compare semantic fields, not raw terminal text.
- Stable snapshots may normalize or exclude only fields explicitly declared non-stable by owning SPEC.
- Repeated validate fixture runs must compare issue arrays, issueCounts, checkedCategories, checkedTargets, validatedPaths, nextActions and command status.
- Terminal width / no-color / non-TTY / CI renderer checks can assert required field presence and text equivalents without turning wall-clock or terminal layout into stable JSON contract.
- Path-portability fixtures must include macOS / Windows path normalization evidence before MVP release, but Story 3.6 should only add focused coverage where fixture contract/assets/tests already exist.

### Latest Technical Information（最新技术信息）

- 未执行外部 web research。Story 3.6 的行为由本仓库 live owning SPECs、PRD、Architecture、UX 和前序 story context 定义；没有需要采用“最新第三方 API”的实现点。
- Dev agent 应遵守当前本地架构约束：Node.js 22 minimum、Node.js 24 recommended、TypeScript + commander、filesystem-first storage、如前序实现已采用 `zod@4.4.3` 则继续复用，不因本 Story 引入新框架或新 schema library。

### References（参考）

- `_bmad-output/planning-artifacts/epics/06-epic-3-installed-state-and-deterministic-validation已安装状态与确定性验证.md#story-36-validation-progress-category-coverage-and-local-determinism验证进度类别覆盖与本地确定性`
- `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md#Command Data Payloads（命令数据载荷）`
- `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md#Ordering Rules（排序规则）`
- `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md#Path Policy（路径策略）`
- `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md#Canonical Category Order（标准类别顺序）`
- `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md#Canonical Target Identity（目标标识）`
- `_bmad-output/planning-artifacts/specs/05-ide-adapter-registry-contract.md#MVP Targets（MVP 目标）`
- `_bmad-output/planning-artifacts/specs/08-fixture-contract.md#Comparison Rules（比较规则）`
- `_bmad-output/planning-artifacts/prd/10-functional-requirements功能需求.md#Status & Validation（状态与验证）`
- `_bmad-output/planning-artifacts/prd/11-non-functional-requirements非功能需求.md#Diagnostics & Observability（诊断与可观测性）`
- `_bmad-output/planning-artifacts/architecture/03-core-architectural-decisions核心架构决策.md#API & Communication Patterns（API 与通信模式）`
- `_bmad-output/planning-artifacts/architecture/04-implementation-patterns-consistency-rules实现模式与一致性规则.md#Process Patterns（流程模式）`
- `_bmad-output/planning-artifacts/architecture/05-project-structure-boundaries项目结构与边界.md#Requirements to Structure Mapping（需求到结构的映射）`
- `_bmad-output/planning-artifacts/ux-design-specification.md#Design System Foundation（设计系统基础）`
- `_bmad-output/implementation-artifacts/3-5-commandresult-and-validationissue-json-contract.md#Previous Story Intelligence（前序 Story 延续约束）`

## Project Structure Notes（项目结构备注）

- 目标 implementation anchors 位于未来 TypeScript CLI scaffold：`src/commands/validate.ts`、`src/validation/validate-project.ts`、`src/diagnostics/*`、`src/fs/path-normalizer.ts`、`src/ide/adapter-registry.ts` 和 `src/fixtures/fixture-contract.ts`。
- 当前仓库尚未出现 root implementation scaffold。Dev agent 必须把这一点当作前置 blocker 信号，而不是用 story 文件推断代码已存在。
- 本 Story 不要求修改 planning artifacts、owning SPECs、ADR 或前序 story 文件。若实现时发现 contract 缺口，需要先走 correct-course / SPEC update，而不是在代码中发明新 public JSON 字段、issue category 或 target id。

## Checklist Validation Notes（检查清单自检记录）

- Story 明确包含 user story、BDD-style acceptance criteria、tasks / subtasks、architecture requirements、implementation anchors、scope boundary、previous story intelligence、contract notes、testing requirements 和 references。
- 已防止主要 LLM dev 风险：重复实现 manifest parser、绕过 CommandResult schema、将 status 变成 validate、按发现顺序输出 issues、泄露 absolute path/hash/timestamp、把 validate 做成有副作用命令、提前实现 Epic 4/5/6 或 Post-MVP 能力。
- 已明确当 root implementation scaffold 不存在时应停止实现并先完成前置 stories，不得创建孤立 scaffold。
- 已明确 human-readable 与 `--json` 的分工：human-readable 可按 terminal width 降级，Structured JSON 不受 presentation 环境影响。

## Dev Agent Record（开发 Agent 记录）

### Agent Model Used（使用模型）

GPT-5 Codex

### Debug Log References（调试日志引用）

- N/A for story creation.

### Completion Notes List（完成备注）

- Ultimate context engine analysis completed - comprehensive developer guide created.
- Story created from live Epic 3 shard, PRD, Architecture, UX, owning SPECs and previous Story 3.5 context.
- No code implementation was performed.

### File List（文件列表）

- `_bmad-output/implementation-artifacts/3-6-validation-progress-category-coverage-and-local-determinism.md`
