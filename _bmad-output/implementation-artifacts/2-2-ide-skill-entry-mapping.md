# Story 2.2: IDE Skill Entry Mapping（IDE Skill Entry 映射）

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story（故事）

作为 AI IDE 使用者，  
我希望 SpecLite 把方法论发现元数据映射成 `.claude/skills` 与 `.agents/skills` 中可加载的 skill entries，  
以便我可以在不同 AI IDE 中看到一致的 SpecLite 能力入口。

## Acceptance Criteria（验收标准）

1. **Claude target receives self-contained canonical skill entries.**  
   **前提** discovery metadata 已由 Story 2.1 生成，且 Epic 1 的 source discovery、module selection、runtime structure、IDE mirror writer、manifest/index 和 safe write 代码已真实实现；  
   **当** 系统处理 `claude` IDE target；  
   **则** 每个可映射的 canonical skill 会生成 `.claude/skills/<canonicalSkillId>/` 下的 self-contained skill entry；  
   **并且** entry 至少包含 `SKILL.md`，并按 canonical package 原 relative path 复制存在的 `CHANGELOG.md`、`references/`、`assets/`、`scripts/`、`config.toml.example` 和 `customize.toml`；  
   **并且** `customize.toml` 只在 source package 已包含该文件时复制并声明该 entry 为 customization-capable；adapter 不得为空缺文件隐式生成 defaults；  
   **并且** adapter 不得因 target 不同而改写 canonical skill package content、canonicalSkillId、directory basename、line endings 或 customization lookup key。

2. **Agents target uses generic `.agents/skills` semantics.**  
   **前提** discovery metadata 已由 Story 2.1 生成；  
   **当** 系统处理 `agents` IDE target；  
   **则** 每个可映射的 canonical skill 会生成 `.agents/skills/<canonicalSkillId>/` 下的 self-contained skill entry；  
   **并且** GitHub Copilot 或 Cursor 在 MVP 中只通过 `agents` target 兼容使用，不生成 `copilot`、`cursor` 或其他 branded target id；  
   **并且** human-readable output、manifest/index、phase coverage、fixture snapshots 和 validation output 都不得把 `agents` 渲染成 Copilot/Cursor readiness。

3. **Mapping result reports installed phase coverage status.**  
   **前提** 某个 IDE target 支持 self-contained skill entry mapping；  
   **当** adapter 完成 entry 写入或 dry-run planning；  
   **则** 系统会在 installed projection 中报告 installed phase coverage status `mapped`；  
   **并且** 每个 target entry 记录 `targetId`、`entryPath`、`activationTarget` 和 `canonicalSkillId`；  
   **并且** path 字段必须是 project-relative POSIX path，不得写入 absolute checkout path、home directory、cache path、temporary path 或 source checkout path。

4. **Unsupported and failed statuses preserve layer boundaries.**  
   **前提** 某个 IDE target 不支持当前 entry type 或 capability；  
   **当** adapter 无法完成映射；  
   **则** 系统会报告 installed phase coverage status `unsupported` 或 `failed`；  
   **并且** `unsupported` 表示 adapter 声明的 capability gap，不是 write failure；`failed` 表示 target directory resolution、schema generation、write 或 reverse validation 已尝试或已计划但失败；  
   **并且** 本 Story 的 reverse validation 只覆盖 self-contained entry layout、target write/readability、canonical bytes/hash 和 activation target boundary；resolver success / config-customization access 的 release gate 明确推迟到 Story 2.4 或 Story 2.5；  
   **并且** 不得把 install planning 的 `planned` / `unsupported` / `failed`、installed phase coverage 的 `mapped` / `unsupported` / `failed`、status summary 的 `not-configured` / `configured` / `partial` / `failed` 混用。

5. **Canonical package hash remains stable across targets.**  
   **前提** 同一 canonical skill 被映射到多个 IDE targets；  
   **当** 系统生成 manifest/index、files index 和 phase coverage projection；  
   **则** 不同 target 的 canonical skill package hash 必须一致；  
   **并且** package-level hash 只覆盖 canonical package content，file-level hash 用于 files index drift/update protection；  
   **并且** target-specific wrapper、catalog、discovery metadata 或 adapter artifact 必须单独记录 sourceRef、ownership 和 file hash，不得混入 canonical package hash。

