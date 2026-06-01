# Story 5.5 开发与 CR 闭环计划

更新时间：2026-06-01 23:27 CST

## Scope（范围）

- 目标 Story：`5-5-sourcedescriptor-trust-status-and-redacted-reporting`。
- 前置状态：Story 5.1、5.2、5.3、5.4 已完成 dev、CR 循环、04/05/06 收尾，并在 `sprint-status.yaml` 中置为 `done`；Story 5.5 当前为 `ready-for-dev`；Epic 5 保持 `in-progress`。
- 触发形式：`/bmad-dev-story story 5-5`，随后按 `/bmenhance-cr-01-reviewer 5-5`、`/bmenhance-cr-02-evaluator 5-5`、`/bmenhance-cr-03-fixer 5-5` 循环，直到 reviewer 和 evaluator 均通过。
- CR 通过后严格依次执行 `bmenhance-cr-04-rules-extractor`、`bmenhance-cr-05-todo-tracker`、`bmenhance-cr-06-finalizer`。
- 每个步骤使用全新的 GPT-5.5 sub agent；任何步骤都必须等待前一步完成后再启动。
- 允许修改范围由对应 skill 和 Story 5.5 决定；保留当前工作树已有无关 dirty / untracked 文件，不回滚、不清理、不格式化无关范围。

## Current Plan（当前计划）

