---
Story: 11-7
Round: 3
Date: 2026-09-05
Model Used: GPT-5.6 (gpt-5.6)
Type: Code Review Summary
---

## Review Conclusion（审查结论）

Blind Hunter、Edge Case Hunter、Acceptance Auditor 三层正式结果均成功返回（`3/3`，无失败或降级）。Blind 为 **FAIL / 1 P1**，Edge 为 **FAIL / 5 P1 candidates**，Acceptance 为 **PASS / 0 findings**。Aggregator 重新读取 Story、Round 1/2 summary/evaluation/fix records、current producer/private operation、Step 1/13、三个 downstream consumers、focused fixture与current completion gate，并对 framed token、集合断言、全项目location inventory和role-specific gate做了独立最小复现。

去重后确认 **3 个 P1 blocking findings**，均为focused evidence patch：

1. Blind与Edge的whole framed value分类缺口，与Edge的config/private-script role gate缺口共享“classified negative inventory fail-open”根因，合并为一个finding，但在修复要求中保留generic classifier、published config key、private legacy declaration三组独立断言。
2. Lifecycle command metadata exclusion使用negated `arrayContaining(allPaths)`，只在全部report paths同时出现时失败；单一路径被plan/change/conflict仍可假绿。
3. 全项目same-basename location inventory只记录`Dirent.isFile()`，会忽略同名symlink与non-file entry，不能证明location/type集合无新增。

Edge提出的Step 13 `{validationInvocationDate}` frontmatter候选不成立。该frontmatter明确是“File references”，Step 13已经以`validationReportPath: '{validationReportPath}'`绑定唯一report文件；`{validationInvocationDate}`是workflow activation生成并为whole invocation保存的in-memory state，不是第二个文件引用。相同step仍直接消费未列入该frontmatter的全局config变量，说明该区不是所有runtime token的声明表。Current workflow contract、Step 1和cross-midnight fixture已证明date只生成一次，Step 13也没有clock read或path recomputation。机械新增date frontmatter既不是修复必要条件，也不能证明loader行为。

本轮无P2、无Owner decision。总体结论为 **FAIL**；不得进入CR04、CR05或CR06，应先由fresh Evaluator Round 3独立裁决3项bounded evidence fixes。

## Layer Results（三层结果）

| Layer | Execution | Formal result | Aggregated result |
| --- | --- | --- | --- |
| Blind Hunter | PASS | `FAIL` / 1 P1 | Whole framed value仍被二次截断，missing `.md` managed value被跳过；并入Finding #1。 |
| Edge Case Hunter | PASS | `FAIL` / 5 P1 candidates | Classifier与role gates合并为Finding #1；lifecycle集合断言与location inventory分别确认为Findings #2/#3；date-frontmatter候选驳回。 |
| Acceptance Auditor | PASS | `PASS` / 0 findings | AC1–AC10判为通过；Round 1/2既有十项P1均认为已关闭。Aggregator仍以确定性反例确认3个focused evidence blockers。 |

## Findings（发现）

### 1. [中][P1 / PATCH-EVIDENCE] Classified negative inventory仍会截断whole framed value，并漏过published/private role漂移

- **Source**：blind + edge；Aggregator独立复现
- **Location**：`test/prd-validation-report-path.test.ts:399-440,523-587`；`assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-validate-prd/scripts/prd-validation-report-operation.mjs:8-16,70-77`

- **Evidence**
  - `extractManagedBasenameTokens()`先正确取得Markdown code span或quoted/TOML value，但随后仍把每个framed value交给`extractManagedBasenamesFromValue()`。后者只搜索第一个`.md`，并在whitespace、comma、semicolon或pipe处结束。因此`prd-validate-report-{yyyy-MM-dd}.md backup`、`.md,backup`、`.md;backup`、`.md|backup`均只返回允许值`prd-validate-report-{yyyy-MM-dd}.md`，非法尾部被丢弃。
  - Managed prefix后找不到`.md`时直接`continue`。Aggregator复现`prd-validate-report-{yyyy-MM-dd}`返回空token，随后没有任何allowlist assertion，故无扩展名active default可绕过AC6。
  - Published config的role gate只拒绝`/(?:report|filename|path)[_-]?(?:override|fallback)/i`。加入`report_path = "arbitrary.md"`、`filename = "other.md"`或等价path key不会命中；只要value不含managed basename，current gate仍可通过，不能证明config未开放report filename/path override。
  - Private script虽验证`REPORT_PREFIX`、target derivation、calendar check、`wx`及`LEGACY_PATTERNS`仅在discovery branch消费，但`extractLegacyPatternsDeclaration()`结果只断言包含字符串`LEGACY_PATTERNS`，随后整文件`continue`。Aggregator把首个legacy regex在内存中放宽为`/^validation-report-.*/i`，current coarse role checks仍全部成立；因此没有证明exact legacy family set、anchoring或producer/discovery role的完整集合。

