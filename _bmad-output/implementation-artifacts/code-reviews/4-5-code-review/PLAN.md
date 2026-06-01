# Plan（计划）

## Scope（范围）

- Story: `4-5-conflict-detection-and-default-non-overwrite-behavior`
- Workflow: `/bmad-dev-story story 4-5`
- Agent model: `GPT-5.5 (gpt-5.5)`
- 只处理开发步骤；不启动 reviewer/evaluator/fixer，不提交 git。

## Constraints（约束）

- 仅修改 Story 4.5 必需实现文件、Story 4.5 允许区域、`sprint-status.yaml` 和本目录进度文件。
- 不回滚、清理、格式化、同步既有脏工作树。
- 不修改 `_bmad-output/planning-artifacts/` 或旧 Story 1-3/4-1/4-2/4-3/4-4 文件。
- 若发现前置实现缺失导致无法按 Story 边界完成，记录 HALT 证据并停止。

## Steps（步骤）

- [x] 读取 `AGENTS.md`、`sprint-status.yaml`、完整 Story 4.5、`bmad-dev-story` workflow 与项目配置。
- [x] 运行并记录 `git status --short` 脏工作树事实。
- [x] 初始化 4-5 CR/progress 目录与中文进度文件。
- [x] 重新检查前置实现锚点与当前源码行为。
- [x] 按 Story tasks 顺序补测试与实现。
- [x] 运行 focused tests、`npm run build`、可行时运行 `npm test`。
- [x] 更新 Story 4.5 Dev Agent Record、File List、Change Log、Status。
- [x] 更新 `sprint-status.yaml` 中 Story 4.5 状态。

## Current Decision（当前决策）

- 决策 1：沿用 Story 4.1-4.4 已建立的 update/ownership/lock/safe-write 锚点；仅在当前源码真实缺口处补 Story 4.5 conflict detector 与投影。
- 决策 2：先把 Story 标为 `in-progress`，符合 `bmad-dev-story` Step 4；完成且验证通过后再推进到 `review`。
- 决策 3：新增 `src/update/conflict-detector.ts` 作为集中 conflict detector；`src/commands/update.ts` 和 renderer 不复制判断逻辑。
- 决策 4：普通 update 对 IDE mirror drift 只生成 `data.conflicts` 和 single `update.conflicts` blocker，不直接恢复 canonical 内容。
- 决策 5：`UpdateConflict.reason` parser 容忍 future lower-kebab reason code；producer 继续用 `UpdateReasonCode` 类型限制当前 registry。
- 决策 6：Story 4.5 第二轮 reviewer 仅复核 round 1 fixer 的 unknown ownership 修复与范围边界；不启动 evaluator/fixer/finalizer，不修改源码、Story 或 sprint-status。
- 决策 7：Story 4.5 第二轮 evaluator 只评估最新 reviewer 输出 `4-5-code-review-summary-20260601-round-2.md`；只写 4-5 CR 目录 evaluation 与进度记录，不启动 fixer/reviewer/finalizer，不修改源码、Story 或 sprint-status。
- 决策 8：Story 4.5 CR 收尾严格按 04 rules-extractor -> 05 todo-tracker -> 06 finalizer 串行执行；04 采用默认保守 record-only，仅更新 `cr-rules-summary.md` 中既有 `CR-SEC-09` 和本 4-5 进度文件，不修改全局文档。

## CR Evaluator Round 2（第二轮 CR 评估）

- [x] 读取 `bmenhance-cr-02-evaluator` skill、CR 配置和 evaluation 输出模板。
- [x] 定位最新 reviewer 输出为 `4-5-code-review-summary-20260601-round-2.md`，确认本轮 evaluation 为 round 2。
- [x] 复核 Round 1 blocker 的修复：unknown ownership conflict 不再被投影为 installer-owned action。
- [x] 复核测试覆盖：`README.md` classifier unknown fixture、`data.conflicts[]` 断言和 `updatePlan.actions[]` 反向断言。
- [x] 复核 schema/spec widening 与 Story 4.6 repair/apply 范围边界。
- [x] 写入 `4-5-code-review-evaluation-20260601-round-2.md`。

## CR Closeout 04 Rules Extractor（CR 收尾 04 规则提炼）

- [x] 读取 `bmenhance-cr-04-rules-extractor` skill、CR 配置、升格规则和输出模板。
- [x] 读取 Story 4.5 全部 CR summary/evaluation 历史记录。
- [x] 分析 findings：Round 1 有 1 个 `patch`，Round 2 通过；CR TODO 0。
- [x] 执行升格判定：4.5 finding 是既有 `CR-SEC-09` 的跨 Story 复现，不新建重复规则。
- [x] 按默认保守 record-only 更新 `cr-rules-summary.md`：补充 Story 4-5 证据，更新 `CR-SEC-09` 来源 Story 与评分，并追加 Story 4-5 记录。
- Status（状态）：完成；未修改全局文档，未新增 TODO，未启动 05/06 之外的流程。

## CR Closeout 05 TODO Tracker（CR 收尾 05 TODO 跟踪）

- [x] 读取 `bmenhance-cr-05-todo-tracker` skill 和 TODO backlog 输出模板。
- [x] 读取 Story 4.5 最新 reviewer/evaluator 结论，确认 CR TODO 0。
- [x] 检查 `cr-todo-backlog.md` 当前 open 条目：已有 TODO-003 涉及 `test/update-command.test.ts` / `test/update-planning.test.ts`，但其来源为 Story 4-3 慢测治理，不是 4.5 CR 新增或已解决项。
- [x] 采用保守默认：不新增、不解决、不改动 TODO backlog，只在 4-5 进度文件记录 05 结果。
- Status（状态）：完成；`cr-todo-backlog.md` 无变更。

## CR Closeout 06 Finalizer（CR 收尾 06 状态同步）

- [x] 读取 `bmenhance-cr-06-finalizer` skill 和 CR 配置。
- [x] 验证最新 evaluation 为 `4-5-code-review-evaluation-20260601-round-2.md`，结论通过，需修复/可忽略/待讨论/CR TODO 均为 0。
- [x] 检查 Story 当前状态为 `review`，可推进到 `done`。
- [x] 更新 Story 4.5 文件 `Status: done`。
- [x] 更新 `sprint-status.yaml` 中 Story 4.5 为 `done`，并更新 `last_updated`。
- [x] 检查 `bmm-workflow-status.yaml` 不存在，按 skill 容错跳过。
- [x] 检查 Epic 4 仍有 Story 4.6 为 `ready-for-dev`，因此不更新 `epic-4` 状态。
- Status（状态）：完成；仅同步 Story 4.5 状态，不处理 Story 4.6，不提交 git。
