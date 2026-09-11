---
Story: 11-9
Round: 1
Date: 2026-09-05
Model Used: GPT-5.6 (gpt-5.6)
Review Source: 11-9-code-review-summary-20260905-round-1.md
Review Model: GPT-5.6
Type: Code Review Evaluation
---

## Evaluation Summary（评估总结）

对 Story 11-9 的第 1 轮 CR 代码审查结果（首轮）进行逐条独立评估。Reviewer 聚合后的 8 个 P1 均可由 current resolver、shared CR contract、runner、CR01–06 Directory Preflight、focused tests、Story 与 completion gate 直接证实；全部确认有效并阻塞交付，0 个降级、0 个误报、0 个新增 P2。Review source SHA-256 为 `aa4036170c305c5c7dca59aa3322e936d5ba453763f93d6596ef8096ca252981`，核对时 current `HEAD` 为 `ff7528d3f9ec34072bb669ee79f7569345c23d47`。

修复方向须收紧为同一 bounded slice：resolver 对 ancestor、legacy evidence、finalizer 与 I/O 全部 fail-close；runner 向六个 leaf 传递完整 frozen context；测试以 runner preflight/order oracle、installed consumer parity 与 no-follow full classified scan 闭环。不得借此修改 report basenames、CR algorithm、round numbering、approval rules、Story 11.10 或 external drawer。Owner Gate 为 `NONE`，整体 verdict 为 `FIX_REQUIRED`。

---

## Finding #1 Evaluation（发现 #1 评估）

### Review Finding（审查原文）

> **[P1] Missing `code-reviews/` 时未验证既有 ancestor，canonical write root 可经 symlink 逃逸 project**
> - 来源：blind + edge + auditor
> - 分类：patch

### Evaluation Result（评估结论）：✅ 确认有效 — 需要修复（P1 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性：准确**

`resolve-cr-directory.mjs:37-47` 只对 `projectRoot` 做 `realpath()`，随后在 `inspectRoot()` 返回 `missing` 时直接宣告 canonical success。`inspectRoot()` 在 `:151-168` 对目标本身的 `ENOENT` 没有继续检查最近既有 ancestor。因而当 `implementationArtifacts` 或其既有中间父级为 symlink，而 `code-reviews/` 尚不存在时，返回的 project-relative `crDir` 可在后续创建时解析到 project 外。现有测试 `test/code-review-contract.test.ts:470-503` 预先创建普通实目录，只证明 title input 不参与 root，不能证明 filesystem containment。

**严重性判断：合理**

该路径会把 review、evaluation、fix、`.tmp/` 与 goal records 的写入根导出 project，直接违反 Story AC1/AC11 及 shared contract `:63-75` 的 verified root 与 unsafe fail-close，属于安全与生命周期 P1。

**修复建议：可行**

唯一 bounded 修复是在 canonical missing-root success 前，从 `projectRoot` 下逐段 no-follow 检查所有已存在 path component：必须是实目录且其 `realpath` 位于 resolved project root；symlink（无论指向 project 内外）、non-directory、escape、broken component 或非目录 project root均返回既有 stable blocking diagnostic。不得创建目录，也不得放宽 `implementationArtifacts` grammar。

**误报评估：非误报**

Current `ENOENT -> missing -> success` 控制流可直接确认，三层又独立命中同一最小反例。

---

## Finding #2 Evaluation（发现 #2 评估）

### Review Finding（审查原文）

> **[P1] Legacy candidate 未区分 `UNFINISHED` 与无 current-series 可绑定 evidence**
> - 来源：blind + edge + auditor
> - 分类：patch

### Evaluation Result（评估结论）：✅ 确认有效 — 需要修复（P1 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性：准确**

`resolve-cr-directory.mjs:84-118` 使用 `!candidate.completed` 直接定义 `unfinishedLegacy`；而 `inspectCandidate()` 在 `:182-213` 对空目录、无关文件、other-series artifacts、malformed 或 unbound evidence 都产生 `maxRound=null, completed=false`。单一 legacy candidate 因此会被返回为 `legacy-resume`。现有 dual/multi fixture `test/code-review-contract.test.ts:573-623` 还使用无结构 `round-evidence.md` 代表 unfinished，恰好没有编码 contract 的“无法唯一绑定 current series/round 必须 block”。

**严重性判断：合理**

