# Experiment Notes（实验笔记）

## 2026-06-01

- 已确认项目要求中文输出，文档标题使用 `English（中文）` 形式，技术标识保留英文。
- `sprint-status.yaml` 当前显示 Epic 4 为 `in-progress`，Story 4.1-4.4 为 `done`，Story 4.5 为 `ready-for-dev`。
- Story 4.5 明确要求普通 `speclite update` 对 installer-owned drift、IDE mirror drift、human-owned custom、workflow-owned artifacts、unknown ownership、missing source evidence 等采用默认 non-overwrite / conflict 行为。
- 当前 worktree 已有大量既有改动和未跟踪目录，包含前序 Story、planning artifacts、assets/source、src/test 变更；本步骤只记录事实，不做清理。
- `project-context.md` 仍为占位内容，实际实现依据以 Story Dev Notes、live source、owning SPEC 描述和前序 Story 锚点为准。
- 前置锚点确认：`src/diagnostics/command-result-schema.ts` 已有 `UpdateConflict` / `UpdatePlan` / `UpdateCommandData`；`src/diagnostics/command-result.ts` 已集中创建 single `update.conflicts`；`src/update/ownership-model.ts`、`src/update/update-plan.ts`、`src/fs/operation-lock.ts`、`src/fs/safe-write.ts` 已存在。
- 新增 `src/update/conflict-detector.ts` 集中处理 files-index entry conflicts、missing source evidence conflict 和 IDE mirror drift conflicts。
- `src/update/update-plan.ts` 保持 planned effects 与 actual apply result 分离；blocked-by-conflict 时 `changedPaths` / `skippedPaths` 为空。
- `src/diagnostics/output.ts` 的 conflict row 现在按 reason / ownership 派生 next action，避免 human-readable UX 只有泛化提示。
- Story 4.5 已完成 dev-story 开发步骤；未启动 reviewer/evaluator/fixer，未提交 git。

## 2026-06-01 CR Reviewer（首轮）

- 已按 `/bmenhance-cr-01-reviewer 4-5` 进入 Story 4.5 首轮代码审查。
- 已读取 `bmenhance-cr-01-reviewer` skill、`references/cr-config.md`、`references/review-engine.md` 和 `assets/output-format.md`；本轮输出应保存为 `4-5-code-review-summary-20260601-round-1.md`。
- 本 reviewer 边界：只读取源码/Story/状态和写入 4-5 CR 审查产物及 4-5 进度记录；不修改源码、Story、`sprint-status.yaml` 或无关文件；不提交 git；不启动 evaluator/fixer。
- 当前执行环境没有独立 Agent 子代理工具可调用；三层审查将按 skill 降级为当前上下文串行审查，并在 summary 中记录降级。
- 已确认 `sprint-status.yaml` 中 Story 4.5 为 `review`，且 4-5 CR 目录此前无 summary 文件，因此本轮为 round 1。
- 审查范围按 Story File List 收敛到 `src/diagnostics/command-result-schema.ts`、`src/diagnostics/command-result.ts`、`src/diagnostics/output.ts`、`src/update/conflict-detector.ts`、`src/update/update-plan.ts`、`test/update-command.test.ts`、`test/update-planning.test.ts`。
- 关键通过判断：single `update.conflicts` issue、conflict/path sorting、blocked-by-conflict 时空 `changedPaths` / `skippedPaths`、human-readable Evidence profile、IDE mirror drift/missing/duplicate conflict projection 均有源码和测试锚点。
- 关键发现：`detectFilesIndexEntryConflict` 能返回 unknown ownership conflict，但 `planUpdate` 会把非 human/workflow conflict action 投影为 `ownership: "installer-owned"`，导致 unknown ownership 在 `updatePlan.actions` 中被默认当成 installer-owned；现有 tests 未覆盖 classifier unknown path。
- 本 reviewer 未重新运行 `npm test` / `npm run build`；`npm run build` 会写 `dist/`，不符合本 reviewer 只读边界。验证摘要引用 dev step 在本目录记录的通过结果。
- 已写入 `4-5-code-review-summary-20260601-round-1.md`。总体结论：不通过；decision_needed=0，patch=1，defer=0。

## 2026-06-01 CR Evaluator（首轮）

