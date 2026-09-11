# Experiments（实验记录）

## 2026-09-11 — Restart Reset

- Story ID：11.9
- 结果：分支 `story-11.9-restart`；9 个 canonical CR 包与 `test/code-review-contract.test.ts` 恢复到 `ff7528d`（`git diff --stat ff7528d` 为空）；删除 `resolve-cr-directory.mjs`、`test/cr-directory-resolution.test.ts`、`test/fixtures/code-review-contract/`；234 个旧 CR 产物 `git mv` 至 `superseded-main/`；commit `523ab4e`（273 files，+63 / −1950）。
- Tracker：Story `review` → `in-progress`；`sprint-status.yaml:152` 同步；TODO-018~022 → `superseded-by-restart`。
- Story 文档：新增 `Threat Model & Non-Goals` 章节；AC9 改为按 v2 文件名判定未完成 run；Dev Notes 增加 Restart Implementation Location（决策 B）；Change Log 2.0。
- Boundary：21 个非 Epic 11 未提交文件未纳入 commit。
- 下一步判断：重新生成 kickoff gate，然后进入 TDD。

## 2026-09-11 — Restart Kickoff Gate

- Story ID：11.9
- 结果：`PASS`；foundation prerequisite = 11.1–11.8 completion gates 允许继续；closure owner = shared CR contract 拥有 `cr-directory.ambiguous-resume-root`，executable resolver 迁至 `src/config/cr-directory.ts` + `speclite resolve cr-directory`。
- 契约依据：`cr-contract.md@ff7528d:54,56,66-76`（series 正则、目录约定、v2 basename、series-less 文件仅作历史证据）。
- 下一步判断：写 `test/cr-directory.test.ts` 使其 RED。

## 2026-09-11 — Restart Development Result

- Story ID：11.9
- 结果：TDD RED（模块缺失）→ GREEN。`src/config/cr-directory.ts`（`normalizeCrStoryId`、`resolveCrDirectory`，约 290 行含 issue 文案）、`speclite resolve cr-directory` 子命令、`ResolveCrDirectoryOutputSchema`；`test/cr-directory.test.ts` 22 tests（归一化矩阵、canonical / legacy-resume / ambiguity 零 mutation、symlink 越界、CLI JSON/human、全量 corpus 负向扫描零命中、fresh-install parity）。
- Skill 同步：`cr-contract.md` 新增 6 行 CR Directory Resolution；runner Step 0 一次 CLI 调用；CR01–06 workflow + SKILL.md/SKILL.en.md 各一句"只消费传入 `crDir`，不重推导"；8 包 `[Unreleased] - 2026-09-11` CHANGELOG。文档行复核：README/README.en/module-help.csv/sdlc-workflows/workflow-artifact-layout 移除 `directoryContext` / validate-context 表述。
- Verification：`check_canonical_source_change --mode strict` ok / 0 findings；`npx tsc --noEmit` 136 个既有错误、新文件 0 新增；fresh-install fixture 仅 8 个 CR 包 hash 与 `.mjs` 条目变化；`npx vitest run` 723 passed / 4 todo / 0 failed；`docs:check` 72 files pass；`release:check` PASS。
- 观察：沙箱内 `npm pack` 因 `~/.npm/_cacache` 权限失败会让 packaging writer 删除 `release/packaging-manifest.json`（与 1.1 记录的 manifest 丢失同源）；沙箱外重跑后恢复。
- Boundary：未修改 report basename / round / 审批规则；未引入 marker / validator / frontmatter 解析；21 个非 Epic 11 文件未纳入。
- 下一步判断：提交实现 commit，再运行 completion gate 与 CR01（`reviewSeries=restart`）。

## 2026-09-11 — CR Reviewer / restart Round 1

