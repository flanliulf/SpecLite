# EXPERIMENT_NOTES（实验笔记）

## 2026-06-01

- `AGENTS.md` 要求中文输出，文档章节标题采用 `English（中文）` 形式；技术标识保留英文。
- `bmad-dev-story` 限制 Story 文件只改 Tasks/Subtasks、Dev Agent Record、File List、Change Log、Status。
- Story 4.4 当前为 `ready-for-dev`；`sprint-status.yaml` 中 `4-1`、`4-2`、`4-3` 为 `done`，`4-4` 为 `ready-for-dev`。
- `project-context.md` 是初始化占位内容，不能替代 live Story/源码/测试证据。
- 当前 worktree 存在大量既有脏改和未跟踪文件，包括前序 Story 产物、planning artifacts、assets/source、`src/` 与 `test/` 改动；全部视为用户或前序 agent 改动，除 Story 4.4 必需范围外不触碰。
- 决策：解析 workflow 使用 `python3.12`，因为裸 `python3` 缺 `tomllib`。
- 源码锚点检查：`package.json` 存在 TypeScript/Vitest/Node 22 配置；`src/commands/update.ts`、`src/diagnostics/command-result*.ts`、`src/update/update-plan.ts`、`src/update/ownership-model.ts`、`src/fs/path-normalizer.ts`、`src/fs/safe-write.ts`、`src/manifest/manifest-generator.ts`、`src/validation/validate-project.ts` 已存在。
- Story 4.1 锚点：`src/update/ownership-model.ts` 已实现 installer/human/workflow ownership 与 `_speclite/.lock` / `.speclite-tmp-` volatile exclusion。
- Story 4.2 锚点：`src/update/update-plan.ts` 已调用 shared config/customization resolver，不直接重写 human-owned TOML。
- Story 4.3 锚点：`planUpdate` 区分 planned `actions` 与 actual `changedPaths` / `skippedPaths`，`update --yes` 目前仍不 apply writes。
- 当前缺口：update public path 尚未在 planning 前获取 project operation lock；validate 尚未报告 stale lock / stale temp file；safe-write 缺少 injected clock/partial diagnostics/exported helpers 的 focused coverage。
- 实现决策：新增 `src/fs/operation-lock.ts` 作为 lock owning module，同时从 `safe-write.ts` re-export 以保留现有 install import surface。
- 实现决策：`update --yes` / `update --repair --yes` 进入 write stage 前获取 lock；当前 Story 4.3 仍不 apply update writes，因此 lock 只包住 authorized planning 阶段并在 `finally` release。
- 实现决策：lock contention 使用 empty update/repair command data，不写入 `data.conflicts`，不泄露 pid、createdAt、projectRootHash 或 absolute path。
- 实现决策：safe write 采用 same-directory temp file、`.speclite-tmp-` marker、private operation id、close-before-rename 和 best-effort cleanup；昂贵 fsync 在全量并发测试中造成 5s timeout，已降级为 Node 22-compatible close-before-rename 路径。
- 实现决策：validate 只在实际发现/读取 `_speclite/.lock` 时把 `operation-lock` 加入 checked categories，以避免无 lock 的既有 validate success 输出发生无意义漂移。

## 2026-06-01 CR Reviewer

- 开始 `/bmenhance-cr-01-reviewer 4-4`。本步骤边界：只读源码、Story、状态；只写 `4-4-code-review` 下的审查产物与进度记录；不改源码、Story、`sprint-status.yaml`，不提交 git，不启动 evaluator/fixer。
- 已读取 `bmenhance-cr-01-reviewer` skill、`references/cr-config.md`、`references/review-engine.md` 和 `assets/output-format.md`。本轮按 `4-4-code-review-summary-20260601-round-1.md` 命名；若发现已有 summary 再自动递增。
- 当前环境无可调用 `Agent` 子代理工具；按 skill 降级为当前上下文内的串行三层审查，并在最终 summary 标注降级执行。
- 关键判断：`operation-lock.ts` 已覆盖 O_EXCL acquisition、contention issue、release、stale inspection 与 volatile redaction；`update --yes` / `update --repair --yes` 已在 planning 前获取 lock；`install` apply phase 已获取 lock。
- 关键判断：safe write 使用 same-directory `.speclite-tmp-*` + close-before-rename，且有 basic path/symlink/case/type blockers；但 cleanup failure 没有 best-effort 捕获，`allowExisting=true` 缺 ownership/hash baseline preflight。
- 关键判断：partial failure diagnostics 没有把已成功 rename 的 changed paths 从 orchestration 层带到 failure output；validate stale temp 只扫描 `_speclite` 顶层，漏掉 safe-write 实际可能产生的嵌套 temp。
- 结果：已生成 `4-4-code-review-summary-20260601-round-1.md`。总体结论不通过；decision_needed=0，patch=4，defer=0。未启动 evaluator/fixer，未修改源码、Story 或 sprint-status，未提交 git。

