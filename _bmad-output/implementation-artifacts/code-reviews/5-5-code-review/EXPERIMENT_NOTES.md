# Story 5.5 实验笔记

更新时间：2026-06-01 23:27 CST

## Notes（笔记）

- 当前 `sprint-status.yaml` 显示 `epic-5: in-progress`，Story 5.1、5.2、5.3、5.4 为 `done`，Story 5.5 为 `ready-for-dev`。
- Story 5.5 范围是 Epic 5 收口：统一 `SourceDescriptor` executable schema/parser、cross-source `trustStatus` 推导、`integrityEvidence` ordering、redacted reporting、install/status/validate summary projection、manifest/index projection、source descriptor field semantics 引用 owning SPEC，以及 focused trust/redaction/no-network tests。
- Story 5.5 明确不负责 Epic 6 full fixture matrix、complete source lockfile lifecycle、enterprise source policy、allowlists、signatures、provenance verification、Post-MVP `doctor`/`sync`/`uninstall`、top-level `repair`、backup/restore 或 standalone update report artifact。
- Story 5.1-5.4 已建立 source selection、registry evidence、local artifact/path evidence、Git commit evidence、floating Git rejection、redaction 和 validate/status no-network patterns；Story 5.5 必须复用并统一，不重新定义第二套 trust/evidence 规则。
- Story 5.4 留下 `TODO-004`：confirmed Git install human output `confirmationState=pending`。因为 Story 5.5 涉及 redacted reporting / human summary，dev-story 需要显式判断是否在本 Story 范围内修复，或继续作为 backlog 保留并记录理由。
- 当前工作树已有大量无关 dirty/untracked 文件；后续必须逐文件核对，不回滚、不清理。
- 本次 dev-story workflow 解析已验证：裸 `python3` 缺 `tomllib` 失败，`python3.12` fallback 成功。后续 resolver / BMad 脚本优先使用 `python3.12`。
- `git status --short` 显示既有 dirty 包含旧 CR 目录、Story 1/2/5 文档、planning artifacts、assets/source、现有 source/validation 实现和 tests；本 Story 只处理 5-5 必需文件，避免扩大到无关脏改。
- 已新增 central trust evaluator：`src/source/source-trust.ts`。Registry/local/Git/bundled resolver 仅消费 evidence/failure facts 后调用该入口，不在 reporter 或 validate 中重新定义 trust matrix。
- Bundled source 的 `package-lock.json` evidence 现在作为 verified package lock match trust anchor；缺失 package evidence 继续输出 `source-integrity.missing-evidence` 与 `trustStatus=blocked`。
- `TODO-004` 已修复：因为 Story 5.5 明确涉及 human reporting，resolved Git install Source block 的 `confirmationState` 从旧的固定 `pending` 改为基于 resolved evidence/version/content hash 的 `confirmed`。
- 范围审计结论：未触碰 planning artifacts、Story 5.1-5.4 文档或 Epic 6 full fixture matrix；新增 fixture 仅限 `source-integrity/bundled-packaging-trusted` 与 `source-integrity/bundled-packaging-missing-evidence-blocked`。
- Round 1 reviewer 只读审查已启动：Story 5.5 与 `sprint-status.yaml` 均为 `review`；5-5 CR 目录当前无既有 summary，本轮为 Round 1。由于当前没有可调用的内部 Agent 调度工具，本 reviewer 按 skill fallback 在当前上下文串行执行 Blind Hunter、Edge Case Hunter、Acceptance Auditor，并在 summary 中记录降级。
- Round 1 reviewer 结论：focused tests、全量 `npm test`、`npm run build` 均通过；`package.json` 无 `lint` script。发现 1 个 `patch`：`InstallPlanSchema` / `applyInstallPlan` 写入边界没有直接拒绝 `trustStatus=blocked`，当前依赖上游 command/resolver 分支阻断；summary 已写入 Round 1 review 文件。
- Round 1 evaluator 结论：该 `patch` 有效且阻塞 AC4。证据包括 `InstallPlanSchema` 仅做 shape 组合、`applyInstallPlan` 只检查 `writeAuthorized` 后即获取 operation lock 并开始目录/config/mirror/manifest 写入；上游 install resolver 分支有保护，但 write boundary invariant 不完整。
- 最小修复边界：两层都需要。`InstallPlanSchema.superRefine` 应拒绝 `writeAuthorized=true` 携带 `trustStatus=blocked`；`applyInstallPlan` 必须在获取 operation lock 前返回 redacted `source-integrity.blocked-source` failure，保持 `changedPaths=[]`、no lock/no write。CR TODO 无新增。
- Round 1 fixer 已完成最小修复：schema 层拒绝已授权 blocked plan，runtime 层在 lock 前拒绝 blocked descriptor，并返回 `source-integrity.blocked-source`。返回 details 仅含 `reason: "blocked-source"` 和 `sourceType`，不携带 resolvedRoot/raw URL/local absolute/cache/temp/staging path/raw stderr/stack trace。
- 定向测试采用 TDD：先新增 schema/apply 测试并观察失败，再实现最小 gate。修复后 focused tests、全量 `npm test`、`npm run build` 与 scoped `git diff --check` 均通过。
- Round 2 reviewer 复核结论：Round 1 P1 已修复。`InstallPlanSchema.superRefine` 拒绝 `writeAuthorized=true` + blocked descriptor，同时保留 `writeAuthorized=false` blocked plan anchor；`applyInstallPlan` 在 `writeAuthorized` 检查后、operation lock 前拒绝 blocked descriptor，返回 redacted `source-integrity.blocked-source` 且 `changedPaths=[]`、no lock/no write。
- Round 2 新发现：fixer 扩展 `ApplyInstallPlanResult` failure shape 后，`writeAuthorized=false` 早退分支仍未返回 `changedPaths: []`。main install path 通常在更早 target gate 停止，不影响 blocked source P1 修复；但 direct exported runtime write boundary API 返回形状不完整，建议 evaluator 裁决是否进入低优先级 fixer。
- Round 2 验证：focused tests、全量 `npm test`、`npm run build` 均通过；项目无 `lint` script。补充 `npx tsc --noEmit` 因多处既有类型问题失败，其中包含本轮相关 missing `changedPaths` 证据。
- Round 2 evaluator 裁决：该发现有效且需修复，不转 CR TODO。证据为 `ApplyInstallPlanResult` failure 分支要求 `changedPaths: string[]`，`writeAuthorized=false` early return 缺失该字段，而 install failure caller 读取 `applyResult.changedPaths.length`。虽然 CLI 未授权 install 通常在 apply 前由 target gate 停止，但 direct exported API / future reuse 会返回不完整 shape。
- Round 2 最小修复边界：只在 `src/installer/runtime-structure.ts` 的 `writeAuthorized=false` early return 补 `changedPaths: []`，并补 direct `applyInstallPlan` regression 断言 failure shape 与 no lock/no write；不得扩大到 resolver、install/update command flow、Epic 6 fixture matrix 或 source lock lifecycle。
- Round 2 fixer 已完成：`writeAuthorized=false` early return 现在返回 `changedPaths: []`；新增 direct `applyInstallPlan` regression 断言 unauthorized apply failure shape、`completedSteps=[]`、pending steps、`changedPaths=[]`，并复用 `assertNoRuntimeApplyWrites` 验证 no lock/no write。
- Round 2 fixer 验证：focused `npm test -- test/runtime-structure.test.ts test/contract-anchors.test.ts` 通过 16 个 tests；全量 `npm test` 通过 34 个 test files、258 个 tests；`npm run build` 通过；白名单相关文件 `git diff --check` 通过。未启动下一轮 reviewer/evaluator/finalizer。
- Round 3 reviewer 复核结论：Round 1 blocked source schema/runtime gate 仍有效；Round 2 `writeAuthorized=false` failure shape 已补齐 `changedPaths=[]`，direct regression 覆盖 no lock/no write；focused tests、Story 5.5 相关测试、全量 `npm test`、`npm run build` 与白名单 `git diff --check` 均通过。
- Round 3 新发现：补充 `npx tsc --noEmit` 仍失败，且 touched files 中仍有相关诊断。`src/installer/runtime-structure.ts` 的 `addPartialFailureChangedPaths` 访问 optional `issue.details.manualAction`；新增 direct apply tests 使用 `as const` 让 `integrityEvidence` 推导为 readonly `[]`。该问题不影响当前 runtime tests/build，但会污染后续 typecheck 复检，且 source helper 在无 details issue 下有 structured failure 退化风险。
- Round 3 reviewer 输出：`5-5-code-review-summary-20260601-round-3.md`，结论不通过；无高/中阻塞项；四桶为 `decision_needed=0`、`patch=1`、`defer=0`、`dismiss=0`。建议 evaluator 裁决，若修复则只清理 touched-file type diagnostics，不扩大到全仓既有 `tsc --noEmit` 债务。
- Round 3 evaluator 裁决：reviewer 新发现有效且需修复，不转 CR TODO。评估只针对 touched files 诊断，不把全仓既有 `npx tsc --noEmit` 债务纳入 Story 5.5 修复范围。
- Round 3 最小修复边界：`src/installer/runtime-structure.ts` 的 `addPartialFailureChangedPaths` 应先稳定处理 `issue.details ?? {}` 再拼接 `manualAction`；`test/runtime-structure.test.ts` 的两个 direct apply descriptor 应去掉 readonly tuple 推导或显式声明为满足 `SourceDescriptor` 的 mutable evidence array。不得扩大到 resolver、install/update command flow、Epic 6 fixture matrix、source lock lifecycle 或 Story 文档。
- Round 3 fixer 已完成：`addPartialFailureChangedPaths` 使用 `details = issue.details ?? {}` 避免 optional details thrown error 风险；两个 direct apply descriptor 显式声明为 `SourceDescriptor`，保持 mutable `integrityEvidence` 与字段字面量类型。
- Round 3 fixer 验证：focused `runtime-structure` + `contract-anchors` 通过 16 个 tests；Story 5.5 相关 suite 通过 11 个 files、120 个 tests；全量 `npm test` 通过 34 个 files、258 个 tests；`npm run build` 通过；`npx tsc --noEmit` 仍因全仓既有类型债务失败，但本轮 touched files 相关诊断已消失；白名单 `git diff --check` 通过。
- Round 3 fixer 未启动 reviewer/evaluator/finalizer/commit；下一步应按严格串行进入 Round 4 reviewer/evaluator 复检。
- Round 4 reviewer 复核结论：Round 1 blocked source schema/runtime gate、Round 2 unauthorized `changedPaths=[]` failure shape、Round 3 runtime/test touched-file type diagnostics 均未回退；focused tests、Story 5.5 相关 suite、全量 `npm test`、`npm run build` 与白名单 `git diff --check` 均通过。
- Round 4 新发现：`npx tsc --noEmit --pretty false` 仍失败。全仓既有债务仍存在；过滤 Story 5.5 相关 touched surface 后仅剩 `src/ide/target-writer.ts(92,47)`：`writeIdeMirrors` 将 `onChangedPath: input.onChangedPath` 传给 optional callback，在 `exactOptionalPropertyTypes` 下等价于传入显式 `undefined`。该诊断与 Story 5.5 changed-path tracking API 相关，不应归入全仓既有债务。
- Round 4 reviewer 输出：`5-5-code-review-summary-20260601-round-4.md`，结论不通过；无高/中运行时阻塞项；四桶为 `decision_needed=0`、`patch=1`、`defer=0`、`dismiss=0`。建议 evaluator 裁决，若修复则只清理 `src/ide/target-writer.ts` optional callback 传参，不扩大到全仓既有 typecheck 债务。
- Round 4 evaluator 裁决：reviewer 新发现有效且需修复，不转 CR TODO。`writeIdeMirrors` 的 `onChangedPath?: (relativePath: string) => void` 与 `copyCanonicalPackage` 的同名 optional callback 在 `exactOptionalPropertyTypes: true` 下不能通过 `onChangedPath: input.onChangedPath` 显式传入 `undefined`。该诊断位于 Story 5.5 changed-path tracking touched surface，不应归入全仓既有 typecheck 债务。
- Round 4 最小修复边界：仅修改 `src/ide/target-writer.ts` 的 `copyCanonicalPackage` 调用对象，使用条件展开，仅当 `input.onChangedPath !== undefined` 时传入 `onChangedPath`。不得扩大到 public type、resolver、install/update flow、Epic 6 fixture matrix、source lock lifecycle、Story 文档或全仓既有 `tsc` 债务。
- Round 4 fixer 已完成最小修复：`copyCanonicalPackage` 调用对象使用条件展开，callback 存在时继续传入并保持 changed-path tracking，callback 缺席时不再显式传入 `undefined`。
- Round 4 fixer 验证：focused `runtime-structure` + `contract-anchors` 通过 16 个 tests；Story 5.5 相关 suite 通过 11 个 files、120 个 tests；全量 `npm test` 通过 34 个 files、258 个 tests；`npm run build` 通过；`npx tsc --noEmit --pretty false` 仍因全仓既有类型债务失败，但 `src/ide/target-writer.ts`、`src/installer/runtime-structure.ts`、`test/runtime-structure.test.ts` 过滤诊断已无输出。
- Round 4 fixer 未启动 reviewer/evaluator/finalizer/commit；下一步应按严格串行进入下一轮 reviewer/evaluator 复检。
- Round 5 reviewer 复核结论：Round 1 blocked source schema/runtime gate、Round 2 unauthorized `changedPaths=[]` failure shape、Round 3 `runtime-structure` / direct tests touched-file diagnostics、Round 4 `target-writer` optional callback 诊断均未回退。focused tests、Story 5.5 suite、全量 `npm test`、`npm run build` 与相关 `git diff --check` 均通过。
- Round 5 新发现：`npx tsc --noEmit --pretty false` 仍因全仓既有类型债务失败；目标三文件过滤 `src/ide/target-writer.ts`、`src/installer/runtime-structure.ts`、`test/runtime-structure.test.ts` 已无输出，但按用户要求扩大到 Story 5.5 source/diagnostics/validation/test touched surface 后仍有 `src/validation/validate-project.ts`、`test/git-source-resolution.test.ts`、`test/validate-command.test.ts` 诊断。
- Round 5 reviewer 输出：`5-5-code-review-summary-20260601-round-5.md`，结论不通过；无高/中运行时阻塞项；四桶为 `decision_needed=0`、`patch=1`、`defer=0`、`dismiss=0`。建议 evaluator 裁决，若修复则只清理 Story 5.5 validation/test touched-surface typecheck 诊断，不扩大到全仓既有 typecheck 债务或 Epic 6 范围。
- Round 5 evaluator 裁决：reviewer 新发现有效且需修复，不转 CR TODO。`src/validation/validate-project.ts` 的 guard 未显式窄化 optional `manifest`，但后续传给 `validateRuntimePaths`、artifact/file integrity 访问和 `validateSourceIntegrity`；`test/git-source-resolution.test.ts` 两个 `gitClient` mock 缺少 `GitClient.verifyCommit`；`test/validate-command.test.ts` 直接把可能为 `undefined` 的 `outputs[0]` 传给 `renderCommandResultJson`。
- Round 5 最小修复边界：仅清理 `src/validation/validate-project.ts` manifest 窄化 / source-integrity 调用类型、`test/git-source-resolution.test.ts` 两处 mock `verifyCommit` stub、`test/validate-command.test.ts` 稳定取 `outputs[0]`。不得扩大到全仓既有 `tsc` 债务、resolver 重写、install/update flow、Epic 6 fixture matrix、source lock lifecycle、Story 文档或 finalizer。
- Round 5 fixer 已完成最小修复：`validateProject` 先绑定局部 `manifest` 并在现有 guard 中检查 `manifest !== undefined`，后续 runtime paths、artifact paths、file integrity、source integrity 均使用该局部变量；unresolved / unreachable 两个 Git mock 只补 `verifyCommit` stub；validate command JSON renderer 调用使用 `outputs[0]!`。
- Round 5 fixer 验证：Story 5.5 相关 focused tests 通过 3 个 files、37 个 tests；全量 `npm test` 通过 34 个 files、258 个 tests；`npm run build` 通过；`npx tsc --noEmit --pretty false --noErrorTruncation` 仍因全仓既有类型债务失败，但过滤 `src/validation/validate-project.ts`、`test/git-source-resolution.test.ts`、`test/validate-command.test.ts` 后无输出，确认本轮 P1 诊断已消失。
- Round 5 fixer 未启动 reviewer/evaluator/finalizer/commit；下一步应按严格串行进入下一轮 reviewer/evaluator 复检。
- Round 6 reviewer 复核结论：Round 1 blocked source schema/runtime write gate、Round 2 unauthorized direct apply failure shape `changedPaths=[]`、Round 3 runtime/test touched-file type diagnostics、Round 4 target-writer optional callback 显式 `undefined`、Round 5 validation/test touched-surface type diagnostics 均未回退。
- Round 6 验证：focused `runtime-structure` + `contract-anchors` 通过 16 个 tests；Story 5.5 相关 suite 通过 11 个 files、120 个 tests；全量 `npm test` 通过 34 个 files、258 个 tests；`npm run build` 通过；相关 tracked/untracked whitespace check 通过。
- Round 6 `tsc` 结论：`npx tsc --noEmit --pretty false --noErrorTruncation` 仍因全仓既有类型债务失败，退出码 2；但过滤 Story 5.5 touched surface 无输出，确认本 Story 相关诊断已清零。
- Round 6 reviewer 输出：`5-5-code-review-summary-20260601-round-6.md`，结论通过；无新发现，四桶为 `decision_needed=0`、`patch=0`、`defer=0`、`dismiss=0`。下一步应进入 evaluator 复核，不应直接启动 fixer/finalizer/commit。
- Round 6 evaluator 复核结论：reviewer 通过结论成立。代码锚点确认 Round 1-5 修复未回退；本 evaluator 复跑 Story 5.5 touched surface `tsc` 过滤无输出，复跑全仓 `tsc` 仍退出码 2 且归类为既有类型债务。需修复项 0，CR TODO 0。
- Round 6 evaluator 输出：`5-5-code-review-evaluation-20260601-round-6.md`。允许进入 `bmenhance-cr-04-rules-extractor`、`bmenhance-cr-05-todo-tracker`、`bmenhance-cr-06-finalizer`；本步骤未启动 fixer、rules-extractor、todo-tracker、finalizer 或 commit。
- 04 rules-extractor 已按用户授权执行 record-only：新增 `CR-API-26`（blocked `SourceDescriptor` 必须在 schema/runtime 写入边界双层 fail closed）与 `CR-PROCESS-01`（全仓 typecheck 既有债务必须用 Story touched surface 过滤裁决）。未修改全局项目文档，未新增 TODO。
- 04 对 05 的交接：Round 6 evaluator 明确 CR TODO 0，不新增无依据 TODO；`TODO-004` 已由 Story 5.5 修复并被 Round 6 reviewer/evaluator 确认未回退，05 应按 backlog 格式标记为 resolved。
- 05 todo-tracker 已完成：不新增 TODO；`TODO-004` 已移至 Resolved，解决记录写明 Story 5.5 修复、CR round 6 reviewer/evaluator approved/pass、本地尚未提交 commit。backlog 统计已更新为 open=3、in-progress=0、resolved=1。
- 06 finalizer 已完成：Story 5.5 文件状态改为 `done`；`sprint-status.yaml` 中 `5-5-sourcedescriptor-trust-status-and-redacted-reporting` 改为 `done`。因 Epic 5 下 5.1-5.5 全部为 `done`，按用户授权默认推荐决策同步 `epic-5: done`。
- `bmm-workflow-status.yaml` 不存在；06 按 skill 容错跳过该文件，不视为阻塞。
- 最终核对完成：状态字段、TODO-004 归档、规则总结索引/正文和 5-5 进度文件均已更新；tracked `git diff --check` 无输出，untracked 进度文件 no-index whitespace check 无输出。

## Risks（风险）

- 统一 trust/reporting 时容易越界实现 Epic 6 full fixture matrix 或 enterprise provenance；必须保持 Story 5.5 收口范围。
- `trusted` 只能由 expected hash、lock match 或 bundled packaging trust anchor 产生；不得因为 source type、public npm、private registry、Git、tarball、offline bundle、本机文件存在或用户确认而 trusted。
- Validate/status 必须继续 local-only，不得访问 npm registry、private registry、Git remote、offline bundle origin、本地 source origin、package-manager cache 或 provenance service。
- 后续复检应重点确认 blocked runtime gate 仍在 `acquireProjectOperationLock` 之前，且 command 上游已有 resolver gate 未被本轮变更改写。
- 后续 04/05/06 收尾仍需保持 strictly serial，只消费 Round 6 reviewer/evaluator 的通过结论，不应修改源码或 Story 文档。
