---
Story: 11-9
Round: 4
Date: 2026-09-05
Model Used: GPT-5.6
Layer: Blind Hunter
Verdict: FAIL
---

# Blind Review（盲审）

## Verdict（结论）

**FAIL**。Round 3 七项修复的主体均已落地：malformed current artifact 会 fail-close，CR04/CR05 已绑定 current evaluation basename/hash，tracker 已引入真实文件重读，leaf oracle 已加入 `reviewSeries` 与 extra-field 拒绝，14 类 blocked reason 已精确冻结，八包 entrypoint 已补 no-title-rederive hard gate，candidate detector 也已扩展 bare/interleaved families。但 current executable contract 仍有 **3 个 bounded P1**：真实 runner 的唯一 CLI 调用无法传入新必需的 `trackerBindings`，使 completed legacy 在生产路径恒被判 invalid；malformed-intent predicate 未将 family 锚定到 Story prefix 后，会将普通 notes 误判为损坏 artifact；leaf 的“exact accepted schema”只检查键集，却不检查 `ok=true` / `issue=null`，仍可 false-green 进入 mutation。

- **P1：3**
- **P2：0**
- **Owner Gate：`NONE`**
- **Review boundary**：Story 11.9 current resolver/CLI，Round 3 七项 Fix Summary，shared runner invocation，leaf frozen-context oracle 及 focused contract evidence。
- **Explicit exclusions**：未运行 build、full suite、packaging 或 canonical governance；未将 Story 11.10、external `speclite-drawer-er-modeler/`、zip、workspace `.agents` / `.claude` mirrors 或 fixed-count drift 归入 finding；未修改源码、Story、tracker、completion gate 或 root goal records。

## P1 Findings（P1 发现）

### P1-1 Runner 唯一 CLI 无法传入 `trackerBindings`，completed legacy 在真实路径恒失败

- **Location**：`assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs:18-24,284-299,521-535,652-667`；`assets/source/speclite/sdlc-skills/4-implementation/speclite-goal-orchestrator-epic-story-code-review-runner/references/runner-workflow.md:13-18`；`test/code-review-contract.test.ts:955-980,986-1012,1640-1686`
- **Evidence**：Round 3 为验证 DONE tracker authenticity，使 `validDoneFinalizer()` 必须收到 `trackerBindings`；缺失时 `validTrackerBindings()` 直接返回 false，最终将 `result: DONE` 的 current finalizer 标记为 invalid evidence。但真实 runner 在 Step 0 只能执行命令行 script，命令只包 `--project-root` / `--implementation-artifacts` / `--story-id` / `--review-series`；`parseArguments()` 也只解析这四项，没有任何 `trackerBindings` 参数、config source 或 stdin contract。新 GREEN 只直接 import `resolveCrDirectory()` 并传入 in-memory bindings，未经过 runner 实际 CLI boundary。
- **Concrete failure**：对一个包含真实 CR01–06、current completion gate 与三 tracker after-state 的 completed legacy-only 目录，runner 按文档命令调用 script 时 `trackerBindings === undefined`；`validDoneFinalizer()` 返回 false，`inspectCandidate()` 返回 `legacy-current-series-evidence-invalid`，而不是按 contract 返回 canonical directory 开启 new run。
- **Consequence**：AC8/AC9 的“completed legacy 保留原位且新 run 转 canonical”在唯一生产入口不可达；这不是额外需求，而是 Round 3 Finding #3 在 API test 与 executable consumer 之间的断层。
- **Classification**：`patch`。先冻结 runner 如何从 merged runtime config 获得 workflow tracker requiredness/path/key，再通过唯一明确、可验证的 CLI 输入传给 resolver；不得猜测 legacy workflow path。增加 completed legacy 的真实 CLI end-to-end 反例与 GREEN。

### P1-2 Malformed-intent predicate 过宽，普通 notes 会被误判为 current artifact

- **Location**：`assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs:252-260,338-343`；`test/code-review-contract.test.ts:607-686`
- **Evidence**：`looksLikeCrArtifactSignal()` 分别使用三个不关联的子串判定：filename 以 `${storyId}-` 开头、任意位置含 known family 子串、任意位置含 `-${reviewSeries}-round-`。它没有要求 known family 紧跟 Story prefix，也没有限定 artifact-shaped date/series slot。因此 `11-9-notes-about-code-review-summary-main-round-guide.md` 这类普通说明文件会命中 signal，随后因不匹配 numeric suffix 被判 `current-series-evidence-invalid`。Round 3 GREEN 只保留了 `11-9-notes.md` 这个过弱反例，没有覆盖含评审术语的 ordinary notes。
- **Concrete failure**：canonical 或唯一 unfinished legacy 目录只要含上述 notes filename，resolver 就会在任何 write 前 HALT，即使该文件并非 CR01–06 artifact，也不声称 canonical artifact basename。
- **Consequence**：Round 3 Finding #1 从 fail-open 摆到 fail-closed 的同时引入 false block，违反其 GREEN criteria 中“ordinary notes 保持 unrelated”，并可使 AC9 legacy resume 不可用。
- **Classification**：`patch`。将 artifact intent 限定为 `${storyId}-${knownFamily}-...-${reviewSeries}-round-...` 的结构关系，既允许 malformed date/round/extension 被捕获，又不将 family/series 只出现在 notes prose-like basename 的文件当作 artifact。补含 known-family 与 series 文字的 ordinary-note 反例。

