# EXPERIMENT_NOTES（实验笔记）

## 2026-06-17

当前执行 Story `8-9-cli-human-output-scan-friendly-layout-and-color`。

已确认用户要求的关键约束：

- 每一步都必须 fresh sub-agent。
- 外层步骤绝对不并行。
- 每一步必须等待前一步完成并更新记录后，才能进入下一步。
- 默认本地提交，不 push。
- 最终提交必须隔离当前 mixed worktree 中的无关改动。

当前仓库状态：

- Story `8-9` 当前为 `ready-for-dev`。
- `sprint-status.yaml` 中 `epic-8: in-progress`，Story 8.9 为 `ready-for-dev`。
- 工作树已有大量非 8.9 修改，包括其他 Story、spec、hook、install、config、release 和测试文件改动。
- 本轮不得回滚这些既有改动；如最终提交，必须白名单暂存 Story 8.9 相关文件。

Story 8.9 的重点风险：

- `install` prewrite human output 需要从 raw/key-value 行迁移为 bullet、nested bullet、数量和 grouped evidence。
- `install --yes --interactive` prompt layout 需要锁定 Step 1/2/3 空行、module name、quick/detailed 对比、localized section labels、IDE target 安装目录和 trailing slash write boundary。
- 必须新增且只新增 production dependency `picocolors@1.1.1`，不得引入 `chalk`、`colorette`、`strip-ansi` 或其他 terminal style dependency。
- 只有集中 ANSI helper 可以 import `picocolors`；颜色必须受 `NO_COLOR`、CI、non-TTY、`options.noColor`、`options.isTty` 护栏控制。
- 不得改变 public `CommandResult` JSON schema、absolute target path policy、write authorization、exit code、issue ordering 或 path normalization。

下一步：启动 fresh sub-agent 执行 `/bmad-dev-story story 8-9`，并要求它只按 Story `8-9` 范围实现，不做最终提交。

## 2026-06-17

fresh dev sub-agent 已完成 Story `8-9` 开发：

- Story 进入 `review`。
- `sprint-status.yaml` 中 `8-9-cli-human-output-scan-friendly-layout-and-color` 进入 `review`。
- install prewrite human output 已迁移到 bullet / nested bullet / counted steps / grouped evidence / labeled Next Actions。
- 新增 `src/diagnostics/ansi-style.ts`，以 `picocolors@1.1.1` 实现受控 ANSI helper。
- `install --yes --interactive` Step 1/2/3 prompt layout、module name、quick/detailed 列表、localized labels、IDE target directory 和 trailing slash write boundary 已补测试。
- focused tests、build、packaging check 和 `git diff --check` 通过。
- full `npm test` 失败来自当前 mixed worktree 中非 8.9 的 canonical SDLC skill count / fixture 漂移与相关 timeout；不在本 Story 自动修复范围内。

当前注意点：

- Reviewer 需要重点审查 ANSI helper 是否真正尊重 `NO_COLOR`、CI、non-TTY、`options.noColor`、`options.isTty`，且不把 ANSI 带入 docs / fixture / JSON。
- 需要确认 `picocolors` 只出现在集中 helper 和 package dependency 中，没有被 renderer、message catalog、fixture 或 docs 直接调用。
- 需要确认 install prewrite layout 没有改变 public JSON schema、absolute target path policy、write authorization、exit code、issue ordering 或 path normalization。
- 需要确认 interactive prompt layout 的中文 label 和技术标识边界清晰，且 Step 3 heading 不重复。
- 当前 mixed worktree 复杂，最终提交必须白名单暂存，不能把非 8.9 skill package count 漂移修复或其他无关改动混入。

下一步只能启动 reviewer，不能直接 evaluator、fixer、finalizer 或最终提交。

## 2026-06-17

Reviewer Round 1 已完成，结论不通过。

需要 evaluator 重点评估：

- Finding 是否成立：`src/diagnostics/ansi-style.ts` 中 `options.noColor !== false` / `options.ci !== false` 的判断，是否让 `NO_COLOR=1` 或真实 CI 环境被调用方显式 false 覆盖。
- Finding 是否直接违反 Story 8.9 AC 7 / AC 11 中 `NO_COLOR=1`、CI、non-TTY、docs 示例、fixture 或 `--json` 不得包含 ANSI escape 的硬性护栏。
- 推荐修复是否应调整禁色优先级：环境级 `NO_COLOR` / `CI` 与 explicit disable 应优先于 explicit enable。
- 是否需要补充 focused regression：`NO_COLOR=1` + `{ noColor:false, isTty:true, ci:false }` 无 ANSI；`CI=true` + `{ isTty:true, ci:false }` 无 ANSI。
- 全量 `npm test` 的 skill count / fixture count 失败是否应继续记录为非 8.9 外部阻塞，不进入 fixer 范围。

不直接修复；下一步必须先跑 evaluator。

## 2026-06-17

Evaluator Round 1 已完成，结论 `not approved`。

确认结果：

- Reviewer Finding 1 有效，非误报。
- Finding 被评估为 P1 阻塞修复项。
- 非阻塞 CR TODO 为 0。
- 误报为 0。
- 非 8.9 的 skill count / fixture count 漂移继续作为外部阻塞记录，不进入 fixer 范围。

修复方向：

