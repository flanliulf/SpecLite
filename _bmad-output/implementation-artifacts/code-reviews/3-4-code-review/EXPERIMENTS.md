# EXPERIMENTS

## 尝试记录

### 2026-05-28 初始化

- 方案: 为 Story 3.4 创建 code review 进度文件，并按 dev -> CR -> evaluator -> fixer -> 复检 -> rules/todo/finalizer 的顺序推进。
- 选择原因: 用户要求每个 Story 在对应 code review 输出目录维护中文进度记录，且所有步骤必须严格串行。
- 结果: 已初始化，等待前序 Story 完成后开始。

### 2026-05-28 dev-story fresh sub-agent 启动

- 方案: 收敛本轮计划为仅执行 `/bmad-dev-story story 3-4`，不执行 CR、finalizer、提交或推送。
- 选择原因: 用户本轮硬性约束要求只执行 Story 3.4 的开发步骤，并在完成后进入 `review`。
- 结果: 已读取 workflow、config、project context、Story、sprint status 和 worktree dirty 状态；确认前置 TypeScript scaffold 与 validate anchors 已存在，继续实现 Story 3.4 缺口。

### 2026-05-28 Story 3.4 focused implementation

- 方案: 在既有 validation 架构内新增 `runtime-path`、`legacy-namespace` rules；扩展 manifest-schema 读取 `phase-coverage.json`；在 `validateProject` 中接入 runtime/menu/legacy/artifact categories；补 focused tests 与 validate integration 断言。
- 选择原因: Story 明确要求 `src/commands/validate.ts` 只做 orchestration，规则逻辑必须在 validation/rules 与 aggregation 层完成。
- 结果: `npm run build` 通过；focused validation tests 通过，覆盖 runtime path、legacy namespace、menu target、artifact path 和 validate projection。

### 2026-05-28 HALT blocker

- 方案: 执行完整 `npm test` 作为 Step 9 回归门。
- 选择原因: `bmad-dev-story` 要求完整回归通过后才能推进 `review`。
- 结果: 完整回归失败 2 项，均为既有 hash fixture 期望值不匹配：`test/ide-target-writer.test.ts` 与 `test/runtime-structure.test.ts`。这些失败不在 Story 3.4 修改面内，且修复需要更新无关 install/fixture hash；按用户范围约束不处理，Story 保持 `in-progress`。

### 2026-05-28 HALT 收尾复核

- 方案: 重新运行两个失败测试，并读取 `test/ide-target-writer.test.ts`、`test/runtime-structure.test.ts`、`src/manifest/hash.ts`、`src/fs/copy-tree.ts` 和 `skill-index-speclite-dev-story.json`。
- 选择原因: 用户要求先用真实测试输出和相关 fixture 内容判断 2 个失败是否只是 deterministic baseline drift。
- 结果: 不能判定为只需更新两个 fixture baseline。`runtime-structure` 失败是 expected `sha256:477272...` / actual `sha256:cabe9...` 的 fixture drift 候选；但 `ide-target-writer` 失败不是静态 fixture 旧值，而是测试内现算的 `installedSurfaceHash` 与安装后目录 hash 不一致。当前 `hashPackageDirectory(..., { include })` 会在目录名未匹配 include 时跳过遍历 `references/`，而 `copyCanonicalPackage` 会复制 `references/details.md`。解除该失败需要修改 hash/include 语义或调整测试语义，超出“只更新两个相关 fixture/期望文件”的安全范围。因此继续 HALT，Story 不推进 `review`。

### 2026-05-28 shared hash helper include traversal 修复

- 方案: 只修改 `src/manifest/hash.ts` 的 `listFiles()` 目录遍历语义：目录始终继续递归，include predicate 只决定 file 是否进入结果和 symlink 是否触发 canonical package hash 错误。
- 选择原因: `copyCanonicalPackage()` 的实际复制面来自先完整列出文件再用 `isInstallableCanonicalPackageFile()` 过滤；hash helper 把同一个 file-level predicate 用在目录节点上，会漏掉 `references/details.md`。这是 shared helper traversal bug，不是单纯 fixture drift。
- 结果: `npm test -- --run test/ide-target-writer.test.ts test/runtime-structure.test.ts` 通过，未产生需要同步的 deterministic fixture 期望；Story 3.4 focused tests、`npm run build`、完整 `npm test` 和 `git diff --check` 均通过，Story 推进到 `review`。

### 2026-05-28 CR round 1 启动

- 方案: 触发 `/bmenhance-cr-01-reviewer 3-4`，仅审查 Story 3.4 File List 中的源码与测试变更，重点复核 runtime-path、menu-target、legacy-namespace、artifact-path validation 和 `src/manifest/hash.ts` 最小修复。
- 选择原因: 用户要求作为 fresh sub-agent 只执行 Story 3.4 代码审查，不修复、不提交、不触碰无关改动。
- 结果: 已确认本轮为第 1 轮；当前环境无 Agent 工具，按 skill 降级为串行三层审查模式。

### 2026-05-28 CR round 1 完成

