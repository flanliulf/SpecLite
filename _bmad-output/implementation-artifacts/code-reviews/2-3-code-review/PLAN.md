# PLAN

## 2026-05-28 Post-CR Closeout（CR 通过后收尾）

- 本轮目标：作为 Story 2-3 的 CR 通过后收尾 sub-agent，严格串行执行 `bmenhance-cr-04-rules-extractor` -> `bmenhance-cr-05-todo-tracker` -> `bmenhance-cr-06-finalizer`。
- 范围边界：只处理 Story 2-3、`_bmad-output/implementation-artifacts/code-reviews/2-3-code-review/`、Story 2-3 规则/TODO 记录和必要状态文件；不修改源码，不处理其他 Story。
- 默认决策：用户要求如需决策则采用默认推荐并记录，避免挂起；本轮默认采用 record-only / no-op backlog / finalizer status sync。
- 04 计划：读取 Story 2-3 全部 CR summary/evaluation，重点分析 round 4 通过、0 findings、Fix Items 0 是否产生新增规则或只需补记既有规则证据。
- 05 计划：从 Story 2-3 CR 文件批量检查非阻塞延迟项；若没有候选项，不新增 backlog 条目。
- 06 计划：验证最新 evaluator round 4 已通过，将 Story 2-3 和 `sprint-status.yaml` 重新同步为 `done`；`bmm-workflow-status.yaml` 不存在则按 finalizer 容错跳过。
- Epic 决策：finalizer skill 未给出默认 Epic 主状态更新建议；即使 Story 2-1 到 2-5 均为 `done`，本轮不擅自修改 `epic-2` 主状态。

## 2026-05-28 Evaluator Round 4（评估第 4 轮）

- 本轮目标：严格执行 `/bmenhance-cr-02-evaluator 2-3`，只评估最新 reviewer 输出 `2-3-code-review-summary-20260528-round-4.md`。
- 范围边界：不执行 fixer / finalizer，不主动修改源码或 Story 文档；只生成 evaluator round 4 文件，并维护本 CR 目录进度记录。
- 轮次判断：已有 evaluation round 1-3，本轮输出为 `2-3-code-review-evaluation-20260528-round-4.md`。
- 评估重点：验证 reviewer pass / 0 findings 是否成立；复核历史 P1 修复、corrective verification 的 phase coverage 与 full installed inventory 分层、selected package root / IDE mirror readiness gate 是否仍有代码和测试证据。
- 停止条件：evaluator 独立确认通过；如无 P1/P2 修复项，则明确不需要 fixer。

## 2026-05-28 Reviewer Round 4（复审第 4 轮）

- 本轮目标：严格执行 `/bmenhance-cr-01-reviewer 2-3`，仅复审 reopened corrective dev verification 后的 Story 2-3。
- 范围边界：只处理 `_bmad-output/implementation-artifacts/stories/2-3-skill-activation-and-phase-capability-coverage.md` 及 Story 2-3 相关代码/测试影响；不重新开发，不执行 evaluator / fixer / finalizer。
- 轮次判断：`2-3-code-review-summary-20260527-round-1.md` 到 round 3 已存在，本轮 reviewer 输出为 round 4。
- 执行模式：当前工具集中没有 Agent 子代理工具；按 reviewer skill 降级规则由当前模型串行执行 Blind Hunter、Edge Case Hunter、Acceptance Auditor 三个审查视角，并在 summary 中记录降级。
- 复审重点：历史 3 个 P1 修复是否持续有效；corrective verification 是否保持 phase coverage 与 full installed inventory 分层；ReadyCheck 是否阻断 selected package root / IDE mirror partial inventory。
- 停止条件：只生成 reviewer round 4 summary 与本目录进度记录；不推进后续 CR 技能。

## Corrective CR Reopen Plan（校正复审计划）

- 本轮目标：针对 reopened Story 2-3 的新增 AC / corrective tasks 做正式 CR 闭环，不重新开发 Epic 1/2。
- 当前 sprint 状态：`review`；因此按用户规则跳过 `/bmad-dev-story story 2-3`。
- 执行顺序：`/bmenhance-cr-01-reviewer 2-3` -> `/bmenhance-cr-02-evaluator 2-3` -> `/bmenhance-cr-03-fixer 2-3`，直到 reviewer 与 evaluator 均通过。
- 通过后执行：`bmenhance-cr-04-rules-extractor` -> `bmenhance-cr-05-todo-tracker` -> `bmenhance-cr-06-finalizer`。
- 所有步骤使用全新 sub-agent、模型 `gpt-5.5`、严格串行，不并行。

## 目标

针对 Story `2-3-skill-activation-and-phase-capability-coverage` 严格串行执行开发、CR 审查、评估、修复循环、规则提炼、TODO 跟踪、收尾，并在通过后进入下一个 Epic 2 Story。

## 执行约束

- 每一步使用全新的 sub agent。
- 所有步骤严格串行，等待前一步完成后再进入下一步。
- 开发、审查、评估、修复使用 `gpt-5.5`。
- 最终提交使用 `gpt-5.4`，默认中文 commit message，不推送。
- 遇到可决策事项，优先按推荐方案执行，并在记录文件中说明。

## Story 2-3 执行步骤

1. 使用 `/bmad-dev-story story 2-3` 完成 Story 开发，并使 Story 状态进入 `review`。
2. 使用 `/bmenhance-cr-01-reviewer 2-3` 进行第 1 轮 CR。
3. 使用 `/bmenhance-cr-02-evaluator 2-3` 评估第 1 轮 CR。
4. 使用 `/bmenhance-cr-03-fixer 2-3` 修复评估确认的问题。
5. 重复 reviewer -> evaluator -> fixer，直到 reviewer 结论通过且 evaluator 评估通过。
6. 使用 `bmenhance-cr-04-rules-extractor` 提炼 CR 规则，并按推荐默认决策执行可落地事项。
7. 使用 `bmenhance-cr-05-todo-tracker` 处理可延迟 TODO，并按推荐默认决策执行可落地事项。
8. 使用 `bmenhance-cr-06-finalizer` 将 Story 标记为 Done 并同步状态文件。
9. 记录结果后进入 Story `2-4`。

## 历史初始状态（2026-05-27 12:42）

- Story 文件存在：`_bmad-output/implementation-artifacts/stories/2-3-skill-activation-and-phase-capability-coverage.md`。
- `sprint-status.yaml` 中 Story `2-3-skill-activation-and-phase-capability-coverage` 状态为 `ready-for-dev`。
- Story 2.1 与 Story 2.2 已完成并在 `sprint-status.yaml` 中标记为 `done`。
- 当前工作树已有 Story 2.1 / 2.2 开发、CR、文档同步和用户安装依赖产生的未提交/未跟踪改动；后续步骤不得回滚或清理无关改动。
