# Story 1.6: Install Progress And Ready Summary（安装进度与就绪摘要）

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story（故事）

作为项目维护者，  
我希望安装过程展示清晰的阶段进度，并在成功后给出完整 ready summary，  
以便确认 SpecLite 已正确安装、哪些 IDE targets 已配置，以及接下来该如何开始使用。

## Acceptance Criteria（验收标准）

1. **Progress steps are stable, ordered and not automation-only APIs.**  
   **前提** 用户执行 `speclite install`，且 Story 1.1-1.5 的前置实现已真实完成；  
   **当** 安装流程运行；  
   **则** 系统必须按 command-defined stable lifecycle order 报告 `source-discovery`、`module-selection`、`config-initialization`、`runtime-structure`、`ide-mirror-creation`、`manifest-generation`、`ready-check` 和 `ready-summary` 阶段；  
   **并且** 每个阶段只在实际开始或完成时报告对应状态，不得预先标记未执行阶段；  
   **并且** machine-readable progress `stepId` 必须使用 stable lower-kebab id，例如 `ready-check`；  
   **并且** `stepId` 仅作为 fixture-observable deterministic signal，automation 依赖必须读取 `CommandResult.data.completedSteps`、`CommandResult.data.pendingSteps` 或 owning file contracts；  
   **并且** human-readable step label 可以是 `ready check`，但 contract/internal guard 名称必须是 `ReadyCheck`。

2. **Story 1.1-1.5 completion gates must be verified before ReadyCheck.**  
   **前提** `speclite install` 准备进入 `ready-check`；  
   **当** 系统读取当前 install flow state；  
   **则** 必须确认 Story 1.1 runtime/platform guard 已通过、Story 1.2 target directory 已确认、Story 1.3 source discovery/module selection 已完成、Story 1.4 config initialization/final summary 已确认、Story 1.5 runtime structure/artifact directory/IDE mirror/manifest indexes 已成功写入；  
   **并且** 任一前置条件缺失、pending 或 failed 时不得运行 ReadyCheck，不得展示 ready summary；  
   **并且** 不得在 Story 1.6 中重建前序流程、绕过 confirmation gates、重新写 `_speclite` runtime、复制 IDE mirrors 或重新生成 manifest/index。

3. **ReadyCheck has a deliberately small local-only scope.**  
   **前提** source discovery、module selection、config initialization、runtime structure、IDE mirror creation、manifest generation 和 Story 1.5 write phase 已成功完成；  
   **当** install 内部运行 `ReadyCheck`；  
   **则** ReadyCheck 只检查 manifest/index 可读且 schema version 支持、source descriptor projection 存在且 shape valid、selected IDE mirrors 和 selected modules 下全部 canonical package roots 对应的 installed skill entries 可见、`_speclite`、configured artifact root 和 required runtime paths 存在，以及本次 install 没有 blocking `ValidationIssue` 或 failed required step；
   **并且** 默认 installed modules 必须来自具备 canonical self-contained skill packages 的 modules，且 package discovery 必须支持 nested `SKILL.md` package roots，不得只检查 module directory top-level；缺 canonical packages 的 module 不得作为默认 installed module 进入 IDE mirror 或 ReadyCheck，除非后续补齐 packages 或 owning SPEC 明确 metadata-only module contract；  
   **并且** ReadyCheck 不得执行 full hash scan、remote source access、remote freshness/provenance revalidation、implicit update check、repair planning 或完整 `speclite validate` category coverage。

4. **Ready summary is shown only after all required gates pass.**  
   **前提** ReadyCheck 通过，且本次 install 没有会改变 ready 判定的 blocking issue 或 failed required step；  
   **当** 安装流程完成；  
   **则** human-readable output 必须展示 SpecLite ready summary；  
   **并且** 摘要必须按稳定顺序包含 Summary、completed steps、installed modules、IDE targets、key paths 和 Next actions；  
   **并且** 摘要必须包含安装位置、manifest version、source descriptor、已安装模块、IDE targets、关键目录和下一步命令；  
   **并且** 每个 path 应标明所属空间或角色，例如 metadata/control hub、IDE execution plane、artifact repository 或 project knowledge。

5. **Failure never displays ready summary.**  
   **前提** 任一 required step 失败，包括前序 Story gate、ReadyCheck、manifest/index read、source descriptor projection、IDE mirror visibility 或 required runtime path presence；  
   **当** 命令结束；  
   **则** 系统不得展示 ready summary，也不得输出可被误解为 ready 的 human-readable success block；  
   **并且** 失败结果必须通过 `CommandResult<InstallCommandData>`、`issues`、`nextActions`、`completedSteps` 和 `pendingSteps` 表达 completed、failed 和 pending state；  
   **并且** 不得新增未契约化的 `failedStep`、`readySummary`、`createdFiles`、`changedPaths`、`skippedPaths` 或 arbitrary install summary JSON blob。

