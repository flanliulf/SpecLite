# EXPERIMENTS

## 尝试记录

### 2026-05-28 初始化

- 方案: 为 Story 3.5 创建 code review 进度文件，并按 dev -> CR -> evaluator -> fixer -> 复检 -> rules/todo/finalizer 的顺序推进。
- 选择原因: 用户要求每个 Story 在对应 code review 输出目录维护中文进度记录，且所有步骤必须严格串行。
- 结果: 已初始化，等待前序 Story 完成后开始。

### 2026-05-28 Dev Story 启动

- 方案: 按本次用户指令收敛范围，只执行 `/bmad-dev-story story 3-5`，不进入 CR、finalizer、提交或推送。
- 选择原因: 用户明确要求“只执行 Story 3.5 的开发步骤”，且 Story 3.5 当前为 `ready-for-dev`。
- 结果: 已读取 workflow、配置、Story、project-context 和 sprint 状态；开始前置实现核对。

### 2026-05-28 前置实现核对

- 方案: 按 Story Task 1 先核对 implementation anchors 是否真实存在，重点检查 `src/commands/update.ts` 和 CLI covered command 注册情况。
- 选择原因: Story 明确要求若 `src/commands/update.ts` 等前置文件不存在，应先完成前置 stories，且不得在 Story 3.5 中创建孤立 diagnostics-only scaffold。
- 结果: 触发 HALT。`src/commands/` 只有 `install.ts`、`resolve.ts`、`status.ts`、`validate.ts`；`src/bin/speclite.ts` 注册了 `status`、`validate`、`install` 和 `resolve`，未注册 `update` / `update --repair`。

### 2026-05-28 主流程复核

- 方案: 主流程重新读取 Story 3.5、`src/commands/` 和 `src/bin/speclite.ts`，确认 HALT 是否可通过保守默认决策继续。
- 选择原因: 用户要求尽量采用推荐决策避免挂起，但项目宪法和 Story Task 1 都要求信息不足或前置缺失时停止，不能猜测或创建越界实现。
- 结果: HALT 成立且不可在 Story 3.5 范围内解除。`src/commands/update.ts` 不存在，CLI 未注册 `update` / `update --repair`；Story 3.5 明确要求先完成前置 stories，不得创建孤立 diagnostics/update scaffold。因此不能进入 CR/evaluator/fixer/finalizer，也不能继续到 Story 3.6。

### 2026-05-28 Goal 续跑复核

- 方案: 在自动续跑目标时重新检查 `sprint-status.yaml`、`src/commands/`、`src/bin/speclite.ts` 和 Story 3.5 hard-stop 文本，确认 blocker 是否仍存在。
- 选择原因: 目标要求继续推进，但 completion audit 要求以当前 worktree 为准，不能依赖上一轮结论。
- 结果: 同一 blocker 仍存在。3.1 到 3.4 当前为 `done`，3.5 为 `in-progress`，3.6 为 `ready-for-dev`；`src/commands/update.ts` 仍不存在，CLI 仍未注册 `update` / `update --repair`。由于目标要求按 Story 顺序执行，不能跳过 3.5 继续 3.6；由于 Story 3.5 明确禁止孤立 scaffold，不能在未授权的情况下补 `update` command。

### 2026-05-29 用户授权推荐方案

- 方案: 按推荐方案先执行一个显式前置任务，补齐 `update` / `update --repair` 的最小 command surface，然后恢复 Story 3.5 dev 流程。
- 选择原因: 当前 blocker 的根因是 Story 3.5 written scope 依赖尚未存在的 update command surface；用户已确认“按照你的推荐”执行，因此可以把该能力作为前置任务处理，而不是在 Story 3.5 内越界创建。
- 预期边界: 只补 orchestration seam 和稳定 contract 接入口；不实现 Epic 4 的写入计划、冲突检测、repair apply 或 operation lock。
- 结果: 已完成前置 scaffold。已新增 `src/commands/update.ts`，在 CLI 注册 `update` / `update --repair`，两者均返回 non-write placeholder `CommandResult`，并保持 `writeAuthorized: false`、`changedPaths: []`、`skippedPaths: []`、`conflicts: []`。主流程复核后移除额外 `--project` 选项，保留既有 positional target-directory 风格。验证通过：`npm test -- test/update-command.test.ts test/cli-smoke.test.ts`、`npm run build`、`git diff --check`。

