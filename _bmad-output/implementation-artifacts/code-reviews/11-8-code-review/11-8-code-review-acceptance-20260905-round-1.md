---
Story: 11-8
Round: 1
Date: 2026-09-05
Model Used: GPT-5.6 (gpt-5.6)
Layer: Acceptance Auditor
Type: Code Review Layer Result
---

# Acceptance Review（验收审查）

## Verdict（裁决）

**FAIL** — `4` 个 P1，`0` 个 P2。两个 canonical Skill 的目录/frontmatter/help/projection rename、readiness basename、rename metadata 与 clean/drifted update 基础路径已经落地，focused suite 也在本层复跑为 `3 files / 43 tests passed`；但 current implementation 尚未满足 Story 11.8 的完整验收合同：Grill producer 没有真正消费 `{solutioning_artifacts}`，旧 ID redirect 没有接到实际 activation/help/status/validate 入口，bounded scan 没有形成逐 match 分类闭环，legacy artifact discovery/preservation 也只有 prose assertion 而没有行为 fixture。

Completion gate 的 `PASS_EQUIVALENT` 只可把外部 drawer fixed-count drift 作为等价例外；它不能豁免以上 Story-owned contract/evidence 缺口。External `speclite-drawer-er-modeler/`、zip、workspace IDE mirrors 与 fixed-count drift 已严格排除，未计入 finding。

## Scope And Evidence（范围与证据）

- 已核对 Story 11.8、Epic 11 Story 11.8、PRD `FR23f`、`SPEC 04` rename identity、`SPEC 07` file-integrity taxonomy、`SPEC 09` Solutioning root/legacy-compatible/no-migration contract、kickoff/completion gates、current implementation、focused tests 与 bounded-surfaces manifest。
- Current working tree 是 Epic 11 累积 diff；本层只按 Story 11.8 Dev Agent Record、两个 renamed packages、module/projection/update/diagnostic surfaces、11.8 tests/fixtures 与 current gates归因，不把前序 Story 改动或外部 drawer 吸收到本轮。
- 已运行 `npx vitest run test/implementation-readiness-rename-routing.test.ts test/update-planning.test.ts test/ide-target-writer.test.ts`：`3 files / 43 tests passed / 0 failed`。本层未运行 build、full suite、packaging 或 canonical governance。
- 已执行 exact old-ID/path read-only scan；current active source 的 old IDs 只在 `module.yaml` compatibility mapping 中出现，legacy path 只在两个 renamed package 的历史发现条款中出现；但 test/fixture matches 并未被 current oracle 纳入逐 match 分类证据。
- Story-bounded paths 的 `git diff --check` 通过。除本 Acceptance artifact 外，未修改 source、test、Story、tracker、gate 或既有 CR 产物。

## Acceptance Criteria Matrix（验收标准矩阵）

