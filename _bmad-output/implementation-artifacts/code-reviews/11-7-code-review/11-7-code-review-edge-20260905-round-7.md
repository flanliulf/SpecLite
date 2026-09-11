---
Story: 11-7
Round: 7
Date: 2026-09-05
Model Used: GPT-5.6 (gpt-5.6)
Layer: Edge Case Hunter
Type: Code Review Layer Result
---

## Verdict（结论）

**FAIL**。Round 6 的五组有限 test-only 修复在 current source 上为绿色；沿已授权的“leading-whitespace local function declaration + direct-call closure”继续遍历后，仍有 `1` 个可由 bounded mutant 稳定复现的 P1 false-green。该问题不重开 TOML arrays、不要求 arrow/function expression、method dispatch、跨模块调用或通用 JavaScript parser。

- Focused verification：`npx vitest run test/prd-validation-report-path.test.ts --reporter=dot` → `1 file / 10 tests passed / 0 failed`。
- Bounded replay：current private source返回`[]`；在`discoverPrdValidationReports`函数体内插入一个缩进的`async function mutateDuringDiscovery(input)`，其body调用`executePrdValidationReportOperation(input)`，并在该声明后从discovery直接调用时，current `findDiscoveryReachableMutations()`仍返回`[]`。
- Review boundary：Story 11.7 finite active contract、Round 6 summary/evaluation/Fix Summary、current focused test helper与private producer/discovery source；未运行 build/full/packaging。
- Explicit exclusions：external `speclite-drawer-er-modeler/`与zip、workspace IDE mirrors、fixed-count drift均未进入finding。

## Findings（发现）

### 1. [P1 / PATCH-EVIDENCE] Nested local declaration会截断enclosing discovery section并漏掉后置direct call

- **Location**：`test/prd-validation-report-path.test.ts:571-581,995-1034`
- **Trigger condition**：discovery函数体内声明缩进的local function，并在声明之后direct-call该函数。
- **Evidence**：`findDiscoveryReachableMutations()`先以所有function declaration的起点切分线性sections（`:999-1007`）。当nested declaration位于`discoverPrdValidationReports`函数体中时，enclosing discovery section在nested declaration起点提前结束；位于声明之后的`mutateDuringDiscovery(input)`调用不再属于discovery section。虽然nested function自身section包含`executePrdValidationReportOperation(input)`，但reachable queue从未加入它。最小mutant在nested body调用已保护producer，并在同一discovery body声明后direct-call；current helper仍返回`[]`，与无mutantbaseline相同。Round 6现有mutant把缩进声明追加到文件末尾且把direct call插在原discovery section内（`:571-581`），因此未覆盖这一直接嵌套分支。
- **Potential consequence**：read-only discovery可经nested local function抵达report writer，而AC7/AC9 private-role oracle仍保持绿色。
- **Minimal guard**：在test-local reachability helper中保留现有有限function-declaration/direct-call模型，但必须让enclosing function的审计范围覆盖其完整body，或对enclosing body内声明后的local direct call显式fail-close；加入上述“nested declaration + declaration后direct call”单一mutant，并继续要求返回`executePrdValidationReportOperation`、`inspectTarget`与`writeFile`。不得扩展到arrow/function expression、method/computed dispatch、external module或完整通用parser。

## Closed / Rejected Candidates（已关闭与驳回候选）

1. **Round 6 complete-clause role-swap — closed**：allowlist现绑定完整sentence/bullet/CSV field与occurrence count；保留旧fragment/count但改变surrounding role的mutant会fail-close。
2. **Round 6 shared `{` boundary — closed**：`isUnframedBoundary()`已恢复`{`前界，brace-wrapped legacy basename不再从candidate scan逃逸。
3. **Round 6 multiline static fs import — closed**：named import extractor可跨行消费specifier，并以static fs reference数量校验未消费import。
4. **Round 6 current fs original-binding allowlist — closed**：解析后的binding严格限定为`lstat, readFile, readdir, realpath, stat, writeFile`；`writeFileSync`mutant确定性失败。
5. **Round 6 top-level indented local declaration — closed**：允许horizontal whitespace的declaration matcher可识别既有追加式缩进mutant。Finding #1仅保留同一已授权分支中“nested declaration截断enclosing section、且direct call位于声明后”的确定性残余。
6. **TOML arrays与通用parser/meta-test — rejected**：继续遵守Round 6 Evaluator裁决，不重开array-of-tables、inline-table arrays、任意TOML value type、escaped import/comment grammar或通用JavaScript parser。
7. **Exact filename/date/path与single invocation date — closed**：current producer的calendar date、`REPORT_PREFIX + date + .md`、Step 2–13 locked path与cross-midnight state没有新反证。
8. **Existing-target/race/zero mutation — closed**：early probe、commit-time recheck、exclusive `wx`、same/different content、stable issue、manual action及zero suffix/temp/progress evidence维持关闭。
9. **Legacy lifecycle/downstream/location inventory — closed**：五类legacy family、install/update/repair preservation、逐metadata surface zero intersection、same-basename no-follow inventory与三个downstream physical owner chain没有新反例。
10. **External drift — excluded**：drawer、zip、IDE mirrors与fixed-count baseline不属于Story 11.7。

## Owner Gate（Owner 门禁）

**NONE**。该finding可限定为`test/prd-validation-report-path.test.ts`内的finite evidence hardening，不改变产品、Architecture或current canonical source语义。若fresh Aggregator与Evaluator确认，Fixer只应补充一个nested-declaration mutant并修正test-local reachability helper；不得修改private producer、canonical prose/source或扩大语法支持边界。

## Edge Findings JSON（边界发现 JSON）

```json
[
  {
    "location": "test/prd-validation-report-path.test.ts:571-581,995-1034",
    "trigger_condition": "Nested local declaration precedes its discovery direct call",
    "guard_snippet": "Preserve enclosing function body through nested declarations before tracing local calls",
    "potential_consequence": "Read-only discovery can reach the report writer undetected"
  }
]
```

## Recommended Next Action（建议下一步）

交由fresh Aggregator按active-contract、stable-mutant与finite-fix标准跨层去重，再由fresh Evaluator独立裁决。最新Reviewer/Evaluator双PASS前不得进入CR04、CR05或CR06。
