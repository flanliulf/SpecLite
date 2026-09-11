---
name: speclite-code-review-04-rules-extractor
description: "从历史 CR review、evaluation 与 fix 记录中提炼可复用开发规则。用于用户要求 extract CR rules、CR summary、代码审查经验总结或提取最佳实践。核心能力：分析多轮记录、识别重复问题、提出 project-context.md 等文档更新建议。"
allowed-tools: Read, Write, Grep, Glob
metadata:
  version: "2.1.0"
  author: "fancyliu"
  catalog: "speclite"
---

# Speclite Code Review 04 Rules Extractor（代码审查规则提炼）

## Overview（概述）

从 evaluator 接受且有证据的 v2 CR 历史中提炼 candidate rules，并写入 durable `speclite.cr-rules-extraction.v2` report。支持 runner 和人工 fresh session，不依赖聊天上下文证明完成。

## Activation Boundary（激活边界）

- 用于分析一个 Story/current series 的 CR 历史、提炼候选规则并评估全局推广资格。
- 默认不修改全局文档；只有用户另行明确授权具体目标文件后才能应用建议。
- 不用于重新裁决 finding、执行修复、登记 TODO 或推进 Story 状态。

## Core Capabilities（核心能力）

- **CR 历史分析**：读取 Story 的 review、evaluation 与 fix 记录。
- **v2 证据过滤**：只消费 evaluator accepted、非 dismissed/superseded 且有验证 evidence 的 finding。
- **跨 Story 推广门禁**：至少跨两个 Story 复现或获得用户明确批准。
- **共性模式识别**：按 invariant/fingerprint family 识别重复问题与修复引入问题。
- **规则提炼**：转化为规避指南、指导原则、最佳实践或豁免说明。
- **全局文档建议**：定位适合的 project context、architecture 或开发指南章节。
- **Durable 输出**：写入可由下一 fresh session 校验的结构化 report。

## Contract（共享契约）

将当前 Skill 目录父目录解析为 `{skills-root}`，完整读取 `{skills-root}/speclite-code-review-contract/references/cr-contract.md`，再通过 `speclite resolve config --project-root {project-root}` 获取路径。CR 目录只消费 runner 或人工 orchestrator 通过 `speclite resolve cr-directory` 传入的 `crDir`，不重推导。失败时 HALT；不得依赖 runner 或旧 artifact。

## Inputs（输入）

- Story identity、`reviewSeries` 和 current evaluation，或足够独立定位它的信息。
- `orchestrationMode` 与 `handoffTarget`；缺失时按人工 standalone 调用处理。

## Workflow（工作流）

完整读取并执行 `references/rules-extractor-workflow.md`：收集 eligible CR records、分析 model/finding timeline、提炼 candidate rules、判断 global eligibility，并使用 `assets/output-template.md` 写入 durable report。

找不到有效 current v2 evaluation、证据不满足资格或 artifact identity/hash 不一致时，写 `result: HALTED` 并停止；不得用 legacy/superseded finding 推广全局规则。

## Outputs and Handoff（输出与交接）

- 写入共享 contract 定义的 rules extraction canonical path，schema 为 `speclite.cr-rules-extraction.v2`。
- 返回 report path/hash、eligible/excluded findings、candidate/global counts 和 `COMPLETED | HALTED`。
- 将 durable result 交给 `handoffTarget`；人工模式可据此在下一 fresh session 独立进入 CR05。

## Notes（注意事项）

- 规则必须具体、可操作并标注适用范围，不能把当前 Story 特例泛化。
- Correct Course superseded finding 只保留迁移后的根 invariant，不按轮次放大置信度。
- 未经用户明确授权，不读取或修改目标项目范围之外的全局文档。
- 始终使用中文输出，模型与 evidence 来源必须真实。

## Generation Metadata（生成信息）

本 Skill 由 speclite-skill-creator 体系维护。如需修改，必须同步更新 `SKILL.md`、`SKILL.en.md`、`CHANGELOG.md`、`references/`、`assets/` 与实际安装副本。
