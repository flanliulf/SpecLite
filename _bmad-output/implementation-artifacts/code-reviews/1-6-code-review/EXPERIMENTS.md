# EXPERIMENTS（尝试记录）

## 2026-05-28 CR Approved Closeout Run（CR 通过后收尾）

### Attempt 6（Rules Extractor / 规则提炼）

- 方案：按 `bmenhance-cr-04-rules-extractor` 读取 Story 1-6 全部 CR 历史，包括 round 1 reviewer/evaluator 与 round 2 reviewer/evaluator。
- 原因：用户要求即使前序技能原本不要求执行，本轮仍需根据 CR 通过结果执行 04，并采用默认推荐决策避免挂起。
- 结果：round 1 reviewer finding 0，round 1 evaluator Approved / 通过、CR TODO 0；round 2 reviewer finding 0，round 2 evaluator Approved / 通过、Fix Items 0、CR TODO 0。无重复 finding、无修复引入问题、无未解决非阻塞项。
- 升格判定：无候选规则进入硬性门槛与 6 维评分；建议去向为“不沉淀”，无需更新全局文档、`cr-rules-summary.md` 或交给 05 TODO Tracker。
- 决策：本次 04 为 analysis-only no-op；只在本过程记录中记录结论，不修改 `_bmad-output/implementation-artifacts/cr-rules/cr-rules-summary.md`。

### Attempt 7（TODO Tracker / CR 待办追踪）

- 方案：按 `bmenhance-cr-05-todo-tracker` extract/check Story 1-6 的全部 CR 文件，重点读取 latest evaluation 的“建议纳入 CR TODO 跟踪”与评估决定。
- 原因：用户要求即使 evaluator 已写明 CR TODO 0，本轮仍执行 05 并记录结果。
- 结果：round 1 evaluation 未记录 CR TODO；round 2 reviewer 明确“仍为非阻塞待办：无”；round 2 evaluator 明确“建议纳入 CR TODO 跟踪：无”且“CR TODO 数量：0”。现有 `_bmad-output/implementation-artifacts/cr-rules/cr-todo-backlog.md` 有 2 条 open item，但来源分别为 Story 2-4 与 Story 2-5，非 Story 1-6。
- 决策：Story 1-6 无新增 CR TODO，不写入 backlog，不修改既有 TODO-001 / TODO-002。

### Attempt 8（Finalizer / 状态收尾）

- 方案：按 `bmenhance-cr-06-finalizer` 定位 Story 1-6、读取 latest evaluation round 2，并同步 Story 与 sprint 状态。
- 原因：latest evaluator 结论为 Approved / 通过，Fix Items 0，CR TODO 0，满足 CR approved 后收尾前置条件。
- 结果：`_bmad-output/implementation-artifacts/stories/1-6-install-progress-and-ready-summary.md` 状态从 `review` 更新为 `done`；`_bmad-output/implementation-artifacts/sprint-status.yaml` 中 `1-6-install-progress-and-ready-summary` 从 `review` 更新为 `done`，`last_updated` 更新为 `2026-05-28 17:23 CST`。
- 工作流文件：`_bmad-output/planning-artifacts/bmm-workflow-status.yaml` 当前不存在，按 finalizer 容错规则跳过。
- Epic 状态：更新后 Epic 1 下 1-1 至 1-6 均为 `done`，但 finalizer skill 对 Epic 主状态要求显式确认；本轮按用户边界不擅自更新 `epic-1` 主状态，保持 `in-progress`。
- 决策：Story 1-6 收回 `done`；不处理无关 Story 或 Epic 主状态。

## 2026-05-28 Evaluator Round 2 Run（第 2 轮评估）

### Attempt 3（Evaluator 上下文定位）

- 方案：按 `bmenhance-cr-02-evaluator` 配置定位 Story ID、CR 目录、最新 review 文件和 evaluation 轮次。
- 原因：用户明确要求即使 reviewer 建议不需要 evaluator，本步骤仍需执行，停止条件是 reviewer 与 evaluator 均通过。
- 结果：最新 review 为 `1-6-code-review-summary-20260528-round-2.md`；现有 evaluation 只有 `1-6-code-review-evaluation-20260527-round-1.md`，本轮应生成 round 2。
- 决策：只评估 Story 1-6 latest review；不进入 fixer/finalizer，不修改源码或 Story 文档。

### Attempt 4（Reviewer pass 独立复核）

