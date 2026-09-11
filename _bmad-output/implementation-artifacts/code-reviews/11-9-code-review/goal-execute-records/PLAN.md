# Plan（计划）

## Goal（目标）

按 2026-09-11 Correct Course 裁决（A 威胁模型边界 / B 实现迁入 `src/` + CLI / C 历史产物归档）从头完成 Story 11.9：一个命名约定、一个派生点、legacy 只读兼容、同步 + 负向扫描 + 测试；`reviewSeries=restart`，CR 闭环目标 ≤3 轮。

## Current Status（当前状态）

- Story 11.1–11.8 与 tracker 均为 `done`；11.9 1.0 / 1.1 实现已回退到 `ff7528d` 表面（commit `523ab4e`），旧 CR 产物归档于 `../superseded-main/`。
- Story 11.9 = `done`（2026-09-11 CR06）；restart kickoff / completion gate 均 `PASS`；TODO-023~027 登记。
- TODO-018~022 标 `superseded-by-restart`。
- 21 个非 Epic 11 未提交文件继续隔离。

## Execution Checklist（执行清单）

- [x] Step 0：建分支 `story-11.9-restart`，回退 9 个 canonical CR 包与测试到 `ff7528d`，删除 `.mjs` / 旧测试 / fixture，归档 234 个旧 CR 产物，提交重置点。
- [x] Step 1：更新 Story（Threat Model、AC9、Dev Notes、Change Log 2.0）、sprint-status、backlog；重新生成 restart kickoff gate。
- [x] Step 2：TDD — `test/cr-directory.test.ts` RED → `src/config/cr-directory.ts` + `speclite resolve cr-directory` GREEN。
- [x] Step 3：契约与 Skill 同步（`cr-contract.md` ≤15 行、runner Step 0、CR01–06 消费文案、8 包 CHANGELOG）+ 文档行人工复核 + canonical strict 检查。
- [x] Step 4：重新生成 fresh-install fixture 与 packaging manifest；`vitest` 0 failed、`docs:check`、`release:check`。
- [x] Step 5：CR01 → CR02 →（CR03）× 2 轮 → round 3 PASS_WITH_DEFERRED_TODOS → CR04 → CR05 → completion gate → CR06 DONE。

## Termination Conditions（终止条件）

不得修改 report basename、round 编号、审批规则（AC12）；不得引入 ownership marker、frontmatter 解析、per-write validator 或任何读取产物正文的逻辑；不得为 hard link / CRLF / TOCTOU / 伪造内容写代码或测试；不得删除 `superseded-main/`。若 CR 第 3 轮仍有 new P1，停下回到重启简报重新评估，而不是延长轮次或做风险豁免。
