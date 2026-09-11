---
Story: 11-6
Round: 3
Date: 2026-09-04
Model Used: GPT-5.5 (gpt-5.5)
Type: Code Review Summary
---

## Review Conclusion（审查结论）

本轮为 Round 2 修复后的 Round 3 复审。Blind Hunter replacement、Edge Case Hunter 与 Acceptance Auditor 三层正式结果均成功返回（`3/3`，无 layer 降级）：Blind 与 Acceptance 均为 **PASS / 0 P0/P1/P2**；Edge 提出 2 个 P1 候选。Aggregator 独立读取 Story、Round 2 evaluation 与修复记录、current source、focused fixtures、active Create UX contract、current completion gate 和 D1 public docs，并对两项候选分别做定向复现与断言覆盖审计。

初始 Blind attempt 返回 `Agent errored: This content was flagged for possible cybersecurity risk.`，没有审查内容、没有文件修改，属于 platform false-positive / invalid attempt；该 attempt 被排除，不计入三层结论。随后启动的 fresh replacement Blind Reviewer 正式返回 PASS。

独立复核后，Edge 的两项候选均成立，但 E1 的成立范围被严格收窄：阻塞点不是要求引入 native `openat` / `mkdirat`，也不是把所有不可消除的内核级 TOCTOU 自动升级为 P1；而是 current executable surface 只暴露“返回批准结果”的 `preflightUxArtifactWrite()`，实际 `wx` create / `mkdir` 不在同一 bounded operation 内。调用方在 guard resolve 后到实际写入前存在一个确定、可编程且已复现的同步替换窗口，current fixture也只覆盖 discovery→preflight replacement，未覆盖 preflight→write replacement。

E2 同样成立：lifecycle fixture完整 snapshot 了 legacy main、两个 HTML、asset directory/file/symlink，并逐阶段证明这些原路径不变，但 canonical no-copy helper只排除三个 core basenames；它没有排除 install 把 `legacy-assets/` 或其 file/symlink复制到 canonical `ux/` 下。因此 current completion gate关于“legacy main、HTML与assets均无canonical copy”的表述超出可执行证据。

聚合结论为 **FAIL：2 个 P1 blocking findings，0 个 decision-needed，1 个既有 P2 defer**。不得进入 CR04、CR05 或 CR06；下一步应由 fresh Evaluator Round 3 限定最小修复与证据边界。

## Layer Results（三层结果）

| Layer | Execution | Formal result | Aggregated result |
| --- | --- | --- | --- |
| Blind Hunter | initial attempt invalid；fresh replacement completed | `PASS` / 0 P0/P1/P2 | 正式 replacement 结果纳入 `3/3`；初始 platform false-positive不作为层结论。 |
| Edge Case Hunter | completed | `FAIL` / 2 P1 candidates | E1按“operation-coupling缺口”收窄后成立；E2作为install no-copy evidence缺口成立。 |
| Acceptance Auditor | completed | `PASS` / 0 P0/P1/P2 | 未提出额外 finding；其 PASS 不覆盖Aggregator对Edge候选的独立可复现证据。 |

## Previous Round Review（上轮问题回顾）

### Closed（已修复）

1. Round 2 / Finding #1 — physical-owner 与 nearest-existing-ancestor gate
   - `inspectCandidate()` 已区分 canonical UX、legacy Planning 与 project reference owner，并对 missing write target检查nearest existing ancestor。
   - canonical existing/missing target、legacy existing target以及regular-file/FIFO/dangling/outside/cross-space matrix均有focused coverage。
   - 本轮 E1 不推翻这些静态/探测时约束；它只指出 guard 与实际写操作仍是两个可分离步骤。

2. Round 2 / Finding #2 — duplicate Markdown definition last-wins
   - normalized label 已改为 first-definition-wins，后续duplicate被mask但不覆盖；unsafe-first/safe-second与反向控制均有测试。

3. Round 2 / Finding #3 — HTML character-reference bypass
   - external scheme与literal fragment/query-only保持既有规则；其他local-ish HTML raw value含`&`时在strip/decode前fail closed。

4. Round 2 / Finding #4 — existing-before-install lifecycle顺序与command outcomes
   - legacy tree已在install前创建；install/update/repair逐阶段断言成功，且逐阶段比较全部snapshotted legacy entries。
   - 但canonical asset-copy negative coverage仍不完整，详见本轮 Finding #2。

### Still Deferred（仍为非阻塞待办）

1. inactive Architecture duplicate step仍含`*ux-design*.md`
   - 维持既有结论：P2 / CR TODO候选。
   - 本轮不得夹带修复。

## Findings Matrix（发现矩阵）

| ID | Source | Priority | Classification | Finding | Result |
| --- | --- | --- | --- | --- | --- |
| R3-1 | edge + Aggregator reproduction | P1 | patch | `preflightUxArtifactWrite()` 与 actual `wx` / `mkdir` 未形成同一 bounded operation，guard返回后可替换ancestor并跨owner写入 | confirmed, narrowed |
| R3-2 | edge + Aggregator assertion audit | P1 | patch-evidence | install lifecycle未排除全部snapshotted legacy asset在canonical UX中的copy | confirmed |
| R1-8 | prior auditor | P2 | defer | inactive Architecture duplicate仍含UX wildcard | unchanged defer |

