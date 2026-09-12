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
