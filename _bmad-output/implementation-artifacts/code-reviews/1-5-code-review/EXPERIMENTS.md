# EXPERIMENTS（尝试记录）

## 2026-05-28 Corrective CR Reopen Run（校正复审轮次）

### Attempt 0（准备与分流）

- 方案：先核对 `sprint-status.yaml` 中 Story 1-5 的状态，再决定是否执行 dev-story。
- 原因：用户明确要求如果 story 对应 sprint 状态是 `review`，则跳过 `/bmad-dev-story story {story id}`。
- 结果：Story 1-5 当前状态为 `review`，本轮跳过 dev-story，等待 Story 1-3 闭环完成后进入 reviewer -> evaluator -> fixer 串行闭环。

### Attempt 1（第 3 轮 Code Review）

- 方案：严格执行 `/bmenhance-cr-01-reviewer 1-5`，只做 Story 1-5 的 reopened corrective dev verification 复审。
- 选择原因：用户明确要求本轮只执行 reviewer，不重新开发，也不执行 evaluator/fixer/finalizer。
- 输入：Story 文件 `_bmad-output/implementation-artifacts/stories/1-5-runtime-structure-artifact-directory-and-ide-mirror-creation.md`、既有 round 1/2 review 与 evaluation、以及 Story 1-5 scoped diff。
- 执行模式：当前环境未提供独立 `Agent` 调度工具，按 skill 降级为当前上下文串行三层审查；三层均完成，无失败层。
- 验证：
  - `npm test -- test/runtime-structure.test.ts test/ide-target-writer.test.ts test/install-module-selection.test.ts test/cli-smoke.test.ts` 通过，4 files / 26 tests。
  - `npm test` 通过，20 files / 118 tests。
  - `npm run build` 通过。
  - `npm run lint` 不可用，项目未定义 `lint` script。
  - Story 1-5 scoped `git diff --check` 通过。
- 结果：生成 `_bmad-output/implementation-artifacts/code-reviews/1-5-code-review/1-5-code-review-summary-20260528-round-3.md`；reviewer 结论通过，findings 0。
- 决策：本 reviewer 步骤无需进入 fixer；按用户指令本轮不启动 evaluator/fixer/finalizer。

### Attempt 2（第 3 轮 Review Evaluation）

- 方案：严格执行 `/bmenhance-cr-02-evaluator 1-5`，评估最新 round 3 reviewer 输出。
- 选择原因：用户停止条件要求 reviewer 通过且 evaluator 评估也通过；即使 reviewer 建议不需要 evaluator，本步骤仍需执行。
- 输入：`1-5-code-review-summary-20260528-round-3.md`、Story 1-5 文件、相关源码与测试证据，以及已有 round 1/2 review/evaluation 记录。
- 验证：
  - `npm test -- test/runtime-structure.test.ts test/ide-target-writer.test.ts test/install-module-selection.test.ts test/cli-smoke.test.ts` 通过，4 files / 26 tests。
  - `npm test` 通过，20 files / 118 tests。
  - Story 1-5 scoped `git diff --check` 通过。
  - 未运行 `npm run build`，避免 evaluator 步骤改写 `dist/` 构建产物；`package.json` 当前未定义 `lint` script。
- 结果：生成 `_bmad-output/implementation-artifacts/code-reviews/1-5-code-review/1-5-code-review-evaluation-20260528-round-3.md`；evaluator 结论 Approved / 通过，确认 reviewer pass 成立，findings 0，无遗漏阻塞项。
- 决策：需要修复项 0，CR TODO 0，不需要 fixer；按用户指令不执行 fixer/finalizer。

### Attempt 3（CR 规则提炼收尾）

- 方案：严格执行 `bmenhance-cr-04-rules-extractor` for Story 1-5，读取 round 1/2/3 review 与 evaluation 历史。
- 选择原因：用户要求即使 round 3 无新增 findings，也要按结果执行 04，并采用默认推荐决策避免挂起。
- 输入：`1-5-code-review-summary-20260526-round-1.md`、`1-5-code-review-evaluation-20260526-round-1.md`、`1-5-code-review-summary-20260527-round-2.md`、`1-5-code-review-evaluation-20260527-round-2.md`、`1-5-code-review-summary-20260528-round-3.md`、`1-5-code-review-evaluation-20260528-round-3.md`。
- 结果：round 3 reviewer/evaluator 均通过且 findings 0，未产生新的可沉淀规则；已按 record-only 默认决策补充 `_bmad-output/implementation-artifacts/cr-rules/cr-rules-summary.md` 中 Story 1-5 的 round 3 来源、关闭证据和无新增规则结论；未修改全局文档。
- 决策：保留既有 `CR-SEC-02`、`CR-API-06`、`CR-API-07`，不新增规则，不交给 05 TODO Tracker。

