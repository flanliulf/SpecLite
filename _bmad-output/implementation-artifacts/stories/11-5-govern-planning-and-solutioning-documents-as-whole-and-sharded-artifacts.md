# Story 11.5: Govern Planning And Solutioning Documents As Whole And Sharded Artifacts（治理 Planning 与 Solutioning 文档的整篇与分片产物）

Status: done

## Story（故事）

作为产品、架构和项目维护人员，  
我希望 PRD、Epics、Architecture 进入各自 phase-owned subject directory，  
以便确定性创建、发现和消费 whole/sharded documents，同时避免双真源或静默迁移。

## Acceptance Criteria（验收标准）

1. Fresh install 创建 `{planning_artifacts}/prd/`、`{planning_artifacts}/epics/`、`{solutioning_artifacts}/architecture/`。
2. Whole producers 精确输出 `prd/prd.md`、`epics/epics.md`、`architecture/architecture.md`。
3. Shards 保持在对应 subject directory，保留 `index.md` 与命名，不增加 `shards/`；whole/sharded 可共存但不得自动择一。
4. Consumers 从 phase-owned roots 支持 whole 与 sharded shapes。
5. Whole/sharded discovery 必须使用以下唯一 decision table，consumer 不得自行定义 precedence：

   | Discovery State | Canonical Behavior | Continuation |
   | --- | --- | --- |
   | `whole-only` | 只消费 subject directory 中的 canonical whole document | Continue |
   | valid `sharded-only` | 只消费 `index.md` 及其明确声明的 shards | Continue |
   | `whole+sharded` 且无显式 selection | 不选择、不混合；报告 ambiguity 并请求人工选择 | Block |
   | `whole+sharded` 且当前 invocation 有显式 selection | 只消费所选 whole 或 sharded index，并记录未选版本 | Continue |
   | shards 存在但缺 `index.md` | 报告 invalid sharded shape | Block |
   | index 引用缺失、越出 subject directory 或不可读 shard | 报告 broken shard reference | Block |
   | whole 与有效 sharded input 均不存在 | 报告 subject document missing | Block |

   每次记录 `resolvedRoot`、`resolutionMode`、`actualConsumedPath`、`discoveryShape`、`ambiguityStatus`、selection source；selection 只作用于当前 invocation；block 使用 `SPEC 07` stable IDs 且零 write/progress mutation。
   该 decision table 在 implementation 前必须由 `SPEC 09` owner decision 承载或明确批准为同变更 contract update；在 owner gate 关闭前，本表仅是 Story implementation target，不得宣称 owning SPEC 已更新。
6. Existing explicit root 权威；缺 `solutioning_artifacts` 按 `SPEC 09` fallback 到 Planning 并标 `legacy-compatible`。
7. Mismatch/legacy path 只诊断，不迁移、不宣称 migration。
8. 同步 producers/consumers、ZH/EN、steps/references、help、metadata/contracts/examples/docs，不建立第二 root contract。
9. Negative scan 排除 active fresh Architecture→Planning 与 fresh PRD/Epics→Planning root；历史表达必须分类。
10. Fixtures 覆盖全部 discovery states、selection、fallback、mismatch、no-migration、POSIX、stable issues 与 zero mutation。
11. 只处理 PRD/Epics/Architecture；UX、validation/readiness/CR 属后续；不得重开 completed Story 或改历史完成记录。

## Tasks / Subtasks（任务 / 子任务）

- [x] Task 1: 核验 11.1–11.4 evidence，运行 11.5 kickoff，预注册 discovery issues。
- [x] Task 2: 实现单一 discovery resolver/decision table 与 evidence model。
- [x] Task 3: 更新 PRD、Epics、Architecture whole producers 与 shard-doc 同目录 contract。
- [x] Task 4: 更新 downstream consumers，提供 invocation-scoped explicit selection；block 前零写入/零 progress mutation。
- [x] Task 5: 建立 fresh/existing/whole/sharded/ambiguity/broken/missing fixture matrix。
- [x] Task 6: 执行 canonical corpus negative scan、focused suites、build、`git diff --check` 与 completion Gate。

## Dev Notes（开发备注）

### Current Verified Baseline（当前已验证基线）

- Active Epic corpus 本身位于 `planning-artifacts/epics/`；`epics/index.md` 是 lifecycle/navigation owner，禁止创建第二份根级 `epics.md` 作为本仓库 planning 真源。
- `speclite-create-prd`、`create-epics-and-stories`、`create-architecture` 的 active source 仍含旧 root-level/Planning Architecture paths。
- Downstream discovery 分散在 validate-prd、readiness、create-story、sprint-planning、retrospective、correct-course、generate-project-context；必须消费同一 decision table。
- `speclite-shard-doc` 已有同目录 `index.md`/shard naming；必须复用，不引入新 `shards/` 层。

### Technical / Architecture / Testing Requirements（技术、架构与测试要求）

