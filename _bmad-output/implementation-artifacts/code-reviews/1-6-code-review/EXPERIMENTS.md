# EXPERIMENTS（尝试记录）

## 2026-05-27

### Experiment 1：Story 1-6 启动预检

- 方案：基于 `sprint-status.yaml` 与 Story 文件确认 `1-6-install-progress-and-ready-summary` 可进入开发。
- 选择原因：Story 1-1 至 1-5 已 Done，Epic 1 的下一个 Story 在 sprint status 中为 `ready-for-dev`，满足串行执行前置条件。
- 结果：已创建 `1-6-code-review` 进度目录和三份中文记录文件。
- 决策：启动新的 `gpt-5.5` sub-agent 执行 `/bmad-dev-story story 1-6`。

### Experiment 2：开发 Story 1-6

- 方案：启动全新的 `gpt-5.5` sub-agent，按 `/bmad-dev-story story 1-6` 执行开发。
- 选择原因：用户明确要求开发步骤必须由新的 sub-agent 使用 `bmad-dev-story` 完成，并且每一步串行等待前一步结束。
- 结果：开发 sub-agent 汇报 Story `1-6` 已完成开发，Story 文件与 `sprint-status.yaml` 均更新为 `review`；新增或更新 install progress lifecycle、`ReadyCheck`、ready summary renderer、install context/runtime guard 关联、failure no-ready-summary gate 和 focused tests/fixtures；验证 `npm ci`、`npx vitest run test/install-progress-ready-summary.test.ts`、`npm test`、`npm run build`、`git diff --check` 均通过。
- 决策：已确认开发验证产生的 `node_modules/` 与 `dist/` 已清理；进入第 1 轮 code review，不在主线程提前修改实现。

### Experiment 3：第 1 轮 Code Review

- 方案：启动全新的 `gpt-5.5` sub-agent，按 `/bmenhance-cr-01-reviewer 1-6` 执行代码审查。
- 选择原因：用户明确要求 reviewer 必须在开发完成后串行执行，并由新的 sub-agent 完成。
- 结果：生成 `_bmad-output/implementation-artifacts/code-reviews/1-6-code-review/1-6-code-review-summary-20260527-round-1.md`；reviewer 结论通过，发现数量 0，分类为 `decision_needed=0`、`patch=0`、`defer=0`；reviewer 按 skill fallback 串行完成 blind / edge / auditor 三层审查；验证 `npm test`、`npm run build`、`npx vitest run test/install-progress-ready-summary.test.ts` 均通过。
- 决策：进入第 1 轮 evaluator；若 evaluator 通过，仍执行 0 修复项 fixer 收口以保持用户指定链路完整。

### Experiment 4：第 1 轮 Review Evaluation

- 方案：启动全新的 `gpt-5.5` sub-agent，按 `/bmenhance-cr-02-evaluator 1-6` 评估最新 review 文件。
- 选择原因：用户要求 reviewer 通过后仍必须由 evaluator 独立确认，只有两者均通过才能退出循环。
- 结果：生成 `_bmad-output/implementation-artifacts/code-reviews/1-6-code-review/1-6-code-review-evaluation-20260527-round-1.md`；evaluator 结论 Approved / 通过，需要修复项 0，误报 0，不需要 fixer；evaluator 尝试复跑验证但因当前工作区缺少 `node_modules`，`vitest` / `tsup` 不可用，该限制已记录在 evaluation 中且不构成修复项。
- 决策：启动 fixer 执行 0 修复项收口；不得修改源码，仅追加必要修复记录。

### Experiment 5：第 1 轮 Fixer 收口

- 方案：启动全新的 `gpt-5.5` sub-agent，按 `/bmenhance-cr-03-fixer 1-6` 读取最新评估文件并处理修复项。
- 选择原因：保持 reviewer/evaluator/fixer 循环链路完整，同时确保 0 修复项不会被误扩展为源码修改。
- 结果：fixer 未修改源码、测试、Story 状态或 `sprint-status.yaml`；仅在 `1-6-code-review-evaluation-20260527-round-1.md` 追加 `Fix Items: 0` 的修复执行记录；未运行测试或 build，因为无代码修复项。
- 决策：reviewer 与 evaluator 均已通过，且 fixer 确认为 0 修复项；无需重复第 2~4 步，进入 04/05/06 CR 收尾。

### Experiment 6：CR 收尾

- 方案：启动第五个全新的 `gpt-5.5` sub-agent，在同一 sub-agent 内严格按顺序执行 `bmenhance-cr-04-rules-extractor 1-6`、`bmenhance-cr-05-todo-tracker 1-6`、`bmenhance-cr-06-finalizer 1-6`。
- 选择原因：用户要求 reviewer/evaluator 双通过后继续执行 04/05/06，并按默认推荐决策推进，避免等待人工决策。
- 结果：04 确认 Story 1-6 无 CR finding、无修复项、无可升格候选规则，并在 `_bmad-output/implementation-artifacts/cr-rules/cr-rules-summary.md` 记录“无新增规则”；05 确认 CR TODO 为 0，未创建空 `cr-todo-backlog.md`；06 将 Story 1-6 标记为 `done`，并同步 `sprint-status.yaml` 中 Story 1-6 状态为 `done`。`bmm-workflow-status.yaml` 不存在，已按规则跳过；Epic 1 下 1-1 至 1-6 均为 `done`，但 finalizer skill 明确要求 Epic 状态必须显式确认，因此 `epic-1` 保持 `in-progress`，未擅自更新。
- 决策：Story 1-6 全流程完成；进入全局验证与 `git-commit-convention` 本地提交。
