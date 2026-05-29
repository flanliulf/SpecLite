# EXPERIMENTS

## 尝试记录

### 2026-05-28 初始化

- 方案: 为 Story 3.3 创建 code review 进度文件，并按 dev -> CR -> evaluator -> fixer -> 复检 -> rules/todo/finalizer 的顺序推进。
- 选择原因: 用户要求每个 Story 在对应 code review 输出目录维护中文进度记录，且所有步骤必须严格串行。
- 结果: 已初始化，等待前序 Story 完成后开始。

### 2026-05-28 Dev-only 范围收敛

- 方案: 将本次执行范围收敛为只执行 `/bmad-dev-story story 3-3`，不进入 CR、finalizer、提交或推送。
- 选择原因: 用户本轮硬性要求“只执行 Story 3.3 的开发步骤”，完成条件是实现、测试、验证完成并推进到 `review`。
- 结果: 计划已更新；开始读取 Story、sprint status、project context 和前置实现文件。

### 2026-05-28 Red / Green / Refactor

- 方案: 先在 `test/validate-command.test.ts` 增加 focused validation tests，覆盖 valid installed mirrors、missing entry、hash mismatch、duplicate entry、adapter artifact exclusion、files-index mismatch/missing/unknown ownership、redaction 和 3 次 determinism。
- 结果: 首次 focused test 红灯，显示当前 validate 只执行 `manifest-schema`，不会报告 `ide-mirror` / `file-integrity`。
- 实现: 新增 `src/validation/rules/ide-mirror.ts` 与 `src/validation/rules/file-integrity.ts`；扩展 `src/validation/validate-project.ts` 在 schema validation 成功后执行两类 rules；调整 `src/manifest/hash.ts` 为 Story 3.3 的 canonical package hash framing；调整 `src/diagnostics/command-result.ts` 的 issue path 排序为稳定字典序。
- 结果: `npm test -- test/validate-command.test.ts` 通过，10/10 tests green。

### 2026-05-28 Verification

- 命令: `npm run build`
- 结果: 通过，tsup ESM 与 DTS build 均成功。
- 命令: `npm test`
- 结果: 首次全量失败 1 项，fresh-install fixture 仍使用旧 canonical package hash；同步 Story 3.3 hash contract 后的 expected hash 后复跑通过。
- 最终命令: `npm test`
- 最终结果: 通过，22 个 test files、138 个 tests 全部通过。

### 2026-05-28 CR Round 1

- 方案: 使用 `bmenhance-cr-01-reviewer` 对 Story 3.3 执行首轮只读代码审查，范围限定为 `3-3-ide-mirror-and-file-integrity-validation` 相关变更。
- 轮次: 第 1 轮；`3-3-code-review/` 下无既有 summary/evaluation 文件。
- 执行模式: 当前环境无 Agent 工具，按 skill 降级为当前上下文串行三层审查。
- 结果: 发现 2 个 `patch` 桶问题，均为边界条件/AC 对齐缺口；无 `decision_needed`，无 `defer`。

### 2026-05-28 CR Evaluation Round 1

- 方案: 使用 `bmenhance-cr-02-evaluator` 只评估最新 reviewer Round 1 结果 `3-3-code-review-summary-20260528-round-1.md`。
- 轮次: 评估第 1 轮；本目录此前无 `3-3-code-review-evaluation-*-round-*.md` 文件。
- 证据: 逐条核验 Story 3.3 AC/contract、`src/manifest/hash.ts`、`src/validation/rules/ide-mirror.ts`、`src/validation/rules/file-integrity.ts` 和 `test/validate-command.test.ts`。
- 结果: 2 个 findings 均确认有效，均为 P1 阻塞修复项；0 个 TODO/记录项，0 个误报。评估结果保存到 `3-3-code-review-evaluation-20260528-round-1.md`。

### 2026-05-28 CR Fixer Round 1

