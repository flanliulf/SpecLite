---
Story: 11-9
Round: 20
Date: 2026-09-07
Model Used: GPT-5.6Sol
Review Source: 11-9-code-review-summary-20260907-round-20.md
Review Model: GPT-5.6Sol
Type: Code Review Evaluation
---

## Evaluation Summary（评估总结）

对 Story 11-9 的第 20 轮 CR 代码审查结果（复审）进行独立逐条评估。已核对被评估文件 SHA-256 为 `0bf20b4869917bf5476cc3c26c263895913280d8e5366b4aaac57b417e83466e`。Reviewer 的 4 个 finding 均能由 current resolver 的精确控制流与 shared CR contract 直接确认：YAML document-start 后 root property 状态遗漏、caller-frozen Story/sprint identity 未交叉绑定、四类 predecessor v2 authenticity 与 verdict/count 语义未完整验证，以及 completion freshness 读取错误 mutation 来源。四项全部确认为阻塞交付的 P1，结论为 `FIX_REQUIRED`。

本轮仅授权 resolver、focused regression test 与本 evaluation 的 Fix Summary append。修复必须保持 Option A：拒绝 named handles，不实现 `%TAG` binding、通用 YAML parser 或 tag vocabulary 扩展。`supersededIndex` identity/continuity 继续作为 carried deferred P2，不得混入本轮 patch。

## Previous Round Review（上轮问题回顾确认）

### Round 19 Finding #1：部分关闭

`行首 root property + plain remainder` 已进入现有 bounded state；本轮只确认 exact YAML document-start marker `---` 之后同一 root node 的 property + plain remainder 分支仍未进入该状态。已关闭的 bare/primary/secondary/verbatim、quoted/flow/block/property-only 与行首 plain remainder 矩阵不得重开。

### Round 19 Finding #2：部分关闭

non-string `reviewSeries` 与 missing/partial/extra-field binding 已在 filesystem inspection 前 fail-close。本轮只补 caller-frozen Story path basename、sprint key 与 normalized `storyId` 的同一 `storyKey` 身份不变量，不更改 workflow required/optional 已有 schema。

### Round 19 Finding #3/#5/#6：保持关闭

current artifact exact `disposition: current`、Story raw exact `Status` key，以及 CR04/CR05 public docs/help 双输出平面均有 current source 实现与 focused regression 支撑。本轮不得修改或重新解释这三类已关闭项。

### Round 19 Finding #4：部分关闭

review/evaluation 部分 required groups 与 Gregorian calendar validation 已实现。但 current `validInlineList()` 只验证外层方括号，CR04/CR05 直接落入 `return true`，review/evaluation verdict 与 count 也没有做已有语义互斥。本轮仅关闭这些残余分支，不新增 artifact schema。

### Historical CR TODO（历史 CR TODO，非阻塞）

| # | 发现 | 状态 | 评估意见 |
|---|---|---|---|
| Round 5–20 | `supersededIndex` identity/continuity | CR TODO / P2 | 继续 deferred；不得混入本轮 P1 patch。 |

## Finding #1 Evaluation（发现 #1 评估）

### Review Original（审查原文）

> **[高][新] YAML document-start 后的 root property plain remainder 仍泄露伪 terminal**
> - 来源：edge + reviewer-probe
> - 分类：patch

### Evaluation Conclusion（评估结论）：✅ 确认有效 — 需要修复（P1 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性：准确**

`resolve-cr-directory.mjs:1042-1166` 的 YAML whole-file scanner 只在 `yamlDocumentRootPropertyPlainScalar(line)` 返回 true 时进入 root plain state；而 `:1169-1180` 的 helper 从第一个字节要求 `!` 或 `&`，不识别 `--- !local note` / `--- &memo note` 中 exact document-start marker 后的同一 root node。因此后续缩进 owner-like scalar 仍可进入 terminal matcher。shared contract `cr-contract.md:61-67` 要求 resolver 对 tracker 中 ambiguous/non-scalar/missing/duplicate 证据 fail-close，不允许 parser-invalid bytes 认证 terminal authority。

**严重性判断：合理**

