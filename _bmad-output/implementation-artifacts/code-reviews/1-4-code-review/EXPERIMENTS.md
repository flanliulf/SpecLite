# EXPERIMENTS（尝试记录）

## 2026-05-26

### Experiment 1：Story 1-4 启动预检

- 方案：基于 `sprint-status.yaml` 与 Story 文件确认 `1-4-project-config-initialization` 可进入开发。
- 选择原因：Story 1-1、1-2、1-3 已 Done，Epic 1 的下一个 Story 在 sprint status 中为 `ready-for-dev`，满足串行执行前置条件。
- 结果：已创建 `1-4-code-review` 进度目录和三份中文记录文件。
- 决策：启动新的 `gpt-5.5` sub-agent 执行 `/bmad-dev-story story 1-4`。

### Experiment 2：开发 Story 1-4

- 方案：启动全新的 `gpt-5.5` sub-agent，按 `/bmad-dev-story story 1-4` 执行开发。
- 选择原因：用户明确要求开发步骤必须由新的 sub-agent 使用 `bmad-dev-story` 完成，并且每一步串行等待前一步结束。
- 结果：开发 sub-agent 汇报 Story `1-4` 已完成开发，Story 文件与 `sprint-status.yaml` 均更新为 `review`；新增或更新配置 schema、reader/writer、config initialization、install plan config 投影、CLI prompt 与相关测试；`npx vitest run test/config-initialization.test.ts`、`npm test`、`npm run build` 均通过。
- 决策：进入第 1 轮 code review；不在主线程提前修改实现，避免绕过 CR 流程。

### Experiment 3：第 1 轮 Code Review

- 方案：启动全新的 `gpt-5.5` sub-agent，按 `/bmenhance-cr-01-reviewer 1-4` 执行代码审查。
- 选择原因：用户明确要求 reviewer 必须在开发完成后串行执行，并由新的 sub-agent 完成。
- 结果：生成 `_bmad-output/implementation-artifacts/code-reviews/1-4-code-review/1-4-code-review-summary-20260526-round-1.md`；reviewer 结论不通过，提出 2 个 `patch` 项：detailed config CLI 只能选择模式不能调整字段、rejected artifact path 会回显原始绝对/敏感路径。
- 决策：进入 evaluator，先由独立评估判断 2 个 patch 项的有效性与修复范围，再启动 fixer。

### Experiment 4：第 1 轮 Review Evaluation

- 方案：启动全新的 `gpt-5.5` sub-agent，按 `/bmenhance-cr-02-evaluator 1-4` 评估最新 review 文件。
- 选择原因：reviewer findings 涉及 AC4 交互能力和 AC9 隐私契约，需要独立确认严重性与修复范围。
- 结果：生成 `_bmad-output/implementation-artifacts/code-reviews/1-4-code-review/1-4-code-review-evaluation-20260526-round-1.md`；evaluator 结论不通过，确认 2 个 findings 均有效，误报 0 项。
- 决策：启动 fixer 修复 2 项；修复范围限定为 CLI detailed config collection 与 rejected artifact path public redaction。

### Experiment 5：第 1 轮 Fixer

- 方案：启动全新的 `gpt-5.5` sub-agent，按 `/bmenhance-cr-03-fixer 1-4` 修复 evaluator 确认的 2 项。
- 选择原因：evaluator 已确认 2 项均有效且不通过，必须先修复再复审。
- 结果：fixer 修改 `src/bin/speclite.ts`、`src/commands/install.ts`、`src/config/config-schema.ts`、`test/cli-smoke.test.ts`、`test/config-initialization.test.ts`、`test/install-module-selection.test.ts`，并向 evaluation 文件追加修复记录；`npm ci`、`npm test`、`npm run build`、再次 `npm test` 均通过，其中一次 build 类型错误已由 fixer 最小修正。
- 决策：进入第 2 轮 reviewer/evaluator 复审，重点确认 2 个修复项是否关闭且无新增回归。

### Experiment 6：第 2 轮 Code Review

- 方案：启动全新的 `gpt-5.5` sub-agent，按 `/bmenhance-cr-01-reviewer 1-4` 执行复审。
- 选择原因：fixer 修改了源码和测试，必须重新由 reviewer 验证已修复问题和新增回归。
- 结果：生成 `_bmad-output/implementation-artifacts/code-reviews/1-4-code-review/1-4-code-review-summary-20260526-round-2.md`；reviewer 结论通过，第 1 轮 2 个 findings 均已关闭，新发现数量 0。
- 决策：进入第 2 轮 evaluator；如果 evaluator 通过，仍执行 0 修复项 fixer 收口以保持用户指定链路完整。

### Experiment 7：第 2 轮 Review Evaluation

- 方案：启动全新的 `gpt-5.5` sub-agent，按 `/bmenhance-cr-02-evaluator 1-4` 评估第 2 轮 review 文件。
- 选择原因：用户要求 reviewer 通过后还必须由 evaluator 独立确认，只有两者均通过才能退出循环。
- 结果：生成 `_bmad-output/implementation-artifacts/code-reviews/1-4-code-review/1-4-code-review-evaluation-20260526-round-2.md`；evaluator 结论 Approved / 通过，确认上轮 2 个 findings 均已关闭，需要修复项 0，CR TODO 0。
- 决策：启动 fixer 执行 0 修复项收口；不得修改源码，仅追加必要修复记录。

### Experiment 8：第 2 轮 Fixer 收口

- 方案：启动全新的 `gpt-5.5` sub-agent，按 `/bmenhance-cr-03-fixer 1-4` 读取最新评估文件并处理修复项。
- 选择原因：保持 reviewer/evaluator/fixer 循环链路完整，同时确保 0 修复项不会被误扩展为源码修改。
- 结果：fixer 未修改源码、测试、配置、Story 文档或状态文件；仅在 `1-4-code-review-evaluation-20260526-round-2.md` 追加 `Fix Items: 0` 的修复执行记录。
- 决策：reviewer 与 evaluator 均已通过，且 fixer 确认为 0 修复项；无需重复第 2~4 步，进入 04/05/06 CR 收尾。

### Experiment 9：CR 收尾

- 方案：启动第五个全新的 `gpt-5.5` sub-agent，按顺序执行 `bmenhance-cr-04-rules-extractor 1-4`、`bmenhance-cr-05-todo-tracker 1-4`、`bmenhance-cr-06-finalizer 1-4`。
- 选择原因：用户要求通过后仍需执行 04、05、06，并按默认推荐决策处理规则和 TODO。
- 结果：04 按 record-only 更新 `_bmad-output/implementation-artifacts/cr-rules/cr-rules-summary.md`，复用并更新既有 `CR-API-03`，未修改全局文档；05 判定 CR TODO 数量为 0，未创建 TODO backlog；06 验证最新 evaluation 为 Approved / 通过后，将 Story 文件更新为 `Status: done`，并将 `sprint-status.yaml` 中 `1-4-project-config-initialization` 更新为 `done`。
- 决策：`_bmad-output/planning-artifacts/bmm-workflow-status.yaml` 不存在，按 skill 规则跳过；Epic 1 尚有未完成 Story，不更新 Epic 状态。Story 1-4 完成，进入 Story 1-5。
