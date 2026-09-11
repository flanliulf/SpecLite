---
Story: 11-9
Round: 2
Date: 2026-09-05
Model Used: GPT-5.6 (gpt-5.6)
Layer: Acceptance Auditor
Type: Code Review Layer Result
---

# Acceptance Review（验收审查）

## Verdict（裁决）

**FAIL** — `2` 个 P1，`0` 个 P2。Round1 对 ancestor containment、legacy current-series evidence、canonical artifact/frontmatter identity、finalizer required bindings、四字段 frozen context、stable I/O diagnostic、installed projection 与 no-follow inventory 的主体修复已经落地；本层复跑 focused suite 为 `1 file passed / 31 passed / 4 todo`。

但 Round1 已确认的两个 evidence hard gate 仍未闭环：candidate scanner 的 token families 会漏掉中文、下划线等 concrete title-bearing 目录和 JS 字符串拼接，active producer 可在 focused suite 中 false-green；所谓 “every blocked preflight” 的 runner-wide zero-mutation test 实际只执行一个 unbound legacy case，没有覆盖 Evaluator 明确要求的 dual/multi、ancestor/candidate unsafe、malformed 与 I/O cases。二者违反 AC7、AC10、AC11，且 current completion gate 对 “full classified scan” 与 “runner-wide zero mutation” 的 PASS 声明高于现有测试证据。

## Scope And Evidence（范围与证据）

- 已核对 Story 11.9、Round1 Acceptance/summary/evaluation、Fix Summary、current completion gate、shared CR contract、executable resolver、runner、CR01–06 Directory Preflight、focused tests与 frozen ledger。
- Current working tree 是 Epic 11 累积 diff；本层仅按 Round1 Evaluator 授权白名单和 Story 11.9 AC 归因，排除 Story 11.10、前序 Story 的独立改动、workspace `.agents/.claude` mirrors 与外部 drawer。
- 已运行 `npx vitest run test/code-review-contract.test.ts --reporter=dot`：`1 file passed; 31 tests passed; 4 todo`。未运行 build、full suite、packaging 或 canonical governance。
- 已对 current `titleBearingTokenPatterns()` 做只读输入 probe：`11-9-old-title-code-review` 可匹配；`11-9-中文-code-review`、`11-9-title_with_space-code-review` 与 `storyId + "-" + storySlug + "-code-review"` 均得到零 match；`${storyId}-${storySlug}-code-review` 可匹配。
- 除本 Acceptance artifact 外，未修改 source、test、Story、tracker、gate、goal records 或其他 CR artifacts。

## Acceptance Criteria Matrix（验收标准矩阵）

| AC | Result | Current evidence |
| --- | --- | --- |
| AC1 | PASS | 正常新 run 返回 `{implementation_artifacts}/code-reviews/{storyId}-code-review/`；无合法 current-series evidence 的 legacy candidate 已 stable block，不再改写新 run root。 |
| AC2 | PASS | `normalizeStoryId()` 只接受无前导零的 numeric `N.N` / `N-N`，`11.9` 与 `11-9` 精确归一为 `11-9`。 |
| AC3 | PASS | Resolver 不消费 title/name/slug/filename remainder；ancestor no-follow containment 和 traversal fixtures已闭合 runtime path safety。 |
| AC4 | PASS | Runner 只出现一次 executable resolver invocation，并向 CR01–06 显式传递同一 `crDir`、`canonicalCrDir`、`compatibilityMode`、`legacyArtifactPaths`；leaf 声明 mismatch-before-write HALT。 |
| AC5 | PASS | Review/evaluation/fix/rules/TODO/finalizer/`.tmp/` 与 progress surfaces 均声明消费同一 resolved `crDir`。 |
| AC6 | PASS | Goal records 固定为 `{crDir}/goal-execute-records/`，三个既有记录 basename 保持不变。 |
| AC7 | **FAIL** | Frozen roots与 explicit files 已纳入递归 no-follow inventory，但 raw-byte token families 不能识别多类 active title-bearing expression，无法证明“全部 `$cr_dir` expressions”已闭环。见 P1-1。 |
| AC8 | PASS | Resolver 为 read-only；legacy resume/completed/ambiguity fixtures均不迁移、不重命名、不删除既有目录。 |
| AC9 | PASS | Empty/unrelated/other-series/malformed/unbound legacy evidence现已 block；canonical family、identity、round、disposition与 latest `DONE` required bindings均被校验。 |
| AC10 | **FAIL** | Ledger 与 scanner current output exact equality，但 scanner漏掉中文/下划线 concrete title和 JS concat；新增 active pattern仍可不进入 ledger而测试通过。见 P1-1。 |
| AC11 | **FAIL** | Focused suite覆盖 Story列举的主干案例并为绿色，但 full classified scan存在 false-green，且 runner-wide zero-mutation只验证一个 blocked case，未满足Round1 Evaluator冻结的负例矩阵。见 P1-1、P1-2。 |
| AC12 | PASS | Round1修复没有改动 report basenames、CR algorithm、round numbering 或 approval rules。 |

