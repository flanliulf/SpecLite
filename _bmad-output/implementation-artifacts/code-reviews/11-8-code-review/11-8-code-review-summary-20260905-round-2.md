---
Story: 11-8
Round: 2
Date: 2026-09-05
Model Used: GPT-5.6 (gpt-5.6)
Type: Code Review Summary
---

## Review Conclusion（审查结论）

Blind Hunter、Edge Case Hunter、Acceptance Auditor 三层正式结果均成功返回（`3/3`，无 timeout、empty output 或降级）。Blind 为 `FAIL / 1 P1`，Edge 为 `FAIL / 2 P1`，Acceptance 为 `PASS / 0 finding`。Aggregator 按 `bmad-code-review` 对三份 Markdown layer report 做 best-effort normalization，并独立复核 current Story、Round 1 summary/evaluation/Fix Summary、completion gate、artifact-root resolver/update projection、machine result schema、candidate-scan test/ledger 与 authorized redirect fixture。

三层共提出 `3` 条原始 P1；三者 root cause、触发路径与修复面均不同，无可合并重复。最终确认 **3 个 P1 blocking findings**、**0 个 P2**、**0 个 decision-needed**、**0 个 defer**、**0 个 dismissed**，**Owner Gate: NONE**。

Round 1 的六项原始缺口按其既定 closure obligation 均已关闭：phase projection type mismatch、Grill route/current docs、deterministic redirect behavior、authorized apply/preconditions、bounded raw-byte ledger 与 legacy lifecycle preservation均有 current evidence。Round 2 Finding #3 是 redirect 已落地后新暴露的 machine-plan semantic residual：不否定 redirect behavior 已关闭，但 AC7 的“update plan 显式展示 rename/reprojection”仍未闭环。

总体结论为 **FAIL**。不得进入 CR04、CR05 或 CR06；下一步必须由 fresh Evaluator Round 2 独立裁决，之后 fresh Fixer 只能处理 Evaluator 确认并授权的项。

## Layer Results（三层结果）

| Layer | Execution | Formal result | Aggregated result |
| --- | --- | --- | --- |
| Blind Hunter | PASS | `FAIL` / 1 P1 | 保留为 Finding #3：实际执行 redirect 的 entrypoint action 被表达为普通 `update`，没有 machine-readable rename/replacement binding。 |
| Edge Case Hunter | PASS | `FAIL` / 2 P1 | 保留为 Finding #1、#2：existing resolver failure 被吞并回退 Planning route；candidate-scan control-plane 与 ledger 同源自证。 |
| Acceptance Auditor | PASS | `PASS` / 0 | 已确认 Round 1 六项既定修复闭环；其 AC7/AC9 正向结论未覆盖另外两层识别的 failure-path 与 evidence-control-plane residual。 |

## Findings（发现）

### 1. [高][P1 / PATCH-CODE+TEST] Existing artifact-root resolver failure 被吞掉，rename update 可回退 legacy Planning route继续写入

- **Source**：edge；Aggregator独立确认current可达分支
- **Location**：`src/update/update-plan.ts:576-602,611-632,1000-1008`

- **Evidence**
  - `resolveExistingArtifactRootContext()` 调用 `resolveArtifactRoots({ lifecycle: "existing" })` 后，在 `rootResult.ok === false` 时只返回 `undefined`，没有把 `rootResult.issues` 传播到 `readPlanningContext().issues`。
  - `readPlanningContext()` 随后以 `resolvedArtifactRootContext?.artifactRootContext` 返回，并仅对原有 `issues` 计算 `blocked`；本次 resolver failure 因而不会阻断 planning。
  - `buildCanonicalMigrationProjection()` 对缺失的 `artifactRootContext` 使用 `createLegacyArtifactRootContext(input.artifactRoot)`；该 fallback 把 `solutioning_artifacts` 指向 `${artifactRoot}/planning-artifacts`。因此 explicit root 的 symlink escape、missing/unsafe root 或其他 resolver block/error 可被误解释为 legacy-compatible fallback。
  - 在 `writeAuthorized=true` 时，错误 projection 仍可进入 update transaction；current focused tests没有构造 failing existing resolver 后断言 blocked、issues preserved、zero plan/zero write。

- **Impact**
  - 违反 Round 1 已锁定的“resolver block/error 必须 HALT、zero-write；只有 resolver 明确返回 `legacy-compatible` 才能使用 legacy route”合同。配置不安全或不可解析时，renamed package/help/artifact context可能写入错误 Planning root。

- **Suggestion**
  - 让 existing-root resolution 返回成功 context或完整 failure issues；失败 issues必须并入 planning issues并令结果 blocked，禁止进入migration projection与transaction。Legacy-compatible必须只消费resolver成功返回的roots，不得由`undefined`隐式推断。补 explicit unsafe/missing root 的authorized负向测试，断言stable issues、`changedPaths=[]`、无journal/partial write。

### 2. [高][P1 / PATCH-EVIDENCE] Candidate-scan 的 roots、exclusions、tokens 与 ledger 同源自证，可通过缩小 control-plane false-green

