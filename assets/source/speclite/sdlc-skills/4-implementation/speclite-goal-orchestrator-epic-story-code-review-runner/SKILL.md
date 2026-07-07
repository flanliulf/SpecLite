---
name: speclite-goal-orchestrator-epic-story-code-review-runner
description: "用于用户要求按 Epic 下每个 Story 执行开发与 CR strict serial 闭环，或提到 fresh sub-agent、speclite-dev-story、speclite-code-review-01..06、PLAN.md、EXPERIMENTS.md、EXPERIMENT_NOTES.md、最终本地提交。"
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, Agent
metadata:
  version: "1.0.3"
  author: "fancyliu"
  catalog: "speclite"
---

# Speclite Goal Orchestrator Epic Story Code Review Runner（目标编排：Epic Story 开发与代码审查执行器）

## Overview（概述）

本 Skill 是 Epic 粒度 Story 开发与代码审查（CR）闭环的全局编排层。它只负责目标拆解、逐 Story 严格串行执行、进度记录、CR 循环 gate 判断、CR 收口和最终本地提交，不替代 `speclite-dev-story`、`speclite-code-review-*` 或 `git-commit-convention` 的内部能力。

核心原则：同一时间只推进一个 Story、一个步骤。每一步必须等前一步完成后才能开始，绝不并行。

Story 开发前门禁必须由本 runner 显式执行或验证。项目级 `flow-gate-enforcement` hook 只是 direct prompt execution 的 deterministic guardrail；外层 sub-agent 调度不允许假设一定会触发 `UserPromptSubmit` hook。

## When To Use（使用场景）

使用本 Skill，当用户提出类似以下请求：

