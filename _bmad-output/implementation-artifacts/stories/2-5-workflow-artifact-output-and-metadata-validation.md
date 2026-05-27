# Story 2.5: Workflow Artifact Output And Metadata Validation（Workflow Artifact 输出与 Metadata 校验）

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story（故事）

作为 AI IDE 使用者，  
我希望已激活的 workflow 能把产物写入配置约定的位置，并记录稳定 metadata，  
以便团队可以追踪每个产物来自哪个 workflow、哪个 skill，以及是否满足 MVP artifact contract。

## Acceptance Criteria（验收标准）

1. **Workflow artifacts use configured project-relative output paths（Workflow 产物使用配置约定的项目相对输出路径）**  
   **前提** 已激活 workflow 读取到项目级输出路径配置，且 Epic 1 的 `_speclite-output` / configured artifact root 创建、Story 2.1 artifactContract projection、Story 2.2 self-contained entry、Story 2.3 activation target、Story 2.4 `speclite resolve` runtime support 已真实实现；  
   **当** workflow 生成 planning、implementation 或 review artifact；  
   **则** artifact 会写入 `_speclite-output` 或配置约定的 workflow artifact root；  
   **并且** artifact root、default output path 和实际 artifact path 必须以 project-relative POSIX-style path 记录；  
   **并且** full skill-artifact-loop release gate 从本 Story 开始验证 resolver success + artifact write + metadata value-domain；Story 2.2 / Story 2.3 不要求该 gate 成功；  
   **并且** 路径解析后必须位于 target project boundary 内，不得通过 absolute path、drive letter、`..`、symlink 或 path escape 指向项目外。

2. **Artifact metadata contains the required MVP fields（Artifact Metadata 包含 MVP 必需字段）**  
   **前提** workflow 写入 artifact；  
   **当** artifact metadata 被生成；  
   **则** metadata 至少包含非空稳定字符串 `workflowType`、非空 canonical skill id 形式的 `sourceSkill`；  
   **并且** 必须包含 ISO 8601 string 形式的 `generatedAt`；  
   **并且** `sourceSkill` 必须来自 installed canonical skill id，不得来自 display name、menu label、phase label、IDE-specific alias、target directory label 或 source checkout path。

3. **Markdown artifacts store metadata in leading YAML frontmatter（Markdown 产物在文件开头存储 YAML Frontmatter）**  
   **前提** workflow artifact 是 Markdown 文件；  
   **当** workflow 写入 artifact metadata；  
   **则** metadata 必须位于文件开头的 YAML frontmatter；  
   **并且** frontmatter 至少包含 `workflowType`、`sourceSkill` 和 `generatedAt`；  
   **并且** 如果 artifact 已有 workflow state frontmatter，implementation 必须合并同一个 leading frontmatter block，不得创建第二个 frontmatter block 或把 metadata 写入正文 prose。

4. **Non-Markdown file and directory artifacts use sidecar metadata（非 Markdown 文件与目录产物使用 Sidecar Metadata）**  
   **前提** workflow artifact 不是 Markdown 文件或是目录产物；  
   **当** workflow 写入 artifact metadata；  
   **则** 非 Markdown file artifact 必须写出同目录 `<artifact-filename>.metadata.json`；  
   **并且** directory artifact 必须在 artifact directory 内写出 `metadata.json`；  
   **并且** sidecar metadata file 与 artifact 本体一样属于 workflow-owned artifact，不得被 install、update 或 repair 当作 installer-owned changed path。

5. **`generatedAt` is parseable but excluded from stable snapshot equality（`generatedAt` 可解析但不参与稳定快照等值比较）**  
   **前提** workflow artifact 完成写入；  
   **当** validator 或 fixture comparison 读取 artifact metadata；  
   **则** `generatedAt` 必须存在且可 parse 为 ISO 8601 string；  
   **并且** stable fixture snapshot comparison 必须 normalize、omit 或单独标记该字段为 non-stable；  
   **并且** 缺少 `generatedAt` 或值域不合法必须作为 artifact contract violation 报告，不能因为 timestamp 不稳定而放弃校验该字段存在性。

6. **Existing workflow-owned artifacts are protected from installer/update overwrite（既有 Workflow-Owned 产物受安装器与更新保护）**  
   **前提** workflow artifact 已存在；  
   **当** 新 workflow 产物准备写入，或 install/update/repair 处理 artifact root；  
   **则** install、update 和 repair 不得静默覆盖、删除、重排或格式化 workflow-owned artifact 或其 metadata sidecar；  
   **并且** workflow 自身的 overwrite / append / create-new 策略必须由该 workflow 明确拥有；  
   **并且** installer/update 的 ownership、hash、repair 和 changed/skipped/conflict projection 不得把 workflow-owned artifact 当成可修复 installer-owned drift。

