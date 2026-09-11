---
name: speclite-code-review-01-reviewer
description: "执行 Story code review，用 Blind Hunter、Edge Case Hunter、Acceptance Auditor 三层审查并生成 CR v2 结果。用于用户要求 CR、code review、代码审查、复审或 Story implementation review。核心能力：精确 scope、稳定 finding fingerprint、layer quorum 和结构化 verdict。"
allowed-tools: Read, Write, Bash, Grep, Glob, Agent
metadata:
  version: "2.1.0"
  author: "fancyliu"
  catalog: "speclite"
---

# Speclite Code Review 01 Reviewer（代码审查 Reviewer）

## Overview（概述）

针对一个指定 Story 执行只读三层代码审查，输出 `speclite.cr-review.v2`。本 Skill 可由 runner 编排，也可在 fresh session 中独立调用；不修改源码、测试、Story 或 tracker。

## Activation Boundary（激活边界）

- 用于冻结一个 Story 的 current review scope、执行三层审查并生成 reviewer artifact。
- 不用于评估 finding、执行修复、登记 TODO、同步 Story 状态或编排整个 Epic；这些任务分别交给 CR02–06 或 runner。

- Hard gate：只消费一次解析并冻结的 numeric Story identity、`reviewSeries` 与 `crDir`；禁止依据 Story title、name、slug、filename 或本地 candidate 重新推导目录。

## Core Capabilities（核心能力）

- **精确范围**：冻结并核对 declared、actual、excluded files 与 `scopeHash`。
- **三层 quorum**：组合 Blind Hunter、Edge Case Hunter 与 Acceptance Auditor。
- **稳定 finding**：用具体失败场景和 fingerprint 过滤噪声、重复与历史漂移。
- **结构化交接**：输出可被 evaluator 精确绑定的 `speclite.cr-review.v2`。

## Contract（共享契约）

将当前 Skill 目录父目录解析为 `{skills-root}`，完整读取 `{skills-root}/speclite-code-review-contract/references/cr-contract.md`，再运行 `speclite resolve config --project-root {project-root}`。任一解析失败即 HALT；不得使用 runner、旧 artifact 或历史默认路径作为 fallback。

## Inputs（输入）

- Story path、`storyId` 或 `storyKey`，以及 `reviewSeries`。
- runner mode 必传冻结的 `directoryContext` 与四个 verified 目录字段；manual mode 使用 shared resolver 单次解析。任何实际写入前调用 production context validator。
- review scope manifest，或足够独立生成它的 development record/用户指定 commit range。
- `orchestrationMode` 与 `handoffTarget`；缺失时按人工 standalone 调用处理。

## Workflow（工作流）

完整读取并执行 `references/reviewer-workflow.md`；三层内部算法继续以 `references/review-engine.md` 为准。入口只保留以下硬门禁：

1. 解析 identity、current series round 和 runtime paths。
2. 冻结包含 staged、unstaged、untracked 的完整 scope。
3. 执行三个 fresh review layer 并规范 finding。
4. 写入模板、重读验证并交接 CR02。

`scopeExceptions` 非空时只能输出 `REVIEW_DEGRADED`；仅 0/3 或 1/3 layer 成功时 HALT，不得生成 current review。完整 PASS 建议必须满足 3/3 quorum。

## Outputs and Handoff（输出与交接）

- 严格使用 `assets/output-template.md`，写入共享 contract 定义的 review canonical path。
- 返回 artifact path、hash、scope、round、verdict、layer status 和下一步 `speclite-code-review-02-evaluator`。
- 将结果交给 `handoffTarget`；人工模式直接交给 manual orchestrator 或用户，不要求 runner 存在。

## Notes（注意事项）

- 不设最低 finding 数；零 finding 在 scope complete 且 3/3 quorum 下合法。
- 不得把旧 completion gate 或历史测试数字表述为本轮实际执行。
- 不得对同一 `storyId + reviewSeries + round` 并发执行两次 reviewer。
- 始终使用中文输出，模型、命令和 evidence 来源必须如实记录。

## Generation Metadata（生成信息）

本 Skill 由 speclite-skill-creator 体系维护。如需修改，必须同步更新 `SKILL.md`、`SKILL.en.md`、`CHANGELOG.md`、`references/`、`assets/` 与实际安装副本。
