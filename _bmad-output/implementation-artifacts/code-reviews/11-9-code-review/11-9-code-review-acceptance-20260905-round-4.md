---
Story: 11-9
Round: 4
Date: 2026-09-05
Model Used: OpenAI GPT-5.6
Layer: Acceptance Auditor
Type: Code Review Layer Result
---

# Acceptance Review（验收审查）

## Verdict（裁决）

**FAIL** — `2` 个 P1，`0` 个 P2。Round 3 Fixer 已补齐 malformed current-artifact intent、CR04/CR05 evaluation lineage、模块 API 的 tracker authenticity、leaf exact frozen context、14 类 stable reason、八包 activation hard gate 与一组新增 candidate patterns；本层 fresh 复跑 focused suite 为 `1 file passed / 36 passed / 4 todo`。

但 current executable chain 仍有两个可机械确认的 false-green。第一，生产 runner 唯一允许的 CLI invocation 不传 `trackerBindings`，CLI parser 也不解析该字段；而 resolver 现在把它设为 authentic `DONE` 的必需输入。因此 completed legacy 在实际 runner 路径上永远不能被识别为 completed，直接破坏 AC8、AC9、AC11 的恢复矩阵。第二，candidate detector 的 JS/config concat regex 仍沿用旧的 `storyKey/storySlug/storyName` 变量集合，遗漏 bare `title/name/slug/filename` 与 `storyTitle/storyFilename` concat；Round 3 的 scanner closure 仍可 false-green，违反 AC7、AC10、AC11。

## Scope And Evidence（范围与证据）

- 已逐项核对 Story 11.9 AC1–AC12、current completion gate、Round 1–3 Acceptance/summary/evaluation 与 Round 3 Fix Summary、shared CR contract、runner Step 0、executable resolver、focused test及 classified ledger。
- 已运行 `npx vitest run test/code-review-contract.test.ts --reporter=dot`：`1 file passed; 36 tests passed; 4 todo`。
- 未运行 build、full suite、packaging 或 canonical governance；未读取、审查或归因 Story 11.10。
- Current worktree 为 Epic 11 累积 diff；本层仅按 Story 11.9 File List、Round 3 Fixer allowlist与实际 CR directory execution chain归因，排除 workspace mirrors、外部 drawer与 fixed-count baseline。
- 本层除创建本 Acceptance artifact外未修改 source、test、fixture、Story、tracker、gate、goal records或既有 CR artifacts。

## Acceptance Criteria Matrix（验收标准矩阵）