6. **Command pointer remains a non-goal in MVP.**  
   **前提** MVP adapter registry 声明 `commandPointerBehavior`；  
   **当** 系统处理 command pointer capability；  
   **则** 只允许记录 `none` 或 `unsupported` 语义；  
   **并且** 不会生成 GitHub Copilot/Cursor 专用 command pointer artifact、wrapper command file 或 branded adapter output；  
   **并且** 如未来需要 command pointer，必须先更新 adapter registry owning SPEC、manifest/index contract、executable schema/parser 和 fixtures。

7. **Diagnostics use reserved issue categories and stay redaction-safe.**  
   **前提** target mirror 缺失、hash mismatch、重复 entry、unsupported selected target、target write failure、help/menu target 无法解析或 phase coverage 没有 mapped target；  
   **当** 系统产生 diagnostics；  
   **则** 必须使用 reserved issue categories 和 issue ids，例如 `ide-mirror.missing-entry`、`ide-mirror.hash-mismatch`、`ide-mirror.duplicate-entry`、`ide-mirror.unsupported-target`、`ide-mirror.target-write-failed`、`menu-target.missing-target` 或 `menu-target.no-mapped-target`；  
   **并且** issue id 不得包含 path、target、skill id、hash、timestamp、random id 或动态值；  
   **并且** public details 不得泄露 absolute path、home directory、cache path、temporary path、environment variable、credential、stack trace 或 raw exception object。

8. **Focused tests and fixtures prove the adapter mapping contract.**  
   **前提** Story 2.2 修改 adapter registry、target writer、manifest/index target projection、files index、phase coverage、diagnostics 或 fixtures；  
   **当** 开发者完成实现；  
   **则** 必须补充 unit、integration 和 fixture assertions，覆盖 `claude` / `agents` target order、self-contained entry layout、canonical package bytes/hash stability、optional copied paths、unsupported/failed status mapping、no branded Copilot/Cursor target、no command pointer artifact、project-relative POSIX paths 和 redaction-safe diagnostics；  
   **并且** tests 必须 local-only、deterministic、parse JSON semantically，不访问 npm registry、Git remote、private registry、offline bundle origin 或外部网络。

## Tasks / Subtasks（任务 / 子任务）

- [ ] Task 1: 验证 Story 2.1 和 Epic 1 前置实现（AC: 1-8）
  - [ ] 确认 Story 1.1-1.6 已真实实现，而不只是 story context 处于 `ready-for-dev`：需要存在 `package.json`、`src/`、`test/`、`src/manifest/manifest-schema.ts`、`src/manifest/manifest-generator.ts`、`src/manifest/skill-index.ts`、`src/manifest/help-index.ts`、`src/manifest/files-index.ts`、`src/manifest/phase-coverage.ts`、`src/ide/adapter-registry.ts`、`src/ide/target-writer.ts` 或等价 adapter modules，以及 fixture harness。
  - [ ] 确认 Story 2.1 已真实提供 discovery metadata / phase coverage generator、canonical skill id preservation、help index identity boundary 和 artifactContract minimal projection。
  - [ ] 如果上述实现 anchors 仍不存在，停止 Story 2.2 实现，先完成前置 stories；不得在 Story 2.2 中重建 CLI scaffold、source resolver、module parser、manifest generator、discovery metadata generator 或 config resolver。
  - [ ] 检查当前 worktree dirty 状态，保留与本 Story 无关的 planning artifacts、story 文件、sprint status 或用户改动；不得格式化、重写、同步或回滚无关文件。