- **Impact**
  - AC5/AC6/AC9的classified inventory仍可在generic active prose、published config和private historical discovery三类surface漂移时保持focused green。Current corpus未发现这些非法值，不等于回归门禁已经覆盖它们。

- **Suggestion**
  - 对已识别为framed的code span/quoted/TOML/CSV value，只要包含managed prefix，就把完整framed value交给anchored classifier；不得再按whitespace/comma/semicolon/pipe二次截断。Unframed prose可使用明确边界，但managed prefix即使缺`.md`也必须产生非法candidate并失败。
  - Config role单独解析并拒绝任何report filename/path target/override key，不依赖value是否含managed basename；只允许既有field-structure reference字段。
  - Private script role单独断言`LEGACY_PATTERNS`的exact ordered set与anchored regex文本，并证明它只由discovery branch消费。不得通过整文件skip替代exact role assertion，也不得把runtime parser或新dependency带入本Story。

### 2. [中][P1 / PATCH-EVIDENCE] Lifecycle exclusion断言只在全部report paths同时出现时失败

- **Source**：edge；Aggregator独立确认
- **Location**：`test/prd-validation-report-path.test.ts:210-215,262-265,296-300`

- **Evidence**
  - `expect(actual).not.toEqual(expect.arrayContaining(reportRelativePaths))`的语义是：只有当`actual`包含`reportRelativePaths`的**全部**元素时才失败，而不是“任何一个受保护path出现即失败”。
  - Aggregator用六个expected paths与只含其中一个path的actual集合复现：`arrayContaining(allPaths)`为false，外层negation为true。Install `plannedWrites`/issues、update `changedPaths`/conflicts与repair同类断言均存在这一逻辑。
  - Snapshot确实会捕获实际path/type/bytes/hash/tree变化，但不能替代command metadata contract：某个report被列入plan、changedPaths或conflicts而尚未改变bytes时，current assertions仍会假绿。

- **Impact**
  - AC7/AC9与completion gate关于install/update/repair“未定位任何受保护report”的逐项证据不成立；实际no-migration行为尚未被推翻，但command-result evidence存在确定性漏检。

- **Suggestion**
  - 对每个阶段先过滤与`reportRelativePaths`交集，再精确断言空数组；conflicts按`affectedPath`投影后同样逐项过滤。也可逐path断言`not.toContain`，但不得继续使用一个negated `arrayContaining(allPaths)`表达zero intersection。

### 3. [中][P1 / PATCH-EVIDENCE] 全项目same-basename inventory忽略matching symlink与non-file entry

- **Source**：edge；Aggregator独立复现
- **Location**：`test/prd-validation-report-path.test.ts:623-671`

- **Evidence**
  - `captureReportSnapshot()`要求owner内预期reports为no-follow regular non-symlink，这是有效的原位type证据；但全项目`reportLocations`依赖`findNamedFiles()`。
  - `findNamedFiles()`仅在`entry.isFile() && names.has(entry.name)`时记录location；同basename symlink、FIFO/socket或其它non-file entry均被跳过，匹配名称的directory还会被当递归容器而不记录自身。
  - Aggregator在临时目录建立`prd-validation-report.md` symlink，`Dirent`显示`isSymbolicLink=true / isFile=false`，current inventory返回空。若lifecycle在PRD owner外新增同basename symlink/non-file，owner tree与原report snapshots均可不变，location inventory仍会假绿。

- **Impact**
  - AC7/AC9要求的全项目same-basename location/no-copy-move证据不完整；命令新增第二location或改变entry type时，current fixture可能无法观察。

- **Suggestion**
  - 在决定是否递归前先按basename记录每个matching directory entry，并保留no-follow type（regular、symlink、directory、other）及project-relative location；仅递归真实directory，绝不follow symlink。Snapshot应精确比较完整location+type集合，并继续保留owner内预期reports的regular/readable/bytes/hash断言。

## Rejected Candidates（驳回候选）

1. **Step 13必须在File references frontmatter显式声明`validationInvocationDate`**：驳回。该区用于文件引用，`validationReportPath`已是唯一文件target绑定；workflow activation明确把`validationInvocationDate`存为whole-invocation state。Step 13从该state更新metadata，不读取clock、不重算target。相同step使用的`communication_language`、`document_output_language`等global runtime变量也未在File references中重复声明，无法据此推导loader会丢失date state。

2. **Owner chain仍未关闭**：驳回。Edit PRD、Implementation Readiness、Correct Course三处current prose完全一致地要求`realPlanning`位于`realProject`内、`realPrdOwner`物理路径精确等于`realPlanning/prd`，随后才验证candidate no-follow regular/readable及realpath containment；focused predicate覆盖normal、external与project-internal cross-space反例。

3. **Step 2–13 path token仍断链**：驳回。13个active step均精确包含`validationReportPath: '{validationReportPath}'`，active package无snake_case alias或后续clock/path recomputation入口。

