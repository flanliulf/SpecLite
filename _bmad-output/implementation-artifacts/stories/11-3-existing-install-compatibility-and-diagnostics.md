# Story 11.3: Existing Install Compatibility And Diagnostics（Existing Install 兼容与诊断）

Status: done

<!-- 仅创建上下文；必须等待 Story 11.1–11.2 完成后才能 kickoff。 -->

## Story（故事）

作为 existing SpecLite 项目的维护者，  
我希望既有 artifact 配置和 workflow-owned artifacts 在 topology 演进后继续有效，  
以便普通 install、update 或 repair 不会把 fallback 误当成 migration，也不会破坏历史产物。

## Acceptance Criteria（验收标准）

1. Existing explicit `planning_artifacts`、`implementation_artifacts`、`devops_artifacts`、`project_knowledge` 始终权威，不得被 fresh defaults 覆盖或回写。
2. Existing install 缺少 `brainstorming_artifacts`、`analysis_artifacts`、`solutioning_artifacts` 时，逐 field 使用 Story 11.1 `legacy-compatible` fallback，不得报 config corruption。
3. 普通 install、update、`update --repair` 不得移动、复制、重命名、删除或重写任何 workflow-owned artifact；显式 migration 属未来独立授权能力。
4. Config root 与 on-disk artifact 不一致时，只报告稳定 `config-artifact-mismatch`，并区分 `configuredRoot`、`resolvedRoot`、`actualConsumedPath`；不得改变任何一方或宣称 migration。
5. 旧 whole/sharded documents 与旧 `sprint-status.story_location` 继续可发现、可消费，并记录 actual path 与 compatibility mode。
6. Existing Ready Summary/status/Filesystem Space Map 展示 actual `resolvedRoot` / `resolutionMode`，不得用 fresh defaults 冒充 current state。
7. Fixtures 必须证明 explicit authority、legacy fallback、artifact bytes/content 不变、mismatch diagnostics 与 no-migration；禁止靠自动迁移通过。
8. 本 Story 不执行 migration，也不修改具体 workflow 的新默认输出路由。

## Tasks / Subtasks（任务 / 子任务）

- [x] Task 1: Predecessor 与 Kickoff Gate（AC: 1-8）
  - [x] 核验 Story 11.1–11.2 均 `done` 且 completion Gate current、target-matched、通过。
  - [x] 在 `story-kickoff` 中锁定 mismatch stable issue ID、actual-path evidence schema 与 read-only boundary。
- [x] Task 2: 先建立 Existing Compatibility Matrix（AC: 1-7）
  - [x] 覆盖 all-explicit、missing-new-fields、mixed modes、legacy story location、mismatch 与 artifact preservation。
- [x] Task 3: 接入 Existing Root Resolution（AC: 1-2, 6）
  - [x] 复用 Story 11.1 resolver；不得从 manifest、directory existence 或 fresh defaults 反推配置。
- [x] Task 4: 实现 Mismatch Diagnostics 与 Discovery Evidence（AC: 4-6）
  - [x] 在 `SPEC 07` 预注册 issue；producer 只输出 project-relative POSIX、确定性 details。
- [x] Task 5: 收口 Update / Repair No-migration（AC: 3, 7）
  - [x] 扩展 plan/ownership assertions，证明 workflow-owned paths 只读且不进入 changedPaths。
- [x] Task 6: Verification（AC: 1-8）
  - [x] 运行 focused compatibility、artifact-path、update-plan、existing-install fixtures、build 与 `git diff --check`。
  - [x] review 前运行 `story-completion` Gate，填写实际 Anchor Evidence Summary。

## Dev Notes（开发备注）

### Current Verified Baseline（当前已验证基线）

- `src/config/config-reader.ts` 已复用 four-layer TOML merge，但 current code 尚无完整 existing lifecycle root evidence。
- `src/validation/artifact-paths.ts` 与 `src/validation/rules/artifact-path.ts` 已拥有 path/symlink/missing/metadata diagnostics；mismatch 必须新增专用 stable ID，不能复用 escape issue。
- `src/validation/validate-project.ts` 当前从 manifest 单一 `artifactRoot` 启动检查；需按 resolved-root evidence 扩展。
- `src/update/update-plan.ts` / `src/update/ownership-model.ts` 已有 ownership、hash conflict、plan-before-write；必须延续 workflow-owned 保护。
- Legacy `story_location` 的实际 consumers 位于 canonical Flow Gate、Dev Story、Create Story workflows；本 Story提供 shared compatibility resolution/evidence handoff并验证旧位置仍可读，whole/sharded 选择决策正式留给 Story 11.5。
- Existing-state readout 包括 validate/status/Ready Summary/Filesystem Space Map；它们必须消费同一 resolved evidence，不得从 manifest 单一 `artifactRoot` 猜测。
- Story 11.1/11.2 当前仅为 `ready-for-dev` planning artifacts，尚无可消费实现 evidence。

