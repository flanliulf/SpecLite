# Story 3.2: Manifest And Index Schema Validation（Manifest 与索引 Schema 验证）

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story（故事）

作为工具链维护者，  
我希望运行 `speclite validate` 时能够验证 manifest、skill index、help index 和 files index 的结构与版本，  
以便确认当前安装投影可被后续 `status`、`validate`、`update` 和 IDE adapter 稳定读取。

## Acceptance Criteria（验收标准）

1. **Manifest schema and installed-state projection are validated（Manifest Schema 与已安装状态投影被验证）**  
   **前提** 目标项目中存在 `_speclite/_config/manifest.yaml`；  
   **当** 用户运行 `speclite validate`；  
   **则** 系统必须验证 manifest schema version、必需字段、source descriptor projection、installed modules、IDE targets、关键路径和 installed-state projection shape；  
   **并且** 缺失、不可读、schema version 不兼容或 required field malformed 时，必须报告 `manifest-schema` category issue；  
   **并且** 不得把 manifest/index schema 问题报告为 `file-integrity`、`ide-mirror`、`runtime-path` 或自由文本 issue。

2. **Older or incompatible schema versions produce stable migration diagnostics（旧版或不兼容 Schema 产生稳定迁移诊断）**  
   **前提** manifest、skill index、help index 或 files index 的 schema version 旧于当前支持版本，或不被当前 producer 支持；  
   **当** `validate` 判断需要迁移或无法继续读取；  
   **则** 需要迁移的旧版本必须报告 `issueId: "manifest-schema.migration-needed"`；  
   **并且** `details` 至少包含 `currentSchemaVersion`、`supportedSchemaVersion`、`migrationKind` 和 `manualActionRequired`；  
   **并且** MVP producer 只能输出 `migrationKind: "manual"` 或 `"unsupported"`，不得输出 `"automated-available"`；  
   **并且** 不支持或未知版本必须使用 taxonomy 中的稳定 `manifest-schema` issue id，不得拼接版本、路径或时间戳进 issue id。

3. **Skill index validation preserves canonical skill identity（Skill Index 验证保留 Canonical Skill Identity）**  
   **前提** `_speclite/_config/skill-index.json` 存在；  
   **当** `validate` 检查 skill index；  
   **则** 系统必须验证 `schemaVersion`、`canonicalSkillId`、`moduleId`、`sourcePackagePath`、`canonicalPackageHash`、`installedTargets[]` 和 `phaseIds[]` 的 shape；  
   **并且** `canonicalSkillId` 必须来自 source-side canonical skill package，不得由 skill index 定义第二套 skill identity、alias-only identity 或 IDE-specific skill id；  
   **并且** `installedTargets[]` 必须只使用 adapter registry 声明的 MVP target ids 和 project-relative POSIX paths；  
   **并且** package-level hash 只能表示 canonical package equality，不得替代 files index 的 file-level hashes。

4. **Help index validation preserves menu-target contract（Help Index 验证保留菜单目标契约）**  
   **前提** `_speclite/_config/help-index.json` 存在；  
   **当** `validate` 检查 help index；  
   **则** 系统必须验证 help entry 只引用 `canonicalSkillId`、`phaseId`、`entryLabel`、`activationTarget` 和 `targetIds[]` 等 owning SPEC 声明的字段；  
   **并且** help index 不得创建 alternate skill ids、IDE-specific skill identities 或 alias-only identities；  
   **并且** `targetIds[]` 必须能在后续 `menu-target` / IDE mirror validation 中按 adapter registry canonical order 解析到 installed self-contained skill entry；  
   **并且** Story 3.2 只验证 schema 与引用 shape，不承担 Story 3.4 的完整 menu target 唯一解析。

5. **Files index validation preserves ownership and hash semantics（Files Index 验证保留 Ownership 与 Hash 语义）**  
   **前提** `_speclite/_config/files-index.json` 存在；  
   **当** `validate` 检查 files index；  
   **则** 系统必须验证 `schemaVersion`、`path`、`ownership`、`hash`、`hashAlgorithm`、`executable`、`artifactKind` 和 `sourceRef`；  
   **并且** `path` 必须是 project-relative POSIX path，`hashAlgorithm` 必须是 `sha256`，`ownership` 必须是 `installer-owned`、`human-owned` 或 `workflow-owned`；  
   **并且** file-level hash 基于 raw file bytes，line ending、executable bit、file mode、symlink handling 和 case conflict 必须作为独立 validation dimensions 保留，不得被 hash normalization 隐式吸收；  
   **并且** Story 3.2 只验证 files index schema 与 recorded hash field shape，不执行 Story 3.3 的 full file hash comparison。

