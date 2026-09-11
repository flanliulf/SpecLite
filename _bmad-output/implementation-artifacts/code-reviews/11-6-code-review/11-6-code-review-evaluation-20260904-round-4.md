---
Story: 11-6
Round: 4
Date: 2026-09-04
Model Used: GPT-5.5 (gpt-5.5)
Review Source: 11-6-code-review-summary-20260904-round-4.md
Review Model: GPT-5.5 (gpt-5.5)
Type: Code Review Evaluation
---

## 评估总结

对 Story 11-6 的第 4 轮 CR 代码审查结果（复审）进行逐条独立评估。Round 4 正式三层结果完整：Blind 为 `FAIL / 1 P1`，fresh replacement Edge 与 Acceptance 均为 `PASS / 0`。独立检查 active Create UX ZH/EN Skill、Step 1、workflow details、current source/test import graph、tsup/package发布面、installer Skill package投影、fresh installed-tree/index fixture及current completion gate后，确认 R4-1 成立，但其边界必须保持为 **installed private binding缺失**，不得泛化成新增public CLI。

本轮总体结论为 **FAIL**：R4-1 是一个 P1 delivery blocker。Active workflow已明确要求执行“runtime-internal bounded operation”，但current installed Skill没有可定位的script、exact invocation、input/result contract或HALT映射；`executeUxArtifactOperation()`仅存在于未发布的`src/`与repo-local direct-import tests。唯一最小修复是将该operation收口为Create UX canonical Skill-local private Node script，并让repository harness与installed invocation消费同一份实现。**Owner Gate为`NONE`**。既有inactive Architecture wildcard维持P2 defer，不得在本轮夹带修复。

---

## 上轮问题回顾确认

### Round 3 Finding #1：源码operation coupling已实现，但installed consumption尚未闭环

`executeUxArtifactOperation()`已在同一函数内执行initial check、test-only interposition、commit-time revalidation与actual exclusive `writeFile(..., { flag: "wx" })` / single `mkdir`（`src/config/ux-artifact-routing.ts:182-241`）；Round 3 focused harness也覆盖normal create、existing preservation与受控owner replacement（`test/ux-artifact-routing.test.ts:370-493`）。这些证据证明operation行为本身，而不证明fresh installed Skill能够定位并调用它。

### Round 3 Finding #2：已修复

Round 4没有推翻install/update/repair逐阶段legacy source preservation与全部canonical counterpart no-copy evidence的新证据，维持已关闭。

### 历史 CR TODO（非阻塞）

| # | 发现 | 状态 | 评估意见 |
|---|------|------|---------|
| R1-#8 | inactive Architecture duplicate step仍含`*ux-design*.md` | CR TODO / 非阻塞 | 同意继续维持P2 defer；Round 4 Fixer不得处理。 |

---

## 发现 #1 评估

### 审查原文

> **[P1] Required bounded operation未投影为installed Skill可执行能力**
> - 来源：blind + Aggregator package inspection
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确，但必须限定为private installed artifact availability与consumption gap**

Active Step 1明确要求使用“runtime-internal bounded operation”完成template到canonical main的exclusive create（`assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-ux-design/references/steps/step-01-init.md:88-93`）；active workflow details又要求所有canonical `wx` create与on-demand `mkdir`都由同一operation执行（`assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-ux-design/references/workflow-details.md:67-75`）。然而两处均未给出operation名称、script位置、exact command、参数、machine result或HALT mapping。

Current executable implementation只在`src/config/ux-artifact-routing.ts:182-241`定义。全仓production/test reference scan显示，除CR历史与completion gate文字外，只有`test/ux-artifact-routing.test.ts:13-19,370-493`直接import/call它；没有production caller。`package.json:22-30`只发布`dist/`与canonical assets，`tsup.config.ts:3-15`唯一entry为`src/bin/speclite.ts`，而该helper不在CLI import graph/bundle中。与此同时，installer的canonical package allowlist确实允许`scripts/`（`src/fs/copy-tree.ts:7-10,45-67`），但current Create UX installed-tree只有assets/references/SKILL，没有script（`test/fixtures/fresh-install-empty-project/expected/installed-tree.txt:349-373,1049-1073`）。因此真实fresh `.agents` / `.claude` workflow在到达required operation时无法消费repo-local helper。