- **Source**：edge；Aggregator独立确认test data flow
- **Location**：`test/implementation-readiness-rename-routing.test.ts:144-192,218-238`；`test/fixtures/implementation-readiness-rename-routing/bounded-surfaces.json:7-29`

- **Evidence**
  - 测试从同一 fixture 读取 `candidateRoots`、`excludedPaths`、`searchTokens` 和 `matchLedger`，随后完全以前三者决定扫描面和needle，再把结果与同一fixture中的ledger对账。
  - 测试没有独立断言candidate roots必须exact等于 kickoff/Evaluator冻结的六个入口，也没有冻结三个exact exclusions、六个token key/parts或禁止额外exclusion。
  - 因此可同时删除`test`/`release` root、删掉任一old-ID/path token，或新增隐藏active surface的exclusion，并同步删除ledger rows；raw-byte、no-follow、双向equality、role allowlist仍可能全绿。
  - Current实现对“已经被fixture选择”的候选文件具备良好fail-close行为，但没有保护决定扫描面的control-plane本身；这不满足AC9要求的独立关闭。

- **Impact**
  - AC6/AC9/AC10 的active residual gate可以因fixture缩面而失效，无法证明未来改动没有通过修改同一manifest绕过exact-old-ID/path closure。

- **Suggestion**
  - 在test代码或另一个独立immutable contract中冻结并exact-assert authorized roots、exclusions与token key/parts；在这些断言通过后再执行fixture ledger equality。缺失、额外、重排无关但语义变形的control-plane项必须先fail-close；不得扩大到Story 11.10 generic grill inventory。

### 3. [高][P1 / PATCH-CONTRACT+TEST] Redirect entrypoint 的实际 update action 丢失 canonical rename/replacement 语义

- **Source**：blind；Aggregator独立确认planner/schema/test chain
- **Location**：`src/update/update-plan.ts:188-200,1023-1048`；`src/diagnostics/command-result-schema.ts:266-309`；`test/update-planning.test.ts:408-442`；completion gate `:32,38`

- **Evidence**
  - `buildCanonicalMigrationProjection()` 将historical `<old-id>/SKILL.md` 作为desired redirect file加入projection，所以planner处理该入口时会落入source/desired差异产生的普通 `action=update`，不会进入仅适用于`desired === undefined`的`action=skip, reason=canonical-skill-renamed`分支。
  - `UpdatePlanActionSchema` 又要求所有non-skip action省略`reason`，并把`replacementCanonicalSkillId`限定为`canonical-skill-renamed` skip；因此执行redirect的entrypoint action无法表达rename/replacement binding。
  - 两old IDs × 两IDE targets的authorized test只断言`changedPaths`、redirect正文、active package与indexes，没有断言执行old entrypoint的plan action携带typed rename/replacement，也没有执行第二次update证明幂等。
  - 该minimal fixture只有historical `SKILL.md`，不存在可产生rename skip的companion old files；所以machine plan可完全没有`canonical-skill-renamed` record。Completion gate关于显式reason/replacement与幂等的声明无法由current fixture重放。

- **Impact**
  - 文件最终态虽正确，但machine-consumable update plan把old→active identity transition表现为普通内容更新；调用方无法从真正执行redirect的action确定replacement，AC7“update plan显式展示rename/reprojection”仍未满足。

- **Suggestion**
  - 让执行redirect的old entrypoint plan record本身携带typed `canonical-skill-renamed` 与唯一`replacementCanonicalSkillId`，或引入等价且machine-schema验证的rename/reprojection record；不得依赖companion files提供间接语义。补两IDs × 两targets的plan→apply binding与第二次authorized update幂等断言，同时保持modified-old fail-close与redirect唯一active implementation。

## Deduplication And Disposition（去重与处置）

| Root cause | Raw sources | Disposition |
| --- | --- | --- |
| existing resolver failure propagation | edge | 保留为 Finding #1，`patch`；功能性fail-open。 |
| candidate-scan control-plane independence | edge | 保留为 Finding #2，`patch`；evidence gate可缩面。 |
| redirect action machine semantics | blind | 保留为 Finding #3，`patch`；与redirect最终态行为不同root cause。 |

- **Dismissed findings**：`0`。
- **Deferred findings**：`0`。三项均由Story 11.8 current implementation/evidence直接引入，不属于pre-existing或Story 11.9/11.10。
- **Decision needed**：`0`。resolver fail-close、kickoff冻结scan面与AC7显式rename/reprojection均已有唯一合同。
- **Parsing note**：三层均以结构化Markdown返回；虽然Edge不是Skill期望的JSON数组，字段完整且可best-effort无损归一化，无finding丢失。

## Round 1 Closure Matrix（Round 1 闭环矩阵）

