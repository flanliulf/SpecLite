---
Story: 11-7
Round: 8
Date: 2026-09-05
Model Used: GPT-5.6 (gpt-5.6)
Layer: Edge Case Hunter
Type: Code Review Layer Result
---

## Verdict（结论）

**PASS**。在 Story 11.7 finite active contract 与 Round 5–7 Evaluator 已授权的有限 evidence 边界内，未发现新的 bounded stable violation。Round 7 的 nested local declaration + declaration-after direct-call false-green 已由 test-local declared-function body span 扫描关闭；历轮已关闭项没有出现可复现反证。

- Focused verification：`npx vitest run test/prd-validation-report-path.test.ts --reporter=dot` → `1 file / 10 tests passed / 0 failed`。
- Review boundary：Story 11.7 AC1–AC10、Round 1–7 summary/evaluation/Fix Summary、current focused test helper与private producer/discovery source。
- Explicit exclusions：未运行 build、full suite、packaging或canonical governance；external `speclite-drawer-er-modeler/`与zip、workspace IDE mirrors、fixed-count drift均未进入finding。

## Findings（发现）

无。

## Round 7 Closure Verification（Round 7 闭环复核）

1. **Nested declaration不再截断enclosing discovery body — closed**：`findDiscoveryReachableMutations()`不再以“下一条declaration”为section终点，而是从每条受支持declaration的opening brace调用`findDeclaredFunctionBodyEnd()`取得完整body span。因而`discoverPrdValidationReports`的section保留nested declaration之后的`await mutateDuringDiscovery(input)`。
2. **Nested mutant稳定命中三段受保护路径 — closed**：current mutant把缩进的`mutateDuringDiscovery(input)`声明与声明后的direct call同时插入discovery body；断言稳定返回`executePrdValidationReportOperation`、`inspectTarget`与`writeFile`。
3. **既有direct-call closure回归保持 — closed**：Round 5 external local helper mutant与Round 6 leading-whitespace declaration mutant继续返回同一三项；无mutant的current read-only discovery继续返回`[]`。
4. **有限结构fail-close保持 — closed**：declaration start与simple-parameter/full declaration数量必须一致；duplicate local name、unsupported/unbalanced body span以及未消费static fs import均显式失败，不会静默形成PASS。

## Historical Closed Items（历轮已关闭项）

1. **Exact filename/date/path与single invocation date — closed**：valid calendar date、`REPORT_PREFIX + invocationDate + .md`、Step 2–13 locked `validationReportPath`及cross-midnight metadata仍无反证。
2. **Existing-target/race/zero mutation — closed**：early probe、commit-time recheck、exclusive `wx`、same/different content、stable issue、exact manual action与zero suffix/temp/progress evidence维持关闭。
3. **Legacy lifecycle与downstream owner chain — closed**：五类legacy family在install/update/repair中原位保留；四个command metadata surface保持zero intersection；三个downstream consumer仍要求`realProject → realPlanning → exact realPlanning/prd → candidate`物理owner链。
4. **Same-basename location/type inventory — closed**：全项目matching symlink、directory与other entry继续通过no-follow location/type inventory fail-close。
5. **Managed basename与role inventory — closed**：whole framed value、共享unframed boundary、complete-clause occurrence/role、published config target-key matrix、private `REPORT_PREFIX`与ordered `LEGACY_PATTERNS` exact role均无新绕过。
6. **Static fs binding与唯一producer — closed**：单行/多行named import均被完整消费，original binding限于current有限allowlist；唯一`writeFile` producer与discovery可达mutation闭包保持受保护。
7. **Repair success与completion command inventory — closed**：repair公开success/mirror恢复断言以及可重放affected command inventory没有新反证。

## Rejected Candidates（驳回候选）

1. **把nested declaration body中的未调用语句计入enclosing section**：current有限扫描可能保守地fail-close，但不会造成read-only mutation漏检；它不是Story 11.7的false-green violation，也不授权扩展scope-sensitive AST call graph。
2. **Regex literal、template interpolation、arrow/function expression、method/computed dispatch或external module的任意语法分析**：这些候选需要超出current producer与已授权mutant形态的通用JavaScript parser/AST或完整call graph，缺少active-contract内的有限修复边界，本轮驳回。
3. **TOML arrays、array-of-tables与inline-table object leaf**：Round 5–7 Evaluator已明确排除任意TOML value-type扩张；current table/dotted-key矩阵没有新反证，不重开。
4. **External drawer/fixed-count drift**：属于Story 11.7范围外状态，不进入本层finding。

## Owner Gate（Owner 门禁）

**NONE**。本层无finding、无产品或Architecture决策；可交由fresh Aggregator与fresh Evaluator独立确认Round 8整体裁决。最新Reviewer/Evaluator双PASS之前仍不得进入CR04、CR05或CR06。

## Edge Findings JSON（边界发现 JSON）

```json
[]
```

