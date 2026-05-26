# Story 1.5: Runtime Structure, Artifact Directory And IDE Mirror Creation（运行时结构、产物目录与 IDE 镜像创建）

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story（故事）

作为项目维护者，  
我希望在确认安装计划后由系统创建 SpecLite 运行时结构、过程产物目录和 AI IDE skill mirrors，  
以便目标项目获得可运行、可发现、可验证的 SpecLite 安装结果。

## Acceptance Criteria（验收标准）

1. **Write phase starts only after all previous install gates are complete.**  
   **前提** runtime/platform guard、target directory confirmation、official module selection、source descriptor trust/evidence gate、project config initialization 和 final configuration summary 已完成；  
   **当** `speclite install` 进入 runtime / artifact / IDE mirror 写入阶段；  
   **则** 系统必须复用前序 Story 已产生的 `InstallPlan`、selected modules、target adapters、project config model、artifact root 和 `writeAuthorized` state；  
   **并且** 如果 Story 1.1-1.4 的实现文件、schema anchors 或 confirmed planning state 不存在，必须停止本 Story 实现，先完成前序 Story，不得在 Story 1.5 中重建前序流程或绕过确认 gate。

2. **Operation lock, path safety and safe-write guard every mutation.**  
   **前提** 写入阶段准备应用 planned writes；  
   **当** 系统即将创建或修改任何 installer-owned path；  
   **则** 必须先获取 `_speclite/.lock` project operation lock，并执行 project-boundary、symlink escape、path escape、case conflict 和 unsafe overwrite 检查；  
   **并且** fresh install 中如果 `_speclite/` 尚不存在，系统可以在 target confirmation、source trust / integrity gate 和 final configuration summary 已确认后，先创建 `_speclite/` 作为 `_speclite/.lock` parent；该受限目录创建视为 lock acquisition 的一部分；  
   **并且** 除 `_speclite/` lock parent 与 `_speclite/.lock` 外，任何 runtime/config/mirror/manifest/artifact mutation 仍必须在 lock 获取成功后执行；  
   **并且** installer-owned file mutation 必须使用 same-directory temp-write + rename；  
   **并且** lock file 与 safe-write temporary files 不得进入 manifest/index、files index、public JSON 或 stable fixture snapshot。

3. **`_speclite` metadata/control hub is created with installer-owned runtime files.**  
   **前提** 写入授权有效且 path safety 通过；  
   **当** 系统创建 SpecLite runtime structure；  
   **则** 必须创建 `_speclite` metadata/control hub 和 `_speclite/_config` installed-state directory；  
   **并且** 必须写入 installer-owned `_speclite/config.toml`、`_speclite/config.user.toml`、manifest/index files、required runtime scripts/templates、module runtime directories 和 help catalog projections；  
   **并且** Node MVP runtime support 必须以 `speclite resolve config` / `speclite resolve customization` 为主，不得把 legacy Python resolver 当作新的主控制面依赖或第二套 merge logic。

4. **Human-owned project-level custom stubs are create-if-absent only.**  
   **前提** `_speclite/custom/config.toml` 或 `_speclite/custom/config.user.toml` 不存在；  
   **当** fresh install 应用 human-owned project-level stubs；  
   **则** 只能按 create-if-absent 规则创建这两个 project-level stubs，并在 files index 中以 `human-owned` 投影其 protection boundary；  
   **并且** 如果任一目标已存在，不得覆盖、重写、重排、格式化、normalize 或公开其内容；  
   **并且** 本 Story 不得默认创建 `_speclite/custom/{skill}.toml` 或 `_speclite/custom/{skill}.user.toml`。

5. **Artifact repository directories are created without overwriting workflow artifacts.**  
   **前提** project config 定义了 `output_folder`、`planning_artifacts`、`implementation_artifacts` 或 module declarative directories；  
   **当** 系统创建 artifact repository；  
   **则** 必须创建 `_speclite-output` 或配置约定的 project-relative artifact root 及 selected modules 声明的目录结构；  
   **并且** 现有 workflow-owned artifacts、artifact metadata sidecars、用户文档和过程产物不得作为 installer-owned changed paths，也不得被 install/update/repair 覆盖；  
   **并且** artifact root 必须解析在 target project boundary 内，symlink/path escape 必须使用 owning SPEC 中的 reserved `artifact-path` issue。

6. **Claude target mirror uses canonical self-contained skill entries.**  
   **前提** 用户选择了 `claude` target，且 adapter registry 声明该 target 可计划写入；  
   **当** 系统生成 IDE execution mirror；  
   **则** 必须把 selected modules 中的 canonical skill packages 安装到 `.claude/skills/<canonicalSkillId>/`；  
   **并且** canonical package discovery 必须支持 selected module directory 下的 nested `SKILL.md` package roots，不得只检查 module directory top-level；  
   **并且** selected module 若缺少 canonical self-contained skill package，不得作为默认 installed module 进入 `.claude/skills` mirror；除非后续 source assets 补齐 packages 或 owning SPEC 定义 metadata-only module contract，否则必须作为 blocking diagnostic 处理；  
   **并且** 每个 entry 至少包含 `SKILL.md`，并按相同 relative path 复制 canonical package 中存在的 `CHANGELOG.md`、`references/`、`assets/`、`scripts/`、`config.toml.example` 和 `customize.toml`；  
   **并且** adapter 不得修改 canonical skill package content、canonical skill id、directory basename 或 customization lookup key。

