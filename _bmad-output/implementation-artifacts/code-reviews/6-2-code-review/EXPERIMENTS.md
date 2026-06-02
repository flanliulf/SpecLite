# EXPERIMENTS.md

## Attempt 1（尝试 1）：当前状态审计与流程初始化

- 时间：2026-06-02
- 方案：在 Story 6.1 完成后，读取 Story 6.2 文件和 `sprint-status.yaml` 状态，创建 Story 6.2 的进度文件。
- 选择原因：用户要求 Epic 6 每个 Story 依次执行 strict serial；进入新 Story 前必须先确认状态和范围。
- 结果：
  - Story 6.2 文件存在，当前 `Status: ready-for-dev`。
  - `sprint-status.yaml` 显示 Story 6.2 为 `ready-for-dev`。
  - 已创建 `6-2-code-review/PLAN.md`、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md`。
- 下一步：派发 fresh sub-agent 执行 `/bmad-dev-story story 6-2`。

## Attempt 2（尝试 2）：执行 dev-story

- 时间：2026-06-02
- 方案：启动 fresh worker sub-agent，附带 `bmad-dev-story` skill，要求执行 `/bmad-dev-story story 6-2`，只负责 Story 6.2 开发，不执行 CR 或提交。
- 选择原因：Story 6.2 处于 `ready-for-dev`，必须先完成开发并进入 `review`。
- 结果：
  - sub-agent `019e844b-3d2f-7de1-ad0d-ce45e25d00a3` 已完成并关闭。
  - 实际修改文件：`src/update/update-plan.ts`、`src/commands/update.ts`、`test/fixture-release-gates.test.ts`、`test/update-planning.test.ts`、`test/fixtures/fresh-install-empty-project/**`、`test/fixtures/existing-install-update/**`、Story 6.2 文件、`sprint-status.yaml`。
  - Story 6.2 状态进入 `review`；`sprint-status.yaml` 中 Story 6.2 也进入 `review`。
  - 完成内容：fresh install release gate fixture、existing install normal update fixture、ReadyCheck gate、protected human/workflow-owned update 行为、repair handoff。
  - 验证报告：fixture release gate tests 4 passed；focused tests 46 passed；`npm run build` 通过；`npm test` 36 files / 270 tests passed；`git diff --check` 通过。
  - 无 HALT，无新增依赖。
- 下一步：启动 fresh sub-agent 执行 `/bmenhance-cr-01-reviewer 6-2`。

## Attempt 3（尝试 3）：执行 CR reviewer round 1

- 时间：2026-06-02
- 方案：启动 fresh worker sub-agent，附带 `bmenhance-cr-01-reviewer` skill，执行 `/bmenhance-cr-01-reviewer 6-2`。
- 选择原因：dev-story 已将 Story 6.2 推到 `review`，按流程必须先由 reviewer 生成审查结果。
- 结果：
  - sub-agent `019e8458-8b0b-7220-9980-74045301d047` 已完成并关闭。
  - 生成文件：`6-2-code-review-summary-20260602-round-1.md`。
  - reviewer 结论：不通过。
  - blocking findings：
    - Normal update apply 后未同步 installed-state / files-index projection，下一次普通 update 可能误判为 `installer-owned-drift`。
    - Existing update conflict failure 缺少 AC8 要求的 completed / failed / pending step state，且 conflict expected JSON summary 错误宣称已应用更新。
  - non-blocking findings：无。
  - reviewer 验证：`npm test` 270 / 270，通过；定向 3 个相关 Vitest 文件 32 / 32，通过；未执行 build，避免只读 review 写 `dist/`。
- 下一步：启动 fresh sub-agent 执行 `/bmenhance-cr-02-evaluator 6-2`。

## Attempt 4（尝试 4）：执行 CR evaluator round 1

- 时间：2026-06-02
- 方案：启动 fresh worker sub-agent，附带 `bmenhance-cr-02-evaluator` skill，执行 `/bmenhance-cr-02-evaluator 6-2`。
- 选择原因：reviewer round 1 未通过，必须先由 evaluator 独立判断发现是否有效，再进入 fixer。
- 结果：
  - sub-agent `019e845c-fbbb-7f62-b0b7-f1cf9f4633e0` 已完成并关闭。
  - 生成文件：`6-2-code-review-evaluation-20260602-round-1.md`。
  - evaluator 结论：Not Approved / 不通过。
  - 必须修复：
    - P1：Normal update apply 后未同步 installed-state / files-index projection。
    - P1：Existing update conflict failure 缺少 AC8 step state，且 conflict expected JSON summary 错误宣称已应用更新。
  - 可忽略 / 可 defer：无。
- 下一步：启动 fresh sub-agent 执行 `/bmenhance-cr-03-fixer 6-2`。

## Attempt 5（尝试 5）：执行 CR fixer round 1

- 时间：2026-06-02
- 方案：启动 fresh worker sub-agent，附带 `bmenhance-cr-03-fixer` skill，执行 `/bmenhance-cr-03-fixer 6-2`。
- 选择原因：evaluator round 1 明确确认 2 个 P1 必修项；按用户要求采用推荐决策并记录，不等待额外确认。
- 结果：
  - sub-agent `019e8460-2e0e-7900-8201-74d72d7c0678` 已完成并关闭。
  - 修改文件：`src/update/update-plan.ts`、`src/commands/update.ts`、`src/diagnostics/command-result-schema.ts`、`src/diagnostics/command-result.ts`、`src/diagnostics/output.ts`、`test/update-planning.test.ts`、`test/fixture-release-gates.test.ts`、`test/fixtures/existing-install-update/expected/command-json/normal-update-success.json`、`test/fixtures/existing-install-update/expected/command-json/installer-owned-drift-conflict.json`、`6-2-code-review-evaluation-20260602-round-1.md`。
  - 修复 #1：normal update apply 成功后安全写回 `_speclite/_config/files-index.json`，更新已应用 installer-owned `create/update` 的 files-index hash；增加 `update --yes` 后立即再跑普通 `update` 的回归测试。
  - 修复 #2：update conflict failure 在 command data 与 `update.conflicts.details` 中包含 completed / failed / pending step state 与 manual action，human output 增加 `Step State`，conflict summary 改为未 apply 的失败语义。
  - 验证报告：fixture release gates + update planning 24 tests passed；update command 8 tests passed；`npm run build` 通过；`npm test` 36 files / 270 tests passed；相关文件 `git diff --check` 通过。
- 下一步：启动 fresh sub-agent 执行 `/bmenhance-cr-01-reviewer 6-2` round 2。

## Attempt 6（尝试 6）：执行 CR reviewer round 2

- 时间：2026-06-02
- 方案：启动 fresh worker sub-agent，附带 `bmenhance-cr-01-reviewer` skill，执行 `/bmenhance-cr-01-reviewer 6-2` 复审。
- 选择原因：fixer round 1 已修复 P1，必须重新 review 确认问题是否消除且没有新增 blocking。
- 结果：
  - sub-agent `019e8466-c4ae-7be3-a608-e733800474eb` 已完成并关闭。
  - 生成文件：`6-2-code-review-summary-20260602-round-2.md`。
  - reviewer 结论：通过。
  - blocking findings：无。
  - non-blocking findings：无。
  - 验证报告：`npx vitest run test/fixture-release-gates.test.ts test/update-planning.test.ts test/update-command.test.ts` 3 files / 32 tests passed；`npm test` 36 files / 270 tests passed。
- 下一步：启动 fresh sub-agent 执行 `/bmenhance-cr-02-evaluator 6-2` round 2。

## Attempt 7（尝试 7）：执行 CR evaluator round 2

- 时间：2026-06-02
- 方案：启动 fresh worker sub-agent，附带 `bmenhance-cr-02-evaluator` skill，执行 `/bmenhance-cr-02-evaluator 6-2` 评估 round 2 review。
- 选择原因：reviewer round 2 已通过；必须由 evaluator 也 Approved 后才能进入 rules/todo/finalizer。
- 结果：
  - sub-agent `019e8469-cae1-7e51-bc80-a49619f56ba1` 已完成并关闭。
  - 生成文件：`6-2-code-review-evaluation-20260602-round-2.md`。
  - evaluator 结论：Approved / 通过。
  - 需要修复项：无。
  - non-blocking / CR TODO：无。
- 下一步：启动第五个 fresh sub-agent，依次执行 `bmenhance-cr-04-rules-extractor`、`bmenhance-cr-05-todo-tracker`、`bmenhance-cr-06-finalizer`。

## Attempt 8（尝试 8）：执行 rules / TODO / finalizer

- 时间：2026-06-02
- 方案：启动第五个 fresh worker sub-agent，附带 `bmenhance-cr-04-rules-extractor`、`bmenhance-cr-05-todo-tracker`、`bmenhance-cr-06-finalizer` 三个 skill，并要求严格按 `cr-04 -> cr-05 -> cr-06` 顺序执行。
- 选择原因：reviewer round 2 与 evaluator round 2 均已通过，满足收尾前置条件。
- 结果：
  - sub-agent `019e846c-9ad5-7ad1-81d6-cc366b2db8be` 已完成并关闭。
  - `cr-04`：2 条 story-scoped 规则写入 `cr-rules-summary.md`：`CR-API-28`、`CR-API-29`；未修改 project-context / architecture / AGENTS 等全局文档。
  - `cr-05`：未新增 TODO，latest evaluation 明确无 non-blocking / defer / CR TODO。
  - `cr-06`：验证 latest evaluator round 2 为 Approved 后，将 Story 6.2 与 `sprint-status.yaml` 同步为 `done`。
  - Epic 6 未更新为 done，因为 6.3-6.5 仍是 `ready-for-dev`。
  - `_bmad-output` 下没有 `bmm-workflow-status.yaml`，finalizer 按容错规则跳过。
  - 验证：针对本次触及文件 `git diff --check --` 通过。
- 终态：Story 6.2 完成。下一步进入 Story 6.3。