6. **`install --json` uses only contracted fields.**  
   **前提** 用户请求 `speclite install --json`；  
   **当** 安装完成、warning 或 failure；  
   **则** 机器可读输出必须继续使用 `CommandResult<InstallCommandData>`；  
   **并且** automation-relevant state 必须进入已契约化字段：`sourceDescriptor`、`manifestVersion`、`installedModules`、`ideTargets`、`paths`、`completedSteps` 和 `pendingSteps`；  
   **并且** 不得新增未契约化的 `readySummary` JSON blob，也不得要求 automation parse human-readable ready summary。

7. **Human-readable and JSON output share the same semantic model.**  
   **前提** human-readable output 与 `--json` output 同时需要表达安装结果；  
   **当** renderer 生成最终输出；  
   **则** 两种输出必须共享同一 command status、issue model、path policy、next action ordering 和 completed/pending step state；  
   **并且** human-readable output 可以更适合人读，但不得包含 JSON/file contract 中不存在的 automation-only facts；  
   **并且** JSON output 不得包含 ANSI escape、icons、spinner text、terminal-width-specific layout 或 human-only decoration fields。

8. **IDE target summary follows adapter registry semantics.**  
   **前提** 已配置一个或多个 AI IDE targets；  
   **当** 系统生成 ready summary 和 `CommandResult.data.ideTargets`；  
   **则** target 顺序必须复用 adapter registry canonical order：`claude` 再 `agents`；  
   **并且** 摘要展示每个 target 的 skill count 和 target directory；  
   **并且** MVP 不得输出 branded `copilot` 或 `cursor` target id，不得把 `agents` 渲染为 Copilot/Cursor readiness。

9. **Output remains accessible and deterministic in no-color and CI contexts.**  
   **前提** install output 运行在 `NO_COLOR`、non-TTY、CI 或窄终端环境；  
   **当** 系统渲染 progress、failure 或 ready summary；  
   **则** 输出不得依赖 ANSI escape、颜色、图标、spinner-only progress 或动态覆盖行才能理解状态；  
   **并且** status、step id、target id、path、issue id 和 next action 必须有文本等价表达；  
   **并且** terminal width 只影响 human-readable presentation，不影响 `CommandResult.data`、issue ordering、path normalization、exit code 或 fixture comparison。

10. **Focused tests and fixtures cover ready summary gating.**  
    **前提** Story 1.6 修改 install progress、ReadyCheck、ready summary 或 output projection；  
    **当** 开发者完成实现；  
    **则** 必须补充 unit、integration 和 fixture assertions，覆盖 ordered progress steps、`completedSteps` / `pendingSteps` ordering、ReadyCheck minimal scope、success ready summary、failure no-ready-summary gate、`install --json` no `readySummary` blob、NO_COLOR/non-TTY/CI output、canonical target order 和 no full validate/hash scan/remote/update-check behavior。

## Tasks / Subtasks（任务 / 子任务）

- [x] Task 1: 验证 Story 1.1-1.5 前置实现与当前仓库状态（AC: 1, 2, 5）
  - [x] 确认 Story 1.1 已真实提供 TypeScript/commander scaffold、runtime/platform guard、`CommandResult` anchor、`SourceDescriptor` anchor、`InstallPlan` anchor、manifest anchor、adapter registry anchor 和 fixture contract anchor。
  - [x] 确认 Story 1.2 已真实提供 target directory resolution、existing-install detection、path normalization 和 confirmation-before-write gate。
  - [x] 确认 Story 1.3 已真实提供 bundled source discovery、module metadata parser、source descriptor evidence gate、module selection model 和 pre-write install scope summary。
  - [x] 确认 Story 1.4 已真实提供 quick/detailed config collection、config schema/model、TOML planned writes、human-owned stub plan 和 final configuration summary gate。
  - [x] 确认 Story 1.5 已真实提供 `_speclite` runtime writes、artifact repository creation、IDE mirror creation、manifest/index generation、files index ownership/hash projection 和 no-ready-summary failure gate。
  - [x] 如果 `package.json`、`src/`、`test/`、`tests/`、`src/installer/progress-events.ts`、`src/installer/ready-summary.ts`、`src/diagnostics/output.ts` 或前序 Story 预期实现文件仍不存在，停止 Story 1.6 实现并先完成前序 Story；不得在 Story 1.6 中重建前序 scaffold 或伪造 ready evidence。

- [x] Task 2: 定义并接入 install lifecycle progress steps（AC: 1, 7, 9）
  - [x] 在 `src/installer/progress-events.ts` 或等价模块中定义 command-defined stable lifecycle order：`source-discovery`、`module-selection`、`config-initialization`、`runtime-structure`、`ide-mirror-creation`、`manifest-generation`、`ready-check`、`ready-summary`。
  - [x] 确保 `completedSteps` 和 `pendingSteps` 按该 lifecycle order 输出，不按 execution timing、filesystem traversal、object insertion 或 async completion order 排序。
  - [x] Human-readable progress 使用 stable step text；不得把 spinner、颜色或动态覆盖行作为唯一状态表达。
  - [x] `stepId` 使用 stable lower-kebab；internal guard / type 名称使用 `ReadyCheck`，不要命名为 `readySummaryCheck`、`validateReady` 或自由文本 label。

