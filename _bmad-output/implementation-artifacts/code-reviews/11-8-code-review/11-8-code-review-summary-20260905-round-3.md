---
Story: 11-8
Round: 3
Date: 2026-09-05
Model Used: GPT-5.6 (gpt-5.6)
Type: Code Review Summary
---

## Review Conclusion（审查结论）

Blind Hunter、Edge Case Hunter、Acceptance Auditor 三层正式结果均成功返回（`3/3`，无 timeout、empty output 或降级）。Blind 为 `PASS / 0 finding`，Edge 为 `FAIL / 1 P1`，Acceptance 为 `PASS / 0 finding`。Aggregator 按 `bmad-code-review` 对三份 Markdown layer report 做 best-effort normalization，并独立复核 current Story、kickoff/completion gates、Round 1–2 summary/evaluation/Fix Summary，以及方案 I 的 frozen control-plane 与 actual candidate walker。

三层共提出 `1` 条原始 P1，无重复项。最终确认 **1 个 P1 blocking finding**、**0 个 P2**、**0 个 decision-needed**、**0 个 defer**、**0 个 dismissed**，**Owner Gate: NONE**。

Round 1 的六项与 Round 2 的三项既有 root causes 均已按各自 closure obligation 关闭。本轮 finding 是 Round 2 方案 I 修复后新暴露的 effective-control-plane 分叉：fixture 的 roots、exclusions 与 tokens 已独立冻结，但实际 walker 在冻结的三个 exact exclusions 之外仍硬编码任意层级 `dist` / `node_modules` basename skip，使 frozen contract 与真实扫描域不等价。

总体结论为 **FAIL**。不得进入 CR04、CR05 或 CR06；下一步必须由 fresh Evaluator Round 3 独立裁决，之后 fresh Fixer 只能处理 Evaluator 确认并授权的项。

## Layer Results（三层结果）

| Layer | Execution | Formal result | Aggregated result |
| --- | --- | --- | --- |
| Blind Hunter | PASS | `PASS` / 0 | 接受其对 Round 1–2 既有 findings 的 closure 核验；其 clean conclusion 未遍历 candidate walker 的隐式 basename exclusions。 |
| Edge Case Hunter | PASS | `FAIL` / 1 P1 | 保留为 Finding #1：actual walker 在 frozen exact exclusions 之外隐式跳过所有 `dist` / `node_modules` 子树。 |
| Acceptance Auditor | PASS | `PASS` / 0 | 接受其对 identity、routing、redirect、resolver、legacy lifecycle 与既有 scan data-plane 的核验；其 AC6/AC9/AC10 正向结论未关闭 effective scan domain 与 frozen control-plane 不一致的反例。 |

## Findings（发现）

### 1. [高][P1 / PATCH-EVIDENCE] Candidate walker 在冻结的三个 exact exclusions 之外隐式缩小扫描域

- **Source**：edge；Aggregator 独立确认 current test control flow 与方案 I exact contract
- **Location**：`test/implementation-readiness-rename-routing.test.ts:24-44,262-298`

- **Evidence**
  - `FROZEN_EXCLUDED_PATHS` 只包含 `assets/source/speclite/docs/legacy`、external drawer directory 与 drawer zip；`validateCandidateScanControlPlane()` 在 scan 前也只把 fixture exclusions 与这三个 exact paths 对账。
  - `listCandidateFiles()` 先执行上述 exact-path exclusion，随后在每个 directory 的 `readdir()` loop 中另行对 `entry.name === "node_modules" || entry.name === "dist"` 无条件 `continue`。这两个 effective exclusions 不进入 frozen constants、fixture validator、mutation proof 或 ledger。
  - 因此，即使六个 roots、三个 exclusions、六组 token key/parts 与 ledger 全部保持不变，任一 frozen root 内新增的 `src/dist/active-consumer.ts`、`test/fixtures/node_modules/active-hook.md` 或等价 raw-byte match 都不会被读取，也不会产生 `active-unclassified`、extra match 或 ledger mismatch。
  - Round 1 kickoff/evaluation 曾以宽泛文字排除顶层 `_bmad-output` / `dist/`；但方案 I 的 candidate roots 本身不含顶层 `dist`，而 Round 2 Evaluator 的更新且更精确授权明确要求 exclusions **只允许**三个 exact paths。该授权不等价于跳过 frozen roots 内任意 basename 为 `dist` 的子树，更未授权 `node_modules`。

