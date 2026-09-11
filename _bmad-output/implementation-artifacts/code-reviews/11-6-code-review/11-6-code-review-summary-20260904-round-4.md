---
Story: 11-6
Round: 4
Date: 2026-09-04
Model Used: GPT-5.5 (gpt-5.5)
Type: Code Review Summary
---

## Review Conclusion（审查结论）

本轮为 Round 3 修复后的 Round 4 复审。Blind Hunter、Edge Case Hunter replacement 与 Acceptance Auditor 三层正式结果均成功返回（有效 `3/3`，无 layer 降级）：Blind 为 **FAIL / 1 P1**，Edge replacement 与 Acceptance 均为 **PASS / 0 P0/P1/P2**。初始 Edge platform flag 未包含审查内容，不计为正式 layer result；fresh replacement 构成有效 Edge 层。

Aggregator 独立读取 Story、Round 2/3 summary 与 evaluation/fix record、current source/tests、active Create UX Skill、package/tsup entry、installer IDE mirror projection、release manifest、installed-tree fixture 与 completion gate。独立复核确认 Blind finding **成立但必须按 installed artifact availability/consumption gap 精确收窄**：问题不是没有新增 public CLI，也不是 TypeScript helper 只能由tests直接import这一事实本身；问题是 Round 3 active workflow 已明确命令 agent“使用 runtime-internal bounded operation”，但 shipped/installed Skill 中没有该 operation 的可定位名称、命令、script、参数/结果契约或调用方式，CLI bundle也不包含 `executeUxArtifactOperation()`。因此真实 installed workflow无法消费已经在source/test中证明的operation-coupling语义。

这与 Round 2 已驳回候选不同。Round 2 面对的是“internal helper未连接public CLI，所以必须扩建public runtime surface”的泛化主张，当时将helper作为active prose的executable oracle是合理的；Round 3修复则进一步把active Step 1改成对一个具体“runtime-internal bounded operation”的强制依赖，并由completion gate宣称该operation已实际执行。此时若没有installed executable binding，agent只能HALT或自行发明一次性 Bash/Node 实现，均不能证明与tested primitive共享同一 deterministic owner/ancestor、exclusive-create与structured-halt语义。故本轮确认 **1个P1 blocking patch**，既有 inactive Architecture wildcard继续作为 **1个P2 deferred finding**；总体结论为 **FAIL**。

`__testOnlyInterposeBeforeCommit` 不独立构成production callback seam：它只存在于未进入public entrypoint、未被bundle且未随installed Skill投影的source module中，current production没有调用方；未来binding必须保证该hook不成为installed executable的用户输入，但这属于P1修复边界而非新增finding。

## Layer Results（三层结果）

| Layer | Execution | Formal result | Aggregated result |
| --- | --- | --- | --- |
| Blind Hunter | completed | `FAIL` / 1 P1 | 确认；按installed Skill无法定位/调用required bounded operation的artifact availability与consumption gap收窄。 |
| Edge Case Hunter | replacement completed | `PASS` / 0 P0/P1/P2 | 接受；初始platform flag无审查内容，不计入正式结果，fresh replacement有效。 |
| Acceptance Auditor | completed | `PASS` / 0 P0/P1/P2 | 接受其对path/operation behavior fixtures的结论，但其未覆盖installed invocation binding，不能推翻Blind的独立证据。 |

## Previous Round Review（上轮问题回顾）

### Closed In Source And Focused Harness（源码与focused harness已修复）

1. Round 3 / Finding #1 — approval-only preflight 与 actual operation 脱钩
   - `src/config/ux-artifact-routing.ts:191-241` 已由 `executeUxArtifactOperation()`在同一函数内执行initial check、test interposition、commit-time revalidation与actual exclusive `writeFile(..., { flag: "wx" })` / single `mkdir`。
   - focused fixtures已证明normal create/mkdir、existing preservation与受控ancestor replacement fail-close。

2. Round 3 / Finding #2 — lifecycle canonical no-copy未覆盖legacy asset tree
   - current fixture已逐阶段覆盖legacy main、HTML、asset directory/file/symlink及其canonical counterparts。

### Still Deferred（仍为非阻塞待办）

1. Round 1 / Finding #8 — inactive Architecture duplicate step仍含 `*ux-design*.md`
   - 继续维持P2 defer；Round 4没有其进入active Create Architecture execution path的新证据。

### Reopened At Installed Consumption Boundary（installed consumption边界重新打开）

1. Round 3 / Finding #1 的source primitive虽已实现，但active installed workflow没有可消费binding；因此operation-coupling尚未从test oracle闭环为真实Skill执行能力。

## Finding Matrix（发现矩阵）

| ID | Source | Priority | Triage | Finding | Disposition |
| --- | --- | --- | --- | --- | --- |
| R4-1 | blind + Aggregator package inspection | P1 | patch | Active Create UX要求调用runtime-internal bounded operation，但installed Skill/CLI不存在可定位或可执行binding | confirmed, narrowed |
| R1-8 | prior auditor | P2 | defer | inactive Architecture duplicate仍含UX wildcard | unchanged defer |
| R4-C1 | blind | candidate | dismiss | 没有public CLI本身就是P1 | 仍按Round2裁决驳回；不得新增public CLI/schema |
| R4-C2 | blind | candidate | dismiss | exported input中的test-only hook独立形成production callback seam | current module未被production引用、bundle或installed projection，非独立finding |

