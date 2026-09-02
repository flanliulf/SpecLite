# Story 11.2: Fresh Install Artifact Root Projection（Fresh Install Artifact Root 投影）

Status: ready-for-dev

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
   - 投影实际 `resolvedRoot`、`resolutionMode: fresh-default`、ownership 与 artifact contract references；manifest/index 不是第二套 config 真源。
5. **Ready Summary 展示实际 Filesystem Planes**
   - 展示实际 root、plane/phase、resolution mode 与 ownership；`docs/`（Public Documentation）与 `{project_knowledge}`（Project Knowledge）必须分开。
6. **Fresh-install Fixtures 验证 Projection**
   - expected config、file tree、manifest/index、human/JSON evidence 覆盖七字段、七目录、project-relative POSIX 与 deterministic ordering；stable snapshots 不得含 absolute checkout path 或非契约 timestamp。
7. **Scope Boundary（范围边界）**
   - 只处理 fresh-install projection；不实现 existing fallback/mismatch/migration，不修改 Analysis、Planning、UX、Readiness 或 CR workflow 的具体路由。

## Tasks / Subtasks（任务 / 子任务）

- [ ] Task 1: Contract Preflight 与 Kickoff Gate（AC: 1-7）
  - [ ] 验证 Story 11.1 已 `done` 且 current story-completion Gate 为 `PASS` / `PASS_EQUIVALENT`；否则停止。
  - [ ] 运行 Story 11.2 `story-kickoff` Gate，锁定七字段 registry、projection schema、write authorization 与 bounded files。
- [ ] Task 2: 先建立失败的 Projection Tests（AC: 1-6）
  - [ ] 覆盖 config TOML、directory plan、manifest/index、Ready Summary 与 human/JSON parity。
  - [ ] 覆盖未授权、lock failure、resolver failure 时零 filesystem mutation。
- [ ] Task 3: 接入 Fresh Config Projection（AC: 1, 3）
  - [ ] 让 `createConfigInitializationPlan()` 消费 Story 11.1 resolver/model，不复制 defaults。
  - [ ] 序列化七类 portable `{project-root}` values；保留 quick/detailed、TOML ownership 与四层 override 行为。
- [ ] Task 4: 接入 Runtime Directory Plan（AC: 2-3）
  - [ ] 让 `createArtifactRootContext()` / `createArtifactDirectories()` 消费同一 resolved registry。
  - [ ] 保持 plan-before-write、operation lock、safe-write、partial-failure diagnostics。
- [ ] Task 5: 扩展 Manifest / Index / Ready Summary（AC: 4-5）
  - [ ] 投影逐 root 的 path、mode、plane/phase、ownership 与 contract reference，并保持 deterministic ordering。
  - [ ] 不改变既有 `CommandResult` envelope；不得泄露 absolute path。
- [ ] Task 6: Fixture 与 Regression Verification（AC: 1-7）
  - [ ] 更新 fresh-install expected config/tree/manifest/index/summary snapshots。
  - [ ] 运行 focused tests、install/ready regressions、`npm run build` 与 `git diff --check`。
  - [ ] 进入 `review` 前生成 Story 11.2 `story-completion` Gate，并用实际输出填写 Evidence Summary。

## Dev Notes（开发备注）

### Current Verified Baseline（当前已验证基线）

- `src/installer/config-initialization.ts` 当前只投影旧四个 SDLC roots，并把 `project_knowledge` fresh default 设为 `docs`；它已拥有 config plan、portable path、symlink check 和 installer/human ownership，必须扩展而非旁路。
- `src/installer/runtime-structure.ts` 已在 write authorization 后取得 project operation lock，再通过 `ensureSafeDirectory()` / `safeWriteFile()` 执行写入；必须保留这一顺序。
- `src/manifest/manifest-generator.ts::ArtifactRootContext` 当前只含旧 roots，`createArtifactContract()` 也只替换旧 placeholders；应消费 Story 11.1 shared model。
- `src/installer/ready-check.ts` 当前验证 manifest/index/mirror/runtime paths；Ready Summary 的 plane 展示应基于已验证的 actual resolved paths。
- 当前 Story 11.1 只有规划文档，没有 implementation/tests/completion evidence；本 Story kickoff 不得把它视为已经提供 resolver。

### Contract Decision Required Before Development（开发前必须关闭的契约决策）

- `SPEC 04` 当前 public manifest 与 `CommandResult` 只暴露单一 `artifactRoot`。Kickoff 必须先决定逐-root projection 的 container、exact fields、required/optional、ordering、backward compatibility 与 `schemaVersion`；未关闭时为 `DECISION_NEEDED`，generator/presenter 不得临场发明 public shape。

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
- 若 shared resolver、mode literals、unresolved-token diagnostic 或 consumer handoff 未完成，Gate 必须停止；不得在 11.2 内临时补写 11.1 contract 后宣称前置已满足。

## Anchor Contract Map（锚点契约映射）

| Dependency | Anchor Type | Required Evidence | Gate Behavior |
| --- | --- | --- | --- |
| 七 roots、defaults、modes | Contract | Story 11.1 completion evidence + `SPEC 09` matrix | 缺失为 `FAIL_CONTRACT` |
| Write authorization / lock / safe write | Contract | `SPEC 03` tests | 任一前置不满足仍写入为 `FAIL_FUNCTION` |
| Config / directory / manifest / summary projection | Functional | 同一 resolver identity + deterministic outputs | 出现第二套 defaults 为 `FAIL_FUNCTION` |
| Fresh fixture matrix | Evidence | config/tree/index/human/JSON snapshots | 缺失或含 absolute path 为 `FAIL_EVIDENCE` |

## Equivalent Implementation Policy（等价实现策略）

- Helper/file split 可调整，但不得改变七个 config keys/defaults、目录集合与顺序、`fresh-default`、plane separation、write authorization 或 stable evidence。
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

待实现 Agent 填写。

### Debug Log References（调试日志引用）

待实现 Agent 填写。

### Completion Notes List（完成说明）

- 终极上下文引擎分析已完成 —— 已创建完整开发者指南。
- Story 尚未实现；tasks 与 Evidence Plan 不代表 verified evidence。

### File List（文件清单）

- `_bmad-output/implementation-artifacts/stories/11-2-fresh-install-artifact-root-projection.md`（create-story output）
- `_bmad-output/implementation-artifacts/sprint-status.yaml`（tracker update）

## Anchor Evidence Summary（锚点证据摘要）

- Predecessor completion identity：待 kickoff 填写。
- Contract / functional / evidence anchors：待实现后填写。
- Equivalent implementation decisions：待 Gate 记录。

## Change Log（变更记录）

| Date | Version | Description | Author |
| --- | --- | --- | --- |
| 2026-09-02 | 0.1 | 创建 Story 11.2 implementation context，定义 fresh config、directory、manifest/index、Ready Summary 与 fixture projection。 | Fancyliu / Codex |

---

*本文档由 bmad-create-story Skill 自动生成*
