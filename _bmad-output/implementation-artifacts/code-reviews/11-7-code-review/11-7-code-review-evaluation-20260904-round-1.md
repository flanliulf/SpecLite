---
Story: 11-7
Round: 1
Date: 2026-09-04
Model Used: GPT-5.6 (gpt-5.6)
Review Source: 11-7-code-review-summary-20260904-round-1.md
Review Model: GPT-5.5 (gpt-5.5)
Type: Code Review Evaluation
---

## 评估总结

对 Story 11-7 的第 1 轮 CR 代码审查结果（首轮）进行逐条独立评估。审查聚合后的 5 个 P1 均有 current code、active workflow 或 completion evidence 直接支持，且均有唯一 bounded 修复方向；全部确认有效并阻塞交付。本轮不需要 Owner decision，无新增 P2。`artifact-path.prd-validation-report-exists`、exact canonical target、same-day zero-mutation block、exclusive `wx` create 与 current report body preservation 已成立，不在本轮扩大修复。

---

## 发现 #1 评估

### 审查原文

> **[高][P1 / PATCH] Report metadata 仍消费 `{current_date}`，single invocation date 会分叉**
> - 来源：blind + edge + auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

`workflow-details.md:18-24` 已声明一次 invocation 只生成一次 `{validationInvocationDate}`；`step-v-01-discovery.md:66` 也锁定同一值及 `{validationReportPath}`。但初始化 frontmatter 与正文仍在 `step-v-01-discovery.md:163-179` 消费 `{current_date}`，final frontmatter 又在 `step-v-13-report-complete.md:79-89` 消费 `{current_date}`。这构成真实的第二日期源，跨午夜时 filename、initial metadata、body date 与 final metadata 可以分叉，违反 Story AC2、AC5 和 single-invocation hard contract。

**严重性判断：合理**

该缺口直接破坏 automation 用 filename 与 metadata 关联同一次 validation evidence 的可靠性，属于 functional contract blocker。

**修复建议：可行**

唯一 bounded 修复是只保留 activation/Step 1 的一个日期生成点，并把该报告的 filename、initial frontmatter、initial body、final frontmatter及完成输出全部改为消费 `{validationInvocationDate}`。Focused test 必须以两个不同的模拟时钟值覆盖跨午夜语义，证明锁定后的所有 report date surface 保持第一次 invocation date；只验证变量/模板消费，不改 report body 的标题、章节、评分或 validation semantics。

**误报评估：非误报**

Current corpus 中三个 `{current_date}` 命中均位于该报告的 active metadata/body surface，不是历史说明。

---

## 发现 #2 评估

### 审查原文

> **[中][P1 / PATCH-EVIDENCE] Repair no-migration fixture 未证明 repair 命令成功**
> - 来源：blind + edge + auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

`test/prd-validation-report-path.test.ts:168-244` 已正确在 install 之前创建 canonical/legacy reports，并在 install、update、repair 后检查 report bytes；install 与 update 分别在 `:180-185`、`:223-228` 断言 `exitCode === 0`。Repair 在 `:230-240` 只检查 `changedPaths`、`conflicts` 与 bytes，未断言命令成功。Current command contract由 `src/diagnostics/command-result.ts:322-357` 公开 `result.status` 和 `exitCode`；失败且未触碰报告时，现有断言可以假绿。

**严重性判断：合理**

这没有推翻 current repair behavior，却使 AC7/AC9 的 successful repair no-migration evidence 不闭环，属于交付门禁证据缺陷。

**修复建议：可行**

在同一 lifecycle fixture 中对 install、update、repair 三阶段统一断言公开 command outcome：`exitCode === 0`、`result.status === "success"`、对应 command identity，以及 write-authorized/success data discriminator；每阶段随后验证 exact project-relative paths、no-follow regular-file type、bytes/hash 与目录 tree 均未迁移。不得仅检查“未出现在 changedPaths/conflicts”，也不得改 install/update/repair implementation 来迎合测试。

**误报评估：非误报**

Reviewer 指出的 repair assertion 缺失可由 current test 直接确认。

---

## 发现 #3 评估

### 审查原文

> **[中][P1 / PATCH-EVIDENCE] AC5/AC6 parity 与 negative scan 未覆盖完整同步面和禁止名称**
> - 来源：blind + edge
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

`test/prd-validation-report-path.test.ts:246-267` 的 parity inventory 只有 Validate PRD 五个 active files、help、两份 docs 与 `SPEC 07` ZH/EN，未消费 `assets/source/speclite/docs/examples/fixture-derived-examples.md` 及 Edit PRD、Implementation Readiness、Correct Course 三个 downstream。`:269-286` 的 negative scan 只按整行 `legacy|historical` 跳过并只禁止四个带 `*` 的旧 token及数字/`copy` suffix；因此同一行混入 active legacy default 会被整体豁免，无日期 `prd-validate-report.md` 与任意 suffix/counter/backup 也不会被完整拒绝。

