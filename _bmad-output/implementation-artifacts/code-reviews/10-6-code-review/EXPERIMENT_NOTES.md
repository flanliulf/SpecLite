# Story 10.6 Experiment Notes（实验笔记）

## 2026-07-07 00:47 CST

当前判断：

- Story 10.6 是 Epic 10 中最后一个 `ready-for-dev` Story。
- Story 10.1-10.5 的 development、CR、rules extractor、TODO tracker、finalizer 均已完成，允许进入 10.6。
- Story 10.6 的职责是把 ecosystem source authoring、install selection、selected-only runtime projection、fixture / release gate 和维护者 workflow 写入 public docs / runtime docs / skill catalog / release verification 文档闭环。

决策：

- 继续在当前 mixed worktree 中推进 Story 10.6。
- development sub-agent 只允许处理 Story 10.6 明确任务涉及的文档、测试、canonical checker 或 release/docs gate 文件。
- 外部 drift 不纳入 Story 10.6 范围；尤其不触碰 PPT / html-ppt 相关 support skill drift。

风险：

- Story 10.6 涉及 public docs 和 source docs，容易把 ecosystem module 误写成项目 runtime dependency installer，reviewer 必须重点检查范围混淆。
- 旧文档中的 `core=13`、`sdlc=51`、`total=64`、`only core+sdlc` 等表达必须有版本快照限定，不能作为长期全局真相。
- Release workflow 文档必须保持 build-first、packaging-last，并明确 canonical source hook 是 warning-only guardrail。

下一步：

- 启动 fresh development sub-agent 执行 `/bmad-dev-story story 10.6`。

## 2026-07-07 01:02 CST

development 已完成，当前可进入 CR reviewer。

补充判断：

- Story 10.6 和 `sprint-status.yaml` 已进入 `review`。
- dev worker 明确未执行 CR、未 commit、未 push，符合外层编排边界。
- reviewer 需要重点检查 public docs 是否把 ecosystem modules 误写为 project dependency installer，以及 selected-only runtime / warning-only hook / build-first release workflow 是否一致。
- mixed worktree 中外部 PPT / html-ppt drift 仍需隔离。

下一步：

- 启动 fresh reviewer sub-agent 执行 `bmenhance-cr-01-reviewer 10.6`。

## 2026-07-07 01:09 CST

reviewer round 1 已完成，发现 2 个 `[中] patch`。

补充判断：

- 两个 finding 分别指向 AC6 skill catalog 归属清晰度和 AC4 / AC7 canonical governance machine-readable 闭环。
- 按编排规则，必须先启动 evaluator 独立评估 finding 是否有效；evaluator 确认需要修复后再启动 fixer。

下一步：

- 关闭已完成 reviewer sub-agent。
- 启动 fresh evaluator sub-agent 执行 `bmenhance-cr-02-evaluator 10.6`。

## 2026-07-07 01:16 CST

evaluator round 1 已完成，确认 2 个 reviewer findings 均有效且阻塞 closeout。

补充判断：

- 当前不能进入 closeout。
- fixer 范围必须覆盖 skill catalog 归属冲突、同类 docs drift、canonical governance map ecosystem-only classification，以及对应 focused tests。
- 修复完成后必须重新 reviewer / evaluator。

下一步：

- 关闭已完成 evaluator sub-agent。
- 启动 fresh fixer sub-agent 执行 `bmenhance-cr-03-fixer 10.6`。

## 2026-07-07 01:27 CST

fixer round 1 已完成 2 个 P1 修复并追加修复记录。

补充判断：

- 当前仍不能进入 rules extractor / TODO tracker / finalizer。
- 必须先启动 fresh reviewer round 2，复核 skill catalog drift 和 governance map ecosystem-only classification 是否闭环。
- reviewer round 2 完成后再启动 evaluator round 2；不得跳过 evaluator。

下一步：

- 关闭已完成 fixer sub-agent。
- 启动 fresh reviewer sub-agent 执行 `bmenhance-cr-01-reviewer 10.6` round 2。

## 2026-07-07 01:33 CST

reviewer round 2 已通过，确认 2 个 P1 修复闭环且未发现新阻塞项。

补充判断：

- 当前仍不能进入 rules extractor / TODO tracker / finalizer。
- 按 strict serial，必须先启动 evaluator round 2 独立评估 reviewer round 2 结论。
- 若 evaluator round 2 通过，才允许进入 rules extractor。

