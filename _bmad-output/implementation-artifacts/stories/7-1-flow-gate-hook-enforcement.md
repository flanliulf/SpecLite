# Story 7.1: Flow Gate Hook Enforcement（Flow Gate Hook 强制执行）

Status: done

<!-- Post-MVP Story: 不属于 MVP implementation readiness gate。实现前必须先通过 Epic 7 kickoff / Story kickoff gate。 -->

## Story（故事）

作为 SpecLite workflow owner，
我希望 installer 把 `speclite-flow-gate` 的 `story-kickoff` gate 投射为项目级 Claude/Codex hooks，
以便 `speclite-dev-story` 在开发 Story 前不能只靠 skill 文案自觉触发 gate，而是由 execution plane 的 hook 先检查 gate evidence。

## Acceptance Criteria（验收标准）

1. **Hook source is independent canonical source（Hook 源定义是独立 canonical source）**
   **前提** SpecLite 需要发布 Flow Gate enforcement hook source；
   **当** 维护 `assets/source/speclite/` canonical source tree；
   **则** hook source 定义必须位于独立 hooks source root（推荐 `assets/source/speclite/hooks/flow-gate-enforcement/`）；
   **并且** 不得把 hook source 埋入 `speclite-dev-story` skill package；相关 skills 只声明被 hook 保护的关系。

2. **Installer projects hook artifacts into execution planes（Installer 投射 hook artifacts 到 execution planes）**
   **前提** 用户安装 SpecLite 到目标项目；
   **当** installer 生成 Claude/Codex execution-plane projection；
   **则** 项目级 hook 配置、hook runner 和 source metadata 必须作为 installer-managed hook artifacts 被写入或安全合并；
   **并且** files index 记录 sha256、executable intent、sourceRef、artifactKind 和 ownership。

3. **Existing project configs are protected（既有项目配置受保护）**
   **前提** 目标项目已有 `.claude` 或 `.codex` 配置；
   **当** installer 需要启用 hook；
   **则** 必须 plan-before-write、保留既有 human-owned 配置、对冲突输出 manual action；
   **并且** 不得静默覆盖用户已有 hooks、rules、settings 或 trust 决策。

4. **Hook blocks dev-story without passing kickoff evidence（Hook 在缺少通过证据时阻断 dev-story）**
   **前提** 用户尝试触发 `speclite-dev-story`；
   **当** 项目级 hook 识别到开发 Story 的 prompt/command intent；
   **则** hook 必须读取对应 `{implementation_artifacts}/flow-gates/{story-key}-story-kickoff-gate.md` 的机器可读 metadata；
   **并且** 只有 `mode=story-kickoff` 且 `result=PASS` 或 `PASS_EQUIVALENT` 才允许继续。

5. **Blocking output is actionable and side-effect free（阻断输出可执行且无副作用）**
   **前提** kickoff gate 缺失、非通过、目标不匹配或 metadata 过期；
   **当** hook 拦截到 `speclite-dev-story` intent；
   **则** hook 必须阻断并给出可执行原因与下一步，例如运行 `speclite-flow-gate mode=story-kickoff target=<story-key>`；
   **并且** hook 本身不得生成 gate report、推进 sprint status 或修改 Story。

6. **Flow Gate report has hook-readable metadata（Flow Gate report 具备 hook 可读 metadata）**
   **前提** Flow Gate report 需要被 hook 稳定消费；
   **当** 更新 `speclite-flow-gate`；
   **则** report template 必须新增 YAML frontmatter 或 sidecar JSON metadata，至少包含 `schemaVersion`、`mode`、`target`、`storyKey`、`result`、`generatedAt`、`sourceSkill`；
   **并且** hook 不得依赖 human-readable Markdown prose 解析 gate result。

