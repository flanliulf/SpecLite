---
Story: 11-7
Round: 4
Date: 2026-09-05
Model Used: GPT-5.6 (gpt-5.6)
Review Source: 11-7-code-review-summary-20260905-round-4.md
Review Model: GPT-5.6 (gpt-5.6)
Type: Code Review Evaluation
---

## 评估总结

对 Story 11-7 的第 4 轮 CR 代码审查结果（复审）进行逐条独立评估。经对照 Story AC1–AC10、Epic 11 Story 11.7、PRD FR23e、SPEC 07 stable issue、SPEC 09 lifecycle边界、Round 1–3 summary/evaluation/fix records、current focused fixture、private producer/discovery script与completion gate，正式summary中的3个P1均可由current test结构与确定性反例直接证明；全部确认有效并阻塞交付。

三项finding的去重边界合理：Finding #1处理“已经出现managed basename时的值分类和role-scoped exemption”；Finding #2处理“不含managed basename也必须被拒绝的published config key-role”；Finding #3处理private script的whole-file producer集合和discovery read-only role。修复其中任一项都不能关闭另外两项，因此不再合并。本轮无P2、无Owner decision。

Current canonical source未出现非法default、report target override或第二producer/discovery mutation。本轮裁决只授权增强focused test evidence，不授权修改source、Story、tracker、completion gate或canonical prose。

---

## 上轮问题回顾确认

### Round 3 Finding #1 — classified negative / role inventory：部分关闭，本轮三个finding是未闭合的更窄分支

Round 3 Fixer已建立framed/unframed两条分类路径、published config assignment-key gate，以及private `REPORT_PREFIX` / ordered `LEGACY_PATTERNS` /已知producer-discovery slice断言；这些基础修复存在且current focused为`10/10`。但current framed helper在managed prefix前有描述文本时仍回退到unframed tokenizer，prefix前界不接受`=`，support basename仍被全局豁免；config vocabulary漏掉多组等价target roles；private script仍被generic scan整文件跳过，且discovery read-only gate只排除`writeFile`。因此Round 3 Finding #1不能宣告完整关闭，Round 4 Findings #1–#3是其独立、可复现的残余义务。

### Round 3 Finding #2 — lifecycle metadata zero intersection：已关闭

Install `plannedWrites`/issues与update/repair `changedPaths`/conflicts均已逐surface投影，并分别与完整protected report path集合求实际交集后精确断言`[]`（`test/prd-validation-report-path.test.ts:210-219,266-275,306-315,851-859`）。Round 4没有新证据推翻该闭环，不重开。

### Round 3 Finding #3 — same-basename all-entry inventory：已关闭

`findNamedEntries()`在递归前记录每个matching entry的project-relative location与no-follow `regular|symlink|directory|other`类型，且只递归真实directory（`test/prd-validation-report-path.test.ts:822-848`）；symlink、directory和FIFO反例均可观察（`:589-612`）。Round 4没有新证据推翻该闭环，不重开。

### Round 1–2其余修复项：维持关闭

Single invocation date、repair公开成功语义、Step 2–13 exact path binding、downstream physical owner chain、完整五类legacy lifecycle与completion command inventory仍有current evidence。本轮三个test-oracle缺口不推翻这些既有闭环。

### 历史 CR TODO（非阻塞）

无。Round 4未提出P2，本轮三个finding均直接影响AC5/AC6/AC7/AC9的交付证据，不得降级为TODO。

---

## 发现 #1 评估

### 审查原文

> **[中][P1 / PATCH-EVIDENCE] Managed basename classifier仍可因上下文边界与全局名称豁免而假绿**
> - 来源：blind + edge + acceptance
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

`extractManagedBasenameFromFramedValue()`先找到managed prefix并构造从prefix到frame末尾的candidate，但只有prefix位于frame开头或其前一字符为`/`时才保留完整candidate；其它情况会把整个frame重新送入unframed tokenizer（`test/prd-validation-report-path.test.ts:649-657`）。该tokenizer在空白、逗号、分号与pipe处终止（`:660-672`）。独立复现表明`prefix prd-validate-report-{yyyy-MM-dd}.md backup`最终只得到允许的`prd-validate-report-{yyyy-MM-dd}.md`，非法尾部被丢弃。这与Round 3 evaluation要求“framed value命中managed prefix后不得二次截断”直接矛盾。

