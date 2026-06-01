# Story 5.1 开发与 CR 闭环计划

更新时间：2026-06-01 15:19 CST

## Scope（范围）

- 目标 Story：`5-1-source-selection-and-channel-summary`。
- 触发形式：`/bmad-dev-story story 5-1`，随后按 `/bmenhance-cr-01-reviewer 5-1`、`/bmenhance-cr-02-evaluator 5-1`、`/bmenhance-cr-03-fixer 5-1` 循环，直到 reviewer 和 evaluator 均通过。
- CR 通过后严格依次执行 `bmenhance-cr-04-rules-extractor`、`bmenhance-cr-05-todo-tracker`、`bmenhance-cr-06-finalizer`。
- 每个步骤使用全新的 GPT-5.5 sub agent；任何步骤都必须等待前一步完成后再启动。
- 允许修改范围由对应 skill 和 Story 5.1 决定；保留当前工作树已有无关 dirty / untracked 文件，不回滚、不清理、不格式化无关范围。

## Current Plan（当前计划）

1. 已完成：读取相关 skill 定义、SpecLite 串行 CR 记忆、`sprint-status.yaml` 和 Story 5.1 全文。
2. 已完成：确认 Epic 5 当前有 5 个 `ready-for-dev` Story，Story 5.1 是本轮第一个 Story。
3. 已完成：创建本目录并初始化 `PLAN.md`、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md`。
4. 已完成：fresh sub agent 执行 `/bmad-dev-story story 5-1`。
5. 已完成：按 `bmad-dev-story` Step 1-4 完成 context load、fresh implementation 判断，并把 `sprint-status.yaml` 中 Story 5.1 从 `ready-for-dev` 更新为 `in-progress`。
6. 已完成：实现 source selection model、external access intent、custom unsupported source diagnostic、human output Source / External Access / Authorization profile 和 focused fixture assertions。
7. 已完成：`npm run build`、`npm test`、`git diff --check` 均通过；Story 文件与 `sprint-status.yaml` 更新为 `review`。
8. 已完成：第 2 个 fresh sub agent 启动 `/bmenhance-cr-01-reviewer 5-1`，确认本轮为首轮 CR。
9. 已完成：按 Blind Hunter、Edge Case Hunter、Acceptance Auditor 三层审查 Story 5.1 dev-story 改动；当前环境无 Agent 工具，降级为当前上下文串行审查并记录。
10. 已完成：写入 `5-1-code-review-summary-20260601-round-1.md`；本步骤不启动 evaluator/fixer/rules/todo/finalizer，不 commit/push。
11. 已完成：第 3 个 fresh sub agent 执行 `/bmenhance-cr-02-evaluator 5-1`，评估 reviewer 唯一 finding。
12. 已完成：第 4 个 fresh sub agent 执行 `/bmenhance-cr-03-fixer 5-1`，只修复 P1 npm source value redaction。
13. 已完成：`sanitizePackageLabel()` 对 npm source value 增加 secret-like key、query string、fragment 与 strict npm package-name label 检查；不满足 display-safe 条件时返回 `redacted-npm-package`。
14. 已完成：新增 focused regression，覆盖 `sourceType: "npm"` / `sourceValue: "@scope/pkg?token=secret"` 的 selection、`SourceResolutionPlan.externalAccesses[]`、install JSON 与 human output。
15. 已完成：第 5 个 fresh sub agent 执行 `/bmenhance-cr-01-reviewer 5-1` Round 2 复审；当前环境无 Agent 工具，按 reviewer skill 降级为单一 LLM 串行复审。
16. 已完成：确认 Round 1 唯一 blocker 已修复，`npm` source value `@scope/pkg?token=secret` 在 selection、`SourceResolutionPlan.externalAccesses[]`、install JSON 和 human output 中均投影为 `redacted-npm-package`。
17. 已完成：运行 focused regression、全量测试、build 到 `/private/tmp`、`git diff --check` 和定向泄露复核；Round 2 reviewer 结论通过。
18. 已完成：第 6 个 fresh sub agent 执行 `/bmenhance-cr-02-evaluator 5-1`，评估最新 Round 2 review 文件。
19. 已完成：确认 Round 2 reviewer 的通过结论成立；Round 1 blocker 已修复，未发现新增 blocker、CR TODO 或待讨论项。
20. 已完成：第 5 个 fresh sub agent 按用户指定执行 `/bmenhance-cr-04-rules-extractor 5-1`；先 analysis-only 分析 CR 历史，再按本次授权默认推荐决策 record-only 落地。
21. 已完成：04 确认 Round 1 唯一 P1 redaction blocker 已修复、Round 2 reviewer/evaluator 均通过、CR TODO 0。
22. 已完成：04 将 `CR-SEC-14` 追加到 `cr-rules-summary.md`；不修改全局文档、architecture、AGENTS/CLAUDE 或源码。
23. 已完成：严格执行 `/bmenhance-cr-05-todo-tracker 5-1`；Round 2 evaluator 明确 CR TODO 0，backlog 中也无 Story 5.1/source redaction 匹配项，因此不新增、不更新 `cr-todo-backlog.md`。
24. 已完成：严格执行 `/bmenhance-cr-06-finalizer 5-1`；确认最新 Round 2 evaluation 通过后，将 Story 5.1 与 `sprint-status.yaml` 置为 `done`。
25. 已完成：`bmm-workflow-status.yaml` 不存在，按 finalizer 容错跳过且未创建；Epic 5 仍有 Story 5.2-5.5 未完成，因此不把 `epic-5` 置为 `done`。

## Decisions（决策记录）

- 采用保守默认：`sprint-status.yaml` 是状态真相源；Story 文件与 Epic 定义用于交叉验证范围。
- 当前工作树已有大量非本任务改动；本流程不会使用 `git add -A`，提交阶段只按相关 Story 分组白名单添加。
- 如果 reviewer/evaluator 给出明确推荐修法，默认执行推荐并记录；除非涉及越界修改或需求不清，才停止询问。
- `bmenhance-cr-04-rules-extractor` 默认先按 analysis-only 分析；本次用户要求根据结果默认决策执行，因此只有在结果明确建议 record/apply 且不需要额外业务确认时才落地，否则记录“不落地/交给 05”的保守决策。
- `bmenhance-cr-05-todo-tracker` 只处理非阻塞项；blocking 问题必须回到 fixer/reviewer/evaluator 循环。
- 本轮 dev-story 只推进 Story 5.1；不启动 reviewer/evaluator/fixer/rules/todo/finalizer，不 commit/push。
- Story 5.1 保持边界：未实现 Story 5.2 registry resolution、Story 5.3 tarball/offline/local integrity、Story 5.4 Git pinning、Story 5.5 full trust reporting、Epic 6 full fixture matrix 或 Post-MVP commands。
- 本轮 CR 仅允许写入本目录 `PLAN.md`、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md` 与首轮 review summary；源码和 Story 文档只读。
- 当前执行环境未提供 `Agent` 工具；`bmenhance-cr-01-reviewer` 的三层并行审查降级为同一上下文中的三层串行审查，结果文件中必须显式标注。
- 本轮 evaluator 只评估 `5-1-code-review-summary-20260601-round-1.md` 的唯一 finding；源码和 Story 文档只读，不执行 fixer/reviewer/rules/todo/finalizer，不 commit/push。
- Evaluator 结论：reviewer finding 有效，`npm` source value 中 `?token=secret` 会进入 public JSON `data.sourceDescriptor.resolvedRoot` 与 human output `resolvedRoot/sourceValue`，违反 Story 5.1 redaction/display-safe 要求；需要 fixer。
- 本轮 fixer 采用 evaluator 推荐的集中修法：在 `sanitizePackageLabel()` 统一处理 npm package display-safe label，避免扩大到 Story 5.2 registry deep resolution 或 Story 5.3-5.5 后续 source integrity/trust 范围。
- 本轮 fixer 不改变 bundled source 成功路径；验证中 bundled source summary 相关测试继续通过。
- 本轮 Round 2 reviewer 结论：通过；未发现新的 `decision_needed`、`patch`、`defer` 或 `dismiss` findings。后续只需要 evaluator 复核，无需 fixer 循环，除非 evaluator 提出新问题。
- 本轮 Round 2 evaluator 结论：通过；确认 `@scope/pkg?token=secret` 已在 selection、`SourceResolutionPlan.externalAccesses[]`、install JSON 和 human output 中 redacted，`npx tsc --noEmit` 失败不作为 Story 5.1 当前 blocker。
- 本轮 04 结论：`Source label sanitizer` 规则候选证据明确、已解决、适合 record-only；已有全局 redaction 原则覆盖总体约束，因此不修改全局文档，只追加 `CR-SEC-14` 到 `cr-rules-summary.md`。
- 04 向 05 交接：Round 2 evaluator 明确 CR TODO 0，04 未识别未解决的非阻塞改进项；05 默认应记录“不新增 backlog”。
- 本轮 05 结论：未发现 Story 5.1 非阻塞 TODO 候选；`cr-todo-backlog.md` 保持不变。
- 本轮 06 结论：最新 evaluation 为 Round 2 通过，Story 5.1 从 `review` 更新为 `done`，`sprint-status.yaml` 中 Story 5.1 同步为 `done`；Epic 5 保持 `in-progress`。