6. **Missing or malformed manifest/index files use stable issue output（缺失或损坏的 Manifest/Index 使用稳定 Issue 输出）**  
   **前提** manifest、skill index、help index 或 files index 缺失、不可读、解析失败或缺少 required schema field；  
   **当** `validate` 生成诊断结果；  
   **则** 每个 finding 必须包含稳定 `issueId`、`category: "manifest-schema"`、`severity`、`affectedPath` 或 `component`、redaction-safe `details`、`impact` 和 `suggestedNextStep`；  
   **并且** `affectedPath` 必须使用 project-relative POSIX path，例如 `_speclite/_config/manifest.yaml`；  
   **并且** `details` 不得包含 absolute path、home directory、stack trace、raw parser error、timestamp、hash value、credential 或环境相关文本；  
   **并且** `CommandResult.issues` 排序必须遵守 severity order、canonical issue category order、normalized affected path、issue id。

7. **Validate command data remains deterministic and local-only（Validate Command Data 保持确定性与本地只读）**  
   **前提** 用户运行 `speclite validate --json`；  
   **当** manifest/index schema checks 完成；  
   **则** 输出必须使用 `CommandResult<ValidateCommandData>`，且 `validate.data.issueCounts` 固定包含 `info`、`warning`、`error`、`critical` 四个 key；  
   **并且** `checkedCategories` 至少在执行本 Story 检查时包含 `manifest-schema`，并遵守 canonical category order；  
   **并且** `checkedTargets` 如从 manifest/index 中读取 target，必须遵守 adapter registry canonical target order：`claude`，然后 `agents`；  
   **并且** `validatedPaths` 必须先规范化为 project-relative POSIX path，再按字典序输出；  
   **并且** `validate` 不得访问 npm registry、private registry、Git remote、offline bundle origin、package-manager cache、temporary extraction root 或 remote provenance service，也不得写入、删除、repair 或 normalize 项目文件。

## Tasks / Subtasks（任务 / 子任务）

- [ ] Task 1: 验证前置实现与当前仓库状态（AC: 1-7）
  - [ ] 确认 Epic 1 / Epic 2 的实际代码已建立 TypeScript CLI scaffold、`speclite validate` command hook、manifest/index generation、source descriptor projection、IDE adapter registry、diagnostics/output 和 fixture harness；不能只依据 story context 的 `ready-for-dev` 状态判断完成。
  - [ ] 如果 `package.json`、`src/`、`test/`、`tests/`、`src/bin/speclite.ts`、`src/commands/validate.ts`、`src/manifest/manifest-schema.ts`、`src/diagnostics/command-result-schema.ts`、`src/validation/validate-project.ts` 或 `src/ide/adapter-registry.ts` 尚不存在，先完成前置 stories；不得在 Story 3.2 中一次性重建全部 installer、status、IDE mirror 或 update pipeline。
  - [ ] 修改前完整读取所有 UPDATE files，尤其是 `src/manifest/manifest-schema.ts`、`src/validation/rules/manifest-schema.ts`、`src/validation/validate-project.ts`、`src/diagnostics/command-result-schema.ts`、`src/diagnostics/command-result.ts`、`src/diagnostics/output.ts`、`src/fs/path-normalizer.ts` 和 `src/ide/adapter-registry.ts`。
  - [ ] 检查 worktree dirty 状态，保留与本 Story 无关的 planning artifacts、story 文件、sprint status 或用户改动；不得格式化、重写、同步或回滚无关文件。

