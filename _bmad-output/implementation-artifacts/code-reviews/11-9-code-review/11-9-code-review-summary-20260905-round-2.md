---
Story: 11-9
Round: 2
Date: 2026-09-05
Model Used: GPT-5.6
Type: Code Review Summary
---

## Review Conclusion（审查结论）

Blind Hunter、Edge Case Hunter、Acceptance Auditor 三层正式结果均成功返回（`3/3`，无 timeout、empty output 或降级），三层均为 **FAIL**。Aggregator 按 `bmad-code-review` 对三份 layer report 做 best-effort normalization，并独立核对 Story 11.9、Round1 summary/evaluation/Fix Summary、shared CR contract、current resolver、runner/CR01–06、focused tests、classified ledger 与 completion gate。

三层共提出 `11` 条原始 finding；按 root cause 合并后为 **6 个 P1**、**0 个 P2**、**0 个 decision-needed**、**0 个 defer**、**0 个 dismissed**，**Owner Gate: NONE**。重复项仅做来源合并，不计为 dismissed。Round1 的 ancestor containment 与 stable/redacted I/O 已关闭；canonical candidate evidence、DONE authenticity、leaf frozen-context enforcement、runner-wide zero mutation、installed entrypoint parity 与 candidate scan 仅部分关闭。

总体结论为 **FAIL**。本结果构成 latest Reviewer Round 2 正式 findings；必须由 fresh Evaluator 独立裁决后，才可授权 bounded Fixer。Current completion gate 的 external drawer `PASS_EQUIVALENT` 隔离理由本身仍可接受，但不能豁免以下六项 Story 11.9 阻塞项，也不得用于 CR06。

## Layer Results（三层结果）

| Layer | Execution | Formal result | Aggregated result |
| --- | --- | --- | --- |
| Blind Hunter | PASS | `FAIL` / 3 P1 / 0 P2 | 三项均接受；分别并入 canonical evidence、DONE authenticity 与 candidate scanner root cause。 |
| Edge Case Hunter | PASS | `FAIL` / 6 P1 / 0 P2 | 六项均接受；canonical、DONE、matrix 与 scanner 分别和其他层重复项合并。 |
| Acceptance Auditor | PASS | `FAIL` / 2 P1 / 0 P2 | 两项均接受；分别并入 candidate scanner 与 runner-wide zero-mutation matrix。 |

## Findings（发现）

### P1-1 — Canonical candidate 的 malformed/unbound current-series evidence 被静默放行

- **来源**：blind + edge
- **分类**：patch
- **位置**：`assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs:102-147,246-292`；`test/code-review-contract.test.ts:611-654`
- **证据**：`inspectCandidate()` 会把 canonical-family basename 配 malformed、wrong-story/series/round、非 current disposition 等证据归为 `no-current-series-evidence`；但外层只对 `legacy` 计算 `invalidLegacy`。同一非法 current-series artifact 位于 canonical `11-9-code-review/` 时不进入任何 failure branch，最终固定返回 `ok=true, compatibilityMode=canonical`。Round1 新增负例只覆盖 legacy candidate，没有覆盖 canonical candidate。
- **影响**：runner 可在无法唯一绑定 current Story/series/round 的 canonical run 上继续写入，破坏 AC4、AC9、AC11 的 single-run identity 与 ambiguity stop；Round1 #2/#3 的 evidence fail-close 在 canonical 分支仍未闭环。
- **修复义务**：统一 canonical/legacy 的 candidate evidence 判定；仅真正 empty/unrelated、没有 current-series candidate signal 的 canonical new-run 状态可继续，任何看似 current-series但 identity/round 无法绑定的 artifact 必须返回 stable diagnostic。补 canonical malformed、wrong-story/series/round、arbitrary-family 与 zero-mutation fixtures。

### P1-2 — `DONE` finalizer 未验证完整 v2 状态、predecessor 文件与真实 hash

