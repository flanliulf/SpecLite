---
Story: 11-7
Round: 4
Date: 2026-09-05
Model Used: GPT-5.6 (gpt-5.6)
Type: Code Review Summary
---

## Review Conclusion（审查结论）

Blind Hunter、Edge Case Hunter、Acceptance Auditor 三层正式结果均成功返回（`3/3`，无失败或降级）。Blind 为 **FAIL / 1 P1**，Edge 为 **FAIL / 3 P1**，Acceptance 为 **FAIL / 1 P1**。Aggregator 重新读取 Story 11.7、Round 1–3 summary/evaluation/fix records、current focused test、private producer/discovery script与completion gate，并以current helper做了独立最小复现。

去重后确认 **3 个 P1 blocking findings**，均为focused test-evidence patch：

1. 三层关于framed value、assignment/query delimiter及known support basename豁免的报告，共享“managed basename classifier按上下文漏检active default”的根因，合并为Finding #1。
2. 三层关于`report_name`、`report_output`、`report_destination`、`report_location`等published config同义字段的报告，共享“config key-role vocabulary不完整”的根因，合并为Finding #2。
3. Blind关于private script整文件skip允许第二producer、Edge关于discovery仅排除`writeFile`的报告，共享“private script全文件producer/discovery role inventory不完整”的根因，合并为Finding #3。

Current canonical source没有出现上述非法default、override或mutation；本轮发现均为确定性的oracle false-green，不误报为production functional defect。Round 3 Finding #2（逐metadata surface zero intersection）与Finding #3（same-basename all-entry no-follow inventory）已关闭，不重开。本轮无P2、无Owner decision。总体结论为 **FAIL**；不得进入CR04、CR05或CR06，应先由fresh Evaluator Round 4独立裁决3项bounded evidence fixes。

## Layer Results（三层结果）

| Layer | Execution | Formal result | Aggregated result |
| --- | --- | --- | --- |
| Blind Hunter | PASS | `FAIL` / 1 P1 | Assignment/query delimiter并入Finding #1；config同义key并入Finding #2；private whole-file skip并入Finding #3。 |
| Edge Case Hunter | PASS | `FAIL` / 3 P1 | Support basename全局豁免并入Finding #1；config同义key并入Finding #2；discovery mutation API漏检并入Finding #3。 |
| Acceptance Auditor | PASS | `FAIL` / 1 P1 | Framed value带前置文本的截断并入Finding #1；config target-role同义词并入Finding #2。 |

## Findings（发现）

### 1. [中][P1 / PATCH-EVIDENCE] Managed basename classifier仍可因上下文边界与全局名称豁免而假绿

- **Source**：blind + edge + acceptance；Aggregator独立复现
- **Location**：`test/prd-validation-report-path.test.ts:624-700`；现有反例矩阵位于`:497-524`

#### Evidence（证据）

- `extractManagedBasenameFromFramedValue()`仅在managed prefix位于framed value开头或前缀文本以`/`结尾时保留完整candidate；否则退回unframed tokenizer（`:649-657`）。后者在空格、逗号、分号、pipe等字符处停止（`:660-672`），所以`"prefix prd-validate-report-{yyyy-MM-dd}.md backup"`被缩短为允许的`prd-validate-report-{yyyy-MM-dd}.md`。这直接违反Round 3 Evaluator“framed value命中managed prefix后不得二次截断”的交付义务。
- `findNextManagedPrefix()`只接受start、`/`或`/[\s([{:]/`前界（`:680-700`），不接受常见assignment/query前界`=`。Aggregator用current predicate复现：`REPORT=prd-validation-report-old.md`与`url?report=prd-validation-report-old.md`均返回空candidate；active producer/help/example可用该形式引入forbidden basename而保持focused green。
- `isKnownNonReportSurfaceName()`只按basename全局豁免`prd-validation-report-operation.mjs`与`prd-validation-report-path.test.ts`（`:675-677`），不绑定合法的`file + clause + role`。Aggregator复现`report filename = "prd-validation-report-path.test.ts"`返回空candidate；support名称因此也可被用作active report default而绕过anchored allowlist。
- Current adversarial matrix只覆盖managed prefix位于framed value起始位置（`:497-524`），没有覆盖上述前置文本、`=`前界或support basename处于producer/default role的反例。

#### Impact（影响）

