# Story 3.4: Runtime Path, Menu Target, Legacy Entry And Artifact Path Validation（运行时路径、菜单目标、遗留入口与产物路径验证）

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story（故事）

作为工具链维护者，  
我希望 `speclite validate` 能检查 runtime path、menu target、legacy namespace residue、遗留入口冲突和 artifact path，  
以便快速定位安装漂移、重复加载、菜单冲突或产物路径不可用的问题。

## Acceptance Criteria（验收标准）

1. **Runtime paths point only at the current `_speclite` namespace（Runtime Path 只指向当前 `_speclite` 命名空间）**  
   **前提** manifest、skill index、installed skill entry 或 runtime resolver metadata 记录了 runtime path；  
   **当** 用户运行 `speclite validate`；  
   **则** 系统必须确认 runtime path 可解析到目标项目内的当前 `_speclite` metadata/control hub 或 installer-owned runtime script；  
   **并且** 缺失 runtime entry 必须报告 `issueId: "runtime-path.missing-entry"`；  
   **并且** malformed、absolute、project-external、drive-letter、OS-specific separator 或非 POSIX public path 必须报告 `runtime-path.invalid-script-path`；  
   **并且** 指向 `_bmad`、旧 resolver、旧 runtime namespace 或 legacy config path 的 installed entry 必须报告 `runtime-path.legacy-resolver-path`；  
   **并且** symlink 解析后逃出 target project boundary 时必须报告 `runtime-path.symlink-escape`，不得把 escaped absolute path 写入 public JSON。

2. **Menu targets resolve to exactly one installed self-contained skill entry（Menu Target 精确解析到一个已安装自包含 Skill Entry）**  
   **前提** `_speclite/_config/help-index.json`、module help catalog projection、phase coverage 或 discovery metadata 中存在 menu target / activation target；  
   **当** `validate` 解析该 target；  
   **则** 每个 target 必须通过 `canonicalSkillId` 和 adapter registry target id 解析到唯一 installed self-contained skill entry；  
   **并且** missing activation target 必须报告 `menu-target.missing-target`；  
   **并且** 同一 menu target 解析到多个 installed entries 时必须报告 `menu-target.ambiguous-target`；  
   **并且** help entry 引用未知 `canonicalSkillId` 时必须报告 `menu-target.unknown-skill`；  
   **并且** phase coverage row 没有可映射 target 时必须报告 `menu-target.no-mapped-target`；  
   **并且** MVP 只能使用 adapter registry target ids `claude` 和 `agents`，不得输出 branded `copilot`、`cursor` 或自由文本 target id。

3. **Legacy namespace residue is reported without deleting user files（遗留命名空间残留只报告不删除）**  
   **前提** 目标项目中存在旧版 runtime namespace、stale copied skill entry、legacy generated structure 或旧 config reference；  
   **当** `validate` 发现它与当前 canonical skill id、installed target directory 或 runtime/config lookup path 重叠；  
   **则** 系统必须报告 `legacy-namespace` category issue；  
   **并且** old runtime namespace residue 使用 `legacy-namespace.runtime-residue`；  
   **并且** stale copied skill entry 与当前 canonical id 或 target entry 重叠时使用 `legacy-namespace.stale-skill-entry`；  
   **并且** installed skill 仍引用 legacy config path 时使用 `legacy-namespace.legacy-config-reference`；  
   **并且** inert residue 可为 `warning`，可能导致 duplicate loading、wrong activation 或能力漂移时必须为 `error`；  
   **并且** `validate` 不得删除、移动、重写或 chmod 用户目录中的 legacy files。

4. **Legacy suggested next steps are actionable and manual-safe（Legacy 建议动作可执行且人工安全）**  
   **前提** `validate` 产生 legacy entry 或 legacy namespace issue；  
   **当** 系统生成 `impact`、`suggestedNextStep` 和 human-readable output；  
   **则** 输出必须提供 project-relative `affectedPath`、稳定 `riskKind`、manual action 和 verification command；  
   **并且** `suggestedNextStep` 必须使用稳定短句模板，不包含 dynamic path、target id、hash、timestamp 或 absolute local path；  
   **并且** human-readable reporter 可以在结构化 JSON 外展示更丰富说明，但仍必须保留 issue id、category、severity、affected path、impact 和 suggested next step。

5. **Artifact root and default output paths stay inside the target project（Artifact Root 与默认输出路径留在目标项目内）**  
   **前提** manifest、installed module metadata、workflow discovery metadata 或 artifact contract 记录了 configured artifact root、`artifactContract.defaultOutputPath` 或 artifact metadata location；  
   **当** `validate` 检查 artifact path；  
   **则** configured artifact root 和 default output path 必须是 project-relative POSIX path，并且解析后位于 target project boundary 内；  
   **并且** path escape 必须报告 `artifact-path.escapes-project`；  
   **并且** symlink escape 必须报告 `artifact-path.symlink-escape`；  
   **并且** required `_speclite-output` 或 configured artifact directory 缺失时必须报告 `artifact-path.missing-required-directory`；  
   **并且** production `speclite validate` 只能通过只读 metadata / permission classification 报告 `artifact-path.unwritable-directory`，不得执行实际写探测；  
   **并且** `artifact-path.fixture-write-failed` 只属于 fixture harness / test-only 行为，用于测试 fixture 在受控临时项目中写入 expected artifact 失败的场景，不得由 production validate 通过写入目标项目触发；  
   **并且** workflow artifact metadata 缺失或值域非法时必须报告 `artifact-path.missing-required-metadata` 或 `artifact-path.invalid-required-metadata`。

