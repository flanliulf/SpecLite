---
schemaVersion: "speclite.flow-gate-report.v2"
mode: "story-kickoff"
target: "11-5-govern-planning-and-solutioning-documents-as-whole-and-sharded-artifacts"
storyKey: "11-5-govern-planning-and-solutioning-documents-as-whole-and-sharded-artifacts"
result: "PASS"
generatedAt: "2026-09-04T05:31:00.000Z"
handoffContractVersion: "speclite.story-kickoff-handoff.v1"
foundationPrerequisiteStatus: "PASS"
foundationPrerequisiteRefs: "_bmad-output/implementation-artifacts/flow-gates/11-1-executable-artifact-root-resolution-contract-story-completion-gate.md result=PASS; _bmad-output/implementation-artifacts/flow-gates/11-2-fresh-install-artifact-root-projection-story-completion-gate.md result=PASS; _bmad-output/implementation-artifacts/flow-gates/11-3-existing-install-compatibility-and-diagnostics-story-completion-gate.md result=PASS; _bmad-output/implementation-artifacts/flow-gates/11-4-route-analysis-workflows-into-dedicated-artifact-subdirectories-story-completion-gate.md result=PASS"
closureOwnerCheckStatus: "PASS"
closureOwnerRefs: "_bmad-output/planning-artifacts/specs/09-sdlc-workflow-lifecycle-contract.md, _bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md, _bmad-output/implementation-artifacts/stories/11-5-govern-planning-and-solutioning-documents-as-whole-and-sharded-artifacts.md"
sourceSkill: "speclite-flow-gate"
---

# Flow Gate Report: 11-5-govern-planning-and-solutioning-documents-as-whole-and-sharded-artifacts

## Summary（摘要）

- Mode: `story-kickoff`
- Target: `11-5-govern-planning-and-solutioning-documents-as-whole-and-sharded-artifacts`
- Date: `2026-09-04`
- Result: `DECISION_NEEDED`
- Model Used: `GPT-5.5 (strict-serial fresh development step)`

## Foundation Evidence（前置证据）

- PASS: `sprint-status.yaml` 当前记录 Story 11.1、11.2、11.3、11.4 为 `done`，Story 11.5 为 `ready-for-dev`。
- PASS: Story 11.1 completion gate frontmatter 为 `mode: story-completion`、target/storyKey 精确匹配 `11-1-executable-artifact-root-resolution-contract`、`result: PASS`。
- PASS: Story 11.2 completion gate frontmatter 为 `mode: story-completion`、target/storyKey 精确匹配 `11-2-fresh-install-artifact-root-projection`、`result: PASS`。
- PASS: Story 11.3 completion gate frontmatter 为 `mode: story-completion`、target/storyKey 精确匹配 `11-3-existing-install-compatibility-and-diagnostics`、`result: PASS`。
- PASS: Story 11.4 completion gate frontmatter 为 `mode: story-completion`、target/storyKey 精确匹配 `11-4-route-analysis-workflows-into-dedicated-artifact-subdirectories`、`result: PASS`。
- PASS: `CC-2026-08-17-architecture-root` / FR23c current planning evidence keeps PRD and Epics under `{planning_artifacts}/prd/` and `{planning_artifacts}/epics/`, and Architecture under `{solutioning_artifacts}/architecture/` for fresh canonical topology, with existing-install fallback/no-migration owned by `SPEC 09`.

## Owner Gate Finding（Owner Gate 发现）

- DECISION_NEEDED: `SPEC 09` currently owns runtime artifact roots, phase-owned PRD/Epics/UX/Architecture subject directories, existing explicit root authority, `legacy-compatible` fallback, no-migration semantics, Flow Gate lifecycle, and required root evidence fields such as `resolvedRoot` and `resolutionMode`.
- DECISION_NEEDED: Live `SPEC 09` only states that whole/sharded producers and consumers must use deterministic discovery rules and record actual consumed path. It does not currently carry Story 11.5's complete AC5 decision table for `whole-only`, valid `sharded-only`, `whole+sharded` ambiguity, explicit selection, invalid sharded shape, broken shard reference, or subject document missing.
- DECISION_NEEDED: Live `SPEC 09` does not yet define the full required evidence model for Story 11.5 discovery: `resolvedRoot`, `resolutionMode`, `actualConsumedPath`, `discoveryShape`, `ambiguityStatus`, and selection source as a single owning contract.
- DECISION_NEEDED: Live `SPEC 07` currently reserves generic `artifact-path` ids including `artifact-path.config-artifact-mismatch`, `artifact-path.missing-required-artifact`, `artifact-path.missing-required-metadata`, and `artifact-path.invalid-required-metadata`; it does not yet provide an explicit stable issue mapping for Story 11.5 blocking discovery states such as ambiguous whole/sharded input, invalid sharded shape, broken shard reference, and subject document missing.

