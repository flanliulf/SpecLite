---
Story: 11-9
Round: 2
Date: 2026-09-05
Model Used: OpenAI GPT-5.6 Sol (gpt-5.6-sol)
Review Source: 11-9-code-review-summary-20260905-round-2.md
Review Model: GPT-5.6
Type: Code Review Evaluation
Revision: 2
Revision Reason: Fixer HALT 后按 current installer surface 更正 Finding #5 授权语义
---

## Evaluation Summary（评估总结）

对 Story 11-9 的第 2 轮 CR 代码审查结果（复审）进行独立逐条评估。已核对 Round 2 summary、Blind/Edge/Acceptance 三层结果、Story AC、Round 1 evaluation 与 Fix Summary、current resolver、shared CR contract、runner/CR01–06 workflows、focused tests、installed fixture 与 classified ledger。六项 finding 均能由当前代码或测试反例直接复现，且均属于 Round 1 已授权但尚未完整闭合的 Story 11.9 contract/evidence，不是新需求。

评估结论：**6 个 P1 root cause 全部确认，0 个 P2，0 个 finding 整体驳回；Finding #5 的 “installed ZH/EN” 子主张判为部分误报并已收窄；Owner Gate 为 `NONE`；整体裁决为 `FIX_REQUIRED`。** Fixer 只能执行本文冻结的 bounded patch 与 RED→GREEN matrix；完成后必须由 outer Flow Gate owner 独立刷新 completion gate，再进入 fresh Reviewer/Evaluator。当前 `31 passed / 4 todo` 仅证明已覆盖路径为绿，不能反证六个未覆盖分支。

核证身份：`HEAD=ff7528d3f9ec34072bb669ee79f7569345c23d47`；Review Source SHA-256=`b9300bf3fd949f83e4cc2d31103c516b3e80e61837f0727ebea7ab2d8cf387aa`。

---

## Previous Round Closure Confirmation（上轮问题回顾确认）

### Round 1 #1 ancestor containment：CLOSED

`inspectRootPath()` 已逐段执行 no-follow `lstat`、real-directory 与 realpath containment；普通 missing descendant 保持 canonical success，project 内/外 symlink 与 non-directory ancestor 均稳定阻断。本轮未发现反例。

### Round 1 #2 legacy current-series evidence：PARTIAL

legacy 的 empty/unrelated/other-series/malformed/unbound 已阻断；但 `resolveCrDirectory()` 仅对 `legacy` 计算 `invalidLegacy`，同类非法 evidence 位于 canonical candidate 时未进入 failure branch。由本轮 Finding #1 继续阻塞。

### Round 1 #3 finalizer authenticity：PARTIAL

canonical artifact basename、leading frontmatter identity、round 与基础 source/hash 字段形状已验证；但完整 finalizer v2 state、predecessor/gate 文件存在性、no-follow type、同轮 identity/state 与 canonicalized content hash 尚未验证。由本轮 Finding #2 继续阻塞。

### Round 1 #4 frozen context propagation：PARTIAL

runner 已向 CR01–06 传递 `crDir`、`canonicalCrDir`、`compatibilityMode`、`legacyArtifactPaths`，六个 workflow 亦有 write-before HALT 文案；但 current tests 只验证 invocation/prose substring，没有执行 leaf consumer fail-close oracle。由本轮 Finding #3 继续阻塞。

### Round 1 #5 stable/redacted I/O：CLOSED

root/candidate/artifact inspection 与 CLI unexpected failure 已收敛为 stable、redacted、single-JSON diagnostic；本轮未发现新的泄漏或异常逃逸。

### Round 1 #6 runner-wide zero mutation：PARTIAL

controlled-tree snapshot 与 mutation callback oracle 已建立，但只运行一个 `legacy/unbound.md` synthetic case，未覆盖冻结的全部 blocked classes。由本轮 Finding #4 继续阻塞。

### Round 1 #7 installed CR01–06 parity：PARTIAL