- 已按 `/bmenhance-cr-02-evaluator 4-5` 进入 Story 4.5 首轮 CR 结果评估。
- 已读取 `bmenhance-cr-02-evaluator` skill、`references/cr-config.md` 和 `assets/output-format.md`；本轮应评估最新 reviewer 文件 `4-5-code-review-summary-20260601-round-1.md`，输出 evaluation round 1。
- 本 evaluator 边界：只读取源码/Story/status/review summary，只写 4-5 CR 评估产物和 4-5 进度记录；不修改源码、Story、`sprint-status.yaml` 或无关文件；不提交 git；不启动 fixer/reviewer。
- 关键待判定 finding：unknown ownership conflict 是否会在 `updatePlan.actions` 中被误投影为 `installer-owned`，以及现有测试是否真实覆盖 classifier unknown path。
- 关键判断：`detectFilesIndexEntryConflict` 在 classifier unknown path 上会返回 `ownership: "unknown"` / `reason: "unknown-ownership"`；但 `planUpdate` 收到 conflict 后仍基于 `entry.ownership` 追加 `ownership: "installer-owned"` 的 conflict action，确实造成 public projection 语义不一致。
- Story 证据：Story 4.5 明确 unknown ownership 必须进入 protected blocker path，且不得默认当作 installer-owned；当前 `UpdatePlanActionSchema` 也不能表达 `unknown` ownership action，因此保守修法应避免追加误导性 installer-owned action，而不是扩展契约。
- 测试判断：`test/update-planning.test.ts` 的相关用例标题包含 unknown ownership，但 fixture 只覆盖 installer-owned drift、human-owned 和 workflow-owned，没有构造 classifier unknown path。
- 已写入 `4-5-code-review-evaluation-20260601-round-1.md`。总体结论：不通过；需修复=1，可忽略=0，待讨论=0，CR TODO=0。

## 2026-06-01 CR Fixer（首轮）

- 已按 `/bmenhance-cr-03-fixer 4-5` 进入 Story 4.5 首轮 CR 修复步骤。
- 已读取 `bmenhance-cr-03-fixer` skill、`references/cr-config.md`、最新 evaluation 文件和 review summary。
- 本 fixer 边界：只修复 evaluation 明确确认的 1 个问题；不修改 Story 文档内容，不修改 `sprint-status.yaml`，不提交 git，不启动 reviewer/evaluator。
- 修复计划：保持 `UpdatePlanActionSchema` 不扩展 `unknown`；在 `planUpdate` 中对 `conflict.ownership === "unknown"` 的路径只保留 `data.conflicts[]` blocker detail，不追加误导性的 `ownership: "installer-owned"` conflict action。
- 测试计划：在 `test/update-planning.test.ts` 构造 `README.md` 这类 classifier unknown path，entry 可为 `installer-owned`，断言 `data.conflicts[]` 包含 `ownership: "unknown"` / `reason: "unknown-ownership"`，且 `updatePlan.actions[]` 不包含该 path 的 installer-owned conflict action。
- 实际修复：`planUpdate` 改为只在 `conflict.ownership === "installer-owned"` 时追加 installer-owned conflict action；unknown ownership conflict 不再进入 `updatePlan.actions[]`。
- 实际测试：现有 conflict projection 用例新增 `README.md` files-index entry 和本地文件，构造 classifier unknown path；conflict count 更新为 4，并新增 negative assertion 防止该 path 出现 installer-owned conflict action。
- 验证结果：`npm test -- --run test/update-planning.test.ts test/update-command.test.ts` 通过，2 test files / 21 tests passed。
- 验证结果：`npm run build` 通过，ESM / DTS build success。
- 验证结果：`npm test` 通过，29 test files / 192 tests passed。
- 验证结果：`git diff --check` 通过，无 whitespace errors。
- 边界确认：未实现 Story 4.6 repair apply，未新增 top-level repair/sync/doctor/backup/daemon，未修改 Story 4.5 文件内容，未修改 `sprint-status.yaml`，未提交 git，未启动 reviewer/evaluator。

## 2026-06-01 CR Reviewer（第二轮）