下一步：

- 关闭已完成 reviewer sub-agent。
- 启动 fresh evaluator sub-agent 执行 `bmenhance-cr-02-evaluator 10.6` round 2。

## 2026-07-07 01:38 CST

evaluator round 2 已通过，确认 reviewer round 2 结论成立。

补充判断：

- Story 10.6 不需要重新 fixer。
- 可以进入 closeout 链，但仍必须严格按 `rules extractor -> TODO tracker -> finalizer` 顺序执行。
- 只有 finalizer 完成并同步 Story / sprint 状态后，才允许进入 Epic 10 最终验证。

下一步：

- 关闭已完成 evaluator sub-agent。
- 启动 fresh rules extractor sub-agent 执行 `bmenhance-cr-04-rules-extractor 10.6`。

## 2026-07-07 01:49 CST

rules extractor 已完成，Story 10.6 的 2 个 P1 均沉淀为可复用 CR 规则。

补充判断：

- 规则提取只更新 `cr-rules-summary.md`，未触碰实现代码或 Story 状态。
- closeout 链下一步只能进入 TODO tracker，不能跳到 finalizer。

下一步：

- 关闭已完成 rules extractor sub-agent。
- 启动 fresh TODO tracker sub-agent 执行 `bmenhance-cr-05-todo-tracker 10.6`。

## 2026-07-07 01:52 CST

TODO tracker 已完成，确认无新增/更新 CR TODO backlog。

补充判断：

- closeout 链只剩 finalizer。
- finalizer 必须同步 Story 10.6 文件状态与 `sprint-status.yaml`；Story 10.6 是 Epic 10 最后一个 Story，finalizer 后应核对 `epic-10` 是否进入项目规则下的完成状态。

下一步：

- 关闭已完成 TODO tracker sub-agent。
- 启动 fresh finalizer sub-agent 执行 `bmenhance-cr-06-finalizer 10.6`。

## 2026-07-07 02:01 CST

final verification 发现全量 `npm test` 失败，并已完成针对性修复。

补充判断：

- 失败不是随机问题，而是 Story 10.5 selected-module validation 收紧后，旧测试 fixture 与 local-source path matching 未同步。
- 修复涉及实现代码与测试，因此不能直接进入 commit。
- 需要追加 round 3 reviewer / evaluator 复审 final verification fix；复审通过后再继续最终验证。

下一步：

- 启动 fresh reviewer sub-agent 执行 `bmenhance-cr-01-reviewer 10.6` round 3。

## 2026-07-07 02:09 CST

reviewer round 3 已完成，发现 1 个新的 selected-only validation gap。

补充判断：

- 当前不能继续 final verification / commit。
- 按 strict serial，先启动 evaluator round 3 独立判断该 finding 是否有效，再决定是否 fixer。
- 若 evaluator 确认有效，fixer 范围应限制在 `files-index.entries.sourceRef` 对 core / sdlc / ecosystem source refs 的 module 归属识别与负向测试。

下一步：

- 启动 fresh evaluator sub-agent 执行 `bmenhance-cr-02-evaluator 10.6` round 3。

## 2026-07-07 02:16 CST

evaluator round 3 确认 finding 有效，P1 已完成针对性修复。

补充判断：

- 修复保持 selected-module validation 意图，没有恢复 core-only 绕过。
- 由于修复发生在 final verification 阶段，必须再次进入 reviewer / evaluator 复审。

下一步：

- 启动 fresh reviewer sub-agent 执行 `bmenhance-cr-01-reviewer 10.6` round 4。

## 2026-07-07 02:24 CST

reviewer round 4 已完成，发现 1 个新的 `skill-index` completeness finding。

补充判断：

- round 3 的 `files-index.sourceRef` P1 已被 reviewer 确认关闭。
- 新 finding 是否应在 `manifest-schema` 层要求完整 package roots，需要 evaluator 独立评估，不能直接修。

下一步：

- 启动 fresh evaluator sub-agent 执行 `bmenhance-cr-02-evaluator 10.6` round 4。

## 2026-07-07 02:37 CST

evaluator round 4 确认 `skill-index` completeness finding 有效，P1 已完成针对性修复。

补充判断：

