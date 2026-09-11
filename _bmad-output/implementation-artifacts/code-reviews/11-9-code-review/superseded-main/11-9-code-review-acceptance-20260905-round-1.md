---
Story: 11-9
Round: 1
Date: 2026-09-05
Model Used: GPT-5.6 (gpt-5.6)
Layer: Acceptance Auditor
Type: Code Review Layer Result
---

# Acceptance Review（验收审查）

## Verdict（裁决）

**FAIL** — `2` 个 P1，`0` 个 P2。numeric-only Story ID、canonical basename、runner 单次传播文档、CR01–06 同目录契约、goal records、legacy no-migration、stable diagnostic、active negative scan 与 installed resolver projection 的主干已落地；focused suite 在本层复跑为 `1 file / 24 passed / 4 todo`。

但 current executable resolver 仍有两个 Story-owned hard gap：当 `code-reviews/` 未存在时没有验证父链 symlink containment，后续创建 canonical path 可写出 project root；legacy run 又仅按目录名与 filename suffix 猜测 unfinished/completed，空目录、无关 artifact 或 frontmatter identity 不匹配均会被误当可恢复证据。这些直接违反 AC1、AC9、AC11 及 shared contract 的 fail-close / unique round binding，不能由 completion gate 的 `PASS_EQUIVALENT` 或外部 drawer caveat 豁免。

## Scope And Evidence（范围与证据）

- 已核对 Story 11.9、Epic 11 Story 11.9、PRD `FR23g`、kickoff/completion gates、shared CR contract、executable resolver、runner、CR01–06 workflows、ZH/EN entrypoints、help/docs、release projection 与 focused tests。
- Current working tree 是 Epic 11 累积 diff；本层仅按 Story 11.9 Dev Agent Record/File List 与实际 CR directory surfaces 归因，排除 Story 11.10、前序 Story 的独立改动、workspace mirrors 与外部 drawer。
- 已运行 `npx vitest run test/code-review-contract.test.ts --reporter=dot`：`1 file passed; 24 tests passed; 4 todo`。本层未运行 build、full suite、packaging 或 canonical governance。
- 已执行 Story-bounded `git diff --check`：通过。已执行广于 current test oracle 的 title-bearing expression read-only scan；未发现 active producer/consumer 残留，Epic AC 原文和明确 legacy fixtures 为受控保留。
- 已使用临时目录做 read-only resolver probe：父链 symlink escape、空 legacy directory 与 mismatched-finalizer 三个输入均复现错误 success；probe 完成后已清理临时目录，未修改 repo source/test/gate/tracker。
- 除本 Acceptance artifact 外，未修改 source、test、Story、tracker、gate 或既有 CR 产物。

## Acceptance Criteria Matrix（验收标准矩阵）

