---
Story: 11-7
Round: 5
Date: 2026-09-05
Model Used: GPT-5.6 (gpt-5.6)
Review Source: 11-7-code-review-summary-20260905-round-5.md
Review Model: GPT-5.6 (gpt-5.6)
Type: Code Review Evaluation
---

## 评估总结

对 Story 11-7 的第 5 轮 CR 代码审查结果（复审）进行逐条独立评估。经完整核对三层正式产物、Story AC1–AC10、Epic/PRD/SPEC owning contract、Round 1–4 summary/evaluation/fix history、current focused test helper、private producer/discovery source与completion evidence，正式summary中的3个P1均有直接对应active corpus/role invariant的稳定mutant，并可由current helper确定性复现；全部确认有效并阻塞交付。

本轮应用“避免无限meta-test扩张”的收敛标准：只有同时满足以下条件的candidate才保留为P1：其一，直接保护Story 11.7已经声明的active surface或role invariant；其二，存在不依赖猜测的稳定mutant；其三，可在单一focused test文件内形成有限、可审计且不改变runtime语义的修复。三项finding均满足该标准，但其授权边界被进一步限定：不要求枚举任意自然语言同义词、不要求实现完整TOML或JavaScript通用分析器、不授权修改current canonical source。

Current focused verification为`npx vitest run test/prd-validation-report-path.test.ts` → `1 file / 10 tests passed / 0 failed`。该结果证明current behavior和已编码矩阵成立，但不能反驳未进入矩阵且已独立复现的false-green。本轮无P2、无Owner decision。

---

## 上轮问题回顾确认

### Round 4 Finding #1 — managed basename classifier：部分关闭，本轮仅保留两个稳定残余分支

Round 4 Fixer已关闭framed value二次截断、`=`前界与basename-global support-name skip：current helper会保留framed完整尾部，接受assignment/query中的`=`，并将support exemption限定到`relativePath + fragment + occurrence count`。但`removeExactRoleFragments()`仍只按裸fragment计数并执行`replaceAll()`，没有验证surrounding clause/reference role（`test/prd-validation-report-path.test.ts:528-556,835-846`）；同时unframed tokenizer把comma、semicolon、pipe当作结束边界，prefix finder却不把它们当作开始边界（`:738-773`）。因此Round 4关于“file + clause/reference role”和完整token boundary的义务尚未全部关闭。

### Round 4 Finding #2 — published config key-role：部分关闭，本轮仅保留合法TOML path表达残余

Round 4 Fixer已补齐bare `validation_report`/`prd_report`及report与`name|output|destination|directory|location|path|filename|file|target|override`的snake/camel/simple-dotted vocabulary（`test/prd-validation-report-path.test.ts:432-455,781-797`）。但assignment scanner没有table state，也不解析quoted或dot周围带空白的dotted components（`:776-779`），所以predicate收到的不是完整semantic key path。本轮不重开已覆盖词汇，只处理合法TOML表示法和与既有`directory`同构的`dir`/`folder`两个明确target role。

### Round 4 Finding #3 — private whole-file producer/discovery role：部分关闭，本轮仅保留binding与可达边残余

Round 4 Fixer已建立private whole-file managed-basename scan、current唯一`writeFile(..., { flag: "wx" })`断言、direct discovery deny与真实tree before/after snapshot（`test/prd-validation-report-path.test.ts:458-521`）。但filesystem binding extractor只读取首条exact named import并丢弃local alias（`:819-826`），call scanner只查original primitive字面名（`:829-833`）；direct discovery section检查也不追踪其调用的local helper。因此current source事实维持通过，但第二条aliased writer和discovery可达mutation helper仍是稳定false-green。

### Round 1–3其余修复项：维持关闭