`findNextManagedPrefix()`允许start、`/`及`/[\s([{:]/`所列前界，但不接受`=`（`:680-700`）。独立复现中`REPORT=prd-validation-report-old.md`与`url?report=prd-validation-report-old.md`均返回空candidate；因此assignment/query form可绕过active basename scan。

`isKnownNonReportSurfaceName()`仅按candidate basename全局跳过`prd-validation-report-operation.mjs`和`prd-validation-report-path.test.ts`（`:675-677`），没有绑定合法的source file和reference role。独立复现中`report filename = prd-validation-report-path.test.ts`同样返回空；同一support名称一旦被用作active report default，仍会被错误豁免。现有反例矩阵只覆盖managed prefix位于framed value起始位置的情况（`:497-524`），没有编码上述三条分支。

**严重性判断：合理**

AC6明确禁止非标准active basename；AC5/AC9要求同步面和focused evidence能稳定捕获回归。三条反例均可让违反该契约的active default保持focused green，且completion gate第39–40行已把完整delimiter/framed分类和独立fail-close宣告为PASS，故属于P1 evidence blocker，而不是可延后的风格改进。

**修复建议：可行**

唯一授权语义如下：

1. 对quoted/code-span等framed value，只要命中第一个managed prefix，就把从该prefix到frame末尾的完整值作为一个candidate；不得因prefix前有描述文本而回退unframed tokenizer。补入前置文本、非法尾部及同一frame多个managed名称的反例。
2. Unframed prefix前界必须接受assignment/query所需的`=`，同时以反例证明嵌入普通identifier中的managed substring仍不命中；不得扩大为任意substring scan。
3. 删除basename-global support-name skip。合法support名称只能通过精确`file + clause/reference role` allowlist剔除，且allowlist fragment必须在预期文件中实际存在；同名值位于active producer/default clause时必须进入classifier并失败。

只需修改`test/prd-validation-report-path.test.ts`。Current source语义满足契约，不授权修改任何producer、config或prose。

**误报评估：非误报**

三个反例均由current helper分支直接决定并已独立重放；current corpus尚未违规不等于回归oracle完整。

---

## 发现 #2 评估

### 审查原文

> **[中][P1 / PATCH-EVIDENCE] Published config key-role classifier未覆盖report target/output同义字段**
> - 来源：blind + edge + acceptance
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

`isReportTargetOverrideKey()`先将camelCase、dotted与分隔符形式归一化，再只识别`filename`、exact `path_override`、`filepath`，以及`report`与`path|filename|file|target|override`组合（`test/prd-validation-report-path.test.ts:703-720`）。独立复现中`validation_report`、`prd_report`、`report_name`、`report_output`、`report_destination`、`report_directory`与`prd_report_location`全部返回`false`；当value为`arbitrary.md`时，managed basename classifier也不会补捕。

Current forbidden matrix只覆盖`report`、`report_path`、`report_filename`、`validation_report_target`、`filename`、`path_override`、`filepath`及部分camelCase形式（`:424-435`），因而不能证明published `config.toml.example`没有以等价key重新开放report filename/path target。`output_folder`、`planning_artifacts`与`implementation_artifacts`的allow cases（`:436-437`）则为避免误拒普通root字段提供了明确边界。

**严重性判断：合理**

Story AC5/AC6要求published config不恢复第二套report default/target surface；AC9要求对应fixture fail-close。这些同义key可在value不含managed prefix时稳定绕过两层gate，故为P1 evidence blocker。

**修复建议：可行**

对normalized snake_case、camelCase及dotted assignment key建立显式、可审计的report-target deny vocabulary：至少拒绝bare `validation_report`/`prd_report`，以及`report`与`name|output|destination|directory|location|path|filename|file|target|override`组合；继续拒绝既有bare `filename`、`path_override`与`filepath`形式。同时保留并扩充普通artifact-root allow cases，至少证明`output_folder`、`planning_artifacts`、`implementation_artifacts`不被误拒。所有指定同义key必须进入adversarial table。

只需修改`test/prd-validation-report-path.test.ts`，不授权修改`config.toml.example`或runtime config语义。

**误报评估：非误报**

Current predicate对七个report-directed同义key的返回值均可确定复现为`false`；该缺口独立于basename value分类。

