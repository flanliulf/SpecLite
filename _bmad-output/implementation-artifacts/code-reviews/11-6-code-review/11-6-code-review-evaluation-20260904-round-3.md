---
Story: 11-6
Round: 3
Date: 2026-09-04
Model Used: GPT-5.5 (gpt-5.5)
Review Source: 11-6-code-review-summary-20260904-round-3.md
Review Model: GPT-5.5 (gpt-5.5)
Type: Code Review Evaluation
---

## 评估总结

对 Story 11-6 的第 3 轮 CR 代码审查结果（复审）进行逐条独立评估。正式三层结果完整：初始 Blind attempt 因 platform false-positive 未产出审查内容，不计入 layer；fresh replacement Blind、Edge 与 Acceptance 构成有效 `3/3`。Round 3 聚合的两个 P1 均由 current source、focused fixture 与 Story AC 支持：current `preflightUxArtifactWrite()` 只返回批准结果，未把 physical-owner/ancestor 的最后校验与 actual `wx` / on-demand `mkdir` 封装在同一 bounded operation；lifecycle helper 虽逐阶段保护了六个 legacy source entries，却只排除了三个 canonical core basenames，无法证明 legacy asset directory/file/symlink 未被复制到 canonical UX。

本轮总体结论为 **FAIL**：两个 P1 均阻塞交付。修复语义已由 AC3、AC4、AC6、AC8 与 AC10 唯一限定，**Owner Gate 为 NONE**。既有 inactive Architecture duplicate wildcard 维持 P2 defer，不得夹带修复。Fixer 只获授权关闭 caller-visible synchronous seam、补齐 lifecycle canonical no-copy evidence，并同步直接受影响的 active contract / D1 current docs；不得新增 public CLI/schema/dependency/stable issue ID，也不得把 native `openat` / `mkdirat` 规定为唯一实现。

---

## 上轮问题回顾确认

### Round 2 Findings #1—#3：已修复，但 #1 仍有本轮收窄后的 operation-coupling 缺口

`inspectCandidate()` 当前已按 canonical UX、legacy Planning 与 project reference 区分 physical owner，并对 missing write target 检查 nearest existing ancestor（`src/config/ux-artifact-routing.ts:225-293,296-387`）。Duplicate Markdown definition 已采用 first-definition-wins，local-ish HTML character-reference 已 fail closed；Round 3 未提供推翻后二者的新证据。本轮 Finding #1 不否定 current guard 对“调用当下”文件系统状态的检查，只确认 `preflightUxArtifactWrite()` 返回后，调用方仍可在 actual operation 前同步替换 owner。

### Round 2 Finding #4：大部分已修复，但 canonical asset no-copy evidence 尚未闭环

Lifecycle fixture 已在 install 前创建 legacy tree，并对 install/update/repair 的 command result 及六个 legacy entry snapshot 逐阶段断言（`test/ux-artifact-routing.test.ts:668-728`）。本轮 Finding #2 仅针对 canonical counterpart negative coverage，不推翻 source-preservation、阶段顺序或 command outcome 修复。

### 历史 CR TODO（非阻塞）

| # | 发现 | 状态 | 评估意见 |
|---|------|------|---------|
| R1-#8 | inactive Architecture duplicate step 仍含 `*ux-design*.md` | CR TODO / 非阻塞 | 同意维持 P2 defer；不得在 Round 3 Fixer 中处理。 |

---

## 发现 #1 评估

### 审查原文

> **[P1] Last-moment guard 与实际写入是可分离的两段式操作**
> - 来源：edge + Aggregator reproduction
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确，但成立范围应保持收窄**