`.agents/.claude` fresh-install fixture 已核对 contract reference、resolver、runner workflow 与六个 leaf workflows；但没有核对八个 package 的 **installed active `SKILL.md`**。同时，canonical source 的 ZH `SKILL.md` / EN `SKILL.en.md` activation semantics 也没有被成对核对。经 `src/fs/copy-tree.ts:isInstallableCanonicalPackageFile()`、`src/ide/target-writer.ts` 与既有 installer tests 复核，`SKILL.en.md` 明确属于 source-only mirror，不在 installed surface；因此原审查要求的 “installed ZH/EN byte parity” 语义过宽，修订为“source ZH/EN activation semantic parity + installed active `SKILL.md` byte parity + installed EN absence invariant”。由本轮 Finding #5 继续阻塞。

### Round 1 #8 full classified scan：PARTIAL

frozen roots、no-follow regular-file inventory、exact ledger 与 fail-close classification 已建立；但 candidate family regex 未识别中文/underscore concrete path、分段 concat 与 alternate placeholder。由本轮 Finding #6 继续阻塞。

### Historical CR TODO（历史 CR TODO，非阻塞）

| # | 发现 | 状态 | 评估意见 |
|---|------|------|---------|
| Existing-1 | zero-TODO closeout E2E | 既有 `it.todo` / 非本轮 | 保持既有状态，不纳入本轮 Fixer。 |
| Existing-2 | CR06 缺 CR04/CR05 halt | 既有 `it.todo` / 非本轮 | 保持既有状态，不纳入本轮 Fixer。 |
| Existing-3 | same-round supersession | 既有 `it.todo` / 非本轮 | 保持既有状态，不纳入本轮 Fixer。 |
| Existing-4 | tracker rollback | 既有 `it.todo` / 非本轮 | 保持既有状态，不纳入本轮 Fixer。 |

---

## Finding #1 Evaluation（发现 #1 评估）

### Review Original（审查原文）

> **[P1] Canonical candidate 的 malformed/unbound current-series evidence 被静默放行**
> - 来源：blind + edge
> - 分类：patch

### Evaluation Conclusion（评估结论）：✅ 确认有效 — 需要修复（P1 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性：准确**

`resolve-cr-directory.mjs:102-108` 只从 `legacy` 计算 `invalidLegacy`；`canonical` 的 `evidenceState === "no-current-series-evidence"` 不进入任何 failure branch，最终在 `:147` 返回 canonical success。与此同时，`inspectCandidate():246-292` 会把 canonical-family basename 的 malformed/wrong identity/wrong round/non-current disposition 归并为同一个 `no-current-series-evidence`。`test/code-review-contract.test.ts:611-654` 的对应负例全部只放入 legacy directory，因此无法捕获 canonical 分支。

**严重性判断：合理**

该分支允许 runner 在无法唯一绑定 current Story/series/round 的 canonical run 上继续写入，直接破坏 AC4、AC9、AC11 的 ambiguity stop 与 single-run identity，属于交付阻塞的 P1。

**修复建议：可行**

Fixer 必须区分“canonical 目录真正 empty/unrelated，可作为 new run”与“出现 current-artifact signal 但证据 malformed/unbound”。后者无论 canonical 或 legacy 均使用既有 CR-local issue identity stable block。必须覆盖 canonical malformed、wrong-story、wrong-series、wrong-round、non-current disposition、arbitrary current-series family 与 oversized round；不得把普通 notes/其他 Story 的无关文件误判为 current run。

**误报评估：非误报**

控制流和测试缺口均可直接定位，且是 Round 1 #2/#3 的未闭合分支。

---

## Finding #2 Evaluation（发现 #2 评估）

### Review Original（审查原文）

> **[P1] `DONE` finalizer 未验证完整 v2 状态、predecessor 文件与真实 hash**
> - 来源：blind + edge
> - 分类：patch

### Evaluation Conclusion（评估结论）：✅ 确认有效 — 需要修复（P1 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性：准确**

`validDoneFinalizer()`（`resolve-cr-directory.mjs:345-367`）只验证 `result: DONE`、四个 source basename、completion gate basename 与五个 `sha256:<64 hex>` 字面形状。它没有验证 shared contract `Finalizer Report` 要求的 `storyKey`、`generatedAt`、`modelUsed`、`evaluationVerdict`、`scopeHash`、`completionGateResult`、`completionGateGeneratedAt`、`trackerWrites`、`trackerChangeSet`、`trackerRereadConsistent`，也没有 no-follow 读取 source/gate、验证其 regular-file type、same Story/series/round current identity、允许 state 或真实 canonicalized hash。测试 helper `currentFinalizerArtifact()`（`test/code-review-contract.test.ts:1140-1161`）以不存在的 predecessor 与全 `a` 假 hash 仍构造“completed”证据。