7. **Agents target mirror uses the same canonical packages and target order.**  
   **前提** 用户选择了 `agents` target，且 adapter registry 声明该 target 可计划写入；  
   **当** 系统生成 IDE execution mirror；  
   **则** 必须把同一批 canonical skill packages 安装到 `.agents/skills/<canonicalSkillId>/`；  
   **并且** `.agents` target 必须使用与 `.claude` 相同的 canonical package eligibility，不得为 missing package module 合成空 skill、metadata-only skill 或 target-specific placeholder；  
   **并且** canonical package bytes、package-level hash 和 source reference 不得因 IDE target 不同而变化；  
   **并且** 所有 target planning、manifest projection、`CommandResult.data.ideTargets`、validation target lists 和 fixture snapshots 必须使用 canonical target order：`claude` 再 `agents`，不得依赖 glob、filesystem、user selection 或 async completion order。

8. **Manifest and indexes project installed state without becoming source truth.**  
   **前提** runtime files、artifact directories 和 selected IDE mirrors 已按 plan 应用；  
   **当** 系统生成 installed-state projection；  
   **则** 必须写入 `_speclite/_config/manifest.yaml`、`skill-index.json`、`help-index.json`、`files-index.json` 和 `phase-coverage.json`；  
   **并且** 每个 artifact 必须包含 owning SPEC 规定的 schema version；  
   **并且** projection 必须记录 selected modules、source descriptor、IDE targets、canonical skill package hash、target entries、help/menu entries、phase coverage、ownership、file-level hash、executable intent、sourceRef 和 project-relative POSIX paths；  
   **并且** manifest/index 只是 installed projection，source truth 仍来自 `assets/source/speclite/` 的 module metadata 与 canonical skill packages。

9. **Canonical identity, help/menu projection and missing package handling are explicit.**  
   **前提** module metadata、`module-help.csv` 或 phase coverage 需要引用 skill；  
   **当** 系统生成 skill/help/phase projections；  
   **则** 必须以 canonical skill id 作为唯一 skill identity，并让 help index 引用 `canonicalSkillId`，不得从 menu label、directory traversal order 或 IDE-specific alias 反推第二套 identity；  
   **并且** 如果 selected module metadata 或 help rows 引用的 canonical skill package 在 source tree 中不存在，系统不得合成空 skill、复制错误目录或静默跳过 required entry；  
   **并且** 若现有 taxonomy 没有精确 reserved issue id 覆盖该 blocker，必须先更新 owning SPEC 后再新增 public issue id，不得发明自由文本 issue id。

10. **Failure never displays ready summary and remains diagnosable.**  
    **前提** 任一关键写入步骤失败，包括 operation lock、safe write、path safety、source package copy、manifest/index generation 或 target write failure；  
    **当** 命令返回失败结果；  
    **则** 不得展示 Story 1.6 的 ReadyCheck 或 ready summary；  
    **并且** 输出必须通过 `CommandResult<InstallCommandData>`、`issues`、`nextActions`、`completedSteps` 和 `pendingSteps` 表达 completed、failed 和 pending state；  
    **并且** 不得新增未契约化的 `failedStep`、`readySummary`、`changedPaths` 或 ad-hoc install JSON blob，除非先更新 owning SPEC、schema anchor 和 fixtures。

11. **Public output follows CommandResult and path policies.**  
    **前提** 用户请求 `speclite install --json` 或 human-readable output；  
    **当** 写入阶段成功、失败或部分失败；  
    **则** automation-relevant state 必须进入已契约化 `InstallCommandData` 字段：`sourceDescriptor`、`manifestVersion`、`installedModules`、`ideTargets`、`paths`、`completedSteps` 和 `pendingSteps`；  
    **并且** public path fields 必须使用 project-relative POSIX path，例如 `data.paths.projectRoot: "."`、`specliteRoot: "_speclite"`、`artifactRoot: "_speclite-output"`、`manifestPath: "_speclite/_config/manifest.yaml"`；  
    **并且** output 不得泄露 absolute path、home directory、drive letter、cache path、temporary path、credential、environment variable、timestamp、random id 或 raw stack trace。

12. **Focused tests and fixture assertions cover the generated installation shape.**  
    **前提** Story 1.5 修改 runtime structure、artifact directories、IDE mirrors 或 manifest/index projection；  
    **当** 开发者完成实现；  
    **则** 必须补充 unit、integration 和 fixture assertions，覆盖 fresh install generated tree、canonical package hash across targets、files index ownership/hash、artifact root protection、path safety、safe write、operation lock、no-ready-summary failure gate 和 target order；  
    **并且** tests 必须 local-only、deterministic、parse JSON semantically，不访问 npm registry、Git remote、private registry、offline bundle origin 或外部网络。

## Tasks / Subtasks（任务 / 子任务）

