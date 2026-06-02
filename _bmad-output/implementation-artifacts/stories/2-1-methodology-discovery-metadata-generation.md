# Story 2.1: Methodology Discovery Metadata Generation（方法论发现元数据生成）

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story（故事）

作为 AI IDE 使用者，  
我希望安装后的 SpecLite 能提供稳定的方法论发现元数据，  
以便 IDE 可以展示研发阶段、可用 skills、入口路径和激活目标，而不需要用户手工查找 Markdown 文件。

## Acceptance Criteria（验收标准）

1. **Discovery metadata records canonical capability identity.**  
   **前提** SpecLite 已完成所选模块的安装规划，且 Epic 1 的 source discovery、module selection、config initialization、runtime structure、IDE mirror 和 manifest/index 生成已真实实现；  
   **当** 系统生成 discovery metadata；  
   **则** 每个 selected canonical package root 都会在 skill index 中记录 `canonicalSkillId`、`moduleId`、source package path 和 installed targets；
   **并且** 每个有 help/menu metadata 的可发现能力都会记录 `phaseId`、`phaseLabel`、`moduleId`、`canonicalSkillId`、skill 名称、entry label 和 activation target；
   **并且** `canonicalSkillId` 必须来自 source skill package 或 source module metadata，不得由 IDE adapter、menu label、directory traversal order 或 display name 重新命名；  
   **并且** 缺少 help/menu row 的 installed canonical package root 不得从 skill index、files index 或 IDE mirrors 中消失；
   **并且** 若 source metadata、help row 或 selected module 引用了缺失的 canonical skill package，系统不得合成空 skill、伪造 metadata 或静默跳过 required entry。

2. **Minimum phase coverage can represent key SDLC phases.**  
   **前提** 某个 skill 属于 SPEC、方案评审、故事规划、实现、测试或审查阶段；  
   **当** 系统生成 MVP 最小阶段覆盖数据；  
   **则** 该 skill 会被映射到对应阶段；  
   **并且** 每个关键研发阶段至少可以表达是否存在 mapped skill entry；  
   **并且** phase coverage rows 必须使用 owning SPEC 规定的 `speclite.phase-coverage.v1` shape，并按 `phaseId`、`moduleId`、`canonicalSkillId` 稳定排序；  
   **并且** MVP 最小覆盖必须复用本 Story Dev Notes 中的 phase-to-skill fixture table，不得在 renderer、validator 或 fixture snapshot 中硬编码第二套阶段映射。

3. **Help index remains a projection, not a second skill identity source.**  
   **前提** 系统生成 help index 或菜单发现数据；  
   **当** discovery metadata 写入 installed projection；  
   **则** help index 只能引用 `canonicalSkillId`、phase、entry label 和 activation target；  
   **并且** 不得定义第二套 skill identity、alias-only identity 或 IDE-specific identity；  
   **并且** help/menu rows 必须可解析到且仅到一个 installed canonical skill entry，无法解析时使用 taxonomy 中的 `menu-target.*` issue id。

4. **Optional artifact contract summary is minimal and consistent.**  
   **前提** 某个 workflow 具有默认产物输出约定；  
   **当** 系统生成 discovery metadata；  
   **则** 可以记录可选 `artifactContract` 摘要；  
   **并且** `artifactContract` 至少能支持后续校验 artifact type、默认输出路径、`workflowType`、`sourceSkill` 和 `generatedAt`；  
   **并且** 只有可解析到 configured artifact root 的单一 project-relative output 才能进入 `artifactContract`；多输出、control/custom paths 和 `_speclite/_memory` 等非 workflow artifact root 必须保持 `artifactContract` absent 或标记 Post-MVP；  
   **并且** artifact contract 字段和 metadata 值域以 manifest/index owning SPEC 为准，不在 PRD、Architecture、CommandResult 或单个 skill helper 中重新定义。

5. **Installed projection is deterministic across targets and runs.**  
   **前提** discovery metadata 已生成；  
   **当** 后续 IDE adapter、validator 或 fixture 读取它；  
   **则** 字段、target order、hash 和 ownership 投影遵守 manifest/index owning SPEC；  
   **并且** target order 固定为 adapter registry canonical order：`claude` 后 `agents`；  
   **并且** 输出不得依赖 filesystem traversal order、glob 顺序、object insertion order、user selection order 或 async completion order。

6. **Adapter-specific discovery metadata stays outside canonical package semantics.**  
   **前提** IDE adapter 需要额外 wrapper、catalog 或 target-specific discovery metadata；  
   **当** discovery metadata 与 self-contained skill entry 一起被投影；  
   **则** canonical skill package 内容、directory basename、package hash 和 customization lookup key 不得被 adapter 修改；  
   **并且** adapter artifact 必须单独记录 ownership、hash 和 sourceRef，不得混入 canonical package hash；  
   **并且** MVP 不生成 command pointer artifact，也不得输出 branded `copilot` 或 `cursor` target id。

7. **Diagnostics use reserved categories and stay redaction-safe.**  
   **前提** discovery metadata 生成、help/menu projection、phase coverage 或 artifact contract projection 发现缺失、重复、unsupported 或不可写状态；  
   **当** 系统产生 diagnostics；  
   **则** 必须使用现有 reserved issue categories，例如 `manifest-schema`、`ide-mirror`、`menu-target`、`artifact-path` 或 `file-integrity`；  
   **并且** issue id 不得包含 path、target、skill id、hash、timestamp、random id 或动态值；  
   **并且** public details 不得泄露 absolute path、home directory、cache path、temporary path、environment variable、credential、stack trace 或 raw exception object。