4. **Lifecycle仅覆盖两类legacy family**：驳回。Current authoritative corpus包含五类legacy representative和一个canonical control，并在install之前创建；每个阶段均继续执行snapshot检查。Round 3发现的是metadata zero-intersection断言及全项目inventory可观测性，而不是family corpus缺失。

5. **重开single-date、repair success或completion-gate command inventory**：驳回。Cross-midnight/date surfaces、repair公开success与真实mirror恢复、current gate exact command/inventory/counts均已存在；本轮3项finding不改变这些已关闭事实，但修复后outer Flow Gate owner仍需刷新current evidence陈述。

## Acceptance Criteria Matrix（验收标准矩阵）

| AC | Result | Current evidence |
| --- | --- | --- |
| AC1 | PASS | Private producer只派生exact `prd-validate-report-{yyyy-MM-dd}.md`。 |
| AC2 | PASS | Runtime date使用四位年、两位月、两位日并做真实calendar validation；Step 13继续消费whole-invocation locked date。 |
| AC3 | PASS | 唯一新target为`{planning_artifacts}/prd/`下exact dated basename。 |
| AC4 | PASS | Canonical Skill ID仍为`speclite-validate-prd`。 |
| AC5 | **FAIL** | ZH/EN、steps、help、contracts、examples与downstream current文本已同步，但classified inventory对config/private role漂移仍可假绿。 |
| AC6 | **FAIL** | Whole framed value会被分隔符截断，缺`.md`managed value被跳过，且private legacy exact set未被精确锁定。 |
| AC7 | **FAIL** | 五类legacy与canonical原位snapshot存在，但command metadata逐项排除和全项目location/type inventory仍有漏检。 |
| AC8 | PASS | Same/different existing target、stable issue、exact action、commit-time recheck、exclusive create与zero suffix/reuse语义均已实现。 |
| AC9 | **FAIL** | Focused为9/9，但Findings #1–#3证明negative/role/lifecycle evidence存在确定性false green。 |
| AC10 | PASS | 未发现validation rules、scoring、report body或IR filename变更。 |

## Verification Summary（验证摘要）

- 三层正式结果：Blind、Edge、Acceptance均完成；执行覆盖`3/3`，无layer failure。
- Aggregator focused复跑：`npx vitest run test/prd-validation-report-path.test.ts` → `1 file / 9 tests passed`。
- Whole framed predicate复现：space、comma、semicolon、pipe suffix均被截断为允许的exact placeholder；missing `.md` managed value返回空token。
- Lifecycle matcher复现：actual只含六个expected paths之一时，`arrayContaining(allPaths)`为false，negated assertion通过。
- Location inventory复现：matching symlink为`isSymbolicLink=true / isFile=false`，current `findNamedFiles()`返回空；临时目录已清理。
- Role gate复现：published config加入`report_path`/`filename`未命中current override regex；private legacy regex在内存中放宽后，current coarse role checks仍通过。
- Reviewer layers报告related为`52/52`，affected为`224 passed / 4 failed`；四项均为external drawer fixed-count drift。Aggregator未重复运行related/affected。
- 按Aggregator约束未运行build、full suite或packaging；未修改external drawer/zip、workspace mirrors、fixed-count baselines或除本summary外的任何文件。

## Governance And Caveats（治理与例外）

- Current canonical source变更触发`canonical-source-truth:D0`与`module-discovery-contract:D0`；hook为warning-only且最近报告`status=ok / findings=[]`。本轮Aggregator只写CR summary，不替代outer `speclite-canonical-source-governance-runner`或最终`speclite-check-canonical-source-change`。
- `speclite-drawer-er-modeler/`及zip仍为external user-owned变更；`core 18→19`、`total 68→69` fixed-count failures保持隔离，不得由11.7 Fixer吸收。
- Story 11.7 bounded Fixer不得修改validation rules/scoring/report body、IR filename、Story 11.8+、drawer/mirrors/fixed-count baselines、已完成Stories、historical CR records或unrelated canonical source。

## Owner Gate（Owner 门禁）

- **无 Owner decision。** 三项均有唯一bounded test-evidence修复方向，不需要产品或architecture取舍。

## Conclusion（结论）

- **结论：不通过（FAIL）**
- **阻塞项**：3个P1：classified negative/role inventory fail-open、lifecycle command metadata非zero-intersection断言、same-basename location/type inventory漏检。
- **下一步**：进入fresh Evaluator Round 3。Evaluator应保持Finding #1三组独立assertion义务，并分别裁决Findings #2/#3；如确认，fresh Fixer仅修改focused test与evaluation Fix Summary，除非Evaluator以current direct evidence明确授权其它文件。修复后由outer Flow Gate owner刷新current completion evidence，再启动fresh Reviewer Round 4。不得进入CR04/05/06。