### Technical / Architecture Requirements（技术与架构要求）

- 复用本地锁定的 Node `>=22`、TypeScript ESM、Zod/TOML/YAML/Vitest；无外部 API、无依赖升级。
- `legacy-compatible` 是逐 field resolution mode，不是 command status、migration 或 corruption。
- Configured / resolved / actual 三条 path 必须分离、project-relative POSIX、stable sorted、无 absolute/private path。
- Mismatch detection、legacy discovery 与 lifecycle operation 必须 read-only；zero artifact/config/progress mutation 是硬证据。
- `SPEC 09` 拥有 fallback/no-migration；`SPEC 07` 拥有 issue ID；consumer 不得发明第二契约。

### Testing Requirements（测试要求）

- 新增 `test/fixtures/config-artifact-mismatch/**` 与 focused existing compatibility suite，扩展 `test/fixtures/existing-install-update/**`。
- 对每个 fixture 保存 before/after tree + content hashes，断言 workflow-owned artifacts byte-identical。
- 覆盖 explicit/missing/mixed roots、legacy whole/sharded、legacy story location、mismatch、unknown future metadata、POSIX/redaction。

## Evidence Plan（证据计划）

- 对 configured/resolved/actual path 做逐 field reconciliation，并验证 status/human/JSON 共用证据。
- 记录 legacy whole/sharded 与旧 `story_location` consumer handoff；不得提前实现 Story 11.5 precedence。
- 对 config、workflow-owned artifacts、progress metadata 做 before/after hashes，要求零 mutation。
- `config-artifact-mismatch` exact issue ID 当前尚未在 `SPEC 07` 固定；kickoff 必须注册或明确复用并记录 rationale，否则为 `DECISION_NEEDED`。

## Previous Story Intelligence（前序 Story 情报）

- Story 11.2 应只建立 fresh projection；若其实现混入 existing mutation，11.3 kickoff 必须阻断而非继承。
- 最近提交没有 Story 11.1/11.2 implementation evidence；只能消费 future current completion Gate，不消费计划文本作为事实。

## Dependency Gate（依赖门禁）

- Hard predecessors：Story 11.1–11.2 `done` + target-matched completion gates。
- Kickoff report：`{implementation_artifacts}/flow-gates/11-3-existing-install-compatibility-and-diagnostics-story-kickoff-gate.md`。
- 缺 stable mismatch issue、`SPEC 07` registry update 或 no-new-ID reuse rationale、no-migration proof strategy、predecessor evidence 时停止。

## Anchor Contract Map（锚点契约映射）

| Anchor | Owner | Evidence | Failure |
| --- | --- | --- | --- |
| explicit authority / fallback / no-migration | `SPEC 09` | per-field matrix + no-write hash | `FAIL_CONTRACT` |
| `config-artifact-mismatch` | `SPEC 07` | registry + deterministic issue fixture | `FAIL_CONTRACT` |
| existing discovery/output | resolver + validator | configured/resolved/actual reconciliation | `FAIL_FUNCTION` |
| preservation | update ownership | byte-identical fixtures | `FAIL_EVIDENCE` |

## Equivalent Implementation Policy（等价实现策略）

- 内部 helper 可调整；不可改变 explicit authority、fallback literals/modes、actual-path evidence、stable issue、no-migration 或 zero-write semantics。

## Files To Modify（预计文件范围）

- `src/config/config-reader.ts` / Story 11.1 resolver：existing lifecycle context 与 per-field mode。
- `src/validation/artifact-paths.ts`、`src/validation/rules/artifact-path.ts`、`src/validation/validate-project.ts`：mismatch/evidence。
- `src/update/update-plan.ts`、`src/update/ownership-model.ts`：workflow-owned no-migration assertions。
- Canonical Flow Gate / Dev Story / Create Story references：仅接入或验证 shared legacy `story_location` compatibility。
- `src/commands/status.ts`、validate/readout 与 `src/diagnostics/output.ts` 等 presenters：消费 shared actual-root evidence；保留 public envelope 与 human/JSON parity。
- `test/artifact-path-validation.test.ts`、existing-install fixtures 与新 mismatch fixtures。
- `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md`：仅当 `config-artifact-mismatch` 需要新增 stable issue ID 时由 owner-gated 同变更更新；若复用既有 ID，kickoff 必须记录 no-new-ID reuse rationale，并在 fixtures 断言 category、stable code、details 与 redaction。
- 明确延后：Story 11.4–11.10 的具体 workflow routing/rename/inventory。

