---
Story: 11-7
Round: 5
Date: 2026-09-05
Model Used: GPT-5.6 (gpt-5.6)
Type: Code Review Summary
---

## Review Conclusion（审查结论）

Blind Hunter、Edge Case Hunter、Acceptance Auditor 三层正式产物均成功返回（`3/3`，无失败或降级）。Blind 为 **FAIL / 3 P1**，Edge 为 **FAIL / 3 P1**，Acceptance 为 **PASS / 0 finding**。Aggregator 完整核对 current Story 11.7、Round 1–4 summary/evaluation/fix records、current focused test helper、private producer/discovery source与completion evidence，并对争议分支做了只读最小复现。

Acceptance PASS 不能覆盖 Blind/Edge 已给出且可由current helper直接复现的反例。去重后确认 **3 个 P1 blocking findings、0 个 P2**：

1. Support allowlist 的 clause role缺失与unframed delimiter前后界不对称，都属于active managed-basename inventory的确定性false-green，沿用前轮classifier finding边界合并为Finding #1，但分别保留独立根因与修复义务。
2. TOML table scope、quoted/spaced dotted key与`dir`/`folder`等明确report target role均未进入完整semantic key path，合并为Finding #2。
3. Private filesystem gate只解析首条exact named import且discovery call检查不递归，第二条aliased writer与条件化indirect helper均有可复现绕过，合并为Finding #3。

三项都不证明current canonical source已经产生非法report target或mutation；它们证明违反AC5/AC6/AC7/AC9的后续改动仍可保持focused oracle绿色。总体结论为 **FAIL**。最新Reviewer/Evaluator双PASS之前，不得进入CR04、CR05或CR06。

## Layer Results（三层结果）

| Layer | Execution | Formal result | Aggregated result |
| --- | --- | --- | --- |
| Blind Hunter | PASS | `FAIL` / 3 P1 | Support role并入Finding #1；TOML完整key path并入Finding #2；第二条aliased FS producer并入Finding #3。 |
| Edge Case Hunter | PASS | `FAIL` / 3 P1 | Unframed delimiter并入Finding #1；TOML table/quoted dotted forms并入Finding #2；aliased/indirect mutation path并入Finding #3。 |
| Acceptance Auditor | PASS | `PASS` / 0 | Current behavior与已覆盖矩阵成立，但未反驳三类mutant；其PASS不覆盖有效反例。 |

## Findings（发现）

### 1. [中][P1 / PATCH-EVIDENCE] Active basename inventory仍缺clause-role约束且unframed边界不对称

- **Source**：blind + edge；Aggregator独立复现
- **Location**：`test/prd-validation-report-path.test.ts:528-563,598-607,738-773,835-846`
- **Affected contract**：Story 11.7 AC5、AC6、AC9；Round 4 Finding #1 / Evaluator的role-scoped exemption义务

#### Root Cause（根因）

1. `supportReferenceAllowlist`只保存`relativePath + fragment + occurrences`。`removeExactRoleFragments()`只验证裸fragment次数后执行`replaceAll()`，没有保存或验证surrounding clause、字段名或reference role。Round 4 Evaluator原始义务要求精确`file + clause/reference role`；Fix Summary中的`file + fragment + exact occurrence count`没有交付其中的clause role。
2. `extractManagedBasenamesFromValue()`把comma、semicolon与pipe视为candidate终止符，但`findNextManagedPrefix()`的candidate前界只接受start、`/`、whitespace、`(`、`[`、`{`、`:`、`=`。同一syntax delimiter作为前界时不被识别，且query常用的`?`、`&`也不在前界集合。

#### Reproducible Evidence（可复现证据）

- 在真实allowlisted `validate-prd/SKILL.md` 中，仅将现有唯一support fragment从private-script reference clause换位为`report filename = `scripts/prd-validation-report-operation.mjs``，同时保留该行既有canonical path和fragment occurrence count为`1`。Current removal会先删掉整个backtick fragment，余下canonical path仍合法，integrated scan看不到support basename已进入report target role。
- Current helper对下列unframed active值均返回`[]`：`items=ok,prd-validation-report-old.md`、`old;prd-validation-report-old.md`、`old|prd-validation-report-old.md`、`url?prd-validation-report-old.md`、`x=1&prd-validation-report-old.md`。其中comma/semicolon/pipe尤其直接证明起止delimiter集合内部不对称；无需依赖URL语义争议。
- 现有`report filename = "prd-validation-report-path.test.ts"`只直接测试extractor会命中该名称，没有把“真实allowlisted文件内相同fragment换位但count不变”的mutant送入allowlist removal + integrated corpus scan，因此不能关闭clause-role缺口。

#### Impact（影响）

