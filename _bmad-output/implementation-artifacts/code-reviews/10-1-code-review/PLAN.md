# Epic 10 Story 10.1 Dev/CR Plan（开发与代码审查计划）

## Goal（目标）

在 Epic 10 范围内严格串行推进 Story 10.1：先完成 `/bmad-dev-story story 10.1`，再执行 CR reviewer / evaluator / fixer 闭环，最终通过 rules extractor、TODO tracker、finalizer 收口。当前 Story 完成后才允许进入 Story 10.2。

## Current Epic（当前 Epic）

- Epic: `epic-10`
- Epic 状态：`in-progress`
- 当前目标 Story：`10.1`
- 执行策略：strict serial；同一时间只推进一个 Story、一个步骤。

## Story Order（Story 执行顺序）

1. `10.1` - Ecosystem Module Taxonomy And Guided Selected Install Closure
2. `10.2` - Ecosystem Authoring Contract And Creator Support
3. `10.3` - Frontend Ecosystem Source Expansion
4. `10.4` - Other Ecosystem Source Expansion
5. `10.5` - Ecosystem Fixture And Release Gate Generalization
6. `10.6` - Public Docs And Maintainer Workflow

## Current Status（当前状态）

- Story 10.1 状态：`ready-for-dev`
- 当前轮次：Story 10.1 completed
- Development：completed; Story status is `review`
- CR Reviewer：Round 2 completed; passed
- CR Evaluator：Round 2 completed; passed
- CR Fixer：completed for Round 1 P1
- Rules Extractor：completed
- TODO Tracker：completed; no TODO
- Finalizer：completed

## Checklist（检查清单）

- [x] 确认仓库路径为 `/Users/fancyliu/Repos/SpecLite`。
- [x] 确认目标 Epic 为 `epic-10`。
- [x] 读取 `sprint-status.yaml`，确认 Story 10.1-10.6 均为 `ready-for-dev`。
- [x] 读取 Epic 10 规划文件，确认 Story 顺序与依赖。
- [x] 检查 Story 10.x 文件存在。
- [x] 检查当前无 Story 10.x code review 目录，判断为新任务。
- [x] 检查 `git status --short --branch`，当前在 `main...origin/main [ahead 9]` 且无未提交改动。
- [x] 启动 fresh sub-agent 执行 `/bmad-dev-story story 10.1`。
- [x] Development sub-agent 在写代码前 HALT：检测到 unrelated canonical source drift，未修改 Story 10.1、`sprint-status.yaml` 或源码。
- [x] 主 orchestrator 复核 `git status --short --branch --untracked-files=all`，确认存在 unrelated canonical source drift。
- [x] 运行 canonical source warning-only check，确认 `release/packaging-manifest.json` 缺少新 `speclite-html-ppt-generator` 文件。
- [x] 2026-07-06 继续审计：`release/packaging-manifest.json` 已有工作树修改，canonical source check 当前 `status: ok` 且无 findings。
- [x] Orchestrator 决策：在当前混合工作树中继续 Story 10.1，但把已有 support-skill / docs drift 记为外部 drift，禁止纳入 Story 10.1 修改范围或最终提交白名单。
- [x] Development 完成后记录修改文件、验证命令、验证结果和风险。
- [x] Story 10.1 文件状态已更新为 `review`。
- [x] `sprint-status.yaml` 中 Story 10.1 已更新为 `review`。
- [x] 启动 fresh sub-agent 执行 `/bmenhance-cr-01-reviewer 10.1`。
- [x] Reviewer Round 1 已完成：不通过，1 个 `[中] patch` 发现。
- [x] 启动 fresh sub-agent 执行 `/bmenhance-cr-02-evaluator 10.1`。
- [x] Evaluator Round 1 已完成：确认 reviewer finding 有效，P1，需 fixer。
- [x] 如 evaluator 要求修复，执行 `/bmenhance-cr-03-fixer 10.1` 并重新 review/evaluate。
- [x] Fixer 已修复 AC5 两级交互选择，并将修复记录追加到 Round 1 evaluation。
- [x] 启动 Round 2 fresh sub-agent 执行 `/bmenhance-cr-01-reviewer 10.1`。
- [x] Reviewer Round 2 已完成：通过，无新发现。
- [x] 启动 Round 2 fresh sub-agent 执行 `/bmenhance-cr-02-evaluator 10.1`。
- [x] Evaluator Round 2 已完成：确认 reviewer 通过，不需要 fixer。
- [x] 启动 fresh sub-agent 执行 `/bmenhance-cr-04-rules-extractor 10.1`。
- [x] Rules extractor 完成：更新 `cr-rules-summary.md`，无 TODO 交接。
- [x] 启动 fresh sub-agent 执行 `/bmenhance-cr-05-todo-tracker 10.1`。
- [x] TODO tracker 完成：无新增 TODO，未修改 `cr-todo-backlog.md`。
- [x] 启动 fresh sub-agent 执行 `/bmenhance-cr-06-finalizer 10.1`。
- [x] Finalizer 完成：Story 10.1 与 `sprint-status.yaml` 均已标记 `done`。
- [x] Story 10.1 完成门禁满足，可以进入 Story 10.2。
- [ ] CR 双通过后依序执行 rules extractor、TODO tracker、finalizer。