## References（参考资料）

- [Source: Epic 11 Story 11.3]
- [Source: `_bmad-output/planning-artifacts/specs/09-sdlc-workflow-lifecycle-contract.md#Existing-Install-CompatibilityExisting-Install-兼容`]
- [Source: `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md`]
- [Source: `src/validation/artifact-paths.ts`]
- [Source: `src/update/update-plan.ts`]

## Dev Agent Record（开发代理记录）

### Agent Model Used（使用模型）
GPT-5.5 (gpt-5.5)

### Debug Log References（调试日志引用）
- Kickoff Gate: `_bmad-output/implementation-artifacts/flow-gates/11-3-existing-install-compatibility-and-diagnostics-story-kickoff-gate.md` -> `PASS`，已锁定 `artifact-path.config-artifact-mismatch`、actual-path evidence schema 与 read-only/no-migration proof strategy。
- Completion Gate: `_bmad-output/implementation-artifacts/flow-gates/11-3-existing-install-compatibility-and-diagnostics-story-completion-gate.md` -> `PASS`，已验证 Contract / Functional / Evidence / Governance / Boundary anchors。
- RED: `npx vitest run test/existing-install-compatibility.test.ts test/artifact-path-validation.test.ts --reporter=dot` -> 初始 4 failures，覆盖 status fresh-default drift、旧 escape issue、update/repair no-migration 缺口。
- GREEN focused: `npx vitest run test/existing-install-compatibility.test.ts test/artifact-path-validation.test.ts --reporter=dot` -> 2 files / 13 tests passed。
- Affected: `npx vitest run test/artifact-root-resolution.test.ts test/existing-install-compatibility.test.ts test/artifact-path-validation.test.ts test/update-planning.test.ts test/fixture-release-gates.test.ts test/runtime-structure.test.ts test/install-progress-ready-summary.test.ts --reporter=dot` -> 7 files / 86 tests passed。
- Full: `npm test -- --reporter=dot` -> 62 files passed；485 passed / 4 todo。
- Build: `npm run build` -> tsup ESM/DTS build success。
- Canonical governance: warn/strict `check_canonical_source_change.mjs --project-root . --scope all --format json` -> `status=ok`, `findings=[]`, counts `core=18`, `sdlc=50`, `support=8`, `hooks=2`, `defaultInstall.total=68`。
- Canonical focused: `npm test -- test/hook-artifact-install.test.ts test/config-initialization.test.ts test/runtime-structure.test.ts test/fixture-release-gates.test.ts test/story-6-4-path-portability.test.ts test/source-and-modules.test.ts --reporter=dot` -> 6 files / 61 tests passed。
- Packaging: `npm run release:packaging-check` -> `Packaging acceptance passed: release/packaging-manifest.json and dist/packaging-manifest.json`。
- Whitespace/docs: `git diff --check` -> passed；`npm run docs:check` -> 72 Markdown files, 5 drafts, links and governance rules valid。
- CR06 Finalizer preflight: live 核验 Story 11.3 `Status: review`、sprint tracker `review`、completion gate `PASS`、唯一有效 Round 3 reviewer/evaluator 均通过、CR04 规则 `CR-API-37` / `CR-API-38` / `CR-API-39` / `CR-SEC-18`、CR05 `TODO-013` / `TODO-014` 为 `open` / P2 / Owner future。
- CR06 Finalizer: `_bmad-output/implementation-artifacts/code-reviews/11-3-code-review/11-3-cr-finalizer-20260903-main-round-3.md` -> `DONE`；Story 与 sprint tracker 同步为 `done`，Epic 11 保持 `in-progress`，Story 11.4 保持 `ready-for-dev`。

