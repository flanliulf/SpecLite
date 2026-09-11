---
Story: 11-7
Round: 3
Date: 2026-09-05
Model Used: GPT-5.6 (gpt-5.6)
Review Source: 11-7-code-review-summary-20260905-round-3.md
Review Model: GPT-5.6 (gpt-5.6)
Type: Code Review Evaluation
---

## 评估总结

对 Story 11-7 的第 3 轮 CR 代码审查结果（复审）进行逐条独立评估。经对照 Story AC、Round 1/2 evaluation与fix record、current focused fixture、private producer/discovery script、published config reference、Step 13和workflow activation contract，汇总中的3个P1均可由current code直接证明为确定性的false-green，严重性与bounded修复方向合理；全部确认有效并阻塞交付。

本轮修复只需要增强`test/prd-validation-report-path.test.ts`。Current production/prose已经满足被测契约，不授权修改private script、config、workflow steps或其它source。Finding #1保留为一个去重finding，但generic framed-value classifier、published config key-role gate、private producer/discovery exact-role必须作为三组独立assertions分别交付，任一组通过不得掩盖其它组失败。本轮无P2、无Owner decision。

---

## 上轮问题回顾确认

### Round 2 Finding #1 — invocation-locked path token：已关闭

Current focused fixture动态枚举13个后续step，并精确断言`validationReportPath: '{validationReportPath}'`、无snake_case alias、无后续clock read或路径重算入口（`test/prd-validation-report-path.test.ts:463-480`）。Round 3没有反例推翻该闭环，不重开。

### Round 2 Finding #2 — downstream physical owner chain：已关闭

三个downstream consumer当前共享同一fail-closed physical owner contract，fixture覆盖正常链与Planning external、PRD external、project-internal cross-space、candidate external及candidate cross-space反例（`test/prd-validation-report-path.test.ts:483-519`）。Round 3明确驳回重开。

### Round 2 Finding #3 — complete-token negative scan：基础修复成立，本轮发现为更窄的framed-value边界

Canonical classifier本身已经使用完整锚定与真实calendar validation（`test/prd-validation-report-path.test.ts:523-529`），adversarial corpus也覆盖Unicode、suffix、`${date}`、无日期等既有variant（`:444-460`）。但framed value在被提取后仍进入通用substring tokenizer，且managed prefix缺`.md`时被丢弃；这是Round 3 Finding #1的新确定性边界，不否定上轮已建立的anchored allowlist。

### Round 2 Finding #4 — 五类legacy lifecycle corpus：family集合已关闭，metadata/location证据仍需补强

Lifecycle fixture已在install前创建五类legacy representative和一个canonical control，并跨install/update/repair执行snapshot（`test/prd-validation-report-path.test.ts:189-216,254-302`）。Round 3 Findings #2/#3针对zero-intersection断言和全项目entry-type inventory的可观测性，不重开family集合、command success、repair执行或owner内bytes/hash/type证据。

### Round 2 Finding #5 — role-classified active inventory：surface纳入已关闭，exact-role断言仍需补强

`customize.toml`、`config.toml.example`与private script均已纳入inventory（`test/prd-validation-report-path.test.ts:351-353,367-371`），current files本身也符合目标契约。Round 3 Finding #1仅确认published config key gate及private exact set/role assertions仍会漏检，不授权修改这些只读输入。

### 历史 CR TODO（非阻塞）

无。Round 3未提出P2，3项finding均为Story AC5/AC6/AC7/AC9的focused evidence阻塞。

---

## 发现 #1 评估

### 审查原文

> **[中][P1 / PATCH-EVIDENCE] Classified negative inventory仍会截断whole framed value，并漏过published/private role漂移**
> - 来源：blind + edge
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

`extractManagedBasenameTokens()`已先识别Markdown code span与quoted value，但随后把framed values和unframed lines一起交给`extractManagedBasenamesFromValue()`（`test/prd-validation-report-path.test.ts:532-545`）。后者只寻找首个`.md`，缺`.md`时直接`continue`（`:565-569`），并在space、comma、semicolon或pipe等边界停止（`:570-577`）。因此完整framed value如`prd-validate-report-{yyyy-MM-dd}.md backup`会被缩短为允许的canonical token，而`prd-validate-report-{yyyy-MM-dd}`会完全消失，确实绕过AC6分类。

