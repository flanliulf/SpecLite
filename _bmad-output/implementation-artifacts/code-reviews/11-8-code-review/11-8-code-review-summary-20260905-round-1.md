---
Story: 11-8
Round: 1
Date: 2026-09-05
Model Used: GPT-5.6 (gpt-5.6)
Type: Code Review Summary
---

## Review Conclusion（审查结论）

Blind Hunter、Edge Case Hunter、Acceptance Auditor 三层正式结果均成功返回（`3/3`，无 timeout、empty output 或降级），三层均为 **FAIL**。Aggregator 按 `bmad-code-review` 对三份 Markdown layer report 做 best-effort normalization，并重新读取 Story、kickoff/completion gates、current TypeScript projection/update实现、两个 renamed canonical packages、focused tests/fixture 与 D1 current docs。

三层共提出 `13` 条原始 P1。按 root cause 去重后确认 **6 个 P1 blocking findings**、**0 个 P2**：

1. `createMappedTargetProjection()` 被误加未消费的必填参数，但唯一调用点没有传入，current tree 存在确定性 `TS2345`。
2. Grill producer、record spec 与 D1 current docs 没有共享 Story 锁定的 exact Solutioning route/basename：producer硬编码default并允许合同外 `.specskills` fallback，docs又分别发布 Planning root、幽灵目录或非exact `{date}` basename。
3. old-ID helper只接入update ownership resolution；clean update保留旧 package原实现，真实IDE discovery/activation可同时暴露old与active两套identity，Story选择的activation redirect没有落地。
4. rename update test只验证未授权plan和下一次重新plan时的pre-existing drift，没有执行`writeAuthorized=true` apply，也没有覆盖plan-to-commit间old-path hash/type/missing变化的precondition/zero-partial-write合同。
5. 所谓classified exact scan漏掉`test/`、generated/release/scripts/hooks及常见文本扩展名，fixture没有逐match ledger，allowed roles甚至未被消费，因而可以false-green。
6. legacy discovery/preservation test只匹配Markdown措辞，没有真实legacy artifact fixture，也没有执行discovery及write-capable lifecycle后的path/type/bytes/hash/tree invariant。

以上均可由Story 11.8、kickoff冻结选择、SPEC 04/07/09唯一推导，**Owner Gate: NONE**。总体结论为 **FAIL**；不得进入CR04、CR05或CR06，应先交fresh Evaluator Round 1独立裁决。

## Layer Results（三层结果）

| Layer | Execution | Formal result | Aggregated result |
| --- | --- | --- | --- |
| Blind Hunter | PASS | `FAIL` / 4 P1 | docs与Grill route并入Finding #2；old-ID activation并入#3；classified scan并入#5。 |
| Edge Case Hunter | PASS | `FAIL` / 5 P1 | target-writer缺参为#1；old-ID/update双active为#3；authorized apply/TOCTOU为#4；Grill route为#2；scan为#5。 |
| Acceptance Auditor | PASS | `FAIL` / 4 P1 | Grill route为#2；old-ID activation为#3；scan为#5；legacy behavior proof为#6。 |

## Findings（发现）

### 1. [高][P1 / PATCH-CODE] Phase coverage projection 的必填参数未传入，current DTS/type gate不可重现

- **Source**：edge；Aggregator独立确认current signature/call mismatch
- **Location**：`src/ide/target-writer.ts:260-265,310-315`

- **Evidence**
  - `createMappedTargetProjection()` 的input type新增必填`renamedFromCanonicalSkillIds: string[]`，但`phaseCoverageRows`内唯一调用仍只传`targetId`、`canonicalSkillId`与`mapped`。
  - 该字段在函数体中没有被读取；rename metadata实际已经在`skillIndexEntries`投影，不属于`PhaseCoverageRow.ideTargets` schema。
  - Edge layer的只读type check记录精确`TS2345`指向`target-writer.ts(261,43)`；Aggregator没有重跑build，但current code本身可直接证明参数缺失。

- **Impact**
  - Story 11.8直接引入的类型错误阻断DTS/build gate，completion gate所述“ESM与DTS passed”不能由current tree重现。

- **Suggestion**
  - 删除`createMappedTargetProjection`中错误且未消费的必填字段；若确需phase-level rename metadata，则必须先由现有schema/Story contract授权并在调用、返回schema和fixture中完整消费，不能只补一个无效参数掩盖错误。

### 2. [高][P1 / PATCH-CONTRACT] Readiness route truth在Grill producer、record spec与current docs之间分叉

- **Source**：blind + edge + auditor；Aggregator独立确认
- **Location**：`assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/references/workflow.md:48-69`；`.../references/record-output-spec.md:3-29`；`docs/reference/skills/sdlc-workflows.md:70-71`；`docs/reference/workflow-artifact-layout.md:82-92,165-166`