7. **Artifact validation uses existing taxonomy and stays structural（Artifact 校验使用既有分类且只检查结构）**  
   **前提** validate、fixture 或 artifact contract helper 检查 artifact metadata；  
   **当** artifact path 缺失、越界、symlink/path escape、不可写，或 metadata 缺失/值域不合法；  
   **则** 使用 `artifact-path` category 的 reserved issue id，例如 `artifact-path.escapes-project`、`artifact-path.symlink-escape`、`artifact-path.missing-required-directory`、`artifact-path.unwritable-directory`、`artifact-path.fixture-write-failed`、`artifact-path.missing-required-metadata` 或 `artifact-path.invalid-required-metadata`；  
   **并且** issue id 不得包含 path、skill id、workflow type、hash、timestamp、random id 或 parser message；  
   **并且** MVP validation 不检查产物叙事质量、人工评审结论、业务正确性或内容完整度。

8. **Artifact contract has one canonical semantic source（Artifact Contract 只有一个语义真源）**  
   **前提** artifact contract 被写入 manifest/index、phase coverage、discovery metadata、skill workflow helper、validator 或 fixture expected outputs；  
   **当** 后续 skill、validator 或自动化读取它；  
   **则** artifact type、configured artifact root、default output path、`workflowType`、`sourceSkill` 和 `generatedAt` 语义必须与 manifest/index owning SPEC 保持一致；  
   **并且** 不得在 PRD、Architecture、CommandResult、workflow prose、fixture helper 或 single skill 中定义第二套 artifact contract；  
   **并且** 如需新增 artifact kind、metadata field、issue id 或 fixture comparison rule，必须先更新 owning SPEC，再更新 executable schema/parser 和 fixture expected outputs。

## Tasks / Subtasks（任务 / 子任务）

- [x] Task 1: 验证前置 stories 与当前仓库实现状态（AC: 1-8）
  - [x] 确认 Story 1.1-1.6 已真实实现，而不只是 story context 处于 `ready-for-dev`：至少需要存在 `package.json`、`src/`、`test/`、`src/fs/path-normalizer.ts`、`src/diagnostics/command-result-schema.ts`、`src/manifest/manifest-schema.ts`、`src/ide/adapter-registry.ts`、`src/config/resolve-output-schema.ts`、`src/validation/issue-model.ts`、`src/fixtures/fixture-contract.ts` 和 fixture assets/tests。
  - [x] 确认 Story 2.1 已真实提供 discovery metadata / `artifactContract` projection，Story 2.2 已真实提供 self-contained IDE entries，Story 2.3 已真实提供 installed activation target，Story 2.4 已真实提供 `speclite resolve config/customization` runtime support。
  - [x] 如果上述 implementation anchors 仍不存在，停止 Story 2.5 实现，先完成前置 stories；不得在 Story 2.5 中重建 CLI scaffold、manifest generator、IDE target writer、activation resolver 或 config/customization resolver。
  - [x] 检查当前 worktree dirty 状态，保留与本 Story 无关的 planning artifacts、story 文件、sprint status 或用户改动；不得格式化、重写、同步或回滚无关文件。

- [x] Task 2: 收口 artifact contract executable shape 与 metadata helper（AC: 2, 3, 4, 5, 8）
  - [x] 在 `src/manifest/manifest-schema.ts` 或 existing manifest/index schema anchor 中定义/复用 artifact contract 与 required metadata field parser；不要在 workflow helper、renderer 或 fixture helper 中手写第二套 schema。
  - [x] 如需新增 helper module，优先放在现有边界内，例如 `src/manifest/artifact-contract.ts`、`src/validation/artifact-metadata.ts` 或等价模块；不要引入宽泛的 workflow framework 目录，除非前序实现已建立该边界。
  - [x] 复用 Story 2.1 的 `artifactContract` eligibility / normalization matrix：只有可解析到 configured artifact root 的单一 project-relative output 可进入 contract；多输出 rows 保持 absent / Post-MVP；`_speclite/custom`、`_speclite/_memory` 等 control/custom paths 不进入 artifact contract。
  - [x] 定义最小 artifact metadata shape：`workflowType`、`sourceSkill`、`generatedAt`；如实现需要 `artifactType` 或 `metadataVersion`，必须确认 owning SPEC 已允许，或先更新 SPEC。
  - [x] `workflowType` 必须是 non-empty stable string；建议使用 source/workflow metadata 中的 stable lower-kebab value，但不得从 file title 或 prose 猜测。
  - [x] `sourceSkill` 必须使用 installed canonical skill id；不得使用 `display-name`、`menu-code`、target id 或 branded IDE name。
  - [x] `generatedAt` 使用 runtime-generated ISO 8601 string；不要使用 locale-specific format、filesystem mtime、human-readable date 或 fixture-local fake string 作为 public value。

- [x] Task 3: 实现 configured artifact root 与 output path resolution（AC: 1, 6, 7）
  - [x] 通过 Story 2.4 的 `speclite resolve config --project-root <project>` 读取 `output_folder`、`planning_artifacts`、`implementation_artifacts`、`project_knowledge` 或 module-specific output convention；不得调用 legacy Python resolver 或读取 source checkout config 作为 installed runtime contract。
  - [x] 解析 `module-help.csv` / phase coverage / artifactContract 中的 output-location 时，只允许使用已解析 config 中的 project-bound variables；没有明确 contract 时保持 artifactContract absent 或返回 reserved diagnostic，不得猜测路径。
  - [x] 对 `{planning_artifacts}|{project_knowledge}` 这类多输出 source row，MVP 不投影为单一 `artifactContract`；只有 future owning SPEC 定义 multi-output shape 后才能纳入。
  - [x] 对 `{project-root}/_speclite/custom`、`{project-root}/_speclite/_memory/...` 等 control/custom paths，保持 `artifactContract` absent，并避免 workflow artifact validator 将其视为产物输出目录。
  - [x] 所有 artifact root、default output path、actual artifact path 先 normalize 为 project-relative POSIX path，再执行 project boundary、symlink escape、path escape 和 unwritable directory 检查。
  - [x] 对 `_speclite-output` 或 configured output root 只创建缺失目录；不要清空、重排、格式化或覆盖已有 workflow-owned artifacts。
  - [x] 若 artifact root 位于项目外、通过 symlink escape 指向项目外、不可写或缺失 required directory，使用 `artifact-path.*` reserved issue id。