Current completion gate把`executeUxArtifactOperation()`及68-case direct-import suite列为PASS evidence（`_bmad-output/implementation-artifacts/flow-gates/11-6-consolidate-ux-artifacts-under-the-planning-ux-space-story-completion-gate.md:33,42`），但没有installed script存在性、files-index/hash或installed invocation证据。其PASS陈述超出了current executable evidence。

**严重性判断：合理**

这不是文档可读性建议。若agent按required contract执行，它必须因operation不可定位而HALT；若自行拼装raw Bash/inline Node，则无法证明真实write与68-case tested primitive共享physical-owner、nearest-existing-ancestor、exclusive-create和structured-halt语义。该断点直接使AC2、AC3、AC4、AC5、AC6、AC7与AC10未闭环，因此P1合理。

**修复建议：可行，采用唯一Skill-local private Node binding**

Fixer必须采用以下唯一bounded方案；不授权选择public或shared runtime surface：

1. 在canonical `speclite-create-ux-design/scripts/`新增一个private Node ESM executable，例如`scripts/ux-artifact-operation.mjs`。该文件同时导出repository test harness可调用的`executeUxArtifactOperation()`并在direct invocation时执行CLI adapter；owner/ancestor guard、exclusive `wx` create、single non-recursive on-demand `mkdir`、structured result与test-only interposition后的commit-time revalidation只保留这一份implementation source。不得保留现有TypeScript helper与新script两套可独立漂移的operation逻辑。
2. `src/config/ux-artifact-routing.ts`只能删除现有operation实现或变成对上述同一module的最薄内部适配；若不再需要source wrapper，focused test直接import canonical script的export。Routing/discovery API可保留，但不得再有第二份actual create/mkdir implementation。
3. Private CLI只允许两个operation：`create-file`与`create-directory`。Exact invocation固定为：
   - `node "{skill-root}/scripts/ux-artifact-operation.mjs" create-file --project-root "{project-root}" --planning-root "{planning_artifacts}" --target "{target}" --source "{source-file}"`
   - `node "{skill-root}/scripts/ux-artifact-operation.mjs" create-directory --project-root "{project-root}" --planning-root "{planning_artifacts}" --target "{target}"`
4. CLI始终只向stdout写一个JSON object。成功必须为`{ "ok": true, "targetPath": "...", "operation": "create-file|create-directory" }`并exit `0`；参数、guard或filesystem失败必须为`{ "ok": false, "targetPath": "...|null", "reason": "..." }`并non-zero。不得新增public schema、`schemaVersion`、stable issue ID或CLI command。Active workflow对non-zero、invalid JSON或`ok !== true`一律HALT，且不得推进frontmatter/progress/append target。
5. `--source`只提供create-file bytes；operation读取完成后仍须在同一实现中执行commit-time guard与immediate exclusive create。Unknown flags必须fail closed。`__testOnlyInterposeBeforeCommit`只能是repository import harness的函数参数；direct installed CLI不得接受对应argv、stdin字段、environment knob或active workflow输入。
6. Active ZH/EN `SKILL.md` / `SKILL.en.md`、shared workflow details及实际执行create/mkdir的Step 1、Step 8、Step 9、Step 11、completion checklist必须指向上述`{skill-root}` exact commands与统一JSON/HALT mapping。不得仅写“调用bounded operation”。D1 `docs/reference/workflow-artifact-layout.md`与`docs/reference/skills/sdlc-workflows.md`也必须记录同一exact private command pattern和失败语义，避免current docs继续宣称不可定位能力。

该方案沿用Node `>=22`与现有Skill package `scripts/`投影模型，不新增dependency、public CLI、runtime config、schema、stable identifier或通用workflow engine；因此实现选择唯一且无需Owner决策。

**误报评估：非误报**

