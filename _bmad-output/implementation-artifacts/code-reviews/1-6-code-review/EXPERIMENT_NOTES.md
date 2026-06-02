# EXPERIMENT_NOTES（实时笔记）

## 2026-05-28 CR Approved Closeout Run（CR 通过后收尾）

- 本轮按用户指定顺序执行 04 -> 05 -> 06，严格只处理 Story 1-6。
- 04 rules-extractor 已读取 round 1 与 round 2 CR 历史；两轮 reviewer/evaluator 均为通过，findings 0，Fix Items 0，CR TODO 0。
- 04 结论：无可提炼候选规则，无升格评分项，无全局文档更新建议，无需写入 `cr-rules-summary.md`，也无事项交给 05 TODO Tracker。
- 默认决策记录：因无候选规则，本轮采用 no-op 记录，不创建空规则记录，不修改全局文档。
- 05 todo-tracker 已执行：Story 1-6 CR 历史中没有非阻塞延迟项，latest evaluator 明确 CR TODO 数量为 0。
- 05 结论：不新增 `cr-todo-backlog.md` 条目，不修改现有 TODO-001 / TODO-002；当前 backlog 的 open items 均来自其他 Story。
- 06 finalizer 已验证 latest evaluation round 2 为 Approved / 通过，并将 Story 1-6 状态重新收回 `done`。
- 06 同步结果：Story 文件 `Status: done`；`sprint-status.yaml` 中 `1-6-install-progress-and-ready-summary: done`，`last_updated: 2026-05-28 17:23 CST`。
- `bmm-workflow-status.yaml` 不存在，已跳过；Epic 1 全部 Story 已为 done，但 Epic 主状态仍需显式确认，本轮未更新 `epic-1`。

## 2026-05-28 Evaluator Round 2 Run（第 2 轮评估）

- 本轮按用户要求执行 `/bmenhance-cr-02-evaluator 1-6`，即使 reviewer round 2 建议“不需要 evaluator”，仍以 reviewer 通过且 evaluator 通过作为停止条件。
- latest review 已确认：`1-6-code-review-summary-20260528-round-2.md`；reviewer 结论为通过，findings 为 0。
- evaluation 轮次已确认：已有 round 1 evaluation，本轮生成 round 2。
- 独立代码复核重点：`src/commands/install.ts` 的 ReadyCheck 调用时机与 `finalSelectedModules` 传入、`src/installer/ready-check.ts` 的 selected package roots / target skill count / mirror visibility 校验、`src/diagnostics/output.ts` 的 ready summary gate、`src/diagnostics/command-result-schema.ts` 的 JSON contract 严格字段、相关 tests/fixtures 的 canonical 53 package coverage。
- 验证复跑结果：`npm test` 通过（20 / 20 test files，118 / 118 tests）；`npm run build` 通过；Story 1-6 focused 组合通过（4 / 4 test files，32 / 32 tests）；`git diff --check` 无输出。
- Evaluator 判断：reviewer pass / findings 0 成立，未发现遗漏的阻塞问题或 CR TODO；不需要 fixer，不进入 finalizer。

## 2026-05-28 Corrective CR Reopen Run（校正复审轮次）

- 当前判断：Story 1-6 已处于 `review`，说明上一轮 corrective dev verification 已完成到待审状态。
- 用户本轮要求严格执行 `/bmenhance-cr-01-reviewer 1-6`，不重新开发，不执行 evaluator/fixer/finalizer。
- 已按 CR 配置确认本轮为 round 2 复审；round 1 reviewer findings 为 0，evaluation 结论为 Approved / 通过，Fix Items 为 0。
- 当前工具上下文没有 Agent 子代理工具，本轮按 skill fallback 串行完成 Blind Hunter / Edge Case Hunter / Acceptance Auditor 三层视角审查。
- Story 1-6 相关 corrective diff 聚焦 full canonical package root verification、ReadyCheck selected module package roots、IDE target skill count、final pre-write scope summary 和对应 tests/fixtures。
- 验证结果：`npm test` 通过（20 / 20 test files，118 / 118 tests）；`npm run build` 通过；Story 1-6 focused 组合通过（4 / 4 test files，32 / 32 tests）；`git diff --check` 无输出。
- Reviewer 结论：通过；新 findings 为 0；无需进入 fixer。已生成 `1-6-code-review-summary-20260528-round-2.md`。

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
