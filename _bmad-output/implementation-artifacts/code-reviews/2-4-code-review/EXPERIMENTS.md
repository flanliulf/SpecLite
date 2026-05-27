# EXPERIMENTS

## 2026-05-27 13:47 - Preflight

- 方案：确认 Story 2.4 文件、`sprint-status.yaml` 状态和当前工作树，再启动 fresh dev sub-agent。
- 选择原因：Epic 2 需要严格串行推进；Story 2.4 必须在 Story 2.1 / 2.2 / 2.3 完成后继续，并且不能误处理当前大量既有改动。
- 结果：Story 2.4 为 `ready-for-dev`；Story 2.1 / 2.2 / 2.3 已为 `done`；当前工作树包含前序 Story 相关改动、文档同步改动、`node_modules/`、`assets/source/speclite/support-skills/` 和构建产物 `dist/` 等未跟踪项。
- 结论：可以启动 `/bmad-dev-story story 2-4`，但必须要求 sub-agent 保留无关改动，不回滚、不清理。

## 2026-05-27 13:49 - Dev Story Activation

- 方案：按 `/bmad-dev-story story 2-4` 激活开发流程，读取 Story 2.4、`sprint-status.yaml`、`_bmad/bmm/config.yaml`、`_bmad-output/project-context.md` 与当前 worktree 状态。
- 结果：`python3 _bmad/scripts/resolve_customization.py --skill .agents/skills/bmad-dev-story --key workflow` 因本机 `python3` 缺少 `tomllib` 失败；按 skill fallback 使用 `.agents/skills/bmad-dev-story/customize.toml` 默认 workflow 继续。
- 证据：Story 2.4 为 `ready-for-dev`；`sprint-status.yaml` 中 Story 2.1、2.2、2.3 为 `done`，Story 2.4 已更新为 `in-progress`。
- 范围控制：当前 dirty worktree 包含前序 Story、CR 文档、`node_modules/`、`dist/` 与 `assets/source/speclite/support-skills/`；本轮只处理 Story 2.4 runtime resolve 相关实现、测试、fixture、Story 状态和本目录实验记录。

## 2026-05-27 13:52 - Resolver RED Tests

- 方案：先新增 focused tests 覆盖 merge rules、config/customization reader、resolve CLI 与 `resolve-parity` fixture contract。
- 结果：`npm test -- test/config-merge-rules.test.ts test/resolve-readers.test.ts test/resolve-cli.test.ts` 按预期失败；缺失点为 `src/config/merge-rules.ts`、`src/config/customization-reader.ts` 和 `speclite resolve` command registration。
- 结论：测试能捕获 Story 2.4 的目标缺口，可以进入最小实现。

## 2026-05-27 13:54 - Resolver GREEN Implementation

- 方案：新增 `src/commands/resolve.ts`，将 TOML read/parse、layer merge、key selection 和 diagnostics 放入 `src/config/`，命令层只做 argv dispatch 与 stdout/stderr/exit code 写入。
- 结果：实现 config 四层读取、customization 三层读取、basename lookup key、customization project-root fallback、JSON stdout、JSON Lines diagnostics、optional warning continue、required failure blocking 和 shared structural merge rules。
- 验证：`npm test -- test/config-merge-rules.test.ts test/resolve-readers.test.ts test/resolve-cli.test.ts test/contract-anchors.test.ts` 通过，18 tests passed。
- 结论：核心 resolver 行为满足 AC 1-7 与 schema anchor 要求。

## 2026-05-27 13:55 - Fixture And Regression Validation

- 方案：在 `skill-artifact-loop` fixture 测试中追加 resolver runtime 可调用断言，不改写所有 source skill instruction。
- 结果：安装后的 project config 与 installed skill customization 均可通过 `speclite resolve` 读取。
- 验证：`npm test -- test/skill-artifact-loop.test.ts test/resolve-cli.test.ts test/resolve-readers.test.ts test/config-merge-rules.test.ts` 通过；`npm run build` 通过；`npm test` 通过，17 files / 98 tests；`git diff --check` 通过。
- 结论：Story 2.4 可以进入 `review`。

## 2026-05-27 14:00 - CR Reviewer Round 1