AC5、AC6、AC9的classified negative evidence仍可在active Markdown/TOML/CSV/help surface新增非法default时保持`10/10`绿色；completion gate第39–40行关于完整delimiter/framed分类与独立fail-close的PASS陈述尚不能成立。

#### Suggested Bounded Fix（建议的最小修复）

- Framed value只要命中managed prefix，就保留从该prefix至frame末尾的完整candidate，不因前置描述文本退回unframed tokenizer；新增前置文本、同一frame多个managed名称的反例。
- 为unframed classifier建立明确的filename token前后界，至少覆盖assignment/query的`=`前界，同时保留普通标识符子串的非命中证明。
- 删除basename-global skip；将support script/test名称的合法出现限定为精确`file + clause/role` allowlist，并证明同名值处于active report producer/default clause时必须失败。
- 只需修改`test/prd-validation-report-path.test.ts`，不需要改变current source语义。

### 2. [中][P1 / PATCH-EVIDENCE] Published config key-role classifier未覆盖report target/output同义字段

- **Source**：blind + edge + acceptance；Aggregator独立复现
- **Location**：`test/prd-validation-report-path.test.ts:419-437,703-720`

#### Evidence（证据）

- `isReportTargetOverrideKey()`只把`filename`、exact `path_override`、`filepath`，以及`report`与`path|filename|file|target|override`的组合视为禁止字段（`:708-720`）。
- Aggregator用current predicate复现：`validation_report`、`prd_report`、`report_name`、`report_output`、`report_destination`、`report_directory`与`prd_report_location`全部返回`false`。若value是`"arbitrary.md"`，managed basename scan也不会补捕，published config可重新暴露第二套report target而保持focused green。
- Current forbidden-key matrix只覆盖`report`、`report_path`、`report_filename`、`validation_report_target`、`filename`、`path_override`、`filepath`及camelCase同构（`:424-435`），没有证明同义target-role字段fail-close。
- `output_folder`、`planning_artifacts`、`implementation_artifacts`的既有allow cases（`:436-437`）说明该修补可以保持普通root字段合法，不需要改变配置语义。

#### Impact（影响）

AC5、AC6、AC9要求published config不能恢复report filename/path target/override surface；current key gate对等价命名存在确定性false-green，completion gate第40行的PASS陈述不完整。

#### Suggested Bounded Fix（建议的最小修复）

- 对normalized snake_case、camelCase、dotted assignment key建立明确、可审计的report-target semantic deny vocabulary，至少覆盖`name|output|destination|directory|location`与`report`/`validation_report`/`prd_report`组合。
- 将上述同义key加入adversarial table，并继续证明`output_folder`、`planning_artifacts`、`implementation_artifacts`不被误拒。
- 只需修改`test/prd-validation-report-path.test.ts`，不需要修改`config.toml.example`或runtime config。

### 3. [中][P1 / PATCH-EVIDENCE] Private script全文件producer/discovery role inventory仍非fail-close

- **Source**：blind + edge；Aggregator独立确认
- **Location**：`test/prd-validation-report-path.test.ts:54-96,440-490`；`assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-validate-prd/scripts/prd-validation-report-operation.mjs:3,23-83,85-104`

#### Evidence（证据）

- Generic managed-basename scan对private script执行整文件`continue`（`test/prd-validation-report-path.test.ts:483-490`）。替代assertions只检查已知`execute...`、`discover...`与`inspectTarget...resolveRoots`三个固定slice，以及`REPORT_PREFIX`/`LEGACY_PATTERNS`出现次数（`:440-476`）。在这些slice之外新增第二function/CLI branch，并以hard-coded legacy/suffixed basename调用`writeFile()`，不会改变现有slice与常量计数，current assertions仍可全部通过。
- Discovery role只断言其slice不含`writeFile(`（`:459-466`）。它没有拒绝`rename`、`rm`、`unlink`、`copyFile`、`appendFile`、`truncate`等mutation primitive，也不能阻止discovery调用位于slice外的mutation helper。
- 首个behavior fixture在调用`discoverPrdValidationReports()`前验证legacy bytes/entries，调用后只断言返回的path arrays（`:54-96`）；因此“先枚举、再以非`writeFile` API mutation、最后返回既有数组”的mutant仍可假绿。Install/update/repair snapshot证明的是三个lifecycle commands，不替代private discovery自身的read-only invariant。
- Current private script确实只有一个canonical producer，且discovery当前只读；finding针对的是Round 3 Evaluator要求的private exact set/role evidence仍未覆盖whole-file producer与完整read-only role，而非当前source已违规。