**严重性判断：合理**

伪造或截断的 finalizer 可把 unfinished legacy 错判为 completed，并使 resolver切换到 canonical sibling 开新 run，破坏 AC8/AC9 的 no-migration 与 lifecycle continuity，属于 P1。

**修复建议：可行**

只有完整合法的 `speclite.cr-finalizer.v2` 才可贡献 `DONE`：

1. finalizer 自身 identity/state 完整，`storyKey` 与全部 current artifacts 一致，`generatedAt` 为合法时间，`modelUsed` 非空，`evaluationVerdict ∈ {PASS, PASS_WITH_DEFERRED_TODOS}`，`scopeHash` 合法；
2. `completionGateResult ∈ {PASS, PASS_EQUIVALENT}`、gate freshness字段合法，`trackerRereadConsistent=true`，required tracker writes/change set 完整且逐项 reread consistent；
3. review/evaluation/CR04/CR05 predecessor 必须是同一 candidate 内 no-follow regular files；completion gate 必须是规定 flow-gates root 内 no-follow regular file，全部路径不得逃逸或别名；
4. 各 predecessor/gate 的 schema、artifact type、Story/series/round、current disposition与允许 result/verdict必须一致；
5. 所有 `*SourceHash` 必须按 shared contract `Hash Canonicalization` 对实际文件内容重新计算并精确匹配；missing、wrong type、wrong binding、illegal state、stale gate 或 hash mismatch 均 stable block。

不得修改 shared schema、hash canonicalization、finalizer algorithm 或 tracker policy；只把既有合同变成 resolver 的 authenticity check。

**误报评估：非误报**

当前 helper 的 nonexistent files + fake hashes 是直接反例。

---

## Finding #3 Evaluation（发现 #3 评估）

### Review Original（审查原文）

> **[P1] Leaf frozen context 只有 prose/substring assertion，缺少可执行 fail-close consumer oracle**
> - 来源：edge
> - 分类：patch

### Evaluation Conclusion（评估结论）：✅ 确认有效 — 需要修复（P1 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性：准确**

`test/code-review-contract.test.ts:771-797,913-927` 只检查 runner invocation 与 leaf workflow 的中文 substring。当前没有执行 leaf preflight 的 test oracle，因此无法证明四字段缺失、值不等、mode/path/set 不相容、Story/series binding mismatch 或 title fallback 出现时，artifact/temp/backlog/tracker mutation callback 在真实 leaf boundary 前不可达。

**严重性判断：合理**

AC4/AC5 要求下游消费同一个 frozen `$cr_dir`，prose 存在不能替代 fail-close behavior evidence；该 gap 可让 consumer re-derive 或忽略 mismatch 而测试继续为绿，属于 P1。

**修复建议：可行**

在 focused test 内建立唯一共享、可执行的 test-only leaf preflight adapter，并对 CR01–06 全部重放；不得新增第二套 production resolver或改变 leaf review/fix/closeout algorithm。该 oracle必须消费 runner 的已解析结果和四字段，验证：字段完整；`canonicalCrDir` 为 current Story numeric-only root；`compatibilityMode` 与 `crDir`/legacy set相容；`legacyArtifactPaths` 为 project-relative、唯一、byte-wise稳定集合；Story/series binding一致；不得存在 title/slug/filename fallback。任一缺失或 mismatch 必须返回同一稳定 HALT，并在每个 leaf 的 artifact/temp/backlog/tracker mutation callback 前终止，callback为零。单纯增加或调整 prose substring 不算 GREEN。

**误报评估：非误报**

当前断言没有任何 consumer behavior execution，单来源 finding 仍有充分代码证据。

---

## Finding #4 Evaluation（发现 #4 评估）

### Review Original（审查原文）

> **[P1] Runner-wide zero-mutation 只验证单一 synthetic unbound case**
> - 来源：edge + auditor
> - 分类：patch

### Evaluation Conclusion（评估结论）：✅ 确认有效 — 需要修复（P1 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性：准确**

