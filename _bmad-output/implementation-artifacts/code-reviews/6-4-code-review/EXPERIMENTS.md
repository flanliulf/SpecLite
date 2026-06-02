# EXPERIMENTS.md

## Attempt 1（尝试 1）：当前状态审计与流程初始化

- 时间：2026-06-02
- 方案：在 Story 6.3 完成后，读取 Story 6.4 文件和 `sprint-status.yaml` 状态，创建 Story 6.4 的进度文件。
- 选择原因：用户要求 Epic 6 每个 Story 依次执行 strict serial；进入新 Story 前必须先确认状态和范围。
- 结果：
  - Story 6.4 文件存在，当前 `Status: ready-for-dev`。
  - `sprint-status.yaml` 显示 Story 6.4 为 `ready-for-dev`。
  - 已创建 `6-4-code-review/PLAN.md`、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md`。
- 下一步：派发 fresh sub-agent 执行 `/bmad-dev-story story 6-4`。

## Attempt 2（尝试 2）：执行 dev-story

- 时间：2026-06-02
- 方案：启动 fresh worker sub-agent，附带 `bmad-dev-story` skill，要求执行 `/bmad-dev-story story 6-4`，只负责 Story 6.4 开发，不执行 CR 或提交。
- 选择原因：Story 6.4 处于 `ready-for-dev`，必须先完成开发并进入 `review`。
- 结果：
  - sub-agent `019e8491-2c76-7d21-8cfc-b564c052e419` 已完成并关闭。
  - 实际修改/新增：`.github/workflows/ci.yml`、`package.json`、`scripts/release/packaging-check.mjs`、`src/fixtures/fixture-contract.ts`、`test/story-6-4-path-portability.test.ts`、`test/package-scaffold.test.ts`、`test/fixtures/path-portability/**`、`dist/packaging-manifest.json`、Story 6.4 文件、`sprint-status.yaml`。
  - Story 6.4 状态进入 `review`；`sprint-status.yaml` 中 Story 6.4 也进入 `review`。
  - 完成内容：Node `[22,24]` + macOS/Windows CI matrix、`path-portability` fixture、explicit repair fixture、packaging acceptance、6.5 typed pending/skip slot。
  - 验证报告：path-portability test 5 passed；focused 8 files / 61 tests passed；`npm run build` 通过；`npm run release:packaging-check` 通过；`npm test` 37 files / 279 tests passed；`git diff --check` 通过。
  - 无 HALT，无新增依赖。
- 下一步：启动 fresh sub-agent 执行 `/bmenhance-cr-01-reviewer 6-4`。

## Attempt 3（尝试 3）：执行 CR reviewer round 1

- 时间：2026-06-02
- 方案：启动 fresh worker sub-agent，附带 `bmenhance-cr-01-reviewer` skill，执行 `/bmenhance-cr-01-reviewer 6-4`。
- 选择原因：dev-story 已将 Story 6.4 推到 `review`，按流程必须先由 reviewer 生成审查结果。
- 结果：
  - sub-agent `019e849e-e3c2-7842-b65f-725260020bfc` 已完成并关闭。
  - 生成文件：`6-4-code-review-summary-20260602-round-1.md`。
  - reviewer 结论：不通过。
  - blocking findings：
    - `path-portability` gate 主要验证手写 expected artifacts，没有执行真实 CLI / fixture 状态。
    - AC 6 的 `path escape` / `unsafe overwrite` 覆盖缺失。
    - Terminal width matrix 只覆盖 `<80`，缺少 `80-119` 与 `>=120`。
    - `release:packaging-check` 的 package inventory 依赖执行前是否已有 `dist/packaging-manifest.json`，存在非幂等风险。
  - non-blocking findings：无。
- 下一步：启动 fresh sub-agent 执行 `/bmenhance-cr-02-evaluator 6-4`。

## Attempt 4（尝试 4）：执行 CR evaluator round 1

- 时间：2026-06-02
- 方案：启动 fresh worker sub-agent，附带 `bmenhance-cr-02-evaluator` skill，执行 `/bmenhance-cr-02-evaluator 6-4`。
- 选择原因：reviewer round 1 未通过，必须先由 evaluator 独立判断发现是否有效，再进入 fixer。
- 结果：
  - sub-agent `019e84a3-a817-7dc2-8e14-8bb65273a7d0` 已完成并关闭。
  - 生成文件：`6-4-code-review-evaluation-20260602-round-1.md`。
  - evaluator 结论：Not Approved / 不通过。
  - 必须修复：
    - `path-portability` gate 未执行真实 CLI / fixture 状态。
    - AC 6 的 `path escape` / `unsafe overwrite` 未在 path-portability fixture 中覆盖。
    - Terminal width matrix 只覆盖 `columns: 72`，缺少 `80-119` 与 `>=120`。
    - `release:packaging-check` 的 package inventory 受执行前是否已有 `dist/packaging-manifest.json` 影响，存在非幂等风险。
  - 可忽略 / 可 defer：无。
- 下一步：启动 fresh sub-agent 执行 `/bmenhance-cr-03-fixer 6-4`。

## Attempt 5（尝试 5）：执行 CR fixer round 1

- 时间：2026-06-02
- 方案：启动 fresh worker sub-agent，附带 `bmenhance-cr-03-fixer` skill，执行 `/bmenhance-cr-03-fixer 6-4`。
- 选择原因：evaluator round 1 明确确认 4 个 blocking 项；按用户要求采用推荐决策并记录，不等待额外确认。
- 结果：
  - sub-agent `019e84a6-83d5-7cc2-bf75-fa8ee8fbee4e` 已完成并关闭。
  - 修改文件：`test/story-6-4-path-portability.test.ts`、`scripts/release/packaging-check.mjs`、`6-4-code-review-evaluation-20260602-round-1.md`；验证命令刷新 `dist/packaging-manifest.json`。
  - 修复 #1：path-portability gate 增加真实 CLI 临时项目 gate，执行 `install/status/validate/update/update --repair/resolve` 并做 schema / semantic / path leak 断言。
  - 修复 #2：AC6 覆盖 `artifact-path.escapes-project`、`file-integrity.unsafe-overwrite-risk`，并保留 case conflict。
  - 修复 #3：terminal width matrix 扩展到 `72`、`100`、`120`。
  - 修复 #4：packaging-check 从 stable inventory/hash 中排除 `dist/packaging-manifest.json`，测试覆盖删除 manifest 后连续两次运行结果一致。
  - 验证报告：Story 6.4 path-portability 6 tests passed；fixture contract / release gates 16 tests passed；`npm run build` 通过；`npm run release:packaging-check` 通过；`npm test` 37 files / 280 tests passed。
- 下一步：启动 fresh sub-agent 执行 `/bmenhance-cr-01-reviewer 6-4` round 2。

## Attempt 6（尝试 6）：执行 CR reviewer round 2

- 时间：2026-06-02
- 方案：启动 fresh worker sub-agent，附带 `bmenhance-cr-01-reviewer` skill，执行 `/bmenhance-cr-01-reviewer 6-4` 复审。
- 选择原因：fixer round 1 已修复 4 个 blocking 项，必须重新 review 确认问题是否消除且没有新增 blocking。
- 结果：
  - sub-agent `019e85c9-ad17-7ff0-8667-dea10bfd2fa9` 已完成并关闭。
  - 生成文件：`6-4-code-review-summary-20260602-round-2.md`。
  - reviewer 结论：不通过。
  - blocking findings：
    - Packaging manifest 的 `files` 与真实 `npm pack --dry-run --json` inventory 不一致：真实包仍包含 `dist/packaging-manifest.json`，但 manifest 列表排除了它。
    - `path-portability` expected validate snapshot 仍未覆盖 `path escape` / `unsafe overwrite`，动态测试补了一部分，但 fixture expected artifact 仍是旧证据面。
  - non-blocking finding：真实 CLI gate 捕获了 `exitCode`，但未断言 AC7 的 exit code semantics。
- 下一步：启动 fresh sub-agent 执行 `/bmenhance-cr-02-evaluator 6-4` round 2。

## Attempt 7（尝试 7）：执行 CR evaluator round 2

- 时间：2026-06-02
- 方案：启动 fresh worker sub-agent，附带 `bmenhance-cr-02-evaluator` skill，执行 `/bmenhance-cr-02-evaluator 6-4` 评估 round 2 review。
- 选择原因：reviewer round 2 仍不通过；必须先评估哪些发现确认为 blocking，哪些可 defer。
- 结果：
  - sub-agent `019e85ce-068e-7b61-b4a3-f1ed382c782a` 已完成并关闭。
  - 生成文件：`6-4-code-review-evaluation-20260602-round-2.md`。
  - evaluator 结论：Not Approved / 不通过。
  - 必须修复：
    - P1：Packaging manifest `files` 与真实 `npm pack --dry-run --json` inventory 不一致。
    - P1：`path-portability` expected validate snapshot 未覆盖 `path escape` / `unsafe overwrite`。
  - 可 defer / CR TODO：
    - P2：真实 CLI gate 捕获 `exitCode` 但未断言 AC7 exit code semantics；建议纳入 CR TODO 或随 blocking 修复同步补强。
  - 决策：P2 与真实 CLI gate 修复邻近，优先让 fixer 同步补强；如无法安全同步则记录给后续 TODO。
- 下一步：启动 fresh sub-agent 执行 `/bmenhance-cr-03-fixer 6-4` round 2。

## Attempt 8（尝试 8）：执行 CR fixer round 2

- 时间：2026-06-02
- 方案：启动 fresh worker sub-agent，附带 `bmenhance-cr-03-fixer` skill，执行 `/bmenhance-cr-03-fixer 6-4` round 2。
- 选择原因：evaluator round 2 确认 2 个 P1 必修，且 P2 exit-code 断言可在同一 CLI gate 范围内同步补强。
- 结果：
  - sub-agent `019e85d1-8fe5-7522-94ad-8e596ceb693f` 已完成并关闭。
  - 修改文件：`scripts/release/packaging-check.mjs`、`test/story-6-4-path-portability.test.ts`、`test/fixtures/path-portability/expected/command-json/validate.json`、`dist/packaging-manifest.json`、`6-4-code-review-evaluation-20260602-round-2.md`。
  - 修复 #1：`manifest.files` 现在包含 `dist/packaging-manifest.json`，并断言与真实 `npm pack --dry-run --json` inventory 完全一致；`packageHash` 排除自指 manifest，保持重复生成稳定。
  - 修复 #2：`validate.json` 新增 `artifact-path.escapes-project` 与 `file-integrity.unsafe-overwrite-risk`，`issueCounts.error` 更新为 `4`；测试显式断言 expected issue。
  - P2 同步补强：真实 CLI gate 断言 exit code semantics，成功命令 `0`，failure diagnostics 为 `1` 并与 `CommandResult.status === "failure"` 对齐。
  - 验证报告：Story 6.4 test 6 passed；`npm run build` 通过；`npm run release:packaging-check` 通过；`npm pack --dry-run --json` inventory 比对通过；`npm test` 37 files / 280 tests passed。
- 下一步：启动 fresh sub-agent 执行 `/bmenhance-cr-01-reviewer 6-4` round 3。

## Attempt 9（尝试 9）：执行 CR reviewer round 3

- 时间：2026-06-02
- 方案：启动 fresh worker sub-agent，附带 `bmenhance-cr-01-reviewer` skill，执行 `/bmenhance-cr-01-reviewer 6-4` 复审。
- 选择原因：fixer round 2 已修复 round 2 findings，必须重新 review 确认问题是否消除且没有新增 blocking。
- 结果：
  - sub-agent `019e85d7-825d-7d40-862d-5bac4f7a1e46` 已完成并关闭。
  - 生成文件：`6-4-code-review-summary-20260602-round-3.md`。
  - reviewer 结论：不通过。
  - blocking findings：`path-portability` expected validate snapshot 仍未覆盖真正的 project-boundary path escape；当前 `artifact-path.escapes-project` 证据为 `details.reason: "outside-configured-root"`，不是源码真实项目边界逃逸使用的 `path-escapes-project`。
  - non-blocking findings：无新增。
  - 已闭环项：packaging manifest inventory、unsafe overwrite snapshot、exit-code semantics。
- 下一步：启动 fresh sub-agent 执行 `/bmenhance-cr-02-evaluator 6-4` round 3。

## Attempt 10（尝试 10）：执行 CR evaluator round 3

- 时间：2026-06-02
- 方案：启动 fresh worker sub-agent，附带 `bmenhance-cr-02-evaluator` skill，执行 `/bmenhance-cr-02-evaluator 6-4` 评估 round 3 review。
- 选择原因：reviewer round 3 仍不通过；必须先评估残留 finding 是否有效。
- 结果：
  - sub-agent `019e85db-4522-7df1-adfa-674f70c99480` 已完成并关闭。
  - 生成文件：`6-4-code-review-evaluation-20260602-round-3.md`。
  - evaluator 结论：Not Approved / 不通过。
  - 必须修复：`path-portability` expected validate snapshot 未覆盖真实 project-boundary path escape；expected evidence 应使用 `details.reason: "path-escapes-project"`，当前为 `outside-configured-root`。
  - 可忽略 / 可 defer：无。
  - 验证：新增 evaluation 文件 `git diff --check` 通过。
- 下一步：启动 fresh sub-agent 执行 `/bmenhance-cr-03-fixer 6-4` round 3。

## Attempt 11（尝试 11）：执行 CR fixer round 3

- 时间：2026-06-02
- 方案：启动 fresh worker sub-agent，附带 `bmenhance-cr-03-fixer` skill，执行 `/bmenhance-cr-03-fixer 6-4` round 3。
- 选择原因：evaluator round 3 确认唯一残留 blocking 必须修复。
- 结果：
  - sub-agent `019e85dd-7f1f-7b73-829a-e4a430dfbd26` 已完成并关闭。
  - 修改文件：`test/fixtures/path-portability/expected/command-json/validate.json`、`test/story-6-4-path-portability.test.ts`、`6-4-code-review-evaluation-20260602-round-3.md`。
  - 修复：expected snapshot 从 `outside-configured-root` 修正为源码真实项目边界逃逸分支 `path-escapes-project`；测试新增 expected-output gate，避免只按 issue id 通过。
  - 验证报告：Story 6.4 path-portability 6 tests passed；`npm run build` 通过；`npm run release:packaging-check` 通过；`npm test` 37 files / 280 tests passed；本轮 3 个文件 `git diff --check` 通过。
- 下一步：启动 fresh sub-agent 执行 `/bmenhance-cr-01-reviewer 6-4` round 4。

## Attempt 12（尝试 12）：执行 CR reviewer round 4

- 时间：2026-06-02
- 方案：启动 fresh worker sub-agent，附带 `bmenhance-cr-01-reviewer` skill，执行 `/bmenhance-cr-01-reviewer 6-4` 复审。
- 选择原因：fixer round 3 已修复最后一个 blocking，必须重新 review 确认是否闭环。
- 结果：
  - sub-agent `019e85e1-51c7-74b2-b4d6-f942d1e068eb` 已完成并关闭。
  - 生成文件：`6-4-code-review-summary-20260602-round-4.md`。
  - reviewer 结论：通过。
  - blocking findings：无。
  - non-blocking findings：动态 CLI smoke gate 仍只按 issue id 验证 path escape，未断言真实 validate 输出的 `details.reason`；reviewer 认为不阻塞，因为 expected snapshot gate 已硬断言 `path-escapes-project`。
  - 只读验证：`npm pack --dry-run --json` inventory 与 `dist/packaging-manifest.json` 一致。
- 下一步：启动 fresh sub-agent 执行 `/bmenhance-cr-02-evaluator 6-4` round 4。

## Attempt 13（尝试 13）：执行 CR evaluator round 4

- 时间：2026-06-02
- 方案：启动 fresh worker sub-agent，附带 `bmenhance-cr-02-evaluator` skill，执行 `/bmenhance-cr-02-evaluator 6-4` 评估 round 4 review。
- 选择原因：reviewer round 4 已通过；必须由 evaluator 也 Approved 后才能进入 rules/todo/finalizer。
- 结果：
  - sub-agent `019e85e5-56a1-7e63-b269-d9f1ecb8576c` 已完成并关闭。
  - 生成文件：`6-4-code-review-evaluation-20260602-round-4.md`。
  - evaluator 结论：Approved / 通过。
  - 需要当前修复项：无。
  - 可 defer / CR TODO：1 个，动态 CLI smoke gate 未断言真实 `validate` 输出的 `details.reason`，P2 非阻塞。
- 下一步：启动第五个 fresh sub-agent，依次执行 `bmenhance-cr-04-rules-extractor`、`bmenhance-cr-05-todo-tracker`、`bmenhance-cr-06-finalizer`。

## Attempt 14（尝试 14）：执行 rules / TODO / finalizer

- 时间：2026-06-02
- 方案：启动第五个 fresh worker sub-agent，附带 `bmenhance-cr-04-rules-extractor`、`bmenhance-cr-05-todo-tracker`、`bmenhance-cr-06-finalizer` 三个 skill，并要求严格按 `cr-04 -> cr-05 -> cr-06` 顺序执行。
- 选择原因：reviewer round 4 与 evaluator round 4 均已通过，满足收尾前置条件；P2 非阻塞项需要交给 TODO backlog。
- 结果：
  - sub-agent `019e85e8-2dba-7b62-ae9c-a0a6ff232fbc` 已完成并关闭。
  - `cr-04`：analysis-only；唯一 P2 非阻塞项应交给 TODO，不满足写入 `cr-rules-summary.md` 条件；未改全局文档。
  - `cr-05`：新增 `TODO-006`，记录“动态 CLI smoke gate 未断言真实 validate 输出的 details.reason”；open 统计更新为 5。
  - `cr-06`：验证 latest evaluator round 4 为 Approved 后，将 Story 6.4 与 `sprint-status.yaml` 同步为 `done`。
  - Epic 6 未更新为 done，因为 6.5 仍是 `ready-for-dev`。
  - `_bmad-output` 下没有 `bmm-workflow-status.yaml`，finalizer 按容错规则跳过。
- 终态：Story 6.4 完成。下一步进入 Story 6.5。
