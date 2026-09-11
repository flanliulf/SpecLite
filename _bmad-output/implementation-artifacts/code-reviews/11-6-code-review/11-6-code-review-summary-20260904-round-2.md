---
Story: 11-6
Round: 2
Date: 2026-09-04
Model Used: GPT-5.5 (gpt-5.5)
Type: Code Review Summary
---

## Review Conclusion（审查结论）

本轮为 Round 2 复审。Blind Hunter、Edge Case Hunter、Acceptance Auditor 三层正式结果均成功返回（`3/3`，无降级），且均为 **FAIL**。Aggregator 重新读取 Story、Round 1 summary/evaluation 与 Fixer record、current helper、active Create UX workflow、focused fixtures、completion gate 和 public docs，并对真实 template binding、missing-parent symlink、project 内 cross-space symlink、duplicate reference definitions 与 HTML character reference 做独立最小复现。

Round 1 Findings #1、#2、#3、#6 已闭环；#4、#5、#7 仅部分闭环；#8 继续保持 P2 defer。三层候选去重并复核后确认 **4 个 P1 blocking findings** 与 **1 个既有 P2 deferred finding**。其中 candidate safety 的 missing-leaf ancestor 与 existing cross-space symlink 共用同一根因——candidate gate 只验证 project containment，没有验证 write/read target 的 physical owner boundary——因此合并为一个 finding；install/update/repair fixture 与陈旧 completion gate 均属于同一 AC8/AC10 evidence closure，合并为一个 evidence finding。

真实 template `stepsCompleted: []` 候选不成立：active Step 1 明确要求先初始化为 `stepsCompleted: [1]`，再 re-probe/bind，测试使用 `[1]` 与该执行顺序一致。仅 tests import internal helper 也不单独构成 P1：本项目的 Skill references 是 active executable instructions，Round 1 evaluation 明确授权 internal helper/fixture harness且禁止新增 public CLI；当前缺陷应以 helper与active prose共同遗漏的具体安全语义修复，不能据此扩展公共 runtime surface。

本轮总体结论为 **FAIL**。不得进入 CR04、CR05 或 CR06；应由 fresh Evaluator Round 2 评估并授权 bounded patch。

## Layer Results（三层结果）

| Layer | Execution | Formal result | Aggregated result |
| --- | --- | --- | --- |
| Blind Hunter | PASS | `FAIL` / 5 P1 | physical-owner containment、HTML character reference 与 lifecycle evidence 成立；raw-template binding 与“internal helper必须新增公共接线”不作为独立P1。 |
| Edge Case Hunter | PASS | `FAIL` / 2 P1 | missing ancestor/cross-space symlink 合并为 physical-owner finding；duplicate reference definition 的 last-wins 与 CommonMark first-definition 语义冲突成立。 |
| Acceptance Auditor | PASS | `FAIL` / 4 P1 + 1 P2 | physical-owner、lifecycle/gate evidence成立；raw-template binding驳回；helper-only候选不独立升级。inactive Architecture wildcard继续P2 defer。 |

## Previous Round Review（上轮问题回顾）

### Closed（已修复）

1. Round 1 / Finding #1 — fresh `actualConsumedPath` 未回填
   - `resolveUxArtifactRoute()` 保持 fresh main/append target 为 `null`，完成初始化后由 `bindCreatedUxMain()` re-probe并回填 exact canonical path。
   - active Step 1 要求 template copy 后先初始化 `stepsCompleted: [1]`，再 bind；focused fixture与该顺序一致。

2. Round 1 / Finding #2 — existing canonical 无有效 `stepsCompleted` 可能被覆盖
   - existing main 缺失、空或非整数状态会进入 `workflow-frontmatter-invalid` block，空消费且不选择 append target。

3. Round 1 / Finding #3 — legacy supporting HTML 未绑定 selected paths
   - current route、continuation、Steps 8/9/14 已记录并消费 `actualColorThemesPath` / `actualDesignDirectionsPath`；legacy sibling full/partial/missing 与 coexistence matrix 已覆盖。

4. Round 1 / Finding #6 — 六个 config examples 仍为旧三-root defaults
   - 六个明确 scope examples 已与 seven-root fresh defaults 对齐，focused parity/negative scan通过。

### Partially Closed（部分修复）

