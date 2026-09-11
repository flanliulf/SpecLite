---
Story: 11-7
Round: 7
Date: 2026-09-05
Model Used: GPT-5.6 (gpt-5.6)
Type: Code Review Summary
---

## Review Conclusion（审查结论）

Blind Hunter、Edge Case Hunter、Acceptance Auditor 三层正式产物均成功返回（`3/3`，无失败或降级）。Blind 为 **PASS / 0 finding**，Edge 为 **FAIL / 1 P1**，Acceptance 为 **PASS / 0 finding**。Aggregator 完整核对 Round 5–6 summary/evaluation/Fix Summary、Round 7 三层产物、current focused test helper与private producer/discovery source，并对Edge唯一候选做了只读最小重放。

跨层去重后确认 **1 个 P1 blocking finding、0 个 P2**：current `findDiscoveryReachableMutations()`以相邻function declaration起点切分线性section；当`discoverPrdValidationReports`函数体内出现nested local function declaration，enclosing discovery section会在nested declaration起点被截断。若discovery在该声明之后direct-call nested helper，而helper body调用protected producer，reachable queue不会进入nested helper，最终返回空violations。

该finding直接属于Round 5 Evaluator已授权的“从`discoverPrdValidationReports`出发，对private script中的local function declaration建立有限direct-call edge inventory并计算可达闭包”，也属于Round 6对同一reachability义务所做leading-whitespace修复的未闭合残余。它不要求支持arrow/function expression、method/computed dispatch、external module、任意JavaScript表达式或完整call graph，因此不是新的通用parser/meta-test扩张。

Blind与Acceptance的PASS证明current runtime source及已编码矩阵保持绿色，但不能覆盖Edge给出的稳定nested-local mutant。总体结论为 **FAIL**。最新Reviewer/Evaluator双PASS之前，不得进入CR04、CR05或CR06。

## Layer Results（三层结果）

| Layer | Execution | Formal result | Aggregated result |
| --- | --- | --- | --- |
| Blind Hunter | PASS | `PASS` / 0 | Current source、Round 6五组修复与focused evidence保持通过；没有反驳未进入矩阵的nested-local mutant。 |
| Edge Case Hunter | PASS | `FAIL` / 1 P1 | 唯一nested-local section truncation候选经Aggregator独立重放确认，保留为Finding #1。 |
| Acceptance Auditor | PASS | `PASS` / 0 | AC1–AC10 current behavior与既有有限矩阵保持通过；其PASS不覆盖稳定evidence false-green。 |

## Findings（发现）

### 1. [中][P1 / PATCH-EVIDENCE] Nested local declaration截断enclosing discovery section并漏掉声明后的direct call

- **Source**：edge；Aggregator独立重放确认
- **Location**：`test/prd-validation-report-path.test.ts:571-581,995-1034`
- **Affected contract**：Story 11.7 AC7、AC9；Round 5 Evaluator Finding #3的local function declaration/direct-call可达闭包；Round 6 Evaluator Finding #2的leading-whitespace local declaration有限补强

#### Root Cause（根因）

`findDiscoveryReachableMutations()`先收集全文件所有function declarations，再把每个function的section定义为“当前declaration起点到下一declaration起点”。该模型只在所有local declarations彼此平铺时成立。Nested declaration位于`discoverPrdValidationReports` body内时，enclosing discovery section在nested declaration起点提前结束；因此nested声明之后的`mutateDuringDiscovery(input)` direct call不再属于discovery section。

Nested helper自己的section包含`executePrdValidationReportOperation(input)`，也包含声明后的direct call，但reachable queue从`discoverPrdValidationReports`出发时从未观察到通往`mutateDuringDiscovery`的edge，所以不会访问该section。Round 6现有leading-whitespace mutant把缩进声明追加在文件末尾，并把direct call插入未被截断的原discovery section，只证明缩进声明可被枚举，没有覆盖“声明嵌套于enclosing body且call位于声明后”的同一有限分支。

#### Reproducible Evidence（可复现证据）

Aggregator在current private source的`discoverPrdValidationReports` body内、`const canonicalReports = [];`之前插入：

```js
  async function mutateDuringDiscovery(input) {
    await executePrdValidationReportOperation(input);
  }
  await mutateDuringDiscovery(input);
```

按current helper逐句重放得到：

- declaration顺序包含`discoverPrdValidationReports → mutateDuringDiscovery → inspectTarget`；
- discovery section中`discoveryHasDirectCall=false`；
- nested section中`nestedHasProducer=true`，且`mutateDuringDiscovery(input)`出现`2`次（声明与声明后的direct call）；
- 最终`violations=[]`。

这与无mutant baseline相同，稳定证明current evidence gate可false-green。Current private source本身没有该nested helper，故finding不声称production已发生mutation；它阻塞的是AC7/AC9的fail-close evidence。

#### Impact（影响）

