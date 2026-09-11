---
Story: 11-8
Round: 2
Date: 2026-09-05
Model Used: GPT-5.6 Sol (gpt-5.6-sol)
Review Source: 11-8-code-review-summary-20260905-round-2.md
Review Model: GPT-5.6 (gpt-5.6)
Type: Code Review Evaluation
---

## 评估总结

对 Story 11-8 的第 2 轮 CR 代码审查结果（复审）进行逐条独立评估。Aggregator 汇总的 3 个 P1 均可由 current source、focused tests、方案 I fixture、Round 1 evaluation/Fix Summary 与 Story/kickoff contract 直接证实：existing artifact-root resolver 的 `ok=false` 被吞掉并触发 Planning-root fallback；candidate-scan 的 control-plane 与 ledger 来自同一可变 fixture，尚未形成独立冻结；实际写入 redirect 的 entrypoint action 被 machine plan 表达为无 rename/replacement binding 的普通 `update`，二次 authorized update 的幂等证据也不存在。3 项全部确认有效并阻塞交付，0 个降级、0 个误报、0 个新增 P2，Owner Gate 为 `NONE`。

本轮修复方向已由 Story 11.8、kickoff、Round 1 Evaluator 与 current schema 唯一限定：resolver failure 必须传播 stable issues 并在 projection/transaction 前 HALT、zero-write；方案 I 必须用独立于 ledger fixture 的 frozen control-plane 校验扫描 roots、exclusions 与 token key/parts；redirect entrypoint 的真实执行 action 必须携带 machine-validated `canonical-skill-renamed` 与唯一 replacement，并通过 plan-to-apply 与二次 authorized update 证明幂等。不得借此扩大到 Story 11.10 broad inventory、external drawer、fixed-count baseline 或 global TypeScript cleanup。

---

## 上轮问题回顾确认

### Round 1 Finding #1 — Phase projection 必填参数错位：已关闭

`createMappedTargetProjection()` 的未消费必填参数已删除；Round 2 三层均确认原 Story-owned `target-writer.ts` `TS2345` 不再存在。本轮不重新授权修改 phase schema 或 `src/ide/target-writer.ts`。

### Round 1 Finding #2 — Grill producer/spec/current docs route 分叉：已关闭

Grill workflow、record spec 与两份 D1 current docs 已统一消费 resolver-provided `{solutioning_artifacts}` fixed child，并删除 `.specskills/output` 第三 fallback。Round 2 Finding #1 是 `src/update/update-plan.ts` existing-update consumer 吞掉 resolver failure 的另一条 production path，不否定 producer/docs closure。

### Round 1 Finding #3 — Old-ID 真实 activation redirect：行为已关闭，machine-plan 语义仍有 residual

两个 old IDs × 两个 IDE targets 的 clean authorized update 已把 historical entrypoint 改写为最小 redirect，并投影唯一 active package/index。Round 2 Finding #3 只裁决执行该 redirect 的 plan action 缺少 typed rename/replacement binding与幂等重放，不能回退为重新设计 redirect/deprecation。

### Round 1 Finding #4 — Authorized apply 与 commit-time precondition：已关闭

Clean apply 与 content、executable、non-file/type、missing 四类 precondition race 已有 current evidence，且均在 journal/operation 前 fail-close。Round 2 不授权修改 `src/fs/update-transaction.ts` 或重复扩张 precondition matrix。

### Round 1 Finding #5 — Bounded classified scan 数据面：已关闭，control-plane 独立性仍有 residual

Current scanner 已实现 raw-byte、no-follow、actual/ledger 双向 equality、role allowlist 与 active-zero；Round 2 Finding #2 只针对决定扫描面的 roots、exclusions、token key/parts 与 ledger 同源可变，不得将修复扩展为 Story 11.10 generic grill inventory。

### Round 1 Finding #6 — Legacy discovery/preservation 行为证据：已关闭

真实 legacy tree 已经过 install/update/repair lifecycle，并证明 path/type/bytes/hash/tree 与 mutation-set invariants。本轮不授权修改 legacy discovery clauses或扩大 legacy corpus。

### 历史 CR TODO（非阻塞）

无。Round 1 与 Round 2 均未产生 Story 11.8 P2；本轮不得把确认的 P1 降级为 CR TODO。

