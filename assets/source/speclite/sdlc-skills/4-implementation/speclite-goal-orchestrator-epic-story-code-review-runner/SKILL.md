---
name: speclite-goal-orchestrator-epic-story-code-review-runner
description: "按 Epic 对 Story 执行 strict serial 开发与 CR 闭环。用于用户要求 Epic Story runner、fresh sub-agent、code review loop、review/evaluate/fix/finalize 或 local commit。核心能力：显式 Flow Gate、结构化 CR v2 状态机、有界收敛、证据时效校验和安全收口。"
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, Agent
metadata:
  version: "2.1.0"
  author: "fancyliu"
  catalog: "speclite"
---

# Speclite Goal Orchestrator Epic Story Code Review Runner（Epic Story 开发与代码审查执行器）

## Overview（概述）

本 Skill 是 Epic 粒度 Story 开发与 CR 闭环的全局编排层。它只负责目标拆解、strict serial 调度、Flow Gate、CR v2 状态机、收敛控制、状态同步和最终本地提交，不替代被编排 Skill 的内部能力。

同一时间只能推进一个 Story、一个外层 sub-agent、一个状态迁移。所有 current decision 必须来自结构化 frontmatter，不得解析“通过”“不通过”“Approved”等 prose 关键词。

## Activation Boundary（激活边界）

仅在用户要求以 Epic 或明确 Story 集合为范围，执行 development → review → evaluate → fix/verify → closeout 的 strict-serial 闭环，并要求 fresh outer sub-agent、goal records 或最终本地提交时使用本 Skill。

以下情况不要使用本 Skill：

- 只开发单个 Story 且不要求完整 CR 闭环；
- 只运行一次 reviewer、evaluator、fixer 或 finalizer；
- 用户只询问状态，未授权开发、状态推进或提交；
- 用户明确要求并行推进多个 Story；
- 任务属于 Story Review，应使用对应 SR runner。

- Hard gate：只解析一次并冻结 `directoryContext`（Story/series/四目录字段）；CR01–06 任何实际写入前调用 production validator，禁止依据 title、slug、filename 或 tracker 重推导目录。

## Core Capabilities（核心能力）

- **严格串行编排**：每次只推进一个 Story 和一个外层状态迁移。
- **结构化 CR v2 路由**：按 exact schema、verdict、scope hash 和 round binding 路由。
- **有界收敛**：按 finding fingerprint、quorum、churn 与 stop-loss 机械收敛。
- **可恢复执行**：根据 current structured artifact 和 goal records 决定唯一下一状态，不重复已完成步骤。
- **安全收口**：校验 evidence freshness、TODO 映射、tracker 原子同步与本地提交边界。

## Contract（共享契约）

执行前必须完整读取 `{skills-root}/speclite-code-review-contract/references/cr-contract.md`。独立的 `speclite-code-review-contract` package 是 CR01–06 与 runner 的唯一规范性共享契约 owner，定义 identity、路径、scope manifest、artifact schema、verdict、finding fingerprint、layer quorum、round binding、state machine、freshness 和 TODO/rules governance。

共享契约不可读或关键字段无法解析时 HALT。

## Inputs（输入）

- `epicId`：目标 Epic，例如 `8`。
- `storyScope`：Epic 全部 Story 或用户明确指定的子集。
- `projectRoot`：目标项目根目录。
- `modelPolicy`：默认使用当前环境配置；如用户指定模型则遵从，并如实记录实际模型。
- `commitPolicy`：默认中文 Conventional Commit、本地提交、不 push。
- `confirmationPolicy`：`explicit | preauthorized`；默认 `explicit`，只能由用户请求或已确认授权范围切换。

无法识别 Epic、Story 列表、project root 或授权范围时 HALT 并询问，不得猜测。

## Runtime Activation（运行时激活）