- [ ] Task 2: 收口 adapter registry target definitions（AC: 2, 4, 6）
  - [ ] 在 `src/ide/adapter-registry.ts` 中提供或复用 `claude` 与 `agents` adapter definitions，target directory 分别固定为 `.claude/skills` 与 `.agents/skills`。
  - [ ] 导出 `CANONICAL_TARGET_ORDER = ["claude", "agents"] as const`，并让 manifest generation、`CommandResult.data.ideTargets`、validation `checkedTargets`、phase coverage rows 和 fixture snapshots 复用该顺序。
  - [ ] Adapter definition shape 至少包含 `id`、`targetDirectory`、`entryType: "self-contained-skill"`、`supportedActivationTargets`、`sharedTargetPolicy: "dedupe-by-canonical-skill-id"`、`commandPointerBehavior: "none" | "unsupported"`、`knownLimitations`、`validationChecks` 和 `targetOrder`。
  - [ ] 不新增 `copilot`、`cursor`、`kiro`、`opencode`、`vscode` 或任何 branded/dedicated MVP target id；除非 future owning SPEC 先更新。
  - [ ] Adapter registry 不得拥有 config/customization merge logic、source trust 判断、files-index ownership 规则或 command pointer artifact generation。

- [ ] Task 3: 实现 self-contained skill entry writer（AC: 1, 2, 3, 5）
  - [ ] 在 `src/ide/target-writer.ts` 或 existing adapter modules 中实现 registry-driven target writer；`src/commands/install.ts` 只负责编排，不直接复制 skill package。
  - [ ] 输入必须来自 Story 2.1 生成的 canonical discovery metadata / selected module metadata / skill index facts；不得从 display name、menu label、filesystem glob order 或 IDE label 重新推导 identity。
  - [ ] Target entry directory basename 必须是 `<canonicalSkillId>`，路径分别为 `.claude/skills/<canonicalSkillId>/` 与 `.agents/skills/<canonicalSkillId>/`。
  - [ ] 每个 entry 至少包含 `SKILL.md`；当 canonical source package 中存在 `CHANGELOG.md`、`references/`、`assets/`、`scripts/`、`config.toml.example` 或 `customize.toml` 时，按相同 relative path 复制。
  - [ ] 仅当 canonical source package 存在 `customize.toml` 时，installed entry 才可被视为 customization-capable；不得为缺少 defaults 的 skill 生成空 `customize.toml`、placeholder defaults 或 adapter-owned fallback。
  - [ ] 复制过程必须保留 canonical text bytes、LF line endings、relative path、script executable intent 和 sourceRef；不得按平台改写 canonical package content。
  - [ ] Target writer 必须复用 `src/fs/` 的 path normalization、safe write、copy-tree、project boundary、symlink escape、case conflict 和 unsafe overwrite checks。

- [ ] Task 4: 投影 manifest/index、phase coverage 和 files index（AC: 3, 5）
  - [ ] `skill-index.json` 的 `installedTargets[]` 记录每个 mapped target 的 `targetId`、entry path、activation target、status 和 target-specific metadata reference（如存在）。
  - [ ] `help-index.json` 继续只引用 `canonicalSkillId`、phase、entry label、activation target 和 target ids；不得创建 alias-only identity 或 IDE-specific skill identity。
  - [ ] `phase-coverage.json` rows 使用 `speclite.phase-coverage.v1`，每个 `ideTargets[]` item 包含 `targetId`、`entryPath`、`activationTarget` 和 installed phase coverage status。
  - [ ] `files-index.json` 记录 installed entries 的 file-level `path`、`ownership: "installer-owned"`、`hash`、`hashAlgorithm: "sha256"`、`executable`、`artifactKind` 和 `sourceRef`。
  - [ ] `canonicalPackageHash` 是 package-level hash，只证明同一 canonical package 在不同 IDE targets 中内容一致；不要用 files-index file-level hash 替代它。
  - [ ] Public arrays 使用明确排序：targets 按 `claude`、`agents`；phase coverage rows 按 `phaseId`、`moduleId`、`canonicalSkillId`；paths normalize 后排序。