## 2026-06-01 CR Evaluator

- 开始 `/bmenhance-cr-02-evaluator 4-4`。本步骤边界：只读源码、Story、状态和 reviewer summary；只写 `4-4-code-review` 下的 evaluation 与进度记录；不改源码、Story、`sprint-status.yaml`，不提交 git，不启动 fixer/reviewer。
- 已读取 `bmenhance-cr-02-evaluator` skill、`references/cr-config.md` 和 `assets/output-format.md`。当前无既有 evaluation，本轮按 `4-4-code-review-evaluation-20260601-round-1.md` 命名。
- Reviewer 输入确认：最新文件为 `4-4-code-review-summary-20260601-round-1.md`，结论不通过；decision_needed=0，patch=4，defer=0。
- 关键判断：Finding 1 有效。`runtime-structure.ts` 在多个 safe write 成功后才可能进入后续失败路径，但失败只保留 lifecycle `completedSteps` / `pendingSteps`，`safe-write.ts` failure details 固定 `changedPaths: []`，不满足 partial failure changed paths 诊断要求。
- 关键判断：Finding 2 有效。safe write temp 位于 target 同目录；`discoverStaleTempFiles` 只扫描 `_speclite` 顶层，focused validate test 也只覆盖顶层 temp，漏掉 `_speclite/_config/.speclite-tmp-*` 等嵌套 temp。
- 关键判断：Finding 3 有效。`safe-write.ts` catch 中直接 `await rm(tempPath, { force: true })`，未捕获 cleanup failure；若 cleanup 失败，会覆盖稳定 `ValidationIssue` 返回路径。
- 关键判断：Finding 4 有效。`safeWriteFile` 只有 `allowExisting?: boolean`，`validateProjectPath` 对 `allowExisting=true` 的普通文件无 ownership/hash baseline preflight；规划层存在 drift conflict 判断，但 shared write primitive 不能在 rename 前证明目标仍安全。
- 结果：已生成 `4-4-code-review-evaluation-20260601-round-1.md`。总体评估结论不通过；需修复 4，可忽略 0，待讨论 0，CR TODO 0。未启动 fixer/reviewer，未修改源码、Story 或 sprint-status，未提交 git。

## 2026-06-01 CR Fixer

- 开始 `/bmenhance-cr-03-fixer 4-4`。本步骤边界：只修复最新 evaluation 确认的 4 个 P1；不修改 Story 4.4 文档内容，不修改 `sprint-status.yaml`，不提交 git，不启动 reviewer/evaluator。
- 已读取 `bmenhance-cr-03-fixer` skill、skill-local `references/cr-config.md`、最新 evaluation、review summary、相关源码和测试。仓库根目录没有 `references/cr-config.md`，实际配置按 skill 路径读取。
- 修复计划：
  - P1-1：在 install apply orchestration 层维护 operation-local `changedPaths`，每次 successful safe write/copy 之后追加；失败时投影到 `issue.details.changedPaths` 和 `manualAction`。
  - P1-2：将 validate stale temp discovery 从 `_speclite` 顶层扫描扩展为受控 roots 递归扫描，覆盖 `_speclite/**`、`.claude/skills/**`、`.agents/skills/**`，输出 project-relative POSIX path。
  - P1-3：把 safe-write cleanup failure 纳入 best-effort，不抛 raw cleanup error；返回稳定 `file-integrity.stale-temp-file` issue 和 manual action。
  - P1-4：为 `safeWriteFile(...allowExisting=true)` 增加 apply-time existing target baseline preflight，阻断 protected/unknown ownership、baseline drift、type mismatch、symlink 和 stale temp blocker。