8. **Focused tests and fixture assertions prove the metadata contract.**  
   **前提** Story 2.1 修改 manifest/index schema、discovery metadata generator、help index、skill index、phase coverage 或 validation behavior；  
   **当** 开发者完成实现；  
   **则** 必须补充 unit、integration 和 fixture assertions，覆盖 canonical skill id preservation、phase coverage rows、help index identity boundary、artifact contract summary、canonical target order、deterministic sorting、missing package diagnostics 和 no command pointer generation；  
   **并且** tests 必须 local-only、deterministic、parse JSON semantically，不访问 npm registry、Git remote、private registry、offline bundle origin 或外部网络。

## Tasks / Subtasks（任务 / 子任务）

- [x] Task 1: 验证 Epic 1 前置实现和当前仓库状态（AC: 1, 5, 8）
  - [x] 确认 Story 1.1-1.6 已真实实现，而不只是 story context 处于 `ready-for-dev`：需要存在 `package.json`、`src/`、`test/`、CLI install flow、`src/manifest/manifest-schema.ts`、`src/manifest/manifest-generator.ts` 或等价拆分 manifest/index builder、`src/installer/runtime-structure.ts` 中的 installed-state 写出路径、`src/ide/adapter-registry.ts` / `src/ide/target-writer.ts`、`src/fixtures/fixture-contract.ts` 和 fixture expected outputs/tests。
  - [x] Anchor 判断使用 functional contract 标准：若 skill/help/files/phase index builders 集中在 `manifest-generator.ts` 且通过 owning SPEC schema、runtime write path 和 fixture/tests 验证，不得仅因缺少独立 `skill-index.ts`、`help-index.ts`、`files-index.ts` 或 `phase-coverage.ts` 文件而停止。
  - [x] 若上述 functional anchors 仍不存在或 tests 不能证明 Epic 1 installed-state 能力，停止 Story 2.1 实现，先完成 Epic 1 实际代码；不得在 Story 2.1 中重建 CLI scaffold、source resolver、install plan、IDE mirror writer 或 ready summary。
  - [x] 读取当前 `InstallPlan`、selected modules、selected targets、source descriptor 和 Story 1.5/1.6 已生成的 manifest/index pipeline；Story 2.1 只扩展 discovery metadata / phase coverage projection。
  - [x] 检查当前 worktree dirty 状态，保留与本 Story 无关的 planning artifacts、story 文件、sprint status 或用户改动；不得格式化、重写或同步无关文件。

- [x] Task 2: 从 source module metadata 和 help rows 构建 canonical capability inputs（AC: 1, 2, 3）
  - [x] 读取 `assets/source/speclite/core-skills/module.yaml`、`assets/source/speclite/core-skills/module-help.csv`、`assets/source/speclite/sdlc-skills/module.yaml` 和 `assets/source/speclite/sdlc-skills/module-help.csv`。
  - [x] 读取 selected modules 下全部 canonical package roots 作为 skill inventory source；`module-help.csv` 只作为 help/menu/phase projection source。
  - [x] 将 `module-help.csv` 中的 `skill` 作为 `canonicalSkillId` 引用；不得从 `display-name`、`menu-code`、`description`、target path 或 IDE label 反推 skill id。
  - [x] 对每个 selected module 校验 referenced canonical skill package 是否存在 `SKILL.md`，并保留 source package relative path；缺失时产生 reserved diagnostic 或先更新 taxonomy，不得静默跳过。
  - [x] 为每个可发现能力归一化 `moduleId`、`phaseId`、`phaseLabel`、`entryLabel`、`activationTarget` 和 skill display name；phase label 可以由 source phase/config 映射生成，但映射必须集中在 manifest generator 或 schema helper 中。
  - [x] 保持 source 侧 module order 和 help row order 只作为输入事实；public installed projection 的最终排序必须使用 owning SPEC 规定的排序规则。

- [x] Task 3: 实现 discovery metadata schema 与 generator extension（AC: 1, 4, 5）
  - [x] 在 `src/manifest/manifest-schema.ts` 中扩展或新增 discovery metadata / phase coverage executable types；该 module 是 manifest/index schema anchor，不得在 command、adapter 或 test helper 中定义第二份 schema。
  - [x] 在现有 manifest/index builder 中接入 metadata generation：当前实现可以继续扩展 `src/manifest/manifest-generator.ts` 的集中式 helpers，也可以在不创建平行 manifest generator 的前提下拆出 `skill-index.ts`、`help-index.ts`、`files-index.ts` 或 `phase-coverage.ts`。若新增 split module，必须由同一 schema/types 和 runtime write path 消费。
  - [x] `skill-index` 继续记录 `schemaVersion`、`canonicalSkillId`、`moduleId`、`sourcePackagePath`、`canonicalPackageHash`、`installedTargets[]` 和 `phaseIds[]`，不得把 phase coverage fields 塞进非契约位置。
  - [x] `help-index` 继续记录 `schemaVersion`、`phaseId`、`entryLabel`、`canonicalSkillId`、`activationTarget` 和 `targetIds[]`，不得新增 alias-only identity。
  - [x] `phase-coverage` rows 使用 `speclite.phase-coverage.v1`，每个 target entry 使用 installed phase coverage vocabulary：`mapped`、`unsupported` 或 `failed`。