- [ ] Task 2: 建立 manifest/index executable schemas（AC: 1-5）
  - [ ] 在 `src/manifest/manifest-schema.ts` 或既有 manifest schema anchor 中集中定义 manifest、skill index、help index、files index 和必要 phase coverage projection 的 runtime schemas；不要在 command 或 validation rule 中 hand-roll 第二套字段检查。
  - [ ] 固定 MVP schema version constants：`speclite.manifest.v1`、`speclite.skill-index.v1`、`speclite.help-index.v1`、`speclite.files-index.v1`，以及同一 parser anchor 已覆盖时的 `speclite.phase-coverage.v1`。
  - [ ] schema parser 必须区分 consumer tolerance 与 producer output：consumer 可以容忍未来 optional fields；producer 不得输出 owning SPEC 未声明的 public fields。
  - [ ] YAML/JSON parsing 必须复用前置 stories 已选 parser 与 error wrapping pattern；不要为了 Story 3.2 引入新 parser dependency。
  - [ ] 所有 path fields 在 schema normalization 后必须使用 project-relative POSIX path；不得允许 absolute path、home directory、drive letter、OS-specific separator 或 checkout-root-dependent path 进入 public JSON / fixture snapshots。

- [ ] Task 3: 实现 manifest-schema validation rule（AC: 1, 2, 6, 7）
  - [ ] 在 `src/validation/rules/manifest-schema.ts` 或既有 rule module 中实现 local-only schema validation，读取 `_speclite/_config/manifest.yaml`、`skill-index.json`、`help-index.json` 和 `files-index.json`。
  - [ ] Rule 只产出 `ValidationIssue[]` 和 deterministic checked path evidence；不直接渲染 human-readable 文案、不决定 exit code、不执行 repair、不写文件。
  - [ ] 对 missing required artifact、parse failure 或阻塞 installed-state read 的 corruption，使用 taxonomy 已保留的 `manifest-schema.schema-corruption`，并通过 `details.artifactKind` / `details.reason` 表达稳定机器上下文。
  - [ ] 对缺少 schema version 的 artifact 使用 `manifest-schema.missing-version`；对不支持版本使用 `manifest-schema.unsupported-version`；对需要迁移的旧版本使用 `manifest-schema.migration-needed`；对 required field shape 错误使用 `manifest-schema.malformed-field`。
  - [ ] 不新增 `manifest-schema.missing-file` 等未在 taxonomy 中保留的 producer issue id。若实现确实需要新的 issue id，停止并先请求更新 owning SPEC / taxonomy / fixtures。
  - [ ] `manifest-schema.migration-needed.details` 必须至少包含 `currentSchemaVersion`、`supportedSchemaVersion`、`migrationKind`、`manualActionRequired`；MVP producer 只能输出 `manual` 或 `unsupported`。

- [ ] Task 4: 验证 skill/help/files index 的领域约束（AC: 3-5）
  - [ ] Skill index 必须验证 `canonicalSkillId`、`moduleId`、`sourcePackagePath`、`canonicalPackageHash`、`installedTargets[]`、`phaseIds[]`，并确认不定义第二套 skill identity。
  - [ ] Skill index 的 `installedTargets[]` 必须只引用 adapter registry 中的 `claude` / `agents` target id；不得输出 branded `copilot`、`cursor` 或未知 target id。
  - [ ] Help index 必须验证 help entries 只引用 canonical skill id、phase、entry label、activation target 和 target ids；不得把 menu label 当成 skill identity。
  - [ ] Files index 必须验证 ownership、file-level hash field、`hashAlgorithm: "sha256"`、`executable` intent、`artifactKind`、`sourceRef` 和 path policy。
  - [ ] Files index validation 只检查 recorded field shape 和 policy；full current file hash comparison、IDE mirror drift 和 missing installed files 属于 Story 3.3，不在 Story 3.2 中提前实现。
  - [ ] Source references 只检查 recorded source/package reference shape；不得访问 remote source、npm registry、Git remote、offline bundle origin 或 project-external staging/cache path。