- **Evidence**
  - Story AC3与kickoff锁定两个Skills的新output root为`{solutioning_artifacts}/implementation-readiness-report/grill-consistency/`，并由SPEC 09 resolver区分`explicit-config`与`legacy-compatible`。
  - Grill workflow/record spec却把首选路径硬编码为`_speclite-output/3-solutioning-artifacts/...`，因此custom Solutioning root不会被消费；解析失败后还允许把新记录写入`.specskills/output/speclite-implementation-readiness-grill-consistency-reviewer/`，这是合同外第三root。解析失败应HALT/zero-write，existing缺field应消费resolver提供的legacy-compatible root。
  - `docs/reference/skills/sdlc-workflows.md`仍把readiness check Output写为`{planning_artifacts}`；`workflow-artifact-layout.md`又列出`module.yaml`未声明的`implementation-readiness/`预创建目录，并使用`implementation-readiness-report-{date}.md`，没有保持AC4的exact`{yyyy-MM-dd}` basename。
  - Current completion gate将D1 docs标为`updated`并断言两个active routes固定，但上述current surfaces与该声明直接冲突。

- **Impact**
  - 默认、explicit custom与existing legacy-compatible项目可能把新records写到不同root；用户按current docs定位时还会回到Planning root或幽灵目录，package/help/docs identity-route parity没有闭环。

- **Suggestion**
  - Grill executable guidance统一从resolved`{solutioning_artifacts}`构造fixed child，删除hardcoded default与`.specskills` fallback；resolver block时HALT且zero write。同步两份D1 docs到同一placeholder、真实预创建目录与exact`implementation-readiness-report-{yyyy-MM-dd}.md`，不得改Grill既有record basenames。

### 3. [高][P1 / PATCH-CODE+BEHAVIOR] Old-ID redirect没有接入真实activation，clean update后仍形成双active identity

- **Source**：blind + edge + auditor；Aggregator独立确认production consumers
- **Location**：`src/modules/module-metadata.ts:99-120`；`src/update/update-plan.ts:188-201,957-975,1206-1223`；`test/implementation-readiness-rename-routing.test.ts:66-80`；`test/update-planning.test.ts:362-428`

- **Evidence**
  - `resolveCanonicalSkillIdentity()`能把两个old ID映射到active ID，但production search显示它只被`update-plan.ts`用于installed skill ownership/reprojection；help/list/status/validate/IDE requested-ID activation均不消费该resolver。
  - Focused redirect test直接调用helper，未经过任何真实recognition/dispatch surface。
  - 对hash-clean old installed package，update生成`action=skip, reason=canonical-skill-renamed`，apply只把旧文件加入precondition后跳过，不删除也不将其内容转换为redirect/deprecation entry。
  - 因old package按Story要求保留，existing `.agents/.claude/skills/<old-id>/SKILL.md`仍是可由IDE目录发现直接激活的旧实现；update同时创建active package，故实际状态是old与active并存，而不是kickoff已选择的“old ID activation redirect”。

- **Impact**
  - AC7、SPEC 04的唯一active identity约束失效；existing automation或用户用old ID时不会确定性进入replacement，还可能持续执行旧实现。

- **Suggestion**
  - 将typed mapping接入真实requested-ID activation/recognition路径，或对clean old package产生受hash/precondition保护的deterministic redirect；不得生成第二个alias package，也不得覆盖/删除modified old package。修复必须用真实consumer/apply fixture证明old request只到唯一active replacement。

### 4. [中][P1 / PATCH-EVIDENCE] Rename update未执行authorized apply，也未覆盖old package的commit-time precondition race

- **Source**：edge；Aggregator独立确认
- **Location**：`test/update-planning.test.ts:362-428`；`src/update/update-plan.ts:340-350,1206-1223,1332-1337`；`src/fs/update-transaction.ts:71-97`

- **Evidence**
  - Rename test两次调用`runUpdateCommand()`都没有`options.yes: true`，所以`writeAuthorized=false`；它只验证clean dry plan，然后主动修改old文件并执行第二次重新plan。
  - 因此测试从未进入`applyUpdateActions()`，也没有执行`canonical-skill-renamed` skip生成的hash/mode precondition。
  - Production transaction确实在任何operation write前遍历preconditions并以`precondition-changed`或`precondition-read-failed`阻断，但本Story没有证明old package在plan后发生content、mode/type或missing drift时会以零partial write退出，也没有证明authorized clean reprojection后的old/new packages与indexes最终一致。

- **Impact**
  - AC7/AC10与completion gate关于modified-old protection、apply precondition及zero-destructive/partial write的Story-specific evidence高于实际执行覆盖。