- [ ] Task 1: 验证 Story 1.1-1.4 前置实现和 confirmed install state（AC: 1, 10, 11）
  - [ ] 确认 Story 1.1 已实际提供 TypeScript/commander scaffold、runtime/platform guard、`CommandResult` anchor、`SourceDescriptor` anchor、`InstallPlan` anchor、manifest anchor、adapter registry anchor 和 fixture contract anchor。
  - [ ] 确认 Story 1.2 已实际提供 target directory resolution、existing-install detection、path normalization、target confirmation 和 no-write gate。
  - [ ] 确认 Story 1.3 已实际提供 bundled source discovery、module metadata parser、module selection model、source integrity gate 和 pre-write install scope summary。
  - [ ] 确认 Story 1.4 已实际提供 project config schema、quick/detailed config collection、config planned writes、human-owned stub plan 和 final configuration summary confirmation。
  - [ ] 如果 `package.json`、`src/`、`test/`、`src/diagnostics/command-result-schema.ts`、`src/installer/install-plan-schema.ts`、`src/manifest/manifest-schema.ts`、`src/ide/adapter-registry.ts` 或前序 Story 预期实现文件仍不存在，停止 Story 1.5 实现并先完成前序 Story。

- [ ] Task 2: 实现 write phase safety primitives（AC: 2, 4, 5, 10, 11）
  - [ ] 在 `src/fs/` 中新增或扩展 `path-normalizer.ts`、`safe-write.ts`、`copy-tree.ts`、`permissions.ts` 等 helpers；所有 public path projection 复用同一 POSIX path normalization。
  - [ ] 在 `src/installer/` 中实现 operation lock acquisition/release，lock shape 遵守 install plan SPEC，lock path 固定为 `_speclite/.lock`。
  - [ ] Fresh install 允许 lock acquisition 创建 `_speclite/` lock parent；该目录创建只能发生在 target confirmation、source trust / integrity gate 和 final configuration summary confirmation 之后，且不得夹带 `_speclite/_config`、config、manifest、mirror 或 artifact writes。
  - [ ] 对 planned writes 执行 `lstat` / `realpath` 或 Node 22-compatible 等价检查，阻断 symlink escape、path escape、case conflict 和 unsafe overwrite。
  - [ ] Installer-owned file mutation 使用 temp-write + rename；temp file 位于同一目录，并使用 `.speclite-tmp-` 前缀或后缀。
  - [ ] Lock file、safe-write temp file、private nonce、pid、timestamp、absolute temp path 不得进入 public output、manifest/index、files index 或 stable fixture snapshot。

- [ ] Task 3: 创建 `_speclite` metadata/control hub 和 config/runtime files（AC: 3, 4, 8, 9）
  - [ ] 在 `src/installer/` 中新增或扩展 runtime structure writer，例如 `runtime-structure.ts` 或 `apply-install-plan.ts`；`src/commands/install.ts` 只负责 orchestration。
  - [ ] 创建 `_speclite/`、`_speclite/_config/`、`_speclite/custom/` 等 required directories。
  - [ ] 应用 Story 1.4 的 config planned writes，写入 installer-owned `_speclite/config.toml` 与 `_speclite/config.user.toml`。
  - [ ] 对 `_speclite/custom/config.toml` 和 `_speclite/custom/config.user.toml` 只执行 create-if-absent；existing file 必须 protected skip，且不得读取内容到 public output。
  - [ ] 若复制或生成 shared runtime scripts，必须明确其 installer-owned status、sourceRef、executable intent 和 Node resolver relationship；不得让 legacy Python resolver 重新成为 MVP 主合并实现。
  - [ ] Runtime script/config/template paths 必须写入 files index，hash 使用 raw bytes，canonical text files 保持 LF。

- [ ] Task 4: 创建 configured artifact repository 和 module declarative directories（AC: 5, 8, 11）
  - [ ] 使用 resolved config model 中的 `output_folder`、`planning_artifacts`、`implementation_artifacts`、`project_knowledge` 和 selected module declarative `directories` 计算 directory plan。
  - [ ] 对 `_speclite-output` 或配置约定的 artifact root 执行 project-boundary 和 symlink/path escape 检查。
  - [ ] 创建缺失目录，但不得清空、重写或 normalize 现有 workflow-owned files。
  - [ ] 将 artifact root 与 relevant directory existence 投影到 manifest/index 或 `CommandResult.data.paths` 中已契约化字段；不得新增未契约化 public JSON fields。
  - [ ] Tests 覆盖 existing workflow artifact 保留不变、artifact root escape 阻断，以及 configured root 使用 project-relative POSIX path。