- 方案: 使用 `bmenhance-cr-03-fixer` 只修复最新评估文件确认的 2 个 P1 项，不处理非评估确认问题。
- 修复 #1: 调整 `src/manifest/hash.ts` 的 `listFiles()`，在遍历阶段应用 include 过滤；同步调整 `src/validation/rules/ide-mirror.ts` 的 canonical directory 判定，保留 canonical candidate symlink 的 shape mismatch。
- 修复 #2: 调整 `src/validation/rules/file-integrity.ts`，用 `lstat()` 区分 missing、symlink 和 unreadable；更新 `test/validate-command.test.ts` 覆盖 adapter artifact symlink、dangling symlink、symlink-to-existing-file。
- 验证: `npm test -- test/validate-command.test.ts` 通过；`npm run build` 通过；`git diff --check` 通过。

### 2026-05-28 CR Round 2 复审

- 方案: 使用 `bmenhance-cr-01-reviewer` 对 Story 3.3 执行 Round 2 只读复审，重点验证 Round 1 两个 patch 修复闭环。
- 轮次: 第 2 轮；本目录已有 `3-3-code-review-summary-20260528-round-1.md`。
- 执行模式: 当前环境无 Agent 工具，按 skill 降级为当前上下文串行三层审查。
- 结果: Round 1 两个 patch 均已闭环，未发现新 blocking/patch/defer finding；`npm test -- test/validate-command.test.ts` 通过，`git diff --check` 通过。结果保存到 `3-3-code-review-summary-20260528-round-2.md`。

### 2026-05-28 CR Evaluation Round 2

- 方案: 使用 `bmenhance-cr-02-evaluator` 只评估最新 reviewer Round 2 结果 `3-3-code-review-summary-20260528-round-2.md`。
- 轮次: 评估第 2 轮；本目录已有 `3-3-code-review-evaluation-20260528-round-1.md`。
- 证据: 独立核验 Story 3.3 契约、Round 1 evaluation/fixer 记录、`src/manifest/hash.ts`、`src/validation/rules/ide-mirror.ts`、`src/validation/rules/file-integrity.ts` 和 `test/validate-command.test.ts`。
- 验证: `npm test -- test/validate-command.test.ts` 通过，10/10 tests green；scoped `git diff --check` 通过。
- 结果: Round 2 reviewer 通过结论成立；Round 1 两个 P1 patch 均已闭环；0 个需修复项，0 个 CR TODO/记录项，0 个误报。评估结果保存到 `3-3-code-review-evaluation-20260528-round-2.md`。

### 2026-05-28 CR Rules Extraction 04

- 方案: 按 `bmenhance-cr-04-rules-extractor 3-3` 分析 Round 1-2 CR 历史，并对 canonical hash include 边界与 file-integrity symlink 分类经验执行量化升格判定。
- 选择原因: 用户要求 CR 收尾先执行 rules extractor，遇到决策默认采用推荐路径；两项经验均已解决且具备复用价值，但不宜扩大到全局文档修改。
- 结果: 新增 `CR-API-17` 与 `CR-SEC-07` 到 `cr-rules-summary.md`，去向为 `rules-summary` / record-only；未修改全局文档，未交给 TODO。

### 2026-05-28 CR TODO Tracker 05

- 方案: 按 `bmenhance-cr-05-todo-tracker 3-3` 只检查 Round 1-2 中 non-blocking / defer / 后续改善候选项。
- 选择原因: 用户要求只处理 non-blocking 项，不得把 blocking 问题降级为 TODO。
- 结果: Round 2 evaluator 明确 CR TODO 0；本轮无新增 TODO，不修改 `cr-todo-backlog.md`。

### 2026-05-28 CR Finalizer 06

- 方案: 按 `bmenhance-cr-06-finalizer 3-3` 验证最新 Round 2 evaluation 为 Approved 后，同步 Story 与 sprint status。
- 选择原因: 用户要求 CR 双通过后执行 finalizer，且必须先验证 evaluator Approved；Epic 主状态如需确认则不主动修改。
- 结果: Story 文件状态已由 `review` 更新为 `done`；`sprint-status.yaml` 中 `3-3-ide-mirror-and-file-integrity-validation` 已更新为 `done`，`last_updated` 更新为 `2026-05-28 21:03 CST`；`bmm-workflow-status.yaml` 不存在，按 skill 容错跳过；Epic 3 仍有未完成 Story，保持 `in-progress`。
