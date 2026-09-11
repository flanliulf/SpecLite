---
name: speclite-code-review-02-evaluator
description: "独立评估最新 CR v2 review 并输出结构化 verdict。用于用户要求 CR evaluate、review assessment、代码审查评估、finding validation 或 false-positive analysis。核心能力：review hash 一对一绑定、反证验证、finding disposition、收敛判定和 read-only 安全。"
allowed-tools: Read, Write, Grep, Glob
metadata:
  version: "2.1.0"
  author: "fancyliu"
  catalog: "speclite"
---

# Speclite Code Review 02 Evaluator（代码审查 Evaluator）

## Overview（概述）

对 current `speclite.cr-review.v2` 逐条独立评估，输出一对一绑定的 `speclite.cr-evaluation.v2`。本 Skill 支持 runner 和人工 standalone 调用，严格 read-only：只能写 evaluation artifact。

## Activation Boundary（激活边界）

- 用于验证 reviewer findings、反证、severity、disposition 和 convergence。
- 不用于修改 source/test、执行 fixer、登记 TODO、更新 Story/tracker 或替代 reviewer。

- Hard gate：只消费一次解析并冻结的 numeric Story identity、`reviewSeries` 与 `crDir`；禁止依据 Story title、name、slug、filename 或本地 candidate 重新推导目录。

## Core Capabilities（核心能力）

- **一对一绑定**：按 Story、series、round、scope 和 review hash 精确绑定。
- **独立验证**：逐条寻找第一手证据、反证和 severity 边界。
- **精确裁决**：区分 patch、verify-only、deferred、triage 与 stop-loss。
- **收敛统计**：按 fingerprint 计算 new、recurred、resolved 与 superseded。

## Contract（共享契约）

将当前 Skill 目录父目录解析为 `{skills-root}`，完整读取 `{skills-root}/speclite-code-review-contract/references/cr-contract.md`，再通过 `speclite resolve config --project-root {project-root}` 解析路径。失败时 HALT；不得依赖 runner 或旧 artifact。

## Inputs（输入）

- Story identity、`reviewSeries` 和 current v2 review，或足够独立定位它的信息。
- runner mode 必传冻结的 `directoryContext` 与四个 verified 目录字段；manual mode 使用 shared resolver 单次解析。任何实际写入前调用 production context validator。
- `orchestrationMode` 与 `handoffTarget`；缺失时按人工 standalone 调用处理。

## Workflow（工作流）

完整读取并执行 `references/evaluator-workflow.md`：

1. 定位 current series 最大 round 的有效 v2 review。
2. 绑定 review hash、scope 和同轮 evaluation identity。
3. 逐条执行第一手验证与主动反证。
4. 生成 exact verdict、convergence metrics 和 durable evaluation。

review degraded、schema/scope/quorum 无效时 HALT。同一 review hash 已有 current evaluation 时幂等返回；不得创建两个 current evaluation。

## Outputs and Handoff（输出与交接）

- 严格使用 `assets/output-template.md`，写入共享 contract 定义的 evaluation canonical path。
- 返回 artifact path/hash、exact verdict、accepted obligations、convergence 和唯一下一状态。
- 将结果交给 `handoffTarget`；人工模式直接返回给 manual orchestrator 或用户。

## Notes（注意事项）

- 绝对禁止执行修复或修改 review source、Story、tracker。
- `VERIFY_REQUIRED` 必须进入 verify-only 执行，不能直接降级 TODO/finalizer。
- legacy review 只能提供历史反证，不能授权 v2 finalizer。
- 同模型 reviewer/evaluator 必须记录 independence caveat，并主动寻找 disconfirmation。
- 始终使用中文输出并如实记录模型和 evidence。

## Generation Metadata（生成信息）

本 Skill 由 speclite-skill-creator 体系维护。如需修改，必须同步更新 `SKILL.md`、`SKILL.en.md`、`CHANGELOG.md`、`references/`、`assets/` 与实际安装副本。
