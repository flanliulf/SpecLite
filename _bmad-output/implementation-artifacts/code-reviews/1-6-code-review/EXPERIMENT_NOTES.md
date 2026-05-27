# EXPERIMENT_NOTES（实时笔记）

## 2026-05-27

- Story 1-1、1-2、1-3、1-4、1-5 已完成开发、CR、评估、修复收口和 04/05/06 收尾，状态为 done。
- 当前 Story 为 `1-6-install-progress-and-ready-summary`。
- 需要重点约束：本 Story 只负责 install progress lifecycle、`ReadyCheck` 最小本地检查、human-readable ready summary、`install --json` completed/pending projection、failure no-ready-summary gate 和对应 tests/fixtures。
- 不得实现 Epic 2、Post-MVP commands、remote source freshness/provenance revalidation、implicit update check、repair planning、full validate/hash scan 或 branded Copilot/Cursor target readiness。
- 已启动新的 `gpt-5.5` sub-agent 执行 `/bmad-dev-story story 1-6`。
- 开发 sub-agent 已完成 `/bmad-dev-story story 1-6`，Story 状态进入 `review`。
- 开发结果包括 install progress lifecycle、`ReadyCheck`、ready summary renderer、failure no-ready-summary gate、install context/runtime guard 关联和 focused tests/fixtures。
- 开发验证通过：`npm ci`、`npx vitest run test/install-progress-ready-summary.test.ts`、`npm test`、`npm run build`、`git diff --check`。
- 已确认开发验证产生的 `node_modules/` 与 `dist/` 已清理。
- 已启动全新的 `gpt-5.5` sub-agent 执行 `/bmenhance-cr-01-reviewer 1-6`。
- 第 1 轮 reviewer 已完成，结论通过；findings 为 0，分类为 `decision_needed=0`、`patch=0`、`defer=0`。
- reviewer 验证通过：`npm test`、`npm run build`、`npx vitest run test/install-progress-ready-summary.test.ts`。
- 已启动全新的 `gpt-5.5` sub-agent 执行 `/bmenhance-cr-02-evaluator 1-6`。
- 第 1 轮 evaluator 已完成，结论 Approved / 通过；需要修复项 0，误报 0。
- evaluator 尝试复跑验证时因当前工作区缺少 `node_modules`，`vitest` / `tsup` 不可用；这不构成代码修复项，最终提交前需要由主流程重新安装依赖并验证。
- 已启动全新的 `gpt-5.5` sub-agent 执行 `/bmenhance-cr-03-fixer 1-6` 做 0 修复项收口。
- 第 1 轮 fixer 已完成 0 修复项收口；未修改源码、测试、Story 状态或 `sprint-status.yaml`，仅追加 evaluation 修复记录。
- 已启动第五个全新的 `gpt-5.5` sub-agent，在同一 sub-agent 内严格按顺序执行 `bmenhance-cr-04-rules-extractor`、`bmenhance-cr-05-todo-tracker`、`bmenhance-cr-06-finalizer`。
- 04/05/06 已完成：无新增 CR 规则、CR TODO 为 0、Story 1-6 状态与 `sprint-status.yaml` 已同步为 done。
- Epic 1 下 1-1 至 1-6 均为 done，但 finalizer skill 要求 Epic 状态显式确认，因此 `epic-1` 暂保留 `in-progress`。
- 下一步：执行全局验证，然后启动 `gpt-5.4` sub-agent 使用 `git-commit-convention` 本地提交，不推送。