该分支可让 parser-invalid sprint/workflow tracker 认证 completed legacy，并切换到 canonical new run，直接影响 AC9/AC11 的 lifecycle 决策，P1 合理。

**修复建议：可行**

仅在 exact document-start indicator 后重用现有 bounded root-property plain state，并保留正常 `---` document controls。不得实现 directive、`%TAG` binding、named handles、通用 YAML parser 或新 tag vocabulary。

**误报评估：非误报**

当前 helper 的起始字节条件与 document-start bytes 直接不匹配，控制流缺口明确。

## Finding #2 Evaluation（发现 #2 评估）

### Review Original（审查原文）

> **[高][新] Caller-frozen tracker bindings 未冻结同一 Story identity**
> - 来源：edge + reviewer-probe
> - 分类：patch

### Evaluation Conclusion（评估结论）：✅ 确认有效 — 需要修复（P1 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性：准确**

`resolve-cr-directory.mjs:25-47` 在 filesystem inspection 前调用 preflight，但 `:744-759` 只验证 Story path 位于 `stories/`、sprint path 为固定文件，以及各 role 的局部 shape。它既没有消费 normalized `storyId`，也没有从 immediate Story basename 受界取得唯一 `storyKey` 后要求 sprint key 相等。shared contract `cr-contract.md:48-65,95-105` 将 `storyId`、`storyKey`、Story canonical path 与 sprint exact key 定义为同一 caller-frozen identity；当前 preflight 允许三者互相矛盾。

**严重性判断：合理**

错误 frozen authority 在首次写入前已经丢失 single resolved context，且 missing-root fast path 可直接成功，属于 AC4/AC9 的身份与恢复缺陷，P1 合理。

**修复建议：可行**

在 filesystem inspection 前，从 immediate Story filename 受界提取完整 `storyKey`：要求 basename 为 `${storyKey}.md`、`storyKey` 以 `${normalizedStoryId}-` 开头，且 sprint key 精确等于该 `storyKey`。保持 workflow required/optional 现有 shape，不新增默认 tracker。

**误报评估：非误报**

当前 function signature 和 predicates 无法表达 cross-role identity 约束，不是 severity 推断。

## Finding #3 Evaluation（发现 #3 评估）

### Review Original（审查原文）

> **[高][新] Existing predecessor v2 authenticity 仍未完整验证**
> - 来源：blind + edge + reviewer-inspection
> - 分类：patch

### Evaluation Conclusion（评估结论）：✅ 确认有效 — 需要修复（P1 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性：准确**

`resolve-cr-directory.mjs:598-623` 只为 review/evaluation 实现部分 validator，CR04 `cr-rules-extraction` 与 CR05 `cr-todo-result` 会直接落入 `return true`。这使 shared contract `cr-contract.md:239-287` 已定义的 `eligibleFindingSetHash` / `candidateRuleCount` / `globalRuleEligibleCount`，以及 `operationScope` / `mode` / `confirmationPolicy` / `authorizationSource` / `mappedFingerprints` / `backlogSource` / `backlogSourceHash` 等 required fields 可全部缺失。`validInlineList()` 在 `:629-630` 只检查外层 `[]`，会接受 empty item、dangling comma 或未闭合 quote 等非法 bytes。同时，`:495-508` 只检查表层 verdict/result/binding，`:652-663` 只检查整数/布尔语法，没有执行 `PASS_RECOMMENDED`、`PASS`、`PASS_WITH_DEFERRED_TODOS` 与已有 finding/accepted/convergence/mapped 语义的互斥。

**严重性判断：合理**

不完整或语义自相矛盾的 predecessor 在重算 hash 后可组成 authentic `DONE`，会错误认证 completed legacy 并启动 canonical sibling，直接违反 AC9/AC11/AC12，P1 合理。

**修复建议：可行，但必须受界**

仅为四类 existing predecessor 实现 owning contract 已有 required-field/value-domain validator：