6. **Diagnostics are deterministic, local-only, and redaction-safe（诊断结果确定、本地只读且可脱敏）**  
   **前提** `validate` 检查 runtime、menu、legacy 和 artifact path 问题；  
   **当** 输出 human-readable 和 `--json` 结果；  
   **则** issues 必须复用统一 `ValidationIssue` model，包含稳定 `issueId`、`category`、`severity`、`affectedPath` 或 `component`、redaction-safe `details`、`impact` 和 `suggestedNextStep`；  
   **并且** `details`、`impact`、`suggestedNextStep` 不得包含 absolute path、home directory、environment variable value、credential、stack trace、raw exception、timestamp、hash、random id、temporary path 或 cache path；  
   **并且** `validate.data.checkedCategories` 必须按 canonical order 包含实际执行的 `runtime-path`、`menu-target`、`legacy-namespace` 和/或 `artifact-path`；  
   **并且** `validatedPaths` 必须使用 normalized project-relative POSIX path 并按字典序输出；  
   **并且** `validate` 不得访问 npm registry、private registry、Git remote、offline bundle origin、source checkout freshness service、package-manager cache 或 temporary extraction root。

## Tasks / Subtasks（任务 / 子任务）

- [ ] Task 1: 验证前置实现与当前仓库状态（AC: 1-6）
  - [ ] 确认 Epic 1 / Epic 2 / Story 3.1 / Story 3.2 / Story 3.3 的实际代码已经建立 TypeScript CLI scaffold、`speclite validate` command hook、manifest/index executable schemas、IDE adapter registry、files index/hash helpers、diagnostics/output、path normalization、validation aggregation、`src/fixtures/fixture-contract.ts` 和 fixture assets/tests；不能只依据 story context 的 `ready-for-dev` 状态判断完成。
  - [ ] 如果 `package.json`、`src/`、`test/`、`tests/`、`src/bin/speclite.ts`、`src/commands/validate.ts`、`src/manifest/manifest-schema.ts`、`src/ide/adapter-registry.ts`、`src/diagnostics/command-result-schema.ts`、`src/diagnostics/output.ts`、`src/validation/validate-project.ts` 或 `src/fs/path-normalizer.ts` 尚不存在，先完成前置 stories；不得在 Story 3.4 中创建孤立的 runtime/menu/artifact validator。
  - [ ] 修改前完整读取所有 UPDATE files，尤其是 `src/validation/rules/runtime-path.ts`、`src/validation/rules/menu-target.ts`、`src/validation/rules/legacy-namespace.ts`、`src/validation/rules/artifact-path.ts`、`src/validation/validate-project.ts`、`src/manifest/manifest-schema.ts`、`src/ide/adapter-registry.ts`、`src/diagnostics/command-result-schema.ts`、`src/diagnostics/command-result.ts`、`src/diagnostics/output.ts`、`src/fs/path-normalizer.ts` 和 `src/fs/safe-write.ts`。
  - [ ] 检查 worktree dirty 状态，保留与本 Story 无关的 planning artifacts、story 文件、sprint status 或用户改动；不得格式化、重写、同步或回滚无关文件。

- [ ] Task 2: 实现 runtime-path validation rule（AC: 1, 6）
  - [ ] 在 `src/validation/rules/runtime-path.ts` 或既有 validation rule anchor 中实现 runtime path validation；不要在 `src/commands/validate.ts` 中直接遍历路径或拼接 issue。
  - [ ] 从 manifest / skill index / installed entry metadata 读取 runtime path references，并复用 `src/fs/path-normalizer.ts` 进行 project-relative POSIX normalization、project boundary check 和 symlink resolution。
  - [ ] 只接受当前 `_speclite` runtime namespace、installer-owned runtime scripts 和已契约化 runtime support command path；不得接受 `_bmad`、legacy resolver script、source checkout script 或 target project 外 path 作为 installed runtime dependency。
  - [ ] 缺失 required runtime entry 输出 `runtime-path.missing-entry`；invalid script path 输出 `runtime-path.invalid-script-path`；legacy resolver/runtime reference 输出 `runtime-path.legacy-resolver-path`；symlink escape 输出 `runtime-path.symlink-escape`。
  - [ ] `details` 使用稳定机器上下文，例如 `runtimeRefKind`、`reason`、`namespaceKind`、`expectedNamespace: "_speclite"`；不得包含 raw absolute path、home directory、stack trace、hash 或 timestamp。
  - [ ] Runtime path validation 可以读取 installed state files，但不得调用 `speclite resolve`、status command、update planner 或 repair planner。