- [x] Task 3: 实现 ReadyCheck 最小本地检查（AC: 2, 3, 5）
  - [x] 在 `src/installer/ready-summary.ts`、`src/installer/ready-check.ts` 或等价模块中实现 `ReadyCheck`，由 install orchestration 在 Story 1.5 write phase 成功后调用。
  - [x] 读取 `_speclite/_config/manifest.yaml`、`skill-index.json`、`help-index.json`、`files-index.json` 和 `phase-coverage.json`，只验证可读性、schema version 支持和 required projection shape。
  - [x] 验证 `sourceDescriptor` projection 存在且 shape valid；不得重新访问 npm registry、Git remote、offline bundle origin、private registry endpoint 或 package-manager cache。
  - [x] 按 selected targets 验证 `.claude/skills/<canonicalSkillId>/` 与 `.agents/skills/<canonicalSkillId>/` 中 required installed skill entries 可见；target order 复用 `CANONICAL_TARGET_ORDER`。
  - [x] 验证 installed modules 均具备 canonical package evidence；`sdlc` 只有在其 40 个 nested `SKILL.md` canonical package entries 已被 discovery、manifest/index 和 selected IDE mirrors 正确识别时，才能作为 default selected module 计入 ready result；如果任一 selected/default module 缺少 required canonical package evidence，不得合成 ready evidence。
  - [x] 验证 `_speclite` metadata/control hub、configured artifact root 和 required runtime paths 存在；不要计算完整 file hash baseline。
  - [x] 如果当前 install state 已有 blocking issue、failed required step、missing required projection 或 unreadable required runtime path，ReadyCheck 返回 failure 并保持 `ready-summary` pending。

- [x] Task 4: 生成 human-readable ready summary（AC: 4, 7, 8, 9）
  - [x] 在 diagnostics/output renderer 中新增或扩展 Evidence profile 的 install ready summary renderer；semantic data 与 presentation 分离。
  - [x] 输出稳定顺序：Summary、completed steps、installed modules、IDE targets、key paths、Next actions。
  - [x] Summary 包含 target project display、manifest version、source descriptor summary、installed module ids/names、IDE target skill counts、key paths 和 next commands。
  - [x] Key paths 至少包含 `projectRoot: "."`、`specliteRoot: "_speclite"`、`artifactRoot` 和 `manifestPath: "_speclite/_config/manifest.yaml"`，并用文本说明所属空间或角色。
  - [x] Next actions 使用 command-specific priority order，优先推荐如何在 IDE 中找到 installed skill、运行 `speclite status` 或运行 `speclite validate`。
  - [x] 不要在 Story 1.6 中新增 Post-MVP `doctor`、`sync`、`uninstall`、top-level `repair`、Copilot/Cursor branded target readiness 或 command pointer artifact。

- [x] Task 5: 投影 `install --json` 且禁止未契约化字段（AC: 5, 6, 7, 8）
  - [x] `install --json` 继续通过 `src/diagnostics/command-result-schema.ts` 输出 `CommandResult<InstallCommandData>`。
  - [x] 成功时将 lifecycle state 投影到 `data.completedSteps` / `data.pendingSteps`；`ready-check` 完成后才允许 `ready-summary` 完成。
  - [x] 失败时 `ready-summary` 必须保持 pending 或不存在于 completed set；不得输出 human-readable ready block。
  - [x] `data.ideTargets` 按 `claude`、`agents` canonical order 输出，每项可包含 `id`、`status`、`targetPath`、`skillCount`。
  - [x] 不新增 `readySummary`、`failedStep`、`progressEvents`、`stepTiming`、`duration`、`createdFiles`、`changedPaths`、`skippedPaths` 或 `installSummary` public JSON field；如果产品确实需要新增字段，先停止并更新 owning SPEC、schema anchor 和 fixtures。

- [x] Task 6: 保持 failure diagnostics 与 no-ready-summary gate（AC: 3, 5, 7, 9）
  - [x] 对 manifest/index unreadable、schema version unsupported、source descriptor invalid、missing IDE entry、missing runtime path 或 pre-existing blocking issue，复用 taxonomy 中的 reserved issue category/id。
  - [x] 不发明 `ready-check.*` issue category；使用 `manifest-schema`、`source-integrity`、`ide-mirror`、`runtime-path`、`artifact-path`、`operation-lock` 或现有 category。
  - [x] Failure human-readable output 使用 issue list + pending steps + manual action；不要渲染 ready summary heading 或 "ready" 状态。
  - [x] Partial write failure 后不得声称 rollback；继续依赖 Story 1.5 的 partial failure semantics、`changedPaths` 边界和显式后续 `validate` / `update` / `update --repair`。