- 方案: 汇总三层审查结果，按四桶分类生成 `3-4-code-review-summary-20260528-round-1.md`。
- 选择原因: `artifact-path` metadata command path、`legacy-namespace` installed skill content 检查和 runtime symlink 分类存在可定位 findings。
- 结果: 生成 3 个 patch findings；blocking/decision_needed 0，defer 0。建议进入 evaluator 评估，不建议直接通过。

### 2026-05-28 CR evaluation round 1

- 方案: 触发 `/bmenhance-cr-02-evaluator 3-4`，只评估最新 `3-4-code-review-summary-20260528-round-1.md` 的 3 个 patch findings。
- 选择原因: 用户要求 fresh sub-agent 严格执行 Story 3.4 CR 评估步骤，源码和 Story 文档只读，允许写 evaluation 与本 CR 目录进度文件。
- 结果: 生成 `3-4-code-review-evaluation-20260528-round-1.md`；3 个 findings 均确认有效，均需进入 fixer；TODO 0，误报 0。

### 2026-05-28 CR fixer round 1

- 方案: 触发 `/bmenhance-cr-03-fixer 3-4`，仅修复 evaluation round 1 确认的 3 个 P1 项：artifact metadata production validate、installed `SKILL.md` legacy config reference、runtime symlink escape realpath 分类。
- 选择原因: 三项均为 Story 3.4 AC 验收相关 patch，evaluation 明确要求进入 fixer；用户要求不得扩大修复范围。
- 结果: 已完成 3/3 项修复，并追加 `3-4-code-review-evaluation-20260528-round-1.md` 修复执行记录；focused tests、`npm run build`、完整 `npm test`、`git diff --check` 均通过。可进入复审 reviewer。

### 2026-05-28 CR round 2 复审启动

- 方案: 触发 `/bmenhance-cr-01-reviewer 3-4` Round 2，参考 Round 1 summary、evaluation 和修复执行记录，重点验证 3 个 patch 是否闭环，并检查是否引入新问题。
- 选择原因: 用户要求作为 fresh sub-agent 只执行 Story 3.4 Round 2 复审，不修复、不提交、不触碰无关改动。
- 结果: 已确认当前审查轮次为 Round 2；当前环境无 Agent 工具，按 skill 降级为串行三层审查模式。

### 2026-05-28 CR round 2 完成

- 方案: 汇总 Round 2 三层复审结果，按四桶分类生成 `3-4-code-review-summary-20260528-round-2.md`。
- 选择原因: Round 1 Finding #1 对 file artifact metadata 已闭环，但 directory artifact metadata 仍未按 AC5 / Artifact Path Contract Notes 覆盖。
- 结果: 生成 1 个 patch finding；blocking/decision_needed 0，defer 0。建议进入 evaluator 评估，不建议直接通过。

### 2026-05-28 CR evaluation round 2

- 方案: 触发 `/bmenhance-cr-02-evaluator 3-4`，只评估最新 `3-4-code-review-summary-20260528-round-2.md` 的 1 个 patch finding。
- 选择原因: 用户要求作为 fresh sub-agent 严格执行 Story 3.4 Round 2 CR 评估步骤，源码和 Story 文档只读，允许写 evaluation 与本 CR 目录进度文件。
- 结果: 生成 `3-4-code-review-evaluation-20260528-round-2.md`；directory artifact metadata finding 确认有效，需进入 fixer；TODO 0，误报 0。

### 2026-05-28 CR fixer round 2

- 方案: 触发 `/bmenhance-cr-03-fixer 3-4`，仅修复 evaluation round 2 确认的 1 个 P1 项：production validation 需要发现 directory artifact 的 `<directory>/metadata.json`。
- 选择原因: 该项直接对应 Story 3.4 AC5 / Artifact Path Contract Notes，且 evaluation 明确要求进入 fixer；用户要求不得扩大修复范围。
- 结果: 已完成 1/1 项修复，并追加 `3-4-code-review-evaluation-20260528-round-2.md` 修复执行记录；focused test、`npm run build`、完整 `npm test`、`git diff --check` 均通过。可进入 Round 3 复审 reviewer。

### 2026-05-28 CR round 3 复审启动

- 方案: 触发 `/bmenhance-cr-01-reviewer 3-4` Round 3，参考 Round 1 / Round 2 历史 CR、最新 evaluation 和修复执行记录，重点复核 directory artifact `<directory>/metadata.json` production validation。
- 选择原因: 用户要求作为 fresh sub-agent 只执行 Story 3.4 Round 3 复审，不修复、不提交、不触碰无关改动。
- 结果: 已确认当前审查轮次为 Round 3；当前环境无 Agent 工具，按 skill 降级为串行三层审查模式。

### 2026-05-28 CR round 3 完成

- 方案: 汇总 Round 3 三层复审结果，按四桶分类生成 `3-4-code-review-summary-20260528-round-3.md`。
- 选择原因: Round 2 directory artifact metadata 修复已闭环，但 artifact-path symlink 分类仍会把项目内 symlink 误报为 `artifact-path.symlink-escape`，与 AC5 issue mapping 不一致。
- 结果: 生成 1 个 patch finding；blocking/decision_needed 0，defer 0。建议进入 evaluator 评估，不建议直接通过。

