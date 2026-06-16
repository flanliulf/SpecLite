# EXPERIMENT_NOTES

## 2026-06-16

当前执行 Story `8-8-cli-human-output-presentation-profiles`。

已确认用户要求的关键约束：

- 每一步都必须 fresh sub-agent。
- 外层步骤绝对不并行。
- Story 8.8 必须包含真实发现的 `install /Users/fancyliu/Repos/noi` 输出问题。
- 本 Story 重点是 human-readable output，不改变 command core behavior、write authorization、exit code 或 public JSON schema。
- 默认本地提交，不 push。

当前仓库状态：

- Story `8-8` 当前为 `ready-for-dev`。
- `sprint-status.yaml` 中 `epic-8: in-progress`。
- `main` 相对 `origin/main` ahead 4。
- 工作树已有 Epic 8 Story 一致性调整、Story 8.8 文件和 focused RED test，属于本目标范围。

Story 8.8 的重点风险：

- 必须让所有 human renderer 显式选择 presentation profile，但不强行全量重写 post-MVP command renderer。
- `install` 的 absolute target human preview 必须展示目标绝对路径和命令执行目录，但不能把绝对路径写入 public JSON。
- `Next Actions` 必须使用 path-safe target；自定义安装建议应为 `speclite install <target> --yes --interactive`。
- 默认 human output 不再双写同一事实的本地化行和 raw field 行。
- Empty state 必须归属到对应 section，例如 `Issues（问题）` 下的 `- 无问题`，不能继续输出独立 `Empty State（空状态）`。
- 颜色若实现，只能集中、可关闭、非语义唯一；本 Story 可以选择先定义 policy 并保持默认无 ANSI。

下一步：启动 fresh sub-agent 执行 `/bmad-dev-story story 8-8`，并要求它只按 Story `8-8` 范围实现，不做最终提交。

## 2026-06-16

fresh dev sub-agent 已完成 Story `8-8` 开发：

- Story 进入 `review`。
- `sprint-status.yaml` 中 `8-8-cli-human-output-presentation-profiles` 进入 `review`。
- 新增 profile taxonomy 与 mapping：`operation` / `diagnostic` / `report-support`。
- shared human frame 改为 profile-aware section order，empty state 归入所属 section。
- install human output 通过 non-enumerable presentation context 展示 absolute target path 与 command cwd，JSON 不暴露 absolute target。
- install Next Actions 使用 path-safe target，custom install 建议修正为 `--yes --interactive`。
- 默认 human output 去掉 raw-field 双写。
- 更新 docs matrix、focused tests 与 smoke tests。
- 验证通过：focused tests、renderer 回归、`npm run build`、`npm test`、`git diff --check`。

当前注意点：

- Reviewer 需要重点审查 non-enumerable metadata 是否真的不进入 JSON。
- 需要确认 `install` 所有 return path 均能携带 presentation context，且不会影响 command result contract。
- 需要确认 empty state 迁移没有让 status/validate/update 的重要提示丢失。
- 需要确认 profile mapping 覆盖 Story 8.8 命令列表，但没有暗中改变 legacy command core behavior。
- 需要确认 docs matrix 的 absolute target 示例没有把本机路径写死到 fixture contract。

下一步只能启动 reviewer，不能直接 evaluator、finalizer 或最终提交。

## 2026-06-16

Reviewer Round 1 已完成，结论不通过。

需要 evaluator 重点评估：

- Finding 1 是否成立：`../noi` 这类跨目录相对 target 是否仍会被 `displayPath` 折叠为 basename 并进入 human Next Actions。
- Finding 1 是否直接违反 Story 8.8 AC4 / AC8 的 path-safe target 要求。
- Finding 2 是否成立：`未写入项目文件` 是否属于 Issues section，还是 Summary / State / Plan 的 empty state。
- Finding 2 是否阻塞交付，或可以作为低优先级修复项一并处理。
- 修复是否应补充 focused regression：relative cross-directory target、Issues section 只含 issue-owned empty state、JSON 不泄漏 absolute target。

不直接修复；下一步必须先跑 evaluator。

## 2026-06-16

Evaluator Round 1 已完成，结论 `not approved`。

确认结果：

- Reviewer Finding 1 有效，非误报。
- Reviewer Finding 2 有效，非误报。
- 两个 finding 都被评估为 P1 阻塞修复项。
- 非阻塞 CR TODO 为 0。
- 误报为 0。

修复方向：

