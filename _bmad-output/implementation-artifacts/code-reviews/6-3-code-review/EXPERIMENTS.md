# EXPERIMENTS.md

## Attempt 1（尝试 1）：当前状态审计与流程初始化

- 时间：2026-06-02
- 方案：在 Story 6.2 完成后，读取 Story 6.3 文件和 `sprint-status.yaml` 状态，创建 Story 6.3 的进度文件。
- 选择原因：用户要求 Epic 6 每个 Story 依次执行 strict serial；进入新 Story 前必须先确认状态和范围。
- 结果：
  - Story 6.3 文件存在，当前 `Status: ready-for-dev`。
  - `sprint-status.yaml` 显示 Story 6.3 为 `ready-for-dev`。
  - 已创建 `6-3-code-review/PLAN.md`、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md`。
- 下一步：派发 fresh sub-agent 执行 `/bmad-dev-story story 6-3`。

## Attempt 2（尝试 2）：执行 dev-story

- 时间：2026-06-02
- 方案：启动 fresh worker sub-agent，附带 `bmad-dev-story` skill，要求执行 `/bmad-dev-story story 6-3`，只负责 Story 6.3 开发，不执行 CR 或提交。
- 选择原因：Story 6.3 处于 `ready-for-dev`，必须先完成开发并进入 `review`。
- 结果：
  - sub-agent `019e8471-6b0c-7a41-8c0c-cc73191b0dd2` 已完成并关闭。
  - 实际修改范围：Story 6.3 文件、`sprint-status.yaml`、`src/validation/rules/ide-mirror.ts`、`src/diagnostics/output.ts`、`test/fixture-contract.test.ts`、`test/fixture-release-gates.test.ts`、`test/fixtures/ide-drift/`、`test/fixtures/source-integrity/` 10 个 sub-cases、`test/fixtures/resolve-parity/`。
  - Story 6.3 状态进入 `review`；`sprint-status.yaml` 中 Story 6.3 也进入 `review`。
  - 完成内容：`ide-drift` validate-only release gate、`source-integrity` 10 个独立 sub-case、`resolve-parity` config/customization expected stdout/stderr、repair handoff 保持不实现 execution fixture。
  - 验证报告：`npm run build` 通过；`npm test` 36 files / 274 tests passed；`git diff --check` 通过；额外 focused regression 11 files / 116 tests passed。
  - 无 HALT，无新增依赖。
- 下一步：启动 fresh sub-agent 执行 `/bmenhance-cr-01-reviewer 6-3`。

## Attempt 3（尝试 3）：执行 CR reviewer round 1

- 时间：2026-06-02
- 方案：启动 fresh worker sub-agent，附带 `bmenhance-cr-01-reviewer` skill，执行 `/bmenhance-cr-01-reviewer 6-3`。
- 选择原因：dev-story 已将 Story 6.3 推到 `review`，按流程必须先由 reviewer 生成审查结果。
- 结果：
  - sub-agent `019e847e-65a8-7da0-8bed-8e00cb54c74a` 已完成并关闭。
  - 生成文件：`6-3-code-review-summary-20260602-round-1.md`。
  - reviewer 结论：不通过。
  - blocking findings：`resolve-parity` required config layer failure fixture 把 `_speclite/config.toml` 的 `details.layerRole` 写成 `optional-config`，但 SPEC 和 runtime implementation 要求 `required-config`。
  - non-blocking findings：无。
  - reviewer 验证：`npm run build` 通过；`npm test` 36 files / 274 tests passed；聚焦测试 5 files / 47 tests passed；无 `lint` script。
- 下一步：启动 fresh sub-agent 执行 `/bmenhance-cr-02-evaluator 6-3`。

## Attempt 4（尝试 4）：执行 CR evaluator round 1

- 时间：2026-06-02
- 方案：启动 fresh worker sub-agent，附带 `bmenhance-cr-02-evaluator` skill，执行 `/bmenhance-cr-02-evaluator 6-3`。
- 选择原因：reviewer round 1 未通过，必须先由 evaluator 独立判断发现是否有效，再进入 fixer。
- 结果：
  - sub-agent `019e8482-bb4b-79e2-9192-6642799d685b` 已完成并关闭。
  - 生成文件：`6-3-code-review-evaluation-20260602-round-1.md`。
  - evaluator 结论：Not Approved / 不通过。
  - 必须修复：`resolve-parity` required config layer failure fixture 标错 `details.layerRole`，应为 `required-config`，当前 fixture 写成 `optional-config`。
  - 修复方向：修改 expected fixture，并补充/调整测试锁定 live stderr 与 fixture expected JSONL 的语义 parity，或至少断言 `details.layerRole === "required-config"`。
  - 可忽略 / 可 defer：无。
- 下一步：启动 fresh sub-agent 执行 `/bmenhance-cr-03-fixer 6-3`。

## Attempt 5（尝试 5）：执行 CR fixer round 1

- 时间：2026-06-02
- 方案：启动 fresh worker sub-agent，附带 `bmenhance-cr-03-fixer` skill，执行 `/bmenhance-cr-03-fixer 6-3`。
- 选择原因：evaluator round 1 明确确认 1 个 P1 必修项；按用户要求采用推荐决策并记录，不等待额外确认。
- 结果：
  - sub-agent `019e8484-de05-79d2-aa0d-581ce1d00354` 已完成并关闭。
  - 修改文件：`test/fixtures/resolve-parity/expected/config/required-layer-error.jsonl`、`test/resolve-cli.test.ts`、`6-3-code-review-evaluation-20260602-round-1.md`。
  - 修复：将 `_speclite/config.toml` 的 `details.layerRole` 从 `optional-config` 改为 `required-config`；测试读取 `resolve-parity` expected JSONL 并显式锁定 live stderr 与 expected fixture 的 `details.layerRole === "required-config"`。
  - 验证报告：`npm test -- test/resolve-cli.test.ts test/fixture-contract.test.ts` 2 files / 18 tests passed；`npm run build` 通过；`npm test` 36 files / 274 tests passed。
- 下一步：启动 fresh sub-agent 执行 `/bmenhance-cr-01-reviewer 6-3` round 2。

## Attempt 6（尝试 6）：执行 CR reviewer round 2

- 时间：2026-06-02
- 方案：启动 fresh worker sub-agent，附带 `bmenhance-cr-01-reviewer` skill，执行 `/bmenhance-cr-01-reviewer 6-3` 复审。
- 选择原因：fixer round 1 已修复 P1，必须重新 review 确认问题是否消除且没有新增 blocking。
- 结果：
  - sub-agent `019e8487-aeec-7551-9a60-3f7c31d433ff` 已完成并关闭。
  - 生成文件：`6-3-code-review-summary-20260602-round-2.md`。
  - reviewer 结论：通过。
  - blocking findings：无。
  - non-blocking findings：无。
  - 验证报告：`npm test -- test/resolve-cli.test.ts test/fixture-contract.test.ts` 2 files / 18 tests passed；`npm test -- test/fixture-release-gates.test.ts` 1 file / 5 tests passed。
- 下一步：启动 fresh sub-agent 执行 `/bmenhance-cr-02-evaluator 6-3` round 2。

## Attempt 7（尝试 7）：执行 CR evaluator round 2

- 时间：2026-06-02
- 方案：启动 fresh worker sub-agent，附带 `bmenhance-cr-02-evaluator` skill，执行 `/bmenhance-cr-02-evaluator 6-3` 评估 round 2 review。
- 选择原因：reviewer round 2 已通过；必须由 evaluator 也 Approved 后才能进入 rules/todo/finalizer。
- 结果：
  - sub-agent `019e848a-bb68-71a1-9f6b-8625254ad178` 已完成并关闭。
  - 生成文件：`6-3-code-review-evaluation-20260602-round-2.md`。
  - evaluator 结论：Approved / 通过。
  - 需要修复项：无。
  - non-blocking / CR TODO：无。
- 下一步：启动第五个 fresh sub-agent，依次执行 `bmenhance-cr-04-rules-extractor`、`bmenhance-cr-05-todo-tracker`、`bmenhance-cr-06-finalizer`。

## Attempt 8（尝试 8）：执行 rules / TODO / finalizer

- 时间：2026-06-02
- 方案：启动第五个 fresh worker sub-agent，附带 `bmenhance-cr-04-rules-extractor`、`bmenhance-cr-05-todo-tracker`、`bmenhance-cr-06-finalizer` 三个 skill，并要求严格按 `cr-04 -> cr-05 -> cr-06` 顺序执行。
- 选择原因：reviewer round 2 与 evaluator round 2 均已通过，满足收尾前置条件。
- 结果：
  - sub-agent `019e848d-9665-72c3-aeea-f8eacc300159` 已完成并关闭。
  - `cr-04`：完成规则提炼分析；唯一候选已有 owning SPEC / PRD / CR rules 覆盖，判定为 analysis-only，未写 `cr-rules-summary.md`，未改全局文档。
  - `cr-05`：未新增 TODO，latest evaluation 明确无 non-blocking / defer / CR TODO。
  - `cr-06`：验证 latest evaluator round 2 为 Approved 后，将 Story 6.3 与 `sprint-status.yaml` 同步为 `done`。
  - Epic 6 未更新为 done，因为 6.4-6.5 仍是 `ready-for-dev`。
  - `_bmad-output` 下没有 `bmm-workflow-status.yaml`，finalizer 按容错规则跳过。
  - 验证：针对本次触及文件 `git diff --check --` 通过。
- 终态：Story 6.3 完成。下一步进入 Story 6.4。