- [x] Task 7: 编写 focused tests、integration tests 和 fixture assertions（AC: 1-10）
  - [x] Unit tests 覆盖 lifecycle order、stable lower-kebab step ids、`completedSteps` / `pendingSteps` 排序和 no timing fields。
  - [x] Unit tests 覆盖 `ReadyCheck` minimal scope：manifest/index readable、schema supported、source descriptor projection valid、selected IDE mirror entries visible、runtime/artifact paths present、blocking issue guard。
  - [x] Regression tests 确认 `ReadyCheck` 不调用 full validate、hash scan、remote source access、implicit update check 或 repair planning；可通过 dependency injection / spy 断言对应模块未被调用。
  - [x] Integration tests 覆盖 successful fresh install 后出现 ready summary，且 summary 含 Summary、completed steps、installed modules、IDE targets、key paths 和 Next actions。
  - [x] Integration tests 覆盖每个 required step failure 时不展示 ready summary，并断言 `completedSteps` / `pendingSteps` 语义正确。
  - [x] JSON contract tests 解析 `install --json`，断言 required fields 存在、无 `readySummary` blob、无 ANSI、无 absolute path、无 timestamp、target order 稳定。
  - [x] Fixture `fresh-install-empty-project` 更新 expected command JSON、human-readable example 或 normalized snapshot，覆盖 ready summary gate。
  - [x] NO_COLOR/non-TTY/CI tests 覆盖无颜色、无 spinner-only progress、文本等价表达和 terminal width fallback。

- [x] Task 8: 本地验证与范围控制（AC: 1-10）
  - [x] 运行 `npm run build`。
  - [x] 运行 `npm test`，或至少运行 Story 1.6 touched modules 的 focused Vitest tests。
  - [x] 运行相关 fixture test，至少覆盖 `fresh-install-empty-project` ready summary gating。
  - [x] 如新增或改变 public JSON field、step id、issue id、target status、fixture comparison behavior 或 manifest/index projection，确认同一变更中先更新 owning SPEC、executable schema/parser 和 fixture expected outputs。
  - [x] 检查 diff，确认没有修改 `_bmad-output/planning-artifacts/`、其他 story 文件或无关用户改动。
  - [x] 检查 diff，确认没有实现 full `validate`、remote source freshness/provenance revalidation、implicit update check、repair planning、Post-MVP commands 或 branded Copilot/Cursor targets。

- [x] Corrective Task 9: 让 ReadyCheck 绑定 full canonical installed set（AC: 3, 4, 8, 10）
  - [x] ReadyCheck 必须从 selected modules、skill index 和 selected target mirrors 验证全部 canonical package roots 可见；默认 `core` + `sdlc` baseline 为 `53`。
  - [x] `CommandResult.data.ideTargets[].skillCount` 必须反映每个 selected target 实际安装的 full canonical package root count。
  - [x] Ready summary 的 installed modules / IDE targets evidence 不得让 partial canonical install 被误判为 ready。
  - [x] Focused tests 必须覆盖 full canonical set ReadyCheck success，以及少一个 selected package root 时 ReadyCheck failure。

## Dev Notes（开发备注）

### Current Repository State（当前仓库状态）

- 创建本 Story 时，仓库根目录仍未发现 `package.json`、`package-lock.json`、`src/`、`test/`、`tests/` 或 root `fixtures/` 实现目录。Story 1.6 的开发必须在 Story 1.1-1.5 实际实现之后进行。
- `_bmad-output/implementation-artifacts/1-1-cli-install-entry-and-runtime-guard.md` 到 `1-5-runtime-structure-artifact-directory-and-ide-mirror-creation.md` 当前是 `ready-for-dev` story context，不是完成后的代码证据。
- 当前 worktree 已存在与本 Story 创建无关的 dirty planning artifacts、`sprint-status.yaml` 改动和未跟踪 Story 1.1-1.5 文件。实现 Story 1.6 时不得格式化、重写、同步或回滚这些无关改动。
- `assets/source/speclite/` 已存在，并包含 bundled source assets。当前可见 source facts：
  - `assets/source/speclite/core-skills/module.yaml`
  - `assets/source/speclite/core-skills/module-help.csv`
  - `assets/source/speclite/core-skills/*/SKILL.md` canonical skill packages
  - `assets/source/speclite/sdlc-skills/module.yaml`
  - `assets/source/speclite/sdlc-skills/module-help.csv`
  - `assets/source/speclite/sdlc-skills/**/SKILL.md` nested canonical skill packages（当前 40 个 package entries，例如 `2-plan-workflows/speclite-create-prd/SKILL.md`、`3-solutioning/speclite-story-review-02-evaluator/SKILL.md`、`4-implementation/speclite-dev-story/SKILL.md`）
- 当前 `sdlc-skills` 已具备 nested canonical package entries。Story 1.6 可以把 `sdlc` 作为 default selected module 计入 ready result 的前提是 Story 1.5 产出的 manifest/index、selected IDE mirrors 和 installed skill entries 已正确投影这些 nested package roots；任何 selected/default module 若实际缺少 canonical package evidence，仍不得合成 ready evidence，必须用 owning SPEC 允许的 reserved diagnostic 阻断 ready summary。

### Scope Boundary（范围边界）