Round 2驳回的是“repo-local helper没有连接public CLI，所以必须新增public runtime surface”的主张。本轮证据不同：Round 3后的active Step已强制要求调用一个具体runtime-internal operation，而installed package没有任何private binding。修复只需Skill-local script，不推翻Round 2对public CLI扩面的驳回。

---

## 发现 #2 评估

### 审查原文

> **[P2] Shipped inactive Architecture duplicate step仍含`*ux-design*.md` wildcard**
> - 来源：prior auditor
> - 分类：defer

### 评估结论：⚠️ 有效但降级 — 建议纳入 CR TODO 跟踪（P2 优先级）

### 评估分析

**问题描述准确性：准确**

该duplicate source的wildcard drift此前已经确认；Round 4没有其进入active Create Architecture execution path的新证据。

**严重性判断：合理**

它是shipped maintenance drift，但不是本轮installed Create UX operation blocker，维持P2。

**修复建议：可行但本轮不授权**

继续由CR05登记；不得借private script修复修改inactive Architecture duplicate。

**误报评估：非误报**

Finding有效，仅处置为defer。

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | Active Create UX required bounded operation没有installed private executable binding | P1 | **P1** | Current helper只在unpublished source/test中，fresh installed workflow无法定位或调用。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 2 | inactive Architecture duplicate仍含UX wildcard | P2 | **P2** | 维持既有defer，CR05登记。 |

### 可忽略（误报）

| # | 发现 | 原始严重性 | 忽略理由 |
|---|------|----------|---------|
| C1 | 必须新增public`speclite ux ...` CLI | 候选 | Skill-local`scripts/`已由installer支持，private binding足以闭环，不得扩建public surface。 |
| C2 | Current test-only hook已形成独立production exploit surface | 候选 | Current module没有production caller且未进入bundle/installed tree；只需保证新direct CLI不暴露该hook。 |

### Owner Gate（Owner 门禁）

- **结论：`NONE`。** Story允许调整workflow internal helper；Node runtime、Skill-local`scripts/`投影、operation semantics与public-surface禁止项均已有唯一证据。
- 只有Fixer发现必须新增public CLI/shared runtime command/schema/dependency或改变product contract时才必须停止并升级Owner Gate；本evaluation不授权这些方案。

### Fix Authorization（修复授权）

授权一个fresh Fixer仅修复Finding #1：

1. `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-ux-design/scripts/ux-artifact-operation.mjs`：新增唯一private operation/CLI source；可按最小需要增加同目录纯type/comment辅助文件，但不得复制operation逻辑。
2. `src/config/ux-artifact-routing.ts`：仅删除repo-only operation implementation或做对canonical script export的薄适配，保留routing/link behavior；不得新增public export entry或CLI wiring。
3. `test/ux-artifact-routing.test.ts`：repository operation tests必须消费canonical script同一export；新增real fresh-installed-tree invocation matrix，至少分别从`.agents`和`.claude` installed copy执行main create与design-system mkdir，并覆盖existing target、unsafe owner、missing-target nearest ancestor的regular-file/FIFO/dangling/out-of-project/cross-space negatives、JSON result、exit code与zero mutation。Test-only interposition继续只通过repository module import触发，并证明installed argv/env/input不存在该seam。
4. Active Create UX ZH/EN Skills、`references/workflow-details.md`、`step-01-init.md`、`step-08-visual-foundation.md`、`step-09-design-directions.md`、`step-11-component-strategy.md`、`step-14-complete.md`：仅同步exact private command、source input与structured HALT mapping。
5. Generated/fixture evidence：script必须由installer投影到`.agents`与`.claude`；`files-index.json`中两份entry的`sourceRef`、SHA-256、`executable` metadata必须与canonical bytes/mode一致，Skill package hash必须刷新；同步受影响的`test/fixtures/fresh-install-empty-project/expected/installed-tree.txt`、`installed-state/files-index-full.json`、`skill-index-full.json`及确因deterministic regeneration发生变化的其他fresh-install fixture，禁止无关fixture churn。
6. Release evidence：刷新`release/packaging-manifest.json`，证明canonical script进入npm package inventory；generated `dist/packaging-manifest.json`只作为build/packaging验证产物处理。
7. D1 current docs：仅定点更新`docs/reference/workflow-artifact-layout.md`与`docs/reference/skills/sdlc-workflows.md`，写入上述exact `{skill-root}` command pattern、JSON/non-zero HALT mapping及private/non-public边界。
8. 本evaluation文件只允许Fixer在文末追加规范的`修复执行记录`，不得改写裁决正文。Completion gate由root/Flow Gate owner在current验证完成后刷新，Fixer不得自行修改。