Single invocation date、same-day read-only block、repair成功语义、Step 2–13 locked path、downstream physical owner chain、五类legacy lifecycle、逐metadata surface zero intersection、same-basename all-entry no-follow inventory及completion command可重放性均无新反证，不授权重开。External `speclite-drawer-er-modeler/`、zip、workspace IDE mirrors与fixed-count drift继续排除在Story 11.7之外。

### 历史 CR TODO（非阻塞）

无。Round 5未提出P2；三个有效finding都直接阻断AC5/AC6/AC7/AC9 evidence，不降级为TODO。

---

## 发现 #1 评估

### 审查原文

> **[中][P1 / PATCH-EVIDENCE] Active basename inventory仍缺clause-role约束且unframed边界不对称**
> - 来源：blind + edge；Aggregator独立复现
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

`supportReferenceAllowlist`只记录`fragment + occurrences`（`test/prd-validation-report-path.test.ts:528-545`）；调用方随后无条件把匹配fragment从active content中移除（`:546-563`），而`removeExactRoleFragments()`仅验证出现次数后执行`replaceAll()`（`:835-846`）。因此真实allowlisted文件中即使把同一个support basename从script-reference clause换位为report target/default clause，只要fragment count不变，豁免仍会发生。现有`report filename = "prd-validation-report-path.test.ts"`仅直接验证extractor（`:605-607`），没有经过真实file allowlist removal，不能证明clause role。

Unframed helper的起止边界也确实不对称：结束集合含comma、semicolon与pipe（`:744-748`），开始集合只有start、`/`、whitespace、括号、`:`与`=`（`:753-773`）。独立重放current helper后，`items=ok,prd-validation-report-old.md`、`old;prd-validation-report-old.md`、`old|prd-validation-report-old.md`、`url?prd-validation-report-old.md`与`x=1&prd-validation-report-old.md`均返回`[]`。其中comma/semicolon/pipe由current tokenizer自身已声明为syntax delimiter，已足以稳定证明false-green；`?`/`&`作为同一有限boundary contract的query separators保留，不扩展为任意标点扫描。

**严重性判断：合理**

Story AC5要求同步active surfaces，AC6要求排除legacy/非法active defaults，AC9要求fixture可回归（Story行17–21）。上述两个根因都允许active surface恢复受管禁止basename而focused oracle保持绿色，且completion gate已将role-scoped exemption和完整delimiter分类声明为PASS，故为P1 evidence blocker。

**修复建议：可行**

唯一bounded修复义务如下，两组必须分别RED/GREEN，不能相互替代：

1. 把每个support exemption登记为`relativePath + exact complete clause/anchor + exact occurrence count`，只允许移除完整reference clause；不得继续以裸basename/script fragment作为role证据。用一个真实allowlisted文件构造role-swap mutant：fragment与count保持不变但clause变成report target/default，integrated scan必须失败；current合法完整clause仍通过。
2. 定义一个test-local共享unframed boundary集合，并同时用于candidate start与end；该有限集合必须覆盖current terminators以及本轮明确反例中的comma、semicolon、pipe、`?`、`&`，同时保留普通identifier substring不命中。不得扩大为任意substring或任意Unicode标点扫描。

仅修改`test/prd-validation-report-path.test.ts`。不授权修改canonical prose/source以迁就测试。

**误报评估：非误报**

两个反例均由current helper的明确数据结构/分支产生，且直接绑定active negative inventory，不是抽象的未来测试愿望。

---

## 发现 #2 评估

### 审查原文

> **[中][P1 / PATCH-EVIDENCE] Published TOML gate没有构造完整semantic key path**
> - 来源：blind + edge；Aggregator独立复现
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

Current `extractTomlAssignmentKeys()`只匹配assignment左侧的单个quoted key或无空白bare token，不维护table header（`test/prd-validation-report-path.test.ts:776-779`）。独立重放得到：`[report]\npath = "arbitrary.md"`仅提取`["path"]`，`[validation.report]\noutput = "arbitrary.md"`仅提取`["output"]`，两者均没有被predicate拒绝；`"workflow"."report_name" = "arbitrary.md"`和`workflow . report_name = "arbitrary.md"`甚至不产生key。`report_dir`与`report_folder`虽可提取，也因vocabulary不含`dir`/`folder`而未被拒绝。Value刻意不含managed basename，所以basename scanner不能补捕。