1. review：保持已有 scope/quorum/finding groups，将已有 list fields 收紧为受界 inline-list grammar，并使 `PASS_RECOMMENDED` 与无 blocking counts 一致。
2. evaluation：保持 review/head/scope binding，只对 finalizer 可消费的 `PASS` / `PASS_WITH_DEFERRED_TODOS` 执行契约已定义的 accepted/convergence 互斥。
3. CR04：验证已有 evaluation binding/hash、eligible set hash、非负整数 counts 与 exact `COMPLETED`，不新增字段或规则提炼算法。
4. CR05：验证 existing story closeout schema、授权字段、backlog binding/hash与 bounded fingerprint list，并与 current evaluation verdict 执行现有 `PASS` no-op / deferred mapping 语义。

list 只允许满足上述固定字段值域的单行、无 nested collection 受界 grammar；不得扩展为通用 YAML parser，也不得新增 schema field、改 producer/basename/round/approval algorithm。

**误报评估：非误报**

CR04/CR05 的 unconditional acceptance 与 list/verdict 的纯语法验证都可从 current code 直接确认。

## Finding #4 Evaluation（发现 #4 评估）

### Review Original（审查原文）

> **[高][新] Completion freshness 读取错误的 mutation 来源**
> - 来源：blind + edge + reviewer-inspection
> - 分类：patch

### Evaluation Conclusion（评估结论）：✅ 确认有效 — 需要修复（P1 优先级）

### Evaluation Analysis（评估分析）

**问题描述准确性：准确**

`resolve-cr-directory.mjs:535-551` 从 `sourceStates.evaluationSource.sourceMutationAt` 读取 mutation time，但 shared contract 的 evaluation v2 没有该 top-level required field。review mutation 时间是 review frontmatter 的 `sourceMutationAt`（`cr-contract.md:122-170`），修复 mutation 时间则是 evaluation nested `fixRecord.sourceMutationAt`（`:221-235`）。`parseLeadingFrontmatter()` 只读取未缩进 scalar，当前不可能从 evaluation 取得 nested fix record，所以 mutation time 通常回退为 evaluation `generatedAt`。这不足以证明 contract `:398-412` 要求的 last source/fix mutation 后 fresh reviewer/evaluator/gate。

**严重性判断：合理**

stale evaluation 或 stale completion gate 可认证 `DONE`，属于 completion authenticity 的功能缺陷，P1 合理。

**修复建议：可行，且须限于现有 order**

只执行 current contract 已有顺序：review `sourceMutationAt` 必须被 fresh review/evaluation 覆盖；如 evaluation 存在 `fixRecord`，仅受界解析 existing required fields 并使 completion gate 不早于有效 `fixRecord.sourceMutationAt`；gate 不早于 current evaluation，finalizer 不早于 gate。不得新增任意 CR04/CR05/producer chronology、全链 timestamp policy 或非 existing field。

**误报评估：非误报**

读取的 field 与 owning schema 直接错位，且 fallback 正好跳过需要证明的 mutation。

## Overall Evaluation Conclusion（整体评估结论）

### Required Fixes（需要修复，阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|---|---|---|---|
| 1 | document-start 后 root property plain remainder 泄露 | [高] | **P1** | existing bounded scanner 未消费 exact `---` marker 后的同一 root node。 |
| 2 | caller-frozen bindings 的 cross-role Story identity 未绑定 | [高] | **P1** | Story basename、sprint key 与 normalized `storyId` 可相互矛盾。 |
| 3 | 四类 predecessor schema/list/verdict-count authenticity 不完整 | [高] | **P1** | incomplete/inconsistent bytes 可在重算 hash 后组成 `DONE`。 |
| 4 | review/fixRecord freshness 读取错误 mutation 来源 | [高] | **P1** | current fallback 只使用 evaluation generation time，绕过最后 mutation。 |

### CR TODO（非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|---|---|---|---|
| carried | `supersededIndex` identity/continuity | [延续] | **P2** | 保持 deferred；不得由本轮 Fixer 处理。 |

### Evaluation Decision（评估决定）

- **Finding #1–#4**：全部确认有效，结论为 `FIX_REQUIRED`。
- **Owner Gate**：`NONE`。四项都是 existing Story/shared contract 的 routine implementation defects，无需新的产品或架构裁决。
- **Option A**：保持不变；named handles 全部拒绝，不实现 `%TAG` binding。
- **Closed findings**：Round 19 已关闭的 current disposition、raw exact Story `Status`、CR04/CR05 docs/help 不得重开；其余已关闭的原 finding 也不因本轮相邻分支而重开。

