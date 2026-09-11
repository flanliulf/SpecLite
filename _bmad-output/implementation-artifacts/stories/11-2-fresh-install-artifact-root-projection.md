# Story 11.2: Fresh Install Artifact Root Projection（Fresh Install Artifact Root 投影）

Status: done

<!-- 本 Story 可预先创建，但只能在 Story 11.1 已完成并通过 current story-completion Gate 后 kickoff。 -->

## Story（故事）

作为目标项目维护者，  
我希望 fresh install 把已解析的阶段化 artifact roots 投影到 config、目录结构、manifest/index 和安装摘要，  
以便新项目从首次安装开始就获得完整、可审计的 SDLC artifact topology。

## Acceptance Criteria（验收标准）

1. **Fresh Config 投影七类 Artifact Fields**
   - **前提**目标项目执行 fresh install；**当** installer 生成 `_speclite/config.toml`；**则**写入 Story 11.1 resolver 定义的七类 fields：`core.brainstorming_artifacts`，以及 `modules.sdlc.analysis_artifacts`、`planning_artifacts`、`solutioning_artifacts`、`implementation_artifacts`、`devops_artifacts`、`project_knowledge`。
   - 精确 fresh values 必须依次为 `{project-root}/_speclite-output/0-brainstorming-artifacts` 至 `{project-root}/_speclite-output/5-devops-artifacts`，以及 `{project-root}/_speclite-output/project-knowledge-base`。
2. **写入授权后预创建全部一级目录**
   - **前提** final write plan 已获授权且 operation lock 已取得；**当** runtime structure creation 执行；**则**预创建七个 resolved roots；未授权、存在 blocker 或未取得 lock 时零目录写入。
3. **Directory Plan 由 Canonical Metadata 驱动**
   - 目录集合与稳定顺序必须来自 canonical module metadata 和 Story 11.1 resolved model；command 层不得维护第二份硬编码列表。
4. **Manifest / Index 投影实际 Resolved Roots**
   - 投影实际 `resolvedRoot`、逐 field `resolutionMode`、ownership 与 artifact contract references；manifest/index 不是第二套 config 真源。
   - **Controlled Correction 2026-09-03**：2026-09-02 kickoff 原决策将 fresh install 七 roots 全部写为 `fresh-default`。该决策现收窄为 quick/default flow、未显式输入的 artifact root fields，以及仅设置 `output_folder` 后派生的七 roots。Fresh detailed prompt 中某个 artifact root field 的非空逐 field 输入必须在 projection 中标记为 `explicit-config`。
5. **Ready Summary 展示实际 Filesystem Planes**
   - 展示实际 root、plane/phase、resolution mode 与 ownership；`docs/`（Public Documentation）与 `{project_knowledge}`（Project Knowledge）必须分开。
6. **Fresh-install Fixtures 验证 Projection**
   - expected config、file tree、manifest/index、human/JSON evidence 覆盖七字段、七目录、project-relative POSIX 与 deterministic ordering；stable snapshots 不得含 absolute checkout path 或非契约 timestamp。
7. **Scope Boundary（范围边界）**
   - 只处理 fresh-install projection；不实现 existing fallback/mismatch/migration，不修改 Analysis、Planning、UX、Readiness 或 CR workflow 的具体路由。

## Tasks / Subtasks（任务 / 子任务）

- [x] Task 1: Contract Preflight 与 Kickoff Gate（AC: 1-7）
  - [x] 验证 Story 11.1 已 `done` 且 current story-completion Gate 为 `PASS` / `PASS_EQUIVALENT`；否则停止。
  - [x] 运行 Story 11.2 `story-kickoff` Gate，锁定七字段 registry、projection schema、write authorization 与 bounded files。
- [x] Task 2: 先建立失败的 Projection Tests（AC: 1-6）
  - [x] 覆盖 config TOML、directory plan、manifest/index、Ready Summary 与 human/JSON parity。
  - [x] 覆盖未授权、lock failure、resolver failure 时零 filesystem mutation。
- [x] Task 3: 接入 Fresh Config Projection（AC: 1, 3）
  - [x] 让 `createConfigInitializationPlan()` 消费 Story 11.1 resolver/model，不复制 defaults。
  - [x] 序列化七类 portable `{project-root}` values；保留 quick/detailed、TOML ownership 与四层 override 行为。
