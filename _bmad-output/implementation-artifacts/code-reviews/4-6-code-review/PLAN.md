# Story 4.6 开发计划

更新时间：2026-06-01 14:20 CST

## Scope（范围）

- 触发形式：`/bmad-dev-story story 4-6`。
- 仅执行 Story 4.6 dev step，不启动 reviewer、evaluator、fixer、rules、todo 或 finalizer。
- 允许修改 Story 4.6 所需源码、测试、Story 文件、`sprint-status.yaml` 与本目录进度文件。
- 保留当前工作树中既有无关改动，不回滚、不清理、不格式化无关文件。

## Current Plan（当前计划）

1. 已完成：读取 `bmad-dev-story` workflow、`sprint-status.yaml` 和 Story 4.6 全文。
2. 已完成：将 `sprint-status.yaml` 中 Story 4.6 从 `ready-for-dev` 推进到 `in-progress`。
3. 已完成：重新确认前序 Epic 4 anchors、当前源码形态和测试入口。
4. 已完成：按 Story 任务顺序实现 `speclite update --repair` command mode、repair planner、授权/应用语义、public JSON 与 Evidence profile 输出。
5. 已完成：为 planner、apply、command JSON、human-readable output 和 deterministic ordering 添加 focused Vitest tests。
6. 已完成：运行 focused tests、`npm run build`、`npm test` 和 `git diff --check`。
7. 已完成：更新 Story 4.6 的 Tasks/Subtasks、Dev Agent Record、File List、Change Log、Status，并把 `sprint-status.yaml` 推进到 `review`。

## Decisions（决策记录）

- 采用保守默认：先消费前序 Story 4.1-4.5 已存在 anchors；若 anchor 已在工作树中存在，则在其上扩展，不重建私有模型。
- repair 未授权状态保持真实 `repairPlan.actions[]`，`changedPaths` / `skippedPaths` 保持空数组，不用 `skip:not-authorized` 表示。
- path-level conflicts 只进入 `data.conflicts`；`issues[]` 只输出一个 command-level `update.conflicts`。
- 保守实现 `regenerate`：仅对 `_speclite` metadata/control/runtime 类 installer-owned entries 生成；sourceRef 必须能读取到本地 candidate bytes 并先计算 `expectedHash`。缺少 source evidence 时保持 `missing-source-evidence` conflict。
- Authorized repair 只在 `--yes` 且无 blocking conflicts 时进入 apply，并复用 `safeWriteFile` 的 existing-file baseline 校验；partial failure 通过 issue details 暴露 completed/failed/pending/changed/manualAction，不声明 rollback。
- IDE mirror package repair 采用 adapter registry canonical order（`claude`、`agents`）生成 package-level `restore-canonical` plan；输出层排序仍按 public contract 的 normalized affected path 排序。

## Reviewer Round 1（审查第 1 轮）

- 触发形式：`/bmenhance-cr-01-reviewer 4-6`。
- 仅执行 reviewer 步骤；不启动 evaluator、fixer、finalizer，不提交 git。
- 写入边界仅限本目录 reviewer 输出与 `PLAN.md` / `EXPERIMENTS.md` / `EXPERIMENT_NOTES.md`。
- `Agent` 子工具在当前环境不可用，按 reviewer skill 降级策略改为当前上下文单一审查，并在 summary 中标注降级。
- 审查范围：Story 4.6 AC/Tasks、`src/commands/update.ts`、`src/update/update-plan.ts`、`src/diagnostics/output.ts`、`test/update-command.test.ts`、`test/update-planning.test.ts` 及相关前序 safe-write / operation-lock / schema anchors。
- 结论：不通过；发现 1 个 `patch` 桶问题，需修复后进入 evaluator/fixer 链路。

## Evaluator Round 1（评估第 1 轮）

- 触发形式：`/bmenhance-cr-02-evaluator 4-6`。
- 仅执行 evaluator 步骤；不启动 fixer、reviewer、finalizer，不提交 git。
- 写入边界仅限本目录 evaluation 输出与 `PLAN.md` / `EXPERIMENTS.md` / `EXPERIMENT_NOTES.md`。
- 评估对象：`4-6-code-review-summary-20260601-round-1.md`。
- 评估重点：核对 reviewer 唯一 patch finding 是否由 Story 4.6 AC/Tasks 和当前代码支持，尤其是 IDE mirror package 级 `expectedHash` 是否要求处理目标包内额外 canonical-hash 文件或至少不能 success。
- 结论：reviewer finding 确认有效；本轮不通过，需修复 1 项，可忽略 0 项，待讨论 0 项，CR TODO 0 项。
- 修复边界：仅限 IDE mirror package 级 `restore-canonical` 的 installer-owned canonical-hash drift；不得扩大到 human-owned、workflow-owned、unknown ownership 或 protected boundaries。

## Fixer Round 1（修复第 1 轮）

- 触发形式：`/bmenhance-cr-03-fixer 4-6`。
- 仅执行 fixer 步骤；未启动 reviewer、evaluator、finalizer，未提交 git。
- 修复依据：`4-6-code-review-evaluation-20260601-round-1.md` 中唯一确认需修复项。
- 修复计划：为 IDE mirror package 级 `restore-canonical` 处理 target package 中 source 不存在但仍参与 canonical package hash 的额外文件，并在 apply 后复算 target package hash，避免 misleading success。
- 已完成：在 `test/update-planning.test.ts` 增加 focused regression，覆盖 `.agents/skills/<skill>/references/obsolete.md` 这类 target-only canonical-hash 文件。
- 已完成：在 `src/update/update-plan.ts` 的 IDE mirror repair apply 路径中删除 target-only canonical-hash 文件、记录 changed path，并增加 post-apply `expectedHash` 校验；若删除失败或 hash 不匹配，返回 blocking issue。
- 未修改：`src/commands/update.ts`、`test/update-command.test.ts`；现有 command result 路径已能承接 apply blocking issue，无需扩大改动。

