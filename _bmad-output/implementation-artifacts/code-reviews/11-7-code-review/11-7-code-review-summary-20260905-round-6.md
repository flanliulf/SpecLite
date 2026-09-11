---
Story: 11-7
Round: 6
Date: 2026-09-05
Model Used: GPT-5.6 (gpt-5.6)
Type: Code Review Summary
---

## Review Conclusion（审查结论）

Blind Hunter、Edge Case Hunter、Acceptance Auditor 三层正式产物均成功返回（`3/3`，无失败或降级）。Blind 为 **FAIL / 2 P1**，Edge 为 **FAIL / 2 P1**，Acceptance 为 **FAIL / 2 P1**。Aggregator 完整核对 Round 5 summary/evaluation/Fix Summary、current focused test helper、private producer/discovery source与三层候选，并对争议分支做了只读最小重放。

按 Round 5 Evaluator 明确的收敛标准，只保留“直接保护已声明 active surface/role invariant + 稳定 mutant + focused test 内有限修复”的候选。跨层去重后确认 **2 个 P1 blocking findings、0 个 P2**：

1. Support allowlist 仍删除句内fragment，而role-swap mutant没有保持该fragment/count；同时Round 5新建的共享unframed boundary遗漏了旧prefix前界已接受的`{`。两者沿用active managed-basename classifier的同一根因边界合并为Finding #1，但保留两组独立RED/GREEN义务。
2. Private filesystem/discovery role oracle仍以单行、零缩进和既定mutation primitive列表作为fail-open前提：多行static named import、`writeFileSync`静态binding以及有leading whitespace的local function declaration都可绕过Round 5明示的全量static named binding和local-function direct-call reachability义务。三者合并为Finding #2。

TOML array、array-of-table与inline-table object leaf候选有可重放mutant，但Round 5 Evaluator只授权table-scoped、quoted/spaced dotted及`dir`/`folder`明确矩阵，且明示不要求“任意 TOML value type”。该候选因此作为generic parser/meta-test扩张驳回，不形成P1/P2。

两个P1都不证明current canonical source已出现非法report target或mutation；它们证明直接违反AC5/AC6/AC7/AC9的有限后续改动仍可使focused oracle保持绿色。总体结论为 **FAIL**。最新Reviewer/Evaluator双PASS之前，不得进入CR04、CR05或CR06。

## Layer Results（三层结果）

| Layer | Execution | Formal result | Aggregated result |
| --- | --- | --- | --- |
| Blind Hunter | PASS | `FAIL` / 2 P1 | Complete-clause role-swap与Acceptance的`{` boundary并入Finding #1；multiline import与leading-whitespace declaration并入Finding #2。 |
| Edge Case Hunter | PASS | `FAIL` / 2 P1 | TOML array semantic leaf驳回为超出授权的parser/meta-test扩张；multiline import与`writeFileSync`并入Finding #2。 |
| Acceptance Auditor | PASS | `FAIL` / 2 P1 | `{` shared boundary并入Finding #1；multiline static named import并入Finding #2。 |

## Findings（发现）

### 1. [中][P1 / PATCH-EVIDENCE] Active basename inventory的complete-clause role与共享boundary仍可false-green

- **Source**：blind + acceptance；Aggregator独立重放
- **Location**：`test/prd-validation-report-path.test.ts:576-624,832-857,990-1001`
- **Affected contract**：Story 11.7 AC5、AC6、AC9；Round 5 Evaluator Finding #1的`relativePath + exact complete clause/anchor + exact occurrence count`与有限共享boundary义务

#### Root Cause（根因）

1. `supportReferenceAllowlist`的字段虽命名为`clause`，但多数值仍是完整句子中的局部fragment。`removeExactRoleFragments()`只核对fragment次数后执行`replaceAll()`，没有绑定完整sentence/bullet/CSV field两侧的reference role。Current `roleSwapMutant`将整句换成了不再包含登记fragment的新句，只证明fragment消失时会fail-close，没有实现Round 5要求的“fragment与count不变，只shift surrounding role”。
2. `isUnframedBoundary()`已同时被candidate start/end消费，但它的有限字符集不包含`{`。Round 5 summary所记修复前prefix finder明确接受`{`前界；“起止共用”不得以删除既有有效前界为代价。

#### Reproducible Evidence（可复现证据）

