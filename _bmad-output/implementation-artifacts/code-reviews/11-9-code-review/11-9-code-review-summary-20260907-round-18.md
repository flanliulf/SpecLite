---
Story: 11-9
Round: 18
Date: 2026-09-07
Model Used: OpenAI GPT-5.6 Sol (gpt-5.6-sol)
Type: Code Review Summary
---

## Review Conclusion（审查结论）

本轮为 Round 17 bounded Fixer 后的 fresh 复审。Blind Hunter、Edge Case Hunter、Acceptance Auditor 三层均由独立 fresh agent 完成，正式输出为 `3/3`，无 timeout、empty output 或降级。受 root 与本 Reviewer 共用四个并发 slot 的调度限制，先并行执行 Blind Hunter + Edge Case Hunter，任一 slot 释放后再启动 Acceptance Auditor；三层没有共享其他层输出。Blind Hunter 严格只读取构建后的 `review-input.md`，未读取 Story、history、spec 或项目其他文件。

三层共返回 `20` 条 raw observations。Aggregator 结合 current source、Round 17 evaluation/Fix Summary、最新 completion gate与 parser-backed authentic recovery定向复现，去重并排除 truncated-input artifact、重复测试建议、已验证为合法的 bounded controls及需要通用 YAML parser 扩张的建议后，保留 **3 个 fresh production P1**；另保留 `supersededIndex` 为 carried deferred P2。总体结论：**FAIL / FIX_REQUIRED**。

Round 17 两项修复在既有 mapping / sequence / explicit-value 且 malformed/unsupported node 位于 owner 之前的矩阵内持续有效，但没有完成全入口、全顺序 fail-close：

1. document-root tag property 不经过现有 outer detectors，declared/undeclared named handle及empty-suffix tag均可让 scalar正文伪terminal进入exact owner matcher；
2. rejected/ambiguous状态只抑制后续physical lines，不能撤销已先收集的真实-looking terminal，因此 owner-first named handle及unterminated quoted/flow suffix仍可被认证；
3. shared bounded property lexer对 outer anchor与primary tag suffix的字符集约束仍宽于项目current YAML parser，parser-invalid token可沿合法 property路径获得completed-legacy认证。

以上均可在现有 bounded scanner与focused test白名单内修复，不要求实现 `%TAG` binding、通用 YAML AST/parser、schema resolution或其他Story范围。Owner关于 Option A的裁决保持有效，不需要新 Owner Gate。

## Layer Results（三层结果）

| Layer | Execution | Formal output | Aggregated result |
| --- | --- | --- | --- |
| Blind Hunter | PASS | 18 observations | 保留 owner-before fail-close状态缺口及bounded property词法缺口；其余经复现、去重或范围判定后dismiss。 |
| Edge Case Hunter | PASS | 1 supported-scope regression | Outer anchor delimiter缺口并入 Finding #3。 |
| Acceptance Auditor | PASS | `FAIL / FIX_REQUIRED` / 1 P1 | Document-root named-handle缺口保留为 Finding #1。 |
| Aggregator targeted replay | PASS as reproduction | 6 RED tests / 6 failed | 独立复现 Findings #1–#3；所有负例当前均错误返回 `ok:true`。 |

### Layer Identity（审查层身份）

- Blind Hunter SHA-256：`3af8f040a9ddcd3e907307a2b9bdfaa11bbde43b00ee27e3891f484e1cdb5dab`
- Edge Case Hunter SHA-256：`c6ca4b7742d281c44a80b20837310f8f7703777b6805b399fe452647637e84d7`
- Acceptance Auditor SHA-256：`b686fb8908c09c13689ffb2c683adf0029594e3c68ddd53b27e73ebf09984896`
- Isolated review input SHA-256：`7cd681ee562bb0e7a39f25ebd2f6a2f1821b6cc003d3328a9954a36228ea4ab2`

## Previous Round Review（上轮问题回顾）

### Partially Closed（部分关闭）

1. Round 17 / Finding #1 — outer rejected empty-suffix opening fail-close
   - **已通过部分**：mapping / sequence / explicit-value 的 quoted / flow / block / property-only / pending-property矩阵继续返回 `legacy-current-series-evidence-invalid`；合法 bare `!` control保留。
   - **未关闭部分**：document-root empty-suffix tag不进入outer detector；owner先于rejected/invalid suffix时，scanner不会撤销此前terminal。故不能标记为全量 CLOSED。
2. Round 17 / Finding #2 — Option A named-handle rejection
   - **已通过部分**：现有 outer/inner矩阵中，declared与undeclared `!h!suffix` 均fail-close，未读取或绑定 `%TAG`。
   - **未关闭部分**：document-root named handle及owner-first outer/inner named handle均错误返回 `ok:true`。故 Option A已获批准，但实现仍不完整。

### Still Non-blocking Deferred（仍为非阻塞待办）

1. Round 5–17 / `supersededIndex` identity/continuity
   - 维持 carried deferred P2 / CR05 TODO；本轮无新证据支持升级，不得混入P1 patch。

## Production P1 Findings（实现侧 P1 发现）

