---
Story: 11-7
Round: 2
Date: 2026-09-04
Model Used: GPT-5.6 (gpt-5.6)
Type: Code Review Summary
---

## Review Conclusion（审查结论）

Blind Hunter、Edge Case Hunter、Acceptance Auditor 三层正式结果均成功返回（`3/3`，无降级），且均为 **FAIL**。Aggregator 完整复核 Story、Round 1 summary/evaluation/fix record、current Validate PRD producer与全部 active steps、三个 downstream consumers、focused fixture和已刷新的 completion gate，并对变量绑定、physical owner chain、negative classifier与legacy lifecycle做了独立重放。

去重后确认 **5 个 P1 blocking findings**：

1. Step 2–13 frontmatter 的 `{validation_report_path}` 没有producer或到invocation-locked `{validationReportPath}` 的显式binding，属于一个path-state断链；
2. 三个downstream只约束candidate位于`realPrdOwner`，没有先证明`realPlanning`属于`realProject`且`realPrdOwner`是该Planning root下受控的exact `prd/` owner；
3. classified negative scan使用ASCII字符集和非完整token匹配，可被Unicode、空格、括号、`${date}`及`.md`后的二次suffix绕过；
4. install/update/repair lifecycle fixture只snapshot了五类legacy family中的两类，不能证明AC7对完整历史命名集合成立；
5. AC5 active-surface inventory遗漏`customize.toml`、`config.toml.example`和真正执行写入的private producer script，当前“every active producer/consumer”断言名不副实。

Findings #3与#5不合并：#3是**已扫描文本仍可被错误分类**的算法缺陷；#5是**正确分类器也永远看不到未纳入文件**的语料边界缺陷。Findings #4也不与它们合并，因为它验证的是install/update/repair对真实文件集合的mutation invariant，而不是静态文本分类。

Round 1 的single-invocation date、repair command success与completion-gate exact inventory均已由current source/test/gate关闭；本轮没有证据推翻，不重新列为finding。Focused suite当前为`1 file / 8 tests passed`，但其green恰好证明上述未编码边界可以漏检，不能作为第二轮PASS证据。

本轮无P2、无Owner decision。总体结论为 **FAIL**；不得进入CR04、CR05或CR06，应先由fresh Evaluator Round 2逐项裁决5个bounded P1。

## Layer Results（三层结果）

| Layer | Execution | Formal result | Aggregated result |
| --- | --- | --- | --- |
| Blind Hunter | PASS | `FAIL` | path-state、negative classifier、legacy/inventory evidence候选成立并完成去重。 |
| Edge Case Hunter | PASS | `FAIL` | physical owner-root chain与多种negative-scan绕过成立；与其他层重叠项已合并。 |
| Acceptance Auditor | PASS | `FAIL` | AC5/AC6/AC7的active surface、path continuity与完整legacy lifecycle覆盖不足成立。 |

## Findings（发现）

### 1. [高][P1 / PATCH] Step 2–13 的report path frontmatter没有消费invocation-locked path state

- **Source**：三层候选去重；Aggregator独立确认
- **Location**：`assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-validate-prd/references/steps/step-v-02-format-detection.md:6`；`step-v-02b-parity-check.md:5`；`step-v-03-density-validation.md:5`至`step-v-13-report-complete.md:3`的同类frontmatter

- **Evidence**
  - Step 1仅生成并锁定camelCase runtime state `{validationReportPath}`；`workflow-details.md`也只定义该变量，并要求后续steps消费同一锁定值。
  - Step 2–13共13个step frontmatter却将`validationReportPath`声明为`'{validation_report_path}'`。
  - 对整个canonical Validate PRD package搜索，`validation_report_path`只出现在这些frontmatter value；没有producer、alias、normalization rule或从`{validationReportPath}`到该snake_case token的binding。
  - Step 13正文要求读取`{validationReportPath}`，但其frontmatter注入的value仍是未解析的`{validation_report_path}`，因此不能证明后续step真实继承Step 1锁定的exact target。

- **Impact**
  - 违反AC3、AC5、AC8及single-invocation path hard contract。运行agent可能保留unresolved token、重新推导路径或读取错误report；现有测试只检查Step 13正文包含camelCase变量，没有检查全step path-state continuity。

- **Suggestion**
  - 将Step 2–13的frontmatter value统一绑定为exact invocation state `'{validationReportPath}'`，并在Step 1→Step 2 handoff明确该值不可重算或替换。
  - Focused test动态枚举全部active step，要求每个使用report path的frontmatter只消费`{validationReportPath}`，并拒绝任何`{validation_report_path}`残留。