- Aggregator将真实`validate-prd/SKILL.md`完整contract句换成`- **默认 report filename**：通过 private \`scripts/prd-validation-report-operation.mjs\` 执行 exclusive create。`。登记fragment仍精确出现`1`次；执行current fragment removal后，`prd-validation-report-operation.mjs`从待扫描内容中完全消失，因而role swap可使integrated negative scan假绿。
- Current `isUnframedBoundary("{")` 结果为`false`；`{prd-validation-report-old.md}`中managed prefix不能作为candidate start被提取。
- Current focused verification：`npx vitest run test/prd-validation-report-path.test.ts --reporter=dot` → `1 file / 10 tests passed / 0 failed`。该绿色只证明current matrix通过，不覆盖上述两个未编码mutant。

#### Impact（影响）

Active Skill/docs/help surface可在保持support fragment/count的同时将support basename换位为report filename/default，或以brace-wrapped形式重新引入legacy/非法managed basename，而AC6 negative inventory仍保持绿色。

#### Suggested Bounded Fix（建议的最小修复）

- 将每个support exemption登记为真实文件中完整、稳定的reference sentence/bullet/CSV field，继续绑定`relativePath + occurrence count`。Role-swap mutant必须保持support basename fragment及相同count，只改变surrounding complete clause为report filename/default role，并证明integrated scan失败。
- 在同一有限共享boundary中恢复`{`，新增`{prd-validation-report-old.md}`的独立RED/GREEN；保留普通identifier substring不命中。
- 仅需修改`test/prd-validation-report-path.test.ts`；不要求通用自然语言/Markdown parser，不修改canonical source迁就测试。

### 2. [中][P1 / PATCH-EVIDENCE] Private fs binding与discovery reachability的有限语法盘点仍fail-open

- **Source**：blind + edge + acceptance；Aggregator独立重放
- **Location**：`test/prd-validation-report-path.test.ts:511-557,914-987`
- **Affected contract**：Story 11.7 AC7、AC9；Round 5 Evaluator Finding #3的全部`node:fs` / `node:fs/promises` static named bindings、original-to-local映射与discovery local-function direct-call可达闭包义务

#### Root Cause（根因）

1. `extractFsPromiseBindings()`的regex要求一整条import在单行内，因此合法多行static named import不进入binding inventory，也不触发unsupported-import fail-close。
2. Binding只在`original`存在于既定`mutationPrimitives`时才参与unique-writer与reachability审计。`writeFileSync`是可由current static named import extractor解析的直接filesystem writer，但不在该列表中，因而默认被忽略。对current private script的有限original-binding allowlist做fail-close，可在不穷举所有future fs API的前提下关闭该分支。
3. `findDiscoveryReachableMutations()`的local function declaration regex要求`function`从行首第一个字符开始。对Round 5已授权的同local function declaration仅加水平缩进后，该helper不进入`sections`，direct-call可达闭包断链。

#### Reproducible Evidence（可复现证据）

- 对`import {\n writeFile as emitReport\n} from "node:fs/promises";`重放current import regex，匹配数为`0`。在current private source已有一条可匹配import的情况下，`imports.length > 0`仍为真，因此多行alias及其parameterized writer会被跳过。
- `writeFileSync`不在current `mutationPrimitives`中。追加`import { writeFileSync as emitReportSync } from "node:fs";`与`emitReportSync(target, content)`后，该binding可被解析但不会进入mutation binding/call或unique-writer判定。
- 对`  async function mutateDuringDiscovery(input) { ... }`重放current declaration regex，匹配数为`0`；discovery中即使保留对该helper的直接调用，可达遍历也不会沿此edge抵达known producer/mutation。
- Current focused verification继续为`10/10`，说明三个精确mutant尚未进入当前matrix。

#### Impact（影响）

Private script可用无语义差异的多行named import、直接sync writer binding，或有缩进的local declaration新增第二writer/让discovery抵达mutation，而AC7的unique producer与legacy discovery read-only oracle仍保持绿色。

#### Suggested Bounded Fix（建议的最小修复）

