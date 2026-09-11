---
Story: 11-9
Round: 17
Date: 2026-09-05
Model Used: OpenAI GPT-5.6 Sol (gpt-5.6-sol)
Layer: Acceptance Auditor
Type: Code Review Layer Result
---

# Acceptance Review（验收审查）

## Verdict（裁决）

**FAIL / OWNER_DECISION_REQUIRED** — Round 16 的 `2` 个 production P1 已按授权边界关闭；本轮发现 `1` 个 fresh production P1（`decision_needed`）与 `1` 个 carried deferred P2。Owner Gate=`REQUIRED`。

Round 16 Fixer 已把 outer bare non-specific tag `!` 纳入 quoted/flow/block/property-only/pending-property detectors，并让 inner flow scanner 对 `!!`、`!h!` 等 empty-suffix shorthand fail-close。Fresh focused suite为 `1 file passed / 73 passed / 4 todo`；两条独立定向回归、source/fresh-installed parity、active negative scan/frozen ledger、filesystem zero-write、syntax、scoped whitespace及 completion-gate freshness均成立。因此 Round 16 两个原 P1 在本层复核边界内关闭。

但 Round 16 新增的 shared bounded tag vocabulary 会完整接受 named-handle token `!h!suffix`，而 resolver 完全不读取或绑定 `%TAG !h! ...` directive。项目当前 `yaml@2.9.0` 对无 directive 的 `!h!suffix` tracker返回 `TAG_RESOLVE_FAILED`，添加有效 directive 后才 zero-error；两份输入在 resolver 的 tag/flow/terminal认证路径上没有可观察差异。现有测试只覆盖“带 directive 的合法 control”，未覆盖“同一 token 无 directive”的 invalid control。由此，无 directive 的 malformed tracker可沿合法 control相同路径获得 completed-legacy认证，违反 shared contract 对“唯一、可解析 scalar”的要求与 AC9/AC11。

该缺口不能在 Round 16 Fixer授权内唯一修复：无条件拒绝 named handle 会推翻已冻结的合法 `!h!suffix` control；认证 `%TAG` 则需要新增 directive-aware grammar，而 Round 16 Evaluator明确禁止 directive/schema resolution与 tracker grammar扩张。因此需要 owner在两种 observable contract之间裁决，不能由 Reviewer猜测。

Round 5起 carried 的 `supersededIndex` identity/continuity缺口继续维持 P2，仅影响 historical replacement ordinal审计；本轮不升级、不实现，继续交由 CR05 登记。

## Scope And Evidence（范围与证据）

- 逐项核对 Story 11.9 AC1–AC12、shared `speclite-code-review-contract`、current resolver、Round 16 summary/evaluation/Fix Summary、focused tests与 current completion gate。
- Fresh focused：`npx vitest run test/code-review-contract.test.ts --reporter=dot` → `1 file passed; 73 tests passed; 4 todo`。
- Fresh directed matrix：outer bare-tag、inner empty-suffix、fresh-installed双IDE parity与 frozen negative-scan ledger共 `4 passed / 73 skipped`。
- Syntax：`node --check assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs` → PASS。
- Whitespace：resolver、focused test与 Round 16 evaluation的 scoped `git diff --check` → PASS。
- Installed parity：focused install regression逐字节比较 canonical 与临时安装的 `.agents/skills`、`.claude/skills` resolver及 CR contract/runner/CR01–06 consumers，并验证resolver mode=`755`与真实 CLI probe；parity成立，因此本轮finding同时存在于 production source与 fresh installed copies。
- Negative scan：active title-bearing scan与 frozen classified ledger exact match由 fresh focused suite通过；ledger SHA-256=`ced8365e9408b73746d42b84f319207e41eaf6e2bfbc5ac24092584794b1dbff`，无 `active-canonical`。
- Zero-write：Round 16 两项新增测试对 sprint/workflow、伪owner-only、伪owner+真实owner、malformed empty suffix及合法 controls均比较完整 filesystem snapshot；所有 current resolver调用保持只读。既有 blocked preflight矩阵也持续通过。
- Freshness：resolver/test current mtime分别为本地 `2026-09-05 10:03:37 +0800` / `10:02:46 +0800`；Round 16 evaluation/Fix Summary mtime为 `10:04:40 +0800`；completion gate `generatedAt=2026-09-05T02:05:41.000Z`且文件mtime为本地 `10:06:03 +0800`，晚于 source/test/fix mutation并记录 `73 passed / 4 todo`，无时间倒置。
- Current SHA-256：resolver=`92f1c31e571b078ea5b4f67b85ac8d5d736fc24489f712f055d83049d5fab976`；test=`97c08a4dcc95d8e235548b46071e399cc998d31bff5713dc7cf8f30156ff66a0`；completion gate=`afeda4e8bc013aa1f4ce7c978403a3ac6fdb0cc7a83ba0fe0dc0a7dac62be607`。
- Current HEAD=`ff7528d3f9ec34072bb669ee79f7569345c23d47`；审计对象包含 current uncommitted Story 11.9 slice。
- 按任务边界未运行 build、full suite、packaging或 canonical governance；未读取、审查或归因 Story 11.10。范围外 drawer 与 fixed-count drift不归责 Story 11.9。

