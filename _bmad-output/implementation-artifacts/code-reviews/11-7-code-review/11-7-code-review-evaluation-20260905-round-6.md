---
Story: 11-7
Round: 6
Date: 2026-09-05
Model Used: GPT-5.6 (gpt-5.6)
Review Source: 11-7-code-review-summary-20260905-round-6.md
Review Model: GPT-5.6 (gpt-5.6)
Type: Code Review Evaluation
---

## 评估总结

对 Story 11-7 的第 6 轮 CR 代码审查结果（复审）进行逐条独立评估。经核对三层正式产物、Story AC1–AC10、Round 5 summary/evaluation/Fix Summary、current focused test helper与private producer/discovery source，聚合后的2个P1均直接落在Round 5已经授权的active role invariant内，且均有不依赖current source违规的稳定mutant；全部确认有效并阻塞交付。

本轮继续执行Round 5确定的收敛标准：只保留“直接保护已声明active surface/role invariant、存在稳定mutant、可在单一focused test文件内有限修复”的问题。Finding #1仅补全complete-clause role与既有`{` shared boundary；Finding #2仅补全static named fs import消费、current original-binding allowlist及local function declaration的水平缩进。TOML array、array-of-table与inline-table object leaf继续驳回，不授权任意TOML value type、通用JavaScript parser或新的泛化meta-test。

独立运行`npx vitest run test/prd-validation-report-path.test.ts --reporter=dot`得到`1 file / 10 tests passed / 0 failed`。该绿色证明current source与已编码矩阵成立，但不能反驳尚未进入矩阵的五个精确mutant。本轮无P2，Owner Gate为`NONE`。

---

## 上轮问题回顾确认

### Round 5 Finding #1 — complete-clause support role与共享unframed boundary：部分关闭

Round 5 Fixer已把allowlist结构改为`clause + occurrences`，并让candidate start/end共用`isUnframedBoundary()`。但current登记项仍有多处是完整sentence/bullet/CSV field中的局部fragment，例如`validate-prd/SKILL.md`仅登记“通过 private `scripts/prd-validation-report-operation.mjs` 执行 exclusive create”（`test/prd-validation-report-path.test.ts:576-599`）；current role-swap mutant则把整句换成不再含该fragment的句子（`:601-613`），没有证明“fragment及count保持不变、只改变surrounding role”时会fail-close。共享boundary也遗漏了修复前prefix finder已经接受的`{`（`:832-857`）。因此本轮只保留这两个有限残余义务。

### Round 5 Finding #2 — TOML semantic key path：在已授权矩阵内关闭

Current test已使用项目既有`toml` parser，并覆盖table-scoped、quoted/spaced dotted keys及`dir`/`folder`明确role matrix（`test/prd-validation-report-path.test.ts:430-472,859-891`）。`flattenTomlLeafPaths()`确实不遍历array object，但Round 5只授权table/dotted forms与明确target roles，并明确不要求任意TOML value type。本轮维持array、array-of-table与inline-table object leaf候选为越界扩张，不形成P1/P2。

### Round 5 Finding #3 — fs binding与discovery local-function可达闭包：部分关闭

Current test已枚举单行static named fs imports、保留`original -> local`，并从discovery沿零缩进local function declarations计算direct-call闭包（`test/prd-validation-report-path.test.ts:511-557,914-987`）。但import regex不消费多行named specifier，writer判断又只筛选预列出的mutation primitives；合法`writeFileSync` original binding因此被默认忽略。Declaration regex要求`function`位于行首第一个字符，有leading whitespace的同类local declaration不会进入可达图。三者均是Round 5明示责任内的格式或准入残余，而非通用module/call-graph要求。

### Round 1–4及Round 5其余义务：维持关闭

Exact filename/date/path、single invocation date、same-day read-only block、commit-time exclusive create、stable issue、Step 2–13 locked path、五类legacy lifecycle、逐metadata surface zero intersection、same-basename no-follow inventory及downstream physical owner chain均无新反证。External `speclite-drawer-er-modeler/`、zip、workspace IDE mirrors与fixed-count drift继续排除。

### 历史 CR TODO（非阻塞）

无。Round 6没有P2；两个finding都直接阻断AC5/AC6/AC7/AC9 evidence。