- [x] Task 4: 生成 MVP 最小阶段覆盖矩阵（AC: 2, 5, 6）
  - [x] 覆盖 SPEC、方案评审、故事规划、实现、测试和审查的最小阶段可见性；至少要能表达每个关键阶段是否有 mapped canonical skill entry。
  - [x] 使用 Dev Notes 中的 MVP minimum phase-to-skill coverage fixture table 作为唯一 Story 2.1 / Story 2.3 共享映射来源；renderer、validator 和 fixture snapshot 只能消费该 semantic model，不得各自维护第二套 key-phase 映射。
  - [x] 对 required `canonicalSkillId` 缺失、source package 缺失或 target 无 mapped entry 的场景，按表中 expected missing behavior 输出 reserved diagnostic 或 visible missing row；不得用 optional / anytime skill 伪造关键阶段覆盖。
  - [x] 将 selected targets 投影为 `ideTargets[]`，并按 `CANONICAL_TARGET_ORDER` 输出 `claude`、`agents`；未选择或 unsupported target 的语义必须按 adapter registry 和 manifest/index SPEC 判断。
  - [x] `entryPath` 和 `activationTarget` 使用 project-relative POSIX path；不得把 absolute checkout path、home directory、temporary path 或 source checkout path 写入 installed projection。
  - [x] 对 `.agents/skills` target 保持 generic `agents` 语义；不得在 human-readable output 或 JSON 中渲染为 GitHub Copilot/Cursor readiness。
  - [x] 若某阶段没有 mapped entry，必须明确表达 `unsupported`、`failed` 或 no mapped target，不能用 alias-only identity 伪造覆盖。

- [x] Task 5: 记录可选 artifact contract 摘要（AC: 4, 7）
  - [x] 从 source skill metadata、help rows、workflow customization 或 owning config 中读取 default output convention；没有明确 contract 时保持 `artifactContract` absent，不得猜测 output path。
  - [x] 按 Dev Notes 中的 `artifactContract` eligibility / normalization matrix 判定 `output-location`：只有可解析到 configured artifact root 的单一 project-relative output 可进入 `artifactContract`；多输出 rows、control/custom paths、`_speclite/_memory` 和不可归一化路径不得投影为单一 artifact contract。
  - [x] 当 `artifactContract` 存在时，字段必须只使用 owning SPEC 定义的 minimum shape：`artifactType`、`defaultOutputPath`、`requiredMetadata`。
  - [x] `requiredMetadata` 至少包含 `workflowType`、`sourceSkill`、`generatedAt`；`generatedAt` 必须是 ISO 8601 string，但 stable fixture snapshot 只做 normalize / exclude / semantic parse，不比较具体时间。
  - [x] `defaultOutputPath` 必须是 project-relative POSIX path，且位于 `_speclite-output/` 或 configured workflow artifact root 内；symlink/path escape 使用 `artifact-path.escapes-project` 或 `artifact-path.symlink-escape`。
  - [x] 不验证 workflow artifact 叙事质量、人工评审结论或业务正确性；Story 2.1 只提供最小 artifact loop metadata contract。

- [x] Task 6: 保持 manifest/index、hash 和 ownership 投影一致（AC: 5, 6, 7）
  - [x] Manifest/index artifacts 固定为 `_speclite/_config/manifest.yaml`、`skill-index.json`、`help-index.json`、`files-index.json` 和 `phase-coverage.json`，不得改用 YAML/TOML/CSV/extensionless variants。
  - [x] `canonicalPackageHash` 是 package-level hash，只证明同一 canonical package 在不同 IDE targets 中内容一致；不要与 files index file-level hash 混用。
  - [x] Adapter-specific discovery metadata、wrapper 或 catalog entry 属于 adapter artifact，必须单独 files-indexed，ownership 与 hash 不得污染 canonical package hash。
  - [x] Source canonical text files 固定 LF；installer 不得按平台改写 canonical text line endings。
  - [x] Public arrays 使用明确排序：phase rows 按 `phaseId`、`moduleId`、`canonicalSkillId`；targets 按 `claude`、`agents`；validated paths 先 normalize 再排序。

- [x] Task 7: 接入 diagnostics、validation 和 command output（AC: 3, 5, 7）
  - [x] 对 help/menu/discovery metadata 无法解析到唯一 installed skill entry 的场景，使用 `menu-target.missing-target`、`menu-target.ambiguous-target`、`menu-target.unknown-skill` 或 `menu-target.no-mapped-target`。
  - [x] 对 target directory resolution、write、schema generation 或 reverse validation failure，使用 adapter registry layer-specific status 与 taxonomy reserved issue id，例如 `ide-mirror.target-write-failed`。
  - [x] 对 malformed manifest/index shape 使用 `manifest-schema.*` issue id；不得新增自由文本 issue id。
  - [x] Human-readable output 可以解释 phase coverage 和 discovered skills，但 automation-relevant state 必须进入 manifest/index、`CommandResult.data` 或 fixture outputs。
  - [x] 如确实需要新增 public JSON field、manifest/index field、schema version、issue id 或 status literal，先更新 owning SPEC，再更新 executable schema/parser 和 fixtures。