这些candidate直接作用于active published `validate-prd/config.toml.example`（测试在`:427-431`读取并宣告无report target key），并非要求猜测任意未来词汇。`[report].path`、`[validation.report].output`、quoted/spaced dotted keys是TOML现有语法表达；`dir`/`folder`则严格限定为与已授权`directory`同构、且必须与`report`共同出现的target role。

**严重性判断：合理**

若published config恢复第二套report target，exact canonical path契约与AC5/AC6同步面同时失守，而current gate会false-green；P1合理。Current `config.toml.example`没有违规不构成对mutation gate完整性的反证。

**修复建议：可行**

唯一bounded修复为：在focused test中使用项目已存在的`toml`依赖解析TOML，递归扁平化得到完整semantic key paths，再应用现有deny predicate；不得自建通用TOML parser或新增依赖。新增且只新增本轮稳定语法矩阵：table-scoped `report.path`、`validation.report.output`、quoted dotted、spaced dotted，以及`report_dir`/`report_folder`。Vocabulary只补`dir`与`folder`，且仍要求report context；继续证明`output_folder`、`planning_artifacts`、`implementation_artifacts`等非report-root字段合法。

若现有`toml` parser对单条合法mutant的解析事实与上述预期不一致，Fixer必须停止并返回Evaluator，不能自行扩展手写语法或修改published config。

仅修改`test/prd-validation-report-path.test.ts`。

**误报评估：非误报**

六个最小反例均已用current regex/predicate确定性复现，且完整key path是判断report role不可缺少的现有语义，不属于无限同义词枚举。

---

## 发现 #3 评估

### 审查原文

> **[中][P1 / PATCH-EVIDENCE] Private filesystem role inventory未解析全部binding且discovery审计非递归**
> - 来源：blind + edge；Aggregator独立复现并收窄泛化边界
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确，但授权范围需保持收窄**

`extractFsPromiseBindings()`以非global `exec()`只读取第一条精确单行`node:fs/promises` named import，并把`writeFile as emitReport`映射成original name而不保留local binding（`test/prd-validation-report-path.test.ts:819-826`）；`findFunctionCalls()`随后只搜索传入original primitive的字面调用（`:829-833`）。在保留current source的基础上追加第二条`import { writeFile as emitReport } ...`及parameterized `emitAdditionalReport(target, content) { await emitReport(target, content); }`，current mutation binding/call与literal `writeFile(`断言均仍只看到既有authorized producer，而`emitReport(`确实存在。这是稳定、无需managed literal的第二writer mutant。

Discovery gate只在固定`discoverySection`内拒绝mutation primitive和三个known producer的direct call（`:477-509`）。若section调用一个定义在外部的local helper，而该helper最终调用aliased mutation binding或known producer，direct deny看不到该edge；条件未被current fixture触发时，behavioral snapshot也保持不变。这里确认的不是“任意alias/任意helper都有问题”，而仅是“discovery可达且最终抵达filesystem mutation或producer”的有限路径。Current source本身仍只有一个direct exclusive writer，current discovery path仍只读（private script行3、23–42、55–83）。

**严重性判断：合理**

Story AC7明确要求legacy evidence不被迁移、覆盖或删除，AC9要求对应fixture；第二writer或discovery-reachable mutation可让该role invariant失守而focused仍绿，因此P1合理。Finding不误报current runtime已发生mutation。

**修复建议：可行**

唯一bounded修复必须同时完成以下两组静态mutant义务，并保留现有behavioral snapshot：

