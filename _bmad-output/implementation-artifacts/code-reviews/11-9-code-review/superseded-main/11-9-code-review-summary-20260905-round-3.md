---
Story: 11-9
Round: 3
Date: 2026-09-05
Model Used: GPT-5.6
Type: Code Review Summary
---

## Review Conclusion（审查结论）

Blind Hunter、Edge Case Hunter、Acceptance Auditor 三层正式结果均成功返回（`3/3`，无 timeout、empty output 或降级），三层均为 **FAIL**。Aggregator 按 `bmad-code-review` 对三份 layer report 做 best-effort normalization，并独立核对 Story 11.9、Round1/2 summary、Round1/2 evaluation 与 Fix Summary、shared CR contract、current resolver、focused executable oracle、source/installed activation checks、classified candidate scanner及 completion gate。

三层共提出 `13` 条原始 finding；按 root cause 合并后为 **7 个 P1**、**0 个 P2**、**0 个 decision-needed**、**0 个 defer**、**0 个 dismissed**，**Owner Gate: NONE**。重复项仅做来源合并，不计为 dismissed。Round1 的 ancestor containment 与 stable/redacted I/O 保持关闭；Round2 六项修复均已建立主体，但 canonical filename intent、DONE lineage/tracker authenticity、leaf完整 frozen identity、blocked reason、entrypoint禁止性语义和 detector semantic families仍为 partial。

总体结论为 **FAIL**。本结果构成 latest Reviewer Round 3 正式 findings；必须由 fresh Evaluator 独立裁决后，才可授权 bounded Fixer。Current completion gate 的 external drawer `PASS_EQUIVALENT` 隔离理由本身仍可接受，但不能豁免以下七项 Story 11.9 阻塞项，也不得用于 CR04、CR05或 CR06。

## Layer Results（三层结果）

| Layer | Execution | Formal result | Aggregated result |
| --- | --- | --- | --- |
| Blind Hunter | PASS | `FAIL` / 4 P1 / 0 P2 | 四项均接受；DONE finding拆为 evaluation lineage 与 tracker authenticity，其余与 Edge/Auditor重复项合并。 |
| Edge Case Hunter | PASS | `FAIL` / 7 P1 / 0 P2 | 七项均接受；DONE两项保持独立，其余重复项按共同 root cause合并。 |
| Acceptance Auditor | PASS | `FAIL` / 2 P1 / 0 P2 | 两项均接受；DONE finding分别并入 lineage/tracker，两类 detector漏扫合并为一个 scanner-completeness root cause。 |

## Findings（发现）

### P1-1 — Canonical known-family 的 malformed filename 会绕过 current-signal fail-close

- **来源**：blind + edge
- **分类**：patch
- **位置**：`assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs:252-262,297-303,333-339`；`test/code-review-contract.test.ts:649-681`
- **证据**：`inspectCandidate()` 仅在 `looksLikeCrArtifactSignal()` 为 true 后才执行 strict suffix/identity校验；但 signal predicate要求 known family已经匹配 numeric `-round-[0-9]+.md`。例如 `11-9-code-review-summary-20260905-main-round-nope.md` 或 `...-round-.md` 明确携带 current Story、family与series intent，却在第254行被当作 unrelated跳过，使 canonical candidate返回 `no-current-series-evidence`并可继续 new run。Round2 canonical matrix只覆盖合法 filename加坏 frontmatter，没有覆盖 filename-level malformed mutation。
- **影响**：runner可在已存在但轮次不可解析的 canonical lifecycle上继续写入，破坏 AC9/AC11 的 malformed evidence fail-close；Round2 Finding #1仅关闭合法 filename内的 malformed binding，仍为 partial。
- **修复义务**：先按 current Story + known family + current series识别 artifact intent，再严格校验 date/round/extension；intent已命中但 basename不合法必须稳定返回 `current-series-evidence-invalid`，并补 canonical filename-malformed及同一 zero-mutation adapter case。普通 notes和其他 Story artifact仍须保持 unrelated。

### P1-2 — CR04/CR05 `COMPLETED` 未绑定 current evaluation basename/hash