## Bounded Fixer Authorization（受界 Fixer 授权）

### Exact File Whitelist（精确文件白名单）

1. `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs`
2. `test/code-review-contract.test.ts`
3. 本 evaluation 文件仅允许 append `Fix Summary`

除上述文件外零写入。特别禁止修改 shared contract、Story、tracker、completion/kickoff gate、CR review logs、CR01–06 Skill/docs/help、runner、PLAN/EXPERIMENTS、source/installed mirrors、SPEC、其他测试或其他文档。

### Authentic Recovery Test Harness（真实恢复测试基线）

在任何本轮 RED 之前，必须先使 `writeAuthenticCompletedRound()` 及其 artifact builders 生成完整、当前契约合法的 review/evaluation/CR04/CR05/finalizer/gate/tracker 恢复链，并以未变异 control 证明 resolver 返回 canonical new-run success。不得继续使用缺 `eligibleFindingSetHash` 或 CR05 required fields 的 minimal fixture 作为「authentic」基线。

每个 negative 只允许变异一个目标字段/不变量，然后按 dependency graph 重算并重新绑定所有下游 hash：

- review 变异：重算 evaluation `reviewSourceHash`，再重算 evaluation hash、CR04/CR05 `evaluationSourceHash`、CR04/CR05 artifact hash 和 finalizer 中所有对应 source hash。
- evaluation 变异：重算 CR04/CR05 `evaluationSourceHash`，再重算 CR04/CR05 artifact hash与 finalizer 的 evaluation/CR04/CR05 source hash。
- CR04 或 CR05 变异：重算 finalizer 中该 artifact 的 source hash。
- tracker 变异：仅重算 finalizer 中对应 role `afterHash`。

变异后如果不重绑下游 hash，失败可能由 stale binding 提前触发，不足以证明本轮目标 validator。每个 RED/GREEN 都必须保留 complete authentic control 与 zero-workspace-write snapshot oracle。

### Independent RED / GREEN Matrix（独立 RED / GREEN 矩阵）

1. **Document-start root property**
   - RED：sprint/workflow 各覆盖 `--- !local note` 与 `--- &memo note`，owner 在前/后的 parser-invalid bytes 均在完整 authentic recovery 中重绑 tracker/finalizer hash 后证明 current 错误 accepted。
   - GREEN：上述全部 stable fail-close；正常 `---` document、行首 root property plain、bare/primary/secondary/verbatim、quoted/flow/block/property-only 与真实 owner controls 持续通过。
2. **Cross-role binding identity**
   - RED：Story basename 与 sprint key 不同、二者一致但不属于 current `storyId`、Story path 只是 prefix/suffix 伪装的 cases，覆盖 module/CLI 与 missing/canonical/legacy topology。
   - GREEN：所有矛盾在 filesystem inspection 前统一 fail-close；合法 Story/sprint identity 与 workflow required/optional controls 保持。
3. **Four predecessor validators + bounded lists + verdict/count invariants**
   - RED：对 review、evaluation、CR04、CR05 每类至少分别覆盖 missing/invalid required field；对各自 list 值域覆盖 empty item/dangling comma、unterminated quote、nested collection 与合法 empty/single/multiple controls；对 `PASS_RECOMMENDED`、`PASS`、`PASS_WITH_DEFERRED_TODOS` 覆盖已有 blocking/deferred/count/convergence/mapping 互斥。每个 case 都须从完整 authentic recovery 出发并递归重绑 hash，不得由缺字段 fixture 或 stale hash 提前失败。
   - GREEN：只接受 owning contract 已有四类 schema/value domains 与语义上一致的可收口 verdict；list parser 保持 field-specific bounded grammar，不成为通用 parser。
4. **Review/fixRecord freshness**
   - RED：review `sourceMutationAt` 晚于对应 fresh review/evaluation，以及完整有效 `fixRecord.sourceMutationAt` 晚于 gate，均在递归重绑 hash 后单独失败；malformed/partial/duplicate/unknown `fixRecord` 不得提供 freshness authority。
   - GREEN：review source mutation 后的 fresh reviewer/evaluator、evaluation/fix mutation 后的 gate、gate 后的 finalizer 通过；无 fixRecord 的 clean PASS 正控仍合法。不断言或验证任意 CR04/CR05 chronology。