- [ ] Task 5: 处理 unsupported、failed 和 duplicate cases（AC: 4, 7）
  - [ ] 如果 selected target 不支持 self-contained skill entry 或 command pointer behavior，按 adapter registry layer 输出 `unsupported`，并在用户显式选择该 target 时产生 blocking issue。
  - [ ] 如果 target directory resolution、schema generation、write、safe write 或 reverse validation 失败，输出 `failed`，并使用 `ide-mirror.target-write-failed` 或更精确的 reserved issue id。
  - [ ] 本 Story 的 reverse validation failure 只覆盖 installed entry 是否存在、可读、路径 project-relative、canonical package hash 稳定和 activation target 指向 installed `SKILL.md`；不得把 Story 2.4 的 resolver success 或 Story 2.5 的 artifact loop success 作为 2.2 release gate。
  - [ ] 如果 canonical package 缺少 required `SKILL.md`，不要创建空 entry；使用 source/manifest/menu 相关 reserved diagnostic，或先更新 owning SPEC 再新增 issue id。
  - [ ] 如果同一 target 中出现重复 canonicalSkillId entry，使用 `ide-mirror.duplicate-entry`；不要通过重命名 target directory、添加后缀或 alias 来绕过冲突。
  - [ ] 如果 help/menu target 无法解析到唯一 installed entry，使用 `menu-target.missing-target`、`menu-target.ambiguous-target`、`menu-target.unknown-skill` 或 `menu-target.no-mapped-target`。
  - [ ] Diagnostics details 只能包含 stable, redaction-safe fields；动态 context 放入 `affectedPath`、`component` 或 `details`，不得拼进 issue id。

- [ ] Task 6: 保持 UX evidence 与 output 边界（AC: 2, 3, 4, 6）
  - [ ] Human-readable output 可以展示 mapped target table 或 evidence block，字段优先顺序为 target id、target directory、skill count、entry path、activation target、status。
  - [ ] 输出必须在 `NO_COLOR`、non-TTY、CI 和窄终端中仍可理解；颜色、icon、spinner 或 terminal width 不得承载唯一语义。
  - [ ] `agents` target 显示为 `.agents/skills` 或 agents directory target，不渲染为 Copilot/Cursor readiness。
  - [ ] Automation-relevant state 必须进入 manifest/index、`CommandResult.data` 或 fixture outputs；不得要求自动化解析 human-readable summary。
  - [ ] Empty state 必须明确，例如某 phase 无 mapped target 时输出 layer-correct status 或 `menu-target.no-mapped-target`，不得用 alias-only identity 伪造覆盖。

- [ ] Task 7: 编写 focused tests、integration tests 和 fixture assertions（AC: 1-8）
  - [ ] Unit tests 覆盖 `CANONICAL_TARGET_ORDER`、adapter definition schema、command pointer `none` / `unsupported`、no branded target ids 和 agents generic display。
  - [ ] Unit tests 覆盖 target writer 复制 `SKILL.md` 与 optional paths、保留 relative path、LF text bytes、script executable intent、canonical directory basename 和 customization lookup key。
  - [ ] Fixture 中的 customization-capable success path 必须选择 source package 已包含 `customize.toml` 的 canonical skill，例如 `speclite-create-prd` 或 `speclite-create-story`；同时断言缺少 `customize.toml` 的 skill 不会被安装器补空 defaults。
  - [ ] Unit tests 覆盖 canonical package hash across `claude` / `agents`、files-index file-level hash、adapter artifact 独立 sourceRef/hash、duplicate canonicalSkillId handling。
  - [ ] Contract tests 解析 `skill-index.json`、`help-index.json`、`files-index.json` 和 `phase-coverage.json`，断言 schema versions、target order、required target fields、status vocabulary 和 no alternate identity。
  - [ ] Integration tests 覆盖 fresh install selected core+sdlc modules 后生成 `.claude/skills/<canonicalSkillId>/` 与 `.agents/skills/<canonicalSkillId>/`，并验证 package hash 一致。
  - [ ] Integration tests 覆盖只选 `claude`、只选 `agents`、unsupported optional target、selected unsupported target blocking、target write failure 和 reverse validation failure。
  - [ ] Fixture `fresh-install-empty-project`、`ide-drift`、`path-portability` 和 `skill-artifact-loop` 更新 expected installed tree、manifest/index snapshots、command JSON 或 validation assertions。
  - [ ] 检查 fixture snapshots 没有 absolute path、home directory、cache path、temporary path、timestamp、random id、Copilot/Cursor target id 或 command pointer artifact。