## New Finding（新发现）

### 1. [高][新] [P1 / PATCH] Required bounded operation未投影为installed Skill可执行能力

- **Source**：Blind Hunter；Aggregator独立package/consumption audit确认
- **Location**：`assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-ux-design/references/steps/step-01-init.md:90`；`assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-ux-design/references/workflow-details.md:75`；`src/config/ux-artifact-routing.ts:191-241`；`package.json:22-31`；`tsup.config.ts:3-13`；`src/fs/copy-tree.ts:9-10,35-37`；`test/fixtures/fresh-install-empty-project/expected/installed-tree.txt:349-373,1049-1073`

#### Evidence（证据）

- Active Step 1已从普通template copy改为强制“Use the runtime-internal bounded operation”，但没有给出operation名称、可执行文件路径、command syntax、input/output或structured halt映射。Workflow details同样只陈述语义，没有invocation binding。
- `executeUxArtifactOperation()`只在`src/config/ux-artifact-routing.ts`定义，并只被`test/ux-artifact-routing.test.ts`直接import。`rg`未发现任何production caller。
- `tsup.config.ts`唯一entry为`src/bin/speclite.ts`；该entry没有import UX helper。Current `dist/bin/speclite.js`与`.d.ts`均不含`executeUxArtifactOperation`或其test hook。
- npm `files`仅发布`dist/`、`assets/source/speclite/`及docs；`src/`不发布。即使安装了npm package，target workflow也不能从package source import该function。
- Installer允许Skill-local `scripts/`投影，但current Create UX package没有`scripts/`。Release manifest与fresh installed-tree fixture只列出`SKILL.md`、references、assets与config/changelog；`.agents`和`.claude` installed Skill中都不存在operation executable。
- Completion gate却宣称`executeUxArtifactOperation()`已作为同一bounded internal primitive执行actual create/mkdir。该结论目前只由repository-local direct-import tests支持，不能作为installed workflow consumption evidence。

#### Minimal Execution Break（最小执行断点）

1. Fresh install激活`.agents/skills/speclite-create-ux-design/SKILL.md`并进入`references/steps/step-01-init.md`。
2. Agent可运行已明确绑定的`speclite resolve artifact-roots ...`，随后到达第90行required operation。
3. Installed Skill package内没有script；`speclite --help`所对应的bundle也没有UX operation command或import；instruction未给出任何可调用target。
4. Agent只能因required capability不可用而HALT，或自行拼装raw `cp`/`mkdir`/inline Node。前者使fresh UX workflow不可执行；后者重新引入未经同一harness验证的approval/write seam、diagnostic与owner-policy漂移风险。

#### Impact（影响）

- Story AC2/AC3的fresh core create与on-demand design-system operation无法由installed workflow按current contract确定执行。
- AC4/AC6要求的physical-owner、nearest-existing-ancestor与zero-mutation boundary只在repo-local test oracle成立，不能约束真实agent write。
- AC5/AC7的active producer同步及AC10 executable coverage未闭环；current completion gate的对应PASS陈述超出installed evidence。

#### Suggested Bounded Fix（建议的限界修复）

- 不新增public CLI/schema/runtime config/dependency。将同一owner/ancestor、exclusive `wx` create/single `mkdir`、structured result语义提供为**installed Skill可定位的private executable surface**，并在active Step中给出唯一、精确的invocation contract。
- 最贴合current package模型的实现是Create UX package-local `scripts/` executable（或Evaluator确认的等价private binding）：由installer现有allowlist自然投影至`.agents`/`.claude` Skill package；active prose以`{skill-root}`解析其路径，传入明确operation intent与project/planning/target/template参数，消费machine-readable result并按failure HALT。
- Source-of-truth不得形成两个会漂移的独立实现。Evaluator应限定helper与installed executable的共享实现/共享fixture策略，并要求真实installed-tree invocation覆盖fresh main create、design-system mkdir、existing target、cross-space interposition/ancestor negatives与structured failure。
- Test-only interposition只可由repository test harness触发，不得成为installed script公开参数、environment knob或active workflow输入。

## Rejected Candidates（驳回候选）

1. **必须新增public `speclite ux ...` CLI才能闭环**：驳回。Round 1—3均明确禁止新增public CLI/schema，本finding只要求active installed Skill能够定位并执行private bounded operation。Skill package本就允许投影`scripts/`，无需扩建public product surface。

2. **仍可把repo-local helper视为prose的executable oracle，因此没有installed gap**：驳回。Round 2时active prose只需要与oracle语义一致；Round 3后Step 1已显式要求调用一个“runtime-internal bounded operation”，且completion gate声称它执行actual operation。Oracle若未被installed executor消费，只能证明理想实现，不能完成active artifact availability/consumption。