- **来源**：blind + edge
- **分类**：patch
- **位置**：`resolve-cr-directory.mjs:253-287,345-367`；`test/code-review-contract.test.ts:1140-1161`；`speclite-code-review-contract/references/cr-contract.md:283-329,392-406`
- **证据**：`validDoneFinalizer()` 只校验 `result: DONE`、四个 source basename 的字符串形状、completion-gate basename 形状和五个 `sha256:<64 hex>` 字面格式。它没有要求或验证完整 v2 identity/state（包括 `storyKey`、`generatedAt`、`modelUsed`、`evaluationVerdict`、`scopeHash`、`completionGateResult`/freshness、`trackerWrites`/change set/reread consistency）；也不 no-follow 读取 referenced review/evaluation/CR04/CR05/gate，未验证文件存在、regular-file type、同一 Story/series/round identity与 canonicalized content hash。测试 helper 使用不存在的 predecessor 和全 `a` 假 hash，仍被视为 authentic completed。
- **影响**：未通过 evaluation、completion gate、CR04/CR05 或 tracker reread 的 legacy run可被伪造为 completed，resolver随后切到 canonical sibling，拆分同一 Story lifecycle；Round1 #3 仅关闭 filename/frontmatter 基础形状，未关闭真实性。
- **修复义务**：按 shared contract 验证完整 required finalizer identity、允许 verdict/gate/tracker 状态与 freshness；所有 referenced current artifacts必须位于规定 root、为 no-follow regular file、identity绑定一致，并按合同 canonicalization 核对真实 hash。任一缺字段、非允许状态、missing source、hash mismatch或错绑 gate均 stable block。

### P1-3 — Leaf frozen context 只有 prose/substring assertion，缺少可执行 fail-close consumer oracle

- **来源**：edge
- **分类**：patch
- **位置**：`test/code-review-contract.test.ts:771-797,913-927`；CR01–06 `references/*workflow.md` 的 `Directory Preflight`
- **证据**：runner 已向 CR01–06 显式传递 `crDir/canonicalCrDir/compatibilityMode/legacyArtifactPaths`，六个 leaf workflow 也声明 missing/mismatch 必须 write-before HALT；但 focused test只检查 invocation 与中文 prose substring。当前没有执行 consumer preflight 的 oracle，不能证明字段缺失、值不等、mode/path/set 不相容、Story/series binding mismatch或 title fallback 出现时，artifact/temp/backlog/tracker write callback 在真实 leaf boundary 前不可达。
- **影响**：workflow 文案保持不变时，leaf 或后续 executable wrapper仍可忽略、重排或重新推导冻结 context，而测试继续为绿；Round1 #4 的四字段传播主体已关闭，但 AC4/AC5 的端到端 enforcement evidence 仍是 partial。
- **修复义务**：增加共享 test-only 或 executable leaf preflight oracle，并逐 CR01–06 注入四字段缺失/mismatch、mode/path/set 与 identity 不相容；每例验证 stable HALT、write callback 为零、不得重跑 resolver或按 title 重推导。不得改变各 leaf 的 review/fix/closeout algorithm。

### P1-4 — Runner-wide zero-mutation 只验证单一 synthetic unbound case

- **来源**：edge + auditor
- **分类**：patch
- **位置**：`test/code-review-contract.test.ts:711-738,1012-1019`
- **证据**：测试标题声称覆盖 every blocked preflight，但函数体只创建一个 `legacy/unbound.md` case，并通过测试内 `runResolverPreflight()` 的 `if (outcome.ok) mutation()` 验证一次 callback-zero/tree unchanged。Round1 Evaluator 冻结的 dual canonical+legacy、multi-legacy、ancestor symlink/non-directory、candidate symlink/non-directory、malformed/unbound 与 inspection I/O failure均未经过同一 Story/tracker/goal/temp/progress exact snapshot oracle。
- **影响**：resolver unit tests能证明部分 reason 返回 block，却不能证明 runner ordering在每类 blocked preflight下均先于所有 mutation；completion gate 的 runner-wide zero-mutation 声明高于 current executable matrix，违反 AC9/AC11 与 shared stop-before-write contract。
- **修复义务**：用同一 runner preflight adapter参数化所有冻结 blocked classes；每例均对完整受控 tree 的 path/type/size/SHA-256 做 before/after exact equality，并断言真实 mutation callback零调用。只补 bounded evidence，不修改 runner algorithm。

### P1-5 — Fresh-install parity 遗漏 runner/contract/CR01–06 的 ZH/EN entrypoints

