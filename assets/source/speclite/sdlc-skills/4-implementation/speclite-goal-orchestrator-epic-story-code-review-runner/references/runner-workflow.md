# Epic Story CR Runner Workflow v2（Epic Story CR Runner 工作流 v2）

执行本 workflow 前必须先读取 `{skills-root}/speclite-code-review-contract/references/cr-contract.md`。runner 只消费契约，不拥有或覆盖契约。

## Execution Invariants（执行不变量）

- 外层始终保持一个 Story、一个 fresh sub-agent、一个状态迁移；必须等待当前状态完成并写入记录后才能继续。
- 固定源码路径、fixture、schema 或 command 只有 owning SPEC 明确要求时才是 hard gate；否则按 contract 的 equivalent implementation policy，以测试、fixture、snapshot 或 command evidence 判断功能等价。
- 当前状态只能来自合法的 v2 frontmatter、artifact hash、scope hash 和 tracker 重读结果，不得按文件 mtime、文件数量或 prose 关键词猜测。
- 任一 state transition 失败、产物无效或授权不足时 HALT；不得自动跳过、降级或扩大修改范围。

## Step 0: Preflight（前置审计）

- 确认 cwd、branch、HEAD、用户目标和 git 状态。
- 从 Epic、Story 与 sprint tracker 建立唯一 `storyId -> storyKey -> storyFile` 映射。
- 调用一次 `speclite resolve cr-directory --story-id {storyId} --review-series {reviewSeries} --project-root .`，冻结 `crDir` / `canonicalCrDir` / `compatibilityMode` / `legacyArtifactPaths`（= `legacyCrDirs`）并传给 CR01–06；`continuation=block` 时 HALT，不得自行选择目录。slug/legacy 目录只读记录，不自动移动，也不作为新 run 目录；`compatibilityMode=legacy-resume` 时在 resolver 返回的 legacy `crDir` 原位续写。冻结值写入 goal records（`EXPERIMENTS.md` 当次 preflight 条目）。
- Fresh session 定位规则：resolver 返回 `compatibilityMode=canonical` 但 canonical 目录没有 current series 的任何 v2 artifact，且 `roundEvidence` 中恰有一个 legacy 目录含该 series 的 finalizer 时，先读取该 legacy 目录的 finalizer report 与 `goal-execute-records/`：report 为 `HALTED` → 以该 legacy 目录覆盖冻结 `crDir` 并直接进入恢复矩阵的 HALTED 行，不得在 canonical 开新 round；report 为 `DONE` → 该 run 已完成，canonical 才是新 run。
- 识别 current review series、最大 round、latest v2 artifacts（含上一条定位到的 legacy 目录）、Flow Gate 和 tracker 状态。
- 续跑必须从最新合法结构化状态继续，不按 mtime 或 prose 猜测。

按以下恢复矩阵选择唯一下一状态：

| Current Evidence（当前证据） | Next State（下一状态） |
|---|---|
| kickoff gate 缺失、过期或不合法 | Step 2 Kickoff Gate |
| kickoff 合法但 development 未完成 | Step 3 Development |
| development 完成且无 current review | Step 4 Scope |
| current review 合法但无绑定 evaluation | Step 6 Evaluator |
| current evaluation 合法 | Step 7 Convergence |
| current fixRecord 完成 | Step 4 Scope，重新冻结后 fresh review/evaluate |
| 可收口 verdict，无 current CR04 report | Step 10.1 Rules Extractor |
| current CR04 report 就绪，无 current CR05 report | Step 10.2 TODO Tracker |
| CR04/CR05 report 就绪，无 current/合法 completion gate | Step 10.3 Completion Gate |
| completion gate 为 PASS 且新鲜，finalizer 未 DONE | Step 10.4 Finalizer |
| finalizer 结构化 HALTED | Step 10.4 Finalizer（按 report 恢复动作重入，不回退 CR04/05；重入使用 goal records 冻结的 `crDir`，不重新解析——v2 finalizer 文件名不区分 DONE/HALTED，重解析会把 legacy-resume run 路由到 canonical；fresh session 按 Step 0 的定位规则先找回该 `crDir`，不得因 canonical 为空而落入 Step 4） |
| finalizer 为结构化 `DONE` | Step 11 Next Story |

同一证据同时指向多个 current 状态、hash/round 冲突或缺少前序 artifact 时 HALT，不得重跑 development 作为 fallback。

## Step 1: Records（执行记录）

在 `{crDir}/goal-execute-records/` 维护以下中文记录，不覆盖 append-only 历史：