- **Impact**
  - AC6/AC9/AC10 要求 bounded exact-old-ID/path scan 独立关闭 active residual。Current validator只冻结声明的 control-plane，actual walker却拥有额外未声明的 control-plane；证据门禁仍可在不修改冻结合同的情况下 false-green。
  - 该缺口仅涉及 Story 11.8 已选择的两个 old IDs、old path variants 与六个 frozen roots的扫描完整性，不要求扩大 token vocabulary、roots 或 generic grill semantics，因此属于方案 I 的 bounded evidence contract，而非 Story 11.10 broad inventory。

- **Suggestion**
  - 删除 walker 的两个 basename skip，使 effective exclusions 精确等于三个 frozen exact paths；补 focused temp-tree mutation，在 frozen root等价树的嵌套 `dist/` 与 `node_modules/` 中放入冻结 token，证明 walker会扫描并令未登记match fail-close。
  - 若要保留任一 skip，必须先把它作为 exact path进入独立 frozen contract并重新取得 Evaluator/owner授权；不得以泛化性能优化或 Story 11.10 inventory为由扩大本轮修复。

## Deduplication And Disposition（去重与处置）

| Root cause | Raw sources | Disposition |
| --- | --- | --- |
| actual walker effective exclusions 超出 frozen exact exclusions | edge | 保留为 Finding #1，`patch`；Story-owned evidence gate可缩面。 |

- **Dismissed findings**：`0`。
- **Deferred findings**：`0`。该项由 Story 11.8 新增的 candidate walker 直接引入，不是 pre-existing issue。
- **Decision needed**：`0`。Round 2 方案 I 已明确 exclusions只允许三个 exact paths；最小修复方向唯一。
- **Parsing note**：三层均以结构化 Markdown 返回；虽然 Edge 不是 Skill 期望的 JSON array，但 location、trigger、guard 与 consequence 字段完整，可无损归一化。

## Prior Round Closure Matrix（前序轮次闭环矩阵）

| Prior root cause | Round 3 status | Current evidence / boundary |
| --- | --- | --- |
| R1 #1 Phase projection必填参数错位 | **CLOSED** | 未消费参数已移除；current focused IDE projection tests通过。 |
| R1 #2 Grill route/current docs分叉 | **CLOSED** | 两producer、record spec与D1 docs统一消费resolver-provided Solutioning fixed child，无第三fallback。 |
| R1 #3 Old-ID真实activation redirect | **CLOSED** | Clean existing old entrypoint进入authorized transaction并变为最小redirect，active implementation/index唯一。 |
| R1 #4 Authorized apply/precondition证据 | **CLOSED** | 两IDs×两targets实际apply与content/mode/type/missing precondition均有zero-write/no-journal证据。 |
| R1 #5 Classified scan data-plane缺口 | **CLOSED（data plane）** | Raw-byte/no-follow、逐match ledger、actual/ledger双向equality与role allowlist已实现；本轮仅指出walker的effective control-plane仍超出frozen exclusions。 |
| R1 #6 Legacy lifecycle仅prose | **CLOSED** | 真实legacy tree经过install/update/repair后path/type/bytes/hash/tree不变，且与mutation集合无交集。 |
| R2 #1 Existing resolver failure fail-open | **CLOSED** | `ok=false` issues被传播，并在projection/transaction前返回blocked empty plan；无root配置的合法legacy-compatible分支保留。 |
| R2 #2 方案 I control-plane与ledger同源 | **CLOSED（declared control-plane）** | 6 roots、3 exclusions、6 token key-parts已在test code独立冻结并有mutation proof；本轮finding是walker另行加入的未声明effective exclusions。 |
| R2 #3 Redirect action缺machine rename语义 | **CLOSED** | Actual redirect首次`update`与二次幂等`skip`均携带schema验证的rename/replacement binding，2×2重放通过。 |

