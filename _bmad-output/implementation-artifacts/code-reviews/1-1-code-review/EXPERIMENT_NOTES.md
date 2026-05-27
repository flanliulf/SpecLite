# EXPERIMENT_NOTES（实时笔记）

## 2026-05-26

- 已确认当前目标是 Epic 1 全部 Story 的串行开发与 CR 闭环。
- 已确认当前 Story 为 `1-1-cli-install-entry-and-runtime-guard`。
- 当前仓库存在大量既有未提交和未跟踪变更，后续操作只处理本流程相关文件，不回滚外部变更。
- 本机默认 `python3` 是 3.9.6，`python3.12` 可用；如果 sub-agent 遇到 BMad resolver 的 `tomllib` 或 Python 版本问题，应优先使用 `python3.12` 或按 skill fallback 读取配置。
- 开发 sub-agent 已完成 `/bmad-dev-story story 1-1`。
- 开发结果包括 root package scaffold、`src/` CLI 与契约 anchors、`test/` 测试和 fixture、Story 文件状态与 `sprint-status.yaml` 状态更新。
- 开发验证命令均通过；开发 sub-agent 已清理 `node_modules/` 与 `dist/`。
- 第 1 轮 reviewer 已完成，结论为建议通过；发现数量为 0。
- reviewer 只读验证中未重新安装依赖，所以 `npm test` 未完成于缺少 `node_modules`；开发阶段已有 `npm test` 通过记录。
- 第 1 轮 evaluator 已完成，结论为 Approved / 通过；需要修复项 0，CR TODO 0。
- 为避免偏离用户指定的 reviewer/evaluator/fixer 链路，下一步仍启动 fixer，但明确其只能处理评估文件中的 0 修复项，不能改源码或扩大范围。
- fixer 已完成 0 修复项收口，仅追加评估文件中的修复执行记录，未改源码。
- 下一步：启动第五个全新的 `gpt-5.5` sub-agent，在同一 sub-agent 内严格按顺序执行 `bmenhance-cr-04-rules-extractor`、`bmenhance-cr-05-todo-tracker`、`bmenhance-cr-06-finalizer`。
- 04/05/06 已完成：无规则沉淀、无 TODO backlog、Story 1-1 状态同步为 Done。
- 当前 Story 1-1 闭环完成；下一步初始化 `1-2-code-review` 进度文件并启动 `/bmad-dev-story story 1-2`。