这会把新 run 写入无法证明属于 current `storyId + reviewSeries + round` 的 title-bearing legacy directory，破坏 AC1、AC9、AC11 的不猜测与 single-run semantics。

**修复建议：可行**

候选状态必须显式区分 `completed | unfinished | no-current-series-evidence | unsafe`。只有至少一份合法 current v2 artifact 能精确绑定 requested `storyId/reviewSeries/round`，且 latest round 没有合法 current `DONE` finalizer时，才允许唯一 legacy 原位 resume。空、无关、other-series-only、malformed、unbound 或 conflicting evidence一律使用既有 `cr-directory.ambiguous-resume-root` stable block；不得把它们改为 canonical restart，也不得迁移 legacy。

**误报评估：非误报**

Reviewer 给出的状态合并错误与 current code 完全一致。

---

## Finding #3 Evaluation（发现 #3 评估）

### Review Finding（审查原文）

> **[P1] Latest round 与 `DONE` 可由任意 basename、错绑 frontmatter 或正文伪字段伪造**
> - 来源：blind + edge + auditor
> - 分类：patch

### Evaluation Result（评估结论）：✅ 确认有效 — 需要修复（P1 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性：准确**

`resolve-cr-directory.mjs:185-204` 对任意 `-{reviewSeries}-round-N.md` regular file 提升 `maxRound`，没有限定 shared contract `:95-103` 列举的 artifact families，也没有拒绝非 safe integer。Finalizer 只依赖 filename substring 与全文两个 multiline regex；它没有解析合法 frontmatter boundary，也没有验证 `artifactType`、`storyId`、`reviewSeries`、frontmatter/filename round、current disposition，以及 `evaluation/rules/TODO/completion gate` required bindings。正文示例、wrong identity 或不完整 finalizer 均可能伪造 `DONE`。

**严重性判断：合理**

错误 completion 会让 resolver 在仍有 unfinished legacy run 时启动 canonical sibling，造成同一轮证据分裂，直接违反 AC8、AC9、AC11。

**修复建议：可行**

只接受 shared contract 已固定的 canonical current artifact basename families，不修改其 basename；round 必须是 finite safe positive integer。每份 current v2 artifact必须有单一合法 frontmatter，且 schema/artifact type、normalized story、requested series、frontmatter round、filename round与 current disposition精确一致。只有 latest round 的 canonical finalizer满足 `speclite.cr-finalizer.v2` 完整 identity、`result: DONE`、非 superseded disposition，并具有同 story/series/round 的 required source filename与 SHA-256 binding，才可判 completed。任何伪造、冲突、超界、malformed、body-only、wrong identity或 superseded evidence必须 stable block，不得静默忽略或猜测。

**误报评估：非误报**

当前两个 regex 的确不受 frontmatter boundary 和 identity 约束；reviewer 的伪造场景可由代码确定。

---

## Finding #4 Evaluation（发现 #4 评估）

### Review Finding（审查原文）

> **[P1] Runner 未把冻结的完整 resolver context 传给 CR01–06**
> - 来源：blind
> - 分类：patch

### Evaluation Result（评估结论）：✅ 确认有效 — 需要修复（P1 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性：准确**

Shared contract `cr-contract.md:61-65` 要求 orchestrator 把同一 `crDir`、`canonicalCrDir`、`compatibilityMode` 与 `legacyArtifactPaths` 传给 CR01–06。六个 leaf workflow 的 Directory Preflight 均在第 7 行声明同时消费这四项，并禁止 runner mode 重跑 resolver。但 runner `runner-workflow.md:72,76,98,104-107` 的六个 invocation 只传 `crDir={crDir}`；测试 `test/code-review-contract.test.ts:625-645` 也只检查这一字段。leaf 因而无法核对 canonical 与 legacy-resume context 的完整一致性。

**严重性判断：合理**

缺失字段使 single resolution 退化为不可验证的 path string handoff，破坏 AC4–AC7 的端到端冻结语义，属于功能契约阻塞项。

**修复建议：可行**

Runner 的六个 invocation必须显式传递同一 frozen `crDir`、`canonicalCrDir`、`compatibilityMode`、`legacyArtifactPaths`；不得新增第二 resolver invocation。六个 leaf workflow必须明确：runner mode 任一字段缺失、与 frozen context 不一致、`compatibilityMode` 与 path/legacy set不相容，或 `storyId/reviewSeries` binding不一致时，在任何 artifact/temp/progress write前 HALT。不得借此改变各 leaf 的 review/fix/closeout algorithm或授权参数。