- [ ] Task 8: 本地验证与范围控制（AC: 1-8）
  - [ ] 运行 `npm run build`。
  - [ ] 运行 `npm test`，或至少运行 Story 2.2 touched modules 的 focused Vitest tests 与相关 fixture tests。
  - [ ] 如新增或改变 public JSON field、manifest/index field、target status、issue id、fixture comparison behavior、adapter definition field 或 command pointer behavior，确认同一变更中先更新 owning SPEC、executable schema/parser 和 fixture expected outputs。
  - [ ] 检查 diff，确认没有修改 `_bmad-output/planning-artifacts/`、其他 story 文件或无关用户改动。
  - [ ] 检查 diff，确认没有实现 Story 2.3 activation protocol、Story 2.4 resolver、Story 2.5 workflow artifact validation、Epic 3 full validation、Post-MVP command pointer、branded Copilot/Cursor adapter、coverage dashboard 或治理报告。

## Dev Notes（开发备注）

### Current Repository State（当前仓库状态）

- 创建本 Story 时，仓库根目录未发现 `package.json`、`package-lock.json`、`src/`、`test/`、`tests/` 或 root `fixtures/` 实现目录。Story 2.2 的开发必须在 Epic 1 与 Story 2.1 实际代码完成后进行。
- `_bmad-output/implementation-artifacts/1-1-cli-install-entry-and-runtime-guard.md` 到 `1-6-install-progress-and-ready-summary.md` 以及 `2-1-methodology-discovery-metadata-generation.md` 当前是 `ready-for-dev` story context，不是完成后的代码证据。
- 当前 worktree 已存在与本 Story 创建无关的 dirty planning artifacts、`sprint-status.yaml` 改动和未跟踪 Epic 1 / Story 2.1 story 文件。实现 Story 2.2 时不得格式化、重写、同步或回滚这些无关改动。
- `assets/source/speclite/` 已存在，并包含 bundled source assets、module metadata、help CSV 和 canonical skill packages。当前可见 source package pattern 包括：
  - `assets/source/speclite/core-skills/<canonicalSkillId>/SKILL.md`
  - `assets/source/speclite/sdlc-skills/<phase-or-group>/<canonicalSkillId>/SKILL.md`
  - `assets/source/speclite/sdlc-skills/1-analysis/research/<canonicalSkillId>/SKILL.md`
- `_bmad-output/project-context.md` 当前仍是初始化占位内容；实际 implementation guardrails 以 live PRD、Architecture、UX 和 owning SPEC artifacts 为准。

### Scope Boundary（范围边界）

- 本 Story 只负责 IDE adapter registry driven self-contained skill entry mapping、target writer、target-specific mapping status、canonical package hash stability、manifest/index target projection、files-index installed entry projection、diagnostics 和对应 tests/fixtures。
- 本 Story 可以扩展 Epic 1 已存在的 `src/ide/`、`src/manifest/`、`src/fs/`、`src/diagnostics/`、`src/validation/` 与 fixture anchors；不得创建平行 adapter registry、第二套 manifest/index generator、第二套 skill identity registry 或私有 config/customization resolver。
- 本 Story 不负责：
  - Story 2.1 的 discovery metadata generation、phase coverage generator 或 artifactContract source extraction。
  - Story 2.3 的 IDE entry activation protocol、phase capability coverage UX 或 full activation loop。
  - Story 2.4 的 `speclite resolve config` / `speclite resolve customization` implementation 或 resolver success gate。
  - Story 2.5 的 workflow artifact writing、metadata sidecars 或 artifact validation。
  - Epic 3 的 full `status` / `validate` installed-state validation。
  - Post-MVP command pointer artifact、dedicated Copilot/Cursor adapter、coverage dashboard、trend report 或 multi-project governance rollup。

### Architecture Requirements（架构要求）

- Runtime baseline remains Node.js 22 minimum and Node.js 24 recommended. Do not use Node 24-only APIs unless a Node 22-compatible path exists and runtime policy / fixtures are updated.
- CLI foundation remains TypeScript + commander. Do not introduce oclif/yargs/cac/clipanion for this Story.
- Storage model is local-first filesystem. Do not introduce database, web service, daemon, REST API, GraphQL, desktop UI, persistent cache server or background process.
- `src/commands/install.ts` should orchestrate only. Adapter definitions and target order belong in `src/ide/adapter-registry.ts`; self-contained entry writing belongs in `src/ide/target-writer.ts` or adapter modules; public projection belongs in `src/diagnostics/`; path normalization and safe write belong in `src/fs/`; manifest/index projection belongs in `src/manifest/`.
- All public paths in command output, issues, manifest/index projections and tests must use project-relative POSIX-style paths unless an owning SPEC explicitly marks a field non-stable/redacted.
- Source-side truth is `assets/source/speclite/` module metadata and canonical skill packages. Installed-side truth is manifest/index projection. IDE mirrors are execution-plane projections, not source truth.