- 该修复只对 official bundled source 启用完整 selected root 表，避免 local/custom source 因缺少官方 source truth 被误伤。
- `OFFICIAL_BUNDLED_SELECTED_MODULE_PACKAGE_ROOTS` 已补齐 frontend / other ecosystem roots，不再只覆盖 backend ecosystem。
- 新增回归证明 `core` / `sdlc` 各 1 条合法 root 的最小集合不能绕过 `manifest-schema`。
- 由于修复发生在 final verification 阶段，必须再次进入 reviewer / evaluator 复审。

下一步：

- 启动 fresh reviewer sub-agent 执行 `bmenhance-cr-01-reviewer 10.6` round 5。

## 2026-07-07 02:45 CST

reviewer round 5 已完成，结论通过。

补充判断：

- reviewer 确认 round 4 P1 已修复，未发现新的阻塞项。
- 当前不能直接进入 final verification / commit，必须先启动 evaluator round 5 独立确认 reviewer 结论。
- 若 evaluator round 5 通过，才允许恢复 Epic final verification。

下一步：

- 启动 fresh evaluator sub-agent 执行 `bmenhance-cr-02-evaluator 10.6` round 5。

## 2026-07-07 02:51 CST

evaluator round 5 已完成，结论通过。

补充判断：

- round 4 的 `skill-index` selected root completeness P1 已关闭。
- ide-drift fixture sourceDescriptor 语义问题已经用 local source fixture 修复，focused test 与 full `npm test` 均通过。
- 当前不需要 fixer。
- 因为 round 3-5 是 finalizer 后追加 CR，最终验证前需要补跑 rules extractor / TODO tracker，确认没有新增规则或 backlog 被遗漏。

下一步：

- 启动 fresh rules extractor sub-agent 执行 `bmenhance-cr-04-rules-extractor 10.6` 补检。

## 2026-07-07 02:59 CST

rules extractor 补检已完成，无需新增或更新 CR rules。

补充判断：

- round 3 问题被既有 `CR-API-32` 覆盖。
- round 4 问题被既有 `CR-API-16` 覆盖。
- round 5 ide-drift fixture gate 问题被既有 `CR-TEST-02` 覆盖。
- 仍需补跑 TODO tracker，确认没有应进入 backlog 的非阻塞项。

下一步：

- 启动 fresh TODO tracker sub-agent 执行 `bmenhance-cr-05-todo-tracker 10.6` 补检。

## 2026-07-07 03:02 CST

TODO tracker 补检已完成，无需新增或更新 CR TODO。

补充判断：

- post-finalizer 追加 CR 的 reviewer/evaluator、rules extractor、TODO tracker 补检均已完成。
- 当前可以恢复 Epic final verification。
- final verification 必须重新跑全量测试、build、packaging、canonical source check、diff checks，并在 staging 前再次确认排除 PPT / html-ppt 外部漂移。

下一步：

- 运行 Epic final verification。

## 2026-07-07 03:12 CST

Epic final verification 已通过，准备本地提交。

补充判断：

- `npm test`、`npm run build`、顺序 `npm run release:packaging-check`、`git diff --cached --check`、`git diff --check` 均已通过。
- `release:packaging-check` 不能和 `build` 并行跑；并行时会读到 build 清理中的 `dist/`，产生 `runtime-schemas-included` 竞态失败。
- 当前 worktree canonical check 因未纳入本次提交的 `speclite-html-ppt-generator` 外部漂移返回 warning；这不是提交范围问题。
- 已用 staged 临时树验证 packaging check 与 canonical source check，结果为 `status=ok`、`findings=[]`。
- staged set 不包含 `speclite-docs-intro-ppt-creator`、`speclite-html-ppt-generator` 或 html-ppt decision record。

下一步：

- 创建本地 commit，不 push。

## 2026-07-07 01:54 CST

finalizer 已完成，Story 10.6 与 sprint tracker 均为 `done`。

补充判断：

- Story 10.6 是 Epic 10 最后一个 Story。
- `sprint-status.yaml` 规则写明 `epic in-progress -> done` 在所有 Story 到达 `done` 后手动执行；当前 Story 10.1-10.6 均为 `done`，因此同步 `epic-10: done`。
- 本轮未修改 `bmm-workflow-status.yaml`，因为用户明确限定只同步 Story 文件与 implementation `sprint-status.yaml`。
- 本轮未 commit、未 push。

下一步：

- 运行 Story 状态、sprint 状态、Epic 状态、`git diff --check` 和 canonical source check 验证。