---

## 发现 #1 评估

### 审查原文

> **[中][P1 / PATCH-EVIDENCE] Active basename inventory的complete-clause role与共享boundary仍可false-green**
> - 来源：blind + acceptance；Aggregator独立重放
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

`supportReferenceAllowlist`虽然把字段命名为`clause`，但多数值仍只覆盖包含受管basename的句内fragment（`test/prd-validation-report-path.test.ts:576-599`）。`removeExactRoleFragments()`只验证该fragment出现次数后执行`replaceAll()`（`:990-1001`），并不校验两侧是否仍是reference/support role。Current `roleSwapMutant`删除了整个合法contract句，再换成不含原登记fragment的新句（`:601-613`），所以只能证明“fragment丢失”会失败，不能证明“fragment与count不变但surrounding role变成report filename/default”会失败。聚合器给出的完整句替换保持登记fragment一次出现；current removal仍会删掉该fragment，使integrated managed-basename scan假绿，反例成立。

`isUnframedBoundary()`由candidate start/end共同调用，但字符集合不含`{`（`test/prd-validation-report-path.test.ts:817-857`）。Round 5之前的prefix前界已经接受`{`；共享化的目标不是移除既有有效前界。`{prd-validation-report-old.md}`因prefix前一字符不被识别而返回空candidate，直接留下AC6 active negative scan缺口。

**严重性判断：合理**

两条分支都允许active Skill/docs/help surface在恢复legacy/非法managed basename后继续通过focused oracle，直接影响AC5、AC6与AC9。它们不是current canonical source已经违规的证明，而是当前completion evidence可false-green的P1质量门禁问题。

**修复建议：可行**

唯一bounded修复必须同时完成两组彼此独立的RED/GREEN义务：

1. 将`supportReferenceAllowlist`的每项登记升级为真实文件中的完整、稳定reference sentence、bullet或CSV field，并继续绑定`relativePath + exact occurrence count`。Role-swap mutant必须保留受管basename fragment及其原count，只把surrounding complete clause改为report filename/default role；RED应证明旧fragment removal会让integrated scan假绿，GREEN应因完整clause/anchor缺失而fail-close。Current全部合法完整clause必须继续通过。
2. 在同一test-local shared boundary中恢复既有`{`前界，并加入`{prd-validation-report-old.md}`独立mutant。RED必须证明current extractor返回空；GREEN必须证明该active非法basename不再逃逸。保留普通identifier substring不命中以及现有`, ; | ? & =`矩阵，不扩展为任意Unicode/Markdown标点扫描。

仅修改`test/prd-validation-report-path.test.ts`。不得修改canonical prose/source迁就测试。

**误报评估：非误报**

两个反例均来自current helper的精确数据结构或字符集合，并直接绑定Round 5已授权的complete-clause与shared-boundary责任。

---

## 发现 #2 评估

### 审查原文

> **[中][P1 / PATCH-EVIDENCE] Private fs binding与discovery reachability的有限语法盘点仍fail-open**
> - 来源：blind + edge + acceptance；Aggregator独立重放
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确，但必须按有限语法与current binding set收窄**

`extractFsPromiseBindings()`使用`^import ... from ...$`的单行regex（`test/prd-validation-report-path.test.ts:914-928`）。多行`import {\n writeFile as emitReport\n} from "node:fs/promises"`不会进入inventory；因为current private source已有一条可匹配import，`imports.length > 0`仍成立，所以也不会fail-close。新增`emitReport(target, content)`调用后，`hasOnlyAuthorizedReportWriter()`仍只看见current writer（`:937-945`），稳定反例成立。

Current mutation判定只保留`mutationPrimitives`列出的original names（`test/prd-validation-report-path.test.ts:511-517,532-538,968-970`）。`writeFileSync`并不在该列表中；因此`import { writeFileSync as emitReportSync } from "node:fs"`可被解析，却会在writer与discovery筛选前被忽略。Private source current静态fs original binding set为`lstat, readFile, readdir, realpath, stat, writeFile`（`assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-validate-prd/scripts/prd-validation-report-operation.mjs:3`）；使用该有限current set作fail-close准入即可捕捉`writeFileSync`，无须枚举全部future fs mutation APIs。