- **来源**：blind + edge + auditor
- **分类**：patch
- **位置**：`resolve-cr-directory.mjs:396-433,467-477`；`test/code-review-contract.test.ts:1472-1501,1521-1548`；`speclite-code-review-contract/references/cr-contract.md:392-406`
- **证据**：`validDoneFinalizer()` no-follow读取 CR04/CR05并核对通用 Story/series/round identity、时间、model和 `result=COMPLETED`，但未要求这两份报告携带 `evaluationSource` / `evaluationSourceHash`，也未验证它们与本次 current evaluation basename及 canonicalized hash一致。当前 `currentRulesArtifact()`、`currentTodoArtifact()`完全缺少两字段，却仍由 `writeAuthenticCompletedRound()`构造 authentic DONE happy path，直接低于 shared Completion Freshness #7。
- **影响**：同 Story/round但来自另一 evaluation或跳过 current RULES/TODO lineage的报告仍可促成 legacy `DONE`，随后错误切换 canonical sibling，破坏 AC8/AC9/AC11。
- **修复义务**：要求 CR04/CR05各自的 current evaluation basename/hash精确绑定 finalizer引用的真实 evaluation bytes，并补 missing、wrong source与 hash mismatch反例；只强化已有 schema/operation/result约束，不改变 CR04/CR05或 finalizer algorithm。

### P1-3 — Tracker change set 只验形状，不验 required role、真实路径/key与写后状态

- **来源**：blind + edge + auditor
- **分类**：patch
- **位置**：`resolve-cr-directory.mjs:402-411,503-523`；`test/code-review-contract.test.ts:1551-1595`；`speclite-code-review-contract/references/cr-contract.md:392-406`
- **证据**：`validTrackerChangeSet()`只接受任意三个不同 portable path、任意非空 key、格式正确的 hash与文本 `rereadConsistent=true`，未冻结 Story、sprint、configured workflow三种 required tracker identity，也未 no-follow读取当前 tracker核对 canonicalized `afterHash`。GREEN helper甚至使用不存在且非真实 Story filename的 `_bmad-output/implementation-artifacts/stories/11-9.md` 和纯构造 hash，仍能促成 authentic DONE。
- **影响**：finalizer可用三个无关路径、错误 key或假写后 hash伪造 coordinated tracker completion，使 unfinished legacy误判为 completed；违反 Completion Freshness #6和 AC8/AC9/AC11。
- **修复义务**：从冻结输入核对三种 required tracker exact path/key role，并以 no-follow regular-file reread验证当前 canonicalized after-state与 `afterHash`；补 arbitrary path/key、missing真实 tracker及 fake after-hash mutation。若现有 resolver边界无法获得 configured tracker identity，Fixer必须按 Evaluator裁决 HALT，不得猜测路径。

### P1-4 — Leaf executable oracle 未冻结 `reviewSeries`，也未拒绝真实 title-derived extra fields

- **来源**：blind + edge
- **分类**：patch
- **位置**：`test/code-review-contract.test.ts:945-980,1269-1312`
- **证据**：`resolved`、`supplied` required fields及 `runLeafFrozenContextPreflight()`均没有 `reviewSeries`，因此无法表达 runner解析 `main`而 leaf消费 `retry` 的 mismatch。额外输入只显式拒绝人为字段 `titleFallback`；`storyTitle`、`storySlug`、`storyName`、`storyFilename`、`crDirCandidate`等真实 title-derived surface会被忽略并执行 mutation callback。Round2 GREEN criterion明确要求 Story/series binding与 title/slug/filename fallback均在 write前 fail-close。
- **影响**：CR01–06可跨 series消费同目录 artifacts或继续接受本地 title-derived candidate，而 focused oracle仍 false-green，违反 AC4/AC5/AC11；Round2 Finding #3仅部分关闭。
- **修复义务**：让唯一 shared test-only adapter携带并严格比较冻结的 `reviewSeries`，定义 exact accepted context schema或显式拒绝全部真实 title/slug/name/filename/candidate派生字段；逐 CR01–06注入 missing/mismatch/extra-field并断言稳定 HALT与 callback零调用，不修改 leaf algorithm。

### P1-5 — 14 类 blocked zero-mutation matrix 未冻结逐类 stable reason

- **来源**：edge
- **分类**：patch
- **位置**：`test/code-review-contract.test.ts:768-883`
- **证据**：matrix已覆盖 dual、multi、canonical/legacy malformed、ancestor/candidate/artifact/root I/O与 invalid-project-root共14类，并验证 controlled-tree零变化；但除 `invalid-project-root`外，大多数 case仅断言 `details.reason: expect.any(String)`。reason被映射到另一稳定码或意外新增值时，focused suite仍会通过；这不满足 Round2 Finding #4 GREEN中“每例 stable issue/reason”的冻结要求。
- **影响**：调用方可能收到错误 lifecycle/unsafe分类并走错恢复或诊断分支，而 completion evidence仍宣称 runner-wide stable diagnostic closure，违反 AC9/AC11。
- **修复义务**：建立冻结的 `{blockedClass -> issueId/category/reason}` expected table并逐例精确断言；I/O classes只允许合同定义的有限 reason，继续保留 callback-zero与 project/external tree exact equality。