- [x] Task 4: 实现 Markdown frontmatter metadata encoding（AC: 2, 3, 5, 8）
  - [x] 对 Markdown artifact，在文件第一个字节开始写入或更新 single leading YAML frontmatter block；如果文件已有 frontmatter，合并 required metadata fields 而不是追加第二个 block。
  - [x] 使用 Architecture-pinned `yaml@2.9.0` 或现有 YAML parser 解析/写入 frontmatter；不要静默新增 `gray-matter` 或其他 frontmatter dependency。
  - [x] 保留正文 Markdown 内容，不因写入 metadata 改写标题、列表、表格、中文内容或人工编辑段落。
  - [x] Frontmatter 中 required metadata fields 必须可被 validator 读取；不得只在完成消息、human-readable prose 或 comment 中记录。
  - [x] Tests 覆盖无 frontmatter、已有 frontmatter、已有 workflow state fields、缺失 metadata、invalid generatedAt 和多 frontmatter anti-pattern。

- [x] Task 5: 实现 sidecar metadata encoding for non-Markdown and directory artifacts（AC: 2, 4, 5, 6）
  - [x] 对非 Markdown file artifact，在同目录写出 `<artifact-filename>.metadata.json`，并包含与 Markdown frontmatter 相同的 required metadata keys。
  - [x] 对 directory artifact，在 artifact directory 内写出 `metadata.json`。
  - [x] Sidecar JSON 必须 deterministic、UTF-8、无 absolute path、无 timestamp 以外的 non-stable field；`generatedAt` 作为允许的 non-stable field 只做 semantic parse。
  - [x] Sidecar metadata file 本身以 `workflow-owned` 处理，install/update/repair 不得把它当成 installer-owned changed path 或 repair candidate。
  - [x] 如果 sidecar 已存在，workflow helper 必须按该 workflow 的明确 output strategy 处理；installer/update logic 不能替 workflow 决定覆盖。

- [x] Task 6: 接入 artifact-path validation 与 diagnostics（AC: 1, 5, 7, 8）
  - [x] 在 `src/validation/rules/artifact-path.ts` 或 existing artifact validation rule 中检查 configured artifact root、default output path、actual artifact path 和 required metadata value domains。
  - [x] Validation rule 只读取 installed manifest/index、phase coverage/discovery metadata、artifact files 和 sidecar metadata；不得访问 npm registry、Git remote、private registry、offline bundle origin 或 source checkout。
  - [x] 使用 taxonomy 中 reserved issue ids：`artifact-path.escapes-project`、`artifact-path.symlink-escape`、`artifact-path.missing-required-directory`、`artifact-path.unwritable-directory`、`artifact-path.fixture-write-failed`、`artifact-path.missing-required-metadata`、`artifact-path.invalid-required-metadata`。
  - [x] `details` 只能包含 deterministic、redaction-safe fields，例如 metadata key、artifact type、normalized path role 或 parse result；不得包含 raw absolute path、home directory、stack trace、timestamp、hash、raw parser error 或 artifact content excerpt。
  - [x] 不新增 `workflow-artifact` category、`metadata` category 或 free-form issue id；确需新增时先更新 validation taxonomy SPEC 和 fixture assertions。

- [x] Task 7: 暴露 artifact evidence，但不创建治理 dashboard（AC: 1, 5, 7）
  - [x] 在 `src/diagnostics/output.ts` 或 existing Evidence profile renderer 中支持 artifact evidence block / row，字段优先顺序为 artifact path、artifact type、workflowType、sourceSkill、generatedAt、configured root、default output path、metadata location。
  - [x] Human-readable output 可展示 artifact evidence，但 automation 必需字段必须进入 manifest/index、artifact metadata file、`CommandResult.data` 中已契约化字段或 fixture expected outputs。
  - [x] 窄终端、`NO_COLOR`、non-TTY 和 CI 输出不得丢失 artifact path、metadata key、issue id 或 next action。
  - [x] 不实现 Post-MVP coverage dashboard、trend report、multi-project governance rollup 或 richer artifact quality scoring。