不授权修改Story、Epic、PRD、SPEC 07/09、sprint tracker、PLAN/EXPERIMENTS/EXPERIMENT_NOTES、既有CR summaries/evaluations正文、CR rules/TODO、inactive Architecture duplicate、11.7+、external drawer package/zip、workspace `.agents`/`.claude` mirrors或fixed-count baselines。不得运行或修改public CLI/schema/runtime config/dependency/stable issue ID。

### Required Verification（必需验证）

Fixer至少必须提供：

- repository focused suite证明current 68 cases保持green，并由同一canonical script export执行operation；新增cases后报告current总数；
- real installer创建的fresh temp project中，`.agents/skills/speclite-create-ux-design/scripts/ux-artifact-operation.mjs`与`.claude/...`均存在，canonical/两份installed bytes hash一致，files-index entries的hash/sourceRef/mode准确；不得以手工复制mirror替代install evidence；
- 从`.agents` installed script执行main create：读取installed `{skill-root}/assets/ux-design-template.md`，exclusive create成功并返回single JSON/exit 0；再次执行返回structured failure/non-zero且existing bytes不变；
- 从`.claude` installed script执行on-demand `design-system` mkdir：只创建exact directory，不创建无关descendant；existing directory返回structured failure且不变；
- installed invocation owner/ancestor negative matrix：regular-file/FIFO/dangling、out-of-project与project内cross-space symlink均fail closed，target/cross-space/progress zero mutation；
- repository-only interposition matrix继续覆盖initial check后替换`ux/`与`design-system/`；static/dynamic evidence证明direct CLI不接受任何test hook argv/env/input；
- fresh-install deterministic fixture comparison，至少覆盖installed-tree、files-index full与Skill package hash；release packaging inventory包含新script；
- affected tests、build、docs、changed Skill density、packaging、canonical normal/strict与`git diff --check`；full suite继续将external drawer fixed-count drift与Story regression分开报告；
- root/Flow Gate owner基于新的installed invocation结果刷新completion gate，移除“仅repo-local direct import即可证明installed execution”的过度陈述；随后进入fresh Reviewer Round 5与fresh Evaluator Round 5，只有latest双PASS才可进入CR04。

### Governance Decisions（治理决策）

| Surface | Decision | Required handling |
|---|---|---|
| `canonical-source-truth` / `module-discovery-contract` (`D0`) | `updated + verify` | 新canonical Skill script与installer投影、files-index/hash、package hash、release inventory必须一致；module root数量不变。 |
| `current-public-docs` (`D1`) | `updated` | 两份current reference docs必须记录exact private command与HALT mapping。 |
| `living-legacy-reference` (`D2`) | `skipped` | Operation binding不改变legacy discovery/no-migration contract。 |
| `frozen-historical-record` (`D2`) | `historical snapshot` | 既有Story/CR/gate历史正文不静默回写；只按工作流追加fix record并由root刷新current gate。 |

Canonical governance runner在current workspace不可用时，Fixer必须记录等价D0/D1/D2 targeted decisions，并运行现有`speclite-check-canonical-source-change` normal/strict闭环；不得以warning-only hook替代installed invocation evidence。

### Scope Boundary（范围边界）

- 本轮只把已确定的bounded operation从repo-only oracle投影为installed private Skill能力，不建立public UX CLI、通用filesystem transaction或shared runtime API。
- Machine-readable result是private invocation protocol，不新增schemaVersion、stable public identifier或ValidationIssue taxonomy。
- `__testOnlyInterposeBeforeCommit`只属于repository import harness；installed executable的argv/env/input永不暴露该seam。
- Finding #2仅进入CR TODO；external drawer、workspace mirrors与fixed counts继续隔离。