- [x] Task 4: 接入 Runtime Directory Plan（AC: 2-3）
  - [x] 让 `createArtifactRootContext()` / `createArtifactDirectories()` 消费同一 resolved registry。
  - [x] 保持 plan-before-write、operation lock、safe-write、partial-failure diagnostics。
- [x] Task 5: 扩展 Manifest / Index / Ready Summary（AC: 4-5）
  - [x] 投影逐 root 的 path、mode、plane/phase、ownership 与 contract reference，并保持 deterministic ordering。
  - [x] 不改变既有 `CommandResult` envelope；不得泄露 absolute path。
- [x] Task 6: Fixture 与 Regression Verification（AC: 1-7）
  - [x] 更新 fresh-install expected config/tree/manifest/index/summary snapshots。
  - [x] 运行 focused tests、install/ready regressions、`npm run build` 与 `git diff --check`。
  - [x] 进入 `review` 前生成 Story 11.2 `story-completion` Gate，并用实际输出填写 Evidence Summary。

## Dev Notes（开发备注）

### Current Verified Baseline（当前已验证基线）

- `src/installer/config-initialization.ts` 当前只投影旧四个 SDLC roots，并把 `project_knowledge` fresh default 设为 `docs`；它已拥有 config plan、portable path、symlink check 和 installer/human ownership，必须扩展而非旁路。
- `src/installer/runtime-structure.ts` 已在 write authorization 后取得 project operation lock，再通过 `ensureSafeDirectory()` / `safeWriteFile()` 执行写入；必须保留这一顺序。
- `src/manifest/manifest-generator.ts::ArtifactRootContext` 当前只含旧 roots，`createArtifactContract()` 也只替换旧 placeholders；应消费 Story 11.1 shared model。
- `src/installer/ready-check.ts` 当前验证 manifest/index/mirror/runtime paths；Ready Summary 的 plane 展示应基于已验证的 actual resolved paths。
- 当前 Story 11.1 只有规划文档，没有 implementation/tests/completion evidence；本 Story kickoff 不得把它视为已经提供 resolver。

### Contract Decision Required Before Development（开发前必须关闭的契约决策）

- `SPEC 04` 当前 public manifest 与 `CommandResult` 只暴露单一 `artifactRoot`。Kickoff 必须先决定逐-root projection 的 container、exact fields、required/optional、ordering、backward compatibility 与 `schemaVersion`；未关闭时为 `DECISION_NEEDED`，generator/presenter 不得临场发明 public shape。
- `SPEC 01` 拥有 public `CommandResult` JSON schema，`SPEC 04` 拥有 manifest/index public fields 与 schema evolution。若本 Story 需要新增或改变 public JSON / manifest shape，必须先取得 owning SPEC 同变更更新；若不改 schema，kickoff 必须记录 no-schema-change rationale，说明七 root evidence 如何通过既有字段表达，且不得由实现代码临场决定 actual public shape。

### Technical Requirements（技术要求）

- Node.js `>=22`、TypeScript ESM；沿用 `toml@4.1.1`、`yaml@2.9.0`、`zod@4.4.3`、`vitest@4.1.6`，不新增依赖、不升级版本。
- 七 roots 的 key/default/order/mode 必须来自 Story 11.1 config-owned registry；所有 public path 使用 project-relative POSIX。
- Config TOML 可以持久化 `{project-root}` portable token；manifest/index/summary 只能投影 display-safe resolved paths。
- 写入只能发生在 final authorization + lock 后；任何 validation failure 必须在首个 write 前终止。
- `docs/` 不得继续作为 fresh `project_knowledge` default，但 Public Documentation plane 仍必须独立呈现。

### Architecture Compliance（架构合规）

- 遵守 `SPEC 03` plan-before-write 与 safe-write、`SPEC 04` manifest/index ownership、`SPEC 08` fixture determinism、`SPEC 09` roots/defaults/modes。
- 不建立 command-local roots 表或 manifest-owned defaults；projection consumer 不拥有 contract。
- 不迁移或触碰 existing workflow-owned artifacts；该行为属于 Story 11.3。

### Testing Requirements（测试要求）