### Adapter Registry Requirements（Adapter Registry 要求）

Required MVP adapter definition guidance:

```ts
type IdeAdapterDefinition = {
  id: "claude" | "agents";
  targetDirectory: ".claude/skills" | ".agents/skills";
  entryType: "self-contained-skill";
  supportedActivationTargets: string[];
  sharedTargetPolicy: "dedupe-by-canonical-skill-id";
  commandPointerBehavior: "none" | "unsupported";
  knownLimitations: string[];
  validationChecks: string[];
  targetOrder: number;
};
```

- Treat this shape as implementation guidance only; the executable source of truth must live in `src/ide/adapter-registry.ts` and owning SPECs.
- MVP target ids are physical execution targets: `claude` maps to `.claude/skills`; `agents` maps to `.agents/skills`.
- `CANONICAL_TARGET_ORDER` must be `claude`, then `agents`.
- Adapter definitions must not rename canonical skill ids, canonical package directories or customization lookup keys.
- `agents` is a generic directory target. Do not present it as Copilot/Cursor readiness unless future dedicated adapter SPEC introduces branded targets.

### Self-Contained Entry Requirements（Self-Contained Entry 要求）

- Target entry layout:
  - `.claude/skills/<canonicalSkillId>/`
  - `.agents/skills/<canonicalSkillId>/`
- Required file: `SKILL.md`.
- Optional copied paths, when present in the canonical source package:
  - `CHANGELOG.md`
  - `references/`
  - `assets/`
  - `scripts/`
  - `config.toml.example`
  - `customize.toml`
- `customize.toml` is both an optional copied file and the MVP marker for a customization-capable installed entry. If the source package lacks `customize.toml`, the installed entry remains valid but is not a resolver customization success fixture candidate.
- Adapter and target writer must not synthesize empty defaults, copy defaults from another skill, or infer customization capability from display name、menu label、phase label、target id or source directory group.
- Installed entry must not read source checkout files as runtime dependencies. It must remain discoverable and usable after the source checkout is unavailable.
- Adapter-specific wrapper files, metadata or capability catalogs are adapter artifacts. They do not define skill semantics and do not participate in canonical package hash.
- Source canonical text files use LF. Installer/adapter must not rewrite line endings per platform.

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
- `skill-index` maps canonical skill ids to source package metadata and installed target entries.
- `help-index` maps user-facing menu/help entries to canonical skills and must not create alternate skill ids.
- `phase-coverage` rows expose installed phase coverage target status using `mapped`、`unsupported`、`failed` only.
- `files-index` owns file-level integrity and ownership projections for installed entries.

### Status And Diagnostics Requirements（状态与诊断要求）

- Target status must be layer-scoped:
  - Install planning: `planned`、`unsupported`、`failed`
  - Installed phase coverage: `mapped`、`unsupported`、`failed`
  - Status summary: `not-configured`、`configured`、`partial`、`failed`
- `unsupported` is a declared capability gap. It is not a write failure.
- `failed` means a target directory resolution, schema generation, write, safe write or reverse validation step failed.
- Use existing issue taxonomy where applicable:
  - `ide-mirror.missing-entry`
  - `ide-mirror.hash-mismatch`
  - `ide-mirror.duplicate-entry`
  - `ide-mirror.unsupported-target`
  - `ide-mirror.target-write-failed`
  - `menu-target.missing-target`
  - `menu-target.ambiguous-target`
  - `menu-target.unknown-skill`
  - `menu-target.no-mapped-target`
  - `file-integrity.*` only when the problem is generic installed file/hash mismatch rather than target-specific mirror behavior.
- Do not add free-form issue ids. If a genuinely new public diagnostic is required, update owning SPEC and fixture expected outputs first.