- 方案：按 `/bmenhance-cr-01-reviewer 2-4` 执行首轮 code review；当前环境无 Agent 子代理工具，降级为串行执行 Blind Hunter、Edge Case Hunter、Acceptance Auditor 三层审查。
- 范围：只读检查 Story 2.4 File List、resolver 源码、focused tests、`resolve-parity` fixture 和 canonical resolve command contract；遵守 functional anchor 修订，不把缺少独立 split files 作为缺陷。
- 验证：`npm test -- test/config-merge-rules.test.ts test/resolve-readers.test.ts test/resolve-cli.test.ts test/skill-artifact-loop.test.ts` 通过，4 files / 17 tests；`npm run build` 通过；`npm test` 通过，17 files / 98 tests。
- 结果：发现 2 个中优先级契约问题和 1 个低优先级 fixture 问题；首轮 CR 建议不通过，输出写入 `2-4-code-review-summary-20260527-round-1.md`。

## 2026-05-27 14:14 - CR Evaluator Round 1

- 方案：按 `/bmenhance-cr-02-evaluator 2-4` 评估 reviewer round 1；只读核验 reviewer 输出、resolve schema、resolver result、activation contract、skill-artifact-loop fixture 和 resolve-parity fixture。
- 额外复现：执行只读 `npx tsx --eval` 片段，对 `resolveProjectConfig()` 的实际返回值调用 `ResolveMergeResultSchema.safeParse(...)`；结果为失败，实际 keys 为 `value`、`issues`、`exitCode`，schema 缺少 `diagnostics` 且拒绝 `issues`。
- 结果：确认发现 #1 和 #2 有效且应阻塞交付，均为 P1 fixer 项；确认发现 #3 属实但非阻塞，降级为 P2 CR TODO。
- 结论：Evaluator round 1 不通过；输出写入 `2-4-code-review-evaluation-20260527-round-1.md`，未执行 fixer。

## 2026-05-27 14:10 - CR Fixer Round 1

- 方案：按 `/bmenhance-cr-03-fixer 2-4` 只修复 evaluation round 1 确认的两个 P1；不处理 `resolve-parity` P2 TODO，不执行 reviewer/evaluator/finalizer。
- 修复 #1：将 `ResolveMergeResultSchema` 从 `diagnostics` 字段改为真实 resolver result 使用的 `issues` 字段；在 `test/contract-anchors.test.ts` 增加直接调用 `resolveProjectConfig()` 并用 schema 解析实际返回值的 anchor。
- 修复 #2：将 `speclite-dev-story` installed activation 主说明、`references/activation.md` 与 `workflow.on_complete` 解析命令迁到 `speclite resolve customization --skill {skill-root} --project-root {project-root}`；`test/skill-artifact-loop.test.ts` 改为正向断言新命令、负向断言 legacy Python resolver path。
- 相关 fixture：因 source skill activation 内容变更，同步更新 fresh install expected `skill-index` canonical package hash 与 `files-index` SKILL.md hash。
- 验证：`npm test -- test/contract-anchors.test.ts test/skill-artifact-loop.test.ts test/resolve-cli.test.ts test/resolve-readers.test.ts` 通过，4 files / 15 tests；`npm test -- test/runtime-structure.test.ts test/skill-artifact-loop.test.ts test/contract-anchors.test.ts` 通过，3 files / 12 tests；`npm run build` 通过；`npm test` 通过，17 files / 99 tests；`git diff --check` 通过。
- 结论：两个 P1 已完成修复并通过验证；本轮未处理非阻塞 P2 TODO。

## 2026-05-27 14:14 - CR Reviewer Round 2

- 方案：按 `/bmenhance-cr-01-reviewer 2-4` 执行 round 2 code review；只做 reviewer，不执行 evaluator 或 fixer。
- 范围：复核 round 1 两个 P1 修复点、P2 TODO 保留状态、Story 2.4 activation contract、resolver schema/tests 与当前验证结果；遵守 functional anchor 修订，不把缺少独立 split files 作为缺陷。
- 审查层状态：Agent 子代理工具不可用，已在主上下文串行完成 Blind Hunter、Edge Case Hunter、Acceptance Auditor。
- 验证：`npm test -- test/contract-anchors.test.ts test/skill-artifact-loop.test.ts test/resolve-cli.test.ts test/resolve-readers.test.ts` 通过，4 files / 15 tests；`npm run build` 通过；`npm test` 通过，17 files / 99 tests；`npm run lint` 因缺少 `lint` script 失败；`git diff --check` 通过。
- 结果：Round 1 两个 P1 已修复；发现 1 个新的中优先级 activation contract 缺口：installed skill config activation 仍直接读取 `_speclite/config.toml`，没有调用 `speclite resolve config --project-root` 获取四层合并结果。
- 结论：Reviewer round 2 不通过；输出写入 `2-4-code-review-summary-20260527-round-2.md`。