### 评估决定

- **发现 #1**：确认有效，P1 patch；采用唯一canonical Skill-local private Node script，将operation implementation、repository harness与真实installed invocation收口到同一source-of-truth。
- **发现 #2**：确认有效，P2 defer；CR05登记，本轮不修。
- **候选 C1—C2**：均不形成新增修复项。
- **Owner Gate**：`NONE`。
- **Overall**：`FAIL`。
- **Next**：fresh Fixer仅按上述授权修复Finding #1并追加fix record；root/Flow Gate owner刷新current completion gate；随后进入fresh Reviewer Round 5与fresh Evaluator Round 5双PASS门禁。

## 修复执行记录

### 修复执行记录

- **Date**: 2026-09-04
- **Model Used**: GPT-5.5 (gpt-5.5)
- **Fix Items**: 1
- **Result**: Finding #1 已按本评估唯一授权完成；Finding #2 inactive Architecture wildcard 保持未修复并继续 defer 至 CR05。

### Fix Results（修复结果）

| Finding | Result | Targeted implementation and evidence |
|---|---|---|
| #1 installed private executable binding | fixed | 新增canonical executable `speclite-create-ux-design/scripts/ux-artifact-operation.mjs`，同一文件同时export repository harness消费的`executeUxArtifactOperation()`并提供direct private CLI。Physical UX owner、nearest-existing-ancestor、initial/final guard、exclusive `writeFile(...,{flag:"wx"})`、single non-recursive `mkdir`、structured result和test-only interposition后的commit-time revalidation只保留这一份implementation；`src/config/ux-artifact-routing.ts`删除原operation/create/mkdir实现，仅保留route/reference逻辑。CLI严格限定`create-file`与`create-directory`及其exact ordered flags，stdout恰一个JSON；invalid args、unknown flags、guard/fs failure均返回`ok:false`和non-zero。Test-only seam只存在import参数，direct argv/env/stdin探测全部fail closed。 |

### Installed Consumption Evidence（Installed 消费证据）

- `runInstallCommand()`在fresh temp project真实生成`.agents`与`.claude` copies；两份script bytes hash均与canonical一致，mode均executable，`files-index`的`hash`、`sourceRef`、`executable:true`一致，`skill-index.canonicalPackageHash`与installable canonical package hash一致。
- `.agents` installed script以installed `assets/ux-design-template.md`执行canonical main `create-file`：single JSON / exit 0，目标bytes exact；重复执行single structured failure / non-zero且existing bytes不变。
- `.claude` installed script执行`design-system` `create-directory`：single JSON / exit 0，只创建exact empty directory；重复执行structured failure / non-zero且目录不变。
- 两份installed scripts交替覆盖owner与nearest-existing-ancestor的regular-file、FIFO、dangling、out-of-project symlink、project内cross-space symlink，以及lexical out-of-project/cross-space targets；均single JSON / non-zero，outside/docs/target零operation mutation。
- Repository import matrix继续覆盖initial check后替换`ux/`或`design-system/`的final revalidation；direct CLI同时注入unknown test-hook argv、stdin和environment knob仍返回`invalid-cli-arguments`且不创建probe target。

### Files Changed（变更文件）

- 新增：`assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-ux-design/scripts/ux-artifact-operation.mjs`。
- 更新：`src/config/ux-artifact-routing.ts`、`test/ux-artifact-routing.test.ts`。
- Active Create UX ZH/EN contract：`SKILL.md`、`SKILL.en.md`、`references/workflow-details.md`、`step-01-init.md`、`step-08-visual-foundation.md`、`step-09-design-directions.md`、`step-11-component-strategy.md`、`step-14-complete.md`；均写明exact `{skill-root}` command、single JSON / non-zero HALT mapping与private/non-public边界。
- D1 current docs：`docs/reference/workflow-artifact-layout.md`、`docs/reference/skills/sdlc-workflows.md`。
- D0 deterministic evidence：`test/fixtures/fresh-install-empty-project/expected/installed-tree.txt`、`installed-state/files-index-full.json`、`skill-index-full.json`仅定点刷新Create UX package projection；`release/packaging-manifest.json`由packaging check刷新。