## Stop Condition（终止条件）

Story 10.1 只有在开发完成、最新 reviewer 通过、最新 evaluator 通过、必要 fixer 已完成并复审通过、rules extractor / TODO tracker / finalizer 全部按顺序完成、状态文件同步后，才可进入 Story 10.2。

## Current Blocker（当前阻塞）

Story 10.1 development 尚未开始。当前工作树存在不属于 Story 10.1 的 canonical source drift：

- `assets/source/speclite/README.md`
- `docs/reference/canonical-source-layout.md`
- `assets/source/speclite/support-skills/speclite-docs-intro-ppt-creator/*`
- `assets/source/speclite/support-skills/speclite-html-ppt-generator/**`

2026-07-06 复核后，canonical source check 当前 `status: ok`，`release/packaging-manifest.json` 已被工作树中的外部变更更新。为继续推进 active goal，orchestrator 选择在当前混合工作树中恢复 development，但这些外部 drift 不属于 Story 10.1 范围，不得被 development worker 修改、回滚、暂存或纳入最终提交白名单。

## Development Evidence（开发证据）

- Story 状态：`_bmad-output/implementation-artifacts/stories/10-1-ecosystem-module-taxonomy-and-guided-selected-install-closure.md` 为 `Status: review`。
- Sprint 状态：`_bmad-output/implementation-artifacts/sprint-status.yaml` 中 `10-1-ecosystem-module-taxonomy-and-guided-selected-install-closure: review`。
- Development 验证：
  - `npm test -- test/source-and-modules.test.ts`：通过 18/18。
  - `npm test -- test/install-module-selection.test.ts`：通过 11/11。
  - `npm test -- test/runtime-structure.test.ts test/fixture-release-gates.test.ts`：通过 16/16。
  - `npm test -- test/validate-command.test.ts test/governance-report-command.test.ts test/list-command.test.ts`：通过 26/26。
  - `npm test -- --testTimeout 30000`：通过 56 files / 404 tests。
  - `npm run build`：通过。
  - `npm run release:packaging-check`：通过。
  - `node assets/source/speclite/support-skills/speclite-check-canonical-source-change/scripts/check_canonical_source_change.mjs --project-root . --scope all --format json`：`status: ok`，`findings: []`。
  - `git diff --check`：通过。

## Reviewer Round 1（审查第 1 轮）

- Review summary：`_bmad-output/implementation-artifacts/code-reviews/10-1-code-review/10-1-code-review-summary-20260706-round-1.md`
- 结论：不通过。
- 发现：1 个 `[中] patch`。
- 核心问题：interactive `speclite install` 仍是一次性 exact module code 输入，没有真正实现 AC5 的 `category -> ecosystem id` 两级选择。
- Reviewer 运行状态：当前环境无 reviewer 内部 Agent 子代理工具，按 skill 降级为串行三层审查；无单层失败；`.tmp` 已清理。