- [ ] Task 3: 实现 menu-target uniqueness validation（AC: 2, 6）
  - [ ] 在 `src/validation/rules/menu-target.ts` 或既有 rule module 中读取 help index、phase coverage、module help catalog projection 和 installed target mapping；schema/shape 错误继续由 Story 3.2 的 `manifest-schema` rule 负责。
  - [ ] 使用 `canonicalSkillId` 作为唯一 skill identity，使用 adapter registry target ids 和 canonical order：`claude`，然后 `agents`；不得从 `entryLabel`、menu code、IDE-specific basename 或 alias 重新推导 skill identity。
  - [ ] 对每个 help/menu target 验证它能解析到一个且只有一个 self-contained skill entry：`.claude/skills/<canonicalSkillId>/` 或 `.agents/skills/<canonicalSkillId>/`。
  - [ ] Missing target 输出 `menu-target.missing-target`；ambiguous target 输出 `menu-target.ambiguous-target`；unknown skill 输出 `menu-target.unknown-skill`；no mapped target 输出 `menu-target.no-mapped-target`。
  - [ ] Optional unsupported target 可以按 taxonomy 降级为 `warning`；用户显式选择或 required target 无法表示时必须为 `error`。
  - [ ] Tests 必须覆盖 duplicate menu code、duplicate canonical skill id projection、help index target id 与 adapter registry 不一致、phase coverage no mapped target，以及 `agents` 不被渲染为 Copilot/Cursor readiness。

- [ ] Task 4: 实现 legacy-namespace residue validation（AC: 3, 4, 6）
  - [ ] 在 `src/validation/rules/legacy-namespace.ts` 或既有 legacy validation anchor 中检查 known legacy runtime namespaces、legacy config references 和 stale IDE skill entries；不要全项目任意扫描并把无关历史目录当作错误。
  - [ ] 只在 legacy residue 与当前 installed canonical skill id、runtime/config lookup path、IDE target directory 或 activation/menu entry 重叠时报告 issue。
  - [ ] Old runtime namespace residue 输出 `legacy-namespace.runtime-residue`；stale skill entry overlap 输出 `legacy-namespace.stale-skill-entry`；legacy config reference 输出 `legacy-namespace.legacy-config-reference`。
  - [ ] `details` 使用稳定枚举，例如 `legacyKind`、`riskKind`、`overlapKind`、`manualActionRequired: true` 和 `verificationCommand: "speclite validate"`；不得把 dynamic path、target id、long prose 或 local absolute path 拼进 `suggestedNextStep`。
  - [ ] `validate` 必须只读：不得删除 legacy directory、不得重写 installed entry、不得迁移 config、不得调用 update/repair 写入路径。
  - [ ] Human-readable output 可以提示用户手动检查 affected path，但 structured `suggestedNextStep` 必须保持 stable template。

- [ ] Task 5: 实现 artifact-path validation（AC: 5, 6）
  - [ ] 在 `src/validation/rules/artifact-path.ts` 或既有 artifact validation anchor 中读取 manifest / module metadata / artifact contract / artifact metadata location；不要把 artifact content quality、叙事完整度或人工评审结论纳入 MVP validation。
  - [ ] 验证 configured artifact root 和 `artifactContract.defaultOutputPath` 是 project-relative POSIX path，并且解析后位于 target project boundary 内。
  - [ ] 验证 default output path 落在 `_speclite-output/` 或 configured workflow artifact root 下；不得接受 absolute path、home directory、drive letter、`..` escape、OS-specific separator 或 source/package-manager/cache/temp path。
  - [ ] Path escape 输出 `artifact-path.escapes-project`；symlink escape 输出 `artifact-path.symlink-escape`；required directory missing 输出 `artifact-path.missing-required-directory`；unwritable directory 输出 `artifact-path.unwritable-directory`；production validate 不得通过实际写探测触发这些 findings。
  - [ ] `artifact-path.fixture-write-failed` 只能由 fixture harness / test-only path 产生：fixture harness 可以在受控临时 fixture project 中尝试写入 expected artifact 来验证 workflow artifact loop；production `speclite validate` 不得写入 probe file、chmod、touch、copy 或 cleanup target project。
  - [ ] 验证 artifact metadata：Markdown frontmatter、sidecar JSON 或 directory `metadata.json` 必须包含 `workflowType`、`sourceSkill`、`generatedAt`；缺失输出 `artifact-path.missing-required-metadata`，值域非法输出 `artifact-path.invalid-required-metadata`。
  - [ ] `generatedAt` 可以被解析，但 stable fixture snapshot 必须 normalize 或 exclude 具体时间值；不要把 timestamp 写入 `ValidationIssue.details`。
  - [ ] Workflow-owned artifacts 不得被 update/repair 当作 installer-owned changed paths；artifact validation failure 不得触发 overwrite。

- [ ] Task 6: 接入 validate orchestration and deterministic projection（接入 Validate 编排与确定性投影）（AC: 1-6）
  - [ ] `src/commands/validate.ts` 继续只负责参数解析、project root resolution、调用 `validateProject` / equivalent domain service，并返回 `CommandResult<ValidateCommandData>`。
  - [ ] `src/validation/validate-project.ts` 或 equivalent aggregator 必须在 `manifest-schema` schema validation 之后执行 runtime/menu/legacy/artifact rules；如果 manifest/index 无法读取，后续 rules 不得伪造 installed state findings。
  - [ ] `checkedCategories` 只列出实际执行的 categories，并遵守 canonical issue category order：`environment`、`manifest-schema`、`source-integrity`、`ide-mirror`、`runtime-path`、`menu-target`、`legacy-namespace`、`artifact-path`、`file-integrity`、`operation-lock`、`update`。
  - [ ] `checkedTargets` 只列出实际检查的 targets，并遵守 adapter registry order：`claude`，然后 `agents`。
  - [ ] `validatedPaths` 必须包含实际检查过的 runtime files、help/phase coverage paths、target entry paths、legacy residue paths 或 artifact paths，全部规范化为 project-relative POSIX path 后按字典序输出。
  - [ ] `CommandResult.issues` 必须按 severity order、canonical issue category order、normalized affected path、issue id 排序；不得按发现顺序、rule execution order、filesystem traversal order 或 async completion order 输出。
  - [ ] Human-readable validate output 使用 shared diagnostics/output layer；不得在 validation rule 内自行拼接 issue layout、path display、summary 或 next action ordering。