- 结果：`FINDINGS_REPORTED`；3/3 layers（blind / edge / auditor，均 claude-opus-5 fresh sub-agent）；scope 315 actual / 294 declared / 21 excluded / 0 exceptions；baseSha `7dc8197`（restart 前 HEAD）、headSha `6079257`。
- Auditor：AC1–AC12 与 Threat Model 全 PASS。
- 12 raw → 9 findings：patch 4（R1-F1 readdir 非 ENOENT 未捕获、R1-F2 契约 :58 与 legacy-resume 矛盾、R1-F3 runner 调用模板/Inputs 未承载 crDir、R1-F5 越界 symlink 先枚举后检测）；decision-needed 1（R1-F4 HALTED finalizer 使 unfinished 翻转）；verify-required 1（R1-F9 goal records 无断言）；defer 1（R1-F6 dangling symlink）；dismiss 建议 2（R1-F7 schema redaction 仓库级约定、R1-F8 config 失败 stdout 为空与 artifact-documents 同约定）。
- 无 Threat Model out-of-scope 类 finding。artifact：`11-9-code-review-summary-20260911-restart-round-1.md`（sha256 `e7b8f68c…`）；`.tmp/restart-round-1/` 已清理。
- 观察：审查层在沙箱内跑 packaging 测试两次删除 `release/packaging-manifest.json`，均已 `git checkout` 恢复；后续 fresh agent 提示中明示不要在沙箱内跑 packaging 测试。
- 下一步判断：fresh CR02 evaluator Round 1。

## 2026-09-11 — CR Evaluator / restart Round 1

- 结果：`FIX_REQUIRED`；acceptedCounts p0=0 / p1=5 / deferred=1 / verifyRequired=1 / dismissed=2；convergence newBlocking=5，architectureCategories=[]。
- 裁决：R1-F1/F2/F3/F5 accepted P1；R1-F4 accepted P1（evaluator 判定可由契约层 ≤2 行规则关闭，不改 resolver / basename，不触发 DECISION_NEEDED / ARCHITECTURE_TRIAGE）；R1-F9 VERIFY；R1-F6 deferred T2；R1-F7 / R1-F8 dismissed（仓库级约定）。
- artifact：`11-9-code-review-evaluation-20260911-restart-round-1.md`（写入时 sha256 `2167d7bc…`，reviewSourceHash 绑定 `e7b8f68c…`）。
- 下一步判断：CR03 fixer mode=patch（preauthorized，authorizationSource=Restart Brief Step 11 + 用户 2026-09-11 决定）。

## 2026-09-11 — CR Fixer / restart Round 1

- 结果：completed（patch）；5 条 P1 + R1-F9 VERIFY 修复；34 files changed；未触碰 deferred / dismissed。
- 关键改动：`cr-directory.unreadable-candidate` issue（非 ENOENT readdir → block）、legacy symlink 目标须为目录、`code-reviews` escape 检测前置；契约调和 legacy-resume、Invocation Parameter Matrix + runner 六个调用串 + CR01–06 Inputs 携带 `crDir` 三字段；HALTED finalizer 重入规则；测试 22 → 25。
- 验证（沙箱外）：`vitest` 726 passed / 0 failed / 4 todo；canonical strict ok；packaging-check PASS；docs:check PASS。
- 观察：runner 调用串中资源上下文置于 `authorizationSource` 之后，以保持 `test/code-review-contract.test.ts:336` 既有断言不变（该测试不在 fixer 授权范围）。
- 下一步判断：提交 fix commit，重新冻结 scope，fresh CR01 restart round 2。

## 2026-09-11 — CR Reviewer / restart Round 2

- 结果：`FINDINGS_REPORTED`；3/3 layers；scope 317 actual / 296 declared / 21 excluded / 0 exceptions；head `53195ae`。
- 历史：R1-F1/F2/F3/F5/F9 resolved；R1-F4 recurred（fresh-session 重入子场景，blind+auditor 复现；edge 判 resolved，按 fingerprint 规则归 recurred）；R1-F6 deferred / R1-F7、F8 dismissed 未变。auditor 核对 round 1 修复 34 files 无越权。
- 新增：R2-F1 `escapesProject` 路径 ELOOP / ENOTDIR / EACCES 未捕获（patch，与 R1-F1 同 invariant 的另一调用面）；R2-F2 别名 symlink 误报 ambiguity（defer）；R2-F3 symlink 产物被 `isFile()` 忽略（defer）。
- counts：patch 2 / defer 3 / dismiss 2。artifact `11-9-code-review-summary-20260911-restart-round-2.md`（sha256 `3b824364…`）。
- 下一步判断：fresh CR02 evaluator round 2。若裁决 FIX_REQUIRED，round 3 为 Restart Brief 规定的上限（≤3 轮）。