### 1. [高][新] Document-root tag property绕过Option A与invalid-opening fail-close

- **来源**：auditor + reviewer-probe
- **分类**：patch
- **位置**：`assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs:680-690,920-938,1021-1047,1175-1204`；测试缺口：`test/code-review-contract.test.ts:2650-2764`。

- **证据**
  - `hasRejectedOuterYamlNodeProperty()`仅从 explicit value、sequence value与mapping value提取 `remainder`；document-root `!h!suffix ...` 或 `!! ...` 得到空remainder并返回 `false`。
  - quoted / flow / block / property-only opening helpers也只覆盖上述三类容器，root tagged multiline scalar不建立hidden或ambiguous state。
  - Authentic completed-legacy replay中，declared/undeclared named handle × sprint/workflow共4项、empty-suffix `!!` / `!h!` × sprint/workflow共4项均把scalar正文中的唯一伪terminal认证为真实owner，实际返回 `ok:true / compatibilityMode:canonical`。
  - declared root named handle由项目current YAML parser证明zero-error；undeclared named handle与empty-suffix controls由parser证明存在error。两类都必须按已批准Option A或invalid-evidence规则fail-close。

- **影响**
  - 攻击者或损坏tracker可在document-root tagged scalar正文中放置 `<tracker-key>: done`，使unfinished/invalid legacy evidence被误判为completed并错误开启canonical新run，破坏AC9/AC11的single-root continuation真实性。

- **建议**
  - 在现有 bounded root-node入口增加tag/property识别与ambiguous/fail-close；无需解析或绑定 `%TAG`。
  - 新增独立 RED→GREEN：declared/undeclared named handle、empty-suffix tag、quoted/flow/block/pending root node、sprint/workflow、伪owner-only及zero-write；合法bare/primary/secondary/verbatim controls保持既有预期。

### 2. [高][新] Rejected/invalid state只跳过后续行，已收集terminal仍可通过

- **来源**：blind + reviewer-probe
- **分类**：patch
- **位置**：`assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs:940-1054,1069-1172`；现有顺序缺口：`test/code-review-contract.test.ts:2650-2764`。

- **证据**
  - `trackerLinesOutsideYamlBlockScalars()`只返回 `visible` 数组，不返回全文件validity。普通行在 `:1021`先进入 `visible`；后续 `ambiguousPendingProperty`、`flow.ambiguous`、unterminated `quoted` / `flow`只会跳过更晚行。
  - Round 17 malformed/named矩阵把rejected construct放在真实owner之前，能够阻断后续owner；没有反向排列。
  - 定向replay中，exact owner先出现，随后declared/undeclared named handle置于outer/inner位置：sprint/workflow共8项全部错误返回 `ok:true`。
  - 同构owner-first unterminated quoted与flow suffix由current parser证明存在error，sprint/workflow共4项也全部错误返回 `ok:true`。

- **影响**
  - Fail-close结果依赖physical line顺序；同一unsupported或parser-invalid construct移到owner之后即可绕过，违反whole-file tracker authenticity与zero-guess continuation contract。

- **建议**
  - 让bounded scanner返回显式valid/ambiguous终态，或在任一rejected/unterminated状态出现时使整份tracker不可认证；不要仅通过“抑制未来行”表示失败。
  - 增加before/after owner双顺序、outer/inner、EOF quoted/flow及完整filesystem snapshot矩阵。合法bare/primary/secondary/verbatim与普通额外mapping继续作为positive controls。

### 3. [高][新] Shared bounded property lexer接受parser-invalid anchor与primary tag token

- **来源**：blind + edge + reviewer-probe
- **分类**：patch
- **位置**：`assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs:916-937,1126-1145`。

- **证据**
  - Inner flow anchor在 `:1128-1129`排除了 `,[]{}`，但shared outer anchor `&[^ #\\t\\r\\n]+` 未排除这些flow delimiters；outer helper因此把 `&bad,`、`&bad[`、`&bad]`、`&bad{`、`&bad}` 当完整property。
  - `YAML_BOUNDED_TAG_PROPERTY_SOURCE`的primary suffix分支仍允许quote、invalid percent escape与backslash；`!bad\"x`、`!bad%ZZ`、`!bad\\x`均被当完整tag property。
  - Current YAML parser对 anchor matrix给出2–5个errors，对tag matrix给出 `MISSING_CHAR` / `UNEXPECTED_TOKEN` / `BAD_SCALAR_START`；但sprint/workflow共16项 authentic replay全部错误返回 `ok:true`。

- **影响**
  - Parser-invalid tracker可绕过shared property vocabulary并保留唯一terminal，错误认证completed legacy；outer/inner anchor语义也不一致。

- **建议**
  - 对齐shared outer/inner anchor delimiter集合，并在bounded primary tag suffix中只接受已冻结的合法字符/percent escape；无法完整消费时进入现有ambiguous/fail-close。
  - 用parser-backed negative matrix覆盖 `,[]{}` anchor与quote/invalid-percent/backslash tag，同时保留合法 bare `!`、`!local`、`!!str`、完整non-empty `!<...>` controls。
  - 不新增 `%TAG` binding、schema resolver或通用YAML parser。