- [ ] Task 5: 接入 validate orchestration 和 CommandResult projection（AC: 6, 7）
  - [ ] `src/commands/validate.ts` 只做参数解析、project root resolution、调用 `validateProject` / equivalent domain service，并返回 `CommandResult<ValidateCommandData>`。
  - [ ] `src/validation/validate-project.ts` 或 equivalent aggregator 必须把 manifest-schema rule 纳入 canonical issue category order；部分执行时仍保留相对顺序。
  - [ ] `ValidateCommandData.issueCounts` 必须固定包含 `info`、`warning`、`error`、`critical` 四个 key，包括 0 值。
  - [ ] `checkedCategories` 仅列出实际执行的 categories；执行本 Story rule 时必须包含 `manifest-schema`，且不得由 object key order、rule registration order 或 async completion order 决定排序。
  - [ ] `checkedTargets` 如可从 manifest/index 读取，必须按 adapter registry order 输出；读取失败时不要伪造 targets。
  - [ ] `validatedPaths` 必须包含实际检查过的 manifest/index path，按 normalized project-relative POSIX path 字典序输出。
  - [ ] Human-readable validate output 使用 shared diagnostics/output layer；不得在 command 或 rule 内自行拼接 issue layout、path display、summary 或 next action ordering。

- [ ] Task 6: 编写 focused tests、integration tests 和 fixture assertions（AC: 1-7）
  - [ ] Unit tests 覆盖 manifest/index schema version：valid v1、missing version、unsupported version、migration-needed old version、malformed required field、parse failure。
  - [ ] Unit tests 覆盖 `manifest-schema.migration-needed.details` 的 required keys、MVP `migrationKind` producer restriction 和 redaction-safe details。
  - [ ] Unit tests 覆盖 skill index canonical identity：不允许 alternate skill id、alias-only identity、IDE-specific identity、未知 target id 或 branded `copilot` / `cursor` target id。
  - [ ] Unit tests 覆盖 help index shape：`canonicalSkillId`、phase、entry label、activation target、target ids，以及不把 `entryLabel` 当成 identity。
  - [ ] Unit tests 覆盖 files index shape：project-relative POSIX `path`、`ownership` enum、`hashAlgorithm: "sha256"`、`executable` boolean、`artifactKind`、`sourceRef`。
  - [ ] Unit tests 覆盖 `ValidateCommandData.issueCounts` 四 key 固定输出、`checkedCategories` canonical order、`checkedTargets` adapter order、`validatedPaths` lexicographic order。
  - [ ] Negative tests 断言 validate 不访问 remote source、不执行 full hash scan、不写入/repair、不触发 update planner、不读取 package-manager cache 或 temporary extraction root。
  - [ ] Integration / fixture tests 覆盖 valid installed config、missing manifest、missing skill/help/files index、unsupported schema version、migration-needed schema、malformed JSON/YAML 和 malformed required fields。
  - [ ] 重复运行相同 validate fixture 至少 3 次，确认 issue id、category、severity、affected path、details、issueCounts、checkedCategories、checkedTargets 和 validatedPaths 的语义内容稳定。

- [ ] Task 7: 本地验证与范围控制（AC: 1-7）
  - [ ] 运行 `npm run build`。
  - [ ] 运行 `npm test`，或至少运行 manifest schema parser、validation rule、CommandResult projection 和 validate integration focused tests。
  - [ ] 如果前置 implementation 尚未完成，保留失败为有效前置信号；不要伪造 fixture pass 或创建孤立 validate-only scaffold。
  - [ ] 检查 diff，确认没有修改 `_bmad-output/planning-artifacts/`、其他 story 文件或无关用户改动。
  - [ ] 检查 diff，确认没有实现 Story 3.3 的 full file hash comparison / IDE mirror drift、Story 3.4 的 runtime/menu/legacy/artifact validation、Story 3.5 的全量 CommandResult 迁移、Story 3.6 的完整 progress/category coverage、Epic 4 update/repair write behavior、Epic 5 remote freshness/provenance checks 或 Epic 6 release fixture matrix。

## Dev Notes（开发备注）

### Current Repository State（当前仓库状态）