| 文件 | 必须记录 |
|---|---|
| `PLAN.md` | 目标、Epic、Story 顺序、current Story/state/round、每步状态、artifact/hash/scope、终止条件、授权和唯一下一步 |
| `EXPERIMENTS.md` | 时间、Story、round、调用的 Skill/模型、调用原因、输入 artifact、结果、验证和下一状态 |
| `EXPERIMENT_NOTES.md` | 实时判断、决策理由、风险、equivalent implementation 依据、待关注问题和用户介入点 |

每个 Step 完成、HALT、重试、用户裁决或 state transition 前必须同步更新三个文件；更新失败时不得进入下一状态。Epic 完成前必须确认三份记录的最终状态不早于最后一次状态迁移。

## Step 2: Kickoff Gate（启动门禁）

运行 `/speclite-flow-gate mode=story-kickoff target={storyKey}`。只在 v2 schema、handoff v1、target/storyKey、result、foundation/closure status 和 freshness 全部合法时继续；hook 不替代显式检查。将 gate path、hash、result、foundation/closure status、freshness 和继续/HALT 决策写入三个 goal records。

## Step 3: Development（开发）

fresh sub-agent 执行 `/speclite-dev-story story {storyKey}`。等待完成并记录 files、commands、results、source mutation time。开发未完成不得 review。续跑时如果已有 current、合法且与当前 source state 一致的 development evidence，记录跳过依据并进入 Step 4，不得重复开发。

## Step 4: Scope（范围冻结）

- baseline 来自 development record、用户 commit range 或显式授权，不自动假设 main。
- 扫描 staged/unstaged/untracked 得到 actual changes。
- 对照 declared/excluded files；scope exception 非空时 HALT 裁决。
- 计算 `scopeHash`、`headSha`、`sourceMutationAt`。
- 检查 Contract Anchor -> Functional Anchor -> Evidence Anchor；Guidance Anchor 不得单独作为 hard gate。
- owning SPEC 未规定固定实现路径时，接受有测试、fixture、snapshot 或 command evidence 的 equivalent implementation，并在 `EXPERIMENT_NOTES.md` 记录依据。

## Step 5: Reviewer（审查）

fresh sub-agent 执行 `/speclite-code-review-01-reviewer {storyId} reviewSeries={reviewSeries} crDir={crDir} compatibilityMode={compatibilityMode} legacyArtifactPaths={legacyArtifactPaths} orchestrationMode=runner handoffTarget=runner`。验证 v2 schema、identity、round、scope hash、3/3 quorum 和 counts；无效时 HALT。记录 review path/hash、verdict、finding counts、failed layers 和下一状态。

## Step 6: Evaluator（评估）

另一个 fresh sub-agent 执行 `/speclite-code-review-02-evaluator {storyId} reviewSeries={reviewSeries} crDir={crDir} compatibilityMode={compatibilityMode} legacyArtifactPaths={legacyArtifactPaths} orchestrationMode=runner handoffTarget=runner`。要求 read-only、review hash 一对一绑定、同 round、fingerprint disposition、精确 verdict 和 convergence 数据。记录 evaluation path/hash、accepted counts、verdict、收敛输入和下一状态。

## Step 7: Convergence（收敛）

State Gate 和任何 fixer 之前，按 fingerprint 计算 `newBlocking`、`recurredBlocking`、`resolvedBlocking`、churn 和 architecture categories，并写入 `PLAN.md` 与 `EXPERIMENT_NOTES.md`。

默认 `maxRounds=5`、连续 3 轮存在 new blocking 即 stop-loss、`churnWatch=true`。命中 round 上限、连续新 blocking、同一 fingerprint 反复复现、同一位置反复修改且阻塞不下降或 architecture category 升级时，生成结构化 `STOP_LOSS` / `ARCHITECTURE_TRIAGE` 输入并 HALT；不得进入 fixer。

## Step 8: State Gate（状态门禁）

| 裁决 | 路由 |
|---|---|
| `PASS` | 进入收口 |
| `PASS_WITH_DEFERRED_TODOS` | rules -> TODO -> finalizer |
| `FIX_REQUIRED` | fixer `mode=patch` |
| `VERIFY_REQUIRED` | fixer `mode=verify-only` |
| `ARCHITECTURE_TRIAGE` / `STOP_LOSS` / `DECISION_NEEDED` | HALT 并请求用户裁决 |

未知 verdict 或 degraded review 不得继续。

## Step 9: Fixer（修复）

fresh sub-agent 执行 `/speclite-code-review-03-fixer {storyId} mode={patch|verify-only} confirmationPolicy={confirmationPolicy} authorizationSource={authorizationSource} crDir={crDir} compatibilityMode={compatibilityMode} legacyArtifactPaths={legacyArtifactPaths} orchestrationMode=runner handoffTarget=runner`。patch 只修 evaluator accepted P0/P1；verify-only 只补测试/断言/fixture/机械证据。完成后回到 Step 4，必须 fresh review/evaluate。

