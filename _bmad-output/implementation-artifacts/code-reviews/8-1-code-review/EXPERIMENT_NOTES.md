# EXPERIMENT_NOTES

## 2026-06-16 01:46 CST

当前执行 Story `8-1-shared-cli-outcome-and-presentation-contract`。

已确认用户要求的关键约束：

- 每一步都必须 fresh sub-agent。
- 外层步骤绝对不并行；只有 `bmenhance-cr-01-reviewer` 的内部三层审查可以按 skill 自身机制执行。
- 涉及多个 skill 时必须严格等待前一个完成。
- 当前 Story 未完成前，不得启动 Story `8-2`。
- 需要决策时优先采用推荐方案并记录，避免无谓挂起；但不得扩大需求边界、推送远端或纳入无关文件。

当前仓库状态：

- 工作树干净。
- `main` 相对 `origin/main` ahead 1，来自上一轮 Epic 8 SR 本地提交。
- 本目标默认继续本地提交，不 push。

下一步：启动 fresh sub-agent 执行 `/bmad-dev-story story 8-1`，使用 `gpt-5.5`，并要求它只按 Story `8-1` 范围实现，不处理其他 Epic 8 Story。

## 2026-06-16

fresh dev sub-agent 已完成 Story `8-1` 开发：

- Story 进入 `review`。
- `sprint-status.yaml` 中 `8-1-shared-cli-outcome-and-presentation-contract` 进入 `review`。
- 验证命令全部通过：focused presentation tests、focused command tests、`npm run build`、`npm test`、`git diff --check`。
- 仓库没有 `lint` script，因此 lint 不适用。

当前注意点：

- `test/cli-output-presentation.test.ts` 是新增文件，CR reviewer 需要纳入审查范围。
- `src/diagnostics/output.ts` 改动较大，CR reviewer 应重点审查 shared frame 是否改变了既有 human output semantics、JSON parity、issue ordering 或 exit-code-independent 行为。
- 由于这是 Epic 8 的共享 primitive，后续 Story 8.2-8.7 会依赖它；但当前不能提前实现后续 Story 的 command-specific outcome 逻辑。

下一步只能启动 reviewer，不能直接 evaluator 或 fixer。

## 2026-06-16

Reviewer Round 1 已完成，结论不通过。

需要 evaluator 重点评估：

- Finding 1 是否成立：install ready summary 在 `install --yes` 已完成写入后仍输出 `写入状态：未写入项目文件`，是否违反 AC1 的写入状态说明。
- Finding 2 是否成立：validate `zh-CN` empty state 是否仍存在英文硬编码文案，是否违反 AC2/Task 3。

不直接修复；下一步必须先跑 evaluator。

## 2026-06-16

Evaluator Round 1 已完成，未 Approved。

明确修复边界：

- Fixer 必须修复 Finding #1：install ready summary 不能把已授权并完成写入的 install 结果显示为未写入。
- Fixer 必须修复 Finding #2：validate `zh-CN` empty state 不得继续硬编码英文自然语言。
- 本轮没有 CR TODO，也没有误报。

下一步只能启动 fixer。Fixer 完成后必须重新 review/evaluate，不能直接进入 04/05/06。

## 2026-06-16

Fixer Round 1 已完成。

当前 gate 判断：

- 两个 P1 blocker 均已按 evaluator 要求修复。
- 没有 CR TODO 候选，也没有误报。
- 根据用户要求和 workflow，修复后必须重新执行 reviewer 和 evaluator。只有两者都通过后，才能进入 04/05/06。

下一步：fresh reviewer Round 2。

## 2026-06-16

Reviewer Round 2 通过。当前仍不能收尾，因为用户 gate 要求 reviewer 和 evaluator 都通过。

下一步：fresh evaluator Round 2，评估 Round 2 review 是否 Approved。

## 2026-06-16

Evaluator Round 2 已 Approved。

当前状态：

- CR 循环 gate 已满足：reviewer 通过，evaluator 通过。
- 不需要再 fixer。
- 本轮没有 CR TODO。

下一步按用户指定顺序启动 04 rules extractor；04 完成后才能启动 05。

## 2026-06-16

Rules extractor 04 已完成 `analysis-only`。

当前判断：

- 04 没有修改任何文件。
- 04 提炼出 2 条可沉淀到 `cr-rules-summary.md` 的候选规则，但默认模式下没有用户确认，不能写入。
- 04 没有全局文档候选。
- 04 没有 05 TODO 候选；evaluator Round 2 也明确 CR TODO 为 0。

下一步按固定顺序启动 05 todo tracker。05 应确认无 backlog 变更；如果 05 发现与 evaluator 冲突的新 TODO 候选，需要记录依据后再决策。

## 2026-06-16

TODO tracker 05 已完成。

当前判断：

- 05 没有修改 backlog。
- 没有 Story 8.1 需要处理的 open/in-progress 相关 TODO。
- 既有 `TODO-011` 只是在路径上触及 `src/diagnostics/output.ts`，但建议时机绑定 Epic 7 的 `sync` / `uninstall` failure renderer，不应扩大到 8.1。
- 没有新增非阻塞 TODO 候选。

下一步只能启动 06 finalizer。06 应验证最新 evaluation 为 Approved，然后将 Story `8-1` 与 sprint status 更新为 `done`；`bmm-workflow-status.yaml` 缺失时按 skill 容错跳过。

## 2026-06-16 02:34 CST

Finalizer 06 已完成。

当前终态：

- Story `8-1` 文件状态为 `done`。
- `sprint-status.yaml` 中 Story `8-1` 状态为 `done`。
- `_bmad-output/planning-artifacts/bmm-workflow-status.yaml` 不存在，已跳过且未创建。
- Epic 8 仍为 `in-progress`，因为 `8-2` 到 `8-7` 未完成。

Story `8-1` 已满足本 goal 的 Story 级完成标准。下一步可以初始化 Story `8-2`，但仍必须保持严格串行：先建 8.2 进度文件，再启动 fresh dev sub-agent。