---

## 发现 #1 评估

### 审查原文

> **[高][P1 / PATCH-CODE+TEST] Existing artifact-root resolver failure 被吞掉，rename update 可回退 legacy Planning route继续写入**
> - 来源：edge
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

`src/update/update-plan.ts:576-580` 调用 `resolveExistingArtifactRootContext()`，但该 helper 在 `:611-624` 遇到 `resolveArtifactRoots()` 的 `ok=false` 时只返回 `undefined`，没有返回或传播 `rootResult.issues`。`readPlanningContext()` 随后在 `:595-602` 继续以原 `issues` 计算 `blocked`；resolver failure 因未进入该数组而不会阻断 planning。`buildCanonicalMigrationProjection()` 又在 `:999-1008` 对缺失的 `artifactRootContext` 调用 `createLegacyArtifactRootContext(input.artifactRoot)`，把解析失败误当成可使用 legacy-compatible route 的情形。该分支可达 authorized transaction，finding 成立。

**严重性判断：合理**

不安全、缺失或不可解析的 explicit existing root 本应是 resolver-owned blocker；将其静默降级为 Planning-root fallback 会在错误 route 构造 rename projection，违反已锁定的 HALT/zero-write contract。这是功能与写入安全缺陷，P1 合理。

**修复建议：可行，但必须限定为 failure propagation**

唯一 bounded 修复是在 `src/update/update-plan.ts` 内让 existing-root resolution 显式返回 success context 或 failure issues；`readPlanningContext()` 必须把 failure issues 原样并入 command issues、令 planning blocked，并在调用 `buildCanonicalMigrationProjection()` 与 transaction 前终止。`createLegacyArtifactRootContext()` 只能保留给没有 resolver failure、且由既有 lifecycle contract明确允许的真正 legacy-compatible路径；不得以 `undefined` 代表 resolver failure。无需修改 resolver算法、issue taxonomy、config schema或新增 stable issue ID。

**误报评估：非误报**

Current `if (!rootResult.ok) return undefined`、optional chaining 与 projection fallback 构成完整的 fail-open consumer chain。

---

## 发现 #2 评估

### 审查原文

> **[高][P1 / PATCH-EVIDENCE] Candidate-scan 的 roots、exclusions、tokens 与 ledger 同源自证，可通过缩小 control-plane false-green**
> - 来源：edge
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

`test/implementation-readiness-rename-routing.test.ts:144-160` 从同一 `bounded-surfaces.json` 读取 `candidateRoots`、`excludedPaths`、`searchTokens` 与 `matchLedger`；`:161-185` 又完全以前三者决定遍历面与 needle，最后在 `:186-192` 只将扫描结果与同一 fixture 中的 ledger 对账。Current test没有在读取 fixture 后，先与独立冻结的六个 candidate roots、三个 exact exclusions以及六组 token key/parts进行 exact equality。因而删除 `test`/exact release root、删除 token或新增任意 exclusion并同步删 ledger rows时，current data-plane checks仍可能全绿。

**严重性判断：合理**

AC6/AC9/AC10 要求 candidate-scan 独立关闭 active residual；若扫描 control-plane 可与预期 ledger 同步缩小，gate无法证明它覆盖 kickoff/Evaluator冻结域。这是 Story-owned evidence gate 的结构性 false-green，P1 合理。

**修复建议：可行，采用已确认的方案 I**

在 `test/implementation-readiness-rename-routing.test.ts` 中定义不可从 ledger fixture派生的 frozen control-plane常量，分别 exact-assert：authorized roots为 `assets/source/speclite`、`src`、`test`、`docs`、root `README.md`、exact `release/packaging-manifest.json`；exclusions只允许 legacy docs、external drawer directory与drawer zip三个 exact paths；tokens为六个 exact key/parts。只有这些断言先通过，才可使用 fixture ledger执行现有 raw-byte/no-follow双向对账。应提供一个纯 test-side validator并用 mutation cases证明 missing/extra/变形 root、exclusion或token均fail-close；冻结常量不得从fixture、ledger、当前scan结果或Story 11.10 inventory生成。

Fixture仅可在测试新增 occurrence 确实改变 current bounded ledger时作最小同步；不得把 frozen constants搬回同一JSON，也不得新增 generic grill terms、扩大roots或扫描`_bmad-output`/history。

