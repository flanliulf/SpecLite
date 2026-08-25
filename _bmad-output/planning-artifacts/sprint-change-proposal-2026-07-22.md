---
workflow: bmad-correct-course
project: SpecLite
date: 2026-07-22
mode: incremental
status: approved
changeRequest: phase-aligned-artifact-topology-compatible-evolution
selectedApproach: direct-adjustment
---

# Sprint Change Proposal（Sprint 变更提案）

## Executive Summary（执行摘要）

Epic 11 已覆盖方案 A（兼容演进版）的八项功能，但新增 artifact topology 尚未完整进入 PRD、Architecture、UX 与 owning SPEC。历史 requirements coverage、Epic index、Story 状态和逐 Story traceability 也存在规划漂移，因此 Epic 11 当前不能视为 implementation-ready。

本提案采用 Direct Adjustment（直接调整）：不新增 Epic、不新增 Story、不回滚或重新实施 Epic 1–10；在进入 Epic 11 开发前，修复规划真源和契约一致性，修改 Story 11.1、Story 11.6 与 Epic 11 completion gate，然后重新执行 implementation readiness。

## Trigger And Evidence（触发原因与证据）

触发项是 Epic 11 规划门禁终检，主要触发 Story 11.1，并级联影响 Story 11.2–11.8。

已确认的关键证据：

- Architecture 仍将 `docs/` 描述为 project knowledge。
- `SPEC 09` 只拥有 `planning_artifacts`、`implementation_artifacts`、`project_knowledge` 三类 roots，缺少 Brainstorming、Analysis、Solutioning 和 DevOps roots。
- Epic 11 新增的 FR/NFR 已进入 requirements inventory，但尚未完整进入权威 PRD FR/NFR 文件。
- FR coverage map 漏映射 `FR17a`、`FR47a`、`FR63b`、`FR65a`。
- Epics index 缺少 Story 1.7、6.6–6.8、7.5、8.9，且 Epic 7 Story 7.1 的名称和链接错误。
- Epic 8 文档仍把 Story 8.9 标为 `ready-for-dev`，live tracker 已为 `done`。
- Epic 9/10 的 planning Story 只有摘要，但已有完整且完成的 implementation Story artifacts。
- Epic 1–10 缺少显式逐 Story Requirement Traceability。

## Product Decision（产品决策）

采用方案 A（兼容演进版）：

- Fresh install 使用阶段对齐的新 fields、新默认 paths 和目录结构。
- Existing install 的显式配置继续权威。
- 缺少新增 fields 时使用已定义的 legacy fallback。
- 普通 install、update 和 `update --repair` 不得移动、复制、重命名、删除或重写 workflow-owned artifacts。
- Explicit artifact migration 保留为未来独立能力，不并入 Epic 11。
- `docs/` 是 Primary Public Document。
- `_speclite-output/project-knowledge-base/` 是 workflow-generated project knowledge 默认位置。
- Domain、market、technical research 属于 `1-analysis-artifacts/research/` 的 producers，不是 project knowledge producers。

## Epic And Story Decision（Epic 与 Story 决策）

- 不新增 Epic。
- 不新增 Story。
- 修改 Story 11.1，补充 contract ownership、dependency gate 和 anchor map。
- 修改 Story 11.6，将旧 Skill ID 兼容绑定到 `SPEC 04` 的正式 rename mapping。
- 修改 Epic 11，增加 strict-serial sequencing 和 completion gate。
- Story 11.2–11.5、11.7–11.8 的功能范围保持不变。
- Epic 1–10 的已完成状态保持不变；规划修复不构成重新实施。

## Approved Edit Inventory（已批准修改清单）

### PRD（产品需求文档）

1. 在 Functional Requirements 中增加 `FR13a`，定义六个阶段 roots、`project-knowledge-base/` 与 `docs/` 定位。
2. 增加 `FR23b`，将 research、product brief、PRFAQ 路由到 Analysis 子目录，并排除 project knowledge producer 身份。
3. 增加 `FR23c`，定义 PRD、Epics、Architecture whole/sharded subject directories 和确定性发现。
4. 增加 `FR23d`，定义 Planning UX root 与按需创建的 `design-system/`。
5. 增加 `FR23e`，固定 PRD validation report basename、目录和历史兼容边界。
6. 增加 `FR23f`，定义 Implementation Readiness Skill rename、Solutioning 路由和旧 ID 兼容。
7. 增加 `FR23g`，定义 Story-ID-only CR artifact root 与 legacy recovery 边界。
8. 增加 `FR66a`，定义完整、可复查、只读的 grill reference inventory。
9. 增加 `NFR14a`，定义 fresh/existing compatible evolution 与 no-silent-migration。
10. 增加 `NFR40f`，定义 fresh-install、existing-install-update 和 config/artifact mismatch fixtures，并更新 Measurement Matrix。
11. 更新 Developer Tool Specific Requirements 的 artifact repository 语义。
12. 更新 MVP scope，使阶段 roots 与 public docs 边界成为交付范围。
13. 更新 Success Criteria，使新 topology、legacy fallback 和 non-migration 成为成功条件。

### Architecture And Owning Specs（架构与契约）