- 创建本 Story 时，仓库根目录未发现 `package.json`、`src/`、`test/`、`tests/` 或 root `fixtures/` 实现目录。Story 3.2 的开发必须在 Epic 1 / Epic 2 的实际代码完成后进行。
- `_bmad-output/implementation-artifacts/1-1-cli-install-entry-and-runtime-guard.md` 到 `1-6-install-progress-and-ready-summary.md`，以及 `2-1` 到 `2-5` 当前是 `ready-for-dev` story context，不是完成后的代码证据。
- 当前 worktree 已存在与本 Story 创建无关的 dirty planning artifacts、`sprint-status.yaml` 改动和未跟踪 Epic 1 / Epic 2 / 3-1 story 文件。实现 Story 3.2 时不得格式化、重写、同步或回滚这些无关改动。
- `_bmad-output/project-context.md` 当前仍是初始化占位内容；实际 implementation guardrails 以 live PRD、Architecture、UX、ADR 和 owning SPEC artifacts 为准。
- `assets/source/speclite/` 已存在，并包含 bundled source assets、module metadata、module help catalog、custom stubs、legacy Python resolver scripts 和 canonical skill packages。Manifest/index validation 必须读取 installed projection，不得把 source checkout 当成 installed state。

### Previous Story Intelligence（前一 Story 延续约束）

- Story 3.1 明确把 `status` 定义为 lightweight installed-state summary：只输出 high-level health、source/version、manifest presence、installed modules、IDE target summary、key paths 和 next actions，不输出 `issueCounts`、`checkedCategories`、`checkedTargets`、`validatedPaths` 或 full validation issue coverage。
- Story 3.2 是 `speclite validate` 的 manifest/index schema validation，不得把详细 issue set 回灌到 `status`。Automation 若需要可修复问题列表，应运行 `validate`。
- Story 3.1 要求 status 可复用 manifest/index/source descriptor parser anchors，但不得在 status command 内复制 manifest field contract。Story 3.2 应把 parser/schema anchor 做实，供 status、validate、update 和 fixtures 复用。
- Story 3.1 已强调 target vocabulary 分层：installed phase coverage 使用 `mapped` / `unsupported` / `failed`，status summary 使用 `not-configured` / `configured` / `partial` / `failed`。Story 3.2 验证 index 中的 target projections 时必须继续保持 layer-scoped types，不得混用词义。
- Story 3.1 的范围排除了 Story 3.2-3.6 的 full validate coverage。Story 3.2 可以引入 `manifest-schema` validation rule 和 validate data projection，但不要提前实现后续 stories 的 categories。

### Git Intelligence Summary（Git 历史摘要）

- 最近 5 个 commit 均为 docs/context/source/spec cleanup 类变更：`style(docs): 清理参考文档尾随空白`、`docs(context): 初始化项目上下文文档`、`docs(source): 同步内置源资产路径说明`、`docs(glossary): 整理术语目录与文档索引`、`docs(specs): 收敛 MVP 契约与实现锚点`。
- 当前可引用的实现模式主要来自 live planning artifacts 和 owning SPECs，而不是已提交 TypeScript implementation；dev agent 不得从这些 docs commit 推断源码已经存在。
- 由于当前 repository implementation scaffold 尚未出现，Story 3.2 实现前必须重新检查 git history 和 worktree，确认 Epic 1 / Epic 2 代码是否已经由其他 agent 添加。

### Scope Boundary（范围边界）

- 本 Story 只负责 manifest/index schema version、required field shape、canonical skill identity、help index reference shape、files index ownership/hash field shape、stable `manifest-schema` issues、validate command data 的最小 deterministic projection 和 focused tests。
- 本 Story 不负责：
  - Epic 1 的 CLI scaffold、install source discovery、module selection、config initialization、manifest/index generation、IDE mirror writes 或 install ready summary。
  - Epic 2 的 methodology discovery metadata、skill entry mapping、phase coverage generation、activation target validation、`speclite resolve` runtime support 或 workflow artifact metadata validation。
  - Story 3.1 的 lightweight `speclite status` UX 或 high-level health aggregation。
  - Story 3.3 的 IDE mirror drift detection、current file hash comparison、canonical package cross-target equality validation 或 full files index drift scan。
  - Story 3.4 的 runtime path、menu target uniqueness、legacy namespace residue、artifact path boundary 或 symlink/path escape validation。
  - Story 3.5 的 complete CommandResult / ValidationIssue contract migration across all commands.
  - Story 3.6 的 full validation progress, category coverage, issueCounts matrix, checkedTargets, validatedPaths and issue ordering coverage beyond what Story 3.2 directly produces.
  - Epic 4 update/repair write planning, safe write, operation lock enforcement, update conflicts or repair actions.
  - Epic 5 remote freshness/provenance revalidation, source lockfile lifecycle or enterprise source policy.
  - Epic 6 full release gate fixture matrix beyond focused manifest/index validation fixtures.
  - Post-MVP `doctor`, `sync`, `uninstall`, top-level `repair`, migration tooling, governance dashboard, coverage percentage, trend report, command pointer artifacts or dedicated Copilot/Cursor adapters.

