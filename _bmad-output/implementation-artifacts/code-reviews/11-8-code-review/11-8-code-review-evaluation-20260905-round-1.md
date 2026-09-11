---
Story: 11-8
Round: 1
Date: 2026-09-05
Model Used: GPT-5.6 (gpt-5.6)
Review Source: 11-8-code-review-summary-20260905-round-1.md
Review Model: GPT-5.6 (gpt-5.6)
Type: Code Review Evaluation
---

## 评估总结

对 Story 11-8 的第 1 轮 CR 代码审查结果（首轮）进行逐条独立评估。聚合后的 6 个 P1 均可由 current Story、kickoff 锁定选择、SPEC 04/07/09、生产代码和测试直接证实；全部确认有效并阻塞交付，0 个降级、0 个误报、0 个新增 P2。Finding #2、#3、#5 的原建议存在可收紧处：Solutioning resolver 失败必须 HALT 而非保留第三 fallback；old ID 必须执行 kickoff 已选定的 deterministic redirect 而非重新开放 deprecation 选择；scan 只覆盖 kickoff 冻结域及 Story 明列 release manifest，不扩展到 Story 11.10 的 generic grill inventory。Owner Gate 为 `NONE`。

---

## 发现 #1 评估

### 审查原文

> **[高][P1 / PATCH-CODE] Phase coverage projection 的必填参数未传入，current DTS/type gate不可重现**
> - 来源：edge
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

`src/ide/target-writer.ts:260-265` 调用 `createMappedTargetProjection()` 时只传入 `targetId`、`canonicalSkillId` 与 `mapped`；`:310-315` 的 input type 却新增必填 `renamedFromCanonicalSkillIds`。该字段未在函数体 `:316-329` 消费，rename metadata 已在 skill-index projection `:222-225` 独立承载，因此这是 Story 11.8 直接引入的错误层级参数，而不是缺少 phase schema 扩展。

**严重性判断：合理**

必填参数缺失产生确定性 `TS2345`，使 current DTS/type evidence 与 completion gate 的 passed 声明不一致，属于交付阻塞。

**修复建议：可行**

唯一 bounded 修复是删除 `createMappedTargetProjection` input type 中未消费的 `renamedFromCanonicalSkillIds`，不得向 `PhaseCoverageRow` 引入新的 rename schema，也不得仅在调用点补一个仍不消费的参数。RED/GREEN 以 current `TS2345` 的存在/消失和现有 IDE projection focused tests 为证据。

**误报评估：非误报**

Signature/call mismatch 可由 current source 静态确认。

---

## 发现 #2 评估

### 审查原文

> **[高][P1 / PATCH-CONTRACT] Readiness route truth在Grill producer、record spec与current docs之间分叉**
> - 来源：blind + edge + auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

Story AC3 在 `11-8-rename-and-relocate-implementation-readiness-skills.md:15` 锁定两个 Skills 共用 `{solutioning_artifacts}/implementation-readiness-report/grill-consistency/`；kickoff `:29-31,48` 又明确要求消费 SPEC 09 resolver 与既有 `legacy-compatible` root。Grill workflow `references/workflow.md:48-66` 和 record spec `references/record-output-spec.md:3-25` 仍硬编码默认 `_speclite-output/3-solutioning-artifacts/...`，并允许 unresolved root 写入 `.specskills/output/...`。这与 SPEC 09 `:62-69` 的 resolver-only contract 相冲突。

公开文档也未闭合：`docs/reference/skills/sdlc-workflows.md:70` 仍把 readiness check 输出写为 `{planning_artifacts}`；`docs/reference/workflow-artifact-layout.md:87` 发布 `module.yaml` 未预创建的 `implementation-readiness/` 目录，`:91,165` 使用非 exact `{date}`，而 Story AC4 要求 `{yyyy-MM-dd}`。

**严重性判断：合理**