**误报评估：非误报**

虽只有 Blind 单层提出，但 shared contract、runner invocation与六个 leaf preflight之间的文本差异直接成立。

---

## Finding #5 Evaluation（发现 #5 评估）

### Review Finding（审查原文）

> **[P1] Filesystem inspection I/O failure 未转换为 stable、redacted、single-JSON diagnostic**
> - 来源：edge
> - 分类：patch

### Evaluation Result（评估结论）：✅ 确认有效 — 需要修复（P1 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性：准确**

`resolve-cr-directory.mjs:60` 与 `:182` 的 root/candidate `readdir()` 没有统一 catch；`:196` 又把 artifact read 的全部失败折叠为空内容。CLI `:239-243` 没有顶层异常转换。权限、I/O 或并发消失因而可能直接抛出包含 absolute path/stack 的 Node error，也可能被错误降格为普通 unfinished evidence；两者都不满足 shared contract `:79-87` 的 stable structured diagnostic、redaction 与 stop-before-write。

**严重性判断：合理**

Non-zero process 本身不能替代 machine-readable workflow identity。丢失单一 JSON、stable reason 与 project-relative evidence会让 runner无法可靠恢复或审计，属于 AC9/AC11 的 P1。

**修复建议：可行**

Root listing、candidate listing、entry stat/read以及并发消失必须统一分类为既有 issue `cr-directory.ambiguous-resume-root` 下的有限 stable reason enum；details只能包含规范化 project-relative path/entry role，不得包含 raw error、absolute/home/temp path、stack或 artifact content。CLI 对预期及意外 inspection failure均只向 stdout 输出一个 JSON，stderr不得泄漏，退出码保持稳定失败。不得新增 project validation taxonomy，也不得把 I/O failure当作 empty evidence继续。

**误报评估：非误报**

当前未捕获的 async rejection和吞读错误均可由源代码直接确认。

---

## Finding #6 Evaluation（发现 #6 评估）

### Review Finding（审查原文）

> **[P1] Ambiguity 的 zero-mutation evidence 未覆盖 runner progress、Story 与 trackers**
> - 来源：edge
> - 分类：patch

### Evaluation Result（评估结论）：✅ 确认有效 — 需要修复（P1 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性：准确**

`test/code-review-contract.test.ts:573-623` 仅直接调用 resolver并 snapshot `code-reviews` root。它没有证明 outer runner在 dual/multi/unsafe failure前未创建 goal records或`.tmp/`，也没有覆盖 Story、sprint tracker、workflow tracker与 progress state。Runner prose `runner-workflow.md:13-20,41-51` 已规定正确顺序，但 current oracle没有把“resolver失败即 mutation callback不可达”固化为可重放断言。

**严重性判断：合理**

Completion gate声称的 progress zero-mutation高于 current evidence。若顺序回归，真实 ambiguity可留下半写状态，直接违反 shared contract `:65-87` 与 AC9/AC11。

**修复建议：可行**

在现有 focused test 中建立最小 test-only runner preflight/order oracle：它消费 current runner workflow中唯一 resolver-before-records invariant，调用真实 resolver，并且只有 `ok=true` 才允许进入显式 mutation callback。对 dual、multi、ancestor symlink、candidate symlink/non-directory、unbound/malformed evidence与 I/O failure，布置 goal/temp/progress、Story、sprint tracker和workflow tracker sentinels，snapshot整个受控 project tree；断言 callback调用次数为零且所有 path/type/bytes/hash/tree exact zero delta。不得新增或修改 production runner algorithm，也不得把单一 `code-reviews` snapshot继续表述为 runner-wide closure。

**误报评估：非误报**

测试尾部 `:754-758` 也明确将真实 runner state-machine覆盖留作 todo；现有证据确实不足。

---

## Finding #7 Evaluation（发现 #7 评估）

### Review Finding（审查原文）

> **[P1] Fresh-install 只核对 resolver，未核对 installed runner、contract 与 CR01–06 的同一 context 消费**
> - 来源：edge
> - 分类：patch

### Evaluation Result（评估结论）：✅ 确认有效 — 需要修复（P1 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性：准确**