1. Round 1 / Finding #4 — resolver/candidate fail-close
   - resolver blocked、candidate自身为directory/dangling symlink/non-regular/unreadable/out-of-project symlink已覆盖。
   - 但 missing leaf 未检查 nearest existing ancestor；existing symlink只限制在project内，未限制到canonical UX或legacy Planning physical owner，详见本轮 Finding #1。

2. Round 1 / Finding #5 — bounded local references
   - inline/reference-style Markdown、HTML `href`/`src`、query/fragment、single decode、malformed/undefined/local-ish/symlink等已有实现与fixtures。
   - duplicate reference definitions 与 HTML character references 仍可使validator和实际renderer语义分叉，详见本轮 Findings #2、#3。

3. Round 1 / Finding #7 — AC10 executable evidence
   - focused suite已从 `6` 扩展到 `33` 个行为tests。
   - install-existing顺序和update/repair outcome assertions仍缺失；completion gate也仍引用旧 `6/47` evidence，详见本轮 Finding #4。

### Still Deferred（仍为非阻塞待办）

1. Round 1 / Finding #8 — inactive Architecture duplicate step仍含 `*ux-design*.md`
   - `assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-architecture/steps/step-01-init.md:74` 仍存在。
   - 维持既有评估结论：P2 / CR TODO候选；本轮不得夹带修复。

## New Findings（新发现）

### 1. [高][新] [P1 / PATCH] Candidate gate 未验证 missing ancestor 与 artifact physical owner

- **Source**：blind + edge + auditor；Aggregator 独立复现
- **Location**：`src/config/ux-artifact-routing.ts:64-66,122-139,182-232,250-283,587-589`；`assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-ux-design/references/workflow-details.md:70-75`；`assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-ux-design/references/steps/step-01-init.md:37-46,88-93`

- **Evidence**
  - `inspectCandidate()` 将 `ENOENT` 与 `ENOTDIR` 直接归为 `missing`，没有验证 nearest existing ancestor 是directory，也没有对其 `realpath` 做owner-boundary containment。
  - 当 `plan/ux` 是指向project外目录的symlink时，Aggregator复现 `resolveUxArtifactRoute()` 仍返回 `ok=true / continuation=fresh`，并授权两个canonical supporting write paths；regular-file/FIFO parent同样不能在discovery阶段得到结构化block。
  - existing candidate只检查real target位于project内。Aggregator将canonical main symlink到`docs/victim.md`后，route仍返回 `ok=true / continuation=continue`，且 `appendTarget` 指向该symlink；后续写入会跨UX→Public Docs physical ownership。

- **Impact**
  - Fresh main/supporting/design-system write可经ancestor symlink逃出project，或在write阶段产生非结构化filesystem failure；existing canonical artifact可穿透到`docs/`或`{project_knowledge}`。违反 AC4、AC6、AC8、AC10 与 zero-mutation门禁。

- **Suggestion**
  - 为candidate gate传入明确owner boundary。missing leaf须逐级找到nearest existing ancestor，要求其为directory且`realpath`位于允许的physical owner root；在实际 `wx` create 前再次验证。
  - canonical main/supporting/design-system existing target必须物理留在real `{planning_artifacts}/ux/`；legacy exact candidates至少必须物理留在real Planning root，不能只做project containment。
  - 增加parent regular-file/FIFO/out-of-project directory symlink、project内cross-space symlink，以及main/supporting/on-demand write的halt、空消费、零mutation fixtures。

### 2. [高][新] [P1 / PATCH] Duplicate reference definitions 使用 last-wins，可掩盖首定义 unsafe target

- **Source**：edge；Aggregator 独立复现
- **Location**：`src/config/ux-artifact-routing.ts:435-473`

- **Evidence**
  - definition scan对每个normalized label无条件执行 `definitions.set(...)`，后定义覆盖先定义。
  - Bounded reference-style contract必须与CommonMark的first valid definition语义一致。对同名label输入“unsafe-first / safe-second”，current validator只验证safe target并返回 `ok=true`；实际Markdown consumer会采用unsafe first definition。

- **Impact**
  - validator与renderer选择不同target，允许project traversal/reference escape绕过 AC6/AC10门禁。