### P1-6 — Source/installed activation测试未正向冻结 no-title-rederive 禁止性语义

- **来源**：edge
- **分类**：patch
- **位置**：`test/code-review-contract.test.ts:1109-1175`
- **证据**：source ZH/EN入口的 numeric assertion使用宽松 OR regex，匹配任一 `resolver evidence`即可；所谓 no-title fallback只断言不存在带 `derive/rederive/推导/派生` 的正向危险措辞，而未要求入口明确存在禁止 title/slug/filename重推导的 hard gate。installed active `SKILL.md`同样只排除一个相邻 `storyTitle|storySlug ... code-review` pattern。即使入口完全删除禁止性语义，byte parity只会证明缺失被一致复制，当前测试仍可为绿。
- **影响**：最终 active entrypoint可失去 AC4/AC7 的 single-resolution/no-title-fallback activation contract，而 installed parity继续 false-green；Round2 Finding #5仅部分关闭。
- **修复义务**：对 shared contract、runner、CR01–06八个 package的 source ZH/EN分别正向冻结 numeric resolver、workflow/contract activation与明确 no-title/slug/filename rederive语义，并对两个 IDE target的 installed active `SKILL.md`重放同一必需断言；保持 installed `SKILL.en.md` 为 `ENOENT`，不得扩 installer surface或修改 entrypoint以迎合测试。

### P1-7 — Candidate detector 漏 bare title/name/slug/filename 与真实 quoted/interleaved concat

- **来源**：blind + edge + auditor
- **分类**：patch
- **位置**：`test/code-review-contract.test.ts:1043-1072,1407-1421`
- **证据**：`titleName`仅包含 `storyKey/storySlug/storyName`及 underscore/dotted variants，遗漏 AC3明示的 bare `title`、`slug`、`name`、`filename`及等价 prefixed/dotted forms。现有 `shell-concat` / `template-concat` mutation实际仍生成连续 token，由普通 placeholder regex命中；concat regex只识别 bare identifier + JS式 `"-"` operator，漏掉 `${story_id}"-"${story_slug}"-code-review`、`"{story_id}-" + "{filename}-code-review"`、`${story.id}${"-"}${story.slug}${"-code-review"}`等真实 quoted/interleaved表达式。
- **影响**：frozen active roots中可新增语义等价 title-bearing producer而不产生 candidate；ledger仍 exact-equal且 `active-canonical=[]`，AC7/AC10/AC11继续 false-green。Round2 Finding #6仅部分关闭。
- **修复义务**：保持 frozen roots/explicit files不变，扩展 bounded detector至 bare及等价 prefixed/dotted title/name/slug/filename placeholder、shell/template/JS/config quoted或interleaved concat；逐 family使用真实分段字节注入，证明先被发现、再因未分类稳定失败。不得扩大到 Story 11.10、drawer、workspace mirrors或 history。

## Deduplication And Parsing（去重与解析）

- `P1-1` 合并 Blind #1、Edge #1。
- Blind #2、Edge #2/#3、Acceptance #1 的 combined DONE finding按独立 guard拆为 `P1-2` evaluation lineage与 `P1-3` tracker authenticity，避免一个 patch掩盖另一项真实性义务。
- `P1-4` 合并 Blind #3与 Edge #4；Acceptance将现有 leaf oracle标为 PASS，但没有覆盖两层给出的 `reviewSeries`与真实 extra-field反例，故不构成驳回证据。
- `P1-5` 接受 Edge #5；它是 matrix reason contract缺口，不与 zero-mutation tree oracle本体重复。
- `P1-6` 接受 Edge #6；byte parity与禁止性 activation semantics是不同证据，不因复制一致而关闭。
- `P1-7` 合并 Blind #4、Edge #7、Acceptance #2；bare变量与真实分段 concat同属 candidate-set completeness root cause。
- Edge layer使用结构化 Markdown而非 Skill期望的 JSON array；其 location、trigger、consequence与guard字段完整，best-effort normalization无信息损失。Blind与Acceptance均可直接解析。
- Valid layers=`3/3`；failed layers=`0`；duplicates merged=`6`；dismissed=`0`。

## Previous Closure Audit（既有闭环审计）

