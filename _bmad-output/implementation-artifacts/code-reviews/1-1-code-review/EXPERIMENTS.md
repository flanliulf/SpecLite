# EXPERIMENTS（尝试记录）

## 2026-05-26

### Experiment 1：执行前权威范围预检

- 方案：读取 `sprint-status.yaml`、Epic 1 规划文件、Story 文件目录和 CR 配置，确认 Story 范围与输出目录。
- 选择原因：该流程会修改代码和状态文件，必须先确认 Story 存在且输出路径符合 skill 配置，避免对不存在或错误范围执行开发。
- 结果：确认 Epic 1 包含 `1-1` 到 `1-6` 共 6 个 Story，均为 `ready-for-dev`；CR 输出目录应为 `_bmad-output/implementation-artifacts/code-reviews/{story-id}-code-review/`。
- 决策：从 `1-1` 开始串行执行；不使用已有 `story-reviews/epic-1-story-review/`，该目录属于 Story design review，不是本次 code review 输出目录。

### Experiment 2：开发 Story 1-1

- 方案：启动全新的 `gpt-5.5` sub-agent，按 `/bmad-dev-story story 1-1` 执行开发。
- 选择原因：用户明确要求开发步骤必须由新的 sub-agent 使用 `bmad-dev-story` 完成，并且每一步串行等待前一步结束。
- 结果：开发 sub-agent 汇报 Story `1-1` 已完成开发，Story 状态更新为 `review`，`sprint-status.yaml` 对应条目更新为 `review`；`npm install`、`npm run build`、`npm test`、`node dist/bin/speclite.js install --json`、`npm run release:packaging-check` 和 `git diff --check` 均通过。
- 决策：进入第 1 轮 code review；不在主线程提前修补开发结果，避免绕过 CR 流程。

### Experiment 3：第 1 轮 Code Review

- 方案：启动全新的 `gpt-5.5` sub-agent，按 `/bmenhance-cr-01-reviewer 1-1` 执行代码审查。
- 选择原因：用户明确要求 reviewer 必须在开发完成后串行执行，并由新的 sub-agent 完成。
- 结果：生成 `_bmad-output/implementation-artifacts/code-reviews/1-1-code-review/1-1-code-review-summary-20260526-round-1.md`；reviewer 建议通过，未发现 `patch`、`decision_needed`、`defer` 或 `dismiss` 项。由于 reviewer sub-agent 环境没有内部 `Agent` 工具，按 skill 降级规则执行串行审查并记录。
- 决策：进入 evaluator。若 evaluator 也通过且无修复项，推荐跳过无意义 fixer，直接进入 CR 收尾。

### Experiment 4：第 1 轮 Review Evaluation

- 方案：启动全新的 `gpt-5.5` sub-agent，按 `/bmenhance-cr-02-evaluator 1-1` 评估最新 review 文件。
- 选择原因：用户要求 reviewer 完成后必须由独立 evaluator 判断审查结果是否有效。
- 结果：生成 `_bmad-output/implementation-artifacts/code-reviews/1-1-code-review/1-1-code-review-evaluation-20260526-round-1.md`；评估结论为 Approved / 通过，需要修复项 0，CR TODO 0。
- 决策：为严格贴合用户指定的 2~4 步骤，仍启动 fixer sub-agent 执行“0 修复项”收口；要求 fixer 不修改源码，仅在必要时按 skill 记录无修复项。

### Experiment 5：第 1 轮 Fixer 收口

- 方案：启动全新的 `gpt-5.5` sub-agent，按 `/bmenhance-cr-03-fixer 1-1` 读取最新评估文件并处理修复项。
- 选择原因：用户要求 reviewer/evaluator/fixer 组成一轮循环；虽然 evaluator 明确无需 fixer，但执行 0 修复项收口可以保持流程完整且不扩大修改范围。
- 结果：fixer 未修改源码、测试、配置、Story 文档或状态文件；仅在 `1-1-code-review-evaluation-20260526-round-1.md` 追加 `Fix Items: 0` 的修复执行记录。
- 决策：reviewer 与 evaluator 均已通过，且 fixer 确认为 0 修复项；无需重复第 2~4 步，进入 04/05/06 CR 收尾。

### Experiment 6：CR 收尾

- 方案：启动第五个全新的 `gpt-5.5` sub-agent，按顺序执行 `bmenhance-cr-04-rules-extractor 1-1`、`bmenhance-cr-05-todo-tracker 1-1`、`bmenhance-cr-06-finalizer 1-1`。
- 选择原因：用户要求通过后仍需执行 04、05、06，并按默认推荐决策处理规则和 TODO。
- 结果：04 判定无可沉淀规则，未写入全局文档或 `cr-rules-summary.md`；05 判定 CR TODO 数量为 0，未创建或更新 TODO backlog；06 验证 evaluation 为 Approved / 通过后，将 Story 文件更新为 `Status: Done`，并将 `sprint-status.yaml` 中 `1-1-cli-install-entry-and-runtime-guard` 更新为 `done`。
- 决策：`_bmad-output/planning-artifacts/bmm-workflow-status.yaml` 不存在，按 skill 规则跳过；Epic 1 尚有未完成 Story，不更新 Epic 状态。Story 1-1 完成，进入 Story 1-2。