| AC | Result | Current evidence |
| --- | --- | --- |
| AC1 | PASS | 两个 canonical package directories 已使用新 ID，ZH/EN frontmatter 与 package self refs 未残留旧 identity。 |
| AC2 | PASS | Fresh projection 的 skill/help/phase/IDE mirror 只含 active IDs；`skill-index.v1` 在 active entries 上携带唯一 `renamedFromCanonicalSkillIds`。 |
| AC3 | **FAIL** | Readiness check 使用 placeholder，但 Grill workflow/record spec 仍硬编码 `_speclite-output/3-solutioning-artifacts/...` 并允许 `.specskills/output/...` fallback，无法服从 explicit 或 legacy-compatible `{solutioning_artifacts}`。见 P1-1。 |
| AC4 | PASS | Readiness steps 保持 `implementation-readiness-report-{{date}}.md`，与 `{yyyy-MM-dd}` basename contract 一致。 |
| AC5 | PASS | Grill 的 `summary.md`、`PLAN.md`、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md` naming 保持不变。 |
| AC6 | **FAIL** | Active source exact literals 当前大体已清理，但 manifest 没有逐 match 条目/role，测试扫描也排除了整个 `test/` corpus，不能证明 bounded surfaces 全量分类。见 P1-3。 |
| AC7 | **FAIL** | Typed mapping 与 update reprojection 已实现；但 old-ID resolver 仅被 update planner消费，没有实际 activation/help/status/validate redirect 或 stable deprecation diagnostic。见 P1-2。 |
| AC8 | **FAIL** | 两个 Skill 文档声明 legacy evidence 原位只读，但测试没有创建/发现任何 legacy artifact，也没有验证 install/update/repair 前后 preservation。见 P1-4。 |
| AC9 | **FAIL** | Exact scan 未扫描 `test/`，只检查文件级允许位置/关键词，且没有逐 match classification；因此独立关闭证据不足。见 P1-3。 |
| AC10 | **FAIL** | Focused suite 全绿，但实际 producer route、真实 old-ID activation、逐 match classified scan 与 legacy discovery/preservation 场景均未覆盖；update/drift fixture也只覆盖一个 old ID。见 P1-1 至 P1-4。 |
| AC11 | PASS | 没有证据表明本 Story 更改 IR scoring/report body 或建立 broad grill semantic inventory；前序 Story 累积 diff 不归因于 11.8。 |

## Findings（发现）

### P1-1 — Grill 的真实输出指令绕过 `{solutioning_artifacts}`，并引入合同外 fallback

- **Violated:** AC3、AC10、FR23f、`SPEC 09`。
- **Evidence:** `references/workflow.md:48-66` 与 `references/record-output-spec.md:3-25` 把默认目录写死为 `_speclite-output/3-solutioning-artifacts/implementation-readiness-report/grill-consistency/`，并在“无法解析”时改写到 `.specskills/output/speclite-implementation-readiness-grill-consistency-reviewer/`。`SPEC 09` 要求 explicit root 继续权威，existing install 缺失 `solutioning_artifacts` 时使用 Planning `legacy-compatible` fallback；Story AC3 则要求两个 Skills 都解析 `{solutioning_artifacts}`。
- **Why current tests miss it:** `test/implementation-readiness-rename-routing.test.ts:82-93` 的 route assertion 只统计 `module-help.csv` 中 placeholder 出现两次；`95-110` 对 Grill package只检查四个 basename存在，从未断言 workflow/record spec 使用 `{solutioning_artifacts}` 或拒绝 `.specskills` fallback。
- **Required closure:** 让 Grill executable guidance 从 resolved `{solutioning_artifacts}` 构造 fixed child directory，移除合同外 hardcoded/fallback 分支，并添加 explicit-config 与 existing legacy-compatible route fixture。

### P1-2 — Old-ID redirect 只有孤立 helper，没有接入实际 activation/recognition surface

- **Violated:** AC7、AC10、FR23f、`SPEC 04`。
- **Evidence:** `src/modules/module-metadata.ts:105-120` 定义 `resolveCanonicalSkillIdentity()`；production search 显示它只在 `src/update/update-plan.ts` 被消费。Help、status、validate、list/activation target 均未消费该 resolver；fresh install 又按要求不投影 old alias package，因此用户或 existing automation直接以 old ID activation 时，current product没有 redirect，也没有包含 replacement command 的 stable deprecation diagnostic。
- **Why current tests miss it:** `test/implementation-readiness-rename-routing.test.ts:66-79` 只直接调用 helper并断言返回 object，不经过任何真实 activation/help/status/validate入口。
- **Required closure:** 将 mapping 接到一个真实 old-ID recognition/activation contract surface并验证 redirect，或实现 Story 允许的 stable deprecation diagnostic；不能以 alias package恢复第二 active identity。

### P1-3 — Bounded manifest 与 exact scan 没有逐 match 分类，也漏掉 Story 明示的 test corpus

- **Violated:** AC6、AC9、AC10、kickoff bounded scan contract。
- **Evidence:** `bounded-surfaces.json:13-43` 只列目录/文件组和 allowed role names，没有记录每个 match 的 `path`、literal、role 与 rationale。`test/implementation-readiness-rename-routing.test.ts:126-142` 只扫描 `assets/source/speclite`、`src`、`docs` 与根 `README.md`，没有扫描 `test/`；它只以“old ID 所在文件是 module.yaml”和“文件任意位置包含 legacy/history 词”作豁免，也没有覆盖通用 `/ir-grill/` exact-path variant。当前 read-only scan可见 fresh skill-index snapshot、update test、本 Story test/fixture 中仍有 old-ID/old-path regression matches，但这些没有逐条分类记录。
- **Impact:** 新增或误放的 regression fixture/test match不会被独立 gate发现；active producer clause也可能仅因同文件别处出现 `legacy` 字样而被错误放行。Completion gate 关于“exact scan 100% classification”的声明不可复核。
- **Required closure:** 把冻结扫描域（含 tests/generated fresh state）和全部 exact literals/path variants放入 executable inventory；输出并校验逐 match classification，role必须绑定具体 match/clause，active identity/producer/consumer 等角色保持零命中。

### P1-4 — Legacy discovery/preservation 验收是 prose test，不是行为 fixture

- **Violated:** AC8、AC10、FR23f、`SPEC 09` no-migration。
- **Evidence:** 名为“discovers legacy readiness evidence”的 `test/implementation-readiness-rename-routing.test.ts:145-165` 只读取两个 Markdown 并匹配 `ir-grill`、`read-only`、`never migrate` 文本；它没有创建 legacy report/tree、运行任一 discovery/install/update/repair path，或比较 path、type、bytes/hash/tree 的前后状态。`test/update-planning.test.ts:362-428` 仅覆盖 `speclite-check-implementation-readiness` 一个 old ID、一个 `.agents` target，也不包含 legacy workflow artifact。
- **Impact:** current evidence不能证明 legacy readiness artifacts“可发现”，也不能证明 write-capable lifecycle 对它们保持原位零 mutation；测试标题与 completion gate的行为性结论均高于实际断言。
- **Required closure:** 增加真实 legacy artifact fixture，执行已声明的 discovery与至少相应 install/update/repair preservation路径，断言原路径、no-follow type、bytes/hash/tree、changed/deleted/migrated paths均保持合同；rename/drift coverage至少参数化两个 old IDs。

## Tasks Audit（任务审计）

| Task | Result | Evidence |
| --- | --- | --- |
| 11.1–11.7 predecessors + kickoff/manifest | PARTIAL | Kickoff `PASS`、predecessor gates与manifest文件存在；manifest缺少逐 match classification。 |
| Identity/routing/rename/update/drift/legacy failing tests | **FAIL** | Focused tests全绿，但 route与legacy断言没有覆盖真实行为，old-ID activation未经过production入口。 |
| Rename packages/frontmatter/self refs/direct callers | PASS | Current active source exact scan未发现旧 ID 的active identity/self-reference残留。 |
| Mapping/activation/update/modified-old protection | **FAIL** | Mapping/update/drift基础存在；activation/deprecation消费链未实现。 |
| Solutioning route/basenames/legacy preservation | **FAIL** | Readiness route与basenames通过；Grill route硬编码且legacy preservation无行为证据。 |
| Exact scan + focused/build/diff/completion gate | **FAIL** | Focused `43/43`、bounded diff check通过；exact scan/classification不闭合，故completion `PASS_EQUIVALENT`需降级。 |

## Completion Gate And Drawer Boundary（完成门禁与 Drawer 边界）

- `PASS_EQUIVALENT` 的 drawer caveat是可隔离的外部固定数量漂移：`core=18 -> 19`、`total=68 -> 69`。本层不要求修改 drawer/zip、workspace mirrors或fixed-count assertions，也不把十二项full-suite失败计入Story finding。
- 但 P1-1 至 P1-4 均位于 Story 11.8 own scope，不能由 drawer caveat解释。Current completion gate对 AC3、AC7–AC10 的通过声明与实证不一致；在修复与复审前不得作为CR06 allowing evidence。

## Owner Gate（Owner 门禁）

**NONE**。四项均有现有 FR23f / SPEC04 / SPEC09 / Story AC 的确定性答案，不需要产品、Architecture或scope选择；Fixer应只修复 evaluator确认的Story-bounded内容。

## Conclusion（结论）

- **结论：不通过（FAIL）**
- **P1：4**
- **P2：0**
- **Owner Gate：`NONE`**
- 本结果仅代表fresh Acceptance Auditor Round 1；仍须等待同轮Blind Hunter、Edge Case Hunter、Aggregator与fresh Evaluator的正式产物。只有最新Reviewer/Evaluator双PASS后，outer orchestrator才可进入CR04、CR05与CR06。
