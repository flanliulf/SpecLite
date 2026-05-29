# PLAN

## Scope（范围）

- Story: `3-2-manifest-and-index-schema-validation`
- Story 文件: `_bmad-output/implementation-artifacts/stories/3-2-manifest-and-index-schema-validation.md`
- 本轮触发: `/bmad-dev-story story 3-2`
- 本轮只执行 Story 3.2 的 dev-story 开发步骤；不执行 CR、评估、修复循环、finalizer、提交或推送。

## Execution Plan（执行计划）

### Dev Story（已完成）

1. 激活 `bmad-dev-story` workflow，读取配置、Story、`sprint-status.yaml` 和项目上下文。
2. 将 Story 3.2 与 sprint status 从 `ready-for-dev` 推进到 `in-progress`。
3. 完整核对 Story 指定的 implementation anchors 与 dirty worktree，确认前置实现已存在。
4. 按 Story 任务顺序执行 RED-GREEN-REFACTOR：
   - 先补 manifest/index schema validation focused tests；
   - 再实现 executable schemas、`manifest-schema` rule、`validateProject` aggregation、`speclite validate` command 和 shared output；
   - 最后补足 deterministic/local-only/boundary tests。
5. 运行 focused tests、`npm run build`、`npm test` 和 diff 范围检查。
6. 仅在所有 AC 与任务满足后，更新 Story 允许区域、File List、Change Log，并将 Story/sprint status 推进到 `review`。

### CR Round 1（已完成）

1. 按 `bmenhance-cr-01-reviewer` 读取配置、Story 与 CR 目录，检测当前轮次。
2. 构建 Story 3.2 相关审查输入：Story `File List` 中的源码/测试，以及为满足 files-index schema shape 产生的相关 installer/fixture 投影差异。
3. 在 Agent 工具不可用时降级为当前上下文串行三层审查：Blind Hunter、Edge Case Hunter、Acceptance Auditor。
4. 对发现去重，按 `decision_needed` / `patch` / `defer` / `dismiss` 四桶分类并标注严重性。
5. 生成 CR summary，清理 `.tmp/`，汇报 blocking/patch/defer 数量和 evaluator 进入建议。

### CR Evaluation Round 1（已完成）

1. 按 `bmenhance-cr-02-evaluator` 读取配置、输出模板与最新 CR summary。
2. 确认最新审查结果为 `3-2-code-review-summary-20260528-round-1.md`，当前评估轮次为 Round 1。
3. 只读核对 Story AC、`manifest-schema` rule、runtime schema、focused tests 和相关既有 ready-check 逻辑。
4. 对 reviewer 的 1 个 finding 逐条评估：确认有效、需修复，不降级 TODO，不判定误报。
5. 生成 `3-2-code-review-evaluation-20260528-round-1.md`；不修复源码、不修改 Story、不提交、不推送。

### CR Fix Round 1（已完成）

1. 按 `bmenhance-cr-03-fixer` 读取配置与最新评估文件，确认待修复项只有 1 个。
2. 只修复 `skill-index` selected canonical package root 覆盖校验缺口，不处理非评估确认事项。
3. 在 `src/validation/rules/manifest-schema.ts` 增加 baseline 数量正确时的 selected root 唯一覆盖校验。
4. 在 `test/validate-command.test.ts` 增加“总数仍为 53 但 root 缺失并由重复 root 补齐”的 focused regression。
5. 追加评估文件修复记录，运行 focused test 与 `git diff --check`；不修改 Story 文档、不提交、不推送。

### CR Round 2 复审（已完成）

1. 按 `bmenhance-cr-01-reviewer` 检测历史 CR summary，确认本轮为 Round 2 复审。
2. 读取 Round 1 CR summary、Round 1 evaluation 和其中的修复执行记录，建立复审上下文。
3. 重点复核 selected canonical package root 覆盖校验修复：源码逻辑、同 count 缺 root 回归测试、stable `manifest-schema` issue 输出。
4. 仅审查 Story 3.2 File List 相关源码/测试与修复差异，不修复、不改 Story、不提交、不推送。
5. 生成 Round 2 CR summary，清理 `.tmp/`，汇报 blocking/patch/defer 数量和是否可进入 evaluator。

### CR Evaluation Round 2（已完成）

1. 按 `bmenhance-cr-02-evaluator` 读取配置、输出模板与最新 CR summary。
2. 确认最新审查结果为 `3-2-code-review-summary-20260528-round-2.md`，当前评估轮次为 Round 2。
3. 只读核对 Story AC 3、`manifest-schema` rule、Round 1 修复记录、focused regression 和相近 ready-check expected inventory 逻辑。
4. 对 Round 2 reviewer 的 1 个 finding 逐条评估：确认有效、需继续修复，不降级 TODO，不判定误报。
5. 生成 `3-2-code-review-evaluation-20260528-round-2.md`；不修复源码、不修改 Story、不提交、不推送。