- 本 Story 只负责 install progress、`ReadyCheck` 最小就绪检查、human-readable ready summary、`install --json` completed/pending step projection、failure no-ready-summary gate 和对应 tests/fixtures。
- 本 Story 不负责：
  - Story 1.1 CLI scaffold、runtime/platform guard 或 diagnostics anchor 创建。
  - Story 1.2 target directory resolution、existing install detection 或 target confirmation。
  - Story 1.3 bundled source discovery、module parser、module selection 或 source integrity evidence generation。
  - Story 1.4 quick/detailed config prompt、config schema design、human-owned stub plan 或 final configuration summary confirmation。
  - Story 1.5 `_speclite` runtime writes、artifact directory creation、IDE mirror writer、manifest/index generation、files index/hash projection、operation lock 或 safe writes。
  - `speclite status`、`speclite validate`、`speclite update`、`update --repair` 的完整实现。
  - Epic 5 alternative source implementations。
  - Post-MVP `init`、`list`、`doctor`、`sync`、`uninstall`、top-level `repair`、Copilot/Cursor branded target ids 或 command pointer artifacts。

### Architecture Requirements（架构要求）

- Runtime baseline remains Node.js 22 minimum and Node.js 24 recommended. Do not use Node 24-only APIs unless a Node 22-compatible path exists.
- CLI foundation remains TypeScript + commander. Do not introduce oclif/yargs/cac/clipanion for this Story.
- Storage model is local-first filesystem. Do not introduce database, web service, daemon, REST API, GraphQL, desktop UI, cache server or background process.
- `src/commands/install.ts` should orchestrate only. Progress event definitions and ReadyCheck orchestration belong in `src/installer/`; public projection and renderer behavior belong in `src/diagnostics/`; path normalization belongs in `src/fs/`; manifest/index parsing belongs in `src/manifest/`; target order belongs in `src/ide/adapter-registry.ts`.
- All public paths in command output, issues, fixtures, manifest/index projections and tests must use project-relative POSIX-style paths unless an owning SPEC explicitly marks a field non-stable/redacted.
- Human-readable output and `--json` output must share the same semantic model. Renderer modules must not invent a second command status, issue shape, target ordering or path policy.

### Progress Lifecycle Requirements（进度生命周期要求）

Recommended implementation model, adjusted to existing Story 1.1-1.5 code if names differ:

```ts
type InstallLifecycleStepId =
  | "source-discovery"
  | "module-selection"
  | "config-initialization"
  | "runtime-structure"
  | "ide-mirror-creation"
  | "manifest-generation"
  | "ready-check"
  | "ready-summary";
```

- `completedSteps` and `pendingSteps` are command-defined stable lifecycle arrays. They are not a raw event log.
- `stepId` can be emitted in progress events for fixture-observable ordering, but it is not the long-term automation API.
- Do not include durations, timestamps, spinner frames, terminal control text or local absolute paths in stable progress output.
- If a step fails, later required steps remain pending; `ready-summary` never moves to completed unless ReadyCheck passes and summary renders from the same successful command result.

### ReadyCheck Requirements（ReadyCheck 要求）

ReadyCheck is an install-internal minimal gate, not a thin wrapper around full `speclite validate`.

It may check:

- `_speclite/_config/manifest.yaml` readable and schema version supported.
- Required indexes readable: `skill-index.json`, `help-index.json`, `files-index.json`, `phase-coverage.json`.
- Source descriptor projection present and valid according to `src/source/source-descriptor-schema.ts`.
- Selected IDE mirrors exist and required installed skill entries are visible.
- Installed modules 必须具备 canonical self-contained skill package evidence，除非 owning SPEC 显式定义 metadata-only module semantics。
- `_speclite`, configured artifact root and required runtime paths exist.
- Current install state has no blocking `ValidationIssue` and no failed required step.

It must not check:

- Full files-index hash scan.
- Full IDE mirror content hash comparison beyond visibility required for ready.
- Remote source access, remote freshness, provenance revalidation or package-manager cache.
- Implicit update check, repair planning or drift remediation.
- Full validation category coverage, issue counts or `validate.data.checkedCategories`.

### CommandResult And Output Requirements（CommandResult 与输出要求）

- `install --json` uses `CommandResult<InstallCommandData>` from `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md`.
- Required install data fields remain:
  - `sourceDescriptor`
  - `manifestVersion`
  - `installedModules`
  - `ideTargets`
  - `paths`
  - `completedSteps`
  - `pendingSteps`
- This Story must not introduce non-contract fields such as `readySummary`, `failedStep`, `progressEvents`, `stepTiming`, `duration`, `createdFiles`, `changedPaths`, `skippedPaths` or arbitrary `installSummary`.
- Human-readable ready summary may explain the result and next steps, but automation must rely on structured JSON and installed file contracts.
- `data.ideTargets` and any target table must follow canonical target order: `claude`, then `agents`.
- Public path examples:
  - `data.paths.projectRoot: "."`
  - `data.paths.specliteRoot: "_speclite"`
  - `data.paths.artifactRoot: "_speclite-output"` or configured equivalent
  - `data.paths.manifestPath: "_speclite/_config/manifest.yaml"`

### Ready Summary Content Requirements（Ready Summary 内容要求）

Human-readable ready summary should use the Evidence profile and remain useful when copied into CI logs or issue trackers.

Required stable order:

1. Summary
2. Completed steps
3. Installed modules
4. IDE targets
5. Key paths
6. Next actions

Minimum content:

- Install location / target project display.
- Manifest version.
- Source descriptor summary with `sourceType`, resolved version or display-safe source label, and trust status.
- Installed module ids/names, sorted by source manifest module order.
- IDE targets with target id, target directory and skill count.
- Key paths with role labels:
  - `_speclite` as metadata/control hub
  - `.claude/skills` and `.agents/skills` as IDE execution plane
  - `_speclite-output` or configured root as artifact repository
  - `_speclite/_config/manifest.yaml` as installed-state projection
- Next commands or actions, for example how to activate installed skills in selected IDE targets, run `speclite status`, or run `speclite validate`.

Do not use generic "done" as the only success signal. Ready must be supported by concrete evidence fields.

### Failure Output Requirements（失败输出要求）

- Failure output must not include the ready summary section heading or any "ready" state that can be mistaken for success.
- It should include completed steps, pending steps, blocking issue(s), impact and manual next action.
- If failure occurs before ReadyCheck, `ready-check` and `ready-summary` remain pending.
- If ReadyCheck fails, human-readable progress may show `ready-check` as the failed current step, but `CommandResult.data.completedSteps` must contain only successfully completed step ids. Represent the failed step through `CommandResult.status`, `issues`, `summary`, human-readable output and `pendingSteps`; do not add a non-contract `failedStep` field.
- Use reserved taxonomy categories. Do not invent a new `ready-check` category unless the taxonomy SPEC is updated first.

### UX And Accessibility Requirements（UX 与可访问性要求）

- Output tone should be sober, specific and actionable.
- Human-readable output must work in `NO_COLOR`, non-TTY and CI contexts.
- Do not rely on color, icon, animation, spinner-only progress or dynamic terminal row replacement to convey the only status meaning.
- Narrow terminals may downgrade tables to key-value blocks, but must preserve status, step id, target id, issue id, path and next action.
- `--json` must never contain ANSI escape, icons, human-only decoration, terminal width decisions or locale-dependent ordering.

### Testing Requirements（测试要求）

- Use Vitest.
- Tests must be deterministic and local-only; do not access npm registry, Git remote, private registry, offline bundle origin, package-manager cache or external network.
- JSON tests must parse output semantically and assert required fields, ordering and absence of non-contract fields.
- Human-readable tests should cover Evidence profile, no-color/non-TTY/CI output and failure no-ready-summary gate.
- Fixture tests should update `fresh-install-empty-project` expected outputs only after owning SPEC and executable schema support the behavior. Do not update snapshots first and infer contract behavior afterward.
- Regression tests should explicitly prove Story 1.6 does not call full validation, full hash scan, remote source access, implicit update check or repair planning.

### Previous Story Intelligence（前序 Story 情报）

- Story 1.1 establishes CLI scaffold, runtime/platform guard, `CommandResult` executable schema anchor, `SourceDescriptor` anchor, `InstallPlan` anchor, manifest anchor, adapter registry anchor and no-write guard failures.
- Story 1.1 explicitly deferred target directory resolution, module selection, config initialization, IDE mirror creation and ready summary.
- Story 1.2 extends Story 1.1 with target directory resolution, directory state inspection, existing-install detection and confirmation-before-write gate.
- Story 1.2 explicitly defers source discovery, module selection, config initialization, IDE mirror creation and ready summary; it also requires explicit target input to use commander optional argument `[target-directory]` unless an owning SPEC adds a flag.
- Story 1.3 extends the flow with bundled source discovery, official module metadata parsing, deterministic module selection and pre-write install scope summary.
- Story 1.3 explicitly defers project config initialization, `_speclite/config.toml`, human-owned TOML stubs, runtime writes, IDE mirror creation, manifest/index generation and ready summary.
- Story 1.4 extends the flow with quick/detailed config collection, config model, TOML planned writes, human-owned project-level custom stub plan and final config summary.
- Story 1.4 explicitly defers actual config writes, runtime directory creation, artifact directory creation, IDE mirror creation, manifest/index generation, ReadyCheck and ready summary.
- Story 1.5 extends the flow with runtime structure writes, configured artifact repository, IDE target mirrors, manifest/index projection, ownership/hash/safe-write/path-safety and no-ready-summary failure gate.
- Story 1.5 explicitly defers install progress full sequence, ReadyCheck, ready summary and final installed-state summary to Story 1.6.

### Git Intelligence（Git 情报）

- Recent commits are documentation/context/spec oriented, not implementation scaffold:
  - `a0b08ef style(docs): 清理参考文档尾随空白`
  - `1ab545f docs(context): 初始化项目上下文文档`
  - `a4f8ab9 docs(source): 同步内置源资产路径说明`
  - `6e3d4e4 docs(glossary): 整理术语目录与文档索引`
  - `5b2c7a4 docs(specs): 收敛 MVP 契约与实现锚点`
- `5b2c7a4` is especially relevant because it updated the live SPEC contracts for CommandResult, SourceDescriptor, InstallPlan, manifest/index, IDE adapter registry, validation taxonomy and fixtures.
- Treat live sharded docs and owning SPECs as current implementation truth. Do not use `_bmad-output/planning-artifacts/archive/` whole documents as contract sources.
- Worktree was already dirty when this Story was created; implementation agents must preserve unrelated user changes.

