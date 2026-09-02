# Story 11.8: Rename And Relocate Implementation Readiness Skills（更名并迁移 Implementation Readiness Skills）

Status: ready-for-dev

## Story（故事）

作为执行 Implementation Readiness 的项目维护者，  
我希望相关 Skills 使用统一语义名称并写入固定 Solutioning 目录，  
以便 discovery、orchestration 与 readiness evidence 定位一致。

## Acceptance Criteria（验收标准）

1. Exact rename：`speclite-ir-grill-consistency-reviewer` → `speclite-implementation-readiness-grill-consistency-reviewer`；`speclite-check-implementation-readiness` → `speclite-implementation-readiness-check`。
2. Fresh install 仅投影新 IDs；package/frontmatter/help/registry/activation 一致，不生成旧 alias package/help/phase row。
3. 两个 Skills 默认输出 `{solutioning_artifacts}/implementation-readiness-report/grill-consistency/`。
4. Readiness check basename 保持 `implementation-readiness-report-{yyyy-MM-dd}.md`。
5. Grill reviewer 保持其既有 report naming；不得顺带重命名。
6. Bounded surfaces 必须全量同步：packages/ZH-EN/self refs、metadata/help/registry/manifest/contracts、direct activation/customization/orchestration、active docs/examples/hooks/scripts/tests、两个 old IDs 与 old `ir-grill/` exact paths；每个 match 新值或明确 compatibility/legacy/fixture 分类。
7. Canonical metadata 提供 `renamedFromCanonicalSkillIds`；old ID activation redirect 或 stable deprecation；update plan 显式展示 rename/reprojection；modified old package 不得覆盖/删除。
8. Legacy readiness artifacts 原位可发现，不迁移、重命名或删除。
9. Exact-old-ID/path scan 独立关闭本 Story；active identity/producer/consumer 等不得残留，不得依赖 11.10 broad inventory。
10. Tests 覆盖 fresh-only-new、identity parity、两 routes、basenames、compat/deprecation、update rename、modified-old protection、legacy discovery，并附 bounded surface manifest 与 classified scan。
11. 不改 IR algorithm/scoring/body，不处理两个 old IDs/old path 以外的 generic grill semantics；后者仅属 11.10。

## Tasks / Subtasks（任务 / 子任务）

- [ ] 核验 11.1–11.7 completion Gates，运行 11.8 kickoff并冻结 bounded surface manifest。
- [ ] 先建立 identity/routing/rename/update/drift/legacy failing tests。
- [ ] Rename 两 package directories/frontmatter/self refs，更新 metadata/help/registry/activation 与 exact direct callers。
- [ ] 实现 `renamedFromCanonicalSkillIds` projection、activation/deprecation 与 update rename plan；保护 drifted old package。
- [ ] 将两个 outputs 路由到 Solutioning fixed root，分别保持 basenames；保留 legacy artifacts。
- [ ] 执行 exact-old-ID/path scan，对每个 match 分类；运行 focused suites、build、diff check 与独立 completion Gate。

## Dev Notes（开发备注）

### Current Verified Baseline（当前已验证基线）

- 两个 old package directories 仍存在于 `assets/source/speclite/sdlc-skills/3-solutioning/`，其 ZH/EN/frontmatter/self references 均需原子同步。
- Old IDs 还出现在 source README、module-help、PM/Architect customization、PRD completion、docs、manifest validation 与 fresh-install snapshots。
- `SPEC 04` 已定义 `renamedFromCanonicalSkillIds`，但 executable manifest/module/update schema 尚未形成完整消费链。
- readiness check final assessment 当前仍把 report 写到 Planning root；两个 package 必须消费 `{solutioning_artifacts}`。

### Technical / Architecture / Testing Requirements（技术、架构与测试要求）

