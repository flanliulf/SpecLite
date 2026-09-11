# Story 11.6: Consolidate UX Artifacts Under The Planning UX Space（将 UX Artifacts 归集到 Planning UX 空间）

Status: done

## Story（故事）

作为 UX 设计人员和项目维护者，  
我希望 UX documents、visual pages 与 design-system artifacts 统一进入 `{planning_artifacts}/ux/`，  
以便 UX assets 拥有稳定边界并与 PRD、Epics、Architecture 清晰分离。

## Acceptance Criteria（验收标准）

1. Fresh install 预创建 `{planning_artifacts}/ux/`。
2. UX creation workflow 精确输出 `ux/ux-design-specification.md`、`ux/ux-color-themes.html`、`ux/ux-design-directions.html`。
3. Design-system outputs 位于 `ux/design-system/`；子目录按需创建，installer 保证父目录。
4. 所有 UX workflow-owned artifacts 留在 `ux/`，不得落到 Planning root、`docs/` 或 `{project_knowledge}`。
5. Producers/consumers、references/screenshots/assets 统一消费新 path contract。
6. 下移后 Markdown/HTML relative links、local assets、cross-document navigation 仍有效且不得逃逸 project root。
7. 同步 ZH/EN Skills、steps/references/templates、help、metadata/contracts/examples/discovery/docs，不遗留旧 active default。
8. Existing legacy UX artifacts 原位可发现，install/update/repair 不迁移、复制、重命名或删除；discovery evidence 记录 `resolvedRoot`、`resolutionMode`、`actualConsumedPath`，并与 Filesystem Space Map / Artifact Evidence Card 共用 resolver 与 diagnostic source。
9. Negative scan 排除 active producer 将新 UX artifacts 输出到 Planning root。
10. Tests 覆盖父目录、三文件、on-demand design-system、links/assets、legacy discovery 与三空间边界。
11. 只处理 UX；不处理 PRD Validation、Implementation Readiness 或 CR artifacts。

## Tasks / Subtasks（任务 / 子任务）

- [x] 核验 11.1–11.5 `done` + completion Gates，运行 11.6 kickoff。
- [x] 先建立 UX route/relative-link/legacy/negative-scan failing tests。
- [x] 更新 runtime precreate `ux/`，但保持 `design-system/` on-demand。
- [x] 更新 Create UX 全部 ZH/EN steps、resume/progress、三核心 files 与 asset/link references。
- [x] 更新 readiness/create-architecture/create-epics/correct-course/create-story consumers 与 metadata/docs。
- [x] 运行 focused fixtures、link traversal negatives、corpus scan、build、diff check 与 completion Gate。

## Dev Notes（开发备注）

### Current Verified Baseline（当前已验证基线）

- `speclite-create-ux-design/references/steps/step-01-init.md` 至 `step-14-complete.md` 当前多处直接使用 `{planning_artifacts}/ux-design-specification.md`。
- `step-09-design-directions.md` 与 `step-14-complete.md` 拥有 HTML/color outputs；只下移 root，不能改内容或 basename。
- Design-system、screenshots、assets 需要整体做 relative-link reconciliation；不得只替换主文档路径。
- UX consumers 分布于 readiness、Architecture、Epics、Correct Course、Create Story discovery。

### Technical / Architecture / Testing Requirements（技术、架构与测试要求）

- 使用 Planning resolved root；不建立 UX-local root resolver；不升级依赖、不需 web research。
- 所有 joined paths 通过 project-boundary guard；不得用 `../` 使 assets 逃出 UX/project root。
- Existing artifacts 仅作为 legacy evidence 发现，不复制到新 root。
- 测试至少验证三 exact basenames、parent-vs-on-demand directories、ZH/EN parity、relative link resolution、legacy no-migration 与 negative scan。

## Previous Story Intelligence（前序 Story 情报）

- 11.5 必须先完成 Planning subject-root governance；当前 11.1–11.5 只是规划文件，11.6 kickoff 必须 live 验证真实 evidence。

## Dependency Gate（依赖门禁）

- Hard predecessors：11.1–11.5 `done` + completion Gates；不得依赖 11.7+。
- Kickoff report：`{implementation_artifacts}/flow-gates/11-6-consolidate-ux-artifacts-under-the-planning-ux-space-story-kickoff-gate.md`。

## Anchor Contract Map（锚点契约映射）

| Anchor | Evidence | Failure |
| --- | --- | --- |
| `FR23d` exact UX paths | producer/consumer matrix | `FAIL_CONTRACT` |
| link/asset boundary | path traversal + link tests | `FAIL_FUNCTION` |
| legacy no-migration | tree/content hashes | `FAIL_EVIDENCE` |
| corpus/ZH-EN closure | negative scan + parity | `FAIL_EVIDENCE` |