## Blocking Findings（阻塞发现）

### 1. [P1 / PATCH] Last-moment guard 与实际写入是可分离的两段式操作

- **Source**：Edge；Aggregator 独立复现
- **Location**：`src/config/ux-artifact-routing.ts:182-202`；`test/ux-artifact-routing.test.ts:340-410`；`assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-ux-design/references/workflow-details.md:71,75`；`assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-ux-design/references/steps/step-01-init.md:90`

**Evidence（证据）**

- `preflightUxArtifactWrite()` 在 `inspectCandidate()` 返回`missing`后只返回 `{ ok: true, targetPath }`，不执行或绑定任何`wx` create / on-demand `mkdir`。
- current replacement fixture先在 discovery 后替换`ux/`，再调用preflight并证明它能拒绝；它没有调用actual `wx`，也没有覆盖preflight成功返回后的replacement。
- Aggregator 的清理式最小复现按确定顺序执行：建立real Planning/UX owner → `preflightUxArtifactWrite()`返回`ok=true` → 删除`ux/`并将其替换为指向project内`docs/`的symlink → 对原lexical target执行`writeFile(..., { flag: "wx" })`。结果为`{"preflight":true,"escapedToDocs":true}`，文件实际创建在`docs/race-proof.md`。
- 该路径不依赖概率竞争、线程调度或native API缺失；它利用的是current API把guard批准与写动作交给调用方分开编排的同步窗口。

**Impact（影响）**

- active contract虽要求“Immediately before”重验，但current executable oracle不能证明或强制actual create/mkdir与同一owner state绑定。canonical UX write可在guard通过后跨到project内其他physical space，违反 AC4、AC6、AC10，也使completion gate第33行“actual `wx` create/on-demand `mkdir`前执行同一重验并保持失败分支zero mutation”的证据不足。

**Bounded Recommendation（有界建议）**

- fresh Evaluator应把修复限定为operation coupling：让同一bounded internal primitive在最后一次owner/ancestor验证后直接执行exclusive file create或on-demand directory creation，并补一个可控的pre-write replacement fixture，证明替换时不会在cross-space target产生文件或目录。
- 不应把“必须实现native `openat`/`mkdirat`”写成唯一方案；也不应声称任何path-based implementation能消除所有外部进程级TOCTOU。Evaluator只需要求关闭current caller-visible synchronous seam，并明确剩余OS-level race是否属于本Story threat model。
- 不新增public CLI/schema、dependency、stable issue ID或UX-local root resolver。

### 2. [P1 / PATCH-EVIDENCE] Lifecycle no-copy断言未覆盖legacy asset tree的canonical副本

- **Source**：Edge；Aggregator 独立断言覆盖审计
- **Location**：`test/ux-artifact-routing.test.ts:668-728,869-896`；`_bmad-output/implementation-artifacts/flow-gates/11-6-consolidate-ux-artifacts-under-the-planning-ux-space-story-completion-gate.md:32,35,42`

**Evidence（证据）**

- `legacyEntries`确实包含main、两个HTML、`legacy-assets/` directory、`palette.css`与`palette-link.css` symlink；`snapshotEntries()`也记录各entry的path/type/hash或symlink text。
- `expectLegacyLifecycleState()`只做两类检查：全部legacy source entries仍与snapshot一致；canonical `ux/`下三个core basenames不存在。
- helper没有枚举canonical `ux/` tree，也没有逐一排除`ux/legacy-assets`、`ux/legacy-assets/palette.css`或`ux/legacy-assets/palette-link.css`。因此“保留legacy原件，同时在install阶段复制asset tree到canonical UX”的实现仍可通过这些断言。
- update/repair的`changedPaths`过滤能阻止这两阶段在`legacyRoot/`下新增copy，但install阶段没有等价asset no-copy断言；三阶段中至少install仍未闭环。

**Impact（影响）**

- AC8要求legacy UX artifacts不迁移、不复制、不重命名或删除，范围不限于三个core files；AC10要求tests覆盖legacy no-migration。current test只能证明source-preservation与core-file no-copy，不能证明asset tree no-copy。
- completion gate第35行把legacy assets与symlink也表述为“无canonical copy”，属于超出current executable evidence的结论。

**Bounded Recommendation（有界建议）**

- 在每个install/update/repair阶段，除复核legacy source snapshot外，对每个snapshotted relative asset shape建立canonical counterpart negative assertion，至少覆盖directory、regular file与symlink；或对canonical `ux/` tree做允许清单断言，只允许installer创建空parent且排除所有非授权descendant。
- 保持installer合法创建canonical `ux/` parent；不得错误要求整个Planning root在install前后完全相等。
- 修复证据后由Flow Gate owner用current结果刷新completion gate，不得只改文字或数字。