Source propagation test `test/code-review-contract.test.ts:625-645` 只读取 canonical corpus；fresh-install test `:699-752` 只比较 resolver bytes/mode并执行 resolver CLI probe。它没有读取两个 IDE target中的 shared contract、runner以及 CR01–06 entrypoint/workflow，也没有在 installed corpus断言 once-only resolver、四字段 frozen context与 no-title-rederive。

**严重性判断：合理**

Canonical source与单个 installed script同时为绿，仍不能证明最终用户执行的 runner/leaf consumer版本一致。该缺口直接影响 AC4、AC5、AC7 的 installed runtime truth。

**修复建议：可行**

扩展同一 fresh-install fixture，对 `.agents/skills` 与 `.claude/skills` 逐一核对 shared contract、runner、CR01–06 changed entrypoints/workflows与 canonical source的 deterministic bytes；在每个 installed corpus重放 runner resolver invocation恰一次、四字段 context逐 leaf完整传递、mismatch fail-close与 no-title-rederive assertions。只验证 Story 11.9 changed consumer surface，不扩大为全仓安装 parity，也不修改 workspace `.agents/.claude` mirrors。

**误报评估：非误报**

Current installed test inventory明确只有 resolver script，无法支持 completion evidence中的 full-chain projection结论。

---

## Finding #8 Evaluation（发现 #8 评估）

### Review Finding（审查原文）

> **[P1] Active title-bearing negative scan 不是 frozen full classified corpus scan**
> - 来源：blind + edge
> - 分类：patch

### Evaluation Result（评估结论）：✅ 确认有效 — 需要修复（P1 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性：准确**

`test/code-review-contract.test.ts:647-697` 手列少量 Markdown files，并只用两个相邻花括号 placeholder regex。它未递归覆盖 Story AC7 明列的 scripts、hooks、templates、fixtures、help、metadata/contracts、release/current docs，也会漏掉 shell/JS拼接、`$story_id-$story_slug`、`${storyId}-${storySlug}`、config expression和 concrete title-bearing path。公开 docs test只要求存在一个 canonical token，不能拒绝同文件并存 active legacy producer。

**严重性判断：合理**

遗漏 surface可重新引入第二套 title-bearing root而 focused suite仍假绿，破坏 AC7、AC10、AC11 的全量 negative closure。

**修复建议：可行**

采用 frozen no-follow candidate scan，而不是继续增加手工文件名：roots精确限定为 Story 11.9 的 `assets/source/speclite/sdlc-skills/4-implementation/` CR contract、runner与 CR01–06 package trees，加上 `assets/source/speclite/sdlc-skills/module-help.csv`、`assets/source/speclite/README.md`、`assets/source/speclite/README.en.md`、`docs/reference/skills/sdlc-workflows.md`、`docs/reference/workflow-artifact-layout.md`、`release/packaging-manifest.json` 和 `test/code-review-contract.test.ts`。遍历所有 regular files并按 raw bytes扫描冻结 token families；目录、symlink、FIFO/socket/device、 unreadable entry、scan error与重复 path均 fail-close。

所有 match必须形成按 byte-wise path/byte-offset 排序的 `{path, line, token, role, rationale}` ledger，并与 fixture双向 exact equality；角色仅允许 `active-canonical`、`compatibility-contract`、`legacy-fixture`、`regression-assertion`。任何 title-bearing match被分类为 active、任何未分类/额外/缺失/重复 match，或 allowlist locator漂移均失败。该 scan不得进入 `_bmad-output`、workspace `.agents/.claude`、external drawer/zip、archive/history或 Story 11.10 generic inventory。

**误报评估：非误报**

Reviewer指出的遗漏目录与 token forms均不在 current scanner的候选集或 regex能力内。

---

## Overall Evaluation（整体评估结论）