- [x] Task 8: 编写 focused tests、integration tests 和 `skill-artifact-loop` fixture assertions（AC: 1-8）
  - [x] Unit tests 覆盖 artifact metadata parser/writer：Markdown frontmatter、non-Markdown sidecar、directory metadata、required field presence、invalid value domains、generatedAt ISO parsing 和 snapshot normalization/exclusion。
  - [x] Unit tests 覆盖 path normalization：configured root、default output path、actual artifact path、project boundary、symlink/path escape、unwritable directory 和 project-relative POSIX output。
  - [x] Unit tests / fixture assertions 覆盖 Story 2.1 eligibility matrix：single configured artifact root eligible、multi-output absent / Post-MVP、control/custom paths absent、unknown or escaping path diagnostic。
  - [x] Unit tests 覆盖 workflow-owned protection：existing artifact / metadata sidecar 不被 install/update/repair changed paths 或 repair plan 收编。
  - [x] Integration tests 覆盖 installed skill 通过 `speclite resolve` 读取 config/customization 后写出一个 planning 或 review artifact，并记录 metadata。
  - [x] Fixture `test/fixtures/skill-artifact-loop/` 必须覆盖 installed IDE entry discovery、activation protocol、resolver access、artifact write、metadata value-domain validation 和 generatedAt normalization/exclusion。
  - [x] Fixture 只校验 artifact type、default output path、metadata location 和 metadata value domains；不要校验复杂 workflow 叙事质量、人工评审结论或内容完整度。
  - [x] 若新增 artifact kind、metadata field、issue id、fixture comparison behavior 或 public output field，必须在同一变更中先更新 owning SPEC、executable schema/parser 和 fixture expected outputs。

- [x] Task 9: 本地验证与范围控制（AC: 1-8）
  - [x] 运行 `npm run build`。
  - [x] 运行 `npm test`，或至少运行 Story 2.5 touched modules 的 focused Vitest tests 与相关 fixture tests。
  - [x] 运行或更新 `skill-artifact-loop` fixture；如前置 implementation 尚未完成，保留失败为有效前置信号，不要伪造 artifact loop pass。
  - [x] 检查 diff，确认没有修改 `_bmad-output/planning-artifacts/`、其他 story 文件或无关用户改动。
  - [x] 检查 diff，确认没有实现 Epic 3 full `status` / `validate` category coverage、Epic 4 update/repair behavior、Epic 6 full fixture matrix、Post-MVP command pointer、branded Copilot/Cursor target、governance dashboard、top-level `repair` / `sync` / `doctor` / `uninstall`。

## Dev Notes（开发备注）

### Current Repository State（当前仓库状态）

- 创建本 Story 时，仓库根目录未发现 `package.json`、`package-lock.json`、`src/`、`test/`、`tests/` 或 root `fixtures/` 实现目录。Story 2.5 的开发必须在 Epic 1 与 Story 2.1-2.4 实际代码完成后进行。
- `_bmad-output/implementation-artifacts/1-1-cli-install-entry-and-runtime-guard.md` 到 `1-6-install-progress-and-ready-summary.md`，以及 `2-1` 到 `2-4` 当前是 `ready-for-dev` story context，不是完成后的代码证据。
- 当前 worktree 已存在与本 Story 创建无关的 dirty planning artifacts、`sprint-status.yaml` 改动和未跟踪 Epic 1 / Story 2.1-2.4 story 文件。实现 Story 2.5 时不得格式化、重写、同步或回滚这些无关改动。
- `_bmad-output/project-context.md` 当前仍是初始化占位内容；实际 implementation guardrails 以 live PRD、Architecture、UX、ADR 和 owning SPEC artifacts 为准。
- `assets/source/speclite/` 已存在，并包含 bundled source assets、module metadata、custom stubs、legacy Python resolver scripts 和 canonical skill packages。当前 source metadata 中已有 output-location / outputs 字段，例如 `planning_artifacts`、`implementation_artifacts`、`project_knowledge` 和 `{output_folder}`。

### Scope Boundary（范围边界）

- 本 Story 只负责 workflow artifact output path contract、artifact metadata encoding、frontmatter/sidecar rules、artifact-path structural validation、workflow-owned artifact protection、artifact evidence output 和 `skill-artifact-loop` 最小 metadata fixture。
- 本 Story 可以扩展前序 stories 已建立的 `src/manifest/`、`src/validation/`、`src/fs/`、`src/diagnostics/`、`src/config/` 与 fixture anchors；不得创建第二套 artifact contract、第二套 config resolver、第二套 issue taxonomy 或第二套 path normalization helper。
- 本 Story 不负责：
  - Story 2.1 discovery metadata generation、phase coverage generator 或 artifactContract extraction source ownership。
  - Story 2.2 self-contained entry copy/write behavior、canonical package hash generation 或 IDE target writer。
  - Story 2.3 activation target uniqueness、phase coverage evidence UX 或 menu-target diagnostics beyond artifact loop usage。
  - Story 2.4 config/customization resolver merge behavior。
  - Epic 3 full `speclite validate` category coverage、status health aggregation、checkedCategories 或 validation progress UX。
  - Epic 4 update/repair plan execution beyond preserving workflow-owned artifacts in ownership semantics.
  - Epic 6 full release-gate matrix beyond the focused `skill-artifact-loop` assertions required here.
  - Post-MVP dashboards、coverage percentages、trend reports、enterprise rollups、command pointer artifacts 或 dedicated Copilot/Cursor adapters。

### Architecture Requirements（架构要求）