### 2026-05-28 CR evaluation round 3

- 方案: 触发 `/bmenhance-cr-02-evaluator 3-4`，只评估最新 `3-4-code-review-summary-20260528-round-3.md` 的 1 个 patch finding。
- 选择原因: 用户要求作为 fresh sub-agent 严格执行 Story 3.4 Round 3 CR 评估步骤，源码和 Story 文档只读，允许写 evaluation 与本 CR 目录进度文件。
- 结果: 生成 `3-4-code-review-evaluation-20260528-round-3.md`；artifact-path project-internal symlink finding 确认有效，需进入 fixer；TODO 0，误报 0。

### 2026-05-28 CR fixer round 3

- 方案: 触发 `/bmenhance-cr-03-fixer 3-4`，仅修复 evaluation round 3 确认的 1 个 P1 项：artifact path symlink validation 不应把项目内 symlink 误报为 `artifact-path.symlink-escape`。
- 选择原因: 该项直接对应 Story 3.4 reserved issue mapping，evaluation 明确要求进入 fixer；用户要求不得扩大修复范围。
- 结果: 已完成 1/1 项源码与 regression 修复，并追加 `3-4-code-review-evaluation-20260528-round-3.md` 修复执行记录；focused tests、`npm run build`、完整 `npm test`、`git diff --check` 均通过。可进入 Round 4 复审 reviewer。

### 2026-05-28 CR round 4 复审启动

- 方案: 触发 `/bmenhance-cr-01-reviewer 3-4` Round 4，参考 Round 1-3 历史 CR、最新 evaluation 和 Round 3 修复执行记录，重点复核 artifact path symlink realpath boundary。
- 选择原因: 用户要求作为 fresh sub-agent 只执行 Story 3.4 Round 4 复审，不修复、不提交、不触碰无关改动。
- 结果: 已确认当前审查轮次为 Round 4；当前环境无 Agent 工具，按 skill 降级为串行三层审查模式。

### 2026-05-28 CR round 4 完成

- 方案: 汇总 Round 4 三层复审结果，按四桶分类生成 `3-4-code-review-summary-20260528-round-4.md`。
- 选择原因: Round 3 artifact path symlink realpath boundary 修复已有源码与 regression 证据，本轮需确认项目内 symlink 不再误报、symlink escape 仍报告。
- 结果: 未发现新 findings；blocking/decision_needed 0，patch 0，defer 0。建议通过本轮 CR，可进入 evaluator。

### 2026-05-28 CR evaluation round 4

- 方案: 触发 `/bmenhance-cr-02-evaluator 3-4`，只评估最新 `3-4-code-review-summary-20260528-round-4.md` 的通过结论。
- 选择原因: 用户要求作为 fresh sub-agent 严格执行 Story 3.4 Round 4 CR 评估步骤，只读源码和 Story 文档，允许写 evaluation 与本 CR 目录进度文件。
- 结果: 生成 `3-4-code-review-evaluation-20260528-round-4.md`；Round 4 reviewer 通过结论确认成立；需修复项 0，TODO/记录项 0，误报 0，可进入 rules/todo/finalizer。

### 2026-05-28 CR rules extractor 收尾

- 方案: 触发 `bmenhance-cr-04-rules-extractor 3-4`，读取 Story 3.4 Round 1-4 review/evaluation/fix records，按 promotion rules 做量化判定，并采用用户授权默认决策执行 record-only。
- 选择原因: Round 4 reviewer/evaluator 已双通过；本轮只允许沉淀 CR 规则总结，不修改全局文档。
- 结果: 向 `cr-rules-summary.md` 追加 Story 3-4 记录，新增 `CR-API-18` 与 `CR-SEC-08` 两条 rules-summary 规则；无全局文档修改，无 TODO 交接项。

### 2026-05-28 CR TODO tracker 收尾

- 方案: 触发 `bmenhance-cr-05-todo-tracker 3-4`，从 Story 3.4 CR 历史中只筛选 non-blocking / defer / 后续改善项。
- 选择原因: 用户明确禁止把 blocking 问题降级为 TODO；Round 1-3 findings 均已由 evaluator 确认为 P1 阻塞修复，Round 4 明确 CR TODO 0。
- 结果: 无新增 TODO；`cr-todo-backlog.md` 保持不变。

### 2026-05-28 CR finalizer 收尾

- 方案: 触发 `bmenhance-cr-06-finalizer 3-4`，先验证最新 evaluation round 4 为 Approved，再更新 Story 文件与 `sprint-status.yaml`。
- 选择原因: finalizer 前置条件已满足，且用户要求完成 CR 收尾同步。
- 结果: Story 3.4 从 `review` 更新为 `done`；`sprint-status.yaml` 对应条目更新为 `done` 并刷新 `last_updated`；`bmm-workflow-status.yaml` 不存在，按容错规则跳过；Epic 3 尚有未完成 Story，Epic 主状态保持 `in-progress`。