- [ ] Task 7: 保持 local-only read-only validation boundary（保持本地只读验证边界）（AC: 1-6）
  - [ ] `speclite validate` 不得调用 remote source resolver、registry client、Git remote、offline bundle resolver、package-manager cache、temporary extraction root 或 source checkout freshness check。
  - [ ] `speclite validate` 不得调用 install/update planner、repair planner、safe write、target writer、manifest generator、artifact writer、chmod、copy-tree 或 cleanup mutation。
  - [ ] Validate 可以报告 stale lock warning，但不得删除 `_speclite/.lock` 或 stale temp files；write-capable command 的 operation lock 行为不属于本 Story。
  - [ ] 普通 `speclite update` 的确认或 `--yes` 不得修复 legacy/runtime/menu/artifact drift；可安全修复只属于后续 Epic 4 的 `update --repair` 明确授权路径。
  - [ ] 不得把同一个物理问题同时报告为多个 category；优先使用最具体 category，例如 menu resolution 用 `menu-target`，runtime reference 用 `runtime-path`，artifact root escape 用 `artifact-path`。

- [ ] Task 8: 编写 focused tests、integration tests 和 fixture assertions（AC: 1-6）
  - [ ] Runtime path tests 覆盖 missing `_speclite` runtime entry、invalid script path、legacy resolver path、symlink escape、valid current `_speclite` runtime path。
  - [ ] Menu target tests 覆盖 missing target、ambiguous target、unknown canonical skill、no mapped target、valid target 解析到 `.claude/skills/<canonicalSkillId>/` 和 `.agents/skills/<canonicalSkillId>/`。
  - [ ] Legacy namespace tests 覆盖 `_bmad`/旧 runtime residue、stale overlapping skill entry、legacy config reference、inert unrelated directory 不被误报、diagnostics 不删除 legacy files。
  - [ ] Artifact path tests 覆盖 valid `_speclite-output` root、configured artifact root、default output path、path escape、symlink escape、missing required directory、unwritable directory、fixture-harness write failure、metadata missing / invalid。
  - [ ] Redaction tests 覆盖 `ValidationIssue.details`、`impact`、`suggestedNextStep` 不包含 absolute path、home directory、Windows drive letter、environment variable value、hash、timestamp、temporary/cache path、stack trace 或 raw exception。
  - [ ] Determinism tests 重复运行相同 validate fixture 至少 3 次，确认 issue arrays、issueCounts、checkedCategories、checkedTargets、validatedPaths、nextActions 和 `--json` semantic output 稳定。
  - [ ] Boundary tests 断言 validate 不访问 remote source、不执行 update/repair/write/chmod、不扫描 package-manager cache 或 temporary extraction root、不写入 artifact metadata。
  - [ ] Integration / fixture tests 至少覆盖 `ide-drift`、`path-portability` 和最小 `skill-artifact-loop` 中的 runtime/menu/artifact path validation evidence。

- [ ] Task 9: 本地验证与范围控制（AC: 1-6）
  - [ ] 运行 `npm run build`。
  - [ ] 运行 `npm test`，或至少运行 runtime-path、menu-target、legacy-namespace、artifact-path、CommandResult projection、path normalization 和 validate integration focused tests。
  - [ ] 如果前置 implementation 尚未完成，保留失败为有效前置信号；不要伪造 fixture pass 或创建 validate-only fallback implementation。
  - [ ] 检查 diff，确认没有修改 `_bmad-output/planning-artifacts/`、其他 story 文件或无关用户改动。
  - [ ] 检查 diff，确认没有实现 Story 3.5 的全量 CommandResult 迁移、Story 3.6 的完整 progress/category coverage、Epic 4 update/repair apply behavior、Epic 5 remote freshness/provenance checks、Epic 6 release fixture matrix 或 Post-MVP command pointer / doctor / sync / uninstall 能力。

## Dev Notes（开发备注）

### Current Repository State（当前仓库状态）

- 创建本 Story 时，仓库根目录未发现 `package.json`、`package-lock.json`、`src/`、`test/`、`tests/` 或 root `fixtures/` 实现目录。Story 3.4 的开发必须在 Epic 1 / Epic 2 / Story 3.1 / Story 3.2 / Story 3.3 的实际代码完成后进行。
- `_bmad-output/implementation-artifacts/1-1` 到 `1-6`、`2-1` 到 `2-5`、`3-1`、`3-2` 和 `3-3` 当前是 `ready-for-dev` story context，不是完成后的代码证据。
- 当前 worktree 已存在与本 Story 创建无关的 `sprint-status.yaml` 改动、Epic 1 / Epic 2 / Epic 3 story 文件和 planning artifacts。实现 Story 3.4 时不得格式化、重写、同步或回滚这些无关改动。
- `_bmad-output/project-context.md` 当前仍是初始化占位内容；实际 implementation guardrails 以 live PRD、Architecture、UX、ADR 和 owning SPEC artifacts 为准。
- `assets/source/speclite/` 已存在，并包含 bundled source assets、module metadata、module help catalog、custom stubs、legacy Python resolver scripts 和 canonical skill packages。Story 3.4 validate 必须检查 installed projection 与 target project paths，不得把 source checkout 当成 installed runtime path 或 artifact root。