1. 运行 `speclite resolve config --project-root {projectRoot}`。
2. 读取 merged `planning_artifacts`、`implementation_artifacts` 和 workflow tracker 配置。
3. 将当前 Skill 目录父目录解析为 `{skills-root}`。
4. 读取 `{skills-root}/speclite-code-review-contract/references/cr-contract.md`。
5. 对每个 Story 仅调用一次 shared `scripts/resolve-cr-directory.mjs`，冻结 verified `crDir` 并显式传给 CR01–06；任何 ambiguity 必须在 goal/artifact/progress write 前 HALT。
6. 解析失败、关键路径为空或 Story identity 冲突时 HALT；`config.toml.example` 和历史默认目录不能作为 fallback。

## Workflow（工作流）

必须完整读取 `references/runner-workflow.md`，并按其中 Step 0–12 执行。入口只保留以下不可跳过的路由规则：

1. preflight 建立唯一 Story identity，识别 legacy artifact，并维护 goal records。
2. 通过 current Story kickoff gate 后，才允许 fresh development sub-agent。
3. 每个状态迁移完成后先更新三个 goal records，再进入下一状态。
4. 每轮 review 前冻结 scope manifest；`scopeExceptions` 非空即 HALT。
5. fresh reviewer 与 read-only evaluator strict serial；只接受 CR v2 artifact 和 exact verdict。
6. evaluator 后必须先执行 convergence，再按 verdict 路由；不得在 stop-loss 检查前启动 fixer。
7. `FIX_REQUIRED` 进入 `patch`，`VERIFY_REQUIRED` 进入 `verify-only`；之后必须 fresh review/evaluate。
8. `PASS_WITH_DEFERRED_TODOS` 必须先完成 TODO 映射；triage、stop-loss、decision-needed 均 HALT。
9. closeout 固定为 rules extractor → TODO tracker → finalizer；只有结构化 `DONE` 才可推进下一 Story。
10. 全部 Story 完成后先审计 Git scope，再按授权本地提交；默认不 push。

## Decision Policy（决策策略）

- 普通工程取舍采用最保守、可追溯且不扩大需求的方案，并记录。
- 改变需求、未授权文件、删除、远端 push、architecture triage 或 stop-loss 必须询问用户。
- 不得为了流程完成伪造 PASS，也不得为了 0 finding 无界修复。
- reviewer 与 evaluator 应使用不同模型；环境不支持时 evaluator 必须主动寻找反证并记录 independence caveat。

## Completion Criteria（完成标准）

Epic runner 完成要求每个目标 Story 同时满足：

- kickoff gate 当前有效；
- development 完成；
- current review/evaluation 均为 v2 且 scope/series/round 精确绑定；
- evaluation 为 `PASS`，或 `PASS_WITH_DEFERRED_TODOS` 且 TODO 映射完成；
- 最后一次 source mutation 后已经 fresh review/evaluate；
- completion gate 不早于最后 source mutation；
- rules/TODO/finalizer 按顺序完成；
- Story、sprint、required workflow tracker 写后重读一致；
- `PLAN.md`、`EXPERIMENTS.md`、`EXPERIMENT_NOTES.md` 已记录最终状态且不早于最后状态迁移；
- 最终 git scope 已审计；除非用户明确选择 no-commit，否则已使用 `git-commit-convention` 完成中文本地提交；
- 未 push，除非用户明确要求。

## Notes（注意事项）

- 不允许并行推进多个 Story 或多个外层步骤。
- 内层 reviewer 可以按自身 quorum 并行三层审查；外层仍 strict serial。
- 固定源码路径、fixture、schema 或 command 只有 owning SPEC 明确要求时才是 hard gate；否则按 shared contract 的 equivalent implementation policy 接受有测试、fixture、snapshot 或 command evidence 的等价实现。
- legacy v1 artifact 只可作为历史证据，不得驱动 v2 finalizer。
- 所有执行记录使用中文；技术标识保留英文。

## Generation Metadata（生成信息）

本 Skill 按 speclite-skill-creator 的 progressive disclosure 规则维护。修改时必须同步 `SKILL.md`、`SKILL.en.md`、`references/runner-workflow.md`、`CHANGELOG.md` 与实际安装副本。