### 2026-05-29 Story 3.5 contract 收敛

- 方案: 先补 focused red tests，再最小实现 schema/result/output/issue guard，最后跑相关测试、全量测试和 build。
- 选择原因: Story 3.5 是 public JSON contract migration；风险集中在 schema allowlist、data payload 泄露、status/exit derivation、update conflict blocker 和 redaction-safe issues。
- 结果: 已完成。新增/收口 `UpdateCommandData`、`RepairCommandData`、`UpdatePlan`、`RepairPlan`、`UpdateConflict`、reason code guard、covered command fixture schema union、redaction guard、targetProject display helper、status/exit helper、update conflict single issue projection。`update` / `update.repair` 仍为 non-write placeholder，不触碰 Epic 4 写入行为。
- 验证: `npm test -- test/contract-anchors.test.ts test/update-command.test.ts test/validate-command.test.ts` 通过；`npm test -- test/contract-anchors.test.ts test/status-command.test.ts test/validate-command.test.ts test/update-command.test.ts test/cli-smoke.test.ts test/install-module-selection.test.ts` 通过；全量 `npm test` 通过；`npm run build` 通过。

### 2026-05-29 CR Reviewer Round 1

- 方案: 使用 `bmenhance-cr-01-reviewer` 对 Story 3.5 执行首轮 code review；由于当前环境没有 Agent 工具，按 skill 降级为串行三层审查。
- 选择原因: 用户明确要求 fresh sub-agent 只做 reviewer，并重点检查 JSON contract seam 与 Epic 4 non-write 边界。
- 结果: 不通过。发现 `ValidationIssue.details` 虽为 optional，但 schema redaction guard 会把缺失的 `details` 判为 unsafe，导致合法 issue 无法通过 executable schema / fixture parser。
- 验证: focused tests 3 files / 21 tests 通过；全量 `npm test` 25 files / 152 tests 通过；`npm run build` 通过；定向 `ValidationIssueSchema.safeParse` 复现失败。

### 2026-05-29 CR Evaluator Round 1

- 方案: 使用 `bmenhance-cr-02-evaluator` 独立评估 `3-5-code-review-summary-20260529-round-1.md`，只写 evaluation 和进度记录，不执行 fixer/finalizer，不修改源码。
- 选择原因: 用户明确要求 fresh sub-agent 严格串行执行 Story 3.5 CR evaluation，且 reviewer 结论为不通过，需要确认 findings 是否有效、严重性与修复必要性。
- 结果: 不通过。确认 `ValidationIssue.details` optional 与 redaction guard 实现冲突为有效阻塞项，评估优先级为 P1，要求 fixer 最小修复。
- 验证: 已读取 Story optional `details` 契约、schema optional 定义、redaction guard 实现、无 `details` producer；已用 `ValidationIssueSchema.safeParse` 独立复现无 `details` issue 失败，错误路径为 `details`。

### 2026-05-29 CR Reviewer Round 2