- Runtime baseline remains Node.js 22 minimum and Node.js 24 recommended. Do not use Node 24-only APIs unless a Node 22-compatible path exists and runtime policy / fixtures are updated.
- CLI foundation remains TypeScript + commander. Do not introduce oclif/yargs/cac/clipanion for this Story.
- Storage model is local-first filesystem. Do not introduce database, web service, daemon, REST API, GraphQL, desktop UI, persistent cache server or background process.
- `src/commands/` should orchestrate only. Artifact contract projection belongs in `src/manifest/`; metadata/path validation belongs in `src/validation/` and `src/fs/`; config access belongs in `src/config/` / `speclite resolve`; human-readable rendering belongs in `src/diagnostics/output.ts`.
- All public paths in command output、issues、manifest/index projections、artifact metadata and tests must use project-relative POSIX-style paths unless an owning SPEC explicitly marks a field non-stable/redacted.
- Artifact contract fields and metadata semantics are owned by `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md`; validation categories and issue ids are owned by `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md`.

### Artifact Metadata Requirements（Artifact Metadata 要求）

Required metadata:

```ts
type WorkflowArtifactMetadata = {
  workflowType: string;
  sourceSkill: string;
  generatedAt: string;
};
```

- Treat this shape as implementation guidance only; executable source of truth must live in the existing schema/parser anchor and owning SPECs.
- `workflowType` must be a non-empty stable string. Do not derive it from the human title or output filename if source/workflow metadata already provides it.
- `sourceSkill` must be a non-empty canonical skill id. It must match the installed skill identity used by manifest/index and phase coverage.
- `generatedAt` must be an ISO 8601 string. Prefer `Date.toISOString()` or an injectable clock helper for tests; do not use locale-specific strings.
- `generatedAt` is required but non-stable for snapshot equality. Fixtures must semantic-parse it and normalize/omit the concrete value.

### Metadata Encoding Requirements（Metadata 编码要求）

- Markdown artifact:
  - metadata lives in the first YAML frontmatter block;
  - frontmatter starts at the beginning of the file;
  - merge with existing frontmatter when present;
  - do not append a second frontmatter block;
  - do not store required metadata only in comments or prose.
- Non-Markdown file artifact:
  - write same-directory `<artifact-filename>.metadata.json`;
  - JSON sidecar contains the same required metadata keys;
  - sidecar is workflow-owned.
- Directory artifact:
  - write `metadata.json` inside the artifact directory;
  - directory and metadata are workflow-owned.
- Manifest/index may record artifact contract or metadata location, but cannot replace on-disk metadata.

### Artifact Path And Ownership Requirements（产物路径与所有权要求）

| Path / Content（路径 / 内容） | Ownership（所有权） | Rule（规则） |
| --- | --- | --- |
| `_speclite-output/**` workflow outputs | `workflow-owned` | Created by activated workflows; install/update/repair must not silently overwrite. |
| configured `planning_artifacts` | `workflow-owned` artifact root | Paths must be project-relative POSIX and inside target project boundary. |
| configured `implementation_artifacts` | `workflow-owned` artifact root | Stories, reviews, retrospectives and implementation records live here. |
| Markdown artifact frontmatter | part of workflow artifact | Required metadata must be readable by validator and fixture comparison. |
| `<artifact-filename>.metadata.json` | `workflow-owned` sidecar | Protected like the artifact itself; not installer-owned drift. |
| directory `metadata.json` | `workflow-owned` sidecar | Protected like the directory artifact itself. |
| `_speclite/_config/phase-coverage.json` artifactContract projection | `installer-owned` installed projection | May reference contract/default path, but does not replace artifact metadata. |

### Validation And Diagnostics Requirements（校验与诊断要求）

- Use existing `artifact-path` category for artifact root, path, writeability and metadata contract violations.
- Reserved issue ids relevant to this Story:
  - `artifact-path.escapes-project`
  - `artifact-path.symlink-escape`
  - `artifact-path.missing-required-directory`
  - `artifact-path.unwritable-directory`
  - `artifact-path.fixture-write-failed`
  - `artifact-path.missing-required-metadata`
  - `artifact-path.invalid-required-metadata`
- Do not use `manifest-schema` for artifact metadata value-domain failures unless the installed manifest/index shape itself is malformed.
- Do not use `file-integrity` for workflow artifact metadata missing/invalid; `file-integrity` is for installed files / files index / installer-owned drift.
- Do not use `update` category for artifact validation; `update` is for command-level update/repair planning blockers.
- `ValidationIssue.details`、impact 和 suggestedNextStep 必须 stable、redaction-safe，不包含 absolute path、home directory、hash、timestamp、stack trace 或 raw parser message。

### Previous Story Intelligence（前序 Story 情报）

