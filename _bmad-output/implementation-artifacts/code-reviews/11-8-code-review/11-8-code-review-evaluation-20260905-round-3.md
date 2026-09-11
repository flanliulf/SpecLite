---
Story: 11-8
Round: 3
Date: 2026-09-05
Model Used: GPT-5.6 Sol (gpt-5.6-sol)
Review Source: 11-8-code-review-summary-20260905-round-3.md
Review Model: GPT-5.6 (gpt-5.6)
Type: Code Review Evaluation
---

## 评估总结

对 Story 11-8 的第 3 轮 CR 代码审查结果（复审）进行逐条独立评估。Aggregator 汇总的唯一 P1 可由 current test control flow、Round 2 Evaluator 已冻结的方案 I、Story AC6/AC9/AC10 与 current completion evidence 直接证实：fixture validator 只允许三个 exact exclusions，但实际 candidate walker 又在该合同之外无条件跳过任意层级 basename 为 `dist` 或 `node_modules` 的子树。该分叉可令冻结 roots 内的 old-ID/path residual 不进入 raw-byte scan、逐 match ledger或 active-role failure，从而 false-green。

本评估确认该 finding 有效并阻塞交付；0 个降级、0 个误报、0 个新增 P2，Owner Gate 为 `NONE`。最小修复仅限同一 focused test 文件内删除两个未授权 basename skip，并使用临时 candidate tree 建立 RED/GREEN mutation proof；不修改 production、fixture ledger、Story 11.10 broad inventory或 external drawer。

---

## 上轮问题回顾确认

### Round 2 Finding #1 — Existing artifact-root resolver failure fail-open：已关闭

`src/update/update-plan.ts` 已将 existing-root resolution 表达为显式 success/failure；resolver `ok=false` 的 stable issues 被并入 command result，并在 migration projection 与 transaction 前返回 blocked empty plan。Round 3 三层均未发现该路径回归，本轮不重新授权修改 resolver、planner或 diagnostics。

### Round 2 Finding #2 — 方案 I control-plane 与 ledger 同源可缩面：声明层已关闭，walker effective-domain 出现独立 residual

`test/implementation-readiness-rename-routing.test.ts:24-44,262-275` 已在 test code 中独立冻结六个 roots、三个 exact exclusions与六组 token key/parts，并在 ledger scan 前 exact 校验。Round 3 finding 不否定该声明层修复，而是指出 `:277-298` 的实际 walker 另有绕过 frozen exclusions 的控制分支；本轮只授权关闭这一 residual。

### Round 2 Finding #3 — Redirect action 缺 machine rename/replacement 与幂等证据：已关闭

Actual old entrypoint 首次 `update` 与二次幂等 `skip` 已携带 machine-validated `canonical-skill-renamed` 和唯一 `replacementCanonicalSkillId`，两 old IDs × 两 IDE targets 的 plan/apply/replay evidence 均已完成。Round 3 三层未发现回归，本轮不重新授权修改 action schema、planner或 update tests。

### 历史 CR TODO（非阻塞）

无。Round 1 至 Round 3 均未产生 Story 11.8 P2；本轮不得将唯一 P1 降级为 CR TODO。

---

## 发现 #1 评估

### 审查原文

> **[高][P1 / PATCH-EVIDENCE] Candidate walker 在冻结的三个 exact exclusions 之外隐式缩小扫描域**
> - 来源：edge
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

`test/implementation-readiness-rename-routing.test.ts:32-36` 的 `FROZEN_EXCLUDED_PATHS` 只有 legacy docs、external drawer directory与drawer zip三项；`:262-275` 的 `validateCandidateScanControlPlane()` 也只将 fixture exclusions 与这三项作 exact equality。主 scan 在 `:182-184` 先通过 validator，再把同一 fixture roots/exclusions传给 `listCandidateFiles()`。

然而 `listCandidateFiles()` 在 `:280-283` 执行声明的 exact subtree exclusions 后，又在 `:292-294` 对每层目录中的 `entry.name === "node_modules" || entry.name === "dist"` 无条件 `continue`。这两个 effective exclusions 不属于 frozen constant，不经过 validator，也未被 current missing-root / extra-exclusion / malformed-token mutation覆盖。因此在 `src/dist/active-consumer.ts` 或 `test/fixtures/node_modules/active-hook.md` 放入任一冻结 token时，current walker不会读取该文件，`:185-214` 的 actual/ledger equality与 active-role-zero仍可能保持绿色。Finding 描述的控制流与 false-green consequence均成立。

**严重性判断：合理**

