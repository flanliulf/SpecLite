# EXPERIMENT_NOTES

## 实时笔记

- 2026-05-28: 前置核对显示 Epic 3 的 `3-6-validation-progress-category-coverage-and-local-determinism` 当前为 `ready-for-dev`。工作区已有大量既有未提交改动，执行时必须只处理当前 Story 所需范围。
- 2026-05-29: Story 3.5 已完成 CR 双通过和 finalizer，状态为 `done`。当前继续 Epic 3 最后一条 Story 3.6；本地 git commit 暂不执行，等待 Epic 3 全部 Story 完成后统一按 `git-commit-convention` 提交。
- 2026-05-29: `project-context.md` 仍是占位；实际 guardrails 以 Story 3.6、真实源码和 owning SPEC 为准。
- 2026-05-29: root `package.json`、`src/`、`test/`、`src/commands/validate.ts`、`src/validation/validate-project.ts`、diagnostics、path normalizer、adapter registry、fixture contract 均存在；`tests/` 目录不存在，当前测试目录为 `test/`。
- 2026-05-29: worktree 已有大量前序 Story / planning / assets 改动和未跟踪文件；本轮只处理 Story 3.6 相关实现、测试、进度文件、Story 文件和 `sprint-status.yaml` 对应状态。
- 2026-05-29: `source-integrity` 未新增 domain rule；human output 通过 `Not checked categories` 显示 reserved/not checked 状态，`checkedCategories` 不包含未执行类别。
- 2026-05-29: `ValidationIssue` global sort 使用 severity -> category -> affectedPath/command-level key -> issueId -> component，避免同 key 时依赖输入顺序。
- 2026-05-29: 验证结果：`npm test -- test/validate-command.test.ts` 14 passed；相关 7 文件 48 passed；`npm run build` passed；全量 `npm test` 25 files / 157 tests passed。
- 2026-05-29: CR reviewer Round 1 已完成。当前发现：`createValidateCommandResult` 未从最终 issues 派生 `issueCounts`，以及 `ValidationIssue.affectedPath` 缺少 project-relative POSIX / redaction guard；建议进入 evaluator / fixer。
- 2026-05-29: CR evaluator Round 1 已完成。独立复核确认两个 reviewer findings 均有效且阻塞交付：`issueCounts` 必须在 `createValidateCommandResult` 从最终 sorted issues 派生；`ValidationIssue.affectedPath` 必须补 project-relative POSIX / redaction guard，issue sorting 不能继续信任 raw path。当前要求进入 fixer，不执行 finalizer。
- 2026-05-29: CR reviewer Round 2 已完成。复核确认 `createValidateCommandResult` 已从 sorted issues 覆盖 `issueCounts`，`ValidationIssue.affectedPath` 已补 project-relative POSIX / redaction guard，`sortValidationIssues` 排序前校验 path sort key；focused test 15 passed、build passed、全量 test 158 passed、`git diff --check` passed。Reviewer 结论：通过，等待 Round 2 evaluator。
- 2026-05-29: CR evaluator Round 2 已完成。独立复核确认 Round 1 两个 P1 均已关闭：`src/diagnostics/command-result.ts` 从 sorted issues 派生 `issueCounts`，`ValidationIssue.affectedPath` schema/shared guard/sorting guard 已拒绝 unsafe path；`npm test -- test/validate-command.test.ts` 15 passed。Evaluation 结论：通过，无需 fixer，剩余风险为无新增阻塞项，仅保留后续 rules/todo/finalizer 流程风险。
- 2026-05-29: CR rules extractor 已完成。规则升格判定显示两条候选规则均有证据且已修复，但全局文档已覆盖 `issueCounts` 固定 key / validate 路径顺序 / issue 排序 / public JSON path contract 等核心约束；本轮保持 analysis-only，不写全局文档或 `cr-rules-summary.md`。未发现需要 05 TODO Tracker 接收的非阻塞改进项。
- 2026-05-29: CR TODO tracker 已完成。Story 3.6 Round 1 / Round 2 CR 文件均未产生非阻塞 TODO；现有 backlog 中 TODO-001（resolve parity fixtures）和 TODO-002（generatedAt ISO 8601 contract）不属于本次 Story 3.6 必处理范围。本轮不写 `cr-todo-backlog.md`。
- 2026-05-29: CR finalizer 已完成。最新 evaluation 文件 `3-6-code-review-evaluation-20260529-round-2.md` 明确 CR evaluation 通过；Story 3.6 已标记 `done`，`sprint-status.yaml` 中 Story 3.6 与 Epic 3 主状态均已同步为 `done`。`_bmad-output/planning-artifacts/bmm-workflow-status.yaml` 不存在，本轮跳过该同步项。