### 2. [高][P1 / PATCH] Downstream containment接受未经验证的Planning/PRD physical owner chain

- **Source**：三层中的filesystem-boundary候选合并；Aggregator独立确认
- **Location**：`assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-edit-prd/references/steps/step-e-01-discovery.md:89`；`assets/source/speclite/sdlc-skills/3-solutioning/speclite-check-implementation-readiness/references/steps/step-01-document-discovery.md:88`；`assets/source/speclite/sdlc-skills/4-implementation/speclite-correct-course/references/workflow-details.md:86`；`test/prd-validation-report-path.test.ts:44,402-420`

- **Evidence**
  - 三份active prose和共享test string只说解析`real project root`、`real Planning root`、`real PRD owner`，随后仅断言candidate `realpath`位于`realPrdOwner`。
  - 它们没有要求`realPlanning`与`realProject`满足same-or-descendant，也没有要求`realPrdOwner`由受控`realPlanning/prd`解析并仍位于`realPlanning`。
  - 因此，若logical Planning root本身是指向project外部的symlink，或logical `prd/`是指向project内其它owning space/外部的symlink，只要candidate落在该错误的`realPrdOwner`内，current final containment仍会通过。
  - Round 1增加的test只做字符串存在性断言，没有构造Planning-root escape与PRD-owner cross-space反例。

- **Impact**
  - 违反AC5/AC7的read-only evidence ownership boundary；downstream可能把project外部或其它artifact subject的内容作为PRD validation evidence加载。这个缺口位于owner-root trust chain，不是Round 1已经处理的candidate自身symlink检查。

- **Suggestion**
  - 三个consumer必须按同一顺序fail-close：`realProject`为目录；`realPlanning`为目录且same-or-descendant于`realProject`；`realPrdOwner`必须是logical `planning/prd`解析出的目录且same-or-descendant于`realPlanning`；最后candidate为no-follow regular/readable non-symlink且`realpath`位于该`realPrdOwner`。
  - 增加共享fixture/contract assertions，至少覆盖Planning symlink escape、PRD owner external escape、project-internal cross-space和正常owner chain；不新增public CLI、schema或native filesystem API。

### 3. [中][P1 / PATCH-EVIDENCE] Negative scan不是完整basename/token分类器，存在系统性绕过

- **Source**：blind + edge候选合并；Aggregator独立复现
- **Location**：`test/prd-validation-report-path.test.ts:380-399`

- **Evidence**
  - 旧名称regex和canonical candidate regex都限制为ASCII `[A-Za-z0-9{}*._-]+`，canonical匹配也没有对完整token/basename做end anchoring。
  - Aggregator按current predicates复现，以下active default均不会导致test失败：
    - `prd-validate-report-{yyyy-MM-dd}-备份.md`
    - `prd-validate-report-{yyyy-MM-dd}-backup copy.md`
    - `prd-validate-report-{yyyy-MM-dd}-(copy).md`
    - `prd-validate-report-${date}.md`
    - `prd-validate-report-{yyyy-MM-dd}.md.bak`
    - `prd-validate-report-{yyyy-MM-dd}.md-1`
    - `prd-validation-report-旧.md`与`validation-report-旧.md`
  - 对`.md.bak`和`.md-1`，current scanner只提取内部允许串`prd-validate-report-{yyyy-MM-dd}.md`，把后续字符遗留在匹配之外，因而假绿。
  - Current focused `8/8`进一步证明这些classifier blind spots尚未编码。

- **Impact**
  - AC6要求排除旧pattern、无日期名称和suffix behavior，不限ASCII或少数copy/counter形式。当前证据允许active producer通过Unicode、分隔符或二次扩展恢复被禁止的命名。

- **Suggestion**
  - 先从Markdown/TOML/CSV active text中提取完整、带边界的basename-like token，再对整个token分类；canonical producer allowlist只能接受exact `prd-validate-report-{yyyy-MM-dd}.md`及明确fixture literal。
  - 任何包含受管prefix但whole-token不在allowlist的值均拒绝，包括Unicode、whitespace、parentheses、`${date}`、`.md.bak`、`.md-1`；legacy exemption仍只移除精确`file + clause` historical fragment，不得扩大为整行或整文件豁免。

