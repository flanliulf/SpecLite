# Experiments（实验记录）

## 2026-09-12 — Live Preflight + Kickoff

- Story ID：11.10
- 结果：11.1–11.9 `done`，九份 completion gate 允许继续；11.8 baseline（active IDs / old IDs / old path 四形态 / canonical output）取自 `bounded-surfaces.json`。kickoff `PASS`。
- Baseline identity：HEAD `3cc1ba9`，tree `7d854dd4…`，canonical 面 dirty 21 files（`git diff -- assets docs src test README.md | sha256` = `52fc033c…`）。
- Scope 决策：include `assets/source/speclite/**`（含 docs/legacy → legacy）、`docs/**`、`src/**`、`test/**`（fixtures → fixture）、`README.md`；exclude `_bmad-output`、`release/packaging-manifest.json`、`dist`、`node_modules`、installed mirrors、`.git`、二进制。扫描工作树（含 dirty grill 文件，条目标 dirty-worktree）。
- 下一步判断：Task 2 scanner。

## 2026-09-12 — Broad Scan + Classification

- 结果：`rg --ignore-case 'grill'` 269 行（49 文件），raw sha256 `571645e6…`；classify.py 规则化 + 逐条复核；validator raw 269 = entries 269，unmapped 0。
- Counts：active 102 / compatibility 6 / legacy 9 / fixture 152；ZH 87 / EN 20 / shared 162；11.8 regression 0。
- 关键发现：唯一显式 caller→callee 是 `speclite-grill-with-docs` → `/speclite-grilling`，其 HEAD 版本为 `/grilling` / `/domain-modeling`（非 canonical ID），工作树未提交修正；`ir grill records` → artifactType `ir-grill-records` 沿用旧词形；reviewer 包 `grill-with-docs` 提及为内建协议来源而非依赖；`.specskills/docs/analysis/` 路径未被测试覆盖。
- Read-only：scan 前后 canonical 面 `git status` 集合 hash 一致（`335505e1…`）。
- 下一步判断：completion gate，然后向用户请求人工确认（AC12），确认后 CR。

## 2026-09-12 — Human Confirmation Round 1

- 用户裁决：B1 是（commit `a349f08`）；B2 按建议更名（`cfe49c1`）；B3 保留 roadmap，standalone grill Skills 去向登记为未来独立 Story 候选；B4 改措辞（`cfe49c1`）；B5 要求列出出处（已补充）。
- 副产物：发现 11.9 期间 fixture / packaging manifest 在脏工作树上生成，`a349f08` 已按提交树重生成；用户工作树中 `speclite-grilling` / `speclite-domain-modeling` 的本地改动在提交前会使 `fixture-release-gates` 本地红。
- 下一步判断：等待 B5 裁决与"inventory 作为 completion evidence"确认，再进入 CR01（reviewSeries=`main`）。

## 2026-09-12 — CR Reviewer / main Round 1

- 结果：`FINDINGS_REPORTED`；3/3 layers（首次启动被 session 中断，无输出，同输入重跑）；scope 38 actual / 19 declared / 19 excluded / 0 exceptions；base `3cc1ba9` → head `36d476f`。
- AC1–AC13 全 PASS；edge / auditor 各自重建扫描树复现 raw 269 行 / sha256 `571645e6…`；11.8 regression 0。
- 9 findings，无 P0/P1 候选：R1-F1 G019/G022 误分类（patch）、R1-F2 Literal 列 140 字符截断 15 行（patch）、R1-F3 "五处提及" 计数（patch）、R1-F4 G176 Target 矛盾（patch）、R1-F5 B5 行号未标注（patch）、R1-F6 幻影 `.zip` exclusion（patch）、R1-F7 File List / gate 留痕缺口（verify-required）、R1-F8 AC8 epic handoff 路径（defer）、R1-F9 脏工作树 manifest 漂移（dismiss 候选，源于用户未提交 skill-lint 文件）。
- artifact `11-10-code-review-summary-20260912-main-round-1.md`（sha256 `412685f4…`）。下一步判断：CR02 evaluator。

## 2026-09-12 — CR Evaluator + Fixer / main Round 1

