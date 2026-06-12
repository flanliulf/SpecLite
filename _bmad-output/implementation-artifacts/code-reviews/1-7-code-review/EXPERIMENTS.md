# EXPERIMENTS（尝试记录）

## 2026-06-12

### Attempt 0（启动预检与记录文件初始化）

- 方案：读取 Story 1-7、CR 配置、`sprint-status.yaml` 和当前 git 状态，创建 Story 1-7 对应 CR 输出目录与三份进度记录文件。
- 选择原因：用户要求在开始前先规划，并把每次尝试与实时思考记录在当前 Story 的 code review 输出目录中。
- 结果：Story 文件定位为 `_bmad-output/implementation-artifacts/stories/1-7-install-cli-interaction-and-localized-human-output.md`；CR 目录定位为 `_bmad-output/implementation-artifacts/code-reviews/1-7-code-review/`；初始 Story 状态为 `ready-for-dev`；初始工作区干净。
- 决策：按用户指定 strict serial 流程启动第一个全新 sub agent，执行 `/bmad-dev-story story 1-7`。

### Attempt 1（开发 Story 1-7）

- 方案：启动第一个全新 `gpt-5.5` worker sub agent，执行 `/bmad-dev-story story 1-7`。
- 选择原因：用户明确要求开发步骤必须由新的 sub agent 使用 `bmad-dev-story` 完成，并且每一步串行等待前一步结束。
- 结果：开发 sub agent 汇报 Story 文件与 `sprint-status.yaml` 均已进入 `review`；修改范围包括 Story/sprint 状态、`src/cli/messages.ts`、install CLI prompt/renderer/diagnostics 相关实现和 focused tests。
- 验证：`npm test -- test/cli-smoke.test.ts` 通过；`npm test -- test/install-progress-ready-summary.test.ts` 通过；`npm test -- test/install-module-selection.test.ts` 通过；`npm test -- test/cli-smoke.test.ts test/install-progress-ready-summary.test.ts` 通过；`npm run build` 通过；`git diff --check` 通过。
- 全量测试限制：`npm test` 未全量通过，唯一失败为 `test/fixture-release-gates.test.ts` 中 `speclite-npm-publisher` asset package hash 与 fixture expected hash 不一致；开发 sub agent 判断该 drift 不属于 Story 1-7 范围，未越界更新 fixture。
- 决策：接受开发阶段 Story 1-7 范围内验证结果，记录全量测试 drift，进入第 1 轮 code review；不在主线程提前修复或更新 release fixture。

### Attempt 2（第 1 轮 Code Review）

- 方案：启动第二个全新 `gpt-5.5` worker sub agent，执行 `/bmenhance-cr-01-reviewer 1-7`。
- 选择原因：用户要求开发完成后必须由新的 sub agent 执行 code review，且 reviewer 内部按 skill 进行三层审查或 fallback。
- 结果：生成 `_bmad-output/implementation-artifacts/code-reviews/1-7-code-review/1-7-code-review-summary-20260612-round-1.md`；reviewer 结论不通过。
- Findings：总数 2；`patch=1`、`decision_needed=0`、`defer=1`、`dismiss=0`。阻塞 patch 为中文 Ready Summary 在 `install --yes --interactive` 自定义安装后仍错误声明默认 modules、quick config、默认 IDE targets 和无交互安装。defer 为 `speclite-npm-publisher` fixture hash mismatch，reviewer 判断不属于 Story 1-7 diff 范围。
- 验证：focused 组合 `npm test -- test/cli-smoke.test.ts test/install-module-selection.test.ts test/install-progress-ready-summary.test.ts` 通过；`npm run build` 通过并清理构建副作用；`git diff --check` 通过；全量 `npm test` 仍失败，失败包含既有 fixture hash mismatch 和并发 timeout，timeout 文件单独复跑通过。
- 追溯校正：reviewer summary 初始 `Model Used` 元信息误写为 `GPT-5 Codex (gpt-5-codex)`；主线程根据实际 sub agent 启动参数校正为 `GPT-5.5 (gpt-5.5)`。
- 决策：进入第 1 轮 evaluator；预计 fixer 范围仅限 reviewer 指出的中文 Ready Summary interactive/custom 语义错误，不处理 defer fixture hash drift。

### Attempt 3（第 1 轮 Review Evaluation）

- 方案：启动第三个全新 `gpt-5.5` worker sub agent，执行 `/bmenhance-cr-02-evaluator 1-7`。
- 选择原因：用户要求 reviewer 完成后必须由新的 sub agent 独立评估审查结果；停止条件要求 reviewer 与 evaluator 均通过。
- 结果：生成 `_bmad-output/implementation-artifacts/code-reviews/1-7-code-review/1-7-code-review-evaluation-20260612-round-1.md`；评估结论不通过，需要修复。
- 评估结论：发现 #1 确认为有效 P1，需要修复；发现 #2 `speclite-npm-publisher` fixture hash drift 确认为真实但范围外，建议 defer / CR TODO，不作为 Story 1-7 blocker。
- 修复范围：仅修复 install summary / presentation metadata / human renderer 对默认 no-prompt 与 explicit interactive custom flow 的输出区分，并补充中文 `install --yes --interactive` 选择 `core` 时不得出现“默认 modules”或“无交互安装”的 focused test。
- 决策：启动第四个全新 sub agent 执行 `/bmenhance-cr-03-fixer 1-7`，严格按 evaluation 修复 P1；不得修改 `speclite-npm-publisher` asset package、fresh-install expected fixture、release gate test 或无关 contract。

### Attempt 4（第 1 轮 Fixer）

