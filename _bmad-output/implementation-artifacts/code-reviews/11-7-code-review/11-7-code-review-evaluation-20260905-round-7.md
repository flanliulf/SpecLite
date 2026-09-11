---
Story: 11-7
Round: 7
Date: 2026-09-05
Model Used: GPT-5.6 (gpt-5.6)
Review Source: 11-7-code-review-summary-20260905-round-7.md
Review Model: GPT-5.6 (gpt-5.6)
Type: Code Review Evaluation
---

## 评估总结

对 Story 11-7 的第 7 轮 CR 代码审查结果（复审）进行逐条独立评估。经核对 Round 7 summary、三层正式产物、Round 5–6 evaluation 与 Fix Summary、current focused test helper以及private producer/discovery source，聚合后的唯一finding可由当前线性section算法确定性证明，并直接落在Round 5已授权的“local function declaration + direct-call可达闭包”义务内。该finding确认有效，维持P1并阻塞交付。

本轮修复只需在单一focused test中加入一个nested local declaration mutant，并把现有线性section切分替换为有限、test-local的function-body结构扫描。不得扩展为通用JavaScript parser/AST，也不授权arrow/function expression、method/computed dispatch、external module、任意表达式或完整call graph。本轮无P2，Owner Gate为`NONE`。

Round 7 Blind Hunter与Acceptance Auditor均为PASS，Edge Case Hunter为FAIL / 1 P1；三层均成功产出。已有focused `10/10`只能证明current source与现有矩阵绿色，不能反驳尚未编码的nested-local稳定mutant。本Evaluator未运行build、full suite、packaging、canonical governance或其它测试集合。

---

## 上轮问题回顾确认

### Round 6 Finding #1 — complete-clause role与shared boundary：关闭

Current test已将support exemption绑定到完整sentence、bullet或CSV field及精确出现次数，并恢复共享`{`前界；Round 7没有新证据推翻该闭环。

### Round 6 Finding #2 — static fs binding与leading-whitespace declaration：部分关闭，本轮仅保留nested-local body reachability残余

Current `extractFsPromiseBindings()`已完整消费单行/多行static named fs imports，限制current original-binding allowlist，并让未知binding fail-close（`test/prd-validation-report-path.test.ts:949-970`）。Local declaration matcher也已允许行首水平空白（`:999-1001`）。但section仍以“当前declaration起点到下一declaration起点”构造（`:1002-1007`），因此nested declaration会截断enclosing discovery body；本轮唯一finding只处理这一既有reachability义务的残余。

### 历史 CR TODO（非阻塞）

无。本轮summary没有P2，且不重开Round 5–6已驳回的TOML arrays、array-of-table、inline-table object leaf或通用parser/meta-test候选。

---

## 发现 #1 评估

### 审查原文

> **[中][P1 / PATCH-EVIDENCE] Nested local declaration截断enclosing discovery section并漏掉声明后的direct call**
> - 来源：edge；Aggregator独立重放确认
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

Current helper先收集全部function declarations，再将每个section截取为当前declaration起点至下一declaration起点（`test/prd-validation-report-path.test.ts:999-1007`）。可达队列只从`discoverPrdValidationReports`启动，并只根据当前section中的local function字面direct call扩展（`:1018-1033`）。

Private producer当前的`discoverPrdValidationReports`位于`assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-validate-prd/scripts/prd-validation-report-operation.mjs:56-83`，下一条top-level declaration是`inspectTarget`（`:85`），所以current source下线性section恰好覆盖完整discovery body。若在`const canonicalReports = [];`之前插入缩进的`async function mutateDuringDiscovery(input)`，并在该declaration之后调用`await mutateDuringDiscovery(input)`，declaration序列就会变为`discoverPrdValidationReports → mutateDuringDiscovery → inspectTarget`。此时discovery section在nested declaration起点终止，声明后的direct call不属于其section；虽然nested section包含对`executePrdValidationReportOperation(input)`的调用，但reachable queue从未取得通往nested helper的edge，最终仍返回空violations。

Round 6 mutant把缩进declaration追加在文件末尾，同时把direct call插入未被nested declaration截断的原discovery section（`test/prd-validation-report-path.test.ts:571-581`），只证明leading whitespace declaration可以被枚举，确实没有覆盖本轮结构分支。该false-green由current helper的明确控制流决定，不依赖对runtime source已经违规的主张。

**严重性判断：合理**

Round 5已把“从`discoverPrdValidationReports`出发，对private script中的local function declaration建立有限direct-call edge inventory并计算可达闭包”确认为AC7/AC9的P1 evidence义务。Nested local declaration仍是同一declaration形态，声明后的direct call仍是同一有限edge；当前gate可漏掉从read-only discovery到known producer及`writeFile`的可达路径，因此P1合理。

**修复建议：可行，但必须使用有限test-local结构扫描**

Fresh Fixer仅获准完成以下一组RED/GREEN义务：