- 关键决策：不实现 Story 4.5 full conflict detector 或 Story 4.6 repair apply；P1-4 只在 safe-write apply primitive 上加入受控 baseline 参数，默认 `allowExisting=true` 若无 baseline 直接阻断，避免后续 apply 误用。
- 修复结果：`src/installer/runtime-structure.ts` 维护 `changedPaths`，`src/fs/copy-tree.ts` 与 `src/ide/target-writer.ts` 通过 callback 回传 IDE mirror 已完成 writes；install apply 失败时将 changed paths 放入 issue details，并在 `src/commands/install.ts` 的 `nextActions` 中提示复核。
- 修复结果：`src/validation/rules/file-integrity.ts` 的 stale temp discovery 改为受控 roots 递归扫描，固定包含 `_speclite`、`.claude/skills`、`.agents/skills`，并补充 files-index installer-controlled parent dirs；结果按 project-relative POSIX path 去重排序。
- 修复结果：`src/fs/safe-write.ts` 将 temp cleanup failure 捕获并返回 stable `file-integrity.stale-temp-file`，`affectedPath` 使用 project-relative temp path，details 包含 `cleanup-failed`、manual action 和 pending cleanup steps。
- 修复结果：`safeWriteFile` 在 `allowExisting=true` 时要求 `expectedExistingFile`，并在 rename 前验证 baseline ownership、path classification、stale temp blocker 和 current hash；protected/unknown ownership、baseline drift、type mismatch、symlink 均阻断。
- 测试补充：`test/operation-lock-safe-write.test.ts` 覆盖 cleanup failure、missing/protected/unknown/baseline drift/stale temp blocker 和 matching installer-owned baseline success；`test/validate-command.test.ts` 覆盖 nested `_speclite/_config` temp 与 IDE mirror directory-shaped temp；`test/runtime-structure.test.ts` 覆盖 partial install failure changed paths / nextActions。
- 验证结果：
  - `npm test -- --run test/operation-lock-safe-write.test.ts test/validate-command.test.ts test/runtime-structure.test.ts test/update-command.test.ts` -> passed，4 files / 36 tests passed。
  - `npm run build` -> passed，ESM/DTS build success。
  - `npm test` -> passed，29 files / 188 tests passed。
  - `git diff --check` -> passed，无输出。
- 范围复核：本轮未编辑 Story 4.4 文件内容，未编辑 `sprint-status.yaml`，未提交 git，未启动 reviewer/evaluator。当前 `git diff` 中 Story/status 的差异为前序既有 dirty worktree 状态。

## 2026-06-01 CR Reviewer Round 2

