---
Story: 11-6
Round: 1
Date: 2026-09-04
Model Used: GPT-5.5 (gpt-5.5)
Type: Code Review Summary
---

## Review Conclusion（审查结论）

Round 1 三层正式审查均成功返回（Blind Hunter、Edge Case Hunter、Acceptance Auditor，`3/3`，无降级），三层结论均为 **FAIL**。Blind 报告 5 项，Edge 报告 6 项，Acceptance 报告 3 个 P1 与 1 个 P2；Aggregator 独立检查 Story、kickoff/completion gates、current diff、Create UX producer/continuation、consumer/config examples、shared root/path guards、focused tests 与 public docs，并对 encoded traversal 与 blocking root result 做最小运行复现。

最终确认 **7 个 P1 blocking findings** 与 **1 个 P2 deferred finding**。P1 覆盖 fresh `actualConsumedPath` 状态、existing canonical 无进度 frontmatter 的覆盖风险、legacy supporting HTML 的选择策略、resolver/candidate fail-close、percent-decoded local reference containment、仍陈述旧三-root defaults 的 config examples，以及 AC10 未被真实行为 fixtures 证明。Finding #3 的 legacy sibling 缺失场景存在两种会改变输出位置的合法策略，必须由 fresh Evaluator 判断 owning contract 是否已唯一决定；若不能唯一推出，进入最小 Owner gate。其余 P1 均为修复边界明确的 patch。

本轮总体结论为 **FAIL**。不得进入 CR04、CR05 或 CR06；应先进入 fresh Evaluator Round 1。

## Layer Results（三层结果）

| Layer | Execution | Formal result | Aggregated result |
| --- | --- | --- | --- |
| Blind Hunter | PASS | `FAIL` / 5 findings | fresh state、无 `stepsCompleted` 覆盖风险、legacy sibling route、旧 config examples 与 evidence-only tests 均有 current source 支持；drawer manifest caveat驳回为外部范围。 |
| Edge Case Hunter | PASS | `FAIL` / 6 findings | fresh state与legacy sibling同前两层去重；candidate final-type/readability、encoded local ref和blocking root result确认为独立P1。其 `guard_snippet` 仅是建议伪码，不作为事实证据。 |
| Acceptance Auditor | PASS | `FAIL` / 3 P1 + 1 P2 | AC2、AC6/AC8/AC10 的行为/证据缺口成立；inactive duplicate Architecture step保留为P2，不提升为active producer blocker。 |

## Findings（去重发现）

### 1. [P1 / PATCH] Fresh 创建 canonical 主文档后 `actualConsumedPath` 仍为 `null`

- **Source**：Blind Hunter、Edge Case Hunter、Acceptance Auditor；Aggregator 独立确认
- **Location**：`assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-ux-design/references/steps/step-01-init.md:37-45,85-97,115-119`；`assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-ux-design/references/steps/step-02-discovery.md:153-160`
- **Evidence**：fresh 分支显式写入 `actualConsumedPath: null`，随后复制 template 到 canonical path，但没有把 discovery state 更新为该新文件。下一步只要求“ensure the selected `actualConsumedPath` has been created”，而 Step 2 及其后所有 append 操作直接写 `{actualConsumedPath}`。Parenthetical canonical default不能替代被要求记录的状态字段。
- **Impact**：fresh workflow 的主输出变量保持空值，后续 append/frontmatter/status write 没有稳定目标；直接破坏 AC2、AC5、AC8 与 AC10。
- **Suggestion**：canonical 文件成功创建并初始化后，必须在进入 Step 2 前将 `actualConsumedPath` 更新为其 project-relative POSIX path；补充 fresh end-to-end state fixture，断言实际 append target 与 discovery evidence。

### 2. [P1 / PATCH] Existing canonical 文件缺少 `stepsCompleted` 时会进入 fresh copy 分支

- **Source**：Blind Hunter、Edge Case Hunter；Aggregator 独立确认
- **Location**：`assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-ux-design/references/steps/step-01-init.md:39-57,85-88`
- **Evidence**：canonical 文件存在时先设置 `actualConsumedPath`；只有含 `stepsCompleted` 才进入 continuation。紧接着“`If no document exists or no stepsCompleted`”把已存在但无该字段的文件归入 fresh setup，并再次要求 copy template 到同一路径。该控制流没有 halt、recovery 或 non-overwrite guard。
- **Impact**：可能覆盖一个既有 UX canonical artifact；即使 copy 实现拒绝覆盖，也会以未结构化异常中断，无法满足 deterministic continuation 与 existing evidence safety。影响 AC2、AC8、AC10。
- **Suggestion**：把“存在但缺失/无效 workflow frontmatter”定义为显式 fail-closed recovery 分支，禁止 template overwrite；只有路径确实不存在时才允许 fresh create，并补充 hash/zero-mutation fixture。