### 4. [中][P1 / PATCH-EVIDENCE] Lifecycle snapshot只覆盖两类legacy family，未证明AC7完整集合

- **Source**：acceptance/lifecycle候选；Aggregator独立确认
- **Location**：`test/prd-validation-report-path.test.ts:182-288`；`assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-validate-prd/scripts/prd-validation-report-operation.mjs:11-16`

- **Evidence**
  - Private discovery与三个downstream共同承认五类legacy basename family：`validation-report-*.md`、`prd-validation-report-*.md`、`prd-validation-*.md`、`validate-prd-report-*.md`、undated `prd-validation-report.md`。
  - Lifecycle fixture的`names`只有`validation-report-old.md`、`prd-validation-report-2025-01-01.md`和一个canonical report。
  - 因而`prd-validation-*.md`、`validate-prd-report-*.md`及undated `prd-validation-report.md`未经过install、update、repair三阶段的path/type/bytes/hash/tree snapshot。
  - 首个create/discovery test虽创建五类legacy并验证一次operation preservation，但它不运行install/update/repair，不能替代AC7 lifecycle证据。

- **Impact**
  - 违反AC7/AC9。Current fixture只能证明两类legacy family的installer lifecycle不迁移，无法支持Story/Completion Gate对“legacy reports”全称集合的结论。

- **Suggestion**
  - Lifecycle fixture使用与private discovery/consumer contract同源的完整五类legacy corpus，并保留canonical control；在install前创建全部文件，在install/update/repair每一阶段继续断言command success及path/type/bytes/hash/tree不变。
  - 不改变installer行为，也不把legacy名称变成producer default。

### 5. [中][P1 / PATCH-EVIDENCE] AC5 inventory遗漏active customization/config与真正producer surface

- **Source**：acceptance/parity候选；Aggregator独立确认
- **Location**：`test/prd-validation-report-path.test.ts:322-379`；`assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-validate-prd/customize.toml:36-45`；`config.toml.example:1-13`；`scripts/prd-validation-report-operation.mjs:8-15,85-102`

- **Evidence**
  - 名为“every active producer, consumer, help, contract and example surface”的inventory动态纳入steps，并列入ZH/EN Skill、workflow、help、docs、SPEC、example与三个downstream。
  - 它没有纳入本Story实际修改且参与runtime customization merge的`customize.toml`；该文件已公开exact canonical target和Step 13 lifecycle。
  - 它没有纳入发布给用户的`config.toml.example`，因此不能证明配置结构参考与新filename/path contract无冲突或旧default。
  - 更关键的是，它没有纳入真正派生target并执行exclusive create的`prd-validation-report-operation.mjs`；当前测试通过行为用例间接覆盖部分producer逻辑，但“完整classified active surface”断言并未约束该文件的producer/legacy token分类。
  - `CHANGELOG.md`是历史记录，不属于active execution surface；不要求把历史文本纳入negative producer scan。Packaging manifests是inventory/hash证据，也不需要按文档basename scanner处理。

- **Impact**
  - 违反AC5/AC6的完整同步与可回归证据；active customization或private producer发生命名漂移时，当前parity/negative inventory仍可能保持green。

- **Suggestion**
  - 将`customize.toml`、`config.toml.example`与private operation script加入显式分类inventory；按surface role分别断言，而不是对所有文件套同一个regex。
  - `customize.toml`核验exact on-complete target，`config.toml.example`核验无filename override/legacy fallback，private script核验exact canonical derivation、calendar validation及五类legacy仅用于discovery；对script中的合法legacy regex使用精确位置/role allowlist。

## Closed Round 1 Findings（第一轮已关闭项）

### A. Single-invocation date surfaces：已关闭，不重开

- Step 1 initial frontmatter/body与Step 13 final frontmatter均消费`{validationInvocationDate}`；active Step 1/13已无`{current_date}`。
- Focused跨午夜fixture把activation date设为`2026-07-21`、later clock设为`2026-07-22`，并断言所有report date surface保持首次日期。

### B. Repair command success evidence：已关闭，不重开

- Lifecycle fixture现已显式断言repair `exitCode === 0`、`result.status === "success"`、`command === "update.repair"`、`writeAuthorized === true`，并通过删除installer-owned mirror证明repair确实执行。
- Round 2 Finding #4只指出legacy family集合不完整，不否定repair success闭环。

### C. Completion gate exact command/inventory：已关闭，不重开