`preflightUxArtifactWrite()` 调用 `inspectCandidate()` 后，只在 candidate 为 missing 时返回 `{ ok: true, targetPath }`（`src/config/ux-artifact-routing.ts:182-202`）。该函数既不执行 exclusive create / on-demand mkdir，也不持有任何与 operation 绑定的能力；调用方收到 `ok=true` 后可以任意等待或修改 filesystem，再自行执行写操作。Current fixture只覆盖 discovery 后、preflight 前替换 owner（`test/ux-artifact-routing.test.ts:392-410`），而不是 preflight 成功返回后到 actual operation 之间的旧 seam。Round 3 Aggregator 已按确定顺序复现 `preflight=true` 后将 `ux/` 替换为 `docs/` symlink，再由 caller 对 lexical target 执行 `wx`，最终写入 `docs/race-proof.md`（审查总结 `:69-74`）。

**严重性判断：合理**

这是 current executable surface 可由同一调用线程确定性编排的缺口，不是仅存在于概率调度中的理论 race。它可令 UX workflow-owned artifact 落入 `docs/`，直接违反 AC4；也使 AC3 的 on-demand directory、AC6 的 boundary 与 AC10 的 executable evidence 不成立，因此 P1 合理。

**修复建议：可行，但必须采用 operation-coupling 而非 write-then-check**

Fixer 必须将 approval-only API 收口为一个或两个 bounded internal operation primitive：同一 primitive 接收 canonical target 与 operation intent，在内部完成 portable-path/physical-owner/nearest-existing-ancestor 校验后，直接执行 exclusive file create（`wx` 等价语义）或 on-demand directory creation；不得把“批准 token/boolean + caller 自行写入”继续作为可执行契约。它可以替换 `preflightUxArtifactWrite()`，也可以保留该名称但必须改变为执行 operation 的内部 API；调用方不得在 guard 成功与 filesystem operation 之间重新获得控制权。

为了可确定性验证旧 seam，允许为该 internal primitive 注入一个明确命名的 test-only interposition hook。该 hook只能位于模块内部测试接口，不得进入 package public entrypoint、CLI、runtime config、schema 或 active user-facing contract；production call path必须固定不传 hook。Fixture 应让 hook 在一次 candidate check 后、commit-time revalidation 与 actual operation 前替换 `ux/` 或 `design-system/`。Primitive 随后必须再次执行 commit-time owner/ancestor validation，并在同一函数内立即发起 actual operation；替换被识别时返回 structured failure，cross-space file/directory均不存在。换言之，hook所模拟的旧 preflight→operation window之后还必须有真正的最终校验，不能把 hook 后的过期校验称为“final validation”。最终校验之后不得再调用 user-supplied callback、返回 approval 或执行其他可插入的异步业务步骤。

本裁决不规定 native `openat` / `mkdirat`、descriptor-relative traversal 或某一种底层实现为唯一方案，也不声称普通 path-based filesystem API 可以消除所有外部进程级 OS race。Story 11.6 的阻塞边界是关闭 current caller-visible deterministic seam并给出受控 interposition evidence；最终校验与系统调用之间不可完全消除的外部进程竞争不单独构成本轮 P1。

失败语义必须区分：

- candidate/owner/ancestor 校验失败或 test interposition 后 commit-time revalidation 失败：actual create/mkdir尚未发起，必须保持 cross-space target、canonical target、artifact/frontmatter/progress 的 zero mutation；
- exclusive create 因已存在等 filesystem error 失败：不得截断或覆盖 existing entry，并返回 structured halt；
- on-demand mkdir 的实现不得在已知 unsafe ancestor 下先创建再发现；应在任何创建前完成上述 commit-time validation；
- operation 成功后的 re-probe可用于确认新 entry 的类型/owner并决定是否允许 bind/继续，但它不能替代 pre-operation guard。若 post-check 因外部并发失败，应 HALT 且禁止后续 mutation；不得自动删除目标来伪造 zero mutation，因为删除可能移除外部主体创建或替换的文件。无需把跨多个独立 filesystem operations 的一般 rollback 扩入本 Story。

**误报评估：非误报**

问题由 source API shape 与确定性复现共同支持；Blind replacement / Acceptance PASS 不覆盖该复现。

---

## 发现 #2 评估

### 审查原文

