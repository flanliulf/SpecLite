---
Story: 11-7
Round: 1
Date: 2026-09-04
Model Used: GPT-5.5 (gpt-5.5)
Type: Code Review Summary
---

## Review Conclusion（审查结论）

Blind Hunter、Edge Case Hunter、Acceptance Auditor 三层正式结果均成功返回（`3/3`，无降级），且均为 **FAIL**。Aggregator 重新读取 Story、current producer/private operation、active workflow steps、三个 downstream consumers、focused fixture、`SPEC 07` / `SPEC 09`、Story 11.6 已落地的 filesystem-operation 规则与 completion gate，并对 negative-scan blind spots、repair outcome evidence 和受控 ancestor replacement 做了独立最小复现。

去重后确认 **5 个 P1 blocking findings**，其中 2 个是 current behavior/active contract patch，3 个是 completion evidence patch。日期变量的三层重复报告合并为一个 single-invocation-date finding；repair lifecycle 的两层报告合并为一个 command-success evidence finding；parity surface 缺口、negative regex 漏检与整行 skip 共用“AC5/AC6 evidence inventory不完整”根因，合并为一个 finding。`177/4` 与 current `197/4` 不代表已发现新的 functional failure，但 completion gate 未保存可重放的 11-file command inventory，因而是独立的 current-evidence blocker。

Edge 提出的“第二次检查后 ancestor 被 OS 并发替换”不升级为 finding。Current API 唯一 caller-visible `__testOnlyInterposeBeforeCommit` 位于第二次 `inspectTarget()` 之前；Aggregator 以该 seam 替换 `prd/` ancestor 时，operation 返回 `candidate-symlink-escape` 且外部目录无写入。第二次重验后代码立即执行 `writeFile(..., { flag: "wx" })`，没有 user-controlled seam，满足已落地 `CR-SEC-21` 的 bounded-operation contract。剩余 OS-level pathname race 不能由 current API 确定性复现，也不能在本 Story 无额外 architecture/portability contract 时反推必须引入 native `openat`/directory-FD API。

本轮无 Owner decision。总体结论为 **FAIL**；不得进入 CR04、CR05 或 CR06，应先由 fresh Evaluator Round 1 对 5 个 bounded findings 做独立裁决。

## Layer Results（三层结果）

| Layer | Execution | Formal result | Aggregated result |
| --- | --- | --- | --- |
| Blind Hunter | PASS | `FAIL` / 3 P1 | 日期双源、repair success assertion、parity/downstream inventory均成立并去重。 |
| Edge Case Hunter | PASS | `FAIL` / 5 P1 + 1 P2 candidate | 日期与repair合并；negative regex/整行 skip并入evidence finding；Readiness symlink扩展为三个downstream共同安全缺口；OS-level race驳回。 |
| Acceptance Auditor | PASS | `FAIL` / 2 P1 | 日期双源与repair success成立；current 11-file affected重建为`197 passed / 4 failed`，四项仍为drawer drift。 |

## Findings（发现）

### 1. [高][P1 / PATCH] Report metadata 仍消费 `{current_date}`，single invocation date 会分叉

- **Source**：blind + edge + auditor；Aggregator 独立确认
- **Location**：`assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-validate-prd/references/workflow-details.md:18-24`；`assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-validate-prd/references/steps/step-v-01-discovery.md:66,163-179`；`assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-validate-prd/references/steps/step-v-13-report-complete.md:79-89`

- **Evidence**
  - `workflow-details.md` 与 Step 1 均规定每次 invocation 只生成一次 `{validationInvocationDate}`，并以它锁定 filename。
  - Step 1 初始化 frontmatter 的 `validationDate` 与正文 `Validation Date` 仍写 `{current_date}`；Step 13 final frontmatter 也再次写 `{current_date}`。
  - 跨午夜或两个变量采用不同 timezone/source 时，文件名日期、initial report metadata 与final metadata可出现分叉；这直接反驳 Story completion 对“后续steps只消费锁定值”的声明。

- **Impact**
  - 违反 AC2、AC5 与 Technical Requirement 的 single-invocation date hard contract，automation按filename关联report metadata时可能得到矛盾证据。

- **Suggestion**
  - Step 1 initial frontmatter/body与Step 13 final frontmatter全部只消费 `{validationInvocationDate}`；不得引入第二次 clock read或重新计算日期。
  - Focused fixture对所有active date surfaces做精确 parity assertion，证明 `{current_date}` 不再用于该报告日期。

### 2. [中][P1 / PATCH-EVIDENCE] Repair no-migration fixture 未证明 repair 命令成功

- **Source**：blind + edge + auditor；Aggregator 独立确认
- **Location**：`test/prd-validation-report-path.test.ts:168-244`

- **Evidence**
  - Install 与update分别断言 `exitCode === 0`，但 repair 在 `test/prd-validation-report-path.test.ts:230-240` 只检查 `changedPaths`、`conflicts` 与report bytes，没有断言 `repair.exitCode === 0` 或成功status。
  - 若 repair 因前置gate失败且未触碰reports，current fixture仍可能假绿；这只能证明“失败后未变”，不能证明 successful repair满足AC7。