Published config当前只断言managed token为空和一个窄的`report|filename|path + override`regex（`:405-408`），不能拒绝`report_path`、`filename`或等价report target/path key。Private script检查也只是若干substring、一个局部producer slice以及“declaration包含`LEGACY_PATTERNS`”；随后对整文件`continue`（`:410-437`）。这不能证明current script中`REPORT_PREFIX`、四个anchored `LEGACY_PATTERNS`（`prd-validation-report-operation.mjs:8-16`）的exact集合，也不能证明legacy集合只由discovery branch（`:55-77`）消费。

**严重性判断：合理**

这三类漏检均允许active default或private producer/discovery contract漂移时focused test继续通过，直接削弱AC5、AC6、AC9的回归门禁。Current corpus尚未漂移不等于证据充分，P1阻塞合理。

**修复建议：可行**

仅修改focused test，并保留三组独立assertions：

1. 对code span、quoted/TOML/CSV等已framed value，只要出现managed prefix，就把完整framed value作为一个candidate交给anchored classifier，禁止按space/comma/semicolon/pipe二次截断；managed prefix缺`.md`也必须产出非法candidate并失败。Unframed prose可保留明确的bounded token规则。
2. 对published `config.toml.example`解析assignment key并拒绝任何report filename/path target/override key；不得误拒绝现有`output_folder`、`planning_artifacts`等普通artifact-root字段，也不得依赖value包含managed basename才触发。
3. 对private script精确断言`REPORT_PREFIX`、`LEGACY_PATTERNS`的ordered anchored集合以及producer/discovery role：producer只使用canonical prefix/date/`.md`与exclusive `wx`，legacy patterns只用于read-only discovery。不得再以整文件`continue`替代exact role assertion。

Current production/config内容满足上述契约；若新增assertion对current input产生RED，Fixer必须先证明是test helper/assertion错误还是新的source事实，再返回Evaluator重新限定，不得自行扩大source范围。

**误报评估：非误报**

三组反例均由current assertion结构直接成立，且合并后仍保留独立交付义务；不是重复计数，也不是对production已发生漂移的错误陈述。

---

## 发现 #2 评估

### 审查原文

> **[中][P1 / PATCH-EVIDENCE] Lifecycle exclusion断言只在全部report paths同时出现时失败**
> - 来源：edge
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

Install对`plannedWrites`与issues使用`not.toEqual(expect.arrayContaining(reportRelativePaths))`（`test/prd-validation-report-path.test.ts:210-215`）；update与repair对`changedPaths`及conflicts使用同构表达式（`:262-265,296-300`）。`arrayContaining(reportRelativePaths)`只在actual包含全部expected元素时匹配；actual若仅包含一个受保护report path，内层匹配为false，外层negation反而通过。Current assertion因此不能证明actual与report集合的实际交集为空。

**严重性判断：合理**

Snapshot可以证明文件最终bytes/hash/tree未变，却不能证明command metadata没有规划、报告change或产生conflict。AC7/AC9要求install/update/repair未定位受保护reports，逐项zero-intersection是独立交付证据，P1合理。

**修复建议：可行**

对install `plannedWrites[].path`、issues `affectedPath`、update/repair `changedPaths`以及conflicts `affectedPath`分别与`reportRelativePaths`求实际交集，并逐项精确断言`[]`。可等价逐path断言`not.toContain`，但不得继续用一个negated `arrayContaining(all)`表达zero intersection。只改focused test。

**误报评估：非误报**

该问题由matcher语义直接决定；单一路径污染即可稳定假绿。

---

## 发现 #3 评估

### 审查原文

> **[中][P1 / PATCH-EVIDENCE] 全项目same-basename inventory忽略matching symlink与non-file entry**
> - 来源：edge
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

Owner内预期报告确实先以no-follow `lstat`证明为regular且非symlink（`test/prd-validation-report-path.test.ts:629-644`），但全项目location evidence只保存`string[]`（`:623-627`）。`findNamedFiles()`先把directory当递归容器，仅当`entry.isFile() && names.has(entry.name)`时记录（`:659-671`）；同basename symlink、directory、FIFO/socket等other entry均不会进入inventory。因而owner外新增同basename non-file entry时，owner snapshot仍可不变，而全项目location断言继续通过。

