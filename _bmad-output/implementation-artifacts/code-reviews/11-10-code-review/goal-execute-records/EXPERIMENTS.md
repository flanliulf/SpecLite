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