- `针对 Epic 5 中的每个 Story，依次使用全新的 sub agent 执行...`
- 要求对 Epic 下每个 Story 执行 `speclite-dev-story`
- 要求执行 `speclite-code-review-01-reviewer {story_id}`
- 要求执行 `speclite-code-review-02-evaluator {story_id}`
- 要求执行 `speclite-code-review-03-fixer {story_id}`
- 要求重复 reviewer/evaluator/fixer，直到 review 和 evaluation 都通过
- 要求通过后执行 `speclite-code-review-04-rules-extractor`、`speclite-code-review-05-todo-tracker`、`speclite-code-review-06-finalizer`
- 要求维护 `PLAN.md`、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md`
- 要求最后使用 `git-commit-convention` 本地中文提交、不推送
- 明确要求 fresh sub-agent、strict serial、no parallel

不要使用本 Skill：

- 只需要单独开发一个 Story，且不需要 CR 闭环
- 只需要执行一次 CR reviewer
- 用户只是在询问状态，未要求执行
- 用户明确要求并行执行
- 任务是 Story 设计审查（SR），应使用 Epic Story Review runner

## Inputs（输入）

从用户请求中提取：

- `epic_id`：例如 `5`
- `story_scope`：Epic 下全部 Story，或用户指定的子集
- `model`：默认 `GPT-5.5`；若当前运行环境不支持，记录实际使用模型
- `runtime_config`：必须通过 `speclite resolve config --project-root {project-root}` 获取
- `planning_artifacts`：从 runtime config 读取，默认语义为 `{project-root}/_speclite-output/planning-artifacts`
- `implementation_artifacts`：从 runtime config 读取，默认语义为 `{project-root}/_speclite-output/implementation-artifacts`
- `cr_dir_pattern`：`{implementation_artifacts}/code-reviews/{story_id}-code-review/`
- `progress_record_dir_pattern`：`{implementation_artifacts}/code-reviews/{story_id}-code-review/goal-execute-records/`
- `plan_files`：
  - `PLAN.md`
  - `EXPERIMENTS.md`
  - `EXPERIMENT_NOTES.md`
- `commit_policy`：默认中文 Conventional Commit，本地提交，不推送

如果无法识别 `epic_id` 或无法定位 Story 列表，立即询问用户，不要猜测。

## Speclite Adaptation（Speclite 适配）

本 runner 必须使用 SpecLite 运行时与现有 canonical skill：

- Story 启动门禁：`speclite-flow-gate`
- Story 开发：`speclite-dev-story`
- CR reviewer：`speclite-code-review-01-reviewer`
- CR evaluator：`speclite-code-review-02-evaluator`
- CR fixer：`speclite-code-review-03-fixer`
- CR rules extractor：`speclite-code-review-04-rules-extractor`
- CR TODO tracker：`speclite-code-review-05-todo-tracker`
- CR finalizer：`speclite-code-review-06-finalizer`
- 最终提交：`git-commit-convention`

所有 Story、CR 和进度产物路径必须从 merged runtime config 推导，不得把历史默认输出根写成 runtime 依赖。常用路径约定：

- Epic 文件：`{planning_artifacts}/epics/`
- Story 文件：`{implementation_artifacts}/stories/`
- Sprint 状态：`{implementation_artifacts}/sprint-status.yaml`
- Flow Gate 输出：`{implementation_artifacts}/flow-gates/`
- Code Review 输出：`{implementation_artifacts}/code-reviews/`
- CR rules / TODO 输出：`{implementation_artifacts}/cr-rules/`
- 目标执行记录：`{implementation_artifacts}/code-reviews/{story_id}-code-review/goal-execute-records/`

固定源码路径、fixture、schema、command 或文件名只有在 owning SPEC 明确要求时才是 hard gate；否则按 equivalent implementation policy 判断，并在 `EXPERIMENT_NOTES.md` 记录依据。

`flow-gate-enforcement` hook 不替代本 runner 的显式门禁步骤。每个 Story 启动开发前，runner 必须确认 `{implementation_artifacts}/flow-gates/{story_id}-story-kickoff-gate.md` 的 frontmatter metadata 满足：

- `mode: "story-kickoff"`
- `target` 与 `storyKey` 均匹配当前 `story_id`
- `result` 为 `PASS` 或 `PASS_EQUIVALENT`
- `schemaVersion` 为 `speclite.flow-gate-report.v2`
- `handoffContractVersion` 为 `speclite.story-kickoff-handoff.v1`
- `foundationPrerequisiteStatus` 为 `PASS` 或 `NOT_APPLICABLE`
- `closureOwnerCheckStatus` 为 `PASS` 或 `NOT_APPLICABLE`
- `generatedAt` 存在且没有超过项目当前 hook freshness policy；若无法判断 freshness，采用保守策略重新运行 gate

## Workflow（工作流）

### Step 0：Preflight（前置审计）

在启动任何 sub-agent 之前，必须先审计当前状态：

1. 确认当前仓库路径和用户目标。
2. 确认 `epic_id`。
3. 运行或读取 `speclite resolve config --project-root {project-root}` 的结果，确认 `planning_artifacts` 与 `implementation_artifacts`。
4. 从 `sprint-status.yaml`、`{implementation_artifacts}/stories/` 和 `{planning_artifacts}/epics/` 交叉定位 Epic 下 Story 列表和每个 Story 当前状态。
5. 为当前 Story 定位或创建对应 `code review` 输出目录和 `goal-execute-records/` 执行记录目录。
6. 检查当前 Story 的执行记录目录中是否已存在：
   - `PLAN.md`
   - `EXPERIMENTS.md`
   - `EXPERIMENT_NOTES.md`
7. 检查当前 Story 的 Flow Gate 输出目录中是否已存在 `{story_id}-story-kickoff-gate.md`，并记录 metadata 是否允许进入开发。
8. 检查当前 Story 的 `code review` 输出目录中是否已存在：
   - 已有 CR review 文件
   - 已有 CR evaluation 文件
   - 已有 fixer 修复记录
   - 已有 finalizer 状态记录
9. 检查 git 状态，识别是否有无关改动。
10. 判断是新任务还是续跑任务。

如果是续跑任务，不要从头开始；必须基于 Story 状态、CR 产物、fix 记录和 git 状态判断下一步。

### Step 1：Initialize Logs（初始化记录）

对当前正在执行的 Story，在对应 `code review` 输出目录下的 `goal-execute-records/` 子目录中维护三个中文记录文件：

- `PLAN.md`：整体计划、当前 Story、执行 checklist、当前状态。
- `EXPERIMENTS.md`：每一轮尝试、选择原因、结果。
- `EXPERIMENT_NOTES.md`：实时思考、当前判断、待关注问题。

执行记录目录必须是 `{implementation_artifacts}/code-reviews/{story_id}-code-review/goal-execute-records/`，不得把这三个文件直接写在 `code review` 输出目录根目录。

如果文件不存在，创建。
如果文件已存在，追加或更新当前状态，不要覆盖历史记录。

### Step 2：Story Kickoff Flow Gate（Story 启动门禁）

在启动 `speclite-dev-story` sub-agent 之前，必须对当前 Story 显式执行或验证启动门禁：

```text
/speclite-flow-gate mode=story-kickoff target={story_id}
```

要求：

- 使用 `GPT-5.5`；若不可用，记录实际模型。
- 如果已有 `{implementation_artifacts}/flow-gates/{story_id}-story-kickoff-gate.md`，必须读取 YAML frontmatter metadata，不得只看 Markdown prose。
- 只有 v2 report、`handoffContractVersion=speclite.story-kickoff-handoff.v1`、`PASS` 或 `PASS_EQUIVALENT`，且 `foundationPrerequisiteStatus`、`closureOwnerCheckStatus` 均为 `PASS` 或 `NOT_APPLICABLE`，才允许进入 Story 开发；legacy v1、`FAIL_CONTRACT`、`FAIL_FUNCTION`、`FAIL_EVIDENCE`、`DECISION_NEEDED` 或 metadata 缺失/不匹配/过期时必须停止开发。
- 不得用 Markdown prose 或历史摘要替代 `foundationPrerequisiteStatus` / `closureOwnerCheckStatus`；closure owner 是否正确以 `speclite-flow-gate` 写入的 frontmatter metadata 为准。
- 如果门禁未通过，根据 gate report 的 recommended next action 记录下一步；除非用户明确授权，不得擅自修订当前 Story/Epic 之外的文件。
- 将 gate report 路径、result、foundation prerequisite status、closure owner status、是否 `PASS_EQUIVALENT`、继续/停止决策写入 `PLAN.md`、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md`。
- 不得依赖 `flow-gate-enforcement` hook 作为本步骤的唯一保障；hook 没有触发或未启用时，本步骤仍必须执行。