> **[P1] Lifecycle no-copy 断言未覆盖 legacy asset tree 的 canonical 副本**
> - 来源：edge + Aggregator assertion audit
> - 分类：patch-evidence

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

`legacyEntries` 已包含 legacy main、两个 HTML、asset directory、regular file 与 symlink（`test/ux-artifact-routing.test.ts:671-688`），`snapshotEntries()` 也记录 path/type/content hash 或 symlink text（`:869-883`）。但 `expectLegacyLifecycleState()` 除了比较 legacy snapshots，只断言 canonical `ux/` 存在并排除三个 core basenames（`:886-896`）；它没有排除 `ux/legacy-assets/`、`ux/legacy-assets/palette.css` 与 `ux/legacy-assets/palette-link.css`。因此 installer 保留全部 legacy source、同时复制 asset tree 到 canonical UX 的错误行为仍可通过现有 fixture。

**严重性判断：合理**

AC8 的“不迁移、复制、重命名或删除”覆盖 existing legacy UX artifacts，而非仅三个 core files；AC10要求该行为由 tests 覆盖。Current completion gate却已宣称 main、HTML 与 assets 均无 canonical copy（completion gate `:32,35,42`），其结论超出可执行证据，故属于 P1 evidence blocker。

**修复建议：可行**

Lifecycle fixture 必须在 install、update、repair **每一阶段**继续验证 legacy source snapshot不变，并补充以下两种等价方案之一：

1. 从全部 snapshotted legacy entries 派生 canonical counterparts，逐项断言 canonical UX下对应 directory/file/symlink均不存在；映射须覆盖三个 core basename以及 `legacy-assets/` 的directory、regular file与symlink；或
2. 枚举 canonical `ux/` descendants并与明确 allowlist比较。就当前 fixture而言，必须允许 installer 创建空的 canonical `ux/` parent，但不允许任何由 legacy tree复制而来的 descendant；若未来确有该 fixture所需的 installer-owned canonical entry，必须在测试中显式列名，不能用宽泛 pattern 放行。

断言应在 install、update、repair各阶段立即执行，不能只验证最终状态；也不得用“整个 Planning root前后完全相等”取代，因为 AC1允许 install创建 canonical `ux/` parent。修复并完成 current verification 后，completion gate只能由 root/Flow Gate owner按真实结果刷新；仅更新文字或测试数字不能关闭本 finding。

**误报评估：非误报**

缺口可从 helper 的三 basename loop直接确认，且与 AC8/AC10及 gate陈述逐项对应。

---

## 发现 #3 评估

### 审查原文

> **[P2] Shipped inactive Architecture duplicate step 仍含 `*ux-design*.md` wildcard**
> - 来源：prior auditor
> - 分类：defer

### 评估结论：⚠️ 有效但降级 — 建议纳入 CR TODO 跟踪（P2 优先级）

### 评估分析

**问题描述准确性：准确**

该 duplicate source的 wildcard漂移此前已经确认；Round 3 没有其进入 active Create Architecture execution path的新证据。

**严重性判断：合理**

它是 shipped maintenance drift，但不是 Story 11.6 当前 active producer/consumer blocker，维持 P2。

**修复建议：可行但本轮不授权**

继续由 CR05 登记并在 duplicate source ownership明确后处理；Round 3 Fixer不得修改该 Architecture duplicate。

**误报评估：非误报**

Finding有效，仅处置为 defer。

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | guard approval 与 actual `wx` / `mkdir` 未形成同一 bounded operation | P1 | **P1** | caller可在 approval返回后确定性替换owner并跨空间写入。 |
| 2 | lifecycle未排除全部 legacy asset canonical counterparts | P1 | **P1** | source-preservation成立，但AC8的asset no-copy尚无完整可执行证据。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 3 | inactive Architecture duplicate仍含UX wildcard | P2 | **P2** | 维持既有defer，CR05登记。 |

### 可忽略（误报）