- Story 2.1 establishes artifactContract as an optional minimal projection in discovery metadata / phase coverage. Story 2.5 must consume that contract and finalize on-disk metadata behavior, not redefine artifact fields in a separate registry.
- Story 2.1 also owns artifactContract eligibility / normalization. Story 2.5 must reuse the same matrix for `output-location` rows and must not admit multi-output, `_speclite/custom`, `_speclite/_memory`, or other control/custom paths into a single MVP artifact contract.
- Story 2.1 requires canonical skill id preservation and deterministic sorting. Story 2.5 must use the same canonical `sourceSkill` identity and avoid filesystem traversal order as behavior source.
- Story 2.2 establishes self-contained IDE entries under `.claude/skills/<canonicalSkillId>/` and `.agents/skills/<canonicalSkillId>/`. Story 2.5 must assume workflows run from installed entries and should not mutate generated IDE mirrors to add target-specific artifact behavior.
- Story 2.3 establishes activation target as installed `SKILL.md` and a resolver access boundary. Story 2.5 artifact loop should start from installed skill activation, not source checkout files.
- Story 2.4 implements `speclite resolve config/customization` as the stable runtime support command. Story 2.5 must use it to locate artifact roots and customization, not `python3 resolve_*.py` or internal build paths.
- Story 2.5 owns the full skill-artifact-loop release gate after Story 2.4 resolver success exists; prior Story 2.2 / 2.3 gates remain limited to entry layout, activation target, and resolver invocation boundary.
- Story 1.5 creates `_speclite-output` / configured artifact repository directories and marks workflow artifacts as protected from install/update/repair overwrite. Story 2.5 writes artifacts inside that protected model and must not weaken ownership.
- Story 1.6 establishes ready summary and Evidence output semantics. Story 2.5 may add artifact evidence, but must not add a non-contract ready summary blob or turn artifact evidence into a Post-MVP governance dashboard.

### File Structure Requirements（文件结构要求）

Expected Story 2.5 implementation anchors, adjusted to existing code if equivalent modules already exist:

```text
src/manifest/manifest-schema.ts
src/manifest/artifact-contract.ts
src/validation/rules/artifact-path.ts
src/validation/artifact-metadata.ts
src/fs/path-normalizer.ts
src/diagnostics/output.ts
src/config/resolve-output-schema.ts
test/unit/manifest/artifact-contract.test.ts
test/unit/validation/artifact-metadata.test.ts
test/unit/validation/artifact-path.test.ts
test/integration/skill-artifact-loop.test.ts
test/fixtures/skill-artifact-loop/
```

- This list is Story-scoped. Add helper files only when they directly support artifact metadata and path validation.
- If `src/manifest/artifact-contract.ts` or `src/validation/artifact-metadata.ts` would conflict with already implemented local module names, use the existing module boundary instead.
- Do not add broad workflow orchestration framework, dashboard exporter, enterprise report generator, command pointer artifact, or full validate category runner inside this Story.

### Testing Requirements（测试要求）

- Use Vitest and fixture assertions.
- Tests must be deterministic and local-only; do not access npm registry、Git remote、private registry、offline bundle origin、package-manager cache or external network.
- JSON and metadata tests must parse output semantically and assert required fields, ordering and absence of non-contract fields.
- YAML frontmatter tests should use existing parser helpers or `yaml@2.9.0`; do not silently add new frontmatter dependencies.
- Stable snapshots must not contain absolute paths、home directories、OS-specific separators、random ids、process ids、environment variables、credentials、stack traces or concrete `generatedAt` values.
- Any public artifact contract change must update owning SPEC、executable schema/parser and fixture expected outputs in the same change.

### Git Intelligence（Git 情报）

- Recent commits are documentation/context/spec oriented, not implementation scaffold:
  - `a0b08ef style(docs): 清理参考文档尾随空白`
  - `1ab545f docs(context): 初始化项目上下文文档`
  - `a4f8ab9 docs(source): 同步内置源资产路径说明`
  - `6e3d4e4 docs(glossary): 整理术语目录与文档索引`
  - `5b2c7a4 docs(specs): 收敛 MVP 契约与实现锚点`
- `5b2c7a4` updated live SPEC contracts for CommandResult、SourceDescriptor、InstallPlan、manifest/index、IDE adapter registry、validation taxonomy and fixtures; treat live sharded docs and owning SPECs as current implementation truth.
- Do not use `_bmad-output/planning-artifacts/archive/` whole documents as live contract sources.
- Worktree was already dirty when this Story was created; implementation agents must preserve unrelated user changes.

### Latest Technical Information（最新技术信息）

- No new third-party dependency is required for this Story. Use project-pinned libraries from Architecture and previous stories: `commander@14.0.3`、`yaml@2.9.0`、`toml@4.1.1`、`csv-parse@6.2.1`、`fs-extra@11.3.5`、`zod@4.4.3`、`typescript@6.0.3`、`tsx@4.21.0`、`tsup@8.5.1`、`vitest@4.1.6` and `@types/node@22`.
- Use Node.js 22-compatible `node:fs/promises`、`node:path` and stable ECMAScript APIs. Do not introduce Node 24-only behavior.
- Do not add frontmatter、globbing、terminal UI、dashboard、date/time、validation、filesystem or artifact-management dependencies silently. If a new dependency seems necessary, justify it against Architecture, update package/test fixtures and keep Node 22 compatibility.
- External web research was not required for this Story because the implementation surface is governed by project-owned live PRD, Architecture, UX, ADR and owning SPEC contracts, and no dependency upgrade is part of the acceptance scope.

### Project Context Reference（项目上下文引用）

- `_bmad-output/project-context.md` currently contains initialized metadata and placeholder sections only; it does not add implementation rules beyond live PRD, Architecture, UX, ADR and owning SPEC artifacts.
- The project-level language rule remains: conversation and generated docs in Chinese, section headings in `English（中文）` form, technical identifiers in English.