### Step 3：Story Development（Story 开发）

启动一个全新的 sub-agent，执行：

```text
/speclite-dev-story story {story_id}
```

要求：

- 使用 `GPT-5.5`；若不可用，记录实际模型。
- 等待开发 sub-agent 完成。
- 记录修改文件、验证命令、验证结果、Story 状态和遗留风险。
- 不允许在开发未完成时启动 CR reviewer。

如果 Story 已经处于可审查状态，且已有证据证明开发步骤已完成，可记录依据后跳过开发步骤，进入 CR reviewer。

### Step 4：CR Reviewer（代码审查）

开发完成后，启动一个全新的 sub-agent，执行：

```text
/speclite-code-review-01-reviewer {story_id}
```

要求：

- 使用 `GPT-5.5`；若不可用，记录实际模型。
- 等待 reviewer 完成。
- 记录审查结果文件、结论、发现数量、是否通过。
- 不允许在 reviewer 未完成时启动 evaluator。

`speclite-code-review-01-reviewer` 内部即使会启动多个 sub-agent，也视为 reviewer skill 的内部机制；外层 orchestrator 不得同时启动 evaluator 或 fixer。

### Step 5：CR Evaluator（审查评估）

Reviewer 完成后，启动一个全新的 sub-agent，执行：

```text
/speclite-code-review-02-evaluator {story_id}
```

要求：

- 使用 `GPT-5.5`；若不可用，记录实际模型。
- 等待 evaluator 完成。
- 记录评估文件、评估结论、哪些发现有效、是否通过。
- 不允许在 evaluator 未完成时启动 fixer。