Active Skill/docs/help surface可把allowlisted support basename语义换位为report default，或在常见delimiter后重新引入legacy/非法basename，而AC6 negative inventory仍保持绿色。Completion evidence关于“support role-scoped exemption”和“完整unframed classification”的声明尚不能成立。

#### Suggested Bounded Fix（建议的最小修复）

- Support exemption必须登记并验证完整、稳定的reference clause/anchor，或使用等价的可审计role parser；不得只移除裸fragment。新增真实allowlisted文件的role-swap mutant，保持fragment与count不变但必须失败。
- 定义一份共享、可审计的unframed delimiter集合并同时用于candidate start/end；至少补入comma、semicolon、pipe以及`?`、`&`前界反例，同时保留普通identifier substring不命中。
- 仅需修改`test/prd-validation-report-path.test.ts`；不需要修改canonical source。

### 2. [中][P1 / PATCH-EVIDENCE] Published TOML gate没有构造完整semantic key path

- **Source**：blind + edge；Aggregator独立复现
- **Location**：`test/prd-validation-report-path.test.ts:427-455,776-797`
- **Affected contract**：Story 11.7 AC5、AC6、AC9；Round 4 Finding #2

#### Root Cause（根因）

`extractTomlAssignmentKeys()`只解析assignment行左侧的单个局部key，不维护当前table header，也不接受合法的quoted dotted components或dot两侧空白。`isReportTargetOverrideKey()`随后只能审计这个不完整字符串；同时target vocabulary包含`directory`却遗漏常用等价role `dir`与`folder`。

#### Reproducible Evidence（可复现证据）

Aggregator以current regex/predicate重放得到：

- `[report]\npath = "arbitrary.md"` → keys为`["path"]`，rejected为`[]`；
- `[validation.report]\noutput = "arbitrary.md"` → keys为`["output"]`，rejected为`[]`；
- `"workflow"."report_name" = "arbitrary.md"`与`workflow . report_name = "arbitrary.md"` → keys均为`[]`；
- `report_dir = "arbitrary.md"`与`report_folder = "arbitrary.md"` → keys可读取，但rejected均为`[]`。

这些value故意不含managed basename，故basename classifier不会补捕。`report.dir`/`report.folder`并非要求无限枚举任意未来词汇，而是对“report输出目录”这一明确target role的常见TOML表达，和现有`report_directory`义务同构。

#### Impact（影响）

Published `config.toml.example`可通过合法TOML table/dotted syntax或常见report-directory字段恢复第二套report target，而focused evidence仍宣告无forbidden assignment key，违反exact target的回归门禁。

#### Suggested Bounded Fix（建议的最小修复）

- 解析table header与assignment dotted key的完整path，支持bare/quoted components及dot两侧空白；对fully-qualified semantic path应用deny predicate。
- 在现有target vocabulary中加入`dir`、`folder`并编码上述最小反例；继续证明`output_folder`、`planning_artifacts`、`implementation_artifacts`等非report-root字段合法。
- 仅需修改`test/prd-validation-report-path.test.ts`；不要求改变runtime config语义或新增依赖。

### 3. [中][P1 / PATCH-EVIDENCE] Private filesystem role inventory未解析全部binding且discovery审计非递归

- **Source**：blind + edge；Aggregator独立复现并收窄泛化边界
- **Location**：`test/prd-validation-report-path.test.ts:458-521,819-833`
- **Affected contract**：Story 11.7 AC5、AC6、AC7、AC9；Round 4 Finding #3

#### Root Cause（根因）

1. `extractFsPromiseBindings()`使用非global的single-line regex `exec()`，只读取第一条exact `node:fs/promises` named import，并把alias映射回original name；`findFunctionCalls()`却只搜索original primitive的字面调用。因此第二条import中的local alias不会进入binding/call inventory。
2. Discovery gate只检查固定`discoverySection`内是否直接调用mutation names或三个known producer names，不递归解析它所调用的local helper。Behavioral snapshot只执行current fixture状态，不能证明条件化helper在未覆盖entry状态下也只读。

#### Reproducible Evidence（可复现证据）

- 在current private source末尾增加第二条`import { writeFile as emitReport } from "node:fs/promises";`和parameterized `emitAdditionalReport(target, content) { await emitReport(target, content); }`后，current helpers仍得到：mutation bindings `=["writeFile"]`、mutation calls `=["writeFile"]`、literal `writeFile(` count `=1`，而新增`emitReport(` call确实存在`1`次。该mutant不需新增managed literal或改变`REPORT_PREFIX`/`LEGACY_PATTERNS` counts。
- 另一个独立结构是：在`discoverySection`外新增local helper，由它调用已知producer或aliased mutation binding；discovery仅条件调用该helper。Current direct deny不建立call graph，因此看不到间接producer/mutation edge；条件未被现有fixture触发时，behavioral before/after snapshot也保持相等。