### Architecture Requirements（架构要求）

- Runtime baseline 保持 Node.js 22 minimum 和 Node.js 24 recommended。除非已有 Node 22-compatible path 并同步更新 runtime policy / fixtures，否则不得使用 Node 24-only API。
- CLI foundation 保持 TypeScript + commander。不要为本 Story 引入 oclif/yargs/cac/clipanion。
- Storage model 是 local-first filesystem。不要引入 database、web service、daemon、REST API、GraphQL、desktop UI、persistent cache server 或 background process。
- `src/commands/validate.ts` 只负责 orchestration。Manifest/index parsing 属于 `src/manifest/`；target id/order belongs to `src/ide/`; issue model and projection belongs to `src/diagnostics/` and `src/validation/`; path normalization belongs to `src/fs/`.
- Runtime schema validation 如已在前置 stories 中使用 `zod@4.4.3`，继续复用同一 dependency 和 style；不要为了 Story 3.2 引入新 schema library。
- All public paths in command output, issues, details, fixtures and manifest/index projections must be project-relative POSIX-style unless an owning SPEC explicitly marks a field as redacted/non-stable.
- Human-readable output and `--json` output must share the same semantic model. Renderer modules must not invent a second issue shape, command status, path policy or sorting policy.

### Implementation Anchors（实现锚点）

需要创建或扩展的 implementation anchors，实际命名应贴合已有实现：

- `src/bin/speclite.ts` 通过 commander 注册 `speclite validate`。
- `src/commands/validate.ts` 拥有 command orchestration，并返回 `CommandResult<ValidateCommandData>`。
- `src/manifest/manifest-schema.ts` 拥有 manifest、skill index、help index、files index 和 phase coverage projection 的 executable schemas/parsers。
- `src/validation/rules/manifest-schema.ts` 拥有 Story 3.2 的 `manifest-schema` validation rule。
- `src/validation/validate-project.ts` 拥有 validation aggregation、checkedCategories / checkedTargets / validatedPaths collection 和 deterministic sorting。
- `src/diagnostics/command-result-schema.ts` 拥有 `CommandResult`、`ValidationIssue`、`ValidateCommandData` 和 command id validation。
- `src/diagnostics/command-result.ts` 拥有 status/exit-code projection，且必须根据 issues severity 推导 validate command status。
- `src/diagnostics/output.ts` 拥有 Evidence human-readable validate rendering 与 Structured JSON rendering。
- `src/fs/path-normalizer.ts` 拥有 project-relative POSIX path normalization。
- `src/ide/adapter-registry.ts` 拥有 canonical target order 和 target id validation。

如果这些文件已经由前置 stories 创建，修改前必须完整阅读并保留既有行为。如果它们因为前置 stories尚未实现而不存在，停止 Story 3.2 实现并先完成前置条件，不要构建一个孤立的 manifest-schema-only scaffold。

### Manifest And Index Contract Notes（Manifest 与 Index 契约备注）

- Covered installed artifacts：
  - `_speclite/_config/manifest.yaml`
  - `_speclite/_config/skill-index.json`
  - `_speclite/_config/help-index.json`
  - `_speclite/_config/files-index.json`
  - `_speclite/_config/phase-coverage.json` when the shared manifest parser already covers the minimum phase coverage matrix.
- MVP schema versions：
  - `speclite.manifest.v1`
  - `speclite.skill-index.v1`
  - `speclite.help-index.v1`
  - `speclite.files-index.v1`
  - `speclite.phase-coverage.v1`
- Canonical target ids and order are owned by adapter registry: `claude`, then `agents`. Manifest/index validation must reject unknown or branded `copilot` / `cursor` target ids in MVP producer output.
- Skill index required fields are `schemaVersion`, `canonicalSkillId`, `moduleId`, `sourcePackagePath`, `canonicalPackageHash`, `installedTargets[]`, `phaseIds[]`.
- Help index required fields are `schemaVersion`, `phaseId`, `entryLabel`, `canonicalSkillId`, `activationTarget`, `targetIds[]`.
- Files index required fields are `schemaVersion`, `path`, `ownership`, `hash`, `hashAlgorithm`, `executable`, `artifactKind`, `sourceRef`.
- `canonicalPackageHash` validates package-level equality across IDE targets. File-level hashes in files index validate installed file drift and update/repair safety. Do not collapse these two hash layers.