| AC | Result | Current evidence |
| --- | --- | --- |
| AC1 | **FAIL** | 正常新 run 返回 `{implementation_artifacts}/code-reviews/{storyId}-code-review/`；但一个没有任何可绑定 CR evidence 的 title-bearing 空目录会被当作 unfinished legacy run 并改写新 run 的 `crDir`。见 P1-2。 |
| AC2 | PASS | `normalizeStoryId()` 只接受无前导零的 `N.N` / `N-N`，`11.9` 与 `11-9` 精确归一为 `11-9`。 |
| AC3 | PASS | resolver 不接收或提取 title/name/slug/filename remainder；中英文、空格、标点与 title traversal fixture 不影响目录名。 |
| AC4 | PASS | runner workflow 只出现一次 shared resolver invocation，并在 CR01–06 调用上显式传递同一 `crDir`；各 leaf workflow 禁止 runner mode 重新推导。 |
| AC5 | PASS | shared contract、runner 与 CR01–06 已统一 review/evaluation/fix/rules/TODO/finalizer/`.tmp/` 到 resolved `crDir`。 |
| AC6 | PASS | runner 固定 `{crDir}/goal-execute-records/`，并继续要求 `PLAN.md`、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md`。 |
| AC7 | PASS | shared contract/script、runner、CR01–06、ZH/EN entrypoints、help、README、public docs、tests 与 packaging manifest 均已同步；current canonical search 未发现第二 active directory producer。 |
| AC8 | PASS | resolver 只读 inspection，focused dual/multi snapshot 与 legacy fixture 没有迁移、重命名、删除或自动创建 canonical sibling。 |
| AC9 | **FAIL** | dual/multi stable block 的正常 fixture 通过，但 unfinished/completed 仅从 filename suffix 和局部 frontmatter 猜测；空/无关/mismatched evidence 没有 fail-close，可误恢复 legacy 或误开 canonical sibling。见 P1-2。 |
| AC10 | PASS | 对 canonical source、docs、tests 和 release surfaces 的 read-only scan 未发现 active title-bearing expression；保留项仅为 Epic AC/contract 的 compatibility prose 与 legacy fixtures。 |
| AC11 | **FAIL** | 已覆盖 numeric normalization、title isolation、CR01–06 传播、goal records、常规 legacy/dual ambiguity 与 install projection；但未覆盖 implementation parent symlink escape，也未覆盖空/无关/mismatched v2 round evidence。见 P1-1、P1-2。 |
| AC12 | PASS | report basenames、CR algorithm、round numbering 与 approval rules 未被 Story 11.9 改写；新增范围仅为 directory resolution/propagation/recovery。 |

## Findings（发现）

### P1-1 — Missing `code-reviews/` 时父链 symlink 可让 canonical write root 逃逸 project

- **Violated:** AC11、Story Technical Requirement “`$cr_dir` 必须位于 implementation artifacts / project boundary”、shared contract unsafe/escape fail-close。
- **Evidence:** `resolve-cr-directory.mjs:37-47` 只在 `codeReviewRoot` 已存在时通过 `realpath`/`isWithin` 验证 containment；`inspectRoot()` 对 `ENOENT` 返回 `missing`，调用方立即 success。如果 `<project>/impl` 是指向外部目录的 symlink，且外部 `code-reviews/` 尚未存在，resolver 仍返回 `ok=true, crDir=impl/code-reviews/11-9-code-review`；后续 `mkdir`/产物写入将落到 project 之外。
- **Why current tests miss it:** `test/code-review-contract.test.ts:470-503` 先创建普通的 in-project `implementationArtifacts/code-reviews` 目录，只验证未被使用的 `storyKey` traversal，没有覆盖 canonical parent chain symlink/escape。
- **Observed probe:** 临时 project 中 `impl -> <external-temp-dir>`、外部 `code-reviews` 不存在时，resolver 返回 `ok=true` 和 `compatibilityMode=canonical`。
- **Required closure:** 在返回 missing-root canonical success 前，从最近已存在 ancestor 做 no-follow/realpath containment 验证，对 symlink escape 返回 stable blocking diagnostic；添加父链 symlink 指向 project 外/内部以及 missing-root 的 focused fixtures，断言 zero write。

### P1-2 — Legacy current round 仅按 filename 猜测，空目录与 mismatched finalizer 可改写 resume 结论

- **Violated:** AC1、AC9、AC11、shared contract “只从合法 v2 frontmatter / identity / round 判定 current state”与“evidence 无法唯一绑定 current series/round 必须 block”。
- **Evidence:** `resolve-cr-directory.mjs:182-204` 对所有以 `-{reviewSeries}-round-N.md` 结尾的普通文件都提升 `maxRound`，未验证 artifact basename family、v2 `schemaVersion`、`storyId`、`reviewSeries`、frontmatter `round` 或 disposition。Finalizer 只检查 filename 包含 `-cr-finalizer-`、schema 名和 `result: DONE`，即可将 filename round 加入 `doneRounds`，同样不校验内容 identity。`maxRound=null` 又被 `completed=false` 统一当作 unfinished（`204`），所以空 title-bearing directory 也被视为可续写 run。
- **Observed probes:** ① 仅创建空 `11-9-old-title-code-review/`，resolver 返回 `ok=true, compatibilityMode=legacy-resume`；② 放入 filename 为 Story 11.9/main/round-1，但 frontmatter 为 `storyId: 99-9, reviewSeries: other, round: 42, result: DONE` 的 finalizer，resolver 返回 canonical new-run success。
- **Impact:** 前者会把新 CR artifacts 写入无法证明是 current run 的 legacy 目录；后者会把实际未完成 legacy 误判为 completed 并创建 canonical sibling，造成同一 Story 证据分裂。
- **Why current tests miss it:** `test/code-review-contract.test.ts:505-571` 只提供完全一致的 happy-path frontmatter；`573-623` 更将无结构的 `round-evidence.md` 当作 unfinished ambiguity fixture，没有断言“无法绑定”应 fail-close。
- **Required closure:** 仅解析 shared contract 许可的 current v2 artifact families，完整校验 `schemaVersion/storyId/reviewSeries/round/result/disposition` 与 basename binding；空、无关、malformed、mismatched 或冲突 evidence 必须以 `cr-directory.ambiguous-resume-root` 在写入前阻断；补齐正反 fixtures 和 zero-mutation assertions。

## Tasks Audit（任务审计）

| Task | Result | Evidence |
| --- | --- | --- |
| 11.1–11.8 predecessors + kickoff contract | PASS | predecessor completion gates 与 Story 11.9 kickoff `PASS`；legacy target/diagnostic owner 已选定。 |
| Normalization/propagation/legacy/ambiguity/traversal failing tests | **FAIL** | 主干 focused tests已绿，但父链 symlink escape 与 unbound legacy evidence 未覆盖，且手工 probe 均可复现。 |
| Shared resolver + runner single propagation | **FAIL** | 单次传播文档契约已闭合；executable resolver 的 containment 与 evidence binding 未 fail-close。 |
| CR01–06/templates/goal/help/metadata/docs synchronization | PASS | CR01–06 workflows、entrypoints、module help、README、public docs、release manifest 已指向同一 resolved `crDir`；basename/algorithm/approval 保持。 |
| Legacy-only resume + dual ambiguity + no migration | **FAIL** | 正常 happy paths通过，但空/无关/mismatched evidence 会误 resume 或误开 canonical，不满足唯一 current round 恢复。 |
| Active scan + focused/build/diff/completion gate | PARTIAL | active scan、focused `24/24` 与 bounded diff check通过；build/packaging/full/canonical 仅核对 completion gate 记录，本层按约束未复跑；两项 Story-owned P1 使 gate 暂不可用于 CR06。 |

## Todo And Drawer Boundary（Todo 与 Drawer 边界）

- Focused suite 的 `4 todo` 是已登记的 CR state-machine 基建项：zero-TODO closeout E2E、CR06 缺 CR04/CR05 halt、same-round supersession、tracker rollback。它们不是本轮 test failure，也不能代替 P1-1/P1-2 所需的 resolver boundary fixtures。本层不将这四项升格为 Story 11.9 P2。
- 外部 `assets/source/speclite/core-skills/speclite-drawer-er-modeler/` 与 zip 使 live discovery 为 `core=19,total=69`，并导致 completion gate 记录的 fixed-count failures。本层没有运行 full suite，也不要求修改 drawer/zip、workspace mirrors 或 fixed-count assertions；该 caveat 与两个 resolver P1 无关。

## Completion Gate Assessment（完成门禁评估）

- Current `PASS_EQUIVALENT` 对 drawer fixed-count drift 的隔离理由可接受。
- 但 gate 对“traversal safety”、“unsafe evidence stop”、“latest requested-series round”与“legacy-only unique unfinished run”的 PASS 声明高于 current executable behavior。P1-1/P1-2 修复并经 fresh Reviewer/Evaluator 确认前，该 gate 不得作为 CR06 allowing evidence。

## Owner Gate（Owner 门禁）

**NONE**。两项都有 Story AC、kickoff frozen decisions 与 shared CR contract 的确定答案，无需产品、Architecture 或 scope 选择；Fixer 只应修复 Evaluator 确认的 Story 11.9 bounded resolver/tests/gate evidence。

## Conclusion（结论）

- **结论：不通过（FAIL）**
- **P1：2**
- **P2：0**
- **Owner Gate：`NONE`**
- 本结果仅代表 fresh Acceptance Auditor Round 1；仍须等待同轮 Blind Hunter、Edge Case Hunter、Aggregator 与 fresh Evaluator 的正式产物。只有最新 Reviewer/Evaluator 双 PASS 后，outer orchestrator 才可进入 CR04、CR05 与 CR06。
