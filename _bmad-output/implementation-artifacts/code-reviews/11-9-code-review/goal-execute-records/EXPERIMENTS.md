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