### Step 6：CR Gate（CR 门禁判断）

根据 reviewer 和 evaluator 的最新输出判断：

- 如果 reviewer 结论通过，且 evaluator 评估结果也通过：进入 CR 收口步骤。
- 如果 evaluator 判定存在需要修复的问题：进入 fixer。
- 如果 evaluator 判定 reviewer 发现无效且无需修复：记录原因，重新进入 reviewer 或结束，依据最新评估结论判断。
- 如果结果不明确：优先采用工程上保守且可追溯的推荐决策，并记录原因。

不得为了“完成流程”伪造通过结论。

### Step 7：CR Fixer（修复）

如果需要修复，启动一个全新的 sub-agent，执行：

```text
/speclite-code-review-03-fixer {story_id}
```

要求：

- 使用 `GPT-5.5`；若不可用，记录实际模型。
- 只允许 fixer 根据 evaluator 结论执行定点修复。
- 等待 fixer 完成。
- 记录修复文件、修复摘要、验证结果和遗留风险。

Fixer 完成后，回到 Step 4，开启下一轮 reviewer/evaluator。

### Step 8：CR Closeout（CR 收口）

当 reviewer 和 evaluator 均通过后，启动一个全新的 sub-agent，严格按顺序执行：

```text
/speclite-code-review-04-rules-extractor {story_id}
/speclite-code-review-05-todo-tracker {story_id}
/speclite-code-review-06-finalizer {story_id}
```

要求：

