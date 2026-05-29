# PLAN

## 范围

- Story: `3-4-runtime-path-menu-target-legacy-entry-and-artifact-path-validation`
- Story 文件: `_bmad-output/implementation-artifacts/stories/3-4-runtime-path-menu-target-legacy-entry-and-artifact-path-validation.md`
- 当前目标: 作为 fresh sub-agent 只处理上一轮 HALT 的最小技术修复与收尾；根因已确认是 shared hash helper include traversal bug，而不是单纯 fixture drift。

## 串行计划

1. 完成 `bmad-dev-story` activation、读取完整 Story、sprint status、project context、当前进度记录和 worktree 状态。
2. 复现上一轮 2 个 hash 失败，读取相关测试、fixture、hash helper 和 copy/index 逻辑。
3. 判断失败是否都是 deterministic fixture baseline drift；若不是，限定在 blocker 根因上做最小修复。
4. 修复 `src/manifest/hash.ts` 的 include traversal 语义，并只更新由该修复导致的 deterministic 期望。
5. 执行 targeted hash regression、focused Story 3.4 tests、`npm run build`、`npm test` 和 `git diff --check`。
6. 只有全部验证通过后，才更新 Story 允许区域和 sprint status 到 `review`；否则保持 `in-progress`。

## 决策原则

- 只执行本轮用户要求的 dev-story，不提前进入 CR/fixer/finalizer。
- 需要决策时采用保守方案并记录在 `EXPERIMENT_NOTES.md`，避免等待用户。
- Blocking 问题必须写入 `EXPERIMENT_NOTES.md`，并保留命令证据。
- 不回滚或覆盖本轮开始前已经存在的未提交改动。

## 当前结果

- HALT 已解除。
- Story 3.4 已推进到 `review`。
- 本轮只修改 shared hash helper include traversal、Story 3.4 允许区域、sprint status 和 3-4 code review 进度记录。

## CR 计划（2026-05-28）

1. 定位 Story 3.4、确认 CR 目录和轮次。
2. 从 Story File List 提取审查范围，仅构造 Story 3.4 相关 diff。
3. 按 `bmenhance-cr-01-reviewer` 串行执行 Blind Hunter、Edge Case Hunter、Acceptance Auditor 三层审查。
4. 对 findings 去重并按 decision_needed / patch / defer / dismiss 分类。
5. 运行允许的只读验证命令，生成第 1 轮 CR summary。

## CR 评估计划（2026-05-28）

1. 按 `bmenhance-cr-02-evaluator` 配置定位 Story `3-4` 的最新 review summary。
2. 只评估 `_bmad-output/implementation-artifacts/code-reviews/3-4-code-review/3-4-code-review-summary-20260528-round-1.md` 中的 3 个 patch findings。
3. 只读核对 Story AC、review 原文、相关源码和测试证据，不修复源码、不修改 Story 文件。
4. 按 output template 生成第 1 轮 evaluation 文件。
5. 更新本 CR 目录进度文件，记录评估结论和是否可进入 fixer。

## CR 修复计划（2026-05-28）

1. 按 `bmenhance-cr-03-fixer` 配置定位 Story `3-4` 最新 evaluation 文件。
2. 只处理 evaluation round 1 明确标记为“需要修复”的 3 个 P1 项。
3. 修复 `validateProject` artifact aggregation，使 production validate 只读读取 workflow artifact metadata 并传入 artifact-path rule。
4. 修复 `legacy-namespace` validation，只检查当前 installed canonical `SKILL.md` 中的 legacy config references。
5. 修复 `runtime-path` symlink 分类，只在 symlink realpath 逃出 project boundary 时报告 `runtime-path.symlink-escape`。
6. 追加 evaluation 修复记录，更新本目录进度文件，并运行 focused test、`npm run build`、`npm test`、`git diff --check`。

## CR Round 2 复审计划（2026-05-28）

1. 按 `bmenhance-cr-01-reviewer` 配置确认 Story `3-4` 当前审查轮次为 Round 2。
2. 读取 Round 1 review summary、evaluation 和修复执行记录，建立 3 个 patch 修复项的复审清单。
3. 只读复核 Story 3.4 相关源码与测试，重点覆盖 runtime-path、menu-target、legacy-namespace、artifact-path validation 和 `src/manifest/hash.ts` include traversal 修复。
4. 按降级串行模式执行 Blind Hunter、Edge Case Hunter、Acceptance Auditor 三层审查，去重后按四桶分类。
5. 运行 focused regression、`npm run build`、`npm test`、`git diff --check`，生成 Round 2 CR summary。

## CR Round 2 评估计划（2026-05-28）

1. 按 `bmenhance-cr-02-evaluator` 配置定位 Story `3-4` 最新 review summary。
2. 只评估 `_bmad-output/implementation-artifacts/code-reviews/3-4-code-review/3-4-code-review-summary-20260528-round-2.md` 中的 1 个 patch finding。
3. 只读核对 Story AC、Round 2 review 原文、`validate-project.ts` artifact discovery、`artifact-path.ts` metadata validation、command-level tests 和 directory artifact metadata contract。
4. 按 output template 生成第 2 轮 evaluation 文件。
5. 更新本 CR 目录进度文件，记录评估结论和是否可进入 fixer。

## CR Round 2 修复计划（2026-05-28）

