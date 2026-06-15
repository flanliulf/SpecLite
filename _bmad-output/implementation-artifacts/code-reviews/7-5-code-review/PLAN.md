# PLAN

## Goal（目标）

针对 Story `7-5-project-config-init-and-listing-commands` 执行严格串行的开发与 CR 闭环：

1. fresh sub-agent 执行 `/bmad-dev-story story 7-5`，模型 `gpt-5.5`。
2. fresh sub-agent 执行 `/bmenhance-cr-01-reviewer 7-5`，模型 `gpt-5.5`。
3. fresh sub-agent 执行 `/bmenhance-cr-02-evaluator 7-5`，模型 `gpt-5.5`。
4. 如 reviewer 或 evaluator 未通过，fresh sub-agent 执行 `/bmenhance-cr-03-fixer 7-5`，模型 `gpt-5.5`，然后回到 review/evaluate。
5. reviewer 与 evaluator 都通过后，fresh sub-agent 依次执行 `bmenhance-cr-04-rules-extractor`、`bmenhance-cr-05-todo-tracker`、`bmenhance-cr-06-finalizer`。
6. Story `7-5` 完成后，若 Epic 7 全部 Story 均为 `done`，再执行中文 Conventional Commit，本地提交，不 push。

## Context（上下文）

- Repository: `/Users/fancyliu/Repos/SpecLite`
- Story file: `_bmad-output/implementation-artifacts/stories/7-5-project-config-init-and-listing-commands.md`
- Code review directory: `_bmad-output/implementation-artifacts/code-reviews/7-5-code-review/`
- Epic source: `_bmad-output/planning-artifacts/epics/10-epic-7-post-mvp-governance-expansionpost-mvp-治理扩展.md`
- 当前时间：`2026-06-15 15:42 CST`

## Preflight（前置审计）

- Story `7-5` 存在，状态为 `ready-for-dev`。
- `sprint-status.yaml` 当前记录 `epic-7: in-progress`，`7-1`、`7-2`、`7-3`、`7-4` 均为 `done`，`7-5-project-config-init-and-listing-commands: ready-for-dev`。
- Epic-level predecessor evidence 已存在：`_bmad-output/implementation-artifacts/flow-gates/epic-7-kickoff-gate.md`。
- Story `7-5` 的 scope boundary 明确：不把 `init` / `list` 纳入 MVP release gate；不实现 7.1-7.4 的功能；不重写 `install` 行为，不改变现有 `status` / `validate` / `update` semantics；不新增数据库、daemon、remote service、GUI/TUI 或长期 cache。
- 当前工作树包含 Story `7-1` 到 `7-4` 已完成但未提交的改动，以及 Epic 8 既有未追踪文件；后续提交必须白名单暂存，不能使用 `git add -A`。
- 决策：在启动 dev sub-agent 前补齐 `7-5` Story kickoff gate evidence，避免 `bmad-dev-story` 在缺失门禁上 HALT。

## Execution Order（执行顺序）

- [x] 初始化 Story 7-5 code review 目录。
- [x] 创建中文 `PLAN.md`、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md`。
- [x] 生成 `_bmad-output/implementation-artifacts/flow-gates/7-5-project-config-init-and-listing-commands-story-kickoff-gate.md`，结果为 `PASS`。
- [x] Step 1: `/bmad-dev-story story 7-5` 已完成，Story 进入 `review`。
- [x] Step 2: `/bmenhance-cr-01-reviewer 7-5` Round 1 已完成，结论不通过。
- [x] Step 3: `/bmenhance-cr-02-evaluator 7-5` Round 1 已完成，Not Approved。
- [x] Step 4: 执行 `/bmenhance-cr-03-fixer 7-5`，仅修复 evaluator 确认的 P1 阻塞项。
- [x] Step 5: 回到 reviewer/evaluator，Round 2 reviewer 与 evaluator 均已通过。
- [x] Step 6: 通过后执行 04 rules extractor，analysis-only 完成。
- [x] Step 7: 执行 05 todo tracker，确认无需 backlog 变更。
- [x] Step 8: 执行 06 finalizer。
- [x] Step 9: 更新本文件、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md` 为终态。

## Gate（终止条件）

Story `7-5` 只有在以下条件同时满足后才视为本 Story 闭环完成：

- 最新 `bmenhance-cr-01-reviewer` 结论为通过。
- 最新 `bmenhance-cr-02-evaluator` 评估结论为通过 / Approved。
- 如果执行过 fixer，则 fixer 后已重新执行 reviewer 与 evaluator。
- `bmenhance-cr-04-rules-extractor`、`bmenhance-cr-05-todo-tracker`、`bmenhance-cr-06-finalizer` 已按顺序完成。
- 本目录三份进度文件记录终态。

## Kickoff Gate（启动门禁）

Story kickoff gate 已完成并通过：