- 使用 `GPT-5.5`；若不可用，记录实际模型。
- 三个 skill 必须顺序执行，绝不并行。
- `speclite-code-review-04-rules-extractor` 和 `speclite-code-review-05-todo-tracker` 若产出默认推荐决策，应在已授权范围内采用默认推荐并记录决策。
- 如果推荐动作会修改全局文档、TODO、状态文件或当前 Story/Epic 之外的文件，必须先确认该修改是否属于用户授权范围；不确定时停止询问。
- `speclite-code-review-06-finalizer` 必须确认 Story 可标记 Done，并同步相关状态文件。
- 每个 skill 完成后更新 `PLAN.md`、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md`。

### Step 9：Next Story Gate（进入下一个 Story）

当前 Story 满足完成标准后，才能进入 Epic 下一个 Story：

- `story-kickoff` Flow Gate 为 v2 report，`handoffContractVersion`、result、`foundationPrerequisiteStatus` 与 `closureOwnerCheckStatus` 允许继续，且 gate report metadata 匹配当前 Story。
- 开发完成。
- 最新 CR reviewer 通过。
- 最新 CR evaluator 通过。
- 如有 fixer，修复后已重新 review/evaluate。
- CR rules/todo/finalizer 已按顺序执行。
- 三个进度文件已更新。
- 当前 Story 状态已完成或有明确完成证据。

不得在当前 Story 未完成时启动下一个 Story。

### Step 10：Final Commit（最终提交）

Epic 范围内所有目标 Story 完成后，执行：

```text
/git-commit-convention
```

要求：

- 使用 `GPT-5.5`；若不可用，记录实际模型。
- 默认中文 Conventional Commit。
- 默认只本地提交，不推送。
- 提交前审计 git 状态。
- 只纳入本次 Epic Story 开发与 CR 闭环相关变更。
- 如果工作树存在无关改动，先隔离或询问，不要误提交。

## Decision Policy（决策策略）

执行中遇到需要决策的事项时：

- 优先采用当前上下文中最保守、最可追溯、最符合既有文档体系的方案。
- 必须在 `EXPERIMENT_NOTES.md` 中记录决策、原因和影响。
- 不要因为普通工程取舍挂起等待用户。
- 如果决策会改变需求边界、修改未授权文件、删除内容、推送远端或引入破坏性操作，必须停止并询问。

## Serial Execution Rules（串行规则）

硬性规则：

- 不允许并行。
- 不允许同时推进多个 Story。
- 不允许同时启动多个外层 sub-agent。
- 每一步必须等待前一步完成。
- 内部 skill 的并行机制只属于该 skill 内部；外层 orchestrator 仍然严格串行。
- 每一步完成后必须更新记录文件，再进入下一步。
- 每一轮循环必须能从记录文件中看出 development、reviewer、evaluator、fixer、closeout 的状态。
- 每个 Story 的 `story-kickoff` gate 必须在 development 前完成并写入记录文件。

## Logging Rules（记录规则）

所有记录文件内容必须使用中文。

`PLAN.md` 至少包含：

- 目标
- 当前 Epic
- Story 列表和执行顺序
- 当前 Story
- 当前轮次
- 每一步状态
- 终止条件

`EXPERIMENTS.md` 每次尝试记录：

- 时间
- Story ID
- 轮次
- 执行了哪个 skill
- 为什么执行
- 结果
- 下一步判断

`EXPERIMENT_NOTES.md` 记录：

- 实时判断
- 决策原因
- 风险
- 待关注问题
- 用户介入点

## Completion Criteria（完成标准）

只有同时满足以下条件，才能视为 Epic CR 闭环完成：

- Epic 范围内每个目标 Story 均有当前 Story 匹配的 v2 `story-kickoff` Flow Gate report，且 handoff contract version、result、foundation prerequisite status 与 closure owner status 均允许继续。
- Epic 范围内每个目标 Story 均已完成开发。
- 每个 Story 最新 `speclite-code-review-01-reviewer` 结论通过。
- 每个 Story 最新 `speclite-code-review-02-evaluator` 评估结果通过。
- 如果曾有 fixer 修复，修复后已重新 review/evaluate。
- 每个 Story 均已执行 CR rules extractor、TODO tracker、finalizer。
- 每个 Story 的三个进度文件已更新。
- git 状态已审计。
- 已使用 `git-commit-convention` 完成本地中文提交。
- 未执行 push，除非用户明确要求。

## Common Mistakes（常见错误）

- 同时推进多个 Story。
- 依赖 `flow-gate-enforcement` hook 隐式触发，却没有在 runner 内显式执行或验证 `story-kickoff` Flow Gate。
- 在 `story-kickoff` gate 缺失、失败、过期或 target mismatch 时启动 `speclite-dev-story`。
- 在开发未完成时启动 CR reviewer。
- 在 reviewer 未完成时启动 evaluator。
- 在 evaluator 未完成时启动 fixer。
- 把 reviewer 内部并行 sub-agent 误认为外层也可以并行。
- 只看 reviewer 通过，不看 evaluator 是否通过。
- fixer 后不重新 review/evaluate。
- CR 通过后漏掉 rules extractor、TODO tracker 或 finalizer。
- 覆盖 `PLAN.md`、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md` 历史内容。
- 把无关工作树改动纳入最终 commit。
- 因为有推荐方案就修改需求边界。

## Invocation Template（调用模板）

当用户只给出 Epic ID 时，可按以下模板执行：

```text
Epic {epic_id} Story dev/CR goal:
1. Preflight runtime config, current progress, Epic file, Story list and git status.
2. For each Story, maintain PLAN.md, EXPERIMENTS.md, EXPERIMENT_NOTES.md under {implementation_artifacts}/code-reviews/{story_id}-code-review/goal-execute-records/.
3. Strictly serial per Story:
   - speclite-flow-gate mode=story-kickoff target={story_id}; continue only on PASS/PASS_EQUIVALENT
   - speclite-dev-story story {story_id}
   - speclite-code-review-01-reviewer {story_id}
   - speclite-code-review-02-evaluator {story_id}
   - speclite-code-review-03-fixer {story_id} only when evaluation requires fixes
4. Repeat CR reviewer/evaluator/fixer until reviewer and evaluator both pass.
5. Run speclite-code-review-04-rules-extractor, speclite-code-review-05-todo-tracker, speclite-code-review-06-finalizer in order.
6. Move to the next Story only after the current Story is fully complete.
7. After all target Stories complete, run git-commit-convention in Chinese, local commit only, no push.
```