- **Impact**
  - AC7/AC9 的 install/update/repair no-migration evidence不闭环；functional behavior目前未被反例推翻，但不能据此关闭Story。

- **Suggestion**
  - 对 repair 显式断言 `exitCode === 0` 与项目既有command-result成功语义；保留每阶段report path/type/bytes、`changedPaths`和`conflicts` assertions。

### 3. [中][P1 / PATCH-EVIDENCE] AC5/AC6 parity 与 negative scan 未覆盖完整同步面和禁止名称

- **Source**：blind + edge；Aggregator 独立复现
- **Location**：`test/prd-validation-report-path.test.ts:246-286`

- **Evidence**
  - Parity test只读取Validate PRD五个active files、`module-help.csv`、两份public docs与SPEC 07 ZH/EN；没有读取本次明确修改的fixture-derived example、Edit PRD、Implementation Readiness与Correct Course downstream discovery。
  - Negative scan只扫描Validate PRD五个files。该producer scope本身合理，但regex只拒绝四种带`*`的旧pattern，并仅拒绝 canonical placeholder 后的数字/`copy` suffix。
  - Aggregator直接将current predicates应用到候选文本，`prd-validate-report.md` 与 `prd-validate-report-{yyyy-MM-dd}-backup.md` 均未命中；包含 `legacy historical` 的同一行即使同时声明active legacy producer，也会被整行跳过。

- **Impact**
  - AC5同步面与AC6“无日期名称、任意suffix active default”没有可执行回归保护；current corpus人工检查大体一致，但未来漂移可保持focused green。

- **Suggestion**
  - Parity inventory纳入fixture example及三个downstream consumers，分别断言canonical exact basename、legacy-only discovery与no-migration语义。
  - Negative scan明确拒绝无日期canonical basename及任意canonical suffix active producer，不仅限数字/`copy`；legacy/historical exemption只豁免精确分类的legacy discovery clause，不得按整行关键词skip。
  - 不得粗暴删除历史patterns；AC6允许并要求精确legacy discovery。

### 4. [高][P1 / PATCH] Downstream historical discovery 未限定 regular/readable/physical PRD owner

- **Source**：edge；Aggregator 扩展核查三个downstream consumers
- **Location**：`assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-edit-prd/references/steps/step-e-01-discovery.md:83-110`；`assets/source/speclite/sdlc-skills/3-solutioning/speclite-check-implementation-readiness/references/steps/step-01-document-discovery.md:84-88`；`assets/source/speclite/sdlc-skills/4-implementation/speclite-correct-course/references/workflow-details.md:70,84`

- **Evidence**
  - 三处active prose均要求enumerate PRD directory并可能load canonical/legacy report，但只按basename/pattern与project-relative path描述候选，没有要求no-follow type classification、readability或dereferenced containment。
  - `validation-report-old.md -> /outside/secret.md` 或指向project内其它owning space的symlink可匹配legacy basename；遵循当前prose的Agent可能follow并把外部/cross-space内容作为validation evidence加载。
  - Validate PRD private `discoverPrdValidationReports()` 使用`Dirent.isFile()`会跳过symlink，但三个downstream没有绑定该operation，且parity fixture也未证明它们共享同一候选资格。

- **Impact**
  - AC5 downstream discovery 与AC7 legacy evidence的read-only边界不完整；可能消费不属于real PRD subject owner的内容，违反既有path-safety/physical-owner原则。

- **Suggestion**
  - 三个downstream统一要求：只将no-follow regular、readable且`realpath`位于real `{planning_artifacts}/prd/` owner内的report作为可消费candidate；symlink、non-file、unreadable与escape不得加载。
  - 使用同一bounded helper或同一fixture contract固化资格即可；不得新增public CLI、dependency或native API。

### 5. [中][P1 / PATCH-EVIDENCE] Completion gate 的 affected matrix 无法按记录重放

- **Source**：auditor；Aggregator 独立确认gate缺少command inventory
- **Location**：`_bmad-output/implementation-artifacts/flow-gates/11-7-standardize-the-prd-validation-report-filename-story-completion-gate.md:41-44`

- **Evidence**
  - Gate声明`11 files / 177 passed / 4 failed`，但未列出11个test files或exact command，无法精确重放该计数。
  - Acceptance Auditor按current relevant 11-file matrix重建得到`197 passed / 4 failed`；四个fail仍全部属于external drawer fixed-count drift，因此没有证据表明新增functional regression，但`177`已不是可核验current truth。
  - 本轮Findings #1-#4也使gate中single-date、downstream parity与lifecycle evidence的PASS陈述不再成立。

- **Impact**
  - Completion gate不能作为current CR closeout evidence；这是evidence provenance/可重放性缺口，不是把drawer drift归入Story functional failure。

- **Suggestion**
  - Findings #1-#4修复并复审后，由Flow Gate owner用exact command inventory与current counts刷新completion gate；保留drawer `4` failures的scope-isolated说明，不得只机械改数字或fixed-count baseline。

## Rejected And Deferred Candidates（驳回与延期候选）