1. 在`test/prd-validation-report-path.test.ts`中加入单一nested-local mutant：在current discovery body的`const canonicalReports = [];`之前插入缩进的`async function mutateDuringDiscovery(input) { await executePrdValidationReportOperation(input); }`，并在该声明之后插入`await mutateDuringDiscovery(input);`。旧helper必须先稳定RED，即实际返回`[]`而期望`["executePrdValidationReportOperation", "inspectTarget", "writeFile"]`。
2. 将“下一条declaration即section终点”的线性切分替换为有限、test-local的declared-function body span扫描：从每条已匹配declaration的函数体opening brace出发取得其对应closing brace，使enclosing discovery body保留nested declaration之后的语句，再沿现有local declaration name与direct-call闭包计算可达性。
3. 结构扫描只需支持current private producer与上述nested mutant实际使用的有限lexical形态；必须对其不支持或无法配对的结构显式fail-close。不得引入AST、dependency或通用JavaScript parser，不得新增arrow/function expression、method/computed dispatch、external module、任意表达式、动态调用或完整call graph支持。
4. GREEN必须同时证明：nested mutant返回`executePrdValidationReportOperation`、`inspectTarget`与`writeFile`；Round 5 external helper mutant、Round 6 leading-whitespace mutant继续返回同一三项；无mutant的current只读discovery继续返回`[]`。

该方案不改变private producer或产品语义，只修正test-local evidence oracle的结构边界，且不会重开已明确排除的generic analysis。

**误报评估：非误报**

根因可由current section构造与queue扩展代码逐行推出；stable mutant完全位于既有local declaration/direct-call语法授权内。Blind与Acceptance的current-green结论不覆盖此未编码分支，不能将其降级或忽略。

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | Nested local declaration截断enclosing discovery section | [中] | **P1** | 声明后的direct call无法进入reachable queue，导致known producer/mutation路径false-green。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

无。

### 可忽略（误报）

无。Round 7 summary中的唯一finding确认有效。

### Fixer 授权边界

Fresh Fixer只获准修改：

- `test/prd-validation-report-path.test.ts`
- 本evaluation文档，仅追加Fix Summary（修复摘要）。

不得修改private `prd-validation-report-operation.mjs`、任何canonical source/prose、published config、Story、tracker、completion gate、SPEC、validation rules/scoring/report body、IR filename、public CLI/schema、dependencies、installer、packaging、Story 11.8+、external drawer/zip、workspace IDE mirrors、fixed-count baselines、summary/layer文件、历史CR产物或其它文件。

Fixer必须先用上述单一nested-local mutant取得可归因RED，再实现有限test-local function-body span扫描取得GREEN。若RED来自无mutant的current source，或实现需要AST/dependency/通用JavaScript parser、扩大语法矩阵、修改private source或增加文件白名单，必须停止并返回fresh Evaluator。

修复后只运行：

- `npx vitest run test/prd-validation-report-path.test.ts`
- `git diff --check -- test/prd-validation-report-path.test.ts _bmad-output/implementation-artifacts/code-reviews/11-7-code-review/11-7-code-review-evaluation-20260905-round-7.md`

不得运行build、full suite、packaging、canonical governance或其它测试集合。Exact related/affected counts与completion gate由outer owner在Fixer完成后另行刷新。

### Owner Gate

**Owner Gate：`NONE`。** 唯一finding具有方向唯一的test-only有限修复，不涉及产品、Architecture或current runtime语义选择。

### 评估决定

- **发现 #1（nested-local reachability）**：确认P1；必须用单一nested declaration + declaration-after direct-call mutant先RED，再以有限test-local function-body结构扫描修复，不能扩成通用JavaScript parser/AST。
- **Round 5 external helper与Round 6 leading-whitespace义务**：保持已交付，并作为GREEN回归断言继续存在。
- **TOML arrays与generic parser/meta-test候选**：维持驳回，不授权重开。
- **Round 1–6其它已关闭项**：维持关闭，不授权修改。
- **整体决定**：`FAIL`。完成唯一授权修复、outer owner刷新必要completion evidence，并取得fresh Reviewer/Evaluator双PASS之前，不得进入CR04、CR05或CR06。

## 修复执行记录

### 修复执行记录
- **Date**: 2026-09-05
- **Model Used**: GPT-5.6 (gpt-5.6)
- **Fix Items**: 1

#### Finding #1 — Nested local declaration 截断 enclosing discovery section

- **修改文件**：`test/prd-validation-report-path.test.ts`
- **RED 证据**：先加入唯一授权的 nested-local mutant：在 `const canonicalReports = [];` 前声明 `mutateDuringDiscovery(input)`，并在该 declaration 后直接调用。旧 helper 的 focused 结果为 `1 failed / 9 passed`，实际返回 `[]`，期望 `executePrdValidationReportOperation`、`inspectTarget`、`writeFile`。
- **修复内容**：将“下一条 declaration 为 section 终点”的线性切分替换为有限 test-local declared-function body span 扫描。扫描仅接受当前 producer 与 mutant 使用的 named function/simple parameters 形态，从 declaration 的 opening brace 配对至 closing brace；对未消费 declaration、重复名称或无法配对 body 显式 fail-close。既有 local declaration name + direct-call reachable closure 保持不变。
- **边界保持**：未引入 AST、dependency 或通用 JavaScript parser；未新增 arrow/function expression、method/computed dispatch、external module、动态调用或完整 call graph 支持。
- **GREEN 证据**：`npx vitest run test/prd-validation-report-path.test.ts` → `1 passed` test file，`10 passed` tests。Nested mutant、Round 5 external helper mutant、Round 6 leading-whitespace mutant均返回相同三项；无 mutant 的 current discovery 仍返回 `[]`。
- **结果**：已完成。
