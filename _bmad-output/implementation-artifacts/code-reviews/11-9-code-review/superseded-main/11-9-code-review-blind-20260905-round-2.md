---
Story: 11-9
Round: 2
Date: 2026-09-05
Model Used: GPT-5.6
Layer: Blind Hunter
Verdict: FAIL
---

# Blind Review（盲审）

## Verdict（结论）

**FAIL**。Round 1 八项修复中，ancestor containment、legacy-only evidence 分型、四字段传播、stable I/O、runner-wide zero-mutation、双 IDE installed parity 的主干已落地；但 current resolver 与 candidate scan 仍有 **3 个 bounded P1**。第一，非法或错绑 evidence 只在 legacy candidate 上触发阻断，同样的非法 evidence 位于 canonical directory 时会被静默放行。第二，所谓 authentic `DONE` finalizer 只验证少量 filename 与“像 hash 的字符串”，没有验证完整 v2 identity、允许 verdict、completion gate/tracker 状态或被引用文件及其真实 hash，仍可把 unfinished legacy 错判为 completed。第三，frozen candidate scan 虽建立 ledger，却仍由三条窄 regex 决定 candidate 集，缺少 Round 1 Evaluator 明确要求的拼接/alternate placeholder mutation oracle，语义等价的 title-bearing producer 仍可 false-green。

- **P1：3**
- **P2：0**
- **Owner Gate：`NONE`**
- **Review boundary**：Story 11.9、Round 1 八项 Fix Summary、current resolver/runner/CR01–06、focused test、classified ledger、shared CR contract 与 refreshed completion gate。
- **Explicit exclusions**：未运行 build、full suite、packaging 或 canonical governance；未将 Story 11.10、`speclite-drawer-er-modeler/`、zip、workspace `.agents` / `.claude` mirrors 或 fixed-count drift归因于 Story 11.9；未修改源码、Story、tracker、gate 或 root goal records。

## P1 Findings（P1 发现）

### P1-1 Canonical candidate 的非法 current-series evidence 被静默放行

- **Location**：`assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs:102-147,253-292`；`test/code-review-contract.test.ts:611-654`
- **Evidence**：`inspectCandidate()` 会把 arbitrary basename、malformed/wrong-story frontmatter 等 current-series evidence 标为 `no-current-series-evidence`；但外层只计算 `invalidLegacy = legacy.filter(...)`。若完全相同的非法文件位于 canonical `11-9-code-review/`，`canonical` 非空、`invalidLegacy` 为空，控制流最终在第 147 行返回 `ok=true` 的 canonical success。新增负例全部把坏文件写入 `11-9-old-title-code-review`，没有覆盖 canonical candidate。shared contract 的恢复矩阵明确规定任何 candidate 的 symlink/non-directory/escape 或 evidence 无法唯一绑定 current series/round 都必须 block-before-write，并未给 canonical 例外。
- **Concrete failure**：已存在 canonical directory，内含 `11-9-code-review-summary-20260905-main-round-2.md`，但 frontmatter `storyId: 11-8`；resolver 仍返回 verified canonical `crDir`，runner 随后可在无法确定 current round 的目录继续写入。
- **Consequence**：损坏、冲突或伪造的 canonical run 会被当作可安全 continuation，破坏 AC4/AC9/AC11 的 single-round identity 与 ambiguity stop；Round 1 finding #2/#3 在 canonical 分支复现。
- **Classification**：`patch`。对 canonical 与 legacy 统一处理 invalid current-series evidence；只允许“真正无既有 current run”的 canonical empty/unrelated 状态按合同继续，任何看似 current-series 但 identity/round 无法绑定的 artifact 必须返回 stable diagnostic。补 canonical malformed/wrong-story/wrong-round/arbitrary-family 与 zero-mutation fixtures。

### P1-2 不完整且未核实的 finalizer 仍可伪造 completed legacy

- **Location**：`assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs:345-367`；`test/code-review-contract.test.ts:633-654,1140-1161`；`assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/references/cr-contract.md:283-319,392-406`
- **Evidence**：`validDoneFinalizer()` 只要求 `result=DONE`、四个 source basename 匹配 current story/series/round、五个 hash 字段符合 `sha256:<64 hex>` 形状。它没有要求 finalizer v2 schema 中的 `storyKey`、`generatedAt`、`modelUsed`、`evaluationVerdict`、`scopeHash`、`completionGateResult`、`completionGateGeneratedAt`、`trackerWrites`、`trackerChangeSet`、`trackerRereadConsistent`；`completionGateSource` 的 regex 也没有绑定 current `storyId/storyKey`。更关键的是，它不读取 review/evaluation/CR04/CR05/gate source，也不按 contract 的 canonicalization 算法核对声明 hash。测试 helper `currentFinalizerArtifact()` 正好省略上述字段，并使用不存在 source 的全 `a` 假 hash，却被 happy path 称为 authentic 且判定 completed。
- **Concrete failure**：legacy latest round 放入一个 `evaluationVerdict: FIX_REQUIRED`（或完全缺失该字段）、`completionGateResult: FAIL`（或缺失）、`trackerRereadConsistent: false`（或缺失）的 finalizer，并填入格式正确但与任何文件不匹配的 hash；current resolver仍将其记入 `doneRounds`，随后选择 canonical new run。
- **Consequence**：尚未通过 evaluator、completion gate、CR04/CR05 或 tracker reread 的 legacy run可被伪造为 DONE，直接创建 canonical sibling并分裂同一 Story lifecycle；Round 1 finding #3 的“完整 v2 frontmatter/current bindings”修复声明并未成立。
- **Classification**：`patch`。按 shared contract 验证完整 required finalizer identity与允许状态，绑定 current `storyId/storyKey/series/round`，并验证 referenced current artifacts存在、basename/identity/hash一致；任一缺失、HALTED/非允许 verdict、wrong gate、false tracker reread、missing source或 hash mismatch均 stable block。补缺字段、wrong-story gate、non-PASS evaluation/gate、missing source与 hash mismatch fixtures。