- **来源**：edge
- **分类**：patch
- **位置**：`test/code-review-contract.test.ts:876-927`；Story File List 中 runner、contract、CR01–06 的 `SKILL.md` / `SKILL.en.md`
- **证据**：fresh-install fixture的 `parityPaths` 只覆盖 shared contract reference、resolver script、runner workflow和六个 leaf workflows；没有比较 runner、contract、CR01–06 的 `SKILL.md` 与 `SKILL.en.md`。Round1 Evaluator明确要求两个 IDE target覆盖 changed entrypoints/workflows；current installed invariant重放也直接读取 workflow而非从 ZH/EN entrypoint证明其加载同一 workflow/contract。
- **影响**：canonical workflow与resolver parity可同时为绿，而最终用户入口仍可能是旧版、未激活新 workflow或仍接受 title-derived fallback，无法证明 AC4、AC5、AC7 的 installed runtime truth。
- **修复义务**：把 shared contract、runner、CR01–06 的 ZH/EN entrypoints纳入 `.agents/.claude` deterministic byte parity，并从 installed entrypoint验证其引用/激活同一 changed workflow与 contract；不得修改 workspace mirrors。

### P1-6 — Candidate scanner 漏中文、下划线、分段拼接与 alternate placeholder

- **来源**：blind + edge + auditor
- **分类**：patch
- **位置**：`test/code-review-contract.test.ts:1029-1121`；`test/fixtures/code-review-contract/title-bearing-path-ledger.json`
- **证据**：no-follow roots、regular-file inventory与 exact ledger已建立，但 candidate集合仍由三条连续文本 regex决定。Concrete pattern只接受 ASCII `[a-z][a-z0-9-]*`，漏掉 `11-9-中文-code-review`、underscore/space title；placeholder pattern要求相邻 token，漏掉 shell/JS/config的分段拼接、quoted concat、`.join("-")` 与 alternate placeholder。测试只验证当前 scanner输出等于 ledger，以及 duplicate/symlink/non-file fail-close，没有注入这些 semantic-equivalent mutation并证明其成为 unclassified match。
- **影响**：frozen active root中可新增 title-bearing producer而完全不进入 `actual`；ledger仍相等、`active-canonical=[]`，AC7/AC10/AC11继续 false-green。Round1 #8 已关闭 inventory breadth，但 expression-family detection仅部分关闭。
- **修复义务**：冻结并覆盖 concrete Unicode/underscore/space、shell/JS concatenation、template/config与 alternate placeholder families，或改用能识别 CR-directory-producing assignment/command的结构化 detector；逐 family加入 mutation oracle，任何新增 match必须未分类即 fail-close，同时保持 Story 11.10、drawer、workspace mirrors与 history排除。

## Deduplication And Parsing（去重与解析）

- `P1-1` 合并 Blind #1、Edge #1。
- `P1-2` 合并 Blind #2、Edge #2。
- `P1-3` 接受 Edge #3；它与四字段传播相关，但 root cause 是 leaf consumer enforcement evidence，而非 runner invocation字段缺失，故独立保留。
- `P1-4` 合并 Edge #4、Acceptance #2。
- `P1-5` 接受 Edge #5；它是 installed ZH/EN entrypoint projection gap，不与 source workflow propagation合并。
- `P1-6` 合并 Blind #3、Edge #6、Acceptance #1。
- Edge layer使用结构化 Markdown而非 Skill期望的 JSON array；其 location、trigger、consequence与guard字段完整，best-effort normalization无信息损失。Blind与Acceptance均可直接解析。
- Valid layers=`3/3`；failed layers=`0`；duplicates merged=`5`；dismissed=`0`。

## Round1 Closure Audit（Round1 闭环审计）