### Latest Technical Information（最新技术信息）

- No new third-party dependency is required for this Story. Use project-pinned libraries from Architecture and previous stories: `commander@14.0.3`, `yaml@2.9.0`, `toml@4.1.1`, `csv-parse@6.2.1`, `fs-extra@11.3.5`, `zod@4.4.3`, `typescript@6.0.3`, `tsx@4.21.0`, `tsup@8.5.1`, `vitest@4.1.6` and `@types/node@22`.
- Use Node.js 22-compatible `node:fs/promises`, `node:path` and, if needed, `node:stream` APIs. Do not introduce Node 24-only behavior.
- Do not add progress, spinner, prompt, terminal table, hashing, globbing or remote checking dependencies silently. If a new dependency seems necessary, justify it against the existing dependency policy and update package/test fixtures in the same implementation change.
- No external web research is required for this Story beyond project-owned contracts because the implementation surface is local filesystem, manifest/index, IDE adapter visibility, diagnostics rendering and installer state already specified by live planning artifacts.

### Project Context Reference（项目上下文引用）

- `_bmad-output/project-context.md` currently contains initialized metadata and placeholder sections only; it does not add implementation rules beyond live PRD, Architecture, UX and owning SPEC artifacts.
- The project-level language rule remains: conversation and generated docs in Chinese, section headings in `English（中文）` form, technical identifiers in English.

### References（参考）

- [Source: `_bmad-output/planning-artifacts/epics/04-epic-1-project-installation-onboarding项目安装引导.md#Story 1.6`]
- [Source: `_bmad-output/planning-artifacts/epics/04-epic-1-project-installation-onboarding项目安装引导.md#Story 1.1`]
- [Source: `_bmad-output/planning-artifacts/epics/04-epic-1-project-installation-onboarding项目安装引导.md#Story 1.2`]
- [Source: `_bmad-output/planning-artifacts/epics/04-epic-1-project-installation-onboarding项目安装引导.md#Story 1.3`]
- [Source: `_bmad-output/planning-artifacts/epics/04-epic-1-project-installation-onboarding项目安装引导.md#Story 1.4`]
- [Source: `_bmad-output/planning-artifacts/epics/04-epic-1-project-installation-onboarding项目安装引导.md#Story 1.5`]
- [Source: `_bmad-output/planning-artifacts/prd/05-user-journeys用户旅程.md#Journey 1`]
- [Source: `_bmad-output/planning-artifacts/prd/08-developer-tool-specific-requirements开发者工具特定需求.md#API Surface`]
- [Source: `_bmad-output/planning-artifacts/prd/10-functional-requirements功能需求.md#Installation & Project Onboarding`]
- [Source: `_bmad-output/planning-artifacts/prd/10-functional-requirements功能需求.md#Status & Validation`]
- [Source: `_bmad-output/planning-artifacts/prd/11-non-functional-requirements非功能需求.md#Diagnostics & Observability`]
- [Source: `_bmad-output/planning-artifacts/architecture/03-core-architectural-decisions核心架构决策.md#API & Communication Patterns`]
- [Source: `_bmad-output/planning-artifacts/architecture/04-implementation-patterns-consistency-rules实现模式与一致性规则.md#Communication Patterns`]
- [Source: `_bmad-output/planning-artifacts/architecture/04-implementation-patterns-consistency-rules实现模式与一致性规则.md#Loading State Patterns`]
- [Source: `_bmad-output/planning-artifacts/architecture/05-project-structure-boundaries项目结构与边界.md#Requirements to Structure Mapping`]
- [Source: `_bmad-output/planning-artifacts/architecture/05-project-structure-boundaries项目结构与边界.md#Integration Points`]
- [Source: `_bmad-output/planning-artifacts/architecture/06-architecture-validation-results架构验证结果.md#Implementation Handoff`]
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Core User Experience`]
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Implementation Approach`]
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Ready Summary`]
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Responsive Design & Accessibility`]
- [Source: `_bmad-output/planning-artifacts/specs/README.md#Reading Order`]
- [Source: `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md#Command Data Payloads`]
- [Source: `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md#Ordering Rules`]
- [Source: `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md#Path Policy`]
- [Source: `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md#Summary And Human Output`]
- [Source: `_bmad-output/planning-artifacts/specs/02-source-descriptor-contract.md#Validation Boundary`]
- [Source: `_bmad-output/planning-artifacts/specs/03-install-plan-contract.md#Project Operation Lock`]
- [Source: `_bmad-output/planning-artifacts/specs/03-install-plan-contract.md#Safe Write Semantics`]
- [Source: `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md#Scope`]
- [Source: `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md#Canonical Target Identity`]
- [Source: `_bmad-output/planning-artifacts/specs/05-ide-adapter-registry-contract.md#MVP Targets`]
- [Source: `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md#Category Boundaries`]
- [Source: `_bmad-output/planning-artifacts/specs/08-fixture-contract.md#Ready Summary Gate`]
- [Source: `assets/source/speclite/core-skills/module.yaml`]
- [Source: `assets/source/speclite/core-skills/module-help.csv`]
- [Source: `assets/source/speclite/sdlc-skills/module.yaml`]
- [Source: `assets/source/speclite/sdlc-skills/module-help.csv`]
- [Source: `_bmad-output/implementation-artifacts/1-1-cli-install-entry-and-runtime-guard.md`]
- [Source: `_bmad-output/implementation-artifacts/1-2-project-target-directory-resolution-and-existing-install-detection.md`]
- [Source: `_bmad-output/implementation-artifacts/1-3-official-module-selection-and-install-summary.md`]
- [Source: `_bmad-output/implementation-artifacts/1-4-project-config-initialization.md`]
- [Source: `_bmad-output/implementation-artifacts/1-5-runtime-structure-artifact-directory-and-ide-mirror-creation.md`]