- [ ] Task 5: 实现 IDE adapter registry driven mirror writer（AC: 6, 7, 9, 12）
  - [ ] 在 `src/ide/adapter-registry.ts` 中复用 `claude`、`agents` target definitions 和 `CANONICAL_TARGET_ORDER`；不得新增 `copilot`、`cursor` 或 command pointer target。
  - [ ] 在 `src/ide/target-writer.ts` 或 adapter modules 中实现 self-contained skill entry writer。
  - [ ] 在 mirror planning 前验证 selected/default modules 都具备 canonical package roots；discovery 必须递归识别 nested `SKILL.md` package roots，不得只检查 module top-level；缺 package module 不得进入 default installed module set、IDE mirror 或 ReadyCheck。
  - [ ] Target entry directory basename 必须是 `canonicalSkillId`，路径分别为 `.claude/skills/<canonicalSkillId>/` 和 `.agents/skills/<canonicalSkillId>/`。
  - [ ] 复制 canonical package content 时保留 relative path、LF canonical text bytes、file modes/executable intent 和 package contents；不得添加 IDE-specific wrapper 到 canonical package hash。
  - [ ] 若某 target 需要 adapter artifact，必须独立记录 sourceRef、ownership 和 file-level hash；MVP 不生成 command pointer artifact。
  - [ ] Duplicate canonical skill id、missing required `SKILL.md`、unsupported selected target 或 target write failure 必须产生 reserved issue id 或先更新 taxonomy SPEC。

- [ ] Task 6: 生成 manifest、skill/help/files indexes 和 phase coverage（AC: 8, 9, 11, 12）
  - [ ] 在 `src/manifest/` 中实现或扩展 `manifest-generator.ts`、`skill-index.ts`、`help-index.ts`、`files-index.ts`、`phase-coverage.ts` 和 `hash.ts`。
  - [ ] Manifest/index artifact paths 固定为 `_speclite/_config/manifest.yaml`、`skill-index.json`、`help-index.json`、`files-index.json` 和 `phase-coverage.json`。
  - [ ] 生成 schema versions：`speclite.manifest.v1`、`speclite.skill-index.v1`、`speclite.help-index.v1`、`speclite.files-index.v1`、`speclite.phase-coverage.v1`。
  - [ ] `skill-index` 记录 `canonicalSkillId`、`moduleId`、`sourcePackagePath`、`canonicalPackageHash`、`installedTargets[]` 和 `phaseIds[]`。
  - [ ] `help-index` 记录 `phaseId`、`entryLabel`、`canonicalSkillId`、`activationTarget` 和 `targetIds[]`，不得定义 alternate skill identity。
  - [ ] `files-index` 记录 `path`、`ownership`、`hash`、`hashAlgorithm: "sha256"`、`executable`、`artifactKind` 和 `sourceRef`。
  - [ ] `phase-coverage` rows 按 `phaseId`、`moduleId`、`canonicalSkillId` 排序，target status 使用 installed phase coverage vocabulary：`mapped`、`unsupported`、`failed`。
  - [ ] File hashes 基于 raw file bytes；line ending、executable bit、file mode、symlink handling 和 case conflict 作为独立 validation dimensions，不通过 hash normalization 隐藏。

- [ ] Task 7: 接入 install command output，并明确推迟 ReadyCheck / ready summary（AC: 10, 11）
  - [ ] `install --json` 使用 `CommandResult<InstallCommandData>`，不新增未在 command-result SPEC 中声明的 required fields。
  - [ ] `completedSteps` / `pendingSteps` 使用 command-defined stable lifecycle order；Story 1.5 可将 `ide-mirror-creation`、`manifest-generation` 或等价 lower-kebab steps 标记为 completed/pending，但不得把 `ready-check` 标记为 completed。
  - [ ] Human-readable output 使用 Evidence profile，展示 runtime paths、artifact root、IDE targets、manifest/index paths 和 next action。
  - [ ] 成功完成 Story 1.5 写入后，输出应表明 ReadyCheck / ready summary 仍 pending，属于 Story 1.6。
  - [ ] 任一关键写入失败时不得声称 rollback；MVP 不提供 transactional rollback。输出应报告 completed mutations、blocking issue、pending steps 和 manual action。

- [ ] Task 8: 编写 focused tests、integration tests 和 fixture assertions（AC: 1-12）
  - [ ] Unit tests 覆盖 path normalization、project-boundary checks、symlink escape、path escape、case conflict、safe-write temp naming、lock shape 和 cleanup。
  - [ ] Unit tests 覆盖 canonical package hash、file-level hash、files index ownership projection、executable intent 和 target order。
  - [ ] Unit tests 覆盖 human-owned stub create-if-absent：missing -> create，existing -> protected skip，existing content/order/comment untouched。
  - [ ] Integration tests 覆盖 confirmed fresh install 写入 `_speclite`、configured artifact root、`.claude/skills`、`.agents/skills` 和 manifest/index files。
  - [ ] Integration tests 覆盖 selected target subset：只选 `claude` 或只选 `agents` 时，只生成 selected mirror，并保持 target ordering in projections。
  - [ ] Regression tests 覆盖 Story 1.1-1.4 failure/pending branches，确保未确认 target、source blocker、module selection pending、config summary pending 或 `writeAuthorized: false` 均不触发 Story 1.5 writes。
  - [ ] Fixture `fresh-install-empty-project` 更新 expected installed tree、expected manifest/index snapshots、expected command JSON 和 no-ready-summary gate。
  - [ ] Fixture 覆盖 IDE mirrors 中同一 canonical skill package hash 一致、workflow-owned artifact 保留、path portability、unsafe overwrite 和 target write failure。

