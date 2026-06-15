# EXPERIMENT_NOTES

## 2026-06-16 04:08 CST

当前执行 Story `8-5-resolve-command-support-output`。

已确认用户要求的关键约束：

- 每一步都必须 fresh sub-agent。
- 外层步骤绝对不并行。
- 当前 Story 未完成前，不得启动 Story `8-6`。
- 需要决策时优先采用推荐方案并记录，避免无谓挂起；但不得扩大需求边界、推送远端或纳入无关文件。

当前仓库状态：

- Story `8-1` 到 `8-4` 已完成并标记 `done`。
- Story `8-5` 当前为 `ready-for-dev`。
- 工作树已有 Story 8.1 / 8.2 / 8.3 / 8.4 目标内改动，不属于无关改动。
- `main` 相对 `origin/main` ahead 1，来自上一轮 Epic 8 SR 本地提交。
- 本目标默认继续本地提交，不 push。

Story 8.5 的重点风险：

- 默认 `speclite resolve config/customization` 必须继续 pure JSON stdout；不能破坏 installed skills 的 runtime support contract。
- Human-readable resolve support 必须通过显式 `--human` opt-in。
- 默认 missing key behavior 必须保持 stdout `{}`、exit code 0、stderr empty。
- 不把 resolve 改成 `CommandResult`，除非 owning SPEC 明确改变 exception boundary。
- 不改变 merge order、optional/required layer semantics、missing key behavior 或 fallback project search，除非 SPEC 同步更新。
- 不泄露 absolute path、home directory、cache path 或 raw exceptions。

下一步：启动 fresh sub-agent 执行 `/bmad-dev-story story 8-5`，使用 `gpt-5.5`，并要求它只按 Story `8-5` 范围实现，不处理后续 Story。

## 2026-06-16

fresh dev sub-agent 已完成 Story `8-5` 开发：

- Story 进入 `review`。
- `sprint-status.yaml` 中 `8-5-resolve-command-support-output` 进入 `review`。
- 修改涉及 resolve command、resolve output schema、resolve contract SPEC、CLI docs、README、resolve tests 和 human fixtures。
- 验证命令全部通过：resolve focused tests、resolve reader tests、`npm run build`、`npm test`、`git diff --check`。
- `release/packaging-manifest.json` 的 build hash drift 已由 dev sub-agent 恢复，最终无 diff。

当前注意点：

- CR reviewer 需要重点审查默认 resolve JSON stdout / JSON Lines diagnostics contract 是否完全不变。
- 需要确认 missing key 默认仍为 `{}` / exit 0 / empty stderr。
- 需要确认 `--human` 是 explicit opt-in，且 human output 不泄露 absolute path、home/cache path 或 raw exceptions。
- 需要确认 SPEC/docs/tests/fixtures 与 commander registration 一致。

下一步只能启动 reviewer，不能直接 evaluator 或 fixer。

## 2026-06-16

Reviewer Round 1 已完成，结论不通过。

需要 evaluator 重点评估：

- Finding 1 是否成立：human resolve output 是否将 source path 硬编码为候选首层，而不是真实 resolved key 来源。
- 该问题是否直接违反 AC1：成功 resolve 必须展示 requested key、resolved layer、source path 和 value summary。
- 修复边界是否应优先让 resolver result 或 human output 获取真实 effective source metadata；若暂时无法精确，是否需要避免伪装为单一精确 `source path`。

不直接修复；下一步必须先跑 evaluator。

## 2026-06-16

Evaluator Round 1 已完成，结论 `not approved`。

确认结果：

- Reviewer Finding 1 有效，非误报。
- 优先级提升为 P1，阻塞交付。
- 问题核心是 successful human resolve output 的单数 `source path` 显示候选首层，而不是 selected key 的真实 effective source。
- 典型例子：`core.project_name` 的 effective value 来自 `_speclite/config.user.toml`，但 human output 显示 `_speclite/config.toml`。
- CR TODO 数量为 0，误报数量为 0。

下一步只能启动 fresh fixer sub-agent 执行 `/bmenhance-cr-03-fixer 8-5`。修复完成后必须回到 reviewer/evaluator，不得直接进入 04/05/06。

## 2026-06-16

Fixer Round 1 已完成。

修复结果：

- `ResolverResult` 已增加 selected key effective source metadata。
- Human `source path` 已改为真实 effective source：`core.project_name` 对应 `_speclite/config.user.toml`。
- 默认 machine mode contract 保持不变：stdout 仍为 pure JSON，missing key 仍为 `{}` / exit code `0` / stderr empty。
- Evaluation 文件已追加 `## 修复执行记录`。
- 验证通过：focused resolve/readers/contract tests、`npm run build`、`npm test`、`git diff --check`。
- `release/packaging-manifest.json` build hash drift 已恢复，当前无 diff。

下一步必须重新执行 reviewer/evaluator。当前只能启动 fresh reviewer sub-agent 执行 Round 2。

## 2026-06-16

Reviewer Round 2 已完成，结论通过。

复核结果：

- 本轮 findings 为 0。
- Round 1 effective source finding 已修复。
- `config` 与 `customization` 的后续 layer 覆盖 base value 场景已验证。
- 默认 machine mode 未泄漏 `sources` metadata。
- missing key 默认仍为 `{}` / exit code `0` / stderr empty。
- `--human` 输出未发现 absolute path、home/cache path 或 raw exception 泄露。

下一步必须启动 fresh evaluator sub-agent 执行 Round 2。只有 evaluator Approved 后才能进入 04/05/06。

## 2026-06-16

Evaluator Round 2 已完成，结论 Approved。

确认结果：

- Round 1 finding 已修复，不再阻塞。
- Round 2 findings 为 0。
- CR TODO 为 0，误报为 0。
- 不需要再次 fixer。
- focused resolve/readers/contract tests 通过。

CR loop 已通过。下一步只能进入 `bmenhance-cr-04-rules-extractor`，然后再顺序执行 05 和 06。

## 2026-06-16

04 rules extractor 已完成。

结果：

- 生成 `8-5-cr-rules-extraction-20260616.md`。
- 提取候选规则 `CAND-CR-API-8-5-01`。
- 晋升分数 `5/12`，结论 `candidate-only`。
- 未更新 `_bmad-output/implementation-artifacts/cr-rules/cr-rules-summary.md` 或其他项目级规则文档。
- Round 2 已修复且 CR TODO 为 0；04 判断无需 05 backlog 处理。

仍需按 orchestrator 顺序执行 05 TODO tracker，做明确无待办确认，然后才能执行 06 finalizer。

## 2026-06-16

05 TODO tracker 已完成。

结果：

- 未新增/更新 CR TODO。
- `_bmad-output/implementation-artifacts/cr-rules/cr-todo-backlog.md` 本次未修改。
- Backlog 变更为 0。
- 不需要后续 CR TODO backlog 处理。

下一步只能执行 `bmenhance-cr-06-finalizer`，将 Story 8.5 标记为 Done 并同步 sprint tracking。

## 2026-06-16

06 finalizer 已完成。

结果：

- Story `8-5-resolve-command-support-output` 状态已更新为 `done`。
- `sprint-status.yaml` 中 `8-5-resolve-command-support-output: done`。
- `last_updated` 更新为 `2026-06-16 04:55 CST`。
- Epic 8 保持 `in-progress`，因为 `8-6` 和 `8-7` 仍为 `ready-for-dev`。
- `_bmad-output/planning-artifacts/bmm-workflow-status.yaml` 不存在，已跳过且未创建。

Story 8.5 已终态完成。下一步进入 Story `8-6-localized-next-actions-and-message-catalog`。
