# Story 11.7: Standardize The PRD Validation Report Filename（统一 PRD Validation Report 文件名）

Status: done

## Story（故事）

作为运行 PRD validation 的产品经理和项目维护者，  
我希望 `speclite-validate-prd` 始终使用固定日期化报告文件名，  
以便 automation 与 downstream workflows 能可靠定位 validation evidence。

## Acceptance Criteria（验收标准）

1. Basename 严格为 `prd-validate-report-{yyyy-MM-dd}.md`。
2. Runtime date 使用四位年、两位月、两位日；例如 `2026-07-21`。
3. 完整默认路径为 `{planning_artifacts}/prd/prd-validate-report-{yyyy-MM-dd}.md`。
4. Canonical Skill ID 保持 `speclite-validate-prd`，不得重命名。
5. 同步 ZH/EN、workflow steps/templates、help、artifact contracts、examples、downstream discovery 与 docs。
6. Negative scan 排除 `prd-validation-report-*`、`prd-validation-*`、`validate-prd-report-*`、无日期名称与 suffix behavior 等 active defaults。
7. Legacy-name reports 原位可发现；install/update/repair 不重命名、迁移、覆盖或删除。
8. 同日 canonical target 已存在时必须 pre-write read-only block：same/different content 均不得 overwrite/append/truncate/delete/reuse/suffix，不更新 progress；输出 project-relative path、原因，以及“保留并移走或删除既有报告后重新运行”的精确人工处置建议，并使用 `SPEC 07` stable issue。
9. Fixtures 覆盖 exact basename/date/path、metadata/help parity、target absent create、target exists zero report/progress/temp/suffix write；当 legacy-name report 存在但 canonical target 不存在时，必须保留 legacy report 并创建 canonical target。
10. 不修改 validation rules、scoring、report body，也不处理 IR filename。

## Tasks / Subtasks（任务 / 子任务）

- [x] 核验 11.1–11.6 completion evidence，运行 11.7 kickoff，先注册 same-day conflict issue。
- [x] 建立 path/date/existence/progress/legacy failing tests。
- [x] 在 discovery/init 阶段解析 canonical target，并在任何 report/progress write 前检查 existence。
- [x] 更新 final report step、ZH/EN package、help/contracts/examples 与 downstream historical discovery。
- [x] 运行 same-content/different-content/legacy-only/target-absent fixtures、negative scan、build、diff check 与 completion Gate。

## Dev Notes（开发备注）

### Current Verified Baseline（当前已验证基线）

- `speclite-validate-prd/references/steps/step-v-01-discovery.md` 当前仅表示 report 与 PRD 相邻并直接创建 path；缺 exact dated contract 与 pre-write existence gate。
- `step-v-13-report-complete.md` 拥有 report finalization；本 Story不得改变 validation content/score，只消费前置锁定 path。
- `docs/reference/workflow-artifact-layout.md` 当前明确 filename 未固定，必须同步为 canonical basename。

### Technical / Architecture / Testing Requirements（技术、架构与测试要求）

- 日期由 workflow runtime 一次生成并固定到 invocation；不得在多 step 重新取时钟造成跨日路径漂移。
- Existence conflict 必须在 report template/progress metadata 写入之前发生；no suffix 是 hard contract。
- Legacy pattern 仅用于 discovery，不得与 canonical producer pattern 混为一套 output rule。
- 不新增依赖、不升级版本；使用现有 filesystem API 与 `SPEC 07` issue model。

## Dependency Gate（依赖门禁）

- Hard predecessors：11.1–11.6 `done` + completion Gates；锚定 `SPEC 07` / `SPEC 09`。
- Kickoff report：`{implementation_artifacts}/flow-gates/11-7-standardize-the-prd-validation-report-filename-story-kickoff-gate.md`。
- 不得等待 Story 11.8+ 才关闭 same-day/legacy evidence。

## Anchor Contract Map（锚点契约映射）

| Anchor | Evidence | Failure |
| --- | --- | --- |
| exact path/date | clock-controlled path tests | `FAIL_CONTRACT` |
| same-day read-only block | same/different content fixtures | `FAIL_FUNCTION` |
| legacy preservation | legacy-only coexistence tree | `FAIL_EVIDENCE` |
| corpus consistency | classified negative scan | `FAIL_EVIDENCE` |

## Equivalent Implementation Policy（等价实现策略）

- Helper 可不同；exact basename、single invocation date、target-exists block、zero progress/write、legacy preservation 与 no suffix 不可变化。

## Files To Modify（预计文件范围）

- `speclite-validate-prd/{SKILL.md,SKILL.en.md,customize.toml,references/steps/step-v-01-discovery.md,references/steps/step-v-13-report-complete.md}`。
- `module-help.csv`、artifact contracts、downstream readiness/Correct Course discovery、docs/examples。
- `SPEC 07` stable issue registry；新增 `test/prd-validation-report-path.test.ts` 或等价 fixtures。

## References（参考资料）

- [Source: Epic 11 Story 11.7]
- [Source: PRD FR23e]
- [Source: `SPEC 07` / `SPEC 09`]
- [Source: `speclite-validate-prd/references/steps/step-v-01-discovery.md`]

## Requirement Traceability（需求追踪）

- FR23e；NFR14a；NFR40f（PRD Validation filename/legacy evidence）；SPEC 07；SPEC 09。

## Dev Agent Record（开发代理记录）

### Agent Model Used（使用模型）
GPT-5.5 (gpt-5.5)