- [ ] Task 9: 本地验证与范围控制（AC: 1-12）
  - [ ] 运行 `npm run build`。
  - [ ] 运行 `npm test`，或至少运行 Story 1.5 touched modules 的 focused Vitest tests。
  - [ ] 如新增或改变 public JSON field、manifest/index field、issue id、target status、fixture comparison behavior、resolver behavior 或 manifest schema version，确认同一变更中先更新 owning SPEC、executable schema/parser 和 fixture expected outputs。
  - [ ] 检查 diff，确认没有实现 Story 1.6 ReadyCheck、ready summary、full install progress summary 或 final installed-state summary。
  - [ ] 检查 diff，确认没有新增 Post-MVP `init`、`list`、`doctor`、`sync`、`uninstall`、top-level `repair`、branded `copilot` / `cursor` target id 或 command pointer artifact。
  - [ ] 检查 diff，确认没有格式化、重写或同步 `_bmad-output/planning-artifacts/`、其他 story 文件或无关用户改动。

## Dev Notes（开发备注）

### Current Repository State（当前仓库状态）

- 创建本 Story 时，仓库根目录仍未发现 `package.json`、`src/`、`test/`、`tests/` 或 root `fixtures/` 实现目录。Story 1.5 的开发必须在 Story 1.1、Story 1.2、Story 1.3 和 Story 1.4 实际实现之后进行。
- `_bmad-output/implementation-artifacts/1-1-cli-install-entry-and-runtime-guard.md`、`1-2-project-target-directory-resolution-and-existing-install-detection.md`、`1-3-official-module-selection-and-install-summary.md` 和 `1-4-project-config-initialization.md` 当前是 ready-for-dev story context，不是完成后的代码证据。
- 当前 worktree 已存在与本 Story 创建无关的 dirty planning artifacts、`sprint-status.yaml` 改动和未跟踪 Story 1.1-1.4 文件。实现 Story 1.5 时不得格式化、重写、同步或回滚这些无关改动。
- `assets/source/speclite/` 已存在，并包含 bundled source assets。当前可见 source facts：
  - `assets/source/speclite/core-skills/module.yaml`
  - `assets/source/speclite/core-skills/module-help.csv`
  - `assets/source/speclite/core-skills/*/SKILL.md` canonical skill packages
  - `assets/source/speclite/sdlc-skills/module.yaml`
  - `assets/source/speclite/sdlc-skills/module-help.csv`
  - `assets/source/speclite/sdlc-skills/**/SKILL.md` nested canonical skill packages（当前 40 个 package entries，例如 `2-plan-workflows/speclite-create-prd/SKILL.md`、`3-solutioning/speclite-story-review-02-evaluator/SKILL.md`、`4-implementation/speclite-dev-story/SKILL.md`）
- 当前 `sdlc-skills` 已具备 nested canonical package entries。`sdlc` 可进入 default installed module set、IDE mirror 和 installed-state projection 的前提是 Story 1.5 的 discovery、index 与 mirror planning 正确识别这些 nested package roots；任何 selected/default module 若实际缺少 canonical package，仍不得合成空 skill、metadata-only skill、placeholder mirror 或 ready evidence，必须用 owning SPEC 允许的 reserved diagnostic 阻断。

### Scope Boundary（范围边界）

- 本 Story 只负责 confirmed write phase 中的 runtime structure、artifact repository、IDE mirror creation、manifest/index projection、ownership/hash/safe-write/path-safety 和对应 tests。
- 本 Story 负责实际应用 Story 1.4 已确认的 installer-owned config writes 和 project-level human-owned stub create-if-absent plan。
- 本 Story 不负责：
  - Story 1.6 install progress full sequence、ReadyCheck、ready summary、final installed-state summary 或下一步使用指引。
  - Story 1.3 bundled source discovery、module parser、module version semantics、source integrity evidence generation 或 module selection prompt。
  - Story 1.4 quick/detailed config prompt、config schema design 或 final configuration summary。
  - `speclite status`、`speclite validate`、`speclite update`、`update --repair` 的完整实现。
  - Epic 5 alternative source implementations：npm/private registry/local tarball/offline bundle/Git/local path 的完整 source selection。
  - Post-MVP `init`、`list`、`doctor`、`sync`、`uninstall`、top-level `repair`、Copilot/Cursor branded target ids 或 command pointer artifacts。

### Architecture Requirements（架构要求）

- Runtime baseline remains Node.js 22 minimum and Node.js 24 recommended. Do not use Node 24-only APIs unless a Node 22-compatible path exists.
- CLI foundation remains TypeScript + commander. Do not introduce oclif/yargs/cac/clipanion for this Story.
- Storage model is local-first filesystem. Do not introduce database, web service, daemon, REST API, GraphQL, desktop UI, cache server or background process.
- `src/commands/install.ts` should orchestrate only. Runtime writing belongs in `src/installer/`; path normalization and safe writes belong in `src/fs/`; manifest/index generation belongs in `src/manifest/`; target mirror writing belongs in `src/ide/`; public projection belongs in `src/diagnostics/`.
- All public paths in command output, issues, fixtures, manifest/index projections and tests must use project-relative POSIX-style paths unless an owning SPEC explicitly marks a field non-stable/redacted.
- No implementation module may hand-roll a second config/customization merge logic. Installed skills and adapters must rely on `speclite resolve` and `src/config/` anchors.