### Required Fixes（需要修复，阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | Missing root ancestor containment 缺失 | P1 | **P1** | 必须逐段 no-follow 验证既有 ancestor，任何 symlink/non-directory/escape fail-close。 |
| 2 | Legacy no-evidence 被误作 unfinished | P1 | **P1** | 只允许有合法 current-series round evidence 的唯一 unfinished legacy resume。 |
| 3 | Round/finalizer authenticity 不足 | P1 | **P1** | 必须以 canonical basename、完整 v2 identity与 required bindings判 current DONE。 |
| 4 | Frozen resolver context 未完整传播 | P1 | **P1** | Runner与六个 leaf必须传递并核对全部四字段。 |
| 5 | I/O failure不满足stable/redacted JSON契约 | P1 | **P1** | 所有inspection failure必须统一结构化、去敏并single-JSON失败。 |
| 6 | Runner-wide zero-mutation evidence缺失 | P1 | **P1** | 以最小preflight/order oracle和全surface snapshot证明stop-before-write。 |
| 7 | Installed CR01–06 parity缺失 | P1 | **P1** | 两个IDE target必须重放完整consumer parity与context invariants。 |
| 8 | Full classified scan false-green | P1 | **P1** | Frozen no-follow raw-byte inventory必须与逐match ledger双向exact一致。 |

### Deferred TODOs（建议纳入 CR TODO 跟踪，非阻塞）

无新增 P2。本轮不得将任何确认 P1 降级为 TODO。现有 `4 todo` 属既有 CR state-machine基建，不代替上述闭环，也不在本轮扩展。

### Dismissed Findings（可忽略/误报）

无。Aggregator 的去重与 Story 11.9 归因成立；本 Evaluator仅收紧唯一修复方式和测试边界。

### Fixer Authorization Boundary（Fixer 授权边界）

Fresh Fixer仅获准修改以下精确文件：

- `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs`
- `assets/source/speclite/sdlc-skills/4-implementation/speclite-goal-orchestrator-epic-story-code-review-runner/references/runner-workflow.md`
- `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-01-reviewer/references/reviewer-workflow.md`
- `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-02-evaluator/references/evaluator-workflow.md`
- `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-03-fixer/references/fixer-workflow.md`
- `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-04-rules-extractor/references/rules-extractor-workflow.md`
- `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-05-todo-tracker/references/todo-tracker-workflow.md`
- `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-06-finalizer/references/finalizer-workflow.md`
- `test/code-review-contract.test.ts`
- `test/fixtures/code-review-contract/title-bearing-path-ledger.json`（允许新建，仅承载 frozen classified match ledger）
- 本 evaluation 文档，仅允许在末尾追加 Fix Summary（修复摘要）。

上述白名单覆盖唯一 production与evidence路径。不得修改 shared contract本身、CR01–06/runner `SKILL.md` 或 `SKILL.en.md`、CHANGELOG、output templates、module help、README/current docs、release manifest、SPEC、Story、tracker、completion gate、root goal records或其他 CR artifacts；本轮 scan发现白名单外 active residual时，Fixer必须停止并返回 Evaluator重新裁决，不得直接修它。

特别禁止修改 report basenames、artifact schema、CR review/evaluation/fix/rules/TODO/finalizer algorithm、round numbering、approval/confirmation policy、public CLI、dependencies、Story 11.10、external `speclite-drawer-er-modeler/`及 zip、workspace `.agents/.claude` mirrors、fixed-count baselines、archive/history或既有 legacy artifacts。若上述精确白名单不足，Fixer必须 HALT，不得自行扩围。

### RED / GREEN Verification Authorization（RED/GREEN 验证授权）

Fixer必须先在 `test/code-review-contract.test.ts` 与 ledger fixture加入能使 current implementation失败的断言并记录 RED；不得把当前 `24 passed / 4 todo` 误写成本轮 findings 的 RED。RED必须至少逐项证明：

1. missing leaf + ancestor symlink（project内与project外）、ancestor non-directory及invalid project root当前错误 success或缺 stable failure；
2. empty、unrelated、other-series-only、malformed、unbound legacy当前错误 resume；
3. arbitrary basename、wrong-story/series/round、body-only、malformed、superseded与 oversized-round evidence当前可伪造 round/DONE；
4. runner六个 invocation缺失 `canonicalCrDir/compatibilityMode/legacyArtifactPaths`，leaf对缺失或mismatch context没有明确stop-before-write oracle；
5. permission/I/O、candidate disappearing或artifact read failure当前产生异常泄漏或被吞为普通 evidence；
6. ambiguity/unsafe失败尚无 runner callback-zero与 Story/tracker/progress全树 zero-delta证据；
7. installed fixture尚未核对 runner、contract与 CR01–06 changed consumer parity；
8. concrete、shell/JS拼接、alternate placeholder或新增未分类 match可穿过当前手工 scan。