## Findings（发现）

### P1-1 — Frozen candidate scanner 仍漏掉 active concrete 与 JS-concat title-bearing roots

- **Classification:** `patch`
- **Violated:** AC7、AC10、AC11；Round1 Evaluator Finding #8 的 “raw-byte token families / shell/JS 拼接 / concrete title-bearing path” closure。
- **Location:** `test/code-review-contract.test.ts:1110-1121`（`titleBearingTokenPatterns()`）。
- **Evidence:** concrete regex 只接受 `[a-z][a-z0-9-]*` title，因此 `11-9-中文-code-review` 和 `11-9-title_with_space-code-review` 都不匹配；placeholder regex只接受 token相邻形式，因此 `storyId + "-" + storySlug + "-code-review"` 不匹配。只读 probe已直接复现零 match。
- **Impact:** 在 frozen candidate roots 中加入上述 active producer/consumer 时，scanner不会产生 ledger entry，`actual === expected` 仍可通过；当前 `active-canonical=[]` 因而不能证明 active title-bearing pattern为零。Round1 的 P1-8 与 AC7/AC10 negative closure仍为 false-green。
- **Required closure:** 扩展冻结 token family，使 Story允许的任意非编号 title文本与常见 shell/JS/config拼接均进入 classified ledger；为中文、空格/下划线、quoted concat、template/shell variants建立 scanner-unit RED/GREEN assertions。任何新增 match必须未分类即失败；不得扩大扫描到 Story 11.10、drawer、workspace mirrors或 history。

### P1-2 — Runner-wide zero-mutation matrix 只覆盖单一 unbound legacy case

- **Classification:** `patch`
- **Violated:** AC11、shared contract “diagnostic 必须先于任何 artifact/goal/temp/Story/tracker/progress mutation”；Round1 Evaluator Finding #6 的 GREEN matrix。
- **Location:** `test/code-review-contract.test.ts:711-738`。
- **Evidence:** 测试标题宣称覆盖 “every blocked preflight”，但函数体只构造 `legacy/unbound.md` 一个 `legacy-current-series-evidence-invalid` 场景，仅调用一次 `runResolverPreflight()`。Dual、multi、ancestor symlink、candidate symlink/non-directory、malformed evidence与 inspection I/O failure没有经过同一个 mutation callback-zero + full controlled-tree before/after oracle。
- **Impact:** 各失败原因的 resolver unit tests虽能证明返回 block，仍不能证明 runner ordering在每类 blocked preflight下都不会写 goal/temp/progress、Story或 trackers；current gate的 runner-wide zero-mutation结论缺少其声称的完整 evidence matrix。
- **Required closure:** 将现有 controlled-tree oracle参数化到 Evaluator已冻结的 dual、multi、ancestor symlink、candidate symlink/non-directory、unbound、malformed与 I/O blocked cases；每例均断言 mutation callback为零且 path/type/size/SHA-256/tree exact unchanged。只补 test evidence，不修改 runner algorithm或扩展 Story 11.10。