---

## 发现 #3 评估

### 审查原文

> **[中][P1 / PATCH-EVIDENCE] Private script全文件producer/discovery role inventory仍非fail-close**
> - 来源：blind + edge
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

Generic active-surface loop对private operation script执行整文件`continue`（`test/prd-validation-report-path.test.ts:483-490`）。替代assertions只检查当前已知`executePrdValidationReportOperation`、`discoverPrdValidationReports`与`inspectTarget...resolveRoots`三个固定slice，以及`REPORT_PREFIX`/`LEGACY_PATTERNS`的出现次数（`:440-476`）。在这些slice之外新增hard-coded legacy/suffixed basename和第二个write target，不会改变两个constant计数，且不会被generic scan观察；因此“只有一个canonical producer”尚未由whole-file evidence证明。

Discovery role只断言其固定slice不包含`writeFile(`（`:459-466`）。Private script当前从`node:fs/promises`导入多个只读API和唯一producer所需的`writeFile`（`prd-validation-report-operation.mjs:3`），discovery当前只执行read-only enumeration（`:55-83`）；但test没有拒绝`rename`、`rm`、`unlink`、`copyFile`、`appendFile`、`truncate`等替代mutation primitive，也没有证明discovery不会调用slice外的mutation helper。首个behavior fixture在调用discovery前验证legacy bytes/entries，调用后只断言返回数组（`test/prd-validation-report-path.test.ts:54-96`），因此缺少调用前后的不可变性证据。

**严重性判断：合理**

AC7要求legacy discovery保持原位且install/update/repair不迁移；AC5/AC6/AC9要求producer集合、active defaults与focused evidence可回归。第二producer或discovery mutation可在current固定slice oracle下假绿，直接阻塞证据交付，P1合理。

**修复建议：可行**

唯一授权语义必须同时完成以下三组test-only evidence，任一组不得替代其它组：

1. Whole-file producer inventory：精确剔除已验证的`REPORT_PREFIX`、ordered anchored `LEGACY_PATTERNS` declaration及合法support reference后，对private script其余全文执行managed basename分类；同时断言全文件只有一个filesystem write call，且该唯一`writeFile(..., { flag: "wx" })`位于已知execute producer section并只消费exact canonical target derivation。任何slice外hard-coded managed basename或第二write target必须失败。
2. Static discovery role gate：明确拒绝private script新增filesystem mutation binding/call，除唯一已授权producer `writeFile`外至少覆盖`appendFile`、`copyFile`/`cp`、`rename`、`rm`/`rmdir`、`unlink`、`truncate`、`mkdir`、`link`/`symlink`及write-mode `open`/write stream；discovery section不得调用execute/inspectTarget等producer路径。该gate不得只搜索一个`writeFile(` substring。
3. Behavioral immutability：在`discoverPrdValidationReports()`调用前后对完整PRD evidence tree做no-follow snapshot，比较path、entry type、regular-file bytes/hash及symlink target等可观察状态，并精确断言完全相等；返回的canonical/legacy arrays仍须保持既有断言。这样直接覆盖位于slice外的间接helper mutation。

若上述新增assertion在current source上产生RED，Fixer必须停止并返回Evaluator，不得自行修改private script或扩大授权。

**误报评估：非误报**

整文件skip、固定slice边界、单一mutation substring与缺少post-discovery snapshot均由current test直接可见；finding没有把它们误述为current production已发生mutation。

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | Managed basename classifier存在上下文边界与全局名称豁免 | [中] | **P1** | Framed完整值、`=`前界与support role-scoped exemption必须分别fail-close。 |
| 2 | Published config key-role vocabulary不完整 | [中] | **P1** | Report-directed同义target keys即使value不含managed basename也必须被拒绝。 |
| 3 | Private whole-file producer/discovery inventory不完整 | [中] | **P1** | 必须同时证明whole-file唯一producer、static mutation role与discovery前后状态不变。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

无。本轮不得把任何P1降级为TODO。

### 可忽略（误报）

无。正式summary中的3个finding全部确认有效；三层候选已经按root cause正确去重。

### Fixer 授权边界

Fresh Fixer只获准修改：

- `test/prd-validation-report-path.test.ts`
- 本evaluation文档，仅追加Fix Summary（修复摘要）。