### P1-3 Classified candidate scan 的 token detector 仍可被等价拼接表达式绕过

- **Location**：`test/code-review-contract.test.ts:1018-1125`；`test/fixtures/code-review-contract/title-bearing-path-ledger.json:1-11`
- **Evidence**：scan 的 no-follow root inventory、byte-wise order 与 exact ledger comparison已经建立，但进入 ledger 的前提仍是 `titleBearingTokenPatterns()` 三条 regex 命中连续文本：相邻 placeholder 组合、单个 title placeholder 或具体 `N-N-slug-code-review`。Round 1 Evaluator明确要求 RED/GREEN 覆盖“concrete、shell/JS 拼接、alternate placeholder或新增未分类 match”；current tests只对 live corpus跑一次 scanner，并测试 duplicate/symlink/non-file traversal，没有向 detector 注入语义等价的 mutation。诸如 `'${storyId}' + '-' + '${storyKey}' + '-code-review'`、`[storyId, storySlug, "code-review"].join("-")`、`path.join(root, storyId + "-" + storyName + "-code-review")` 都不会产生三条 regex要求的连续 token，因此既不会进入 `actual`，也不会触发 ledger mismatch。
- **Concrete failure**：任一受扫描 active package新增 `const crDir = storyId + "-" + storyKey + "-code-review";`，candidate inventory与 ledger仍保持原九项相等，focused scan继续 PASS。
- **Consequence**：AC7/AC10要求的全部 active `$cr_dir` expression closure仍是 false-green；Round 1 finding #8 的 root cause仅从“手列文件”迁移成“窄 token detector”，没有被消除。
- **Classification**：`patch`。将 detector扩展为可证明覆盖的 expression family，或改为对 CR-directory-producing assignments/commands做结构化/分段 token 检查；至少加入 evaluator指定的 concrete、shell、JS concatenation与 alternate placeholder mutation fixtures，保证每种新增 active producer都会成为未分类 match并 fail-close。

## P2 Findings（P2 发现）

无。

## Positive Evidence（已验证正向证据）

1. Missing-root ancestor现在逐段执行 no-follow `lstat`、real-directory与 project containment检查；普通 missing descendant保持 read-only canonical success。
2. Legacy candidate 已区分 `completed | unfinished | no-current-series-evidence | unsafe`；empty/unrelated/other-series/malformed/unbound legacy不会再被静默 resume。
3. Canonical artifact family、leading frontmatter、story/series/filename round与 current disposition的基础校验已建立，older `DONE` 不会掩盖 later unfinished round。
4. Runner 对 CR01–06 的 invocation 已出现相同 `crDir/canonicalCrDir/compatibilityMode/legacyArtifactPaths` 四字段，leaf workflow明确 mismatch-before-write HALT与 no-title-rederive。
5. I/O failure的 CLI路径已统一为 single stdout JSON、stable exit code与 redacted details；runner preflight test对 goal/temp/progress/Story/sprint/workflow tracker执行全树 zero-delta快照。
6. Fresh install测试逐 `.agents` / `.claude` 核对 shared contract、resolver、runner与六个 leaf workflow bytes；candidate inventory具备 no-follow、duplicate/non-file/scan-error fail-close骨架。
7. Refreshed completion gate如实记录 focused `31 passed / 4 todo`、affected `81 passed / 4 drawer-only failures / 4 todo`及外部 drawer边界；本层没有把外部 fixed-count caveat提升为 Story finding。

## Scope Audit（范围审计）

- 本层核对 Round 1 八项修复与 full Story contract，仅报告可由 current resolver/test直接复现的 bounded gaps。
- 未要求修改 shared report basename、CR algorithm、round numbering、approval policy、SPEC 07、legacy filesystem migration、Story 11.10、drawer/zip、workspace mirrors或 fixed-count baselines。
- 未运行 build、full suite、packaging或 canonical governance；仅执行只读文本审计、精确 candidate search与白名单 `git diff --check`。
- 唯一新增文件为本 Round 2 Blind报告；未改 Story、tracker、completion gate、root goal records、源码或测试。

## Owner Gate（Owner 门禁）

**Owner Gate：`NONE`。** 三项的正确行为均已由 Story 11.9 与 shared CR contract确定：任何 candidate 的 unbound evidence都须 block；completed必须来自完整、真实绑定且满足 state machine的 current finalizer；active title-bearing producer detector必须覆盖已冻结 expression families并由 mutation fixture证明 fail-close。可交同轮 Aggregator/Evaluator独立裁决，本层不授权 Fixer。