- **Suggestion**
  - normalized label首次建立后不再覆盖；补充case/whitespace normalized duplicate、unsafe-first/safe-second与safe-first/unsafe-second fixtures，并证明validator与first-definition语义一致。

### 3. [高][新] [P1 / PATCH] HTML character reference 可绕过 query/fragment 与path containment

- **Source**：blind；Aggregator 独立复现
- **Location**：`src/config/ux-artifact-routing.ts:474-535`

- **Evidence**
  - HTML attribute parser保留raw character reference；`classifyReference()` 却先在raw `#` 处截断query/fragment。
  - 对 `<a href='..&#47;..&#47;..&#47;..&#47;outside.html'>`，current code在首个 `#` 处将path截为 `..&`。当containing directory存在同名decoy file时，Aggregator复现validator返回 `ok=true`并记录decoy；HTML renderer则会把 `&#47;` 解码为 `/` 后访问完全不同的traversal target。

- **Impact**
  - validator与HTML renderer消费路径不一致，local reference可逃逸project/owner boundary；违反 AC6/AC10。

- **Suggestion**
  - 在bounded HTML attribute subset中按HTML character-reference语义规范化后再执行strip query/fragment与single percent-decode；若不实现bounded decoder，则对local-ish attribute内任何无法安全解释的character reference fail closed。无需引入完整DOM/browser parser或依赖。

### 4. [中][新] [P1 / PATCH-EVIDENCE] Install no-migration fixture顺序错误，completion gate仍是修复前证据

- **Source**：blind + auditor；Aggregator 独立确认
- **Location**：`test/ux-artifact-routing.test.ts:425-446`；`_bmad-output/implementation-artifacts/flow-gates/11-6-consolidate-ux-artifacts-under-the-planning-ux-space-story-completion-gate.md:24-49`

- **Evidence**
  - fixture先执行install，之后才创建legacy tree，因此只能证明update/repair之后tree未变，不能证明install面对already-existing legacy artifacts时不迁移、不复制、不重命名、不删除。
  - 两次 `runUpdateCommand()` 返回值都未断言；即使命令失败或未完成，tree unchanged也会让test通过。
  - completion gate仍记录focused `6/6`、affected `47/47`以及修复前行为结论；current focused实际为 `33/33`，三层reported affected为 `191/191`，且本轮前三项安全缺陷使AC6/AC8/AC10的PASS evidence不成立。

- **Impact**
  - AC8 install/update/repair no-migration与AC10 coverage尚未被强证据证明；旧gate不能作为当前CR completion evidence。

- **Suggestion**
  - 在install之前建立合法existing legacy tree并snapshot/hash，执行install后断言successful outcome与tree/content unchanged；update和repair分别断言 `exitCode/result` 成功及每阶段hash unchanged。
  - Findings #1-#3修复并验证后，由Flow Gate owner基于current results刷新completion gate；不得仅改数字或继续以focused green替代真实行为闭环。

## Rejected Candidates（驳回候选）

1. **`bindCreatedUxMain()` 拒绝原始 template 的 `stepsCompleted: []`，因此fresh binding必然失败**：驳回。Template确实以空数组起始（`assets/.../assets/ux-design-template.md:1-4`），但active Step 1明确要求在加载下一步前设置`stepsCompleted: [1]`（`step-01-init.md:15-20`），并要求copy、initial frontmatter write成功后才re-probe/bind（`:88-93`）。直接copy raw template后跳过初始化调用bind不是contract execution sequence；focused fixture的`[1]`与真实bind前置状态一致。

2. **internal UX helper仅被tests import，因此必须新增public CLI/runtime binding**：不作为独立P1。Canonical Skill声明reference files是active executable instructions（`SKILL.md:34-42`），current workflow通过这些指令执行，并非TS workflow engine。Round 1 evaluation明确允许bounded internal helper/fixture harness，同时禁止新增public CLI/schema。`rg`确认helper目前只由focused tests import，这说明它是executable oracle；应修复helper与active prose共同遗漏的具体安全语义，但不能在没有owning contract的情况下把Story扩成新public UX command。若Evaluator认为必须提供machine binding，应先明确复用哪个existing public surface及其schema/diagnostic ownership，不能把“补更多tests”冒充接线。

3. **为修复HTML character reference引入完整CommonMark/DOM/browser parser**：驳回。当前scope只需bounded inline/reference-style Markdown与HTML `href`/`src` subset；first-definition和character-reference fail-close均可dependency-free完成。