1. 枚举private script内全部`node:fs/promises`与`node:fs`静态named imports，保留`original API → local binding`映射，按local binding审计全文件调用和唯一authorized位置；只允许current named-import形态。对namespace/default/dynamic fs import采取显式fail-close拒绝，不实现通用module analysis。第二条`writeFile as emitReport` + parameterized writer mutant必须RED。
2. 从`discoverPrdValidationReports`出发，对private script中的local function declaration建立有限direct-call edge inventory并计算可达闭包；只需判定可达闭包是否抵达已解析的filesystem mutation local binding或三个known producer，不分析任意JavaScript表达式、method dispatch或外部模块。条件化indirect producer/mutation helper mutant必须RED；纯只读current helper chain必须GREEN。

保留现有discovery前后no-follow tree snapshot作为runtime补充证据，但不得用单一fixture替代上述静态可达边。若新gate对current source产生RED，Fixer必须停止并返回fresh Evaluator；不授权修改private script。

仅修改`test/prd-validation-report-path.test.ts`。

**误报评估：非误报**

第二named import alias和local helper reachability都由current scanner的明确缺口决定；授权已排除任意alias、任意helper或完整JavaScript静态分析的过宽表述。

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | Active basename inventory缺clause role且unframed boundary不对称 | [中] | **P1** | 真实file role-swap与有限boundary mutants均可使AC6 gate false-green。 |
| 2 | Published TOML gate未构造完整semantic key path | [中] | **P1** | 合法table/dotted forms和明确`dir`/`folder` report roles可绕过AC5/AC6 evidence。 |
| 3 | Private filesystem binding与discovery可达mutation inventory不完整 | [中] | **P1** | 第二aliased writer及indirect reachable mutation可绕过AC7 evidence。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

无。本轮不把三个直接AC evidence blocker降级为TODO。

### 可忽略（误报）

无。正式summary中的3个finding全部确认有效；其中过宽泛化已在各项修复授权中明确排除。

### Fixer 授权边界

Fresh Fixer只获准修改：

- `test/prd-validation-report-path.test.ts`
- 本evaluation文档，仅追加Fix Summary（修复摘要）。

不得修改private `prd-validation-report-operation.mjs`、任何canonical source/prose、`config.toml.example`、`customize.toml`、ZH/EN Skill、workflow steps、downstream docs、Story、tracker、completion gate、SPEC、validation rules/scoring/report body、IR filename、public CLI/schema、dependencies、installer、packaging、Story 11.8+、external drawer/zip、workspace mirrors、fixed-count baselines、summary/layer文件、历史CR产物或其它文件。

Fixer必须为每项先加入本evaluation指定的稳定mutant/assertion并取得可归因RED，再修改test-local helper取得GREEN。若任一RED来自current source事实而非mutant/helper缺口，必须停止并返回fresh Evaluator，不得扩大文件白名单。修复后只运行：

- `npx vitest run test/prd-validation-report-path.test.ts`
- `git diff --check -- test/prd-validation-report-path.test.ts _bmad-output/implementation-artifacts/code-reviews/11-7-code-review/11-7-code-review-evaluation-20260905-round-5.md`

不得运行build、full suite、packaging、canonical governance或其它测试集合。Exact related/affected counts与completion gate由outer owner在Fixer完成后另行刷新。

### 评估决定

- **发现 #1（basename role/boundary）**：确认P1；完整clause anchor与有限共享boundary两组义务必须独立交付。
- **发现 #2（TOML semantic key path）**：确认P1；使用项目现有`toml` parser取得完整path，只补本轮明确syntax/role矩阵，不建立通用parser或无限vocabulary。
- **发现 #3（filesystem binding/reachability）**：确认P1；限定为fs local binding与discovery local-function可达闭包，不扩展为通用JavaScript分析。
- **Round 1–3已关闭项及Round 4已完成基础义务**：维持关闭，不授权重开。
- **Owner Gate**：`NONE`。三项均已有唯一bounded test-only修复，不涉及产品、Architecture或current runtime语义选择。
- **整体决定**：`FAIL`。完成三项授权修复、outer owner刷新必要completion evidence，并取得fresh Reviewer/Evaluator双PASS之前，不得进入CR04、CR05或CR06。