- Current completion gate已记录exact 11-file command、逐项inventory及current `223 passed / 4 failed`。
- 四项failure继续全部归因于范围外drawer fixed-count drift；本轮不修改drawer、zip或fixed-count baseline。

## Rejected And Deferred Candidates（驳回与延期候选）

1. **把Findings #3与#5合成一个“test不完整”**：驳回。一个是classifier对已扫描输入的false negative，一个是source inventory遗漏；修复任意一项都不能关闭另一项。
2. **把首个五类legacy create/discovery test视为AC7 install/update/repair证据**：驳回。它没有调用任何installer lifecycle command，不能证明三阶段zero-migration。
3. **仅要求candidate位于任意`realPrdOwner`即可证明安全**：驳回。若owner root本身由symlink逃逸或跨space，candidate containment是相对于错误trust root的真命题。
4. **重新打开Round 1 date、repair success或gate inventory**：驳回。Current source、focused assertions与completion gate均已有直接证据；没有新反例推翻。
5. **P2 / TODO**：无。本轮五项均直接影响Story 11.7 AC或其交付证据，不应降级；也没有独立的非阻塞改进项。
6. **Owner decision**：`NONE`。五项均有唯一bounded修复方向，不涉及产品语义或architecture选择。

## Acceptance Criteria Mapping（验收标准映射）

| AC | Round 2 status | Evidence |
| --- | --- | --- |
| AC1 exact basename | `BLOCKED` | Producer行为本身仍生成exact basename，但Findings #3/#5使negative与active producer parity证据不完整。 |
| AC2 runtime date | `PASS` | Round 1 single-date fix仍成立，无新反例。 |
| AC3 complete default path | `BLOCKED` | Finding #1使Step 2–13不能证明继承invocation-locked path。 |
| AC4 Skill ID | `PASS` | ZH/EN仍为`speclite-validate-prd`。 |
| AC5 synchronized surfaces | `BLOCKED` | Findings #1、#2、#5分别阻断step path continuity、downstream owner chain与active inventory。 |
| AC6 negative scan | `BLOCKED` | Finding #3存在多类确定性false negative；Finding #5遗漏producer/config surfaces。 |
| AC7 legacy no-migration | `BLOCKED` | Finding #4未覆盖完整五类legacy lifecycle；Finding #2使downstream owner trust chain不完整。 |
| AC8 same-day read-only block | `BLOCKED` | Private operation仍满足block/zero mutation，但Finding #1使后续step exact path state未闭合。 |
| AC9 fixtures | `BLOCKED` | Findings #1–#5均暴露focused fixture未编码的必要分支或surface。 |
| AC10 scope exclusions | `PASS` | 未发现rules/scoring/report body或IR filename被修改。 |

## Verification（验证）

- `npx vitest run test/prd-validation-report-path.test.ts` → `1 file / 8 passed / 0 failed`；结果仅代表current suite状态，不关闭其未覆盖边界。
- Aggregator以current regex predicates直接复现8类negative-scan bypass：Unicode、space、parentheses、`${date}`、`.md.bak`、`.md-1`及两类Unicode legacy basename。
- Package-wide token search确认`validation_report_path`仅见于Step 2–13 frontmatter，无producer或alias；camelCase `{validationReportPath}`由Step 1锁定并被workflow正文消费。
- Static chain audit确认三个downstream contract缺少`realPlanning within realProject`与`realPrdOwner controlled under realPlanning`两级关系。
- Lifecycle corpus audit确认五类legacy family中仅两类进入install/update/repair snapshot。
- 未运行build、full suite或packaging；未修改外部drawer/zip、workspace mirrors、fixed-count baselines或任何指定summary之外的文件。

## Conclusion（结论）

- **结论：不通过（FAIL）**
- **Layer completeness：`3/3`**
- **阻塞项：5个P1**：path-state binding、physical owner-root chain、complete negative token classification、full five-family lifecycle、AC5 active-surface inventory。
- **P2：0**
- **误报/已关闭：Round 1 date、repair success、completion-gate inventory不重开；其它重叠候选按上述理由驳回。**
- **Owner Gate：`NONE`**
- **下一步**：进入fresh Evaluator Round 2。Evaluator应限定每项最小修复文件与验证边界；确认后由fresh Fixer只处理授权P1，再启动fresh Reviewer Round 3。不得新增public CLI/schema/dependency/stable issue，不得修改Story/tracker、external drawer/zip、workspace mirrors或fixed-count baselines。