1. 按 `bmenhance-cr-03-fixer` 配置定位 Story `3-4` 最新 evaluation 文件。
2. 只处理 `_bmad-output/implementation-artifacts/code-reviews/3-4-code-review/3-4-code-review-evaluation-20260528-round-2.md` 明确标记为“需要修复”的 1 个 P1 项。
3. 修复 production artifact discovery，使 directory artifact 的 `<directory>/metadata.json` 被识别并传入 `validateArtifactPathContract()`。
4. 补充 command-level regression，覆盖 directory artifact metadata 缺失 required keys 和值域非法。
5. 追加 evaluation 修复记录，更新本目录进度文件，并运行 focused test、`npm run build`、`npm test`、`git diff --check`。

## CR Round 3 复审计划（2026-05-28）

1. 按 `bmenhance-cr-01-reviewer` 配置确认 Story `3-4` 当前审查轮次为 Round 3。
2. 读取 Round 1 / Round 2 review summary、evaluation 和最新修复执行记录，建立复审清单。
3. 重点验证 directory artifact `<directory>/metadata.json` production validation 是否真正闭环。
4. 回归确认 Round 1 其他修复仍闭环：installed canonical `SKILL.md` legacy config reference、runtime symlink realpath boundary 分类，以及 `src/manifest/hash.ts` include traversal。
5. 按降级串行模式执行 Blind Hunter、Edge Case Hunter、Acceptance Auditor 三层审查，去重后按四桶分类。
6. 运行 focused regression、`npm run build`、`npm test`、`git diff --check`，生成 Round 3 CR summary。

## CR Round 3 评估计划（2026-05-28）

1. 按 `bmenhance-cr-02-evaluator` 配置定位 Story `3-4` 最新 review summary。
2. 只评估 `_bmad-output/implementation-artifacts/code-reviews/3-4-code-review/3-4-code-review-summary-20260528-round-3.md` 中的 1 个 patch finding。
3. 只读核对 Story issue mapping、Round 3 review 原文、`artifact-path.ts` symlink 分类、`runtime-path.ts` realpath 对照和现有 symlink regressions。
4. 用临时目录独立复现项目内 artifact symlink 被误报为 `artifact-path.symlink-escape`，不改仓库源码或 Story 文件。
5. 按 output template 生成第 3 轮 evaluation 文件，并更新本 CR 目录进度记录。

## CR Round 3 修复计划（2026-05-28）

1. 按 `bmenhance-cr-03-fixer` 配置定位 Story `3-4` 最新 evaluation 文件。
2. 只处理 `_bmad-output/implementation-artifacts/code-reviews/3-4-code-review/3-4-code-review-evaluation-20260528-round-3.md` 明确标记为“需要修复”的 1 个 P1 项。
3. 修复 `artifact-path` symlink 分类，使 symlink segment 解析后的 realpath 仍位于 project boundary 内时不报告 `artifact-path.symlink-escape`，只有逃出 project boundary 才报告 escape。
4. 补充 artifact path project-internal symlink regression，并保留 project-external symlink escape regression。
5. 追加 evaluation 修复记录，更新本目录进度文件，并运行 focused test、`npm run build`、`npm test`、`git diff --check`。

## CR Round 4 复审计划（2026-05-28）

1. 按 `bmenhance-cr-01-reviewer` 配置确认 Story `3-4` 当前审查轮次为 Round 4。
2. 读取 Round 1-3 review summary、evaluation 和最新 Round 3 修复执行记录，建立复审清单。
3. 重点验证 artifact path project-internal symlink 不再误报，project-external symlink escape 仍报告 `artifact-path.symlink-escape`。
4. 回归确认 Round 1 / Round 2 修复仍闭环：runtime symlink realpath boundary、installed canonical `SKILL.md` legacy config reference、directory artifact metadata validation，以及 `src/manifest/hash.ts` include traversal。
5. 按降级串行模式执行 Blind Hunter、Edge Case Hunter、Acceptance Auditor 三层审查，去重后按四桶分类。
6. 运行 focused regression、`npm run build`、`npm test`、`git diff --check`，生成 Round 4 CR summary。

## CR Round 4 评估计划（2026-05-28）

1. 按 `bmenhance-cr-02-evaluator` 配置定位 Story `3-4` 最新 review summary。
2. 只评估 `_bmad-output/implementation-artifacts/code-reviews/3-4-code-review/3-4-code-review-summary-20260528-round-4.md` 的通过结论，不评估其他 Story 或其他 CR 目录。
3. 只读核对 Round 3 artifact path symlink 修复，以及 Round 1 / Round 2 历史修复闭环证据。
4. 运行 focused regression、`npm run build`、完整 `npm test`、`git diff --check` 验证通过结论。
5. 按 output template 生成第 4 轮 evaluation 文件，并更新本 CR 目录进度记录。

## CR 收尾计划（2026-05-28）

1. 严格先执行 `bmenhance-cr-04-rules-extractor 3-4`，只分析 `_bmad-output/implementation-artifacts/code-reviews/3-4-code-review/` 的 Round 1-4 CR 历史。
2. 采用用户授权的默认推荐决策：可复用但不宜升格全局的规则走 record-only；Story 特定或无复用价值项记录不沉淀；不修改全局文档。
3. 完成 04 后再执行 `bmenhance-cr-05-todo-tracker 3-4`，只处理 non-blocking 项，不把 blocking 问题降级为 TODO。
4. 完成 05 后再执行 `bmenhance-cr-06-finalizer 3-4`，先验证最新 evaluator 为 Approved，再同步 Story 与 sprint status 为 `done`。
5. `bmm-workflow-status.yaml` 若不存在则按 finalizer 容错规则跳过；Epic 主状态不主动修改，仅记录该默认决策。