## Evaluator Round 1（评估第 1 轮）

- Evaluation：`_bmad-output/implementation-artifacts/code-reviews/10-1-code-review/10-1-code-review-evaluation-20260706-round-1.md`
- 结论：reviewer finding 确认有效。
- 优先级：P1，阻塞 Story 10.1 通过。
- 决策：进入 fixer，仅修复 interactive install 未实现 `category -> ecosystem id` 两级选择的问题。

## Fixer Round 1（修复第 1 轮）

- 修复记录：`_bmad-output/implementation-artifacts/code-reviews/10-1-code-review/10-1-code-review-evaluation-20260706-round-1.md` 的 `## 修复执行记录`。
- 修复范围：
  - `src/bin/speclite.ts`
  - `test/cli-smoke.test.ts`
  - Round 1 evaluation 修复记录
- 修复内容：explicit interactive install 改为先选 standard modules，再在已选 `sdlc` 时提示 ecosystem category；选中 category 后只展示该 category 下 ecosystem ids，并映射为 exact ecosystem module code。
- 验证：
  - `npm test -- --run test/cli-smoke.test.ts`：通过 17 tests。
  - `npm test -- --run test/install-module-selection.test.ts`：通过 11 tests。
  - `npm run build`：通过。
  - canonical source check：`status=ok`，`findings=[]`。
  - `npm test`：通过 56 files / 408 tests。
  - `git diff --check -- src/bin/speclite.ts test/cli-smoke.test.ts _bmad-output/implementation-artifacts/code-reviews/10-1-code-review/10-1-code-review-evaluation-20260706-round-1.md`：通过。

## Reviewer Round 2（审查第 2 轮）

- Review summary：`_bmad-output/implementation-artifacts/code-reviews/10-1-code-review/10-1-code-review-summary-20260706-round-2.md`
- 结论：通过。
- Round 1 P1：已修复。
- 新发现：0。
- Reviewer 运行状态：内部 Agent 子代理不可用，按 skill 降级为串行三层审查；无单层失败；`.tmp` 已清理。

## Evaluator Round 2（评估第 2 轮）

- Evaluation：`_bmad-output/implementation-artifacts/code-reviews/10-1-code-review/10-1-code-review-evaluation-20260706-round-2.md`
- 结论：确认 reviewer Round 2 通过。
- Fixer：不需要。
- CR TODO：无。
- 人工决策：无。

## Rules Extractor（规则提炼）

- 修改文件：`_bmad-output/implementation-artifacts/cr-rules/cr-rules-summary.md`
- 规则：更新既有 `CR-API-03`，追加 Story 10.1 复现证据。
- 候选规则：`用户可见交互能力必须接入 command path 而非停留在 pure model`
- 评分：8/12。
- 去向：rules-summary。
- 全局文档：不更新。
- TODO 交接：无。

## TODO Tracker（待办追踪）

- 结论：无相关待办事项。
- `cr-todo-backlog.md`：未修改。
- 证据：Round 1 evaluation 无降级 TODO，Round 2 summary/evaluation 均确认无非阻塞待办，04 rules extractor 无 TODO 交接。

## Finalizer（最终收口）

- Story 文件：`_bmad-output/implementation-artifacts/stories/10-1-ecosystem-module-taxonomy-and-guided-selected-install-closure.md` 已更新为 `Status: done`。
- Sprint 状态：`_bmad-output/implementation-artifacts/sprint-status.yaml` 中 `10-1-ecosystem-module-taxonomy-and-guided-selected-install-closure: done`。
- `last_updated`：`2026-07-06 21:45 CST`。
- Workflow status：`_bmad-output/planning-artifacts/bmm-workflow-status.yaml` 不存在，按 finalizer skill 跳过，未创建新文件。
- Epic 状态：`epic-10` 保持 `in-progress`；`10.2` 到 `10.6` 仍为 `ready-for-dev`。