7. **Installed hook lifecycle is covered by tests and fixtures（安装后 hook 生命周期由测试和 fixtures 覆盖）**
   **前提** hook enforcement 已进入 installed projection；
   **当** 更新 related skills、installer、validation 和 fixtures；
   **则** `speclite-flow-gate`、`speclite-dev-story`、installer tests、fresh install fixtures 和 validation rules 必须覆盖 source-to-installed-to-runtime 全链路；
   **并且** Codex 项目 hooks 的 `/hooks` review/trust 边界必须在 install summary 或文档中明确。

8. **Scope stays limited to Flow Gate kickoff enforcement（范围限制在 Flow Gate kickoff enforcement）**
   **前提** 实现者考虑扩展更多 hooks；
   **当** 本 Story 开发执行；
   **则** 不实现通用 hook platform、enterprise policy engine、daemon/background watcher、hosted service、auto-run flow-gate 或 global user hook install；
   **并且** 不把 `story-completion`、CR、finalizer 或 governance report enforcement 混入本 Story。

## Tasks / Subtasks（任务 / 子任务）

- [x] Task 1: Define hook artifact contracts before implementation（AC: 1-3, 6）
  - [x] 扩展 `_bmad-output/planning-artifacts/specs/09-sdlc-workflow-lifecycle-contract.md`，定义 Flow Gate hook source root、installed hook artifact、hook runner、platform config projection 和 `flow_gate_report_metadata`。
  - [x] 扩展 `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md`，明确 files index 如何表达 hook runner、platform hook config、safe-merged config、executable intent、`artifactKind` 和 `sourceRef`。
  - [x] 扩展 `_bmad-output/planning-artifacts/specs/05-ide-adapter-registry-contract.md`，明确 hook projection 是 adapter artifact，不得混入 canonical skill package hash。
  - [x] 如新增 validation issue id 或 fixture behavior，先更新 `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md` 与 `_bmad-output/planning-artifacts/specs/08-fixture-contract.md`。

- [x] Task 2: Add independent canonical hook source package（AC: 1）
  - [x] 新增独立 source root，推荐 `assets/source/speclite/hooks/flow-gate-enforcement/`。
  - [x] 在该 root 下定义 hook manifest/source metadata、runner source、Claude projection fragment、Codex projection fragment 和 README/contract notes。
  - [x] hook source 不得放入 `assets/source/speclite/sdlc-skills/4-implementation/speclite-dev-story/`；`speclite-dev-story` 只能引用 hook protection relationship。
  - [x] 如果采用不同目录名，必须仍位于 `assets/source/speclite/` 下的独立 hooks source boundary，并在 Story 的 Anchor Evidence Summary 记录理由。

- [x] Task 3: Implement installer projection and safe merge（AC: 2, 3, 7）
  - [x] 扩展 installer source traversal，使 hook artifacts 与 skill packages 分离安装；不得让 `copyCanonicalPackage` 把 hook 当作 skill package 内容复制。
  - [x] 为 Claude 投射 project-level hook 配置，优先使用 `.claude/settings.json` 中可阻断 prompt/command expansion 的 hook event；existing settings 必须 safe merge 或输出 conflict/manual action。
  - [x] 为 Codex 投射 project-level hook 配置，优先使用 `.codex/hooks.json` 或已契约化的 `.codex/config.toml` `[hooks]` 形式；install summary 必须提示项目 `.codex` trust 与 `/hooks` review/trust。
  - [x] 生成 hook runner 到 installer-owned runtime path（例如 `_speclite/hooks/flow-gate-enforcement/` 或契约化等价路径），并记录 executable intent。
  - [x] files index 必须记录 hook config/runner/source metadata；若整文件是 human-owned merged config，必须按 contract 记录保护语义，不能伪装成完整 installer-owned 文件。