### Previous Story Intelligence（前序 Story 延续约束）

- Story 3.1 明确 `status` 是 lightweight installed-state summary，不执行 full validation category coverage，不输出 `issueCounts`、`checkedCategories`、`checkedTargets` 或 `validatedPaths`。Story 3.4 的 runtime/menu/legacy/artifact diagnostics 必须留在 `speclite validate`。
- Story 3.2 已把 manifest、skill index、help index、files index 和 phase coverage 的 schema/shape validation 放入 `manifest-schema` boundary。Story 3.4 不应重复实现 schema parser，也不应把 schema corruption 映射为 `runtime-path`、`menu-target`、`legacy-namespace` 或 `artifact-path`。
- Story 3.2 明确 help index 只验证 menu target shape，不承担完整 target 唯一解析。Story 3.4 正式拥有 menu target uniqueness、unknown skill、no mapped target 和 ambiguous target diagnostics。
- Story 3.3 已拥有 IDE mirror package-level drift detection 和 files index raw-byte integrity checks。Story 3.4 不应重复计算 canonical package hash 或 generic installer-owned file hash；只在 runtime/menu/legacy/artifact path 维度报告更具体的问题。
- Story 3.3 强调 `validate` local-only、read-only、deterministic。Story 3.4 发现 runtime path、legacy residue 或 artifact path 问题时只报告，不修复；repair 行为属于后续 Epic 4 的 `update --repair` 明确授权路径。

### Git Intelligence Summary（Git 历史摘要）

- 最近 5 个 commit 均为 docs/context/source/spec cleanup 类变更：`style(docs): 清理参考文档尾随空白`、`docs(context): 初始化项目上下文文档`、`docs(source): 同步内置源资产路径说明`、`docs(glossary): 整理术语目录与文档索引`、`docs(specs): 收敛 MVP 契约与实现锚点`。
- 当前可引用的实现模式主要来自 live planning artifacts、owning SPECs 和前序 story context，而不是已提交 TypeScript implementation；dev agent 不得从这些 docs commit 推断源码已经存在。
- 由于当前 repository implementation scaffold 尚未出现，Story 3.4 实现前必须重新检查 git history 和 worktree，确认前置代码是否已经由其他 agent 添加。

### Scope Boundary（范围边界）

- 本 Story 只负责 `speclite validate` 的 runtime path validation、menu target uniqueness validation、legacy namespace residue diagnostics、artifact root/default output path validation、artifact metadata presence/value checks、read-only reporting、deterministic projection 和 focused tests。
- 本 Story 不负责：
  - Epic 1 的 CLI scaffold、install source discovery、module selection、config initialization、manifest/index generation、IDE mirror writes 或 install ready summary。
  - Epic 2 的 methodology discovery metadata、skill entry mapping、phase coverage generation、activation target schema shape、`speclite resolve` runtime support 或 workflow artifact metadata generation。
  - Story 3.1 的 lightweight `speclite status` UX 或 high-level health aggregation。
  - Story 3.2 的 manifest/index schema validation、schema migration diagnostics 或 index required field parser。
  - Story 3.3 的 IDE mirror package-level hash comparison、files index raw-byte hash comparison、missing installer-owned file diagnostics 或 generic file integrity scan。
  - Story 3.5 的 complete CommandResult / ValidationIssue contract migration across all commands.
  - Story 3.6 的 full validation progress, category coverage, checked category/target/path display UX and global issue ordering beyond what Story 3.4 directly produces.
  - Epic 4 update/repair write planning, safe write, operation lock enforcement, update conflicts or repair apply behavior.
  - Epic 5 remote freshness/provenance revalidation, source lockfile lifecycle or enterprise source policy.
  - Epic 6 full release gate fixture matrix beyond focused runtime/menu/legacy/artifact path fixtures.
  - Post-MVP `doctor`, `sync`, `uninstall`, top-level `repair`, migration tooling, governance dashboard, command pointer artifacts or dedicated Copilot/Cursor adapters.

### Architecture Requirements（架构要求）

- Runtime baseline 保持 Node.js 22 minimum 和 Node.js 24 recommended。除非已有 Node 22-compatible path 并同步更新 runtime policy / fixtures，否则不得使用 Node 24-only API。
- CLI foundation 保持 TypeScript + commander。不要为本 Story 引入 oclif/yargs/cac/clipanion。
- Storage model 是 local-first filesystem。不要引入 database、web service、daemon、REST API、GraphQL、desktop UI、persistent cache server 或 background process。
- `src/commands/validate.ts` 只负责 orchestration。Manifest/index parsing 属于 `src/manifest/`；target id/order belongs to `src/ide/`; issue model and projection belongs to `src/diagnostics/` and `src/validation/`; path normalization and symlink/path escape checks belong to `src/fs/`.
- Runtime schema validation 如已在前置 stories 中使用 `zod@4.4.3`，继续复用同一 dependency 和 style；不要为了 Story 3.4 引入新 schema library。
- All public paths in command output, issues, details, fixtures and manifest/index projections must be project-relative POSIX-style unless an owning SPEC explicitly marks a field as redacted/non-stable.
- Human-readable output and `--json` output must share the same semantic model. Renderer modules must not invent a second issue shape, command status, path policy, target ordering or sorting policy.