- 至少覆盖 7-field TOML exact values、7-directory exact order、manifest/index resolved projection、Ready Summary plane separation。
- 对 writeAuthorized=false、lock conflict、invalid root 做前后 filesystem snapshot，证明零 partial write。
- Snapshot normalize/exclude `generatedAt` 等 volatile values；不得固化本机 absolute path。
- 回归 `test/config-initialization.test.ts`、`test/runtime-structure.test.ts`、`test/install-progress-ready-summary.test.ts`、manifest/index tests。

## Previous Story Intelligence（前序 Story 情报）

- Story 11.1 计划提供 config-owned pure resolver、七字段稳定顺序及 `fresh-default | explicit-config | legacy-compatible`；11.2 只消费其完成态 API，不重新定义语义。
- 11.1 仍有 unresolved-token issue ID 的 kickoff 决策，且尚未实现；本 Story 必须在 kickoff 重新核验 current evidence，不能引用 `ready-for-dev` 文档作为完成证明。

## Dependency Gate（依赖门禁）

- Hard predecessor：Story 11.1 必须 `done`，其 current completion Gate 的 `target/storyKey` 精确匹配且结论为 `PASS` / `PASS_EQUIVALENT`。
- Required gate mode：`story-kickoff`；报告路径：`{implementation_artifacts}/flow-gates/11-2-fresh-install-artifact-root-projection-story-kickoff-gate.md`。
- 若 shared resolver、mode literals、unresolved-token diagnostic、consumer handoff、`SPEC 01` / `SPEC 04` owner decision、同变更更新或 no-schema-change rationale 未完成，Gate 必须停止；不得在 11.2 内临时补写 11.1 contract 或 public schema shape 后宣称前置已满足。

## Anchor Contract Map（锚点契约映射）

| Dependency | Anchor Type | Required Evidence | Gate Behavior |
| --- | --- | --- | --- |
| 七 roots、defaults、modes | Contract | Story 11.1 completion evidence + `SPEC 09` matrix | 缺失为 `FAIL_CONTRACT` |
| Write authorization / lock / safe write | Contract | `SPEC 03` tests | 任一前置不满足仍写入为 `FAIL_FUNCTION` |
| Config / directory / manifest / summary projection | Functional | 同一 resolver identity + deterministic outputs | 出现第二套 defaults 为 `FAIL_FUNCTION` |
| Fresh fixture matrix | Evidence | config/tree/index/human/JSON snapshots | 缺失或含 absolute path 为 `FAIL_EVIDENCE` |

## Equivalent Implementation Policy（等价实现策略）

- Helper/file split 可调整，但不得改变七个 config keys/defaults、目录集合与顺序、`fresh-default`、plane separation、write authorization 或 stable evidence。
- Controlled correction 2026-09-03 后，`fresh-default` 的不可变要求仅覆盖 quick/default、未显式逐 field 输入与 `output_folder` 派生 defaults；fresh detailed 非空逐 field artifact root input 的 expected mode 是 `explicit-config`。
- 现有 schema 可扩展或增加 adjacent projection model；不得用重复常量或 snapshot-only 伪造 resolver consumption。

## Evidence Plan（证据计划）

- 记录 Story 11.1 completion Gate identity 与 consumed resolver API/hash。
- 对 config TOML、directory tree、manifest/index、Ready Summary 分别产生 focused evidence，并做 cross-output 7-root reconciliation。
- 记录 pre-write blocked cases 的 before/after tree hash，证明零写入。
- 以 negative scan 证明 active command/installer/manifest 没有竞争性的 fresh default 列表。

## Files To Modify（预计文件范围）

### Update Files（更新文件）

- `src/installer/config-initialization.ts`：从 shared resolver 投影七字段；保留现有 config plan、ownership、symlink 与 prompt 行为。
- `src/installer/runtime-structure.ts`：从 canonical resolved model 建立目录 plan；保留 authorization、lock、safe-write 与 partial-failure evidence。
- `src/manifest/manifest-generator.ts`：投影 actual roots/modes/contracts；保留 deterministic index sorting。
- `src/manifest/manifest-schema.ts`：current `Manifest.paths` 只有单一 `artifactRoot`；只按 `SPEC 04` 已批准 shape 扩展，并明确旧 schema compatibility。
- `src/commands/install.ts`：把同一 resolved projection 传给 public result/presenter；保留 command lifecycle 与 exit behavior。
- `src/diagnostics/command-result-schema.ts`、`src/diagnostics/command-result.ts`：current path summary 只有单一 `artifactRoot`；不破坏 shared envelope。
- `src/diagnostics/output.ts`、`src/diagnostics/install-presentation-context.ts`、`src/installer/ready-check.ts`：呈现实际 planes；保留 human/JSON parity、manifest/index/mirror blocking checks 与 localized presentation。
- `assets/source/speclite/sdlc-skills/module.yaml`：声明 canonical directories/defaults；不得成为第二真源。
- `test/config-initialization.test.ts`、`test/runtime-structure.test.ts`、`test/install-progress-ready-summary.test.ts` 及相关 fixtures。