**严重性判断：合理**

Story AC5 明确列出 examples 与 downstream discovery，AC6 明确禁止无日期与 suffix active defaults。Current corpus 人工上大体一致，不能替代可回归的 classified evidence。

**修复建议：可行**

在现有 focused test 内建立按文件与语义分类的显式 inventory：producer/metadata/help/contracts/examples 与三类 downstream consumers分别检查。Legacy allowlist 必须是精确的 `file + exact discovery clause/token`，只移除或核验被允许的 historical-discovery fragment，禁止按整行关键词 `continue`。对剩余 active surface 的 regex/token scan 必须拒绝 `prd-validation-report-*`、`prd-validation-*`、`validate-prd-report-*`（以及已声明的 `validation-report-*`）作为 producer default，拒绝无日期 `prd-validate-report.md`，并拒绝 canonical placeholder 后任意 suffix、copy、counter、backup 等变体；同时继续允许精确分类的 legacy discovery 文本。不得粗暴删除历史发现模式。

**误报评估：非误报**

Reviewer 的三个最小反例都能穿过 current predicates，且遗漏文件属于 Story 明示同步面。

---

## 发现 #4 评估

### 审查原文

> **[高][P1 / PATCH] Downstream historical discovery 未限定 regular/readable/physical PRD owner**
> - 来源：edge
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

Edit PRD `step-e-01-discovery.md:83-110`、Implementation Readiness `step-01-document-discovery.md:84-88` 与 Correct Course `workflow-details.md:70,84` 均会枚举并可能加载 canonical/legacy report，但只约束 basename、排序或 no-migration，没有在加载前统一要求 no-follow regular file、readability 与 dereferenced physical PRD-owner containment。匹配 basename 的 symlink 因而可按这些 active instructions 被加载。Validate PRD private helper在 `prd-validation-report-operation.mjs:55-83` 通过 `Dirent.isFile()`跳过目录项 symlink，但三个 downstream 没有绑定该 private helper。

**严重性判断：合理**

该缺口可能让 downstream 将外部或 cross-space 内容当成 PRD validation evidence，违反 AC5/AC7 及既有 physical-owner安全边界，属于 read-path functional blocker。

**修复建议：可行**

三个 downstream 的 active executable prose 应采用同一候选资格：输入路径必须是 portable project-relative path；候选必须存在且经 no-follow 检查为 readable regular file；解析 project、Planning 与 PRD subject 的 real roots 后，candidate `realpath` 必须位于 real `{planning_artifacts}/prd/` owner 内。Symlink、non-file、unreadable、missing、外部 escape 与 project 内 cross-space candidate 均 fail-close、不得加载或解析内容，并记录 project-relative拒绝证据。

本 Story 应选择“同一 active prose contract + 同一 focused parity/negative test”固化三个消费者，不强制它们调用 Validate PRD 私有脚本。后者属于另一个 Skill 的 private package surface，跨 Skill 绑定会新增安装路径耦合；为此新增 public CLI/schema/stable issue或共享 runtime API也超出 Story 11.7。可在现有 private discovery测试中保留/增加 symlink 与 non-file 被排除的证据，但不能用它替代三份 downstream active prose 的约束。

**误报评估：非误报**

这是单层 finding，但三份 active consumer 文档均缺少同一关键资格，且影响是受控的 evidence read boundary，不依赖推测性 OS race。

---

## 发现 #5 评估

### 审查原文

> **[中][P1 / PATCH-EVIDENCE] Completion gate 的 affected matrix 无法按记录重放**
> - 来源：auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

`11-7-standardize-the-prd-validation-report-filename-story-completion-gate.md:41-44` 仅记录 `11 files / 177 passed / 4 failed`，没有列出 exact command 与 11 个 test file inventory。Reviewer基于 current inventory 重建为 `197 passed / 4 failed`；四个 failure 仍是外部 drawer fixed-count drift，所以不能据此声称出现 Story 11.7 functional regression，但原 gate 已不可重放且 Findings #1-#4 使其多项 PASS 陈述失真。

**严重性判断：合理**

Completion gate 是 CR closeout 的 current evidence，缺 exact command/inventory 且计数过时会阻断可审计交付，故为 P1 evidence blocker。

**修复建议：可行**