| Round 1 root cause | Round 2 status | Current evidence / boundary |
| --- | --- | --- |
| #1 Phase projection必填参数错位 | **CLOSED** | 未消费参数已移除；focused IDE tests通过，原Story-owned `TS2345`不再存在。 |
| #2 Grill producer/spec/current docs route分叉 | **CLOSED** | Producer/spec/current docs已统一消费resolver-provided Solutioning root；本轮Finding #1是TypeScript existing update consumer吞resolver failure的独立路径。 |
| #3 Old-ID真实activation redirect | **CLOSED（behavior）** | Clean old entrypoint已在authorized transaction中改写为最小redirect，active package/index唯一；本轮Finding #3仅指出执行动作缺少machine-plan rename语义。 |
| #4 Authorized apply与precondition evidence | **CLOSED** | 两IDs × 两targets执行`yes: true`；content/mode/type/missing在operation/journal前fail-close且零partial write。 |
| #5 Exact classified scan false-green | **CLOSED（data plane）** | Raw-byte/no-follow、逐match ledger、actual/ledger双向equality与role closure均已实现；本轮Finding #2仅指出roots/exclusions/tokens control-plane未独立冻结。 |
| #6 Legacy discovery/preservation仅prose | **CLOSED** | 真实legacy tree经过install/update/repair后path/type/bytes/hash/tree不变，且与mutation集合无交集。 |

## Acceptance Criteria Matrix（验收标准矩阵）

| AC | Result | Current evidence |
| --- | --- | --- |
| AC1 | PASS | 两个canonical directories、ZH/EN frontmatter与self refs均使用新IDs。 |
| AC2 | PASS | Fresh projection仅生成active IDs，rename metadata只进入active skill-index rows。 |
| AC3 | **FAIL** | Producer prose已统一resolver route，但existing update consumer可吞resolver failure并回退Planning-root projection。 |
| AC4 | PASS | Readiness exact basename保持`implementation-readiness-report-{yyyy-MM-dd}.md`。 |
| AC5 | PASS | Grill record basenames未改变。 |
| AC6 | **FAIL** | Current ledger数据面完整，但扫描roots/exclusions/tokens未被独立冻结，可缩面逃逸。 |
| AC7 | **FAIL** | Redirect/apply最终态正确，但执行redirect的machine plan action没有显式rename/replacement binding，且幂等声明缺少重放。 |
| AC8 | PASS | 真实legacy tree的原位discovery/lifecycle preservation已有行为证据。 |
| AC9 | **FAIL** | 同源manifest同时控制scan面与expected ledger，尚不能称为independent closure。 |
| AC10 | **FAIL** | Focused `47/47`通过，但三条current failure/evidence路径未覆盖，不能证明Story全部合同。 |
| AC11 | PASS | 未发现IR algorithm/scoring/body、generic grill semantics或Story 11.9/11.10越界。 |

## Verification Summary（验证摘要）

- 三层正式结果均完成：valid layers `3/3`，无失败或降级。
- Blind与Acceptance各记录focused：`3 files / 47 tests passed`；Aggregator未重复运行测试。
- Aggregator用current source独立确认：resolver `ok=false`只返回`undefined`且不传播issues；migration projection对undefined context使用Planning-root legacy fallback；candidate-scan全部control-plane和ledger来自同一fixture且无exact freeze assertion；historical entrypoint因desired redirect存在而走普通`update`，schema禁止其携带rename reason/replacement。
- Aggregator核对Round 1 summary/evaluation/Fix Summary与completion gate，确认原六项既定修复均有current closure evidence，并将本轮三项限定为独立residual。
- 未运行build、full suite、packaging、canonical governance或global `tsc`；未修改source、tests、Story、tracker、gate、root logs、external drawer/zip、workspace mirrors或fixed-count baselines。

## Governance And External Boundary（治理与外部边界）

- Current canonical source变更触发的`canonical-source-truth:D0`、`module-discovery-contract:D0`与`current-public-docs:D1`由outer goal owner统一执行治理runner并记录D1/D2；本Aggregator只创建本Round summary，不替代最终`speclite-check-canonical-source-change`。
- `assets/source/speclite/core-skills/speclite-drawer-er-modeler/`、其zip、workspace `.agents/.claude` mirrors与fixed-count drift明确排除；drawer导致的full-suite/global count非绿不是Story 11.8 finding。
- 本轮不处理Story 11.9 CR artifact normalization、Story 11.10 broad grill semantic inventory、IR algorithm/scoring/body或generic output inventory。

## Owner Gate（Owner 门禁）

**Owner Gate：`NONE`。** 三项均有Story、kickoff及既有resolver/schema合同给出唯一修复方向，不需要产品或Architecture选择。Evaluator应分别保持：(1) resolver failure issue propagation + zero-write；(2) scan control-plane independent exact freeze；(3) redirect执行action的machine-readable rename/replacement + plan→apply/幂等证据。不得通过扩大Story 11.10范围、修改drawer/fixed counts或把P1降级TODO规避。

## Final Verdict（最终裁决）

**FAIL — 3 P1、0 P2、Owner Gate NONE。**

下一步进入fresh Evaluator Round 2。只有Evaluator确认的finding才可授权fresh Fixer；Fixer完成后必须刷新current completion gate并启动fresh Reviewer Round 3。当前不得进入CR04、CR05或CR06。