### Owner-gated Contract Files（Owner 决策门禁文件）

- `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md`：仅当 owner decision 批准 public `CommandResult` JSON schema 变更时同变更更新；否则在 kickoff 记录 no-schema-change rationale。
- `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md`：仅当 owner decision 批准 manifest/index public shape 或 schema evolution 变更时同变更更新；否则在 kickoff 记录 no-schema-change rationale。

### Explicitly Deferred Files（明确延后）

- existing-install mismatch/no-migration（Story 11.3）；Analysis/Planning/UX/Readiness/CR Skills（Story 11.4–11.9）；grill inventory（Story 11.10）。

## References（参考资料）

- [Source: Epic 11 Story 11.2]
- [Source: `_bmad-output/planning-artifacts/specs/09-sdlc-workflow-lifecycle-contract.md#Runtime-Artifact-RootsRuntime-Artifact-根路径`]
- [Source: `_bmad-output/planning-artifacts/specs/03-install-plan-contract.md`]
- [Source: `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md`]
- [Source: `_bmad-output/planning-artifacts/architecture/03-core-architectural-decisions核心架构决策.md#Artifact-Root-Resolution-FlowArtifact-Root-解析流`]
- [Source: `_bmad-output/planning-artifacts/implementation-readiness-report-2026-09-02.md#Summary-And-Recommendations总结与建议`]
- [Source: `src/installer/config-initialization.ts`]
- [Source: `src/installer/runtime-structure.ts`]
- [Source: `src/manifest/manifest-generator.ts`]

## Project Context Reference（项目上下文引用）

- `_bmad-output/project-context.md` 仍是 initialized skeleton；以 current PRD、Architecture、Specs、Epic、UX 与源码为准。
- 保护当前用户工作树；实现时先 scoped status audit，不得覆盖、暂存或提交本 Story 外改动。

## Dev Agent Record（开发代理记录）

### Agent Model Used（使用模型）

Codex GPT-5

### Debug Log References（调试日志引用）

- Kickoff Gate: `_bmad-output/implementation-artifacts/flow-gates/11-2-fresh-install-artifact-root-projection-story-kickoff-gate.md` -> `PASS`。
- RED evidence: `npx vitest run test/config-initialization.test.ts test/runtime-structure.test.ts test/install-progress-ready-summary.test.ts` 先失败，暴露 missing seven-root config/TOML、Ready Summary planes 与 `paths.artifactRoots` projection。
- Focused evidence: `npx vitest run test/config-initialization.test.ts test/runtime-structure.test.ts test/install-progress-ready-summary.test.ts` -> 3 files / 31 tests passed。
- Affected regression evidence: `npx vitest run test/fixture-release-gates.test.ts test/fixture-contract.test.ts test/artifact-root-resolution.test.ts test/resolve-readers.test.ts test/artifact-path-validation.test.ts test/manifest-discovery.test.ts test/ide-target-writer.test.ts test/cli-smoke.test.ts test/status-command.test.ts` -> 9 files / 81 tests passed。
- Canonical source check: `node assets/source/speclite/support-skills/speclite-check-canonical-source-change/scripts/check_canonical_source_change.mjs --project-root . --scope all --format json --mode strict` -> `status: ok`, `findings: []`, `decisionRecordRequired: false`。
- Packaging evidence: `npm run release:packaging-check` -> packaging acceptance passed for `release/packaging-manifest.json` and `dist/packaging-manifest.json`。
- Full evidence: `npm test` -> 61 files passed, 475 tests passed, 4 todo。
- Build evidence: `npm run build` -> ESM and DTS build success。
- Whitespace evidence: `git diff --check` -> exit 0。
- Completion Gate: `_bmad-output/implementation-artifacts/flow-gates/11-2-fresh-install-artifact-root-projection-story-completion-gate.md` -> `PASS`。
- CR Round 3 Reviewer: `_bmad-output/implementation-artifacts/code-reviews/11-2-code-review/11-2-code-review-summary-20260903-round-3.md` -> 通过，0 new findings，`Model Used: GPT-5.5 (gpt-5.5)`。
- CR Round 3 Evaluator: `_bmad-output/implementation-artifacts/code-reviews/11-2-code-review/11-2-code-review-evaluation-20260903-round-3.md` -> 通过，无需 fixer 或新 owner decision，`Model Used: GPT-5.5 (gpt-5.5)`。
- CR04 Rules: `_bmad-output/implementation-artifacts/cr-rules/cr-rules-summary.md` 已记录 `CR-API-35`、`CR-API-36`、`CR-PROCESS-02`。
- CR05 TODO: `_bmad-output/implementation-artifacts/cr-rules/cr-todo-backlog.md` 已登记 `TODO-012`，状态 `open`，P2 / future-story，deferred non-blocking，不阻塞 Story 11.2。
- CR06 Finalizer: live 核验 Story 11.1 predecessor gate、Story 11.2 kickoff/completion gate、Round 3 reviewer/evaluator、CR04/CR05 记录后，将 Story 与 sprint tracker 同步为 `done`；`bmm-workflow-status.yaml` 不存在，按 Skill 记录 skipped，未创建。
- CR06 verification: focused status/gate reread -> PASS；canonical source checker warn/strict -> `status: ok`、`findings: []`、`decisionRecordRequired: false`；skill density checks -> no warnings；focused tests -> 8 files / 67 tests passed；`npm run build` -> PASS；`npm test` -> 61 files, 481 passed, 4 todo；`npm run release:packaging-check` -> PASS；`git diff --check` -> PASS。

