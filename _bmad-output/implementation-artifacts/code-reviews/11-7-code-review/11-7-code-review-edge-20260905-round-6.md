---
Story: 11-7
Round: 6
Date: 2026-09-05
Model Used: GPT-5.6 (gpt-5.6)
Layer: Edge Case Hunter
Type: Code Review Layer Result
---

## Verdict（结论）

**FAIL**。Round 5 的三组有限 test-only 修复在 current source 上为绿色，但沿新增 TOML semantic-path 与 private filesystem binding oracle 的直接分支继续遍历后，仍有 `2` 个可由 bounded mutant 稳定复现的 P1 false-green。两项均直接映射 Story 11.7 已声明的 active contract，不要求完整 TOML/JavaScript parser、任意自然语言词汇或无限 meta-test 扩张。

- Focused verification：`npx vitest run test/prd-validation-report-path.test.ts` → `1 file / 10 tests passed / 0 failed`。
- Review boundary：Story 11.7 current bounded slice、Round 5 summary/evaluation/Fix Summary、current focused test helper与private producer/discovery source；未运行 build/full/packaging。
- Explicit exclusions：external `speclite-drawer-er-modeler/` 与 zip、workspace IDE mirrors、fixed-count drift均未进入 finding。

## Findings（发现）

### 1. [P1 / PATCH-EVIDENCE] TOML semantic-path traversal在array节点停止，嵌套report target仍可绕过

- **Location**：`test/prd-validation-report-path.test.ts:859-891`
- **Trigger condition**：published config把report target放在array-of-tables或inline-table array内，例如`[[workflow]]\nreport_path = "arbitrary.md"`。
- **Evidence**：`flattenTomlLeafPaths()`只在`nested`是object且`!Array.isArray(nested)`时递归；任何array都直接返回其父path（`:867-873`）。使用current helper等价重放：`[[workflow]]\nreport_path = "arbitrary.md"`与`workflow = [{ report_path = "arbitrary.md" }]`都只得到`keys=["workflow"]`，随后`filter(isReportTargetOverrideKey)`均得到`[]`。作为控制，`[[report]]\npath = "arbitrary.md"`偶然因父key本身为`report`而被拒绝，但不能覆盖非report父节点中的`report_path` leaf。三者均由项目现有`toml` parser正常解析，value刻意不含managed basename，因此classifier不会补捕。
- **Potential consequence**：`config.toml.example`可恢复第二套report filename/path target，而AC5/AC6/AC9 evidence仍保持绿色。
- **Minimal guard**：仅扩展test-local semantic-path flatten：递归array内的object元素并保留完整leaf path；加入上述两个稳定mutant和一个scalar-array合法控制。不新增依赖、不手写TOML parser，也不扩展report-key vocabulary。

### 2. [P1 / PATCH-EVIDENCE] Private filesystem oracle仍允许未解析named import与未列举写API fail-open

- **Location**：`test/prd-validation-report-path.test.ts:511-546,914-987`
- **Trigger condition**：private script新增第二条多行named import writer，或从`node:fs`别名导入`writeFileSync`并调用。
- **Evidence**：`extractFsPromiseBindings()`的import regex要求整个specifier与`from`位于同一行（`:917-928`）。在current source后追加合法的多行`import {\n writeFile as emitReport\n} from "node:fs/promises"`及parameterized `emitReport(target, content)`后，原首条import使`imports.length > 0`，新增import既不进入binding inventory也不触发unsupported-form fail-close；current唯一writer判断仍只看到原`writeFile`。独立地，单行`import { writeFileSync as emitReportSync } from "node:fs"`虽会解析为binding，但`mutationPrimitives`没有`writeFileSync`（`:511-514`），所以`hasOnlyAuthorizedReportWriter()`和discovery reachable-mutation filter均忽略该调用。两个mutant都无需新增managed literal、改变`REPORT_PREFIX`/`LEGACY_PATTERNS`或使用method dispatch。
- **Potential consequence**：private script可增加第二条report/evidence写路径，而唯一producer与read-only discovery oracle仍通过。
- **Minimal guard**：对每一条`node:fs`/`node:fs/promises` import做完整消费校验，未被当前有限named-import extractor解析的语句必须fail-close；再以current private script所需的有限original-binding allowlist约束fs imports，只允许既有read primitives加唯一`writeFile`，从而让`writeFileSync`等新增API默认失败。增加上述多行alias与sync writer两个mutant；不分析namespace method dispatch、不实现通用JavaScript parser。

## Closed / Rejected Candidates（已关闭与驳回候选）

1. **Round 5 clause-role与boundary修复 — closed**：完整reference clause缺失会fail-close；candidate start/end共用同一有限boundary集合，已覆盖Round 5授权矩阵并保留identifier substring控制。未要求继续枚举任意Unicode或HTML标点。
2. **Round 5普通TOML forms — closed**：table-scoped、quoted/spaced dotted keys及`dir`/`folder`已进入完整semantic key predicate。Finding #1只处理current递归函数明确排除的array-object分支，不增加key同义词。
3. **Round 5 direct local-function reachability — closed**：function declaration direct-call闭包可从discovery抵达known producer及解析后的mutation local binding。Arrow expression、method dispatch、computed call和外部模块分析按Evaluator边界继续排除。
4. **Exact filename/date/path与single invocation date — closed**：current producer的calendar date、`REPORT_PREFIX + date + .md`、Step 2–13 path绑定与cross-midnight state没有新反证。
5. **Existing-target/race/zero mutation — closed**：early probe、commit-time recheck、exclusive `wx`、same/different content、stable issue、manual action与zero suffix/temp/progress evidence维持关闭；不重开前轮已排除的额外OS race seam。
6. **Legacy lifecycle与downstream qualification — closed**：五类legacy family、install/update/repair preservation、逐metadata surface zero intersection、same-basename no-follow inventory及三个downstream physical owner chain没有新反例。
7. **Generic parser/meta-test expansion — rejected**：未保留escaped-comment/import grammar、任意TOML value type、任意report同义词、任意JavaScript alias或完整call-graph等候选。
8. **External drift — excluded**：drawer、zip、IDE mirrors与fixed-count baseline不属于Story 11.7。

## Owner Gate（Owner 门禁）

**NONE**。两项都可限定为`test/prd-validation-report-path.test.ts`内的finite evidence hardening，不改变产品、Architecture或current canonical source语义；若新gate对current source产生RED，必须返回fresh Evaluator，不得扩大source白名单。

## Edge Findings JSON（边界发现 JSON）

```json
[
  {
    "location": "test/prd-validation-report-path.test.ts:859-891",
    "trigger_condition": "TOML report target is nested inside an array object",
    "guard_snippet": "Recurse object elements inside arrays while preserving full semantic paths",
    "potential_consequence": "Published report target bypasses the config negative gate"
  },
  {
    "location": "test/prd-validation-report-path.test.ts:511-546,914-987",
    "trigger_condition": "Filesystem writer uses multiline import or unlisted sync API",
    "guard_snippet": "Fail closed on unparsed imports and allowlist current fs bindings",
    "potential_consequence": "A second evidence writer escapes the private-role oracle"
  }
]
```

## Recommended Next Action（建议下一步）

交由fresh Aggregator按active-contract、stable-mutant与finite-fix三项收敛标准跨层去重，再由fresh Evaluator独立裁决。最新Reviewer/Evaluator双PASS前不得进入CR04、CR05或CR06。