- [x] Task 8: 编写 focused tests、integration tests 和 release-gate fixture assertions（AC: 1-8）
  - [x] Unit tests 覆盖 source metadata/help row parsing、canonical skill id preservation、missing `SKILL.md` handling、phase mapping、artifact contract omission/presence 和 deterministic sorting。
  - [x] Unit tests 覆盖 target order、path normalization、no branded `copilot` / `cursor` target、no command pointer generation、no adapter rename of canonical skill id/customization key。
  - [x] Contract tests 解析 `skill-index.json`、`help-index.json`、`phase-coverage.json`，断言 schema versions、required fields、target statuses、artifact contract minimum shape 和 no alternate identity。
  - [x] Integration tests 覆盖 fresh install selected core+sdlc modules 后生成稳定 discovery metadata；重复运行相同 source/config/targets 的 projection 除允许 timestamp 外必须一致。
  - [x] Fixture `fresh-install-empty-project` 更新 expected manifest/index snapshots、expected command JSON 或 validation assertions，覆盖 phase coverage 和 help/menu discovery。
  - [x] Fixture `skill-artifact-loop` 在本 Story 只验证 discovery metadata、entry / activation target 边界和 artifact metadata 值域可被表达；resolver success release gate 推迟到 Story 2.4，full artifact write loop 推迟到 Story 2.5。
  - [x] 运行 `npm run build`、`npm test`，或至少运行 Story 2.1 touched modules 的 focused Vitest tests 与相关 fixture tests。
  - [x] 检查 diff，确认没有修改 `_bmad-output/planning-artifacts/`、其他 story 文件或无关用户改动，且没有实现 Story 2.2 self-contained entry mapping 之外的 command pointer / branded adapter / Post-MVP governance dashboard。

- [x] Corrective Task 9: 区分 full skill inventory 与 help/phase projection（AC: 1, 3, 8）
  - [x] 默认 `core` + `sdlc` install 后，`skill-index.json` 必须包含 `53` 个 canonical package root entries。
  - [x] `help-index.json` 与 `phase-coverage.json` 可以只投影有 help/menu metadata 的 rows，但所有引用必须解析到现有 skill index entry。
  - [x] Tests 必须同时覆盖 package root inventory completeness 和 help/menu reference integrity，避免用 phase coverage row count 代替 installed skill count。
  - [x] `module-help.csv` 中出现未知 `canonicalSkillId` 时继续报告 reserved `menu-target` / metadata diagnostic；但缺 help row 的 package root 不得被视为未安装。

## Dev Notes（开发备注）

### Current Repository State（当前仓库状态）

- 截至 2026-05-27，Epic 1 已建立实际代码基础：`package.json`、`src/`、`test/`、CLI install flow、manifest/index schemas、runtime structure writer、IDE adapter registry / target writer、fixture contract 和 fixture expected outputs/tests 均已存在。
- Manifest/index builders 当前采用集中式实现：`src/manifest/manifest-generator.ts` 提供 `createSkillIndex`、`createHelpIndex`、`createFilesIndex`、`createPhaseCoverage`，`src/installer/runtime-structure.ts` 负责写出 `_speclite/_config/skill-index.json`、`help-index.json`、`files-index.json` 和 `phase-coverage.json`。这符合 owning SPEC 的 executable anchor 标准。
- 不要把缺少独立 `src/manifest/skill-index.ts`、`help-index.ts`、`files-index.ts` 或 `phase-coverage.ts` 文件解读为 Epic 1 anchor 缺失；只有当 functional contract、schema/parser、runtime write path 或 fixture/tests 无法证明能力存在时，才应停止并回到 Epic 1。
- 当前 worktree 可能存在与本 Story 创建无关的 planning artifacts、`sprint-status.yaml`、依赖目录或用户工作区改动。实现 Story 2.1 时不得格式化、重写、同步或回滚这些无关改动。
- `assets/source/speclite/` 已存在，并包含 bundled source assets、module metadata、help CSV 和 canonical skill packages。当前可见 source package pattern 包括：
  - `assets/source/speclite/core-skills/<canonicalSkillId>/SKILL.md`
  - `assets/source/speclite/sdlc-skills/<phase-or-group>/<canonicalSkillId>/SKILL.md`
  - `assets/source/speclite/sdlc-skills/1-analysis/research/<canonicalSkillId>/SKILL.md`
- `_bmad-output/project-context.md` 当前仍是初始化占位内容；实际实现 guardrails 以 live PRD、Architecture、UX 和 owning SPEC artifacts 为准。

### Scope Boundary（范围边界）

- 本 Story 只负责 methodology discovery metadata generation、help/skill/phase installed projections、optional artifact contract summary、deterministic ordering、diagnostics 和对应 tests/fixtures。
- 本 Story 可以扩展 Epic 1 已存在的 `src/manifest/` 与 validation/fixture anchors；不得创建平行 manifest/index generator、第二套 schema truth 或独立 skill identity registry。
- 如果现有集中式 manifest/index builder 足以承载新增 metadata，优先复用并扩展它；只有在降低复杂度或匹配后续维护边界时才拆分新模块。
- 本 Story 不负责：
  - Story 2.2 的 IDE self-contained skill entry mapping 或 target writer 行为，除非已有 target status 需要读取。
  - Story 2.3 的 IDE entry activation protocol 验证、phase coverage governance UX 或 full activation loop。
  - Story 2.4 的 `speclite resolve` config/customization implementation 或 resolver success gate。
  - Story 2.5 的 workflow artifact writing and metadata validation implementation。
  - Epic 3 的 `status` / `validate` full installed-state validation。
  - Post-MVP command pointer artifact、dedicated Copilot/Cursor adapter、coverage dashboard、trend report 或 multi-project governance rollup。