| AC | Result | Current evidence |
| --- | --- | --- |
| AC1 | PASS | 无既有 run 时模块 API 与 CLI 都返回 `{implementation_artifacts}/code-reviews/{storyId}-code-review/`。 |
| AC2 | PASS | `normalizeStoryId()` 只接受无前导零 numeric `N.N` / `N-N`，`11.9` 与 `11-9` 精确归一为 `11-9`。 |
| AC3 | PASS | Runtime resolver 不消费 title/name/slug/filename；八包 ZH/EN active entrypoint已有明确 no-rederive hard gate。 |
| AC4 | PASS | Runner 文档只调用一次 shared resolver并向 CR01–06 传播冻结的 `reviewSeries/crDir/canonicalCrDir/compatibilityMode/legacyArtifactPaths`；leaf test-only oracle已冻结 exact schema。 |
| AC5 | PASS | Review/evaluation/fix/rules/TODO/finalizer/temp/round surfaces均声明消费同一 resolved `crDir`。 |
| AC6 | PASS | Goal records固定在 `{crDir}/goal-execute-records/`，`PLAN.md`、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md` basename保持。 |
| AC7 | **FAIL** | Frozen roots与ledger机制存在，但 JS/config concat detector未覆盖 AC3完整变量族，不能证明全部 active `$cr_dir` expressions已被候选扫描。见 P1-2。 |
| AC8 | **FAIL** | Resolver本身仍不迁移/重命名/删除 legacy目录；但真实 CLI不能认证 completed legacy，会把合法历史目录稳定阻断而非按契约开启 canonical new run。见 P1-1。 |
| AC9 | **FAIL** | 模块 API在显式传入 test helper构造的 `trackerBindings` 时可区分 unfinished/completed；runner唯一 CLI既无输入参数也无 parser路径承载这些 bindings，completed-legacy recovery在生产链不可达。见 P1-1。 |
| AC10 | **FAIL** | Current ledger exact equality与 `active-canonical=[]` 为绿，但 `storyId + "-" + title + "-code-review"`、`crDir = story_id + "-" + filename + "-code-review"` 等仍不进入候选集合。见 P1-2。 |
| AC11 | **FAIL** | Focused suite只用直接模块调用验证 completed legacy，并显式证明不传 `trackerBindings` 会 block；未对 runner实际 CLI执行同一 completed-legacy成功路径。scanner mutation也未覆盖 bare/title/filename concat matrix。见 P1-1、P1-2。 |
| AC12 | PASS | Round 3改动未改变 report basename、CR algorithm、round numbering或 approval rules。 |

## Findings（发现）

### P1-1 — Runner 唯一 CLI 无法携带 `trackerBindings`，completed legacy 恢复在生产链不可达

- **Classification:** `patch`
- **Violated:** AC8、AC9、AC11；shared contract recovery matrix中的“completed legacy only → canonical new run”；runner Step 0“唯一 executable resolver”约束。
- **Location:** `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs:18-24,386-452,521-568,628-667`；`assets/source/speclite/sdlc-skills/4-implementation/speclite-goal-orchestrator-epic-story-code-review-runner/references/runner-workflow.md:13-18`；`test/code-review-contract.test.ts:507-542,732-760,955-980`。
- **Evidence:** `resolveCrDirectory()`把 `trackerBindings` 传入 `validDoneFinalizer()`，而 `validTrackerChangeSet()`在 bindings缺失时必定返回 false。Runner Step 0 的唯一 invocation只有 `--project-root`、`--implementation-artifacts`、`--story-id`、`--review-series`；`parseArguments()`也只返回这四项，不存在 tracker binding输入、storyKey/configured workflow identity输入或从可信 runtime context读取它们的路径。
- **Executable consequence:** CLI遇到一个结构与hash完全合法的 `DONE` legacy finalizer时，`validDoneFinalizer()`仍因 `trackerBindings === undefined`返回 false；随后 `inspectCandidate()`把 `result: DONE`但认证失败的 finalizer转成 `invalid-current-series-evidence`，最终输出 `legacy-current-series-evidence-invalid`并HALT。契约要求的 completed legacy → canonical new run因此永远不可达。
- **Why focused is false-green:** completed legacy正向测试在 `test/code-review-contract.test.ts:518-527`直接调用模块函数并注入 helper生成的 bindings；同文件 `:738-741`已经明确断言不传 bindings时失败、传入时才成功。CLI测试只覆盖 inspection I/O diagnostic，没有覆盖 completed legacy success，也没有证明 runner可提供 required bindings。
- **Required closure:** 在 shared contract、runner与resolver之间建立唯一且可执行的 caller-frozen tracker identity输入契约，并让 CLI以稳定、可验证、无猜测的方式消费它；或者在不引入第二 authority的前提下由resolver从已冻结的可信 context解析。必须新增真实 CLI/runner-path的 completed legacy RED/GREEN，断言 canonical selection、zero migration与stable failure cases。不得用放宽 tracker authenticity或默认猜测 workflow tracker来修复。

### P1-2 — JS/config concat scanner仍遗漏 bare与 `storyTitle/storyFilename` 变量族

- **Classification:** `patch`
- **Violated:** AC7、AC10、AC11；Round 3 Evaluation Finding #7 的 bare/prefixed/dotted + real shell/template/JS/config concat GREEN criteria。
- **Location:** `test/code-review-contract.test.ts:1115-1151,1497-1514`。
- **Evidence:** `titleBearingTokenPatterns()`的通用 `titleName` 已包含 bare `title/name/slug/filename` 与 `storyTitle/storyFilename`，但 JS concat regex（line 1508）、array join（1509）和 config assignment（1510）没有复用该集合，仍只接受 `storyKey/storySlug/storyName`及少量变体。专用 split regex只覆盖固定 `{filename}`或`story.slug`例子，不能覆盖一般 `storyId + "-" + title + "-code-review"`、`storyId + "-" + storyFilename + "-code-review"`、`crDir = story_id + "-" + filename + "-code-review"`。
- **Why focused is false-green:** mutation matrix对 bare family只测试相邻 placeholder；`js-real-split`使用引号中的 `{filename}`，被专用 regex命中；`config-assignment`仍使用旧的 `story_key`。它没有注入 bare/title/filename作为真实 JS/config变量的 concat，也没有对 `storyTitle/storyFilename` concat做未分类 fail-close。
- **Impact:** 在 frozen candidate roots或 explicit files新增上述 active producer时，candidate集合可保持不变，ledger exact equality与 `active-canonical=[]`继续通过；因此 current negative scan仍不能证明 title/name/slug/filename全部不参与目录推导。
- **Required closure:** 让 JS、array、config与真实 split concat patterns复用完整 bounded title变量族，并逐 family加入 `title/name/slug/filename`及 `storyTitle/storyFilename`真实变量 mutation；每个 mutation必须先被 detector捕获，再因未分类稳定失败。保持 frozen roots、explicit files、no-follow inventory与 Story 11.10排除不变。

## Round 1–3 Closure Audit（Round 1–3 闭环审计）

| Historical finding group | Result | Acceptance evidence |
| --- | --- | --- |
| Ancestor containment、candidate/artifact no-follow与stable/redacted I/O | CLOSED | Current resolver逐段 containment；blocked matrix继续覆盖unsafe/I/O并冻结reason。 |
| Current-series artifact family/frontmatter/round identity与malformed intent | CLOSED | Known-family current intent先于strict identity，malformed canonical/legacy均fail-close；ordinary notes/other Story/other series保持unrelated。 |
| CR04/CR05 evaluation lineage、predecessor hash与completion gate freshness | CLOSED at module level | Current resolver精确核对evaluation basename/hash及真实 predecessor bytes；未发现本轮新反例。 |
| Required tracker authenticity | **PARTIAL** | 模块API验证exact binding与真实afterHash；CLI/runner无法供应bindings。由 P1-1接续。 |
| Leaf frozen context、reviewSeries与extra-field rejection | CLOSED | 唯一test-only adapter冻结六字段exact schema；CR01–06 callback-zero矩阵为绿。 |
| 14类blocked stable reason与runner-wide zero mutation | CLOSED | Current matrix冻结`issueId/category/reason`并保持controlled-tree exact equality。 |
| 八包 source/installed activation hard gate | CLOSED | ZH/EN source正向语义、两个fresh-install IDE active `SKILL.md` byte parity/activation与installed ENOENT均在focused suite。 |
| Bounded candidate scanner | **PARTIAL** | Placeholder与三个专用split样例已补；完整JS/config变量族仍漏扫。由 P1-2接续。 |

## Todo And Drawer Boundary（Todo 与 Drawer 边界）

- Focused suite的 `4 todo`仍为既有CR state-machine基建项：zero-TODO closeout E2E、CR06缺CR04/CR05 halt、same-round supersession、tracker rollback。它们不是本轮test failure，也不替代P1-1/P1-2的修复；本层不新增或升级CR TODO。
- 外部 `assets/source/speclite/core-skills/speclite-drawer-er-modeler/` 与 zip导致live counts及 fixed-count expectations漂移。Completion gate对此使用 `PASS_EQUIVALENT` 的隔离理由仍成立；本层未运行affected/full，也不要求修改drawer、zip、workspace mirrors或fixed-count assertions。

## Completion Gate Assessment（完成门禁评估）

- Current completion gate对drawer fixed-count drift的外部例外可接受，focused `36 passed / 4 todo`也已由本层独立复现。
- 但gate关于“completed legacy canonical restart”和“bounded/full classified scan”的PASS声明高于真实CLI及scanner evidence。P1-1/P1-2关闭并经fresh Reviewer/Evaluator双PASS前，该gate不得作为CR06 allowing evidence。

## Owner Gate（Owner 门禁）

**NONE**。两个正确行为都已由Story AC、shared contract recovery matrix与Round 3 Evaluator GREEN criteria唯一确定；无需产品、Architecture或scope选择。Fixer应限定在Evaluator重新授权的resolver/runner input contract、focused tests/candidate detector及必要的机械ledger与gate evidence，不得触碰Story 11.10、drawer、workspace mirrors或fixed-count baseline。

## Conclusion（结论）

- **结论：不通过（FAIL）**
- **P1：2**
- **P2：0**
- **Owner Gate：`NONE`**
- 本结果仅代表fresh Acceptance Auditor Round 4；仍须等待同轮Blind Hunter、Edge Case Hunter、Aggregator与fresh Evaluator正式裁决。只有latest Reviewer/Evaluator双PASS后，outer orchestrator才可进入CR04、CR05与CR06。