### Runtime Structure Notes（运行时结构备注）

Expected installed runtime paths for this Story include:

```text
_speclite/
_speclite/config.toml
_speclite/config.user.toml
_speclite/custom/config.toml
_speclite/custom/config.user.toml
_speclite/_config/manifest.yaml
_speclite/_config/skill-index.json
_speclite/_config/help-index.json
_speclite/_config/files-index.json
_speclite/_config/phase-coverage.json
_speclite-output/
.claude/skills/<canonicalSkillId>/
.agents/skills/<canonicalSkillId>/
```

- `_speclite/.lock` may exist only as volatile operation-control state during write-capable commands; it must not be files-indexed.
- Fresh install 中，在 target/source/config confirmation gates 完成后，可以仅为 `_speclite/.lock` 创建 `_speclite/` parent，并将该动作视为 lock acquisition 的一部分。该授权不允许在 lock 获取前写入 `_speclite/_config`、config、manifest/index、mirror、runtime 或 artifact 内容。
- Safe-write temp files must use operation-local private ids and must not leak to output or stable snapshots.
- If implementation installs shared scripts under `_speclite/scripts/` or another runtime subdirectory, those files must be installer-owned, files-indexed, source-referenced and, when applicable, marked with `executable: true`.
- Legacy Python scripts under `assets/source/speclite/scripts/` are historical/compatibility assets. Do not make them the primary MVP resolver; Node `speclite resolve` is the runtime support command contract.

### Ownership Requirements（所有权要求）

| Path / Content（路径 / 内容） | Ownership（所有权） | Rule（规则） |
| --- | --- | --- |
| `_speclite/config.toml` | `installer-owned` | Generated from config schema/module metadata; safe-write and hash-indexed. |
| `_speclite/config.user.toml` | `installer-owned` | Generated from install-time user-scoped config; safe-write and hash-indexed. |
| `_speclite/custom/config.toml` | `human-owned` | Fresh install create-if-absent only; existing content untouched. |
| `_speclite/custom/config.user.toml` | `human-owned` | Fresh install create-if-absent only; existing content untouched. |
| `_speclite/custom/{skill}.toml` | `human-owned` | Not created by fresh install; protect if present. |
| `_speclite/_config/*` | `installer-owned` | Generated installed-state projections; schema-versioned and hash-indexed. |
| `.claude/skills/<canonicalSkillId>/**` | `installer-owned` unless adapter-specific future rule says otherwise | Regenerated execution-plane projection from canonical package. |
| `.agents/skills/<canonicalSkillId>/**` | `installer-owned` unless adapter-specific future rule says otherwise | Same canonical package bytes as other targets. |
| `_speclite-output/**` artifact files | `workflow-owned` | Directories may be created; existing artifacts and metadata sidecars are never overwritten by install/update/repair. |
| `_speclite/.lock` | volatile installer control state | Excluded from files index and stable snapshots. |
| `.speclite-tmp-*` safe-write files | volatile temporary state | Excluded from files index and stable snapshots; best-effort cleanup only. |

### IDE Mirror Requirements（IDE 镜像要求）

- MVP target ids are physical execution targets:
  - `claude` -> `.claude/skills`
  - `agents` -> `.agents/skills`
- Do not output branded `copilot` or `cursor` target ids in MVP. GitHub Copilot/Cursor may consume `.agents/skills`, but readiness/status remains the generic `agents` target.
- Self-contained skill entry layout:

```text
.claude/skills/<canonicalSkillId>/SKILL.md
.agents/skills/<canonicalSkillId>/SKILL.md
```

- Copy these canonical package members when present, preserving relative paths:
  - `CHANGELOG.md`
  - `references/`
  - `assets/`
  - `scripts/`
  - `config.toml.example`
  - `customize.toml`
- Adapter-specific metadata, wrapper files or future command pointer files must not be mixed into canonical package hash. In MVP, command pointer artifacts are not generated.
- Reverse validation later must be able to prove installed entry discovery, activation protocol, resolver access and artifact metadata loop. Story 1.5 should leave enough manifest/index evidence for Story 1.6 and Epic 3 to consume.

### Manifest / Index Requirements（Manifest / Index 要求）

- Manifest/index files and schema versions are owned by `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md`.
- Source-side truth is `assets/source/speclite/` module metadata and canonical skill packages.
- Installed projection truth is manifest/index projection of selected modules, source descriptor, IDE targets, phase coverage, installed files, ownership and hashes.
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
- `canonicalPackageHash` is package-level and validates that the same canonical package content was mirrored across IDE targets.
- `files-index` file hashes are file-level and validate drift, update planning, repair planning, changed paths, skipped paths and conflicts.
- Package-level and file-level hashes must not be conflated.

### CommandResult And Output Requirements（CommandResult 与输出要求）

- `install --json` uses `CommandResult<InstallCommandData>` from `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md`.
- Minimum install data fields remain:
  - `sourceDescriptor`
  - `manifestVersion`
  - `installedModules`
  - `ideTargets`
  - `paths`
  - `completedSteps`
  - `pendingSteps`