## Halted Scope（已停止范围）

- No producer, consumer, runtime, fixture, test, docs, Story status, sprint tracker, CR log, external drawer, `.agents` mirror, `.claude` mirror, commit, or push changes were performed.
- This report is only a kickoff/decision evidence artifact. It does not mark Story 11.5 `in-progress` and does not authorize implementation.

## Recommended Owner Decision（推荐 Owner 决策）

Adopt Story 11.5 AC5 as a same-change `SPEC 09` contract update before implementation:

| Discovery State | Canonical Behavior | Continuation |
| --- | --- | --- |
| `whole-only` | Consume only the canonical whole document in the subject directory. | Continue |
| valid `sharded-only` | Consume only `index.md` and its explicitly declared shards. | Continue |
| `whole+sharded` with no explicit selection | Select nothing and mix nothing; report ambiguity and request human selection. | Block |
| `whole+sharded` with invocation-scoped explicit selection | Consume only the selected whole document or sharded index and record the unselected version. | Continue |
| shards exist but `index.md` is missing | Report invalid sharded shape. | Block |
| index references a missing, outside-subject-directory, or unreadable shard | Report broken shard reference. | Block |
| neither whole nor valid sharded input exists | Report subject document missing. | Block |

Recommended same-change stable issue mapping:

| Blocking State | Recommended Stable Issue ID | Rationale |
| --- | --- | --- |
| `whole+sharded` without explicit selection | `artifact-path.ambiguous-subject-document-shape` | Existing `config-artifact-mismatch` is config-vs-actual divergence, not shape ambiguity. |
| shards exist but `index.md` is missing | `artifact-path.invalid-sharded-document-shape` | Existing `invalid-required-metadata` is too generic for discovery continuation. |
| index references missing/outside/unreadable shard | `artifact-path.broken-shard-reference` | Needs a stable id for deterministic zero-write block fixtures. |
| whole and valid sharded input both absent | `artifact-path.subject-document-missing` | More specific than generic `missing-required-artifact` for cross-consumer parity. |

If the Owner chooses not to update `SPEC 09`, the Owner must provide an explicit no-contract-update rationale and name the alternative owning artifact that carries the same decision table, evidence fields, continuation behavior, and stable issue mapping before Story 11.5 implementation can proceed.

## Recommended Next Action（推荐下一步）

Stop `bmad-dev-story` for Story 11.5 here. Request Owner approval for the same-change `SPEC 09` contract update and `SPEC 07` stable issue registration above, or provide an explicit alternative owner decision. Resume Story 11.5 implementation only after a fresh kickoff gate can return `PASS` or `PASS_EQUIVALENT`.

## Controlled Correction 2026-09-04（受控修正 2026-09-04）

- PASS: Owner 明确回复 `确认 11.5 推荐方案`，批准将 Story 11.5 AC5 的完整 decision table、blocking continuation 与 evidence model作为同变更 `SPEC 09` contract update。
- PASS: Owner 同时批准在 `SPEC 07` 注册 `artifact-path.ambiguous-subject-document-shape`、`artifact-path.invalid-sharded-document-shape`、`artifact-path.broken-shard-reference` 与 `artifact-path.subject-document-missing`。
- PASS: Story 11.1–11.4 的 predecessor completion gates 与 tracker `done` 状态保持有效；11.5 的 strict-serial foundation prerequisite 未发生退化。
- PASS: 当前授权边界只覆盖 PRD、Epics、Architecture 的 phase-owned whole/sharded contract、shared resolver、producer/consumer guidance、docs、fixtures/tests与 completion evidence；不覆盖 migration、UX、validation-report filename、readiness rename、CR directory normalization、grill inventory、external drawer、IDE mirror、commit 或 push。
- CURRENT RESULT: `PASS`。原始 `DECISION_NEEDED` finding、推荐表与停止理由保留在上文作为 decision trace；本节是关闭 Owner gate 的 superseding current evidence，不删除或伪造原始历史。

---

*本文档由 speclite-flow-gate Skill kickoff preflight 生成*