### Verification（验证）

- Focused：`npx vitest run test/ux-artifact-routing.test.ts` → **1 file / 69 tests passed**（原68保持green + 1个real installed invocation matrix case）。
- Affected：UX、artifact roots/documents、config initialization、file integrity/ownership、update planning与ownership model → **7 files / 231 tests passed**。
- Fresh fixture相关组合：UX + runtime structure + fixture release gates → **1 file passed / 2 files failed；85 tests passed / 3 failed**；3项仅为external drawer造成的`68→69` fixed-count drift，Create UX installed projection与invocation无回归。
- Build：`npm run build` → PASS。
- Docs：`npm run docs:check` → **72 Markdown files / 5 drafts**，PASS。
- Changed Skill density：Create UX ZH/EN均无`triggered_density_warning`。
- Packaging：`npm run release:packaging-check` → PASS；release/dist manifests均包含新script。`npm pack --dry-run --json`确认该script进入npm inventory且mode=`493`（`0755`）。
- Canonical governance/checker：按`speclite-canonical-source-governance-runner`完成impact classification；warn与strict均`status=ok`、`findings=[]`。Current scan为`core=19`、`sdlc=50`、`support=8`、`hooks=2`、`defaultInstall.total=69`，其中额外core root仅来自隔离的external drawer。
- Diff hygiene：`git diff --check` → PASS。
- Full：`npm test` → **60 files passed / 5 files failed；661 tests passed / 12 failed / 4 todo**。12项失败全部是既存external untracked `speclite-drawer-er-modeler`使fixed-count断言从`core=18,total=68`漂移至`core=19,total=69`；Story 11.6 focused/affected无回归。

### Governance Decisions（治理决策）

| Surface | Decision | Reason | Evidence |
|---|---|---|---|
| `canonical-source-truth` / `module-discovery-contract` (`D0`) | updated / verified | 在existing SDLC Skill package内新增private script，但未新增、删除或重命名package root；script projection/hash/mode、Skill package hash与fixture均定点同步，module root数量不因本Finding变化。 | Real installer matrix；files/skill indexes；canonical warn/strict `status=ok/findings=[]`；density PASS。 |
| `release-evidence` (`D0`) | updated | Packaged canonical source新增executable script，必须进入release inventory。 | build、packaging check与npm pack inventory/mode均PASS。 |
| `current-public-docs` (`D1`) | updated | Installed private invocation与failure/HALT语义是current workflow可执行行为。 | 两份授权D1 docs与active ZH/EN workflow均含exact commands；docs check PASS。 |
| `living-legacy-reference` (`D2`) | skipped | Private operation binding不改变legacy discovery、原位继续或no-migration contract。 | Current active contract与D1 docs继续承载既有legacy边界。 |
| `frozen-historical-record` (`D2`) | historical snapshot | 既有Story、CR正文、PLAN/EXPERIMENTS、gate与handoff保持当时事实；只在本evaluation文末追加本轮记录。 | 最终scope audit。 |

### Scope Audit（范围审计）

- Finding #2 inactive Architecture duplicate未修，继续留给CR05。
- 未修改Story、tracker、PLAN/EXPERIMENTS/EXPERIMENT_NOTES、completion/kickoff gate、CR summary、CR04/05/06、PRD/Epic/SPEC、11.7+、external drawer package/zip、workspace `.agents`/`.claude` mirrors或fixed-count baselines。
- 未新增public `speclite` CLI、schema、dependency、runtime config、stable issue ID、通用filesystem transaction或shared runtime API；private JSON protocol无`schemaVersion`。
- `src/config/ux-artifact-routing.ts`不存在第二份operation/create/mkdir逻辑；test interposition没有argv/env/stdin入口。
- 无Owner blocker；下一步由root/Flow Gate owner以current installed evidence刷新completion gate，再进入fresh Reviewer Round 5与fresh Evaluator Round 5双PASS门禁。
