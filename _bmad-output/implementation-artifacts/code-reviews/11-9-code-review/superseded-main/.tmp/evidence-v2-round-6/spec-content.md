# Round 6 Story and AC（第六轮 Story 与验收标准）

- Review series / round: `evidence-v2 / 6`
- Story source: `_bmad-output/implementation-artifacts/stories/11-9-normalize-code-review-artifact-directories-by-story-id.md`
- R5 fixRecord 完成仅是待 fresh 复核输入，不预设 Reviewer 或 Evaluator 结论。

# Story 11.9: Normalize Code Review Artifact Directories By Story ID（按 Story ID 统一 Code Review Artifact 目录）

Status: review

## Story（故事）

作为执行 Epic Story Code Review 闭环的开发者和项目维护者，  
我希望 reviewer、evaluator、fixer、tracker、finalizer 与 goal records 始终使用唯一 Story-ID-only 目录，  
以便 CR artifacts 不再因 title/slug 分散到多个目录。

## Acceptance Criteria（验收标准）

1. 新 CR run 唯一 root 为 `{implementation_artifacts}/code-reviews/{story_id}-code-review/`。
2. `{story_id}` 只来自规范编号，点转连字符；Story `11.9` 精确为 `11-9-code-review/`。
3. Title/name/slug/filename 的非编号文本、中文、空格、标点不得参与目录名。
4. Orchestrator 只解析一次 canonical `$cr_dir` 并传给 CR01–06；下游不得重新推导。
5. Review/evaluation/fix/rules/TODO/finalization/temp/round artifacts 全部写同一目录。
6. Goal records 固定在 `$cr_dir/goal-execute-records/`，继续使用 `PLAN.md`、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md`。
7. 审计并同步 orchestrator、CR01–06、shared contract/config、templates、help、metadata/contracts、scripts/hooks/fixtures/docs 及全部 `$cr_dir` expressions。
8. Existing title-bearing CR directories 不自动迁移、重命名或删除。
9. Legacy-only unfinished run 必须诊断并在一个目录内恢复；canonical+legacy 无法唯一判定 current round 时 stable conflict + stop，不猜测、不拆轮。
10. Negative scan 排除 active title-bearing patterns；仅 legacy fixtures/明确 compatibility docs 可分类保留。
11. Tests 覆盖纯编号、任意 title 不影响、CR01–06 同 `$cr_dir`、goal records、legacy-only、dual-dir ambiguity 与 title traversal 无法越界。
12. 不修改 report basenames、CR algorithm、round numbering 或 approval rules。

## Tasks / Subtasks（任务 / 子任务）

- [x] 核验 11.1–11.8 completion Gates，运行 11.9 kickoff，冻结 canonical/legacy directory contract。
- [x] 先建立 normalization、propagation、legacy recovery、dual-directory conflict 与 traversal failing tests。
- [x] 收口 shared CR contract/parser；orchestrator 一次解析 `$cr_dir` 并显式传递 CR01–06。
- [x] 更新 CR01–06/read-write paths、templates、goal records、help/metadata/docs，不改变 basenames/algorithm/approval。
- [x] 实现 legacy-only resume 与 ambiguous dual-dir stable diagnostic；保持 legacy files 原位。
- [x] 执行 full active-pattern scan、focused CR tests、build、diff check 与 completion Gate。

## Dev Notes（开发备注）

### Current Verified Baseline（当前已验证基线）

- Shared `speclite-code-review-contract/references/cr-contract.md` 已声明 Story-ID-only root；runner、CR01、CR06 也已有相同文案，本 Story 应复用并补齐 executable/full-chain closure，不重写一套新算法。
- Runner 当前调用面仍可能只传 `storyId`，下游可再次推导；必须传递一个已解析且验证过的 `$cr_dir` identity。
- 当前 CR governance 相关工作树/历史 commits 可能含用户改动；实现时必须 scoped audit，禁止 broad rewrite。

### Technical / Architecture / Testing Requirements（技术、架构与测试要求）

- 解析 Story ID 时只接受 canonical numeric identity（如 `11.9` / `11-9`），输出 normalized `11-9`；title 不是 fallback source。
- `$cr_dir` 必须 project-relative POSIX、位于 `{implementation_artifacts}/code-reviews/`，任何 separator/traversal title 不得改变它。
- Canonical/legacy ambiguity 必须在任何 round write 或 progress mutation 前停止，并使用 owning taxonomy stable issue。
- Legacy discovery 只提供 resume/evidence，不做 filesystem migration；所有同轮 outputs 保持单目录。
- 无外部 API或版本升级；重点回归 CR contract tests 与 strict-serial state-machine semantics。
- Current shared CR contract 尚未固定 legacy-only resume 应继续写 legacy directory 还是切换到 canonical directory，也未固定 dual-directory issue ID/category/details。Kickoff 必须先关闭这两个 observable decisions；未关闭时为 `DECISION_NEEDED`，CR01–06 不得各自选择。
- CR stable diagnostics 必须先选择唯一 owner：若作为 project validation issue 暴露，则由 `SPEC 07` taxonomy 承载；若仅属 CR workflow-local continuation，则由 shared `speclite-code-review-contract` 承载。无论选择哪一方，legacy-only 与 dual-directory fixtures 必须断言 owner、stable ID/category/details、redaction、stop-before-write 与 zero progress mutation。

## Previous Story Intelligence（前序 Story 情报）

- Story 11.8 必须先完成 canonical rename/routing；11.9 不得把 generic grill 或 readiness work 混入 CR root normalization。

## Dependency Gate（依赖门禁）

- Hard predecessors：11.1–11.8 `done` + completion Gates；不得依赖 11.10。
- Kickoff report：`{implementation_artifacts}/flow-gates/11-9-normalize-code-review-artifact-directories-by-story-id-story-kickoff-gate.md`。
- Legacy-only write target 或 dual-directory stable diagnostic 未关闭时不得开始实现。
- 若 stable diagnostic owner 在 `SPEC 07` taxonomy 与 shared CR contract 之间未决，kickoff 必须返回 `DECISION_NEEDED`；CR01–06 不得各自发明 issue ID、category 或 resume behavior。

## Anchor Contract Map（锚点契约映射）

| Anchor | Evidence | Failure |
| --- | --- | --- |
| numeric canonical root | normalization table | `FAIL_CONTRACT` |
| single resolution/propagation | review、evaluation、fixer append、rules、TODO result、finalizer、`.tmp/`、goal records 全部使用同一 normalized `$cr_dir` | `FAIL_FUNCTION` |
| legacy/ambiguity/no-migration | resume + dual-dir fixtures | `FAIL_EVIDENCE` |
| active corpus closure | title-bearing negative scan | `FAIL_EVIDENCE` |

## Equivalent Implementation Policy（等价实现策略）

- Parser/helper 位置可调整；numeric-only root、single `$cr_dir` propagation、single-round directory、legacy no-migration、ambiguous stop 与 traversal safety 不可改变。

## Files To Modify（预计文件范围）

- `speclite-code-review-contract/{SKILL.md,SKILL.en.md,references/cr-contract.md}`。
- `speclite-goal-orchestrator-epic-story-code-review-runner/**` 与 CR01–06 `SKILL*` / references / templates。
- Shared owner `speclite-code-review-contract/references/cr-contract.md`、module help/metadata/contracts、scripts/hooks/fixtures/docs 的 path expressions；current canonical source 不存在 `cr-config.md`，不得把它当作既有 UPDATE file。
- `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md`：仅当 kickoff 决定 legacy-only / dual-directory diagnostics 属 project validation taxonomy 时同变更更新；若 shared CR contract owns these diagnostics，必须记录 no-`SPEC 07` change rationale，并在 fixtures 断言 CR-local owner boundary。
- 扩展 `test/code-review-contract.test.ts`，新增 legacy/ambiguity/propagation fixtures。

## References（参考资料）

- [Source: Epic 11 Story 11.9]
- [Source: PRD FR23g]
- [Source: `speclite-code-review-contract/references/cr-contract.md`]
- [Source: `speclite-goal-orchestrator-epic-story-code-review-runner/references/runner-workflow.md`]

## Dev Agent Record（开发代理记录）

### Agent Model Used（使用模型）
GPT-5

### Completion Notes List（完成说明）
- 终极上下文引擎分析已完成 —— 已创建完整开发者指南。
- Kickoff `PASS`：legacy-only 唯一 unfinished run 原位 resume；dual/multi ambiguity 由 shared CR-local contract 以 `cr-directory.ambiguous-resume-root` fail-close，并在任何写入前停止。
- 新增 executable shared resolver，仅接受 numeric Story ID；runner 单次解析并向 CR01–06、全部 CR artifacts、`.tmp/` 与 goal records 传播同一 `crDir`。
- 完成 legacy recovery、latest-round、ambiguity redaction/zero-write、title/traversal isolation、active-pattern scan 与 fresh-install resolver parity 回归。
- Focused final `24 passed / 4 todo`；affected matrix `74 passed / 4 external fixed-count failures / 4 todo`；full suite `695 passed / 12 external fixed-count failures / 4 todo`。
- `docs:check`、ESM/DTS build、packaging、canonical strict、skill density 与 `git diff --check` 均通过；completion gate 为 `PASS_EQUIVALENT`。

### File List（文件清单）
- `_bmad-output/implementation-artifacts/stories/11-9-normalize-code-review-artifact-directories-by-story-id.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/implementation-artifacts/flow-gates/11-9-normalize-code-review-artifact-directories-by-story-id-story-kickoff-gate.md`
- `_bmad-output/implementation-artifacts/flow-gates/11-9-normalize-code-review-artifact-directories-by-story-id-story-completion-gate.md`
- `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/{SKILL.md,SKILL.en.md,CHANGELOG.md,references/cr-contract.md,scripts/resolve-cr-directory.mjs}`
- `assets/source/speclite/sdlc-skills/4-implementation/speclite-goal-orchestrator-epic-story-code-review-runner/{SKILL.md,SKILL.en.md,CHANGELOG.md,references/runner-workflow.md}`
- `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-01-reviewer/{SKILL.md,SKILL.en.md,CHANGELOG.md,references/reviewer-workflow.md}`
- `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-02-evaluator/{SKILL.md,SKILL.en.md,CHANGELOG.md,references/evaluator-workflow.md}`
- `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-03-fixer/{SKILL.md,SKILL.en.md,CHANGELOG.md,references/fixer-workflow.md}`
- `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-04-rules-extractor/{SKILL.md,SKILL.en.md,CHANGELOG.md,references/rules-extractor-workflow.md}`
- `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-05-todo-tracker/{SKILL.md,SKILL.en.md,CHANGELOG.md,references/todo-tracker-workflow.md}`
- `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-06-finalizer/{SKILL.md,SKILL.en.md,CHANGELOG.md,references/finalizer-workflow.md}`
- `assets/source/speclite/sdlc-skills/module-help.csv`
- `assets/source/speclite/{README.md,README.en.md}`
- `docs/reference/skills/sdlc-workflows.md`
- `docs/reference/workflow-artifact-layout.md`
- `test/code-review-contract.test.ts`
- `release/packaging-manifest.json`

## Anchor Evidence Summary（锚点证据摘要）
- Normalization：`11.9` 与 `11-9` 唯一归一为 `11-9-code-review`；非数字、零前缀、title 与 traversal inputs fail-close。
- Propagation：runner resolver invocation count 为 1，CR01–06、all artifacts、`.tmp/`、`goal-execute-records/` 消费同一 `crDir`。
- Legacy / ambiguity：唯一 unfinished legacy 原位 resume；completed legacy 使用 canonical；dual/multi 或 unsafe evidence 产生 stable、redacted、zero-write diagnostic。
- Scan / install：active title-bearing expression 为零；fresh `.agents` / `.claude` resolver bytes、mode 与 CLI probe 通过。
- Gates：kickoff `PASS`；completion `PASS_EQUIVALENT`；Story status target=`review`。

## Change Log（变更记录）
| Date | Version | Description | Author |
| --- | --- | --- | --- |
| 2026-09-02 | 0.1 | 创建 CR Story-ID-only root、single propagation、legacy/ambiguity 与 evidence 上下文。 | Fancyliu / Codex |
| 2026-09-05 | 1.0 | 实现 numeric-only resolver、single `crDir` propagation、legacy resume、ambiguity pre-write stop，并完成回归与 Completion Gate。 | Codex |

---
*本文档由 bmad-create-story Skill 自动生成*
