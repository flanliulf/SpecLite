---
name: speclite-code-review-06-finalizer
description: "在 current CR v2 evaluation 与 fresh completion gate 通过后 fail-closed 同步 Story 状态。用于用户要求 CR done、CR approved、mark done、关闭 Story 或 CR finalizer。核心能力：精确 verdict、scope/gate freshness、required tracker fail-closed 和写后重读一致性。"
allowed-tools: Read, Edit, Write, Bash, Grep, Glob
metadata:
  version: "2.1.1"
  author: "fancyliu"
  catalog: "speclite"
---

# Speclite Code Review 06 Finalizer（代码审查 Finalizer）

## Overview（概述）

只在 current CR v2、fresh completion gate 和所有 required trackers 一致时将 Story 收口为 done，并写入 durable `speclite.cr-finalizer.v2` report。支持 runner 与人工 fresh session，所有资格由 Finalizer 自身独立验证。

## Activation Boundary（激活边界）

- 用于验证最终 CR/gate/tracker eligibility 并执行最小 Story 状态同步。
- 不用于执行修复、补测试、登记 TODO、推断 prose approval、提交 Git 或自动关闭 Epic。

## Core Capabilities（核心能力）

- **精确资格判断**：只接受 current、精确绑定且可收口的 v2 verdict。
- **证据新鲜度**：独立重算 scope，并校验 completion gate 晚于最后 mutation/evaluation。
- **Tracker fail-closed**：required tracker 缺失、歧义或不可写时停止。
- **Fail-closed 收口**：准备统一 change set，按写前/写后 hash 协调写入，失败时逆序回退并输出 durable result。

## Contract（共享契约）

将当前 Skill 目录父目录解析为 `{skills-root}`，完整读取 `{skills-root}/speclite-code-review-contract/references/cr-contract.md`，再通过 `speclite resolve config --project-root {project-root}` 获取路径和 required tracker 配置。失败时 HALT；不得依赖 runner。

## Inputs（输入）

- Story identity、`reviewSeries` 和 current evaluation，或足够独立定位它的信息。
- `confirmationPolicy`、`authorizationSource`、`orchestrationMode` 与 `handoffTarget`；缺失 confirmation policy 时固定为 `explicit`，`preauthorized` 缺 `authorizationSource` 时 HALT。

## Workflow（工作流）

完整读取并执行 `references/finalizer-workflow.md`：

1. 独立解析 identity、current evaluation/review 和 current scope hash。
2. 验证 exact verdict、TODO mapping 和 fresh completion gate。
3. 验证 Story、sprint 与 configured required workflow trackers。
4. 准备 change set、fail-closed 协调写入、重读并写 finalizer report。

任何 binding、freshness、TODO mapping 或 required tracker 条件失败都必须 HALT。禁止使用“Approved”“通过”等 prose 字符串代替 enum。

## Outputs and Handoff（输出与交接）

- 使用 `assets/output-template.md`，写入共享 contract 定义的 finalizer canonical path。
- 返回 report path/hash、evaluation/gate binding、tracker writes/reread 和 `DONE | HALTED`。
- partial write 必须为 `HALTED` 并列出恢复动作；人工模式直接把 durable result 交给 manual orchestrator 或用户。

## Notes（注意事项）

- 状态只允许从 current review/in-progress 前进到 done；已 done 时先重验全部 evidence，再幂等返回。
- required tracker 缺失和 stale gate 都是 blocker，不是 warning。
- Epic 状态只提示运行 epic-completion gate；未经用户授权不更新。
- 本 Skill 不执行 commit/push，始终使用中文输出并列出精确写入文件。

## Generation Metadata（生成信息）

本 Skill 由 speclite-skill-creator 体系维护。如需修改，必须同步更新 `SKILL.md`、`SKILL.en.md`、`CHANGELOG.md`、`references/`、`assets/` 与实际安装副本。
