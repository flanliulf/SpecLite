---
Story: 11-8
Round: 1
Date: 2026-09-05
Model Used: GPT-5.6
Layer: Blind Hunter
Verdict: FAIL
---

# Blind Review（盲审）

## Verdict（结论）

**FAIL**。Story 11.8 的 canonical package rename、fresh projection 与 update-plan 主链已形成，但 current diff 仍有 4 个 bounded P1：D1 公开文档仍发布错误 route/basename；Grill workflow 仍允许新记录写到 `.specskills/output/`；old-ID redirect 只停留在 helper/update projection，没有接入真实 activation consumer；所谓 exact classified scan 排除了已知 regression/fixture/release surfaces 并且没有逐 match role ledger，因而无法支持 completion gate 的零残留声明。

- **P1：4**
- **P2：0**
- **Owner Gate：`NONE`**
- **Review boundary**：Story 11.8、Epic 11、SPEC 04/07/09、current scoped diff、kickoff/completion gate、renamed packages、module/index/update/runtime-facing consumers、focused tests/fixture 与 current public docs。
- **Explicit exclusions**：未运行 build、full suite、packaging 或 canonical governance；未将 `speclite-drawer-er-modeler/`、zip、workspace `.agents` / `.claude` mirrors 或 fixed-count drift 归因于 Story 11.8；未处理 Story 11.9/11.10 或 generic grill semantics。

## P1 Findings（P1 发现）

### P1-1 Current public docs 仍发布错误的 Readiness route 与 basename

- **Location**：`docs/reference/skills/sdlc-workflows.md:70`；`docs/reference/workflow-artifact-layout.md:87-91,165`
- **Evidence**：
  - SDLC workflow catalog 已把 ID 改为 `speclite-implementation-readiness-check`，但 Output 仍是 `{planning_artifacts}`，与 Story AC3 和 `module-help.csv` 的 `{solutioning_artifacts}/implementation-readiness-report/grill-consistency` 直接冲突。
  - filesystem tree 另声明一个不在 `module.yaml` directories 中的 `implementation-readiness/ # 安装时预创建`，会让读者把幽灵目录当成 canonical root。
  - 同一文档两处使用 `implementation-readiness-report-{date}.md`，未保持 Story AC4 的 exact `implementation-readiness-report-{yyyy-MM-dd}.md`。
  - completion gate `Governance Decisions` 却称 D1 current public docs 已 `updated`，并以这两份文档为 evidence（completion gate `:54-59`），因而 gate 与 current tree 不一致。
- **Consequence**：用户依照 current docs 定位或校验产物时会回到 Planning root，或期待一个 installer 从未声明的目录；这使 package/help/docs 的 identity-route parity 未闭环。
- **Classification**：`patch`，修复唯一且无需 Owner 决策：将当前公开文档收敛到 exact Solutioning route 与 exact date token，删除未由 metadata 声明的幽灵目录。

### P1-2 Grill 的 active producer contract 仍允许绕过 Solutioning root

- **Location**：`assets/source/speclite/sdlc-skills/3-solutioning/speclite-implementation-readiness-grill-consistency-reviewer/references/workflow.md:48-66`；`.../references/record-output-spec.md:3-29`
- **Evidence**：两个 executable/current references 都将 canonical 目录降格为“默认/首选”，然后允许“没有可解析 Solutioning root”时把新 round 写入 `.specskills/output/speclite-implementation-readiness-grill-consistency-reviewer/`。Story AC3 要求两个 Skills 的默认输出是唯一 `{solutioning_artifacts}/implementation-readiness-report/grill-consistency/`；SPEC 09 已给 existing install 定义 Planning fallback 并要求 resolver evidence，解析失败不是可自行切到第三个未管理 root 的授权。
- **Consequence**：解析失败时仍可生成新 readiness records，且这些记录脱离 resolved-root provenance、installer directory plan、manifest/index ownership 和 Story 11.8 的 fixed route；completion gate 的“两个 Skills active output route 固定”声明因此不成立。
- **Classification**：`patch`，应让 active workflow 使用 resolver-provided Solutioning root（existing 缺 field 则消费契约 fallback），解析 block/error 时 HALT 且 zero write；不得为新 run 退回 `.specskills/output/`。

### P1-3 Old-ID redirect 没有接入真实 activation surface

- **Location**：`src/modules/module-metadata.ts:99-120`；`src/update/update-plan.ts:957-975,1188-1223`；`test/implementation-readiness-rename-routing.test.ts:66-80`
- **Evidence**：
  - `resolveCanonicalSkillIdentity()` 可对 old ID 返回 active ID，但 current source 中它除了单元测试，唯一 producer consumer 是 update migration projection；help/list/status/validate/customization/IDE activation 都未以 requested old ID 调用该 resolver。
  - clean update 对 old installed package 只生成 `action=skip, reason=canonical-skill-renamed`，apply 只把它加入 hash precondition，不会将旧 `SKILL.md` 变成 redirect/deprecation entry。
  - 因 Story 同时要求不删除 old package，update 后磁盘上的 `.agents/skills/<old-id>/SKILL.md` / `.claude/skills/<old-id>/SKILL.md` 仍是可被 IDE 直接发现和激活的旧 package，该路径不会经过 `resolveCanonicalSkillIdentity()`。
