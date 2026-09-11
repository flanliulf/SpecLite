---
Story: 11-9
Round: 3
Date: 2026-09-05
Model Used: GPT-5.6
Layer: Blind Hunter
Verdict: FAIL
---

# Blind Review（盲审）

## Verdict（结论）

**FAIL**。Round 2 Revision 2 的六项修复主干已经落地：canonical/legacy 统一 invalid-evidence 分支、真实 predecessor/hash 校验、CR01–06 共享 test-only preflight、blocked-class zero-mutation matrix、source/installed entry activation parity 与扩展 candidate detector 均可定位。但当前实现仍有 **4 个 bounded P1**，且都属于 Round 2 已冻结的 GREEN criteria，而不是新需求：malformed filename signal 仍可在 canonical root 被当作 unrelated；finalizer 仍未绑定 CR04/CR05 到 current evaluation，也没有证明 required tracker change set 真实；leaf executable oracle 不携带或校验 `reviewSeries`；candidate detector 的 “shell/config concat” fixture 只是连续 token，仍漏 quoted/interleaved concat。

- **P1：4**
- **P2：0**
- **Owner Gate：`NONE`**
- **Review boundary**：Story 11.9 current resolver、focused contract test、classified ledger、Round 2 Revision 2 evaluation/Fix Summary 与 shared CR contract。
- **Explicit exclusions**：未运行 build、full suite、packaging 或 canonical governance；未将 Story 11.10、`speclite-drawer-er-modeler/`、zip、workspace `.agents` / `.claude` mirrors 或 fixed-count drift归入 Story 11.9 finding；未修改源码、Story、tracker、completion gate 或 root goal records。

## P1 Findings（P1 发现）

### P1-1 Malformed round filename 会绕过 canonical current-signal fail-close

- **Location**：`assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs:252-262,297-303,333-339`；`test/code-review-contract.test.ts:649-681`
- **Evidence**：`inspectCandidate()` 只有在 `looksLikeCrArtifactSignal()` 返回 true 后才会执行 canonical identity 校验；但 signal predicate 对 known family 仍要求 filename 先匹配 `-round-[0-9]+.md`。因此 `11-9-code-review-summary-20260905-main-round-nope.md`、`...-round-.md` 等明显属于 current Story/family/series 的 malformed artifact 会在第 254 行被直接 `continue`，令 `currentArtifactCount===0` 并返回 `no-current-series-evidence`。canonical 分支不会像 empty legacy 那样阻断，最终仍返回 canonical success。Round 3 tests只把“malformed”定义成合法 filename + 坏 frontmatter，没有 filename-level malformed mutation。
- **Concrete failure**：`11-9-code-review/` 仅含 `11-9-code-review-summary-20260905-main-round-nope.md` 时，resolver把该目录当作 genuinely unrelated new-run state，而不是 `current-series-evidence-invalid`。
- **Consequence**：runner 可在已经存在但轮次不可解析的 canonical run 上继续写入，Round 2 Finding #1 的 “一旦含 malformed current artifact signal即 stable block” 仍未闭合。
- **Classification**：`patch`。先按 current Story + known artifact family + current series识别 signal，再将不满足 exact canonical basename/round 的文件归入 invalid evidence；补 canonical filename-malformed 与同一 zero-mutation adapter case，同时保持 ordinary notes/其他 Story文件 unrelated。

### P1-2 `DONE` authenticity 仍未绑定 CR04/CR05 evaluation lineage 与真实 required trackers

- **Location**：`resolve-cr-directory.mjs:396-464,503-523`；`test/code-review-contract.test.ts:684-711,1472-1597`；`speclite-code-review-contract/references/cr-contract.md:396-406`
- **Evidence**：`validDoneFinalizer()` 对 CR04/CR05 predecessor只检查通用 Story/series/round identity、`generatedAt`/`modelUsed` 和 `result: COMPLETED`（第 423-432 行），没有要求两份报告的 `evaluationSource` / `evaluationSourceHash` 指向并哈希绑定本轮 current evaluation。测试 helper `currentRulesArtifact()` 与 `currentTodoArtifact()` 完全没有这些 lineage 字段，却被 `writeAuthenticCompletedRound()` 当作 authentic happy path。与此同时，`validTrackerChangeSet()` 只接受“任意三个不同 portable path + 任意非空 key + 形状正确的 hash”，不核对 Story、sprint、workflow 三个 required tracker exact path/key，也不读取当前 tracker验证 `afterHash`；fixture甚至使用不存在且非真实 Story filename的 `_bmad-output/implementation-artifacts/stories/11-9.md` 仍能判 DONE。
- **Concrete failure**：攻击者可复用同 Story/round但属于另一 evaluation 的 `COMPLETED` CR04/CR05，或在 finalizer中填入三个无关文件及假 before/after hash；只要 source文件自身 hash匹配，resolver仍把 unfinished legacy 判为 completed并切到 canonical sibling。
- **Consequence**：CR04/CR05 可绕过 current evaluation binding，tracker coordinated write也可被纯文本伪造；Round 2 Finding #2 与 shared completion-freshness #6/#7 仍为 partial。
- **Classification**：`patch`。校验 CR04/CR05 的 current evaluation basename/hash lineage及其 operation/result约束；冻结并核对 required Story/sprint/workflow tracker exact paths/keys，并至少把 current after-state与 `afterHash`/reread evidence绑定。补 missing/wrong evaluation lineage、arbitrary tracker path/key与 fake after-hash mutation。