标题为 “every blocked preflight” 的测试（`test/code-review-contract.test.ts:711-738`）只创建一个 `legacy/unbound.md` case，并仅调用一次 `runResolverPreflight()`。Round 1 冻结的 dual、multi、ancestor/candidate unsafe、malformed 与 I/O blocked classes 未通过同一 mutation callback-zero + controlled-tree exact snapshot oracle。

**严重性判断：合理**

resolver unit failure 只能证明 reason，不足以证明 runner ordering 在所有 block branch 都先于 goal/temp/progress、Story 与 tracker mutation；completion gate 的 runner-wide 声明因此缺少可重放证据，违反 AC9/AC11，属于 P1。

**修复建议：可行**

参数化同一个 runner preflight adapter，至少覆盖：dual canonical+unfinished legacy、multi unfinished legacy、canonical malformed/unbound、legacy malformed/unbound、ancestor internal/external symlink、ancestor non-directory、candidate symlink/non-directory、artifact symlink/non-file/read failure、root listing/inspection I/O failure与 invalid project root。每例都必须断言 stable issue/reason、mutation callback恰零次，并对 project fixture（以及涉及 external symlink时的 external fixture）做 path/type/size/content SHA-256/tree before/after exact equality。不得修改 runner algorithm。

**误报评估：非误报**

测试体与标题明显不一致，且 reviewer两层独立命中。

---

## Finding #5 Evaluation（发现 #5 评估）

### Review Original（审查原文）

> **[P1] Entry activation parity 未按 installer 的真实 source/installed surface 分层验证**
> - 来源：edge
> - 分类：patch

### Evaluation Conclusion（评估结论）：✅ 根因确认有效、原修复范围部分误报 — 需要 bounded 修复（P1 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性：基本准确，但 “installed ZH/EN” 不准确**

Round 2 review 正确发现 current fixture 未从 entrypoint证明 contract/workflow activation，但把 `SKILL.en.md` 也要求安装到 `.agents/.claude` 是错误的 scope inference。`src/fs/copy-tree.ts:7-9,90-96` 明确把 `SKILL.md` 设为 required installable entry，并排除 `SKILL.en.md`；`src/ide/target-writer.ts:155-157,180-213` 使用同一 predicate计算 installed package hash和写入 projection；`test/installed-skill-data-surface.test.ts:20-29`、`test/ide-target-writer.test.ts:37-79,85-155` 进一步把 `SKILL.en.md` exclusion/ENOENT 固定为 installer contract。因此 installed surface 只有 active `SKILL.md`，EN 文件是 canonical source mirror。

真实未闭合点有两部分：一是 canonical source 中八个 package 的 `SKILL.md` 与 `SKILL.en.md` 尚未通过测试证明引用同一 current contract/workflow、具有等价 activation/禁止 title fallback 语义；二是两个 IDE target 尚未把 installed active `SKILL.md` 纳入 source-to-installed byte parity 和 activation重放。二者均可在不改变 installer contract的前提下由 focused test闭合。

**严重性判断：合理**

最终 active `SKILL.md` 可能仍为旧版或未加载 changed workflow，而内部 workflow bytes 同步测试仍为绿；source EN mirror也可能与 canonical ZH入口在 activation语义上漂移。这直接影响 AC7 的全 active expression审计与 AC11 的 source-to-installed evidence closure，P1仍合理。它不授权改变 installer file surface。

**修复建议：可行**

仅扩展现有 focused test，采用唯一语义：

1. **Source parity**：对 shared contract、runner、CR01–06 八个 package 的 canonical `SKILL.md` 与 source-only `SKILL.en.md` 核对相同 contract/workflow reference、numeric-only `$cr_dir` activation、four-field frozen-context handoff（适用处）与 no-title-rederive semantics；这里是语义 parity，不要求中英文逐字节相等。
2. **Installed parity**：在 `.agents/skills` 与 `.claude/skills` 两个 fresh target 中，只对 installer定义的 active `SKILL.md` 执行 source-to-installed deterministic byte parity，并从该 installed `SKILL.md` 重放 current contract/workflow activation；现有 contract/resolver/workflows仍逐字节核对。
3. **Exclusion invariant**：明确断言两个 IDE target 的八个 package均不存在 installed `SKILL.en.md`（`ENOENT`），与 `isInstallableCanonicalPackageFile("SKILL.en.md") === false` 一致。