1. 已完成：读取 `sprint-status.yaml`，确认 Story 5.1-5.4 为 `done`，Story 5.5 为 `ready-for-dev`。
2. 已完成：读取 Story 5.5 文件 `_bmad-output/implementation-artifacts/stories/5-5-sourcedescriptor-trust-status-and-redacted-reporting.md`。
3. 已完成：创建本目录并初始化 `PLAN.md`、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md`。
4. 已完成：fresh dev-story sub agent 按 `/bmad-dev-story story 5-5` 完成开发，Story 状态进入 `review`。
5. 已完成：Round 1 reviewer 按 `/bmenhance-cr-01-reviewer 5-5` 执行；Agent 调度工具不可用，已按 skill fallback 串行执行 Blind Hunter、Edge Case Hunter、Acceptance Auditor；结论不通过，发现 1 个 `patch`。
6. 已完成：Round 1 evaluator 按 `/bmenhance-cr-02-evaluator 5-5` 执行；确认 reviewer 的 1 个 `patch` 发现有效，评估为 P1 阻塞 AC4，需要 fixer 修复。
7. 已完成：Round 1 fixer 按 `/bmenhance-cr-03-fixer 5-5` 执行；只修 evaluator 确认的 1 个 P1，补 `InstallPlanSchema` 已授权 blocked plan invariant、`applyInstallPlan` 获取 lock 前 blocked runtime gate 和定向测试。
8. 已完成：Round 2 reviewer 按 `/bmenhance-cr-01-reviewer 5-5` 执行复检；Agent 调度工具不可用，已按 skill fallback 串行执行三层审查。Round 1 P1 已修复，但发现 1 个新的低优先级 `patch`：`writeAuthorized=false` 的 apply failure 分支缺少 `changedPaths`。
9. 已完成：Round 2 evaluator 按 `/bmenhance-cr-02-evaluator 5-5` 执行只读评估；确认 reviewer 新发现有效，评估为需修复项，不转 CR TODO。
10. 已完成：Round 2 fixer 按 `/bmenhance-cr-03-fixer 5-5` 执行；只修 evaluator 确认的 1 个 P1，在 `writeAuthorized=false` early return 补 `changedPaths: []`，并补 direct `applyInstallPlan` regression。
11. 已完成：Round 3 reviewer 按 `/bmenhance-cr-01-reviewer 5-5` 执行复检；Agent 调度工具不可用，已按 skill fallback 串行执行三层审查。Round 1 / Round 2 P1 均保持已修复；focused tests、全量测试和 build 通过；补充 `npx tsc --noEmit` 仍失败，并在 touched files 中发现 1 个低优先级 `patch`。
12. 已完成：Round 3 evaluator 按 `/bmenhance-cr-02-evaluator 5-5` 执行只读评估；确认 touched-file `tsc --noEmit` 诊断有效，应进入 fixer 最小清理，不转 CR TODO。
13. 已完成：Round 3 fixer 按 `/bmenhance-cr-03-fixer 5-5` 只修 evaluator 确认的 1 个 P1；清理 `runtime-structure` optional details 访问与两个 direct apply descriptor mutable typing，不扩大到全仓既有 typecheck 债务。
14. 已完成：Round 4 reviewer 按 `/bmenhance-cr-01-reviewer 5-5` 执行复检；Agent 调度工具不可用，已按 skill fallback 串行执行三层审查。Round 1 / Round 2 / Round 3 修复均保持有效；focused tests、Story 5.5 suite、全量测试和 build 通过；补充 `npx tsc --noEmit --pretty false` 仍失败，并在 `src/ide/target-writer.ts` 发现 1 个 Story 5.5 touched-file 相关低优先级 `patch`。
15. 已完成：Round 4 evaluator 按 `/bmenhance-cr-02-evaluator 5-5` 执行只读评估；确认 `src/ide/target-writer.ts(92,47)` optional callback 显式 `undefined` 诊断有效，应进入 fixer 最小清理，不转 CR TODO。
16. 已完成：Round 4 fixer 按 `/bmenhance-cr-03-fixer 5-5` 执行；只修 evaluator 确认的 1 个 P1，在 `writeIdeMirrors` 调用 `copyCanonicalPackage` 时条件传入 optional `onChangedPath`，不修改 public type 或全仓既有 typecheck 债务。
17. 已完成：Round 5 reviewer 按 `/bmenhance-cr-01-reviewer 5-5` 执行复检；Agent 调度工具不可用，已按 skill fallback 串行执行三层审查。Round 1 / Round 2 / Round 3 / Round 4 修复均保持有效；focused tests、Story 5.5 suite、全量测试和 build 通过；补充 `npx tsc --noEmit --pretty false` 仍失败，目标三文件过滤已清零，但更宽的 Story 5.5 validation/test touched surface 仍有相关低优先级 `patch`。
18. 已完成：Round 5 evaluator 按 `/bmenhance-cr-02-evaluator 5-5` 执行只读评估；确认 validation/test touched-surface typecheck 新发现有效，应进入 fixer 最小清理，不转 CR TODO。
19. 已完成：Round 5 fixer 按 `/bmenhance-cr-03-fixer 5-5` 只修 evaluator 确认的 1 个 P1；完成 `validate-project.ts` manifest 显式窄化、Git test mock `verifyCommit` 补齐、`validate-command.test.ts` 稳定取 `outputs[0]`，并记录验证结果。
20. 已完成：Round 6 reviewer 按 `/bmenhance-cr-01-reviewer 5-5` 执行复检；Round 1-5 修复均未回退，focused tests、Story 5.5 suite、全量测试、build 和相关 whitespace check 通过；补充 `tsc` 仍因全仓既有债务失败，但 Story 5.5 touched surface 过滤无输出。Reviewer 结论通过，四桶均为 0。
21. 已完成：Round 6 evaluator 按 `/bmenhance-cr-02-evaluator 5-5` 执行只读评估；确认 reviewer 通过结论成立，需修复项 0，CR TODO 0，允许进入 04/05/06 收尾。
22. 已完成：`bmenhance-cr-04-rules-extractor 5-5` 按用户授权执行 record-only；仅更新 `cr-rules-summary.md`，新增 `CR-API-26` 与 `CR-PROCESS-01` 两条规则总结，不修改全局项目文档，不新增 TODO。
23. 已完成：`bmenhance-cr-05-todo-tracker 5-5`；按 Round 6 evaluator 的 CR TODO 0 结论不新增 TODO，并将 Story 5.5 已修复的 `TODO-004` 从 Open 移至 Resolved，解决记录注明 Story 5.5 / CR round 6 approved / 本地尚未提交 commit。
24. 已完成：`bmenhance-cr-06-finalizer 5-5`；验证 Round 6 evaluator pass 后，将 Story 5.5 状态置为 `done`，将 `sprint-status.yaml` 中 Story 5.5 置为 `done`。检测到 Epic 5 下 Story 5.1-5.5 均为 `done`，按用户授权默认推荐决策将 `epic-5` 同步为 `done`。`bmm-workflow-status.yaml` 不存在，按 skill 容错跳过。
25. 已完成：最终核对。Story 文件为 `Status: done`；`sprint-status.yaml` 中 Epic 5 与 Story 5.1-5.5 均为 `done`；`TODO-004` 为 `resolved`；相关 tracked 文档 `git diff --check` 无输出；untracked 5-5 进度文件 no-index whitespace check 无输出。

## Decisions（决策记录）

- 采用保守默认：Story 5.5 负责 Epic 5 SourceDescriptor / trustStatus / redacted reporting 收口；不得提前实现 Epic 6 full fixture matrix、complete source lockfile lifecycle、enterprise allowlist/signatures/provenance、Post-MVP `doctor` / `sync` / `uninstall`、top-level `repair`、backup/restore 或 standalone report artifact。
- Story 5.5 必须消费并复核 Story 5.1-5.4 的 source selection、registry/local/Git evidence、redaction、validate/status no-network 和 trust/evidence patterns；不得伪造前序成功状态。
- Story 5.4 留下 `TODO-004`：confirmed Git install human output `confirmationState=pending`，当前是 open P2 CR TODO；Story 5.5 如涉及 reporting/human output，可按自身范围决定是否修复或保持 backlog。
- 当前工作树已有大量非本 Story 改动；本流程不使用 `git add -A`，提交阶段只按相关 Story 分组白名单添加。
- 裸 `python3 _bmad/scripts/resolve_customization.py ...` 因 `tomllib` 缺失失败；按 Story 约束使用 `python3.12` fallback 成功解析 `bmad-dev-story` workflow。
- `TODO-004`（confirmed Git install human output `confirmationState=pending`）属于本 Story reporting/human summary 范围，已通过 Source block confirmation projection 修复；resolved Git install human output 现在显示 `confirmationState=confirmed`。
- Round 1 evaluator 决定：reviewer 发现有效且阻塞 AC4；最小修复边界应同时覆盖 `InstallPlanSchema.superRefine` 的已授权 blocked plan invariant 与 `applyInstallPlan` 获取 operation lock 前的 runtime gate，返回 redacted `source-integrity.blocked-source`，确保 no lock/no write。
- Round 1 fixer 执行决策：不扩大到 resolver 重写、update 已有 gate、Epic 6 fixture matrix 或 source lock lifecycle；blocked apply failure 的 public details 只保留 `reason` 与 `sourceType`，避免输出 resolvedRoot/raw URL/local absolute/cache/temp/staging path/raw stderr/stack trace。
- Round 2 reviewer 决定：Round 1 P1 视为已修复；新发现的 `writeAuthorized=false` apply failure result shape 缺口不影响 blocked source no-lock/no-write 修复，但属于导出 runtime write boundary API 的低优先级 `patch`，建议 evaluator 独立裁决。
- Round 2 evaluator 决定：该 `patch` 有效且需修复；原因是 `ApplyInstallPlanResult` failure contract 要求 `changedPaths`，`src/commands/install.ts` failure caller 已读取 `applyResult.changedPaths.length`。虽然 CLI 未授权 install 通常在 apply 前停止，但 direct exported API / future reuse 会得到不完整 failure shape；最小修复仅限未授权 early return 补 `changedPaths: []` 和 direct regression，不产生 CR TODO。
- Round 2 fixer 执行决策：只在 `src/installer/runtime-structure.ts` 的 `writeAuthorized=false` early return 补 `changedPaths: []`，并只在 `test/runtime-structure.test.ts` 增加 direct `applyInstallPlan` regression；不触碰 resolver、install/update command flow、Epic 6 fixture matrix 或 source lock lifecycle。
- Round 3 reviewer 决定：Round 1 blocked source gate 与 Round 2 unauthorized failure shape 均有效，测试/build 通过；但 `npx tsc --noEmit` 在 touched files 中仍有相关诊断，包括 `addPartialFailureChangedPaths` 对 optional `issue.details` 的访问和新增 direct tests 的 readonly descriptor 推导。该项标为低优先级 `patch`，建议 evaluator 裁决，不扩大到全仓既有类型债务。
- Round 3 evaluator 决定：该 `patch` 有效且需修复，不转 CR TODO。裁决只针对 touched files 诊断：`ValidationIssue.details` 为 optional，`addPartialFailureChangedPaths` 直接访问 `issue.details.manualAction` 会让 partial failure structured result 存在 thrown error 风险；两个 direct apply regression 的 `as const` 让 `integrityEvidence: []` 推导为 readonly tuple。最小修复仅限 `src/installer/runtime-structure.ts` 与 `test/runtime-structure.test.ts`，不得清理全仓既有 `npx tsc --noEmit` 债务。
- Round 3 fixer 执行决策：只修 Round 3 evaluator 确认的 touched-file type diagnostics。`addPartialFailureChangedPaths` 使用局部 `details = issue.details ?? {}` 保持 optional details 安全；两个 direct apply descriptor 显式声明为 `SourceDescriptor`，避免 readonly tuple 与 widened string 推导，同时不改变测试断言。
- Round 4 reviewer 决定：Round 3 原始评估点已修复，但 touched-file typecheck 复核仍发现 `src/ide/target-writer.ts(92,47)` 的 `exactOptionalPropertyTypes` 诊断。该文件的 `onChangedPath` tracking 属于 Story 5.5 changed-path reporting 相关 touched surface；标为低优先级 `patch`，建议 evaluator 裁决，且不得扩大到全仓既有类型债务。
- Round 4 evaluator 决定：该 `patch` 有效且需修复，不转 CR TODO。裁决只针对 Story 5.5 touched surface：`writeIdeMirrors` 输入和 `copyCanonicalPackage` 输入都将 `onChangedPath` 定义为 optional callback，但当前调用对象显式传入可能为 `undefined` 的属性，在 `exactOptionalPropertyTypes: true` 下构成 TS2379。最小修复仅限 `src/ide/target-writer.ts` 调用 `copyCanonicalPackage` 时条件传入 `onChangedPath`；不得扩大到 public type、resolver、install/update flow、Epic 6 fixture matrix、source lock lifecycle、Story 文档或全仓既有 `tsc` 债务。
- Round 4 fixer 执行决策：只改 `src/ide/target-writer.ts` 的调用对象，使用 `...(input.onChangedPath !== undefined ? { onChangedPath: input.onChangedPath } : {})`，保持 callback 存在时的 changed-path tracking 行为，callback 缺席时让 optional property 真正缺席。
- Round 5 reviewer 决定：Round 4 optional callback 修复有效，目标三文件过滤 `src/ide/target-writer.ts`、`src/installer/runtime-structure.ts`、`test/runtime-structure.test.ts` 已清零；但按用户要求扩大到 Story 5.5 source/diagnostics/validation/test touched surface 后，`npx tsc --noEmit --pretty false` 仍输出 `src/validation/validate-project.ts`、`test/git-source-resolution.test.ts`、`test/validate-command.test.ts` 相关诊断。标为低优先级 `patch`，建议 evaluator 裁决，不扩大到全仓既有 typecheck 债务。
- Round 5 evaluator 决定：该 `patch` 有效且需修复，不转 CR TODO。裁决只针对 Story 5.5 validation/test touched surface：`validateManifestSchema` 的 `manifest` 为 optional，当前 guard 未显式窄化就传给 runtime/artifact/file/source integrity rules；两个 Git test mock 缺少当前 `GitClient` 必需的 `verifyCommit`；`validate-command.test.ts` 直接把可能为 `undefined` 的 `outputs[0]` 传给 JSON renderer。最小修复边界限 `src/validation/validate-project.ts`、`test/git-source-resolution.test.ts`、`test/validate-command.test.ts`，不得扩大到全仓既有 `tsc` 债务、resolver 重写、install/update flow、Epic 6 fixture matrix、source lock lifecycle、Story 文档或 finalizer。
- Round 5 fixer 执行决策：只修 Round 5 evaluator 确认的 touched-surface type diagnostics。`validateProject` 使用局部 `manifest` 并纳入现有 guard，后续 runtime paths / artifact paths / file integrity / source integrity 均消费该局部变量；两个 affected Git mock 仅补类型必需的 `verifyCommit` stub；`validate-command.test.ts` 使用既有非空取值风格，不改 renderer public type 或 command result schema。
- Round 6 reviewer 决定：Round 1-5 修复均有效，且 Story 5.5 touched surface 在 `npx tsc --noEmit --pretty false --noErrorTruncation` 过滤下已无输出；全仓 `tsc` 仍失败但属于既有类型债务，不作为本 Story 阻塞项。未发现新的 `decision_needed`、`patch`、`defer` 或 `dismiss` 项，建议进入 evaluator 复核通过结论。
- Round 6 evaluator 决定：reviewer 通过结论成立。Round 1-5 修复锚点均未回退，Story 5.5 touched surface `tsc` 过滤无输出；全仓 `tsc` 退出码 2 仍归类为既有类型债务。需修复项 0，CR TODO 0；允许按严格串行进入 04/05/06 收尾，不启动 fixer。
- 04 rules-extractor 决定：采用用户授权的默认推荐 record-only，不修改全局文档。新增 `CR-API-26` 沉淀 blocked `SourceDescriptor` 在 schema/runtime 写入边界双层 fail closed；新增 `CR-PROCESS-01` 沉淀全仓 typecheck 既有债务下用 Story touched surface 过滤裁决的 CR 流程规则。Round 2-5 其它细项已由既有规则或局部修复覆盖，不单独新增 TODO。
- 05 todo-tracker 决定：Round 6 evaluator 明确 CR TODO 0，因此不新增任何无依据 TODO；`TODO-004` 与 Story 5.5 human output reporting 修复范围匹配，按默认推荐决策标记为 resolved。
- 06 finalizer 决定：`bmm-workflow-status.yaml` 不存在不阻塞收尾；Epic 5 所有 Story 均为 `done` 后，按用户授权默认推荐决策同步 `epic-5: done`，并记录该联动。
