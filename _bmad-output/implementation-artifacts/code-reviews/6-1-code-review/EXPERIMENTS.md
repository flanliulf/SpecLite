# EXPERIMENTS.md

## Attempt 1（尝试 1）：当前状态审计与流程初始化

- 时间：2026-06-02
- 方案：先读取 skill 流程、memory 中的 SpecLite strict serial 经验、`sprint-status.yaml`、Story 6.1 文件和 `git status --short`，再创建 Story 6.1 的进度文件。
- 选择原因：用户要求逐 Story 严格串行并维护进度文件；现有工作树很脏，必须先确认权威状态和边界，避免夹带无关改动。
- 结果：
  - `sprint-status.yaml` 显示 Epic 6 为 `in-progress`，Story 6.1-6.5 均为 `ready-for-dev`。
  - 当前没有 `6-*-code-review/` 目录。
  - 工作树存在大量历史 Story、planning docs、skill source 和生成目录脏改；本流程只处理 Story 6.1 相关范围。
  - 已创建 `6-1-code-review/PLAN.md`、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md`。
- 下一步：派发 fresh sub-agent 执行 `/bmad-dev-story story 6-1`，等待完成后再进入 CR reviewer。

## Attempt 2（尝试 2）：执行 dev-story

- 时间：2026-06-02
- 方案：启动 fresh worker sub-agent，附带 `bmad-dev-story` skill，要求执行 `/bmad-dev-story story 6-1`，只负责 Story 6.1 开发，不执行 CR 或提交。
- 选择原因：用户明确要求每一步使用全新的 sub agent，且 dev-story 必须先于 reviewer/evaluator/fixer。
- 结果：
  - sub-agent `019e842c-9289-70c0-9733-c590f537d0f3` 已完成并关闭。
  - 实际修改文件：`src/fixtures/fixture-contract.ts`、`test/fixture-contract.test.ts`、Story 6.1 文件、`sprint-status.yaml`。
  - Story 6.1 状态进入 `review`；`sprint-status.yaml` 中 Story 6.1 也进入 `review`。
  - 验证报告：`npx vitest run test/fixture-contract.test.ts` 最终 8 passed；`npm run build` 通过；focused 5 files / 52 tests passed；`npm test` 35 files / 266 tests passed；`git diff --check -- ...` 通过。
  - 无 HALT，无新增依赖。
- 下一步：启动 fresh sub-agent 执行 `/bmenhance-cr-01-reviewer 6-1`。

## Attempt 3（尝试 3）：执行 CR reviewer round 1

- 时间：2026-06-02
- 方案：启动 fresh worker sub-agent，附带 `bmenhance-cr-01-reviewer` skill，执行 `/bmenhance-cr-01-reviewer 6-1`。
- 选择原因：dev-story 已将 Story 6.1 推到 `review`，按流程必须先由 reviewer 生成审查结果。
- 结果：
  - sub-agent `019e8435-5b40-7c01-8749-afcc05857fa4` 已完成并关闭。
  - 生成文件：`6-1-code-review-summary-20260602-round-1.md`。
  - reviewer 结论：不通过。
  - blocking findings：`compareSemanticJson` key 顺序语义比较问题；`allowedNonStableFields` 过宽可误放行非 timestamp 字段；`FixtureCaseManifestSchema.expectedOutputClass` 未绑定 registry。
  - non-blocking finding：`source-integrity` fixture id 与 release gate registry 分类粒度不一致，当前列为 defer。
  - reviewer 因当前环境没有 skill 期望的 `Agent` 子代理工具，按 skill 降级为串行三层审查。
- 下一步：启动 fresh sub-agent 执行 `/bmenhance-cr-02-evaluator 6-1`。

## Attempt 4（尝试 4）：执行 CR evaluator round 1

- 时间：2026-06-02
- 方案：启动 fresh worker sub-agent，附带 `bmenhance-cr-02-evaluator` skill，执行 `/bmenhance-cr-02-evaluator 6-1`。
- 选择原因：reviewer round 1 未通过，必须先由 evaluator 独立判断发现是否有效，再进入 fixer。
- 结果：
  - sub-agent `019e8439-0ef7-79c3-9c9c-adfa31fe35eb` 已完成并关闭。
  - 生成文件：`6-1-code-review-evaluation-20260602-round-1.md`。
  - evaluator 结论：Not Approved / 不通过。
  - 必须修复：`compareSemanticJson` key 顺序问题、`allowedNonStableFields` 过宽问题、manifest `expectedOutputClass` 未绑定 registry 问题，均为 P1。
  - 可 defer：`source-integrity` manifest id 与 registry 粒度不一致，P2，建议进入 CR TODO 或后续 Story 6.3/6.4。
  - 误报：无。
- 下一步：启动 fresh sub-agent 执行 `/bmenhance-cr-03-fixer 6-1`，只修 evaluator 确认的 P1 项。

## Attempt 5（尝试 5）：执行 CR fixer round 1

- 时间：2026-06-02
- 方案：启动 fresh worker sub-agent，附带 `bmenhance-cr-03-fixer` skill，执行 `/bmenhance-cr-03-fixer 6-1`。
- 选择原因：evaluator round 1 明确确认 3 个 P1 必修项；按用户要求采用推荐决策并记录，不等待额外确认。
- 结果：
  - sub-agent `019e843c-1c9f-7052-919e-aeff2b2e5953` 已完成并关闭。
  - 修改文件：`src/fixtures/fixture-contract.ts`、`test/fixture-contract.test.ts`、`6-1-code-review-evaluation-20260602-round-1.md`。
  - 修复 #1：`compareSemanticJson` 改为 `isDeepStrictEqual` 语义比较，并增加 key insertion order 回归测试。
  - 修复 #2：`allowedNonStableFields` 限定为 schema-declared timestamp 字段并校验 ISO timestamp，增加 `randomId` / `processId` / `durationMs` 负向测试。
  - 修复 #3：manifest `expectedOutputClass` 绑定 `ExpectedOutputClassSchema.optional()`，增加未知 class 拒绝测试。
  - 保留 defer：`source-integrity` manifest id 与 release gate registry 粒度不一致。
  - 验证报告：fixture contract test 通过；`npm run build` 通过；focused tests 通过；`npm test` 35 files / 266 tests passed。
- 下一步：启动 fresh sub-agent 执行 `/bmenhance-cr-01-reviewer 6-1` round 2。

## Attempt 6（尝试 6）：执行 CR reviewer round 2

- 时间：2026-06-02
- 方案：启动 fresh worker sub-agent，附带 `bmenhance-cr-01-reviewer` skill，执行 `/bmenhance-cr-01-reviewer 6-1` 复审。
- 选择原因：fixer round 1 已修复 P1，必须重新 review 确认问题是否消除且没有新增 blocking。
- 结果：
  - sub-agent `019e843f-cc58-7b51-8118-16e108289881` 已完成并关闭。
  - 生成文件：`6-1-code-review-summary-20260602-round-2.md`。
  - reviewer 结论：通过。
  - blocking findings：无。
  - non-blocking findings：保留 `source-integrity` manifest id 与 release gate registry 粒度不一致，P2 defer。
  - 未重新运行 build/test，因 reviewer 保持只读。
- 下一步：启动 fresh sub-agent 执行 `/bmenhance-cr-02-evaluator 6-1` round 2。

## Attempt 7（尝试 7）：执行 CR evaluator round 2

- 时间：2026-06-02
- 方案：启动 fresh worker sub-agent，附带 `bmenhance-cr-02-evaluator` skill，执行 `/bmenhance-cr-02-evaluator 6-1` 评估 round 2 review。
- 选择原因：reviewer round 2 已通过；必须由 evaluator 也 Approved 后才能进入 rules/todo/finalizer。
- 结果：
  - sub-agent `019e8442-e21c-7822-b8ad-561489d94f26` 已完成并关闭。
  - 生成文件：`6-1-code-review-evaluation-20260602-round-2.md`。
  - evaluator 结论：Approved / 通过。
  - 需要修复项：无。
  - defer 项：认可 `source-integrity` manifest id 与 release gate registry 粒度不一致为 P2 defer，建议后续 CR TODO / Story 6.3 或 6.4 处理。
  - 已对新增 evaluation 文件执行 `git diff --check`，无 whitespace 问题。
- 下一步：启动第五个 fresh sub-agent，依次执行 `bmenhance-cr-04-rules-extractor`、`bmenhance-cr-05-todo-tracker`、`bmenhance-cr-06-finalizer`。

## Attempt 8（尝试 8）：执行 rules / TODO / finalizer

- 时间：2026-06-02
- 方案：启动第五个 fresh worker sub-agent，附带 `bmenhance-cr-04-rules-extractor`、`bmenhance-cr-05-todo-tracker`、`bmenhance-cr-06-finalizer` 三个 skill，并要求严格按 `cr-04 -> cr-05 -> cr-06` 顺序执行。
- 选择原因：reviewer round 2 与 evaluator round 2 均已通过，满足收尾前置条件；用户要求前两个 skill 虽默认不强制执行写入，但本流程需根据结果按默认推荐决策推进。
- 结果：
  - sub-agent `019e8446-2a8e-7d92-bb8d-50b6695d5892` 已完成并关闭。
  - `cr-04`：3 条 Story-scoped 规则写入 `cr-rules-summary.md`：`CR-TEST-03`、`CR-TEST-04`、`CR-API-27`；未修改全局 project/architecture/AGENTS 文档。
  - `cr-05`：新增 `TODO-005` 到 `cr-todo-backlog.md`，追踪 `source-integrity` variant id 与 release gate classification 粒度不一致；open 统计更新为 4。
  - `cr-06`：验证 latest evaluator round 2 为 Approved 后，将 Story 6.1 与 `sprint-status.yaml` 同步为 `done`。
  - Epic 6 未更新为 done，因为 6.2-6.5 仍是 `ready-for-dev`。
  - `_bmad-output` 下没有 `bmm-workflow-status.yaml`，finalizer 按容错规则跳过。
  - 验证：`git diff --check` 通过。
- 终态：Story 6.1 完成。下一步进入 Story 6.2。