### Implementation Anchors（实现锚点）

需要创建或扩展的 implementation anchors，实际命名应贴合已有实现：

- `src/bin/speclite.ts` 通过 commander 注册 `speclite validate`。
- `src/commands/validate.ts` 拥有 command orchestration，并返回 `CommandResult<ValidateCommandData>`。
- `src/manifest/manifest-schema.ts` 拥有 manifest、skill index、help index、files index、phase coverage 和 artifact contract projection 的 executable schemas/parsers。
- `src/ide/adapter-registry.ts` 拥有 canonical target order、target id validation 和 self-contained entry layout policy。
- `src/validation/rules/runtime-path.ts` 拥有 Story 3.4 runtime path validation rule。
- `src/validation/rules/menu-target.ts` 拥有 Story 3.4 menu target uniqueness validation rule。
- `src/validation/rules/legacy-namespace.ts` 拥有 Story 3.4 legacy namespace residue validation rule。
- `src/validation/rules/artifact-path.ts` 拥有 Story 3.4 artifact root/default output path and metadata validation rule。
- `src/validation/validate-project.ts` 拥有 validation aggregation、checkedCategories / checkedTargets / validatedPaths collection 和 deterministic sorting。
- `src/diagnostics/command-result-schema.ts` 拥有 `CommandResult`、`ValidationIssue`、`ValidateCommandData` 和 command id validation。
- `src/diagnostics/command-result.ts` 拥有 status/exit-code projection，且必须根据 issues severity 推导 validate command status。
- `src/diagnostics/output.ts` 拥有 Evidence human-readable validate rendering 与 Structured JSON rendering。
- `src/fs/path-normalizer.ts` 拥有 project-relative POSIX path normalization、absolute path rejection、drive letter rejection 和 project boundary checks。
- `src/fs/safe-write.ts` 拥有 write-capable command safe write helpers；Story 3.4 validate 可以共享 path/symlink classification helpers，但不得调用 mutation helpers。

如果这些文件已经由前置 stories 创建，修改前必须完整阅读并保留既有行为。如果它们因为前置 stories 尚未实现而不存在，停止 Story 3.4 实现并先完成前置条件，不要构建一个孤立的 runtime/menu/artifact validation scaffold。

### Runtime Path Contract Notes（Runtime Path 契约备注）

- `_speclite` 是 metadata/control hub；IDE skill directories 是 execution plane；`_speclite-output` 是 workflow artifact repository。
- Installed skill runtime support 必须依赖 target project 的 `_speclite` runtime namespace，不得从 source checkout、temporary extraction root、package-manager cache、legacy `_bmad` namespace 或 old resolver path 读取 runtime dependencies。
- `speclite resolve config` 必须要求显式 `--project-root`；`speclite resolve customization` 支持显式 `--project-root`，并为 Python parity 保留 installed skill directory upward fallback。Story 3.4 validate 检查 installed path contract，不执行 resolver。
- Runtime path output 的 public paths 必须 project-relative POSIX。只有项目外诊断可使用明确标记的 redacted absolute path，但本 Story 不应产生 raw absolute public path。

### Menu Target Contract Notes（Menu Target 契约备注）

- Help index required fields: `schemaVersion`、`phaseId`、`entryLabel`、`canonicalSkillId`、`activationTarget`、`targetIds[]`。
- Help index entries 必须引用 `canonicalSkillId`。它们不得创建 alternate skill ids、alias-only identities 或 IDE-specific skill identities。
- MVP target ids and order are owned by adapter registry: `claude`, then `agents`。
- Physical target directories:
  - `claude`: `.claude/skills`
  - `agents`: `.agents/skills`
- Self-contained skill entry directory names must use `canonicalSkillId`:
  - `.claude/skills/<canonicalSkillId>/`
  - `.agents/skills/<canonicalSkillId>/`
- Adapter definitions 不得重命名 canonical skill ids、canonical skill package directories 或 customization lookup keys。
- Command pointer behavior is `none` or `unsupported` in MVP。Story 3.4 不得生成 command pointer artifact 或 dedicated Copilot/Cursor target ids。

### Artifact Path Contract Notes（Artifact Path 契约备注）

- `artifactContract.artifactType` 是 stable artifact kind，不是 human-readable title。
- `artifactContract.defaultOutputPath` 必须是 project-relative POSIX path，并且必须落在 `_speclite-output/` 或 configured workflow artifact root 下。
- Configured workflow artifact root 必须是 project-relative POSIX path，必须解析在 target project boundary 内，且不得通过 symlink escape 或 path escape 指向项目外。
- Markdown artifacts 必须在文件开头使用 YAML frontmatter 承载 metadata，且至少包含 `workflowType`、`sourceSkill` 和 `generatedAt`。
- 非 Markdown file artifacts 必须在同一 artifact root 下写出 sidecar JSON，命名为 `<artifact-filename>.metadata.json`，并包含相同 metadata keys。
- Directory artifacts 必须在 artifact directory 内写出 `metadata.json`，并包含相同 metadata keys。
- Manifest/index projection 可以记录 artifact contract 和 metadata location，但不得替代 on-disk artifact metadata。
- Artifact files 和 metadata sidecars 是 workflow-owned。Install、update 和 repair 不得把它们作为 installer-owned changed paths，也不得因为 artifact validation failure 覆盖它们。

### Validation Issue Mapping（Validation Issue 映射）