### 3. [P1 / DECISION_NEEDED] Legacy main continuation 未绑定 supporting HTML 的 selected paths

- **Source**：Blind Hunter、Edge Case Hunter；Aggregator 独立确认
- **Location**：`assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-ux-design/references/workflow-details.md:59-73`；`assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-ux-design/references/steps/step-08-visual-foundation.md:187-192`；`assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-ux-design/references/steps/step-09-design-directions.md:65-80,187-192`；`assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-ux-design/references/steps/step-14-complete.md:65-80,167-171`
- **Evidence**：route contract要求 legacy main continuation 时发现 legacy sibling HTML，但 discovery state只定义 `actualConsumedPath`，没有 `actualColorThemesPath` / `actualDesignDirectionsPath` 或等价选择。Steps 8/9 无条件写 canonical HTML，Step 14也无条件报告 canonical supporting paths，因此已发现的legacy siblings既未被选择，也可能与新 canonical siblings分叉。
- **Impact**：legacy main、relative navigation与supporting outputs可能分属两个目录；用户看到/继续的旧 artifact 与完成报告中的 artifact不一致，影响 AC2、AC5、AC6、AC8、AC10。
- **Decision required**：Evaluator应先核对 owning contract能否唯一推出规则。至少 existing legacy sibling存在时应记录并原位使用；若 sibling缺失，需要明确是与selected legacy main同目录创建，还是仍创建canonical supporting output。该选择会改变持久化位置，Reviewer不替 Owner猜测。
- **Required fixtures**：legacy main + two siblings、legacy main + partial siblings、legacy main only、canonical+legacy coexistence，逐项断言 selected paths、reporting、cross-document links与no migration/hash boundary。

### 4. [P1 / PATCH] UX discovery 未对 resolver failure 与 candidate final type/readability 定义统一 fail-close

- **Source**：Edge Case Hunter；Aggregator 独立确认
- **Location**：`assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-ux-design/references/workflow-details.md:39-47,67-73`；`assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-ux-design/references/steps/step-01-init.md:37-45`；`src/config/artifact-root-resolver.ts:135-195`；`src/fs/path-normalizer.ts:81-138`
- **Evidence**：shared resolver可以合法返回 `ok=false`、blocking issues且不包含 Planning root；workflow却直接取 `planning_artifacts.resolvedRoot`，没有要求在任何 write/frontmatter mutation 前检查 `ok`、blocking issues与root presence。candidate说明只说“pass project-boundary guard”，但 lexical path guard不证明候选是readable regular file；directory、dangling symlink或in-bound symlink→non-regular target没有明确 structured halt。Aggregator最小复现 invalid Planning config得到 `ok=false`、`planning=null`。
- **Impact**：workflow可能在undefined/invalid root上继续，或把非文件candidate当成existing document，造成错误fallback、raw read error或越界读取风险。影响 AC5、AC8、AC10。
- **Suggestion**：在任何 discovery/read/write前要求 resolver `ok=true`、无blocking issue且唯一 Planning root存在；canonical/legacy candidate必须通过portable path、symlink containment、dereferenced readable regular-file检查。失败必须halt、空消费、零write/zero progress mutation，并复用现有diagnostic source，不新增UX-local resolver或taxonomy。

### 5. [P1 / PATCH] Local-reference boundary 未在 single percent-decode 后校验

- **Source**：Edge Case Hunter、Acceptance Auditor；Aggregator 独立确认
- **Location**：`assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-ux-design/references/workflow-details.md:67-73`；`assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-ux-design/references/steps/step-08-visual-foundation.md:187-190`；`assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-ux-design/references/steps/step-09-design-directions.md:187-190`；`src/fs/path-normalizer.ts:64-105`；`test/ux-artifact-routing.test.ts:135-146`
- **Evidence**：guidance要求normalize后做project guard，但未定义parse、strip query/fragment与single percent-decode顺序。现有test只把literal `../../outside.css`交给generic guard。Aggregator用current helper复现：`_speclite-output/2-planning-artifacts/ux/%2e%2e/%2e%2e/%2e%2e/%2e%2e/outside.css`被接受，而browser single-decode后为含`../../../../outside.css`的escaping reference。
- **Impact**：Markdown/HTML consumer可在浏览器/renderer解码后访问project root之外，直接违反AC6的project containment与AC10。
- **Suggestion**：对inline/reference-style Markdown及HTML `href`/`src`中的local reference执行明确的parse → strip query/fragment → decode exactly once → portable normalize → containing-directory resolution → project containment；malformed encoding、encoded separators/traversal与unsupported local-ish forms应fail closed。补齐three-space、cross-document、asset、symlink与encoded traversal fixtures；external schemes不作为local asset读取。