- 对全部`node:fs` / `node:fs/promises` static imports做完整消费校验：有限支持多行named specifier并保留`original -> local`，或对未被当前named-only extractor消费的static import显式fail-close。以current private source所需的有限original-binding allowlist作为准入，使`writeFileSync`等新增API默认失败，不枚举future mutation API。
- Local function declaration matcher仅扩展为允许行首水平空白，继续沿现有direct-call闭包审计。
- 新增“多行aliased named import + parameterized writer”、“`writeFileSync` aliased writer”与“有缩进indirect helper”三个独立mutant。不实现通用JavaScript parser，不扩展到arrow/function-expression、method dispatch、computed call或外部模块。
- 仅需修改`test/prd-validation-report-path.test.ts`；若新gate对current source产生RED，必须返回fresh Evaluator，不得修改private source。

## Closed / Rejected Candidates（已关闭与驳回候选）

1. **Round 5 TOML explicit matrix — closed**：current helper直接使用项目已有`toml` parser，table-scoped、quoted/spaced dotted keys与`dir`/`folder`矩阵均已通过。
2. **TOML array/array-of-table/inline-table semantic leaves — rejected**：`flattenTomlLeafPaths()`确实在array节点停止，`[[workflow]]\nreport_path = "arbitrary.md"`与`workflow = [{ report_path = "arbitrary.md" }]`可形成稳定mutant；但Round 5 Evaluator的唯一授权是已列明table/dotted syntax与role matrix，且明示不扩张到任意TOML value type。该候选属于新parser/meta-test范围，不得仅因反例存在而转为P1/P2。
3. **Round 5 current FS baseline — partial closure**：current单行static named imports、第二条单行aliased import、零缩进local function declarations与indirect helper mutant均已识别；Finding #2只保留同一授权语法/角色义务内的多行、缩进和新original binding fail-open。
4. **Generic JavaScript analysis — rejected**：namespace/default/dynamic继续fail-close；不要求arrow/function expression、method dispatch、computed call、external module或完整call graph。
5. **Exact filename/date/path与single invocation date — closed**：current producer的calendar date、`REPORT_PREFIX + date + .md`、Step 2–13 path binding与cross-midnight state无新反证。
6. **Existing-target/race/zero mutation — closed**：early probe、commit-time recheck、exclusive `wx`、same/different content、stable issue、manual action与zero suffix/temp/progress evidence维持关闭；不重开既有OS race排除。
7. **Legacy lifecycle/downstream/location inventory — closed**：五类legacy family、install/update/repair preservation、逐metadata surface zero intersection、same-basename no-follow inventory及三个downstream physical owner chain无新反例。
8. **External drift — excluded**：`assets/source/speclite/core-skills/speclite-drawer-er-modeler/`、zip、workspace IDE mirrors与fixed-count drift不属于Story 11.7 finding，未运行build/full/packaging。

## Triage Summary（分流摘要）

| ID | Sources | Severity | Bucket | Decision |
| --- | --- | --- | --- | --- |
| 1 | blind + acceptance | P1 | `patch` | Confirmed；complete-clause role-swap与`{` shared boundary是Round 5 Finding #1内两个独立、有限义务。 |
| 2 | blind + edge + acceptance | P1 | `patch` | Confirmed；multiline static named import、`writeFileSync` original binding与leading-whitespace local declaration均直接属于Round 5 Finding #3的有限binding/reachability责任。 |
| R1 | edge | — | `dismiss` | TOML array/array-of-table/inline-table leaf超出Round 5明确syntax/value-type授权；作为generic parser/meta-test扩张驳回。 |

- `decision_needed`: 0
- `patch`: 2
- `defer`: 0
- `dismiss`: 1 candidate group
- P2: 0

## Owner Gate（Owner 门禁）

**Owner Gate：`NONE`。** 两项都是不改变产品、Architecture或current runtime语义的focused evidence加固，修复方向可限定在`test/prd-validation-report-path.test.ts`。应先由fresh Evaluator Round 6独立裁决；若确认，Fixer只能修改Evaluator授权的focused test并追加Round 6 evaluation Fix Summary，不得修改source、Story、tracker、completion gate、既有CR、external drawer/zip、IDE mirrors或fixed-count baselines。

## Verdict（裁决）

- **Verdict：FAIL**
- **P1：2**
- **P2：0**
- **Rejected：1 candidate group**
- **Owner Gate：`NONE`**
- **Next Gate**：fresh Evaluator Round 6；最新Reviewer/Evaluator双PASS前不得进入CR04、CR05或CR06。