- 方案: 使用 `bmenhance-cr-01-reviewer` 对 fixer 修复后的 Story 3.5 执行第二轮复审；重点确认 Round 1 P1 是否修复，并横向复核 AC 1-9 / Task 1-9 是否出现回归。
- 选择原因: 用户明确要求 fresh sub-agent 只做第二轮 reviewer，不执行 evaluator/fixer/finalizer，不修改源码。
- 结果: 不通过。Round 1 P1 原始症状已修复，但新发现修复把 `undefined` 放宽为 recursive guard 的通用安全值，导致 `details` 内部 `undefined` 被 schema 接受，JSON 渲染后静默丢失字段。
- 验证: focused tests 3 files / 21 tests 通过；全量 `npm test` 25 files / 152 tests 通过；`npm run build` 通过；定向复现显示无 `details` issue 通过，同时 `details: { reason: undefined }` 也错误通过并渲染为 `{}`。

### 2026-05-29 CR Evaluator Round 2

- 方案: 使用 `bmenhance-cr-02-evaluator` 独立评估 `3-5-code-review-summary-20260529-round-2.md`，只写 round-2 evaluation 和进度记录，不执行 fixer/finalizer，不修改源码。
- 选择原因: Round 2 reviewer 结论为不通过，且 finding 涉及 Story 3.5 的 `ValidationIssue.details` JSON-serializable / fixture-comparable contract，需要独立确认有效性、严重性和修复必要性。
- 结果: 不通过。确认 reviewer finding 有效且非误报；`undefined` 只能作为 root optional `details` 缺省被接受，不能作为 `details` 内部 JSON payload 被接受。
- 验证: 已读取 Story `details?: Record<string, unknown>` 契约、redaction / fixture requirements、`ValidationIssueSchema.superRefine`、`findUnsafeIssueValueAt` 和 focused tests；已独立复现 nested `undefined` 通过 schema 后 JSON 渲染为 `{}`，数组内 `undefined` 渲染为 `null`。

### 2026-05-29 CR Reviewer Round 3

- 方案: 使用 `bmenhance-cr-01-reviewer` 对第二轮 fixer 后代码执行第三轮复审；当前环境无 Agent 工具，按 skill 降级为串行三层审查。
- 选择原因: 用户明确要求第三轮 reviewer 复审全部 Story 3.5 AC/Tasks，重点确认两轮 P1 均修复且无回归，不进入 evaluator/fixer/finalizer。
- 结果: 不通过。两轮 P1 已修复且无 redaction guard 回归；但全量核对 AC6 时发现 `install` command 未读取 `_speclite/config.toml` 的 trim 后 project name，仍以 target directory basename 作为 `targetProject`。
- 验证: focused tests 3 files / 21 tests 通过；全量 `npm test` 25 files / 152 tests 通过；`npm run build` 通过；`git diff --check` 通过；定向复现确认 `install` targetProject config-name 问题。

### 2026-05-29 CR Evaluator Round 3

- 方案: 使用 `bmenhance-cr-02-evaluator` 独立评估 `3-5-code-review-summary-20260529-round-3.md`，只写 round-3 evaluation 和进度记录，不执行 fixer/finalizer，不修改源码。
- 选择原因: Round 3 reviewer 结论为不通过，finding 涉及 Story 3.5 AC6 的 public `targetProject` stable display identifier，需要独立确认 `install` 与 `status` / `validate` / `update` 的行为是否确实不一致。
- 结果: 不通过。确认 reviewer finding 有效且非误报；`install` 未调用 `resolveTargetProjectDisplayName`，而 `status`、`validate`、`update` 已调用该 helper。
- 验证: 已读取 Story AC6、Task 5、`src/diagnostics/command-result.ts` helper、`src/commands/install.ts`、`src/commands/status.ts`、`src/commands/validate.ts`、`src/commands/update.ts` 和 `src/fs/path-normalizer.ts`；已用临时目录复现 `install` 输出 basename、其余三项输出 trim 后 config project name。

### 2026-05-29 CR Reviewer Round 4