- File: `_bmad-output/implementation-artifacts/flow-gates/7-5-project-config-init-and-listing-commands-story-kickoff-gate.md`
- Result: `PASS`
- 关键结论：Story `7-5` 已具备进入开发的 contract、functional、evidence anchors；`init` / `list` 必须 contract-first，复用既有 config、manifest/index、adapter registry、safe write 和 `CommandResult` 基座。

下一步：启动 fresh dev sub-agent 执行 `/bmad-dev-story story 7-5`。

## Development Result（开发结果）

fresh dev sub-agent 已完成 `/bmad-dev-story story 7-5`：

- Story status: `review`
- Sprint status: `7-5-project-config-init-and-listing-commands: review`
- HALT: 未触发
- Resolver note: 标准 resolver 因系统 `/usr/bin/python3` 缺少 `tomllib` 失败，dev agent 按 fallback 手工解析 workflow。
- Key implementation:
  - 新增 Post-MVP `speclite init`：支持 config plan、`--dry-run` / 缺少 `--yes` 不写入、`--yes` 通过 operation lock + safe write 写入。
  - `init` 读取 manifest、files index、config layers 后规划 installer-owned config；custom config 只保护/跳过，不覆盖。
  - 新增 Post-MVP `speclite list`：从 module metadata、manifest/skill-index、IDE adapter registry 生成 canonical modules/skills/targets/versions。
  - 扩展 `CommandResult` SPEC、runtime schema、result factory、JSON/human renderer 和 CLI 注册。
- Verification:
  - `npm test -- test/init-command.test.ts test/list-command.test.ts`：先 RED 失败，后通过，2 files / 7 tests。
  - `npm run build`：通过。
  - `npm test`：通过，47 files / 331 tests。
  - `git diff --check`：通过。
  - Story checkbox/status 核对：无未完成 checkbox 输出，Story 与 sprint-status 均为 `review`。

下一步：启动 fresh reviewer sub-agent 执行 `/bmenhance-cr-01-reviewer 7-5`。

## Review Round 1（审查第 1 轮）

Reviewer 已生成：

- File: `_bmad-output/implementation-artifacts/code-reviews/7-5-code-review/7-5-code-review-summary-20260615-round-1.md`
- Round: `1`
- Conclusion: 不通过
- Blocking findings: `1`
- Non-blocking findings: `1`
- Internal fallback: 当前 reviewer agent 无可用 Agent 子代理工具，且本地没有 `review-acceptance-auditor` skill；已按 fallback 串行审查。

主要阻塞项：`init` / `list` 从 `process.cwd()` 查找 bundled source，导致真实 CLI cwd 为 target project 时从 `<target>/assets/source/speclite` 读取 source metadata 并抛 `ENOENT`，影响 AC2 / AC3 / AC4。

非阻塞项：需要明确 absent `_speclite/custom/*.toml` stub 是否允许由 `init --yes` 创建；当前实现保护 existing custom 文件，但会创建 absent human-owned custom stubs。

Reviewer 验证：

- `npm run build`：通过。
- `npm test -- test/init-command.test.ts test/list-command.test.ts`：通过，2 files / 7 tests。
- `npm test`：通过，47 files / 331 tests。
- `npm run lint`：仓库未配置 `lint` script，返回失败；不计为 finding。
- `git diff --check`：通过。
- 定向复现：非 repo cwd 下 `runListCommand` 失败并抛 `ENOENT`。

下一步：启动 fresh evaluator sub-agent 执行 `/bmenhance-cr-02-evaluator 7-5`。

## Evaluation Round 1（评估第 1 轮）

Evaluator 已生成：

- File: `_bmad-output/implementation-artifacts/code-reviews/7-5-code-review/7-5-code-review-evaluation-20260615-round-1.md`
- Round: `1`
- Conclusion: Not Approved
- Need fix: `1`
- Suggested TODO: `1`
- False positives: `0`

修复范围：只处理 `init` / `list` 的 bundled source root 解析 / 注入逻辑，并补 `test/init-command.test.ts`、`test/list-command.test.ts` 中真实 target cwd focused tests。

TODO 范围：absent custom stub 是否允许由 `init --yes` 创建，作为 P2 CR TODO；除非产品/架构明确禁止，本轮 fixer 不修改该行为。

下一步：启动 fresh fixer sub-agent 执行 `/bmenhance-cr-03-fixer 7-5`。

## Fix Round 1（修复第 1 轮）

Fixer 已完成：

- Fix items: `1`
- Fixed: Finding #1，`init` / `list` 不再从 target `process.cwd()` 查找 bundled source；改为基于 package root 读取 canonical source metadata。
- Deferred: Finding #2，absent custom stub 是否允许由 `init --yes` 创建，按 evaluator 结论保留为 P2 CR TODO。
- Fix record: 已追加到 `_bmad-output/implementation-artifacts/code-reviews/7-5-code-review/7-5-code-review-evaluation-20260615-round-1.md`
- Modified files:
  - `src/commands/init.ts`
  - `src/commands/list.ts`
  - `test/init-command.test.ts`
  - `test/list-command.test.ts`
  - `_bmad-output/implementation-artifacts/code-reviews/7-5-code-review/7-5-code-review-evaluation-20260615-round-1.md`