| # | 发现 | 原始严重性 | 忽略理由 |
|---|------|----------|---------|
| C1 | 初始 Blind platform false-positive 应计为 failed layer | 候选 | 无审查内容且fresh replacement已完成；正式结果仍为有效 `3/3`。 |
| C2 | 必须使用 native `openat` / `mkdirat` 才能关闭 Finding #1 | 候选 | Story要求关闭caller-visible deterministic seam，不唯一指定底层API，也不要求消除所有外部OS race。 |
| C3 | Legacy source snapshot未覆盖asset directory/file/symlink | 候选 | 六个 source entries 已覆盖；缺口仅在canonical counterpart/no-copy侧。 |

### Owner Gate（Owner 门禁）

- **结论：`NONE`。** Operation coupling与失败前zero mutation由AC3/AC4/AC6/AC10唯一确定；全部legacy shape no-copy由AC8/AC10唯一确定。
- Test-only interposition hook只是验证内部操作边界的手段，不是产品行为或public contract选择。
- 不需要用户在native descriptor API、path-based实现或完整transaction/rollback之间作产品决策；Fixer可在授权范围内选择最小、可验证实现。

### Fix Authorization（修复授权）

授权一个 fresh Fixer 仅修复 Findings #1—#2：

1. `src/config/ux-artifact-routing.ts`：将 approval-only `preflightUxArtifactWrite()` 收口/替换为执行 exclusive file create与on-demand directory creation的 bounded internal primitive；在同一函数内完成commit-time physical-owner/nearest-existing-ancestor validation并立即发起operation，不向caller暴露可继续写入的approval seam。允许最小内部union/type/helper、必要的 `node:fs/promises` import与明确test-only interposition seam；不得新增public CLI/schema/runtime config/dependency/stable issue ID、通用workflow engine或UX-local root resolver。
2. `test/ux-artifact-routing.test.ts`：补充 actual operation fixtures。至少覆盖 canonical main `wx` create与design-system on-demand mkdir；在旧guard→operation窗口受控替换canonical UX owner或missing ancestor，证明structured halt、canonical/cross-space target不存在且artifact/frontmatter/progress zero mutation；正常control必须证明exclusive create与mkdir确实由primitive完成。Test hook不得成为production/public surface。
3. 同一 test文件中的 lifecycle helper：install/update/repair每阶段排除全部六个legacy shape的canonical counterpart，或执行canonical UX descendant allowlist断言；必须允许空`ux/` parent并覆盖directory、regular file、symlink。
4. Create UX active ZH/EN contract及必要 steps，只允许把“preflight后caller写”同步为“同一bounded operation内commit-time revalidation并执行create/mkdir”的current truth；D1 `docs/reference/workflow-artifact-layout.md` 与 `docs/reference/skills/sdlc-workflows.md` 仅做对应定点同步。D2 frozen/history不改。
5. 本 evaluation 文件只允许 Fixer在文末追加规范的`修复执行记录`，不得改写裁决正文。

不授权修改 Story、Epic、PRD、SPEC 07/09、sprint tracker、既有 CR summaries、CR rules/TODO、11.7+、inactive Architecture duplicate、external drawer package/zip、`.agents`/`.claude` mirrors或fixed-count baselines。Completion gate由root/Flow Gate owner在Fixer完成current验证后单独刷新，不属于Code Fixer自行改写范围。

### Required Verification（必需验证）

Fixer至少必须提供：