- [x] Task 4: Implement hook runner behavior（AC: 4, 5）
  - [x] Runner 从 stdin 读取 Claude/Codex hook event JSON；平台差异只进入 adapter/normalizer，不进入 gate business rule。
  - [x] Runner 对非 `speclite-dev-story` intent 快速 no-op，输出平台允许的 continue/no-decision 结果。
  - [x] Runner 识别 `speclite-dev-story` intent 后解析 story key/path；无法唯一解析时阻断并要求用户指定 Story。
  - [x] Runner 通过 installed runtime config 或 `speclite resolve config --project-root <project>` 解析 `{implementation_artifacts}`，不得从 source checkout 反推路径。
  - [x] Runner 读取 hook-readable Flow Gate metadata，校验 `mode`、`storyKey`、`target`、`result`、`generatedAt` 与 freshness policy。
  - [x] Runner 对 missing/non-pass/mismatch/stale metadata 返回平台支持的 block shape 或 exit code `2`，并给出下一步命令。
  - [x] Runner 不运行 `speclite-flow-gate`、不写 report、不改 sprint-status、不改 Story 文件。

- [x] Task 5: Add Flow Gate report metadata and related skill updates（AC: 4, 6, 7）
  - [x] 更新 `assets/source/speclite/sdlc-skills/4-implementation/speclite-flow-gate/assets/report-template.md`，新增 YAML frontmatter 或 sidecar JSON contract。
  - [x] 更新 `speclite-flow-gate/SKILL.md`、`SKILL.en.md` 和 `references/workflow-details.md`，明确 report metadata 是 downstream hook/finalizer 的 machine-readable source。
  - [x] 更新 `speclite-dev-story/SKILL.md`、`SKILL.en.md` 和 `references/workflow-steps.md`，说明 Step 4 仍必须执行，hook 是外层 deterministic guard，不替代 skill 内部 Flow Gate。
  - [x] 如更新 `module-help.csv` 或 discovery metadata，只能引用既有 canonical skill ids，不得定义第二套 hook inventory。

- [x] Task 6: Tests, fixtures and validation（AC: 2-8）
  - [x] 新增 hook runner focused tests，覆盖 no-op、missing gate、non-pass gate、stale gate、wrong story、PASS、PASS_EQUIVALENT、ambiguous story intent。
  - [x] 新增 installer tests，覆盖 hook source projection、safe merge、existing config conflict、files index ownership/hash/executable intent。
  - [x] 更新 `fresh-install-empty-project` expected installed-state fixtures，包括 `files-index-full.json`、`skill-index-full.json` 或新 hook index fixture。
  - [x] 更新 validation tests，覆盖 hook runner missing/drift、config merge protection、Codex trust documentation presence。
  - [x] 运行 `npm run build`、focused tests、`npm test` 或记录阻塞原因、`git diff --check`。

## Dev Notes（开发备注）

### Source Requirements（需求来源）

- Epic source: `_bmad-output/planning-artifacts/epics/10-epic-7-post-mvp-governance-expansionpost-mvp-治理扩展.md`
- SDLC lifecycle and Flow Gate contract: `_bmad-output/planning-artifacts/specs/09-sdlc-workflow-lifecycle-contract.md`
- Manifest/files index contract: `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md`
- IDE adapter artifact boundary: `_bmad-output/planning-artifacts/specs/05-ide-adapter-registry-contract.md`
- Fixture contract: `_bmad-output/planning-artifacts/specs/08-fixture-contract.md`
- Flow Gate source skill: `assets/source/speclite/sdlc-skills/4-implementation/speclite-flow-gate/SKILL.md`
- Flow Gate report template: `assets/source/speclite/sdlc-skills/4-implementation/speclite-flow-gate/assets/report-template.md`
- Dev Story source skill: `assets/source/speclite/sdlc-skills/4-implementation/speclite-dev-story/SKILL.md`
- Claude Code hooks reference, verified 2026-06-15: `https://code.claude.com/docs/en/hooks`
- Codex hooks reference, verified 2026-06-15: `https://developers.openai.com/codex/hooks`
- Codex config basics, verified 2026-06-15: `https://developers.openai.com/codex/config-basic`

### Current Implementation Anchors（当前实现锚点）