- 对 relative cross-directory target 保留从原 `commandCwd` 可复制执行的 raw relative target，不能折叠为 basename。
- 将 issue-owned empty state 与 write/plan/checked-items empty state 分离，`Issues` 只表达真实 issue 或 `- 无问题`。
- 补充 focused regression 覆盖 `../noi` 和 Issues section 归属。

下一步只能启动 fresh fixer sub-agent 执行 `/bmenhance-cr-03-fixer 8-8`。修复完成后必须回到 reviewer/evaluator。

## 2026-06-16

Fixer Round 1 已完成。

修复结果：

- `src/commands/install.ts` 对相对 target 保留 raw command target，`../noi` human Next Actions 不再退化为 basename。
- `src/diagnostics/output.ts` 调整 shared frame，`Issues` 只承载真实 issue 或 `- 无问题`。
- `test/install-outcome-human-output.test.ts` 增加 `../noi` regression 和 install no-issue section 归属断言。
- Evaluation 文件已追加 `## 修复执行记录`。
- 验证通过：install focused test、focused renderer tests、`npm run build`、`npm test`、`git diff --check`。
- `release/packaging-manifest.json` packageHash drift 已恢复，未纳入本次修复。

下一步必须重新执行 reviewer/evaluator。当前只能启动 fresh reviewer sub-agent 执行 Round 2。

## 2026-06-16

Reviewer Round 2 已完成，结论通过。

复核结果：

- Round 1 Finding 1 已修复：`../noi` human Next Actions 不再退化为 basename，JSON 不泄漏 resolved absolute target。
- Round 1 Finding 2 已修复：install no-issue `Issues` section 精确为 `- 无问题`。
- 新 findings 为 0。
- Focused tests、build、full test、`git diff --check` 均通过。

下一步必须启动 fresh evaluator sub-agent 执行 Round 2。只有 evaluator Approved 后才能进入 04/05/06。

## 2026-06-16

Evaluator Round 2 已完成，结论 Approved。

确认结果：

- Round 1 的两个阻塞 finding 均已修复。
- Round 2 findings 为 0。
- CR TODO 为 0，误报为 0。
- 不需要再次 fixer。

CR loop 已通过。下一步只能进入 `bmenhance-cr-04-rules-extractor`，然后再顺序执行 05 和 06。

## 2026-06-16

04 rules extractor 已完成。

结果：

- 生成 `8-8-cr-rules-extraction-20260616.md`。
- 提取候选规则 2 条。
- 两条候选规则评分均为 4，未达到沉淀阈值。
- 未更新全局文档、`cr-rules-summary.md` 或源码。
- 04 判断无需 05 backlog 处理。

仍需按 orchestrator 顺序执行 05 TODO tracker，做明确无待办确认，然后才能执行 06 finalizer。

## 2026-06-16

05 TODO tracker 已完成。

结果：

- 未新增/更新 CR TODO。
- `_bmad-output/implementation-artifacts/cr-rules/cr-todo-backlog.md` 本次未修改。
- Backlog 变更为 0。
- 不需要后续 CR TODO backlog 处理。

下一步只能执行 `bmenhance-cr-06-finalizer`，将 Story 8.8 标记为 Done，并同步 Epic 8 tracking。

## 2026-06-16

06 finalizer 已完成。

结果：

- Story `8-8-cli-human-output-presentation-profiles` 状态已更新为 `done`。
- `sprint-status.yaml` 中 `8-8-cli-human-output-presentation-profiles: done`。
- `sprint-status.yaml` 中 `epic-8: done`。
- `last_updated` 更新为 `2026-06-16 14:45 CST`。
- `epic-8-retrospective` 保持 `optional`。
- `_bmad-output/planning-artifacts/bmm-workflow-status.yaml` 不存在，已跳过且未创建。

Story 8.8 已终态完成。下一步进入最终验证与本地提交。

## 2026-06-16

Story 8.8 最终验证已完成。

结果：

- Install focused test 通过：1 file / 8 tests。
- Presentation/message/matrix focused tests 通过：4 files / 27 tests。
- Affected command tests 通过：4 files / 59 tests。
- `npm run build` 通过。
- `npm test` 通过：52 files / 372 tests。
- `git diff --check` 通过。
- `release/packaging-manifest.json` 与 `dist/packaging-manifest.json` 当前无 diff。
- `npm run build` 写回的 `release/packaging-manifest.json` packageHash drift 已恢复，未纳入本次提交。

下一步执行精确暂存与中文 Conventional Commit，本地提交，不 push。