- 推荐 config-owned `artifact-document-discovery.ts`，但文件名是 Guidance；外部 decision table/evidence/stable issues 是 hard contract。
- Index links 必须解析在 authoritative subject directory 内；broken/outside/unreadable 一律 read-only block。
- Explicit selection 只对当前 invocation 有效，不删除、不覆盖、不修改未选版本。
- 每个 block fixture 同时断言 stable issue、continuation、ambiguity、zero artifact write、zero progress mutation。
- 无外部 API、无 dependency upgrade；沿用 TypeScript ESM/Vitest 和 project-relative POSIX/redaction。

## Previous Story Intelligence（前序 Story 情报）

- 只消费 11.1 resolver、11.2 fresh projection、11.3 compatibility 与 11.4 completed evidence；这些当前尚未实现，kickoff 必须 live 验证。

## Dependency Gate（依赖门禁）

- Hard predecessors：11.1–11.4 `done` + completion Gates；同时锚定 `SPEC 07`、`SPEC 09`、`CC-2026-08-17-architecture-root`。
- Kickoff report：`{implementation_artifacts}/flow-gates/11-5-govern-planning-and-solutioning-documents-as-whole-and-sharded-artifacts-story-kickoff-gate.md`。
- 不得依赖 Story 11.6+ 才完成本 Story。
- `SPEC 09` contract-update / owner-decision gate 必须先关闭：whole/sharded decision table、blocking continuation、required evidence fields 与 stable issue mapping 要么已由 `SPEC 09` 承载，要么有明确 owner decision 允许同变更更新；否则 kickoff 返回 `DECISION_NEEDED`，producer/consumer 不得各自复制 precedence。

## Anchor Contract Map（锚点契约映射）

| Anchor | Evidence | Failure |
| --- | --- | --- |
| phase-owned roots + decision table | executable matrix | `FAIL_CONTRACT` |
| stable ambiguity/missing/broken issues | `SPEC 07` registry | `FAIL_CONTRACT` |
| producer/consumer single resolver | cross-consumer parity | `FAIL_FUNCTION` |
| block read-only / no migration | before-after hashes | `FAIL_EVIDENCE` |
| corpus closure | classified negative scan | `FAIL_EVIDENCE` |

## Equivalent Implementation Policy（等价实现策略）

- Helper/component boundaries 可调整；不得改变 roots、decision table、explicit selection scope、fallback evidence、blocking continuation 或 no-migration。

## Files To Modify（预计文件范围）

- Producers：`speclite-create-prd/**`、`speclite-create-epics-and-stories/**`、`speclite-create-architecture/**`、`speclite-shard-doc/**`（仅保持 contract）。
- Consumers：validate-prd、readiness、create-story、sprint-planning、retrospective、correct-course、generate-project-context 的 discovery references。
- Runtime/contracts：module metadata、manifest interpolation、`SPEC 07` issue registry、shared discovery helper。
- Owner-gated contract：`_bmad-output/planning-artifacts/specs/09-sdlc-workflow-lifecycle-contract.md` 仅在 `SPEC 09` owner decision 批准后同变更更新；若 owner 决定不改 SPEC，本 Story 必须记录 no-contract-update rationale，并说明实现如何消费已批准的 owning contract。
- Tests：新增 `test/artifact-document-discovery.test.ts` 与 complete decision-table fixtures。

## References（参考资料）

- [Source: Epic 11 Story 11.5]
- [Source: PRD FR23c]
- [Source: `SPEC 09` phase-owned whole/sharded contract]
- [Source: `CC-2026-08-17-architecture-root`]
- [Source: `_bmad-output/planning-artifacts/implementation-readiness-report-2026-09-02.md`]

## Requirement Traceability（需求追踪）

- FR23c；NFR14a；NFR40f（Planning/Solutioning whole-sharded）；UX-DR7、UX-DR8、UX-DR15；SPEC 07；SPEC 09；`CC-2026-08-17-architecture-root`。

## Dev Agent Record（开发代理记录）

### Agent Model Used（使用模型）
GPT-5.5 (`gpt-5.5`)

### Completion Notes List（完成说明）
- 终极上下文引擎分析已完成 —— 已创建完整开发者指南。
- Owner 已明确批准 `确认 11.5 推荐方案`；kickoff 以 controlled correction 保留原 `DECISION_NEEDED` 历史并把 current result 更新为 `PASS`。
- `SPEC 09` 已承载 AC5 唯一 decision table、evidence、blocking continuation、explicit selection、fallback/mismatch/no-migration；`SPEC 07` 已注册四个 stable issue IDs。
- 已实现 `speclite resolve artifact-documents` 与共享只读 discovery model，覆盖 PRD/Epics/Architecture whole-only、sharded-only、whole+sharded、invalid/broken/missing、selection、legacy-compatible fallback 与 mismatch。
- Whole producers、`speclite-shard-doc`、九个明确 consumer、ZH/EN/help/metadata/docs/fixtures 已同步；UX 与 Story 11.6+ 范围保持不变。
- Focused matrix 17/17、isolated affected 86/86、isolated full 522 passed / 4 todo、build/docs/packaging/canonical strict 均通过。Live worktree 的固定数量失败仅由未授权 external drawer 造成，未据此改写 68-skill baseline。
- CR Round 8 Reviewer/Evaluator 已形成 double-PASS，当前为 `0 P0 / 0 P1`；Round 7 Finding #2 已登记为 `TODO-016` 且保持 `open`。CR06 复跑 focused/related `123/123`、docs、canonical warn/strict 与 `git diff --check` 均通过；未把 external drawer 导致的 live full-suite fixed-count drift 表述为全量测试全绿。