- Source package copy behavior: `src/fs/copy-tree.ts`
- IDE target writing: `src/ide/target-writer.ts`
- Adapter registry: `src/ide/adapter-registry.ts`
- Runtime structure: `src/installer/runtime-structure.ts`
- Manifest/files index schemas: `src/manifest/manifest-schema.ts`
- IDE mirror validation: `src/validation/rules/ide-mirror.ts`
- File integrity validation: `src/validation/rules/file-integrity.ts`
- Fixture contract runtime: `src/fixtures/fixture-contract.ts`
- Existing release gate fixtures: `test/fixture-contract.test.ts`, `test/runtime-structure.test.ts`, `test/ide-target-writer.test.ts`

### Platform Notes（平台备注）

- Claude Code project hooks can be configured in `.claude/settings.json`; blocking prompt-related events use JSON output such as `decision: "block"` with `reason` when supported by the event.
- Codex project hooks can be configured in `<repo>/.codex/hooks.json` or `<repo>/.codex/config.toml`; project-local hooks load only when the project `.codex/` layer is trusted.
- Codex requires non-managed command hooks to be reviewed/trusted via `/hooks`; changed hook definitions are skipped until trusted. Installer output must make this explicit.
- `UserPromptSubmit` is the primary enforcement candidate because `speclite-dev-story` is a skill/prompt-level workflow, not a tool execution. `PreToolUse` may be a secondary guard only if contract and tests prove the behavior.
- Codex `UserPromptSubmit` matcher is not currently used, so the hook runner must self-filter and no-op cheaply for unrelated prompts.

### Scope Boundary（范围边界）

- 本 Story 是 Post-MVP，不得进入 MVP release gate。
- 不实现通用 hook platform、global user hooks、enterprise policy engine、daemon/background watcher、hosted service 或 GUI。
- 不让 hook 自动运行 `speclite-flow-gate`、自动修 Story、自动推进 sprint status 或自动信任 Codex hooks。
- 不把 hook source 放进 `speclite-dev-story` skill package。
- 不把 Flow Gate report 的 human-readable prose 当成 machine-readable contract。
- 不改变 `speclite-dev-story` Step 4 的内部 Flow Gate 要求；hook 是外层 guard。

## Dependency Gate（依赖门禁）

- **Epic Gate**: Epic 7 是 Post-MVP backlog。启动开发前必须有 `epic-kickoff` gate 的明确 PASS / PASS_EQUIVALENT，或记录人工接受 Post-MVP 开发的决策。
- **Contract Gate**: 独立 hook source root、installed hook artifact shape、Flow Gate report metadata、files-index ownership/hash/executable intent 必须先进入 owning SPEC。
- **Predecessor Gate**: Epic 1-6 MVP contracts 必须保持可消费；不得破坏现有 tests/fixtures。
- **Platform Gate**: Claude/Codex hook event、block output 和 trust/review 行为必须按官方文档和 tests 落地；平台不支持的 enforcement 不能伪装成强制执行。
- **Forward Gate**: Story 7.2 必须在 `doctor`/`sync`/`uninstall` 中消费本 Story 建立的 hook artifact metadata；Story 7.3 只有在本 Story 完成后才能提供 hook CI examples；Story 7.4 只有在本 Story 完成后才能计算 hook coverage metric；Story 7.5 不得重新定义 hook identity。
- **Worktree Gate**: 当前仓库已有 release / fixture 相关未提交改动；实现时必须先隔离范围，禁止误提交无关变更。

## Anchor Contract Map（锚点契约映射）