#### Impact（影响）

AC5、AC6、AC7、AC9关于唯一producer、legacy只读discovery和原位保留的回归证据仍可被第二producer或替代mutation API绕过；completion gate第40行关于private exact set/role独立fail-close的PASS陈述尚不能成立。

#### Suggested Bounded Fix（建议的最小修复）

- 不再以private script整文件skip替代role inventory。精确剔除合法的script filename、`REPORT_PREFIX`与ordered `LEGACY_PATTERNS` declaration后，对剩余whole-file文本执行managed basename scan；或建立等价的全文件write-target/producer inventory，证明只有唯一canonical write target。
- 对discovery调用前后捕获完整canonical/legacy path、type、bytes、hash与tree snapshot；同时把静态read-only role gate扩展到所有filesystem mutation import/call及间接helper，不仅是`writeFile`。
- 只需修改`test/prd-validation-report-path.test.ts`；若新增assertion对current source产生RED，必须返回Evaluator重新限定，不得由Fixer自行修改private script。

## Closed Checks（已闭环检查）

1. **Round 3 Finding #2 — PASS**：install `plannedWrites`/issues、update/repair `changedPaths`/conflicts已分别投影，并逐surface与完整protected report path set求交后精确断言`[]`（`test/prd-validation-report-path.test.ts:210-219,266-275,306-315,851-859`）。原先negated `arrayContaining(allPaths)`已移除。
2. **Round 3 Finding #3 — PASS**：`findNamedEntries()`在递归前对每个matching entry做no-follow `lstat`，记录`location + regular|symlink|directory|other`，且仅递归真实directory（`:822-848`）；symlink、directory、FIFO反例证明所有entry type可观察（`:589-612`）。
3. **Round 3 private exact constants — PARTIAL PASS**：`REPORT_PREFIX` exact value、ordered anchored `LEGACY_PATTERNS`、已知producer/discovery slice与唯一current constant consumption均已有断言（`:440-476`）；Finding #3只指出whole-file第二producer与完整read-only role仍可绕过，不否定exact constant集合本身。
4. **Prior functional closure maintained**：未发现证据重开exact dated target、single invocation date、same/different-content pre-write block、commit-time recheck、exclusive `wx`、stable issue、five-family install/update/repair preservation、Step 2–13 path binding、downstream physical owner chain或installed executable projection。
5. **Focused execution — PASS**：Aggregator复跑`npx vitest run test/prd-validation-report-path.test.ts` → `1 file / 10 tests passed / 0 failed`。该绿色结果不反驳Findings #1–#3，因为确定性反例尚未进入test matrix。
6. **Completion evidence scope**：completion gate的exact related `53/53`与affected `225 passed / 4 failed`记录仍可重放；本轮Findings只使第39–40行关于classifier/private role的PASS陈述失真，不重开第42行zero-intersection/all-entry inventory。四项affected failure继续仅属于external drawer fixed-count drift。
7. **Excluded external drift**：`speclite-drawer-er-modeler/`、zip、workspace IDE mirrors及fixed-count drift按任务边界排除，未作为Story finding。

## Rejected And Deduplicated Candidates（驳回与去重候选）

1. **把current false-green表述为已发生production drift**：驳回。Current canonical inputs满足exact basename/config/private role契约；本轮只确认test oracle可被反例绕过。
2. **把config同义key与generic basename classifier合成一个finding**：驳回合并。前者即使value不含managed prefix也应按assignment key-role失败；后者针对已出现managed basename的token边界与role-scoped exemption，两者修复任一项都不能关闭另一项。
3. **把private second producer与discovery mutation拆成两个finding**：去重合并。两者均由private整文件被generic scan跳过、固定slice无法证明whole-file role集合造成，应由同一whole-file producer/discovery role inventory修补。
4. **重开Round 3 lifecycle zero-intersection或same-basename inventory**：驳回。Current direct code与定向反例已证明两项闭环，无新反例推翻。
5. **重开Round 1/2已关闭项**：驳回。Current evidence仍支持single-date、repair success、Step 2–13 path、physical owner chain、five-family lifecycle与completion command inventory；本轮3项只补强更窄的evidence oracle。