- `src/diagnostics/ansi-style.ts` 中环境级 `NO_COLOR` / `CI` 和 explicit disable 必须优先于 explicit false options。
- 保留 positive TTY path，但只能在没有环境级禁色、不是 CI、不是 non-TTY 且 TTY 可用时启用 ANSI。
- 补充 `NO_COLOR=1 + noColor:false + isTty:true + ci:false` 和 `CI=true + isTty:true + ci:false` 的 focused regression。

下一步只能启动 fresh fixer sub-agent 执行 `/bmenhance-cr-03-fixer 8-9`。修复完成后必须回到 reviewer/evaluator。

## 2026-06-17

Fixer Round 1 已完成。

修复结果：

- `src/diagnostics/ansi-style.ts` 将真实 `NO_COLOR` / `CI` 提前为强禁色条件。
- `test/cli-human-output-matrix.test.ts` 增加 environment disable 与 explicit disable 回归，同时保留正常 TTY positive path。
- Evaluation 文件已追加 `## 修复执行记录`。
- 验证通过：`npx vitest run test/cli-human-output-matrix.test.ts`，以及 `NO_COLOR=1` / `CI=true` 两个最小复现。
- 未修复非 8.9 的 skill count / fixture count 漂移，未提交，未 push。

下一步必须重新执行 reviewer/evaluator。当前只能启动 fresh reviewer sub-agent 执行 Round 2。

## 2026-06-17

Reviewer Round 2 已完成，结论通过。

复核结果：

- Round 1 P1 已修复：环境级 `NO_COLOR` 与真实 CI 不能再被 explicit false options 绕过。
- 新增 regression 覆盖有效。
- TTY positive path、JSON 无 ANSI、dependency/import boundary、install layout 和 interactive prompt 未发现 8.9 范围内的新阻塞回归。
- full `npm test` 仍因非 8.9 skill count / fixture count 漂移失败；继续作为外部边界记录，不进入本 Story 修复范围。

下一步必须启动 fresh evaluator sub-agent 执行 Round 2。只有 evaluator Approved 后才能进入 04/05/06。

## 2026-06-17

Evaluator Round 2 已完成，结论 Approved。

确认结果：

- Round 1 的 P1 阻塞 finding 已修复。
- Round 2 findings 为 0。
- CR TODO 为 0，误报为 0。
- 不需要再次 fixer。
- full `npm test` 的非 8.9 count drift 继续作为外部边界，不进入本 Story。

CR loop 已通过。下一步只能进入 `bmenhance-cr-04-rules-extractor`，然后再顺序执行 05 和 06。

## 2026-06-17

04 rules extractor 已完成。

结果：

- 更新 `_bmad-output/implementation-artifacts/cr-rules/cr-rules-summary.md`。
- 提取候选规则 1 条：`CR-API-30`，环境级 terminal profile 禁色必须优先于显式 false option。
- 规则评分 7/12，写入 rules summary。
- 未更新全局项目上下文、architecture、AGENTS/CLAUDE 或源码。
- 04 判断无需 05 backlog 处理。

仍需按 orchestrator 顺序执行 05 TODO tracker，做明确无待办确认，然后才能执行 06 finalizer。

## 2026-06-17

05 TODO tracker 已完成。

结果：

- 未新增/更新 CR TODO。
- `_bmad-output/implementation-artifacts/cr-rules/cr-todo-backlog.md` 本次未修改。
- Backlog 变更为 0。
- Story 8.9 本次新增 TODO 为 0，更新 TODO 为 0。
- 不需要后续 CR TODO backlog 处理。

下一步只能执行 `bmenhance-cr-06-finalizer`，将 Story 8.9 标记为 Done，并同步 Epic 8 tracking。

## 2026-06-17

06 finalizer 已完成。

结果：

- Story 8.9 已标记为 `done`。
- `sprint-status.yaml` 中 8.9 已为 `done`。
- Epic 8 已为 `done`。
- `_bmad-output/planning-artifacts/bmm-workflow-status.yaml` 不存在，按容错规则跳过，未新建文件。
- finalizer scoped validation 通过。

当前进入最终提交阶段。

提交阶段注意事项：

- 当前 worktree 仍为 mixed 状态，包含大量非 8.9 修改与 untracked 文件。
- 必须使用白名单和必要时 hunk staging，避免把非 8.9 变更带入提交。
- 8.9 相关范围包括 Story 8.9 文件、8.9 code review dir、CR rules summary、sprint status、`picocolors` dependency、ANSI helper、install/output renderer、相关 focused tests 和 docs matrix。
- full `npm test` 仍存在非 8.9 count drift；最终汇报必须说明。

## 2026-06-17

最终验证与本地提交已完成。

结果：

- Implementation commit: `9404065 feat(cli): 实现 Story 8.9 可扫描人类输出与颜色护栏`
- 未 push。
- 白名单暂存已隔离非 8.9 mixed worktree 改动。
- Focused tests、build、packaging check、YAML parse、dependency boundary 和 diff check 均通过。
- full `npm test` 仍失败，失败与非 8.9 canonical skill count / fixture count `57/44 -> 61/48` 漂移一致。

说明：

- 曾并行执行 `npm run build` 与 `npm run release:packaging-check`，导致 packaging check 在 `dist/` 清理/重建竞态中读取到不完整 package inventory，并失败于 `runtime-schemas-included`。
- 根因确认后按脚本约定顺序重跑 `npm run release:packaging-check`，结果通过。