## P2 Finding（P2发现）

### 4. [延续] `supersededIndex` identity/continuity未验证

- **来源**：history
- **分类**：defer / CR05 TODO
- **位置**：`assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs:386-389`。
- **处置**：维持Round 5–17结论；不升级、不实现，不得混入本轮P1 patch。

## Acceptance Criteria Impact（验收标准影响）

| AC | Result | Blocking findings |
| --- | --- | --- |
| AC1–AC8 | **PASS at reviewed boundary** | Numeric root、single propagation、same-directory outputs、goal records与no-migration未被本轮反例推翻。 |
| AC9 | **FAIL** | Findings #1–#3均可让invalid/unsupported tracker错误认证completed legacy。 |
| AC10 | **PASS at reviewed boundary** | Active title-bearing scan与filename classifier未变化。 |
| AC11 | **FAIL** | 现有tests缺少document-root、owner-before及invalid property lexeme矩阵。 |
| AC12 | **PASS at reviewed boundary** | 本轮未要求修改basename、round numbering、approval rules或CR algorithm。 |

## Verification Summary（验证摘要）

- Aggregator targeted replay：`npx vitest run --config <Round18 temporary config> --reporter=dot` → **1 file failed / 6 tests failed**，均为预期fail-close但actual `ok:true` 的RED证据：
  - document-root declared/undeclared named handle：4/4错误接受；
  - document-root empty-suffix tag：4/4错误接受；
  - owner-first named handle outer/inner：8/8错误接受；
  - outer invalid anchor delimiter：10/10错误接受；
  - invalid primary tag lexeme：6/6错误接受；
  - owner-first unterminated quoted/flow：4/4错误接受。
- 最新 completion gate（本轮不重跑）：
  - focused：`75 passed / 4 todo`；
  - affected：`125 passed / 4 failed / 4 todo`，4项仅为范围外drawer fixed-count；
  - full：`746 passed / 12 failed / 4 todo`，12项仅为范围外drawer fixed-count；
  - build、docs、canonical strict、density、packaging：passed；
  - completion result：`PASS_EQUIVALENT`。
- Current evidence identity：
  - HEAD：`ff7528d3f9ec34072bb669ee79f7569345c23d47`
  - resolver SHA-256：`39e90743fc6e0b45d3b9b7b36b54f8b7b83a78d9d837c7bd3e16336a27f724f8`
  - focused test SHA-256：`b1acd3c6ff18784c3a6d05a293dd5b41077690a05f62ae354950828f0a1ab924`
  - completion gate SHA-256：`4a42da96d1f8523210e51ef5872810b24d50cd5186cc4f79f78c262b0d17fd0c`
- 本Reviewer未重新运行build、full suite、packaging、canonical governance或broad affected matrix。

## Passed Items（通过项）

- Option A contract decision保持明确：所有named handles无条件fail-close，`%TAG` binding不支持；本轮不存在新的语义选择。
- Round 17现有 mapping / sequence / explicit-value 的declared/undeclared named-handle矩阵持续通过。
- Round 17 existing outer rejected-opening矩阵在“rejected construct先于owner”排列下持续通过。
- 合法 bare `!`、primary `!local`、secondary `!!str`、完整non-empty verbatim `!<...>`既有controls未被本轮反例推翻。
- Story-ID-only root、single `crDir` propagation、legacy no-migration、dual/multi ambiguity、stable redaction、zero-write与source/install parity未被本轮反例推翻。
- `supersededIndex`为已知既有问题，非Round 17修复引入，继续deferred。

## Owner Gate（Owner门禁）

- **状态**：`RESOLVED — OPTION_A_APPROVED`
- **解释**：本轮三个P1均是已批准Option A与既有whole-file fail-close要求的实现缺口，修复方向唯一且可保持bounded；不需要新的owner裁决。
- **禁止扩张**：不得实现 `%TAG` directive binding、通用YAML parser/schema resolver、`supersededIndex` continuity、Story 11.10、drawer/mirrors、basename/round/approval变更。

## Final Verdict（最终裁决）

- **结论**：`FAIL / FIX_REQUIRED`
- **阻塞项**：3个fresh production P1
- **非阻塞项**：1个carried deferred P2（`supersededIndex`）
- **Owner Gate**：`RESOLVED — OPTION_A_APPROVED`
- **Sequence Gate**：fresh Evaluator确认与冻结bounded whitelist/RED矩阵 → authorized Fixer → focused/syntax/scoped-whitespace与completion gate刷新 → fresh Reviewer → fresh Evaluator；latest Reviewer/Evaluator双PASS前禁止CR04、CR05、CR06。

## Boundary Audit（边界审计）

- 本Reviewer仅创建Round 18 summary与完成后清理的临时审查输入/层输出/probe；未修改source、tests、fixtures、contract、Story、tracker、completion gate、goal records或既有CR artifacts。
- 未读取、审查、修改或归因Story 11.10、drawer/zip、installed mirrors或fixed-count baselines。
- 未运行build、full suite、packaging或canonical governance；未实现三个P1或carried P2。