- focused UX suite：current 64 cases保持green，并新增 operation-coupling与完整canonical no-copy cases；
- file create control：bounded primitive在real canonical owner中以exclusive语义创建预期内容，existing target不被覆盖/截断；
- directory control：bounded primitive只按需创建canonical UX下的目标directory，不预建无关descendants；
- controlled interposition：test-only hook在先前candidate check后替换`ux/`或`design-system/` ancestor，commit-time revalidation拒绝，`docs/`等cross-space target没有新增file/directory，canonical target与progress state不变；测试描述必须如实区分pre-check与hook后的final commit-time validation；
- owner/ancestor negative matrix保持：regular-file、FIFO、dangling symlink、out-of-project symlink、project内cross-space symlink；失败分支为空消费/append target且在operation发起前zero mutation；
- lifecycle：legacy先于install存在；install/update/repair逐阶段command success、全部source path/type/hash/symlink text不变，并逐阶段排除main、HTML、asset directory/file/symlink全部canonical counterpart；允许空canonical `ux/` parent；
- affected tests、build、docs、changed Skill density、packaging（若generated evidence变化）、canonical normal/strict与`git diff --check`；full suite须将external drawer fixed-count drift与Story regression分开报告；
- root/Flow Gate owner以current结果刷新completion gate后，进入fresh Reviewer Round 4；只有latest Reviewer与fresh Evaluator均PASS才可进入CR04。

### Scope Boundary（范围边界）

- 本轮关闭的是current caller-visible operation seam与AC8 evidence gap，不建立通用filesystem transaction层。
- Post-operation re-probe可保护后续bind/continue，但不能作为先写后验的替代防线；禁止用自动删除来声称失败zero mutation。
- 不要求或承诺消除所有外部进程级OS race；不得将native descriptor-relative API写成唯一验收方式。
- Finding #3仅进入CR TODO，不得本轮处理；external drawer及fixed-count drift继续隔离。

### 评估决定

- **发现 #1**：确认有效，P1 patch；必须由同一bounded internal primitive完成commit-time guard与actual exclusive create/on-demand mkdir，关闭caller-visible seam，并以受控interposition证明不跨owner写。
- **发现 #2**：确认有效，P1 patch-evidence；install/update/repair每阶段排除全部legacy shape的canonical copy，同时允许空canonical `ux/` parent。
- **发现 #3**：确认有效，P2 defer；CR05登记。
- **候选 C1—C3**：均不形成新增修复项。
- **Owner Gate**：`NONE`。
- **Overall**：`FAIL`。
- **Next**：fresh Fixer仅按上述授权修复 #1—#2并追加fix record；root/Flow Gate owner刷新current completion gate；随后进入fresh Reviewer Round 4与fresh Evaluator Round 4双PASS门禁。

## 修复执行记录

### 修复执行记录
- **Date**: 2026-09-04
- **Model Used**: GPT-5.5 (gpt-5.5)
- **Fix Items**: 2
- **Result**: Findings #1—#2 已按本评估授权完成；Finding #3 inactive Architecture wildcard 保持未修复并继续 defer 至 CR05。

### Fix Results（修复结果）

| Finding | Result | Targeted implementation and evidence |
|---|---|---|
| #1 bounded UX operation | fixed | `src/config/ux-artifact-routing.ts` 以 internal `executeUxArtifactOperation()` 替换 approval-only preflight surface；同一 primitive 接收 `create-file` / `create-directory` intent，完成初始检查、test-only interposition、commit-time physical-owner / nearest-existing-ancestor revalidation 后，不再调用 caller-controlled code并立即执行 `writeFile(...,{flag:"wx"})` 或单层 `mkdir`。Existing target structured HALT且不覆盖/截断；guard/operation failure不回删。Fixture证明canonical main exclusive create、design-system on-demand mkdir、existing preservation，以及 `ux/` 与 `design-system/` 在earlier check后被换为cross-space symlink时final revalidation拒绝，cross-space target、canonical artifact、route/progress均无operation mutation。 |
| #2 lifecycle canonical no-copy evidence | fixed | `expectLegacyLifecycleState()` 从六个pre-install legacy snapshot entries逐项派生canonical UX counterpart；install、update、repair每阶段既比较source path/type/hash/symlink text不变，也排除main、两个HTML、asset directory、regular file与symlink的canonical copy，同时允许installer创建空canonical `ux/` parent。 |

### Files Changed（变更文件）