## Round 16 Fix Closure（Round 16修复闭环）

| Round 16 finding | Result | Current Acceptance evidence |
| --- | --- | --- |
| P1-1 outer detectors漏识别合法 bare `!` | **CLOSED** | `YAML_BOUNDED_NODE_PROPERTIES_SOURCE` 已供 quoted/flow/block/property-only/pending入口共用；parser-valid outer矩阵对 sprint/workflow证明伪owner-only fail-close、追加唯一真实owner后canonical、调用前后snapshot一致。独立定向测试 `1 passed`。 |
| P1-2 inner matcher误接受 `!!` / `!h!` empty suffix | **CLOSED** | shared token source不再完整消费empty-suffix handle；sprint/workflow malformed矩阵先断言 parser error，再断言 resolver fail-close与zero-write；合法 bare/primary/secondary/verbatim/named controls保持canonical。独立定向测试 `1 passed`。 |
| P2-1 `supersededIndex` identity/continuity | **CARRIED / DEFERRED** | 维持 Round 5–16 既有 P2 / CR05处置。 |

## Findings（发现）

### P1-1：[新] named-handle tag未绑定 `%TAG` directive，malformed tracker与合法tracker被同路径认证

- **来源**：auditor
- **分类**：decision_needed
- **违反**：AC9、AC11；shared contract `cr-contract.md:409`要求 resolver认证的 terminal来自唯一、可解析 scalar。
- **位置**：`assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs:916-918,1033-1042,1045-1149`；测试缺口位于`test/code-review-contract.test.ts:2650-2687`。
- **Production evidence**：`YAML_BOUNDED_TAG_PROPERTY_SOURCE` 的第三分支完整匹配 `!h!suffix`。`trackerLinesOutsideYamlBlockScalars()`与`scanYamlFlowCollectionLine()`没有读取、登记或验证 `%TAG` directive；directive行只是一条不会命中 terminal candidate的visible line。因此移除合法 control前的 `%TAG !h! ...` 不改变 property token、flow hidden state或后续exact terminal candidate路径。
- **Parser differential**：`notes: [!h!suffix "named"]\nimplementation: done\n` 在项目 current `yaml` parser中返回 `TAG_RESOLVE_FAILED`；加上 `%TAG !h! tag:example.com,2026:`与 document start后 errors=`[]`、terminal值为`done`。current matcher对两者均完整匹配同一 `!h!suffix` token。
- **Test validity**：Round 16合法controls只断言带有效 directive context的 `!h!suffix` zero-error并返回canonical；malformed controls只覆盖empty-suffix `!h!`，没有移除directive后对相同non-empty named handle执行 parser-error + authentic recovery + zero-write断言。现有 `73 passed`因此无法证明 named handle与directive binding的真实性。
- **影响**：无声明 handle的 parser-invalid sprint/workflow tracker可被当作真实 terminal owner；若该tracker参与 authentic completed-legacy证据，resolver可错误启动canonical new run。source与两套fresh-installed resolver逐字节一致，影响同时存在于 production与installed态。
- **需 owner裁决**：
  1. 将 bounded tracker grammar冻结为不支持 named handles，所有 `!h!suffix`一律fail-close，并删除/改写当前合法named-handle control；或
  2. 授权新增受界、fail-closed的 `%TAG` directive binding认证，并冻结document/directive位置、duplicate/unknown handle、redaction及negative fixtures；不得扩大为通用 YAML parser或schema resolver。
- **禁止 Reviewer代决**：Round 16 Evaluator同时要求保留带directive的 `!h!suffix`合法control，并禁止directive/schema resolution；两条要求在无owner选择时不能由当前局部 matcher同时满足。

### P2-1：`supersededIndex` identity/continuity维持carried deferred

