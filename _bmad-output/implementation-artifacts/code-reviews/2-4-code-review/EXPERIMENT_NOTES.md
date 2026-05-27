# EXPERIMENT_NOTES

## 2026-05-27 13:47

- 当前执行 Story：`2-4-runtime-config-and-customization-resolve`。
- 下一步：启动 fresh sub-agent，使用 `gpt-5.5` 执行 `/bmad-dev-story story 2-4`。
- 决策：沿用 functional anchor 标准；manifest/index 能力可以由集中 builder/helper 承载，不要求独立 split files。
- 注意：当前工作树包含前序 Story 2.1-2.3 改动、用户安装依赖产生的 `node_modules/`、未跟踪 `assets/source/speclite/support-skills/` 和 `dist/`；本流程不清理这些内容。

## 2026-05-27 13:49

- 激活结果：`bmad-dev-story` workflow resolver 使用裸 `python3` 失败，原因是本机 Python 缺 `tomllib`；已按 fallback 读取默认 workflow，无 prepend/append steps，persistent fact 为 `project-context.md`。
- 当前状态：Story 2.4 与 `sprint-status.yaml` 均已标记为 `in-progress`。
- 下一步：补 resolver focused tests，先确认缺失命令/reader/merge module 会失败，再实现 `speclite resolve config/customization`。

## 2026-05-27 13:56

- 实现摘要：`speclite resolve config` 要求显式 `--project-root`；`speclite resolve customization` 要求 `--skill`，支持显式 `--project-root` 与向上搜索 fallback。
- 诊断策略：stdout 只输出 resolved JSON object；stderr 逐行输出 `ValidationIssue`；optional parse/read failure 为 warning 并继续；required missing/parse/read failure 为 error 且不输出 partial stdout。
- 合并策略：config 使用 `_speclite/config.toml`、`config.user.toml`、`custom/config.toml`、`custom/config.user.toml`；customization 使用 `<skill-dir>/customize.toml`、`custom/<basename>.toml`、`custom/<basename>.user.toml`。
- 测试结果：focused resolver tests、skill-artifact-loop fixture test、`npm run build`、`npm test` 和 `git diff --check` 均通过。
- 收尾状态：Story 2.4 与 `sprint-status.yaml` 已更新为 `review`。

## 2026-05-27 14:00

- CR 类型：Story 2.4 reviewer round 1；未执行 evaluator 或 fixer。
- 审查层状态：Agent 子代理工具不可用，已在主上下文串行完成 Blind Hunter、Edge Case Hunter、Acceptance Auditor。
- 关键发现：`ResolveMergeResultSchema` 与实际 resolver result 的 `issues` 字段不一致；`skill-artifact-loop` 仍正向断言 legacy Python resolver path；`resolve-parity` fixture 目录只有 metadata，实际 cases 内联在测试 helper 中。
- 结论：`npm test` 与 `npm run build` 通过，但 CR round 1 建议不通过；等待 evaluator 判断修复优先级。

## 2026-05-27 14:14

- CR 类型：Story 2.4 evaluator round 1；仅评估 reviewer round 1，未执行 fixer。
- 评估结论：发现 #1、#2 均为真实契约问题，严重性 [中] 合理，评估为 P1 阻塞修复项。
- TODO 判断：发现 #3 属实，但主要影响 `resolve-parity` fixture 的独立审阅/复用，不直接破坏 resolver 行为；评估为 P2 CR TODO，不要求本轮 fixer 修复。
- 下一步：执行 `/bmenhance-cr-03-fixer 2-4` 时仅处理 #1 `ResolveMergeResultSchema` 字段漂移和 #2 installed activation legacy Python path；继续遵守 functional anchor 修订，不把缺少独立 split files 作为缺陷。

## 2026-05-27 14:10

- CR 类型：Story 2.4 fixer round 1；仅执行 evaluation round 1 的 P1 修复，未执行 reviewer/evaluator/finalizer。
- 修复结论：`ResolveMergeResultSchema` 现解析真实 resolver result 的 `issues` 字段，并新增直接 `resolveProjectConfig()` result schema anchor。
- Activation 结论：installed `speclite-dev-story` 的主 activation instruction、`references/activation.md` 和 `workflow.on_complete` 解析命令已迁到 `speclite resolve customization --skill {skill-root} --project-root {project-root}`；fixture test 同时覆盖新命令正向断言和 legacy Python path 负向断言。
- 验证结果：focused tests、runtime structure regression、`npm run build`、全量 `npm test` 与 `git diff --check` 均通过。
- 范围控制：`resolve-parity` fixture 可审阅性 P2 TODO 未处理；functional anchor 修订继续适用，未新增独立 split files 要求。

## 2026-05-27 14:14

- CR 类型：Story 2.4 reviewer round 2；仅执行 reviewer，未执行 evaluator 或 fixer。
- Round 1 回归结论：两个 P1 修复有效，schema anchor 与 customization activation legacy path 问题均已消除；P2 `resolve-parity` fixture 可审阅性问题继续保持非阻塞 TODO。
- 新发现：installed skill activation 已使用 `speclite resolve customization`，但 config 仍按 `{project-root}/_speclite/config.toml` 单文件读取，未调用 `speclite resolve config --project-root {project-root}`，因此绕过四层 config merge contract。
- 验证结果：focused tests、`npm run build`、全量 `npm test` 和 `git diff --check` 通过；`npm run lint` 因项目未定义 lint script 失败。
- 结论：Reviewer round 2 不通过；建议后续 fixer 仅处理 config activation resolver 缺口，不处理已修复 P1 或 P2 TODO。

## 2026-05-27 14:19