### References（参考）

- [Source: `_bmad-output/planning-artifacts/epics/05-epic-2-methodology-discovery-and-skill-execution方法论发现与-skill-执行.md#Story 2.5`]
- [Source: `_bmad-output/planning-artifacts/epics/05-epic-2-methodology-discovery-and-skill-execution方法论发现与-skill-执行.md#Epic 2`]
- [Source: `_bmad-output/implementation-artifacts/2-1-methodology-discovery-metadata-generation.md`]
- [Source: `_bmad-output/implementation-artifacts/2-2-ide-skill-entry-mapping.md`]
- [Source: `_bmad-output/implementation-artifacts/2-3-skill-activation-and-phase-capability-coverage.md`]
- [Source: `_bmad-output/implementation-artifacts/2-4-runtime-config-and-customization-resolve.md`]
- [Source: `_bmad-output/implementation-artifacts/1-5-runtime-structure-artifact-directory-and-ide-mirror-creation.md`]
- [Source: `_bmad-output/implementation-artifacts/1-6-install-progress-and-ready-summary.md`]
- [Source: `_bmad-output/planning-artifacts/prd/05-user-journeys用户旅程.md#Journey 2`]
- [Source: `_bmad-output/planning-artifacts/prd/05-user-journeys用户旅程.md#Journey 4`]
- [Source: `_bmad-output/planning-artifacts/prd/05-user-journeys用户旅程.md#Journey 5`]
- [Source: `_bmad-output/planning-artifacts/prd/08-developer-tool-specific-requirements开发者工具特定需求.md#Technical Architecture Considerations`]
- [Source: `_bmad-output/planning-artifacts/prd/08-developer-tool-specific-requirements开发者工具特定需求.md#API Surface`]
- [Source: `_bmad-output/planning-artifacts/prd/10-functional-requirements功能需求.md#Methodology Discovery & Execution`]
- [Source: `_bmad-output/planning-artifacts/prd/10-functional-requirements功能需求.md#Update & File Ownership Protection`]
- [Source: `_bmad-output/planning-artifacts/prd/10-functional-requirements功能需求.md#Maintainer Workflow & Examples`]
- [Source: `_bmad-output/planning-artifacts/prd/11-non-functional-requirements非功能需求.md#Security & Safety`]
- [Source: `_bmad-output/planning-artifacts/prd/11-non-functional-requirements非功能需求.md#Integration Quality`]
- [Source: `_bmad-output/planning-artifacts/prd/11-non-functional-requirements非功能需求.md#Diagnostics & Observability`]
- [Source: `_bmad-output/planning-artifacts/prd/11-non-functional-requirements非功能需求.md#Maintainability & Extensibility`]
- [Source: `_bmad-output/planning-artifacts/architecture/03-core-architectural-decisions核心架构决策.md#Data Architecture`]
- [Source: `_bmad-output/planning-artifacts/architecture/03-core-architectural-decisions核心架构决策.md#API & Communication Patterns`]
- [Source: `_bmad-output/planning-artifacts/architecture/04-implementation-patterns-consistency-rules实现模式与一致性规则.md#Format Patterns`]
- [Source: `_bmad-output/planning-artifacts/architecture/05-project-structure-boundaries项目结构与边界.md#Architectural Boundaries`]
- [Source: `_bmad-output/planning-artifacts/architecture/05-project-structure-boundaries项目结构与边界.md#Manifest And Index Semantics`]
- [Source: `_bmad-output/planning-artifacts/architecture/06-architecture-validation-results架构验证结果.md#Implementation Handoff`]
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Journey 3: Phase-Based Skill Use & Artifact Evidence`]
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Artifact Evidence Card`]
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Filesystem Space Map`]
- [Source: `_bmad-output/planning-artifacts/specs/README.md#Reading Order`]
- [Source: `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md#Artifact Contract Semantics`]
- [Source: `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md#Artifact Metadata Encoding`]
- [Source: `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md#Files Index`]
- [Source: `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md#artifact-path`]
- [Source: `_bmad-output/planning-artifacts/specs/08-fixture-contract.md#Fixture Classes`]
- [Source: `_bmad-output/planning-artifacts/specs/08-fixture-contract.md#Comparison Rules`]
- [Source: `_bmad-output/planning-artifacts/epics/06-epic-3-installed-state-and-deterministic-validation已安装状态与确定性验证.md#Story 3.4`]
- [Source: `_bmad-output/planning-artifacts/epics/09-epic-6-maintainer-fixture-and-release-confidence维护者-fixture-与发布信心.md#Story 6.5`]
- [Source: `docs/glossary/workflow-artifact.md`]
- [Source: `docs/glossary/file-ownership-boundaries.md`]
- [Source: `docs/glossary/speclite-runtime-boundaries.md`]
- [Source: `assets/source/speclite/core-skills/module.yaml`]
- [Source: `assets/source/speclite/core-skills/module-help.csv`]
- [Source: `assets/source/speclite/sdlc-skills/module.yaml`]
- [Source: `assets/source/speclite/sdlc-skills/module-help.csv`]

## Dev Agent Record（开发代理记录）