## Round1 Fix Audit（Round1 修复审计）

| Round1 accepted finding | Result | Evidence |
| --- | --- | --- |
| #1 ancestor containment | PASS | `inspectRootPath()`逐段 `lstat`/realpath containment；internal/external symlink与non-directory均 stable block。 |
| #2 legacy current-series evidence | PASS | 显式区分 completed/unfinished/no-current-series-evidence/unsafe；empty/unrelated/other-series/malformed/unbound均 block。 |
| #3 finalizer authenticity | PASS | Canonical artifact families、safe round、leading frontmatter identity/current disposition及 `DONE` required filename/hash bindings已校验。 |
| #4 frozen context propagation | PASS | Runner六次 leaf invocation传齐四字段，leaf均声明缺失/mismatch在写前HALT且不重跑resolver。 |
| #5 stable/redacted I/O | PASS | Root/candidate/artifact inspection与CLI catch收敛为stable JSON；focused permission probe验证single stdout JSON、empty stderr与redaction。 |
| #6 runner-wide zero mutation | **FAIL** | Production resolver本身read-only，但要求的每类blocked preflight runner oracle未建立；只有一个unbound legacy case。见 P1-2。 |
| #7 installed CR01–06 parity | PASS | `.agents`/`.claude` fresh-install fixture逐字节核对contract/resolver/runner/六leaf，并核对once-only/four-field/no-title text invariants。 |
| #8 full classified scan | **FAIL** | Candidate corpus与ledger机制存在，但 token families漏 concrete Unicode/underscore与JS concat。见 P1-1。 |

## Todo And Drawer Boundary（Todo 与 Drawer 边界）

- Focused suite 的 `4 todo` 是既有 CR state-machine基建项：zero-TODO closeout E2E、CR06缺CR04/CR05 halt、same-round supersession、tracker rollback。它们不是本轮失败，也没有被升格为 Story 11.9 P2。
- 外部 `assets/source/speclite/core-skills/speclite-drawer-er-modeler/` 与 zip造成 live `core=19,total=69` 及 fixed-count failures；本层未运行 affected/full suite，也不要求修改 drawer/zip、workspace mirrors或 fixed-count assertions。这一 caveat与两个 Story-owned P1无关。

## Completion Gate Assessment（完成门禁评估）

- Current `PASS_EQUIVALENT` 对 external drawer fixed-count drift 的隔离理由仍可接受。
- 但 gate 声称 frozen full classified scan、active title-bearing role为零及 runner-wide zero mutation均已闭环；P1-1/P1-2表明这些声明高于 current executable tests。在 fresh Fixer补齐并经后续 Reviewer/Evaluator确认前，该 gate不得作为 CR06 allowing evidence。

## Owner Gate（Owner 门禁）

**NONE**。两项均由 Story AC、shared contract与 Round1 Evaluator已冻结的 GREEN criteria唯一确定，不需要产品、Architecture或scope选择；Fixer只需在既有 `test/code-review-contract.test.ts`（及确有必要时同一 ledger fixture）补齐 bounded test scanner/evidence，不得触碰 Story 11.10、drawer或未授权 surfaces。

## Conclusion（结论）

- **结论：不通过（FAIL）**
- **P1：2**
- **P2：0**
- **Owner Gate：`NONE`**
- 本结果仅代表 fresh Acceptance Auditor Round 2；仍须等待同轮 Blind Hunter、Edge Case Hunter、Aggregator 与 fresh Evaluator 的正式产物。只有最新 Reviewer/Evaluator双 PASS后，outer orchestrator才可进入 CR04、CR05与CR06。