## Equivalent Implementation Policy（等价实现策略）

- Workflow internal step/helper 可调整；`ux/` parent、三个 exact basenames、on-demand `design-system/`、relative-link validity、legacy no-migration 与 producer negative scan 不可改变。

## Files To Modify（预计文件范围）

- `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-ux-design/**`。
- UX consumers in readiness、create-architecture、create-epics、correct-course、create-story。
- `module.yaml`、`module-help.csv`、manifest contracts、`docs/reference/skills/sdlc-workflows.md`、`workflow-artifact-layout.md`。
- 新增 `test/ux-artifact-routing.test.ts` 或等价 focused fixture suite。

## References（参考资料）

- [Source: Epic 11 Story 11.6]
- [Source: PRD FR23d]
- [Source: UX Filesystem Space Map / Artifact Evidence Card]
- [Source: `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-ux-design/`]

## Requirement Traceability（需求追踪）

- FR23d；NFR14a；NFR40f（UX routing）；UX Filesystem Space Map；UX Artifact Evidence Card。

## Dev Agent Record（开发代理记录）

### Agent Model Used（使用模型）
GPT-5.5（fresh Development Agent）

### Implementation Plan（实现计划）
- 先验证 predecessor completion evidence 并建立 11.6 kickoff gate，再以 focused RED tests 锁定 fresh-install parent、三个 exact outputs、on-demand directory、legacy no-migration、consumer parity、link boundary 与 negative scan。
- 复用既有 Planning root resolver、diagnostic evidence 和 project-boundary guard，只调整 canonical UX workflow/consumer contract、metadata、docs 与生成态 manifest，不新增 public surface。
- 以 focused/affected/full、build、docs、packaging、canonical normal/strict 和 diff checks 收口；将并发 drawer fixed-count drift 独立披露。

### Debug Log References（调试日志引用）
- RED 初始：focused suite `2 passed / 4 failed`；补齐测试 fixture setup 后，剩余失败均对应未实现的 UX contract。
- GREEN final：focused `6/6`；affected matrix `47/47`；expanded matrix 仅有三项外部 drawer fixed-count drift。
- Full：`598 passed / 12 failed / 4 todo`；十二项失败全部是范围外 drawer 引起的 `core=18 -> 19` / `total=68 -> 69` fixed-count expectations。

### Completion Notes List（完成说明）
- 11.1–11.5 tracker 与 exact completion gates 已验证；11.6 kickoff gate 为 `PASS`，completion gate 为 `PASS_EQUIVALENT`。
- Fresh install 已由 canonical module projection 预创建 `{planning_artifacts}/ux/`，focused test 证明 `ux/design-system/` 保持 on-demand。
- Create UX ZH/EN、全部 steps、progress/resume 与三个 exact outputs 已统一；Markdown/HTML links、screenshots/assets 相对 containing UX artifact 解析并拒绝 project-root escape。
- Readiness、Architecture、Epics、IR grill、Correct Course、Create Story consumers 均采用 canonical-first、exact legacy fallback、resolver evidence 与 no-migration contract。
- Public docs、module help 与 packaging manifest 已同步；canonical normal/strict 均 `status=ok`、`findings=[]`，`git diff --check` passed。
- 未新增 public contract/stable issue，未处理 11.7+，未修改 drawer/mirrors/fixed counts/CR records/已完成 Story 历史，未 commit/push。
- CR06 Finalizer 于 2026-09-04 完成：latest Reviewer Round 5 为 `PASS`（valid layers `3/3`、`0 P0 / 0 P1 / 0 new P2`），latest Evaluator Round 5 为 `PASS` 且 Owner Gate=`NONE`；completion gate 为明确隔离 external drawer fixed-count drift 的 `PASS_EQUIVALENT`；CR04 已完成，CR05 已登记 `TODO-017`（P2/open）。Story 与 sprint tracker 已同步为 `done`，Epic 11 保持 `in-progress`，Story 11.7 保持 `ready-for-dev`。

### Finalization Summary（最终化摘要）
- 状态变更：Story 11.6 `review -> done`；`sprint-status.yaml` 对应条目 `review -> done`。
- 同步边界：`bmm-workflow-status.yaml` 不存在，按 CR06 Skill 跳过且不创建；未修改 source、tests、config、docs、rules、TODO、CR summaries/evaluations、gates、PLAN、EXPERIMENTS、EXPERIMENT_NOTES、11.7+ 或外部 drawer/mirrors/fixed counts，未 commit、未 push。