`findDiscoveryReachableMutations()`的declaration regex要求`function`从行首第一个字符开始（`test/prd-validation-report-path.test.ts:948-960`）。把Round 5已授权的`async function mutateDuringDiscovery(...)`仅加水平缩进后，helper不进入`sections`；即使discovery保留对它的direct call，闭包仍无法抵达`executePrdValidationReportOperation -> inspectTarget -> writeFile`。该反例仍是local function declaration/direct-call闭包，不涉及arrow、function expression、method dispatch或外部模块。

**严重性判断：合理**

三个有限分支均可隐藏第二writer或discovery-reachable mutation，使AC7 legacy evidence只读/不迁移保证及AC9 fixture证据假绿。Current runtime仍仅有一条`writeFile(..., { flag: "wx" })`，不改变finding作为P1 evidence blocker的成立性。

**修复建议：可行**

唯一bounded修复必须完成以下三组独立RED/GREEN义务：

1. 对每一条`node:fs`或`node:fs/promises` static import做完整消费校验。有限支持`{...}`内换行的named specifier并保留`original -> local`，或对任何未被有限named-only extractor完整消费的static fs import显式fail-close。多行`writeFile as emitReport`加parameterized writer mutant必须RED；GREEN后必须枚举该local binding并使unique-writer gate失败。
2. 对解析到的fs original binding实施精确current allowlist：只接受private source当前的`lstat, readFile, readdir, realpath, stat, writeFile`集合，并继续要求唯一authorized mutation binding为未改名的`writeFile`及唯一current callsite。`writeFileSync as emitReportSync`加调用的mutant必须RED；不得以向`mutationPrimitives`不断枚举future API代替fail-close allowlist。
3. Local function declaration matcher仅扩展为允许行首水平空白，再沿现有direct-call闭包审计。有leading whitespace的`mutateDuringDiscovery` mutant必须先证明旧helper返回空，再在GREEN中识别`executePrdValidationReportOperation`、`inspectTarget`与`writeFile`；current纯只读discovery必须保持空violations。

不实现通用JavaScript parser，不分析namespace/default/dynamic之外的新module形态，不扩展arrow/function expression、method/computed dispatch、跨模块调用或完整call graph。若任一新gate在无mutant的current private source上产生RED，Fixer必须停止并返回fresh Evaluator，不得修改private source。

仅修改`test/prd-validation-report-path.test.ts`。

**误报评估：非误报**

多行named import、未准入original binding和leading-whitespace local declaration均能由current regex/filter确定性复现，并严格属于Round 5已授权的全部static named bindings与local declaration direct-call reachability。

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | Complete-clause role与既有`{` shared boundary仍可false-green | [中] | **P1** | 保留fragment/count的role swap与brace-wrapped非法basename均可绕过AC6 evidence。 |
| 2 | Private fs binding与discovery有限语法盘点仍fail-open | [中] | **P1** | 多行named import、`writeFileSync` original binding和缩进local declaration可绕过AC7 evidence。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

无。本轮不把直接AC evidence blocker降级为TODO。

### 可忽略（误报）

| # | 发现 | 原始严重性 | 忽略理由 |
|---|------|----------|---------|
| R1 | TOML array/array-of-table/inline-table object leaf | [中]候选 | Round 5明确只授权table-scoped、quoted/spaced dotted及`dir`/`folder`矩阵，并排除任意TOML value type；本候选属于新parser/meta-test扩张。 |

### Fixer 授权边界

Fresh Fixer只获准修改：

- `test/prd-validation-report-path.test.ts`
- 本evaluation文档，仅追加Fix Summary（修复摘要）。

不得修改private `prd-validation-report-operation.mjs`、任何canonical source/prose、published config、Story、tracker、completion gate、SPEC、validation rules/scoring/report body、IR filename、public CLI/schema、dependencies、installer、packaging、Story 11.8+、external drawer/zip、workspace IDE mirrors、fixed-count baselines、summary/layer文件、历史CR产物或其它文件。

Fixer必须按Finding #1的2组义务与Finding #2的3组义务分别加入稳定mutant/assertion，并先取得可归因RED，再修改test-local helper取得GREEN。五组义务不得由单一宽泛断言相互替代。若任何RED来自无mutant的current source事实，必须停止并返回fresh Evaluator，不得扩大文件白名单或修改source。