### UX And Output Requirements（UX 与输出要求）

- SpecLite UX is terminal + local filesystem control plane, not GUI.
- Output should expose evidence: target ids、entry paths、activation targets、skill counts、manifest/index paths、status and next action.
- Human-readable output may use tables or key-value evidence blocks, but structured output and manifest/index files carry automation facts.
- Output must work in `NO_COLOR`、non-TTY、CI and narrow terminal contexts. Do not rely on ANSI color, icon, spinner-only progress or terminal-width-specific formatting for meaning.
- Empty states must be explicit, for example `No mapped skill entry for phaseId=<id>` with a stable issue or status.

### Previous Story Intelligence（前序 Story 情报）

- Story 2.1 establishes discovery metadata as the input to this Story. Story 2.2 must consume its canonical capability identity and target facts; it must not redefine phase metadata, artifactContract semantics or alternate skill identity.
- Story 2.1 requires `canonicalSkillId` to come from source skill package or source module metadata, not IDE adapter、menu label、directory traversal order or display name. Story 2.2 must preserve that boundary through target entry basenames and manifest/index projection.
- Story 2.1 already requires target order `claude` then `agents`, project-relative POSIX paths, no command pointer generation and no branded `copilot` / `cursor` target id. Story 2.2 must make those requirements concrete in target writer behavior.
- Story 1.5 already planned `_speclite` runtime writes, `.claude/skills` / `.agents/skills` mirrors, manifest/index projection, ownership/hash/safe-write/path-safety and no-ready-summary failure gate. Story 2.2 should extend/solidify those anchors rather than recreating them.
- Story 1.6 planned ready summary evidence and target summary semantics. Story 2.2 must ensure target mapping data is available for ready summary without adding a non-contract `readySummary` JSON blob.

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

- No new third-party dependency is required for this Story. Use project-pinned libraries from Architecture and previous stories: `commander@14.0.3`、`yaml@2.9.0`、`toml@4.1.1`、`csv-parse@6.2.1`、`fs-extra@11.3.5`、`zod@4.4.3`、`typescript@6.0.3`、`tsx@4.21.0`、`tsup@8.5.1`、`vitest@4.1.6` and `@types/node@22`.
- Use Node.js 22-compatible `node:fs/promises`、`node:path`、`node:crypto` and stable ECMAScript APIs. Do not introduce Node 24-only behavior.
- Do not add globbing、hashing、table rendering、prompt、validation、adapter or filesystem dependencies silently. If a new dependency seems necessary, justify it against Architecture, update package/test fixtures and keep Node 22 compatibility.
- External web research was not required for this Story because the implementation surface is fully governed by project-owned live PRD, Architecture, UX and owning SPEC contracts, and no dependency upgrade is part of the acceptance scope.

### Project Context Reference（项目上下文引用）

- `_bmad-output/project-context.md` currently contains initialized metadata and placeholder sections only; it does not add implementation rules beyond live PRD, Architecture, UX and owning SPEC artifacts.
- The project-level language rule remains: conversation and generated docs in Chinese, section headings in `English（中文）` form, technical identifiers in English.

### References（参考）