4. **把 inactive Architecture wildcard 提升为current active producer blocker**：驳回。Active entrypoint消费`references/steps/step-01-init.md`；duplicate `steps/step-01-init.md`保持既有P2 defer。

## Acceptance Criteria Matrix（验收标准矩阵）

| AC | Result | Current evidence |
| --- | --- | --- |
| AC1 | PASS | Fresh install预创建`ux/`且不预创建`design-system/`的fixture继续通过。 |
| AC2 | PASS | 三个exact paths与fresh初始化顺序一致；raw-template binding候选已驳回。 |
| AC3 | PASS | Parent预创建、`design-system/`按需 contract保持。 |
| AC4 | **FAIL** | canonical existing symlink可物理写到`docs/`；missing output ancestor也未受UX owner containment。 |
| AC5 | PASS with caveat | Active producer/consumer prose与selected paths已同步；internal helper按当前架构是oracle，不要求新增public CLI，但其安全语义必须与active prose同步修复。 |
| AC6 | **FAIL** | ancestor/cross-space symlink、duplicate definition与HTML character reference均可使validated path与实际target分叉。 |
| AC7 | PASS | ZH/EN、六config examples、help/docs/metadata现有验证通过。 |
| AC8 | **FAIL** | candidate safety未闭环，install-existing no-migration仍缺正确顺序与successful outcome evidence。 |
| AC9 | PASS | Active producer negative scan未见回归；inactive duplicate保持P2。 |
| AC10 | **FAIL** | `33/33` focused green未覆盖本轮安全反例与真正existing-before-install lifecycle。 |
| AC11 | PASS | 未发现11.7+、PRD Validation/IR/CR artifact实现扩面。 |

## Verification Summary（验证摘要）

- Aggregator focused复跑：`npm test -- --run test/ux-artifact-routing.test.ts` → ✅ `1 file / 33 tests passed`。
- Aggregator `git diff --check` → ✅ PASS。
- 三层正式结果：Blind、Edge、Acceptance均完成且均为 `FAIL`；无layer降级。
- Acceptance reported affected matrix：✅ `6 files / 191 tests passed`。
- Acceptance reported docs：✅ `72 Markdown files / 5 drafts`。
- Acceptance reported canonical warn + strict：✅ `status=ok`、`findings=[]`，changed paths=`110`。
- Acceptance reported six changed Skill package density：✅ 无warning。
- 按本轮只读约束未运行build、full suite或packaging；其历史结果不能覆盖本轮新反例。
- 独立临时复现全部清理：raw template bind返回`workflow-frontmatter-invalid`但被判定为非contract sequence；missing-parent symlink错误返回fresh；canonical→`docs/victim.md` symlink错误返回continue；duplicate unsafe-first/safe-second错误返回safe；HTML character-reference traversal错误验证decoy并返回`ok=true`。

## Governance And Caveats（治理与例外）

- 当前 canonical checker由正式层报告为 `status=ok / findings=[]`；changed paths=`110`，impact仍为`canonical-source-truth:D0`与`module-discovery-contract:D0`。这不证明Story行为通过。
- D1 current public docs当前已描述UX route/fail-close，但Findings #1-#3修复后必须与actual behavior定点同步；D2 frozen/history材料保持snapshot，不静默回写。
- 外部 `speclite-drawer-er-modeler/`、zip、`.agents/.claude` mirrors与fixed-count drift继续排除，不得借Story 11.6 Fixer吸收。

## Conclusion（结论）

- **结论：不通过（FAIL）**
- **阻塞项**：4个P1（physical owner/ancestor containment、duplicate reference definitions、HTML character references、install/gate evidence）。
- **非阻塞项**：1个既有P2 inactive Architecture wildcard，继续等待CR05登记。
- **建议**：进入fresh Evaluator Round 2。Evaluator应授权同一个fresh Fixer同时修复helper、active workflow prose与focused fixtures中的三个具体安全语义，并补真正existing-before-install lifecycle evidence；完成后由Flow Gate owner刷新completion gate，再进入fresh Reviewer Round 3。不得新增UX-local resolver、public CLI/schema、依赖或stable issue ID，不得修P2/inactive duplicate或外部drawer。