### Completion Notes List（完成说明）
- Existing status 现在优先用 existing lifecycle config resolver 生成 `paths.artifactRoots`，因此 legacy-compatible fallback / explicit roots 不会被 manifest fresh defaults 覆盖；human JSON 与 status human output 共用相同 `resolvedRoot` / `resolutionMode` evidence。
- `artifact-path.config-artifact-mismatch` 已在 `SPEC 07` 注册并由 validator 输出稳定、redacted、project-relative POSIX details：`field`、`configuredRoot`、`resolvedRoot`、`actualConsumedPath`、`resolutionMode`、`reason`。
- Update / repair planning 已把 existing configured workflow root 下的 historical artifact 识别为 workflow-owned skip；ordinary update / `update --repair --yes` 不把该 artifact 写入 `changedPaths`，fixture 断言 before/after bytes 与 hash 不变。
- Legacy `story_location` / whole-sharded discovery 以 canonical workflow contract test 证明仍可发现/消费；未实现 Story 11.5 precedence，也未执行 migration。
- CR06 finalizer 已完成：Story 11.3 从 `review` 变更为 `done`，`sprint-status.yaml` 中 `11-3-existing-install-compatibility-and-diagnostics` 从 `review` 变更为 `done`。
- `TODO-013` 与 `TODO-014` 保持 `open` / P2 / Owner future，均为 deferred non-blocking backlog；本 Story 未修复、未关闭，也不把它们描述为已实现。
- `_bmad-output/planning-artifacts/bmm-workflow-status.yaml` 当前不存在；`speclite resolve config --project-root .` 未声明额外 required workflow tracker，按 finalizer Skill 记录 skipped，未创建。
- Epic 11 保持 `in-progress`；Story 11.4 保持 `ready-for-dev`，不得在 Story 11.3 closeout 内启动。
- 本次 CR06 仅生成 finalizer record 并同步 Story/tracker；未修改产品代码、tests、SPEC、completion gate、reviewer/evaluator artifact、CR04/CR05 内容、PLAN、EXPERIMENTS 或 EXPERIMENT_NOTES；未 commit、未 push。

### File List（文件清单）
- `src/diagnostics/command-result-schema.ts`
- `src/diagnostics/output.ts`
- `src/status/installed-state.ts`
- `src/update/conflict-detector.ts`
- `src/update/ownership-model.ts`
- `src/update/update-plan.ts`
- `src/validation/artifact-paths.ts`
- `src/validation/rules/artifact-path.ts`
- `src/validation/validate-project.ts`
- `test/artifact-path-validation.test.ts`
- `test/existing-install-compatibility.test.ts`
- `test/story-6-4-path-portability.test.ts`
- `test/fixtures/path-portability/expected/command-json/validate.json`
- `_bmad-output/implementation-artifacts/stories/11-3-existing-install-compatibility-and-diagnostics.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/implementation-artifacts/flow-gates/11-3-existing-install-compatibility-and-diagnostics-story-kickoff-gate.md`
- `_bmad-output/implementation-artifacts/flow-gates/11-3-existing-install-compatibility-and-diagnostics-story-completion-gate.md`
- `_bmad-output/implementation-artifacts/code-reviews/11-3-code-review/11-3-cr-finalizer-20260903-main-round-3.md`
- `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md`

## Anchor Evidence Summary（锚点证据摘要）

- Contract anchors: `SPEC 09` existing explicit/fallback/no-migration owner 已由 Story 11.1 resolver 与 11.2 fresh projection predecessor gate 支撑；`SPEC 07` 注册 `artifact-path.config-artifact-mismatch`，无第二 issue contract。
- Functional anchors: `src/status/installed-state.ts`、`src/validation/artifact-paths.ts`、`src/validation/rules/artifact-path.ts`、`src/validation/validate-project.ts`、`src/update/*` 已接入 existing resolved roots、stable mismatch diagnostic 与 update/repair no-migration skip。
- Evidence anchors: focused suite 2 files / 13 tests passed；affected suite 7 files / 86 tests passed；full suite 62 files passed、485 passed / 4 todo；canonical warn/strict checker `status=ok` 且 `findings=[]`；packaging check 与 `git diff --check` passed。
- Boundary anchors: no migration、no Story 11.4-11.10 routing/rename/inventory；legacy `story_location` 与 whole/sharded discovery 只作为 read-only compatibility evidence。
- CR closeout anchor：唯一有效 Round 3 reviewer/evaluator 均通过；CR04 已沉淀 `CR-API-37`、`CR-API-38`、`CR-API-39`、`CR-SEC-18`；CR05 已登记 `TODO-013` / `TODO-014` 为 non-blocking P2 Owner future；CR06 只同步 Story/tracker 并生成 finalizer record。

## Change Log（变更记录）

| Date | Version | Description | Author |
| --- | --- | --- | --- |
| 2026-09-03 | 1.1 | CR06 finalizer：核验 Round 3 reviewer/evaluator、CR04、CR05 与 story-completion gate 后，将 Story 11.3 和 sprint tracker 同步为 done；`TODO-013` / `TODO-014` 保持 deferred non-blocking。 | Codex |
| 2026-09-03 | 1.0 | 完成 existing install compatibility、mismatch diagnostics、status/readout evidence 与 update/repair no-migration 实现和验证。 | Codex |
| 2026-09-03 | 0.2 | 启动 Story 11.3，补齐 kickoff gate 并注册 `artifact-path.config-artifact-mismatch` stable issue。 | Codex |
| 2026-09-02 | 0.1 | 创建 existing-install compatibility、mismatch diagnostics 与 no-migration 实施上下文。 | Fancyliu / Codex |

---
*本文档由 bmad-create-story Skill 自动生成*