### Agent Model Used（使用的代理模型）

GPT-5 Codex

### Debug Log References（调试日志引用）

- `python3 /Users/fancyliu/Repos/SpecLite/_bmad/scripts/resolve_customization.py --skill /Users/fancyliu/Repos/SpecLite/.agents/skills/bmad-create-story --key workflow` failed because local `python3` lacks stdlib `tomllib`.
- `python3.12 /Users/fancyliu/Repos/SpecLite/_bmad/scripts/resolve_customization.py --skill /Users/fancyliu/Repos/SpecLite/.agents/skills/bmad-create-story --key workflow` resolved workflow successfully; `workflow.on_complete` is empty.
- Full `sprint-status.yaml` was read before creation; `2-5-workflow-artifact-output-and-metadata-validation` was `backlog`, and `epic-2` was `in-progress`.
- `python3 /Users/fancyliu/Repos/SpecLite/_bmad/scripts/resolve_customization.py --skill /Users/fancyliu/Repos/SpecLite/.agents/skills/bmad-dev-story --key workflow` failed because local `python3` lacks stdlib `tomllib`; `python3.12 ... --key workflow` resolved successfully.
- Preflight confirmed required Story 1.x / 2.1-2.4 implementation anchors exist: `package.json`, `src/`, `test/`, `src/fs/path-normalizer.ts`, `src/diagnostics/command-result-schema.ts`, `src/manifest/manifest-schema.ts`, `src/ide/adapter-registry.ts`, `src/config/resolve-output-schema.ts`, `src/validation/issue-model.ts`, `src/fixtures/fixture-contract.ts`, fixture assets/tests, `artifactContract`, installed activation targets and `speclite resolve` support.
- Red phase: `npm test -- --run test/artifact-metadata.test.ts test/artifact-path-validation.test.ts test/skill-artifact-loop.test.ts` failed with missing `artifact-metadata` and `artifact-path` modules.
- Green/refactor focused validation: `npm test -- --run test/artifact-metadata.test.ts test/artifact-path-validation.test.ts test/skill-artifact-loop.test.ts` passed with 3 files / 11 tests.
- Validation: `npm run build` passed.
- Validation: `npm test -- --run test/artifact-metadata.test.ts test/artifact-path-validation.test.ts test/skill-artifact-loop.test.ts test/manifest-discovery.test.ts test/runtime-structure.test.ts` passed with 5 files / 26 tests.
- Validation: `npm test` passed with 19 files / 109 tests.
- Validation: `git diff --check` passed.

### Completion Notes List（完成备注清单）

- Ultimate context engine analysis completed - comprehensive developer guide created.
- Story 2.5 created with `Status: ready-for-dev`.
- Scope respected: this create-story run should not modify planning artifacts、Story 2.1/2.2/2.3/2.4、Epic 1 story files、source code or unrelated files.
- Added canonical executable artifact metadata schema and artifact contract validation anchors in `src/manifest/manifest-schema.ts`, including required `workflowType` / `sourceSkill` / `generatedAt` parsing and project-relative POSIX output path validation.
- Added `src/validation/artifact-metadata.ts` for Markdown leading YAML frontmatter merge/read, non-Markdown and directory sidecar metadata paths, deterministic sidecar JSON, generatedAt snapshot normalization and workflow-owned artifact path classification.
- Added `src/validation/rules/artifact-path.ts` for structural configured root / default output / actual artifact path validation, project-boundary checks, symlink escape checks, missing/unwritable directory checks and reserved `artifact-path.*` metadata diagnostics with redaction-safe details.
- Extended `src/diagnostics/output.ts` with artifact evidence rows containing artifact path, type, workflowType, sourceSkill, generatedAt, configured root, default output path and metadata location; no dashboard or scoring behavior was added.
- Added focused unit tests for artifact metadata, sidecar behavior, workflow-owned protection, artifact-path diagnostics and artifact evidence output.
- Extended `skill-artifact-loop` integration coverage to install an entry, resolve config/customization, write a metadata-bearing workflow artifact under the configured artifact root, validate metadata value domains and normalize `generatedAt`.
- Added `test/fixtures/skill-artifact-loop/` fixture metadata documenting the minimal Story 2.5 release-gate surface.

### File List（文件清单）

- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/implementation-artifacts/stories/2-5-workflow-artifact-output-and-metadata-validation.md`
- `_bmad-output/implementation-artifacts/code-reviews/2-5-code-review/EXPERIMENTS.md`
- `_bmad-output/implementation-artifacts/code-reviews/2-5-code-review/EXPERIMENT_NOTES.md`
- `src/diagnostics/output.ts`
- `src/manifest/manifest-schema.ts`
- `src/validation/artifact-metadata.ts`
- `src/validation/rules/artifact-path.ts`
- `test/artifact-metadata.test.ts`
- `test/artifact-path-validation.test.ts`
- `test/skill-artifact-loop.test.ts`
- `test/fixtures/skill-artifact-loop/README.md`
- `test/fixtures/skill-artifact-loop/fixture-case.json`

### Change Log（变更日志）

- 2026-05-27: Implemented workflow artifact metadata encoding, artifact path validation, artifact evidence output and the focused `skill-artifact-loop` metadata fixture; Story 2.5 moved to review.
