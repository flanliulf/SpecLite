# Story 9.1 Code Review Plan（代码审查计划）

## Goal（目标）

对 Story 9.1 `Installed Skill Activation Contract Hardening（已安装 Skill 激活契约收口）` 执行开发与代码审查闭环。外层严格串行：先完成 `bmad-dev-story story 9-1`，再依次执行 CR reviewer、evaluator、必要 fixer 循环，最后执行 CR rules extractor、TODO tracker、finalizer。

## Scope（范围）

- Epic 输入：`_bmad-output/planning-artifacts/epics/12-epic-9-installed-runtime-activation-contract-hardening已安装-runtime-激活契约收口.md`
- Story 输入：`_bmad-output/implementation-artifacts/stories/9-1-installed-skill-activation-contract-hardening.md`
- Code Review 输出目录：`_bmad-output/implementation-artifacts/code-reviews/9-1-code-review/`
- Epic 9 Story 顺序：
  - `9-1-installed-skill-activation-contract-hardening`
  - `9-2-python-resolver-compatibility-asset-projection`

## Current State（当前状态）

- 当前时间：2026-06-17 19:08 CST
- 当前 Story：9.1
- 当前轮次：Round 1
- 任务类型：新 dev/CR 任务
- Story 状态：`review`
- 已有 CR 产物：未发现 `9-*` code review 目录
- Git 状态：`main...origin/main [ahead 4]`，工作树存在大量既有 dirty / untracked 文件；本轮必须保留无关改动，最终提交只纳入 Epic 9 dev/CR 闭环相关白名单文件。
- Story 9.2 gate：SR gate artifact 已裁定在 Story 9.1 full corpus gate 通过前不得进入 implementation。

## Steps（执行步骤）

- [x] Step 0: Preflight（前置审计）
- [x] Step 1: Initialize Logs（初始化记录）
- [x] Step 2: fresh sub-agent 执行 `bmad-dev-story story 9-1`
- [x] Step 3: Round 1 fresh sub-agent 执行 `bmenhance-cr-01-reviewer 9-1`
- [x] Step 4: Round 1 fresh sub-agent 执行 `bmenhance-cr-02-evaluator 9-1`
- [x] Step 5: Round 1 fresh sub-agent 执行 `bmenhance-cr-03-fixer 9-1`
- [x] Step 5a: Round 2 fresh sub-agent 执行 `bmenhance-cr-01-reviewer 9-1`
- [x] Step 5b: Round 2 fresh sub-agent 执行 `bmenhance-cr-02-evaluator 9-1`
- [x] Step 6a: fresh sub-agent 执行 `bmenhance-cr-04-rules-extractor 9-1`
- [x] Step 6b: fresh sub-agent 执行 `bmenhance-cr-05-todo-tracker 9-1`
- [x] Step 6c: fresh sub-agent 执行 `bmenhance-cr-06-finalizer 9-1`
- [x] Step 7: 更新本目录三份进度文件，并判断是否允许进入 Story 9.2

## Stop Conditions（终止条件）

- 通过：开发完成，最新 CR reviewer 通过，最新 CR evaluator 通过，必要 fixer 后已重新 review/evaluate，并完成 rules extractor、TODO tracker、finalizer。
- 阻塞：缺失 Story 输入、review/evaluation 结果不明确且无法保守判断、需要修改需求边界、需要纳入无关文件、需要 push 或破坏性操作。

## Development Result（开发结果）

- Dev sub-agent：Faraday
- 结论：Story 9.1 已进入 `review`，可启动 CR reviewer。
- 修改范围摘要：
  - Story/tracking：`_bmad-output/implementation-artifacts/stories/9-1-installed-skill-activation-contract-hardening.md`、`_bmad-output/implementation-artifacts/sprint-status.yaml`
  - 新增测试：`test/installed-activation-contract.test.ts`
  - Docs：`README.md`、`docs/how-to/use-installed-skills.md`、`docs/reference/cli.md`
  - Agent lint：`assets/source/speclite/support-skills/speclite-agent-lint/scripts/check_agent_skill.py`、`assets/source/speclite/support-skills/speclite-agent-lint/references/lint-rules.md`
  - Activation corpus：`assets/source/speclite/core-skills/**` 与 `assets/source/speclite/sdlc-skills/**` 的 activation 文案和 references
  - Support-side negative scan docs：`assets/source/speclite/support-skills/speclite-agent-creator/**`