## 修复执行记录

### 修复执行记录

- **Date**: 2026-09-05
- **Model Used**: GPT-5.6 (gpt-5.6)
- **Fix Items**: 3

### Finding #1 — clause-role allowlist 与对称 unframed boundary

- **RED**：在真实 `validate-prd/SKILL.md` surface 中保持 support basename 与 occurrence count 不变、仅把原 reference clause 换为 `report filename` role；旧 `fragment + occurrences` removal 仍移除 basename，focused 以 `expected [... ] to include 'prd-validation-report-operation.mjs'` 失败。另加入 comma、semicolon、pipe、`?`、`&` 前界矩阵，作为同一有限 boundary contract 的独立断言。
- **Fix**：support exemption 改为 `relativePath + exact complete clause + occurrence count`，role-swap 因原 clause 缺失而 fail-close；定义 test-local `isUnframedBoundary()`，candidate start/end 共用同一有限集合，并保留普通 identifier substring 不命中与 canonical placeholder token 完整性。
- **GREEN**：`npx vitest run test/prd-validation-report-path.test.ts` → `1 file / 10 tests passed / 0 failed`。

### Finding #2 — TOML semantic key path

- **RED**：加入 table-scoped、quoted dotted、spaced dotted、`report_dir` 与 `report_folder` 矩阵；旧 gate 首先在 `report_dir: expected false to be true` 稳定失败。
- **Fix**：直接使用项目既有 `toml` dependency 的 `parse()`，递归扁平化已解析对象的 leaf paths，再应用现有 deny predicate；target role 仅补 `dir`、`folder`，未新增 dependency、未构建手写 TOML parser，并继续保留非 report-root allowed keys。
- **GREEN**：`npx vitest run test/prd-validation-report-path.test.ts` → `1 file / 10 tests passed / 0 failed`。

### Finding #3 — fs binding 与 discovery 可达 mutation

- **RED（binding）**：第二条 `writeFile as emitReport` named import + parameterized writer mutant 使旧 extractor 返回空的 structured binding inventory，而期望包含 current 与 aliased binding；focused 稳定失败。
- **Fix（binding）**：枚举全部 `node:fs` / `node:fs/promises` static named imports，保留 `original → local`；按 local binding 审计调用和 single authorized writer。namespace/default/dynamic fs import 显式 fail-close，不扩展到通用 module analysis。
- **RED（reachability）**：discovery 条件调用外部 local helper、helper 再调用 known producer 的 mutant，在旧 direct-section gate 下返回 `[]`，而期望识别 `executePrdValidationReportOperation`，focused 稳定失败。
- **Fix（reachability）**：从 `discoverPrdValidationReports` 出发，仅对本文件 local function declaration 建立 direct-call edges 与可达闭包；current chain保持空 mutation，mutant 被识别为 `executePrdValidationReportOperation → inspectTarget → writeFile`。保留既有 no-follow behavioral snapshot，不分析 method dispatch、任意表达式或外部模块。
- **GREEN**：`npx vitest run test/prd-validation-report-path.test.ts` → `1 file / 10 tests passed / 0 failed`。

### Scope Audit（范围审计）

- 代码变更仅位于 `test/prd-validation-report-path.test.ts`；本文件仅追加本 Fix Summary。
- 未修改 private producer、canonical source/prose、published config、Story、tracker、completion gate、SPEC、其它 CR 产物、dependency、installer、packaging、external drawer/zip、workspace mirrors 或 fixed-count baselines。
- 未运行 build、full suite、packaging、canonical governance 或其它测试集合；exact related/affected counts 与 completion gate 留给 outer owner 刷新。