GREEN至少证明：

1. 普通 missing canonical path仍 read-only success；全部既有 descendant components均为project-contained real directories；symlink/non-directory/escape/broken topology稳定阻断且 zero write。
2. 合法 current-series unfinished legacy仍原位resume，合法 completed latest round仍启动canonical；所有 no/unbound/conflicting evidence稳定阻断且不迁移、不创建sibling。
3. 只有 canonical current artifact family与完整绑定的合法 v2 frontmatter可贡献 round；latest finalizer只有完整 current identity/bindings且 `DONE` 时可完成。
4. Runner resolver调用仍恰一次，四字段值逐 CR01–06相同；任一缺失/mismatch均在leaf任何写入前HALT。
5. 所有 inspection I/O failure返回同一 issue identity、有限stable reason、project-relative redacted details、单个stdout JSON、稳定non-zero且无stderr raw path/stack。
6. Dual/multi/unsafe/unbound/I/O cases中，mutation callback恰零次；goal/temp/progress、Story、sprint与workflow tracker的path/type/bytes/hash/tree均exact zero delta。
7. `.agents` 与 `.claude` fresh install均对 shared contract、runner及六个leaf entrypoint/workflow实现byte parity，并重放 once-only/four-field/no-title-rederive/mismatch invariants。
8. Frozen roots的所有regular-file raw-byte matches与 ledger双向exact equality，active title-bearing role为零；新增、遗漏、重复、locator漂移、symlink/non-file或scan error全部失败。

允许运行：`npx vitest run test/code-review-contract.test.ts --reporter=dot`、为该 test 明确依赖的精确现有 install/update test files（如确有必要）、上述白名单的 `git diff --check`，以及只读的精确 candidate-scan命令。不得运行 `npm run build`、full suite、packaging或 canonical governance。Fixer完成后由 outer Flow Gate owner独立刷新 completion gate，再进入 fresh Reviewer Round 2。

### Evaluation Decision（评估决定）

- **发现 #1（ancestor containment）**：确认 P1；逐段 no-follow、contained real-directory验证，unsafe stable block。
- **发现 #2（legacy series evidence）**：确认 P1；只有合法 current-series unfinished round可resume，无证据不等于unfinished。
- **发现 #3（finalizer authenticity）**：确认 P1；canonical family、完整 v2 frontmatter、current identity与required bindings缺一不可。
- **发现 #4（frozen context propagation）**：确认 P1；runner向CR01–06传齐四字段，leaf mismatch stop-before-write。
- **发现 #5（stable/redacted I/O）**：确认 P1；统一stable issue/reason/single JSON，不吞错误、不泄漏路径。
- **发现 #6（runner/tracker zero mutation）**：确认 P1；补最小test-only preflight/order oracle与全surface exact snapshot，不改runner algorithm。
- **发现 #7（installed CR01–06 parity）**：确认 P1；两个IDE target覆盖contract/runner/leaf消费者，不只比较resolver。
- **发现 #8（full classified scan）**：确认 P1；采用frozen no-follow raw-byte candidate scan与逐match exact ledger，不扩Story 11.10。
- **Owner Gate**：`NONE`。八项的observable behavior均由Story、kickoff与shared contract唯一确定。
- **整体裁决**：`FIX_REQUIRED`。完成8项bounded修复、outer completion gate刷新及fresh Reviewer/Evaluator双重确认前，不得进入CR04、CR05或CR06。

## 修复执行记录

### 修复执行记录
- **Date**: 2026-09-05
- **Model Used**: GPT-5.6 (gpt-5.6)
- **Fix Items**: 8

#### RED Evidence（红灯证据）

- 在 production patch 前向 `test/code-review-contract.test.ts` 加入 ancestor topology、legacy current-series evidence 与 current artifact authenticity 负例；focused run 得到 `3 failed / 24 passed / 4 todo`，三个失败分别证明 missing root 在 ancestor symlink/non-directory 下错误 success、无 current-series evidence 的 legacy 错误 resume，以及 arbitrary/malformed/unbound evidence 未 fail-close。
- 后续先加入 frozen candidate scan 与空 ledger，focused run 得到 `2 failed / 29 passed / 4 todo`：实际识别 9 个 legacy fixture match 而 ledger 为空；duplicate/symlink/non-file fail-close oracle 同时暴露 lexical/realpath containment 测试缺口。