- 开始 `/bmenhance-cr-01-reviewer 4-4` 第二轮复审。边界：只读源码、Story、status、历史 CR/evaluation/fix 记录；只写本目录的 round 2 审查产物与进度记录；不修改源码、Story、`sprint-status.yaml`，不提交 git，不启动 evaluator/fixer。
- 已读取 reviewer skill、`references/cr-config.md`、`references/review-engine.md`、`assets/output-format.md`、Story 4.4、sprint status、round 1 summary/evaluation 和 fixer 追加记录。按现有 summary 轮次，本轮目标文件为 `4-4-code-review-summary-20260601-round-2.md`。
- 当前环境没有可调用的 `Agent` 子代理工具；按 reviewer skill 降级为当前上下文内的单一/串行复审，并将在 summary 中标注降级执行。
- 本轮复审重点固定为 Round 1 四个 P1 修复项：partial failure changed paths、nested/IDE mirror stale temp discovery、safe-write cleanup failure stable issue、`allowExisting=true` apply-time baseline preflight；同时检查是否引入 Story 4.5/4.6 边界越界或新的 AC1-8 阻塞项。
- 关键判断：P1-1 已闭合。`runtime-structure.ts` 维护 operation-local `changedPaths`，config writes、human stub writes、IDE mirror writes、manifest/index writes 在成功后追加路径；失败时 `createApplyFailure` 将去重排序后的 project-relative paths 投影到 `issue.details.changedPaths` 和 `nextActions`，测试覆盖 mirror symlink failure 后仍包含 `_speclite/config.toml` / `_speclite/config.user.toml`。
- 关键判断：P1-2 已闭合。`file-integrity.ts` 通过 `createStaleTempScanRoots` 限定扫描 `_speclite`、`.claude/skills`、`.agents/skills` 与 files-index installer-controlled parent dirs，递归发现 nested/IDE mirror `.speclite-tmp-*`，输出去重排序后的 project-relative POSIX paths，未扫描整个 project root。
- 关键判断：P1-3 已闭合。`safe-write.ts` 对 temp cleanup 失败单独 catch，返回稳定 `file-integrity.stale-temp-file` issue，`affectedPath` 使用 project-relative temp path，details 包含 `cleanup-failed`、pending cleanup steps 和 manual action，不泄露 absolute path。
- 关键判断：P1-4 已闭合。`safeWriteFile` 在 `allowExisting=true` 时要求 `expectedExistingFile`，rename 前验证 baseline ownership、path classification、stale temp blocker 和 current hash；protected/unknown ownership、baseline drift、directory/non-file、symlink 和 stale temp blocker 均阻断。当前 production install/create 调用未使用 `allowExisting=true`，未过度破坏安全 install/update 调用面。
- 新发现检查：未发现 Story 4.5 full conflict detector、Story 4.6 repair apply、top-level repair/sync/daemon/backup/restore 等越界实现；public JSON redaction 仍由 schema superRefine 和 focused tests 覆盖，lock/temp volatile values 未进入 stable output。
- 只读验证结果：focused `npm test -- --run test/operation-lock-safe-write.test.ts test/validate-command.test.ts test/runtime-structure.test.ts test/update-command.test.ts` passed，4 files / 36 tests passed；全量 `npm test` passed，29 files / 188 tests passed；相关路径 `git diff --check` passed，无输出。
- 未执行 `npm run build`：reviewer 本轮要求只读验证，build 会写入 `dist/`；fixer 记录中已有 `npm run build` passed 作为历史证据。
- 结果：准备生成 `4-4-code-review-summary-20260601-round-2.md`。总体结论通过；decision_needed=0，patch=0，defer=0。未启动 evaluator/fixer，未修改源码、Story 或 sprint-status，未提交 git。

## 2026-06-01 CR Evaluator Round 2

- 开始 `/bmenhance-cr-02-evaluator 4-4` 第二轮评估。边界：只读源码、Story、status、历史 CR/evaluation/fix 记录和最新 reviewer summary；只写本目录的 round 2 evaluation 与进度记录；不修改源码、Story、`sprint-status.yaml`，不提交 git，不启动 fixer/reviewer/finalizer。
- 已读取 evaluator skill、`references/cr-config.md`、`assets/output-format.md`、最新 reviewer summary、round 1 evaluation/fix record、Story 4.4 status 与 `sprint-status.yaml`。已有 evaluation 1 个，本轮目标文件为 `4-4-code-review-evaluation-20260601-round-2.md`。
- Reviewer 输入确认：最新文件为 `4-4-code-review-summary-20260601-round-2.md`，结论通过；decision_needed=0，patch=0，defer=0。
- 关键判断：Round 1 P1-1 已闭合。`runtime-structure.ts` 在 apply orchestration 层维护 `changedPaths`，写入成功后追加路径，失败时投影到 `issue.details.changedPaths` 与 install `nextActions`；`runtime-structure.test.ts` 覆盖 mirror failure 后仍报告此前完成的 `_speclite/config.toml` / `_speclite/config.user.toml`。
- 关键判断：Round 1 P1-2 已闭合。`file-integrity.ts` 已按 `_speclite`、IDE skill dirs 与 files-index installer-controlled parent dirs 递归扫描 `.speclite-tmp-*`；`validate-command.test.ts` 覆盖嵌套 `_speclite/_config` temp 和 IDE mirror directory-shaped temp。
- 关键判断：Round 1 P1-3 已闭合。`safe-write.ts` 对 cleanup failure 单独 catch 并返回稳定 `file-integrity.stale-temp-file` issue，`affectedPath` 为 project-relative temp path；`operation-lock-safe-write.test.ts` 覆盖 cleanup failure 不泄露 temp root。
- 关键判断：Round 1 P1-4 已闭合。`safeWriteFile` 在 `allowExisting=true` 时要求 `expectedExistingFile`，并阻断 missing baseline、protected/unknown ownership、baseline drift、type mismatch、symlink/case conflict 和 stale temp blocker；`allowExisting: true` 当前仅在 focused tests 中使用，未发现生产调用面越界。
- 结果：已生成 `4-4-code-review-evaluation-20260601-round-2.md`。总体评估结论通过；需修复 0，可忽略 0，待讨论 0，CR TODO 0。Reviewer round 2 通过结论成立，可退出 Story 4.4 CR 修复循环。未启动 fixer/reviewer/finalizer，未修改源码、Story 或 sprint-status，未提交 git。