| Anchor Type | Anchor | Requirement |
| --- | --- | --- |
| Contract Anchor | `09-sdlc-workflow-lifecycle-contract.md` | 定义 hook source root、Flow Gate metadata、lifecycle enforcement boundary。 |
| Contract Anchor | `04-manifest-index-contract.md` | 定义 hook artifacts 在 files index 中的 ownership/hash/sourceRef/executable projection。 |
| Contract Anchor | `05-ide-adapter-registry-contract.md` | 明确 hook config 是 adapter artifact，不混入 canonical skill package hash。 |
| Contract Anchor | Claude/Codex official hook docs | 平台事件、block output、project config path、trust/review 语义必须可追溯。 |
| Functional Anchor | `assets/source/speclite/hooks/flow-gate-enforcement/` | 推荐独立 canonical hook source root；等价路径必须仍是独立 hooks source boundary。 |
| Functional Anchor | `src/ide/target-writer.ts` / `src/fs/copy-tree.ts` | Installer 必须分离 skill package copy 和 hook artifact projection。 |
| Functional Anchor | Hook runner module/script | 执行 no-op、intent detection、metadata read、PASS/PASS_EQUIVALENT allow、block output。 |
| Evidence Anchor | focused hook runner tests | 证明 pass/missing/non-pass/stale/mismatch/ambiguous/no-op 行为。 |
| Evidence Anchor | installer fixtures and files-index snapshots | 证明 source-to-installed hook artifacts、ownership/hash/executable intent 和 safe merge。 |
| Guidance Anchor | 推荐文件名与 runner 路径 | 固定路径可等价调整，但不得违反独立 hooks source boundary。 |

## Equivalent Implementation Policy（等价实现策略）

`assets/source/speclite/hooks/flow-gate-enforcement/` 是推荐路径。Reviewer 可以接受等价路径，但必须满足四个 hard gates：独立于 `speclite-dev-story` skill package、位于 `assets/source/speclite/` canonical source tree、installer 能投射到 Claude/Codex project hook locations、tests/fixtures 证明 installed runtime 可阻断 `speclite-dev-story`。如果 hook source 只存在于 `speclite-dev-story` package 内，必须判定不通过。

## Evidence Plan（证据计划）

- 新增 hook runner focused tests，例如 `test/flow-gate-hook-runner.test.ts`。
- 新增 installer projection tests，例如 `test/hook-artifact-install.test.ts` 或并入 `test/ide-target-writer.test.ts`。
- 更新 `test/fixture-contract.test.ts`、`test/runtime-structure.test.ts`、fresh install expected installed-state fixtures。
- `npm run build`
- `npm test -- test/flow-gate-hook-runner.test.ts test/hook-artifact-install.test.ts`
- `npm test`
- `git diff --check`

## Anchor Evidence Summary（锚点证据摘要）

已完成。Story `7-1` 采用推荐独立 source root `assets/source/speclite/hooks/flow-gate-enforcement/`，未使用等价替代路径。Hook source、installer projection、runtime runner、Flow Gate report metadata、related skill guidance、fixture snapshots 和 validation tests 均有对应实现与证据。

Story completion gate 已生成：`_bmad-output/implementation-artifacts/flow-gates/7-1-flow-gate-hook-enforcement-story-completion-gate.md`，结果为 `PASS`。

## Dev Agent Record（开发代理记录）

### Agent Model Used（使用模型）

GPT-5（Codex）

### Debug Log References（调试日志引用）

- 2026-06-15 12:50 CST：`sprint-status.yaml` 从 `ready-for-dev` 推进到 `in-progress`。
- 2026-06-15 12:53 CST：新增 hook runner 与 installer projection 红灯测试，确认缺失实现导致 focused tests 失败。
- 2026-06-15 12:56 CST：hook runner 与 installer projection focused tests 通过。
- 2026-06-15 13:00 CST：runtime/fixture snapshot、validation missing/drift coverage 通过 focused tests。
- 2026-06-15 13:01 CST：完整 `npm test` 首次暴露 local source fixture 与 skill-index snapshot 未同步；已按 root cause 修复。
- 2026-06-15 13:01 CST：完整 `npm test` 通过。
- 2026-06-15 13:03 CST：Story completion gate 结果 `PASS`，`sprint-status.yaml` 推进到 `review`。

### Completion Notes（完成说明）

