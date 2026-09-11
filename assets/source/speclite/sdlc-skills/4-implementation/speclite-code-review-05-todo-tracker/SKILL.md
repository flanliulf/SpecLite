---
name: speclite-code-review-05-todo-tracker
description: "管理 CR TODO backlog，记录、检查、解决和列出延期改进项。用于用户要求 CR TODO、add TODO、resolve TODO、CR backlog、查看待办或批量提取 TODO。核心能力：维护待办状态、关联审查来源、输出可跟踪清单。"
allowed-tools: Read, Write, Glob, Grep, Edit
metadata:
  version: "2.1.1"
  author: "fancyliu"
  catalog: "speclite"
---

# Speclite Code Review 05 TODO Tracker（代码审查 TODO 追踪）

## Overview（概述）

管理 `{implementation_artifacts}/cr-rules/cr-todo-backlog.md` 中 evaluator 接受的非阻塞延期项，并为 Story closeout 写入 durable `speclite.cr-todo-result.v2`。支持 runner 与人工 standalone 调用，不直接修改源码。

## Activation Boundary（激活边界）

- Story closeout：把 current evaluation 的 deferred fingerprints 映射到 backlog，并产生 durable result。
- Backlog utility：按用户要求 check、resolve、list 或 extract；这些操作不得反向改变原 evaluation verdict。
- 不用于记录 P0/P1、`VERIFY_REQUIRED`、dismissed 或 superseded finding。

## Core Capabilities（核心能力）

- **添加条目**：从 current evaluation 提取并确认非阻塞延期项。
- **检查条目**：按 Story 文件或用户指定路径匹配 open/in-progress 项。
- **标记解决**：更新状态、解决 Story 和 commit/PR evidence。
- **查看摘要**：按 T1/T2/T3 展示 backlog 和统计。
- **批量提取**：跨指定 Story 的 eligible evaluations 去重 deferred fingerprints。

## Contract（共享契约）

将当前 Skill 目录父目录解析为 `{skills-root}`，完整读取 `{skills-root}/speclite-code-review-contract/references/cr-contract.md`，再通过 `speclite resolve config --project-root {project-root}` 获取路径。CR 目录只消费 runner 或人工 orchestrator 通过 `speclite resolve cr-directory` 传入的 `crDir`，不重推导。失败时 HALT；不得依赖 runner。

## Inputs（输入）

- `crDir`、`compatibilityMode` 与 `legacyArtifactPaths`：由 runner 或人工 orchestrator 通过 `speclite resolve cr-directory` 解析后传入；缺失时自行调用该 CLI 一次，不得以其他方式推导。
- `mode=closeout | add | check | resolve | list | extract`，以及该 mode 所需的 Story/TODO identity。`closeout` 为 Story 收口专用，只读 `list`/`check` 默认不写 durable result。
- `confirmationPolicy: explicit | preauthorized`；缺失时固定为 `explicit`。
- `authorizationSource`、`orchestrationMode` 与 `handoffTarget`；`preauthorized` 时 authorization source 必填。

## Workflow（工作流）

完整读取并执行 `references/todo-tracker-workflow.md`，使用 `assets/output-template.md` 维护 backlog 和生成结果。

Story closeout 只读取 current `speclite.cr-evaluation.v2`，排除 P0/P1、`VERIFY_REQUIRED`、dismissed、superseded 和无 fingerprint 项。`preauthorized` 可来自 runner goal record、人工 orchestrator record 或当前用户明确授权；不得要求 runner 存在。

## Outputs and Handoff（输出与交接）

- backlog mutation 必须写后重读并验证编号、fingerprint mapping、status 和统计一致。
- Story closeout 写入共享 contract 定义的 `speclite.cr-todo-result.v2` canonical report；project utility 返回同 schema 的结构化结果，并按 workflow reference 的 utility path 保存。
- 返回 result path/hash、mapped fingerprints、backlog hash 和 `COMPLETED | HALTED` 给 `handoffTarget`。

## Notes（注意事项）

- T1/T2/T3 都是当前非阻塞 urgency；不得复用 CR P1/P2/P3。
- T1 表示下次触及前处理，但不反向改变原 CR verdict。
- 编号永不复用，文件路径使用项目相对路径。
- 始终使用中文输出，不自动修改代码。

## Generation Metadata（生成信息）

本 Skill 由 speclite-skill-creator 体系维护。如需修改，必须同步更新 `SKILL.md`、`SKILL.en.md`、`CHANGELOG.md`、`references/`、`assets/` 与实际安装副本。