## Step 10: Closeout（收口）

按编号 strict serial 执行；每个 Skill 使用独立 fresh outer sub-agent，等待其完成、验证结构化输出并更新三个 goal records 后，才能启动下一项：

1. `/speclite-code-review-04-rules-extractor {storyId} crDir={crDir} compatibilityMode={compatibilityMode} legacyArtifactPaths={legacyArtifactPaths} orchestrationMode=runner handoffTarget=runner`
2. `/speclite-code-review-05-todo-tracker {storyId} mode=closeout confirmationPolicy={confirmationPolicy} authorizationSource={authorizationSource} crDir={crDir} compatibilityMode={compatibilityMode} legacyArtifactPaths={legacyArtifactPaths} orchestrationMode=runner handoffTarget=runner`
3. `/speclite-flow-gate mode=story-completion target={storyKey}`
4. `/speclite-code-review-06-finalizer {storyId} confirmationPolicy={confirmationPolicy} authorizationSource={authorizationSource} crDir={crDir} compatibilityMode={compatibilityMode} legacyArtifactPaths={legacyArtifactPaths} orchestrationMode=runner handoffTarget=runner`

CR04 必须返回 current `speclite.cr-rules-extraction.v2` report，CR05 必须返回 current `speclite.cr-todo-result.v2` report，CR06 必须返回 current `speclite.cr-finalizer.v2` report。步骤 3 由 runner 生成 current story-completion gate（result 必须为 `PASS`/`PASS_EQUIVALENT`，`generatedAt` 不早于 evaluation/最后 fixRecord 的 `sourceMutationAt`）；finalizer 只验证不生成 gate。延期裁决必须完成 finding fingerprint 到 TODO 的映射；finalizer 自身重新计算 scope，并验证该 gate 与 required tracker 一致性。任一 closeout Skill 失败、gate 非 PASS、缺少 durable report 或返回非 current 产物时 HALT，不得跳过后继续 finalizer。

## Step 11: Next Story（下一 Story）

只有结构化 `DONE`、Story/sprint/required workflow tracker 重读一致，且三个 goal records 已记录最终状态时推进。stop-loss/triage/decision-needed 结束循环但不完成 Story。

## Step 12: Commit（提交）

全部目标 Story 完成后执行 read-only git audit，明确 included/excluded scope。工作树存在无关改动时先隔离或询问，不得误提交。除非用户明确选择 no-commit，否则使用 `git-commit-convention` 生成中文本地提交；默认不 push。

## Common Mistakes（常见错误）

- 在 Convergence 前根据 `FIX_REQUIRED` 启动 fixer。
- 续跑时无视 current v2 artifact，从 development 或 round 1 重新开始。
- 依赖 hook 隐式触发，未显式执行或验证 kickoff gate。
- 在 development/reviewer/evaluator 未完成时启动下一外层角色。
- 把 reviewer 内部 quorum 并行误用为外层并行。
- fixer 或 verify-only 后未重新冻结 scope、fresh review 和 fresh evaluate。
- 把 stop-loss、triage 或 decision-needed 当成 Story `DONE`。
- 漏掉 rules extractor、TODO tracker 或 finalizer，或在三者之间复用未隔离的角色上下文。
- 覆盖 goal records 历史，或状态迁移后未更新三个文件。
- 把 Guidance Anchor、历史固定路径或未声明工作树改动当成 hard gate/commit scope。
- 未经用户授权扩大需求、修改范围、删除内容或 push。

## Invocation Template（调用模板）

当用户只给出 Epic ID 时，将请求展开为以下目标；字段值仍须通过 preflight 和 runtime resolver 确认：

```text
Epic {epicId} Story development/CR goal:
1. Resolve runtime config, Epic Story scope, current structured artifacts, goal records and Git scope.
2. For each Story, strict serial only:
   kickoff gate -> development -> scope -> reviewer -> evaluator
   -> convergence -> verdict route -> fixer/verify-only when authorized
   -> fresh scope/review/evaluation -> rules -> TODO -> finalizer.
3. Update PLAN.md, EXPERIMENTS.md and EXPERIMENT_NOTES.md after every state transition.
4. STOP_LOSS / ARCHITECTURE_TRIAGE / DECISION_NEEDED halt for user decision and never mark the Story done.
5. Advance only on structured DONE plus tracker reread consistency.
6. After all target Stories complete, audit included/excluded Git scope and run an authorized local Chinese Conventional Commit; no push by default.
```