- 验证：
  - `npm test -- test/installed-activation-contract.test.ts`：通过，4/4。
  - `npm test -- test/skill-artifact-loop.test.ts test/resolve-cli.test.ts test/resolve-readers.test.ts test/installed-activation-contract.test.ts`：通过，26/26。
  - `python3 assets/source/speclite/support-skills/speclite-agent-lint/scripts/check_agent_skill.py --all assets/source/speclite/sdlc-skills`：通过，7 个 persona Agent，0 findings。
  - support-side negative `rg` scan：未发现 legacy resolver / single-file config activation 文案。
  - `npm run release:packaging-check`：通过。
  - `git diff --check`：通过。
  - `npm test -- --testTimeout 30000`：失败 7 个断言；失败原因记录为既有 4 个 unrelated untracked SDLC skill roots 污染 corpus count，未按 Story 9.1 范围吸收进 snapshots。
- 下一步：启动 CR reviewer，判断实现质量和 residual blocker。

## Round 1 Reviewer Result（Round 1 审查结果）

- Review 文件：`_bmad-output/implementation-artifacts/code-reviews/9-1-code-review/9-1-code-review-summary-20260617-round-1.md`
- 结论：不通过
- PASS：否
- Findings：2 个，均为 `[中] / patch`
- 核心问题：
  - `check_agent_skill.py` 的 legacy activation regex 双重转义，导致 `RUNTIME-03` 漏报。
  - `installed-activation-contract.test.ts` 的 full corpus 扫描只覆盖固定 suffix，未覆盖 AC5 要求的 `references/**/*.md` 全量 corpus。
- 降级情况：当前环境没有 reviewer 内部可调用的 `Agent` 子代理工具，reviewer 按 skill 降级路径串行完成三层审查；无内部审查层失败。
- 下一步：启动 CR evaluator，评估 findings 有效性和 fixer 范围。

## Round 1 Evaluator Result（Round 1 评估结果）

- Evaluation 文件：`_bmad-output/implementation-artifacts/code-reviews/9-1-code-review/9-1-code-review-evaluation-20260617-round-1.md`
- 结论：不通过
- PASS：否
- Reviewer findings：有效 2 条，误报 0 条
- Requires Fixer：是
- Fixer 精确范围：
  - 修复 `check_agent_skill.py` 中 `LEGACY_ACTIVATION_PATTERN` 的双重转义漏报，并补最小负向验证。
  - 扩展 `test/installed-activation-contract.test.ts` 的 corpus discovery，覆盖 canonical `SKILL*.md`、全量 `references/**/*.md`、terminal step files，以及 installed mirror 的 `SKILL*.md` / references。
- 用户裁决：无需用户裁决。
- 下一步：启动 CR fixer，仅按 evaluator 范围定点修复。

## Round 1 Fixer Result（Round 1 修复结果）

- Fixer 依据：`_bmad-output/implementation-artifacts/code-reviews/9-1-code-review/9-1-code-review-evaluation-20260617-round-1.md`
- 修复记录：已追加到 evaluation 文件 `## 修复执行记录`
- 修改文件：
  - `assets/source/speclite/support-skills/speclite-agent-lint/scripts/check_agent_skill.py`
  - `test/installed-activation-contract.test.ts`
  - `_bmad-output/implementation-artifacts/code-reviews/9-1-code-review/9-1-code-review-evaluation-20260617-round-1.md`
- 修复摘要：
  - 修复 `LEGACY_ACTIVATION_PATTERN` raw regex 双重转义问题。
  - 新增 `--self-test-legacy-activation`，验证 6 条 legacy activation samples 会被命中。
  - 扩展 activation contract corpus discovery：canonical 扫描 `SKILL*.md` 与全量 `references/**/*.md`，临时 install 后扫描 `.agents/skills` / `.claude/skills` mirror 的 `SKILL*.md` 与 `references/**/*.md`。
- 验证：
  - `python3 assets/source/speclite/support-skills/speclite-agent-lint/scripts/check_agent_skill.py --self-test-legacy-activation`：通过。
  - `npm test -- test/installed-activation-contract.test.ts`：通过，4/4。
  - `python3 assets/source/speclite/support-skills/speclite-agent-lint/scripts/check_agent_skill.py --all assets/source/speclite/sdlc-skills`：通过。
  - `git diff --check`：通过。