- 方案：读取 Story 1-6、round 2 review、round 1 evaluation、Story 1-6 相关实现文件与测试文件，核对 reviewer findings 0 是否有遗漏。
- 原因：round 2 reviewer 结论为通过且 0 findings，evaluator 仍需独立判断无发现是否成立。
- 结果：代码证据显示 `src/commands/install.ts` 在 write phase 成功后传入 `finalSelectedModules` 运行 `runReadyCheck`；`src/installer/ready-check.ts` 校验 selected package roots、skill-index evidence、IDE target skill count、selected target mirror visibility、required indexes 与 runtime paths；`src/diagnostics/output.ts` 只在 success / no issues / pending empty / completed includes `ready-check` + `ready-summary` 时渲染 ready summary；`src/diagnostics/command-result-schema.ts` 未新增未契约 public JSON field。
- 决策：未发现 reviewer 漏掉阻塞项或 CR TODO；继续复跑验证命令。

### Attempt 5（Evaluator 验证复跑）

- 方案：复跑 reviewer 记录的验证命令：`npm test`、`npm run build`、focused Vitest 组合和 `git diff --check`。
- 原因：round 1 evaluation 曾因缺少 `node_modules` 无法复现测试，本轮必须基于当前真实环境重新确认。
- 结果：`npm test` 通过（20 / 20 test files，118 / 118 tests）；`npm run build` 通过；`npx vitest run test/install-progress-ready-summary.test.ts test/runtime-structure.test.ts test/install-module-selection.test.ts test/cli-smoke.test.ts` 通过（4 / 4 test files，32 / 32 tests）；`git diff --check` 无输出。
- 决策：生成 `_bmad-output/implementation-artifacts/code-reviews/1-6-code-review/1-6-code-review-evaluation-20260528-round-2.md`，结论 Approved / 通过，需要 fixer：否。

## 2026-05-28 Corrective CR Reopen Run（校正复审轮次）

### Attempt 0（准备与分流）

- 方案：先核对 `sprint-status.yaml` 中 Story 1-6 的状态，再决定是否执行 dev-story。
- 原因：用户明确要求如果 story 对应 sprint 状态是 `review`，则跳过 `/bmad-dev-story story {story id}`。
- 结果：Story 1-6 当前状态为 `review`，本轮跳过 dev-story，并按用户本次指令仅进入 reviewer 复审，不进入 evaluator/fixer/finalizer。

### Attempt 1（Reviewer 复审上下文收集）

- 方案：按 `bmenhance-cr-01-reviewer` 配置读取 Story、历史 round 1 review/evaluation、Story 1-6 相关 git diff，并确认本轮轮次。
- 原因：用户本轮明确要求只执行 reviewer，不重新开发，也不执行 evaluator/fixer/finalizer；因此需要从历史评估和 corrective diff 中建立复审上下文。
- 结果：已有 summary round 1 与 evaluation round 1，本轮为 round 2 复审。历史 round 1 findings 为 0，evaluation 为 Approved / 通过，Fix Items 为 0。当前 Story 1-6 相关 diff 覆盖 `src/bin/speclite.ts`、`src/commands/install.ts`、`src/installer/config-initialization.ts`、`src/installer/ready-check.ts`、`test/cli-smoke.test.ts`、`test/install-module-selection.test.ts`、`test/install-progress-ready-summary.test.ts`、`test/runtime-structure.test.ts` 和 `test/fixtures/fresh-install-empty-project/expected/command-json/fresh-install-success.json`。
- 决策：继续执行 reviewer-only 复审；不触碰源码、Story 文档、sprint 状态或其他 Story 的 CR 目录。

### Attempt 2（Reviewer 三层复审与验证）

- 方案：由于当前工具上下文没有 Agent 子代理工具，按 skill fallback 在当前模型中串行执行 Blind Hunter、Edge Case Hunter、Acceptance Auditor 三层视角审查，并运行模板要求的验证命令。
- 原因：skill 允许 Agent 不可用时降级为串行审查；用户要求避免挂起并采用默认推荐决策。
- 结果：未发现新的阻塞项、中高优先级问题或需要进入 fixer 的 patch finding。验证通过：`npm test` 20 个 test files / 118 tests 通过；`npm run build` 通过；`npx vitest run test/install-progress-ready-summary.test.ts test/runtime-structure.test.ts test/install-module-selection.test.ts test/cli-smoke.test.ts` 4 个 test files / 32 tests 通过；`git diff --check` 无输出。
- 决策：生成 `_bmad-output/implementation-artifacts/code-reviews/1-6-code-review/1-6-code-review-summary-20260528-round-2.md`；本轮到 reviewer 结束，不进入 evaluator/fixer/finalizer。

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