- 已按 `/bmenhance-cr-01-reviewer 4-5` 进入 Story 4.5 第二轮代码复审。
- 已读取 `bmenhance-cr-01-reviewer` skill、`references/cr-config.md`、`references/review-engine.md` 和 `assets/output-format.md`；4-5 CR 目录已有 1 个 summary，因此本轮输出为 `4-5-code-review-summary-20260601-round-2.md`。
- 本 reviewer 边界：只读取源码/Story/status/历史 CR 产物，只写 4-5 CR reviewer summary 和 4-5 进度记录；不修改源码、Story、`sprint-status.yaml` 或无关文件；不提交 git；不启动 evaluator/fixer/finalizer。
- 当前执行环境没有独立 Agent 子代理工具可调用；已按 skill 降级为当前上下文串行三层审查，并将在 summary 中记录降级。
- 已确认 `sprint-status.yaml` 中 Story 4.5 为 `review`，Story 4.6 为 `ready-for-dev`。
- 上轮阻塞项复核：`src/update/update-plan.ts` 现在只在 `conflict.ownership === "installer-owned"` 时追加 installer-owned conflict action；因此 classifier unknown conflict 不再进入 `updatePlan.actions[]` 的 installer-owned planned effect。
- 测试 fixture 复核：`test/update-planning.test.ts` 真实新增 `README.md` files-index entry 和本地文件；结合 `src/update/ownership-model.ts` 中 installer-owned path 白名单，`README.md` 会被 classifier 判定为 `unknown`，并断言 `data.conflicts[]` 包含 `ownership: "unknown"` / `reason: "unknown-ownership"`。
- negative assertion 复核：同一测试断言 `updatePlan.actions[]` 不包含 `README.md` 的 `ownership: "installer-owned"` / `action: "conflict"`，覆盖上轮漏洞。
- schema/spec 边界复核：`UpdatePlanActionSchema` 的 ownership 仍只允许 `installer-owned` / `human-owned` / `workflow-owned`，没有为修复 unknown conflict 扩展 action ownership；`RepairPlanActionSchema` 仍限制 installer-owned repair action，未为 Story 4.6 扩展 repair/apply。
- repair/apply 范围复核：`src/commands/update.ts` 的 `update --repair` 仍返回 protected dry-run repair plan；`src/update/update-plan.ts` 的 `planRepair` 仍为空 repair actions，未实现 full repair apply。
- 本 reviewer 未重新运行 `npm test` / `npm run build`，以遵守本轮只允许写入 4-5 CR 目录的边界；验证摘要引用 fixer 记录的通过结果，并补充本 reviewer 执行的 scoped `git diff --check`。
- 已写入 `4-5-code-review-summary-20260601-round-2.md`。总体结论：通过；decision_needed=0，patch=0，defer=0，dismiss=0。

## 2026-06-01 CR Evaluator（第二轮）

- 已按 `/bmenhance-cr-02-evaluator 4-5` 进入 Story 4.5 第二轮 CR 结果评估。
- 已读取 `bmenhance-cr-02-evaluator` skill、`references/cr-config.md` 和 `assets/output-format.md`；4-5 CR 目录已有 1 个 evaluation，因此本轮输出为 `4-5-code-review-evaluation-20260601-round-2.md`。
- 本 evaluator 边界：只读取源码/Story/status/reviewer summary/历史 CR 产物，只写 4-5 CR evaluation 和 4-5 进度记录；不修改源码、Story、`sprint-status.yaml` 或无关文件；不提交 git；不启动 fixer/reviewer/finalizer。
- 第二轮 reviewer 结论评估：通过结论可信。Reviewer 正确识别 Round 1 blocker 已被 fixer 修复，且本轮未发现新的 `patch` / `decision_needed`。
- unknown ownership 修复复核：`planUpdate` 现在只在 `conflict.ownership === "installer-owned"` 时追加 installer-owned conflict action；classifier unknown path 只保留在 `data.conflicts[]`。
- Story AC 复核：Story 4.5 明确 unknown ownership 不得默认当作 installer-owned；当前 `README.md` classifier unknown path 保留 `ownership: "unknown"` / `reason: "unknown-ownership"`，符合 AC。
- 测试覆盖复核：`test/update-planning.test.ts` 真实新增 `README.md` files-index entry 和本地文件，并断言 `data.conflicts[]` 保留 unknown conflict，同时反向断言 `updatePlan.actions[]` 不包含 README 的 installer-owned conflict action。
- schema/spec 边界复核：`UpdatePlanActionSchema` 未扩展 `unknown` ownership；`UpdateConflictSchema` 继续承载 `unknown` conflict detail；未新增 reason code 或 public JSON field。
- Story 4.6 范围复核：`update --repair` 仍为 protected dry-run repair plan，`planRepair` 仍返回空 `repairPlan.actions`；未实现 repair/apply，未新增 top-level repair/sync/doctor/backup/daemon。
- 已写入 `4-5-code-review-evaluation-20260601-round-2.md`。总体结论：通过；需修复=0，可忽略=0，待讨论=0，CR TODO=0。