### File List（文件清单）
- `_bmad-output/implementation-artifacts/flow-gates/11-6-consolidate-ux-artifacts-under-the-planning-ux-space-story-kickoff-gate.md`
- `_bmad-output/implementation-artifacts/flow-gates/11-6-consolidate-ux-artifacts-under-the-planning-ux-space-story-completion-gate.md`
- `_bmad-output/implementation-artifacts/stories/11-6-consolidate-ux-artifacts-under-the-planning-ux-space.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-ux-design/SKILL.md`
- `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-ux-design/SKILL.en.md`
- `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-ux-design/references/workflow-details.md`
- `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-ux-design/references/steps/step-01-init.md`
- `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-ux-design/references/steps/step-01b-continue.md`
- `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-ux-design/references/steps/step-02-discovery.md`
- `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-ux-design/references/steps/step-03-core-experience.md`
- `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-ux-design/references/steps/step-04-emotional-response.md`
- `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-ux-design/references/steps/step-05-inspiration.md`
- `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-ux-design/references/steps/step-06-design-system.md`
- `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-ux-design/references/steps/step-07-defining-experience.md`
- `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-ux-design/references/steps/step-08-visual-foundation.md`
- `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-ux-design/references/steps/step-09-design-directions.md`
- `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-ux-design/references/steps/step-10-user-journeys.md`
- `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-ux-design/references/steps/step-11-component-strategy.md`
- `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-ux-design/references/steps/step-12-ux-patterns.md`
- `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-ux-design/references/steps/step-13-responsive-accessibility.md`
- `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-ux-design/references/steps/step-14-complete.md`
- `assets/source/speclite/sdlc-skills/3-solutioning/speclite-check-implementation-readiness/SKILL.md`
- `assets/source/speclite/sdlc-skills/3-solutioning/speclite-check-implementation-readiness/SKILL.en.md`
- `assets/source/speclite/sdlc-skills/3-solutioning/speclite-check-implementation-readiness/references/steps/step-01-document-discovery.md`
- `assets/source/speclite/sdlc-skills/3-solutioning/speclite-check-implementation-readiness/references/steps/step-04-ux-alignment.md`
- `assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-architecture/SKILL.md`
- `assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-architecture/SKILL.en.md`
- `assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-architecture/references/activation-en.md`
- `assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-architecture/references/inputs-outputs.md`
- `assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-architecture/references/steps/step-01-init.md`
- `assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-architecture/references/workflow-steps.md`
- `assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-epics-and-stories/SKILL.md`
- `assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-epics-and-stories/SKILL.en.md`
- `assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-epics-and-stories/references/workflow-steps.md`
- `assets/source/speclite/sdlc-skills/3-solutioning/speclite-ir-grill-consistency-reviewer/SKILL.md`
- `assets/source/speclite/sdlc-skills/3-solutioning/speclite-ir-grill-consistency-reviewer/SKILL.en.md`
- `assets/source/speclite/sdlc-skills/3-solutioning/speclite-ir-grill-consistency-reviewer/references/workflow.md`
- `assets/source/speclite/sdlc-skills/4-implementation/speclite-correct-course/SKILL.md`
- `assets/source/speclite/sdlc-skills/4-implementation/speclite-correct-course/SKILL.en.md`
- `assets/source/speclite/sdlc-skills/4-implementation/speclite-correct-course/references/workflow-details.md`
- `assets/source/speclite/sdlc-skills/4-implementation/speclite-create-story/SKILL.md`
- `assets/source/speclite/sdlc-skills/4-implementation/speclite-create-story/SKILL.en.md`
- `assets/source/speclite/sdlc-skills/4-implementation/speclite-create-story/references/discover-inputs.md`
- `assets/source/speclite/sdlc-skills/4-implementation/speclite-create-story/references/workflow-details.md`
- `assets/source/speclite/sdlc-skills/module-help.csv`
- `docs/reference/skills/sdlc-workflows.md`
- `docs/reference/workflow-artifact-layout.md`
- `release/packaging-manifest.json`
- `test/ux-artifact-routing.test.ts`

## Anchor Evidence Summary（锚点证据摘要）
- 待实现与 Flow Gates 填写。

## Change Log（变更记录）
| Date | Version | Description | Author |
| --- | --- | --- | --- |
| 2026-09-02 | 0.1 | 创建 UX root、relative assets、legacy discovery 与 corpus closure 上下文。 | Fancyliu / Codex |
| 2026-09-04 | 1.0 | 完成 UX artifact consolidation、consumer discovery、link boundary、legacy evidence、tests 与 completion gate。 | GPT-5.5 |
| 2026-09-04 | 1.1 | Round 5 Reviewer/Evaluator double-PASS；CR04 完成且 CR05 `TODO-017` 已登记，完成 CR06 状态收尾。 | Codex |

---
*本文档由 bmad-create-story Skill 自动生成*