## 2026-09-11 — CR Evaluator + Fixer / restart Round 2

- Evaluator：`FIX_REQUIRED`；p1=2（R2-F1 new、R1-F4 recurred）/ deferred=2（R1-F6 T2、R2-F3 T3）/ dismissed=3（R1-F7、R1-F8、R2-F2）；convergence new 1 / recurred 1 / resolved 4 / churn false；evaluator 提示 round 3 若再出 new P1 即 STOP_LOSS。artifact `11-9-code-review-evaluation-20260911-restart-round-2.md`（reviewSourceHash `3b824364…`）。
- Fixer：completed（patch）；`checkBoundary` 包装非 ENOENT 为 `unreadable-candidate`（+5 fixture）；runner Step 0 fresh-session 定位规则 + 契约 :66 扩展到 runner。沙箱外 `vitest` 727 passed / 0 failed；packaging / docs / canonical PASS。
- 下一步判断：提交 fix commit；fresh CR01 restart round 3（≤3 轮上限），仅确认收敛。

## 2026-09-11 — CR Reviewer / restart Round 3

- 结果：`FINDINGS_REPORTED`；3/3 layers；scope 319 / 298 / 21 / 0；head `bee8e07`。R1-F4、R2-F1 三层一致 resolved（累计 7 blocking 关闭）；auditor AC1–12 全 PASS、无越权、0 finding。
- 新增：R3-F1 legacy 条目名含 `\` 时 boundary 归一化错位绕过越界检测（in-scope、极低概率；edge patch / blind defer）；R3-F2 runner Step 0 goal records 写入顺序（非阻塞）；R3-F3 ≥2 legacy 含 finalizer 时定位规则静默（本仓库不可达）。counts：patch 2 / defer 3 / dismiss 3。
- 本轮为 ≤3 轮上限；下一步判断：fresh CR02 evaluator round 3——若 R3-F1 判 new P1 → STOP_LOSS，回到 Restart Brief 汇报；否则进入 CR04/05 → completion gate → CR06。

## 2026-09-11 — CR Evaluator / restart Round 3

- 结果：`PASS_WITH_DEFERRED_TODOS`；p0=0 / p1=0 / deferred=5 / dismissed=3；convergence new 0 / recurred 0 / resolved 2（R1-F4、R2-F1）/ churn false。R3-F1 判 deferred T1（触发需 POSIX 目录名含字面 `\` + 越界 symlink，决策 A 协作式威胁模型之外；evaluator 明示不依赖轮次压力）。
- Deferred：R3-F1 T1、R1-F6 T2、R2-F3 T3、R3-F2 T3、R3-F3 T3。artifact `11-9-code-review-evaluation-20260911-restart-round-3.md`（sha256 `fc332c89…`，reviewSourceHash `d22b4249…`）。
- 下一步判断：CR04 rules-extractor → CR05 closeout（登记 5 条）→ completion gate → CR06。

## 2026-09-11 — CR04 / CR05 / Completion Gate / CR06

- CR04：`COMPLETED`；12 eligible fingerprints，5 candidate rules，2 global-rule-eligible（CR-11-9-R1 ↔ CR-API-15；CR-11-9-R2 ↔ CR-SEC-04 / CR-API-17）；全局文档未改，写入 `cr-rules-summary.md` 待用户授权。
- CR05（closeout，preauthorized）：`COMPLETED`；新增 TODO-023（T1）~027（T3），backlog open 9 → 14。
- Completion gate：`PASS`（restart 重生成，generatedAt ≥ freshness boundary）。
- CR06：`DONE`；Story `in-progress → done`、`sprint-status.yaml:152 → done`，写前/写后 hash 重读一致；无 workflow tracker（config 未声明）。自举：`speclite resolve cr-directory` 对本目录返回 canonical / `finalizerRounds=[3]` / `unfinished=false`。
- Epic handoff：Epic 11 剩余 Story 11.10；未更新 Epic 状态。