**误报评估：非误报**

Raw-byte/no-follow和ledger equality只保证被选择的数据面完整，不能证明选择该数据面的control-plane本身不可缩小。

---

## 发现 #3 评估

### 审查原文

> **[高][P1 / PATCH-CONTRACT+TEST] Redirect entrypoint 的实际 update action 丢失 canonical rename/replacement 语义**
> - 来源：blind
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

`src/update/update-plan.ts:1023-1048` 把 historical entrypoint 的 redirect bytes加入 `desired`。因此该文件变化时不会进入 `:188-200` 仅处理 `desired === undefined` 的 `canonical-skill-renamed` skip，而会在 `:241-253` 产生普通 `action=update`。`src/diagnostics/command-result-schema.ts:266-309` 又明确禁止任何 non-skip action携带 `reason`，并把 `replacementCanonicalSkillId`限定为 `canonical-skill-renamed` skip。当前 machine schema与planner因此都无法在真正执行redirect的entrypoint action上表达 old→active identity transition。

`test/update-planning.test.ts:369-442` 的2 IDs × 2 targets矩阵只验证 `changedPaths`、redirect最终正文、active package和indexes；它没有检查执行old entrypoint的plan action，也没有在同一project上执行第二次authorized update。因此completion gate关于显式rename/replacement与幂等的声明不可由current test重放。

**严重性判断：合理**

AC7要求update plan显式展示rename/reprojection。Minimal historical package只有entrypoint时，不存在companion stale files提供间接rename skip；真实执行动作若只是普通update，machine consumer无法确定replacement identity。最终文件正确不足以替代plan contract，P1合理。

**修复建议：可行，使用同一 action 的 typed binding**

唯一 bounded修复是扩展 `UpdatePlanActionSchema` 的受控组合：允许 `action=update` 在且仅在 `reason=canonical-skill-renamed` 时携带唯一 `replacementCanonicalSkillId`；其他non-skip action仍必须省略reason/replacement，`canonical-skill-renamed` 的 existing skip语义继续有效。Planner必须基于 files-index old entrypoint、全局唯一 rename mapping与生成的redirect desired entry，在首次clean plan的实际old entrypoint `update` action上设置这两个字段；二次authorized update对同一redirect entrypoint应产生带同一binding的幂等 `skip`，不得退化为无identity的`unchanged`记录。Drifted old package仍必须在projection/apply前按既有 conflict路径fail-close。

测试必须在2 IDs × 2 IDE targets上建立 plan→apply binding：首次plan的old entrypoint action为typed rename `update`、replacement唯一且changedPaths包含old/active entries；随后在同一project执行第二次`yes: true` update，断言无额外writes、old redirect bytes/hash不变、active package/index mapping不变，并由old entrypoint的幂等plan record继续暴露同一typed rename/replacement。不得依赖companion old files，也不得新增另一套平行rename result schema。

**误报评估：非误报**

Current planner分支与schema约束直接排除了实际redirect update携带rename metadata，且current矩阵确实只执行一次update。

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | Existing resolver failure被吞并回退Planning route | [高] | **P1** | 传播resolver issues，在projection/transaction前HALT并保持zero-write。 |
| 2 | 方案I control-plane与ledger同源可缩面 | [高] | **P1** | 以独立test-code frozen contract先exact校验roots/exclusions/tokens，再运行ledger对账。 |
| 3 | Redirect entrypoint执行action缺少rename/replacement与幂等证据 | [高] | **P1** | actual update与二次skip均携带machine-validated唯一binding，并完成2×2 plan→apply重放。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

无新增 P2。本轮不得把任何确认P1降级为TODO。

### 可忽略（误报）

无。Acceptance Auditor的PASS正确确认Round 1既定六项closure，但未覆盖另外两层发现的三条current residual，不构成驳回依据。

### Fixer 授权边界

Fresh Fixer只获准修改以下文件：

- `src/update/update-plan.ts`
- `src/diagnostics/command-result-schema.ts`
- `test/update-planning.test.ts`
- `test/implementation-readiness-rename-routing.test.ts`
- `test/fixtures/implementation-readiness-rename-routing/bounded-surfaces.json`（仅当新增focused断言造成真实bounded occurrence变化时，最小同步ledger；不得承载frozen control-plane）
- 本 evaluation 文档，仅追加 Fix Summary（修复摘要）。