- **Suggestion**
  - 参数化两个old IDs与至少一个真实IDE target，新增`yes: true` clean apply断言；在transaction commit前分别制造old path hash、executable/type与missing变化，断言stable issue、`changedPaths=[]`、无journal残留/partial writes，以及old/new package与installed indexes的最终合同状态。

### 5. [高][P1 / PATCH-EVIDENCE] Exact classified scan漏域且无逐match ledger，active residual可false-green

- **Source**：blind + edge + auditor；Aggregator独立确认
- **Location**：`test/implementation-readiness-rename-routing.test.ts:113-143,168-183`；`test/fixtures/implementation-readiness-rename-routing/bounded-surfaces.json:1-44`

- **Evidence**
  - Kickoff冻结扫描域包含`assets/source/speclite/`、`src/`、`test/`、active docs与generated fresh-install expected state，并要求对每个match按`active-update`、`compatibility-mapping`、`legacy-documentation`、`regression-fixture`分类。
  - Current scanner只遍历canonical source、`src`、`docs`与root `README.md`，漏掉整个`test/`、`release/`及active scripts/hooks；扩展名allowlist也不含`.txt`、`.js/.cjs`、`.sh`、`.py`等可承载ID/path的文本格式。
  - Current tree已在update/focused tests、bounded fixture与fresh `skill-index-full.json`中保留old-ID regression/compat matches，但这些不进入现有分类循环。
  - Fixture只有surface paths和allowed role名称，没有`path + literal/path variant + location + role + rationale`逐match ledger；测试类型甚至不读取`allowedOldIdRoles`/`allowedOldPathRoles`。Manifest paths只用`access()`证明存在，不校验内容或角色。
  - Old path只匹配`{planning_artifacts}/ir-grill`单一substring，没有把kickoff独立冻结的`/ir-grill/`及resolved/default variants纳入exact inventory；同文件任意位置出现`legacy|historical|历史`即可放行，role未绑定具体match/clause。

- **Impact**
  - 未扫描文件、新增未授权role、active producer/consumer/activation/help/registry残留均可能在focused green时逃逸；AC6、AC9、AC10与completion gate的“100% classification / active零残留”不可重放。

- **Suggestion**
  - 按kickoff冻结roots、文件类型与所有exact literals/path variants生成deterministic no-follow inventory；fixture逐match记录path/location/token/role/rationale，测试要求actual与ledger双向exact equality、每个role来自allowlist且active roles零命中。scan error、symlink/non-file、extra/missing/duplicate classification必须fail-close。

### 6. [中][P1 / PATCH-EVIDENCE] Legacy discovery/preservation只有prose assertion，没有行为fixture

- **Source**：auditor；Aggregator独立确认
- **Location**：`test/implementation-readiness-rename-routing.test.ts:145-165`；`test/update-planning.test.ts:362-428`

- **Evidence**
  - 名为“discovers legacy readiness evidence”的测试只读取两个Markdown并匹配`{planning_artifacts}/ir-grill/`、`read-only`与`never migrate`字样；它没有创建任何legacy report/tree，也没有执行实际discovery。
  - Update test只覆盖一个old ID、一个`.agents` package，不包含legacy workflow artifact；没有在install/update/repair前后比较legacy path、no-follow type、bytes/hash/tree，也没有检查planned/changed/deleted/migrated paths与legacy集合的交集为空。
  - 因而current evidence只能证明instructions写了no-migration条款，不能证明AC8要求的“原位可发现”或write-capable lifecycle preservation。

- **Impact**
  - Legacy artifact可能不可被实际inventory消费，或在install/update/repair中被移动、覆盖、删除，而current focused test仍通过；completion gate对behavioral preservation的断言不可重现。

- **Suggestion**
  - 建立真实legacy readiness fixture，先创建代表性reports/tree，再执行声明的discovery与对应install/update/repair路径；逐阶段断言selected/discovered path、no-follow type、bytes/hash/tree不变，并断言plan/issues/changed/deleted/migrated paths与legacy集合零交集。

## Deduplication And Disposition（去重与处置）

| Root cause | Raw sources | Disposition |
| --- | --- | --- |
| target-writer参数契约 | edge | 保留为Finding #1，`patch`。 |
| Grill route + D1 docs drift | blind(2) + edge + auditor | 合并为Finding #2；producer与docs是同一route truth失配的不同消费面，修复义务均保留。 |
| old-ID helper/clean update双active | blind + edge + auditor | 合并为Finding #3，`patch`。 |
| authorized apply/TOCTOU evidence | edge | 保留为Finding #4，`patch`。 |
| scan domain/per-match roles | blind + edge + auditor | 合并为Finding #5，`patch`。 |
| legacy behavioral proof | auditor | 保留为Finding #6，`patch`。 |

