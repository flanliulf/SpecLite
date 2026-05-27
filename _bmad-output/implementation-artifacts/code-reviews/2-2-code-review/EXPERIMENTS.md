# EXPERIMENTS

## 2026-05-27 12:02 - Preflight

- 方案：确认 Story 2.2 文件、`sprint-status.yaml` 状态和当前工作树，再启动 fresh dev sub-agent。
- 选择原因：Epic 2 需要严格串行推进；Story 2.2 必须在 Story 2.1 完成后继续，并且不能误处理当前大量既有改动。
- 结果：Story 2.2 为 `ready-for-dev`；Story 2.1 已为 `done`；当前工作树包含 Story 2.1 相关改动、文档同步改动、`node_modules/` 和 `assets/source/speclite/support-skills/` 未跟踪项。
- 结论：可以启动 `/bmad-dev-story story 2-2`，但必须要求 sub-agent 保留无关改动，不回滚、不清理。

## 2026-05-27 12:34 - CR 双通过

- 方案：按 reviewer -> evaluator -> fixer -> reviewer -> evaluator 严格串行执行 Story 2.2 CR。
- 选择原因：第 1 轮 reviewer / evaluator 确认 `canonicalPackageHash` 输入面与 installed entry surface 不一致，必须先修复并复审。
- 结果：fixer 修正 package-level hash 输入面并补充 `SKILL.en.md` 回归测试；第 2 轮 reviewer 通过；第 2 轮 evaluator 通过。
- 结论：Story 2.2 满足 reviewer 与 evaluator 双通过停止条件，可以进入 `bmenhance-cr-04-rules-extractor`、`bmenhance-cr-05-todo-tracker`、`bmenhance-cr-06-finalizer`。

## 2026-05-27 12:07 - Dev Story Activation

- 方案：按 `bmad-dev-story` workflow 读取 customization、项目配置、Story 2.2、`sprint-status.yaml`、`project-context.md` 和当前工作树。
- 选择原因：Story 2.2 依赖 Story 2.1 与 Epic 1 的真实实现锚点，且当前工作树存在前序 Story 和用户生成内容，必须先确认边界。
- 结果：`python3` resolver 因系统 Python 缺少 `tomllib` 失败，改用 `python3.12` 成功解析 workflow；Story 2.2 与 sprint 状态均为 `ready-for-dev`；已将 sprint 状态切到 `in-progress`。
- 结论：继续按 Story 任务顺序执行；保留 `node_modules/`、`assets/source/speclite/support-skills/` 和其它无关 story/doc 改动。

## 2026-05-27 12:09 - RED

- 方案：先补 focused tests，覆盖 adapter registry、self-contained copy 白名单、customization-capable 边界和 unsupported target blocking。
- 选择原因：Story 2.2 的主要风险是 target writer 复制面过宽，以及 config target selection 将 branded target 静默回退为默认 target。
- 结果：`npx vitest run test/manifest-discovery.test.ts test/runtime-structure.test.ts` 失败 2 项：`SKILL.en.md` 被复制；`cursor` selection 返回 success。
- 结论：测试有效暴露目标缺口，进入 GREEN。

## 2026-05-27 12:10 - GREEN / REFACTOR

- 方案：在 `src/fs/copy-tree.ts` 限定 canonical installable files；在 `src/ide/target-writer.ts` 通过 adapter registry 解析 target directory；在 `src/commands/install.ts` 对 unsupported target 做写入前 blocking issue。
- 选择原因：保持 `install.ts` 只编排，不直接复制 skill package；target mapping 细节仍归 `src/ide` / `src/fs`。
- 结果：focused tests 通过：3 个 test files / 14 个 tests。
- 结论：实现满足 Story 2.2 的核心 mapping contract。

## 2026-05-27 12:11 - Full Validation

- 方案：运行 `npm run build`、`npm test` 和 `git diff --check`。
- 选择原因：Story 2.2 修改 install flow、target writer 和 tests，必须验证 TypeScript build 与完整 regression。
- 结果：`npm run build` 通过；`npm test` 通过，12 个 test files / 71 个 tests；`git diff --check` 通过。
- 结论：可将 Story 2.2 标记为 `review`。

## 2026-05-27 12:36 - CR 04 Rules Extractor

- 方案：读取 Story 2.2 两轮 reviewer/evaluator 记录，按规则升格机制评估是否沉淀 CR 规则。
- 选择原因：Round 1 的 `canonicalPackageHash` 输入面问题已修复并经 Round 2 双通过，适合沉淀为实现侧 hash 输入面检查点；全局 SPEC 已有 package-level/file-level hash 分层，不应扩大为全局文档修改。
- 结果：按用户本次授权采用默认推荐决策，record-only 写入 `_bmad-output/implementation-artifacts/cr-rules/cr-rules-summary.md`，新增 `CR-API-09`，总分 7/12，建议去向 `rules-summary`。
- 结论：04 完成；没有需要升格到全局文档的规则，没有需要交给 05 的未解决非阻塞项。

## 2026-05-27 12:36 - CR 05 TODO Tracker

- 方案：按 TODO Tracker extract/check 语义扫描 Story 2.2 CR summary/evaluation 中的非阻塞、后续改善和 CR TODO 记录。
- 选择原因：用户要求 05 若无新增 TODO 也必须明确记录，同时本技能不得修改源码。
- 结果：Round 1 evaluation 明确“本轮没有需要降级为 CR TODO 的发现”；Round 2 evaluation 明确“本轮没有需要继承或新增的 CR TODO”和“本轮没有需要纳入 CR TODO 的事项”。当前未发现 `_bmad-output/implementation-artifacts/cr-rules/cr-todo-backlog.md`，且无需为 0 条 TODO 创建 backlog 文件。
- 结论：05 完成；新增 TODO 0，修改源码 0。

## 2026-05-27 12:36 - CR 06 Finalizer

- 方案：验证 latest evaluator Round 2 已通过，再同步 Story 与 sprint 状态。
- 选择原因：Story 2.2 已满足 reviewer + evaluator 双通过停止条件；finalizer 只推进状态跟踪文档，不修改源码。
- 结果：`2-2-code-review-evaluation-20260527-round-2.md` 明确“最终评估决定：通过”；Story 文件状态已从 `review` 更新为 `done`；`sprint-status.yaml` 中 `2-2-ide-skill-entry-mapping` 已从 `review` 更新为 `done`，`last_updated` 更新为 `2026-05-27 12:36 CST`。`bmm-workflow-status.yaml` 不存在，已按容错跳过。
- 结论：06 完成；Epic 2 下 `2-3`、`2-4`、`2-5` 仍为 `ready-for-dev`，因此不更新 `epic-2` 状态。