## Acceptance Criteria Matrix（验收标准矩阵）

| AC | Result | Current evidence |
| --- | --- | --- |
| AC1 | PASS | 两个canonical packages、ZH/EN frontmatter与self refs使用新IDs。 |
| AC2 | PASS | Fresh projection只生成active IDs；old IDs不生成alias package/help/phase row。 |
| AC3 | PASS | 两个producer只消费resolver-provided Solutioning root，resolver failure HALT/zero-write。 |
| AC4 | PASS | Readiness basename保持`implementation-readiness-report-{yyyy-MM-dd}.md`。 |
| AC5 | PASS | Grill record basenames未改变。 |
| AC6 | **FAIL** | Declared roots/exclusions/tokens已冻结，但actual walker另有两个basename exclusions，active residual仍可漏扫。 |
| AC7 | PASS | Redirect、modified-old protection、typed rename/replacement与幂等均有current evidence。 |
| AC8 | PASS | Legacy artifacts原位discovery/lifecycle preservation已有行为证据。 |
| AC9 | **FAIL** | Exact scan尚未证明effective扫描域与独立冻结的control-plane完全相等。 |
| AC10 | **FAIL** | Focused `50/50`正向通过，但缺少嵌套`dist`/`node_modules` token mutation，不能关闭本轮false-green。 |
| AC11 | PASS | 本轮finding不涉及IR algorithm/scoring/body或generic grill semantics，也不扩大到Story 11.9/11.10。 |

## Verification Summary（验证摘要）

- 三层正式结果均完成：valid layers `3/3`，无失败或降级。
- Blind与Acceptance记录focused：`3 files / 50 tests passed`；Aggregator遵守本轮约束，未重复运行测试、build、full suite、packaging、canonical governance或global `tsc`。
- Aggregator以current source静态重放控制流：validator在`:272-274`只约束三个frozen exclusions；walker在`:293`另行跳过任意层级的`node_modules`/`dist`，反例无需修改fixture或ledger即可成立。
- Aggregator核对Round 1–2 summary/evaluation/Fix Summary，确认九项既有 findings 的原root causes均已关闭；本轮只保留新增的effective-control-plane residual。
- Current HEAD=`ff7528d3f9ec34072bb669ee79f7569345c23d47`；核证包含当前uncommitted Epic 11 worktree，但归因严格限制在Story 11.8新增candidate-scan test。

## Governance And External Boundary（治理与外部边界）

- Current canonical source治理由outer goal owner统一执行并记录D0/D1/D2；本Aggregator只创建本Round summary，不替代最终canonical-source governance或checker。
- `assets/source/speclite/core-skills/speclite-drawer-er-modeler/`、其zip、workspace `.agents/.claude` mirrors与fixed-count drift明确排除；drawer导致的full-suite/global count非绿不是Story 11.8 finding。
- 本轮未处理Story 11.9 CR artifact normalization、Story 11.10 broad grill semantic inventory、IR algorithm/scoring/body、dependencies或generic output inventory。

## Owner Gate（Owner 门禁）

**Owner Gate：`NONE`。** Round 2 方案 I 已明确冻结六个 roots、三个且仅三个 exact exclusions与六组token。使actual walker使用同一exact exclusions是唯一bounded修复，不需要新增产品、Architecture或范围选择。Evaluator应确认修复只删除未授权的basename skip并补局部mutation proof；不得扩大roots、tokens或Story 11.10语义域，也不得修改drawer/fixed counts。

## Final Verdict（最终裁决）

**FAIL — 1 P1、0 P2、Owner Gate NONE。**

下一步进入fresh Evaluator Round 3。只有Evaluator确认后，fresh Fixer才可在精确授权边界内修改；修复与completion gate刷新完成后必须启动fresh Reviewer Round 4。当前不得进入CR04、CR05或CR06。