**严重性判断：合理**

AC7/AC9要求证明没有copy/move和额外location/type；只观察regular file不足以覆盖同basename entry集合，属于确定性的evidence gap，P1合理。

**修复建议：可行**

将全项目inventory改为在决定递归前先记录任何basename匹配entry，包含project-relative location与no-follow type（至少`regular`、`symlink`、`directory`、`other`，其中FIFO/socket归`other`亦可）；只递归真实directory，绝不follow symlink。Expected集合必须精确为原PRD owner路径上的regular files，任何额外location或不同type均失败。保留现有owner内readability、bytes、hash与tree断言，并添加至少symlink、directory和other/FIFO型反例来证明helper可观察所有entry type。只改focused test。

**误报评估：非误报**

Current `Dirent.isFile()`过滤条件明确排除这些entry；现有string-only snapshot不能表达type，审查结论成立。

---

## 驳回候选确认

### Step 13必须在File references frontmatter声明`validationInvocationDate`：❌ 误报 — 建议忽略

Step 13 frontmatter明确标注为“File references”，并已把唯一report file绑定为`validationReportPath: '{validationReportPath}'`（`step-v-13-report-complete.md:1-5`）。Workflow activation在整个invocation内一次生成并保存`{validationInvocationDate}`，每个step消费该state且不得重读clock（`workflow-details.md:18-24`）；Step 13正文只用该state更新metadata，并明确从锁定的`{validationReportPath}`加载（`step-v-13-report-complete.md:59-63,79-92`）。同一step还消费其它未重复列入File references的global config/state变量。没有证据表明loader要求把所有runtime state复制到该文件引用表，机械新增date frontmatter不是必要修复。

### 其它已关闭候选：维持驳回

Round 3没有新证据重开owner chain、Step 2–13 path token、五类legacy family、single-date、repair success或completion-gate command inventory。Findings #1–#3只修补focused evidence的false-green，不改变这些已关闭事实。

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | Classified negative/role inventory仍可false-green | [中] | **P1** | 合并为一个finding，但必须分别完成generic framed classifier、published config key gate、private exact set/role三组独立assertions。 |
| 2 | Lifecycle metadata exclusion不是zero intersection | [中] | **P1** | 对四类metadata投影后与reports求实际交集并逐项断言为空。 |
| 3 | Same-basename inventory忽略non-file entry | [中] | **P1** | 记录完整location+no-follow type集合，任何额外位置或类型均失败。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

无新增P2。本轮不得将任何P1降级为TODO。

### 可忽略（误报）

| # | 发现 | 原始严重性 | 忽略理由 |
|---|------|----------|---------|
| R3-R1 | Step 13 date frontmatter缺失 | 候选 | 该frontmatter只声明File references；date是whole-invocation state，report path已唯一绑定，Step 13不重读clock或重算target。 |
| R3-R2 | 重开其它Round 1/2已关闭项 | 候选 | Current direct evidence仍成立，本轮三个test-evidence缺口不推翻既有闭环。 |

### Fixer 授权边界

Fresh Fixer只获准修改：

- `test/prd-validation-report-path.test.ts`
- 本evaluation文档，仅追加Fix Summary（修复摘要）。

不得修改private `prd-validation-report-operation.mjs`、`config.toml.example`、`customize.toml`、workflow steps、ZH/EN Skill、downstream prose、Story、tracker、completion gate、`SPEC 07`、validation rules/scoring/report body、IR filename、public CLI/schema、dependencies、installer、packaging、Story 11.8+、external drawer/zip、workspace mirrors、fixed-count baselines、历史CR产物或其它canonical source。

Fixer必须把Finding #1实现为三组独立assertions，不得用单一整文件scan或`continue`掩盖role差异；Finding #2逐metadata surface证明zero intersection；Finding #3以location+no-follow type精确集合及non-file反例证明完整可观测性。修复后只运行focused test与授权文件`git diff --check`；不得运行build/full/packaging。Focused/affected/gate counts及canonical governance由outer Flow Gate owner刷新。

### 评估决定