- **Consequence**：Story AC7 与 kickoff 选定的“old ID activation redirect”实际不存在；existing install 可以同时保留一个可激活的 old identity 和新 active identity，恢复了 SPEC 04 禁止的第二 active identity。
- **Classification**：`patch`，必须把 mapping 接入真实 requested-ID activation/dispatch surface，或在不覆盖 modified old package 的前提下产生可执行的 stable deprecation/redirect behavior；仅证明 helper 可返回 mapping 不足以验收 activation。

### P1-4 Exact-old-ID/path scan 是 false-green，未实现逐 match 分类闭环

- **Location**：`test/implementation-readiness-rename-routing.test.ts:113-143,168-183`；`test/fixtures/implementation-readiness-rename-routing/bounded-surfaces.json:1-44`
- **Evidence**：
  - 扫描根只有 `assets/source/speclite`、`src`、`docs` 和 root `README.md`，没有 `test/`、`release/`、hooks/scripts 的完整 active surface；同时扩展名 allowlist 不包含 `.txt`、`.js`、`.sh` 等可承载 path/ID 的文本文件。
  - 已知 old-ID matches 就存在 `test/update-planning.test.ts`、本 focused test、`bounded-surfaces.json` 和 fresh `skill-index-full.json`；它们因为扫描盲区而根本没有进入分类逻辑。
  - fixture 只列出允许的 role 名称与 surface directory/list，没有 `path + literal + role` 的逐 match ledger；测试对 manifest surface 仅调用 `access()` 证明路径存在，不验证内容或分类。
  - old path 只检查单一 `"{planning_artifacts}/ir-grill"` substring，kickoff 冻结的独立 `/ir-grill/` exact-path vocabulary 与 resolved/default 路径变体不在扫描合同中。
- **Consequence**：在 test fixture、fresh snapshots、release evidence、shell/JS hook/script 或未列名 active file 中重新引入 old identity/path 时，focused test 仍可通过；AC6、AC9、AC10 和 completion gate `:35,41` 的“每个 match 分类 / active 零残留”缺少可重放 evidence。
- **Classification**：`patch`，应以冻结的 bounded roots/extensions 产生全部 exact matches，要求每个 match 与 fixture 中的 `path/literal/role` 唯一对应，对多出、缺失或非允许 role 均 fail-close，并覆盖 fresh snapshots、release 与 exact `/ir-grill/` path variants。

## P2 Findings（P2 发现）

无。

## Positive Evidence（已验证正向证据）

1. 两个 canonical directory、ZH/EN frontmatter、module help 与 direct callers 已使用新 ID，current active-domain `rg` 未发现 old ID 仍作为 producer/help/orchestrator 的直接残留。
2. `module.yaml` 对两个 rename 建立 old-to-active mapping，`SkillIndexSchema` 对 old ID 与 active/duplicate mapping 有全局唯一性约束，fresh projection 只生成新 packages/help/phase rows。
3. Readiness check 的六个 step `outputFile` 已统一到 Solutioning fixed directory，并保留 `implementation-readiness-report-{{date}}.md`；Grill record basenames 仍是 `summary.md`、`PLAN.md`、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md`。
4. Update planner 对 modified old installer-owned file 会生成 `installer-owned-drift` conflict 与 redaction-safe `file-integrity.hash-mismatch`，并以全局 conflict 阻止 authorized apply；本轮未发现它覆盖或删除 drifted old file 的代码路径。
5. Legacy `{planning_artifacts}/ir-grill/` 在两个 active package 中均被标记为 read-only historical evidence，并明示禁止 migration/rename/delete/new-write。

## Scope Audit（范围审计）

- 本层只记录 Story 11.8 direct contract 与 evidence 缺口；没有将 accumulated Epic 11 worktree 中前序 Story 的合法修改重新归因为 11.8 scope creep。
- 未要求改 IR algorithm/scoring/report body、generic grill semantics、Story 11.9/11.10、external drawer/zip、workspace mirrors 或 fixed-count baselines。
- 未触发 build/full/packaging/canonical-governance 执行，未修复源码、Story、tracker、gate 或 root logs。

## Owner Gate（Owner 门禁）

**Owner Gate：`NONE`。** 四个 P1 都可从 Story 11.8、SPEC 04/09 与 kickoff 已锁定的选择唯一推导：收敛 current docs、禁止 unresolved-root fallback write、将 old-ID mapping 接入真实 activation/deprecation surface、以逐 match ledger 修复 bounded scan。可交 fresh Aggregator/Evaluator 独立判定；本层不授权 Fixer。