- 下一步：重新启动 CR reviewer Round 2。

## Round 2 Reviewer Result（Round 2 审查结果）

- Review 文件：`_bmad-output/implementation-artifacts/code-reviews/9-1-code-review/9-1-code-review-summary-20260617-round-2.md`
- 结论：通过
- PASS：是
- 上轮问题关闭情况：
  - Finding #1 `check_agent_skill.py` legacy regex 漏报：已关闭，自测 6 条 legacy samples 通过。
  - Finding #2 full corpus test 覆盖不足：已关闭，当前 discovery 覆盖 `SKILL*.md` 与全部 `references/**/*.md`，focused Vitest 4/4 通过。
- 新 findings：0 个
- 降级情况：当前环境没有 reviewer 内部可调用的 `Agent` 子代理工具，reviewer 按 skill 降级路径串行完成三层复审；无内部审查层失败。
- 下一步：启动 CR evaluator Round 2，确认是否可 closeout。

## Round 2 Evaluator Result（Round 2 评估结果）

- Evaluation 文件：`_bmad-output/implementation-artifacts/code-reviews/9-1-code-review/9-1-code-review-evaluation-20260617-round-2.md`
- 结论：通过
- PASS：是
- 上轮问题关闭确认：
  - Finding #1 `check_agent_skill.py` legacy activation regex 漏报：已关闭。
  - Finding #2 full corpus activation contract test 覆盖不足：已关闭。
- Requires Fixer：否
- 用户裁决：无
- 下一步：进入 CR closeout，严格按 `bmenhance-cr-04-rules-extractor 9-1`、`bmenhance-cr-05-todo-tracker 9-1`、`bmenhance-cr-06-finalizer 9-1` 顺序执行。

## Rules Extractor Result（规则提炼结果）

- 执行 skill：`bmenhance-cr-04-rules-extractor`
- 输出文件：`_bmad-output/implementation-artifacts/cr-rules/cr-rules-summary.md`
- 决策：record-only，未修改全局文档。
- 追加规则：
  - `CR-TEST-05`：Legacy activation negative pattern 必须用 canonical samples 自测，`7/12`，去向 `rules-summary`。
  - `CR-TEST-06`：Activation contract corpus discovery 必须结构化覆盖 canonical 与 installed mirror，`8/12`，去向 `rules-summary`。
- TODO 判断：`cr-04` 未识别未解决的非阻塞改进项，建议 `cr-05` 无需新增 TODO，但仍需按 closeout 顺序执行确认。
- 下一步：启动 `bmenhance-cr-05-todo-tracker 9-1`。

## TODO Tracker Result（TODO 追踪结果）

- 执行 skill：`bmenhance-cr-05-todo-tracker`
- TODO backlog：未更新 `_bmad-output/implementation-artifacts/cr-rules/cr-todo-backlog.md`
- 新增 TODO：0
- 匹配 Story 9.1 的现有 TODO：0
- 判断依据：Round 1 阻塞项均已修复，Round 2 evaluation 明确无需新增 CR TODO，`cr-04` 未向 `cr-05` 交接未解决非阻塞候选项。
- 下一步：启动 `bmenhance-cr-06-finalizer 9-1`。

## Finalizer Result（收口结果）

- 执行 skill：`bmenhance-cr-06-finalizer`
- Latest evaluation：`_bmad-output/implementation-artifacts/code-reviews/9-1-code-review/9-1-code-review-evaluation-20260617-round-2.md`
- CR 结论：PASS
- 修改文件：
  - `_bmad-output/implementation-artifacts/stories/9-1-installed-skill-activation-contract-hardening.md`
  - `_bmad-output/implementation-artifacts/sprint-status.yaml`
- 状态变更：
  - Story 9.1：`Status: review` -> `Status: done`
  - `sprint-status.yaml`：`9-1-installed-skill-activation-contract-hardening: review` -> `done`
  - `last_updated`：`2026-06-17 19:46 CST`
  - `epic-9`：保持 `in-progress`
  - Story 9.2：Story 文件保持 `blocked-by-9-1-corpus-gate`，tracker 保持 `ready-for-dev`
- 跳过项：未发现 `_bmad-output/planning-artifacts/bmm-workflow-status.yaml` 或其他 workflow status 文件，按 finalizer 容错规则跳过。
- Story 9.2 gate：允许进入 gate 判断；不得仅凭 tracker 启动。