Private discovery未来可在自身body内声明local helper、在声明后直接调用，并由helper抵达`executePrdValidationReportOperation → inspectTarget → writeFile`，而focused role oracle仍返回空violations。由此legacy discovery read-only与唯一producer evidence可在有限、已授权的local-function语法内失效。

#### Suggested Bounded Fix（建议的最小修复）

- 仅在`test/prd-validation-report-path.test.ts`内补入上述单一nested-declaration + declaration-after direct-call mutant，并使其稳定报告`executePrdValidationReportOperation`、`inspectTarget`与`writeFile`。
- 修正test-local reachability helper，使enclosing discovery的审计范围不会因nested declaration被截断；或对enclosing body内nested declaration之后的local direct call采取等价fail-close处理。
- 保持current纯只读discovery返回空violations，继续保留Round 5–6已交付的external local helper、leading-whitespace declaration、static named fs binding与behavioral no-follow snapshot证据。
- 不扩展到arrow/function expression、method/computed dispatch、external module、任意JavaScript表达式、通用AST/parser或完整call graph；不得修改private producer或canonical source迁就测试。

## Authorization Boundary Analysis（授权边界分析）

本项不是新finding类别，而是既有授权未闭合：

1. Round 5 Evaluator明确授权“从`discoverPrdValidationReports`出发，对private script中的local function declaration建立有限direct-call edge inventory并计算可达闭包”，没有把nested local declaration排除在local function declaration之外。
2. Round 6 Evaluator将修复继续限定为local function declaration matcher的水平缩进与现有direct-call closure；本mutant使用相同declaration形态与相同direct call，只改变声明位于enclosing discovery body内以及call位于声明之后。
3. 修复方向仍可限制在单一focused test helper与一个稳定mutant，不需要理解任意JavaScript语义。因此满足Round 5“active role invariant + stable mutant + 单一focused test内有限修复”的收敛标准。

## Closed / Rejected Candidates（已关闭与驳回候选）

1. **Round 6 complete-clause role-swap — closed**：完整sentence/bullet/CSV field及exact occurrence count继续fail-close；本轮无新反证。
2. **Round 6 shared `{` boundary — closed**：brace-wrapped legacy basename已进入managed token inventory；本轮无新反证。
3. **Round 6 multiline static named fs import — closed**：多行named import与original-to-local binding保持完整消费；本轮无新反证。
4. **Round 6 current fs original-binding allowlist — closed**：current有限binding set继续拒绝`writeFileSync`等新增binding；本轮无新反证。
5. **Round 6 leading-whitespace declaration — partial closure**：top-level/文件末尾缩进local declaration已识别；Finding #1只保留同一授权内nested declaration截断enclosing section的残余。
6. **TOML arrays、array-of-table与inline-table object leaf — rejected**：Round 5/6 Evaluator已明确驳回为超出已授权TOML matrix的generic parser/meta-test扩张，本轮不重开。
7. **Generic JavaScript analysis — rejected**：不要求arrow/function expression、method/computed dispatch、external module、任意表达式、AST或完整call graph。Finding #1仅覆盖既有local function declaration + direct-call closure。
8. **Exact filename/date/path与existing-target semantics — closed**：single invocation date、Step 2–13 locked path、early/commit-time recheck、exclusive `wx`、stable issue与zero mutation无新反证。
9. **Legacy lifecycle/downstream/location inventory — closed**：五类legacy preservation、逐metadata surface zero intersection、same-basename no-follow inventory与三个downstream physical owner chain无新反例。
10. **External drift — excluded**：`assets/source/speclite/core-skills/speclite-drawer-er-modeler/`、zip、workspace IDE mirrors与fixed-count drift不属于Story 11.7 finding；未运行build、full suite、packaging或canonical governance。

## Triage Summary（分流摘要）

| ID | Sources | Severity | Bucket | Decision |
| --- | --- | --- | --- | --- |
| 1 | edge | P1 | `patch` | Confirmed；nested declaration截断enclosing discovery section，是Round 5/6已授权local-function reachability义务的有限残余。 |

- `decision_needed`: 0
- `patch`: 1
- `defer`: 0
- `dismiss`: 0
- P1: 1
- P2: 0

## Owner Gate（Owner 门禁）

**Owner Gate：`NONE`。** 该finding可限定为`test/prd-validation-report-path.test.ts`内的finite evidence hardening，不改变产品、Architecture或current runtime语义。应先由fresh Evaluator Round 7独立裁决；若确认，Fixer只能修改Evaluator授权的focused test并追加Round 7 evaluation Fix Summary，不得修改private producer、canonical source/prose、Story、tracker、completion gate、既有CR产物、external drawer/zip、IDE mirrors或fixed-count baselines。

## Verdict（裁决）

- **Verdict：FAIL**
- **P1：1**
- **P2：0**
- **Closed：9 groups（其中leading-whitespace declaration为partial closure）**
- **Rejected：2 candidate groups**
- **Owner Gate：`NONE`**
- **Next Gate**：fresh Evaluator Round 7；最新Reviewer/Evaluator双PASS前不得进入CR04、CR05或CR06。