- `src/config/ux-artifact-routing.ts`
- `test/ux-artifact-routing.test.ts`
- Create UX active ZH/EN contract：`SKILL.md`、`SKILL.en.md`、`references/workflow-details.md`、`references/steps/step-01-init.md`、`step-08-visual-foundation.md`、`step-09-design-directions.md`、`step-11-component-strategy.md`、`step-14-complete.md`
- D1 current docs：`docs/reference/workflow-artifact-layout.md`、`docs/reference/skills/sdlc-workflows.md`
- D0 generated release evidence：`release/packaging-manifest.json`（由packaging check刷新）

### Verification（验证）

- Focused：`npx vitest run test/ux-artifact-routing.test.ts` → **1 file / 68 tests passed**（current 64 + 4 operation/no-copy cases）。
- Affected：UX、artifact roots、artifact documents、config initialization、ownership、update planning → **6 files / 226 tests passed**。
- Build：`npm run build` → PASS。
- Docs：`npm run docs:check` → **72 Markdown files / 5 drafts**，PASS。
- Changed Skill density：Create UX `SKILL.md` / `SKILL.en.md` 均无 `triggered_density_warning`。
- Packaging：`npm run release:packaging-check` → PASS；release/dist packaging manifests对齐。
- Canonical checker：warn与strict均 `status=ok`、`findings=[]`；current scan为 `core=19`、`sdlc=50`、`support=8`、`hooks=2`、`defaultInstall.total=69`。
- Diff hygiene：`git diff --check` → PASS。
- Full：`npm test` → **60 files passed / 5 files failed；660 tests passed / 12 failed / 4 todo**。12项失败仍全部来自外部untracked `speclite-drawer-er-modeler`令fixed-count断言从`core=18,total=68`漂移至`core=19,total=69`；focused/affected未出现Story 11.6 regression。

### Governance Decisions（治理决策）

| Surface | Decision | Reason | Evidence |
|---|---|---|---|
| `canonical-source-truth` / `module-discovery-contract` (`D0`) | verified | 本轮只定点修改existing Create UX package内容，未新增、删除或重命名package root；module discovery无需变化。 | canonical warn/strict均`status=ok/findings=[]`；Create UX density PASS。 |
| `release-evidence` (`D0`) | updated | Active packaged source变化要求刷新release evidence。 | build与packaging check PASS；packaging manifests对齐。 |
| `current-public-docs` (`D1`) | updated | Bounded operation coupling是current user-visible UX write contract。 | 两份授权D1 docs已同步；docs check PASS。 |
| `living-legacy-reference` (`D2`) | skipped | Canonical no-copy新增的是fixture evidence，不改变legacy mapping、no-migration策略或maintenance ownership。 | Active contract与D1 docs继续承载既有原位继续规则。 |
| `frozen-historical-record` (`D2`) | historical snapshot | 既有PLAN/EXPERIMENTS/handoff、旧CR summary/evaluation正文保留当时事实，不用current实现静默改写。 | 本Fixer只在本evaluation文末追加修复记录。 |

说明：canonical checker建议的`speclite-canonical-source-governance-runner`未安装于current workspace/Skill roots；本轮按evaluation授权完成等价scoped D0/D1/D2分类，并以现有canonical checker warn/strict闭环。

### Scope Audit（范围审计）

- Finding #3 inactive Architecture duplicate未修，继续留给CR05。
- 未修改Story、tracker、PLAN/EXPERIMENTS/EXPERIMENT_NOTES、completion gate、CR summary、CR04/05/06、PRD/Epic/SPEC、11.7+、external drawer/zip、`.agents`/`.claude` mirrors或fixed-count baselines。
- 未新增public CLI/schema/runtime config/dependency/stable issue ID、UX-local root resolver、通用filesystem transaction层或native `openat`承诺；test interposition仅为internal optional seam，production contract固定不传。
- 无Owner blocker；下一步由root/Flow Gate owner按current结果刷新completion gate，再进入fresh Reviewer Round 4与fresh Evaluator Round 4双PASS门禁。