## Reviewer Round 2（审查第 2 轮）

- 触发形式：`/bmenhance-cr-01-reviewer 4-6`。
- 仅执行 reviewer 步骤；不启动 evaluator、fixer、finalizer，不提交 git。
- 写入边界仅限本目录 reviewer 输出与 `PLAN.md` / `EXPERIMENTS.md` / `EXPERIMENT_NOTES.md`。
- `Agent` 子工具在当前环境不可用，按 reviewer skill 降级策略由当前上下文串行完成 Blind Hunter / Edge Case Hunter / Acceptance Auditor 三个视角，并在 summary 中标注降级。
- 复审重点：第一轮唯一 `patch` 是否修复；extra canonical-hash file 删除范围是否限于 IDE mirror package-level `restore-canonical`；`update.repair-postcondition` 是否破坏 public schema/output；Story 4.6 AC/Tasks 是否仍满足且无 Story 4.7/其他范围 creep。
- 本轮只读核查源码与测试；未运行会产生构建输出或临时项目写入的 build/test，采用 fixer 记录的验证结果，并重跑 `git diff --check`。
- 结论：通过；未发现新的阻塞项或中高优先级问题。

## Evaluator Round 2（评估第 2 轮）

- 触发形式：`/bmenhance-cr-02-evaluator 4-6`。
- 仅执行 evaluator 步骤；不启动 fixer、reviewer、finalizer，不提交 git。
- 写入边界仅限本目录 evaluation 输出与 `PLAN.md` / `EXPERIMENTS.md` / `EXPERIMENT_NOTES.md`。
- 评估对象：`4-6-code-review-summary-20260601-round-2.md`。
- 评估重点：核对 Round 2 reviewer 通过结论是否可信，确认 Round 1 patch 是否已按 evaluation 边界修复，且未扩大到 human/workflow/unknown/protected 文件。
- 结论：通过；需修复 0 项，可忽略 0 项，待讨论 0 项，CR TODO 0 项。本轮未修改源码、Story 或 `sprint-status.yaml`。

## Rules Extractor 04（规则提炼）

- 触发形式：CR 通过后的收尾流程第 1 步，严格只执行 `bmenhance-cr-04-rules-extractor`，未启动 05/06 或其他 CR skill。
- 执行模式：采用 skill 保守默认 `analysis-only`；仅分析 Story 4.6 的 CR 历史，不修改 `cr-rules-summary.md` 或全局文档。
- 输入记录：`4-6-code-review-summary-20260601-round-1.md`、`4-6-code-review-evaluation-20260601-round-1.md`、`4-6-code-review-summary-20260601-round-2.md`、`4-6-code-review-evaluation-20260601-round-2.md`。
- 规则候选：IDE mirror package 级 `restore-canonical` apply 后必须验证 `expectedHash`，并处理 target-only canonical-hash 文件，避免 misleading success。
- 升格判定：硬性门槛中“不重复”不足。既有 `cr-rules-summary.md` 已有 canonical hash walker include 边界、protected ownership、source evidence fail-closed、partial progress 等相近规则；规划文档也已有 `update --repair` repair plan 必须列出 `expected hash` 的契约。
- 结论：不新增或更新 CR rules；不交给 05 TODO Tracker；无全局文档更新建议。

## TODO Tracker 05（待办追踪）

- 触发形式：CR 通过后的收尾流程第 2 步，严格在 04 完成后执行 `bmenhance-cr-05-todo-tracker`，未启动 06 或其他 CR skill。
- 执行模式：对 Story 4.6 CR 文件执行 extract/check；只管理 TODO backlog 文档，不修改源码。
- 提取结果：Round 1/2 reviewer 与 evaluator 均显示 `CR TODO 0` 或 Non-Blocking Follow-Ups 无；未发现可新增到 `cr-todo-backlog.md` 的 Story 4.6 非阻塞项。
- Backlog 核对：现有 open 项为 TODO-001、TODO-002、TODO-003；TODO-003 涉及 `test/update-command.test.ts` / `test/update-planning.test.ts`，但建议时机是 Epic 6 release confidence / 测试稳定性治理，Story 4.6 本次未处理该治理项，故不标记 resolved。
- 结论：不新增、不更新、不关闭 CR TODO；`cr-todo-backlog.md` 保持不变。

## Finalizer 06（状态收尾）

- 触发形式：CR 通过后的收尾流程第 3 步，严格在 05 完成后执行 `bmenhance-cr-06-finalizer`。
- CR 审批确认：最新 evaluation 文件为 `4-6-code-review-evaluation-20260601-round-2.md`，结论“通过”，需修复 0、可忽略 0、待讨论 0、CR TODO 0。
- Story 状态变更：`_bmad-output/implementation-artifacts/stories/4-6-explicit-repair-for-recoverable-installer-owned-drift.md` 从 `Status: review` 更新为 `Status: done`。
- Sprint 状态变更：`sprint-status.yaml` 中 `4-6-explicit-repair-for-recoverable-installer-owned-drift` 从 `review` 更新为 `done`，并更新 `last_updated` 为 `2026-06-01 14:20 CST`。
- Workflow 状态：`_bmad-output/planning-artifacts/bmm-workflow-status.yaml` 不存在，按 skill 容错跳过并记录；不创建新文件。
- Epic 4 状态：更新 4-6 后，4-1 到 4-6 均为 `done`；根据 `sprint-status.yaml` 的 Epic 状态定义“All stories in epic completed”，并按用户本次授权“需要决策则采用保守默认并记录”，同步将 `epic-4` 从 `in-progress` 更新为 `done`。