修复后只运行：

- `npx vitest run test/prd-validation-report-path.test.ts`
- `git diff --check -- test/prd-validation-report-path.test.ts _bmad-output/implementation-artifacts/code-reviews/11-7-code-review/11-7-code-review-evaluation-20260905-round-6.md`

不得运行build、full suite、packaging、canonical governance或其它测试集合。Exact related/affected counts与completion gate由outer owner在Fixer完成后另行刷新。

### Owner Gate

**Owner Gate：`NONE`。** 两项均是方向唯一、test-only且不改变产品、Architecture或current runtime语义的bounded evidence加固。

### 评估决定

- **发现 #1（complete-clause role与`{` boundary）**：确认P1；完整clause role-swap和既有brace前界必须作为两组独立RED/GREEN义务交付。
- **发现 #2（fs binding与discovery reachability）**：确认P1；多行static named import、current original-binding allowlist与leading-whitespace local declaration必须作为三组独立RED/GREEN义务交付。
- **TOML arrays候选**：驳回；维持“任意TOML value type不在授权内”的Round 5边界，不形成P1/P2。
- **通用parser/meta-test**：不授权；不得借本轮修复扩展自然语言、TOML或JavaScript通用分析。
- **Round 1–4及Round 5已关闭项**：维持关闭，不授权重开。
- **整体决定**：`FAIL`。完成上述唯一bounded修复、outer owner刷新必要completion evidence，并取得fresh Reviewer/Evaluator双PASS之前，不得进入CR04、CR05或CR06。

## 修复执行记录

### 修复执行记录

- **Date**: 2026-09-05
- **Model Used**: GPT-5.6 (gpt-5.6)
- **Fix Items**: 2

#### Finding #1：Complete-clause role 与 shared boundary

- 将 `supportReferenceAllowlist` 中的 support exemptions 收紧为真实 active surface 的完整 sentence、bullet 或 CSV field，并继续绑定 `relativePath + exact occurrence count`。
- 新增保留既有 support fragment 及 occurrence count、仅将外围完整 clause 改为 default report filename role 的 mutant；旧 fragment-only allowlist 可重现 false-green，完整 clause allowlist 现会因 anchor 缺失而 fail-close。
- 在同一 test-local `isUnframedBoundary()` 中恢复 `{` 前界，并为 `{prd-validation-report-old.md}` 增加独立 mutant；canonical `{yyyy-MM-dd}` placeholder 由有限精确分支继续作为单一 basename 的组成部分消费。

#### Finding #2：Static fs binding 与 discovery reachability

- `extractFsPromiseBindings()` 现完整消费单行或多行的 `node:fs` / `node:fs/promises` static named imports，保留 `original -> local` 映射，并以 static fs reference 数量校验阻止未消费 import fail-open。
- 对解析到的 original binding 使用 exact current allowlist：`lstat, readFile, readdir, realpath, stat, writeFile`；新增 `writeFileSync as emitReportSync` mutant，未知 original binding 现被拒绝，`hasOnlyAuthorizedReportWriter()` fail-close。
- Local function declaration matcher仅增加 leading horizontal whitespace 支持；缩进版 `mutateDuringDiscovery` mutant 现沿既有 direct-call closure 报告 `executePrdValidationReportOperation`、`inspectTarget` 与 `writeFile`。

#### RED / GREEN Evidence（RED / GREEN 证据）

- **RED**：`npx vitest run test/prd-validation-report-path.test.ts --reporter=verbose` → `1 failed / 9 passed`；同一 focused case 内 5 个 soft assertions 分别确认 multiline named import、unapproved `writeFileSync` binding、leading-whitespace local declaration、fragment-preserving role swap 与 brace-wrapped basename 均可绕过旧 helper。
- **GREEN**：`npx vitest run test/prd-validation-report-path.test.ts` → `1 file / 10 tests passed / 0 failed`。
- 未运行 build、full suite、packaging、canonical governance 或其它测试集合；未修改 private producer、canonical prose/source、Story、tracker、completion gate、其它 CR 产物或 external drawer 范围。