Use only reserved MVP issue ids from the taxonomy unless the owning SPEC is updated first:

- `runtime-path.missing-entry`: required `_speclite` runtime entry is absent.
- `runtime-path.invalid-script-path`: generated runtime script path is malformed, non-POSIX, absolute, project-external or otherwise invalid.
- `runtime-path.legacy-resolver-path`: installed entry still points to old resolver/runtime namespace.
- `runtime-path.symlink-escape`: runtime path resolves outside target project through symlink.
- `menu-target.missing-target`: help/menu target is missing.
- `menu-target.ambiguous-target`: help/menu target resolves to more than one installed entry.
- `menu-target.unknown-skill`: help index references unknown `canonicalSkillId`.
- `menu-target.no-mapped-target`: phase coverage row has no mapped target.
- `legacy-namespace.runtime-residue`: stale old runtime namespace or generated structure remains.
- `legacy-namespace.stale-skill-entry`: stale copied skill entry overlaps current canonical skill id or target entry.
- `legacy-namespace.legacy-config-reference`: installed skill references legacy config path.
- `artifact-path.escapes-project`: artifact root/default output path escapes project boundary.
- `artifact-path.symlink-escape`: artifact path escapes project boundary through symlink.
- `artifact-path.missing-required-directory`: required `_speclite-output` or configured artifact directory is missing.
- `artifact-path.unwritable-directory`: expected artifact directory is not writable.
- `artifact-path.fixture-write-failed`: test-only fixture harness cannot write expected artifact in a controlled fixture project. Production `speclite validate` must not trigger this issue by writing a probe file into the target project.
- `artifact-path.missing-required-metadata`: required workflow artifact metadata is missing.
- `artifact-path.invalid-required-metadata`: required workflow artifact metadata exists but has invalid value.

Stable `details` suggestions:

```ts
type RuntimePathIssueDetails = {
  runtimeRefKind: "manifest" | "skill-index" | "installed-entry" | "resolver-metadata";
  namespaceKind?: "speclite" | "legacy" | "external" | "unknown";
  expectedNamespace?: "_speclite";
  reason:
    | "missing-entry"
    | "invalid-script-path"
    | "legacy-resolver-path"
    | "symlink-escape";
};

type MenuTargetIssueDetails = {
  canonicalSkillId?: string;
  phaseId?: string;
  activationTarget?: string;
  targetId?: "claude" | "agents";
  reason:
    | "missing-target"
    | "ambiguous-target"
    | "unknown-skill"
    | "no-mapped-target";
};

type LegacyNamespaceIssueDetails = {
  legacyKind: "runtime-namespace" | "stale-skill-entry" | "config-reference";
  riskKind: "duplicate-loading" | "menu-conflict" | "capability-drift" | "user-confusion";
  overlapKind?: "canonical-skill-id" | "target-entry" | "runtime-path" | "config-path";
  manualActionRequired: true;
  verificationCommand: "speclite validate";
};

type ArtifactPathIssueDetails = {
  artifactPathKind:
    | "configured-root"
    | "default-output-path"
    | "metadata-location"
    | "fixture-output";
  artifactType?: string;
  metadataKey?: "workflowType" | "sourceSkill" | "generatedAt";
  reason:
    | "escapes-project"
    | "symlink-escape"
    | "missing-required-directory"
    | "unwritable-directory"
    | "fixture-write-failed"
    | "missing-required-metadata"
    | "invalid-required-metadata";
};
```

Do not include actual absolute paths, home directory, raw parser exceptions, stack traces, environment variable values, credentials, timestamps, hashes, temporary/cache paths or random IDs in `details`.

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
- Public JSON must not include ANSI escape, icons, terminal-width formatting, local absolute paths, home directory, cache paths, temporary extraction paths, timestamps, hashes or non-deterministic ordering.

### Local-Only And No-Write Boundary（本地只读与禁止写入边界）

`speclite validate` for Story 3.4 may read:

- `_speclite/_config/manifest.yaml`
- `_speclite/_config/skill-index.json`
- `_speclite/_config/help-index.json`
- `_speclite/_config/files-index.json`
- `_speclite/_config/phase-coverage.json`
- `_speclite/config.toml`
- `_speclite/config.user.toml`
- `_speclite/custom/` only for path/reference diagnostics, not for mutation
- `.claude/skills/<canonicalSkillId>/`
- `.agents/skills/<canonicalSkillId>/`
- `_speclite-output/` or configured workflow artifact root
- workflow artifact metadata files required by artifact contract
- known legacy runtime/config/IDE entry paths only when they overlap current installed-state references

`speclite validate` for Story 3.4 must not:

- access npm registry, private registry, Git remote, offline bundle origin, package-manager cache, temporary extraction root, source checkout or remote provenance service;
- execute full `speclite status`, implicit update check, update plan or repair plan;
- write, delete, chmod, normalize, format, repair, regenerate, migrate, copy, move or clean up project files;
- create, touch, write, chmod or delete any probe file to test artifact directory writability in production validate; fixture write probes are limited to fixture harness / test-only execution against controlled temporary fixture projects;
- acquire write operation lock as if it were a write-capable command;
- scan arbitrary project files outside manifest/index declared installed-state paths and known legacy overlap candidates;
- report the same physical problem twice when one more specific category fully describes it.

### Output UX Requirements（输出体验要求）