### Architecture Requirements（架构要求）

- Runtime baseline remains Node.js 22 minimum and Node.js 24 recommended. Do not use Node 24-only APIs unless a Node 22-compatible path exists and runtime policy / fixtures are updated.
- CLI foundation remains TypeScript + commander. Do not introduce oclif/yargs/cac/clipanion for this Story.
- Storage model is local-first filesystem. Do not introduce database, web service, daemon, REST API, GraphQL, desktop UI, persistent cache server or background process.
- `src/commands/install.ts` should orchestrate only. Discovery metadata generation belongs in `src/manifest/`; target order and adapter capability semantics belong in `src/ide/adapter-registry.ts`; public projection belongs in `src/diagnostics/`; path normalization belongs in `src/fs/`.
- All public paths in command output, issues, manifest/index projections and tests must use project-relative POSIX-style paths unless an owning SPEC explicitly marks a field non-stable/redacted.
- Source-side truth is `assets/source/speclite/` module metadata and canonical skill packages. Installed-side truth is manifest/index projection. IDE mirrors are execution-plane projections, not source truth.

### Discovery Metadata Requirements（发现元数据要求）

Required per capability:

```ts
type MethodologyDiscoveryCapability = {
  phaseId: string;
  phaseLabel: string;
  moduleId: string;
  canonicalSkillId: string;
  skillName: string;
  entryLabel: string;
  activationTarget: string;
  artifactContract?: {
    artifactType: string;
    defaultOutputPath: string;
    requiredMetadata: Array<"workflowType" | "sourceSkill" | "generatedAt">;
  };
};
```

- Treat this shape as implementation guidance only; the executable source of truth must live in `src/manifest/manifest-schema.ts` and owning SPECs.
- `activationTarget` should point to the installed self-contained skill entry or equivalent canonical activation entry, using project-relative POSIX path.
- `skillName` and `entryLabel` are display fields. They must not become identity fields.
- If source data lacks a required field, implementation should fail or produce a reserved diagnostic rather than inventing values from display text.

### Artifact Contract Eligibility And Normalization（artifactContract 资格与归一化）

Story 2.1 owns the MVP `artifactContract` eligibility rule. Story 2.5 must consume this rule instead of defining a second artifact contract source.

| Source `output-location` shape | Example | `artifactContract` eligibility | Normalization / behavior |
|---|---|---|---|
| Single configured artifact root variable | `{planning_artifacts}`、`{implementation_artifacts}`、`{project_knowledge}` | Eligible only after resolver/config maps it to a project-relative POSIX path under `_speclite-output/` or the configured workflow artifact root | Store normalized project-relative `defaultOutputPath`; never store raw `{...}` token or absolute path. |
| Single configured artifact root with child path | `{output_folder}/brainstorming`、`{implementation_artifacts}/story-reviews` | Eligible if the resolved path remains under the configured workflow artifact root | Normalize separators, reject path escape, and keep `artifactType` / `requiredMetadata` in the owning SPEC shape. |
| Multiple possible outputs | `{planning_artifacts}|{project_knowledge}` | Not eligible for a single MVP `artifactContract` | Keep `artifactContract` absent; treat multi-output artifact contract as Post-MVP unless an owning SPEC introduces an explicit multi-output shape. |
| Control/custom path | `{project-root}/_speclite/custom`、`{project-root}/_speclite/_memory/...` | Not eligible | Keep `artifactContract` absent because these are control/custom paths, not workflow artifact outputs. |
| Missing, unknown, non-project-relative, absolute, or escaping output | empty value、unknown token、`../outside`、absolute path | Not eligible | Keep absent when no contract is declared; emit reserved `artifact-path.*` or `manifest-schema.*` diagnostic when a declared required contract cannot be normalized safely. |

MVP `artifactContract` projection must be a single-output summary only. It must not merge multiple CSV columns, infer a default output from prose, generate a synthetic output path, or include `_speclite/custom` / `_speclite/_memory` paths.

### MVP Minimum Phase-To-Skill Coverage Matrix（MVP 最小阶段到 Skill 覆盖矩阵）

This table is the shared fixture expectation for Story 2.1 generation and Story 2.3 activation / evidence. It maps product key-stage labels to source-defined `canonicalSkillId` rows; source `phaseId` remains the sorting key.

| Key SDLC capability | Required `canonicalSkillId` | Source `phaseId` | Expected missing behavior | Sorting assertion |
|---|---|---|---|---|
| SPEC / PRD | `speclite-create-prd` | `2-planning` | Missing source package or no mapped target is blocking for the required row; use reserved `menu-target.*` / `manifest-schema.*` diagnostics and keep the gap visible. | Row sorts by `phaseId`, then `moduleId`, then `canonicalSkillId`; label text is not a sort key. |
| 方案评审 / readiness | `speclite-check-implementation-readiness` | `3-solutioning` | Missing row must not be filled by an `anytime` review skill; report the missing required mapping. | Same deterministic row sort. |
| 故事规划 | `speclite-create-epics-and-stories` | `3-solutioning` | Missing source package or missing installed target remains visible as no mapped target. | Same deterministic row sort. |
| 实现 | `speclite-dev-story` | `4-implementation` | Missing implementation row blocks MVP coverage evidence; do not substitute `speclite-quick-dev` unless a future SPEC changes the required row. | Same deterministic row sort. |
| 测试 | `speclite-qa-generate-e2e-tests` | `4-implementation` | Missing test row remains visible; do not infer test coverage from generic implementation skills. | Same deterministic row sort. |
| 审查 / Story design review | `speclite-story-review-01-reviewer` | `3-solutioning` | Missing design review row remains visible; evaluator/fixer rows do not replace reviewer coverage. | Same deterministic row sort. |
| 审查 / Code review | `speclite-code-review` | `4-implementation` | Missing code review row remains visible; CR sub-workflow helper rows may appear but do not replace this required row unless owning SPEC changes. | Same deterministic row sort. |

