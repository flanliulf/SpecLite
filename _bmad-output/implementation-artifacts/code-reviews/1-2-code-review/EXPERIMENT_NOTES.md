# EXPERIMENT_NOTES（实时笔记）

## 2026-05-26

- Story 1-1 已完成开发、CR、评估、0 修复项收口和 04/05/06 收尾，状态为 Done。
- 当前 Story 为 `1-2-project-target-directory-resolution-and-existing-install-detection`。
- 需要重点约束：本 Story 只实现目标目录解析、目录状态识别、existing install detection 和写入前确认，不实现 Story 1-3 的 module selection 或后续写入阶段。
- 开发 sub-agent 已完成 `/bmad-dev-story story 1-2`，Story 状态进入 `review`。
- 开发结果包括目标目录解析、路径规范化、existing install detection、CLI 参数、fixture JSON 更新和测试覆盖。
- 开发验证通过：`npx vitest run test/target-directory.test.ts`、`npm test`、`npm run build`。
- 第 1 轮 reviewer 已完成，结论不通过，发现 5 个 patch 项。
- 重点问题集中在 missing manifest projection、index 校验、regular file/symlink target、安全 human output、no-write 边界测试覆盖。
- 第 1 轮 evaluator 已完成，结论不通过；5 个 findings 均确认有效，误报 0。
- fixer 已完成 5 项修复，并验证 `npm test -- --run test/target-directory.test.ts`、`npm test`、`npm run build` 通过。
- 修复覆盖 manifest unavailable、installed-state index validation、regular file/symlink target、安全 human output、no-write 与边界测试。
- 第 2 轮 reviewer 已完成，结论通过；第 1 轮 5 个 findings 全部关闭，无新发现。
- 第 2 轮 evaluator 已完成，结论 Approved / 通过；需要修复项 0，CR TODO 0。
- 第 2 轮 fixer 已完成 0 修复项收口，仅追加评估文件中的修复执行记录，未改源码。
- 下一步：启动第五个全新的 `gpt-5.5` sub-agent，在同一 sub-agent 内严格按顺序执行 `bmenhance-cr-04-rules-extractor`、`bmenhance-cr-05-todo-tracker`、`bmenhance-cr-06-finalizer`。
- 04/05/06 已完成：新增 record-only `cr-rules-summary.md`，无 TODO backlog，Story 1-2 状态同步为 done。
- 当前 Story 1-2 闭环完成；下一步初始化 `1-3-code-review` 进度文件并启动 `/bmad-dev-story story 1-3`。