### Completion Notes List（完成说明）
- 终极上下文引擎分析已完成 —— 已创建完整开发者指南。
- Exact target已实现为`{planning_artifacts}/prd/prd-validate-report-{yyyy-MM-dd}.md`；runtime date在invocation内只生成并锁定一次。
- 新增Skill-private operation，early probe与commit-time exclusive create共同保证same/different-content existing target均以`artifact-path.prd-validation-report-exists`只读阻塞，且zero report/progress/temp/suffix mutation。
- Legacy reports保持原位可发现；target absent时创建canonical report，install/update/repair保持既有report字节、路径和类型不变。
- ZH/EN、steps、help、artifact contracts、examples、downstream historical discovery、D1 docs与`SPEC 07` stable issue registry已同步；未改变validation rules、scoring、report body、Skill ID或IR filename。
- Focused final为`7/7`通过；build、docs、packaging、canonical normal/strict、density与diff check通过。Affected/full仅因范围外drawer fixed-count drift分别有`4`/`12`项失败，completion gate为`PASS_EQUIVALENT`。
- CR06 Finalizer 于 2026-09-05 完成：latest Reviewer Round 8 为`PASS`（三层`3/3 PASS`、P1=`0`、P2=`0`），latest Evaluator Round 8 为`PASS`且Owner Gate=`NONE`；completion gate为明确隔离external drawer fixed-count drift的`PASS_EQUIVALENT`。CR04已新增`CR-API-42`、`CR-TEST-08`、`CR-TEST-09`并去重更新`CR-SEC-20`；CR05因无P2为no-op。Story与sprint tracker已同步为`done`，Epic 11保持`in-progress`，Story 11.8保持`ready-for-dev`。

### Finalization Summary（最终化摘要）
- 状态变更：Story 11.7 `review -> done`；`sprint-status.yaml`对应条目`review -> done`。
- Finalization identity：Reviewer Round 8 SHA-256=`b06d8ab301994d6bc98342b4c727440330a1200e78c7df4e73f6599b90a67304`；Evaluator Round 8 SHA-256=`86553f9f7a56ae952425685ea5cb6936b2f52bb77f3a51230d30e0d6627392ff`；completion gate SHA-256=`45f4fde3c6874eb7f41d8de5d995bb81a2bf2b7c23330d91d1439f9aad261fea`；verified HEAD=`ff7528d3f9ec34072bb669ee79f7569345c23d47`（包含当前uncommitted Story 11.1–11.7 worktree）。
- Gate evidence：focused=`10/10`、exact related=`53/53`；affected=`225 passed / 4 failed`，四项失败均为范围外`assets/source/speclite/core-skills/speclite-drawer-er-modeler/`造成的fixed-count drift，不改变Story 11.7收口结论。
- 同步边界：`bmm-workflow-status.yaml`不存在，按CR06 Skill跳过且不创建；未修改source、tests、config、docs、rules、TODO、CR summaries/evaluations、gates、PLAN、EXPERIMENTS、EXPERIMENT_NOTES、Story 11.8+或external drawer/mirrors/fixed counts，未commit、未push。

### File List（文件清单）
- `_bmad-output/implementation-artifacts/stories/11-7-standardize-the-prd-validation-report-filename.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/implementation-artifacts/flow-gates/11-7-standardize-the-prd-validation-report-filename-story-kickoff-gate.md`
- `_bmad-output/implementation-artifacts/flow-gates/11-7-standardize-the-prd-validation-report-filename-story-completion-gate.md`
- `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md`
- `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.en.md`
- `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-validate-prd/SKILL.md`
- `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-validate-prd/SKILL.en.md`
- `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-validate-prd/CHANGELOG.md`
- `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-validate-prd/customize.toml`
- `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-validate-prd/references/workflow-details.md`
- `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-validate-prd/references/steps/step-v-01-discovery.md`
- `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-validate-prd/references/steps/step-v-13-report-complete.md`
- `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-validate-prd/scripts/prd-validation-report-operation.mjs`
- `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-edit-prd/references/steps/step-e-01-discovery.md`
- `assets/source/speclite/sdlc-skills/3-solutioning/speclite-check-implementation-readiness/references/steps/step-01-document-discovery.md`
- `assets/source/speclite/sdlc-skills/4-implementation/speclite-correct-course/references/workflow-details.md`
- `assets/source/speclite/sdlc-skills/module-help.csv`
- `assets/source/speclite/docs/examples/fixture-derived-examples.md`
- `docs/reference/skills/sdlc-workflows.md`
- `docs/reference/workflow-artifact-layout.md`
- `test/prd-validation-report-path.test.ts`
- `release/packaging-manifest.json`
- `dist/packaging-manifest.json`

## Anchor Evidence Summary（锚点证据摘要）
- 待实现与 Flow Gates 填写。

## Change Log（变更记录）
| Date | Version | Description | Author |
| --- | --- | --- | --- |
| 2026-09-02 | 0.1 | 创建 PRD validation exact path、same-day block、legacy 与 evidence 上下文。 | Fancyliu / Codex |
| 2026-09-04 | 1.0 | 实现exact dated report、pre-write/commit-time block、legacy preservation、installed binding与完整验证证据。 | Fancyliu / Codex |
| 2026-09-05 | 1.1 | Round 8 Reviewer/Evaluator double-PASS；CR04规则已记录，CR05无P2为no-op，完成CR06状态收尾。 | Codex |

---
*本文档由 bmad-create-story Skill 自动生成*