### P1-3 Leaf exact-schema oracle 未校验 `ok` / `issue`，失败结果仍可执行 mutation callback

- **Location**：`test/code-review-contract.test.ts:1014-1078,1355-1401`
- **Evidence**：`runLeafFrozenContextPreflight()` 将 `ok` 与 `issue` 加入 accepted key set，但 required fields 不包它们，后续也没有检查 `supplied.ok === true`、`supplied.issue === null`，甚至没有要求这两个值与 frozen `resolved` 一致。于是只要其他六个字段匹配，`{ ...resolved, ok: false, issue: { continuation: "block" } }` 仍通过 exact-key 检查并调用 mutation。Round 3 反例只覆盖 missing/mismatch `reviewSeries` 与 title-derived extra fields，未覆盖 resolver status/issue 污染。
- **Concrete failure**：对 CR01–06 任一 leaf，把 supplied context 的 `ok` 改为 false、`issue` 改为 non-null，当前 test-only preflight 仍返回 `{ok:true}` 且 callback 调用一次。
- **Consequence**：Round 3 Finding #4 所要求的 exact frozen resolver outcome 仍是 false-green；一个明示 block 的 resolver context 可在 oracle 中进入 artifact/progress mutation，与 AC4/AC5/AC9/AC11 的 stop-before-write 相冲突。
- **Classification**：`patch`。在唯一 shared test-only adapter 中精确要求 `ok === true` 且 `issue === null`，并与 frozen resolver result 同值；逐 CR01–06 增加 `ok=false`、non-null issue 与 missing status fields的 stable HALT + callback-zero 反例。无需修改 leaf algorithm。

## P2 Findings（P2 发现）

无。

## Round 3 Closure Evidence（Round 3 关闭证据）

1. **Finding #1 主干已修**：current Story/family/series 的 malformed round/extension 现会进入 invalid evidence；但 P1-2 证明 intent boundary 过宽。
2. **Finding #2 已修**：CR04/CR05 的 `evaluationSource` / `evaluationSourceHash` 已精确绑定 finalizer current evaluation 与真实 bytes hash。
3. **Finding #3 API 验证已修**：Story/sprint/workflow bindings、no-follow regular-file reread 与 `afterHash` 已建立；但 P1-1 证明 runner CLI 没有输入通道。
4. **Finding #4 部分已修**：`reviewSeries`、六个 frozen fields 与 title/name/slug/filename/candidate extra fields已覆盖；但 P1-3 证明 status/issue 值未冻结。
5. **Finding #5 已修**：14 类 blocked matrix 已逐类断言 exact `issueId/category/reason`，并保留 zero-mutation/redaction/tree equality。
6. **Finding #6 已修**：shared contract、runner 与 CR01–06 的 ZH/EN source entrypoint已补明确 no-title/name/slug/filename rederive hard gate，installed active ZH parity 也已被正向断言。
7. **Finding #7 已修**：bare/prefixed/dotted placeholder 及 shell/JS/template interleaved mutation 已进入 bounded detector，frozen roots、exact ledger 与 `active-canonical=[]` 保持。

## Scope Audit（范围审计）

- 本层仅复核 Round 3 七项修复及 Story 11.9 full contract closure；三项 finding 均可由 current control flow/test oracle 直接构造，不依赖 Story 11.10 或外部变更。
- 未要求修改 report basename、CR algorithm、round numbering、approval policy、Story 11.10、drawer/zip、workspace mirrors、fixed-count baselines 或 history/archive。
- 未运行 build、full suite、packaging、canonical governance 或 focused suite；Round 3 Fix Summary 记录的 `36 passed / 4 todo` 仅作为既有 evidence，不替代本轮静态反例。
- 唯一新增文件为本 Round 4 Blind 报告；未改 source、tests、fixtures、Story、tracker、completion gate 或 root logs。

## Owner Gate（Owner 门禁）

**Owner Gate：`NONE`。** 三项正确行为都已由 Story AC、Round 3 GREEN criteria 与 shared CR contract冻结：真实 runner 必须能判定 completed legacy；ordinary notes 必须保持 unrelated；leaf 只能在完整、成功、无 issue 的 frozen resolver outcome 上进入 mutation。可交 Aggregator/Evaluator 独立裁决，本层不授权 Fixer。