Story AC6要求 bounded surfaces逐 match分类，AC9要求 exact scan独立关闭 active residual，AC10要求 tests证明该 evidence gate。一个不受 frozen control-plane约束的 walker exclusion 会直接削弱这三个交付门禁；它不是性能或风格问题，而是 Story-owned evidence gate 的功能缺陷，P1 合理。

Kickoff早期文字曾宽泛提到排除 `dist/`，但 Round 2 Evaluator 在方案 I 的更新、精确授权中已将 exclusions限定为且仅为三个 exact paths，current frozen constant与 completion gate也据此记录“3 exclusions”。同时六个 candidate roots不包含 repository-root `dist/`；本 finding 只处理 frozen roots内部任意 basename 的隐式跳过。最新精确合同优先于早期宽泛描述，因此不能用 kickoff中的顶层 `dist/` caveat为 `src/dist/` 等任意嵌套跳过背书。`node_modules` 更从未进入该授权。

**修复建议：可行，且应限定为 test-local walker 与 mutation evidence**

最小修复是在 `test/implementation-readiness-rename-routing.test.ts` 中删除 `listCandidateFiles()` 对 `dist` / `node_modules` 的 basename skip，使 effective exclusions严格由传入且已冻结校验的三个 exact paths决定。保留现有 no-follow `lstat`、regular-file要求、symlink/non-file fail-close、raw-byte token查找、逐match ledger双向 equality、role allowlist与 active-zero逻辑。

为获得不污染 real bounded ledger 的可复核 RED/GREEN，可先对 walker 做行为中性的 testability 调整：为 `listCandidateFiles()` 增加默认值为 `process.cwd()` 的 local `projectRoot` 参数，并让 `path.join()` 使用该参数；然后在同一测试文件内用系统临时目录创建 `src/dist/probe.txt` 与 `test/fixtures/node_modules/probe.txt`。Probe内容不得包含任何 old ID、old path或 generic grill term，只断言 walker返回两个 project-relative regular-file paths。该测试在 current basename skip下应失败，删除 skip后通过。临时树必须在 `finally` 中清理。

Current read-only inventory未在四个目录 roots `assets/source/speclite`、`src`、`test`、`docs` 下发现现存 basename 为 `dist` 或 `node_modules` 的目录，因此删除 skip不应改变 current 24-row ledger；Fixer仍必须用现有 classified-scan test证明 actual/ledger exact equality保持全绿。若实际执行时该 current-truth已漂移并产生新的 exact-token match，应停止并返回 Evaluator，不得自行修改 ledger或扩大 classification。

**误报评估：非误报**

声明的 exclusions exact equality不能约束 walker内部另行硬编码的排除分支；current code存在可执行反例，且正向 `50/50` 不能替代该负向 mutation proof。

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | Candidate walker 在三个 frozen exact exclusions 外隐式跳过 `dist` / `node_modules` | [高] | **P1** | 删除未授权 basename skip，并以临时嵌套目录 mutation证明 walker不会漏扫。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

无。本轮 finding 是 current Story 11.8 evidence gate 直接引入的交付阻塞项，不应延迟。

### 可忽略（误报）

无。

### Authorized Fix Scope（授权修复范围）

Fresh Fixer 仅可修改：

- `test/implementation-readiness-rename-routing.test.ts`
- 本 evaluation 文档，仅追加 `Fix Summary（修复摘要）`

不授权修改 `test/fixtures/implementation-readiness-rename-routing/bounded-surfaces.json` 或增加持久 fixture；临时 candidate tree 足以提供独立 mutation proof。不得修改 production source、Story、tracker、completion gate、root logs、Round 1–3 review artifacts、canonical Skills、D1 docs、release manifest、legacy artifacts、candidate roots/exclusions/tokens/roles、Story 11.9/11.10、generic grill semantics、IR algorithm/scoring/body、dependencies、external drawer/zip、workspace `.agents/.claude` mirrors、fixed-count baselines或其他文件。若上述白名单不足，Fixer必须停止并返回 Evaluator重新裁决，不得自行扩展。

### RED / GREEN 与验证授权

Fixer必须先建立 current-failing RED，再删除 skip；不得把既有 `50/50` 记作本 finding 的 RED。