### 6. [P1 / PATCH] Story范围内的 config examples 仍陈述旧三-root defaults

- **Source**：Blind Hunter；Aggregator 独立确认并驳回“正确existing-install示例”解释
- **Location**：`assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-ux-design/config.toml.example:7-15`；`assets/source/speclite/sdlc-skills/3-solutioning/speclite-check-implementation-readiness/config.toml.example:7-15`；`assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-architecture/config.toml.example:10-15`；`assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-epics-and-stories/config.toml.example:11-16`；`assets/source/speclite/sdlc-skills/4-implementation/speclite-correct-course/config.toml.example:7-15`；`assets/source/speclite/sdlc-skills/4-implementation/speclite-create-story/config.toml.example:11-16`
- **Evidence**：这些文件自称runtime field-structure reference，却仍示例`planning-artifacts`、`implementation-artifacts`与`docs`三root，遗漏`brainstorming_artifacts`、`analysis_artifacts`、`solutioning_artifacts`、`devops_artifacts`，且与canonical `module.yaml:35-68`、fresh installed config与public docs的七root/phase-aligned defaults不一致。文件没有标注为existing legacy config示例。
- **Impact**：用户复制reference会显式锁定legacy路径，使resolver将其视为authoritative explicit config；AC7明确要求examples同步且不遗留旧active default，completion对该AC的通过声明不成立。
- **Suggestion**：仅同步Story 11.6 producer/consumer package内存在的examples到当前七root field shape与phase-aligned defaults，并增加scoped parity/negative scan；不要修改无关Skill examples。

### 7. [P1 / PATCH] AC10 的 legacy、links/assets 与三空间行为没有可执行证据

- **Source**：Blind Hunter、Acceptance Auditor；Aggregator 独立确认
- **Location**：`test/ux-artifact-routing.test.ts:89-146,148-217`；`_bmad-output/implementation-artifacts/flow-gates/11-6-consolidate-ux-artifacts-under-the-planning-ux-space-story-completion-gate.md:28-49`
- **Evidence**：legacy test创建文件后只调用artifact-root resolver、搜索step文本并比较同一文件hash；它没有执行canonical-first/legacy fallback、selected path、install/update/repair no-migration或sibling discovery。links test只调用generic lexical guard处理一个inside path与literal traversal，没有解析Markdown/HTML、containing-directory、query/fragment、percent encoding、symlink、cross-document navigation或三个filesystem spaces。producer/consumer tests主要是`toContain`与regex corpus assertions。
- **Impact**：AC8/AC10和completion gate对legacy no-migration、links/assets、canonical precedence与三空间边界的通过声明缺少能够捕获Findings #1-#5的行为证据；当前`6/6` focused green属于弱证据。
- **Suggestion**：建立最小可执行UX discovery/reference helper或等价fixture harness，覆盖fresh/canonical/legacy/coexistence、update/repair zero-mutation、supporting paths、real Markdown/HTML references、assets、single-decode、symlink与Planning/Public Docs/Project Knowledge三空间边界。测试范围应限于AC明确列出的行为，不扩展成通用Markdown解释器。

### 8. [P2 / DEFER] Shipped inactive Architecture duplicate step仍含`*ux-design*.md` wildcard

- **Source**：Acceptance Auditor；Aggregator 独立确认并维持P2
- **Location**：`assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-architecture/steps/step-01-init.md:59-87`
- **Evidence**：package内的duplicate `steps/step-01-init.md`仍写“UX and non-governed context retain existing rules”及`*ux-design*.md` wildcard；当前ZH/EN `SKILL.md`明确激活的是`references/steps/step-01-init.md`，所以它不是active Create Architecture入口，但仍被shipped且current negative scan不覆盖。
- **Impact boundary**：当前active consumer已使用canonical-first exact fallback，因此没有证据把本项提升为AC9 active-producer/consumer blocker；但duplicate source会造成未来误激活或维护漂移。
- **Disposition**：作为P2交Evaluator决定登记CR TODO或在后续owner明确的duplicate cleanup中处理；不得借Story 11.6删除文件或扩大为Architecture workflow重构。

## Candidate Rejections（候选驳回）

1. **Packaging manifest包含drawer entries**：驳回为Story 11.6 finding。`speclite-drawer-er-modeler`、zip、mirrors与fixed-count变化是并发external范围；manifest反映live canonical inventory不等于Story 11.6拥有该package。当前canonical checker normal/strict均无finding。
2. **Edge `guard_snippet`即现有实现**：驳回。Edge JSON中的`afterCreate(...)`、`HALT_WITH_RECOVERY()`、`requireReadableContainedRegularFile(...)`、`parseLocalRef()`等都是建议伪码；本summary仅以current files、控制流与运行复现为事实依据。
3. **把 config examples 视为正确existing-install样例**：驳回。文件只声明field-structure/runtime reference，没有legacy lifecycle标签；内容也遗漏四个current fields，不能证明AC7同步。