- **Dismissed findings**：`0`。三层没有纯噪音；重复项均按root cause合并而非驳回。
- **Deferred findings**：`0`。以上均由Story 11.8 current diff/claims直接引入，不属于pre-existing或Story 11.9/11.10。
- **Decision needed**：`0`。kickoff已锁定redirect、Solutioning resolver route、legacy no-migration与bounded scan分类合同。

## Acceptance Criteria Matrix（验收标准矩阵）

| AC | Result | Current evidence |
| --- | --- | --- |
| AC1 | PASS | 两个canonical package directories、frontmatter与self refs已使用新IDs。 |
| AC2 | PASS | Fresh projection只生成active IDs，并在skill index携带rename metadata；但current build blocker由AC10承接。 |
| AC3 | **FAIL** | Grill producer硬编码default并允许合同外fallback；D1 docs也未统一到resolved Solutioning route。 |
| AC4 | **FAIL** | Canonical readiness steps保持`{{date}}`运行时token，但current D1 docs仍发布非exact`{date}`而非`{yyyy-MM-dd}`。 |
| AC5 | PASS | Grill的`summary.md`、`PLAN.md`、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md`未改名。 |
| AC6 | **FAIL** | Exact scan漏域、漏扩展名、漏path variants且没有逐match role closure。 |
| AC7 | **FAIL** | Typed mapping/update plan存在，但真实activation redirect未实现，clean update保留old active implementation；authorized apply/precondition也未被Story fixture执行。 |
| AC8 | **FAIL** | Prose声明legacy read-only/no-migration，但没有真实discovery与lifecycle preservation evidence。 |
| AC9 | **FAIL** | Independent scan可以false-green，不能证明active identity/producer/consumer零残留。 |
| AC10 | **FAIL** | Focused layer记录`43/43`，但current type gate失败，且route、activation、authorized update、scan与legacy关键路径未覆盖。 |
| AC11 | PASS | 未发现IR algorithm/scoring/body、generic grill semantics或Story 11.9/11.10被纳入本Story。 |

## Verification Summary（验证摘要）

- 三层正式结果均完成：valid layers `3/3`，无失败或降级。
- Acceptance layer复跑focused：`3 files / 43 tests passed`；Aggregator未重复运行测试。
- Edge layer记录type check中的Story-owned error：`src/ide/target-writer.ts(261,43) TS2345`；Aggregator按约束未重跑build。
- Aggregator用current source独立确认：projection signature/call mismatch；`resolveCanonicalSkillIdentity()`唯一production consumer位于update planner；clean old package为skip/precondition而非redirect；rename test无`yes: true`；classified test未扫描`test/release/scripts/hooks`且不消费allowed roles；legacy test只读Markdown。
- Aggregator用current canonical/docs独立确认：Grill hardcoded default与`.specskills` fallback仍存在；D1 docs仍有Planning output、幽灵`implementation-readiness/`目录和非exact date token。
- 未运行build、full suite、packaging或canonical governance；未修改source、test、Story、tracker、gate、root logs、external drawer/zip、workspace mirrors或fixed-count baselines。

## Governance And External Boundary（治理与外部边界）

- Current canonical source变更触发`canonical-source-truth:D0`、`module-discovery-contract:D0`与`current-public-docs:D1`；warning hook最近报告`status=ok / findings=[]`。本Aggregator只创建CR summary，不替代outer `speclite-canonical-source-governance-runner`分类/记录D1-D2，也不替代最终`speclite-check-canonical-source-change`。
- `assets/source/speclite/core-skills/speclite-drawer-er-modeler/`、其zip、workspace `.agents/.claude` mirrors与fixed-count drift保持明确排除；`core 18→19`、`total 68→69`及其full-suite failures不是Story 11.8 finding。
- 本轮不处理Story 11.9 CR directory规范化、Story 11.10 broad grill semantics、IR algorithm/scoring/body或generic output inventory。

## Owner Gate（Owner 门禁）

**Owner Gate：`NONE`。** 六项均有现有Story/SPEC/kickoff证据提供唯一修复方向，不需要产品或Architecture选择。Evaluator应特别保持Finding #2的producer/docs两组义务、Finding #3的真实activation与clean existing state义务，以及Finding #5的domain/ledger/role三组义务，避免去重后丢失closure条件。

## Final Verdict（最终裁决）

**FAIL — 6 P1、0 P2、Owner Gate NONE。**

下一步进入fresh Evaluator Round 1。只有Evaluator确认的finding才可授权fresh Fixer；Fixer后必须刷新current completion gate并启动fresh Reviewer Round 2。当前不得进入CR04、CR05或CR06。
