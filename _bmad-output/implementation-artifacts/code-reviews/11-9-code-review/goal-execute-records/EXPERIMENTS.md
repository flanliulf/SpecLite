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