## 2026-06-01 CR Closeout 04 Rules Extractor（收尾 04 规则提炼）

- 已按严格串行要求先执行 `bmenhance-cr-04-rules-extractor`，尚未启动 05/06。
- 已读取 04 skill、CR 配置、升格规则和输出模板。
- 已读取 Story 4.5 全部 CR 历史：Round 1 reviewer/evaluator 确认 1 个 `patch`；fixer 修复后 Round 2 reviewer/evaluator 均通过；最新 evaluator 明确需修复=0、可忽略=0、待讨论=0、CR TODO=0。
- 规则候选：`unknown ownership conflict 不得被 public planned action 投影成 installer-owned`。
- 硬性门槛：有 CR 证据、可规则化、非纯特例、状态明确；但与既有 `CR-SEC-09 Protected path classifier 结果必须优先于 files-index ownership` 等价/重叠，因此不新建重复规则。
- 评分判断：作为 `CR-SEC-09` 的第二个来源 Story，复现频次从 1 提升到 2，总分从 7/12 更新为 8/12；文档缺口仍为 0，所以不建议修改全局文档，只写入 rules-summary。
- 实际落地：已更新 `_bmad-output/implementation-artifacts/cr-rules/cr-rules-summary.md` 的规则索引、`CR-SEC-09` 证据/评分/最佳实践，并追加 Story 4-5 记录。
- 05 TODO 交接：无未解决非阻塞项；不向 TODO backlog 交接候选。

## 2026-06-01 CR Closeout 05 TODO Tracker（收尾 05 TODO 跟踪）

- 已在 04 完成后按严格串行要求执行 `bmenhance-cr-05-todo-tracker`，尚未启动 06。
- 已读取 05 skill、TODO backlog 输出模板和现有 `cr-todo-backlog.md`。
- 最新 4-5 evaluator 明确 CR TODO 0；Round 1/2 CR 记录中没有非阻塞延期项需要新增到 backlog。
- 当前 backlog 有 3 个 open 条目；其中 TODO-003 涉及 `test/update-command.test.ts` / `test/update-planning.test.ts`，但它来源于 Story 4-3 的默认 `npm test` 5s timeout 慢测治理。
- 保守判断：Story 4.5 只是运行并通过测试，不等于完成 TODO-003 的慢测专项治理；因此不标记 resolved。
- 实际落地：`cr-todo-backlog.md` 无变更；本次只在 4-5 进度文件记录 05 检查结果。

## 2026-06-01 CR Closeout 06 Finalizer（收尾 06 状态同步）

- 已在 05 完成后按严格串行要求执行 `bmenhance-cr-06-finalizer`。
- 最新 evaluation 文件为 `4-5-code-review-evaluation-20260601-round-2.md`，结论为通过；需修复=0、可忽略=0、待讨论=0、CR TODO=0。
- Finalizer 前状态：Story 4.5 文件为 `Status: review`，`sprint-status.yaml` 中 4-5 为 `review`。
- 已将 Story 4.5 文件更新为 `Status: done`。
- 已将 `sprint-status.yaml` 中 4-5 更新为 `done`，并将 `last_updated` 更新为 `2026-06-01 13:34 CST`。
- `_bmad-output/planning-artifacts/bmm-workflow-status.yaml` 不存在，按 skill 容错跳过；不创建新文件。
- Epic 4 仍保持 `in-progress`，因为 4-6 仍为 `ready-for-dev`；本次未把 Epic 4 标记为 done。
