# Story 5.1 实验笔记

更新时间：2026-06-01 15:19 CST

## Notes（笔记）

- 当前 `sprint-status.yaml` 显示 `epic-5: in-progress`，Story 5.1 到 5.5 均为 `ready-for-dev`。
- Story 5.1 范围是 install 过程的 source selection、source summary、external access intent、redaction、invalid source diagnostics 和未确认前 no access/no write。
- Story 5.1 明确不负责 Story 5.2 registry resolution、Story 5.3 tarball/offline/local integrity、Story 5.4 Git pinning、Story 5.5 full trust reporting、Epic 6 fixture matrix 或 Post-MVP commands。
- 当前工作树已有大量无关 dirty/untracked 文件，包括 Epic 1-4 CR 记录、planning artifacts、assets source、`src/commands/install.ts`、`src/fs/copy-tree.ts`、`src/ide/target-writer.ts`、`src/installer/runtime-structure.ts`、`test/runtime-structure.test.ts` 等；后续必须逐文件核对，不回滚、不清理。
- `/bmad-dev-story story 5-1` 已完成；下一步应由新的 fresh sub agent 启动 `/bmenhance-cr-01-reviewer 5-1`，本 agent 不并行启动 reviewer。

## Risks（风险）

- Story 5.1 是 Epic 5 第一条 source-integrity Story，容易越界提前实现后续 registry/tarball/Git/local path 深度 resolver；需要以 Story 边界控制实现。
- 工作树很脏，后续提交必须白名单 stage，避免污染用户或前序流程改动。
- `python3` 可能仍因缺 `tomllib` 失败；若 resolver 需要 Python 3.11+，优先使用 `python3.12` 或 skill fallback。
- 已确认本轮 `python3` resolver 失败，`python3.12` resolver 成功；后续如需 BMad resolver 继续使用 `python3.12`。
- Story 5.1 dev-story Step 4 已把 `sprint-status.yaml` 中 Story 5.1 标为 `in-progress`；Step 9 完成后 Story 文件与 `sprint-status.yaml` 已统一置为 `review`。
- 本轮实现只建立 selection + intent + summary + unsupported-source/redaction 边界；custom source 一律在 source-specific resolver 前停止，不访问 registry/Git/tarball/offline/local origin，也不写目标项目。
- 留给 CR 的重点风险：human output 的 External Access 段目前由 `SourceDescriptor` 的 display-safe projection 推导，`SourceResolutionPlan` 仍为 internal contract；这符合 Story 5.1 automation 不新增 public JSON 字段的边界，但 CR 应核对后续 Story 5.2 是否需要更显式的 renderer input。
- 本轮 reviewer 环境没有可用 `Agent` 工具，不能真正并行启动 Blind Hunter / Edge Case Hunter / Acceptance Auditor；按 `bmenhance-cr-01-reviewer` 降级策略在当前上下文串行执行三层审查。
- Round 检测：`5-1-code-review` 目录当前无 `*-code-review-summary-*-round-*.md`，因此本轮为 Round 1 首轮审查。
- Round 1 reviewer finding：`npm` source value 的 `@acme/source?token=secret` 会进入 `SourceDescriptor.resolvedRoot`，并被 JSON / human renderer 输出；这是 AC4/AC6 redaction blocker。
- 已运行验证：`npm run build` 通过，`npm test` 通过，`npm run lint` 因缺 script 失败，定向 `git diff --check` 通过。
- Round 1 evaluator 确认 reviewer finding 有效：`normalizeSourceSelection()` 对 `npm` source 只通过 `sanitizePackageLabel()`，该函数没有检查 `containsSecretLikeToken()` 或 private query string；`createBlockedSourceDescriptor()` 后续把该值投影到 public `resolvedRoot`。
- Evaluator 定向复现再次确认：`install --json` 泄露 `"resolvedRoot": "@acme/source?token=secret"`，默认 human output 泄露 `resolvedRoot=@acme/source?token=secret` 与 `sourceValue=@acme/source?token=secret`。
- Evaluator 决策：需要修复 1，可忽略 0，待讨论 0，CR TODO 候选 0；下一步应进入 fixer，修复范围限制在 Story 5.1 npm source display-safe redaction 和 focused regression tests。
- Fixer 执行决策：按 evaluator 推荐在 `sanitizePackageLabel()` 集中修复 npm source display-safe label；只处理 query/fragment/secret-like/private selector redaction，不提前实现 registry/tarball/Git/local resolver。
- Fixer 关键实现：npm source value 先归一反斜杠，再检查 `hasUnsafeDisplayValue()`、`containsSecretLikeToken()`、`?`、`#` 和 strict npm package-name label；任何不满足 display-safe 的输入都投影为 `redacted-npm-package`。
- Focused regression 已覆盖 `sourceType: "npm"` 与 `sourceValue: "@scope/pkg?token=secret"`：selection、`SourceResolutionPlan.externalAccesses[]`、install JSON 与 human output 都不得包含 raw query/token。
- 本轮未改变 bundled source 成功路径，`source-selection` focused tests 与 install/source summary smoke tests 均通过；全量 `npm test` 通过。
- 修复记录已追加到 `5-1-code-review-evaluation-20260601-round-1.md` 的 `## 修复执行记录` 章节；本 fixer 不启动 reviewer/evaluator/rules/todo/finalizer，不 commit/push。
- Round 2 reviewer 复审确认：`src/source/source-selection.ts` 的 npm branch 现在通过 `sanitizePackageLabel()` 对 secret-like key、query string、fragment 和非 npm package-name label 统一投影为 `redacted-npm-package`。
- Round 2 定向复核确认：`@scope/pkg?token=secret` 在 install JSON 的 `resolvedRoot` 与 human output 的 `sourceValue` 中均显示为 `redacted-npm-package`；`rg` 未匹配 raw query/token。
- Round 2 范围复核确认：custom source 仍在 source-specific resolver 前以 `source-integrity.unsupported-source` 停止，未进入 registry/Git/tarball/local 深度 resolution、operation lock 或 writes；未提前实现 Story 5.2-5.5。
- Round 2 验证备注：`npx tsc --noEmit` 失败，但错误覆盖既有 `src/fs`、`src/update`、`src/validation` 与旧 tests 类型问题；项目实际 build 门禁 `npm run build -- --out-dir /private/tmp/speclite-cr-5-1-round2-build` 通过。
- Round 2 reviewer 结论：通过；新 findings 0，四桶计数 `decision_needed=0`、`patch=0`、`defer=0`、`dismiss=0`。下一步只需 evaluator 复核，不需要 fixer 循环，除非 evaluator 提出新问题。
- Round 2 evaluator 复核确认：reviewer 通过结论成立；Round 1 blocker 已由 `sanitizePackageLabel()` 修复，`@scope/pkg?token=secret` 不再进入 selection、`SourceResolutionPlan.externalAccesses[]`、install JSON 或 human output。
- Round 2 evaluator 复跑 `npx tsc --noEmit` 仍失败，但错误未落在 `src/source/source-selection.ts` 或 `test/source-selection.test.ts`；在无证据证明是 Story 5.1 当前变更新增的前提下，不作为本轮 blocker。
- Round 2 evaluator 复跑 `npx vitest run test/source-selection.test.ts` 通过，1 个 test file / 10 个 tests。
- Round 2 evaluator 决策：需要修复 0，可忽略 0，待讨论 0，CR TODO 0；无需继续 fixer 循环，可进入 04/05/06 收尾。
- 04 analysis-only 读取 Round 1/2 reviewer 与 evaluator 文件后确认：唯一可复用经验是 source label sanitizer 必须在 public projection 前覆盖 token、query、fragment 与 strict source-specific allowlist。
- 04 升格判定：硬性门槛通过，总分 7/12，建议去向 `rules-summary`；全局 source descriptor / architecture 已覆盖 public redaction 总原则，因此不修改全局文档。
- 04 record-only 已落地：`cr-rules-summary.md` 新增索引 `CR-SEC-14` 和 Story 5-1 记录；04 未识别未解决非阻塞项，向 05 交接为 CR TODO 0。
- 05 检查确认：Round 2 evaluation 的历史 CR TODO / 本轮非阻塞表均为无，`CR TODO 候选数量：0`；`cr-todo-backlog.md` 中没有 Story 5.1/source redaction 匹配项。
- 05 决策：不新增、不更新 backlog；Story 5.1 没有需要递延到后续 Story 的非阻塞项。
- 06 前置门禁：最新 evaluation 文件为 `5-1-code-review-evaluation-20260601-round-2.md`，明确 Round 2 reviewer 通过结论确认成立，需要修复 0，CR TODO 0。
- 06 状态同步：Story 文件 `Status` 从 `review` 改为 `done`，`sprint-status.yaml` 的 `5-1-source-selection-and-channel-summary` 从 `review` 改为 `done`，`last_updated` 更新为 `2026-06-01 15:19 CST`。
- 06 Epic 判断：Epic 5 还有 `5-2`、`5-3`、`5-4`、`5-5` 为 `ready-for-dev`，因此 `epic-5` 保持 `in-progress`。
- 06 workflow 状态：`_bmad-output/planning-artifacts/bmm-workflow-status.yaml` 不存在，按 finalizer 容错跳过，未创建新文件。