- 方案：启动第四个全新 `gpt-5.5` worker sub agent，执行 `/bmenhance-cr-03-fixer 1-7`。
- 选择原因：第 1 轮 evaluator 确认存在 1 个 P1 修复项，且无人工裁决 blocker。
- 结果：修复完成；`src/commands/install.ts` 添加非枚举 presentation metadata 区分 `default-no-prompt` 与 `explicit-interactive`；`src/diagnostics/output.ts` 只在真实 default no-prompt 时输出默认/无交互声明，interactive 时输出实际选择；`test/cli-smoke.test.ts` 新增中文 interactive custom flow 断言；evaluation 文件追加修复执行记录。
- 验证：`npx vitest run test/cli-smoke.test.ts` 通过；`npx vitest run test/install-module-selection.test.ts test/install-progress-ready-summary.test.ts` 通过；`npm run build` 通过；`git diff --check` 通过；`npm test` 仍因范围外 `speclite-npm-publisher` fixture hash mismatch 未全量通过。
- 副作用清理：主线程发现 `npm run build` 留下 `dist/packaging-manifest.json` 的 `packageHash` 生成副作用，已用精确补丁恢复原值，避免带入 Story 1-7 变更。
- 决策：P1 修复已完成；继续进入第 2 轮 reviewer -> evaluator -> fixer 循环，直到 reviewer 与 evaluator 均通过。

### Attempt 5（第 2 轮 Code Review）

- 方案：启动第五个全新 `gpt-5.5` worker sub agent，执行 `/bmenhance-cr-01-reviewer 1-7`。
- 选择原因：第 1 轮 fixer 完成后，用户要求重复 reviewer -> evaluator -> fixer，直到 reviewer 与 evaluator 均通过。
- 结果：生成 `_bmad-output/implementation-artifacts/code-reviews/1-7-code-review/1-7-code-review-summary-20260612-round-2.md`；reviewer 结论通过。
- Findings：本轮新发现 0；`patch=0`、`decision_needed=0`、`defer=1`、`dismiss=0`。唯一 defer 仍为范围外 `speclite-npm-publisher` fixture hash mismatch。
- 验证：`npx vitest run test/cli-smoke.test.ts` 通过；`npx vitest run test/install-module-selection.test.ts test/install-progress-ready-summary.test.ts` 通过；`npm run build` 通过并清理 `dist/packaging-manifest.json` 副作用；`git diff --check` 通过；`npm test` 仍仅因范围外 fixture hash mismatch 失败。
- 决策：reviewer 已通过；继续启动第 2 轮 evaluator 独立复核。若 evaluator 通过且无修复项，则退出 reviewer/evaluator/fixer 循环。

### Attempt 6（第 2 轮 Review Evaluation）

- 方案：启动第六个全新 `gpt-5.5` worker sub agent，执行 `/bmenhance-cr-02-evaluator 1-7`。
- 选择原因：用户停止条件要求 reviewer 审查通过且 evaluator 评估也通过。
- 结果：生成 `_bmad-output/implementation-artifacts/code-reviews/1-7-code-review/1-7-code-review-evaluation-20260612-round-2.md`；评估结论 Approved / 通过；无需 fixer；无 blocker。
- 验证：`npx vitest run test/cli-smoke.test.ts test/install-module-selection.test.ts test/install-progress-ready-summary.test.ts` 通过，3 files / 31 tests passed；`git diff --check` 通过。
- Defer 决策：`test/fixture-release-gates.test.ts` 的 `speclite-npm-publisher` fixture hash mismatch 真实存在但范围外；建议进入 CR TODO 或单独任务，不进入 Story 1-7 fixer。
- 决策：CR reviewer/evaluator 双通过，停止 reviewer/evaluator/fixer 循环；启动新的收尾 sub agent 依次执行 `bmenhance-cr-04-rules-extractor`、`bmenhance-cr-05-todo-tracker`、`bmenhance-cr-06-finalizer`。05 对 defer 项按默认推荐纳入 TODO backlog；06 若确认 Epic 1 全部 Story done，则按默认推荐同步 Epic 状态为 `done`。

### Attempt 7（CR 通过后收尾：04 / 05 / 06）

- 方案：启动新的全新 `gpt-5.5` worker sub agent，在同一 sub agent 内严格按顺序执行 `bmenhance-cr-04-rules-extractor 1-7` -> `bmenhance-cr-05-todo-tracker 1-7` -> `bmenhance-cr-06-finalizer 1-7`。
- 选择原因：用户要求 reviewer/evaluator 双通过后继续执行 04/05/06，并根据 skill 结果采用默认推荐决策。
- 04 结果：仅做 analysis-only；Story 1-7 的 P1 已在 round 2 确认修复，`speclite-npm-publisher` fixture hash mismatch 是范围外 defer，不适合升格为全局规则；未修改 `cr-rules-summary.md` 或全局文档。
- 05 结果：检查现有 backlog 后未发现重复 open/in-progress TODO，新增 `_bmad-output/implementation-artifacts/cr-rules/cr-todo-backlog.md` 条目 `TODO-009: 对齐 speclite-npm-publisher fixture hash`。
- 06 结果：验证 latest evaluation 为 Approved / 通过后，将 Story 文件状态从 `review` 同步为 `done`；将 `sprint-status.yaml` 中 `1-7-install-cli-interaction-and-localized-human-output` 同步为 `done`，并在 Epic 1 全部 Story done 后将 `epic-1` 同步为 `done`；`bmm-workflow-status.yaml` 不存在，按规则跳过。
- 验证：收尾 sub agent 运行 `git diff --check` 通过；主线程复核 `Status: done`、`1-7...: done`、`epic-1: done`、`TODO-009` 均存在。
- 决策：Story 1-7 流程收尾完成；进入最后的 `git-commit-convention` 本地提交，不推送。