### CR Fix Round 2（已完成）

1. 按 `/bmenhance-cr-03-fixer 3-2` 读取配置与最新 Round 2 评估文件，确认待修复项只有 1 个。
2. 只修复 selected canonical package root inventory 与 actual skill-index root set 未做 equality 的缺口。
3. 在 `src/validation/rules/manifest-schema.ts` 增加 `core+sdlc` baseline 的 expected canonical package root inventory，并对 actual `moduleId:sourcePackagePath` set 做 missing/unexpected equality 校验。
4. 在 `test/validate-command.test.ts` 将 valid projection helper 改为真实 canonical package root inventory，并补充“总数 53、无 duplicate、module count 正确但 expected root 被唯一 unexpected root 替换”的 focused regression。
5. 追加 Round 2 评估文件修复记录，运行 focused test、build 与 `git diff --check`；不修改 Story 文档、不提交、不推送。

### CR Round 3 复审（已完成）

1. 按 `/bmenhance-cr-01-reviewer 3-2` 检测历史 CR summary，确认本轮为 Round 3 复审。
2. 读取 Round 1/2 CR summary、Round 1/2 evaluation，重点参考 Round 2 evaluation 中的修复执行记录。
3. 只读复核 `src/validation/rules/manifest-schema.ts` 和 `test/validate-command.test.ts` 中的 expected canonical package root set equality 实现与 regression。
4. 对照当前 source-side canonical package roots，确认 expected inventory 的 `core=13`、`sdlc=40` 与实际 `SKILL.md` package roots 一致。
5. 生成 Round 3 CR summary；不修复、不改 Story、不提交、不推送。

### CR Evaluation Round 3（已完成）

1. 按 `/bmenhance-cr-02-evaluator 3-2` 读取配置、输出模板与最新 CR summary。
2. 确认最新审查结果为 `3-2-code-review-summary-20260528-round-3.md`，当前评估轮次为 Round 3。
3. 独立核对 Round 2 阻塞项修复：expected canonical package root inventory、actual root set equality、missing/unexpected diagnostics 与 focused regression。
4. 复核当前 source-side canonical package root count：`core=13`、`sdlc=40`，与 expected inventory 一致。
5. 生成 `3-2-code-review-evaluation-20260528-round-3.md`；结论为 Approved / 通过；不修复源码、不修改 Story、不提交、不推送。

### CR Rules Extraction 04（已完成）

1. 按 `/bmenhance-cr-04-rules-extractor 3-2` 严格在 Round 3 Approved 后执行。
2. 读取 Round 1-3 CR summary/evaluation 与修复执行记录，分析 findings、重复模式、修复闭环和可复用规则。
3. 对候选规则执行硬性门槛与 6 维评分，默认采用用户授权的推荐决策。
4. 将已解决、可复用但不宜升格全局的规则按 record-only 写入 `cr-rules-summary.md`；不修改全局文档。

### CR TODO Tracker 05（已完成）

1. 按 `/bmenhance-cr-05-todo-tracker 3-2` 在 04 完成后执行。
2. 只筛选 non-blocking / defer / 后续改善项，禁止把 P1 blocking finding 降级为 TODO。
3. 读取 Round 3 evaluator，确认 CR TODO 为 0。
4. 记录“无新增 TODO”，不修改 `cr-todo-backlog.md`。

### CR Finalizer 06（已完成）

1. 按 `/bmenhance-cr-06-finalizer 3-2` 在 05 完成后执行。
2. 验证最新 evaluation 为 Round 3 且结论 Approved / 通过。
3. 将 Story 文件与 `sprint-status.yaml` 中 Story 3.2 状态同步为 `done`。
4. 若 `bmm-workflow-status.yaml` 不存在则按 skill 容错跳过。
5. Epic 3 仍有未完成 Story，不主动修改 Epic 主状态。

## Decision Rules（决策规则）

- 只改 Story 3.2 明确映射的源码、测试、Story 允许区域、sprint status 和本目录进度文件。
- 不修改 `_bmad-output/planning-artifacts/`、其他 story 文件或既有无关改动。
- 不实现 Story 3.3+ 的 full hash scan、IDE mirror drift、runtime/menu legacy validation、update/repair 或 remote provenance 行为。
- 若出现不确定但可保守处理的实现选择，默认采用 local-only、read-only、stable issue id 的最小方案并记录。