- **发现 #1（classified negative/role inventory）**：确认P1；保留一个去重finding，但三组independent assertions全部是Fixer交付义务。
- **发现 #2（lifecycle metadata zero intersection）**：确认P1；所有report metadata投影必须与protected paths实际交集为空。
- **发现 #3（same-basename location/type inventory）**：确认P1；先记录所有matching entry type，再验证唯一允许集合。
- **Step 13 date binding候选**：驳回；不授权修改frontmatter或workflow state contract。
- **Owner Gate**：`NONE`。三项均为唯一bounded focused-test修复，不需要产品、architecture或source语义选择。
- **整体决定**：`FAIL`。完成三项focused evidence修复、由outer owner刷新必要gate evidence，并通过fresh Reviewer/Evaluator双重确认前，不得进入CR04、CR05或CR06。

## 修复执行记录

### 修复执行记录
- **Date**: 2026-09-05
- **Model Used**: GPT-5.6 (gpt-5.6)
- **Fix Items**: 3

#### 修复结果

1. **Finding #1 — classified negative/role inventory：已修复**
   - 将test-local managed basename扫描拆为framed与unframed两条路径：直接code span、quoted/TOML/path value一旦命中managed prefix，就保留从basename prefix开始的完整framed value，缺`.md`也进入anchored classifier；仅unframed prose按明确syntax delimiter切分。新增space、comma、semicolon、pipe、Unicode parentheses、缺`.md`反例，并保留`${date}`、`.md.bak`、`.md-1`等既有反例。
   - Published config现在解析真实TOML assignment key，独立拒绝snake_case、camelCase及dotted形式的report/filename/path/target/override key，同时证明`output_folder`、`planning_artifacts`、`implementation_artifacts`不被误拒。
   - Private script改为三组精确role断言：`REPORT_PREFIX`必须等于`prd-validate-report-`，`LEGACY_PATTERNS`必须是ordered四项anchored集合且只在read-only discovery branch消费；producer target只由prefix、`input.invocationDate`与`.md`构造，并以唯一`writeFile(..., { flag: "wx" })`执行exclusive create。未再用private整文件`continue`代替role验证。

2. **Finding #2 — lifecycle metadata zero intersection：已修复**
   - 分别投影install `plannedWrites[].path`、install issues `affectedPath`、update/repair `changedPaths`及update/repair conflicts `affectedPath`，逐surface与完整protected report path集合求实际交集。
   - 六个独立交集均精确断言为`[]`，移除了会漏过单一路径污染的negated `arrayContaining(all)`写法；既有bytes/hash/type/tree invariants保持不变。

3. **Finding #3 — same-basename location/type inventory：已修复**
   - 全项目inventory在递归决策前对每个matching basename执行no-follow `lstat`，记录project-relative `location`与`regular`、`symlink`、`directory`、`other`类型；只递归真实directory，从不follow symlink。
   - Expected inventory精确限定为PRD owner内的regular non-symlink集合，任何额外location或不同type都会失败。新增独立fixture，证明owner外same-basename symlink、directory与FIFO（归类`other`）均被完整观察。

#### RED / GREEN 与范围审计

- RED：加入framed完整值反例后，`npx vitest run test/prd-validation-report-path.test.ts`为`1 file / 1 failed / 8 passed`；`prd-validate-report-{yyyy-MM-dd}.md backup`被旧helper错误缩短为canonical token，稳定复现Round 3 Finding #1的false-green。
- GREEN：最终`npx vitest run test/prd-validation-report-path.test.ts`为`1 file / 10 passed / 0 failed`。
- Whitespace/diff：`git diff --no-index --check /dev/null test/prd-validation-report-path.test.ts`无whitespace diagnostic；exit 1仅表示该untracked文件相对`/dev/null`存在内容差异。
- 修改范围仅为`test/prd-validation-report-path.test.ts`与本evaluation文末append。未修改private script、config/customize、workflow steps、ZH/EN Skill、downstream prose、Story、tracker、completion gate、`SPEC 07`、rules/scoring/report body、IR filename、public CLI/schema、dependencies、installer、packaging、Story 11.8+、external drawer/zip、workspace mirrors、fixed-count baselines、历史CR产物或其它canonical source。
- 未运行build、full或packaging；focused/affected/gate counts与canonical governance留给outer Flow Gate owner刷新。
- **Owner Gate**：`NONE`。三项P1均在Evaluator授权的focused-test边界内完成，可进入fresh Reviewer复审。