不得修改private `prd-validation-report-operation.mjs`、`config.toml.example`、`customize.toml`、workflow steps、ZH/EN Skill、downstream prose、Story、tracker、completion gate、`SPEC 07`/`SPEC 09`、validation rules/scoring/report body、IR filename、public CLI/schema、dependencies、installer、packaging、Story 11.8+、external drawer/zip、workspace mirrors、fixed-count baselines、历史CR产物或其它canonical source。

Fixer必须先以新增adversarial assertions得到RED，再按本evaluation中每项唯一语义修正test-local helper/oracle并得到GREEN。修复后只运行`npx vitest run test/prd-validation-report-path.test.ts`与授权文件的whitespace/diff check；不得运行build、full suite或packaging。Exact related/affected counts、completion gate与canonical governance均由outer owner另行刷新。

### 评估决定

- **发现 #1（managed basename classifier）**：确认P1；framed完整值、assignment/query前界与support-name role exemption三组义务必须独立交付。
- **发现 #2（published config key-role）**：确认P1；采用显式report-target deny vocabulary，并保留普通artifact-root allow cases。
- **发现 #3（private whole-file roles）**：确认P1；whole-file唯一producer、static mutation gate和behavioral immutability snapshot必须同时成立。
- **Round 3 Findings #2/#3及Round 1–2已关闭项**：维持关闭，不授权重开或扩大修复范围。
- **Owner Gate**：`NONE`。三项均有唯一bounded focused-test修复语义，不涉及产品、Architecture或current source行为选择。
- **整体决定**：`FAIL`。完成三项test-only evidence修复、由outer owner刷新必要completion evidence，并通过fresh Reviewer/Evaluator双PASS前，不得进入CR04、CR05或CR06。

## 修复执行记录

### 修复执行记录
- **Date**: 2026-09-05
- **Model Used**: GPT-5.6 (gpt-5.6)
- **Fix Items**: 3

#### Fix #1 — Managed basename classifier上下文边界与support role豁免

- 对quoted/code-span framed value改为：命中第一个managed prefix后，将该prefix至frame末尾作为一个不可二次截断的candidate；新增前置文本、非法尾部及同frame第二managed名称反例。
- Unframed prefix前界新增精确`=`支持，覆盖assignment与query value；保留普通identifier内嵌substring不命中的负例。
- 删除basename-global support-name skip，改为绑定`relativePath + exact fragment + exact occurrence count`的support reference allowlist；active producer/default中的同名值继续进入classifier并失败。

#### Fix #2 — Published config report-target同义key

- 扩充显式deny vocabulary：拒绝bare `validation_report`、`prd_report`，以及`report`与`name|output|destination|directory|location|path|filename|file|target|override`组合。
- 新增snake_case、camelCase与dotted key反例；继续证明`output_folder`、`planning_artifacts`、`implementation_artifacts`不会被误拒。

#### Fix #3 — Private whole-file producer/discovery evidence

- 对private script精确剔除已验证的`REPORT_PREFIX`、ordered `LEGACY_PATTERNS`与stable issue role fragments后扫描其余全文，拒绝slice外hard-coded managed basename。
- 审计`node:fs/promises` named bindings与全文件mutation calls：只允许唯一`writeFile`，精确断言全文件调用次数为1，且既有execute section仍以`{ flag: "wx" }`消费canonical target；discovery section拒绝mutation primitive及execute/inspect producer路径调用。
- 在真实`discoverPrdValidationReports()`调用前后对完整PRD evidence tree执行no-follow snapshot，比较path、entry type、regular-file bytes/hash与symlink target，并保留canonical/legacy返回值断言。

#### RED / GREEN

- **RED**: `npx vitest run test/prd-validation-report-path.test.ts` → `1 failed / 9 passed`；首个失败为`validation_report`同义key返回`false`，证明旧oracle可假绿。
- **GREEN**: `npx vitest run test/prd-validation-report-path.test.ts` → `10 passed / 10 total`。
- 按本evaluation命令边界未运行build、full suite、packaging或其它测试集合。

#### 变更边界

- 修改：`test/prd-validation-report-path.test.ts`。
- 仅追加：本Round 4 evaluation文档的Fix Summary。
- 未修改source、canonical prose、Story、tracker、completion gate、其它CR文件、drawer/zip、workspace mirrors或fixed-count baselines。