3. **Agent拥有Bash，所以可自行实现等价operation**：驳回。`allowed-tools: Bash`只是capability permission，不是具体operation binding；让每次agent临时生成filesystem guard与structured diagnostics无法保证与68-case tested primitive同源，也不能证明guard与actual operation处于同一受控实现。

4. **`__testOnlyInterposeBeforeCommit` 是可被production caller滥用的独立P1**：驳回。Current `src/`不随package发布，module未由CLI/import graph消费，hook也未进入dist或installed Skill。修复时必须不把hook暴露给installed invocation，但current没有独立production exploit surface。

5. **把inactive Architecture wildcard升级为P1**：驳回。没有新的active-consumption证据，继续P2 defer。

## Acceptance Criteria Matrix（验收标准矩阵）

| AC | Result | Current evidence |
| --- | --- | --- |
| AC1 | PASS | Installer预创建canonical `ux/`且不预建`design-system/`的evidence保持。 |
| AC2 | **FAIL** | Exact path prose与repo-local primitive存在，但installed fresh workflow没有调用binding来执行main create。 |
| AC3 | **FAIL** | On-demand directory semantics通过direct-import test，installed workflow无法定位同一bounded mkdir operation。 |
| AC4 | **FAIL** | Owner containment未被真实installed producer的write surface强制执行。 |
| AC5 | **FAIL** | Active producer要求不存在于installed package/CLI的runtime-internal operation，producer/runtime consumption未闭环。 |
| AC6 | **FAIL** | Link parser本身保持green；write-side physical boundary缺少installed executable enforcement。 |
| AC7 | **FAIL** | ZH/EN prose同步，但scripts/package/install/activation binding缺失，不能视为全surface同步。 |
| AC8 | PASS | Legacy no-migration与canonical no-copy current fixture保持闭环；本finding不改变其结论。 |
| AC9 | PASS | 未发现active producer重新输出到Planning root；inactive duplicate仍为P2。 |
| AC10 | **FAIL** | 68-case suite直接importsource，未覆盖installed Skill实际调用与artifact availability。 |
| AC11 | PASS | 未发现11.7+或其他artifact类别扩面。 |

## Owner Gate（Owner 门禁）

- **结论：`NONE`。** Story的Equivalent Implementation Policy允许调整workflow internal step/helper；Round 3 evaluation已确定operation semantics并禁止public CLI/schema；installer现有package contract明确允许Skill-local`scripts/`投影。因而产品行为与public surface没有未决选择。
- “Skill-local executable script、共享private implementation或等价private binding”属于Evaluator可限界的实现选择，不需要Owner决定。若后续方案要求新增public CLI、stable schema、共享runtime command或改变installer ownership，必须停止并升级Owner Gate；本轮不得预授权这些扩面。

## Verification Summary（验证摘要）

- 正式三层：Blind `FAIL / 1 P1`；Edge replacement `PASS / 0`；Acceptance `PASS / 0`；有效`3/3`，无failed layer。
- Aggregator执行read-only package inspection：production/source/test reference scan、`package.json` files、tsup entry、dist bundle、canonical package tree、release manifest与fresh installed-tree fixture相互一致，均证明current operation只有repo-local source/test surface。
- 未运行build、full suite或packaging；本轮finding是artifact availability/consumption断点，既有focused green不能覆盖。
- 既有Round 3 Fixer记录：focused `68/68`、affected `226/226`、build/docs/packaging/canonical/diff PASS；full `660 pass / 12 fail / 4 todo`的12项仍归因于external drawer fixed-count drift。这些结果不推翻installed binding gap。

## Governance And Caveats（治理与例外）

- Current canonical checker历史记录仍为`status=ok / findings=[]`，impact为`canonical-source-truth:D0`与`module-discovery-contract:D0`；它证明source/package结构一致，不证明active Skill能够调用缺失的operation。
- 修复若新增Skill-local script，必须同步canonical package、installed-tree/index/hash/packaging evidence及D1 active invocation docs；D2 frozen/history不静默回写。
- External `speclite-drawer-er-modeler/`、zip、`.agents/.claude` mirrors与fixed-count drift继续排除，不得借本finding吸收。
- Existing `.agents`/`.claude` target mirrors属于generated install evidence；不得手工只改mirror而绕过canonical source与installer projection。

## Conclusion（结论）

- **结论：不通过（FAIL）**
- **阻塞项：1个P1**：active Create UX required bounded operation没有installed executable binding；repo-local helper/tests不能被真实Skill消费。
- **非阻塞项：1个既有P2**：inactive Architecture wildcard，继续defer至CR05。
- **Dismissed：2个Round4候选**：强制新增public CLI、test-only hook独立production seam。
- **Owner Gate：NONE**；只有方案扩展到public/shared runtime surface时才需要重新升级。
- **Next**：进入fresh Evaluator Round 4。Evaluator应验证P1并给出唯一bounded private-binding授权，要求installed-tree真实invocation与source-of-truth共享、active ZH/EN exact command、structured result、test-hook不暴露及completion gate刷新；随后fresh Fixer只修该P1，再进入fresh Reviewer/Evaluator双PASS。不得处理P2、external drawer、fixed counts、11.7+或新增public CLI/schema/dependency。
