# EXPERIMENT_NOTES（实时笔记）

## 2026-05-28 Corrective CR Reopen Run（校正复审轮次）

- 当前判断：Story 1-5 已处于 `review`，说明上一轮 corrective dev verification 已完成到待审状态。
- 下一步：等待 Story 1-3 完成后，启动全新 sub-agent 执行 `/bmenhance-cr-01-reviewer 1-5`。
- 当前执行：本轮按用户最新指令只执行 `/bmenhance-cr-01-reviewer 1-5`，不重新开发，不执行 evaluator/fixer/finalizer。
- 工具限制：当前环境没有独立 `Agent` 调度工具；已按 reviewer skill 降级为当前上下文串行三层审查，并在 round 3 summary 中记录。
- Reviewer 输入范围：Story 1-5 文件、既有 round 1/2 CR 与 evaluation、Story 1-5 scoped diff；忽略 Story 1-3 等其他 CR 修复产生的无关工作区改动。
- 验证记录：定向测试 4 files / 26 tests 通过；全量 `npm test` 20 files / 118 tests 通过；`npm run build` 通过；`npm run lint` 因无脚本不可用；Story 1-5 scoped `git diff --check` 通过。
- Reviewer 结论：round 3 summary 已生成，结论通过，findings 0，无需进入 fixer；本轮按用户要求停止在 reviewer 步骤。
- 当前执行：本轮按用户最新指令继续执行 `/bmenhance-cr-02-evaluator 1-5`，只评估最新 round 3 reviewer 输出，不执行 fixer/finalizer。
- Evaluator 核对重点：`target-writer` 是否从 selected package roots 生成 package entries、无 help row package root 是否进入 `skill-index`、ReadyCheck 是否校验 selected package root 与 target skill count、final pre-write prompt 是否使用最终 selected modules。
- Evaluator 验证记录：定向测试 4 files / 26 tests 通过；全量 `npm test` 20 files / 118 tests 通过；Story 1-5 scoped `git diff --check` 通过；未运行会改写 `dist/` 的 build。
- Evaluator 结论：round 3 evaluation 已生成，Approved / 通过；需要修复项 0，CR TODO 0，不需要 fixer；按用户指令停止，不执行 fixer/finalizer。
- 当前执行：本轮按用户最新指令继续执行 CR 通过后收尾，严格串行执行 04 -> 05 -> 06，只处理 Story 1-5。
- 04 默认决策：采用 record-only，不修改全局文档；round 3 无新增 findings，不新增规则，仅补充 Story 1-5 规则总结中的 round 3 来源和关闭证据。
- 05 结果：round 3 evaluation 明确 CR TODO 0；既有 `cr-todo-backlog.md` 无 Story 1-5 open/in-progress 条目，本次不新增 TODO。
- 06 结果：latest evaluation Approved；Story 文件与 `sprint-status.yaml` 已从 `review` 同步为 `done`；`bmm-workflow-status.yaml` 不存在，按规则跳过。
- Epic 状态决策：Story 1-6 仍为 `review`，不触发 Epic 1 主状态更新；本次不处理其他 Story。

## 2026-05-26

- Story 1-1、1-2、1-3、1-4 已完成开发、CR、评估、修复收口和 04/05/06 收尾，状态为 done。
- 当前 Story 为 `1-5-runtime-structure-artifact-directory-and-ide-mirror-creation`。
- 需要重点约束：本 Story 可进入 runtime structure、artifact directory、IDE mirror、manifest/index 等写入阶段，但不得实现 Story 1-6 的 ReadyCheck / ready summary。
- 开发 sub-agent 已完成 `/bmad-dev-story story 1-5`，Story 状态进入 `review`。
- 开发结果包括 runtime structure、artifact directory、IDE mirror writer、manifest/index、safe filesystem utilities、fixture expected output 和相关测试。
- 开发验证通过：`npm run build`、`npm test -- test/runtime-structure.test.ts`、`npm test`。
- 已清理由验证产生的未跟踪 `node_modules/` 与 `dist/`，避免后续提交误纳入。
- 第 1 轮 reviewer 已完成，结论不通过，发现 3 个高严重性 patch 项。
- 重点问题集中在 IDE mirror directory creation 的 path/symlink 安全、module-help.csv 与 canonical package 一致性、partial write failure progress 可诊断性。
- 第 1 轮 evaluator 已完成，结论不通过；3 项均确认有效，误报 0。
- fixer 已完成 3 项修复，并验证定向测试、全量 `npm test`、`npm run build` 通过。
- 修复覆盖 IDE mirror safe directory creation、module-help canonical package integrity validation、write-phase partial progress failure output。
- 第 2 轮 reviewer 已完成，结论通过；第 1 轮 3 个 findings 全部关闭，无新发现。
- 第 2 轮 evaluator 已完成，结论 Approved / 通过；需要修复项 0，CR TODO 0。
- 第 2 轮 fixer 已完成 0 修复项收口，仅追加评估文件中的修复执行记录，未改源码。
- 第五个 sub-agent 已完成 04/05/06：record-only 写入 1-5 相关 CR 规则，CR TODO 为 0，Story 1-5 状态与 `sprint-status.yaml` 均已同步为 done。
- 下一步：初始化 `1-6-code-review` 进度目录，并启动新的 `gpt-5.5` sub-agent 执行 `/bmad-dev-story story 1-6`。