### Completion Notes List（完成说明）

- 已验证 Story 11.1 live completion identity/API：Story `Status: done`，completion gate `target/storyKey=11-1-executable-artifact-root-resolution-contract` 且 `result: PASS`。
- Kickoff owner decision 已关闭：`SPEC 01` / `SPEC 04` 采用 bounded additive public schema update，保留 legacy `artifactRoot`，新增 optional ordered `artifactRoots[]` projection，不 bump `speclite.command-result.v1` / `speclite.manifest.v1`。
- Fresh install config、directory plan、manifest/index、Ready Summary、human/JSON fixture 已统一消费 Story 11.1 `ARTIFACT_ROOT_REGISTRY` / resolver output。
- Controlled correction 2026-09-03 已补充 fresh detailed per-root explicit mode：非空逐 field artifact root input 投影为 `explicit-config`，其余 fresh defaults 仍为 `fresh-default`。
- `docs/` 作为 Public Documentation plane 独立呈现；fresh `{project_knowledge}` default 已投影到 `_speclite-output/project-knowledge-base`。
- 未授权、lock failure、resolver failure 路径保持首个 write 前失败和零 filesystem mutation。
- 未实现 existing fallback/mismatch/migration，也未修改 Analysis/Planning/UX/Readiness/CR workflow routing。
- CR06 finalizer 已完成：Story 11.2 从 `review` 变更为 `done`，`sprint-status.yaml` 中 `11-2-fresh-install-artifact-root-projection` 从 `review` 变更为 `done`。
- `TODO-012` 是已登记的 deferred non-blocking P2 future-story backlog，归属 Story 11.4+ / 后续 owner decision；本 Story 未修复该 TODO，也不把它作为 blocker。
- `_bmad-output/planning-artifacts/bmm-workflow-status.yaml` 当前不存在；按 finalizer Skill 容错记录 skipped，未创建臆造 workflow tracker。
- Epic 11 保持 `in-progress`；Story 11.3-11.10 仍为 `ready-for-dev`，不得在 Story 11.2 closeout 内自动推进。
- 本次 CR06 未修改源码、tests、SPEC、canonical source、reviewer/evaluator artifact、rules summary 或 TODO backlog；未 commit、未 push。

### File List（文件清单）