- Default human-readable `validate` should use Evidence profile, not the Compact status profile.
- Issue rows must show severity, category, issue id, affected path or component, impact and suggested next step.
- Runtime path issues should lead with the runtime reference kind and current/expected namespace context.
- Menu target issues should lead with canonical skill id, phase id or activation target, while avoiding IDE-branded claims for `agents`.
- Legacy namespace issues should lead with risk category and manual verification command; they must not imply automatic deletion.
- Artifact path issues should lead with project-relative affected path and artifact role, not raw filesystem exception text.
- Empty issue state must be explicit; however, `No issues found` is only valid for categories actually checked.
- Output must work under `NO_COLOR`, non-TTY, CI and narrow terminal. Color, symbol or table layout must never be the only carrier of severity, issue id, path or next action.
- `--json` output must not include ANSI escape, icons, terminal-width formatting, local absolute paths, home directory, cache paths, temporary extraction paths, timestamps, hash values or non-deterministic ordering.

### Testing Requirements（测试要求）

- Runtime path tests:
  - valid current `_speclite` runtime path passes.
  - missing `_speclite` runtime entry maps to `runtime-path.missing-entry`.
  - malformed/absolute/drive-letter runtime path maps to `runtime-path.invalid-script-path`.
  - `_bmad` or old resolver path maps to `runtime-path.legacy-resolver-path`.
  - symlink escape maps to `runtime-path.symlink-escape`.
- Menu target tests:
  - valid `claude` self-contained entry target resolves to one installed entry.
  - valid `agents` self-contained entry target resolves to one installed entry.
  - missing activation target maps to `menu-target.missing-target`.
  - duplicate/ambiguous target maps to `menu-target.ambiguous-target`.
  - unknown `canonicalSkillId` maps to `menu-target.unknown-skill`.
  - phase coverage no mapped target maps to `menu-target.no-mapped-target`.
- Legacy namespace tests:
  - old runtime namespace residue maps to `legacy-namespace.runtime-residue`.
  - stale overlapping skill entry maps to `legacy-namespace.stale-skill-entry`.
  - legacy config reference maps to `legacy-namespace.legacy-config-reference`.
  - inert unrelated legacy-like directory is not reported.
  - validate never deletes or rewrites legacy files.
- Artifact path tests:
  - valid `_speclite-output` root and default output path pass.
  - configured artifact root path escape maps to `artifact-path.escapes-project`.
  - symlink escape maps to `artifact-path.symlink-escape`.
  - missing required artifact directory maps to `artifact-path.missing-required-directory`.
  - unwritable directory maps to `artifact-path.unwritable-directory`.
  - fixture-harness write failure maps to `artifact-path.fixture-write-failed` without using production validate write probing.
  - missing artifact metadata maps to `artifact-path.missing-required-metadata`.
  - invalid metadata key/value maps to `artifact-path.invalid-required-metadata`.
- Path and redaction tests:
  - all public paths are project-relative POSIX.
  - absolute path, home directory, Windows separator, drive letter and checkout-root-dependent path are rejected or redacted according to owning SPEC.
  - `ValidationIssue.details`, `impact` and `suggestedNextStep` do not contain dynamic path/hash/time/source text.
- Determinism tests:
  - repeated validate fixture runs produce stable issue arrays, issueCounts, checkedCategories, checkedTargets and validatedPaths.
  - arrays do not depend on filesystem traversal, glob order, object key order, validation rule registration order or async completion.
- Boundary tests:
  - Story 3.4 validate rules do not invoke remote source resolver, source checkout scanning, status command, update planner, repair planner, target writer, safe write, chmod, fixture write probe or filesystem mutation.

### Latest Technical Information（最新技术信息）

本 Story 不需要引入或升级外部依赖。遵守仓库中 Architecture 已固定的平台与契约：

- Node.js 22 LTS minimum，Node.js 24 LTS recommended。
- TypeScript + commander CLI foundation。
- Runtime schema validation 如已存在，复用 `zod@4.4.3`。
- Path normalization、symlink classification 和 project boundary checks 复用前置 stories 建立的 `src/fs/path-normalizer.ts` / filesystem helpers；不要为了 Story 3.4 添加新 path library。
- 复用前置 implementation stories 已选择的 YAML/JSON/TOML/CSV parser；不要为了 runtime/menu/artifact validation 添加新 parser 或新 CLI framework。

Story 3.4 是受契约约束的本地 deterministic validation 能力，不应在本实现中追逐最新 dependency version。如果确实需要 dependency 变更，必须停止并在单独授权的变更中更新 owning Architecture / SPEC / fixtures。

### Project Context Reference（项目上下文引用）

- `_bmad-output/project-context.md` 当前存在，但只包含初始化占位内容。不要把它当作完整 implementation rule source。
- 本 Story 的 live source of truth 是 Epic 3 shard、PRD status/validation FR/NFR、Architecture implementation mapping、UX control-plane guidance，以及 `_bmad-output/planning-artifacts/specs/` 下的 owning SPECs。

## References（参考）

- `_bmad-output/project-context.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/implementation-artifacts/3-1-lightweight-install-status-summary.md`
- `_bmad-output/implementation-artifacts/3-2-manifest-and-index-schema-validation.md`
- `_bmad-output/implementation-artifacts/3-3-ide-mirror-and-file-integrity-validation.md`
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
- `assets/source/speclite/scripts/resolve_config.py`
- `assets/source/speclite/scripts/resolve_customization.py`

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
