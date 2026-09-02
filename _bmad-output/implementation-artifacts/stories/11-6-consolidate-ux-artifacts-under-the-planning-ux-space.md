# Story 11.6: Consolidate UX Artifacts Under The Planning UX Space（将 UX Artifacts 归集到 Planning UX 空间）

Status: ready-for-dev

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

- [ ] 核验 11.1–11.5 `done` + completion Gates，运行 11.6 kickoff。
- [ ] 先建立 UX route/relative-link/legacy/negative-scan failing tests。
- [ ] 更新 runtime precreate `ux/`，但保持 `design-system/` on-demand。
- [ ] 更新 Create UX 全部 ZH/EN steps、resume/progress、三核心 files 与 asset/link references。
- [ ] 更新 readiness/create-architecture/create-epics/correct-course/create-story consumers 与 metadata/docs。
- [ ] 运行 focused fixtures、link traversal negatives、corpus scan、build、diff check 与 completion Gate。

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
待实现 Agent 填写。

### Completion Notes List（完成说明）
- 终极上下文引擎分析已完成 —— 已创建完整开发者指南。
- Story 尚未实现；path/link/evidence 均为 planned requirements。

### File List（文件清单）
- `_bmad-output/implementation-artifacts/stories/11-6-consolidate-ux-artifacts-under-the-planning-ux-space.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

## Anchor Evidence Summary（锚点证据摘要）
- 待实现与 Flow Gates 填写。

## Change Log（变更记录）
| Date | Version | Description | Author |
| --- | --- | --- | --- |
| 2026-09-02 | 0.1 | 创建 UX root、relative assets、legacy discovery 与 corpus closure 上下文。 | Fancyliu / Codex |

---
*本文档由 bmad-create-story Skill 自动生成*