- Evaluator：`FIX_REQUIRED`；p1=6（R1-F1–F6，均为 Story inventory 文档修正）/ verifyRequired=1（R1-F7）/ deferred=1（R1-F8 T2）/ dismissed=1（R1-F9）；convergence new 6。evaluator 指出 completion gate（02:37Z）早于 change commits，CR06 按 freshness 会 HALT，须在 fresh review 后重生成。artifact `11-10-code-review-evaluation-20260912-main-round-1.md`。
- Fixer：completed（patch）；仅改 Story 文件（+44/−22）；R1-F1–F6 关闭，R1-F7 留痕小节 + File List 顺带补齐；docs:check PASS。
- 下一步判断：提交 fix commit → fresh CR01 main round 2。

## 2026-09-12 — CR Reviewer / main Round 2

- 结果：`FINDINGS_REPORTED`；3/3 layers；head `c2eb474`。R1-F1–F6 三层一致 resolved（validator 0 mismatch），fixer 未越权；R1-F7 Story 侧关闭、gate STALE 待重生成；R1-F8/F9 未变。
- 新增：R2-F1 G022 dirty 标注被 round 1 修复覆盖 + G019/G022 Target 与 G012/G015 不一致（patch，两行）；R2-F2 hidden fixture 路径未在 exclusions 说明（defer，0 命中）。counts：patch 1 / verify 1 / defer 2 / dismiss 1。
- 下一步判断：CR02 round 2。

## 2026-09-12 — CR Evaluator + Fixer / main Round 2

- Evaluator：`FIX_REQUIRED`；p1=1（R2-F1）/ verify=1（R1-F7 gate 重生成，orchestrator 义务）/ deferred=2（R2-F2 T3、R1-F8 T2）/ dismissed=1；convergence new 1 / resolved 6；提示 round 3 若再出新阻塞即 STOP_LOSS。
- Fixer：completed；仅改 Story 文件（G019/G022 两行 + Exclusions 一句 + Change Log 1.4）；validator dirty 一致性 0 不一致。
- 下一步判断：提交 → fresh CR01 main round 3（收敛确认）。

## 2026-09-12 — CR Reviewer / main Round 3

- 结果：`FINDINGS_REPORTED`；3/3；head `d1d1f54`；**新阻塞 0**。R2-F1 / R2-F2 三层一致 resolved（累计 8 关闭）；R1-F7 gate STALE 预期 recurred；R1-F8 / F9 未变；R3-F1 措辞精度（dismiss 候选）。
- 下一步判断：CR02 round 3。

## 2026-09-12 — Session Reconciliation（会话并发收口）

- 事实：本会话与其 `claude --resume` 副本在 12:17–12:52 并发运行 Story 11.10 CR；副本完成 main round 1–3（review / evaluation / 两轮 fix commit `c2eb474`、`d1d1f54`）、CR04、CR05（TODO-028）、completion gate 重生成后由用户退出；本会话 round-1 summary 写入因 `.tmp` 被副本清理而失败，未产生第二个 current 产物。
- 处置：采用副本产物为 current（binding 逐项验证：review hash / scope / head / CR04-05 evaluationSourceHash / gate freshness / backlog hash 全部一致）；本会话独有的 3 条非阻塞观察（G113 裸 `ir-grill/` 条款分类为 active、B4/B5 条目 Rec 与 §B 不一致、条目表引言未注明回查基准 HEAD 3cc1ba9）未进入任何 round，记录于 EXPERIMENT_NOTES 供用户裁决是否作为后续 docs change。
- 下一步判断：提交 CR04/05/gate/backlog → CR06。

## 2026-09-12 — CR06 Finalizer

- 结果：`DONE`；Story `in-progress → done`、`sprint-status.yaml → done`，写前/写后 hash 重读一致；binding / freshness 全部通过。Epic 11 全部 Story done，待 epic-completion gate。

## 2026-09-12 — Post-done Docs Follow-up（用户授权）

- 改动：Story 文件 G113 归 compatibility 并入 AC7 单列（Compatibility 6→7）；B2/B4/B5 引用的 9 条 entry Rec 标 `confirm → resolved`；条目表引言注明回查基准 HEAD 3cc1ba9；计数同步；Change Log 1.5。
- 审查：fresh 独立审查者首轮 FAIL（我误改 G003 而非 G113；G043/G046 裁决文字与 §C 不符；引言对 G042 不精确），修正后复验 PASS（计数重算、G113 依据、raw sha 复现、resolved 文字与 §C 一致、docs:check）。
- 边界：只改 Story 文件；canonical 面未动。

