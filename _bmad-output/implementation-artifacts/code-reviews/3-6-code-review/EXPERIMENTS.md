# EXPERIMENTS

## 尝试记录

### 2026-05-28 初始化

- 方案: 为 Story 3.6 创建 code review 进度文件，并按 dev -> CR -> evaluator -> fixer -> 复检 -> rules/todo/finalizer 的顺序推进。
- 选择原因: 用户要求每个 Story 在对应 code review 输出目录维护中文进度记录，且所有步骤必须严格串行。
- 结果: 已初始化，等待前序 Story 完成后开始。

### 2026-05-29 Story 3.6 启动

- 方案: 在 Story 3.5 已 finalizer 到 `done` 后，启动 fresh sub-agent 执行 `/bmad-dev-story story 3-6`。
- 选择原因: `sprint-status.yaml` 显示 Epic 3 仍有 `3-6-validation-progress-category-coverage-and-local-determinism: ready-for-dev`，因此 Epic 3 最终 git commit 应延后到 3.6 完成后。
- 结果: 进行中。

### 2026-05-29 Dev workflow 前置核对

- 方案: 按 `bmad-dev-story` activation fallback 手动读取 workflow customize，并读取 Story、`sprint-status.yaml`、`project-context.md`、关键 validation / diagnostics / fixture files。
- 选择原因: 本机默认 `python3` 为 3.9，resolver 因缺少 `tomllib` 失败；skill 明确要求失败后按 base -> team -> user override 手动合并。
- 结果: 前置 scaffold 已存在，`sprint-status.yaml` 与 Story 状态已推进到 `in-progress`。

### 2026-05-29 Story 3.6 开发完成

- 方案: 新增 shared `validation-order` 原语，调整 `validateProject` canonical 编排和 deterministic projection，增强 validate Evidence human output，并扩展 `test/validate-command.test.ts` focused coverage。
- 选择原因: Story 3.6 要求排序规则集中复用，`checkedCategories` 只反映实际执行类别，`source-integrity` 保留 reserved/not checked 语义，且 human-readable output 在不同 terminal width 下不能丢字段。
- 结果: `npm run build` 与全量 `npm test` 通过；Story 状态已推进到 `review`，等待后续 CR reviewer/evaluator。

### 2026-05-29 CR reviewer Round 1

- 方案: 使用 `bmenhance-cr-01-reviewer` 对 Story 3.6 相关实现、测试和输出契约做只读审查；当前运行时没有 Agent 工具，因此按 skill 降级路径在当前上下文串行完成三层视角。
- 选择原因: 用户要求 fresh sub-agent 严格串行执行 Story 3.6 code review，只写 reviewer 结果文件和中文进度记录，不执行 evaluator/fixer/finalizer。
- 结果: `npm run build`、`npm test -- test/validate-command.test.ts`、全量 `npm test` 均通过；发现 2 个中优先级 patch 项，reviewer 结论为不通过，结果写入 `3-6-code-review-summary-20260529-round-1.md`。

### 2026-05-29 CR evaluator Round 1

- 方案: 使用 `bmenhance-cr-02-evaluator` 独立复核 reviewer Round 1 的 2 个 finding，只读 Story、reviewer 输出和相关源码证据。
- 选择原因: 用户要求本轮只执行 evaluation，不执行 fixer/finalizer，不修改代码、不提交。
- 结果: 两个 finding 均确认有效，均评估为 P1 blocking patch；evaluation 写入 `3-6-code-review-evaluation-20260529-round-1.md`，后续需要执行 fixer 后再复检。

### 2026-05-29 CR reviewer Round 2

- 方案: 使用 `bmenhance-cr-01-reviewer` 对 Story 3.6 fixer 后代码执行第二轮只读复审，重点核对 Round 1 两个 P1、AC 1-9、Tasks 1-9 和回归测试。
- 选择原因: 用户要求 fresh sub-agent 严格串行执行第二轮 code review，只写 reviewer summary 和进度记录，不执行 evaluator/fixer/finalizer。
- 结果: Round 1 两个 P1 均已修复，未发现新阻塞项；`npm test -- test/validate-command.test.ts`、`npm run build`、全量 `npm test` 与 `git diff --check` 均通过；reviewer 结论为通过，结果写入 `3-6-code-review-summary-20260529-round-2.md`。

### 2026-05-29 CR evaluator Round 2

- 方案: 使用 `bmenhance-cr-02-evaluator` 独立复核 reviewer Round 2 通过结论，重点核对 Round 1 两个 P1 是否已关闭、是否存在剩余必须修复项。
- 选择原因: 用户要求本轮只执行 evaluation，不执行 fixer/finalizer，不修改代码、不提交。
- 结果: Round 1 两个 P1 均确认关闭，未发现剩余 blocking 或 CR TODO；`npm test -- test/validate-command.test.ts` 通过，1 file / 15 tests passed；evaluation 写入 `3-6-code-review-evaluation-20260529-round-2.md`，后续不需要 Round 2 fixer。

### 2026-05-29 CR rules extractor

- 方案: 使用 `bmenhance-cr-04-rules-extractor` 只读分析 Story 3.6 两轮 CR summary / evaluation / fix record，提炼可复用规则并执行升格判定。
- 选择原因: 用户要求严格串行执行 CR 收尾链路；该 skill 默认 `analysis-only`，未获得明确全局文档或规则总结写入确认时不得写入。
- 结果: 识别 2 条候选规则：`issueCounts` 必须在 public projection 边界从最终 sorted issues 派生；`ValidationIssue.affectedPath` 必须使用 project-relative POSIX / redaction-safe guard 并作为 normalized sorting key。两条均已在 Round 1 fixer 中关闭，且 `CONTEXT.md` / planning artifacts 已覆盖核心契约；本轮不更新全局文档，不写 `cr-rules-summary.md`，无交接给 TODO Tracker 的未解决项。

### 2026-05-29 CR TODO tracker

- 方案: 使用 `bmenhance-cr-05-todo-tracker` 检查 Story 3.6 CR 文件中是否存在可延迟的非阻塞改进项，并核对现有 `cr-todo-backlog.md` open 项是否匹配当前 Story。
- 选择原因: Round 2 evaluator 明确无新增 CR TODO；04 rules extractor 也未交接未解决项，仍需按收尾链路完成 TODO tracker 门禁。
- 结果: Story 3.6 CR 文件无新增非阻塞待办；现有 TODO-001 / TODO-002 不匹配本次 Story 3.6 触及范围。本轮不新增、不更新 `cr-todo-backlog.md`。

### 2026-05-29 CR finalizer

- 方案: 使用 `bmenhance-cr-06-finalizer` 验证最新 CR evaluation 通过后，将 Story 3.6 与 sprint tracking 状态同步为 done。
- 选择原因: Round 2 evaluator 已确认 CR 通过且无需 fixer；用户明确要求如果 Epic 3 全部 stories 都 done，也同步 Epic 3 主状态。
- 结果: Story 文件状态已从 `review` 更新为 `done`；`sprint-status.yaml` 中 `3-6-validation-progress-category-coverage-and-local-determinism` 已更新为 `done`，Epic 3 主状态已更新为 `done`；`bmm-workflow-status.yaml` 不存在，按 skill 跳过。