| Prior finding | Result | Round3 evidence |
| --- | --- | --- |
| Round1 #1 ancestor containment | **CLOSED** | 逐段 no-follow/type/realpath containment保持成立，本轮无反例。 |
| Round1 #5 stable/redacted I/O | **CLOSED** | single-JSON、redacted、有限 I/O diagnostic主体保持成立；本轮只发现逐类 reason未被测试精确冻结。 |
| Round2 #1 canonical malformed/unbound evidence | **PARTIAL** | 合法 numeric filename内的 malformed frontmatter已阻断；known-family filename本身 malformed仍被当作 unrelated。见 `P1-1`。 |
| Round2 #2 authentic `DONE` | **PARTIAL** | predecessor/gate no-follow、通用 identity与真实 source hash主体已建立；CR04/05 evaluation lineage和 required tracker真实写后状态仍缺。见 `P1-2`、`P1-3`。 |
| Round2 #3 leaf executable frozen context | **PARTIAL** | 四目录字段、Story和 synthetic `titleFallback`已进 shared oracle；`reviewSeries`及真实 title-derived extra fields未冻结。见 `P1-4`。 |
| Round2 #4 runner-wide zero mutation | **PARTIAL** | 14类与 controlled-tree exact equality已覆盖；逐类 stable reason未冻结。见 `P1-5`。 |
| Round2 #5 entry activation parity | **PARTIAL** | source/installed surface与 byte parity已按真实 installer边界建立；入口明确禁止性语义未正向断言。见 `P1-6`。 |
| Round2 #6 bounded candidate scanner | **PARTIAL** | Unicode、underscore/space、基础 alternate/concat/config及 ledger已建立；bare变量和真实 quoted/interleaved concat仍漏扫。见 `P1-7`。 |

## Acceptance Criteria Impact（验收标准影响）

| AC | Result | Blocking findings |
| --- | --- | --- |
| AC1–AC3 | **FAIL** | Runtime numeric-only resolver主体成立，但 `P1-7`使 title/name/slug/filename active-surface排除无法被 executable negative scan证明。 |
| AC4–AC7 | **FAIL** | `P1-4`、`P1-6`、`P1-7`使 Story/series frozen handoff、entry activation与全 active expression closure不完整。 |
| AC8–AC9 | **FAIL** | `P1-1`–`P1-3`可令 malformed canonical继续写入或伪造 completed legacy并切换 sibling；`P1-5`未冻结 stable recovery reason。 |
| AC10 | **FAIL** | `P1-7`使 candidate集合本身漏项，`active-canonical=[]`不能证明真实为零。 |
| AC11 | **FAIL** | 七项均缺对应反例或完整 executable binding，focused green不足以关闭。 |
| AC12 | PASS | 本轮未发现 report basename、CR algorithm、round numbering或 approval rules被改变。 |

## Verification And Boundary（核证与边界）

- 三份 Round3 layer artifact SHA-256：Blind `170caf2831d26967afc47f53e938bdf79eefd0a48b0b163e4461a7ce575a0a05`；Edge `3abbdd24ee21f026556f6632c91e14619f4a94becda54bdfc322d4cc9f907c7b`；Acceptance `fbb94d009516a21e2e69b7ec88085ff660a3ab005187ad6b3b662118fbef6122`。核证时 `HEAD=ff7528d3f9ec34072bb669ee79f7569345c23d47`。
- 独立读取 current resolver的 signal/DONE/tracker分支、shared Completion Freshness、focused leaf/matrix/activation/scanner helpers、Story、completion gate及 Round1/2 lineage；未运行 build、full suite、packaging或 canonical governance。
- Acceptance层本轮 focused evidence `35 passed / 4 todo`仅证明已覆盖路径为绿，不能反证七项未覆盖的 filename、lineage、identity、reason或 detector分支；四个既有 TODO未被升格为 P2。
- External `speclite-drawer-er-modeler/` 与 zip仍仅是 fixed-count caveat；没有将其、workspace `.agents/.claude` mirrors、Story 11.10或其他 Epic 11 accumulated changes归入 Story 11.9 finding。
- 本 Aggregator仅创建本 summary；未修改 source、tests、fixtures、Story、tracker、completion gate、root goal records或既有 CR artifacts。

## Owner Gate（Owner 门禁）

**Owner Gate：`NONE`。** 七项正确行为均已由 Story 11.9、Round2 Evaluator冻结的 GREEN criteria与 shared CR contract唯一确定：malformed filename intent必须 fail-close；CR04/CR05必须绑定 current evaluation；required trackers必须是真实指定对象并验证写后状态；leaf必须冻结 Story/series及拒绝 title-derived fallback；14类必须维持逐类 stable reason；active entrypoint必须明确禁止 title重推导；bounded scanner必须覆盖 AC3命名族与真实分段 concat。无需新增产品、Architecture或scope裁决。

## Final Verdict（最终裁决）

**FAIL — 7 P1、0 P2、Owner Gate NONE；valid layers 3/3。**

下一步进入 fresh Evaluator Round 3。Evaluator必须逐项独立确认或驳回，并给出 bounded Fixer authorization；在 Evaluator正式裁决前不得修改源码，也不得进入 CR04、CR05或 CR06。