Renderer, validator, and fixture snapshots must consume generated phase coverage rows and this minimum table. They must not hardcode an alternate mapping from Chinese stage labels to source phases.

### Manifest And Index Requirements（Manifest 与 Index 要求）

- Manifest/index files and schema versions are owned by `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md`.
- Required MVP installed-state artifacts:
  - `_speclite/_config/manifest.yaml`
  - `_speclite/_config/skill-index.json`
  - `_speclite/_config/help-index.json`
  - `_speclite/_config/files-index.json`
  - `_speclite/_config/phase-coverage.json`
- Required MVP schema versions:
  - `speclite.manifest.v1`
  - `speclite.skill-index.v1`
  - `speclite.help-index.v1`
  - `speclite.files-index.v1`
  - `speclite.phase-coverage.v1`
- Minimum phase coverage rows must include `schemaVersion`, `phaseId`, `phaseLabel`, `moduleId`, `canonicalSkillId`, `ideTargets[]` and optional `artifactContract`.
- Help index entries must reference `canonicalSkillId`; they must not create alternate skill ids, alias-only identities or IDE-specific skill identities.

### Adapter Boundary Requirements（Adapter 边界要求）

- MVP target ids are physical execution targets:
  - `claude` -> `.claude/skills`
  - `agents` -> `.agents/skills`
- Canonical target order is `claude`, then `agents`.
- Adapter definitions must not rename canonical skill ids, canonical package directories or customization lookup keys.
- Self-contained skill entry basename must remain `<canonicalSkillId>`.
- Adapter-specific discovery metadata, wrapper files or capability catalog entries are adapter artifacts. They do not define skill semantics and do not participate in canonical package hash.
- MVP does not generate command pointer artifacts. Dedicated `copilot` or `cursor` target ids remain Post-MVP.

### UX And Output Requirements（UX 与输出要求）

- SpecLite UX is terminal + local filesystem control plane, not GUI. Output should expose evidence: manifest/index paths, IDE targets, phase coverage rows, entry paths and activation targets.
- Human-readable output may render phase coverage as a table or key-value evidence block, but structured output and manifest/index files carry automation facts.
- Output must work in `NO_COLOR`, non-TTY, CI and narrow terminal contexts. Do not rely on ANSI color, icon, spinner-only progress or terminal-width-specific formatting for meaning.
- Empty states must be explicit, for example `No mapped skill entry for phaseId=<id>` with a stable issue or status.

### Testing Requirements（测试要求）

- Use Vitest and fixture assertions. Tests must be deterministic and local-only.
- Do not access npm registry, Git remote, private registry, offline bundle origin, package-manager cache or external network.
- JSON tests must parse output semantically and assert required fields, ordering and absence of non-contract fields.
- Manifest/index snapshots must normalize or exclude only SPEC-declared non-stable fields. Do not compare exact `generatedAt` timestamps.
- Any public contract change must update owning SPEC, executable schema/parser and fixture expected outputs in the same change.

### Previous Story Intelligence（前序 Story 情报）

- Story 1.1 establishes CLI scaffold, runtime/platform guard, `CommandResult` executable schema anchor, `SourceDescriptor` anchor, `InstallPlan` anchor, manifest anchor, adapter registry anchor and no-write guard failures.
- Story 1.2 extends target directory resolution, existing-install detection, path normalization and confirmation-before-write gate.
- Story 1.3 extends bundled source discovery, official module metadata parsing, deterministic module selection and pre-write install scope summary.
- Story 1.4 extends quick/detailed config collection, config model, TOML planned writes, human-owned project-level custom stub plan and final config summary.
- Story 1.5 extends runtime structure writes, configured artifact repository, IDE target mirrors, manifest/index projection, ownership/hash/safe-write/path-safety and no-ready-summary failure gate.
- Story 1.6 extends install lifecycle progress, ReadyCheck, ready summary and final installed-state evidence.
- Epic 2 should build on these anchors. Anchor verification is functional, not filename-only: current Epic 1 manifest/index projection is centralized in `manifest-generator.ts`, written by `runtime-structure.ts`, and proven by fixture/tests. If any Epic 1 capability is genuinely missing, dev agents must stop and complete prior stories rather than recreating scaffolding inside Story 2.1.

### Git Intelligence（Git 情报）

- Recent commits are documentation/context/spec oriented, not implementation scaffold:
  - `a0b08ef style(docs): 清理参考文档尾随空白`
  - `1ab545f docs(context): 初始化项目上下文文档`
  - `a4f8ab9 docs(source): 同步内置源资产路径说明`
  - `6e3d4e4 docs(glossary): 整理术语目录与文档索引`
  - `5b2c7a4 docs(specs): 收敛 MVP 契约与实现锚点`
- `5b2c7a4` updated live SPEC contracts for CommandResult, SourceDescriptor, InstallPlan, manifest/index, IDE adapter registry, validation taxonomy and fixtures; treat live sharded docs and owning SPECs as current implementation truth.
- Do not use `_bmad-output/planning-artifacts/archive/` whole documents as live contract sources.
- Worktree was already dirty when this Story was created; implementation agents must preserve unrelated user changes.