### Validation Issue Mapping（Validation Issue 映射）

Use only reserved MVP issue ids from the taxonomy unless the owning SPEC is updated first:

- `manifest-schema.missing-version`: artifact exists but `schemaVersion` is absent or empty.
- `manifest-schema.unsupported-version`: artifact declares a schema version the current implementation cannot consume and no migration path is available.
- `manifest-schema.migration-needed`: artifact declares an older or incompatible schema where manual/unsupported migration must be reported.
- `manifest-schema.malformed-field`: artifact has invalid required field type, enum value, path policy, missing required field, or invalid cross-field shape.
- `manifest-schema.schema-corruption`: artifact is missing when required for installed-state validation, unreadable, parse-failed, or too corrupt to produce field-level diagnostics.

Stable details suggestions:

```ts
type ManifestSchemaIssueDetails = {
  artifactKind: "manifest" | "skill-index" | "help-index" | "files-index" | "phase-coverage";
  expectedSchemaVersion?: string;
  currentSchemaVersion?: string;
  supportedSchemaVersion?: string;
  migrationKind?: "manual" | "unsupported";
  manualActionRequired?: boolean;
  field?: string;
  reason:
    | "missing-required-artifact"
    | "parse-failed"
    | "missing-version"
    | "unsupported-version"
    | "migration-needed"
    | "missing-required-field"
    | "invalid-field"
    | "invalid-target-id"
    | "invalid-path"
    | "invalid-ownership"
    | "invalid-hash-algorithm";
};
```

Do not include raw parser exceptions, stack traces, absolute paths, timestamps, hash values, home directories or credentials in `details`.

### Validate Data Contract（Validate 数据契约）

Minimum `ValidateCommandData` shape:

```ts
type ValidationIssueCounts = {
  info: number;
  warning: number;
  error: number;
  critical: number;
};

type ValidateCommandData = {
  issueCounts: ValidationIssueCounts;
  checkedCategories: IssueCategory[];
  checkedTargets: string[];
  validatedPaths: string[];
};
```

Rules:

- `issueCounts` must include all four severity keys, even when value is 0.
- `checkedCategories` must use canonical category order and include only executed categories.
- `checkedTargets` must use adapter registry canonical target order.
- `validatedPaths` must be normalized project-relative POSIX paths sorted lexicographically.
- `CommandResult.issues` must be sorted by severity order, category order, normalized affected path, issue id.
- `validate` failures with error/critical issues must produce `CommandResult.status: "failure"` and non-zero exit code.
- `validate` warnings only must produce `CommandResult.status: "warning"` and exit code 0.
- Human-readable output cannot be the only carrier for automation-relevant fields.

### Local-Only And No-Write Boundary（本地只读与禁止写入边界）

`speclite validate` for Story 3.2 may read:

- `_speclite/_config/manifest.yaml`
- `_speclite/_config/skill-index.json`
- `_speclite/_config/help-index.json`
- `_speclite/_config/files-index.json`
- `_speclite/_config/phase-coverage.json` if the shared manifest parser covers it
- `_speclite` path presence required to find the installed-state config root
- `.claude/skills` and `.agents/skills` only as shallow target path references if needed for target id/path shape, not for full mirror drift checks

`speclite validate` for Story 3.2 must not:

- access npm registry, private registry, Git remote, offline bundle origin, package-manager cache, temporary extraction root or remote provenance service;
- execute full `speclite status`, implicit update check, update plan or repair plan;
- calculate current file hashes across installed files or IDE mirrors;
- compare IDE mirrors against canonical package content;
- write, delete, chmod, normalize, format, repair or regenerate project files;
- acquire write operation lock as if it were a write-capable command.

### Output UX Requirements（输出体验要求）