- **来源**：auditor
- **分类**：defer / CR05 TODO
- **位置**：`assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs:266,292-332,380-389`。
- **证据**：parser验证`supersededIndex`为safe positive integer后未保存ordinal；后续不验证同family/round ordinal从1开始、唯一且连续。该结论与 Round 5–16一致，本轮没有扩大或升级证据。
- **影响**：historical replacement timeline可能缺号或重复，但 current artifact cardinality、latest round与runtime recovery target不受影响。
- **Disposition**：维持P2 carried deferred；CR05登记，本轮Fixer不得实现，也不得扩展same-round producer retry/supersession algorithm。

## Acceptance Criteria Impact（验收标准影响）

| AC | Result | Blocking findings |
| --- | --- | --- |
| AC1–AC8 | **PASS at reviewed boundary** | Numeric root、single propagation、artifact/goal-record ownership与no-migration持续成立。 |
| AC9 | **FAIL / DECISION_NEEDED** | 未声明named handle的parser-invalid tracker与带合法directive的tracker走相同认证路径。 |
| AC10 | **PASS at reviewed boundary** | Active title-bearing scan与frozen classified ledger继续通过；filename classifier白名单未变化。 |
| AC11 | **FAIL / DECISION_NEEDED** | 缺少无directive named-handle negative fixture，且当前授权未冻结应拒绝还是受界解析directive。 |
| AC12 | **PASS at reviewed boundary** | Basename、round、approval与classifier白名单未改变；任何后续变更必须等待owner裁决并保持受界。 |

## Verification Summary（验证摘要）

- Fresh focused → ✅ `1 file passed / 73 passed / 4 todo`。
- Round 16 two-finding directed RED→GREEN → ✅ `2 passed`；outer bare `!`与inner empty-suffix分支独立关闭。
- Source/fresh-installed `.agents` / `.claude` bytes、mode、consumer corpus与CLI parity → ✅ PASS。
- Active negative scan / frozen ledger、single-`crDir` propagation、lineage/hash/round bindings与filesystem zero-write → ✅ PASS。
- Completion gate provenance/freshness → ✅ PASS；gate晚于本轮source/test/fix evidence并记录current count。
- Named-handle parser differential → ❌ 无directive `!h!suffix`为`TAG_RESOLVE_FAILED`，带有效directive才zero-error；production matcher与flow scanner不区分二者。
- 测试充分性 → ❌ current合法matrix只覆盖带directive control，缺少同token无directive的negative recovery fixture。

## Passed Items（通过项）

- Round 16 outer bare non-specific tag与inner empty-suffix shorthand两个production P1均由独立、parser-backed、zero-write regression关闭。
- Existing bare `!`、`!local`、`!!str`与完整 non-empty verbatim `!<...>` controls持续通过；empty-suffix `!!`、`!h!`及同构named handle均fail-close。
- Production canonical source与fresh-installed双IDE copies逐字节、mode、consumer corpus及CLI一致。
- Active title-bearing negative scan、frozen ledger exact match、single-`crDir` propagation、lineage/hash/round bindings与filesystem zero-write持续通过。
- Completion gate freshness与current focused count一致。
- `supersededIndex`为已知既有问题，非本轮新引入，继续作为deferred P2处理。

## Owner Gate（Owner门禁）

**Owner Gate：`REQUIRED`。** Owner必须在“bounded tracker grammar不支持任何named handle”与“新增受界 `%TAG` directive binding认证”之间选择，并据此更新observable contract与测试矩阵。未经裁决，不得由Fixer无条件拒绝合法named-handle fixture，也不得擅自扩大到directive/schema resolver。

Owner裁决后，fresh Evaluator应冻结唯一方案、白名单、RED→GREEN与scope boundary，再决定是否授权Fixer。完成裁决、bounded修复、outer completion gate重生及fresh Reviewer/Evaluator双PASS前，不得进入CR04、CR05或CR06。

## Final Verdict（最终裁决）

- **结论：FAIL / OWNER_DECISION_REQUIRED**
- **阻塞项**：1 个 fresh production P1（`decision_needed`）
- **非阻塞项**：1 个 carried deferred P2（`supersededIndex`，CR05 TODO）
- **Round 16闭环**：2 个原production P1均已关闭
- **驳回项**：无
- **Owner Gate**：`REQUIRED`
- **下一步**：fresh Evaluator确认本finding与contract矛盾，交owner选择named-handle policy；未裁决前禁止Fixer猜测。

## Boundary Audit（边界审计）

- 本Acceptance Auditor仅创建本 Round 17 acceptance report；未修改source、tests、fixtures、contract、Story、tracker、completion gate、goal records或既有CR artifacts。
- 未审查或建议修改 Story 11.10 generic inventory。
- 未扫描或纳入`assets/source/speclite/core-skills/speclite-drawer-er-modeler/`及zip、workspace mirrors或fixed-count baselines。
- 未运行build、full suite、packaging或canonical governance。