## 2026-06-01 CR Closeout 04/05/06

- 开始 Story 4.4 CR 通过后收尾链路。严格顺序：先 04 rules extractor，再 05 todo tracker，最后 06 finalizer；不启动 reviewer/evaluator/fixer，不提交 git，不修改源码或测试。
- 已读取 04/05/06 skill、各自 `references/cr-config.md`；04/05 已读取 `assets/output-format.md`，04 已读取 `references/promotion-rules.md`，06 无单独 output-format 文件。
- 当前事实复核：Story 4.4 文件为 `Status: review`；`sprint-status.yaml` 中 `4-4-project-operation-lock-and-safe-write: review`；最新 reviewer round 2 结论通过且 patch=0；最新 evaluator round 2 评估结论通过且需修复 0、CR TODO 0。
- 当前事实复核：`_bmad-output/planning-artifacts/bmm-workflow-status.yaml` 不存在；Epic 4 中 `4-5`、`4-6` 仍为 `ready-for-dev`，因此 06 只关闭 Story 4.4，不关闭 Epic 4。
- 04 开始：按 `bmenhance-cr-04-rules-extractor 4-4` 读取 4-4 全部 CR history、既有 `cr-rules-summary.md` 和全局文档相近约束，执行硬性门槛与 6 维评分。
- 04 关键判断：Round 1 Finding #1 与既有 `CR-API-07` 等价，按模板更新既有规则而不是重复新增；Story 4.4 使该规则从单 Story 提升为跨 Story 复现，总分从 7/12 调整为 8/12。
- 04 关键判断：Round 1 Finding #2/#3/#4 均已由 Round 2 evaluator 确认关闭，且分别可沉淀为 validate stale temp 扫描、safe-write cleanup failure 稳定 issue、existing overwrite apply-time baseline preflight 三条可复用规则。
- 04 默认决策：采用用户授权的保守 `record-only`，只更新 `_bmad-output/implementation-artifacts/cr-rules/cr-rules-summary.md`；不更新全局文档、architecture、AGENTS/CLAUDE，也不交给 05 TODO。
- 04 结果：已更新 `CR-API-07`，新增 `CR-SEC-11`、`CR-SEC-12`、`CR-SEC-13`；04 完成。
- 05 开始：按 `bmenhance-cr-05-todo-tracker 4-4` 从 4-4 CR summary/evaluation/progress 中提取非阻塞候选。
- 05 关键判断：Round 1 evaluation 明确 4 项均为 P1 阻塞修复，不适合 defer；Round 2 reviewer/evaluator 明确 patch=0、defer=0、CR TODO 0；04 没有交给 05 的未解决候选。
- 05 默认决策：记录“无 TODO 候选/no-op”，不伪造 backlog 项，不修改 `_bmad-output/implementation-artifacts/cr-rules/cr-todo-backlog.md`。
- 05 结果：无 TODO 候选，05 完成。
- 06 开始：按 `bmenhance-cr-06-finalizer 4-4` 验证最新 evaluation，确认可进入状态收尾。
- 06 关键判断：最新 `4-4-code-review-evaluation-20260601-round-2.md` 评估结论通过，需修复 0，CR TODO 0；Story 当前为 `review`，未重复执行 done。
- 06 默认决策：更新 Story 4.4 状态为 `done`，同步 `sprint-status.yaml` 中 4-4 为 `done`；`bmm-workflow-status.yaml` 不存在，按 skill 容错跳过。
- 06 关键判断：Epic 4 仍有 `4-5`、`4-6` 为 `ready-for-dev`，因此不将 `epic-4` 标记为 `done`。
- 06 结果：Story 4.4 与 sprint status 均已同步为 `done`，06 完成。