- Default human-readable `validate` should use Evidence profile, not the Compact status profile.
- Issue rows must show severity, category, issue id, affected path or component, impact and suggested next step.
- Missing or malformed manifest/index files should lead with the actionable issue, not a raw parser error.
- Empty issue state must be explicit; however, `No issues found` is only valid for categories actually checked.
- Output must work under `NO_COLOR`, non-TTY, CI and narrow terminal. Color, symbol or table layout must never be the only carrier of severity, issue id, path or next action.
- `--json` output must not include ANSI escape, icons, terminal-width formatting, local absolute paths, home directory, cache paths, temporary extraction paths, timestamps or non-deterministic ordering.

### Testing Requirements（测试要求）

- Schema parser tests:
  - valid v1 manifest/index artifacts parse successfully.
  - missing `schemaVersion` maps to `manifest-schema.missing-version`.
  - unsupported schema version maps to `manifest-schema.unsupported-version`.
  - old version needing migration maps to `manifest-schema.migration-needed`.
  - malformed required field maps to `manifest-schema.malformed-field`.
  - missing required artifact or parse failure maps to `manifest-schema.schema-corruption`.
- Identity and target tests:
  - skill index does not define alternate identity.
  - help index references canonical skill id only.
  - unknown target id and branded `copilot` / `cursor` target ids are rejected for MVP producer output.
  - `checkedTargets` order is `claude`, then `agents`.
- Path and redaction tests:
  - accepted paths are project-relative POSIX.
  - absolute path, home directory, Windows separator, drive letter and checkout-root-dependent path are rejected or redacted according to owning SPEC.
  - `ValidationIssue.details`, `impact` and `suggestedNextStep` do not contain dynamic path/hash/time/source text.
- Determinism tests:
  - repeated validate fixture runs produce stable issue arrays, issueCounts, checkedCategories, checkedTargets and validatedPaths.
  - arrays do not depend on filesystem traversal, object key order, validation rule registration order or async completion.
- Boundary tests:
  - Story 3.2 validate rule does not invoke full file hash scan, IDE mirror drift comparison, remote source resolver, update planner, repair planner or write filesystem operations.

### Latest Technical Information（最新技术信息）

本 Story 不需要引入或升级外部依赖。遵守仓库中 Architecture 已固定的平台与契约：

- Node.js 22 LTS minimum，Node.js 24 LTS recommended。
- TypeScript + commander CLI foundation。
- Runtime schema validation 如已存在，复用 `zod@4.4.3`。
- 复用前置 implementation stories 已选择的 YAML/JSON/TOML/CSV parser；不要为了 manifest-schema validation 添加新 parser 或新 CLI framework。

Story 3.2 是受契约约束的本地 schema validation 能力，不应在本实现中追逐最新 dependency version。如果确实需要 dependency 变更，必须停止并在单独授权的变更中更新 owning Architecture / SPEC / fixtures。

### Project Context Reference（项目上下文引用）

- `_bmad-output/project-context.md` 当前存在，但只包含初始化占位内容。不要把它当作完整 implementation rule source。
- 本 Story 的 live source of truth 是 Epic 3 shard、PRD status/validation FR/NFR、Architecture implementation mapping、UX control-plane guidance，以及 `_bmad-output/planning-artifacts/specs/` 下的 owning SPECs。

## References（参考）

- `_bmad-output/project-context.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/implementation-artifacts/3-1-lightweight-install-status-summary.md`
- `_bmad-output/planning-artifacts/epics/06-epic-3-installed-state-and-deterministic-validation已安装状态与确定性验证.md`
- `_bmad-output/planning-artifacts/prd/10-functional-requirements功能需求.md`
- `_bmad-output/planning-artifacts/prd/11-non-functional-requirements非功能需求.md`
- `_bmad-output/planning-artifacts/architecture/03-core-architectural-decisions核心架构决策.md`
- `_bmad-output/planning-artifacts/architecture/04-implementation-patterns-consistency-rules实现模式与一致性规则.md`
- `_bmad-output/planning-artifacts/architecture/05-project-structure-boundaries项目结构与边界.md`
- `_bmad-output/planning-artifacts/ux-design-specification.md`
- `_bmad-output/planning-artifacts/specs/README.md`
- `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md`
- `_bmad-output/planning-artifacts/specs/02-source-descriptor-contract.md`
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