不得修改 `src/fs/copy-tree.ts`、`src/ide/target-writer.ts` 或任何 installer/test contract；不得为使测试通过而安装 `SKILL.en.md`、修改 canonical entrypoint或 workspace `.agents/.claude` mirrors。

**误报评估：部分误报**

entrypoint activation evidence gap非误报；“installed ZH/EN byte parity”及“installed `SKILL.en.md` 应存在”是误报，已从修复义务中删除。该 scope correction 不改变 P1 数量，因为 underlying AC7/AC11 evidence gap仍成立。

---

## Finding #6 Evaluation（发现 #6 评估）

### Review Original（审查原文）

> **[P1] Candidate scanner 漏中文、下划线、分段拼接与 alternate placeholder**
> - 来源：blind + edge + auditor
> - 分类：patch

### Evaluation Conclusion（评估结论）：✅ 确认有效 — 需要修复（P1 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性：准确**

`titleBearingTokenPatterns()`（`test/code-review-contract.test.ts:1106-1114`）的 concrete regex 只接受 ASCII `[a-z][a-z0-9-]*`，placeholder regex要求变量 token 与 separator相邻。它会漏掉 `11-9-中文-code-review`、underscore/space title、`storyId + "-" + storySlug + "-code-review"`、quoted concat、`.join("-")` 与 alternate placeholder。由于 candidate集合本身由这些 regex决定，ledger exact equality无法感知完全未进入 `actual` 的 active producer。

**严重性判断：合理**

该 false-green 直接破坏 AC7、AC10、AC11 的 full active-pattern closure；三层共同命中，P1合理。

**修复建议：可行**

保持现有 frozen roots与 explicit files不变，只扩展 bounded detector/token normalization及其 mutation oracle。最小冻结 families：

- concrete：numeric Story ID 后的任意非路径分隔 title，包括中文、underscore、space与混合标点；
- placeholder：既有 `{storyId}`/`{story_id}` 与 title/key/slug/name，加上等价的 angle/double-brace/dotted alternate placeholder；
- concat：shell variable 拼接、JS/TS `+` quoted concat、template interpolation分段与 array `.join("-")`；
- config/assignment：在 CR-directory-producing assignment/command上下文中的分段 value。

逐 family 向临时 regular-file candidate 注入 semantic-equivalent mutation，必须先被 detector发现，再因未分类而 fail-close；同时保持 frozen corpus raw-byte matches 与 ledger双向 exact equality、active-canonical为空，以及 duplicate/locator drift/symlink/non-file/read/scan error fail-close。不得扩大扫描到 Story 11.10、drawer、workspace mirrors、archive/history或 generic repository-wide search。

**误报评估：非误报**

现有 regex 与具体漏检输入可机械复现。

---

## Bounded Fix Authorization（唯一 Bounded 修复授权）

### Allowed Files（允许修改文件）

Fixer 只可修改以下文件；除本 evaluation 追加 Fix Summary 外，任何其他路径均禁止写入：

1. `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs`
2. `test/code-review-contract.test.ts`
3. `test/fixtures/code-review-contract/title-bearing-path-ledger.json`（仅当 detector修正导致 current frozen classified match的 locator/token发生机械变化时；不得借此重分类 active finding）
4. 本文件 `11-9-code-review-evaluation-20260905-round-2.md`（只允许追加 Fix Summary）

Finding #3 的 leaf executable evidence 必须采用 `test/code-review-contract.test.ts` 内唯一共享的 test-only preflight adapter并逐 CR01–06执行；本轮不授权修改六个 leaf workflow、runner workflow或新增 runtime/public CLI。若 test-only adapter不足以表达 current contract，Fixer必须 HALT并返回 Evaluator，不得自行新增脚本或扩白名单。

### Explicitly Forbidden（明确禁止）