14. 将 Architecture requirements counts 更新为 106 FR entries 与 101 NFR entries，并增加 Phase-Aligned Artifact Governance 能力域。
15. 修复 Project Context 中 `docs/`、project knowledge 和 Analysis producer 的空间边界。
16. 更新 Core Runtime Boundary，区分 metadata、execution、phase artifact、project knowledge 和 public docs planes。
17. 扩展 `SPEC 09`，拥有七类 runtime fields/placeholders、fresh defaults、legacy fallback 和 `docs/`/project knowledge 语义；其中包含 `solutioning_artifacts`。
18. 扩展 `SPEC 04`，增加 optional `renamedFromCanonicalSkillIds`，保持唯一 active canonical identity。
19. 更新 Architecture Implementation Patterns，对 artifact lifecycle 和 Skill rename 分别引用 `SPEC 09` 与 `SPEC 04`。
20. 修复 Project Structure Data Boundaries 中 `docs/: project knowledge` 的直接冲突。
21. 更新 install data flow，要求 canonical metadata 驱动 directories，manifest 投影 roots，existing update 不迁移 artifacts。
22. 将 Architecture validation 状态改为 Revalidation Required，移除过期的“无 critical gap / ready”结论。
23. 更新 `SPEC 03` runtime config 示例，生成 `0-` 至 `5-` roots 与 `project-knowledge-base/`。

### UX（用户体验）

24. 将 filesystem mental model 更新为五个明确空间。
25. 扩展 Filesystem Space Map，增加 phase/root、legacy fallback 和 config-artifact-mismatch。
26. 扩展 Artifact Evidence Card，记录 phase、resolved root、actual consumed path 和 whole/sharded ambiguity。
27. 将 workflow artifact journey 改为 phase-aware routing，并区分 public docs。
28. Ready Summary 使用完整 Filesystem Space Map；existing install 显示实际 roots 和 `legacy-compatible`。

### Epics And Traceability（Epic 与追踪）

29. 补齐 `FR17a`、`FR47a`、`FR63b`、`FR65a` 的 Epic 1 coverage。
30. 修复 Epics index 中 Story 1.7、6.6–6.8、7.1、7.5、8.9 的缺失或错误映射。
31. 将 Epic 8 Story 8.9 文案同步为 `done`。
32. 从已完成 implementation Story artifacts 回填 Epic 9 Story 9.1–9.3 的 user story、AC 和 traceability，不复制执行记录。
33. 从已完成 implementation Story artifacts 回填 Epic 10 Story 10.1–10.6 的 user story、AC 和 traceability，不复制执行记录。
34. 为 Story 11.1 增加 Dependency Gate、Anchor Contract Map 和 single-owning-contract AC。
35. 为 Story 11.6 增加 `renamedFromCanonicalSkillIds`、Solutioning dependency 和 no-alias compatibility AC。
36. 为 Epic 11 增加 Story 11.1 → 11.8 strict-serial sequencing、指定 runner 和 completion gate。
37. 更新 Cross-Epic SDLC Workflow Contract，使其引用完整 roots 和正式 rename mapping。
38. 更新 Epic 1 coverage list，包含四项 install interaction extensions。
39. 为 Epic 1–8 的每个 Story 增加基于现有 AC 的 Requirement Traceability；不修改范围或状态。

## Path Forward（前进路径）

已评估的路径：

- Direct Adjustment：可行，Effort Medium，Risk Low。
- Rollback：不可行，Effort High，Risk High；不能解决规划真源不一致。
- PRD MVP Redefinition：不必要；原 MVP 和产品目标仍可实现。

推荐并已逐项确认 Direct Adjustment。

## Execution Plan（执行计划）

1. 最终批准本 Sprint Change Proposal。
2. 使用 `bmad-edit-prd` 执行已批准的 PRD 修改。
3. 由 Architect 角色执行 Architecture、`SPEC 03`、`SPEC 04`、`SPEC 09` 修改。
4. 由 UX Designer 角色执行 UX 修改。
5. 使用 `bmad-create-epics-and-stories` 执行 Epic/Story、coverage、index 和 traceability 修改。
6. 运行文档链接、requirements coverage、traceability 和 `git diff --check` 验证。
7. 使用 `bmad-check-implementation-readiness` 重新执行门禁。
8. Gate 通过后，将 Epic 11 加入 sprint tracking。
9. 使用 `goal-orchestrator-epic-story-code-review-runner`，按 Story 11.1 → 11.8 strict serial 执行 dev-story、CR、fix 和 closeout。

## Handoff Responsibilities（交接责任）

- Product Manager：PRD、Epic/Story、coverage、traceability 与 proposal consistency。
- Architect：runtime boundaries、artifact root ownership、install/manifest contracts 与 rename mapping。
- UX Designer：Filesystem Space Map、Artifact Evidence Card、Ready Summary 和 workflow journey。
- Readiness Agent：重新验证 PRD、Architecture、UX、Epics 与 Story dependencies。
- Epic Runner：strict serial 实施 Story 11.1–11.8；从 dev-story 到 code review 使用 fresh sub-agents。
- 用户：对 Story 11.8 grill inventory 的高风险/歧义项作最终人工确认。

## Safety And Scope Boundaries（安全与范围边界）

- 本提案不授权自动 artifact migration。
- 本提案不授权修改 Epic 1–10 已完成代码。
- 本提案不授权 Story 11.8 修改被盘点的 canonical Skill definitions。
- 本提案不包含、覆盖或格式化用户现有 `README.md` 改动。
- Source document edits 必须在本提案最终批准后，按对应 BMad Skill 逐类执行。

## Approval（批准）

- Direction approval: approved
- Incremental edit proposals 1–39: approved
- Final proposal approval: approved on 2026-07-22