### Allowed Verification（允许验证）

- 仅运行上述 4 组新增 focused test name 的独立 RED，再在 patch 后逐组独立 GREEN。
- `npx vitest run test/code-review-contract.test.ts --reporter=dot`
- `node --check assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs`
- 对三个白名单文件执行 scoped `git diff --check` 与实际 diff 越界审计。
- 只读 production-function 定向 probe。

禁止 broad build、full repository suite、packaging、canonical governance、fixture regeneration、completion gate 刷新、CR04/CR05/CR06 执行或日志更新。Fixer 完成后只向本 evaluation append Fix Summary；随后必须由 fresh Reviewer 复审、fresh Evaluator 复评。latest Reviewer/Evaluator 双 PASS 前不得进入 CR04、CR05 或 CR06。

## Fix Summary（修复执行总结）

### 修复执行记录
- **Date**: 2026-09-07
- **Model Used**: GPT-5.6Sol
- **Fix Items**: 4

### Execution Note（执行说明）

首次起草 production patch 早于独立 RED，发现顺序偏差后已仅撤回本轮 resolver 改动，在完整 authentic recovery baseline 上逐组重放四个独立 RED，再恢复同一受界 patch并逐组完成 GREEN。此处如实记录为逆转重放，不表述为原始先 RED。

### Fix Results（修复结果）

1. **Finding #1**：在 exact `---` document-start marker 后复用既有 bounded root-property plain state；`!local` / `&memo` 的 parser-invalid owner impersonation 在 sprint/workflow 矩阵中稳定 fail-close，正常 controls 保持通过。
2. **Finding #2**：preflight 从 immediate Story basename 受界取得 `storyKey`，要求 basename、sprint exact key 与 normalized `storyId` 同一身份；module/CLI 在 missing/canonical/legacy topology 的 filesystem inspection 前统一拒绝矛盾 binding。
3. **Finding #3**：补齐 review/evaluation/CR04/CR05 existing schema validator；inline list 仅接受无 nested collection 的 bounded 单行 grammar；落实 `PASS_RECOMMENDED`、`PASS`、`PASS_WITH_DEFERRED_TODOS` 的 blocking/deferred/convergence/mapped count 不变量。未新增 contract 字段或通用 YAML parser。
4. **Finding #4**：freshness 改为读取 review `sourceMutationAt` 与 evaluation nested `fixRecord.sourceMutationAt`；仅接受 existing fixRecord 的完整、唯一、顺序固定字段，并验证 review→evaluation、evaluation/fix→gate、gate→finalizer 的既有顺序。

### Test Harness（测试基线）

- `writeAuthenticCompletedRound()` 已补齐 CR04 的 eligible/count fields 与 CR05 story closeout 的 authorization/backlog/mapping existing fields。
- 每个 predecessor negative 只变异目标字段；递归重绑 evaluation、CR04、CR05、finalizer source hashes 与 dependent `evaluationVerdict`。tracker negative 只重算对应 role `afterHash`。
- 每个 case 保留 complete authentic control 与 zero-workspace-write snapshot oracle。

### Verification（验证）

- 四组独立 baseline RED：均在撤回本轮 production patch 后按 focused test name 失败，分别复现错误 acceptance。
- 四组独立 GREEN：全部通过（每组 `1 passed / 91 skipped`）。
- `npx vitest run test/code-review-contract.test.ts --reporter=dot`：`88 passed / 4 todo / 0 failed`。
- `node --check assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs`：通过。
- 未运行 broad build、full repository suite、packaging、canonical governance、fixture regeneration、CR04、CR05 或 CR06。

### Scope Audit（范围审计）

仅修改 resolver、`test/code-review-contract.test.ts` 与本 evaluation append；未处理 Option A 之外的 named handles / `%TAG`，未处理 deferred P2 `supersededIndex`，未重开 Round 19 已关闭问题。