## Rejected Or Narrowed Candidates（驳回或收窄候选）

1. **必须引入native `openat` / `mkdirat` / full no-follow traversal才能修复E1**：驳回为过度指定。Edge指出的真实缺陷是current API中guard与operation脱钩；native descriptor-relative traversal只是可能策略，不是Story或Round 2 authorization唯一要求。不可消除的外部进程级理论race本身不单独构成本轮finding。

2. **Round 2 physical-owner/nearest-ancestor实现整体无效**：驳回。current guard对调用时filesystem state的owner、nearest ancestor、entry type与symlink boundary检查成立，64个focused tests通过；本轮只确认guard成功返回后的operation-coupling缺口。

3. **Legacy source snapshot没有覆盖asset directory/file/symlink**：驳回。`legacyEntries`与`snapshotEntries()`已覆盖这些source entries；E2的缺口仅在canonical counterpart/no-copy侧。

4. **初始Blind attempt是一个失败review layer**：驳回。它没有产出审查内容，属于platform false-positive；fresh replacement Blind正常完成并作为正式Blind层计入`3/3`。

## Acceptance Criteria Matrix（验收标准矩阵）

| AC | Result | Current evidence |
| --- | --- | --- |
| AC1 | PASS | fresh install预创建canonical `ux/` parent，`design-system/`保持on-demand。 |
| AC2 | PASS | 三个exact basenames与fresh binding保持闭环。 |
| AC3 | **FAIL** | on-demand target的preflight与actual mkdir未被同一bounded operation绑定。 |
| AC4 | **FAIL** | preflight成功后可替换UX owner并使actual `wx`写入`docs/`。 |
| AC5 | PASS with caveat | producer/consumer paths与active prose已同步；operation-coupling仍需修复。 |
| AC6 | **FAIL** | deterministic preflight→write replacement可使actual target跨physical owner。 |
| AC7 | PASS | ZH/EN、steps/references/docs当前一致；本轮未发现新active default drift。 |
| AC8 | **FAIL** | source preservation成立，但install阶段尚未排除legacy asset tree的canonical copy。 |
| AC9 | PASS | active producer negative scan无新反例；inactive Architecture wildcard仍为P2。 |
| AC10 | **FAIL** | 64/64 focused green未覆盖actual operation coupling与asset counterpart no-copy。 |
| AC11 | PASS | 未发现11.7+、PRD Validation、IR或CR artifact扩面。 |

## Verification Summary（验证摘要）

- Aggregator focused复跑：`npm test -- --run test/ux-artifact-routing.test.ts` → ✅ `1 file / 64 tests passed`。
- Aggregator定向E1复现：`preflight=true` 后替换`ux` owner再执行`wx` → ❌ `escapedToDocs=true`；临时目录已在`finally`清理。
- Aggregator assertion audit：`legacyEntries`覆盖6个source entries，但canonical no-copy只检查3个core basenames，未检查asset directory/file/symlink counterpart。
- Scoped `git diff --check` → ✅ PASS。
- 三层正式结果：Blind replacement PASS、Acceptance PASS、Edge FAIL / 2 P1 candidates；`3/3` layers完成，无layer降级。
- 初始Blind platform false-positive未产生内容或修改，不纳入正式结果。
- 按本轮约束未运行build、full suite或packaging。

## Governance And Caveats（治理与例外）

- Round 2 Fixer与current completion gate已记录canonical warn/strict为`status=ok / findings=[]`，changed canonical paths=`110`，D0为`canonical-source-truth`与`module-discovery-contract`；该治理green不替代本轮两项行为/evidence finding。
- D1 current public docs当前描述last-moment guard与legacy no-migration；修复后只做对应current truth的定点同步。D2 frozen/history材料保持snapshot。
- 外部`assets/source/speclite/core-skills/speclite-drawer-er-modeler/`、zip、`.agents/.claude` mirrors与fixed-count drift继续隔离；不得由Story 11.6修复吸收。
- inactive Architecture wildcard维持既有P2 defer，等待CR05登记。

## Conclusion（结论）

- **结论：不通过（FAIL）**
- **阻塞项：2个P1**
  1. guard与actual `wx` / `mkdir`之间存在可复现的caller-visible同步替换窗口；
  2. install lifecycle没有排除legacy asset directory/file/symlink的canonical copy。
- **非阻塞项：1个既有P2**：inactive Architecture wildcard，继续defer。
- **Owner Gate：NONE**。两项缺口均由AC3/AC4/AC6/AC8/AC10唯一约束，不需要产品语义选择。
- **Next**：进入fresh Evaluator Round 3。Evaluator应限定operation-coupling的最小实现语义、明确不把native `openat`当成预设唯一方案，并要求lifecycle逐阶段覆盖全部snapshotted asset的canonical no-copy；fresh Fixer只修复Evaluator确认的P1，之后重新运行fresh Reviewer/Evaluator双PASS门禁。
