# Story 6.8 严格串行执行计划

## 目标

针对 `6-8-test-stability-and-cr-todo-closure` 完成开发、代码审查、评估、修复、复审循环、规则提取、TODO 跟踪和 finalizer 收尾。完成后，若 6.6、6.7、6.8 均为 done，再由 finalizer 或后续审计判断 Epic 6 是否可关闭。

## 串行步骤

1. 使用全新 sub agent 执行 `/bmad-dev-story story 6-8-test-stability-and-cr-todo-closure`，模型按用户要求记录为 GPT-5.5。
2. 开发完成后，使用全新 sub agent 执行 `/bmenhance-cr-01-reviewer 6-8-test-stability-and-cr-todo-closure`。
3. Reviewer 完成后，使用全新 sub agent 执行 `/bmenhance-cr-02-evaluator 6-8-test-stability-and-cr-todo-closure`。
4. Evaluator 完成后，使用全新 sub agent 执行 `/bmenhance-cr-03-fixer 6-8-test-stability-and-cr-todo-closure`。
5. 重复步骤 2-4，直到 reviewer 结论通过且 evaluator 评估通过。
6. 通过后，按顺序执行 `bmenhance-cr-04-rules-extractor`、`bmenhance-cr-05-todo-tracker`、`bmenhance-cr-06-finalizer`。
7. 三个新增 Story 均完成后，执行最终验证和本地中文 git commit。

## 决策原则

- 所有步骤等待前一步完成后再启动，禁止并行。
- Story 6.8 负责 `TODO-003`、`TODO-004` regression assertion 和最终 backlog reconciliation；不得回改 6.6/6.7 已关闭事项，除非证据显示 bookkeeping 错误。
- 如需决策，优先选择保守、证据驱动且不扩大范围的方案，并在 `EXPERIMENTS.md` 记录。
- 不回滚或清理无关脏工作树，保留 6.6/6.7 已完成改动。