1. **行为中性 testability step**：只在 local helper上增加可选 `projectRoot=process.cwd()`，保持主 scan调用与语义不变。
2. **RED**：在系统临时目录中创建两个冻结-root等价路径 `src/dist/probe.txt` 与 `test/fixtures/node_modules/probe.txt`，内容不含本 Story token；调用 walker扫描 `src` 与 `test`，断言返回这两个 project-relative paths。Current implementation应因 basename skip得到缺失结果，focused command至少 `1` 个新测试失败。记录实际 failing assertion；不得修改真实 fixture或 ledger制造RED。
3. **GREEN**：删除 walker中 `entry.name === "node_modules" || entry.name === "dist"` 的额外 `continue`。同一 mutation test必须通过；existing classified scan必须继续证明 frozen `6 roots / 3 exclusions / 6 token key-parts`、raw-byte/no-follow、24-row actual/ledger双向exact equality、role allowlist与 active-zero均成立。
4. **Scope audit**：确认 fixture diff为零，且除 authorized test文件与本 evaluation追加记录外没有本轮修改；对授权文件执行 `git diff --check`。

允许运行：

- RED定向：`npx vitest run test/implementation-readiness-rename-routing.test.ts -t "walks nested dist and node_modules inside frozen roots" --reporter=dot`
- GREEN focused：`npx vitest run test/implementation-readiness-rename-routing.test.ts test/update-planning.test.ts test/ide-target-writer.test.ts --reporter=dot`
- 授权文件的 `git diff --check` 与精确 diff越界审计

不得运行 `npm run build`、full suite、packaging、canonical governance或 global `npx tsc --noEmit`。不得把 Story 11.10 broad inventory、drawer/global fixed-count失败或其他 Story baseline混入 RED/GREEN。

Fixer完成后由 outer Flow Gate owner刷新 completion gate，再进入 fresh Reviewer Round 4；latest Reviewer/Evaluator 双 PASS 前不得进入 CR04、CR05或CR06。

### 评估决定

- **发现 #1（walker effective exclusions超出方案 I）**：确认 P1；仅授权删除 test-local walker的两个 basename skip，并补临时树 mutation proof。
- **方案 I 边界**：保持六个 roots、三个 exact exclusions、六组 token key/parts、现有 role vocabulary与24-row ledger；不扫描 `_bmad-output`/history，不引入 generic grill terms，不扩大Story 11.10语义域。
- **Owner Gate**：`NONE`。最新精确方案 I 已唯一决定 effective exclusions必须等于三个 frozen exact paths；无需新增产品、Architecture或范围选择。
- **整体决定**：`FAIL`。完成上述修复、completion gate刷新及fresh Reviewer/Evaluator双重确认前，不得进入CR04、CR05或CR06。

## Fix Summary（修复摘要）

### 修复执行记录

- **Date**: 2026-09-05
- **Model Used**: GPT-5.6 Sol (gpt-5.6-sol)
- **Fix Items**: 1

### 修复结果

1. **Candidate walker effective exclusions 超出方案 I**：已修复。
   - 在 `listCandidateFiles()` 增加默认值为 `process.cwd()` 的可选 `projectRoot`，主 scan 调用保持原行为；临时测试树可独立复用同一 walker。
   - 新增 `walks nested dist and node_modules inside frozen roots` mutation test，在系统临时目录创建 `src/dist/probe.txt` 与 `test/fixtures/node_modules/probe.txt`，并在 `finally` 中清理。
   - 删除 walker 对任意 basename 为 `dist` 或 `node_modules` 的隐式跳过；effective exclusions 现在仅由传入并受冻结校验的 exact paths 决定。
   - 未修改真实 fixture、ledger、candidate roots、exclusions、tokens 或 roles；fixture 仍为 `6 roots / 3 exclusions / 6 tokens / 24 ledger rows`。

### RED / GREEN Evidence（红绿验证证据）

- **RED**：`npx vitest run test/implementation-readiness-rename-routing.test.ts -t "walks nested dist and node_modules inside frozen roots" --reporter=dot`
  - 结果：`1 failed / 8 skipped`。
  - 失败断言：期望两个 probe paths，实际为 `[]`，直接证明原 basename skip 漏扫。
- **GREEN**：`npx vitest run test/implementation-readiness-rename-routing.test.ts test/update-planning.test.ts test/ide-target-writer.test.ts --reporter=dot`
  - 结果：`3 files passed / 51 tests passed`。
  - existing classified scan 继续验证 raw-byte/no-follow、actual/ledger 双向 exact equality、role allowlist 与 active-zero。

### Scope Audit（范围审计）

- 本轮仅修改 `test/implementation-readiness-rename-routing.test.ts`，并向本 evaluation 追加该 Fix Summary。
- `test/fixtures/implementation-readiness-rename-routing/bounded-surfaces.json` 未修改，未新增持久 fixture。
- 未运行 build、full suite、packaging、canonical governance 或 global `npx tsc --noEmit`；未触及 production、Story、tracker、completion gate、root logs、Story 11.10 或 external drawer。
