# Story 5.3 开发与 CR 闭环计划

更新时间：2026-06-01 17:18 CST

## Scope（范围）

- 目标 Story：`5-3-local-tarball-offline-bundle-and-local-path-integrity`。
- 前置状态：Story 5.1 与 5.2 已完成 dev、CR 循环、04/05/06 收尾，并在 `sprint-status.yaml` 中置为 `done`；Epic 5 保持 `in-progress`。
- 触发形式：`/bmad-dev-story story 5-3`，随后按 `/bmenhance-cr-01-reviewer 5-3`、`/bmenhance-cr-02-evaluator 5-3`、`/bmenhance-cr-03-fixer 5-3` 循环，直到 reviewer 和 evaluator 均通过。
- CR 通过后严格依次执行 `bmenhance-cr-04-rules-extractor`、`bmenhance-cr-05-todo-tracker`、`bmenhance-cr-06-finalizer`。
- 每个步骤使用全新的 GPT-5.5 sub agent；任何步骤都必须等待前一步完成后再启动。
- 允许修改范围由对应 skill 和 Story 5.3 决定；保留当前工作树已有无关 dirty / untracked 文件，不回滚、不清理、不格式化无关范围。

## Current Plan（当前计划）

1. 已完成：读取 Story 5.3 全文和 `sprint-status.yaml`。
2. 已完成：确认 Story 5.3 当前为 `ready-for-dev`，且 5.1/5.2 已为 `done`。
3. 已完成：创建本目录并初始化 `PLAN.md`、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md`。
4. 已完成：fresh sub agent 已按 `/bmad-dev-story story 5-3` 启动；`sprint-status.yaml` 已将 Story 5.3 标记为 `in-progress`。
5. 已完成：按 Story 5.3 Tasks 顺序执行 RED/GREEN/REFACTOR；local tarball、offline bundle、local path、validate/status no-access 和 fixture assertions 已完成。
6. 已完成：fresh reviewer 按 `/bmenhance-cr-01-reviewer 5-3` 执行 Round 1；Agent 调度不可用，已降级为当前 reviewer 串行三层审查。
7. 已完成：fresh evaluator 按 `/bmenhance-cr-02-evaluator 5-3` 执行 Round 1；确认 reviewer 的 1 个 `patch` 阻塞项有效，评估为 P1 必须修复。
8. 已完成：fresh fixer 按 `/bmenhance-cr-03-fixer 5-3` 执行 Round 1 P1 最小修复；local canonical source tree 已贯穿 module discovery、copy、hash 与 indexes，tarball/offline bundle 无 canonical tree handle 时已阻塞写入。
9. 已完成：按 `/bmenhance-cr-01-reviewer 5-3` 执行 Round 2 复检；当前 Agent 调度工具不可用，按 skill fallback 在本 reviewer 中串行执行 Blind Hunter、Edge Case Hunter、Acceptance Auditor 三层审查。
10. 已完成：按 `/bmenhance-cr-02-evaluator 5-3` 执行 Round 2 评估；确认 reviewer 的“通过、四桶全 0”成立，Round 1 P1 已真实修复，本轮需要修复 0、可忽略 0、CR TODO 0。
11. 已完成：按 `bmenhance-cr-04-rules-extractor` 执行规则提炼；新增 `CR-API-23`，采用默认推荐 record-only 写入 `cr-rules-summary.md`，不修改全局文档，不交接 TODO 候选。
12. 已完成：按 `bmenhance-cr-05-todo-tracker` 检查 CR TODO；Round 2 evaluator 明确 CR TODO 0，04 无交接候选，既有 backlog 与 Story 5.3 无匹配 open item，因此未修改 `cr-todo-backlog.md`。
13. 已完成：按 `bmenhance-cr-06-finalizer` 完成 Story 5.3 状态收尾；Story 文件与 `sprint-status.yaml` 均置为 `done`，`bmm-workflow-status.yaml` 不存在，按既有容错记录 skipped；Epic 5 仍有 5.4/5.5 未完成，保持 `in-progress`。
14. 待执行：Story 5.3 完成后进入 Story 5.4，重复同一流程。

## Decisions（决策记录）

- 采用保守默认：Story 5.3 只能解除 `local-tarball`、`offline-bundle` 和 `local` 三个 source type 的 unsupported boundary；不得提前实现 Story 5.4 Git pinning、Story 5.5 full trust reporting、Epic 6 fixture matrix 或 Post-MVP commands。
- Story 5.3 必须继承 Story 5.1 source selection / redaction / no access-no write 边界，以及 Story 5.2 trust/evidence/validate local-only discipline。
- Local artifact/path tests 必须 deterministic、local-only，使用 temporary files、fixture source packages 或 injected filesystem/extractor；不得访问真实 network、package-manager cache 或外部 source origin。
- 当前工作树已有大量非本 Story 改动；本流程不使用 `git add -A`，提交阶段只按相关 Story 分组白名单添加。
- Round 1 fixer 保守决策：当前 MVP 不引入 tarball/offline bundle extractor 或 payload staging，因此 artifact resolver 仍只记录 raw bytes `contentHash`；安装阶段只有 `local` canonical source tree 可继续，artifact source 必须以 `source-integrity.unsupported-source` 阻塞。
- Round 2 reviewer 只做复检：重点确认 Round 1 P1 是否已修复、private local canonical root 是否未泄露、tarball/offline 是否阻塞且 artifact `contentHash` 仍为 raw bytes hash；不得执行 evaluator、fixer、finalizer 或提交。
- Round 2 evaluator 裁决：Round 2 reviewer 通过结论成立；local canonical root 贯穿 install，private root 未泄露，tarball/offline 无 canonical tree handle 时稳定阻塞，artifact `contentHash` 保持 raw bytes hash。本轮无阻塞修复、无可忽略误报、无 CR TODO。
- 04 rules extractor 裁决：`Source evidence 必须驱动实际 install input，否则写入前阻塞` 硬性门槛通过，量化评分 10/12；因 owning SPEC 已覆盖总原则，本次按默认推荐 record-only 写入 `cr-rules-summary.md` 为 `CR-API-23`，不修改全局文档，不新增 TODO。
- 05 todo tracker 裁决：不新增 TODO、不 resolve 既有 TODO；`cr-todo-backlog.md` 保持 open 3 / in-progress 0 / resolved 0。
- 06 finalizer 裁决：Round 2 evaluator 已通过；Story 5.3 从 `review` 置为 `done`，`sprint-status.yaml` 同步为 `done` 并更新 `last_updated`；`bmm-workflow-status.yaml` 不存在，记录 skipped；Epic 5 因 5.4/5.5 仍未完成，保持 `in-progress`。