- Package directory 与 frontmatter name 必须一致；fresh indexes 只含新 ID，old ID 仅存在于 typed compatibility mapping/legacy fixtures。
- Rename plan 必须遵循 ownership/hash/plan-before-write；drifted old package 是 conflict/protected，不得删除。
- Exact scan 与 broad grill scan 分离：本 Story 只扫描两个 literals + old path，11.10 才做 generic semantic inventory。
- 无 dependency upgrade、无新外部 API；回归 current module discovery、manifest schema、update plan、IDE mirrors。
- Current `SPEC 07` 尚未为 old-ID deprecation / modified-old-package rename conflict 固定 issue ID。Kickoff 必须决定复用的 reserved ID，或先注册新 ID，并锁定 category、severity、details 与 redaction；未关闭时为 `DECISION_NEEDED`，producer 不得临场发明。

## Dependency Gate（依赖门禁）

- Hard predecessors：11.1–11.7 `done` + completion Gates；锚定 `SPEC 04`、`SPEC 07`、`SPEC 09`。
- Kickoff report：`{implementation_artifacts}/flow-gates/11-8-rename-and-relocate-implementation-readiness-skills-story-kickoff-gate.md`。
- 必须独立完成；不得依赖 11.9/11.10 或人工确认。
- Old-ID deprecation 与 modified-old-package conflict 的 stable diagnostic contract 未关闭时，Kickoff 必须返回 `DECISION_NEEDED`。

## Anchor Contract Map（锚点契约映射）

| Anchor | Evidence | Failure |
| --- | --- | --- |
| exact new identities + mapping | package/index/manifest reconciliation | `FAIL_CONTRACT` |
| Solutioning routing + basenames | two producer fixtures | `FAIL_FUNCTION` |
| update/drift/legacy behavior | update plan + preservation hashes | `FAIL_EVIDENCE` |
| bounded closure | surface manifest + exact scan 100% classification | `FAIL_EVIDENCE` |

## Equivalent Implementation Policy（等价实现策略）

- Registry/planner internals 可调整；唯一 active IDs、rename mapping、fresh-only-new projection、new root、legacy no-migration、modified-old protection 与独立 exact-scan gate 不可改变。

## Files To Modify（预计文件范围）

- Rename 两个 canonical package directories 及内部 `SKILL.md`、`SKILL.en.md`、customize、references/assets。
- `module.yaml`、`module-help.csv`、`src/modules/module-metadata.ts`、`src/manifest/manifest-schema.ts`、`src/manifest/manifest-generator.ts`、`src/validation/rules/manifest-schema.ts`、`src/update/update-plan.ts`；保留 schema compatibility、ownership/hash conflict 与 plan-before-write。
- 已知 bounded exact-match surfaces：source `README.md` / `README.en.md`、PM/Architect `customize.toml`、Create PRD `step-12-complete.md`、readiness check `step-01` 至 `step-06`、active docs、manifest/validate tests 与 fresh-install tree/index snapshots。Kickoff 必须刷新 exact scan，并逐项记录 update 或 compatibility/legacy/fixture classification。
- 新增 `test/implementation-readiness-rename-routing.test.ts` 与 surface-manifest/classification fixture。

## References（参考资料）

- [Source: Epic 11 Story 11.8]
- [Source: PRD FR23f]
- [Source: `SPEC 04` rename identity]
- [Source: `SPEC 09` Solutioning artifact routing]

## Dev Agent Record（开发代理记录）

### Agent Model Used（使用模型）
待实现 Agent 填写。

### Completion Notes List（完成说明）
- 终极上下文引擎分析已完成 —— 已创建完整开发者指南。
- Story 尚未实现；new IDs/path 不得被描述为 current runtime state。

### File List（文件清单）
- `_bmad-output/implementation-artifacts/stories/11-8-rename-and-relocate-implementation-readiness-skills.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

## Anchor Evidence Summary（锚点证据摘要）
- Bounded manifest / exact scan / tests / gates：待实际执行填写。

## Change Log（变更记录）
| Date | Version | Description | Author |
| --- | --- | --- | --- |
| 2026-09-02 | 0.1 | 创建 IR Skill rename、Solutioning routing、compatibility 与独立 evidence 上下文。 | Fancyliu / Codex |

---
*本文档由 bmad-create-story Skill 自动生成*
