# PLAN（计划）

## 2026-05-28 CR Approved Closeout Plan（CR 通过后收尾计划）

- 本轮目标：作为 Story 1-6 CR 通过后收尾 sub-agent，严格串行执行 `bmenhance-cr-04-rules-extractor` -> `bmenhance-cr-05-todo-tracker` -> `bmenhance-cr-06-finalizer`。
- 范围边界：只处理 Story 1-6，不处理其他 Story；不修改源码、测试或无关 Story；不回滚或清理当前工作区已有改动。
- 目标 Story：`_bmad-output/implementation-artifacts/stories/1-6-install-progress-and-ready-summary.md`。
- Code Review 目录：`_bmad-output/implementation-artifacts/code-reviews/1-6-code-review/`。
- 最新 reviewer：`1-6-code-review-summary-20260528-round-2.md`，结论通过，findings 0。
- 最新 evaluator：`1-6-code-review-evaluation-20260528-round-2.md`，结论 Approved / 通过，Fix Items 0，CR TODO 0。
- 默认决策：遇到可默认处理的决策时采用 skill 默认推荐；若无候选规则或 TODO，则只记录 no-op 结果，不创建空规则或 TODO 条目。
- Epic 决策边界：finalizer 可将 Story 1-6 与必要 workflow/status 文件同步为 `done`；Epic 主状态仅在 finalizer skill 明确允许且满足默认推荐规则时处理，否则不擅自更新。

## 2026-05-28 Evaluator Round 2 Plan（第 2 轮评估计划）

- 本轮目标：严格执行 `/bmenhance-cr-02-evaluator 1-6`，评估最新 reviewer 输出。
- 范围边界：只处理 Story 1-6 最新 review，不执行 fixer/finalizer，不主动修改源码、测试、Story 文档或 sprint 状态。
- 目标 Story：`_bmad-output/implementation-artifacts/stories/1-6-install-progress-and-ready-summary.md`。
- 被评估 review：`_bmad-output/implementation-artifacts/code-reviews/1-6-code-review/1-6-code-review-summary-20260528-round-2.md`。
- 当前评估轮次：已有 `1-6-code-review-evaluation-20260527-round-1.md`，本轮生成 evaluation round 2。
- 执行方式：按 evaluator skill 独立复核 reviewer pass / findings 0 是否成立，基于真实代码、测试和 fixture 证据判断是否遗漏阻塞项、是否需要 fixer。
- 默认决策：如未发现 reviewer 遗漏，则生成 Approved / 通过 evaluation，并明确不需要 fixer；不继续执行任何修复或收尾 skill。

## 2026-05-28 Reviewer-Only Re-Review Plan（仅 Reviewer 复审计划）

- 本轮目标：严格执行 `/bmenhance-cr-01-reviewer 1-6`，复审 reopened corrective dev verification 后的 Story 1-6。
- 范围边界：只评估 Story 1-6 相关实现影响；不重新开发，不执行 evaluator / fixer / finalizer，不回滚或清理当前工作区中的前序 Story 1-3 / 1-5 CR 修复和收尾改动。
- 目标 Story：`_bmad-output/implementation-artifacts/stories/1-6-install-progress-and-ready-summary.md`。
- Code Review 目录：`_bmad-output/implementation-artifacts/code-reviews/1-6-code-review/`。
- 当前轮次：已有 `1-6-code-review-summary-20260527-round-1.md`，本轮 reviewer summary 为 round 2。
- 执行方式：当前工具上下文没有 Agent 子代理工具，因此按 skill fallback 在当前模型中串行完成 Blind Hunter / Edge Case Hunter / Acceptance Auditor 三层视角审查。
- 默认决策：如无阻塞发现，则生成 reviewer summary 并停止；不自动进入 evaluator/fixer。

## Corrective CR Reopen Plan（校正复审计划）

> Historical note（历史说明）：以下为前序闭环计划记录。本轮 2026-05-28 用户指令以 Reviewer-Only Re-Review Plan 为准，只执行 `/bmenhance-cr-01-reviewer 1-6`，不进入 evaluator/fixer/finalizer。

- 本轮目标：针对 reopened Story 1-6 的新增 AC / corrective tasks 做正式 CR 闭环，不重新开发 Epic 1/2。
- 当前 sprint 状态：`review`；因此按用户规则跳过 `/bmad-dev-story story 1-6`。
- 执行顺序：`/bmenhance-cr-01-reviewer 1-6` -> `/bmenhance-cr-02-evaluator 1-6` -> `/bmenhance-cr-03-fixer 1-6`，直到 reviewer 与 evaluator 均通过。
- 通过后执行：`bmenhance-cr-04-rules-extractor` -> `bmenhance-cr-05-todo-tracker` -> `bmenhance-cr-06-finalizer`。
- 所有步骤使用全新 sub-agent、模型 `gpt-5.5`、严格串行，不并行。

## Story（故事）

- Story ID：`1-6`
- Story 文件：`_bmad-output/implementation-artifacts/stories/1-6-install-progress-and-ready-summary.md`
- Code Review 目录：`_bmad-output/implementation-artifacts/code-reviews/1-6-code-review/`
- 当前目标：按用户本次要求完成 CR 通过后收尾：04 rules-extractor、05 todo-tracker、06 finalizer。

## Execution Plan（执行计划）

1. 使用全新的 sub-agent（`gpt-5.5`）执行 `/bmad-dev-story story 1-6`，限定其开发 install progress lifecycle、`ReadyCheck`、ready summary、failure no-ready-summary gate 与对应测试。
2. 使用全新的 sub-agent（`gpt-5.5`）执行 `/bmenhance-cr-01-reviewer 1-6`，生成代码审查结果。
3. 使用全新的 sub-agent（`gpt-5.5`）执行 `/bmenhance-cr-02-evaluator 1-6`，评估最新审查结果。
4. 使用全新的 sub-agent（`gpt-5.5`）执行 `/bmenhance-cr-03-fixer 1-6`；如评估无修复项，则执行 0 修复项收口并不得修改源码。
5. 若 reviewer 或 evaluator 未通过，则重复 reviewer -> evaluator -> fixer，直到两者均通过。
6. 通过后，使用第五个全新的 sub-agent（`gpt-5.5`）依次执行 `bmenhance-cr-04-rules-extractor`、`bmenhance-cr-05-todo-tracker`、`bmenhance-cr-06-finalizer`，采用默认推荐决策并记录。
7. Story 1-6 完成后进行全局验证，并使用 `git-commit-convention` 以 `gpt-5.4` 本地提交，不推送。

## Constraints（约束）

- 所有 skill 步骤必须严格串行，任何 sub-agent 完成前不得启动下一步。
- 每个用户要求的 skill 调用必须使用新的 sub-agent。
- 只允许开发 Story 1-6 明确要求的范围，不实现 Epic 2、Post-MVP commands、remote source refresh、full validate/hash scan 或 branded Copilot/Cursor readiness。
- Story 1.1 至 1.5 是前置实现；不得在 Story 1.6 中重建前序流程、绕过 confirmation gates、重新写 runtime structure、复制 IDE mirrors 或重新生成 manifest/index。
- 修复只允许根据评估文件中的明确结论执行，不主动扩大范围。
- 不回滚或清理用户已有未提交变更，除非后续得到明确授权。