### Attempt 4（CR TODO 跟踪收尾）

- 方案：严格执行 `bmenhance-cr-05-todo-tracker` for Story 1-5，按 extract/check 语义核对最新 CR 是否存在非阻塞延迟项。
- 选择原因：用户要求即使 evaluation 已声明 CR TODO 0，本次仍要执行 05 并记录结果。
- 输入：`1-5-code-review-evaluation-20260528-round-3.md`、既有 `_bmad-output/implementation-artifacts/cr-rules/cr-todo-backlog.md`。
- 结果：round 3 evaluation 明确 `CR TODO 数量: 0`，未识别 Story 1-5 未解决非阻塞项；既有 backlog 仅包含 Story 2-4 与 2-5 条目，未新增、未改动。
- 决策：Story 1-5 CR TODO 为 0；无需主 agent 后续处理 1-5 TODO。

### Attempt 5（CR Finalizer 收尾）

- 方案：严格执行 `bmenhance-cr-06-finalizer` for Story 1-5，先验证最新 evaluation Approved，再同步状态。
- 选择原因：Story 1-5 因 corrective reopen 回到 `review`，最新 round 3 evaluator 已通过，用户要求在规则允许范围内重新收回 `done`。
- 输入：Story 文件 `_bmad-output/implementation-artifacts/stories/1-5-runtime-structure-artifact-directory-and-ide-mirror-creation.md`、`sprint-status.yaml`、最新 evaluation 文件。
- 结果：将 Story 文件 `Status: review` 更新为 `Status: done`；将 `sprint-status.yaml` 中 `1-5-runtime-structure-artifact-directory-and-ide-mirror-creation` 从 `review` 更新为 `done`，并更新 `last_updated` 为 `2026-05-28 17:09 CST`。
- 决策：`_bmad-output/planning-artifacts/bmm-workflow-status.yaml` 不存在，按 finalizer 文件容错规则跳过；Epic 1 下 Story 1-6 仍为 `review`，不更新 `epic-1` 主状态。

## 2026-05-26

### Experiment 1：Story 1-5 启动预检

- 方案：基于 `sprint-status.yaml` 与 Story 文件确认 `1-5-runtime-structure-artifact-directory-and-ide-mirror-creation` 可进入开发。
- 选择原因：Story 1-1 至 1-4 已 Done，Epic 1 的下一个 Story 在 sprint status 中为 `ready-for-dev`，满足串行执行前置条件。
- 结果：已创建 `1-5-code-review` 进度目录和三份中文记录文件。
- 决策：启动新的 `gpt-5.5` sub-agent 执行 `/bmad-dev-story story 1-5`。

### Experiment 2：开发 Story 1-5

- 方案：启动全新的 `gpt-5.5` sub-agent，按 `/bmad-dev-story story 1-5` 执行开发。
- 选择原因：用户明确要求开发步骤必须由新的 sub-agent 使用 `bmad-dev-story` 完成，并且每一步串行等待前一步结束。
- 结果：开发 sub-agent 汇报 Story `1-5` 已完成开发，Story 文件与 `sprint-status.yaml` 均更新为 `review`；新增或更新 runtime structure、artifact directory、IDE mirror writer、manifest/index、safe filesystem utilities、fixture expected output 和相关测试；`npm run build`、`npm test -- test/runtime-structure.test.ts`、`npm test` 均通过。
- 决策：已清理由验证产生的未跟踪 `node_modules/` 与 `dist/`；进入第 1 轮 code review，不在主线程提前修改实现。

### Experiment 3：第 1 轮 Code Review

- 方案：启动全新的 `gpt-5.5` sub-agent，按 `/bmenhance-cr-01-reviewer 1-5` 执行代码审查。
- 选择原因：用户明确要求 reviewer 必须在开发完成后串行执行，并由新的 sub-agent 完成。
- 结果：生成 `_bmad-output/implementation-artifacts/code-reviews/1-5-code-review/1-5-code-review-summary-20260526-round-1.md`；reviewer 结论不通过，提出 3 个高严重性 `patch` 项：IDE mirror entry root 在安全校验前被创建、`module-help.csv` 引用缺失 canonical package 时静默丢弃、写入中途失败时 public failure output 隐藏已完成 mutations。
- 决策：进入 evaluator，先由独立评估判断 3 个 patch 项的有效性与修复范围，再启动 fixer。

### Experiment 4：第 1 轮 Review Evaluation