| Round1 finding | Result | Round2 evidence |
| --- | --- | --- |
| #1 ancestor containment | **CLOSED** | Missing-root ancestor 已逐段 no-follow/type/realpath containment；本轮无反例。 |
| #2 legacy current-series evidence | **PARTIAL** | Legacy malformed/unbound已阻断，但同类 canonical evidence仍被放行。见 `P1-1`。 |
| #3 finalizer authenticity | **PARTIAL** | Canonical basename与基础 frontmatter binding已建立，但完整 v2 state、predecessor存在性和真实 hash未核实。见 `P1-2`。 |
| #4 frozen context propagation | **PARTIAL** | Runner四字段逐 leaf传播已建立，但 leaf mismatch-before-write仅有 prose/substring evidence。见 `P1-3`。 |
| #5 stable/redacted I/O | **CLOSED** | Inspection failure已收敛为stable single-JSON/redacted diagnostic；本轮无反例。 |
| #6 runner-wide zero mutation | **PARTIAL** | Controlled-tree oracle已建立，但只覆盖一个 unbound legacy case。见 `P1-4`。 |
| #7 installed CR01–06 parity | **PARTIAL** | Contract/resolver/workflow parity已覆盖，但 changed ZH/EN entrypoints仍遗漏。见 `P1-5`。 |
| #8 full classified scan | **PARTIAL** | Frozen no-follow inventory与ledger已建立，但 semantic token families不完整。见 `P1-6`。 |

## Acceptance Criteria Impact（验收标准影响）

| AC | Result | Blocking findings |
| --- | --- | --- |
| AC1–AC3 | PASS | Numeric-only root、title isolation与 ancestor containment本轮无新阻塞。 |
| AC4–AC7 | FAIL | `P1-1`、`P1-3`、`P1-5` 使 canonical recovery与 source-to-installed frozen context enforcement未闭环。 |
| AC8–AC9 | FAIL | `P1-1`、`P1-2` 仍可误续写 canonical run或误判 legacy completed，破坏 no-migration/single-run semantics。 |
| AC10 | FAIL | `P1-6` 的 detector盲区使 active title-bearing role为零无法被证明。 |
| AC11 | FAIL | `P1-1`–`P1-6` 均缺少对应反例或全链 executable evidence。 |
| AC12 | PASS | 本轮未发现 report basename、CR algorithm、round numbering或 approval rules被改变。 |

## Verification And Boundary（核证与边界）

- 三份 Round2 layer artifact SHA-256：Blind `122f5dd9f4c3edd772d851a7ded94fb18ca007fdc3b408ba50c464c38fc40b7f`；Edge `181e8ab5462a99f4d7b1d8abc40ed950db23f373a1a9b05fd9d8e9d9e0606676`；Acceptance `82800d0e6250d551f7d3b3e630a36d9411293271aa68e53f17f48fd8c493bf77`。核证时 `HEAD=ff7528d3f9ec34072bb669ee79f7569345c23d47`。
- 独立读取 current resolver关键分支、shared finalizer contract、runner/CR01–06 entrypoint与 workflow、focused test helpers、ledger、Story及 Round1 evaluation/Fix Summary；未复跑 build、full suite、packaging或 canonical governance。
- Focused `31 passed / 4 todo` 证明现有 covered paths，但不能否定六项 scanner/contract/evidence盲区；四个既有 TODO未被升格为本轮 P2。
- External `speclite-drawer-er-modeler/` 与 zip仍仅是 fixed-count caveat；没有将其、workspace `.agents/.claude` mirrors、Story 11.10或其他 Epic 11 accumulated changes归入 Story 11.9 finding。
- 本 Aggregator仅创建本 summary；未修改 source、tests、fixtures、Story、tracker、completion gate、root goal records或既有 CR artifacts。

## Owner Gate（Owner 门禁）

**Owner Gate：`NONE`。** 六项正确行为均由 Story 11.9、Round1 Evaluator冻结的 GREEN criteria与 shared CR contract唯一确定：所有 candidate evidence一致 fail-close、真实且完整绑定的 DONE、leaf write-before enforcement、全 blocked-class zero mutation、installed ZH/EN entrypoint parity与完整 candidate expression families。无需新增产品、Architecture或scope裁决。

## Final Verdict（最终裁决）

**FAIL — 6 P1、0 P2、Owner Gate NONE；valid layers 3/3。**

下一步进入 fresh Evaluator Round 2。Evaluator必须逐项独立确认或驳回，并给出 bounded Fixer authorization；在 Evaluator正式裁决前不得修改源码，也不得进入 CR04、CR05或 CR06。