- CR 类型：Story 2.4 evaluator round 2；仅评估 reviewer round 2，未执行 fixer。
- 评估结论：Reviewer 新发现属实；`resolve config` 四层 merge 能力已存在，但 installed `speclite-dev-story` activation 文档仍指导单文件读取 `_speclite/config.toml`，测试也未把 `speclite resolve config --project-root {project-root}` 纳入 activation contract 断言。
- 严重性判断：原始 [中] 合理，评估为 P1 阻塞项；这是 Story 2.4 Task 7 / Runtime Path contract 缺口，不是 split file functional anchor 问题。
- 范围控制：Round 1 两个 P1 维持已修复有效；`resolve-parity` fixture 可审阅性继续保持 P2 CR TODO，不扩大 fixer scope。
- 下一步：若执行 `/bmenhance-cr-03-fixer 2-4`，仅修复 installed config activation 改用 `speclite resolve config --project-root {project-root}` 并补 activation fixture 断言。

## 2026-05-27 14:24

- CR 类型：Story 2.4 fixer round 2；仅执行 evaluation round 2 的 P1 修复，未执行 reviewer/evaluator/finalizer。
- 修复结论：installed `speclite-dev-story` 的主 activation instruction 与 `references/activation.md` 已改为通过 `speclite resolve config --project-root {project-root}` 读取四层合并后的 config，不再指导从 `{project-root}/_speclite/config.toml` 单文件加载。
- 测试结论：`skill-artifact-loop` activation contract 现断言 installed `SKILL.md` / `references/activation.md` 包含 config resolver command，并通过 `_speclite/config.user.toml` 覆盖验证 config override layer 能进入 resolver 输出。
- Fixture 结论：source skill 内容变化导致 installed-state package/file hash 变化，已只同步 `skill-index-speclite-dev-story.json` 与 `files-index-dev-story-skill.json` 的对应 hash。
- 验证结果：focused activation/runtime tests 与 `git diff --check` 均通过；为避免覆盖既有未跟踪 `dist/` 构建产物，本轮未运行 `npm run build`。
- 范围控制：Round 1 两个 P1 不重复处理；`resolve-parity` fixture 可审阅性继续保留为 P2 CR TODO。

## 2026-05-27 14:33

- CR 类型：Story 2.4 reviewer round 3；仅执行 reviewer，未执行 evaluator 或 fixer。
- Round 2 回归结论：installed config activation 现在明确执行 `speclite resolve config --project-root {project-root}`，并通过 `skill-artifact-loop` fixture 覆盖 config override layer；round 2 P1 已修复。
- Round 1 回归结论：`ResolveMergeResultSchema` 与真实 resolver result 的 `issues` 字段保持一致；installed customization activation 未回退到 legacy Python resolver path。
- TODO 判断：`resolve-parity` fixture 可审阅性继续保持 P2 CR TODO / 非阻塞，本轮未升级。
- 验证结果：focused tests、`npm run build`、全量 `npm test` 和 `git diff --check` 通过；`npm run lint` 因项目未定义 lint script 失败。
- 结论：Reviewer round 3 通过；未发现新的阻塞项或中高优先级问题。

## 2026-05-27 14:36

- CR 类型：Story 2.4 evaluator round 3；仅评估 reviewer round 3，未执行 fixer/finalizer。
- 评估结论：Reviewer 通过结论成立；Round 2 P1 修复有效，Round 1 两个 P1 未回归，未发现新的阻塞项或中高优先级问题。
- TODO 判断：Round 1 P2 `resolve-parity` fixture 可审阅性继续保留为 CR TODO / 非阻塞；本轮不扩大 fixer scope。
- Functional anchor 边界：继续采用修订标准，manifest/index 能力可由集中 builder/helper 承载，不把缺少独立 split files 作为缺陷。
- 验证结果：focused resolver / activation tests 通过，6 files / 28 tests；`git diff --check` 通过。
- 下一步：CR 循环可停止；可进入 rules/todo/finalizer 后续流程，但本步骤未执行这些动作。

## 2026-05-27 14:41

- CR 类型：Story 2.4 rules extractor；仅执行 04，不执行新的 reviewer/evaluator/fixer。
- 规则提炼：Story 2.4 形成 2 条可复用规则，分别覆盖 resolver schema anchor 与真实 runtime result 对齐、installed activation 必须消费 `speclite resolve` runtime entry。
- 落地决策：按用户要求采用默认推荐决策，执行 record-only 写入 `cr-rules-summary.md`；不修改全局文档。
- TODO 边界：Round 1 P2 `resolve-parity` fixture 可审阅性仍是未解决非阻塞项，因此交给 05 TODO Tracker，不作为已沉淀规则重复管理。

## 2026-05-27 14:41

- CR 类型：Story 2.4 TODO tracker；仅执行 05，不修改源码或测试。
- TODO 结果：新增 `TODO-001`，记录 `resolve-parity` fixture 目录只有 metadata、cases 内联在测试 helper 中导致 release-gate fixture 可审阅性不足。
- Backlog 状态：`open=1`、`in-progress=0`、`resolved=0`；建议在 Epic 6 fixture ownership / release-gate fixture 整理时处理。

## 2026-05-27 14:41

- CR 类型：Story 2.4 finalizer；仅执行 06，不执行新的 reviewer/evaluator/fixer。
- 审批验证：最新 evaluation 为 `2-4-code-review-evaluation-20260527-round-3.md`，结论通过，满足 CR 停止条件。
- 状态更新：Story 文件状态更新为 `done`；`sprint-status.yaml` 中 Story 2.4 更新为 `done`，时间戳更新为 `2026-05-27 14:41 CST`。
- 跳过说明：`bmm-workflow-status.yaml` 不存在，按 finalizer 容错规则跳过；Epic 2 仍有 Story 2.5 未完成，不更新 Epic 状态。