- 方案: 使用 `bmenhance-cr-01-reviewer` 对第三轮 fixer 后代码执行第四轮复审；当前环境无 Agent 工具，按 skill 降级为串行三层审查。
- 选择原因: 用户明确要求第四轮 reviewer 复审全部 Story 3.5 AC/Tasks，重点确认三轮 P1 均修复且无回归，不进入 evaluator/fixer/finalizer。
- 结果: 通过。Round 1 optional `details`、Round 2 nested `undefined`、Round 3 install `targetProject` config-name 三个 P1 均已修复，本轮未发现新的阻塞项或中高优先级问题。
- 验证: focused tests 6 files / 44 tests 通过；全量 `npm test` 25 files / 154 tests 通过；`npm run build` 通过；`git diff --check` 通过；定向复现确认 install success / runtime guard failure 均输出 config project name，optional `details` 通过，nested object/array `undefined` 均失败。

### 2026-05-29 CR Evaluator Round 4

- 方案: 使用 `bmenhance-cr-02-evaluator` 独立评估 `3-5-code-review-summary-20260529-round-4.md`，只写 round-4 evaluation 和进度记录，不执行 fixer/finalizer，不修改源码。
- 选择原因: Round 4 reviewer 结论为通过，需要独立确认三轮 P1 是否确实关闭、是否仍有必须修复项，以及是否需要进入 fixer。
- 结果: 通过。确认 Round 1 optional `details`、Round 2 nested `undefined`、Round 3 install `targetProject` config-name 三个 P1 均已关闭；未发现新的阻塞项、中高优先级问题或 CR TODO。
- 验证: 已读取 Story AC6/AC7、`ValidationIssueSchema`、`findUnsafeIssueValue`、`runInstallCommand`、`resolveTargetProjectDisplayName` 和 focused tests；已独立运行 focused tests、全量 `npm test`、`npm run build`、定向 `git diff --check` 与额外复现脚本。

### 2026-05-29 CR Rules Extractor

- 方案: 使用 `bmenhance-cr-04-rules-extractor` 对 4 轮 CR 历史执行规则提炼，保持 skill 默认 analysis-only。
- 选择原因: 用户要求按 CR 收尾链路串行进入 rules extractor；当前 reviewer/evaluator 均已通过，适合判断是否有复用规则需要沉淀。
- 结果: 无新增落地项。三个候选模式均已被 `CONTEXT.md` / CommandResult / ValidationIssue 既有规则覆盖，不满足“不重复”升格门槛；也没有未完成的非阻塞改进需要交给 TODO Tracker。
- 验证: 已扫描 4 轮 summary/evaluation、`CONTEXT.md`、架构规则和既有 `cr-rules-summary.md` / `cr-todo-backlog.md`。

### 2026-05-29 CR TODO Tracker

- 方案: 使用 `bmenhance-cr-05-todo-tracker` 对 Story 3.5 CR 文件执行 deferred item 提取与 backlog 检查。
- 选择原因: 04 未交接未完成非阻塞项，但用户要求继续执行 05；需要确认 CR 记录中是否有可登记 TODO。
- 结果: 无新增 TODO。所有候选段落均写明“无”，或对应项属于已修复 P1 阻塞问题，不能降级进入 TODO backlog。
- 验证: 已读取 `cr-todo-backlog.md` 当前 2 条 open 项，并扫描 Story 3.5 Round 1-4 summary/evaluation 的 TODO/非阻塞章节。

### 2026-05-29 CR Finalizer

- 方案: 使用 `bmenhance-cr-06-finalizer` 在 CR approval 后同步 Story 与 sprint 状态。
- 选择原因: Round 4 reviewer/evaluator 均已通过，04/05 无剩余落地项，满足 finalizer 前置条件。
- 结果: 已完成。Story 3.5 `Status` 更新为 `done`，`sprint-status.yaml` 对应条目更新为 `done`；`bmm-workflow-status.yaml` 缺失，按容错规则跳过。
- 验证: 已确认最新 evaluation 为 Round 4 且结论通过；Epic 3 仍有 Story 3.6 为 `ready-for-dev`，不更新 `epic-3` 主状态。