### Latest Technical Information（最新技术信息）

- No new third-party dependency is required for this Story. Use project-pinned libraries from Architecture and prior stories: `commander@14.0.3`, `yaml@2.9.0`, `toml@4.1.1`, `csv-parse@6.2.1`, `fs-extra@11.3.5`, `zod@4.4.3`, `typescript@6.0.3`, `tsx@4.21.0`, `tsup@8.5.1`, `vitest@4.1.6` and `@types/node@22`.
- Use Node.js 22-compatible `node:fs/promises`, `node:path`, `node:crypto` and stable ECMAScript APIs. Do not introduce Node 24-only behavior.
- Do not add globbing, hashing, table rendering, prompt, validation or adapter dependencies silently. If a new dependency seems necessary, justify it against Architecture, update package/test fixtures and keep Node 22 compatibility.
- External web research was not required for this Story because the implementation surface is fully governed by project-owned live PRD, Architecture, UX and owning SPEC contracts, and no dependency upgrade is part of the acceptance scope.

### Project Context Reference（项目上下文引用）

- `_bmad-output/project-context.md` currently contains initialized metadata and placeholder sections only; it does not add implementation rules beyond live PRD, Architecture, UX and owning SPEC artifacts.
- The project-level language rule remains: conversation and generated docs in Chinese, section headings in `English（中文）` form, technical identifiers in English.

### References（参考）

- [Source: `_bmad-output/planning-artifacts/epics/05-epic-2-methodology-discovery-and-skill-execution方法论发现与-skill-执行.md#Story 2.1`]
- [Source: `_bmad-output/planning-artifacts/epics/05-epic-2-methodology-discovery-and-skill-execution方法论发现与-skill-执行.md#Epic 2`]
- [Source: `_bmad-output/planning-artifacts/prd/05-user-journeys用户旅程.md#Journey 2`]
- [Source: `_bmad-output/planning-artifacts/prd/05-user-journeys用户旅程.md#Journey 5`]
- [Source: `_bmad-output/planning-artifacts/prd/08-developer-tool-specific-requirements开发者工具特定需求.md#API Surface`]
- [Source: `_bmad-output/planning-artifacts/prd/10-functional-requirements功能需求.md#Methodology Discovery & Execution`]
- [Source: `_bmad-output/planning-artifacts/prd/11-non-functional-requirements非功能需求.md#Reliability & Determinism`]
- [Source: `_bmad-output/planning-artifacts/prd/11-non-functional-requirements非功能需求.md#Integration Quality`]
- [Source: `_bmad-output/planning-artifacts/prd/11-non-functional-requirements非功能需求.md#Diagnostics & Observability`]
- [Source: `_bmad-output/planning-artifacts/architecture/01-project-context-analysis项目上下文分析.md#Requirements Overview`]
- [Source: `_bmad-output/planning-artifacts/architecture/03-core-architectural-decisions核心架构决策.md#Data Architecture`]
- [Source: `_bmad-output/planning-artifacts/architecture/03-core-architectural-decisions核心架构决策.md#API & Communication Patterns`]
- [Source: `_bmad-output/planning-artifacts/architecture/04-implementation-patterns-consistency-rules实现模式与一致性规则.md#Structure Patterns`]
- [Source: `_bmad-output/planning-artifacts/architecture/04-implementation-patterns-consistency-rules实现模式与一致性规则.md#Format Patterns`]
- [Source: `_bmad-output/planning-artifacts/architecture/05-project-structure-boundaries项目结构与边界.md#Architectural Boundaries`]
- [Source: `_bmad-output/planning-artifacts/architecture/05-project-structure-boundaries项目结构与边界.md#Requirements to Structure Mapping`]
- [Source: `_bmad-output/planning-artifacts/architecture/05-project-structure-boundaries项目结构与边界.md#Manifest And Index Semantics`]
- [Source: `_bmad-output/planning-artifacts/architecture/06-architecture-validation-results架构验证结果.md#Implementation Readiness Validation`]
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Core User Experience`]
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Phase Coverage Matrix`]
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Skill Activation Journey`]
- [Source: `_bmad-output/planning-artifacts/specs/README.md#Reading Order`]
- [Source: `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md#Source Of Truth`]
- [Source: `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md#Minimum Phase Coverage Matrix`]
- [Source: `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md#Artifact Contract Semantics`]
- [Source: `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md#Skill Index`]
- [Source: `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md#Help Index`]
- [Source: `_bmad-output/planning-artifacts/specs/05-ide-adapter-registry-contract.md#MVP Targets`]
- [Source: `_bmad-output/planning-artifacts/specs/05-ide-adapter-registry-contract.md#Self-Contained Skill Entry Layout`]
- [Source: `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md#menu-target`]
- [Source: `_bmad-output/planning-artifacts/specs/08-fixture-contract.md#Fixture Classes`]
- [Source: `docs/glossary/ide-specific-discovery-metadata.md#Key Rules`]
- [Source: `assets/source/speclite/core-skills/module.yaml`]
- [Source: `assets/source/speclite/core-skills/module-help.csv`]
- [Source: `assets/source/speclite/sdlc-skills/module.yaml`]
- [Source: `assets/source/speclite/sdlc-skills/module-help.csv`]
- [Source: `_bmad-output/implementation-artifacts/1-1-cli-install-entry-and-runtime-guard.md`]
- [Source: `_bmad-output/implementation-artifacts/1-2-project-target-directory-resolution-and-existing-install-detection.md`]
- [Source: `_bmad-output/implementation-artifacts/1-3-official-module-selection-and-install-summary.md`]
- [Source: `_bmad-output/implementation-artifacts/1-4-project-config-initialization.md`]
- [Source: `_bmad-output/implementation-artifacts/1-5-runtime-structure-artifact-directory-and-ide-mirror-creation.md`]
- [Source: `_bmad-output/implementation-artifacts/1-6-install-progress-and-ready-summary.md`]