- 不得修改 shared contract、runner/CR01–06 `SKILL.md`、`SKILL.en.md`、workflow、CHANGELOG、templates、module help、README/current docs、release manifest、SPEC、Story、tracker、completion gate、root goal records或其他 CR artifacts。
- 不得修改 report basenames、artifact schema、CR review/evaluation/fix/rules/TODO/finalizer algorithm、round numbering、approval/confirmation policy、dependencies或 public CLI。
- 不得扩展 Story 11.10、external `speclite-drawer-er-modeler/` 与 zip、workspace `.agents/.claude` mirrors、fixed-count baselines、archive/history。
- candidate scan若发现白名单外 active residual，Fixer必须 HALT并返回 Evaluator重新裁决，不得直接修复 residual。

---

## RED / GREEN Verification Authorization（RED / GREEN 验证授权）

### RED Evidence（红灯证据）

Fixer 必须先在 production patch 前增加失败断言并记录 RED。现有 `31 passed / 4 todo` 不得充当本轮 RED。RED至少逐项证明：

1. canonical 中 malformed、wrong-story、wrong-series、wrong-round、non-current disposition、arbitrary current-family 与 oversized round evidence 当前错误 success；
2. 缺少完整 finalizer v2/state字段、predecessor/gate missing或非 regular/no-follow、wrong Story/series/round/state、stale gate、fake/mismatched canonicalized hash当前仍可伪造 `DONE`；
3. CR01–06 任一收到四字段缺失、mismatch、mode/path/set或Story/series binding不相容、title fallback时，current suite没有 executable callback-zero oracle；
4. dual、multi、ancestor/candidate unsafe、canonical/legacy malformed/unbound、artifact/root I/O与 invalid project root尚未全部经过同一 runner mutation-zero + full snapshot matrix；
5. source ZH/EN activation semantics未成对核对；`.agents/.claude` installed active `SKILL.md` 未纳入 byte parity/activation重放，而 installed `SKILL.en.md` 按既有 contract本就应为 ENOENT；
6. 中文、underscore/space、shell/JS concat、template/config concat、`.join("-")` 与 alternate placeholder当前可不进入 candidate集合，从而绕过 unclassified fail-close。

### GREEN Criteria（绿灯标准）

1. ordinary empty/unrelated canonical new-run仍 read-only success；canonical或legacy一旦含 malformed/unbound current artifact signal即 stable block，zero write，且 reason/issue保持有限、redacted、deterministic。
2. 合法 current unfinished legacy仍原位 resume；只有完整 finalizer v2 identity/state、真实存在且同轮绑定的 no-follow regular predecessor/gate、允许 verdict/gate/tracker state与逐文件 canonicalized SHA-256全部成立时，latest legacy才可判 `DONE`；任一缺失或不一致稳定阻断。
3. 唯一 shared test-only leaf preflight adapter逐 CR01–06执行；完整冻结 context允许进入 callback，所有缺失/mismatch/mode-path-set/identity/title fallback case均 stable HALT且每类 leaf mutation callback恰零次。
4. 同一 runner preflight adapter参数化覆盖本文 Finding #4 的全部 blocked classes；每例 mutation callback恰零次，project/external fixture的 path/type/size/bytes/hash/tree before/after exact equality。
5. canonical source中 shared contract、runner、CR01–06 的 `SKILL.md` / `SKILL.en.md` 通过 activation semantic parity；`.agents` 与 `.claude` fresh install只对 active `SKILL.md` 及现有 contract/resolver/workflows做 source-to-installed byte parity，并从 installed `SKILL.md` 重放 current workflow/contract activation、once-only/four-field/no-title-rederive invariant；两个 target的 `SKILL.en.md` 均明确为 ENOENT。
6. bounded detector覆盖本文 Finding #6 的 concrete/placeholder/concat/config families；逐 family mutation均被发现且未分类即失败，frozen roots/explicit files、no-follow regular inventory、byte-wise locator、ledger双向 exact equality与 active-canonical zero保持成立。
7. focused test最终 PASS，且本轮不新增或改写四个既有 `it.todo`；白名单 `git diff --check` PASS。

### Allowed Verification（允许验证）

- `npx vitest run test/code-review-contract.test.ts --reporter=dot`
- 上述 test 明确依赖且用于 fresh-install parity 的精确现有 install/update test（只有 focused file无法执行该路径时才允许）
- 对 Allowed Files 的 `git diff --check`
- 只读、精确、仍限定 frozen roots的 candidate-scan probe