- 方案：启动全新的 `gpt-5.5` sub-agent，按 `/bmenhance-cr-02-evaluator 1-5` 评估最新 review 文件。
- 选择原因：reviewer findings 涉及写入安全、metadata 完整性和 partial failure 诊断，需要独立确认严重性与修复范围。
- 结果：生成 `_bmad-output/implementation-artifacts/code-reviews/1-5-code-review/1-5-code-review-evaluation-20260526-round-1.md`；evaluator 结论不通过，确认 3 个 findings 均有效，误报 0 项。
- 决策：启动 fixer 修复 3 项；修复范围限定为 IDE mirror directory safe creation、module-help canonical package integrity validation、write-phase partial progress failure output。

### Experiment 5：第 1 轮 Fixer

- 方案：启动全新的 `gpt-5.5` sub-agent，按 `/bmenhance-cr-03-fixer 1-5` 修复 evaluator 确认的 3 项。
- 选择原因：evaluator 已确认 3 项均有效且不通过，必须先修复再复审。
- 结果：fixer 修改 `src/fs/safe-write.ts`、`src/fs/copy-tree.ts`、`src/modules/module-metadata.ts`、`src/installer/runtime-structure.ts`、`src/commands/install.ts`、`test/runtime-structure.test.ts`、`test/source-and-modules.test.ts`、`test/install-module-selection.test.ts`，并向 evaluation 文件追加修复记录；`npm test -- --run test/runtime-structure.test.ts test/source-and-modules.test.ts test/install-module-selection.test.ts`、`npm test`、`npm run build` 均通过。
- 决策：进入第 2 轮 reviewer/evaluator 复审，重点确认 3 个修复项是否关闭且无新增回归。

### Experiment 6：第 2 轮 Code Review

- 方案：启动全新的 `gpt-5.5` sub-agent，按 `/bmenhance-cr-01-reviewer 1-5` 执行复审。
- 选择原因：fixer 修改了源码和测试，必须重新由 reviewer 验证已修复问题和新增回归。
- 结果：生成 `_bmad-output/implementation-artifacts/code-reviews/1-5-code-review/1-5-code-review-summary-20260527-round-2.md`；reviewer 结论通过，第 1 轮 3 个 findings 均已关闭，新发现数量 0。
- 决策：进入第 2 轮 evaluator；如果 evaluator 通过，仍执行 0 修复项 fixer 收口以保持用户指定链路完整。

### Experiment 7：第 2 轮 Review Evaluation

- 方案：启动全新的 `gpt-5.5` sub-agent，按 `/bmenhance-cr-02-evaluator 1-5` 评估第 2 轮 review 文件。
- 选择原因：用户要求 reviewer 通过后还必须由 evaluator 独立确认，只有两者均通过才能退出循环。
- 结果：生成 `_bmad-output/implementation-artifacts/code-reviews/1-5-code-review/1-5-code-review-evaluation-20260527-round-2.md`；evaluator 结论 Approved / 通过，确认上轮 3 个 findings 均已关闭，需要修复项 0，CR TODO 0。
- 决策：启动 fixer 执行 0 修复项收口；不得修改源码，仅追加必要修复记录。

### Experiment 8：第 2 轮 Fixer 收口

- 方案：启动全新的 `gpt-5.5` sub-agent，按 `/bmenhance-cr-03-fixer 1-5` 读取最新评估文件并处理修复项。
- 选择原因：保持 reviewer/evaluator/fixer 循环链路完整，同时确保 0 修复项不会被误扩展为源码修改。
- 结果：fixer 未修改源码、测试、配置、Story 文档或状态文件；仅在 `1-5-code-review-evaluation-20260527-round-2.md` 追加 `Fix Items: 0` 的修复执行记录。
- 决策：reviewer 与 evaluator 均已通过，且 fixer 确认为 0 修复项；无需重复第 2~4 步，进入 04/05/06 CR 收尾。

### Experiment 9：CR 收尾

- 方案：启动第五个全新的 `gpt-5.5` sub-agent，在同一 sub-agent 内严格按顺序执行 `bmenhance-cr-04-rules-extractor 1-5`、`bmenhance-cr-05-todo-tracker 1-5`、`bmenhance-cr-06-finalizer 1-5`。
- 选择原因：用户要求 reviewer/evaluator 双通过后继续执行 04/05/06，并按默认推荐决策推进，避免等待人工决策。
- 结果：04 以 record-only 方式更新 `_bmad-output/implementation-artifacts/cr-rules/cr-rules-summary.md`，新增 `CR-SEC-02`、`CR-API-06`、`CR-API-07`，未改全局文档；05 确认 CR TODO 为 0，未创建 `cr-todo-backlog.md`；06 基于最新 Approved 评估将 Story 1-5 标记为 `done`，并同步 `sprint-status.yaml` 中 Story 1-5 状态为 `done`。`bmm-workflow-status.yaml` 不存在，已按规则跳过；Epic 1 仍有 Story 1-6 未完成，未更新 Epic 状态。
- 决策：Story 1-5 全流程完成；进入 Story 1-6 初始化与开发。