## 2026-05-27 14:19 - CR Evaluator Round 2

- 方案：按 `/bmenhance-cr-02-evaluator 2-4` 评估 reviewer round 2；仅执行 evaluator，不执行 fixer。
- 范围：只读核验 reviewer round 2 输出、Story 2.4 Task 7 / Runtime Path notes、`speclite-dev-story` activation 文档、`resolve config` command/config reader 和 `skill-artifact-loop` activation fixture；保留 Round 1 P2 `resolve-parity` CR TODO 状态。
- 证据：`src/commands/resolve.ts` 与 `src/config/config-reader.ts` 已实现 `speclite resolve config --project-root` 四层 merge；但 `assets/source/speclite/sdlc-skills/4-implementation/speclite-dev-story/SKILL.md` 与 `references/activation.md` 仍要求从 `{project-root}/_speclite/config.toml` 单文件加载配置，`test/skill-artifact-loop.test.ts` 未断言 installed activation instruction 包含 `speclite resolve config --project-root {project-root}`。
- 结果：确认 reviewer 新发现属实，严重性 [中] 合理，评估为 P1 阻塞项；Round 1 两个 P1 修复有效，Round 1 P2 TODO 继续非阻塞。
- 结论：Evaluator round 2 不通过；输出写入 `2-4-code-review-evaluation-20260527-round-2.md`，未执行 fixer。

## 2026-05-27 14:24 - CR Fixer Round 2

- 方案：按 `/bmenhance-cr-03-fixer 2-4` 仅修复 evaluation round 2 确认的 P1：installed `speclite-dev-story` config activation 未调用 `speclite resolve config --project-root {project-root}`。不处理 Round 1 已修复 P1，不处理 `resolve-parity` P2 TODO，不执行 reviewer/evaluator/finalizer。
- 修复：将 `assets/source/speclite/sdlc-skills/4-implementation/speclite-dev-story/SKILL.md` 的核心能力与激活流程 Step 4 改为执行 `speclite resolve config --project-root {project-root}`，并从 resolved JSON 读取四层合并后的 config 字段；同步更新 `references/activation.md` 的配置入口和 Step 4。
- 测试：`test/skill-artifact-loop.test.ts` 正向断言 installed `SKILL.md` 与 `references/activation.md` 包含 `speclite resolve config --project-root {project-root}`，负向断言旧单文件加载文案，并通过写入 `_speclite/config.user.toml` 验证 activation contract 覆盖 config override layer。
- 相关 fixture：因 source skill activation 内容变化，同步更新 fresh install expected `skill-index` canonical package hash 与 `files-index` SKILL.md hash。
- 验证：`npm test -- test/skill-artifact-loop.test.ts` 通过，1 file / 1 test；`npm test -- test/runtime-structure.test.ts` 通过，1 file / 8 tests；`npm test -- test/skill-artifact-loop.test.ts test/runtime-structure.test.ts test/resolve-cli.test.ts test/resolve-readers.test.ts` 通过，4 files / 20 tests；`git diff --check` 通过。
- 结论：Round 2 P1 已完成修复并通过定向验证；本轮未扩大到 P2 TODO 或无关文件。

## 2026-05-27 14:33 - CR Reviewer Round 3

- 方案：按 `/bmenhance-cr-01-reviewer 2-4` 执行 round 3 code review；只做 reviewer，不执行 evaluator 或 fixer。
- 范围：复核 round 2 P1 修复点、round 1 两个 P1 持续有效性、P2 `resolve-parity` TODO 保留状态、resolver command/schema/readers、installed activation fixture 和当前验证结果；遵守 functional anchor 修订，不把缺少独立 split files 作为缺陷。
- 审查层状态：Agent 子代理工具不可用，已在主上下文串行完成 Blind Hunter、Edge Case Hunter、Acceptance Auditor。
- 验证：`npm test -- test/skill-artifact-loop.test.ts test/runtime-structure.test.ts test/resolve-cli.test.ts test/resolve-readers.test.ts test/contract-anchors.test.ts test/config-merge-rules.test.ts` 通过，6 files / 28 tests；`npm run build` 通过；`npm test` 通过，17 files / 99 tests；`npm run lint` 因缺少 `lint` script 失败；`git diff --check` 通过。
- 结果：Round 2 P1 installed config activation 缺口已修复；Round 1 两个 P1 未回归；`resolve-parity` fixture 可审阅性维持 P2 CR TODO / 非阻塞；未发现新的阻塞项或中高优先级问题。
- 结论：Reviewer round 3 通过；输出写入 `2-4-code-review-summary-20260527-round-3.md`。

