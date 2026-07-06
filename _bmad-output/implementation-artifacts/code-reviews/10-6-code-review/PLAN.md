# Story 10.6 Code Review Plan（代码审查计划）

## Objective（目标）

围绕 Epic 10 的 Story 10.6 `Public Docs And Maintainer Workflow` 执行严格串行的开发与代码审查闭环：`bmad-dev-story` -> `bmenhance-cr-01-reviewer` -> `bmenhance-cr-02-evaluator` -> 必要时 `bmenhance-cr-03-fixer` 并复审 -> `bmenhance-cr-04-rules-extractor` -> `bmenhance-cr-05-todo-tracker` -> `bmenhance-cr-06-finalizer`。

## Epic（史诗）

- 当前 Epic：Epic 10 Canonical Source Ecosystem Module Governance
- 执行顺序：
  - [x] Story 10.1：已完成 finalizer，状态 `done`
  - [x] Story 10.2：已完成 finalizer，状态 `done`
  - [x] Story 10.3：已完成 finalizer，状态 `done`
  - [x] Story 10.4：已完成 finalizer，状态 `done`
  - [x] Story 10.5：已完成 finalizer，状态 `done`
  - [x] Story 10.6：已完成 finalizer，状态 `done`

## Current Story（当前 Story）

- Story 文件：`_bmad-output/implementation-artifacts/stories/10-6-public-docs-and-maintainer-workflow.md`
- Sprint 状态：`done`
- 当前轮次：Round 5

## Execution Checklist（执行清单）

