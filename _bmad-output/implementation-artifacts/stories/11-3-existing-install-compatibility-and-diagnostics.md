# Story 11.3: Existing Install Compatibility And Diagnostics（Existing Install 兼容与诊断）

Status: ready-for-dev

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

- [ ] Task 1: Predecessor 与 Kickoff Gate（AC: 1-8）
  - [ ] 核验 Story 11.1–11.2 均 `done` 且 completion Gate current、target-matched、通过。
  - [ ] 在 `story-kickoff` 中锁定 mismatch stable issue ID、actual-path evidence schema 与 read-only boundary。
- [ ] Task 2: 先建立 Existing Compatibility Matrix（AC: 1-7）
  - [ ] 覆盖 all-explicit、missing-new-fields、mixed modes、legacy story location、mismatch 与 artifact preservation。
- [ ] Task 3: 接入 Existing Root Resolution（AC: 1-2, 6）
  - [ ] 复用 Story 11.1 resolver；不得从 manifest、directory existence 或 fresh defaults 反推配置。
- [ ] Task 4: 实现 Mismatch Diagnostics 与 Discovery Evidence（AC: 4-6）
  - [ ] 在 `SPEC 07` 预注册 issue；producer 只输出 project-relative POSIX、确定性 details。
- [ ] Task 5: 收口 Update / Repair No-migration（AC: 3, 7）
  - [ ] 扩展 plan/ownership assertions，证明 workflow-owned paths 只读且不进入 changedPaths。
- [ ] Task 6: Verification（AC: 1-8）
  - [ ] 运行 focused compatibility、artifact-path、update-plan、existing-install fixtures、build 与 `git diff --check`。
  - [ ] review 前运行 `story-completion` Gate，填写实际 Anchor Evidence Summary。

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
待实现 Agent 填写。

### Completion Notes List（完成说明）
- 终极上下文引擎分析已完成 —— 已创建完整开发者指南。
- Story 尚未实现；本文件不构成 compatibility evidence。

### File List（文件清单）
- `_bmad-output/implementation-artifacts/stories/11-3-existing-install-compatibility-and-diagnostics.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

## Anchor Evidence Summary（锚点证据摘要）

- Predecessor / Contract / Functional / Evidence anchors：待实际 Gate 与 tests 填写。

## Change Log（变更记录）

| Date | Version | Description | Author |
| --- | --- | --- | --- |
| 2026-09-02 | 0.1 | 创建 existing-install compatibility、mismatch diagnostics 与 no-migration 实施上下文。 | Fancyliu / Codex |

---
*本文档由 bmad-create-story Skill 自动生成*