这些是 active producer 与 current public guidance 的 route truth 分叉，会让 explicit custom、fresh default 与 legacy-compatible existing 项目产生不同定位，直接违反 AC3、AC4、AC10。

**修复建议：可行**

修复必须统一为 resolver-provided `{solutioning_artifacts}` + fixed child；resolver block/error 时 HALT、zero write，不允许 `.specskills/output` 第三 root。现有 legacy-compatible root由 resolver 提供，不能在 Skill 内手写 fallback。两份 D1 docs 同步为同一 placeholder、module 真实预创建目录和 exact `implementation-readiness-report-{yyyy-MM-dd}.md`；Grill 的 `summary.md`、`PLAN.md`、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md` 不得改名。Focused RED/GREEN 应覆盖 explicit custom、legacy-compatible 与 resolver failure 三种 route contract，以及两份 docs 的 exact parity。

**误报评估：非误报**

三层独立命中，且冲突文本均位于 current executable guidance 或 D1 current docs。

---

## 发现 #3 评估

### 审查原文

> **[高][P1 / PATCH-CODE+BEHAVIOR] Old-ID redirect没有接入真实activation，clean update后仍形成双active identity**
> - 来源：blind + edge + auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

`src/modules/module-metadata.ts:105-120` 的 `resolveCanonicalSkillIdentity()` 能返回 redirect resolution，但 production consumer search 表明它只在 `src/update/update-plan.ts:957-975` 用于 installed ownership/reprojection。`test/implementation-readiness-rename-routing.test.ts:66-80` 直接测试 helper，不经过 IDE directory activation。对 hash-clean old package，`src/update/update-plan.ts:188-201` 生成 `action=skip, reason=canonical-skill-renamed`；apply 在 `:1206-1223` 只注册 precondition 后跳过，因此 old `.agents/.claude/skills/<old-id>/SKILL.md` 仍保留旧可执行正文，同时新 active package被创建。

**严重性判断：合理**

SPEC 04 `:277-284` 禁止恢复第二 active identity，并要求 existing install 识别 old ID 时 redirect 或稳定 deprecation。Kickoff `:31,47` 已明确选择“activation redirect、no deprecation issue”，所以 current clean update不满足 AC7。

**修复建议：可行**

唯一 bounded 路径是 existing clean old package 的 deterministic redirect：update 在验证 files-index ownership/hash/type/mode precondition后，把旧入口 `SKILL.md` 转为只指向唯一 `replacementCanonicalSkillId` 的最小 redirect entry，同时投影 active package；不得复制 active implementation形成 alias，不得删除旧入口，不得覆盖或改写 drifted old package，也不得新增 public CLI/schema/stable issue。因为 SpecLite 没有控制 IDE 的外部目录发现器，把 helper 接入不存在的统一运行时 activation dispatcher 不是本 Story 的可执行方案。

Focused RED/GREEN 必须参数化两个 old IDs 与 `.agents`/`.claude` 两个 targets，执行 `yes: true` clean update，证明 old request只加载 redirect entry、replacement唯一、active package与indexes一致、fresh install仍无old package；modified old package仍返回既有 redaction-safe conflict并零写入。

**误报评估：非误报**

Current helper 与真实 IDE directory activation之间没有 consumer chain，clean update后的双入口可由代码路径确定。

---

## 发现 #4 评估

### 审查原文

> **[中][P1 / PATCH-EVIDENCE] Rename update未执行authorized apply，也未覆盖old package的commit-time precondition race**
> - 来源：edge
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

`test/update-planning.test.ts:397-424` 的 clean 与 drifted 两次 `runUpdateCommand()` 均未传 `options.yes: true`；第一轮只检查 dry plan，第二轮是在人工改写后重新 planning。该测试没有进入 `applyUpdateActions()`，也没有验证同一 plan-to-commit 窗口中的 old path drift。生产 transaction在 `src/fs/update-transaction.ts:87-97` 已对 hash、executable、non-file 与 missing fail-close，update在 `src/update/update-plan.ts:1211-1222` 也确实为 `canonical-skill-renamed` skip注册 precondition，但本 Story 没有相应集成证据。

**严重性判断：合理**

该问题不证明 transaction 实现错误，但 AC7/AC10 与 completion gate宣称的 authorized apply、old protection和zero partial write都缺少 Story-specific可重放证据，仍是 evidence blocker。

**修复建议：可行**

与 Finding #3 合并执行测试修复，但不得改 `src/fs/update-transaction.ts`。先证明 clean `yes: true` update 的 old redirect/new active/index最终状态；再用现有 `applyRecoverableUpdateTransaction` precondition contract覆盖 old entry在commit前发生 content hash、executable bit、non-file/type与missing四类变化，分别断言 stable `precondition-changed` 或 `precondition-read-failed`、`changedPaths=[]`、目标与indexes无partial write、无残留 journal。测试只消费既有 transaction API，不新增 test-only production seam。

**误报评估：非误报**

Generic transaction代码存在不等于 Story rename integration已经执行；current rename test确实从未授权apply。

---

## 发现 #5 评估

### 审查原文

> **[高][P1 / PATCH-EVIDENCE] Exact classified scan漏域且无逐match ledger，active residual可false-green**
> - 来源：blind + edge + auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

Kickoff `:41-43` 冻结 roots、四类 role和逐条分类要求；Story AC6、AC9、AC10在 `:18-22` 要求 tests、generated fresh-install state、hooks/scripts和每个match闭环。Current test `test/implementation-readiness-rename-routing.test.ts:113-143` 仅扫描 canonical source、`src`、`docs` 与 root `README.md`，漏掉整个 `test/`；`:168-183` 又按有限扩展名过滤。Fixture `bounded-surfaces.json:42-43` 的 allowed roles完全未消费，也没有逐match locator/role/rationale。Current old-ID matches实际存在于 update test、focused test、fixture和fresh skill-index snapshot，却都未进入现有分类断言。

**严重性判断：合理**

现有测试只能证明少数目录没有非module old ID，无法支持“100% classification”和active zero residual，属于AC6/AC9的核心门禁失效。

**修复建议：可行但须收紧范围**

采用 deterministic candidate-scan：只扫描 kickoff 冻结的 `assets/source/speclite/`、`src/`、`test/`、active `docs/`、root `README.md`，并纳入 Story File List 明列的 exact `release/packaging-manifest.json`；继续排除 `_bmad-output`、`assets/source/speclite/docs/legacy/`、`dist/`、external drawer/zip。遍历必须 no-follow，对每个候选用 raw bytes 搜索两个old IDs、`{planning_artifacts}/ir-grill`、`/ir-grill/`及其冻结default/resolved variants，不再依赖扩展名allowlist；scan error、unexpected symlink/non-file、重复或未分类match均fail-close。

Fixture必须记录每个match的 `path + token/variant + occurrence locator + role + rationale`，actual与ledger双向exact equality；role只允许 `compatibility-mapping`、`legacy-documentation`、`regression-fixture`，任何active role命中为零。不得扩展到Story 11.10的generic grill terms、全仓archive/history或未列目录。

**误报评估：非误报**

Reviewer所列已知漏扫match在current tree可直接重放；收紧的是建议边界，不是finding有效性。

---

## 发现 #6 评估

### 审查原文

> **[中][P1 / PATCH-EVIDENCE] Legacy discovery/preservation只有prose assertion，没有行为fixture**
> - 来源：auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

`test/implementation-readiness-rename-routing.test.ts:145-165` 只读取两份Markdown并匹配 legacy/read-only/no-migration措辞，没有创建legacy artifact，也没有验证可发现候选。`test/update-planning.test.ts:362-428` 只构造一个old `.agents` package，未包含legacy readiness tree，因而没有覆盖install/update/repair前后的path、no-follow type、bytes/hash/tree或plan/changed/deleted/migrated交集。

**严重性判断：合理**

Story AC8和AC10明确要求 legacy artifact原位可发现及测试覆盖；prose存在不能证明write-capable lifecycle保持原位，属于交付证据缺口。

**修复建议：可行**

在focused test的temp project中建立代表性 `{planning_artifacts}/ir-grill/` reports/tree，依据两个 active Skill的exact legacy candidate clauses证明候选被识别，同时执行与本Story相关的 install/update/repair lifecycle；逐阶段断言 project-relative path、no-follow regular-file type、raw bytes、SHA-256与tree不变，并断言 plan/issues/changed/deleted/migrated paths与legacy集合交集为空。不得为测试发明新的public discovery CLI或修改SPEC 09；Skill-driven discovery用exact executable prose + fixture candidate证据，write preservation用真实commands闭环。

**误报评估：非误报**

Current test名称声称 discovery，但实现仅验证文案，验收证据明显低于AC8/AC10。

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | Phase projection必填参数与调用不一致 | [高] | **P1** | 删除错误层级的未消费参数，恢复current type gate。 |
| 2 | Grill producer/spec/current docs route分叉 | [高] | **P1** | 统一resolver-backed Solutioning fixed child并删除第三fallback。 |
| 3 | Old-ID redirect未进入真实existing activation | [高] | **P1** | clean old入口必须变为唯一active replacement的deterministic redirect。 |
| 4 | Rename authorized apply与precondition证据缺失 | [中] | **P1** | 补clean apply及四类commit-time drift零partial-write证据。 |
| 5 | Classified exact scan漏域且无逐match ledger | [高] | **P1** | 按冻结候选域做raw-byte/no-follow双向exact分类。 |
| 6 | Legacy discovery/preservation只有prose | [中] | **P1** | 以真实legacy tree和install/update/repair invariants闭环。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

无新增 P2。本轮不得把任何确认P1降级为TODO。

### 可忽略（误报）

无。三层重复项已正确按root cause合并；本Evaluator仅收紧修复方案，不驳回finding。

### Fixer 授权边界

Fresh Fixer只获准修改以下文件：

- `src/ide/target-writer.ts`
- `src/update/update-plan.ts`
- `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/references/workflow.md`
- `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/references/record-output-spec.md`
- `docs/reference/skills/sdlc-workflows.md`
- `docs/reference/workflow-artifact-layout.md`
- `test/implementation-readiness-rename-routing.test.ts`
- `test/update-planning.test.ts`
- `test/fixtures/implementation-readiness-rename-routing/bounded-surfaces.json`
- 本 evaluation 文档，仅追加 Fix Summary（修复摘要）。

上述白名单已覆盖唯一 implementation与evidence路径。不得修改 `src/modules/module-metadata.ts`、`src/fs/update-transaction.ts`、manifest/diagnostic schema、SPEC、Story、tracker、completion gate、root logs、Story 11.9/11.10、generic grill semantics、IR algorithm/scoring/body、dependencies、external drawer/zip、workspace `.agents/.claude` mirrors、fixed-count baselines或其他历史CR产物。若白名单不足，Fixer必须停止并返回Evaluator重新裁决，不得自行扩展。

### RED / GREEN 与验证授权

Fixer必须先在上述两个test文件与fixture中加入能够使current implementation失败的断言，并记录RED；不得把当前 `43/43` 误写为本轮finding的RED。GREEN至少证明：

1. `target-writer.ts` 的Story-owned `TS2345`消失，IDE projection focused tests仍绿；不新增phase rename schema。
2. Grill route对explicit custom与legacy-compatible都消费resolved `{solutioning_artifacts}`，resolver failure为HALT/zero-write，且D1 docs使用exact route/date basename。
3. 两个old IDs × 两个IDE targets的authorized clean update只留下redirect entry + 唯一active package；fresh install仍无old package，modified-old仍零写入。
4. content、executable、type/non-file、missing四类precondition变化全部在任何operation前失败，`changedPaths=[]`且无journal/partial writes。
5. candidate scan的actual match集合与fixture ledger双向exact相等，active roles为零，额外/缺失/重复/scan-error/symlink均失败。
6. 真实legacy tree在install/update/repair各阶段保持path/type/bytes/hash/tree不变且不进入mutation集合。

允许运行：两个focused test文件、`test/ide-target-writer.test.ts`、为type mismatch执行的 `npx tsc --noEmit --pretty false`（只报告Story-owned error消失；不得把其他Story错误混入）、精确相关update/install测试及白名单文件的 `git diff --check`。不得运行 `npm run build`、full suite、packaging或canonical governance。Fixer完成后由outer Flow Gate owner刷新completion gate，再进入fresh Reviewer Round 2。

### 评估决定

- **发现 #1（phase projection参数错位）**：确认P1，只删除未消费参数。
- **发现 #2（Solutioning route truth分叉）**：确认P1，固定resolver route并删除`.specskills/output` fallback；同步两份D1 docs。
- **发现 #3（old-ID真实activation缺口）**：确认P1，执行kickoff已选定的clean-existing deterministic redirect，不重新开放deprecation选择。
- **发现 #4（authorized apply/precondition证据）**：确认P1，与Finding #3合并测试，但不得修改已正确的transaction实现。
- **发现 #5（classified scan false-green）**：确认P1，采用bounded raw-byte candidate-scan与逐match ledger；不扩展到generic grill inventory。
- **发现 #6（legacy行为证据缺失）**：确认P1，补真实legacy tree与write-capable lifecycle preservation，不新增public runtime surface。
- **Owner Gate**：`NONE`。所有修复路径均由Story、kickoff及SPEC唯一确定。
- **整体决定**：`FAIL`。六项修复、completion gate刷新及fresh Reviewer/Evaluator双重确认完成前，不得进入CR04、CR05或CR06。

## 修复执行记录

### 修复执行记录
- **Date**: 2026-09-05
- **Model Used**: GPT-5.6 Sol (gpt-5.6-sol)
- **Fix Items**: 6

#### RED（修复前失败证据）

- `npx tsc --noEmit --pretty false`：确认
  `src/ide/target-writer.ts:261` 存在 Story-owned `TS2345`，调用缺少未消费的
  `renamedFromCanonicalSkillIds`。
- 新增断言后运行
  `npx vitest run test/implementation-readiness-rename-routing.test.ts --reporter=dot`：
  `5 passed / 2 failed`。失败分别证明 Grill producer/spec 未绑定 artifact-root
  resolver，以及 candidate scan 尚无逐 match 分类 ledger。
- 新增断言后运行 `npx vitest run test/update-planning.test.ts --reporter=dot`：
  `33 passed / 1 failed`。失败证明 authorized clean update 未改写 old entry，
  `changedPaths` 不含 historical `SKILL.md`。

#### Fix Results（修复结果）

1. **Phase projection 参数错位**：删除
   `createMappedTargetProjection()` input type 中未消费的
   `renamedFromCanonicalSkillIds`；未修改 `PhaseCoverageRow` schema。
2. **Solutioning route truth**：Grill workflow 与 record spec 现在都要求在任何
   artifact/progress write 前调用
   `speclite resolve artifact-roots --project-root {project-root}`，只消费
   `solutioning_artifacts.resolvedRoot` 并记录 `resolutionMode`/provenance；resolver
   non-zero、block/error、missing/unsafe root 均 `HALT`、zero artifact write、zero
   progress mutation。移除 `.specskills/output/...` 第三 fallback，并同步两份 D1
   docs 的 exact route、真实预创建目录与
   `implementation-readiness-report-{yyyy-MM-dd}.md`。
3. **Clean-existing deterministic redirect**：canonical migration projection 对 files-index
   已证明 ownership/hash/type/mode 的 old `SKILL.md` 生成最小 redirect entry，正文不复制
   active workflow，只指向 `../{replacementCanonicalSkillId}/SKILL.md`；同一 transaction
   投影 active package、skill/help/phase/files indexes。Fresh install 不生成 old package，
   modified old package继续返回既有 redaction-safe conflict 并保持零写入。
4. **Authorized apply 与 commit-time precondition**：参数化覆盖两个 old IDs ×
   `.agents`/`.claude` 两个 targets 的 `yes: true` clean update；另以既有
   `applyRecoverableUpdateTransaction` API 覆盖 content、executable、non-file/type、missing
   四类 precondition race，均在 journal/operation 前返回
   `precondition-changed` 或 `precondition-read-failed`，`changedPaths=[]`，无 partial write
   与残留 journal。未修改 transaction 实现。
5. **Bounded candidate scan（方案 I）**：扫描范围固定为
   `assets/source/speclite/`、`src/`、`test/`、active `docs/`、root `README.md` 与 exact
   `release/packaging-manifest.json`，明确排除 legacy docs、external drawer/zip 与 `dist/`。
   遍历使用 no-follow `lstat`，regular file 以 raw bytes 查找六类冻结 token/variant；
   当前 24 个 occurrence 均记录 `path + token + occurrence + role + rationale`，actual/ledger
   双向 exact equality。额外、缺失、重复、scan error、symlink/non-file 均 fail-close，
   allowed roles 仅 `compatibility-mapping`、`legacy-documentation`、`regression-fixture`，
   active role 命中为零。
6. **Legacy discovery/preservation 行为证据**：在 temp project 创建真实
   `{planning_artifacts}/ir-grill/` summary/round tree，执行真实 install、authorized update
   与 repair；逐阶段验证 project-relative path、no-follow regular-file type、raw bytes、
   SHA-256 与完整 tree 不变，且 planned/actions/issues/changed/conflicts 与 legacy 集合交集
   均为空。两个 active Skill 的 exact legacy candidate clauses继续作为 discovery contract。

#### GREEN（修复后验证）

- `npx vitest run test/implementation-readiness-rename-routing.test.ts test/update-planning.test.ts test/ide-target-writer.test.ts --reporter=dot`
  → `3 files passed / 47 tests passed`。
- `npx tsc --noEmit --pretty false` → overall exit `2`，current worktree仍有 135 个其他
  Story/基线 TypeScript errors；定向检查 `src/ide/target-writer.ts` 为 `0` 个 match，原
  Story-owned `TS2345` 已消失。未将其他错误混入本轮修复。
- 白名单文件 `git diff --check` → PASS。

#### Changed Files（变更文件）

- `src/ide/target-writer.ts`
- `src/update/update-plan.ts`
- `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/references/workflow.md`
- `assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/references/record-output-spec.md`
- `docs/reference/skills/sdlc-workflows.md`
- `docs/reference/workflow-artifact-layout.md`
- `test/implementation-readiness-rename-routing.test.ts`
- `test/update-planning.test.ts`
- `test/fixtures/implementation-readiness-rename-routing/bounded-surfaces.json`
- 本 evaluation 文档（仅追加本 Fix Summary）。

#### Scope Audit（范围审计）

- 未修改 `src/modules/module-metadata.ts`、`src/fs/update-transaction.ts`、schema、SPEC、
  Story、tracker、completion gate、root logs、Story 11.9/11.10、generic grill semantics、
  dependencies、external drawer/zip、workspace `.agents/.claude` mirrors 或 fixed-count
  baselines。
- 未运行 build、full suite、packaging 或 canonical governance；这些均留给 outer Flow
  Gate owner按 evaluation/goal边界执行。