#### Narrowing / Rejected Overstatement（收窄与驳回泛化）

- “任意alias都可绕过”过宽：若alias位于当前首条import并替换当前direct call，现有binding/call或literal-count断言会失败。被确认的是**第二条未解析import中的alias**，以及等价的未解析local binding形态。
- “任意indirect helper都构成mutation”也过宽：只读helper不是问题；被确认的是discovery可达、且最终抵达已知producer或未解析filesystem mutation binding的helper chain。
- 直接新增第二个字面`writeFile()`或在discovery内直接调用已列举primitive/producer会被current gate捕获，不列为finding。

#### Impact（影响）

Private script可增加未被静态oracle识别的第二writer，或让discovery经条件化wrapper抵达mutation路径，而current-path behavior fixtures保持绿色。由此唯一producer与legacy discovery read-only两条AC证据仍非fail-close。

#### Suggested Bounded Fix（建议的最小修复）

- 枚举全部`node:fs`/`node:fs/promises`相关import与local aliases，将local binding映射回original API，并按local binding审计全文件调用与授权位置。
- 为discovery建立明确的local-helper allowlist或递归call-graph边界，证明全部可达helper均只读；补入第二条aliased import + parameterized writer与条件化indirect producer helper的静态mutant。
- 保留真实discovery前后no-follow snapshot，但不得把单一current fixture当作static reachability证明。
- 仅需修改`test/prd-validation-report-path.test.ts`；若新门禁揭示current source事实问题，必须返回fresh Evaluator重新授权，不得由Fixer自行扩大到private source。

## Closed / Rejected Candidates（已关闭与驳回候选）

1. **Current runtime behavior — maintained closed**：current source仍只有一个直接`writeFile(..., { flag: "wx" })` canonical producer；current discovery执行路径只读。本轮不误报production已经mutation。
2. **Exact filename/date/path与single invocation date — closed**：未发现证据重开AC1–AC4、Step 2–13 locked path或cross-midnight metadata绑定。
3. **Existing-target/race/zero mutation — closed**：early probe、commit-time recheck、exclusive `wx`、same/different content、stable issue、exact manual action与zero suffix/temp/progress evidence不重开。
4. **Legacy lifecycle与metadata intersection — closed**：五类legacy family、canonical control、install/update/repair parity、逐surface actual intersection empty均保持闭环。
5. **Same-basename all-entry inventory — closed**：symlink/directory/FIFO的no-follow location/type inventory没有新反例。
6. **Downstream physical owner chain — closed**：三个consumer的`realProject → realPlanning → exact realPlanning/prd → candidate` fail-closed contract未被推翻。
7. **Acceptance Auditor PASS as aggregate override — rejected**：该层证明current source和已编码matrix通过，不构成对未进入matrix的deterministic mutants的反证。
8. **Arbitrary vocabulary/call-graph expansion — rejected**：本轮只保留明确的report target TOML forms与可达mutation edges，不要求识别任意自然语言同义词或通用JavaScript语义。
9. **External drift — excluded**：`speclite-drawer-er-modeler/`、zip、workspace IDE mirrors与fixed-count drift不属于Story 11.7 finding。

## Triage Summary（分流摘要）

| ID | Sources | Severity | Bucket | Decision |
| --- | --- | --- | --- | --- |
| 1 | blind + edge | P1 | `patch` | Confirmed；support clause role与unframed delimiter作为同一classifier finding的两个独立义务。 |
| 2 | blind + edge | P1 | `patch` | Confirmed；必须以完整TOML semantic key path审计report target。 |
| 3 | blind + edge | P1 | `patch` | Confirmed；必须解析全部local mutation bindings并审计discovery可达helper。 |

- `decision_needed`: 0
- `patch`: 3
- `defer`: 0
- `dismiss`: 0（候选中的过宽表述已在对应finding内收窄，不删除其可复现核心）
- P2: 0

## Owner Gate（Owner 门禁）

**Owner Gate：`NONE`。** 三项均是不改变产品、Architecture或current runtime语义的focused evidence加固，修复方向可限定在`test/prd-validation-report-path.test.ts`。应先由fresh Evaluator Round 5独立裁决；若确认，Fixer只能修改Evaluator授权的focused test并追加Round 5 evaluation Fix Summary，不得修改source、Story、tracker、completion gate、既有CR、external drawer/zip、IDE mirrors或fixed-count baselines。

## Verdict（裁决）

- **Verdict：FAIL**
- **P1：3**
- **P2：0**
- **Owner Gate：`NONE`**
- **Next Gate**：fresh Evaluator Round 5；最新Reviewer/Evaluator双PASS前不得进入CR04、CR05或CR06。