上述白名单覆盖唯一 production与evidence路径。不得修改artifact-root resolver算法、`src/config/artifact-root-resolver.ts`、`src/fs/update-transaction.ts`、module/manifest/phase schema、SPEC、Story、tracker、completion gate、root logs、Round 1/2 review artifacts、canonical Skill正文、D1 docs、legacy artifacts、Story 11.9/11.10、generic grill semantics、IR algorithm/scoring/body、dependencies、external drawer/zip、workspace `.agents/.claude` mirrors、fixed-count baselines或其他文件。若白名单不足，Fixer必须停止并返回Evaluator重新裁决，不得自行扩展。

### RED / GREEN 与验证授权

Fixer必须先添加可在current实现上失败的focused断言并记录RED；不得把现有`47/47`写成本轮finding的RED。

RED至少由以下三组current-failing证据组成：

1. 在existing explicit Solutioning root构造symlink escape或等价resolver `ok=false`，执行`yes: true` update；current应错误地缺失stable resolver issue或继续产生migration plan。断言目标是issue原样保留、command HALT、`updatePlan.actions=[]`、`changedPaths=[]`、无journal/partial write。
2. 对方案I control-plane validator分别注入missing root、extra exclusion与变形token key/parts；current尚无独立validator，新增mutation assertions必须先失败。不得通过直接修改真实fixture并遗留脏状态来制造RED。
3. 在2 IDs × 2 targets首次clean plan中断言old entrypoint action为`update + canonical-skill-renamed + replacementCanonicalSkillId`，并立即执行第二次authorized update断言幂等typed skip与zero additional writes；current schema/planner/单次矩阵必须先失败。

GREEN至少证明：

1. Resolver `ok=false`的stable issues进入command result并阻断所有migration projection/transaction；`updatePlan.actions=[]`、`changedPaths=[]`、无journal/partial write。明确的resolver success `legacy-compatible`仍消费其resolved roots，不能被本修复破坏。
2. 方案I的frozen roots、exact exclusions与六组token key/parts独立存在于test code；fixture缺失、额外或语义变形任一control-plane项均在scan前fail-close。其后current raw-byte/no-follow、duplicate/extra/missing match、role allowlist与actual/ledger双向equality继续全绿。
3. 两old IDs × `.agents`/`.claude` 四种组合的首次actual redirect action均为typed rename `update`并携带唯一replacement；apply后redirect仍是唯一active implementation的最小入口，active package/index一致。
4. 同一四种组合的第二次authorized update不产生任何额外changed path或文件/index mutation；old entrypoint plan record为携带同一rename/replacement binding的幂等`skip`。Modified-old conflict与既有四类precondition证据保持全绿。
5. `UpdatePlanActionSchema`拒绝所有非法组合：普通create/update/conflict带reason、rename action缺replacement、non-rename action带replacement；只接受既有合法skip以及本轮精确授权的redirect-entrypoint rename update/skip。

允许运行：

- `npx vitest run test/update-planning.test.ts test/implementation-readiness-rename-routing.test.ts --reporter=dot`
- 如需验证machine schema相关既有覆盖，可运行包含`UpdateCommandResultSchema`的精确related test文件，但不得修改它；发现必须修改时先停止并返回Evaluator。
- 上述白名单文件的`git diff --check`与精确diff越界审计。

不得运行`npm run build`、full suite、packaging、canonical governance或global `npx tsc --noEmit`。不得把Story 11.10 broad inventory、drawer/global fixed-count失败或其他Story TypeScript baseline混入RED/GREEN。Fixer完成后由outer Flow Gate owner刷新completion gate，再进入fresh Reviewer Round 3；latest Reviewer/Evaluator双PASS前不得进入CR04、CR05或CR06。

### 评估决定

