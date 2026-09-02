# Story 11.5: Govern Planning And Solutioning Documents As Whole And Sharded Artifacts（治理 Planning 与 Solutioning 文档的整篇与分片产物）

Status: ready-for-dev

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

- [ ] Task 1: 核验 11.1–11.4 evidence，运行 11.5 kickoff，预注册 discovery issues。
- [ ] Task 2: 实现单一 discovery resolver/decision table 与 evidence model。
- [ ] Task 3: 更新 PRD、Epics、Architecture whole producers 与 shard-doc 同目录 contract。
- [ ] Task 4: 更新 downstream consumers，提供 invocation-scoped explicit selection；block 前零写入/零 progress mutation。
- [ ] Task 5: 建立 fresh/existing/whole/sharded/ambiguity/broken/missing fixture matrix。
- [ ] Task 6: 执行 canonical corpus negative scan、focused suites、build、`git diff --check` 与 completion Gate。

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
待实现 Agent 填写。

### Completion Notes List（完成说明）
- 终极上下文引擎分析已完成 —— 已创建完整开发者指南。
- Story 尚未实现；decision table 与 evidence plan 不代表 verified behavior。

### File List（文件清单）
- `_bmad-output/implementation-artifacts/stories/11-5-govern-planning-and-solutioning-documents-as-whole-and-sharded-artifacts.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

## Anchor Evidence Summary（锚点证据摘要）
- 待实现与 Flow Gates 填写。

## Change Log（变更记录）
| Date | Version | Description | Author |
| --- | --- | --- | --- |
| 2026-09-02 | 0.1 | 创建 phase-owned whole/sharded decision、producer/consumer 与 evidence 上下文。 | Fancyliu / Codex |

---
*本文档由 bmad-create-story Skill 自动生成*