### File List（文件清单）
- `_bmad-output/implementation-artifacts/stories/11-5-govern-planning-and-solutioning-documents-as-whole-and-sharded-artifacts.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/implementation-artifacts/flow-gates/11-5-govern-planning-and-solutioning-documents-as-whole-and-sharded-artifacts-story-kickoff-gate.md`
- `_bmad-output/implementation-artifacts/flow-gates/11-5-govern-planning-and-solutioning-documents-as-whole-and-sharded-artifacts-story-completion-gate.md`
- `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md`
- `_bmad-output/planning-artifacts/specs/09-sdlc-workflow-lifecycle-contract.md`
- `src/config/artifact-document-discovery.ts`
- `src/config/resolve-output-schema.ts`
- `src/commands/resolve.ts`
- `assets/source/speclite/core-skills/speclite-shard-doc/SKILL.md`
- `assets/source/speclite/sdlc-skills/module-help.csv`
- `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-prd/**`
- `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-validate-prd/**`
- `assets/source/speclite/sdlc-skills/3-solutioning/speclite-check-implementation-readiness/**`
- `assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-architecture/**`
- `assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-epics-and-stories/**`
- `assets/source/speclite/sdlc-skills/3-solutioning/speclite-generate-project-context/**`
- `assets/source/speclite/sdlc-skills/4-implementation/speclite-correct-course/**`
- `assets/source/speclite/sdlc-skills/4-implementation/speclite-create-story/**`
- `assets/source/speclite/sdlc-skills/4-implementation/speclite-retrospective/**`
- `assets/source/speclite/sdlc-skills/4-implementation/speclite-sprint-planning/**`
- `docs/explanation/local-first-control-plane.md`
- `docs/explanation/runtime-boundaries.md`
- `docs/reference/cli-human-output-matrix.md`
- `docs/reference/cli.md`
- `docs/reference/command-result-json.md`
- `docs/reference/config-and-customization.md`
- `docs/reference/glossary/epic-09-installed-runtime-activation-contract-hardening.md`
- `docs/reference/skills/sdlc-workflows.md`
- `docs/reference/specs/command-result-json-contract.md`
- `docs/reference/workflow-artifact-layout.md`
- `release/packaging-manifest.json`
- `test/artifact-document-discovery.test.ts`
- `test/runtime-structure.test.ts`
- `test/source-and-modules.test.ts`
- `test/fixtures/resolve-parity/expected/human/config-invalid-input.txt`
- `test/fixtures/fresh-install-empty-project/expected/installed-state/{manifest-full,skill-index-full,files-index-full,phase-coverage-full}.json`

## Anchor Evidence Summary（锚点证据摘要）
- `phase-owned roots + decision table`: PASS；fresh subject directories 与 whole producer paths 有 runtime/corpus/fixture evidence。
- `stable ambiguity/missing/broken issues`: PASS；四个 stable IDs 已注册并由 executable matrix 验证。
- `producer/consumer single resolver`: PASS；九个 consumer contract tests 均要求 command、`consumedPaths` 与 zero mutation。
- `block read-only / no migration`: PASS；before/after snapshots、CLI block evidence 与 legacy fallback fixture 均通过。
- `corpus closure`: PASS_EQUIVALENT；11.5 active negative scan 无违规，live full 仅受 external drawer fixed-count drift 影响，隔离 68-skill baseline full PASS。

## Change Log（变更记录）
| Date | Version | Description | Author |
| --- | --- | --- | --- |
| 2026-09-02 | 0.1 | 创建 phase-owned whole/sharded decision、producer/consumer 与 evidence 上下文。 | Fancyliu / Codex |
| 2026-09-04 | 1.0 | 实现共享 whole/sharded resolver、producer/consumer 路由、稳定诊断、文档/fixture 与 completion evidence；移交 review。 | GPT-5.5 / Codex |
| 2026-09-04 | 1.1 | Round 8 Reviewer/Evaluator double-PASS；CR04 规则与 CR05 `TODO-016` 已登记，完成 CR06 状态收尾。 | GPT-5.5 / Codex |

---
*本文档由 bmad-create-story Skill 自动生成*