1. **第二次owner检查后仍可能发生OS-level ancestor replacement，因此必须引入native API**：驳回。`executePrdValidationReportOperation()`把initial inspection、受控interposition、commit-time inspection与exclusive `wx` create置于同一bounded operation。Aggregator通过现有hook在commit inspection前替换ancestor，得到`candidate-symlink-escape`且outside target absent；inspection后没有caller-visible hook。不可消除的OS pathname race不等于current contract缺陷，Story也未授权跨平台native directory-FD实现。

2. **Negative scan应禁止所有legacy/historical pattern文本**：驳回。AC6禁止active defaults，但AC7明确要求legacy basenames原位发现；正确边界是精确分类discovery clause，不是删除历史pattern。

3. **`SPEC 07` stable issue或same-day main logic缺失**：驳回。`artifact-path.prd-validation-report-exists`已在ZH/EN registry注册；same/different-content target均由early/commit-time gate阻断，project-relative path、reason、exact manual action与`wx` collision handling均已存在。

4. **Affected `177/4` 与 `197/4` 代表新的functional P1**：驳回该解释。两份结果的4个failure均归于已隔离drawer count drift；有效finding是gate没有exact command inventory且陈述已不current，故归类为`PATCH-EVIDENCE`。

## Acceptance Criteria Matrix（验收标准矩阵）

| AC | Result | Current evidence |
| --- | --- | --- |
| AC1 | PASS | Producer与private operation均构造exact `prd-validate-report-{date}.md`。 |
| AC2 | **FAIL** | Filename使用`{validationInvocationDate}`，但initial/final metadata仍使用`{current_date}`。 |
| AC3 | PASS | Exact default target为`{planning_artifacts}/prd/`。 |
| AC4 | PASS | Canonical Skill ID保持`speclite-validate-prd`。 |
| AC5 | **FAIL** | 日期surface分叉；三个downstream虽已更新basename，但缺候选安全资格，parity test也未纳入它们与fixture example。 |
| AC6 | **FAIL** | Current corpus未见明显active旧default，但negative scan会漏无日期及任意suffix，并可被整行legacy/historical关键词绕过。 |
| AC7 | **FAIL** | Producer legacy preservation行为已有；repair success evidence与downstream safe-load boundary尚未闭环。 |
| AC8 | PASS | Same/different existing target、stable issue、project-relative path、exact action与zero reuse/suffix语义已实现；OS-level race候选驳回。 |
| AC9 | **FAIL** | Focused 7/7未覆盖完整parity/negative matrix，repair fixture可在command failure时假绿。 |
| AC10 | PASS | 未发现validation rules、scoring、report body或IR filename变更。 |

## Verification Summary（验证摘要）

- 三层正式结果：Blind、Edge、Acceptance均完成并均为`FAIL`；执行覆盖`3/3`，无layer failure。
- Aggregator focused复跑：`npm test -- --run test/prd-validation-report-path.test.ts` → `1 file / 7 tests passed`。
- Negative predicate最小复现：无日期`prd-validate-report.md`、任意suffix`prd-validate-report-{yyyy-MM-dd}-backup.md`均漏检；含`legacy historical`的active旧producer行被整行skip。
- Ancestor replacement最小复现：通过current `__testOnlyInterposeBeforeCommit`把`prd/`替换为project外symlink，operation返回`candidate-symlink-escape`，outside report保持absent；临时目录已清理。
- Acceptance Auditor重建affected matrix：`197 passed / 4 failed`；四项均为external drawer fixed-count drift。Gate原`177/4`因无exact command inventory不能重放。
- 按Aggregator约束未运行build、full suite或packaging；未修改external drawer/zip、workspace mirrors、fixed-count baselines或任何非summary文件。

## Governance And Caveats（治理与例外）

- Current canonical source变更触发`canonical-source-truth:D0`与`module-discovery-contract:D0`；hook当前为warning-only且`status=ok / findings=[]`。本轮Aggregator只写CR summary，不替代outer governance runner与final canonical check。
- `speclite-drawer-er-modeler/`及zip仍为外部user-owned变更；相关`core 18→19`、`total 68→69` fixed-count failures保持隔离，不得由11.7 Fixer吸收。
- Story11.7 bounded Fixer不得修改validation rules/scoring/report body、IR filename、Story11.8+、drawer/mirrors/baselines、已完成Stories或CR历史。

## Owner Gate（Owner 门禁）

- **无 Owner decision。** 五项均有唯一bounded方向，可由fresh Evaluator裁决具体授权，不需要产品/架构取舍。

## Conclusion（结论）

- **结论：不通过（FAIL）**
- **阻塞项**：5个P1：single-date metadata、repair success evidence、parity/negative-scan evidence、downstream candidate safety、completion-gate reproducibility。
- **下一步**：进入fresh Evaluator Round 1。Evaluator应分别限定behavior patch与evidence patch；如确认，fresh Fixer只修上述授权项并由Flow Gate owner刷新current completion evidence，再启动fresh Reviewer Round 2。不得引入native filesystem API、public CLI/schema、dependency或新stable issue，也不得修改外部drawer与fixed-count baselines。