- This Story must not introduce non-contract fields such as `readySummary`, `failedStep`, `createdFiles`, `changedPaths`, `skippedPaths` or arbitrary `installSummary`.
- Human-readable output may explain what was written and what remains pending, but automation must rely on structured JSON and installed file contracts.
- Success after Story 1.5 writes should still keep `ready-check` and `ready-summary` pending for Story 1.6.
- If partial write failure occurs after some mutations complete, command status is `failure`. Do not claim transactional rollback.

### Previous Story Intelligence（前序 Story 情报）

- Story 1.1 establishes CLI scaffold, runtime/platform guard, `CommandResult` executable schema anchor, `SourceDescriptor` anchor, `InstallPlan` anchor, manifest anchor, adapter registry anchor and no-write guard failures.
- Story 1.1 explicitly deferred target directory resolution, module selection, config initialization, IDE mirror creation and ready summary.
- Story 1.2 extends Story 1.1 with target directory resolution, directory state inspection, existing-install detection and confirmation-before-write gate.
- Story 1.2 explicitly defers source discovery, module selection, config initialization, IDE mirror creation and ready summary; it also requires explicit target input to use commander optional argument `[target-directory]` unless an owning SPEC adds a flag.
- Story 1.3 extends the flow with bundled source discovery, official module metadata parsing, deterministic module selection and pre-write install scope summary.
- Story 1.3 explicitly defers project config initialization, `_speclite/config.toml`, human-owned TOML stubs, runtime writes, IDE mirror creation, manifest/index generation and ready summary.
- Story 1.4 extends the flow with quick/detailed config collection, config model, TOML planned writes, human-owned project-level custom stub plan and final config summary.
- Story 1.4 explicitly defers actual config writes, runtime directory creation, artifact directory creation, IDE mirror creation, manifest/index generation, ReadyCheck and ready summary. Story 1.5 is the first story that applies those confirmed writes, but still must not run ReadyCheck or show ready summary.

### Git Intelligence（Git 情报）

- Recent commits are documentation/context/spec oriented, not implementation scaffold:
  - `a0b08ef style(docs): 清理参考文档尾随空白`
  - `1ab545f docs(context): 初始化项目上下文文档`
  - `a4f8ab9 docs(source): 同步内置源资产路径说明`
  - `6e3d4e4 docs(glossary): 整理术语目录与文档索引`
  - `5b2c7a4 docs(specs): 收敛 MVP 契约与实现锚点`
- Treat live sharded docs and owning SPECs as current implementation truth. Do not use `_bmad-output/planning-artifacts/archive/` whole documents as contract sources.
- Worktree was already dirty when this Story was created; implementation agents must preserve unrelated user changes.

### Latest Technical Information（最新技术信息）

- No new third-party dependency is required for this Story. Use project-pinned libraries from Architecture and previous stories: `commander@14.0.3`, `yaml@2.9.0`, `toml@4.1.1`, `csv-parse@6.2.1`, `fs-extra@11.3.5`, `zod@4.4.3`, `typescript@6.0.3`, `tsx@4.21.0`, `tsup@8.5.1`, `vitest@4.1.6` and `@types/node@22`.
- Use Node.js 22-compatible `node:fs/promises`, `node:path`, `node:crypto` and, if needed, `node:stream` APIs. Do not introduce Node 24-only behavior.
- Do not add prompt, filesystem, hashing, globbing or copying dependencies silently. If a new dependency seems necessary, justify it against the existing dependency policy and update package/test fixtures in the same implementation change.
- No external web research is required for this Story beyond project-owned contracts because the implementation surface is local filesystem, manifest/index, IDE adapter and installer-owned write behavior already specified by live planning artifacts.

### Project Context Reference（项目上下文引用）

- `_bmad-output/project-context.md` currently contains initialized metadata and placeholder sections only; it does not add implementation rules beyond live PRD, Architecture, UX and owning SPEC artifacts.
- The project-level language rule remains: conversation and generated docs in Chinese, section headings in `English（中文）` form, technical identifiers in English.

### References（参考）