### P1-3 Leaf executable preflight 没有任何 `reviewSeries` binding

- **Location**：`test/code-review-contract.test.ts:945-980,1269-1312`
- **Evidence**：Round 2 Revision 2 要求 test-only oracle验证 Story/**series** binding；但 `resolved`、`supplied` required fields与 `runLeafFrozenContextPreflight()` 的比较项都没有 `reviewSeries`。`invalidContexts` 只覆盖 `storyId` mismatch，没有 `reviewSeries` missing/mismatch。于是 six-leaf replay能够在 leaf仍消费错误 series或重新默认到 `main` 时保持全绿，且 callback照常执行一次。
- **Concrete failure**：runner resolver按 `reviewSeries=main` 冻结目录后，任一 leaf收到或内部采用 `reviewSeries=retry`；当前 oracle没有字段可表达该差异，仍返回 `{ok:true}` 并进入 mutation callback。
- **Consequence**：same directory 内不同 review series可能交叉消费 round/evaluation，违反 Round 2 Finding #3 已冻结的 identity binding 与 write-before-HALT evidence。
- **Classification**：`patch`。让唯一 shared test-only adapter携带 resolver input中冻结的 `reviewSeries`，逐 CR01–06覆盖 missing/mismatch series并断言 stable HALT + zero callback；无需修改 leaf algorithm。

### P1-4 Candidate detector 仍漏 quoted/interleaved shell 与 config concat

- **Location**：`test/code-review-contract.test.ts:1043-1072,1407-1421`
- **Evidence**：名为 `shell-concat` 的 mutation实际生成连续字符串 `$story_id-$story_slug-code-review`，由普通 placeholder pattern即可命中；它没有插入 shell/config表达式中常见的 quote、brace或 operator边界。当前 concat regex只接受 bare identifier + `"-"` + bare identifier，placeholder regex又要求 title placeholder紧邻 `-code-review`。因此 `cr_dir="${story_id}"-"${story_slug}"-code-review`、`crDir: "{story_id}-" + "{story_slug}-code-review"` 这类同义 producer不匹配六条 pattern，也不会进入 ledger/unclassified fail-close。
- **Concrete failure**：在任一 frozen active package加入 `cr_dir="${story_id}"-"${story_slug}"-code-review`；recursive inventory仍会读取文件，但 detector产出零 token，`actual===expected` 与 `active-canonical=[]` 继续成立。
- **Consequence**：Round 2 Finding #6 的 shell/config concat family只被 fixture名称覆盖，没有被真实语法边界覆盖；active title-bearing producer仍可 false-green。
- **Classification**：`patch`。把 mutation oracle改成带真实 quote/operator边界的 shell与config variants，并让 detector识别归一化后的 identity/title/code-review token序列；任何新增 match仍应未分类即失败，勿扩大 frozen roots。

## P2 Findings（P2 发现）

无。

## Positive Evidence（已验证正向证据）

1. canonical 与 legacy 的已识别 invalid candidate现在统一进入 `invalidCandidates`，canonical可返回 `current-series-evidence-invalid`；ordinary notes与其他 Story的合法 artifact仍保持 unrelated。
2. finalizer predecessor/gate已采用 no-follow regular-file读取、same candidate/root containment、canonicalized SHA-256、same Story/series/round identity与 gate freshness校验。
3. CR01–06 已共享单一 test-only frozen-context adapter，并覆盖四个目录字段的缺失、值不等、mode/path/set、Story与 title fallback callback-zero。
4. runner-wide matrix已覆盖 dual/multi、ancestor/candidate/artifact/root I/O与 invalid project root，并对 project/external controlled tree做 hash快照。
5. source ZH/EN entrypoint与 `.agents` / `.claude` installed active `SKILL.md` parity已按 Revision 2 的真实 installer surface分层；installed `SKILL.en.md` 明确断言 `ENOENT`。
6. candidate scan保留 frozen roots、no-follow inventory、byte-wise排序、exact ledger与 active-canonical zero，并已覆盖中文、underscore/space、alternate placeholder、bare JS concat与 array join的基础变体。

## Scope Audit（范围审计）

- 本层只复核 Round 2 Revision 2 六项修复及其 full contract closure；四项均能由 current control flow或 test helper直接构造失败场景。
- 未要求修改 report basename、CR algorithm、round numbering、approval policy、shared schema、Story 11.10、drawer/zip、workspace mirrors、fixed-count baselines或 history/archive。
- 未运行 build、full suite、packaging、canonical governance或 focused suite；Round 2 Fix Summary记录的 `35 passed / 4 todo` 仅作为既有 evidence，不替代本轮静态反例。
- 唯一新增文件为本 Round 3 Blind报告；未改 source、tests、fixtures、Story、tracker、completion gate或 root logs。

## Owner Gate（Owner 门禁）

**Owner Gate：`NONE`。** 四项正确行为都已由 Round 2 Revision 2 的 GREEN criteria与 shared CR contract冻结：malformed current signal必须 fail-close；CR04/CR05与 tracker evidence必须真实绑定；leaf必须验证 Story/series identity；candidate detector必须覆盖真实 shell/config concat syntax。可交同轮 Aggregator/Evaluator独立裁决，本层不授权 Fixer。