## Dev Agent Record（开发代理记录）

### Agent Model Used（使用模型）

Codex GPT-5

### Debug Log References（调试日志引用）

- `python3 _bmad/scripts/resolve_customization.py --skill /Users/fancyliu/Repos/SpecLite/.agents/skills/bmad-dev-story --key workflow` failed because system `python3` lacks `tomllib`; reran successfully with `python3.12`.
- `npx vitest run test/install-progress-ready-summary.test.ts` first failed on missing Story 1.6 modules, then passed after implementation.
- `npm test` passed: 10 test files, 63 tests.
- `npm run build` passed with tsup ESM and DTS output.
- `git diff --check` passed.
- 2026-05-28 15:38 CST: RED corrective test showed ReadyCheck still passed when `skill-index.json` omitted a selected package root.
- 2026-05-28 15:40 CST: GREEN corrective tests passed after ReadyCheck started validating selected module package roots against skill-index and IDE target skill counts.
- 2026-05-28 15:40 CST: Targeted verification passed, 7 files / 52 tests; full `npm test` passed, 20 files / 116 tests; `git diff --check` passed.

### Completion Notes List（完成备注）

- Ultimate context engine analysis completed - comprehensive developer guide created.
- Verified Story 1.1-1.5 implementation anchors existed before implementing Story 1.6; did not rebuild prior story flows or synthesize ready evidence.
- Added command-defined install lifecycle projection for `source-discovery`, `module-selection`, `config-initialization`, `runtime-structure`, `ide-mirror-creation`, `manifest-generation`, `ready-check` and `ready-summary`.
- Implemented `ReadyCheck` as a local-only gate over manifest/index readability, schema support, source descriptor shape, IDE mirror visibility, installed module package evidence and required runtime paths.
- Added ready summary rendering from the same `CommandResult<InstallCommandData>` semantic model, with no `readySummary` JSON blob and no ANSI/spinner-only output dependency.
- Updated focused unit/integration/fixture assertions for ready summary gating, failure no-ready-summary behavior, canonical target order and JSON contract absence checks.
- Cleaned generated validation outputs `node_modules/` and `dist/` after running tests/build.
- Corrective ReadyCheck now accepts internal selected module inventory from install flow and verifies every selected package root appears in `skill-index.json`.
- ReadyCheck now rejects target skill count mismatches between `CommandResult.data.ideTargets[].skillCount` and indexed installed targets.
- Added focused failure coverage for the "one selected package root missing" partial install case.

### File List（文件列表）

- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/implementation-artifacts/stories/1-6-install-progress-and-ready-summary.md`
- `src/commands/install.ts`
- `src/diagnostics/command-result.ts`
- `src/diagnostics/output.ts`
- `src/installer/install-context.ts`
- `src/installer/progress-events.ts`
- `src/installer/ready-check.ts`
- `src/installer/runtime-guard.ts`
- `src/installer/runtime-structure.ts`
- `test/cli-smoke.test.ts`
- `test/config-initialization.test.ts`
- `test/contract-anchors.test.ts`
- `test/install-module-selection.test.ts`
- `test/install-progress-ready-summary.test.ts`
- `test/runtime-structure.test.ts`
- `test/target-directory.test.ts`
- `test/fixtures/fresh-install-empty-project/expected/command-json/fresh-install-success.json`
- `test/fixtures/fresh-install-empty-project/expected/command-json/unsupported-node.json`
- `test/fixtures/fresh-install-empty-project/expected/command-json/unsupported-platform.json`
- `_bmad-output/implementation-artifacts/dev-verifications/epic-1-2-corrective-dev-verification/PLAN.md`
- `_bmad-output/implementation-artifacts/dev-verifications/epic-1-2-corrective-dev-verification/EXPERIMENTS.md`
- `_bmad-output/implementation-artifacts/dev-verifications/epic-1-2-corrective-dev-verification/EXPERIMENT_NOTES.md`

### Change Log（变更日志）

- 2026-05-27: Implemented Story 1.6 install lifecycle progress, ReadyCheck, ready summary, JSON projection and focused tests; moved status to review.
- 2026-05-28: Corrective verification bound ReadyCheck to selected module full canonical inventory and validated partial-install failure coverage; Story 状态重新推进至 review。
