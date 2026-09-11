---
name: speclite-code-review-03-fixer
description: "根据 current CR v2 evaluation 执行有界修复或 verify-only 义务。用于用户要求 CR fix、apply review fixes、代码审查修复、verify obligation 或 test-only closure。核心能力：evaluation hash/scope 绑定、patch 与 verify-only 分流、反 churn 和 fresh review 交接。"
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
metadata:
  version: "2.1.0"
  author: "fancyliu"
  catalog: "speclite"
---

# Speclite Code Review 03 Fixer（代码审查 Fixer）

## Overview（概述）

CR01–06 中唯一允许修改源码或测试的环节。它可由 runner 或人工 fresh session 调用，只消费 current `speclite.cr-evaluation.v2` 明确授权的 `patch` 或 `verify-only` obligations。

## Activation Boundary（激活边界）

- 用于执行 evaluator 已接受且已限定范围的修复或验证义务。
- 不用于自行评估 finding、吸收 deferred/TODO 项、改变需求边界、更新 Story/tracker 或授权 finalizer。

- Hard gate：只消费一次解析并冻结的 numeric Story identity、`reviewSeries` 与 `crDir`；禁止依据 Story title、name、slug、filename 或本地 candidate 重新推导目录。

## Core Capabilities（核心能力）

- **授权范围**：只消费 current evaluation 明确批准的 obligations。
- **模式分离**：严格分离 production patch 与 verify-only 证据补强。
- **反复修改防护**：识别重复修复、位置迁移与 architecture category。
- **新鲜度交接**：记录 fixRecord，并强制回到 fresh review/evaluation。

## Contract（共享契约）

将当前 Skill 目录父目录解析为 `{skills-root}`，完整读取 `{skills-root}/speclite-code-review-contract/references/cr-contract.md`，再通过 `speclite resolve config --project-root {project-root}` 获取路径。失败时 HALT；不得依赖 runner 或旧 artifact。

## Inputs（输入）

- Story identity、`reviewSeries`、current evaluation 和 `mode=patch | verify-only`。
- runner mode 必传冻结的 `directoryContext` 与四个 verified 目录字段；manual mode 使用 shared resolver 单次解析。任何实际写入前调用 production context validator。
- `confirmationPolicy`、`authorizationSource`、`orchestrationMode` 与 `handoffTarget`；缺失 confirmation policy 时固定为 `explicit`。

## Workflow（工作流）

完整读取并执行 `references/fixer-workflow.md`：

1. 绑定 current evaluation/hash/scope/round 与 exact mode。
2. 生成 included/excluded 修复计划并验证授权来源。
3. 执行 churn guard、最小修改和 focused verification。
4. 更新单一 leading frontmatter `fixRecord`，重读后交接 fresh CR01/CR02。

hash/scope/round 不匹配、授权不完整、已有 completed fixRecord 或 verification 失败时 HALT。Fixer 完成绝不直接授权 finalizer。

## Outputs and Handoff（输出与交接）

- durable output 是 evaluation artifact 中的结构化 `fixRecord` 及正文 Fix Record。
- 正常完成时返回 changed files、fingerprints、commands/results、caveats 和下一步 fresh reviewer/evaluator。
- churn/architecture 命中时返回结构化 route recommendation 给 `handoffTarget`；人工模式直接交给 manual orchestrator 或用户，不要求 runner 生成裁决。

## Notes（注意事项）

- 禁止修改 Story、tracker、需求边界和未授权文件。
- `verify-only` 不得修改 production semantics，也不能降级成 TODO。
- 无法完成时写 `fixRecord.status: blocked`，不得声称 completed。
- 始终使用中文记录，模型、命令和验证结果必须真实。

## Generation Metadata（生成信息）

本 Skill 由 speclite-skill-creator 体系维护。如需修改，必须同步更新 `SKILL.md`、`SKILL.en.md`、`CHANGELOG.md`、`references/` 与实际安装副本。