不得运行 `npm run build`、full suite、packaging或 canonical governance。Fixer不得刷新 completion gate；由 outer Flow Gate owner在修复后独立刷新。

---

## Overall Evaluation Conclusion（整体评估结论）

### Required Fixes（需要修复，阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | canonical malformed/unbound evidence fail-open | P1 | **P1** | canonical 非法 current signal绕过 `invalidLegacy`，可在身份不明时继续写入。 |
| 2 | `DONE` 不完整且未验证真实文件/hash | P1 | **P1** | fake finalizer可把 unfinished legacy误判为 completed。 |
| 3 | leaf frozen context 无 executable fail-close oracle | P1 | **P1** | prose/substring不能证明 consumer write-before HALT。 |
| 4 | blocked preflight zero-mutation matrix不完整 | P1 | **P1** | 单一 synthetic case不足以支撑 runner-wide声明。 |
| 5 | entry activation parity未按真实 installer surface分层 | P1 | **P1** | source ZH/EN需语义一致；installed只验证active `SKILL.md`，EN保持ENOENT。 |
| 6 | candidate scanner semantic families不完整 | P1 | **P1** | 中文、underscore、concat与alternate placeholder可绕过 ledger。 |

### CR TODO（建议纳入 CR TODO，非阻塞）

无。本轮六项均为当前 Story 11.9 P1，不得延迟；四个既有 `it.todo` 保持既有边界，不在本轮处理。

### False Positives（可忽略/误报）

| # | 审查子主张 | 原始严重性 | 忽略理由 |
|---|------------|------------|----------|
| 5a | `.agents/.claude` 应安装并 byte-compare `SKILL.en.md` | P1 的部分修复义务 | `isInstallableCanonicalPackageFile("SKILL.en.md") === false`，target writer 与既有 tests均固定 EN mirror不属于 installed surface；应断言 ENOENT，不得扩 installer。 |

### Evaluation Decision（评估决定）

- **Finding #1（canonical malformed evidence）**：确认 P1；统一 canonical/legacy current signal fail-close，同时保留真正 empty/unrelated canonical new-run。
- **Finding #2（DONE authenticity）**：确认 P1；必须验证完整 v2/state、predecessor/gate no-follow files、identity与真实 canonicalized hash。
- **Finding #3（leaf executable context）**：确认 P1；建立唯一 shared test-only executable preflight oracle并逐 CR01–06重放，不修改 leaf algorithm。
- **Finding #4（zero-mutation matrix）**：确认 P1；覆盖完整 blocked classes且每例全树 exact zero delta。
- **Finding #5（entry activation parity）**：根因确认 P1、原范围部分误报；source核对 ZH/EN activation semantics，两个 IDE target只核对 installed active `SKILL.md` byte parity/activation，并断言 installed EN缺失。
- **Finding #6（bounded scanner）**：确认 P1；仅在既有 frozen roots内补中文/underscore/concat/alternate placeholder families及 mutation fail-close。
- **Owner Gate**：`NONE`。六项 observable behavior均由 Story AC、Round 1 evaluation与 shared contract唯一确定。
- **整体裁决**：`FIX_REQUIRED`。在 bounded Fixer、outer completion gate刷新及 fresh Reviewer/Evaluator双 PASS 前，不得进入 CR04、CR05或 CR06。

---

## 修复执行记录

### 修复执行记录
- **Date**: 2026-09-05
- **Model Used**: OpenAI GPT-5.6 Sol (gpt-5.6-sol)
- **Fix Items**: 6
- **Mode**: patch
- **Evaluation Revision**: Revision 2
- **Evaluation Revision SHA-256**: `958cc7eb64dc4cd14914f028a96589503e2040c4bbc80e0cc22571826114472f`

### Revision Provenance（修订来源）

- Fixer 最初按 Revision 1 为 Finding #5 增加 installed `SKILL.en.md` assertion，focused test 以 `ENOENT` 失败；只读核对 `src/fs/copy-tree.ts` 与 `src/ide/target-writer.ts` 后确认该要求超出 installer 真实 surface 且需修改白名单外文件，因此依 evaluation 的 HALT 条款立即停止并返回 Evaluator。
- Evaluator 随后发布 Revision 2，将 Finding #5 唯一语义修订为 canonical source ZH/EN activation semantic parity、installed active `SKILL.md` byte parity/activation replay，以及 installed `SKILL.en.md` ENOENT invariant；Owner Gate 仍为 `NONE`，Allowed Files 未扩展。Fixer 重新读取 Revision 2 后继续。

