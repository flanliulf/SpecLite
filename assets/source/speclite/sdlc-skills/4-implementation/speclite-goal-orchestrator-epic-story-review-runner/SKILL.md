---
name: speclite-goal-orchestrator-epic-story-review-runner
description: "用于用户要求按 Epic 执行 Story Review/SR strict serial 闭环，或提到 fresh sub-agent、speclite-story-review-01/02/03、PLAN.md、EXPERIMENTS.md、EXPERIMENT_NOTES.md、最终本地提交。"
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, Agent
metadata:
  version: "1.0.1"
  author: "fancyliu"
  catalog: "speclite"
---

# Speclite Goal Orchestrator Epic Story Review Runner（目标编排：Epic Story 审查执行器）

## Overview（概述）

本 Skill 是 Epic 粒度 Story Review（SR）闭环的全局编排层。它只负责目标拆解、严格串行执行、进度记录、循环 gate 判断和最终本地提交，不替代 `speclite-story-review-*` 或 `git-commit-convention` 的内部能力。

核心原则：每一步必须等前一步完成后才能开始，绝不并行。若用户给出多个 Epic 或 Epic 范围，外层也必须按 Epic 严格串行推进。

## When To Use（使用场景）

使用本 Skill，当用户提出类似以下请求：

- `Epic 10，请对该 epic，依次使用全新的 sub agent 执行...`
- 要求执行 `speclite-story-review-01-reviewer epic {epic_id}`
- 要求执行 `speclite-story-review-02-evaluator epic {epic_id}`
- 要求执行 `speclite-story-review-03-fixer epic {epic_id}`
- 要求重复 reviewer/evaluator/fixer，直到 review 和 evaluation 都通过
- 要求维护 `PLAN.md`、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md`
- 要求最后使用 `git-commit-convention` 本地中文提交、不推送
- 明确要求 fresh sub-agent、strict serial、no parallel

不要使用本 Skill：

- 只审查单个 Story，且不需要完整 SR 循环
- 只需要运行 `speclite-story-review-01-reviewer`
- 只需要提交代码
- 用户只是在询问状态，未要求执行
- 用户明确要求并行执行

## Inputs（输入）

从用户请求中提取：

- `epic_scope`：单个 Epic，例如 `10`；或用户明确给出的 Epic 范围/子集
- `model`：默认 `GPT-5.5`；若当前运行环境不支持，记录实际使用模型
- `runtime_config`：必须通过 `speclite resolve config --project-root {project-root}` 获取
- `planning_artifacts`：从 runtime config 读取，默认语义为 `{project-root}/_speclite-output/planning-artifacts`
- `implementation_artifacts`：从 runtime config 读取，默认语义为 `{project-root}/_speclite-output/implementation-artifacts`
- `sr_dir`：`{implementation_artifacts}/story-reviews/epic-{epic_id}-story-review/`
- `progress_record_dir`：`{sr_dir}/goal-execute-records/`
- `plan_files`：
  - `PLAN.md`
  - `EXPERIMENTS.md`
  - `EXPERIMENT_NOTES.md`
- `commit_policy`：默认中文 Conventional Commit，本地提交，不推送

如果无法识别 `epic_scope`、无法解析 runtime config，或无法定位 Epic/Story 输入，立即询问用户，不要猜测。

## Speclite Adaptation（Speclite 适配）

本 runner 必须使用 SpecLite 运行时与现有 canonical skill：

- SR reviewer：`speclite-story-review-01-reviewer`
- SR evaluator：`speclite-story-review-02-evaluator`
- SR fixer：`speclite-story-review-03-fixer`
- 最终提交：`git-commit-convention`

所有 Story、SR 和进度产物路径必须从 merged runtime config 推导，不得把历史默认输出根写成 runtime 依赖。常用路径约定：

- Epic 文件：`{planning_artifacts}/epics/`
- Story 文件：`{implementation_artifacts}/stories/`
- Sprint 状态：`{implementation_artifacts}/sprint-status.yaml`
- Story Review 输出：`{implementation_artifacts}/story-reviews/`
- 目标执行记录：`{implementation_artifacts}/story-reviews/epic-{epic_id}-story-review/goal-execute-records/`

固定源码路径、fixture、schema、command 或文件名只有在 owning SPEC 明确要求时才是 hard gate；否则按 equivalent implementation policy 判断，并在 `EXPERIMENT_NOTES.md` 记录依据。

## Workflow（工作流）

### Step 0：Preflight（前置审计）

在启动任何 sub-agent 之前，必须先审计当前状态：

1. 确认当前仓库路径和用户目标。
2. 确认 `epic_scope`；若是 Epic 范围，展开为明确、稳定的执行顺序。
3. 运行或读取 `speclite resolve config --project-root {project-root}` 的结果，确认 `planning_artifacts` 与 `implementation_artifacts`。
4. 定位或创建当前 Epic 的 `sr_dir` 和 `progress_record_dir`。
5. 从 `sprint-status.yaml`、`{implementation_artifacts}/stories/` 和 `{planning_artifacts}/epics/` 交叉确认当前 Epic 的 Story 列表和状态。
6. 检查 `progress_record_dir` 中是否已存在：
   - `PLAN.md`
   - `EXPERIMENTS.md`
   - `EXPERIMENT_NOTES.md`
7. 检查 `sr_dir` 中是否已存在：
   - 已有 SR review 文件
   - 已有 SR evaluation 文件
   - 已有 fixer 修订记录
8. 检查 git 状态，识别是否有无关改动。
9. 判断是新任务还是续跑任务。

如果是续跑任务，不要从头开始；必须基于已有 review/evaluation/fix 产物、Story 状态和 git 状态判断下一步。

### Step 1：Initialize Logs（初始化记录）

在当前 Epic 的 `progress_record_dir` 下维护三个中文记录文件：

- `PLAN.md`：整体计划、当前状态、执行 checklist。
- `EXPERIMENTS.md`：每一轮尝试、选择原因、结果。
- `EXPERIMENT_NOTES.md`：实时思考、当前判断、待关注问题。

`progress_record_dir` 必须是 `sr_dir/goal-execute-records/`，不得把这三个文件直接写在 `sr_dir` 根目录。

如果文件不存在，创建。
如果文件已存在，追加或更新当前状态，不要覆盖历史记录。

### Step 2：Reviewer（审查）

启动一个全新的 sub-agent，执行：

```text
/speclite-story-review-01-reviewer epic {epic_id}
```

要求：

- 使用 `GPT-5.5`；若不可用，记录实际模型。
- 等待 reviewer 完成。
- 记录输出文件、结论、发现数量、是否通过。
- 不允许在 reviewer 未完成时启动 evaluator。

### Step 3：Evaluator（评估）

Reviewer 完成后，启动一个全新的 sub-agent，执行：

```text
/speclite-story-review-02-evaluator epic {epic_id}
```

要求：

- 使用 `GPT-5.5`；若不可用，记录实际模型。
- 等待 evaluator 完成。
- 记录评估文件、评估结论、哪些发现有效、是否通过。
- 不允许在 evaluator 未完成时启动 fixer。

### Step 4：Gate（门禁判断）

根据 reviewer 和 evaluator 的最新输出判断：

- 如果 reviewer 结论通过，且 evaluator 评估结果也通过：退出循环。
- 如果 evaluator 判定存在需要修订的问题：进入 fixer。
- 如果 evaluator 判定 reviewer 发现无效且无需修订：记录原因，重新进入 reviewer 或结束，依据最新评估结论判断。
- 如果结果不明确：优先采用工程上保守且可追溯的推荐决策，并记录原因。

不得为了“完成流程”伪造通过结论。

### Step 5：Fixer（修订）

如果需要修订，启动一个全新的 sub-agent，执行：

```text
/speclite-story-review-03-fixer epic {epic_id}
```

要求：

- 使用 `GPT-5.5`；若不可用，记录实际模型。
- 只允许 fixer 根据 evaluator 结论修订 Story 文档及其职责范围内的相关 planning artifacts。
- 等待 fixer 完成。
- 记录修订文件、修订摘要、验证结果和遗留风险。

Fixer 完成后，回到 Step 2，开启下一轮 reviewer/evaluator。

### Step 6：Next Epic Gate（进入下一个 Epic）

如果 `epic_scope` 包含多个 Epic，只有当前 Epic 满足以下条件后，才能进入下一个 Epic：

- 最新 SR reviewer 通过。
- 最新 SR evaluator 通过。
- 如有 fixer，修订后已重新 review/evaluate。
- 三个进度文件已更新。
- 当前 Epic 的 Story 列表、SR 产物和 git 状态已复核。

不得在当前 Epic 未完成时启动下一个 Epic。

### Step 7：Final Commit（最终提交）

当目标范围内所有 Epic 的 reviewer 和 evaluator 均通过后，执行：

```text
/git-commit-convention
```

要求：

- 使用 `GPT-5.5`；若不可用，记录实际模型。
- 默认中文 Conventional Commit。
- 默认只本地提交，不推送。
- 提交前审计 git 状态。
- 只纳入本次 Epic SR 闭环相关变更。
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
- 不允许同时推进多个 Epic。
- 不允许同时启动多个外层 sub-agent。
- 每一步必须等待前一步完成。
- `speclite-story-review-01-reviewer` 内部即使会启动多个 sub-agent，也视为 reviewer skill 的内部机制；外层 orchestrator 不得同时启动 evaluator 或 fixer。
- 每一步完成后必须更新记录文件，再进入下一步。
- 每一轮循环必须能从记录文件中看出 reviewer、evaluator、fixer 的状态。

## Logging Rules（记录规则）

所有记录文件内容必须使用中文。

`PLAN.md` 至少包含：

- 目标
- 当前 Epic 或 Epic 范围
- 执行步骤
- 当前轮次
- 每一步状态
- 终止条件

`EXPERIMENTS.md` 每次尝试记录：

- 时间
- Epic ID
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

只有同时满足以下条件，才能视为完成：

- 目标范围内每个 Epic 的最新 `speclite-story-review-01-reviewer` 结论通过。
- 目标范围内每个 Epic 的最新 `speclite-story-review-02-evaluator` 评估结果通过。
- 如果曾有 fixer 修订，修订后已重新 review/evaluate。
- 三个进度文件已更新。
- git 状态已审计。
- 已使用 `git-commit-convention` 完成本地中文提交。
- 未执行 push，除非用户明确要求。

## Common Mistakes（常见错误）

- 在 reviewer 未完成时启动 evaluator。
- 在 evaluator 未完成时启动 fixer。
- 把 reviewer 内部并行 sub-agent 误认为外层也可以并行。
- 同时推进多个 Epic。
- 只看 reviewer 通过，不看 evaluator 是否通过。
- fixer 后不重新 review/evaluate。
- 覆盖 `PLAN.md`、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md` 历史内容。
- 把无关工作树改动纳入最终 commit。
- 因为有推荐方案就修改需求边界。

## Invocation Template（调用模板）

当用户只给出 Epic ID 时，可按以下模板执行：

```text
Epic {epic_id} SR goal:
1. Preflight runtime config, current progress, Epic file, Story files and git status.
2. Maintain PLAN.md, EXPERIMENTS.md, EXPERIMENT_NOTES.md under {implementation_artifacts}/story-reviews/epic-{epic_id}-story-review/goal-execute-records/.
3. Strictly serial:
   - speclite-story-review-01-reviewer epic {epic_id}
   - speclite-story-review-02-evaluator epic {epic_id}
   - speclite-story-review-03-fixer epic {epic_id} only when evaluation requires fixes
4. Repeat until reviewer and evaluator both pass.
5. Run git-commit-convention in Chinese, local commit only, no push.
```