- **发现 #1（existing resolver failure fail-open）**：确认P1；只授权failure issue propagation、projection前HALT与zero-write，不改resolver算法或issue taxonomy。
- **发现 #2（方案I control-plane同源自证）**：确认P1；只授权独立test-code frozen contract与mutation proof，保留现有bounded data-plane，不扩大到Story 11.10。
- **发现 #3（redirect执行action machine semantics）**：确认P1；actual redirect `update`与幂等`skip`都必须携带唯一rename/replacement binding，不新增平行result surface。
- **Owner Gate**：`NONE`。三项均由Story、kickoff、Round 1已选方案与current contract唯一确定。
- **整体决定**：`FAIL`。3项修复、completion gate刷新及fresh Reviewer/Evaluator双重确认完成前，不得进入CR04、CR05或CR06。

## 修复执行记录

### 修复执行记录
- **Date**: 2026-09-05
- **Model Used**: GPT-5.6 (gpt-5.6)
- **Fix Items**: 3

#### Fix Results（修复结果）

1. **Existing root resolver failure fail-close**：已完成。
   - 在 `src/update/update-plan.ts` 将 existing-root resolution 改为显式 success/failure 结果；resolver `ok=false` 时原样并入 stable issues，并在 migration projection 与 transaction 前返回 blocked empty plan。
   - 保留无任何 artifact-root 配置时的真实 `legacy-compatible` context；明确配置 root 但解析失败时不再回退 Planning route。
   - 新增 symlink escape focused evidence，确认 `artifact-path.symlink-escape`、`updatePlan.actions=[]`、`changedPaths=[]` 且无 update journal。

2. **方案 I 独立冻结 control-plane**：已完成。
   - 在 `test/implementation-readiness-rename-routing.test.ts` 独立冻结六个 candidate roots、三个 exact exclusions 与六组 token key/parts；冻结值不从 fixture、ledger、scan result 或 Story 11.10 inventory 派生。
   - scan 前执行 exact validator；missing root、extra exclusion、变形 token 的 mutation cases 均 fail-close。
   - 保留既有 raw-byte/no-follow、role allowlist 与 actual/ledger 双向 equality，不修改 `bounded-surfaces.json`。

3. **Redirect entrypoint typed rename plan 与幂等重放**：已完成。
   - `UpdatePlanActionSchema` 仅新增接受 `update + canonical-skill-renamed + replacementCanonicalSkillId`；既有 typed rename `skip` 保持有效，其他 non-skip reason/replacement 组合继续拒绝。
   - planner 对实际 old entrypoint redirect update 与后续 unchanged replay skip 均投影唯一 replacement binding。
   - 将 redirect 的 installed-state `sourceRef` 收敛为符合既有 stable token grammar 的 `installed-state:canonical-skill-redirect/<active-id>`，保证二次读取 `files-index` 可解析。
   - 两个 old IDs × `.agents`/`.claude` 四种组合均验证首次 typed update、apply 后最小 redirect/active package/index 一致，以及二次 authorized update `changedPaths=[]`、typed skip、四个关键文件 byte/hash 不变。

#### RED / GREEN Evidence（红绿证据）

- **RED**：`npx vitest run test/update-planning.test.ts test/implementation-readiness-rename-routing.test.ts --reporter=dot` → `41 passed / 4 failed`。四个失败分别命中 resolver issue 丢失、control-plane validator 缺失、schema 拒绝 typed rename update、redirect action 缺少 rename/replacement binding。
- **中间回归校正**：首次实现将无 root 配置的 legacy install 也视为 resolver failure，focused 暴露 `23 failed / 22 passed`；随后恢复该唯一合法 legacy-compatible 分支。二次幂等测试进一步发现双冒号 `sourceRef` 不符合既有 schema，修正为单冒号 stable token 后定向 `2×2` 测试通过。
- **GREEN**：同一授权 focused 命令最终 `2 files passed / 45 tests passed`。
- **Diff audit**：授权文件 `git diff --check` 通过；fixture diff 为 `0`。未运行 build、full suite、packaging、canonical governance 或 global TypeScript 检查。

#### Scope Audit（范围审计）

- 修改范围仅限 `src/update/update-plan.ts`、`src/diagnostics/command-result-schema.ts`、`test/update-planning.test.ts`、`test/implementation-readiness-rename-routing.test.ts`，以及本 evaluation 的追加记录。
- 未修改 Story、tracker、completion gate、root logs、SPEC/schema 文档、artifact-root resolver、transaction、Story 11.9/11.10、external drawer、fixed-count baseline 或 workspace mirrors。
