# Story 6.6 严格串行执行计划

## 目标

针对 `6-6-fixture-contract-hardening` 完成开发、代码审查、评估、修复、复审循环、规则提取、TODO 跟踪和 finalizer 收尾。

## 串行步骤

1. 使用全新 sub agent 执行 `/bmad-dev-story story 6-6-fixture-contract-hardening`，模型按用户要求记录为 GPT-5.5。
2. 开发完成后，使用全新 sub agent 执行 `/bmenhance-cr-01-reviewer 6-6-fixture-contract-hardening`。
3. Reviewer 完成后，使用全新 sub agent 执行 `/bmenhance-cr-02-evaluator 6-6-fixture-contract-hardening`。
4. Evaluator 完成后，使用全新 sub agent 执行 `/bmenhance-cr-03-fixer 6-6-fixture-contract-hardening`。
5. 重复步骤 2-4，直到 reviewer 结论通过且 evaluator 评估通过。
6. 通过后，按顺序执行 `bmenhance-cr-04-rules-extractor`、`bmenhance-cr-05-todo-tracker`、`bmenhance-cr-06-finalizer`。
7. 进入 Story 6.7，重复同一严格串行流程。

## 决策原则

- 所有步骤等待前一步完成后再启动，禁止并行。
- 如需决策，优先选择保守、证据驱动且不扩大范围的方案，并在 `EXPERIMENTS.md` 记录。
- 不回滚或清理无关脏工作树。
- Story 文件只允许 dev/finalizer 更新状态、任务勾选、Dev Agent Record、File List、Change Log。
