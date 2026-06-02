# EXPERIMENTS.md

## Attempt 1（尝试 1）：当前状态审计与流程初始化

- 时间：2026-06-02
- 方案：在 Story 6.4 完成后，读取 Story 6.5 文件和 `sprint-status.yaml` 状态，创建 Story 6.5 的进度文件。
- 选择原因：用户要求 Epic 6 每个 Story 依次执行 strict serial；进入最后一个 Story 前必须先确认状态和范围。
- 结果：
  - Story 6.5 文件存在，当前 `Status: ready-for-dev`。
  - `sprint-status.yaml` 显示 Story 6.5 为 `ready-for-dev`。
  - 已创建 `6-5-code-review/PLAN.md`、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md`。
- 下一步：派发 fresh sub-agent 执行 `/bmad-dev-story story 6-5`。

## Attempt 2（尝试 2）：执行 dev-story

- 时间：2026-06-02
- 方案：启动 fresh worker sub-agent，附带 `bmad-dev-story` skill，要求执行 `/bmad-dev-story story 6-5`，只负责 Story 6.5 开发，不执行 CR 或提交。
- 选择原因：Story 6.5 处于 `ready-for-dev`，必须先完成开发并进入 `review`。
- 结果：
  - sub-agent `019e85ec-7d46-73a0-8260-62befed59d5a` 已完成并关闭。
  - 实际修改范围：Story 6.5 文件、`sprint-status.yaml`、`src/validation/rules/artifact-path.ts`、`src/fixtures/fixture-contract.ts`、`scripts/release/packaging-check.mjs`、`test/skill-artifact-loop.test.ts`、`test/artifact-path-validation.test.ts`、`test/story-6-4-path-portability.test.ts`、`test/fixtures/skill-artifact-loop/**`、`assets/source/speclite/docs/examples/fixture-derived-examples.md`、`dist/packaging-manifest.json` 和 build 输出。
  - Story 6.5 状态进入 `review`；`sprint-status.yaml` 中 Story 6.5 也进入 `review`。
  - 完成内容：最小 `skill-artifact-loop` release gate、installed entry discovery、installed `SKILL.md` activation、`speclite resolve` runtime support、deterministic no-LLM artifact write、metadata validation、`generatedAt` normalization、fixture-derived packaged docs example 分类、package inventory 断言。
  - 验证报告：skill artifact loop / artifact-path / Story 6.4 tests 最终 18 passed；加 fixture contract 29 passed；`npm run build` 通过；`npm run release:packaging-check` 通过；`npm test` 37 files / 283 tests passed；`git diff --check` 通过。
  - 风险记录：曾因 build 与 packaging-check 并行执行导致 packaging-check 失败；按顺序在 build 后重跑已通过。
- 下一步：启动 fresh sub-agent 执行 `/bmenhance-cr-01-reviewer 6-5`。

## Attempt 3（尝试 3）：执行 CR reviewer round 1

- 时间：2026-06-02
- 方案：启动 fresh worker sub-agent，附带 `bmenhance-cr-01-reviewer` skill，执行 `/bmenhance-cr-01-reviewer 6-5`。
- 选择原因：dev-story 已将 Story 6.5 推到 `review`，按流程必须先由 reviewer 生成审查结果。
- 结果：
  - sub-agent `019e85f7-e884-7460-b489-f77262e2d18c` 已完成并关闭。
  - 生成文件：`6-5-code-review-summary-20260602-round-1.md`。
  - reviewer 结论：通过。
  - blocking findings：无。
  - non-blocking findings：
    - `release:packaging-check` 依赖 build 已完成，但 package script 未固化顺序，存在并行/clean checkout 下的 release gate 稳健性风险。
    - packaged documentation example 分类断言对空集合会 vacuously pass，当前有测试兜底，不阻塞，但 standalone packaging gate 独立性偏弱。
  - reviewer 验证：`npm test` 37 files / 283 tests passed；`git diff --check` 通过。
- 下一步：启动 fresh sub-agent 执行 `/bmenhance-cr-02-evaluator 6-5`。

## Attempt 4（尝试 4）：执行 CR evaluator round 1

- 时间：2026-06-02
- 方案：启动 fresh worker sub-agent，附带 `bmenhance-cr-02-evaluator` skill，执行 `/bmenhance-cr-02-evaluator 6-5`。
- 选择原因：reviewer round 1 已通过；仍必须由 evaluator 独立确认 review 结果和非阻塞项。
- 结果：
  - sub-agent `019e85fb-d131-74f0-9166-504413efc079` 已完成并关闭。
  - 生成文件：`6-5-code-review-evaluation-20260602-round-1.md`。
  - evaluator 结论：Approved / 通过。
  - 需要当前修复项：无。
  - 可 defer / CR TODO：2 个 P2，分别为 `release:packaging-check` build 前置顺序未固化、packaged documentation example 空集合分类断言会 vacuously pass。
  - 决策：因无 current fix，不启动 no-op fixer；直接进入 rules/todo/finalizer，由 `cr-05` 记录 P2。
- 下一步：启动第五个 fresh sub-agent，依次执行 `bmenhance-cr-04-rules-extractor`、`bmenhance-cr-05-todo-tracker`、`bmenhance-cr-06-finalizer`。

## Attempt 5（尝试 5）：执行 rules / TODO / finalizer 收尾

- 时间：2026-06-02
- 方案：启动第五个 fresh worker sub-agent，按顺序执行 `bmenhance-cr-04-rules-extractor 6-5`、`bmenhance-cr-05-todo-tracker 6-5`、`bmenhance-cr-06-finalizer 6-5`。
- 选择原因：reviewer round 1 与 evaluator round 1 均已通过，且无 current fix；流程必须先提取可复用规则、登记 deferred TODO，再完成 Story 状态收尾。
- 结果：
  - sub-agent `019e85fe-c56c-7c70-954b-095271f5e8fc` 已完成并关闭。
  - `cr-04` 结论：analysis-only；2 个候选均为非阻塞 P2，未写入 `cr-rules-summary.md`，转入 TODO backlog。
  - `cr-05` 新增 `TODO-007`：固化 `release:packaging-check` 的 build 前置顺序。
  - `cr-05` 新增 `TODO-008`：补强 packaged documentation example 空集合断言。
  - `cr-06` 结论：latest evaluator 为 Approved / 通过；Story 6.5 文件状态已同步为 `done`，`sprint-status.yaml` 中 Story 6.5 已同步为 `done`。
  - Epic 6 下 6.1 至 6.5 均为 `done`；但 `epic-6` 主状态保持 `in-progress`。决策原因：finalizer skill 要求 Epic 主状态变更需用户确认，本流程按保守默认不自动更新、不挂起等待。
- 下一步：执行提交前状态核验与 `git-commit-convention` 本地提交。