- `_bmad-output/implementation-artifacts/stories/11-2-fresh-install-artifact-root-projection.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/implementation-artifacts/flow-gates/11-2-fresh-install-artifact-root-projection-story-kickoff-gate.md`
- `_bmad-output/implementation-artifacts/flow-gates/11-2-fresh-install-artifact-root-projection-story-completion-gate.md`
- `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md`
- `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md`
- `assets/source/speclite/sdlc-skills/module.yaml`
- `release/packaging-manifest.json`
- `src/bin/speclite.ts`
- `src/commands/install.ts`
- `src/config/artifact-root-resolver.ts`
- `src/config/config-schema.ts`
- `src/config/customization-reader.ts`
- `src/diagnostics/command-result-schema.ts`
- `src/diagnostics/output.ts`
- `src/fs/path-normalizer.ts`
- `src/installer/config-initialization.ts`
- `src/installer/ready-check.ts`
- `src/installer/runtime-structure.ts`
- `src/manifest/manifest-generator.ts`
- `src/manifest/manifest-schema.ts`
- `test/config-initialization.test.ts`
- `test/fixture-release-gates.test.ts`
- `test/install-progress-ready-summary.test.ts`
- `test/runtime-structure.test.ts`
- `test/skill-artifact-loop.test.ts`
- `test/fixtures/fresh-install-empty-project/expected/command-json/fresh-install-success.json`
- `test/fixtures/fresh-install-empty-project/expected/installed-state/files-index-full.json`
- `test/fixtures/fresh-install-empty-project/expected/installed-state/manifest-full.json`
- `test/fixtures/fresh-install-empty-project/expected/installed-state/manifest.json`
- `test/fixtures/fresh-install-empty-project/expected/installed-state/phase-coverage-full.json`
- `test/fixtures/fresh-install-empty-project/expected/installed-tree.txt`

## Anchor Evidence Summary（锚点证据摘要）

- Predecessor completion identity：Story 11.1 completion gate frontmatter 已核验，`schemaVersion: speclite.flow-gate-report.v2`、`mode: story-completion`、`target/storyKey: 11-1-executable-artifact-root-resolution-contract`、`result: PASS`。
- Owner decision：`SPEC 01` 与 `SPEC 04` 同变更声明 optional ordered `artifactRoots[]` projection；entry fields 为 `field/configPath/placeholder/resolvedRoot/resolutionMode/plane/ownership/contractRefs`；container optional、entry complete；ordering 固定为七 root registry 顺序；legacy `artifactRoot` 保留。
- Functional anchor：fresh config initialization、runtime directory creation、manifest generation、ReadyCheck / Ready Summary 均消费同一 resolved root projection；`CommandResult` envelope 未改变；public paths 保持 project-relative POSIX。
- Evidence anchor：focused tests、affected regressions、canonical source strict check、packaging check、full `npm test`、`npm run build`、`git diff --check` 全部通过。
- Equivalent implementation decisions：无 `PASS_EQUIVALENT`；completion gate 为直接 `PASS`。
- CR closeout anchor：最新 Round 3 reviewer/evaluator 均为 `GPT-5.5 (gpt-5.5)` 且结论通过；CR04 已沉淀三条规则；CR05 已把 `workflow-artifact-layout.md` generic route strings 作为 `TODO-012` deferred non-blocking backlog；CR06 只同步 Story/tracker 与编排记录。
- Finalizer verification anchor：CR06 后已重跑 focused status/gate check、canonical warn/strict checker、support skill density checks、focused tests、build、full test、packaging check 与 `git diff --check`，全部通过。

## Change Log（变更记录）

| Date | Version | Description | Author |
| --- | --- | --- | --- |
| 2026-09-02 | 0.1 | 创建 Story 11.2 implementation context，定义 fresh config、directory、manifest/index、Ready Summary 与 fixture projection。 | Fancyliu / Codex |
| 2026-09-03 | 1.0 | 完成 fresh-install 七 artifact roots 投影、SPEC 01/04 additive schema、fixtures 与验证收口，Story 进入 review。 | Codex |
| 2026-09-03 | 1.1 | Controlled correction：修正 fresh detailed 非空逐 field artifact root input 的 `resolutionMode` 为 `explicit-config`，保留 quick/default 与 `output_folder` 派生 roots 的 `fresh-default`。 | Codex |
| 2026-09-03 | 1.2 | CR06 finalizer：核验 Round 3 reviewer/evaluator、CR04、CR05 与 story-completion gate 后，将 Story 11.2 和 sprint tracker 同步为 done；`TODO-012` 保持 deferred non-blocking。 | Codex |

---

*本文档由 bmad-create-story Skill 自动生成*