- [Source: `_bmad-output/planning-artifacts/epics/05-epic-2-methodology-discovery-and-skill-execution方法论发现与-skill-执行.md#Story 2.2`]
- [Source: `_bmad-output/planning-artifacts/epics/05-epic-2-methodology-discovery-and-skill-execution方法论发现与-skill-执行.md#Epic 2`]
- [Source: `_bmad-output/planning-artifacts/prd/01-executive-summary执行摘要.md`]
- [Source: `_bmad-output/planning-artifacts/prd/03-success-criteria成功标准.md`]
- [Source: `_bmad-output/planning-artifacts/prd/05-user-journeys用户旅程.md#Journey 2`]
- [Source: `_bmad-output/planning-artifacts/prd/05-user-journeys用户旅程.md#Journey 5`]
- [Source: `_bmad-output/planning-artifacts/prd/08-developer-tool-specific-requirements开发者工具特定需求.md#API Surface`]
- [Source: `_bmad-output/planning-artifacts/prd/10-functional-requirements功能需求.md#Methodology Discovery & Execution`]
- [Source: `_bmad-output/planning-artifacts/prd/11-non-functional-requirements非功能需求.md#Reliability & Determinism`]
- [Source: `_bmad-output/planning-artifacts/prd/11-non-functional-requirements非功能需求.md#Integration Quality`]
- [Source: `_bmad-output/planning-artifacts/prd/11-non-functional-requirements非功能需求.md#Diagnostics & Observability`]
- [Source: `_bmad-output/planning-artifacts/architecture/01-project-context-analysis项目上下文分析.md#Requirements Overview`]
- [Source: `_bmad-output/planning-artifacts/architecture/02-starter-template-evaluationstarter-模板评估.md#Selected Starter`]
- [Source: `_bmad-output/planning-artifacts/architecture/03-core-architectural-decisions核心架构决策.md#Data Architecture`]
- [Source: `_bmad-output/planning-artifacts/architecture/03-core-architectural-decisions核心架构决策.md#API & Communication Patterns`]
- [Source: `_bmad-output/planning-artifacts/architecture/04-implementation-patterns-consistency-rules实现模式与一致性规则.md#Structure Patterns`]
- [Source: `_bmad-output/planning-artifacts/architecture/04-implementation-patterns-consistency-rules实现模式与一致性规则.md#Format Patterns`]
- [Source: `_bmad-output/planning-artifacts/architecture/05-project-structure-boundaries项目结构与边界.md#Architectural Boundaries`]
- [Source: `_bmad-output/planning-artifacts/architecture/05-project-structure-boundaries项目结构与边界.md#Requirements to Structure Mapping`]
- [Source: `_bmad-output/planning-artifacts/architecture/05-project-structure-boundaries项目结构与边界.md#Manifest And Index Semantics`]
- [Source: `_bmad-output/planning-artifacts/architecture/06-architecture-validation-results架构验证结果.md#Implementation Readiness Validation`]
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Core User Experience`]
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Skill Activation Journey`]
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Phase Coverage Matrix`]
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Target Table`]
- [Source: `_bmad-output/planning-artifacts/specs/README.md#Reading Order`]
- [Source: `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md#Source Of Truth`]
- [Source: `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md#Canonical Target Identity`]
- [Source: `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md#Minimum Phase Coverage Matrix`]
- [Source: `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md#Skill Index`]
- [Source: `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md#Help Index`]
- [Source: `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md#Files Index`]
- [Source: `_bmad-output/planning-artifacts/specs/05-ide-adapter-registry-contract.md#MVP Targets`]
- [Source: `_bmad-output/planning-artifacts/specs/05-ide-adapter-registry-contract.md#Adapter Definition Shape`]
- [Source: `_bmad-output/planning-artifacts/specs/05-ide-adapter-registry-contract.md#Self-Contained Skill Entry Layout`]
- [Source: `_bmad-output/planning-artifacts/specs/05-ide-adapter-registry-contract.md#Status Semantics`]
- [Source: `_bmad-output/planning-artifacts/specs/05-ide-adapter-registry-contract.md#Adapter Responsibilities`]
- [Source: `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md#ide-mirror`]
- [Source: `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md#menu-target`]
- [Source: `_bmad-output/planning-artifacts/specs/08-fixture-contract.md#Fixture Classes`]
- [Source: `assets/source/speclite/core-skills/module.yaml`]
- [Source: `assets/source/speclite/core-skills/module-help.csv`]
- [Source: `assets/source/speclite/sdlc-skills/module.yaml`]
- [Source: `assets/source/speclite/sdlc-skills/module-help.csv`]
- [Source: `_bmad-output/implementation-artifacts/1-5-runtime-structure-artifact-directory-and-ide-mirror-creation.md`]
- [Source: `_bmad-output/implementation-artifacts/1-6-install-progress-and-ready-summary.md`]
- [Source: `_bmad-output/implementation-artifacts/2-1-methodology-discovery-metadata-generation.md`]

## Dev Agent Record（开发代理记录）

### Agent Model Used（使用模型）

_To be filled by the dev-story agent._

### Debug Log References（调试日志引用）

### Completion Notes List（完成备注）

- Ultimate context engine analysis completed - comprehensive developer guide created.

### File List（文件列表）