该项不授权本轮 Fixer直接编辑 gate。Findings #1-#4 修复和 focused/affected验证完成后，由 outer Flow Gate owner刷新同一个 completion gate：写入 exact command、逐个 test file inventory、current pass/fail/todo counts、运行时间/HEAD或worktree evidence，并逐项重判 contract assertions。Drawer 失败必须继续单列为外部范围 caveat，禁止机械改数字、修改 drawer或fixed-count baseline。

**误报评估：非误报**

文件中确实没有可重放 command inventory；`177/4` 与 `197/4` 差异只用于证明记录不current，不被误判为功能失败。

---

## 驳回候选确认

### OS-level pathname race：❌ 误报 — 建议忽略

`prd-validation-report-operation.mjs:27-42` 在一次 bounded operation 内执行 initial inspection、唯一 caller-visible interposition、commit-time inspection 和 exclusive `wx` create；受控 ancestor replacement 可在第二次 inspection 被 fail-close。第二次检查后无 caller seam，剩余内核级 pathname race在 current API 下不可确定复现，Story也没有授权跨平台 native `openat`/directory-FD architecture。维持Reviewer驳回，不形成 P1/P2。

### Stable issue/current producer缺失：❌ 误报 — 建议忽略

`SPEC 07` ZH/EN 已注册 `artifact-path.prd-validation-report-exists`；private operation在 `prd-validation-report-operation.mjs:194-209` 返回stable issue、project-relative target与精确人工动作，并在 `:35-42` 使用exclusive `wx`。Exact producer与same-day block已成立，本轮只修上列缺口。

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | Report metadata仍消费第二日期源 | [高] | **P1** | 所有report date surface必须只消费一次生成的`validationInvocationDate`。 |
| 2 | Repair fixture未证明命令成功 | [中] | **P1** | 需闭合公开command outcome与逐阶段no-migration invariants。 |
| 3 | Parity/negative scan inventory与分类不完整 | [中] | **P1** | 需覆盖完整同步面并以精确legacy clause allowlist替代整行跳过。 |
| 4 | Downstream candidate缺physical-owner安全资格 | [高] | **P1** | 三个consumer必须对regular/readable/real-owner fail-close后才加载。 |
| 5 | Completion gate affected matrix不可重放 | [中] | **P1** | Fixer后由outer Flow Gate owner以exact inventory刷新current evidence。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

无新增 P2。本轮不得把任何 P1 降级为 TODO。

### 可忽略（误报）

| # | 发现 | 原始严重性 | 忽略理由 |
|---|------|----------|---------|
| R1-R1 | 第二次owner检查后的OS-level race需native API | 候选 | Current bounded seam可防受控替换；剩余race不可确定复现且需越界architecture。 |
| R1-R2 | Stable issue或current producer缺失 | 候选 | `SPEC 07`、private operation与exclusive create已经存在。 |

### Fixer 授权边界

Fresh Fixer只获准修改以下文件：

- `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-validate-prd/references/steps/step-v-01-discovery.md`
- `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-validate-prd/references/steps/step-v-13-report-complete.md`
- `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-edit-prd/references/steps/step-e-01-discovery.md`
- `assets/source/speclite/sdlc-skills/3-solutioning/speclite-check-implementation-readiness/references/steps/step-01-document-discovery.md`
- `assets/source/speclite/sdlc-skills/4-implementation/speclite-correct-course/references/workflow-details.md`
- `test/prd-validation-report-path.test.ts`
- 本 evaluation 文档，仅追加 Fix Summary（修复摘要）。

若 focused test 对private discovery安全行为暴露真实缺口，可在不改变CLI/schema的前提下额外修改 `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-validate-prd/scripts/prd-validation-report-operation.mjs`；若现有`Dirent.isFile()`证据已满足，则不得无理由改动该脚本。不得修改 report body语义、validation rules/scoring、`SPEC 07` issue taxonomy、public CLI/schema、dependencies、Story/tracker、completion gate、Story 11.8+、external drawer/zip、workspace mirrors、fixed-count baselines或历史CR产物。

Fixer必须先运行focused test并记录当前失败，再实施：跨午夜single-date assertion；install/update/repair公开成功语义及每阶段path/type/bytes/hash/tree invariants；完整classified parity/negative inventory；三个downstream统一候选资格及symlink/non-file/unreadable/escape fail-close contract。修复后只运行focused test、精确相关测试与`git diff --check`；不得运行build/full/packaging。Completion gate由outer Flow Gate owner在修复验证后单独刷新。

### 评估决定