### RED Evidence（红灯证据）

- 在 production patch 前先增加失败断言并运行 `npx vitest run test/code-review-contract.test.ts --reporter=dot`。
- RED 结果：`3 failed / 30 passed / 4 todo`。失败分别机械证明 canonical malformed current signal仍被成功放行、fake/incomplete `DONE` 仍可被当作 completed，以及 detector/ledger 对新增候选缺少闭环。
- Revision 1 Finding #5 的 installed EN assertion另产生精确 `ENOENT`，该结果用于触发上述合规 HALT，不作为 Revision 2 的目标 GREEN 语义。

### Fix Results（修复结果）

1. **Canonical malformed fail-close**：resolver 现在区分真正 empty/unrelated canonical 与 Story-bound current-artifact signal；canonical/legacy 的 malformed、wrong binding/series/round/disposition、arbitrary current-family 与 oversized round 都使用既有 CR-local issue identity稳定阻断，同时其他 Story 的合法独立 artifact保持 unrelated。
2. **Authentic latest DONE**：只有完整 `speclite.cr-finalizer.v2` 才贡献 `DONE`；resolver 验证 Story/series/round/current identity、`storyKey`、时间、model、verdict/scope/gate/tracker状态，no-follow 读取同 candidate predecessor 与规定 flow-gates root 的 completion gate，逐文件按 shared contract做 NFC/LF/trim-end canonicalized SHA-256并核对 freshness。
3. **CR01–06 executable frozen context**：focused test 新增唯一 shared test-only leaf preflight adapter，逐 CR01–06重放完整合法 context，并对字段缺失、值不等、mode/path/set、Story binding 与 title fallback mismatch断言同一稳定 HALT及 mutation callback零调用。
4. **Runner-wide zero mutation**：同一 `runResolverPreflight()` 参数化覆盖 dual、multi、canonical/legacy malformed、ancestor internal/external symlink、ancestor non-directory、candidate symlink/non-directory、artifact symlink/non-file/read failure、root listing failure与 invalid project root；逐例核对 stable diagnostic、callback零调用及 project/external tree 的 path/type/size/content hash前后全等。
5. **Entry activation parity**：canonical source八个 package逐对核对 `SKILL.md` / `SKILL.en.md` 的 contract/workflow/numeric `crDir` activation semantics；`.agents` 与 `.claude` fresh target只对 installed active `SKILL.md`、contract、resolver与workflows做 source-byte parity和 activation replay，并逐包断言 installed `SKILL.en.md` 为 `ENOENT`。
6. **Bounded candidate scanner**：保持 frozen roots与 explicit files不变，扩展 concrete中文/underscore/space/混合标点、angle/double-brace/dotted placeholder、shell/JS/template concat、array `.join("-")` 与 config assignment detector；每个 semantic-equivalent mutation通过临时 regular file进入 scanner并在未分类时 fail-close。ledger只做 current frozen classified locator/token的机械刷新。

### Verification（验证）

- GREEN：`npx vitest run test/code-review-contract.test.ts --reporter=dot` → `35 passed / 4 todo`，focused file PASS，四个既有 `it.todo` 未新增、未改写。
- Allowed Files `git diff --check`：PASS（无输出）。
- 未运行 `npm run build`、full suite、packaging或 canonical governance；未刷新 completion gate。
- Fixer 写入边界仅为 resolver、focused test、机械 ledger与本 evaluation Fix Summary；未修改 installer、shared contract、runner/leaf workflow或entrypoint、Story/tracker/gate/root logs、Story 11.10、drawer及workspace mirrors。

### Changed Files（变更文件）

- `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs`
- `test/code-review-contract.test.ts`
- `test/fixtures/code-review-contract/title-bearing-path-ledger.json`
- `_bmad-output/implementation-artifacts/code-reviews/11-9-code-review/11-9-code-review-evaluation-20260905-round-2.md`（仅追加本记录；Revision 2 正文由 Evaluator 发布）

✅ CR 修复执行完成，修复记录已追加到评估文件。