## Acceptance Criteria Matrix（验收标准矩阵）

| AC | Result | Evidence / note |
| --- | --- | --- |
| AC1 | PASS | Fresh install test实际证明`{planning_artifacts}/ux/`父目录存在且`design-system/`未预创建。 |
| AC2 | **FAIL** | 三个canonical basename文本已更新，但fresh `actualConsumedPath`未回填，legacy supporting HTML选择/报告未闭合。 |
| AC3 | PASS | `design-system/`保持on-demand，未发现installer预创建该子目录。 |
| AC4 | PASS | Active fresh producer路径均在`ux/`；legacy write-in-place是AC8显式兼容例外。 |
| AC5 | **FAIL** | Producer/consumer文本大体已迁移，但selected supporting paths与真实link/asset consumption没有闭合。 |
| AC6 | **FAIL** | Literal traversal guard存在；percent-decoded、symlink、containing-directory与cross-document boundary未实现/证明。 |
| AC7 | **FAIL** | ZH/EN、help与docs基本同步，但六个Story范围内config examples仍是旧三-root shape/defaults。 |
| AC8 | **FAIL** | legacy discovery仅为prose；resolver failure、candidate type/readability、selected siblings与install/update/repair no-migration没有可执行闭环。 |
| AC9 | PASS（P2 caveat） | Active Create UX producer negative scan通过；inactive shipped Architecture duplicate wildcard保留P2。 |
| AC10 | **FAIL** | Focused tests没有执行legacy discovery/no-migration、Markdown/HTML containing-dir links/assets、encoded/symlink boundary与三空间矩阵。 |
| AC11 | PASS | Findings限于UX producer/declared consumers/tests/docs；未处理11.7+功能。 |

## Verification（验证）

- Aggregator复跑focused/related matrix：`6 files / 44 tests`，其中`5 files / 42 tests passed`，`runtime-structure.test.ts`的`2`项失败均为external drawer使expected`68`变为actual`69`；Story 11.6 focused `test/ux-artifact-routing.test.ts`为`6/6 PASS`。
- Blind正式验证：focused `6/6`、docs、canonical与diff通过；其drawer packaging caveat未计入11.6。
- Acceptance正式验证：focused `6/6`、无写affected `43/43`、docs/canonical/diff通过；runtime/source matrix的`3`项失败均为drawer fixed-count drift。
- Aggregator reproduction A：current `resolveProjectRelativePath()`接受含四段`%2e%2e`的UX local path；single decode后为`../../../../outside.css` escaping reference。
- Aggregator reproduction B：invalid/escaping Planning config使shared resolver返回`ok=false`且`planning=null`；current workflow guidance没有相应halt branch。
- `npm run docs:check`：PASS，`72 Markdown files / 5 drafts`。
- Canonical checker warn/strict：PASS，`status=ok`、`findings=[]`、`changedPathCount=104`，D0 `canonical-source-truth` / `module-discovery-contract`，`decisionRecordRequired=false`。
- Story-scoped `git diff --check`：PASS（无输出）。
- 本Aggregator未运行build、full suite或packaging；除本summary外未修改source、tests、Story、tracker、SPEC/docs、progress logs、CR TODO/rules或其它CR文件。

## Caveats（限制与隔离）

- External `speclite-drawer-er-modeler`、zip、`.agents/.claude` mirrors及fixed-count drift不归因于Story 11.6，也不纳入Fixer授权。
- Canonical checker当前为D0且无finding；developer hook要求的canonical governance runner分类、D1/D2记录与最终checker仍由root orchestrator在Epic最终收口前完成，本Reviewer summary不替代最终governance gate。
- Finding #5只要求Story AC6所需的bounded local-reference subset，不要求引入完整browser/Markdown parser或升级依赖。
- Finding #6只覆盖Story所列producer/consumer packages中存在的config examples，不授权全库批量重写。
- Finding #8是非阻塞P2，不能在closeout中写成已解决；若Evaluator defer，CR05必须登记TODO。

## Next Gate（下一门禁）

进入 fresh Evaluator Round 1。Evaluator应独立确认7个P1、裁决Finding #3是否已有唯一legacy supporting-output策略，并决定Finding #8的P2去向。只有所有authorized P1修复完成并经fresh Reviewer/Evaluator同时PASS，才能进入CR04、CR05与CR06。