## 2026-05-27 14:36 - CR Evaluator Round 3

- 方案：按 `/bmenhance-cr-02-evaluator 2-4` 评估 reviewer round 3；仅执行 evaluator，不执行 fixer、rules extractor、todo tracker 或 finalizer。
- 范围：独立核验 round 2 P1 installed config activation 修复、round 1 两个 P1 未回归、P2 `resolve-parity` TODO 保留状态，以及 functional anchor 修订边界。
- 证据：`speclite-dev-story` installed activation 已要求执行 `speclite resolve customization --skill {skill-root} --project-root {project-root}` 与 `speclite resolve config --project-root {project-root}`；`ResolveMergeResultSchema` 已对齐真实 resolver result 的 `issues` 字段；`skill-artifact-loop` fixture test 同时包含新命令正向断言和 legacy Python / 单文件 config 读取负向断言。
- 验证：`npm test -- test/skill-artifact-loop.test.ts test/runtime-structure.test.ts test/resolve-cli.test.ts test/resolve-readers.test.ts test/contract-anchors.test.ts test/config-merge-rules.test.ts` 通过，6 files / 28 tests；`git diff --check` 通过。
- 结果：确认 reviewer round 3 通过结论成立；无阻塞修复项；Round 1 P2 `resolve-parity` fixture 可审阅性继续作为 CR TODO / 非阻塞。
- 结论：Evaluator round 3 通过；输出写入 `2-4-code-review-evaluation-20260527-round-3.md`，满足停止 CR 循环条件。

## 2026-05-27 14:41 - CR Rules Extractor

- 方案：按 `bmenhance-cr-04-rules-extractor` 对 Story 2.4 的 round 1-3 review/evaluation/fix records 做规则提炼；不执行新的 reviewer/evaluator/fixer。
- 结果：按默认推荐决策执行 record-only，追加 `cr-rules-summary.md`，不修改 project-context、architecture、specs 或其他全局文档。
- 提炼规则：新增 `CR-API-13`（resolver schema anchor 必须解析真实 runtime result shape）和 `CR-API-14`（installed activation 必须通过 `speclite resolve` runtime entry 获取配置与 customization）。
- 交接：未解决的 Round 1 P2 `resolve-parity` fixture 可审阅性事项不写入规则总结，交给 05 TODO Tracker。

## 2026-05-27 14:41 - CR TODO Tracker

- 方案：按 `bmenhance-cr-05-todo-tracker` 处理 Story 2.4 非阻塞 CR TODO；使用默认推荐决策，不等待额外确认。
- 结果：创建 `_bmad-output/implementation-artifacts/cr-rules/cr-todo-backlog.md`，新增 `TODO-001`，状态 open，优先级 P2，类别 test-gap。
- TODO 内容：`resolve-parity` fixture 目录当前只有 metadata，真正 parity cases 内联在 `test/resolve-cli.test.ts` helper 中，release-gate fixture 独立审阅性不足。

## 2026-05-27 14:41 - CR Finalizer

- 方案：按 `bmenhance-cr-06-finalizer` 执行 Story 2.4 CR 收尾；先验证最新 evaluation round 3 为通过，再更新状态文件。
- 结果：`_bmad-output/implementation-artifacts/stories/2-4-runtime-config-and-customization-resolve.md` 状态从 `review` 更新为 `done`；`sprint-status.yaml` 中 `2-4-runtime-config-and-customization-resolve` 更新为 `done`，`last_updated` 更新为 `2026-05-27 14:41 CST`。
- 跳过项：`_bmad-output/planning-artifacts/bmm-workflow-status.yaml` 不存在，按 skill 容错规则跳过。
- Epic 状态：Epic 2 仍有 `2-5-workflow-artifact-output-and-metadata-validation: ready-for-dev`，因此不更新 `epic-2` 为 done。