- Verification:
  - `npm test -- test/init-command.test.ts test/list-command.test.ts`：通过，2 files / 7 tests。
  - `npm run build`：通过。
  - `git status --short --branch`：确认未 staging、未 commit、未 push。

下一步：重新启动 fresh reviewer sub-agent 执行 `/bmenhance-cr-01-reviewer 7-5` Round 2。

## Review Round 2（审查第 2 轮）

Reviewer 已生成：

- File: `_bmad-output/implementation-artifacts/code-reviews/7-5-code-review/7-5-code-review-summary-20260615-round-2.md`
- Round: `2`
- Conclusion: 通过
- Blocking findings: `0`
- Non-blocking findings: `1`，维持 Round 1 Finding #2 为 P2 CR TODO。
- Internal fallback: 当前 reviewer agent 无可用内部三层 Agent 工具，已按 skill 降级为串行审查模式。
- Verification:
  - `npm test -- test/init-command.test.ts test/list-command.test.ts`：通过，2 files / 7 tests。
  - `npm run build`：通过。
  - `npm test`：通过，47 files / 331 tests。
  - `npm run lint`：仓库未配置 `lint` script，返回失败；不计为 finding。
  - `git diff --check`：通过。
  - 定向真实 target cwd 复核：通过，`init` / `list` 均返回 schema-valid `CommandResult`。

下一步：启动 fresh evaluator sub-agent 执行 `/bmenhance-cr-02-evaluator 7-5` Round 2。

## Evaluation Round 2（评估第 2 轮）

Evaluator 已生成：

- File: `_bmad-output/implementation-artifacts/code-reviews/7-5-code-review/7-5-code-review-evaluation-20260615-round-2.md`
- Round: `2`
- Conclusion: 通过 / Approved
- Need fix: `0`
- Suggested TODO: `1`
- False positives: `0`
- Next fixer: 不需要
- Verification:
  - `npm test -- test/init-command.test.ts test/list-command.test.ts`：通过，2 files / 7 tests。

Gate 决策：reviewer Round 2 与 evaluator Round 2 均通过，可以进入 04/05/06 收尾链；P2 absent custom stub 语义项交给 05 TODO Tracker。

## Rules Extractor（规则提炼）

04 rules extractor 已完成 analysis-only，未修改文件。

- Candidate rules: `2`
- Candidate 1: `init` / `list` 读取 bundled/canonical source metadata 时，source root 必须锚定 package/canonical source root，不得使用 target project `cwd` / `process.cwd()`；8/12，建议 `record-only` 写入 `cr-rules-summary.md`，需要用户确认，本轮不落地。
- Candidate 2: absent human-owned custom stubs 是否允许由 `init --yes` 创建；不作为新规则沉淀，因为 architecture 已明确 fresh install 可以 create-if-absent 创建 custom stubs，且 existing 文件不得覆盖。
- Suggested TODO: 不建议新增 open TODO；如执行 05，对齐为“无需 open / 已由 architecture 现有规则澄清”。

决策：候选 1 需要用户确认才能落地；为避免流程挂起，本轮不越权写入 `cr-rules-summary.md`，继续执行 05 TODO Tracker。

下一步：启动 05 TODO tracker。

## TODO Tracker（TODO 跟踪）

05 TODO tracker 已完成，未修改 `_bmad-output/implementation-artifacts/cr-rules/cr-todo-backlog.md`。

- Added / Updated / Closed TODO: `0 / 0 / 0`
- Story `7-5` related open TODO: `0`
- Existing open TODO: `TODO-009`、`TODO-010`、`TODO-011`，来源分别为 `1-7`、`7-1`、`7-2`。
- P2 absent custom stub 语义：已由 architecture 现有规则澄清，不新增 open TODO。

下一步：启动 fresh finalizer sub-agent 执行 `bmenhance-cr-06-finalizer 7-5`。

## Finalizer（最终化）

06 finalizer 已完成。

- Story status: `done`
- Sprint status: `7-5-project-config-init-and-listing-commands: done`
- Epic status: `epic-7: done`
- Workflow status: 未更新，因为 `_bmad-output/planning-artifacts/bmm-workflow-status.yaml` 不存在；按 skill 默认容错决策跳过。
- Verification:
  - `rg -n "^Status:|epic-7:|7-5-project-config-init-and-listing-commands:|^last_updated:|^# last_updated:" ...`：确认状态同步。
  - `test -f _bmad-output/planning-artifacts/bmm-workflow-status.yaml`：未找到 workflow status 文件。
  - `git diff --check -- _bmad-output/implementation-artifacts/stories/7-5-project-config-init-and-listing-commands.md _bmad-output/implementation-artifacts/sprint-status.yaml`：通过。

Story `7-5` 闭环完成，Epic 7 全部 Story 已完成。下一步执行最终中文 Conventional Commit，本地提交，不 push。