- **发现 #1（single invocation date分叉）**：确认P1，按唯一single-source方案修复，无Owner gate。
- **发现 #2（repair success evidence）**：确认P1，只补公开成功语义和逐阶段no-migration证据。
- **发现 #3（parity/negative scan缺口）**：确认P1，采用精确file/clause分类，不允许整行豁免。
- **发现 #4（downstream candidate safety）**：确认P1，采用active prose + shared focused test，不新增public runtime surface。
- **发现 #5（completion gate不可重放）**：确认P1，由outer Flow Gate owner在Fixer完成后刷新，不纳入Fixer文件修改。
- **Owner Gate**：`NONE`。所有repair与containment策略均已唯一化。
- **整体决定**：`FAIL`。完成上述修复、刷新completion gate并通过fresh Reviewer/Evaluator双重确认前，不得进入CR04/CR05/CR06。

## 修复执行记录

### 修复执行记录

- **Date**: 2026-09-04
- **Model Used**: GPT-5.6 (gpt-5.6)
- **Fix Items**: 4

#### Fix #1：single invocation date

- 将 Validate PRD Step 1 initial frontmatter 与正文日期、Step 13 final frontmatter 日期全部改为消费 `{validationInvocationDate}`；filename/create/probe/完成输出继续消费 invocation 锁定的 `{validationReportPath}`，未改 report 标题、章节、评分或 validation semantics。
- Focused test 使用 activation `2026-07-21` 与跨午夜 later clock `2026-07-22` 渲染 active templates，验证 initial/final metadata、initial body、private operation `--date` 与 completion path 均保持首次 invocation date，且 active Step 1/13 不再出现 `{current_date}`。

#### Fix #2：install/update/repair no-migration evidence

- Lifecycle fixture 保持 legacy/canonical reports 在 install 前存在，并对 install、update、repair 各阶段统一断言 `exitCode === 0`、`result.status === "success"`、精确 command identity 与 write-authorized discriminator。
- 每阶段均验证报告的 exact project-relative locations、no-follow regular-file type、readability、raw bytes、SHA-256、PRD owner tree 与全项目同 basename location inventory 不变；repair fixture显式制造一个 installer-owned mirror 缺失以证明 authorized repair 确实执行成功，同时验证其恢复 hash。

#### Fix #3：classified parity 与 negative inventory

- Focused inventory 覆盖 Validate PRD ZH/EN metadata、workflow、全部 active steps、module help、两份公开 docs、`SPEC 07` ZH/EN、fixture-derived example，以及 Edit PRD、Implementation Readiness、Correct Course 三个 downstream consumers。
- Legacy compatibility 改为 `file + exact clause` allowlist，仅移除三处明确 historical-discovery clause 后扫描剩余 active surface；拒绝四类旧 producer pattern、无日期 canonical 与 canonical placeholder 后任意 suffix/copy/counter/backup 变体，不再按含 `legacy|historical` 的整行跳过。

#### Fix #4：downstream physical PRD-owner fail-close

- Edit PRD、Implementation Readiness、Correct Course 三份 active executable prose 绑定同一候选资格：portable project-relative、exists/readable、no-follow regular non-symlink、real project/Planning/PRD owner 与 candidate realpath containment。
- 明确 symlink、non-file、unreadable、missing、external escape 与 project-internal cross-space 全部在加载/解析前 fail-close，并记录 project-relative rejection evidence；shared focused assertion要求三处文本完全一致并逐项包含所有拒绝条件。
- Focused 未暴露 Validate PRD private discovery 行为缺口，因此按授权未修改 `prd-validation-report-operation.mjs`，也未新增 public CLI/schema/runtime surface。

#### Verification（验证）

- 修复前：`npx vitest run test/prd-validation-report-path.test.ts` → `1 file / 7 passed / 0 failed`；这证明旧 focused suite 未编码本轮 Findings，而不是证明 Findings 已关闭。
- 修复后 focused：`npx vitest run test/prd-validation-report-path.test.ts` → `1 file / 8 passed / 0 failed`。
- 精确相关测试：`npx vitest run test/prd-validation-report-path.test.ts test/update-command.test.ts test/update-planning.test.ts` → `3 files / 51 passed / 0 failed`。
- `git diff --check`（六个授权 active/test 文件）通过；未运行 build、full suite 或 packaging。
- Scope audit：源码/文档修改仅限 evaluation 授权的五个 active workflow 文件与 `test/prd-validation-report-path.test.ts`，另仅向本 evaluation 追加本记录；未修改 Story、tracker、completion gate、`SPEC 07`、report body语义、rules/scoring、private operation、public CLI/schema、dependencies、Story 11.8+、drawer/mirrors/baselines或其他 CR 产物。
- **Owner Gate**: `NONE`。Findings #1-#4 已按唯一 bounded 方案完成；Finding #5仍由 outer Flow Gate owner 刷新 completion gate。