#### Fix Results（修复结果）

1. **Ancestor containment**：`resolve-cr-directory.mjs` 现在从真实 `projectRoot` 沿 `implementationArtifacts/code-reviews` 逐段执行 no-follow `lstat`、real-directory 与 project containment 检查；missing ordinary descendant 保持 read-only canonical success，symlink、non-directory、broken/escape topology稳定阻断。
2. **Legacy current-series evidence**：候选状态显式区分 `completed`、`unfinished`、`no-current-series-evidence` 与 `unsafe`；只有至少一份合法、精确绑定 current `storyId/reviewSeries/round` 的 legacy evidence 可原位 resume，empty/unrelated/other-series/malformed/unbound evidence统一阻断。
3. **Finalizer authenticity**：仅 canonical current artifact family 可贡献 finite safe positive round；单一 leading frontmatter必须精确绑定 schema、artifact type、story、series、filename round与 current disposition。Latest `DONE` 只接受完整 v2 finalizer identity，以及 review/evaluation/rules/TODO/completion gate 的 canonical filename与 `sha256` binding。
4. **Frozen context propagation**：runner 对 CR01–06 的每次 invocation 均显式传递同一 `crDir`、`canonicalCrDir`、`compatibilityMode`、`legacyArtifactPaths`；六个 leaf workflow 均规定字段缺失、冻结值 mismatch、mode/path/set 不相容或 identity binding mismatch 时在任何写入前 HALT，且不得重跑 resolver或按 title 重推导。
5. **Stable/redacted I/O**：root/candidate listing、candidate stat/realpath、artifact read与 CLI unexpected inspection failure均转换为有限 stable reason；输出只含 project-relative structured evidence，不含 raw error、absolute path或 stack。CLI 保持 stdout 单一 JSON、空 stderr与稳定失败 exit code。
6. **Runner/tracker zero mutation**：加入最小 test-only resolver-before-mutation oracle，并对 goal/temp/progress、Story、sprint tracker、workflow tracker及完整受控 tree 的 path/type/size/SHA-256 做 before/after exact equality；blocked preflight 下 mutation callback 为零。
7. **Installed CR01–06 parity**：fresh-install fixture 逐 `.agents/skills` 与 `.claude/skills` 核对 shared contract、resolver、runner及六个 leaf workflow deterministic bytes，并在 installed corpus重放 once-only resolver、四字段逐 leaf传递、mismatch-before-write与 no-title-rederive invariants。
8. **Full classified candidate scan**：新增 frozen no-follow recursive regular-file scan，精确覆盖 Story 11.9 指定 contract/runner/CR01–06 package trees、help、README/current docs、release manifest与 focused test；raw-byte token match按 byte-wise path/offset排序并与 `title-bearing-path-ledger.json` 双向 exact equality。角色仅允许四种冻结分类，当前 9 个 match全部为 `legacy-fixture`，`active-canonical` 为零；duplicate、symlink、non-file、escape、read/scan failure与未分类 match均 fail-close。

#### GREEN Verification（绿灯验证）

- `npx vitest run test/code-review-contract.test.ts --reporter=dot`：`31 passed / 4 todo`，focused file PASS。
- 白名单文件 `git diff --check`：PASS。
- 未运行 `npm run build`、full suite、packaging 或 canonical governance；未修改 Story、tracker、completion gate、root goal records、shared contract、public basenames/algorithm/approval policy、Story 11.10、external drawer/zip 或 workspace `.agents/.claude` mirrors。

#### Changed Files（变更文件）

- `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs`
- `assets/source/speclite/sdlc-skills/4-implementation/speclite-goal-orchestrator-epic-story-code-review-runner/references/runner-workflow.md`
- `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-01-reviewer/references/reviewer-workflow.md`
- `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-02-evaluator/references/evaluator-workflow.md`
- `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-03-fixer/references/fixer-workflow.md`
- `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-04-rules-extractor/references/rules-extractor-workflow.md`
- `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-05-todo-tracker/references/todo-tracker-workflow.md`
- `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-06-finalizer/references/finalizer-workflow.md`
- `test/code-review-contract.test.ts`
- `test/fixtures/code-review-contract/title-bearing-path-ledger.json`
- 本 evaluation 文档（仅追加本 Fix Summary）。