- 定义了 Flow Gate hook source、installed artifacts、Flow Gate report metadata、files-index projection、adapter boundary、validation issue 和 fixture behavior 的 owning SPEC。
- 新增独立 canonical hook source package，未放入 `speclite-dev-story` skill package。
- Installer 现在单独投射 Flow Gate hook runner/source metadata、Claude `.claude/settings.json`、Codex `.codex/hooks.json`，并在 files-index 中记录 hook artifacts 的 ownership、hash、`artifactKind`、`sourceRef` 和 executable intent。
- Hook runner 支持 stdin hook event、非 dev-story no-op、Story key/path 解析、installed config lookup、Flow Gate YAML frontmatter metadata 校验、PASS/PASS_EQUIVALENT allow，以及 missing/non-pass/mismatch/stale/ambiguous block。
- 更新 Flow Gate report template 与 related skill guidance，明确 hook 是外层 deterministic guard，不替代 `speclite-dev-story` Step 4 内部 Flow Gate。
- 更新 fresh install fixtures、local source fixture helper、release packaging inventory、focused tests 和 full regression evidence。

### File List（文件清单）

- `_bmad-output/implementation-artifacts/flow-gates/7-1-flow-gate-hook-enforcement-story-completion-gate.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/implementation-artifacts/stories/7-1-flow-gate-hook-enforcement.md`
- `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md`
- `_bmad-output/planning-artifacts/specs/05-ide-adapter-registry-contract.md`
- `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md`
- `_bmad-output/planning-artifacts/specs/08-fixture-contract.md`
- `_bmad-output/planning-artifacts/specs/09-sdlc-workflow-lifecycle-contract.md`
- `assets/source/speclite/hooks/flow-gate-enforcement/README.md`
- `assets/source/speclite/hooks/flow-gate-enforcement/claude-settings.fragment.json`
- `assets/source/speclite/hooks/flow-gate-enforcement/codex-hooks.fragment.json`
- `assets/source/speclite/hooks/flow-gate-enforcement/hook-manifest.json`
- `assets/source/speclite/hooks/flow-gate-enforcement/runner.mjs`
- `assets/source/speclite/sdlc-skills/4-implementation/speclite-dev-story/SKILL.en.md`
- `assets/source/speclite/sdlc-skills/4-implementation/speclite-dev-story/SKILL.md`
- `assets/source/speclite/sdlc-skills/4-implementation/speclite-dev-story/references/workflow-steps.md`
- `assets/source/speclite/sdlc-skills/4-implementation/speclite-flow-gate/SKILL.en.md`
- `assets/source/speclite/sdlc-skills/4-implementation/speclite-flow-gate/SKILL.md`
- `assets/source/speclite/sdlc-skills/4-implementation/speclite-flow-gate/assets/report-template.md`
- `assets/source/speclite/sdlc-skills/4-implementation/speclite-flow-gate/references/workflow-details.md`
- `release/packaging-manifest.json`
- `src/commands/install.ts`
- `src/hooks/flow-gate-enforcement.ts`
- `src/installer/hook-artifacts.ts`
- `src/installer/runtime-structure.ts`
- `test/file-integrity-ownership.test.ts`
- `test/fixtures/fresh-install-empty-project/expected/command-json/fresh-install-success.json`
- `test/fixtures/fresh-install-empty-project/expected/installed-state/files-index-dev-story-skill.json`
- `test/fixtures/fresh-install-empty-project/expected/installed-state/files-index-full.json`
- `test/fixtures/fresh-install-empty-project/expected/installed-state/skill-index-full.json`
- `test/fixtures/fresh-install-empty-project/expected/installed-state/skill-index-speclite-dev-story.json`
- `test/fixtures/fresh-install-empty-project/expected/installed-tree.txt`
- `test/flow-gate-hook-runner.test.ts`
- `test/hook-artifact-install.test.ts`
- `test/local-source-integrity.test.ts`

## Change Log（变更记录）

| Date | Version | Description | Author |
| --- | --- | --- | --- |
| 2026-06-15 | 0.1 | 创建 Epic 7.1 ready-for-dev Story，上下文覆盖 Flow Gate Hook Enforcement、installer projection、report metadata 与 fixtures。 | Amelia |
| 2026-06-15 | 1.0 | 实现 Flow Gate hook enforcement、installer projection、report metadata、tests/fixtures，并推进 Story 至 review。 | Codex |