- [x] Preflight：确认 Story 10.1-10.5 已 `done`，Story 10.6 为第一个待执行 Story。
- [x] Preflight：确认 Story 10.6 code review 目录不存在，已创建。
- [x] Initialize Logs：创建 `PLAN.md`、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md`。
- [x] Development：启动 fresh sub-agent 执行 `/bmad-dev-story story 10.6`，Story 与 sprint tracker 均已进入 `review`。
- [x] Reviewer：development 完成且 Story 状态为 `review` 后启动 `bmenhance-cr-01-reviewer 10.6`，round 1 发现 2 个 `[中] patch`。
- [x] Evaluator：reviewer 完成后启动 `bmenhance-cr-02-evaluator 10.6`，round 1 确认 2 个 findings 均为 P1。
- [x] Fixer：evaluator 判定需要修复，启动 `bmenhance-cr-03-fixer 10.6`，已完成 2 个 P1 修复并追加修复记录。
- [x] Re-review：fixer 后重新 reviewer / evaluator，reviewer round 2 与 evaluator round 2 均已通过。
- [x] Rules Extractor：CR 通过后执行 `bmenhance-cr-04-rules-extractor 10.6`，已新增 2 条 CR 规则。
- [x] TODO Tracker：rules extractor 完成后执行 `bmenhance-cr-05-todo-tracker 10.6`，确认无新增 CR TODO backlog。
- [x] Finalizer：TODO tracker 完成后执行 `bmenhance-cr-06-finalizer 10.6`，Story、sprint tracker 与 `epic-10` 已同步为 `done`。
- [x] Epic Gate：Story 10.6 完全收口后执行 Epic 10 最终验证与本地提交；final verification 发现并修复 selected-module validation 与旧 fixtures 的一致性缺口，round 5 reviewer / evaluator 已通过，post-finalizer rules / TODO 补检已完成，最终验证通过并准备本地提交。

## Current Status（当前状态）

2026-07-07 00:47 CST：Story 10.6 preflight 完成。Story 10.1-10.5 均为 `done`，Story 10.6 为 `ready-for-dev`，`epic-10` 为 `in-progress`；准备启动 development sub-agent。

2026-07-07 01:02 CST：development sub-agent 完成 `/bmad-dev-story story 10.6`，Story 文件与 `sprint-status.yaml` 均更新为 `review`。下一步启动 CR reviewer round 1。

2026-07-07 01:09 CST：CR reviewer round 1 完成，结果文件为 `10-6-code-review-summary-20260707-round-1.md`，发现 2 个 `[中] patch`：SDLC skill catalog 仍列出已迁移 backend ecosystem skills、canonical governance map 未把 `ecosystems/**` 纳入 ecosystem-only 变更分类。下一步启动 evaluator round 1。

2026-07-07 01:16 CST：CR evaluator round 1 完成，结果文件为 `10-6-code-review-evaluation-20260707-round-1.md`，确认 2 个 findings 均有效且为 P1 阻塞项；同类 docs drift 扩展到 `canonical-source-layout.md` 与 `speclite-workflows.md`。下一步启动 fixer。

2026-07-07 01:27 CST：CR fixer round 1 完成，已修复 2 个 P1：移除 SDLC catalog/layout/workflow explanation 中已迁移 backend ecosystem package ids 的 SDLC roots 表述；将 `ecosystems/**` 纳入 canonical governance machine-readable classification / impact rules，并补充 focused tests。下一步启动 reviewer round 2 复审。

2026-07-07 01:33 CST：CR reviewer round 2 完成，结果文件为 `10-6-code-review-summary-20260707-round-2.md`，确认 round 1 的 2 个 P1 修复均已闭环，未发现新的 docs / catalog / governance contradiction。下一步启动 evaluator round 2。

2026-07-07 01:38 CST：CR evaluator round 2 完成，结果文件为 `10-6-code-review-evaluation-20260707-round-2.md`，确认 reviewer round 2 通过结论成立，不需要重新 fixer，允许进入 `rules extractor -> TODO tracker -> finalizer` closeout 链。

2026-07-07 01:49 CST：CR rules extractor 完成，新增 `CR-DOC-04`、`CR-API-33` 到 `cr-rules-summary.md`。下一步启动 TODO tracker。

2026-07-07 01:52 CST：CR TODO tracker 完成，确认 Story 10.6 无新增/更新 CR TODO backlog。下一步启动 finalizer。

2026-07-07 02:01 CST：Epic final verification 运行全量 `npm test` 发现 7 个失败，根因为 Story 10.5 后 `manifest-schema` selected-module validation 更严格，但旧 git/registry/governance fixtures 和 local source path matching 未同步。已修复 local-source package path matching、descriptor-only fixtures 和 governance fixture installed modules；focused regression `test/git-source-resolution.test.ts test/local-source-integrity.test.ts test/registry-source-resolution.test.ts test/governance-report-command.test.ts` 已通过，下一步启动 reviewer round 3 复审 final verification fix。

2026-07-07 02:09 CST：CR reviewer round 3 完成，结果文件为 `10-6-code-review-summary-20260707-round-3.md`，结论不通过；发现 `files-index.entries.sourceRef` 只校验未选择 ecosystem refs，未校验未选择的 `core-skills` / `sdlc-skills` refs。下一步启动 evaluator round 3。

2026-07-07 02:16 CST：CR evaluator round 3 确认 reviewer finding 有效且为 P1，已修复 `files-index.entries.sourceRef` 对 core / sdlc / ecosystem module source refs 的 selected-module 校验，并补充负向测试。下一步启动 reviewer round 4 复审。

2026-07-07 02:24 CST：CR reviewer round 4 完成，结果文件为 `10-6-code-review-summary-20260707-round-4.md`，结论不通过；发现 `skill-index` selected root completeness 可被最小合法 root 集绕过。下一步启动 evaluator round 4。

2026-07-07 02:37 CST：CR evaluator round 4 确认 finding 有效且为 P1；已完成 targeted fix：official bundled source 下启用完整 selected package root 表，补齐 frontend / other ecosystem roots，并新增最小合法 root 集绕过回归。`test/validate-command.test.ts` 与 5 文件回归组合已通过。下一步启动 reviewer round 5 复审该 P1 修复。

2026-07-07 02:45 CST：CR reviewer round 5 完成，结果文件为 `10-6-code-review-summary-20260707-round-5.md`，结论通过；确认 round 4 P1 已修复，未发现新的阻塞项。下一步启动 evaluator round 5 独立确认 reviewer 结论。

2026-07-07 02:51 CST：CR evaluator round 5 完成，结果文件为 `10-6-code-review-evaluation-20260707-round-5.md`，结论通过；确认 round 4 P1 已关闭，附加 ide-drift fixture sourceDescriptor 语义问题已关闭，当前无剩余 P1/P2，不需要 fixer。下一步补跑 rules extractor / TODO tracker，确认 finalizer 后追加 CR 是否需要新增规则或 backlog。

2026-07-07 02:59 CST：CR rules extractor 补检完成，确认 round 3 `files-index.sourceRef` 问题已被既有 `CR-API-32` 覆盖，round 4 `skill-index` root completeness 问题已被既有 `CR-API-16` 覆盖，round 5 ide-drift fixture gate 问题已被既有 `CR-TEST-02` 覆盖；无需新增或更新 CR rules。下一步补跑 TODO tracker。

2026-07-07 03:02 CST：CR TODO tracker 补检完成，确认 round 3 / round 4 都是已关闭 P1，不应降级 backlog；round 5 evaluation 明确无需新增 CR TODO，rules extractor 已确认既有规则覆盖；无需新增或更新 TODO。下一步恢复 Epic final verification。

2026-07-07 03:12 CST：Epic final verification 完成。`npm test` 通过 56 files / 425 tests，`npm run build` 通过，`npm run release:packaging-check` 顺序执行通过，`git diff --cached --check` 与 `git diff --check` 均通过。当前 worktree canonical check 因用户明确排除的 untracked `speclite-html-ppt-generator` 返回 warning；提交范围已通过 staged 临时树验证，packaging check 与 canonical source check 均为 `status=ok`、`findings=[]`，且 staged set 不包含 PPT / html-ppt 外部漂移。

2026-07-07 01:54 CST：CR finalizer 完成，Story 10.6 文件状态与 `sprint-status.yaml` 均已同步为 `done`；Story 10.6 是 Epic 10 最后一个 Story，且 Story 10.1-10.6 均为 `done`，按 `sprint-status.yaml` 规则将 `epic-10` 同步为 `done`。下一步可进入 Epic 10 最终验证，但本轮不 commit、不 push。

## Termination Criteria（终止条件）

Story 10.6 只有在以下条件全部满足后，才允许进入 Epic 10 最终验证与提交：

- Story 10.6 开发完成，Story 状态进入 `review`。
- 最新 CR reviewer 通过。
- 最新 CR evaluator 通过。
- 如有 fixer，fixer 后已重新 reviewer / evaluator 并通过。
- rules extractor、TODO tracker、finalizer 已按顺序执行。
- Story 10.6 与 `sprint-status.yaml` 状态一致。
- `PLAN.md`、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md` 已更新。