## Dev Agent Record（开发代理记录）

### Agent Model Used（使用模型）

GPT-5 Codex

### Debug Log References（调试日志引用）

- 2026-05-27 15:05 CST: Dev-story preflight reached Task 1 and found required Epic 1 implementation anchors missing as standalone files: `src/manifest/skill-index.ts`, `src/manifest/help-index.ts`, `src/manifest/files-index.ts`, and `test/fixtures/fixture-harness.ts`. Story 2.1 explicitly requires HALT instead of recreating Epic 1 anchors inside this story.
- 2026-05-27 11:19 CST: Targeted and full test verification showed Epic 1 manifest/index functionality exists through centralized `manifest-generator.ts`, `runtime-structure.ts`, `target-writer.ts`, `manifest-schema.ts`, `fixture-contract.ts`, and fixture/tests. The earlier standalone-file HALT interpretation is superseded by the functional anchor standard in this Story.
- 2026-05-27 11:33 CST: Resumed Story 2.1 under the functional anchor standard. Added failing focused tests first, then implemented metadata projection in the existing manifest/index pipeline.
- 2026-05-27 11:35 CST: Validation passed: `npm run build`, `npm test` (11 test files / 66 tests), and `git diff --check`.
- 2026-05-28 15:40 CST: Corrective focused tests passed for package-root inventory completeness, no-help-row projection separation and menu-target reference integrity.
- 2026-05-28 15:40 CST: Targeted verification passed, 7 files / 52 tests; full `npm test` passed, 20 files / 116 tests; `git diff --check` passed.

### Completion Notes List（完成备注）

- Ultimate context engine analysis completed - comprehensive developer guide created.
- HALT: Story 2.1 implementation did not proceed beyond Task 1 because required Epic 1 implementation anchors are not present as specified by the story precondition.
- Anchor standard revised: absence of standalone `skill-index.ts` / `help-index.ts` / `files-index.ts` / `phase-coverage.ts` files is no longer a blocker when the equivalent manifest/index builders, schemas, runtime write path, and tests exist.
- Implemented Story 2.1 discovery metadata extension through the existing `manifest-generator.ts` / `target-writer.ts` path: source help rows now preserve `required` and `outputs`, phase labels are centralized, phase coverage rows are deterministically sorted, target activation paths are project-relative, and eligible workflow outputs project minimal `artifactContract` summaries.
- Added reserved `menu-target.unknown-skill` diagnostics for orphan `module-help.csv` canonical skill references without leaking absolute paths.
- Added unit, integration and fixture assertions for canonical skill id preservation, artifact contract omission/presence, phase mapping, deterministic sorting, canonical target order, missing package diagnostics, and absence of command pointer / branded `copilot` / `cursor` projection.
- Corrective verification confirmed `skill-index.json` contains the full selected package root inventory (`53` entries for default `core` + `sdlc`), while help/phase projections remain metadata views.
- Added focused coverage proving installed package roots without help/phase rows remain indexed and mirrored, and are not treated as missing installed skills.
- Preserved reserved `menu-target.unknown-skill` behavior for help/phase rows that reference unknown canonical skill ids.

### File List（文件列表）

- _bmad-output/implementation-artifacts/sprint-status.yaml
- _bmad-output/implementation-artifacts/code-reviews/2-1-code-review/EXPERIMENTS.md
- _bmad-output/implementation-artifacts/code-reviews/2-1-code-review/EXPERIMENT_NOTES.md
- _bmad-output/implementation-artifacts/stories/2-1-methodology-discovery-metadata-generation.md
- src/commands/install.ts
- src/ide/target-writer.ts
- src/installer/runtime-structure.ts
- src/manifest/manifest-generator.ts
- src/modules/module-metadata.ts
- test/fixtures/fresh-install-empty-project/expected/installed-state/phase-coverage-dev-story.json
- test/install-module-selection.test.ts
- test/manifest-discovery.test.ts
- test/runtime-structure.test.ts
- test/source-and-modules.test.ts
- _bmad-output/implementation-artifacts/dev-verifications/epic-1-2-corrective-dev-verification/PLAN.md
- _bmad-output/implementation-artifacts/dev-verifications/epic-1-2-corrective-dev-verification/EXPERIMENTS.md
- _bmad-output/implementation-artifacts/dev-verifications/epic-1-2-corrective-dev-verification/EXPERIMENT_NOTES.md
- src/installer/ready-check.ts
- test/ide-target-writer.test.ts
- test/install-progress-ready-summary.test.ts
- test/menu-target-validation.test.ts

### Change Log（变更日志）

- 2026-05-27: Completed Story 2.1 methodology discovery metadata generation and moved status to `review`.
- 2026-05-28: Corrective verification separated full skill inventory from help/phase projections and validated targeted/full regression; Story 状态重新推进至 review。