- [Source: `_bmad-output/planning-artifacts/epics/04-epic-1-project-installation-onboarding项目安装引导.md#Story 1.5`]
- [Source: `_bmad-output/planning-artifacts/epics/04-epic-1-project-installation-onboarding项目安装引导.md#Story 1.6`]
- [Source: `_bmad-output/planning-artifacts/prd/05-user-journeys用户旅程.md#Journey 1`]
- [Source: `_bmad-output/planning-artifacts/prd/08-developer-tool-specific-requirements开发者工具特定需求.md#Technical Architecture Considerations`]
- [Source: `_bmad-output/planning-artifacts/prd/08-developer-tool-specific-requirements开发者工具特定需求.md#API Surface`]
- [Source: `_bmad-output/planning-artifacts/prd/10-functional-requirements功能需求.md#Installation & Project Onboarding`]
- [Source: `_bmad-output/planning-artifacts/prd/10-functional-requirements功能需求.md#Methodology Discovery & Execution`]
- [Source: `_bmad-output/planning-artifacts/prd/10-functional-requirements功能需求.md#Update & File Ownership Protection`]
- [Source: `_bmad-output/planning-artifacts/prd/11-non-functional-requirements非功能需求.md#Reliability & Determinism`]
- [Source: `_bmad-output/planning-artifacts/prd/11-non-functional-requirements非功能需求.md#Security & Safety`]
- [Source: `_bmad-output/planning-artifacts/prd/11-non-functional-requirements非功能需求.md#Compatibility & Portability`]
- [Source: `_bmad-output/planning-artifacts/prd/11-non-functional-requirements非功能需求.md#Integration Quality`]
- [Source: `_bmad-output/planning-artifacts/prd/11-non-functional-requirements非功能需求.md#Diagnostics & Observability`]
- [Source: `_bmad-output/planning-artifacts/architecture/02-starter-template-evaluationstarter-模板评估.md#Selected Starter`]
- [Source: `_bmad-output/planning-artifacts/architecture/03-core-architectural-decisions核心架构决策.md#Data Architecture`]
- [Source: `_bmad-output/planning-artifacts/architecture/03-core-architectural-decisions核心架构决策.md#Authentication & Security`]
- [Source: `_bmad-output/planning-artifacts/architecture/03-core-architectural-decisions核心架构决策.md#API & Communication Patterns`]
- [Source: `_bmad-output/planning-artifacts/architecture/04-implementation-patterns-consistency-rules实现模式与一致性规则.md#Structure Patterns`]
- [Source: `_bmad-output/planning-artifacts/architecture/04-implementation-patterns-consistency-rules实现模式与一致性规则.md#Format Patterns`]
- [Source: `_bmad-output/planning-artifacts/architecture/04-implementation-patterns-consistency-rules实现模式与一致性规则.md#Communication Patterns`]
- [Source: `_bmad-output/planning-artifacts/architecture/05-project-structure-boundaries项目结构与边界.md#Architectural Boundaries`]
- [Source: `_bmad-output/planning-artifacts/architecture/05-project-structure-boundaries项目结构与边界.md#Manifest And Index Semantics`]
- [Source: `_bmad-output/planning-artifacts/architecture/05-project-structure-boundaries项目结构与边界.md#File Organization Patterns`]
- [Source: `_bmad-output/planning-artifacts/architecture/06-architecture-validation-results架构验证结果.md#Implementation Handoff`]
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Core User Experience`]
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Transferable UX Patterns`]
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Implementation Approach`]
- [Source: `_bmad-output/planning-artifacts/specs/README.md#Reading Order`]
- [Source: `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md#Command Data Payloads`]
- [Source: `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md#Path Policy`]
- [Source: `_bmad-output/planning-artifacts/specs/02-source-descriptor-contract.md#Source Type Rules`]
- [Source: `_bmad-output/planning-artifacts/specs/03-install-plan-contract.md#Install Plan`]
- [Source: `_bmad-output/planning-artifacts/specs/03-install-plan-contract.md#Project Operation Lock`]
- [Source: `_bmad-output/planning-artifacts/specs/03-install-plan-contract.md#Safe Write Semantics`]
- [Source: `_bmad-output/planning-artifacts/specs/03-install-plan-contract.md#Human-Owned TOML Stubs`]
- [Source: `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md#Source Of Truth`]
- [Source: `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md#Skill Index`]
- [Source: `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md#Files Index`]
- [Source: `_bmad-output/planning-artifacts/specs/05-ide-adapter-registry-contract.md#MVP Targets`]
- [Source: `_bmad-output/planning-artifacts/specs/05-ide-adapter-registry-contract.md#Self-Contained Skill Entry Layout`]
- [Source: `_bmad-output/planning-artifacts/specs/06-resolve-command-contract.md#Config Merge`]
- [Source: `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md#Issue Id Policy`]
- [Source: `_bmad-output/planning-artifacts/specs/08-fixture-contract.md#Ready Summary Gate`]
- [Source: `_bmad-output/planning-artifacts/adr/0003-separate-canonical-skill-packages-from-adapter-artifacts.md`]
- [Source: `_bmad-output/planning-artifacts/adr/0005-manifest-index-contract-boundary.md`]
- [Source: `assets/source/speclite/core-skills/module.yaml`]
- [Source: `assets/source/speclite/core-skills/module-help.csv`]
- [Source: `assets/source/speclite/sdlc-skills/module.yaml`]
- [Source: `assets/source/speclite/sdlc-skills/module-help.csv`]
- [Source: `_bmad-output/implementation-artifacts/1-1-cli-install-entry-and-runtime-guard.md`]
- [Source: `_bmad-output/implementation-artifacts/1-2-project-target-directory-resolution-and-existing-install-detection.md`]
- [Source: `_bmad-output/implementation-artifacts/1-3-official-module-selection-and-install-summary.md`]
- [Source: `_bmad-output/implementation-artifacts/1-4-project-config-initialization.md`]

## Dev Agent Record（开发代理记录）

### Agent Model Used（使用模型）

_To be filled by the dev-story agent._

### Debug Log References（调试日志引用）

### Completion Notes List（完成备注）

- Ultimate context engine analysis completed - comprehensive developer guide created.

### File List（文件列表）