## Acceptance Criteria Matrix（验收标准矩阵）

| AC | Result | Current evidence |
| --- | --- | --- |
| AC1 | PASS | Current private producer只构造exact `prd-validate-report-{yyyy-MM-dd}.md`；Finding #3阻塞的是唯一producer回归证据，不是current behavior。 |
| AC2 | PASS | Runtime date一次生成、真实calendar validation与cross-midnight证据仍成立。 |
| AC3 | PASS | Current唯一新target仍位于`{planning_artifacts}/prd/`。 |
| AC4 | PASS | Canonical Skill ID保持`speclite-validate-prd`。 |
| AC5 | **BLOCKED** | Current surfaces已同步，但Findings #1–#3允许active default、config target或private role漂移时oracle假绿。 |
| AC6 | **FAIL** | Framed/unframed边界、support basename全局豁免与config同义key仍可绕过negative scan。 |
| AC7 | **BLOCKED** | Install/update/repair preservation与all-entry inventory已闭环，但private discovery read-only role仍缺完整fail-close证据。 |
| AC8 | PASS | Existing-target block、stable issue、exact manual action、commit-time recheck、exclusive create及zero suffix/reuse均有direct evidence。 |
| AC9 | **FAIL** | Focused为`10/10`，但Findings #1–#3均有确定性未编码反例。 |
| AC10 | PASS | 未发现validation rules、scoring、report body或IR filename扩面。 |

## Verification Summary（验证摘要）

- 三层正式结果：Blind、Edge、Acceptance均完成；执行覆盖`3/3`，无layer failure。
- Aggregator focused复跑：`npx vitest run test/prd-validation-report-path.test.ts` → `1 file / 10 tests passed`。
- Classifier最小复现：带前置文本framed value被截断为合法canonical token；assignment/query的`=`前界返回空；support basename作为active default被全局豁免。
- Config predicate最小复现：`validation_report`、`prd_report`、`report_name`、`report_output`、`report_destination`、`report_directory`、`prd_report_location`均返回`false`。
- Private role静态审计确认：generic scan整文件`continue`；固定slice与constant count不会观察slice外hard-coded第二producer；discovery read-only gate只排除`writeFile`且behavior test缺调用后snapshot。
- `git diff --check -- test/prd-validation-report-path.test.ts`通过。
- 按Aggregator约束未运行build、full suite或packaging；未修改source、tests、Story、tracker、completion gate、既有layer/summary/evaluation、external drawer/zip、workspace mirrors或fixed-count baselines。

## Governance And Caveats（治理与例外）

- Current canonical source变更触发`canonical-source-truth:D0`与`module-discovery-contract:D0`；本Aggregator只写CR summary，不替代outer `speclite-canonical-source-governance-runner`与最终`speclite-check-canonical-source-change`。
- `speclite-drawer-er-modeler/`及zip仍是external user-owned变更；其`core 18→19`、`total 68→69` fixed-count failures保持隔离，不得由Story 11.7 Fixer吸收。
- Story 11.7 bounded Fixer不得修改validation rules/scoring/report body、IR filename、Story 11.8+、drawer/mirrors/fixed-count baselines、已完成Stories或historical CR records。

## Owner Gate（Owner 门禁）

- **Owner Gate：`NONE`。** 三项均有唯一bounded test-evidence修复方向，不涉及产品、Architecture或current source语义选择。

## Conclusion（结论）

- **结论：不通过（FAIL）**
- **Layer completeness：`3/3`**
- **阻塞项：3个P1**：managed basename classifier上下文漏检、published config key-role vocabulary不完整、private whole-file producer/discovery role inventory不完整。
- **P2：0**
- **Dismissed：0；Deduplicated：5个sub-candidates并入3个root causes。**
- **下一步**：进入fresh Evaluator Round 4。Evaluator应分别裁决3项bounded test-evidence fixes；如确认，fresh Fixer只修改`test/prd-validation-report-path.test.ts`与evaluation Fix Summary，除非Evaluator以current direct evidence明确授权其它文件。修复后由outer Flow Gate owner刷新current evidence，再启动fresh Reviewer Round 5。在最新Reviewer/Evaluator双PASS前不得进入CR04、CR05或CR06。