## 2026-10-24 — Epic Completion Audit（Epic 完成审计）

- 执行项：`goal-orchestrator-epic-story-code-review-runner` 续跑完成审计；源码基线为 `31e632e`。以当前仓库为准，不恢复已被 11.9 restart 取代的旧流程。
- 开发与状态证据：十个 Story 正文均为 `done`，各含实现与验收记录；tracker 中 Epic 11、11.1–11.10、retrospective 均为 `done`。当前 tracker 的未提交改动属于 Epic 12/13，不纳入本次提交。
- CR 审计：逐 Story 读取 latest review/evaluation、CR04/05/06 日志与规则/TODO 产物。11.1 r3、11.2 r3、11.3 r3、11.4 r7、11.5 r8、11.6 r5、11.7 r8、11.8 r4 为双 PASS；11.9 restart r3 与 11.10 main r3 的 review 均完成三层审查，evaluation 为 `PASS_WITH_DEFERRED_TODOS`，CR06 为 `DONE`。既有 fix 后均有后续 review/evaluation；没有把 fixer 输出直接作为通过证据。
- 收口证据：11.3/11.4/11.8/11.9/11.10 的 finalizer report 存在；其余 Story 使用当时的 Story 正文与 CR06 日志，不补造历史 v2 report。11.9/11.10 的 review、evaluation、CR04、CR05、completion gate 共十个原始文件 SHA-256 与绑定记录一致。十份 completion gate 的 target/storyKey 均精确匹配；11.5–11.8 为历史 `PASS_EQUIVALENT`，其余为 `PASS`。
- Epic 门禁与提交：`epic-11-completion-gate.md` 为 `PASS`；`17633f5` 保存门禁，`219f6f5` 将 Epic 标为 done，`0aaf3c2` 保存 retrospective。11.9 restart 收口提交为 `22909c8`；11.10 CR06 提交为 `7ce8161`，docs follow-up 提交为 `ec3f3a0`。
- Inventory：重数 Story 11.10 表格得到 269 行、269 个唯一 ID，G001–G269 连续；用户确认与后续修正已写入 Change Log。历史扫描基线保持不变，本次不把当前树重新扫描结果冒充当时的 raw evidence。最终交付提供 [Story 11.10 inventory](../../../stories/11-10-inventory-all-grill-related-skill-references-for-human-confirmation.md)。
- 日志修正：11.1 父 checklist 未勾选、11.5 漏记 CR06、11.8 状态栏仍为 review、11.10 计划与备注仍等待确认。仅据已存在证据补齐这些记录；未修改 source/tests/canonical、历史 CR 结论或 TODO 裁决。
- 验证尝试 1：在 `/tmp/speclite-epic11-audit.TAX6yo` 的 HEAD 副本中 build 通过，测试为 719 passed / 12 failed / 4 todo；失败来自工具启动错误、系统 Python 的 Xcode license 提示及临时路径被 local-source integrity 拒绝。后续 docs/packaging 因 `&&` 未执行。不将此轮记为通过。
- 验证尝试 2：重新从同一 HEAD 导出到 `/Users/fancyliu/Repos/speclite-audit.0xbDKG`，复用现有 node_modules，PATH 优先 `/Users/fancyliu/.pyenv/versions/3.12.13/bin` 与 `/opt/homebrew/bin`。未改测试或产品代码。`npm run build` PASS；`npm test` 为 68 files / 731 passed / 0 failed / 4 todo；`npm run docs:check` 为 80 files PASS；`npm run release:packaging-check` PASS。构建和 manifest 写入只发生在隔离副本。
- Git 范围：暂存区原为空；保留既有 AGENTS、sprint-status、Epic 12/13 planning 相关七项变更及 ignored 文件。全树 `git diff --check` 报既有 `story-candidates-2026-09-13.md` 第 38–39 行 Markdown 尾随空格，本次日志路径的 scoped check 通过，不改范围外文件。
- 下一步：按 `git-commit-convention` 将本次日志修正按 Story 分组为中文本地提交；不 push。保留非阻塞 TODO，不宣称全部 backlog 已解决。
